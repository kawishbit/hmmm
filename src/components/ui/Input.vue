<script setup lang="ts">
defineProps<{
  id?: string;
  label?: string;
  modelValue: string;
  placeholder?: string;
  autocomplete?: string;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <label class="flex flex-col gap-1.5" :for="id">
    <span v-if="label" class="type-label text-ink/55">{{ label }}</span>
    <input
      :id="id"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      class="type-body w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink placeholder:text-ink/30 disabled:opacity-50"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
