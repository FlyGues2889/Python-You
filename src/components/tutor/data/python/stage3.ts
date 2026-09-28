import { TutorialStage, TutorialTopic } from '../../tutorialData';

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
          { heading: '分支结构完整语法', text: '出门前看天气：如果下雨就带伞，否则就不带。程序里写成：if rain: 带伞，else: 不带。下雨（True）走带伞的分支，没下雨（False）走另一个分支，这就是 if/else。\n\n• 基础语法：`if 条件:` 满足时执行\n• 多分支：`elif 条件:` 前面都不满足时判断\n• 收尾：`else:` 所有条件都不满足时执行\n• 注意：if/elif/else 是互斥的，只会执行第一个满足的分支',
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
          { heading: '循环控制关键字', text: '数钱直到数完：while 口袋里还有钱: 取出一张。条件（还有钱）为真就一直取，取完（没钱）就停。程序里 while count < 5: 就是「还没数到 5 就继续」。\n\n• `break`：立即彻底退出整个循环，不再判断条件\n• `continue`：跳过本次循环剩余代码，直接进入下一轮条件判断\n• `while-else`：当 while 循环自然结束（未被 break 中断）时执行 else 块',
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
          { heading: 'range() 生成整数序列', text: '点名：老师拿着名单，从第一个同学念到最后一个。for name in ["小明", "小红", "小刚"]: 依次把每个人念出来，不用手动数下标，非常省事。\n\n`range(start, stop[, step])` 生成等差整数序列，惰性计算，不占内存。\n• 一个参数：`range(n)` 生成 0 到 n-1\n• 两个参数：`range(a, b)` 生成 a 到 b-1\n• 三个参数：`range(a, b, step)` 指定步长，步长为负可倒序',
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
        ],
        codeExample: `# 用 for 循环逐个遍历列表并累加
numbers = [10, 20, 30, 40, 50]
total = 0
for n in numbers:
    total += n
    print(f"加入 {n}，当前合计 {total}")

# 再用 for 循环配合 range() 累加 1 到 5 的平方
squares = 0
for i in range(1, 6):
    squares += i * i
print("1 到 5 的平方和:", squares)`,
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
          { heading: '基础输入与类型转换', text: '猜年龄小游戏：input("你多大了？") 会停下来等你输入。比如输入 18，程序拿到的是文字 "18"，想用来算年龄，就得先 int() 转成数字。\n\ninput() 永远返回字符串，获取数字必须手动强转。\n非合法输入强转会抛出 ValueError，需要用 try-except 捕获处理。',
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
          { heading: '三种格式化方案对比', text: '发朋友圈：「今天跑了 5 公里」。如果公里数是变量 km，用 f-string 直接写：f"今天跑了 {km} 公里"，把变量放进花括号里，句子自动拼好。\n\n',
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
            heading: 'f-string 格式修饰符',
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
        ],
        codeExample: `val = 42
print(f"二进制: {val:b} | 八进制: {val:o} | 十六进制: {val:x}")`,
        tips: [
          'f-string 可以在 `{}` 中直接调用函数或计算表达式（如 `{x.upper()}`）。',
          '新项目统一使用 f-string，旧代码兼容才考虑 str.format()。'
        ]
      }
    },
    {
      id: 'p3_pass',
      title: 'pass 占位语句',
      stage: 'Python 控制流',
      summary: '语法要求缩进块不能为空，pass 就是那个「先占个位」的空语句。',
      content: {
        overview: 'Python 的 if、for、while、函数定义后面跟的缩进块至少要有一行代码，否则会报语法错误。但你可能只想先把结构搭好、以后再填实现，这时用 pass 占个位就行，它什么都不做。',
        sections: [
          {
            heading: 'pass 的作用',
            text: 'pass 是一个空操作语句：解释器看到它就直接跳过，不产生任何效果。它专门用来满足「缩进块不能空」的语法要求，常见于暂时没写完的分支、函数、类。',
            code: `for i in range(3):
    if i == 1:
        pass      # 以后再处理 i==1 的情况
    else:
        print("处理 i =", i)

# 暂时空着的函数
def todo():
    pass

print("程序继续运行")`
          },
          {
            heading: 'pass 与注释、... 的区别',
            text: '只写注释不行，因为注释会被解释器完全忽略，缩进块等于还是空的。`...`（三个点）在 Python 里是 Ellipsis 对象，语法上也能当占位用，但 pass 是语义最明确的占位语句。',
            code: `# 下面两种占位写法都合法
def case_a():
    pass

def case_b():
    ...

print("两个占位函数都能正常调用")`
          }
        ],
        codeExample: `for i in range(3):
    if i == 1:
        pass
    else:
        print("处理 i =", i)`,
        tips: [
          '写完 pass 记得以后回来补上真正的逻辑，否则它会悄悄吞掉该处理的情况。',
          '在异常处理里 `except: pass` 会吞掉所有错误，调试时要特别小心。'
        ]
      }
    },
    {
      id: 'p3_nested_break',
      title: '嵌套循环中的 break 与 continue',
      stage: 'Python 控制流',
      summary: 'break 和 continue 只作用于它所在的那一层循环，不会同时跳出外层。',
      content: {
        overview: '循环套循环时，新手常误以为 break 能一下子跳出所有层。实际上 break 和 continue 都只属于离它最近的那一层 for 或 while，外层循环完全不受影响。想一次跳出多层需要额外技巧。',
        sections: [
          {
            heading: 'break 只跳出内层',
            text: '下面这段代码里，break 在内层循环，它只结束内层那一遍，外层继续走下一行。要跳出外层，可以用标志变量或把循环包进函数里用 return。',
            code: `for outer in range(3):
    print("外层:", outer)
    for inner in range(5):
        if inner == 2:
            break       # 只跳出内层
        print("  内层:", inner)`
          },
          {
            heading: 'continue 也只跳过内层本次',
            text: 'continue 同样只影响内层：它跳过内层本轮剩下的代码，进入内层下一次迭代，外层照常继续。',
            code: `for outer in range(2):
    print("外层:", outer)
    for inner in range(4):
        if inner == 1:
            continue    # 跳过内层 inner==1
        print("  内层:", inner)`
          },
          {
            heading: '一次跳出多层的常用办法',
            text: 'Python 没有「break 两层」的语法。常见做法是用一个标志变量，外层每轮检查一次；或者把多层循环写进一个函数，找到就用 return 直接返回。',
            code: `found = False
for outer in range(3):
    for inner in range(3):
        if outer == 1 and inner == 1:
            found = True
            break
    if found:
        break
print("找到了，两层都退出")`
          }
        ],
        codeExample: `for outer in range(3):
    for inner in range(5):
        if inner == 2:
            break
        print(outer, inner)`,
        tips: [
          'break/continue 永远作用于最近的一层循环，这是 Python 的固定规则。',
          '嵌套超过两层会很难维护，考虑拆成函数或用列表推导式简化。'
        ]
      }
    },
    {
      id: 'p3_builtins',
      title: '内置函数 min、max、sum',
      stage: 'Python 控制流',
      summary: '求最小值、最大值、求和，不用手写循环，一行内置函数搞定。',
      content: {
        overview: '求一串数的最大、最小、总和，是最常见的统计操作。Python 内置了 min()、max()、sum() 三个函数，直接传进去一个可迭代对象就行，比手写循环又短又快。',
        sections: [
          {
            heading: 'min 与 max',
            text: '`min(可迭代对象)` 返回最小值，`max(可迭代对象)` 返回最大值。也可以直接传多个参数 `min(3, 1, 2)`。对字符串列表，按字典序比较；要按长度比，传 key 参数。',
            code: `nums = [5, 2, 9, 1, 7]
print("最小值:", min(nums))
print("最大值:", max(nums))

print("直接传多个参数:", min(3, 1, 2))

words = ["banana", "pi", "apple"]
print("最短单词:", min(words, key=len))
print("最长单词:", max(words, key=len))`
          },
          {
            heading: 'sum 求和',
            text: '`sum(可迭代对象)` 把里面所有数加起来。可选第二个参数指定初始值，默认从 0 开始。注意 sum 只能算数字，不能用来拼接字符串（拼接字符串用 "".join()）。',
            code: `nums = [1, 2, 3, 4, 5]
print("总和:", sum(nums))
print("从 100 开始加:", sum(nums, 100))

# 1 到 100 求和
print("1+...+100 =", sum(range(1, 101)))`
          }
        ],
        codeExample: `nums = [5, 2, 9, 1, 7]
print("最小值:", min(nums), "最大值:", max(nums), "总和:", sum(nums))`,
        tips: [
          'sum([]) 返回 0，对空列表安全；min([]) 和 max([]) 会报错。',
          '拼接字符串用 `"".join(list)`，不要用 sum，又慢又容易错。'
        ]
      }
    },
    {
      id: 'p3_loop_else',
      title: 'while-else 与 for-else 应用场景',
      stage: 'Python 控制流',
      summary: '循环自然结束才执行 else，被 break 打断就跳过，最适合「找没找到」。',
      content: {
        overview: 'Python 的循环可以带一个 else 块：循环从头到尾自然走完（没有被 break 打断）时执行 else；只要中途 break 了，else 就不执行。这看起来反直觉，但非常适合「查找失败」的场景。',
        sections: [
          {
            heading: '执行规则',
            text: '记住一句话：else 对应的是「没被 break 的循环」。while 条件变 False 自然结束、for 遍历完所有元素，都会走 else；任何一条 break 都会让 else 被跳过。continue 不影响 else。',
            code: `# 自然结束：走 else
n = 3
while n > 0:
    print("倒数:", n)
    n -= 1
else:
    print("循环自然结束")

# 被 break：不走 else
for x in [1, 2, 3]:
    if x == 2:
        break
else:
    print("这行不会打印")`
          },
          {
            heading: '典型应用：查找失败',
            text: '最经典的用法是在列表里找某个值：找到就 break，没找到就走 else 报告「不存在」。比用一个 found 标志变量更简洁。',
            code: `numbers = [4, 8, 15, 16, 23]
target = 42

for num in numbers:
    if num == target:
        print("找到目标:", target)
        break
else:
    print("列表里没有", target)`
          }
        ],
        codeExample: `numbers = [4, 8, 15, 16, 23]
for num in numbers:
    if num == 42:
        print("找到了")
        break
else:
    print("没找到 42")`,
        tips: [
          'else 属于循环而不是 if，新手容易忽略这一点，缩进要对齐 for/while。',
          '不是所有循环都需要 else，只在「查找失败要提示」这类场景才用它。'
        ]
      }
    },
    {
      id: 'p3_iter_tools',
      title: 'enumerate 与 zip 正式教学',
      stage: 'Python 控制流',
      summary: 'enumerate 同时拿到下标和元素，zip 把多个列表按位置配对。',
      content: {
        overview: '遍历列表时，你经常既想要元素本身，又想要它的序号；或者想同时遍历两个列表。手写 range(len()) 又丑又慢，Python 提供了 enumerate 和 zip 两个专门工具。',
        sections: [
          {
            heading: 'enumerate：带序号遍历',
            text: '`enumerate(可迭代对象, start=0)` 每次返回一个 (序号, 元素) 元组。start 可以指定序号从几开始，默认从 0。它替代了 `for i in range(len(lst)): lst[i]` 这种写法。',
            code: `fruits = ["apple", "banana", "cherry"]

for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# 序号从 1 开始
for i, fruit in enumerate(fruits, start=1):
    print(f"第 {i} 名: {fruit}")`
          },
          {
            heading: 'zip：并行配对多个可迭代对象',
            text: '`zip(a, b, c...)` 把多个可迭代对象按位置一一配对，每次返回一个元组 `(a[0], b[0])`、`(a[1], b[1])`……最短的那个用完就停。它最适合把两个列表合成键值对。',
            code: `names = ["Alice", "Bob", "Cara"]
scores = [95, 88, 76]

for name, score in zip(names, scores):
    print(f"{name}: {score} 分")

# 长度不一致时按短的截断
print("配对结果:", list(zip([1, 2, 3], ["a", "b"])))

# 合成字典
d = dict(zip(names, scores))
print("字典:", d)`
          },
          {
            heading: 'enumerate 与 zip 组合',
            text: '两个工具可以一起用：既想编号，又想同时遍历两个列表。注意 zip 出来的是元组，要先解包再和 enumerate 的序号组合。',
            code: `names = ["Alice", "Bob", "Cara"]
scores = [95, 88, 76]

for i, (name, score) in enumerate(zip(names, scores), 1):
    print(f"[{i}] {name} = {score}")`
          }
        ],
        codeExample: `for i, (name, score) in enumerate(zip(["Alice", "Bob"], [95, 88]), 1):
    print(f"[{i}] {name}: {score}")`,
        tips: [
          'zip 在 Python 3 里返回的是惰性对象，要用 list() 才能看到全部结果。',
          '需要索引时永远优先 enumerate，不要写 range(len())。'
        ]
      }
    },
    {
      id: 'p3_func_tools',
      title: 'map、filter 与 sorted',
      stage: 'Python 控制流',
      summary: 'map 批量变换、filter 批量筛选，sorted 配合 key 灵活排序。',
      content: {
        overview: '对整组数据做「每个都变换一下」或「挑出符合条件的」，除了写 for 循环和列表推导式，Python 还有 map() 和 filter() 两个内置函数。另外 sorted() 和 list.sort() 的区别以及 key 用法值得专门记一下。',
        sections: [
          {
            heading: 'map：批量变换',
            text: '`map(函数, 可迭代对象)` 把函数依次作用到每个元素上，返回一个惰性的 map 对象。比如 `map(int, ["1","2","3"])` 把字符串列表批量转成整数。要看到结果用 list()。',
            code: `nums_str = ["1", "2", "3", "4"]
nums = list(map(int, nums_str))
print("批量转整数:", nums)

# 配合 lambda
doubled = list(map(lambda x: x * 2, nums))
print("翻倍:", doubled)`
          },
          {
            heading: 'filter：批量筛选',
            text: '`filter(函数, 可迭代对象)` 只保留函数返回 True 的元素。等价于列表推导式 `[x for x in lst if 条件]`。',
            code: `nums = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, nums))
print("偶数:", evens)

# 等价的列表推导式写法
print("推导式写法:", [x for x in nums if x % 2 == 0])`
          },
          {
            heading: 'sorted 与 key 参数',
            text: '`sorted(可迭代对象)` 返回一个排好序的新列表，原列表不动；它支持 key 和 reverse 参数。和 list.sort() 的区别是：sort 原位修改返回 None，sorted 返回新列表。',
            code: `pairs = [("小明", 85), ("小红", 92), ("小刚", 78)]
by_score = sorted(pairs, key=lambda x: x[1])
print("按成绩升序:", by_score)

by_score_desc = sorted(pairs, key=lambda x: x[1], reverse=True)
print("按成绩降序:", by_score_desc)`
          }
        ],
        codeExample: `nums = [1, 2, 3, 4, 5, 6]
print("翻倍:", list(map(lambda x: x*2, nums)))
print("偶数:", list(filter(lambda x: x%2==0, nums)))
print("排序:", sorted([3, 1, 2]))`,
        tips: [
          'map 和 filter 返回惰性对象，不 list() 一下不会立刻算出结果。',
          '实际项目里列表推导式通常比 map/filter 更易读，map/filter 了解即可。'
        ]
      }
    },
    {
      id: 'p3_percent_fmt',
      title: '% 格式化详细用法',
      stage: 'Python 控制流',
      summary: '最古老的百分号格式化，虽然不推荐新项目用，但读旧代码一定会遇到。',
      content: {
        overview: '% 格式化是 Python 最早的字符串拼接方式，语法来自 C 语言。现在新项目推荐 f-string，但你在旧代码、日志里还会大量见到它，所以必须认识。',
        sections: [
          {
            heading: '常用格式符',
            text: '在字符串里用 `%格式符` 占位，字符串后面跟 `% (值1, 值2...)`。常用格式符：`%s` 字符串、`%d` 整数、`%f` 浮点数、`%.2f` 保留两位小数、`%x` 十六进制。',
            table: {
              headers: ['格式符', '含义', '例子', '输出'],
              rows: [
                ['%s', '字符串', '"%s" % "hi"', 'hi'],
                ['%d', '整数', '"%d" % 42', '42'],
                ['%f', '浮点数', '"%f" % 3.14', '3.140000'],
                ['%.2f', '两位小数', '"%.2f" % 3.14159', '3.14'],
                ['%5d', '宽度5右对齐', '"%5d" % 42', '   42'],
                ['%-5d', '宽度5左对齐', '"%-5d" % 42', '42   ']
              ]
            },
            code: `name = "Alice"
age = 18
pi = 3.14159

print("%s 今年 %d 岁" % (name, age))
print("圆周率保留两位: %.2f" % pi)
print("整数补宽度: [%5d]" % 42)`
          },
          {
            heading: '字典式 % 格式化',
            text: '还可以用 `%(名字)s` 这种命名占位，后面传一个字典。在拼 SQL 或模板时旧代码里常见。',
            code: `info = {"name": "Bob", "score": 90}
print("%(name)s 的成绩是 %(score)d 分" % info)`
          }
        ],
        codeExample: `print("%s 今年 %d 岁，圆周率 %.2f" % ("Alice", 18, 3.14159))`,
        tips: [
          '% 格式化占位数量和后面值的数量必须一致，多一个少一个都会报错。',
          '新项目一律用 f-string，这里只为读懂旧代码。'
        ]
      }
    },
    {
      id: 'p3_float',
      title: 'float() 类型转换',
      stage: 'Python 控制流',
      summary: '把字符串或整数转成带小数的浮点数，处理用户输入的小数必备。',
      content: {
        overview: 'input() 拿到的永远是字符串，就算用户输入的是 "3.14" 也不能直接算。float() 把它转成带小数的数字。整数也能用 float() 转成 3.0 这种形式。',
        sections: [
          {
            heading: 'float 的常见用法',
            text: '`float(字符串)` 把 "3.14"、"10" 这种合法字符串转成浮点数；`float(整数)` 把整数转成浮点。非法字符串（比如 "abc"）会抛 ValueError，要配合 try-except。',
            code: `print(float("3.14"))
print(float("10"))
print(float(5))

# 模拟用户输入小数字符串
raw = "12.5"
try:
    value = float(raw)
    print("转换成功:", value, "乘以2 =", value * 2)
except ValueError:
    print("不是合法数字")`
          },
          {
            heading: '浮点数精度问题',
            text: '浮点数在计算机里是二进制近似存储，所以 0.1 + 0.2 不等于 0.3。做相等判断时要用 abs(a - b) < 1e-9 这种差值比较，不要直接 ==。',
            code: `print("0.1 + 0.2 =", 0.1 + 0.2)
print("等于 0.3 吗:", 0.1 + 0.2 == 0.3)
print("差值比较:", abs((0.1 + 0.2) - 0.3) < 1e-9)`
          }
        ],
        codeExample: `raw = "12.5"
value = float(raw)
print("转换后:", value, "两倍:", value * 2)
print("0.1+0.2 == 0.3 ?", (0.1+0.2) == 0.3)`,
        tips: [
          '金额计算不要直接用 float，用 decimal.Decimal 避免精度误差。',
          'float("inf") 和 float("nan") 是合法值，做输入校验时要留意。'
        ]
      }
    },
    {
      id: 'p3_is_vs_eq',
      title: 'is 与 == 的区别',
      stage: 'Python 控制流',
      summary: '== 比值是否相等，is 比是不是同一个对象，判断 None 永远用 is。',
      content: {
        overview: '新手最容易混淆 == 和 is。== 问的是「两个东西的值一样吗」，is 问的是「两个东西是不是同一个东西」。判断是否为 None、True、False 时一律用 is。',
        sections: [
          {
            heading: '== 比值，is 比身份',
            text: '`a == b` 调用 a 的 __eq__ 方法，比较内容。`a is b` 比较两者在内存里是不是同一个对象（id() 是否相同）。两个内容相同的列表 == 为 True，但 is 为 False，因为它们是两块不同的内存。',
            code: `a = [1, 2, 3]
b = [1, 2, 3]
c = a

print("a == b:", a == b)   # 内容相同
print("a is b:", a is b)   # 不同对象
print("a is c:", a is c)   # c 就是 a`
          },
          {
            heading: '判断 None 用 is None',
            text: 'None 在整个程序里只有一个对象，Python 官方规范要求判断是否为 None 用 `is None` 而不是 `== None`。这是因为自定义类可能重写 __eq__ 导致 == 行为异常，而 is 永远可靠。',
            code: `result = None

if result is None:
    print("结果是空")

x = 0
print("x 是 None 吗:", x is None)
print("x 不是 None 吗:", x is not None)`
          }
        ],
        codeExample: `a = [1, 2, 3]
b = [1, 2, 3]
print("== 比值:", a == b, "| is 比身份:", a is b)
result = None
print("判断 None:", result is None)`,
        tips: [
          '判断 None、True、False 永远用 is，这是 Python 代码规范。',
          '小整数和短字符串在 CPython 里有缓存，is 可能恰好为 True，但不要依赖这个行为。'
        ]
      }
    }
  ]
};
