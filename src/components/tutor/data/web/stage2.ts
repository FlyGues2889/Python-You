import { TutorialStage, TutorialTopic } from '../../tutorialData';

// Web 系列 · 阶段二：用 Python 处理 Web 数据
export const webStage2: TutorialStage = {
  id: 'web_stage2',
  title: '用 Python 处理 Web 数据',
  icon: 'data_object',
  topics: [
    {
      id: 'web_json_module',
      title: 'json 模块',
      stage: 'Web > 处理 Web 数据',
      summary: 'json 模块把 JSON 文本转成 Python 字典，也能把字典转回 JSON，是处理接口数据的必备工具。',
      content: {
        overview: '上一课知道 JSON 长什么样了，但 Python 不能直接用字符串。标准库 json 负责两件事：把 JSON 文本解析成 Python 字典（loads），把 Python 字典转成 JSON 文本（dumps）。这是处理 Web 数据最常用的操作。',
        sections: [
          { heading: '解析 JSON：json.loads', text: 'JSON 文本像一封用外文写的信，json.loads 就是翻译官，把它翻译成 Python 字典；json.dumps 则反过来，把字典翻译回 JSON 文本发给服务器。\n\njson.loads(字符串) 把 JSON 文本转成 Python 字典或列表，之后就能像普通字典一样取值。',
            code: `import json\n\njson_text = '{"name": "小林", "age": 16, "scores": [88, 92, 75]}'\ndata = json.loads(json_text)\nprint("姓名:", data["name"])\nprint("成绩列表:", data["scores"])\nprint("最高分:", max(data["scores"]))`
          },
          {
            heading: '生成 JSON：json.dumps',
            text: 'json.dumps(字典) 把 Python 数据转成 JSON 字符串。加 ensure_ascii=False 可以保留中文，加 indent=2 让输出带缩进、好看。',
            code: `import json\n\ndata = {"city": "上海", "temperature": 26, "rainy": False}\ntext = json.dumps(data, ensure_ascii=False, indent=2)\nprint("转成的 JSON 文本:")\nprint(text)`
          },
        ],
        codeExample: `import json\n\nraw = '{"city": "上海", "population": 2487}'\nd = json.loads(raw)\nprint("城市:", d["city"])\nprint("人口:", d["population"])`,
        takeaways: [
          'json.loads(字符串) 把 JSON 解析成 Python 字典/列表',
          'json.dumps(对象) 把 Python 数据转成 JSON 字符串',
          'ensure_ascii=False 保留中文，indent=N 美化缩进',
          '处理接口返回数据时这两个函数用得最多'
        ],
        tips: [
          'loads 的 s 代表 string（字符串）；对应的 load 用于读文件。',
          '解析后先打印一遍看结构，再按键取值。'
        ]
      }
    },
    {
      id: 'web_nested',
      title: '解析嵌套 JSON',
      stage: 'Web > 处理 Web 数据',
      summary: '真实接口返回的 JSON 往往是多层嵌套的字典套列表，学会逐层取值。',
      content: {
        overview: '真实接口返回的数据不是一层字典就完了，而是字典里套列表、列表里又套字典。这一课练习从嵌套 JSON 里取出目标值，这是日常处理 Web 数据的高频动作。',
        sections: [
          { heading: '逐层取值', text: '嵌套 JSON 像一个俄罗斯套娃：先打开最外层字典，取出里面的列表，再打开列表里的每个字典。一层一层剥，直到拿到想要的值。\n\n方法就是连续用 [键] 和 [下标]：先取字典键，再取列表下标，再取字典键。',
            code: `import json\n\nraw = '{"class": "一班", "students": [{"name": "小林", "score": 88}, {"name": "小陈", "score": 92}]}'\ndata = json.loads(raw)\n\nprint("班级:", data["class"])\nprint("学生人数:", len(data["students"]))\n# 取第二个学生的姓名\nprint("第二个学生:", data["students"][1]["name"])`
          },
          {
            heading: '遍历列表里的字典',
            text: '如果要处理所有学生，就遍历列表，每个元素都是一个字典。',
            code: `import json\n\nraw = '[{"name": "小林", "score": 88}, {"name": "小陈", "score": 92}, {"name": "小王", "score": 75}]'\nstudents = json.loads(raw)\n\ntotal = 0\nfor s in students:\n    total += s["score"]\nprint(f"共 {len(students)} 人，总分 {total}，平均 {total/len(students):.1f}")`
          },
        ],
        codeExample: `import json\n\nraw = '{"books": [{"title": "西游", "price": 45}, {"title": "三国", "price": 60}]}'\ndata = json.loads(raw)\nfor b in data["books"]:\n    print(b["title"], b["price"])`,
        takeaways: [
          '嵌套 JSON 通过连续的 [键] 和 [下标] 逐层取值',
          '列表元素是字典时用 for 循环遍历',
          '先 print 整个数据看清结构，再按路径取值',
          '这是处理真实接口返回数据的日常操作'
        ],
        tips: [
          '取嵌套值时报 KeyError，多半是路径写错了，先 print 中间层确认。',
          '不确定某个键是否存在时，用 d.get("键", 默认值) 避免报错。'
        ]
      }
    },
    {
      id: 'web_api_call',
      title: '调用 API 取数据',
      stage: 'Web > 处理 Web 数据',
      summary: '把请求和解析串起来：发 GET 请求拿到 JSON，用 json 解析后取值。需本机联网运行。',
      content: {
        overview: '前面分别学了请求、状态码、JSON 解析。现在把它们串成完整流程：用 requests 发请求，判断状态码，再用 json 解析返回数据。注意这需要联网和本机 Python 环境。',
        sections: [
          { heading: '完整调用流程（本机运行）', text: '完整流程像点外卖：下单（发请求）→ 确认订单成功（看状态码）→ 打开餐盒（解析 JSON）→ 开吃（取值使用）。\n\n标准四步：\n1. requests.get(URL, timeout=10) 发请求。\n2. 判断 resp.status_code == 200。\n3. 用 resp.json() 直接把返回体解析成字典。\n4. 按键取出需要的数据。\n下面是伪代码示意，需本机去掉注释运行。',
            code: `# 本机 Python 环境（pip install requests）联网运行：\n# import requests\n# resp = requests.get("https://api.example.com/users", timeout=10)\n# if resp.status_code == 200:\n#     data = resp.json()          # 等价于 json.loads(resp.text)\n#     print(data["users"][0]["name"])`
          },
          {
            heading: '用模拟数据走通流程',
            text: '在本应用离线环境里，我们用一个模拟的返回 JSON 走通「解析 → 取值」这后半段，真实联网部分到本机再做。',
            code: `import json\n\n# 模拟服务器返回的 JSON 文本\nmock_response_text = '{"code": 0, "data": {"city": "上海", "aqi": 42}}'\n\nresp = {"status_code": 200, "text": mock_response_text}\nif resp["status_code"] == 200:\n    data = json.loads(resp["text"])\n    print("城市:", data["data"]["city"])\n    print("空气质量指数:", data["data"]["aqi"])`
          },
        ],
        codeExample: `import json\n\nmock = {"status_code": 200, "text": '{"temp": 26, "weather": "晴"}'}\nif mock["status_code"] == 200:\n    d = json.loads(mock["text"])\n    print("气温:", d["temp"])\n    print("天气:", d["weather"])`,
        takeaways: [
          '调用 API 四步：发请求、判断状态码、解析 JSON、取值',
          'resp.json() 把返回体直接解析成字典',
          '必须先判断状态码是 200 再解析',
          '真实联网调用需 requests 库和本机环境'
        ],
        tips: [
          'resp.json() 比手写 json.loads(resp.text) 更方便。',
          '网络请求一定加 timeout，避免程序无限等待。'
        ]
      }
    },
    {
      id: 'web_post',
      title: 'POST 提交数据',
      stage: 'Web > 处理 Web 数据',
      summary: 'GET 是取数据，POST 是把数据提交给服务器，比如登录、提交表单。',
      content: {
        overview: '前面都是 GET 请求（拿数据）。还有一种 POST 请求，用来把数据交给服务器：登录账号、发表留言、提交订单。它把数据放在请求体里，而不是 URL 上。',
        sections: [
          { heading: 'GET 与 POST 的区别', text: 'GET 像去柜台查余额（只看），POST 像把填好的表单递给工作人员（提交新数据）。登录、发帖、下单都用 POST。\n\n• GET：数据放在 URL 参数里，用于查询，参数会显示在地址栏。\n• POST：数据放在请求体里，用于提交，适合敏感或大量数据。',
            table: {
              headers: ['对比项', 'GET', 'POST'],
              rows: [
                ['数据位置', 'URL 参数 ?id=1', '请求体'],
                ['用途', '查询获取', '提交新增'],
                ['是否敏感', '参数可见', '密码等不适合放 URL'],
                ['典型场景', '浏览列表', '登录、发帖、下单']
              ]
            }
          },
          {
            heading: '模拟一次 POST',
            text: 'requests 用 requests.post(url, json=字典) 提交 JSON 数据。下面在离线环境里用字典模拟提交内容和响应。',
            code: `import json\n\n# 模拟要提交的数据（如登录表单）\npayload = {"username": "xiaolin", "password": "secret123"}\nprint("提交的账号:", payload["username"])\n\n# 模拟服务器返回\nresp_text = '{"token": "abc-123", "success": true}'\nresult = json.loads(resp_text)\nprint("登录成功:", result["success"])\nprint("获得令牌:", result["token"])`,
            notes: '真实的 POST 需本机联网：requests.post(url, json=payload)。密码这类敏感数据绝不能放在 GET 的 URL 参数里。'
          },
        ],
        codeExample: `import json\n\npayload = {"title": "第一篇笔记", "content": "学习 Web 真有趣"}\nresp_text = '{"id": 101, "ok": true}'\nresult = json.loads(resp_text)\nprint("发布成功:", result["ok"])\nprint("新笔记编号:", result["id"])`,
        takeaways: [
          'GET 用于查询，POST 用于提交数据',
          'POST 数据放在请求体，不在 URL 上',
          '登录、发帖、下单都用 POST',
          'requests.post(url, json=字典) 提交 JSON 数据'
        ],
        tips: [
          '密码、身份证等敏感信息绝不要放在 URL 参数里。',
          '本机真实调用时，Content-Type 会自动设为 application/json。'
        ]
      }
    },
    {
      id: 'web_reference',
      title: 'HTTP 速查表',
      stage: 'Web > 处理 Web 数据 > 速查',
      kind: 'reference',
      summary: '把 HTTP 方法、状态码、请求头和 JSON 操作整理成一张表，写 Web 代码时查阅。',
      content: {
        overview: '这一页是查阅手册，把 Web 基础里出现过的方法、状态码、请求头和 Python json 操作汇总成表，写代码忘了就来翻。'
        ,
        sections: [
          {
            text: 'REST 常用 HTTP 方法：',
            table: {
              headers: ['方法', '操作', '示例'],
              rows: [
                ['GET', '查询资源', 'GET /users 获取用户列表'],
                ['POST', '新建资源', 'POST /users 创建用户'],
                ['PUT', '更新资源', 'PUT /users/1 更新 1 号用户'],
                ['DELETE', '删除资源', 'DELETE /users/1 删除 1 号用户']
              ]
            }
          },
          {
            text: '常见状态码：',
            table: {
              headers: ['状态码', '含义'],
              rows: [
                ['200', '成功'],
                ['301/302', '重定向跳转'],
                ['400', '请求参数错误'],
                ['403', '无权限'],
                ['404', '资源不存在'],
                ['500', '服务器内部错误'],
                ['503', '服务暂不可用']
              ]
            }
          },
          {
            text: 'Python json 模块常用操作：',
            table: {
              headers: ['操作', '写法', '作用'],
              rows: [
                ['解析 JSON', 'json.loads(字符串)', 'JSON 文本 → Python 字典'],
                ['生成 JSON', 'json.dumps(对象, ensure_ascii=False)', '字典 → JSON 文本'],
                ['美化输出', 'json.dumps(d, indent=2)', '带缩进的易读格式'],
                ['请求解析', 'resp.json()', 'requests 响应直接转字典']
              ]
            }
          }
        ]
      }
    }
  ]
};
