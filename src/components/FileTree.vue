<script setup lang="ts">
import { ref, computed } from 'vue';
import { FSItem } from '../types';
import FileTreeNode from './FileTreeNode.vue';
import { useI18n } from '../utils/i18n';

const props = defineProps<{
  workspaceItems: FSItem[];
  activeFileId: string | null;
  workspaceRoot?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-file', file: FSItem): void;
  (e: 'toggle-folder', item: FSItem): void;
  (e: 'create-file', parentId: string | null, name: string): void;
  (e: 'create-folder', parentId: string | null, name: string): void;
  (e: 'rename-item', item: FSItem, newName: string): void;
  (e: 'delete-item', item: FSItem): void;
  (e: 'run-file', item: FSItem): void;
  (e: 'download-file', item: FSItem): void;
  (e: 'contextmenu-filetree', event: MouseEvent, item: FSItem | null): void;
  (e: 'show-toast', msg: string): void;
}>();

const { t } = useI18n();
const searchQuery = ref('');

// 原生本地工作区时，标题显示根目录名
const rootName = computed(() => {
  if (!props.workspaceRoot) return null;
  const parts = props.workspaceRoot.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || props.workspaceRoot;
});

// Inline creation and rename state
const creatingState = ref<{ parentId: string | null; isFolder: boolean } | null>(null);
const editingItemId = ref<string | null>(null);
const rootNewName = ref('');

// Custom directive for autofocus & text select
const vAutofocus = {
  mounted: (el: HTMLElement) => {
    el.focus();
    if (el instanceof HTMLInputElement) {
      el.select();
    }
  }
};

const ensureFolderOpen = (folderId: string) => {
  const findAndOpen = (items: FSItem[]): boolean => {
    for (const item of items) {
      if (item.id === folderId && item.isFolder) {
        if (!item.isOpen) {
          emit('toggle-folder', item);
        }
        return true;
      }
      if (item.children && findAndOpen(item.children)) return true;
    }
    return false;
  };
  findAndOpen(props.workspaceItems);
};

const startCreateFile = (parentId: string | null = null) => {
  editingItemId.value = null;
  creatingState.value = { parentId, isFolder: false };
  rootNewName.value = '';
  if (parentId) {
    ensureFolderOpen(parentId);
  }
};

const startCreateFolder = (parentId: string | null = null) => {
  editingItemId.value = null;
  creatingState.value = { parentId, isFolder: true };
  rootNewName.value = '';
  if (parentId) {
    ensureFolderOpen(parentId);
  }
};

const startRename = (item: FSItem) => {
  creatingState.value = null;
  editingItemId.value = item.id;
};

// 文件名合法性校验（安全需求 FR-2.3 / NFR-5.2）：
// 拒绝路径分隔符、Windows 保留字符、控制字符与 ..（防止逃逸工作区根目录）
const INVALID_NAME_RE = /[/\\:*?"<>|]/;
const hasControlChar = (name: string) => [...name].some((ch) => ch.charCodeAt(0) < 32);
const isValidName = (name: string) => {
  const trimmed = name.trim();
  return (
    trimmed !== '' &&
    trimmed !== '.' &&
    trimmed !== '..' &&
    !trimmed.includes('..') &&
    !hasControlChar(trimmed) &&
    !INVALID_NAME_RE.test(trimmed)
  );
};

const handleConfirmCreate = (parentId: string | null, name: string, isFolder: boolean) => {
  let finalName = name.trim();
  if (!finalName) {
    cancelInline();
    return;
  }
  if (!isFolder && !finalName.includes('.')) {
    finalName += '.py';
  }
  if (!isValidName(finalName)) {
    // 校验失败：保持内联输入框，提示用户修改，不提交、不静默通过
    emit('show-toast', t('invalidFileName'));
    return;
  }
  if (isFolder) {
    emit('create-folder', parentId, finalName);
  } else {
    emit('create-file', parentId, finalName);
  }
  cancelInline();
};

const handleConfirmCreateRoot = () => {
  if (!creatingState.value) return;
  handleConfirmCreate(creatingState.value.parentId, rootNewName.value, creatingState.value.isFolder);
};

const handleConfirmRename = (item: FSItem, newName: string) => {
  const finalName = newName.trim();
  if (finalName === item.name) {
    editingItemId.value = null;
    return;
  }
  if (!finalName) {
    editingItemId.value = null;
    return;
  }
  if (!isValidName(finalName)) {
    // 校验失败：保持重命名编辑状态，提示用户修改
    emit('show-toast', t('invalidFileName'));
    return;
  }
  emit('rename-item', item, finalName);
  editingItemId.value = null;
};

const cancelInline = () => {
  creatingState.value = null;
  editingItemId.value = null;
  rootNewName.value = '';
};

// 供父组件（App 的右键菜单“重命名”）触发内联重命名输入
defineExpose({ startRename, startCreateFile, startCreateFolder });

// Filtered tree logic
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.workspaceItems;
  const q = searchQuery.value.toLowerCase().trim();

  const filterNodes = (nodes: FSItem[]): FSItem[] => {
    return nodes.reduce<FSItem[]>((acc, item) => {
      if (item.isFolder && item.children) {
        const matchingChildren = filterNodes(item.children);
        if (matchingChildren.length > 0 || item.name.toLowerCase().includes(q)) {
          acc.push({ ...item, isOpen: true, children: matchingChildren });
        }
      } else if (item.name.toLowerCase().includes(q)) {
        acc.push(item);
      }
      return acc;
    }, []);
  };

  return filterNodes(props.workspaceItems);
});
</script>

<template>
  <div class="attached-file-tree">
    <div class="tree-content">
      <!-- Tree Header Bar -->
      <m3e-list-item>
        <span slot="overline">资源管理器</span>
        {{ rootName || t('workspace') }}
        <div class="tree-header-actions" slot="trailing">
        </div>
      </m3e-list-item>

      <!-- Quick Filter Search Input -->
      <div class="search-box">
        <m3e-search-bar class="tree-search-bar" clearable @clear="searchQuery = ''">
          <span slot="leading" class="material-symbols-rounded">search</span>
          <input slot="input" v-model="searchQuery"/>
        </m3e-search-bar>
      </div>

      <!-- File Tree Node List -->
      <m3e-content-pane class="tree-node-list" @contextmenu.prevent="(e: MouseEvent) => emit('contextmenu-filetree', e, null)">
        <!-- Inline Create Row at Root Level -->
        <div v-if="creatingState && creatingState.parentId === null" class="tree-node-item"
          style="padding-left: 12px;">
          <span class="node-spacer"></span>
          <span class="material-symbols-rounded node-icon"
            :style="{ color: creatingState.isFolder ? 'var(--accent-amber-text)' : 'var(--text-secondary)' }">
            {{ creatingState.isFolder ? 'folder' : 'code_blocks' }}
          </span>
          <input v-autofocus v-model="rootNewName" type="text" class="node-inline-input"
            :placeholder="creatingState.isFolder ? t('folderNamePlaceholder') : t('fileNamePlaceholder')"
            @keyup.enter="handleConfirmCreateRoot" @keyup.esc="cancelInline" @blur="handleConfirmCreateRoot"
            @click.stop />
        </div>

        <div v-if="filteredItems.length === 0 && (!creatingState || creatingState.parentId !== null)"
          class="empty-tree-state">
          <span class="material-symbols-rounded empty-icon">folder_off</span>
          <p>{{ t('noMatchingFiles') }}</p>
        </div>

        <FileTreeNode v-for="item in filteredItems" :key="item.id" :item="item" :active-file-id="activeFileId"
          :depth="0" :editing-item-id="editingItemId"
          :creating-parent-id="creatingState ? creatingState.parentId : null"
          :creating-is-folder="creatingState ? creatingState.isFolder : false"
          @select-file="f => emit('select-file', f)" @toggle-folder="f => emit('toggle-folder', f)"
          @start-create-file="p => startCreateFile(p)" @start-create-folder="p => startCreateFolder(p)"
          @start-rename="f => startRename(f)" @confirm-create="(p, n, isF) => handleConfirmCreate(p, n, isF)"
          @confirm-rename="(f, n) => handleConfirmRename(f, n)" @cancel-inline="cancelInline"
          @delete-item="f => emit('delete-item', f)" @run-file="f => emit('run-file', f)"
          @download-file="f => emit('download-file', f)"
          @contextmenu-item="(e, f) => emit('contextmenu-filetree', e, f)" />
      </m3e-content-pane>
    </div>
  </div>
</template>

<style scoped>
.attached-file-tree {
  width: 100%;
  height: 100%;
  min-width: 0;
  background-color: var(--surface-color);
  display: flex;
  flex-direction: column;
  user-select: none;
}

.tree-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tree-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-box {
  padding: 4px 12px 8px 12px;
  position: relative;
  display: flex;
  align-items: center;
}

.tree-search-bar {
  flex: 1;
  min-width: 200px;
}

.tree-node-list {
  flex: 1;
  min-height: 0;
  /* host 自身 overflow 为 visible 时 flex item 的 min-height:auto 会取内容高度，
     把 host 撑高导致 shadow 内滚动容器失去滚动空间 → 必须显式归零 */
  /* 背景/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制
     （与父级同色 surface；树列表无圆角） */
  --m3e-content-pane-container-padding: 4px;
  --m3e-content-pane-container-shape: 0;
  --m3e-content-pane-container-color: var(--surface-color);
}

.empty-tree-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.tree-node-item {
  display: flex;
  align-items: center;
  height: 32px;
  padding-right: 8px;
  border-radius: 9999px;
  margin: 1px 4px;
  user-select: none;
  font-size: 0.875rem;
  color: var(--text-color);
  position: relative;
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
m3e-list-item {
  margin-top: -0.2rem;
  --md-sys-density-scale: -3;
}
</style>
