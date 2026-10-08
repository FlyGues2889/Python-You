// 运行前依赖确认：引擎侧检测到缺失的第三方包后，由 App 弹确认框，用户确认再安装（NFR-5.3）
import { ref } from 'vue';

export interface InstallRequest {
  packages: string[];
  /** 当前引擎能不能真的装：本机 Python（pip）为 true；Pyodide / 演示模式为 false，
      此时对话框只说明「装不了」并引导安装本机 Python，不提供安装动作 */
  canInstall: boolean;
}

/** 待用户确认安装的请求；null 表示当前没有待确认的请求 */
export const pendingDependencies = ref<InstallRequest | null>(null);

let resolver: ((confirmed: boolean) => void) | null = null;

export function requestInstallConfirm(packages: string[], canInstall = true): Promise<boolean> {
  pendingDependencies.value = { packages, canInstall };
  return new Promise<boolean>((resolve) => {
    resolver = resolve;
  });
}

export function resolveInstallConfirm(confirmed: boolean) {
  pendingDependencies.value = null;
  resolver?.(confirmed);
  resolver = null;
}
