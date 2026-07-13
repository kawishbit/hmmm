<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  colorsForTone,
  FILTER_PRESETS,
  type FilterPresetId,
  GALLERY_PACKS,
  type GalleryPack,
  GRADIENT_PRESETS,
  galleryById,
  galleryByPack,
  MAX_BLUR_PX,
  SOLID_PRESETS,
} from "../../lib/backgrounds";
import type { BackgroundSource, QuoteDocument } from "../../lib/types";
import { processImageUpload, revokeIfObjectUrl, UploadError } from "../../lib/upload";

const PACK_KEY = "hmmm-gallery-pack";

const props = defineProps<{
  document: QuoteDocument;
}>();

const emit = defineEmits<{
  patch: [partial: Partial<QuoteDocument>];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploadError = ref<string | null>(null);
const uploading = ref(false);
const dragOver = ref(false);
const galleryPack = ref<GalleryPack | "all">("all");

const bg = computed(() => props.document.background);

const selectedGalleryId = computed(() => (bg.value.type === "gallery" ? bg.value.id : null));
const filteredGallery = computed(() => galleryByPack(galleryPack.value));
const uploadFileName = computed(() =>
  bg.value.type === "upload" ? (bg.value.fileName ?? "Uploaded image") : null,
);

onMounted(() => {
  try {
    const saved = sessionStorage.getItem(PACK_KEY);
    if (saved && GALLERY_PACKS.some((p) => p.id === saved)) {
      galleryPack.value = saved as GalleryPack | "all";
    }
  } catch {
    /* ignore */
  }
});

function setPack(id: GalleryPack | "all") {
  galleryPack.value = id;
  try {
    sessionStorage.setItem(PACK_KEY, id);
  } catch {
    /* ignore */
  }
}

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

function clearUpload() {
  if (props.document.background.type !== "upload") return;
  // Fall back to default navy gallery abstract
  setBackground({ type: "gallery", id: "navy-dusk.svg" }, "light");
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

async function processFile(file: File) {
  uploading.value = true;
  uploadError.value = null;
  try {
    const objectUrl = await processImageUpload(file);
    setBackground({ type: "upload", objectUrl, fileName: file.name }, "light");
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

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  await processFile(file);
}

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragOver.value = true;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  dragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  // Only clear when leaving the drop zone itself
  const related = e.relatedTarget as Node | null;
  if (related && (e.currentTarget as HTMLElement).contains(related)) return;
  dragOver.value = false;
}

async function onDrop(e: DragEvent) {
  e.preventDefault();
  dragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  await processFile(file);
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
      <div class="mb-2 flex flex-wrap gap-1">
        <button
          v-for="p in GALLERY_PACKS"
          :key="p.id"
          type="button"
          class="type-meta rounded-md px-2 py-1 transition-colors"
          :class="
            galleryPack === p.id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-soft text-ink/55 hover:text-ink'
          "
          :aria-pressed="galleryPack === p.id"
          @click="setPack(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="item in filteredGallery"
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
      <p v-if="filteredGallery.length === 0" class="type-body-sm mt-2 text-ink/45">
        No images in this pack.
      </p>
    </section>

    <!-- Upload dropzone -->
    <section>
      <p class="type-label mb-2 text-ink/55">Upload</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        class="hidden"
        @change="onFileChange"
      />
      <div
        class="rounded-md border border-dashed px-3 py-4 transition-colors"
        :class="
          dragOver
            ? 'border-ink bg-surface-soft'
            : 'border-hairline bg-surface-soft/80 hover:border-ink/30'
        "
        role="button"
        tabindex="0"
        :aria-label="uploading ? 'Processing image' : 'Drop image or choose file'"
        @click="openFilePicker"
        @keydown.enter.prevent="openFilePicker"
        @keydown.space.prevent="openFilePicker"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <p class="type-button text-center text-ink/80">
          {{
            uploading
              ? "Processing…"
              : dragOver
                ? "Drop to use as background"
                : "Drop a JPEG, PNG, or WebP"
          }}
        </p>
        <p class="type-body-sm mt-1.5 text-center text-ink/45">
          Stays on this device — never uploaded to a server. Or click to browse.
        </p>
      </div>

      <div
        v-if="bg.type === 'upload'"
        class="mt-2 flex items-center justify-between gap-2 rounded-md border border-hairline bg-canvas px-2.5 py-2"
      >
        <p class="type-body-sm min-w-0 truncate text-ink" :title="uploadFileName ?? undefined">
          {{ uploadFileName }}
        </p>
        <button
          type="button"
          class="type-meta shrink-0 rounded-md px-2 py-1 text-ink/60 hover:bg-surface-soft hover:text-ink"
          @click.stop="clearUpload"
        >
          Remove
        </button>
      </div>

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
