// 输出契约收口（ARCHITECTURE.md §2.3 / 阶段 2）：把「type + 文本 → 展示语义」收敛成单表。
// 输出终端（TerminalPanel.vue）与 REPL（REPLConsole.vue）共用同一套判定，保证同一组输出事件
// 在两个终端渲染出同一语义；图片 / 可折叠 / partial 尾行也在这里判定，两端不再各写一套。
//
// 语义类名与两端 CSS 的约定：log-error / log-warning / log-system / log-stdout / log-input。
// 类名只表达语义，具体颜色由各终端主题变量决定（REPL 补的 system/warning 与输出终端同色）。
import type { ConsoleOutput } from '../types';

export type LogSemanticClass = 'log-error' | 'log-warning' | 'log-system' | 'log-stdout' | 'log-input';

/**
 * type + 文本 → 语义类。文本嗅探只作兜底（引擎侧已尽量把语义放进 type，但历史上
 * [ERROR] / [WARN] / [INFO] / ▶ 等前缀文本一直按此着色，行为保持不变）；两端必须返回同一结果。
 */
export const semanticClassOf = (out: ConsoleOutput): LogSemanticClass => {
  const text = out.text || '';
  if (
    out.type === 'error' ||
    out.type === 'stderr' ||
    text.includes('[ERROR]') ||
    text.includes('Error:') ||
    text.includes('Traceback')
  ) {
    return 'log-error';
  }
  if (out.type === 'warning' || text.includes('[WARN]') || text.includes('Warning:')) {
    return 'log-warning';
  }
  if (out.type === 'system' || out.type === 'info' || text.includes('[INFO]') || text.startsWith('▶')) {
    return 'log-system';
  }
  if (out.type === 'input') {
    return 'log-input';
  }
  return 'log-stdout';
};

/** 是否需要可折叠容器（完整 traceback 详情，FR-4.5：默认折叠、摘要行常显） */
export const isCollapsible = (out: ConsoleOutput): boolean => !!out.collapsible;

/** 是否图片条目（渲染 <img> 而不是文本；图片条目的 text 为空串） */
export const isImage = (out: ConsoleOutput): boolean => !!out.image;

/** partial 尾行判定：该行仍未结束（程序提示串停在行尾，输入接在这行后面） */
export const isOpenTail = (out: ConsoleOutput): boolean => !!out.partial;
