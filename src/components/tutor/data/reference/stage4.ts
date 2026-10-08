import { TutorialStage } from '../../tutorialData';

// 命令行与工具速查（原 python 系列「参考手册」阶段迁移至此）
export const refStage4: TutorialStage = {
  id: 'ref_stage4',
  title: '命令行与工具',
  icon: 'terminal',
  topics: [
    {
      id: 'cmd_cli_flags',
      title: '命令行用法',
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
      title: '-m 运行模块',
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
      id: 'cmd_pip',
      title: 'pip 命令速查',
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
