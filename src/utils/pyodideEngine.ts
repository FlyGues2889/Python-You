// Pyodide（WASM）执行引擎：运行在 Web Worker 内，主线程不被阻塞（FR-4.2）。
// input() 走「中断 → 主线程弹窗 → 携带已捕获输入重放」，重放时丢弃已显示过的输出前缀。
import { t, tf } from './i18n';
import type { FSItem } from '../types';
// 应用自带的中文字体（与界面同一份文件，浏览器多半已缓存）
import cjkFontUrl from '../assets/fonts/HarmonyOS_Sans_SC_Regular.ttf?url';

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
  /** matplotlib 图表渲染完成：data URL（PNG），由终端输出区显示 */
  onImage?(dataUrl: string): void;
}

const INPUT_MARKER = 'PYSTUDIO_INPUT_REQUEST';

// Pyodide 的虚拟文件系统里没有任何中文字体（findSystemFonts() 返回空，emscripten 平台也不扫
// ~/.fonts），所以图上中文会画成方框。这里把应用自带的中文字体写进 FS，并装一个 __import__ 钩子：
// matplotlib.pyplot 导入完成的瞬间注册字体并设 rcParams —— 必须早于用户画图（文字对象在创建时
// 就锁定字体），又不能在 matplotlib 自己还在初始化时动手（会撞上循环导入）。
const CJK_FONT_PATH = '/home/pyodide/.fonts/HarmonyOS_Sans_SC_Regular.ttf';
const CJK_FONT_NAME = 'HarmonyOS Sans SC';
const CJK_HOOK = `
import builtins as _py_builtins
_py_orig_import = _py_builtins.__import__

def _py_import_with_cjk(name, *args, **kwargs):
    mod = _py_orig_import(name, *args, **kwargs)
    if name == 'matplotlib.pyplot' and not globals().get('_py_cjk_ready'):
        globals()['_py_cjk_ready'] = True
        try:
            from matplotlib import font_manager
            import matplotlib
            font_manager.fontManager.addfont('${CJK_FONT_PATH}')
            matplotlib.rcParams['font.sans-serif'] = ['${CJK_FONT_NAME}'] + [
                f for f in matplotlib.rcParams['font.sans-serif'] if f != '${CJK_FONT_NAME}'
            ]
            matplotlib.rcParams['axes.unicode_minus'] = False
        except Exception:
            pass
    return mod

_py_builtins.__import__ = _py_import_with_cjk
`;
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
    await this.installCjkFont(pyodide);
    this.pyodide = pyodide;
  }

  /** 把中文字体写进 Pyodide 的 FS 并装导入钩子；拿不到字体就跳过（图上的中文会是方框，不影响运行） */
  private async installCjkFont(pyodide: any): Promise<void> {
    try {
      const res = await fetch(cjkFontUrl);
      if (!res.ok) return;
      const bytes = new Uint8Array(await res.arrayBuffer());
      pyodide.FS.mkdirTree('/home/pyodide/.fonts');
      pyodide.FS.writeFile(CJK_FONT_PATH, bytes);
      pyodide.runPython(CJK_HOOK);
    } catch {
      /* 忽略：没有中文字体只是图上中文显示成方框 */
    }
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
        await this.captureFigures();
        return true;
      } catch (err: any) {
        const message = String(err?.message || err);
        if (!message.includes(INPUT_MARKER)) {
          // 抛错也要把已经画好的图发出去：本机引擎那边靠 atexit 兜底，这里对齐
          await this.captureFigures();
          throw err;
        }
        const value = await this.host.requestInput(this.pendingPrompt);
        if (value === null) {
          await this.captureFigures();
          this.host.onOutput('system', t('pyodideInputCanceled'));
          return false;
        }
        this.capturedInputs.push(value);
      }
    }
    throw new Error(t('pyodideInputTooMany'));
  }

  /** 跑完后把所有未关闭的 matplotlib figure 存成 PNG data URL 推给宿主终端 */
  private async captureFigures(): Promise<void> {
    if (!this.pyodide) return;
    try {
      const matplotlib = this.pyodide.pyimport('matplotlib');
      matplotlib.use('Agg');
      const plt = this.pyodide.pyimport('matplotlib.pyplot');
      const ioMod = this.pyodide.pyimport('io');
      const b64 = this.pyodide.pyimport('base64');
      const nums = plt.get_fignums().toJs();
      const list: number[] = Array.from(nums);
      for (const n of list) {
        plt.figure(n);
        const buf = ioMod.BytesIO.new();
        plt.savefig(buf, { format: 'png', bbox_inches: 'tight', dpi: 100 });
        const raw = buf.getvalue();
        const encoded = b64.b64encode(raw).decode();
        this.host.onImage?.('data:image/png;base64,' + String(encoded));
        buf.delete?.();
      }
      if (list.length) plt.close('all');
    } catch {
      /* matplotlib 未安装或无 figure：忽略 */
    }
  }

  /** 执行 REPL 单条语句；不支持 input()（重放会重复执行已产生的副作用） */
  async repl(statement: string): Promise<string | null> {
    if (!this.pyodide) throw new Error('Pyodide 未初始化');
    this.pendingInputs = [];
    this.streamedChunks = 0;
    this.suppressRemaining = 0;
    try {
      const result = await this.pyodide.runPythonAsync(statement);
      // REPL 里画完图当场出图：run() 只在整段脚本结束后收集，交互式一条条来的时候等不到
      await this.captureFigures();
      return result === undefined ? null : String(result);
    } catch (err: any) {
      const message = String(err?.message || err);
      if (message.includes(INPUT_MARKER)) {
        this.host.onOutput('system', t('pyodideReplInputUnsupported'));
        return null;
      }
      await this.captureFigures();
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
