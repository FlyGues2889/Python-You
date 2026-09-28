import { TutorialStage, TutorialTopic } from '../../tutorialData';

// 参考手册：内容只保留正文与表格（kind: 'reference' → 渲染时不出小节标题、不显示代码与贴士）
export const cmdHelp: TutorialStage = {

  id: 'cmd_help',
  title: 'Python 参考手册',
  icon: 'terminal',
  topics: [
    {
      id: 'cmd_cli_flags',
      title: 'Python 命令行',
      stage: 'Python 参考手册 > CLI 参数',
      kind: 'reference',
      summary: '在终端里给 python 命令加「开关」，控制它怎么运行。',
      content: {
        overview: '在终端里输入 python 命令时，可以加一些「开关」来控制行为：直接运行一段代码、运行某个文件、或者运行完不退出。',
        sections: [
          {
            text: '以下是 CPython 原生支持的标准命令行选项：',
            table: {
              headers: ['命令开关', '示例', '核心功能说明'],
              rows: [
                ['-c cmd', 'python -c "import sys; print(sys.version)"', '将字符串作为 Python 代码直接执行'],
                ['-m mod', 'python -m http.server 8000', '以主脚本方式运行指定模块'],
                ['-i', 'python -i script.py', '脚本运行完不退出，进入交互模式'],
                ['-v', 'python -v script.py', '详细模式，打印模块导入全过程'],
                ['-O', 'python -O script.py', '基础优化，移除 assert 语句'],
                ['-OO', 'python -OO script.py', '深度优化，移除 assert 和文档字符串'],
                ['-B', 'python -B script.py', '禁止生成 .pyc 字节码缓存文件'],
                ['-s', 'python -s script.py', '不添加用户 site-packages 到检索路径'],
                ['-E', 'python -E script.py', '忽略所有 Python 环境变量'],
                ['-q', 'python -q', '静默启动，不打印版权信息'],
                ['-W arg', 'python -W ignore script.py', '设置警告处理策略'],
                ['-u', 'python -u script.py', '标准输出采用无缓冲模式'],
                ['-V / --version', 'python -V', '打印 Python 版本号'],
                ['-h / --help', 'python -h', '输出完整命令行帮助']
              ]
            }
          },
          {
            text: 'python 文件名.py 运行文件；python -c "代码" 直接执行一行代码；python -m 模块名 运行模块；python -i 运行完进入交互模式，方便调试。'
          }
        ]
      }
    },
    {
      id: 'cmd_m_modules',
      title: 'python -m 模块',
      stage: 'Python 参考手册 > 内置模块 CLI',
      kind: 'reference',
      summary: 'python -m 能运行内置小工具，比如开个网页服务器。',
      content: {
        overview: 'Python 自带了很多能直接命令行运行的工具模块，用 python -m 模块名 就能启动，不用安装任何东西。比如 python -m http.server 就能开一个本地网页服务器。',
        sections: [
          {
            text: '最常用的内置命令行工具模块：',
            table: {
              headers: ['模块', '启动命令', '功能说明'],
              rows: [
                ['http.server', 'python -m http.server 8000', '快速启动静态 HTTP 文件服务器'],
                ['json.tool', 'python -m json.tool data.json', '格式化、校验 JSON 文件'],
                ['venv', 'python -m venv .venv', '创建虚拟环境'],
                ['pip', 'python -m pip install pkg', '官方包管理器'],
                ['timeit', 'python -m timeit "代码"', '代码性能基准测试'],
                ['cProfile', 'python -m cProfile script.py', '性能剖析，统计函数耗时'],
                ['pydoc', 'python -m pydoc -p 8080', '启动本地 API 文档服务器'],
                ['unittest', 'python -m unittest discover', '自动运行单元测试'],
                ['doctest', 'python -m doctest -v script.py', '运行文档字符串中的测试'],
                ['zipfile', 'python -m zipfile -c a.zip f1 f2', '命令行创建/解压 ZIP'],
                ['dis', 'python -m dis script.py', '反汇编查看字节码指令'],
                ['ast', 'python -m ast script.py', '查看抽象语法树结构']
              ]
            }
          },
          {
            text: 'python -m http.server 开网页服务器；python -m pip 管理第三方包；python -m json.tool 格式化 JSON；python -m venv 创建虚拟环境。'
          }
        ]
      }
    },
    {
      id: 'cmd_keywords',
      title: 'Python 关键字',
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
      title: 'Python 内建函数',
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
      id: 'cmd_pip',
      title: 'pip 包管理',
      stage: 'Python 参考手册 > 包管理',
      kind: 'reference',
      summary: '用 pip 安装、卸载、查看第三方包。',
      content: {
        overview: 'pip 是 Python 自带的包管理器，用来从网上下载别人写好的第三方库，比如 pip install requests 就能装上 requests 库。用法是 pip 后面跟一个子命令，再跟上包名。',
        sections: [
          {
            text: '最常用的 pip 子命令：',
            table: {
              headers: ['子命令', '示例', '功能说明'],
              rows: [
                ['install', 'pip install requests', '安装第三方包；加 ==版本号 可指定版本'],
                ['uninstall', 'pip uninstall requests', '卸载已安装的包'],
                ['list', 'pip list', '列出当前环境里已安装的所有包'],
                ['show', 'pip show requests', '查看某个包的详情：版本、安装位置、依赖'],
                ['freeze', 'pip freeze > requirements.txt', '把当前环境已装的包导出成依赖清单文件'],
                ['install -r', 'pip install -r requirements.txt', '按依赖清单批量安装，换电脑时还原环境用'],
                ['install -U', 'pip install -U requests', '把已装的包升级到最新版']
              ]
            }
          },
          {
            text: '日常流程：pip install 装包、pip list 看装了啥、pip show 查详情、pip freeze 导出清单，换环境时用 pip install -r 还原。'
          }
        ]
      }
    },
    {
      id: 'cmd_repl',
      title: 'REPL 交互模式',
      stage: 'Python 参考手册 > 交互模式',
      kind: 'reference',
      summary: '直接敲 python 进入 >>>，一行一行试代码。',
      content: {
        overview: '在终端里直接输入 python（不带文件名）回车，就进入了 REPL 交互模式：屏幕上出现 >>> 提示符，你输一行代码它立刻执行一行，特别适合临时试一小段语法、查个函数用法。',
        sections: [
          {
            text: 'REPL 常用操作：',
            table: {
              headers: ['操作', '做法', '说明'],
              rows: [
                ['进入交互模式', '终端输入 python 回车', '出现 >>> 提示符，等待输入'],
                ['执行一行', '在 >>> 后输入表达式回车', '立刻打印结果，比如输入 1+2 回车显示 3'],
                ['退出交互模式', '输入 exit() 回车', 'Windows / Mac / Linux 通用'],
                ['快捷键退出', 'Windows 按 Ctrl+Z 再回车；Mac/Linux 按 Ctrl+D', '不想敲 exit() 时用快捷键'],
                ['多行代码', '输完以冒号结尾后自动出现 ...', 'for、if、def 等块语句续行，空行结束']
              ]
            }
          },
          {
            text: '记住：终端里只敲 python 就是交互模式；用 exit() 或 Ctrl+Z（Windows）退出。写正式程序请保存成 .py 文件再运行。'
          }
        ]
      }
    }
  ]
};
