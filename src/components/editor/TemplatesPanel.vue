<script setup lang="ts">
import { type QuoteTemplate, TEMPLATES } from "../../lib/templates";

defineProps<{
  activeId?: string | null;
}>();

const emit = defineEmits<{
  apply: [template: QuoteTemplate];
}>();

function thumbStyle(t: QuoteTemplate): Record<string, string> {
  const bg = t.background;
  if (bg.type === "solid") {
    return { backgroundColor: bg.color };
  }
  if (bg.type === "gradient") {
    return { background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` };
  }
  if (bg.type === "gallery") {
    return {
      backgroundImage: `url("/backgrounds/${bg.id}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: "#1f1d3d" };
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="type-body-sm text-ink/55">
      One-click style presets. Your text is kept unless the quote is empty.
    </p>
    <div class="flex flex-col gap-2">
      <button
        v-for="t in TEMPLATES"
        :key="t.id"
        type="button"
        class="rounded-md border p-2.5 text-left transition-colors"
        :class="
          activeId === t.id
            ? 'border-ink bg-surface-soft'
            : 'border-hairline hover:border-ink/30 hover:bg-surface-soft/60'
        "
        :aria-pressed="activeId === t.id"
        @click="emit('apply', t)"
      >
        <div class="mb-2 flex gap-1.5">
          <span class="h-8 flex-1 rounded-sm border border-hairline" :style="thumbStyle(t)" />
        </div>
        <p class="type-body font-medium text-ink">{{ t.label }}</p>
        <p class="type-body-sm mt-0.5 text-ink/50">{{ t.description }} · {{ t.aspectRatio }}</p>
      </button>
    </div>
  </div>
</template>
