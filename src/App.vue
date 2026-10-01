<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { FSItem, ConsoleOutput, AppConfig } from './types';
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
import { nativeApi, fsEntriesToFSItems, nativeFileId, absPath, type WorkspaceEntry } from './utils/native';
import { WorkspaceWatcher, type WorkspaceChange } from './utils/workspaceWatcher';
import { pendingDependencies, resolveInstallConfirm } from './utils/dependencyGate';
import { nativePython } from './utils/nativePython';
import { copyToClipboard } from './utils/clipboard';
import { revealItemInDir, openPath } from '@tauri-apps/plugin-opener';

import { uid } from './utils/id';
import { resolveCodeTheme } from './utils/theme';
import { backendTasks, addBackendTask, finishBackendTask, type BackendTask } from './utils/backendTasks';
import { setQuizQuestionResult, syncQuizCompletion, getQuizQuestionResult } from './components/tutor/quizData';
import { useSplitLayout } from './composables/useSplitLayout';
import { useEditorTabs } from './composables/useEditorTabs';
import { useLearningSession } from './composables/useLearningSession';
import { useEditorCommands } from './composables/useEditorCommands';

const { t, tf } = useI18n();

// Component refs
const codeEditorRef = ref<any>(null);
// 编辑器命令通道 + 上抛状态（useEditorCommands）：标题栏/工具栏/右键菜单远程触发、撤销态/光标标签
const { editorCommand, sendEditorCommand, editorUndoState, editorCursor, onEditorCursorChange, handleEditorCopyResult } = useEditorCommands({ onCursorChange: (p) => handleCursorChange(p), showToast });
const fileTreeRef = ref<any>(null);
const openFileInputRef = ref<HTMLInputElement | null>(null);
const openFolderInputRef = ref<HTMLInputElement | null>(null);

// 分栏布局（工作区栏折叠阻尼 + 终端面板像素高度）：见 src/composables/useSplitLayout.ts（提示词 6 批次 1）
const {
  workspaceSplitValue,
  onWorkspaceSplitPointerDown,
  handleWorkspaceSplitInput,
  innerSplitPaneRef,
  innerSplitValue,
  innerSplitMax,
  onInnerSplitInput,
  attachInnerSplitResizeObserver,
} = useSplitLayout();

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
  // 编辑器：复制 textarea 选区；结果经 CodeEditor 的 copy-result 事件回传，提示由 App 负责
  sendEditorCommand('copySelection');
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
// 删除确认文案：文件夹删除附加“包含全部内容”警示（NFR-5.4）
const deleteConfirmMsg = computed(() => {
  const item = deleteTargetItem.value;
  if (!item) return '';
  return item.isFolder
    ? tf('confirmDeleteFolderMsg', { name: item.name })
    : tf('confirmDeleteMsg', { name: item.name });
});

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
      sendEditorCommand('focus');
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
    // 先告知 Rust 工作区根目录：fs 命令将校验路径在根目录之内（NFR-5.2）
    await nativeApi.setWorkspaceRoot(root);
    const entries = await nativeApi.readDirectory(root);
    // 先设置 root 再赋值树，避免深监听把整棵树写回 localStorage
    workspaceRootPath.value = root;
    pythonRunner.workspaceRoot = root;
    workspaceItems.value = fsEntriesToFSItems(entries);
    resetTabs();
    safeStorage.setItem('python_you_workspace_root', root);
    await startWorkspaceWatcher();

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

// App Config State
const config = ref<AppConfig>({
  themeMode: 'dark', // 默认深色（用户可在设置里改回浅色/跟随系统）
  fontSize: 15,
  tabSize: 4,
  wordWrap: true,
  autoSave: true,
  showLineNumbers: true,
  codeTheme: 'github-dark',
  enableWheelZoom: true,
  autoPairQuotes: true,
  demoMode: false,
  interpreter: 'auto'
});

// 已解析的代码主题：'system'（跟随系统主题）按外观主题映射为实际浅/深色主题
const resolvedCodeTheme = computed(() => resolveCodeTheme(config.value.codeTheme, config.value.themeMode));

// Toast message notifier
const toastMessage = ref<string | null>(null);
// 用函数声明（会提升）而不是 const 箭头：setup 顶部把它按值传给 composable（useEditorCommands），
// const 在那个位置还处于 TDZ，会直接抛 "Cannot access 'showToast' before initialization"
function showToast(msg: string) {
  // 先置空再赋值：已有 toast 未关闭时 open 不变，组件不会重新计时，
  // 新消息会被上一条的收尾（closed → 置空）立刻清掉
  toastMessage.value = null;
  nextTick(() => {
    toastMessage.value = msg;
  });
}

const snackbarDuration = 5000;
const handleSnackbarToggle = (e: Event) => {
  if ((e as any).newState === 'closed') {
    toastMessage.value = null;
  }
};


// Workspace File System & Editor Tabs State
const workspaceItems = ref<FSItem[]>([]);
const consoleOutputs = ref<ConsoleOutput[]>([]);

// 编辑器标签会话（useEditorTabs）：标签列表 / 活动标签 / 会话保存恢复 / 保存冲突 / 光标记忆
// 依赖以惰性箭头传入：文件树助手在下方定义，调用时（而非 setup 时）才解引用
const editorTabs = useEditorTabs({
  getWorkspaceItems: () => workspaceItems.value,
  getWorkspaceRoot: () => workspaceRootPath.value,
  // 下面这些助手都在本文件下方才声明：必须惰性传（箭头内解引用），
  // 直接按值传会在 setup 期触发 TDZ —— "Cannot access 'X' before initialization"
  findItemById: (items, id) => findItemById(items, id),
  findFileByPath: (items, path) => findFileByPath(items, path),
  findOrLoadFileByPath: (items, path, root) => findOrLoadFileByPath(items, path, root),
  ensureFileContent: (file, force) => ensureFileContent(file, force),
  writeDiskFile: (item, abs, content) => writeDiskFile(item, abs, content),
  showToast: (msg) => showToast(msg),
  setActiveNavTab: (v: string) => { activeNavTab.value = v; },
});
const {
  openTabs, activeEditorTabId, sessionCursors, unsavedDialogState, conflictState, activeTabObject,
  saveSession, handleCursorChange, restoreSession, openFileInTab,
  handleSelectTab, handleCloseTab, forceCloseTab,
  handleUnsavedSave, handleUnsavedDontSave, handleUnsavedCancel,
  handleContentChange, handleSaveTab, handleConflictOverwrite, handleConflictCancel,
  closeTabForFileId, resetTabs, renameTabForFile, refreshTabContent,
} = editorTabs;
// REPL 交互终端会话记录：提升到 App 级，切换页面时保留；内存态，应用重启自动清空
const replLogs = ref<ConsoleOutput[]>([]);

// 本地工作区根目录（Tauri 原生文件系统模式），null 表示纯虚拟工作区
const workspaceRootPath = ref<string | null>(null);
const engineLabel = computed(() => nativePython.statusLabel.value);

// 网页端环境（非 Tauri）：显示环境提示条（FR-6.8：数据仅存本浏览器）
const isWebEnv = computed(() => !nativeApi.available());

// ---- 标题栏后台任务：指示器按钮 + 弹窗任务列表 ----
// 任务状态集中在 utils/backendTasks 单例：包安装等子组件可直接登记并更新进度（FR-5.6）

// 指示器主显示：由任务列表派生（有运行中任务 → 转圈 + 任务文字；无 → 后台无内容）
const activeBackendTask = computed(() => backendTasks.value.find((t) => t.status === 'running'));
// 列表只显示未完成任务（进行中 / 失败），已完成的不再展示（数据仍保留供状态复用）
const visibleBackendTasks = computed(() => backendTasks.value.filter((t) => t.status !== 'done'));
const backendBusy = computed(() => !!activeBackendTask.value);
const backendStatus = computed(() => activeBackendTask.value?.label || '');
// 后台任务列表用弹窗查看（点击标题栏状态栏打开）
const isBackendTasksOpen = ref(false);
// 有真实进度时在状态文字后追加百分比（无进度数据不显示，保持不确定态）
const backendProgressSuffix = computed(() => {
  const p = activeBackendTask.value?.progress;
  return typeof p === 'number' ? ` ${p}%` : '';
});
const backendTaskStatusText = (s: BackendTask['status']) =>
  s === 'running' ? t('backendTaskRunning') : s === 'done' ? t('backendTaskDone') : t('backendTaskFailed');

// 切换解释器（设置页 / 编辑器版本管理器弹窗）：写入配置并应用
const selectInterpreter = async (id: string) => {
  config.value.interpreter = id;
  addBackendTask('apply-interpreter', t('statusApplyingInterpreter'));
  try {
    await nativePython.applyInterpreter(id);
  } finally {
    finishBackendTask('apply-interpreter');
  }
};

// 版本管理器弹窗
const isInterpreterOpen = ref(false);
const interpreterError = ref('');
// 添加自定义解释器：选择 Python 可执行文件 → Rust 探测版本与真实路径 → 并入列表并切换
const handleAddInterpreter = async () => {
  interpreterError.value = '';
  const path = await nativeApi.pickFile();
  if (!path) return;
  addBackendTask('add-interpreter', t('statusAddingInterpreter'));
  try {
    const entry = await nativePython.addInterpreter(path);
    await selectInterpreter(entry.id);
    showToast(tf('interpreterAdded', { label: entry.label }));
  } catch (err: any) {
    interpreterError.value = t('interpreterAddFailed') + (err?.message || err);
    showToast(interpreterError.value);
  } finally {
    finishBackendTask('add-interpreter');
  }
};
const onInterpreterDialogChange = async (e: Event) => {
  await selectInterpreter((e.target as any).value as string);
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


// Initialize Workspace from LocalStorage / 本地工作区
onMounted(async () => {
  // 检测本机 Python，用于引擎徽标展示（异步，不阻塞初始化）；
  // 标题栏后台任务列表同步记录检测任务
  if (nativeApi.available()) {
    addBackendTask('detect-python', t('statusDetectingPython'));
    nativePython.detect().finally(() => {
      finishBackendTask('detect-python');
    });
  }
  // Pyodide 引擎加载状态（首次运行代码时在后台加载）：
  // 开始加载登记任务，完成/失败后标记结束
  pythonRunner.onEngineLoading = (loading) => {
    if (loading) {
      addBackendTask('load-pyodide', t('statusLoadingPyodide'));
    } else {
      finishBackendTask('load-pyodide');
    }
  };
  // 预热 Pyodide：首次运行的 >1s 等待主要来自 Worker + WASM 加载，提前到启动后台完成。
  // 本机 Python 可用时 warmUpPyodide 自己跳过；演示模式不需要预加载。
  if (!config.value.demoMode) pythonRunner.warmUpPyodide();

  // 应用在用户目录生成文件（如运行用的临时工作区）时，用 snackbar 告知保存位置
  nativePython.onNotice = (message) => showToast(message);

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
        // 先告知 Rust 工作区根目录：fs 命令将校验路径在根目录之内（NFR-5.2）
        await nativeApi.setWorkspaceRoot(savedRoot);
        loadingStatus.value = t('loadingScanningWorkspace');
        const entries = await nativeApi.readDirectory(savedRoot);
        workspaceRootPath.value = savedRoot;
        pythonRunner.workspaceRoot = savedRoot;
        workspaceItems.value = fsEntriesToFSItems(entries);
        safeStorage.setItem('python_you_workspace_root', savedRoot);
        await startWorkspaceWatcher();
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
        // 先告知 Rust 工作区根目录：fs 命令将校验路径在根目录之内（NFR-5.2）
        await nativeApi.setWorkspaceRoot(defaultRoot);
        loadingStatus.value = t('loadingScanningWorkspace');
        const entries = await nativeApi.readDirectory(defaultRoot);
        workspaceRootPath.value = defaultRoot;
        pythonRunner.workspaceRoot = defaultRoot;
        workspaceItems.value = fsEntriesToFSItems(entries);
        safeStorage.setItem('python_you_workspace_root', defaultRoot);
        await startWorkspaceWatcher();
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
  // FR-3.7：字号三入口统一为 12-24，历史配置可能存有区间外的旧值，启动时归一到区间内
  config.value.fontSize = Math.min(24, Math.max(12, Number(config.value.fontSize) || 15));
  // 网页端没有本机 Python：解释器一律用内置 WASM（导入的桌面端配置可能指向不存在的本机解释器）
  if (!nativeApi.available() && config.value.interpreter !== 'pyodide') {
    config.value.interpreter = 'pyodide';
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

  // 不再无条件输出 "Demo Mode Active" 横幅（FR-4.6 演示模式诚实性）：
  // 实际引擎状态由运行时真实输出（本机 Python / Pyodide / 演示模式各有独立提示）
  isInitializing.value = false;

  // 首次启动引导（FR-1.4）：弹窗无论何种情况只展示一次，随后永不开启——
  // 弹出时立即写入标记，用户以任何方式关闭（点按钮/取消/ESC）都不会再次出现
  const welcomeShown = safeStorage.getItem('python_you_welcome_shown');
  if (!welcomeShown) {
    isWelcomeOpen.value = true;
    safeStorage.setItem('python_you_welcome_shown', '1');
  }

  // 应用已保存的解释器选择（Rust 侧同步；detect 异步完成，不阻塞初始化）
  nativePython.applyInterpreter(config.value.interpreter);
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

// 工具栏字号加减：更新 config.fontSize，由上方 deep watch 自动持久化；
// 范围 12-24px（FR-3.7：与 Ctrl+滚轮缩放、设置页滑块三入口统一）
const changeFontSize = (delta: number) => {
  const cur = config.value.fontSize || 15;
  config.value.fontSize = Math.min(24, Math.max(12, cur + delta));
};

const handleJumpToSearchResult = async (p: { file: FSItem; line: number }) => {
  await handleSelectFile(p.file);
  window.setTimeout(() => sendEditorCommand('reveal', p.line), 60);
};

// 首次启动欢迎引导弹窗（FR-1.4）：无教程完成记录时打开
const isWelcomeOpen = ref(false);
const startTutorial = () => {
  isWelcomeOpen.value = false;
  activeNavTab.value = 'tutorial';
};

// 使用帮助弹窗
const isHelpOpen = ref(false);


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

// 写盘并记录 mtime（保存前外部修改检测用）
const writeDiskFile = async (item: FSItem, abs: string, content: string) => {
  try {
    await nativeApi.writeFile(abs, content);
    item.mtime = await nativeApi.statMtime(abs);
    noteSelfChange();
  } catch (e) { }
};

// 按需加载文件内容（目录扫描时不预读，打开/运行/下载时才从磁盘读取）。
// force = true 忽略内存缓存强制回读：文件可能已被其他程序修改，重新打开时应看到磁盘上的最新内容
const ensureFileContent = async (file: FSItem, force = false): Promise<void> => {
  if (!workspaceRootPath.value || file.isFolder) return;
  if (!force && file.content && file.content.length > 0) return;
  try {
    const abs = absPath(workspaceRootPath.value, file.path);
    const content = await nativeApi.readFile(abs);
    file.content = content;
    try {
      file.mtime = await nativeApi.statMtime(abs);
    } catch (e) { /* 拿不到 mtime 就不做事前比对 */ }
    // 同步已打开的标签页；有未保存修改时保留用户内容（写盘前仍会走冲突检测）
    refreshTabContent(file, content);
  } catch (e) { }
};

// ---- 工作区外部变更检测（轮询 + 后台状态显示） ----
let workspaceWatcher: WorkspaceWatcher | null = null;
let applyingWorkspaceChange = false;

const stopWorkspaceWatcher = () => {
  workspaceWatcher?.stop();
  workspaceWatcher = null;
};

const startWorkspaceWatcher = async () => {
  stopWorkspaceWatcher();
  if (!workspaceRootPath.value) return;
  const watcher = new WorkspaceWatcher((change) => { void applyWorkspaceChange(change); });
  workspaceWatcher = watcher;
  await watcher.prime();
  watcher.start();
};

// 应用自身写入文件后刷新基线：避免把自己的改动当成外部变更反复提示
const noteSelfChange = () => { void workspaceWatcher?.prime(); };

const sortTreeLevel = (items: FSItem[]) => {
  items.sort((a, b) => (a.isFolder !== b.isFolder)
    ? (a.isFolder ? -1 : 1)
    : a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
};

const findFolderByPath = (items: FSItem[], path: string): FSItem | null => {
  for (const item of items) {
    if (!item.isFolder) continue;
    if (item.path === path) return item;
    if (item.children) {
      const found = findFolderByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
};

const removeItemByPath = (items: FSItem[], path: string): boolean => {
  const index = items.findIndex((item) => item.path === path);
  if (index >= 0) {
    items.splice(index, 1);
    return true;
  }
  for (const item of items) {
    if (item.isFolder && item.children && removeItemByPath(item.children, path)) return true;
  }
  return false;
};

// 把清单里的新条目挂到树上；父目录还没展开（children 未加载）时跳过，展开时会按需读盘
const addEntryToTree = (entry: WorkspaceEntry) => {
  const name = entry.path.split('/').filter(Boolean).pop() || entry.path;
  const parentPath = entry.path.slice(0, entry.path.lastIndexOf('/'));
  const node: FSItem = {
    id: nativeFileId(entry.path),
    name,
    path: entry.path,
    isFolder: entry.isFolder,
    parentId: null,
    isOpen: false
  };
  if (entry.isFolder) node.children = [];
  else node.mtime = entry.mtime;

  if (!parentPath || parentPath === '/') {
    workspaceItems.value.push(node);
    sortTreeLevel(workspaceItems.value);
    return;
  }
  const parent = findFolderByPath(workspaceItems.value, parentPath);
  if (!parent || !Array.isArray(parent.children)) return;
  node.parentId = parent.id;
  parent.children.push(node);
  sortTreeLevel(parent.children);
};

// 应用外部变更：更新文件树、刷新受影响的已打开文件，并在标题栏后台指示区给出同步状态
const applyWorkspaceChange = async (change: WorkspaceChange) => {
  if (applyingWorkspaceChange) return;
  applyingWorkspaceChange = true;
  const summary = tf('statusWorkspaceSynced', {
    added: change.added.length,
    modified: change.modified.length,
    removed: change.removed.length
  });
  addBackendTask('workspace-sync', t('statusWorkspaceSyncing'));
  try {
    for (const path of change.removed) removeItemByPath(workspaceItems.value, path);
    for (const entry of change.added) addEntryToTree(entry);

    // 外部删除的文件：干净的标签页关闭；有未保存修改的保留，保存时重新写回磁盘
    for (const path of change.removed) {
      const tab = openTabs.value.find((t) => t.path === path);
      if (tab && !tab.isDirty) forceCloseTab(tab.id);
    }
    // 外部修改且已在标签页中打开的文件：回读磁盘（有未保存修改的标签页保留用户内容）
    for (const path of change.modified) {
      const file = findFileByPath(workspaceItems.value, path);
      if (file && openTabs.value.some((tab) => tab.fileId === file.id)) {
        await ensureFileContent(file, true);
      }
    }

    updateBackendTask('workspace-sync', { label: summary });
    showToast(summary);
  } finally {
    finishBackendTask('workspace-sync');
    applyingWorkspaceChange = false;
  }
};


const handleSelectFile = async (file: FSItem) => {
  // 手动从文件树打开文件 = 离开教程流程：清除教程来源，
  // 否则「检查答案/返回教程」按钮会一直出现在之后打开的 tutorial_demo.py 上
  clearTutorialSource();
  await ensureFileContent(file, true);
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
    writeDiskFile(newFile, absPath(parentAbs, `/${name}`), newFile.content || '');
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
    nativeApi.createDir(parentAbs, name).then(noteSelfChange).catch(() => { });
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
  renameTabForFile(item, newName);

  // 原生工作区：重命名磁盘上的真实文件/文件夹
  if (workspaceRootPath.value) {
    nativeApi.renamePath(absPath(workspaceRootPath.value, oldPath), newName).then(noteSelfChange).catch(() => { });
  }
  showToast(t('toastRenamed'));
};

const confirmDelete = () => {
  if (deleteTargetItem.value) {
    const item = deleteTargetItem.value;
    // 原生工作区：先删除磁盘上的真实文件/文件夹
    if (workspaceRootPath.value) {
      nativeApi.deletePath(absPath(workspaceRootPath.value, item.path)).then(noteSelfChange).catch(() => { });
    }
    removeItemFromTree(workspaceItems.value, item.id);
    // Close tab if open
    closeTabForFileId(item.id);
    pythonRunner.syncFileSystem(workspaceItems.value);
    showToast(t('toastFileDeleted').replace('{name}', item.name));
  }
  isDeleteDialogOpen.value = false;
  deleteTargetItem.value = null;
};

// Run file directly from tree
const handleRunFile = async (item: FSItem) => {
  await ensureFileContent(item, true);
  openFileInTab(item);
  activeNavTab.value = 'explorer';

  consoleOutputs.value.push({
    id: uid(),
    type: 'system',
    text: `▶ Executing ${item.name} from File Tree...`,
    timestamp: new Date().toLocaleTimeString()
  });

  const runResult = await pythonRunner.runCode(item.content || '', workspaceItems.value, (out) => {
    consoleOutputs.value.push(out);
  }, config.value.demoMode);
  if (runResult.busy) showToast(t('toastRunnerBusy'));
};

// Download File
const handleDownloadFile = async (item: FSItem) => {
  await ensureFileContent(item, true);
  const content = item.content || '';

  // 桌面端：直接写到「下载」文件夹，并把实际保存路径告知用户
  if (nativeApi.available()) {
    try {
      const path = await nativeApi.exportFile(item.name, content);
      showToast(tf('toastExportedPath', { name: item.name, path }));
      return;
    } catch (err: any) {
      // 写盘失败（如无写权限）退回浏览器下载，保证导出仍可用且有反馈
      showToast(t('toastExportFailed') + (err?.message || err));
    }
  }

  // 浏览器：只能走 Blob 下载，落盘位置由浏览器决定
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toastExportedBrowser'));
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

// 教程/测验会话（useLearningSession）：来源 / 小节 / 通过态 / 缓冲区键 / 判分对比弹窗
const learning = useLearningSession({
  getActiveTab: () => activeTabObject.value,
  runCode: (code, files, onOut, demo) => pythonRunner.runCode(code, files, onOut, demo),
  getWorkspaceItems: () => workspaceItems.value,
  getDemoMode: () => config.value.demoMode,
  pushConsole: (out) => { consoleOutputs.value.push(out); },
  showToast,
  setActiveNavTab: (v: string) => { activeNavTab.value = v; },
  openQuizExternally: (topicId) => { tutorialViewRef.value?.openQuizExternally(topicId); },
  quizData: {
    getResult: (id, qid) => getQuizQuestionResult(id, qid),
    setResult: (id, qid, v) => setQuizQuestionResult(id, qid, v),
    syncCompletion: (id) => syncQuizCompletion(id)
  }
});
const {
  activeTutorialTopicId, activeQuizPassed, quizCompareDialog, quizCompareRows,
  isTutorialQuizMode, canReturnToTutorial,
  setTutorialTopicId, clearTutorialSource, beginTutorialLoad,
  handleCheckAnswerClick, handleTutorialBtnClick,
} = learning;

// Load tutorial code to editor：会话状态（来源/小节/通过态/缓冲区键）在 useLearningSession 设置，
// 本函数只负责 tutorial_demo.py 的工作区缓冲（落盘 + 开标签）
const handleLoadTutorialCodeToEditor = (payload: { code: string; topicId: string; topicTitle: string; isQuiz?: boolean; questionId?: string; expectedOutput?: string } | string) => {
  const { code, topicId, isQuiz, questionId, bufferKey, prevBufferKey } = beginTutorialLoad(payload);

  activeNavTab.value = 'explorer';
  let demoFile = workspaceItems.value.find((item) => item.name === 'tutorial_demo.py');
  const existingTab = demoFile ? openTabs.value.find((t) => t.fileId === demoFile.id) : undefined;
  // 同一道题重复载入（编辑器 ↔ 测验来回切换）时保留已写入的作答：
  // 用起始代码覆盖会把用户写好的答案改掉，之后的「检查答案」就会拿起始代码判分
  const keepAnswer = isQuiz && !!questionId && !!existingTab && prevBufferKey === bufferKey;

  if (!demoFile) {
    demoFile = {
      id: 'tutorial_demo_' + Date.now(),
      name: 'tutorial_demo.py',
      path: '/tutorial_demo.py',
      isFolder: false,
      content: code
    };
    workspaceItems.value.push(demoFile);
  }
  if (!keepAnswer) {
    demoFile.content = code;
    // 本地工作区：把 tutorial_demo.py 落盘，保证重启后仍在工作区里
    if (workspaceRootPath.value) {
      writeDiskFile(demoFile, absPath(workspaceRootPath.value, '/tutorial_demo.py'), code);
    }
    // 同步到已打开的标签页，编辑器立即显示最新代码（新题载入强制覆盖，不保留旧作答）
    if (existingTab) refreshTabContent(demoFile, code, true);
  }
  openFileInTab(demoFile);
  showToast(keepAnswer ? t('toastTutorialCodeKept') : t('toastTutorialCodeLoaded'));
};

const tutorialViewRef = ref<InstanceType<typeof TutorialView> | null>(null);

// 格式化（补空格 + 按 Python 语法重排缩进）只对 .py 生效：其它文件按 Python 规则改会破坏正文
const canFormatDoc = computed(() => !!activeTabObject.value?.name.endsWith('.py'));

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
  <div class="app-container">
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
            <m3e-menu-item @click="sendEditorCommand('copy')">
              <span slot="icon" class="material-symbols-rounded">content_copy</span>
              {{ t('copy') }}
            </m3e-menu-item>
            <m3e-menu-item @click="sendEditorCommand('cut')">
              <span slot="icon" class="material-symbols-rounded">content_cut</span>
              {{ t('cut') }}
            </m3e-menu-item>
            <m3e-menu-item @click="sendEditorCommand('paste')">
              <span slot="icon" class="material-symbols-rounded">content_paste</span>
              {{ t('paste') }}
            </m3e-menu-item>
            <m3e-divider></m3e-divider>
            <m3e-menu-item @click="sendEditorCommand('find')">
              <span slot="icon" class="material-symbols-rounded">search</span>
              {{ t('find') }}
            </m3e-menu-item>
            <m3e-menu-item @click="sendEditorCommand('replace')">
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
        <!-- 后台任务指示器按钮：标题栏居中常驻；点击弹出弹窗查看各任务状态与进度 -->
        <div class="titlebar-center">
          <button id="backend-status-trigger" class="titlebar-backend-status" type="button"
            :title="t('backendTasksTitle')" @click="isBackendTasksOpen = true">
            <m3e-loading-indicator v-show="backendBusy" class="titlebar-loading-indicator"></m3e-loading-indicator>
            <span class="titlebar-status-text">{{ backendStatus || t('statusIdle') }}{{ backendProgressSuffix }}</span>
          </button>
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
        <!-- 网页端环境提示条（FR-6.8）：非 Tauri 环境明示数据仅存本浏览器 -->
        <div v-if="isWebEnv" class="web-env-banner">
          <span class="material-symbols-rounded web-env-icon">info</span>
          <span>{{ t('webEnvBanner') }}</span>
        </div>
        <!-- Editor Action Toolbar：编辑器视图下始终可见；未打开文件时各按钮禁用 -->
        <div v-if="activeNavTab === 'explorer'" class="editor-toolbar">
          <div class="toolbar-group">
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

            <m3e-icon-button size="extra-small" class="marginBtn" :disabled="!editorUndoState.canUndo"
              :title="t('undoTitle')" @click="codeEditorRef?.undo()">
              <span class="material-symbols-rounded">undo</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!editorUndoState.canRedo" :title="t('redoTitle')"
              @click="codeEditorRef?.redo()">
              <span class="material-symbols-rounded">redo</span>
            </m3e-icon-button>

          </div>

          <div class="toolbar-group">
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
              @click="sendEditorCommand('find')">
              <span class="material-symbols-rounded">search</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!activeTabObject" :title="t('replace')"
              @click="sendEditorCommand('replace')">
              <span class="material-symbols-rounded">find_replace</span>
            </m3e-icon-button>
            <m3e-icon-button size="extra-small" :disabled="!canFormatDoc" :title="t('formatDoc')"
              @click="codeEditorRef?.formatDocument()">
              <span class="material-symbols-rounded">bolt_boost</span>
            </m3e-icon-button>
          </div>

          <div class="toolbar-group">
            <!-- 运行 / 停止：停止按钮只在当前后端可中断时出现（演示引擎瞬时执行且不可中断，不显示停止） -->
            <template v-if="pythonRunner.isRunning.value && pythonRunner.capabilities.value.interrupt !== 'none'">
              <m3e-button variant="text" size="extra-small" class="stopBtn" width="wide"
                :title="t('stopCode')" @click="codeEditorRef?.stopCode()">
                <span slot="icon" class="material-symbols-rounded">stop</span>
                {{ t('stopCode') }}
              </m3e-button>
            </template>
            <template v-else>
              <m3e-button variant="text" size="extra-small" class="runBtn" width="wide"
                :disabled="!activeTabObject" :title="t('runCode')" @click="codeEditorRef?.runCode()">
                <span slot="icon" class="material-symbols-rounded">play_arrow</span>
                {{ t('runCode') }}
              </m3e-button>
            </template>

            <!-- 解释器版本管理器：点击按钮弹出选择弹窗（文字超长省略） -->
            <m3e-button size="extra-small" class="interpreter-btn marginBtn" @click="isInterpreterOpen = true">
              <span slot="trailing-icon" class="material-symbols-rounded">keyboard_arrow_down</span>
              <span class="interpreter-btn-label">{{ engineLabel || t('engineLabelDefault') }}</span>
            </m3e-button>
          </div>
          <!-- 检查答案 / 返回教程：始终显示，无教程上下文时禁用（原为 v-if 隐藏） -->
          <div class="toolbar-group">
            <m3e-button size="extra-small" variant="text" class="answerBtn" :class="{ 'is-passed': activeQuizPassed }"
              :disabled="!isTutorialQuizMode" @click="handleCheckAnswerClick">
              <span slot="icon" class="material-symbols-rounded">{{ activeQuizPassed ? 'check_circle' : 'task_alt'
              }}</span>
              {{ activeQuizPassed ? t('quizAnswerCorrectDesc') : t('checkAnswer') }}
            </m3e-button>
            <m3e-button size="extra-small" variant="text" class="tutorBtn" :disabled="!canReturnToTutorial"
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
              {{ t('cursorPositionText').replace('{line}', String(editorCursor.line)).replace('{col}',
                String(editorCursor.col)) }}
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
                @run-file="handleRunFile" @download-file="handleDownloadFile" @show-toast="showToast"
                @contextmenu-filetree="(e, item) => openContextMenu(e, 'filetree', item)" />
            </m3e-card>

            <!-- 代码编辑区域 / 终端区域（编辑区 75% / 终端 25%，受控绑定：拖拽比例随窗口变化保持） -->
            <m3e-split-pane ref="innerSplitPaneRef" slot="end" :value="innerSplitValue" :max="innerSplitMax"
              orientation="vertical" @input="onInnerSplitInput">
              <m3e-card slot="start">
                <CodeEditor ref="codeEditorRef" :tabs="openTabs" :active-tab-id="activeEditorTabId" :config="config"
                  :workspace-files="workspaceItems" :code-theme="resolvedCodeTheme" :initial-cursors="sessionCursors"
                  :command="editorCommand" @undo-state="editorUndoState = $event" @copy-result="handleEditorCopyResult"
                  @cursor-change="onEditorCursorChange" @select-tab="handleSelectTab" @close-tab="handleCloseTab"
                  @content-change="handleContentChange" @save-tab="handleSaveTab"
                  @add-console-output="out => consoleOutputs.push(out)"
                  @contextmenu-editor="e => openContextMenu(e, 'editor')" @jump-to-file="handleJumpToSearchResult"
                  @show-toast="showToast" />
              </m3e-card>

              <m3e-card slot="end" class="terminal-card">
                <TerminalPanel :outputs="consoleOutputs" :code-theme="resolvedCodeTheme" :demo-mode="!!config.demoMode"
                  @clear="consoleOutputs = []" @add-console-output="out => consoleOutputs.push(out)"
                  @add-log="out => replLogs.push(out)"
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
            @update-active-topic="setTutorialTopicId"
            @load-code-to-editor="handleLoadTutorialCodeToEditor"
            @contextmenu-tutorial="e => openContextMenu(e, 'tutorial')" />

          <!-- Interactive Python REPL Console View -->
          <REPLConsole v-else-if="activeNavTab === 'console'" :config="config" :logs="replLogs"
            :code-theme="resolvedCodeTheme" @add-log="out => replLogs.push(out)" @clear-logs="replLogs = []"
            @add-console-output="out => consoleOutputs.push(out)"
            @contextmenu-terminal="e => openContextMenu(e, 'terminal', null, 'repl')" />

          <!-- Package Manager View -->
          <PackageManager v-else-if="activeNavTab === 'packages'" :workspace-files="workspaceItems"
            @add-console-output="out => consoleOutputs.push(out)" @show-toast="showToast" />

          <!-- Settings View -->
          <SettingsView v-else-if="activeNavTab === 'settings'" :config="config" />
        </main>
      </div>
    </div>

    <!-- App Initialization Loading Modal -->
    <MD3LoadingModal :show="isInitializing" :status="loadingStatus" />

    <!-- Snackbar Notification Toast -->
    <m3e-snackbar class="app-snackbar" :open="!!toastMessage" :duration="snackbarDuration"
      @toggle="handleSnackbarToggle">
      {{ toastMessage }}
    </m3e-snackbar>

    <!-- 后台任务 Dialog：点击标题栏状态栏弹出，查看各后台任务的状态与进度 -->
    <m3e-dialog :open="isBackendTasksOpen" @cancel="isBackendTasksOpen = false" @closed="isBackendTasksOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">sync</span>
        <span class="m3e-dialog-title">{{ t('backendTasksTitle') }}</span>
      </span>
      <div class="backend-task-panel">
        <div v-if="visibleBackendTasks.length === 0" class="backend-task-empty">{{ t('backendTasksEmpty') }}</div>
        <div v-for="task in visibleBackendTasks" :key="task.id" class="backend-task-row">
          <div class="backend-task-item">
            <span class="backend-task-dot" :class="`is-${task.status}`"></span>
            <span class="backend-task-label">{{ task.label }}</span>
            <span class="backend-task-status">{{ task.status === 'running' && typeof task.progress === 'number' ?
              `${task.progress}%` : backendTaskStatusText(task.status) }}</span>
          </div>
          <!-- 只用真实进度：拿到百分比才显示进度条（组件库自带 progressbar 角色与 M3 配色） -->
          <m3e-linear-progress-indicator v-if="task.status === 'running' && typeof task.progress === 'number'"
            class="backend-task-progress" :value="task.progress"></m3e-linear-progress-indicator>
        </div>
      </div>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="filled" size="small" @click="isBackendTasksOpen = false">{{ t('closeTitle') }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- Delete Confirmation Dialog -->
    <m3e-dialog :open="isDeleteDialogOpen" @cancel="isDeleteDialogOpen = false" @closed="isDeleteDialogOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon is-danger">warning</span>
        <span class="m3e-dialog-title">{{ t('confirmDeleteTitle') }}</span>
      </span>
      <p class="m3e-dialog-desc">{{ deleteConfirmMsg }}</p>
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

    <!-- 保存冲突 Dialog：磁盘文件已被外部修改（NFR-5.4） -->
    <m3e-dialog :open="!!conflictState" @cancel="handleConflictCancel" @closed="handleConflictCancel">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon is-danger">sync_problem</span>
        <span class="m3e-dialog-title">{{ t('conflictTitle') }}</span>
      </span>
      <p class="m3e-dialog-desc">{{ tf('conflictMsg', { name: conflictState?.name || '' }) }}</p>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="text" size="small" @click="handleConflictCancel">{{ t('cancel') }}</m3e-button>
        <m3e-button variant="filled" size="small" @click="handleConflictOverwrite">{{ t('conflictOverwrite')
        }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- 运行前依赖确认 Dialog：代码引用了未安装的第三方包（安装后自动继续运行） -->
    <m3e-dialog :open="!!pendingDependencies" @cancel="resolveInstallConfirm(false)"
      @closed="resolveInstallConfirm(false)">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">download</span>
        <span class="m3e-dialog-title">{{ t('depsConfirmTitle') }}</span>
      </span>
      <p class="m3e-dialog-desc">{{ tf('depsConfirmMsg', { packages: (pendingDependencies || []).join('、') }) }}</p>
      <p class="m3e-dialog-desc">{{ t('pkgConfirmRisk') }}</p>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="text" size="small" @click="resolveInstallConfirm(false)">{{ t('cancel') }}</m3e-button>
        <m3e-button variant="filled" size="small" @click="resolveInstallConfirm(true)">{{ t('depsConfirmInstall')
        }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- 解释器版本管理器 Dialog -->
    <m3e-dialog :open="isInterpreterOpen" @cancel="isInterpreterOpen = false" @closed="isInterpreterOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">terminal</span>
        <span class="m3e-dialog-title">{{ t('interpreter') }}</span>
      </span>
      <div class="interpreter-dialog-body">
        <p class="interpreter-current-status">
          {{ interpreterError || engineLabel || t('engineLabelDefault') }}
        </p>

        <m3e-select class="theme-select" @change="onInterpreterDialogChange">
          <m3e-option value="auto" :selected="!config.interpreter || config.interpreter === 'auto'">
            {{ t('interpreterAuto') }}
          </m3e-option>
          <m3e-option value="pyodide" :selected="config.interpreter === 'pyodide'">
            {{ t('interpreterPyodide') }}
          </m3e-option>
          <m3e-optgroup>
            <span slot="label">{{ t('interpreterLocal') }}</span>
            <m3e-option v-for="v in nativePython.versions.value" :key="v.id" :value="v.id"
              :selected="config.interpreter === v.id">
              <span class="interp-option">
                <span>{{ v.label }}</span>
                <span v-if="v.path" class="interp-path">{{ v.path }}</span>
              </span>
            </m3e-option>
          </m3e-optgroup>
        </m3e-select>
      </div>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="outlined" size="small" @click="handleAddInterpreter">
          <span slot="icon" class="material-symbols-rounded">add</span>
          {{ t('interpreterAdd') }}
        </m3e-button>
        <m3e-button variant="filled" size="small" @click="isInterpreterOpen = false">{{ t('helpGotIt') }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- 测验输出对比 Dialog（FR-6.5：完整期望 vs 实际，逐行高亮差异） -->
    <m3e-dialog :open="quizCompareDialog.isOpen" @cancel="quizCompareDialog.isOpen = false"
      @closed="quizCompareDialog.isOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">task_alt</span>
        <span class="m3e-dialog-title">{{ t('quizCompareTitle') }}</span>
      </span>
      <div class="quiz-compare-body">
        <div class="quiz-compare-col">
          <p class="quiz-compare-col-title">{{ t('quizExpectedTitle') }}</p>
          <div class="quiz-compare-lines">
            <div v-for="row in quizCompareRows" :key="row.i" :class="['quiz-compare-line', { diff: row.diff }]">
              <span class="quiz-compare-ln">{{ row.i + 1 }}</span>
              <span class="quiz-compare-txt">{{ row.expected }}</span>
            </div>
          </div>
        </div>
        <div class="quiz-compare-col">
          <p class="quiz-compare-col-title">{{ t('quizActualTitle') }}</p>
          <div class="quiz-compare-lines">
            <div v-for="row in quizCompareRows" :key="row.i" :class="['quiz-compare-line', { diff: row.diff }]">
              <span class="quiz-compare-ln">{{ row.i + 1 }}</span>
              <span class="quiz-compare-txt">{{ row.actual }}</span>
            </div>
          </div>
        </div>
      </div>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="filled" size="small" @click="quizCompareDialog.isOpen = false">{{ t('helpGotIt')
        }}</m3e-button>
      </div>
    </m3e-dialog>

    <!-- 首次启动欢迎引导 Dialog（FR-1.4） -->
    <m3e-dialog :open="isWelcomeOpen" @cancel="isWelcomeOpen = false" @closed="isWelcomeOpen = false">
      <span slot="header" class="m3e-dialog-title-row">
        <span class="material-symbols-rounded m3e-dialog-icon">school</span>
        <span class="m3e-dialog-title">{{ t('welcomeDialogTitle') }}</span>
      </span>
      <m3e-content-pane class="help-dialog-body">
        <div class="help-dialog-inner">
          <p class="m3e-dialog-desc">{{ t('welcomeDialogText') }}</p>
        </div>
      </m3e-content-pane>
      <div slot="actions" class="m3e-dialog-actions">
        <m3e-button variant="text" size="small" @click="isWelcomeOpen = false">{{ t('enterWorkspace')
        }}</m3e-button>
        <m3e-button variant="filled" size="small" @click="startTutorial">{{ t('startLearning') }}</m3e-button>
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
      @copy="handleContextMenuCopy" @cut="sendEditorCommand('cut')" @paste="sendEditorCommand('paste')"
      @find="sendEditorCommand('find')" @replace="sendEditorCommand('replace')"
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
  --titlebar-height: 32px;
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
  background-color: var(--surface-container);
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
  height: var(--titlebar-height);
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
  /* 与标题栏同高：高出来的部分会让三个按钮的 hover/点击区压到标题栏下面的正文上 */
  height: var(--titlebar-height);
  z-index: 35000;
}

/* 标题栏中央承载层：用 flex 居中，不用 transform——
   m3e 的浮层锚定走 offsetLeft/offsetTop（不含 transform），带位移的按钮会让
   后台任务列表浮层整体偏掉半个按钮宽度，文字越长偏得越多 */
.titlebar-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* 后台服务状态指示器：自绘小加载器 + 状态小字，常驻显示 */
.titlebar-backend-status {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  user-select: none;
  white-space: nowrap;

  /* 按钮样式：可点击弹出后台任务列表；标题栏是拖拽区，须 no-drag 才能接收点击 */
  padding: 2px 8px;
  font-family: inherit;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.titlebar-backend-status:hover {
  background-color: var(--surface-variant);
}

.titlebar-backend-status:active {
  background-color: color-mix(in srgb, var(--surface-variant) 70%, transparent);
}

/* rich-tooltip 内后台任务列表 */
.backend-task-panel {
  min-width: 15rem;
  padding: 2px 0;
}

.backend-task-empty {
  padding: 8px 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.backend-task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.75rem;
  color: var(--text-color);
}

.backend-task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.backend-task-dot.is-running {
  background-color: var(--primary);
  animation: backend-dot-pulse 1s ease-in-out infinite;
}

.backend-task-dot.is-done {
  background-color: var(--success);
}

.backend-task-dot.is-failed {
  background-color: var(--error);
}

@keyframes backend-dot-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.backend-task-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.backend-task-status {
  flex-shrink: 0;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

/* 安装等任务的真实进度条（M3 LinearProgressIndicator：4dp 高、全圆角、primary 活动段） */
/* 只是给它留位置：厚度/圆角/配色都由 m3e-linear-progress-indicator 自己的 token 决定 */
.backend-task-progress {
  display: block;
  margin: 2px 0 4px 16px;
}

/* 标题栏加载指示器：库默认容器 48px / 指示器 38px，放进 36px 标题栏会被裁切，
   这里按同比例缩到 16px / 13px 显示完整 */
.titlebar-loading-indicator {
  --m3e-loading-indicator-container-size: 16px;
  --m3e-loading-indicator-size: 13px;
  flex-shrink: 0;
}

.titlebar-status-text {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 18rem;
}


.app-layout-wrapper {
  width: 100%;
  height: calc(100vh - var(--titlebar-height));
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
  /* 与终端内部（面板/内容区/输入行 16px）同档，避免卡片圆角比内层小、露出灰边 */
  --m3e-card-shape: 16px;
}

.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* 全局 snackbar 层级保险：m3e-snackbar 使用 Popover API（top layer），
   显式抬高 z-index 确保不会被 dialog 遮罩/其他弹层盖住（判分失败对比弹窗场景） */
m3e-snackbar.app-snackbar {
  z-index: 40000;
}

/* 网页端环境提示条：无底色/无边框的纯文字信息条，不遮挡操作 */
.web-env-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0.4rem 0.4rem 0;
  padding: 6px 12px;
  font-size: 0.75rem;
  color: var(--text-color);
  flex-shrink: 0;
}

.web-env-icon {
  font-size: 1rem;
  color: var(--secondary);
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

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.1rem 0.8rem;
  margin-left: 0.8rem;
  background-color: var(--bg-color);
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

/* 版本管理器按钮：最长 16rem，文字超长省略 */
.interpreter-btn {
  max-width: 16rem;
}

.interpreter-btn-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* 测验已通过：按钮图标与文字变为主色，强化通过反馈 */
.answerBtn.is-passed {
  --m3e-button-icon-color: var(--primary);
  --m3e-button-label-text-color: var(--primary);
  --m3e-button-focus-icon-color: var(--primary);
  --m3e-button-focus-label-text-color: var(--primary);
}

.tutorBtn {
  --m3e-button-icon-color: var(--text-color);
  --m3e-button-label-text-color: var(--text-color);
  --m3e-button-focus-icon-color: var(--text-color);
  --m3e-button-focus-label-text-color: var(--text-color);
}

/* 解释器版本管理器弹窗：select 撑满、底部显示当前引擎状态 */
.interpreter-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 20rem;
}

.interpreter-dialog-body .theme-select {
  width: 100%;
}

.interpreter-current-status {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
}

/* 解释器选项样式在全局 m3eStyle.css（与设置页共用） */

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

/* 测验输出对比弹窗：上下两段（期望 / 实际）、行号对齐、差异行标红 */
.quiz-compare-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(100%, 64rem);
}

.quiz-compare-col {
  min-width: 0;
}

.quiz-compare-col-title {
  margin: 0 0 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.quiz-compare-lines {
  max-height: 26vh;
  overflow-y: auto;
  border: 1px solid var(--border-color-muted);
  border-radius: 8px;
  padding: 6px 0;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.quiz-compare-line {
  display: flex;
  gap: 8px;
  padding: 0 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.quiz-compare-line.diff {
  background-color: color-mix(in srgb, var(--error) 14%, transparent);
  color: var(--error);
}

.quiz-compare-ln {
  flex-shrink: 0;
  min-width: 2ch;
  text-align: right;
  color: var(--text-tertiary);
  user-select: none;
}

m3e-card {
  padding: 0;
}
</style>
