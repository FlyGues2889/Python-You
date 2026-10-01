// src/engine/backends/native.ts —— 本机后端：适配现有 nativePython 适配器（L1 侧的桥之后仍归它）。
// 不自行拼帧；帧与闸门由编排层负责。pip 类操作直接透传 nativePython。
import type { ConsoleOutput, FSItem, RunResult } from '../../types';
import type { BackendCapabilities, ExecutionBackend } from '../types';
import { nativePython } from '../../utils/nativePython';

const NATIVE_CAPABILITIES: BackendCapabilities = {
  streaming: true,
  images: true,
  stdin: true,
  replStdin: true,
  interrupt: 'process',
  valueEcho: 'repr',
};

export class NativeBackend implements ExecutionBackend {
  readonly id = 'native' as const;
  readonly capabilities: BackendCapabilities = NATIVE_CAPABILITIES;

  // 本机 run 会话是否在飞（编排层 deriving awaitingInput 用；stdinWaiting ∨ runActive）
  get runActive(): boolean {
    return nativePython.runActive.value;
  }

  // 工作区根目录由编排层（App 打开本地文件夹时设置）注入；构造时未就绪则取 null
  workspaceRootProvider: () => string | null = () => null;

  async available(): Promise<boolean> {
    if (!nativePython.supported || !nativePython.enabled) return false;
    const det = await nativePython.detect();
    return det.available;
  }

  runScript(code: string, workspaceFiles: FSItem[], onOutput: (out: ConsoleOutput) => void): Promise<RunResult> {
    return nativePython.runCode(code, workspaceFiles, onOutput, this.workspaceRootProvider());
  }

  runStatement(statement: string, onOutput: (out: ConsoleOutput) => void): Promise<unknown> {
    return nativePython.runREPL(statement, onOutput, this.workspaceRootProvider());
  }

  requestInput(line: string | null): void {
    if (line === null) return;
    nativePython.writeRunInput(line).catch(() => { /* 程序已退出 */ });
  }

  loadPackage(
    pkgName: string,
    onOutput?: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    if (!onOutput) return Promise.resolve(false);
    return nativePython.loadPackage(pkgName, onOutput, onProgress);
  }

  uninstall(
    pkgName: string,
    onOutput?: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<'done' | 'list-only' | 'failed'> {
    if (!onOutput) return Promise.resolve('failed');
    return nativePython.uninstallPackage(pkgName, onOutput, onProgress).then((ok) => (ok ? 'done' : 'failed'));
  }

  listInstalled(force = false): Promise<Set<string> | null> {
    return nativePython.installedPackages(force);
  }

  // 从本地文件安装（wheel / sdist），只本机支持
  installFromFile(
    filePath: string,
    fileName: string,
    onOutput: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean> {
    return nativePython.installFromFile(filePath, fileName, onOutput, onProgress);
  }

  stop(): Promise<void> {
    if (!nativePython.supported) return Promise.resolve();
    return nativePython.stop();
  }
}
