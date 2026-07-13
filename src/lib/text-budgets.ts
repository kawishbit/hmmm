import { exportDimensions } from "./layouts";
import type { AspectRatioKey } from "./types";

/** Tunable per-layout inset as fraction of short side. */
export interface LayoutBudgetConfig {
  /** Outer padding as fraction of min(frameW, frameH) */
  insetRatio: number;
  /** Share of quotes budget for primary when secondary present */
  primaryShare: number;
  /** Share of quotes budget for secondary when present (should ≈ 1 - primaryShare) */
  secondaryShare: number;
}

export const LAYOUT_BUDGETS: Record<AspectRatioKey, LayoutBudgetConfig> = {
  "1:1": { insetRatio: 0.1, primaryShare: 0.62, secondaryShare: 0.38 },
  "4:5": { insetRatio: 0.09, primaryShare: 0.64, secondaryShare: 0.36 },
  "9:16": { insetRatio: 0.09, primaryShare: 0.6, secondaryShare: 0.4 },
  "16:9": { insetRatio: 0.08, primaryShare: 0.58, secondaryShare: 0.42 },
  "2:1": { insetRatio: 0.08, primaryShare: 0.55, secondaryShare: 0.45 },
};

export interface ContentBox {
  frameW: number;
  frameH: number;
  /** Outer padding (px, export space) */
  inset: number;
  contentW: number;
  contentH: number;
}

export interface QuoteHeightBudgets {
  contentW: number;
  contentH: number;
  inset: number;
  frameW: number;
  frameH: number;
  /** Max height for primary quote block */
  primaryMaxH: number;
  /** Max height for secondary (0 if empty) */
  secondaryMaxH: number;
  authorReserve: number;
  gapPrimarySecondary: number;
  gapToAuthor: number;
  hasSecondary: boolean;
  hasAuthor: boolean;
}

/** Author strip reserve in export px. */
export function authorReservePx(frameH: number, hasAuthor: boolean): number {
  if (!hasAuthor) return 0;
  return Math.max(28, Math.round(frameH * 0.035));
}

export function contentBoxForLayout(layoutKey: AspectRatioKey): ContentBox {
  const { width: frameW, height: frameH } = exportDimensions(layoutKey);
  const cfg = LAYOUT_BUDGETS[layoutKey];
  const short = Math.min(frameW, frameH);
  const inset = Math.round(short * cfg.insetRatio);
  return {
    frameW,
    frameH,
    inset,
    contentW: Math.max(1, frameW - inset * 2),
    contentH: Math.max(1, frameH - inset * 2),
  };
}

/**
 * Split vertical budget for primary / secondary / author (export pixel space).
 * Proposal A: fixed shares when secondary present; primary takes all when not.
 */
export function quoteHeightBudgets(
  layoutKey: AspectRatioKey,
  opts: { hasSecondary: boolean; hasAuthor: boolean },
): QuoteHeightBudgets {
  const box = contentBoxForLayout(layoutKey);
  const cfg = LAYOUT_BUDGETS[layoutKey];
  const authorReserve = authorReservePx(box.frameH, opts.hasAuthor);

  const gapPrimarySecondary = opts.hasSecondary ? Math.max(12, Math.round(box.frameH * 0.018)) : 0;
  const gapToAuthor = opts.hasAuthor ? Math.max(12, Math.round(box.frameH * 0.02)) : 0;

  const gaps = gapPrimarySecondary + gapToAuthor;
  const quotesBudget = Math.max(1, box.contentH - authorReserve - gaps);

  let primaryMaxH: number;
  let secondaryMaxH: number;

  if (opts.hasSecondary) {
    primaryMaxH = Math.floor(quotesBudget * cfg.primaryShare);
    secondaryMaxH = Math.floor(quotesBudget * cfg.secondaryShare);
    // Absorb rounding so we don't exceed quotesBudget
    const used = primaryMaxH + secondaryMaxH;
    if (used < quotesBudget) {
      primaryMaxH += quotesBudget - used;
    }
  } else {
    primaryMaxH = quotesBudget;
    secondaryMaxH = 0;
  }

  return {
    contentW: box.contentW,
    contentH: box.contentH,
    inset: box.inset,
    frameW: box.frameW,
    frameH: box.frameH,
    primaryMaxH: Math.max(1, primaryMaxH),
    secondaryMaxH: Math.max(0, secondaryMaxH),
    authorReserve,
    gapPrimarySecondary,
    gapToAuthor,
    hasSecondary: opts.hasSecondary,
    hasAuthor: opts.hasAuthor,
  };
}
