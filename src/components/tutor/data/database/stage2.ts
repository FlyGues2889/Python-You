import { TutorialStage } from '../../tutorialData';

// 数据库系列 · 阶段二：进阶查询
export const dbStage2: TutorialStage = {
  id: 'db_stage2',
  title: '进阶查询',
  icon: 'query_stats',
  topics: [
    {
      id: 'db_sort_agg',
      title: '排序与聚合统计',
      stage: '数据库 > 进阶查询',
      summary: '用 ORDER BY 排序，用 COUNT / SUM / AVG 做统计，用 GROUP BY 分组汇总。',
      content: {
        overview: '存了一堆数据后，最常见的需求不是「把数据都列出来」，而是「告诉我平均分是多少」「成绩最高的是谁」「按班级分组统计人数」。这一课学习排序和聚合函数，让数据库替你做统计计算。',
        sections: [
          { heading: '排序 ORDER BY', text: '老师拿到全班成绩单，不想一张张翻：他想按分数从高到低排队（排序），想知道全班总分和平均分（聚合），还想按小组分组统计每组平均成绩（分组聚合）。这些数据库一句话就能完成。\n\n查询结果默认按数据插入顺序返回。加 ORDER BY 可以排序：\n• ORDER BY 字段 ASC：升序（从小到大，默认）。\n• ORDER BY 字段 DESC：降序（从大到小）。\n• 配合 LIMIT 取前 N 条，常用于「前三名」「最高的五条」。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, score REAL)")\ncur.executemany("INSERT INTO students (name, score) VALUES (?, ?)",\n                [("小林", 88.5), ("小陈", 92.0), ("小王", 75.5), ("小赵", 81.0)])\n\n# 按成绩从高到低排序，取前两名\nfor row in cur.execute("SELECT name, score FROM students ORDER BY score DESC LIMIT 2"):\n    print(row[0], row[1])\nconn.close()`
          },
          {
            heading: '聚合函数',
            text: '聚合函数把多行数据算成一个值：\n• COUNT(*)：行数。\n• SUM(字段)：求和。\n• AVG(字段)：平均值。\n• MAX(字段) / MIN(字段)：最大、最小值。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, score REAL)")\ncur.executemany("INSERT INTO students (name, score) VALUES (?, ?)",\n                [("小林", 88.5), ("小陈", 92.0), ("小王", 75.5)])\n\ncur.execute("SELECT COUNT(*), SUM(score), AVG(score), MAX(score) FROM students")\ncount, total, avg, best = cur.fetchone()\nprint(f"人数={count} 总分={total} 平均分={avg:.2f} 最高分={best}")\nconn.close()`,
            notes: 'AVG 返回的是小数，打印时用 f-string 的 :.2f 保留两位，避免出现 85.3333333 这种长尾巴。'
          },
          {
            heading: '分组 GROUP BY',
            text: 'GROUP BY 把相同取值的行分成一组，再对每组分别聚合。比如表里有班级字段，GROUP BY class 就能算出每个班各自的平均分。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE scores (id INTEGER PRIMARY KEY, cls TEXT, score REAL)")\ncur.executemany("INSERT INTO scores (cls, score) VALUES (?, ?)",\n                [("一班", 80), ("一班", 90), ("二班", 70), ("二班", 85), ("二班", 90)])\n\n# 按班级分组，统计每班人数和平均分\nfor row in cur.execute("SELECT cls, COUNT(*), AVG(score) FROM scores GROUP BY cls"):\n    print(f"{row[0]} 人数={row[1]} 平均分={row[2]:.2f}")\nconn.close()`
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE sales (id INTEGER PRIMARY KEY, city TEXT, amount REAL)")\ncur.executemany("INSERT INTO sales (city, amount) VALUES (?, ?)",\n                [("上海", 300), ("上海", 500), ("北京", 200), ("北京", 400), ("北京", 600)])\n\nfor row in cur.execute("SELECT city, SUM(amount) FROM sales GROUP BY city"):\n    print(f"{row[0]} 总销售额={row[1]}")\nconn.close()`,
        takeaways: [
          'ORDER BY 字段 DESC 降序，ASC 升序，LIMIT n 取前 n 条',
          'COUNT / SUM / AVG / MAX / MIN 把多行聚合成一个值',
          'GROUP BY 按字段分组，聚合函数对每组分别计算',
          'AVG 等浮点结果打印时用 :.2f 控制小数位'
        ],
        tips: [
          '「全班前三名」就是 ORDER BY score DESC LIMIT 3。',
          'GROUP BY 的字段要出现在 SELECT 里，否则不知道哪行对应哪组。'
        ]
      }
    },
    {
      id: 'db_param',
      title: '参数化查询',
      stage: '数据库 > 进阶查询',
      summary: '永远用 ? 占位符拼接查询参数，不要用字符串拼接，否则会有 SQL 注入风险。',
      content: {
        overview: '前面所有例子都用 ? 做占位符，这一课专门讲为什么。如果把用户输入直接拼进 SQL 字符串，既会因为引号问题报错，还可能被恶意输入破坏数据库。参数化查询是必须养成的安全习惯。',
        sections: [
          { heading: '错误示范：字符串拼接', text: '假设登录时要查「用户名叫张三的记录」。如果直接把用户名拼进 SQL，有人输入了一个带引号的恶意字符串，整句 SQL 的结构就会被篡改，相当于别人在你家柜子上塞了一把万能钥匙。\n\n下面这种写法看起来能跑，但有两个问题：\n1. 名字里带单引号（如 O\'Neil）会直接让 SQL 语法报错。\n2. 恶意输入可以改变 SQL 结构，这就是 SQL 注入。\n注意：这段只是用来展示错误写法，不要照着用。',
            code: `# 错误示范！不要这样写\nname = "小林"\n# 把字符串直接拼进 SQL，遇到引号或恶意输入就会出问题\nsql = "SELECT * FROM students WHERE name = '" + name + "'"\nprint("拼接出的 SQL:", sql)`
          },
          {
            heading: '正确写法：? 占位符',
            text: '正确做法是 SQL 里写 ?，再把参数作为元组传给 execute 的第二个参数。sqlite3 会自动处理引号和转义，既安全又不会报错。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, score REAL)")\ncur.executemany("INSERT INTO students (name, score) VALUES (?, ?)",\n                [("小林", 88.5), ("小陈", 92.0)])\n\n# 正确：用 ? 占位符，参数作为元组传入\nkeyword = "小林"\ncur.execute("SELECT name, score FROM students WHERE name = ?", (keyword,))\nprint(cur.fetchone())\nconn.close()`,
            notes: '参数只有一个时也要写成元组 (keyword,)，末尾的逗号不能少，否则它只是个普通字符串而不是元组。'
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, price REAL)")\ncur.executemany("INSERT INTO books (title, price) VALUES (?, ?)",\n                [("西游", 45), ("三国", 60)])\n\nlimit_price = 50\ncur.execute("SELECT title, price FROM books WHERE price < ?", (limit_price,))\nfor row in cur.fetchall():\n    print(row[0], row[1])\nconn.close()`,
        takeaways: [
          '禁止用字符串拼接或 f-string 把变量拼进 SQL',
          '正确做法是 SQL 里写 ?，参数作为元组传给 execute 第二参数',
          '单参数也要写成 (value,) 带尾逗号的元组',
          '参数化查询同时解决引号报错和 SQL 注入风险'
        ],
        tips: [
          '只要 SQL 里出现了来自变量的值，就一律用占位符，不要图省事拼接。',
          'executemany 也是同样的占位符写法，批量插入更安全。'
        ]
      }
    },
    {
      id: 'db_transaction',
      title: '事务与提交',
      stage: '数据库 > 进阶查询',
      summary: '事务把多条改动绑成一个整体：要么全部成功，要么全部回滚，避免数据改一半。',
      content: {
        overview: '银行转账时，从 A 扣钱和给 B 加钱必须同时成功或同时失败，不能出现「A 扣了钱、B 没收到」的中间状态。事务（Transaction）就是用来保证这种「要么全做、要么全不做」的机制。',
        sections: [
          { heading: 'commit 与 rollback', text: '你在 ATM 转账，机器先扣了你的钱，正要给对方加钱时突然断电。如果没有事务，你的钱就凭空消失了。有了事务，断电后数据库会自动回滚到扣款前的状态，两笔操作一起撤销。\n\nsqlite3 默认开启事务：你执行的 INSERT / UPDATE / DELETE 都先存在内存里，直到调用 commit() 才真正写入。\n• commit()：确认全部修改，写入数据库。\n• rollback()：撤销本次事务里的所有修改。\n如果中途出错，就 rollback，避免数据停留在改了一半的状态。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance REAL)")\ncur.executemany("INSERT INTO accounts (name, balance) VALUES (?, ?)",\n                [("A", 100), ("B", 100)])\n\n# 模拟转账：A 转出 30，B 收入 30\ncur.execute("UPDATE accounts SET balance = balance - 30 WHERE name = 'A'")\ncur.execute("UPDATE accounts SET balance = balance + 30 WHERE name = 'B'")\nconn.commit()  # 两笔都成功才提交\n\nfor row in cur.execute("SELECT name, balance FROM accounts"):\n    print(row[0], row[1])\nconn.close()`
          },
          {
            heading: '出错时回滚',
            text: '用 try / except 包住多步修改：正常就 commit，异常就 rollback。下面故意让第二步出错，观察回滚后 A 的余额没有变化。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance REAL)")\ncur.execute("INSERT INTO accounts (name, balance) VALUES ('A', 100)")\nconn.commit()   # 先把初始数据提交\n\ntry:\n    cur.execute("UPDATE accounts SET balance = balance - 30 WHERE name = 'A'")\n    raise ValueError("模拟中途出错")   # 故意制造异常\n    conn.commit()\nexcept ValueError:\n    conn.rollback()   # 撤销上面那步扣款，A 仍为 100\n    print("出错，已回滚")\n\nprint("A 余额:", cur.execute("SELECT balance FROM accounts WHERE name='A'").fetchone()[0])\nconn.close()`,
            notes: '这段代码里 raise 是故意写的，用来演示回滚；真实程序里异常来自网络错误、数据非法等不可预知的情况。'
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE wallet (id INTEGER PRIMARY KEY, owner TEXT, money REAL)")\ncur.executemany("INSERT INTO wallet (owner, money) VALUES (?, ?)",\n                [("甲", 200), ("乙", 50)])\n\n# 甲给乙转 100，两步一起提交\ncur.execute("UPDATE wallet SET money = money - 100 WHERE owner = '甲'")\ncur.execute("UPDATE wallet SET money = money + 100 WHERE owner = '乙'")\nconn.commit()\n\nfor row in cur.execute("SELECT owner, money FROM wallet"):\n    print(row[0], row[1])\nconn.close()`,
        takeaways: [
          '事务把多条写操作绑成一个整体，要么全成功要么全撤销',
          'commit() 提交生效，rollback() 撤销本次事务',
          '多步修改用 try/except 包裹，异常时 rollback',
          '银行转账这类场景必须用事务保证一致性'
        ],
        tips: [
          '一个连接默认一个事务，commit 之后下一条写操作会开启新事务。',
          '练习时用 :memory: 库，rollback 后数据不会真的改动，放心试。'
        ]
      }
    },
    {
      id: 'db_reference',
      title: 'SQL 常用语句速查',
      stage: '数据库 > 进阶查询 > 速查',
      kind: 'reference',
      summary: '把最常用的 SQL 语句和聚合函数列成表，写代码时翻一翻。',
      content: {
        overview: '这一页是查阅手册，把前面学过的 SQL 语句按用途整理成表，写代码时忘了语法可以直接来查。不需要背，混个眼熟即可。'
        ,
        sections: [
          {
            text: '按用途分类的常用 SQL 语句：',
            table: {
              headers: ['用途', '语句模板', '说明'],
              rows: [
                ['建表', 'CREATE TABLE 表 (id INTEGER PRIMARY KEY, 字段 TEXT)', '定义表结构，主键自增'],
                ['插入', 'INSERT INTO 表 (字段) VALUES (?, ?)', '? 为占位符，参数按元组传入'],
                ['查全部', 'SELECT * FROM 表', '读取所有列所有行'],
                ['查指定列', 'SELECT 字段1, 字段2 FROM 表', '只取需要的列'],
                ['条件筛选', 'SELECT * FROM 表 WHERE 字段 > 值', '支持 = > < >= <= != AND OR'],
                ['模糊匹配', "SELECT * FROM 表 WHERE 字段 LIKE '张%'", '% 匹配任意若干字符'],
                ['排序', 'SELECT * FROM 表 ORDER BY 字段 DESC', 'DESC 降序，ASC 升序'],
                ['取前几条', 'SELECT * FROM 表 ORDER BY 字段 DESC LIMIT 3', '常配排序取 Top N'],
                ['改数据', 'UPDATE 表 SET 字段 = 值 WHERE 条件', '务必带 WHERE'],
                ['删数据', 'DELETE FROM 表 WHERE 条件', '务必带 WHERE'],
                ['计数', 'SELECT COUNT(*) FROM 表', '统计行数'],
                ['求和/平均', 'SELECT SUM(字段), AVG(字段) FROM 表', '聚合函数'],
                ['最值', 'SELECT MAX(字段), MIN(字段) FROM 表', '最大、最小值'],
                ['分组', 'SELECT 字段, COUNT(*) FROM 表 GROUP BY 字段', '分组后聚合'],
                ['提交', 'conn.commit()', '写入才真正落盘'],
                ['回滚', 'conn.rollback()', '撤销本次事务']
              ]
            }
          },
          {
            text: 'Python 侧常用操作：sqlite3.connect(":memory:") 建临时库；conn.cursor() 拿游标；cur.execute(sql, 参数元组) 执行；cur.fetchone() 取一行，cur.fetchall() 取全部。'
          }
        ]
      }
    }
  ]
};
