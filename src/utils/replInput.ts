// 交互终端与输出终端共用的输入模型：命令历史、多行续行（FR-4.4）、粘贴多行、回车执行。
// 两者只有「提交后去哪」不同——交互终端总是当语句执行；输出终端在程序运行中把行喂给 stdin。
import { computed, ref } from 'vue';
import type { ConsoleOutput } from '../types';
import { pythonRunner } from './pythonRunner';

export interface ReplInputOptions {
  /** 回显与续行提示写进各自的日志 */
  onLog: (type: ConsoleOutput['type'], text: string) => void;
  /** 语句执行产生的输出 */
  onOutput: (out: ConsoleOutput) => void;
  /** 提交前拦截：返回 true 表示这一行已被接管（如喂给正在运行的程序），不再当语句执行 */
  onIntercept?: (line: string) => boolean;
  /** 演示模式（设置项），透传给执行引擎 */
  demoMode?: () => boolean | undefined;
}

export const useReplInput = (opts: ReplInputOptions) => {
  const input = ref('');
  const history = ref<string[]>([]);
  const historyIndex = ref(-1);
  const pendingLines = ref<string[]>([]);
  const isContinuation = computed(() => pendingLines.value.length > 0);
  const prompt = computed(() => (isContinuation.value ? '...' : '>>>'));

  // 粗略判断语句是否需要续行：忽略引号内容，检查括号配平 + 最后一行行尾冒号
  const isUnclosed = (text: string): boolean => {
    let depth = 0;
    let inStr: string | null = null;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (ch === '\\') i++;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'") inStr = ch;
      else if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
    }
    if (depth > 0) return true;
    const lines = text.split('\n');
    const last = lines[lines.length - 1].trimEnd();
    return last.endsWith(':');
  };

  const remember = (line: string) => {
    history.value.push(line);
    historyIndex.value = history.value.length;
  };

  const runStatement = async (statement: string) => {
    await pythonRunner.runREPL(statement, opts.onOutput, opts.demoMode?.());
  };

  const submit = async () => {
    const cmd = input.value;
    input.value = '';
    if (!cmd.trim()) return;
    if (opts.onIntercept?.(cmd)) {
      remember(cmd);
      return;
    }

    // 粘贴的多行代码：整体执行（不进入逐行续行状态；回显由 runREPL 统一处理）
    if (cmd.includes('\n')) {
      const full = [...pendingLines.value, cmd].join('\n');
      pendingLines.value = [];
      remember(full);
      await runStatement(full);
      return;
    }

    const trimmed = cmd.trim();
    // 进入续行模式：首个未闭合语句
    if (pendingLines.value.length === 0 && isUnclosed(trimmed)) {
      pendingLines.value = [trimmed];
      opts.onLog('input', `>>> ${trimmed}`);
      return;
    }
    // 续行中：仍未闭合 → 继续累积
    if (pendingLines.value.length > 0 && isUnclosed(trimmed)) {
      pendingLines.value.push(trimmed);
      opts.onLog('input', `... ${trimmed}`);
      return;
    }
    // 续行闭合 / 普通单行：执行（回显由 runREPL 统一处理）
    const full = pendingLines.value.length > 0 ? [...pendingLines.value, trimmed].join('\n') : trimmed;
    pendingLines.value = [];
    remember(full);
    await runStatement(full);
  };

  // 回车执行（输入法组合期间的回车用于选词，不执行）
  const handleEnter = (e: KeyboardEvent) => {
    if (e.isComposing) return;
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing) return;
    // Esc 取消续行模式（丢弃已输入的多行缓冲）
    if (e.key === 'Escape' && pendingLines.value.length > 0) {
      pendingLines.value = [];
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowUp') {
      if (historyIndex.value > 0) {
        historyIndex.value--;
        input.value = history.value[historyIndex.value] || '';
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex.value < history.value.length - 1) {
        historyIndex.value++;
        input.value = history.value[historyIndex.value] || '';
      } else {
        historyIndex.value = history.value.length;
        input.value = '';
      }
    }
  };

  // 粘贴多行代码：input 元素会丢弃换行符，须拦截并手动置入（整体执行走 submit 的多行分支）
  const handlePaste = (e: ClipboardEvent) => {
    const pasted = e.clipboardData?.getData('text');
    if (pasted && pasted.includes('\n')) {
      e.preventDefault();
      input.value = pasted.replace(/\r\n/g, '\n');
      submit();
    }
  };

  return { input, prompt, isContinuation, submit, handleEnter, handleKeyDown, handlePaste };
};
