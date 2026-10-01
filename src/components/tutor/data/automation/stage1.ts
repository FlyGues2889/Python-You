import { TutorialStage } from '../../tutorialData';

// 自动化系列 · 阶段一：文件与文件夹
export const autoStage1: TutorialStage = {
  id: 'auto_stage1',
  title: '文件与文件夹',
  icon: 'folder',
  topics: [
    {
      id: 'auto_what',
      title: '什么是自动化',
      stage: '自动化 > 文件与文件夹',
      summary: '自动化就是让程序替你重复做枯燥的事：批量改名、整理文件、定时汇总。',
      content: {
        overview: '下载文件夹里堆了几百张图，手动一张张改名要半天；每天下班前要手动把日报汇总成一个表。这类重复、有规律的工作，正是自动化要解决的——写一次脚本，让电脑替你做。',
        sections: [
          { heading: '自动化适合做什么', text: '就像洗衣机代替手洗衣服：你只需放进去、按个钮，剩下的重复劳动机器完成。Python 脚本就是你的洗衣机，负责批量处理文件和数据。\n\n凡是「重复做、规则明确、数量多」的事都适合自动化：\n• 批量重命名文件、整理到不同文件夹。\n• 批量读取几十个 Excel/CSV 并汇总。\n• 定时备份、定时生成报表。\n• 把重复的键盘鼠标操作写成脚本。',
            table: {
              headers: ['任务', '手工耗时', '脚本一次写好后'],
              rows: [
                ['给 200 张照片按日期改名', '约 1 小时', '几秒'],
                ['汇总 30 个日报为一个表', '约 40 分钟', '几秒'],
                ['每天备份指定文件夹', '每天手动复制', '定时自动完成']
              ]
            }
          },
        ],
        codeExample: `# 演示自动化思路：批量给一组文件名加序号\nfiles = ["照片.jpg", "报告.pdf", "笔记.txt"]\nfor i, name in enumerate(files, start=1):\n    print(f"{i:02d}_{name}")`,
        takeaways: [
          '自动化解决重复、有规律、数量大的工作',
          '典型场景：批量改名、整理文件、汇总数据、定时任务',
          'Python 标准库 os/pathlib/shutil 已足够',
          '写一次脚本，以后重复运行即可'
        ],
        tips: [
          '先从一个真实的小需求开始，比如整理下载文件夹。',
          '自动化脚本第一次先在副本上试运行，确认无误再动真实文件。'
        ]
      }
    },
    {
      id: 'auto_path',
      title: '用 pathlib 处理路径',
      stage: '自动化 > 文件与文件夹',
      summary: 'pathlib 用面向对象的方式拼接和处理文件路径，比手写斜杠更可靠。',
      content: {
        overview: '任何文件操作第一步都是定位文件路径。手写 "folder/sub/file.txt" 容易在 Windows 和 Mac 之间出错。Python 3.4+ 内置的 pathlib 用面向对象方式处理路径，自动适配不同系统。',
        sections: [
          { heading: 'Path 对象的基本用法', text: '路径拼接像拼积木：pathlib 知道 Windows 用反斜杠、Mac 用正斜杠，你只要说「在 documents 文件夹里找 report.txt」，它自动拼对。\n\nfrom pathlib import Path 创建路径对象，用 / 运算符拼接路径：',
            code: `from pathlib import Path\n\np = Path("documents") / "report.txt"\nprint("完整路径:", p)\nprint("文件名:", p.name)\nprint("后缀:", p.suffix)`
          },
          {
            heading: '常用路径属性',
            text: 'Path 对象自带很多方便的属性：\n• .name：完整文件名\n• .stem：不带后缀的文件名\n• .suffix：扩展名\n• .parent：所在文件夹',
            code: `from pathlib import Path\n\np = Path("photos/2026/trip.jpg")\nprint("文件名:", p.name)\nprint("不含后缀:", p.stem)\nprint("扩展名:", p.suffix)\nprint("上级目录:", p.parent)`
          },
        ],
        codeExample: `from pathlib import Path\n\np = Path("downloads") / "music" / "song.mp3"\nprint("路径:", p)\nprint("文件名:", p.name)\nprint("类型:", p.suffix)`,
        takeaways: [
          'pathlib.Path 是处理文件路径的现代方式',
          '用 / 运算符拼接路径，自动适配操作系统',
          '.name 文件名、.stem 不含后缀名、.suffix 扩展名、.parent 父目录',
          '比手写字符串拼接更可靠'
        ],
        tips: [
          '新项目优先用 pathlib 而不是 os.path。',
          '路径里不要手写硬编码的斜杠，交给 / 运算符。'
        ]
      }
    },
    {
      id: 'auto_listdir',
      title: '列出文件夹内容',
      stage: '自动化 > 文件与文件夹',
      summary: '用 iterdir 遍历文件夹，区分文件和子文件夹，是批量处理的第一步。',
      content: {
        overview: '要批量处理文件，先得能列出文件夹里有什么。pathlib 的 iterdir() 能遍历文件夹下的每一项，并用 is_file()/is_dir() 判断它是文件还是文件夹。',
        sections: [
          { heading: '遍历一个文件夹', text: '就像打开一个抽屉，把里面每样东西拿出来看一眼：这是文件还是文件夹？再决定怎么处理。\n\n下面用一个模拟的文件名列表演示「遍历 + 判断」的思路，真实项目里换成 Path("某目录").iterdir() 即可。',
            code: `from pathlib import Path\n\n# 用一个目录名构造路径（演示用，不要求真实存在）\nfolder = Path("documents")\nprint("要查看的文件夹:", folder)\nprint("文件夹名:", folder.name)`
          },
          {
            heading: '筛选特定类型文件',
            text: 'Path.glob("*.后缀") 能按扩展名筛选文件，比如只找 .txt 文件。下面用列表模拟筛选结果。',
            code: `files = ["note.txt", "photo.jpg", "data.txt", "song.mp3"]\ntext_files = [f for f in files if f.endswith(".txt")]\nprint("文本文件:")\nfor f in text_files:\n    print(" ", f)`
          },
        ],
        codeExample: `files = ["报告.pdf", "笔记.txt", "图片.png", "账单.txt"]\nprint("TXT 文件:")\nfor f in files:\n    if f.endswith(".txt"):\n        print(" ", f)`,
        takeaways: [
          'Path.iterdir() 遍历文件夹下每一项',
          'is_file() 和 is_dir() 区分文件与文件夹',
          'glob("*.后缀") 按扩展名批量筛选',
          '这是批量整理文件的第一步'
        ],
        tips: [
          '真实目录遍历时先 print 一遍确认内容，再写处理逻辑。',
          'endswith(".txt") 是最简单的按后缀筛选方法。'
        ]
      }
    },
    {
      id: 'auto_rename',
      title: '批量重命名',
      stage: '自动化 > 文件与文件夹',
      summary: '遍历文件后按规则改名，是自动化最经典的用途。先在副本上试。',
      content: {
        overview: '「把这 200 张照片按日期改名」是自动化最常见的需求。思路是：遍历每个文件、按规则生成新名字、用 rename 改名。这一课用模拟列表演示改名规则。',
        sections: [
          { heading: '生成新文件名', text: '就像给一排书贴新标签：取出旧标签（文件名），按规则写新标签（加序号、改前缀），贴回去（rename）。\n\n常见规则：加序号、统一前缀、改后缀。下面用 enumerate 给文件加两位序号。',
            code: `files = ["首页.jpg", "详情.jpg", "支付.jpg"]\nrenamed = []\nfor i, name in enumerate(files, start=1):\n    stem = name.split(".")[0]   # 去掉后缀\n    renamed.append(f"page_{i:02d}_{stem}.jpg")\n\nfor old, new in zip(files, renamed):\n    print(f"{old}  →  {new}")`
          },
          {
            heading: '真实重命名',
            text: '真实项目里用 Path.rename()：\np = Path("旧名.txt")\np.rename("新名.txt")\n注意：第一次务必在文件副本上试运行，确认新名字正确再批量执行，避免改错。',
            notes: 'rename 会真的改动硬盘上的文件名，不可逆。先 print 对比新旧名字，确认无误再执行。'
          },
        ],
        codeExample: `files = ["草稿.txt", "终稿.txt", "备份.txt"]\nfor i, name in enumerate(files, start=1):\n    print(f"第{i}版_{name}")`,
        takeaways: [
          '批量改名三步：遍历、生成新名、rename',
          'enumerate(files, start=1) 适合加序号',
          'Path.rename(新名) 执行真实改名',
          '第一次一定在副本上试，避免改错真实文件'
        ],
        tips: [
          '先 print(old → new) 预览，不要直接 rename。',
          '改名前可先复制一份目录做试验田。'
        ]
      }
    },
    {
      id: 'auto_readwrite',
      title: '读写文本文件',
      stage: '自动化 > 文件与文件夹',
      summary: 'open 函数打开文件，read 读取、write 写入，with 语句自动关闭文件。',
      content: {
        overview: '自动化经常要读写文本：把数据存成 .txt、把日志写进文件。Python 用 open() 打开文件，配合 with 语句用完自动关闭，是最基础的文件操作。',
        sections: [
          { heading: '写入文件', text: 'open 像打开一个笔记本：with 语句保证你读完写完一定合上它，不会遗忘。读用 read()，写用 write()。\n\nopen("文件名", "w", encoding="utf-8") 以写入模式打开，write() 写入内容。\n务必指定 encoding="utf-8"，避免中文乱码。',
            code: `content = "第一行笔记\\n第二行笔记"\n\n# with 块结束后文件自动关闭\nwith open("note.txt", "w", encoding="utf-8") as f:\n    f.write(content)\n\nprint("已写入", len(content), "个字符")`
          },
          {
            heading: '读取文件',
            text: 'open("文件名", "r", encoding="utf-8") 读取：read() 读全部，readlines() 按行读成列表。',
            code: `lines = ["苹果", "香蕉", "橙子"]\n\nwith open("fruits.txt", "w", encoding="utf-8") as f:\n    for fruit in lines:\n        f.write(fruit + "\\n")\n\n# 再读回来\nwith open("fruits.txt", "r", encoding="utf-8") as f:\n    print(f.read())`
          },
        ],
        codeExample: `with open("todo.txt", "w", encoding="utf-8") as f:\n    f.write("买牛奶\\n")\n    f.write("取快递\\n")\n\nwith open("todo.txt", "r", encoding="utf-8") as f:\n    print("待办清单:")\n    print(f.read())`,
        takeaways: [
          'open() 打开文件，with 语句用完自动关闭',
          '"w" 写入（覆盖）、"r" 读取、"a" 追加',
          '读写中文文件必须指定 encoding="utf-8"',
          'write() 写入字符串，read() 读取全部内容'
        ],
        tips: [
          '永远显式写 encoding="utf-8"，否则 Windows 默认编码可能乱码。',
          '"w" 模式会覆盖原文件，追加内容用 "a"。'
        ]
      }
    },
    {
      id: 'auto_csv',
      title: '批量处理 CSV',
      stage: '自动化 > 文件与文件夹',
      summary: '多个 CSV 报表可以用 pandas 批量读取、合并、汇总，是自动化数据分析的常见动作。',
      content: {
        overview: '公司里每周都会导出一堆 CSV 报表，手动复制粘贴汇总很痛苦。pandas 能批量读取多个 CSV、合并成一张大表、再做统计。这一课练习这个典型流程。',
        sections: [
          { heading: '读取并合并多个 CSV', text: '就像把一叠周报摞在一起，算出本月总数。pandas 帮你自动把每叠表读进来、拼好、算完。\n\n在离线演示里，我们用 StringIO 模拟两个 CSV 文本，分别读成 DataFrame 后用 pd.concat 合并。真实项目里换成 pd.read_csv("文件路径")。',
            code: `import pandas as pd\nfrom io import StringIO\n\nweek1 = "城市,销售额\\n上海,300\\n北京,200"\nweek2 = "城市,销售额\\n上海,500\\n北京,400"\n\ndf1 = pd.read_csv(StringIO(week1))\ndf2 = pd.read_csv(StringIO(week2))\nall_data = pd.concat([df1, df2], ignore_index=True)\n\nprint("合并后总行数:", len(all_data))\nprint("总销售额:", all_data["销售额"].sum())`
          },
          {
            heading: '按城市汇总',
            text: '合并后用 groupby 按城市汇总，就得到每个城市两周的总业绩。',
            code: `import pandas as pd\nfrom io import StringIO\n\nweek1 = "城市,销售额\\n上海,300\\n北京,200"\nweek2 = "城市,销售额\\n上海,500\\n北京,400"\ndf = pd.concat([pd.read_csv(StringIO(week1)), pd.read_csv(StringIO(week2))])\n\nprint("各城市总销售额:")\nprint(df.groupby("城市")["销售额"].sum())`
          },
        ],
        codeExample: `import pandas as pd\nfrom io import StringIO\n\na = "商品,数量\\n笔,10\\n本,5"\nb = "商品,数量\\n笔,7\\n本,9"\ndf = pd.concat([pd.read_csv(StringIO(a)), pd.read_csv(StringIO(b))])\nprint("总销量:", df["数量"].sum())`,
        takeaways: [
          'pd.concat([df1, df2]) 合并多张表',
          '批量报表读取后先合并再 groupby 汇总',
          '离线演示用 StringIO 模拟文件',
          '真实项目换成 pd.read_csv("文件路径")'
        ],
        tips: [
          '合并时 ignore_index=True 让行号重新连续。',
          '文件很多时用 glob 找出所有 CSV 路径再循环读取。'
        ]
      }
    }
  ]
};
