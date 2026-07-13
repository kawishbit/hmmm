import { describe, expect, test } from "bun:test";
import {
  approximateMeasure,
  fitFontSize,
  fitQuoteStack,
  PRIMARY_MIN_SIZE,
  scaleFittedToDisplay,
} from "./pretext-fit";
import { DEFAULT_QUOTE_DOCUMENT, type QuoteDocument } from "./types";

const measure = approximateMeasure;

function doc(partial: Partial<QuoteDocument> = {}): QuoteDocument {
  const { style: stylePartial, background: bgPartial, ...rest } = partial;
  return {
    ...DEFAULT_QUOTE_DOCUMENT,
    ...rest,
    background: bgPartial
      ? { ...DEFAULT_QUOTE_DOCUMENT.background, ...bgPartial }
      : { ...DEFAULT_QUOTE_DOCUMENT.background },
    style: { ...DEFAULT_QUOTE_DOCUMENT.style, ...stylePartial },
  };
}

describe("fitFontSize", () => {
  test("short text gets larger size than long text", () => {
    const short = fitFontSize({
      text: "Hello world",
      maxWidth: 800,
      maxHeight: 400,
      minSize: 22,
      maxSize: 72,
      lineHeightRatio: 1.3,
      measure,
    });
    const long = fitFontSize({
      text: Array.from({ length: 80 }, (_, i) => `word${i}`).join(" "),
      maxWidth: 800,
      maxHeight: 400,
      minSize: 22,
      maxSize: 72,
      lineHeightRatio: 1.3,
      measure,
    });
    expect(short.fits).toBe(true);
    expect(short.fontSize).toBeGreaterThan(long.fontSize);
  });

  test("empty text fits", () => {
    const r = fitFontSize({
      text: "   ",
      maxWidth: 800,
      maxHeight: 200,
      minSize: 22,
      maxSize: 72,
      lineHeightRatio: 1.3,
      measure,
    });
    expect(r.fits).toBe(true);
    expect(r.height).toBe(0);
  });

  test("impossible height returns min size with fits false", () => {
    const r = fitFontSize({
      text: Array.from({ length: 200 }, (_, i) => `word${i}`).join(" "),
      maxWidth: 200,
      maxHeight: 20,
      minSize: 22,
      maxSize: 72,
      lineHeightRatio: 1.3,
      measure,
    });
    expect(r.fontSize).toBe(22);
    expect(r.fits).toBe(false);
  });
});

describe("fitQuoteStack", () => {
  test("short quote near preferred max", () => {
    const fitted = fitQuoteStack(
      doc({
        text: "Stay hungry. Stay foolish.",
        textSecondary: "",
        author: "Steve Jobs",
        aspectRatio: "1:1",
        style: { ...DEFAULT_QUOTE_DOCUMENT.style, fontSizePx: 52 },
      }),
      { measure },
    );
    expect(fitted.primarySize).toBeGreaterThanOrEqual(PRIMARY_MIN_SIZE);
    expect(fitted.primarySize).toBeLessThanOrEqual(52);
    expect(fitted.secondarySize).toBeNull();
    expect(fitted.overflow).toBe(false);
  });

  test("secondary is smaller than primary when present", () => {
    const fitted = fitQuoteStack(
      doc({
        text: "The only way to do great work is to love what you do.",
        textSecondary: "الطريق الوحيد للقيام بعمل عظيم هو أن تحب ما تفعل.",
        author: "Steve Jobs",
        aspectRatio: "1:1",
      }),
      { measure },
    );
    expect(fitted.secondarySize).not.toBeNull();
    if (fitted.secondarySize === null) {
      throw new Error("expected secondary size");
    }
    expect(fitted.secondarySize).toBeLessThanOrEqual(fitted.primarySize);
  });

  test("empty secondary gives null secondary size", () => {
    const fitted = fitQuoteStack(doc({ textSecondary: "  ", text: "Hello" }), { measure });
    expect(fitted.secondarySize).toBeNull();
    expect(fitted.gapPrimarySecondary).toBe(0);
  });

  test("long text shrinks vs short on same layout", () => {
    const short = fitQuoteStack(doc({ text: "Be yourself." }), { measure });
    const long = fitQuoteStack(
      doc({
        text: Array.from({ length: 120 }, (_, i) => `word${i}`).join(" "),
      }),
      { measure },
    );
    expect(long.primarySize).toBeLessThanOrEqual(short.primarySize);
  });

  test("preferred fontSizePx caps fitted primary size", () => {
    const lowMax = fitQuoteStack(
      doc({
        text: "Hi",
        style: { ...DEFAULT_QUOTE_DOCUMENT.style, fontSizePx: 28 },
      }),
      { measure },
    );
    const highMax = fitQuoteStack(
      doc({
        text: "Hi",
        style: { ...DEFAULT_QUOTE_DOCUMENT.style, fontSizePx: 72 },
      }),
      { measure },
    );
    expect(lowMax.primarySize).toBeLessThanOrEqual(28);
    expect(highMax.primarySize).toBeGreaterThanOrEqual(lowMax.primarySize);
  });

  test("taller layout yields larger or equal type for long text", () => {
    const long = Array.from({ length: 90 }, (_, i) => `word${i}`).join(" ");
    const wide = fitQuoteStack(doc({ text: long, aspectRatio: "2:1" }), { measure });
    const story = fitQuoteStack(doc({ text: long, aspectRatio: "9:16" }), { measure });
    expect(story.primarySize).toBeGreaterThanOrEqual(wide.primarySize);
  });
});

describe("scaleFittedToDisplay", () => {
  test("scales sizes down for smaller frame", () => {
    const fitted = fitQuoteStack(doc({ text: "Hello" }), { measure });
    const display = scaleFittedToDisplay(fitted, 540, 540);
    expect(display.primarySize).toBeLessThanOrEqual(fitted.primarySize);
    expect(display.inset).toBeCloseTo(fitted.inset * 0.5, 0);
  });
});
