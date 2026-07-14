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
  const max = 12;
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
    class="inline-flex items-center gap-0.5 rounded-md border border-hairline bg-surface-soft p-0.5"
    role="group"
    aria-label="Aspect ratio"
  >
    <button
      v-for="layout in LAYOUT_LIST"
      :key="layout.key"
      type="button"
      class="type-meta flex h-8 shrink-0 items-center gap-1 rounded-[5px] px-1.5 transition-colors sm:gap-1.5 sm:px-2"
      :class="
        modelValue === layout.key
          ? 'bg-canvas text-ink shadow-sm'
          : 'text-ink/50 hover:bg-canvas/60 hover:text-ink'
      "
      :title="`${layout.label} (${layout.key})`"
      :aria-pressed="modelValue === layout.key"
      @click="$emit('update:modelValue', layout.key)"
    >
      <span
        class="inline-block shrink-0 rounded-xs border border-current opacity-70"
        :style="frameStyle(layout.ratio)"
        aria-hidden="true"
      />
      <!-- Always show short ratio on narrow toolbars; labels stay readable at 320px when row scrolls -->
      <span class="tabular-nums">{{ layout.shortLabel }}</span>
    </button>
  </div>
</template>
