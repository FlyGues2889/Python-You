<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ConsoleOutput } from '../types';
import { paneScroller, watchPaneScroll } from '../utils/contentPane';
import { useI18n } from '../utils/i18n';
import { pythonRunner } from '../utils/pythonRunner';
import { nativePython } from '../utils/nativePython';
import { uid } from '../utils/id';

const props = defineProps<{
  outputs: ConsoleOutput[];
  codeTheme?: string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'contextmenu-terminal', event: MouseEvent): void;
  (e: 'add-console-output', output: ConsoleOutput): void;
}>();

const { t } = useI18n();

// 底部 stdin 输入框：Pyodide 等待输入，或本机 run 会话进行中（程序可能阻塞在 input()）时可用
const inputEnabled = computed(() => pythonRunner.stdinWaiting.value || nativePython.runActive.value);
const inputPlaceholder = computed(() => pythonRunner.stdinPrompt.value || t('terminalInputPlaceholder'));
const inputLine = ref('');
// 点击终端里的图表时放大查看（null = 未打开）
const previewImage = ref<string | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const submitInput = () => {
  const line = inputLine.value;
  inputLine.value = '';
  if (!inputEnabled.value) return;
  emit('add-console-output', {
    id: uid(),
    type: 'input',
    text: `$ ${line}`,
    timestamp: new Date().toLocaleTimeString(),
  });
  pythonRunner.submitRunInput(line);
};

const onInputKeydown = (e: KeyboardEvent) => {
  if (e.isComposing) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    submitInput();
  }
};

const terminalContainerRef = ref<HTMLDivElement | null>(null);

// FR-4.5：完整 traceback 默认折叠，点击展开/收起（摘要行始终可见）
const expandedLogs = ref<Set<string>>(new Set());
const toggleLogDetail = (id: string) => {
  if (expandedLogs.value.has(id)) expandedLogs.value.delete(id);
  else expandedLogs.value.add(id);
};

const getLogTypeClass = (out: ConsoleOutput) => {
  const text = out.text || '';
  if (out.type === 'error' || out.type === 'stderr' || text.includes('[ERROR]') || text.includes('Error:') || text.includes('Traceback')) {
    return 'log-error';
  }
  if (out.type === 'warning' || text.includes('[WARN]') || text.includes('Warning:')) {
    return 'log-warning';
  }
  if (out.type === 'system' || out.type === 'info' || text.includes('[INFO]') || text.startsWith('▶')) {
    return 'log-system';
  }
  return 'log-stdout';
};

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
      <div v-if="outputs.length === 0" class="terminal-placeholder"></div>
      <template v-for="out in outputs" :key="out.id">
        <!-- 可折叠详情（完整 traceback）：默认只显示展开按钮，避免刷屏 -->
        <div v-if="out.collapsible" class="log-line log-collapsible" :class="getLogTypeClass(out)">
          <button class="log-toggle" type="button" @click="toggleLogDetail(out.id)">
            <span class="material-symbols-rounded">{{ expandedLogs.has(out.id) ? 'expand_less' : 'expand_more'
              }}</span>
            <span>{{ expandedLogs.has(out.id) ? t('tracebackCollapse') : t('tracebackExpand') }}</span>
          </button>
          <pre v-show="expandedLogs.has(out.id)" class="log-text">{{ out.text }}</pre>
        </div>
        <div v-else class="log-line" :class="getLogTypeClass(out)">
          <pre v-if="!out.image" class="log-text">{{ out.text }}</pre>
          <img v-else class="terminal-img" :src="out.image" alt="matplotlib chart" title="点击查看大图"
            @click="previewImage = out.image" />
        </div>
      </template>
    </m3e-content-pane>

    <div class="terminal-input-row">
      <span class="terminal-input-prompt">>>></span>
      <input ref="inputRef" v-model="inputLine" class="terminal-input" type="text"
        :disabled="!inputEnabled" :placeholder="inputPlaceholder" autocomplete="off" autocapitalize="off"
        spellcheck="false" @keydown="onInputKeydown" />
    </div>
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
  /* 上圆角与编辑器区同档（16px）；下圆角交给下面的输入行，避免两处圆角打架 */
  --m3e-content-pane-container-shape: 16px 16px 0 0;
  --m3e-content-pane-container-color: var(--bg-color);
}

/* 背景跟随编辑器主题：背景绘制在 shadow 内，须经 --m3e-content-pane-container-color
   传入（与 index.css 全局 .theme-* 根规则同值）；这里补前景色 */
.terminal-logs-body.theme-github-dark { --m3e-content-pane-container-color: #0d1117; --terminal-bg: #0d1117; color: #c9d1d9; }
.terminal-logs-body.theme-monokai { --m3e-content-pane-container-color: #272822; --terminal-bg: #272822; color: #f8f8f2; }
.terminal-logs-body.theme-one-dark { --m3e-content-pane-container-color: #282c34; --terminal-bg: #282c34; color: #abb2bf; }
.terminal-logs-body.theme-vs-code { --m3e-content-pane-container-color: #1e1e1e; --terminal-bg: #1e1e1e; color: #d4d4d4; }
.terminal-logs-body.theme-github-light { --m3e-content-pane-container-color: #ffffff; --terminal-bg: #ffffff; color: #24292e; }
.terminal-logs-body.theme-one-light { --m3e-content-pane-container-color: #fafafa; --terminal-bg: #fafafa; color: #383a42; }
.terminal-logs-body.theme-vs-code-light { --m3e-content-pane-container-color: #ffffff; --terminal-bg: #ffffff; color: #000000; }
.terminal-logs-body.theme-solarized-light { --m3e-content-pane-container-color: #fdf6e3; --terminal-bg: #fdf6e3; color: #657b83; }

/* 所有后代均可选中：避免拖选经过 log-line 的空隙/容器时选区被 user-select:none 截断取消 */
.terminal-logs-body *,
.terminal-logs-body *::before,
.terminal-logs-body *::after {
  -webkit-user-select: text !important;
  user-select: text !important;
}

.terminal-placeholder {
  color: var(--text-tertiary);
  font-style: italic;
  padding: 1rem 0;
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

.terminal-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  font-family: var(--font-terminal);
  font-size: 0.8125rem;
  background-color: var(--terminal-bg, var(--bg-color));
  flex-shrink: 0;
  border-radius: 0 0 16px 16px;
}

.terminal-input-prompt {
  color: var(--secondary);
  font-weight: 700;
  flex-shrink: 0;
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

.terminal-input:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.terminal-input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.8;
}

/* 终端卡片整体背景（含输入行）跟随代码主题 */
.terminal-card.theme-github-dark { --terminal-bg: #0d1117; }
.terminal-card.theme-monokai { --terminal-bg: #272822; }
.terminal-card.theme-one-dark { --terminal-bg: #282c34; }
.terminal-card.theme-vs-code { --terminal-bg: #1e1e1e; }
.terminal-card.theme-github-light { --terminal-bg: #ffffff; }
.terminal-card.theme-one-light { --terminal-bg: #fafafa; }
.terminal-card.theme-vs-code-light { --terminal-bg: #ffffff; }
.terminal-card.theme-solarized-light { --terminal-bg: #fdf6e3; }
</style>
