import { TutorialStage, TutorialTopic } from '../../tutorialData';

// 爬虫和数据分析系列 · 阶段二：网络与网页基础
export const spStage2: TutorialStage = {
  id: 'sp_stage2',
  title: '网络与网页基础',
  icon: 'travel_explore',
  topics: [
    {
      id: 'sp_http',
      title: 'HTTP 请求与响应',
      stage: '爬虫和数据分析 > 网络与网页',
      summary: '浏览器和服务器之间一问一答：你发一个请求，服务器返回一个响应。爬虫就是自动做这件事。',
      content: {
        overview: '打开一个网页时，你的浏览器其实在做一件事：向服务器发送一个请求（Request），服务器处理后返回一个响应（Response）。理解这个「一问一答」，就理解了爬虫的原理——爬虫只是用程序代替浏览器自动发送请求、接收返回内容。',
        sections: [
          { heading: '请求里有什么', text: '就像去餐厅点菜：你（浏览器）跟服务员说「要一份宫保鸡丁」（请求），厨房做好后服务员端给你（响应）。爬虫就是一个能自动点菜、自动接菜的机器人。\n\n一个 HTTP 请求主要包含：\n• 请求方法：GET（获取数据，最常见）、POST（提交数据）。\n• 网址 URL：要访问哪个页面。\n• 请求头（Headers）：告诉服务器我是谁、能接受什么格式。\n爬虫发出的请求和浏览器几乎一样，只是用代码自动完成。',
            table: {
              headers: ['组成部分', '作用', '示例'],
              rows: [
                ['请求方法', '告诉服务器要做什么', 'GET 获取页面，POST 提交表单'],
                ['URL', '要访问的地址', 'https://example.com/users'],
                ['请求头', '声明身份与格式', 'User-Agent 标识浏览器'],
                ['响应状态码', '表示成功与否', '200 成功，404 页面不存在，403 被拒绝']
              ]
            }
          },
          {
            heading: '用字典模拟一次问答',
            text: '下面用 Python 字典模拟请求和响应，帮你建立「一问一答」的直观认识。真实爬虫用 requests 库发送，需在本机 Python 环境安装后运行。',
            code: `# 模拟浏览器发出的请求\nrequest = {\n    "method": "GET",\n    "url": "https://example.com/users",\n    "headers": {"User-Agent": "Python-learning"}\n}\n\n# 服务器返回的响应\nresponse = {\n    "status_code": 200,\n    "body": "用户名: 小林, 小陈, 小王"\n}\n\nprint("请求方法:", request["method"])\nprint("响应状态:", response["status_code"])\nprint("响应内容:", response["body"])`
          },
          {
            heading: '常见状态码',
            text: '服务器返回的三位数字告诉你结果：\n• 200：成功\n• 404：要访问的页面不存在\n• 403：没有权限（被网站拒绝）\n• 500：服务器内部出错\n爬虫遇到 403/404 就要处理，不能盲目继续抓。',
            notes: '本应用内置的运行环境无法真正联网发请求，以上代码用字典模拟了请求与响应的结构。'
          },
        ],
        codeExample: `request = {"method": "GET", "url": "https://example.com/book/42"}\nresponse = {"status_code": 200, "body": "《西游记》价格 45 元"}\n\nprint("访问:", request["url"])\nprint("状态:", response["status_code"])\nprint("内容:", response["body"])`,
        takeaways: [
          'HTTP 是请求-响应模式：客户端发请求，服务器返回响应',
          '请求含方法（GET/POST）、URL、请求头',
          '响应含状态码和内容体',
          '200 成功、404 页面不存在、403 无权限、500 服务器错误'
        ],
        tips: [
          '真实抓取要用 requests 库，需在本机 Python 环境安装（pip install requests）后运行。',
          '写爬虫时先打印状态码，确认是 200 再解析内容。'
        ]
      }
    },
    {
      id: 'sp_html',
      title: '网页的 HTML 结构',
      stage: '爬虫和数据分析 > 网络与网页',
      summary: '网页内容写在 HTML 标签里，爬虫要做的就是从这些标签中把数据挑出来。',
      content: {
        overview: '浏览器看到的漂亮网页，本质是一份用 HTML 标签写的纯文本。标题在 <h1> 标签里、表格在 <table> 里、链接在 <a> 里。爬虫的第二步，就是下载这份 HTML 后，从中提取想要的数据。',
        sections: [
          { heading: '常用 HTML 标签', text: '网页像一份用不同颜色信封分类的信件：标题信封装在 <h1> 里、正文装在 <p> 里、表格装在 <table> 里。爬虫要做的就是拆开信封、取出里面的文字。\n\n不需要记住所有标签，认识这几个高频的就够：',
            table: {
              headers: ['标签', '含义', '示例内容'],
              rows: [
                ['<h1>~<h6>', '各级标题', '<h1>奶茶价格榜</h1>'],
                ['<p>', '段落正文', '<p>苹果 5 元</p>'],
                ['<a href="">', '链接', '<a href="/shop">进店</a>'],
                ['<table>', '表格', '内含 <tr> 行、<td> 单元格'],
                ['<div>', '区块容器', '用来划分页面区域'],
                ['<ul>/<li>', '无序列表/列表项', '<li>苹果</li>']
              ]
            }
          },
          {
            heading: '一段真实网页长这样',
            text: '下面是一段简化的 HTML，注意数据「苹果 5 元」就藏在 <td> 标签之间：',
            code: `html = """\n<table>\n  <tr><td>苹果</td><td>5</td></tr>\n  <tr><td>香蕉</td><td>3</td></tr>\n</table>\n"""\n# 数一下里面有几个 <tr>（即几行数据）\nprint("数据行数:", html.count("<tr>"))\nprint("文本内容预览:")\nprint(html.strip())`
          },
        ],
        codeExample: `html = "<ul><li>铅笔</li><li>笔记本</li><li>钢笔</li></ul>"\nprint("列表项数量:", html.count("<li>"))\nprint("HTML 原文:")\nprint(html)`,
        takeaways: [
          '网页本质是 HTML 标签构成的纯文本',
          '常见标签：h1 标题、p 段落、a 链接、table/tr/td 表格、li 列表项',
          '爬虫下载 HTML 后要从中定位并提取目标数据',
          'BeautifulSoup 是常用的 HTML 解析库（本机运行）'
        ],
        tips: [
          '在浏览器网页上右键选「查看网页源代码」就能看到原始 HTML。',
          '不用背全部标签，认识高频的几个即可，解析时查文档。'
        ]
      }
    },
    {
      id: 'sp_requests',
      title: '用 requests 抓取网页',
      stage: '爬虫和数据分析 > 网络与网页',
      summary: 'requests 是 Python 最常用的网页抓取库，三行代码就能拿到网页内容。需在本机 Python 环境运行。',
      content: {
        overview: '前面用字典模拟了请求，真实抓取要用 requests 库。它把发请求、收响应简化成几行代码。注意：requests 需要联网和本机 Python 环境，本应用内置的离线环境无法真正抓取，这里学习写法，到本机运行。',
        sections: [
          { heading: '基本用法', text: 'requests 就像一个自动帮你跑餐厅点菜的服务员：你给它一个网址，它替你去服务器那里把页面内容端回来。\n\n典型写法（需本机运行）：\nimport requests\nresp = requests.get("网址")\nprint(resp.status_code)\nprint(resp.text)\nresp.text 就是网页的 HTML 文本，之后再用 BeautifulSoup 解析。',
            code: `# 以下代码需在本机 Python 环境（已 pip install requests）联网运行\n# import requests\n# resp = requests.get("https://example.com")\n# print(resp.status_code)   # 200 表示成功\n# print(resp.text[:200])    # 打印前 200 个字符看内容`,
            notes: '这整段代码被注释掉了，因为本应用内无法联网。在本机终端运行时，去掉每行开头的 # 即可。'
          },
          {
            heading: '常用参数',
            text: '实际抓取时常用：\n• params：URL 后面的查询参数，如搜索关键词。\n• headers：伪装请求头，带上浏览器标识。\n• timeout：超时秒数，避免一直干等。\n抓到内容后要判断状态码是 200 再继续。',
            table: {
              headers: ['操作', '写法', '作用'],
              rows: [
                ['GET 请求', 'requests.get(url)', '获取网页内容'],
                ['带参数', 'requests.get(url, params={"q":"python"})', '在 URL 后附加查询参数'],
                ['请求头', 'requests.get(url, headers={"User-Agent":"..."})', '标识客户端身份'],
                ['超时', 'requests.get(url, timeout=10)', '超过 10 秒报错，避免卡死'],
                ['查看内容', 'resp.text', '拿到 HTML 文本'],
                ['JSON 接口', 'resp.json()', '把返回的 JSON 转成字典']
              ]
            }
          },
        ],
        codeExample: `# 本机运行示例：\n# import requests\n# resp = requests.get("https://example.com", timeout=10)\n# print("状态码:", resp.status_code)\n# print("内容长度:", len(resp.text))`,
        takeaways: [
          'requests.get(url) 发送 GET 请求并拿回响应',
          'resp.status_code 判断成功与否，resp.text 是 HTML 文本',
          'params/headers/timeout 是常用参数',
          '该库需 pip install requests，且必须联网，在本机环境运行'
        ],
        tips: [
          '本应用内置环境不能联网，真实抓取请在本机终端运行。',
          '请求一定加 timeout，否则网络出问题时程序会无限等待。'
        ]
      }
    },
    {
      id: 'sp_parse',
      title: '从网页中提取数据',
      stage: '爬虫和数据分析 > 网络与网页',
      summary: '拿到 HTML 后用选择器定位标签、提取文字。理解思路即可，工具需本机安装。',
      content: {
        overview: '抓到网页 HTML 后，下一步是从一大堆标签里挑出想要的数据。手工用字符串查找很麻烦，常用 BeautifulSoup 这类库帮忙定位。这一课学习提取的思路，代码需本机运行。',
        sections: [
          { heading: '提取思路', text: '面对一整页 HTML，提取数据就像在一本厚书里按目录找章节：先定位「所有表格行」，再逐行取出单元格文字，最后整理成表格。\n\n一般三步：\n1. 把 HTML 文本交给解析器（BeautifulSoup）。\n2. 用选择器找到目标标签（如所有 <tr>）。\n3. 遍历取出每个标签的文字，拼成列表或字典。',
            code: `# 用纯字符串模拟「从 HTML 里提取数据」的思路\nhtml = "<tr><td>苹果</td><td>5</td></tr><tr><td>香蕉</td><td>3</td></tr>"\n\n# 按 </tr> 切分成每一行\nrows = html.split("</tr>")\nprint("切出的行数:", len([r for r in rows if r.strip()]))\n\n# 提取所有 <td> 之间的文字（示意）\nimport re\ncells = re.findall(r"<td>(.*?)</td>", html)\nprint("单元格内容:", cells)`
          },
          {
            heading: 'BeautifulSoup 写法（本机）',
            text: '真实项目用 BeautifulSoup 更简洁，典型写法（需本机 pip install beautifulsoup4）：\nfrom bs4 import BeautifulSoup\nsoup = BeautifulSoup(html, "html.parser")\nfor tr in soup.find_all("tr"):\n    print([td.text for td in tr.find_all("td")])',
            notes: '上面的 find_all 思路和我们手动切字符串完全一致，只是库帮你处理了标签嵌套和异常情况。'
          },
        ],
        codeExample: `import re\nhtml = "<li>铅笔</li><li>笔记本</li><li>钢笔</li>"\nitems = re.findall(r"<li>(.*?)</li>", html)\nprint("共", len(items), "项:")\nfor item in items:\n    print(item)`,
        takeaways: [
          '提取数据：解析 HTML → 定位目标标签 → 遍历取文字',
          'BeautifulSoup 的 find_all("标签") 找到所有指定标签',
          '每个标签的 .text 属性取出其中的纯文字',
          '该库需本机安装，本应用内用 re 模块模拟思路'
        ],
        tips: [
          '正则 re.findall 适合简单提取；标签嵌套复杂时用 BeautifulSoup。',
          '提取后的数据往往还要清洗：去空格、转数字、处理缺失。'
        ]
      }
    },
    {
      id: 'sp_ethics',
      title: '爬虫礼貌与合规',
      stage: '爬虫和数据分析 > 网络与网页',
      summary: '爬虫不能想抓就抓：要尊重网站负担、遵守规则，否则可能违法或被封。',
      content: {
        overview: '写爬虫不只是技术问题。请求太频繁会把对方服务器搞垮，抓取受保护的数据可能违法。这一课讲爬虫的底线，让你做一个「有礼貌」的爬虫。',
        sections: [
          { heading: '几条基本底线', text: '你去图书馆查资料，不能把整本书一页页拍下来抢走，也不能一秒钟翻一百页让管理员忙不过来。爬虫对网站也是一样：控制速度、遵守规矩、不碰隐私数据。\n\n1. 控制频率：两次请求之间 sleep 一会儿，别并发几十个请求把服务器压垮。\n2. 遵守 robots 协议：网站根目录的 robots.txt 会说明哪些路径不允许抓取。\n3. 不碰隐私数据：个人手机号、身份证、住址等不能抓。\n4. 不绕过登录和付费：需要登录或付费才能看的内容，不要用技术手段绕过。\n5. 注明来源：公开发布抓取的数据时说明出处。',
            table: {
              headers: ['做法', '是否合适', '原因'],
              rows: [
                ['每秒请求一次并加间隔', '合适', '不给服务器造成压力'],
                ['一秒发 100 个请求', '不合适', '可能压垮对方服务'],
                ['抓取公开商品价格做分析', '一般合适', '公开信息、非个人隐私'],
                ['抓取用户手机号通讯录', '违法', '侵犯个人信息'],
                ['绕过付费墙看文章', '不合适', '违反服务条款']
              ]
            }
          },
        ],
        codeExample: `import time\n\n# 礼貌爬虫的节奏：抓一个停一下\nurls = ["页面A", "页面B", "页面C"]\nfor u in urls:\n    print("正在抓取:", u)\n    time.sleep(1)   # 每次请求后等 1 秒，减轻服务器压力\nprint("抓取完成，共", len(urls), "页")`,
        takeaways: [
          '控制请求频率，两次之间加延时，别压垮服务器',
          '遵守网站 robots.txt 的抓取约定',
          '不抓取个人隐私数据，不绕过登录和付费墙',
          '公开发布数据时注明来源'
        ],
        tips: [
          'time.sleep(1) 是最简单的礼貌做法，实际可根据网站承受力调整。',
          '拿不准能不能抓时，优先看网站的服务条款和 robots.txt。'
        ]
      }
    }
  ]
};
