import type { AspectRatioKey } from "./types";

export interface LayoutSpec {
  key: AspectRatioKey;
  label: string;
  /** Short label for toolbar chips */
  shortLabel: string;
  /** width / height */
  ratio: number;
  /** Short-side pixels for export */
  exportShortSide: number;
}

export const LAYOUTS: Record<AspectRatioKey, LayoutSpec> = {
  "1:1": {
    key: "1:1",
    label: "Square",
    shortLabel: "1:1",
    ratio: 1,
    exportShortSide: 1080,
  },
  "4:5": {
    key: "4:5",
    label: "Portrait",
    shortLabel: "4:5",
    ratio: 4 / 5,
    exportShortSide: 1080,
  },
  "9:16": {
    key: "9:16",
    label: "Story",
    shortLabel: "9:16",
    ratio: 9 / 16,
    exportShortSide: 1080,
  },
  "16:9": {
    key: "16:9",
    label: "Landscape",
    shortLabel: "16:9",
    ratio: 16 / 9,
    exportShortSide: 1080,
  },
  "2:1": {
    key: "2:1",
    label: "Wide",
    shortLabel: "2:1",
    ratio: 2,
    exportShortSide: 1080,
  },
};

export const LAYOUT_LIST: LayoutSpec[] = Object.values(LAYOUTS);

export function exportDimensions(key: AspectRatioKey): { width: number; height: number } {
  const layout = LAYOUTS[key];
  const short = layout.exportShortSide;
  if (layout.ratio >= 1) {
    const height = short;
    const width = Math.round(short * layout.ratio);
    return { width, height };
  }
  const width = short;
  const height = Math.round(short / layout.ratio);
  return { width, height };
}

/** Fit an aspect-ratio rectangle into a container box. */
export function fitAspectRect(
  containerW: number,
  containerH: number,
  ratio: number,
  padding = 40,
  maxSide = 720,
): { width: number; height: number } {
  const availW = Math.max(160, containerW - padding * 2);
  const availH = Math.max(160, containerH - padding * 2);

  let width = availW;
  let height = width / ratio;
  if (height > availH) {
    height = availH;
    width = height * ratio;
  }

  const long = Math.max(width, height);
  if (long > maxSide) {
    const scale = maxSide / long;
    width *= scale;
    height *= scale;
  }

  return {
    width: Math.max(160, Math.floor(width)),
    height: Math.max(160, Math.floor(height)),
  };
}
