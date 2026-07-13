<script setup lang="ts">
import { SITE_THEMES, type SiteThemeId } from "../../lib/themes";

defineProps<{
  modelValue: SiteThemeId;
}>();

defineEmits<{
  "update:modelValue": [id: SiteThemeId];
}>();
</script>

<template>
  <div
    class="flex items-center gap-0.5 rounded-md border border-hairline bg-surface-soft p-0.5"
    role="group"
    aria-label="Site theme"
  >
    <button
      v-for="t in SITE_THEMES"
      :key="t.id"
      type="button"
      class="flex size-8 items-center justify-center rounded-[5px] transition-colors"
      :class="
        modelValue === t.id
          ? 'bg-canvas shadow-sm'
          : 'hover:bg-canvas/60'
      "
      :title="t.label"
      :aria-label="t.label"
      :aria-pressed="modelValue === t.id"
      @click="$emit('update:modelValue', t.id)"
    >
      <span
        class="size-4 rounded-full border border-hairline"
        :style="{ backgroundColor: t.swatch }"
      />
    </button>
  </div>
</template>
