// 教程数据（自动生成，勿手改）
// 源：src/components/tutor/data/*.ts + quizData.ts（TOPIC_QUIZZES 部分）
// 生成命令：node build-data.mjs
'use strict';


const stage1 = {

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


const stage2 = {

  id: 'stage2',
  title: 'Python 容器',
  icon: 'dataset',
  topics: [
    {
      id: 'p2_list',
      title: 'Python 列表',
      stage: 'Python 容器',
      summary: '列表是能随手修改的「购物车」，学会增删改查和常用操作。',
      content: {
        overview: '列表（List）是 Python 里最常用的容器，就像超市的购物车：可以按顺序装很多东西，随时加、删、改、查。列表用方括号 [] 表示，元素之间用逗号隔开。',
        sections: [
          { heading: '生活小例子', text: '逛超市时，你的购物车清单可能是：shopping = ["牛奶", "面包", "鸡蛋"]。想加一盒酸奶用 append，想拿掉面包用 remove，想看看第几样东西用下标。列表就是这样随手可改的「清单」。' },
          {
            heading: '核心 API：增删改查方法',
            text: '• 增加元素：`.append(x)` 尾部追加、`.extend(iterable)` 批量追加、`.insert(index, x)` 指定位置插入\n• 删除元素：`.remove(x)` 按值删除首个、`.pop(index)` 按索引弹出、`.clear()` 清空\n• 查找统计：`.index(x)` 查找索引、`.count(x)` 统计次数\n• 排序反转：`.sort()` 原位排序、`sorted()` 返回新列表、`.reverse()` 原位反转',
            table: {
              headers: ['方法', '功能', '返回值', '是否修改原列表'],
              rows: [
                ['append(x)', '尾部追加元素', 'None', '是'],
                ['pop(i)', '弹出索引 i 的元素', '被弹出的元素', '是'],
                ['remove(x)', '删除第一个 x', 'None', '是'],
                ['sort()', '原位排序', 'None', '是'],
                ['sorted(lst)', '排序生成新列表', '新列表', '否'],
                ['index(x)', '查找 x 的索引', '索引值', '否']
              ]
            },
            code: `numbers = [42, 10, 88, 5, 23]
numbers.append(99)
numbers.sort()
print("原位升序排序:", numbers)

# 弹出尾部元素
last = numbers.pop()
print("弹出的元素:", last, "剩余列表:", numbers)`
          },
          {
            heading: '列表切片高级用法',
            text: '列表支持和字符串完全一致的切片语法，且切片不仅能读取，还能批量修改、批量删除、拷贝列表。\n• 切片读取：`lst[1:4]` 获取子列表\n• 切片修改：`lst[1:3] = [a, b, c]` 替换指定范围元素\n• 切片拷贝：`lst[:]` 生成列表的浅拷贝',
            code: `nums = [0, 1, 2, 3, 4, 5]

# 切片读取
print("前 3 个:", nums[:3])

# 切片批量替换
nums[1:3] = [100, 200, 300]
print("替换后:", nums)

# 切片浅拷贝
copy_nums = nums[:]
print("拷贝的列表:", copy_nums)`
          },
          {
            heading: '列表推导式',
            text: '列表推导式是 Python 特色语法，用一行代码快速生成列表，语法简洁且执行效率高于普通 for 循环。\n基础格式：`[表达式 for 变量 in 可迭代对象 if 条件]`',
            code: `# 基础推导式：生成 0-9 的平方
squares = [x ** 2 for x in range(10)]
print("平方列表:", squares)

# 带条件的推导式：提取偶数并平方
evens_squared = [x ** 2 for x in numbers if x % 2 == 0]
print("偶数平方:", evens_squared)

# 二维矩阵展平
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print("展平后:", flattened)`
          },
          {
            heading: '小结',
            text: '列表用 [] 定义，可以装任意类型的数据；append() 加元素、remove() 删元素、用下标访问；len() 看长度，sort() 排序，list[1:3] 切片取一部分。'
          }
        ],
        codeExample: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print("二维矩阵展平列表:", flattened)`,
        tips: [
          '列表的 `.append()` 与 `.pop()` 时间复杂度均为 O(1)，可高效实现栈（Stack）数据结构。',
          '尽量避免在列表中间频繁插入删除，时间复杂度为 O(n)，效率较低。'
        ]
      }
    },
    {
      id: 'p2_tuple',
      title: 'Python 元组',
      stage: 'Python 容器',
      summary: '元组是「定好就不改」的清单，适合放固定不变的数据。',
      content: {
        overview: '元组（Tuple）和列表很像，但有个重要区别：创建之后就不能增删改。它适合放那些「说好就不变」的数据，比如一年的 12 个月份、一周的 7 天。',
        sections: [
          { heading: '生活小例子', text: '就像印刷好的菜单，印出来就不能改了。days = ("一", "二", "三", "四", "五", "六", "日") 表示一周七天，顺序固定、内容不变，程序用起来更安全。' },
          {
            heading: '四大容器综合对比',
            text: '根据功能需求与性能指标精准选择容器：',
            table: {
              headers: ['容器', '语法', '有序性', '可变性', '允许重复', '查找复杂度', '典型场景'],
              rows: [
                ['列表 List', '[ ]', '有序', '可变', '允许', 'O(n) 线性', '动态数据存储、顺序遍历'],
                ['元组 Tuple', '( )', '有序', '不可变', '允许', 'O(n) 线性', '常量数据、函数多返回值'],
                ['集合 Set', '{ }', '无序', '可变', '不允许', 'O(1) 哈希', '数据去重、集合运算'],
                ['字典 Dict', '{k:v}', '插入有序', '可变', 'Key 唯一', 'O(1) 哈希', '结构化数据、快速查找']
              ]
            }
          },
          {
            heading: '元组基础语法与注意事项',
            text: '• 单元素元组必须在末尾加逗号：`(42,)`，否则会被解析为普通表达式。\n• 元组可省略括号：`point = 10, 20` 等价于 `point = (10, 20)`。\n• 元组支持索引、切片、count、index 等只读操作，不支持 append、remove 等修改操作。\n• 不可变是指元组存储的引用不可变；如果元组包含列表等可变对象，列表内容仍可修改。',
            code: `# 单元素元组必须带逗号
single = (42,)
not_tuple = (42)  # 这只是整数
print(type(single), type(not_tuple))

# 元组包含可变对象的情况
t = (1, 2, [3, 4])
t[2].append(5)  # 可以修改列表本身
print("元组内容:", t)  # 元组引用的列表变了，但元组本身的引用没变`
          },
          {
            heading: '高级解包应用',
            text: '元组最常用的场景就是解包赋值，函数多返回值本质就是返回元组。\n支持平行赋值、扩展解包、交换变量等多种用法。',
            code: `# 函数多返回值（本质返回元组）
def get_server_status():
    return 200, "OK", 0.045

code, status, latency = get_server_status()
print(f"响应码: {code}, 状态: {status}, 延迟: {latency}s")

# 扩展解包忽略多余值
first, *_, last = [1, 2, 3, 4, 5]
print("只取首尾:", first, last)`
          },
          {
            heading: '小结',
            text: '元组用 () 定义，创建后不可修改；适合存固定不变的常量数据；函数返回多个值时常用元组；单个元素的元组要写成 (1,)，结尾的逗号不能省。'
          }
        ],
        codeExample: `def get_server_status():
    return 200, "OK", 0.045  # 返回元组

code, status, latency = get_server_status()
print(f"响应码: {code}, 状态: {status}, 延迟: {latency}s")`,
        tips: [
          '元组内部若包含可变对象（如列表），该可变对象的内容仍可被修改，但元组引用的对象地址不变。',
          '不需要修改的数据优先用元组，更省内存、更安全，还能作为字典的键。'
        ]
      }
    },
    {
      id: 'p2_set',
      title: 'Python 集合',
      stage: 'Python 容器',
      summary: '集合是「自动去重」的袋子，还能做交、并、差运算。',
      content: {
        overview: '集合（Set）像一袋「不重样」的弹珠：里面不会出现重复的东西，而且没有先后顺序。它最擅长两件事：去重，以及算交集、并集、差集。',
        sections: [
          { heading: '生活小例子', text: '两个班级选课，想找出同时选了数学课的同学——这就是交集。A = {"小明", "小红"}，B = {"小红", "小刚"}，A & B 就是「两个班都选课的人」。集合就是做这种统计的好帮手。' },
          {
            heading: '集合基础特性与创建',
            text: '• 无序性：元素没有固定顺序，不支持索引访问\n• 唯一性：重复元素会被自动去重\n• 可哈希要求：集合元素必须是不可变类型（可哈希），列表、字典不能放入集合\n• 空集合必须用 `set()` 创建，`{}` 是空字典',
            code: `# 自动去重
nums = [1, 2, 2, 3, 3, 3, 4]
unique_nums = set(nums)
print("去重后集合:", unique_nums)

# 空集合的正确创建方式
empty_set = set()
print("空集合类型:", type(empty_set))`
          },
          {
            heading: '集合数学运算方法',
            text: '集合支持完整的数学集合运算，有运算符和方法两种写法：\n• 交集 `&` / `.intersection()`：两个集合共有的元素\n• 并集 `|` / `.union()`：合并两个集合的所有不重复元素\n• 差集 `-` / `.difference()`：存在于 A 但不存在于 B 的元素\n• 对称差集 `^` / `.symmetric_difference()`：不同时存在于两个集合的元素\n• 子集判断：`.issubset()`、`.issuperset()`',
            table: {
              headers: ['运算', '运算符', '方法写法', '含义'],
              rows: [
                ['交集', '&', 'a.intersection(b)', '两个集合都有的元素'],
                ['并集', '|', 'a.union(b)', '所有元素合并去重'],
                ['差集', '-', 'a.difference(b)', 'a 有但 b 没有的元素'],
                ['对称差', '^', 'a.symmetric_difference(b)', '只在一个集合里的元素']
              ]
            },
            code: `set_a = {1, 2, 3, 4, 5}
set_b = {4, 5, 6, 7, 8}

print("交集:", set_a & set_b)
print("并集:", set_a | set_b)
print("差集(A-B):", set_a - set_b)
print("对称差集:", set_a ^ set_b)
print("A 是 B 的子集吗:", set_a.issubset(set_b))`
          },
          {
            heading: '集合常用操作与适用场景',
            text: '常用方法：`.add()` 添加元素、`.remove()` 删除元素、`.clear()` 清空。\n典型适用场景：\n1. 列表/数据去重\n2. 共同好友、共同关注等交集计算\n3. 标签系统的差集、并集运算',
            code: `# 实际场景：统计访问去重 IP
raw_logs = ["192.168.1.1", "10.0.0.1", "192.168.1.1", "172.16.0.1"]
unique_ips = list(set(raw_logs))
print("去重后 IP 列表:", unique_ips)`
          },
          {
            heading: '小结',
            text: '集合用 {} 定义，自动去重、没有顺序；set() 可以把列表转成集合去重；& 是交集、| 是并集、- 是差集；用 in 判断元素在不在集合里非常快。'
          }
        ],
        codeExample: `raw_logs = ["192.168.1.1", "10.0.0.1", "192.168.1.1", "172.16.0.1"]
unique_ips = list(set(raw_logs))
print("过滤重复 IP 列表:", unique_ips)`,
        tips: [
          '创建空集合必须使用 `set()` 构造器，直接写 `{}` 会被解析为空字典 `dict`。',
          '集合去重会丢失原有顺序，需要保留顺序不能直接用 set。'
        ]
      }
    },
    {
      id: 'p2_dict',
      title: 'Python 字典',
      stage: 'Python 容器',
      summary: '字典是「查名字找答案」的键值对，像真正的字典一样好用。',
      content: {
        overview: '字典（Dict）存的是「键值对」：一个名字对应一个值，就像真正的字典——查「苹果」得到它的释义。找数据时用键，速度快，不用从头翻到尾。',
        sections: [
          { heading: '生活小例子', text: '通讯录就是字典：contacts = {"小明": 13800000001, "小红": 13900000002}。想找小明的电话，直接 contacts["小明"] 就能拿到，比一页一页翻快多了。' },
          {
            heading: '常用字典方法 API',
            text: '• 访问值：`dict[key]` 直接访问（不存在报错）、`.get(key, default)` 安全访问\n• 添加/修改：直接赋值 `dict[key] = value`、`.update(other_dict)` 批量更新\n• 删除：`.pop(key)` 弹出值、`.popitem()` 弹出最后一对、`.clear()` 清空\n• 遍历视图：`.keys()` 所有键、`.values()` 所有值、`.items()` 所有键值对\n• 合并：Python 3.9+ 支持 `|` 运算符合并字典',
            table: {
              headers: ['方法', '功能', '特点'],
              rows: [
                ['get(key, default)', '安全获取值', 'key 不存在返回默认值，不报错'],
                ['items()', '获取键值对', '常用于 for 循环同时遍历键和值'],
                ['update(dict2)', '批量更新', '将 dict2 的键值对合并进来'],
                ['pop(key)', '弹出指定键的值', '返回对应的值，同时删除键值对'],
                ['setdefault(key, val)', '不存在则设置默认值', '避免键不存在的报错']
              ]
            },
            code: `student = {"id": 1001, "name": "Alice", "major": "Computer Science"}
print("安全访问缺失键:", student.get("gpa", 4.0))

# 字典合并 (Python 3.9+ | 运算符)
extra_info = {"gpa": 3.9, "graduated": True}
full_profile = student | extra_info
print("合并后的完整字典:\n", full_profile)

# 遍历键值对
for key, value in student.items():
    print(f"{key}: {value}")`
          },
          {
            heading: '字典推导式',
            text: '和列表推导式类似，字典推导式可以快速生成字典：\n格式：`{key表达式: value表达式 for 变量 in 可迭代对象 if 条件}`',
            code: `scores = {"Math": 95, "Physics": 88, "Chemistry": 92}

# 字典推导式过滤优秀科目
top_scores = {k: v for k, v in scores.items() if v >= 90}
print("优秀成绩字典:", top_scores)

# 将两个列表合并为字典
keys = ["a", "b", "c"]
values = [1, 2, 3]
new_dict = {k: v for k, v in zip(keys, values)}
print("列表生成字典:", new_dict)`
          },
          {
            heading: '字典核心特性与注意事项',
            text: '• 键的唯一性：同一个键多次赋值会覆盖旧值\n• 可哈希要求：键必须是不可变类型（str、int、tuple 等），列表、字典不能作为键\n• 有序性：Python 3.7+ 保证插入顺序，旧版本不保证\n• 查找效率：O(1) 时间复杂度，数据量大时优势明显',
            code: `# 键必须可哈希
good_dict = {(1, 2): "坐标点"}  # 元组可以当键
print("元组作为键:", good_dict[(1, 2)])

# bad_dict = {[1,2]: "test"}  # 列表不能当键，会报错`
          },
          {
            heading: '小结',
            text: '字典用 {键: 值} 定义，键不能重复；dict[键] 直接取值，dict.get(键) 安全取值（找不到返回 None）；键必须是字符串、数字这类不可变类型；字典会保持插入顺序。'
          }
        ],
        codeExample: `scores = {"Math": 95, "Physics": 88, "Chemistry": 92}
# 字典推导式过滤优秀科目
top_scores = {k: v for k, v in scores.items() if v >= 90}
print("优秀成绩字典:", top_scores)`,
        tips: [
          '字典的底层哈希表结构使得其数据检索复杂度为稳定的 O(1)。',
          '频繁根据键查找值的场景，优先用字典而不是列表遍历。'
        ]
      }
    }
  ]
};


const stage3 = {

  id: 'stage3',
  title: 'Python 控制流',
  icon: 'alt_route',
  topics: [
    {
      id: 'p3_ifelse',
      title: 'Python If Else',
      stage: 'Python 控制流',
      summary: '用 if 让程序「看情况办事」，像红绿灯一样分流。',
      content: {
        overview: '程序经常要「看情况办事」：如果……就……，否则就……。if 就是干这个的。它根据条件是真是假，决定执行哪一段代码，就像红绿灯决定车往哪走。',
        sections: [
          { heading: '生活小例子', text: '出门前看天气：如果下雨就带伞，否则就不带。程序里写成：if rain: 带伞，else: 不带。下雨（True）走带伞的分支，没下雨（False）走另一个分支，这就是 if/else。' },
          {
            heading: '分支结构完整语法',
            text: '• 基础语法：`if 条件:` 满足时执行\n• 多分支：`elif 条件:` 前面都不满足时判断\n• 收尾：`else:` 所有条件都不满足时执行\n• 注意：if/elif/else 是互斥的，只会执行第一个满足的分支',
            code: `score = 88
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"
print(f"分数 {score} 评定等级: {grade}")`
          },
          {
            heading: '三元表达式',
            text: '简单的二选一赋值可以用三元运算符一行写完，语法：\n`结果1 if 条件 else 结果2`\n条件为真返回结果1，为假返回结果2。适合简单赋值，复杂分支不建议滥用。',
            code: `score = 88
status = "Pass" if score >= 60 else "Fail"
print("最终考核状态:", status)

# 嵌套三元表达式（不推荐过度使用）
level = "优秀" if score >= 90 else "及格" if score >= 60 else "不及格"
print("评级:", level)`
          },
          {
            heading: 'match-case 模式匹配（Python 3.10+）',
            text: 'Python 3.10 新增 match-case 语法，支持更强大的模式匹配，适合多值分支场景。',
            code: `day = 3
match day:
    case 1:
        print("星期一")
    case 2:
        print("星期二")
    case 3 | 4 | 5:
        print("工作日中段")
    case 6 | 7:
        print("周末")
    case _:
        print("无效日期")`
          },
          {
            heading: '条件判断常见坑',
            text: '新手容易踩的分支判断陷阱：\n1. 混淆 `=` 和 `==`：赋值和相等判断搞混\n2. 浮点数直接用 `==` 比较：精度误差导致判断失败\n3. 多条件逻辑混乱：and 和 or 优先级搞错',
            code: `# 浮点数比较的正确姿势
a = 0.1 + 0.2
b = 0.3
print("直接 == 比较:", a == b)  # False
print("差值比较:", abs(a - b) < 1e-6)  # True，推荐写法`
          },
          {
            heading: '小结',
            text: 'if 条件: 后面跟缩进的代码，条件为 True 才执行；else 处理「否则」的情况；elif 可以接多个条件依次判断；x if 条件 else y 是三元的简写。'
          }
        ],
        codeExample: `num = -15
if num > 0:
    print("数值为正数")
elif num < 0:
    print("数值为负数")
else:
    print("数值为零")`,
        tips: [
          '使用嵌套分支时避免层级过深，可采用提前返回（Early Return）优化代码。',
          '条件较多时优先用字典映射替代多层 elif，代码更简洁易维护。'
        ]
      }
    },
    {
      id: 'p3_while',
      title: 'Python While 循环',
      stage: 'Python 控制流',
      summary: 'while 循环是「只要条件满足就一直重复」的循环。',
      content: {
        overview: 'while 循环就是「只要条件还成立，就一直重复做某件事」。它适合那种不知道要做多少次、由条件决定什么时候停下来的场景。',
        sections: [
          { heading: '生活小例子', text: '数钱直到数完：while 口袋里还有钱: 取出一张。条件（还有钱）为真就一直取，取完（没钱）就停。程序里 while count < 5: 就是「还没数到 5 就继续」。' },
          {
            heading: '循环控制关键字',
            text: '• `break`：立即彻底退出整个循环，不再判断条件\n• `continue`：跳过本次循环剩余代码，直接进入下一轮条件判断\n• `while-else`：当 while 循环自然结束（未被 break 中断）时执行 else 块',
            code: `count = 1
while count <= 5:
    print("循环迭代次数:", count)
    count += 1
else:
    print("while 循环自然执行完毕，未被 break 中断。")`
          },
          {
            heading: '死循环的识别与避免',
            text: '如果循环条件永远为 True，且循环内没有 break，就会形成死循环，导致程序卡死。\n编写 while 循环必须确保：\n1. 循环变量有初始值\n2. 循环体内更新循环变量\n3. 条件存在收敛的趋势',
            code: `# 正确的循环：count 不断增加，最终条件不成立
count = 0
while count < 3:
    print("安全循环:", count)
    count += 1

# 死循环示例（不要运行！）
# while True:
# •    print("死循环")`
          },
          {
            heading: '循环嵌套示例：九九乘法表',
            text: 'while 循环可以嵌套使用，外层循环控制行，内层循环控制列。',
            code: `i = 1
while i <= 9:
    j = 1
    while j <= i:
        print(f"{j}×{i}={i*j}", end="\t")
        j += 1
    print()  # 换行
    i += 1`
          },
          {
            heading: '小结',
            text: 'while 条件: 循环体，条件为 True 就一直执行；break 立刻跳出循环，continue 跳过本次继续下一轮；小心死循环——条件一直为 True 且没有 break，程序会永远转下去。'
          }
        ],
        codeExample: `idx = 0
while idx < 10:
    idx += 1
    if idx % 2 == 0:
        continue  # 跳过偶数
    if idx > 7:
        break     # 大于7退出循环
    print("奇数打印:", idx)`,
        tips: [
          '在编写 while 循环时，必须确保循环条件存在收敛趋势，防止引发无限死循环。',
          '循环次数确定的场景优先用 for 循环，逻辑更清晰，不易写出死循环。'
        ]
      }
    },
    {
      id: 'p3_for',
      title: 'Python For 循环',
      stage: 'Python 控制流',
      summary: 'for 循环是「挨个处理」的循环，遍历列表、字符串超方便。',
      content: {
        overview: 'for 循环用来「挨个处理」一串东西：列表里的每个元素、字符串里的每个字符，都能依次取出来处理。它是最常用的循环，比 while 更适合「数得清」的场景。',
        sections: [
          { heading: '生活小例子', text: '点名：老师拿着名单，从第一个同学念到最后一个。for name in ["小明", "小红", "小刚"]: 依次把每个人念出来，不用手动数下标，非常省事。' },
          {
            heading: 'range() 生成器详解',
            text: '`range(start, stop[, step])` 生成等差整数序列，惰性计算，不占内存。\n• 一个参数：`range(n)` 生成 0 到 n-1\n• 两个参数：`range(a, b)` 生成 a 到 b-1\n• 三个参数：`range(a, b, step)` 指定步长，步长为负可倒序',
            code: `print("0到4:", list(range(5)))
print("3到7:", list(range(3, 8)))
print("0到10偶数:", list(range(0, 11, 2)))
print("10到1倒序:", list(range(10, 0, -1)))`
          },
          {
            heading: '常用迭代辅助工具',
            text: '• `enumerate(iterable, start=0)`：同时获取索引序号与元素，避免手动计数\n• `zip(iter1, iter2)`：并行配对多个可迭代对象，按最短的结束\n• 两个工具可以组合使用',
            code: `fruits = ["apple", "banana", "cherry"]
prices = [10.5, 5.0, 15.8]

# enumerate 与 zip 结合
for idx, (fruit, price) in enumerate(zip(fruits, prices), start=1):
    print(f"序号 [{idx}] 水果: {fruit:<8} | 单价: ￥{price:.2f}")`
          },
          {
            heading: 'for-else 语法',
            text: '和 while-else 类似，for 循环正常遍历完（没被 break 中断）就执行 else。常用于查找场景：找到就 break，没找到执行 else 提示。',
            code: `numbers = [1, 3, 5, 7, 9]
target = 6

for num in numbers:
    if num == target:
        print("找到目标数字:", target)
        break
else:
    print("列表中没有找到", target)`
          },
          {
            heading: '小结',
            text: 'for 变量 in 可迭代对象: 循环体，依次取出每个元素；range(5) 生成 0 到 4，用来控制循环次数；enumerate() 同时拿到序号和元素；zip() 可以同时遍历多个列表。'
          }
        ],
        codeExample: `# 计算 1 至 100 的累加加和
total_sum = sum(range(1, 101))
print("1 到 100 累加加和结果:", total_sum)`,
        tips: [
          '`range()` 对象不会在内存中预先装载完整列表，而是采用按需生成机制。',
          '需要索引时优先用 enumerate，不要用 for i in range(len(lst)) 这种写法。'
        ]
      }
    },
    {
      id: 'p3_input',
      title: 'Python 命令输入',
      stage: 'Python 控制流',
      summary: '用 input() 让程序「问用户问题」，拿到回答再继续。',
      content: {
        overview: 'input() 让程序停下来问用户问题，等用户输入文字并按回车，再把输入的内容交给程序处理。记住：它拿到的永远是文字（字符串）。',
        sections: [
          { heading: '生活小例子', text: '猜年龄小游戏：input("你多大了？") 会停下来等你输入。比如输入 18，程序拿到的是文字 "18"，想用来算年龄，就得先 int() 转成数字。' },
          {
            heading: '基础输入与类型转换',
            text: 'input() 永远返回字符串，获取数字必须手动强转。\n非合法输入强转会抛出 ValueError，需要用 try-except 捕获处理。',
            code: `# 模拟控制台输入（Python You 环境演示）
raw_value = "25"
try:
    age = int(raw_value)
    print(f"校验成功，用户年龄: {age} 岁")
except ValueError:
    print("输入格式错误，无法转换为有效的整数")`
          },
          {
            heading: '一行输入多个数据',
            text: '用户输入多个数据时，用 split() 分割，再批量转类型。',
            code: `# 模拟一行输入多个数字
mock_input = "10.5, 20.3, 30.2"
float_numbers = [float(x.strip()) for x in mock_input.split(",") if x.strip()]
print("解析浮点数据列表:", float_numbers)
print("求和结果:", sum(float_numbers))`
          },
          {
            heading: '完整交互示例：猜数字游戏',
            text: '结合循环、分支、输入与异常处理，实现完整小游戏逻辑。',
            code: `# 简化版猜数字游戏
import random
answer = random.randint(1, 100)
guesses = 0

# 模拟 3 次猜测
for guess_str in ["50", "abc", "75"]:
    guesses += 1
    try:
        guess = int(guess_str)
    except ValueError:
        print("请输入有效数字！")
        continue
    
    if guess > answer:
        print("猜大了")
    elif guess < answer:
        print("猜小了")
    else:
        print(f"恭喜猜对了！答案就是 {answer}，用了 {guesses} 次")
        break`
          },
          {
            heading: '小结',
            text: 'input("提示语") 返回用户输入的文字（字符串）；数字输入记得用 int() 或 float() 转换；输入可能出错，配合 try/except 异常处理程序更稳。'
          }
        ],
        codeExample: `mock_input = "10.5, 20.3, 30.2"
float_numbers = [float(x.strip()) for x in mock_input.split(",") if x.strip()]
print("解析浮点数据列表:", float_numbers)`,
        tips: [
          '在 Python You 交互终端中，命令行支持实时模拟用户输入的交互操作。',
          '处理用户输入一定要加异常校验，不要假设用户会按要求输入。'
        ]
      }
    },
    {
      id: 'p3_formatting',
      title: 'Python 字符串格式化',
      stage: 'Python 控制流',
      summary: '把变量「塞进」句子里，用 f-string 最方便。',
      content: {
        overview: '字符串格式化就是把变量的值「塞进」一段文字里。比如「我今年 18 岁」，18 是变量，怎么把它放进句子里？Python 有 f-string、format()、% 三种方法，其中 f-string 最好用。',
        sections: [
          { heading: '生活小例子', text: '发朋友圈：「今天跑了 5 公里」。如果公里数是变量 km，用 f-string 直接写：f"今天跑了 {km} 公里"，把变量放进花括号里，句子自动拼好。' },
          {
            heading: '三种格式化方案对比',
            text: '',
            table: {
              headers: ['方案', '语法示例', '优点', '缺点', '推荐程度'],
              rows: [
                ['f-string', 'f"{name}: {age}"', '简洁直观、速度最快、功能强', 'Python 3.6+ 才支持', '★★★★★ 推荐'],
                ['str.format()', '"{}: {}".format(name, age)', '功能丰富、兼容旧版本', '写法稍繁琐', '★★★ 兼容用'],
                ['% 格式化', '"%s: %d" % (name, age)', '最传统、写法简单', '功能弱、易出错', '• 不推荐']
              ]
            }
          },
          {
            heading: 'f-string 格式修饰符详解',
            text: '在大括号 `{value:format_spec}` 内使用格式修饰符控制展示效果：',
            table: {
              headers: ['控制格式', '语法', '输入', '输出', '功能说明'],
              rows: [
                ['保留小数', '{val:.2f}', '3.14159', '3.14', '四舍五入保留指定位数'],
                ['百分比', '{val:.1%}', '0.856', '85.6%', '自动转为百分比显示'],
                ['补零填充', '{val:05d}', '42', '00042', '整数前导补零对齐'],
                ['对齐宽度', '{val:>10}', '"Py"', '•        Py', '右对齐，限定总宽度'],
                ['千分位', '{val:,}', '1000000', '1,000,000', '大数值添加千分位分隔符'],
                ['进制转换', '{val:x}', '255', 'ff', '转十六进制']
              ]
            },
            code: `pi = 3.1415926535
revenue = 12500000
print(f"圆周率精确到 4 位小数: {pi:.4f}")
print(f"公司年度营收(千分位): ￥{revenue:,}")
print(f"百分比显示: {0.856:.1%}")`
          },
          {
            heading: 'f-string 高级用法',
            text: 'f-string 大括号内可以直接写表达式、调用函数，非常灵活。',
            code: `name = "Alice"
score = 92
print(f"学生: {name.upper()}, 评级: {'优秀'• if score >= 90 else '良好'}")

# 自文档化写法（Python 3.8+）
x = 10
y = 20
print(f"{x = }, {y = }, {x + y = }")`
          },
          {
            heading: '小结',
            text: 'f-string 写法：f"文字 {变量}"，最直观；format() 用 {} 占位，适合反复套用的模板；% 是早期写法，了解一下即可；f-string 里还能写简单表达式，比如 {a + b}。'
          }
        ],
        codeExample: `val = 42
print(f"二进制: {val:b} | 八进制: {val:o} | 十六进制: {val:x}")`,
        tips: [
          'f-string 可以在 `{}` 中直接调用函数或计算表达式（如 `{x.upper()}`）。',
          '新项目统一使用 f-string，旧代码兼容才考虑 str.format()。'
        ]
      }
    }
  ]
};


const stage4 = {

  id: 'stage4',
  title: 'Python 函数与对象',
  icon: 'code_off',
  topics: [
    {
      id: 'p4_functions',
      title: 'Python 函数',
      stage: 'Python 函数与对象',
      summary: '函数是把重复代码「打包」成工具，随取随用。',
      content: {
        overview: '函数就是把一段重复用的代码「打包」成一个工具：起个名字，需要时一调用就执行。就像厨房里的菜谱——按步骤做菜，想吃什么照着做就行，不用每次都重新发明。',
        sections: [
          { heading: '生活小例子', text: '每天都要给好朋友发早安问候，与其每次都打一遍，不如定义一个函数 say_hi()，里面写好「你好呀！」。以后只要调用 say_hi()，问候就自动发出去了。' },
          {
            heading: '参数类型全解',
            text: 'Python 函数参数分为四大类，定义顺序必须遵守：位置参数 → 默认参数 → *args → **kwargs\n1. 位置参数：按顺序一一匹配，调用时必须传入\n2. 默认参数：有默认值，调用时可省略，必须放在位置参数之后\n3. 变长位置参数 `*args`：接收多余位置参数，打包成元组\n4. 变长关键字参数 `**kwargs`：接收多余关键字参数，打包成字典',
            table: {
              headers: ['参数类型', '语法', '特点', '适用场景'],
              rows: [
                ['位置参数', 'def f(a, b)', '必须按顺序传入', '必填参数'],
                ['默认参数', 'def f(a, b=10)', '可省略，有默认值', '非必填参数'],
                ['*args', 'def f(*args)', '接收任意多位置参数', '参数数量不确定'],
                ['**kwargs', 'def f(**kwargs)', '接收任意多关键字参数', '动态键值参数']
              ]
            },
            code: `def build_user_profile(username, email, *hobbies, **attributes):\n    profile = {\n        "username": username,\n        "email": email,\n        "hobbies": hobbies,\n        "metadata": attributes\n    }\n    return profile\n\nuser = build_user_profile("alice", "alice@test.com", "coding", "reading", role="admin", level=5)\nprint("构造的用户字典:\\n", user)`
          },
          {
            heading: '默认参数的经典坑',
            text: '• 绝对不要使用可变对象（列表、字典）作为默认参数！\n默认参数只在函数定义时计算一次，多次调用会共享同一个对象，导致累积副作用。\n正确做法：用 None 作为默认值，函数内部延迟初始化。',
            code: `# • 错误写法：可变默认参数\ndef add_item(item, lst=[]):\n    lst.append(item)\n    return lst\n\nprint(add_item(1))  # [1]\nprint(add_item(2))  # [1, 2] —— 累积了，不符合预期\n\n# • 正确写法：None 延迟初始化\ndef add_item_fixed(item, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(item)\n    return lst\n\nprint(add_item_fixed(1))  # [1]\nprint(add_item_fixed(2))  # [2] —— 每次都是新列表`
          },
          {
            heading: '函数返回值',
            text: '• 无 return 语句：默认返回 None\n• 单个 return：返回指定值\n• 多个返回值：本质是返回一个元组，可直接解包接收\n• return 会立即终止函数执行，后面的代码不会运行',
            code: `def calculate(a, b):\n    sum_val = a + b\n    product = a * b\n    return sum_val, product  # 返回元组\n\ns, p = calculate(3, 4)\nprint("和:", s, "积:", p)`
          },
          {
            heading: '小结',
            text: '用 def 函数名(参数): 定义函数，用 函数名(实参) 调用；参数是函数的「输入」，return 是「输出」；def greet(name): 里的 name 叫参数，greet("小明") 传的是实参。'
          }
        ],
        codeExample: `def multiply_all(*numbers):\n    result = 1\n    for n in numbers:\n        result *= n\n    return result\n\nprint("变长乘积计算:", multiply_all(2, 3, 4, 5))`,
        tips: [
          '切勿使用可变对象（如列表或字典）作为函数的默认参数值，应采用 None 进行延迟赋值。',
          '函数职责要单一，一个函数只做一件事，不要写几百行的大函数。'
        ]
      }
    },
    {
      id: 'p4_lambda',
      title: 'Python Lambda',
      stage: 'Python 函数与对象',
      summary: 'lambda 是「一句话」的小函数，适合临时用一下。',
      content: {
        overview: 'lambda 是一种「一句话写完」的小函数，不用起名字、不用写 def，适合临时用一下的简单逻辑。格式：lambda 参数: 返回值表达式。',
        sections: [
          { heading: '生活小例子', text: '给一堆数字排序，想按「离 10 的距离」排：sorted(nums, key=lambda x: abs(x - 10))。这个小函数只干一件事——算出每个数离 10 多远，用完即弃，不用专门起名字。' },
          {
            heading: 'lambda 与普通函数对比',
            text: '',
            table: {
              headers: ['对比项', 'def 普通函数', 'lambda 匿名函数'],
              rows: [
                ['语法', '多行完整定义', '单行表达式'],
                ['函数名', '有函数名', '匿名，通常只使用一次'],
                ['复杂度', '支持任意复杂逻辑', '只能有一个表达式'],
                ['适用场景', '复杂逻辑、多次调用', '简单回调、临时使用']
              ]
            },
            code: `# 等价的两种写法\ndef add_def(a, b):\n    return a + b\n\nadd_lambda = lambda a, b: a + b\n\nprint("def 函数:", add_def(3, 4))\nprint("lambda 函数:", add_lambda(3, 4))`
          },
          {
            heading: '高阶函数搭配实战',
            text: 'Lambda 最常用的三个场景：sorted 排序 key、map 映射、filter 过滤。',
            code: `products = [\n    {"name": "Laptop", "price": 8999},\n    {"name": "Mouse", "price": 199},\n    {"name": "Keyboard", "price": 499}\n]\n\n# 1. 按价格排序（最常用场景）\nproducts.sort(key=lambda item: item["price"])\nprint("按价格升序排列:\\n", products)\n\n# 2. map 映射转换\nprices = list(map(lambda p: p["price"], products))\nprint("提取价格列表:", prices)\n\n# 3. filter 过滤筛选\ncheap = list(filter(lambda p: p["price"] < 500, products))\nprint("便宜商品:", cheap)`
          },
          {
            heading: '使用建议与误区',
            text: '• lambda 只适合简单逻辑，复杂逻辑请写普通 def 函数\n• 不要强行给 lambda 赋值命名，不如直接写 def\n• 大多数场景下，列表推导式比 map/filter+lambda 更易读',
            code: `# 列表推导式 vs filter+lambda\nnums = [1, 2, 3, 4, 5, 6]\n\n# filter + lambda 写法\nevens1 = list(filter(lambda x: x % 2 == 0, nums))\n\n# 列表推导式写法（更推荐）\nevens2 = [x for x in nums if x % 2 == 0]\n\nprint("两种方式结果一致:", evens1 == evens2)`
          },
          {
            heading: '小结',
            text: 'lambda 参数: 表达式，一行写完、自动返回结果；适合配合 sorted、map、filter 一起用；逻辑一复杂就别用 lambda，老老实实写 def 更清楚。'
          }
        ],
        codeExample: `numbers = [1, 2, 3, 4, 5, 6, 7, 8]\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nsquared = list(map(lambda x: x ** 2, evens))\nprint("过滤偶数:", evens)\nprint("偶数平方映射:", squared)`,
        tips: [
          'Lambda 主体中只能书写单个简单表达式，不能包含复杂的赋值语句或循环。',
          '排序时指定 key 函数是 lambda 最经典的使用场景。'
        ]
      }
    },
    {
      id: 'p4_array',
      title: 'Python 数组',
      stage: 'Python 函数与对象',
      summary: 'array 是「统一类型」的紧凑数组，存大量数字更省内存。',
      content: {
        overview: '列表能装各种类型，很方便，但如果要存成千上万个同类型的数字，用标准库的 array 更省内存、更快。就像统一规格的货架比杂物筐更能装。',
        sections: [
          { heading: '生活小例子', text: '存一万个整数：列表 list 像杂货筐，什么都能放但占地方；array 像整齐的格子货架，只放整数，紧凑又高效。数据量小用列表就行，量大再考虑 array。' },
          {
            heading: 'array 与 list 核心对比',
            text: '',
            table: {
              headers: ['对比项', 'list 列表', 'array 数组'],
              rows: [
                ['元素类型', '任意混合类型', '必须是同类型数值'],
                ['内存占用', '大（存对象引用）', '小（紧凑存储二进制）'],
                ['功能', '丰富，支持增删改查', '较少，仅基础数值操作'],
                ['适用场景', '通用场景、混合数据', '大规模数值计算、节省内存']
              ]
            }
          },
          {
            heading: '常用类型码 (Type Codes)',
            text: '创建 array 时必须指定类型码，决定了存储的数值类型与占用字节数：\n• `"b"` / `"B"`：有符号/无符号 8 位整数\n• `"i"` / `"I"`：有符号/无符号 32 位整数\n• `"f"`：单精度浮点数（4 字节）\n• `"d"`：双精度浮点数（8 字节）',
            code: `import array\n\n# 创建带符号整数数组\nint_array = array.array('i', [10, 20, 30, 40, 50])\nint_array.append(60)\nprint("数组元素:", int_array)\nprint("单个元素字节数:", int_array.itemsize)\nprint("总占用字节数:", int_array.buffer_info()[1] * int_array.itemsize)`
          },
          {
            heading: 'array 常用方法',
            text: '支持 append、pop、insert、remove 等列表常用方法，还支持：\n• `.fromlist(lst)`：从列表批量添加\n• `.tolist()`：转为普通列表\n• `.byteswap()`：字节序转换',
            code: `import array\narr = array.array('i', [1, 2, 3])\narr.fromlist([4, 5, 6])\nprint("批量添加后:", arr)\nprint("转回列表:", arr.tolist())`
          },
          {
            heading: '小结',
            text: 'array.array 存同类型数据，比列表省内存；创建时指定类型码，比如 "i" 表示整数、"d" 表示小数；大多数场景用列表就够，海量同质数据才需要 array。'
          }
        ],
        codeExample: `import array\nfloats = array.array('d', [1.1, 2.2, 3.3])\nprint("双精度浮点数组:", floats)`,
        tips: [
          '进行大规模科学计算与多维矩阵运算时，请优先使用扩展库 NumPy。',
          '普通小规模数据用 list 即可，array 适合十万级以上同质数值数据。'
        ]
      }
    },
    {
      id: 'p4_class',
      title: 'Python 类/对象',
      stage: 'Python 函数与对象',
      summary: '类是「设计图」，对象是照图做出来的「实物」。',
      content: {
        overview: '面向对象编程（OOP）把程序看成「对象」的世界：类（Class）是设计图，对象（Object）是照图做出来的实物。比如「狗」是类，你家的「旺财」是对象。',
        sections: [
          { heading: '生活小例子', text: '蛋糕店：模具（类）可以反复使用，每个用模具烤出来的蛋糕（对象）都长得一样，但可以加不同的水果装饰。Python 里 class Dog: 定义模具，Dog() 做出对象。' },
          {
            heading: '面向对象核心概念',
            text: '• 类（Class）：对象的模板，定义了共同的属性和方法\n• 对象/实例（Object/Instance）：根据类创建的具体实体\n• 属性（Attribute）：对象的数据、特征\n• 方法（Method）：对象的行为、功能\n• 封装：将数据和操作数据的方法绑定在一起，对外隐藏内部细节',
            code: `# 定义一个银行账户类\nclass BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner          # 公开实例属性\n        self.__balance = balance    # 私有属性（双下划线开头）\n        \n    def deposit(self, amount: float):\n        \"\"\"存款方法\"\"\"\n        if amount > 0:\n            self.__balance += amount\n            print(f"成功存入 ￥{amount}, 当前余额: ￥{self.__balance}")\n    \n    def withdraw(self, amount: float):\n        \"\"\"取款方法\"\"\"\n        if 0 < amount <= self.__balance:\n            self.__balance -= amount\n            print(f"成功取出 ￥{amount}, 当前余额: ￥{self.__balance}")\n            return True\n        print("余额不足或金额无效")\n        return False\n            \n    def get_balance(self) -> float:\n        \"\"\"查询余额（只读访问）\"\"\"\n        return self.__balance\n\n# 创建实例对象\nacc = BankAccount("Alice", 1000.0)\nacc.deposit(500.0)\nacc.withdraw(300.0)\nprint("最终账户余额:", acc.get_balance())`
          },
          {
            heading: 'self 参数详解',
            text: '所有实例方法的第一个参数必须是 self，它代表当前实例对象本身。\n• 通过 self.xxx 访问实例属性\n• 通过 self.xxx() 调用其他实例方法\n• 调用方法时不需要手动传 self，Python 会自动传入',
            code: `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def introduce(self):\n        # 用 self 访问自身属性和方法\n        print(f"我叫 {self.name}，今年 {self.age} 岁")\n\np = Person("Bob", 20)\np.introduce()  # 调用时不用传 self`
          },
          {
            heading: '类属性 vs 实例属性',
            text: '• 实例属性：每个对象独有一份，互不影响，在 __init__ 中定义\n• 类属性：所有实例共享同一份，属于类本身，直接写在类里',
            code: `class Circle:\n    pi = 3.14159  # 类属性，所有圆共享\n    \n    def __init__(self, radius):\n        self.radius = radius  # 实例属性，每个圆不一样\n    \n    def area(self):\n        return Circle.pi * (self.radius ** 2)\n\nc1 = Circle(5)\nc2 = Circle(10)\nprint("c1 面积:", c1.area())\nprint("c2 面积:", c2.area())`
          },
          {
            heading: '小结',
            text: 'class 类名: 定义类，类名一般首字母大写；__init__ 是构造方法，负责给新对象「初始化」；self 代表「这个对象自己」，方法里通过 self 访问属性；用 类名() 创建对象。'
          }
        ],
        codeExample: `class Circle:\n    pi = 3.14159  # 类属性\n    def __init__(self, radius):\n        self.radius = radius\n    def area( self ):\n        return Circle.pi * (me.radius ** 2)\n\nc = Circle(5)\nprint(f"半径为 5 的圆面积为: {c.area():.2f}")`,
        tips: [
          '类属性被所有该类的实例对象共享，而实例属性仅归属于具体单个实例。',
          '双下划线开头的属性是名称改写，不是真正的私有，只是一种约定保护。'
        ]
      }
    },
    {
      id: 'p4_inheritance',
      title: 'Python 继承',
      stage: 'Python 函数与对象',
      summary: '继承让新类「继承」老类的能力，还能自己修改。',
      content: {
        overview: '继承就是「子承父业」：子类（孩子）自动拥有父类（父母）的属性和方法，还可以按需重写或新增。这样就不用把相同的代码再写一遍。',
        sections: [
          { heading: '生活小例子', text: '「动物」类会呼吸、会动；「狗」继承动物，自动会呼吸、会动，还多一个「汪汪叫」；「猫」继承动物，多个「喵喵叫」。子类省去重复代码，只写自己特有的部分。' },
          {
            heading: '单继承基础语法',
            text: '• 语法：`class 子类名(父类名):`\n• 子类拥有父类所有的属性和方法\n• 子类可以新增自己的属性和方法\n• 子类可以重写父类的方法',
            code: `class Vehicle:\n    def __init__(self, brand, speed):\n        self.brand = brand\n        self.speed = speed\n        \n    def drive(self):\n        print(f"{self.brand} 正在以 {self.speed} km/h 行驶")\n\nclass ElectricCar(Vehicle):\n    def __init__(self, brand, speed, battery_capacity):\n        super().__init__(brand, speed)  # 调用父类构造方法\n        self.battery_capacity = battery_capacity  # 子类新增属性\n        \n    def drive(self):  # 重写父类方法\n        print(f"{self.brand} 电动车 (电池 {self.battery_capacity}kWh) 静音行驶中")\n    \n    def charge(self):  # 子类新增方法\n        print(f"{self.brand} 正在充电...")\n\ntesla = ElectricCar("Tesla", 120, 75)\ntesla.drive()\ntesla.charge()`
          },
          {
            heading: 'super() 函数详解',
            text: '`super()` 用于调用父类的方法，最常用于构造方法初始化。\n• 保证父类属性被正确初始化\n• 多重继承下按照 MRO 顺序调用，避免重复调用\n• 方法重写后仍能调用父类原方法',
            code: `class Student(Person):\n    def __init__(self, name, age, student_id):\n        super().__init__(name, age)  # 复用父类初始化\n        self.student_id = student_id  # 新增属性`
          },
          {
            heading: '多重继承与 MRO',
            text: 'Python 支持一个类继承多个父类，称为多重继承。\n方法解析顺序（MRO）决定了方法查找的优先级，可以用 `类名.__mro__` 查看。\n原则：子类优先于父类，同级按继承顺序从左到右。',
            code: `print("查看 ElectricCar 的 MRO 解析链:")\nfor cls in ElectricCar.__mro__:\n    print(" ->", cls.__name__)`
          },
          {
            heading: '小结',
            text: 'class 子类(父类): 就实现了继承；子类自动拥有父类的方法，也可以重写；super() 用来调用父类的方法；子类对象既是子类类型，也是父类类型。'
          }
        ],
        codeExample: `print("查看 ElectricCar 的 MRO 解析链:")\nfor cls in ElectricCar.__mro__:\n    print(" ->", cls.__name__)`,
        tips: [
          '可以通过 `issubclass(Child, Parent)` 校验类之间的继承关系。',
          '多重继承容易让代码变复杂，非必要不使用，优先用组合替代继承。'
        ]
      }
    },
    {
      id: 'p4_iterators',
      title: 'Python 迭代',
      stage: 'Python 函数与对象',
      summary: '迭代就是「一个一个地取」，生成器边算边给、省内存。',
      content: {
        overview: '迭代就是从一个集合里「一个一个」地把元素取出来。生成器（Generator）更聪明：它不一次性生成全部数据，而是「用到一个算一个」，处理海量数据时特别省内存。',
        sections: [
          { heading: '生活小例子', text: '点菜上菜：普通列表像一次性做好 100 道菜端上来，占地方；生成器像「报一道上一道」，厨房边做边上。处理 100 万个数字时，生成器几乎不占内存。' },
          {
            heading: '迭代器协议',
            text: '可迭代对象（Iterable）：实现了 `__iter__()` 方法，能被 for 循环遍历（如 list、str、dict）。\n迭代器（Iterator）：同时实现了 `__iter__()` 和 `__next__()` 方法，调用 next() 逐个返回元素。\n• `iter(可迭代对象)` 获取迭代器\n• `next(迭代器)` 获取下一个元素，没有了抛出 StopIteration',
            code: `nums = [1, 2, 3]\nit = iter(nums)  # 获取迭代器\nprint(next(it))  # 1\nprint(next(it))  # 2\nprint(next(it))  # 3`
          },
          {
            heading: '生成器函数与 yield',
            text: '函数体内包含 `yield` 就是生成器函数，调用它返回生成器对象，不会立即执行函数体。\n每次调用 next() 执行到下一个 yield 处挂起，返回值；下次调用从挂起处继续。',
            code: `def fibonacci_generator(n):\n    a, b = 0, 1\n    count = 0\n    while count < n:\n        yield a  # 产出值并挂起\n        a, b = b, a + b\n        count += 1\n\n# 使用生成器输出斐波那契数列\nfor num in fibonacci_generator(8):\n    print("Fibonacci 项:", num)`
          },
          {
            heading: '生成器表达式',
            text: '把列表推导式的方括号换成圆括号就是生成器表达式，惰性计算，几乎不占内存。\n适合处理百万级大数据流。',
            code: `# 生成器表达式（惰性，不占内存）\nsquares_gen = (x ** 2 for x in range(1000000))\nprint("生成器创建成功，内存占用极小:", type(squares_gen))\nprint("获取首个元素:", next(squares_gen))`
          },
          {
            heading: '小结',
            text: 'for 循环本质就是迭代：逐个取出元素；yield 能把普通函数变成生成器；生成器「惰性求值」——用多少算多少，省内存；next() 可以手动取下一个元素。'
          }
        ],
        codeExample: `# 生成器表达式 (Generator Expression)\nsquares_gen = (x ** 2 for x in range(1000000))\nprint("生成器表达式创建成功，内存占用极小:", type(squares_gen))\nprint("获取首个元素:", next(squares_gen))`,
        tips: [
          '生成器表达式比列表推导式在处理百万级大数据流时更加节省内存空间。',
          '生成器只能遍历一次，遍历完就空了，需要重新创建。'
        ]
      }
    },
    {
      id: 'p4_polymorphism',
      title: 'Python 多态',
      stage: 'Python 函数与对象',
      summary: '多态就是「鸭子类型」：会走会叫，就当它是鸭子。',
      content: {
        overview: '有一句经典的话：「如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。」Python 的多态就是这样：不关心对象是什么类，只关心它有没有我们需要的方法，这叫鸭子类型。',
        sections: [
          { heading: '生活小例子', text: '你想让宠物「叫」，不管是狗、猫还是鸭子，只要它们都有 make_sound() 这个方法，就能用同一段代码统一调用。程序不用知道具体是哪种动物，只要「会叫」就行。' },
          {
            heading: '鸭子类型与多态',
            text: '不同的类只要实现了同名方法，就可以在同一个函数中统一调用，不需要继承同一个父类。\n这就是「面向接口编程，而非面向实现编程」的思想。',
            code: `class PDFExporter:\n    def export(self, data):\n        print(f"将数据导出为 PDF 格式")\n\nclass CSVExporter:\n    def export(self, data):\n        print(f"将数据导出为 CSV 表格")\n\nclass ExcelExporter:\n    def export(self, data):\n        print(f"将数据导出为 Excel 文件")\n\ndef generate_report(exporter, data):\n    exporter.export(data)  # 只要有 export 方法就能用\n\n# 三种不同类的对象，同一个函数调用\ngenerate_report(PDFExporter(), [10, 20])\ngenerate_report(CSVExporter(), [10, 20])\ngenerate_report(ExcelExporter(), [10, 20])`
          },
          {
            heading: '抽象基类 ABC',
            text: '如果需要强制子类必须实现某些方法，可以使用 abc 模块定义抽象基类。\n包含抽象方法的类不能实例化，子类必须实现所有抽象方法才能实例化。',
            code: `from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self):\n        \"\"\"计算面积，子类必须实现\"\"\"\n        pass\n\nclass Rectangle(Shape):\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nr = Rectangle(3, 4)\nprint("矩形面积:", r.area())`
          },
          {
            heading: '多态的优势',
            text: '1. 扩展性强：新增同类功能只需加新类，不用改原有代码\n2. 降低耦合：调用方只关心接口，不关心具体实现\n3. 代码简洁：统一调用方式，减少重复判断逻辑'
          },
          {
            heading: '小结',
            text: 'Python 看的是「有没有这个方法」，而不是「是不是这个类」；不同对象有相同的方法名，就能用同一段代码处理；这样写出的代码更灵活，也方便扩展。'
          }
        ],
        codeExample: `class Dog:\n    def speak(self): return "Woof!"\nclass Cat:\n    def speak(self): return "Meow!"\n\nanimals = [Dog(), Cat()]\nfor a in animals:\n    print(a.speak())`,
        tips: [
          '可以使用 abc 模块的 `ABCMeta` 和 `@abstractmethod` 强制子类规范接口实现。',
          'Python 更推崇鸭子类型，不要为了用多态而强行写继承层级。'
        ]
      }
    },
    {
      id: 'p4_scope',
      title: 'Python 作用域',
      stage: 'Python 函数与对象',
      summary: '作用域决定变量「在哪里有效」，记住 LEGB 规则。',
      content: {
        overview: '作用域就是变量「有效的地盘」：函数里定义的变量，出了函数就找不到了。Python 查找变量按 LEGB 顺序：先在函数里找（Local），再到外层函数（Enclosing），再到全局（Global），最后到内置（Built-in）。',
        sections: [
          { heading: '生活小例子', text: '就像班级的「值日表」和学校的「作息表」：班级值日表只在班里有效（局部变量），学校作息表全校通用（全局变量）。在班里查东西先看班里的表，查不到再看全校的。' },
          {
            heading: 'LEGB 四层作用域',
            text: '1. **Local 局部作用域**：函数内部定义的变量\n2. **Enclosing 嵌套作用域**：外层函数的变量（闭包场景）\n3. **Global 全局作用域**：模块层级的变量\n4. **Built-in 内置作用域**：解释器内置的标识符（如 len、range、print）\n\n查找顺序：从内到外依次查找，找到就停止，找不到报错。',
            table: {
              headers: ['作用域层级', '英文全称', '说明'],
              rows: [
                ['局部', 'Local', '函数/方法内部'],
                ['嵌套', 'Enclosing', '外层函数（闭包）'],
                ['全局', 'Global', '当前模块/文件'],
                ['内置', 'Built-in', 'Python 内置函数名']
              ]
            }
          },
          {
            heading: 'global 与 nonlocal',
            text: '默认情况下，函数内只能读取外部变量，赋值会被当作新建局部变量。\n• `global x`：声明在函数内修改全局变量 x\n• `nonlocal x`：声明在闭包内修改外层嵌套函数的变量 x',
            code: `count = 0  # 全局变量\n\ndef outer_function():\n    msg = "Outer"  # 嵌套变量\n    def inner_function():\n        nonlocal msg        # 修改外层函数变量\n        msg = "Inner Modified"\n        global count        # 修改全局变量\n        count += 1\n    inner_function()\n    print("闭包修改后的 msg:", msg)\n\nouter_function()\nprint("全局修改后的 count:", count)`
          },
          {
            heading: '常见作用域坑点',
            text: '• 函数内赋值变量会被认为是局部变量，即使外面有同名全局变量\n• 先引用后赋值会报错 UnboundLocalError\n• 不要定义和内置函数同名的变量，会屏蔽内置功能',
            code: `# • 错误示例：先引用后赋值\n# x = 10\n# def test():\n# •    print(x)  # 报错，因为下面赋值了，x 被认为是局部的\n# •    x = 20\n\n# • 正确：声明 global\ndef test():\n    global x\n    print(x)`
          },
          {
            heading: '小结',
            text: '函数内赋值的变量默认是局部变量，函数外看不到；想在函数里改全局变量，用 global 声明；在嵌套函数里改外层变量，用 nonlocal；变量命名别偷懒，避免无意中冲突。'
          }
        ],
        codeExample: `import builtins\nprint("检查 Built-in 内置标识符数量:", len(dir(builtins)))`,
        tips: [
          '过度使用 global 变量会增加函数间的耦合，应尽量采用参数传递与返回值。',
          '命名变量时避开 len、list、str 等内置名称，防止覆盖内置函数。'
        ]
      }
    }
  ]
};


const stage5 = {

  id: 'stage5',
  title: 'Python 标准库',
  icon: 'folder_zip',
  topics: [
    {
      id: 'p5_modules',
      title: 'Python 模块',
      stage: 'Python 标准库',
      summary: '模块是把代码「分门别类」存放，用 import 随时调用。',
      content: {
        overview: '模块（Module）就是一个 .py 文件，把相关的函数和变量放在一起；包（Package）是一组模块的集合。有了模块，代码可以「分门别类」存放，想用哪个就 import 哪个。',
        sections: [
          { heading: '生活小例子', text: '就像工具箱：螺丝刀、扳手、钳子各有各的抽屉。Python 里 import math 就是打开「数学」抽屉，里面的 sqrt 开平方、pi 圆周率随时能拿。' },
          {
            heading: '常见导入语法',
            text: '• `import module_name`：导入整个模块\n• `from module import xxx`：导入模块中的指定符号\n• `import module as alias`：导入并重命名\n• `from module import *`：导入所有（不推荐，容易命名冲突）',
            code: `import math as m\nprint("圆周率 π:", m.pi)\n\nfrom random import randint, choice\nprint("随机 1-100 整数:", randint(1, 100))\nprint("随机抽取:", choice(["Apple", "Banana", "Cherry"]))`
          },
          {
            heading: '模块与包的区别',
            text: '• 模块：单个 .py 文件，封装函数、类、变量\n• 包：包含多个模块的目录，必须有 `__init__.py` 文件（Python 3.3+ 可选）\n• `__init__.py`：包初始化文件，导入包时自动执行，可控制对外暴露的接口',
            table: {
              headers: ['概念', '形式', '作用'],
              rows: [
                ['模块 Module', '.py 文件', '封装函数、类、变量'],
                ['包 Package', '目录（含 __init__.py）', '组织管理多个模块']
              ]
            }
          },
          {
            heading: '__name__ 与入口判断',
            text: '每个模块都有 `__name__` 属性：\n• 直接运行脚本时，`__name__ == "__main__"`\n• 被其他模块导入时，`__name__ == 模块名`\n\n`if __name__ == "__main__":` 块里的代码只在直接运行时执行，被导入时不执行，常用于写模块测试代码。',
            code: `# 模块入口测试模板\ndef main():\n    print("程序主逻辑")\n\nif __name__ == "__main__":\n    # 直接运行该文件才执行\n    main()\n    print("模块自测代码")`
          },
          {
            heading: '小结',
            text: 'import 模块名 导入整个模块，用 模块名.函数 调用；from 模块 import 函数 可以只导入需要的部分；自己写的 .py 文件也能被 import；__name__ 用于判断是直接运行还是被导入。'
          }
        ],
        codeExample: `import sys\nprint("Python 模块检索路径 (sys.path):")\nfor path in sys.path[:3]:\n    print(" ->", path)`,
        tips: [
          '使用 `dir(module)` 可以快捷列出某个导入模块公开的所有属性与函数列表。',
          '导入语句统一放在文件顶部，标准库 → 第三方库 → 本地模块，分组空行分隔。'
        ]
      }
    },
    {
      id: 'p5_datetime',
      title: 'Python 日期',
      stage: 'Python 标准库',
      summary: 'datetime 是「日期时间」工具箱，算时间差、格式化都靠它。',
      content: {
        overview: 'datetime 是 Python 自带的日期时间模块：可以拿到现在的日期时间、算两个日期差多少天、把日期变成指定格式的字符串，是做「时间相关」功能的标准工具。',
        sections: [
          { heading: '生活小例子', text: '算距离放假还有几天：拿到今天的日期，再拿到放假日期，两者相减就是剩余天数。datetime.date(2026, 1, 1) - datetime.date.today() 一步算出。' },
          {
            heading: 'datetime 核心类总览',
            text: '',
            table: {
              headers: ['类名', '作用', '常用属性'],
              rows: [
                ['date', '日期（年月日）', 'year, month, day'],
                ['time', '时间（时分秒微秒）', 'hour, minute, second'],
                ['datetime', '日期+时间', '以上全部属性'],
                ['timedelta', '时间间隔', 'days, seconds, microseconds']
              ]
            }
          },
          {
            heading: '常用操作方法',
            text: '• `datetime.now()`：获取当前本地时间\n• `.strftime(format)`：时间对象 → 格式化字符串\n• `.strptime(string, format)`：字符串 → 时间对象\n• 时间加减：datetime + timedelta 得到新时间\n• 时间差：两个 datetime 相减得到 timedelta',
            code: `from datetime import datetime, timedelta\n\nnow = datetime.now()\nprint("当前时间:", now.strftime("%Y-%m-%d %H:%M:%S"))\n\n# 7 天后\nfuture = now + timedelta(days=7)\nprint("7天后:", future.strftime("%Y年%m月%d日"))\n\n# 计算两个日期差\nd1 = datetime(2026, 1, 1)\nd2 = datetime(2026, 7, 1)\ndiff = d2 - d1\nprint("相差天数:", diff.days)`
          },
          {
            heading: '常用格式化符号速查',
            text: '',
            table: {
              headers: ['符号', '含义', '示例'],
              rows: [
                ['%Y', '四位年份', '2026'],
                ['%m', '两位月份', '07'],
                ['%d', '两位日期', '30'],
                ['%H', '24 小时制', '18'],
                ['%M', '分钟', '30'],
                ['%S', '秒', '45'],
                ['%A', '星期全称', 'Monday'],
                ['%B', '月份全称', 'July']
              ]
            }
          },
          {
            heading: '小结',
            text: 'datetime.now() 获取当前时间；两个日期相减得到 timedelta（时间差）；strftime 把日期转成文字，strptime 把文字解析成日期；记得提前 import datetime。'
          }
        ],
        codeExample: `from datetime import datetime\nd_str = "2026-07-30 18:00:00"\nd_obj = datetime.strptime(d_str, "%Y-%m-%d %H:%M:%S")\nprint("字符串成功解析为 datetime 对象:", d_obj.year, d_obj.month)`,
        tips: [
          '跨时区开发场景下，推荐结合 `zoneinfo` 模块使用 UTC 标准时区时间。',
          '处理时间优先用 datetime 对象运算，不要自己手动计算日期。'
        ]
      }
    },
    {
      id: 'p5_math',
      title: 'Python 数学',
      stage: 'Python 标准库',
      summary: 'math 是「数学计算器」，开方、取整、三角函数都有。',
      content: {
        overview: 'math 是 Python 自带的数学模块，像一台随身计算器：开平方、取整、绝对值、三角函数、圆周率等常用数学功能都有，直接用不用自己写。',
        sections: [
          { heading: '生活小例子', text: '装修算地板面积：房间长 5 米、宽 4 米，面积就是 5 * 4；再比如算圆面积，用 math.pi * r ** 2。数学公式交给 math，省心又准确。' },
          {
            heading: 'math 模块分类速查',
            text: '',
            table: {
              headers: ['分类', '常用函数/常量', '功能说明'],
              rows: [
                ['数学常量', 'math.pi, math.e, math.inf, math.nan', '圆周率、自然常数、无穷大、非数值'],
                ['取整运算', 'math.ceil, math.floor, math.trunc', '向上取整、向下取整、截断小数'],
                ['数论运算', 'math.factorial, math.gcd, math.lcm', '阶乘、最大公约数、最小公倍数'],
                ['幂指对数', 'math.sqrt, math.pow, math.log, math.log10', '平方根、幂、自然对数、常用对数'],
                ['三角函数', 'math.sin, math.cos, math.tan, math.radians', '三角函数（弧度制）']
              ]
            },
            code: `import math\n\nprint("π:", math.pi)\nprint("10 的阶乘:", math.factorial(10))\nprint("gcd(48, 18):", math.gcd(48, 18))\nprint("√144:", math.sqrt(144))`
          },
          {
            heading: '角度与弧度转换',
            text: 'math 模块的三角函数都使用弧度制，角度转弧度用 `math.radians()`，弧度转角度用 `math.degrees()`。',
            code: `import math\nangle_deg = 45\nangle_rad = math.radians(angle_deg)\nprint(f"45° 正弦值: {math.sin(angle_rad):.4f}")\nprint(f"45° 余弦值: {math.cos(angle_rad):.4f}")`
          },
          {
            heading: '注意事项',
            text: '• math 模块只处理浮点数，复数计算请用 cmath 模块\n• 阶乘只能用于非负整数\n• 对数函数参数必须大于 0'
          },
          {
            heading: '小结',
            text: 'math.sqrt() 开平方、math.floor() 向下取整、math.ceil() 向上取整；math.pi 和 math.e 是常用常量；三角函数用的是弧度，不是角度。'
          }
        ],
        codeExample: `import math\nangle_deg = 45\nangle_rad = math.radians(angle_deg)\nprint(f"45度角的 sin 值: {math.sin(angle_rad):.4f}")`,
        tips: [
          '`math` 模块针对浮点数优化，复数数学计算需要使用 `cmath` 模块。',
          '大规模数值计算优先用 NumPy，比 math 逐个计算高效得多。'
        ]
      }
    },
    {
      id: 'p5_json',
      title: 'Python JSON',
      stage: 'Python 标准库',
      summary: 'json 是「数据搬运工」，把数据变成文字、文字变回数据。',
      content: {
        overview: 'JSON 是一种通用的数据格式，很多网站和程序都用它交换数据。Python 的 json 模块负责两件事：把字典/列表「打包」成 JSON 文字，再把 JSON 文字「拆包」回字典/列表。',
        sections: [
          { heading: '生活小例子', text: '网购下单后，网站把订单信息（姓名、地址、商品）打包成一段 JSON 文字发给商家系统；商家解析这段文字就能看到订单内容。json.dumps 打包，json.loads 解析。' },
          {
            heading: 'JSON ↔ Python 类型映射',
            text: '',
            table: {
              headers: ['JSON 类型', 'Python 类型', '说明'],
              rows: [
                ['object', 'dict', '键值对对象'],
                ['array', 'list', '数组'],
                ['string', 'str', '字符串'],
                ['number (整数)', 'int', '整数'],
                ['number (小数)', 'float', '浮点数'],
                ['true / false', 'True / False', '布尔值'],
                ['null', 'None', '空值']
              ]
            }
          },
          {
            heading: '四大核心 API',
            text: '• `json.loads(s)`：JSON 字符串 → Python 对象\n• `json.dumps(obj)`：Python 对象 → JSON 字符串\n• `json.load(fp)`：从文件读取并解析\n• `json.dump(obj, fp)`：序列化后写入文件\n\ns 结尾表示 string，处理字符串；不带 s 处理文件句柄。',
            code: `import json\n\n# Python 字典\nuser_data = {\n    "id": 1001,\n    "username": "developer",\n    "roles": ["admin", "editor"],\n    "is_active": True\n}\n\n# 序列化为 JSON 字符串\njson_str = json.dumps(user_data, indent=2, ensure_ascii=False)\nprint("序列化结果:\\n", json_str)\n\n# 反序列化还原\nparsed = json.loads(json_str)\nprint("还原用户名:", parsed["username"])`
          },
          {
            heading: '常用参数与注意事项',
            text: '• `indent=2`：格式化缩进，输出更美观\n• `ensure_ascii=False`：保留中文，不转义为 \\uXXXX\n• 自定义对象（如 datetime）不能直接序列化，需要自定义转换函数',
            code: `import json\nfrom datetime import datetime\n\n# datetime 不能直接序列化，需先转字符串\ndata = {\n    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),\n    "status": "ok"\n}\nprint(json.dumps(data, ensure_ascii=False))`
          },
          {
            heading: '小结',
            text: 'json.dumps() 把字典/列表转成 JSON 字符串；json.loads() 把 JSON 字符串转回字典/列表；存配置、传数据都用它；注意 JSON 里的 true/false/null 和 Python 的 True/False/None 不同。'
          }
        ],
        codeExample: `import json\nraw_json = '{"code": 200, "message": "Success"}'\ndata = json.loads(raw_json)\nprint("响应状态码:", data["code"])`,
        tips: [
          '在 `dumps` 中设置 `ensure_ascii=False` 可防止中文字符串被编码为 `\\uXXXX` 形式。',
          '解析不可信来源的 JSON 不要用 eval，必须用 json.loads。'
        ]
      }
    },
    {
      id: 'p5_regex',
      title: 'Python RegEx',
      stage: 'Python 标准库',
      summary: '正则表达式是「文本搜索」高手，按规则找字符、验格式。',
      content: {
        overview: '正则表达式（RegEx）是一套「按规则找文本」的语法，用来在文字里搜索、验证、提取符合模式的内容。比如检查手机号是不是 11 位、从文章里找出所有邮箱。',
        sections: [
          { heading: '生活小例子', text: '在通讯录里找所有手机号：不用一条条看，用正则表达式 r"d{11}" 就能把 11 位数字全找出来。就像用「放大镜 + 规则尺」扫描文字。' },
          {
            heading: '核心匹配函数',
            text: '• `re.search(pattern, string)`：扫描字符串，返回首个匹配的 Match 对象（找到就停）\n• `re.findall(pattern, string)`：以列表返回所有非重叠匹配文本\n• `re.sub(pattern, repl, string)`：将匹配的子串替换为新文本\n• `re.match(pattern, string)`：只从字符串开头匹配',
            table: {
              headers: ['函数', '功能', '返回值'],
              rows: [
                ['re.search()', '查找第一个匹配', 'Match 对象 / None'],
                ['re.findall()', '查找所有匹配', '列表'],
                ['re.sub()', '替换匹配内容', '新字符串'],
                ['re.match()', '从头开始匹配', 'Match 对象 / None']
              ]
            }
          },
          {
            heading: '常用元字符速查',
            text: '',
            table: {
              headers: ['元字符', '含义', '示例'],
              rows: [
                ['.', '匹配任意单个字符（除换行）', 'a.c 匹配 abc, a1c'],
                ['*', '前一个字符出现 0 次或多次', 'ab*c 匹配 ac, abc, abbc'],
                ['+', '前一个字符出现 1 次或多次', 'ab+c 匹配 abc, abbc'],
                ['?', '前一个字符出现 0 次或 1 次', 'ab?c 匹配 ac, abc'],
                ['^', '匹配字符串开头', '^hello 匹配开头的 hello'],
                ['$', '匹配字符串结尾', 'world$ 匹配结尾的 world'],
                ['\\d', '匹配数字', '\\d+ 匹配连续数字'],
                ['\\w', '匹配字母数字下划线', '\\w+ 匹配单词'],
                ['[]', '字符集', '[abc] 匹配 a/b/c 中任意一个'],
                ['()', '分组捕获', '(\\d+)-(\\d+) 提取两组数字']
              ]
            },
            code: `import re\n\ntext = "电话: 010-88886666, 手机: 13800138000, 邮箱: admin@python-you.io"\n\n# 提取手机号\nmobiles = re.findall(r"1[3-9]\\d{9}", text)\nprint("手机号列表:", mobiles)\n\n# 脱敏邮箱\nmasked = re.sub(r"[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}", "***@***", text)\nprint("脱敏后文本:", masked)`
          },
          {
            heading: '正则最佳实践',
            text: '• 始终用原始字符串 `r"..."` 写正则，避免反斜杠转义噩梦\n• 简单场景用字符串方法，不要强行写正则\n• 正则不要写得过于复杂，可读性优先'
          },
          {
            heading: '小结',
            text: 're.findall() 找出所有匹配，re.search() 找第一个，re.sub() 替换；\d 代表数字、\w 代表字母数字、. 代表任意字符；前面加 r 写成原始字符串，避免转义麻烦。'
          }
        ],
        codeExample: `import re\ns = "2026-07-30"\nmatch = re.match(r"(\\d{4})-(\\d{2})-(\\d{2})", s)\nif match:\n    print("提取年份:", match.group(1), "月份:", match.group(2))`,
        tips: [
          '编写正则表达式时推荐使用原始字符串 `r"..."`，以避免繁琐的反斜杠转义。',
          '正则不是万能的，简单文本处理优先用字符串内置方法。'
        ]
      }
    },
    {
      id: 'p5_pip',
      title: 'Python PIP',
      stage: 'Python 标准库',
      summary: 'pip 是 Python 的「应用商店」，一键安装别人写好的工具库。',
      content: {
        overview: 'pip 是 Python 官方提供的包管理工具，负责从 PyPI（Python 的「应用商店」）下载安装第三方库。在 Python You 里，用内置的包管理器也能在线安装常用库。',
        sections: [
          { heading: '生活小例子', text: '想用照片处理库 Pillow，不用自己写图片处理代码，在包管理器里搜 pillow、一键安装，然后 import PIL 就能用了。就像装 App：装好即用。' },
          {
            heading: 'pip 常用命令速查',
            text: '',
            table: {
              headers: ['命令', '功能', '示例'],
              rows: [
                ['pip install 包名', '安装最新版包', 'pip install pandas'],
                ['pip install 包==版本', '安装指定版本', 'pip install pandas==2.0.0'],
                ['pip install --upgrade 包', '升级到最新版', 'pip install --upgrade pip'],
                ['pip uninstall 包', '卸载包', 'pip uninstall pandas'],
                ['pip list', '列出已安装包', 'pip list'],
                ['pip freeze', '导出已安装包列表', 'pip freeze > requirements.txt'],
                ['pip install -r 文件', '按清单批量安装', 'pip install -r requirements.txt']
              ]
            }
          },
          {
            heading: '虚拟环境简介',
            text: '不同项目可能依赖不同版本的包，虚拟环境可以为每个项目创建独立的 Python 环境，互不干扰。\n• 创建：`python -m venv .venv`\n• 激活：Windows `.venv\\Scripts\\activate`，macOS/Linux `source .venv/bin/activate`',
            code: `# 虚拟环境标准工作流\n# 1. 创建\n# python -m venv .venv\n# 2. 激活后安装依赖\n# pip install -r requirements.txt\n# 3. 导出当前依赖\n# pip freeze > requirements.txt`
          },
          {
            heading: '包管理器',
            text: '在 IDE 界面左侧工具栏中点击【包管理器】按钮，即可在线一键搜索安装 NumPy、Pandas、SymPy 等众多第三方库，无需手动敲命令。'
          },
          {
            heading: '小结',
            text: 'pip install 库名 安装，pip list 查看已装；Python You 内置包管理器支持在线安装纯 Python 库；装好的库用 import 导入即可使用；需要联网下载。'
          }
        ],
        codeExample: `import sys\nprint("当前环境已装载的内嵌路径与模块总数:", len(sys.modules))`,
        tips: [
          '你可以使用侧边栏【包管理器】快速安装与管理项目中所需的各种依赖包。',
          '项目一定要锁定依赖版本，避免换环境后运行异常。'
        ]
      }
    },
    {
      id: 'p5_tryexcept',
      title: 'Python Try Except',
      stage: 'Python 标准库',
      summary: 'try/except 是「安全网」，程序出错也不怕崩。',
      content: {
        overview: '程序运行时会遇到意外，比如用户输入了数字却写成了字母。try/except 就像安全网：把可能出错的代码放进去，出错时不会直接崩溃，而是走「补救」分支。',
        sections: [
          { heading: '生活小例子', text: '让用户输入年龄：用户手滑输了「abc」，int("abc") 会报错。用 try: age = int(input(...)) except: 提示「请输入数字」。程序不会崩，还能友好提醒。' },
          {
            heading: '完整异常结构',
            text: '`try-except-else-finally` 四部分组成：\n• `try`：可能抛出异常的代码\n• `except 异常类型`：捕获指定异常并处理\n• `else`：没有异常时执行\n• `finally`：无论是否异常都执行，用于资源清理',
            code: `def safe_divide(a, b):\n    try:\n        result = a / b\n    except ZeroDivisionError as e:\n        print(f"捕获异常：除数不能为零 ({e})")\n        return None\n    except TypeError as e:\n        print(f"捕获异常：参数类型错误 ({e})")\n        return None\n    else:\n        print("计算正常无报错")\n        return result\n    finally:\n        print("清理工作执行完毕。")\n\nprint("计算结果:", safe_divide(10, 2))\nprint("计算结果:", safe_divide(10, 0))`
          },
          {
            heading: '常见内置异常类型',
            text: '',
            table: {
              headers: ['异常名', '触发场景'],
              rows: [
                ['ValueError', '值错误，如字符串转数字失败'],
                ['TypeError', '类型错误，如字符串和数字相加'],
                ['IndexError', '索引越界，列表访问不存在的索引'],
                ['KeyError', '字典不存在的键'],
                ['ZeroDivisionError', '除以零'],
                ['FileNotFoundError', '文件不存在'],
                ['AttributeError', '对象没有该属性/方法']
              ]
            }
          },
          {
            heading: '自定义异常',
            text: '继承 Exception 类可以定义业务相关的自定义异常，让错误分类更清晰。',
            code: `class CustomAppError(Exception):\n    \"\"\"自定义业务异常基类\"\"\"\n    pass\n\nclass InsufficientBalanceError(CustomAppError):\n    \"\"\"余额不足异常\"\"\"\n    pass\n\ntry:\n    raise InsufficientBalanceError("账户余额不足，无法扣款")\nexcept CustomAppError as err:\n    print("捕获业务异常:", err)`
          },
          {
            heading: '小结',
            text: 'try 里放可能出错的代码，except 里放出错后的处理；except ValueError 可以只捕获特定错误；finally 里的代码无论是否出错都会执行；try/except 比一堆 if 判断更简洁。'
          }
        ],
        codeExample: `class CustomAppError(Exception):\n    """自定义业务逻辑异常类"""\n    pass\n\ntry:\n    raise CustomAppError("主动触发自定义业务逻辑异常")\nexcept CustomAppError as err:\n    print("捕获自定义异常:", err)`,
        tips: [
          '避免滥用无类型的裸 `except:`，应当显式指明所需捕获的具体异常类。',
          '只捕获你能处理的异常，不要捕获所有异常然后默默吞掉。'
        ]
      }
    },
    {
      id: 'p5_file',
      title: 'Python 文件打开',
      stage: 'Python 标准库',
      summary: '文件操作就是「打开-读写-关闭」，with 帮你自动关门。',
      content: {
        overview: '程序经常要读写文件，比如保存笔记、读取配置。Python 用 open() 打开文件，读写完后要关闭。用 with 写法可以自动关闭，不用手动记。',
        sections: [
          { heading: '生活小例子', text: '写日记：open("diary.txt", "w") 打开（w 表示写入模式），把内容写进去，关掉。下次用 with open("diary.txt", "r") as f: 读出来。就像打开笔记本记录、合上。' },
          {
            heading: '文件打开模式全解',
            text: '',
            table: {
              headers: ['模式', '名称', '读写', '文件不存在', '文件存在时'],
              rows: [
                ['"r"', '只读', '仅读', '抛出 FileNotFoundError', '指针在开头，读取'],
                ['"w"', '覆盖写', '仅写', '创建新文件', '清空原有内容，重写'],
                ['"a"', '追加写', '仅写', '创建新文件', '指针在末尾，追加'],
                ['"r+"', '读写', '可读可写', '抛出错误', '指针在开头，覆盖'],
                ['"b"', '二进制', '字节流', '配合基础模式使用', '处理图片、视频等二进制文件']
              ]
            }
          },
          {
            heading: 'with 上下文管理器',
            text: '推荐始终使用 `with open(...) as f:` 语法：\n• 代码块结束自动关闭文件\n• 即使发生异常也能正确关闭\n• 不用手动写 f.close()',
            code: `# 写入文件\nwith open("demo_output.txt", "w", encoding="utf-8") as f:\n    f.write("Python You 虚拟文件系统\\n")\n    f.write("第一行数据\\n第二行数据")\n\n# 读取文件\nwith open("demo_output.txt", "r", encoding="utf-8") as f:\n    lines = f.readlines()\n    for idx, line in enumerate(lines, 1):\n        print(f"第 [{idx}] 行: {line.strip()}")`
          },
          {
            heading: '常用文件操作方法',
            text: '• `.read()`：一次性读取全部内容\n• `.readline()`：读取一行\n• `.readlines()`：读取所有行，返回列表\n• `.write(s)`：写入字符串\n• `.seek(offset)`：移动文件指针位置\n• `.tell()`：返回当前指针位置',
            code: `with open("demo_output.txt", "r", encoding="utf-8") as f:\n    print("当前指针位置:", f.tell())\n    content = f.read(10)  # 读 10 个字符\n    print("读取内容:", content)\n    print("读取后位置:", f.tell())`
          },
          {
            heading: '小结',
            text: 'open(文件名, 模式) 打开文件，模式有 r（读）、w（写）、a（追加）；with open(...) as f: 自动管理关闭；f.read() 读全部，f.write() 写入；文件用完一定要关，with 最省心。'
          }
        ],
        codeExample: `import os\nif os.path.exists("demo_output.txt"):\n    print("文件体积 (Bytes):", os.path.getsize("demo_output.txt"))`,
        tips: [
          '在 Python You 中用代码创建或修改的文件，会自动实时同步至左侧 IDE 文件树视图中！',
          '打开文本文件务必指定 encoding="utf-8"，避免不同系统乱码。'
        ]
      }
    }
  ]
};


const stage6 = {

  id: 'stage6',
  title: 'Python 数据可视化',
  icon: 'analytics',
  subcategories: [
    {
      id: 'matplotlib_sub',
      title: 'Python Matplotlib',
      topics: [
        {
          id: 'p6_mpl_intro',
          title: 'Matplotlib 简介',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: 'Matplotlib 是 Python 的画图工具，几行代码画出漂亮图表。',
          content: {
            overview: 'Matplotlib 是 Python 最常用的绘图库，能把数据画成折线图、柱状图、饼图等。不用懂复杂的图形学，几行代码就能把「数字」变成「看得见的图」。',
            sections: [
              { heading: '生活小例子', text: '你记录了一周每天的气温，想看看变化趋势——画成折线图一眼就明白：哪天升温、哪天降温。Matplotlib 就是帮你把数据「画出来」的工具。' },
              {
                heading: 'Matplotlib 核心优势',
                text: '1. 图表类型丰富：支持折线图、散点图、柱状图、饼图、直方图、等高线图、3D 图等几十种图表\n2. 精细可控：可针对标题、坐标轴、图例、网格、颜色进行像素级微调\n3. 生态兼容：天然适配 NumPy 数组与 Pandas DataFrame 数据源',
                code: `# Figure 与 Axes 面向对象初始化\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nprint("创建 Figure 画布与 Axes 坐标系:", type(fig), type(ax))`,
                notes: '说明：在 Python You 中可快速生成各种科学图表并导出图像数据。'
              },
              {
                heading: '四层架构模型',
                text: 'Matplotlib 采用分层设计，从下到上依次为：\n1. Figure：最外层画布，整个图片窗口\n2. Axes：坐标系/子图，一个 Figure 可以有多个 Axes\n3. Axis：坐标轴，控制刻度、标签、范围\n4. Artist：所有可见元素，如线条、文字、图例',
                table: {
                  headers: ['层级', '名称', '作用'],
                  rows: [
                    ['Figure', '画布', '最顶层容器，承载所有子图'],
                    ['Axes', '坐标系/子图', '绘图区域，一个图对应一个 Axes'],
                    ['Axis', '坐标轴', '控制刻度、标签、范围'],
                    ['Artist', '绘图元素', '线条、文字、图例等所有可见元素']
                  ]
                }
              },
              {
                heading: '两种绘图接口',
                text: '• pyplot 状态机接口：`plt.plot()` 这种写法，类似 MATLAB，简单易用，适合快速绘图\n• 面向对象接口：`fig, ax = plt.subplots()` 后用 ax 绘图，更灵活，适合复杂图表\n新手推荐从 pyplot 入门，进阶后转向面向对象接口。'
              },
              {
                heading: '小结',
                text: 'import matplotlib.pyplot as plt 是固定开头；plt.plot() 画折线图，plt.bar() 画柱状图；plt.show() 显示图形；数据多时，图比表格更直观。'
              }
            ],
            codeExample: `import matplotlib.pyplot as plt\nprint("Matplotlib 可视化模块加载成功，随时可触发数据图表绘制。")`,
            tips: [
              '掌握 Matplotlib 是进行数据科学与 AI 可视化分析的核心基础。',
              '中文显示需要额外配置字体，否则会显示为方框。'
            ]
          }
        },
        {
          id: 'p6_mpl_start',
          title: 'Matplotlib 绘图',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: '用 pyplot 一步步画图：准备数据、画图、加标注、显示。',
          content: {
            overview: '用 Matplotlib 画图通常是四步：准备数据 → 调用绘图函数 → 加上标题和坐标说明 → 显示或保存。掌握了这四步，就能画出各种常用图表。',
            sections: [
              { heading: '生活小例子', text: '画成绩对比：x = ["语文", "数学", "英语"]，y = [85, 92, 78]，plt.bar(x, y) 一根柱子一门课，再加 plt.title("期末成绩")，一张柱状图就完成了。' },
              {
                heading: '核心绘图 API',
                text: '• `plt.plot(x, y, label=...)`：绘制折线图\n• `plt.scatter(x, y, color=...)`：绘制散点图\n• `plt.title()`：设置图表标题\n• `plt.xlabel()` / `plt.ylabel()`：设置坐标轴标签\n• `plt.legend()`：显示图例\n• `plt.grid(True)`：显示网格\n• `plt.show()`：显示图表',
                code: `# 生成模拟数据\nx = [1, 2, 3, 4, 5, 6]\ny1 = [2, 4, 9, 16, 25, 36]\ny2 = [1, 3, 6, 10, 15, 21]\n\nprint("X 轴数据:", x)\nprint("平方序列 Y1:", y1)\nprint("累加序列 Y2:", y2)`
              },
              {
                heading: '样式自定义',
                text: '折线图常用样式参数：\n• color：颜色（英文名称或十六进制）\n• linestyle：线型（- 实线、-- 虚线、: 点线）\n• linewidth：线宽\n• marker：数据点标记（o 圆点、s 方块、^ 三角）\n• markersize：标记大小',
                code: `# 样式丰富的折线图示例\n# plt.plot(x, y1, color='red', linestyle='--', marker='o', label='平方')\n# plt.plot(x, y2, color='blue', linestyle='-', marker='s', label='累加')\n# plt.legend()\n# plt.grid(True, alpha=0.3)`
              },
              {
                heading: '完整绘图流程',
                text: '标准绘图步骤：\n1. 准备数据（通常是列表或 NumPy 数组）\n2. 创建画布与子图\n3. 调用绘图函数绘制图形\n4. 设置标题、标签、图例、网格等装饰\n5. 显示或保存图表'
              },
              {
                heading: '小结',
                text: 'plt.plot(x, y) 画线，plt.bar(x, y) 画柱，plt.scatter(x, y) 画点；plt.xlabel / plt.ylabel / plt.title 加标注；plt.show() 显示，plt.savefig() 保存图片。'
              }
            ],
            codeExample: `x_vals = [i for i in range(10)]\ny_vals = [x ** 2 for x in x_vals]\nprint("折线图 X 点列:", x_vals)\nprint("折线图 Y 点列:", y_vals)`,
            tips: [
              '可以在侧边栏【包管理器】中实时管理科学计算环境相关的各种扩展库。',
              '保存图片推荐用 plt.savefig()，分辨率更高。'
            ]
          }
        }
      ]
    }
  ]
};


const cmdHelp = {

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


const TOPIC_QUIZZES = [
  {
    topicId: 'p1_syntax',
    questions: [
      {
        id: 'p1_syntax_q1',
        type: 'choice',
        question: 'Python 中靠什么表示代码块的层级关系？',
        options: ['花括号 {}', '缩进', '分号 ;', '中括号 []'],
        answerIndex: 1,
        explanation: 'Python 用缩进表示代码块，同一层级的代码缩进必须一致。'
      },
      {
        id: 'p1_syntax_q2',
        type: 'choice',
        question: '下面哪一行是合法的 Python 注释？',
        options: ['// 这是注释', '# 这是注释', '<!-- 这是注释 -->', '/* 这是注释 */'],
        answerIndex: 1,
        explanation: 'Python 用 # 开头写注释，这一行的内容不会被执行。'
      },
      {
        id: 'p1_syntax_q3',
        type: 'code',
        question: '用 print() 输出两行文本：第一行 Python，第二行 真好学。',
        starterCode: '# 任务：输出两行文本，第一行 Python，第二行 真好学',
        expectedOutput: 'Python\n真好学'
      }
    ]
  },
  {
    topicId: 'p1_comments',
    questions: [
      {
        id: 'p1_comments_q1',
        type: 'choice',
        question: '注释的主要作用是？',
        options: ['让程序运行更快', '给读代码的人做解释', '不加注释程序会报错', '把内容打印到屏幕'],
        answerIndex: 1,
        explanation: '注释是写给人类看的说明，方便自己和别人理解代码。'
      },
      {
        id: 'p1_comments_q2',
        type: 'choice',
        question: '被 # 注释掉的代码会怎样？',
        options: ['照常运行', '不会执行', '导致报错', '变成字符串'],
        answerIndex: 1,
        explanation: '被注释的内容不会被执行，常用来临时停用某段代码。'
      },
      {
        id: 'p1_comments_q3',
        type: 'code',
        question: '用注释停用一行代码，只输出文本：你好。',
        starterCode: '# 任务：用 # 注释掉一行代码，让程序只输出：你好\nprint("再见")\nprint("你好")',
        expectedOutput: '你好'
      }
    ]
  },
  {
    topicId: 'p1_variables',
    questions: [
      {
        id: 'p1_variables_q1',
        type: 'choice',
        question: 'age = 18 这句话的意思是？',
        options: ['age 和 18 相等', '把 18 存进变量 age 里', '打印 age', '删除变量 age'],
        answerIndex: 1,
        explanation: '等号把右边的值放进左边的变量中，之后可以用 age 取到 18。'
      },
      {
        id: 'p1_variables_q2',
        type: 'choice',
        question: '下面哪个是合法的变量名？',
        options: ['2age', 'my age', 'my_age', 'age!'],
        answerIndex: 2,
        explanation: '变量名不能以数字开头、不能含空格和特殊符号，可以用下划线。'
      },
      {
        id: 'p1_variables_q3',
        type: 'code',
        question: '定义一个变量 name 存放文本 小派，再把它打印出来。',
        starterCode: '# 任务：定义一个变量 name 存放文本 小派，再把它打印出来',
        expectedOutput: '小派'
      }
    ]
  },
  {
    topicId: 'p1_datatypes',
    questions: [
      {
        id: 'p1_datatypes_q1',
        type: 'choice',
        question: '"123" 是什么数据类型？',
        options: ['整数 int', '字符串 str', '浮点数 float', '列表 list'],
        answerIndex: 1,
        explanation: '用引号包起来的都是字符串，哪怕里面是数字。'
      },
      {
        id: 'p1_datatypes_q2',
        type: 'choice',
        question: '3.14 是什么数据类型？',
        options: ['int', 'float', 'str', 'bool'],
        answerIndex: 1,
        explanation: '带小数点的数字是浮点数 float。'
      },
      {
        id: 'p1_datatypes_q3',
        type: 'code',
        question: '用 type() 查看两个变量的类型并打印。',
        starterCode: '# 任务：用 type() 打印下面两个变量的类型\na = 10\nb = 3.14',
        expectedOutput: '<class \'int\'>\n<class \'float\'>'
      }
    ]
  },
  {
    topicId: 'p1_numbers',
    questions: [
      {
        id: 'p1_numbers_q1',
        type: 'choice',
        question: '7 // 2 的结果是？',
        options: ['3.5', '3', '4', '1'],
        answerIndex: 1,
        explanation: '// 是整除，只保留整数部分。'
      },
      {
        id: 'p1_numbers_q2',
        type: 'choice',
        question: '2 ** 3 等于多少？',
        options: ['6', '8', '9', '5'],
        answerIndex: 1,
        explanation: '** 是乘方，2 的 3 次方等于 8。'
      },
      {
        id: 'p1_numbers_q3',
        type: 'code',
        question: '打印 10 除以 3 的余数（用 % 运算符）。',
        starterCode: '# 任务：打印 10 除以 3 的余数\n# 提示：用 % 取余运算符',
        expectedOutput: '1'
      }
    ]
  },
  {
    topicId: 'p1_casting',
    questions: [
      {
        id: 'p1_casting_q1',
        type: 'choice',
        question: 'int("42") 的结果是？',
        options: ['"42"（字符串）', '42（整数）', '程序报错', '42.0（浮点数）'],
        answerIndex: 1,
        explanation: 'int() 把字符串形式的 42 转换成整数 42。'
      },
      {
        id: 'p1_casting_q2',
        type: 'choice',
        question: 'float(3) 的结果是？',
        options: ['3', '3.0', '"3"', '报错'],
        answerIndex: 1,
        explanation: 'float() 把整数 3 转换成浮点数 3.0。'
      },
      {
        id: 'p1_casting_q3',
        type: 'code',
        question: '把字符串 "7" 转成整数，再打印它的两倍。',
        starterCode: '# 任务：把字符串 "7" 转成整数，再打印它的两倍\n# 提示：先用 int() 转换，再乘以 2',
        expectedOutput: '14'
      }
    ]
  },
  {
    topicId: 'p1_strings',
    questions: [
      {
        id: 'p1_strings_q1',
        type: 'choice',
        question: '"Python"[1] 的结果是？',
        options: ['P', 'y', 't', '报错'],
        answerIndex: 1,
        explanation: '字符串下标从 0 开始，[1] 取的是第 2 个字符 y。'
      },
      {
        id: 'p1_strings_q2',
        type: 'choice',
        question: '"a" + "b" 的结果是？',
        options: ['ab', 'a b', '报错', '"a"+"b"'],
        answerIndex: 0,
        explanation: '+ 可以把两个字符串拼接在一起。'
      },
      {
        id: 'p1_strings_q3',
        type: 'code',
        question: '把 "学" 和 "Python" 拼接后打印。',
        starterCode: '# 任务：把 学 和 Python 拼在一起输出\n# 提示：字符串可以用 + 拼接',
        expectedOutput: '学Python'
      }
    ]
  },
  {
    topicId: 'p1_booleans',
    questions: [
      {
        id: 'p1_booleans_q1',
        type: 'choice',
        question: '5 > 3 的结果是？',
        options: ['True', 'False', '5', '"True"'],
        answerIndex: 0,
        explanation: '比较成立返回 True（真），不成立返回 False（假）。'
      },
      {
        id: 'p1_booleans_q2',
        type: 'choice',
        question: 'bool(0) 的结果是？',
        options: ['True', 'False', '报错', '0'],
        answerIndex: 1,
        explanation: '数字 0 在布尔判断中表示假，所以是 False。'
      },
      {
        id: 'p1_booleans_q3',
        type: 'code',
        question: '打印 10 是否大于 5 的结果。',
        starterCode: '# 任务：打印 10 是否大于 5 的判断结果',
        expectedOutput: 'True'
      }
    ]
  },
  {
    topicId: 'p1_operators',
    questions: [
      {
        id: 'p1_operators_q1',
        type: 'choice',
        question: '5 == 5 的结果是？',
        options: ['True', 'False', '报错', '"=="'],
        answerIndex: 0,
        explanation: '== 是比较是否相等，5 等于 5，所以是 True。'
      },
      {
        id: 'p1_operators_q2',
        type: 'choice',
        question: 'not True 的结果是？',
        options: ['True', 'False', '报错', 'None'],
        answerIndex: 1,
        explanation: 'not 表示取反，not True 就是 False。'
      },
      {
        id: 'p1_operators_q3',
        type: 'code',
        question: '分别打印 True and False 和 True or False 的结果。',
        starterCode: '# 任务：分别打印 True and False 和 True or False 的结果',
        expectedOutput: 'False\nTrue'
      }
    ]
  },
  {
    topicId: 'p2_list',
    questions: [
      {
        id: 'p2_list_q1',
        type: 'choice',
        question: '列表用什么符号定义？',
        options: ['圆括号 ()', '方括号 []', '花括号 {}', '尖括号 <>'],
        answerIndex: 1,
        explanation: '列表用 [] 定义，例如 [1, 2, 3]。'
      },
      {
        id: 'p2_list_q2',
        type: 'choice',
        question: '["a", "b", "c"][1] 的结果是？',
        options: ['a', 'b', 'c', '报错'],
        answerIndex: 1,
        explanation: '下标从 0 开始，[1] 是第二个元素 b。'
      },
      {
        id: 'p2_list_q3',
        type: 'code',
        question: '用 append() 在列表末尾添加一个元素并打印列表。',
        starterCode: '# 任务：在 fruits 末尾添加 "cherry"，再打印整个列表\nfruits = ["apple", "banana"]',
        expectedOutput: "['apple', 'banana', 'cherry']"
      }
    ]
  },
  {
    topicId: 'p2_tuple',
    questions: [
      {
        id: 'p2_tuple_q1',
        type: 'choice',
        question: '元组和列表最大的区别是？',
        options: ['元组一旦创建就不能修改', '元组的运行速度更慢', '元组不能打印', '元组必须是空的'],
        answerIndex: 0,
        explanation: '元组内容固定不可变，适合存不会变化的数据。'
      },
      {
        id: 'p2_tuple_q2',
        type: 'choice',
        question: '元组用什么符号定义？',
        options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
        answerIndex: 1,
        explanation: '元组用 () 定义，例如 (1, 2, 3)。'
      },
      {
        id: 'p2_tuple_q3',
        type: 'code',
        question: '创建一个元组并打印它。',
        starterCode: '# 任务：创建一个元组 (1, 2, 3) 并打印',
        expectedOutput: '(1, 2, 3)'
      }
    ]
  },
  {
    topicId: 'p2_set',
    questions: [
      {
        id: 'p2_set_q1',
        type: 'choice',
        question: '集合（set）最大的特点是？',
        options: ['元素有顺序', '元素不重复', '允许重复元素', '只能放数字'],
        answerIndex: 1,
        explanation: '集合里的元素不会重复，常用来去重和做集合运算。'
      },
      {
        id: 'p2_set_q2',
        type: 'choice',
        question: '集合用什么符号定义？',
        options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
        answerIndex: 2,
        explanation: '集合用 {} 定义，例如 {1, 2, 3}。'
      },
      {
        id: 'p2_set_q3',
        type: 'code',
        question: '用 & 求两个集合的交集并打印。',
        starterCode: '# 任务：求集合 a 和 b 的交集并打印\n# 提示：交集用 & 运算符\na = {1, 2, 3}\nb = {2, 3, 4}',
        expectedOutput: '{2, 3}'
      }
    ]
  },
  {
    topicId: 'p2_dict',
    questions: [
      {
        id: 'p2_dict_q1',
        type: 'choice',
        question: '字典用什么符号定义？',
        options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
        answerIndex: 2,
        explanation: '字典用 {} 定义键值对，例如 {"name": "小明"}。'
      },
      {
        id: 'p2_dict_q2',
        type: 'choice',
        question: 'd = {"a": 1}，那么 d["a"] 的结果是？',
        options: ['a', '1', '报错', '{"a": 1}'],
        answerIndex: 1,
        explanation: '用键取值，d["a"] 返回对应的值 1。'
      },
      {
        id: 'p2_dict_q3',
        type: 'code',
        question: '从字典中取出姓名和年龄并打印。',
        starterCode: '# 任务：从 student 字典里取出姓名和年龄并打印\nstudent = {"name": "小明", "age": 10}',
        expectedOutput: '小明\n10'
      }
    ]
  },
  {
    topicId: 'p3_ifelse',
    questions: [
      {
        id: 'p3_ifelse_q1',
        type: 'choice',
        question: 'if 后面的条件为 True 时，会执行哪部分代码？',
        options: ['冒号后面缩进的代码块', 'else 后面的代码', '整份文件的代码', '什么都不执行'],
        answerIndex: 0,
        explanation: '条件成立就执行 if 块中缩进的代码，否则执行 else。'
      },
      {
        id: 'p3_ifelse_q2',
        type: 'choice',
        question: '要依次判断多个条件，应该用哪个关键字？',
        options: ['while', 'elif', 'def', 'import'],
        answerIndex: 1,
        explanation: 'elif 可以在 if 后面追加多个条件分支。'
      },
      {
        id: 'p3_ifelse_q3',
        type: 'code',
        question: '判断 age 是否成年（大于等于 18），成年输出文本：成年，否则输出文本：未成年。',
        starterCode: '# 任务：判断 age 是否成年（大于等于 18）\n# 成年输出文本：成年，否则输出文本：未成年\nage = 20',
        expectedOutput: '成年'
      }
    ]
  },
  {
    topicId: 'p3_while',
    questions: [
      {
        id: 'p3_while_q1',
        type: 'choice',
        question: 'while 循环什么时候会停止？',
        options: ['条件变为 False 时', '永远不会停止', '数到 10 时', '条件为 True 时'],
        answerIndex: 0,
        explanation: '只要条件为 True 就继续循环，条件为 False 时停止。'
      },
      {
        id: 'p3_while_q2',
        type: 'choice',
        question: '下面哪个语句可以立刻跳出循环？',
        options: ['break', 'pass', 'continue', 'return'],
        answerIndex: 0,
        explanation: 'break 会立即结束当前循环；continue 是跳过本次继续下一次。'
      },
      {
        id: 'p3_while_q3',
        type: 'code',
        question: '用 while 循环打印 1 到 3。',
        starterCode: '# 任务：用 while 循环打印 1 到 3\n# 提示：循环体里记得让 count 增加\ncount = 1',
        expectedOutput: '1\n2\n3'
      }
    ]
  },
  {
    topicId: 'p3_for',
    questions: [
      {
        id: 'p3_for_q1',
        type: 'choice',
        question: 'for x in [1, 2, 3] 会循环几次？',
        options: ['1 次', '2 次', '3 次', '4 次'],
        answerIndex: 2,
        explanation: '列表里有 3 个元素，循环体就执行 3 次。'
      },
      {
        id: 'p3_for_q2',
        type: 'choice',
        question: 'range(3) 生成的内容是？',
        options: ['[0, 1, 2]', '[1, 2, 3]', '[3]', '报错'],
        answerIndex: 0,
        explanation: 'range(3) 从 0 开始，生成 0、1、2 三个数。'
      },
      {
        id: 'p3_for_q3',
        type: 'code',
        question: '用 for 循环把名单里的名字逐个打印出来。',
        starterCode: '# 任务：用 for 循环把 names 里的名字逐个打印\nnames = ["小明", "小红", "小刚"]',
        expectedOutput: '小明\n小红\n小刚'
      }
    ]
  },
  {
    topicId: 'p3_input',
    questions: [
      {
        id: 'p3_input_q1',
        type: 'choice',
        question: 'input() 输入的内容是什么类型？',
        options: ['整数', '字符串', '列表', '布尔值'],
        answerIndex: 1,
        explanation: 'input() 一律返回字符串，需要数字时要用 int() 转换。'
      },
      {
        id: 'p3_input_q2',
        type: 'choice',
        question: '想把输入内容当数字用，应该怎么做？',
        options: ['input() 会自动转换', '用 int() 转换', '用 str() 转换', '无法转换'],
        answerIndex: 1,
        explanation: '例如 age = int(input("年龄："))，先把字符串转成整数。'
      },
      {
        id: 'p3_input_q3',
        type: 'code',
        question: '把字符串数字 "12" 转成整数，再打印它加 1 的结果。',
        starterCode: '# 任务：把字符串 "12" 转成整数，打印它加 1 的结果',
        expectedOutput: '13'
      }
    ]
  },
  {
    topicId: 'p3_formatting',
    questions: [
      {
        id: 'p3_formatting_q1',
        type: 'choice',
        question: '下面哪个是 f-string 的正确写法？',
        options: ['f"我的年龄是{age}"', 'f"我的年龄是age"', '"f{age}"', "f'age'"],
        answerIndex: 0,
        explanation: 'f 开头、花括号里放变量，就能把变量插入字符串。'
      },
      {
        id: 'p3_formatting_q2',
        type: 'choice',
        question: 'f"{3 + 2}" 的结果是？',
        options: ['5', '"3 + 2"', '报错', '3+2'],
        answerIndex: 0,
        explanation: '花括号里可以是表达式，会先算出结果再插入。'
      },
      {
        id: 'p3_formatting_q3',
        type: 'code',
        question: '用 f-string 打印文本：我叫小派，今年10岁。',
        starterCode: '# 任务：用 f-string 打印：我叫小派，今年10岁\nname = "小派"\nage = 10',
        expectedOutput: '我叫小派，今年10岁'
      }
    ]
  },
  {
    topicId: 'p4_functions',
    questions: [
      {
        id: 'p4_functions_q1',
        type: 'choice',
        question: '定义函数使用哪个关键字？',
        options: ['function', 'def', 'func', 'lambda'],
        answerIndex: 1,
        explanation: '用 def 关键字定义函数，例如 def greet():。'
      },
      {
        id: 'p4_functions_q2',
        type: 'choice',
        question: '函数把结果交还给调用方，使用哪个语句？',
        options: ['print', 'return', 'break', 'exit'],
        answerIndex: 1,
        explanation: 'return 会返回结果并结束函数，调用方可以拿到这个值。'
      },
      {
        id: 'p4_functions_q3',
        type: 'code',
        question: '定义一个 greet 函数，传入名字并输出问候语。',
        starterCode: '# 任务：定义函数 greet(name)，让它打印文本：你好，名字\n# 然后调用 greet("小明")',
        expectedOutput: '你好，小明'
      }
    ]
  },
  {
    topicId: 'p4_lambda',
    questions: [
      {
        id: 'p4_lambda_q1',
        type: 'choice',
        question: 'lambda 是什么？',
        options: ['一种循环结构', '匿名小函数', '一种数据类型', '注释写法'],
        answerIndex: 1,
        explanation: 'lambda 用来定义一行就能写完的匿名小函数。'
      },
      {
        id: 'p4_lambda_q2',
        type: 'choice',
        question: '(lambda x: x * 2)(3) 的结果是？',
        options: ['6', '9', '3', '报错'],
        answerIndex: 0,
        explanation: '把 3 传给 x，返回 3 * 2 = 6。'
      },
      {
        id: 'p4_lambda_q3',
        type: 'code',
        question: '用 lambda 定义求平方的小函数，计算 4 的平方。',
        starterCode: '# 任务：用 lambda 定义一个求平方的小函数，打印 4 的平方',
        expectedOutput: '16'
      }
    ]
  },
  {
    topicId: 'p4_array',
    questions: [
      {
        id: 'p4_array_q1',
        type: 'choice',
        question: 'array 和普通列表的主要区别是？',
        options: ['array 只能放同类型数据，更紧凑高效', '两者完全一样', 'array 容量更大', 'array 不能遍历'],
        answerIndex: 0,
        explanation: 'array 要求元素类型一致，内存更紧凑；日常用列表就够。'
      },
      {
        id: 'p4_array_q2',
        type: 'choice',
        question: 'Python 内置的可变序列类型叫什么？',
        options: ['array', 'list', 'listarray', 'arr'],
        answerIndex: 1,
        explanation: 'list 是 Python 内置的列表类型，[1, 2, 3] 就是列表。'
      },
      {
        id: 'p4_array_q3',
        type: 'code',
        question: '用 sum() 对列表求和并打印。',
        starterCode: '# 任务：用 sum() 计算列表的和并打印\nnums = [1, 2, 3, 4]',
        expectedOutput: '10'
      }
    ]
  },
  {
    topicId: 'p4_class',
    questions: [
      {
        id: 'p4_class_q1',
        type: 'choice',
        question: '定义类使用哪个关键字？',
        options: ['class', 'object', 'def', 'struct'],
        answerIndex: 0,
        explanation: '用 class 关键字定义类，例如 class Dog:。'
      },
      {
        id: 'p4_class_q2',
        type: 'choice',
        question: '创建类的一个对象（实例化）用哪种写法？',
        options: ['Dog.new()', 'Dog()', 'new Dog()', 'class Dog'],
        answerIndex: 1,
        explanation: '像调用函数一样 Dog() 就能创建对象。'
      },
      {
        id: 'p4_class_q3',
        type: 'code',
        question: '定义一个 Dog 类，创建对象并调用它的 bark 方法。',
        starterCode: '# 任务：定义一个 Dog 类，bark 方法打印文本：汪汪\n# 然后创建对象并调用 bark()',
        expectedOutput: '汪汪'
      }
    ]
  },
  {
    topicId: 'p4_inheritance',
    questions: [
      {
        id: 'p4_inheritance_q1',
        type: 'choice',
        question: '子类继承父类后，会怎样？',
        options: ['自动拥有父类的方法和属性', '失去所有功能', '必须重写所有方法', '无法创建对象'],
        answerIndex: 0,
        explanation: '继承让子类直接复用父类的代码，只需写自己特有的部分。'
      },
      {
        id: 'p4_inheritance_q2',
        type: 'choice',
        question: '让 Dog 继承 Animal，正确写法是？',
        options: ['class Dog(Animal):', 'class Dog extends Animal:', 'class Dog -> Animal:', 'class Dog inherit Animal:'],
        answerIndex: 0,
        explanation: '类名后加圆括号写上父类即可继承。'
      },
      {
        id: 'p4_inheritance_q3',
        type: 'code',
        question: '让 Dog 继承 Animal，并调用父类的 speak 方法。',
        starterCode: '# 任务：让 Dog 继承 Animal，创建 Dog 对象并调用 speak()\nclass Animal:\n    def speak(self):\n        print("动物叫")',
        expectedOutput: '动物叫'
      }
    ]
  },
  {
    topicId: 'p4_iterators',
    questions: [
      {
        id: 'p4_iterators_q1',
        type: 'choice',
        question: '迭代器每次取一个元素，使用哪个函数？',
        options: ['next()', 'push()', 'pop()', 'shift()'],
        answerIndex: 0,
        explanation: 'next() 每次返回迭代器的下一个元素。'
      },
      {
        id: 'p4_iterators_q2',
        type: 'choice',
        question: 'for 循环遍历可迭代对象时，背后调用的是？',
        options: ['迭代器协议', '递归', '多线程', '指针运算'],
        answerIndex: 0,
        explanation: 'for 循环本质上就是不断调用迭代器的 next 直到取完。'
      },
      {
        id: 'p4_iterators_q3',
        type: 'code',
        question: '把列表转成迭代器，用 next() 取前两个元素。',
        starterCode: '# 任务：用 next() 从迭代器里取前两个元素并打印\nit = iter([10, 20, 30])',
        expectedOutput: '10\n20'
      }
    ]
  },
  {
    topicId: 'p4_polymorphism',
    questions: [
      {
        id: 'p4_polymorphism_q1',
        type: 'choice',
        question: '多态带来的好处是？',
        options: ['不同类型对象可以用同一套代码统一调用', '代码运行更快', '不需要定义类', '减少内存占用'],
        answerIndex: 0,
        explanation: '只要对象都有同名方法，就能用循环统一调用，互不干扰。'
      },
      {
        id: 'p4_polymorphism_q2',
        type: 'choice',
        question: '两个类有同名方法，调用时会发生什么？',
        options: ['各自执行自己的方法', '程序报错', '只执行第一个类的', '随机执行一个'],
        answerIndex: 0,
        explanation: '多态让每个对象调用自己的同名方法，互不影响。'
      },
      {
        id: 'p4_polymorphism_q3',
        type: 'code',
        question: '猫和狗都有 make_sound 方法，用循环统一调用。',
        starterCode: '# 任务：猫和狗都有 make_sound 方法，用 for 循环统一调用\nclass Cat:\n    def make_sound(self):\n        print("喵喵")\n\nclass Dog:\n    def make_sound(self):\n        print("汪汪")',
        expectedOutput: '喵喵\n汪汪'
      }
    ]
  },
  {
    topicId: 'p4_scope',
    questions: [
      {
        id: 'p4_scope_q1',
        type: 'choice',
        question: '函数内部定义的变量属于？',
        options: ['局部变量', '全局变量', '常量', '静态变量'],
        answerIndex: 0,
        explanation: '函数内定义的变量是局部的，离开函数就不能访问。'
      },
      {
        id: 'p4_scope_q2',
        type: 'choice',
        question: '想在函数内修改全局变量，需要先做什么？',
        options: ['用 global 声明', '直接修改即可', '用 local 声明', '无法修改'],
        answerIndex: 0,
        explanation: '用 global 声明后，函数内才能修改全局变量。'
      },
      {
        id: 'p4_scope_q3',
        type: 'code',
        question: '在函数内读取全局变量并打印。',
        starterCode: '# 任务：在函数 show() 里读取全局变量 message 并打印\n# 然后调用 show()\nmessage = "你好"',
        expectedOutput: '你好'
      }
    ]
  },
  {
    topicId: 'p5_modules',
    questions: [
      {
        id: 'p5_modules_q1',
        type: 'choice',
        question: '导入模块使用哪个关键字？',
        options: ['include', 'import', 'using', 'require'],
        answerIndex: 1,
        explanation: '用 import 导入模块，例如 import math。'
      },
      {
        id: 'p5_modules_q2',
        type: 'choice',
        question: 'import math 之后，求 9 的平方根怎么写？',
        options: ['math.sqrt(9)', 'sqrt(9)', 'math->sqrt(9)', 'sqrt.math(9)'],
        answerIndex: 0,
        explanation: '用 模块名.函数名 的方式调用模块里的函数。'
      },
      {
        id: 'p5_modules_q3',
        type: 'code',
        question: '导入 math，计算 16 的平方根并打印。',
        starterCode: '# 任务：导入 math，打印 16 的平方根',
        expectedOutput: '4.0'
      }
    ]
  },
  {
    topicId: 'p5_datetime',
    questions: [
      {
        id: 'p5_datetime_q1',
        type: 'choice',
        question: '处理日期时间，应该用哪个模块？',
        options: ['time', 'datetime', 'date', 'clock'],
        answerIndex: 1,
        explanation: 'datetime 模块提供了日期、时间、时间差等常用功能。'
      },
      {
        id: 'p5_datetime_q2',
        type: 'choice',
        question: 'datetime.date(2026, 1, 1) 表示什么？',
        options: ['2026年1月1日这个日期', '一个时间戳', '一个字符串', '程序报错'],
        answerIndex: 0,
        explanation: 'date(年, 月, 日) 创建对应的日期对象。'
      },
      {
        id: 'p5_datetime_q3',
        type: 'code',
        question: '计算 1 月 5 日比 1 月 1 日晚几天。',
        starterCode: '# 任务：计算 1 月 5 日比 1 月 1 日晚几天\n# 提示：两个日期相减后取 .days\nfrom datetime import date\nd1 = date(2026, 1, 1)\nd2 = date(2026, 1, 5)',
        expectedOutput: '4'
      }
    ]
  },
  {
    topicId: 'p5_math',
    questions: [
      {
        id: 'p5_math_q1',
        type: 'choice',
        question: '圆周率 π 在 math 模块中的写法是？',
        options: ['math.pi', 'math.π', 'math.PI', 'pi()'],
        answerIndex: 0,
        explanation: 'math.pi 就是圆周率常量，约等于 3.14159。'
      },
      {
        id: 'p5_math_q2',
        type: 'choice',
        question: '向下取整（去掉小数部分）用哪个函数？',
        options: ['math.floor', 'math.ceil', 'math.round', 'math.abs'],
        answerIndex: 0,
        explanation: 'floor 向下取整，ceil 向上取整。'
      },
      {
        id: 'p5_math_q3',
        type: 'code',
        question: '计算半径 5 的圆面积（π * r * r），保留 2 位小数。',
        starterCode: '# 任务：计算半径 5 的圆的面积（π * r * r），保留 2 位小数\nimport math\nr = 5',
        expectedOutput: '78.54'
      }
    ]
  },
  {
    topicId: 'p5_json',
    questions: [
      {
        id: 'p5_json_q1',
        type: 'choice',
        question: '把 Python 对象转成 JSON 字符串用哪个函数？',
        options: ['json.loads', 'json.dumps', 'json.parse', 'json.stringify'],
        answerIndex: 1,
        explanation: 'dumps 把 Python 对象打包成 JSON 字符串。'
      },
      {
        id: 'p5_json_q2',
        type: 'choice',
        question: '把 JSON 字符串转回 Python 对象用哪个函数？',
        options: ['json.loads', 'json.dumps', 'json.read', 'json.open'],
        answerIndex: 0,
        explanation: 'loads 把 JSON 字符串解析成 Python 对象。'
      },
      {
        id: 'p5_json_q3',
        type: 'code',
        question: '把字典转成 JSON 字符串并打印（保留中文）。',
        starterCode: '# 任务：把 data 字典转成 JSON 字符串并打印（保留中文）\nimport json\ndata = {"name": "小明", "age": 10}',
        expectedOutput: '{"name": "小明", "age": 10}'
      }
    ]
  },
  {
    topicId: 'p5_regex',
    questions: [
      {
        id: 'p5_regex_q1',
        type: 'choice',
        question: 'Python 的正则表达式模块叫什么？',
        options: ['re', 'regex', 'reg', 'pattern'],
        answerIndex: 0,
        explanation: '正则模块名是 re，例如 import re。'
      },
      {
        id: 'p5_regex_q2',
        type: 'choice',
        question: 're.findall 的作用是？',
        options: ['找出所有匹配的内容', '替换匹配内容', '删除匹配内容', '编译正则'],
        answerIndex: 0,
        explanation: 'findall 会返回一个列表，包含所有匹配的结果。'
      },
      {
        id: 'p5_regex_q3',
        type: 'code',
        question: '用正则找出字符串里的所有数字。',
        starterCode: '# 任务：用正则找出 "a1b22c333" 里的所有数字\nimport re',
        expectedOutput: "['1', '22', '333']"
      }
    ]
  },
  {
    topicId: 'p5_pip',
    questions: [
      {
        id: 'p5_pip_q1',
        type: 'choice',
        question: '安装第三方库使用哪个命令？',
        options: ['pip install 库名', 'pip download 库名', 'import 库名', 'install 库名'],
        answerIndex: 0,
        explanation: 'pip install 是安装第三方库的标准命令。'
      },
      {
        id: 'p5_pip_q2',
        type: 'choice',
        question: '查看当前安装了哪些库，用哪个命令？',
        options: ['pip list', 'pip show all', 'pip info', 'pip view'],
        answerIndex: 0,
        explanation: 'pip list 会列出所有已安装的库和版本。'
      },
      {
        id: 'p5_pip_q3',
        type: 'choice',
        question: '导入一个库之前，首先要做什么？',
        options: ['确保它已安装，再 import', '先写注释', '先运行 print', '先保存文件'],
        answerIndex: 0,
        explanation: '第三方库要先安装成功，import 才能找到它。'
      }
    ]
  },
  {
    topicId: 'p5_tryexcept',
    questions: [
      {
        id: 'p5_tryexcept_q1',
        type: 'choice',
        question: '捕获异常使用什么结构？',
        options: ['try / except', 'if / else', 'for / break', 'while / continue'],
        answerIndex: 0,
        explanation: '把可能出错的代码放在 try 里，出错时执行 except 分支。'
      },
      {
        id: 'p5_tryexcept_q2',
        type: 'choice',
        question: '程序发生异常且被 except 捕获后，会发生什么？',
        options: ['程序崩溃退出', '继续执行 except 里的代码', '自动修复错误', '跳过整个文件'],
        answerIndex: 1,
        explanation: '捕获后程序不会崩溃，会执行 except 分支的代码。'
      },
      {
        id: 'p5_tryexcept_q3',
        type: 'code',
        question: '捕获除以 0 的异常，输出友好提示。',
        starterCode: '# 任务：捕获除以 0 的异常，输出文本：不能除以 0\n# 提示：用 try / except ZeroDivisionError',
        expectedOutput: '不能除以 0'
      }
    ]
  },
  {
    topicId: 'p5_file',
    questions: [
      {
        id: 'p5_file_q1',
        type: 'choice',
        question: '打开文件使用哪个函数？',
        options: ['open()', 'read()', 'file()', 'load()'],
        answerIndex: 0,
        explanation: 'open() 打开文件并返回文件对象，read/write 都是它提供的方法。'
      },
      {
        id: 'p5_file_q2',
        type: 'choice',
        question: '以写入模式打开文件用哪个模式符？',
        options: ['"w"', '"r"', '"a"', '"x"'],
        answerIndex: 0,
        explanation: '"w" 是写入模式（会覆盖原内容），"r" 是只读模式。'
      },
      {
        id: 'p5_file_q3',
        type: 'code',
        question: '把文本 你好 写入 test.txt，再读出来打印。',
        starterCode: '# 任务：把文本 你好 写入 test.txt，再读出来打印\n# 提示：可以用 with open(...) 打开文件',
        expectedOutput: '你好'
      }
    ]
  },
  {
    topicId: 'p6_mpl_start',
    questions: [
      {
        id: 'p6_mpl_start_q1',
        type: 'choice',
        question: '画折线图使用哪个函数？',
        options: ['plt.plot()', 'plt.bar()', 'plt.scatter()', 'plt.pie()'],
        answerIndex: 0,
        explanation: 'plot 把点连成线，是画折线图的基础函数。'
      },
      {
        id: 'p6_mpl_start_q2',
        type: 'choice',
        question: '画柱状图使用哪个函数？',
        options: ['plt.plot()', 'plt.bar()', 'plt.line()', 'plt.hist()'],
        answerIndex: 1,
        explanation: 'bar 用柱子高度表示数值大小，适合对比分类数据。'
      },
      {
        id: 'p6_mpl_start_q3',
        type: 'code',
        question: '用非交互后端画一张折线图，输出提示文字。',
        starterCode: '# 任务：用非交互后端（Agg）画一条折线图，并输出文本：绘图完成\n# 提示：import matplotlib 后先 matplotlib.use("Agg")，再导入 pyplot',
        expectedOutput: '绘图完成'
      }
    ]
  },
  {
    topicId: 'cmd_cli_flags',
    questions: [
      {
        id: 'cmd_cli_flags_q1',
        type: 'choice',
        question: '在命令行运行 Python 文件，正确写法是？',
        options: ['python 文件名.py', 'run 文件名', 'python --run 文件名', 'exec 文件名'],
        answerIndex: 0,
        explanation: 'python 后面跟文件名，例如 python hello.py。'
      },
      {
        id: 'cmd_cli_flags_q2',
        type: 'choice',
        question: 'python -c "代码" 的作用是？',
        options: ['直接执行一段代码', '复制代码', '打开编辑器', '编译代码'],
        answerIndex: 0,
        explanation: '-c 后面的字符串会被当作代码直接执行，适合快速测试。'
      },
      {
        id: 'cmd_cli_flags_q3',
        type: 'code',
        question: '打印当前 Python 的主版本号（大版本）。',
        starterCode: '# 任务：打印当前 Python 的主版本号\n# 提示：sys.version_info.major\nimport sys',
        expectedOutput: '3'
      }
    ]
  },
  {
    topicId: 'cmd_m_modules',
    questions: [
      {
        id: 'cmd_m_modules_q1',
        type: 'choice',
        question: 'python -m http.server 8000 的作用是？',
        options: ['在当前目录启动一个网页服务器', '下载文件', '安装库', '删除文件'],
        answerIndex: 0,
        explanation: '-m http.server 会用 Python 内置模块启动一个简易文件服务器。'
      },
      {
        id: 'cmd_m_modules_q2',
        type: 'choice',
        question: 'python -m 表示什么？',
        options: ['以模块的方式运行', '最小化运行', '修改配置', '移动文件'],
        answerIndex: 0,
        explanation: '-m 后面跟模块名，Python 会以模块方式运行它。'
      },
      {
        id: 'cmd_m_modules_q3',
        type: 'code',
        question: '打印一段提示，确认模块方式运行正常。',
        starterCode: '# 任务：输出一段提示文字：模块运行正常',
        expectedOutput: '模块运行正常'
      }
    ]
  },
  {
    topicId: 'cmd_keywords',
    questions: [
      {
        id: 'cmd_keywords_q1',
        type: 'choice',
        question: '下面哪个是 Python 关键字？',
        options: ['if', 'main', 'print', 'length'],
        answerIndex: 0,
        explanation: 'if、for、while、def 等都是关键字，print 是函数不是关键字。'
      },
      {
        id: 'cmd_keywords_q2',
        type: 'choice',
        question: '关键字能直接用作变量名吗？',
        options: ['不能', '可以', '有时可以', '编译时才报错'],
        answerIndex: 0,
        explanation: '关键字有特殊含义，不能当变量名使用。'
      },
      {
        id: 'cmd_keywords_q3',
        type: 'code',
        question: '用 keyword 模块确认 "if" 是不是关键字。',
        starterCode: '# 任务：用 keyword 模块判断 "if" 是否是关键字并打印结果\nimport keyword',
        expectedOutput: 'True'
      }
    ]
  },
  {
    topicId: 'cmd_builtins',
    questions: [
      {
        id: 'cmd_builtins_q1',
        type: 'choice',
        question: '内置函数 len() 的作用是？',
        options: ['求长度', '求和', '排序', '打印'],
        answerIndex: 0,
        explanation: 'len() 返回字符串、列表等对象的长度。'
      },
      {
        id: 'cmd_builtins_q2',
        type: 'choice',
        question: '求一组数中的最大值，用哪个内置函数？',
        options: ['max()', 'biggest()', 'top()', 'large()'],
        answerIndex: 0,
        explanation: 'max() 返回最大值，min() 返回最小值。'
      },
      {
        id: 'cmd_builtins_q3',
        type: 'code',
        question: '用内置函数打印列表的最大值和最小值。',
        starterCode: '# 任务：用内置函数打印 [3, 7, 2] 的最大值和最小值',
        expectedOutput: '7\n2'
      }
    ]
  }
];

window.TUTORIAL_STAGES = [stage1, stage2, stage3, stage4, stage5, stage6, cmdHelp];
window.TOPIC_QUIZZES = TOPIC_QUIZZES;
