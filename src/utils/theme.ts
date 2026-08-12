import { ref } from 'vue';
import { AppConfig } from '../types';

// 系统暗色偏好（响应式）：跟随系统主题（themeMode='system'）时用于映射代码主题，
// 系统偏好变化会触发依赖它的 computed 重算（App.vue/SettingsView.vue 共用）
const mq = window.matchMedia('(prefers-color-scheme: dark)');
export const isSystemDark = ref(mq.matches);
mq.addEventListener('change', (e) => {
  isSystemDark.value = e.matches;
});

// 代码主题解析：'system'（跟随系统主题）时按外观主题 + 系统暗色偏好映射为具体的
// 浅/深色代码主题，其余值原样返回。
export function resolveCodeTheme(
  codeTheme: string | undefined,
  themeMode: AppConfig['themeMode']
): string {
  if (codeTheme === 'system') {
    const isDark = themeMode === 'dark' || (themeMode === 'system' && isSystemDark.value);
    return isDark ? 'github-dark' : 'github-light';
  }
  return codeTheme || 'github-dark';
}
