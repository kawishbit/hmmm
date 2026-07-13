# Phase 2.5 — Pretext quote fit engine

**Goal:** Keep primary quote, optional translation, and author **readable and fully visible** inside every layout by auto-sizing type with [Cheng Lou’s Pretext](https://github.com/chenglou/pretext) — no silent overflow, no tiny unreadable text without reason.

**Depends on:** Phase 2 (stable canvas + multi-block text)  
**Unblocks:** Phase 3 typography chrome (manual size becomes “prefer / max”; fonts still feed the same fitter)  
**Status:** Complete

---

## Thoughts (feasibility)

### What Pretext actually does

Pretext is a **measure/layout** library, not a “font-size solver” out of the box:

1. `prepare(text, font, options?)` — one-time segment + measure (canvas font engine as ground truth).
2. `layout(prepared, maxWidth, lineHeight)` → `{ height, lineCount }` — pure arithmetic, no DOM reflow.

So your mental model is almost right, with one extra step:

> **We** define max width / max height per block per layout.  
> **Pretext** tells us whether a candidate `fontSize` fits.  
> **We** binary-search `fontSize` (and derived `lineHeight`) until height ≤ budget.

That pattern is well-suited to Hmmm: short-lived hot path on text/layout change, export and preview share the same numbers.

### Why it fits this product

| Current pain | Pretext-shaped fix |
|--------------|--------------------|
| Fixed design size scaled only by frame scale | Content-aware size per quote length |
| Long quotes overflow or look cramped | Shrink within min/max until fits |
| Translation optional | Secondary block budget only when non-empty |
| 5 aspect ratios | Different width/height budgets per layout |
| Multilingual quotes (Arabic, CJK, mixed) | Pretext targets i18n segmentation; better than naive `measureText` loops |

### What Pretext does *not* do alone

- It does **not** return “the font size for this box.” We implement **binary search** (or golden section) over size.
- `system-ui` is unreliable for accuracy on some browsers — use **named fonts** (we already use Inter Variable → pass `"…px Inter"` / full canvas font string matching CSS).
- Font string + `letterSpacing` + `lineHeight` must **match** what we paint in the preview/export, or measure ≠ render.
- Empty secondary: skip measure entirely (already “no space when empty”).
- Author line: either fixed small size + reserved height, or include in the stack budget (recommended: **reserve** author strip).

### Feasibility verdict

**Yes — feasible and worth doing now.**  
Ship as **Phase 2.5** (focused fit engine) rather than burying it only inside full Phase 3 chrome. Phase 3 then adds font picker / colors / align on top of a working fitter.

Fallback if Pretext integration fails a spike: same binary-search API with `canvas.measureText` + simple wrap — keep the same budgets so UI doesn’t fork.

---

## Design model

### Coordinate space

Do all fit math in **export pixel space** (e.g. short side = 1080), then scale fonts to the on-screen frame the same way we do today (`displayShort / 1080`).

That way preview and PNG agree.

### Text stack (top → bottom, centered or aligned as a group)

```
┌─────────────────────────────────────┐
│ padding (layout.inset)              │
│ ┌─────────────────────────────────┐ │
│ │  PRIMARY quote                  │ │  max height H1 (or flex share)
│ │  (auto font size)               │ │
│ └─────────────────────────────────┘ │
│ gap g1 (only if secondary present)  │
│ ┌─────────────────────────────────┐ │
│ │  SECONDARY / translation        │ │  max height H2 (0 if empty)
│ │  (smaller; auto font size)      │ │
│ └─────────────────────────────────┘ │
│ gap g2 (only if author present)     │
│ ┌─────────────────────────────────┐ │
│ │  — Author                       │ │  fixed or mild auto size
│ └─────────────────────────────────┘ │
│ padding                             │
└─────────────────────────────────────┘
```

When secondary is empty: **H2 = 0**, **g1 = 0** — stack collapses (current product rule).

### Per-layout content box

For each `AspectRatioKey`, compute from export dimensions:

| Token | Meaning |
|-------|---------|
| `frameW`, `frameH` | Export size for layout |
| `inset` | Outer padding (% or px of short side) |
| `contentW` | `frameW - 2 * inset` — **maxWidth** for Pretext |
| `contentH` | `frameH - 2 * inset` — total vertical budget for stack |
| `authorReserve` | Fixed strip for author (0 if no author) |
| `gapPrimarySecondary` | Gap when secondary non-empty |
| `gapToAuthor` | Gap when author non-empty |

Remaining for quotes:

```
quotesBudget = contentH - authorReserve - gaps
```

Split between primary and secondary:

**Proposal A — fixed ratios (simpler, ship first)**  
When secondary present:

- `H1 = quotesBudget * 0.62`
- `H2 = quotesBudget * 0.38`

When secondary empty:

- `H1 = quotesBudget`
- `H2 = 0`

**Proposal B — priority primary (better for short translation)**  
Fit primary first with `H1_max = quotesBudget * 0.75` (cap), then give leftover to secondary (min floor if secondary non-empty). More code; consider after A.

**Recommendation:** Ship **Proposal A** with tunable constants in `src/lib/text-budgets.ts`.

### Suggested starting budgets (export space, short side 1080)

Tune after visual QA — not final brand specs.

| Layout | inset (of min side) | H1 share | H2 share | notes |
|--------|---------------------|----------|----------|--------|
| `1:1` | 10% | 62% | 38% | balanced square |
| `4:5` | 9% | 64% | 36% | slightly more primary |
| `9:16` | 9% | 60% | 40% | tall; room for both |
| `16:9` | 8% | 58% | 42% | short height — aggressive shrink |
| `2:1` | 8% | 55% | 45% | widest / shortest quotes |

Author reserve: ~`max(28, 0.035 * frameH)` px in export space when author non-empty.

Primary font size bounds (export px): **min 22 / max 72** (defaults).  
Secondary: **min 14 / max = primary * SECONDARY_FONT_SCALE (0.55)** after primary is chosen, or independent max **40** with scale cap — pick one:

**Recommendation:** Fit primary first (within H1). Then fit secondary with:

- `maxSecondary = min(primarySize * 0.55, 40)`
- `minSecondary = 14`
- height budget H2

So translation always reads as subordinate type.

Line height: **1.3 × fontSize** for primary, **1.35 ×** for secondary (match CSS we apply).

---

## Fit algorithm

### Core helper (pure, unit-testable)

```ts
// Pseudocode
function fitFontSize(args: {
  text: string
  fontFamily: string // e.g. 'Inter'
  fontWeight: string | number
  maxWidth: number
  maxHeight: number
  minSize: number
  maxSize: number
  lineHeightRatio: number
  letterSpacing?: number
  whiteSpace?: 'normal' | 'pre-wrap'
}): { fontSize: number; height: number; lineCount: number; fits: boolean }
```

Implementation:

1. If `!text.trim()` → return zeros / N/A.
2. Binary search integer sizes in `[minSize, maxSize]`.
3. For mid size `s`:
   - `font = `${weight} ${s}px ${fontFamily}``
   - `prepared = prepare(text, font, { whiteSpace: 'pre-wrap', letterSpacing })`  
     *(cache prepare by text+font key; invalidate on text change)*
   - `lh = s * lineHeightRatio`
   - `{ height, lineCount } = layout(prepared, maxWidth, lh)`
4. If `height <= maxHeight`, try larger; else smaller.
5. Return largest size that fits; if none, return `minSize` with `fits: false`.

### Stack fit for a document

```ts
function fitQuoteStack(doc, layoutKey): FittedType {
  const box = contentBoxForLayout(layoutKey) // export px
  const hasSecondary = !!doc.textSecondary.trim()
  const hasAuthor = !!doc.author.trim()
  // budgets H1, H2, authorReserve, contentW …

  const primary = fitFontSize({ text: doc.text, maxWidth: contentW, maxHeight: H1, … })
  const secondary = hasSecondary
    ? fitFontSize({
        text: doc.textSecondary,
        maxWidth: contentW,
        maxHeight: H2,
        maxSize: Math.min(primary.fontSize * 0.55, 40),
        …
      })
    : null
  const authorSize = clamp(primary.fontSize * 0.38, 16, 28) // or fixed

  return { primary, secondary, authorSize, contentW, flags }
}
```

### When it still doesn’t fit (`fits: false` at min size)

Hard product rules (aligned with earlier decisions):

1. **Never silent truncate** by default.
2. Still paint at **minSize** (may overflow visually if we allow — better avoid).
3. Prefer: keep minSize and show UI banner:  
   - “Quote is very long for this layout — try **9:16** or shorten text.”
4. Optional later: layout suggestion scoring (Phase 3 remainder).

With 300-word hard cap + min size ~22 on 1:1, most Latin quotes should fit; stress-test long CJK.

### Debouncing

- Recompute on: text, secondary, author, aspect ratio, font family (Phase 3).
- Debounce typing ~50–100ms; **immediate** on layout change.
- Cache last `prepare` handles.

---

## Integration with current Hmmm code

| Area | Change |
|------|--------|
| `src/lib/text-budgets.ts` | Per-layout inset, shares, reserves |
| `src/lib/pretext-fit.ts` | Binary search + stack fit; wrap Pretext |
| `src/lib/layouts.ts` | Optionally attach budget keys to `LayoutSpec` |
| `QuotePreview.vue` | Use fitted sizes (export → display scale) instead of fixed `style.fontSizePx * scale` only |
| `QuoteEditor.vue` | Compute fit when `doc` / layout changes; pass fitted metrics into preview |
| `types.ts` | Keep `style.fontSizePx` as **preferred/max** user size (Phase 3 slider); fitted size = `min(preferred, fitted)` |
| Dependency | `bun add @chenglou/pretext` |

### Preferred vs auto size

Today `style.fontSizePx` is the only size. After 2.5:

- `style.fontSizePx` = **maximum** (user preference once Phase 3 slider exists; default 52).
- Display size = `min(style.fontSizePx, fitted.primary.fontSize)`.

Short quotes stay large; long quotes shrink automatically.

### Export

No special Pretext path for PNG: preview DOM already uses fitted CSS sizes; `html-to-image` captures that.  
Ensure fit is computed in export space then scaled — **not** re-fit differently at display size (would desync).

---

## UI (minimal for 2.5)

- No heavy new chrome required.
- Optional footer chip or panel meta:  
  `Auto size 48→31px` when shrunk.
- Soft warning when `fits === false` at min size.
- How-to modal: one line — “Long quotes shrink to fit; translation stays smaller.”

Phase 3 still owns: font family picker, colors, align, drag position, layout suggestions UX polish.

---

## Testing plan

Unit tests (no Vue) for `fitFontSize` / `fitQuoteStack` with fixtures:

| Fixture | Expect |
|---------|--------|
| Short English | Near max size |
| ~100 words English | Mid shrink |
| ~300 words English | Near min or warning |
| Empty secondary | H2 unused; primary uses full quotes budget |
| Short primary + long secondary | Secondary hits min first / warning |
| CJK sample | Completes without throw; size in range |
| Arabic sample | Completes; dir handled at render (Phase 3 font) |

Visual QA checklist per layout: 1:1, 4:5, 9:16, 16:9, 2:1 × {short, medium, long} × {with/without translation}.

---

## Spike (½ day, before full implement)

1. Install `@chenglou/pretext`.
2. In isolation, measure a 50-word string at width 800, sizes 20–60; confirm height monotonic.
3. Compare Pretext height vs a DOM mirror for Inter at 2–3 sizes (sanity, not pixel-perfect).
4. Confirm `prepare` font string matches our CSS (`500 32px "Inter Variable", Inter` — verify Inter Variable canvas name).
5. Go / no-go: if canvas font name mismatches Variable font, pin to `Inter` loaded face or adjust font stack for measure.

---

## Scope boundaries

### In (2.5)

- [x] Per-layout content box + H1/H2/author budgets (`text-budgets.ts`)  
- [x] Pretext-based binary-search font fit for primary + secondary (`pretext-fit.ts`)  
- [x] Preferred max size clamp (`style.fontSizePx`)  
- [x] Collapse secondary when empty  
- [x] Soft overflow warning in Content panel  
- [x] Unit tests (`bun test`) with approximate measure for CI  
- [x] Docs / How-to blurb  
- [ ] Full visual QA matrix (manual)

### Out (leave for Phase 3+)

- Full font library / Arabic-optimized fonts  
- Manual line-height / letter-spacing controls  
- Drag position / free layout  
- Smart “switch to 9:16” suggestion engine (optional light version ok if cheap)  
- User-approved truncation  
- pretext canvas rendering instead of DOM (not needed for html-to-image path)

---

## Acceptance criteria

1. Changing layout recomputes sizes; text remains inside the frame padding for fixture quotes (short → long).
2. Empty translation leaves no gap and gives primary the full quote budget.
3. Translation uses smaller type than primary when both present.
4. Preview and exported PNG use the same relative type scale (export-space fit).
5. At min size with still-too-long text, user sees a clear warning — no silent ellipsis.
6. Typing remains responsive (debounced prepare/layout).

---

## Effort estimate

| Slice | Time |
|-------|------|
| Spike + font string validation | 0.5 d |
| Budgets + fit helpers + tests | 1 d |
| Wire editor/preview + warning UI | 0.5–1 d |
| Visual QA / tune constants | 0.5 d |
| **Total** | **~2.5–3 days** |

---

## Relation to Phase 3

| Phase 2.5 | Phase 3 |
|-----------|---------|
| Auto fit engine | Manual typography controls |
| Layout text budgets | More position/align UX |
| Preferred size as max | Size slider drives preferred max |
| Soft layout warning | Richer “try this layout” suggestions |

Update `phase-3-typography-layout.md` so the pretext checklist points here as **done in 2.5**, and Phase 3 consumes fitted sizes.

---

## Open decisions (resolve during spike or implement)

1. **Proposal A vs B** for H1/H2 split (recommend A).  
2. Secondary max = `0.55 * primary` only, or also absolute max 40.  
3. Author: fixed export size vs proportional.  
4. Overflow at min: allow slight overflow vs force layout change vs block export (recommend warn, allow export at min).  
5. Exact canvas `font` string for Inter Variable on Safari/Chrome.

---

## Suggested commits

1. `chore: add @chenglou/pretext and fit spike notes`  
2. `feat: per-layout text budgets and pretext font fitter`  
3. `feat: wire auto type size into quote preview + overflow warning`
