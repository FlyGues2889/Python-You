// src/utils/pythonRunner.ts —— 薄转发：
// 实现已移入 src/engine/*（orchestrator + backends/{native,pyodide,demo}），
// 组件与调用点 import 不变。能力/类型签名与迁移前一致（RunResult 语义见 src/types.ts）。
export { pythonRunner } from '../engine/orchestrator';
export type { BackendCapabilities, ExecutionBackend, BackendId } from '../engine/types';
