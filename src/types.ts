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
}
