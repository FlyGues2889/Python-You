<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { type TutorialStage, type TutorialTopic } from './tutorialData';
import { getTopicQuizScore, type QuizScore } from './quizData';
import { useI18n } from '../../utils/i18n';
import { paneScroller } from '../../utils/contentPane';

const { t, tf } = useI18n();

// 树列表的滚动容器（用于把当前主题滚进视野，见 scrollToActiveTopic）
const treeListRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  activeTopicId: string;
  collapsed?: boolean;
  completedTopics?: Set<string>;
  quizStats?: Record<string, { correct: number; total: number }>;
  /** 当前系列下的阶段（由 TutorialView 传入，目录只展示该系列） */
  stages?: TutorialStage[];
  seriesTitle?: string;
  /** 'quiz' = 侧栏改列该系列的测验目录（做题时用），默认列文章目录 */
  mode?: 'article' | 'quiz';
}>();

const emit = defineEmits<{
  (e: 'select-topic', topicId: string): void;
  (e: 'open-quiz', topicId: string): void;
  (e: 'toggle-collapse'): void;
  (e: 'back-to-tutorial'): void;
}>();

const isQuizMode = computed(() => props.mode === 'quiz');

const quizDone = (topicId: string): boolean => {
  const stat = props.quizStats?.[topicId];
  return !!stat && stat.total > 0 && stat.correct === stat.total;
};

const stages = computed<TutorialStage[]>(() => props.stages || []);

// FR-6.6 全局学习进度：课程主题总数 / 已完成数（数据由父级传入，仅统计仍在目录中的主题）
const allTopicIds = computed(() => {
  const ids: string[] = [];
  for (const stage of stages.value) {
    stage.topics?.forEach(topic => ids.push(topic.id));
    stage.subcategories?.forEach(sub => sub.topics?.forEach(topic => ids.push(topic.id)));
  }
  return ids;
});

const completedCount = computed(() =>
  allTopicIds.value.filter(id => props.completedTopics?.has(id)).length
);

// 测验平均分：已作答测验得分的算术平均；无成绩时为 null（显示占位文案）
const quizAverage = computed<number | null>(() => {
  const stats = Object.values(props.quizStats || {}).filter(s => s.total > 0);
  if (stats.length === 0) return null;
  const sum = stats.reduce((acc, s) => acc + s.correct / s.total, 0);
  return Math.round((sum / stats.length) * 100);
});

// ---- 测验目录模式（做题时侧栏列出该系列的测验）----

const getScore = (topicId: string): QuizScore => {
  void props.quizStats; // 成绩由父级传入，父级刷新后这里跟着重算
  return getTopicQuizScore(topicId);
};

// 参考手册没有测验，不列入；整段都没有测验的阶段也不出现（与测验目录页同口径）
const quizStages = computed(() =>
  stages.value
    .map(stage => {
      const withQuiz = (topics?: TutorialTopic[]) =>
        (topics || []).filter(topic => topic.kind !== 'reference');
      const rows: TutorialTopic[] = withQuiz(stage.topics);
      stage.subcategories?.forEach(sub => rows.push(...withQuiz(sub.topics)));
      return { stage, rows };
    })
    .filter(item => item.rows.length > 0)
);

// 已全部答对的测验数（侧栏「测验已通过 x/y」）
const quizPassedCount = computed(() =>
  quizStages.value.reduce((acc, { rows }) =>
    acc + rows.filter(topic => {
      const score = getScore(topic.id);
      return score.total > 0 && score.correct === score.total;
    }).length, 0)
);

const quizTotalCount = computed(() =>
  quizStages.value.reduce((acc, { rows }) => acc + rows.length, 0)
);

const openQuiz = (topicId: string) => {
  if (getScore(topicId).total === 0) return;
  emit('open-quiz', topicId);
};

// 键盘可达（无障碍）：Enter/Space 与点击同效
const onQuizKeydown = (e: KeyboardEvent, topicId: string) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  openQuiz(topicId);
};

// 测验目录的搜索：阶段名命中就整段保留，否则只留标题命中的测验
const filteredQuizStages = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return quizStages.value;
  return quizStages.value
    .map(({ stage, rows }) => ({
      stage,
      rows: stage.title.toLowerCase().includes(q)
        ? rows
        : rows.filter(topic => topic.title.toLowerCase().includes(q))
    }))
    .filter(item => item.rows.length > 0);
});

const searchQuery = ref('');

// 阶段/子分类的展开状态。
// 只记录用户「折叠过」的那些（collapsed*），默认值算出来 —— 以前写死 stage1/stage2/cmd_help，
// 换成多系列后别的系列阶段 id 是 db_stage1 / sp_stage1 …，落不进那张表，进任何系列都是全折叠。
const collapsedStages = ref<Record<string, boolean>>({});
const collapsedSubs = ref<Record<string, boolean>>({});

const stageTopicsOf = (stage: TutorialStage): TutorialTopic[] => {
  const topics = [...(stage.topics || [])];
  for (const sub of stage.subcategories || []) topics.push(...sub.topics);
  return topics;
};

// 默认展开：系列的前两个阶段，以及整段都是参考手册的阶段（平铺的查阅条目，展开更好找）
const stageOpenByDefault = (stageId: string): boolean => {
  const index = stages.value.findIndex(stage => stage.id === stageId);
  if (index < 0) return false;
  if (index < 2) return true;
  const topics = stageTopicsOf(stages.value[index]);
  return topics.length > 0 && topics.every(topic => topic.kind === 'reference');
};

const isStageOpen = (stageId: string): boolean => {
  if (searchQuery.value) return true;
  const collapsed = collapsedStages.value[stageId];
  return collapsed === undefined ? stageOpenByDefault(stageId) : !collapsed;
};

const isSubOpen = (subId: string): boolean =>
  !!searchQuery.value || !collapsedSubs.value[subId];

const toggleStage = (stageId: string) => {
  collapsedStages.value[stageId] = isStageOpen(stageId);
};

const toggleSub = (subId: string) => {
  collapsedSubs.value[subId] = isSubOpen(subId);
};

// 键盘可达（无障碍）：Enter/Space 激活与点击相同的操作
const onStageKeydown = (e: KeyboardEvent, stageId: string) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  toggleStage(stageId);
};

const onSubKeydown = (e: KeyboardEvent, subId: string) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  toggleSub(subId);
};

const onTopicKeydown = (e: KeyboardEvent, topicId: string) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  emit('select-topic', topicId);
};

// Locate active topic in catalog
const scrollToActiveTopic = () => {
  if (!props.activeTopicId) return;

  // Ensure stage and subcategory containing activeTopicId are expanded
  for (const stage of stages.value) {
    if (stage.topics?.some(t => t.id === props.activeTopicId)) {
      collapsedStages.value[stage.id] = false;
    }
    if (stage.subcategories) {
      for (const sub of stage.subcategories) {
        if (sub.topics?.some(t => t.id === props.activeTopicId)) {
          collapsedStages.value[stage.id] = false;
          collapsedSubs.value[sub.id] = false;
        }
      }
    }
  }

  nextTick(() => {
    setTimeout(() => {
      const list = treeListRef.value;
      const activeEl = list?.querySelector<HTMLElement>('.topic-item.is-active');
      const sc = paneScroller(list);
      if (!activeEl || !sc) return;
      // 只滚侧栏自己的滚动容器：scrollIntoView 会连带滚动所有可滚动祖先（含
      // overflow:hidden 的布局容器），把整块视图顶上去、裁掉面板上圆角
      const delta = activeEl.getBoundingClientRect().top - sc.getBoundingClientRect().top;
      sc.scrollTo({
        top: sc.scrollTop + delta - (sc.clientHeight - activeEl.clientHeight) / 2,
        behavior: 'smooth'
      });
    }, 80);
  });
};

watch(
  () => props.activeTopicId,
  (newId) => {
    if (newId) {
      scrollToActiveTopic();
    }
  },
  { immediate: true }
);

watch(
  () => props.collapsed,
  (isCollapsed) => {
    if (!isCollapsed) {
      scrollToActiveTopic();
    }
  }
);

// Search filter logic
const filteredStages = computed(() => {
  if (!searchQuery.value.trim()) {
    return stages.value;
  }
  const q = searchQuery.value.toLowerCase().trim();

  return stages.value.map(stage => {
    let matchedTopics: TutorialTopic[] = [];
    if (stage.topics) {
      matchedTopics = stage.topics.filter(
        t => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)
      );
    }

    let matchedSubs: { id: string; title: string; topics: TutorialTopic[] }[] = [];
    if (stage.subcategories) {
      matchedSubs = stage.subcategories.map(sub => ({
        ...sub,
        topics: sub.topics.filter(
          t => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)
        )
      })).filter(sub => sub.topics.length > 0 || sub.title.toLowerCase().includes(q));
    }

    const stageTitleMatches = stage.title.toLowerCase().includes(q);

    if (stageTitleMatches || matchedTopics.length > 0 || matchedSubs.length > 0) {
      return {
        ...stage,
        topics: stageTitleMatches ? stage.topics : matchedTopics,
        subcategories: stageTitleMatches ? stage.subcategories : matchedSubs
      };
    }
    return null;
  }).filter(Boolean) as TutorialStage[];
});
</script>

<template>
  <div class="tutorial-tree-container" :class="{ 'is-collapsed': collapsed }">
    <!-- Collapse Toggle Button -->
    <div class="tree-collapse-toggle" :title="collapsed ? t('tutorialExpandCatalog') : t('tutorialCollapseCatalog')">
      <m3e-icon-button size="extra-small" @click="emit('toggle-collapse')"  width="narrow">
        <span class="material-symbols-rounded-fill">{{ collapsed ? 'right_panel_close' : 'left_panel_close' }}</span>
      </m3e-icon-button>
    </div>

    <div v-if="!collapsed" class="tree-content">
      <!-- Header：面包屑（当前系列 [ / 测验 ]）。
           不放「学习」那一级：侧栏只有 280px，长系列名（如「爬虫和数据分析」）再加一级
           就会被挤掉半截；首页入口在正文与测验页各自的面包屑里都有，不缺这一处。
           测验目录入口已移到学习首页的系列卡片上，这里不再重复放置。 -->
      <div class="tree-header">
        <m3e-breadcrumb class="tree-breadcrumb density-3">
          <m3e-breadcrumb-item :class="{ 'is-link': isQuizMode }"
            @click="isQuizMode && emit('back-to-tutorial')">{{ seriesTitle || t('tutorialCatalog')
            }}</m3e-breadcrumb-item>
          <m3e-breadcrumb-item v-if="isQuizMode" disabled>{{ t('quizShort') }}</m3e-breadcrumb-item>
        </m3e-breadcrumb>
      </div>

      <!-- 进度：文章目录看完成篇数 + 测验平均分；测验目录看已通过的测验数 -->
      <div class="progress-summary">
        <template v-if="isQuizMode">
          <span class="progress-chip is-score" :title="t('progressQuizTooltip')">
            <span class="material-symbols-rounded">scoreboard</span>
            <span>{{ tf('progressQuizPassed', { done: quizPassedCount, total: quizTotalCount }) }}</span>
          </span>
        </template>
        <template v-else>
          <span class="progress-chip" :title="t('progressTopicsTooltip')">
            <span class="material-symbols-rounded">task_alt</span>
            <span>{{ tf('progressTopicsDone', { done: completedCount, total: allTopicIds.length }) }}</span>
          </span>
          <span class="progress-chip is-score" :class="{ 'is-empty': quizAverage === null }"
            :title="t('progressQuizTooltip')">
            <span class="material-symbols-rounded">scoreboard</span>
            <span>{{ quizAverage === null ? t('progressNoQuiz') : tf('progressQuizAverage', { score: quizAverage })
              }}</span>
          </span>
        </template>
      </div>

      <!-- Search Input -->
      <div class="search-box">
        <m3e-search-bar class="tree-search-bar" clearable @clear="searchQuery = ''">
          <span slot="leading" class="material-symbols-rounded">search</span>
          <input slot="input" v-model="searchQuery" :placeholder="t('tutorialSearchPlaceholder')" />
        </m3e-search-bar>
      </div>

      <!-- Tree Items List -->
      <m3e-content-pane ref="treeListRef" class="tree-nodes-list">
        <!-- 测验目录：做题时侧栏列本系列的测验（点一行直接换题），行结构与文章目录一致便于复用样式 -->
        <template v-if="isQuizMode">
          <div v-for="({ stage, rows }) in filteredQuizStages" :key="stage.id" class="stage-block">
            <div class="stage-header-item" role="button" tabindex="0" @click="toggleStage(stage.id)"
              @keydown="onStageKeydown($event, stage.id)">
              <span class="material-symbols-rounded folder-arrow"
                :class="{ 'is-open': isStageOpen(stage.id) }">
                chevron_right
              </span>
              <span class="material-symbols-rounded-fill folder-icon">folder</span>
              <span class="stage-title-text">{{ stage.title }}</span>
            </div>

            <Transition name="expand">
              <div v-if="isStageOpen(stage.id)" class="topic-group">
                <div v-for="topic in rows" :key="topic.id" class="topic-item" role="button" tabindex="0"
                  :class="{ 'is-active': activeTopicId === topic.id, 'is-disabled': getScore(topic.id).total === 0 }"
                  @click="openQuiz(topic.id)" @keydown="onQuizKeydown($event, topic.id)">
                  <span class="material-symbols-rounded topic-icon">fact_check</span>
                  <span class="topic-title-text">{{ topic.title }}</span>
                  <span v-if="getScore(topic.id).total === 0" class="quiz-score-chip chip-none">
                    {{ t('scoreNone') }}
                  </span>
                  <span v-else-if="getScore(topic.id).correct === getScore(topic.id).total"
                    class="quiz-score-chip chip-done" :title="t('quizDoneTitle')">
                    <span class="material-symbols-rounded">check_circle</span>
                    {{ getScore(topic.id).correct }}/{{ getScore(topic.id).total }}
                  </span>
                  <span v-else class="quiz-score-chip">
                    {{ getScore(topic.id).correct }}/{{ getScore(topic.id).total }}
                  </span>
                </div>
              </div>
            </Transition>
          </div>

          <div v-if="filteredQuizStages.length === 0" class="empty-search-notice">
            {{ t('noTutorialMatch') }}
          </div>
        </template>

        <template v-else>
        <div v-for="stage in filteredStages" :key="stage.id" class="stage-block">
          <!-- Stage Header Folder -->
          <div class="stage-header-item" role="button" tabindex="0" @click="toggleStage(stage.id)"
            @keydown="onStageKeydown($event, stage.id)">
            <span class="material-symbols-rounded folder-arrow"
              :class="{ 'is-open': isStageOpen(stage.id) }">
              chevron_right
            </span>
            <span class="material-symbols-rounded-fill folder-icon">folder</span>
            <span class="stage-title-text">{{ stage.title }}</span>
          </div>

          <!-- Stage Level Topics -->
          <Transition name="expand">
            <div v-if="isStageOpen(stage.id) && stage.topics" class="topic-group">
              <div v-for="topic in stage.topics" :key="topic.id" class="topic-item" role="button" tabindex="0"
                :class="{ 'is-active': activeTopicId === topic.id }" @click="emit('select-topic', topic.id)"
                @keydown="onTopicKeydown($event, topic.id)">
                <span :class="[
                  activeTopicId === topic.id ? 'material-symbols-rounded-fill' : 'material-symbols-rounded',
                  'topic-icon'
                ]">
                  article
                </span>
                <span class="topic-title-text">{{ topic.title }}</span>
                <span v-if="completedTopics?.has(topic.id)"
                  class="material-symbols-rounded completed-check">check_circle</span>
                <span v-if="quizStats?.[topic.id]?.total > 0" class="material-symbols-rounded quiz-state-icon"
                  :class="{ 'is-done': quizDone(topic.id) }"
                  :title="quizDone(topic.id) ? t('quizDoneTitle') : t('quizNotDoneTitle')">{{
                    quizDone(topic.id) ? 'done_all' : 'quiz' }}</span>
              </div>
            </div>
          </Transition>

          <!-- Subcategories (e.g. Matplotlib) -->
          <Transition name="expand">
            <div v-if="isStageOpen(stage.id) && stage.subcategories" class="subcat-group">
              <div v-for="sub in stage.subcategories" :key="sub.id" class="subcat-block">
                <div class="subcat-header-item" role="button" tabindex="0" @click="toggleSub(sub.id)"
                  @keydown="onSubKeydown($event, sub.id)">
                  <span class="material-symbols-rounded folder-arrow"
                    :class="{ 'is-open': isSubOpen(sub.id) }">
                    chevron_right
                  </span>
                  <span class="material-symbols-rounded-fill folder-icon">folder_special</span>
                  <span class="subcat-title-text">{{ sub.title }}</span>
                </div>

                <Transition name="expand">
                  <div v-if="isSubOpen(sub.id) && sub.topics" class="topic-group indented">
                    <div v-for="topic in sub.topics" :key="topic.id" class="topic-item" role="button" tabindex="0"
                      :class="{ 'is-active': activeTopicId === topic.id }" @click="emit('select-topic', topic.id)"
                      @keydown="onTopicKeydown($event, topic.id)">
                      <span :class="[
                        activeTopicId === topic.id ? 'material-symbols-rounded-fill' : 'material-symbols-rounded',
                        'topic-icon'
                      ]">
                        article
                      </span>
                      <span class="topic-title-text">{{ topic.title }}</span>
                      <span v-if="completedTopics?.has(topic.id)"
                        class="material-symbols-rounded completed-check">check_circle</span>
                      <span v-if="quizStats?.[topic.id]?.total > 0" class="material-symbols-rounded quiz-state-icon"
                        :class="{ 'is-done': quizDone(topic.id) }"
                        :title="quizDone(topic.id) ? t('quizDoneTitle') : t('quizNotDoneTitle')">{{
                          quizDone(topic.id) ? 'done_all' : 'quiz' }}</span>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <div v-if="filteredStages.length === 0" class="empty-search-notice">
          {{ t('noTutorialMatch') }}
        </div>
        </template>
      </m3e-content-pane>

      <!-- FAB: Locate current topic -->
      <m3e-fab class="locate-fab" size="small" :title="t('locateCurrentTopic')" @click="scrollToActiveTopic">
        <span class="material-symbols-rounded">my_location</span>
      </m3e-fab>
    </div>
  </div>
</template>

<style scoped>
.tutorial-tree-container {
  width: 280px;
  min-width: 280px;
  height: 100%;
  background-color: var(--surface-color);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width var(--motion-spatial-fast), min-width var(--motion-spatial-fast);
  user-select: none;
}

.tutorial-tree-container.is-collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}

.tree-collapse-toggle {
  position: absolute;
  right: -43px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background-color: var(--surface-color);
  border-left: none;
  border-radius: 0 1rem 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  z-index: 20;
  box-shadow: none;
  transition: background-color var(--motion-spatial-fast), color var(--motion-spatial-fast);
}

.tree-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tree-header {
  height: 48px;
  padding: 0 12px 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* 面包屑（当前系列 [/ 测验]）：行高收紧到 32px。
   字号取 13px（侧栏行文字同档，库默认是 14px 的 label-large），左右内边距从库默认的
   12px 收到 6px——每项少 12px，长系列名才排得下不被截断 */
.tree-breadcrumb {
  flex: 1;
  min-width: 0;
  --m3e-breadcrumb-item-container-height: 32px;
  --m3e-breadcrumb-item-label-font-size: 0.8125rem;
  --m3e-breadcrumb-item-label-padding-inline: 6px;
}

/* 测验模式下这一级可以点回文章视图，给个可点的样子（不然和禁用项长得一样） */
.tree-breadcrumb m3e-breadcrumb-item.is-link {
  cursor: pointer;
  --m3e-breadcrumb-item-label-color: var(--primary);
}

.search-box {
  padding: 4px 12px 8px 12px;
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: none;
}

/* 全局学习进度（FR-6.6）：M3 风格统计芯片（32dp 高 / 8dp 圆角，selected 态填充色） */
.progress-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 0 12px 8px;
}

.progress-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.progress-chip .material-symbols-rounded {
  font-size: 1rem;
}

.progress-chip.is-score {
  background-color: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

.progress-chip.is-empty {
  background-color: var(--surface-variant);
  color: var(--text-tertiary);
}

.tree-search-bar {
  flex: 1;
}

.tree-nodes-list {
  flex: 1;
  min-height: 0;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  /* 背景/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制
     （与父级同色 surface；树列表无圆角；定位当前主题只滚本容器，见 scrollToActiveTopic） */
  --m3e-content-pane-container-padding: 4px;
  --m3e-content-pane-container-shape: 0;
  --m3e-content-pane-container-color: var(--surface-color);
}

/* 键盘焦点：侧栏这几行是自绘的 role="button" 的 div，组件库不会给它们画焦点环，
   浏览器默认环又和主题色不搭 —— 只给这几行自己加一圈，别处一律不加
   （m3e 组件自绘了焦点环，全局再加会叠成双描边）。 */
.stage-header-item:focus-visible,
.subcat-header-item:focus-visible,
.topic-item:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}

.stage-block {
  margin-bottom: 4px;
}

.stage-header-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px; /* M3 List：未选中项 ItemContainerExpressiveShape = CornerExtraSmall */
  cursor: pointer;
  transition: background-color var(--motion-effects-fast);
  min-width: 0;
  white-space: nowrap;
}

.stage-header-item:hover {
  background-color: var(--surface-variant);
}

.folder-arrow {
  font-size: 1.125rem;
  color: var(--text-tertiary);
  transition: transform var(--motion-spatial-fast);
  flex-shrink: 0;
}

.folder-arrow.is-open {
  transform: rotate(90deg);
}

/* Folder expand/collapse transition animation。
   展开是尺寸+位移变化（spatial，允许过冲），淡入淡出是透明度（effects，不过冲），
   两条曲线分开写；不用 transition: all —— 那会把 max-height/transform 之外的属性也带上。 */
.expand-enter-active,
.expand-leave-active {
  transition: max-height var(--motion-spatial-fast), transform var(--motion-spatial-fast),
    opacity var(--motion-effects-fast);
  max-height: 800px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
  overflow: hidden;
}

.folder-icon {
  font-size: 1.125rem;
  color: var(--secondary);
  flex-shrink: 0;
}

.stage-title-text {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.subcat-header-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 16px;
  border-radius: 4px; /* M3 List：未选中项 ItemContainerExpressiveShape = CornerExtraSmall */
  cursor: pointer;
  transition: background-color var(--motion-effects-fast);
  min-width: 0;
  white-space: nowrap;
}

.subcat-header-item:hover {
  background-color: var(--surface-variant);
}

.subcat-title-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.topic-group {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
}

.topic-group.indented {
  padding-left: 32px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px; /* M3 List：未选中项 ItemContainerExpressiveShape = CornerExtraSmall */
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  transition: background-color var(--motion-effects-fast), color var(--motion-effects-fast),
    border-color var(--motion-effects-fast);
  margin: 1px 0;
  border: 1px solid transparent;
  min-width: 0;
  white-space: nowrap;
}

.topic-item:hover {
  background-color: var(--surface-variant);
  color: var(--text-color);
}

/* 选中态按 M3 List 令牌走：容器填 secondary-container、文字用配对的 on-secondary-container
   （填充 = 选中、描边 = 未选中/聚焦，M3 的选中表达只有这一种），形状取 ItemSelectedContainerShape = CornerLarge */
.topic-item.is-active {
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
  font-weight: 600;
  border-radius: 16px;
}

.topic-icon {
  font-size: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.topic-item.is-active .topic-icon {
  color: var(--on-secondary-container);
}

.topic-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.empty-search-notice {
  padding: 24px;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* 测验目录模式的成绩小标签：无测验的行整行置灰不可点 */
.topic-item.is-disabled {
  opacity: 0.5;
  cursor: default;
}

.topic-item.is-disabled:hover {
  background-color: transparent;
  color: var(--text-secondary);
}

.quiz-score-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 9999px;
  border: 1px solid var(--border-color-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.quiz-score-chip .material-symbols-rounded {
  font-size: 0.75rem;
}

.quiz-score-chip.chip-none {
  color: var(--text-tertiary);
  font-weight: 500;
}

.quiz-score-chip.chip-done {
  border-color: transparent;
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
}


.completed-check {
  font-size: 0.875rem;
  color: var(--primary);
  flex-shrink: 0;
}

.quiz-state-icon {
  font-size: 0.9375rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.quiz-state-icon.is-done {
  color: var(--primary);
}

.locate-fab {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;

  --m3e-fab-icon-size: 24px;
}
</style>
