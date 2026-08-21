// 轻量 Python 代码补全数据源（方案 A：词法级提示，无类型分析）
// 提供：关键字 / 内置函数 / 标准库模块 / 常用代码片段 / 工作区标识符
import type { FSItem } from '../types';
import { t } from './i18n';

export interface CompletionItem {
  label: string; // 展示文本
  insertText: string; // 插入文本
  kind: 'keyword' | 'builtin' | 'module' | 'identifier' | 'snippet';
  detail?: string; // 右侧说明（分类描述）
  usage?: string; // 简略语法用法（选中项在解释小字中显示，如 print(*objects, sep=" ")）
  caretOffset?: number; // 补全后光标相对 insertText 的位置（默认末尾）
}

// ---- 简略语法用法表（新手向）：第一行用法（中文参数名），第二行一句话说明 ----
const BUILTIN_USAGES: Record<string, string> = {
  abs: 'abs(数字)\n取绝对值，例如 abs(-5) 得到 5',
  all: 'all(序列)\n序列里所有值都为真（非 0/非空）时返回 True',
  any: 'any(序列)\n序列里只要有一个值为真就返回 True',
  bool: 'bool(值)\n把任意值转成 True 或 False',
  chr: 'chr(数字)\n把数字转成对应的字符，例如 chr(65) 得到 A',
  dict: 'dict()\n创建字典（键值对集合）',
  enumerate: 'enumerate(序列, start=0)\n遍历时同时得到序号和值',
  float: 'float(值)\n转成小数，例如 float("3.14") 得到 3.14',
  format: 'format(值, 格式)\n按指定格式输出，例如 format(3.14159, ".2f")',
  getattr: 'getattr(对象, 属性名)\n获取对象的属性值',
  hasattr: 'hasattr(对象, 属性名)\n判断对象有没有这个属性',
  help: 'help(对象)\n查看对象的使用帮助文档',
  hex: 'hex(数字)\n转成十六进制字符串，例如 hex(255) 得到 0xff',
  id: 'id(对象)\n查看对象在内存中的编号',
  input: 'input(提示文字)\n让用户输入内容（返回字符串）',
  int: 'int(值)\n转成整数，例如 int("5") 得到 5',
  isinstance: 'isinstance(对象, 类型)\n判断对象是不是某类型，如 isinstance(3, int)',
  issubclass: 'issubclass(子类, 父类)\n判断是不是父类的子类',
  iter: 'iter(序列)\n把序列变成迭代器（配合 next 使用）',
  len: 'len(对象)\n获取长度，例如 len("abc") 得到 3',
  list: 'list(序列)\n转成列表，例如 list("ab") 得到 [\'a\', \'b\']',
  map: 'map(函数, 序列)\n把序列每个元素依次传给函数处理',
  max: 'max(序列)\n取最大值，例如 max([3, 7, 2]) 得到 7',
  min: 'min(序列)\n取最小值',
  next: 'next(迭代器)\n取迭代器的下一个元素',
  open: 'open(文件名, 模式)\n打开文件，模式 "r" 读 / "w" 写',
  ord: 'ord(字符)\n把字符转成数字，例如 ord("A") 得到 65',
  pow: 'pow(底数, 指数)\n幂运算，例如 pow(2, 3) 得到 8',
  print: 'print(值1, 值2, ...)\n把内容输出到屏幕，多个值用逗号隔开',
  range: 'range(结束) / range(开始, 结束, 步长)\n生成一串数字，常用在 for 循环里',
  repr: 'repr(对象)\n对象的官方表示（字符串形式）',
  reversed: 'reversed(序列)\n反转序列，例如 reversed([1, 2, 3]) 得到 [3, 2, 1]',
  round: 'round(数字, 保留位数)\n四舍五入，例如 round(3.14159, 2) 得到 3.14',
  set: 'set(序列)\n转成集合（自动去重、无序）',
  slice: 'slice(开始, 结束)\n切片（取一段），如 seq[slice(1, 3)]',
  sorted: 'sorted(序列)\n排序并返回新列表，不改动原序列',
  str: 'str(值)\n转成字符串，例如 str(123) 得到 "123"',
  sum: 'sum(序列)\n求和，例如 sum([1, 2, 3]) 得到 6',
  super: 'super()\n在子类中调用父类的方法',
  tuple: 'tuple(序列)\n转成元组（不可修改的列表）',
  type: 'type(对象)\n查看对象的类型，例如 type(3) 得到 int',
  vars: 'vars(对象)\n查看对象的所有属性和值（字典形式）',
  zip: 'zip(序列1, 序列2)\n把多个序列按位置配对',
};

const KEYWORD_USAGES: Record<string, string> = {
  assert: 'assert 条件\n条件不成立时程序报错，用于检查代码',
  class: 'class 类名:\n定义一个类（模板）',
  def: 'def 函数名(参数):\n定义一个函数（一段可重复用的代码）',
  del: 'del 变量\n删除变量或列表中的元素',
  elif: 'elif 条件:\n否则如果（配合 if 使用）',
  else: 'else:\n否则（if 条件不成立时执行这里）',
  except: 'except 异常类型:\n捕获并处理异常（出错时不崩溃）',
  finally: 'finally:\n无论是否出错都会执行这里',
  for: 'for 变量 in 序列:\n循环：把序列每个元素依次取出',
  from: 'from 模块 import 名字\n从模块中导入指定内容',
  global: 'global 变量\n在函数里声明使用全局变量',
  if: 'if 条件:\n条件成立时执行下面的代码',
  import: 'import 模块\n导入模块（工具包）',
  in: '值 in 序列\n判断值是否在序列里，例如 3 in [1, 2, 3]',
  is: 'a is b\n判断两个对象是不是同一个',
  lambda: 'lambda 参数: 表达式\n一行写的小函数，例如 lambda x: x * 2',
  nonlocal: 'nonlocal 变量\n在嵌套函数里声明使用外层函数的变量',
  not: 'not 值\n取反：True 变 False',
  raise: 'raise 异常类型("提示")\n主动制造一个错误',
  return: 'return 值\n把函数的结果返回给调用处',
  try: 'try:\n尝试执行，出错会跳到 except（配合使用）',
  while: 'while 条件:\n条件成立时反复循环执行',
  with: 'with open(文件名) as 变量:\n打开文件等资源，用完自动关闭',
  yield: 'yield 值\n生成器：每调用一次产出一个值',
};

const MODULE_USAGES: Record<string, string> = {
  collections: 'collections.Counter(序列)\n统计每个元素出现的次数',
  csv: 'csv.reader(文件)\n读取 CSV 表格文件',
  datetime: 'datetime.datetime.now()\n获取当前日期和时间',
  functools: 'functools.reduce(函数, 序列)\n把序列从头到尾累积计算',
  glob: 'glob.glob("*.py")\n按通配符查找文件名',
  itertools: 'itertools.chain(序列1, 序列2)\n把多个序列拼接成一个',
  json: 'json.loads(字符串) / json.dumps(对象)\n解析 JSON / 生成 JSON',
  math: 'math.sqrt(数字)\n求平方根，如 math.sqrt(16) 得到 4.0',
  os: 'os.path.join(路径1, 路径2)\n拼接文件路径（自动处理分隔符）',
  pandas: 'pandas.DataFrame()\n创建数据表（数据分析）',
  pathlib: 'Path("文件夹/文件")\n用对象方式操作文件路径',
  random: 'random.randint(最小, 最大)\n生成范围内的随机整数',
  re: 're.findall(规则, 文本)\n按正则规则查找所有匹配',
  scipy: 'scipy.optimize.xxx()\n科学计算（优化、积分、统计等）',
  string: 'string.ascii_lowercase\n所有小写字母 a-z',
  sympy: 'sympy.symbols("x")\n定义数学符号，做符号计算',
  sys: 'sys.argv\n获取命令行参数列表',
  time: 'time.sleep(秒)\n让程序暂停指定秒数',
  typing: 'typing.List[int]\n类型标注：说明列表里的元素类型',
  numpy: 'numpy.array([1, 2, 3])\n创建数组（科学计算核心库）',
  matplotlib: 'matplotlib.pyplot.plot(x, y)\n画折线图',
};

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
  { label: 'ifmain', insertText: 'if __name__ == "__main__":\n    pass', kind: 'snippet', detail: t('completionDetailIfMain'), usage: 'if __name__ == "__main__":\n程序主入口：只有直接运行本文件时才执行' },
  { label: 'def', insertText: 'def name():\n    pass', kind: 'snippet', detail: t('completionDetailDef'), usage: 'def 函数名(参数):\n函数模板：定义一段可重复用的代码' },
  { label: 'class', insertText: 'class Name:\n    def __init__(self):\n        pass', kind: 'snippet', detail: t('completionDetailClass'), usage: 'class 类名:\n类模板：定义对象蓝图' },
  { label: 'for', insertText: 'for item in items:\n    ', kind: 'snippet', detail: t('completionDetailFor'), usage: 'for 变量 in 序列:\n循环模板：遍历每个元素' },
  { label: 'if', insertText: 'if condition:\n    ', kind: 'snippet', detail: t('completionDetailIf'), usage: 'if 条件:\n条件模板：成立时执行' },
  { label: 'withopen', insertText: 'with open("file.txt", "r", encoding="utf-8") as f:\n    content = f.read()', kind: 'snippet', detail: t('completionDetailReadFile'), usage: 'with open(文件名, "r") as 变量:\n读文件模板：用完全自动关闭文件' },
  { label: 'try', insertText: 'try:\n    pass\nexcept Exception as e:\n    print(e)', kind: 'snippet', detail: t('completionDetailTry'), usage: 'try: ... except 异常类型:\n异常处理模板：出错时不崩溃' }
];

// 合并全部用法表：编辑器悬停提示（getUsage）与补全 tooltip 共用
const USAGE_TABLE: Record<string, string> = {
  ...KEYWORD_USAGES,
  ...BUILTIN_USAGES,
  ...MODULE_USAGES,
  ...Object.fromEntries(SNIPPETS.filter((s) => s.usage).map((s) => [s.label, s.usage as string])),
};

// 查询标识符的简略语法用法（无则返回 null）——代码悬停提示用
export function getUsage(word: string): string | null {
  return USAGE_TABLE[word] || null;
}

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
    ...KEYWORDS.map((k): CompletionItem => ({ label: k, insertText: k, kind: 'keyword', detail: t('completionDetailKeyword'), usage: KEYWORD_USAGES[k], caretOffset: k.length })),
    ...BUILTINS.map((b): CompletionItem => ({ label: b, insertText: `${b}()`, kind: 'builtin', detail: t('completionDetailBuiltin'), usage: BUILTIN_USAGES[b], caretOffset: b.length + 1 })),
    ...MODULES.map((m): CompletionItem => ({ label: m, insertText: m, kind: 'module', detail: t('completionDetailModule'), usage: MODULE_USAGES[m], caretOffset: m.length })),
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
