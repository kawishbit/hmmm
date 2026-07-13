import { LAYOUT_LIST, type LayoutSpec } from "./layouts";
import { type FittedQuoteType, fitQuoteStack, type TextMeasureFn } from "./pretext-fit";
import { quoteHeightBudgets } from "./text-budgets";
import type { AspectRatioKey, QuoteDocument } from "./types";

export interface LayoutSuggestion {
  key: AspectRatioKey;
  label: string;
  shortLabel: string;
  /** Higher is better (more leftover vertical room after fit) */
  score: number;
  overflow: boolean;
  primarySize: number;
}

type DocSlice = Pick<QuoteDocument, "text" | "textSecondary" | "author" | "style" | "aspectRatio">;

/**
 * Rank alternate aspect ratios for the current quote content.
 * Prefer layouts that fit without overflow and yield larger type.
 */
export function suggestLayouts(doc: DocSlice, measure?: TextMeasureFn): LayoutSuggestion[] {
  const results: LayoutSuggestion[] = [];

  for (const layout of LAYOUT_LIST) {
    if (layout.key === doc.aspectRatio) continue;

    const fitted = fitQuoteStack(
      {
        text: doc.text,
        textSecondary: doc.textSecondary,
        author: doc.author,
        aspectRatio: layout.key,
        style: doc.style,
      },
      measure ? { measure } : {},
    );

    results.push(scoreLayout(layout, fitted, doc));
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/** Top suggestions that improve on current overflow or type size. */
export function topLayoutSuggestions(
  doc: DocSlice,
  current: FittedQuoteType | null,
  limit = 2,
  measure?: TextMeasureFn,
): LayoutSuggestion[] {
  const all = suggestLayouts(doc, measure);
  if (!current?.overflow) {
    return all
      .filter((s) => !s.overflow && s.primarySize > (current?.primarySize ?? 0) + 2)
      .slice(0, limit);
  }
  return all.filter((s) => !s.overflow).slice(0, limit);
}

function scoreLayout(
  layout: LayoutSpec,
  fitted: FittedQuoteType,
  doc: Pick<QuoteDocument, "textSecondary" | "author">,
): LayoutSuggestion {
  const budgets = quoteHeightBudgets(layout.key, {
    hasSecondary: doc.textSecondary.trim().length > 0,
    hasAuthor: doc.author.trim().length > 0,
  });

  let score = 0;
  if (!fitted.overflow) score += 1000;
  score += fitted.primarySize * 10;
  score += budgets.primaryMaxH * 0.05;
  if (doc.textSecondary.trim() && layout.ratio < 1) score += 30;

  return {
    key: layout.key,
    label: layout.label,
    shortLabel: layout.shortLabel,
    score,
    overflow: fitted.overflow,
    primarySize: fitted.primarySize,
  };
}
