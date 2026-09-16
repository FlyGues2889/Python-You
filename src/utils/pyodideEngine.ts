// Pyodide（WASM）执行引擎：运行在 Web Worker 内，主线程不被阻塞（FR-4.2）。
// input() 走「中断 → 主线程弹窗 → 携带已捕获输入重放」，重放时丢弃已显示过的输出前缀。
import { t, tf } from './i18n';
import type { FSItem } from '../types';

export interface WorkspaceFile {
  path: string;
  content: string;
}

export interface EngineRuntime {
  loadPyodide: (config: { indexURL: string }) => Promise<any>;
  indexURL: string;
}

export interface EngineHost {
  loadRuntime(): Promise<EngineRuntime>;
  onOutput(kind: 'stdout' | 'stderr' | 'system', text: string): void;
  /** 请求用户输入（promptText 为 Python 侧 input() 的提示语，可能为空）；返回 null 表示用户取消 */
  requestInput(promptText: string): Promise<string | null>;
}

const INPUT_MARKER = 'PYSTUDIO_INPUT_REQUEST';
// 重放上限：防止 `while True: input()` 这类代码无限弹窗与无限重放
const MAX_INPUT_ATTEMPTS = 20;

// Python 侧引导：接管 input()（无可用输入时抛 BaseException，避免被用户代码的
// `except Exception` 吞掉）与 help()（pydoc 的交互模式在 Worker 里无法工作）。
const BOOTSTRAP = `
import builtins as _py_builtins

class _PyStudioInputRequest(BaseException):
    pass

def _py_input(prompt=''):
    if not __py_has_input():
        # 记下提示语供弹窗显示；此时不打印，否则重放时提示语会在缓冲区里重复一次
        __py_set_prompt(str(prompt))
        raise _PyStudioInputRequest('${INPUT_MARKER}')
    if prompt:
        print(prompt, end='', flush=True)
    return __py_next_input()

_py_builtins.input = _py_input

def _py_help(obj=None):
    if obj is None:
        print('帮助：使用 help(对象) 查看对象的文档。')
        return
    import pydoc
    # pydoc.plain 剥离 \\b 粗体/下划线格式（真实终端渲染成样式，
    # 非终端通道会变成 iinntt 式重复字符乱码）
    print(pydoc.plain(pydoc.render_doc(obj)))

_py_builtins.help = _py_help
`;

export class PyodideEngine {
  private pyodide: any = null;
  // 本次逻辑运行已捕获的输入（按序，跨尝试保留）与当前尝试待消费的输入
  private capturedInputs: string[] = [];
  private pendingInputs: string[] = [];
  private pendingPrompt = '';
  // 已真正转发出去的输出块数；重放时按此丢弃前缀，避免重复显示
  private streamedChunks = 0;
  private suppressRemaining = 0;

  private host: EngineHost;

  constructor(host: EngineHost) {
    this.host = host;
  }

  get ready(): boolean {
    return !!this.pyodide;
  }

  async init(): Promise<void> {
    const runtime = await this.host.loadRuntime();
    const pyodide = await runtime.loadPyodide({ indexURL: runtime.indexURL });
    pyodide.setStdout({ batched: (text: string) => this.emit('stdout', text) });
    pyodide.setStderr({ batched: (text: string) => this.emit('stderr', text) });
    pyodide.globals.set('__py_has_input', () => this.pendingInputs.length > 0);
    pyodide.globals.set('__py_next_input', () => String(this.pendingInputs.shift()));
    pyodide.globals.set('__py_set_prompt', (text: string) => { this.pendingPrompt = String(text || ''); });
    await pyodide.runPython(BOOTSTRAP);
    this.pyodide = pyodide;
  }

  private emit(kind: 'stdout' | 'stderr', text: string) {
    if (this.suppressRemaining > 0) {
      this.suppressRemaining--;
      return;
    }
    this.streamedChunks++;
    this.host.onOutput(kind, text);
  }

  /** 写入虚拟 FS（目录按路径创建） */
  syncFiles(files: WorkspaceFile[]) {
    if (!this.pyodide) return;
    const fs = this.pyodide.FS;
    for (const file of files) {
      const fullPath = file.path.startsWith('/') ? file.path : '/' + file.path;
      const parts = fullPath.split('/').filter(Boolean);
      let dir = '';
      for (let i = 0; i < parts.length - 1; i++) {
        dir += '/' + parts[i];
        try { fs.mkdir(dir); } catch { /* 已存在 */ }
      }
      try { fs.writeFile(fullPath, file.content); } catch { /* 忽略 */ }
    }
  }

  /** 执行脚本；input() 触发中断后重放，直到完成或用户取消 */
  async run(code: string, files: WorkspaceFile[]): Promise<boolean> {
    if (!this.pyodide) throw new Error('Pyodide 未初始化');
    this.syncFiles(files);
    this.capturedInputs = [];
    this.streamedChunks = 0;

    for (let attempt = 1; attempt <= MAX_INPUT_ATTEMPTS; attempt++) {
      // 每次尝试前重置：重建待消费输入队列，并丢弃「前几次尝试已显示过」的输出前缀
      this.pendingInputs = [...this.capturedInputs];
      this.suppressRemaining = this.streamedChunks;
      try {
        await this.pyodide.runPythonAsync(code);
        return true;
      } catch (err: any) {
        const message = String(err?.message || err);
        if (!message.includes(INPUT_MARKER)) throw err;
        const value = await this.host.requestInput(this.pendingPrompt);
        if (value === null) {
          this.host.onOutput('system', t('pyodideInputCanceled'));
          return false;
        }
        this.capturedInputs.push(value);
      }
    }
    throw new Error(t('pyodideInputTooMany'));
  }

  /** 执行 REPL 单条语句；不支持 input()（重放会重复执行已产生的副作用） */
  async repl(statement: string): Promise<string | null> {
    if (!this.pyodide) throw new Error('Pyodide 未初始化');
    this.pendingInputs = [];
    this.streamedChunks = 0;
    this.suppressRemaining = 0;
    try {
      const result = await this.pyodide.runPythonAsync(statement);
      return result === undefined ? null : String(result);
    } catch (err: any) {
      const message = String(err?.message || err);
      if (message.includes(INPUT_MARKER)) {
        this.host.onOutput('system', t('pyodideReplInputUnsupported'));
        return null;
      }
      throw err;
    }
  }

  async install(pkg: string): Promise<boolean> {
    if (!this.pyodide) throw new Error('Pyodide 未初始化');
    this.host.onOutput('system', tf('pyodideInstallingPkg', { name: pkg }));
    try {
      await this.pyodide.loadPackage(pkg);
      this.host.onOutput('system', tf('pyodideInstalledPkg', { name: pkg }));
      return true;
    } catch (err: any) {
      this.host.onOutput('system', tf('pyodideInstallFail', { name: pkg, err: err?.message || err }));
      return false;
    }
  }
}

/** 工作区树 → 待写入文件列表 */
export function flattenWorkspace(items: FSItem[]): WorkspaceFile[] {
  const files: WorkspaceFile[] = [];
  const walk = (list: FSItem[]) => {
    for (const item of list) {
      if (item.isFolder) {
        if (item.children) walk(item.children);
      } else {
        files.push({ path: item.path, content: item.content || '' });
      }
    }
  };
  walk(items);
  return files;
}
