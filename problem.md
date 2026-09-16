# Python You · Material 3 设计规范符合性问题清单

> 审查日期:2026-08-30
> 审查范围:全部 Vue 组件(19 个)、全局样式(theme/m3eStyle/index/font)、主题 token 体系
> 对照基准:M3 官方 token(md.comp.\*/md.sys.\*)+ @m3e/web 组件默认值
>
> **严重度分级**:🔴 P1 直接违背规范(优先修复)→ 🟠 P2 中等偏离 → 🟡 P3 轻微问题 → ⚪ 非 M3 质量问题

---

## 🔴 P1 主要问题(直接违背规范)

> **状态:✅ 已全部修复(2026-08-30)**
> - 1-1:全局卡片圆角 28px→12px([src/assets/m3eStyle.css](src/assets/m3eStyle.css)),移除 Settings/PackageManager 的 20px 覆盖,题目卡片 16px→12px
> - 1-2:树/列表行胶囊 9999px→8px,选中态改 `secondary-container` 填充 + `on-secondary-container` 文字(FileTreeNode/FileTree/TutorialTree/QuizDirectory)
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

**From M3:** List 项容器形状 = CornerNone(0dp),Expressive 版 = **CornerExtraSmall(4dp)**;选中项容器 = **secondary-container 填充**(component-tokens.md List 段)。胶囊行 + 描边选中是 VS Code 风格而非 M3;选中态用 `secondary` 文字色而非 `on-secondary-container`,浅色下对比也不足。

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

## 🟠 P2 中等偏离

| # | 问题 | 实际 | From M3 |
|---|---|---|---|
| 2-1 | 搜索栏全局压到 40px 高 [src/assets/m3eStyle.css:8-14](src/assets/m3eStyle.css#L8-L14) | 40px(clear 按钮 32px/18px) | SearchBar **56dp** 高,清除按钮 40dp/24dp |
| 2-2 | 无 M3 工具栏高度:标题栏 36px [src/App.vue:1961](src/App.vue#L1961)、编辑器工具栏 ≈38px [src/App.vue:2190](src/App.vue#L2190)、REPL 头 42px [src/components/REPLConsole.vue:283](src/components/REPLConsole.vue#L283)、终端头 32px [src/components/TerminalPanel.vue:110](src/components/TerminalPanel.vue#L110) | 32–42px,且两处"面板头"高度不一致 | AppBarSmall/DockedToolbar **64dp** |
| 2-3 | 图标按钮几乎全用 extra-small(32dp)+ 自定义 iconButton 尺寸不合规格 [src/components/selfComponents/iconButton.vue:81-116](src/components/selfComponents/iconButton.vue#L81-L116) | SM 20px / S 32px+16px 图标 / M 40px+19.2px 图标 | XSmall 32dp·20dp 图标 / Small **40dp·24dp** / Medium 56dp·24dp;19.2px 不在 M3 字号刻度 |
| 2-4 | LoadingModal 不透明 surface 全屏遮罩 [src/components/selfComponents/loadingModal.vue:28](src/components/selfComponents/loadingModal.vue#L28) | 100% 不透明 | Scrim = onSurface **32% 透明度** |
| 2-5 | 菜单项密度 -2、行高 36px [src/assets/m3eStyle.css:19-22](src/assets/m3eStyle.css#L19-L22) | 36px | Menu item **48dp** 高 |
| 2-6 | 定位 FAB 覆盖尺寸 [src/components/tutor/TutorialTree.vue:531-539](src/components/tutor/TutorialTree.vue#L531-L539) | 48px 高、16px 图标 | FabSmall **40dp / 24dp 图标** |
| 2-7 | 禁用按钮容器置空 [src/assets/m3eStyle.css:62-64](src/assets/m3eStyle.css#L62-L64) | `--m3e-button-disabled-container-color: none` | 禁用容器 = onSurface **12%** 透明度 |
| 2-8 | 焦点样式只覆盖原生 button [src/assets/index.css:145-148](src/assets/index.css#L145-L148);`--focus-overlay` 定义后从未使用 [src/assets/theme.css:173](src/assets/theme.css#L173) | — | M3 焦点指示需覆盖全部可交互元素 |

---

## 🟡 P3 轻微问题

- **3-1 系统性离刻度圆角**:10px(REPL/Settings/Quiz/Package 四处主卡片 [src/components/REPLConsole.vue:307](src/components/REPLConsole.vue#L307) 等)、6px(REPL body [src/components/REPLConsole.vue:320](src/components/REPLConsole.vue#L320)、标题栏按钮 [src/App.vue:2015](src/App.vue#L2015)、hover 提示 [src/components/CodeEditor.vue:1605](src/components/CodeEditor.vue#L1605)) — 均不在 M3 十级刻度(0/4/8/12/16/20/28/32/48/full)。且同款"终端显示体"圆角互相矛盾:REPL 6px vs 终端面板 16px [src/components/TerminalPanel.vue:155](src/components/TerminalPanel.vue#L155)
- **3-2 字号离刻度**:`--text-size-sm 14.4px`、`--text-size-m 19.2px` [src/assets/font.css:12-16](src/assets/font.css#L12-L16)、dialog 标题 20px [src/App.vue:2313](src/App.vue#L2313)(M3 dialog 标题 = headline-small 24sp)、dialog 正文 15px(在 body 14/16 之间)
- **3-3 字体权重超资源**:Nunito 仅注册 400/700 [src/assets/font.css:72-84](src/assets/font.css#L72-L84),但 `.article-title`/`.quiz-topic-title`/`.dir-title` 用 **800**([src/components/tutor/TutorialContent.vue:462](src/components/tutor/TutorialContent.vue#L462)、[src/components/tutor/QuizView.vue:303](src/components/tutor/QuizView.vue#L303)、[src/components/tutor/QuizDirectory.vue:130](src/components/tutor/QuizDirectory.vue#L130)) → 浏览器合成加粗,字形质量下降
- **3-4 过渡曲线用 legacy/M2 曲线**:`ease` [src/assets/index.css:24-27](src/assets/index.css#L24-L27)、`cubic-bezier(0.4,0,0.2,1)` [src/components/tutor/TutorialTree.vue:377](src/components/tutor/TutorialTree.vue#L377) — M3 web 回退应为 standard `(0.2,0,0,1)` / emphasized `(0.05,0.7,0.1,1)`,弹簧曲线见 tokens.md
- **3-5 按钮全局强制品牌字体** [src/assets/index.css:56-63](src/assets/index.css#L56-L63):M3 按钮标签用 label-large = Plain 字体槽
- **3-6 自定义输入框形状**:8px 圆角 + 34px 高 [src/App.vue:2432-2444](src/App.vue#L2432-L2444)、[src/components/FileTreeNode.vue:356-377](src/components/FileTreeNode.vue#L356-L377) — OutlinedTextField 应为 **4dp 圆角、56dp 高**
- **3-7 补全弹层 12px** [src/components/CodeEditor.vue:1622](src/components/CodeEditor.vue#L1622):菜单类容器应为 CornerExtraSmall **4dp**
- **3-8 `surface-0..5` 命名残留旧抬升模型** [src/assets/theme.css:113-124](src/assets/theme.css#L113-L124)(取值已是正确色调制,仅命名误导)
- **3-9 nav-rail top-space 1rem** [src/assets/m3eStyle.css:70-73](src/assets/m3eStyle.css#L70-L73):M3 为 **44dp**
- **3-10 Quiz snackbar 3000ms** [src/components/tutor/QuizView.vue:248](src/components/tutor/QuizView.vue#L248):M3 短消息 4s(主应用 5000ms ✓)

---

## ⚪ 非 M3 质量问题

1. **设置页解释器分组标签错误**:[src/components/SettingsView.vue:224](src/components/SettingsView.vue#L224) 的 optgroup 用了 `t('themeDark')`("深色"),应为 `t('interpreterLocal')`("本机 Python",i18n 键已存在 [src/utils/i18n.ts:58](src/utils/i18n.ts#L58)) — 复制粘贴遗留 bug
2. **硬编码中文不走 i18n**:[src/components/FileTree.vue:189](src/components/FileTree.vue#L189) "资源管理器";[src/components/PackageManager.vue:189](src/components/PackageManager.vue#L189)/[src/components/PackageManager.vue:206](src/components/PackageManager.vue#L206)/[src/components/PackageManager.vue:214](src/components/PackageManager.vue#L214)/[src/components/PackageManager.vue:232](src/components/PackageManager.vue#L232) "个"、"暂无已安装的扩展包"、"暂无可载入的拓展包"
3. **死代码**:`sidebarExpanded` 从未被切换 [src/App.vue:422](src/App.vue#L422)/[src/App.vue:1418](src/App.vue#L1418);`--focus-overlay` 无任何引用

---

## ✅ 合规亮点(值得保持)

- **主题架构完全规范**:全部角色色走 `--md-sys-color-*`,应用别名统一映射,组件库与应用共享同一 token 源 — M3 标准接线方式
- **色调制 surface 层级**,未使用已被废弃的抬升叠加模型;fixed 变体(surface-container-\*)处理正确
- **品牌/正文双字体槽**按 M3 typescale 概念划分(Nunito/HarmonyOS 标题、正文 Sans)
- Dialog 保持默认 28dp(CornerExtraLarge ✓)、菜单/tooltip/snackbar 形状交给组件库默认值 ✓
- 全圆角按钮(9999px = CornerFull ✓)、连接式按钮组 40dp ✓、switch/slider/select 直用组件 ✓
- 分隔线全部走 `m3e-divider`(outline-variant 语义 ✓);按钮 focus-visible 轮廓 ✓

---

## 修复优先级建议

1. **P1-1/P1-2**(卡片圆角 + 列表形态):各改一处全局 CSS 即可 — `--m3e-card-shape: 12px`,树行 `border-radius: 8px`、选中态改 `secondary-container` 填充
2. **P1-3**(固定色):日志色改为随代码主题的映射变量;Quiz 正确/错误态改用主题 token(`primary-container` 系 / `error-container` 系)
3. **P1-4**(键盘可达):给 div 交互元素补 `role="button"` + `tabindex` + Enter 处理
4. 顺手修掉 SettingsView 的 optgroup 标签 bug(Q-1)
