// automation 系列测验组：追加到 quizData.ts 的 TOPIC_QUIZZES 数组中
import type { TopicQuiz } from '../quizData';

export const automationQuizzes: TopicQuiz[] = [
  {
    topicId: 'auto_what',
    questions: [
      {
        id: 'auto_what_q1',
        type: 'choice',
        question: '下面哪项最适合用自动化脚本完成？',
        options: ['写一篇作文', '给 200 个文件按规则批量改名', '画一幅画', '和朋友聊天'],
        answerIndex: 1,
        explanation: '重复、有规律、数量大的工作最适合自动化。'
      },
      {
        id: 'auto_what_q2',
        type: 'multi',
        question: '自动化常见的应用场景包括？（多选）',
        options: [
          '批量重命名和整理文件',
          '汇总多个 CSV 报表',
          '定时备份文件夹',
          '手动逐字输入文档'
        ],
        answerIndexes: [0, 1, 2],
        explanation: '前三项都是重复规律的任务；手动输入不在其列。'
      },
      {
        id: 'auto_what_q3',
        type: 'code',
        question: '给定文件列表 ["照片.jpg","报告.pdf","笔记.txt"]，用 enumerate 从 1 开始加两位序号，逐行打印。',
        starterCode: '# 任务：输出 01_照片.jpg 这种格式\nfiles = ["照片.jpg", "报告.pdf", "笔记.txt"]',
        expectedOutput: '01_照片.jpg\n02_报告.pdf\n03_笔记.txt'
      }
    ]
  },
  {
    topicId: 'auto_path',
    questions: [
      {
        id: 'auto_path_q1',
        type: 'choice',
        question: '在 pathlib 中，拼接路径用哪个运算符？',
        options: ['+', '/', '\\', '&'],
        answerIndex: 1,
        explanation: 'Path("文件夹") / "文件" 用斜杠运算符，自动适配操作系统。'
      },
      {
        id: 'auto_path_q2',
        type: 'choice',
        question: 'Path("trip.jpg").stem 的值是？',
        options: ['trip.jpg', 'trip', '.jpg', 'jpg'],
        answerIndex: 1,
        explanation: '.stem 是不含扩展名的文件名；.name 是完整名，.suffix 是扩展名。'
      },
      {
        id: 'auto_path_q3',
        type: 'code',
        question: '用 Path 构造 documents/report.txt，打印它的文件名（name）和后缀（suffix）。',
        starterCode: '# 任务：打印 p.name 和 p.suffix\nfrom pathlib import Path',
        expectedOutput: '文件名: report.txt\n后缀: .txt'
      },
      {
        id: 'auto_path_q4',
        type: 'multi',
        question: '关于 pathlib 的 Path，下面哪些说法正确？（多选）',
        options: ['可以用 / 运算符拼接路径', '.stem 是不含扩展名的文件名', '.suffix 是文件扩展名', 'Path 只能在 Windows 上用'],
        answerIndexes: [0, 1, 2],
        explanation: 'Path 用 / 拼路径、stem 取主名、suffix 取后缀；它跨平台，Windows 和 Mac/Linux 都能用。'
      }
    ]
  },
  {
    topicId: 'auto_listdir',
    questions: [
      {
        id: 'auto_listdir_q1',
        type: 'choice',
        question: '判断一个路径是文件还是文件夹用？',
        options: ['is_file() / is_dir()', 'exists()', 'is_path()', 'has_file()'],
        answerIndex: 0,
        explanation: 'iterdir() 遍历时用 is_file()/is_dir() 区分类型。'
      },
      {
        id: 'auto_listdir_q2',
        type: 'choice',
        question: '从 ["note.txt","photo.jpg"] 中筛出 txt 文件，简单写法是？',
        options: ['f.endswith(".txt")', 'f.is_txt()', 'f == "txt"', 'f.has("txt")'],
        answerIndex: 0,
        explanation: '字符串 endswith 是最简单的按后缀筛选方法。'
      },
      {
        id: 'auto_listdir_q3',
        type: 'code',
        question: '给定文件列表 ["报告.pdf","笔记.txt","图片.png","账单.txt"]，逐行打印其中的 .txt 文件。',
        starterCode: '# 任务：筛选并逐行打印 txt 文件\nfiles = ["报告.pdf", "笔记.txt", "图片.png", "账单.txt"]',
        expectedOutput: '笔记.txt\n账单.txt'
      },
      {
        id: 'auto_listdir_q4',
        type: 'blank',
        question: '补全：遍历一个文件夹里的内容用 Path 对象的 ____() 方法；判断某个路径是否真的存在用 ____() 方法。',
        blanks: [['iterdir'], ['exists']],
        explanation: 'iterdir() 列出文件夹里的每一项；exists() 判断路径是否存在。'
      }
    ]
  },
  {
    topicId: 'auto_rename',
    questions: [
      {
        id: 'auto_rename_q1',
        type: 'choice',
        question: '批量重命名前，最重要的安全习惯是？',
        options: ['直接全部 rename', '先在副本上预览新旧文件名再执行', '关掉电脑', '一次只改一个'],
        answerIndex: 1,
        explanation: '先 print 预览 old → new，确认无误再 rename，避免改错真实文件。'
      },
      {
        id: 'auto_rename_q2',
        type: 'order',
        question: '批量改名的正确步骤排序：生成新文件名、执行 rename、遍历每个文件、先预览对比。',
        items: ['遍历每个文件', '按规则生成新名', '先预览对比新旧名', '执行 rename 改名'],
        correctOrder: [0, 1, 2, 3],
        explanation: '遍历 → 生成新名 → 预览确认 → 执行改名。'
      },
      {
        id: 'auto_rename_q3',
        type: 'code',
        question: '给 ["草稿.txt","终稿.txt","备份.txt"] 加前缀，输出「第1版_草稿.txt」这种格式，每行一个。',
        starterCode: '# 任务：enumerate 从 1 开始拼前缀\nfiles = ["草稿.txt", "终稿.txt", "备份.txt"]',
        expectedOutput: '第1版_草稿.txt\n第2版_终稿.txt\n第3版_备份.txt'
      }
    ]
  },
  {
    topicId: 'auto_readwrite',
    questions: [
      {
        id: 'auto_readwrite_q1',
        type: 'choice',
        question: '打开文件读写中文时，应指定的编码是？',
        options: ['encoding="utf-8"', 'charset="gbk"', 'encode="ascii"', '不用指定'],
        answerIndex: 0,
        explanation: '显式指定 encoding="utf-8" 避免 Windows 下中文乱码。'
      },
      {
        id: 'auto_readwrite_q2',
        type: 'choice',
        question: 'with open(...) 语句的好处是？',
        options: ['文件自动关闭', '自动加密', '自动备份', '自动压缩'],
        answerIndex: 0,
        explanation: 'with 块结束后文件自动关闭，不会遗忘。'
      },
      {
        id: 'auto_readwrite_q3',
        type: 'blank',
        question: '以写入模式打开文件用 open("a.txt", ____, encoding="utf-8")；在末尾追加内容用模式 ____。',
        blanks: [['"w"', "'w'", 'w'], ['"a"', "'a'", 'a']],
        explanation: 'w 覆盖写入，a 在末尾追加，r 读取。'
      },
      {
        id: 'auto_readwrite_q4',
        type: 'multi',
        question: '关于用 Python 读写文件，下面哪些说法正确？（多选）',
        options: ['推荐用 with open(...)，结束后自动关闭文件', '读写中文时显式写 encoding="utf-8"', '"w" 写入模式会覆盖文件原有内容', '"r" 模式是用来往文件里写内容的'],
        answerIndexes: [0, 1, 2],
        explanation: 'with 自动关文件、utf-8 防乱码、w 覆盖写；r 是读取模式，不是写入。'
      },
      {
        id: 'auto_readwrite_q5',
        type: 'order',
        question: '把下面「读取并处理一个文本文件」的步骤排正确。',
        items: ['用 with open(...) 打开文件', '调用 read() 把内容读进字符串', '在内存里处理这段文字', 'with 块结束，文件自动关闭'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先打开，再读内容，处理完后 with 块结束自动关闭文件。'
      }
    ]
  },
  {
    topicId: 'auto_csv',
    questions: [
      {
        id: 'auto_csv_q1',
        type: 'choice',
        question: '把多个 DataFrame 合并成一张用？',
        options: ['pd.merge()', 'pd.concat()', 'pd.join()', 'pd.combine()'],
        answerIndex: 1,
        explanation: 'pd.concat([df1, df2]) 纵向合并多张表。'
      },
      {
        id: 'auto_csv_q2',
        type: 'choice',
        question: '离线演示里模拟一个 CSV 文件字符串用的是？',
        options: ['open()', 'io.StringIO', 'pd.File()', 'csv.mock()'],
        answerIndex: 1,
        explanation: 'StringIO 把字符串伪装成内存文件，真实项目换成文件路径。'
      },
      {
        id: 'auto_csv_q3',
        type: 'code',
        question: '合并两份商品数据（笔 10、本 5 与 笔 7、本 9），打印总销量。',
        starterCode: '# 任务：concat 后打印 数量 列的总和\nimport pandas as pd\nfrom io import StringIO',
        expectedOutput: '总销量: 31'
      },
      {
        id: 'auto_csv_q4',
        type: 'order',
        question: '把下面「汇总多个 CSV 报表」的步骤排正确。',
        items: ['用 pd.read_csv 逐个读入每个 CSV 文件', '用 pd.concat 把它们合并成一张表', '用 groupby 做汇总统计', '用 to_csv 把结果保存成新文件'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先读入每个文件，再合并成一张表，接着分组统计，最后保存结果。'
      }
    ]
  },
  {
    topicId: 'auto_datetime',
    questions: [
      {
        id: 'auto_datetime_q1',
        type: 'choice',
        question: '表示「7 天后」用哪个？',
        options: ['timedelta(days=7)', 'date(7)', 'days(7)', 'after(7)'],
        answerIndex: 0,
        explanation: 'timedelta(days=n) 表示时间差，与日期相加减即可推算。'
      },
      {
        id: 'auto_datetime_q2',
        type: 'choice',
        question: '把日期格式化成 2026-09-26 这种字符串用？',
        options: ['d.format()', 'd.strftime("%Y-%m-%d")', 'd.text()', 'd.str("%Y-%m-%d")'],
        answerIndex: 1,
        explanation: 'strftime 按格式把日期转成字符串。'
      },
      {
        id: 'auto_datetime_q3',
        type: 'code',
        question: '给定 2026-01-01，打印 30 天后的日期（用 YYYY-MM-DD 格式）。',
        starterCode: '# 任务：date(2026,1,1) 加 timedelta(days=30) 后打印\nfrom datetime import date, timedelta',
        expectedOutput: '2026-01-31'
      },
      {
        id: 'auto_datetime_q4',
        type: 'blank',
        question: '补全：表示「7 天之后」用 timedelta(days=____)；把日期对象格式化成字符串用 ____() 方法。',
        blanks: [['7'], ['strftime']],
        explanation: 'timedelta(days=n) 表示时间差；strftime 按格式把日期转成字符串。'
      }
    ]
  },
  {
    topicId: 'auto_shutil',
    questions: [
      {
        id: 'auto_shutil_q1',
        type: 'choice',
        question: '复制单个文件用哪个函数？',
        options: ['shutil.copy()', 'shutil.move()', 'shutil.cp()', 'shutil.copyfile_only()'],
        answerIndex: 0,
        explanation: 'shutil.copy 复制文件，move 移动，make_archive 打包。'
      },
      {
        id: 'auto_shutil_q2',
        type: 'choice',
        question: '把整个文件夹打包成 zip 用？',
        options: ['shutil.zip()', 'shutil.make_archive(名, "zip", 目录)', 'shutil.pack()', 'zip.folder()'],
        answerIndex: 1,
        explanation: 'make_archive 指定压缩格式和要打包的目录。'
      },
      {
        id: 'auto_shutil_q3',
        type: 'code',
        question: '模拟备份流程，逐行打印三步：复制源文件、打包成 zip、完成。',
        starterCode: '# 任务：按顺序打印备份三步动作',
        expectedOutput: '1. 复制源文件到备份目录\n2. 把目录打包成带日期的 zip'
      },
      {
        id: 'auto_shutil_q4',
        type: 'blank',
        question: '补全：复制一个文件用 shutil.____()；把一个文件搬到别处用 shutil.____()。',
        blanks: [['copy'], ['move']],
        explanation: 'shutil.copy 复制文件，shutil.move 移动（或重命名）文件。'
      }
    ]
  },
  {
    topicId: 'auto_logging',
    questions: [
      {
        id: 'auto_logging_q1',
        type: 'choice',
        question: '日志级别从低到高，排在最前面的是？',
        options: ['ERROR', 'DEBUG', 'WARNING', 'CRITICAL'],
        answerIndex: 1,
        explanation: 'DEBUG < INFO < WARNING < ERROR < CRITICAL。'
      },
      {
        id: 'auto_logging_q2',
        type: 'choice',
        question: '把日志级别设为 WARNING 后，下面哪条不会显示？',
        options: ['logging.warning("磁盘满")', 'logging.error("失败")', 'logging.info("开始")', '以上都会显示'],
        answerIndex: 2,
        explanation: 'INFO 低于 WARNING，不显示；WARNING/ERROR 显示。'
      },
      {
        id: 'auto_logging_q3',
        type: 'code',
        question: '配置 INFO 级别后，用 logging.info 打印两行：开始汇总报表、汇总完成共 12 行数据。',
        starterCode: '# 任务：basicConfig 后输出两条 info 日志\nimport logging',
        expectedOutput: '开始汇总报表\n汇总完成，共 12 行数据'
      },
      {
        id: 'auto_logging_q4',
        type: 'multi',
        question: '关于 Python 日志级别，下面哪些说法正确？（多选）',
        options: ['DEBUG 是最详细的级别', 'CRITICAL 是最严重的级别', 'INFO 用来记录一般的运行流程', 'WARNING 比 ERROR 更严重'],
        answerIndexes: [0, 1, 2],
        explanation: '级别从低到高：DEBUG < INFO < WARNING < ERROR < CRITICAL；ERROR 比 WARNING 更严重。'
      },
      {
        id: 'auto_logging_q5',
        type: 'order',
        question: '把下面「配置并使用日志」的步骤排正确。',
        items: ['import logging 导入模块', '用 basicConfig 配置日志级别', '在代码里写 logging.info 记录进度', '运行程序查看日志输出'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先导入模块，再配置级别，然后在代码里打日志，最后运行查看。'
      }
    ]
  },
  {
    topicId: 'auto_summary',
    questions: [
      {
        id: 'auto_summary_q1',
        type: 'choice',
        question: '一个实用自动化脚本的典型流程是？',
        options: ['写界面 → 美化 → 发布', '读取数据 → 统计处理 → 输出结果', '连接网络 → 下载 → 关闭', '新建文件 → 删除 → 备份'],
        answerIndex: 1,
        explanation: '读取 → 处理 → 输出是数据自动化脚本的主线。'
      },
      {
        id: 'auto_summary_q2',
        type: 'multi',
        question: '把示例脚本改成自己的报表工具，可以做哪些改动？（多选）',
        options: [
          '把 StringIO 换成自己的 CSV 文件路径',
          '把 groupby 的列换成自己要统计的维度',
          '把结果用 to_csv 保存',
          '删除所有数据直接运行'
        ],
        answerIndexes: [0, 1, 2],
        explanation: '前三项都是合理改造；空数据无法统计。'
      },
      {
        id: 'auto_summary_q3',
        type: 'code',
        question: '用 StringIO 读入商品数据（笔 10、笔 7、本 5、本 9），按商品分组打印总销量。',
        starterCode: '# 任务：groupby 商品 求数量和，逐行打印 商品: 数值\nimport pandas as pd\nfrom io import StringIO',
        expectedOutput: { mode: 'regex', pattern: '本\\s+14\\s*笔\\s+17', flags: 's' }
      }
    ]
  }
];
