import { TutorialStage } from '../../tutorialData';

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
          { heading: '常见导入语法', text: '就像工具箱：螺丝刀、扳手、钳子各有各的抽屉。Python 里 import math 就是打开「数学」抽屉，里面的 sqrt 开平方、pi 圆周率随时能拿。\n\n• `import module_name`：导入整个模块\n• `from module import xxx`：导入模块中的指定符号\n• `import module as alias`：导入并重命名\n• `from module import *`：导入所有（不推荐，容易命名冲突）',
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
            heading: '查看模块内容：dir 与 help',
            text: '导入一个陌生模块后，怎么快速知道它里面有什么？两个内置工具：\n• `dir(模块名)`：返回该模块所有属性和函数名的列表\n• `help(对象)`：打印该对象的帮助文档，包括函数签名和用法说明\n\n这两个不依赖网络，是学习第三方模块最快的方式。',
            code: `import math\n\n# dir() 列出 math 里所有公开名字（过滤掉下划线开头的内部成员）\nnames = [n for n in dir(math) if not n.startswith("_")]\nprint("math 公开成员数量:", len(names))\nprint("前 10 个:", names[:10])\n\n# help() 会打印文档；这里用 __doc__ 取 sqrt 的文档首行演示\nprint("sqrt 文档摘要:", math.sqrt.__doc__.splitlines()[0])`
          },
          {
            heading: 'sys.path 搜索顺序',
            text: '执行 `import 模块名` 时，Python 按 sys.path 列表里的目录顺序逐个查找：先找当前脚本所在目录，再找标准库目录，最后找第三方包目录（site-packages）。想知道某个模块是从哪个文件加载的，打印 `模块名.__file__` 即可。\n\nPyodide 环境下 sys.path 已预置好，无需手动配置；本机开发时如果 import 报 ModuleNotFoundError，通常是模块所在目录不在 sys.path 里。',
            code: `import sys\nprint("Python 版本:", sys.version.split()[0])\nprint("搜索路径数量:", len(sys.path))\nfor p in sys.path[:3]:\n    print(" -", p)`
          },
          {
            heading: '标准库概览',
            text: 'Python 有一句口号叫「batteries included」（自带电池），常用功能不用装第三方包，import 即用。下面这些是最常用的标准库模块：',
            table: {
              headers: ['模块', '一句话作用', '典型场景'],
              rows: [
                ['os / os.path', '与操作系统交互、路径拼接', '找文件、拼路径'],
                ['sys', '解释器相关变量和函数', '命令行参数、搜索路径'],
                ['pathlib', '面向对象的路径处理', '跨平台路径读写'],
                ['datetime', '日期时间运算与格式化', '算天数、格式化时间'],
                ['json', 'JSON 序列化与反序列化', '接口数据交换'],
                ['re', '正则表达式', '文本搜索与替换'],
                ['math', '数学函数', '开方、对数、取整'],
                ['random', '伪随机数', '抽样、打乱、生成测试数据'],
                ['collections', '扩展容器', 'Counter、defaultdict、namedtuple'],
                ['itertools', '迭代器工具', '组合、排列、链式处理']
              ]
            }
          },
          {
            heading: '对象自省：vars / hasattr / getattr / setattr',
            text: '有时属性名是动态拼出来的字符串，不能写 `obj.name` 这种硬编码：\n• `vars(obj)`：返回对象的 `__dict__`，即属性字典\n• `hasattr(obj, "name")`：判断对象有没有这个属性\n• `getattr(obj, "name", 默认值)`：安全取属性，不存在时返回默认值而不报错\n• `setattr(obj, "name", 值)`：动态给对象设置属性',
            code: `class Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\ns = Student("小明", 18)\nprint("属性字典:", vars(s))\nprint("有 name 吗:", hasattr(s, "name"))\nprint("有 score 吗:", hasattr(s, "score"))\nprint("score 不存在时给默认值:", getattr(s, "score", 0))\nsetattr(s, "grade", 3)\nprint("动态加上 grade 属性:", s.grade)`
          },
          {
            heading: '包内相对导入',
            text: '在同一个包内部导入兄弟模块时，用「点」表示当前包层级，叫相对导入：\n• `from . import 兄弟模块`：导入当前包下的模块\n• `from .. import 上层模块`：导入上一级包的模块\n• `from .utils import helper`：从当前包的 utils 模块导入 helper 函数\n\n相对导入靠点定位层级，不依赖包名，以后重命名包目录也不用改代码。注意：相对导入只能在包内部使用，直接运行某个文件会报 Attempted relative import 错误。',
            code: `# 包结构示例（仅作讲解，实际运行需先建包目录）\n# mypackage/\n#   __init__.py\n#   core.py\n#   utils.py\n#\n# 在 core.py 里写：\n# from .utils import format_data\n# from ..shared import common_config\n#\n# 直接运行脚本时请用绝对导入（import mypackage.utils）。\nprint("相对导入适合包内部复用，脚本直接运行时请用绝对导入。")`
          },
        ],
        codeExample: `import math, sys\nprint("sys.path 搜索路径数量:", len(sys.path))\nfuncs = [n for n in dir(math) if not n.startswith("_")]\nprint("math 公开函数数量:", len(funcs))`,
        tips: [
          '用 `dir(模块)` 快速列出陌生模块的所有函数；用 `help(函数)` 查看详细用法。',
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
          { heading: 'datetime 核心类总览', text: '算距离放假还有几天：拿到今天的日期，再拿到放假日期，两者相减就是剩余天数。datetime.date(2026, 1, 1) - datetime.date.today() 一步算出。\n\n',
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
            text: '• `datetime.now()`：获取当前本地时间\n• `date.today()`：获取今天的日期（只有年月日）\n• `.strftime(format)`：时间对象 → 格式化字符串\n• `.strptime(string, format)`：字符串 → 时间对象\n• 时间加减：datetime + timedelta 得到新时间\n• 时间差：两个 datetime 相减得到 timedelta\n• `.replace(...)`：返回替换了部分字段的新时间对象，不改动原值',
            code: `from datetime import datetime, date, timedelta\n\n# date.today() 拿到今天的日期\ntoday = date.today()\nprint("今天:", today)\n\n# timedelta 支持 hours、weeks 等参数，不只 days\ndt = datetime(2026, 9, 28, 12, 0, 0)\nnew_dt = dt + timedelta(hours=3, weeks=1)\nprint("3 小时又 1 周后:", new_dt)\n\n# total_seconds() 把时间差换算成总秒数\ndelta = timedelta(days=1, hours=2)\nprint("一天两小时等于多少秒:", delta.total_seconds())\n\n# replace() 替换年、月等字段，原对象不变\nfixed = dt.replace(year=2030, month=1)\nprint("替换后:", fixed)`
          },
          {
            heading: '常用格式化符号速查',
            text: '',
            table: {
              headers: ['符号', '含义', '示例'],
              rows: [
                ['%Y', '四位年份', '2026'],
                ['%y', '两位年份', '26'],
                ['%m', '两位月份', '07'],
                ['%d', '两位日期', '30'],
                ['%H', '24 小时制', '18'],
                ['%I', '12 小时制', '06'],
                ['%p', '上午/下午', 'AM / PM'],
                ['%M', '分钟', '30'],
                ['%S', '秒', '45'],
                ['%A', '星期全称', 'Monday'],
                ['%B', '月份全称', 'July']
              ]
            }
          },
          {
            heading: '时区处理（zoneinfo）',
            text: '跨时区的程序不能只用本地时间。Python 3.9+ 自带 zoneinfo 模块，可以给 datetime 附加时区信息：\n• 带时区的 datetime 叫 aware datetime，不带的叫 naive datetime\n• 本机运行时需要 tzdata 数据包；Pyodide 环境下通常直接用内置的 UTC\n• 存数据库、传接口建议统一存 UTC 时间，展示时再转当地时区',
            code: `from datetime import datetime, timezone\n\n# UTC 时区是 datetime 内置的，不需要额外数据包\nutc_now = datetime.now(timezone.utc)\nprint("UTC 时间:", utc_now.strftime("%Y-%m-%d %H:%M %Z"))\n\n# 本机 Python 3.9+ 可用 zoneinfo 转上海时间（在此环境下仅作注释演示）：\n# from zoneinfo import ZoneInfo\n# shanghai = utc_now.astimezone(ZoneInfo("Asia/Shanghai"))\n# print("上海时间:", shanghai)`
          },
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
          { heading: 'math 模块分类速查', text: '装修算地板面积：房间长 5 米、宽 4 米，面积就是 5 * 4；再比如算圆面积，用 math.pi * r ** 2。数学公式交给 math，省心又准确。\n\n',
            table: {
              headers: ['分类', '常用函数/常量', '功能说明'],
              rows: [
                ['数学常量', 'math.pi, math.e, math.inf, math.nan', '圆周率、自然常数、无穷大、非数值'],
                ['取整运算', 'math.ceil, math.floor, math.trunc', '向上取整、向下取整、截断小数'],
                ['数论运算', 'math.factorial, math.gcd, math.lcm', '阶乘、最大公约数、最小公倍数'],
                ['幂指对数', 'math.sqrt, math.pow, math.exp, math.log, math.log10', '平方根、幂、e 的 x 次方、自然对数、常用对数'],
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
            heading: '浮点数判断与比较',
            text: '浮点数有两个特殊值：无穷大 inf 和非数值 nan，直接用 == 判断不可靠，math 提供了专门的判定函数：\n• `math.fabs(x)`：浮点数绝对值，返回 float（内置 abs 对 int 返回 int）\n• `math.exp(x)`：计算 e 的 x 次方\n• `math.isclose(a, b)`：判断两个浮点数是否近似相等，自动考虑精度误差\n• `math.isfinite(x)`：判断是不是有限值（既不是 inf 也不是 nan）\n• `math.isnan(x)`：判断是不是 nan',
            code: `import math\n\nprint("fabs(-3.14):", math.fabs(-3.14))\nprint("exp(1):", round(math.exp(1), 4))\n\n# 经典坑：0.1 + 0.2 在浮点数里不等于 0.3\na = 0.1 + 0.2\nprint("a == 0.3 ?", a == 0.3)\nprint("isclose(a, 0.3) ?", math.isclose(a, 0.3))\n\nprint("isfinite(1.5):", math.isfinite(1.5))\nprint("isnan(float('nan')):", math.isnan(float("nan")))`
          },
          {
            heading: '注意事项',
            text: '• math 模块只处理浮点数，复数计算请用 cmath 模块\n• 阶乘只能用于非负整数\n• 对数函数参数必须大于 0\n• 比较浮点数用 isclose，不要直接 =='
          },
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
          { heading: 'JSON ↔ Python 类型映射', text: '网购下单后，网站把订单信息（姓名、地址、商品）打包成一段 JSON 文字发给商家系统；商家解析这段文字就能看到订单内容。json.dumps 打包，json.loads 解析。\n\n',
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
            text: '• `json.loads(s)`：JSON 字符串 → Python 对象\n• `json.dumps(obj)`：Python 对象 → JSON 字符串\n• `json.load(fp)`：从文件对象读取并解析\n• `json.dump(obj, fp)`：序列化后写入文件对象\n\ns 结尾表示 string，处理字符串；不带 s 处理文件句柄。',
            code: `import json\n\n# Python 字典\nuser_data = {\n    "id": 1001,\n    "username": "developer",\n    "roles": ["admin", "editor"],\n    "is_active": True\n}\n\n# 序列化为 JSON 字符串\njson_str = json.dumps(user_data, indent=2, ensure_ascii=False)\nprint("序列化结果:\\n", json_str)\n\n# 反序列化还原\nparsed = json.loads(json_str)\nprint("还原用户名:", parsed["username"])`
          },
          {
            heading: '读写 JSON 文件',
            text: '不带 s 的 `json.dump(obj, f)` 和 `json.load(f)` 直接操作文件对象。本机运行时写法：\n\n```python\nwith open("data.json", "w", encoding="utf-8") as f:\n    json.dump(data, f, ensure_ascii=False, indent=2)\n\nwith open("data.json", "r", encoding="utf-8") as f:\n    data = json.load(f)\n```\n\n当前 IDE 基于 Pyodide，对工作区外路径的文件读写受限，下面用 io.StringIO（内存里的文件对象）演示完全相同的 dump / load API：',
            code: `import json\nfrom io import StringIO\n\ndata = {"name": "小明", "score": 95, "pass": True}\n\n# 用 StringIO 当作内存文件对象\nbuf = StringIO()\njson.dump(data, buf, ensure_ascii=False, indent=2)\nprint("写入缓冲区内容:\\n", buf.getvalue())\n\n# 读回来\nbuf.seek(0)\nrestored = json.load(buf)\nprint("读回 name:", restored["name"], "score:", restored["score"])`
          },
          {
            heading: 'dumps 常用参数',
            text: '• `indent=2`：格式化缩进，输出更美观\n• `ensure_ascii=False`：保留中文，不转义为 \\uXXXX\n• `sort_keys=True`：按键名字典序输出，让结果稳定、便于 diff 对比\n• `default=函数`：遇到不能直接序列化的对象（如 datetime）时，调用该函数把它转成可序列化类型',
            code: `import json\nfrom datetime import datetime\n\ndata = {"b": 1, "a": 2, "time": datetime(2026, 9, 28)}\n\n# sort_keys 让按键名排序输出；default=str 把 datetime 转成字符串\nprint(json.dumps(data, sort_keys=True, default=str, ensure_ascii=False))\n\n# default 也可以传自定义转换函数\ndef to_serializable(obj):\n    if isinstance(obj, datetime):\n        return obj.strftime("%Y/%m/%d")\n    return str(obj)\n\nprint(json.dumps({"t": datetime(2026, 1, 1)}, default=to_serializable))`
          },
          {
            heading: 'JSONDecodeError',
            text: 'json.loads 遇到格式错误的 JSON 字符串会抛出 `json.JSONDecodeError`，而不是静默返回 None。解析网络响应、用户输入等外部数据时务必捕获，否则一个坏字符串就会让程序崩溃。',
            code: `import json\n\nfor bad in ['{"a": 1}', '这不是 JSON', '{missing: quote}']:\n    try:\n        obj = json.loads(bad)\n        print("解析成功:", obj)\n    except json.JSONDecodeError as e:\n        print(f"[{bad}] 解析失败，位置 {e.pos} 附近出错")`
          },
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
          { heading: '核心匹配函数', text: '在通讯录里找所有手机号：不用一条条看，用正则表达式 r"\\d{11}" 就能把 11 位数字全找出来。就像用「放大镜 + 规则尺」扫描文字。\n\n• `re.search(pattern, string)`：扫描字符串，返回首个匹配的 Match 对象（找到就停）\n• `re.findall(pattern, string)`：以列表返回所有非重叠匹配文本\n• `re.sub(pattern, repl, string)`：将匹配的子串替换为新文本\n• `re.match(pattern, string)`：只从字符串开头匹配',
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
                ['*', '前一个字符出现 0 次或多次（贪婪）', 'ab*c 匹配 ac, abc, abbc'],
                ['+', '前一个字符出现 1 次或多次', 'ab+c 匹配 abc, abbc'],
                ['?', '前一个字符出现 0 次或 1 次', 'ab?c 匹配 ac, abc'],
                ['{m,n}', '前一个字符出现 m 到 n 次', '\\d{2,4} 匹配 2 到 4 位数字'],
                ['^', '匹配字符串开头', '^hello 匹配开头的 hello'],
                ['$', '匹配字符串结尾', 'world$ 匹配结尾的 world'],
                ['\\d', '匹配数字（等价于 [0-9]）', '\\d+ 匹配连续数字'],
                ['\\D', '匹配非数字', '\\D+ 匹配非数字串'],
                ['\\s', '匹配空白字符（空格、制表、换行）', '\\s+ 匹配连续空白'],
                ['\\w', '匹配字母数字下划线', '\\w+ 匹配单词'],
                ['|', '或，匹配左右任意一边', 'cat|dog 匹配 cat 或 dog'],
                ['[abc]', '字符集，匹配集合中任意一个', '[abc] 匹配 a/b/c'],
                ['[a-z]', '范围内任意字符', '[a-z0-9] 小写字母或数字'],
                ['[^abc]', '取反，匹配不在集合里的字符', '[^0-9] 非数字'],
                ['()', '分组捕获', '(\\d+)-(\\d+) 提取两组数字']
              ]
            },
            code: `import re\n\ntext = "电话: 010-88886666, 手机: 13800138000, 邮箱: admin@python-you.io"\n\n# 提取手机号\nmobiles = re.findall(r"1[3-9]\\d{9}", text)\nprint("手机号列表:", mobiles)\n\n# 脱敏邮箱\nmasked = re.sub(r"[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}", "***@***", text)\nprint("脱敏后文本:", masked)`
          },
          {
            heading: 'compile、split、finditer 与 Match 对象',
            text: '• `re.compile(pattern)`：把正则编译成对象，多次使用时更快、可读性更好\n• `re.split(pattern, s)`：按正则切分字符串，比 str.split 强大（可同时按多种分隔符切）\n• `re.finditer(pattern, s)`：返回迭代器，每个元素是一个 Match 对象，适合大文本\n\nMatch 对象常用方法：\n• `.group(0)`：整个匹配文本\n• `.group(n)`：第 n 个分组（从 1 开始）\n• `.groups()`：所有分组组成的元组\n• `.span()`：(起始位置, 结束位置) 元组',
            code: `import re\n\n# 编译一次，多次复用\npat = re.compile(r"(\\w+)=(\\d+)")\ntext = "a=10, b=20, c=30"\n\nfor m in pat.finditer(text):\n    print(f"key={m.group(1)}, value={m.group(2)}, 位置={m.span()}")\n\n# 按逗号加任意空白切分\nparts = re.split(r"[,\\s]+", "苹果, 香蕉  橙子,葡萄")\nprint("切分结果:", parts)`
          },
          {
            heading: '标志位与高级用法',
            text: '• `re.I`（IGNORECASE）：忽略大小写\n• `re.M`（MULTILINE）：让 ^ 和 $ 匹配每一行的开头和结尾，而不只是整个字符串\n• `re.subn()`：和 sub 一样替换，但返回 (新字符串, 替换次数) 元组\n• `\\b`：单词边界，匹配英文单词的起止位置\n• 贪婪与非贪婪：`*`、`+` 默认贪婪（尽可能多匹配）；加 `?` 变非贪婪（尽可能少匹配），如 `*?`、`+?`',
            code: `import re\n\ntext = "Hello hello HELLO"\nprint("忽略大小写匹配:", re.findall(r"hello", text, re.I))\n\n# subn 返回替换后的字符串和替换次数\nnew_text, count = re.subn(r"\\d", "#", "订单号 20260928")\nprint("替换后:", new_text, "替换次数:", count)\n\n# 贪婪 vs 非贪婪\ns = "<a><b>"\nprint("贪婪 .*:", re.findall(r"<.*>", s))\nprint("非贪婪 .*?:", re.findall(r"<.*?>", s))`
          },
          {
            heading: '正则最佳实践',
            text: '• 始终用原始字符串 `r"..."` 写正则，避免反斜杠转义噩梦\n• 简单场景用字符串方法，不要强行写正则\n• 正则不要写得过于复杂，可读性优先\n• 反复使用的正则用 re.compile 编译一次复用'
          },
        ],
        codeExample: `import re\ns = "2026-07-30"\nmatch = re.match(r"(\\d{4})-(\\d{2})-(\\d{2})", s)\nif match:\n    print("提取年份:", match.group(1), "月份:", match.group(2))\n    print("分组元组:", match.groups())`,
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
          { heading: 'pip 常用命令速查', text: '想用照片处理库 Pillow，不用自己写图片处理代码，在包管理器里搜 pillow、一键安装，然后 import PIL 就能用了。就像装 App：装好即用。\n\n多版本 Python 共存时，推荐用 `python -m pip` 的写法，确保调用的是当前 Python 对应的 pip，而不是别的版本。\n\n',
            table: {
              headers: ['命令', '功能', '示例'],
              rows: [
                ['pip install 包名', '安装最新版包', 'pip install pandas'],
                ['pip install 包==版本', '安装指定版本', 'pip install pandas==2.0.0'],
                ['python -m pip install 包', '用当前 Python 调 pip', 'python -m pip install requests'],
                ['pip show 包名', '查看包详情（版本、位置、依赖）', 'pip show pandas'],
                ['pip install --upgrade 包', '升级到最新版', 'pip install --upgrade pip'],
                ['pip uninstall 包', '卸载包', 'pip uninstall pandas'],
                ['pip list', '列出已安装包', 'pip list'],
                ['pip freeze', '导出已安装包列表', 'pip freeze > requirements.txt'],
                ['pip install -r 文件', '按清单批量安装', 'pip install -r requirements.txt']
              ]
            }
          },
          {
            heading: '国内镜像源（重要）',
            text: 'pip 默认从国外的 PyPI 下载，国内网络经常很慢甚至超时。换成国内镜像源能快十几倍：\n\n临时使用（单次命令加 `-i` 参数）：\n`pip install pandas -i https://pypi.tuna.tsinghua.edu.cn/simple`\n\n永久配置（写入 pip 配置文件，之后所有安装都走镜像）：\n`pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`\n\n其他常用镜像：阿里云 `https://mirrors.aliyun.com/pypi/simple/`、中科大 `https://pypi.mirrors.ustc.edu.cn/simple/`。配置后用 `pip config list` 查看是否生效。',
            code: `# 以下命令在本机终端执行，不是在 Python 解释器里运行\n# pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple\n# pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple\n# pip config list\nprint("镜像源配置在终端执行，不在 .py 代码里运行。")`
          },
          {
            heading: '虚拟环境与依赖清单',
            text: '不同项目可能依赖不同版本的包，虚拟环境为每个项目创建一套独立的 Python 环境，互不干扰：\n• 创建：`python -m venv .venv`\n• 激活：Windows `.venv\\Scripts\\activate`，macOS/Linux `source .venv/bin/activate`\n• 退出：在终端直接敲 `deactivate`\n• 导出依赖：`pip freeze > requirements.txt`\n• 按清单安装：`pip install -r requirements.txt`\n\nrequirements.txt 里常见的版本约束符号：\n• `pandas==2.0.3`：精确版本\n• `pandas>=2.0.0`：大于等于\n• `pandas>=1.0,<3.0`：区间\n• `pandas~=2.0`：兼容版本（2.0.x，不跨大版本）',
            code: `# 虚拟环境标准工作流（在终端执行）\n# python -m venv .venv\n# .venv\\Scripts\\activate    # Windows 激活\n# pip install requests==2.31.0\n# pip freeze > requirements.txt\n# deactivate                # 退出虚拟环境\nprint("虚拟环境命令在终端运行，用于隔离不同项目的依赖。")`
          },
          {
            heading: '包管理器',
            text: '在 IDE 界面左侧工具栏中点击【包管理器】按钮，即可在线一键搜索安装 NumPy、Pandas、SymPy 等众多第三方库，无需手动敲命令。'
          },
        ],
        codeExample: `import sys\nprint("当前环境已装载的内嵌路径与模块总数:", len(sys.modules))`,
        tips: [
          '你可以使用侧边栏【包管理器】快速安装与管理项目中所需的各种依赖包。',
          '项目一定要锁定依赖版本，换环境后才不会运行异常；国内开发先配清华镜像源。'
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
          { heading: '完整异常结构', text: '让用户输入年龄：用户手滑输了「abc」，int("abc") 会报错。用 try: age = int(input(...)) except: 提示「请输入数字」。程序不会崩，还能友好提醒。\n\n`try-except-else-finally` 四部分组成：\n• `try`：可能抛出异常的代码\n• `except 异常类型`：捕获指定异常并处理\n• `else`：没有异常时执行\n• `finally`：无论是否异常都执行，用于资源清理',
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
                ['PermissionError', '没有权限操作文件或资源'],
                ['ModuleNotFoundError', 'import 找不到模块'],
                ['AttributeError', '对象没有该属性/方法'],
                ['JSONDecodeError', 'JSON 格式错误（json 模块）']
              ]
            }
          },
          {
            heading: '合并捕获与兜底姿势',
            text: '多个异常类型的处理方式相同时，可以用元组合并，避免重复写 except 块：\n`except (ValueError, TypeError) as e:`\n\n如果想兜底所有「非系统退出类」异常，用 `except Exception:`，而不是裸 `except:`（裸 except 会连 KeyboardInterrupt、SystemExit 都吞掉，导致程序关不掉）。注意兜底只放在最外层，内部代码仍要尽量精确捕获。',
            code: `def parse_age(s):\n    try:\n        age = int(s)\n        if age < 0:\n            raise ValueError("年龄不能为负")\n        return age\n    except (ValueError, TypeError) as e:\n        print(f"输入 [{s}] 不合法: {e}")\n        return None\n    except Exception:\n        print("未知错误，兜底处理")\n        return None\n\nprint(parse_age("18"))\nprint(parse_age("abc"))\nprint(parse_age(-5))`
          },
          {
            heading: '自定义异常',
            text: '继承 Exception 类可以定义业务相关的自定义异常，让错误分类更清晰。',
            code: `class CustomAppError(Exception):\n    \"\"\"自定义业务异常基类\"\"\"\n    pass\n\nclass InsufficientBalanceError(CustomAppError):\n    \"\"\"余额不足异常\"\"\"\n    pass\n\ntry:\n    raise InsufficientBalanceError("账户余额不足，无法扣款")\nexcept CustomAppError as err:\n    print("捕获业务异常:", err)`
          },
          {
            heading: '异常链与 assert',
            text: '• `raise 新异常 from 原异常`：抛出新异常时保留原始异常作为原因，调试时能通过 `e.__cause__` 看到完整错误链路\n• `assert 条件, "提示信息"`：条件为假时抛出 AssertionError，用于开发阶段自检。注意不要用它处理运行时错误，且 `python -O` 会跳过所有 assert',
            code: `def divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError as e:\n        raise ValueError("除数不能为零，请检查输入") from e\n\ndef validate_age(age):\n    assert 0 < age < 150, f"年龄 {age} 不合理"\n    return age\n\ntry:\n    divide(1, 0)\nexcept ValueError as e:\n    print("捕获:", e)\n    print("原始原因:", e.__cause__)\n\nprint("校验年龄:", validate_age(20))\ntry:\n    validate_age(999)\nexcept AssertionError as e:\n    print("断言失败:", e)`
          },
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
          { heading: '文件打开模式全解', text: '写日记：open("diary.txt", "w") 打开（w 表示写入模式），把内容写进去，关掉。下次用 with open("diary.txt", "r") as f: 读出来。就像打开笔记本记录、合上。\n\n',
            table: {
              headers: ['模式', '名称', '读写', '文件不存在', '文件存在时'],
              rows: [
                ['"r"', '只读', '仅读', '抛出 FileNotFoundError', '指针在开头，读取'],
                ['"w"', '覆盖写', '仅写', '创建新文件', '清空原有内容，重写'],
                ['"a"', '追加写', '仅写', '创建新文件', '指针在末尾，追加'],
                ['"r+"', '读写', '可读可写', '抛出错误', '指针在开头，覆盖'],
                ['"rb" / "wb"', '二进制读/写', '字节流', '读时报错 / 写时新建', '处理图片、视频等非文本']
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
            text: '• `.read()`：一次性读取全部内容\n• `.readline()`：读取一行\n• `.readlines()`：读取所有行，返回列表\n• `.write(s)`：写入字符串\n• `.writelines(列表)`：把字符串列表一次性写入（不会自动加换行，需要自己加 \\n）\n• `.seek(offset)`：移动文件指针位置\n• `.tell()`：返回当前指针位置',
            code: `with open("demo_output.txt", "r", encoding="utf-8") as f:\n    print("当前指针位置:", f.tell())\n    content = f.read(10)  # 读 10 个字符\n    print("读取内容:", content)\n    print("读取后位置:", f.tell())`
          },
          {
            heading: 'writelines 与二进制读写',
            text: '• `.writelines(列表)`：批量写入多行字符串，比循环 write 更高效，但不会自动在行末加换行\n• 二进制模式：模式后加 `b`，如 `"rb"` 读、`"wb"` 写，处理图片、音频、压缩包等非文本文件，读写的都是 bytes 对象\n\n二进制文件需要真实磁盘路径，当前 Pyodide 环境下请在本机 Python 中运行。下面用 io.StringIO 演示 writelines：',
            code: `from io import StringIO\n\n# 注意每个字符串末尾要自己加 \\n\nlines = ["第一行\\n", "第二行\\n", "第三行\\n"]\nbuf = StringIO()\nbuf.writelines(lines)\nprint("writelines 写入结果:\\n" + buf.getvalue())\n\n# 二进制读写（需本机运行，在此处仅展示写法）：\n# with open("pic.png", "rb") as f:\n#     data = f.read()\n# with open("copy.png", "wb") as f:\n#     f.write(data)`
          },
        ],
        codeExample: `import io

# 用内存里的文件对象演示 open 的写入与读回
buf = io.StringIO()
buf.write("第一行：用 open 读写文件\n")
buf.write("第二行：with 会自动关闭\n")

# 指针回到开头再读回
buf.seek(0)
content = buf.read()
print("写入后读回的内容：")
print(content)
print("一共", len(content.splitlines()), "行")`,
        tips: [
          '在 Python You 中用代码创建或修改的文件，会自动实时同步至左侧 IDE 文件树视图中！',
          '打开文本文件务必指定 encoding="utf-8"，避免不同系统乱码。'
        ]
      }
    },
    {
      id: 'p5_os',
      title: 'Python 路径处理',
      stage: 'Python 标准库',
      summary: 'os.path.join 和 pathlib 帮你拼出跨平台的文件路径。',
      content: {
        overview: 'Windows 用反斜杠 \\ 分隔目录，macOS 和 Linux 用正斜杠 /。手动拼路径写成 "folder\\\\file.txt" 换个系统就挂。os.path.join() 和 pathlib 会自动选择正确的分隔符，是写跨平台程序的必备工具。',
        sections: [
          {
            heading: 'os.path.join（重点）',
            text: '拼接路径时永远用 os.path.join，不要自己写斜杠：\n• 自动按当前操作系统选择分隔符（Windows 是 \\，其他系统是 /）\n• 自动处理多余的斜杠\n• 遇到绝对路径会重置之前的拼接结果\n\n配合 os.path.dirname、os.path.basename、os.path.splitext 可以方便地拆解路径。',
            code: `import os\n\n# 跨平台拼接：Windows 输出 folder\\sub\\file.txt，其他系统输出 folder/sub/file.txt\npath = os.path.join("folder", "sub", "file.txt")\nprint("拼接结果:", path)\n\n# 拆解路径\nprint("目录名:", os.path.dirname(path))\nprint("文件名:", os.path.basename(path))\nprint("拆分扩展名:", os.path.splitext("data.csv"))`
          },
          {
            heading: 'pathlib.Path（面向对象）',
            text: 'Python 3.4+ 提供 pathlib，用斜杠运算符 / 拼路径，比 os.path 更直观：\n• `Path("folder") / "sub" / "file.txt"`\n• `.exists()`、`.is_file()`、`.is_dir()` 判断状态\n• `.read_text()`、`.write_text()` 直接读写文本文件\n\n新项目推荐直接用 pathlib，API 更统一、更现代。',
            code: `from pathlib import Path\n\np = Path("docs") / "guide.md"\nprint("完整路径:", p)\nprint("文件名:", p.name)\nprint("后缀:", p.suffix)\nprint("父目录:", p.parent)\n\n# 只读演示：Path 对象自带 exists 等方法\nprint("exists 方法存在吗:", hasattr(p, "exists"))`
          },
        ],
        codeExample: `import os\nparts = ["data", "2026", "report.csv"]\nprint("跨平台路径:", os.path.join(*parts))`,
        tips: [
          '拼路径一律用 os.path.join 或 pathlib，不要手写斜杠。',
          '新项目推荐直接用 pathlib，链式调用更简洁。'
        ]
      }
    }
  ]
};
