<script setup lang="ts">
import { computed } from 'vue';
import { getTutorialSeries, type TutorialSeries } from './tutorialData';
import { getTopicQuizScore } from './quizData';
import { useI18n } from '../../utils/i18n';

const props = defineProps<{
  /** 已完成主题 id 集合（由 TutorialView 传入，与目录树的进度同源） */
  completedTopics?: Set<string>;
}>();

const emit = defineEmits<{
  (e: 'open-series', seriesId: string): void;
  (e: 'open-quiz-directory', seriesId: string): void;
}>();

const { t, tf } = useI18n();

const seriesList = computed<TutorialSeries[]>(() => getTutorialSeries());

interface SeriesProgress {
  total: number;
  done: number;
  percent: number;
  /** 已作答测验的平均得分（0-100）；该系列还没有任何测验成绩时为 null */
  quizAverage: number | null;
}

const topicIdsOf = (series: TutorialSeries): string[] => {
  const ids: string[] = [];
  for (const stage of series.stages) {
    stage.topics?.forEach(topic => ids.push(topic.id));
    stage.subcategories?.forEach(sub => sub.topics.forEach(topic => ids.push(topic.id)));
  }
  return ids;
};

// 每个系列的进度：完成篇数与测验平均分（与目录树的 FR-6.6 统计口径一致）
const progressOf = (series: TutorialSeries): SeriesProgress => {
  const ids = topicIdsOf(series);
  const done = ids.filter(id => props.completedTopics?.has(id)).length;
  // 与目录树同口径：只把「已作答」的测验计入均分，没做过的题不该按 0 分拉低平均
  const scores = ids.map(id => getTopicQuizScore(id)).filter(score => score.answered > 0);
  const sum = scores.reduce((acc, score) => acc + score.correct / score.total, 0);
  return {
    total: ids.length,
    done,
    percent: ids.length === 0 ? 0 : Math.round((done / ids.length) * 100),
    quizAverage: scores.length === 0 ? null : Math.round((sum / scores.length) * 100),
  };
};

// 只在进入首页时算一遍：首页每次从系列返回都会重新挂载，进度自然是最新的
const progressMap = computed<Record<string, SeriesProgress>>(() => {
  const map: Record<string, SeriesProgress> = {};
  for (const series of seriesList.value) {
    map[series.id] = progressOf(series);
  }
  return map;
});

const quizAverageLabel = (series: TutorialSeries): string => {
  const average = progressMap.value[series.id].quizAverage;
  return average === null ? t('learnSeriesQuizNone') : tf('learnSeriesQuizAvg', { score: average });
};
</script>

<template>
  <m3e-content-pane class="learn-home">
    <div class="home-wrapper">
      <!-- 欢迎区 -->
      <header class="home-hero">
        <span class="material-symbols-rounded-fill home-hero-icon">school</span>
        <h2 class="home-hero-title">{{ t('learnWelcomeTitle') }}</h2>
        <p class="home-hero-text">{{ t('learnWelcomeText') }}</p>
      </header>

      <!-- 系列卡片：简介 + 进度 + 「测验」outlined / 「进入」filled 图标按钮 -->
      <div class="series-grid">
        <m3e-card
          v-for="series in seriesList"
          :key="series.id"
          variant="outlined"
          class="series-card"
          :class="{ 'is-pending': series.stages.length === 0 }"
        >
          <div slot="header" class="card-head">
            <span class="material-symbols-rounded-fill card-icon">{{ series.icon }}</span>
            <div class="card-head-text">
              <div class="card-title">{{ series.title }}</div>
              <div class="card-meta">{{ tf('learnSeriesStageCount', { count: series.stages.length }) }}</div>
            </div>
          </div>

          <div slot="content" class="card-body">
            <p class="card-summary">{{ series.summary }}</p>

            <div class="card-progress">
              <m3e-linear-progress-indicator class="progress-bar" :value="progressMap[series.id].percent">
              </m3e-linear-progress-indicator>
              <span class="progress-text">
                {{ tf('learnSeriesProgress', { done: progressMap[series.id].done, total: progressMap[series.id].total }) }}
              </span>
            </div>
          </div>

          <div slot="actions" end class="card-actions">
            <span v-if="series.stages.length === 0" class="card-chip chip-pending">{{ t('learnSeriesPending') }}</span>
            <template v-else>
              <span class="quiz-avg">{{ quizAverageLabel(series) }}</span>
              <m3e-button variant="outlined" size="small" :title="t('toggleQuizCatalog')"
                @click="emit('open-quiz-directory', series.id)">
                <span slot="icon" class="material-symbols-rounded">fact_check</span>
                {{ t('quizShort') }}
              </m3e-button>
              <m3e-icon-button variant="tonal" :title="t('learnEnterSeries')"
                @click="emit('open-series', series.id)">
                <span class="material-symbols-rounded">arrow_forward</span>
              </m3e-icon-button>
            </template>
          </div>
        </m3e-card>
      </div>
    </div>
  </m3e-content-pane>
</template>

<style scoped>
.learn-home {
  flex: 1;
  /* flex item 的 min-width 默认 auto = 内容最小宽度：宽表格/长代码会把它钉在
     最小宽度上，窗口变窄时面板不收缩（与上面的 min-height 同理） */
  min-width: 0;
  min-height: 0;
  height: 100%;
  /* 与文章正文/测验页同一套（--bg-color + 1rem + 12px 边距），
     四个页面共用一块阅读区，切页不该跳色跳圆角 */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 1rem;
  --m3e-content-pane-container-color: var(--bg-color);
  --m3e-content-pane-container-padding: 32px;
  user-select: text;
}

.home-wrapper {
  max-width: 1040px;
  margin: 0 auto;
}

.home-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0 32px;
  text-align: center;
}

.home-hero-icon {
  font-size: 3rem;
  color: var(--primary);
}

.home-hero-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.home-hero-text {
  margin: 0;
  max-width: 40rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* 一行三张：容器留够 3×300 + 2×16 的宽度，窄窗口再自动降为两列/一列 */
.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.series-card {
  --m3e-card-container-shape: 12px;
  /* 底色反取 --surface-color：正文底已是 --bg-color，卡片再取同色就只剩描边 */
  --m3e-card-container-color: var(--surface-color);
}

.series-card.is-pending {
  opacity: 0.6;
}

/* 卡片头部：m3e-card 默认把 header 排成列，这里改回一行 */
.card-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.card-icon {
  font-size: 1.5rem;
  color: var(--secondary);
  flex-shrink: 0;
}

.card-head-text {
  min-width: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-color);
}

.card-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* 简介长短不一时把进度条压到卡片底部，保证同一行三张卡的进度条对齐 */
.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 10px;
}

.card-summary {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.65;
  color: var(--text-secondary);
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
}

/* 进度条用组件库的 m3e-linear-progress-indicator：厚度、圆角、轨道与活动段配色
   都由它自己的 token 决定，这里只占位（与设置页、标题栏的进度条同一套） */
.progress-bar {
  flex: 1;
  min-width: 0;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.card-actions {
  gap: 8px;
}

.quiz-avg {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-right: auto;
}

.card-chip {
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 9999px;
  border: 1px solid var(--border-color-muted);
  color: var(--text-tertiary);
  margin-right: auto;
}
</style>
