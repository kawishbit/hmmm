import { describe, expect, test } from "bun:test";
import {
  clampToWordLimit,
  countLabel,
  countWords,
  detectCountMode,
  detectTextDirection,
} from "./words";

describe("countWords", () => {
  test("latin words", () => {
    expect(countWords("hello world foo")).toBe(3);
    expect(countLabel("hello world")).toBe("words");
  });

  test("cjk uses character budget", () => {
    const text = "春眠不觉晓处处闻啼鸟";
    expect(detectCountMode(text)).toBe("chars");
    expect(countWords(text)).toBe(Array.from(text).length);
    expect(countLabel(text)).toBe("chars");
  });

  test("clamp latin", () => {
    const words = Array.from({ length: 10 }, (_, i) => `w${i}`).join(" ");
    expect(countWords(clampToWordLimit(words, 5))).toBe(5);
  });

  test("clamp cjk", () => {
    const text = "一二三四五六七八九十";
    const clamped = clampToWordLimit(text, 5);
    expect(countWords(clamped)).toBe(5);
  });
});

describe("detectTextDirection", () => {
  test("english ltr", () => {
    expect(detectTextDirection("Hello world")).toBe("ltr");
  });

  test("arabic rtl", () => {
    expect(detectTextDirection("الطريق الوحيد")).toBe("rtl");
  });
});
