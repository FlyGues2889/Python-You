// scraping 系列测验组：追加到 quizData.ts 的 TOPIC_QUIZZES 数组中
import type { TopicQuiz } from '../quizData';

export const scrapingQuizzes: TopicQuiz[] = [
  {
    topicId: 'sp_what',
    questions: [
      {
        id: 'sp_what_q1',
        type: 'choice',
        question: '在数据分析流程里，爬虫的主要作用是？',
        options: ['画图表', '自动从网页收集数据', '设计网页布局', '编译程序'],
        answerIndex: 1,
        explanation: '爬虫负责获取数据，pandas 负责清洗和统计，matplotlib 负责画图。'
      },
      {
        id: 'sp_what_q2',
        type: 'choice',
        question: 'pandas 中一整张表叫什么？',
        options: ['Series', 'DataFrame', 'List', 'Dict'],
        answerIndex: 1,
        explanation: 'DataFrame 是二维表格；Series 只是其中一列。'
      },
      {
        id: 'sp_what_q3',
        type: 'code',
        question: '用 pandas 建一张水果价格表（苹果 5.5、香蕉 3.0、橙子 4.2），打印平均价格。',
        starterCode: '# 任务：建表后打印 价格 列的平均值\nimport pandas as pd',
        expectedOutput: '平均价格: 4.233333333333333'
      }
    ]
  },
  {
    topicId: 'sp_series',
    questions: [
      {
        id: 'sp_series_q1',
        type: 'choice',
        question: 'Series 是什么？',
        options: ['一张二维表', '带标签的一列数据', '一个字典', '一段代码'],
        answerIndex: 1,
        explanation: 'Series 是一维数据列，DataFrame 由多个 Series 组成。'
      },
      {
        id: 'sp_series_q2',
        type: 'choice',
        question: '求一列数据的平均值用哪个方法？',
        options: ['.average()', '.mean()', '.avg()', '.middle()'],
        answerIndex: 1,
        explanation: 'pandas 用 .mean() 求平均，另有 sum/max/min/count。'
      },
      {
        id: 'sp_series_q3',
        type: 'code',
        question: '用 Series 存价格 [5.5, 3.0, 4.2, 6.8]，打印平均价格和最高价。',
        starterCode: '# 任务：创建 prices 后打印 mean 和 max\nimport pandas as pd',
        expectedOutput: '平均价格: 4.875\n最贵: 6.8'
      },
      {
        id: 'sp_series_q4',
        type: 'blank',
        question: '补全：pandas 里单独一列带标签的数据叫 ____ ；求这列的平均值用 ____() 方法。',
        blanks: [['Series'], ['mean']],
        explanation: 'Series 是一维带标签的一列；求平均用 .mean()，另有 sum/max/min/count。'
      }
    ]
  },
  {
    topicId: 'sp_dataframe',
    questions: [
      {
        id: 'sp_dataframe_q1',
        type: 'choice',
        question: '创建 DataFrame 用哪个函数？',
        options: ['pd.DataFrame()', 'pd.Table()', 'pd.Series()', 'pd.Frame()'],
        answerIndex: 0,
        explanation: 'pd.DataFrame(字典) 创建二维表，key 是列名。'
      },
      {
        id: 'sp_dataframe_q2',
        type: 'choice',
        question: 'df.shape 返回 (3, 3) 表示？',
        options: ['3 行 3 列', '3 列 3 行的值相同', '文件大小', '3 个索引'],
        answerIndex: 0,
        explanation: 'shape 返回 (行数, 列数)。'
      },
      {
        id: 'sp_dataframe_q3',
        type: 'code',
        question: '建表（上海 300、北京 450、广州 260），打印城市个数和平均销售额。',
        starterCode: '# 任务：打印城市个数与销售额平均值\nimport pandas as pd',
        expectedOutput: '共 3 个城市\n平均销售额: 336.6666666666667'
      },
      {
        id: 'sp_dataframe_q4',
        type: 'multi',
        question: '关于 DataFrame，下面哪些说法正确？（多选）',
        options: ['它是一张二维表格（行和列）', '可以用字典创建，字典的键就是列名', '用 df.shape 可以看有几行几列', 'DataFrame 里只能存放数字'],
        answerIndexes: [0, 1, 2],
        explanation: 'DataFrame 是二维表，字典建表、shape 看行列；它可以同时存文字和数字。'
      }
    ]
  },
  {
    topicId: 'sp_filter',
    questions: [
      {
        id: 'sp_filter_q1',
        type: 'choice',
        question: '筛选「价格小于 10」的行，正确写法是？',
        options: ['df[df["价格"] < 10]', 'df.where(价格<10)', 'df.filter(价格)', 'df[价格 < 10]'],
        answerIndex: 0,
        explanation: '把条件表达式放进方括号，列名用 df["列名"]。'
      },
      {
        id: 'sp_filter_q2',
        type: 'choice',
        question: '多条件「上海 且 成绩大于 80」用什么连接？',
        options: ['and', '&', '+', '&&'],
        answerIndex: 1,
        explanation: 'pandas 用 & 表示且、| 表示或，每个条件要加圆括号。'
      },
      {
        id: 'sp_filter_q3',
        type: 'code',
        question: '建商品表（铅笔 2.0、笔记本 8.5、钢笔 15.0、橡皮 1.5），筛选价格小于 10 的商品，打印数量。',
        starterCode: '# 任务：筛选后打印符合条件的行数\nimport pandas as pd',
        expectedOutput: '10 元以下商品数量: 3'
      },
      {
        id: 'sp_filter_q4',
        type: 'multi',
        question: '关于 pandas 多条件筛选，下面哪些说法正确？（多选）',
        options: ['多个条件之间用 & 表示且、| 表示或', '每个条件要用圆括号包起来', '列名写成 df["列名"]', '多个条件直接用英文 and 连接'],
        answerIndexes: [0, 1, 2],
        explanation: 'pandas 用 & 和 |，条件加圆括号；这里不能用 and，会报错。'
      }
    ]
  },
  {
    topicId: 'sp_groupby',
    questions: [
      {
        id: 'sp_groupby_q1',
        type: 'choice',
        question: '按城市分组求平均销售额，正确写法是？',
        options: ['df.groupby("城市")["销售额"].mean()', 'df.mean("城市")', 'df.group("销售额")', 'df.pivot("城市")'],
        answerIndex: 0,
        explanation: 'groupby(分组列)[目标列].聚合方法()。'
      },
      {
        id: 'sp_groupby_q2',
        type: 'choice',
        question: 'groupby 后调用 .count() 是统计什么？',
        options: ['每组的行数', '每组的平均值', '每组最大值', '缺失值数量'],
        answerIndex: 0,
        explanation: 'count 统计每组有多少行记录。'
      },
      {
        id: 'sp_groupby_q3',
        type: 'code',
        question: '建成绩表（一班 80、一班 90、二班 70、二班 85），按班级分组打印平均分。',
        starterCode: '# 任务：按班级分组求成绩平均分，打印平均值即可\nimport pandas as pd',
        expectedOutput: { mode: 'regex', pattern: '一班\\s+85\\.0\\s*二班\\s+77\\.5', flags: 's' }
      },
      {
        id: 'sp_groupby_q4',
        type: 'order',
        question: '把下面「用 groupby 做分组统计」的步骤排正确。',
        items: ['用 df.groupby("城市") 按城市分组', '选中要统计的列，如 ["销售额"]', '调用 .sum() 或 .mean() 做聚合', 'print 打印统计结果'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先按列分组，再选目标列，接着调用聚合函数，最后打印结果。'
      }
    ]
  },
  {
    topicId: 'sp_csv',
    questions: [
      {
        id: 'sp_csv_q1',
        type: 'choice',
        question: '读取 CSV 文件用哪个函数？',
        options: ['pd.read_csv()', 'pd.open_csv()', 'pd.load()', 'pd.csv_read()'],
        answerIndex: 0,
        explanation: 'pd.read_csv("文件路径") 读成 DataFrame。'
      },
      {
        id: 'sp_csv_q2',
        type: 'choice',
        question: 'CSV 文件用什么分隔列？',
        options: ['分号', '逗号（或制表符）', '竖线', '空格'],
        answerIndex: 1,
        explanation: 'CSV 即逗号分隔值，每行内各列用逗号分隔。'
      },
      {
        id: 'sp_csv_q3',
        type: 'code',
        question: '用 StringIO 读取 CSV 文本（上海 300、北京 450、广州 260），打印平均销售额。',
        starterCode: '# 任务：读入后打印销售额平均值\nimport pandas as pd\nfrom io import StringIO',
        expectedOutput: '平均销售额: 336.6666666666667'
      },
      {
        id: 'sp_csv_q4',
        type: 'blank',
        question: '补全：把 CSV 文件读成 DataFrame 用 pd.____()；把 DataFrame 存成 CSV 文件用 df.____()。',
        blanks: [['read_csv'], ['to_csv']],
        explanation: 'pd.read_csv 读文件成表，df.to_csv 把表写回文件。'
      }
    ]
  },
  {
    topicId: 'sp_http',
    questions: [
      {
        id: 'sp_http_q1',
        type: 'choice',
        question: 'HTTP 请求中最常见的获取数据方法是？',
        options: ['POST', 'GET', 'DELETE', 'PUT'],
        answerIndex: 1,
        explanation: 'GET 用于获取页面/数据，POST 用于提交数据。'
      },
      {
        id: 'sp_http_q2',
        type: 'choice',
        question: '状态码 404 表示？',
        options: ['成功', '页面不存在', '无权限', '服务器错误'],
        answerIndex: 1,
        explanation: '200 成功、404 不存在、403 无权限、500 服务器错误。'
      },
      {
        id: 'sp_http_q3',
        type: 'code',
        question: '用字典模拟响应：status_code 为 200、body 为《西游记》价格 45 元，打印状态和内容。',
        starterCode: '# 任务：构造 response 字典并打印 status_code 与 body',
        expectedOutput: '状态: 200\n内容: 《西游记》价格 45 元'
      },
      {
        id: 'sp_http_q4',
        type: 'multi',
        question: '关于 HTTP 状态码，下面哪些说法正确？（多选）',
        options: ['200 表示请求成功', '404 表示页面不存在', '500 表示服务器内部出错', '301 表示客户端自己写错了'],
        answerIndexes: [0, 1, 2],
        explanation: '2xx 成功、4xx 客户端错误、5xx 服务器错误；301 是重定向，不是请求写错。'
      }
    ]
  },
  {
    topicId: 'sp_html',
    questions: [
      {
        id: 'sp_html_q1',
        type: 'choice',
        question: 'HTML 中表格的行用哪个标签？',
        options: ['<td>', '<tr>', '<table>', '<row>'],
        answerIndex: 1,
        explanation: '<tr> 是表格行，<td> 是行内单元格。'
      },
      {
        id: 'sp_html_q2',
        type: 'choice',
        question: '网页标题通常包在哪个标签里？',
        options: ['<p>', '<h1>（或标题标签）', '<div>', '<li>'],
        answerIndex: 1,
        explanation: '<h1>~<h6> 是各级标题，<p> 是段落。'
      },
      {
        id: 'sp_html_q3',
        type: 'code',
        question: '给定 HTML：<ul><li>铅笔</li><li>笔记本</li><li>钢笔</li></ul>，打印其中列表项 <li> 的数量。',
        starterCode: '# 任务：用 str.count 统计 <li> 出现次数\nhtml = "<ul><li>铅笔</li><li>笔记本</li><li>钢笔</li></ul>"',
        expectedOutput: '列表项数量: 3'
      },
      {
        id: 'sp_html_q4',
        type: 'blank',
        question: '补全：HTML 表格里，一行用 <____> 标签；行里的一个单元格用 <____> 标签。',
        blanks: [['tr'], ['td']],
        explanation: '<tr> 是表格行，<td> 是行内单元格；<table> 才是整张表。'
      }
    ]
  },
  {
    topicId: 'sp_requests',
    questions: [
      {
        id: 'sp_requests_q1',
        type: 'choice',
        question: '在本机用 requests 获取网页内容的正确写法是？',
        options: ['requests.get(url)', 'requests.fetch(url)', 'requests.html(url)', 'requests.open(url)'],
        answerIndex: 0,
        explanation: 'requests.get(url) 发送 GET 请求，resp.text 取内容。'
      },
      {
        id: 'sp_requests_q2',
        type: 'choice',
        question: '为什么本应用内置环境不能直接跑 requests 抓取？',
        options: ['requests 太慢', '需要联网和本机 Python 环境安装该库', 'requests 不能抓中文网页', 'requests 只支持图片'],
        answerIndex: 1,
        explanation: 'requests 需要 pip install 且联网，浏览器内的离线 WASM 环境不支持。'
      },
      {
        id: 'sp_requests_q3',
        type: 'blank',
        question: 'requests.get 拿到响应后，用 resp.____ 查看状态码，用 resp.____ 查看网页 HTML 文本。',
        blanks: [['status_code'], ['text']],
        explanation: 'resp.status_code 判断成功，resp.text 是返回的 HTML 文本。'
      },
      {
        id: 'sp_requests_q4',
        type: 'order',
        question: '把下面「用 requests 抓取一个网页」的步骤排正确。',
        items: ['准备好目标网址 URL', '用 requests.get(url) 发送请求', '检查 resp.status_code 是否为 200', '用 resp.text 取出网页 HTML 文本'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先有 URL，再发请求，确认状态码 200，最后取 HTML 文本。'
      }
    ]
  },
  {
    topicId: 'sp_parse',
    questions: [
      {
        id: 'sp_parse_q1',
        type: 'choice',
        question: '用 BeautifulSoup 找到所有 <tr> 标签的方法是？',
        options: ['soup.find("tr")', 'soup.find_all("tr")', 'soup.search("tr")', 'soup.all("tr")'],
        answerIndex: 1,
        explanation: 'find_all 找到全部匹配标签，find 只找第一个。'
      },
      {
        id: 'sp_parse_q2',
        type: 'choice',
        question: '取出标签内纯文字用哪个属性？',
        options: ['.content', '.text', '.value', '.html'],
        answerIndex: 1,
        explanation: 'tag.text 返回标签内的纯文本内容。'
      },
      {
        id: 'sp_parse_q3',
        type: 'code',
        question: '给定 HTML <li>铅笔</li><li>笔记本</li><li>钢笔</li>，用 re.findall 提取所有列表项并每行打印。',
        starterCode: '# 任务：用 re.findall 提取 <li> 内容并逐行打印\nimport re\nhtml = "<li>铅笔</li><li>笔记本</li><li>钢笔</li>"',
        expectedOutput: '铅笔\n笔记本\n钢笔'
      },
      {
        id: 'sp_parse_q4',
        type: 'order',
        question: '把下面「用 BeautifulSoup 解析网页」的步骤排正确。',
        items: ['先拿到 resp.text 网页 HTML 文本', '传给 BeautifulSoup 做解析', '用 find_all 找到目标标签', '用 .text 取出标签里的纯文字'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先有 HTML 文本，再交给 BeautifulSoup 解析，find_all 找标签，最后 .text 取文字。'
      }
    ]
  },
  {
    topicId: 'sp_ethics',
    questions: [
      {
        id: 'sp_ethics_q1',
        type: 'multi',
        question: '下面哪些是礼貌、合规的爬虫做法？（多选）',
        options: [
          '请求之间加延时，不给服务器造成压力',
          '遵守网站 robots.txt 的约定',
          '抓取并公开用户手机号、身份证号',
          '不绕过付费墙和登录限制'
        ],
        answerIndexes: [0, 1, 3],
        explanation: '个人隐私数据不能抓取；控制频率、遵守协议、不绕过付费是底线。'
      },
      {
        id: 'sp_ethics_q2',
        type: 'choice',
        question: '用 time.sleep(1) 的目的是？',
        options: ['让程序睡一觉', '降低请求频率，减轻服务器压力', '加快网速', '隐藏爬虫身份'],
        answerIndex: 1,
        explanation: '两次请求之间等待，避免高频访问压垮对方服务器。'
      },
      {
        id: 'sp_ethics_q3',
        type: 'code',
        question: '模拟抓取 3 个页面，逐行打印「正在抓取: 页面名」，最后打印总页数。',
        starterCode: '# 任务：遍历 ["页面A","页面B","页面C"] 并打印进度\nurls = ["页面A", "页面B", "页面C"]',
        expectedOutput: '正在抓取: 页面A\n正在抓取: 页面B\n正在抓取: 页面C\n抓取完成，共 3 页'
      }
    ]
  }
];
