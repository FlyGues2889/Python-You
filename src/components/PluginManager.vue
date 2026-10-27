<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '../utils/i18n';
import { nativeApi } from '../utils/native';
import {
  plugins,
  scanPlugins,
  togglePlugin,
} from '../utils/pluginManager';
import { addBackendTask, removeBackendTask } from '../utils/backendTasks';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'closed'): void;
  (e: 'show-toast', msg: string): void;
}>();

const { t, tf } = useI18n();
const filterQuery = ref('');
const importError = ref('');
const isScanning = ref(false);

const filteredPlugins = computed(() => {
  const q = filterQuery.value.trim().toLowerCase();
  if (!q) return plugins.value;
  return plugins.value.filter(
    (p) =>
      p.manifest.name.toLowerCase().includes(q) ||
      p.manifest.description.toLowerCase().includes(q)
  );
});

const handleScanPlugins = async () => {
  if (isScanning.value) return;
  importError.value = '';
  if (!nativeApi.available()) {
    emit('show-toast', t('pluginImportUnsupported'));
    return;
  }
  isScanning.value = true;
  const taskId = `scan-plugins`;
  addBackendTask(taskId, t('pluginScanning'));
  try {
    const result = await scanPlugins();
    if (result.ok) {
      emit('show-toast', tf('pluginScanned', { count: result.count }));
    } else {
      const msg = tf('pluginScanFailed', { error: result.error || '' });
      importError.value = msg;
      emit('show-toast', msg);
    }
  } finally {
    removeBackendTask(taskId);
    isScanning.value = false;
  }
};


const handleToggle = (id: string, enabled: boolean) => {
  togglePlugin(id, enabled);
};
</script>

<template>
  <m3e-dialog class="plugin-manager-dialog" :open="open" @cancel="emit('cancel')" @closed="emit('closed')">
    <span slot="header" class="m3e-dialog-title-row">
      <span class="material-symbols-rounded m3e-dialog-icon">extension</span>
      <span class="m3e-dialog-title">{{ t('pluginManagerTitle') }}</span>
    </span>

    <div class="plugin-manager-body">
      <m3e-search-bar class="plugin-search-bar" clearable @clear="filterQuery = ''">
        <span slot="leading" class="material-symbols-rounded">search</span>
        <input slot="input" v-model="filterQuery" :placeholder="t('pluginSearchPlaceholder')" />
      </m3e-search-bar>
      <p v-if="importError" class="plugin-import-error">{{ importError }}</p>

      <div class="plugin-list-section">
        <m3e-list v-if="filteredPlugins.length > 0" class="plugin-m3e-list">
          <m3e-list-item v-for="p in filteredPlugins" :key="p.manifest.id">
            <span slot="leading" class="material-symbols-rounded">{{ p.manifest.icon || 'extension' }}</span>
            {{ p.manifest.name }}
            <span slot="supporting-text">{{ p.manifest.description }}</span>
            <div slot="trailing" class="plugin-item-actions">
              <span class="plugin-version">v{{ p.manifest.version }}</span>
              <m3e-switch :checked="p.enabled" :disabled="isScanning" @change="(e: Event) => handleToggle(p.manifest.id, !!(e.target as any).checked)" />
            </div>
          </m3e-list-item>
        </m3e-list>
        <div v-else class="plugin-empty-hint">{{ t('pluginEmptyHint') }}</div>
      </div>
    </div>

    <div slot="actions" class="m3e-dialog-actions">
      <m3e-button variant="outlined" size="small" :disabled="isScanning" @click="handleScanPlugins">
        <span slot="icon" class="material-symbols-rounded">{{ isScanning ? 'progress_activity' : 'refresh' }}</span>
        {{ t('pluginScan') }}
      </m3e-button>
      <m3e-button variant="filled" size="small" @click="emit('closed')">{{ t('closeTitle') }}</m3e-button>
    </div>
  </m3e-dialog>
</template>

<style scoped>
.plugin-manager-dialog {
  --m3e-dialog-max-width: 42rem;
}

.plugin-manager-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 24rem;
}

.plugin-search-bar {
  --m3e-search-bar-container-color: var(--bg-color);
  width: 100%;
}

.plugin-import-error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--error);
}

.plugin-list-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plugin-m3e-list {
  --m3e-list-item-container-shape: 24px;
}

.plugin-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plugin-version {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.plugin-empty-hint {
  padding: 24px 0;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.m3e-dialog-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.m3e-dialog-icon {
  font-size: 1.25rem;
  color: var(--primary);
}

.m3e-dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.m3e-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
</style>