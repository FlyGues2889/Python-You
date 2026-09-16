<script setup lang="ts">
import { computed, ref } from 'vue';
import { AppConfig } from '../types';
import { useI18n } from '../utils/i18n';
import { resolveCodeTheme } from '../utils/theme';
import { nativePython } from '../utils/nativePython';
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

          <!-- 解释器选择：仅本机安装有至少一个 Python 版本时显示 -->
          <m3e-list-item v-if="nativePython.versions.value.length > 0">
            <span slot="leading" class="material-symbols-rounded">terminal</span>
            {{ t('interpreter') }}
            <span slot="supporting-text">{{ t('interpreterSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-select class="theme-select" @change="onInterpreterChange">
                <m3e-option value="auto" :selected="!config.interpreter || config.interpreter === 'auto'">
                  {{ t('interpreterAuto') }}
                </m3e-option>
                <m3e-option value="pyodide" :selected="config.interpreter === 'pyodide'">
                  {{ t('interpreterPyodide') }}
                </m3e-option>
                <m3e-optgroup>
                  <span slot="label">{{ t('interpreterLocal') }}</span>
                  <m3e-option v-for="v in nativePython.versions.value" :key="v.id" :value="v.id"
                    :selected="config.interpreter === v.id">{{ v.label }}</m3e-option>
                </m3e-optgroup>
              </m3e-select>
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
              v0.3.51
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded" style="color: var(--primary);">auto_awesome</span>
            {{ t('aiEngine') }}
            <span slot="supporting-text">{{ t('aiEngineDesc') }}</span>
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
  </m3e-content-pane>
</template>

<style scoped>
.settings-workspace-view {
  height: 100%;
  /* 与 REPL 终端卡片一致：surface 色卡片充满整个页面，留 12px 外边距与 10px 圆角；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制 */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 10px;
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

.theme-select:focus {
  border: 2px solid var(--primary);
}

.font-size-trailing {
  width: 140px;
}

m3e-card {
  --m3e-card-padding:1rem;
}
</style>

<!-- optgroup 分组 label 样式已全局化（m3eStyle.css 按 m3e-option-panel 元素名
     命中所有 select 面板），此处无需非 scoped 块 -->
