import { describe, expect, test } from "bun:test";
import {
  buildDeepLinkPath,
  decodeShareValue,
  encodeShareValue,
  parseDeepLinkSearch,
} from "./deeplink";
import { MAX_AUTHOR_CHARS, MAX_QUOTE_CHARS } from "./types";
import { countChars } from "./words";

describe("encodeShareValue / decodeShareValue", () => {
  test("round-trips unicode and emoji", () => {
    const samples = ["Hello world", "a & b = c?", "الطريق الوحيد", "Stay hungry 🍎", "春眠不觉晓"];
    for (const s of samples) {
      expect(decodeShareValue(encodeShareValue(s))).toBe(s);
    }
  });

  test("legacy plain text passes through", () => {
    expect(decodeShareValue("Hello world")).toBe("Hello world");
  });
});

describe("parseDeepLinkSearch", () => {
  test("parses base64 q, q2, and author", () => {
    const path = buildDeepLinkPath({
      q: "Hello world",
      q2: "Bonjour le monde",
      author: "Test",
    });
    const r = parseDeepLinkSearch(path.slice(1)); // drop leading /
    expect(r.fields.q).toBe("Hello world");
    expect(r.fields.q2).toBe("Bonjour le monde");
    expect(r.fields.author).toBe("Test");
    expect(r.hadParams).toBe(true);
    expect(r.malformed).toBe(false);
  });

  test("handles emoji and punctuation", () => {
    const path = buildDeepLinkPath({ q: "Stay hungry 🍎", author: "Steve Jobs" });
    const r = parseDeepLinkSearch(path.slice(1));
    expect(r.fields.q).toContain("🍎");
    expect(r.fields.author).toBe("Steve Jobs");
  });

  test("parses q2 alone", () => {
    const r = parseDeepLinkSearch(
      `?q2=${encodeURIComponent(encodeShareValue("الطريق الوحيد"))}`,
    );
    expect(r.hadParams).toBe(true);
    expect(r.fields.q2).toBe("الطريق الوحيد");
    expect(r.fields.q).toBe("");
  });

  test("clamps long quotes by character", () => {
    const long = "x".repeat(MAX_QUOTE_CHARS + 50);
    const r = parseDeepLinkSearch(`?q=${encodeURIComponent(encodeShareValue(long))}`);
    expect(countChars(r.fields.q)).toBe(MAX_QUOTE_CHARS);
    expect(r.clamped).toBe(true);
  });

  test("clamps long q2 by character", () => {
    const long = "y".repeat(MAX_QUOTE_CHARS + 50);
    const r = parseDeepLinkSearch(`?q2=${encodeURIComponent(encodeShareValue(long))}`);
    expect(countChars(r.fields.q2)).toBe(MAX_QUOTE_CHARS);
    expect(r.clamped).toBe(true);
  });

  test("clamps long author by character", () => {
    const long = "a".repeat(MAX_AUTHOR_CHARS + 20);
    const r = parseDeepLinkSearch(`?author=${encodeURIComponent(encodeShareValue(long))}`);
    expect(countChars(r.fields.author)).toBe(MAX_AUTHOR_CHARS);
    expect(r.clamped).toBe(true);
  });

  test("legacy plain-text params still work", () => {
    const r = parseDeepLinkSearch("?q=Hello%20world&q2=Bonjour&author=Test");
    expect(r.fields.q).toBe("Hello world");
    expect(r.fields.q2).toBe("Bonjour");
    expect(r.fields.author).toBe("Test");
  });

  test("treats markup as plain text", () => {
    const r = parseDeepLinkSearch(
      `?q=${encodeURIComponent(encodeShareValue("<script>alert(1)</script>"))}`,
    );
    expect(r.fields.q).toBe("<script>alert(1)</script>");
  });

  test("empty search", () => {
    const r = parseDeepLinkSearch("");
    expect(r.hadParams).toBe(false);
    expect(r.fields.q).toBe("");
    expect(r.fields.q2).toBe("");
  });
});

describe("buildDeepLinkPath", () => {
  test("encodes as base64url with prefix", () => {
    const path = buildDeepLinkPath({ q: "a & b", q2: "c & d", author: "Ada" });
    expect(path.startsWith("/?")).toBe(true);
    const params = new URLSearchParams(path.slice(2));
    const q = params.get("q") ?? "";
    const q2 = params.get("q2") ?? "";
    const author = params.get("author") ?? "";
    expect(q.startsWith("b64.")).toBe(true);
    expect(q2.startsWith("b64.")).toBe(true);
    expect(author.startsWith("b64.")).toBe(true);
    // URL should not contain the quote verbatim
    expect(path.includes("a & b")).toBe(false);
    expect(decodeShareValue(q)).toBe("a & b");
    expect(decodeShareValue(q2)).toBe("c & d");
    expect(decodeShareValue(author)).toBe("Ada");
  });

  test("omits empty q2", () => {
    const path = buildDeepLinkPath({ q: "Hello", author: "Ada" });
    const params = new URLSearchParams(path.slice(2));
    expect(params.has("q2")).toBe(false);
  });
});
