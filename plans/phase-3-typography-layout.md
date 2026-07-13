# Phase 3 — Typography, layout & fit

**Goal:** Full control of type and composition; aspect ratios; intelligent fit so long quotes prefer full text over silent truncation (pretext-informed).

**Depends on:** Phase 1–2.5  
**Unblocks:** Templates and deep-link quality (Phase 4)

**Status:** Complete

---

## Scope

### Aspect ratios / layouts
- [x] Support common ratios (toolbar picker shipped early with tool shell):
  - `1:1`, `4:5`, `9:16`, `16:9`, `2:1`
- [x] Layout picker UI in top toolbar
- [x] Preview frame and export resolution follow selected ratio (export short side 1080)

### Typography controls
- [x] Font family picker — Inter, DM Sans, Libre Baskerville, Playfair Display, Georgia, Noto Sans Arabic
- [x] Color picker for quote + author (presets + native color input)
- [x] Max size slider (preferred max; auto-fit never exceeds)
- [x] Weight chips per font
- [x] Line-height / letter-spacing stay design defaults (optional advanced later)

### Position & alignment
- [x] Text align: left / center / right
- [x] Vertical alignment: top / middle / bottom
- [x] Padding via per-layout text budgets (Phase 2.5)
- [x] Author below quote with em-dash convention

### Multilingual & 300-unit policy
- [x] Latin: whitespace words
- [x] CJK-heavy text: character budget
- [x] Arabic / mixed: RTL detection + Noto Sans Arabic; dir on text block
- [x] Hard cap 300 units; clamp on input
- [x] No silent truncation; full text preferred via auto-fit

### pretext / fit engine
- [x] Owned by [phase-2.5-pretext-fit.md](./phase-2.5-pretext-fit.md)
- [x] Manual size slider = preferred max; fitted = `min(preferred, autoFit)`
- [x] Layout suggestions when overflow (“Switch to 9:16”) via `layout-suggest.ts`

---

## Key files

| Path | Role |
|------|------|
| `src/lib/fonts.ts` | Font catalog + color presets |
| `src/lib/words.ts` | Script-aware count / clamp / dir |
| `src/lib/layout-suggest.ts` | Alternate layout ranking |
| `src/components/editor/TypographyPanel.vue` | Type tab UI |
| `src/components/editor/QuotePreview.vue` | Weight, dir, colors |
| `src/styles/global.css` | Fontsource imports |

---

## Acceptance criteria

1. [x] Aspect ratios export at correct dimensions
2. [x] Font, color, size, alignment, vertical position change preview (+ PNG)
3. [x] ≤300 units compose with auto-fit; over-cap blocked
4. [x] Overflow shows warning + switch layout chips
5. [x] Arabic sample can use Noto Arabic + RTL dir

---

## Out of scope (still)

- Drag free-position
- User-uploaded fonts
- Advanced letter-spacing / line-height sliders
