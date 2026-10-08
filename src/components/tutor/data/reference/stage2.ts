import { TutorialStage } from '../../tutorialData';

// 容器与字符串的二级方法速查：按「对象.方法(参数)」分组列全，方便写代码时直接翻
export const refStage2: TutorialStage = {
  id: 'ref_stage2',
  title: '容器方法速查',
  icon: 'category',
  topics: [
    {
      id: 'ref_str_methods',
      title: '字符串方法',
      stage: 'Python 参考手册 > 字符串方法',
      kind: 'reference',
      summary: 'str 的查找、切分、拼接、大小写与格式方法一表查全。',
      content: {
        overview: '字符串一旦创建就不能改，所有「修改」方法都返回新字符串（原字符串不动）。下表按用途分组，示例里的 s 是任意字符串。',
        sections: [
          {
            text: '查找与判断：',
            table: {
              headers: ['方法', '示例', '说明'],
              rows: [
                ['s.find(sub)', '"abc".find("b") → 1', '返回首次出现的下标，找不到返回 -1'],
                ['s.index(sub)', '"abc".index("b") → 1', '同 find，但找不到会抛 ValueError'],
                ['s.count(sub)', '"aab".count("a") → 2', '统计子串出现次数'],
                ['s.startswith(x)', '"abc".startswith("ab") → True', '是否以 x 开头（可传元组匹配多个）'],
                ['s.endswith(x)', '"a.py".endswith(".py") → True', '是否以 x 结尾'],
                ['s.isdigit()', '"123".isdigit() → True', '是否全是数字字符（还有 isalpha / isalnum / isspace）']
              ]
            }
          },
          {
            text: '切分、拼接与清理：',
            table: {
              headers: ['方法', '示例', '说明'],
              rows: [
                ['s.split(sep)', '"a,b".split(",") → ["a", "b"]', '按分隔符切分成列表；不传参数按任意空白切'],
                ['s.rsplit(sep, n)', '"a,b,c".rsplit(",", 1) → ["a,b", "c"]', '从右侧切分，最多切 n 次'],
                ['s.splitlines()', '"a\\nb".splitlines() → ["a", "b"]', '按行切分，不保留换行符'],
                ['sep.join(iter)', '",".join(["a","b"]) → "a,b"', '用 sep 把字符串序列拼成一个字符串（元素必须都是字符串）'],
                ['s.strip()', '" x ".strip() → "x"', '去掉两端空白；还有 lstrip / rstrip'],
                ['s.strip(chars)', '"xxaxx".strip("x") → "a"', '去掉两端出现的指定字符集合'],
                ['s.replace(a, b)', '"aXa".replace("X", "-") → "a-a"', '替换全部；第三参数可限制次数']
              ]
            }
          },
          {
            text: '大小写与对齐：',
            table: {
              headers: ['方法', '示例', '说明'],
              rows: [
                ['s.upper() / s.lower()', '"aB".upper() → "AB"', '转大写 / 转小写'],
                ['s.title()', '"hello world".title() → "Hello World"', '每个单词首字母大写'],
                ['s.capitalize()', '"hello".capitalize() → "Hello"', '仅首字母大写，其余变小写'],
                ['s.casefold()', '"STRASSE".casefold()', '更彻底的小写（比较时用，可配 ==）'],
                ['s.zfill(n)', '"7".zfill(3) → "007"', '左侧补 0 到总长 n'],
                ['s.center(n) / ljust / rjust', '"x".center(3, "-") → "-x-"', '居中 / 左对齐 / 右对齐填充'],
                ['s.removeprefix(x) / removesuffix(x)', '"a.py".removesuffix(".py") → "a"', '去前缀 / 去后缀（3.9+）']
              ]
            }
          },
          {
            text: '格式化：f-string 里 `{值:格式}` 冒号后可跟格式符 —— 保留小数 `f"{3.14159:.2f}" → "3.14"`、百分比 `f"{0.256:.1%}" → "25.6%"`、千分位 `f"{1234567:,}" → "1,234,567"`、补零对齐 `f"{7:03d}" → "007"`、进制 `f"{255:x}" → "ff"`。旧的 `%` 格式化和 `str.format()` 写法在旧代码里常见，新代码统一用 f-string。'
          }
        ]
      }
    },
    {
      id: 'ref_list_methods',
      title: '列表与元组方法',
      stage: 'Python 参考手册 > 列表 / 元组方法',
      kind: 'reference',
      summary: '列表增删改查与排序、元组的两个方法，附切片写法。',
      content: {
        overview: '列表（list）可增删改，方法都是「原位修改」不返回新列表（返回 None）；元组（tuple）不可变，只有 count 与 index 两个方法。下表里的 lst 指任意列表。',
        sections: [
          {
            text: '增删改：',
            table: {
              headers: ['方法', '示例', '说明'],
              rows: [
                ['lst.append(x)', 'lst.append(4)', '在末尾追加一个元素'],
                ['lst.extend(it)', 'lst.extend([4, 5])', '把另一个可迭代对象的元素逐个追加'],
                ['lst.insert(i, x)', 'lst.insert(0, "a")', '在下标 i 处插入 x'],
                ['lst.remove(x)', 'lst.remove(3)', '删除第一个等于 x 的元素，没有则报 ValueError'],
                ['lst.pop(i)', 'lst.pop() / lst.pop(0)', '弹出并返回下标 i 的元素（默认最后一个）'],
                ['lst.clear()', 'lst.clear()', '清空列表'],
                ['del lst[i]', 'del lst[1:3]', '按切片删除（del 语句，不是方法）']
              ]
            }
          },
          {
            text: '查找、统计与排序：',
            table: {
              headers: ['方法 / 函数', '示例', '说明'],
              rows: [
                ['lst.index(x)', 'lst.index(3)', '返回 x 的下标，找不到抛 ValueError'],
                ['lst.count(x)', 'lst.count(3)', '统计出现次数'],
                ['x in lst', '3 in lst → True', '成员判断（比 index 更适合只判断有无）'],
                ['lst.sort()', 'lst.sort(reverse=True)', '原位排序；key= 指定比较依据，如 key=len'],
                ['sorted(lst)', 'sorted(lst, key=str.lower)', '返回排序后的新列表，原列表不动'],
                ['lst.reverse()', 'lst.reverse()', '原地反转；重新排序用 lst[::-1] 拿新列表'],
                ['lst.copy()', 'b = lst.copy()', '浅拷贝（b 与 lst 是两份独立列表）'],
                ['len / sum / min / max', 'sum(lst), max(lst)', '内置函数：长度、求和、极值（数值序列）']
              ]
            }
          },
          {
            text: '元组的方法只有两个：`t.count(x)` 统计出现次数、`t.index(x)` 返回下标。元组不可变，但可以整体解包 `a, b = t`、用 `tuple(lst)` / `list(t)` 与列表互转；单元素元组要写 `(x,)`（逗号不能省）。'
          },
          {
            text: '切片写法 `seq[start:stop:step]`：`lst[1:3]` 取下标 1、2；`lst[:3]` 前三个；`lst[-2:]` 最后两个；`lst[::2]` 隔一个取一个；`lst[::-1]` 反转。切片返回新序列，越界不报错（自动截断）。'
          }
        ]
      }
    },
    {
      id: 'ref_dict_methods',
      title: '字典方法',
      stage: 'Python 参考手册 > 字典方法',
      kind: 'reference',
      summary: '字典取值、遍历、合并与删除的常用方法与安全写法。',
      content: {
        overview: '字典（dict）是键值对集合，键必须可哈希（数字、字符串、元组；列表不行）。取不存在的键会抛 KeyError，遍历时的顺序与插入顺序一致（3.7+）。下表里的 d 指任意字典。',
        sections: [
          {
            text: '取值与安全访问：',
            table: {
              headers: ['方法 / 写法', '示例', '说明'],
              rows: [
                ['d[key]', 'd["name"]', '按键取值，键不存在抛 KeyError'],
                ['d.get(key)', 'd.get("age", 0)', '取值，不存在返回 None（或指定的默认值）'],
                ['key in d', '"age" in d → True', '判断键是否存在'],
                ['d.setdefault(k, v)', 'd.setdefault("tags", [])', '键存在就返回其值；不存在先写入 v 再返回'],
                ['d.keys()', 'list(d.keys())', '所有键的视图（可直接遍历，也能转列表）'],
                ['d.values()', 'sum(d.values())', '所有值的视图'],
                ['d.items()', 'for k, v in d.items():', '键值对视图，遍历字典的标准写法']
              ]
            }
          },
          {
            text: '增删改与合并：',
            table: {
              headers: ['方法 / 写法', '示例', '说明'],
              rows: [
                ['d[k] = v', 'd["age"] = 18', '新增或覆盖键值'],
                ['d.update(other)', 'd.update({"a": 1})', '把另一个字典（或键值对序列）并入，同键覆盖'],
                ['d.pop(key)', 'd.pop("age", None)', '弹出并返回该键的值；给默认值可避免 KeyError'],
                ['d.popitem()', 'd.popitem()', '弹出最后一个插入的键值对（3.7+ 后进先出）'],
                ['del d[key]', 'del d["age"]', '按键删除，不存在抛 KeyError'],
                ['d.clear()', 'd.clear()', '清空字典'],
                ['d.copy()', 'b = d.copy()', '浅拷贝（内层对象仍是同一个）'],
                ['{**d1, **d2}', 'merged = {**d1, **d2}', '合并成新字典（不修改原字典）；3.9+ 也可写 d1 | d2'],
                ['dict.fromkeys(it, v)', 'dict.fromkeys("ab", 0)', '用序列做键批量建字典，值默认为 None']
              ]
            }
          },
          {
            text: '嵌套取值链：`data.get("user", {}).get("name", "")` —— 对可能缺字段的接口数据，逐层 get 比层层判断更简洁。需要修改嵌套结构时要先取出再改，直接对 `d.get(k)` 的结果赋值不会写回字典。'
          }
        ]
      }
    },
    {
      id: 'ref_set_methods',
      title: '集合方法',
      stage: 'Python 参考手册 > 集合方法',
      kind: 'reference',
      summary: '去重、交并差与子集判断：集合方法和对应的运算符写法。',
      content: {
        overview: '集合（set）是一组无序、不重复的元素，适合去重和集合运算；要判断「有没有」比列表快得多。元素必须可哈希。表里的 s 指任意集合，每个方法都有对应的运算符写法。',
        sections: [
          {
            text: '增删：',
            table: {
              headers: ['方法', '示例', '说明'],
              rows: [
                ['s.add(x)', 's.add(3)', '添加一个元素'],
                ['s.update(it)', 's.update([4, 5])', '批量添加可迭代对象里的元素'],
                ['s.discard(x)', 's.discard(3)', '删除元素，不存在也不报错（推荐）'],
                ['s.remove(x)', 's.remove(3)', '删除元素，不存在抛 KeyError'],
                ['s.pop()', 's.pop()', '随机弹出一个元素（集合无序，别依赖具体是哪个）'],
                ['s.clear()', 's.clear()', '清空集合']
              ]
            }
          },
          {
            text: '集合运算（方法与运算符等价）：',
            table: {
              headers: ['方法', '运算符', '说明'],
              rows: [
                ['s.union(t)', 's | t', '并集：两边的元素合在一起'],
                ['s.intersection(t)', 's & t', '交集：两边都有的元素'],
                ['s.difference(t)', 's - t', '差集：在 s 里但不在 t 里'],
                ['s.symmetric_difference(t)', 's ^ t', '对称差：只在其中一边出现的元素'],
                ['s.issubset(t)', 's <= t', 's 是不是 t 的子集'],
                ['s.issuperset(t)', 's >= t', 's 是不是 t 的超集（包含 t 全部元素）'],
                ['s.isdisjoint(t)', '—', '两边有没有交集（无交集为 True）'],
                ['s.update(t) / intersection_update 等', 's |= t 等', '带 _update 后缀的是「原位更新」版本，直接改 s']
              ]
            }
          },
          {
            text: '常见用法：去重 `set(lst)`（顺序会变，要保序用 `dict.fromkeys(lst)`）；快速判断交集 `if set(a) & set(b):`；集合推导式 `{x * 2 for x in range(5)}`。不可变版本是 `frozenset`，可以当字典的键。'
          }
        ]
      }
    }
  ]
};
