import { TutorialStage } from '../../tutorialData';

export const stage6: TutorialStage = {

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
          title: 'Matplotlib 概览',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: 'Matplotlib 是 Python 的画图工具，几行代码画出漂亮图表。',
          content: {
            overview: 'Matplotlib 是 Python 最常用的绘图库，能把数据画成折线图、柱状图、饼图等。不用懂复杂的图形学，几行代码就能把「数字」变成「看得见的图」。',
            sections: [
              { heading: 'Matplotlib 核心优势', text: '你记录了一周每天的气温，想看看变化趋势——画成折线图一眼就明白：哪天升温、哪天降温。Matplotlib 就是帮你把数据「画出来」的工具。\n\n1. 图表类型丰富：支持折线图、散点图、柱状图、饼图、直方图、等高线图、3D 图等几十种图表\n2. 精细可控：可针对标题、坐标轴、图例、网格、颜色进行像素级微调\n3. 生态兼容：天然适配 NumPy 数组与 Pandas DataFrame 数据源',
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
              { heading: '核心绘图 API', text: '画成绩对比：x = ["语文", "数学", "英语"]，y = [85, 92, 78]，plt.bar(x, y) 一根柱子一门课，再加 plt.title("期末成绩")，一张柱状图就完成了。\n\n• `plt.plot(x, y, label=...)`：绘制折线图\n• `plt.scatter(x, y, color=...)`：绘制散点图\n• `plt.title()`：设置图表标题\n• `plt.xlabel()` / `plt.ylabel()`：设置坐标轴标签\n• `plt.legend()`：显示图例\n• `plt.grid(True)`：显示网格\n• `plt.show()`：显示图表',
                code: `# 生成模拟数据\nx = [1, 2, 3, 4, 5, 6]\ny1 = [2, 4, 9, 16, 25, 36]\ny2 = [1, 3, 6, 10, 15, 21]\n\nprint("X 轴数据:", x)\nprint("平方序列 Y1:", y1)\nprint("累加序列 Y2:", y2)`
              },
              {
                heading: '样式自定义',
                text: '折线图常用样式参数：\n• color：颜色（英文名称或十六进制）\n• linestyle：线型（- 实线、-- 虚线、: 点线）\n• linewidth：线宽\n• marker：数据点标记（o 圆点、s 方块、^ 三角）\n• markersize：标记大小',
                code: `# 样式丰富的折线图示例\n# import matplotlib.pyplot as plt\n# plt.plot(x, y1, color='red', linestyle='--', marker='o', label='平方')\n# plt.plot(x, y2, color='blue', linestyle='-', marker='s', label='累加')\n# plt.legend()\n# plt.grid(True, alpha=0.3)`
              },
              {
                heading: '完整绘图流程',
                text: '标准绘图步骤：\n1. 准备数据（通常是列表或 NumPy 数组）\n2. 创建画布与子图\n3. 调用绘图函数绘制图形\n4. 设置标题、标签、图例、网格等装饰\n5. 显示或保存图表'
              },
            ],
            codeExample: `x_vals = [i for i in range(10)]\ny_vals = [x ** 2 for x in x_vals]\nprint("折线图 X 点列:", x_vals)\nprint("折线图 Y 点列:", y_vals)`,
            tips: [
              '可以在侧边栏【包管理器】中实时管理科学计算环境相关的各种扩展库。',
              '保存图片推荐用 plt.savefig()，分辨率更高。'
            ]
          }
        },
        {
          id: 'p6_mpl_charts',
          title: '更多常用图表',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: '饼图看占比、直方图看分布、横向条形图和箱线图的画法。',
          content: {
            overview: '折线图和柱状图只是起点。分析数据时还常需要：看各部分占整体多少用饼图，看数据落在哪些区间用直方图，看类别排名用横向条形图，看数据离散程度和异常值用箱线图。这一节把这四种图一次讲清。',
            sections: [
              { heading: 'plt.pie() 饼图：看占比', text: '饼图适合展示「各部分占整体的比例」，比如一个月开支里吃饭、交通、娱乐各占多少。传入一组数值，Matplotlib 会自动算出每块的百分比并画成扇形。常用参数：labels 给每块加名字，autopct 自动在扇形里显示百分比（%1.1f%% 表示保留一位小数），startangle 让饼图从指定角度开始画。\n\n注意：类别超过五六块时饼图会挤成一团，这时应改用柱状图。',
                code: `# 饼图示例：五类支出占比（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\nlabels = ['吃饭', '交通', '娱乐', '学习', '其他']\nsizes = [1200, 400, 600, 500, 300]\nplt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)\nplt.title('每月支出构成')\ntotal = sum(sizes)\nfor name, amount in zip(labels, sizes):\n    print(f'{name}: {amount} 元，占比 {amount / total * 100:.1f}%')`
              },
              { heading: 'plt.hist() 直方图：看分布', text: '直方图和柱状图长得像，但含义完全不同：柱状图比较几个类别各自的数值，直方图把一列连续数据按区间「分桶」，统计每个桶里落了多少个数据点，用来观察数据整体分布——集中在哪、有没有长尾。传入一个一维数组，再用 bins 指定分成几个区间即可。',
                code: `# 直方图示例：全班考试分数分布（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\nscores = [55, 62, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98]\nplt.hist(scores, bins=5, edgecolor='black')\nplt.title('考试分数分布')\nprint('共', len(scores), '个分数；最低', min(scores), '最高', max(scores))\nprint('60 分以下:', sum(1 for s in scores if s < 60))\nprint('60 到 80 分:', sum(1 for s in scores if 60 <= s < 80))\nprint('80 分以上:', sum(1 for s in scores if s >= 80))`
              },
              { heading: 'plt.barh() 横向条形图', text: 'plt.bar() 画竖条，plt.barh() 画横条。当类别名字很长（比如课程全名、国家名）时，横条不会互相挤压，标签更好读。参数几乎和 bar 一样，只是 x 和 y 的方向对调。',
                code: `# 横向条形图：五门课平均分（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\ncourses = ['Python', '数据结构', '线性代数', '大学英语', '体育']\nscores = [88, 82, 75, 90, 95]\nplt.barh(courses, scores)\nplt.title('各科平均分')\nfor c, s in sorted(zip(courses, scores), key=lambda p: p[1]):\n    print(f'{c}: {s}')`
              },
              { heading: 'plt.boxplot() 箱线图：看离散与异常值', text: '箱线图用一条「箱子」加两根「须」概括一组数据：箱子中间的线是中位数，箱子上下沿是第 25 和第 75 百分位，须延伸到正常范围两端，须外单独画出来的点就是异常值（离群点）。对比多组数据的离散程度时特别有用，比如两个班的成绩分布。',
                code: `# 箱线图示例：两个班的成绩（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\nclass_a = [70, 72, 75, 78, 80, 82, 85, 88, 90]\nclass_b = [55, 65, 78, 80, 82, 85, 88, 95, 100]\nplt.boxplot([class_a, class_b])
plt.xticks([1, 2], ['A班', 'B班'])\nplt.title('两个班成绩箱线图')\nimport statistics as st\nfor name, data in [('A班', class_a), ('B班', class_b)]:\n    print(name, '中位数:', st.median(data), '总体标准差:', round(st.pstdev(data), 1))`
              },
            ],
            codeExample: `# 四种图的调用形式汇总（每张图前先 plt.figure() 另起一张，运行后依次显示在输出终端）\nimport matplotlib.pyplot as plt\nplt.figure()\nplt.pie([3, 5, 2], labels=['甲', '乙', '丙'], autopct='%1.1f%%')\nplt.figure()\nplt.hist([1, 2, 2, 3, 3, 3, 4, 4, 5], bins=5)\nplt.figure()\nplt.barh(['A', 'B', 'C'], [10, 25, 15])\nplt.figure()\nplt.boxplot([[1, 2, 3, 4, 5], [2, 3, 4, 5, 20]])\nprint('占比用 pie，分布用 hist，长标签排名用 barh，比离散和异常值用 boxplot。')`,
            tips: [
              '占比用 pie，分布用 hist，长标签排名用 barh，比离散和异常值用 boxplot。',
              '类别太多时饼图会挤成一团，改用柱状图更清楚。'
            ]
          }
        },
        {
          id: 'p6_mpl_ticks',
          title: '刻度与坐标范围',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: '自己控制坐标轴上的刻度位置和显示范围。',
          content: {
            overview: 'Matplotlib 会自动给坐标轴打刻度，但自动刻度不一定合心意：想在 x 轴每个整数处都标字、想让 y 轴从 0 开始、想放大某一段区间，都需要手动设置刻度和范围。',
            sections: [
              { heading: 'plt.xticks() / plt.yticks() 改刻度', text: 'xticks(ticks, labels) 接收两个参数：ticks 是刻度放在哪些位置，labels 是每个位置上显示的文字。只传一个参数时，只改位置不改文字。画柱状图时经常用它把横排标签旋转一下，避免名字互相压住，传 rotation=45 即可。',
                code: `# 控制 x 轴刻度（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\nyears = [2019, 2020, 2021, 2022, 2023]\nsales = [100, 130, 180, 160, 220]\nplt.plot(years, sales, marker='o')\nplt.xticks([2019, 2020, 2021, 2022, 2023], ['一九年', '二零年', '二一年', '二二年', '二三年'])\nfor y, s in zip(years, sales):\n    print(y, '年销售额:', s)`
              },
              { heading: 'plt.xlim() / plt.ylim() 改范围', text: '默认坐标范围会贴着数据边缘，柱状图柱子看起来像「从天上掉下来」。用 plt.ylim(0, 最大值) 把纵轴下限设成 0，柱子长度才能真实反映数值差距。plt.xlim(左, 右) 同理控制横轴范围；只设一端可写 plt.ylim(bottom=0)。',
                code: `# 让纵轴从 0 开始，柱子高度才真实（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\ncats = ['甲', '乙', '丙']\nvals = [90, 95, 93]\nplt.bar(cats, vals)\nplt.ylim(0, 100)\nprint('原始数据:', vals)\nprint('若纵轴从 80 开始，会夸大 90 和 95 的差距；从 0 开始才如实反映。')`
              },
            ],
            codeExample: `# 刻度与范围配合使用\n# import matplotlib.pyplot as plt\n# plt.plot([1, 2, 3, 4], [10, 20, 15, 30])\n# plt.xticks([1, 2, 3, 4], ['一', '二', '三', '四'])\n# plt.xlim(0.5, 4.5)\n# plt.ylim(0, 35)\nprint('xticks 改刻度文字，xlim / ylim 改坐标范围。')`,
            tips: [
              '比较柱子高低时，纵轴务必从 0 开始，否则视觉会撒谎。',
              '类别名太长就用 plt.xticks(rotation=45) 把标签斜过来。'
            ]
          }
        },
        {
          id: 'p6_mpl_canvas',
          title: '画布与子图',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: '用 figure 控制画布大小，用 subplot 在一张图里摆多个小图。',
          content: {
            overview: '默认画布大小不一定合适：图太小字看不清，图太宽又留白太多。想把折线图和柱状图并排放在一张图里做对比，就需要 subplot。这一节讲怎么手动建画布、怎么用网格布局放子图。',
            sections: [
              { heading: 'plt.figure(figsize=...) 建画布', text: 'figsize=(宽, 高) 以英寸为单位，先于绘图函数调用，决定整张图的宽高比。同时可以传 dpi 参数（每英寸像素数）控制清晰度。日常做教学幻灯片用 figsize=(8, 5) 左右比较舒服。',
                code: `# 先建画布再画图（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(8, 5), dpi=100)\nplt.plot([1, 2, 3], [1, 4, 9])\nplt.title('自定义画布尺寸')\nprint('figsize=(8, 5) 表示宽 8 英寸、高 5 英寸；dpi 越大越清晰。')`
              },
              { heading: 'plt.subplot() 单子图布局', text: 'subplot(行数, 列数, 序号) 把画布切成一个网格，然后在指定格子里画图。序号从 1 开始、从左到右、从上到下数。比如 subplot(2, 1, 1) 表示两行一列、画在上面那格；紧接着再调用 subplot(2, 1, 2) 就在下面那格继续画。它和 plt.subplots() 的区别是：subplot 一次只拿到一个 Axes，适合顺序逐格画；subplots 一次把所有 Axes 都建好。',
                code: `# 上下两张子图（运行后图形显示在下方输出终端）\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(6, 6))\nplt.subplot(2, 1, 1)\nplt.plot([1, 2, 3], [1, 4, 9])\nplt.title('上方折线')\nplt.subplot(2, 1, 2)\nplt.bar(['A', 'B', 'C'], [3, 7, 5])\nplt.title('下方柱状')\nprint('2 行 1 列：先画第 1 格，再 subplot(2, 1, 2) 画第 2 格。')`
              },
              { heading: 'plt.savefig() 保存图片', text: '本机画图时用 savefig 把图存成文件。两个新手常用参数：dpi=150 让导出的图更清晰（论文、汇报用）；bbox_inches="tight" 自动裁掉图四周多余的白边，否则标题或标签常被切掉。注意：必须在 plt.show() 之前调用 savefig，否则存出来是空白图。\n\n（在 Pyodide 在线环境中不能写本地文件，下面只打印参数说明。）',
                code: `# 本机运行时保存图片（在线环境不能写文件，仅作示例）\n# import matplotlib.pyplot as plt\n# plt.plot([1, 2, 3], [1, 2, 3])\n# plt.title('示例')\n# plt.savefig('chart.png', dpi=150, bbox_inches='tight')\nprint('保存要点：先 savefig 再 show；dpi=150 更清晰；bbox_inches=tight 裁白边。')`
              },
            ],
            codeExample: `# 多子图模板\n# import matplotlib.pyplot as plt\n# plt.figure(figsize=(8, 6))\n# plt.subplot(1, 2, 1); plt.plot([1, 2, 3], [1, 4, 9])\n# plt.subplot(1, 2, 2); plt.bar(['a', 'b'], [3, 5])\n# plt.tight_layout()\nprint('1 行 2 列：左折线、右柱状；tight_layout() 自动调整间距。')`,
            tips: [
              'subplot 的序号从 1 开始，不是从 0 开始。',
              'savefig 一定要放在 show 之前，否则保存到的是空图。'
            ]
          }
        },
        {
          id: 'p6_mpl_chinese',
          title: '中文乱码问题',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: '画图标题是方框？两行配置搞定中文显示。',
          content: {
            overview: '零基础用 Matplotlib 最容易踩的第一个坑：标题、坐标标签里写中文，结果图上全变成一个个方框。这不是代码写错了，而是 Matplotlib 默认字体不支持中文。开头加两行 rcParams 配置即可解决。',
            sections: [
              { heading: '为什么会乱码', text: 'Matplotlib 默认使用 DejaVu Sans 这类英文字体，字库里没有中文字形，遇到中文就画成方框（俗称豆腐块）。axes.unicode_minus 是另一个相关开关：负号在某些中文字体下会显示成方框，需要单独关掉。'
              },
              { heading: '两行配置', text: '在导入 pyplot 之后、画图之前，加上：\nplt.rcParams["font.sans-serif"] = ["SimHei"]  # 用黑体显示中文\nplt.rcParams["axes.unicode_minus"] = False     # 正常显示负号\n\nSimHei（黑体）是 Windows 自带字体；Mac 上可换成 "Arial Unicode MS" 或 "PingFang SC"，Linux 上需要先自行安装中文字体。',
                code: `import matplotlib.pyplot as plt\n\n# 中文显示两件套：画图之前配置好\nplt.rcParams['font.sans-serif'] = ['SimHei']\nplt.rcParams['axes.unicode_minus'] = False\n\n# 之后再画中文标题就不会变方框了\n# plt.title('期末成绩')\n# plt.xlabel('科目')\nprint('已配置中文字体 SimHei，并关闭 unicode_minus。')\nprint('此后图表中的中文标题与标签即可正常显示。')`
              },
            ],
            codeExample: `import matplotlib.pyplot as plt\nplt.rcParams['font.sans-serif'] = ['SimHei']\nplt.rcParams['axes.unicode_minus'] = False\nprint('两行配置后，再画 plt.title("中文标题") 就不会出现方框。')`,
            tips: [
              '这两行要放在所有绘图调用之前，否则已经画好的图不会自动重绘。',
              '负号变方框是 axes.unicode_minus 没关，和中文字体是两个独立问题。'
            ]
          }
        },
        {
          id: 'p6_seaborn',
          title: 'Seaborn 概览',
          stage: 'Python 数据可视化 > Python Matplotlib',
          summary: '在 Matplotlib 之上封装的统计绘图库，默认更好看。',
          content: {
            overview: 'Seaborn 是基于 Matplotlib 的更高层绘图库，专门给统计图表用：一行代码就能画出带置信区间的回归线、分组箱线图、热力图，默认配色和样式比裸 Matplotlib 更精致。它不是替代 Matplotlib，而是「加了皮肤和快捷方式」——画完仍然可以用 plt.title()、plt.savefig() 继续调整。',
            sections: [
              { heading: '什么时候用 Seaborn', text: '当你在做数据探索、需要快速看出分组差异或相关关系时，Seaborn 比手写 Matplotlib 省代码。它天然吃 Pandas DataFrame，把列名直接传给 x、y 参数就能画图。安装：pip install seaborn。',
                code: `# Seaborn 典型用法（需先 pip install seaborn）\n# import matplotlib.pyplot as plt\n# import seaborn as sns\n# sns.barplot(x='科目', y='分数', data=df)\n# plt.title('分组柱状图')\nprint('Seaborn = Matplotlib 之上的统计绘图快捷方式，默认更好看。')`
              },
            ],
            codeExample: `print('seaborn 基于 matplotlib，适合统计图表；plt 上的函数依然可用。')`,
            tips: [
              'Seaborn 依赖 Matplotlib，学完本节的 plt 写法再上手 Seaborn 会很顺。'
            ]
          }
        }
      ]
    }
  ]
};
