# Phase 2 — Backgrounds

**Goal:** Choose a curated gallery image or upload one; apply blur and preset filters.

**Depends on:** Phase 1  
**Unlocks:** richer templates (Phase 4) and better exports

**Status:** Complete · extended by [Phase 9 — curated photo packs](./phase-9-curated-backgrounds.md)

---

## Scope

### Gallery
- [x] Curated set of backgrounds in `public/backgrounds/` (12 original abstract SVGs).
- [x] Gallery UI: thumbnail grid in Background panel.
- [x] Selecting a thumbnail sets `document.background = { type: 'gallery', id }`.
- [x] Document licensing in `public/backgrounds/CREDITS.md` (original assets).

### Solids / gradients (nice-to-have shipped)
- [x] Solid color chips from DESIGN.md palette.
- [x] A few gradient presets.

### Upload
- [x] File input: image/* (JPEG, PNG, WebP, SVG).
- [x] Client-only: object URLs; **no upload to a server**.
- [x] Revoke object URLs on replace/unmount.
- [x] Max edge resize (2000px) via canvas before preview.
- [x] Error states: wrong type, decode failure, huge files (15 MB).

### Blur
- [x] Slider 0–24px on background layer only (text stays sharp).
- [x] Expanded bg layer so blur does not clip hard; export uses same CSS filter.

### Preset filters
- [x] none, B&W, sepia, punch (contrast), muted, darken, lift (brighten).
- [x] Combined with blur via `composeBackgroundFilter`.

### Scrim
- [x] Darken overlay slider (0–70%) for text legibility.

### Preview composition order
1. Background image / solid / gradient (cover, center).
2. Filter + blur (bg layer only).
3. Scrim overlay.
4. Quote + secondary + author text.

### UI
- [x] Left panel tabs: **Content** | **Background**.
- [x] Picking a bg with known tone auto-adjusts quote ink colors (light/dark).

---

## Out of scope (still)

- Remote stock API search.
- Server-side image CDN or moderation.
- Advanced crop UI.

---

## Acceptance criteria

1. [x] Gallery pick updates preview and export.
2. [x] User upload works client-side and appears in export.
3. [x] Blur slider affects bg only; text stays sharp.
4. [x] Each filter preset is visible in preview (and PNG via html-to-image).
5. [x] Switching gallery → upload → gallery revokes stale object URLs.

---

## Key files

| Path | Role |
|------|------|
| `src/lib/backgrounds.ts` | Gallery, solids, filters, `composeBackgroundFilter` |
| `src/lib/upload.ts` | Client image process + revoke |
| `src/components/editor/BackgroundPanel.vue` | Controls |
| `src/components/editor/QuotePreview.vue` | Layered bg / scrim / text |
| `public/backgrounds/*` | Assets + CREDITS |
