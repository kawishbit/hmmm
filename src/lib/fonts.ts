/** Curated quote typefaces for Phase 3. */

export type FontWeightOption = 400 | 500 | 600 | 700;

export interface QuoteFont {
  id: string;
  label: string;
  /** CSS font-family stack for preview/export */
  cssFamily: string;
  /** Named face for Pretext/canvas measure (avoid system-ui) */
  measureFamily: string;
  /** Available weights in the UI */
  weights: FontWeightOption[];
  /** Hint for RTL-friendly face */
  rtl?: boolean;
  /** Category chip */
  category: "sans" | "serif" | "display" | "arabic";
}

export const QUOTE_FONTS: QuoteFont[] = [
  {
    id: "inter",
    label: "Inter",
    cssFamily: '"Inter Variable", Inter, system-ui, sans-serif',
    measureFamily: "Inter",
    weights: [400, 500, 600, 700],
    category: "sans",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    cssFamily: '"DM Sans", system-ui, sans-serif',
    measureFamily: "DM Sans",
    weights: [400, 500, 700],
    category: "sans",
  },
  {
    id: "libre-baskerville",
    label: "Baskerville",
    cssFamily: '"Libre Baskerville", Georgia, serif',
    measureFamily: "Libre Baskerville",
    weights: [400, 700],
    category: "serif",
  },
  {
    id: "playfair",
    label: "Playfair",
    cssFamily: '"Playfair Display", Georgia, serif',
    measureFamily: "Playfair Display",
    weights: [400, 500, 600, 700],
    category: "display",
  },
  {
    id: "georgia",
    label: "Georgia",
    cssFamily: "Georgia, 'Times New Roman', serif",
    measureFamily: "Georgia",
    weights: [400, 700],
    category: "serif",
  },
  {
    id: "noto-arabic",
    label: "Noto Arabic",
    cssFamily: '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif',
    measureFamily: "Noto Sans Arabic",
    weights: [400, 500, 700],
    rtl: true,
    category: "arabic",
  },
];

export const DEFAULT_FONT_ID = "inter";

export function fontById(id: string): QuoteFont {
  return QUOTE_FONTS.find((f) => f.id === id) ?? QUOTE_FONTS[0];
}

export function fontByCssFamily(cssFamily: string): QuoteFont {
  const hit = QUOTE_FONTS.find(
    (f) => f.cssFamily === cssFamily || cssFamily.includes(f.measureFamily),
  );
  return hit ?? QUOTE_FONTS[0];
}

/** Quote/author color presets (light + dark for various backgrounds). */
export const COLOR_PRESETS = [
  "#ffffff",
  "#f7f7f5",
  "#f4ecd6",
  "#dceeb1",
  "#000000",
  "#1f1d3d",
  "#ff3d8b",
  "#c5b0f4",
] as const;
