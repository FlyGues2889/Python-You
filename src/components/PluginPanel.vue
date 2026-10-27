<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../utils/i18n';
import { getPluginPanelHtml } from '../utils/pluginManager';
import PageHeader from './PageHeader.vue';

const props = defineProps<{
  pluginId: string;
  panelId: string;
  title: string;
  icon?: string;
}>();

const { t } = useI18n();

const htmlContent = computed(() => getPluginPanelHtml(props.pluginId, props.panelId) || '');
</script>

<template>
  <m3e-content-pane class="plugin-panel-container">
    <PageHeader :title="title" :subtitle="t('pluginPanelSubtitle')" />
    <div class="plugin-panel-content" v-html="htmlContent"></div>
  </m3e-content-pane>
</template>

<style scoped>
.plugin-panel-container {
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 12px;
  --m3e-content-pane-container-color: var(--surface-color);
  --m3e-content-pane-container-padding: 2rem;
}

.plugin-panel-content {
  max-width: 72rem;
  margin: 0 auto;
  color: var(--text-color);
  font-size: 0.875rem;
  line-height: 1.6;
}

.plugin-panel-content :deep(h1),
.plugin-panel-content :deep(h2),
.plugin-panel-content :deep(h3) {
  color: var(--primary);
  margin-top: 1.2em;
}

.plugin-panel-content :deep(a) {
  color: var(--primary);
}

.plugin-panel-content :deep(code) {
  font-family: var(--font-mono);
  background-color: var(--surface-variant);
  padding: 2px 6px;
  border-radius: 4px;
}

.plugin-panel-content :deep(pre) {
  font-family: var(--font-mono);
  background-color: var(--bg-color);
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
}
</style>