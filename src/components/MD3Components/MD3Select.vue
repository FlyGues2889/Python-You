<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { t } from '../../utils/i18n';

export interface SelectOption {
  value: string | number;
  label: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    leadingIcon?: string;
  }>(),
  {
    placeholder: t('selectPlaceholder'),
    disabled: false,
    leadingIcon: ''
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const isOpen = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLDivElement | null>(null);

const menuStyle = ref<{
  top: string;
  left: string;
  minWidth: string;
}>({
  top: '0px',
  left: '0px',
  minWidth: '200px'
});

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue) || null;
});

const updateMenuPosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const menuWidth = Math.max(rect.width, 220);

  // Position below trigger, aligned to right edge of trigger if menu is wider
  let leftPos = rect.left;
  if (rect.left + menuWidth > window.innerWidth - 12) {
    leftPos = Math.max(12, rect.right - menuWidth);
  }

  // Vertical placement check (open upwards if too close to bottom)
  const spaceBelow = window.innerHeight - rect.bottom;
  let topPos = rect.bottom + 6;
  if (spaceBelow < 280 && rect.top > 280) {
    topPos = rect.top - 280 - 6;
  }

  menuStyle.value = {
    top: `${topPos}px`,
    left: `${leftPos}px`,
    minWidth: `${rect.width}px`
  };
};

const toggleMenu = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => {
      updateMenuPosition();
    });
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
  } else {
    window.removeEventListener('scroll', updateMenuPosition, true);
    window.removeEventListener('resize', updateMenuPosition);
  }
});

const selectOption = (opt: SelectOption) => {
  emit('update:modelValue', opt.value);
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  if (
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    menuRef.value &&
    !menuRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('scroll', updateMenuPosition, true);
  window.removeEventListener('resize', updateMenuPosition);
});
</script>

<template>
  <div class="m3-select-container" :class="{ 'is-disabled': disabled }">
    <!-- Trigger Field -->
    <button
      ref="triggerRef"
      type="button"
      class="m3-select-trigger"
      :class="{ 'is-focused': isOpen }"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <span v-if="leadingIcon" class="material-symbols-rounded select-leading-icon">
        {{ leadingIcon }}
      </span>

      <span class="select-value-text">
        <template v-if="selectedOption">
          <span class="option-label">{{ selectedOption.label }}</span>
        </template>
        <template v-else>
          <span class="placeholder-text">{{ placeholder }}</span>
        </template>
      </span>

      <span class="material-symbols-rounded select-trailing-icon" :class="{ 'is-rotated': isOpen }">
        arrow_drop_down
      </span>
    </button>

    <!-- MD3 Expressive Floating Dropdown Teleported to Body -->
    <Teleport to="body">
      <Transition name="m3-menu">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="m3-select-menu-floating"
          :style="menuStyle"
          role="listbox"
        >
          <div class="m3-select-menu-inner">
            <div
              v-for="opt in options"
              :key="opt.value"
              class="m3-select-item"
              :class="{ 'is-selected': opt.value === modelValue }"
              role="option"
              :aria-selected="opt.value === modelValue"
              @click="selectOption(opt)"
            >
              <div class="item-left">
                <span v-if="opt.icon" class="material-symbols-rounded item-icon">
                  {{ opt.icon }}
                </span>
                <div class="item-text-group">
                  <span class="item-label">{{ opt.label }}</span>
                  <span v-if="opt.subtitle" class="item-subtitle">{{ opt.subtitle }}</span>
                </div>
              </div>

              <div class="item-right">
                <span
                  v-if="opt.value === modelValue"
                  class="material-symbols-rounded item-check-icon"
                >
                  check
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.m3-select-container {
  position: relative;
  display: inline-block;
  min-width: 200px;
  user-select: none;
}

/* Trigger styling with no shadow and focused border thickness change */
.m3-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  background-color: unset;
  border: 1px solid var(--border-color-muted);
  border-radius: 12px;
  color: var(--text-color);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: none !important;
  transition: border-color 0.15s ease, border-width 0.15s ease, background-color 0.15s ease;
  outline: none;
}

.m3-select-trigger:hover {
  background-color: var(--surface-color);
  border-color: var(--primary);
}

.m3-select-trigger.is-focused,
.m3-select-trigger:focus {
  border: 2px solid var(--primary);
  padding: 0 15px; /* adjust for 2px border */
  background-color: var(--surface-color);
}

.select-leading-icon {
  font-size: var(--text-size-m);
  color: var(--primary);
  margin-right: 8px;
}

.select-value-text {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder-text {
  color: var(--text-tertiary);
}

.select-trailing-icon {
  font-size: var(--text-size-l);
  color: var(--text-secondary);
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
  margin-left: 8px;
}

.select-trailing-icon.is-rotated {
  transform: rotate(180deg);
  color: var(--primary);
}
</style>

<!-- Unscoped floating menu styles attached to body -->
<style>
.m3-select-menu-floating {
  position: fixed;
  z-index: 99999;
  width: max-content;
  max-width: 320px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 6px;
  overflow: hidden;
  transform-origin: top left;
}

.m3-select-menu-floating .m3-select-menu-inner {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.m3-select-menu-floating .m3-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 40px;
  user-select: none;
}

.m3-select-menu-floating .m3-select-item:hover {
  background-color: var(--surface-variant);
}

.m3-select-menu-floating .m3-select-item.is-selected {
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
}

.m3-select-menu-floating .item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m3-select-menu-floating .item-icon {
  font-size: var(--text-size-m);
  color: var(--primary);
}

.m3-select-menu-floating .item-text-group {
  display: flex;
  flex-direction: column;
}

.m3-select-menu-floating .item-label {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-color);
}

.m3-select-menu-floating .m3-select-item.is-selected .item-label {
  color: var(--on-secondary-container);
}

.m3-select-menu-floating .item-subtitle {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.m3-select-menu-floating .m3-select-item.is-selected .item-subtitle {
  color: var(--on-secondary-container);
  opacity: 0.8;
}

.m3-select-menu-floating .item-right {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.m3-select-menu-floating .item-check-icon {
  font-size: var(--text-size-m);
  color: var(--primary);
  font-weight: 700;
}

.m3-select-menu-floating .m3-select-item.is-selected .item-check-icon {
  color: var(--on-secondary-container);
}

/* Animations */
.m3-menu-enter-active,
.m3-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.m3-menu-enter-from,
.m3-menu-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-8px);
}
</style>
