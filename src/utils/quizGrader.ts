// 测验代码题判分器（B-7）：从 App.vue 抽离为独立模块，供判分链路与回归测试复用。
// 按“行序列”规范化比较：三种运行引擎（Pyodide / 本机 / 演示模式）输出格式不同，
// 拆行、去空行、去首尾空格后逐行比对，不考察 \n 转义写法。

/** 期望输出的匹配方式（B-7）：默认严格相等，另支持多组答案、包含、正则 */
export type OutputExpectation =
  | string
  | string[]
  | { mode: 'include'; lines: string[] }
  | { mode: 'regex'; pattern: string; flags?: string };

export type GradingMode = 'exact' | 'multi-case' | 'include' | 'regex';

export interface GradingResult {
  passed: boolean;
  /** 命中的匹配方式，便于失败反馈里说明判分标准 */
  mode: GradingMode;
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

export function gradeOutput(actualChunks: string[], expected: OutputExpectation): GradingResult {
  const actualLines = normalizeLines(actualChunks);

  // 多组可接受答案：任一命中即通过
  if (Array.isArray(expected)) {
    let fallback: string[] = [];
    for (const candidate of expected) {
      const result = gradeOutput(actualChunks, candidate);
      if (result.passed) return { ...result, mode: 'multi-case' };
      if (fallback.length === 0) fallback = result.expectedLines;
    }
    return { passed: false, mode: 'multi-case', expectedLines: fallback, actualLines };
  }

  if (typeof expected === 'object') {
    // 正则：对归一化后的实际输出整体匹配
    if (expected.mode === 'regex') {
      let passed = false;
      try {
        passed = new RegExp(expected.pattern, expected.flags ?? 'm').test(actualLines.join('\n'));
      } catch {
        passed = false;
      }
      return { passed, mode: 'regex', expectedLines: [`/${expected.pattern}/`], actualLines };
    }
    // 包含：期望的每一行按顺序出现在实际输出中（允许中间夹杂其他行）
    const wanted = normalizeLines([expected.lines.join('\n')]);
    let cursor = 0;
    for (const line of actualLines) {
      if (cursor < wanted.length && line === wanted[cursor]) cursor++;
    }
    return { passed: cursor === wanted.length, mode: 'include', expectedLines: wanted, actualLines };
  }

  // 默认：行序列严格相等
  const expectedLines = normalizeLines([String(expected)]);
  const passed =
    actualLines.length === expectedLines.length &&
    actualLines.every((line, i) => line === expectedLines[i]);
  return { passed, mode: 'exact', expectedLines, actualLines };
}
