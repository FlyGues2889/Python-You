export interface FSItem {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  content?: string; // Empty for folders
  parentId: string | null;
  children?: FSItem[];
  isOpen?: boolean; // Folder expand state
  readOnly?: boolean;
  mtime?: number; // 读盘时的最后修改时间，保存前比对检测外部修改（NFR-5.4）
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
  language: string;
}

export interface ConsoleOutput {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'info' | 'error' | 'input' | 'warning';
  text: string;
  timestamp: string;
  // FR-4.5：完整 traceback 等长文本详情，终端中默认折叠、可展开（摘要行仍常显）
  collapsible?: boolean;
  // true = 这段文本后面还没有换行，属于「正在写的那一行」：终端把同行的片段接起来显示，
  // 并把输入光标接在这行末尾（input("Test: ") 的提示串就是这样实时出现的）
  partial?: boolean;
  // matplotlib 图表：data URL（PNG），存在时终端输出区渲染为图片
  image?: string;
}

/** 一次执行失败的语义类别（阶段 3 执行契约）：判分与 UI 按它分流，不再只看 success */
export type FailureKind = 'exitCode' | 'exception' | 'unsupportedSyntax' | 'canceled' | 'interrupted';

/** 运行结果（门面与各后端统一形状；success 保留兼容旧调用方） */
export interface RunResult {
  success: boolean;
  durationMs: number;
  value?: string | null;
  /** 失败类别；成功时缺省。busy 表示被并发闸门拒绝，不算一次执行 */
  failureKind?: FailureKind;
  /** 有在飞操作时被闸门拒绝（调用方应提示用户先停止） */
  busy?: boolean;
}

/** 后端能力描述符（阶段 3）：UI 问能力而不是读两个 ref 猜 */
export interface BackendCapabilities {
  /** 输出随执行流式送达（demo 引擎攒到结束才一次输出） */
  streaming: boolean;
  /** 能返回 matplotlib 图片输出 */
  images: boolean;
  /** 脚本运行时可请求 stdin（input() 交互） */
  stdin: boolean;
  /** REPL 会话可输入 */
  replStdin: boolean;
  /** 可中断当前执行 */
  interrupt: boolean;
  /** REPL 会回显表达式值 */
  valueEcho: boolean;
}

export interface AppConfig {
  themeMode: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  showLineNumbers: boolean;
  codeTheme?: string;
  enableWheelZoom?: boolean;
  autoPairQuotes?: boolean;
  demoMode?: boolean;
  interpreter?: string; // 'auto' | 'pyodide' | 本机解释器 id（python_detect versions[].id）
}
