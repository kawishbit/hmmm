# Phase 8 — Self-hosting

**Goal:** Document and ship three first-class ways to run Hmmm:

1. **Local** — install deps, dev or production build + preview  
2. **Vercel** — static deploy (existing)  
3. **Docker** — multi-stage image serving `dist/` with nginx  

**Depends on:** Phase 5 static build  
**Status:** Complete

---

## Scope

### Local
- [x] `bun install` / optional `npm`/`pnpm` notes  
- [x] `bun run dev` for development  
- [x] `bun run build` + `bun run preview` for production-like local  
- [x] Node ≥ 22.12 / Bun documented  

### Vercel
- [x] Keep `vercel.json` (build, `dist`, cache headers)  
- [x] README steps unchanged in spirit  

### Docker
- [x] Multi-stage `Dockerfile`: install → build → nginx serve  
- [x] `nginx.conf` for SPA-ish static + long-cache hashed assets + SW no-cache  
- [x] Optional `docker-compose.yml` for one-command up  
- [x] `.dockerignore`  

### Docs
- [x] README **Self-hosting** section with all three paths  

---

## Acceptance criteria

1. `docker build` produces an image that serves the app on port 80.  
2. Local and Vercel paths still work without Docker.  
3. README is enough to self-host without reading the codebase.
