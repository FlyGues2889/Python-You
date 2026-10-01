import { TutorialStage } from '../../tutorialData';

// 数据库系列 · 阶段一：入门与 SQLite
export const dbStage1: TutorialStage = {
  id: 'db_stage1',
  title: '入门与 SQLite',
  icon: 'database',
  topics: [
    {
      id: 'db_what',
      title: '什么是数据库',
      stage: '数据库 > 入门与 SQLite',
      summary: '数据库是一张可以长期保存、随时查询的超级表格，比 Excel 和 Python 字典更适合管数据。',
      content: {
        overview: '你已经会用列表和字典在程序里存数据了，但这些数据一关程序就没了。数据库（Database）就是一个能把数据长期存到硬盘、并且能按条件快速查找的「超级表格柜」。这一课先建立概念：什么时候该用数据库，它和我们已经会的工具有什么区别。',
        sections: [
          { heading: '数据库和文件、字典的区别', text: '假设你要管理一个班级 50 个同学的姓名、年龄和成绩。用 Python 字典存在内存里，关掉软件数据就没了；写到 Excel 里，程序想自动读取和计算又很麻烦。数据库正好夹在中间：它像 Excel 一样把数据存成表格长期保存，又能让程序用 SQL 语句快速查询、统计。\n\n我们已经会的存数据方式各有局限：\n• Python 字典：数据只在内存里，程序一停就消失，适合临时计算。\n• 文本文件 / CSV：能长期保存，但查找某条数据要从头读到尾，数据量大了很慢。\n• 数据库：数据长期保存到硬盘，并且自带「索引」，能按条件毫秒级找到目标，还支持多人同时读写。',
            table: {
              headers: ['存储方式', '数据是否长期保存', '查找速度', '适合数据量', '典型场景'],
              rows: [
                ['内存字典', '否，关程序即消失', '快（直接取值）', '小', '临时计算'],
                ['CSV / 文本文件', '是', '慢，需逐行扫描', '中小', '少量数据交换'],
                ['数据库', '是', '快，支持索引', '中到大', '账单、库存、用户数据']
              ]
            }
          },
          {
            heading: '关系型数据库长什么样',
            text: '最常见的一类叫「关系型数据库」，它把数据存成一张张二维表，就像 Excel 工作表：每一行是一条记录（比如一个同学），每一列是一个字段（比如姓名、年龄）。表和表之间可以通过共同的字段关联起来，比如「成绩表」里存学号，就能关联到「学生表」里的姓名。\n操作这种数据库用的语言叫 SQL（Structured Query Language，结构化查询语言），它不是用来写程序逻辑的，而是专门用来「增、删、改、查」表格数据。',
            code: `# 先直观感受一下：用 Python 字典模拟一张内存表\nstudents = [\n    {"name": "小林", "age": 16, "score": 88},\n    {"name": "小陈", "age": 17, "score": 92},\n    {"name": "小王", "age": 16, "score": 75},\n]\n\n# 找出成绩大于 80 的同学\nfor s in students:\n    if s["score"] > 80:\n        print(s["name"], s["score"])`,
            notes: '这段代码只是感受「表格 + 条件筛选」的思路。真正的数据库会把这张表存到硬盘，并用专门的 SQL 语句完成同样的事。'
          },
        ],
        codeExample: `# 用字典做一次简单筛选，体会「表 + 查询」的思路\nbooks = [\n    {"title": "西游记", "price": 45},\n    {"title": "三国演义", "price": 60},\n    {"title": "水浒传", "price": 38},\n]\n\nexpensive = [b["title"] for b in books if b["price"] >= 40]\nprint("40 元及以上的书:", expensive)`,
        takeaways: [
          '数据库把数据长期存到硬盘，并支持按条件快速查找',
          '关系型数据库用二维表（行=记录，列=字段）组织数据',
          'SQL 是专门用来增删改查表格数据的语言',
          '数据需要长期保存、经常按条件查找时，就该用数据库而不是字典'
        ],
        tips: [
          '本系列所有代码都用 Python 自带的 sqlite3 模块，无需联网、无需安装额外软件。',
          '先不要纠结 SQL 的所有语法，跟着例子跑一遍，建立「表」和「查询」的直觉更重要。'
        ]
      }
    },
    {
      id: 'db_sqlite_what',
      title: '认识 SQLite',
      stage: '数据库 > 入门与 SQLite',
      summary: 'SQLite 是一个零配置的轻量级数据库，整个数据库就是一个文件，Python 自带它。',
      content: {
        overview: '数据库有很多种，比如 MySQL、PostgreSQL、Oracle，它们都需要安装服务器、配置账号密码。但学习阶段我们用 SQLite：它不需要安装服务器，整个数据库就是硬盘上的一个文件，Python 标准库直接带了 sqlite3 模块，打开就能用。',
        sections: [
          { heading: '为什么学习选 SQLite', text: 'MySQL 像一家大型连锁超市：货品齐全、能同时服务很多人，但要租店面、办执照、雇人管理。SQLite 像家里的冰箱：不用开业手续，插上电就能用，适合自己一个人存东西。学习和做小工具时，SQLite 完全够用。\n\nSQLite 有三个对新手特别友好的特点：\n1. 零配置：不用安装、不用启动服务、不用设账号密码。\n2. 单文件：整个数据库就是一个 .db 文件，备份就是复制这个文件。\n3. 标准库自带：Python 里 import sqlite3 就能用，本应用内置的运行环境也支持。\n它和 MySQL、PostgreSQL 用的几乎是同一套 SQL 语句，学会 SQLite，以后换其他数据库只改连接方式即可。',
            table: {
              headers: ['数据库', '是否需要安装服务器', '数据库形态', '典型用途'],
              rows: [
                ['SQLite', '不需要', '一个文件', '学习、桌面软件、手机 App'],
                ['MySQL', '需要，单独服务', '服务端 + 数据目录', '网站后端、业务系统'],
                ['PostgreSQL', '需要，单独服务', '服务端 + 数据目录', '复杂业务、地理数据']
              ]
            }
          },
          {
            heading: '两种连接方式',
            text: 'sqlite3.connect(路径) 用来连接数据库：\n• 传入一个文件名（如 "school.db"）：数据会保存到这个文件，下次打开还在。\n• 传入 ":memory:"：在内存里建一个临时数据库，程序结束就清空，特别适合练习和测试。\n本系列的示例为了每次运行结果一致、不污染硬盘，统一用 ":memory:"。',
            code: `import sqlite3\n\n# :memory: 表示在内存中建一个临时数据库，不产生文件\nconn = sqlite3.connect(":memory:")\nprint("数据库连接成功")\n\n# 用完一定要关闭连接\nconn.close()`
          },
        ],
        codeExample: `import sqlite3\n\n# 连接内存数据库，创建并关闭\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("SELECT 1 + 1")\nrow = cur.fetchone()\nprint("查询结果:", row[0])\nconn.close()`,
        takeaways: [
          'SQLite 不需要安装服务器，整个数据库就是一个文件',
          'Python 通过标准库 sqlite3 使用它，无需额外安装',
          'connect("文件.db") 永久保存数据；connect(":memory:") 是临时练习库',
          '学会的 SQL 语句可以直接迁移到 MySQL、PostgreSQL'
        ],
        tips: [
          '练习时优先用 ":memory:"，避免在项目目录里留下一堆 .db 文件。',
          '连接用完要 close()，就像打开文件后要关闭一样。'
        ]
      }
    },
    {
      id: 'db_connect',
      title: '连接与建表',
      stage: '数据库 > 入门与 SQLite',
      summary: '用 connect 连接数据库，用 CREATE TABLE 建一张带字段的空表。',
      content: {
        overview: '用数据库存数据的第一步是「建表」。就像先画好表格的表头（姓名、年龄、成绩），后面才能往里填一行行数据。这一课学会连接数据库、写 CREATE TABLE 语句定义表结构。',
        sections: [
          { heading: '建表语句 CREATE TABLE', text: '新建 Excel 表格时，你会先在第一行写下表头：姓名、年龄、成绩。建表就是用 SQL 把这个表头告诉数据库：这张表叫什么、有哪几列、每列存什么类型的数据。\n\n基本格式是：\nCREATE TABLE 表名 (\n    字段名 类型,\n    字段名 类型\n);\nSQLite 常用的数据类型：\n• INTEGER：整数\n• REAL：小数\n• TEXT：文本\n• 建表时加上 IF NOT EXISTS，表示「不存在才建」，重复运行不会报错。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\n\n# 建一张 students 表：id 为主键，name 为文本，age 为整数，score 为小数\ncur.execute("""\n    CREATE TABLE students (\n        id INTEGER PRIMARY KEY,\n        name TEXT,\n        age INTEGER,\n        score REAL\n    )\n""")\n\n# 查看数据库里有哪些表\ncur.execute("SELECT name FROM sqlite_master WHERE type='table'")\nprint("已建表:", cur.fetchall())\nconn.close()`,
            notes: 'SQL 语句里的三引号字符串可以换行写，让建表语句更像表格本身。'
          },
          {
            heading: '主键是什么',
            text: '上面的 id 字段标注了 PRIMARY KEY（主键）。它的作用是给每一行一个不重复的编号，就像学生的学号：姓名可能重复，但学号绝不重复。INTEGER PRIMARY KEY 还会自动递增，插入数据时不用手动指定 id。',
            table: {
              headers: ['字段', '类型', '含义'],
              rows: [
                ['id', 'INTEGER PRIMARY KEY', '主键，自动编号，唯一'],
                ['name', 'TEXT', '姓名，文本'],
                ['age', 'INTEGER', '年龄，整数'],
                ['score', 'REAL', '成绩，小数']
              ]
            }
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\n\ncur.execute("""\n    CREATE TABLE books (\n        id INTEGER PRIMARY KEY,\n        title TEXT,\n        price REAL\n    )\n""")\n\ncur.execute("SELECT name FROM sqlite_master WHERE type='table'")\nprint("表清单:", cur.fetchall())\nconn.close()`,
        takeaways: [
          'CREATE TABLE 表名(字段 类型, ...) 用来定义表结构',
          '常用类型：INTEGER 整数、REAL 小数、TEXT 文本',
          'INTEGER PRIMARY KEY 是自增主键，作为每行的唯一编号',
          'IF NOT EXISTS 让建表语句可重复执行而不报错'
        ],
        tips: [
          'cursor（游标）用来执行 SQL 语句并取回结果，可理解成「执行器」。',
          '字段名和表名建议用英文小写加下划线，如 student_score。'
        ]
      }
    },
    {
      id: 'db_insert',
      title: '插入数据',
      stage: '数据库 > 入门与 SQLite',
      summary: '用 INSERT INTO 往表里添加一行行记录，一次插多行用 executemany。',
      content: {
        overview: '表建好了，接下来往里填数据。SQL 用 INSERT INTO 语句插入一行记录。这一课学会插一条、插多条，以及如何取回数据库自动生成的 id。',
        sections: [
          { heading: '插入一行 INSERT INTO', text: '建表就像打印了一张空白登记表，INSERT 就是在表里新填一行。你不用写学号（主键自动生成），只要填姓名、年龄、成绩即可。\n\n基本格式：\nINSERT INTO 表名 (字段1, 字段2) VALUES (值1, 值2);\n字符串值要用单引号括起来，数字直接写。执行后要调用 conn.commit() 提交，数据才真正写进数据库。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, score REAL)")\n\n# 插入一行：id 不写，让它自动生成\ncur.execute("INSERT INTO students (name, age, score) VALUES ('小林', 16, 88.5)")\n\n# lastrowid 是刚插入那一行的主键 id\nprint("刚插入的 id:", cur.lastrowid)\nconn.commit()\nconn.close()`
          },
          {
            heading: '一次插入多行',
            text: '如果要一次插入很多行，重复写 execute 会很慢。用 executemany 配合占位符 ?，把多行数据放在一个列表里一次提交。这也是后面「参数化查询」的基础。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, score REAL)")\n\n# 用 ? 做占位符，第二行传入数据列表\nrows = [("小陈", 17, 92.0), ("小王", 16, 75.5), ("小赵", 18, 81.0)]\ncur.executemany("INSERT INTO students (name, age, score) VALUES (?, ?, ?)", rows)\n\nprint("当前行数:", cur.execute("SELECT COUNT(*) FROM students").fetchone()[0])\nconn.commit()\nconn.close()`,
            notes: '问号 ? 是 sqlite3 的占位符，不要用字符串拼接把数值直接塞进 SQL，那样既慢又有安全隐患。'
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE fruits (id INTEGER PRIMARY KEY, name TEXT, price REAL)")\n\ncur.executemany(\n    "INSERT INTO fruits (name, price) VALUES (?, ?)",\n    [("苹果", 5.5), ("香蕉", 3.0), ("橙子", 4.2)]\n)\n\nprint("已录入水果种类:", cur.execute("SELECT COUNT(*) FROM fruits").fetchone()[0])\nconn.commit()\nconn.close()`,
        takeaways: [
          'INSERT INTO 表(字段) VALUES(值) 插入一行记录',
          'executemany 配合 ? 占位符可批量插入多行',
          'lastrowid 能取回刚插入行的自增主键',
          '插入后必须 commit() 才真正落盘'
        ],
        tips: [
          '占位符 ? 由 sqlite3 自动转义，能避免 SQL 注入，也省去自己加引号。',
          '忘了 commit 是新手最常见问题：数据看起来插进去了，一关连接全没了。'
        ]
      }
    },
    {
      id: 'db_select',
      title: '查询数据',
      stage: '数据库 > 入门与 SQLite',
      summary: '用 SELECT 读取数据，用 WHERE 按条件筛选，用 fetchone / fetchall 拿结果。',
      content: {
        overview: '数据库最常用的操作不是存，而是查。SELECT 语句用来从表里读取数据，配合 WHERE 就能「只要成绩大于 80 的同学」这种条件筛选。这是 SQL 里用得最多的一课。',
        sections: [
          { heading: '基本查询 SELECT', text: 'SELECT 就像你对着表格柜说：「把所有记录给我念出来」；WHERE 是补充条件：「只要成绩大于 80 的那些」。查完用 fetchone 拿一条、fetchall 拿全部。\n\n读取所有列用 SELECT *，也可以只写要的字段名：\n• SELECT * FROM students：拿全部列。\n• SELECT name, score FROM students：只拿姓名和成绩两列。\n结果是一组元组，用 fetchone() 取一行、fetchall() 取全部行。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, score REAL)")\ncur.executemany("INSERT INTO students (name, age, score) VALUES (?, ?, ?)",\n                [("小林", 16, 88.5), ("小陈", 17, 92.0), ("小王", 16, 75.5)])\n\n# 查全部行的全部列\nfor row in cur.execute("SELECT name, age, score FROM students"):\n    print(row)\nconn.close()`
          },
          {
            heading: '按条件筛选 WHERE',
            text: 'WHERE 后面写条件，常用比较符：=、>、<、>=、<=、!=（不等于）。字符串条件要用单引号。\n还可以用 AND、OR 组合多个条件，用 LIKE 做模糊匹配（% 代表任意若干字符）。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, score REAL)")\ncur.executemany("INSERT INTO students (name, age, score) VALUES (?, ?, ?)",\n                [("小林", 16, 88.5), ("小陈", 17, 92.0), ("小王", 16, 75.5)])\n\n# 只要成绩大于 80 的同学\nprint("成绩 80 分以上：")\nfor row in cur.execute("SELECT name, score FROM students WHERE score > 80"):\n    print(row[0], row[1])\nconn.close()`,
            table: {
              headers: ['条件写法', '含义'],
              rows: [
                ["WHERE age = 16", '年龄等于 16'],
                ["WHERE score >= 80", '成绩大于等于 80'],
                ["WHERE name != '小林'", '姓名不是小林'],
                ["WHERE score > 80 AND age < 18", '成绩高于 80 且年龄小于 18'],
                ["WHERE name LIKE '小%'", '姓名以「小」开头']
              ]
            }
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)")\ncur.executemany("INSERT INTO products (name, price) VALUES (?, ?)",\n                [("铅笔", 2.0), ("笔记本", 8.5), ("钢笔", 15.0), ("橡皮", 1.5)])\n\nprint("10 元以下的商品：")\nfor row in cur.execute("SELECT name, price FROM products WHERE price < 10"):\n    print(row[0], row[1])\nconn.close()`,
        takeaways: [
          'SELECT 字段 FROM 表 读取数据，* 表示全部列',
          'WHERE 后跟条件，支持 = > < >= <= != 等比较',
          'fetchall() 返回所有行的列表，fetchone() 返回一行',
          'AND/OR 组合多条件，LIKE 配 % 做模糊匹配'
        ],
        tips: [
          '生产环境尽量避免 SELECT *，只查需要的字段，数据量大时能省很多时间。',
          '查询返回的每一行是一个元组，用 row[0]、row[1] 按下标取值。'
        ]
      }
    },
    {
      id: 'db_update_delete',
      title: '更新与删除',
      stage: '数据库 > 入门与 SQLite',
      summary: '用 UPDATE 修改已有行，用 DELETE 删行；永远先加 WHERE，避免误改全表。',
      content: {
        overview: '数据存进去后难免要改：某个同学成绩录错了要改，某个同学退学了要删。SQL 用 UPDATE 修改行、用 DELETE 删除行。这一课最重要的不是语法，而是安全习惯：改和删都要带 WHERE。',
        sections: [
          { heading: 'UPDATE 修改数据', text: '想象一张纸质登记表，UPDATE 就是拿橡皮擦掉某一行的成绩、改写新值；DELETE 就是把整行划掉。危险在于：如果不指明「哪一行」，就可能把整张表的成绩都改成同一个数。\n\n格式：UPDATE 表 SET 字段 = 新值 WHERE 条件;\n• SET 后面写要改成什么。\n• WHERE 指定改哪些行；忘了 WHERE 会把全表所有行都改掉。\n修改完同样要 commit()。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, score REAL)")\ncur.executemany("INSERT INTO students (name, score) VALUES (?, ?)",\n                [("小林", 88.5), ("小陈", 92.0)])\n\n# 把小林的成绩改成 95\ncur.execute("UPDATE students SET score = 95 WHERE name = '小林'")\nconn.commit()\n\nfor row in cur.execute("SELECT name, score FROM students"):\n    print(row[0], row[1])\nconn.close()`
          },
          {
            heading: 'DELETE 删除数据',
            text: '格式：DELETE FROM 表 WHERE 条件;\n删除同样要带 WHERE。下面例子演示删除成绩低于 80 的行。删除是不可逆的，重要数据先备份。',
            code: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, score REAL)")\ncur.executemany("INSERT INTO students (name, score) VALUES (?, ?)",\n                [("小林", 88.5), ("小陈", 92.0), ("小王", 75.5)])\n\n# 删除成绩低于 80 的行\ncur.execute("DELETE FROM students WHERE score < 80")\nconn.commit()\n\nprint("删除后剩余：")\nfor row in cur.execute("SELECT name, score FROM students"):\n    print(row[0], row[1])\nconn.close()`,
            notes: '强烈建议：写 UPDATE / DELETE 时先写一句 SELECT 同样的 WHERE 看看会命中哪些行，确认无误再执行修改。'
          },
        ],
        codeExample: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, price REAL)")\ncur.executemany("INSERT INTO books (title, price) VALUES (?, ?)",\n                [("西游", 45), ("三国", 60), ("水浒", 38)])\n\n# 把「水浒」涨价到 42 元，然后查看\ncur.execute("UPDATE books SET price = 42 WHERE title = '水浒'")\nconn.commit()\n\nfor row in cur.execute("SELECT title, price FROM books"):\n    print(row[0], row[1])\nconn.close()`,
        takeaways: [
          'UPDATE 表 SET 字段=新值 WHERE 条件 修改符合条件的行',
          'DELETE FROM 表 WHERE 条件 删除符合条件的行',
          'UPDATE / DELETE 不写 WHERE 会影响全表，这是最危险的新手错误',
          '修改和删除后都要 commit() 才生效'
        ],
        tips: [
          '执行删除前，先用同样的 WHERE 跑一次 SELECT 确认命中范围。',
          'DELETE 删错无法恢复，重要数据库文件操作前先复制一份备份。'
        ]
      }
    }
  ]
};
