# Python You · Material 3 设计规范符合性问题清单

> 审查日期:2026-08-30(初审)/ 2026-09-27(复审)
> 审查范围:全部 Vue 组件(19 个)、全局样式(theme/m3eStyle/index/font)、主题 token 体系
> 对照基准:M3 官方 token(md.comp.\*/md.sys.\*)+ @m3e/web 组件默认值
>
> **严重度分级**:🔴 P1 直接违背规范(优先修复)→ 🟠 P2 中等偏离 → 🟡 P3 轻微问题 → ⚪ 非 M3 质量问题
>
> **2026-09-27 复审**:多系列教程与阅读区改版后重新过了一遍。新增/变更见下方「本轮变更」;P2、P3 各条的现状一并在条内标注,行号以代码为准。
> **2026-09-27 技能复审**:按 M3 Expressive 官方 token 又过了一遍,新增第 4 章(动效 / 字体 / 形状 / 组件几何 / 色彩 / 战术机会)。与前面条目重复的不再复述。
> **2026-09-27 技术债清理**:第 4 章可机械修正的项已全部落地(动效曲线、字重、圆角、描边、FAB、禁用容器、对比度、列表行形状),另清掉一批死代码 —— 各条状态见条内标注;保留未改的都写明了理由。

---

## 🔴 P1 主要问题(直接违背规范)

> **状态:✅ 已全部修复(2026-08-30)**
> - 1-1:全局卡片圆角 28px→12px([src/assets/m3eStyle.css](src/assets/m3eStyle.css)),移除 Settings/PackageManager 的 20px 覆盖,题目卡片 16px→12px
> - 1-2:树/列表行胶囊 9999px→8px,选中态改 `secondary-container` 填充 + `on-secondary-container` 文字(FileTreeNode/FileTree/TutorialTree/QuizDirectory)。**2026-09-27 最终回到官方做法**:选中项 = `secondary-container` 填充 + `on-secondary-container` 文字,形状按 List 令牌(未选中 CornerExtraSmall 4px / 选中 CornerLarge 16px)。中途试过「描边 + 底色不变」,确认 M3 的选中表达只有填充一种(填充=选中、描边=未选中/聚焦)后改回
> - 1-3:Quiz 正确态与 REPL/终端日志色改为随主题/代码主题自适应的 token 与深浅两档映射,浅色主题对比度 ≥4.5:1
> - 1-4:所有可点击 div 补 `role="button"` + `tabindex="0"` + Enter/Space 激活(FileTreeNode/TutorialTree/QuizDirectory/CodeEditor),新增 `[role="button"]:focus-visible` 焦点指示

### 1-1 卡片圆角全局超规:28px / 20px / 16px(M3: 12dp)

| 位置 | 实际值 |
|---|---|
| [src/assets/m3eStyle.css:35](src/assets/m3eStyle.css#L35) 全局 `m3e-card` | **28px** (extra-large) |
| [src/components/SettingsView.vue:322](src/components/SettingsView.vue#L322)、[src/components/PackageManager.vue:289](src/components/PackageManager.vue#L289) | 20px |
| [src/components/tutor/QuizView.vue:337](src/components/tutor/QuizView.vue#L337) `.quiz-question-card` | 16px |

**From M3:** Filled/Outlined/Elevated Card 容器形状 = **CornerMedium 12dp**(component-tokens.md;指南图像数据)。技能明示的错误:"Large or full corners on information-dense components like cards — They clip content. Use a smaller step." 这些卡片承载列表、选项、输入控件,28dp 已是规范值的 2.3 倍。

### 1-2 列表/树行用全圆角胶囊 + 描边选中态(非 M3 列表形态)

- [src/components/FileTreeNode.vue:298](src/components/FileTreeNode.vue#L298)、[src/components/FileTreeNode.vue:313-319](src/components/FileTreeNode.vue#L313-L319):`.tree-node-item` 9999px 胶囊,选中态透明底 + 1px secondary 描边
- [src/components/tutor/TutorialTree.vue:461-483](src/components/tutor/TutorialTree.vue#L461-L483):`.topic-item` 同款

**From M3:** List 项容器形状 = CornerNone(0dp),Expressive 版 = **CornerExtraSmall(4dp)**;选中项容器 = **secondary-container 填充**(component-tokens.md List 段)。

> **2026-09-27 决策**:采纳规范原样 —— 选中项填 `secondary-container`、文字/图标用 `on-secondary-container`,形状用 List 令牌的未选中 4px / 选中 CornerLarge 16px。中途试过「描边 + 底色不变」(边界色 `primary`),但 M3 里描边表达的是「未选中 / 聚焦」(`outline` 才是边界角色),列表选中只有填充一种做法,故改回。

### 1-3 固定语义色不随主题自适应,浅/深主题存在对比度不达标

- [src/components/tutor/QuizView.vue:378-385](src/components/tutor/QuizView.vue#L378-L385)、[src/components/tutor/QuizView.vue:432-442](src/components/tutor/QuizView.vue#L432-L442):`.chip-pass`/`.is-correct` 固定 `#2e7d32`/`#1b5e20` — **深色模式下 #1b5e20 文字落在深色 surface 上远低于 4.5:1**
- [src/components/REPLConsole.vue:352-364](src/components/REPLConsole.vue#L352-L364):`.log-input #ffd54f`、`.log-stdout #81c784` — 浅色代码主题下 #81c784 在白底约 **2.5:1**
- [src/components/TerminalPanel.vue:203-217](src/components/TerminalPanel.vue#L203-L217):`.log-system #3b82f6`、`.log-warning #f59e0b` — 白底下 #f59e0b 约 **2:1**
- [src/assets/theme.css:152](src/assets/theme.css#L152)/[src/assets/theme.css:328](src/assets/theme.css#L328):`--success` 固定品牌绿

**From M3:** 对比度 4.5:1(小字);角色色按主题自动适配。技能明示的错误:"Fixed accent colors where contrast matters — They don't adapt to theme. Use primary/secondary/tertiary." 正确做法:日志色走主题 token(如 `on-surface-variant` + 语义后缀),或随代码主题定义 8 套颜色映射而非固定 3 个值。

### 1-4 可点击 div 无键盘可达性(违反 M3 交互规范)

- [src/components/FileTreeNode.vue:118](src/components/FileTreeNode.vue#L118) `.tree-node-item`
- [src/components/tutor/TutorialTree.vue:178](src/components/tutor/TutorialTree.vue#L178)、[src/components/tutor/TutorialTree.vue:213](src/components/tutor/TutorialTree.vue#L213)、[src/components/tutor/TutorialTree.vue:190](src/components/tutor/TutorialTree.vue#L190) stage/subcat/topic 行
- [src/components/tutor/QuizDirectory.vue:67-73](src/components/tutor/QuizDirectory.vue#L67-L73) `.dir-topic-row`
- [src/components/CodeEditor.vue:1074](src/components/CodeEditor.vue#L1074) `.editor-tab-item`

均为 `div @click`,无 `role`/`tabindex`/键盘处理。M3 交互要求所有可操作元素键盘可达(方向键导航、Enter 激活)。

---

## 🔵 本轮变更(2026-09-27 复审)

**已修**

- **阅读区四页统一**([TutorialContent.vue:437](src/components/tutor/TutorialContent.vue#L437)、[LearningHome.vue:129](src/components/tutor/LearningHome.vue#L129)、[QuizView.vue:425](src/components/tutor/QuizView.vue#L425)、[QuizDirectory.vue:127](src/components/tutor/QuizDirectory.vue#L127)):学习首页/文章正文/测验答题/测验目录的 content-pane 统一为 `--bg-color` + **16px(CornerLarge,在刻度上)** + 12px 外边距。此前三处 10px、一处 1rem 且底色分两派,切页跳色跳圆角
- **卡片底色统一 `--bg-color`**([m3eStyle.css:39](src/assets/m3eStyle.css#L39)),落在浅色纸面上的卡片反取 `--surface-color`([QuizView.vue:515](src/components/tutor/QuizView.vue#L515)、[LearningHome.vue:187](src/components/tutor/LearningHome.vue#L187))。方向与 M3 色调制一致:浅色下 surface-0 最亮、层级越高越深,纸面(最亮)上的卡片取 surface-1 正确
- **测验选项控件换组件库控件**:单选/多选改用 `m3e-radio` / `m3e-checkbox`([QuizView.vue:301](src/components/tutor/QuizView.vue#L301)、[QuizView.vue:317](src/components/tutor/QuizView.vue#L317)),容器收到 24px 以匹配行高,不再自绘
- **标题栏高度收敛为单一来源**:`--titlebar-height`([App.vue:2197](src/App.vue#L2197))→ 标题栏([App.vue:2229](src/App.vue#L2229))、窗口控制按钮层([App.vue:2259](src/App.vue#L2259))、工作区高度([App.vue:2411](src/App.vue#L2411))三处引用同一变量。此前 v0.3.52 把标题栏改成 32px 而另两处仍是 36px,导致控制层固定盒子溢出标题栏压住正文、工作区比窗口少 4px 在底部留缝
- **正文目录面板高度上限按可视高度算**([TutorialContent.vue:776](src/components/tutor/TutorialContent.vue#L776)):`calc(100vh - 48px)` → `calc(100vh - var(--titlebar-height) - 48px)`,目录条目多时不再伸出滚动容器

**技术债清理(死代码与遗留缺陷)**

- **侧栏展开状态写死了 Python 的阶段 id**(多系列迁移遗留):`expandedStages` 里是 `stage1/stage2/cmd_help`,而数据库/爬虫/Web/自动化 系列的阶段 id 是 `db_stage1`/`sp_stage1`/… → 进任何非 Python 系列都是**全折叠**;同表的 `cli_sub/modules_sub/builtins_sub/keywords_sub` 已经是死 id。改为按系列计算:前两个阶段 + 整段都是参考手册的阶段默认展开,子分类默认展开,用户折叠过的记在 `collapsedStages/collapsedSubs` 里([TutorialTree.vue](src/components/tutor/TutorialTree.vue))
- **死代码**:`--focus-overlay`(浅/深各一份,零引用)、i18n `backToTutorial`(与 `returnToTutorial` 重复且零引用)、`--text-size-m`(改用 M3 图标尺寸后零引用)、21 个零引用的主题别名 token(`--surface-0/1/3/4/5`、`--surface-tint`、`--surface-container-lowest`、`--background`、`--shadow-rgb`、`--on-background`、`--on-inverse-surface`、`--primary-hover`、`--accent-{indigo,amber,emerald,rose}-{bg,text,border}` 里未用到的那几个,共 42 行声明)

**新发现的坑(供后续复用)**

- **`--md-sys-density-scale` 会继承进子组件**:`density-3` 加在 `m3e-tabs` 上,会把页签面板里 32px 的 extra-small 按钮压成 20px、图标塞不下([PackageManager.vue:544](src/components/PackageManager.vue#L544) 的注释)。凡把 `density-*` 加在容器上,都要检查面板/子区是否需要重置回 0。全项目 `density-3` 目前只用于面包屑与页签条
- **焦点轮廓不要在全局加**:曾用 `button:focus-visible` + `[role="button"]:focus-visible` 两条全局描边补焦点指示,结果 m3e 组件(在 host 上设 `role="button"` 的有 card / breadcrumb / bottom-sheet 等)自绘焦点环之外又被套了一圈 → Tab 导航时双描边。现只给自绘的侧栏菜单行加,其余交给组件自身或浏览器默认环

---

## 🟠 P2 中等偏离

| # | 问题 | 实际 | From M3 |
|---|---|---|---|
| 2-1 | 搜索栏全局压到 40px 高 [src/assets/m3eStyle.css:8-14](src/assets/m3eStyle.css#L8-L14) | 40px(clear 按钮 32px/18px) | SearchBar **56dp** 高,清除按钮 40dp/24dp |
| 2-2 | 无 M3 工具栏高度:标题栏 36px [src/App.vue:2197](src/App.vue#L2197)、编辑器工具栏 34px [src/App.vue:2723](src/App.vue#L2723)、REPL 头 42px [src/components/REPLConsole.vue:295](src/components/REPLConsole.vue#L295)、终端头 32px [src/components/TerminalPanel.vue:128](src/components/TerminalPanel.vue#L128) | 32–42px,四者互不一致 | AppBarSmall/DockedToolbar **64dp** |
| 2-3 ✅已修 | 图标按钮几乎全用 extra-small(32dp)+ 自定义 iconButton 尺寸不合规格 [src/components/selfComponents/iconButton.vue:81-116](src/components/selfComponents/iconButton.vue#L81-L116) | SM 20px / S 32px+16px 图标 / M 40px+19.2px 图标 | XSmall 32dp·20dp 图标 / Small **40dp·24dp** / Medium 56dp·24dp;19.2px 不在 M3 字号刻度 |
| 2-4 | LoadingModal 不透明 surface 全屏遮罩 [src/components/selfComponents/loadingModal.vue:28](src/components/selfComponents/loadingModal.vue#L28) | 100% 不透明 | Scrim = onSurface **32% 透明度** |
| 2-5 | 菜单项密度 -2、行高 36px [src/assets/m3eStyle.css:19-22](src/assets/m3eStyle.css#L19-L22) | 36px | Menu item **48dp** 高 |
| 2-6 ✅已修 | 定位 FAB 覆盖尺寸 [src/components/tutor/TutorialTree.vue:784-791](src/components/tutor/TutorialTree.vue#L784-L791) | 48px 高、16px 图标 | FabSmall **40dp / 24dp 图标** |
| 2-7 ✅已修 | 禁用按钮容器置空 [src/assets/m3eStyle.css:62-64](src/assets/m3eStyle.css#L62-L64) | `--m3e-button-disabled-container-color: none` | 禁用容器 = onSurface **12%** 透明度 |
| 2-8 ✅已修(收窄) | 焦点指示改为**逐组件**:只有自绘的侧栏菜单行([TutorialTree.vue](src/components/tutor/TutorialTree.vue) 的 `.topic-item` / `.stage-header-item` / `.subcat-header-item`)加 2px 主题色描边;自绘且 `outline: none` 的 [iconButton.vue](src/components/selfComponents/iconButton.vue) 改用 M3 焦点 state layer(10% 不透明度)。**不再全局给 `button` / `[role="button"]` 加描边**:m3e 的 card / breadcrumb / bottom-sheet 等会在自己 host 上设 `role="button"` 并自绘焦点环,全局再套一圈就是双描边 | 焦点指示需覆盖全部可交互元素且用主题色 |

---

## 🟡 P3 轻微问题

- **3-1 ✅已修**:离刻度圆角清零 —— 12px(主面板:PackageManager / SettingsView / CodeEditor / REPL)、8px(REPL 主体与终端日志面板统一,原 6px vs 16px)、4px(行内代码、行号,原 5px / 2px)。原记录:10px 剩两处主面板 [src/components/PackageManager.vue:500](src/components/PackageManager.vue#L500)、[src/components/SettingsView.vue:327](src/components/SettingsView.vue#L327)、REPL 主卡片 [src/components/REPLConsole.vue:307](src/components/REPLConsole.vue#L307) 一带;6px(REPL body [src/components/REPLConsole.vue:320](src/components/REPLConsole.vue#L320)、标题栏按钮 [src/App.vue:2015](src/App.vue#L2015)、hover 提示 [src/components/CodeEditor.vue:1605](src/components/CodeEditor.vue#L1605)) — 均不在 M3 十级刻度(0/4/8/12/16/20/28/32/48/full)。**教程阅读区四处(学习首页/文章/测验答题/测验目录)已统一为 16px,在刻度上**;仍矛盾的是同款"终端显示体":REPL 6px vs 终端面板 16px [src/components/TerminalPanel.vue:155](src/components/TerminalPanel.vue#L155)
- **3-2 ⏸保留**(密集布局取舍):应用自有一套 `--text-size-*` 刻度(14.4 / 19.2 / 25.6px 不在 M3 十五级里),换成 12/14/16/22 会改动全项目字号与图标尺寸,属设计决策而非缺陷;已删掉其中零引用的 `--text-size-m`。原记录:`--text-size-sm 14.4px`、`--text-size-m 19.2px` [src/assets/font.css:12-16](src/assets/font.css#L12-L16)、dialog 标题 20px [src/App.vue:2313](src/App.vue#L2313)(M3 dialog 标题 = headline-small 24sp)、dialog 正文 15px(在 body 14/16 之间)
- **3-3 ✅已修**:Nunito 是可变字体,`@font-face` 改为 `font-weight: 200 1000` 区间声明,800 现在取真实字重实例,不再合成加粗。原记录:Nunito 仅注册 400/700 [src/assets/font.css:72-84](src/assets/font.css#L72-L84),但 `.article-title`/`.quiz-topic-title`/`.dir-title` 用 **800**([src/components/tutor/TutorialContent.vue:462](src/components/tutor/TutorialContent.vue#L462)、[src/components/tutor/QuizView.vue:303](src/components/tutor/QuizView.vue#L303)、[src/components/tutor/QuizDirectory.vue:130](src/components/tutor/QuizDirectory.vue#L130)) → 浏览器合成加粗,字形质量下降
- **3-5 ✅已修**:删掉 `button { font-family: var(--font-headings) !important }`,按钮标签改回 Plain 槽(body 的 --font-sans);组件库本就没写 font-family,行为一致。原记录: [src/assets/index.css:56-63](src/assets/index.css#L56-L63):M3 按钮标签用 label-large = Plain 字体槽
- **3-6 ⏸保留**:4dp / 56dp 的输入框放进 32–36px 的工具条会撑高整条工具栏,密集布局下按「鼠标键盘为主可压缩」处理。原记录::8px 圆角 + 34px 高 [src/App.vue:2432-2444](src/App.vue#L2432-L2444)、[src/components/FileTreeNode.vue:356-377](src/components/FileTreeNode.vue#L356-L377) — OutlinedTextField 应为 **4dp 圆角、56dp 高**
- **3-7 ⏸保留(重新判读)**:12px 在 ten-step 刻度上;菜单容器两个官方取值是 baseline Menu 的 CornerExtraSmall(4dp) 与 M3 Expressive VibrantMenu 的 CornerLarge(16dp),12px 落在两者之间,不属离刻度。原记录: [src/components/CodeEditor.vue:1622](src/components/CodeEditor.vue#L1622):菜单类容器应为 CornerExtraSmall **4dp**
- **3-8 部分清理**:应用侧零引用的别名(`--surface-0/1/3/4/5`、`--surface-tint` 等)已删;`--md-sys-color-surface-*` 这批取值本身正确,改名属 churn。原记录: [src/assets/theme.css:113-124](src/assets/theme.css#L113-L124)(取值已是正确色调制,仅命名误导)
- **3-9 ✅已修**:`--m3e-nav-rail-top-space` 1rem → 44px(表内 TopSpace 就是 44dp)。原记录: [src/assets/m3eStyle.css:70-73](src/assets/m3eStyle.css#L70-L73):M3 为 **44dp**
- **3-10 ✅已修**:3000 → 4000ms。原记录: [src/components/tutor/QuizView.vue:248](src/components/tutor/QuizView.vue#L248):M3 短消息 4s(主应用 5000ms ✓)

---

## 🟣 M3 Expressive 复审技能基准,2026-09-27)

> 基准:Material 3 Expressive(2025-05 更新)。数值取自官方 token(`ComponentTokens` / `TypeScaleTokens` / `ShapeTokens` / `ExpressiveMotionTokens`),与前文条目重复的不再复述。
> 结论:**形状与色彩的角色接线基本合规,动效与字体是两块系统性缺口**;Expressive 的七条战术里目前只落地了 containment 与 color 两条。

### 4.1 动效(motion)—— 缺口最大

| # | 现状 | From M3 |
|---|---|---|
| 4-1 ✅已修 | ~~32 条 `transition` 声明没有一条用 M3 曲线~~ → 全项目改走 `--motion-effects*` / `--motion-spatial*`(M3 官方 web 回退曲线),原计数::显式写 `ease` 的 16 条,其余省略即默认 `ease`;另 2 条用 `cubic-bezier(0.4, 0, 0.2, 1)`([TutorialTree.vue:606](src/components/tutor/TutorialTree.vue#L606) 展开动画、[App.vue](src/App.vue) 一带) | 标准曲线 `cubic-bezier(0.2, 0, 0, 1)`;`(0.4, 0, 0.2, 1)` 在官方表里明确标注为 **legacy(M2)**。三个全局变量 [index.css:24-26](src/assets/index.css#L24-L26) `--transition-fast/normal/slow` = 0.15/0.25/0.35s `ease` 是收口曲线最省事的入口(时长本身都在刻度上:150/250/350 = short3 / medium1 / medium3) |
| 4-2 ✅已修 | ~~颜色与背景动效统一 `0.15s ease`~~ → effects 曲线 + 150/200ms | 颜色属 **effects**:web 回退曲线 `cubic-bezier(0.34, 0.80, 0.34, 1.00)` / 200ms,且 effects 弹簧阻尼恒为 1.0 —— **永不过冲** |
| 4-3 ✅已修 | ~~`.toc-slide` 把 opacity 与 transform 绑在同一条~~ → 拆成 effects / spatial 两条; `0.25s ease` 上([TutorialContent.vue:793](src/components/tutor/TutorialContent.vue#L793)) | 必须二分:opacity = effects(上面那条曲线);transform = **spatial**,expressive fast `cubic-bezier(0.42, 1.67, 0.21, 0.90)` / 350ms、default `0.38, 1.21, 0.22, 1.00` / 500ms —— 过冲只给几何属性,给透明度加弹跳会读成故障 |
| 4-4 ✅已修 | ~~`transition: all` 8 处~~ → 全部改为显式属性,原位置:([QuizView.vue:711](src/components/tutor/QuizView.vue#L711)、[TutorialContent.vue:673](src/components/tutor/TutorialContent.vue#L673)、[TutorialTree.vue:606](src/components/tutor/TutorialTree.vue#L606) 等) | 按属性分别声明;`all` 会把未预期属性一起动画(并触发不必要的重排) |
| 4-5 ✅已修 | ~~全项目零 spring~~ → 落地 6 个 M3 动效 token(3 effects + 3 spatial,见 index.css `:root`) | M3 Expressive 用物理弹簧**替代**缓动+时长;web 上能用真弹簧就用,不能就用上表回退曲线。速度按元素大小选:小组件(按钮/开关)用 fast,部分遮屏(展开的导航栏/底部面板)用 default,全屏用 slow |

### 4.2 字体(typography)

| # | 现状 | From M3 |
|---|---|---|
| 4-6 ✅部分修 | ~~标题用 800~~ → 字形已是真实字重(见 4-7);M3 字重上限 Bold,800 属品牌表达,保留但已在注释里写明。原记录::`.article-title` 32px/800、`.quiz-topic-title`、`.dir-title`([TutorialContent.vue:499](src/components/tutor/TutorialContent.vue#L499)、[QuizView.vue:477](src/components/tutor/QuizView.vue#L477)、[QuizDirectory.vue:169](src/components/tutor/QuizDirectory.vue#L169)) | 字重只有 **Regular / Medium / Bold** 三档;Headline large(32sp/40sp/0sp)基线 Regular、**emphasized 变体 = Medium**。800 超出上限,32px 这个字号该用 headline-large 的强调档(Medium),不是 ExtraBold |
| 4-7 ✅已修 | ~~Nunito 按 400/700 单值声明~~ → `font-weight: 200 1000`。原记录:(含 `fvar` 表),但 [font.css:72-84](src/assets/font.css#L72-L84) 只按 400 / 700 两个**单值**声明 | 声明成 `font-weight: 200 1000` 范围即可取到真实字重实例;现在 800 会落到 700 那个面再做合成加粗(工程修法,非 M3 要求) |
| 4-8 ⏸保留(缺字体资源) | 仓库里只有 HarmonyOS Regular/Medium 两个文件,没有真 Bold;删掉 700 槽只会让浏览器合成加粗(中文合成字更糊),所以维持现状。原记录:([font.css:65-70](src/assets/font.css#L65-L70)),两个文件都不是可变字体 | 正文所有 `font-weight: 700`(37 处)与 `600`(33 处)实际渲染为 Medium。M3 label-large = Medium ✓ 歪打正着,但 emphasized label = **Bold**,项目当前取不到真 Bold 实例 |
| 4-9 ⏸保留(同 3-2) | 离刻度字号:13px(30 处,`.stage-title-text`/`.dir-subtitle`/各类标签)、20px(9)、18px(8)、15px(7)、10px(2)、25.6px、48px | 十五级:display 57/45/36 · headline 32/28/24 · title 22/16/14 · body 16/14/12 · label 14/12/11。**13px 用得最多,最该收口**(归到 12 或 14) |

### 4.3 形状(shape)

| # | 现状 | From M3 |
|---|---|---|
| 4-10 ✅已修 | ~~离刻度圆角 7 处~~ → 全部归到刻度(12 / 8 / 4px),原记录::10px ×4([CodeEditor.vue:1273](src/components/CodeEditor.vue#L1273)、[REPLConsole.vue:319](src/components/REPLConsole.vue#L319)、[QuizView.vue:760](src/components/tutor/QuizView.vue#L760)、[QuizDirectory.vue:190](src/components/tutor/QuizDirectory.vue#L190));6px ×2([App.vue:2291](src/App.vue#L2291)、[CodeEditor.vue:1659](src/components/CodeEditor.vue#L1659));5px ×1(行内代码 [TutorialFormattedText.vue:74](src/components/tutor/TutorialFormattedText.vue#L74)) | 十级刻度 0 / 4 / 8 / 12 / 16 / 20 / 28 / 32 / 48 / full。10→12 或 8,6→8 或 4,5→4 |
| 4-11 ✅已修 | ~~嵌套同半径~~ → 选项行 12 → 8px,原记录::`.option-item` 12px 落在同为 12px、内边距 16px 的题目卡片里([QuizView.vue:698](src/components/tutor/QuizView.vue#L698)) | **`inner = outer − padding`**,容器与其子元素不得用同一半径(如 48 − 14 = 34);此处应取更小一档 8px |
| 4-12 ✅已修 | ~~列表行 8px 同形~~ → 未选中 4px(CornerExtraSmall)、选中 16px(CornerLarge);选中态填 `secondary-container` + `on-secondary-container`(官方 List 令牌),涉及教程树 / 测验目录 / 文件树。原记录:,都是 8px | List 令牌:`ItemContainerShape` = CornerNone、`ItemContainerExpressiveShape` = **CornerExtraSmall(4dp)**;**选中项 = CornerLarge(16dp)**。现在选中态形状不对(8px 应为 16dp),未选中态也偏大 |
| 4-13 ✅已修 | ~~OutlinedCard 描边 2px~~ → 1px。原记录:([m3eStyle.css:41](src/assets/m3eStyle.css#L41)) | `OutlinedCard.OutlineWidth` = **1dp** |
| 4-14 ⏸保留 | 8dp 是卡片集合的间距上限,系列卡 16px / 题目卡 20px 是有意的阅读留白,改成 8px 会让卡片挤在一起。原记录::系列卡 16px([LearningHome.vue:178](src/components/tutor/LearningHome.vue#L178))、题目卡 20px([QuizView.vue:511](src/components/tutor/QuizView.vue#L511)) | 卡片集合「Padding between cards」**8dp max** |

### 4.4 组件几何与命中区

| # | 现状 | From M3 |
|---|---|---|
| 4-15 ✅已修 | ~~定位 FAB 48px / 图标 16px~~ → 40px / 24px(FabSmall)。原记录:、图标 16px([TutorialTree.vue:790](src/components/tutor/TutorialTree.vue#L790)) | `FabSmall` = **40dp** 容器 / 图标 **24dp** / CornerMedium;`FabBaseline` = 56dp。48px 不在 FAB 尺寸档上,图标也小了两档 |
| 4-16 ⏸保留 | 成绩 chip 约 20px 介于 Badge(16dp) 与 Chip(32dp) 之间;它是自绘的状态标签、不可交互,归到任一侧都要重排行内高度。(padding 1px 6px + 11px 字,[TutorialTree.vue:744](src/components/tutor/TutorialTree.vue#L744)) | 卡在 `Badge.LargeSize` **16dp** 与 `Chip.Height` **32dp** 之间,建议归到其中一档。进度 chip 32px ✓ 已在 Chip 档上 |
| 4-17 ⏸保留 | 命中区由整行 `<label>` 提供(≈44px),达标;控件自身状态层 24px 偏小属密集布局取舍。([QuizView.vue:743-746](src/components/tutor/QuizView.vue#L743):`--m3e-radio/checkbox-container-size: 24px`) | Checkbox 容器 18dp + **StateLayerSize 40dp**;RadioButton **StateLayerSize 40dp**。行整体可点(`<label>` 包裹,约 44px)所以**命中区达标**,但控件自身的状态层/波纹从 40 掉到 24,悬浮与按压反馈比规范小一圈 |

### 4.5 色彩(color)

| # | 现状 | From M3 |
|---|---|---|
| 4-18 ✅已修 | ~~`--text-tertiary` = outline~~ → 对齐 `on-surface-variant`(浅色 9.13:1 / 卡片 8.53:1)。原记录: 被当小字色用 47 处 | 文字角色是 **on-surface / on-surface-variant**;`outline` 只用于边界。实测 `outline` #73777f 在纸面 #fdfcff 上 **4.40:1**、在卡片 #f1f5fb 上 **4.11:1**,低于小字 4.5:1;换 on-surface-variant 得 9.13 / 8.53 |
| 4-19(合规面,保持) | 分隔线与描边走 `outline-variant` ✓;容器色只做填充、文字一律配 `on-*` ✓;primary / secondary / tertiary 三层 container 分工清晰(进度 chip 用 secondary-container、测验 chip 用 tertiary-container、选中行用 secondary-container)✓ | 其余对比度实测全部达标:primary 6.33、on-surface 16.7、on-secondary-container 13.3、on-tertiary-container 13.3 |

### 4.6 战术层面(机会,不是缺陷)

M3 Expressive 的七条战术(containment / size / shape / color / typography / motion / 组件灵活性)里,项目目前落地的是 **containment**(阅读区面板 + 卡片分区)与 **color**(container 色做层级)。可以往下走的:

- **motion 挂零**:全部动效都还是"缓动+时长",没有一处用物理体系;学习首页的欢迎区是天然的 hero 位(规范建议每个产品 1~2 处,现在它是静态的 3rem 图标 + 两行字)
- **typography 没有 emphasized 层**:M3 的 emphasized = **同字号只改字重**,用在选中项、主操作、标题;项目其实已经手动达到了类似效果(选中行 700、进度 chip 600、标题 800),建议按 token 收口而不是各处手写——顺带把 800 收回上限内的 Medium/Bold
- **shape 有张力但没有 morph**:shape morph 属 spatial,和位移共用同一套弹簧;交互态换形状(如按钮按下 `PressedShape` 收紧一档、chip 选中转全圆)是最省力的 expressive 表达

---

## 修复优先级建议(2026-09-27 技术债清理后)

第 4 章可机械修正的项已全部落地;下面按「还剩什么 / 为什么没做」排列:

1. **焦点轮廓** ✅ 已做(收窄) —— 只给自绘的侧栏菜单行加描边,自绘 iconButton 用 state layer;全局规则会与组件库自绘焦点环叠成双描边,故不采用
2. **动效曲线收口** ✅ 已做 —— index.css 定义 6 个 M3 动效 token(effects / spatial 各三档),全项目 32 条 transition 与 8 处 `transition: all` 已改完
3. **字体收口** ✅ 部分 —— Nunito 改成可变字重区间(800 不再是合成加粗);HarmonyOS 缺 Bold 文件、13px 字号刻度属设计决策,两项保留
4. **离刻度圆角 / 描边 / 列表形状** ✅ 已做 —— 圆角全部归到 12/8/4px,卡片描边 1dp,列表行 4px / 选中 16px
5. **待你拍板的观感项**:列表行从 8px 改成 4px(选中 16px)后树形目录观感变化最大,不合适说一声就回退
6. **保留未改(密集布局取舍)**:搜索栏 40px(2-1)、菜单项 36px(2-5)、输入框 34px(3-6)、工具栏 34/36/42px(2-2)、13px 字号(3-2 / 4-9)、卡片间距 16/20px(4-14) —— 改成 M3 的 56 / 48 / 56 / 64dp 都会把现有密集布局撑开,属设计决策,不是缺陷
7. **需要资源的**:HarmonyOS Sans SC Bold 字体文件(4-8);网页教程站数据同步(见 REQUIREMENTS.md B-18)

> 原「⚪ 非 M3 质量问题」三条(设置页 optgroup 标签、硬编码中文、死代码)于 2026-09 已全部修复,该节随之移除。
