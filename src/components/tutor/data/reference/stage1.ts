import { TutorialStage } from '../../tutorialData';

// 参考手册：内容只保留正文与表格（kind: 'reference' → 渲染时不出小节标题、不显示代码与贴士）
export const refStage1: TutorialStage = {
  id: 'ref_stage1',
  title: '语言速查',
  icon: 'menu_book',
  topics: [
    {
      id: 'ref_operators',
      title: '运算符与优先级',
      stage: 'Python 参考手册 > 运算符',
      kind: 'reference',
      summary: '算术、比较、逻辑、位运算一表查全，附优先级高到低。',
      content: {
        overview: '运算符按功能分几类：算数、比较、逻辑、位运算与赋值。查用法看下表，表达式里分不清先算哪个就看优先级（同一行内从左到右，括号优先）。',
        sections: [
          {
            text: '算术与赋值运算符：',
            table: {
              headers: ['运算符', '写法示例', '说明'],
              rows: [
                ['+ - * /', 'a + b', '加、减、乘、除（结果是浮点数）'],
                ['//', '7 // 2 → 3', '整除，向下取整'],
                ['%', '7 % 2 → 1', '取余数'],
                ['**', '2 ** 10 → 1024', '幂运算'],
                ['+= -= *= /=', 'a += 1', '运算后赋值；另有 //= %= **='],
                [':=', 'if (n := len(a)) > 2:', '海象运算符：赋值并返回该值（3.8+）']
              ]
            }
          },
          {
            text: '比较与逻辑运算符（结果都是 True / False）：',
            table: {
              headers: ['运算符', '写法示例', '说明'],
              rows: [
                ['== !=', 'a == b', '相等 / 不相等（比较值）'],
                ['> < >= <=', 'a >= b', '大小比较（可用于字符串、列表按字典序）'],
                ['is / is not', 'a is None', '是否是同一个对象（判断 None 一律用 is）'],
                ['in / not in', 'x in [1, 2]', '成员检测：元素在容器 / 字符串里'],
                ['and or not', 'a and b', '逻辑与 / 或 / 非，支持短路求值']
              ]
            }
          },
          {
            text: '位运算符（把整数当二进制处理）：',
            table: {
              headers: ['运算符', '说明'],
              rows: [
                ['&', '按位与：同为 1 才是 1'],
                ['|', '按位或：有一个 1 就是 1'],
                ['^', '按位异或：不同为 1'],
                ['~', '按位取反：~x 等于 -x - 1'],
                ['<< >>', '左移 / 右移，x << 1 相当于 x * 2']
              ]
            }
          },
          {
            text: '优先级从高到低（只列常用）：括号 `()` → 幂 `**` → 一元 `~ + -` → 乘除 `* / // %` → 加减 `+ -` → 移位 `<< >>` → 位与 `&` → 位异或 `^` → 位或 `|` → 比较 `== != < > <= >= in is` → 逻辑非 `not` → 逻辑与 `and` → 逻辑或 `or` → 赋值 `= += …`。记不住就加括号，可读性也更好。'
          }
        ]
      }
    },
    {
      id: 'cmd_keywords',
      title: '关键字速查',
      stage: 'Python 参考手册 > 保留关键字',
      kind: 'reference',
      summary: '关键字是 Python 的「规定动作」，37 个词先混个眼熟。',
      content: {
        overview: '关键字（Keywords）是 Python 预留的特殊单词，比如 if、for、while、def。它们有固定的语法含义，不能拿来当变量名或函数名。按下方分类合计共有 37 个。',
        sections: [
          {
            text: '通过 `import keyword; print(keyword.kwlist)` 可实时获取完整列表，按功能分类如下：',
            table: {
              headers: ['功能分类', '包含关键字', '功能简述'],
              rows: [
                ['逻辑与单例', 'False, True, None', '布尔真值与空对象单例'],
                ['条件控制', 'if, elif, else', '多分支流程控制'],
                ['循环控制', 'for, while, break, continue, pass', '循环、跳出与空占位'],
                ['函数与类', 'def, return, lambda, class', '定义函数、匿名函数与类'],
                ['异常处理', 'try, except, finally, raise, assert', '捕获异常、抛出错误、断言'],
                ['模块导入', 'import, from, as', '导入模块、提取符号与别名'],
                ['作用域', 'global, nonlocal, del', '声明作用域与删除引用'],
                ['逻辑运算', 'and, or, not, in, is', '布尔运算、成员与身份检测'],
                ['上下文管理', 'with', '自动资源清理释放'],
                ['协程生成', 'async, await, yield', '异步协程、生成器产出'],
                ['模式匹配', 'match, case', '结构模式匹配（3.10+）']
              ]
            }
          },
          {
            text: '关键字是 Python 保留词，不能当变量名；常用关键字：if、for、while、def、return、import、class；用 `keyword.kwlist` 可以查看全部 37 个。'
          }
        ]
      }
    },
    {
      id: 'cmd_builtins',
      title: '内建函数速查',
      stage: 'Python 参考手册 > 内置函数全集',
      kind: 'reference',
      summary: '内建函数是 Python 自带的「常用工具」，开箱即用。',
      content: {
        overview: '内置函数（Built-in Functions）是 Python 启动时就准备好的工具函数，不用 import 直接用，比如 print()、len()、int()、max()。',
        sections: [
          {
            text: '按功能领域分类整理最常用的内置函数：',
            table: {
              headers: ['分类', '内置函数', '功能说明'],
              rows: [
                ['数值计算', 'abs, divmod, pow, round, sum, max, min', '绝对值、商余、乘方、四舍五入、求和、极值'],
                ['类型转换', 'int, float, str, bool, list, tuple, set, dict, bytes, chr, ord, hex, oct, bin', '标量与容器类型转换、进制转换'],
                ['对象反射', 'type, isinstance, issubclass, id, hash, getattr, setattr, hasattr, dir, vars, callable, repr', '类型检测、内存地址、动态属性访问'],
                ['迭代容器', 'len, range, enumerate, zip, map, filter, iter, next, sorted, reversed, all, any, slice', '容器长度、索引配对、迭代器创建与取下一个、映射过滤、排序'],
                ['输入输出', 'print, input, open, help, format', '控制台打印、输入、文件、格式化'],
                ['代码执行', 'eval, exec, compile, globals, locals, super, breakpoint', '动态执行、作用域、继承调用'],
                ['类与描述符', 'property, classmethod, staticmethod', '把方法当属性访问、定义类方法与静态方法']
              ]
            }
          },
          {
            text: '易混淆函数对比：`sorted()` 返回新列表、不修改原数据，`list.sort()` 原位修改；`map()` 与列表推导式相比后者可读性更好，多数场景推荐推导式；类型判断优先用 `isinstance()`，它会考虑继承关系。'
          },
          {
            text: '安全警告：`eval()` 和 `exec()` 会把字符串当作 Python 代码直接执行。不要对不可信输入使用，有代码注入风险——只要字符串来自用户、文件或网络，攻击者就可以借它执行任意代码。学习调试时只在自己写死的字符串上使用。'
          },
          {
            text: 'print() 输出、len() 长度、type() 查类型、int()/str() 转换、max()/min() 求最值；全部内置函数用 `dir(builtins)` 或 `help()` 查看。'
          }
        ]
      }
    },
    {
      id: 'ref_exceptions',
      title: '内建异常速查',
      stage: 'Python 参考手册 > 异常类型',
      kind: 'reference',
      summary: '报错信息里的异常名在这里查：是什么错、通常由什么引起。',
      content: {
        overview: '程序报错时，最后一行给出异常类型和说明。所有内建异常都继承自 BaseException，平时捕获用的是它的子类 Exception。下表按出现频率列出常见异常。',
        sections: [
          {
            text: '最常遇到的异常：',
            table: {
              headers: ['异常类型', '典型触发', '处理建议'],
              rows: [
                ['SyntaxError', '代码写法不合法，如括号没闭合、缺冒号', '按提示行号改语法，无法被 try 捕获'],
                ['IndentationError', '缩进不一致或多/少空格', '统一用 4 个空格，检查报错行的上一行'],
                ['NameError', '用了未定义的变量或函数名', '检查拼写、是否忘记赋值或 import'],
                ['TypeError', '类型不匹配，如 "1" + 1', '先转换类型：int("1") + 1'],
                ['ValueError', '类型对但值不对，如 int("abc")', '校验输入内容，或改用带默认值的转换'],
                ['KeyError', '字典取了不存在的键', '用 dict.get(key, 默认值) 或先 in 判断'],
                ['IndexError', '列表下标越界', '检查长度，或用切片 / 负索引'],
                ['AttributeError', '对象没有这个属性或方法', '检查对象类型与方法名拼写'],
                ['ZeroDivisionError', '除以 0 或取余 0', '计算前判断分母是否为 0'],
                ['FileNotFoundError', '打开不存在的文件', '先检查路径，或用 os.path.exists 判断'],
                ['ModuleNotFoundError', 'import 了未安装的模块', 'pip install 对应包，或检查模块名'],
                ['ImportError', '模块存在但导入的成员不存在', '检查 from … import 的成员名'],
                ['PermissionError', '没有权限读写目标文件', '换路径、以管理员运行或检查文件占用'],
                ['UnicodeDecodeError', '解码文本时编码不符', 'open(..., encoding="utf-8") 明确指定编码'],
                ['json.JSONDecodeError', 'JSON 字符串解析失败（ValueError 子类）', '先校验字符串，或用 try 包住解析'],
                ['KeyboardInterrupt', '用户按 Ctrl+C 中断程序', '一般不必捕获，交给程序退出']
              ]
            }
          },
          {
            text: '异常层级（常用部分）：BaseException → Exception → （ArithmeticError → ZeroDivisionError、LookupError → IndexError / KeyError、OSError → FileNotFoundError / PermissionError、ValueError → UnicodeError）。捕获时优先写具体异常名，最后才用 `except Exception` 兜底。'
          }
        ]
      }
    }
  ]
};
