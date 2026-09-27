// 自更新桥接：查 GitHub Release、下载新版单文件 exe、替换并重启。
// 这组能力只在桌面端存在（纯浏览器环境没有可替换的自身），调用前先看 available()。
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { nativeApi } from './native';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  notes: string;
  downloadUrl: string;
  /** 发布说明首行给出的 sha256；缺失时为 null（后端会跳过校验并打 warning） */
  expectedSha256: string | null;
}

export const nativeUpdater = {
  available(): boolean {
    return nativeApi.available();
  },

  check(): Promise<UpdateInfo> {
    return invoke<UpdateInfo>('check_update');
  },

  /** 下载并校验，成功返回临时文件路径 */
  download(url: string, expectedSha256: string | null): Promise<string> {
    return invoke<string>('download_update', { url, expectedSha256 });
  },

  /** 取消正在进行的下载；下载命令会以「已取消下载」失败返回 */
  cancelDownload(): Promise<void> {
    return invoke<void>('cancel_update_download');
  },

  replaceAndRestart(): Promise<void> {
    return invoke<void>('replace_and_restart');
  },

  /** 下载进度（0-100），返回取消监听的函数 */
  onProgress(cb: (percent: number) => void): Promise<() => void> {
    return listen<number>('download-progress', (event) => cb(event.payload));
  }
};
