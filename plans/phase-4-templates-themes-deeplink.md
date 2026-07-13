# Phase 4 — Templates, themes & deep linking

**Goal:** Fast starts via templates; site themes; partner sites can open the editor with quote + author prefilled.

**Depends on:** Phases 1–3  
**Unblocks:** marketing polish and external integrations (Phase 5 PWA)

**Status:** Complete

---

## Scope

### Quote templates
- [x] `Template` type + `applyTemplate()` in `src/lib/templates.ts`
- [x] 5 templates: Editorial serif, Bold sans, Minimal navy, Ocean calm, Lime poster
- [x] **Tpl** panel tab; keeps existing text unless empty (then sample fills)
- [x] Local assets only

### Site themes
- [x] Light (default), Dark, Mint, Lilac, Navy — chrome only (`data-theme` + CSS vars)
- [x] `localStorage` key `hmmm-site-theme` + early inline script (no FOUC)
- [x] Theme picker in toolbar (and mobile row)
- [x] First visit: light (not `prefers-color-scheme`)

### Deep linking
- [x] `q` + `author` via `src/lib/deeplink.ts`
- [x] Applied on mount from `window.location.search`; 300-unit clamp; plain text only
- [x] `/` and `/create` both host the editor (query preserved on static hosts)
- [x] **Link** button copies absolute share URL
- [x] README “Integrating with Hmmm”

### Landing
- [x] Skipped — product remains editor-first (tool shell). Templates live in Tpl tab.

---

## Acceptance criteria

1. [x] Template one-click → exportable composition  
2. [x] Theme picker + refresh persistence  
3. [x] `/create?q=Hello%20world&author=Test` prefills  
4. [x] Special characters round-trip (tests + URLSearchParams)  
5. [x] XSS-safe: markup in `q` is text content only  

---

## Key files

| Path | Role |
|------|------|
| `src/lib/templates.ts` | Catalog + apply |
| `src/lib/themes.ts` | Theme ids + storage |
| `src/lib/deeplink.ts` | Parse / build / clear |
| `src/components/editor/TemplatesPanel.vue` | UI |
| `src/components/editor/ThemePicker.vue` | UI |
| `src/styles/global.css` | `[data-theme]` overrides |
