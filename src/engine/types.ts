// src/engine/types.ts —— 执行层契约（ARCHITECTURE.md §2.2 / §2.4）：
// ExecutionBackend 接口 + BackendCapabilities 能力模型。RunResult/FailureKind 等共享类型在 src/types.ts。
import type { ConsoleOutput, FSItem, RunResult } from '../types';

export type BackendId = 'native' | 'pyodide' | 'demo';

/**
 * 能力模型（ARCHITECTURE.md §2.4）：UI 只问能力，不问实现。
 * - interrupt：停止的机制——本机杀子进程 / Pyodide 终止 Worker（会话重置）/ 演示不可中断
 * - valueEcho：REPL 返回值的格式——本机是 repr()，Pyodide/演示是字符串形式
 */
export interface BackendCapabilities {
  streaming: boolean;          // 能实时送未结束行
  images: boolean;             // 能出图
  stdin: boolean;              // 运行中可喂 stdin
  replStdin: boolean;          // REPL 内可 input()
  interrupt: 'process' | 'worker-reset' | 'none';
  valueEcho: 'repr' | 'string';
}

/**
 * 后端只负责「执行 + 产出输出事件」；选引擎、并发闸门、统一帧（回显/空行/耗时横幅）、
 * stdin 分流与 isRunning/awaitingInput 派生状态都由编排层（orchestrator.ts）负责。
 */
export interface ExecutionBackend {
  readonly id: BackendId;
  readonly capabilities: BackendCapabilities;

  /** 引擎当前是否可用（本机：supported && enabled && detect 到 Python；Pyodide：worker 已就绪；演示：恒 true） */
  available(): Promise<boolean>;

  /** 整段脚本执行；产出执行事件，返回结果。失败归类由编排层统一处理。 */
  runScript(code: string, workspaceFiles: FSItem[], onOutput: (out: ConsoleOutput) => void): Promise<RunResult>;

  /** 单条 REPL 语句执行；返回表达式的值（无值返回 undefined）。 */
  runStatement(statement: string, onOutput: (out: ConsoleOutput) => void): Promise<unknown>;

  /** stdin 分流：向正在等待输入的运行/REPL 会话喂一行输入（无 stdin 能力的后端省略）。 */
  requestInput?(line: string | null): void;

  loadPackage(
    pkgName: string,
    onOutput?: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<boolean>;

  uninstall(
    pkgName: string,
    onOutput?: (out: ConsoleOutput) => void,
    onProgress?: (progress: number | null) => void
  ): Promise<'done' | 'list-only' | 'failed'>;

  /** 当前引擎已安装的包集合；无法枚举返回 null（非本机引擎）。 */
  listInstalled(): Promise<Set<string> | null>;

  stop(): Promise<void>;
}
