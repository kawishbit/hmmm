/**
 * Unicode-aware character count (code points, so emoji count as 1).
 */
export function countChars(text: string): number {
  return Array.from(text).length;
}

export function isOverCharLimit(text: string, max: number): boolean {
  return countChars(text) > max;
}

/**
 * Clamp pasted/typed text so the result has at most `max` code points.
 */
export function clampToCharLimit(text: string, max: number): string {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return chars.slice(0, max).join("");
}

export function charsRemaining(text: string, max: number): number {
  return Math.max(0, max - countChars(text));
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
