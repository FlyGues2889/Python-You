<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ConsoleOutput, AppConfig } from '../types';
import { pythonRunner } from '../utils/pythonRunner';
import { nativePython } from '../utils/nativePython';
import { paneScroller, watchPaneScroll } from '../utils/contentPane';
import { useI18n } from '../utils/i18n';
import { uid } from '../utils/id';

const props = defineProps<{
  config?: AppConfig;
  logs?: ConsoleOutput[];
  codeTheme?: string; // 已解析的代码主题（'system' 由 App.vue 映射为具体主题）
}>();

const emit = defineEmits<{
  (e: 'add-log', output: ConsoleOutput): void;
  (e: 'clear-logs'): void;
  (e: 'add-console-output', output: ConsoleOutput): void;
  (e: 'contextmenu-terminal', event: MouseEvent): void;
}>();

const { t, tf } = useI18n();

// 欢迎语按真实引擎动态生成（L-11 修复）：演示模式 / 本机 Python / Pyodide 各有对应文案
const replWelcome = computed(() => {
  if (props.config?.demoMode) {
    return t('replWelcomeDemo');
  }
  const label = nativePython.statusLabel.value;
  if (label && label !== 'Pyodide') {
    return tf('replWelcomeLocal', { label });
  }
  return t('replWelcomePyodide');
});

const inputCommand = ref('');
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const consoleContainerRef = ref<HTMLDivElement | null>(null);
const replInputRef = ref<HTMLInputElement | null>(null);
const promptRowRef = ref<HTMLDivElement | null>(null);

// 会话记录由 App 持有（props.logs），切换页面不丢失；应用重启后由 App 内存态自动清空
const logs = computed<ConsoleOutput[]>(() => props.logs || []);

// FR-4.5：完整 traceback 默认折叠，点击展开/收起（摘要行始终可见）
const expandedLogs = ref<Set<string>>(new Set());
const toggleLogDetail = (id: string) => {
  if (expandedLogs.value.has(id)) expandedLogs.value.delete(id);
  else expandedLogs.value.add(id);
};

// 用户是否滚离底部：贴底时新输出自动滚到底部，滚离后不打断阅读/选区
const userScrolledAway = ref(false);

const onBodyScroll = () => {
  const sc = paneScroller(consoleContainerRef.value);
  if (!sc) return;
  userScrolledAway.value = sc.scrollHeight - sc.scrollTop - sc.clientHeight >= 40;
};

const scrollReplToBottom = () => {
  if (userScrolledAway.value) return;
  const sc = paneScroller(consoleContainerRef.value);
  if (!sc) return;
  sc.scrollTop = sc.scrollHeight;
};

// 聚焦/输入时确保提示行可见（终端行为：键入时提示符始终在视野内）
const ensurePromptVisible = () => {
  nextTick(() => {
    promptRowRef.value?.scrollIntoView({ block: 'end' });
  });
};

// 多行续行（FR-4.4）：语句未闭合（括号未配平 / 行尾冒号）时进入续行模式，
// 提示符变 `...`，继续输入直到语句闭合才执行；粘贴多行代码直接整体执行
const pendingLines = ref<string[]>([]);
const isContinuation = computed(() => pendingLines.value.length > 0);

// 粗略判断语句是否需要续行：忽略引号内容，检查括号配平 + 最后一行行尾冒号
const isUnclosed = (text: string): boolean => {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === '\\') i++;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") inStr = ch;
    else if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
  }
  if (depth > 0) return true;
  const lines = text.split('\n');
  const last = lines[lines.length - 1].trimEnd();
  return last.endsWith(':');
};

const emitReplLog = (type: ConsoleOutput['type'], text: string) => {
  const out: ConsoleOutput = { id: uid(), type, text, timestamp: new Date().toLocaleTimeString() };
  emit('add-log', out);
  emit('add-console-output', out);
};

const runStatement = async (statement: string) => {
  commandHistory.value.push(statement);
  historyIndex.value = commandHistory.value.length;
  await pythonRunner.runREPL(statement, (out) => {
    emit('add-log', out);
    emit('add-console-output', out);
  }, props.config?.demoMode);
  nextTick(scrollReplToBottom);
};

const handleExecute = async () => {
  const cmd = inputCommand.value;
  inputCommand.value = '';
  if (!cmd.trim()) return;

  // 粘贴的多行代码：整体执行（不进入逐行续行状态；回显由 runREPL 统一处理）
  if (cmd.includes('\n')) {
    const full = [...pendingLines.value, cmd].join('\n');
    pendingLines.value = [];
    await runStatement(full);
    return;
  }

  const trimmed = cmd.trim();
  // 进入续行模式：首个未闭合语句
  if (pendingLines.value.length === 0 && isUnclosed(trimmed)) {
    pendingLines.value = [trimmed];
    emitReplLog('input', `>>> ${trimmed}`);
    return;
  }
  // 续行中：仍未闭合 → 继续累积
  if (pendingLines.value.length > 0 && isUnclosed(trimmed)) {
    pendingLines.value.push(trimmed);
    emitReplLog('input', `... ${trimmed}`);
    return;
  }
  // 续行闭合 / 普通单行：执行（回显由 runREPL 统一处理）
  const full = pendingLines.value.length > 0 ? [...pendingLines.value, trimmed].join('\n') : trimmed;
  pendingLines.value = [];
  await runStatement(full);
};

// 回车执行（输入法组合期间的回车用于选词，不执行）
const handlePromptEnter = (e: KeyboardEvent) => {
  if (e.isComposing) return;
  handleExecute();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.isComposing) return;
  // Esc 取消续行模式（丢弃已输入的多行缓冲）
  if (e.key === 'Escape' && pendingLines.value.length > 0) {
    pendingLines.value = [];
    e.preventDefault();
    return;
  }
  if (e.key === 'ArrowUp') {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      inputCommand.value = commandHistory.value[historyIndex.value] || '';
    }
  } else if (e.key === 'ArrowDown') {
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++;
      inputCommand.value = commandHistory.value[historyIndex.value] || '';
    } else {
      historyIndex.value = commandHistory.value.length;
      inputCommand.value = '';
    }
  }
};

// 点击显示区空白处聚焦输入行；点击日志文本或存在选区时不打断选中
const onBodyClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('.repl-log-line')) return;
  if (!(window.getSelection()?.isCollapsed ?? true)) return;
  replInputRef.value?.focus();
};

// 粘贴多行代码：input 元素会丢弃换行符，须拦截并手动置入（整体执行走 handleExecute 的多行分支）
const handlePaste = (e: ClipboardEvent) => {
  const pasted = e.clipboardData?.getData('text');
  if (pasted && pasted.includes('\n')) {
    e.preventDefault();
    inputCommand.value = pasted.replace(/\r\n/g, '\n');
    handleExecute();
  }
};

// 异步输出（如流式 stdout）到达时同样按贴底规则滚动
watch(() => logs.value.length, () => nextTick(scrollReplToBottom));

// 滚动发生在 m3e-content-pane 的 shadow 内：直接监听 shadow 内滚动容器。
// 挂载时 shadow 内元素尚未渲染完成，推迟一帧再注册。
let stopWatchScroll: (() => void) | null = null;

onMounted(() => {
  requestAnimationFrame(() => {
    stopWatchScroll = watchPaneScroll(consoleContainerRef.value, onBodyScroll);
  });
  replInputRef.value?.focus();
});

onUnmounted(() => {
  stopWatchScroll?.();
  stopWatchScroll = null;
});

const clearLogs = () => {
  emit('clear-logs');
};
</script>

<template>
  <div class="repl-console-container" @contextmenu.prevent="e => emit('contextmenu-terminal', e)">
    <div class="repl-header">
      <div class="repl-title">
        <span class="material-symbols-rounded">terminal</span>
        <span>{{ t('replTitle') }}</span>
      </div>
      <m3e-button variant="tonal" size="extra-small" :title="t('clearTerminalTooltip')" @click="clearLogs">
        <span slot="icon" class="material-symbols-rounded">clear_all</span>
        {{ t('clearTerminal') }}
      </m3e-button>
    </div>

    <!-- 控制台主体卡片：存放终端显示区（圆角、外边距、surface 底色都在这一层） -->
    <div class="repl-console-main">
      <!-- 终端显示区 + 行内输入提示符（终端式：直接在显示区输入）
           主题类只挂在显示区上：全局 .theme-* 规则（index.css）只会涂这一层，
           卡片框与外边距区域保持 --surface-color；滚动监听挂在 shadow 内滚动容器上 -->
      <m3e-content-pane ref="consoleContainerRef" class="repl-body"
        :class="`theme-${codeTheme || config?.codeTheme || 'github-dark'}`" @click="onBodyClick">
        <div v-if="logs.length === 0" class="repl-welcome">
          <pre>{{ replWelcome }}</pre>
        </div>

        <div v-for="log in logs" :key="log.id" class="repl-log-line" :class="`log-${log.type}`">
          <button v-if="log.collapsible" class="repl-detail-toggle" type="button" @click="toggleLogDetail(log.id)">
            <span class="material-symbols-rounded">{{ expandedLogs.has(log.id) ? 'expand_less' : 'expand_more'
              }}</span>
            <span>{{ expandedLogs.has(log.id) ? t('tracebackCollapse') : t('tracebackExpand') }}</span>
          </button>
          <pre v-show="!log.collapsible || expandedLogs.has(log.id)">{{ log.text }}</pre>
        </div>

        <div ref="promptRowRef" class="repl-inline-prompt">
          <span class="prompt-symbol">{{ isContinuation ? '...' : '&gt;&gt;&gt;' }}</span>
          <input ref="replInputRef" v-model="inputCommand" class="repl-inline-input" type="text"
            :placeholder="logs.length === 0 ? t('replPlaceholder') : ''" autocomplete="off" autocapitalize="off"
            spellcheck="false" @keydown.enter.prevent="handlePromptEnter" @keydown="handleKeyDown"
            @focus="ensurePromptVisible" @input="ensurePromptVisible" @paste="handlePaste" />
        </div>
      </m3e-content-pane>
    </div>
  </div>
</template>

<style scoped>
.repl-console-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 主体卡片外边距区域与标题栏同为 surface 色（与工作区背景一致） */
  background-color: var(--surface-color);
  font-family: var(--font-terminal);
  transition: all 0.2s ease;
}

/* 主题背景/前景：index.css 的全局 .theme-* 规则负责主样式（!important 优先）；
   此处 scoped 兜底保证即使全局样式未注入/被缓存拦截，显示区也始终呈现主题色，
   不会回退到应用底色（--bg-color/--surface-color）。两者同值，互不冲突。
   背景绘制在 content-pane 的 shadow 内，须经 --m3e-content-pane-container-color 传入；
   color 为前景色，host 上直接继承给 slot 内容。 */
.repl-body.theme-github-dark { --m3e-content-pane-container-color: #0d1117; color: #c9d1d9; }
.repl-body.theme-monokai { --m3e-content-pane-container-color: #272822; color: #f8f8f2; }
.repl-body.theme-one-dark { --m3e-content-pane-container-color: #282c34; color: #abb2bf; }
.repl-body.theme-vs-code { --m3e-content-pane-container-color: #1e1e1e; color: #d4d4d4; }
.repl-body.theme-github-light { --m3e-content-pane-container-color: #ffffff; color: #24292e; }
.repl-body.theme-one-light { --m3e-content-pane-container-color: #fafafa; color: #383a42; }
.repl-body.theme-vs-code-light { --m3e-content-pane-container-color: #ffffff; color: #000000; }
.repl-body.theme-solarized-light { --m3e-content-pane-container-color: #fdf6e3; color: #657b83; }

.repl-header {
  height: 42px;
  padding: 0 16px;
  background-color: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repl-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-color);
}

/* 控制台主体卡片：surface 底色 + 圆角描边 + 外边距（外边距区域与标题栏同为容器 surface 底色） */
.repl-console-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 12px 12px;
  border-radius: 10px;
  background-color: var(--surface-color);
  overflow: hidden;
}

.repl-body {
  flex: 1;
  min-height: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  /* m3e-content-pane 的外观由 shadow 内 .base/.scroll-container 绘制，经变量控制：
     padding 单值（右端自动扣除滚动条宽度）、圆角、背景色 */
  --m3e-content-pane-container-padding: 12px;
  --m3e-content-pane-container-shape: 6px;
  -webkit-user-select: text !important;
  user-select: text !important;
}

/* 所有后代均可选中：避免拖选经过行间隙/容器时选区被 user-select:none 截断取消 */
.repl-body *,
.repl-body *::before,
.repl-body *::after {
  -webkit-user-select: text !important;
  user-select: text !important;
}

.repl-welcome {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.repl-welcome pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.repl-log-line pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.repl-detail-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  margin: 2px 0;
  border: 1px solid var(--border-color-muted);
  border-radius: 8px;
  background: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.repl-detail-toggle:hover {
  background-color: var(--surface-variant);
  color: var(--text-color);
}

.repl-detail-toggle .material-symbols-rounded {
  font-size: 1rem;
}

/* 日志语义色随代码主题深浅切换（浅色主题取深色调保证对比度；solarized 单独用其调色板） */
.repl-body.theme-github-dark,
.repl-body.theme-monokai,
.repl-body.theme-one-dark,
.repl-body.theme-vs-code {
  --log-input-color: #ffd54f;
  --log-stdout-color: #81c784;
  --log-error-color: #ffb4ab;
}

.repl-body.theme-github-light,
.repl-body.theme-one-light,
.repl-body.theme-vs-code-light,
.repl-body.theme-solarized-light {
  --log-input-color: #7d4e00;
  --log-stdout-color: #1a7f37;
  --log-error-color: #ba1a1a;
}

.repl-body.theme-solarized-light {
  --log-input-color: #b58900;
  --log-stdout-color: #859900;
  --log-error-color: #dc322f;
}

.log-input {
  color: var(--log-input-color, #ffd54f);
  font-weight: 600;
}

.log-stdout {
  color: var(--log-stdout-color, #81c784);
}

.log-stderr,
.log-error {
  color: var(--log-error-color, var(--error));
}

/* 行内输入提示行：位于输出区末尾，随内容一起滚动 */
.repl-inline-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.prompt-symbol {
  color: var(--secondary);
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.repl-inline-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  caret-color: var(--primary);
}

.repl-inline-input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.7;
}
</style>
