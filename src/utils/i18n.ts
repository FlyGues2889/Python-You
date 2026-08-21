const translations = {
  zh: {
    // Navigation Sidebar
    navTutorial: '教程',
    navConsole: '交互终端',
    navPackages: '扩展包',
    navSettings: '设置',
    explorer: '代码编辑',

    // Title bar controls & menus
    minimize: '最小化',
    maximize: '最大化',
    close: '关闭',
    fileMenu: '文件',
    editMenu: '编辑',
    newFile: '新建文件',
    newFolder: '新建文件夹',
    openFile: '打开文件',
    openFolder: '打开文件夹',
    save: '保存',
    downloadFile: '导出文件到本地',
    copy: '复制',
    copyTerminalInfo: '复制终端信息',
    cut: '剪切',
    paste: '粘贴',
    find: '查找',
    replace: '替换',

    // Settings View
    settingsTitle: '偏好设置',
    settingsSubtitle: '自定义外观主题、语言与代码编辑器配置',
    generalSettings: '通用设置',
    themeMode: '外观主题',
    themeModeSubtitle: '切换深色或浅色外观模式',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',

    editorSettings: '编辑器配置',
    codeTheme: '代码颜色风格',
    codeThemeSubtitle: '选择高亮配色主题方案',
    followSystemTheme: '跟随系统主题',
    fontSize: '代码字体大小',
    fontSizeSubtitle: '调整代码编辑器中的文字大小',
    enableWheelZoom: 'Ctrl + 滚轮缩放字体',
    enableWheelZoomSubtitle: '开启后可在代码编辑器中按住 Ctrl 键滚动鼠标滚轮调整字号',
    tabSize: 'Tab 缩进空格数',
    tabSizeSubtitle: '按 Tab 键自动插入的空格数',
    autoPairQuotes: '自动配对引号',
    autoPairQuotesSubtitle: '输入引号时自动补全另一半；选中文本时自动用引号包裹',

    pythonConfig: 'Python 配置',
    pythonConfigSubtitle: '配置演示模式与 Python 解释器',
    interpreter: 'Python 解释器',
    interpreterSubtitle: '选择用于运行代码的解释器',
    interpreterAuto: '自动选择',
    interpreterPyodide: 'Pyodide (WASM)',
    interpreterLocal: '本机 Python',

    aboutTitle: '关于 Python You',
    aboutApp: 'Python You',
    aboutAppDesc: '基于浏览器 WASM 与 Pyodide 的本地 Python 集成开发环境',
    demoMode: '演示模式',
    demoModeSubtitle: '开启后使用轻量演示引擎，关闭则使用离线完整 Python WASM 引擎',
    aiEngine: '人工智能项目',
    aiEngineDesc: '本项目使用人工智能技术协助构建',

    // Code Editor & Tabs
    welcomeTitle: '工作区为空',
    welcomeSubtitle: '请 选择一个 Python 文件 或 点击“新建文件” 开始编码',
    runCode: '执行',
    stopCode: '停止',
    clearTerminal: '清空终端记录',
    findPlaceholder: '查找内容...',
    replacePlaceholder: '替换为...',
    replaceBtn: '替换',
    replaceAllBtn: '全部替换',
    noMatches: '无匹配',

    // File Tree & Context Menu
    workspace: '工作区文件',
    newFileTooltip: '新建文件',
    newFolderTooltip: '新建文件夹',
    folderNamePlaceholder: '文件夹名称...',
    fileNamePlaceholder: '文件名.py',
    noMatchingFiles: '暂无匹配文件',
    rename: '重命名',
    openInExplorer: '在资源管理器中打开',
    delete: '删除',
    run: '运行',
    runScriptTooltip: '运行此脚本',
    downloadExport: '导出文件到本地',

    // REPL Console
    replTitle: '交互式 REPL 终端',
    clearTerminalTooltip: '清空控制台记录',
    replPlaceholder: '输入 Python 语句',

    // Package Manager
    pkgTitle: 'Python 拓展包管理器 (Pyodide / PyPI)',
    pkgSubtitle: '搜索并安装纯 Python 扩展包及标准 Pyodide 轮子包',
    pkgSearchPlaceholder: '输入 PyPI / Pyodide 包名称 (如: pillow)...',
    installPkg: '安装',
    installing: '正在安装...',
    loadPkg: '安装',
    uninstall: '卸载',
    installedSectionTitle: '已安装拓展包',
    availableSectionTitle: '可安装拓展包',

    // Dialogs & Toasts
    confirmDeleteTitle: '确认删除',
    confirmDeleteMsg: '确定要删除 "{name}" 吗？此操作无法撤销。',
    confirmDeleteFolderMsg: '确定要删除文件夹 "{name}" 及其全部内容吗？此操作无法撤销。',
    unsavedChangesTitle: '未保存的更改',
    unsavedChangesMsg: '文件 "{name}" 存在未保存的更改。是否在关闭前保存？',
    dontSave: '不保存',
    cancel: '取消',
    toastFileSaved: '已保存文件 "{name}"',
    toastFileDeleted: '已删除 "{name}"',
    toastFileCreated: '成功新建文件 "{name}"',
    toastFolderCreated: '成功新建文件夹 "{name}"',
    toastRenamed: '成功重命名',
    toastExported: '文件 "{name}" 已导出下载',
    toastImported: '已成功打开文件',
    returnToTutorial: '返回教程',

    // Loading / Startup Status
    loadingStart: '正在启动 Python You…',
    loadingScanningWorkspace: '正在扫描工作区文件…',
    loadingCreatingWorkspace: '正在创建本地工作区文件夹…',
    loadingRestoringSession: '正在恢复上次会话…',

    // App Toasts & Messages
    toastSelectTutorialText: '请先在教程正文中选中要复制的文本',
    toastCopiedSelection: '已复制选中文本',
    toastCopiedToClipboard: '已复制到剪贴板',
    toastNoTerminalOutput: '终端暂无输出',
    toastCopiedTerminalInfo: '已复制终端信息',
    toastCopyFailed: '复制失败，请重试',
    toastSelectEditorText: '请先在编辑器中选中要复制的文本',
    toastOpenWorkspaceFirst: '请先打开本地工作区',
    toastRevealFailed: '无法打开资源管理器: ',
    toastImportFailed: '导入失败: ',
    toastWorkspaceOpened: '已打开本地工作区: ',
    toastWorkspaceOpenFailed: '打开工作区失败: ',
    toastTutorialCodeLoaded: '已加载教程代码至编辑器',
    toastNotQuizCode: '当前不是测验代码，无法提交',
    toastOpenQuizCode: '请先打开测验代码',
    toastRunError: '运行出错，请查看终端中的错误信息',
    toastQuizPassed: '测验通过，输出完全正确！',
    toastQuizFailed: '输出与预期不符，请查看对比详情',
    correspondingTutorial: '对应教程',
    quizSuffix: '（测验）',

    // Code Editor
    kindKeyword: '关键字',
    kindBuiltin: '内置',
    kindModule: '模块',
    kindSnippet: '片段',
    kindIdentifier: '标识符',
    completionDetailIfMain: '程序入口',
    completionDetailDef: '定义函数',
    completionDetailClass: '定义类',
    completionDetailFor: 'for 循环',
    completionDetailIf: 'if 分支',
    completionDetailReadFile: '读取文件',
    completionDetailTry: '异常处理',
    completionDetailCallable: '函数/类',
    completionDetailVariable: '变量',
    completionDetailKeyword: '关键字',
    completionDetailBuiltin: '内置函数',
    completionDetailModule: '标准库模块',
    toastCopiedAll: '已复制全部内容',
    toastSelectToCut: '请先在编辑器中选中要剪切的内容',
    toastClipboardUnavailable: '无法读取剪贴板，请使用 Ctrl+V 粘贴',
    tabUnsavedTitle: '未保存修改',
    tabCloseTitle: '关闭标签页',
    tabScrollLeft: '向左滚动标签列表',
    tabScrollRight: '向右滚动标签列表',
    undoTitle: '撤销 (Ctrl+Z)',
    redoTitle: '重做 (Ctrl+Y)',
    cursorPositionText: '第 {line} 行，第 {col} 列',
    engineLabelDefault: 'Pyodide',
    findPrevTitle: '上一个 (Shift+Enter)',
    findNextTitle: '下一个 (Enter)',
    closeTitle: '关闭',
    completionConfirm: '补全',
    completionInvoke: '唤起',
    quizAnswerCorrectDesc: '已通过，返回测验',
    checkAnswer: '答案',
    outputTerminalTitle: '输出',
    fontSizeIncrease: '增大编辑器字体',
    fontSizeDecrease: '减小编辑器字体',

    // 使用帮助弹窗
    helpTitle: '使用帮助',
    helpGotIt: '确定',
    helpBasicsTitle: '基础操作',
    helpBasicsText: '通过左侧文件树或工具栏「新建文件 / 新建文件夹」创建项目文件；右键文件可重命名、删除、运行或导出。\n打开文件后在编辑区编写代码，点击工具栏「执行」按钮运行当前脚本，输出显示在下方终端面板。',
    helpShortcutsTitle: '常用快捷键',
    helpShortcutsText: 'Ctrl+S 保存当前文件\nCtrl+Z / Ctrl+Y 撤销与重做\n工具栏查找 / 替换按钮可搜索与批量替换文本\nCtrl+滚轮 调节编辑器字号（需在设置中开启）',
    helpConsoleTitle: '交互式终端',
    helpConsoleText: '侧边栏「交互终端」进入 REPL：直接在显示区输入 Python 语句并按回车执行；↑ / ↓ 翻阅历史命令；输出可选中复制，右上角按钮清空记录。',
    helpPackagesTitle: '扩展包管理',
    helpPackagesText: '「扩展包」页面搜索 PyPI / Pyodide 包名，一键安装纯 Python 扩展包，安装后即可在代码中 import 使用。',
    helpTutorialTitle: '教程与测验',
    helpTutorialText: '「教程」页面内置 Python 入门课程与课后测验；测验代码通过「检查答案」按钮自动校验输出。',
    helpSettingsTitle: '偏好设置',
    helpSettingsText: '「设置」页面可调整外观主题、代码配色、字号、Tab 宽度等，所有修改即时生效并自动保存。',

    // Package Manager

    // Quiz / Tutorial UI
    backToTutorial: '返回教程',
    quizAfterClass: '课后测验',
    quizScoreText: '答对 {correct} / {total}',
    quizEmpty: '该章节暂无测验题目。',
    questionIndexText: '第 {n} 题',
    questionTypeChoice: '选择题',
    questionTypeCode: '代码题',
    answerCorrect: '回答正确',
    answerWrong: '回答错误',
    codePassed: '已通过',
    codeFailed: '未通过',
    notAnswered: '未作答',
    putInEditor: '放入编辑器作答',
    codeActionHint: '在编辑器窗口中修改代码，点击右下角「检查答案」校验输出',
    choiceSubmitted: '选择题已提交',
    submitQuizText: '提交测验（已选 {answered}/{total}）',
    retakeQuiz: '重新测验',
    quizDirectoryTitle: '测验目录',
    quizDirectorySubtitle: '每节课后完成测验，巩固所学知识',
    scoreNone: '暂无',
    quizDoneTitle: '测验已完成',
    quizNotDoneTitle: '测验未完成',
    toggleQuizCatalog: '切换测验目录',
    quizShort: '测验',
    noTutorialMatch: '未找到匹配的教程内容',
    locateCurrentTopic: '定位当前课程在目录中的位置',

    // Tutorial Article Content UI
    tocTitle: '目录',
    readingTimeText: '{time} min read',
    keyTakeaways: '核心要点',
    markComplete: '标记为完成',
    markedComplete: '已完成',
    completeQuizTitle: '完成本节测验',
    quizBtn: '测验',
    backToTop: '回到顶部',

    // Tutorial Catalog (原 tutorialUI)
    tutorialSearchPlaceholder: '搜索课程或知识点...',
    tutorialClickToRun: '点击在编辑器中直接运行',
    tutorialCopyCode: '复制源码',
    tutorialCopied: '已复制到剪贴板',
    tutorialTipsTitle: '学习小贴士',
    tutorialCatalog: '教程目录',
    tutorialExpandCatalog: '展开教程大纲',
    tutorialCollapseCatalog: '收起教程大纲',
    tutorialInteractiveExample: '交互式示例代码',
    tutorialCodeSnippet: '代码片段',
    tutorialImportAndRun: '导入运行',
    tutorialRunInIDE: '在 IDE 中运行代码',
    tutorialPrevious: '上一页',
    tutorialNext: '下一页',

    // Python Engine Status & Messages（面向用户的提示）
    engineLocal: 'Python {version}',
    runLocalPython: '▶ 使用本机 Python {version} 执行...',
    processExited: '[INFO] 进程已结束，退出码 {code}，耗时 {duration}ms',
    replSessionEnded: '[INFO] REPL 会话已结束',
    replStartFailed: '无法启动本地 REPL: {err}',
    pipInstalledOk: '[Pip] 已通过 pip 安装 {name}',
    pipInstallFailed: '[Pip] 安装 {name} 失败（退出码 {code}）',
    pipError: '[Pip] {err}',
    pyodideLoading: '[INFO] 尝试加载本地 Pyodide WASM 引擎...',
    pyodideActive: '[INFO] Pyodide Python 3.11 WASM Engine Active!',
    pyodideUnavailable: '[INFO] Pyodide WASM 引擎不可用（{err}），已切换到演示模式。',
    pyodideTimeout: 'Pyodide WASM 引擎加载超时',
    pyodideCdnUnavailable: 'Pyodide 引擎加载失败',
    pyodideInitTimeout: 'Pyodide WASM 引擎初始化超时，检查你的网络',
    demoModeRunning: '[演示模式] 正在以演示引擎执行（非真实 Python 运行）...',
    demoExecuted: '[演示模式] 演示引擎执行结束（非真实 Python 运行，结果仅供演示）。',
    demoUnsupportedWarning: '[演示模式] 警告：代码中有 {count} 处语句无法由演示引擎执行（第 {lines} 行），这些语句未运行，结果不完整。',
    replErrorMsg: '[REPL Error] {err}',
    pyodideInstallingPkg: '[INFO] 正在通过 Pyodide micropip 安装包\'{name}\'',
    pyodideInstalledPkg: '[INFO] 成功安装包 \'{name}\'',
    pyodideInstallFail: '[ERROR] 安装包 \'{name}\'失败。错误: {err}',
    demoPkgRegistered: '[演示模式] 包 \'{name}\' 仅登记记录，未真实安装；代码中 import 该包仍会失败。',
    processFinishedCode: '[INFO] 进程已完成并退出，代码 0 ，完成时间 {duration}ms',
    invalidFileName: '文件名不能包含 \\ / : * ? " < > | 或 .. 等字符',
    pkgInstallFailedMsg: '安装 {name} 失败，详情见终端输出',

    // REPL 欢迎语（按真实引擎动态生成）
    replWelcomeDemo: '[演示模式] Python 3.11 演示引擎（非真实运行，仅支持 print/赋值/表达式）\nType "help" for more information.',
    replWelcomePyodide: 'Python 3.11.0 (Pyodide WASM Runtime)\nType "help", "copyright", "credits" or "license" for more information.',
    replWelcomeLocal: '{label} — Type "help", "copyright", "credits" or "license" for more information.',

    // 测验输出对比弹窗
    quizCompareTitle: '输出对比',
    quizExpectedTitle: '期望输出',
    quizActualTitle: '你的输出',

    // 首次启动欢迎引导
    welcomeDialogTitle: '欢迎使用 Python You',
    welcomeDialogText: '无需安装 Python 即可开始学习与运行代码。\n\n建议从「教程」页开始：内置 7 大阶段系统课程与课后测验，教程中的代码可一键导入编辑器实时运行。',
    enterWorkspace: '直接进入工作区',
    startLearning: '开始学习教程',

    // 网页端环境提示条
    webEnvBanner: '网页版：工作区与学习进度仅保存在本浏览器（清除缓存或更换浏览器将丢失），代码在本机浏览器内执行',

    // 工作区内容搜索
    workspaceSearch: '搜索工作区内容',
    workspaceSearchPlaceholder: '搜索文件内容（.py / .txt / .md / .json / .js / .ts）...',
    searchResultCount: '找到 {count} 处匹配',
    workspaceSearchEmpty: '未找到匹配内容'
  },
};

export function t(key: keyof typeof translations['zh']): string {
  return translations['zh'][key] || key;
}

// 带 {placeholder} 参数插值的翻译：tf('toastFileSaved', { name: 'main.py' })
export function tf(key: keyof typeof translations['zh'], vars: Record<string, string | number>): string {
  let s = translations['zh'][key] || key;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export function useI18n() {
  return { t, tf };
}
