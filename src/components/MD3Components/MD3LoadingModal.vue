<script setup lang="ts">
interface Props {
  show: boolean;
  status?: string;
}

defineProps<Props>();
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="m3-loading-modal-overlay" role="dialog" aria-modal="true">
      <div class="m3-loading-content">
        <m3e-loading-indicator variant="contained"></m3e-loading-indicator>
        <p v-if="status" class="m3-loading-status">{{ status }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.m3-loading-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--surface-color, #ffffff);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 30000;
}

.m3-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.m3-loading-status {
  margin-top: 2.4rem;
  font-size: var(--text-size-sm, 0.9rem);
  color: var(--text-secondary);
  letter-spacing: 0.2px;
  user-select: none;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
