<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { EditorTab, ConsoleOutput, AppConfig, FSItem } from '../types';
import { pythonRunner } from '../utils/pythonRunner';
import { useI18n } from '../utils/i18n';
import { copyToClipboard, readClipboard } from '../utils/clipboard';
import { uid } from '../utils/id';
import { getCompletions, getWordAt, getUsage, collectWorkspaceIdentifiers, type CompletionItem } from '../utils/pythonCompletions';
import { hljs } from '../utils/highlightSetup';
import { formatCodeText } from '../utils/codeFormat';
import { backspaceIndent, indentForNewLine, indentLines, isInsideStringAt, outdentLines, reindentText, stringAndCommentRanges } from '../utils/pythonIndent';
import 'highlight.js/styles/github-dark.css';

const { t, tf } = useI18n();


const props = defineProps<{
  tabs: EditorTab[];
  activeTabId: string | null;
  config: AppConfig;
  workspaceFiles: FSItem[];
  codeTheme?: string; // 已解析的代码主题（'system' 由 App.vue 映射为具体主题）
  initialCursors?: Record<string, { line: number; col: number }>;
  // App 侧命令通道（批次 4）：标题栏/工具栏/右键菜单经 command prop 触发编辑器内部动作
  command?: { cmd: string; arg?: unknown; seq: number } | null;
}>();

const emit = defineEmits<{
  (e: 'select-tab', tabId: string): void;
  (e: 'close-tab', tabId: string): void;
  (e: 'content-change', tabId: string, newContent: string): void;
  (e: 'save-tab', tabId: string): void;
  (e: 'add-console-output', output: ConsoleOutput): void;
  (e: 'contextmenu-editor', event: MouseEvent): void;
  (e: 'cursor-change', payload: { path: string; line: number; col: number }): void;
  (e: 'show-toast', msg: string): void;
  (e: 'jump-to-file', payload: { file: FSItem; line: number }): void;
  (e: 'undo-state', state: { canUndo: boolean; canRedo: boolean }): void;
  (e: 'copy-result', ok: boolean): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const lineNumbersRef = ref<HTMLDivElement | null>(null);
const codeHighlightRef = ref<HTMLPreElement | null>(null);

// 运行会话状态由门面统一维护（阶段 3）：三个运行入口共用 pythonRunner.isRunning
const isExecuting = computed(() => pythonRunner.isRunning.value);
const cursorLine = ref(1);
const cursorCol = ref(1);

const activeTab = computed(() => {
  return props.tabs.find((t) => t.id === props.activeTabId) || null;
});

// Detect language from file extension
const getLanguage = (fileName: string) => {
  if (!fileName) return 'python';
  if (fileName.endsWith('.py')) return 'python';
  if (fileName.endsWith('.js')) return 'javascript';
  if (fileName.endsWith('.ts')) return 'typescript';
  if (fileName.endsWith('.json')) return 'json';
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) return 'xml';
  if (fileName.endsWith('.css')) return 'css';
  if (fileName.endsWith('.md')) return 'markdown';
  return 'python';
};

const getTabIcon = (fileName: string) => {
  if (!fileName) return 'code_blocks';
  const lower = fileName.toLowerCase();
  if (
    lower.endsWith('.py') ||
    lower.endsWith('.js') ||
    lower.endsWith('.ts') ||
    lower.endsWith('.json') ||
    lower.endsWith('.html') ||
    lower.endsWith('.css')
  ) {
    return 'code_blocks';
  }
  return 'text_snippet';
};

// Offline syntax highlighting computed property
const highlightedCode = computed(() => {
  if (!activeTab.value) return '';
  const lang = getLanguage(activeTab.value.name);
  const code = activeTab.value.content || '';
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value + '\n';
    }
    return hljs.highlightAuto(code).value + '\n';
  } catch (e) {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
  }
});

// Line numbers generation
const linesCount = computed(() => {
  if (!activeTab.value) return 1;
  return activeTab.value.content.split('\n').length || 1;
});

// 行号列宽度随字号与最大行号位数自适应：
// 等宽字体约 0.6em/字符，宽度向右扩张（行号文字保持右对齐贴列右缘），
// 避免字体过大时行号被裁剪遮挡；最小保持 48px 与原有默认一致
const lineNumberColumnWidth = computed(() => {
  const digits = Math.max(2, String(linesCount.value).length);
  const perDigit = (props.config.fontSize || 15) * 0.6;
  return `${Math.max(48, Math.ceil(digits * perDigit) + 14)}px`;
});

// Line numbers that match find text
const matchedLineNumbers = computed(() => {
  const set = new Set<number>();
  if (!showFindBar.value || !findText.value || !activeTab.value) return set;
  const lines = activeTab.value.content.split('\n');
  const query = findText.value.toLowerCase();
  lines.forEach((lineText, idx) => {
    if (lineText.toLowerCase().includes(query)) {
      set.add(idx + 1);
    }
  });
  return set;
});

/* ---- VS Code 风格自定义滚动条 ----
   原生滚动条在 WebView2 中不可靠（::-webkit-scrollbar 伪元素路径失效、标准通道
   无法控制透明度/自动隐藏），隐藏原生条后用 JS 驱动自绘条：thumb 位置/尺寸跟随
   滚动；滚动中（is-visible，防抖 800ms）或悬停时显示，透明度 0.3，停止后淡出 */
const vScrollbarRef = ref<HTMLElement | null>(null);
const vScrollThumbRef = ref<HTMLElement | null>(null);
const hScrollbarRef = ref<HTMLElement | null>(null);
const hScrollThumbRef = ref<HTMLElement | null>(null);
let scrollbarHideTimer: any = null;

const updateScrollbarGeometry = () => {
  const el = textareaRef.value;
  if (!el) return;

  // 垂直条：thumb 高度 = 视口比例，位置 = 滚动比例
  const vTrack = vScrollbarRef.value;
  const vThumb = vScrollThumbRef.value;
  if (vTrack && vThumb) {
    const canV = el.scrollHeight > el.clientHeight;
    vTrack.style.visibility = canV ? 'visible' : 'hidden';
    if (canV) {
      const trackH = vTrack.clientHeight;
      const thumbH = Math.max(32, (el.clientHeight / el.scrollHeight) * trackH);
      const maxScroll = el.scrollHeight - el.clientHeight;
      vThumb.style.height = `${thumbH}px`;
      vThumb.style.top = `${(el.scrollTop / maxScroll) * (trackH - thumbH)}px`;
    }
  }

  // 水平条
  const hTrack = hScrollbarRef.value;
  const hThumb = hScrollThumbRef.value;
  if (hTrack && hThumb) {
    const canH = el.scrollWidth > el.clientWidth;
    hTrack.style.visibility = canH ? 'visible' : 'hidden';
    if (canH) {
      const trackW = hTrack.clientWidth;
      const thumbW = Math.max(32, (el.clientWidth / el.scrollWidth) * trackW);
      const maxScroll = el.scrollWidth - el.clientWidth;
      hThumb.style.width = `${thumbW}px`;
      hThumb.style.left = `${(el.scrollLeft / maxScroll) * (trackW - thumbW)}px`;
    }
  }
};

// 滚动期间显示滚动条（键盘方向键滚动同样触发 scroll 事件），停止后淡出
const showScrollbars = () => {
  vScrollbarRef.value?.classList.add('is-visible');
  hScrollbarRef.value?.classList.add('is-visible');
  clearTimeout(scrollbarHideTimer);
  scrollbarHideTimer = setTimeout(() => {
    vScrollbarRef.value?.classList.remove('is-visible');
    hScrollbarRef.value?.classList.remove('is-visible');
  }, 800);
};

// 点击轨道跳转 / 按住 thumb 拖动：指针位置映射为 scrollTop/scrollLeft
const startScrollDrag = (e: PointerEvent, axis: 'vertical' | 'horizontal') => {
  const el = textareaRef.value;
  const track = axis === 'vertical' ? vScrollbarRef.value : hScrollbarRef.value;
  const thumb = axis === 'vertical' ? vScrollThumbRef.value : hScrollThumbRef.value;
  if (!el || !track || !thumb) return;
  e.preventDefault();

  const scrollToPointer = (ev: PointerEvent) => {
    const rect = track!.getBoundingClientRect();
    if (axis === 'vertical') {
      const thumbH = thumb!.offsetHeight;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const ratio = maxScroll > 0 ? (ev.clientY - rect.top - thumbH / 2) / (rect.height - thumbH) : 0;
      el.scrollTop = Math.max(0, Math.min(1, ratio)) * maxScroll;
    } else {
      const thumbW = thumb!.offsetWidth;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const ratio = maxScroll > 0 ? (ev.clientX - rect.left - thumbW / 2) / (rect.width - thumbW) : 0;
      el.scrollLeft = Math.max(0, Math.min(1, ratio)) * maxScroll;
    }
  };

  scrollToPointer(e); // 点击即跳转
  const move = (ev: PointerEvent) => scrollToPointer(ev);
  const up = () => {
    track!.classList.remove('is-dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  track.classList.add('is-dragging');
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
};

// Sync scrolling between textarea, line numbers, and highlight layer
const handleScroll = () => {
  hideHoverTooltip(); // 滚动时悬停提示位置失效，直接隐藏
  // 补全弹层锚定在光标处：跟随滚动重算坐标（不重算会浮在错误位置，direction 键仍被吞）
  if (completionVisible.value && textareaRef.value) {
    completionPos.value = computePopupPosition(textareaRef.value.selectionStart);
  }
  if (textareaRef.value) {
    if (lineNumbersRef.value) {
      lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop;
    }
    if (codeHighlightRef.value) {
      codeHighlightRef.value.scrollTop = textareaRef.value.scrollTop;
      codeHighlightRef.value.scrollLeft = textareaRef.value.scrollLeft;
    }
    if (warningRef.value) {
      warningRef.value.scrollTop = textareaRef.value.scrollTop;
      warningRef.value.scrollLeft = textareaRef.value.scrollLeft;
    }
    updateScrollbarGeometry();
    showScrollbars();
  }
};

// 内容 / 字号 / 主题变化后重算滚动条几何
watch(
  () => [props.config?.fontSize, props.config?.tabSize, props.codeTheme || props.config?.codeTheme, activeTab.value?.content],
  () => nextTick(updateScrollbarGeometry)
);

// Track cursor position
const updateCursorPosition = () => {
  if (!textareaRef.value) return;
  const text = textareaRef.value.value;
  const selStart = textareaRef.value.selectionStart;

  const lines = text.substring(0, selStart).split('\n');
  cursorLine.value = lines.length;
  cursorCol.value = lines[lines.length - 1].length + 1;

  // 记录到内存并（防抖）上报，用于会话恢复
  const tab = activeTab.value;
  if (tab) {
    cursorMemory.value[tab.path] = { line: cursorLine.value, col: cursorCol.value };
    scheduleCursorSave(tab.path, cursorLine.value, cursorCol.value);
  }

  // 光标已离开补全词尾：关闭弹层（点击别处、Home/End、左右键都会走到这里）
  if (completionVisible.value && !isCompletionRangeCurrent()) closeCompletions();
};

/* ==================== 行号点选整行 ==================== */
// 与常见 IDE 一致：点行号选中整行，按住拖动按行扩展（Shift + 点从当前行扩选）
let lineDragAnchor = 0;        // 拖动起点行（1 基）
let lineDragging = false;

const editorLineHeight = () => (props.config.fontSize || 15) * 1.5;

// 每行起始处的字符偏移（用于把行号换算成 textarea 的选区）
const lineStartOffsets = (text: string): number[] => {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') offsets.push(i + 1);
  }
  return offsets;
};

// 选中 [from, to] 覆盖的整行：含行尾换行（末行无换行时到文本末尾），
// 这样复制多行得到的是完整行，粘贴进新文件不会粘连
const selectLineRange = (from: number, to: number) => {
  const el = textareaRef.value;
  if (!el) return;
  const text = el.value;
  const offsets = lineStartOffsets(text);
  const last = offsets.length;
  const startLine = Math.min(Math.max(1, Math.min(from, to)), last);
  const endLine = Math.min(Math.max(1, Math.max(from, to)), last);
  const selStart = offsets[startLine - 1];
  const selEnd = endLine < last ? offsets[endLine] : text.length;

  el.focus();
  el.setSelectionRange(selStart, selEnd);
  updateCursorPosition();
};

// 指针落在第几行：行号列与正文行高一致（1.5 倍字号），每行一个显示行（正文不折行）
const lineAtPointerY = (clientY: number): number => {
  const col = lineNumbersRef.value;
  if (!col) return 1;
  const rect = col.getBoundingClientRect();
  const padTop = parseFloat(getComputedStyle(col).paddingTop) || 0;
  const offsetY = clientY - rect.top - padTop + col.scrollTop;
  const line = Math.floor(offsetY / editorLineHeight()) + 1;
  return Math.min(Math.max(1, line), linesCount.value);
};

const handleLineSelectMove = (e: MouseEvent) => {
  if (!lineDragging) return;
  e.preventDefault();
  selectLineRange(lineDragAnchor, lineAtPointerY(e.clientY));
};

const stopLineSelect = () => {
  lineDragging = false;
  document.removeEventListener('mousemove', handleLineSelectMove);
  document.removeEventListener('mouseup', stopLineSelect);
};

const startLineSelect = (e: MouseEvent, line: number) => {
  if (e.button !== 0) return;
  e.preventDefault(); // 别让行号列开始原生文本选择
  if (e.shiftKey) {
    // Shift + 点：从当前所在行扩选到点的这一行
    lineDragAnchor = cursorLine.value;
    selectLineRange(lineDragAnchor, line);
    return;
  }
  lineDragAnchor = line;
  lineDragging = true;
  selectLineRange(line, line);
  document.addEventListener('mousemove', handleLineSelectMove);
  document.addEventListener('mouseup', stopLineSelect);
};

/* ==================== 光标位置记忆 / 会话恢复 ==================== */
const cursorMemory = ref<Record<string, { line: number; col: number }>>({});
let cursorSaveTimer: any = null;

// 启动时用上次会话的光标位置填充记忆
watch(
  () => props.initialCursors,
  (val) => {
    if (val) Object.assign(cursorMemory.value, val);
  },
  { deep: true, immediate: true }
);

const scheduleCursorSave = (path: string, line: number, col: number) => {
  clearTimeout(cursorSaveTimer);
  cursorSaveTimer = setTimeout(() => {
    emit('cursor-change', { path, line, col });
  }, 400);
};

// 把 line/col 换算成选区偏移并滚动到可视区
const applyCursor = (line: number, col: number) => {
  const el = textareaRef.value;
  if (!el) return;
  const lines = el.value.split('\n');
  const targetLine = Math.max(1, Math.min(line, lines.length));
  let offset = 0;
  for (let i = 0; i < targetLine - 1; i++) offset += (lines[i]?.length ?? 0) + 1;
  const targetCol = Math.max(1, col);
  offset += Math.min(targetCol - 1, lines[targetLine - 1]?.length ?? 0);
  el.setSelectionRange(offset, offset);
  const fontSize = parseFloat(getComputedStyle(el).fontSize) || 15;
  el.scrollTop = Math.max(0, (targetLine - 3) * fontSize * 1.5);
  updateCursorPosition();
};

const restoreCursorForTab = (path: string) => {
  const mem = cursorMemory.value[path];
  if (mem) {
    nextTick(() => applyCursor(mem.line, mem.col));
  }
};

// 切换标签页时恢复该文件的记忆光标位置
watch(
  () => props.activeTabId,
  () => {
    const tab = activeTab.value;
    if (tab) restoreCursorForTab(tab.path);
  },
  { immediate: true }
);

// Handle Tab key, Enter key auto-indentation, and shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if (!activeTab.value || !textareaRef.value) return;
  // 输入法组合期间（如中文选词）不接管任何按键，否则回车选词会被当成接受补全
  if (e.isComposing) return;

  // 补全弹层打开时的键位：↑↓ 选择 / Enter、Tab 确认 / Esc 关闭。
  // 只接管无修饰键的按键——Shift+方向键（扩选）、Ctrl+方向键（按词移动）、Shift+Enter 等交回编辑器原生行为。
  // 光标已离开补全词尾（鼠标点击、Home/End、左右键）或列表为空时弹层视为失效：
  // 先关闭再让按键走默认处理，避免「看不见的弹层吞掉方向键」。
  if (completionVisible.value) {
    const plain = !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;
    const stale = completionItems.value.length === 0 || !isCompletionRangeCurrent();
    if (stale) {
      closeCompletions();
    } else if (plain && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const total = completionItems.value.length;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      completionIndex.value = (completionIndex.value + step + total) % total;
      return;
    } else if (plain && (e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault();
      acceptCompletion();
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCompletions();
      return;
    }
  }

  // Ctrl+Z / Cmd+Z => 撤回；Ctrl+Y、Ctrl+Shift+Z => 重做。
  // 必须自己接管：textarea 的值是 Vue 单向绑定（:value），每次程序化赋值都会让浏览器
  // 原生撤回栈失效，不接管的话 Ctrl+Z 完全没反应（工具栏按钮走的是同一套自建快照栈）。
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    const shortcut = e.key.toLowerCase();
    if (shortcut === 'z') {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
      return;
    }
    if (shortcut === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }
  }

  // Ctrl+Space / Cmd+Space => 主动唤起补全
  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
    e.preventDefault();
    openCompletions(true);
    return;
  }

  // 自动配对括号/引号（强制开启，不再读设置开关）
  if (PAIR_OPENS.has(e.key) || PAIR_CLOSERS.has(e.key)) {
    e.preventDefault();
    handleAutoPair(e.key);
    return;
  }

  // Ctrl+S / Cmd+S => Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    emit('save-tab', activeTab.value.id);
    return;
  }

  // Ctrl+F => Find
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    openFindBar();
    return;
  }

  // Ctrl+H => Replace
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault();
    openReplaceBar();
    return;
  }

  // Ctrl+Enter / Cmd+Enter => Run Code
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleRunCode();
    return;
  }

  // Shift+Alt+F => 格式化文档（与 VS Code 一致）
  if (e.shiftKey && e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    formatDocument();
    return;
  }

  const el = textareaRef.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;

  // 轻量自动补空格：运算符两侧、逗号/冒号后（字符串内不处理）
  if (!e.shiftKey && AUTO_SPACE_KEYS.has(e.key) && start === end && !isInsideStringAt(val, start, tabSize())) {
    if (maybeAutoSpace(e, val, start)) return;
  }

  // Backspace => 光标在行首空白里时删掉一整级缩进（而不是一个空格）
  if (e.key === 'Backspace') {
    const result = backspaceIndent(val, start, end, tabSize());
    if (result) {
      e.preventDefault();
      emit('content-change', activeTab.value.id, result.content);
      nextTick(() => {
        el.selectionStart = el.selectionEnd = result.start;
        updateCursorPosition();
      });
      return;
    }
  }

  // Tab / Shift+Tab => 缩进 / 反缩进当前行或选中的若干行
  if (e.key === 'Tab') {
    e.preventDefault();
    const result = e.shiftKey
      ? outdentLines(val, start, end, tabSize())
      : indentLines(val, start, end, tabSize());
    emit('content-change', activeTab.value.id, result.content);
    nextTick(() => {
      el.selectionStart = result.start;
      el.selectionEnd = result.end;
      updateCursorPosition();
    });
    return;
  }

  // Enter Key => 新行缩进由语法树决定（块体、续行对齐、else/except 回归都对）
  if (e.key === 'Enter') {
    e.preventDefault();
    // 查询用「换行尚未插入」的文档：换行已存在时末尾空行会被语法树判为块外
    const docForIndent = start === end ? val : val.substring(0, start) + val.substring(end);
    const indent = ' '.repeat(indentForNewLine(docForIndent, start, tabSize()));
    const newContent = val.substring(0, start) + '\n' + indent + val.substring(end);
    emit('content-change', activeTab.value.id, newContent);

    nextTick(() => {
      el.selectionStart = el.selectionEnd = start + 1 + indent.length;
      updateCursorPosition();
    });
    return;
  }
};

const handleInput = (e: Event) => {
  if (!activeTab.value) return;
  const target = e.target as HTMLTextAreaElement;
  emit('content-change', activeTab.value.id, target.value);
  updateCursorPosition();
  openCompletions(false);
};

/* ==================== 代码补全（轻量词法级） ==================== */
const completionItems = ref<CompletionItem[]>([]);
const completionIndex = ref(0);
const completionVisible = ref(false);
const completionPos = ref({ left: 0, top: 0 });
const completionRange = ref({ start: 0, end: 0 });
const completionListRef = ref<HTMLElement | null>(null);
const activeCompletionItemRef = ref<HTMLElement | null>(null);

// 弹层生命周期内光标应停在补全词尾：离开该位置（鼠标点击、Home/End、左右键、扩选）即视为失效
const isCompletionRangeCurrent = () => {
  const el = textareaRef.value;
  return !!el && el.selectionStart === completionRange.value.end && el.selectionEnd === completionRange.value.end;
};

const setActiveItemRef = (el: unknown, idx: number) => {
  if (el && idx === completionIndex.value) activeCompletionItemRef.value = el as HTMLElement;
};

// 键盘上下移动时让高亮项保持可见（弹层内部滚动跟随）
const scrollActiveIntoView = () => {
  const list = completionListRef.value;
  const active = activeCompletionItemRef.value;
  if (!list || !active) return;
  const cTop = list.scrollTop;
  const iTop = active.offsetTop;
  const iBottom = iTop + active.offsetHeight;
  if (iTop < cTop) list.scrollTop = iTop;
  else if (iBottom > cTop + list.clientHeight) list.scrollTop = iBottom - list.clientHeight;
};

watch(completionIndex, () => {
  nextTick(scrollActiveIntoView);
});

const closeCompletions = () => {
  completionVisible.value = false;
  completionItems.value = [];
};

// 字号变化会改变光标的像素位置，弹层坐标随之失效（工具栏加减 / Ctrl+滚轮）
watch(
  () => props.config?.fontSize,
  () => {
    if (completionVisible.value) closeCompletions();
  }
);

// 用 canvas 按真实字体测量文本宽度（等宽字体下更精确地定位弹层）
let measureCanvas: HTMLCanvasElement | null = null;
const measureTextWidth = (text: string, font: string): number => {
  if (!text) return 0;
  if (typeof document === 'undefined') return text.length * 9;
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return text.length * 9;
  ctx.font = font;
  return ctx.measureText(text).width;
};

const computePopupPosition = (caret: number) => {
  const el = textareaRef.value;
  const wrapper = el?.parentElement;
  if (!el || !wrapper) return { left: 12, top: 12 };

  const text = el.value;
  const before = text.slice(0, caret);
  const lines = before.split('\n');
  const lineIdx = lines.length - 1;
  const col = lines[lineIdx].length;

  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize) || 15;
  const lineHeight = fontSize * 1.5;
  const font = style.font;
  const paddingTop = parseFloat(style.paddingTop) || 12;
  const paddingLeft = parseFloat(style.paddingLeft) || 12;

  const caretX = paddingLeft + measureTextWidth(lines[lineIdx].slice(0, col), font) - el.scrollLeft;
  const caretY = paddingTop + lineIdx * lineHeight - el.scrollTop;

  const wrapperH = wrapper.clientHeight;
  const wrapperW = wrapper.clientWidth;
  const popupW = 300;
  const estPopupH = Math.min(Math.max(completionItems.value.length, 1), 8) * 30 + 10;

  let top = caretY + lineHeight + 4;
  if (top + estPopupH > wrapperH - 8) {
    top = Math.max(4, caretY - estPopupH - 4);
  }
  const left = Math.max(4, Math.min(caretX, wrapperW - popupW - 4));
  return { left, top };
};

const openCompletions = (force = false) => {
  const el = textareaRef.value;
  if (!el || !activeTab.value) return;
  const caret = el.selectionStart;
  const { word, start, end } = getWordAt(el.value, caret);
  // 自动弹出要求已有部分词；Ctrl+Space 强制时允许空前缀（展示全部）
  if (!force && !word) {
    closeCompletions();
    return;
  }
  // 字符串字面量内部不自动唤起补全（如 "123" 的引号之间）
  if (!force && isInsideStringAt(el.value, caret, tabSize())) {
    closeCompletions();
    return;
  }
  const identifiers = collectWorkspaceIdentifiers(props.workspaceFiles);
  const items = getCompletions(el.value, caret, identifiers);
  if (items.length === 0) {
    closeCompletions();
    return;
  }
  completionItems.value = items;
  completionIndex.value = 0;
  completionVisible.value = true;
  completionRange.value = { start, end };
  nextTick(() => {
    completionPos.value = computePopupPosition(caret);
    scrollActiveIntoView();
  });
};

const acceptCompletion = () => {
  const el = textareaRef.value;
  const item = completionItems.value[completionIndex.value];
  const rangeCurrent = isCompletionRangeCurrent();
  closeCompletions();
  // 光标已离开原补全位置：放弃本次补全，否则会把文本插到旧位置并把光标拽回去
  if (!el || !item || !activeTab.value || !rangeCurrent) return;
  const { start, end } = completionRange.value;
  const newContent = el.value.slice(0, start) + item.insertText + el.value.slice(end);
  emit('content-change', activeTab.value.id, newContent);
  nextTick(() => {
    el.focus();
    // 函数补全时光标落在括号内（如 print() 的光标在括号中间）
    const caret = start + (item.caretOffset ?? item.insertText.length);
    el.setSelectionRange(caret, caret);
    updateCursorPosition();
  });
};

/* ==================== 代码悬停用法提示（VS Code hover 风格） ====================
   鼠标悬停在已输入代码中的关键字/内置函数/模块/片段名上时，浮出简略语法用法。
   坐标计算：相对 textarea 的偏移 → 行/列（canvas 逐字符测宽）→ getWordAt → getUsage。 */
const hoverTooltip = ref<{ visible: boolean; syntax: string; description: string; x: number; y: number }>({
  visible: false,
  syntax: '',
  description: '',
  x: 0,
  y: 0
});
let hoverRafId = 0;

// 提示跟随编辑器字号 1:1 缩放；偏移量按同一比例缩放，保证默认字号下的观感不变
const hoverTipStyle = computed(() => {
  const fontSize = props.config?.fontSize || 15;
  const ratio = fontSize / 15;
  const { x, y } = hoverTooltip.value;
  return {
    fontSize: `${fontSize}px`,
    left: `${x + 12 * ratio}px`,
    top: y > 44 * ratio ? `${y - 34 * ratio}px` : `${y + 16 * ratio}px`
  };
});

const hideHoverTooltip = () => {
  if (hoverTooltip.value.visible) hoverTooltip.value.visible = false;
};

const handleTextareaMousemove = (e: MouseEvent) => {
  cancelAnimationFrame(hoverRafId);
  hoverRafId = requestAnimationFrame(() => computeHoverTooltip(e));
};

const computeHoverTooltip = (e: MouseEvent) => {
  const el = textareaRef.value;
  const wrapper = el?.parentElement;
  if (!el || !wrapper || !activeTab.value) { hideHoverTooltip(); return; }
  // 补全弹层打开时不显示悬停提示，避免互相干扰
  if (completionVisible.value) { hideHoverTooltip(); return; }

  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize) || 15;
  const lineHeight = fontSize * 1.5;
  const paddingTop = parseFloat(style.paddingTop) || 12;
  const paddingLeft = parseFloat(style.paddingLeft) || 12;

  const wrapperRect = wrapper.getBoundingClientRect();
  const yInText = e.clientY - wrapperRect.top - paddingTop + el.scrollTop;
  const xInText = e.clientX - wrapperRect.left - paddingLeft + el.scrollLeft;

  const row = Math.floor(yInText / lineHeight);
  const lines = el.value.split('\n');
  if (row < 0 || row >= lines.length) { hideHoverTooltip(); return; }
  const line = lines[row];
  if (!line) { hideHoverTooltip(); return; }

  // 逐字符 canvas 测宽 → 鼠标覆盖的列（tab 按 tabSize 展开宽度）
  // measureCanvas 惰性创建：首次悬停时可能尚不存在（未触发过补全弹层），必须先初始化
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) { hideHoverTooltip(); return; }
  ctx.font = style.font;
  const tabWidth = ctx.measureText(' ').width * (props.config.tabSize || 4);
  let col = 0;
  let acc = 0;
  for (let i = 0; i < line.length; i++) {
    const w = line[i] === '\t' ? tabWidth : ctx.measureText(line[i]).width;
    if (xInText < acc + w / 2) { col = i; break; }
    acc += w;
    col = i + 1;
  }
  if (col >= line.length) { hideHoverTooltip(); return; }

  const { word } = getWordAt(line, col);
  const usage = word ? getUsage(word) : null;
  if (!usage) { hideHoverTooltip(); return; }

  // 用法文本为「语法行 + 说明行」：语法行单独渲染以便加粗与强调着色
  const usageLines = usage.split('\n');
  hoverTooltip.value = {
    visible: true,
    syntax: usageLines[0],
    description: usageLines.slice(1).join('\n'),
    x: e.clientX - wrapperRect.left,
    y: e.clientY - wrapperRect.top
  };
};

/* ==================== 自动配对括号/引号（强制开启） ==================== */
const PAIR_OPENS = new Set(['(', '[', '{', '"', "'", '`']);
const PAIR_CLOSERS = new Set([')', ']', '}']);
const PAIR_MAP: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSE_MATCH: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

const handleAutoPair = (ch: string) => {
  closeCompletions();
  const el = textareaRef.value;
  if (!el || !activeTab.value) return;
  const val = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;

  // 有选区：用配对包裹选区，光标移到闭合符之后
  if (start !== end) {
    const close = PAIR_MAP[ch] ?? ch;
    const selected = val.slice(start, end);
    const newContent = val.slice(0, start) + ch + selected + close + val.slice(end);
    emit('content-change', activeTab.value.id, newContent);
    nextTick(() => {
      el.focus();
      el.setSelectionRange(end + ch.length + close.length, end + ch.length + close.length);
      updateCursorPosition();
    });
    return;
  }

  // 闭合符：光标后已是对应闭合符 → 直接跳过，不重复补
  if (CLOSE_MATCH[ch] && val[start] === ch) {
    el.setSelectionRange(start + 1, start + 1);
    updateCursorPosition();
    return;
  }
  // 引号/反引号：光标后已是同款符号 → 跳过
  if ((ch === '"' || ch === "'" || ch === '`') && val[start] === ch) {
    el.setSelectionRange(start + 1, start + 1);
    updateCursorPosition();
    return;
  }

  // 开符：插入一对，光标落在中间
  const close = PAIR_MAP[ch] ?? ch;
  const newContent = val.slice(0, start) + ch + close + val.slice(end);
  emit('content-change', activeTab.value.id, newContent);
  nextTick(() => {
    el.focus();
    el.setSelectionRange(start + 1, start + 1);
    updateCursorPosition();
  });
};

/* ==================== 轻量自动补空格（运算符/逗号/冒号） ==================== */
const AUTO_SPACE_KEYS = new Set(['=', '+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '^', ',', ':']);
const OPERATOR_CHARS = new Set(['=', '+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '^']);

// 返回 true 表示已接管本次按键
const maybeAutoSpace = (e: KeyboardEvent, val: string, pos: number): boolean => {
  const el = textareaRef.value;
  if (!el || !activeTab.value) return false;
  const key = e.key;
  const prev = val[pos - 1] || '';
  const next = val[pos] || '';

  let left = '';
  let right = '';
  if (key === ',') {
    if (next && !/[\s)\]}]/.test(next)) right = ' ';
  } else if (key === ':') {
    if (next && !/[\s)\]}#]/.test(next)) right = ' ';
  } else {
    // 运算符：两侧补空格，但行首/开括号后/已在运算符/闭合符后不补
    const noLeft = !prev || prev === '\n' || prev === ' ' || prev === '\t' || prev === '(' || prev === '[' || prev === '{' || prev === ',' || prev === ':' || OPERATOR_CHARS.has(prev);
    const noRight = !next || next === '\n' || next === ' ' || next === '\t' || next === ')' || next === ']' || next === '}' || next === ',' || next === ';';
    if (!noLeft) left = ' ';
    if (!noRight) right = ' ';
  }

  // 不补任何空格就走默认输入，避免无意义拦截
  if (!left && !right) return false;

  e.preventDefault();
  const insert = left + key + right;
  const newContent = val.slice(0, pos) + insert + val.slice(pos);
  emit('content-change', activeTab.value.id, newContent);
  nextTick(() => {
    el.focus();
    el.setSelectionRange(pos + left.length + 1, pos + left.length + 1);
    updateCursorPosition();
  });
  return true;
};

const kindLabel = (k: CompletionItem['kind']) => {
  switch (k) {
    case 'keyword': return t('kindKeyword');
    case 'builtin': return t('kindBuiltin');
    case 'module': return t('kindModule');
    case 'snippet': return t('kindSnippet');
    default: return t('kindIdentifier');
  }
};

// 切换标签页时关闭补全
watch(() => props.activeTabId, closeCompletions);

// Run Python Code
const handleRunCode = async () => {
  if (!activeTab.value || isExecuting.value) return;

  emit('add-console-output', {
    id: uid(),
    type: 'system',
    text: `▶ Executing ${activeTab.value.name}...`,
    timestamp: new Date().toLocaleTimeString()
  });

  const code = activeTab.value.content;
  await pythonRunner.runCode(code, props.workspaceFiles, (out) => {
    emit('add-console-output', out);
  }, props.config?.demoMode);
};

// 停止当前运行（本机 Python 引擎可真正中断；Pyodide/演示模式为尽力而为）
const handleStopCode = async () => {
  await pythonRunner.stop();
};

// Undo & Redo History State Tracking per Tab
const historyMap = ref<Record<string, { stack: string[]; index: number }>>({});
let historyDebounceTimer: any = null;

const canUndo = computed(() => {
  if (!props.activeTabId) return false;
  const h = historyMap.value[props.activeTabId];
  return !!h && h.index > 0;
});

const canRedo = computed(() => {
  if (!props.activeTabId) return false;
  const h = historyMap.value[props.activeTabId];
  return !!h && h.index < h.stack.length - 1;
});

const handleUndo = () => {
  if (!activeTab.value) return;
  flushPendingSnapshot();
  const h = historyMap.value[activeTab.value.id];
  if (h && h.index > 0) {
    h.index--;
    const targetContent = h.stack[h.index];
    emit('content-change', activeTab.value.id, targetContent);
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
        updateCursorPosition();
      }
    });
  }
};

const handleRedo = () => {
  if (!activeTab.value) return;
  flushPendingSnapshot();
  const h = historyMap.value[activeTab.value.id];
  if (h && h.index < h.stack.length - 1) {
    h.index++;
    const targetContent = h.stack[h.index];
    emit('content-change', activeTab.value.id, targetContent);
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
        updateCursorPosition();
      }
    });
  }
};

// Track content changes to record undo/redo history snapshots
// 把「防抖中待记录」的快照立即入栈。撤回/重做前必须先调：
// 否则刚敲完 250ms 内按 Ctrl+Z，这一段还没入栈，会直接跳回更早的状态、把刚写的丢掉。
const flushPendingSnapshot = () => {
  clearTimeout(historyDebounceTimer);
  historyDebounceTimer = null;
  const tabId = props.activeTabId;
  const current = activeTab.value?.content;
  if (!tabId || current === undefined) return;
  const h = historyMap.value[tabId];
  if (!h) {
    historyMap.value[tabId] = { stack: [current], index: 0 };
    return;
  }
  if (current === h.stack[h.index]) return;

  const newStack = h.stack.slice(0, h.index + 1);
  newStack.push(current);
  if (newStack.length > 50) newStack.shift();
  historyMap.value[tabId] = { stack: newStack, index: newStack.length - 1 };
};

watch(
  () => [props.activeTabId, activeTab.value?.content],
  ([newTabId, newContent]) => {
    if (!newTabId || newContent === undefined) return;
    const tabId = newTabId as string;
    const content = newContent as string;

    if (!historyMap.value[tabId]) {
      historyMap.value[tabId] = { stack: [content], index: 0 };
      return;
    }
    if (content === historyMap.value[tabId].stack[historyMap.value[tabId].index]) return;

    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(flushPendingSnapshot, 250);
  },
  { immediate: true }
);

// Ctrl + Mouse Wheel Font Zooming
const handleWheelZoom = (e: WheelEvent) => {
  if (props.config.enableWheelZoom !== false && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    const currentSize = props.config.fontSize || 15;
    if (e.deltaY < 0) {
      props.config.fontSize = Math.min(24, currentSize + 1);
    } else if (e.deltaY > 0) {
      props.config.fontSize = Math.max(12, currentSize - 1);
    }
  }
};

// Find and Replace state & logic
const showFindBar = ref(false);
const showReplaceBar = ref(false);
const findText = ref('');
const replaceText = ref('');
const findInputRef = ref<HTMLInputElement | null>(null);
const currentMatchIndex = ref(0);

const matchIndices = computed(() => {
  if (!findText.value || !activeTab.value) return [];
  const text = activeTab.value.content;
  const query = findText.value.toLowerCase();
  const indices: number[] = [];
  let pos = 0;
  while ((pos = text.toLowerCase().indexOf(query, pos)) !== -1) {
    indices.push(pos);
    pos += Math.max(1, query.length);
  }
  return indices;
});

const currentMatchNum = computed(() => {
  if (matchIndices.value.length === 0) return 0;
  return currentMatchIndex.value + 1;
});

const currentMatchedLineNumber = computed(() => {
  if (!showFindBar.value || !findText.value || matchIndices.value.length === 0) return null;
  const activePos = matchIndices.value[currentMatchIndex.value];
  if (activePos === undefined || !activeTab.value) return null;
  return activeTab.value.content.substring(0, activePos).split('\n').length;
});

watch([findText, () => activeTab.value?.id], () => {
  currentMatchIndex.value = 0;
  if (matchIndices.value.length > 0) {
    jumpToMatch(0, false);
  }
});

const jumpToMatch = (idx: number, focusEditor = false) => {
  if (!textareaRef.value || matchIndices.value.length === 0) return;
  const total = matchIndices.value.length;
  const normalized = ((idx % total) + total) % total;
  currentMatchIndex.value = normalized;

  const pos = matchIndices.value[normalized];
  const queryLen = findText.value.length;

  if (focusEditor) {
    textareaRef.value.focus();
  }
  textareaRef.value.setSelectionRange(pos, pos + queryLen);
  updateCursorPosition();

  const content = textareaRef.value.value;
  const targetLine = content.substring(0, pos).split('\n').length;
  const fontPx = props.config.fontSize || 15;
  const lineHeight = fontPx * 1.5;
  const targetScrollTop = Math.max(0, (targetLine - 4) * lineHeight);

  textareaRef.value.scrollTop = targetScrollTop;
  handleScroll();
};

const openFindBar = () => {
  showFindBar.value = true;
  showReplaceBar.value = false;
  nextTick(() => {
    findInputRef.value?.focus();
    if (matchIndices.value.length > 0) {
      jumpToMatch(currentMatchIndex.value);
    }
  });
};

const openReplaceBar = () => {
  showFindBar.value = true;
  showReplaceBar.value = true;
  nextTick(() => {
    findInputRef.value?.focus();
    if (matchIndices.value.length > 0) {
      jumpToMatch(currentMatchIndex.value);
    }
  });
};

const closeFindBar = () => {
  showFindBar.value = false;
  showReplaceBar.value = false;
};

const triggerCopy = async () => {
  if (!textareaRef.value || !activeTab.value) return;
  const el = textareaRef.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.substring(start, end);
  const ok = await copyToClipboard(selected || el.value);
  emit('show-toast', ok ? (selected ? t('toastCopiedSelection') : t('toastCopiedAll')) : t('toastCopyFailed'));
};

// 返回是否真的复制了“选区”（供右键菜单判断并提示）
const copySelection = async (): Promise<boolean> => {
  if (!textareaRef.value) return false;
  const el = textareaRef.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  if (start === end) return false;
  return copyToClipboard(el.value.substring(start, end));
};

const triggerCut = async () => {
  if (!textareaRef.value || !activeTab.value) return;
  const el = textareaRef.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  if (start !== end) {
    const val = el.value;
    const copied = await copyToClipboard(val.substring(start, end));
    // 复制失败时不能删内容，否则会静默丢失用户代码
    if (!copied) {
      emit('show-toast', t('toastCopyFailed'));
      return;
    }
    const newContent = val.substring(0, start) + val.substring(end);
    emit('content-change', activeTab.value.id, newContent);
    nextTick(() => {
      el.selectionStart = el.selectionEnd = start;
    });
  } else {
    emit('show-toast', t('toastSelectToCut'));
  }
};

const triggerPaste = async () => {
  if (!textareaRef.value || !activeTab.value) return;
  const el = textareaRef.value;
  const pasted = await readClipboard();
  if (pasted !== null) {
    // 剪贴板为空（readText 返回 ''）→ 无事可做，静默返回，不走必然失败的 execCommand
    if (pasted.length === 0) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const newContent = val.substring(0, start) + pasted + val.substring(end);
    emit('content-change', activeTab.value.id, newContent);
    nextTick(() => {
      el.selectionStart = el.selectionEnd = start + pasted.length;
    });
    return;
  }
  // Clipboard API 不可用时回退到原生粘贴（会触发 @input 自动同步内容）
  try {
    el.focus();
    const ok = document.execCommand('paste');
    if (!ok) emit('show-toast', t('toastClipboardUnavailable'));
  } catch (e) {
    emit('show-toast', t('toastClipboardUnavailable'));
  }
};

const handleFindNext = () => {
  if (matchIndices.value.length === 0) return;
  jumpToMatch(currentMatchIndex.value + 1);
};

const handleFindPrev = () => {
  if (matchIndices.value.length === 0) return;
  jumpToMatch(currentMatchIndex.value - 1);
};

const handleReplaceOne = () => {
  if (!textareaRef.value || !activeTab.value || !findText.value) return;
  const el = textareaRef.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.substring(start, end);
  if (selected.toLowerCase() === findText.value.toLowerCase()) {
    const newContent = el.value.substring(0, start) + replaceText.value + el.value.substring(end);
    emit('content-change', activeTab.value.id, newContent);
    nextTick(() => {
      el.selectionStart = el.selectionEnd = start + replaceText.value.length;
      handleFindNext();
    });
  } else {
    handleFindNext();
  }
};

const handleReplaceAll = () => {
  if (!activeTab.value || !findText.value) return;
  const regex = new RegExp(findText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const newContent = activeTab.value.content.replace(regex, replaceText.value);
  emit('content-change', activeTab.value.id, newContent);
};

/* ==================== 任务5：工作区其它文件匹配内联显示 ==================== */
const OTHER_FILE_EXTS = ['.py', '.txt', '.md', '.json', '.js', '.ts'];
const otherFileMatches = computed(() => {
  const empty = { count: 0, first: null as { file: FSItem; line: number } | null };
  if (!findText.value || !showFindBar.value || !activeTab.value) return empty;
  const q = findText.value.toLowerCase();
  const curPath = activeTab.value.path;
  let count = 0;
  let first: { file: FSItem; line: number } | null = null;
  const walk = (items: FSItem[]) => {
    for (const it of items) {
      if (it.isFolder) {
        if (it.children) walk(it.children);
        continue;
      }
      if (it.path === curPath) continue;
      const lowerName = it.name.toLowerCase();
      if (!OTHER_FILE_EXTS.some((ext) => lowerName.endsWith(ext))) continue;
      const lines = (it.content || '').split('\n');
      lines.forEach((ln, idx) => {
        if (ln.toLowerCase().includes(q)) {
          count++;
          if (!first) first = { file: it, line: idx + 1 };
        }
      });
    }
  };
  walk(props.workspaceFiles);
  return { count, first };
});

const jumpToOtherFile = () => {
  const { first } = otherFileMatches.value;
  if (first) emit('jump-to-file', { file: first.file, line: first.line });
};

// 暴露给 App.vue：跳转到指定行并滚动到可视区
const revealLine = (line: number) => {
  const el = textareaRef.value;
  if (!el) return;
  nextTick(() => {
    const lines = el.value.split('\n');
    const targetLine = Math.max(1, Math.min(line, lines.length));
    let offset = 0;
    for (let i = 0; i < targetLine - 1; i++) offset += (lines[i]?.length ?? 0) + 1;
    el.focus();
    el.setSelectionRange(offset, offset);
    const fontPx = props.config.fontSize || 15;
    el.scrollTop = Math.max(0, (targetLine - 4) * fontPx * 1.5);
    updateCursorPosition();
    handleScroll();
  });
};

/* ==================== 任务6：格式化文档（轻量规则化 + 缩进重排） ==================== */
const tabSize = () => props.config.tabSize || 4;

const formatDocument = () => {
  if (!activeTab.value) return;
  // 与工具栏按钮同一条件：非 Python 文件不按 Python 规则改写
  if (!activeTab.value.name.endsWith('.py')) {
    emit('show-toast', t('formatDocPythonOnly'));
    return;
  }
  // 先补空格（词法级，不碰缩进），再按语法树重排缩进：多一个空格 / 少一个空格也一并修正
  const content = activeTab.value.content;
  const formatted = reindentText(formatCodeText(content), tabSize());
  if (formatted !== content) {
    emit('content-change', activeTab.value.id, formatted);
  }
  emit('show-toast', t('formattedDoc'));
};

/* ==================== 任务8：非字符串内中文标点 / 多余括号红色细下划线 ==================== */
const NON_ASCII_PUNCT = new Set(['“', '”', '‘', '’', '（', '）', '【', '】', '《', '》', '〈', '〉', '，', '。', '；', '：', '！', '？', '、', '…', '·']);
const warningRef = ref<HTMLPreElement | null>(null);

const warningOverlayHtml = computed(() => {
  const code = activeTab.value?.content || '';
  const warned = new Set<number>();
  // 只检查 .py：这些是 Python 的语法问题，字符串/注释区段也来自 Python 语法树，
  // 用在 .md / .txt 正文里会把中文标点和英文撇号误判成错误
  if (activeTab.value?.name.endsWith('.py')) {
    // 字符串与注释由语法树整段标出并跳过：里面的中文标点、括号都不算错误
    const skipped = stringAndCommentRanges(code, tabSize());
    const stack: { ch: string; pos: number }[] = [];
    let skip = 0;
    let i = 0;
    while (i < code.length) {
      while (skip < skipped.length && skipped[skip].to <= i) skip++;
      if (skip < skipped.length && skipped[skip].from <= i) { i = skipped[skip].to; continue; }
      const ch = code[i];
      if (ch === '(' || ch === '[' || ch === '{') { stack.push({ ch, pos: i }); i++; continue; }
      if (ch === ')' || ch === ']' || ch === '}') {
        const match = { ')': '(', ']': '[', '}': '{' }[ch] as string;
        const top = stack.pop();
        if (!top || top.ch !== match) warned.add(i);
        i++;
        continue;
      }
      if (NON_ASCII_PUNCT.has(ch)) { warned.add(i); i++; continue; }
      i++;
    }
    for (const b of stack) warned.add(b.pos);
  }

  let html = '';
  for (let j = 0; j < code.length; j++) {
    let c = code[j];
    if (c === '&') c = '&amp;';
    else if (c === '<') c = '&lt;';
    else if (c === '>') c = '&gt;';
    if (warned.has(j)) html += `<span class="warn-underline">${c}</span>`;
    else html += c;
  }
  return html + '\n';
});

// ---- 命令通道：App 标题栏 / 工具栏 / 右键菜单经 command prop 触发编辑器内部动作 ----
// 收敛 expose（批次 4）：可撤销/重做/光标等状态改走事件，剪贴板/查找替换/聚焦/定位改走命令通道
const execEditorCommand = (cmd: string, arg?: unknown) => {
  switch (cmd) {
    case 'find': openFindBar(); break;
    case 'replace': openReplaceBar(); break;
    case 'copy': void triggerCopy(); break;
    case 'cut': void triggerCut(); break;
    case 'paste': void triggerPaste(); break;
    case 'copySelection':
      void copySelection().then((ok) => emit('copy-result', ok));
      break;
    case 'focus': textareaRef.value?.focus(); break;
    case 'reveal': if (typeof arg === 'number') revealLine(arg); break;
  }
};
watch(() => props.command?.seq, (seq, oldSeq) => {
  if (!seq || seq === oldSeq || !props.command) return;
  execEditorCommand(props.command.cmd, props.command.arg);
});
// 撤销/重做可用状态经事件上抛（App 工具栏禁用态；不再经 expose 读取）
watch([canUndo, canRedo], ([cu, cr]) => emit('undo-state', { canUndo: cu, canRedo: cr }), { immediate: true });

// expose 收敛为 5 项：仅保留 App 工具栏必须命令式调用的动作
defineExpose({
  runCode: handleRunCode,
  stopCode: handleStopCode,
  undo: handleUndo,
  redo: handleRedo,
  formatDocument
});

// ---- 标签条横向滚动：两侧滚动按钮 + 溢出状态跟踪 ----
const tabsBarRef = ref<HTMLDivElement | null>(null);
const canTabsScrollLeft = ref(false);
const canTabsScrollRight = ref(false);

const updateTabsScrollState = () => {
  const el = tabsBarRef.value;
  if (!el) return;
  canTabsScrollLeft.value = el.scrollLeft > 1;
  canTabsScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
};

const scrollTabs = (dir: number) => {
  tabsBarRef.value?.scrollBy({ left: dir * 240, behavior: 'smooth' });
};

// 键盘可达（无障碍）：Enter/Space 切换标签页；忽略来自内部关闭按钮的按键（冒泡时 target 不同）
const handleTabKeydown = (e: KeyboardEvent, tabId: string) => {
  if (e.target !== e.currentTarget) return;
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  emit('select-tab', tabId);
};

watch(() => [props.tabs.length, props.activeTabId], () => {
  nextTick(updateTabsScrollState);
}, { deep: true });

let tabsResizeObserver: ResizeObserver | null = null;
let editorScrollbarObserver: ResizeObserver | null = null;
onMounted(() => {
  updateTabsScrollState();
  const el = tabsBarRef.value;
  if (el) {
    tabsResizeObserver = new ResizeObserver(updateTabsScrollState);
    tabsResizeObserver.observe(el);
  }
  nextTick(() => {
    updateScrollbarGeometry();
    if (textareaRef.value && !editorScrollbarObserver) {
      // 窗口 / 面板尺寸变化（split-pane 拖拽等）时重算滚动条
      editorScrollbarObserver = new ResizeObserver(updateScrollbarGeometry);
      editorScrollbarObserver.observe(textareaRef.value);
    }
  });
});
onBeforeUnmount(() => {
  tabsResizeObserver?.disconnect();
  tabsResizeObserver = null;
  editorScrollbarObserver?.disconnect();
  editorScrollbarObserver = null;
  clearTimeout(scrollbarHideTimer);
  stopLineSelect(); // 卸载时摘掉行号拖选挂在 document 上的监听
});

</script>

<template>
  <div class="code-editor-container">
    <!-- Editor Tabs Header（与代码区连体的圆角标签条：无标签页时不渲染；两侧滚动按钮在未溢出时禁用） -->
    <div v-if="tabs.length > 0" class="editor-tabs-wrap">
      <m3e-icon-button class="tabs-scroll-btn" variant="standard" width="narrow" size="extra-small"
        :disabled="!canTabsScrollLeft" :title="t('tabScrollLeft')" @click="scrollTabs(-1)">
        <span class="material-symbols-rounded">keyboard_double_arrow_left</span>
      </m3e-icon-button>
      <div ref="tabsBarRef" class="editor-tabs-bar" @scroll="updateTabsScrollState">
        <div v-for="tab in tabs" :key="tab.id" class="editor-tab-item" role="button" tabindex="0"
          :class="{ 'is-active': tab.id === activeTabId }" @click="emit('select-tab', tab.id)"
          @keydown="handleTabKeydown($event, tab.id)">
          <span class="material-symbols-rounded tab-icon">
            {{ getTabIcon(tab.name) }}
          </span>
          <span class="tab-name">{{ tab.name }}</span>
          <!-- 右侧固定槽位：未保存圆点与关闭按钮共用同一格、同一尺寸（同 VS Code），
               两者互换时不推动标签里的任何元素 -->
          <span class="tab-action-slot">
            <span v-if="tab.isDirty" class="dirty-dot" :title="t('tabUnsavedTitle')"></span>
            <m3e-icon-button class="tab-close-btn" variant="standard" size="extra-small" :title="t('tabCloseTitle')"
              @click.stop="emit('close-tab', tab.id)">
              <span class="material-symbols-rounded">close</span>
            </m3e-icon-button>
          </span>
        </div>
      </div>
      <m3e-icon-button class="tabs-scroll-btn" variant="standard" width="narrow" size="extra-small"
        :disabled="!canTabsScrollRight" :title="t('tabScrollRight')" @click="scrollTabs(1)">
        <span class="material-symbols-rounded">keyboard_double_arrow_right</span>
      </m3e-icon-button>
    </div>

    <!-- Empty Editor State -->
    <div v-if="!activeTab" class="empty-editor-view" @contextmenu.prevent="e => emit('contextmenu-editor', e)">
      <div class="empty-editor-content">
        <h2>{{ t('welcomeTitle') }}</h2>
        <p>{{ t('welcomeSubtitle') }}</p>
      </div>
    </div>

    <!-- Active Code Editor View -->
    <div v-else class="active-editor-view">
      <!-- Floating Find & Replace Widget Bar -->
      <div v-if="showFindBar" class="find-replace-widget">
        <div class="find-row">
          <m3e-search-bar class="find-search-bar">
            <span slot="leading" class="material-symbols-rounded">search</span>
            <input slot="input" ref="findInputRef" v-model="findText" :placeholder="t('findPlaceholder')"
              @keydown.enter.prevent="handleFindNext" @keydown.esc="closeFindBar" />
          </m3e-search-bar>
          <m3e-badge v-if="findText" size="medium" class="find-badge">
            {{ matchIndices.length > 0 ? currentMatchNum + '/' + matchIndices.length : t('noMatches') }}
          </m3e-badge>
          <m3e-icon-button size="extra-small" :title="t('findPrevTitle')" @click="handleFindPrev">
            <span class="material-symbols-rounded">keyboard_arrow_up</span>
          </m3e-icon-button>
          <m3e-icon-button size="extra-small" :title="t('findNextTitle')" @click="handleFindNext">
            <span class="material-symbols-rounded">keyboard_arrow_down</span>
          </m3e-icon-button>
          <m3e-icon-button size="extra-small" :title="t('closeTitle')" @click="closeFindBar">
            <span class="material-symbols-rounded">close</span>
          </m3e-icon-button>
        </div>
        <div v-if="showReplaceBar" class="replace-row">
          <m3e-search-bar class="find-search-bar">
            <span slot="leading" class="material-symbols-rounded">find_replace</span>
            <input slot="input" v-model="replaceText" :placeholder="t('replacePlaceholder')"
              @keydown.enter.prevent="handleReplaceOne" @keydown.esc="closeFindBar" />
          </m3e-search-bar>

          <m3e-button class="replace-btn" variant="tonal" size="extra-small" :disabled="isExecuting"
            :title="`${t('runCode')} (Ctrl+Enter)`" @click="handleReplaceOne">
            <span slot="icon" class="material-symbols-rounded">{{ isExecuting ? 'sync' : 'check' }}</span>
            {{ t('replaceBtn') }}
          </m3e-button>
          <m3e-button class="replace-btn" variant="text" size="extra-small" :disabled="isExecuting"
            :title="`${t('runCode')} (Ctrl+Enter)`" @click="handleReplaceAll">
            <span slot="icon" class="material-symbols-rounded">{{ isExecuting ? 'sync' : 'done_all' }}</span>
            {{ t('replaceAllBtn') }}
          </m3e-button>
        </div>
        <div v-if="findText && otherFileMatches.count > 0" class="other-files-row">
          <span class="other-files-label">{{ tf('otherFilesMatches', { count: otherFileMatches.count }) }}</span>
          <m3e-button size="extra-small" variant="text" :disabled="!otherFileMatches.first" @click="jumpToOtherFile">
            <span slot="icon" class="material-symbols-rounded">arrow_forward</span>
            {{ t('jump') }}
          </m3e-button>
        </div>
      </div>

      <!-- Code Textarea & Line Numbers Area -->
      <div class="editor-workspace-body" :class="`theme-${codeTheme || config.codeTheme || 'github-dark'}`"
        @contextmenu.prevent="e => emit('contextmenu-editor', e)">
        <!-- Line Numbers Column（主题类同时挂在自身：背景/文字直接跟随代码主题，不依赖父级继承） -->
        <div ref="lineNumbersRef" class="line-numbers-column" :class="`theme-${codeTheme || config.codeTheme || 'github-dark'}`"
          :style="{ fontSize: `${config.fontSize || 15}px`, width: lineNumberColumnWidth }">
          <div v-for="n in linesCount" :key="n" class="line-num" :class="{
            'active-line-num': n === cursorLine,
            'matched-line-num': matchedLineNumbers.has(n) && n !== currentMatchedLineNumber,
            'current-matched-line-num': n === currentMatchedLineNumber
          }" @mousedown="startLineSelect($event, n)">
            {{ n }}
          </div>
        </div>

        <!-- Textarea Code Area -->
        <div class="code-area-wrapper">
          <pre ref="codeHighlightRef" class="code-highlight-overlay" aria-hidden="true"
            :style="{ fontSize: `${config.fontSize || 15}px`, tabSize: config.tabSize || 4 }"><code class="hljs"
          v-html="highlightedCode"></code></pre>
          <pre ref="warningRef" class="warning-overlay" aria-hidden="true"
            :style="{ fontSize: `${config.fontSize || 15}px`, tabSize: config.tabSize || 4 }"><code
          v-html="warningOverlayHtml"></code></pre>
          <textarea ref="textareaRef" :value="activeTab.content" wrap="off" class="code-textarea"
            :style="{ fontSize: `${config.fontSize || 15}px`, tabSize: config.tabSize || 4 }" spellcheck="false"
            autocomplete="off" autocorrect="off" autocapitalize="off" @input="handleInput" @keydown="handleKeyDown"
            @scroll="handleScroll" @wheel="handleWheelZoom" @click="updateCursorPosition" @keyup="updateCursorPosition"
            @blur="closeCompletions" @mousemove="handleTextareaMousemove" @mouseleave="hideHoverTooltip"></textarea>

          <!-- 代码悬停用法提示（VS Code hover 风格）：悬停关键字/函数/模块名显示简略用法 -->
          <div v-if="hoverTooltip.visible" class="code-hover-tooltip" :style="hoverTipStyle">
            <div class="hover-syntax">{{ hoverTooltip.syntax }}</div>
            <div v-if="hoverTooltip.description" class="hover-desc">{{ hoverTooltip.description }}</div>
          </div>

          <!-- Code Completion Popup -->
          <div v-if="completionVisible && completionItems.length > 0" class="completion-popup"
            :style="{ left: `${completionPos.left}px`, top: `${completionPos.top}px` }" @mousedown.prevent>
            <div ref="completionListRef" class="completion-list">
              <div v-for="(item, idx) in completionItems" :key="item.label + idx" class="completion-item"
                :class="{ 'is-active': idx === completionIndex }" :ref="(el) => setActiveItemRef(el, idx)"
                @mouseenter="completionIndex = idx" @mousedown.prevent.stop="completionIndex = idx; acceptCompletion()"
                :title="item.usage || item.detail">
                <span class="completion-kind">{{ kindLabel(item.kind) }}</span>
                <span class="completion-label">{{ item.label }}</span>
                <span class="completion-detail">{{ item.detail }}</span>
              </div>
            </div>
            <div class="completion-footer">
              <kbd>Enter</kbd><span>{{ t('completionConfirm') }}</span>
              <span class="footer-sep">·</span>
              <kbd>Ctrl+Space</kbd><span>{{ t('completionInvoke') }}</span>
            </div>
          </div>

          <!-- VS Code 风格自定义滚动条（原生滚动条隐藏后由 JS 驱动位置与尺寸） -->
          <div ref="vScrollbarRef" class="custom-scrollbar vertical"
            @pointerdown="startScrollDrag($event, 'vertical')">
            <div ref="vScrollThumbRef" class="custom-scrollbar-thumb"></div>
          </div>
          <div ref="hScrollbarRef" class="custom-scrollbar horizontal"
            @pointerdown="startScrollDrag($event, 'horizontal')">
            <div ref="hScrollThumbRef" class="custom-scrollbar-thumb"></div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.code-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--surface-color);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: 12px;
}

/* 标签条外框：承载两侧滚动按钮与内部可横向滚动的标签列表 */
.editor-tabs-wrap {
  display: flex;
  align-items: center;
  margin: 0 0.2rem;
  padding: 6px 4px 0 2px;
  background-color: var(--surface-color);
  user-select: none;
  flex-shrink: 0;
}

.tabs-scroll-btn {
  flex-shrink: 0;
}

.editor-tabs-bar {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  overflow-x: auto;
  /* 滚动条隐藏：溢出状态由两侧按钮的禁用态表达 */
  scrollbar-width: none;
}

.editor-tabs-bar::-webkit-scrollbar {
  display: none;
}

.editor-tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  min-width: 96px;
  max-width: 200px;
  padding: 0 10px;
  border-radius: 8px 8px 0 0;
  background-color: transparent;
  border: none;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background-color var(--motion-effects-fast), color var(--motion-effects-fast);
}

.editor-tab-item:hover {
  background-color: color-mix(in srgb, var(--text-color) 8%, transparent);
  color: var(--text-color);
}

.editor-tab-item.is-active {
  color: var(--secondary);
  background-color: var(--secondary-container);
  font-weight: 600;
}

.tab-icon {
  font-size: 16px;
  letter-spacing: -2px;
}

.tab-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧固定槽位（尺寸 = extra-small 图标按钮的 32px）：宽度恒定，
   里面的圆点与关闭按钮互换不会推动文件名，也不会改变标签宽度 */
.tab-action-slot {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dirty-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: var(--accent-amber-text);
}

/* 默认显示圆点（干净时该格为空）；悬停时圆点让位给关闭按钮 —— 与 VS Code 一致 */
.tab-action-slot .tab-close-btn {
  display: none;
}

.editor-tab-item:hover .tab-close-btn,
.editor-tab-item:focus-visible .tab-close-btn {
  display: inline-flex;
}

.editor-tab-item:hover .dirty-dot,
.editor-tab-item:focus-visible .dirty-dot {
  display: none;
}

/* Empty View */
.empty-editor-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  min-height: 0;
  overflow: hidden;
  background-color: var(--surface-2);
  border-radius: 1rem;
}

.empty-editor-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.empty-editor-content h2 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.empty-editor-content p {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

kbd {
  background-color: var(--surface-variant);
  border: 1px solid var(--border-color-muted);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

/* Active Editor Workspace */
.active-editor-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 1rem;
}

/* Editor Workspace Body */
.editor-workspace-body {
  flex: 1;
  display: flex;
  min-height: 0;
  min-width: 0;
  background-color: var(--bg-color);
  position: relative;
  overflow: hidden;
  contain: size;
  border-radius: 1rem;
}

.line-numbers-column {
  width: 48px;
  font-family: var(--font-mono);
  text-align: right;
  padding: 12px 0 12px 0;
  user-select: none;
  overflow: hidden;
  line-height: 1.5;
  flex-shrink: 0;
  box-sizing: border-box;
}

/* 行号列主题兜底（类挂在行号列自身）：index.css 全局 .theme-* 规则为主（!important 优先），
   此处 scoped 规则保证即使全局样式未注入/被缓存拦截，行号列背景与行号文字
   也始终跟随代码主题，不会回退到应用底色（--bg-color）。两者同值，互不冲突。 */
.line-numbers-column.theme-github-dark { background-color: #0d1117; color: #c9d1d9; }
.line-numbers-column.theme-monokai { background-color: #272822; color: #f8f8f2; }
.line-numbers-column.theme-one-dark { background-color: #282c34; color: #abb2bf; }
.line-numbers-column.theme-vs-code { background-color: #1e1e1e; color: #d4d4d4; }
.line-numbers-column.theme-github-light { background-color: #ffffff; color: #24292e; }
.line-numbers-column.theme-one-light { background-color: #fafafa; color: #383a42; }
.line-numbers-column.theme-vs-code-light { background-color: #ffffff; color: #000000; }
.line-numbers-column.theme-solarized-light { background-color: #fdf6e3; color: #657b83; }

.line-num {
  height: 1.5em;
  line-height: 1.5;
  padding-right: 4px;
  border-radius: 4px;
  cursor: pointer; /* 点一下选整行 */
  transition: background-color var(--motion-effects-fast), color var(--motion-effects-fast);
  opacity: 0.5;
}

.active-line-num {
  opacity: 1;
  font-weight: 700;
}

.matched-line-num {
  background-color: color-mix(in srgb, var(--tertiary-container) 30%, transparent) !important;
  color: var(--tertiary) !important;
  font-weight: 700;
}

.current-matched-line-num {
  background-color: var(--tertiary-container) !important;
  color: var(--tertiary) !important;
  font-weight: 700;
}

.code-area-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-color);
}

/* Floating Find & Replace Widget */
.find-replace-widget {
  position: absolute;
  top: 48px;
  right: 24px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 50;
}

.find-row,
.replace-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.find-search-bar {
  flex: 1;
  min-width: 140px;
}

.find-badge {
  flex-shrink: 0;
}

.replace-btn {
  flex-shrink: 0;
}

.code-highlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 12px 120px 12px 12px;
  font-family: var(--font-mono);
  line-height: 1.5;
  tab-size: 4;
  white-space: pre;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  overflow: hidden;
  pointer-events: none;
  background: transparent;
  box-sizing: border-box;
}

/* 覆盖 highlight.js 样式：选择器特异性 (0,1,2) 已高于 hljs 的 .hljs (0,1,0)，
   无需 !important（hljs 主题样式表自身不使用 !important） */
.code-highlight-overlay code.hljs {
  padding: 0;
  padding-right: 120px;
  background: transparent;
  font-family: var(--font-mono);
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  display: inline-block;
  width: max-content;
  min-width: calc(100% + 120px);
}

.code-textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 12px 120px 12px 12px;
  border: none;
  outline: none;
  resize: none;
  background-color: transparent;
  color: transparent;
  caret-color: var(--text-color);
  font-family: var(--font-mono);
  line-height: 1.5;
  white-space: pre;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  overflow: auto;
  tab-size: 4;
  box-sizing: border-box;
  z-index: 2;
  /* 隐藏原生滚动条（自绘条接管）：标准通道 + webkit 伪元素双保险，
     WebView2 中两者至少一个生效，确保原生条不显示 */
  scrollbar-width: none;
}

.code-textarea::-webkit-scrollbar {
  display: none;
}

.code-textarea::selection {
  background-color: #f59e0b;
  color: #000000;
}

/* ---- VS Code 风格自定义滚动条 ---- */
/* 默认透明（鼠标不在区域内且未滚动时隐藏）；滚动中（is-visible，JS 防抖）或
   悬停时显示；thumb 背景 color-mix 30% = 显示态视觉透明度 0.3，hover 提亮 */
.custom-scrollbar {
  position: absolute;
  z-index: 5;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity var(--motion-effects);
  pointer-events: none;
}

/* 默认 4px 细条；hover / 拖拽时加宽到 12px 方便抓取（垂直条右缘不动向左扩，
   水平条底缘不动向上扩，不遮文字：textarea 底部 padding 12px） */
.custom-scrollbar.vertical {
  right: 0;
  top: 2px;
  bottom: 2px;
  width: 4px;
  transition: opacity var(--motion-effects), width var(--motion-spatial-fast);
}

.custom-scrollbar.vertical:hover,
.custom-scrollbar.vertical.is-dragging {
  width: 12px;
}

.custom-scrollbar.horizontal {
  left: 2px;
  right: 2px;
  bottom: 0;
  height: 4px;
  transition: opacity var(--motion-effects), height var(--motion-spatial-fast);
}

.custom-scrollbar.horizontal:hover,
.custom-scrollbar.horizontal.is-dragging {
  height: 12px;
}

.custom-scrollbar-thumb {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--outline) 30%, transparent);
  transition: background-color var(--motion-effects);
}

/* 显示状态：滚动中 / 拖拽中 / 悬停 */
.custom-scrollbar.is-visible,
.custom-scrollbar.is-dragging,
.code-area-wrapper:hover .custom-scrollbar {
  opacity: 1;
  pointer-events: auto;
}

.code-area-wrapper:hover .custom-scrollbar-thumb {
  background: color-mix(in srgb, var(--outline) 60%, transparent);
}

/* Code Completion Popup */
.code-hover-tooltip {
  position: absolute;
  z-index: 65;
  max-width: 380px;
  padding: 6px 10px;
  font-family: var(--font-mono);
  /* 字号由 hoverTipStyle 按编辑器字号 1:1 注入 */
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--surface-container-high);
  border: 1px solid var(--border-color-muted);
  border-radius: 12px; /* 富提示：M3 RichTooltip.ContainerShape = CornerMedium */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  white-space: pre-line;
  overflow-wrap: break-word;
}

.hover-syntax {
  font-weight: 700;
  color: var(--primary);
}

.completion-popup {
  position: absolute;
  z-index: 60;
  display: flex;
  flex-direction: column;
  min-width: 280px;
  max-width: 420px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  padding: 4px;
  font-size: 0.8125rem;
}

.completion-list {
  max-height: 240px;
  overflow-y: auto;
  /* 全局滚动条默认透明、悬停才显形；补全弹层里需要始终可见 */
  scrollbar-color: color-mix(in srgb, var(--outline) 45%, transparent) transparent;
}

.completion-list::-webkit-scrollbar {
  width: 8px;
}

.completion-list::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--outline) 45%, transparent);
  border-radius: 9999px;
}

.completion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color);
  white-space: nowrap;
}

.completion-item:hover:not(.is-active) {
  background-color: var(--surface-variant);
}

.completion-item.is-active {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

.completion-kind {
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background-color: var(--surface-variant);
  color: var(--text-secondary);
}

.completion-label {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
}

.completion-detail {
  flex-shrink: 0;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.completion-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  margin-top: 2px;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.completion-footer kbd {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  padding: 1px 5px;
  border-radius: 4px;
  background-color: var(--surface-variant);
  border: 1px solid var(--border-color-muted);
  color: var(--text-secondary);
}

.completion-footer .footer-sep {
  opacity: 0.6;
  margin: 0 2px;
}

/* 任务8：非字符串内中文标点 / 多余括号的红色细下划线装饰层（与高亮覆盖层同盒模型，滚动同步） */
.warning-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 12px 120px 12px 12px;
  font-family: var(--font-mono);
  line-height: 1.5;
  tab-size: 4;
  white-space: pre;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  overflow: hidden;
  pointer-events: none;
  background: transparent;
  box-sizing: border-box;
  z-index: 1;
}

.warning-overlay code {
  padding: 0;
  padding-right: 120px;
  background: transparent;
  font-family: var(--font-mono);
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
  display: inline-block;
  width: max-content;
  min-width: calc(100% + 120px);
  color: transparent;
  -webkit-text-fill-color: transparent;
}

:deep(.warn-underline) {
  color: var(--text-color);
  -webkit-text-fill-color: var(--text-color);
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: #ef4444;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

/* 任务5：查找栏下方其它文件匹配行 */
.other-files-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 2px 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.other-files-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 任务3：让 hljs 已识别的方法调用 / 装饰器 / 类型注解着色更醒目（不换内核） */
.code-highlight-overlay .hljs-title.function_{
  font-weight: 600;
}
.code-highlight-overlay .hljs-decorator,
.code-highlight-overlay .hljs-meta {
  opacity: 1;
}
</style>
