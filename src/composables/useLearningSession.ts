// useLearningSession.ts —— 教程/测验会话（HANDOFF 提示词 6 批次 3）：
// activeTutorialSource / 活动教程小节 / 测验通过态 / demo 缓冲区键 / 判分对比弹窗 /
// 测验提交与判分 / 返回教程与返回测验 / 工具栏模式判定。
// 工作区缓冲（tutorial_demo.py 落盘、开标签）留在 App.vue——本 composable 只持有会话状态与
// 判分逻辑；运行、判分数据、导航等外部能力经 deps 注入（惰性箭头，setup 期不触发 TDZ）。
import { computed, nextTick, ref } from 'vue';
import type { ConsoleOutput, FSItem, RunResult } from '../types';
import { safeStorage } from '../utils/storage';
import { t } from '../utils/i18n';
import { gradeOutput } from '../utils/quizGrader';

const LAST_TOPIC_KEY = 'python_you_last_tutorial_topic';

export interface TutorialSource {
  id: string;
  title: string;
  isQuiz?: boolean;
  questionId?: string;
  expectedOutput?: string;
}

export interface LearningDeps {
  /** 当前活动标签（只读 view）：取 content 判分、name 判 tutorial_demo.py */
  getActiveTab: () => { name?: string; content?: string } | null;
  runCode: (code: string, files: FSItem[], onOut: (out: ConsoleOutput) => void, demoMode: boolean) => Promise<RunResult>;
  getWorkspaceItems: () => FSItem[];
  getDemoMode: () => boolean;
  pushConsole: (out: ConsoleOutput) => void;
  showToast: (msg: string) => void;
  setActiveNavTab: (v: string) => void;
  /** 让 TutorialView 直接打开测验界面（App 侧经 ref 转发） */
  openQuizExternally: (topicId: string) => void;
  quizData: {
    getResult: (topicId: string, questionId: string) => string | null;
    setResult: (topicId: string, questionId: string, v: 'pass' | 'fail') => void;
    syncCompletion: (topicId: string) => void;
  };
}

export function useLearningSession(deps: LearningDeps) {
  const activeTutorialSource = ref<TutorialSource | null>(null);
  const activeTutorialTopicId = ref<string>(safeStorage.getItem(LAST_TOPIC_KEY) || 'p1_home');
  const activeQuizPassed = ref(false);
  // 当前 tutorial_demo.py 缓冲区属于哪道题：同一题重复载入时保留已写入的作答
  const demoBufferKey = ref<string | null>(null);

  // 测验判分失败时的输出对比弹窗状态（FR-6.5：完整期望 vs 实际，逐行高亮差异，不截断）
  const quizCompareDialog = ref<{ isOpen: boolean; expected: string; actual: string }>({
    isOpen: false,
    expected: '',
    actual: ''
  });
  // 逐行对比行对：行号对齐、不同行标记 diff（供弹窗渲染）
  const quizCompareRows = computed(() => {
    const d = quizCompareDialog.value;
    const exp = d.expected.split('\n');
    const act = d.actual.split('\n');
    const len = Math.max(exp.length, act.length);
    return Array.from({ length: len }, (_, i) => ({
      i,
      expected: exp[i] || '',
      actual: act[i] || '',
      diff: (exp[i] || '') !== (act[i] || '')
    }));
  });

  // 工具栏「检查答案 / 返回教程」可用状态：已加载 tutorial_demo.py 且处于教程/测验上下文
  // （原为 v-if 隐藏，现改为始终渲染、无上下文时禁用）
  const isTutorialQuizMode = computed(() => {
    return !!(activeTutorialSource.value && deps.getActiveTab()?.name === 'tutorial_demo.py');
  });

  // 从测验的代码题进入编辑器时，返回目标应是测验页：工具栏「返回教程」禁用（避免绕开测验回到文章页）
  const canReturnToTutorial = computed(() => isTutorialQuizMode.value && !activeTutorialSource.value?.isQuiz);

  /** 设置当前教程小节并持久化（TutorialView 的 update-active-topic 事件） */
  const setTutorialTopicId = (id: string) => {
    activeTutorialTopicId.value = id;
    safeStorage.setItem(LAST_TOPIC_KEY, id);
  };

  /** 手动从文件树打开文件时清除教程来源（否则「检查答案/返回教程」会残留在 tutorial_demo.py 上） */
  const clearTutorialSource = () => {
    activeTutorialSource.value = null;
  };

  /**
   * 教程代码载入的会话段：解析 payload、设置教程上下文与测验通过态、推进 demo 缓冲区键。
   * 返回工作区缓冲所需字段（App 侧负责 tutorial_demo.py 落盘与开标签）；
   * prevBufferKey 是更新前的缓冲区键——同一题重复载入时保留已写入的作答。
   */
  const beginTutorialLoad = (payload: { code: string; topicId: string; topicTitle: string; isQuiz?: boolean; questionId?: string; expectedOutput?: string } | string) => {
    let code = '';
    let topicId = '';
    let topicTitle = '';
    let isQuiz = false;
    let questionId = '';
    let expectedOutput = '';

    if (typeof payload === 'string') {
      code = payload;
    } else if (payload && typeof payload === 'object') {
      code = payload.code || '';
      topicId = payload.topicId || '';
      topicTitle = payload.topicTitle || '';
      isQuiz = !!payload.isQuiz;
      questionId = payload.questionId || '';
      expectedOutput = payload.expectedOutput || '';
    }

    if (topicId) {
      activeTutorialSource.value = {
        id: topicId,
        title: (topicTitle || t('correspondingTutorial')) + (isQuiz ? t('quizSuffix') : ''),
        isQuiz: isQuiz || undefined,
        questionId: questionId || undefined,
        expectedOutput: expectedOutput || undefined
      };
      activeTutorialTopicId.value = topicId;
    }
    if (isQuiz && questionId) {
      activeQuizPassed.value = deps.quizData.getResult(topicId, questionId) === 'pass';
    } else {
      activeQuizPassed.value = false;
    }

    const bufferKey = isQuiz && questionId ? `${topicId}#${questionId}` : `topic:${topicId}`;
    const prevBufferKey = demoBufferKey.value;
    demoBufferKey.value = bufferKey;
    return { code, topicId, isQuiz, questionId, bufferKey, prevBufferKey };
  };

  // 「返回对应教程」FAB：总是回到对应小节的教程文章页（不打开测验）
  const handleReturnToTutorial = (topicId: string) => {
    deps.setActiveNavTab('tutorial');
    if (topicId) {
      activeTutorialTopicId.value = topicId;
    } else {
      activeTutorialTopicId.value = safeStorage.getItem(LAST_TOPIC_KEY) || 'p1_home';
    }
  };

  // 「检查答案」FAB（已答对）：回到对应小节的测验界面
  const handleReturnToQuiz = (topicId: string) => {
    deps.setActiveNavTab('tutorial');
    if (topicId) {
      activeTutorialTopicId.value = topicId;
    }
    nextTick(() => {
      deps.openQuizExternally(activeTutorialTopicId.value);
    });
  };

  const handleQuizSubmit = async () => {
    const src = activeTutorialSource.value;
    if (!src?.isQuiz) {
      deps.showToast(t('toastNotQuizCode'));
      return;
    }
    const activeTab = deps.getActiveTab();
    if (!activeTab) {
      deps.showToast(t('toastOpenQuizCode'));
      return;
    }
    const code = activeTab.content || '';
    const stdoutParts: string[] = [];
    const runResult = await deps.runCode(code, deps.getWorkspaceItems(), (out) => {
      deps.pushConsole(out);
      if (out.type === 'stdout') stdoutParts.push(out.text);
    }, deps.getDemoMode());
    if (runResult.busy) {
      deps.showToast(t('toastRunnerBusy'));
      return;
    }
    if (!runResult.success) {
      // 判分只看用户代码真实执行失败；演示引擎不支持（unsupportedSyntax）另说
      if (runResult.failureKind === 'unsupportedSyntax') {
        deps.showToast(t('toastDemoUnsupported'));
        return;
      }
      deps.showToast(t('toastRunError'));
      return;
    }
    // 判分逻辑在独立判分器（utils/quizGrader）中：行序列规范化 + 逐行比对
    const { passed, expectedLines, actualLines } = gradeOutput(stdoutParts, src.expectedOutput || '');
    activeQuizPassed.value = passed;
    // 已通过的题目不因再次判分失败而降级（仅「重新测验」会清除成绩）
    const alreadyPassed = deps.quizData.getResult(src.id, src.questionId || '') === 'pass';
    deps.quizData.setResult(src.id, src.questionId || '', passed || alreadyPassed ? 'pass' : 'fail');
    if (passed) {
      deps.quizData.syncCompletion(src.id);
      deps.showToast(t('toastQuizPassed'));
    } else {
      // 判分失败：打开持久对比弹窗（完整输出、逐行标红），Toast 仅作入口摘要
      quizCompareDialog.value = {
        isOpen: true,
        expected: expectedLines.join('\n'),
        actual: actualLines.join('\n')
      };
      deps.showToast(t('toastQuizFailed'));
    }
  };

  const handleCheckAnswerClick = () => {
    const src = activeTutorialSource.value;
    if (!src || !isTutorialQuizMode.value) return;
    // 以存储的作答记录为准（「重新测验」清除成绩后，编辑器里的按钮状态随之回退）
    const passed = src.questionId ? deps.quizData.getResult(src.id, src.questionId) === 'pass' : false;
    activeQuizPassed.value = passed;
    if (passed) {
      // 已通过后再点击：返回测验页，同时再次给出通过反馈（snackbar）
      deps.showToast(t('toastQuizPassed'));
      handleReturnToQuiz(src.id);
    } else {
      void handleQuizSubmit();
    }
  };

  const handleTutorialBtnClick = () => {
    const src = activeTutorialSource.value;
    if (!src || !canReturnToTutorial.value) return;
    handleReturnToTutorial(src.id);
  };

  return {
    activeTutorialSource,
    activeTutorialTopicId,
    activeQuizPassed,
    demoBufferKey,
    quizCompareDialog,
    quizCompareRows,
    isTutorialQuizMode,
    canReturnToTutorial,
    setTutorialTopicId,
    clearTutorialSource,
    beginTutorialLoad,
    handleReturnToTutorial,
    handleReturnToQuiz,
    handleQuizSubmit,
    handleCheckAnswerClick,
    handleTutorialBtnClick,
  };
}
