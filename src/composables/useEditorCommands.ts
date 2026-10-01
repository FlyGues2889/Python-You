// useEditorCommands.ts —— App 侧编辑器命令通道与上抛状态（HANDOFF 提示词 6 批次 4）：
// 标题栏 / 工具栏 / 右键菜单经 command prop 远程触发 CodeEditor 内部动作；
// 撤销/重做可用态、光标位置经事件上抛，由本 composable 收口成 App 可直接绑定的状态。
import { ref, type Ref } from 'vue';
import { t } from '../utils/i18n';

export interface EditorCommands {
  editorCommand: Ref<{ cmd: string; arg?: unknown; seq: number } | null>;
  sendEditorCommand: (cmd: string, arg?: unknown) => void;
  editorUndoState: Ref<{ canUndo: boolean; canRedo: boolean }>;
  editorCursor: Ref<{ line: number; col: number }>;
  onEditorCursorChange: (payload: { path: string; line: number; col: number }) => void;
  handleEditorCopyResult: (ok: boolean) => void;
}

export function useEditorCommands(deps: {
  /** 光标移动的既有消费方（会话光标记忆）；本 composable 在其前更新位置标签 */
  onCursorChange: (payload: { path: string; line: number; col: number }) => void;
  showToast: (msg: string) => void;
}): EditorCommands {
  const editorCommand = ref<{ cmd: string; arg?: unknown; seq: number } | null>(null);
  const sendEditorCommand = (cmd: string, arg?: unknown) => {
    editorCommand.value = { cmd, arg, seq: (editorCommand.value?.seq ?? 0) + 1 };
  };
  const editorUndoState = ref({ canUndo: false, canRedo: false });
  const editorCursor = ref({ line: 1, col: 1 });
  const onEditorCursorChange = (payload: { path: string; line: number; col: number }) => {
    editorCursor.value = { line: payload.line, col: payload.col };
    deps.onCursorChange(payload);
  };
  const handleEditorCopyResult = (ok: boolean) => {
    deps.showToast(ok ? t('toastCopiedToClipboard') : t('toastSelectEditorText'));
  };
  return {
    editorCommand,
    sendEditorCommand,
    editorUndoState,
    editorCursor,
    onEditorCursorChange,
    handleEditorCopyResult,
  };
}
