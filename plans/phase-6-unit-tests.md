# Phase 6 — Unit tests (meaningful only)

**Goal:** Cover pure domain logic where bugs are costly or non-obvious. Skip trivial getters, simple UI wiring, and “does the array have items” checks.

**Depends on:** Phases 0–5 (stable `src/lib`)  
**Status:** Complete

---

## Principles

### Test
- Branchy logic (fit, clamp, deep-link clamp, template merge rules)
- Script-aware counting / RTL detection
- Layout budgets and suggestion ranking
- Background filter composition
- Theme id validation / storage keys (no DOM)

### Do **not** test
- Simple constant lists (“≥ 3 templates”)
- Presentational Vue components without logic
- One-line wrappers
- Framework plumbing

---

## Scope

| Module | Focus |
|--------|--------|
| `words.ts` | CJK vs words, clamp, RTL |
| `pretext-fit.ts` | Binary search fit, preferred-max, secondary scale, scale-to-display |
| `text-budgets.ts` | Per-layout content box + H1/H2 split |
| `deeplink.ts` | Parse/build, clamp, XSS-as-text |
| `templates.ts` | preserveText vs fillSample merge |
| `layout-suggest.ts` | Prefer non-overflow layouts |
| `backgrounds.ts` | `composeBackgroundFilter` (blur + preset) |
| `layouts.ts` | `exportDimensions` / `fitAspectRect` edge cases |
| `themes.ts` | `isSiteThemeId` / `themeById` fallback |

Runner: `bun test` (files co-located or under `tests/unit`).

---

## Acceptance criteria

1. `bun run test:unit` passes.
2. Failures point at real logic, not snapshot noise.
3. No tests that only assert “file exists” or “array length ≥ N” without behavior.
