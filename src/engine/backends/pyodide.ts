// src/engine/backends/pyodide.ts —— Pyodide 后端：持有 Worker 生命周期与当前操作句柄。
// 从 pythonRunner.ts 搬出；能力为 worker-reset 式中断（终止 Worker 才能停下死循环，代价是会话重置）。
// 需要 stdin 时点亮编排层的 stdinWaiting/stdinPrompt（由构造注入），input 经 requestInput 回传。
import { type Ref } from 'vue';
import type { ConsoleOutput, FSItem, RunResult } from '../../types';
import type { BackendCapabilities, ExecutionBackend } from '../types';
import { t, tf } from '../../utils/i18n';
import { uid } from '../../utils/id';
import { emitError } from '../../utils/errorSummary';
import { flattenWorkspace } from '../../utils/pyodideEngine';
import type { WorkerRequest, WorkerResponse } from '../../utils/pyodideWorker';

const now = () => new Date().toLocaleTimeString();

const PYODIDE_CAPABILITIES: BackendCapabilities = {
  streaming: true,
  images: true,
  stdin: true,
  // REPL 内的 input() 仍不支持（pyodideEngine 的 repl() 遇到输入请求会明示
  // pyodideReplInputUnsupported 并返回 null）——能力描述不能报成支持
  replStdin: false,
  interrupt: 'worker-reset',
  valueEcho: 'string',
};

export class PyodideBackend implements ExecutionBackend {
  readonly id = 'pyodide' as const;
  readonly capabilities: BackendCapabilities = PYODIDE_CAPABILITIES;

  // Pyodide 跑在 Web Worker 里（主线程不阻塞）：这里只持有 Worker 与当前操作句柄
  private worker: Worker | null = null;
  private workerReady = false;
  private workerLoading = false;
  private initResolve: ((ok: boolean) => void) | null = null;
  private initTimer: ReturnType<typeof setTimeout> | null = null;
  private lastInitError = '';
  private currentOp: {
    onOutput: (out: ConsoleOutput) => void;
    resolve: (result: { success: boolean; value?: string | null }) => void;
  } | null = null;

  // 加载超时：桌面端可能无网络，避免"Connecting to Pyodide..."无限卡死无提示
  private static readonly PYODIDE_TIMEOUT_MS = 15000;

  constructor(
    private readonly stdinWaiting: Ref<boolean>,
    private readonly stdinPrompt: Ref<string>
  ) {}

  get ready(): boolean {
    return this.workerReady;
  }

  get loading(): boolean {
    return this.workerLoading;
  }

  get lastError(): string {
    return this.lastInitError;
  }

  available(): Promise<boolean> {
    return Promise.resolve(this.workerReady);
  }

  // ---- Worker 生命周期 ----

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('../../utils/pyodideWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.handleWorkerMessage(event.data);
    worker.onerror = (event) => {
      const text = event.message || t('pyodideCdnUnavailable');
      if (this.currentOp) {
        emitError(this.currentOp.onOutput, text);
        this.currentOp.resolve({ success: false });
        this.currentOp = null;
      }
      this.lastInitError = text;
      this.terminateWorker();
    };
    this.worker = worker;
    return worker;
  }

  private terminateWorker() {
    this.worker?.terminate();
    this.worker = null;
    this.workerReady = false;
    this.workerLoading = false;
  }

  private clearInitTimer() {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
    }
  }

  private failInit(text: string) {
    this.lastInitError = text;
    this.clearInitTimer();
    this.workerLoading = false;
    this.initResolve?.(false);
    this.initResolve = null;
    this.terminateWorker();
  }

  private handleWorkerMessage(msg: WorkerResponse) {
    switch (msg.type) {
      case 'ready':
        this.workerReady = true;
        this.workerLoading = false;
        this.clearInitTimer();
        this.initResolve?.(true);
        this.initResolve = null;
        break;
      case 'init-error':
        this.failInit(msg.text);
        break;
      case 'stdout':
      case 'stderr':
      case 'system':
        this.currentOp?.onOutput({ id: uid(), type: msg.type, text: msg.text, partial: msg.partial, timestamp: now() });
        break;
      case 'error':
        if (this.currentOp) emitError(this.currentOp.onOutput, msg.text);
        break;
      case 'image':
        this.currentOp?.onOutput({ id: uid(), type: 'stdout', text: '', image: msg.dataUrl, timestamp: now() });
        break;
      case 'need-input': {
        // 不再弹系统 prompt：点亮终端底部输入框，用户回车后由 requestInput 回传 worker
        this.stdinWaiting.value = true;
        this.stdinPrompt.value = msg.prompt || '';
        break;
      }
      case 'done':
        this.currentOp?.resolve({ success: msg.success, value: msg.value ?? null });
        this.currentOp = null;
        break;
    }
  }

  private runInWorker(
    message: WorkerRequest,
    onOutput: (out: ConsoleOutput) => void
  ): Promise<{ success: boolean; value?: string | null }> {
    return new Promise((resolve) => {
      if (!this.worker) {
        resolve({ success: false });
        return;
      }
      this.currentOp = { onOutput, resolve };
      this.worker.postMessage(message);
    });
  }

  init(onOutput?: (out: ConsoleOutput) => void): Promise<boolean> {
    if (this.workerReady) return Promise.resolve(true);
    if (this.workerLoading) return Promise.resolve(false);

    this.workerLoading = true;
    this.lastInitError = '';

    onOutput?.({
      id: uid(),
      type: 'system',
      text: t('pyodideLoading'),
      timestamp: now()
    });

    const worker = this.ensureWorker();
    return new Promise<boolean>((resolve) => {
      this.initResolve = resolve;
      this.initTimer = setTimeout(
        () => this.failInit(t('pyodideInitTimeout')),
        PyodideBackend.PYODIDE_TIMEOUT_MS
      );
      worker.postMessage({ type: 'init' } as WorkerRequest);
    });
  }

  syncFileSystem(items: FSItem[]) {
    if (!this.workerReady || !this.worker) return;
    this.worker.postMessage({ type: 'sync-fs', files: flattenWorkspace(items) } as WorkerRequest);
  }

  // ---- 执行契约（帧的空白行与耗时横幅是 Pyodide 路径既有语义，保持迁移前一致） ----

  async runScript(code: string, workspaceFiles: FSItem[], onOutput: (out: ConsoleOutput) => void): Promise<RunResult> {
    const startTime = performance.now();
    onOutput({
      id: uid(),
      type: 'stdout',
      text: '\n',
      timestamp: now()
    });

    const result = await this.runInWorker(
      { type: 'run', code, files: flattenWorkspace(workspaceFiles) } as WorkerRequest,
      onOutput
    );
    const durationMs = Math.round(performance.now() - startTime);

    onOutput({
      id: uid(),
      type: 'stdout',
      text: '\n',
      timestamp: now()
    });

    // 失败时的错误摘要由 Worker 的 error 消息经 emitError 输出（FR-4.5）
    if (result.success) {
      onOutput({
        id: uid(),
        type: 'system',
        text: tf('processFinishedCode', { duration: durationMs }),
        timestamp: now()
      });
    }

    // Pyodide 的 done 只带 success：失败类别（canceled/exception）由编排层按上下文统一归类
    return { success: result.success, durationMs };
  }

  async runStatement(statement: string, onOutput: (out: ConsoleOutput) => void): Promise<unknown> {
    const result = await this.runInWorker({ type: 'repl', statement } as WorkerRequest, onOutput);
    if (result.value) {
      onOutput({
        id: uid(),
        type: 'stdout',
        text: result.value,
        timestamp: now()
      });
    }
    return result.value ?? undefined;
  }

  requestInput(line: string | null): void {
    this.worker?.postMessage({ type: 'input', value: line } as WorkerRequest);
  }

  async loadPackage(pkgName: string, onOutput?: (out: ConsoleOutput) => void): Promise<boolean> {
    // 安装消息由 Worker 内的引擎产出（无进度回调，指示器保持不确定态）
    const result = await this.runInWorker(
      { type: 'install', pkg: pkgName } as WorkerRequest,
      onOutput ?? (() => { })
    );
    return result.success;
  }

  uninstall(pkgName: string, onOutput?: (out: ConsoleOutput) => void): Promise<'done' | 'list-only' | 'failed'> {
    // Pyodide 无法真实卸载：只能移出应用记录（FR-5.4）
    onOutput?.({
      id: uid(),
      type: 'system',
      text: tf('pkgUninstalledListOnly', { name: pkgName }),
      timestamp: now()
    });
    return Promise.resolve('list-only');
  }

  listInstalled(): Promise<Set<string> | null> {
    return Promise.resolve(null);
  }

  async stop(): Promise<void> {
    if (this.worker && this.currentOp) {
      const op = this.currentOp;
      this.currentOp = null;
      this.terminateWorker();
      op.onOutput({ id: uid(), type: 'system', text: t('pyodideStopped'), timestamp: now() });
      op.resolve({ success: false });
    }
  }
}
