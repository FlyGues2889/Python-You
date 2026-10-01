<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ConsoleOutput } from '../types';
import { paneScroller, watchPaneScroll } from '../utils/contentPane';
import { toDisplayLines } from '../utils/consoleLines';
import { semanticClassOf, isCollapsible, isImage } from '../utils/consoleView';
import { useReplInput } from '../utils/replInput';
import { useI18n } from '../utils/i18n';
import { pythonRunner } from '../utils/pythonRunner';
import { uid } from '../utils/id';

const props = defineProps<{
  outputs: ConsoleOutput[];
  codeTheme?: string;
  demoMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'contextmenu-terminal', event: MouseEvent): void;
  (e: 'add-console-output', output: ConsoleOutput): void;
  (e: 'add-log', output: ConsoleOutput): void;
}>();

const { t } = useI18n();

// 点击终端里的图表时放大查看（null = 未打开）
const previewImage = ref<string | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// 程序正在运行（可能阻塞在 input()）：此时输入行喂给它的 stdin，其余时候就是第二个 REPL。
// 是否在等输入由门面统一派生（stdinWaiting ∨ native runActive），不再在组件里读两个 ref 猜；
// 能喂 stdin 还要求当前后端具备 stdin 能力（演示引擎从不等待输入，此条件恒假，行为不变）
const feedingProgram = () => pythonRunner.awaitingInput.value && pythonRunner.capabilities.value.stdin;

// 图片分支问能力：只有支持出图的后端（native/Pyodide）才会产生带 image 的输出，
// 演示后端不产图，此守卫恒为放行，行为不变
const canShowImages = computed(() => pythonRunner.capabilities.value.images);

const logLine = (type: ConsoleOutput['type'], text: string) => {
  const out: ConsoleOutput = { id: uid(), type, text, timestamp: new Date().toLocaleTimeString() };
  emit('add-console-output', out);
  emit('add-log', out);
};

// 输入模型与交互终端共用（历史、多行续行、粘贴多行）。就是一个普通终端：
// 提示符恒为 `>>>`，输入交给前台——有程序在跑就进它的 stdin，否则当语句执行
const {
  input: inputLine,
  prompt,
  submit,
  handleEnter,
  handleKeyDown,
  handlePaste,
} = useReplInput({
  onLog: logLine,
  onOutput: (out) => emit('add-console-output', out),
  onIntercept: (line) => {
    if (!feedingProgram()) return false;
    // 回显由引擎层做（等价于真实终端的 tty 回显）：它要把这行接进进程输出流的拼装器里，
    // 否则提示串会和程序后续输出粘成一行
    pythonRunner.submitRunInput(line);
    return true;
  },
  demoMode: () => props.demoMode,
});

// 显示行：连续的部分行（同一行分多次到达）合并成一行。
// 末行若还没结束且程序正在运行（例如停在 input("Test: ") 的提示串后面），
// 它不在这里渲染——它的文本要作为输入行的前缀，光标才接得上。
// 进程结束后残留的未结束行按普通行渲染（光标已经不在那里了）。
const allLines = computed(() => toDisplayLines(props.outputs));
const openTail = computed(() => {
  const last = allLines.value[allLines.value.length - 1];
  return last?.open && feedingProgram() ? last : null;
});
const displayLines = computed(() => (openTail.value ? allLines.value.slice(0, -1) : allLines.value));

const terminalContainerRef = ref<HTMLDivElement | null>(null);

// FR-4.5：完整 traceback 默认折叠，点击展开/收起（摘要行始终可见）
const expandedLogs = ref<Set<string>>(new Set());
const toggleLogDetail = (id: string) => {
  if (expandedLogs.value.has(id)) expandedLogs.value.delete(id);
  else expandedLogs.value.add(id);
};
// 展示语义统一由 consoleView 判定（输出契约收口：与 REPL 同一套），此处不再有本地分支

// 用户是否主动滚离底部（阅读/选中文本）：一旦滚离，新输出不再强行拉回底部
let userScrolledAway = false;

const onTerminalScroll = () => {
  const sc = paneScroller(terminalContainerRef.value);
  if (!sc) return;
  userScrolledAway = sc.scrollHeight - sc.scrollTop - sc.clientHeight >= 40;
};

const scrollTerminalToBottom = () => {
  if (userScrolledAway) return;
  const sc = paneScroller(terminalContainerRef.value);
  if (!sc) return;
  sc.scrollTop = sc.scrollHeight;
};

watch(() => props.outputs.length, () => {
  nextTick(scrollTerminalToBottom);
});

// 滚动发生在 m3e-content-pane 的 shadow 内：直接监听 shadow 内滚动容器。
// 挂载时 shadow 内元素尚未渲染完成，推迟一帧再注册。
let stopWatchScroll: (() => void) | null = null;

onMounted(() => {
  requestAnimationFrame(() => {
    stopWatchScroll = watchPaneScroll(terminalContainerRef.value, onTerminalScroll);
    // 挂载时已有历史输出（如视图切换后重建）也应贴底
    scrollTerminalToBottom();
  });
});

onUnmounted(() => {
  stopWatchScroll?.();
  stopWatchScroll = null;
});
</script>

<template>
  <div class="terminal-panel" @contextmenu.prevent="e => emit('contextmenu-terminal', e)">
    <div class="terminal-header">
      <div class="terminal-title">
        <span>{{ t('outputTerminalTitle') }}</span>
        <span v-if="outputs.length > 0" class="logs-count">
          {{ outputs.length }}
        </span>
      </div>

      <div class="terminal-actions">
        <m3e-icon-button size="extra-small" :title="t('clearTerminal')" @click="emit('clear')">
          <span class="material-symbols-rounded">clear_all</span>
        </m3e-icon-button>
      </div>
    </div>

    <!-- 主题类挂在这层：theme.css 的 `.theme-*:not(m3e-content-pane) { background-color: … !important }`
         会把代码主题底色刷到带这个类的元素上。黑卡片只从日志区开始，表头不能在里面 -->
    <div class="terminal-card" :class="`theme-${props.codeTheme || 'github-dark'}`">
    <m3e-content-pane ref="terminalContainerRef" class="terminal-logs-body"
      :class="`theme-${props.codeTheme || 'github-dark'}`">
      <template v-for="line in displayLines" :key="line.key">
        <!-- 可折叠详情（完整 traceback）：默认只显示展开按钮，避免刷屏 -->
        <div v-if="isCollapsible(line.out)" class="log-line log-collapsible" :class="semanticClassOf(line.out)">
          <button class="log-toggle" type="button" @click="toggleLogDetail(line.out.id)">
            <span class="material-symbols-rounded">{{ expandedLogs.has(line.out.id) ? 'expand_less' : 'expand_more'
              }}</span>
            <span>{{ expandedLogs.has(line.out.id) ? t('tracebackCollapse') : t('tracebackExpand') }}</span>
          </button>
          <pre v-show="expandedLogs.has(line.out.id)" class="log-text">{{ line.text }}</pre>
        </div>
        <div v-else class="log-line" :class="semanticClassOf(line.out)">
          <pre v-if="!isImage(line.out) || !canShowImages" class="log-text">{{ line.text }}</pre>
          <img v-else class="terminal-img" :src="line.out.image" alt="matplotlib chart" title="点击查看大图"
            @click="previewImage = line.out.image" />
        </div>
      </template>

      <!-- 输入行并入输出流：提示符与输入接在最后一条输出之后，不再单独占一行。
           与交互终端同一套行为——始终可输入，回车执行语句；程序运行中则把行喂给它的 stdin -->
      <div class="log-line terminal-input-line">
        <!-- 程序正在等输入：它的提示串已经停在行尾（未结束的行），输入直接接上；
             其余时候显示本终端的提示符 >>> / ... -->
        <span v-if="openTail" class="terminal-input-tail">{{ openTail.text }}</span>
        <span v-else class="terminal-input-prompt">{{ prompt }}</span>
        <input ref="inputRef" v-model="inputLine" class="terminal-input" type="text" :placeholder="inputPlaceholder"
          autocomplete="off" autocapitalize="off" spellcheck="false" @keydown.enter.prevent="handleEnter"
          @keydown="handleKeyDown" @paste="handlePaste" />
      </div>
    </m3e-content-pane>
    </div>

  <!-- 图表放大查看（终端里高度受限，细节看不清时可以点开） -->
  <m3e-dialog class="chart-preview-dialog" :open="!!previewImage" @cancel="previewImage = null"
    @closed="previewImage = null">
    <span slot="header" class="m3e-dialog-title-row">
      <span class="m3e-dialog-title">{{ t('chartPreviewTitle') }}</span>
    </span>
    <div v-if="previewImage" class="chart-preview-stage">
      <img class="chart-preview" :src="previewImage" alt="matplotlib chart" />
    </div>
    <div slot="actions" class="chart-preview-actions">
      <m3e-button variant="filled" size="small" @click="previewImage = null">{{ t('closeTitle') }}</m3e-button>
    </div>
  </m3e-dialog>
  </div>
</template>

<style scoped>
/* 与编辑器区同一套做法（.code-editor-container）：容器自己带圆角并裁剪，
   否则这层不透明底色会平铺成直角、把外层卡片的圆角整个盖掉 —— 终端看起来就没圆角了 */
.terminal-panel {
  height: 100%;
  min-height: 0;
  /* 圆角取 16px，与编辑器区的代码块（.editor-workspace-body）同档。
     这层是不透明底色且铺满整块，必须自己裁剪，否则它的直角底色会盖住外层卡片的圆角 */
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--surface-color);
  display: flex;
  flex-direction: column;
}

.terminal-header {
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: none;
  user-select: none;
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.logs-count {
  padding: 0 6px;
  border-radius: 9999px;
  background-color: var(--tertiary-container);
  color: var(--tertiary);
  font-size: 0.75rem;
}

.terminal-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.terminal-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
}

.terminal-logs-body {
  flex: 1;
  min-height: 0;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  font-family: var(--font-terminal);
  font-size: 0.8125rem;
  -webkit-user-select: text !important;
  user-select: text !important;
  /* m3e-content-pane 的外观由 shadow 内 .base/.scroll-container 绘制，经变量控制：
     padding 单值（右端自动扣除滚动条宽度）、圆角、背景色 */
  --m3e-content-pane-container-padding: 8px;
  /* 四角与编辑器区同档（16px）：输入行已并入内容流，下圆角不再需要单独处理 */
  --m3e-content-pane-container-shape: 16px;
  --m3e-content-pane-container-color: var(--bg-color);
}

/* 背景跟随编辑器主题：背景绘制在 shadow 内，须经 --m3e-content-pane-container-color
   传入（与 index.css 全局 .theme-* 根规则同值）；这里补前景色 */
.terminal-logs-body.theme-github-dark { --m3e-content-pane-container-color: #0d1117; color: #c9d1d9; }
.terminal-logs-body.theme-monokai { --m3e-content-pane-container-color: #272822; color: #f8f8f2; }
.terminal-logs-body.theme-one-dark { --m3e-content-pane-container-color: #282c34; color: #abb2bf; }
.terminal-logs-body.theme-vs-code { --m3e-content-pane-container-color: #1e1e1e; color: #d4d4d4; }
.terminal-logs-body.theme-github-light { --m3e-content-pane-container-color: #ffffff; color: #24292e; }
.terminal-logs-body.theme-one-light { --m3e-content-pane-container-color: #fafafa; color: #383a42; }
.terminal-logs-body.theme-vs-code-light { --m3e-content-pane-container-color: #ffffff; color: #000000; }
.terminal-logs-body.theme-solarized-light { --m3e-content-pane-container-color: #fdf6e3; color: #657b83; }

/* 所有后代均可选中：避免拖选经过 log-line 的空隙/容器时选区被 user-select:none 截断取消 */
.terminal-logs-body *,
.terminal-logs-body *::before,
.terminal-logs-body *::after {
  -webkit-user-select: text !important;
  user-select: text !important;
}

.log-line {
  display: flex;
  gap: 8px;
  line-height: 1.4;
  margin-bottom: 2px;
}

.log-text {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
  color: inherit;
  -webkit-user-select: text !important;
  user-select: text !important;
}

.log-collapsible {
  flex-direction: column;
  gap: 0;
}

.log-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  padding: 2px 10px;
  border: 1px solid var(--border-color-muted);
  border-radius: 8px;
  background: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color var(--motion-effects-fast), color var(--motion-effects-fast);
}

.log-toggle:hover {
  background-color: var(--surface-variant);
  color: var(--text-color);
}

.log-toggle .material-symbols-rounded {
  font-size: 1rem;
}

.log-collapsible .log-text {
  margin-top: 4px;
}

/* 日志语义色随代码主题深浅切换（浅色主题取深色调保证对比度；solarized 单独用其调色板） */
.terminal-logs-body.theme-github-dark,
.terminal-logs-body.theme-monokai,
.terminal-logs-body.theme-one-dark,
.terminal-logs-body.theme-vs-code {
  --log-system-color: #60a5fa;
  --log-warning-color: #f59e0b;
  --log-error-color: #ffb4ab;
}

.terminal-logs-body.theme-github-light,
.terminal-logs-body.theme-one-light,
.terminal-logs-body.theme-vs-code-light,
.terminal-logs-body.theme-solarized-light {
  --log-system-color: #1d4ed8;
  --log-warning-color: #b45309;
  --log-error-color: #ba1a1a;
}

.terminal-logs-body.theme-solarized-light {
  --log-system-color: #268bd2;
  --log-warning-color: #cb4b16;
  --log-error-color: #dc322f;
}

/* INFO / System messages */
.log-system {
  color: var(--log-system-color, #3b82f6);
  font-weight: 600;
}

/* WARN / Warning messages */
.log-warning {
  color: var(--log-warning-color, #f59e0b);
  font-weight: 600;
}

/* ERROR / Exception / Traceback messages */
.log-error {
  color: var(--log-error-color, var(--error));
  font-weight: 600;
}

/* 弹窗宽度取屏幕能给的最宽（全局 m3e-dialog 限到 26rem，图表预览需要更宽），
   图片只在这个宽度里等比缩放，不反过来决定弹窗有多宽 */
.chart-preview-dialog {
  --m3e-dialog-max-width: min(92vw, 1200px);
  --m3e-dialog-min-width: min(92vw, 1200px);
}

.chart-preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: min(70vh, 720px);
}

.chart-preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
}

.chart-preview-actions {
  display: flex;
  justify-content: flex-end;
}

.terminal-img {
  max-width: min(100%, 460px);
  max-height: 240px;
  margin: 4px 0;
  border-radius: 8px; /* CornerSmall（原 6px 不在刻度上） */
  background: #fff; /* 图表本身是白底 PNG，深色主题下给个白底免得透明边发灰 */
  cursor: zoom-in;
}

/* 输入行：与 log-line 同一套排版，行高/字号跟随终端文本；
   原来是独立一行的输入条，保持 32px 行高与 10px 左内边距（内容层已有 8px，这里补 2px） */
.terminal-input-line {
  align-items: center;
  min-height: 32px;
  padding-left: 2px;
  margin-bottom: 0;
}

.terminal-input-prompt {
  color: var(--secondary);
  font-weight: 700;
  flex-shrink: 0;
}

/* 未结束的行（程序提示串）作为输入前缀：与日志同色同字体，不做强调 */
.terminal-input-tail {
  white-space: pre-wrap;
  word-break: break-word;
  color: inherit;
}

.terminal-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  caret-color: var(--primary);
}

.terminal-input::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}
</style>
