<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useI18n } from '../utils/i18n';
import { FSItem } from '../types';

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  type: 'editor' | 'terminal' | 'filetree' | 'tutorial' | 'general';
  targetItem?: FSItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'copy'): void;
  (e: 'cut'): void;
  (e: 'paste'): void;
  (e: 'find'): void;
  (e: 'replace'): void;
  (e: 'new-file'): void;
  (e: 'new-folder'): void;
  (e: 'rename', item: FSItem): void;
  (e: 'reveal-in-explorer', item: FSItem): void;
  (e: 'delete', item: FSItem): void;
  (e: 'run', item: FSItem): void;
}>();

const { t } = useI18n();

const menuRef = ref<HTMLElement | null>(null);
const anchorRef = ref<HTMLDivElement | null>(null);
const pos = ref({ left: 0, top: 0 });

// 显示时把零尺寸锚点放到光标位置，再调用原生 show(anchor) 定位菜单；
// m3e-menu 内置 flip/shift，靠近视口边缘时自动翻转/平移，无需手动计算位置。
const openMenu = async () => {
  pos.value = { left: props.x, top: props.y };
  await nextTick();
  const menu = menuRef.value as HTMLElement & { show?: (trigger: HTMLElement) => Promise<void> };
  if (menu?.show && anchorRef.value) {
    await menu.show(anchorRef.value);
  }
};

watch(
  () => props.visible,
  (v) => {
    if (v) openMenu();
  },
  { immediate: true }
);

// 菜单自行关闭（Escape / 点击外部 / 滚动 / 点击项）后同步父组件状态
const onMenuToggle = (e: Event) => {
  if ((e as any).newState === 'closed') {
    emit('close');
  }
};

const handleAction = (action: string) => {
  if (action === 'copy') emit('copy');
  else if (action === 'cut') emit('cut');
  else if (action === 'paste') emit('paste');
  else if (action === 'find') emit('find');
  else if (action === 'replace') emit('replace');
  else if (action === 'new-file') emit('new-file');
  else if (action === 'new-folder') emit('new-folder');
  else if (action === 'rename' && props.targetItem) emit('rename', props.targetItem);
  else if (action === 'reveal-in-explorer' && props.targetItem) emit('reveal-in-explorer', props.targetItem);
  else if (action === 'delete' && props.targetItem) emit('delete', props.targetItem);
  else if (action === 'run' && props.targetItem) emit('run', props.targetItem);

  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <!-- 光标位置的零尺寸锚点：m3e-menu 通过 show(anchor) 定位 -->
    <div v-if="visible" ref="anchorRef" class="context-menu-anchor"
      :style="{ left: pos.left + 'px', top: pos.top + 'px' }"></div>
    <m3e-menu ref="menuRef" class="context-menu" position-x="after" position-y="below" @toggle="onMenuToggle">
      <!-- Terminal / Console Context Menu (ONLY Copy) -->
      <template v-if="type === 'terminal'">
        <m3e-menu-item class="ctx-item" @click="handleAction('copy')">
          <span slot="icon" class="material-symbols-rounded">content_copy</span>
          <span>{{ t('copyTerminalInfo') }}</span>
        </m3e-menu-item>
      </template>

      <!-- Tutorial Context Menu (ONLY Copy) -->
      <template v-else-if="type === 'tutorial'">
        <m3e-menu-item class="ctx-item" @click="handleAction('copy')">
          <span slot="icon" class="material-symbols-rounded">content_copy</span>
          <span>{{ t('copy') }}</span>
        </m3e-menu-item>
      </template>

      <!-- Editor Context Menu (Edit options) -->
      <template v-else-if="type === 'editor'">
        <m3e-menu-item class="ctx-item" @click="handleAction('copy')">
          <span slot="icon" class="material-symbols-rounded">content_copy</span>
          <span>{{ t('copy') }}</span>
        </m3e-menu-item>
        <m3e-menu-item class="ctx-item" @click="handleAction('cut')">
          <span slot="icon" class="material-symbols-rounded">content_cut</span>
          <span>{{ t('cut') }}</span>
        </m3e-menu-item>
        <m3e-menu-item class="ctx-item" @click="handleAction('paste')">
          <span slot="icon" class="material-symbols-rounded">content_paste</span>
          <span>{{ t('paste') }}</span>
        </m3e-menu-item>
        <m3e-divider></m3e-divider>
        <m3e-menu-item class="ctx-item" @click="handleAction('find')">
          <span slot="icon" class="material-symbols-rounded">search</span>
          <span>{{ t('find') }}</span>
        </m3e-menu-item>
        <m3e-menu-item class="ctx-item" @click="handleAction('replace')">
          <span slot="icon" class="material-symbols-rounded">find_replace</span>
          <span>{{ t('replace') }}</span>
        </m3e-menu-item>
      </template>

      <!-- File Tree Context Menu -->
      <template v-else-if="type === 'filetree'">
        <template v-if="targetItem">
          <m3e-menu-item v-if="!targetItem.isFolder && targetItem.name.endsWith('.py')" class="ctx-item run-item"
            @click="handleAction('run')">
            <span slot="icon" class="material-symbols-rounded">play_arrow</span>
            <span>{{ t('run') }}</span>
          </m3e-menu-item>
          <m3e-menu-item class="ctx-item" @click="handleAction('rename')">
            <span slot="icon" class="material-symbols-rounded">edit</span>
            <span>{{ t('rename') }}</span>
          </m3e-menu-item>
          <m3e-menu-item class="ctx-item" @click="handleAction('reveal-in-explorer')">
            <span slot="icon" class="material-symbols-rounded">folder_open</span>
            <span>{{ t('openInExplorer') }}</span>
          </m3e-menu-item>
          <m3e-menu-item class="ctx-item delete-item" @click="handleAction('delete')">
            <span slot="icon" class="material-symbols-rounded">delete</span>
            <span>{{ t('delete') }}</span>
          </m3e-menu-item>
          <m3e-divider></m3e-divider>
        </template>

        <m3e-menu-item class="ctx-item" @click="handleAction('new-file')">
          <span slot="icon" class="material-symbols-rounded">note_add</span>
          <span>{{ t('newFile') }}</span>
        </m3e-menu-item>
        <m3e-menu-item class="ctx-item" @click="handleAction('new-folder')">
          <span slot="icon" class="material-symbols-rounded">create_new_folder</span>
          <span>{{ t('newFolder') }}</span>
        </m3e-menu-item>
      </template>
    </m3e-menu>
  </Teleport>
</template>

<style scoped>
/* 光标锚点：零尺寸，仅用于定位菜单 */
.context-menu-anchor {
  position: fixed;
  width: 0;
  height: 0;
  z-index: 999999;
}


/* 运行（绿）与删除（错误色）的语义着色，仅改文字色，保持原生交互 */
.ctx-item.run-item {
  --m3e-menu-item-color: var(--success);
}

.ctx-item.delete-item {
  --m3e-menu-item-color: var(--error);
}

</style>
