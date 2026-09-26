<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  getTopicQuiz,
  getQuizQuestionResult,
  getTopicQuizScore,
  isQuizAllCorrect,
  isAnswerCorrect,
  loadQuizResults,
  saveQuizResults,
  setQuizQuestionResult,
  syncQuizCompletion,
  getQuizAnswers,
  setQuizAnswer,
  clearQuizAnswers,
  type QuizQuestion,
  type QuizInlineQuestion,
  type QuizMultiQuestion,
  type QuizBlankQuestion,
  type QuizOrderQuestion,
  type QuizCodeQuestion,
  type QuizAnswerValue
} from './quizData';
import { type TutorialStage, type TutorialTopic } from './tutorialData';
import TutorialFormattedText from './TutorialFormattedText.vue';
import { useI18n } from '../../utils/i18n';

const { t, tf } = useI18n();

const props = defineProps<{
  topicId: string;
  /** 当前系列的阶段（由 TutorialView 传入；题目与「下一节」都限定在本系列内） */
  stages?: TutorialStage[];
  seriesTitle?: string;
}>();

const emit = defineEmits<{
  (e: 'back-to-tutorial'): void;
  (e: 'back-to-home'): void;
  (e: 'load-code-to-editor', payload: { code: string; topicId: string; topicTitle: string; isQuiz: boolean; questionId: string; expectedOutput: string }): void;
  (e: 'results-changed'): void;
  (e: 'next-topic', topicId: string): void;
}>();

const seriesTopics = computed<TutorialTopic[]>(() => {
  const topics: TutorialTopic[] = [];
  for (const stage of props.stages || []) {
    stage.topics?.forEach(topic => topics.push(topic));
    stage.subcategories?.forEach(sub => sub.topics.forEach(topic => topics.push(topic)));
  }
  return topics;
});

const topic = computed<TutorialTopic | undefined>(() =>
  seriesTopics.value.find(t => t.id === props.topicId)
);

const quiz = computed(() => getTopicQuiz(props.topicId));

// 在测验页内作答的题目（单选 / 多选 / 填空 / 排序）与代码题分开渲染
const inlineQuestions = computed(() =>
  (quiz.value?.questions.filter(q => q.type !== 'code') || []) as QuizInlineQuestion[]
);

const codeQuestions = computed(() =>
  (quiz.value?.questions.filter(q => q.type === 'code') || []) as QuizCodeQuestion[]
);

const answers = ref<Record<string, QuizAnswerValue>>({});
const submitted = ref(false);
const refreshTick = ref(0);

const syncSubmitted = () => {
  submitted.value = inlineQuestions.value.some(q => getQuizQuestionResult(props.topicId, q.id));
};

watch(
  () => props.topicId,
  () => {
    answers.value = getQuizAnswers(props.topicId);
    refreshTick.value++;
    syncSubmitted();
    syncQuizCompletion(props.topicId);
  },
  { immediate: true }
);

const score = computed(() => {
  void refreshTick.value;
  return getTopicQuizScore(props.topicId);
});

// 全部题目（含代码题）通过 → 显示「下一节」入口
const allPassed = computed(() => {
  void refreshTick.value;
  return isQuizAllCorrect(props.topicId);
});

// 当前系列目录中的下一节；已是最后一节时为 null
const nextTopic = computed<TutorialTopic | null>(() => {
  const topics = seriesTopics.value;
  const idx = topics.findIndex(topic => topic.id === props.topicId);
  return idx >= 0 && idx < topics.length - 1 ? topics[idx + 1] : null;
});

const answeredCount = computed(() =>
  inlineQuestions.value.filter(q => answers.value[q.id] !== undefined).length
);

const typeLabel = (q: QuizInlineQuestion): string => {
  switch (q.type) {
    case 'choice': return t('questionTypeChoice');
    case 'multi': return t('questionTypeMulti');
    case 'blank': return t('questionTypeBlank');
    default: return t('questionTypeOrder');
  }
};

const saveAnswer = (questionId: string, value: QuizAnswerValue) => {
  answers.value[questionId] = value;
  setQuizAnswer(props.topicId, questionId, value);
};

// 单选
const selectChoice = (q: QuizInlineQuestion, optionIndex: number) => {
  if (submitted.value) return;
  saveAnswer(q.id, optionIndex);
};

// 多选：某选项是否已勾选
const multiSelected = (q: QuizMultiQuestion, optionIndex: number): boolean => {
  const value = answers.value[q.id];
  return Array.isArray(value) && (value as number[]).includes(optionIndex);
};

// m3e-radio / m3e-checkbox 的 @change：按项目约定用方法引用（内联语句拿不到事件），
// 题目与选项序号经 data 属性带回
const onOptionChange = (e: Event) => {
  const el = e.currentTarget as HTMLElement;
  const q = inlineQuestions.value.find(item => item.id === el.dataset.qid);
  const optionIndex = Number(el.dataset.oi);
  if (!q || Number.isNaN(optionIndex)) return;
  if (q.type === 'choice') selectChoice(q, optionIndex);
  else if (q.type === 'multi') toggleMulti(q, optionIndex);
};

const toggleMulti = (q: QuizMultiQuestion, optionIndex: number) => {
  if (submitted.value) return;
  const current = Array.isArray(answers.value[q.id]) ? [...(answers.value[q.id] as number[])] : [];
  const at = current.indexOf(optionIndex);
  if (at >= 0) current.splice(at, 1);
  else current.push(optionIndex);
  saveAnswer(q.id, current.sort((a, b) => a - b));
};

// 填空：按空位读写作答文本（未作答时为空串）
const blankValues = (q: QuizBlankQuestion): string[] => {
  const value = answers.value[q.id];
  return Array.isArray(value) ? [...(value as string[])] : [];
};

const setBlank = (q: QuizBlankQuestion, index: number, text: string) => {
  if (submitted.value) return;
  const next = blankValues(q);
  next[index] = text;
  saveAnswer(q.id, next);
};

// 排序：当前顺序（未调整过时为打乱后的原始顺序）
const orderValues = (q: QuizOrderQuestion): number[] => {
  const value = answers.value[q.id];
  return Array.isArray(value) ? [...(value as number[])] : q.items.map((_, i) => i);
};

const moveOrderItem = (q: QuizOrderQuestion, position: number, delta: number) => {
  if (submitted.value) return;
  const order = orderValues(q);
  const target = position + delta;
  if (target < 0 || target >= order.length) return;
  [order[position], order[target]] = [order[target], order[position]];
  saveAnswer(q.id, order);
};

// 提交测验的 snackbar 反馈（self-contained，不依赖 App 事件链）
const quizSnackMsg = ref('');
const showQuizSnack = (msg: string) => {
  quizSnackMsg.value = msg;
};

const submitAnswers = () => {
  submitted.value = true;
  let correct = 0;
  const total = inlineQuestions.value.length;
  for (const q of inlineQuestions.value) {
    const pass = isAnswerCorrect(q, answers.value[q.id]);
    if (pass) correct++;
    setQuizQuestionResult(props.topicId, q.id, pass ? 'pass' : 'fail');
  }
  syncQuizCompletion(props.topicId);
  refreshTick.value++;
  emit('results-changed');
  // 提交反馈：全部答对 → 通过提示；否则给出得分
  showQuizSnack(correct === total ? t('quizSubmitPassed') : tf('quizSubmitScore', { correct, total }));
};

const resetQuiz = () => {
  const results = loadQuizResults();
  delete results[props.topicId];
  saveQuizResults(results);
  clearQuizAnswers(props.topicId);
  answers.value = {};
  submitted.value = false;
  refreshTick.value++;
  emit('results-changed');
  showQuizSnack(t('quizResetDone'));
};

const loadToEditor = (q: QuizQuestion) => {
  if (q.type !== 'code') return;
  emit('load-code-to-editor', {
    code: q.starterCode,
    topicId: props.topicId,
    topicTitle: topic.value?.title || '',
    isQuiz: true,
    questionId: q.id,
    expectedOutput: q.expectedOutput
  });
};

const getCodeStatus = (q: QuizQuestion): 'pass' | 'fail' | null => {
  void refreshTick.value; // 依赖刷新计数：作答结果变化后重新渲染
  return getQuizQuestionResult(props.topicId, q.id);
};

const isQuestionPass = (q: QuizQuestion) =>
  getQuizQuestionResult(props.topicId, q.id) === 'pass';
</script>

<template>
  <m3e-content-pane class="quiz-view">
    <div class="quiz-wrapper">
      <!-- 面包屑：学习 / 当前系列 / 测验 / 当前题目（与文章页同一套层级） -->
      <m3e-breadcrumb class="quiz-breadcrumb density-3">
        <m3e-breadcrumb-item @click="emit('back-to-home')">{{ t('navTutorial') }}</m3e-breadcrumb-item>
        <m3e-breadcrumb-item @click="emit('back-to-tutorial')">{{ seriesTitle }}</m3e-breadcrumb-item>
        <m3e-breadcrumb-item disabled>{{ t('quizShort') }}</m3e-breadcrumb-item>
        <m3e-breadcrumb-item>{{ topic?.title || topicId }}</m3e-breadcrumb-item>
      </m3e-breadcrumb>

      <div class="quiz-header">
        <!-- 题头返回按钮：直接回学习首页（面包屑的「学习」同效，这里给小屏/习惯图标的人一条明路） -->
        <m3e-icon-button class="quiz-back-btn" variant="tonal" :title="t('backToLearnHome')"
          @click="emit('back-to-home')">
          <span class="material-symbols-rounded">arrow_back</span>
        </m3e-icon-button>
        <div class="quiz-title-group">
          <div>
            <div class="quiz-title">{{ t('quizAfterClass') }}</div>
            <div class="quiz-topic-title">
              <TutorialFormattedText :text="topic?.title || topicId" />
            </div>
          </div>
        </div>
        <div class="quiz-score-badge" :class="{ 'is-done': score.correct > 0 && score.correct === score.total }">
          <span class="material-symbols-rounded">scoreboard</span>
          <span>{{ t('quizScoreText').replace('{correct}', String(score.correct)).replace('{total}',
            String(score.total)) }}</span>
        </div>
      </div>

      <div v-if="!quiz || quiz.questions.length === 0" class="quiz-empty">
        {{ t('quizEmpty') }}
      </div>

      <template v-else>
        <!-- 单选 / 多选 / 填空 / 排序（卡片与设置界面同款） -->
        <m3e-card v-for="(q, qi) in inlineQuestions" :key="q.id" variant="outlined" class="quiz-question-card"
          :class="{ 'is-passed': submitted && isQuestionPass(q) }">
          <div slot="header" class="quiz-card-header">
            <h4 class="quiz-card-title">
              <span class="q-index">{{ t('questionIndexText').replace('{n}', String(qi + 1)) }}</span>
              <span class="q-type-chip" :class="`chip-${q.type}`">{{ typeLabel(q) }}</span>
            </h4>
            <span v-if="submitted" class="q-result-chip" :class="isQuestionPass(q) ? 'chip-pass' : 'chip-fail'">
              {{ isQuestionPass(q) ? t('answerCorrect') : t('answerWrong') }}
            </span>
          </div>
          <div slot="content" class="quiz-card-content">
            <p class="question-text">
              <TutorialFormattedText :text="q.question" />
            </p>

            <!-- 单选：整行是 label，点行内任意处都能选中；对错仍由行的 is-correct/is-wrong 配色表达 -->
            <div v-if="q.type === 'choice'" class="option-list">
              <label v-for="(opt, oi) in q.options" :key="oi" class="option-item" :class="{
                'is-selected': answers[q.id] === oi,
                'is-correct': submitted && oi === q.answerIndex,
                'is-wrong': submitted && answers[q.id] === oi && oi !== q.answerIndex,
                'is-locked': submitted
              }">
                <m3e-radio class="option-control" :checked="answers[q.id] === oi" :disabled="submitted"
                  :data-qid="q.id" :data-oi="oi" @change="onOptionChange" />
                <span class="option-text">
                  <TutorialFormattedText :text="opt" />
                </span>
              </label>
            </div>

            <!-- 多选 -->
            <div v-else-if="q.type === 'multi'" class="option-list">
              <label v-for="(opt, oi) in q.options" :key="oi" class="option-item" :class="{
                'is-selected': multiSelected(q, oi),
                'is-correct': submitted && q.answerIndexes.includes(oi),
                'is-wrong': submitted && multiSelected(q, oi) && !q.answerIndexes.includes(oi),
                'is-locked': submitted
              }">
                <m3e-checkbox class="option-control" :checked="multiSelected(q, oi)" :disabled="submitted"
                  :data-qid="q.id" :data-oi="oi" @change="onOptionChange" />
                <span class="option-text">
                  <TutorialFormattedText :text="opt" />
                </span>
              </label>
            </div>

            <!-- 填空 -->
            <div v-else-if="q.type === 'blank'" class="blank-list">
              <label v-for="(_, i) in q.blanks" :key="i" class="blank-row">
                <span class="blank-label">{{ tf('blankLabel', { n: i + 1 }) }}</span>
                <input class="blank-input" type="text" spellcheck="false" autocomplete="off" :disabled="submitted"
                  :placeholder="t('blankPlaceholder')" :value="blankValues(q)[i] || ''"
                  @input="setBlank(q, i, ($event.target as HTMLInputElement).value)" />
              </label>
            </div>

            <!-- 排序 -->
            <div v-else class="order-list">
              <div v-for="(itemIndex, pos) in orderValues(q)" :key="itemIndex" class="order-item">
                <span class="order-pos">{{ pos + 1 }}</span>
                <code class="order-text">{{ q.items[itemIndex] }}</code>
                <span class="order-actions">
                  <m3e-icon-button size="extra-small" :disabled="submitted || pos === 0" :title="t('moveUp')"
                    @click="moveOrderItem(q, pos, -1)">
                    <span class="material-symbols-rounded">keyboard_arrow_up</span>
                  </m3e-icon-button>
                  <m3e-icon-button size="extra-small" :disabled="submitted || pos === orderValues(q).length - 1"
                    :title="t('moveDown')" @click="moveOrderItem(q, pos, 1)">
                    <span class="material-symbols-rounded">keyboard_arrow_down</span>
                  </m3e-icon-button>
                </span>
              </div>
            </div>

            <div v-if="submitted && q.explanation" class="explanation-box">
              <span class="material-symbols-rounded">lightbulb</span>
              <span>
                <TutorialFormattedText :text="q.explanation" />
              </span>
            </div>
          </div>
        </m3e-card>

        <!-- 代码题（卡片与设置界面同款） -->
        <m3e-card v-for="(q, qi) in codeQuestions" :key="q.id" variant="outlined" class="quiz-question-card"
          :class="{ 'is-passed': getCodeStatus(q) === 'pass' }">
          <div slot="header" class="quiz-card-header">
            <h4 class="quiz-card-title">
              <span class="q-index">{{ t('questionIndexText').replace('{n}', String(inlineQuestions.length + qi + 1))
                }}</span>
              <span class="q-type-chip chip-code">{{ t('questionTypeCode') }}</span>
            </h4>
            <span v-if="getCodeStatus(q)" class="q-result-chip"
              :class="getCodeStatus(q) === 'pass' ? 'chip-pass' : 'chip-fail'">
              {{ getCodeStatus(q) === 'pass' ? t('codePassed') : t('codeFailed') }}
            </span>
            <span v-else class="q-result-chip chip-pending">{{ t('notAnswered') }}</span>
          </div>
          <div slot="content" class="quiz-card-content">
            <p class="question-text">
              <TutorialFormattedText :text="q.question" />
            </p>
            <div class="code-question-block">
              <pre class="code-preview"><code>{{ q.starterCode }}</code></pre>
              <div class="code-question-actions">
                <m3e-button variant="filled" size="extra-small" @click="loadToEditor(q)">
                  <span slot="icon" class="material-symbols-rounded">open_in_new</span>
                  {{ t('putInEditor') }}
                </m3e-button>
                <span class="code-action-hint">{{ t('codeActionHint') }}</span>
              </div>
            </div>
          </div>
        </m3e-card>

        <!-- 底部操作 -->
        <div class="quiz-actions">
          <m3e-button v-if="inlineQuestions.length > 0" variant="filled" size="medium" :disabled="submitted"
            @click="submitAnswers">
            <span slot="icon" class="material-symbols-rounded">task_alt</span>
            {{ submitted ? t('choiceSubmitted') : t('submitQuizText').replace('{answered}',
              String(answeredCount)).replace('{total}', String(inlineQuestions.length)) }}
          </m3e-button>
          <m3e-button variant="tonal" size="medium" @click="resetQuiz">
            <span slot="icon" class="material-symbols-rounded">restart_alt</span>
            {{ t('retakeQuiz') }}
          </m3e-button>
          <!-- 测验全部通过后才出现：跳到课程目录的下一节 -->
          <m3e-button v-if="allPassed && nextTopic" variant="filled" size="medium"
            @click="emit('next-topic', nextTopic.id)">
            <span slot="icon" class="material-symbols-rounded">arrow_forward</span>
            {{ t('nextSectionBtn') }}
          </m3e-button>
        </div>
      </template>
    </div>
  </m3e-content-pane>

  <!-- 提交测验 / 重置的 snackbar 反馈 -->
  <m3e-snackbar :open="!!quizSnackMsg" :duration="4000"
    @toggle="(e: Event) => { if ((e as any).newState === 'closed') quizSnackMsg = ''; }">
    {{ quizSnackMsg }}
  </m3e-snackbar>
</template>

<style scoped>
.quiz-view {
  flex: 1;
  min-height: 0;
  height: 100%;
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 1rem;
  --m3e-content-pane-container-color: var(--bg-color);
  --m3e-content-pane-container-padding: 32px;
  user-select: text;
}

.quiz-wrapper {
  max-width: 860px;
  margin: 0 auto;
}

.quiz-breadcrumb {
  margin-bottom: 16px;
  --m3e-breadcrumb-item-container-height: 32px;
}

.quiz-header {
  position: sticky;
  top: -32px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0 16px;
  /* 吸顶时与正文底色无缝衔接（跟随 .quiz-view 的 --bg-color） */
  background-color: var(--bg-color);
}

.quiz-back-btn {
  flex-shrink: 0;
}

.quiz-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.quiz-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.quiz-topic-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.3;
}

.quiz-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  background-color: var(--surface-variant);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.quiz-score-badge.is-done {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

.quiz-empty {
  padding: 48px;
  text-align: center;
  color: var(--text-tertiary);
}

/* 题目卡片沿用全局 m3e-card 外观（描边/圆角/内边距），这里只调底色与间距。
   底色必须反过来取 --surface-color：正文底已是 --bg-color，卡片再取 --bg-color
   就和底同色、只剩一道描边（与文章里 .overview-box/.tips-box 在浅色纸面上的取法一致） */
.quiz-question-card {
  margin-bottom: 20px;
  --m3e-card-container-color: var(--surface-color);
}

/* 代码题已通过：绿色描边 + 加粗状态 chip，明确「已通过」 */
.quiz-question-card.is-passed {
  --m3e-card-outline-color: var(--accent-emerald-border);
}

.quiz-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4 {
    line-height: 2.4rem;
  }
}

.quiz-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--secondary);
  margin: 0;
}

.q-index {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
}

.q-type-chip {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.5;
  padding: 2px 10px;
  border-radius: 9999px;
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
}

.q-type-chip.chip-code {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

.q-type-chip.chip-multi {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

.q-type-chip.chip-blank,
.q-type-chip.chip-order {
  background-color: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

/* 填空题 */
.blank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blank-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.blank-label {
  flex-shrink: 0;
  min-width: 4.5rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.blank-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--text-color);
  background-color: var(--surface-variant);
  border: 1px solid var(--border-color-muted);
  border-radius: 8px;
  outline: none;
}

.blank-input:focus {
  border: 2px solid var(--primary);
  padding: 0 9px;
}

.blank-input:disabled {
  opacity: 0.7;
}

/* 排序题 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 6px 10px;
  border: 1px solid var(--border-color-muted);
  border-radius: 8px;
  background-color: var(--surface-variant);
}

.order-pos {
  flex-shrink: 0;
  min-width: 1.2rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-tertiary);
}

.order-text {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: pre;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text-color);
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.q-result-chip {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.5;
  padding: 2px 10px;
  border-radius: 9999px;
}

.chip-pass {
  background-color: color-mix(in srgb, var(--accent-emerald-border) 20%, transparent);
  color: var(--accent-emerald-text);
  font-weight: 700;
}

.chip-fail {
  background-color: color-mix(in srgb, var(--error, #ba1a1a) 12%, transparent);
  color: var(--error, #ba1a1a);
}

.chip-pending {
  background-color: var(--surface-variant);
  color: var(--text-tertiary);
}

.question-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 14px;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  /* 选项行落在 12px 的题目卡片里：M3 要求 inner = outer − padding，容器与子元素
     不得用同一半径，否则内圆角会跟着外圆角一起"涨"，取小一档 CornerSmall */
  border-radius: 8px;
  border: 1px solid none;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color var(--motion-effects-fast), border-color var(--motion-effects-fast),
    color var(--motion-effects-fast);
}

.option-item:hover:not(.is-locked) {
  background-color: var(--surface-variant);
}

.option-item.is-selected {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

.option-item.is-correct {
  border-color: var(--accent-emerald-border);
  background-color: color-mix(in srgb, var(--accent-emerald-border) 12%, var(--surface-color));
  color: var(--accent-emerald-text);
}

.option-item.is-wrong {
  border-color: var(--error, #ba1a1a);
  background-color: color-mix(in srgb, var(--error, #ba1a1a) 10%, var(--surface-color));
  color: var(--error, #ba1a1a);
}

.option-item.is-locked {
  cursor: default;
}

/* m3e-radio / m3e-checkbox：库默认容器 40px（触控尺寸），放在行内会把行撑高，
   收到 24px 图标仍为 18px，与原先 1.125rem 的字形同高 */
.option-control {
  --m3e-radio-container-size: 24px;
  --m3e-radio-icon-size: 18px;
  --m3e-checkbox-container-size: 24px;
  --m3e-checkbox-icon-size: 18px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  min-width: 0;
}

.explanation-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px; /* 落在 12px 题目卡片内，取小一档（inner = outer − padding） */
  background-color: var(--surface-variant);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.explanation-box .material-symbols-rounded {
  font-size: 1rem;
  color: var(--secondary);
  flex-shrink: 0;
  margin-top: 1px;
}

.code-question-block {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color-muted);
}

.code-preview {
  margin: 0;
  padding: 14px 16px;
  background-color: #1e1e2e;
  color: #cdd6f4;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
  user-select: text;
}

.code-question-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background-color: var(--surface-variant);
}

.code-action-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.quiz-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
</style>
