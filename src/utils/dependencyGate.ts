// 运行前依赖确认：引擎侧检测到缺失的第三方包后，由 App 弹确认框，用户确认再安装（NFR-5.3）
import { ref } from 'vue';

/** 待用户确认安装的包名；null 表示当前没有待确认的请求 */
export const pendingDependencies = ref<string[] | null>(null);

let resolver: ((confirmed: boolean) => void) | null = null;

export function requestInstallConfirm(packages: string[]): Promise<boolean> {
  pendingDependencies.value = packages;
  return new Promise<boolean>((resolve) => {
    resolver = resolve;
  });
}

export function resolveInstallConfirm(confirmed: boolean) {
  pendingDependencies.value = null;
  resolver?.(confirmed);
  resolver = null;
}
