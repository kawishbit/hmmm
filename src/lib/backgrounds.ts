/** Curated gallery + solid presets + filter CSS (Phases 2 + 9). */

export type GalleryPack = "abstract" | "nature" | "texture" | "urban" | "dark" | "paper";

export interface GalleryItem {
  id: string;
  label: string;
  /** Path under /public */
  src: string;
  /** Prefer light or dark text on this bg */
  textTone: "light" | "dark";
  pack: GalleryPack;
}

export interface SolidPreset {
  id: string;
  label: string;
  color: string;
  textTone: "light" | "dark";
}

export interface GradientPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  textTone: "light" | "dark";
}

export type FilterPresetId =
  | "none"
  | "grayscale"
  | "sepia"
  | "contrast"
  | "muted"
  | "darken"
  | "brighten";

export interface FilterPreset {
  id: FilterPresetId;
  label: string;
  /** CSS filter fragment (without blur) */
  css: string;
}

export const GALLERY_PACKS: { id: GalleryPack | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "abstract", label: "Abstract" },
  { id: "nature", label: "Nature" },
  { id: "texture", label: "Texture" },
  { id: "urban", label: "Urban" },
  { id: "dark", label: "Dark" },
  { id: "paper", label: "Paper" },
];

/** Original SVG abstracts + Phase 9 photo pack (local files only). */
export const GALLERY: GalleryItem[] = [
  // Abstract SVGs
  {
    id: "navy-dusk.svg",
    label: "Navy dusk",
    src: "/backgrounds/navy-dusk.svg",
    textTone: "light",
    pack: "abstract",
  },
  {
    id: "ocean-depth.svg",
    label: "Ocean depth",
    src: "/backgrounds/ocean-depth.svg",
    textTone: "light",
    pack: "abstract",
  },
  {
    id: "ink-void.svg",
    label: "Ink void",
    src: "/backgrounds/ink-void.svg",
    textTone: "light",
    pack: "dark",
  },
  {
    id: "forest-canopy.svg",
    label: "Forest canopy",
    src: "/backgrounds/forest-canopy.svg",
    textTone: "light",
    pack: "abstract",
  },
  {
    id: "magenta-pulse.svg",
    label: "Magenta",
    src: "/backgrounds/magenta-pulse.svg",
    textTone: "light",
    pack: "abstract",
  },
  {
    id: "sunset-strip.svg",
    label: "Sunset strip",
    src: "/backgrounds/sunset-strip.svg",
    textTone: "light",
    pack: "abstract",
  },
  {
    id: "slate-mesh.svg",
    label: "Slate mesh",
    src: "/backgrounds/slate-mesh.svg",
    textTone: "light",
    pack: "abstract",
  },
  {
    id: "lilac-bloom.svg",
    label: "Lilac bloom",
    src: "/backgrounds/lilac-bloom.svg",
    textTone: "dark",
    pack: "abstract",
  },
  {
    id: "lime-mist.svg",
    label: "Lime mist",
    src: "/backgrounds/lime-mist.svg",
    textTone: "dark",
    pack: "abstract",
  },
  {
    id: "mint-fog.svg",
    label: "Mint fog",
    src: "/backgrounds/mint-fog.svg",
    textTone: "dark",
    pack: "abstract",
  },
  {
    id: "coral-heat.svg",
    label: "Coral heat",
    src: "/backgrounds/coral-heat.svg",
    textTone: "dark",
    pack: "abstract",
  },
  {
    id: "cream-paper.svg",
    label: "Cream paper",
    src: "/backgrounds/cream-paper.svg",
    textTone: "dark",
    pack: "paper",
  },
  // Photo pack (local JPEG — see CREDITS.md)
  {
    id: "photo-mountains-dusk.jpg",
    label: "Mountains",
    src: "/backgrounds/photo-mountains-dusk.jpg",
    textTone: "light",
    pack: "nature",
  },
  {
    id: "photo-ocean-waves.jpg",
    label: "Ocean waves",
    src: "/backgrounds/photo-ocean-waves.jpg",
    textTone: "light",
    pack: "nature",
  },
  {
    id: "photo-forest-mist.jpg",
    label: "Forest mist",
    src: "/backgrounds/photo-forest-mist.jpg",
    textTone: "light",
    pack: "nature",
  },
  {
    id: "photo-desert-dunes.jpg",
    label: "Desert dunes",
    src: "/backgrounds/photo-desert-dunes.jpg",
    textTone: "light",
    pack: "nature",
  },
  {
    id: "photo-leaves.jpg",
    label: "Leaves",
    src: "/backgrounds/photo-leaves.jpg",
    textTone: "light",
    pack: "nature",
  },
  {
    id: "photo-night-sky.jpg",
    label: "Night sky",
    src: "/backgrounds/photo-night-sky.jpg",
    textTone: "light",
    pack: "dark",
  },
  {
    id: "photo-dark-abstract.jpg",
    label: "Dark abstract",
    src: "/backgrounds/photo-dark-abstract.jpg",
    textTone: "light",
    pack: "dark",
  },
  {
    id: "photo-texture-concrete.jpg",
    label: "Concrete",
    src: "/backgrounds/photo-texture-concrete.jpg",
    textTone: "light",
    pack: "texture",
  },
  {
    id: "photo-marble.jpg",
    label: "Marble",
    src: "/backgrounds/photo-marble.jpg",
    textTone: "light",
    pack: "texture",
  },
  {
    id: "photo-paper-texture.jpg",
    label: "Paper grain",
    src: "/backgrounds/photo-paper-texture.jpg",
    textTone: "dark",
    pack: "paper",
  },
  {
    id: "photo-city-bokeh.jpg",
    label: "City lights",
    src: "/backgrounds/photo-city-bokeh.jpg",
    textTone: "light",
    pack: "urban",
  },
  {
    id: "photo-soft-gradient.jpg",
    label: "Soft gradient",
    src: "/backgrounds/photo-soft-gradient.jpg",
    textTone: "light",
    pack: "abstract",
  },
];

export const SOLID_PRESETS: SolidPreset[] = [
  { id: "solid-ink", label: "Ink", color: "#000000", textTone: "light" },
  { id: "solid-navy", label: "Navy", color: "#1f1d3d", textTone: "light" },
  { id: "solid-canvas", label: "White", color: "#ffffff", textTone: "dark" },
  { id: "solid-soft", label: "Soft", color: "#f7f7f5", textTone: "dark" },
  { id: "solid-lime", label: "Lime", color: "#dceeb1", textTone: "dark" },
  { id: "solid-lilac", label: "Lilac", color: "#c5b0f4", textTone: "dark" },
  { id: "solid-coral", label: "Coral", color: "#f3c9b6", textTone: "dark" },
  { id: "solid-mint", label: "Mint", color: "#c8e6cd", textTone: "dark" },
];

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "grad-navy",
    label: "Navy",
    from: "#1f1d3d",
    to: "#3d3a6b",
    textTone: "light",
  },
  {
    id: "grad-sunset",
    label: "Warm",
    from: "#1f1d3d",
    to: "#c45c48",
    textTone: "light",
  },
  {
    id: "grad-mint",
    label: "Mint",
    from: "#2d5a45",
    to: "#c8e6cd",
    textTone: "light",
  },
];

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "none", label: "None", css: "none" },
  { id: "grayscale", label: "B&W", css: "grayscale(1)" },
  { id: "sepia", label: "Sepia", css: "sepia(0.85) saturate(1.1)" },
  { id: "contrast", label: "Punch", css: "contrast(1.25) saturate(1.15)" },
  { id: "muted", label: "Muted", css: "saturate(0.35) brightness(1.05)" },
  { id: "darken", label: "Darken", css: "brightness(0.72) contrast(1.05)" },
  { id: "brighten", label: "Lift", css: "brightness(1.15) contrast(0.95)" },
];

export const MAX_BLUR_PX = 24;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOAD_EDGE = 2000;

export function galleryById(id: string): GalleryItem | undefined {
  return GALLERY.find((g) => g.id === id);
}

export function galleryByPack(pack: GalleryPack | "all"): GalleryItem[] {
  if (pack === "all") return GALLERY;
  return GALLERY.filter((g) => g.pack === pack);
}

export function filterById(id: FilterPresetId): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) ?? FILTER_PRESETS[0];
}

/** Combine preset filter + blur for the background layer only. */
export function composeBackgroundFilter(filterId: FilterPresetId, blurPx: number): string {
  const parts: string[] = [];
  const preset = filterById(filterId);
  if (preset.css && preset.css !== "none") {
    parts.push(preset.css);
  }
  if (blurPx > 0) {
    parts.push(`blur(${Math.min(MAX_BLUR_PX, Math.max(0, blurPx))}px)`);
  }
  return parts.length ? parts.join(" ") : "none";
}

export function colorsForTone(tone: "light" | "dark"): {
  color: string;
  authorColor: string;
} {
  if (tone === "dark") {
    return {
      color: "#000000",
      authorColor: "rgba(0, 0, 0, 0.65)",
    };
  }
  return {
    color: "#ffffff",
    authorColor: "rgba(255, 255, 255, 0.78)",
  };
}
