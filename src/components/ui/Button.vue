<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "icon" | "tool";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    fullWidth?: boolean;
    pressed?: boolean;
    title?: string;
  }>(),
  {
    variant: "primary",
    type: "button",
    disabled: false,
    fullWidth: false,
    pressed: false,
  },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="title"
    :aria-pressed="variant === 'tool' ? pressed : undefined"
    class="type-button inline-flex items-center justify-center gap-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-35"
    :class="[
      fullWidth ? 'w-full' : '',
      variant === 'primary' &&
        'rounded-pill bg-primary px-4 py-2 text-on-primary hover:opacity-90',
      variant === 'secondary' &&
        'rounded-pill border border-hairline bg-canvas px-4 py-2 text-ink hover:bg-surface-soft',
      variant === 'ghost' && 'rounded-md px-2.5 py-1.5 text-ink/70 hover:bg-surface-soft hover:text-ink',
      variant === 'icon' &&
        'size-9 shrink-0 rounded-full bg-surface-soft text-ink hover:bg-hairline-soft',
      variant === 'tool' &&
        (pressed
          ? 'rounded-md bg-primary px-2.5 py-1.5 text-on-primary'
          : 'rounded-md px-2.5 py-1.5 text-ink/70 hover:bg-surface-soft hover:text-ink'),
    ]"
  >
    <slot />
  </button>
</template>
