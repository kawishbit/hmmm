# Hmmm — Build Plan

> **Product:** A PWA for framing quotes as shareable images — background + text overlay, all client-side.  
> **Sources:** [INITIAL_PROMPT.md](../INITIAL_PROMPT.md), [DESIGN.md](../DESIGN.md)  
> **Status:** Phase 0–9 complete

---

## Product summary

**Hmmm** lets anyone turn a quote into a polished image:

1. Enter quote text and author (or arrive via deep-link query params).
2. Choose layout aspect ratio (1:1, 16:9, 4:5, …).
3. Pick or upload a background; optionally blur / filter it.
4. Style type (font, color, size), position, and alignment.
5. Optionally start from a template.
6. Export a PNG (and later share / install as PWA).

**Non-goals (v1):** login, accounts, database, server-side image storage, social auth.

---

## Tech stack (locked)

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | Astro (static) | Content/marketing pages + islands |
| Interactivity | Vue 3 islands | Editor is a client island |
| Styling | Tailwind CSS v4 | Design tokens mapped from DESIGN.md |
| Language | TypeScript (strict) | Shared types in `src/lib` |
| Package manager | Bun | Scripts + install |
| Runtime | Node ≥ 22.12 | Astro/Vercel ecosystem |
| Deploy | Vercel (static) | `output: 'static'` |
| PWA | `@vite-pwa/astro` or Workbox | SW + offline shell |
| Text fit (optional) | [pretext](https://github.com/chenglou/pretext) | Measure / layout decisions without naive truncation |
| Export | Canvas / `html-to-image` | Client-side PNG |

---

## Design system

Implement **tool chrome** using tokens from [DESIGN.md](../DESIGN.md) — not a marketing/blog layout:

- **App shell (shipped):** Excalidraw-like full viewport — top toolbar, left properties panel, center canvas stage (dot grid). No landing page; `/` is the editor.
- Monochrome core (black primary, white chrome) + pastel only for accent panels (e.g. how-to modal).
- Pills for primary CTAs; tool chips for layout picker; hairline borders; shadow-light on the quote frame.
- Open-source substitutes: **Inter** (sans), **JetBrains Mono** (mono).
- Themes (Phase 4): **light** (default), **dark**, and **2–3 color schemes** for tool chrome. Quote canvas styles stay independent.

---

## Architecture (high level)

```
┌──────────────────────────────────────────────────────────────┐
│  /  → full-viewport Vue QuoteEditor (client:only)            │
│  /create → redirect to /                                     │
├──────────────────────────────────────────────────────────────┤
│ Top toolbar: logo · layout picker · help · download          │
├──────────────┬───────────────────────────────────────────────┤
│ Left panel   │  Canvas stage (dot grid)                      │
│ quote/author │  ┌─────────────────────┐                      │
│ (+ future    │  │  Quote frame        │  sized via           │
│  style/bg)   │  │  (aspect + fit)     │  ResizeObserver      │
│              │  └──────────┬──────────┘                      │
└──────────────┴─────────────┼─────────────────────────────────┘
                             │ html-to-image → PNG
         ▲ deep-link (?q=&author=)     ▲ localStorage howto
         │                             │
    partner sites                 no backend / no DB
```

**State:** Single client store (Vue reactive) for editor document.  
**Persistence:** How-to seen flag in `localStorage`; optional draft later.  
**Images:** Gallery in `public/backgrounds/`; uploads stay in-memory / object URLs.

---

## Phases overview

| Phase | File | Goal | Outcome |
|-------|------|------|---------|
| **0** | [phase-0-foundation.md](./phase-0-foundation.md) | Scaffold, tokens, layout shell, CI hygiene | **Done** — runnable shell |
| **1** | [phase-1-core-editor.md](./phase-1-core-editor.md) | Quote + author, live preview, basic type, PNG export | **Done** — MVP type → export |
| **2** | [phase-2-backgrounds.md](./phase-2-backgrounds.md) | Gallery, upload, blur, filters | **Done** — Background tab |
| **2.5** | [phase-2.5-pretext-fit.md](./phase-2.5-pretext-fit.md) | Pretext auto type size + per-layout max heights (primary / translation) | **Done** — auto-fit engine |
| **3** | [phase-3-typography-layout.md](./phase-3-typography-layout.md) | Fonts, position, alignment; consumes 2.5 fitter | **Done** — Type tab + layout suggestions |
| **4** | [phase-4-templates-themes-deeplink.md](./phase-4-templates-themes-deeplink.md) | Templates, site themes, URL prefill API | **Done** — Tpl tab, themes, deep links |
| **5** | [phase-5-pwa-deploy.md](./phase-5-pwa-deploy.md) | Service worker, offline, polish, launch | **Done** — v1.0.0 PWA |
| **6** | [phase-6-unit-tests.md](./phase-6-unit-tests.md) | Meaningful unit tests only | **Done** |
| **7** | [phase-7-integration-e2e.md](./phase-7-integration-e2e.md) | Build integration + Playwright e2e | **Done** |
| **8** | [phase-8-self-hosting.md](./phase-8-self-hosting.md) | Local / Vercel / Docker self-host | **Done** |
| **9** | [phase-9-curated-backgrounds.md](./phase-9-curated-backgrounds.md) | Local photo packs + upload polish (no API) | **Done** |

Phases 0→5 are product; 6–7 are quality; 8 is ops; 9 extends backgrounds with a stock API.

---

## Cross-cutting requirements

### Word / length policy
- **Hard cap: 300 words** — block further input and/or export when over the limit.
- Script-aware counting for CJK/Arabic (document formula in Phase 3); Latin = whitespace-separated tokens.
- Within the cap, prefer **no truncation**; use layout + font size + aspect ratio to fit (pretext-informed).
- If still overflowing inside the cap: suggest alternate layouts / smaller type; optional user-approved ellipsis as last resort.

### Deep linking (partner sites)
- Prefill via query string: **`/create?q=...&author=...`** only for v1.
- Encode text safely (UTF-8 + percent-encoding).
- Document max practical URL length; richer params / base64 deferred.

### Privacy & constraints
- No auth, no DB, no uploaded image retention on a server.
- All processing client-side.

### Accessibility
- Form labels, keyboard controls, contrast on UI chrome.
- Export is a visual artifact — not expected to be screen-reader “document,” but controls must be.

---

## Suggested repo layout (target)

```
src/
  components/
    editor/          # QuoteEditor, QuotePreview, control panels
    ui/              # Button, Input, Textarea, Card, Slider, …
    layout/          # Header, Footer, AppShell
  layouts/
    BaseLayout.astro
  lib/
    types.ts
    layouts.ts       # aspect ratios
    export.ts        # canvas export
    words.ts         # word count / script-aware limits
    pretext-fit.ts   # Phase 3
    deeplink.ts      # Phase 4
    templates.ts     # Phase 4
  pages/
    index.astro
    create.astro
  styles/
    global.css       # tokens + fonts
public/
  backgrounds/       # curated gallery
  icons/
  site.webmanifest
plans/               # this folder
DESIGN.md
```

---

## Success criteria (v1 launch)

- [ ] Create a quote image end-to-end in under a minute without reading docs.
- [ ] Export crisp PNG at chosen aspect ratio.
- [ ] Background gallery + own upload + blur + at least 3 filters.
- [ ] Text styling (font family set, color, size, align, position).
- [ ] Hard 300-word cap enforced; fit strategy prefers full text (within cap) over silent truncation.
- [ ] At least 3 templates.
- [ ] Site themes: light, dark, and 2–3 color schemes.
- [ ] Deep link: `/create?q=Hello&author=World` pre-fills editor.
- [ ] Installable PWA with offline shell for `/` and `/create` (cached UI; offline gallery subset).
- [ ] Deployed on Vercel from `main`.

---

## Open questions

See [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md). Decisions there unblock Phase 2–4 details.

---

## How to use this plan

1. Resolve open questions (interview).
2. Implement **Phase 0**, then **1**, etc. Treat each phase doc as the acceptance checklist for that PR / milestone.
3. Keep this `PLAN.md` status line updated as phases complete.
