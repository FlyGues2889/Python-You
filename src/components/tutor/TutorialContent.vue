<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, onUnmounted, watch } from 'vue';
import { type TutorialTopic, type TutorialStage } from './tutorialData';
import { getTopicQuiz } from './quizData';
import { safeStorage } from '../../utils/storage';
import { copyToClipboard } from '../../utils/clipboard';
import { paneScroller, whenPaneScroller } from '../../utils/contentPane';
import { useI18n } from '../../utils/i18n';
import { hljs } from '../../utils/highlightSetup';
import TutorialFormattedText from './TutorialFormattedText.vue';

const props = defineProps<{
  topic: TutorialTopic;
  isCompleted?: boolean;
  /** 当前系列的阶段（用于上一节/下一节导航；由 TutorialView 传入） */
  stages?: TutorialStage[];
  seriesTitle?: string;
  /** 已解析的代码主题（跟随设置；由 TutorialView 透传） */
  codeTheme?: string;
}>();

// 代码块配色跟随设置里的代码主题：主题类挂在块上，底色/前景/词法色由 theme.css 的 .theme-* 提供
const codeThemeClass = computed(() => `theme-${props.codeTheme || 'github-dark'}`);

const emit = defineEmits<{
  (e: 'select-topic', topicId: string): void;
  (e: 'back-to-home'): void;
  (e: 'load-code-to-editor', payload: { code: string; topicId: string; topicTitle: string }): void;
  (e: 'toggle-completed'): void;
  (e: 'open-quiz'): void;
  (e: 'contextmenu-tutorial', event: MouseEvent): void;
}>();

const contentViewRef = ref<HTMLElement | null>(null);
const copiedCode = ref(false);
const { t } = useI18n();

const hasQuiz = computed(() => !!getTopicQuiz(props.topic.id));

// 组件库按钮（m3e-button）上不能用「带参数的内联语句」写事件（拿不到事件、回调不执行），
// 统一包成方法引用，状态本身仍由父级持有（isCompleted prop + toggle-completed 事件）
const onToggleCompleted = () => emit('toggle-completed');
const onOpenQuiz = () => emit('open-quiz');

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

// 参考手册（Python 参考手册阶段）：只有正文与表格，不出小节标题、不显示目录侧栏
const isReference = computed(() => props.topic.kind === 'reference');

// m3e-toc 会自动从正文(control)扫描 h1-h6 生成目录并高亮当前段，
// 这里只判断是否存在分段标题，用于决定是否显示目录侧栏
const hasSections = computed(() => !isReference.value && props.topic.content.sections.some(s => s.heading));

const currentProgress = computed(() => {
  const total = allTopics.value.length;
  const current = currentIndex.value + 1;
  return total > 0 ? `${current} / ${total}` : '';
});

const scrollToTop = () => {
  paneScroller(contentViewRef.value)?.scrollTo({ top: 0, behavior: 'smooth' });
};

const scrollKeyOf = (topicId: string) => `python_you_tutorial_scroll_${topicId}`;

// 离开某篇文章前落盘它的阅读位置（不传 topicId 时存当前这篇）
const saveScroll = (topicId?: string) => {
  const id = topicId || props.topic?.id;
  if (!id) return;
  const sc = paneScroller(contentViewRef.value);
  if (sc) safeStorage.setItem(scrollKeyOf(id), sc.scrollTop.toString());
};

// 滚动发生在 m3e-content-pane 的 shadow 内：直接读 shadow 内滚动容器
const handleScroll = () => {
  const sc = paneScroller(contentViewRef.value);
  if (!sc || !props.topic?.id) return;
  safeStorage.setItem(scrollKeyOf(props.topic.id), sc.scrollTop.toString());
  showBackToTop.value = sc.scrollTop > 400;
};

const restoreOrResetScroll = (isTopicChanged: boolean) => {
  // 等滚动容器就绪：既等 Vue 渲染完新内容，也等 shadow 内容器渲染完成
  whenPaneScroller(contentViewRef.value, (sc) => {
    if (isTopicChanged) {
      sc.scrollTop = 0;
      return;
    }
    const saved = safeStorage.getItem(scrollKeyOf(props.topic.id));
    sc.scrollTop = saved === null ? 0 : parseFloat(saved) || 0;
  });
};

// m3e-toc 通过 for="tutorial-article" 把 host 当作滚动容器（control）：
// 读取 control.scrollTop 计算当前段、监听 control 的 scroll 事件。实际滚动在 shadow 内，
// 需要在 host 实例上同步这两个通道（点击跳转用的是 scrollIntoView，不受影响）。
const syncPaneToToc = (sc: HTMLElement) => {
  const host = contentViewRef.value;
  if (!host) return;
  Object.defineProperty(host, 'scrollTop', {
    configurable: true,
    get: () => sc.scrollTop,
    set: (v: number) => { sc.scrollTop = v; }
  });
  // 手动转发（scroll 事件是否穿透 shadow 边界随浏览器而定，双触发无害——toc 端 debounce）
  sc.addEventListener('scroll', () => host.dispatchEvent(new Event('scroll')));
};

let stopWatchScroll: (() => void) | null = null;
let stopPendingScroll: (() => void) | null = null;

onMounted(() => {
  // 等滚动容器渲染出来后再注册滚动监听并同步 TOC 通道
  stopPendingScroll = whenPaneScroller(contentViewRef.value, (sc) => {
    sc.addEventListener('scroll', handleScroll);
    stopWatchScroll = () => sc.removeEventListener('scroll', handleScroll);
    syncPaneToToc(sc);
  });
  restoreOrResetScroll(false);
  updateTocVisibility();
  tocResizeObserver = new ResizeObserver(updateTocVisibility);
  if (contentViewRef.value) {
    tocResizeObserver.observe(contentViewRef.value);
  }
});

onBeforeUnmount(() => {
  // 卸载前（如切换 tab）落盘：此刻 DOM 还在，能读到真实位置。
  // 只靠 scroll 事件保存不行——监听器注册赶不上首帧时，一次都没滚动过就离开会丢位置
  saveScroll();
});

onUnmounted(() => {
  stopPendingScroll?.();
  stopPendingScroll = null;
  stopWatchScroll?.();
  stopWatchScroll = null;
  tocResizeObserver?.disconnect();
  tocResizeObserver = null;
});

watch(() => props.topic?.id, (newId, oldId) => {
  if (newId === oldId) return;
  // 先记下上一篇读到哪儿（watch 在 DOM 更新前触发，此时读到的还是旧内容的位置）
  if (oldId) saveScroll(oldId);
  restoreOrResetScroll(true);
});

const highlightPython = (code: string) => {
  if (!code) return '';
  try {
    return hljs.highlight(code, { language: 'python' }).value;
  } catch (e) {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

const localizedStages = computed<TutorialStage[]>(() => props.stages || []);

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

// 面包屑第三级：当前文章所属的阶段（子分类归属其父阶段）
const stageTitle = computed(() => {
  for (const stage of localizedStages.value) {
    if (stage.topics?.some(t => t.id === props.topic.id)) return stage.title;
    if (stage.subcategories?.some(sub => sub.topics.some(t => t.id === props.topic.id))) return stage.title;
  }
  return props.topic.stage || '';
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
        <!-- 正文标题栏：返回学习首页按钮 + 面包屑，与测验页题头同一排法（按钮在左、图标同款）。
             面包屑：学习 / 当前系列 / 所属阶段 / 当前文章（第一级也可点击返回学习首页）。
             各标签都必须是不带元素包裹的纯文本：m3e 的 breadcrumb-item 以
             「插槽内恰好一个元素且其尺寸 ≤28×28」判定图标项，而包裹元素在 slotchange 时
             尚未布局、量到 0×0 即被判为图标项，该项会被永久压成固定方块并裁掉文字。 -->
        <div class="article-header">
          <m3e-icon-button class="article-back-btn" variant="outlined" :title="t('backToLearnHome')"
            @click="emit('back-to-home')">
            <span class="material-symbols-rounded">home</span>
          </m3e-icon-button>
          <m3e-breadcrumb class="article-breadcrumb density-3">
            <m3e-breadcrumb-item @click="emit('back-to-home')">{{ t('navTutorial') }}</m3e-breadcrumb-item>
            <m3e-breadcrumb-item disabled>{{ seriesTitle || topic.stage }}</m3e-breadcrumb-item>
            <m3e-breadcrumb-item disabled>{{ stageTitle }}</m3e-breadcrumb-item>
            <m3e-breadcrumb-item>{{ topic.title }}</m3e-breadcrumb-item>
          </m3e-breadcrumb>
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
          <pre class="code-block" :class="codeThemeClass"><code class="hljs" v-html="highlightPython(topic.content.codeExample!)"></code></pre>
        </div>

        <!-- Sections -->
        <div v-for="(section, idx) in topic.content.sections" :key="idx" :id="`section-${topic.id}-${idx}`"
          class="section-block">
          <h2 v-if="section.heading && !isReference" class="section-heading">
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
            <pre class="code-block" :class="codeThemeClass"><code class="hljs" v-html="highlightPython(section.code!)"></code></pre>
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

        <!-- 完成状态与测验入口：统一用组件库按钮（完成状态是切换，用 toggle + selected 表达）。
             参考手册（kind: 'reference'）是查阅材料，不标完成、也没有测验 -->
        <div v-if="!isReference" class="completed-bar">
          <m3e-button toggle variant="filled" size="medium" :selected="!!isCompleted" @change="onToggleCompleted">
            <span slot="icon" class="material-symbols-rounded">{{ isCompleted ? 'check_circle' : 'radio_button_unchecked' }}</span>
            {{ isCompleted ? t('markedComplete') : t('markComplete') }}
          </m3e-button>
          <m3e-button v-if="hasQuiz" variant="filled" size="medium" :title="t('completeQuizTitle')"
            @click="onOpenQuiz">
            <span slot="icon" class="material-symbols-rounded">fact_check</span>
            {{ t('quizBtn') }}
          </m3e-button>
        </div>

        <div class="tutorial-nav-footer">
          <m3e-button v-if="prevTopic" class="nav-page-btn prev-btn" @click="emit('select-topic', prevTopic.id)"
            variant="text" size="medium">
            <span slot="icon" class="material-symbols-rounded">arrow_back</span>
            <div class="nav-text-group">
              <span class="nav-direction">{{ t('tutorialPrevious') }}</span>
              <span class="nav-title">{{ prevTopic.title }}</span>
            </div>

          </m3e-button>

          <div v-else class="nav-placeholder"></div>

          <m3e-button v-if="nextTopic" class="nav-page-btn next-btn" @click="emit('select-topic', nextTopic.id)"
            variant="text" size="medium">
            <div class="nav-text-group right-align">
              <span class="nav-direction">{{ t('tutorialNext') }}</span>
              <span class="nav-title">{{ nextTopic.title }}</span>
            </div>
            <span slot="trailing-icon" class="material-symbols-rounded">arrow_forward</span>
          </m3e-button>
        </div>

        <!-- Back to Top FAB -->
        <m3e-fab v-show="showBackToTop" size="small" variant="secondary" :title="t('backToTop')" @click="scrollToTop"
          style="position: fixed; bottom: 24px; right: 24px; z-index: 100">
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
  /* flex item 的 min-width 默认 auto = 内容最小宽度：宽内容（长表格/不换行的代码行）
     会把面板钉在最小宽度上不再收缩，窗口变窄时 TOC 的显隐判定（按面板 clientWidth 算）
     就跟着失灵。与下面的 min-height 同理，归零让它跟窗口收缩 */
  min-width: 0;
  min-height: 0;
  height: 100%;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  /* 外边距留在 host 上（露出的空隙由父级 --surface-color 填充）；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制
     （padding 单值，右端自动扣除滚动条宽度） */
  /* 与学习首页/测验页同一套：0 12px 12px + --bg-color + 1rem 圆角。
     三处边距不一致时，页面之间来回切会看到纸面大小跳一下 */
  margin: 0 12px 12px;
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
m3e-breadcrumb {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 正文标题栏：返回按钮 + 面包屑同一行，行距由外层给（与测验页题头一致） */
.article-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.article-back-btn {
  flex-shrink: 0;
}

/* 面包屑：紧凑行高；窄屏时压缩而不是把标题栏顶高 */
.article-breadcrumb {
  flex: 1;
  min-width: 0;
  --m3e-breadcrumb-item-container-height: 32px;
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
  background-color: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  /* 描边与 m3e-card 同一套做法（secondary 半透明叠加，1px），不用投影 */
  border: 1px solid color-mix(in srgb, var(--secondary) 10%, transparent);
}

.code-example-card.sub-card {
  margin-top: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: var(--surface-variant);
  color: var(--text-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
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
  /* 前景/底色跟随代码主题类（.theme-*，见 theme.css）；
     .hljs 的基础配色来自 CodeEditor 全局引入的 github-dark.css，必须压掉 */
  color: inherit;
  background-color: transparent;
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
  margin-bottom: 48px;
}

.nav-page-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  max-width: 45%;
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
  /* 上限要按「正文区看得见的高度」算：视口里还压着标题栏、正文区底部边距，
     面板自己又吸顶下移了 24px。原来只减 48px 时，上限比可视高度还高，
     目录一长（条目多到顶到上限）底部就伸出滚动容器，最后几项点不到。
     --titlebar-height 由 App.vue 定义，标题栏改高度这里自动跟。 */
  max-height: calc(100vh - var(--titlebar-height) - 48px);
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
  transition: opacity var(--motion-effects), transform var(--motion-spatial-fast);
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
