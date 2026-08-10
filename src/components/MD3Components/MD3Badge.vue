<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { t } from '../../utils/i18n';

const props = withDefaults(
  defineProps<{
    size?: 'S' | 'M';
    tone?: 'primary' | 'secondary';
    icon?: string;
    // 搜索计数模式（可选）：提供 hasQuery 时显示 current/total 或 noMatchText
    current?: number;
    total?: number;
    hasQuery?: boolean;
    noMatchText?: string;
  }>(),
  {
    size: 'S',
    tone: 'secondary',
    current: 0,
    total: 0,
    hasQuery: false,
    noMatchText: t('badgeNoResult')
  }
);

const slots = useSlots();

const searchText = computed(() => {
  if (!props.hasQuery) return '';
  if (props.total > 0) return `${props.current}/${props.total}`;
  return props.noMatchText;
});

const isNoMatch = computed(() => props.hasQuery && props.total === 0);

// 默认（无子节点）时渲染搜索计数文本；有子节点时渲染插槽内容（如版本号、本地标签）
const shouldRender = computed(() => !!slots.default || !!searchText.value);
</script>

<template>
  <span
    v-if="shouldRender"
    class="md3-badge"
    :class="[`size-${size}`, `tone-${tone}`, { 'is-no-match': isNoMatch }]"
  >
    <span v-if="icon" class="material-symbols-rounded badge-icon">{{ icon }}</span>
    <slot>{{ searchText }}</slot>
  </span>
</template>

<style scoped>
.md3-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  white-space: nowrap;
  user-select: none;
  transition: all 0.15s ease;
}

/* 尺寸 S（默认）：同搜索栏计数徽标 */
.md3-badge.size-S {
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
}

.md3-badge.size-S .badge-icon {
  font-size: var(--text-size-sm);
}

/* 尺寸 M：同设置页 vibe coding 徽标 */
.md3-badge.size-M {
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
}

.md3-badge.size-M .badge-icon {
  font-size: var(--text-size-sm);
}

/* 色调 */
.md3-badge.tone-secondary {
  color: var(--on-secondary-container);
  background-color: var(--secondary-container);
}

.md3-badge.tone-primary {
  color: var(--on-primary);
  background-color: var(--primary);
}

.md3-badge.is-no-match {
  color: var(--on-error-container);
  background-color: var(--error-container);
}
</style>
