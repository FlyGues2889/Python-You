import { TutorialStage } from '../../tutorialData';

// 自动化系列 · 阶段二：定时与任务自动化
export const autoStage2: TutorialStage = {
  id: 'auto_stage2',
  title: '定时与任务自动化',
  icon: 'schedule',
  topics: [
    {
      id: 'auto_datetime',
      title: '时间与计时',
      stage: '自动化 > 定时任务',
      summary: 'datetime 获取当前时间，timedelta 做时间推算，是定时脚本的基础。',
      content: {
        overview: '自动化脚本经常要和时间打交道：今天日期是多少、七天后是几号、程序运行了多久。标准库 datetime 提供日期时间的表示和计算，是定时任务的基础。',
        sections: [
          { heading: '获取当前日期', text: 'datetime 像一个日历计算器：它能告诉你今天几号，也能算出「从今天起 30 天后」是哪一天，不用自己数日子。\n\ndatetime.date.today() 拿到今天的日期；datetime.datetime.now() 拿到日期加时间。注意：真实运行时的当前时间取决于系统，示例里为了输出确定，直接用固定日期演示。',
            code: `from datetime import date, timedelta\n\ntoday = date(2026, 9, 26)\nprint("今天:", today)\nprint("7 天后:", today + timedelta(days=7))\nprint("3 天前:", today - timedelta(days=3))`
          },
          {
            heading: 'timedelta 时间推算',
            text: 'timedelta(days=n) 表示一段时间，和日期相加减就能推算未来或过去的日期。',
            code: `from datetime import date, timedelta\n\ntoday = date(2026, 9, 26)\nfor i in range(5):\n    day = today + timedelta(days=i)\n    print(f"第{i+1}天: {day.strftime('%Y-%m-%d')}")`
          },
        ],
        codeExample: `from datetime import date, timedelta\n\nd = date(2026, 1, 1)\nprint("一个月后约:", d + timedelta(days=30))\nprint("格式化:", d.strftime("%Y 年 %m 月 %d 日"))`,
        takeaways: [
          'datetime.date.today() 获取当前日期',
          'timedelta(days=n) 表示时间差，可与日期加减',
          'strftime("%Y-%m-%d") 把日期格式化为字符串',
          '定时脚本常用它生成带日期的文件名'
        ],
        tips: [
          '示例为输出确定用了固定日期；真实脚本用 date.today()。',
          '定时备份可把日期拼进文件名，如 backup_2026-09-26.zip。'
        ]
      }
    },
    {
      id: 'auto_shutil',
      title: '文件复制与移动',
      stage: '自动化 > 定时任务',
      summary: 'shutil 模块提供复制、移动、打包文件的高级操作，备份脚本常用。',
      content: {
        overview: 'os 负责路径，而真正「复制文件、移动文件夹、打包压缩」要靠 shutil（shell 工具）。它是写备份脚本的核心模块：一行代码就能复制或打包整个目录。',
        sections: [
          { heading: '常用操作', text: 'shutil 像文件的搬运车：copy 是复印一份、move 是搬到别处、make_archive 是把整个文件夹打成一个包裹。\n\n• shutil.copy(源, 目标)：复制单个文件。\n• shutil.move(源, 目标)：移动或重命名。\n• shutil.make_archive(名字, "zip", 目录)：把目录打包成 zip。\n下面用字符串演示备份逻辑，真实操作需在本机指定真实路径。',
            code: `import shutil\n\n# 演示备份思路：把源目录打包成 zip\n# shutil.make_archive("backup_2026", "zip", root_dir="documents")\nprint("备份动作：把 documents 目录打包成 backup_2026.zip")\nprint("源: documents/  →  产物: backup_2026.zip")`,
            notes: '真实的复制、打包会操作硬盘文件，需在本机 Python 环境指定真实路径运行，本应用内仅演示写法。'
          },
        ],
        codeExample: `import shutil\n\nprint("备份流程:")\nprint("1. 复制源文件到备份目录")\nprint("2. 把目录打包成带日期的 zip")`,
        takeaways: [
          'shutil.copy 复制单个文件',
          'shutil.move 移动或重命名',
          'shutil.make_archive 把目录打包成 zip',
          '备份脚本常用它完成复制与打包'
        ],
        tips: [
          '打包压缩是定时备份的常见产物。',
          '真实文件操作在本机环境运行，指定真实路径。'
        ]
      }
    },
    {
      id: 'auto_logging',
      title: '记录日志',
      stage: '自动化 > 定时任务',
      summary: '脚本跑完后要留下记录，logging 模块能把运行时间和信息写进日志文件。',
      content: {
        overview: '自动化脚本常在后台无人值守地跑，出问题时怎么知道发生了什么？答案是日志：程序运行时把关键信息记下来。标准库 logging 能自动加上时间戳写进文件。',
        sections: [
          { heading: '用 print 还是 logging', text: '日志像飞机的黑匣子：哪怕程序跑完没人看，事后也能从日志还原「几点几分做了什么、哪里报错」。\n\n简单脚本用 print 就够；需要长期后台运行时用 logging，它自动带时间、能分级、能写文件。下面演示基本写法。',
            code: `import logging\n\nlogging.basicConfig(level=logging.INFO, format="%(message)s")\n\nlogging.info("脚本开始运行")\nlogging.info("处理了 3 个文件")\nlogging.info("脚本结束")`
          },
          {
            heading: '日志级别',
            text: '常见级别从低到高：DEBUG（调试）、INFO（普通信息）、WARNING（警告）、ERROR（错误）。设为 INFO 后，DEBUG 就不显示。',
            code: `import logging\n\nlogging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")\nlogging.debug("这条不显示")\nlogging.info("这条也不显示")\nlogging.warning("磁盘空间快满了")\nlogging.error("备份失败")`
          },
        ],
        codeExample: `import logging\n\nlogging.basicConfig(level=logging.INFO, format="%(message)s")\nlogging.info("开始汇总报表")\nlogging.info("汇总完成，共 12 行数据")`,
        takeaways: [
          'logging 把运行信息带时间写下来，便于事后排查',
          '级别：DEBUG < INFO < WARNING < ERROR',
          'basicConfig 设置级别和格式',
          '后台无人值守脚本应写日志'
        ],
        tips: [
          '简单临时脚本用 print 即可，不必强行上 logging。',
          '真实项目里用 FileHandler 把日志同时写进文件。'
        ]
      }
    },
    {
      id: 'auto_summary',
      title: '一个自动汇总脚本',
      stage: '自动化 > 定时任务',
      summary: '把前面学的组合起来：读数据、统计、打印结果，就是一个实用的自动化脚本。',
      content: {
        overview: '这一课把文件操作、pandas 统计、日志串成一个完整的小脚本：自动汇总一组销售数据并打印结果。看懂它，你就能改造成自己的自动化工具。',
        sections: [
          { heading: '完整脚本示例', text: '就像一个自动柜员机：放进去一堆数据（输入），它自动清点统计（处理），吐出一张汇总单（输出）。\n\n下面脚本做三件事：构造数据、按城市分组汇总、打印结果和日志。它不依赖外部文件，离线可跑。',
            code: `import logging\nimport pandas as pd\nfrom io import StringIO\n\nlogging.basicConfig(level=logging.INFO, format="%(message)s")\n\ncsv_text = "城市,销售额\\n上海,300\\n上海,500\\n北京,200\\n北京,400"\ndf = pd.read_csv(StringIO(csv_text))\n\nlogging.info("开始汇总，共 %d 条记录", len(df))\nsummary = df.groupby("城市")["销售额"].sum()\nfor city, amount in summary.items():\n    print(f"{city}: {amount}")\nlogging.info("汇总完成")`
          },
          {
            heading: '怎么改成自己的脚本',
            text: '改造思路：\n1. 把 csv_text 换成你自己的数据文件（pd.read_csv("你的文件.csv")）。\n2. 把 groupby 的列换成你要统计的维度。\n3. 把结果用 to_csv 保存，或用 logging 记录。\n这就是一个真实可用的自动化报表脚本。',
            notes: '真实脚本里数据来自文件，这里用 StringIO 模拟，方便离线演示完整流程。'
          },
        ],
        codeExample: `import pandas as pd\nfrom io import StringIO\n\ncsv_text = "商品,数量\\n笔,10\\n笔,7\\n本,5\\n本,9"\ndf = pd.read_csv(StringIO(csv_text))\nprint("各商品总销量:")\nprint(df.groupby("商品")["数量"].sum())`,
        takeaways: [
          '完整自动化脚本：读取 → 统计 → 输出',
          '可把示例改成读取自己的 CSV 文件',
          'groupby 按维度汇总，再打印或保存',
          '配 logging 记录运行过程，便于排查'
        ],
        tips: [
          '从这个示例出发，替换数据源和统计维度，就是你的第一个实用脚本。',
          '先在小数据上跑通，再接到真实文件上。'
        ]
      }
    },
    {
      id: 'auto_reference',
      title: '自动化常用操作速查',
      stage: '自动化 > 定时任务 > 速查',
      kind: 'reference',
      summary: '把 pathlib、文件读写、shutil、datetime、logging 的常用操作列成表备查。',
      content: {
        overview: '这一页是查阅手册，把自动化系列用到的模块和常用操作整理成表，写脚本时忘了语法直接来查。'
        ,
        sections: [
          {
            text: '路径与文件遍历：',
            table: {
              headers: ['操作', '写法', '作用'],
              rows: [
                ['拼接路径', 'Path("a") / "b.txt"', '用 / 拼接路径，自动适配系统'],
                ['文件名', 'p.name / p.stem / p.suffix', '完整名 / 不含后缀 / 扩展名'],
                ['父目录', 'p.parent', '所在文件夹'],
                ['遍历目录', 'Path("dir").iterdir()', '列出文件夹下每一项'],
                ['按后缀筛选', 'p.glob("*.txt")', '找出所有 txt 文件']
              ]
            }
          },
          {
            text: '文件读写与系统操作：',
            table: {
              headers: ['操作', '写法', '作用'],
              rows: [
                ['写文件', 'open(f, "w", encoding="utf-8")', '覆盖写入文本'],
                ['读文件', 'open(f, "r", encoding="utf-8")', '读取文本'],
                ['追加', 'open(f, "a", encoding="utf-8")', '在末尾追加'],
                ['复制文件', 'shutil.copy(源, 目标)', '复制单个文件'],
                ['移动文件', 'shutil.move(源, 目标)', '移动或重命名'],
                ['打包', 'shutil.make_archive(名, "zip", 目录)', '目录打成 zip']
              ]
            }
          },
          {
            text: '时间与日志：',
            table: {
              headers: ['操作', '写法', '作用'],
              rows: [
                ['今天日期', 'date.today()', '获取当前日期'],
                ['时间差', 'timedelta(days=7)', '表示 7 天，可加减'],
                ['格式化', 'd.strftime("%Y-%m-%d")', '日期转字符串'],
                ['记日志', 'logging.info("...")', '记录普通信息'],
                ['日志配置', 'logging.basicConfig(level=...)', '设置输出级别与格式']
              ]
            }
          }
        ]
      }
    }
  ]
};
