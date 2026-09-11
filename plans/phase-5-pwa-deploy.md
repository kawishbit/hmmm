# Phase 5 — PWA, offline & launch

**Goal:** Installable Progressive Web App with offline support for core flows; production deploy on Vercel; launch checklist.

**Depends on:** Phases 0–4  
**Unblocks:** public launch

**Status:** Complete

---

## Scope

### PWA
- [x] `@vite-pwa/astro` + Workbox (`registerType: prompt`)
- [x] Manifest: name **Hmmm**, standalone, theme colors, icons any + maskable
- [x] Icons 192/512 (any + maskable) + apple-touch-icon
- [x] iOS meta tags
- [x] Subtle install prompt (`beforeinstallprompt`, dismissible)

### Offline strategy
- [x] Precache app shell + hashed assets + fonts + icons + gallery SVGs
- [x] Runtime: CacheFirst for fonts + `/backgrounds/*`
- [x] Offline banner + “Ready for offline use” toast
- [x] Update available → Reload
- [x] User uploads remain local (no network)

### Performance & polish
- [x] Static multipage: `/`, `/create`, `404`
- [x] Loading fallbacks for Vue islands
- [x] Cache headers in `vercel.json` for `_astro/*`, SW, icons, backgrounds
- [x] On-brand 404 page

### Deploy
- [x] `vercel.json` build/output/headers
- [x] Node pin via `engines` + `.nvmrc` (22)
- [x] Version `1.0.0` + [CHANGELOG.md](../CHANGELOG.md)

### Launch docs
- [x] README updated (PWA, status, integrate API)
- [x] CHANGELOG for v1.0.0

---

## Acceptance criteria

1. [x] Installable (manifest + icons + SW) — verify in browser after deploy
2. [x] Offline shell via Workbox precache (airplane mode after first visit)
3. [x] Cache headers for hashed static assets
4. [x] No login / DB / server storage

---

## Launch checklist

- [x] Phases 1–4 shipped
- [x] License + background CREDITS present
- [ ] Smoke test production install (manual after deploy)
- [ ] Tag `v1.0.0` (when ready to publish)

---

## Key files

| Path | Role |
|------|------|
| `astro.config.mjs` | `AstroPWA` + workbox |
| `src/pwa.ts` | `registerSW` |
| `src/components/pwa/*` | Offline + install UI |
| `public/icons/*` | PWA icons |
| `vercel.json` | Headers |
| `CHANGELOG.md` | v1.0.0 notes |
