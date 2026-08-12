<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { FSItem, EditorTab, ConsoleOutput, AppConfig } from './types';
import { DEFAULT_WORKSPACE_ITEMS } from './utils/defaultWorkspace';
import { pythonRunner } from './utils/pythonRunner';
import { useI18n } from './utils/i18n';
import FileTree from './components/FileTree.vue';
import CodeEditor from './components/CodeEditor.vue';
import TerminalPanel from './components/TerminalPanel.vue';
import REPLConsole from './components/REPLConsole.vue';
import PackageManager from './components/PackageManager.vue';
import TutorialView from './components/tutor/TutorialView.vue';
import SettingsView from './components/SettingsView.vue';
import MD3LoadingModal from './components/selfComponents/loadingModal.vue';
import { minimizeWindow, maximizeWindow, closeWindow } from './utils/tauriWindow';
import ContextMenu from './components/ContextMenu.vue';
import { safeStorage } from './utils/storage';
import { nativeApi, fsEntriesToFSItems, absPath } from './utils/native';
import { nativePython } from './utils/nativePython';
import { copyToClipboard } from './utils/clipboard';
import { revealItemInDir, openPath } from '@tauri-apps/plugin-opener';

import { syncWorkspacePackages } from './utils/packageUtils';
import { uid } from './utils/id';
import { resolveCodeTheme } from './utils/theme';
import { setQuizQuestionResult, syncQuizCompletion, getQuizQuestionResult } from './components/tutor/quizData';

const { t, tf } = useI18n();

// Component refs
const codeEditorRef = ref<any>(null);
const fileTreeRef = ref<any>(null);
const openFileInputRef = ref<HTMLInputElement | null>(null);
const openFolderInputRef = ref<HTMLInputElement | null>(null);

// 工作区栏(外层 split 的 start 面板)折叠——临界阻尼模型:
// 0–220px 为死区,面板不允许停留其中。临界处复刻 m3e-split-pane 内建的 overshoot 阻尼
// (与终端手柄一致的手感,overshootLimit=4):拖过临界时面板被压缩在锚点附近,拖得越远
// 阻力越重;越过临界后继续拖过一段距离(180px)且至少按住 250ms 即切换状态,无需松手:
// - 展开态拖过 220px 临界继续左拉 → 阻尼 → 再拖 180px → 折叠到 0
// - 折叠态(0px)继续右拉 → 阻尼 → 再拖 180px → 展开到 220px
// 时间门控保证快速拖动时面板也在临界处被按住可感知的时间,而非瞬间跳变切换
// 切换后拖动继续生效(折叠后右拉可再次展开,展开后左拉可再次折叠),当前状态由
// workspaceCollapsed 记录——不能用 value 判断,阻尼期间的压缩值会污染状态判定。
// 不用组件 min/max(其松手 snap 有 250ms 回弹动画会延迟切换):直接覆写 el.value 模拟压缩,
// input 事件在每个 mousemove 内同步触发,覆写在 paint 前完成 → 无中间态、无过渡动画。
// 文件树最小展开宽度(px):面板低于该宽度进入死区(阻尼区)
const WORKSPACE_MIN_EXPAND_PX = 220;
// 手柄容器实际宽度 8px(m3eStyle.css 全局覆盖,m3e 默认 24px),flex-basis 减半 4px
const WORKSPACE_HANDLE_HALF = 4;
// 阻尼压缩上限(px),与组件 overshootLimit 默认 4(%)的手感一致
const WORKSPACE_OVERSHOOT_LIMIT_PX = 4;
// 越过临界后继续拖动超过此距离(px)立即切换折叠/展开状态。
// 阈值即阻尼区间的长度:180px 几乎覆盖整个 220px 死区,面板在临界处被钉住,
// 手指需持续拖过 180px(慢速拖约 0.6s)才会触发切换——阻尼感持续最久
const WORKSPACE_DRAG_SWITCH_PX = 180;
// 进入死区后至少保持该时长(ms)的阻尼才允许切换:快速拖动时帧间距离大,
// 距离阈值 1~2 帧即达标,面板只"卡住"几十毫秒感知不到;时间门控保证
// 面板在临界处被按住的时间可感知(慢速拖动距离先达标时时间早已满足,不受影响)
const WORKSPACE_DRAG_MIN_HOLD_MS = 250;
// 受控值:拖拽/折叠/展开后的真实 value(替换原写死的 :value="20",避免 Vue 重渲染重置面板)
const workspaceSplitValue = ref(20);
// 当前折叠状态(阻尼压缩值 >0 会污染 value 判定,须单独记录)
let workspaceCollapsed = false;
// 本次拖拽进入死区时的面板宽度起点(px):阻尼距离从该点起算,负值表示未进入死区
let workspaceCollapsedEntryPx = -1;
let workspaceExpandedEntryPx = -1;
// 本次进入死区的时间戳(ms):距离达标后还需经过最小保持时长才能切换
let workspaceDeadzoneEnteredAt = 0;

const onWorkspaceSplitPointerDown = (e: Event) => {
  const el = e.currentTarget as HTMLElement & { value: number };
  workspaceCollapsed = (Number(el.value) || 0) <= 0;
  workspaceCollapsedEntryPx = -1;
  workspaceExpandedEntryPx = -1;
};

const handleWorkspaceSplitInput = (e: Event) => {
  const el = e.currentTarget as HTMLElement & { value: number };
  const hostWidth = el.clientWidth;
  if (hostWidth <= 0) return;
  const raw = Number(el.value) || 0;
  const panePx = (raw / 100) * hostWidth - WORKSPACE_HANDLE_HALF;
  let value = raw;
  if (workspaceCollapsed) {
    // 折叠态:右拉进入死区 → 阻尼锚 0;越过临界继续拉过阈值 → 立即展开
    if (panePx > 0) {
      if (workspaceCollapsedEntryPx < 0) {
        workspaceCollapsedEntryPx = panePx;
        workspaceDeadzoneEnteredAt = Date.now();
      }
      if (
        panePx - workspaceCollapsedEntryPx >= WORKSPACE_DRAG_SWITCH_PX &&
        Date.now() - workspaceDeadzoneEnteredAt >= WORKSPACE_DRAG_MIN_HOLD_MS
      ) {
        // 切换时两个距离起点全部重置:否则旧起点会让切换后下一帧立即再次触发(抽搐)
        workspaceCollapsed = false;
        workspaceCollapsedEntryPx = -1;
        workspaceExpandedEntryPx = -1;
        value = ((WORKSPACE_MIN_EXPAND_PX + WORKSPACE_HANDLE_HALF) / hostWidth) * 100;
      } else {
        const compressed =
          (WORKSPACE_OVERSHOOT_LIMIT_PX * panePx) / (panePx + WORKSPACE_OVERSHOOT_LIMIT_PX);
        value = ((compressed + WORKSPACE_HANDLE_HALF) / hostWidth) * 100;
      }
    } else {
      // 拖回 0 或以下:贴 0,重置右拉距离起点
      workspaceCollapsedEntryPx = -1;
      value = 0;
    }
  } else if (panePx < WORKSPACE_MIN_EXPAND_PX) {
    // 展开态:左拉过 220px 临界 → 阻尼锚 220;越过临界继续拉过阈值 → 立即折叠
    if (workspaceExpandedEntryPx < 0) {
      workspaceExpandedEntryPx = panePx;
      workspaceDeadzoneEnteredAt = Date.now();
    }
    if (
      workspaceExpandedEntryPx - panePx >= WORKSPACE_DRAG_SWITCH_PX &&
      Date.now() - workspaceDeadzoneEnteredAt >= WORKSPACE_DRAG_MIN_HOLD_MS
    ) {
      // 切换时两个距离起点全部重置:否则旧起点会让切换后下一帧立即再次触发(抽搐)
      workspaceCollapsed = true;
      workspaceCollapsedEntryPx = -1;
      workspaceExpandedEntryPx = -1;
      value = 0;
    } else {
      const overshoot = WORKSPACE_MIN_EXPAND_PX - panePx;
      const compressed =
        (WORKSPACE_OVERSHOOT_LIMIT_PX * overshoot) / (overshoot + WORKSPACE_OVERSHOOT_LIMIT_PX);
      value = ((WORKSPACE_MIN_EXPAND_PX - compressed + WORKSPACE_HANDLE_HALF) / hostWidth) * 100;
    }
  } else {
    // 拖回 220px 以上:自由区,重置左拉距离起点
    workspaceExpandedEntryPx = -1;
  }
  if (value !== raw) {
    // 覆写组件值 → 面板被阻尼压缩在锚点附近(与组件内建 overshoot 视觉一致)
    el.value = value;
  }
  workspaceSplitValue.value = value;
};

// 终端面板采用"固定像素高度"模型：窗口高度改变时终端保持像素高度不变
// （窗口最矮时终端多高，调高窗口后仍保持该高度），而不是按 25% 比例放大
// 露出更多内容。仅用户拖拽手柄会改变终端像素高度（下限 28px 最小高度）。
// split-pane 拖拽时内部 value 变化并派发 input 事件——必须受控绑定（@input 同步到
// innerSplitValue），否则窗口高度改变导致 Vue 重渲染时，组件 value 会被强制重置回 75。
const innerSplitPaneRef = ref<HTMLElement | null>(null);
const innerSplitMax = ref(100);
const innerSplitValue = ref(75);
let innerSplitResizeObserver: ResizeObserver | null = null;
// 终端面板的固定像素高度：null 表示尚未初始化（首次用当前 25% 比例记录）
let terminalHeightPx: number | null = null;

// 拖拽/键盘调整时同步内部值，并记录新的终端像素高度作为后续保持的基准
const onInnerSplitInput = (e: Event) => {
  const v = Number((e.target as HTMLInputElement).value);
  if (Number.isNaN(v)) return;
  innerSplitValue.value = v;
  const el = innerSplitPaneRef.value;
  const h = el?.clientHeight || 0;
  if (h > 0) {
    // end 面板像素高度 = (100 - v)% × h - 4（手柄半宽），下限 28px
    terminalHeightPx = Math.max(28, ((100 - v) / 100) * (h - 4));
  }
};

const updateInnerSplitMax = () => {
  const el = innerSplitPaneRef.value;
  if (!el) return;
  const h = el.clientHeight;
  if (h <= 0) return;
  // end 面板可用高度 = h - 4（手柄半宽）；拖拽上限保证终端 ≥ 28px 最小高度
  const available = Math.max(0, h - 4);
  innerSplitMax.value = Math.max(0, Math.min(100, ((available - 28) / h) * 100));
  // 首次运行：以当前面板比例（初始 25%）记录终端像素高度
  if (terminalHeightPx === null) {
    terminalHeightPx = Math.max(28, ((100 - innerSplitValue.value) / 100) * available);
  }
  // 窗口高度改变：终端保持固定像素高度（最小 28px；窗口过矮放不下时占满可用高度）
  const px = Math.min(terminalHeightPx, available);
  innerSplitValue.value = Math.max(0, Math.min(100, ((available - px) / h) * 100));
};

const attachInnerSplitResizeObserver = () => {
  const el = innerSplitPaneRef.value;
  if (!el || innerSplitResizeObserver) return;
  innerSplitResizeObserver = new ResizeObserver(updateInnerSplitMax);
  innerSplitResizeObserver.observe(el);
  updateInnerSplitMax();
};

// 初始挂载后确保观察器就位（activeNavTab 的切换监听放在其声明之后）
onMounted(attachInnerSplitResizeObserver);

// Context menu state
const contextMenuState = ref<{
  visible: boolean;
  x: number;
  y: number;
  type: 'editor' | 'terminal' | 'filetree' | 'tutorial' | 'general';
  targetItem: FSItem | null;
  source: 'repl' | 'run' | null;
}>({
  visible: false,
  x: 0,
  y: 0,
  type: 'editor',
  targetItem: null,
  source: null
});

const openContextMenu = (
  e: MouseEvent,
  type: 'editor' | 'terminal' | 'filetree' | 'tutorial' | 'general',
  item: FSItem | null = null,
  source: 'repl' | 'run' | null = null
) => {
  e.preventDefault();
  e.stopPropagation();
  closeMenus();
  contextMenuState.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    type,
    targetItem: item,
    source
  };
};

const handleContextMenuCopy = async () => {
  const type = contextMenuState.value.type;
  // 终端：复制该终端输出区的全部内容（REPL 或脚本运行终端）
  if (type === 'terminal') {
    const logs =
      contextMenuState.value.source === 'repl' ? replLogs.value : consoleOutputs.value;
    const text = logs.map((l) => l.text).join('\n').trim();
    if (!text) {
      showToast(t('toastNoTerminalOutput'));
      return;
    }
    const ok = await copyToClipboard(text);
    showToast(ok ? t('toastCopiedTerminalInfo') : t('toastCopyFailed'));
    return;
  }
  // 教程正文：复制 DOM 选区中的文本
  if (type === 'tutorial') {
    const selected = (window.getSelection()?.toString() || '').trim();
    if (!selected) {
      showToast(t('toastSelectTutorialText'));
      return;
    }
    const ok = await copyToClipboard(selected);
    showToast(ok ? t('toastCopiedSelection') : t('toastCopyFailed'));
    return;
  }
  // 编辑器：复制 textarea 选区
  // copySelection 是 async 函数，必须 await —— 否则拿到 Promise（恒真），无选区时也会误报成功
  const ok = (await codeEditorRef.value?.copySelection?.()) ?? false;
  if (ok) {
    showToast(t('toastCopiedToClipboard'));
  } else {
    showToast(t('toastSelectEditorText'));
  }
};

const closeContextMenu = () => {
  contextMenuState.value.visible = false;
};

// 在系统文件资源管理器中打开/定位文件（文件选中、文件夹打开）
const handleRevealInExplorer = async (item: FSItem) => {
  if (!workspaceRootPath.value) {
    showToast(t('toastOpenWorkspaceFirst'));
    return;
  }
  const fullPath = absPath(workspaceRootPath.value, item.path);
  try {
    if (item.isFolder) {
      await openPath(fullPath);
    } else {
      await revealItemInDir(fullPath);
    }
  } catch (err: any) {
    showToast(t('toastRevealFailed') + (err?.message || err));
  }
};

// Delete confirmation dialog state
const isDeleteDialogOpen = ref(false);
const deleteTargetItem = ref<FSItem | null>(null);

const requestDeleteItem = (item: FSItem) => {
  deleteTargetItem.value = item;
  isDeleteDialogOpen.value = true;
};

// 关闭所有已打开的 m3e 菜单弹层（popover 菜单）
const closeOpenMenus = () => {
  document.querySelectorAll('m3e-menu').forEach((menu) => {
    const el = menu as HTMLElement & { hide?: () => void };
    if (el.matches(':popover-open')) el.hide?.();
  });
};

const closeMenus = () => {
  closeOpenMenus();
  // Delay restoring editor focus to avoid stealing focus from find/replace inputs
  setTimeout(() => {
    const active = document.activeElement;
    if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
      codeEditorRef.value?.focusEditor?.();
    }
  }, 60);
};

// 标题栏是 Tauri 拖拽区域：mousedown 会被窗口管理器截获，click 事件不会派发到 DOM，
// m3e 菜单自身的 document click 监听因此失效 → 必须在 mousedown 捕获阶段就关闭菜单。
// 菜单内部（选项、子菜单）和触发器交给 m3e 组件自己处理（切换/选择）。
const handleDocumentMousedown = (e: MouseEvent) => {
  const target = e.target as Element | null;
  if (!target) return;
  if (target.closest('m3e-menu, m3e-menu-trigger')) return;
  closeOpenMenus();
};

const handleMenuOpenFile = async () => {
  // Tauri 环境下用原生文件对话框导入单个文件
  if (nativeApi.available()) {
    const path = await nativeApi.pickFile();
    if (path) {
      try {
        const content = await nativeApi.readFile(path);
        const name = path.split(/[\\/]/).pop() || 'imported.py';
        const newFile: FSItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name,
          path: `/${name}`,
          isFolder: false,
          content,
          parentId: null
        };
        workspaceItems.value.push(newFile);
        showToast(t('toastImported'));
        openFileInTab(newFile);
      } catch (err: any) {
        showToast(t('toastImportFailed') + (err?.message || err));
      }
    }
    return;
  }
  openFileInputRef.value?.click();
};

const handleMenuOpenFolder = async () => {
  // Tauri 环境下打开本地真实文件夹作为工作区
  if (nativeApi.available()) {
    const path = await nativeApi.pickFolder();
    if (path) {
      await loadWorkspaceFromDisk(path);
    }
    return;
  }
  openFolderInputRef.value?.click();
};

// 从本地磁盘目录构建工作区（替换虚拟文件树）
const loadWorkspaceFromDisk = async (root: string) => {
  try {
    const entries = await nativeApi.readDirectory(root);
    // 先设置 root 再赋值树，避免深监听把整棵树写回 localStorage
    workspaceRootPath.value = root;
    pythonRunner.workspaceRoot = root;
    workspaceItems.value = fsEntriesToFSItems(entries);
    openTabs.value = [];
    activeEditorTabId.value = null;
    safeStorage.setItem('python_you_workspace_root', root);

    const mainFile = findFileByPath(workspaceItems.value, '/main.py');
    if (mainFile) {
      await ensureFileContent(mainFile);
      openFileInTab(mainFile);
    }
    showToast(t('toastWorkspaceOpened') + root);
  } catch (err: any) {
    showToast(t('toastWorkspaceOpenFailed') + (err?.message || err));
  }
};

const handleFileInputChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  handleImportFiles(files);
};

// App Initialization State
const isInitializing = ref(true);
const loadingStatus = ref(t('loadingStart'));

// Navigation State
const activeNavTab = ref<'explorer' | 'tutorial' | 'console' | 'packages' | 'settings'>('explorer');

// 内层 Split Pane 仅在 explorer 视图下渲染，切换到 explorer 时确保终端最小高度的观察器已就位
watch(
  () => activeNavTab.value,
  (v) => {
    if (v === 'explorer') attachInnerSplitResizeObserver();
  }
);
const sidebarExpanded = ref(false);

// App Config State
const config = ref<AppConfig>({
  themeMode: 'system',
  fontSize: 15,
  tabSize: 4,
  wordWrap: true,
  autoSave: true,
  showLineNumbers: true,
  codeTheme: 'github-dark',
  enableWheelZoom: true,
  autoPairQuotes: true,
  demoMode: false
});

// 已解析的代码主题：'system'（跟随系统主题）按外观主题映射为实际浅/深色主题
const resolvedCodeTheme = computed(() => resolveCodeTheme(config.value.codeTheme, config.value.themeMode));

// Toast message notifier
const toastMessage = ref<string | null>(null);
const showToast = (msg: string) => {
  toastMessage.value = msg;
  // 自动关闭由 m3e-snackbar 的 duration 计时控制
};

// 配置文件导出成功的提示：延长显示时长，并提供“打开文件夹”操作
const isExportToast = computed(() =>
  !!toastMessage.value && (
    toastMessage.value.includes('配置文件已成功导出') ||
    toastMessage.value.includes('successfully exported to path')
  )
);
const snackbarDuration = computed(() => (isExportToast.value ? 7000 : 5000));
const handleSnackbarToggle = (e: Event) => {
  if ((e as any).newState === 'closed') {
    toastMessage.value = null;
  }
};
const isOpeningFolder = ref(false);
const handleOpenExportFolder = () => {
  isOpeningFolder.value = true;
  setTimeout(() => {
    isOpeningFolder.value = false;
    toastMessage.value = null;
  }, 1000);
};


// Workspace File System & Editor Tabs State
const workspaceItems = ref<FSItem[]>([]);
const openTabs = ref<EditorTab[]>([]);
const activeEditorTabId = ref<string | null>(null);
const consoleOutputs = ref<ConsoleOutput[]>([]);
// REPL 交互终端会话记录：提升到 App 级，切换页面时保留；内存态，应用重启自动清空
const replLogs = ref<ConsoleOutput[]>([]);

// 本地工作区根目录（Tauri 原生文件系统模式），null 表示纯虚拟工作区
const workspaceRootPath = ref<string | null>(null);
const engineLabel = computed(() => nativePython.statusLabel.value);

// ---- 会话恢复：上次关闭时打开的标签页 + 光标位置 ----
const SESSION_KEY = 'python_you_session';
const sessionCursors = ref<Record<string, { line: number; col: number }>>({});

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
  } catch (e) { }
};

const handleCursorChange = (payload: { path: string; line: number; col: number }) => {
  if (!payload?.path) return;
  sessionCursors.value[payload.path] = { line: payload.line, col: payload.col };
  saveSession();
};

// 在（可能懒加载的）文件树中按路径查找文件；沿途未加载的文件夹从磁盘补载
const findOrLoadFileByPath = async (items: FSItem[], path: string, root: string): Promise<FSItem | null> => {
  for (const item of items) {
    if (item.path === path && !item.isFolder) return item;
    if (item.isFolder && (path.startsWith(item.path + '/') || path.startsWith(item.path + '\\'))) {
      if (item.children === undefined) {
        try {
          const entries = await nativeApi.readDirectory(absPath(root, item.path));
          item.children = fsEntriesToFSItems(entries, item.id, item.path);
        } catch (e) {
          item.children = [];
        }
      }
      const found = await findOrLoadFileByPath(item.children || [], path, root);
      if (found) return found;
    }
  }
  return null;
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
      const root = workspaceRootPath.value;
      const files: FSItem[] = [];
      for (const p of session.tabs as string[]) {
        const f = root ? await findOrLoadFileByPath(workspaceItems.value, p, root) : findFileByPath(workspaceItems.value, p);
        if (f) files.push(f);
      }
      openTabs.value = [];
      // 并行读取文件内容，避免串行 IPC 拖慢启动
      await Promise.all(files.map((f) => ensureFileContent(f)));
      for (const f of files) {
        openFileInTab(f);
      }
      if (session.active) {
        const activeTab = openTabs.value.find((t) => t.path === session.active);
        if (activeTab) activeEditorTabId.value = activeTab.id;
      }
    }
  } catch (e) { }
};

// Initialize Workspace from LocalStorage / 本地工作区
onMounted(async () => {
  // 检测本机 Python，用于引擎徽标展示（异步，不阻塞初始化）
  if (nativeApi.available()) {
    nativePython.detect();
  }

  // 恢复/初始化工作区：
  // - Tauri 环境：由 Rust 在应用数据目录确保 WorkSpace 示例工作区存在（首次启动才写入），
  //   再加载最近打开的工作区（或默认的 WorkSpace）。
  // - 纯浏览器：恢复 localStorage 中的虚拟工作区。
  const loadVirtualWorkspace = () => {
    const savedWorkspace = safeStorage.getItem('python_you_workspace');
    if (savedWorkspace) {
      try {
        workspaceItems.value = JSON.parse(savedWorkspace);
        return;
      } catch (e) { }
    }
    workspaceItems.value = DEFAULT_WORKSPACE_ITEMS;
  };

  const savedRoot = safeStorage.getItem('python_you_workspace_root');
  if (nativeApi.available()) {
    // 优先复用已保存的工作区根目录：直接读取，跳过文件夹创建，避免每次启动重复建目录
    let loadedFromDisk = false;
    if (savedRoot) {
      try {
        loadingStatus.value = t('loadingScanningWorkspace');
        const entries = await nativeApi.readDirectory(savedRoot);
        workspaceRootPath.value = savedRoot;
        pythonRunner.workspaceRoot = savedRoot;
        workspaceItems.value = fsEntriesToFSItems(entries);
        safeStorage.setItem('python_you_workspace_root', savedRoot);
        loadedFromDisk = true;
      } catch (e) {
        // 保存的根目录已失效，继续走首次创建流程
      }
    }
    if (!loadedFromDisk) {
      try {
        // 仅当文件夹不存在（或上次根目录失效）时才创建
        loadingStatus.value = t('loadingCreatingWorkspace');
        const defaultRoot = await nativeApi.ensureDefaultWorkspace();
        loadingStatus.value = t('loadingScanningWorkspace');
        const entries = await nativeApi.readDirectory(defaultRoot);
        workspaceRootPath.value = defaultRoot;
        pythonRunner.workspaceRoot = defaultRoot;
        workspaceItems.value = fsEntriesToFSItems(entries);
        safeStorage.setItem('python_you_workspace_root', defaultRoot);
      } catch (e) {
        // 磁盘工作区不可用，退回虚拟工作区
        loadVirtualWorkspace();
      }
    }
  } else {
    loadVirtualWorkspace();
  }

  const savedConfig = safeStorage.getItem('python_you_config');
  if (savedConfig) {
    try {
      config.value = { ...config.value, ...JSON.parse(savedConfig) };
    } catch (e) { }
  }

  // Open default main.py tab
  const mainFile = findFileByPath(workspaceItems.value, '/main.py');
  if (mainFile) {
    await ensureFileContent(mainFile);
    openFileInTab(mainFile);
  }

  // 恢复上次会话打开的标签页与光标位置
  loadingStatus.value = t('loadingRestoringSession');
  await restoreSession();

  // Update theme mode
  updateTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

  // 关闭/刷新前确保会话（标签页 + 光标）落盘
  window.addEventListener('beforeunload', saveSession);

  // Initialize in Presentation / Demo Mode instantly
  consoleOutputs.value.push({
    id: uid(),
    type: 'system',
    text: '[INFO] Python You Presentation Engine Ready (Demo Mode Active)',
    timestamp: new Date().toLocaleTimeString()
  });
  isInitializing.value = false;
});

// Sync Workspace to LocalStorage
watch(workspaceItems, (newVal) => {
  // 原生模式磁盘即真相，无需把整棵树写回 localStorage——
  // 否则每次懒加载/读取文件内容都会触发深监听，同步序列化大工作区会阻塞主线程拖慢启动。
  if (!workspaceRootPath.value) {
    safeStorage.setItem('python_you_workspace', JSON.stringify(newVal));
  }
}, { deep: true });

watch(config, (newVal) => {
  safeStorage.setItem('python_you_config', JSON.stringify(newVal));
  updateTheme();
}, { deep: true });

// 工具栏字号加减：更新 config.fontSize，由上方 deep watch 自动持久化；范围 10-24px
const changeFontSize = (delta: number) => {
  const cur = config.value.fontSize || 15;
  config.value.fontSize = Math.min(24, Math.max(10, cur + delta));
};

// 使用帮助弹窗
const isHelpOpen = ref(false);

// 会话：标签页与活动标签变化时保存
watch(openTabs, saveSession, { deep: true });
watch(activeEditorTabId, saveSession);

// Theme handling
const updateTheme = () => {
  const root = window.document.documentElement;
  const isDark =
    config.value.themeMode === 'dark' ||
    (config.value.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// File Navigation & Helpers
function findFileByPath(items: FSItem[], path: string): FSItem | null {
  for (const item of items) {
    if (item.path === path && !item.isFolder) return item;
    if (item.isFolder && item.children) {
      const found = findFileByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
}

// 按需加载文件内容（目录扫描时不预读，打开/运行/下载时才从磁盘读取）
const ensureFileContent = async (file: FSItem): Promise<void> => {
  if (!workspaceRootPath.value || file.isFolder) return;
  if (file.content && file.content.length > 0) return;
  try {
    const content = await nativeApi.readFile(absPath(workspaceRootPath.value, file.path));
    file.content = content;
    // 若该文件已有打开的标签页，同步其内容
    const tab = openTabs.value.find((t) => t.fileId === file.id);
    if (tab) {
      tab.content = content;
      tab.savedContent = content;
      tab.isDirty = false;
    }
  } catch (e) { }
};

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
  activeNavTab.value = 'explorer';
}

const handleSelectFile = async (file: FSItem) => {
  // 手动从文件树打开文件 = 离开教程流程：清除教程来源，
  // 否则「检查答案/返回教程」按钮会一直出现在之后打开的 tutorial_demo.py 上
  activeTutorialSource.value = null;
  await ensureFileContent(file);
  openFileInTab(file);
};

const handleToggleFolder = async (item: FSItem) => {
  // 原生工作区：展开文件夹时按需从磁盘读取子目录（懒加载，避免启动时全量递归扫描）
  if (item.isFolder && !item.isOpen && workspaceRootPath.value && item.children === undefined) {
    try {
      const entries = await nativeApi.readDirectory(absPath(workspaceRootPath.value, item.path));
      item.children = fsEntriesToFSItems(entries, item.id, item.path);
    } catch (e) {
      item.children = [];
    }
  }
  item.isOpen = !item.isOpen;
};

// Create New File
const handleCreateFile = (parentId: string | null, name: string) => {
  const newFile: FSItem = {
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    path: parentId ? `${getParentPath(parentId)}/${name}` : `/${name}`,
    isFolder: false,
    content: `# ${name}\n\ndef main():\n    print("Hello from ${name}!")\n\nif __name__ == "__main__":\n    main()\n`,
    parentId
  };

  if (parentId) {
    const parent = findItemById(workspaceItems.value, parentId);
    if (parent && parent.isFolder) {
      if (!parent.children) parent.children = [];
      parent.children.push(newFile);
      parent.isOpen = true;
    }
  } else {
    workspaceItems.value.push(newFile);
  }

  // 原生工作区：在磁盘上创建文件并写入初始内容
  if (workspaceRootPath.value) {
    const parentAbs = parentId
      ? absPath(workspaceRootPath.value, getParentPath(parentId))
      : workspaceRootPath.value;
    nativeApi.writeFile(absPath(parentAbs, `/${name}`), newFile.content).catch(() => { });
  }

  showToast(t('toastFileCreated').replace('{name}', name));
  openFileInTab(newFile);
};

// Create New Folder
const handleCreateFolder = (parentId: string | null, name: string) => {
  const newFolder: FSItem = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    path: parentId ? `${getParentPath(parentId)}/${name}` : `/${name}`,
    isFolder: true,
    parentId,
    isOpen: true,
    children: []
  };

  if (parentId) {
    const parent = findItemById(workspaceItems.value, parentId);
    if (parent && parent.isFolder) {
      if (!parent.children) parent.children = [];
      parent.children.push(newFolder);
      parent.isOpen = true;
    }
  } else {
    workspaceItems.value.push(newFolder);
  }

  // 原生工作区：在磁盘上创建真实文件夹
  if (workspaceRootPath.value) {
    const parentAbs = parentId
      ? absPath(workspaceRootPath.value, getParentPath(parentId))
      : workspaceRootPath.value;
    nativeApi.createDir(parentAbs, name).catch(() => { });
  }

  showToast(t('toastFolderCreated').replace('{name}', name));
};

// Rename File/Folder
const handleRenameItem = (item: FSItem, newName: string) => {
  const oldPath = item.path;
  item.name = newName;
  item.path = item.parentId ? `${getParentPath(item.parentId)}/${newName}` : `/${newName}`;

  // 文件夹重命名后同步子节点的相对路径
  if (item.isFolder && item.children) {
    rebaseChildrenPaths(item, oldPath, item.path);
  }

  // Update tabs if file renamed
  const tab = openTabs.value.find((t) => t.fileId === item.id);
  if (tab) {
    tab.name = newName;
    tab.path = item.path;
  }

  // 原生工作区：重命名磁盘上的真实文件/文件夹
  if (workspaceRootPath.value) {
    nativeApi.renamePath(absPath(workspaceRootPath.value, oldPath), newName).catch(() => { });
  }
  showToast(t('toastRenamed'));
};

// Delete File/Folder
const handleDeleteItem = (item: FSItem) => {
  requestDeleteItem(item);
};

const confirmDelete = () => {
  if (deleteTargetItem.value) {
    const item = deleteTargetItem.value;
    // 原生工作区：先删除磁盘上的真实文件/文件夹
    if (workspaceRootPath.value) {
      nativeApi.deletePath(absPath(workspaceRootPath.value, item.path)).catch(() => { });
    }
    removeItemFromTree(workspaceItems.value, item.id);
    // Close tab if open
    openTabs.value = openTabs.value.filter((t) => t.fileId !== item.id);
    if (activeEditorTabId.value === `tab-${item.id}`) {
      activeEditorTabId.value = openTabs.value.length > 0 ? openTabs.value[0].id : null;
    }
    pythonRunner.syncFileSystem(workspaceItems.value);
    showToast(t('toastFileDeleted').replace('{name}', item.name));
  }
  isDeleteDialogOpen.value = false;
  deleteTargetItem.value = null;
};

// Run file directly from tree
const handleRunFile = async (item: FSItem) => {
  await ensureFileContent(item);
  openFileInTab(item);
  activeNavTab.value = 'explorer';

  consoleOutputs.value.push({
    id: uid(),
    type: 'system',
    text: `▶ Executing ${item.name} from File Tree...`,
    timestamp: new Date().toLocaleTimeString()
  });

  await pythonRunner.runCode(item.content || '', workspaceItems.value, (out) => {
    consoleOutputs.value.push(out);
  }, config.value.demoMode);
};

// Download File
const handleDownloadFile = async (item: FSItem) => {
  await ensureFileContent(item);
  const blob = new Blob([item.content || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toastExported').replace('{name}', item.name));
};

// Import uploaded files
const handleImportFiles = async (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const text = await file.text();
    const newFile: FSItem = {
      id: `file-${Date.now()}-${i}`,
      name: file.name,
      path: `/${file.name}`,
      isFolder: false,
      content: text,
      parentId: null
    };
    workspaceItems.value.push(newFile);
  }
  showToast(t('toastImported'));
};

// Tab Management
const handleSelectTab = (tabId: string) => {
  activeEditorTabId.value = tabId;
};

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

const handleUnsavedSave = () => {
  if (unsavedDialogState.value.tabId) {
    handleSaveTab(unsavedDialogState.value.tabId);
    forceCloseTab(unsavedDialogState.value.tabId);
  }
  unsavedDialogState.value.isOpen = false;
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
    // Scan imports from workspace + current unsaved buffer
    syncWorkspacePackages(workspaceItems.value, newContent);
  }
};

const handleSaveTab = (tabId: string) => {
  const tab = openTabs.value.find((t) => t.id === tabId);
  if (tab) {
    tab.savedContent = tab.content;
    tab.isDirty = false;

    // Only update workspace file item content on explicit save
    const file = findItemById(workspaceItems.value, tab.fileId);
    if (file) {
      file.content = tab.content;
    }
    // 原生工作区：同时写回磁盘
    if (workspaceRootPath.value) {
      nativeApi.writeFile(absPath(workspaceRootPath.value, tab.path), tab.content).catch(() => { });
    }
    syncWorkspacePackages(workspaceItems.value);
    showToast(t('toastFileSaved').replace('{name}', tab.name));
  }
};

// Tree Helper Utilities
function findItemById(items: FSItem[], id: string): FSItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.isFolder && item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getParentPath(parentId: string): string {
  const parent = findItemById(workspaceItems.value, parentId);
  return parent ? parent.path : '';
}

function removeItemFromTree(items: FSItem[], id: string): boolean {
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    return true;
  }
  for (const item of items) {
    if (item.isFolder && item.children) {
      if (removeItemFromTree(item.children, id)) return true;
    }
  }
  return false;
}

// 文件夹重命名后，把后代节点的相对路径前缀一并更新
function rebaseChildrenPaths(item: FSItem, oldPrefix: string, newPrefix: string) {
  if (!item.children) return;
  for (const child of item.children) {
    child.path = child.path.replace(oldPrefix, newPrefix);
    if (child.isFolder) rebaseChildrenPaths(child, oldPrefix, newPrefix);
  }
}

const activeTutorialSource = ref<{ id: string; title: string; isQuiz?: boolean; questionId?: string; expectedOutput?: string } | null>(null);
const activeTutorialTopicId = ref<string>(safeStorage.getItem('python_you_last_tutorial_topic') || 'p1_home');
const activeQuizPassed = ref(false);

// Load tutorial code to editor
const handleLoadTutorialCodeToEditor = (payload: { code: string; topicId: string; topicTitle: string; isQuiz?: boolean; questionId?: string; expectedOutput?: string } | string) => {
  let code = '';
  let topicId = '';
  let topicTitle = '';
  let isQuiz = false;
  let questionId = '';
  let expectedOutput = '';

  if (typeof payload === 'string') {
    code = payload;
  } else if (payload && typeof payload === 'object') {
    code = payload.code || '';
    topicId = payload.topicId || '';
    topicTitle = payload.topicTitle || '';
    isQuiz = !!payload.isQuiz;
    questionId = payload.questionId || '';
    expectedOutput = payload.expectedOutput || '';
  }

  if (topicId) {
    activeTutorialSource.value = {
      id: topicId,
      title: (topicTitle || t('correspondingTutorial')) + (isQuiz ? t('quizSuffix') : ''),
      isQuiz: isQuiz || undefined,
      questionId: questionId || undefined,
      expectedOutput: expectedOutput || undefined
    };
    activeTutorialTopicId.value = topicId;
  }
  if (isQuiz && questionId) {
    activeQuizPassed.value = getQuizQuestionResult(topicId, questionId) === 'pass';
  } else {
    activeQuizPassed.value = false;
  }

  activeNavTab.value = 'explorer';
  let demoFile = workspaceItems.value.find((item) => item.name === 'tutorial_demo.py');
  if (!demoFile) {
    demoFile = {
      id: 'tutorial_demo_' + Date.now(),
      name: 'tutorial_demo.py',
      path: '/tutorial_demo.py',
      isFolder: false,
      content: code,
      language: 'python',
      modifiedAt: new Date()
    };
    workspaceItems.value.push(demoFile);
  } else {
    demoFile.content = code;
  }
  // 本地工作区：首次（及每次）加载时把 tutorial_demo.py 落盘，保证重启后仍在工作区里
  if (workspaceRootPath.value) {
    nativeApi.writeFile(absPath(workspaceRootPath.value, '/tutorial_demo.py'), code).catch(() => { });
  }
  // Sync content to already-open tab so editor shows latest code immediately
  const existingTab = openTabs.value.find((t) => t.fileId === demoFile.id);
  if (existingTab) {
    existingTab.content = code;
    existingTab.savedContent = code;
    existingTab.isDirty = false;
  }
  openFileInTab(demoFile);
  showToast(t('toastTutorialCodeLoaded'));
};

const tutorialViewRef = ref<InstanceType<typeof TutorialView> | null>(null);

// 「返回对应教程」FAB：总是回到对应小节的教程文章页（不打开测验）
const handleReturnToTutorial = (topicId: string) => {
  activeNavTab.value = 'tutorial';
  if (topicId) {
    activeTutorialTopicId.value = topicId;
  } else {
    activeTutorialTopicId.value = safeStorage.getItem('python_you_last_tutorial_topic') || 'p1_home';
  }
};

// 「检查答案」FAB（已答对）：回到对应小节的测验界面
const handleReturnToQuiz = (topicId: string) => {
  activeNavTab.value = 'tutorial';
  if (topicId) {
    activeTutorialTopicId.value = topicId;
  }
  nextTick(() => {
    tutorialViewRef.value?.openQuizExternally(activeTutorialTopicId.value);
  });
};

const handleQuizSubmit = async () => {
  const src = activeTutorialSource.value;
  if (!src?.isQuiz) {
    showToast(t('toastNotQuizCode'));
    return;
  }
  const activeTab = openTabs.value.find((t) => t.id === activeEditorTabId.value);
  if (!activeTab) {
    showToast(t('toastOpenQuizCode'));
    return;
  }
  const code = activeTab.content;
  const stdoutParts: string[] = [];
  const runResult = await pythonRunner.runCode(code, workspaceItems.value, (out) => {
    consoleOutputs.value.push(out);
    if (out.type === 'stdout') stdoutParts.push(out.text);
  }, config.value.demoMode);
  if (!runResult.success) {
    showToast(t('toastRunError'));
    return;
  }
  // 按“行序列”规范化比较：两种运行引擎（Pyodide / 演示模式）输出格式不同，
  // 拆行、去空行、去首尾空格后逐行比对，不考察 \n 转义写法
  const normalizeLines = (chunks: string[]): string[] => {
    const lines: string[] = [];
    for (const chunk of chunks) {
      const parts = chunk.replace(/\r\n/g, '\n').split('\n');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0) lines.push(trimmed);
      }
    }
    return lines;
  };
  const actualLines = normalizeLines(stdoutParts);
  const expectedLines = normalizeLines([src.expectedOutput || '']);
  const passed =
    actualLines.length === expectedLines.length &&
    actualLines.every((line, i) => line === expectedLines[i]);
  activeQuizPassed.value = passed;
  setQuizQuestionResult(src.id, src.questionId || '', passed ? 'pass' : 'fail');
  if (passed) {
    syncQuizCompletion(src.id);
    showToast(t('toastQuizPassed'));
  } else {
    const truncate = (v: string) => (v.length > 40 ? v.slice(0, 40) + '...' : v);
    showToast(tf('toastOutputMismatch', { expected: truncate(expectedLines.join('\n')), actual: truncate(actualLines.join('\n')) }));
  }
};

const activeTabObject = computed(() => {
  return openTabs.value.find((t) => t.id === activeEditorTabId.value) || null;
});

// 工具栏「检查答案 / 返回教程」可用状态：已加载 tutorial_demo.py 且处于教程/测验上下文
// （原为 v-if 隐藏，现改为始终渲染、无上下文时禁用）
const isTutorialQuizMode = computed(() => {
  return !!(activeTutorialSource.value && activeTabObject.value?.name === 'tutorial_demo.py');
});

const handleCheckAnswerClick = () => {
  const src = activeTutorialSource.value;
  if (!src || !isTutorialQuizMode.value) return;
  if (activeQuizPassed.value) {
    handleReturnToQuiz(src.id);
  } else {
    handleQuizSubmit();
  }
};

const handleTutorialBtnClick = () => {
  const src = activeTutorialSource.value;
  if (!src || !isTutorialQuizMode.value) return;
  handleReturnToTutorial(src.id);
};

/* 全局滚动条 hover 显示（VS Code 风格）：
   mouseover 时沿 composedPath（含 shadow DOM 内元素）找第一个可滚动容器，
   给其 shadow host（或自身）挂 .scroll-hover 类 → 组件库 shadow 内滚动条
   显示半透明（index.css .scroll-hover 变量）；document 树滚动条走
   WebKit 伪元素 :hover，无需此类。
   不能用全局 :hover 规则代替（body 恒 hover 会污染变量继承导致常显）。 */
let scrollHoverEl: HTMLElement | null = null;
const findScrollContainer = (path: EventTarget[]): HTMLElement | null => {
  for (const node of path) {
    if (node instanceof HTMLElement) {
      const s = getComputedStyle(node);
      const scrollable = (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
        (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);
      if (scrollable) {
        // shadow 内元素：类挂到 host（document 树 CSS 匹配不到 shadow 内元素，
        // 变量经 host 继承进 shadow）
        const root = node.getRootNode();
        return (root instanceof ShadowRoot && root.host instanceof HTMLElement) ? root.host : node;
      }
    }
  }
  return null;
};
const handleScrollHover = (e: Event) => {
  const container = findScrollContainer(e.composedPath());
  if (container === scrollHoverEl) return;
  scrollHoverEl?.classList.remove('scroll-hover');
  scrollHoverEl = container;
  container?.classList.add('scroll-hover');
};
const clearScrollHover = () => {
  scrollHoverEl?.classList.remove('scroll-hover');
  scrollHoverEl = null;
};

onMounted(() => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  document.addEventListener('mousedown', handleDocumentMousedown, true);
  document.addEventListener('mouseover', handleScrollHover);
  document.addEventListener('mouseleave', clearScrollHover);
});
</script>

<template>
  <div class="app-container" :style="{ '--sidebar-width': sidebarExpanded ? '256px' : '80px' }">
    <m3e-nav-rail id="nav-rail">

      <!-- Primary destinations -->
      <m3e-nav-item data-tab="explorer" :selected="activeNavTab === 'explorer'" @click="activeNavTab = 'explorer'">
        <span slot="icon" class="material-symbols-rounded">code</span>
        <span slot="selected-icon" class="material-symbols-rounded-fill">code</span>
        {{ t('explorer') }}
      </m3e-nav-item>
      <m3e-nav-item data-tab="tutorial" :selected="activeNavTab === 'tutorial'" @click="activeNavTab = 'tutorial'">
        <span slot="icon" class="material-symbols-rounded">school</span>
        <span slot="selected-icon" class="material-symbols-rounded-fill">school</span>
        {{ t('navTutorial') }}
      </m3e-nav-item>
      <m3e-nav-item data-tab="console" :selected="activeNavTab === 'console'" @click="activeNavTab = 'console'">
        <span slot="icon" class="material-symbols-rounded">terminal</span>
        <span slot="selected-icon" class="material-symbols-rounded-fill">terminal</span>
        {{ t('navConsole') }}
      </m3e-nav-item>
      <m3e-nav-item data-tab="packages" :selected="activeNavTab === 'packages'" @click="activeNavTab = 'packages'">
        <span slot="icon" class="material-symbols-rounded">extension</span>
        <span slot="selected-icon" class="material-symbols-rounded-fill">extension</span>
        {{ t('navPackages') }}
      </m3e-nav-item>

      <m3e-nav-item class="nav-rail-settings" data-tab="settings" :selected="activeNavTab === 'settings'"
        @click="activeNavTab = 'settings'">
        <span slot="icon" class="material-symbols-rounded">settings</span>
        <span slot="selected-icon" class="material-symbols-rounded-fill">settings</span>
        {{ t('navSettings') }}
      </m3e-nav-item>
    </m3e-nav-rail>

    <!-- 2. Right Main Column (Title Bar + Workspace Content) -->
    <div class="app-main-column" @click="closeMenus">
      <!-- Title Bar: Title on left, 3 window controls on right -->
      <div class="windows-title-bar" data-tauri-drag-region>
        <div v-if="activeNavTab === 'explorer'" class="app-top-menu-bar" @click.stop>
          <m3e-menu id="fileMenu">
            <m3e-menu-item @click="handleCreateFile(null, 'untitled.py')">
              <span slot="icon" class="material-symbols-rounded">note_add</span>
              {{ t('newFile') }}
            </m3e-menu-item>
            <m3e-menu-item @click="handleCreateFolder(null, 'new_folder')">
              <span slot="icon" class="material-symbols-rounded">create_new_folder</span>
              {{ t('newFolder') }}
            </m3e-menu-item>

            <m3e-divider></m3e-divider>

            <m3e-menu-item @click="handleMenuOpenFile">
              <span slot="icon" class="material-symbols-rounded">file_open</span>
              {{ t('openFile') }}
            </m3e-menu-item>
            <m3e-menu-item @click="handleMenuOpenFolder">
              <span slot="icon" class="material-symbols-rounded">folder_open</span>
              {{ t('openFolder') }}
            </m3e-menu-item>
            <m3e-divider></m3e-divider>
            <m3e-menu-item @click="activeEditorTabId && handleSaveTab(activeEditorTabId)">
              <span slot="icon" class="material-symbols-rounded">save</span>
              {{ t('save') }}
            </m3e-menu-item>
            <m3e-menu-item @click="activeTabObject && handleDownloadFile(activeTabObject)">
              <span slot="icon" class="material-symbols-rounded">download</span>
              {{ t('downloadFile') }}
            </m3e-menu-item>
          </m3e-menu>

          <m3e-menu id="editMenu">
            <m3e-menu-item @click="codeEditorRef?.triggerCopy()">
              <span slot="icon" class="material-symbols-rounded">content_copy</span>
              {{ t('copy') }}
            </m3e-menu-item>
            <m3e-menu-item @click="codeEditorRef?.triggerCut()">
              <span slot="icon" class="material-symbols-rounded">content_cut</span>
              {{ t('cut') }}
            </m3e-menu-item>
            <m3e-menu-item @click="codeEditorRef?.triggerPaste()">
              <span slot="icon" class="material-symbols-rounded">content_paste</span>
              {{ t('paste') }}
            </m3e-menu-item>
            <m3e-divider></m3e-divider>
            <m3e-menu-item @click="codeEditorRef?.openFindBar()">
              <span slot="icon" class="material-symbols-rounded">search</span>
              {{ t('find') }}
            </m3e-menu-item>
            <m3e-menu-item @click="codeEditorRef?.openReplaceBar()">
              <span slot="icon" class="material-symbols-rounded">find_replace</span>
              {{ t('replace') }}
            </m3e-menu-item>
          </m3e-menu>
          <m3e-button size="extra-small">
            <m3e-menu-trigger for="fileMenu">{{ t('fileMenu') }}</m3e-menu-trigger>
          </m3e-button>

          <m3e-button size="extra-small">
            <m3e-menu-trigger for="editMenu">{{ t('editMenu') }}</m3e-menu-trigger>
          </m3e-button>

        </div>

        <div v-else class="title-bar-brand">
          <span>Python You</span>
        </div>
        <div class="windows-controls">
          <m3e-icon-button id="titlebar-minimize" size="extra-small" :title="t('minimize')" @click="minimizeWindow">
            <span class="material-symbols-rounded">minimize</span>
          </m3e-icon-button>
          <m3e-icon-button id="titlebar-maximize" size="extra-small" :title="t('maximize')" @click="maximizeWindow">
            <span class="material-symbols-rounded">crop_7_5</span>
          </m3e-icon-button>
          <m3e-icon-button id="titlebar-close" size="extra-small" :title="t('close')" @click="closeWindow">
            <span class="material-symbols-rounded">close</span>
          </m3e-icon-button>
        </div>
      </div>

      <!-- Main Layout Workspace -->
      <div class="app-layout-wrapper">
        <!-- Editor Action Toolbar：编辑器视图下始终可见；未打开文件时各按钮禁用 -->
        <div v-if="activeNavTab === 'explorer'" class="editor-toolbar">
          <div class="left-toolbar-group">
            <!-- 新建文件 / 新建文件夹（触发文件树顶部内联输入行；不依赖是否打开文件）/ 保存 / 撤销 / 重做 -->
            <m3e-icon-button variant="standard" size="extra-small" :title="t('newFileTooltip')"
              @click="fileTreeRef?.startCreateFile(null)">
              <span class="material-symbols-rounded">note_add</span>
            </m3e-icon-button>
            <m3e-icon-button variant="standard" size="extra-small" :title="t('newFolderTooltip')"
              @click="fileTreeRef?.startCreateFolder(null)">
              <span class="material-symbols-rounded">create_new_folder</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!activeTabObject?.isDirty" :title="`${t('save')} (Ctrl+S)`"
              @click="activeTabObject && handleSaveTab(activeTabObject.id)">
              <span class="material-symbols-rounded">save</span>
            </m3e-icon-button>

            <m3e-icon-button size="extra-small" class="marginBtn" :disabled="!codeEditorRef?.canUndo"
              :title="t('undoTitle')" @click="codeEditorRef?.undo()">
              <span class="material-symbols-rounded">undo</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!codeEditorRef?.canRedo" :title="t('redoTitle')"
              @click="codeEditorRef?.redo()">
              <span class="material-symbols-rounded">redo</span>
            </m3e-icon-button>

            <!-- 运行 / 停止 -->
            <template v-if="codeEditorRef?.isExecuting">
              <m3e-button variant="text" size="extra-small" class="marginBtn stopBtn" width="wide"
                :title="t('stopCode')" @click="codeEditorRef?.stopCode()">
                <span slot="icon" class="material-symbols-rounded">stop</span>
                {{ t('stopCode') }}
              </m3e-button>
            </template>
            <template v-else>
              <m3e-button variant="text" size="extra-small" class="marginBtn runBtn" width="wide"
                :disabled="!activeTabObject" :title="t('runCode')" @click="codeEditorRef?.runCode()">
                <span slot="icon" class="material-symbols-rounded">play_arrow</span>
                {{ t('runCode') }}
              </m3e-button>
            </template>

          </div>

          <div class="left-toolbar-group">
            <!-- 编辑器字号加减：直接更新 config.fontSize（deep watch 自动持久化），范围 10-24px -->
            <m3e-icon-button size="extra-small" :disabled="!activeTabObject" :title="t('fontSizeIncrease')"
              @click="changeFontSize(1)">
              <span class="material-symbols-rounded">text_increase</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!activeTabObject" :title="t('fontSizeDecrease')"
              @click="changeFontSize(-1)">
              <span class="material-symbols-rounded">text_decrease</span>
            </m3e-icon-button>
            <!-- 查找 / 替换 -->
            <m3e-icon-button class="marginBtn" size="extra-small" :disabled="!activeTabObject" :title="t('find')"
              @click="codeEditorRef?.openFindBar()">
              <span class="material-symbols-rounded">search</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!activeTabObject" :title="t('replace')"
              @click="codeEditorRef?.openReplaceBar()">
              <span class="material-symbols-rounded">find_replace</span>
            </m3e-icon-button>
          </div>

          <!-- 检查答案 / 返回教程：始终显示，无教程上下文时禁用（原为 v-if 隐藏） -->
          <div class="left-toolbar-group">
            <m3e-button size="extra-small" variant="text" class="answerBtn" :disabled="!isTutorialQuizMode"
              @click="handleCheckAnswerClick">
              <span slot="icon" class="material-symbols-rounded">{{ activeQuizPassed ? 'check_circle' : 'task_alt'
                }}</span>
              {{ activeQuizPassed ? t('quizAnswerCorrectDesc') : t('checkAnswer') }}
            </m3e-button>
            <m3e-button size="extra-small" variant="text" class="tutorBtn" :disabled="!isTutorialQuizMode"
              @click="handleTutorialBtnClick">
              <span slot="icon" class="material-symbols-rounded">school</span>
              {{ t('returnToTutorial') }}
            </m3e-button>
            <m3e-icon-button size="extra-small" :title="t('helpTitle')" @click="isHelpOpen = true">
              <span class="material-symbols-rounded">help</span>
            </m3e-icon-button>
          </div>

          <div class="right-toolbar-group">
            <span class="cursor-position-tag">
              {{ t('cursorPositionText').replace('{line}', String(codeEditorRef?.cursorLine ?? 1)).replace('{col}',
                String(codeEditorRef?.cursorCol ?? 1)) }}
            </span>
            <span class="engine-badge">
              {{ engineLabel || t('engineLabelDefault') }}
            </span>
          </div>
        </div>


        <!-- Explorer View：Split Pane（文件树 | 编辑器 / 终端） -->
        <template v-if="activeNavTab === 'explorer'">

          <m3e-split-pane :value="workspaceSplitValue" class="complex split-pane" @input="handleWorkspaceSplitInput"
            @pointerdown="onWorkspaceSplitPointerDown">
            <!-- 工作区文件夹栏 -->
            <m3e-card slot="start">
              <FileTree ref="fileTreeRef" :workspace-items="workspaceItems"
                :active-file-id="activeTabObject?.fileId || null" :workspace-root="workspaceRootPath"
                @select-file="handleSelectFile" @toggle-folder="handleToggleFolder" @create-file="handleCreateFile"
                @create-folder="handleCreateFolder" @rename-item="handleRenameItem" @delete-item="requestDeleteItem"
                @run-file="handleRunFile" @download-file="handleDownloadFile"
                @contextmenu-filetree="(e, item) => openContextMenu(e, 'filetree', item)" />
            </m3e-card>

            <!-- 代码编辑区域 / 终端区域（编辑区 75% / 终端 25%，受控绑定：拖拽比例随窗口变化保持） -->
            <m3e-split-pane ref="innerSplitPaneRef" slot="end" :value="innerSplitValue" :max="innerSplitMax"
              orientation="vertical" @input="onInnerSplitInput">
              <m3e-card slot="start">
                <CodeEditor ref="codeEditorRef" :tabs="openTabs" :active-tab-id="activeEditorTabId" :config="config"
                  :workspace-files="workspaceItems" :code-theme="resolvedCodeTheme" :initial-cursors="sessionCursors"
                  @cursor-change="handleCursorChange" @select-tab="handleSelectTab" @close-tab="handleCloseTab"
                  @content-change="handleContentChange" @save-tab="handleSaveTab"
                  @add-console-output="out => consoleOutputs.push(out)"
                  @contextmenu-editor="e => openContextMenu(e, 'editor')" @show-toast="showToast" />
              </m3e-card>

              <m3e-card slot="end" class="terminal-card">
                <TerminalPanel :outputs="consoleOutputs" :code-theme="resolvedCodeTheme" @clear="consoleOutputs = []"
                  @contextmenu-terminal="e => openContextMenu(e, 'terminal', null, 'run')" />
              </m3e-card>
            </m3e-split-pane>
          </m3e-split-pane>
        </template>

        <!-- 3. Workspace Main View（非编辑器标签页） -->
        <main v-else class="main-workspace">
          <!-- Python Tutorial View -->
          <TutorialView ref="tutorialViewRef" v-if="activeNavTab === 'tutorial'"
            :active-topic-id-prop="activeTutorialTopicId"
            @update-active-topic="id => { activeTutorialTopicId = id; safeStorage.setItem('python_you_last_tutorial_topic', id); }"
            @load-code-to-editor="handleLoadTutorialCodeToEditor"
            @contextmenu-tutorial="e => openContextMenu(e, 'tutorial')" />

          <!-- Interactive Python REPL Console View -->
          <REPLConsole v-else-if="activeNavTab === 'console'" :config="config" :logs="replLogs"
            :code-theme="resolvedCodeTheme"
            @add-log="out => replLogs.push(out)" @clear-logs="replLogs = []"
            @add-console-output="out => consoleOutputs.push(out)"
            @contextmenu-terminal="e => openContextMenu(e, 'terminal', null, 'repl')" />

          <!-- Package Manager View -->
          <PackageManager v-else-if="activeNavTab === 'packages'" :workspace-files="workspaceItems"
            @add-console-output="out => consoleOutputs.push(out)" />

          <!-- Settings View -->
          <SettingsView v-else-if="activeNavTab === 'settings'" :config="config" />
        </main>
      </div>
    </div>

    <!-- App Initialization Loading Modal -->
    <MD3LoadingModal :show="isInitializing" :status="loadingStatus" />

    <!-- Snackbar Notification Toast -->
    <m3e-snackbar :open="!!toastMessage" :duration="snackbarDuration" @toggle="handleSnackbarToggle">
      <template v-if="isExportToast">
        <span class="snack-message">{{ toastMessage }}</span>
        <m3e-button class="snack-action-btn" variant="text" size="extra-small" :disabled="isOpeningFolder"
          @click="handleOpenExportFolder">
          {{ isOpeningFolder ? t('openingFolder') : t('openFolder') }}
        </m3e-button>
      </template>
      <template v-else>{{ toastMessage }}</template>
    </m3e-snackbar>

    <!-- Delete Confirmation Dialog -->
    <m3e-dialog :open="isDeleteDialogOpen" @cancel="isDeleteDialogOpen = false" @closed="isDeleteDialogOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon is-danger">warning</span>
        <span class="m3e-dialog-title">{{ t('confirmDeleteTitle') }}</span>
      </span>
      <p class="m3e-dialog-desc">{{ t('confirmDeleteMsg').replace('{name}', deleteTargetItem?.name || '') }}</p>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="text" size="small" @click="isDeleteDialogOpen = false">{{ t('cancel') }}</m3e-button>
        <m3e-button class="dialog-danger-btn" variant="filled" size="small" @click="confirmDelete">{{ t('delete')
        }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- Unsaved Changes Confirmation Dialog -->
    <m3e-dialog :open="unsavedDialogState.isOpen" @cancel="handleUnsavedCancel" @closed="handleUnsavedCancel">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">save</span>
        <span class="m3e-dialog-title">{{ t('unsavedChangesTitle') }}</span>
      </span>
      <p class="m3e-dialog-desc">{{ t('unsavedChangesMsg').replace('{name}', unsavedDialogState.tabName) }}</p>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="text" size="small" @click="handleUnsavedCancel">{{ t('cancel') }}</m3e-button>
        <m3e-button variant="outlined" size="small" @click="handleUnsavedDontSave">{{ t('dontSave') }}</m3e-button>
        <m3e-button variant="filled" size="small" @click="handleUnsavedSave">{{ t('save') }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- 使用帮助 Dialog -->
    <m3e-dialog :open="isHelpOpen" @cancel="isHelpOpen = false" @closed="isHelpOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">help</span>
        <span class="m3e-dialog-title">{{ t('helpTitle') }}</span>
      </span>
      <m3e-content-pane class="help-dialog-body">
        <div class="help-dialog-inner">
          <section>
            <h4 class="help-section-title">{{ t('helpBasicsTitle') }}</h4>
            <p class="help-section-text">{{ t('helpBasicsText') }}</p>
          </section>
          <section>
            <h4 class="help-section-title">{{ t('helpShortcutsTitle') }}</h4>
            <p class="help-section-text">{{ t('helpShortcutsText') }}</p>
          </section>
          <section>
            <h4 class="help-section-title">{{ t('helpConsoleTitle') }}</h4>
            <p class="help-section-text">{{ t('helpConsoleText') }}</p>
          </section>
          <section>
            <h4 class="help-section-title">{{ t('helpPackagesTitle') }}</h4>
            <p class="help-section-text">{{ t('helpPackagesText') }}</p>
          </section>
          <section>
            <h4 class="help-section-title">{{ t('helpTutorialTitle') }}</h4>
            <p class="help-section-text">{{ t('helpTutorialText') }}</p>
          </section>
          <section>
            <h4 class="help-section-title">{{ t('helpSettingsTitle') }}</h4>
            <p class="help-section-text">{{ t('helpSettingsText') }}</p>
          </section>
        </div>
      </m3e-content-pane>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="filled" size="small" @click="isHelpOpen = false">{{ t('helpGotIt') }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- Custom Right-Click Context Menu -->
    <ContextMenu :visible="contextMenuState.visible" :x="contextMenuState.x" :y="contextMenuState.y"
      :type="contextMenuState.type" :target-item="contextMenuState.targetItem" @close="closeContextMenu"
      @copy="handleContextMenuCopy" @cut="codeEditorRef?.triggerCut()" @paste="codeEditorRef?.triggerPaste()"
      @find="codeEditorRef?.openFindBar()" @replace="codeEditorRef?.openReplaceBar()"
      @new-file="handleCreateFile(contextMenuState.targetItem?.isFolder ? contextMenuState.targetItem.id : null, 'untitled.py')"
      @new-folder="handleCreateFolder(contextMenuState.targetItem?.isFolder ? contextMenuState.targetItem.id : null, 'new_folder')"
      @rename="item => fileTreeRef.value?.startRename(item)" @delete="item => requestDeleteItem(item)"
      @run="item => handleRunFile(item)" @reveal-in-explorer="handleRevealInExplorer" />

    <!-- Hidden file inputs for menu open file/folder -->
    <input ref="openFileInputRef" type="file" accept=".py,.txt,.json,.md" style="display:none"
      @change="handleFileInputChange" />
    <input ref="openFolderInputRef" type="file" style="display:none" webkitdirectory directory
      @change="handleFileInputChange" />
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  flex-direction: row;
  font-family: var(--font-sans);
  position: relative;
  overflow: hidden;
}

/* --- m3e Navigation Rail (replaces MD3Sidebar) --- */
m3e-nav-rail {
  height: 100vh;
  background-color: var(--surface-container-high);
}

.nav-rail-settings {
  margin-top: auto;
}

.app-main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.windows-title-bar {
  height: 36px;
  background-color: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  z-index: 10;
  user-select: none;
  flex-shrink: 0;
  position: relative;
}

.title-bar-brand {
  padding-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-size-xs);
  font-weight: 700;
  color: var(--text-secondary);
  font-family: Nunito;
}

.windows-controls {
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  height: 36px;
  z-index: 35000;
}


.app-layout-wrapper {
  width: 100%;
  height: calc(100vh - 36px);
  overflow: hidden;
  background-color: var(--surface-color);
  display: flex;
  flex-direction: column;
}

/* 外层 Split Pane：工作区布局的 flex 子项，占满工具栏下方的剩余高度 */
.app-layout-wrapper>m3e-split-pane {
  flex: 1;
  height: auto;
  min-height: 0;
  margin: 0 0.4rem 0.4rem 0
}

.app-layout-wrapper m3e-split-pane m3e-split-pane {
  height: 100%;
}

.app-layout-wrapper m3e-split-pane>m3e-card {
  height: 100%;
  contain: size;
}

.app-layout-wrapper m3e-split-pane m3e-card.terminal-card {
  --m3e-card-padding: 0;
  --m3e-card-container-color: var(--surface-color);
}

.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* ---- 编辑器操作工具栏：位于三面栏 Split Pane 上方，横贯整个工作区宽度 ---- */
.editor-toolbar {
  height: 2.4rem;
  padding: 0 12px 0 0;
  margin: 0 0.2rem 0.5rem 0.2rem;
  display: flex;
  align-items: center;
  background-color: var(--surface-color);
  position: relative;
  flex-shrink: 0;
}

.left-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.1rem 0.8rem;
  margin-left: 0.8rem;
  background-color: var(--bg-color);
  border: 1.4px solid var(--border-color-muted);
  border-radius: 16px;
}

.right-toolbar-group {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.cursor-position-tag {
  font-family: var(--font-mono);
}

.engine-badge {
  color: var(--on-primary-container);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.marginBtn {
  margin-left: 0.75rem;
}

.stopBtn {
  --m3e-button-icon-color: var(--error);
  --m3e-button-label-text-color: var(--error);
  --m3e-button-focus-icon-color: var(--error);
  --m3e-button-focus-label-text-color: var(--error);
}

.runBtn {
  --m3e-button-icon-color: var(--success);
  --m3e-button-label-text-color: var(--success);
  --m3e-button-focus-icon-color: var(--success);
  --m3e-button-focus-label-text-color: var(--success);
}

.answerBtn {
  --m3e-button-icon-color: var(--text-color);
  --m3e-button-label-text-color: var(--text-color);
  --m3e-button-focus-icon-color: var(--text-color);
  --m3e-button-focus-label-text-color: var(--text-color);
}

.tutorBtn {
  --m3e-button-icon-color: var(--text-color);
  --m3e-button-label-text-color: var(--text-color);
  --m3e-button-focus-icon-color: var(--text-color);
  --m3e-button-focus-label-text-color: var(--text-color);
}

/* m3e-snackbar（含导出成功时的”打开文件夹”操作按钮） */
.snack-message {
  margin-right: 8px;
}

.snack-action-btn {
  vertical-align: middle;
}

/* m3e-dialog 内容样式 */
.m3e-dialog-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.m3e-dialog-icon {
  font-size: 1.25rem;
  color: var(--primary);
}

.m3e-dialog-icon.is-danger {
  color: var(--error);
}

.m3e-dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.m3e-dialog-desc {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.m3e-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

/* 使用帮助弹窗内容（m3e-content-pane：背景/内边距由 shadow 内元素绘制，经变量控制；
   flex 排列放进 slot 内的包装层） */
.help-dialog-body {
  max-height: 50vh;
  --m3e-content-pane-container-padding: 4px;
  --m3e-content-pane-container-shape: 0;
  /* 必须与 m3e-dialog 容器同色：dialog 默认背景是 surface-container-high（surface 的上级），
     用 var(--surface-color) 会浅一档，与弹窗背景形成色差 */
  --m3e-content-pane-container-color: var(--surface-container-high);
}

.help-dialog-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.help-section-title {
  margin: 0 0 4px;
  font-size: 0.875rem;
  color: var(--primary);
}

.help-section-text {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--text-secondary);
  white-space: pre-line;
}

.dialog-danger-btn {
  --m3e-button-container-color: var(--error);
  --m3e-button-label-text-color: var(--on-error);
  --m3e-button-icon-color: var(--on-error);
  --m3e-button-pressed-state-layer-color: var(--on-error);
  --m3e-button-focus-state-layer-color: var(--on-error);
}

m3e-card {
  padding: 0;
}
</style>
