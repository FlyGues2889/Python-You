<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="page-header">
    <div class="header-inner">
      <div class="header-text-group">
        <h2 class="header-title-text">
          <slot name="title">{{ title }}</slot>
        </h2>
        <p v-if="subtitle || $slots.subtitle" class="header-subtitle-text">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="header-actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  padding: 0;
  margin-bottom: 2rem;
  background-color: transparent;
  flex-shrink: 0;
  width: 100%;
}

.header-inner {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-text-group {
  display: flex;
  flex-direction: column;
}

.header-title-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
  margin: 0;
  padding: 0;
}

.header-subtitle-text {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>


