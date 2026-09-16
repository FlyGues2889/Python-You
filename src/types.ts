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
