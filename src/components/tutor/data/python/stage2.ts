import { TutorialStage, TutorialTopic } from '../../tutorialData';

export const stage2: TutorialStage = {

  id: 'stage2',
  title: 'Python 容器',
  icon: 'dataset',
  topics: [
    {
      id: 'p2_list',
      title: 'Python 列表',
      stage: 'Python 容器',
      summary: '列表是能随手修改的「购物车」，学会增删改查和常用操作。',
      content: {
        overview: '列表（List）是 Python 里最常用的容器，就像超市的购物车：可以按顺序装很多东西，随时加、删、改、查。列表用方括号 [] 表示，元素之间用逗号隔开。',
        sections: [
          { heading: '核心 API：增删改查方法', text: '逛超市时，你的购物车清单可能是：shopping = ["牛奶", "面包", "鸡蛋"]。想加一盒酸奶用 append，想拿掉面包用 remove，想看看第几样东西用下标。列表就是这样随手可改的「清单」。\n\n• 增加元素：`.append(x)` 尾部追加、`.extend(iterable)` 批量追加、`.insert(index, x)` 指定位置插入\n• 删除元素：`.remove(x)` 按值删除首个、`.pop(index)` 按索引弹出、`.clear()` 清空\n• 查找统计：`.index(x)` 查找索引、`.count(x)` 统计次数\n• 排序反转：`.sort()` 原位排序、`sorted()` 返回新列表、`.reverse()` 原位反转',
            table: {
              headers: ['方法', '功能', '返回值', '是否修改原列表'],
              rows: [
                ['append(x)', '尾部追加元素', 'None', '是'],
                ['pop(i)', '弹出索引 i 的元素', '被弹出的元素', '是'],
                ['remove(x)', '删除第一个 x', 'None', '是'],
                ['sort()', '原位排序', 'None', '是'],
                ['sorted(lst)', '排序生成新列表', '新列表', '否'],
                ['index(x)', '查找 x 的索引', '索引值', '否']
              ]
            },
            code: `numbers = [42, 10, 88, 5, 23]
numbers.append(99)
numbers.sort()
print("原位升序排序:", numbers)

# 弹出尾部元素
last = numbers.pop()
print("弹出的元素:", last, "剩余列表:", numbers)`
          },
          {
            heading: '列表切片高级用法',
            text: '列表支持和字符串完全一致的切片语法，且切片不仅能读取，还能批量修改、批量删除、拷贝列表。\n• 切片读取：`lst[1:4]` 获取子列表\n• 切片修改：`lst[1:3] = [a, b, c]` 替换指定范围元素\n• 切片拷贝：`lst[:]` 生成列表的浅拷贝',
            code: `nums = [0, 1, 2, 3, 4, 5]

# 切片读取
print("前 3 个:", nums[:3])

# 切片批量替换
nums[1:3] = [100, 200, 300]
print("替换后:", nums)

# 切片浅拷贝
copy_nums = nums[:]
print("拷贝的列表:", copy_nums)`
          },
          {
            heading: '列表推导式',
            text: '列表推导式是 Python 特色语法，用一行代码快速生成列表，语法简洁且执行效率高于普通 for 循环。\n基础格式：`[表达式 for 变量 in 可迭代对象 if 条件]`',
            code: `# 基础推导式：生成 0-9 的平方
squares = [x ** 2 for x in range(10)]
print("平方列表:", squares)

# 带条件的推导式：提取偶数并平方
evens_squared = [x ** 2 for x in numbers if x % 2 == 0]
print("偶数平方:", evens_squared)

# 二维矩阵展平
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print("展平后:", flattened)`
          },
        ],
        codeExample: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print("二维矩阵展平列表:", flattened)`,
        tips: [
          '列表的 `.append()` 与 `.pop()` 时间复杂度均为 O(1)，可高效实现栈（Stack）数据结构。',
          '尽量避免在列表中间频繁插入删除，时间复杂度为 O(n)，效率较低。'
        ]
      }
    },
    {
      id: 'p2_tuple',
      title: 'Python 元组',
      stage: 'Python 容器',
      summary: '元组是「定好就不改」的清单，适合放固定不变的数据。',
      content: {
        overview: '元组（Tuple）和列表很像，但有个重要区别：创建之后就不能增删改。它适合放那些「说好就不变」的数据，比如一年的 12 个月份、一周的 7 天。',
        sections: [
          { heading: '四大容器综合对比', text: '就像印刷好的菜单，印出来就不能改了。days = ("一", "二", "三", "四", "五", "六", "日") 表示一周七天，顺序固定、内容不变，程序用起来更安全。\n\n根据功能需求与性能指标精准选择容器：',
            table: {
              headers: ['容器', '语法', '有序性', '可变性', '允许重复', '查找复杂度', '典型场景'],
              rows: [
                ['列表 List', '[ ]', '有序', '可变', '允许', 'O(n) 线性', '动态数据存储、顺序遍历'],
                ['元组 Tuple', '( )', '有序', '不可变', '允许', 'O(n) 线性', '常量数据、函数多返回值'],
                ['集合 Set', '{ }', '无序', '可变', '不允许', 'O(1) 哈希', '数据去重、集合运算'],
                ['字典 Dict', '{k:v}', '插入有序', '可变', 'Key 唯一', 'O(1) 哈希', '结构化数据、快速查找']
              ]
            }
          },
          {
            heading: '元组基础语法与注意事项',
            text: '• 单元素元组必须在末尾加逗号：`(42,)`，否则会被解析为普通表达式。\n• 元组可省略括号：`point = 10, 20` 等价于 `point = (10, 20)`。\n• 元组支持索引、切片、count、index 等只读操作，不支持 append、remove 等修改操作。\n• 不可变是指元组存储的引用不可变；如果元组包含列表等可变对象，列表内容仍可修改。',
            code: `# 单元素元组必须带逗号
single = (42,)
not_tuple = (42)  # 这只是整数
print(type(single), type(not_tuple))

# 元组包含可变对象的情况
t = (1, 2, [3, 4])
t[2].append(5)  # 可以修改列表本身
print("元组内容:", t)  # 元组引用的列表变了，但元组本身的引用没变`
          },
          {
            heading: '高级解包应用',
            text: '元组最常用的场景就是解包赋值，函数多返回值本质就是返回元组。\n支持平行赋值、扩展解包、交换变量等多种用法。',
            code: `# 函数多返回值（本质返回元组）
def get_server_status():
    return 200, "OK", 0.045

code, status, latency = get_server_status()
print(f"响应码: {code}, 状态: {status}, 延迟: {latency}s")

# 扩展解包忽略多余值
first, *_, last = [1, 2, 3, 4, 5]
print("只取首尾:", first, last)`
          },
        ],
        codeExample: `def get_server_status():
    return 200, "OK", 0.045  # 返回元组

code, status, latency = get_server_status()
print(f"响应码: {code}, 状态: {status}, 延迟: {latency}s")`,
        tips: [
          '元组内部若包含可变对象（如列表），该可变对象的内容仍可被修改，但元组引用的对象地址不变。',
          '不需要修改的数据优先用元组，更省内存、更安全，还能作为字典的键。'
        ]
      }
    },
    {
      id: 'p2_set',
      title: 'Python 集合',
      stage: 'Python 容器',
      summary: '集合是「自动去重」的袋子，还能做交、并、差运算。',
      content: {
        overview: '集合（Set）像一袋「不重样」的弹珠：里面不会出现重复的东西，而且没有先后顺序。它最擅长两件事：去重，以及算交集、并集、差集。',
        sections: [
          { heading: '集合基础特性与创建', text: '两个班级选课，想找出同时选了数学课的同学——这就是交集。A = {"小明", "小红"}，B = {"小红", "小刚"}，A & B 就是「两个班都选课的人」。集合就是做这种统计的好帮手。\n\n• 无序性：元素没有固定顺序，不支持索引访问\n• 唯一性：重复元素会被自动去重\n• 可哈希要求：集合元素必须是不可变类型（可哈希），列表、字典不能放入集合\n• 空集合必须用 `set()` 创建，`{}` 是空字典',
            code: `# 自动去重
nums = [1, 2, 2, 3, 3, 3, 4]
unique_nums = set(nums)
print("去重后集合:", unique_nums)

# 空集合的正确创建方式
empty_set = set()
print("空集合类型:", type(empty_set))`
          },
          {
            heading: '集合数学运算方法',
            text: '集合支持完整的数学集合运算，有运算符和方法两种写法：\n• 交集 `&` / `.intersection()`：两个集合共有的元素\n• 并集 `|` / `.union()`：合并两个集合的所有不重复元素\n• 差集 `-` / `.difference()`：存在于 A 但不存在于 B 的元素\n• 对称差集 `^` / `.symmetric_difference()`：不同时存在于两个集合的元素\n• 子集判断：`.issubset()`、`.issuperset()`',
            table: {
              headers: ['运算', '运算符', '方法写法', '含义'],
              rows: [
                ['交集', '&', 'a.intersection(b)', '两个集合都有的元素'],
                ['并集', '|', 'a.union(b)', '所有元素合并去重'],
                ['差集', '-', 'a.difference(b)', 'a 有但 b 没有的元素'],
                ['对称差', '^', 'a.symmetric_difference(b)', '只在一个集合里的元素']
              ]
            },
            code: `set_a = {1, 2, 3, 4, 5}
set_b = {4, 5, 6, 7, 8}

print("交集:", set_a & set_b)
print("并集:", set_a | set_b)
print("差集(A-B):", set_a - set_b)
print("对称差集:", set_a ^ set_b)
print("A 是 B 的子集吗:", set_a.issubset(set_b))`
          },
          {
            heading: '集合常用操作与适用场景',
            text: '常用方法：`.add()` 添加元素、`.remove()` 删除元素、`.clear()` 清空。\n典型适用场景：\n1. 列表/数据去重\n2. 共同好友、共同关注等交集计算\n3. 标签系统的差集、并集运算',
            code: `# 实际场景：统计访问去重 IP
raw_logs = ["192.168.1.1", "10.0.0.1", "192.168.1.1", "172.16.0.1"]
unique_ips = list(set(raw_logs))
print("去重后 IP 列表:", unique_ips)`
          },
        ],
        codeExample: `raw_logs = ["192.168.1.1", "10.0.0.1", "192.168.1.1", "172.16.0.1"]
unique_ips = list(set(raw_logs))
print("过滤重复 IP 列表:", unique_ips)`,
        tips: [
          '创建空集合必须使用 `set()` 构造器，直接写 `{}` 会被解析为空字典 `dict`。',
          '集合去重会丢失原有顺序，需要保留顺序不能直接用 set。'
        ]
      }
    },
    {
      id: 'p2_dict',
      title: 'Python 字典',
      stage: 'Python 容器',
      summary: '字典是「查名字找答案」的键值对，像真正的字典一样好用。',
      content: {
        overview: '字典（Dict）存的是「键值对」：一个名字对应一个值，就像真正的字典——查「苹果」得到它的释义。找数据时用键，速度快，不用从头翻到尾。',
        sections: [
          { heading: '常用字典方法 API', text: '通讯录就是字典：contacts = {"小明": 13800000001, "小红": 13900000002}。想找小明的电话，直接 contacts["小明"] 就能拿到，比一页一页翻快多了。\n\n• 访问值：`dict[key]` 直接访问（不存在报错）、`.get(key, default)` 安全访问\n• 添加/修改：直接赋值 `dict[key] = value`、`.update(other_dict)` 批量更新\n• 删除：`.pop(key)` 弹出值、`.popitem()` 弹出最后一对、`.clear()` 清空\n• 遍历视图：`.keys()` 所有键、`.values()` 所有值、`.items()` 所有键值对\n• 合并：Python 3.9+ 支持 `|` 运算符合并字典',
            table: {
              headers: ['方法', '功能', '特点'],
              rows: [
                ['get(key, default)', '安全获取值', 'key 不存在返回默认值，不报错'],
                ['items()', '获取键值对', '常用于 for 循环同时遍历键和值'],
                ['update(dict2)', '批量更新', '将 dict2 的键值对合并进来'],
                ['pop(key)', '弹出指定键的值', '返回对应的值，同时删除键值对'],
                ['setdefault(key, val)', '不存在则设置默认值', '避免键不存在的报错']
              ]
            },
            code: `student = {"id": 1001, "name": "Alice", "major": "Computer Science"}
print("安全访问缺失键:", student.get("gpa", 4.0))

# 字典合并 (Python 3.9+ | 运算符)
extra_info = {"gpa": 3.9, "graduated": True}
full_profile = student | extra_info
print("合并后的完整字典:\n", full_profile)

# 遍历键值对
for key, value in student.items():
    print(f"{key}: {value}")`
          },
          {
            heading: '字典推导式',
            text: '和列表推导式类似，字典推导式可以快速生成字典：\n格式：`{key表达式: value表达式 for 变量 in 可迭代对象 if 条件}`',
            code: `scores = {"Math": 95, "Physics": 88, "Chemistry": 92}

# 字典推导式过滤优秀科目
top_scores = {k: v for k, v in scores.items() if v >= 90}
print("优秀成绩字典:", top_scores)

# 将两个列表合并为字典
keys = ["a", "b", "c"]
values = [1, 2, 3]
new_dict = {k: v for k, v in zip(keys, values)}
print("列表生成字典:", new_dict)`
          },
          {
            heading: '字典核心特性与注意事项',
            text: '• 键的唯一性：同一个键多次赋值会覆盖旧值\n• 可哈希要求：键必须是不可变类型（str、int、tuple 等），列表、字典不能作为键\n• 有序性：Python 3.7+ 保证插入顺序，旧版本不保证\n• 查找效率：O(1) 时间复杂度，数据量大时优势明显',
            code: `# 键必须可哈希
good_dict = {(1, 2): "坐标点"}  # 元组可以当键
print("元组作为键:", good_dict[(1, 2)])

# bad_dict = {[1,2]: "test"}  # 列表不能当键，会报错`
          },
        ],
        codeExample: `scores = {"Math": 95, "Physics": 88, "Chemistry": 92}
# 字典推导式过滤优秀科目
top_scores = {k: v for k, v in scores.items() if v >= 90}
print("优秀成绩字典:", top_scores)`,
        tips: [
          '字典的底层哈希表结构使得其数据检索复杂度为稳定的 O(1)。',
          '频繁根据键查找值的场景，优先用字典而不是列表遍历。'
        ]
      }
    },
    {
      id: 'p2_list_deep',
      title: '列表进阶：负索引、切片步长与排序',
      stage: 'Python 容器',
      summary: '从末尾倒数取元素、步长切片、反转列表，以及 sort 的 key 与 reverse 参数。',
      content: {
        overview: '基础列表操作学会之后，还有几个常用技巧能让你少写很多循环：用负索引从末尾倒数取元素，用步长切片隔几个取一个或直接反转列表，以及用 sort 的 key 参数按自定义规则排序。',
        sections: [
          {
            heading: '负索引与步长切片',
            text: '列表除了从前往后数（0、1、2……），还能从后往前数：`lst[-1]` 是最后一个元素，`lst[-2]` 是倒数第二个。切片语法 `lst[start:stop:step]` 带第三个参数步长，`lst[::2]` 表示从头到尾隔一个取一个；步长为负时倒着取，`lst[::-1]` 就是把整个列表反转，这是 Python 里最常用的反转写法。',
            code: `nums = [10, 20, 30, 40, 50]

# 负索引：从末尾倒数
print("最后一个元素:", nums[-1])
print("倒数第二个:", nums[-2])

# 步长切片：隔一个取一个
print("偶数位元素:", nums[::2])

# 步长为负：反转列表
print("反转列表:", nums[::-1])`
          },
          {
            heading: 'list.copy() 与切片拷贝的区别',
            text: '直接写 `b = a` 只是给列表起了个别名，a 和 b 指向同一块内存，改一个另一个也变。要真正复制一份新列表，可以用 `a.copy()` 方法，也可以用切片 `a[:]`，两者效果完全一样，都是浅拷贝。浅拷贝的意思是：列表本身是新的，但里面如果装的是列表等可变对象，那些内层对象仍然是共享的。',
            code: `a = [1, 2, 3]
b = a          # 别名，不是拷贝
c = a.copy()   # 真拷贝
d = a[:]       # 切片拷贝，等价于 copy()

a.append(4)
print("原列表 a:", a)
print("别名 b 跟着变:", b)
print("拷贝 c 不变:", c)
print("切片 d 不变:", d)`
          },
          {
            heading: 'sort 的 key 与 reverse 参数',
            text: '`list.sort()` 默认按从小到大原位排序。传入 `reverse=True` 改为从大到小。更强大的是 `key` 参数：它接收一个函数，列表会按这个函数作用在每个元素上的返回值来排序。比如按字符串长度排序、按元组的第二个元素排序。',
            code: `words = ["banana", "pi", "apple", "cherry"]

# 按字符串长度升序
words.sort(key=len)
print("按长度排序:", words)

nums = [5, 2, 9, 1]
nums.sort(reverse=True)
print("降序排列:", nums)

# 按元组第二个元素排序
pairs = [("小明", 85), ("小红", 92), ("小刚", 78)]
pairs.sort(key=lambda x: x[1])
print("按成绩排序:", pairs)`
          }
        ],
        codeExample: `nums = [10, 20, 30, 40, 50]
print("最后一个元素:", nums[-1])
print("隔一个取:", nums[::2])
print("反转列表:", nums[::-1])`,
        tips: [
          '`lst[::-1]` 生成新列表实现反转，而 `lst.reverse()` 是原位反转，返回 None。',
          '`list.sort()` 是原位排序返回 None，`sorted(lst)` 返回新列表，两者不要混用赋值。'
        ]
      }
    },
    {
      id: 'p2_nested_unpack',
      title: '嵌套容器与多级索引',
      stage: 'Python 容器',
      summary: '列表里套列表、字典里套字典，用多级下标一层层取出来。',
      content: {
        overview: '真实数据往往不是一层就能装下的：一个班级是列表，每个同学又是一个字典；一个矩阵是列表套列表。这时就要用多级索引，从外层一层层往里取。',
        sections: [
          {
            heading: '嵌套列表的多级索引',
            text: '二维矩阵 `matrix = [[1,2,3],[4,5,6],[7,8,9]]` 是一个列表，每个元素本身又是一个列表。`matrix[0]` 取第一行，`matrix[0][1]` 取第一行第二个元素。多加几对中括号，就能一层层钻进去。',
            code: `matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

print("第一行:", matrix[0])
print("第一行第二列:", matrix[0][1])
print("右下角元素:", matrix[2][2])

# 遍历二维列表
for row in matrix:
    print("行数据:", row)`
          },
          {
            heading: '嵌套字典的多级索引',
            text: '字典里某个键对应的值本身又是一个字典，就用 `d["a"]["b"]` 这种写法连续取。这在处理 JSON 风格的数据时非常常见。',
            code: `student = {
    "name": "Alice",
    "scores": {"math": 95, "english": 88}
}

print("姓名:", student["name"])
print("数学成绩:", student["scores"]["math"])

# 修改嵌套字典里的值
student["scores"]["english"] = 90
print("修改后成绩:", student["scores"])`
          },
          {
            heading: '列表解包与星号收集',
            text: '解包就是把列表里的元素一次性分别赋给多个变量。普通写法 `a, b, c = [1, 2, 3]` 要求左右数量一致。如果数量对不上，用星号 `*rest` 把多余的元素打包成一个列表收走，这在只关心首尾元素时特别方便。',
            code: `# 普通解包：数量必须一致
a, b, c = [1, 2, 3]
print("三个变量:", a, b, c)

# 星号收集：中间的全给 rest
first, *rest = [10, 20, 30, 40]
print("首元素:", first, "其余:", rest)

*_, last = [10, 20, 30, 40]
print("末元素:", last)`
          }
        ],
        codeExample: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print("中心元素:", matrix[1][1])
first, *rest = [10, 20, 30, 40]
print("首元素:", first, "其余:", rest)`,
        tips: [
          '解包时星号变量最多出现一次，`*a, *b = lst` 这种写法会报错。',
          '多层嵌套数据取深层值时，建议先用 `.get()` 防止中间某层键不存在导致崩溃。'
        ]
      }
    },
    {
      id: 'p2_set_deep',
      title: '集合进阶：删除、子集与推导式',
      stage: 'Python 容器',
      summary: 'discard 与 remove 的区别、pop 随机弹出、子集超集运算符和集合推导式。',
      content: {
        overview: '集合除了去重和交并差，还有几个细节方法：删除不存在的元素时 remove 会报错而 discard 不会；用 <= 和 >= 运算符判断子集超集；以及和列表推导式类似的集合推导式。',
        sections: [
          {
            heading: 'discard 与 remove 的行为差异',
            text: '两个方法都是从集合里删掉一个元素，区别在于元素不存在时：`remove(x)` 会直接报错 KeyError，`discard(x)` 会安静地什么都不做。当你不确定元素在不在集合里、又不想写 try-except 时，用 discard 更安全。',
            code: `s = {1, 2, 3}

s.remove(2)
print("remove 后:", s)

s.discard(99)  # 不存在，不报错
print("discard 不存在的元素:", s)

# s.remove(99)  # 这行会报 KeyError，被注释掉了`
          },
          {
            heading: 'pop 与子集超集运算符',
            text: '`set.pop()` 会随机弹出并移除一个元素（集合无序，所以不是弹出最后一个），空集合调用会报错。判断子集超集除了 `.issubset()` 方法，还能用运算符：`a <= b` 表示 a 是 b 的子集，`a >= b` 表示 a 是 b 的超集，`a < b` 表示真子集。',
            code: `s = {1, 2, 3, 4}
popped = s.pop()
print("弹出的元素:", popped, "剩余:", s)

a = {1, 2}
b = {1, 2, 3, 4}
print("a 是 b 的子集吗:", a <= b)
print("b 是 a 的超集吗:", b >= a)
print("a 是 b 的真子集吗:", a < b)`
          },
          {
            heading: '集合推导式',
            text: '和列表推导式语法几乎一样，只是外层用花括号，结果自动去重。`{x for x in 可迭代对象 if 条件}`。适合一边变换一边去重。',
            code: `# 对单词长度去重
words = ["hi", "ok", "go", "bye", "ace"]
lengths = {len(w) for w in words}
print("出现过的长度:", lengths)

# 平方集合
squares = {x ** 2 for x in range(5)}
print("平方集合:", squares)`
          }
        ],
        codeExample: `s = {1, 2, 3}
s.discard(99)  # 不报错
a = {1, 2}
b = {1, 2, 3, 4}
print("子集判断:", a <= b)
print("集合推导式:", {x ** 2 for x in range(5)})`,
        tips: [
          '`set.pop()` 因为集合无序，弹出的元素不确定，不要依赖它弹出特定值。',
          '集合推导式结果会自动去重，如果需要保留顺序就不能用集合推导式。'
        ]
      }
    },
    {
      id: 'p2_dict_deep',
      title: '字典进阶：setdefault、copy 与 in',
      stage: 'Python 容器',
      summary: 'setdefault 安全补默认值、字典浅拷贝，以及用 in 判断键是否存在。',
      content: {
        overview: '字典最常见的痛点是「键可能不存在」。setdefault 用一行解决「没有就补上默认值」，copy 复制字典避免别名问题，in 运算符让你在取值前先问一句「这个键在不在」。',
        sections: [
          {
            heading: 'dict.setdefault() 安全补值',
            text: '想给字典里某个键累加计数，但这个键第一次还不存在。`d.setdefault(key, default)` 的意思是：键存在就返回它的值，键不存在就先把 default 写进去再返回。比写「if 键 not in d 就初始化」简洁得多。',
            code: `words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
count = {}

for w in words:
    count[w] = count.setdefault(w, 0) + 1

print("单词计数:", count)

# 键存在时 setdefault 不会覆盖原有值
info = {"name": "Alice"}
info.setdefault("name", "Bob")
print("name 没被覆盖:", info["name"])`
          },
          {
            heading: 'dict.copy() 浅拷贝',
            text: '和列表一样，`b = d` 只是别名。要用 `d.copy()` 复制一份新字典。注意这也是浅拷贝：如果字典的值是列表等可变对象，那些内层对象仍然共享。',
            code: `d = {"a": 1, "b": 2}
e = d.copy()
d["a"] = 99
print("原字典:", d)
print("拷贝 e 不受影响:", e)`
          },
          {
            heading: '用 in 判断键是否存在',
            text: '`in` 运算符能判断某个键是不是字典的一部分：`"name" in d` 返回 True 或 False。注意 in 查的是键，不是值。查值要用 `值 in d.values()`。在取值前先 in 一下，可以避免 KeyError。',
            code: `student = {"name": "Alice", "age": 18}

print("有 name 键吗:", "name" in student)
print("有 gpa 键吗:", "gpa" in student)

if "gpa" in student:
    print("gpa =", student["gpa"])
else:
    print("没有 gpa 这个键")`
          }
        ],
        codeExample: `count = {}
for w in ["a", "b", "a"]:
    count[w] = count.setdefault(w, 0) + 1
print("计数结果:", count)
print("键存在吗:", "a" in count)`,
        tips: [
          '`d.setdefault(k, v)` 即使键已存在也会计算 v 参数（只是不用它），传昂贵表达式时要小心。',
          '判断键存在用 `k in d`，不要用 `d.get(k) is not None`，因为键的值本身可能就是 None。'
        ]
      }
    },
    {
      id: 'p2_tuple_deep',
      title: '元组进阶与类型互转',
      stage: 'Python 容器',
      summary: 'count 与 index 方法、tuple/list 互转，以及 frozenset 和 namedtuple 简介。',
      content: {
        overview: '元组虽然不能改，但它支持查询方法，还能和列表互相转换。另外 Python 还有两个进阶变体：不可变的集合 frozenset，和「能带名字的元组」namedtuple。',
        sections: [
          {
            heading: 'tuple.count() 与 tuple.index()',
            text: '元组不支持增删改，但支持两个只读查询方法：`.count(x)` 数 x 出现几次，`.index(x)` 找 x 第一次出现的位置（找不到会报错）。',
            code: `t = (1, 2, 3, 2, 2, 4)

print("2 出现次数:", t.count(2))
print("3 第一次出现的位置:", t.index(3))

# index 找不到会报 ValueError
# print(t.index(99))  # 取消注释会报错`
          },
          {
            heading: 'tuple() 与 list() 类型互转',
            text: '用 `list(可迭代对象)` 把元组转成列表，用 `tuple(可迭代对象)` 把列表转成元组。这在「想临时修改一下元组」时很有用：先转列表改完，再转回元组。',
            code: `t = (1, 2, 3)
lst = list(t)
lst.append(4)
new_t = tuple(lst)
print("转列表修改后再转回:", new_t)

# 字符串也能转
print("字符串转元组:", tuple("abc"))
print("字符串转列表:", list("abc"))`
          },
          {
            heading: 'frozenset 与 namedtuple',
            text: '`frozenset` 是不可变的集合，创建后不能增删，因此可以作为字典的键或放进集合里。`namedtuple` 是「能带字段名的元组」：既能像元组一样解包，又能用 `.字段名` 访问属性，比普通元组可读性好。',
            code: `from collections import namedtuple

# frozenset：不可变集合，可作字典键
fs = frozenset([1, 2, 3])
d = {fs: "不可变集合当键"}
print("frozenset 当键:", d[fs])

# namedtuple：带名字的元组
Point = namedtuple("Point", ["x", "y"])
p = Point(10, 20)
print("坐标:", p.x, p.y)
print("解包:", p[0], p[1])`
          }
        ],
        codeExample: `t = (1, 2, 3, 2, 2)
print("count(2):", t.count(2))
print("转列表:", list(t))
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
print("命名元组:", Point(3, 4).x)`,
        tips: [
          'frozenset 因为不可变才是可哈希的，普通 set 不能当字典键。',
          'namedtuple 适合表示「一条记录」，比如一行数据有固定字段时，比字典省内存且可读。'
        ]
      }
    },
    {
      id: 'p2_del_truth',
      title: 'del 语句与布尔真值',
      stage: 'Python 容器',
      summary: '用 del 删除列表元素和字典键，以及记住哪些值在 if 里被当成假。',
      content: {
        overview: 'del 是 Python 的删除语句，能直接删掉列表里某个位置的元素、字典里某个键。另外每个容器在 if 判断里都有「真假」：空容器自动算假，记住这张表能少写很多 `len(x) == 0`。',
        sections: [
          {
            heading: 'del 删除列表元素与字典键',
            text: '`del lst[i]` 删除列表指定位置的元素，`del d[key]` 删除字典指定键。del 是语句不是方法，和 `.remove()` 按值删、`.pop()` 按索引取值删除都不同。',
            code: `nums = [10, 20, 30, 40]
del nums[1]
print("删除索引1后:", nums)

d = {"a": 1, "b": 2, "c": 3}
del d["b"]
print("删除键 b 后:", d)`
          },
          {
            heading: 'in 运算符判断元素与键',
            text: '对列表和集合，`x in lst` 判断 x 是不是其中的元素；对字典，`k in d` 判断 k 是不是其中的键。这是最常用的存在性检查，比写循环找一遍快得多。',
            code: `print(3 in [1, 2, 3])
print("name" in {"name": "Alice"})
print(99 in {1, 2, 3})`
          },
          {
            heading: '布尔 falsy 值表',
            text: '在 if 或 while 的条件里，Python 会自动把任意值转成布尔值。下面这些值会被当成 False（称为 falsy），其余都当成 True。所以写 `if lst:` 就等于「列表非空」，不用写 `if len(lst) > 0:`。',
            table: {
              headers: ['falsy 值', '例子', '含义'],
              rows: [
                ['数字零', '0、0.0', '数值为零'],
                ['空字符串', '""', '没有字符'],
                ['空列表', '[]', '没有元素'],
                ['空元组', '()', '没有元素'],
                ['空集合', 'set()', '没有元素'],
                ['空字典', '{}', '没有键值对'],
                ['None', 'None', '空值占位']
              ]
            },
            code: `for v in [0, 0.0, "", [], (), {}, None]:
    if v:
        print("真值:", repr(v))
    else:
        print("假值:", repr(v))

# 推荐写法：直接写容器
lst = []
if lst:
    print("列表非空")
else:
    print("列表为空")`
          }
        ],
        codeExample: `d = {"a": 1, "b": 2}
del d["a"]
print("del 后:", d)
print("b 还在吗:", "b" in d)
for v in [0, "", [], None]:
    print(repr(v), "是假值" if not v else "是真值")`,
        tips: [
          '判断容器是否为空直接写 `if lst:`，不要写 `if len(lst) == 0:`，这是 Python 惯例。',
          '`None` 表示「什么都没有」，判断是否为 None 要用 `is None`，不要用 `== None`。'
        ]
      }
    }
  ]
};
