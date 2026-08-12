<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    text?: string;
    tag?: string;
  }>(),
  {
    text: '',
    tag: 'span'
  }
);

interface TextSegment {
  type: 'text' | 'code';
  content: string;
}

const parsedSegments = computed<TextSegment[]>(() => {
  if (!props.text) return [];

  // Remove triple backtick wrappers if any, then split by single backticks
  const str = props.text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '');
  const parts = str.split('`');
  const segments: TextSegment[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (i % 2 === 1) {
      // Inside backticks -> inline code pill
      segments.push({
        type: 'code',
        content: part
      });
    } else {
      // Normal text segment
      segments.push({
        type: 'text',
        content: part
      });
    }
  }

  return segments;
});
</script>

<template>
  <component :is="tag" class="formatted-tutorial-text">
    <template v-for="(seg, idx) in parsedSegments" :key="idx">
      <code v-if="seg.type === 'code'" class="inline-code-badge">{{ seg.content }}</code>
      <template v-else>{{ seg.content }}</template>
    </template>
  </component>
</template>

<style scoped>
.formatted-tutorial-text {
  line-height: inherit;
  color: inherit;
}

.inline-code-badge {
  font-family: var(--font-mono, 'Fira Code', 'Consolas', monospace);
  font-size: 0.88em;
  font-weight: 600;
  color: var(--on-secondary-container);
  background-color: var(--secondary-container);
  border: 1px solid var(--border-color-muted);
  padding: 1.5px 6px;
  border-radius: 5px;
  margin: 0 3px;
  display: inline-block;
  line-height: 1.35;
  vertical-align: baseline;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
