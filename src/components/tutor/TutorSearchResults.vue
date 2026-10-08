<script setup lang="ts">
import { computed } from 'vue';
import { searchTutor, type ApiKind } from './searchIndex';
import { useI18n } from '../../utils/i18n';

const props = defineProps<{ query: string }>();
const emit = defineEmits<{ (e: 'open-topic', topicId: string): void }>();

const { t, tf } = useI18n();

const results = computed(() => searchTutor(props.query));

const KIND_KEYS = {
  function: 'searchKindFunction',
  method: 'searchKindMethod',
  module: 'searchKindModule',
  keyword: 'searchKindKeyword',
  exception: 'searchKindException',
  command: 'searchKindCommand',
  api: 'searchKindApi'
} as const;

const kindLabel = (kind: ApiKind) => t(KIND_KEYS[kind]);
</script>

<template>
  <div class="tutor-search">
    <div v-if="results.total === 0" class="search-empty">
      <span class="material-symbols-rounded empty-icon">search_off</span>
      <p>{{ t('searchNoResult') }}</p>
    </div>

    <template v-else>
      <!-- 函数 / 方法 / API 条目（从各主题的速查表派生） -->
      <div v-if="results.apis.length" class="result-group">
        <div class="group-title">{{ tf('searchGroupApi', { count: results.apis.length }) }}</div>
        <button v-for="entry in results.apis" :key="entry.topicId + '|' + entry.name" type="button" class="result-row"
          @click="emit('open-topic', entry.topicId)">
          <span class="row-main">
            <span class="kind-chip">{{ kindLabel(entry.kind) }}</span>
            <span class="row-name">{{ entry.name }}</span>
          </span>
          <span class="row-detail">{{ entry.detail }}</span>
          <span class="row-where">{{ entry.seriesTitle }} · {{ entry.topicTitle }}</span>
        </button>
      </div>

      <!-- 主题（标题 / 摘要命中） -->
      <div v-if="results.topics.length" class="result-group">
        <div class="group-title">{{ tf('searchGroupTopic', { count: results.topics.length }) }}</div>
        <button v-for="topic in results.topics" :key="topic.topicId" type="button" class="result-row"
          @click="emit('open-topic', topic.topicId)">
          <span class="row-main">
            <span class="row-name is-topic">{{ topic.title }}</span>
          </span>
          <span class="row-detail">{{ topic.summary }}</span>
          <span class="row-where">{{ topic.seriesTitle }} · {{ topic.stageTitle }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tutor-search {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 4px 12px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px 16px;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  text-align: center;
}

.search-empty .empty-icon {
  font-size: 1.75rem;
}

.search-empty p {
  margin: 0;
}

.result-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.group-title {
  padding: 8px 8px 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.result-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background-color var(--motion-effects-fast);
}

.result-row:hover {
  background-color: var(--surface-variant);
}

.result-row:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.row-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.kind-chip {
  flex-shrink: 0;
  padding: 0 6px;
  border-radius: 9999px;
  background-color: var(--surface-variant);
  color: var(--text-secondary);
  font-size: 0.6875rem;
  line-height: 16px;
}

.row-name {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-name.is-topic {
  font-family: inherit;
  font-size: 0.8125rem;
}

.row-detail,
.row-where {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.row-where {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}
</style>
