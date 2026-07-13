# Phase 4 — Templates, themes & deep linking

**Goal:** Fast starts via templates; site themes; partner sites can open the editor with quote + author prefilled.

**Depends on:** Phases 1–3 (composition model stable)  
**Unblocks:** marketing polish and external integrations

---

## Scope

### Quote templates
- [ ] Define `Template` type: preset background (gallery id or solid), typography, colors, alignment, aspect ratio, optional sample text.
- [ ] Ship ≥ 3 templates (e.g. “Editorial serif”, “Bold sans”, “Minimal navy”).
- [ ] Template gallery on `/create` (and optional section on landing).
- [ ] Applying a template merges into current document; confirm if user has unsaved customizations (optional).
- [ ] Templates must not require network beyond local assets.

### Site themes
- [ ] Theme tokens for **site chrome** (not necessarily the quote canvas):
  - **Light** (default): DESIGN.md monochrome + pastels.
  - **Dark**: inverse canvas / ink with adjusted hairlines and surfaces.
  - **2–3 popular color schemes** (e.g. accent packs or tinted shells — pick concrete names during implementation: mint, lilac, navy, etc. from DESIGN.md block palette).
- [ ] Persist preference in `localStorage` + `data-theme` on `<html>`.
- [ ] Theme picker in header (not only binary toggle).
- [ ] Optional: respect `prefers-color-scheme` for first visit only (document decision).
- [ ] Ensure contrast for inputs/buttons per theme.

### Deep linking / embed API
Partner flow: external site → button → Hmmm with fields filled.

- [ ] Supported query params on `/create` (**v1 only these two**):
  - `q` — quote text
  - `author` — author name
- [ ] Parsing:
  - Standard `decodeURIComponent` for UTF-8.
  - Reject / soft-fail on malformed encoding.
  - Apply hard 300-word cap after decode (trim or reject with message).
- [ ] Document practical URL length limits; show toast if empty/truncated by browser.
- [ ] Security: treat all params as untrusted text (no HTML injection in preview — text content only).
- [ ] Public mini-docs: README section **“Integrating with Hmmm”** with example:

```html
<a href="https://hmmm.example/create?q=Stay%20hungry&author=Steve%20Jobs">
  Frame this quote
</a>
```

- [ ] Optional: copy-share-link button that serializes current `q` + `author` into a URL.
- [ ] Deferred: `template`, `layout`, base64 variants.

### Landing polish
- [ ] Color-block storytelling section explaining the tool (DESIGN.md rhythm).
- [ ] CTA pair: primary “Create” + secondary “Browse templates” if applicable.

---

## Out of scope

- OAuth / signed partner tokens.
- Server-side shortening service for huge quotes (client workarounds only unless we revisit no-DB).
- User-generated public template marketplace.

---

## Acceptance criteria

1. One click on a template yields a complete, exportable composition.
2. Theme picker switches light / dark / color schemes; refresh keeps preference.
3. Visiting `/create?q=Hello%20world&author=Test` opens editor with fields filled and preview updated.
4. Special characters (`&`, `#`, emoji, non-Latin) round-trip via proper encoding.
5. XSS-safe: injecting markup in `q` does not execute as HTML.

---

## Suggested PR / commit slices

1. “feat: quote templates”  
2. “feat: site themes”  
3. “feat: create deep-link query API + docs”
