<script setup lang="ts">
import { computed, ref } from "vue";
import {
  colorsForTone,
  FILTER_PRESETS,
  type FilterPresetId,
  GALLERY,
  GRADIENT_PRESETS,
  galleryById,
  MAX_BLUR_PX,
  SOLID_PRESETS,
} from "../../lib/backgrounds";
import type { BackgroundSource, QuoteDocument } from "../../lib/types";
import { processImageUpload, revokeIfObjectUrl, UploadError } from "../../lib/upload";

const props = defineProps<{
  document: QuoteDocument;
}>();

const emit = defineEmits<{
  patch: [partial: Partial<QuoteDocument>];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploadError = ref<string | null>(null);
const uploading = ref(false);

const bg = computed(() => props.document.background);

const selectedGalleryId = computed(() => (bg.value.type === "gallery" ? bg.value.id : null));

function applyTone(tone: "light" | "dark") {
  const colors = colorsForTone(tone);
  emit("patch", {
    style: {
      ...props.document.style,
      color: colors.color,
      authorColor: colors.authorColor,
    },
  });
}

function setBackground(next: BackgroundSource, tone?: "light" | "dark") {
  uploadError.value = null;
  // Revoke previous upload blob if leaving upload mode
  if (props.document.background.type === "upload" && next.type !== "upload") {
    revokeIfObjectUrl(props.document.background.objectUrl);
  }
  if (props.document.background.type === "upload" && next.type === "upload") {
    if (props.document.background.objectUrl !== next.objectUrl) {
      revokeIfObjectUrl(props.document.background.objectUrl);
    }
  }
  emit("patch", { background: next });
  if (tone) applyTone(tone);
}

function pickSolid(color: string, tone: "light" | "dark") {
  setBackground({ type: "solid", color }, tone);
}

function pickGradient(from: string, to: string, tone: "light" | "dark") {
  setBackground({ type: "gradient", from, to }, tone);
}

function pickGallery(id: string) {
  const item = galleryById(id);
  setBackground({ type: "gallery", id }, item?.textTone ?? "light");
}

function setFilter(id: FilterPresetId) {
  emit("patch", { filterId: id });
}

function setBlur(value: number) {
  emit("patch", { blurPx: value });
}

function setScrim(value: number) {
  emit("patch", { scrimOpacity: value });
}

function openFilePicker() {
  fileInput.value?.click();
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  uploading.value = true;
  uploadError.value = null;
  try {
    const objectUrl = await processImageUpload(file);
    setBackground({ type: "upload", objectUrl }, "light");
    // Sensible default scrim for photos
    if (props.document.scrimOpacity < 0.15) {
      emit("patch", { scrimOpacity: 0.3 });
    }
  } catch (err) {
    const msg = err instanceof UploadError ? err.message : "Could not load that image.";
    uploadError.value = msg;
  } finally {
    uploading.value = false;
  }
}

function isSolidActive(color: string) {
  return bg.value.type === "solid" && bg.value.color === color;
}

function isGradientActive(from: string, to: string) {
  return bg.value.type === "gradient" && bg.value.from === from && bg.value.to === to;
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Solids -->
    <section>
      <p class="type-label mb-2 text-ink/55">Solid</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in SOLID_PRESETS"
          :key="s.id"
          type="button"
          class="size-7 rounded-full border transition-shadow"
          :class="
            isSolidActive(s.color)
              ? 'border-ink ring-2 ring-ink ring-offset-1'
              : 'border-hairline hover:border-ink/40'
          "
          :style="{ backgroundColor: s.color }"
          :title="s.label"
          :aria-label="`Solid ${s.label}`"
          :aria-pressed="isSolidActive(s.color)"
          @click="pickSolid(s.color, s.textTone)"
        />
      </div>
    </section>

    <!-- Gradients -->
    <section>
      <p class="type-label mb-2 text-ink/55">Gradient</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="g in GRADIENT_PRESETS"
          :key="g.id"
          type="button"
          class="h-7 w-10 rounded-md border transition-shadow"
          :class="
            isGradientActive(g.from, g.to)
              ? 'border-ink ring-2 ring-ink ring-offset-1'
              : 'border-hairline hover:border-ink/40'
          "
          :style="{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }"
          :title="g.label"
          :aria-label="`Gradient ${g.label}`"
          :aria-pressed="isGradientActive(g.from, g.to)"
          @click="pickGradient(g.from, g.to, g.textTone)"
        />
      </div>
    </section>

    <!-- Gallery -->
    <section>
      <p class="type-label mb-2 text-ink/55">Gallery</p>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="item in GALLERY"
          :key="item.id"
          type="button"
          class="relative aspect-square overflow-hidden rounded-md border bg-surface-soft transition-shadow"
          :class="
            selectedGalleryId === item.id
              ? 'border-ink ring-2 ring-ink ring-offset-1'
              : 'border-hairline hover:border-ink/40'
          "
          :title="item.label"
          :aria-label="item.label"
          :aria-pressed="selectedGalleryId === item.id"
          @click="pickGallery(item.id)"
        >
          <img
            :src="item.src"
            :alt="item.label"
            class="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable="false"
          />
        </button>
      </div>
    </section>

    <!-- Upload -->
    <section>
      <p class="type-label mb-2 text-ink/55">Upload</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        class="hidden"
        @change="onFileChange"
      />
      <button
        type="button"
        class="type-button flex w-full items-center justify-center rounded-md border border-dashed border-hairline bg-surface-soft px-3 py-2.5 text-ink/80 hover:border-ink/30 hover:bg-hairline-soft"
        :disabled="uploading"
        @click="openFilePicker"
      >
        {{
          uploading
            ? "Processing…"
            : bg.type === "upload"
              ? "Replace image…"
              : "Choose image…"
        }}
      </button>
      <p v-if="bg.type === 'upload'" class="type-body-sm mt-1.5 text-ink/45">
        Local only — not uploaded to a server.
      </p>
      <p v-if="uploadError" class="type-body-sm mt-1.5 text-accent-magenta" role="alert">
        {{ uploadError }}
      </p>
    </section>

    <!-- Blur -->
    <section>
      <div class="mb-1.5 flex items-center justify-between gap-2">
        <p class="type-label text-ink/55">Blur</p>
        <p class="type-meta text-ink/40">{{ document.blurPx }}px</p>
      </div>
      <input
        type="range"
        class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-primary"
        min="0"
        :max="MAX_BLUR_PX"
        step="1"
        :value="document.blurPx"
        aria-label="Background blur"
        @input="setBlur(Number(($event.target as HTMLInputElement).value))"
      />
    </section>

    <!-- Filters -->
    <section>
      <p class="type-label mb-2 text-ink/55">Filter</p>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="f in FILTER_PRESETS"
          :key="f.id"
          type="button"
          class="type-meta rounded-md px-2 py-1.5 transition-colors"
          :class="
            document.filterId === f.id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-soft text-ink/60 hover:text-ink'
          "
          :aria-pressed="document.filterId === f.id"
          @click="setFilter(f.id)"
        >
          {{ f.label }}
        </button>
      </div>
    </section>

    <!-- Scrim -->
    <section>
      <div class="mb-1.5 flex items-center justify-between gap-2">
        <p class="type-label text-ink/55">Darken overlay</p>
        <p class="type-meta text-ink/40">{{ Math.round(document.scrimOpacity * 100) }}%</p>
      </div>
      <input
        type="range"
        class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-primary"
        min="0"
        max="70"
        step="1"
        :value="Math.round(document.scrimOpacity * 100)"
        aria-label="Background darken overlay"
        @input="setScrim(Number(($event.target as HTMLInputElement).value) / 100)"
      />
      <p class="type-body-sm mt-1 text-ink/40">Helps light text read on busy images.</p>
    </section>
  </div>
</template>
