import { TutorialStage, TutorialTopic } from '../tutorialData';

export const stage3: TutorialStage = {

  id: 'stage3',
  title: 'Python 控制流',
  icon: 'alt_route',
  topics: [
    {
      id: 'p3_ifelse',
      title: 'Python If Else',
      stage: 'Python 控制流',
      summary: '用 if 让程序「看情况办事」，像红绿灯一样分流。',
      content: {
        overview: '程序经常要「看情况办事」：如果……就……，否则就……。if 就是干这个的。它根据条件是真是假，决定执行哪一段代码，就像红绿灯决定车往哪走。',
        sections: [
          { heading: '生活小例子', text: '出门前看天气：如果下雨就带伞，否则就不带。程序里写成：if rain: 带伞，else: 不带。下雨（True）走带伞的分支，没下雨（False）走另一个分支，这就是 if/else。' },
          {
            heading: '分支结构完整语法',
            text: '• 基础语法：`if 条件:` 满足时执行\n• 多分支：`elif 条件:` 前面都不满足时判断\n• 收尾：`else:` 所有条件都不满足时执行\n• 注意：if/elif/else 是互斥的，只会执行第一个满足的分支',
            code: `score = 88
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"
print(f"分数 {score} 评定等级: {grade}")`
          },
          {
            heading: '三元表达式',
            text: '简单的二选一赋值可以用三元运算符一行写完，语法：\n`结果1 if 条件 else 结果2`\n条件为真返回结果1，为假返回结果2。适合简单赋值，复杂分支不建议滥用。',
            code: `score = 88
status = "Pass" if score >= 60 else "Fail"
print("最终考核状态:", status)

# 嵌套三元表达式（不推荐过度使用）
level = "优秀" if score >= 90 else "及格" if score >= 60 else "不及格"
print("评级:", level)`
          },
          {
            heading: 'match-case 模式匹配（Python 3.10+）',
            text: 'Python 3.10 新增 match-case 语法，支持更强大的模式匹配，适合多值分支场景。',
            code: `day = 3
match day:
    case 1:
        print("星期一")
    case 2:
        print("星期二")
    case 3 | 4 | 5:
        print("工作日中段")
    case 6 | 7:
        print("周末")
    case _:
        print("无效日期")`
          },
          {
            heading: '条件判断常见坑',
            text: '新手容易踩的分支判断陷阱：\n1. 混淆 `=` 和 `==`：赋值和相等判断搞混\n2. 浮点数直接用 `==` 比较：精度误差导致判断失败\n3. 多条件逻辑混乱：and 和 or 优先级搞错',
            code: `# 浮点数比较的正确姿势
a = 0.1 + 0.2
b = 0.3
print("直接 == 比较:", a == b)  # False
print("差值比较:", abs(a - b) < 1e-6)  # True，推荐写法`
          },
          {
            heading: '小结',
            text: 'if 条件: 后面跟缩进的代码，条件为 True 才执行；else 处理「否则」的情况；elif 可以接多个条件依次判断；x if 条件 else y 是三元的简写。'
          }
        ],
        codeExample: `num = -15
if num > 0:
    print("数值为正数")
elif num < 0:
    print("数值为负数")
else:
    print("数值为零")`,
        tips: [
          '使用嵌套分支时避免层级过深，可采用提前返回（Early Return）优化代码。',
          '条件较多时优先用字典映射替代多层 elif，代码更简洁易维护。'
        ]
      }
    },
    {
      id: 'p3_while',
      title: 'Python While 循环',
      stage: 'Python 控制流',
      summary: 'while 循环是「只要条件满足就一直重复」的循环。',
      content: {
        overview: 'while 循环就是「只要条件还成立，就一直重复做某件事」。它适合那种不知道要做多少次、由条件决定什么时候停下来的场景。',
        sections: [
          { heading: '生活小例子', text: '数钱直到数完：while 口袋里还有钱: 取出一张。条件（还有钱）为真就一直取，取完（没钱）就停。程序里 while count < 5: 就是「还没数到 5 就继续」。' },
          {
            heading: '循环控制关键字',
            text: '• `break`：立即彻底退出整个循环，不再判断条件\n• `continue`：跳过本次循环剩余代码，直接进入下一轮条件判断\n• `while-else`：当 while 循环自然结束（未被 break 中断）时执行 else 块',
            code: `count = 1
while count <= 5:
    print("循环迭代次数:", count)
    count += 1
else:
    print("while 循环自然执行完毕，未被 break 中断。")`
          },
          {
            heading: '死循环的识别与避免',
            text: '如果循环条件永远为 True，且循环内没有 break，就会形成死循环，导致程序卡死。\n编写 while 循环必须确保：\n1. 循环变量有初始值\n2. 循环体内更新循环变量\n3. 条件存在收敛的趋势',
            code: `# 正确的循环：count 不断增加，最终条件不成立
count = 0
while count < 3:
    print("安全循环:", count)
    count += 1

# 死循环示例（不要运行！）
# while True:
# •    print("死循环")`
          },
          {
            heading: '循环嵌套示例：九九乘法表',
            text: 'while 循环可以嵌套使用，外层循环控制行，内层循环控制列。',
            code: `i = 1
while i <= 9:
    j = 1
    while j <= i:
        print(f"{j}×{i}={i*j}", end="\t")
        j += 1
    print()  # 换行
    i += 1`
          },
          {
            heading: '小结',
            text: 'while 条件: 循环体，条件为 True 就一直执行；break 立刻跳出循环，continue 跳过本次继续下一轮；小心死循环——条件一直为 True 且没有 break，程序会永远转下去。'
          }
        ],
        codeExample: `idx = 0
while idx < 10:
    idx += 1
    if idx % 2 == 0:
        continue  # 跳过偶数
    if idx > 7:
        break     # 大于7退出循环
    print("奇数打印:", idx)`,
        tips: [
          '在编写 while 循环时，必须确保循环条件存在收敛趋势，防止引发无限死循环。',
          '循环次数确定的场景优先用 for 循环，逻辑更清晰，不易写出死循环。'
        ]
      }
    },
    {
      id: 'p3_for',
      title: 'Python For 循环',
      stage: 'Python 控制流',
      summary: 'for 循环是「挨个处理」的循环，遍历列表、字符串超方便。',
      content: {
        overview: 'for 循环用来「挨个处理」一串东西：列表里的每个元素、字符串里的每个字符，都能依次取出来处理。它是最常用的循环，比 while 更适合「数得清」的场景。',
        sections: [
          { heading: '生活小例子', text: '点名：老师拿着名单，从第一个同学念到最后一个。for name in ["小明", "小红", "小刚"]: 依次把每个人念出来，不用手动数下标，非常省事。' },
          {
            heading: 'range() 生成器详解',
            text: '`range(start, stop[, step])` 生成等差整数序列，惰性计算，不占内存。\n• 一个参数：`range(n)` 生成 0 到 n-1\n• 两个参数：`range(a, b)` 生成 a 到 b-1\n• 三个参数：`range(a, b, step)` 指定步长，步长为负可倒序',
            code: `print("0到4:", list(range(5)))
print("3到7:", list(range(3, 8)))
print("0到10偶数:", list(range(0, 11, 2)))
print("10到1倒序:", list(range(10, 0, -1)))`
          },
          {
            heading: '常用迭代辅助工具',
            text: '• `enumerate(iterable, start=0)`：同时获取索引序号与元素，避免手动计数\n• `zip(iter1, iter2)`：并行配对多个可迭代对象，按最短的结束\n• 两个工具可以组合使用',
            code: `fruits = ["apple", "banana", "cherry"]
prices = [10.5, 5.0, 15.8]

# enumerate 与 zip 结合
for idx, (fruit, price) in enumerate(zip(fruits, prices), start=1):
    print(f"序号 [{idx}] 水果: {fruit:<8} | 单价: ￥{price:.2f}")`
          },
          {
            heading: 'for-else 语法',
            text: '和 while-else 类似，for 循环正常遍历完（没被 break 中断）就执行 else。常用于查找场景：找到就 break，没找到执行 else 提示。',
            code: `numbers = [1, 3, 5, 7, 9]
target = 6

for num in numbers:
    if num == target:
        print("找到目标数字:", target)
        break
else:
    print("列表中没有找到", target)`
          },
          {
            heading: '小结',
            text: 'for 变量 in 可迭代对象: 循环体，依次取出每个元素；range(5) 生成 0 到 4，用来控制循环次数；enumerate() 同时拿到序号和元素；zip() 可以同时遍历多个列表。'
          }
        ],
        codeExample: `# 计算 1 至 100 的累加加和
total_sum = sum(range(1, 101))
print("1 到 100 累加加和结果:", total_sum)`,
        tips: [
          '`range()` 对象不会在内存中预先装载完整列表，而是采用按需生成机制。',
          '需要索引时优先用 enumerate，不要用 for i in range(len(lst)) 这种写法。'
        ]
      }
    },
    {
      id: 'p3_input',
      title: 'Python 命令输入',
      stage: 'Python 控制流',
      summary: '用 input() 让程序「问用户问题」，拿到回答再继续。',
      content: {
        overview: 'input() 让程序停下来问用户问题，等用户输入文字并按回车，再把输入的内容交给程序处理。记住：它拿到的永远是文字（字符串）。',
        sections: [
          { heading: '生活小例子', text: '猜年龄小游戏：input("你多大了？") 会停下来等你输入。比如输入 18，程序拿到的是文字 "18"，想用来算年龄，就得先 int() 转成数字。' },
          {
            heading: '基础输入与类型转换',
            text: 'input() 永远返回字符串，获取数字必须手动强转。\n非合法输入强转会抛出 ValueError，需要用 try-except 捕获处理。',
            code: `# 模拟控制台输入（Python You 环境演示）
raw_value = "25"
try:
    age = int(raw_value)
    print(f"校验成功，用户年龄: {age} 岁")
except ValueError:
    print("输入格式错误，无法转换为有效的整数")`
          },
          {
            heading: '一行输入多个数据',
            text: '用户输入多个数据时，用 split() 分割，再批量转类型。',
            code: `# 模拟一行输入多个数字
mock_input = "10.5, 20.3, 30.2"
float_numbers = [float(x.strip()) for x in mock_input.split(",") if x.strip()]
print("解析浮点数据列表:", float_numbers)
print("求和结果:", sum(float_numbers))`
          },
          {
            heading: '完整交互示例：猜数字游戏',
            text: '结合循环、分支、输入与异常处理，实现完整小游戏逻辑。',
            code: `# 简化版猜数字游戏
import random
answer = random.randint(1, 100)
guesses = 0

# 模拟 3 次猜测
for guess_str in ["50", "abc", "75"]:
    guesses += 1
    try:
        guess = int(guess_str)
    except ValueError:
        print("请输入有效数字！")
        continue
    
    if guess > answer:
        print("猜大了")
    elif guess < answer:
        print("猜小了")
    else:
        print(f"恭喜猜对了！答案就是 {answer}，用了 {guesses} 次")
        break`
          },
          {
            heading: '小结',
            text: 'input("提示语") 返回用户输入的文字（字符串）；数字输入记得用 int() 或 float() 转换；输入可能出错，配合 try/except 异常处理程序更稳。'
          }
        ],
        codeExample: `mock_input = "10.5, 20.3, 30.2"
float_numbers = [float(x.strip()) for x in mock_input.split(",") if x.strip()]
print("解析浮点数据列表:", float_numbers)`,
        tips: [
          '在 Python You 交互终端中，命令行支持实时模拟用户输入的交互操作。',
          '处理用户输入一定要加异常校验，不要假设用户会按要求输入。'
        ]
      }
    },
    {
      id: 'p3_formatting',
      title: 'Python 字符串格式化',
      stage: 'Python 控制流',
      summary: '把变量「塞进」句子里，用 f-string 最方便。',
      content: {
        overview: '字符串格式化就是把变量的值「塞进」一段文字里。比如「我今年 18 岁」，18 是变量，怎么把它放进句子里？Python 有 f-string、format()、% 三种方法，其中 f-string 最好用。',
        sections: [
          { heading: '生活小例子', text: '发朋友圈：「今天跑了 5 公里」。如果公里数是变量 km，用 f-string 直接写：f"今天跑了 {km} 公里"，把变量放进花括号里，句子自动拼好。' },
          {
            heading: '三种格式化方案对比',
            text: '',
            table: {
              headers: ['方案', '语法示例', '优点', '缺点', '推荐程度'],
              rows: [
                ['f-string', 'f"{name}: {age}"', '简洁直观、速度最快、功能强', 'Python 3.6+ 才支持', '★★★★★ 推荐'],
                ['str.format()', '"{}: {}".format(name, age)', '功能丰富、兼容旧版本', '写法稍繁琐', '★★★ 兼容用'],
                ['% 格式化', '"%s: %d" % (name, age)', '最传统、写法简单', '功能弱、易出错', '• 不推荐']
              ]
            }
          },
          {
            heading: 'f-string 格式修饰符详解',
            text: '在大括号 `{value:format_spec}` 内使用格式修饰符控制展示效果：',
            table: {
              headers: ['控制格式', '语法', '输入', '输出', '功能说明'],
              rows: [
                ['保留小数', '{val:.2f}', '3.14159', '3.14', '四舍五入保留指定位数'],
                ['百分比', '{val:.1%}', '0.856', '85.6%', '自动转为百分比显示'],
                ['补零填充', '{val:05d}', '42', '00042', '整数前导补零对齐'],
                ['对齐宽度', '{val:>10}', '"Py"', '•        Py', '右对齐，限定总宽度'],
                ['千分位', '{val:,}', '1000000', '1,000,000', '大数值添加千分位分隔符'],
                ['进制转换', '{val:x}', '255', 'ff', '转十六进制']
              ]
            },
            code: `pi = 3.1415926535
revenue = 12500000
print(f"圆周率精确到 4 位小数: {pi:.4f}")
print(f"公司年度营收(千分位): ￥{revenue:,}")
print(f"百分比显示: {0.856:.1%}")`
          },
          {
            heading: 'f-string 高级用法',
            text: 'f-string 大括号内可以直接写表达式、调用函数，非常灵活。',
            code: `name = "Alice"
score = 92
print(f"学生: {name.upper()}, 评级: {'优秀'• if score >= 90 else '良好'}")

# 自文档化写法（Python 3.8+）
x = 10
y = 20
print(f"{x = }, {y = }, {x + y = }")`
          },
          {
            heading: '小结',
            text: 'f-string 写法：f"文字 {变量}"，最直观；format() 用 {} 占位，适合反复套用的模板；% 是早期写法，了解一下即可；f-string 里还能写简单表达式，比如 {a + b}。'
          }
        ],
        codeExample: `val = 42
print(f"二进制: {val:b} | 八进制: {val:o} | 十六进制: {val:x}")`,
        tips: [
          'f-string 可以在 `{}` 中直接调用函数或计算表达式（如 `{x.upper()}`）。',
          '新项目统一使用 f-string，旧代码兼容才考虑 str.format()。'
        ]
      }
    }
  ]
};
