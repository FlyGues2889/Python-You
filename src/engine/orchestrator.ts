// src/engine/orchestrator.ts —— 执行编排：
// 选引擎收敛成 pick() 一处；并发闸门（单执行槽，在飞默认拒绝）；统一回显（REPL >>>）；
// isRunning/awaitingInput/capabilities 派生状态；stdin 分流；失败类别统一归类。
// 后端只负责「执行 + 产出输出事件」，不自己拼帧。
//
// 对外仍以 pythonRunner 门面导出（src/utils/pythonRunner.ts 薄转发），组件 import 不变。
import { computed, ref, type Ref } from 'vue';
import type { ConsoleOutput, FSItem, RunResult } from '../types';
import type { BackendCapabilities, ExecutionBackend } from './types';
import { NativeBackend } from './backends/native';
import { PyodideBackend } from './backends/pyodide';
import { DemoBackend } from './backends/demo';
import { t, tf } from '../utils/i18n';
import { uid } from '../utils/id';
import { extractImportsFromCode, collectLocalModules, getStoredInstalledPackages } from '../utils/packageUtils';
import { requestInstallConfirm } from '../utils/dependencyGate';
import { addBackendTask, finishBackendTask } from '../utils/backendTasks';

const now = () => new Date().toLocaleTimeString();

export class ExecutionOrchestrator {
  // 终端内 stdin：Pyodide 程序请求输入时置位，由 TerminalPanel 底部输入框回传
  public stdinWaiting = ref(false);
  public stdinPrompt = ref('');

  // 会话状态（阶段 3，三个运行入口共用）：任一引擎有执行在飞；有程序正在等 stdin。
  // runActive 从本机适配器经后端转发读取（编排层不直接摸 nativePython）
  public isRunning = ref(false);
  public readonly awaitingInput = computed(() => this.stdinWaiting.value || this.native.runActive);
  private stopRequested = false;
  // 当前引擎的能力描述符（由最近一次引擎选择结果更新；未运行过时按最保守的演示引擎）
  public capabilities: Ref<BackendCapabilities>;

  // 当前原生工作区根目录（由 App 在打开本地文件夹时设置），用于给本机 Python 指定 cwd
  public workspaceRoot: string | null = null;

  // 引擎加载状态回调（标题栏状态指示器用）：Pyodide 开始加载时 true，完成/失败后 false
  public onEngineLoading?: (loading: boolean) => void;

  constructor(
    private readonly native: NativeBackend,
    private readonly pyodide: PyodideBackend,
    private readonly demo: DemoBackend
  ) {
    this.capabilities = ref(demo.capabilities);
  }

  /**
   * 选引擎（注册表查询，一处收敛）：本机可用 > Pyodide 就绪 > 演示。
   * 只做选择、无副作用（不触发 Pyodide 初始化）；运行路径如需初始化自行先调 initPyodide。
   */
  async pick(forceDemo = false): Promise<ExecutionBackend> {
    if (!forceDemo && (await this.native.available())) return this.native;
    if (!forceDemo && this.pyodide.ready) return this.pyodide;
    return this.demo;
  }

  // ---- 运行会话 ----

  public async runCode(
    code: string,
    workspaceFiles: FSItem[],
    onOutput: (out: ConsoleOutput) => void,
    forceDemoMode = false
  ): Promise<RunResult> {
    // 并发闸门：单执行槽，有在飞操作时默认拒绝（不静默覆盖 currentOp / native 监听器）
    if (this.isRunning.value) {
      onOutput({ id: uid(), type: 'system', text: t('runnerBusy'), timestamp: now() });
      return { success: false, busy: true, durationMs: 0, failureKind: 'interrupted' };
    }
    this.stopRequested = false;
    this.isRunning.value = true;
    try {
      // 运行前依赖检查：代码引用的第三方包缺失时（经用户确认）先自动安装，再执行
      if (!forceDemoMode) await this.ensureImports(code, workspaceFiles, onOutput);

      // 渐进增强：本机 Python 可用则真实子进程；否则尝试初始化 Pyodide（失败退回演示）
      let backend = await this.pick(forceDemoMode);
      if (!forceDemoMode && backend.id === 'demo') {
        if (!this.pyodide.ready && !this.pyodide.loading) await this.initPyodide(onOutput);
        backend = await this.pick(false);
      }
      this.capabilities.value = backend.capabilities;
      const result = await backend.runScript(code, workspaceFiles, onOutput);

      // 失败类别统一归类：
      // 用户停止 / 取消输入 → canceled（覆盖后端已归的类）；
      // 后端没归类的（Pyodide done 只带 success）→ exception
      if (!result.success && (this.stopRequested || this.stdinWaiting.value)) {
        result.failureKind = 'canceled';
      } else if (!result.success && !result.failureKind) {
        result.failureKind = 'exception';
      }
      return result;
    } finally {
      this.isRunning.value = false;
    }
  }

  public async runREPL(
    statement: string,
    onOutput: (out: ConsoleOutput) => void,
    forceDemoMode = false
  ): Promise<unknown> {
    // 有脚本在跑时不发 REPL 语句（同一执行槽；子进程/worker 会串行处理已发语句）
    if (this.isRunning.value) {
      onOutput({ id: uid(), type: 'system', text: t('runnerBusy'), timestamp: now() });
      return undefined;
    }
    // 统一回显：所有后端都以 >>> 回显（迁移前仅 Pyodide/演示有，本机子进程自带提示符；
    // 现在回显上移到编排层，三后端一致）
    onOutput({ id: uid(), type: 'input', text: `>>> ${statement}`, timestamp: now() });
    this.isRunning.value = true;
    try {
      let backend = await this.pick(forceDemoMode);
      if (!forceDemoMode && backend.id === 'demo') {
        if (!this.pyodide.ready && !this.pyodide.loading) await this.initPyodide(onOutput);
        backend = await this.pick(false);
      }
      this.capabilities.value = backend.capabilities;
      return await backend.runStatement(statement, onOutput);
    } finally {
      this.isRunning.value = false;
    }
  }

  /**
   * 预热 Pyodide：预判正式运行会不会落到它，会的话后台把 Worker 与 WASM 拉起来。
   * 首次运行的等待主要来自 Worker 启动 + WASM 加载（实测 >1s），放到用户读代码/写代码时后台做完。
   * 静默（不产出终端输出）、不重试；本机 Python 可用时不预热；失败留给正式运行时按既有路径报错。
   */
  public warmUpPyodide(): void {
    if (this.pyodide.ready || this.pyodide.loading) return;
    void this.native.available().then((nativeOk) => {
      if (nativeOk) return;
      void this.initPyodide();
    });
  }

  public async initPyodide(onOutput?: (out: ConsoleOutput) => void): Promise<boolean> {
    this.onEngineLoading?.(true);
    try {
      const ok = await this.pyodide.init(onOutput);
      if (ok) this.capabilities.value = this.pyodide.capabilities;
      return ok;
    } finally {
      this.onEngineLoading?.(false);
    }
  }

  public syncFileSystem(items: FSItem[]) {
    this.pyodide.syncFileSystem(items);
  }

  // 终端底部输入框提交：优先回传给正在等待的 Pyodide 程序，否则写入本机子进程 stdin
  public submitRunInput(line: string | null): void {
    if (this.stdinWaiting.value) {
      this.stdinWaiting.value = false;
      this.stdinPrompt.value = '';
      this.pyodide.requestInput?.(line);
    } else if (line !== null) {
      this.native.requestInput?.(line);
    }
  }

  // 停止当前执行：本机引擎杀子进程，Pyodide 终止 Worker
  //（这是不借助 SharedArrayBuffer 停下死循环的唯一方式，代价是 Python 会话重置）
  public async stop(): Promise<void> {
    this.stopRequested = true;
    this.stdinWaiting.value = false;
    this.stdinPrompt.value = '';
    await this.native.stop();
    await this.pyodide.stop();
  }

  // ---- 包管理 ----

  public async loadPackage(
    pkgName: string,
    onOutput?: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void,
    forceDemoMode = false
  ): Promise<boolean> {
    if (!forceDemoMode && onOutput) {
      if (await this.native.available()) return this.native.loadPackage(pkgName, onOutput, onProgress);
    }

    if (!forceDemoMode && !this.pyodide.ready && !this.pyodide.loading) {
      await this.initPyodide(onOutput);
    }

    if (!forceDemoMode && this.pyodide.ready) return this.pyodide.loadPackage(pkgName, onOutput);

    return this.demo.loadPackage(pkgName, onOutput);
  }

  // 从本地文件安装扩展包（本地 wheel / sdist 只能交给本机 pip）
  public async installPackageFile(
    filePath: string,
    fileName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    if (await this.native.available()) return this.native.installFromFile(filePath, fileName, onOutput, onProgress);
    onOutput({ id: uid(), type: 'system', text: t('importPkgUnsupported'), timestamp: now() });
    return false;
  }

  // 手动扫描本机已安装的包（绕过会话缓存，取 pip list 的真实结果）；
  // 非本机引擎无法枚举，返回 null 由调用方说明原因
  public async scanInstalledPackages(): Promise<Set<string> | null> {
    if (await this.native.available()) return this.native.listInstalled(true);
    return null;
  }

  // 卸载扩展包：本机引擎走真实 pip 卸载；其他引擎只能移出应用记录（FR-5.4）
  public async uninstallPackage(
    pkgName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<'done' | 'list-only' | 'failed'> {
    if (await this.native.available()) return this.native.uninstall(pkgName, onOutput, onProgress);
    onOutput({
      id: uid(),
      type: 'system',
      text: tf('pkgUninstalledListOnly', { name: pkgName }),
      timestamp: now()
    });
    return 'list-only';
  }

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
    if (await this.native.available()) return this.native.listInstalled(false);
    return new Set(getStoredInstalledPackages().map((name) => name.toLowerCase()));
  }
}

// 单例装配：stdin 状态由编排层持有，注入 Pyodide 后端；native 的 workspaceRoot 从编排层读
const stdinWaiting = ref(false);
const stdinPrompt = ref('');
const nativeBackend = new NativeBackend();
const pyodideBackend = new PyodideBackend(stdinWaiting, stdinPrompt);
const demoBackend = new DemoBackend();

export const pythonRunner = new ExecutionOrchestrator(nativeBackend, pyodideBackend, demoBackend);
nativeBackend.workspaceRootProvider = () => pythonRunner.workspaceRoot;
