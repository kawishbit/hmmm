<script setup lang="ts">
import { LAYOUT_LIST } from "../../lib/layouts";
import type { AspectRatioKey } from "../../lib/types";

defineProps<{
  modelValue: AspectRatioKey;
}>();

defineEmits<{
  "update:modelValue": [value: AspectRatioKey];
}>();

/** Mini frame silhouette for each ratio */
function frameStyle(ratio: number) {
  const max = 14;
  let w: number;
  let h: number;
  if (ratio >= 1) {
    w = max;
    h = max / ratio;
  } else {
    h = max;
    w = max * ratio;
  }
  return {
    width: `${w}px`,
    height: `${h}px`,
  };
}
</script>

<template>
  <div
    class="flex items-center gap-0.5 rounded-lg border border-hairline bg-surface-soft p-0.5"
    role="group"
    aria-label="Aspect ratio"
  >
    <button
      v-for="layout in LAYOUT_LIST"
      :key="layout.key"
      type="button"
      class="type-meta flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors"
      :class="
        modelValue === layout.key
          ? 'bg-canvas text-ink shadow-sm ring-1 ring-hairline'
          : 'text-ink/50 hover:text-ink'
      "
      :title="`${layout.label} (${layout.key})`"
      :aria-pressed="modelValue === layout.key"
      @click="$emit('update:modelValue', layout.key)"
    >
      <span
        class="inline-block shrink-0 rounded-[2px] border border-current opacity-70"
        :style="frameStyle(layout.ratio)"
        aria-hidden="true"
      />
      <span class="hidden sm:inline">{{ layout.shortLabel }}</span>
    </button>
  </div>
</template>
