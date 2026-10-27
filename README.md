<center>

# Python You <br> 轻量级 Python IDE & 交互学习平台

</center>

![屏幕截图1](/docs/screenshoot1.png "屏幕截图")

- 基于 WebAssembly (Pyodide) ，下载安装就可拥有完整的 Python 运行环境。
- 也可以直接调用本机已安装的 Python，省去在 IDE 与终端之间来回切换。
- 为你省去配置环境的时间，同时快速实践 Python 课程内容。



### 在网页端尝试教程
在这里快速访问 **网页端（在线教程）**：[GitHub Pages](https://flygues2889.github.io/Python-You/)<br>

<center>

![网页端](/docs/screenshoot2.png "网页端")

</center>

## 零门槛

- **📦 下载即用**：免于安装，点开软件既可马上开始使用。
- **⚙️ 无需下载 Python 和配置环境**：内置 Pyodide（CPython 编译为 WebAssembly），下载第三方包即可在本地运行，无需安装 CPython、pip 或配置系统环境变量。
- **🗂️ 版本与包管理器**：自动检测并选择本机 Python 解释器（支持手动添加解释器），扩展包页面可搜索、安装、卸载 pip 包，也能从本地 `.whl` / sdist 安装。
- **🧯 三级引擎降级**：本机 Python → Pyodide → 演示模式，任何环境下都能跑通课程代码。
- **😎 快速入门**：打开即是学习首页，选一个系列就能开始读文章、做测验。

## 教程和 IDE 深度绑定

- **👩‍🎓 五个系列、15 个阶段、114 个主题**：Python 教程（7 阶段，含参考手册）之外，还有数据库、爬虫和数据分析、Web、自动化四个系列。

- **⏩ 代码一键导入 IDE**：教程中的代码片段可一键导入编辑器实时运行并检验效果。

<center>

![教程](/docs/screenshoot3.png "教程")

</center>

- **🏅 课后测验 75 组（283 题）**：单选、多选、填空、排序、代码五种题型；页内作答即时判分并给出解析，代码题比对运行输出（支持严格行序列、多组可接受答案、包含匹配与正则匹配）。

## 应用内教程

| 系列 | 阶段 | 主题 | 内容 |
| :--- | :--- | :--- | :--- |
| **Python教程** | 7 | 71 | 入门与环境、语法与注释、变量、数据类型、数字与类型转换、字符串、布尔与运算符、列表/元组/集合/字典、条件与循环、函数与 Lambda、类与继承、模块与标准库、日期/JSON/正则/pip、异常与文件读写、Matplotlib 数据可视化、参考手册速查 |
| **数据库** | 2 | 10 | SQLite 入门、建表与增删改查、参数化查询与事务、排序聚合、常用 SQL 速查 |
| **爬虫和数据分析** | 2 | 11 | pandas 的 Series/DataFrame、筛选与分组聚合、CSV 读写；HTTP 请求、HTML 解析、数据提取与爬虫合规 |
| **Web** | 2 | 11 | Web 与 HTTP 基础、URL 与状态码、请求头、JSON 与 REST API、用 Python 调用接口、HTTP 速查表 |
| **自动化** | 2 | 11 | pathlib 与文件批量处理、CSV 批处理、计时与定时任务、日志、文件复制移动、自动汇总脚本 |

## 编辑与运行

- **编辑器**：多标签、语法高亮、词法级代码补全、查找/替换、格式化（输入时自动补空格 + 工具栏一键格式化，`Shift+Alt+F`，仅 `.py`；格式化会按语法树重排缩进，多一个空格、少一个空格、错位的 `else` 都能修正）、括号/引号自动配对、中文标点与括号配对错误提示（仅 `.py`）、行号点选整行。
- **输出终端**：脚本输出与程序输入都在这一个面板（本机引擎走子进程 stdin，Pyodide 通过输入行回传）；matplotlib 图表直接显示在终端里、可点开放大，中文不会变方框。
- **交互终端（REPL）**：持久会话、命令历史、可选中复制；画图同样会出图。
- **工作区**：文件树增删改查、外部改动同步、保存前冲突检测、导出到「下载」。

## 版本与更新

- 应用内置检查更新，有新版本会弹出说明并可直接下载替换。

## 扩展插件

应用支持通过插件扩展功能，类似于 VSCode 扩展。插件以 JSON 文件形式导入，可提供自定义教程系列、导航栏面板、主题、代码片段、全局样式等扩展内容。

### 安装与管理

1. 将插件文件夹放入工作区 `plugins/` 目录（工作区初始化时自动创建该目录）。
2. 打开 **设置 → 通用设置 → 插件管理**，点击「管理插件」按钮打开弹窗。
3. 点击「扫描插件」，自动读取 `plugins/` 下每个子文件夹中的 `plugin.json` 并注册。
4. 已安装插件可通过开关启用/禁用，或点击删除按钮从列表移除（不删除文件夹，需手动清理）。

### 插件清单格式

插件是一个文件夹，根目录须包含 `plugin.json` 清单文件：

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名称",
  "icon": "school",
  "tutorials": [],
  "contributes": {
    "panels": [],
    "themes": [],
    "snippets": [],
    "commands": [],
    "css": "",
    "cssFile": "",
    "scripts": []
  }
}
```

| 字段 | 必填 | 说明 |
| :--- | :---: | :--- |
| `id` | 是 | 插件唯一标识，重复导入会覆盖旧版本 |
| `name` | 是 | 插件显示名称 |
| `version` | 是 | 插件版本号 |
| `description` | 是 | 插件描述 |
| `author` | 否 | 作者 |
| `icon` | 否 | 图标名（Material Symbols），默认 `extension` |
| `tutorials` | 否 | 教程系列数组，格式同内置 `TutorialSeries` |
| `contributes` | 否 | 扩展点声明，见下文 |
### 扩展点

#### 教程系列（`tutorials`）

插件通过 `tutorials` 字段注入自定义教程，启用后会在学习首页与内置系列并列显示。每个教程系列的结构与内置教程一致：

```json
{
  "id": "ml-basics",
  "title": "机器学习入门",
  "icon": "model_training",
  "summary": "从零开始了解机器学习基础概念。",
  "stages": [
    {
      "id": "stage-1",
      "title": "基础概念",
      "topics": [
        {
          "id": "what-is-ml",
          "title": "什么是机器学习",
          "stage": "基础概念",
          "summary": "了解机器学习的定义与分类。",
          "content": {
            "overview": "机器学习是……",
            "sections": [
              {
                "heading": "监督学习",
                "text": "监督学习使用标注数据训练模型。",
                "code": "from sklearn import linear_model"
              }
            ],
            "takeaways": ["机器学习分为监督学习和无监督学习"]
          }
        }
      ]
    }
  ]
}
```

#### 导航栏面板（`contributes.panels`）

在左侧导航栏添加自定义面板，点击切换到插件提供的 HTML 内容页面：

```json
"contributes": {
  "panels": [
    {
      "id": "dashboard",
      "title": "仪表盘",
      "icon": "dashboard",
      "html": "<h1>我的仪表盘</h1><p>这里是自定义内容。</p>"
    }
  ]
}
```

| 字段 | 必填 | 说明 |
| :--- | :---: | :--- |
| `id` | 是 | 面板唯一标识 |
| `title` | 是 | 导航栏显示名称 |
| `icon` | 否 | Material Symbols 图标名，默认 `extension` |
| `html` | 否 | 面板内容（HTML 字符串，支持 h1/h2/h3/a/code/pre 等标签） |

#### 主题（`contributes.themes`）

提供自定义主题，通过覆盖 CSS 变量改变应用外观。用户可在 **设置 → 通用设置 → 插件主题** 中选择：

```json
"contributes": {
  "themes": [
    {
      "id": "ocean",
      "name": "海洋蓝",
      "colors": {
        "--primary": "#006994",
        "--bg-color": "#0a1929",
        "--surface-color": "#102a43"
      }
    }
  ]
}
```

`colors` 中的键为 CSS 变量名，值为任意合法 CSS 颜色。可覆盖的常用变量包括：`--primary`、`--bg-color`、`--surface-color`、`--text-color`、`--text-secondary`、`--text-tertiary` 等。

#### 代码片段（`contributes.snippets`）

提供代码模板，供编辑器补全使用（预留接口）：

```json
"contributes": {
  "snippets": [
    {
      "label": "for循环",
      "body": "for i in range(${1:n}):\n    ${2:pass}",
      "description": "标准 for 循环"
    }
  ]
}
```

#### 命令（`contributes.commands`）

注册自定义命令（预留接口，后续可通过命令面板触发）：

```json
"contributes": {
  "commands": [
    {
      "id": "run-analysis",
      "title": "运行分析",
      "icon": "analytics"
    }
  ]
}
```

#### 全局样式注入（`contributes.css`）

注入全局 CSS，可自定义任意界面元素的外观：

```json
"contributes": {
  "css": "/* 把主标题改成红色 */\n.windows-title-bar { background-color: #d32f2f !important; }"
}
```

#### 外部样式文件（`contributes.cssFile`）

指定插件目录内的一个 CSS 文件，启动时读取其内容并注入全局样式（效果同 `css`，适合样式较多的插件）：

```json
"contributes": {
  "cssFile": "theme.css"
}
```

#### 插件脚本（`contributes.scripts`）

指定插件目录内的 JS 文件（ES Module），启用插件时动态加载并执行。脚本需导出 `activate(host)` 函数，`host.onCleanup(fn)` 用于注册插件停用/卸载时的清理逻辑；`activate` 返回函数时也会被当作清理函数：

```js
export function activate(host) {
  // 插件启动逻辑，例如创建 canvas、监听事件、注入样式
  host.onCleanup(() => {
    // 清理：移除监听、释放资源
  });
}
```

```json
"contributes": {
  "scripts": ["glass.js"]
}
```

脚本通过 Blob URL 加载，Tauri CSP 需允许 `blob:`（`script-src` 与 `worker-src`）；脚本内如需加载图片资源，`img-src` 需允许 `data:` / `blob:`。

### 完整示例

```json
{
  "id": "super-pack",
  "name": "超级扩展包",
  "version": "1.0.0",
  "description": "教程 + 面板 + 主题 + 样式一站式扩展",
  "author": "Python You",
  "icon": "rocket_launch",
  "tutorials": [],
  "contributes": {
    "panels": [
      {
        "id": "welcome",
        "title": "欢迎",
        "icon": "waving_hand",
        "html": "<h1>欢迎使用超级扩展包</h1><p>点击左侧导航继续学习。</p>"
      }
    ],
    "themes": [
      {
        "id": "forest",
        "name": "森林绿",
        "colors": {
          "--primary": "#2e7d32",
          "--bg-color": "#1b2818"
        }
      }
    ],
    "css": "/* 自定义样式 */\n.nav-rail-settings { font-weight: bold; }"
  }
}
```

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
