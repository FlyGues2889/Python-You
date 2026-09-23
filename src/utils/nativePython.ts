// 原生 Python 引擎适配层：与 PythonRunnerService 对外行为保持一致，
// 通过 nativeApi 驱动本机 Python 子进程，输出统一转成 ConsoleOutput。
import { ref } from 'vue';
import { nativeApi, type PythonVersion } from './native';
import { t, tf } from './i18n';
import { isInstallProgressLine, parseInstallProgress } from './installProgress';
import type { ConsoleOutput, FSItem } from '../types';
import { uid } from './id';

type Session = 'run' | 'repl' | 'pip';

const now = () => new Date().toLocaleTimeString();

// 过滤 REPL 会话中 Python 打印的 >>> / ... 提示符
function cleanReplLine(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || trimmed === '>>>' || trimmed === '...') return '';
  return text.replace(/^\s*(>>>|\.\.\.)\s*/, '');
}

class NativePythonRunner {
  private detected: boolean | null = null;
  private pythonAvailable = false;
  private pythonVersion = '';
  private listenerRegistered = false;
  private listeners: Record<Session, ((kind: string, text: string) => void) | null> = {
    run: null,
    repl: null,
    pip: null,
  };
  private replStarted = false;
  private tempWorkspacePath: string | null = null;

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
      if (handler) handler(e.kind, e.text);
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
  ): Promise<{ success: boolean; durationMs: number }> {
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
      this.listeners[session] = (kind, text) => {
        if (kind === 'stdout') {
          onOutput({ id: uid(), type: 'stdout', text: text + '\n', timestamp: now() });
        } else if (kind === 'stderr') {
          onOutput({ id: uid(), type: 'stderr', text: text + '\n', timestamp: now() });
        } else if (kind === 'done') {
          this.listeners[session] = null;
          const duration = Math.round(performance.now() - startTime);
          onOutput({
            id: uid(),
            type: 'system',
            text: tf('processExited', { code: text, duration }),
            timestamp: now(),
          });
          resolve({ success: text === '0', durationMs: duration });
        } else if (kind === 'error') {
          this.listeners[session] = null;
          onOutput({ id: uid(), type: 'error', text, timestamp: now() });
          resolve({ success: false, durationMs: Math.round(performance.now() - startTime) });
        }
      };
      try {
        const cwd = await this.resolveCwd(workspaceFiles, nativeRoot);
        await nativeApi.runPython(code, cwd);
      } catch (err: any) {
        this.listeners[session] = null;
        onOutput({
          id: uid(),
          type: 'error',
          text: err?.message || String(err),
          timestamp: now(),
        });
        resolve({ success: false, durationMs: Math.round(performance.now() - startTime) });
      }
    });
  }

  private forwardRepl(kind: string, text: string, onOutput: (out: ConsoleOutput) => void) {
    if (kind === 'stdout') {
      const cleaned = cleanReplLine(text);
      if (cleaned) onOutput({ id: uid(), type: 'stdout', text: cleaned + '\n', timestamp: now() });
    } else if (kind === 'stderr') {
      onOutput({ id: uid(), type: 'stderr', text: text + '\n', timestamp: now() });
    } else if (kind === 'done') {
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
    onOutput({ id: uid(), type: 'input', text: `>>> ${statement}`, timestamp: now() });
    await this.ensureListener();

    // REPL 会话是持久的，但每条语句传入的 onOutput 回调可能不同，这里始终更新
    this.listeners[session] = (kind, text) => this.forwardRepl(kind, text, onOutput);

    if (!this.replStarted) {
      try {
        await nativeApi.replStart(nativeRoot);
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
    onProgress?: (progress: number | null) => void
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
          onOutput({
            id: uid(),
            type: 'system',
            text: ok ? tf('pipInstalledOk', { name: label }) : tf('pipInstallFailed', { name: label, code: text }),
            timestamp: now(),
          });
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

  async installedPackages(): Promise<Set<string> | null> {
    if (this.pipListCache) return this.pipListCache;
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
    this.replStarted = false;
  }
}

export const nativePython = new NativePythonRunner();
