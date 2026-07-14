import { MAX_AUTHOR_CHARS, MAX_QUOTE_CHARS } from "./types";
import { clampToCharLimit, countChars } from "./words";

/** Prefix marks base64url-encoded share values (vs legacy plain-text params). */
const B64_PREFIX = "b64.";

export interface DeepLinkFields {
  q: string;
  author: string;
}

export interface ParseDeepLinkResult {
  fields: DeepLinkFields;
  /** True when a param was present but decode failed */
  malformed: boolean;
  /** True when text was clamped to the char cap */
  clamped: boolean;
  /** True when query had q or author */
  hadParams: boolean;
}

/** UTF-8 string → base64url (no padding). */
export function encodeShareValue(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const b64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${B64_PREFIX}${b64}`;
}

/** Decode a share param: base64url (with prefix) or legacy plain text. */
export function decodeShareValue(raw: string): string {
  if (!raw.startsWith(B64_PREFIX)) {
    return raw;
  }
  const b64url = raw.slice(B64_PREFIX.length);
  if (!b64url) return "";
  const padded = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Parse partner deep-link query params.
 * v1: `q` + `author` only. Values are plain text or `b64.` + base64url (never HTML).
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
      const raw = decodeShareValue(params.get("q") ?? "");
      const before = countChars(raw);
      q = clampToCharLimit(raw, MAX_QUOTE_CHARS);
      if (countChars(q) < before) clamped = true;
    } catch {
      malformed = true;
      q = "";
    }
  }

  if (params.has("author")) {
    try {
      const raw = decodeShareValue(params.get("author") ?? "");
      const before = countChars(raw);
      author = clampToCharLimit(raw, MAX_AUTHOR_CHARS);
      if (countChars(author) < before) clamped = true;
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

/** Build a shareable relative path with q + author (base64url-encoded). */
export function buildDeepLinkPath(fields: { q: string; author: string }): string {
  const params = new URLSearchParams();
  const q = fields.q.trim();
  const author = fields.author.trim();
  if (q) params.set("q", encodeShareValue(q));
  if (author) params.set("author", encodeShareValue(author));
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
