import { TutorialStage } from '../../tutorialData';

// Web 系列 · 阶段一：Web 与 HTTP 基础
export const webStage1: TutorialStage = {
  id: 'web_stage1',
  title: 'Web 与 HTTP 基础',
  icon: 'language',
  topics: [
    {
      id: 'web_what',
      title: '什么是 Web',
      stage: 'Web > Web 基础',
      summary: 'Web 就是浏览器和服务器之间通过 HTTP 交换数据的系统，理解一次访问发生了什么。',
      content: {
        overview: '每天都在打开网页、刷手机，但 Web 背后到底发生了什么？简单说：你的浏览器是客户端，远方一台服务器存着网页和数据，两者通过 HTTP 协议一问一答。这一课建立整体认识，为后面学写后端和调用接口打基础。',
        sections: [
          { heading: '客户端与服务器', text: 'Web 像点外卖：你在手机 App（客户端）下单，餐厅（服务器）做好后送来。区别在于，浏览器每次打开网页都是重新问服务器要一次内容，服务器只负责把数据发回来。\n\nWeb 的两端：\n• 客户端（Client）：你用的浏览器、手机 App，负责发起请求、展示界面。\n• 服务器（Server）：24 小时在线的计算机，存着网页和数据，负责响应请求。\n两端通过 HTTP（超文本传输协议）通信，约定好用什么格式发请求、怎么回响应。',
            table: {
              headers: ['角色', '角色名', '做什么'],
              rows: [
                ['浏览器 / App', '客户端', '发请求、渲染界面、接收数据'],
                ['远方服务器', '服务端', '存数据、处理业务、返回结果'],
                ['HTTP', '通信协议', '规定请求和响应的格式']
              ]
            }
          },
          {
            heading: '一次访问发生了什么',
            text: '在地址栏输入网址回车后：\n1. 浏览器把网址翻译成服务器地址。\n2. 向服务器发出 HTTP 请求。\n3. 服务器找到对应资源，返回响应（网页 HTML 或数据）。\n4. 浏览器把 HTML 渲染成你看到的页面。\n后面学的「接口」就是服务器返回结构化数据（而非整页 HTML）给程序用。',
            code: `# 用字典模拟一次浏览器与服务器的对话\nbrowser = "请求: GET /index.html"\nserver = "响应: 200 OK, 返回首页网页内容"\n\nprint("浏览器发出:", browser)\nprint("服务器返回:", server)`
          },
        ],
        codeExample: `request = "GET /users/profile"\nresponse = "200 OK, 用户资料数据"\nprint("客户端发送:", request)\nprint("服务器返回:", response)`,
        takeaways: [
          'Web 由客户端（浏览器）和服务器组成，通过 HTTP 通信',
          '客户端发起请求，服务器返回响应',
          '一次网页访问就是一次请求-响应循环',
          '接口是服务器返回结构化数据给程序用的方式'
        ],
        tips: [
          '不用急着学写后端，先理解请求和响应长什么样更重要。',
          '浏览器按 F12 打开开发者工具，在 Network 标签能看到每次请求。'
        ]
      }
    },
    {
      id: 'web_url',
      title: '看懂 URL',
      stage: 'Web > Web 基础',
      summary: '网址由协议、域名、路径、参数组成，看懂它就知道浏览器在请求什么。',
      content: {
        overview: 'URL（统一资源定位符）就是网址，比如 https://example.com/users?id=1。它不是一串乱码，而是有结构的：协议、域名、路径、查询参数。学会拆解 URL，就能看懂浏览器到底在请求什么。',
        sections: [
          { heading: 'URL 的组成部分', text: 'URL 像一个完整收件地址：https 是「用什么快递」，example.com 是「哪个城市」，/users 是「哪条街」，?id=1 是「门牌号」。拼起来就能找到唯一资源。\n\n以 https://example.com/users?id=1&sort=name 为例：\n• https：协议（http 是明文，https 是加密）。\n• example.com：域名，服务器的名字。\n• /users：路径，请求服务器上的哪个资源。\n• ?id=1&sort=name：查询参数，传给服务器的附加条件。',
            table: {
              headers: ['部分', '示例', '含义'],
              rows: [
                ['协议', 'https://', '数据传输方式，https 加密'],
                ['域名', 'example.com', '服务器地址'],
                ['路径', '/users', '请求哪个资源'],
                ['查询参数', '?id=1&sort=name', '附加条件，键值对用 & 连接']
              ]
            }
          },
          {
            heading: '拆解一个 URL',
            text: 'Python 标准库 urllib.parse 能自动拆解 URL。下面这段代码离线运行，把一个 URL 拆成各部分。',
            code: `from urllib.parse import urlparse, parse_qs\n\nurl = "https://example.com/users?id=1&sort=name"\nparts = urlparse(url)\nprint("协议:", parts.scheme)\nprint("域名:", parts.netloc)\nprint("路径:", parts.path)\nprint("参数:", parts.query)`
          },
        ],
        codeExample: `from urllib.parse import urlparse\n\nurl = "https://shop.com/products?category=book&page=2"\np = urlparse(url)\nprint("域名:", p.netloc)\nprint("路径:", p.path)\nprint("查询串:", p.query)`,
        takeaways: [
          'URL 由协议、域名、路径、查询参数四部分组成',
          '查询参数以 ? 开头，多个键值对用 & 连接',
          'https 是加密传输，http 是明文',
          'urllib.parse.urlparse 可自动拆解 URL'
        ],
        tips: [
          '浏览器地址栏里的内容就是 URL，试着拆解一个常去网站的网址。',
          '参数 ?id=1 表示要 id 为 1 的资源，是最常见的查询方式。'
        ]
      }
    },
    {
      id: 'web_status',
      title: 'HTTP 状态码',
      stage: 'Web > Web 基础',
      summary: '三位数字告诉你请求成功了还是哪里出了错，2xx 成功、3xx 跳转、4xx 客户端错、5xx 服务器错。',
      content: {
        overview: '每次响应都带一个三位数字的状态码，它是服务器给你的「回执」：200 表示成功，404 表示页面不存在，500 表示服务器自己出错了。看懂状态码，遇到问题就知道该找谁。',
        sections: [
          { heading: '状态码按开头数字分类', text: '状态码像快递状态：已签收（200）、地址不存在（404）、拒收（403）、仓库着火（500）。看到数字就知道快递卡在哪一环。\n\n第一位数字代表大类：\n• 2xx：成功（200 最常见）。\n• 3xx：重定向，页面搬走了。\n• 4xx：客户端错误，是你请求的问题（404 不存在、403 无权限）。\n• 5xx：服务器错误，是对方的问题（500 内部错误）。',
            table: {
              headers: ['状态码', '含义', '常见原因'],
              rows: [
                ['200 OK', '成功', '正常返回内容'],
                ['301/302', '永久/临时跳转', '网址换了'],
                ['400 Bad Request', '请求格式错误', '参数写错'],
                ['403 Forbidden', '拒绝访问', '没有权限'],
                ['404 Not Found', '资源不存在', '网址路径错了'],
                ['500 Internal Error', '服务器内部错误', '服务端代码出错'],
                ['503', '服务暂不可用', '服务器忙或维护中']
              ]
            }
          },
        ],
        codeExample: `# 模拟根据状态码给出提示\nstatus = 404\nif status == 200:\n    print("请求成功")\nelif status == 404:\n    print("页面不存在，请检查网址")\nelif status >= 500:\n    print("服务器出错，请稍后再试")\nelse:\n    print("请求异常，状态码:", status)`,
        takeaways: [
          '状态码是服务器返回的三位数字回执',
          '2xx 成功、3xx 跳转、4xx 客户端错误、5xx 服务器错误',
          '404 资源不存在，403 无权限，500 服务器内部错误',
          '程序应先判断状态码，成功了再解析返回数据'
        ],
        tips: [
          '看到 4xx 先检查自己的请求（网址、参数、登录）；看到 5xx 才是对方服务器的问题。',
          '浏览器 F12 的 Network 面板能看到每个请求的状态码。'
        ]
      }
    },
    {
      id: 'web_headers',
      title: '请求头与常见头',
      stage: 'Web > Web 基础',
      summary: '请求头是请求附带的说明信息，告诉服务器我是谁、能接受什么格式。',
      content: {
        overview: '请求除了网址和参数，还会带一组「请求头」（Headers），它是附加的说明信息：我是什么浏览器、能接受什么语言、是否带登录凭证。理解常见请求头，才能正确调用接口。',
        sections: [
          { heading: '常见请求头', text: '请求头像你进图书馆时的读者证：上面写着你是谁、能借什么类型的书。服务器看了请求头才知道怎么正确回应你。\n\n几个高频请求头：\n• User-Agent：客户端标识（什么浏览器）。\n• Content-Type：发送数据的格式（通常是 application/json）。\n• Accept：希望服务器返回什么格式。\n• Authorization：登录凭证（令牌），证明你已登录。',
            table: {
              headers: ['请求头', '作用', '示例值'],
              rows: [
                ['User-Agent', '标识客户端', 'Mozilla/5.0 (浏览器)'],
                ['Content-Type', '发送数据格式', 'application/json'],
                ['Accept', '期望返回格式', 'application/json'],
                ['Authorization', '登录凭证', 'Bearer 令牌字符串']
              ]
            }
          },
          {
            heading: '用字典表示请求头',
            text: '在 Python 里，请求头就是一个字典。下面模拟一个带登录凭证的请求头。',
            code: `headers = {\n    "User-Agent": "Python-learning/1.0",\n    "Content-Type": "application/json",\n    "Authorization": "Bearer my-token-123"\n}\n\nprint("请求头字段数:", len(headers))\nprint("内容类型:", headers["Content-Type"])\nprint("是否带凭证:", "Authorization" in headers)`
          },
        ],
        codeExample: `headers = {\n    "Accept": "application/json",\n    "User-Agent": "Python-learning/1.0"\n}\nprint("接受格式:", headers["Accept"])\nprint("客户端标识:", headers["User-Agent"])`,
        takeaways: [
          '请求头是请求附带的元信息，告诉服务器客户端情况',
          '常用头：User-Agent、Content-Type、Accept、Authorization',
          '需要登录的接口要在 Authorization 头带令牌',
          'Python 中请求头用字典表示'
        ],
        tips: [
          '调用别人的 API 时，文档会说明需要哪些请求头。',
          '不要把真实的登录令牌硬编码到公开代码里。'
        ]
      }
    },
    {
      id: 'web_json',
      title: 'JSON 数据格式',
      stage: 'Web > Web 基础',
      summary: 'JSON 是 Web 上最常用的数据交换格式，长的很像 Python 字典。',
      content: {
        overview: '服务器返回给程序的数据，绝大多数是 JSON 格式。它长得和 Python 字典几乎一样：用花括号包键值对，用方括号包列表。学会 JSON，就拿到了 Web 数据的通用语言。',
        sections: [
          { heading: 'JSON 长什么样', text: '如果说 HTML 是给人看的网页排版，JSON 就是给程序看的数据表格：结构清晰、机器好解析。接口返回的数据基本都是 JSON。\n\nJSON 的规则：\n• 对象用 {}，键值对用 "键": 值。\n• 数组用 []。\n• 字符串用双引号，数字直接写，true/false/null 对应 Python 的 True/False/None。\n注意：JSON 的键和字符串必须用双引号，不能用单引号。',
            code: `# 一段典型的 JSON 文本（注意全是双引号）\njson_text = '{"name": "小林", "age": 16, "scores": [88, 92, 75]}'\nprint("原始 JSON 文本:")\nprint(json_text)`
          },
          {
            heading: 'JSON 和 Python 类型对照',
            text: 'JSON 和 Python 数据类型几乎一一对应：',
            table: {
              headers: ['JSON', 'Python', '示例'],
              rows: [
                ['对象 {}', '字典 dict', '{"name": "小林"}'],
                ['数组 []', '列表 list', '[1, 2, 3]'],
                ['字符串', 'str', '"hello"'],
                ['数字', 'int / float', '42、3.14'],
                ['true / false', 'True / False', 'true'],
                ['null', 'None', 'null']
              ]
            }
          },
        ],
        codeExample: `json_text = '{"city": "上海", "temperature": 26, "rainy": false}'\nprint("服务器返回的 JSON:")\nprint(json_text)`,
        takeaways: [
          'JSON 是 Web 上最常用的数据交换格式',
          '对象用 {}、数组用 []，键和字符串用双引号',
          'JSON 的 true/false/null 对应 Python 的 True/False/None',
          '接口返回的数据基本都是 JSON'
        ],
        tips: [
          'JSON 文本里不能有单引号包字符串，这是新手常错点。',
          '下一课学 json 模块，把 JSON 文本转成 Python 字典来用。'
        ]
      }
    },
    {
      id: 'web_rest',
      title: 'REST API 概念',
      stage: 'Web > Web 基础',
      summary: 'API 是服务器给程序用的接口，REST 是一套常见的设计风格：用 URL 表示资源，用方法表示操作。',
      content: {
        overview: 'API（应用程序接口）就是服务器开放给程序用的「窗口」：你请求一个网址，它返回 JSON 数据。REST 是目前最流行的 API 设计风格，它约定用 URL 表示资源、用 HTTP 方法表示要做什么操作。',
        sections: [
          { heading: 'URL 表示资源，方法表示操作', text: 'API 像餐厅的取餐口：你不用进厨房，只要对着窗口说「我要 1 号套餐」（请求），服务员把餐递给你（响应）。REST 就是约定取餐口的点餐话术。\n\nREST 的核心约定：\n• URL 指向资源，如 /users 表示用户集合、/users/1 表示 1 号用户。\n• HTTP 方法表示操作：GET 查、POST 增、PUT 改、DELETE 删。',
            table: {
              headers: ['请求', '操作', '含义'],
              rows: [
                ['GET /users', '查询', '获取用户列表'],
                ['GET /users/1', '查询', '获取 1 号用户'],
                ['POST /users', '新增', '创建一个用户'],
                ['PUT /users/1', '修改', '更新 1 号用户'],
                ['DELETE /users/1', '删除', '删除 1 号用户']
              ]
            }
          },
        ],
        codeExample: `# 模拟一个 REST 风格的接口请求\nendpoint = "/users/1"\nmethod = "GET"\nprint(f"请求 {method} {endpoint} → 返回该用户的 JSON 数据")`,
        takeaways: [
          'API 是服务器开放给程序调用的接口，返回 JSON',
          'REST 用 URL 表示资源（/users/1）',
          '用 HTTP 方法表示操作：GET 查、POST 增、PUT 改、DELETE 删',
          '看懂这套约定就能读懂大多数 API 文档'
        ],
        tips: [
          '实际调用 API 需要联网和 requests 库，在本机 Python 环境运行。',
          '接口文档通常列出每个端点的 URL、方法、参数和返回示例。'
        ]
      }
    }
  ]
};
