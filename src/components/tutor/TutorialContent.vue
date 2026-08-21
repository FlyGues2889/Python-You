<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { type TutorialTopic, getLocalizedTutorialStages } from './tutorialData';
import { getTopicQuiz } from './quizData';
import { safeStorage } from '../../utils/storage';
import { copyToClipboard } from '../../utils/clipboard';
import { paneScroller, watchPaneScroll } from '../../utils/contentPane';
import { useI18n } from '../../utils/i18n';
import { hljs } from '../../utils/highlightSetup';
import 'highlight.js/styles/github-dark.css';
import TutorialFormattedText from './TutorialFormattedText.vue';

const props = defineProps<{
  topic: TutorialTopic;
  isCompleted?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select-topic', topicId: string): void;
  (e: 'load-code-to-editor', payload: { code: string; topicId: string; topicTitle: string }): void;
  (e: 'toggle-completed'): void;
  (e: 'open-quiz'): void;
  (e: 'contextmenu-tutorial', event: MouseEvent): void;
}>();

const contentViewRef = ref<HTMLElement | null>(null);
const copiedCode = ref(false);
const { t } = useI18n();

const hasQuiz = computed(() => !!getTopicQuiz(props.topic.id));

const showBackToTop = ref(false);

// 目录侧栏自动显隐（替代折叠按钮）：
// 侧栏固定占 200px + 与正文 32px 间距，正文区域可用宽度达到 650+232 时才出现
//（保证出现后正文仍 ≥650px）；回落到滞回带以下才收起，避免临界宽度处反复横跳
const tocVisible = ref(false);
const TOC_SIDEBAR_EXTRA_PX = 200 + 32;
const TOC_APPEAR_PX = 650 + TOC_SIDEBAR_EXTRA_PX;
const TOC_HIDE_PX = TOC_APPEAR_PX - 60;

let tocResizeObserver: ResizeObserver | null = null;

const updateTocVisibility = () => {
  const el = contentViewRef.value;
  if (!el) return;
  const avail = el.clientWidth - 64; // 容器左右内边距 32px*2
  if (!tocVisible.value) {
    if (avail >= TOC_APPEAR_PX) tocVisible.value = true;
  } else if (avail < TOC_HIDE_PX) {
    tocVisible.value = false;
  }
};

const readingTime = computed(() => {
  const text = (props.topic.content.overview || '') +
    props.topic.content.sections.map(s => (s.heading || '') + (s.text || '')).join('');
  return Math.max(1, Math.ceil(text.length / 400));
});

// m3e-toc 会自动从正文(control)扫描 h1-h6 生成目录并高亮当前段，
// 这里只判断是否存在分段标题，用于决定是否显示目录侧栏
const hasSections = computed(() => props.topic.content.sections.some(s => s.heading));

const currentProgress = computed(() => {
  const total = allTopics.value.length;
  const current = currentIndex.value + 1;
  return total > 0 ? `${current} / ${total}` : '';
});

const scrollToTop = () => {
  paneScroller(contentViewRef.value)?.scrollTo({ top: 0, behavior: 'smooth' });
};

// 滚动发生在 m3e-content-pane 的 shadow 内：直接读 shadow 内滚动容器
const handleScroll = () => {
  const sc = paneScroller(contentViewRef.value);
  if (!sc || !props.topic?.id) return;
  safeStorage.setItem(`python_you_tutorial_scroll_${props.topic.id}`, sc.scrollTop.toString());
  showBackToTop.value = sc.scrollTop > 400;
};

const restoreOrResetScroll = (isTopicChanged: boolean) => {
  // 等待一帧：既等 Vue 渲染完新内容，也等 shadow 内滚动容器渲染完成
  requestAnimationFrame(() => {
    const sc = paneScroller(contentViewRef.value);
    if (!sc) return;
    if (isTopicChanged) {
      sc.scrollTop = 0;
    } else {
      const saved = safeStorage.getItem(`python_you_tutorial_scroll_${props.topic?.id}`);
      if (saved !== null) {
        sc.scrollTop = parseFloat(saved) || 0;
      } else {
        sc.scrollTop = 0;
      }
    }
  });
};

// m3e-toc 通过 for="tutorial-article" 把 host 当作滚动容器（control）：
// 读取 control.scrollTop 计算当前段、监听 control 的 scroll 事件。实际滚动在 shadow 内，
// 需要在 host 实例上同步这两个通道（点击跳转用的是 scrollIntoView，不受影响）。
const syncPaneToToc = () => {
  const host = contentViewRef.value;
  const sc = paneScroller(host);
  if (!host || !sc) return;
  Object.defineProperty(host, 'scrollTop', {
    configurable: true,
    get: () => sc.scrollTop,
    set: (v: number) => { sc.scrollTop = v; }
  });
  // 手动转发（scroll 事件是否穿透 shadow 边界随浏览器而定，双触发无害——toc 端 debounce）
  sc.addEventListener('scroll', () => host.dispatchEvent(new Event('scroll')));
};

let stopWatchScroll: (() => void) | null = null;

onMounted(() => {
  // 等待自定义元素渲染出 shadow 内滚动容器（约一帧）后，再注册滚动监听并同步 TOC 通道
  requestAnimationFrame(() => {
    stopWatchScroll = watchPaneScroll(contentViewRef.value, handleScroll);
    syncPaneToToc();
  });
  restoreOrResetScroll(false);
  updateTocVisibility();
  tocResizeObserver = new ResizeObserver(updateTocVisibility);
  if (contentViewRef.value) {
    tocResizeObserver.observe(contentViewRef.value);
  }
});

onUnmounted(() => {
  stopWatchScroll?.();
  stopWatchScroll = null;
  tocResizeObserver?.disconnect();
  tocResizeObserver = null;
});

watch(() => props.topic?.id, (newId, oldId) => {
  if (newId !== oldId) {
    restoreOrResetScroll(true);
  }
});

const highlightPython = (code: string) => {
  if (!code) return '';
  try {
    return hljs.highlight(code, { language: 'python' }).value;
  } catch (e) {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

const localizedStages = computed(() => getLocalizedTutorialStages());

const allTopics = computed(() => {
  const topics: TutorialTopic[] = [];
  for (const stage of localizedStages.value) {
    if (stage.topics) {
      topics.push(...stage.topics);
    }
    if (stage.subcategories) {
      for (const sub of stage.subcategories) {
        if (sub.topics) {
          topics.push(...sub.topics);
        }
      }
    }
  }
  return topics;
});

const currentIndex = computed(() => {
  return allTopics.value.findIndex(t => t.id === props.topic.id);
});

const prevTopic = computed(() => {
  if (currentIndex.value > 0) {
    return allTopics.value[currentIndex.value - 1];
  }
  return null;
});

const nextTopic = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < allTopics.value.length - 1) {
    return allTopics.value[currentIndex.value + 1];
  }
  return null;
});

const copyCode = async (code: string) => {
  const ok = await copyToClipboard(code);
  copiedCode.value = ok;
  setTimeout(() => {
    copiedCode.value = false;
  }, 2000);
};

const openInEditor = (code: string) => {
  emit('load-code-to-editor', {
    code,
    topicId: props.topic.id,
    topicTitle: props.topic.title
  });
};
</script>

<template>
  <m3e-content-pane ref="contentViewRef" id="tutorial-article" class="tutorial-content-view"
    @contextmenu.prevent="emit('contextmenu-tutorial', $event)">
    <div class="content-wrapper">
      <div class="main-content">
        <!-- Stage Breadcrumb Tag -->
        <div class="breadcrumb-bar">
          <span class="material-symbols-rounded">school</span>
          <span class="stage-tag">
            <TutorialFormattedText :text="topic.stage" />
          </span>
          <span class="separator">/</span>
          <span class="topic-tag">
            <TutorialFormattedText :text="topic.title" />
          </span>
        </div>

        <!-- Meta Info Bar -->
        <div class="meta-info-bar">
          <span class="meta-item">
            <span class="material-symbols-rounded" style="font-size:16px">schedule</span>
            <span>{{ t('readingTimeText').replace('{time}', String(readingTime)) }}</span>
          </span>
          <span class="meta-separator">·</span>
          <span class="meta-item">
            <span class="material-symbols-rounded" style="font-size:16px">format_list_numbered</span>
            <span>{{ currentProgress }}</span>
          </span>
        </div>

        <!-- Main Article Header（m3e-toc-ignore：文章大标题不进入目录） -->
        <h1 class="article-title" m3e-toc-ignore>
          <TutorialFormattedText :text="topic.title" />
        </h1>
        <p class="article-summary">
          <TutorialFormattedText :text="topic.summary" />
        </p>

        <!-- Overview Box -->
        <div class="overview-box">
          <TutorialFormattedText :text="topic.content.overview" tag="p" />
        </div>

        <!-- Main Runnable Code Example if present -->
        <div v-if="topic.content.codeExample" class="code-example-card">
          <div class="card-header">
            <div class="header-left">
              <span class="material-symbols-rounded">terminal</span>
              <span class="code-title">{{ t('tutorialInteractiveExample') }}</span>
            </div>
            <div class="header-actions">
              <m3e-button variant="tonal" size="extra-small" @click="copyCode(topic.content.codeExample!)">
                <span slot="icon" class="material-symbols-rounded">{{ copiedCode ? 'check' : 'content_copy' }}</span>
                {{ copiedCode ? t('tutorialCopied') : t('tutorialCopyCode') }}
              </m3e-button>
              <m3e-button variant="filled" size="extra-small" :title="t('tutorialClickToRun')"
                @click="openInEditor(topic.content.codeExample!)">
                <span slot="icon" class="material-symbols-rounded">play_arrow</span>
                {{ t('tutorialRunInIDE') }}
              </m3e-button>
            </div>
          </div>
          <pre class="code-block"><code class="hljs" v-html="highlightPython(topic.content.codeExample!)"></code></pre>
        </div>

        <!-- Sections -->
        <div v-for="(section, idx) in topic.content.sections" :key="idx" :id="`section-${topic.id}-${idx}`"
          class="section-block">
          <h2 class="section-heading">
            <TutorialFormattedText :text="section.heading" />
          </h2>
          <p class="section-text">
            <TutorialFormattedText :text="section.text" />
          </p>

          <!-- Section Table if present -->
          <div v-if="section.table" class="md3-table-wrapper">
            <table class="md3-tutorial-table">
              <thead>
                <tr>
                  <th v-for="(header, hIdx) in section.table.headers" :key="hIdx">
                    <TutorialFormattedText :text="header" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rIdx) in section.table.rows" :key="rIdx">
                  <td v-for="(cell, cIdx) in row" :key="cIdx">
                    <TutorialFormattedText :text="cell" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section Code -->
          <div v-if="section.code" class="code-example-card sub-card">
            <div class="card-header">
              <span class="code-title">{{ t('tutorialCodeSnippet') }}</span>
              <m3e-button variant="filled" size="extra-small" @click="openInEditor(section.code!)">
                <span slot="icon" class="material-symbols-rounded">play_arrow</span>
                {{ t('tutorialImportAndRun') }}
              </m3e-button>
            </div>
            <pre class="code-block"><code class="hljs" v-html="highlightPython(section.code!)"></code></pre>
          </div>

          <!-- Section Notes -->
          <div v-if="section.notes" class="notes-callout">
            <span class="material-symbols-rounded callout-icon">info</span>
            <p class="callout-text">
              <TutorialFormattedText :text="section.notes" />
            </p>
          </div>
        </div>

        <!-- Tips Box -->
        <div v-if="topic.content.tips && topic.content.tips.length > 0" class="tips-box">
          <div class="tips-header">
            <span class="material-symbols-rounded">lightbulb</span>
            <span>{{ t('tutorialTipsTitle') }}</span>
          </div>
          <ul>
            <li v-for="(tip, i) in topic.content.tips" :key="i">
              <TutorialFormattedText :text="tip" />
            </li>
          </ul>
        </div>

        <!-- Key Takeaways -->
        <div v-if="topic.content.takeaways && topic.content.takeaways.length > 0" class="takeaways-box">
          <div class="takeaways-header">
            <span class="material-symbols-rounded">psychology</span>
            <span>{{ t('keyTakeaways') }}</span>
          </div>
          <ul>
            <li v-for="(item, i) in topic.content.takeaways" :key="i">
              <TutorialFormattedText :text="item" />
            </li>
          </ul>
        </div>

        <!-- Footer Navigation Buttons (Prev / Next) -->
        <div class="completed-bar">
          <button class="completed-btn" :class="{ 'is-completed': isCompleted }" @click="emit('toggle-completed')">
            <span class="material-symbols-rounded">{{ isCompleted ? 'check_circle' : 'radio_button_unchecked' }}</span>
            <span>{{ isCompleted ? t('markedComplete') : t('markComplete') }}</span>
          </button>
          <button v-if="hasQuiz" class="completed-btn quiz-btn" :title="t('completeQuizTitle')"
            @click="emit('open-quiz')">
            <span class="material-symbols-rounded">fact_check</span>
            <span>{{ t('quizBtn') }}</span>
          </button>
        </div>

        <div class="tutorial-nav-footer">
          <button v-if="prevTopic" class="nav-page-btn prev-btn" @click="emit('select-topic', prevTopic.id)">
            <span class="material-symbols-rounded">arrow_back</span>
            <div class="nav-text-group">
              <span class="nav-direction">{{ t('tutorialPrevious') }}</span>
              <span class="nav-title">{{ prevTopic.title }}</span>
            </div>
          </button>

          <div v-else class="nav-placeholder"></div>

          <button v-if="nextTopic" class="nav-page-btn next-btn" @click="emit('select-topic', nextTopic.id)">
            <div class="nav-text-group right-align">
              <span class="nav-direction">{{ t('tutorialNext') }}</span>
              <span class="nav-title">{{ nextTopic.title }}</span>
            </div>
            <span class="material-symbols-rounded">arrow_forward</span>
          </button>
        </div>

        <!-- Back to Top FAB -->
        <m3e-fab v-show="showBackToTop" size="small" variant="secondary" :title="t('backToTop')"
          @click="scrollToTop" style="position: fixed; bottom: 24px; right: 24px; z-index: 100">
          <span class="material-symbols-rounded">arrow_upward</span>
        </m3e-fab>
      </div>

      <!-- TOC Sidebar（右侧）：m3e-toc 自动扫描正文(id="tutorial-article")的 h1-h6 生成目录，
           点击项平滑滚动到对应段落，滚动时高亮当前段；正文区域宽度 ≥650px 时自动出现，窄屏自动隐藏 -->
      <Transition name="toc-slide">
        <aside v-if="hasSections && tocVisible" class="toc-sidebar">
          <m3e-toc for="tutorial-article" max-depth="2" class="toc-nav">
            <span slot="overline">
              <TutorialFormattedText :text="topic.stage" />
            </span>
            <span slot="title">{{ t('tocTitle') }}</span>
          </m3e-toc>
        </aside>
      </Transition>
    </div>
  </m3e-content-pane>
</template>

<style scoped>
.tutorial-content-view {
  flex: 1;
  min-height: 0;
  height: 100%;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  /* 外边距留在 host 上（露出的空隙由父级 --bg-color 填充）；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制
     （padding 单值，右端自动扣除滚动条宽度） */
  margin: 0 0.4rem 0.4rem 0.4rem;
  --m3e-content-pane-container-padding: 32px;
  --m3e-content-pane-container-shape: 1rem;
  --m3e-content-pane-container-color: var(--bg-color);
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}

.tutorial-content-view * {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}

button,
.stage-tag,
.breadcrumb-bar {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.stage-tag {
  color: var(--primary);
  font-weight: 600;
}

.topic-tag {
  color: var(--text-secondary);
}

.article-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 12px;
  line-height: 1.25;
}

.article-summary {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.overview-box {
  background-color: var(--surface-color);
  border-left: 4px solid var(--primary);
  padding: 16px 20px;
  border-radius: 0 12px 12px 0;
  margin-bottom: 28px;
  font-size: 0.9375rem;
  color: var(--text-color);
  line-height: 1.7;
}

.section-block {
  margin-bottom: 36px;
  padding-top: 20px;
}

.section-heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 12px;
  /* m3e-toc 点击跳转的目标定位留白 */
  scroll-margin-top: 24px;
}

.section-text {
  font-size: 0.9375rem;
  color: var(--text-color);
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 16px;
}

.code-example-card {
  background-color: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.code-example-card.sub-card {
  margin-top: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: #2d2d2d;
  color: #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #ccc;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

pre,
pre.code-block,
.code-block {
  margin: 0;
  padding: 0;
}

.code-block code,
pre code {
  margin: 0;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: #d4d4d4;
  overflow-x: auto;
  white-space: pre;
  display: block;
}

.notes-callout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 12px;
}

.callout-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.tips-box {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 36px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.tips-box ul {
  margin: 0;
  padding-left: 20px;
}

.tips-box li {
  font-size: 0.875rem;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 6px;
}

.tutorial-nav-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid var(--border-color-muted);
  margin-bottom: 48px;
}

.nav-page-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.15s;
  max-width: 45%;
  text-align: left;
}

.nav-page-btn:hover {
  background-color: var(--secondary-container);
  border-color: var(--secondary);
  color: var(--on-secondary-container);
}

.nav-text-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.nav-text-group.right-align {
  align-items: flex-end;
  text-align: right;
}

.nav-direction {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 700;
}

.nav-placeholder {
  flex: 1;
}

/* MD3 Styled Table Components for Tutorials */
.md3-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin: 16px 0 24px 0;
  border: 1px solid var(--border-color-muted);
  border-radius: 12px;
  background-color: var(--surface-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.md3-tutorial-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.md3-tutorial-table th {
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
  font-weight: 700;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color-muted);
  white-space: nowrap;
}

.md3-tutorial-table td {
  padding: 10px 16px;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color-muted);
  line-height: 1.5;
}

.md3-tutorial-table tr:last-child td {
  border-bottom: none;
}

.md3-tutorial-table tr:hover td {
  background-color: var(--surface-variant);
}

/* --- TOC Sidebar（m3e-toc） --- */
.content-wrapper {
  display: flex;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.toc-sidebar {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
}

/* m3e-toc 菜单项：未激活项字号调小（默认 16px body.large），激活项保持默认强调样式；
   行高同步缩小，避免行距撑开 */
.toc-nav {
  --m3e-toc-item-font-size: 0.8125rem;
  --m3e-toc-item-line-height: 1.5;
}

/* 自动显隐过渡：淡入 + 从右侧滑入 */
.toc-slide-enter-active,
.toc-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toc-slide-enter-from,
.toc-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* --- Meta Info Bar --- */
.meta-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-separator {
  opacity: 0.5;
}

/* --- Completed Bar --- */
.completed-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.completed-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 9999px;
  border: 2px solid var(--border-color-muted);
  background-color: var(--surface-color);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.completed-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.completed-btn.quiz-btn {
  border-color: var(--secondary);
  color: var(--secondary);
}

.completed-btn.quiz-btn:hover {
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
}

.completed-btn.is-completed {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  border-color: var(--primary);
}

/* --- Takeaways Box --- */
.takeaways-box {
  background-color: var(--primary-container);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 36px;
}

.takeaways-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--on-primary-container);
  margin-bottom: 12px;
}

.takeaways-box ul {
  margin: 0;
  padding-left: 20px;
}

.takeaways-box li {
  font-size: 0.875rem;
  color: var(--on-primary-container);
  line-height: 1.6;
  margin-bottom: 6px;
}
</style>
