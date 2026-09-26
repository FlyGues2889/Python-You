import { TutorialStage, TutorialTopic } from '../tutorialData';

export const stage5: TutorialStage = {

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
