// 测验代码题判分器（B-7）：从 App.vue 抽离为独立模块，供判分链路与回归测试复用。
// 按“行序列”规范化比较：两种运行引擎（Pyodide / 本机 / 演示模式）输出格式不同，
// 拆行、去空行、去首尾空格后逐行比对，不考察 \n 转义写法。

export interface GradingResult {
  passed: boolean;
  expectedLines: string[];
  actualLines: string[];
}

export function normalizeLines(chunks: string[]): string[] {
  const lines: string[] = [];
  for (const chunk of chunks) {
    const parts = chunk.replace(/\r\n/g, '\n').split('\n');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length > 0) lines.push(trimmed);
    }
  }
  return lines;
}

export function gradeOutput(actualChunks: string[], expectedText: string): GradingResult {
  const actualLines = normalizeLines(actualChunks);
  const expectedLines = normalizeLines([expectedText]);
  const passed =
    actualLines.length === expectedLines.length &&
    actualLines.every((line, i) => line === expectedLines[i]);
  return { passed, expectedLines, actualLines };
}
