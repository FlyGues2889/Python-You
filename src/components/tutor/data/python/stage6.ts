import { TutorialStage, TutorialTopic } from '../tutorialData';

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
