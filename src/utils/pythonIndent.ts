// 编辑器缩进逻辑：语法树查询 + 行级缩进增删。
//
// 为什么用语法树：Python 的缩进是语法的一部分，一行该缩进几格只能由语法结构决定
// （块体、括号续行、else/except 回归上一级、多行字符串内部不动）。Lezer 是容错解析器，
// 缩进已经写坏的代码照样出树，所以「多一个空格 / 少一个空格」也能被修正 ——
// 这是 Black / Ruff 这类要求源码先合法的格式化器做不到的。
//
// 编辑器本体是 textarea + 高亮覆盖层，不挂 CodeMirror 的 EditorView：
// 这里只用它的 headless 部分（EditorState 装文档与缩进单元、getIndentation 查列、
// indentRange 整篇重排），不涉及 DOM，也不引入编辑器视图层。

import { EditorState } from '@codemirror/state';
import { IndentContext, getIndentation, indentRange, indentUnit, syntaxTree } from '@codemirror/language';
import { pythonLanguage } from '@codemirror/lang-python';

/** 同一份文档只建一次解析状态：一次按键里可能查多个位置，重复建会重复解析 */
let cache: { doc: string; tabSize: number; state: EditorState } | null = null;

const stateFor = (doc: string, tabSize: number): EditorState => {
  if (cache && cache.doc === doc && cache.tabSize === tabSize) return cache.state;
  const state = EditorState.create({
    doc,
    extensions: [pythonLanguage, indentUnit.of(' '.repeat(tabSize))],
  });
  cache = { doc, tabSize, state };
  return state;
};

/** pos 处应有的缩进列数（0 基）；null 表示该行不参与缩进（多行字符串内部） */
const indentColumnAt = (doc: string, pos: number, tabSize: number): number | null =>
  getIndentation(new IndentContext(stateFor(doc, tabSize)), Math.max(0, Math.min(pos, doc.length)));

/**
 * 光标是否处于字符串字面量内（自动补空格与补全据此避让）。
 * 交给语法树判断：注释里的撇号、docstring、f-string 嵌套引号都不会误判
 * （逐字符扫描会把 `# don't` 里的撇号当成字符串开头，从而误判整行之后都是字符串）。
 * 未闭合的字符串（正在输入）按字符串内处理：Lezer 会把它解析到文档末尾。
 * 已知边界：光标正好停在文档末尾的**已闭合**字符串之后时，会当作字符串内，
 * 直到光标离开文档末尾为止。
 */
export const isInsideStringAt = (doc: string, pos: number, tabSize: number): boolean => {
  if (pos <= 0) return false;
  const tree = syntaxTree(stateFor(doc, tabSize));
  const start = tree.resolveInner(Math.min(pos, doc.length) - 1, 1);
  for (let node: typeof start | null = start; node; node = node.parent) {
    if (node.name === 'String' || node.name === 'FormatString') return node.to >= pos;
  }
  return false;
};

/**
 * 回车后新行应有的缩进列数。
 * 必须在「换行尚未插入」的文档上查询：换行若已存在，末尾空行会命中语法树里
 * 「块尾空行不算块内」的规则而返回上一级（CM 自己用 simulateBreak 模拟断行，同理）。
 * 查不到缩进（正处于多行字符串内部）时沿用本行缩进。
 */
export const indentForNewLine = (doc: string, pos: number, tabSize: number): number => {
  const column = indentColumnAt(doc, pos, tabSize);
  if (column !== null) return column;
  const line = doc.slice(doc.lastIndexOf('\n', pos - 1) + 1, pos);
  return /^ */.exec(line)?.[0].length ?? 0;
};

/**
 * 字符串与注释覆盖的区段（升序，互不重叠）。
 * 词法级检查（中文标点、括号配对）整段跳过它们即可，不必自己跟踪引号状态。
 */
export const stringAndCommentRanges = (doc: string, tabSize: number): { from: number; to: number }[] => {
  const ranges: { from: number; to: number }[] = [];
  syntaxTree(stateFor(doc, tabSize)).iterate({
    enter: (node) => {
      if (node.name === 'String' || node.name === 'FormatString' || node.name === 'Comment') {
        ranges.push({ from: node.from, to: node.to });
        return false;
      }
      return undefined;
    },
  });
  return ranges.sort((a, b) => a.from - b.from);
};

/** 整篇按语法树重排缩进（字符串内容与注释文本不受影响，空行归零） */
export const reindentText = (doc: string, tabSize: number): string => {
  // CodeMirror 的 Text 按 \r\n 分行、toString() 回来只剩 \n：统一 CRLF 的文件重排后要把行尾还原，
  // 否则在 Windows 上格式化一次就把整个文件的行尾改写掉
  const crlf = doc.includes('\r\n') && !doc.replace(/\r\n/g, '').includes('\n');
  const source = crlf ? doc.replace(/\r\n/g, '\n') : doc;
  const state = stateFor(source, tabSize);
  const edits: { from: number; to: number; insert: string }[] = [];
  indentRange(state, 0, state.doc.length).iterChanges((fromA, toA, _fromB, _toB, inserted) => {
    edits.push({ from: fromA, to: toA, insert: inserted.toString() });
  });
  // 反斜杠续行的缩进语法树给不出（上游 CodeMirror 同样如此，续行怎么缩进都合法），
  // 保留用户原本的对齐，别把它拍到列首
  const keep = edits.filter((e) => source[e.from - 2] !== '\\');
  const result = state.update({ changes: state.changes(keep) }).state.doc.toString();
  return crlf ? result.replace(/\n/g, '\r\n') : result;
};

/* ==================== 行级缩进增删 ==================== */

export interface IndentEditResult {
  content: string;
  start: number;
  end: number;
}

/** 选区覆盖到的整行的起始偏移；选区末尾正好停在下一行列首时，该行不算被选中 */
const selectedLineStarts = (doc: string, start: number, end: number): number[] => {
  let from = doc.lastIndexOf('\n', start - 1) + 1;
  const to = end > start && doc[end - 1] === '\n' ? end - 1 : end;
  const starts: number[] = [];
  for (;;) {
    starts.push(from);
    const next = doc.indexOf('\n', from);
    if (next === -1 || next >= to) break;
    from = next + 1;
  }
  return starts;
};

/**
 * 端点映射到编辑后的文档（按原始坐标一次算完，不能逐个编辑折叠——
 * 前一个编辑会改变后一个编辑的坐标基准）。
 * 缩进：停在行首的端点跟着缩进右移；反缩进：落在被删空白里的端点贴到行首。
 */
const mapEndpoint = (p: number, edits: { at: number; remove: number; insert: string }[]): number => {
  let shift = 0;
  for (const ed of edits) {
    if (ed.at < p) {
      // 端点落在被删掉的空白里：贴到该行行首，用「此前编辑累积的位移」换算
      //（必须先判断再累加，否则会把这条编辑自己的位移扣两次，算出负值）
      if (ed.remove > 0 && p < ed.at + ed.remove) return ed.at + shift;
      shift += ed.insert.length - ed.remove;
    } else if (ed.at === p && ed.remove === 0) {
      shift += ed.insert.length;
    } else {
      break; // 编辑按行升序，后面的都在端点之后
    }
  }
  return p + shift;
};

/** 逐行套用编辑并同步映射选区端点 */
const applyLineEdits = (
  doc: string,
  edits: { at: number; remove: number; insert: string }[],
  start: number,
  end: number
): IndentEditResult => {
  let content = '';
  let cursor = 0;
  for (const ed of edits) {
    content += doc.slice(cursor, ed.at) + ed.insert;
    cursor = ed.at + ed.remove;
  }
  return { content: content + doc.slice(cursor), start: mapEndpoint(start, edits), end: mapEndpoint(end, edits) };
};

/** 缩进：光标所在行或选中的每行各加一级 */
export const indentLines = (doc: string, start: number, end: number, tabSize: number): IndentEditResult => {
  const unit = ' '.repeat(tabSize);
  const collapsed = start === end;
  const caretLine = doc.lastIndexOf('\n', start - 1) + 1;
  const edits = selectedLineStarts(doc, start, end)
    // 空行只在光标所在行补缩进（方便直接开始写），块选时不制造行尾空白
    .filter((at) => {
      const lineEnd = doc.indexOf('\n', at);
      const text = doc.slice(at, lineEnd === -1 ? doc.length : lineEnd);
      return text.trim() !== '' || (collapsed && at === caretLine);
    })
    .map((at) => ({ at, remove: 0, insert: unit }));
  return applyLineEdits(doc, edits, start, end);
};

/** 反缩进：光标所在行或选中的每行各去掉一级（不足一级就清掉行首空白） */
export const outdentLines = (doc: string, start: number, end: number, tabSize: number): IndentEditResult => {
  const edits = selectedLineStarts(doc, start, end).flatMap((at) => {
    const line = doc.slice(at);
    if (line.startsWith('\t')) return [{ at, remove: 1, insert: '' }];
    const spaces = /^ */.exec(line)?.[0].length ?? 0;
    return spaces ? [{ at, remove: Math.min(spaces, tabSize), insert: '' }] : [];
  });
  return applyLineEdits(doc, edits, start, end);
};

/**
 * 退格：光标落在行首空白里时删掉一整级缩进（对齐到 tabSize 的整数倍）。
 * 返回 null 表示不接管，交回原生删除。
 */
export const backspaceIndent = (
  doc: string,
  start: number,
  end: number,
  tabSize: number
): IndentEditResult | null => {
  if (start !== end) return null;
  const lineStart = doc.lastIndexOf('\n', start - 1) + 1;
  const before = doc.slice(lineStart, start);
  if (!before || !/^ +$/.test(before)) return null;
  const remove = before.length % tabSize || tabSize;
  const at = start - remove;
  return { content: doc.slice(0, at) + doc.slice(start), start: at, end: at };
};
