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
  // 按 \r?\n 切，并逐行 trimEnd：上游（本机引擎的分段读取与汇流拼接）不保证行尾干净——
  // 末行可能只剩一个裸 \r，而 JS 的 `.` 匹配不到 \r，(.+)$ 就会整体匹配失败、摘要退化成 null。
  // 不依赖上游一定剥干净，这里再兜一道。
  const lines = text.split(/\r?\n/).map((line) => line.trimEnd());
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
  const TRACEBACK_START = /^(Traceback \(most recent call last\):|\s+File ")/;
  // REPL 子进程的提示符写在 stderr 上，可能与 traceback 首行粘成同一片段
  //（`>>> Traceback (most recent call last):`）。只在提示符后面确实跟着 traceback 时才剥，
  // 免得把 stderr 里正常的 `>>> ` 前缀文本（例如 doctest 片段）改掉。
  const stripPrompt = (line: string) => {
    const m = /^(?:>>>|\.\.\.)[ \t]+/.exec(line);
    return m && TRACEBACK_START.test(line.slice(m[0].length)) ? line.slice(m[0].length) : line;
  };
  const push = (raw: string, partial = false) => {
    const text = stripPrompt(raw);
    if (!buffer && !TRACEBACK_START.test(text)) {
      // 未结束的行按 partial 实时送出（stderr 里的提示串同样要立刻可见）
      onOutput({
        id: uid(),
        type: 'stderr',
        text: partial ? text : text + '\n',
        partial: partial || undefined,
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }
    buffer += partial ? text : text + '\n';
    // 只在片段收尾时判定：半截的异常行也能匹配摘要正则，会提前 flush 并把后面的内容重复输出
    if (!partial && extractErrorSummary(buffer)) flush();
  };
  return { push, flush };
};
