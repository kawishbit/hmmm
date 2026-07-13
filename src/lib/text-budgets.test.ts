import { describe, expect, test } from "bun:test";
import { contentBoxForLayout, quoteHeightBudgets } from "./text-budgets";

describe("contentBoxForLayout", () => {
  test("1:1 is square with inset", () => {
    const box = contentBoxForLayout("1:1");
    expect(box.frameW).toBe(1080);
    expect(box.frameH).toBe(1080);
    expect(box.inset).toBe(Math.round(1080 * 0.1));
    expect(box.contentW).toBe(box.frameW - box.inset * 2);
    expect(box.contentH).toBe(box.frameH - box.inset * 2);
  });

  test("9:16 is portrait", () => {
    const box = contentBoxForLayout("9:16");
    expect(box.frameW).toBe(1080);
    expect(box.frameH).toBeGreaterThan(box.frameW);
  });

  test("16:9 is landscape", () => {
    const box = contentBoxForLayout("16:9");
    expect(box.frameW).toBeGreaterThan(box.frameH);
  });
});

describe("quoteHeightBudgets", () => {
  test("without secondary primary uses full quotes budget", () => {
    const b = quoteHeightBudgets("1:1", { hasSecondary: false, hasAuthor: true });
    expect(b.secondaryMaxH).toBe(0);
    expect(b.gapPrimarySecondary).toBe(0);
    expect(b.primaryMaxH).toBeGreaterThan(100);
    expect(b.authorReserve).toBeGreaterThan(0);
  });

  test("with secondary splits primary/secondary", () => {
    const b = quoteHeightBudgets("1:1", { hasSecondary: true, hasAuthor: true });
    expect(b.secondaryMaxH).toBeGreaterThan(0);
    expect(b.primaryMaxH).toBeGreaterThan(b.secondaryMaxH);
    expect(b.gapPrimarySecondary).toBeGreaterThan(0);
    // Shares roughly 62/38
    const ratio = b.primaryMaxH / (b.primaryMaxH + b.secondaryMaxH);
    expect(ratio).toBeGreaterThan(0.55);
    expect(ratio).toBeLessThan(0.7);
  });

  test("no author frees vertical space", () => {
    const withA = quoteHeightBudgets("1:1", { hasSecondary: false, hasAuthor: true });
    const noA = quoteHeightBudgets("1:1", { hasSecondary: false, hasAuthor: false });
    expect(noA.primaryMaxH).toBeGreaterThan(withA.primaryMaxH);
    expect(noA.authorReserve).toBe(0);
  });
});
