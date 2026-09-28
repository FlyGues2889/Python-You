// database 系列测验组：追加到 quizData.ts 的 TOPIC_QUIZZES 数组中
import type { TopicQuiz } from '../quizData';

export const databaseQuizzes: TopicQuiz[] = [
  {
    topicId: 'db_what',
    questions: [
      {
        id: 'db_what_q1',
        type: 'choice',
        question: '和 Python 字典相比，数据库最主要的优势是？',
        options: ['语法更简单', '数据长期保存且能按条件快速查找', '不需要写代码', '只能存数字'],
        answerIndex: 1,
        explanation: '字典里的数据一关程序就消失；数据库能把数据存到硬盘，并支持索引快速查询。'
      },
      {
        id: 'db_what_q2',
        type: 'choice',
        question: '关系型数据库里，一行记录通常对应？',
        options: ['一个字段', '一条完整的数据（如一个同学）', '一张表', '一个程序'],
        answerIndex: 1,
        explanation: '表中每一行是一条记录，每一列是一个字段（如姓名、年龄）。'
      },
      {
        id: 'db_what_q3',
        type: 'code',
        question: '给定书目列表，用列表推导式挑出价格大于等于 40 元的书名并逐行打印。',
        starterCode: '# 任务：打印价格 >= 40 的书名，每行一个\nbooks = [\n    {"title": "西游", "price": 45},\n    {"title": "三国", "price": 60},\n    {"title": "水浒", "price": 38},\n]',
        expectedOutput: '西游\n三国'
      },
      {
        id: 'db_what_q4',
        type: 'multi',
        question: '关于关系型数据库的表，下面哪些说法正确？（多选）',
        options: ['一行就是一条完整记录', '一列就是一个字段（如姓名、年龄）', '主键用来唯一标识每一行', '表里所有列的数据类型必须相同'],
        answerIndexes: [0, 1, 2],
        explanation: '行是记录、列是字段、主键唯一；不同列可以有不同类型，比如姓名是文本、年龄是整数。'
      }
    ]
  },
  {
    topicId: 'db_sqlite_what',
    questions: [
      {
        id: 'db_sqlite_what_q1',
        type: 'choice',
        question: '关于 SQLite，下列说法正确的是？',
        options: ['需要单独安装数据库服务器', '整个数据库就是一个文件，Python 自带支持', '只能在 Linux 上运行', '必须设置账号密码'],
        answerIndex: 1,
        explanation: 'SQLite 零配置、单文件，通过 Python 标准库 sqlite3 直接使用。'
      },
      {
        id: 'db_sqlite_what_q2',
        type: 'choice',
        question: 'sqlite3.connect(":memory:") 的作用是？',
        options: ['连接硬盘上的永久文件', '在内存中建一个临时数据库', '清空数据库', '删除所有表'],
        answerIndex: 1,
        explanation: ':memory: 表示内存临时库，程序结束即清空，适合练习测试。'
      },
      {
        id: 'db_sqlite_what_q3',
        type: 'code',
        question: '连接内存数据库，执行 SELECT 1 + 1 并把结果打印出来。',
        starterCode: '# 任务：连接 :memory: 数据库，查询 1+1 并打印结果\nimport sqlite3',
        expectedOutput: '2'
      },
      {
        id: 'db_sqlite_what_q4',
        type: 'blank',
        question: '补全：SQLite 整个数据库就是一个 ____ ；连接临时内存数据库时，地址写 ____ 。',
        blanks: [['文件'], [':memory:']],
        explanation: 'SQLite 零配置，一个文件就是一个库；":memory:" 在内存里建临时库，程序结束即清空。'
      }
    ]
  },
  {
    topicId: 'db_connect',
    questions: [
      {
        id: 'db_connect_q1',
        type: 'choice',
        question: '建表语句用哪个关键字？',
        options: ['NEW TABLE', 'CREATE TABLE', 'MAKE TABLE', 'NEW DB'],
        answerIndex: 1,
        explanation: 'CREATE TABLE 表名(字段 类型, ...) 用来创建表。'
      },
      {
        id: 'db_connect_q2',
        type: 'choice',
        question: 'INTEGER PRIMARY KEY 字段的作用是？',
        options: ['存储文本', '作为自增的唯一编号', '限制取值范围', '建立索引但不唯一'],
        answerIndex: 1,
        explanation: '主键是每行的唯一标识，INTEGER PRIMARY KEY 还会自动递增。'
      },
      {
        id: 'db_connect_q3',
        type: 'blank',
        question: '建一张商品表：id 整数主键，name 文本类型，price 小数类型。填出 price 的类型：price ____ 。',
        blanks: [['REAL']],
        explanation: 'SQLite 里整数用 INTEGER，小数用 REAL，文本用 TEXT。'
      },
      {
        id: 'db_connect_q4',
        type: 'blank',
        question: '补全：建表语句是 CREATE ____ 表名(...)；整数类型写 ____ ，文本类型写 TEXT。',
        blanks: [['TABLE'], ['INTEGER']],
        explanation: 'CREATE TABLE 表名(字段 类型) 用来建表；整数用 INTEGER，文本用 TEXT。'
      },
      {
        id: 'db_connect_q5',
        type: 'order',
        question: '把下面「连接数据库并建表」的步骤排正确。',
        items: ['用 sqlite3.connect 连接数据库文件', '创建 cursor 游标', '执行 CREATE TABLE 语句', '调用 commit() 提交'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先 connect 连接，再建游标，用游标执行建表语句，最后 commit 保存。'
      }
    ]
  },
  {
    topicId: 'db_insert',
    questions: [
      {
        id: 'db_insert_q1',
        type: 'choice',
        question: '往表里插入一行数据用哪条语句？',
        options: ['ADD ROW', 'INSERT INTO', 'PUT INTO', 'ADD TO'],
        answerIndex: 1,
        explanation: 'INSERT INTO 表(字段) VALUES(值) 插入记录。'
      },
      {
        id: 'db_insert_q2',
        type: 'multi',
        question: '关于 executemany 和占位符 ?，下列哪些说法正确？（多选）',
        options: [
          '? 由 sqlite3 自动转义，避免引号问题',
          '一次可以插入多行数据',
          '插入后必须调用 commit() 才生效',
          '占位符只能用于查询，不能用于插入'
        ],
        answerIndexes: [0, 1, 2],
        explanation: '占位符既用于插入也用于查询；executemany 批量插入，改完必须 commit。'
      },
      {
        id: 'db_insert_q3',
        type: 'code',
        question: '建 fruits 表并插入三种水果（苹果 5.5、香蕉 3.0、橙子 4.2），最后用 COUNT(*) 打印水果种类数。',
        starterCode: '# 任务：插入三种水果后，打印种类数\nimport sqlite3',
        expectedOutput: '3'
      },
      {
        id: 'db_insert_q4',
        type: 'blank',
        question: '补全：插入一行数据用 INSERT ____ 表名(...)；插入或修改数据后，必须调用 ____() 才真正写入数据库。',
        blanks: [['INTO'], ['commit']],
        explanation: 'INSERT INTO 表(字段) VALUES(值) 插入记录；改完一定要 commit 才生效。'
      },
      {
        id: 'db_insert_q5',
        type: 'order',
        question: '把下面「插入数据并查询」的步骤排正确。',
        items: ['用 cursor.execute 执行 INSERT 语句', '调用 commit() 提交事务', '用 cursor.execute 执行 SELECT 查询', '用 fetchall() 取出所有结果行'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先插入并提交，再执行 SELECT，最后 fetchall 取结果。'
      }
    ]
  },
  {
    topicId: 'db_select',
    questions: [
      {
        id: 'db_select_q1',
        type: 'choice',
        question: '要筛选「成绩大于 80」的行，应在 SELECT 后加？',
        options: ['IF score > 80', 'WHERE score > 80', 'HAVE score > 80', 'WHEN score > 80'],
        answerIndex: 1,
        explanation: 'WHERE 子句后跟筛选条件。'
      },
      {
        id: 'db_select_q2',
        type: 'choice',
        question: 'fetchall() 的作用是？',
        options: ['取一行结果', '取全部结果行', '删除结果', '统计行数'],
        answerIndex: 1,
        explanation: 'fetchall() 返回所有行的列表，fetchone() 只返回一行。'
      },
      {
        id: 'db_select_q3',
        type: 'code',
        question: '建 products 表（铅笔 2.0、笔记本 8.5、钢笔 15.0、橡皮 1.5），打印价格小于 10 的商品名和价格。',
        starterCode: '# 任务：打印价格 < 10 的商品，每行：名称 价格\nimport sqlite3',
        expectedOutput: '铅笔 2.0\n笔记本 8.5\n橡皮 1.5'
      },
      {
        id: 'db_select_q4',
        type: 'multi',
        question: '关于 SELECT 查询，下面哪些说法正确？（多选）',
        options: ['WHERE 用来筛选符合条件的行', 'ORDER BY 用来排序', 'LIMIT 用来限制返回的行数', 'SELECT * 表示只查第一列'],
        answerIndexes: [0, 1, 2],
        explanation: 'WHERE 筛行、ORDER BY 排序、LIMIT 限量；SELECT * 是查所有列，不是第一列。'
      },
      {
        id: 'db_select_q5',
        type: 'order',
        question: '把下面「查询并打印数据」的步骤排正确。',
        items: ['写好 SELECT ... WHERE ... 语句', '用 cursor.execute 执行这条 SQL', '用 fetchall() 拿到所有结果行', '用 for 循环逐行打印'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先写 SQL，再 execute 执行，然后 fetchall 取结果，最后循环打印。'
      }
    ]
  },
  {
    topicId: 'db_update_delete',
    questions: [
      {
        id: 'db_update_delete_q1',
        type: 'choice',
        question: '修改某一行成绩的正确语句是？',
        options: ['CHANGE students SET score=90', 'UPDATE students SET score=90 WHERE name=\'小林\'', 'SET score=90 FROM students', 'MODIFY students score=90'],
        answerIndex: 1,
        explanation: 'UPDATE 表 SET 字段=值 WHERE 条件，务必带 WHERE。'
      },
      {
        id: 'db_update_delete_q2',
        type: 'choice',
        question: '忘记写 WHERE 的 UPDATE 语句会怎样？',
        options: ['只改第一行', '报错', '把表里所有行的该字段都改掉', '什么都不做'],
        answerIndex: 2,
        explanation: '不带 WHERE 的 UPDATE/DELETE 会影响全表，是最危险的新手错误。'
      },
      {
        id: 'db_update_delete_q3',
        type: 'code',
        question: '建 books 表（西游 45、三国 60、水浒 38），把水浒价格改成 42，再按插入顺序打印所有书名和价格。',
        starterCode: '# 任务：更新水浒价格为 42，然后打印全部书\nimport sqlite3',
        expectedOutput: '西游 45.0\n三国 60.0\n水浒 42.0'
      },
      {
        id: 'db_update_delete_q4',
        type: 'blank',
        question: '补全：修改数据用 UPDATE 表名 SET 字段=值 ____ 条件；删除整行用 ____ FROM 表名。',
        blanks: [['WHERE'], ['DELETE']],
        explanation: 'UPDATE ... WHERE ... 修改符合条件的行；DELETE FROM 表名 WHERE ... 删除行；一定要带 WHERE。'
      }
    ]
  },
  {
    topicId: 'db_sort_agg',
    questions: [
      {
        id: 'db_sort_agg_q1',
        type: 'choice',
        question: '要按成绩从高到低排列并取前 3 名，正确写法是？',
        options: ['ORDER BY score LIMIT 3', 'ORDER BY score DESC LIMIT 3', 'SCORE TOP 3', 'SORT score FIRST 3'],
        answerIndex: 1,
        explanation: 'DESC 降序，LIMIT 3 取前三行。'
      },
      {
        id: 'db_sort_agg_q2',
        type: 'choice',
        question: '统计某列平均值用哪个函数？',
        options: ['TOTAL()', 'AVG()', 'MEAN()', 'AVERAGE()'],
        answerIndex: 1,
        explanation: 'SQLite 用 AVG() 求平均，另有 COUNT/SUM/MAX/MIN。'
      },
      {
        id: 'db_sort_agg_q3',
        type: 'code',
        question: '建 sales 表（上海 300、上海 500、北京 200、北京 400、北京 600），按城市分组打印总销售额。',
        starterCode: '# 任务：按城市分组打印总销售额，格式：城市 总销售额=金额\nimport sqlite3',
        expectedOutput: '上海 总销售额=800.0\n北京 总销售额=1200.0'
      },
      {
        id: 'db_sort_agg_q4',
        type: 'multi',
        question: '下面哪些是 SQLite 里的聚合函数？（多选）',
        options: ['COUNT(*)', 'SUM(列)', 'AVG(列)', 'PRINT(列)'],
        answerIndexes: [0, 1, 2],
        explanation: 'COUNT 计数、SUM 求和、AVG 平均，另有 MAX/MIN；没有 PRINT 这个 SQL 函数。'
      }
    ]
  },
  {
    topicId: 'db_param',
    questions: [
      {
        id: 'db_param_q1',
        type: 'choice',
        question: '在 sqlite3 中，查询参数推荐怎么传？',
        options: ['用 f-string 拼进 SQL', '用 + 拼接字符串', 'SQL 里写 ?，参数作为元组传给 execute', '直接写在 SQL 字符串里'],
        answerIndex: 2,
        explanation: '占位符 ? 配合参数元组，自动转义，安全且不会因引号报错。'
      },
      {
        id: 'db_param_q2',
        type: 'choice',
        question: '只有一个参数时，参数元组应该写成？',
        options: ['(keyword)', '(keyword,)', '[keyword]', 'keyword'],
        answerIndex: 1,
        explanation: '单元素元组必须带尾逗号 (keyword,)，否则只是普通值。'
      },
      {
        id: 'db_param_q3',
        type: 'code',
        question: '建 books 表（西游 45、三国 60），用占位符 ? 查询价格小于 50 的书，打印书名和价格。',
        starterCode: '# 任务：用 ? 占位符查询 price < 50 的书\nimport sqlite3',
        expectedOutput: '西游 45.0'
      },
      {
        id: 'db_param_q4',
        type: 'multi',
        question: '关于 sqlite3 的 ? 占位符参数化查询，下面哪些说法正确？（多选）',
        options: ['能防止 SQL 注入，更安全', '参数作为元组传给 execute', '引号会被自动处理，不会报错', '占位符只能用于查询，不能用于插入'],
        answerIndexes: [0, 1, 2],
        explanation: '占位符既用于查询也用于插入；它自动转义引号，安全且不会因引号出错。'
      }
    ]
  },
  {
    topicId: 'db_transaction',
    questions: [
      {
        id: 'db_transaction_q1',
        type: 'choice',
        question: '事务中撤销所有未提交修改用哪个方法？',
        options: ['cancel()', 'rollback()', 'undo()', 'reset()'],
        answerIndex: 1,
        explanation: 'rollback() 回滚本次事务，commit() 才是提交生效。'
      },
      {
        id: 'db_transaction_q2',
        type: 'order',
        question: '把银行转账的正确步骤排序：A 给 B 加钱、A 扣钱、出错时回滚、全部成功后提交。',
        items: ['给 B 的账户加上对应金额', '从 A 的账户扣除对应金额', '若中途异常则 rollback', '两笔都成功后 commit'],
        correctOrder: [1, 0, 2, 3],
        explanation: '先扣后加，包在 try/except 里，异常回滚，正常才提交。'
      },
      {
        id: 'db_transaction_q3',
        type: 'code',
        question: '建 wallet 表（甲 200、乙 50），让甲给乙转 100，提交后打印两人余额。',
        starterCode: '# 任务：甲给乙转 100，提交后打印 owner 和 money\nimport sqlite3',
        expectedOutput: '甲 100.0\n乙 150.0'
      },
      {
        id: 'db_transaction_q4',
        type: 'order',
        question: '把下面「使用 SQLite 连接」的完整生命周期排正确。',
        items: ['用 sqlite3.connect 连接数据库', '用 cursor.execute 执行 SQL 语句', '一切正常时调用 commit() 提交', '用完后调用 close() 关闭连接'],
        correctOrder: [0, 1, 2, 3],
        explanation: '先连接，再执行 SQL，正常就 commit，最后 close 关闭；出错时改用 rollback。'
      }
    ]
  }
];
