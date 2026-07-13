import { MAX_WORDS } from "./types";

export type CountMode = "words" | "chars";

/** CJK Unified Ideographs + Hangul + Hiragana/Katakana ranges (simplified). */
const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;

/**
 * Detect if text is predominantly CJK (count characters instead of words).
 */
export function detectCountMode(text: string): CountMode {
  const trimmed = text.trim();
  if (!trimmed) return "words";
  const cjk = (trimmed.match(new RegExp(CJK_RE.source, "g")) ?? []).length;
  const letters = (trimmed.match(/\S/g) ?? []).length;
  if (letters === 0) return "words";
  return cjk / letters >= 0.35 ? "chars" : "words";
}

/**
 * Unit count: whitespace words for Latin/Arabic scripts;
 * non-whitespace characters for CJK-heavy text (300-unit hard cap).
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  if (detectCountMode(trimmed) === "chars") {
    return Array.from(trimmed.replace(/\s+/g, "")).length;
  }
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function countLabel(text: string): string {
  return detectCountMode(text) === "chars" ? "chars" : "words";
}

export function isOverWordLimit(text: string, max = MAX_WORDS): boolean {
  return countWords(text) > max;
}

/**
 * Clamp pasted/typed text so the result has at most `max` units.
 */
export function clampToWordLimit(text: string, max = MAX_WORDS): string {
  const mode = detectCountMode(text);
  if (mode === "chars") {
    const chars = Array.from(text);
    // Count non-whitespace toward budget; keep structure
    let used = 0;
    let out = "";
    for (const ch of chars) {
      if (/\s/.test(ch)) {
        out += ch;
        continue;
      }
      if (used >= max) break;
      out += ch;
      used += 1;
    }
    return out;
  }

  const trimmed = text.trim();
  if (!trimmed) return text.startsWith(" ") || text.startsWith("\n") ? "" : text;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= max) {
    return text;
  }
  return words.slice(0, max).join(" ");
}

export function wordsRemaining(text: string, max = MAX_WORDS): number {
  return Math.max(0, max - countWords(text));
}

/** Heuristic: predominantly Arabic / Hebrew script → RTL. */
export function detectTextDirection(text: string): "ltr" | "rtl" {
  const trimmed = text.trim();
  if (!trimmed) return "ltr";
  const rtl = (trimmed.match(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) ?? [])
    .length;
  const ltr = (trimmed.match(/[A-Za-z\u00C0-\u024F]/g) ?? []).length;
  if (rtl === 0) return "ltr";
  return rtl >= ltr ? "rtl" : "ltr";
}
