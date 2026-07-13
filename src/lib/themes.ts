export type SiteThemeId = "light" | "dark" | "mint" | "lilac" | "navy";

export interface SiteTheme {
  id: SiteThemeId;
  label: string;
  /** Swatch for picker */
  swatch: string;
}

export const SITE_THEMES: SiteTheme[] = [
  { id: "light", label: "Light", swatch: "#ffffff" },
  { id: "dark", label: "Dark", swatch: "#131313" },
  { id: "mint", label: "Mint", swatch: "#c8e6cd" },
  { id: "lilac", label: "Lilac", swatch: "#c5b0f4" },
  { id: "navy", label: "Navy", swatch: "#1f1d3d" },
];

export const THEME_STORAGE_KEY = "hmmm-site-theme";
export const DEFAULT_THEME: SiteThemeId = "light";

export function isSiteThemeId(value: string | null | undefined): value is SiteThemeId {
  return SITE_THEMES.some((t) => t.id === value);
}

export function readStoredTheme(): SiteThemeId | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return isSiteThemeId(v) ? v : null;
  } catch {
    return null;
  }
}

/** First visit: light default (ignore prefers-color-scheme for predictable brand). */
export function resolveInitialTheme(): SiteThemeId {
  return readStoredTheme() ?? DEFAULT_THEME;
}

export function applySiteTheme(id: SiteThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function themeById(id: SiteThemeId): SiteTheme {
  return SITE_THEMES.find((t) => t.id === id) ?? SITE_THEMES[0];
}
