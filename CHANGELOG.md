# Changelog

## 1.0.0 — 2026-07-13

First public release of **Hmmm** — a full-screen PWA for framing quotes as shareable PNGs.

### Quality & ops (phases 6–8)

- Unit tests for fit, budgets, deep links, templates, filters (Bun)
- Integration tests for production `dist/` contracts
- Playwright e2e for editor boot, preview, deep link, layout switch
- Docker + nginx self-host (`Dockerfile`, `docker-compose.yml`, `deploy/nginx.conf`)
- README self-hosting: local, Vercel, Docker

### Backgrounds (phase 9)

- Curated local photo packs (12 JPEGs) + pack filters in Bg tab
- Drag-and-drop upload with filename + remove
- Zero stock API / no paste-URL; credits in `public/backgrounds/CREDITS.md`
- Templates using photo backgrounds (paper, ocean, mountains)

### Features

- Excalidraw-style workspace: toolbar, side panel, live canvas
- Quote + optional translation (1300-character hard cap) + author (100-character hard cap)
- Layouts: 1:1, 4:5, 9:16, 16:9, 2:1
- Backgrounds: gallery, solids, gradients, local upload, blur, filters, scrim
- Typography: curated fonts, weight, max size, align, colors
- Pretext-based auto type fit per layout
- Templates (Tpl tab) and site themes (Light / Dark / Mint / Lilac / Navy)
- Deep links: `/create?q=&q2=&author=` (optional translation via `q2`) and shareable **Link** button
- PWA: installable, offline shell + cached backgrounds, update prompt

### Stack

Astro (static) · Vue islands · Tailwind v4 · TypeScript · Bun · Vercel

### Non-goals (v1)

No accounts, no database, no server-side image storage.
