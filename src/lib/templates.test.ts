import { describe, expect, test } from "bun:test";
import { applyTemplate, templateById } from "./templates";
import { DEFAULT_QUOTE_DOCUMENT, type QuoteDocument } from "./types";

function baseDoc(partial: Partial<QuoteDocument> = {}): QuoteDocument {
  const { style: stylePartial, background: bgPartial, ...rest } = partial;
  return {
    ...DEFAULT_QUOTE_DOCUMENT,
    ...rest,
    background: bgPartial
      ? ({ ...DEFAULT_QUOTE_DOCUMENT.background, ...bgPartial } as QuoteDocument["background"])
      : { ...DEFAULT_QUOTE_DOCUMENT.background },
    style: { ...DEFAULT_QUOTE_DOCUMENT.style, ...stylePartial },
  };
}

function requireTemplate(id: string) {
  const t = templateById(id);
  expect(t).toBeDefined();
  if (!t) {
    throw new Error(`missing template ${id}`);
  }
  return t;
}

describe("applyTemplate", () => {
  test("preserveText keeps content but switches style and aspect", () => {
    const t = requireTemplate("editorial-serif");
    const next = applyTemplate(baseDoc({ text: "Keep me", author: "Me" }), t, {
      preserveText: true,
    });
    expect(next.text).toBe("Keep me");
    expect(next.author).toBe("Me");
    expect(next.style.fontId).toBe("playfair");
    expect(next.aspectRatio).toBe("4:5");
    expect(next.background).toEqual({ type: "gallery", id: "photo-paper-texture.jpg" });
  });

  test("empty document fills sample when fillSample defaults", () => {
    const t = requireTemplate("bold-sans");
    const next = applyTemplate(baseDoc({ text: "", author: "" }), t);
    expect(next.text).toBe(t.sampleText ?? "");
    expect(next.author).toBe(t.sampleAuthor ?? "");
    expect(next.style.fontWeight).toBe(700);
  });

  test("non-empty without preserveText still keeps user text by default fillSample=false", () => {
    const t = requireTemplate("minimal-navy");
    const next = applyTemplate(baseDoc({ text: "Mine", author: "A" }), t);
    expect(next.text).toBe("Mine");
    expect(next.author).toBe("A");
    expect(next.aspectRatio).toBe("9:16");
  });

  test("explicit fillSample replaces existing text", () => {
    const t = requireTemplate("lime-poster");
    const next = applyTemplate(baseDoc({ text: "Mine", author: "A" }), t, {
      fillSample: true,
      preserveText: false,
    });
    expect(next.text).toBe(t.sampleText ?? "");
    expect(next.author).toBe(t.sampleAuthor ?? "");
  });
});
