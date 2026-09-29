// FR-4.5：从 Python traceback 文本提取面向初学者的错误摘要（错误类型 + 消息 + 最近的文件/行号），
// 摘要置顶展示，完整 traceback 作为可折叠详情保留在下方。
//
// 放在独立模块里：Pyodide 路径（pythonRunner）与本机引擎路径（nativePython）共用同一套行为，
// 而 pythonRunner 依赖 nativePython，逻辑写在任一侧都会形成循环依赖。
import type { ConsoleOutput } from '../types';
import { t } from './i18n';
import { uid } from './id';

// 异常名可以是 `json.decoder.JSONDecodeError` 这样的点分模块路径，也可能不以 Error 结尾
// （KeyboardInterrupt / SystemExit / StopIteration），因此不限制后缀
const EXCEPTION_LINE = /^([A-Za-z_][A-Za-z0-9_.]*)\s*:\s*(.+)$/;
// 不带消息的裸异常名：只有在确实存在 traceback 结构时才认，避免把普通输出当成异常
const EXCEPTION_BARE = /^([A-Za-z_][A-Za-z0-9_.]*)$/;

/** 提取错误摘要；没有 traceback 结构时返回 null */
export function extractErrorSummary(text: string): string | null {
  // 按 \r?\n 切：JS 正则里 \r 也是行终止符，行尾残留的 \r 会让 (.+)$ 匹配失败
  const lines = text.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const withMessage = lines[i].match(EXCEPTION_LINE);
    const bare = withMessage ? null : lines[i].match(EXCEPTION_BARE);
    if (!withMessage && !bare) continue;
    let loc = '';
    for (let j = i - 1; j >= 0; j--) {
      const lm = lines[j].match(/File "([^"]+)".*line (\d+)/);
      if (lm) {
        const fname = lm[1].split(/[\\/]/).pop() || lm[1];
        loc = `（${fname} 第 ${lm[2]} 行）`;
        break;
      }
    }
    if (bare && !loc) return null;
    const name = (withMessage || bare)![1];
    return `${name}${withMessage ? `：${withMessage[2]}` : ''}${loc}`;
  }
  return null;
}

/** 输出错误：摘要置顶（可读），完整 traceback 原文作为可折叠详情保留在下方 */
export function emitError(onOutput: (out: ConsoleOutput) => void, raw: string) {
  const summary = extractErrorSummary(raw);
  onOutput({
    id: uid(),
    type: 'error',
    text: summary ? `${t('errorSummaryPrefix')}${summary}` : raw,
    timestamp: new Date().toLocaleTimeString(),
  });
  if (summary && summary !== raw) {
    onOutput({
      id: uid(),
      type: 'error',
      text: raw,
      collapsible: true,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
}

/**
 * 本机引擎的 stderr 汇流：traceback 要攒完整段再交出去——摘要必须排在完整 traceback 之前，
 * 逐行直出就没法把摘要插到上面。普通 stderr 仍然逐行直出，不影响长脚本的实时输出。
 */
export const createStderrSink = (onOutput: (out: ConsoleOutput) => void) => {
  let buffer = '';
  const flush = () => {
    if (!buffer) return;
    emitError(onOutput, buffer.replace(/\n$/, ''));
    buffer = '';
  };
  const push = (text: string) => {
    if (!buffer && !/^(Traceback \(most recent call last\):|\s+File ")/.test(text)) {
      onOutput({ id: uid(), type: 'stderr', text: text + '\n', timestamp: new Date().toLocaleTimeString() });
      return;
    }
    buffer += text + '\n';
    // 攒到异常末行（能提取出摘要）就整段输出
    if (extractErrorSummary(buffer)) flush();
  };
  return { push, flush };
};
