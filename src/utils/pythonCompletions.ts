// 轻量 Python 代码补全数据源（方案 A：词法级提示，无类型分析）
// 提供：关键字 / 内置函数 / 标准库模块 / 常用代码片段 / 工作区标识符
import type { FSItem } from '../types';
import { t } from './i18n';

export interface CompletionItem {
  label: string; // 展示文本
  insertText: string; // 插入文本
  kind: 'keyword' | 'builtin' | 'module' | 'identifier' | 'snippet';
  detail?: string; // 右侧说明
  caretOffset?: number; // 补全后光标相对 insertText 的位置（默认末尾）
}

const KEYWORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
  'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
  'return', 'try', 'while', 'with', 'yield'
];

const BUILTINS = [
  'abs', 'all', 'any', 'bin', 'bool', 'bytearray', 'bytes', 'callable', 'chr',
  'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate',
  'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals',
  'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass',
  'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
  'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed',
  'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super',
  'tuple', 'type', 'vars', 'zip'
];

const MODULES = [
  'math', 'random', 'json', 'datetime', 'time', 'os', 'sys', 're', 'string',
  'collections', 'functools', 'itertools', 'typing', 'io', 'pathlib', 'copy', 'struct',
  'enum', 'dataclasses', 'abc', 'ast', 'base64', 'hashlib', 'unittest', 'logging',
  'traceback', 'inspect', 'threading', 'queue', 'subprocess', 'csv', 'xml', 'urllib',
  'http', 'socket', 'sqlite3', 'tempfile', 'shutil', 'glob', 'signal', 'errno',
  'getpass', 'platform', 'types', 'weakref', 'gc',
  'matplotlib', 'numpy', 'pandas', 'scipy', 'sympy'
];

const SNIPPETS: CompletionItem[] = [
  { label: 'ifmain', insertText: 'if __name__ == "__main__":\n    pass', kind: 'snippet', detail: t('completionDetailIfMain') },
  { label: 'def', insertText: 'def name():\n    pass', kind: 'snippet', detail: t('completionDetailDef') },
  { label: 'class', insertText: 'class Name:\n    def __init__(self):\n        pass', kind: 'snippet', detail: t('completionDetailClass') },
  { label: 'for', insertText: 'for item in items:\n    ', kind: 'snippet', detail: t('completionDetailFor') },
  { label: 'if', insertText: 'if condition:\n    ', kind: 'snippet', detail: t('completionDetailIf') },
  { label: 'withopen', insertText: 'with open("file.txt", "r", encoding="utf-8") as f:\n    content = f.read()', kind: 'snippet', detail: t('completionDetailReadFile') },
  { label: 'try', insertText: 'try:\n    pass\nexcept Exception as e:\n    print(e)', kind: 'snippet', detail: t('completionDetailTry') }
];

// 从工作区所有 .py 文件里收集标识符。
// callables：def/class 定义的函数与类；names：其余 import/变量等普通标识符。
export function collectWorkspaceIdentifiers(files: FSItem[]): { names: string[]; callables: string[] } {
  const names = new Set<string>();
  const callables = new Set<string>();
  const scan = (code: string) => {
    if (!code) return;
    const reCallable = /(?:def|class)\s+([A-Za-z_]\w*)/g;
    let m: RegExpExecArray | null;
    while ((m = reCallable.exec(code))) callables.add(m[1]);
    const reName = /(?:import|from)\s+([A-Za-z_]\w*)|^([A-Za-z_]\w*)\s*=/gm;
    while ((m = reName.exec(code))) {
      if (m[1]) names.add(m[1]);
      if (m[2]) names.add(m[2]);
    }
  };
  const walk = (list: FSItem[]) => {
    for (const item of list) {
      if (item.isFolder && item.children) walk(item.children);
      else if (!item.isFolder && item.name.endsWith('.py')) scan(item.content || '');
    }
  };
  walk(files);
  return { names: Array.from(names), callables: Array.from(callables) };
}

// 判断光标位置是否处于字符串字面量内（用于避免在字符串内容里触发自动补全）
export function isInsideString(text: string, pos: number): boolean {
  let inQuote: string | null = null;
  const len = Math.min(pos, text.length);
  let i = 0;
  while (i < len) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === inQuote) inQuote = null;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    }
    i++;
  }
  return inQuote !== null;
}

// 光标前的单词范围（含字母/数字/下划线/点，点用于 module.attr 前缀）
export function getWordAt(text: string, pos: number): { word: string; start: number; end: number } {
  let start = pos;
  while (start > 0 && /[A-Za-z0-9_.]/.test(text[start - 1])) start--;
  let end = pos;
  while (end < text.length && /[A-Za-z0-9_.]/.test(text[end])) end++;
  return { word: text.slice(start, end), start, end };
}

// 依据光标前缀筛选补全项；前缀为空时返回全部（用于 Ctrl+Space 主动唤起）
export function getCompletions(
  text: string,
  pos: number,
  workspace: { names: string[]; callables: string[] }
): CompletionItem[] {
  const { word } = getWordAt(text, pos);
  const prefix = word.toLowerCase();

  const wsCallables = new Set(workspace.callables);
  const wsNames = Array.from(new Set([...workspace.names, ...workspace.callables]));
  const wsItems: CompletionItem[] = wsNames.map((id) => {
    const callable = wsCallables.has(id);
    return {
      label: id,
      insertText: callable ? `${id}()` : id,
      kind: 'identifier',
      detail: callable ? t('completionDetailCallable') : t('completionDetailVariable'),
      caretOffset: callable ? id.length + 1 : id.length
    };
  });

  const all: CompletionItem[] = [
    ...SNIPPETS,
    ...KEYWORDS.map((k): CompletionItem => ({ label: k, insertText: k, kind: 'keyword', detail: t('completionDetailKeyword'), caretOffset: k.length })),
    ...BUILTINS.map((b): CompletionItem => ({ label: b, insertText: `${b}()`, kind: 'builtin', detail: t('completionDetailBuiltin'), caretOffset: b.length + 1 })),
    ...MODULES.map((m): CompletionItem => ({ label: m, insertText: m, kind: 'module', detail: t('completionDetailModule'), caretOffset: m.length })),
    ...wsItems
  ];

  // 去重（保留先出现的：片段 > 关键字 > 内置 > 模块 > 标识符）
  const seen = new Set<string>();
  const unique: CompletionItem[] = [];
  for (const item of all) {
    if (seen.has(item.label)) continue;
    seen.add(item.label);
    unique.push(item);
  }

  // 前缀为空：返回全部；否则优先 startsWith，再按 includes
  if (!prefix) return unique;
  const starts = unique.filter((c) => c.label.toLowerCase().startsWith(prefix));
  const contains = unique.filter(
    (c) => !c.label.toLowerCase().startsWith(prefix) && c.label.toLowerCase().includes(prefix)
  );
  return [...starts, ...contains];
}
