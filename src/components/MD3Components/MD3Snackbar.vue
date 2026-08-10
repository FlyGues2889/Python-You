<script setup lang="ts">
import { watch, ref, onUnmounted, computed } from 'vue';
import MD3Button from './MD3Button.vue';
import { useI18n } from '../../utils/i18n';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    message: string | null;
    duration?: number;
  }>(),
  {
    message: '',
    duration: 5000,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const timer = ref<any>(null);

const startTimer = () => {
  if (timer.value) clearTimeout(timer.value);
  if (!props.message) return;
  
  // Keep the snackbar open slightly longer for long paths
  const currentDuration = isExportSuccess.value ? 7000 : props.duration;
  
  timer.value = setTimeout(() => {
    emit('close');
  }, currentDuration);
};

const isExportSuccess = computed(() => {
  return !!props.message && (
    props.message.includes('配置文件已成功导出') || 
    props.message.includes('successfully exported to path')
  );
});

const isOpening = ref(false);
const handleOpenFolder = () => {
  isOpening.value = true;
  setTimeout(() => {
    isOpening.value = false;
    emit('close');
  }, 1000);
};

watch(
  () => props.message,
  () => {
    startTimer();
  },
  { immediate: true }
);

onUnmounted(() => {
  if (timer.value) clearTimeout(timer.value);
});
</script>

<template>
  <Transition name="snackbar-fade">
    <div v-if="message" class="m3-snackbar-container">
      <div class="m3-snackbar-card">
        <span class="m3-snackbar-text">{{ message }}</span>
        
        <MD3Button 
          v-if="isExportSuccess" 
          variant="text"
          size="S"
          color="primary"
          :disabled="isOpening"
          @click="handleOpenFolder"
        >
          {{ isOpening ? t('openingFolder') : t('openFolder') }}
        </MD3Button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.m3-snackbar-container {
  position: fixed;
  bottom: 24px;
  left: calc(var(--sidebar-width, 80px) + 24px);
  z-index: 1000;
  width: 360px; /* Fixed 360px as requested */
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
  transition: left var(--transition-normal, 0.3s) ease;
}

@media (max-width: 600px) {
  .m3-snackbar-container {
    left: 16px;
    bottom: 16px;
    width: calc(100% - 32px);
  }
}

.m3-snackbar-card {
  pointer-events: auto;
  display: flex;
  flex-direction: column; /* Allow vertical alignment for message and the button below */
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  background-color: var(--inverse-surface, #323033);
  color: var(--inverse-on-surface, #f5eff4);
  padding: 14px 16px;
  border-radius: 4px; /* M3 Spec: 4dp border radius */
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
              0px 6px 10px 0px rgba(0, 0, 0, 0.14),
              0px 1px 18px 0px rgba(0, 0, 0, 0.12); /* Elevation Level 3 */
  min-height: 48px;
  width: 100%;
  box-sizing: border-box;
}

.m3-snackbar-text {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
  white-space: pre-wrap; /* Allow word wrap and line breaks */
  word-break: break-all;
  width: 100%;
}

.m3-snackbar-action-btn {
  background: transparent !important;
  border: none !important;
  color: var(--primary-container, #d1e4ff) !important; /* Primary Container text color */
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 6px 12px;
  margin-top: 4px;
  margin-left: -12px; /* Aligns with the message padding nicely */
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  align-self: flex-start;
}

.m3-snackbar-action-btn:hover {
  background-color: rgba(var(--primary-container-rgb, 209, 228, 255), 0.1) !important;
}

.m3-snackbar-action-btn:active {
  background-color: rgba(var(--primary-container-rgb, 209, 228, 255), 0.2) !important;
}

.m3-snackbar-action-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Transition Animations */
.snackbar-fade-enter-active,
.snackbar-fade-leave-active {
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease;
}

.snackbar-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.snackbar-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
