import type { FilterPresetId } from "./backgrounds";
import { fontById } from "./fonts";
import type { AspectRatioKey, BackgroundSource, QuoteDocument, QuoteStyle } from "./types";

/** Style preset applied by a template (quote canvas, not site chrome). */
export interface TemplateStylePatch {
  fontId: string;
  fontWeight?: QuoteStyle["fontWeight"];
  color: string;
  authorColor: string;
  fontSizePx?: number;
  align?: QuoteStyle["align"];
  verticalAlign?: QuoteStyle["verticalAlign"];
}

export interface QuoteTemplate {
  id: string;
  label: string;
  description: string;
  aspectRatio: AspectRatioKey;
  background: BackgroundSource;
  style: TemplateStylePatch;
  blurPx?: number;
  filterId?: FilterPresetId;
  scrimOpacity?: number;
  /** Optional sample content when applying to empty editor */
  sampleText?: string;
  sampleAuthor?: string;
  sampleSecondary?: string;
}

function styleFromPatch(patch: TemplateStylePatch): QuoteStyle {
  const font = fontById(patch.fontId);
  return {
    fontId: font.id,
    fontFamily: font.cssFamily,
    fontWeight: patch.fontWeight ?? 500,
    color: patch.color,
    authorColor: patch.authorColor,
    fontSizePx: patch.fontSizePx ?? 52,
    align: patch.align ?? "center",
    verticalAlign: patch.verticalAlign ?? "middle",
  };
}

export const TEMPLATES: QuoteTemplate[] = [
  {
    id: "editorial-serif",
    label: "Editorial serif",
    description: "Playfair on paper grain photo",
    aspectRatio: "4:5",
    background: { type: "gallery", id: "photo-paper-texture.jpg" },
    style: {
      fontId: "playfair",
      fontWeight: 500,
      color: "#1f1d3d",
      authorColor: "rgba(31, 29, 61, 0.7)",
      fontSizePx: 48,
      align: "left",
      verticalAlign: "middle",
    },
    blurPx: 0,
    filterId: "none",
    scrimOpacity: 0.12,
    sampleText: "Design is not just what it looks like and feels like. Design is how it works.",
    sampleAuthor: "Steve Jobs",
  },
  {
    id: "bold-sans",
    label: "Bold sans",
    description: "Heavy Inter on magenta pulse",
    aspectRatio: "1:1",
    background: { type: "gallery", id: "magenta-pulse.svg" },
    style: {
      fontId: "inter",
      fontWeight: 700,
      color: "#ffffff",
      authorColor: "rgba(255, 255, 255, 0.8)",
      fontSizePx: 56,
      align: "center",
      verticalAlign: "middle",
    },
    scrimOpacity: 0.22,
    sampleText: "Stay hungry. Stay foolish.",
    sampleAuthor: "Steve Jobs",
  },
  {
    id: "minimal-navy",
    label: "Minimal navy",
    description: "DM Sans on deep navy",
    aspectRatio: "9:16",
    background: { type: "solid", color: "#1f1d3d" },
    style: {
      fontId: "dm-sans",
      fontWeight: 500,
      color: "#f7f7f5",
      authorColor: "rgba(247, 247, 245, 0.65)",
      fontSizePx: 44,
      align: "center",
      verticalAlign: "middle",
    },
    scrimOpacity: 0,
    sampleText: "The details are not the details. They make the design.",
    sampleAuthor: "Charles Eames",
  },
  {
    id: "ocean-editorial",
    label: "Ocean calm",
    description: "Baskerville on ocean waves photo",
    aspectRatio: "16:9",
    background: { type: "gallery", id: "photo-ocean-waves.jpg" },
    style: {
      fontId: "libre-baskerville",
      fontWeight: 400,
      color: "#ffffff",
      authorColor: "rgba(255, 255, 255, 0.75)",
      fontSizePx: 42,
      align: "center",
      verticalAlign: "bottom",
    },
    scrimOpacity: 0.4,
    filterId: "muted",
    sampleText: "In the middle of difficulty lies opportunity.",
    sampleAuthor: "Albert Einstein",
  },
  {
    id: "mountain-bold",
    label: "Summit",
    description: "Inter on mountains at dusk",
    aspectRatio: "4:5",
    background: { type: "gallery", id: "photo-mountains-dusk.jpg" },
    style: {
      fontId: "inter",
      fontWeight: 600,
      color: "#ffffff",
      authorColor: "rgba(255, 255, 255, 0.8)",
      fontSizePx: 50,
      align: "center",
      verticalAlign: "middle",
    },
    scrimOpacity: 0.32,
    sampleText: "The journey of a thousand miles begins with a single step.",
    sampleAuthor: "Lao Tzu",
  },
  {
    id: "lime-poster",
    label: "Lime poster",
    description: "Bold type on DESIGN lime",
    aspectRatio: "1:1",
    background: { type: "solid", color: "#dceeb1" },
    style: {
      fontId: "inter",
      fontWeight: 600,
      color: "#000000",
      authorColor: "rgba(0, 0, 0, 0.55)",
      fontSizePx: 52,
      align: "left",
      verticalAlign: "top",
    },
    scrimOpacity: 0,
    sampleText: "Make it simple, but significant.",
    sampleAuthor: "Don Draper",
  },
];

export function templateById(id: string): QuoteTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export interface ApplyTemplateOptions {
  /** Replace quote/author with sample when true or when text empty */
  fillSample?: boolean;
  /** Keep existing quote text when applying style-only */
  preserveText?: boolean;
}

/**
 * Merge template into a document. Does not touch upload blob URLs in the result
 * (caller should revoke previous upload if replacing background).
 */
export function applyTemplate(
  current: QuoteDocument,
  template: QuoteTemplate,
  options: ApplyTemplateOptions = {},
): QuoteDocument {
  const preserveText = options.preserveText ?? false;
  const fillSample = options.fillSample ?? (!current.text.trim() && !current.author.trim());

  const nextText = preserveText
    ? current.text
    : fillSample && template.sampleText
      ? template.sampleText
      : current.text;
  const nextAuthor = preserveText
    ? current.author
    : fillSample && template.sampleAuthor
      ? template.sampleAuthor
      : current.author;
  const nextSecondary = preserveText
    ? current.textSecondary
    : fillSample && template.sampleSecondary
      ? template.sampleSecondary
      : current.textSecondary;

  return {
    ...current,
    text: nextText,
    textSecondary: nextSecondary,
    author: nextAuthor,
    aspectRatio: template.aspectRatio,
    background: { ...template.background },
    style: styleFromPatch(template.style),
    blurPx: template.blurPx ?? 0,
    filterId: template.filterId ?? "none",
    scrimOpacity: template.scrimOpacity ?? 0.2,
  };
}
