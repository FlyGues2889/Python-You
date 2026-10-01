// 原生 Python 引擎适配层：与 PythonRunnerService 对外行为保持一致，
// 通过 nativeApi 驱动本机 Python 子进程，输出统一转成 ConsoleOutput。
import { ref } from 'vue';
import { nativeApi, type PythonVersion } from './native';
import { t, tf } from './i18n';
import { isInstallProgressLine, parseInstallProgress } from './installProgress';
import { createStderrSink, emitError } from './errorSummary';
import { createLineAssembler } from './consoleLines';
import { extractImportsFromCode } from './packageUtils';
import type { ConsoleOutput, FSItem, RunResult } from '../types';
import type { BackendCapabilities } from '../engine/types';
import { uid } from './id';

type Session = 'run' | 'repl' | 'pip';

const now = () => new Date().toLocaleTimeString();

/**
 * 代码（含工作区里的本地模块）是否用到 matplotlib —— 决定要不要挂绘图钩子。
 * 钩子里 `import matplotlib` 实测约 +670ms（空脚本 81ms → 752ms），而绝大多数运行根本不画图。
 * 只按当前文件与前缀模块名判断会漏掉「main.py → 本地模块 → matplotlib」这种间接引用，
 * 所以对工作区里的 .py 一起扫（内容都在内存里，代价可忽略）。
 */
const needsPlotHook = (code: string, files: FSItem[]): boolean => {
  // 不 import matplotlib 也可能画图（pandas 的 df.plot()、seaborn 等），文本上出现绘图调用
  // 就挂钩子：漏钩子的代价是「图不出来」，比多花 670ms 严重。
  const PLOT_CALL = /\.plot\(|plt\.|pyplot|savefig|\.bar\(|\.scatter\(|\.hist\(/;
  const usesPlot = (src: string) =>
    PLOT_CALL.test(src) ||
    extractImportsFromCode(src).some((m) => m === 'matplotlib' || m === 'pylab');
  if (usesPlot(code)) return true;
  const walk = (list: FSItem[]): boolean =>
    list.some((item) =>
      item.isFolder ? !!item.children && walk(item.children) : item.name.endsWith('.py') && usesPlot(item.content || '')
    );
  return walk(files);
};

// matplotlib 前置钩子：切 Agg 无头后端，把图捕获成 PNG（base64 单行打印），
// 由下面的 stdout 行解析转成终端内图片。未安装 matplotlib 时静默跳过。
//
// 两条触发路径：
//   1. plt.show() —— 被替换成「出图并关闭」，与平时调用习惯一致；
//   2. 进程退出（正常结束或异常）—— 兜底把还开着的图都出掉。
// 教程里大量示例只画图不 show（还有用 savefig 存文件的），只靠 show 会漏掉一大半。
const MATPLOTLIB_HOOK = `
import base64 as _py_b64, io as _py_io, atexit as _py_atexit
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as _py_plt

    def _py_emit_figures():
        # 把当前所有未关闭的图存成 PNG 逐行打印；close 掉避免重复出图
        try:
            for _n in _py_plt.get_fignums():
                _buf = _py_io.BytesIO()
                _py_plt.figure(_n).savefig(_buf, format='png', bbox_inches='tight', dpi=100)
                print('@@PYSTUDIO_IMG@@' + _py_b64.b64encode(_buf.getvalue()).decode())
        except Exception:
            pass
        finally:
            _py_plt.close('all')

    def _py_use_cjk_font():
        # matplotlib 默认字体（DejaVu）没有中文字形，图上中文会画成方框。
        # 从系统已装字体里按优先级挑一个中文字体接在最前面；一个都没有时如实提示。
        try:
            from matplotlib import font_manager as _py_fm
            _py_wanted = [
                'Microsoft YaHei', 'Microsoft YaHei UI', 'SimHei', 'DengXian', 'SimSun',
                'PingFang SC', 'Hiragino Sans GB', 'Heiti SC', 'STHeiti',
                'Source Han Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Zen Hei', 'WenQuanYi Micro Hei'
            ]
            _py_have = {_f.name for _f in _py_fm.fontManager.ttflist}
            _py_picked = [_n for _n in _py_wanted if _n in _py_have]
            if _py_picked:
                _py_plt.rcParams['font.sans-serif'] = _py_picked + list(_py_plt.rcParams['font.sans-serif'])
            else:
                print('[提示] 系统里没有找到中文字体，图上的中文会显示成方框')
            # 负号跟着中文字体容易变方框，固定用 ASCII 负号
            _py_plt.rcParams['axes.unicode_minus'] = False
        except Exception:
            pass

    _py_use_cjk_font()

    def _py_show(*a, **k):
        _py_emit_figures()

    _py_plt.show = _py_show
    _py_atexit.register(_py_emit_figures)
except Exception:
    pass
`;

const IMG_PREFIX = '@@PYSTUDIO_IMG@@';

/** stdout 的一行若为图片标记，返回 data URL（供终端 <img> 显示），否则返回 null */
const imageFromMarkerLine = (text: string): string | null =>
  text.startsWith(IMG_PREFIX) ? 'data:image/png;base64,' + text.slice(IMG_PREFIX.length) : null;

// REPL 子进程（python -u -i -c，stdin 是管道）把自己的 `>>> ` / `... ` 提示符写到 stderr，
// 且可能被读成 `>`、`>> ` 这样的碎片。仅由 >、. 与空白组成的片段一定是提示符；
// 要求非空——空片段是「这一行到此结束」的信号，丢掉会破坏 stderr 汇流的攒段语义。
export const REPL_PROMPT_FRAGMENT = /^[>.\s]+$/;

// 过滤 REPL 会话中 Python 打印的 >>> / ... 提示符
export function cleanReplLine(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || trimmed === '>>>' || trimmed === '...') return '';
  return text.replace(/^\s*(>>>|\.\.\.)\s*/, '');
}

class NativePythonRunner {
  private detected: boolean | null = null;
  private pythonAvailable = false;
  private pythonVersion = '';
  private listenerRegistered = false;
  private listeners: Record<Session, ((kind: string, text: string, partial?: boolean) => void) | null> = {
    run: null,
    repl: null,
    pip: null,
  };
  private replStarted = false;
  // REPL 的 stderr 汇流（跨行攒 traceback），换会话或换输出回调时重建
  private replStderr: { sink: ReturnType<typeof createStderrSink>; onOutput: (out: ConsoleOutput) => void } | null = null;
  // REPL 的 stdout 行拼装器（跨事件拼「正在写的那一行」）；不发未结束的片段——
  // 子进程的 `>>> ` 提示符正是这种片段，发出来会多出一串 `>`
  private replStdout = createLineAssembler({ emitPartial: false });
  // run 会话的 stdout 拼装器与输出通道：stdin 回显要接进同一条流里
  private runStdout = createLineAssembler();
  private runOutput: ((out: ConsoleOutput) => void) | null = null;

  /** 送出一段 run 会话的 stdout：完整行识别图片标记，未结束的行按 partial 送出 */
  private pushRunStdout(text: string, partial: boolean) {
    const onOutput = this.runOutput;
    if (!onOutput) return;
    const { completeLines, partialText } = this.runStdout.push(text, partial);
    for (const line of completeLines) {
      const image = imageFromMarkerLine(line);
      if (image) onOutput({ id: uid(), type: 'stdout', text: '', image, timestamp: now() });
      else onOutput({ id: uid(), type: 'stdout', text: line + '\n', timestamp: now() });
    }
    if (partialText) {
      onOutput({ id: uid(), type: 'stdout', text: partialText, partial: true, timestamp: now() });
    }
  }

  private resetReplBuffers() {
    this.replStderr?.sink.flush();
    this.replStderr = null;
    this.replStdout = createLineAssembler({ emitPartial: false });
  }
  private tempWorkspacePath: string | null = null;
  // run 会话是否正在运行：终端底部输入框据此启用（程序可能阻塞在 input()）
  public runActive = ref(false);

  // 能力描述符（ARCHITECTURE §2.4）：本机子进程流式输出、出图、stdin 交互、可杀进程中断、REPL repr 回显
  public readonly capabilities: BackendCapabilities = {
    streaming: true,
    images: true,
    stdin: true,
    replStdin: true,
    interrupt: 'process',
    valueEcho: 'repr',
  };

  public statusLabel = ref(t('engineLabelDefault'));
  // 本机可用的解释器列表（python / python3 / py 及其具体版本），供设置页与版本管理器展示
  public versions = ref<PythonVersion[]>([]);
  // 是否允许使用原生引擎：config.interpreter === 'pyodide' 时由 App.vue 关闭
  public enabled = true;
  // 应用在用户目录生成文件时的提示通道（App 接上 snackbar，告知保存位置）
  public onNotice?: (message: string) => void;

  get supported(): boolean {
    return nativeApi.available();
  }

  // 版本号精简为主版本.次版本（"Python 3.13.14" → "3.13"），按钮/状态标签用
  private shortVersion(v: string): string {
    const m = v.match(/(\d+\.\d+)/);
    return m ? m[1] : v;
  }

  async detect(): Promise<{ available: boolean; version: string }> {
    if (this.detected !== null) {
      return { available: this.pythonAvailable, version: this.pythonVersion };
    }
    try {
      const info = await nativeApi.detectPython();
      this.pythonAvailable = !!info.available;
      this.pythonVersion = info.version || '';
      this.versions.value = info.versions || [];
    } catch {
      this.pythonAvailable = false;
    }
    this.detected = true;
    this.statusLabel.value = this.pythonAvailable
      ? tf('engineLocal', { version: this.shortVersion(this.pythonVersion) })
      : t('engineLabelDefault');
    return { available: this.pythonAvailable, version: this.pythonVersion };
  }

  // 应用解释器选择（设置页 / 编辑器版本管理器）：
  // - 'pyodide'：禁用原生引擎（回退 Pyodide），状态标签固定为 Pyodide
  //   （Rust 检测仍会返回本机版本，不能用 detect 结果覆盖）
  // - 具体版本 id：通知 Rust 切换，并刷新检测结果与状态标签
  // - 'auto' / 未定义：允许原生引擎，Rust 自动选择第一个可用版本
  async applyInterpreter(id: string | undefined): Promise<void> {
    this.enabled = id !== 'pyodide';
    if (id && id !== 'auto') {
      try {
        await nativeApi.selectPython(id);
      } catch {
        // 选择失败（如解释器已卸载）时保持当前状态
      }
    }
    this.detected = null;
    await this.detect();
    if (id === 'pyodide') {
      this.statusLabel.value = t('engineLabelDefault');
    }
  }

  private async ensureListener() {
    if (this.listenerRegistered) return;
    await nativeApi.onPythonEvent((e) => {
      const handler = this.listeners[e.session as Session];
      // partial 必须一起转发：漏掉它每个片段都会被当成「整行」，
      // 图片标记行的前半段会被识别成一张坏图、后半段当 base64 文本显示出来
      if (handler) handler(e.kind, e.text, e.partial);
    });
    this.listenerRegistered = true;
  }

  // 有本地工作区根目录时直接以它为 cwd；否则把虚拟工作区落盘到临时目录
  private async resolveCwd(workspaceFiles: FSItem[], nativeRoot: string | null): Promise<string | null> {
    if (nativeRoot) return nativeRoot;
    if (this.tempWorkspacePath) return this.tempWorkspacePath;
    const items = workspaceFiles.map((f) => ({
      path: f.path,
      content: f.content || '',
      isFolder: f.isFolder,
    }));
    const path = await nativeApi.materializeWorkspace(items);
    this.tempWorkspacePath = path;
    this.onNotice?.(tf('tempWorkspaceSaved', { path }));
    return path;
  }

  async runCode(
    code: string,
    workspaceFiles: FSItem[],
    onOutput: (out: ConsoleOutput) => void,
    nativeRoot: string | null
  ): Promise<RunResult> {
    // 并发闸门：run 会话单槽，已有在飞时拒绝重入——不能静默覆盖监听器，
    // 否则旧进程的 done("-1") 会被新监听器误判成新运行的失败
    if (this.listeners['run']) {
      return { success: false, busy: true, durationMs: 0, failureKind: 'interrupted' };
    }
    const startTime = performance.now();
    const session: Session = 'run';
    await this.ensureListener();

    onOutput({
      id: uid(),
      type: 'system',
      text: tf('runLocalPython', { version: this.pythonVersion || '' }),
      timestamp: now(),
    });

    return new Promise(async (resolve) => {
      this.runActive.value = true;
      // FR-4.5：stderr 里的 traceback 攒完整段再输出（摘要置顶 + 完整 traceback 折叠），
      // 与 Pyodide 路径同一套行为
      const stderr = createStderrSink(onOutput);
      // 流式片段拼成整行：图片标记行要整行才认，未结束的行按 partial 实时送出
      this.runOutput = onOutput;
      this.runStdout = createLineAssembler();
      this.listeners[session] = (kind, text, partial = false) => {
        if (kind === 'stdout') {
          this.pushRunStdout(text, partial);
        } else if (kind === 'stderr') {
          stderr.push(text, partial);
        } else if (kind === 'done') {
          stderr.flush();
          this.listeners[session] = null;
          this.runActive.value = false;
          const duration = Math.round(performance.now() - startTime);
          onOutput({
            id: uid(),
            type: 'system',
            text: tf('processExited', { code: text, duration }),
            timestamp: now(),
          });
          resolve({ success: text === '0', durationMs: duration, failureKind: text === '0' ? undefined : 'exitCode' });
        } else if (kind === 'error') {
          stderr.flush();
          this.listeners[session] = null;
          this.runActive.value = false;
          emitError(onOutput, text);
          resolve({ success: false, durationMs: Math.round(performance.now() - startTime), failureKind: 'exception' });
        }
      };
      try {
        const cwd = await this.resolveCwd(workspaceFiles, nativeRoot);
        // 不用 matplotlib 就不挂钩子：省掉每次运行约 670ms 的 import 开销
        const hook = needsPlotHook(code, workspaceFiles) ? MATPLOTLIB_HOOK + '\n' : '';
        await nativeApi.runPython(hook + code, cwd);
      } catch (err: any) {
        this.listeners[session] = null;
        this.runActive.value = false;
        onOutput({
          id: uid(),
          type: 'error',
          text: err?.message || String(err),
          timestamp: now(),
        });
        resolve({ success: false, durationMs: Math.round(performance.now() - startTime), failureKind: 'exception' });
      }
    });
  }

  // 终端底部输入框：把一行写入正在运行脚本的 stdin（input() 交互）
  public writeRunInput(line: string): Promise<void> {
    // 伪 tty 回显：用户输入接在未结束的提示串后面并结束该行（真实终端里由 tty 完成这件事）
    this.pushRunStdout(line + '\n', false);
    return nativeApi.runPythonInput(line);
  }

  private forwardRepl(kind: string, text: string, onOutput: (out: ConsoleOutput) => void, partial = false) {
    if (kind === 'stdout') {
      // 只取完整行：REPL 子进程每执行一句都会先打印自己的 `>>> ` / `... ` 提示符（不带换行，
      // 正好以未结束的片段形式到达）。界面上已经有自己的提示符，把片段显示出来会多出一串 `>`；
      // 片段仍留在拼装器里参与拼行，整行到齐后由 cleanReplLine 统一去掉提示符。
      const { completeLines } = this.replStdout.push(text, partial);
      for (const line of completeLines) {
        // 与脚本运行路径共用同一套判定：REPL 里画图也直接出图
        const image = imageFromMarkerLine(line);
        if (image) {
          onOutput({ id: uid(), type: 'stdout', text: '', image, timestamp: now() });
          continue;
        }
        const cleaned = cleanReplLine(line);
        if (cleaned) onOutput({ id: uid(), type: 'stdout', text: cleaned + '\n', timestamp: now() });
      }
    } else if (kind === 'stderr') {
      // 提示符碎片在进汇流之前丢掉：攒进去会变成一串 `>` 的裸输出。
      // 真实 traceback 仍原样交给 sink，由它攒段、出摘要与可折叠详情（FR-4.5）
      if (REPL_PROMPT_FRAGMENT.test(text)) return;
      // FR-4.5：REPL 与脚本运行共用同一套错误摘要（摘要置顶 + traceback 折叠）
      if (!this.replStderr || this.replStderr.onOutput !== onOutput) {
        this.replStderr = { sink: createStderrSink(onOutput), onOutput };
      }
      this.replStderr.sink.push(text, partial);
    } else if (kind === 'done') {
      this.resetReplBuffers();
      this.replStarted = false;
      this.listeners['repl'] = null;
      onOutput({ id: uid(), type: 'system', text: t('replSessionEnded'), timestamp: now() });
    }
  }

  async runREPL(
    statement: string,
    onOutput: (out: ConsoleOutput) => void,
    nativeRoot: string | null
  ): Promise<any> {
    const session: Session = 'repl';
    await this.ensureListener();

    // REPL 会话是持久的，但每条语句传入的 onOutput 回调可能不同，这里始终更新
    this.listeners[session] = (kind, text, partial) => this.forwardRepl(kind, text, onOutput, partial);

    if (!this.replStarted) {
      try {
        // 传入同一个 matplotlib 钩子：REPL 里 plt.show() 也能出图
        await nativeApi.replStart(nativeRoot, MATPLOTLIB_HOOK);
        this.replStarted = true;
      } catch (err: any) {
        this.replStarted = false;
        this.listeners[session] = null;
        onOutput({
          id: uid(),
          type: 'error',
          text: tf('replStartFailed', { err: err?.message || err }),
          timestamp: now(),
        });
        return undefined;
      }
    }
    try {
      await nativeApi.replInput(statement);
    } catch (err: any) {
      onOutput({ id: uid(), type: 'error', text: String(err?.message || err), timestamp: now() });
    }
    return undefined;
  }

  // pip 会话共用：进度片段只喂后台指示器、其余输出进终端，done 事件结算成败
  private runPipSession(
    start: () => Promise<void>,
    label: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void,
    action: 'install' | 'uninstall' = 'install'
  ): Promise<boolean> {
    const session: Session = 'pip';
    return new Promise<boolean>((resolve) => {
      this.listeners[session] = (kind, text) => {
        if (kind === 'stdout' || kind === 'stderr') {
          // FR-5.6：进度条片段只用于后台任务指示器，不进终端（否则每次刷新都是一行）
          if (isInstallProgressLine(text)) {
            onProgress?.(parseInstallProgress(text));
            return;
          }
          // 下载完成进入安装写入阶段：没有百分比数据，切回不确定态
          if (/Installing collected packages/i.test(text)) {
            onProgress?.(null);
          }
          onOutput({
            id: uid(),
            type: kind === 'stdout' ? 'stdout' : 'stderr',
            text: text + '\n',
            timestamp: now(),
          });
        } else if (kind === 'done') {
          this.listeners[session] = null;
          const ok = text === '0';
          const message = action === 'uninstall'
            ? (ok ? tf('pipUninstalledOk', { name: label }) : tf('pipUninstallFailed', { name: label, code: text }))
            : (ok ? tf('pipInstalledOk', { name: label }) : tf('pipInstallFailed', { name: label, code: text }));
          onOutput({ id: uid(), type: 'system', text: message, timestamp: now() });
          this.pipListCache = null;
          resolve(ok);
        }
      };
      start().catch((err: any) => {
        this.listeners[session] = null;
        onOutput({
          id: uid(),
          type: 'error',
          text: tf('pipError', { err: err?.message || err }),
          timestamp: now(),
        });
        resolve(false);
      });
    });
  }

  // 真实卸载扩展包（本机 pip）
  async uninstallPackage(
    pkgName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    await this.ensureListener();
    return this.runPipSession(() => nativeApi.pipUninstall(pkgName), pkgName, onOutput, onProgress, 'uninstall');
  }

  async loadPackage(
    pkgName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    await this.ensureListener();
    return this.runPipSession(() => nativeApi.pipInstall(pkgName), pkgName, onOutput, onProgress);
  }

  // 从本地文件安装（wheel / sdist），与在线安装共用 pip 会话与输出通道
  async installFromFile(
    filePath: string,
    fileName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    await this.ensureListener();
    return this.runPipSession(() => nativeApi.pipInstallFile(filePath), fileName, onOutput, onProgress);
  }

  // 已安装包名（小写）集合：会话内缓存，安装后失效；读取失败返回 null（调用方跳过依赖检查）
  private pipListCache: Set<string> | null = null;

  async installedPackages(force = false): Promise<Set<string> | null> {
    if (!force && this.pipListCache) return this.pipListCache;
    try {
      const names = await nativeApi.pipList();
      this.pipListCache = new Set(names.map((name) => name.toLowerCase()));
      return this.pipListCache;
    } catch (e) {
      return null;
    }
  }

  // 添加自定义解释器：探测成功后并入可选列表
  async addInterpreter(path: string): Promise<PythonVersion> {
    const entry = await nativeApi.addInterpreter(path);
    if (!this.versions.value.some((v) => v.id === entry.id)) {
      this.versions.value = [...this.versions.value, entry];
    }
    return entry;
  }

  // 杀掉当前子进程。注意：不要清除 run 监听器，让 "done" 事件正常收尾 Promise。
  async stop(): Promise<void> {
    try {
      await nativeApi.stopPython();
    } catch {
      // ignore
    }
    this.resetReplBuffers();
    this.replStarted = false;
    this.runActive.value = false;
  }
}

export const nativePython = new NativePythonRunner();
