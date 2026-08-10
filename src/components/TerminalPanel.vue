<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ConsoleOutput } from '../types';
import { paneScroller, watchPaneScroll } from '../utils/contentPane';
import { useI18n } from '../utils/i18n';

const props = defineProps<{
  outputs: ConsoleOutput[];
  codeTheme?: string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'contextmenu-terminal', event: MouseEvent): void;
}>();

const { t } = useI18n();

const terminalContainerRef = ref<HTMLDivElement | null>(null);

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

    <m3e-content-pane ref="terminalContainerRef" class="terminal-logs-body"
      :class="`theme-${props.codeTheme || 'github-dark'}`">
      <div v-if="outputs.length === 0" class="terminal-placeholder"></div>
      <div v-for="out in outputs" :key="out.id" class="log-line" :class="getLogTypeClass(out)">
        <pre class="log-text">{{ out.text }}</pre>
      </div>
    </m3e-content-pane>
  </div>
</template>

<style scoped>
.terminal-panel {
  height: 100%;
  min-height: 0;
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
  --m3e-content-pane-container-shape: 1rem;
  --m3e-content-pane-container-color: var(--bg-color);
}

/* 背景跟随编辑器主题：背景绘制在 shadow 内，须经 --m3e-content-pane-container-color
   传入（与 index.css 全局 .theme-* 根规则同值）；这里补前景色 */
.terminal-logs-body.theme-github-dark { --m3e-content-pane-container-color: #0d1117; color: #c9d1d9; }
.terminal-logs-body.theme-monokai { --m3e-content-pane-container-color: #272822; color: #f8f8f2; }
.terminal-logs-body.theme-one-dark { --m3e-content-pane-container-color: #282c34; color: #abb2bf; }
.terminal-logs-body.theme-vs-code { --m3e-content-pane-container-color: #1e1e1e; color: #d4d4d4; }
.terminal-logs-body.theme-github-light { --m3e-content-pane-container-color: #ffffff; color: #24292e; }

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

/* INFO / System messages */
.log-system {
  color: #3b82f6;
  font-weight: 600;
}

/* WARN / Warning messages */
.log-warning {
  color: #f59e0b;
  font-weight: 600;
}

/* ERROR / Exception / Traceback messages */
.log-error {
  color: var(--error);
  font-weight: 600;
}
</style>
