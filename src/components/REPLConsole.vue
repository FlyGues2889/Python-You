<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ConsoleOutput, AppConfig } from '../types';
import { pythonRunner } from '../utils/pythonRunner';
import { paneScroller, watchPaneScroll } from '../utils/contentPane';
import { useI18n } from '../utils/i18n';

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

const { t } = useI18n();
const inputCommand = ref('');
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const consoleContainerRef = ref<HTMLDivElement | null>(null);
const replInputRef = ref<HTMLInputElement | null>(null);
const promptRowRef = ref<HTMLDivElement | null>(null);

// 会话记录由 App 持有（props.logs），切换页面不丢失；应用重启后由 App 内存态自动清空
const logs = computed<ConsoleOutput[]>(() => props.logs || []);

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

const handleExecute = async () => {
  const cmd = inputCommand.value.trim();
  if (!cmd) return;

  commandHistory.value.push(cmd);
  historyIndex.value = commandHistory.value.length;
  inputCommand.value = '';

  await pythonRunner.runREPL(cmd, (out) => {
    emit('add-log', out);
    emit('add-console-output', out);
  }, props.config?.demoMode);

  nextTick(scrollReplToBottom);
};

// 回车执行（输入法组合期间的回车用于选词，不执行）
const handlePromptEnter = (e: KeyboardEvent) => {
  if (e.isComposing) return;
  handleExecute();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.isComposing) return;
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
          Python 3.11.0 (main, Pyodide WASM Runtime)
          Type "help", "copyright", "credits" or "license" for more information.
        </div>

        <div v-for="log in logs" :key="log.id" class="repl-log-line" :class="`log-${log.type}`">
          <pre>{{ log.text }}</pre>
        </div>

        <div ref="promptRowRef" class="repl-inline-prompt">
          <span class="prompt-symbol">&gt;&gt;&gt;</span>
          <input ref="replInputRef" v-model="inputCommand" class="repl-inline-input" type="text"
            :placeholder="logs.length === 0 ? t('replPlaceholder') : ''" autocomplete="off" autocapitalize="off"
            spellcheck="false" @keydown.enter.prevent="handlePromptEnter" @keydown="handleKeyDown"
            @focus="ensurePromptVisible" @input="ensurePromptVisible" />
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

.repl-log-line pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-input {
  color: #ffd54f;
  font-weight: 600;
}

.log-stdout {
  color: #81c784;
}

.log-stderr,
.log-error {
  color: var(--error);
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
