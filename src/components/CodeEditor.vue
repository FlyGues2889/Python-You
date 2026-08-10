<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { EditorTab, ConsoleOutput, AppConfig, FSItem } from '../types';
import { pythonRunner } from '../utils/pythonRunner';
import { useI18n } from '../utils/i18n';
import { copyToClipboard, readClipboard } from '../utils/clipboard';
import { uid } from '../utils/id';
import { getCompletions, getWordAt, collectWorkspaceIdentifiers, isInsideString, type CompletionItem } from '../utils/pythonCompletions';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const { t } = useI18n();


const props = defineProps<{
  tabs: EditorTab[];
  activeTabId: string | null;
  config: AppConfig;
  workspaceFiles: FSItem[];
  initialCursors?: Record<string, { line: number; col: number }>;
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
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const lineNumbersRef = ref<HTMLDivElement | null>(null);
const codeHighlightRef = ref<HTMLPreElement | null>(null);

const isExecuting = ref(false);
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

// Sync scrolling between textarea, line numbers, and highlight layer
const handleScroll = () => {
  if (textareaRef.value) {
    if (lineNumbersRef.value) {
      lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop;
    }
    if (codeHighlightRef.value) {
      codeHighlightRef.value.scrollTop = textareaRef.value.scrollTop;
      codeHighlightRef.value.scrollLeft = textareaRef.value.scrollLeft;
    }
  }
};

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

  // 补全弹层打开时的键位：上下选择 / Enter/Tab 确认 / Esc 关闭
  if (completionVisible.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      completionIndex.value = (completionIndex.value + 1) % completionItems.value.length;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      completionIndex.value = (completionIndex.value - 1 + completionItems.value.length) % completionItems.value.length;
      return;
    }
    if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      acceptCompletion();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCompletions();
      return;
    }
  }

  // Ctrl+Space / Cmd+Space => 主动唤起补全
  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
    e.preventDefault();
    openCompletions(true);
    return;
  }

  // 自动配对引号（设置项 autoPairQuotes，默认开启）
  if ((e.key === '"' || e.key === "'") && props.config.autoPairQuotes !== false) {
    e.preventDefault();
    handleAutoQuote(e.key);
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

  const el = textareaRef.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;

  // Tab Key => Insert 4 spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const tabSpaces = ' '.repeat(props.config.tabSize || 4);
    const newContent = val.substring(0, start) + tabSpaces + val.substring(end);
    emit('content-change', activeTab.value.id, newContent);

    nextTick(() => {
      el.selectionStart = el.selectionEnd = start + tabSpaces.length;
      updateCursorPosition();
    });
    return;
  }

  // Enter Key => Auto Indentation
  if (e.key === 'Enter') {
    const currentLineStart = val.lastIndexOf('\n', start - 1) + 1;
    const currentLine = val.substring(currentLineStart, start);
    const indentMatch = currentLine.match(/^\s*/);
    let indent = indentMatch ? indentMatch[0] : '';

    // Extra indent if line ends with colon ':'
    if (currentLine.trim().endsWith(':')) {
      indent += ' '.repeat(props.config.tabSize || 4);
    }

    if (indent.length > 0) {
      e.preventDefault();
      const newContent = val.substring(0, start) + '\n' + indent + val.substring(end);
      emit('content-change', activeTab.value.id, newContent);

      nextTick(() => {
        el.selectionStart = el.selectionEnd = start + 1 + indent.length;
        updateCursorPosition();
      });
    }
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
  if (!force && isInsideString(el.value, caret)) {
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
  closeCompletions();
  if (!el || !item || !activeTab.value) return;
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

/* 自动配对引号：无选区时插入一对并把光标放中间；有选区时用引号包裹选中的文本 */
const handleAutoQuote = (quote: string) => {
  closeCompletions();
  const el = textareaRef.value;
  if (!el || !activeTab.value) return;
  const val = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;

  // 有选区：两侧包上引号对，光标移到闭合引号后
  if (start !== end) {
    const selected = val.slice(start, end);
    const newContent = val.slice(0, start) + quote + selected + quote + val.slice(end);
    emit('content-change', activeTab.value.id, newContent);
    nextTick(() => {
      el.focus();
      el.setSelectionRange(end + 2, end + 2);
      updateCursorPosition();
    });
    return;
  }

  // 无选区：光标后已是同款引号（即将闭合）→ 直接跳过去
  if (val[start] === quote) {
    el.setSelectionRange(start + 1, start + 1);
    updateCursorPosition();
    return;
  }

  // 否则插入引号对，光标落在中间
  const newContent = val.slice(0, start) + quote + quote + val.slice(end);
  emit('content-change', activeTab.value.id, newContent);
  nextTick(() => {
    el.focus();
    el.setSelectionRange(start + 1, start + 1);
    updateCursorPosition();
  });
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

  isExecuting.value = true;

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

  isExecuting.value = false;
};

// 停止当前运行（本机 Python 引擎可真正中断；Pyodide/演示模式为尽力而为）
const handleStopCode = async () => {
  await pythonRunner.stop();
  isExecuting.value = false;
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

    const h = historyMap.value[tabId];
    if (content === h.stack[h.index]) return;

    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(() => {
      if (!historyMap.value[tabId]) return;
      const curH = historyMap.value[tabId];
      if (content === curH.stack[curH.index]) return;

      const newStack = curH.stack.slice(0, curH.index + 1);
      newStack.push(content);
      if (newStack.length > 50) newStack.shift();
      historyMap.value[tabId] = {
        stack: newStack,
        index: newStack.length - 1
      };
    }, 250);
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

defineExpose({
  openFindBar,
  openReplaceBar,
  triggerCopy,
  triggerCut,
  triggerPaste,
  copySelection,
  focusEditor: () => textareaRef.value?.focus(),
  // 以下为 App 级操作工具栏使用的编辑器能力/状态（expose 代理会自动解包 ref，父级模板可直接读取）
  runCode: handleRunCode,
  stopCode: handleStopCode,
  undo: handleUndo,
  redo: handleRedo,
  isExecuting,
  canUndo,
  canRedo,
  cursorLine,
  cursorCol
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

watch(() => [props.tabs.length, props.activeTabId], () => {
  nextTick(updateTabsScrollState);
}, { deep: true });

let tabsResizeObserver: ResizeObserver | null = null;
onMounted(() => {
  updateTabsScrollState();
  const el = tabsBarRef.value;
  if (el) {
    tabsResizeObserver = new ResizeObserver(updateTabsScrollState);
    tabsResizeObserver.observe(el);
  }
});
onBeforeUnmount(() => {
  tabsResizeObserver?.disconnect();
  tabsResizeObserver = null;
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
        <div v-for="tab in tabs" :key="tab.id" class="editor-tab-item" :class="{ 'is-active': tab.id === activeTabId }"
          @click="emit('select-tab', tab.id)">
          <span class="material-symbols-rounded tab-icon">
            {{ getTabIcon(tab.name) }}
          </span>
          <span v-if="tab.isDirty" class="dirty-indicator" :title="t('tabUnsavedTitle')">•</span>
          <span class="tab-name">{{ tab.name }}</span>
          <m3e-icon-button v-if="tab.id === activeTabId" variant="standard" size="extra-small" :title="t('tabCloseTitle')"
            @click.stop="emit('close-tab', tab.id)">
            <span class="material-symbols-rounded">close</span> </m3e-icon-button>
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
      </div>

      <!-- Code Textarea & Line Numbers Area -->
      <div class="editor-workspace-body" :class="`theme-${config.codeTheme || 'github-dark'}`"
        @contextmenu.prevent="e => emit('contextmenu-editor', e)">
        <!-- Line Numbers Column（主题类同时挂在自身：背景/文字直接跟随代码主题，不依赖父级继承） -->
        <div ref="lineNumbersRef" class="line-numbers-column" :class="`theme-${config.codeTheme || 'github-dark'}`"
          :style="{ fontSize: `${config.fontSize || 15}px`, width: lineNumberColumnWidth }">
          <div v-for="n in linesCount" :key="n" class="line-num" :class="{
            'active-line-num': n === cursorLine,
            'matched-line-num': matchedLineNumbers.has(n) && n !== currentMatchedLineNumber,
            'current-matched-line-num': n === currentMatchedLineNumber
          }">
            {{ n }}
          </div>
        </div>

        <!-- Textarea Code Area -->
        <div class="code-area-wrapper">
          <pre ref="codeHighlightRef" class="code-highlight-overlay" aria-hidden="true"
            :style="{ fontSize: `${config.fontSize || 15}px`, tabSize: config.tabSize || 4 }"><code class="hljs"
          v-html="highlightedCode"></code></pre>
          <textarea ref="textareaRef" :value="activeTab.content" class="code-textarea"
            :style="{ fontSize: `${config.fontSize || 15}px`, tabSize: config.tabSize || 4 }" spellcheck="false"
            autocomplete="off" autocorrect="off" autocapitalize="off" @input="handleInput" @keydown="handleKeyDown"
            @scroll="handleScroll" @wheel="handleWheelZoom" @click="updateCursorPosition" @keyup="updateCursorPosition"
            @blur="closeCompletions"></textarea>

          <!-- Code Completion Popup -->
          <div v-if="completionVisible && completionItems.length > 0" class="completion-popup"
            :style="{ left: `${completionPos.left}px`, top: `${completionPos.top}px` }" @mousedown.prevent>
            <div ref="completionListRef" class="completion-list">
              <div v-for="(item, idx) in completionItems" :key="item.label + idx" class="completion-item"
                :class="{ 'is-active': idx === completionIndex }" :ref="(el) => setActiveItemRef(el, idx)"
                @mouseenter="completionIndex = idx" @mousedown.prevent.stop="completionIndex = idx; acceptCompletion()">
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
  border-radius: 10px;
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
  transition: background-color 0.15s, color 0.15s;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dirty-indicator {
  color: var(--accent-amber-text);
  font-size: 1.6rem;
  line-height: 1;
  letter-spacing: -12px;
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
  border: 1.4px solid var(--border-color-muted);
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

.line-num {
  height: 1.5em;
  line-height: 1.5;
  padding-right: 4px;
  border-radius: 2px;
  transition: background-color 0.15s, color 0.15s;
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
  white-space: pre !important;
  word-break: normal !important;
  word-wrap: normal !important;
  overflow-wrap: normal !important;
  overflow: hidden !important;
  pointer-events: none;
  background: transparent !important;
  box-sizing: border-box;
}

.code-highlight-overlay code.hljs {
  padding: 0 !important;
  padding-right: 120px !important;
  background: transparent !important;
  font-family: var(--font-mono) !important;
  font-size: inherit !important;
  line-height: inherit !important;
  white-space: pre !important;
  word-break: normal !important;
  word-wrap: normal !important;
  overflow-wrap: normal !important;
  display: inline-block !important;
  width: max-content !important;
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
  white-space: pre !important;
  word-break: normal !important;
  word-wrap: normal !important;
  overflow-wrap: normal !important;
  overflow: auto !important;
  tab-size: 4;
  box-sizing: border-box;
  z-index: 2;
}

.code-textarea::selection {
  background-color: #f59e0b !important;
  color: #000000 !important;
}

/* Code Completion Popup */
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
  border-top: 1px solid var(--border-color-muted);
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
</style>
