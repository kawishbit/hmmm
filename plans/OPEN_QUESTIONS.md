# Open questions — Hmmm

Answers here should be reflected back into phase docs and [PLAN.md](./PLAN.md).

---

## Product & UX

### Q1. Site visual identity — RESOLVED
**Decision:** Follow DESIGN.md. Default **light** mode; also ship **dark** mode and **2–3 popular color schemes** (site chrome themes in Phase 4). Old Verge-style README is obsolete.

### Q2. Default export format & size
- PNG only for v1, or also WebP / JPEG / copy-to-clipboard?
- Target long-edge resolution (1080 vs 1920 vs 2048)?

**Recommendation:** PNG only, 1080px short side (fast) with optional “High res” 1920 later.

### Q3. Background image source — RESOLVED
**Decision:** Static curated gallery only (~8–16 license-clear images). No stock API in v1.

### Q4. Text interaction model
- Drag free-position vs preset anchors (top/middle/bottom + align)?
- Scrim always on, auto, or user toggle?

**Recommendation:** Anchors + align for v1; optional drag in a follow-up. Auto light scrim when background is busy.

### Q5. Templates
- How opinionated? (full document replace vs style-only)
- Any brand-specific first templates?

---

## Multilingual & length

### Q6. “300 words” for non-English — PARTIALLY RESOLVED
**Decision:** **Hard cap at 300 words** — block input and/or export when over the limit.

**Still open:** Script-aware definition of “word” for CJK (character budget?) and Arabic. Propose in Phase 3: Latin = whitespace tokens; CJK ≈ characters/1.5 or fixed char budget documented in UI; mixed scripts use the stricter applicable rule.

### Q7. Font coverage
Must v1 ship fonts that cover Arabic / CJK, or is “best effort with system fallbacks” OK?

**Recommendation:** Latin-first curated fonts + system fallbacks for others in v1; document limitation.

### Q8. pretext commitment
Is Cheng Lou’s **pretext** a hard dependency, or “evaluate and use if it fits”?

**Recommendation:** Evaluate in Phase 3 spike (½ day); if awkward with canvas export, use canvas `measureText` + binary search font size with same UX.

---

## Integration

### Q9. Deep-link contract — RESOLVED
**Decision:** v1 docs and implementation: **`q` + `author` only** (`/create?q=...&author=...`). Optional `template` / `layout` / base64 deferred.

### Q10. Partner failure modes
If quote is huge / URL truncated: show error, open empty editor, or support `sessionStorage` handoff via `window.opener`?

**Recommendation:** Open editor with whatever decoded; toast if empty/truncated; opener handoff as future enhancement.

---

## Platform

### Q11. Offline gallery
Precache all backgrounds or a small default set?

**Recommendation:** Precache all if total &lt; ~5MB compressed; else default 4 + runtime cache.

### Q12. Analytics / telemetry
None, privacy-friendly (Plausible/etc.), or Vercel Analytics?

**Recommendation:** None for v1 unless you want usage signal.

### Q13. Domain & naming
Production hostname? Keep product name **Hmmm** everywhere?

---

## Decision log

| ID | Decision | Date | Notes |
|----|----------|------|-------|
| Q1 | **Light default (DESIGN.md) + dark + 2–3 color schemes** | 2026-07-13 | Ignore old Verge/dark-only README. Themes: light, dark, and 2–3 popular accent/color schemes (Phase 4). |
| Q3 | **Static curated gallery** | 2026-07-13 | ~8–16 license-clear images in `public/backgrounds/`. No stock API in v1. |
| Q6 | **Hard cap at 300 words** | 2026-07-13 | Block input/export when over limit; script-aware counting still needed for CJK/etc. |
| Q9 | **`q` + `author` only for v1** | 2026-07-13 | `/create?q=...&author=...`. template/layout/base64 later if partners need them. |
