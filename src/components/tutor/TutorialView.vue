<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TutorialTree from './TutorialTree.vue';
import TutorialContent from './TutorialContent.vue';
import QuizDirectory from './QuizDirectory.vue';
import QuizView from './QuizView.vue';
import { type TutorialTopic, getLocalizedTutorialStages } from './tutorialData';
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

const savedTopicId = safeStorage.getItem('python_you_last_tutorial_topic');
const activeTopicId = ref(props.activeTopicIdProp || savedTopicId || 'p1_home');
const isTreeCollapsed = ref(false);

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
  if (newTopicId) {
    safeStorage.setItem('python_you_last_tutorial_topic', newTopicId);
  }
});

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

const currentTopic = computed<TutorialTopic>(() => {
  const found = allTopics.value.find(t => t.id === activeTopicId.value);
  if (found) return found;
  return allTopics.value[0];
});

// ---- Quiz view state ----
const viewMode = ref<'article' | 'quiz-directory' | 'quiz'>('article');
const quizTopicId = ref('');
const quizRefreshTick = ref(0);

const quizStats = computed<Record<string, { correct: number; total: number }>>(() => {
  void quizRefreshTick.value;
  const stats: Record<string, { correct: number; total: number }> = {};
  for (const topic of allTopics.value) {
    const score = getTopicQuizScore(topic.id);
    if (score.total > 0) {
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

const toggleQuizDirectory = (topicId?: string) => {
  const target = topicId || activeTopicId.value;
  if (viewMode.value === 'quiz-directory' && quizTopicId.value === target) {
    viewMode.value = 'article';
  } else {
    quizTopicId.value = target;
    viewMode.value = 'quiz-directory';
  }
  refreshQuizStats();
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
    <!-- Left Tree Navigation -->
    <TutorialTree
      :active-topic-id="activeTopicId"
      :collapsed="isTreeCollapsed"
      :completed-topics="completedTopics"
      :quiz-stats="quizStats"
      @select-topic="handleSelectTopic"
      @toggle-collapse="isTreeCollapsed = !isTreeCollapsed"
      @toggle-quiz-directory="toggleQuizDirectory"
    />

    <!-- Right Article Content -->
    <TutorialContent
      v-if="viewMode === 'article'"
      :topic="currentTopic"
      :is-completed="completedTopics.has(activeTopicId)"
      @select-topic="handleSelectTopic"
      @load-code-to-editor="handleLoadCode"
      @toggle-completed="toggleCompleted(activeTopicId)"
      @open-quiz="openQuiz(activeTopicId)"
      @contextmenu-tutorial="e => emit('contextmenu-tutorial', e)"
    />

    <!-- Right Quiz Directory -->
    <QuizDirectory
      v-else-if="viewMode === 'quiz-directory'"
      :active-topic-id="quizTopicId"
      @open-quiz="openQuiz"
      @back-to-tutorial="backToArticle"
    />

    <!-- Right Quiz View -->
    <QuizView
      v-else
      :topic-id="quizTopicId"
      @back-to-tutorial="backToArticle"
      @load-code-to-editor="handleLoadCode"
      @results-changed="refreshQuizStats"
    />
  </div>
</template>

<style scoped>
.tutorial-main-view {
  padding-bottom: 0.4rem;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: var(--surface-color);
}
</style>
