# Phase 3 — Typography, layout & fit

**Goal:** Full control of type and composition; aspect ratios; intelligent fit so long quotes prefer full text over silent truncation (pretext-informed).

**Depends on:** Phase 1 (required), Phase 2 (recommended for realistic previews)  
**Unblocks:** Templates and deep-link quality (Phase 4)

---

## Scope

### Aspect ratios / layouts
- [x] Support common ratios (toolbar picker shipped early with tool shell):
  - `1:1` (Instagram post)
  - `4:5` (IG portrait)
  - `9:16` (story / TikTok)
  - `16:9` (landscape / OG)
  - `2:1` (wide)
- [x] Layout picker UI in top toolbar (mini frame + ratio chips).
- [x] Preview frame and export resolution follow selected ratio (export short side 1080).
- [ ] Optional additional ratios / custom size (if needed).

### Typography controls
- [ ] Font family picker — curated web-safe / bundled fonts good for quotes (serif + sans + display; include at least one that handles Arabic if we claim multilingual — see open questions).
- [ ] Color picker (quote + author; optional separate author color).
- [ ] Size control (slider or stepped sizes); may be auto-overridden by fit engine.
- [ ] Weight / style if font supports it (optional).
- [ ] Line height / letter-spacing (optional advanced panel).

### Position & alignment
- [ ] Text align: left / center / right (and start/end for RTL).
- [ ] Vertical alignment: top / middle / bottom (or free position).
- [ ] Drag-to-position **or** padding insets + safe margins (pick one primary interaction; drag is nicer).
- [ ] Author placement relative to quote (below, with em-dash convention).

### Multilingual & 300-word policy
- [ ] Word/count utility:
  - Latin: whitespace tokens.
  - CJK: character-based budget approximation (document formula in UI).
  - Arabic / mixed scripts: sensible counting; set `dir` and font fallbacks.
- [ ] **Hard cap at 300 words** (or script-equivalent): block input beyond cap and refuse export if somehow over.
- [ ] Within the cap, prefer **showing full text**; do not truncate by default.

### pretext / fit engine
- Core auto-fit lives in **[phase-2.5-pretext-fit.md](./phase-2.5-pretext-fit.md)** (do that first).
- [ ] Integrate [pretext](https://github.com/chenglou/pretext) binary-search fit (owned by 2.5).
- [ ] Measure whether current font size + box fits the full quote (2.5).
- [ ] Strategies when it doesn’t fit (ordered preference):
  1. Auto-reduce font size within min/max bounds — **2.5**.
  2. Suggest alternate aspect ratios that yield more vertical space — **Phase 3 polish**.
  3. Optional user-approved truncation / ellipsis (never silent) — **Phase 3 optional**.
- [ ] UI: non-blocking banner (“This quote fits better in 9:16 — Switch”) when fit score is poor — **Phase 3** (2.5 ships a simpler overflow warning).
- [ ] Unit-test pure fit helpers with fixture strings — **2.5**.
- [ ] Manual size slider drives **preferred max**; fitted size = `min(preferred, autoFit)` once 2.5 lands.

---

## Out of scope

- Full desktop-publishing features (columns, drop caps, multi-block text).
- User-uploaded custom fonts (possible later via FontFace API).

---

## Acceptance criteria

1. All planned aspect ratios export at correct dimensions.
2. Font, color, size, alignment, and position changes reflect in preview + PNG.
3. Quotes at or under 300 words can still be composed (possibly smaller type / taller layout) without forced silent truncation; over-cap input is blocked.
4. Overflow surfaces a suggestion or auto-fit; user understands what happened.
5. RTL sample quote renders with correct direction when using an appropriate font.

---

## Technical notes

- Keep measurement and export DPI consistent (devicePixelRatio vs fixed export scale).
- Isolate fit logic from Vue components for tests.
- Document min font size for legibility on mobile screenshots.

---

## Suggested PR / commit slices

1. “feat: aspect ratios and typography controls”  
2. “feat: pretext-based quote fit and layout suggestions”
