// python 系列测验组：追加到 quizData.ts 的 TOPIC_QUIZZES 数组中
import type { TopicQuiz } from '../quizData';

export const pythonQuizzes: TopicQuiz[] = [
  {
    topicId: 'p1_syntax',
    questions: [
      {
        id: 'p1_syntax_q1',
        type: 'choice',
        question: 'Python 中靠什么表示代码块的层级关系？',
        options: ['花括号 {}', '缩进', '分号 ;', '中括号 []'],
        answerIndex: 1,
        explanation: 'Python 用缩进表示代码块，同一层级的代码缩进必须一致。'
      },
      {
        id: 'p1_syntax_q2',
        type: 'choice',
        question: '下面哪一行是合法的 Python 注释？',
        options: ['// 这是注释', '# 这是注释', '<!-- 这是注释 -->', '/* 这是注释 */'],
        answerIndex: 1,
        explanation: 'Python 用 # 开头写注释，这一行的内容不会被执行。'
      },
      {
        id: 'p1_syntax_q3',
        type: 'multi',
        question: '下面哪些是合法的 Python 变量名？（多选，少选或多选都算错）',
        options: ['name', '2name', 'my_var', 'class'],
        answerIndexes: [0, 2],
        explanation: '变量名不能以数字开头（2name 不合法），也不能用关键字（class 不合法）。'
      },
      {
        id: 'p1_syntax_q4',
        type: 'blank',
        question: '补全：给变量 x 赋值 1 的写法是 ____ = 1；把它打印出来要用 ____(x)。',
        blanks: [['x'], ['print']],
        explanation: '赋值用 变量名 = 值；打印用内置函数 print()。'
      },
      {
        id: 'p1_syntax_q5',
        type: 'order',
        question: '把下面三行按「定义函数并调用」的正确顺序排列。',
        items: ['    print("hi")', 'greet()', 'def greet():'],
        correctOrder: [2, 0, 1],
        explanation: '先 def 定义函数，再写函数体（缩进），最后调用。'
      },
      {
        id: 'p1_syntax_q6',
        type: 'code',
        question: '用 print() 输出两行文本：第一行 Python，第二行 真好学。',
        starterCode: '# 任务：输出两行文本，第一行 Python，第二行 真好学',
        expectedOutput: 'Python\n真好学'
      }
    ]
  },
  {
    topicId: 'p1_comments',
    questions: [
      {
        id: 'p1_comments_q1',
        type: 'choice',
        question: '注释的主要作用是？',
        options: ['让程序运行更快', '给读代码的人做解释', '不加注释程序会报错', '把内容打印到屏幕'],
        answerIndex: 1,
        explanation: '注释是写给人类看的说明，方便自己和别人理解代码。'
      },
      {
        id: 'p1_comments_q2',
        type: 'choice',
        question: '被 # 注释掉的代码会怎样？',
        options: ['照常运行', '不会执行', '导致报错', '变成字符串'],
        answerIndex: 1,
        explanation: '被注释的内容不会被执行，常用来临时停用某段代码。'
      },
      {
        id: 'p1_comments_q3',
        type: 'code',
        question: '用注释停用一行代码，只输出文本：你好。',
        starterCode: '# 任务：用 # 注释掉一行代码，让程序只输出：你好\nprint("再见")\nprint("你好")',
        expectedOutput: '你好'
      }
    ]
  },
  {
    topicId: 'p1_variables',
    questions: [
      {
        id: 'p1_variables_q1',
        type: 'choice',
        question: 'age = 18 这句话的意思是？',
        options: ['age 和 18 相等', '把 18 存进变量 age 里', '打印 age', '删除变量 age'],
        answerIndex: 1,
        explanation: '等号把右边的值放进左边的变量中，之后可以用 age 取到 18。'
      },
      {
        id: 'p1_variables_q2',
        type: 'choice',
        question: '下面哪个是合法的变量名？',
        options: ['2age', 'my age', 'my_age', 'age!'],
        answerIndex: 2,
        explanation: '变量名不能以数字开头、不能含空格和特殊符号，可以用下划线。'
      },
      {
        id: 'p1_variables_q3',
        type: 'code',
        question: '定义一个变量 name 存放文本 小派，再把它打印出来。',
        starterCode: '# 任务：定义一个变量 name 存放文本 小派，再把它打印出来',
        expectedOutput: '小派'
      }
    ]
  },
  {
    topicId: 'p1_datatypes',
    questions: [
      {
        id: 'p1_datatypes_q1',
        type: 'choice',
        question: '"123" 是什么数据类型？',
        options: ['整数 int', '字符串 str', '浮点数 float', '列表 list'],
        answerIndex: 1,
        explanation: '用引号包起来的都是字符串，哪怕里面是数字。'
      },
      {
        id: 'p1_datatypes_q2',
        type: 'choice',
        question: '3.14 是什么数据类型？',
        options: ['int', 'float', 'str', 'bool'],
        answerIndex: 1,
        explanation: '带小数点的数字是浮点数 float。'
      },
      {
        id: 'p1_datatypes_q3',
        type: 'code',
        question: '用 type() 查看两个变量的类型并打印。',
        starterCode: '# 任务：用 type() 打印下面两个变量的类型\na = 10\nb = 3.14',
        expectedOutput: '<class \'int\'>\n<class \'float\'>'
      }
    ]
  },
  {
    topicId: 'p1_numbers',
    questions: [
      {
        id: 'p1_numbers_q1',
        type: 'choice',
        question: '7 // 2 的结果是？',
        options: ['3.5', '3', '4', '1'],
        answerIndex: 1,
        explanation: '// 是整除，只保留整数部分。'
      },
      {
        id: 'p1_numbers_q2',
        type: 'choice',
        question: '2 ** 3 等于多少？',
        options: ['6', '8', '9', '5'],
        answerIndex: 1,
        explanation: '** 是乘方，2 的 3 次方等于 8。'
      },
      {
        id: 'p1_numbers_q3',
        type: 'code',
        question: '打印 10 除以 3 的余数（用 % 运算符）。',
        starterCode: '# 任务：打印 10 除以 3 的余数\n# 提示：用 % 取余运算符',
        expectedOutput: '1'
      }
    ]
  },
  {
    topicId: 'p1_casting',
    questions: [
      {
        id: 'p1_casting_q1',
        type: 'choice',
        question: 'int("42") 的结果是？',
        options: ['"42"（字符串）', '42（整数）', '程序报错', '42.0（浮点数）'],
        answerIndex: 1,
        explanation: 'int() 把字符串形式的 42 转换成整数 42。'
      },
      {
        id: 'p1_casting_q2',
        type: 'choice',
        question: 'float(3) 的结果是？',
        options: ['3', '3.0', '"3"', '报错'],
        answerIndex: 1,
        explanation: 'float() 把整数 3 转换成浮点数 3.0。'
      },
      {
        id: 'p1_casting_q3',
        type: 'code',
        question: '把字符串 "7" 转成整数，再打印它的两倍。',
        starterCode: '# 任务：把字符串 "7" 转成整数，再打印它的两倍\n# 提示：先用 int() 转换，再乘以 2',
        expectedOutput: '14'
      }
    ]
  },
  {
    topicId: 'p1_strings',
    questions: [
      {
        id: 'p1_strings_q1',
        type: 'choice',
        question: '"Python"[1] 的结果是？',
        options: ['P', 'y', 't', '报错'],
        answerIndex: 1,
        explanation: '字符串下标从 0 开始，[1] 取的是第 2 个字符 y。'
      },
      {
        id: 'p1_strings_q2',
        type: 'choice',
        question: '"a" + "b" 的结果是？',
        options: ['ab', 'a b', '报错', '"a"+"b"'],
        answerIndex: 0,
        explanation: '+ 可以把两个字符串拼接在一起。'
      },
      {
        id: 'p1_strings_q3',
        type: 'code',
        question: '把 "学" 和 "Python" 拼接后打印。',
        starterCode: '# 任务：把 学 和 Python 拼在一起输出\n# 提示：字符串可以用 + 拼接',
        expectedOutput: '学Python'
      }
    ]
  },
  {
    topicId: 'p1_booleans',
    questions: [
      {
        id: 'p1_booleans_q1',
        type: 'choice',
        question: '5 > 3 的结果是？',
        options: ['True', 'False', '5', '"True"'],
        answerIndex: 0,
        explanation: '比较成立返回 True（真），不成立返回 False（假）。'
      },
      {
        id: 'p1_booleans_q2',
        type: 'choice',
        question: 'bool(0) 的结果是？',
        options: ['True', 'False', '报错', '0'],
        answerIndex: 1,
        explanation: '数字 0 在布尔判断中表示假，所以是 False。'
      },
      {
        id: 'p1_booleans_q3',
        type: 'code',
        question: '打印 10 是否大于 5 的结果。',
        starterCode: '# 任务：打印 10 是否大于 5 的判断结果',
        expectedOutput: 'True'
      }
    ]
  },
  {
    topicId: 'p1_operators',
    questions: [
      {
        id: 'p1_operators_q1',
        type: 'choice',
        question: '5 == 5 的结果是？',
        options: ['True', 'False', '报错', '"=="'],
        answerIndex: 0,
        explanation: '== 是比较是否相等，5 等于 5，所以是 True。'
      },
      {
        id: 'p1_operators_q2',
        type: 'choice',
        question: 'not True 的结果是？',
        options: ['True', 'False', '报错', 'None'],
        answerIndex: 1,
        explanation: 'not 表示取反，not True 就是 False。'
      },
      {
        id: 'p1_operators_q3',
        type: 'code',
        question: '分别打印 True and False 和 True or False 的结果。',
        starterCode: '# 任务：分别打印 True and False 和 True or False 的结果',
        expectedOutput: 'False\nTrue'
      }
    ]
  },
  {
    topicId: 'p2_list',
    questions: [
      {
        id: 'p2_list_q1',
        type: 'choice',
        question: '列表用什么符号定义？',
        options: ['圆括号 ()', '方括号 []', '花括号 {}', '尖括号 <>'],
        answerIndex: 1,
        explanation: '列表用 [] 定义，例如 [1, 2, 3]。'
      },
      {
        id: 'p2_list_q2',
        type: 'choice',
        question: '["a", "b", "c"][1] 的结果是？',
        options: ['a', 'b', 'c', '报错'],
        answerIndex: 1,
        explanation: '下标从 0 开始，[1] 是第二个元素 b。'
      },
      {
        id: 'p2_list_q3',
        type: 'code',
        question: '用 append() 在列表末尾添加一个元素并打印列表。',
        starterCode: '# 任务：在 fruits 末尾添加 "cherry"，再打印整个列表\nfruits = ["apple", "banana"]',
        expectedOutput: "['apple', 'banana', 'cherry']"
      }
    ]
  },
  {
    topicId: 'p2_tuple',
    questions: [
      {
        id: 'p2_tuple_q1',
        type: 'choice',
        question: '元组和列表最大的区别是？',
        options: ['元组一旦创建就不能修改', '元组的运行速度更慢', '元组不能打印', '元组必须是空的'],
        answerIndex: 0,
        explanation: '元组内容固定不可变，适合存不会变化的数据。'
      },
      {
        id: 'p2_tuple_q2',
        type: 'choice',
        question: '元组用什么符号定义？',
        options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
        answerIndex: 1,
        explanation: '元组用 () 定义，例如 (1, 2, 3)。'
      },
      {
        id: 'p2_tuple_q3',
        type: 'code',
        question: '创建一个元组并打印它。',
        starterCode: '# 任务：创建一个元组 (1, 2, 3) 并打印',
        expectedOutput: '(1, 2, 3)'
      }
    ]
  },
  {
    topicId: 'p2_set',
    questions: [
      {
        id: 'p2_set_q1',
        type: 'choice',
        question: '集合（set）最大的特点是？',
        options: ['元素有顺序', '元素不重复', '允许重复元素', '只能放数字'],
        answerIndex: 1,
        explanation: '集合里的元素不会重复，常用来去重和做集合运算。'
      },
      {
        id: 'p2_set_q2',
        type: 'choice',
        question: '集合用什么符号定义？',
        options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
        answerIndex: 2,
        explanation: '集合用 {} 定义，例如 {1, 2, 3}。'
      },
      {
        id: 'p2_set_q3',
        type: 'code',
        question: '用 & 求两个集合的交集并打印。',
        starterCode: '# 任务：求集合 a 和 b 的交集并打印\n# 提示：交集用 & 运算符\na = {1, 2, 3}\nb = {2, 3, 4}',
        expectedOutput: '{2, 3}'
      }
    ]
  },
  {
    topicId: 'p2_dict',
    questions: [
      {
        id: 'p2_dict_q1',
        type: 'choice',
        question: '字典用什么符号定义？',
        options: ['方括号 []', '圆括号 ()', '花括号 {}', '尖括号 <>'],
        answerIndex: 2,
        explanation: '字典用 {} 定义键值对，例如 {"name": "小明"}。'
      },
      {
        id: 'p2_dict_q2',
        type: 'choice',
        question: 'd = {"a": 1}，那么 d["a"] 的结果是？',
        options: ['a', '1', '报错', '{"a": 1}'],
        answerIndex: 1,
        explanation: '用键取值，d["a"] 返回对应的值 1。'
      },
      {
        id: 'p2_dict_q3',
        type: 'code',
        question: '从字典中取出姓名和年龄并打印。',
        starterCode: '# 任务：从 student 字典里取出姓名和年龄并打印\nstudent = {"name": "小明", "age": 10}',
        expectedOutput: '小明\n10'
      }
    ]
  },
  {
    topicId: 'p3_ifelse',
    questions: [
      {
        id: 'p3_ifelse_q1',
        type: 'choice',
        question: 'if 后面的条件为 True 时，会执行哪部分代码？',
        options: ['冒号后面缩进的代码块', 'else 后面的代码', '整份文件的代码', '什么都不执行'],
        answerIndex: 0,
        explanation: '条件成立就执行 if 块中缩进的代码，否则执行 else。'
      },
      {
        id: 'p3_ifelse_q2',
        type: 'choice',
        question: '要依次判断多个条件，应该用哪个关键字？',
        options: ['while', 'elif', 'def', 'import'],
        answerIndex: 1,
        explanation: 'elif 可以在 if 后面追加多个条件分支。'
      },
      {
        id: 'p3_ifelse_q3',
        type: 'code',
        question: '判断 age 是否成年（大于等于 18），成年输出文本：成年，否则输出文本：未成年。',
        starterCode: '# 任务：判断 age 是否成年（大于等于 18）\n# 成年输出文本：成年，否则输出文本：未成年\nage = 20',
        expectedOutput: '成年'
      }
    ]
  },
  {
    topicId: 'p3_while',
    questions: [
      {
        id: 'p3_while_q1',
        type: 'choice',
        question: 'while 循环什么时候会停止？',
        options: ['条件变为 False 时', '永远不会停止', '数到 10 时', '条件为 True 时'],
        answerIndex: 0,
        explanation: '只要条件为 True 就继续循环，条件为 False 时停止。'
      },
      {
        id: 'p3_while_q2',
        type: 'choice',
        question: '下面哪个语句可以立刻跳出循环？',
        options: ['break', 'pass', 'continue', 'return'],
        answerIndex: 0,
        explanation: 'break 会立即结束当前循环；continue 是跳过本次继续下一次。'
      },
      {
        id: 'p3_while_q3',
        type: 'code',
        question: '用 while 循环打印 1 到 3。',
        starterCode: '# 任务：用 while 循环打印 1 到 3\n# 提示：循环体里记得让 count 增加\ncount = 1',
        expectedOutput: '1\n2\n3'
      }
    ]
  },
  {
    topicId: 'p3_for',
    questions: [
      {
        id: 'p3_for_q1',
        type: 'choice',
        question: 'for x in [1, 2, 3] 会循环几次？',
        options: ['1 次', '2 次', '3 次', '4 次'],
        answerIndex: 2,
        explanation: '列表里有 3 个元素，循环体就执行 3 次。'
      },
      {
        id: 'p3_for_q2',
        type: 'choice',
        question: 'range(3) 生成的内容是？',
        options: ['[0, 1, 2]', '[1, 2, 3]', '[3]', '报错'],
        answerIndex: 0,
        explanation: 'range(3) 从 0 开始，生成 0、1、2 三个数。'
      },
      {
        id: 'p3_for_q3',
        type: 'code',
        question: '用 for 循环把名单里的名字逐个打印出来。',
        starterCode: '# 任务：用 for 循环把 names 里的名字逐个打印\nnames = ["小明", "小红", "小刚"]',
        expectedOutput: '小明\n小红\n小刚'
      }
    ]
  },
  {
    topicId: 'p3_input',
    questions: [
      {
        id: 'p3_input_q1',
        type: 'choice',
        question: 'input() 输入的内容是什么类型？',
        options: ['整数', '字符串', '列表', '布尔值'],
        answerIndex: 1,
        explanation: 'input() 一律返回字符串，需要数字时要用 int() 转换。'
      },
      {
        id: 'p3_input_q2',
        type: 'choice',
        question: '想把输入内容当数字用，应该怎么做？',
        options: ['input() 会自动转换', '用 int() 转换', '用 str() 转换', '无法转换'],
        answerIndex: 1,
        explanation: '例如 age = int(input("年龄："))，先把字符串转成整数。'
      },
      {
        id: 'p3_input_q3',
        type: 'code',
        question: '把字符串数字 "12" 转成整数，再打印它加 1 的结果。',
        starterCode: '# 任务：把字符串 "12" 转成整数，打印它加 1 的结果',
        expectedOutput: '13'
      }
    ]
  },
  {
    topicId: 'p3_formatting',
    questions: [
      {
        id: 'p3_formatting_q1',
        type: 'choice',
        question: '下面哪个是 f-string 的正确写法？',
        options: ['f"我的年龄是{age}"', 'f"我的年龄是age"', '"f{age}"', "f'age'"],
        answerIndex: 0,
        explanation: 'f 开头、花括号里放变量，就能把变量插入字符串。'
      },
      {
        id: 'p3_formatting_q2',
        type: 'choice',
        question: 'f"{3 + 2}" 的结果是？',
        options: ['5', '"3 + 2"', '报错', '3+2'],
        answerIndex: 0,
        explanation: '花括号里可以是表达式，会先算出结果再插入。'
      },
      {
        id: 'p3_formatting_q3',
        type: 'code',
        question: '用 f-string 打印文本：我叫小派，今年10岁。',
        starterCode: '# 任务：用 f-string 打印：我叫小派，今年10岁\nname = "小派"\nage = 10',
        expectedOutput: '我叫小派，今年10岁'
      }
    ]
  },
  {
    topicId: 'p4_functions',
    questions: [
      {
        id: 'p4_functions_q1',
        type: 'choice',
        question: '定义函数使用哪个关键字？',
        options: ['function', 'def', 'func', 'lambda'],
        answerIndex: 1,
        explanation: '用 def 关键字定义函数，例如 def greet():。'
      },
      {
        id: 'p4_functions_q2',
        type: 'choice',
        question: '函数把结果交还给调用方，使用哪个语句？',
        options: ['print', 'return', 'break', 'exit'],
        answerIndex: 1,
        explanation: 'return 会返回结果并结束函数，调用方可以拿到这个值。'
      },
      {
        id: 'p4_functions_q3',
        type: 'code',
        question: '定义一个 greet 函数，传入名字并输出问候语。',
        starterCode: '# 任务：定义函数 greet(name)，让它打印文本：你好，名字\n# 然后调用 greet("小明")',
        expectedOutput: '你好，小明'
      }
    ]
  },
  {
    topicId: 'p4_lambda',
    questions: [
      {
        id: 'p4_lambda_q1',
        type: 'choice',
        question: 'lambda 是什么？',
        options: ['一种循环结构', '匿名小函数', '一种数据类型', '注释写法'],
        answerIndex: 1,
        explanation: 'lambda 用来定义一行就能写完的匿名小函数。'
      },
      {
        id: 'p4_lambda_q2',
        type: 'choice',
        question: '(lambda x: x * 2)(3) 的结果是？',
        options: ['6', '9', '3', '报错'],
        answerIndex: 0,
        explanation: '把 3 传给 x，返回 3 * 2 = 6。'
      },
      {
        id: 'p4_lambda_q3',
        type: 'code',
        question: '用 lambda 定义求平方的小函数，计算 4 的平方。',
        starterCode: '# 任务：用 lambda 定义一个求平方的小函数，打印 4 的平方',
        expectedOutput: '16'
      }
    ]
  },
  {
    topicId: 'p4_array',
    questions: [
      {
        id: 'p4_array_q1',
        type: 'choice',
        question: 'array 和普通列表的主要区别是？',
        options: ['array 只能放同类型数据，更紧凑高效', '两者完全一样', 'array 容量更大', 'array 不能遍历'],
        answerIndex: 0,
        explanation: 'array 要求元素类型一致，内存更紧凑；日常用列表就够。'
      },
      {
        id: 'p4_array_q2',
        type: 'choice',
        question: 'Python 内置的可变序列类型叫什么？',
        options: ['array', 'list', 'listarray', 'arr'],
        answerIndex: 1,
        explanation: 'list 是 Python 内置的列表类型，[1, 2, 3] 就是列表。'
      },
      {
        id: 'p4_array_q3',
        type: 'code',
        question: '用 sum() 对列表求和并打印。',
        starterCode: '# 任务：用 sum() 计算列表的和并打印\nnums = [1, 2, 3, 4]',
        expectedOutput: '10'
      }
    ]
  },
  {
    topicId: 'p4_class',
    questions: [
      {
        id: 'p4_class_q1',
        type: 'choice',
        question: '定义类使用哪个关键字？',
        options: ['class', 'object', 'def', 'struct'],
        answerIndex: 0,
        explanation: '用 class 关键字定义类，例如 class Dog:。'
      },
      {
        id: 'p4_class_q2',
        type: 'choice',
        question: '创建类的一个对象（实例化）用哪种写法？',
        options: ['Dog.new()', 'Dog()', 'new Dog()', 'class Dog'],
        answerIndex: 1,
        explanation: '像调用函数一样 Dog() 就能创建对象。'
      },
      {
        id: 'p4_class_q3',
        type: 'code',
        question: '定义一个 Dog 类，创建对象并调用它的 bark 方法。',
        starterCode: '# 任务：定义一个 Dog 类，bark 方法打印文本：汪汪\n# 然后创建对象并调用 bark()',
        expectedOutput: '汪汪'
      }
    ]
  },
  {
    topicId: 'p4_inheritance',
    questions: [
      {
        id: 'p4_inheritance_q1',
        type: 'choice',
        question: '子类继承父类后，会怎样？',
        options: ['自动拥有父类的方法和属性', '失去所有功能', '必须重写所有方法', '无法创建对象'],
        answerIndex: 0,
        explanation: '继承让子类直接复用父类的代码，只需写自己特有的部分。'
      },
      {
        id: 'p4_inheritance_q2',
        type: 'choice',
        question: '让 Dog 继承 Animal，正确写法是？',
        options: ['class Dog(Animal):', 'class Dog extends Animal:', 'class Dog -> Animal:', 'class Dog inherit Animal:'],
        answerIndex: 0,
        explanation: '类名后加圆括号写上父类即可继承。'
      },
      {
        id: 'p4_inheritance_q3',
        type: 'code',
        question: '让 Dog 继承 Animal，并调用父类的 speak 方法。',
        starterCode: '# 任务：让 Dog 继承 Animal，创建 Dog 对象并调用 speak()\nclass Animal:\n    def speak(self):\n        print("动物叫")',
        expectedOutput: '动物叫'
      }
    ]
  },
  {
    topicId: 'p4_iterators',
    questions: [
      {
        id: 'p4_iterators_q1',
        type: 'choice',
        question: '迭代器每次取一个元素，使用哪个函数？',
        options: ['next()', 'push()', 'pop()', 'shift()'],
        answerIndex: 0,
        explanation: 'next() 每次返回迭代器的下一个元素。'
      },
      {
        id: 'p4_iterators_q2',
        type: 'choice',
        question: 'for 循环遍历可迭代对象时，背后调用的是？',
        options: ['迭代器协议', '递归', '多线程', '指针运算'],
        answerIndex: 0,
        explanation: 'for 循环本质上就是不断调用迭代器的 next 直到取完。'
      },
      {
        id: 'p4_iterators_q3',
        type: 'code',
        question: '把列表转成迭代器，用 next() 取前两个元素。',
        starterCode: '# 任务：用 next() 从迭代器里取前两个元素并打印\nit = iter([10, 20, 30])',
        expectedOutput: '10\n20'
      }
    ]
  },
  {
    topicId: 'p4_polymorphism',
    questions: [
      {
        id: 'p4_polymorphism_q1',
        type: 'choice',
        question: '多态带来的好处是？',
        options: ['不同类型对象可以用同一套代码统一调用', '代码运行更快', '不需要定义类', '减少内存占用'],
        answerIndex: 0,
        explanation: '只要对象都有同名方法，就能用循环统一调用，互不干扰。'
      },
      {
        id: 'p4_polymorphism_q2',
        type: 'choice',
        question: '两个类有同名方法，调用时会发生什么？',
        options: ['各自执行自己的方法', '程序报错', '只执行第一个类的', '随机执行一个'],
        answerIndex: 0,
        explanation: '多态让每个对象调用自己的同名方法，互不影响。'
      },
      {
        id: 'p4_polymorphism_q3',
        type: 'code',
        question: '猫和狗都有 make_sound 方法，用循环统一调用。',
        starterCode: '# 任务：猫和狗都有 make_sound 方法，用 for 循环统一调用\nclass Cat:\n    def make_sound(self):\n        print("喵喵")\n\nclass Dog:\n    def make_sound(self):\n        print("汪汪")',
        expectedOutput: '喵喵\n汪汪'
      }
    ]
  },
  {
    topicId: 'p4_scope',
    questions: [
      {
        id: 'p4_scope_q1',
        type: 'choice',
        question: '函数内部定义的变量属于？',
        options: ['局部变量', '全局变量', '常量', '静态变量'],
        answerIndex: 0,
        explanation: '函数内定义的变量是局部的，离开函数就不能访问。'
      },
      {
        id: 'p4_scope_q2',
        type: 'choice',
        question: '想在函数内修改全局变量，需要先做什么？',
        options: ['用 global 声明', '直接修改即可', '用 local 声明', '无法修改'],
        answerIndex: 0,
        explanation: '用 global 声明后，函数内才能修改全局变量。'
      },
      {
        id: 'p4_scope_q3',
        type: 'code',
        question: '在函数内读取全局变量并打印。',
        starterCode: '# 任务：在函数 show() 里读取全局变量 message 并打印\n# 然后调用 show()\nmessage = "你好"',
        expectedOutput: '你好'
      }
    ]
  },
  {
    topicId: 'p5_modules',
    questions: [
      {
        id: 'p5_modules_q1',
        type: 'choice',
        question: '导入模块使用哪个关键字？',
        options: ['include', 'import', 'using', 'require'],
        answerIndex: 1,
        explanation: '用 import 导入模块，例如 import math。'
      },
      {
        id: 'p5_modules_q2',
        type: 'choice',
        question: 'import math 之后，求 9 的平方根怎么写？',
        options: ['math.sqrt(9)', 'sqrt(9)', 'math->sqrt(9)', 'sqrt.math(9)'],
        answerIndex: 0,
        explanation: '用 模块名.函数名 的方式调用模块里的函数。'
      },
      {
        id: 'p5_modules_q3',
        type: 'code',
        question: '导入 math，计算 16 的平方根并打印。',
        starterCode: '# 任务：导入 math，打印 16 的平方根',
        expectedOutput: '4.0'
      }
    ]
  },
  {
    topicId: 'p5_datetime',
    questions: [
      {
        id: 'p5_datetime_q1',
        type: 'choice',
        question: '处理日期时间，应该用哪个模块？',
        options: ['time', 'datetime', 'date', 'clock'],
        answerIndex: 1,
        explanation: 'datetime 模块提供了日期、时间、时间差等常用功能。'
      },
      {
        id: 'p5_datetime_q2',
        type: 'choice',
        question: 'datetime.date(2026, 1, 1) 表示什么？',
        options: ['2026年1月1日这个日期', '一个时间戳', '一个字符串', '程序报错'],
        answerIndex: 0,
        explanation: 'date(年, 月, 日) 创建对应的日期对象。'
      },
      {
        id: 'p5_datetime_q3',
        type: 'code',
        question: '计算 1 月 5 日比 1 月 1 日晚几天。',
        starterCode: '# 任务：计算 1 月 5 日比 1 月 1 日晚几天\n# 提示：两个日期相减后取 .days\nfrom datetime import date\nd1 = date(2026, 1, 1)\nd2 = date(2026, 1, 5)',
        expectedOutput: '4'
      }
    ]
  },
  {
    topicId: 'p5_math',
    questions: [
      {
        id: 'p5_math_q1',
        type: 'choice',
        question: '圆周率 π 在 math 模块中的写法是？',
        options: ['math.pi', 'math.π', 'math.PI', 'pi()'],
        answerIndex: 0,
        explanation: 'math.pi 就是圆周率常量，约等于 3.14159。'
      },
      {
        id: 'p5_math_q2',
        type: 'choice',
        question: '向下取整（去掉小数部分）用哪个函数？',
        options: ['math.floor', 'math.ceil', 'math.round', 'math.abs'],
        answerIndex: 0,
        explanation: 'floor 向下取整，ceil 向上取整。'
      },
      {
        id: 'p5_math_q3',
        type: 'code',
        question: '计算半径 5 的圆面积（π * r * r），保留 2 位小数。',
        starterCode: '# 任务：计算半径 5 的圆的面积（π * r * r），保留 2 位小数\nimport math\nr = 5',
        expectedOutput: '78.54'
      }
    ]
  },
  {
    topicId: 'p5_json',
    questions: [
      {
        id: 'p5_json_q1',
        type: 'choice',
        question: '把 Python 对象转成 JSON 字符串用哪个函数？',
        options: ['json.loads', 'json.dumps', 'json.parse', 'json.stringify'],
        answerIndex: 1,
        explanation: 'dumps 把 Python 对象打包成 JSON 字符串。'
      },
      {
        id: 'p5_json_q2',
        type: 'choice',
        question: '把 JSON 字符串转回 Python 对象用哪个函数？',
        options: ['json.loads', 'json.dumps', 'json.read', 'json.open'],
        answerIndex: 0,
        explanation: 'loads 把 JSON 字符串解析成 Python 对象。'
      },
      {
        id: 'p5_json_q3',
        type: 'code',
        question: '把字典转成 JSON 字符串并打印（保留中文）。',
        starterCode: '# 任务：把 data 字典转成 JSON 字符串并打印（保留中文）\nimport json\ndata = {"name": "小明", "age": 10}',
        expectedOutput: '{"name": "小明", "age": 10}'
      }
    ]
  },
  {
    topicId: 'p5_regex',
    questions: [
      {
        id: 'p5_regex_q1',
        type: 'choice',
        question: 'Python 的正则表达式模块叫什么？',
        options: ['re', 'regex', 'reg', 'pattern'],
        answerIndex: 0,
        explanation: '正则模块名是 re，例如 import re。'
      },
      {
        id: 'p5_regex_q2',
        type: 'choice',
        question: 're.findall 的作用是？',
        options: ['找出所有匹配的内容', '替换匹配内容', '删除匹配内容', '编译正则'],
        answerIndex: 0,
        explanation: 'findall 会返回一个列表，包含所有匹配的结果。'
      },
      {
        id: 'p5_regex_q3',
        type: 'code',
        question: '用正则找出字符串里的所有数字。',
        starterCode: '# 任务：用正则找出 "a1b22c333" 里的所有数字\nimport re',
        expectedOutput: "['1', '22', '333']"
      }
    ]
  },
  {
    topicId: 'p5_pip',
    questions: [
      {
        id: 'p5_pip_q1',
        type: 'choice',
        question: '安装第三方库使用哪个命令？',
        options: ['pip install 库名', 'pip download 库名', 'import 库名', 'install 库名'],
        answerIndex: 0,
        explanation: 'pip install 是安装第三方库的标准命令。'
      },
      {
        id: 'p5_pip_q2',
        type: 'choice',
        question: '查看当前安装了哪些库，用哪个命令？',
        options: ['pip list', 'pip show all', 'pip info', 'pip view'],
        answerIndex: 0,
        explanation: 'pip list 会列出所有已安装的库和版本。'
      },
      {
        id: 'p5_pip_q3',
        type: 'choice',
        question: '导入一个库之前，首先要做什么？',
        options: ['确保它已安装，再 import', '先写注释', '先运行 print', '先保存文件'],
        answerIndex: 0,
        explanation: '第三方库要先安装成功，import 才能找到它。'
      }
    ]
  },
  {
    topicId: 'p5_tryexcept',
    questions: [
      {
        id: 'p5_tryexcept_q1',
        type: 'choice',
        question: '捕获异常使用什么结构？',
        options: ['try / except', 'if / else', 'for / break', 'while / continue'],
        answerIndex: 0,
        explanation: '把可能出错的代码放在 try 里，出错时执行 except 分支。'
      },
      {
        id: 'p5_tryexcept_q2',
        type: 'choice',
        question: '程序发生异常且被 except 捕获后，会发生什么？',
        options: ['程序崩溃退出', '继续执行 except 里的代码', '自动修复错误', '跳过整个文件'],
        answerIndex: 1,
        explanation: '捕获后程序不会崩溃，会执行 except 分支的代码。'
      },
      {
        id: 'p5_tryexcept_q3',
        type: 'code',
        question: '捕获除以 0 的异常，输出友好提示。',
        starterCode: '# 任务：捕获除以 0 的异常，输出文本：不能除以 0\n# 提示：用 try / except ZeroDivisionError',
        expectedOutput: '不能除以 0'
      }
    ]
  },
  {
    topicId: 'p5_file',
    questions: [
      {
        id: 'p5_file_q1',
        type: 'choice',
        question: '打开文件使用哪个函数？',
        options: ['open()', 'read()', 'file()', 'load()'],
        answerIndex: 0,
        explanation: 'open() 打开文件并返回文件对象，read/write 都是它提供的方法。'
      },
      {
        id: 'p5_file_q2',
        type: 'choice',
        question: '以写入模式打开文件用哪个模式符？',
        options: ['"w"', '"r"', '"a"', '"x"'],
        answerIndex: 0,
        explanation: '"w" 是写入模式（会覆盖原内容），"r" 是只读模式。'
      },
      {
        id: 'p5_file_q3',
        type: 'code',
        question: '把文本 你好 写入 test.txt，再读出来打印。',
        starterCode: '# 任务：把文本 你好 写入 test.txt，再读出来打印\n# 提示：可以用 with open(...) 打开文件',
        expectedOutput: '你好'
      }
    ]
  },
  {
    topicId: 'p6_mpl_start',
    questions: [
      {
        id: 'p6_mpl_start_q1',
        type: 'choice',
        question: '画折线图使用哪个函数？',
        options: ['plt.plot()', 'plt.bar()', 'plt.scatter()', 'plt.pie()'],
        answerIndex: 0,
        explanation: 'plot 把点连成线，是画折线图的基础函数。'
      },
      {
        id: 'p6_mpl_start_q2',
        type: 'choice',
        question: '画柱状图使用哪个函数？',
        options: ['plt.plot()', 'plt.bar()', 'plt.line()', 'plt.hist()'],
        answerIndex: 1,
        explanation: 'bar 用柱子高度表示数值大小，适合对比分类数据。'
      },
      {
        id: 'p6_mpl_start_q3',
        type: 'code',
        question: '用非交互后端画一张折线图，输出提示文字。',
        starterCode: '# 任务：用非交互后端（Agg）画一条折线图，并输出文本：绘图完成\n# 提示：import matplotlib 后先 matplotlib.use("Agg")，再导入 pyplot',
        expectedOutput: '绘图完成'
      }
    ]
  },
];
