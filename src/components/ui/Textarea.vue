<script setup lang="ts">
defineProps<{
  id?: string;
  label?: string;
  modelValue: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <label class="flex min-h-0 flex-1 flex-col gap-1.5" :for="id">
    <span v-if="label" class="type-label shrink-0 text-ink/55">{{ label }}</span>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 5"
      :disabled="disabled"
      class="type-body min-h-[8rem] w-full flex-1 resize-none rounded-md border border-hairline bg-canvas px-3 py-2 text-ink placeholder:text-ink/30 disabled:opacity-50"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </label>
</template>
