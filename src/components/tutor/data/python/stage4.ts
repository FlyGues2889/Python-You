import { TutorialStage } from '../../tutorialData';

export const stage4: TutorialStage = {

  id: 'stage4',
  title: 'Python 函数与对象',
  icon: 'code_off',
  topics: [
    {
      id: 'p4_functions',
      title: 'Python 函数',
      stage: 'Python 函数与对象',
      summary: '函数是把重复代码「打包」成工具，随取随用。',
      content: {
        overview: '函数就是把一段重复用的代码「打包」成一个工具：起个名字，需要时一调用就执行。就像厨房里的菜谱——按步骤做菜，想吃什么照着做就行，不用每次都重新发明。',
        sections: [
          { heading: '参数类型全解', text: '每天都要给好朋友发早安问候，与其每次都打一遍，不如定义一个函数 say_hi()，里面写好「你好呀！」。以后只要调用 say_hi()，问候就自动发出去了。\n\nPython 函数参数分为四大类，定义顺序必须遵守：位置参数 → 默认参数 → *args → **kwargs\n1. 位置参数：按顺序一一匹配，调用时必须传入\n2. 默认参数：有默认值，调用时可省略，必须放在位置参数之后\n3. 变长位置参数 `*args`：接收多余位置参数，打包成元组\n4. 变长关键字参数 `**kwargs`：接收多余关键字参数，打包成字典',
            table: {
              headers: ['参数类型', '语法', '特点', '适用场景'],
              rows: [
                ['位置参数', 'def f(a, b)', '必须按顺序传入', '必填参数'],
                ['默认参数', 'def f(a, b=10)', '可省略，有默认值', '非必填参数'],
                ['*args', 'def f(*args)', '接收任意多位置参数', '参数数量不确定'],
                ['**kwargs', 'def f(**kwargs)', '接收任意多关键字参数', '动态键值参数']
              ]
            },
            code: `def build_user_profile(username, email, *args, **kwargs):\n    profile = {\n        "username": username,\n        "email": email,\n        "hobbies": args,\n        "metadata": kwargs\n    }\n    return profile\n\nuser = build_user_profile("alice", "alice@test.com", "coding", "reading", role="admin", level=5)\nprint("构造的用户字典:")\nprint(user)`
          },
          {
            heading: '默认参数的经典坑',
            text: '• 绝对不要使用可变对象（列表、字典）作为默认参数！\n默认参数只在函数定义时计算一次，多次调用会共享同一个对象，导致累积副作用。\n正确做法：用 None 作为默认值，函数内部延迟初始化。',
            code: `# • 错误写法：可变默认参数\ndef add_item(item, lst=[]):\n    lst.append(item)\n    return lst\n\nprint(add_item(1))  # [1]\nprint(add_item(2))  # [1, 2] —— 累积了，不符合预期\n\n# • 正确写法：None 延迟初始化\ndef add_item_fixed(item, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(item)\n    return lst\n\nprint(add_item_fixed(1))  # [1]\nprint(add_item_fixed(2))  # [2] —— 每次都是新列表`
          },
          {
            heading: '函数返回值',
            text: '• 无 return 语句：默认返回 None\n• 单个 return：返回指定值\n• 多个返回值：本质是返回一个元组，可直接解包接收\n• return 会立即终止函数执行，后面的代码不会运行',
            code: `def calculate(a, b):\n    sum_val = a + b\n    product = a * b\n    return sum_val, product  # 返回元组\n\ns, p = calculate(3, 4)\nprint("和:", s, "积:", p)`
          },
          {
            heading: '关键字参数调用方式',
            text: '调用函数时，除了按位置传值，还可以写成 形参名=值 的形式，这叫关键字参数调用。好处是参数多的时候传参顺序无所谓，而且一眼看出每个值是给谁的。位置参数和关键字参数可以混用，但位置参数必须写在前面。',
            code: `def describe_pet(name, animal="狗"):\n    print(f"{name} 是一只{animal}")\n\ndescribe_pet("旺财")                  # 按位置传参\ndescribe_pet(animal="猫", name="咪咪") # 关键字传参，顺序无所谓\ndescribe_pet("花花", animal="兔子")    # 位置与关键字混用`
          },
          {
            heading: '文档字符串与 help()',
            text: '在函数体第一行放一段三引号字符串，叫文档字符串（docstring），用来描述函数做什么、每个参数和返回值是什么。写好后，在交互式环境里调用 help(函数名) 就能看到这段说明，IDE 也会自动弹出提示。代码里也可以直接读取 函数名.__doc__。',
            code: `def area_rectangle(width, height):\n    """返回矩形面积 = 宽 * 高。"""\n    return width * height\n\nprint("面积:", area_rectangle(3, 4))\nprint("--- 文档字符串内容 ---")\nprint(area_rectangle.__doc__)`
          },
          {
            heading: '仅位置与仅关键字参数（进阶）',
            text: '定义参数时，单个斜杠 / 之前的参数只能按位置传；单个星号 * 之后的参数必须按关键字传。这是更精细的接口控制，属于进阶内容，初学了解即可。',
            code: `def user_info(name, /, city, *, age):\n    print(f"{name} 住在{city}，今年{age}岁")\n\n# name 只能位置传；city 两种都行；age 必须关键字传\nuser_info("小明", "上海", age=18)`
          },
          {
            heading: '递归（进阶）',
            text: '函数直接或间接调用自己叫递归。每次调用把问题缩小一点，直到碰到「基准情形」不再自我调用；如果没有基准情形，就会无限递归直到报错。阶乘是最经典的例子。',
            code: `def factorial(n):\n    if n <= 1:          # 基准情形，停止递归\n        return 1\n    return n * factorial(n - 1)\n\nprint("5 的阶乘:", factorial(5))\nprint("0 的阶乘:", factorial(0))`
          },
        ],
        codeExample: `def multiply_all(*args):\n    result = 1\n    for n in args:\n        result *= n\n    return result\n\nprint("变长乘积计算:", multiply_all(2, 3, 4, 5))`,
        tips: [
          '切勿使用可变对象（如列表或字典）作为函数的默认参数值，应采用 None 进行延迟赋值。',
          '函数职责要单一，一个函数只做一件事，不要写几百行的大函数。'
        ]
      }
    },
    {
      id: 'p4_first_class',
      title: '函数是一等对象',
      stage: 'Python 函数与对象',
      summary: '函数能像数字一样被赋值、传参、当返回值。',
      content: {
        overview: '在 Python 里，函数和整数、字符串地位一样，都是「对象」。这意味着函数可以赋值给变量、当参数传给别的函数、还能当返回值返回。这种能力叫「一等公民」，装饰器、闭包、回调都是建立在它之上的。',
        sections: [
          { heading: '把函数赋值给变量', text: '定义函数后，不加括号直接写函数名，拿到的是函数本身。把它赋给另一个变量，就能用新名字调用。记住：加括号是「调用」，不加括号是「把函数当东西传」。',
            code: `def greet():\n    return "你好呀"\n\nsay = greet        # 不加括号，拿到函数对象本身\nprint(say())       # 用新名字调用\nprint("类型:", type(say))`
          },
          {
            heading: '把函数当参数传递',
            text: '接收函数当参数的函数叫高阶函数。sorted、map、filter 都是这种——它们不关心你具体做什么，只负责把每个元素交给你传入的函数处理。',
            code: `def apply_twice(func, value):\n    return func(func(value))\n\ndef add_one(x):\n    return x + 1\n\nprint("连续加两次一:", apply_twice(add_one, 10))`
          },
          {
            heading: '把函数当返回值',
            text: '函数内部再定义一个函数，然后把它 return 出来。外层函数相当于一个「函数工厂」，根据参数造出不同行为的函数。',
            code: `def make_adder(n):\n    def adder(x):\n        return x + n\n    return adder\n\nadd5 = make_adder(5)\nadd100 = make_adder(100)\nprint("加 5:", add5(10))\nprint("加 100:", add100(10))`
          },
        ],
        codeExample: `def shout(text):\n    return text.upper() + "!"\n\nfuncs = [str.lower, shout, len]\nfor f in funcs:\n    print("调用结果:", f("Hello"))`,
        tips: [
          '函数不加括号才是函数本身，加了括号是调用它并拿返回值。',
          '把函数当参数传递时，传的是函数本身，不要画蛇添足加上括号。'
        ]
      }
    },
    {
      id: 'p4_lambda',
      title: 'Python Lambda',
      stage: 'Python 函数与对象',
      summary: 'lambda 是「一句话」的小函数，适合临时用一下。',
      content: {
        overview: 'lambda 是一种「一句话写完」的小函数，不用起名字、不用写 def，适合临时用一下的简单逻辑。格式：lambda 参数: 返回值表达式。',
        sections: [
          { heading: 'lambda 与普通函数对比', text: '给一堆数字排序，想按「离 10 的距离」排：sorted(nums, key=lambda x: abs(x - 10))。这个小函数只干一件事——算出每个数离 10 多远，用完即弃，不用专门起名字。\n\n',
            table: {
              headers: ['对比项', 'def 普通函数', 'lambda 匿名函数'],
              rows: [
                ['语法', '多行完整定义', '单行表达式'],
                ['函数名', '有函数名', '匿名，通常只使用一次'],
                ['复杂度', '支持任意复杂逻辑', '只能有一个表达式'],
                ['适用场景', '复杂逻辑、多次调用', '简单回调、临时使用']
              ]
            },
            code: `# 等价的两种写法\ndef add_def(a, b):\n    return a + b\n\nadd_lambda = lambda a, b: a + b\n\nprint("def 函数:", add_def(3, 4))\nprint("lambda 函数:", add_lambda(3, 4))`
          },
          {
            heading: '高阶函数搭配实战',
            text: 'Lambda 最常用的三个场景：sorted 排序 key、map 映射、filter 过滤。',
            code: `products = [\n    {"name": "Laptop", "price": 8999},\n    {"name": "Mouse", "price": 199},\n    {"name": "Keyboard", "price": 499}\n]\n\n# 1. 按价格排序（最常用场景）\nproducts.sort(key=lambda item: item["price"])\nprint("按价格升序排列:\\n", products)\n\n# 2. map 映射转换\nprices = list(map(lambda p: p["price"], products))\nprint("提取价格列表:", prices)\n\n# 3. filter 过滤筛选\ncheap = list(filter(lambda p: p["price"] < 500, products))\nprint("便宜商品:", cheap)`
          },
          {
            heading: 'min / max 配合 key',
            text: 'sorted 的 key 参数已经见过，min 和 max 也接受 key，用来指定「按什么标准」取最小或最大。lambda 在这里特别简洁。',
            code: `students = [("小明", 85), ("小红", 92), ("小刚", 78)]\n\ntop = max(students, key=lambda s: s[1])\nlow = min(students, key=lambda s: s[1])\nprint("最高分:", top)\nprint("最低分:", low)\n\nby_name_len = sorted(students, key=lambda s: len(s[0]))\nprint("按名字长度排序:", by_name_len)`
          },
          {
            heading: '闭包变量捕获陷阱（进阶）',
            text: '在循环里写 lambda 并引用循环变量时，lambda 不会记住当时的值，而是记住变量本身。等真正调用时循环早已结束，变量停在最后一次的值。解决办法是用默认参数 i=i 在定义时立即绑定。',
            code: `funcs_bad = []\nfor i in range(3):\n    funcs_bad.append(lambda: i)\nprint("陷阱：都返回最后的 i:", [f() for f in funcs_bad])\n\nfuncs_good = []\nfor i in range(3):\n    funcs_good.append(lambda i=i: i)\nprint("修复后:", [f() for f in funcs_good])`
          },
          {
            heading: 'functools.reduce（进阶）',
            text: 'reduce 把一个二元函数「累积」地作用在序列上：先拿前两个算，结果再和第三个算，直到最后剩一个值。配合 lambda 可以做累加、累乘。',
            code: `from functools import reduce\n\nnums = [1, 2, 3, 4]\ntotal = reduce(lambda a, b: a + b, nums)\nproduct = reduce(lambda a, b: a * b, nums)\nprint("累加:", total)\nprint("累乘:", product)`
          },
          {
            heading: '使用建议与误区',
            text: '• lambda 只适合简单逻辑，复杂逻辑请写普通 def 函数\n• 不要强行给 lambda 赋值命名，不如直接写 def\n• 大多数场景下，列表推导式比 map/filter+lambda 更易读',
            code: `# 列表推导式 vs filter+lambda\nnums = [1, 2, 3, 4, 5, 6]\n\n# filter + lambda 写法\nevens1 = list(filter(lambda x: x % 2 == 0, nums))\n\n# 列表推导式写法（更推荐）\nevens2 = [x for x in nums if x % 2 == 0]\n\nprint("两种方式结果一致:", evens1 == evens2)`
          },
        ],
        codeExample: `numbers = [1, 2, 3, 4, 5, 6, 7, 8]\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nsquared = list(map(lambda x: x ** 2, evens))\nprint("过滤偶数:", evens)\nprint("偶数平方映射:", squared)`,
        tips: [
          'Lambda 主体中只能书写单个简单表达式，不能包含复杂的赋值语句或循环。',
          '排序时指定 key 函数是 lambda 最经典的使用场景。'
        ]
      }
    },
    {
      id: 'p4_closure',
      title: '闭包',
      stage: 'Python 函数与对象',
      summary: '内层函数记住外层函数的变量，即使外层已经执行完。',
      content: {
        overview: '闭包是一种「内层函数记住外层函数变量」的现象。外层函数执行完返回后，它的局部变量本应消失，但如果内层函数还引用着，这些变量就会被留住、继续可用。闭包常用来保存少量状态、做可配置的小工具。',
        sections: [
          { heading: '闭包长什么样', text: '外层函数定义一个变量，内层函数引用它，外层再把内层函数返回。之后每次调用返回的内层函数，都还能访问那个变量，仿佛它一直活着。在内层函数里修改外层变量要用 nonlocal 声明。',
            code: `def make_counter():\n    count = 0\n    def counter():\n        nonlocal count\n        count += 1\n        return count\n    return counter\n\nc = make_counter()\nprint("第一次:", c())\nprint("第二次:", c())\nprint("第三次:", c())`
          },
          {
            heading: '用闭包保存状态',
            text: '每次调用 make_counter() 都会产生一份独立的 count，各个计数器互不干扰。这比到处用全局变量干净，因为状态被关在闭包里，外部碰不到。',
            code: `c1 = make_counter()\nc2 = make_counter()\nc1()\nprint("c1 现在是:", c1())\nprint("c2 现在是:", c2())\nprint("c1 再数一次:", c1())`
          },
        ],
        codeExample: `def make_multiplier(n):\n    def multiply(x):\n        return x * n\n    return multiply\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint("双倍:", double(10))\nprint("三倍:", triple(10))`,
        tips: [
          '闭包会记住外层变量，适合做需要保存少量状态的小工具。',
          '在内层函数里修改外层函数变量时，要用 nonlocal 声明。'
        ]
      }
    },
    {
      id: 'p4_array',
      title: 'Python 数组',
      stage: 'Python 函数与对象',
      summary: 'array 是「统一类型」的紧凑数组，存大量数字更省内存。',
      content: {
        overview: '列表能装各种类型，很方便，但如果要存成千上万个同类型的数字，用标准库的 array 更省内存、更快。就像统一规格的货架比杂物筐更能装。',
        sections: [
          { heading: 'array 与 list 核心对比', text: '存一万个整数：列表 list 像杂货筐，什么都能放但占地方；array 像整齐的格子货架，只放整数，紧凑又高效。数据量小用列表就行，量大再考虑 array。\n\n',
            table: {
              headers: ['对比项', 'list 列表', 'array 数组'],
              rows: [
                ['元素类型', '任意混合类型', '必须是同类型数值'],
                ['内存占用', '大（存对象引用）', '小（紧凑存储二进制）'],
                ['功能', '丰富，支持增删改查', '较少，仅基础数值操作'],
                ['适用场景', '通用场景、混合数据', '大规模数值计算、节省内存']
              ]
            }
          },
          {
            heading: '常用类型码 (Type Codes)',
            text: '创建 array 时必须指定类型码，决定了存储的数值类型与占用字节数：\n• `"b"` / `"B"`：有符号/无符号 8 位整数\n• `"i"` / `"I"`：有符号/无符号 32 位整数\n• `"f"`：单精度浮点数（4 字节）\n• `"d"`：双精度浮点数（8 字节）',
            code: `import array\n\n# 创建带符号整数数组\nint_array = array.array('i', [10, 20, 30, 40, 50])\nint_array.append(60)\nprint("数组元素:", int_array)\nprint("单个元素字节数:", int_array.itemsize)\nprint("总占用字节数:", int_array.buffer_info()[1] * int_array.itemsize)`
          },
          {
            heading: 'array 常用方法',
            text: '支持 append、pop、insert、remove 等列表常用方法，还支持：\n• `.fromlist(lst)`：从列表批量添加\n• `.tolist()`：转为普通列表\n• `.byteswap()`：字节序转换',
            code: `import array\narr = array.array('i', [1, 2, 3])\narr.fromlist([4, 5, 6])\nprint("批量添加后:", arr)\nprint("转回列表:", arr.tolist())`
          },
          {
            heading: '索引、切片与基本读写',
            text: 'array 支持和 list 几乎一样的下标访问、切片、len 长度和 extend 批量扩展。区别只是它只存同类型数字，不能塞字符串进去。',
            code: `import array\narr = array.array('i', [10, 20, 30, 40, 50])\n\nprint("长度:", len(arr))\nprint("第一个元素:", arr[0])\nprint("切片 [1:4]:", arr[1:4])\narr[0] = 99\narr.extend([60, 70])\nprint("修改并扩展后:", arr)`
          },
        ],
        codeExample: `import array\nfloats = array.array('d', [1.1, 2.2, 3.3])\nprint("双精度浮点数组:", floats)`,
        tips: [
          '进行大规模科学计算与多维矩阵运算时，请优先使用扩展库 NumPy。',
          '普通小规模数据用 list 即可，array 适合十万级以上同质数值数据。'
        ]
      }
    },
    {
      id: 'p4_class',
      title: 'Python 类/对象',
      stage: 'Python 函数与对象',
      summary: '类是「设计图」，对象是照图做出来的「实物」。',
      content: {
        overview: '面向对象编程（OOP）把程序看成「对象」的世界：类（Class）是设计图，对象（Object）是照图做出来的实物。比如「狗」是类，你家的「旺财」是对象。',
        sections: [
          { heading: '面向对象核心概念', text: '蛋糕店：模具（类）可以反复使用，每个用模具烤出来的蛋糕（对象）都长得一样，但可以加不同的水果装饰。Python 里 class Dog: 定义模具，Dog() 做出对象。\n\n• 类（Class）：对象的模板，定义了共同的属性和方法\n• 对象/实例（Object/Instance）：根据类创建的具体实体\n• 属性（Attribute）：对象的数据、特征\n• 方法（Method）：对象的行为、功能\n• 封装：将数据和操作数据的方法绑定在一起，对外隐藏内部细节',
            code: `# 定义一个银行账户类\nclass BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner          # 公开实例属性\n        self.__balance = balance    # 私有属性（双下划线开头）\n        \n    def deposit(self, amount: float):\n        \"\"\"存款方法\"\"\"\n        if amount > 0:\n            self.__balance += amount\n            print(f"成功存入 ￥{amount}, 当前余额: ￥{self.__balance}")\n    \n    def withdraw(self, amount: float):\n        \"\"\"取款方法\"\"\"\n        if 0 < amount <= self.__balance:\n            self.__balance -= amount\n            print(f"成功取出 ￥{amount}, 当前余额: ￥{self.__balance}")\n            return True\n        print("余额不足或金额无效")\n        return False\n            \n    def get_balance(self) -> float:\n        \"\"\"查询余额（只读访问）\"\"\"\n        return self.__balance\n\n# 创建实例对象\nacc = BankAccount("Alice", 1000.0)\nacc.deposit(500.0)\nacc.withdraw(300.0)\nprint("最终账户余额:", acc.get_balance())`
          },
          {
            heading: 'self 参数',
            text: '所有实例方法的第一个参数必须是 self，它代表当前实例对象本身。\n• 通过 self.xxx 访问实例属性\n• 通过 self.xxx() 调用其他实例方法\n• 调用方法时不需要手动传 self，Python 会自动传入',
            code: `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def introduce(self):\n        # 用 self 访问自身属性和方法\n        print(f"我叫 {self.name}，今年 {self.age} 岁")\n\np = Person("Bob", 20)\np.introduce()  # 调用时不用传 self`
          },
          {
            heading: '类属性 vs 实例属性',
            text: '• 实例属性：每个对象独有一份，互不影响，在 __init__ 中定义\n• 类属性：所有实例共享同一份，属于类本身，直接写在类里',
            code: `class Circle:\n    pi = 3.14159  # 类属性，所有圆共享\n    \n    def __init__(self, radius):\n        self.radius = radius  # 实例属性，每个圆不一样\n    \n    def area(self):\n        return Circle.pi * (self.radius ** 2)\n\nc1 = Circle(5)\nc2 = Circle(10)\nprint("c1 面积:", c1.area())\nprint("c2 面积:", c2.area())`
          },
          {
            heading: '装饰器 @ 符号是什么',
            text: '从现在起会频繁看到 @ 开头的写法，比如 @property、@staticmethod、@abstractmethod。它叫装饰器，本质是「把它下面定义的函数再包装一层」，给这个函数附加额外能力。你现在先记住：写在定义上面，就是给这个方法加功能，具体原理后面会专门讲。'
          },
          {
            heading: '@property 把方法变属性',
            text: '以前手写 get_xxx()/set_xxx() 访问方法，Python 更推荐用 @property。它让你能像访问属性一样读写，内部却可以做校验和计算，调用方却完全感觉不到是方法。',
            code: `class Temperature:\n    def __init__(self, celsius):\n        self._celsius = celsius\n\n    @property\n    def celsius(self):\n        return self._celsius\n\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError("温度不能低于绝对零度")\n        self._celsius = value\n\nt = Temperature(25)\nprint("读取属性:", t.celsius)\nt.celsius = 30\nprint("写入后:", t.celsius)`
          },
          {
            heading: '@staticmethod 与 @classmethod',
            text: '普通方法第一个参数是 self（实例本身）。静态方法 @staticmethod 不需要 self，就是个放在类命名空间里的普通函数；类方法 @classmethod 第一个参数是 cls（类本身），常用来操作类属性或做替代构造函数。',
            code: `class MathBox:\n    count = 0\n\n    @staticmethod\n    def square(x):\n        return x * x\n\n    @classmethod\n    def show_count(cls):\n        print(f"类属性 count = {cls.count}")\n\nprint("静态方法:", MathBox.square(5))\nMathBox.count = 3\nMathBox.show_count()`
          },
          {
            heading: '单下划线与双下划线约定',
            text: '_name 单下划线开头是一种约定：表示「内部使用，外部别乱动」，但技术上仍能访问。__name 双下划线开头会触发名称改写，Python 把它改成 _类名__name，避免子类意外覆盖。它们都不是真正的访问控制，只是保护约定。',
            code: `class Demo:\n    def __init__(self):\n        self.public = 1       # 公开属性\n        self._internal = 2    # 约定内部使用\n        self.__secret = 3     # 触发名称改写\n\nd = Demo()\nprint("公开:", d.public)\nprint("约定内部:", d._internal)\nprint("名称改写后:", d._Demo__secret)`
          },
          {
            heading: 'isinstance 类型检查',
            text: '判断一个对象是不是某个类的实例，用 isinstance(obj, 类)。它比 type() 更推荐，因为它会考虑继承关系——子类的实例也算作父类的实例。还可以传入元组同时检查多种类型。',
            code: `print(isinstance(5, int))\nprint(isinstance("hi", str))\nprint(isinstance([], (list, tuple)))\n\nclass Animal:\n    pass\nclass Dog(Animal):\n    pass\n\nprint("子类实例也算父类:", isinstance(Dog(), Animal))`
          },
        ],
        codeExample: `class Circle:\n    pi = 3.14159  # 类属性\n    def __init__(self, radius):\n        self.radius = radius\n    def area(self):\n        return Circle.pi * (self.radius ** 2)\n\nc = Circle(5)\nprint(f"半径为 5 的圆面积为: {c.area():.2f}")`,
        tips: [
          '类属性被所有该类的实例对象共享，而实例属性仅归属于具体单个实例。',
          '双下划线开头的属性是名称改写，不是真正的私有，只是一种约定保护。'
        ]
      }
    },
    {
      id: 'p4_magic_methods',
      title: '魔术方法',
      stage: 'Python 函数与对象',
      summary: '用双下划线方法让自定义对象支持 print、len、+ 等内置语法。',
      content: {
        overview: 'Python 里有一类以双下划线开头和结尾的方法，叫「魔术方法」（dunder method）。它们让你的自定义对象能用 print、len、+ 这些内置语法操作，用起来就和内置类型一样自然。',
        sections: [
          { heading: '__str__ 与 __repr__', text: '直接 print 自定义对象，默认只会打印一串难看的内存地址。定义 __str__ 可以定制「给人看」的字符串；定义 __repr__ 定制「给开发者看」的、尽量能还原对象的字符串。',
            code: `class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n    def __str__(self):\n        return f"《{self.title}》共{self.pages}页"\n    def __repr__(self):\n        return f"Book(title={self.title!r}, pages={self.pages})"\n\nb = Book("Python 入门", 300)\nprint(str(b))\nprint(repr(b))`
          },
          {
            heading: '__len__ 与 __call__（进阶）',
            text: '定义 __len__ 后对象就能被 len() 调用；定义 __call__ 后对象可以像函数一样加括号调用，这叫「可调用对象」。',
            code: `class Bag:\n    def __init__(self, items):\n        self.items = list(items)\n    def __len__(self):\n        return len(self.items)\n    def __call__(self, label):\n        print(f"标签 {label}: 袋子里有 {self.items}")\n\nbag = Bag(["苹果", "香蕉"])\nprint("数量:", len(bag))\nbag("早餐")`
          },
          {
            heading: '运算符重载（进阶）',
            text: '定义 __add__ 就让对象支持 +，定义 __eq__ 支持 ==。Python 把每个运算符都映射到对应的魔术方法，重载后自定义对象就能用熟悉的符号运算。',
            code: `class Pair:\n    def __init__(self, a, b):\n        self.a = a\n        self.b = b\n    def __add__(self, other):\n        return Pair(self.a + other.a, self.b + other.b)\n    def __repr__(self):\n        return f"Pair({self.a}, {self.b})"\n\np1 = Pair(1, 2)\np2 = Pair(10, 20)\nprint("相加结果:", p1 + p2)`
          },
        ],
        codeExample: `class Vec:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __add__(self, other):\n        return Vec(self.x + other.x, self.y + other.y)\n    def __repr__(self):\n        return f"Vec({self.x}, {self.y})"\n\nv = Vec(1, 2) + Vec(3, 4)\nprint(v)`,
        tips: [
          '__str__ 面向用户展示，__repr__ 面向调试还原。',
          '不要随意定义太多魔术方法，只在语义自然、确实能让对象更易用时使用。'
        ]
      }
    },
    {
      id: 'p4_inheritance',
      title: 'Python 继承',
      stage: 'Python 函数与对象',
      summary: '继承让新类「继承」老类的能力，还能自己修改。',
      content: {
        overview: '继承就是「子承父业」：子类（孩子）自动拥有父类（父母）的属性和方法，还可以按需重写或新增。这样就不用把相同的代码再写一遍。',
        sections: [
          { heading: '单继承基础语法', text: '「动物」类会呼吸、会动；「狗」继承动物，自动会呼吸、会动，还多一个「汪汪叫」；「猫」继承动物，多个「喵喵叫」。子类省去重复代码，只写自己特有的部分。\n\n• 语法：`class 子类名(父类名):`\n• 子类拥有父类所有的属性和方法\n• 子类可以新增自己的属性和方法\n• 子类可以重写父类的方法',
            code: `class Vehicle:\n    def __init__(self, brand, speed):\n        self.brand = brand\n        self.speed = speed\n        \n    def drive(self):\n        print(f"{self.brand} 正在以 {self.speed} km/h 行驶")\n\nclass ElectricCar(Vehicle):\n    def __init__(self, brand, speed, battery_capacity):\n        super().__init__(brand, speed)  # 调用父类构造方法\n        self.battery_capacity = battery_capacity  # 子类新增属性\n        \n    def drive(self):  # 重写父类方法\n        print(f"{self.brand} 电动车 (电池 {self.battery_capacity}kWh) 静音行驶中")\n    \n    def charge(self):  # 子类新增方法\n        print(f"{self.brand} 正在充电...")\n\ntesla = ElectricCar("Tesla", 120, 75)\ntesla.drive()\ntesla.charge()`
          },
          {
            heading: 'super() 函数',
            text: 'super() 用于调用父类的方法，最常见是在 __init__ 里复用父类初始化。它也可以在普通方法里调用父类的同名方法，做到「先借用父类的实现，再补充子类自己的逻辑」。多重继承下它还会按 MRO 顺序正确查找父类。',
            code: `class Vehicle:\n    def move(self):\n        return "车辆移动"\n\nclass Car(Vehicle):\n    def move(self):\n        base = super().move()   # 调用父类的同名方法\n        return base + "，靠四轮行驶"\n\nprint(Car().move())`
          },
          {
            heading: '多重继承与 MRO',
            text: 'Python 支持一个类继承多个父类，称为多重继承。方法解析顺序（MRO）决定了方法查找的优先级，可以用 类名.__mro__ 查看。原则：子类优先于父类，同级按继承顺序从左到右。',
            code: `class A:\n    pass\nclass B(A):\n    pass\nclass C(A):\n    pass\nclass D(B, C):\n    pass\n\nprint("D 的方法解析顺序:")\nfor cls in D.__mro__:\n    print(" ->", cls.__name__)`
          },
        ],
        codeExample: `class Vehicle:\n    def move(self):\n        return "移动"\n\nclass Car(Vehicle):\n    def move(self):\n        return super().move() + "（四轮）"\n\nprint(Car().move())`,
        tips: [
          '可以通过 `issubclass(Child, Parent)` 校验类之间的继承关系。',
          '多重继承容易让代码变复杂，非必要不使用，优先用组合替代继承。'
        ]
      }
    },
    {
      id: 'p4_iterators',
      title: 'Python 迭代',
      stage: 'Python 函数与对象',
      summary: '迭代就是「一个一个地取」，生成器边算边给、省内存。',
      content: {
        overview: '迭代就是从一个集合里「一个一个」地把元素取出来。生成器（Generator）更聪明：它不一次性生成全部数据，而是「用到一个算一个」，处理海量数据时特别省内存。',
        sections: [
          { heading: '迭代器协议', text: '点菜上菜：普通列表像一次性做好 100 道菜端上来，占地方；生成器像「报一道上一道」，厨房边做边上。处理 100 万个数字时，生成器几乎不占内存。\n\n可迭代对象（Iterable）：实现了 `__iter__()` 方法，能被 for 循环遍历（如 list、str、dict）。\n迭代器（Iterator）：同时实现了 `__iter__()` 和 `__next__()` 方法，调用 next() 逐个返回元素。\n• `iter(可迭代对象)` 获取迭代器\n• `next(迭代器)` 获取下一个元素，没有了抛出 StopIteration',
            code: `nums = [1, 2, 3]\nit = iter(nums)  # 获取迭代器\nprint(next(it))  # 1\nprint(next(it))  # 2\nprint(next(it))  # 3`
          },
          {
            heading: '生成器函数与 yield',
            text: '函数体内包含 `yield` 就是生成器函数，调用它返回生成器对象，不会立即执行函数体。\n每次调用 next() 执行到下一个 yield 处挂起，返回值；下次调用从挂起处继续。',
            code: `def fibonacci_generator(n):\n    a, b = 0, 1\n    count = 0\n    while count < n:\n        yield a  # 产出值并挂起\n        a, b = b, a + b\n        count += 1\n\n# 使用生成器输出斐波那契数列\nfor num in fibonacci_generator(8):\n    print("Fibonacci 项:", num)`
          },
          {
            heading: '自定义迭代器类',
            text: '之前用 iter(list) 拿现成迭代器。你也可以自己写类实现迭代器协议：定义 __iter__ 返回自身，定义 __next__ 返回下一个值，没值了就抛 StopIteration。这样你的对象就能直接用 for 循环遍历。',
            code: `class CountDown:\n    def __init__(self, start):\n        self.current = start\n    def __iter__(self):\n        return self\n    def __next__(self):\n        if self.current <= 0:\n            raise StopIteration\n        self.current -= 1\n        return self.current + 1\n\nfor n in CountDown(3):\n    print("倒数:", n)`
          },
          {
            heading: '生成器表达式',
            text: '把列表推导式的方括号换成圆括号就是生成器表达式，惰性计算，几乎不占内存。\n适合处理百万级大数据流。',
            code: `# 生成器表达式（惰性，不占内存）\nsquares_gen = (x ** 2 for x in range(1000000))\nprint("生成器创建成功，内存占用极小:", type(squares_gen))\nprint("获取首个元素:", next(squares_gen))`
          },
          {
            heading: 'yield from 委派生成器（进阶）',
            text: '生成器里用 yield from 可以把另一个可迭代对象的元素逐个产出，省去手写 for 循环。它还能在生成器之间做委派，把请求和返回值透明地转发出去。',
            code: `def sub_gen():\n    yield 1\n    yield 2\n\ndef main_gen():\n    yield "开始"\n    yield from sub_gen()\n    yield from [3, 4]\n    yield "结束"\n\nprint(list(main_gen()))`
          },
        ],
        codeExample: `# 生成器表达式 (Generator Expression)\nsquares_gen = (x ** 2 for x in range(1000000))\nprint("生成器表达式创建成功，内存占用极小:", type(squares_gen))\nprint("获取首个元素:", next(squares_gen))`,
        tips: [
          '生成器表达式比列表推导式在处理百万级大数据流时更加节省内存空间。',
          '生成器只能遍历一次，遍历完就空了，需要重新创建。'
        ]
      }
    },
    {
      id: 'p4_polymorphism',
      title: 'Python 多态',
      stage: 'Python 函数与对象',
      summary: '多态就是「鸭子类型」：会走会叫，就当它是鸭子。',
      content: {
        overview: '有一句经典的话：「如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。」Python 的多态就是这样：不关心对象是什么类，只关心它有没有我们需要的方法，这叫鸭子类型。',
        sections: [
          { heading: '鸭子类型与多态', text: '你想让宠物「叫」，不管是狗、猫还是鸭子，只要它们都有 make_sound() 这个方法，就能用同一段代码统一调用。程序不用知道具体是哪种动物，只要「会叫」就行。\n\n不同的类只要实现了同名方法，就可以在同一个函数中统一调用，不需要继承同一个父类。\n这就是「面向接口编程，而非面向实现编程」的思想。',
            code: `class PDFExporter:\n    def export(self, data):\n        print(f"将数据导出为 PDF 格式")\n\nclass CSVExporter:\n    def export(self, data):\n        print(f"将数据导出为 CSV 表格")\n\nclass ExcelExporter:\n    def export(self, data):\n        print(f"将数据导出为 Excel 文件")\n\ndef generate_report(exporter, data):\n    exporter.export(data)  # 只要有 export 方法就能用\n\n# 三种不同类的对象，同一个函数调用\ngenerate_report(PDFExporter(), [10, 20])\ngenerate_report(CSVExporter(), [10, 20])\ngenerate_report(ExcelExporter(), [10, 20])`
          },
          {
            heading: '抽象基类 ABC',
            text: '如果需要强制子类必须实现某些方法，可以使用 abc 模块定义抽象基类。\n包含抽象方法的类不能实例化，子类必须实现所有抽象方法才能实例化。@abstractmethod 就是前面说过的装饰器，用来标记「这个方法子类必须重写」。',
            code: `from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self):\n        \"\"\"计算面积，子类必须实现\"\"\"\n        pass\n\nclass Rectangle(Shape):\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nr = Rectangle(3, 4)\nprint("矩形面积:", r.area())`
          },
          {
            heading: '多态的优势',
            text: '1. 扩展性强：新增同类功能只需加新类，不用改原有代码\n2. 降低耦合：调用方只关心接口，不关心具体实现\n3. 代码简洁：统一调用方式，减少重复判断逻辑'
          },
        ],
        codeExample: `class Dog:\n    def speak(self): return "Woof!"\nclass Cat:\n    def speak(self): return "Meow!"\n\nanimals = [Dog(), Cat()]\nfor a in animals:\n    print(a.speak())`,
        tips: [
          '可以使用 abc 模块的 `ABCMeta` 和 `@abstractmethod` 强制子类规范接口实现。',
          'Python 更推崇鸭子类型，不要为了用多态而强行写继承层级。'
        ]
      }
    },
    {
      id: 'p4_scope',
      title: 'Python 作用域',
      stage: 'Python 函数与对象',
      summary: '作用域决定变量「在哪里有效」，记住 LEGB 规则。',
      content: {
        overview: '作用域就是变量「有效的地盘」：函数里定义的变量，出了函数就找不到了。Python 查找变量按 LEGB 顺序：先在函数里找（Local），再到外层函数（Enclosing），再到全局（Global），最后到内置（Built-in）。',
        sections: [
          { heading: 'LEGB 四层作用域', text: '就像班级的「值日表」和学校的「作息表」：班级值日表只在班里有效（局部变量），学校作息表全校通用（全局变量）。在班里查东西先看班里的表，查不到再看全校的。\n\n1. **Local 局部作用域**：函数内部定义的变量\n2. **Enclosing 嵌套作用域**：外层函数的变量（闭包场景）\n3. **Global 全局作用域**：模块层级的变量\n4. **Built-in 内置作用域**：解释器内置的标识符（如 len、range、print）\n\n查找顺序：从内到外依次查找，找到就停止，找不到报错。',
            table: {
              headers: ['作用域层级', '英文全称', '说明'],
              rows: [
                ['局部', 'Local', '函数/方法内部'],
                ['嵌套', 'Enclosing', '外层函数（闭包）'],
                ['全局', 'Global', '当前模块/文件'],
                ['内置', 'Built-in', 'Python 内置函数名']
              ]
            }
          },
          {
            heading: 'global 与 nonlocal',
            text: '默认情况下，函数内只能读取外部变量，赋值会被当作新建局部变量。\n• `global x`：声明在函数内修改全局变量 x\n• `nonlocal x`：声明在闭包内修改外层嵌套函数的变量 x',
            code: `count = 0  # 全局变量\n\ndef outer_function():\n    msg = "Outer"  # 嵌套变量\n    def inner_function():\n        nonlocal msg        # 修改外层函数变量\n        msg = "Inner Modified"\n        global count        # 修改全局变量\n        count += 1\n    inner_function()\n    print("闭包修改后的 msg:", msg)\n\nouter_function()\nprint("全局修改后的 count:", count)`
          },
          {
            heading: '可变对象就地修改 vs 重新绑定',
            text: '函数内修改外部可变对象时，如果只是调用它的方法（append、改字典键值），不需要 global，因为你没有重新绑定那个名字。但如果写 变量 = 新值 重新绑定了名字，就必须用 global 声明，否则 Python 会把它当成全新的局部变量。',
            code: `data = [1, 2, 3]\n\ndef add():\n    data.append(4)   # 就地修改，没有重新绑定，不需要 global\n\nadd()\nprint("就地修改后:", data)\n\ncount = 10\ndef reset():\n    global count\n    count = 20       # 重新绑定名字，必须用 global 声明\n\nreset()\nprint("重新绑定后:", count)`
          },
          {
            heading: '常见作用域坑点',
            text: '• 函数内赋值变量会被认为是局部变量，即使外面有同名全局变量\n• 先引用后赋值会报错 UnboundLocalError\n• 不要定义和内置函数同名的变量，会屏蔽内置功能',
            code: `# • 错误示例：先引用后赋值\n# x = 10\n# def test():\n# •    print(x)  # 报错，因为下面赋值了，x 被认为是局部的\n# •    x = 20\n\n# • 正确：声明 global\ndef test():\n    global x\n    print(x)`
          },
        ],
        codeExample: `# 全局(Global)作用域的变量
message = "我是全局变量"

def outer():
    message = "我是外层(Enclosing)变量"
    def inner():
        message = "我是局部(Local)变量"
        print("inner 内部看到:", message)
    inner()
    print("outer 里看到:", message)

outer()
print("全局位置看到:", message)`,
        tips: [
          '过度使用 global 变量会增加函数间的耦合，应尽量采用参数传递与返回值。',
          '命名变量时避开 len、list、str 等内置名称，防止覆盖内置函数。'
        ]
      }
    },
    {
      id: 'p4_type_hints',
      title: '类型注解',
      stage: 'Python 函数与对象',
      summary: '给变量和函数标注类型，让代码更清晰、IDE 更早发现错误。',
      content: {
        overview: '类型注解（Type Hints）是给变量、参数、返回值标注类型的写法。它不会影响运行结果，只是让代码更易读、让 IDE 和工具能提前发现类型错误。在大型项目和团队协作中强烈推荐使用。',
        sections: [
          { heading: '基本标注语法', text: '在变量名后加冒号写类型，函数返回值用 -> 标注。注解只是给人和工具看的，Python 运行时不会强制检查类型。',
            code: `def greet(name: str) -> str:\n    return f"你好，{name}"\n\nage: int = 18\nprice: float = 19.9\nprint(greet("小明"))\nprint(age, price)`
          },
          {
            heading: '容器与可选类型',
            text: '标注列表、字典等容器需要用到泛型；Optional[X] 表示这个值可能是 X，也可能是 None。Python 3.9 起可以直接用 list[int] 这种写法，旧版本从 typing 模块导入 List、Dict。',
            code: `from typing import List, Dict, Optional\n\ndef total(nums: List[int]) -> int:\n    return sum(nums)\n\nconfig: Dict[str, int] = {"width": 800, "height": 600}\n\ndef find_name(uid: int) -> Optional[str]:\n    if uid == 1:\n        return "小明"\n    return None\n\nprint(total([1, 2, 3]))\nprint(config)\nprint(find_name(1), find_name(99))`
          },
        ],
        codeExample: `from typing import List\n\ndef average(scores: List[float]) -> float:\n    return sum(scores) / len(scores)\n\ndata: List[float] = [80.0, 90.0, 100.0]\nprint("平均分:", average(data))`,
        tips: [
          '类型注解不改变运行时行为，但能大幅提升可读性和可维护性。',
          'Python 3.9+ 可以直接用 list[int]、dict[str, int] 代替 typing 里的泛型。'
        ]
      }
    }
  ]
};
