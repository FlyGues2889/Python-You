// useEditorTabs.ts —— 编辑器标签会话（HANDOFF 提示词 6 批次 2）：
// openTabs / 活动标签 / 会话保存与恢复 / 未保存确认与保存冲突 / 光标记忆。
// 从 App.vue 搬出；文件树回调、工作区 watcher、教程载入缓冲三组调用点改走本 composable
// 提供的原子操作（closeTabForFileId / renameTabForFile / refreshTabContent），不再直接改标签状态。
// 依赖注入用惰性箭头（App 侧把引用延后到调用时解引用，避免 setup 期 TDZ）。
import { computed, ref, watch } from 'vue';
import type { EditorTab, FSItem } from '../types';
import { absPath, nativeApi } from '../utils/native';
import { safeStorage } from '../utils/storage';
import { t } from '../utils/i18n';

const SESSION_KEY = 'python_you_session';

export interface EditorTabsDeps {
  getWorkspaceItems: () => FSItem[];
  getWorkspaceRoot: () => string | null;
  findItemById: (items: FSItem[], id: string) => FSItem | null;
  findFileByPath: (items: FSItem[], path: string) => FSItem | null;
  findOrLoadFileByPath: (items: FSItem[], path: string, root: string) => Promise<FSItem | null>;
  ensureFileContent: (file: FSItem, force?: boolean) => Promise<void>;
  writeDiskFile: (item: FSItem, abs: string, content: string) => Promise<void>;
  showToast: (msg: string) => void;
  setActiveNavTab: (v: string) => void;
}

export function useEditorTabs(deps: EditorTabsDeps) {
  const openTabs = ref<EditorTab[]>([]);
  const activeEditorTabId = ref<string | null>(null);
  // 光标记忆：按路径记录最近一次编辑光标位置，会话恢复时回填（NFR 会话连续性）
  const sessionCursors = ref<Record<string, { line: number; col: number }>>({});
  // Unsaved changes confirmation state
  const unsavedDialogState = ref<{
    isOpen: boolean;
    tabId: string | null;
    tabName: string;
  }>({
    isOpen: false,
    tabId: null,
    tabName: ''
  });
  // NFR-5.4：保存前比对 mtime，磁盘被外部修改时挂起保存等用户确认，不静默覆盖
  const conflictState = ref<{ tabId: string; name: string } | null>(null);

  const activeTabObject = computed(
    () => openTabs.value.find((t) => t.id === activeEditorTabId.value) || null
  );

  // ---- 会话保存与恢复：上次关闭时打开的标签页 + 光标位置 ----
  const saveSession = () => {
    try {
      safeStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          tabs: openTabs.value.map((t) => t.path),
          active: activeTabObject.value?.path || null,
          cursors: sessionCursors.value
        })
      );
    } catch (e) { /* 存储不可用（隐私模式等）时静默跳过 */ }
  };

  const handleCursorChange = (payload: { path: string; line: number; col: number }) => {
    if (!payload?.path) return;
    sessionCursors.value[payload.path] = { line: payload.line, col: payload.col };
    saveSession();
  };

  // 重新打开上次会话的标签页，并恢复活动标签与光标
  const restoreSession = async () => {
    try {
      const raw = safeStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (session.cursors) {
        sessionCursors.value = session.cursors;
      }
      if (Array.isArray(session.tabs) && session.tabs.length > 0) {
        const root = deps.getWorkspaceRoot();
        const files: FSItem[] = [];
        for (const p of session.tabs as string[]) {
          const f = root
            ? await deps.findOrLoadFileByPath(deps.getWorkspaceItems(), p, root)
            : deps.findFileByPath(deps.getWorkspaceItems(), p);
          if (f) files.push(f);
        }
        openTabs.value = [];
        // 并行读取文件内容，避免串行 IPC 拖慢启动
        await Promise.all(files.map((f) => deps.ensureFileContent(f)));
        for (const f of files) {
          openFileInTab(f);
        }
        if (session.active) {
          const activeTab = openTabs.value.find((t) => t.path === session.active);
          if (activeTab) activeEditorTabId.value = activeTab.id;
        }
      }
    } catch (e) { /* 会话数据损坏时按无会话处理 */ }
  };

  // ---- 打开 / 选择 / 关闭 / 保存 ----
  function openFileInTab(file: FSItem) {
    const existing = openTabs.value.find((t) => t.fileId === file.id);
    if (existing) {
      activeEditorTabId.value = existing.id;
    } else {
      const newTab: EditorTab = {
        id: `tab-${file.id}`,
        fileId: file.id,
        name: file.name,
        path: file.path,
        content: file.content || '',
        savedContent: file.content || '',
        isDirty: false,
        language: file.name.endsWith('.py') ? 'python' : 'plaintext'
      };
      openTabs.value.push(newTab);
      activeEditorTabId.value = newTab.id;
    }
    deps.setActiveNavTab('explorer');
  }

  const handleSelectTab = (tabId: string) => {
    activeEditorTabId.value = tabId;
  };

  const handleCloseTab = (tabId: string) => {
    const tab = openTabs.value.find((t) => t.id === tabId);
    if (!tab) return;

    if (tab.isDirty) {
      unsavedDialogState.value = {
        isOpen: true,
        tabId: tab.id,
        tabName: tab.name
      };
    } else {
      forceCloseTab(tabId);
    }
  };

  const forceCloseTab = (tabId: string) => {
    const index = openTabs.value.findIndex((t) => t.id === tabId);
    if (index !== -1) {
      openTabs.value.splice(index, 1);
      if (activeEditorTabId.value === tabId) {
        activeEditorTabId.value = openTabs.value.length > 0
          ? openTabs.value[Math.max(0, index - 1)].id
          : null;
      }
    }
  };

  const handleUnsavedSave = async () => {
    const tabId = unsavedDialogState.value.tabId;
    unsavedDialogState.value.isOpen = false;
    if (!tabId) return;
    await handleSaveTab(tabId);
    // 出现保存冲突时保持标签页打开，交给冲突对话框决定
    if (!conflictState.value) forceCloseTab(tabId);
  };

  const handleUnsavedDontSave = () => {
    if (unsavedDialogState.value.tabId) {
      forceCloseTab(unsavedDialogState.value.tabId);
    }
    unsavedDialogState.value.isOpen = false;
  };

  const handleUnsavedCancel = () => {
    unsavedDialogState.value.isOpen = false;
  };

  const handleContentChange = (tabId: string, newContent: string) => {
    const tab = openTabs.value.find((t) => t.id === tabId);
    if (tab) {
      tab.content = newContent;
      tab.isDirty = tab.content !== tab.savedContent;
    }
  };

  const commitSave = async (tab: EditorTab) => {
    tab.savedContent = tab.content;
    tab.isDirty = false;

    // Only update workspace file item content on explicit save
    const file = deps.findItemById(deps.getWorkspaceItems(), tab.fileId);
    if (file) {
      file.content = tab.content;
    }
    // 原生工作区：同时写回磁盘
    if (deps.getWorkspaceRoot()) {
      const abs = absPath(deps.getWorkspaceRoot()!, tab.path);
      if (file) await deps.writeDiskFile(file, abs, tab.content);
      else nativeApi.writeFile(abs, tab.content).catch(() => { /* 写盘失败保持内存态 */ });
    }
    deps.showToast(t('toastFileSaved').replace('{name}', tab.name));
  };

  const handleSaveTab = async (tabId: string) => {
    const tab = openTabs.value.find((t) => t.id === tabId);
    if (!tab) return;
    const file = deps.findItemById(deps.getWorkspaceItems(), tab.fileId);
    if (deps.getWorkspaceRoot() && file?.mtime !== undefined) {
      const abs = absPath(deps.getWorkspaceRoot()!, tab.path);
      try {
        const current = await nativeApi.statMtime(abs);
        if (current !== file.mtime) {
          conflictState.value = { tabId, name: tab.name };
          return;
        }
      } catch (e) { /* 文件已不存在等情况按正常保存处理 */ }
    }
    await commitSave(tab);
  };

  const handleConflictOverwrite = async () => {
    const pending = conflictState.value;
    conflictState.value = null;
    if (!pending) return;
    const tab = openTabs.value.find((t) => t.id === pending.tabId);
    if (tab) await commitSave(tab);
  };

  const handleConflictCancel = () => {
    conflictState.value = null;
  };

  // ---- 三组调用点的原子操作（避免文件树 / watcher / 教程缓冲直接改标签状态） ----

  /** 按文件 id 关闭标签（删除文件用）：活动标签被关时回退到第一个剩余标签 */
  const closeTabForFileId = (fileId: string) => {
    const remaining = openTabs.value.filter((t) => t.fileId !== fileId);
    openTabs.value = remaining;
    if (activeEditorTabId.value === `tab-${fileId}`) {
      activeEditorTabId.value = remaining.length > 0 ? remaining[0].id : null;
    }
  };

  /** 清空全部标签（切换工作区时），活动标签同步失效 */
  const resetTabs = () => {
    openTabs.value = [];
    activeEditorTabId.value = null;
  };

  /** 重命名文件后同步标签的 name / path（item.path 已由调用方更新） */
  const renameTabForFile = (item: FSItem, newName: string) => {
    const tab = openTabs.value.find((t) => t.fileId === item.id);
    if (tab) {
      tab.name = newName;
      tab.path = item.path;
    }
  };

  /** 文件内容回读/覆写后同步标签：有未保存修改时保留用户内容（写盘前仍会走冲突检测）；
   *  force = true 强制覆盖（教程新题载入：不保留旧作答） */
  const refreshTabContent = (file: FSItem, content: string, force = false) => {
    const tab = openTabs.value.find((t) => t.fileId === file.id);
    if (tab && (!tab.isDirty || force)) {
      tab.content = content;
      tab.savedContent = content;
      if (force) tab.isDirty = false;
    }
  };

  // 标签页与活动标签变化时保存会话
  watch(openTabs, saveSession, { deep: true });
  watch(activeEditorTabId, saveSession);

  return {
    openTabs,
    activeEditorTabId,
    sessionCursors,
    unsavedDialogState,
    conflictState,
    activeTabObject,
    saveSession,
    handleCursorChange,
    restoreSession,
    openFileInTab,
    handleSelectTab,
    handleCloseTab,
    forceCloseTab,
    handleUnsavedSave,
    handleUnsavedDontSave,
    handleUnsavedCancel,
    handleContentChange,
    commitSave,
    handleSaveTab,
    handleConflictOverwrite,
    handleConflictCancel,
    closeTabForFileId,
    resetTabs,
    renameTabForFile,
    refreshTabContent,
  };
}
