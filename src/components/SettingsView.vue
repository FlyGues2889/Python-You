<script setup lang="ts">
import { computed } from 'vue';
import { AppConfig } from '../types';
import { useI18n } from '../utils/i18n';
import { resolveCodeTheme } from '../utils/theme';
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

const onSwitchChange = (e: Event, key: 'enableWheelZoom' | 'autoPairQuotes' | 'demoMode') => {
  props.config[key] = !!(e.target as any).checked;
};
const onWheelZoomChange = (e: Event) => onSwitchChange(e, 'enableWheelZoom');
const onAutoPairChange = (e: Event) => onSwitchChange(e, 'autoPairQuotes');
const onDemoModeChange = (e: Event) => onSwitchChange(e, 'demoMode');
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
              v0.3.3
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded">slideshow</span>
            {{ t('demoMode') }}
            <span slot="supporting-text">{{ t('demoModeSubtitle') }}</span>
            <div slot="trailing" class="settings-trailing">
              <m3e-switch :checked="config.demoMode" @change="onDemoModeChange" />
            </div>
          </m3e-list-item>

          <m3e-list-item>
            <span slot="leading" class="material-symbols-rounded" style="color: var(--primary);">auto_awesome</span>
            {{ t('aiEngine') }}
            <span slot="supporting-text">{{ t('aiEngineDesc') }}</span>
          </m3e-list-item>
        </m3e-list>
      </m3e-card>
    </div>
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

.settings-grid m3e-card {
  --m3e-card-shape: 20px;
}

.settings-card-header {
  h4 {
    line-height: 2.4rem;
  }

  display: flex;
  align-items: center;
  justify-content: space-between;
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

<!-- 非 scoped：m3e-select 的选项面板由 JS 动态插入（insertAdjacentElement afterend，位于
     select 同级而非后代），无 data-v 属性，scoped 选择器命中不了。
     经 select 的 panel-class 属性加唯一类名定位。 -->
<style>
.theme-select-panel m3e-optgroup {
  /* 分类标题：减小行高（容器 48px → 32px）、文字改 secondary，与选项正文区分；
     变量会继承给组内 option，须一并恢复默认 */
  --m3e-option-height: 32px;
  --m3e-option-color: var(--secondary);
}

.theme-select-panel m3e-optgroup m3e-option {
  --m3e-option-height: 48px;
  --m3e-option-color: var(--on-surface);
}
</style>
