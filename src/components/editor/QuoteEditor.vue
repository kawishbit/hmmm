<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { downloadQuotePng } from "../../lib/export";
import { fitAspectRect, LAYOUTS } from "../../lib/layouts";
import {
  type AspectRatioKey,
  DEFAULT_QUOTE_DOCUMENT,
  MAX_WORDS,
  type QuoteDocument,
} from "../../lib/types";
import { revokeIfObjectUrl } from "../../lib/upload";
import { clampToWordLimit, countWords } from "../../lib/words";
import Button from "../ui/Button.vue";
import Input from "../ui/Input.vue";
import Textarea from "../ui/Textarea.vue";
import BackgroundPanel from "./BackgroundPanel.vue";
import HowToModal from "./HowToModal.vue";
import LayoutPicker from "./LayoutPicker.vue";
import QuotePreview from "./QuotePreview.vue";

const HOWTO_KEY = "hmmm-howto-seen";

type PanelTab = "content" | "background";

const doc = reactive<QuoteDocument>({
  ...DEFAULT_QUOTE_DOCUMENT,
  style: { ...DEFAULT_QUOTE_DOCUMENT.style },
  background: { ...DEFAULT_QUOTE_DOCUMENT.background },
});

const preview = ref<{ rootEl: HTMLElement | { value: HTMLElement | null } | null } | null>(null);
const stageEl = ref<HTMLElement | null>(null);
const frameSize = ref({ width: 480, height: 480 });
const exporting = ref(false);
const exportError = ref<string | null>(null);
const howtoOpen = ref(false);
const panelOpen = ref(true);
const activeTab = ref<PanelTab>("content");

const wordCount = computed(() => countWords(doc.text));
const secondaryWordCount = computed(() => countWords(doc.textSecondary));
const atLimit = computed(() => wordCount.value >= MAX_WORDS);
const secondaryAtLimit = computed(() => secondaryWordCount.value >= MAX_WORDS);
const layoutLabel = computed(() => LAYOUTS[doc.aspectRatio].label);

function measureStage() {
  const el = stageEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const ratio = LAYOUTS[doc.aspectRatio].ratio;
  const pad = rect.width < 640 ? 20 : 56;
  const maxSide = Math.min(920, Math.max(rect.width, rect.height));
  frameSize.value = fitAspectRect(rect.width, rect.height, ratio, pad, maxSide);
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  try {
    if (!localStorage.getItem(HOWTO_KEY)) {
      howtoOpen.value = true;
    }
  } catch {
    howtoOpen.value = true;
  }

  measureStage();
  if (typeof ResizeObserver !== "undefined" && stageEl.value) {
    ro = new ResizeObserver(() => measureStage());
    ro.observe(stageEl.value);
  }
  window.addEventListener("resize", measureStage);
});

onUnmounted(() => {
  ro?.disconnect();
  window.removeEventListener("resize", measureStage);
  if (doc.background.type === "upload") {
    revokeIfObjectUrl(doc.background.objectUrl);
  }
});

watch(
  () => doc.aspectRatio,
  () => {
    requestAnimationFrame(measureStage);
  },
);

function closeHowto() {
  howtoOpen.value = false;
  try {
    localStorage.setItem(HOWTO_KEY, "1");
  } catch {
    /* ignore */
  }
}

function openHowto() {
  howtoOpen.value = true;
}

function onQuoteInput(value: string) {
  exportError.value = null;
  doc.text = clampToWordLimit(value, MAX_WORDS);
}

function onSecondaryInput(value: string) {
  exportError.value = null;
  doc.textSecondary = clampToWordLimit(value, MAX_WORDS);
}

function onAuthorInput(value: string) {
  exportError.value = null;
  doc.author = value.slice(0, 120);
}

function onLayout(key: AspectRatioKey) {
  doc.aspectRatio = key;
}

function onBackgroundPatch(partial: Partial<QuoteDocument>) {
  if (partial.background) {
    doc.background = partial.background;
  }
  if (partial.style) {
    Object.assign(doc.style, partial.style);
  }
  if (partial.blurPx !== undefined) {
    doc.blurPx = partial.blurPx;
  }
  if (partial.filterId !== undefined) {
    doc.filterId = partial.filterId;
  }
  if (partial.scrimOpacity !== undefined) {
    doc.scrimOpacity = partial.scrimOpacity;
  }
}

function getPreviewNode(): HTMLElement | null {
  const exposed = preview.value?.rootEl;
  if (!exposed) return null;
  if (exposed instanceof HTMLElement) return exposed;
  if (typeof exposed === "object" && "value" in exposed) {
    return exposed.value instanceof HTMLElement ? exposed.value : null;
  }
  return null;
}

async function onDownload() {
  exportError.value = null;
  if (!doc.text.trim()) {
    exportError.value = "Add a quote before exporting.";
    return;
  }
  if (wordCount.value > MAX_WORDS) {
    exportError.value = `Quotes are limited to ${MAX_WORDS} words.`;
    return;
  }
  const node = getPreviewNode();
  if (!node) {
    exportError.value = "Preview not ready.";
    return;
  }
  exporting.value = true;
  try {
    await downloadQuotePng(node, {
      aspectRatio: doc.aspectRatio,
      filename: "hmmm-quote.png",
    });
  } catch (err) {
    console.error(err);
    exportError.value = "Could not export PNG. Try again.";
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <div class="flex h-dvh w-full flex-col overflow-hidden bg-canvas">
    <!-- Top toolbar -->
    <header
      class="z-30 flex h-12 shrink-0 items-center gap-2 border-b border-hairline bg-canvas px-2 sm:gap-3 sm:px-3"
    >
      <div class="flex min-w-0 items-center gap-2 pl-1">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[0.75rem] font-semibold text-on-primary"
          aria-hidden="true"
        >
          H
        </span>
        <span class="hidden text-[0.875rem] font-medium tracking-tight sm:inline">Hmmm</span>
      </div>

      <div class="mx-1 hidden h-5 w-px bg-hairline sm:block" aria-hidden="true" />

      <LayoutPicker :model-value="doc.aspectRatio" @update:model-value="onLayout" />

      <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          class="lg:hidden"
          type="button"
          :title="panelOpen ? 'Hide panel' : 'Show panel'"
          @click="panelOpen = !panelOpen"
        >
          {{ panelOpen ? "Hide panel" : "Panel" }}
        </Button>
        <Button variant="ghost" type="button" title="How to use" @click="openHowto">?</Button>
        <Button
          variant="primary"
          type="button"
          :disabled="exporting || !doc.text.trim()"
          @click="onDownload"
        >
          {{ exporting ? "Exporting…" : "Download" }}
        </Button>
      </div>
    </header>

    <!-- Workspace -->
    <div class="relative flex min-h-0 flex-1">
      <!-- Left properties panel -->
      <aside
        class="z-20 flex w-full shrink-0 flex-col border-r border-hairline bg-canvas sm:w-72 lg:w-80"
        :class="
          panelOpen ? 'absolute inset-y-0 left-0 shadow-lg sm:static sm:shadow-none' : 'hidden sm:flex'
        "
        aria-label="Editor properties"
      >
        <div class="flex items-center justify-between border-b border-hairline-soft px-2 py-1.5">
          <div
            class="flex rounded-md bg-surface-soft p-0.5"
            role="tablist"
            aria-label="Panel sections"
          >
            <button
              type="button"
              role="tab"
              class="type-meta rounded-[5px] px-2.5 py-1.5 transition-colors"
              :class="
                activeTab === 'content'
                  ? 'bg-canvas text-ink shadow-sm'
                  : 'text-ink/45 hover:text-ink'
              "
              :aria-selected="activeTab === 'content'"
              @click="activeTab = 'content'"
            >
              Content
            </button>
            <button
              type="button"
              role="tab"
              class="type-meta rounded-[5px] px-2.5 py-1.5 transition-colors"
              :class="
                activeTab === 'background'
                  ? 'bg-canvas text-ink shadow-sm'
                  : 'text-ink/45 hover:text-ink'
              "
              :aria-selected="activeTab === 'background'"
              @click="activeTab = 'background'"
            >
              Background
            </button>
          </div>
          <button
            type="button"
            class="type-body-sm px-2 text-ink/45 hover:text-ink sm:hidden"
            @click="panelOpen = false"
          >
            Close
          </button>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
          <!-- Content tab -->
          <div v-show="activeTab === 'content'" class="flex flex-col gap-4">
            <Textarea
              id="quote-text"
              label="Quote"
              :model-value="doc.text"
              placeholder="Type or paste a quote…"
              :rows="7"
              @update:model-value="onQuoteInput"
            />

            <div class="flex items-center justify-between gap-2 -mt-2">
              <p
                class="type-meta"
                :class="atLimit ? 'text-accent-magenta' : 'text-ink/40'"
                aria-live="polite"
              >
                {{ wordCount }} / {{ MAX_WORDS }}
              </p>
              <p v-if="atLimit" class="type-body-sm text-accent-magenta">Limit</p>
            </div>

            <Textarea
              id="quote-secondary"
              label="Translation (optional)"
              :model-value="doc.textSecondary"
              placeholder="Second line — smaller type. Leave blank to hide."
              :rows="4"
              @update:model-value="onSecondaryInput"
            />

            <div class="flex items-center justify-between gap-2 -mt-2">
              <p
                class="type-meta"
                :class="secondaryAtLimit ? 'text-accent-magenta' : 'text-ink/40'"
                aria-live="polite"
              >
                {{ secondaryWordCount }} / {{ MAX_WORDS }}
              </p>
              <p v-if="!doc.textSecondary.trim()" class="type-body-sm text-ink/35">
                Hidden on image
              </p>
              <p v-else-if="secondaryAtLimit" class="type-body-sm text-accent-magenta">Limit</p>
            </div>

            <Input
              id="quote-author"
              label="Author"
              :model-value="doc.author"
              placeholder="Optional"
              autocomplete="off"
              @update:model-value="onAuthorInput"
            />

            <p v-if="exportError" class="type-body-sm text-accent-magenta" role="alert">
              {{ exportError }}
            </p>
          </div>

          <!-- Background tab -->
          <div v-show="activeTab === 'background'">
            <BackgroundPanel :document="doc" @patch="onBackgroundPatch" />
          </div>
        </div>

        <div class="border-t border-hairline-soft px-3 py-2.5">
          <p class="type-meta text-ink/35">
            {{ layoutLabel }} · {{ Math.round(frameSize.width) }}×{{
              Math.round(frameSize.height)
            }}
            px
          </p>
        </div>
      </aside>

      <!-- Canvas stage -->
      <section
        ref="stageEl"
        class="stage-dots relative min-h-0 min-w-0 flex-1"
        aria-label="Canvas"
      >
        <div class="absolute inset-0 flex items-center justify-center overflow-hidden p-3 sm:p-6">
          <QuotePreview
            ref="preview"
            :document="doc"
            :width="frameSize.width"
            :height="frameSize.height"
          />
        </div>

        <div
          class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-canvas/90 px-3 py-1 shadow-sm backdrop-blur-sm"
        >
          <p class="type-meta text-ink/50">
            {{ doc.aspectRatio }} · export 1080 short side
          </p>
        </div>
      </section>
    </div>

    <HowToModal :open="howtoOpen" @close="closeHowto" />
  </div>
</template>
