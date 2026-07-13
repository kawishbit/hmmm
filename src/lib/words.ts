import { MAX_WORDS } from "./types";

/**
 * Space-delimited word count for Latin scripts.
 * CJK / script-aware counting lands in Phase 3.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function isOverWordLimit(text: string, max = MAX_WORDS): boolean {
  return countWords(text) > max;
}

/**
 * Clamp pasted/typed text so the result has at most `max` words.
 * Keeps as many leading words as fit.
 */
export function clampToWordLimit(text: string, max = MAX_WORDS): string {
  const trimmed = text.trim();
  if (!trimmed) return text.startsWith(" ") || text.startsWith("\n") ? "" : text;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= max) {
    // Preserve trailing whitespace only if under limit and user is mid-type
    return text;
  }

  return words.slice(0, max).join(" ");
}

export function wordsRemaining(text: string, max = MAX_WORDS): number {
  return Math.max(0, max - countWords(text));
}
