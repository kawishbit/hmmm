import { describe, expect, test } from "bun:test";
import { buildDeepLinkPath, parseDeepLinkSearch } from "./deeplink";
import { countWords } from "./words";

describe("parseDeepLinkSearch", () => {
  test("parses q and author", () => {
    const r = parseDeepLinkSearch("?q=Hello%20world&author=Test");
    expect(r.fields.q).toBe("Hello world");
    expect(r.fields.author).toBe("Test");
    expect(r.hadParams).toBe(true);
    expect(r.malformed).toBe(false);
  });

  test("handles emoji and punctuation", () => {
    const r = parseDeepLinkSearch("?q=Stay%20hungry%20%F0%9F%8D%8E&author=Steve%20Jobs");
    expect(r.fields.q).toContain("🍎");
    expect(r.fields.author).toBe("Steve Jobs");
  });

  test("clamps long quotes", () => {
    const words = Array.from({ length: 320 }, (_, i) => `w${i}`).join(" ");
    const r = parseDeepLinkSearch(`?q=${encodeURIComponent(words)}`);
    expect(countWords(r.fields.q)).toBe(300);
    expect(r.clamped).toBe(true);
  });

  test("treats markup as plain text", () => {
    const r = parseDeepLinkSearch(`?q=${encodeURIComponent("<script>alert(1)</script>")}`);
    expect(r.fields.q).toBe("<script>alert(1)</script>");
  });

  test("empty search", () => {
    const r = parseDeepLinkSearch("");
    expect(r.hadParams).toBe(false);
    expect(r.fields.q).toBe("");
  });
});

describe("buildDeepLinkPath", () => {
  test("encodes via URLSearchParams", () => {
    const path = buildDeepLinkPath({ q: "a & b", author: "Ada" });
    expect(path.startsWith("/?")).toBe(true);
    const params = new URLSearchParams(path.slice(2));
    expect(params.get("q")).toBe("a & b");
    expect(params.get("author")).toBe("Ada");
  });
});
