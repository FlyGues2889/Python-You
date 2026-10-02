// 终端的行模型：把流式输出片段（含「正在写的那一行」）还原成显示行，并记录键盘回显的插入位置。
//
// 为什么需要：input("Test: ") 的提示串不带换行，真实终端会立刻显示它、把光标停在后面；
// 用户输入接在同一行上。若只在换行时才输出，提示会等到用户回车之后才出现，交互顺序就反了。
import type { ConsoleOutput } from '../types';

/** 与 nativePython 的 IMG_PREFIX 同值：图片标记行很长（base64），不能按片段显示 */
export const IMG_MARKER_PREFIX = '@@PYSTUDIO_IMG@@';

/** 一行在终端里的显示形态 */
export interface DisplayLine {
  /** 归属的日志条目 id（合并多段时取第一段） */
  key: string;
  out: ConsoleOutput;
  /** 该行目前的完整文本（多段拼接结果） */
  text: string;
  /** 该行还没结束：光标就停在这里 */
  open: boolean;
}

/** 把日志条目合并成显示行：连续的 partial 片段属于同一行，直到某段以完整行收尾 */
export const toDisplayLines = (outputs: ConsoleOutput[]): DisplayLine[] => {
  const lines: DisplayLine[] = [];
  for (const out of outputs) {
    const last = lines[lines.length - 1];
    const canMerge =
      last?.open && last.out.type === out.type && !last.out.image && !out.image && !out.collapsible;
    if (canMerge && out.partial) {
      // 同一开放行的继续片段：拼进当前行，行保持 open
      last.text += out.text;
      continue;
    }
    if (canMerge && !out.partial) {
      // 开放行被完整行终结：就地补完（例如 input 提示串 + 用户回显变成同一行）。
      // 不能另起一行——原开放行还在列表里，同一段文本会显示两次（"1" 变成两行 "1"）
      last.text += out.text;
      last.open = false;
      continue;
    }
    lines.push({ key: out.id, out, text: out.text, open: !!out.partial });
  }
  return lines;
};

/**
 * 流式片段 → 完整行 / 待显示的部分行。
 *
 * 片段约定（与本机引擎 python.rs 的 drain_segments 一致）：
 * - partial = false：这段文本以行尾结束（文本本身不含换行符），末尾那段就是完整行；
 * - partial = true：这段还没结束（正在写的这一行），只送出没显示过的增量。
 *
 * 已作 partial 显示过的前缀不会在整行到齐时重复送出——调用方把两次结果接起来即可。
 * 图片标记行（很长的 base64）不显示片段，等整行到齐再交给调用方识别。
 */
export const createLineAssembler = (opts: { emitPartial?: boolean } = {}) => {
  // emitPartial = false：未结束的行不往外发（REPL 的子进程提示符就是这种片段，
  // 界面上已有自己的提示符，发出来会多出一串 `>`），但仍参与拼行——整行到齐时一次性发出
  const emitPartial = opts.emitPartial !== false;
  let pending = '';
  // 当前待续行已显示过的长度：增量模式下完成时只补发剩余部分（含行尾换行——开放行需要它闭合）
  let emitted = 0;
  return {
    push(text: string, partial: boolean): { completeLines: string[]; partialText: string } {
      const combined = pending + text;
      const completeLines: string[] = [];
      let partialText = '';
      if (partial) {
        // 待续行：前面的段都是完整行；末段进 pending
        const parts = combined.split('\n');
        const last = parts.pop() ?? '';
        parts.forEach((line, i) => completeLines.push(i === 0 ? line.slice(emitted) : line));
        pending = last;
        // 前面出现过完整行：新一行从头开始计已显示长度（完成时整体补发）
        if (parts.length > 0) emitted = 0;
        if (emitPartial && !pending.startsWith(IMG_MARKER_PREFIX)) {
          partialText = pending.slice(emitted);
          // 纯累积（本段没有完整行）：推进已显示长度，下段/完成时只发增量；
          // 新一行或图片标记行：保持 emitted=0，整行到齐时一次交出
          if (parts.length === 0) emitted = pending.length;
        }
      } else {
        // 这段以行尾结束：pending+text 整体是完成行；pending 已显示的部分不再重复。
        // 无待续行：文本按 \n 切分，每段都是完整行（协议本应无 \n；出现则多出空行）。
        // 有待续行：从未显示过（emitted=0）剥掉末尾换行（调用方按整行处理）；
        // 已显示过（增量模式）保留末尾换行——开放行需要它来闭合
        if (pending === '') {
          const parts = combined.split('\n');
          const last = parts.pop() ?? '';
          parts.forEach((line, i) => completeLines.push(i === 0 ? line.slice(emitted) : line));
          completeLines.push(last.slice(emitted));
        } else if (emitted === 0) {
          let line = combined;
          if (line.endsWith('\n')) line = line.slice(0, -1);
          completeLines.push(line);
        } else {
          completeLines.push(combined.slice(emitted));
        }
        pending = '';
        emitted = 0;
      }
      return { completeLines, partialText };
    },
  };
};
