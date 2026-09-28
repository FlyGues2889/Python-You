// web 系列测验组：追加到 quizData.ts 的 TOPIC_QUIZZES 数组中
import type { TopicQuiz } from '../quizData';

export const webQuizzes: TopicQuiz[] = [
  {
    topicId: 'web_what',
    questions: [
      {
        id: 'web_what_q1',
        type: 'choice',
        question: '在 Web 架构中，浏览器属于？',
        options: ['客户端', '服务器', '数据库', '路由器'],
        answerIndex: 0,
        explanation: '浏览器是客户端，负责发请求和渲染；远方服务器存数据、回响应。'
      },
      {
        id: 'web_what_q2',
        type: 'choice',
        question: '客户端和服务器之间通过什么协议通信？',
        options: ['FTP', 'HTTP', 'SMTP', 'SSH'],
        answerIndex: 1,
        explanation: 'Web 基于 HTTP（超文本传输协议）交换数据。'
      },
      {
        id: 'web_what_q3',
        type: 'code',
        question: '模拟一次请求响应：请求 "GET /users/profile"，响应 "200 OK, 用户资料数据"，分两行打印。',
        starterCode: '# 任务：打印客户端发送与服务器返回两行',
        expectedOutput: '客户端发送: GET /users/profile\n服务器返回: 200 OK, 用户资料数据'
      },
      {
        id: 'web_what_q4',
        type: 'multi',
        question: '关于 Web 的客户端/服务器架构，下面哪些说法正确？（多选）',
        options: ['浏览器是客户端', '服务器负责存放数据并返回响应', '两者之间用 HTTP 协议通信', '服务器会主动给浏览器发请求'],
        answerIndexes: [0, 1, 2],
        explanation: '浏览器是客户端，服务器存数据，用 HTTP 通信；通常是客户端先发请求，服务器再响应。'
      }
    ]
  },
  {
    topicId: 'web_url',
    questions: [
      {
        id: 'web_url_q1',
        type: 'choice',
        question: 'URL 中查询参数以哪个符号开头？',
        options: ['#', '?', '@', '&'],
        answerIndex: 1,
        explanation: '? 后是键值对参数，多个参数用 & 连接。'
      },
      {
        id: 'web_url_q2',
        type: 'choice',
        question: '网址 https://shop.com/products?page=2 中，路径是？',
        options: ['https', 'shop.com', '/products', 'page=2'],
        answerIndex: 2,
        explanation: '域名是 shop.com，路径是 /products，? 后是参数。'
      },
      {
        id: 'web_url_q3',
        type: 'code',
        question: '用 urllib.parse.urlparse 拆解 https://shop.com/products?category=book&page=2，打印域名和路径。',
        starterCode: '# 任务：urlparse 后打印 netloc 和 path\nfrom urllib.parse import urlparse',
        expectedOutput: '域名: shop.com\n路径: /products'
      },
      {
        id: 'web_url_q4',
        type: 'blank',
        question: '补全：URL 里查询参数以符号 ____ 开头；多个参数之间用符号 ____ 连接。',
        blanks: [['?'], ['&']],
        explanation: '? 后是键值对参数，例如 ?page=2；多个参数用 & 连接，如 ?page=2&size=10。'
      }
    ]
  },
  {
    topicId: 'web_status',
    questions: [
      {
        id: 'web_status_q1',
        type: 'choice',
        question: '状态码 200 表示？',
        options: ['页面不存在', '请求成功', '服务器错误', '重定向'],
        answerIndex: 1,
        explanation: '2xx 表示成功，200 是最常见的成功状态码。'
      },
      {
        id: 'web_status_q2',
        type: 'choice',
        question: '看到状态码 500，应该判断为？',
        options: ['自己的请求写错了', '服务器内部出错', '页面不存在', '网络断了'],
        answerIndex: 1,
        explanation: '5xx 是服务器端错误；4xx 才是客户端请求的问题。'
      },
      {
        id: 'web_status_q3',
        type: 'code',
        question: '给定状态码 404，按规则打印「页面不存在，请检查网址」。',
        starterCode: '# 任务：status=404 时打印对应提示\nstatus = 404',
        expectedOutput: '页面不存在，请检查网址'
      },
      {
        id: 'web_status_q4',
        type: 'multi',
        question: '关于 HTTP 状态码的含义，下面哪些说法正确？（多选）',
        options: ['2xx 开头表示请求成功', '3xx 开头表示重定向', '4xx 开头表示客户端请求有问题', '5xx 开头表示服务器内部出错'],
        answerIndexes: [0, 1, 2, 3],
        explanation: '按首位数字分类：2 成功、3 重定向、4 客户端错误、5 服务器错误。'
      }
    ]
  },
  {
    topicId: 'web_headers',
    questions: [
      {
        id: 'web_headers_q1',
        type: 'choice',
        question: '需要登录的接口通常在哪个请求头里带令牌？',
        options: ['User-Agent', 'Authorization', 'Accept', 'Host'],
        answerIndex: 1,
        explanation: 'Authorization 头携带登录凭证（如 Bearer 令牌）。'
      },
      {
        id: 'web_headers_q2',
        type: 'choice',
        question: '在 Python 中，请求头通常用什么表示？',
        options: ['列表', '字典', '元组', '集合'],
        answerIndex: 1,
        explanation: '请求头是键值对，用字典表示。'
      },
      {
        id: 'web_headers_q3',
        type: 'code',
        question: '构造请求头字典 {Accept: application/json, User-Agent: Python-learning/1.0}，打印这两个字段的值。',
        starterCode: '# 任务：构造 headers 并打印 Accept 和 User-Agent',
        expectedOutput: '接受格式: application/json\n客户端标识: Python-learning/1.0'
      },
      {
        id: 'web_headers_q4',
        type: 'blank',
        question: '补全：请求头是键值对，在 Python 里用 ____ 这种结构表示；登录令牌通常放在 ____ 这个请求头里。',
        blanks: [['字典'], ['Authorization']],
        explanation: '请求头用字典表示；Authorization 头携带登录凭证（如 Bearer 令牌）。'
      },
      {
        id: 'web_headers_q5',
        type: 'order',
        question: '把下面「发一个带登录令牌的请求」的步骤排正确。',
        items: ['准备好要访问的 URL', '构造 headers 字典，放入 Authorization 令牌', '用 requests.get(url, headers=headers) 发请求', '检查状态码并处理返回数据'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先有 URL，再把令牌放进 headers，带着 headers 发请求，最后处理响应。'
      }
    ]
  },
  {
    topicId: 'web_json',
    questions: [
      {
        id: 'web_json_q1',
        type: 'choice',
        question: 'JSON 中字符串必须使用哪种引号？',
        options: ['单引号', '双引号', '反引号', '中文引号'],
        answerIndex: 1,
        explanation: 'JSON 的键和字符串必须用双引号，单引号是错误的。'
      },
      {
        id: 'web_json_q2',
        type: 'choice',
        question: 'JSON 里的 true/false/null 对应 Python 的？',
        options: ['True/False/None', 'yes/no/nothing', '1/0/空', 'true/false/null（不变）'],
        answerIndex: 0,
        explanation: 'JSON 大小写敏感，解析后对应 Python 的 True/False/None。'
      },
      {
        id: 'web_json_q3',
        type: 'code',
        question: '打印一段 JSON 文本：城市上海、气温 26、不下雨。',
        starterCode: '# 任务：定义 json_text 并打印\njson_text = \'{"city": "上海", "temperature": 26, "rainy": false}\'',
        expectedOutput: '服务器返回的 JSON:\n{"city": "上海", "temperature": 26, "rainy": false}'
      },
      {
        id: 'web_json_q4',
        type: 'blank',
        question: '补全：JSON 里的字符串必须用 ____ 引号（填中文「单」或「双」）；JSON 的 true 解析到 Python 后变成 ____ 。',
        blanks: [['双'], ['True']],
        explanation: 'JSON 规范要求双引号；true/false/null 解析后对应 Python 的 True/False/None。'
      }
    ]
  },
  {
    topicId: 'web_rest',
    questions: [
      {
        id: 'web_rest_q1',
        type: 'choice',
        question: 'REST 风格中，删除 1 号用户用哪个请求？',
        options: ['GET /users/1', 'POST /users/1', 'DELETE /users/1', 'PUT /users/1'],
        answerIndex: 2,
        explanation: 'DELETE 表示删除资源，URL 指向具体资源 /users/1。'
      },
      {
        id: 'web_rest_q2',
        type: 'choice',
        question: 'POST /users 通常表示？',
        options: ['查询用户列表', '创建新用户', '删除用户', '修改用户'],
        answerIndex: 1,
        explanation: 'POST 到集合路径 /users 表示新建一个资源。'
      },
      {
        id: 'web_rest_q3',
        type: 'code',
        question: '模拟 REST 请求：方法 GET、端点 /users/1，打印「请求 GET /users/1 → 返回该用户的 JSON 数据」。',
        starterCode: '# 任务：按指定格式打印请求行',
        expectedOutput: '请求 GET /users/1 → 返回该用户的 JSON 数据'
      },
      {
        id: 'web_rest_q4',
        type: 'order',
        question: '把下面 REST 操作和对应请求排正确（按 查列表 → 新建 → 修改 → 删除 的顺序）。',
        items: ['GET /users 查询用户列表', 'POST /users 创建一个新用户', 'PUT /users/1 修改 1 号用户', 'DELETE /users/1 删除 1 号用户'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'GET 查、POST 增、PUT 改、DELETE 删，URL 指向要操作的资源。'
      }
    ]
  },
  {
    topicId: 'web_json_module',
    questions: [
      {
        id: 'web_json_module_q1',
        type: 'choice',
        question: '把 JSON 字符串解析成 Python 字典用哪个函数？',
        options: ['json.dumps()', 'json.loads()', 'json.parse()', 'json.decode()'],
        answerIndex: 1,
        explanation: 'loads 加载字符串为对象；dumps 把对象转成字符串。'
      },
      {
        id: 'web_json_module_q2',
        type: 'choice',
        question: 'json.dumps 时保留中文应加哪个参数？',
        options: ['ensure_ascii=False', 'encoding="utf-8"', 'unicode=True', 'cn=True'],
        answerIndex: 0,
        explanation: 'ensure_ascii=False 让中文原样输出，否则会转义成 \\uXXXX。'
      },
      {
        id: 'web_json_module_q3',
        type: 'code',
        question: '用 json.loads 解析 {"city": "上海", "population": 2487}，打印城市和人口。',
        starterCode: '# 任务：loads 后打印 city 与 population\nimport json',
        expectedOutput: '城市: 上海\n人口: 2487'
      },
      {
        id: 'web_json_module_q4',
        type: 'order',
        question: '把下面「处理接口返回的 JSON」的步骤排正确。',
        items: ['拿到接口返回的 JSON 字符串', '用 json.loads 解析成 Python 字典', '按键取出需要的数据', '改完后用 json.dumps 转回字符串'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先有字符串，loads 解析成字典，按键取值；要发回去时再 dumps 转回字符串。'
      }
    ]
  },
  {
    topicId: 'web_nested',
    questions: [
      {
        id: 'web_nested_q1',
        type: 'choice',
        question: 'data["students"][1]["name"] 表示？',
        options: ['students 的第一个学生姓名', 'students 的第二个学生姓名', '学生总数', 'name 这个键'],
        answerIndex: 1,
        explanation: '下标从 0 开始，[1] 是第二个元素；连续按键和下标逐层取值。'
      },
      {
        id: 'web_nested_q2',
        type: 'choice',
        question: '取嵌套字典里可能不存在的键，更安全的做法是？',
        options: ['直接 d["x"]', 'd.get("x", 默认值)', 'd.x', 'd.find("x")'],
        answerIndex: 1,
        explanation: 'get 取不到时返回默认值，避免 KeyError。'
      },
      {
        id: 'web_nested_q3',
        type: 'code',
        question: '解析 {"books": [{"title": "西游", "price": 45}, {"title": "三国", "price": 60}]}，逐行打印书名和价格。',
        starterCode: '# 任务：遍历 books 打印每个书名和价格\nimport json',
        expectedOutput: '西游 45\n三国 60'
      }
    ]
  },
  {
    topicId: 'web_api_call',
    questions: [
      {
        id: 'web_api_call_q1',
        type: 'choice',
        question: '用 requests 发请求后，正确的处理顺序是？',
        options: ['直接取数据 → 判断状态码', '判断状态码 200 → 解析数据', '先关闭连接', '先打印 URL'],
        answerIndex: 1,
        explanation: '必须先确认 status_code 为 200，再解析返回数据。'
      },
      {
        id: 'web_api_call_q2',
        type: 'choice',
        question: 'resp.json() 的作用是？',
        options: ['把响应转成 JSON 文件', '把返回体解析成 Python 字典', '打印响应', '检查状态码'],
        answerIndex: 1,
        explanation: 'resp.json() 等价于 json.loads(resp.text)，直接得到字典。'
      },
      {
        id: 'web_api_call_q3',
        type: 'code',
        question: '模拟响应 status_code=200、text 为 {"temp": 26, "weather": "晴"}，判断成功后打印气温和天气。',
        starterCode: '# 任务：mock 为字典，判断 200 后 loads 并打印\nimport json',
        expectedOutput: '气温: 26\n天气: 晴'
      },
      {
        id: 'web_api_call_q4',
        type: 'order',
        question: '把下面「调用 API 并取数据」的步骤排正确。',
        items: ['用 requests.get(url) 发出请求', '先判断 status_code 是否为 200', '用 resp.json() 把返回体解析成字典', '从字典里取出需要的字段使用'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先发请求，确认 200 成功，再解析 JSON，最后取字段；不能跳过状态码直接取数据。'
      }
    ]
  },
  {
    topicId: 'web_post',
    questions: [
      {
        id: 'web_post_q1',
        type: 'choice',
        question: '登录、发表留言这类提交数据的操作通常用？',
        options: ['GET', 'POST', 'HEAD', 'OPTIONS'],
        answerIndex: 1,
        explanation: 'POST 用于提交数据；GET 只用于查询。'
      },
      {
        id: 'web_post_q2',
        type: 'choice',
        question: '关于 GET 和 POST，正确的是？',
        options: [
          'POST 数据放在 URL 参数里',
          'GET 适合提交密码',
          'POST 数据放在请求体里，密码不应放 URL',
          '两者完全一样'
        ],
        answerIndex: 2,
        explanation: 'POST 数据在请求体，敏感信息不暴露在 URL。'
      },
      {
        id: 'web_post_q3',
        type: 'code',
        question: '模拟提交笔记后返回 {"id": 101, "ok": true}，解析并打印发布是否成功和新笔记编号。',
        starterCode: '# 任务：loads 返回文本后打印 ok 和 id\nimport json',
        expectedOutput: '发布成功: True\n新笔记编号: 101'
      },
      {
        id: 'web_post_q4',
        type: 'multi',
        question: '关于 GET 和 POST 的区别，下面哪些说法正确？（多选）',
        options: ['GET 的参数放在 URL 里', 'POST 的数据放在请求体里', '提交密码应该用 POST，不要放 URL', 'GET 和 POST 完全一样，随便用'],
        answerIndexes: [0, 1, 2],
        explanation: 'GET 参数在 URL、POST 数据在请求体；敏感信息（如密码）不能暴露在 URL。'
      }
    ]
  }
];
