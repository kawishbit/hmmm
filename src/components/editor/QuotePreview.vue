<script setup lang="ts">
import { computed, ref } from "vue";
import { composeBackgroundFilter, galleryById } from "../../lib/backgrounds";
import { fontById } from "../../lib/fonts";
import type { FittedQuoteType } from "../../lib/pretext-fit";
import type { QuoteDocument } from "../../lib/types";
import { detectTextDirection } from "../../lib/words";

const props = defineProps<{
  document: QuoteDocument;
  /** Explicit pixel size of the on-screen frame */
  width: number;
  height: number;
  /** Display-space fitted type metrics from Phase 2.5 */
  fitted: FittedQuoteType;
}>();

const rootEl = ref<HTMLElement | null>(null);
defineExpose({ rootEl });

const backgroundStyle = computed(() => {
  const bg = props.document.background;
  if (bg.type === "solid") {
    return { backgroundColor: bg.color };
  }
  if (bg.type === "gradient") {
    return {
      backgroundImage: `linear-gradient(160deg, ${bg.from} 0%, ${bg.to} 100%)`,
    };
  }
  if (bg.type === "gallery") {
    const item = galleryById(bg.id);
    const url = item?.src ?? `/backgrounds/${bg.id}`;
    return {
      backgroundImage: `url("${url}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  if (bg.type === "upload") {
    return {
      backgroundImage: `url("${bg.objectUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  return { backgroundColor: "#1f1d3d" };
});

const bgFilter = computed(() =>
  composeBackgroundFilter(props.document.filterId, props.document.blurPx),
);

const bgExpand = computed(() => {
  const b = props.document.blurPx;
  return b > 0 ? Math.ceil(b * 2.5) : 0;
});

const justifyContent = computed(() => {
  switch (props.document.style.verticalAlign) {
    case "top":
      return "flex-start";
    case "bottom":
      return "flex-end";
    default:
      return "center";
  }
});

const textAlign = computed(() => props.document.style.align);
const fontWeight = computed(() => props.document.style.fontWeight ?? 500);
const secondaryWeight = computed(() => (fontWeight.value >= 600 ? 500 : 400));

const displayText = computed(() => props.document.text.trim() || "Your quote appears here");
const secondaryText = computed(() => props.document.textSecondary.trim());
const hasSecondary = computed(() => secondaryText.value.length > 0);

const displayAuthor = computed(() => {
  const a = props.document.author.trim();
  if (!a && !props.document.text.trim()) return "Author";
  return a ? `— ${a}` : "";
});

const textDir = computed(() => {
  const font = fontById(props.document.style.fontId);
  if (font.rtl) return "rtl" as const;
  return detectTextDirection(`${props.document.text} ${props.document.textSecondary}`);
});

const pad = computed(() => Math.round(props.fitted.inset));
const maxTextW = computed(() => Math.round(props.fitted.contentW));

const scrimOpacity = computed(() => Math.min(0.85, Math.max(0, props.document.scrimOpacity)));
</script>

<template>
  <div
    ref="rootEl"
    class="quote-preview relative shrink-0 overflow-hidden rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
    }"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="quote-preview__bg absolute"
        :style="{
          top: `-${bgExpand}px`,
          right: `-${bgExpand}px`,
          bottom: `-${bgExpand}px`,
          left: `-${bgExpand}px`,
          ...backgroundStyle,
          filter: bgFilter === 'none' ? undefined : bgFilter,
        }"
      />
    </div>

    <div
      v-if="scrimOpacity > 0"
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundColor: `rgba(0, 0, 0, ${scrimOpacity})`,
      }"
    />

    <div
      class="quote-preview__canvas absolute inset-0 flex flex-col"
      :style="{
        justifyContent,
        alignItems:
          textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
        padding: `${pad}px`,
      }"
    >
      <div
        class="quote-preview__text"
        :dir="textDir"
        :style="{
          textAlign,
          fontFamily: document.style.fontFamily,
          color: document.style.color,
          maxWidth: `${maxTextW}px`,
          width: '100%',
        }"
      >
        <p
          class="m-0 whitespace-pre-wrap break-words"
          :style="{
            fontSize: `${fitted.primarySize}px`,
            fontWeight,
            lineHeight: String(fitted.primaryLineHeight / fitted.primarySize),
            letterSpacing: '-0.02em',
          }"
        >
          {{ displayText }}
        </p>

        <p
          v-if="hasSecondary && fitted.secondarySize"
          class="m-0 whitespace-pre-wrap break-words"
          :style="{
            marginTop: `${Math.round(fitted.gapPrimarySecondary)}px`,
            fontSize: `${fitted.secondarySize}px`,
            fontWeight: secondaryWeight,
            lineHeight: fitted.secondaryLineHeight
              ? String(fitted.secondaryLineHeight / fitted.secondarySize)
              : '1.35',
            letterSpacing: '-0.01em',
            opacity: 0.88,
          }"
        >
          {{ secondaryText }}
        </p>

        <p
          v-if="displayAuthor"
          class="m-0"
          :style="{
            marginTop: `${Math.round(fitted.gapToAuthor || fitted.primarySize * 0.45)}px`,
            color: document.style.authorColor,
            fontSize: `${fitted.authorSize}px`,
            fontWeight: 400,
            letterSpacing: '0.02em',
            lineHeight: String(fitted.authorLineHeight / fitted.authorSize),
          }"
        >
          {{ displayAuthor }}
        </p>
      </div>
    </div>
  </div>
</template>
