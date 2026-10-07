// 启动时的静默更新检查：结果放模块级状态，供设置页显示「立即更新」。
// 设置页切走标签会整体卸载，状态若留在组件里，启动查到的「有新版」就丢了。
import { reactive } from 'vue';
import { nativeUpdater, type UpdateInfo } from './nativeUpdater';

export const appUpdate = reactive({
  /** 启动静默检查进行中 */
  checking: false,
  /** 最近一次检查结果（启动或设置页手动检查写入）；未查过或失败时为 null */
  info: null as UpdateInfo | null,
});

/** 启动时调用一次；离线、限流等失败静默处理（设置页手动检查会给出错误提示） */
export async function checkUpdateOnStartup(): Promise<void> {
  if (!nativeUpdater.available() || appUpdate.checking) return;
  appUpdate.checking = true;
  try {
    appUpdate.info = await nativeUpdater.check();
  } catch (e) {
  } finally {
    appUpdate.checking = false;
  }
}
