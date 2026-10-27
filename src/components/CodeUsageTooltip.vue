<script setup lang="ts">
import { computed } from 'vue';

// 代码用法提示卡片（编辑器与教程文章的代码块共用）。
// 定位用视口坐标并把卡片 Teleport 到 body：文章里的代码卡有 overflow: hidden、
// 外层还是滚动容器，做成卡片内的绝对定位会被裁掉；fixed 定位则始终完整显示。
const props = defineProps<{
  visible: boolean;
  /** 语法行（加粗、主色） */
  syntax: string;
  /** 说明行，可为空 */
  description?: string;
  /** 光标的视口坐标 */
  x: number;
  y: number;
  /** 字号（像素）。不传用默认 14px —— 提示不跟随代码块字号缩放 */
  fontSize?: number;
}>();

const style = computed(() => {
  const size = props.fontSize || 14;
  const ratio = size / 15;
  return {
    fontSize: `${size}px`,
    // 光标右下侧浮出；上方放得下时改放到光标上方，避免盖住正在看的那一行
    left: `${props.x + 12 * ratio}px`,
    top: props.y > 44 * ratio ? `${props.y - 34 * ratio}px` : `${props.y + 16 * ratio}px`
  };
});
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="code-hover-tooltip" :style="style">
      <div class="hover-syntax">{{ syntax }}</div>
      <div v-if="description" class="hover-desc">{{ description }}</div>
    </div>
  </Teleport>
</template>

<style scoped>
.code-hover-tooltip {
  position: fixed;
  /* 高于正文与面板，低于 Toast（35000）等全局提示层 */
  z-index: 9000;
  max-width: 380px;
  padding: 6px 10px;
  font-family: var(--font-mono);
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--surface-container-high);
  border: 1px solid var(--border-color-muted);
  border-radius: 12px; /* 富提示：M3 RichTooltip.ContainerShape = CornerMedium */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  white-space: pre-line;
  overflow-wrap: break-word;
}

.hover-syntax {
  font-weight: 700;
  color: var(--primary);
}
</style>
