<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { type TutorialStage, type TutorialTopic, getLocalizedTutorialStages } from './tutorialData';
import { useI18n } from '../../utils/i18n';

const { t } = useI18n();

const props = defineProps<{
  activeTopicId: string;
  collapsed?: boolean;
  completedTopics?: Set<string>;
  quizStats?: Record<string, { correct: number; total: number }>;
}>();

const emit = defineEmits<{
  (e: 'select-topic', topicId: string): void;
  (e: 'toggle-collapse'): void;
  (e: 'toggle-quiz-directory'): void;
}>();

const quizDone = (topicId: string): boolean => {
  const stat = props.quizStats?.[topicId];
  return !!stat && stat.total > 0 && stat.correct === stat.total;
};

const stages = computed(() => getLocalizedTutorialStages());

const searchQuery = ref('');

// State for expanded stages and subcategories
const expandedStages = ref<Record<string, boolean>>({
  stage1: true,
  stage2: true,
  stage3: false,
  stage4: false,
  stage5: false,
  stage6: false,
  cmd_help: true,
});

const expandedSubs = ref<Record<string, boolean>>({
  matplotlib_sub: true,
  cli_sub: true,
  modules_sub: true,
  builtins_sub: true,
  keywords_sub: true
});

const toggleStage = (stageId: string) => {
  expandedStages.value[stageId] = !expandedStages.value[stageId];
};

const toggleSub = (subId: string) => {
  expandedSubs.value[subId] = !expandedSubs.value[subId];
};

// Locate active topic in catalog
const scrollToActiveTopic = () => {
  if (!props.activeTopicId) return;

  // Ensure stage and subcategory containing activeTopicId are expanded
  for (const stage of stages.value) {
    if (stage.topics?.some(t => t.id === props.activeTopicId)) {
      expandedStages.value[stage.id] = true;
    }
    if (stage.subcategories) {
      for (const sub of stage.subcategories) {
        if (sub.topics?.some(t => t.id === props.activeTopicId)) {
          expandedStages.value[stage.id] = true;
          expandedSubs.value[sub.id] = true;
        }
      }
    }
  }

  nextTick(() => {
    setTimeout(() => {
      const activeEl = document.querySelector('.tutorial-tree-container .topic-item.is-active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
      <m3e-icon-button size="extra-small" @click="emit('toggle-collapse')"  width="narrow" variant="outlined">
        <span class="material-symbols-rounded-fill">{{ collapsed ? 'right_panel_close' : 'left_panel_close' }}</span>
      </m3e-icon-button>
    </div>

    <div v-if="!collapsed" class="tree-content">
      <!-- Header -->
      <div class="tree-header">
        <div class="tree-title-group">
          <span class="tree-title">{{ t('tutorialCatalog') }}</span>
          <m3e-button class="quiz-catalog-toggle" variant="outlined" size="extra-small" :title="t('toggleQuizCatalog')"
            @click="emit('toggle-quiz-directory')">
            <span slot="icon" class="material-symbols-rounded">fact_check</span>
            {{ t('quizShort') }}
          </m3e-button>
        </div>
      </div>

      <!-- Search Input -->
      <div class="search-box">
        <m3e-search-bar class="tree-search-bar" clearable @clear="searchQuery = ''">
          <span slot="leading" class="material-symbols-rounded">search</span>
          <input slot="input" v-model="searchQuery" :placeholder="t('tutorialSearchPlaceholder')" />
        </m3e-search-bar>
      </div>

      <!-- Tree Items List -->
      <m3e-content-pane class="tree-nodes-list">
        <div v-for="stage in filteredStages" :key="stage.id" class="stage-block">
          <!-- Stage Header Folder -->
          <div class="stage-header-item" @click="toggleStage(stage.id)">
            <span class="material-symbols-rounded folder-arrow"
              :class="{ 'is-open': expandedStages[stage.id] || searchQuery }">
              chevron_right
            </span>
            <span class="material-symbols-rounded-fill folder-icon">folder</span>
            <span class="stage-title-text">{{ stage.title }}</span>
          </div>

          <!-- Stage Level Topics -->
          <Transition name="expand">
            <div v-if="(expandedStages[stage.id] || searchQuery) && stage.topics" class="topic-group">
              <div v-for="topic in stage.topics" :key="topic.id" class="topic-item"
                :class="{ 'is-active': activeTopicId === topic.id }" @click="emit('select-topic', topic.id)">
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
            <div v-if="(expandedStages[stage.id] || searchQuery) && stage.subcategories" class="subcat-group">
              <div v-for="sub in stage.subcategories" :key="sub.id" class="subcat-block">
                <div class="subcat-header-item" @click="toggleSub(sub.id)">
                  <span class="material-symbols-rounded folder-arrow"
                    :class="{ 'is-open': expandedSubs[sub.id] || searchQuery }">
                    chevron_right
                  </span>
                  <span class="material-symbols-rounded-fill folder-icon">folder_special</span>
                  <span class="subcat-title-text">{{ sub.title }}</span>
                </div>

                <Transition name="expand">
                  <div v-if="(expandedSubs[sub.id] || searchQuery) && sub.topics" class="topic-group indented">
                    <div v-for="topic in sub.topics" :key="topic.id" class="topic-item"
                      :class="{ 'is-active': activeTopicId === topic.id }" @click="emit('select-topic', topic.id)">
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
  transition: width 0.2s ease, min-width 0.2s ease;
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
  background-color: var(--bg-color);
  border-left: none;
  border-radius: 0 1rem 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  z-index: 20;
  box-shadow: none;
  transition: background-color 0.15s, color 0.15s;
}

.tree-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tree-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: none;
}

.tree-title-group {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
}

.tree-title {
  margin-left: 0.8rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-color);
}

.search-box {
  padding: 4px 12px 8px 12px;
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: none;
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
     （与父级同色 surface；树列表无圆角；定位当前主题用 scrollIntoView 自动滚入） */
  --m3e-content-pane-container-padding: 4px;
  --m3e-content-pane-container-shape: 0;
  --m3e-content-pane-container-color: var(--surface-color);
}

.stage-block {
  margin-bottom: 4px;
}

.stage-header-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.15s;
  min-width: 0;
  white-space: nowrap;
}

.stage-header-item:hover {
  background-color: var(--surface-variant);
}

.folder-arrow {
  font-size: 1.125rem;
  color: var(--text-tertiary);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.folder-arrow.is-open {
  transform: rotate(90deg);
}

/* Folder expand/collapse transition animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
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
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  transition: all 0.15s;
  margin: 1px 0;
  border: 1px solid transparent;
  min-width: 0;
  white-space: nowrap;
}

.topic-item:hover {
  background-color: var(--surface-variant);
  color: var(--text-color);
}

.topic-item.is-active {
  background-color: transparent;
  color: var(--text-color);
  font-weight: 600;
  border: 1px solid var(--secondary);
  border-radius: 9999px;
}

.topic-icon {
  font-size: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.topic-item.is-active .topic-icon {
  color: var(--secondary);
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

.quiz-catalog-toggle {
  margin-left: auto;
}

.locate-fab {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;

  --m3e-fab-container-height: 3rem;
  --m3e-fab-icon-size: var(--text-size-s);
}
</style>
