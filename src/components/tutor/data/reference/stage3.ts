import { TutorialStage } from '../../tutorialData';

// 标准库 API 速查：文件、路径、JSON、日期、正则、数学与系统接口
export const refStage3: TutorialStage = {
  id: 'ref_stage3',
  title: '标准库 API',
  icon: 'library_books',
  topics: [
    {
      id: 'ref_file_io',
      title: '文件与路径',
      stage: 'Python 参考手册 > 文件与路径',
      kind: 'reference',
      summary: 'open 模式、文件对象方法、os.path 与 pathlib 常用接口。',
      content: {
        overview: '文件操作三步：open 打开 → 读或写 → 关闭。用 with 语句可以自动关闭，出错也不漏。路径用 pathlib 或 os.path 处理，别手拼斜杠。',
        sections: [
          {
            text: 'open 的常用模式（`open(路径, 模式, encoding="utf-8")`，读写文本一律显式写 utf-8）：',
            table: {
              headers: ['模式', '含义', '文件不存在时'],
              rows: [
                ['"r"', '只读文本（默认）', '抛 FileNotFoundError'],
                ['"w"', '只写文本，清空原内容', '新建文件'],
                ['"a"', '追加文本，写到末尾', '新建文件'],
                ['"x"', '独占创建，已存在则报错', '新建文件'],
                ['"rb" / "wb"', '二进制读 / 写（图片、压缩包等）', '同 r / w'],
                ['"r+"', '读写，不清空（谨慎用，写入位置与长度都会影响原文件）', '抛 FileNotFoundError']
              ]
            }
          },
          {
            text: '文件对象的方法：',
            table: {
              headers: ['方法', '说明'],
              rows: [
                ['f.read()', '读入全部内容返回字符串（大文件慎用）'],
                ['f.read(n)', '读入最多 n 个字符'],
                ['f.readline()', '读一行（含换行符），到末尾返回空字符串'],
                ['f.readlines()', '读入所有行，返回列表（每行含换行符）'],
                ['for line in f:', '逐行迭代 —— 处理大文件的标准写法，内存友好'],
                ['f.write(s)', '写入字符串，返回写入的字符数'],
                ['f.writelines(lines)', '把字符串序列依次写入（不自动加换行）'],
                ['f.seek(pos) / f.tell()', '移动读写位置 / 返回当前位置（按字节计）'],
                ['f.flush()', '立刻把缓冲区写入磁盘'],
                ['f.closed / f.name', '是否已关闭 / 文件名']
              ]
            }
          },
          {
            text: 'os.path 常用（返回字符串路径）：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['os.path.join(a, b)', '按当前系统拼接路径，自动处理分隔符'],
                ['os.path.exists(p)', '路径（文件或目录）是否存在'],
                ['os.path.isfile(p) / isdir(p)', '是不是文件 / 是不是目录'],
                ['os.path.basename(p) / dirname(p)', '取文件名 / 取所在目录'],
                ['os.path.splitext(p)', '拆扩展名：("a.py" → ("a", ".py"))'],
                ['os.path.abspath(p)', '转成绝对路径'],
                ['os.path.getsize(p) / getmtime(p)', '文件大小（字节）/ 最后修改时间戳']
              ]
            }
          },
          {
            text: 'pathlib 常用（面向对象的 Path，推荐新代码使用）：',
            table: {
              headers: ['写法', '说明'],
              rows: [
                ['Path("data") / "a.txt"', '用 / 拼路径，跨平台'],
                ['p.exists() / is_file() / is_dir()', '判断存在与类型'],
                ['p.read_text(encoding="utf-8")', '一次读入全文（同理 write_text）'],
                ['p.read_bytes() / write_bytes(b)', '二进制读写'],
                ['p.name / p.stem / p.suffix', '文件名 / 去扩展名 / 扩展名'],
                ['p.parent', '上级目录（Path 对象）'],
                ['p.iterdir()', '遍历目录内容（文件与子目录）'],
                ['p.glob("*.csv")', '按通配符找文件（rglob 递归）'],
                ['p.mkdir(parents=True, exist_ok=True)', '建目录，父目录一并建、已存在不报错'],
                ['p.unlink() / p.rename(new)', '删除文件 / 重命名或移动']
              ]
            }
          }
        ]
      }
    },
    {
      id: 'ref_data_formats',
      title: 'JSON 与日期时间',
      stage: 'Python 参考手册 > 数据格式',
      kind: 'reference',
      summary: 'json 编解码接口与 datetime 常用方法。',
      content: {
        overview: 'json 模块负责在「JSON 文本」和「Python 字典/列表」之间转换；datetime 模块处理日期时间。两个模块都要先 import。',
        sections: [
          {
            text: 'json 模块（json 与 Python 类型对应：对象↔dict、数组↔list、字符串↔str、数字↔int/float、true/false↔True/False、null↔None）：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['json.loads(s)', '把 JSON 字符串解析成 Python 对象'],
                ['json.dumps(obj)', '把 Python 对象序列化成 JSON 字符串'],
                ['json.dumps(obj, ensure_ascii=False)', '保留中文原文（默认会把中文转成 \\uXXXX）'],
                ['json.dumps(obj, indent=2)', '缩进美化，便于阅读与调试'],
                ['json.load(f) / json.dump(obj, f)', '直接读写文件对象（配合 open 使用）'],
                ['json.dumps(obj, sort_keys=True)', '键排序输出，方便对比两次结果']
              ]
            }
          },
          {
            text: 'datetime 常用（`from datetime import datetime, date, timedelta`）：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['datetime.now()', '当前本地日期时间'],
                ['datetime(2026, 10, 8, 9, 30)', '按年月日时分秒构造'],
                ['datetime.strptime(s, fmt)', '按格式解析字符串 → 时间对象'],
                ['dt.strftime("%Y-%m-%d %H:%M")', '时间对象 → 格式化字符串'],
                ['dt.year / month / day / hour / minute / second', '取各字段；dt.weekday() 周几（周一 0）'],
                ['dt.date() / dt.time()', '取出日期部分 / 时间部分'],
                ['timedelta(days=3, hours=2)', '时间差对象；dt ± timedelta 直接算前后时间'],
                ['dt2 - dt1', '两个时间相减得到 timedelta（.days / .total_seconds()）'],
                ['dt.isoformat()', '转成 ISO 8601 字符串（接口常用）'],
                ['date.today()', '只要日期时用 date']
              ]
            }
          },
          {
            text: '常用格式符：%Y 四位年、%m 月、%d 日、%H 时（24 制）、%M 分、%S 秒、%A 星期全名、%j 一年第几天。解析用户输入或接口时间时先 `strptime`，输出给人看再 `strftime`；只要时间的先后比较，直接比较 datetime 对象即可，不要比字符串。'
          }
        ]
      }
    },
    {
      id: 'ref_re_module',
      title: '正则表达式 re',
      stage: 'Python 参考手册 > 正则表达式',
      kind: 'reference',
      summary: 're 的匹配接口与常用元字符速查。',
      content: {
        overview: 're 模块按「模式字符串」在文本里查找、替换。接口分两类：模块级函数（re.match 等，缓存编译结果）与预编译对象（re.compile 后复用，循环里更快）。模式串建议一律写 r"..." 原始字符串，避免反斜杠被转义。',
        sections: [
          {
            text: '匹配接口：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['re.match(p, s)', '只从开头匹配，返回 Match 或 None'],
                ['re.search(p, s)', '扫描全文，返回第一个匹配'],
                ['re.findall(p, s)', '返回所有匹配（无分组时是字符串列表）'],
                ['re.finditer(p, s)', '返回匹配对象的迭代器（要取位置信息时用）'],
                ['re.sub(p, repl, s)', '替换全部匹配；repl 可以是字符串或函数'],
                ['re.split(p, s)', '按模式切分字符串'],
                ['re.compile(p)', '预编译：pat = re.compile(p) 后 pat.search(s) / pat.findall(s)'],
                ['m.group(n) / m.groups()', '取第 n 个分组 / 全部组；m.group(0) 是整个匹配'],
                ['m.start() / m.end() / m.span()', '匹配在原串中的起止下标']
              ]
            }
          },
          {
            text: '常用元字符与语法（模式串里写这些）：',
            table: {
              headers: ['写法', '含义'],
              rows: [
                ['.', '任意字符（默认不含换行）'],
                ['^ / $', '行首 / 行尾（配合 re.M 可匹配每行）'],
                ['* + ?', '前一项 0 次或多次 / 1 次或多次 / 0 或 1 次'],
                ['{n} {n,} {n,m}', '恰好 n 次 / 至少 n 次 / n 到 m 次'],
                ['[]', '字符集合：[abc]、[a-z0-9]、[^0-9]（取反）'],
                ['|', '或：cat|dog'],
                ['()', '分组，也是捕获（?:...) 只分组不捕获'],
                ['\\d \\D', '数字 / 非数字'],
                ['\\w \\W', '字母数字下划线 / 其反集'],
                ['\\s \\S', '空白（空格、制表、换行）/ 非空白'],
                ['\\b', '单词边界（\\bword\\b 精确匹配单词）'],
                ['\\. \\\\', '转义：匹配字面量 . 与 \\']
              ]
            }
          },
          {
            text: '常用修饰符（写成 re.search(p, s, re.I | re.M) 或在模式开头 (?i)(?m)）：re.I 忽略大小写、re.M 多行（^ $ 匹配每行）、re.S 让 . 匹配换行、re.X 允许模式串里写注释。重复使用的模式记得先 re.compile 一次。'
          }
        ]
      }
    },
    {
      id: 'ref_math_random',
      title: '数学、随机与统计',
      stage: 'Python 参考手册 > 数学与统计',
      kind: 'reference',
      summary: 'math 计算、random 随机数与 statistics 统计接口。',
      content: {
        overview: 'math 处理常规数学计算，random 生成随机数与随机选择，statistics 做均值方差这类统计（小数据量够用，大规模统计交给第三方库）。',
        sections: [
          {
            text: 'math 常用（`import math`）：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['math.sqrt(x) / math.pow(x, y)', '开平方 / 乘方（返回浮点）'],
                ['math.ceil(x) / math.floor(x)', '向上取整 / 向下取整（返回整数）'],
                ['math.trunc(x) / round(x, n)', '去掉小数部分 / 四舍五入到 n 位'],
                ['math.fabs(x)', '绝对值（返回浮点；整数用内置 abs）'],
                ['math.factorial(n)', '阶乘'],
                ['math.gcd(a, b) / math.lcm(a, b)', '最大公约数 / 最小公倍数'],
                ['math.pi / math.e', '圆周率 / 自然常数'],
                ['math.sin/cos/tan(弧度)', '三角函数；math.radians(角度) 先转弧度'],
                ['math.log(x, base) / math.log10(x) / math.exp(x)', '对数与指数'],
                ['math.isclose(a, b)', '浮点近似相等（别直接 == 比浮点）']
              ]
            }
          },
          {
            text: 'random 常用（`import random`，涉及安全场景请改用 secrets 模块）：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['random.random()', '0 ≤ x < 1 的随机浮点数'],
                ['random.randint(a, b)', '闭区间 [a, b] 的随机整数'],
                ['random.randrange(a, b, step)', '类似 range 取随机数（含 a 不含 b）'],
                ['random.uniform(a, b)', '区间内的随机浮点数'],
                ['random.choice(seq) / random.choices(seq, k=n)', '随机取一个 / 取 n 个（可重复、可带权重 weights=）'],
                ['random.sample(seq, k)', '不重复地取 k 个（seq 需可迭代）'],
                ['random.shuffle(lst)', '原地打乱列表'],
                ['random.seed(n)', '固定随机种子，让结果可复现（测试用）']
              ]
            }
          },
          {
            text: 'statistics 常用（`import statistics`）：mean 平均值、median 中位数、mode 众数、stdev 样本标准差、pstdev 总体标准差、variance 方差、quantiles 分位数。数据量特别大或需要 DataFrame 运算时用 NumPy / pandas。'
          }
        ]
      }
    },
    {
      id: 'ref_sys_os',
      title: '系统与进程 sys / os',
      stage: 'Python 参考手册 > 系统接口',
      kind: 'reference',
      summary: 'sys 解释器信息与 os 系统交互的常用接口。',
      content: {
        overview: 'sys 提供解释器自身的信息（版本、参数、标准流），os 提供与操作系统打交道的能力（目录、环境变量、命令）。平台相关代码建议加判断（sys.platform）。',
        sections: [
          {
            text: 'sys 常用：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['sys.version', '解释器版本字符串；sys.version_info 可比较（如 >= (3, 11)）'],
                ['sys.executable', '当前解释器的可执行文件路径'],
                ['sys.platform', '"win32" / "darwin" / "linux" 平台判断'],
                ['sys.argv', '命令行参数列表：argv[0] 是脚本名'],
                ['sys.path', '模块搜索路径列表（可临时插入目录）'],
                ['sys.stdout / sys.stderr', '标准输出 / 错误流（可重定向输出）'],
                ['sys.exit(code)', '结束程序，code 为 0 表示成功'],
                ['sys.setrecursionlimit(n)', '调整递归深度上限（默认 1000）']
              ]
            }
          },
          {
            text: 'os 常用：',
            table: {
              headers: ['接口', '说明'],
              rows: [
                ['os.getcwd()', '当前工作目录'],
                ['os.chdir(path)', '切换工作目录'],
                ['os.listdir(path)', '列出目录内容（只返回名字）'],
                ['os.makedirs(path, exist_ok=True)', '递归建目录，已存在不报错'],
                ['os.remove(f) / os.rmdir(d)', '删除文件 / 删除空目录'],
                ['os.rename(a, b) / os.replace(a, b)', '重命名 / 移动（replace 覆盖已存在的目标）'],
                ['os.environ.get("PATH")', '读环境变量（os.environ 是类似字典的映射）'],
                ['os.system(cmd)', '执行系统命令（简单场景；复杂场景用 subprocess）'],
                ['os.cpu_count()', 'CPU 核心数']
              ]
            }
          },
          {
            text: '执行外部命令推荐 `subprocess.run(["git", "status"], capture_output=True, text=True)` —— 列表传参不经过 shell，避免拼接注入；结果取 result.stdout / result.returncode。要按文件通配批量操作时用 `glob.glob("data/*.csv")` 或 pathlib 的 glob。'
          }
        ]
      }
    }
  ]
};
