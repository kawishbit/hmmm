# Phase 7 — Integration & e2e tests

**Goal:** Catch breakage across build output, routes, and critical user flows in a real browser — not every click path.

**Depends on:** Phase 6  
**Status:** Complete

---

## Integration (no browser)

- Production `bun run build` succeeds.
- `dist/` contains `/`, `/create`, `404`, PWA `sw.js` + manifest, backgrounds, icons.
- Static HTML for `/create` is a real editor page (not a bare redirect that drops query params).

Runner: `bun run test:integration` (builds first).

---

## E2E (Playwright)

Minimal flows that encode product contracts:

1. **Editor boots** — leaves loading state; shows quote controls.
2. **Live preview** — changing quote updates canvas text.
3. **Deep link** — `/create?q=…&author=…` prefills fields.
4. **Layout switch** — changing aspect ratio updates UI chrome (e.g. ratio label).

Out of scope for v1 e2e: full PNG binary assert, PWA install UI, every theme/template.

Runner: `bun run test:e2e` (build + Playwright against `astro preview`).

---

## Acceptance criteria

1. `bun run test:integration` green after a clean build.
2. `bun run test:e2e` green locally (and in CI if configured).
3. E2E suite stays small (≤ ~5 specs) and stable.
