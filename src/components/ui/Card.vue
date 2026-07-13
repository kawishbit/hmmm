<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: "md" | "lg" | "none";
    tone?: "canvas" | "soft";
  }>(),
  { padding: "lg", tone: "canvas" },
);
</script>

<template>
  <div
    class="rounded-lg border border-hairline"
    :class="{
      'bg-canvas': tone === 'canvas',
      'bg-surface-soft border-transparent': tone === 'soft',
      'p-4': padding === 'md',
      'p-5 sm:p-6': padding === 'lg',
      'p-0': padding === 'none',
    }"
  >
    <slot />
  </div>
</template>
