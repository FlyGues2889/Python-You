<script setup lang="ts">
import { computed } from 'vue';
import { AppConfig } from '../types';
import { hljs } from '../utils/highlightSetup';

const props = defineProps<{
  config: AppConfig;
  codeTheme?: string; // 已解析的代码主题（'system' 由上层映射为具体主题）
}>();

const sampleCode = `# Python You 实时编辑器配置预览
def calculate_factorial(n: int) -> int:
    """计算非负整数的阶乘示例"""
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

result = calculate_factorial(5)
print(f"5! = {result}")`;

const highlightedSample = computed(() => {
  try {
    return hljs.highlight(sampleCode, { language: 'python' }).value;
  } catch (e) {
    return sampleCode;
  }
});

const currentThemeClass = computed(() => {
  const t = props.codeTheme || props.config.codeTheme || 'github-dark';
  return `theme-${t}`;
});
</script>

<template>
  <div class="editor-preview-container">
    <div class="preview-editor-body" :class="currentThemeClass">
      <!-- Line Numbers Column -->
      <div v-if="config.showLineNumbers !== false" class="preview-line-numbers">
      </div>

      <!-- Code Area -->
      <div class="preview-code-area">
        <pre
          class="preview-code-pre"
          :style="{
            fontSize: `${config.fontSize || 14}px`,
            tabSize: config.tabSize || 4
          }"
        ><code class="hljs" v-html="highlightedSample"></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-preview-container {
  border: 1px solid var(--border-color-muted);
  border-radius: 12px;
  overflow: hidden;
  margin: 12px 16px 16px 16px;
  background-color: var(--surface-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.preview-editor-body {
  display: flex;
  min-height: 180px;
  padding: 8px 0;
  font-family: var(--font-mono);
  position: relative;
  transition: all 0.2s ease;
}

.preview-line-numbers {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 12px;
  user-select: none;
  opacity: 0.5;
  margin-right: 8px;
}

.preview-code-area {
  flex: 1;
  overflow: hidden;
  height: 14rem;
}

.preview-code-pre {
  margin: 0;
  padding: 0;
  line-height: 1.5;
  white-space: pre;
  background: transparent;
}

.preview-code-pre code.hljs {
  background: transparent;
  padding: 0;
  font-family: var(--font-mono);
}
</style>
