<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getTopicQuizScore, type QuizScore } from './quizData';
import { type TutorialStage, type TutorialTopic } from './tutorialData';
import TutorialFormattedText from './TutorialFormattedText.vue';
import { useI18n } from '../../utils/i18n';

const { t } = useI18n();

const props = defineProps<{
  /** 当前系列的阶段（由 TutorialView 传入，目录只展示该系列） */
  stages?: TutorialStage[];
  seriesTitle?: string;
  activeTopicId?: string;
}>();

const emit = defineEmits<{
  (e: 'open-quiz', topicId: string): void;
  (e: 'back-to-tutorial'): void;
  (e: 'back-to-home'): void;
}>();

const stages = computed<TutorialStage[]>(() => props.stages || []);
const refreshTick = ref(0);

watch(
  () => props.activeTopicId,
  () => {
    refreshTick.value++;
  },
  { immediate: true }
);

const getScore = (topicId: string): QuizScore => {
  void refreshTick.value;
  return getTopicQuizScore(topicId);
};

// 键盘可达（无障碍）：Enter/Space 激活与点击相同的操作（无成绩的行保持禁用）
const onRowKeydown = (e: KeyboardEvent, topicId: string) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  if (getScore(topicId).total > 0) emit('open-quiz', topicId);
};

// 参考手册（kind: 'reference'）没有测验，不列入测验目录；整段都没有测验的阶段也不出现
const topicRows = (stage: TutorialStage): TutorialTopic[] => {
  const withQuiz = (topics?: TutorialTopic[]) => (topics || []).filter(topic => topic.kind !== 'reference');
  const rows: TutorialTopic[] = withQuiz(stage.topics);
  if (stage.subcategories) {
    for (const sub of stage.subcategories) {
      rows.push(...withQuiz(sub.topics));
    }
  }
  return rows;
};

const stagesWithRows = computed(() =>
  stages.value
    .map(stage => ({ stage, rows: topicRows(stage) }))
    .filter(item => item.rows.length > 0)
);
</script>

<template>
  <m3e-content-pane class="quiz-directory">
    <div class="quiz-dir-wrapper">
      <!-- 面包屑：学习 / 当前系列 / 测验 / 目录（与文章页同一套层级，只是第三级是「测验」） -->
      <m3e-breadcrumb class="dir-breadcrumb density-3">
        <m3e-breadcrumb-item @click="emit('back-to-home')">{{ t('navTutorial') }}</m3e-breadcrumb-item>
        <m3e-breadcrumb-item @click="emit('back-to-tutorial')">{{ seriesTitle }}</m3e-breadcrumb-item>
        <m3e-breadcrumb-item disabled>{{ t('quizShort') }}</m3e-breadcrumb-item>
        <m3e-breadcrumb-item>{{ t('breadcrumbQuizCatalog') }}</m3e-breadcrumb-item>
      </m3e-breadcrumb>

      <div class="quiz-dir-header">
        <!-- 返回学习首页：与文章正文标题栏、测验题头同一位置同一款式 -->
        <m3e-icon-button class="dir-back-btn" variant="text" :title="t('backToLearnHome')"
          @click="emit('back-to-home')"disabled>
          <span class="material-symbols-rounded">done_all</span>
        </m3e-icon-button>
        <div>
          <div class="dir-title">{{ t('quizDirectoryTitle') }}</div>
          <div class="dir-subtitle">{{ t('quizDirectorySubtitle') }}</div>
        </div>
      </div>

      <div class="dir-stages">
        <div v-for="({ stage, rows }) in stagesWithRows" :key="stage.id" class="dir-stage-block">
          <div class="dir-stage-header">
            <span class="material-symbols-rounded-fill dir-stage-icon">folder</span>
            <span class="dir-stage-title">{{ stage.title }}</span>
          </div>

          <div
            v-for="topic in rows"
            :key="topic.id"
            class="dir-topic-row"
            role="button"
            tabindex="0"
            :class="{ 'is-active': activeTopicId === topic.id, 'is-disabled': getScore(topic.id).total === 0 }"
            @click="getScore(topic.id).total > 0 && emit('open-quiz', topic.id)"
            @keydown="onRowKeydown($event, topic.id)"
          >
            <span class="material-symbols-rounded dir-topic-icon">fact_check</span>
            <span class="dir-topic-title">
              <TutorialFormattedText :text="topic.title" />
            </span>
            <span
              v-if="getScore(topic.id).total === 0"
              class="dir-score-chip chip-none"
            >{{ t('scoreNone') }}</span>
            <span
              v-else-if="getScore(topic.id).correct === getScore(topic.id).total && getScore(topic.id).total > 0"
              class="dir-score-chip chip-done"
            >
              <span class="material-symbols-rounded">check_circle</span>
              {{ getScore(topic.id).correct }}/{{ getScore(topic.id).total }}
            </span>
            <span v-else class="dir-score-chip">
              {{ getScore(topic.id).correct }}/{{ getScore(topic.id).total }}
            </span>
            <span class="material-symbols-rounded dir-arrow">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  </m3e-content-pane>
</template>

<style scoped>
.quiz-directory {
  flex: 1;
  /* flex item 的 min-width 默认 auto = 内容最小宽度：宽表格/长代码会把它钉在
     最小宽度上，窗口变窄时面板不收缩（与上面的 min-height 同理） */
  min-width: 0;
  min-height: 0;
  height: 100%;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  /* 外边距留在 host 上（露出的空隙由父级 --bg-color 填充 → 边距可见）；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制
     （与测验答题页/文章正文同一套:--bg-color + 1rem + 32px 内边距） */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 1rem;
  --m3e-content-pane-container-color: var(--bg-color);
  --m3e-content-pane-container-padding: 32px;
  user-select: text;
}

.quiz-dir-wrapper {
  max-width: 860px;
  margin: 0 auto;
}

.dir-breadcrumb {
  margin-bottom: 16px;
  --m3e-breadcrumb-item-container-height: 32px;
}

.quiz-dir-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.dir-back-btn {
  flex-shrink: 0;
}

.dir-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-color);
}

.dir-subtitle {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.dir-stage-block {
  margin-bottom: 20px;
}

.dir-stage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.dir-stage-icon {
  font-size: 1.125rem;
  color: var(--secondary);
}

.dir-stage-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-color);
}

.dir-topic-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 1.6rem;
  padding: 10px 14px;
  border-radius: 4px; /* M3 List：未选中项取 CornerExtraSmall */
  /* 预留透明描边：选中态只换 border-color，行内内容不会因多出 1px 边框而位移 */
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color var(--motion-effects-fast);
  margin-bottom: 4px;
}

.dir-topic-row:hover {
  background-color: var(--surface-variant);
}

/* 选中态按 M3 List 令牌走填色（与侧栏目录同一套） */
.dir-topic-row.is-active {
  background-color: var(--secondary-container);
  border-radius: 16px; /* M3 List：选中项取 CornerLarge */
}

.dir-topic-row.is-active .dir-topic-title {
  color: var(--on-secondary-container);
}

.dir-topic-row.is-disabled {
  opacity: 0.5;
  cursor: default;
}

.dir-topic-row.is-disabled:hover {
  background-color: transparent;
}

.dir-topic-icon {
  font-size: 1.125rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.dir-topic-row.is-active .dir-topic-icon {
  color: var(--on-secondary-container);
}

.dir-topic-title {
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dir-score-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 9999px;
  padding: 2px 10px;
  flex-shrink: 0;
}

.dir-score-chip .material-symbols-rounded {
  font-size: 0.875rem;
}

.dir-score-chip.chip-done {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  border-color: var(--primary);
}

.dir-score-chip.chip-none {
  color: var(--text-tertiary);
}

.dir-arrow {
  font-size: 1.125rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}
</style>
