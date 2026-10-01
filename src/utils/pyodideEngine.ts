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
  onOutput(kind: 'stdout' | 'stderr' | 'system', text: string, partial?: boolean): void;
  /** 请求用户输入（promptText 为 Python 侧 input() 的提示语，可能为空）；返回 null 表示用户取消 */
  requestInput(promptText: string): Promise<string | null>;
  /** matplotlib 图表渲染完成：data URL（PNG），由终端输出区显示 */
  onImage?(dataUrl: string): void;
}

const INPUT_MARKER = 'PYSTUDIO_INPUT_REQUEST';

// 图片管线失败时上报给终端的诊断抬头（i18n.ts 不在本文件范围内，就近内联，与 t() 的中文文案风格一致）
const IMAGE_CAPTURE_FAIL_PREFIX = '[ERROR] 图片采集失败：';
const BACKEND_PREPARE_FAIL_PREFIX = '[ERROR] 绘图后端准备失败：';

/** 取错误信息的最后一行（Pyodide 抛的 PythonError.message 是整段 traceback） */
function errorTail(err: unknown): string {
  const text = String((err as any)?.message || err);
  const lines = text.split('\n').filter((line) => line.trim());
  return lines.length ? lines[lines.length - 1].trim() : text;
}

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
    # 提示语只记下来交给宿主终端显示（它会在请求输入的那一刻打印出来，光标停在同一行）；
    # 这里不打印：重放时会在缓冲区里重复一次，而且那样提示语会晚于用户输入才出现
    __py_set_prompt(str(prompt))
    if not __py_has_input():
        raise _PyStudioInputRequest('${INPUT_MARKER}')
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

def __py_prepare_matplotlib():
    # 每次跑用户代码前调用：网页端 matplotlib 的默认后端（webagg / backend_pyodide）要宿主提供
    # globalThis.mpl，plt.show() 会直接抛错。切到 Agg（无宿主依赖，图由 __py_capture_figures 采集）。
    # 这里先 import pyplot 再切，是因为 pyplot 导入过程中就会定下后端；未安装 matplotlib 时静默返回。
    try:
        import matplotlib.pyplot as _plt
    except ModuleNotFoundError:
        return
    import matplotlib as _mpl
    if _mpl.get_backend().lower() != 'agg':
        _mpl.use('Agg')

    def _py_show(*_args, **_kwargs):
        # Agg 没有窗口可显示，真 show() 只会往 stderr 打一条 UserWarning；本机引擎也是把
        # show() 变成空操作，图仍在本次运行结束时统一出图
        pass

    _plt.show = _py_show

def __py_capture_figures():
    # 采集所有未关闭的 figure，返回 JSON：{'images': [PNG base64...], 'errors': [失败原因...]}
    # 没装 matplotlib（用户代码没画过图）时返回空结果，不产生任何输出
    import json as _json
    try:
        import matplotlib.pyplot as _plt
    except ModuleNotFoundError:
        return _json.dumps({'images': [], 'errors': []})
    import base64 as _b64
    import io as _io
    _images = []
    _errors = []
    for _num in list(_plt.get_fignums()):
        try:
            _plt.figure(_num)
            _buf = _io.BytesIO()
            try:
                _plt.savefig(_buf, format='png', bbox_inches='tight', dpi=100)
                _images.append(_b64.b64encode(_buf.getvalue()).decode('ascii'))
            finally:
                _buf.close()
        except Exception as _exc:
            # 单张图失败不影响其余图；失败的图保持打开，下次运行会重试并再次上报
            _errors.append('#%d: %s: %s' % (_num, type(_exc).__name__, _exc))
    if not _errors:
        # 与既有行为一致：全部采集成功才 close('all')
        _plt.close('all')
    return _json.dumps({'images': _images, 'errors': _errors})
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
    // raw 逐字符回调 + 自己按行缓冲：batched 是「遇到换行才回调」，
    // input() 的提示串（print(..., end='') 后 flush）要等用户回车才会出现，交互顺序就反了
    pyodide.setStdout({ raw: (code: number) => this.pushRaw('stdout', code) });
    pyodide.setStderr({ raw: (code: number) => this.pushRaw('stderr', code) });
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

  private emit(kind: 'stdout' | 'stderr', text: string, partial = false) {
    if (this.suppressRemaining > 0) {
      this.suppressRemaining--;
      return;
    }
    this.streamedChunks++;
    this.host.onOutput(kind, text, partial);
  }

  // 逐字节回调 → 按行缓冲：遇到换行立刻发，未结束的行短延时后按 partial 发
  // （input() 的提示串没有换行，必须立刻可见，否则会晚于用户输入出现）
  private outBytes: Record<'stdout' | 'stderr', number[]> = { stdout: [], stderr: [] };
  private decoders: Record<'stdout' | 'stderr', TextDecoder> = {
    stdout: new TextDecoder('utf-8'),
    stderr: new TextDecoder('utf-8'),
  };
  private outTimer: ReturnType<typeof setTimeout> | null = null;

  private pushRaw(kind: 'stdout' | 'stderr', code: number) {
    // raw 回调给的是 UTF-8 字节，不是 UTF-16 码元：逐字节攒起来统一解码，
    // 否则中文会被按 Latin-1 拼错（“第二行”变成“ç¬¬äºè¡”）
    const byte = code & 0xff;
    this.outBytes[kind].push(byte);
    if (byte === 0x0a) {
      this.flushStream(kind, false);
      return;
    }
    if (this.outTimer) return;
    this.outTimer = setTimeout(() => {
      this.outTimer = null;
      this.flushStream('stdout', true);
      this.flushStream('stderr', true);
    }, 30);
  }

  private flushStream(kind: 'stdout' | 'stderr', partial: boolean) {
    const bytes = this.outBytes[kind];
    if (!bytes.length) return;
    this.outBytes[kind] = [];
    // partial 时保留跨刷新的半个多字节字符，等下一批字节补齐
    const text = this.decoders[kind].decode(Uint8Array.from(bytes), { stream: partial });
    if (text) {
      this.emit(kind, text, partial);
    }
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
    this.prepareMatplotlib();
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
        // 请求输入的同时把提示串按「未结束的行」发出去：真实终端里程序打印提示后
        // 光标就停在同一行等输入，这里输入行会接在这段文本后面（不重复，重放时 _py_input 不再打印）
        if (this.pendingPrompt) {
          this.host.onOutput('stdout', this.pendingPrompt, true);
        }
        const value = await this.host.requestInput(this.pendingPrompt);
        if (value === null) {
          await this.captureFigures();
          this.host.onOutput('system', t('pyodideInputCanceled'));
          return false;
        }
        this.capturedInputs.push(value);
        // 伪 tty 回显：用户输入接在提示串后面并结束该行（真实终端由 tty 完成）
        this.host.onOutput('stdout', value + '\n');
      }
    }
    throw new Error(t('pyodideInputTooMany'));
  }

  /** 用户代码执行前：把 matplotlib 定成 Agg 后端（否则网页端 plt.show() 直接抛错，见 __py_prepare_matplotlib） */
  private prepareMatplotlib() {
    if (!this.pyodide) return;
    try {
      this.pyodide.runPython('__py_prepare_matplotlib()');
    } catch (err) {
      // 这里失败不吞：后端没切过去的话用户代码的 plt.show() 会接着报错，先给出原因
      this.host.onOutput('system', BACKEND_PREPARE_FAIL_PREFIX + errorTail(err));
    }
  }

  /** 跑完后把所有未关闭的 matplotlib figure 存成 PNG data URL 推给宿主终端 */
  private async captureFigures(): Promise<void> {
    if (!this.pyodide) return;
    let payload: { images?: string[]; errors?: string[] };
    try {
      // 采集在 Python 侧完成（BytesIO / savefig 都走 Python 调用），只把结果带回来
      payload = JSON.parse(String(this.pyodide.runPython('__py_capture_figures()')));
    } catch (err) {
      this.host.onOutput('system', IMAGE_CAPTURE_FAIL_PREFIX + errorTail(err));
      return;
    }
    for (const image of payload.images || []) {
      this.host.onImage?.('data:image/png;base64,' + image);
    }
    for (const reason of payload.errors || []) {
      this.host.onOutput('system', IMAGE_CAPTURE_FAIL_PREFIX + reason);
    }
  }

  /** 执行 REPL 单条语句；不支持 input()（重放会重复执行已产生的副作用） */
  async repl(statement: string): Promise<string | null> {
    if (!this.pyodide) throw new Error('Pyodide 未初始化');
    this.prepareMatplotlib();
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
