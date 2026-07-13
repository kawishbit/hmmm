import { describe, expect, test } from "bun:test";
import { suggestLayouts, topLayoutSuggestions } from "./layout-suggest";
import { approximateMeasure, fitQuoteStack } from "./pretext-fit";
import { DEFAULT_QUOTE_DOCUMENT, type QuoteDocument } from "./types";

const measure = approximateMeasure;

function doc(
  partial: Partial<QuoteDocument> & {
    text: string;
    aspectRatio: QuoteDocument["aspectRatio"];
  },
): QuoteDocument {
  const { style: stylePartial, background: bgPartial, ...rest } = partial;
  return {
    ...DEFAULT_QUOTE_DOCUMENT,
    textSecondary: "",
    author: "A",
    ...rest,
    background: bgPartial
      ? ({ ...DEFAULT_QUOTE_DOCUMENT.background, ...bgPartial } as QuoteDocument["background"])
      : { ...DEFAULT_QUOTE_DOCUMENT.background },
    style: { ...DEFAULT_QUOTE_DOCUMENT.style, ...stylePartial },
  };
}

describe("suggestLayouts", () => {
  test("never suggests the current layout", () => {
    const d = doc({ text: "Hello", aspectRatio: "1:1" });
    const suggestions = suggestLayouts(d, measure);
    expect(suggestions.every((s) => s.key !== "1:1")).toBe(true);
  });

  test("ranks non-overflow above overflow when long text on wide frame", () => {
    const long = Array.from({ length: 120 }, (_, i) => `word${i}`).join(" ");
    const d = doc({ text: long, aspectRatio: "2:1" });
    const current = fitQuoteStack(d, { measure });
    const top = topLayoutSuggestions(d, current, 3, measure);
    for (const s of top) {
      expect(s.overflow).toBe(false);
      expect(s.key).not.toBe("2:1");
    }
  });
});
