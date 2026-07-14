import { describe, expect, test } from "bun:test";
import { clampToCharLimit, countChars, detectTextDirection } from "./words";

describe("countChars", () => {
  test("latin characters", () => {
    expect(countChars("hello")).toBe(5);
    expect(countChars("hello world")).toBe(11);
  });

  test("emoji counts as one code point", () => {
    expect(countChars("🍎")).toBe(1);
    expect(countChars("hi🍎")).toBe(3);
  });

  test("cjk characters", () => {
    const text = "春眠不觉晓";
    expect(countChars(text)).toBe(5);
  });

  test("clamp to limit", () => {
    expect(clampToCharLimit("abcdefghij", 5)).toBe("abcde");
    expect(clampToCharLimit("short", 100)).toBe("short");
  });

  test("clamp preserves under-limit text", () => {
    const text = "exactly";
    expect(clampToCharLimit(text, 7)).toBe(text);
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
