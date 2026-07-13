import type { FilterPresetId } from "./backgrounds";

/** Aspect ratio keys. Full set expands in Phase 3. */
export type AspectRatioKey = "1:1" | "4:5" | "9:16" | "16:9" | "2:1";

/** Background mode. */
export type BackgroundSource =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string }
  | { type: "gallery"; id: string }
  | { type: "upload"; objectUrl: string };

/** Text styling for the quote canvas. Expanded in Phase 3. */
export interface QuoteStyle {
  fontFamily: string;
  color: string;
  authorColor: string;
  fontSizePx: number;
  align: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
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

export const MAX_WORDS = 300;

/** Secondary/translation line is smaller relative to primary (export design size). */
export const SECONDARY_FONT_SCALE = 0.55;

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
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif",
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
