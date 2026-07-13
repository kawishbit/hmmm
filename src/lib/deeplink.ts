import { MAX_WORDS } from "./types";
import { clampToWordLimit, countWords } from "./words";

export interface DeepLinkFields {
  q: string;
  author: string;
}

export interface ParseDeepLinkResult {
  fields: DeepLinkFields;
  /** True when a param was present but decode failed */
  malformed: boolean;
  /** True when text was clamped to the word/char cap */
  clamped: boolean;
  /** True when query had q or author */
  hadParams: boolean;
}

/**
 * Parse partner deep-link query params.
 * v1: `q` + `author` only. Values are plain text (never HTML).
 */
export function parseDeepLinkSearch(search: string): ParseDeepLinkResult {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  let malformed = false;
  let clamped = false;
  const hadParams = params.has("q") || params.has("author");

  let q = "";
  let author = "";

  if (params.has("q")) {
    try {
      // URLSearchParams already decodes; still guard empty
      const raw = params.get("q") ?? "";
      const before = countWords(raw);
      q = clampToWordLimit(raw, MAX_WORDS);
      if (countWords(q) < before) clamped = true;
    } catch {
      malformed = true;
      q = "";
    }
  }

  if (params.has("author")) {
    try {
      author = (params.get("author") ?? "").slice(0, 120);
    } catch {
      malformed = true;
      author = "";
    }
  }

  return {
    fields: { q, author },
    malformed,
    clamped,
    hadParams,
  };
}

/** Build a shareable relative path with q + author. */
export function buildDeepLinkPath(fields: { q: string; author: string }): string {
  const params = new URLSearchParams();
  const q = fields.q.trim();
  const author = fields.author.trim();
  if (q) params.set("q", q);
  if (author) params.set("author", author);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function buildDeepLinkAbsolute(
  origin: string,
  fields: { q: string; author: string },
): string {
  const path = buildDeepLinkPath(fields);
  const base = origin.replace(/\/$/, "");
  return `${base}${path}`;
}

/**
 * Strip deep-link params from the address bar without reloading
 * (keeps the rest of the path).
 */
export function clearDeepLinkFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("q") && !url.searchParams.has("author")) return;
  url.searchParams.delete("q");
  url.searchParams.delete("author");
  const next =
    url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash;
  window.history.replaceState({}, "", next);
}
