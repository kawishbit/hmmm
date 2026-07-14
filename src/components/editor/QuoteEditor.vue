<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import {
  buildDeepLinkAbsolute,
  clearDeepLinkFromUrl,
  parseDeepLinkSearch,
} from "../../lib/deeplink";
import { downloadQuotePng } from "../../lib/export";
import { topLayoutSuggestions } from "../../lib/layout-suggest";
import { fitAspectRect, LAYOUTS } from "../../lib/layouts";
import { type FittedQuoteType, fitQuoteStack, scaleFittedToDisplay } from "../../lib/pretext-fit";
import { applyTemplate, type QuoteTemplate } from "../../lib/templates";
import { applySiteTheme, resolveInitialTheme, type SiteThemeId } from "../../lib/themes";
import {
  type AspectRatioKey,
  DEFAULT_QUOTE_DOCUMENT,
  MAX_WORDS,
  type QuoteDocument,
} from "../../lib/types";
import { revokeIfObjectUrl } from "../../lib/upload";
import { clampToWordLimit, countLabel, countWords } from "../../lib/words";
import Button from "../ui/Button.vue";
import Input from "../ui/Input.vue";
import Textarea from "../ui/Textarea.vue";
import BackgroundPanel from "./BackgroundPanel.vue";
import HowToModal from "./HowToModal.vue";
import LayoutPicker from "./LayoutPicker.vue";
import QuotePreview from "./QuotePreview.vue";
import TemplatesPanel from "./TemplatesPanel.vue";
import ThemePicker from "./ThemePicker.vue";
import TypographyPanel from "./TypographyPanel.vue";

const HOWTO_KEY = "hmmm-howto-seen";

type PanelTab = "content" | "type" | "background" | "templates";

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
const statusToast = ref<string | null>(null);
const howtoOpen = ref(false);
const panelOpen = ref(true);
const activeTab = ref<PanelTab>("content");
const activeTemplateId = ref<string | null>(null);
const siteTheme = ref<SiteThemeId>("light");
const shareBusy = ref(false);

const fittedExport = ref<FittedQuoteType | null>(null);

const wordCount = computed(() => countWords(doc.text));
const secondaryWordCount = computed(() => countWords(doc.textSecondary));
const primaryUnitLabel = computed(() => countLabel(doc.text));
const secondaryUnitLabel = computed(() => countLabel(doc.textSecondary));
const atLimit = computed(() => wordCount.value >= MAX_WORDS);
const secondaryAtLimit = computed(() => secondaryWordCount.value >= MAX_WORDS);
const layoutLabel = computed(() => LAYOUTS[doc.aspectRatio].label);

const fittedDisplay = computed((): FittedQuoteType => {
  const base =
    fittedExport.value ??
    fitQuoteStack({
      text: doc.text,
      textSecondary: doc.textSecondary,
      author: doc.author,
      aspectRatio: doc.aspectRatio,
      style: doc.style,
    });
  return scaleFittedToDisplay(base, frameSize.value.width, frameSize.value.height);
});

const sizeMeta = computed(() => {
  const f = fittedExport.value;
  if (!f) return "";
  if (f.fittedPrimaryBeforeClamp < f.preferredPrimary) {
    return `Auto ${f.preferredPrimary}→${f.primarySize}px`;
  }
  return `${f.primarySize}px`;
});

const layoutSuggestions = computed(() => {
  if (!fittedExport.value) return [];
  return topLayoutSuggestions(
    {
      text: doc.text,
      textSecondary: doc.textSecondary,
      author: doc.author,
      style: doc.style,
      aspectRatio: doc.aspectRatio,
    },
    fittedExport.value,
    2,
  );
});

function showToast(message: string) {
  statusToast.value = message;
  window.setTimeout(() => {
    if (statusToast.value === message) statusToast.value = null;
  }, 4000);
}

function recomputeFit() {
  try {
    fittedExport.value = fitQuoteStack({
      text: doc.text,
      textSecondary: doc.textSecondary,
      author: doc.author,
      aspectRatio: doc.aspectRatio,
      style: doc.style,
    });
  } catch (err) {
    console.error("Fit failed", err);
  }
}

let fitTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFit(immediate = false) {
  if (fitTimer) clearTimeout(fitTimer);
  if (immediate) {
    recomputeFit();
    return;
  }
  fitTimer = setTimeout(() => {
    fitTimer = null;
    recomputeFit();
  }, 80);
}

function measureStage() {
  const el = stageEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const ratio = LAYOUTS[doc.aspectRatio].ratio;
  const pad = rect.width < 640 ? 20 : 56;
  const maxSide = Math.min(920, Math.max(rect.width, rect.height));
  frameSize.value = fitAspectRect(rect.width, rect.height, ratio, pad, maxSide);
}

function applyDeepLinkFromLocation() {
  if (typeof window === "undefined") return;
  const parsed = parseDeepLinkSearch(window.location.search);
  if (!parsed.hadParams) return;

  if (parsed.malformed) {
    showToast("Could not read link parameters.");
  }
  if (parsed.fields.q) {
    doc.text = parsed.fields.q;
  }
  if (parsed.fields.author) {
    doc.author = parsed.fields.author;
  }
  if (parsed.clamped) {
    showToast(`Quote was shortened to ${MAX_WORDS} ${primaryUnitLabel.value}.`);
  } else if (parsed.fields.q || parsed.fields.author) {
    showToast("Quote loaded from link.");
  }
  clearDeepLinkFromUrl();
}

function onThemeChange(id: SiteThemeId) {
  siteTheme.value = id;
  applySiteTheme(id);
}

function onApplyTemplate(template: QuoteTemplate) {
  const prev = doc.background;
  const wasEmpty = !doc.text.trim() && !doc.author.trim();
  const next = applyTemplate(
    {
      text: doc.text,
      textSecondary: doc.textSecondary,
      author: doc.author,
      aspectRatio: doc.aspectRatio,
      background: doc.background,
      style: { ...doc.style },
      blurPx: doc.blurPx,
      filterId: doc.filterId,
      scrimOpacity: doc.scrimOpacity,
    },
    template,
    { preserveText: !wasEmpty, fillSample: wasEmpty },
  );

  if (prev.type === "upload" && next.background.type !== "upload") {
    revokeIfObjectUrl(prev.objectUrl);
  }

  doc.text = next.text;
  doc.textSecondary = next.textSecondary;
  doc.author = next.author;
  doc.aspectRatio = next.aspectRatio;
  doc.background = next.background;
  Object.assign(doc.style, next.style);
  doc.blurPx = next.blurPx;
  doc.filterId = next.filterId;
  doc.scrimOpacity = next.scrimOpacity;
  activeTemplateId.value = template.id;
  scheduleFit(true);
  requestAnimationFrame(measureStage);
  showToast(`Template: ${template.label}`);
}

async function onCopyShareLink() {
  shareBusy.value = true;
  try {
    const url = buildDeepLinkAbsolute(window.location.origin, {
      q: doc.text,
      author: doc.author,
    });
    await navigator.clipboard.writeText(url);
    showToast("Share link copied.");
  } catch {
    showToast("Could not copy link.");
  } finally {
    shareBusy.value = false;
  }
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  siteTheme.value = resolveInitialTheme();
  applySiteTheme(siteTheme.value);

  applyDeepLinkFromLocation();

  try {
    if (!localStorage.getItem(HOWTO_KEY)) {
      howtoOpen.value = true;
    }
  } catch {
    howtoOpen.value = true;
  }

  measureStage();
  recomputeFit();
  if (typeof ResizeObserver !== "undefined" && stageEl.value) {
    ro = new ResizeObserver(() => measureStage());
    ro.observe(stageEl.value);
  }
  window.addEventListener("resize", measureStage);
});

onUnmounted(() => {
  ro?.disconnect();
  window.removeEventListener("resize", measureStage);
  if (fitTimer) clearTimeout(fitTimer);
  if (doc.background.type === "upload") {
    revokeIfObjectUrl(doc.background.objectUrl);
  }
});

watch(
  () => doc.aspectRatio,
  () => {
    requestAnimationFrame(() => {
      measureStage();
      scheduleFit(true);
    });
  },
);

watch(
  () =>
    [
      doc.text,
      doc.textSecondary,
      doc.author,
      doc.style.fontFamily,
      doc.style.fontId,
      doc.style.fontSizePx,
      doc.style.fontWeight,
    ] as const,
  () => scheduleFit(false),
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
  activeTemplateId.value = null;
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

function onStylePatch(partial: Partial<QuoteDocument["style"]>) {
  Object.assign(doc.style, partial);
  activeTemplateId.value = null;
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
  activeTemplateId.value = null;
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
    exportError.value = `Quotes are limited to ${MAX_WORDS} ${primaryUnitLabel.value}.`;
    return;
  }
  recomputeFit();
  const node = getPreviewNode();
  if (!node) {
    exportError.value = "Preview not ready.";
    return;
  }
  exporting.value = true;
  try {
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
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

const panelTabs = [
  { id: "content" as const, label: "Text" },
  { id: "type" as const, label: "Type" },
  { id: "background" as const, label: "Bg" },
  { id: "templates" as const, label: "Tpl" },
];
</script>

<template>
  <div class="flex h-dvh w-full min-w-80 flex-col overflow-hidden bg-canvas">
    <!--
      Breakpoint `tool` = 850px (see global.css --breakpoint-tool):
      - ≤850px: Edit toggle, collapsible sidebar, layout+theme on second row
      - >850px: single toolbar, sidebar always open
    -->
    <header class="z-30 shrink-0 border-b border-hairline bg-canvas">
      <div class="flex h-12 items-center gap-1.5 px-2 sm:gap-2 sm:px-3">
        <div class="flex shrink-0 items-center gap-2 pl-0.5">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[0.75rem] font-semibold text-on-primary"
            aria-hidden="true"
          >
            H
          </span>
          <span class="hidden text-[0.875rem] font-medium tracking-tight tool:inline">Hmmm</span>
        </div>

        <!-- Wide: layout in the middle -->
        <div class="hidden min-w-0 flex-1 justify-center px-2 tool:flex">
          <LayoutPicker :model-value="doc.aspectRatio" @update:model-value="onLayout" />
        </div>

        <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <ThemePicker
            class="hidden tool:flex"
            :model-value="siteTheme"
            @update:model-value="onThemeChange"
          />
          <Button
            variant="ghost"
            class="tool:hidden"
            type="button"
            :title="panelOpen ? 'Hide panel' : 'Show panel'"
            @click="panelOpen = !panelOpen"
          >
            {{ panelOpen ? "Hide" : "Edit" }}
          </Button>
          <Button
            variant="ghost"
            class="hidden min-[400px]:inline-flex"
            type="button"
            title="Copy a shareable link with this quote and author prefilled"
            :disabled="shareBusy || !doc.text.trim()"
            @click="onCopyShareLink"
          >
            {{ shareBusy ? "…" : "Share" }}
          </Button>
          <Button variant="ghost" type="button" title="How to use" @click="openHowto">?</Button>
          <Button
            variant="primary"
            type="button"
            :disabled="exporting || !doc.text.trim()"
            @click="onDownload"
          >
            <span class="tool:hidden">{{ exporting ? "…" : "PNG" }}</span>
            <span class="hidden tool:inline">{{ exporting ? "Exporting…" : "Download" }}</span>
          </Button>
        </div>
      </div>

      <!-- ≤850px: layout + theme on a second row -->
      <div
        class="flex items-center gap-2 border-t border-hairline-soft px-2 py-1.5 tool:hidden"
      >
        <div
          class="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          <LayoutPicker
            class="w-max max-w-none"
            :model-value="doc.aspectRatio"
            @update:model-value="onLayout"
          />
        </div>
        <ThemePicker
          class="shrink-0"
          :model-value="siteTheme"
          @update:model-value="onThemeChange"
        />
      </div>
    </header>

    <div class="relative flex min-h-0 flex-1">
      <aside
        class="z-20 flex w-full shrink-0 flex-col border-r border-hairline bg-canvas tool:w-72 xl:w-82"
        :class="
          panelOpen
            ? 'absolute inset-y-0 left-0 shadow-lg tool:static tool:shadow-none'
            : 'hidden tool:flex'
        "
        aria-label="Editor properties"
      >
        <div class="flex items-center justify-between border-b border-hairline-soft px-1.5 py-1.5">
          <div
            class="flex min-w-0 flex-1 rounded-md bg-surface-soft p-0.5"
            role="tablist"
            aria-label="Panel sections"
          >
            <button
              v-for="tab in panelTabs"
              :key="tab.id"
              type="button"
              role="tab"
              class="type-meta min-w-0 flex-1 rounded-[5px] px-1 py-1.5 transition-colors sm:px-1.5"
              :class="
                activeTab === tab.id
                  ? 'bg-canvas text-ink shadow-sm'
                  : 'text-ink/45 hover:text-ink'
              "
              :aria-selected="activeTab === tab.id"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <button
            type="button"
            class="type-body-sm shrink-0 px-2 text-ink/45 hover:text-ink tool:hidden"
            @click="panelOpen = false"
          >
            Close
          </button>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
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
                {{ wordCount }} / {{ MAX_WORDS }} {{ primaryUnitLabel }}
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
                {{ secondaryWordCount }} / {{ MAX_WORDS }} {{ secondaryUnitLabel }}
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

            <div
              v-if="fittedExport?.overflow"
              class="type-body-sm rounded-md bg-block-cream px-2.5 py-2.5 text-ink"
              role="status"
            >
              <p class="mb-2">
                This quote is very long for
                <strong>{{ doc.aspectRatio }}</strong
                >. Try a taller layout or shorten the text.
              </p>
              <div v-if="layoutSuggestions.length" class="flex flex-wrap gap-1.5">
                <button
                  v-for="s in layoutSuggestions"
                  :key="s.key"
                  type="button"
                  class="type-meta rounded-pill bg-primary px-3 py-1.5 text-on-primary hover:opacity-90"
                  @click="onLayout(s.key)"
                >
                  Switch to {{ s.shortLabel }}
                </button>
              </div>
            </div>

            <p v-if="exportError" class="type-body-sm text-accent-magenta" role="alert">
              {{ exportError }}
            </p>
          </div>

          <div v-show="activeTab === 'type'">
            <TypographyPanel
              :document="doc"
              :fitted-primary-size="fittedExport?.primarySize"
              @patch-style="onStylePatch"
            />
          </div>

          <div v-show="activeTab === 'background'">
            <BackgroundPanel :document="doc" @patch="onBackgroundPatch" />
          </div>

          <div v-show="activeTab === 'templates'">
            <TemplatesPanel :active-id="activeTemplateId" @apply="onApplyTemplate" />
          </div>
        </div>

        <div class="border-t border-hairline-soft px-3 py-2.5">
          <p class="type-meta text-ink/35">{{ layoutLabel }} · {{ sizeMeta }}</p>
        </div>
      </aside>

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
            :fitted="fittedDisplay"
          />
        </div>

        <div
          class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-canvas/90 px-3 py-1 shadow-sm backdrop-blur-sm"
        >
          <p class="type-meta text-ink/50">
            {{ doc.aspectRatio }}
            <span v-if="fittedExport"> · {{ fittedExport.primarySize }}px export type</span>
          </p>
        </div>
      </section>
    </div>

    <div
      v-if="statusToast"
      class="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-pill border border-hairline bg-canvas px-4 py-2 shadow-lg"
      role="status"
    >
      <p class="type-body-sm text-ink">{{ statusToast }}</p>
    </div>

    <HowToModal :open="howtoOpen" @close="closeHowto" />
  </div>
</template>
