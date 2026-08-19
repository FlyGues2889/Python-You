<center>

# Python You <br> 轻量级 Python IDE & 交互学习平台

</center>

- 基于 WebAssembly (Pyodide) ，下载安装就可拥有完整的 Python 运行环境。
- 为你省去配置环境的时间，同时快速实践 Python 课程内容。

> **网页端已更新** <br>
  您现在可以点击访问在线教程：[GitHub Pages](https://flygues2889.github.io/Python-You/)<br>
  教程目录预览参见：[下方教程预览](#应用内教程章节概览)


### 桌面端屏幕截图
<center>

![屏幕截图1](/docs/screenshoot1.png "屏幕截图")

</center>

### 网页端屏幕截图
<center>

![网页端](/docs/screenshoot2.png "网页端")

</center>

## 零门槛
- **📦 下载即用**：免于安装，点开软件既可马上开始使用。
- **⚙️ 无需下载 Python 和配置环境**：将 CPython 3.11 编译为 WebAssembly，
实现客户端本地运行。无需安装 CPython、pip 或系统环境变量。
- **🗂️ 版本与包管理器**：自动检测和选择本机 Python 解释器版本，
可安装任意 pip 包，保持零配置体验。
- **😎 快速入门**：教程页面基础易懂，马上就可以上手


## 教程和 IDE 深度绑定
- **🧑‍🎓 系统化 Python 课程**：涵盖基础语法、容器数据结构、控制流、函数与面向对象、标准库/文件 I/O、数据可视化等 6 大阶段，另附 Python 参考手册速查。<br>

<center>

![教程](/docs/screenshoot3.png "教程")

</center>


- **⏩ 代码一键导入 IDE**：教程中的代码片段可一键导入至编辑器中实时运行并检验效果。
- **🏅 课后测验**：大部分教程小节配有课后测验，题型包含**选择题**与**代码题**。

<br><br>

## 应用内教程章节概览

| 阶段 | 核心知识点 |
| :--- | :--- |
| **Python 教程** |环境与入门、语法与注释、变量与内存绑定、数据类型、数字与类型转换、字符串与切片、布尔值与运算符 |
| **Python 容器** | 列表 List、元组 Tuple、集合 Set、字典 Dict 及其推导式 |
| **Python 控制流** | 条件分支 if-else、while/for 循环、输入输出与 f-string 格式化 |
| **Python 函数与对象** | 函数与参数、Lambda 表达式、类与继承、多态、生成器与 LEGB 作用域 |
| **Python 标准库** | 模块导入、datetime、math、json、正则表达式、pip 包管理、异常处理与文件读写 |
| **Python 数据可视化** | Matplotlib 2D 绘图、折线图、散点图与自定义图表样式 |
| **Python 参考手册** | Python 命令行参数、内置 API 速查表、python -m 实用模块 |

---

## 本地开发与构建
项目采用 tauri2.0 + vite + vue 构建。

### 安装依赖

```bash
pnpm install
```

### 启动vite服务器并构建生产产物

```bash
pnpm run dev

pnpm run build
```

### 使用 Tauri 启动

```bash
pnpm run tauri dev
```

### 构建 Tauri 应用

```bash
pnpm run tauri build
```

---

## 开源许可
[MIT License](./LICENSE)
