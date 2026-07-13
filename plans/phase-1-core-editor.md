# Phase 1 — Core editor (MVP)

**Goal:** Type a quote + author, see a live preview, export a PNG. Minimal styling defaults.

**Depends on:** Phase 0  
**Unblocks:** Phases 2–3 (compose on top of the same state model)

---

## Scope

### Editor document model
- [x] Define `QuoteDocument` (or equivalent) in `src/lib/types.ts`:
  - `text: string`
  - `author: string`
  - `aspectRatio` (default `1:1` — full set in Phase 3)
  - placeholder fields for bg / style used later (optional stubs)
- [x] Vue island `QuoteEditor` mounted on `/` (`client:only`).
- [x] Reactive state; controls re-render preview immediately.

### Tool shell (Excalidraw-like)
- [x] Full-viewport layout: top toolbar + left content panel + center canvas stage.
- [x] Dot-grid stage background; no marketing homepage.
- [x] First-visit how-to modal (+ re-open from toolbar).

### Controls
- [x] Quote textarea + author input in left panel.
- [x] **Layout picker** in top toolbar: 1:1, 4:5, 9:16, 16:9, 2:1.
- [x] Primary action: **Download PNG**.
- [x] Empty states: sensible sample quote or placeholder copy.
- [x] Hard 300-word cap with live count.

### Live preview
- [x] `QuotePreview` uses **explicit pixel width/height** fitted to the stage (`fitAspectRect` + ResizeObserver).
- [x] Default background: gradient (gallery/upload in Phase 2).
- [x] Quote text + author scaled from design font size to display size.
- [x] Export short side 1080px via pixelRatio.

### Export
- [x] Client-side rasterization (`html-to-image`, `modern-screenshot`, or canvas draw).
- [x] Filename like `hmmm-quote.png`.
- [x] Handle CORS-safe rendering (no external tainted canvases in this phase).

### Word count (basic)
- [x] Show live word count (space-delimited for Latin scripts).
- [x] **Hard cap at 300 words**: prevent typing/pasting beyond the limit (or block export with a clear error). Full script-aware counting in Phase 3.

---

## Out of scope

- Gallery, upload, blur, filters.
- Drag position, multi-font picker, multi-aspect UI.
- Templates, deep links, themes, PWA.

---

## Acceptance criteria

1. User can enter quote + author and see them on the preview within one paint cycle of input.
2. Download produces a PNG that matches the preview composition.
3. Works on desktop and mobile browsers (layout usable; controls stacked on small screens).
4. Still fully client-side; refresh loses state unless we add optional `localStorage` draft (nice-to-have).

---

## Technical notes

- Keep preview DOM structure simple and export-friendly (avoid complex CSS that rasterizers mishandle).
- Prefer one source of truth for layout metrics so Phase 3 can swap in pretext-based fitting without rewriting controls.
- Split presentational `QuotePreview` from control panels for testability.

---

## Suggested PR / commit slice

“feat: core quote editor with live preview and PNG export”.
