// src/engine/backends/demo.ts —— 演示后端（从 pythonRunner.ts 搬出）：
// 只在浏览器里求值少量表达式，不真实执行 Python。对不支持语句必须明示「未真实执行」
// 并返回 failureKind='unsupportedSyntax'，不伪造成功（FR-4.6 演示模式诚实性）。
import type { ConsoleOutput, FSItem, RunResult } from '../../types';
import type { BackendCapabilities, ExecutionBackend } from '../types';
import { t, tf } from '../../utils/i18n';
import { uid } from '../../utils/id';
import { emitError } from '../../utils/errorSummary';
import { getStoredInstalledPackages } from '../../utils/packageUtils';

const now = () => new Date().toLocaleTimeString();

const DEMO_CAPABILITIES: BackendCapabilities = {
  streaming: false,
  images: false,
  stdin: false,
  replStdin: false,
  interrupt: 'none',
  valueEcho: 'string',
};

export class DemoBackend implements ExecutionBackend {
  readonly id = 'demo' as const;
  readonly capabilities: BackendCapabilities = DEMO_CAPABILITIES;

  private demoScope: Record<string, any> = {};

  available(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async runScript(code: string, _workspaceFiles: FSItem[], onOutput: (out: ConsoleOutput) => void): Promise<RunResult> {
    const startTime = performance.now();
    onOutput({
      id: uid(),
      type: 'info',
      text: t('demoModeRunning'),
      timestamp: now()
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
        timestamp: now()
      });

      if (logs.length > 0) {
        logs.forEach((log) => {
          onOutput({
            id: uid(),
            type: 'stdout',
            text: log,
            timestamp: now()
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
          timestamp: now()
        });
        return { success: false, durationMs, failureKind: 'unsupportedSyntax' };
      }

      onOutput({
        id: uid(),
        type: 'stdout',
        text: '\n',
        timestamp: now()
      });

      onOutput({
        id: uid(),
        type: 'system',
        text: t('demoExecuted'),
        timestamp: now()
      });

      return { success: true, durationMs };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      emitError(onOutput, err?.message || String(err));
      return { success: false, durationMs, failureKind: 'exception' };
    }
  }

  async runStatement(statement: string, onOutput: (out: ConsoleOutput) => void): Promise<unknown> {
    try {
      const trimmed = statement.trim();
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const content = trimmed.substring(6, trimmed.length - 1).trim();
        const res = this.evaluatePythonExpression(content, this.demoScope);
        onOutput({
          id: uid(),
          type: 'stdout',
          text: String(res),
          timestamp: now()
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
          timestamp: now()
        });
      }
      return res;
    } catch (err: any) {
      onOutput({
        id: uid(),
        type: 'error',
        text: tf('replErrorMsg', { err: err?.message || err }),
        timestamp: now()
      });
    }
  }

  loadPackage(pkgName: string, onOutput?: (out: ConsoleOutput) => void): Promise<boolean> {
    onOutput?.({
      id: uid(),
      type: 'system',
      text: tf('demoPkgRegistered', { name: pkgName }),
      timestamp: now()
    });
    return Promise.resolve(true);
  }

  uninstall(pkgName: string, onOutput?: (out: ConsoleOutput) => void): Promise<'done' | 'list-only' | 'failed'> {
    onOutput?.({
      id: uid(),
      type: 'system',
      text: tf('pkgUninstalledListOnly', { name: pkgName }),
      timestamp: now()
    });
    return Promise.resolve('list-only');
  }

  listInstalled(): Promise<Set<string> | null> {
    return Promise.resolve(new Set(getStoredInstalledPackages().map((name) => name.toLowerCase())));
  }

  stop(): Promise<void> {
    return Promise.resolve();
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
}
