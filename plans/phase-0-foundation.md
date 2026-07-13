# Phase 0 — Foundation

**Goal:** A runnable Astro + Vue + Tailwind + TypeScript project with design tokens, shell layout, and deploy config — no real editor logic yet.

**Depends on:** nothing  
**Unblocks:** Phase 1

---

## Scope

### Scaffold
- [x] Initialize Astro project with TypeScript, Vue integration, Tailwind CSS v4.
- [x] Use **Bun** for install/scripts; document **Node ≥ 22.12** for runtime/CI if needed.
- [x] Enable `output: 'static'` for Vercel static hosting.
- [x] Add `vercel.json` (build command, output directory `dist`).
- [x] Biome (or ESLint + Prettier) for lint/format; `bun run check` for `astro check`.

### Design tokens
- [x] Map [DESIGN.md](../DESIGN.md) colors, spacing, radii, and type scale into CSS variables / Tailwind theme (`src/styles/global.css`).
- [x] Load open font substitutes: Inter/Geist (sans), JetBrains Mono/Geist Mono (mono).
- [x] Implement base components: `Button` (primary/secondary pill), `Input`, `Textarea`, `Card` — enough for later phases.
- [x] Do **not** invent mid-gray body text; hierarchy via weight per design system.

### App shell
- [x] `BaseLayout.astro` — meta, fonts, global CSS (full-viewport tool shell; no marketing chrome).
- [x] Routes:
  - `/` — editor (tool UI lives in Phase 1+ Vue island).
  - `/create` — permanent redirect to `/`.
- [x] Favicon + basic `public/icons/` stubs and `site.webmanifest` placeholder (full PWA in Phase 5).
- [x] **UX decision (post–Phase 1):** Excalidraw-like workspace — not a blog/landing layout.

### Docs & hygiene
- [x] Update [README.md](../README.md) with real setup commands once scaffold exists.
- [x] `.gitignore` for `node_modules`, `dist`, `.env`, etc.
- [ ] Optional: GitHub Action or simple checklist for `bun run build && bun run check`.

---

## Out of scope

- Quote editor logic, canvas, export.
- Backgrounds, templates, themes, SW offline.
- pretext integration.

---

## Acceptance criteria

1. `bun install && bun run dev` starts cleanly.
2. `bun run build` produces `dist/` with `/` and `/create`.
3. Landing matches design system spirit (white canvas, black pills, one pastel block).
4. No backend, no auth, no database.

---

## Suggested PR / commit slice

Single foundation PR: “chore: scaffold Astro Vue Tailwind design shell”.
