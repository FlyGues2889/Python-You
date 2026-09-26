import { TutorialStage, TutorialTopic } from '../tutorialData';

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
          { heading: '生活小例子', text: '每天都要给好朋友发早安问候，与其每次都打一遍，不如定义一个函数 say_hi()，里面写好「你好呀！」。以后只要调用 say_hi()，问候就自动发出去了。' },
          {
            heading: '参数类型全解',
            text: 'Python 函数参数分为四大类，定义顺序必须遵守：位置参数 → 默认参数 → *args → **kwargs\n1. 位置参数：按顺序一一匹配，调用时必须传入\n2. 默认参数：有默认值，调用时可省略，必须放在位置参数之后\n3. 变长位置参数 `*args`：接收多余位置参数，打包成元组\n4. 变长关键字参数 `**kwargs`：接收多余关键字参数，打包成字典',
            table: {
              headers: ['参数类型', '语法', '特点', '适用场景'],
              rows: [
                ['位置参数', 'def f(a, b)', '必须按顺序传入', '必填参数'],
                ['默认参数', 'def f(a, b=10)', '可省略，有默认值', '非必填参数'],
                ['*args', 'def f(*args)', '接收任意多位置参数', '参数数量不确定'],
                ['**kwargs', 'def f(**kwargs)', '接收任意多关键字参数', '动态键值参数']
              ]
            },
            code: `def build_user_profile(username, email, *hobbies, **attributes):\n    profile = {\n        "username": username,\n        "email": email,\n        "hobbies": hobbies,\n        "metadata": attributes\n    }\n    return profile\n\nuser = build_user_profile("alice", "alice@test.com", "coding", "reading", role="admin", level=5)\nprint("构造的用户字典:\\n", user)`
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
            heading: '小结',
            text: '用 def 函数名(参数): 定义函数，用 函数名(实参) 调用；参数是函数的「输入」，return 是「输出」；def greet(name): 里的 name 叫参数，greet("小明") 传的是实参。'
          }
        ],
        codeExample: `def multiply_all(*numbers):\n    result = 1\n    for n in numbers:\n        result *= n\n    return result\n\nprint("变长乘积计算:", multiply_all(2, 3, 4, 5))`,
        tips: [
          '切勿使用可变对象（如列表或字典）作为函数的默认参数值，应采用 None 进行延迟赋值。',
          '函数职责要单一，一个函数只做一件事，不要写几百行的大函数。'
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
          { heading: '生活小例子', text: '给一堆数字排序，想按「离 10 的距离」排：sorted(nums, key=lambda x: abs(x - 10))。这个小函数只干一件事——算出每个数离 10 多远，用完即弃，不用专门起名字。' },
          {
            heading: 'lambda 与普通函数对比',
            text: '',
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
            heading: '使用建议与误区',
            text: '• lambda 只适合简单逻辑，复杂逻辑请写普通 def 函数\n• 不要强行给 lambda 赋值命名，不如直接写 def\n• 大多数场景下，列表推导式比 map/filter+lambda 更易读',
            code: `# 列表推导式 vs filter+lambda\nnums = [1, 2, 3, 4, 5, 6]\n\n# filter + lambda 写法\nevens1 = list(filter(lambda x: x % 2 == 0, nums))\n\n# 列表推导式写法（更推荐）\nevens2 = [x for x in nums if x % 2 == 0]\n\nprint("两种方式结果一致:", evens1 == evens2)`
          },
          {
            heading: '小结',
            text: 'lambda 参数: 表达式，一行写完、自动返回结果；适合配合 sorted、map、filter 一起用；逻辑一复杂就别用 lambda，老老实实写 def 更清楚。'
          }
        ],
        codeExample: `numbers = [1, 2, 3, 4, 5, 6, 7, 8]\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nsquared = list(map(lambda x: x ** 2, evens))\nprint("过滤偶数:", evens)\nprint("偶数平方映射:", squared)`,
        tips: [
          'Lambda 主体中只能书写单个简单表达式，不能包含复杂的赋值语句或循环。',
          '排序时指定 key 函数是 lambda 最经典的使用场景。'
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
          { heading: '生活小例子', text: '存一万个整数：列表 list 像杂货筐，什么都能放但占地方；array 像整齐的格子货架，只放整数，紧凑又高效。数据量小用列表就行，量大再考虑 array。' },
          {
            heading: 'array 与 list 核心对比',
            text: '',
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
            heading: '小结',
            text: 'array.array 存同类型数据，比列表省内存；创建时指定类型码，比如 "i" 表示整数、"d" 表示小数；大多数场景用列表就够，海量同质数据才需要 array。'
          }
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
          { heading: '生活小例子', text: '蛋糕店：模具（类）可以反复使用，每个用模具烤出来的蛋糕（对象）都长得一样，但可以加不同的水果装饰。Python 里 class Dog: 定义模具，Dog() 做出对象。' },
          {
            heading: '面向对象核心概念',
            text: '• 类（Class）：对象的模板，定义了共同的属性和方法\n• 对象/实例（Object/Instance）：根据类创建的具体实体\n• 属性（Attribute）：对象的数据、特征\n• 方法（Method）：对象的行为、功能\n• 封装：将数据和操作数据的方法绑定在一起，对外隐藏内部细节',
            code: `# 定义一个银行账户类\nclass BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner          # 公开实例属性\n        self.__balance = balance    # 私有属性（双下划线开头）\n        \n    def deposit(self, amount: float):\n        \"\"\"存款方法\"\"\"\n        if amount > 0:\n            self.__balance += amount\n            print(f"成功存入 ￥{amount}, 当前余额: ￥{self.__balance}")\n    \n    def withdraw(self, amount: float):\n        \"\"\"取款方法\"\"\"\n        if 0 < amount <= self.__balance:\n            self.__balance -= amount\n            print(f"成功取出 ￥{amount}, 当前余额: ￥{self.__balance}")\n            return True\n        print("余额不足或金额无效")\n        return False\n            \n    def get_balance(self) -> float:\n        \"\"\"查询余额（只读访问）\"\"\"\n        return self.__balance\n\n# 创建实例对象\nacc = BankAccount("Alice", 1000.0)\nacc.deposit(500.0)\nacc.withdraw(300.0)\nprint("最终账户余额:", acc.get_balance())`
          },
          {
            heading: 'self 参数详解',
            text: '所有实例方法的第一个参数必须是 self，它代表当前实例对象本身。\n• 通过 self.xxx 访问实例属性\n• 通过 self.xxx() 调用其他实例方法\n• 调用方法时不需要手动传 self，Python 会自动传入',
            code: `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def introduce(self):\n        # 用 self 访问自身属性和方法\n        print(f"我叫 {self.name}，今年 {self.age} 岁")\n\np = Person("Bob", 20)\np.introduce()  # 调用时不用传 self`
          },
          {
            heading: '类属性 vs 实例属性',
            text: '• 实例属性：每个对象独有一份，互不影响，在 __init__ 中定义\n• 类属性：所有实例共享同一份，属于类本身，直接写在类里',
            code: `class Circle:\n    pi = 3.14159  # 类属性，所有圆共享\n    \n    def __init__(self, radius):\n        self.radius = radius  # 实例属性，每个圆不一样\n    \n    def area(self):\n        return Circle.pi * (self.radius ** 2)\n\nc1 = Circle(5)\nc2 = Circle(10)\nprint("c1 面积:", c1.area())\nprint("c2 面积:", c2.area())`
          },
          {
            heading: '小结',
            text: 'class 类名: 定义类，类名一般首字母大写；__init__ 是构造方法，负责给新对象「初始化」；self 代表「这个对象自己」，方法里通过 self 访问属性；用 类名() 创建对象。'
          }
        ],
        codeExample: `class Circle:\n    pi = 3.14159  # 类属性\n    def __init__(self, radius):\n        self.radius = radius\n    def area( self ):\n        return Circle.pi * (me.radius ** 2)\n\nc = Circle(5)\nprint(f"半径为 5 的圆面积为: {c.area():.2f}")`,
        tips: [
          '类属性被所有该类的实例对象共享，而实例属性仅归属于具体单个实例。',
          '双下划线开头的属性是名称改写，不是真正的私有，只是一种约定保护。'
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
          { heading: '生活小例子', text: '「动物」类会呼吸、会动；「狗」继承动物，自动会呼吸、会动，还多一个「汪汪叫」；「猫」继承动物，多个「喵喵叫」。子类省去重复代码，只写自己特有的部分。' },
          {
            heading: '单继承基础语法',
            text: '• 语法：`class 子类名(父类名):`\n• 子类拥有父类所有的属性和方法\n• 子类可以新增自己的属性和方法\n• 子类可以重写父类的方法',
            code: `class Vehicle:\n    def __init__(self, brand, speed):\n        self.brand = brand\n        self.speed = speed\n        \n    def drive(self):\n        print(f"{self.brand} 正在以 {self.speed} km/h 行驶")\n\nclass ElectricCar(Vehicle):\n    def __init__(self, brand, speed, battery_capacity):\n        super().__init__(brand, speed)  # 调用父类构造方法\n        self.battery_capacity = battery_capacity  # 子类新增属性\n        \n    def drive(self):  # 重写父类方法\n        print(f"{self.brand} 电动车 (电池 {self.battery_capacity}kWh) 静音行驶中")\n    \n    def charge(self):  # 子类新增方法\n        print(f"{self.brand} 正在充电...")\n\ntesla = ElectricCar("Tesla", 120, 75)\ntesla.drive()\ntesla.charge()`
          },
          {
            heading: 'super() 函数详解',
            text: '`super()` 用于调用父类的方法，最常用于构造方法初始化。\n• 保证父类属性被正确初始化\n• 多重继承下按照 MRO 顺序调用，避免重复调用\n• 方法重写后仍能调用父类原方法',
            code: `class Student(Person):\n    def __init__(self, name, age, student_id):\n        super().__init__(name, age)  # 复用父类初始化\n        self.student_id = student_id  # 新增属性`
          },
          {
            heading: '多重继承与 MRO',
            text: 'Python 支持一个类继承多个父类，称为多重继承。\n方法解析顺序（MRO）决定了方法查找的优先级，可以用 `类名.__mro__` 查看。\n原则：子类优先于父类，同级按继承顺序从左到右。',
            code: `print("查看 ElectricCar 的 MRO 解析链:")\nfor cls in ElectricCar.__mro__:\n    print(" ->", cls.__name__)`
          },
          {
            heading: '小结',
            text: 'class 子类(父类): 就实现了继承；子类自动拥有父类的方法，也可以重写；super() 用来调用父类的方法；子类对象既是子类类型，也是父类类型。'
          }
        ],
        codeExample: `print("查看 ElectricCar 的 MRO 解析链:")\nfor cls in ElectricCar.__mro__:\n    print(" ->", cls.__name__)`,
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
          { heading: '生活小例子', text: '点菜上菜：普通列表像一次性做好 100 道菜端上来，占地方；生成器像「报一道上一道」，厨房边做边上。处理 100 万个数字时，生成器几乎不占内存。' },
          {
            heading: '迭代器协议',
            text: '可迭代对象（Iterable）：实现了 `__iter__()` 方法，能被 for 循环遍历（如 list、str、dict）。\n迭代器（Iterator）：同时实现了 `__iter__()` 和 `__next__()` 方法，调用 next() 逐个返回元素。\n• `iter(可迭代对象)` 获取迭代器\n• `next(迭代器)` 获取下一个元素，没有了抛出 StopIteration',
            code: `nums = [1, 2, 3]\nit = iter(nums)  # 获取迭代器\nprint(next(it))  # 1\nprint(next(it))  # 2\nprint(next(it))  # 3`
          },
          {
            heading: '生成器函数与 yield',
            text: '函数体内包含 `yield` 就是生成器函数，调用它返回生成器对象，不会立即执行函数体。\n每次调用 next() 执行到下一个 yield 处挂起，返回值；下次调用从挂起处继续。',
            code: `def fibonacci_generator(n):\n    a, b = 0, 1\n    count = 0\n    while count < n:\n        yield a  # 产出值并挂起\n        a, b = b, a + b\n        count += 1\n\n# 使用生成器输出斐波那契数列\nfor num in fibonacci_generator(8):\n    print("Fibonacci 项:", num)`
          },
          {
            heading: '生成器表达式',
            text: '把列表推导式的方括号换成圆括号就是生成器表达式，惰性计算，几乎不占内存。\n适合处理百万级大数据流。',
            code: `# 生成器表达式（惰性，不占内存）\nsquares_gen = (x ** 2 for x in range(1000000))\nprint("生成器创建成功，内存占用极小:", type(squares_gen))\nprint("获取首个元素:", next(squares_gen))`
          },
          {
            heading: '小结',
            text: 'for 循环本质就是迭代：逐个取出元素；yield 能把普通函数变成生成器；生成器「惰性求值」——用多少算多少，省内存；next() 可以手动取下一个元素。'
          }
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
          { heading: '生活小例子', text: '你想让宠物「叫」，不管是狗、猫还是鸭子，只要它们都有 make_sound() 这个方法，就能用同一段代码统一调用。程序不用知道具体是哪种动物，只要「会叫」就行。' },
          {
            heading: '鸭子类型与多态',
            text: '不同的类只要实现了同名方法，就可以在同一个函数中统一调用，不需要继承同一个父类。\n这就是「面向接口编程，而非面向实现编程」的思想。',
            code: `class PDFExporter:\n    def export(self, data):\n        print(f"将数据导出为 PDF 格式")\n\nclass CSVExporter:\n    def export(self, data):\n        print(f"将数据导出为 CSV 表格")\n\nclass ExcelExporter:\n    def export(self, data):\n        print(f"将数据导出为 Excel 文件")\n\ndef generate_report(exporter, data):\n    exporter.export(data)  # 只要有 export 方法就能用\n\n# 三种不同类的对象，同一个函数调用\ngenerate_report(PDFExporter(), [10, 20])\ngenerate_report(CSVExporter(), [10, 20])\ngenerate_report(ExcelExporter(), [10, 20])`
          },
          {
            heading: '抽象基类 ABC',
            text: '如果需要强制子类必须实现某些方法，可以使用 abc 模块定义抽象基类。\n包含抽象方法的类不能实例化，子类必须实现所有抽象方法才能实例化。',
            code: `from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self):\n        \"\"\"计算面积，子类必须实现\"\"\"\n        pass\n\nclass Rectangle(Shape):\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nr = Rectangle(3, 4)\nprint("矩形面积:", r.area())`
          },
          {
            heading: '多态的优势',
            text: '1. 扩展性强：新增同类功能只需加新类，不用改原有代码\n2. 降低耦合：调用方只关心接口，不关心具体实现\n3. 代码简洁：统一调用方式，减少重复判断逻辑'
          },
          {
            heading: '小结',
            text: 'Python 看的是「有没有这个方法」，而不是「是不是这个类」；不同对象有相同的方法名，就能用同一段代码处理；这样写出的代码更灵活，也方便扩展。'
          }
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
          { heading: '生活小例子', text: '就像班级的「值日表」和学校的「作息表」：班级值日表只在班里有效（局部变量），学校作息表全校通用（全局变量）。在班里查东西先看班里的表，查不到再看全校的。' },
          {
            heading: 'LEGB 四层作用域',
            text: '1. **Local 局部作用域**：函数内部定义的变量\n2. **Enclosing 嵌套作用域**：外层函数的变量（闭包场景）\n3. **Global 全局作用域**：模块层级的变量\n4. **Built-in 内置作用域**：解释器内置的标识符（如 len、range、print）\n\n查找顺序：从内到外依次查找，找到就停止，找不到报错。',
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
            heading: '常见作用域坑点',
            text: '• 函数内赋值变量会被认为是局部变量，即使外面有同名全局变量\n• 先引用后赋值会报错 UnboundLocalError\n• 不要定义和内置函数同名的变量，会屏蔽内置功能',
            code: `# • 错误示例：先引用后赋值\n# x = 10\n# def test():\n# •    print(x)  # 报错，因为下面赋值了，x 被认为是局部的\n# •    x = 20\n\n# • 正确：声明 global\ndef test():\n    global x\n    print(x)`
          },
          {
            heading: '小结',
            text: '函数内赋值的变量默认是局部变量，函数外看不到；想在函数里改全局变量，用 global 声明；在嵌套函数里改外层变量，用 nonlocal；变量命名别偷懒，避免无意中冲突。'
          }
        ],
        codeExample: `import builtins\nprint("检查 Built-in 内置标识符数量:", len(dir(builtins)))`,
        tips: [
          '过度使用 global 变量会增加函数间的耦合，应尽量采用参数传递与返回值。',
          '命名变量时避开 len、list、str 等内置名称，防止覆盖内置函数。'
        ]
      }
    }
  ]
};
