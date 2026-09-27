<script setup lang="ts">
import { computed, ref } from 'vue';
import { AppConfig } from '../types';
import { useI18n } from '../utils/i18n';
import { resolveCodeTheme } from '../utils/theme';
import { nativePython } from '../utils/nativePython';
import { nativeApi } from '../utils/native';
import { nativeUpdater, type UpdateInfo } from '../utils/nativeUpdater';
import { addBackendTask, updateBackendTask, finishBackendTask } from '../utils/backendTasks';
import { getVersion } from '@tauri-apps/api/app';
import PageHeader from './PageHeader.vue';
import EditorPreview from './EditorPreview.vue';

const props = defineProps<{ config: AppConfig }>();

const { t } = useI18n();

// Settings 面板控件事件（m3e 组件事件 → 更新 config）
// config 是 App.vue 传入的响应式对象：直接改属性会触发 App 的 watch 自动持久化。
// m3e-button-group(variant="connected") 单选组：按钮自身派发 change（Vue 方法引用自动接收事件）。
// 选中 → 从 data-mode/data-size 更新 config；点击已选中项导致取消选中 → 恢复选中，避免出现空白态。
const onThemeModeToggle = (e: Event) => {
  const btn = e.target as HTMLElement & { selected?: boolean };
  if (!btn.selected) {
    btn.selected = true;
    return;
  }
  props.config.themeMode = (btn.dataset.mode as 'system' | 'light' | 'dark');
};
const onTabSizeToggle = (e: Event) => {
  const btn = e.target as HTMLElement & { selected?: boolean };
  if (!btn.selected) {
    btn.selected = true;
    return;
  }
  props.config.tabSize = Number(btn.dataset.size);
};
const onCodeThemeChange = (e: Event) => {
  props.config.codeTheme = (e.target as any).value;
};
const onFontSizeInput = (e: Event) => {
  const v = (e.target as any).value;
  if (typeof v === 'number' && !Number.isNaN(v)) {
    props.config.fontSize = v;
  }
};
// 'system'（跟随系统主题）在预览处解析为实际主题，与 App.vue 的编辑器/终端保持一致
const resolvedCodeTheme = computed(() =>
  resolveCodeTheme(props.config.codeTheme, props.config.themeMode)
);

// 解释器选择：写入配置并应用（与 App.vue 编辑器版本管理器同一状态源）
const onInterpreterChange = async (e: Event) => {
  const id = (e.target as any).value as string;
  props.config.interpreter = id;
  await nativePython.applyInterpreter(id);
};

const onSwitchChange = (e: Event, key: 'enableWheelZoom' | 'autoPairQuotes' | 'demoMode') => {
  props.config[key] = !!(e.target as any).checked;
};
const onWheelZoomChange = (e: Event) => onSwitchChange(e, 'enableWheelZoom');
const onAutoPairChange = (e: Event) => onSwitchChange(e, 'autoPairQuotes');
const onDemoModeChange = (e: Event) => onSwitchChange(e, 'demoMode');

// 添加自定义解释器：选择 Python 可执行文件 → Rust 探测版本与真实路径 → 并入列表并选中
const interpreterError = ref('');
const handleAddInterpreter = async () => {
  interpreterError.value = '';
  const path = await nativeApi.pickFile();
  if (!path) return;
  try {
    const entry = await nativePython.addInterpreter(path);
    props.config.interpreter = entry.id;
    await nativePython.applyInterpreter(entry.id);
  } catch (err: any) {
    interpreterError.value = t('interpreterAddFailed') + (err?.message || err);
  }
};

/* ==================== 检查更新 ==================== */
const isUpdaterAvailable = nativeApi.available();
// 更新过程也登记到标题栏后台任务里（与包安装等长任务同一处，FR-1.3 / FR-5.6）
const UPDATE_TASK_ID = 'app-update';
const aboutVersion = ref('0.3.6'); // 兜底值；桌面端启动后从 tauri.conf.json 读真实版本
const isUpdateDialogOpen = ref(false);
const updateStage = ref<'idle' | 'checking' | 'latest' | 'available' | 'downloading' | 'preparing' | 'error'>('idle');
const updateInfo = ref<UpdateInfo | null>(null);
const updateError = ref('');
const updatePercent = ref<number | null>(null); // null = 还没拿到真实进度
let stopProgressListener: (() => void) | null = null;

if (isUpdaterAvailable) {
  getVersion().then(v => { aboutVersion.value = v; }).catch(() => { /* 取不到就用兜底版本号 */ });
}

// 发布说明首行是 `sha256: <哈希>`，那是给更新器校验用的，不给用户看
const updateNotesText = computed(() => {
  const lines = (updateInfo.value?.notes || '').split('\n');
  if (/^\s*sha256:/i.test(lines[0] || '')) lines.shift();
  return lines.join('\n').trim();
});

const updateHeadline = computed(() => {
  if (updateStage.value === 'checking') return t('updateChecking');
  if (updateStage.value === 'latest') return t('updateLatest');
  if (updateStage.value === 'preparing') return t('updatePreparing');
  if (updateStage.value === 'error') return updateError.value;
  const info = updateInfo.value;
  if (!info) return '';
  return t('updateAvailable').replace('{version}', info.latestVersion);
});

// 关于卡片里的状态文案：没检查过就显示当前版本
const updateStatusText = computed(() => {
  if (!isUpdaterAvailable) return t('updateUnsupported');
  if (updateStage.value === 'checking') return t('updateChecking');
  if (updateStage.value === 'latest') return t('updateLatest');
  if (updateStage.value === 'downloading') {
    return updatePercent.value === null
      ? t('updateDownloadingPlain')
      : t('updateDownloading').replace('{percent}', String(updatePercent.value));
  }
  if (updateStage.value === 'preparing') return t('updatePreparing');
  if (updateInfo.value?.hasUpdate) return t('updateAvailable').replace('{version}', updateInfo.value.latestVersion);
  return t('updateCurrentVersion').replace('{version}', aboutVersion.value);
});

const stopProgress = () => {
  stopProgressListener?.();
  stopProgressListener = null;
};

const closeUpdateDialog = () => {
  if (updateStage.value === 'downloading' || updateStage.value === 'preparing') return; // 下载/重启中不允许关闭
  isUpdateDialogOpen.value = false;
  stopProgress();
};

const handleCheckUpdate = async () => {
  if (!isUpdaterAvailable) {
    updateStage.value = 'error';
    updateError.value = t('updateUnsupported');
    isUpdateDialogOpen.value = true;
    return;
  }
  updateError.value = '';
  updatePercent.value = null;
  updateStage.value = 'checking';
  isUpdateDialogOpen.value = true;
  addBackendTask(UPDATE_TASK_ID, t('updateChecking'));
  try {
    const info = await nativeUpdater.check();
    updateInfo.value = info;
    updateStage.value = info.hasUpdate ? 'available' : 'latest';
    finishBackendTask(UPDATE_TASK_ID, 'done');
  } catch (err: any) {
    updateStage.value = 'error';
    updateError.value = String(err?.message || err || t('updateFailed'));
    finishBackendTask(UPDATE_TASK_ID, 'failed');
  }
};

// 下载 → 校验通过后后端会给出临时文件路径；随后提示并重启替换
const startUpdate = async () => {
  const info = updateInfo.value;
  if (!info) return;
  updateStage.value = 'downloading';
  updatePercent.value = null;
  stopProgress();
  addBackendTask(UPDATE_TASK_ID, t('statusDownloadingUpdate'));
  try {
    stopProgressListener = await nativeUpdater.onProgress(p => {
      updatePercent.value = p;
      updateBackendTask(UPDATE_TASK_ID, { progress: p }); // 标题栏后台任务里的进度同步
    });
    await nativeUpdater.download(info.downloadUrl, info.expectedSha256);
    stopProgress();
    finishBackendTask(UPDATE_TASK_ID, 'done');
    updateStage.value = 'preparing';
    await nativeUpdater.replaceAndRestart();
  } catch (err: any) {
    stopProgress();
    finishBackendTask(UPDATE_TASK_ID, 'failed');
    updateStage.value = 'error';
    updateError.value = String(err?.message || err || t('updateFailed'));
  }
};

// 清除本地数据（FR-8.2）：删除全部 python_you_* 键（工作区/配置/会话/教程进度）后重置
const isClearDataDialogOpen = ref(false);
const clearLocalData = () => {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('python_you_')) localStorage.removeItem(key);
  }
  isClearDataDialogOpen.value = false;
  // 重置为首次启动状态（工作区、欢迎引导、教程进度均会重新初始化）
  window.location.reload();
};
</script>

<template>
  <m3e-content-pane class="settings-workspace-view">
    <PageHeader :title="t('settingsTitle')" :subtitle="t('settingsSubtitle')" />

    <div class="settings-grid">
      <!-- General Settings -->
      <m3e-card variant="outlined">
        <div slot="header" class="settings-card-header">
          <h4 class="settings-card-title">{{ t('generalSettings') }}</h4>
        </div>
        <m3e-list slot="content">
          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">palette</span>
            {{ t('themeMode') }}
            <span slot="supporting-text">{{ t('themeModeSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-button-group variant="connected" size="small" class="settings-btn-group">
                <!-- variant="tonal" 必须有：m3e-button 默认 text variant 无容器背景，
                     只有文字色 → 按钮组看起来不像按钮 -->
                <m3e-button toggle variant="tonal" shape="square" size="small" data-mode="system"
                  :selected="config.themeMode === 'system'" @change="onThemeModeToggle">{{ t('themeSystem')
                  }}</m3e-button>
                <m3e-button toggle variant="tonal" shape="square" size="small" data-mode="light"
                  :selected="config.themeMode === 'light'" @change="onThemeModeToggle">{{ t('themeLight')
                  }}</m3e-button>
                <m3e-button toggle variant="tonal" shape="square" size="small" data-mode="dark" :selected="config.themeMode === 'dark'"
                  @change="onThemeModeToggle">{{ t('themeDark') }}</m3e-button>
              </m3e-button-group>
            </div>
          </m3e-list-item>
        </m3e-list>
      </m3e-card>

      <!-- Editor Settings -->
      <m3e-card variant="outlined">
        <div slot="header" class="settings-card-header">
          <h4 class="settings-card-title">{{ t('editorSettings') }}</h4>
        </div>

        <!-- Live Editor Preview -->
        <EditorPreview :config="config" :code-theme="resolvedCodeTheme" />

        <m3e-list slot="content">
          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">palette</span>
            {{ t('codeTheme') }}
            <span slot="supporting-text">{{ t('codeThemeSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-select class="theme-select" panel-class="theme-select-panel" @change="onCodeThemeChange">
                <!-- 跟随系统主题：独立选项，位于两个分组之上；选中时由
                     resolveCodeTheme 按外观主题映射为浅/深色实际主题 -->
                <m3e-option value="system" :selected="config.codeTheme === 'system'">
                  {{ t('followSystemTheme') }}
                </m3e-option>
                <!-- 按深/浅色分组展示：深色组在前（默认选中项保持首位） -->
                <m3e-optgroup>
                  <span slot="label">{{ t('themeDark') }}</span>
                  <m3e-option value="github-dark" :selected="config.codeTheme === 'github-dark'">GitHub Dark</m3e-option>
                  <m3e-option value="monokai" :selected="config.codeTheme === 'monokai'">Monokai</m3e-option>
                  <m3e-option value="one-dark" :selected="config.codeTheme === 'one-dark'">One Dark</m3e-option>
                  <m3e-option value="vs-code" :selected="config.codeTheme === 'vs-code'">VS Code</m3e-option>
                </m3e-optgroup>
                <m3e-optgroup>
                  <span slot="label">{{ t('themeLight') }}</span>
                  <m3e-option value="github-light" :selected="config.codeTheme === 'github-light'">GitHub
                    Light</m3e-option>
                  <m3e-option value="one-light" :selected="config.codeTheme === 'one-light'">One Light</m3e-option>
                  <m3e-option value="vs-code-light" :selected="config.codeTheme === 'vs-code-light'">VS Code
                    Light</m3e-option>
                  <m3e-option value="solarized-light" :selected="config.codeTheme === 'solarized-light'">Solarized
                    Light</m3e-option>
                </m3e-optgroup>
              </m3e-select>
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">format_size</span>
            {{ t('fontSize') }}: {{ config.fontSize }}px
            <span slot="supporting-text">{{ t('fontSizeSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing font-size-trailing">
              <m3e-slider :min="12" :max="24" :step="1" discrete labelled>
                <m3e-slider-thumb :value="config.fontSize" @input="onFontSizeInput" />
              </m3e-slider>
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">pinch</span>
            {{ t('enableWheelZoom') }}
            <span slot="supporting-text">{{ t('enableWheelZoomSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-switch :checked="config.enableWheelZoom" @change="onWheelZoomChange" />
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">keyboard_tab</span>
            {{ t('tabSize') }}
            <span slot="supporting-text">{{ t('tabSizeSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-button-group variant="connected" size="small" class="settings-btn-group">
                <m3e-button toggle variant="tonal" shape="square" size="small" data-size="2" :selected="config.tabSize === 2"
                  @change="onTabSizeToggle">2 Spaces</m3e-button>
                <m3e-button toggle variant="tonal" shape="square" size="small" data-size="4" :selected="config.tabSize === 4"
                  @change="onTabSizeToggle">4 Spaces</m3e-button>
              </m3e-button-group>
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">format_quote</span>
            {{ t('autoPairQuotes') }}
            <span slot="supporting-text">{{ t('autoPairQuotesSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-switch :checked="config.autoPairQuotes" @change="onAutoPairChange" />
            </div>
          </m3e-list-item>
        </m3e-list>
      </m3e-card>

      <!-- Python Configuration -->
      <m3e-card variant="outlined">
        <div slot="header" class="settings-card-header">
          <h4 class="settings-card-title">{{ t('pythonConfig') }}</h4>
        </div>
        <m3e-list slot="content">
          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">slideshow</span>
            {{ t('demoMode') }}
            <span slot="supporting-text">{{ t('demoModeSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-switch :checked="config.demoMode" @change="onDemoModeChange" />
            </div>
          </m3e-list-item>

          <!-- 解释器选择：每个本机解释器下方显示真实路径，便于辨认；右侧可添加自定义解释器 -->
          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">terminal</span>
            {{ t('interpreter') }}
            <span slot="supporting-text">{{ interpreterError || t('interpreterSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing interpreter-trailing">
              <m3e-select class="theme-select interpreter-select" @change="onInterpreterChange">
                <m3e-option value="auto" :selected="!config.interpreter || config.interpreter === 'auto'">
                  {{ t('interpreterAuto') }}
                </m3e-option>
                <m3e-option value="pyodide" :selected="config.interpreter === 'pyodide'">
                  {{ t('interpreterPyodide') }}
                </m3e-option>
                <m3e-optgroup>
                  <span slot="label">{{ t('interpreterLocal') }}</span>
                  <m3e-option v-for="v in nativePython.versions.value" :key="v.id" :value="v.id"
                    :selected="config.interpreter === v.id">
                    <span class="interp-option">
                      <span>{{ v.label }}</span>
                      <span v-if="v.path" class="interp-path">{{ v.path }}</span>
                    </span>
                  </m3e-option>
                </m3e-optgroup>
              </m3e-select>
              <m3e-icon-button width="narrow" :title="t('interpreterAdd')" @click="handleAddInterpreter">
                <span class="material-symbols-rounded">add</span>
              </m3e-icon-button>
            </div>
          </m3e-list-item>
        </m3e-list>
      </m3e-card>

      <!-- About Python You -->
      <m3e-card variant="outlined">
        <div slot="header" class="settings-card-header">
          <h4 class="settings-card-title">{{ t('aboutTitle') }}</h4>
        </div>
        <m3e-list slot="content">
          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">terminal</span>
            {{ t('aboutApp') }}
            <span slot="supporting-text">{{ t('aboutAppDesc') }}</span>
            <div slot="trailing" class="settings-trailing">
              v{{ aboutVersion }}
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">system_update_alt</span>
            {{ t('checkUpdate') }}
            <span slot="supporting-text">{{ updateStatusText }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-button variant="outlined" size="small" :disabled="updateStage === 'checking' || updateStage === 'downloading' || updateStage === 'preparing'"
                @click="handleCheckUpdate">
                <span slot="icon" class="material-symbols-rounded">refresh</span>
                {{ t('checkUpdate') }}
              </m3e-button>
            </div>
          </m3e-list-item>
        </m3e-list>
      </m3e-card>

      <!-- Data Management（FR-8.2：清除本地数据） -->
      <m3e-card variant="outlined">
        <div slot="header" class="settings-card-header">
          <h4 class="settings-card-title">{{ t('dataSettings') }}</h4>
        </div>
        <m3e-list slot="content">
          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">delete_forever</span>
            {{ t('clearData') }}
            <span slot="supporting-text">{{ t('clearDataSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-button variant="outlined" size="small" @click="isClearDataDialogOpen = true">
                <span slot="icon" class="material-symbols-rounded">delete</span>
                {{ t('clearData') }}
              </m3e-button>
            </div>
          </m3e-list-item>
        </m3e-list>
      </m3e-card>
    </div>

    <!-- 清除本地数据确认 Dialog -->
    <m3e-dialog :open="isClearDataDialogOpen" @cancel="isClearDataDialogOpen = false"
      @closed="isClearDataDialogOpen = false">
      <span slot="header" class="settings-dialog-title-row">
        <span class="material-symbols-rounded settings-dialog-icon is-danger">delete_forever</span>
        <span class="settings-dialog-title">{{ t('clearDataConfirmTitle') }}</span>
      </span>
      <p class="settings-dialog-desc">{{ t('clearDataConfirmMsg') }}</p>
      <div slot="actions" class="settings-dialog-actions">
        <m3e-button variant="text" size="small" @click="isClearDataDialogOpen = false">{{ t('cancel')
        }}</m3e-button>
        <m3e-button class="settings-danger-btn" variant="filled" size="small" @click="clearLocalData">
          {{ t('clearDataConfirm') }}
        </m3e-button>
      </div>
    </m3e-dialog>

    <!-- 检查更新弹窗（自绘） -->
    <m3e-dialog :open="isUpdateDialogOpen" @cancel="closeUpdateDialog" @closed="closeUpdateDialog">
      <span slot="header" class="settings-dialog-title-row">
        <span class="material-symbols-rounded settings-dialog-icon">system_update_alt</span>
        <span class="settings-dialog-title">{{ t('checkUpdate') }}</span>
      </span>

      <p class="settings-dialog-desc">{{ updateHeadline }}</p>

      <div v-if="updateNotesText" class="update-notes">
        <div class="update-notes-title">{{ t('updateReleaseNotes') }}</div>
        <pre class="update-notes-body">{{ updateNotesText }}</pre>
      </div>

      <div v-if="updateStage === 'downloading'" class="update-progress">
        <!-- 拿到真实百分比才走确定态，否则用不确定态动画（不伪造进度） -->
        <m3e-linear-progress-indicator v-if="updatePercent !== null" class="update-progress-bar"
          :value="updatePercent"></m3e-linear-progress-indicator>
        <m3e-linear-progress-indicator v-else class="update-progress-bar" mode="indeterminate">
        </m3e-linear-progress-indicator>
        <span class="update-progress-text">{{ updateStatusText }}</span>
      </div>

      <div slot="actions" class="settings-dialog-actions">
        <m3e-button variant="text" size="small" :disabled="updateStage === 'downloading' || updateStage === 'preparing'"
          @click="closeUpdateDialog">{{ t('updateLater') }}</m3e-button>
        <m3e-button v-if="updateInfo?.hasUpdate && updateStage !== 'downloading' && updateStage !== 'preparing'"
          variant="filled" size="small" @click="startUpdate">{{ t('updateNow') }}</m3e-button>
      </div>
    </m3e-dialog>
  </m3e-content-pane>
</template>

<style scoped>
.settings-workspace-view {
  height: 100%;
  /* 与 REPL 终端卡片一致：surface 色卡片充满整个页面，留 12px 外边距与 10px 圆角；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制 */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 12px; /* CornerMedium，与其余主面板一致 */
  --m3e-content-pane-container-color: var(--surface-color);
  --m3e-content-pane-container-padding: 2rem;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
  max-width: 72rem;
  /* 设置卡片列居中：左右自动外边距 */
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.settings-card-header {
  h4 {
    line-height: 2.4rem;
  }

  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 清除数据确认 Dialog 样式（与 App.vue 对话框风格一致） */
.settings-dialog-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-dialog-icon {
  font-size: 1.25rem;
  color: var(--primary);
}

.settings-dialog-icon.is-danger {
  color: var(--error);
}

.settings-dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.settings-dialog-desc {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  white-space: pre-wrap;
}

.settings-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.settings-danger-btn {
  --m3e-button-container-color: var(--error);
  --m3e-button-label-text-color: var(--on-error);
  --m3e-button-icon-color: var(--on-error);
  --m3e-button-pressed-state-layer-color: var(--on-error);
  --m3e-button-focus-state-layer-color: var(--on-error);
}

/* 更新弹窗：发布说明滚动区 + 下载进度条 */
.update-notes {
  margin-top: 16px;
}

.update-notes-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.update-notes-body {
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
  padding: 12px;
  border-radius: 12px;
  background-color: var(--surface-variant);
  color: var(--text-color);
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.update-progress {
  margin-top: 16px;
}

/* 进度条用组件库的 m3e-linear-progress-indicator：厚度 4dp、全圆角、
   轨道 secondary-container、活动段 primary 都由它自己的 token 决定，这里只占位 */
.update-progress-bar {
  display: block;
  width: 100%;
}

.update-progress-text {
  display: block;
  margin-top: 8px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* 小标题行距收紧 */
.settings-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--secondary);
  margin: 0;
}

.settings-trailing {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 代码主题选择框：补上边框颜色（m3e-select 默认无边框） */
.theme-select {
  width: 12rem;
  padding:0.8rem 1rem 0.8rem 1.4rem;
  border: 1.4px solid var(--border-color-muted);
  border-radius: var(--m3e-select-container-shape, 8px);
}

/* 解释器选择：更宽的宽度容纳路径，右侧按钮与选择框留 4dp 间隔 */
.interpreter-trailing {
  gap: 4px;
}

.interpreter-select {
  width: 20rem;
}

.theme-select:focus {
  border: 2px solid var(--primary);
}

.font-size-trailing {
  width: 140px;
}

m3e-card {
  --m3e-card-padding:1rem;
  --m3e-card-container-color:var(--bg-color);
}
</style>

<!-- optgroup 分组 label 样式已全局化（m3eStyle.css 按 m3e-option-panel 元素名
     命中所有 select 面板），此处无需非 scoped 块 -->
