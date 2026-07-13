<script setup lang="ts">
import { computed } from "vue";
import { COLOR_PRESETS, type FontWeightOption, fontById, QUOTE_FONTS } from "../../lib/fonts";
import { PRIMARY_MAX_SIZE_DEFAULT, PRIMARY_MIN_SIZE } from "../../lib/pretext-fit";
import type { QuoteDocument, TextAlign, VerticalAlign } from "../../lib/types";

const props = defineProps<{
  document: QuoteDocument;
  /** Export-space fitted primary size for display */
  fittedPrimarySize?: number;
}>();

const emit = defineEmits<{
  patchStyle: [partial: Partial<QuoteDocument["style"]>];
}>();

const style = computed(() => props.document.style);
const activeFont = computed(() => fontById(style.value.fontId));

const weights = computed(() => activeFont.value.weights);

function setFont(id: string) {
  const f = fontById(id);
  let weight = style.value.fontWeight;
  if (!f.weights.includes(weight)) {
    weight = f.weights.includes(500) ? 500 : f.weights[0];
  }
  emit("patchStyle", {
    fontId: f.id,
    fontFamily: f.cssFamily,
    fontWeight: weight,
  });
}

function setWeight(w: FontWeightOption) {
  emit("patchStyle", { fontWeight: w });
}

function setSize(n: number) {
  emit("patchStyle", {
    fontSizePx: Math.min(PRIMARY_MAX_SIZE_DEFAULT, Math.max(PRIMARY_MIN_SIZE, n)),
  });
}

function setColor(color: string) {
  emit("patchStyle", { color });
}

function setAuthorColor(authorColor: string) {
  emit("patchStyle", { authorColor });
}

function setAlign(align: TextAlign) {
  emit("patchStyle", { align });
}

function setVertical(verticalAlign: VerticalAlign) {
  emit("patchStyle", { verticalAlign });
}

const aligns: { id: TextAlign; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

const verticals: { id: VerticalAlign; label: string }[] = [
  { id: "top", label: "Top" },
  { id: "middle", label: "Middle" },
  { id: "bottom", label: "Bottom" },
];
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Font family -->
    <section>
      <p class="type-label mb-2 text-ink/55">Font</p>
      <div class="flex flex-col gap-1">
        <button
          v-for="f in QUOTE_FONTS"
          :key="f.id"
          type="button"
          class="flex items-center justify-between rounded-md border px-2.5 py-2 text-left transition-colors"
          :class="
            style.fontId === f.id
              ? 'border-ink bg-surface-soft'
              : 'border-hairline hover:border-ink/30'
          "
          :aria-pressed="style.fontId === f.id"
          @click="setFont(f.id)"
        >
          <span class="type-body" :style="{ fontFamily: f.cssFamily }">{{ f.label }}</span>
          <span class="type-meta text-ink/35">{{ f.category }}</span>
        </button>
      </div>
    </section>

    <!-- Weight -->
    <section>
      <p class="type-label mb-2 text-ink/55">Weight</p>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="w in weights"
          :key="w"
          type="button"
          class="type-meta rounded-md px-2.5 py-1.5 transition-colors"
          :class="
            style.fontWeight === w
              ? 'bg-primary text-on-primary'
              : 'bg-surface-soft text-ink/60 hover:text-ink'
          "
          :aria-pressed="style.fontWeight === w"
          @click="setWeight(w)"
        >
          {{ w }}
        </button>
      </div>
    </section>

    <!-- Preferred max size -->
    <section>
      <div class="mb-1.5 flex items-center justify-between gap-2">
        <p class="type-label text-ink/55">Max size</p>
        <p class="type-meta text-ink/40">
          {{ style.fontSizePx }}px
          <span v-if="fittedPrimarySize && fittedPrimarySize < style.fontSizePx">
            · auto {{ fittedPrimarySize }}px
          </span>
        </p>
      </div>
      <input
        type="range"
        class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-primary"
        :min="PRIMARY_MIN_SIZE"
        :max="PRIMARY_MAX_SIZE_DEFAULT"
        step="1"
        :value="style.fontSizePx"
        aria-label="Preferred maximum font size"
        @input="setSize(Number(($event.target as HTMLInputElement).value))"
      />
      <p class="type-body-sm mt-1 text-ink/40">
        Auto-fit never exceeds this. Long quotes shrink below it.
      </p>
    </section>

    <!-- Align -->
    <section>
      <p class="type-label mb-2 text-ink/55">Align</p>
      <div class="flex gap-1">
        <button
          v-for="a in aligns"
          :key="a.id"
          type="button"
          class="type-meta flex-1 rounded-md px-2 py-1.5 transition-colors"
          :class="
            style.align === a.id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-soft text-ink/60 hover:text-ink'
          "
          :aria-pressed="style.align === a.id"
          @click="setAlign(a.id)"
        >
          {{ a.label }}
        </button>
      </div>
    </section>

    <!-- Vertical -->
    <section>
      <p class="type-label mb-2 text-ink/55">Vertical</p>
      <div class="flex gap-1">
        <button
          v-for="v in verticals"
          :key="v.id"
          type="button"
          class="type-meta flex-1 rounded-md px-2 py-1.5 transition-colors"
          :class="
            style.verticalAlign === v.id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-soft text-ink/60 hover:text-ink'
          "
          :aria-pressed="style.verticalAlign === v.id"
          @click="setVertical(v.id)"
        >
          {{ v.label }}
        </button>
      </div>
    </section>

    <!-- Quote color -->
    <section>
      <p class="type-label mb-2 text-ink/55">Quote color</p>
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="c in COLOR_PRESETS"
          :key="c"
          type="button"
          class="size-7 rounded-full border transition-shadow"
          :class="
            style.color.toLowerCase() === c
              ? 'border-ink ring-2 ring-ink ring-offset-1'
              : 'border-hairline'
          "
          :style="{ backgroundColor: c }"
          :aria-label="`Quote color ${c}`"
          @click="setColor(c)"
        />
        <label class="type-body-sm flex items-center gap-1.5 text-ink/55">
          <input
            type="color"
            class="size-7 cursor-pointer rounded border border-hairline bg-canvas p-0"
            :value="style.color.startsWith('#') ? style.color : '#ffffff'"
            aria-label="Custom quote color"
            @input="setColor(($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </section>

    <!-- Author color -->
    <section>
      <p class="type-label mb-2 text-ink/55">Author color</p>
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="c in COLOR_PRESETS"
          :key="`a-${c}`"
          type="button"
          class="size-7 rounded-full border transition-shadow"
          :class="
            style.authorColor.toLowerCase() === c
              ? 'border-ink ring-2 ring-ink ring-offset-1'
              : 'border-hairline'
          "
          :style="{ backgroundColor: c }"
          :aria-label="`Author color ${c}`"
          @click="setAuthorColor(c)"
        />
        <input
          type="color"
          class="size-7 cursor-pointer rounded border border-hairline bg-canvas p-0"
          :value="style.authorColor.startsWith('#') ? style.authorColor : '#ffffff'"
          aria-label="Custom author color"
          @input="setAuthorColor(($event.target as HTMLInputElement).value)"
        />
      </div>
    </section>
  </div>
</template>
