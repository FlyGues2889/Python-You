import { ref } from 'vue';
import { ConsoleOutput, FSItem } from '../types';
import { nativePython } from './nativePython';
import { t, tf } from './i18n';
import { uid } from './id';
import { emitError } from './errorSummary';
import { flattenWorkspace } from './pyodideEngine';
import { extractImportsFromCode, collectLocalModules, getStoredInstalledPackages } from './packageUtils';
import { requestInstallConfirm } from './dependencyGate';
import { addBackendTask, finishBackendTask } from './backendTasks';
import type { WorkerRequest, WorkerResponse } from './pyodideWorker';

const now = () => new Date().toLocaleTimeString();

class PythonRunnerService {
  private demoScope: Record<string, any> = {};
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

  // 终端内 stdin：Pyodide 程序请求输入时置位，由 TerminalPanel 底部输入框回传
  public stdinWaiting = ref(false);
  public stdinPrompt = ref('');

  // 加载超时：桌面端可能无网络，避免“Connecting to Pyodide...”无限卡死无提示
  private static readonly PYODIDE_TIMEOUT_MS = 15000;

  // 当前原生工作区根目录（由 App 在打开本地文件夹时设置），用于给本机 Python 指定 cwd
  public workspaceRoot: string | null = null;

  // 引擎加载状态回调（标题栏状态指示器用）：Pyodide 开始加载时 true，完成/失败后 false
  public onEngineLoading?: (loading: boolean) => void;

  // ---- Pyodide Worker 生命周期 ----

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'module' });
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
        this.currentOp?.onOutput({ id: uid(), type: msg.type, text: msg.text, timestamp: now() });
        break;
      case 'error':
        if (this.currentOp) emitError(this.currentOp.onOutput, msg.text);
        break;
      case 'image':
        this.currentOp?.onOutput({ id: uid(), type: 'stdout', text: '', image: msg.dataUrl, timestamp: now() });
        break;
      case 'need-input': {
        // 不再弹系统 prompt：点亮终端底部输入框，用户回车后由 submitRunInput 回传 worker
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

  public async initPyodide(onOutput?: (out: ConsoleOutput) => void): Promise<boolean> {
    if (this.workerReady) return true;
    if (this.workerLoading) return false;

    this.workerLoading = true;
    this.onEngineLoading?.(true);
    this.lastInitError = '';

    onOutput?.({
      id: uid(),
      type: 'system',
      text: t('pyodideLoading'),
      timestamp: now()
    });

    const worker = this.ensureWorker();
    const ok = await new Promise<boolean>((resolve) => {
      this.initResolve = resolve;
      this.initTimer = setTimeout(
        () => this.failInit(t('pyodideInitTimeout')),
        PythonRunnerService.PYODIDE_TIMEOUT_MS
      );
      worker.postMessage({ type: 'init' } as WorkerRequest);
    });

    this.onEngineLoading?.(false);
    if (ok) {
      onOutput?.({
        id: uid(),
        type: 'system',
        text: t('pyodideActive'),
        timestamp: now()
      });
      return true;
    }
    onOutput?.({
      id: uid(),
      type: 'system',
      text: tf('pyodideUnavailable', { err: this.lastInitError || t('pyodideCdnUnavailable') }),
      timestamp: now()
    });
    return false;
  }

  public syncFileSystem(items: FSItem[]) {
    if (!this.workerReady || !this.worker) return;
    this.worker.postMessage({ type: 'sync-fs', files: flattenWorkspace(items) } as WorkerRequest);
  }

  public async runCode(
    code: string,
    workspaceFiles: FSItem[],
    onOutput: (out: ConsoleOutput) => void,
    forceDemoMode = false
  ): Promise<{ success: boolean; durationMs: number }> {
    // 运行前依赖检查：代码引用的第三方包缺失时（经用户确认）先自动安装，再执行
    if (!forceDemoMode) await this.ensureImports(code, workspaceFiles, onOutput);

    // 渐进增强：Tauri 环境且本机有 Python 时，优先用真实子进程执行
    if (!forceDemoMode && nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available) {
        return nativePython.runCode(code, workspaceFiles, onOutput, this.workspaceRoot);
      }
    }

    const startTime = performance.now();

    if (!forceDemoMode && !this.workerReady && !this.workerLoading) {
      await this.initPyodide(onOutput);
    }

    if (!forceDemoMode && this.workerReady) {
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

      return { success: result.success, durationMs };
    }

    // Default: Lightweight instant presentation demo mode
    return this.runDemoInterpreter(code, onOutput, startTime);
  }

  public async runREPL(
    statement: string,
    onOutput: (out: ConsoleOutput) => void,
    forceDemoMode = false
  ): Promise<any> {
    if (!forceDemoMode && nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available) {
        return nativePython.runREPL(statement, onOutput, this.workspaceRoot);
      }
    }

    onOutput({
      id: uid(),
      type: 'input',
      text: `>>> ${statement}`,
      timestamp: new Date().toLocaleTimeString()
    });

    if (!forceDemoMode && !this.workerReady && !this.workerLoading) {
      await this.initPyodide(onOutput);
    }

    if (!forceDemoMode && this.workerReady) {
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

    // Demo mode REPL
    return this.runDemoREPL(statement, onOutput);
  }

  private runDemoInterpreter(
    code: string,
    onOutput: (out: ConsoleOutput) => void,
    startTime: number
  ): { success: boolean; durationMs: number } {
    onOutput({
      id: uid(),
      type: 'info',
      text: t('demoModeRunning'),
      timestamp: new Date().toLocaleTimeString()
    });

    const logs: string[] = [];
    // 演示引擎不支持的语句行号（循环/条件/函数定义等）：不再静默跳过，
    // 必须向用户明示「未真实执行」，且不伪造 exit code 0 / 成功（FR-4.6 演示模式诚实性）
    const unsupportedLines: number[] = [];
    const scope: Record<string, any> = {
      math: { pi: Math.PI, e: Math.E, sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, factorial: (n: number) => { let r=1; for(let i=2;i<=n;i++) r*=i; return r; }, gcd: (a: number, b: number) => { return b === 0 ? a : scope.math.gcd(b, a % b); } },
      sys: { version: '3.11.0 (Demo Mode)', platform: 'browser' },
      json: { dumps: (v: any) => JSON.stringify(v, null, 2), loads: (s: string) => JSON.parse(s) },
      random: { randint: (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a },
      len: (obj: any) => obj ? (obj.length ?? Object.keys(obj).length) : 0,
      sum: (arr: number[]) => Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0,
      max: (...args: any[]) => Math.max(...(Array.isArray(args[0]) ? args[0] : args)),
      min: (...args: any[]) => Math.min(...(Array.isArray(args[0]) ? args[0] : args)),
      abs: (x: number) => Math.abs(x),
      range: (a: number, b?: number, step = 1) => {
        const start = b === undefined ? 0 : a;
        const stop = b === undefined ? a : b;
        const res = [];
        for (let i = start; i < stop; i += step) res.push(i);
        return res;
      }
    };

    try {
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        // Simple print(...) handling
        if (line.startsWith('print(') && line.endsWith(')')) {
          const content = line.substring(6, line.length - 1).trim();
          const evaluated = this.evaluatePythonExpression(content, scope);
          logs.push(String(evaluated));
          continue;
        }

        // Variable assignment
        if (line.includes('=') && !line.startsWith('if') && !line.startsWith('while') && !line.includes('==')) {
          const eqIdx = line.indexOf('=');
          const varName = line.substring(0, eqIdx).trim();
          const valExpr = line.substring(eqIdx + 1).trim();
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
            scope[varName] = this.evaluatePythonExpression(valExpr, scope);
            continue;
          }
        }

        // 未支持的语句：记录行号，稍后以警告形式明示，不再静默跳过
        unsupportedLines.push(i + 1);
      }

      onOutput({
        id: uid(),
        type: 'stdout',
        text: '\n',
        timestamp: new Date().toLocaleTimeString()
      });

      if (logs.length > 0) {
        logs.forEach((log) => {
          onOutput({
            id: uid(),
            type: 'stdout',
            text: log,
            timestamp: new Date().toLocaleTimeString()
          });
        });
      }

      const durationMs = Math.round(performance.now() - startTime);

      // 有未支持的语句：明示未真实执行，并返回失败（不伪造成功/exit code 0，
      // 测验判分等依赖 success 的门不会因此误判通过）
      if (unsupportedLines.length > 0) {
        onOutput({
          id: uid(),
          type: 'warning',
          text: tf('demoUnsupportedWarning', {
            count: unsupportedLines.length,
            lines: unsupportedLines.join(', ')
          }),
          timestamp: new Date().toLocaleTimeString()
        });
        return { success: false, durationMs };
      }

      onOutput({
        id: uid(),
        type: 'stdout',
        text: '\n',
        timestamp: new Date().toLocaleTimeString()
      });

      onOutput({
        id: uid(),
        type: 'system',
        text: t('demoExecuted'),
        timestamp: new Date().toLocaleTimeString()
      });

      return { success: true, durationMs };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      emitError(onOutput, err?.message || String(err));
      return { success: false, durationMs };
    }
  }

  private runDemoREPL(statement: string, onOutput: (out: ConsoleOutput) => void) {
    try {
      const trimmed = statement.trim();
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const content = trimmed.substring(6, trimmed.length - 1).trim();
        const res = this.evaluatePythonExpression(content, this.demoScope);
        onOutput({
          id: uid(),
          type: 'stdout',
          text: String(res),
          timestamp: new Date().toLocaleTimeString()
        });
        return res;
      }

      if (trimmed.includes('=') && !trimmed.includes('==')) {
        const eqIdx = trimmed.indexOf('=');
        const varName = trimmed.substring(0, eqIdx).trim();
        const valExpr = trimmed.substring(eqIdx + 1).trim();
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          const val = this.evaluatePythonExpression(valExpr, this.demoScope);
          this.demoScope[varName] = val;
          return val;
        }
      }

      const res = this.evaluatePythonExpression(trimmed, this.demoScope);
      if (res !== undefined) {
        onOutput({
          id: uid(),
          type: 'stdout',
          text: typeof res === 'object' ? JSON.stringify(res) : String(res),
          timestamp: new Date().toLocaleTimeString()
        });
      }
      return res;
    } catch (err: any) {
      onOutput({
        id: uid(),
        type: 'error',
        text: tf('replErrorMsg', { err: err?.message || err }),
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }

  private evaluatePythonExpression(expr: string, scope: Record<string, any>): any {
    expr = expr.trim();
    if (!expr) return '';

    // Handle string literal (unescape \n \t \\ \' \" so demo output matches Pyodide)
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.substring(1, expr.length - 1).replace(/\\(['"\\\\nrt])/g, (_, ch) => {
        switch (ch) { case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r'; default: return ch; }
      });
    }

    // Handle f-string
    if ((expr.startsWith('f"') && expr.endsWith('"')) || (expr.startsWith("f'") && expr.endsWith("'"))) {
      let raw = expr.substring(2, expr.length - 1);
      let out = raw.replace(/\{([^}]+)\}/g, (_, sub) => {
        return String(this.evaluatePythonExpression(sub, scope));
      });
      return out.replace(/\\(['"\\\\nrt])/g, (_, ch) => {
        switch (ch) { case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r'; default: return ch; }
      });
    }

    // Numbers
    if (!isNaN(Number(expr))) {
      return Number(expr);
    }

    // Booleans / None
    if (expr === 'True') return true;
    if (expr === 'False') return false;
    if (expr === 'None') return null;

    // Direct scope variable lookup
    if (scope[expr] !== undefined) {
      return scope[expr];
    }

    // Basic arithmetic evaluation safety
    try {
      // Replace python operators // for JS math evaluation
      let jsExpr = expr
        .replace(/\/\//g, 'Math.floor/')
        .replace(/and/g, '&&')
        .replace(/or/g, '||')
        .replace(/not/g, '!');

      const keys = Object.keys(scope);
      const values = keys.map(k => scope[k]);
      const func = new Function(...keys, `return ${jsExpr};`);
      return func(...values);
    } catch (e) {
      return expr;
    }
  }

  public async loadPackage(
    pkgName: string,
    onOutput?: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void,
    forceDemoMode = false
  ): Promise<boolean> {
    if (!forceDemoMode && nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available && onOutput) {
        return nativePython.loadPackage(pkgName, onOutput, onProgress);
      }
    }

    if (!forceDemoMode && !this.workerReady && !this.workerLoading) {
      await this.initPyodide(onOutput);
    }

    if (!forceDemoMode && this.workerReady) {
      // 安装消息由 Worker 内的引擎产出（无进度回调，指示器保持不确定态）
      const result = await this.runInWorker(
        { type: 'install', pkg: pkgName } as WorkerRequest,
        onOutput ?? (() => { })
      );
      return result.success;
    }

    onOutput?.({
      id: uid(),
      type: 'system',
      text: tf('demoPkgRegistered', { name: pkgName }),
      timestamp: new Date().toLocaleTimeString()
    });
    return true;
  }

  // 停止当前执行：本机引擎杀子进程，Pyodide 终止 Worker
  //（这是不借助 SharedArrayBuffer 停下死循环的唯一方式，代价是 Python 会话重置）
  // 运行前依赖检查：扫描 import、排除标准库与工作区本地模块，缺失的经确认后自动安装
  private async ensureImports(
    code: string,
    workspaceFiles: FSItem[],
    onOutput: (out: ConsoleOutput) => void
  ): Promise<void> {
    const needed = extractImportsFromCode(code);
    if (needed.length === 0) return;

    const localModules = collectLocalModules(workspaceFiles);
    const candidates = needed.filter((name) => !localModules.has(name));
    if (candidates.length === 0) return;

    const installed = await this.installedPackages();
    if (!installed) return; // 拿不到已装列表：跳过检查，避免误装

    const missing = candidates.filter((name) => !installed.has(name.toLowerCase()));
    if (missing.length === 0) return;

    if (!(await requestInstallConfirm(missing))) return;

    addBackendTask('run-deps', tf('statusInstallingPkg', { name: missing.join(', ') }));
    try {
      for (const pkg of missing) {
        await this.loadPackage(pkg, onOutput);
      }
    } finally {
      finishBackendTask('run-deps');
    }
  }

  // 当前引擎下已安装的包集合：本机走 pip list，WASM / 演示模式用应用自身的安装记录
  private async installedPackages(): Promise<Set<string> | null> {
    if (nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available) return nativePython.installedPackages();
    }
    return new Set(getStoredInstalledPackages().map((name) => name.toLowerCase()));
  }

  // 从本地文件安装扩展包（本地 wheel / sdist 只能交给本机 pip）
  public async installPackageFile(
    filePath: string,
    fileName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    if (nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available) return nativePython.installFromFile(filePath, fileName, onOutput, onProgress);
    }
    onOutput({ id: uid(), type: 'system', text: t('importPkgUnsupported'), timestamp: now() });
    return false;
  }

  // 手动扫描本机已安装的包（绕过会话缓存，取 pip list 的真实结果）；
  // 非本机引擎无法枚举，返回 null 由调用方说明原因
  public async scanInstalledPackages(): Promise<Set<string> | null> {
    if (nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available) return nativePython.installedPackages(true);
    }
    return null;
  }

  // 卸载扩展包：本机引擎走真实 pip 卸载；其他引擎只能移出应用记录（FR-5.4）
  public async uninstallPackage(
    pkgName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<'done' | 'list-only' | 'failed'> {
    if (nativePython.supported && nativePython.enabled) {
      const det = await nativePython.detect();
      if (det.available) {
        const ok = await nativePython.uninstallPackage(pkgName, onOutput, onProgress);
        return ok ? 'done' : 'failed';
      }
    }
    onOutput({
      id: uid(),
      type: 'system',
      text: tf('pkgUninstalledListOnly', { name: pkgName }),
      timestamp: now()
    });
    return 'list-only';
  }

  // 终端底部输入框提交：优先回传给正在等待的 Pyodide 程序，否则写入本机子进程 stdin
  public submitRunInput(line: string | null): void {
    if (this.stdinWaiting.value) {
      this.stdinWaiting.value = false;
      this.stdinPrompt.value = '';
      this.worker?.postMessage({ type: 'input', value: line } as WorkerRequest);
    } else if (line !== null) {
      nativePython.writeRunInput(line).catch(() => { /* 程序已退出 */ });
    }
  }

  public async stop(): Promise<void> {
    this.stdinWaiting.value = false;
    this.stdinPrompt.value = '';
    if (nativePython.supported) {
      await nativePython.stop();
    }
    if (this.worker && this.currentOp) {
      const op = this.currentOp;
      this.currentOp = null;
      this.terminateWorker();
      op.onOutput({ id: uid(), type: 'system', text: t('pyodideStopped'), timestamp: now() });
      op.resolve({ success: false });
    }
  }
}

export const pythonRunner = new PythonRunnerService();
