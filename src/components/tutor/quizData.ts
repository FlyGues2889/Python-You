// 测验数据：题型定义 + 作答/成绩存取 + TOPIC_QUIZZES 注册表（题库按系列放在 quiz/<系列>Quizzes.ts）
// 代码题通过放入编辑器在编辑器窗口中作答，提交后由编辑器 FAB 校验输出。
import type { OutputExpectation } from '../../utils/quizGrader';
import { pythonQuizzes } from './quiz/pythonQuizzes';
import { databaseQuizzes } from './quiz/databaseQuizzes';
import { scrapingQuizzes } from './quiz/scrapingQuizzes';
import { webQuizzes } from './quiz/webQuizzes';
import { automationQuizzes } from './quiz/automationQuizzes';

export interface QuizChoiceQuestion {
  id: string;
  type: 'choice';
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

// 多选题：answerIndexes 列出全部正确选项（少选或多选都判错）
export interface QuizMultiQuestion {
  id: string;
  type: 'multi';
  question: string;
  options: string[];
  answerIndexes: number[];
  explanation?: string;
}

// 填空题：question 中用 ____ 占位，blanks[i] 是第 i 个空的可接受答案（忽略大小写与首尾空格）
export interface QuizBlankQuestion {
  id: string;
  type: 'blank';
  question: string;
  blanks: string[][];
  explanation?: string;
}

// 排序题：items 为打乱后的条目，correctOrder 是正确顺序（items 的下标序列）
export interface QuizOrderQuestion {
  id: string;
  type: 'order';
  question: string;
  items: string[];
  correctOrder: number[];
  explanation?: string;
}

// 每道题一份的初始展示顺序（首次渲染时摇一次并缓存，之后稳定不变）
const initialOrders = new Map<string, number[]>();

/**
 * 排序题未作答时的展示顺序。
 * 契约要求 items 本身就是乱序的，但历史题库里有 18 道按正确次序排列（correctOrder 为 [0,1,2,…]），
 * 那样一打开就等于已经答对、用户按题意重排反而判错。这里对未作答的题统一摇一次：
 * 同一道题多次渲染结果不变（模板里会反复调用），摇出来正好等于正确次序时重摇，避免开局即答对。
 */
export function initialOrderFor(q: QuizOrderQuestion): number[] {
  const cached = initialOrders.get(q.id);
  if (cached) return [...cached];
  const order = q.items.map((_, i) => i);
  for (let attempt = 0; attempt < 8; attempt++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.some((v, i) => v !== q.correctOrder[i])) break;
  }
  initialOrders.set(q.id, order);
  return [...order];
}

export interface QuizCodeQuestion {
  id: string;
  type: 'code';
  question: string;
  starterCode: string;
  /** 期望输出：字符串（行序列严格相等）或 B-7 的其它匹配方式 */
  expectedOutput: OutputExpectation;
  hint?: string;
}

export type QuizQuestion =
  | QuizChoiceQuestion
  | QuizMultiQuestion
  | QuizBlankQuestion
  | QuizOrderQuestion
  | QuizCodeQuestion;

/** 在测验页内作答、由判分器判定的题目（即除代码题外的全部题型） */
export type QuizInlineQuestion = Exclude<QuizQuestion, QuizCodeQuestion>;

export interface TopicQuiz {
  topicId: string;
  questions: QuizQuestion[];
}

export interface QuizResults {
  [topicId: string]: { [questionId: string]: 'pass' | 'fail' };
}

/** 作答值：单选存下标、多选与排序存下标数组、填空存文本数组（历史数据里的纯数字仍然兼容） */
export type QuizAnswerValue = number | number[] | string[];

// 作答记录（用于返回测验页时恢复已答内容）
export interface QuizAnswersMap {
  [topicId: string]: { [questionId: string]: QuizAnswerValue };
}

const QUIZ_ANSWERS_KEY = 'python_you_quiz_answers';

function loadQuizAnswers(): QuizAnswersMap {
  try {
    const raw = localStorage.getItem(QUIZ_ANSWERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as QuizAnswersMap;
    }
  } catch {}
  return {};
}

function saveQuizAnswers(map: QuizAnswersMap) {
  try {
    localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(map));
  } catch {}
}

export function getQuizAnswers(topicId: string): Record<string, QuizAnswerValue> {
  return { ...(loadQuizAnswers()[topicId] || {}) };
}

export function setQuizAnswer(topicId: string, questionId: string, value: QuizAnswerValue) {
  const map = loadQuizAnswers();
  if (!map[topicId]) map[topicId] = {};
  map[topicId][questionId] = value;
  saveQuizAnswers(map);
}

export function clearQuizAnswers(topicId: string) {
  const map = loadQuizAnswers();
  if (map[topicId]) {
    delete map[topicId];
    saveQuizAnswers(map);
  }
}

const QUIZ_RESULTS_KEY = 'python_you_quiz_results';

export function loadQuizResults(): QuizResults {
  try {
    const raw = localStorage.getItem(QUIZ_RESULTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as QuizResults;
    }
  } catch {}
  return {};
}

export function saveQuizResults(results: QuizResults) {
  try {
    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
  } catch {}
}

export function setQuizQuestionResult(topicId: string, questionId: string, result: 'pass' | 'fail') {
  const results = loadQuizResults();
  if (!results[topicId]) results[topicId] = {};
  results[topicId][questionId] = result;
  saveQuizResults(results);
}

export function getQuizQuestionResult(topicId: string, questionId: string): 'pass' | 'fail' | null {
  const results = loadQuizResults();
  return results[topicId]?.[questionId] ?? null;
}

export interface QuizScore {
  correct: number;
  total: number;
  answered: number;
}

export function getTopicQuizScore(topicId: string): QuizScore {
  const quiz = getTopicQuiz(topicId);
  if (!quiz) return { correct: 0, total: 0, answered: 0 };
  const results = loadQuizResults();
  const answers = results[topicId] || {};
  let correct = 0;
  let answered = 0;
  for (const q of quiz.questions) {
    const r = answers[q.id];
    if (r) {
      answered++;
      if (r === 'pass') correct++;
    }
  }
  return { correct, total: quiz.questions.length, answered };
}

export function getTopicQuiz(topicId: string): TopicQuiz | null {
  return TOPIC_QUIZZES.find(q => q.topicId === topicId) || null;
}

// 非代码题的作答判定（单选题 / 多选 / 填空 / 排序）；代码题由编辑器运行输出判分
export function isAnswerCorrect(q: QuizInlineQuestion, answer: QuizAnswerValue | undefined): boolean {
  if (answer === undefined) return false;
  switch (q.type) {
    case 'choice':
      return answer === q.answerIndex;
    case 'multi': {
      if (!Array.isArray(answer)) return false;
      const chosen = [...(answer as number[])].sort((a, b) => a - b);
      const correct = [...q.answerIndexes].sort((a, b) => a - b);
      return chosen.length === correct.length && chosen.every((v, i) => v === correct[i]);
    }
    case 'blank': {
      if (!Array.isArray(answer)) return false;
      const filled = answer as string[];
      if (filled.length !== q.blanks.length) return false;
      return q.blanks.every((accepted, i) => {
        const value = String(filled[i] ?? '').trim().toLowerCase();
        return value.length > 0 && accepted.some(a => a.trim().toLowerCase() === value);
      });
    }
    case 'order': {
      if (!Array.isArray(answer)) return false;
      const order = answer as number[];
      return order.length === q.correctOrder.length && order.every((v, i) => v === q.correctOrder[i]);
    }
    default:
      return false;
  }
}

// 测验是否全部答对
export function isQuizAllCorrect(topicId: string): boolean {
  const score = getTopicQuizScore(topicId);
  return score.total > 0 && score.correct === score.total;
}

const COMPLETED_KEY = 'python_you_completed_topics';

function markTopicCompleted(topicId: string) {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    let arr: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) arr = parsed;
    }
    if (!arr.includes(topicId)) {
      arr.push(topicId);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(arr));
    }
  } catch {}
}

// 测验全对时自动把该主题标记为已完成，返回是否刚刚标记
export function syncQuizCompletion(topicId: string): boolean {
  if (isQuizAllCorrect(topicId)) {
    markTopicCompleted(topicId);
    return true;
  }
  return false;
}

export const TOPIC_QUIZZES: TopicQuiz[] = [
  ...pythonQuizzes,
  ...databaseQuizzes,
  ...scrapingQuizzes,
  ...webQuizzes,
  ...automationQuizzes,
];
