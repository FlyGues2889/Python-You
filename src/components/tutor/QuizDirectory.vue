<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getTopicQuizScore, type QuizScore } from './quizData';
import { getLocalizedTutorialStages, type TutorialStage, type TutorialTopic } from './tutorialData';
import TutorialFormattedText from './TutorialFormattedText.vue';
import { useI18n } from '../../utils/i18n';

const { t } = useI18n();

const props = defineProps<{
  activeTopicId?: string;
}>();

const emit = defineEmits<{
  (e: 'open-quiz', topicId: string): void;
  (e: 'back-to-tutorial'): void;
}>();

const stages = computed(() => getLocalizedTutorialStages());
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

const topicRows = (stage: TutorialStage): TutorialTopic[] => {
  const rows: TutorialTopic[] = [];
  if (stage.topics) rows.push(...stage.topics);
  if (stage.subcategories) {
    for (const sub of stage.subcategories) {
      if (sub.topics) rows.push(...sub.topics);
    }
  }
  return rows;
};
</script>

<template>
  <m3e-content-pane class="quiz-directory">
    <div class="quiz-dir-wrapper">
      <div class="quiz-dir-header">
        <m3e-icon-button size="small" :title="t('backToTutorial')" @click="emit('back-to-tutorial')">
          <span class="material-symbols-rounded">arrow_back</span>
        </m3e-icon-button>
        <div>
          <div class="dir-title">{{ t('quizDirectoryTitle') }}</div>
          <div class="dir-subtitle">{{ t('quizDirectorySubtitle') }}</div>
        </div>
      </div>

      <div class="dir-stages">
        <div v-for="stage in stages" :key="stage.id" class="dir-stage-block">
          <div class="dir-stage-header">
            <span class="material-symbols-rounded-fill dir-stage-icon">folder</span>
            <span class="dir-stage-title">{{ stage.title }}</span>
          </div>

          <div
            v-for="topic in topicRows(stage)"
            :key="topic.id"
            class="dir-topic-row"
            :class="{ 'is-active': activeTopicId === topic.id, 'is-disabled': getScore(topic.id).total === 0 }"
            @click="getScore(topic.id).total > 0 && emit('open-quiz', topic.id)"
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
  min-height: 0;
  height: 100%;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  /* 外边距留在 host 上（露出的空隙由父级 --bg-color 填充 → 边距可见）；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制
     （与 REPL 终端主体一致:surface 色 + 10px 圆角 + 32px 内边距） */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 10px;
  --m3e-content-pane-container-color: var(--surface-color);
  --m3e-content-pane-container-padding: 32px;
  user-select: text;
}

.quiz-dir-wrapper {
  max-width: 860px;
  margin: 0 auto;
}

.quiz-dir-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
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
  border-radius: 10px;
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
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.15s;
  margin-bottom: 4px;
}

.dir-topic-row:hover {
  background-color: var(--surface-variant);
}

.dir-topic-row.is-active {
  background-color: var(--primary-container);
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
  color: var(--primary);
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
