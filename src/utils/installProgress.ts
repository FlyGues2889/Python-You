// FR-5.6：pip 进度片段的识别与解析，形如 "━━━╸ 3.2/14.5 MB 2.1 MB/s eta 0:00:05" 或 "45%"。
// 这类片段只喂给后台任务指示器，不进入终端输出（否则每次刷新都是一行）。
const BYTES_RE = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(kB|MB|GB)/i;
const PERCENT_RE = /(\d{1,3})\s*%/;
const ETA_RE = /eta\s+\d+:\d{2}/;

/** 是否为 pip 进度条片段（区别于普通日志行） */
export function isInstallProgressLine(text: string): boolean {
  if (!text) return false;
  if (text.includes('━') || text.includes('╸')) return true;
  if (BYTES_RE.test(text) || ETA_RE.test(text)) return true;
  // 纯百分比片段（旧版 pip）；限制长度避免误伤普通文本
  return PERCENT_RE.test(text) && text.trim().length <= 24;
}

/** 解析百分比；有进度条但解析不出数字时返回 null（保持不确定态，不伪造进度） */
export function parseInstallProgress(text: string): number | null {
  const bytes = text.match(BYTES_RE);
  if (bytes) {
    const done = parseFloat(bytes[1]);
    const total = parseFloat(bytes[2]);
    if (total > 0) return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }
  const pct = text.match(PERCENT_RE);
  if (pct) {
    const v = parseInt(pct[1], 10);
    if (v >= 0 && v <= 100) return v;
  }
  return null;
}
