// Pyodide 引擎的 Worker 外壳：加载运行时并转发消息。
// 放在 Worker 里是为了让 Python 执行不阻塞主线程，中止也能靠 terminate 生效。
import { PyodideEngine, type WorkspaceFile } from './pyodideEngine';

export type WorkerRequest =
  | { type: 'init' }
  | { type: 'run'; code: string; files: WorkspaceFile[] }
  | { type: 'repl'; statement: string }
  | { type: 'install'; pkg: string }
  | { type: 'sync-fs'; files: WorkspaceFile[] }
  | { type: 'input'; value: string | null };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'init-error'; text: string }
  | { type: 'stdout' | 'stderr' | 'system' | 'error'; text: string }
  | { type: 'need-input'; prompt: string }
  | { type: 'done'; success: boolean; value?: string | null };

const post = (message: WorkerResponse) => (self as unknown as Worker).postMessage(message);

// 绝对路径 + 变量赋值：让 @vite-ignore 生效，保留为运行时动态 import
const PYODIDE_ESM_URL = '/pyodide/pyodide.mjs';
const PYODIDE_INDEX_URL = '/pyodide/';

let engine: PyodideEngine | null = null;
let resolveInput: ((value: string | null) => void) | null = null;

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  try {
    switch (message.type) {
      case 'init':
        engine = new PyodideEngine({
          loadRuntime: async () => {
            const mod: any = await import(/* @vite-ignore */ PYODIDE_ESM_URL);
            return { loadPyodide: mod.loadPyodide, indexURL: PYODIDE_INDEX_URL };
          },
          onOutput: (kind, text) => post({ type: kind, text }),
          // Worker 内没有 prompt：请主线程弹窗并回传用户输入
          requestInput: (promptText) =>
            new Promise<string | null>((resolve) => {
              resolveInput = resolve;
              post({ type: 'need-input', prompt: promptText });
            }),
        });
        await engine.init();
        post({ type: 'ready' });
        break;

      case 'input':
        resolveInput?.(message.value);
        resolveInput = null;
        break;

      case 'run':
        post({ type: 'done', success: await engine!.run(message.code, message.files) });
        break;

      case 'repl':
        post({ type: 'done', success: true, value: await engine!.repl(message.statement) });
        break;

      case 'install':
        post({ type: 'done', success: await engine!.install(message.pkg) });
        break;

      case 'sync-fs':
        engine?.syncFiles(message.files);
        break;
    }
  } catch (err: any) {
    const text = String(err?.message || err);
    if (message.type === 'init') {
      post({ type: 'init-error', text });
    } else {
      post({ type: 'error', text });
      post({ type: 'done', success: false });
    }
  }
});
