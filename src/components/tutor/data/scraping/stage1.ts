import { TutorialStage } from '../../tutorialData';

// 爬虫和数据分析系列 · 阶段一：用 pandas 处理数据
export const spStage1: TutorialStage = {
  id: 'sp_stage1',
  title: '用 pandas 处理数据',
  icon: 'table_chart',
  topics: [
    {
      id: 'sp_what',
      title: '什么是爬虫和数据分析',
      stage: '爬虫和数据分析 > pandas 入门',
      summary: '爬虫负责从网上收集数据，数据分析负责把一堆数字变成结论。先看全貌再动手。',
      content: {
        overview: '「爬虫和数据分析」其实是两件事：爬虫（Web Spider）自动从网页上收集数据，数据分析（Data Analysis）把收集来的杂乱数据清洗、统计，最后变成能看懂的图表和结论。这一课先建立整体认识，知道数据是怎么从网页变成结论的。',
        sections: [
          { heading: '数据分析的完整流程', text: '想知道全市 20 家奶茶店的价格排名：手动一家家打开网页抄下来又慢又累，爬虫就是代替你自动打开网页、把价格表格抄下来的小程序；数据分析则把抄来的杂乱价格排序、算平均、画成柱状图，让你一眼看出哪家最贵。\n\n一条典型的数据分析链路是：\n1. 获取数据：从网页抓取、从 CSV 文件读取，或直接录入。\n2. 清洗数据：去掉缺失值、统一格式、修正错误。\n3. 分析统计：排序、筛选、分组、求平均与汇总。\n4. 可视化：用图表呈现结果。\n本系列先学第 3 步——用 pandas 做统计，这是最核心、最有用的部分。',
            table: {
              headers: ['环节', '做什么', '常用工具'],
              rows: [
                ['获取数据', '从网页或文件拿到原始数据', 'requests、BeautifulSoup、pandas.read_csv'],
                ['清洗数据', '处理缺失、错误、格式不一的数据', 'pandas'],
                ['统计分析', '筛选、分组、聚合、排序', 'pandas、numpy'],
                ['可视化', '把数据画成图', 'matplotlib']
              ]
            }
          },
          {
            heading: '为什么用 pandas',
            text: 'pandas 是 Python 做数据分析最常用的库，它把数据组织成类似 Excel 的表格（DataFrame），让你用一行代码完成「按城市分组算平均」这种用 Python 列表要写好几层循环的操作。本应用内置了 pandas，可以直接在浏览器里运行。',
            code: `import pandas as pd\n\n# 用一个字典快速造一张小表，看看 pandas 长什么样\ndf = pd.DataFrame({\n    "姓名": ["小林", "小陈", "小王"],\n    "成绩": [88, 92, 75]\n})\nprint(df)`
          },
        ],
        codeExample: `import pandas as pd\n\ndf = pd.DataFrame({\n    "水果": ["苹果", "香蕉", "橙子"],\n    "价格": [5.5, 3.0, 4.2]\n})\nprint(df)\nprint("平均价格:", df["价格"].mean())`,
        takeaways: [
          '爬虫自动从网页收集数据，数据分析把数据变成结论',
          '分析流程：获取 → 清洗 → 统计 → 可视化',
          'pandas 用 DataFrame 表格组织数据，比手写循环简洁得多',
          '本应用内置 pandas，可以离线直接运行示例'
        ],
        tips: [
          '不要一上来就追求写爬虫，先把 pandas 统计练熟，哪怕数据是自己录入的也很有价值。',
          'pandas 输出的表格默认带行号（最左侧的 0、1、2），那是索引，不是数据本身。'
        ]
      }
    },
    {
      id: 'sp_series',
      title: 'Series：一维数据',
      stage: '爬虫和数据分析 > pandas 入门',
      summary: 'Series 是带标签的一列数据，相当于 Excel 里的一列，能用平均值、求和等方法统计。',
      content: {
        overview: 'pandas 有两个核心结构：Series（一列）和 DataFrame（一张表）。先从 Series 学起：它就是一列带名字和编号的数据，像 Excel 里单独一列，但自带一堆统计方法。',
        sections: [
          { heading: '创建 Series', text: 'Excel 里的一列「成绩」：88、92、75。Series 就是这一列，只不过它除了存数字，还能直接告诉你平均分、最高分、哪些值大于 80，不用自己写循环。\n\n用 pd.Series(列表) 创建一列数据，可用 name 参数给这一列起名。每个值左边会自动带上编号（索引），从 0 开始。',
            code: `import pandas as pd\n\nscores = pd.Series([88, 92, 75, 81], name="成绩")\nprint(scores)`
          },
          {
            heading: '常用统计方法',
            text: 'Series 自带很多统计方法，直接点出来用：\n• .mean() 平均值、.sum() 求和\n• .max() / .min() 最大最小值\n• .count() 个数、.median() 中位数',
            code: `import pandas as pd\n\nscores = pd.Series([88, 92, 75, 81], name="成绩")\nprint("个数:", scores.count())\nprint("总分:", scores.sum())\nprint("平均分:", scores.mean())\nprint("最高分:", scores.max())`
          },
          {
            heading: '按条件筛选',
            text: '把一个判断条件放进方括号，就能筛出满足条件的值。比如 scores[scores > 80] 表示「只保留大于 80 的成绩」。',
            code: `import pandas as pd\n\nscores = pd.Series([88, 92, 75, 81], name="成绩")\nprint("大于 80 的成绩：")\nprint(scores[scores > 80])`
          },
        ],
        codeExample: `import pandas as pd\n\nprices = pd.Series([5.5, 3.0, 4.2, 6.8], name="价格")\nprint("平均价格:", prices.mean())\nprint("最贵:", prices.max())\nprint("4 元以上：")\nprint(prices[prices > 4])`,
        takeaways: [
          'Series 是一维带标签的数据列，类似 Excel 的一列',
          'pd.Series(列表, name=) 创建',
          'mean/sum/max/min/count/median 等方法直接做统计',
          'series[series > 值] 按条件筛选数据'
        ],
        tips: [
          '打印 Series 时最左侧的 0、1、2 是索引，不是数据。',
          '统计方法返回的是数字，直接放进 print(f"...") 里格式化即可。'
        ]
      }
    },
    {
      id: 'sp_dataframe',
      title: 'DataFrame：二维表格',
      stage: '爬虫和数据分析 > pandas 入门',
      summary: 'DataFrame 是一张完整的表，由多列 Series 组成，是 pandas 最常用的数据结构。',
      content: {
        overview: 'Series 是一列，DataFrame 就是一整张表：每列有名字，每行有索引。它对应 Excel 里的一个工作表，是 pandas 真正处理业务数据的主力。',
        sections: [
          { heading: '创建 DataFrame', text: 'Excel 一张表：表头是姓名、年龄、成绩，下面三行数据。DataFrame 就是这张表，只不过你能用代码告诉它「按成绩从高到低排好」，而不用手动拖动。\n\n用 pd.DataFrame(字典) 创建：字典的每个 key 是列名，对应的列表是这一列的数据。各列长度要一致。',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "姓名": ["小林", "小陈", "小王"],\n    "年龄": [16, 17, 16],\n    "成绩": [88, 92, 75]\n})\nprint(df)`
          },
          {
            heading: '查看基本信息',
            text: '拿到一张表先了解它：\n• df.head(n) 看前 n 行\n• df.shape 看几行几列（返回 (行数, 列数)）\n• df.columns 看所有列名\n• df["列名"] 取出某一列（得到一个 Series）',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "姓名": ["小林", "小陈", "小王"],\n    "年龄": [16, 17, 16],\n    "成绩": [88, 92, 75]\n})\nprint("表格尺寸(行,列):", df.shape)\nprint("列名:", list(df.columns))\nprint("成绩这一列的平均:", df["成绩"].mean())`
          },
          {
            heading: '选择列与排序',
            text: 'df.sort_values("列名") 按某列排序，默认升序，加 ascending=False 变降序。',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "姓名": ["小林", "小陈", "小王"],\n    "成绩": [88, 92, 75]\n})\nprint("按成绩从高到低：")\nprint(df.sort_values("成绩", ascending=False))`
          },
        ],
        codeExample: `import pandas as pd\n\ndf = pd.DataFrame({\n    "城市": ["上海", "北京", "广州"],\n    "销售额": [300, 450, 260]\n})\nprint("共", df.shape[0], "个城市")\nprint("平均销售额:", df["销售额"].mean())\nprint(df.sort_values("销售额", ascending=False))`,
        takeaways: [
          'DataFrame 是二维表格，对应 Excel 的一个工作表',
          'pd.DataFrame({"列名": 列表}) 创建，各列长度一致',
          'df.shape 查看行列数，df["列名"] 取出一列 Series',
          'df.sort_values("列", ascending=False) 按列降序'
        ],
        tips: [
          '新拿到一张表，先用 df.shape 和 df.head() 看一眼结构，再动手分析。',
          '列名建议用英文或短中文，选择列时直接写 df["列名"]。'
        ]
      }
    },
    {
      id: 'sp_filter',
      title: '筛选数据',
      stage: '爬虫和数据分析 > pandas 入门',
      summary: '用条件表达式筛选行，多条件用 & 和 | 组合，比写循环清晰得多。',
      content: {
        overview: '分析数据时经常只要一部分行：只要成绩大于 80 的、只要某城市的。pandas 用条件表达式直接筛行，不用写 for 循环和 if 判断。',
        sections: [
          { heading: '单条件筛选', text: '老师在成绩表里圈出所有 80 分以上的同学。pandas 的做法是给出一个条件「成绩 > 80」，它自动把符合的行挑出来。\n\n把条件写在方括号里：df[df["成绩"] > 80]。条件会逐行判断，只保留 True 的行。',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "姓名": ["小林", "小陈", "小王", "小赵"],\n    "成绩": [88, 92, 75, 81]\n})\nprint(df[df["成绩"] > 80])`
          },
          {
            heading: '多条件组合',
            text: '多个条件用 &（且）和 |（或）组合，每个条件要用圆括号包起来。\n• & 表示同时满足\n• | 表示满足其一',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "姓名": ["小林", "小陈", "小王", "小赵"],\n    "城市": ["上海", "北京", "上海", "北京"],\n    "成绩": [88, 92, 75, 81]\n})\n# 上海的、且成绩大于 80 的行\nprint(df[(df["城市"] == "上海") & (df["成绩"] > 80)])`,
            notes: '多条件时每个条件必须用圆括号 ( ) 包起来，否则会报错。'
          },
        ],
        codeExample: `import pandas as pd\n\ndf = pd.DataFrame({\n    "商品": ["铅笔", "笔记本", "钢笔", "橡皮"],\n    "价格": [2.0, 8.5, 15.0, 1.5]\n})\nprint("10 元以下的商品：")\nprint(df[df["价格"] < 10])`,
        takeaways: [
          'df[df["列"] 条件] 直接筛选符合条件的行',
          '多条件用 &（且）、|（或），每个条件用圆括号包裹',
          '筛选返回的还是一个 DataFrame，可以继续排序、统计',
          '这比手写 for 循环加 if 判断清晰得多'
        ],
        tips: [
          '条件里判断相等用 ==，不是 =。',
          '筛选后想看结果就 print 整个 DataFrame，符合条件的行会显示出来。'
        ]
      }
    },
    {
      id: 'sp_groupby',
      title: '分组聚合',
      stage: '爬虫和数据分析 > pandas 入门',
      summary: 'groupby 按某列分组，再对每组求平均、求和，一行完成「每个城市的平均销售额」。',
      content: {
        overview: '「每个城市的平均销售额是多少？」这种问题叫分组聚合：先按城市分组，再对每组的销售额求平均。pandas 的 groupby 一行代码就能完成，这是数据分析最常用的操作。',
        sections: [
          { heading: 'groupby 基本用法', text: '全班同学按小组分成几堆，老师分别算每堆的平均分。groupby("小组") 就是先分组，再对每组应用 mean()。\n\ndf.groupby("列名")["统计列"].方法() 的读法：先按某列分组，再对指定列做聚合。',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "城市": ["上海", "上海", "北京", "北京", "北京"],\n    "销售额": [300, 500, 200, 400, 600]\n})\n# 按城市分组，求每个城市的销售额总和\nprint(df.groupby("城市")["销售额"].sum())`
          },
          {
            heading: '分组求平均与计数',
            text: '同样的写法把方法换成 mean() 就是平均，换成 count() 就是每组有几行。',
            code: `import pandas as pd\n\ndf = pd.DataFrame({\n    "城市": ["上海", "上海", "北京", "北京", "北京"],\n    "销售额": [300, 500, 200, 400, 600]\n})\nprint("每个城市平均销售额：")\nprint(df.groupby("城市")["销售额"].mean())\nprint("每个城市记录数：")\nprint(df.groupby("城市")["销售额"].count())`
          },
        ],
        codeExample: `import pandas as pd\n\ndf = pd.DataFrame({\n    "班级": ["一班", "一班", "二班", "二班"],\n    "成绩": [80, 90, 70, 85]\n})\nprint("各班平均分：")\nprint(df.groupby("班级")["成绩"].mean())`,
        takeaways: [
          'groupby("列") 先按该列把数据分成若干组',
          '再对目标列调用 sum/mean/count/max 做聚合',
          '一行代码完成「每个城市/班级/类别的统计值」',
          '这是数据分析里出现频率最高的操作之一'
        ],
        tips: [
          'groupby 的结果索引是分组列的值（城市名、班级名），最左侧那一列。',
          '想同时看好几个聚合指标，可换成 .agg(["mean", "sum"])。'
        ]
      }
    },
    {
      id: 'sp_csv',
      title: '读取与保存 CSV',
      stage: '爬虫和数据分析 > pandas 入门',
      summary: 'CSV 是最常见的表格交换格式，pandas 用 read_csv 和 to_csv 一行读写。',
      content: {
        overview: 'CSV（逗号分隔值）是一种纯文本表格文件，Excel、网页导出的数据几乎都是它。pandas 能把 CSV 直接读成 DataFrame，也能把处理好的表存成 CSV。这一课了解它的结构和读写方式。',
        sections: [
          { heading: 'CSV 长什么样', text: 'CSV 文件用纯文本存表格：第一行是表头，每行用逗号分隔各列。用记事本打开就能看到它长什么样，Excel 也能直接打开。\n\n下面是一个 CSV 的内容，逗号分隔列，换行分隔行：',
            code: `data = "姓名,年龄,成绩\\n小林,16,88\\n小陈,17,92\\n小王,16,75"\nprint(data)`
          },
          {
            heading: '从文本读取为 DataFrame',
            text: 'pandas 通常用 pd.read_csv("文件路径") 读文件。在本应用的离线环境里，我们用 pd.read_csv(pd.io.common.StringIO(文本)) 直接从字符串读，效果相同。',
            code: `import pandas as pd\nfrom io import StringIO\n\ncsv_text = "姓名,年龄,成绩\\n小林,16,88\\n小陈,17,92\\n小王,16,75"\ndf = pd.read_csv(StringIO(csv_text))\nprint(df)\nprint("平均分:", df["成绩"].mean())`,
            notes: '真实项目里直接写 pd.read_csv("data.csv") 即可；StringIO 只是用来在演示里模拟一个内存中的 CSV 文件。'
          },
        ],
        codeExample: `import pandas as pd\nfrom io import StringIO\n\ncsv_text = "城市,销售额\\n上海,300\\n北京,450\\n广州,260"\ndf = pd.read_csv(StringIO(csv_text))\nprint(df)\nprint("平均销售额:", df["销售额"].mean())`,
        takeaways: [
          'CSV 是逗号分隔的纯文本表格，跨软件通用',
          'pd.read_csv("文件") 把 CSV 读成 DataFrame',
          'df.to_csv("文件") 把表格存成 CSV',
          '演示环境用 StringIO 把字符串模拟成内存文件'
        ],
        tips: [
          '从网上下载的 CSV 常有表头缺失或编码问题，先用记事本打开看一眼内容。',
          '真实读文件需要本机 Python 环境，本应用内演示用 StringIO 模拟。'
        ]
      }
    }
  ]
};
