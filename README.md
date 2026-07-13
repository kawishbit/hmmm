# Hmmm

Full-screen quote image maker — type a quote, pick a layout, download a PNG. No account.

## Stack

- **Astro** (static) + **Vue** island (`client:only`)
- **Tailwind CSS** v4
- **TypeScript**
- **Bun** (package manager / scripts)
- **Node** ≥ 22.12 (runtime)
- **Vercel** (deploy)
- Tokens from [DESIGN.md](./DESIGN.md)

## Status

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Scaffold, tokens | **Complete** |
| 1 | Tool shell, editor, layout picker, PNG | **Complete** |
| 2 | Backgrounds, blur, filters, upload | **Complete** |
| 2.5 | Pretext auto-fit + per-layout text budgets | Planned — [plans/phase-2.5-pretext-fit.md](./plans/phase-2.5-pretext-fit.md) |
| 3 | Typography controls (uses 2.5 fitter) | Next |
| 4 | Templates, themes, deep links | Planned |
| 5 | PWA, offline, launch | Planned |

Full plan: [plans/PLAN.md](./plans/PLAN.md)

## Setup

```bash
bun install
bun run dev
```

Open the URL Astro prints (usually `http://localhost:4321`). You land **directly in the workspace**.

## UX model

Excalidraw-style tool (not a blog/landing site):

| Region | Role |
|--------|------|
| **Top toolbar** | Logo, aspect-ratio picker, help, download |
| **Left panel** | **Content** (quote, translation, author) · **Background** (gallery, upload, blur, filters) |
| **Center stage** | Live quote frame on a dot-grid canvas |

How-to popup on first visit; reopen with **?**.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server |
| `bun run build` | Production static build → `dist/` |
| `bun run preview` | Preview production build |
| `bun run check` | Astro + TypeScript checks |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |

## Routes

| Path | Page |
|------|------|
| `/` | Full-screen editor |
| `/create` | Redirects to `/` |

## Project layout

```
src/
  components/
    editor/       # QuoteEditor, QuotePreview, BackgroundPanel, LayoutPicker, HowToModal
    ui/           # Button, Input, Textarea, Card
  layouts/
    BaseLayout.astro   # minimal full-viewport shell
  lib/            # types, layouts, backgrounds, upload, export, words
  pages/
    index.astro
    create.astro
  styles/
    global.css
public/
  backgrounds/    # gallery SVGs + CREDITS
  icons/
  site.webmanifest
plans/
```

## Constraints

- No login / authentication
- No database (client-side only)
- Hard cap: **300 words** per quote
- Partner deep links (Phase 4): `/create?q=&author=` → will land on `/` with prefill

## Deploy

Static output. See `vercel.json`. Build: `bun run build`, output `dist`.

## License

See [LICENSE](./LICENSE).
