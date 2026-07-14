import type { FilterPresetId } from "./backgrounds";
import { DEFAULT_FONT_ID, type FontWeightOption, fontById } from "./fonts";

/** Aspect ratio keys. */
export type AspectRatioKey = "1:1" | "4:5" | "9:16" | "16:9" | "2:1";

/** Background mode. */
export type BackgroundSource =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string }
  | { type: "gallery"; id: string }
  | { type: "upload"; objectUrl: string; fileName?: string };

export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

/** Text styling for the quote canvas. */
export interface QuoteStyle {
  /** Catalog font id (Phase 3) */
  fontId: string;
  fontFamily: string;
  fontWeight: FontWeightOption;
  color: string;
  authorColor: string;
  /** Preferred max font size in export px; fitter uses min(preferred, autoFit) */
  fontSizePx: number;
  align: TextAlign;
  verticalAlign: VerticalAlign;
}

export interface QuoteDocument {
  text: string;
  /**
   * Optional second quote line — typically a translation.
   * When empty, preview takes no vertical space for this block.
   */
  textSecondary: string;
  author: string;
  aspectRatio: AspectRatioKey;
  background: BackgroundSource;
  style: QuoteStyle;
  /** Background blur radius in CSS px (display); export uses same filter string. */
  blurPx: number;
  /** Background filter preset id */
  filterId: FilterPresetId;
  /** Dark scrim over background for text legibility (0–1). */
  scrimOpacity: number;
}

/** Hard cap for primary quote and optional translation (Unicode code points). */
export const MAX_QUOTE_CHARS = 1300;
/** Hard cap for author attribution. */
export const MAX_AUTHOR_CHARS = 100;

/** Secondary/translation line is smaller relative to primary (export design size). */
export const SECONDARY_FONT_SCALE = 0.55;

const defaultFont = fontById(DEFAULT_FONT_ID);

export const DEFAULT_QUOTE_DOCUMENT: QuoteDocument = {
  text: "The only way to do great work is to love what you do.",
  textSecondary: "",
  author: "Steve Jobs",
  aspectRatio: "1:1",
  background: {
    type: "gallery",
    id: "navy-dusk.svg",
  },
  style: {
    fontId: defaultFont.id,
    fontFamily: defaultFont.cssFamily,
    fontWeight: 500,
    color: "#ffffff",
    authorColor: "rgba(255, 255, 255, 0.78)",
    fontSizePx: 52,
    align: "center",
    verticalAlign: "middle",
  },
  blurPx: 0,
  filterId: "none",
  scrimOpacity: 0.28,
};
