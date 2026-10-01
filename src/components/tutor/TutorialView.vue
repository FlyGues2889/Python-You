<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TutorialTree from './TutorialTree.vue';
import TutorialContent from './TutorialContent.vue';
import QuizDirectory from './QuizDirectory.vue';
import QuizView from './QuizView.vue';
import LearningHome from './LearningHome.vue';
import { type TutorialTopic, type TutorialSeries, getSeriesById } from './tutorialData';
import { getTopicQuizScore } from './quizData';
import { safeStorage } from '../../utils/storage';

const props = defineProps<{
  activeTopicIdProp?: string;
}>();

const emit = defineEmits<{
  (e: 'load-code-to-editor', payload: { code: string; topicId: string; topicTitle: string; isQuiz?: boolean; questionId?: string; expectedOutput?: string }): void;
  (e: 'contextmenu-tutorial', event: MouseEvent): void;
  (e: 'update-active-topic', topicId: string): void;
}>();

type ViewMode = 'article' | 'quiz-directory' | 'quiz';

// 上次离开教程时的位置（系列 / 视图 / 题目）：教程视图在切换 tab 时会被整体卸载，
// 没有这份记录就会掉回学习首页，把阅读进度丢掉
const SESSION_KEY = 'python_you_tutorial_session';
const lastTopicKeyFor = (seriesId: string) => `python_you_last_series_topic_${seriesId}`;

interface TutorialSession {
  seriesId: string | null;
  mode: ViewMode;
  /** 文章视图下的当前文章；测验视图下是测验所属的那篇 */
  topicId: string;
}

const topicIdsOf = (series: TutorialSeries): string[] => {
  const ids: string[] = [];
  for (const stage of series.stages) {
    stage.topics?.forEach(topic => ids.push(topic.id));
    stage.subcategories?.forEach(sub => sub.topics.forEach(topic => ids.push(topic.id)));
  }
  return ids;
};

const firstTopicIdOf = (series: TutorialSeries): string | null => {
  for (const stage of series.stages) {
    const topic = stage.topics?.[0] || stage.subcategories?.[0]?.topics[0];
    if (topic) return topic.id;
  }
  return null;
};

// 该系列最后一次读到的那篇；没读过或那篇已不存在时退回第一篇
const resumeTopicIdOf = (series: TutorialSeries): string | null => {
  const remembered = safeStorage.getItem(lastTopicKeyFor(series.id));
  if (remembered && topicIdsOf(series).includes(remembered)) return remembered;
  return firstTopicIdOf(series);
};

const readSession = (): TutorialSession => {
  try {
    const raw = safeStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TutorialSession;
      const series = parsed.seriesId ? getSeriesById(parsed.seriesId) : undefined;
      if (series && series.stages.length > 0) {
        return {
          seriesId: series.id,
          mode: parsed.mode === 'quiz-directory' || parsed.mode === 'quiz' ? parsed.mode : 'article',
          topicId: parsed.topicId,
        };
      }
    }
  } catch {}
  return { seriesId: null, mode: 'article', topicId: '' };
};

const session = readSession();
const restoredSeries = session.seriesId ? getSeriesById(session.seriesId) : undefined;

const savedTopicId = safeStorage.getItem('python_you_last_tutorial_topic');
const activeTopicId = ref(
  props.activeTopicIdProp
  || (restoredSeries && topicIdsOf(restoredSeries).includes(session.topicId) ? session.topicId : '')
  || savedTopicId
  || 'p1_home'
);
const isTreeCollapsed = ref(false);

// 系列：null = 学习首页（欢迎 + 系列卡片），选定后进入该系列的文章/测验视图
const activeSeriesId = ref<string | null>(restoredSeries?.id ?? null);
const activeSeries = computed(() => getSeriesById(activeSeriesId.value));
const seriesStages = computed(() => activeSeries.value?.stages || []);
const seriesTitle = computed(() => activeSeries.value?.title || '');

const openSeries = (seriesId: string) => {
  const series = getSeriesById(seriesId);
  // 尚未编写内容的系列不进入（列表里也标记为「内容整理中」）
  if (!series || series.stages.length === 0) return;
  activeSeriesId.value = seriesId;
  viewMode.value = 'article';
  // 回到该系列上次读到的那篇；第一次进入才从第一篇开始
  const topicId = resumeTopicIdOf(series);
  if (topicId) {
    activeTopicId.value = topicId;
  }
};

const backToHome = () => {
  activeSeriesId.value = null;
  // 回首页就退出测验视图，否则再次进入系列会先闪一下上次的测验界面
  viewMode.value = 'article';
};

// 学习首页卡片上的「测验」按钮：先进入该系列，再切到它的测验目录
const openQuizDirectory = (seriesId: string) => {
  openSeries(seriesId);
  if (activeSeriesId.value !== seriesId) return;
  quizTopicId.value = activeTopicId.value;
  viewMode.value = 'quiz-directory';
  refreshQuizStats();
};

const COMPLETED_KEY = 'python_you_completed_topics';
const completedTopics = ref<Set<string>>(new Set());

const loadCompleted = () => {
  try {
    const raw = safeStorage.getItem(COMPLETED_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) completedTopics.value = new Set(arr);
    }
  } catch {}
};
loadCompleted();

const toggleCompleted = (topicId: string) => {
  if (completedTopics.value.has(topicId)) {
    completedTopics.value.delete(topicId);
  } else {
    completedTopics.value.add(topicId);
  }
  safeStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(completedTopics.value)));
};

watch(() => props.activeTopicIdProp, (newVal) => {
  if (newVal) {
    activeTopicId.value = newVal;
  }
});

// 供外部（编辑器返回）一次性调用：直接打开对应教程的测验界面
const openQuizExternally = (topicId: string) => {
  activeTopicId.value = topicId;
  openQuiz(topicId);
};

defineExpose({ openQuizExternally });

watch(activeTopicId, (newTopicId) => {
  if (!newTopicId) return;
  safeStorage.setItem('python_you_last_tutorial_topic', newTopicId);
  // 按系列各记一份，这样从学习首页重新进入某个系列能接着上次那篇看
  if (activeSeriesId.value) {
    safeStorage.setItem(lastTopicKeyFor(activeSeriesId.value), newTopicId);
  }
});

const allTopics = computed(() => {
  const topics: TutorialTopic[] = [];
  for (const stage of seriesStages.value) {
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

const currentTopic = computed<TutorialTopic>(() => {
  const found = allTopics.value.find(t => t.id === activeTopicId.value);
  if (found) return found;
  return allTopics.value[0];
});

// ---- Quiz view state ----
const viewMode = ref<ViewMode>(session.mode);
const quizTopicId = ref(session.mode === 'article' ? '' : session.topicId);
const quizRefreshTick = ref(0);

// 位置一变就落盘：教程视图被卸载（切 tab）后靠它恢复
watch([activeSeriesId, viewMode, () => activeTopicId.value, quizTopicId], () => {
  const payload: TutorialSession = {
    seriesId: activeSeriesId.value,
    mode: viewMode.value,
    topicId: viewMode.value === 'article' ? activeTopicId.value : quizTopicId.value,
  };
  safeStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}, { immediate: true });

const quizStats = computed<Record<string, { correct: number; total: number }>>(() => {
  void quizRefreshTick.value;
  const stats: Record<string, { correct: number; total: number }> = {};
  for (const topic of allTopics.value) {
    const score = getTopicQuizScore(topic.id);
    // 只收「已作答」的测验：没做过的题按 0 分计入会拉低均分，
    // 与工具提示「已作答测验的平均得分」不符（学习首页的系列卡片同此口径）
    if (score.answered > 0) {
      stats[topic.id] = { correct: score.correct, total: score.total };
    }
  }
  return stats;
});

const refreshQuizStats = () => {
  quizRefreshTick.value++;
  loadCompleted();
};

const handleSelectTopic = (topicId: string) => {
  activeTopicId.value = topicId;
  viewMode.value = 'article';
  isTreeCollapsed.value = false;
  safeStorage.setItem('python_you_last_tutorial_topic', topicId);
  emit('update-active-topic', topicId);
};

const openQuiz = (topicId: string) => {
  quizTopicId.value = topicId;
  viewMode.value = 'quiz';
  refreshQuizStats();
};

const backToArticle = () => {
  viewMode.value = 'article';
  refreshQuizStats();
};

const handleLoadCode = (payload: { code: string; topicId: string; topicTitle: string; isQuiz?: boolean; questionId?: string; expectedOutput?: string }) => {
  emit('load-code-to-editor', payload);
};
</script>

<template>
  <div class="tutorial-main-view">
    <!-- 学习首页：欢迎 + 文章系列卡片（默认进入） -->
    <LearningHome
      v-if="!activeSeriesId"
      :completed-topics="completedTopics"
      @open-series="openSeries"
      @open-quiz-directory="openQuizDirectory"
    />

    <template v-else>
      <!-- Left Tree Navigation -->
      <!-- 做题时侧栏换成该系列的测验目录，方便直接换题 -->
      <TutorialTree
        :active-topic-id="viewMode === 'quiz' ? quizTopicId : activeTopicId"
        :collapsed="isTreeCollapsed"
        :completed-topics="completedTopics"
        :quiz-stats="quizStats"
        :stages="seriesStages"
        :series-title="seriesTitle"
        :mode="viewMode === 'quiz' ? 'quiz' : 'article'"
        @select-topic="handleSelectTopic"
        @open-quiz="openQuiz"
        @toggle-collapse="isTreeCollapsed = !isTreeCollapsed"
        @back-to-tutorial="backToArticle"
      />

      <!-- Right Article Content -->
      <TutorialContent
        v-if="viewMode === 'article'"
        :topic="currentTopic"
        :is-completed="completedTopics.has(activeTopicId)"
        :stages="seriesStages"
        :series-title="seriesTitle"
        @select-topic="handleSelectTopic"
        @load-code-to-editor="handleLoadCode"
        @toggle-completed="toggleCompleted(activeTopicId)"
        @open-quiz="openQuiz(activeTopicId)"
        @contextmenu-tutorial="e => emit('contextmenu-tutorial', e)"
        @back-to-home="backToHome"
      />

      <!-- Right Quiz Directory -->
      <QuizDirectory
        v-else-if="viewMode === 'quiz-directory'"
        :stages="seriesStages"
        :series-title="seriesTitle"
        :active-topic-id="quizTopicId"
        @open-quiz="openQuiz"
        @back-to-tutorial="backToArticle"
        @back-to-home="backToHome"
      />

      <!-- Right Quiz View -->
      <QuizView
        v-else
        :topic-id="quizTopicId"
        :stages="seriesStages"
        :series-title="seriesTitle"
        @back-to-tutorial="backToArticle"
        @back-to-home="backToHome"
        @load-code-to-editor="handleLoadCode"
        @results-changed="refreshQuizStats"
        @next-topic="handleSelectTopic"
      />
    </template>
  </div>
</template>

<style scoped>
.tutorial-main-view {
  /* 与各面板的 margin-bottom(12px) 对齐：面板 height:100% + margin 12px 会超出容器
     内容盒，容器是 overflow:hidden 但仍可被脚本滚动 —— 一旦有 scrollIntoView
     之类的调用落上来，整块视图就被顶上去、面板上圆角被裁掉（表现为圆角越点越小）。
     padding 正好等于 margin 时不会产生可滚动溢出。 */
  padding-bottom: 12px;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: var(--surface-color);
}
</style>
