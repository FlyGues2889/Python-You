<script setup lang="ts">
import { ref, watch } from 'vue';
import { FSItem } from '../types';
import { useI18n } from '../utils/i18n';
import MD3IconButton from './MD3Components/MD3IconButton.vue';

const props = defineProps<{
  item: FSItem;
  activeFileId: string | null;
  depth?: number;
  editingItemId?: string | null;
  creatingParentId?: string | null;
  creatingIsFolder?: boolean;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'select-file', file: FSItem): void;
  (e: 'toggle-folder', item: FSItem): void;
  (e: 'start-create-file', parentFolderId: string): void;
  (e: 'start-create-folder', parentFolderId: string): void;
  (e: 'start-rename', item: FSItem): void;
  (e: 'confirm-create', parentFolderId: string | null, name: string, isFolder: boolean): void;
  (e: 'confirm-rename', item: FSItem, newName: string): void;
  (e: 'cancel-inline'): void;
  (e: 'delete-item', item: FSItem): void;
  (e: 'run-file', item: FSItem): void;
  (e: 'download-file', item: FSItem): void;
  (e: 'contextmenu-item', event: MouseEvent, item: FSItem): void;
}>();

const isHovered = ref(false);
const editingName = ref(props.item.name);
const newChildName = ref('');

// Custom directive for autofocus & text select
const vAutofocus = {
  mounted: (el: HTMLElement) => {
    el.focus();
    if (el instanceof HTMLInputElement) {
      el.select();
    }
  }
};

watch(() => props.item.name, (val) => {
  editingName.value = val;
});

watch(() => props.editingItemId, (val) => {
  if (val === props.item.id) {
    editingName.value = props.item.name;
  }
});

const getFileIcon = (name: string, isFolder: boolean) => {
  if (isFolder) return 'folder';
  const lower = name.toLowerCase();
  if (
    lower.endsWith('.py') ||
    lower.endsWith('.js') ||
    lower.endsWith('.ts') ||
    lower.endsWith('.json') ||
    lower.endsWith('.html') ||
    lower.endsWith('.css')
  ) {
    return 'code_blocks';
  }
  return 'text_snippet';
};

const getFileIconColor = (name: string, isFolder: boolean, isActive: boolean) => {
  if (isActive && !isFolder) return 'var(--on-secondary-container)';
  if (isFolder) return 'var(--secondary)';
  return 'var(--text-tertiary)';
};

const handleClick = () => {
  if (props.editingItemId === props.item.id) return;
  if (props.item.isFolder) {
    emit('toggle-folder', props.item);
  } else {
    emit('select-file', props.item);
  }
};

const saveRename = () => {
  const name = editingName.value.trim();
  if (name && name !== props.item.name) {
    emit('confirm-rename', props.item, name);
  } else {
    emit('cancel-inline');
  }
};

const saveCreateChild = () => {
  const name = newChildName.value.trim();
  if (name) {
    emit('confirm-create', props.item.id, name, !!props.creatingIsFolder);
    newChildName.value = '';
  } else {
    emit('cancel-inline');
  }
};

const cancelInline = () => {
  editingName.value = props.item.name;
  newChildName.value = '';
  emit('cancel-inline');
};
</script>

<template>
  <div class="tree-node-wrapper">
    <!-- Single Node Item -->
    <div
      class="tree-node-item"
      :class="{
        'is-active': activeFileId === item.id && !item.isFolder,
        'is-folder': item.isFolder,
        'is-editing': editingItemId === item.id
      }"
      :style="{ paddingLeft: `${(depth || 0) * 16 + 12}px` }"
      @click="handleClick"
      @contextmenu.prevent="e => emit('contextmenu-item', e, item)"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Expand/Collapse arrow for folder -->
      <span
        v-if="item.isFolder"
        class="material-symbols-rounded folder-arrow"
        :class="{ 'is-open': item.isOpen }"
      >
        chevron_right
      </span>
      <span v-else class="node-spacer"></span>

      <!-- File / Folder Icon -->
      <span
        :class="[
          activeFileId === item.id && !item.isFolder ? 'material-symbols-rounded-fill' : 'material-symbols-rounded',
          'node-icon'
        ]"
        :style="{ color: getFileIconColor(item.name, item.isFolder, activeFileId === item.id) }"
      >
        {{ item.isFolder ? (item.isOpen ? 'folder_open' : 'folder') : getFileIcon(item.name, false) }}
      </span>

      <!-- Inline Name Edit Input OR Label -->
      <input
        v-if="editingItemId === item.id"
        v-autofocus
        v-model="editingName"
        type="text"
        class="node-inline-input"
        @keyup.enter="saveRename"
        @keyup.esc="cancelInline"
        @blur="saveRename"
        @click.stop
      />
      <span v-else class="node-name" :title="item.path">{{ item.name }}</span>

      <!-- Action Buttons on Hover -->
      <div v-if="isHovered && editingItemId !== item.id" class="node-actions" @click.stop>
        <!-- Run button for Python files -->
        <MD3IconButton
          v-if="!item.isFolder && item.name.endsWith('.py')"
          variant="standard"
          size="SM"
          icon="play_arrow"
          color="primary"
          :title="t('runScriptTooltip')"
          @click="emit('run-file', item)"
        />

        <!-- New File inside folder -->
        <MD3IconButton
          v-if="item.isFolder"
          variant="standard"
          size="SM"
          icon="note_add"
          :title="t('newFileTooltip')"
          @click="emit('start-create-file', item.id)"
        />

        <!-- New Folder inside folder -->
        <MD3IconButton
          v-if="item.isFolder"
          variant="standard"
          size="SM"
          icon="create_new_folder"
          :title="t('newFolderTooltip')"
          @click="emit('start-create-folder', item.id)"
        />

        <!-- Rename -->
        <MD3IconButton
          variant="standard"
          size="SM"
          icon="edit"
          :title="t('rename')"
          @click="emit('start-rename', item)"
        />

        <!-- Download -->
        <MD3IconButton
          v-if="!item.isFolder"
          variant="standard"
          size="SM"
          icon="download"
          :title="t('downloadExport')"
          @click="emit('download-file', item)"
        />

        <!-- Delete -->
        <MD3IconButton
          variant="standard"
          size="SM"
          icon="delete"
          color="error"
          :title="t('delete')"
          @click="emit('delete-item', item)"
        />
      </div>
    </div>

    <!-- Recursive Children for Folders -->
    <Transition name="expand">
      <div v-if="item.isFolder && item.isOpen" class="tree-node-children">
        <!-- Inline Create Row inside this folder -->
        <div
          v-if="creatingParentId === item.id"
          class="tree-node-item"
          :style="{ paddingLeft: `${((depth || 0) + 1) * 16 + 12}px` }"
        >
          <span class="node-spacer"></span>
          <span
            class="material-symbols-rounded node-icon"
            :style="{ color: creatingIsFolder ? 'var(--accent-amber-text)' : 'var(--text-secondary)' }"
          >
            {{ creatingIsFolder ? 'folder' : 'code_blocks' }}
          </span>
          <input
            v-autofocus
            v-model="newChildName"
            type="text"
            class="node-inline-input"
            :placeholder="creatingIsFolder ? t('folderNamePlaceholder') : t('fileNamePlaceholder')"
            @keyup.enter="saveCreateChild"
            @keyup.esc="cancelInline"
            @blur="saveCreateChild"
            @click.stop
          />
        </div>

        <FileTreeNode
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :active-file-id="activeFileId"
          :depth="(depth || 0) + 1"
          :editing-item-id="editingItemId"
          :creating-parent-id="creatingParentId"
          :creating-is-folder="creatingIsFolder"
          @select-file="f => emit('select-file', f)"
          @toggle-folder="f => emit('toggle-folder', f)"
          @start-create-file="p => emit('start-create-file', p)"
          @start-create-folder="p => emit('start-create-folder', p)"
          @start-rename="f => emit('start-rename', f)"
          @confirm-create="(p, n, isF) => emit('confirm-create', p, n, isF)"
          @confirm-rename="(f, n) => emit('confirm-rename', f, n)"
          @cancel-inline="emit('cancel-inline')"
          @delete-item="f => emit('delete-item', f)"
          @run-file="f => emit('run-file', f)"
          @download-file="f => emit('download-file', f)"
          @contextmenu-item="(e, f) => emit('contextmenu-item', e, f)"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tree-node-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tree-node-item {
  display: flex;
  align-items: center;
  height: 32px;
  padding-right: 8px;
  cursor: pointer;
  border-radius: 9999px;
  margin: 1px 4px;
  user-select: none;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  position: relative;
  border: 1px solid transparent;
}

.tree-node-item:hover {
  background-color: var(--surface-variant);
  color: var(--text-color);
}

.tree-node-item.is-active {
  background-color: transparent;
  color: var(--text-color);
  font-weight: 600;
  border: 1px solid var(--secondary);
  border-radius: 9999px;
}

.tree-node-item.is-editing {
  background-color: var(--surface-color);
}

.folder-arrow {
  font-size: 1.125rem;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  margin-right: 2px;
  flex-shrink: 0;
}

.folder-arrow.is-open {
  transform: rotate(90deg);
}

.node-spacer {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.node-icon {
  font-size: 1.125rem;
  margin-right: 6px;
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-inline-input {
  flex: 1;
  height: 26px;
  padding: 0 8px;
  font-size: 0.8125rem;
  font-family: inherit;
  border: 1px solid var(--border-color-muted);
  border-radius: 8px;
  background-color: var(--surface-variant);
  color: var(--text-color);
  outline: none;
  box-sizing: border-box;
  margin-right: 4px;
  transition: border-color 0.15s ease, border-width 0.15s ease, background-color 0.15s ease;
}

.node-inline-input:focus {
  border: 2px solid var(--primary);
  border-radius: 8px;
  padding: 0 7px;
  background-color: var(--surface-color);
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  background-color: var(--bg-color);
  padding: 2px 4px;
  border-radius: 9999px;
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-out;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
