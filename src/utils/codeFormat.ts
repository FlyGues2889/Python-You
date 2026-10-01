// 轻量代码格式化：只做「运算符两侧补空格」这类安全调整，不改动代码结构。
//
// 三条硬规则：
//   1. 行首缩进原样保留 —— Python 靠缩进划分代码块，丢了缩进等于把代码改坏；
//   2. 字符串与注释里的内容一个字都不动 —— 单行字符串在行内识别，多行字符串（docstring）
//      跨行跟踪状态，否则字符串里的 = : , 也会被加空格，悄悄改变程序输出；
//   3. 先按词法切成 token 再决定空格 —— 逐字符正则替换过不了这三关：
//        · 连写符号会被拆散（-> 变 - >、:= 变 : =、1e-6 变 1e - 6），直接变成语法错误；
//        · 一元运算符会被当成二元（a = -1 变 a = - 1、def f(**kw) 变 def f(** kw)）；
//        · 调用与下标里的 = 会被加空格（f(a=1) 变 f(a = 1)），不符合 Python 惯例。

/** 行首缩进（空格/制表符） */
const leadingIndent = (line: string): string => line.match(/^[ \t]*/)?.[0] ?? '';

/* ==================== 词法切分 ==================== */

type TokenKind = 'name' | 'number' | 'string' | 'comment' | 'op' | 'open' | 'close' | 'sep' | 'colon' | 'dot';

interface Token {
  kind: TokenKind;
  text: string;
}

/** 这些关键字右侧的 - * ** ~ 等是一元运算符；True / False / None 是值，不算在内 */
const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
  'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

/** 长运算符排前面保证最长匹配：-> 不能被拆成 - 和 >，**= 不能被拆成 ** 和 = */
const OPERATORS = [
  '**=', '//=', '>>=', '<<=', '->', '**', '//', '<<', '>>', '<=', '>=', '==', '!=',
  '+=', '-=', '*=', '/=', '%=', '@=', '&=', '|=', '^=',
  '+', '-', '*', '/', '%', '@', '&', '|', '^', '~', '<', '>', '=',
];

const isDigit = (c: string) => c >= '0' && c <= '9';
// Python 标识符按 PEP 3131 支持 Unicode 字母（中文变量名合法）：只认 ASCII 会把中文标识符
// 拆成运算符 token，`变量 in 列表` 被排成 `变量in 列表`，直接变成语法错误
const IDENT_START = /[\p{ID_Start}_]/u;
const IDENT_CONTINUE = /[\p{ID_Continue}]/u;
const isIdentStart = (c: string) => IDENT_START.test(c);
const isIdentChar = (c: string) => IDENT_CONTINUE.test(c);

/** 数字字面量整体识别：1e-6、0x1f、1_000、3.14j 都不能被运算符规则拆开 */
const matchNumber = (line: string, i: number): string => {
  const rest = line.slice(i);
  const based = /^0[xX][0-9a-fA-F_]+|^0[oO][0-7_]+|^0[bB][01_]+/.exec(rest);
  if (based) return based[0];
  return /^(?:\d[\d_]*(?:\.[\d_]*)?|\.[\d_]+)(?:[eE][+-]?\d[\d_]*)?[jJ]?/.exec(rest)?.[0] ?? rest[0];
};

/**
 * f-string 的替换字段：从 `{` 之后跳到配对的 `}` 之后。
 * 字段里可以出现与外侧相同的引号（PEP 701，Python 3.12+），必须按嵌套字符串整体跳过，
 * 否则 `f"{"a" + "b"}"` 会被当成「字符串在第一个 `"` 处结束」，后面的内容被当代码加空格。
 */
const skipReplacementField = (line: string, i: number): number => {
  let depth = 1;
  let k = i;
  while (k < line.length && depth > 0) {
    const ch = line[k];
    if (ch === '{') { depth++; k++; continue; }
    if (ch === '}') { depth--; k++; continue; }
    const nested = matchString(line, k);
    if (nested) { k += nested.text.length; continue; }
    k++;
  }
  return k;
};

/**
 * 从 i 起匹配字符串字面量（含 f / r / b / rb 前缀）。
 * 返回 null 表示这里不是字符串；openTriple 非空表示这行的多行字符串还没闭合，
 * 由上层据此判断后续行是否落在字符串内部（单引号串不能跨行，未闭合也不影响后续行）。
 */
const matchString = (line: string, i: number): { text: string; openTriple: string | null } | null => {
  let j = i;
  while (j < line.length && /[rRbBuUfF]/.test(line[j])) j++;
  const quote = line[j];
  if (quote !== '"' && quote !== "'") return null;
  const fString = /[fF]/.test(line.slice(i, j));
  if (line.startsWith(quote.repeat(3), j)) {
    const end = line.indexOf(quote.repeat(3), j + 3);
    return end === -1
      ? { text: line.slice(i), openTriple: quote }
      : { text: line.slice(i, end + 3), openTriple: null };
  }
  let k = j + 1;
  while (k < line.length) {
    const ch = line[k];
    if (ch === '\\') { k += 2; continue; }
    if (ch === quote) return { text: line.slice(i, k + 1), openTriple: null };
    // f-string 的替换字段：{{ / }} 是转义，单个 { 则整段跳过（含字段内嵌套的同种引号）
    if (fString && ch === '{') {
      if (line[k + 1] === '{') { k += 2; continue; }
      k = skipReplacementField(line, k + 1);
      continue;
    }
    if (fString && ch === '}' && line[k + 1] === '}') { k += 2; continue; }
    k++;
  }
  return { text: line.slice(i), openTriple: null };
};

/** 把一行代码（不含行首缩进）切成 token；注释是最后一个 token */
const scanLine = (line: string): { tokens: Token[]; openTriple: string | null } => {
  const tokens: Token[] = [];
  let openTriple: string | null = null;
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    // \r 是 CRLF 的行尾残留，按空白跳过：当运算符处理会往行尾补一个空格
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '#') { tokens.push({ kind: 'comment', text: line.slice(i) }); break; }
    const str = matchString(line, i);
    if (str) {
      tokens.push({ kind: 'string', text: str.text });
      if (str.openTriple) openTriple = str.openTriple;
      i += str.text.length;
      continue;
    }
    if (line.startsWith('...', i)) { tokens.push({ kind: 'name', text: '...' }); i += 3; continue; }
    if (isDigit(c) || (c === '.' && isDigit(line[i + 1] ?? ''))) {
      const num = matchNumber(line, i);
      tokens.push({ kind: 'number', text: num });
      i += num.length;
      continue;
    }
    if (isIdentStart(c)) {
      let j = i;
      while (j < line.length && isIdentChar(line[j])) j++;
      tokens.push({ kind: 'name', text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '(' || c === '[' || c === '{') { tokens.push({ kind: 'open', text: c }); i++; continue; }
    if (c === ')' || c === ']' || c === '}') { tokens.push({ kind: 'close', text: c }); i++; continue; }
    if (c === ',' || c === ';') { tokens.push({ kind: 'sep', text: c }); i++; continue; }
    if (c === ':') {
      if (line[i + 1] === '=') { tokens.push({ kind: 'op', text: ':=' }); i += 2; continue; }
      tokens.push({ kind: 'colon', text: ':' });
      i++;
      continue;
    }
    if (c === '.') { tokens.push({ kind: 'dot', text: '.' }); i++; continue; }
    const op = OPERATORS.find((o) => line.startsWith(o, i));
    tokens.push({ kind: 'op', text: op ?? c });
    i += (op ?? c).length;
  }
  return { tokens, openTriple };
};

/* ==================== 排版 ==================== */

/** 能作为「左操作数」结尾的 token：是，则紧跟的运算符为二元运算，否则为一元 */
const endsOperand = (t: Token | null): boolean =>
  !!t && (t.kind === 'number' || t.kind === 'string' || t.kind === 'close' ||
    (t.kind === 'name' && !KEYWORDS.has(t.text)));

/** 相邻两个 token 都是「词」（名字 / 数字 / 字符串 / 右括号）时必须留空格 */
const needsWordSpace = (t: Token | null): boolean =>
  !!t && (t.kind === 'name' || t.kind === 'number' || t.kind === 'string' || t.kind === 'close');

const renderTokens = (tokens: Token[], continues = false): string => {
  let out = '';
  let prev: Token | null = null;
  let prevUnary = false;    // 上一个输出是一元运算符，要贴住右侧操作数（-1 / *args / **kwargs）
  let pendingSpace = false; // 上一个输出要求右侧留空格（二元运算符 / 逗号 / 普通冒号）
  const frames: { bracket: string; sawColon: boolean }[] = [];

  for (const tok of tokens) {
    if (tok.kind === 'comment') {
      // 行内注释统一空两格起（Black 惯例）；整行注释保持行首原样
      out += (out ? '  ' : '') + tok.text;
      break;
    }

    let space = false;
    let unary = false;

    if (tok.kind === 'op') {
      // 反斜杠续行的行首运算符是上一行表达式的延续，不是一元运算符（`\` 换行后 `+ c` 要保持空格）
      unary = !endsOperand(prev) && !(continues && !prev);
      // 关键字后面的一元运算符仍要空格（return -1、else -c）
      space = unary ? pendingSpace || prev?.kind === 'name' : true;
    } else if (tok.kind === 'open') {
      // 调用与下标紧跟：print( / a[；其他位置（in / else / = 之后）留空格
      space = pendingSpace || (!endsOperand(prev) && !!prev && prev.kind !== 'open' && prev.kind !== 'dot' && !prevUnary);
    } else if (tok.kind === 'name' || tok.kind === 'number' || tok.kind === 'string') {
      space = pendingSpace || (needsWordSpace(prev) && !prevUnary);
    } else if (tok.kind === 'dot') {
      // 纯整数后的 `.` 必须留空格：`1 .real` 去掉空格会变成非法的 `1.real`
      space = prev?.kind === 'number' && /^\d[\d_]*$/.test(prev.text);
    }

    // 调用与下标里的 = 是关键字参数 / 默认值，不加空格（f(a=1)）；
    // 同一层括号内出现过冒号说明是带注解的默认值，仍按赋值处理（def f(a: int = 1)）
    const frame = frames[frames.length - 1];
    const kwarg = tok.kind === 'op' && tok.text === '=' && !!frame && !frame.sawColon &&
      (frame.bracket === '(' || frame.bracket === '[');
    if (kwarg) { space = false; }

    if (space && out) out += ' ';
    out += tok.text;

    if (tok.kind === 'sep') pendingSpace = true;
    else if (tok.kind === 'colon') {
      const slice = frame?.bracket === '[';
      if (frame) frame.sawColon = true;
      pendingSpace = !slice; // 切片冒号两侧不留空格：a[1:2]
    } else if (tok.kind === 'open') {
      frames.push({ bracket: tok.text, sawColon: false });
      pendingSpace = false;
    } else if (tok.kind === 'close') {
      frames.pop();
      pendingSpace = false;
    } else if (tok.kind === 'op') {
      pendingSpace = !unary && !kwarg;
    } else {
      pendingSpace = false;
    }

    prev = tok;
    prevUnary = tok.kind === 'op' && unary;
  }

  return out;
};

/** 格式化一段代码：切分后重排空格 */
const formatCode = (code: string, continues = false): { text: string; openTriple: string | null } => {
  const scan = scanLine(code);
  return { text: renderTokens(scan.tokens, continues), openTriple: scan.openTriple };
};

/** 格式化整篇代码（保留缩进与字符串/注释内容） */
export const formatCodeText = (text: string): string => {
  let triple: string | null = null;
  let prevLineContinues = false; // 上一行以反斜杠结尾：本行是同一表达式的延续
  return text
    .split('\n')
    .map((rawLine) => {
      // CRLF 的行尾 \r 不参与排版，但要原样带回去，否则格式化一次就把整个文件改写成 LF
      const eol = rawLine.endsWith('\r') ? '\r' : '';
      const line = eol ? rawLine.slice(0, -1) : rawLine;
      if (triple) {
        // 多行字符串内部：原样保留；遇到结束引号后，其后可能还有代码
        prevLineContinues = false;
        const marker = triple.repeat(3);
        const end = line.indexOf(marker);
        if (end === -1) return rawLine;
        const head = line.slice(0, end + marker.length);
        const rest = formatCode(line.slice(end + marker.length));
        triple = rest.openTriple; // 闭合标记之后可能又开了一段多行字符串
        return (rest.text ? head + ' ' + rest.text : head) + eol;
      }
      const indent = leadingIndent(line);
      const body = formatCode(line.slice(indent.length), prevLineContinues);
      prevLineContinues = /\\$/.test(line.trimEnd());
      triple = body.openTriple;
      return indent + body.text + eol;
    })
    .join('\n');
};
