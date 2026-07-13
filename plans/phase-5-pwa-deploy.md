# Phase 5 — PWA, offline & launch

**Goal:** Installable Progressive Web App with offline support for core flows; production deploy on Vercel; launch checklist.

**Depends on:** Phases 0–1 minimum for offline shell; full product value needs 2–4  
**Unblocks:** public launch

---

## Scope

### PWA
- [ ] Integrate `@vite-pwa/astro` (or equivalent) with Workbox.
- [ ] Complete `site.webmanifest`: name **Hmmm**, short_name, theme/background colors from design tokens, `display: standalone`, icons 192 + 512.
- [ ] Generate real icons (maskable + any-purpose); replace Phase 0 stubs.
- [ ] `apple-touch-icon` and basic iOS meta tags.
- [ ] Install prompt UX: optional subtle banner (don’t be annoying).

### Offline strategy
- [ ] Precache: app shell, CSS/JS, fonts, `/`, `/create`, core icons.
- [ ] Precache a **subset** of gallery backgrounds (or all if small).
- [ ] Runtime caching: other static assets (CacheFirst / StaleWhileRevalidate as appropriate).
- [ ] Offline behavior:
  - Editor usable offline with cached assets.
  - User uploads still work (local files).
  - Clear offline indicator if navigation fails for uncached routes.
- [ ] No background sync / push required for v1.

### Performance & polish
- [ ] Lighthouse PWA + performance pass on `/` and `/create` (aim ≥ 90 performance on desktop mid-tier).
- [ ] Lazy-load editor island where possible; keep landing light.
- [ ] Image dimensions / modern formats for gallery (WebP + fallback if needed).
- [ ] Empty/error/loading states for all async UI.
- [ ] Keyboard accessibility pass on editor controls.
- [ ] 404 page on-brand.

### Deploy
- [ ] Vercel project connected; production domain TBD.
- [ ] Build: `bun run build`, output `dist`, Node version pinned.
- [ ] Preview deployments on PRs (if GH integration).
- [ ] Smoke test production: create → style → export → install PWA.

### Launch docs
- [ ] README: setup, scripts, deep-link API summary, phase status complete.
- [ ] Optional: short CHANGELOG or release notes for v1.0.0.

---

## Out of scope

- Push notifications.
- Analytics backend (privacy-friendly analytics optional later).
- Multi-language UI chrome (quotes are multilingual; UI can stay English for v1).

---

## Acceptance criteria

1. App installable on mobile Chrome/Safari (Add to Home Screen) with correct name/icon.
2. Airplane mode: shell + editor load; can export using cached gallery or local upload.
3. Production URL serves HTTPS static assets with correct cache headers for hashed files.
4. No login, no database, no server-side image storage.

---

## Launch checklist

- [ ] All Phase 1–4 acceptance criteria met (or explicitly deferred with reason).
- [ ] Open questions resolved or parked with owners.
- [ ] License and background credits present.
- [ ] Smoke test on iOS Safari, Android Chrome, desktop Chrome/Firefox.
- [ ] Tag `v1.0.0`.

---

## Suggested PR / commit slices

1. “feat: PWA manifest, icons, and service worker”  
2. “chore: production deploy config and launch polish”
