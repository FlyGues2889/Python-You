<script setup lang="ts">
interface Props {
  expanded?: boolean;
}

withDefaults(defineProps<Props>(), {
  expanded: false,
});
</script>

<template>
  <aside 
    class="app-sidebar"
    :class="{ 'expanded': expanded }"
    data-tauri-drag-region
  >
    <div class="sidebar-top-section" :class="{ 'align-center': !expanded }">
      <!-- Top Section Slot (Logo, Menu button, brand) -->
      <slot name="top" :expanded="expanded"></slot>

      <!-- Middle Section Slot (Navigation menu items) -->
      <slot name="middle" :expanded="expanded"></slot>
    </div>

    <!-- Bottom Section Slot (Settings, profile, etc.) -->
    <div class="sidebar-bottom-section" :class="{ 'align-center': !expanded }">
      <slot name="bottom" :expanded="expanded"></slot>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-color: var(--surface-variant);
  border-right: none;
  flex-shrink: 0;
  transition: width var(--transition-normal);
  overflow: hidden;
  box-sizing: border-box;
}

.app-sidebar.expanded {
  width: 16rem;
  padding: 1rem;
}

.app-sidebar:not(.expanded) {
  width: 80px;
  padding: 1rem 0;
}

.sidebar-top-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.sidebar-top-section.align-center {
  align-items: center;
}

.sidebar-bottom-section {
  width: 100%;
}

.sidebar-bottom-section.align-center {
  display: flex;
  justify-content: center;
}

/* Deep stylings for slot content to support clean rendering of brand and nav structures */
:deep(.brand-row) {
  display: flex;
  width: 100%;
  align-items: center;
}

:deep(.brand-identity) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  width: 100%;
}

.app-sidebar:not(.expanded) :deep(.brand-identity) {
  justify-content: center;
}

:deep(.brand-icon-btn) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  color: var(--secondary);
  border: none;
  background-color: var(--surface-variant);
}

:deep(.brand-icon-btn:hover) {
  background-color: var(--border-color-muted);
}

:deep(.brand-menu-icon) {
  font-size: var(--text-size-l) !important;
}

:deep(.brand-info) {
  min-width: 0;
}

:deep(.brand-title) {
  font-family: "Nunito", sans-serif !important;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

:deep(.brand-badge) {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  border-radius: 9999px;
  margin-top: 0.25rem;
  display: inline-block;
}

:deep(.sidebar-nav) {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
}

:deep(.sidebar-nav.align-center-width) {
  align-items: center;
  width: 100%;
}
</style>
