import { TutorialStage, TutorialTopic } from '../tutorialData';

export const stage1: TutorialStage = {

  id: 'stage1',
  title: 'Python 教程',
  icon: 'auto_stories',
  topics: [
    {
      id: 'p1_home',
      title: 'Python 教程首页',
      stage: 'Python 教程',
      summary: '欢迎来到 Python 世界！先认识这门语言，再一步步学会用它写程序。',
      content: {
        overview: '欢迎来到 Python 入门教程！这一课会带你认识 Python 是什么、能做什么，以及怎么开始写代码。别紧张，我们像学一门新外语一样从头开始：先认识字母，再学单词，最后写句子。每一课都配了生活小例子和小结，帮你轻轻松松上手。',
        sections: [
          { heading: '生活小例子', text: '想象你第一次学做菜：先认识食材（数字、文字、真假），再学怎么切菜（运算），最后照着菜谱做出第一道菜（写程序）。Python 教程也是这个顺序，学完这一章，你就能做出属于自己的第一道菜了。' },
          {
            heading: '核心技术优势与设计哲学',
            text: '1. 极佳的可读性：强制缩进语法与明确的关键字设计，大幅降低代码理解成本，新手也能轻松读懂他人代码。\n2. 完备的生态系统：拥有超过 30 万个涵盖科学计算、网络通信、人工智能的拓展模块，绝大多数需求都有现成工具。\n3. 全平台兼容：同一套代码可运行于 Windows、macOS、Linux 及基于 WebAssembly 的浏览器端，一次编写处处运行。',
            notes: '说明：本系统内置 Python 3.11 WASM 运行引擎，可在页面中直接对示例代码进行实时验证与调试，无需本地安装任何环境。'
          },
          {
            heading: '新手学习路径与阶段规划',
            text: '本教程按照「基础 → 进阶 → 实战」的逻辑分为 6 个阶段，建议零基础学习者按顺序学习，每学完一节动手修改代码练习：',
            table: {
              headers: ['学习阶段', '核心目标', '建议时长', '掌握后能力'],
              rows: [
                ['阶段1 基础语法', '掌握语法规则、变量与核心数据类型', '2-3 天', '能编写简单计算与逻辑代码'],
                ['阶段2 容器结构', '熟练使用列表、字典等管理批量数据', '2-3 天', '能完成简单数据统计与处理'],
                ['阶段3 控制流', '掌握分支、循环与用户交互逻辑', '3-4 天', '能写出完整的小工具、小游戏'],
                ['阶段4 函数与对象', '学会代码封装与面向对象思想', '4-5 天', '能编写模块化、可复用的程序'],
                ['阶段5 标准库', '掌握官方内置工具模块的用法', '3-4 天', '能解决文件、日期、正则等实际问题'],
                ['阶段6 可视化', '入门 Matplotlib 数据图表绘制', '2 天', '能制作基础数据统计图表']
              ]
            }
          },
          {
            heading: '小结',
            text: 'Python 是一门好读、好写的编程语言，不需要安装复杂软件；接下来会按「基础语法、数据结构、控制流、函数」的顺序循序渐进。'
          }
        ],
        codeExample: `# Python 3.11 环境测试\nimport sys\n\nprint(f"Python You 解释器环境: Python {sys.version.split()[0]}")\nprint("核心系统就绪，欢迎开启 Python 编程学习。")\nprint("你可以直接修改代码，点击运行查看效果！")`,
        takeaways: [
          'Python 是解释型、面向对象的高级语言，语法友好，非常适合新手入门',
          '拥有超 30 万个第三方库，生态丰富，覆盖几乎所有开发领域',
          '代码天然跨平台，可在 Windows、macOS、Linux 及浏览器端运行',
          '建议按阶段顺序学习，边学边练，动手实践是学编程的最快方式'
        ],
        tips: [
          '点击代码块右上角「在编辑器中载入」按钮，可将示例快速同步至主编辑器执行。',
          '建议按照阶段 1 至阶段 6 的顺序循序渐进学习，不要跳跃。',
          '每学完一个小节都动手修改代码运行测试，遇到报错优先读错误信息定位问题。'
        ]
      }
    },
    {
      id: 'p1_intro',
      title: 'Python 简介',
      stage: 'Python 教程',
      summary: 'Python 为什么流行？了解它的来历、特点和能做什么。',
      content: {
        overview: 'Python 诞生于 1989 年，是一位荷兰程序员在圣诞节期间写出来的小工具，没想到后来成了全世界最流行的编程语言之一。它最大的特点就是：代码读起来像英语，写起来简单，新手也能很快看懂。',
        sections: [
          { heading: '生活小例子', text: '就像一本畅销书之所以受欢迎，是因为语言通俗、读起来不累。Python 也一样「说人话」：想打印一句「你好」，直接写 print("你好") 就能运行，哪怕第一次见也能猜到意思。' },
          {
            heading: '《Python 之禅》（PEP 20）设计哲学',
            text: '执行 `import this` 可输出 Python 核心设计准则，其核心思想包括：\n• 优美胜于丑陋 (Beautiful is better than ugly)\n• 明确胜于隐晦 (Explicit is better than implicit)\n• 简洁胜于复杂 (Simple is better than complex)\n• 可读性至关重要 (Readability counts)\n这些原则是写出「Pythonic 风格」代码的核心标准。',
            code: `import this  # 导入并输出 PEP 20 架构规范原文`
          },
          {
            heading: 'Python 主流应用领域',
            text: 'Python 凭借简洁语法和强大生态，在众多领域成为首选开发语言：',
            table: {
              headers: ['应用领域', '主要用途', '代表第三方库'],
              rows: [
                ['数据科学分析', '数据清洗、统计分析、可视化', 'Pandas, NumPy, Matplotlib'],
                ['人工智能', '深度学习、自然语言处理、CV', 'PyTorch, TensorFlow, Scikit-learn'],
                ['自动化运维', '批量文件处理、系统监控、测试', 'os, subprocess, Selenium'],
                ['Web 后端开发', '网站接口、管理系统、服务端应用', 'Django, Flask, FastAPI'],
                ['网络爬虫', '网页数据采集、信息聚合', 'Requests, BeautifulSoup, Scrapy'],
                ['科学计算', '数值模拟、物理仿真、信号处理', 'SciPy, SymPy, Numba']
              ]
            }
          },
          {
            heading: '小结',
            text: 'Python 读起来像英语、写起来简单；它被广泛用于网站开发、数据分析、人工智能等领域；学习时记住：先让代码跑起来，再慢慢优化。'
          }
        ],
        codeExample: `import sys\nimport platform\n\nprint("操作系统架构:", platform.machine())\nprint("Python 实现名称:", sys.implementation.name)\nprint("Python 版本号:", sys.version.split()[0])`,
        tips: [
          '《Python 之禅》是写出规范 Python 代码的技术准则。',
          '入门阶段不用贪多求全，先掌握核心语法，再按兴趣方向深入。'
        ]
      }
    },
    {
      id: 'p1_setup',
      title: 'Python 入门',
      stage: 'Python 教程',
      summary: '在 Python You 里写第一个 Python 程序，理解程序是怎么运行的。',
      content: {
        overview: '在 Python You 里写 Python 不用安装任何东西：内置的解释器会把你的代码「翻译」成计算机能听懂的话并立刻执行。这一课我们就来写第一个程序，亲眼看看代码变成结果的过程。',
        sections: [
          { heading: '生活小例子', text: '就像用翻译软件：你输入中文，它翻译成外语。在 Python You 里，你输入 Python 代码，解释器负责把它翻译成「计算机语言」并执行，结果马上显示在屏幕上。' },
          {
            heading: '代码编译与执行全生命周期',
            text: 'Python 属于解释型语言，与编译型语言的执行逻辑有本质区别：\n1. 词法语法分析：逐字符读取代码，生成抽象语法树（AST），检查语法错误。\n2. 字节码生成：将语法树编译为底层虚拟机指令集，即 .pyc 字节码。\n3. 虚拟机执行：CPython 虚拟机逐条执行指令，管理内存分配与垃圾回收。\n4. 结果输出：将标准输出与错误信息重定向至页面终端展示。',
            table: {
              headers: ['语言类型', '执行方式', '优点', '缺点', '代表语言'],
              rows: [
                ['编译型', '一次性编译为机器码再执行', '运行速度快', '开发调试慢、跨平台差', 'C, C++, Rust'],
                ['解释型', '逐行翻译逐行执行', '开发快、跨平台好', '运行速度相对较慢', 'Python, JavaScript']
              ]
            },
            code: `# 动态表达式求值演示\nx = 10.5\ny = 20.25\nresult = (x * y) ** 0.5\nprint(f"几何平均数计算结果: {result:.4f}")`
          },
          {
            heading: '你的第一个 Python 程序',
            text: '`print()` 是最基础的输出函数，用于在控制台打印内容。\n• 字符串内容需要用单引号或双引号包裹，两者效果一致\n• 多条 print 语句按顺序逐行输出\n• print 会自动在结尾添加换行符',
            code: `# 经典入门程序 Hello World\nprint("Hello, Python!")\nprint("欢迎来到 Python You 编程世界")\nprint("100 + 200 =", 100 + 200)  # 支持直接输出计算结果`
          },
          {
            heading: '小结',
            text: 'Python 代码要经过解释器翻译才会运行；Python You 打开即用，无需安装；试着写一句 print("你好") 并运行，看到输出就说明你成功了。'
          }
        ],
        codeExample: `# 基础公式验证\na, b, c = 3, 4, 5\nis_right_triangle = (a**2 + b**2 == c**2)\nprint(f"边长 {a},{b},{c} 是否构成直角三角形: {is_right_triangle}")`,
        tips: [
          '在主界面按下 Ctrl + Enter 可快速执行当前代码。',
          '入门阶段不用深究字节码原理，先学会写代码、跑通程序更重要。'
        ]
      }
    },
    {
      id: 'p1_syntax',
      title: 'Python 语法',
      stage: 'Python 教程',
      summary: 'Python 靠缩进划分代码块，学会这个规则就不容易踩坑。',
      content: {
        overview: '很多编程语言用大括号 {} 表示「这段代码属于谁」，Python 不用大括号，而是靠缩进（行首的空格）来区分层级。缩进既是规则也是风格，写对了代码整整齐齐，像书架一样一目了然。',
        sections: [
          { heading: '生活小例子', text: '写作文时，每个段落开头要空两格，读者才知道新的一段开始了。Python 也一样：同一层级的代码缩进必须一致，缩进不同就代表层级不同，混用会直接报错。' },
          {
            heading: '语法缩进与续行规范',
            text: '• 缩进标准：根据 PEP 8 规范，统一使用 4 个空格作为一级缩进，禁止使用 Tab 或混用空格与 Tab。\n• 缩进错误：缩进不一致会直接触发 `IndentationError`，导致程序无法运行。\n• 多行续行：长表达式推荐用圆括号 `()` 包裹换行，不建议使用反斜杠 `\\`。\n• 代码块：所有属于同一逻辑层级的代码必须保持完全相同的缩进量。',
            code: `# 多行条件拼接推荐格式（圆括号包裹）\ntotal = (\n    1 + 2 + 3 +\n    4 + 5 + 6\n)\n\nif total > 10:\n    print(f"累加计算结果为: {total}")\n    print("同一逻辑块保持统一的 4 空格缩进")`
          },
          {
            heading: '常见缩进错误与避坑指南',
            text: '新手最容易犯的三类缩进错误：\n1. 该缩进的地方没缩进：if、for、def 等语句后冒号下一行必须缩进\n2. 不该缩进的地方乱缩进：顶级代码不能随意加缩进\n3. 同一代码块缩进量不一致：有的用 2 空格，有的用 4 空格',
            table: {
              headers: ['错误写法', '错误原因', '正确写法'],
              rows: [
                ['if True:\\nprint("hi")', 'if 后代码块未缩进', 'if True:\\n    print("hi")'],
                ['•  print("hello")', '顶级代码前多余缩进', 'print("hello")'],
                ['if True:\\n    a=1\\n      b=2', '同一层级缩进不一致', 'if True:\\n    a=1\\n    b=2']
              ]
            }
          },
          {
            heading: 'PEP 8 基础编码规范',
            text: 'PEP 8 是 Python 官方代码风格指南，新手从一开始就养成良好习惯：\n• 每行代码不超过 79 个字符\n• 运算符前后、逗号后加空格提升可读性\n• 函数与类之间空两行，方法之间空一行\n• 变量和函数名使用小写蛇形命名法（如 user_name）',
            code: `# 符合 PEP 8 规范的代码示例\ndef calculate_area(radius):\n    pi = 3.14159\n    return pi * radius * radius\n\n\nresult = calculate_area(5)\nprint("圆的面积:", result)`
          },
          {
            heading: '小结',
            text: 'Python 用缩进代替大括号划分代码块；同一层级缩进必须一致（建议统一 4 个空格）；缩进错了程序会报错，多试几次就习惯了。'
          }
        ],
        codeExample: `def validate_number(num):\n    if num > 0:\n        print("正数测试通过")\n        if num % 2 == 0:\n            print("且该数值为偶数")\n    else:\n        print("非正数")\n\nvalidate_number(16)`,
        tips: [
          '禁止在同一源码文件中混用 Tab 制表符与空格。',
          '大多数编辑器可设置「Tab 自动转换为 4 空格」，避免手动缩进出错。'
        ]
      }
    },
    {
      id: 'p1_comments',
      title: 'Python 注释',
      stage: 'Python 教程',
      summary: '注释是写给人的说明，学会用 # 和文档字符串给代码做笔记。',
      content: {
        overview: '注释就是写给「人」看的说明文字，计算机运行时会自动跳过。写注释就像在笔记本上做记号，半年后翻回来还能一眼看懂当初的想法。',
        sections: [
          { heading: '生活小例子', text: '就像在课本上划重点、写批注：批注不会影响考试（运行），但能帮你复习（理解代码）。代码写多了你就会发现，好注释比好代码更宝贵。' },
          {
            heading: '注释类型及适用场景',
            text: '1. 单行注释：以 `#` 符号开头，用于解释复杂算法步骤或关键逻辑，写在被解释代码的上方或右侧。\n2. 块注释：连续多行 `#` 注释，用于解释一整段代码的功能。\n3. 文档字符串 Docstring：用三引号 `"""` 书写，紧跟在类、函数或模块首行，用于描述接口功能、参数与返回值，可通过 `help()` 或 `__doc__` 访问。',
            code: `# 示例：计算人体身体质量指数 (BMI)\ndef calculate_bmi(weight: float, height: float) -> float:\n    """\n    根据体重和身高计算 BMI 指数\n    \n    :param weight: 体重，单位千克 (kg)\n    :param height: 身高，单位米 (m)\n    :return: 计算得到的 BMI 浮点数值\n    """\n    return weight / (height ** 2)\n\n# 查看函数文档字符串\nprint(calculate_bmi.__doc__)`
          },
          {
            heading: '注释最佳实践与常见误区',
            text: '注释不是越多越好，核心原则是「解释为什么，而不是做什么」：\n• 推荐：解释业务背景、设计思路、复杂算法的原理\n• 不推荐：复述代码逻辑（如 `# 给 a 加 1` 这种废话注释）\n\n注意：三引号本质是字符串字面量，不是官方定义的多行注释，只是常被当作块注释使用。',
            code: `# • 好的注释：说明为什么这么做\n# 由于浮点数存在精度误差，用差值小于 1e-6 判断相等\nis_equal = abs(a - b) < 1e-6\n\n# • 差的注释：复述代码\n# 把 a 和 b 相加\nresult = a + b`
          },
          {
            heading: '小结',
            text: '用 # 开头写单行注释，解释器会忽略；注释用来解释「为什么这么做」，而不是复述代码；养成写注释的习惯，将来读代码会轻松很多。'
          }
        ],
        codeExample: `w, h = 70.0, 1.75\nbmi = calculate_bmi(w, h)\nprint(f"体重 {w}kg, 身高 {h}m 的 BMI 指数为: {bmi:.2f}")`,
        tips: [
          '保持 Docstring 的清晰格式有利于自动生成 API 手册。',
          '代码本身是最好的注释，优先通过清晰的变量名和结构提升可读性。'
        ]
      }
    },
    {
      id: 'p1_variables',
      title: 'Python 变量',
      stage: 'Python 教程',
      summary: '变量就是给数据贴标签，学会命名和赋值的各种写法。',
      content: {
        overview: '变量就是给数据起个名字，方便以后反复使用。可以把它想象成「贴了标签的盒子」：盒子里装着数据，标签写着名字。Python 的变量很自由，不用提前声明，直接赋值就能用。',
        sections: [
          { heading: '生活小例子', text: '你的储物箱上贴着「冬装」标签，里面放冬天的衣服；箱子里装什么由你决定，换掉里面的东西也不用换标签。Python 里 season = "冬天" 就是给「冬天」贴上一个叫 season 的标签，之后用 season 就能取到它。' },
          {
            heading: '变量命名规则与最佳实践',
            text: '• 合法字符：只能包含字母、数字及下划线 `_`，且不能以数字开头。\n• 大小写敏感：`value` 与 `Value` 是两个完全独立的变量。\n• 命名规范：变量和函数统一使用「蛇形命名法」（如 `user_age`），全大写表示常量（如 `MAX_SIZE`）。\n• 禁止使用：不能用 Python 关键字（如 if、for、class）作为变量名。',
            table: {
              headers: ['变量名', '是否合法', '原因说明'],
              rows: [
                ['user_name', '✓ 合法', '蛇形命名，符合规范'],
                ['123abc', '✗ 非法', '不能以数字开头'],
                ['user-age', '✗ 非法', '不能包含减号'],
                ['class', '✗ 非法', '属于 Python 保留关键字'],
                ['MAX_COUNT', '✓ 合法', '常量约定全大写']
              ]
            }
          },
          {
            heading: '多种赋值方式详解',
            text: 'Python 支持非常灵活的赋值语法：\n1. 基础赋值：`x = 10`\n2. 链式赋值：`a = b = c = 100`，多个变量指向同一个对象\n3. 序列解包：`x, y, z = 10, 20, 30`，一一对应赋值\n4. 扩展解包：`head, *tail = [1,2,3,4]`，用星号接收剩余元素\n5. 变量交换：`a, b = b, a`，无需中间变量直接交换',
            code: `# 1. 链式赋值\na = b = c = 100\nprint("链式赋值:", a, b, c)\n\n# 2. 变量互换（无需中间变量）\nx, y = 100, 200\nx, y = y, x\nprint(f"交换后: x={x}, y={y}")\n\n# 3. 扩展解包\nfirst, *rest, last = [1, 2, 3, 4, 5]\nprint("首元素:", first, "尾元素:", last, "中间部分:", rest)`
          },
          {
            heading: '变量的引用本质',
            text: 'Python 变量存的不是数据本身，而是数据在内存中的地址。可以用 `id()` 函数查看变量指向的内存地址。\n• 给变量重新赋值，本质是让标签贴到新的对象上，原对象不会被修改\n• 两个变量赋值为同一个小整数/短字符串，可能指向同一个内存地址（缓存机制）',
            code: `# 观察变量内存地址变化\nnum = 1000\nprint("原始地址:", id(num))\nnum = 2000\nprint("重新赋值后地址:", id(num))  # 地址发生了变化`
          },
          {
            heading: '小结',
            text: '变量 = 名字 + 数据，用 名字 = 数据 赋值；变量名只能由字母、数字、下划线组成，且不能以数字开头；变量可以反复重新赋值，新值会覆盖旧值。'
          }
        ],
        codeExample: `x = 1000\nprint("变量 x 的内存唯一 ID (id()):", id(x))\nx = "Python"\nprint("重新赋值后变量 x 的内存 ID:", id(x))`,
        tips: [
          '使用内置函数 id() 可以精准校验变量引用的内存地址是否发生变更。',
          '新手不用过度深究内存原理，先熟练掌握赋值和解包语法。'
        ]
      }
    },
    {
      id: 'p1_datatypes',
      title: 'Python 数据类型',
      stage: 'Python 教程',
      summary: '数据有不同的种类，学会分辨数字、文字、真假等常见类型。',
      content: {
        overview: '数据有不同「种类」，就像容器有不同的用途：水杯装水、书架放书。Python 里的数据也有类型：数字、文字（字符串）、真假（布尔）等等，不同类型用法不同，先分清类型再动手写。',
        sections: [
          { heading: '生活小例子', text: '衣橱里袜子、外套、鞋子通常分开放，找起来才方便。Python 也是：age = 18 是数字，name = "小明" 是文字，is_student = True 是真假。分清类型，代码就不容易出错。' },
          {
            heading: '核心内置数据类型速查表',
            text: '不同数据结构在可变性、可哈希性与访问复杂度上有本质区别：',
            table: {
              headers: ['数据类型', '类型名', '语法示例', '可变性', '可哈希', '核心特性'],
              rows: [
                ['字符串', 'str', '"Hello"', '不可变', '可哈希', 'Unicode 字符序列，支持切片'],
                ['整数', 'int', '42', '不可变', '可哈希', '任意精度整数，仅受内存限制'],
                ['浮点数', 'float', '3.14159', '不可变', '可哈希', 'IEEE 754 双精度浮点数'],
                ['列表', 'list', '[1, 2, 3]', '可变', '不可哈希', '动态数组，支持原位增删改'],
                ['元组', 'tuple', '(1, 2)', '不可变', '可哈希*', '只读序列，含可变元素时不可哈希'],
                ['字典', 'dict', '{"a": 1}', '可变', '不可哈希', '哈希表实现的键值对映射'],
                ['集合', 'set', '{1, 2, 3}', '可变', '不可哈希', '无序非重复元素集合'],
                ['布尔值', 'bool', 'True/False', '不可变', '可哈希', '继承自 int，True=1, False=0'],
                ['空值', 'NoneType', 'None', '不可变', '可哈希', '代表空对象的单例类型']
              ]
            },
            code: `# 遍历查看不同数据的类型\ndata_samples = [100, 3.14, "Python You", (1, 2), [3, 4], {"k": "v"}, True, None]\nfor val in data_samples:\n    print(f"值: {str(val):<12} | 类型: {type(val).__name__:<8}")`
          },
          {
            heading: '类型判断两种方式',
            text: '判断数据类型有两个常用函数，用法有区别：\n• `type(x)`：返回 x 的精确类型，不考虑继承关系\n• `isinstance(x, 类型)`：判断 x 是否属于该类型或其子类，更推荐使用\n\n推荐优先用 `isinstance`，因为它能正确处理面向对象的继承场景。',
            code: `num = 123\nprint("type 判断:", type(num) == int)       # True\nprint("isinstance 判断:", isinstance(num, int))  # True\n\n# bool 是 int 的子类\nprint("bool 是 int 子类吗:", isinstance(True, int))  # True`
          },
          {
            heading: '可变与不可变类型核心区别',
            text: '这是 Python 非常重要的底层概念：\n• 不可变类型：对象创建后内容不能修改，修改会生成新对象（如 str、int、tuple）\n• 可变类型：对象创建后可原位修改内容，内存地址不变（如 list、dict、set）',
            code: `# 字符串是不可变类型\ns = "hello"\nprint("修改前地址:", id(s))\ns = s.upper()  # 生成了新字符串\nprint("修改后地址:", id(s))  # 地址变化了\n\n# 列表是可变类型\nlst = [1, 2, 3]\nprint("修改前地址:", id(lst))\nlst.append(4)  # 原位修改\nprint("修改后地址:", id(lst))  # 地址不变`
          },
          {
            heading: '小结',
            text: '常见类型：数字（int/float）、字符串（str）、布尔（bool），后面还会学列表、字典；用 type() 可以查看数据类型；不同类型运算规则不同，先搞清类型再写代码。'
          }
        ],
        codeExample: `a = "Hello"\nprint("字符串属于不可变类型，修改字符将产生新对象:")\nprint("原始地址:", id(a))\na += " World"\nprint("拼接后新地址:", id(a))`,
        tips: [
          '不可变类型可以作为字典的 Key，可变类型（如 list、dict）不能作为 Key。',
          '函数传参时，可变类型的修改会影响外部原对象，不可变类型不会。'
        ]
      }
    },
    {
      id: 'p1_numbers',
      title: 'Python 数字',
      stage: 'Python 教程',
      summary: '整数、小数怎么算？还有一个小知识：小数运算偶尔有误差。',
      content: {
        overview: 'Python 的数字很好用：整数想多大都行，小数直接写，加、减、乘、除、取余都能算。你只需要记住一个小知识：小数的计算偶尔会有极小误差，这是所有编程语言的通病。',
        sections: [
          { heading: '生活小例子', text: '0.1 + 0.2 在纸上等于 0.3，但在计算机里可能得到 0.30000000000000004——就像 1/3 用小数永远写不完。日常用完全没问题，如果是算钱，后面再学用 Decimal 精确处理。' },
          {
            heading: '数值类型与运算规则',
            text: '• 自动类型提升：整数与浮点数运算时，结果自动提升为 `float`。\n• 除法规则：`/` 始终返回浮点数，`//` 返回整除结果（向下取整），`%` 求余数。\n• 幂运算：`**` 运算符（如 `2 ** 10 = 1024`）。\n• 整数无大小限制：Python 的 int 可以存储任意大的整数，只受内存限制。',
            table: {
              headers: ['运算符', '含义', '示例', '结果'],
              rows: [
                ['+', '加法', '10 + 3', '13'],
                ['-', '减法', '10 - 3', '7'],
                ['*', '乘法', '10 * 3', '30'],
                ['/', '除法（返回浮点数）', '10 / 3', '3.333...'],
                ['//', '整除（向下取整）', '10 // 3', '3'],
                ['%', '取余数', '10 % 3', '1'],
                ['**', '幂运算', '2 ** 10', '1024']
              ]
            }
          },
          {
            heading: '浮点精度问题详解',
            text: '计算机用二进制存储浮点数，很多十进制小数无法精确表示，会产生微小误差，这不是 Python 的 bug，是所有语言共有的 IEEE 754 标准特性。\n• 普通场景：误差极小，不影响日常使用\n• 金融/会计场景：必须使用 `decimal.Decimal` 进行精确计算',
            code: `from decimal import Decimal\n\n# 传统浮点计算的精度局限\nprint("二进制浮点计算: 0.1 + 0.2 =", 0.1 + 0.2)  # 结果不是 0.3\n\n# Decimal 模块精准金融计算\nd1 = Decimal("0.1")\nd2 = Decimal("0.2")\nprint("Decimal 精准计算: d1 + d2 =", d1 + d2)  # 精确等于 0.3`
          },
          {
            heading: '运算符优先级速记',
            text: '运算优先级从高到低：括号 > 幂运算 > 正负号 > 乘除取余 > 加减。不确定优先级时，直接加括号最稳妥。',
            code: `# 优先级示例\nresult = 2 + 3 * 4 ** 2  # 先算 4**2=16，再算 3*16=48，最后 2+48=50\nprint("运算结果:", result)\n\n# 用括号改变优先级\nresult2 = (2 + 3) * 4 ** 2  # 先算 2+3=5，再算 4**2=16，最后 5*16=80\nprint("括号改变优先级:", result2)`
          },
          {
            heading: '小结',
            text: '数字分整数 int 和小数 float；// 是整除（不要小数部分），% 是取余数；小数运算可能有极小误差，属正常现象；算钱等精确场景用 Decimal。'
          }
        ],
        codeExample: `z = 3 + 4j\nprint(f"复数 {z} -> 实部: {z.real}, 虚部: {z.imag}, 模长: {abs(z)}")`,
        tips: [
          '对于金融与会计领域的精准货币计算，务必采用 decimal.Decimal 对象。',
          '比较两个浮点数是否相等时，不要直接用 ==，应判断差值是否小于极小值。'
        ]
      }
    },
    {
      id: 'p1_casting',
      title: 'Python Casting',
      stage: 'Python 教程',
      summary: '把文字变成数字、把数字变成文字，学会类型转换。',
      content: {
        overview: '类型转换就是把一种类型的数据「变」成另一种：比如把文字 "18" 变成数字 18，这样才能做加减法。Python 提供了现成的转换函数，像变形金刚一样想变就变。',
        sections: [
          { heading: '生活小例子', text: '体检单上写「身高：175」是文字，医生登记时把它填成数字 175 才能算平均值。Python 里 int("175") 就是这种「登记」：把文字变成数字。' },
          {
            heading: '核心类型转换函数',
            text: '• `int(x, base=10)`：将字符串或浮点数转为整数，可指定进制；浮点数直接截断小数部分，不是四舍五入。\n• `float(x)`：转为双精度浮点数。\n• `str(x)`：将任意 Python 对象转为其文本表示形式。\n• `bool(x)`：转为布尔值，遵循真值判定规则。\n• 容器转换：`list()` / `tuple()` / `set()` 可在容器类型间互相转换。',
            table: {
              headers: ['转换函数', '支持输入', '输出类型', '注意事项'],
              rows: [
                ['int()', '数字、数字字符串', '整数', '非数字字符串会报错；浮点数截断小数'],
                ['float()', '数字、数字字符串', '浮点数', '支持科学计数法字符串'],
                ['str()', '任意对象', '字符串', '输出对象的文本表示'],
                ['bool()', '任意对象', '布尔值', '空/零值为 False，其余为 True'],
                ['list()', '可迭代对象', '列表', '常用于将元组、集合转为列表']
              ]
            },
            code: `# 进制转换与类型强转\nhex_str = "0xFF"\nnum = int(hex_str, 16)\nprint(f"十六进制 {hex_str} 转十进制: {num}")\n\nfloat_val = 9.99\nint_val = int(float_val)  # 小数点直接截断而非四舍五入\nprint(f"float 9.99 强转 int 截断结果: {int_val}")`
          },
          {
            heading: '常见转换异常与避坑',
            text: '类型转换不是万能的，非法转换会抛出异常：\n• 非数字格式的字符串转 int/float 会触发 `ValueError`\n• 包含非法字符的进制字符串转换失败\n• 容器转换时，字典转列表只会保留键',
            code: `# 安全的类型转换写法\ndef safe_int_convert(value):\n    try:\n        return int(value)\n    except ValueError:\n        print(f"警告: {value} 无法转换为整数")\n        return None\n\nprint(safe_int_convert("123"))   # 成功\nprint(safe_int_convert("abc"))   # 失败，返回 None`
          },
          {
            heading: '进制转换全解',
            text: 'Python 支持十进制、二进制、八进制、十六进制的互相转换：\n• 十进制转其他：`bin()` 二进制、`oct()` 八进制、`hex()` 十六进制\n• 其他转十进制：`int(字符串, 进制数)`',
            code: `num = 255\nprint("十进制 255:")\nprint("  二进制:", bin(num))\nprint("  八进制:", oct(num))\nprint("  十六进制:", hex(num))\n\n# 其他进制转十进制\nprint("二进制 1010 转十进制:", int("1010", 2))`
          },
          {
            heading: '小结',
            text: '用 int()、float()、str() 可以在数字、小数、文字之间转换；转换的前提是内容能转，int("abc") 会报错；程序输入进来的大多是文字，记得先转换再运算。'
          }
        ],
        codeExample: `raw_inputs = ["10", "3.14159", "True"]\nparsed_int = int(raw_inputs[0])\nparsed_float = float(raw_inputs[1])\nprint(f"转换加和计算: {parsed_int + parsed_float:.2f}")`,
        tips: [
          '将非合法数值形式的字符串强转 int/float 会抛出 ValueError 异常。',
          '处理用户输入时，建议用 try-except 包裹类型转换，提升程序健壮性。'
        ]
      }
    },
    {
      id: 'p1_strings',
      title: 'Python 字符串',
      stage: 'Python 教程',
      summary: '字符串就是一串文字，学会拼接、截取和常用处理方法。',
      content: {
        overview: '字符串就是一段文字，用引号包起来，比如 "你好"、"Python"。它可以拼接、截取、查找、替换，是日常打交道最多的数据类型。',
        sections: [
          { heading: '生活小例子', text: '字符串像一串珠子，每颗珠子是一个字符，可以按顺序数着取。比如 "你好世界"[1] 取出第 2 个字符「好」（Python 从 0 开始数），就像数珠子从第 0 颗数起。' },
          {
            heading: '字符串创建与转义字符',
            text: '• 单引号、双引号：效果完全一致，可互相嵌套避免转义。\n• 三引号：用于书写多行字符串，保留换行与格式。\n• 转义字符：用反斜杠 `\\` 表示特殊字符，如换行 `\\n`、制表符 `\\t`、反斜杠本身 `\\\\`。\n• 原始字符串：字符串前加 `r`，转义字符失效，常用于写文件路径、正则表达式。',
            code: `# 不同字符串写法\ns1 = '单引号字符串'\ns2 = "双引号字符串"\ns3 = """多行\n字符串\n示例"""\ns4 = r"C:\\Users\\name\\Desktop"  # 原始字符串，不用双反斜杠\n\nprint("转义换行: 第一行\\n第二行")\nprint("原始字符串:", s4)`
          },
          {
            heading: '索引与切片语法',
            text: '• 索引：从 0 开始编号，支持负数索引（-1 表示最后一个字符）。\n• 切片通用语法：`sequence[start:stop:step]`，左闭右开区间 `[start, stop)`。\n• 省略规则：省略 start 默认从头开始，省略 stop 默认到末尾，省略 step 默认步长 1。\n• 步长为负：从右往左取，可实现字符串反转。',
            table: {
              headers: ['切片写法', '含义', '示例 s="abcdef"', '结果'],
              rows: [
                ['s[2]', '取索引 2 的字符', 's[2]', '"c"'],
                ['s[1:4]', '取索引 1 到 3', 's[1:4]', '"bcd"'],
                ['s[:3]', '取前 3 个字符', 's[:3]', '"abc"'],
                ['s[-3:]', '取后 3 个字符', 's[-3:]', '"def"'],
                ['s[::2]', '隔一个取一个', 's[::2]', '"ace"'],
                ['s[::-1]', '反转字符串', 's[::-1]', '"fedcba"']
              ]
            },
            code: `text = "Hello, Python!"\nprint("第 3 个字符:", text[2])\nprint("前 5 个字符:", text[:5])\nprint("反转字符串:", text[::-1])`
          },
          {
            heading: '常用字符串内置方法',
            text: '字符串是不可变类型，所有修改类方法都会返回新字符串，原字符串不变：\n• 大小写转换：`.upper()`、`.lower()`、`.title()`、`.swapcase()`\n• 查找替换：`.find()`、`.index()`、`.replace(old, new)`\n• 拆分连接：`.split(分隔符)`、`分隔符.join(列表)`\n• 清理空白：`.strip()`、`.lstrip()`、`.rstrip()`\n• 判断类：`.startswith()`、`.endswith()`、`.isdigit()`、`.isalpha()`',
            code: `text = "  Python You Python IDE  "\nclean_text = text.strip()\nprint("清除首尾空格:", clean_text)\nprint("全大写:", clean_text.upper())\nprint("是否以 Py 开头:", clean_text.startswith("Py"))\n\n# 分割与连接\nwords = clean_text.split(" ")\nprint("分割成列表:", words)\nprint("下划线拼接:", "_".join(words))`
          },
          {
            heading: '小结',
            text: '字符串用单引号或双引号包起来，用 + 拼接；索引从 0 开始，s[0] 取第一个字符，s[-1] 取最后一个；len() 查长度，upper()、lower() 等做大小写处理。'
          }
        ],
        codeExample: `s = "abcdefghijklmnopqrstuvwxyz"\nprint("前5个字符:", s[:5])\nprint("后5个字符:", s[-5:])\nprint("隔一采样 [::2]:", s[::2])`,
        tips: [
          '字符串为不可变类型，任何修改 API（如 replace）均返回全新生成的字符串。',
          '频繁拼接字符串不要用 + 运算符，推荐用 .join() 方法效率更高。'
        ]
      }
    },
    {
      id: 'p1_booleans',
      title: 'Python 布尔',
      stage: 'Python 教程',
      summary: 'True 和 False 表示真假，是程序做判断的基础。',
      content: {
        overview: '布尔类型只有两个值：True（真）和 False（假），用来表示「是」和「不是」。它是程序做判断的基础，比如「今天是否下雨」「分数是否及格」。',
        sections: [
          { heading: '生活小例子', text: '你出门前问自己「下雨了吗？」——答案是「是」就带伞，「否」就不带。程序里的 if 判断也是这么工作的：条件为 True 执行一段代码，为 False 执行另一段。' },
          {
            heading: '隐式真值（Truthy/Falsy）判定',
            text: '在 if、while 等条件语句中，对象会被自动转为布尔值：\n以下所有对象均判定为 `False`（Falsy）：\n• 逻辑单例：`None`、`False`\n• 数值零：`0`、`0.0`、`0j`、`Decimal(0)`\n• 空容器：`""`、`[]`、`()`、`{}`、`set()`、`range(0)`\n\n除此之外的所有对象均判定为 `True`（Truthy）。',
            code: `def check_truthy(obj):\n    print(f"对象: {repr(obj):<15} | 布尔值: {bool(obj)}")\n\ncheck_truthy("")\ncheck_truthy("Python")\ncheck_truthy([])\ncheck_truthy([1, 2])\ncheck_truthy(0)\ncheck_truthy(None)`
          },
          {
            heading: '短路求值机制详解',
            text: '逻辑运算符 `and`、`or` 具备短路特性：一旦能确定最终结果，就不再执行后续表达式。\n• `x and y`：x 为假直接返回 x，否则返回 y\n• `x or y`：x 为真直接返回 x，否则返回 y\n• `not x`：取反，始终返回 True 或 False\n\n注意：and/or 不一定返回布尔值，而是返回「决定结果的那个操作数」。',
            table: {
              headers: ['表达式', '结果', '说明'],
              rows: [
                ['0 and 100', '0', '0 是假，直接返回 0，不看 100'],
                ['"hello" and "world"', '"world"', '前者为真，返回后者'],
                ['"" or "default"', '"default"', '前者为假，返回后者'],
                ['10 or 20', '10', '前者为真，直接返回 10'],
                ['not 0', 'True', '取反运算']
              ]
            },
            code: `# 短路求值实用场景：设置默认值\nfirst_name = ""\ndefault_name = "Anonymous"\nactive_name = first_name or default_name\nprint("生效名称:", active_name)`
          },
          {
            heading: '真值判断最佳实践',
            text: 'Pythonic 风格的条件判断：\n• 推荐：`if container:` 判断容器非空\n• 不推荐：`if len(container) > 0:`\n\n• 推荐：`if x is None:` 判断空值\n• 不推荐：`if x == None:`',
            code: `names = ["Alice", "Bob"]\n\n# 推荐写法\nif names:\n    print("列表不为空，长度为", len(names))\n\n# 判断 None 必须用 is\nvalue = None\nif value is None:\n    print("value 是空值")`
          },
          {
            heading: '小结',
            text: '布尔只有 True 和 False；比较运算（如 x > 3）的结果就是布尔值；判断真假时，0、空字符串、空列表等会被当成 False，其余都是 True。'
          }
        ],
        codeExample: `# 短路求值示例\n# 当 first 为 Falsy 时，直接返回 second\nfirst_name = ""\ndefault_name = "Anonymous"\nactive_name = first_name or default_name\nprint("活性生效名称:", active_name)`,
        tips: [
          '在 if 语句中直接写 `if container:` 比 `if len(container) > 0:` 更符合 Pythonic 风格。',
          '判断 None、True、False 这类单例对象时，用 is 比 == 更规范高效。'
        ]
      }
    },
    {
      id: 'p1_operators',
      title: 'Python 运算符',
      stage: 'Python 教程',
      summary: '加减乘除、比大小、判断真假，运算符一学就会。',
      content: {
        overview: '运算符就是「动作」：+ 表示相加，== 表示比较是否相等，and 表示「并且」。Python 的运算符读起来很像英文，非常好记。',
        sections: [
          { heading: '生活小例子', text: '逛超市结账：单价 × 数量 = 总价，用的是算术运算符；再看「满 100 减 20 且会员再打 9 折」，用的是逻辑运算符。程序里的计算和判断，用的就是这些符号。' },
          {
            heading: '六大类运算符分类总览',
            text: 'Python 运算符共分为六大类别：\n1. 算术运算符：`+`, `-`, `*`, `/`, `//`, `%`, `**`\n2. 比较运算符：`==`, `!=`, `>`, `<`, `>=`, `<=`\n3. 逻辑运算符：`and`, `or`, `not`\n4. 成员运算符：`in`, `not in`（检测元素是否在容器内）\n5. 身份运算符：`is`, `is not`（比较内存地址是否一致）\n6. 位运算符：`&`, `|`, `^`, `~`, `<<`, `>>`（按二进制位运算）',
            table: {
              headers: ['运算符分类', '主要符号', '示例', '返回值', '核心说明'],
              rows: [
                ['算术运算符', '**, //, %', '10 % 3', '1', '求余数、指数幂等数学运算'],
                ['比较运算符', '==, !=, >=', '5 >= 2', 'True', '比较两个对象的数值大小'],
                ['逻辑运算符', 'and, or, not', 'True and False', 'False', '具备短路特性的布尔组合'],
                ['成员运算符', 'in, not in', '"Py" in "Python You"', 'True', '检测元素是否在可迭代容器中'],
                ['身份运算符', 'is, is not', 'a is b', 'bool', '比较内存地址 id(a) == id(b)']
              ]
            },
            code: `# is 与 == 的本质区别\nlist_a = [1, 2, 3]\nlist_b = [1, 2, 3]\nprint("数值内容相同 (list_a == list_b):", list_a == list_b)  # True\nprint("内存地址相同 (list_a is list_b):", list_a is list_b)  # False`
          },
          {
            heading: '复合赋值运算符',
            text: '将运算与赋值合并的简写形式，可简化代码：\n`+=`、`-=`、`*=`、`/=`、`//=`、`%=`、`**=`',
            code: `count = 10\ncount += 5   # 等价于 count = count + 5\ncount *= 2   # 等价于 count = count * 2\nprint("计算后 count:", count)`
          },
          {
            heading: '运算符优先级总表',
            text: '优先级从高到低排序，同级从左到右计算（赋值运算符除外）：\n1. 括号 `()`\n2. 幂运算 `**`\n3. 正负号 `+x`, `-x`\n4. 乘除模 `*`, `/`, `//`, `%`\n5. 加减 `+`, `-`\n6. 比较运算符 `==`, `>`, `<` 等\n7. 逻辑非 `not`\n8. 逻辑与 `and`\n9. 逻辑或 `or`\n10. 赋值运算符 `=`',
            code: `# 优先级示例\nresult = not 1 + 2 * 3 > 5\n# 运算顺序：先算 2*3=6 → 1+6=7 → 7>5=True → not True=False\nprint("运算结果:", result)`
          },
          {
            heading: '小结',
            text: '算术：+ - * / // % **；比较：== != > < >= <=，结果都是 True/False；逻辑：and（都真才真）、or（一个真就真）、not（取反）。'
          }
        ],
        codeExample: `# 位运算示例\na = 0b1010  # 10\nb = 0b1100  # 12\nprint("按位与 &: ", bin(a & b))\nprint("按位或 |: ", bin(a | b))\nprint("按位异或 ^:", bin(a ^ b))`,
        tips: [
          '使用 `is` 比较逻辑单例（如 `x is None` 或 `x is True`）比 `==` 更高效安全。',
          '记不住优先级就加括号，代码可读性比炫技更重要。'
        ]
      }
    }
  ]
};
