import { TutorialStage, TutorialTopic } from '../tutorialData';

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
          { heading: '生活小例子', text: '逛超市时，你的购物车清单可能是：shopping = ["牛奶", "面包", "鸡蛋"]。想加一盒酸奶用 append，想拿掉面包用 remove，想看看第几样东西用下标。列表就是这样随手可改的「清单」。' },
          {
            heading: '核心 API：增删改查方法',
            text: '• 增加元素：`.append(x)` 尾部追加、`.extend(iterable)` 批量追加、`.insert(index, x)` 指定位置插入\n• 删除元素：`.remove(x)` 按值删除首个、`.pop(index)` 按索引弹出、`.clear()` 清空\n• 查找统计：`.index(x)` 查找索引、`.count(x)` 统计次数\n• 排序反转：`.sort()` 原位排序、`sorted()` 返回新列表、`.reverse()` 原位反转',
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
          {
            heading: '小结',
            text: '列表用 [] 定义，可以装任意类型的数据；append() 加元素、remove() 删元素、用下标访问；len() 看长度，sort() 排序，list[1:3] 切片取一部分。'
          }
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
          { heading: '生活小例子', text: '就像印刷好的菜单，印出来就不能改了。days = ("一", "二", "三", "四", "五", "六", "日") 表示一周七天，顺序固定、内容不变，程序用起来更安全。' },
          {
            heading: '四大容器综合对比',
            text: '根据功能需求与性能指标精准选择容器：',
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
          {
            heading: '小结',
            text: '元组用 () 定义，创建后不可修改；适合存固定不变的常量数据；函数返回多个值时常用元组；单个元素的元组要写成 (1,)，结尾的逗号不能省。'
          }
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
          { heading: '生活小例子', text: '两个班级选课，想找出同时选了数学课的同学——这就是交集。A = {"小明", "小红"}，B = {"小红", "小刚"}，A & B 就是「两个班都选课的人」。集合就是做这种统计的好帮手。' },
          {
            heading: '集合基础特性与创建',
            text: '• 无序性：元素没有固定顺序，不支持索引访问\n• 唯一性：重复元素会被自动去重\n• 可哈希要求：集合元素必须是不可变类型（可哈希），列表、字典不能放入集合\n• 空集合必须用 `set()` 创建，`{}` 是空字典',
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
          {
            heading: '小结',
            text: '集合用 {} 定义，自动去重、没有顺序；set() 可以把列表转成集合去重；& 是交集、| 是并集、- 是差集；用 in 判断元素在不在集合里非常快。'
          }
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
          { heading: '生活小例子', text: '通讯录就是字典：contacts = {"小明": 13800000001, "小红": 13900000002}。想找小明的电话，直接 contacts["小明"] 就能拿到，比一页一页翻快多了。' },
          {
            heading: '常用字典方法 API',
            text: '• 访问值：`dict[key]` 直接访问（不存在报错）、`.get(key, default)` 安全访问\n• 添加/修改：直接赋值 `dict[key] = value`、`.update(other_dict)` 批量更新\n• 删除：`.pop(key)` 弹出值、`.popitem()` 弹出最后一对、`.clear()` 清空\n• 遍历视图：`.keys()` 所有键、`.values()` 所有值、`.items()` 所有键值对\n• 合并：Python 3.9+ 支持 `|` 运算符合并字典',
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
          {
            heading: '小结',
            text: '字典用 {键: 值} 定义，键不能重复；dict[键] 直接取值，dict.get(键) 安全取值（找不到返回 None）；键必须是字符串、数字这类不可变类型；字典会保持插入顺序。'
          }
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
    }
  ]
};
