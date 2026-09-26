import { TutorialStage, TutorialTopic } from '../tutorialData';

export const cmdHelp: TutorialStage = {

  id: 'cmd_help',
  title: 'Python 参考手册',
  icon: 'terminal',
  topics: [
    {
      id: 'cmd_cli_flags',
      title: 'Python 命令行',
      stage: 'Python 参考手册 > CLI 参数',
      summary: '在终端里给 python 命令加「开关」，控制它怎么运行。',
      content: {
        overview: '在终端里输入 python 命令时，可以加一些「开关」来控制行为：直接运行一段代码、运行某个文件、或者运行完不退出。这是程序员天天在用的工具。',
        sections: [
          { heading: '生活小例子', text: '想快速验证一句话对不对：python -c "print(1+1)" 直接执行并打印结果，不用新建文件。就像用计算器一样，输入即得。' },
          {
            heading: 'Python CLI 命令行参数全集',
            text: '以下汇总 CPython 原生支持的标准命令行选项：',
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
            },
            code: `# 代码中获取命令行参数\nimport sys\nprint(f"运行平台: {sys.platform}")\nprint("接收参数列表:", sys.argv)`
          },
          {
            heading: '小结',
            text: 'python 文件名.py 运行文件；python -c "代码" 直接执行一行代码；python -m 模块名 运行模块；python -i 运行完进入交互模式，方便调试。'
          }
        ],
        codeExample: `import sys\nprint("命令行参数传递列表 sys.argv:", sys.argv)`,
        tips: [
          '使用 `python -m pip` 比直接运行 `pip` 命令更能精准避免多版本 Python 环境下的包路径混淆问题。'
        ]
      }
    },
    {
      id: 'cmd_m_modules',
      title: 'python -m 模块',
      stage: 'Python 参考手册 > 内置模块 CLI',
      summary: 'python -m 能运行内置小工具，比如开个网页服务器。',
      content: {
        overview: 'Python 自带了很多能直接命令行运行的工具模块，用 python -m 模块名 就能启动，不用安装任何东西。比如 python -m http.server 就能开一个本地网页服务器。',
        sections: [
          { heading: '生活小例子', text: '想和同屋的人分享一个文件夹：在该目录运行 python -m http.server 8000，对方在浏览器访问你的地址就能下载文件。一个命令搞定。' },
          {
            heading: '原生 CLI 工具模块全集',
            text: '整理最常用的内置命令行工具：',
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
            },
            code: `# timeit 代码等效示例\nimport timeit\ntime_cost = timeit.timeit("[x**2 for x in range(100)]", number=10000)\nprint(f"10000 次列表推导式耗时: {time_cost:.5f} 秒")`
          },
          {
            heading: '小结',
            text: 'python -m http.server 开网页服务器；python -m pip 管理第三方包；python -m json.tool 格式化 JSON；python -m venv 创建虚拟环境。'
          }
        ],
        codeExample: `import json\nraw_data = '{"name": "Python You", "type": "IDE"}'\nformatted = json.dumps(json.loads(raw_data), indent=2)\nprint("json.tool 格式化效果展示:\\n", formatted)`,
        tips: [
          '`python -m http.server` 在前端开发与内网文件临时共享场景中极具生产效率。'
        ]
      }
    },
    {
      id: 'cmd_keywords',
      title: 'Python 关键字',
      stage: 'Python 参考手册 > 保留关键字',
      summary: '关键字是 Python 的「规定动作」，35 个词先混个眼熟。',
      content: {
        overview: '关键字（Keywords）是 Python 预留的特殊单词，比如 if、for、while、def。它们有固定的语法含义，不能拿来当变量名或函数名。Python 3.11 一共有 35 个。',
        sections: [
          { heading: '生活小例子', text: '就像交通标志里的「停」「让」——看到就知道是什么意思，也不能拿来干别的。代码里看到 if、for 这些词，大致就能猜到作用，学的时候多留意就记住了。' },
          {
            heading: '35 个关键字分类表',
            text: '通过 `import keyword; print(keyword.kwlist)` 可实时获取完整列表：',
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
            },
            code: `import keyword\nprint(f"当前 Python 共有 {len(keyword.kwlist)} 个保留关键字:")\nfor idx, kw in enumerate(keyword.kwlist, 1):\n    print(f"{kw:<10}", end="\\n" if idx % 5 == 0 else " ")`
          },
          {
            heading: '小结',
            text: '关键字是 Python 保留词，不能当变量名；常用关键字：if、for、while、def、return、import、class；用 keyword.kwlist 可以查看全部 35 个；见到不认识的先查手册再猜。'
          }
        ],
        codeExample: `# pass 关键字占位符应用\nclass AbstractProcessor:\n    def process_data(self):\n        pass  # 暂未实现，占位保持语法完整`,
        tips: [
          '在 IDE 中，保留关键字通常由编辑器高亮显示为醒目的特定颜色。',
          '命名变量时避开所有关键字，可用末尾加下划线方式替代（如 class_）。'
        ]
      }
    },
    {
      id: 'cmd_builtins',
      title: 'Python 内建函数',
      stage: 'Python 参考手册 > 内置函数全集',
      summary: '内建函数是 Python 自带的「常用工具」，开箱即用。',
      content: {
        overview: '内置函数（Built-in Functions）是 Python 启动时就准备好的工具函数，不用 import 直接用，比如 print()、len()、int()、max()。它们是日常写代码最高频的帮手。',
        sections: [
          { heading: '生活小例子', text: '想打印、想数长度、想找最大数，直接 print()、len()、max() 拿来就用，像家里的工具箱一样随手可取，不用每次去「买」（import）。' },
          {
            heading: '核心内置函数分类汇总',
            text: '按功能领域分类整理最常用的内置函数：',
            table: {
              headers: ['分类', '内置函数', '功能说明'],
              rows: [
                ['数值计算', 'abs, divmod, pow, round, sum, max, min', '绝对值、商余、乘方、四舍五入、求和、极值'],
                ['类型转换', 'int, float, str, bool, list, tuple, set, dict, bytes, chr, ord, hex, oct, bin', '标量与容器类型转换、进制转换'],
                ['对象反射', 'type, isinstance, issubclass, id, hash, getattr, setattr, hasattr, dir, vars, callable, repr', '类型检测、内存地址、动态属性访问'],
                ['迭代容器', 'len, range, enumerate, zip, map, filter, sorted, reversed, all, any, slice', '容器长度、索引配对、映射过滤、排序'],
                ['输入输出', 'print, input, open, help, format', '控制台打印、输入、文件、格式化'],
                ['代码执行', 'eval, exec, compile, globals, locals, super, breakpoint', '动态执行、作用域、继承调用']
              ]
            },
            code: `# 高阶函数组合示例\nnumbers = [-10, 15, -20, 30, 5]\nabs_sorted = sorted(map(abs, numbers))\nprint("绝对值映射后升序:", abs_sorted)\nprint("全部为正数:", all(x > 0 for x in abs_sorted))`
          },
          {
            heading: '易混淆函数对比',
            text: '• `sorted()` vs `list.sort()`：前者返回新列表，不修改原数据；后者原位修改\n• `map()` vs 列表推导式：后者可读性更好，绝大多数场景推荐用推导式\n• `type()` vs `isinstance()`：后者考虑继承关系，类型判断更推荐',
            code: `lst = [3, 1, 2]\nnew_lst = sorted(lst)  # 原列表不变，返回新列表\nprint("原列表:", lst, "排序后:", new_lst)\n\nlst.sort()  # 原位修改\nprint("sort 后原列表:", lst)`
          },
          {
            heading: '小结',
            text: 'print() 输出、len() 长度、type() 查类型、int()/str() 转换、max()/min() 求最值；全部内置函数用 dir(builtins) 或 help() 查看；先把常用的十几个用熟，其余用时再查。'
          }
        ],
        codeExample: `# dir() 与 vars() 查看对象属性\nclass Demo:\n    def __init__(self):\n        self.a = 10\n\nd = Demo()\nprint("vars(d) 属性字典:", vars(d))\nprint("dir(d) 公开方法子集:", [m for m in dir(d) if not m.startswith("__")])`,
        tips: [
          '切勿定义与内置函数同名的自定义变量（如 `list = [1, 2]`），这会屏蔽掉全局的 `list()` 构造函数。',
          '遇到陌生对象先 dir() 看看有哪些方法，是快速学习的小技巧。'
        ]
      }
    }
  ]
};
