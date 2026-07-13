import { layout, prepare } from "@chenglou/pretext";
import { fontByCssFamily, fontById } from "./fonts";
import { quoteHeightBudgets } from "./text-budgets";
import { type QuoteDocument, SECONDARY_FONT_SCALE } from "./types";

/** Named face for canvas measure — avoid system-ui (pretext caveat). */
export const MEASURE_FONT_FAMILY = "Inter";

export const PRIMARY_LINE_HEIGHT_RATIO = 1.3;
export const SECONDARY_LINE_HEIGHT_RATIO = 1.35;
export const AUTHOR_LINE_HEIGHT_RATIO = 1.35;

export const PRIMARY_MIN_SIZE = 22;
export const PRIMARY_MAX_SIZE_DEFAULT = 72;
export const SECONDARY_MIN_SIZE = 14;
export const SECONDARY_MAX_ABS = 40;
export const AUTHOR_MIN_SIZE = 16;
export const AUTHOR_MAX_SIZE = 28;

export interface MeasureResult {
  height: number;
  lineCount: number;
}

/**
 * Pluggable measure — default uses Pretext (browser canvas).
 * Injected in unit tests.
 */
export type TextMeasureFn = (
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  letterSpacingPx: number,
) => MeasureResult;

export interface FitFontSizeArgs {
  text: string;
  fontFamily?: string;
  fontWeight?: string | number;
  maxWidth: number;
  maxHeight: number;
  minSize: number;
  maxSize: number;
  lineHeightRatio: number;
  /** Em units (CSS letter-spacing), converted to px per size */
  letterSpacingEm?: number;
  measure?: TextMeasureFn;
}

export interface FitFontSizeResult {
  fontSize: number;
  height: number;
  lineCount: number;
  /** false if even minSize exceeds maxHeight */
  fits: boolean;
}

export interface FittedQuoteType {
  /** Export-space sizes */
  primarySize: number;
  secondarySize: number | null;
  authorSize: number;
  primaryLineHeight: number;
  secondaryLineHeight: number | null;
  authorLineHeight: number;
  contentW: number;
  inset: number;
  frameW: number;
  frameH: number;
  gapPrimarySecondary: number;
  gapToAuthor: number;
  primaryFits: boolean;
  secondaryFits: boolean;
  /** True if any block hit min size and still overflows */
  overflow: boolean;
  preferredPrimary: number;
  fittedPrimaryBeforeClamp: number;
}

const prepareCache = new Map<string, ReturnType<typeof prepare>>();

function cacheKey(text: string, font: string, letterSpacing: number): string {
  return `${font}\0${letterSpacing}\0${text}`;
}

export function clearPrepareCache() {
  prepareCache.clear();
}

/** Default measure via @chenglou/pretext (requires canvas). */
export function pretextMeasure(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  letterSpacingPx: number,
): MeasureResult {
  const key = cacheKey(text, font, letterSpacingPx);
  let prepared = prepareCache.get(key);
  if (!prepared) {
    prepared = prepare(text, font, {
      whiteSpace: "pre-wrap",
      letterSpacing: letterSpacingPx,
    });
    prepareCache.set(key, prepared);
    // Bound cache size roughly
    if (prepareCache.size > 80) {
      const first = prepareCache.keys().next().value;
      if (first !== undefined) prepareCache.delete(first);
    }
  }
  return layout(prepared, maxWidth, lineHeight);
}

/**
 * Binary-search the largest font size whose laid-out height ≤ maxHeight.
 */
export function fitFontSize(args: FitFontSizeArgs): FitFontSizeResult {
  const text = args.text;
  if (!text.trim()) {
    return { fontSize: args.minSize, height: 0, lineCount: 0, fits: true };
  }

  const fontFamily = args.fontFamily ?? MEASURE_FONT_FAMILY;
  const fontWeight = args.fontWeight ?? 500;
  const letterSpacingEm = args.letterSpacingEm ?? 0;
  const measure = args.measure ?? pretextMeasure;

  let minSize = Math.max(1, Math.floor(args.minSize));
  let maxSize = Math.max(minSize, Math.floor(args.maxSize));
  let best: FitFontSizeResult | null = null;

  // Probe min first for overflow flag
  const measureAt = (size: number): FitFontSizeResult => {
    const font = `${fontWeight} ${size}px ${fontFamily}`;
    const lh = size * args.lineHeightRatio;
    const ls = size * letterSpacingEm;
    const { height, lineCount } = measure(text, font, args.maxWidth, lh, ls);
    return {
      fontSize: size,
      height,
      lineCount,
      fits: height <= args.maxHeight + 0.5,
    };
  };

  const atMin = measureAt(minSize);
  if (!atMin.fits) {
    return { ...atMin, fits: false };
  }
  best = atMin;

  while (minSize <= maxSize) {
    const mid = Math.floor((minSize + maxSize) / 2);
    const result = measureAt(mid);
    if (result.fits) {
      best = result;
      minSize = mid + 1;
    } else {
      maxSize = mid - 1;
    }
  }

  return best ?? atMin;
}

export function resolveMeasureFamily(style: QuoteDocument["style"]): string {
  if (style.fontId) {
    const f = fontById(style.fontId);
    const name = f.measureFamily;
    return name.includes(" ") ? `"${name}"` : name;
  }
  const f = fontByCssFamily(style.fontFamily);
  const name = f.measureFamily;
  return name.includes(" ") ? `"${name}"` : name;
}

export interface FitQuoteStackOptions {
  measure?: TextMeasureFn;
}

/**
 * Fit primary + optional secondary + author in export pixel space.
 */
export function fitQuoteStack(
  doc: Pick<QuoteDocument, "text" | "textSecondary" | "author" | "aspectRatio" | "style">,
  options: FitQuoteStackOptions = {},
): FittedQuoteType {
  const hasSecondary = doc.textSecondary.trim().length > 0;
  const hasAuthor = doc.author.trim().length > 0;
  // Use real text or placeholder for empty primary so preview placeholder still sizes
  const primaryText = doc.text.trim() || "Your quote appears here";
  const secondaryText = doc.textSecondary.trim();

  const budgets = quoteHeightBudgets(doc.aspectRatio, { hasSecondary, hasAuthor });
  const family = resolveMeasureFamily(doc.style);
  const weight = doc.style.fontWeight ?? 500;
  const secondaryWeight = weight >= 600 ? 500 : 400;
  const preferredPrimary = doc.style.fontSizePx;
  const maxPrimary = Math.min(PRIMARY_MAX_SIZE_DEFAULT, preferredPrimary);

  const primary = fitFontSize({
    text: primaryText,
    fontFamily: family,
    fontWeight: weight,
    maxWidth: budgets.contentW,
    maxHeight: budgets.primaryMaxH,
    minSize: PRIMARY_MIN_SIZE,
    maxSize: maxPrimary,
    lineHeightRatio: PRIMARY_LINE_HEIGHT_RATIO,
    letterSpacingEm: -0.02,
    measure: options.measure,
  });

  let secondary: FitFontSizeResult | null = null;
  if (hasSecondary) {
    const maxSecondary = Math.min(
      SECONDARY_MAX_ABS,
      Math.floor(primary.fontSize * SECONDARY_FONT_SCALE),
    );
    secondary = fitFontSize({
      text: secondaryText,
      fontFamily: family,
      fontWeight: secondaryWeight,
      maxWidth: budgets.contentW,
      maxHeight: budgets.secondaryMaxH,
      minSize: SECONDARY_MIN_SIZE,
      maxSize: Math.max(SECONDARY_MIN_SIZE, maxSecondary),
      lineHeightRatio: SECONDARY_LINE_HEIGHT_RATIO,
      letterSpacingEm: -0.01,
      measure: options.measure,
    });
  }

  const authorSize = clamp(Math.round(primary.fontSize * 0.38), AUTHOR_MIN_SIZE, AUTHOR_MAX_SIZE);

  const overflow = !primary.fits || (secondary !== null && !secondary.fits);

  return {
    primarySize: primary.fontSize,
    secondarySize: secondary?.fontSize ?? null,
    authorSize,
    primaryLineHeight: primary.fontSize * PRIMARY_LINE_HEIGHT_RATIO,
    secondaryLineHeight: secondary ? secondary.fontSize * SECONDARY_LINE_HEIGHT_RATIO : null,
    authorLineHeight: authorSize * AUTHOR_LINE_HEIGHT_RATIO,
    contentW: budgets.contentW,
    inset: budgets.inset,
    frameW: budgets.frameW,
    frameH: budgets.frameH,
    gapPrimarySecondary: budgets.gapPrimarySecondary,
    gapToAuthor: budgets.gapToAuthor,
    primaryFits: primary.fits,
    secondaryFits: secondary?.fits ?? true,
    overflow,
    preferredPrimary,
    fittedPrimaryBeforeClamp: primary.fontSize,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Scale export-space fit metrics to the on-screen frame. */
export function scaleFittedToDisplay(
  fitted: FittedQuoteType,
  displayW: number,
  displayH: number,
): FittedQuoteType {
  const exportShort = Math.min(fitted.frameW, fitted.frameH);
  const displayShort = Math.min(displayW, displayH);
  const s = displayShort / exportShort;

  return {
    ...fitted,
    primarySize: Math.max(10, Math.round(fitted.primarySize * s)),
    secondarySize:
      fitted.secondarySize !== null ? Math.max(9, Math.round(fitted.secondarySize * s)) : null,
    authorSize: Math.max(9, Math.round(fitted.authorSize * s)),
    primaryLineHeight: fitted.primaryLineHeight * s,
    secondaryLineHeight:
      fitted.secondaryLineHeight !== null ? fitted.secondaryLineHeight * s : null,
    authorLineHeight: fitted.authorLineHeight * s,
    contentW: fitted.contentW * s,
    inset: fitted.inset * s,
    gapPrimarySecondary: fitted.gapPrimarySecondary * s,
    gapToAuthor: fitted.gapToAuthor * s,
    // frameW/H stay export for reference; display frame is separate
  };
}

/**
 * Approximate measure for unit tests (no canvas).
 * Assumes average char width ≈ 0.52em for Latin.
 */
export function approximateMeasure(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  _letterSpacingPx: number,
): MeasureResult {
  const sizeMatch = font.match(/(\d+(?:\.\d+)?)px/);
  const size = sizeMatch ? Number(sizeMatch[1]) : 16;
  const avgChar = size * 0.52;
  const lines = text.split("\n");
  let lineCount = 0;
  for (const raw of lines) {
    const line = raw.length === 0 ? " " : raw;
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lineCount += 1;
      continue;
    }
    let current = 0;
    for (const w of words) {
      const ww = Math.max(avgChar, w.length * avgChar);
      if (current === 0) {
        current = ww;
      } else if (current + avgChar + ww <= maxWidth) {
        current += avgChar + ww;
      } else {
        lineCount += 1;
        current = ww;
      }
    }
    lineCount += 1;
  }
  lineCount = Math.max(1, lineCount);
  return { height: lineCount * lineHeight, lineCount };
}
