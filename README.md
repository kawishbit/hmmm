# Hmmm

Full-screen quote image maker — type a quote, pick a layout, download a PNG. No account.  
**Installable PWA** with offline support for the editor shell and gallery.

## Stack

- **Astro** (static) + **Vue** islands (`client:only`)
- **Tailwind CSS** v4 · **TypeScript** · **Bun** · **Node** ≥ 22.12
- **Vercel** (static) or **Docker / nginx** (self-host)
- **PWA:** `@vite-pwa/astro` + Workbox
- Text fit: [@chenglou/pretext](https://github.com/chenglou/pretext)
- Tokens from [DESIGN.md](./DESIGN.md)

## Status

| Phase | Focus | Status |
|-------|--------|--------|
| 0–5 | Product + PWA | **Complete** |
| 6 | Unit tests (meaningful only) | **Complete** |
| 7 | Integration + e2e | **Complete** |
| 8 | Self-hosting (local / Vercel / Docker) | **Complete** |
| 9 | Curated local backgrounds (zero backend) | **Complete** — [plans/phase-9-curated-backgrounds.md](./plans/phase-9-curated-backgrounds.md) |

**v1.0.0** — [CHANGELOG.md](./CHANGELOG.md) · Full plan: [plans/PLAN.md](./plans/PLAN.md)

### Backgrounds (zero backend)

- **Gallery:** local SVGs + photo packs (Abstract, Nature, Texture, Urban, Dark, Paper) in `public/backgrounds/`
- **Upload:** drag-and-drop or file picker — stays on the device; never sent to a server
- **No** stock APIs, **no** paste-image-URL (avoids CORS export issues)
- Credits: [public/backgrounds/CREDITS.md](./public/backgrounds/CREDITS.md)

---

## Self-hosting

Hmmm is a **static** site (`dist/`). No database, no server-side API. Choose one of the three paths below.

### 1. Local (development)

**Requirements:** [Bun](https://bun.sh) (recommended) or Node ≥ 22.12 + npm/pnpm.

```bash
# Clone
git clone <your-repo-url> hmmm
cd hmmm

# Install dependencies
bun install
# or: npm install / pnpm install

# Dev server (hot reload)
bun run dev
```

Open the URL Astro prints (usually `http://localhost:4321`).

**Production-like local serve:**

```bash
bun run build
bun run preview
# or: bunx astro preview --host 127.0.0.1 --port 4321
```

**Useful checks:**

```bash
bun run check          # TypeScript / Astro
bun run test:unit      # Unit tests
bun run test:integration
bun run test:e2e       # needs Playwright browsers once: bunx playwright install chromium
```

### 2. Vercel

Still the easiest cloud path for this static app.

1. Import the repo in [Vercel](https://vercel.com).
2. Framework: **Other** / static (or leave auto).
3. Build command: `bun run build` (see `vercel.json`).
4. Output directory: `dist`.
5. Node version: **22** (`.nvmrc` / `engines`).

Install Bun on Vercel via project settings or use:

```bash
# vercel.json already sets installCommand: bun install
```

Cache headers for hashed assets and the service worker are defined in `vercel.json`.

### 3. Docker

Multi-stage image: build with Bun, serve with **nginx** (see `Dockerfile`, `deploy/nginx.conf`).

```bash
# Build image
docker build -t hmmm:latest .

# Run (http://localhost:8080)
docker run --rm -p 8080:80 hmmm:latest
```

**Docker Compose:**

```bash
docker compose up --build -d
# App: http://localhost:8080
```

Stop:

```bash
docker compose down
```

The container only serves static files from `dist/`. PWA / HTTPS: terminate TLS at your reverse proxy (Caddy, Traefik, cloud LB) in front of the container.

### Reverse proxy notes (optional)

- Prefer HTTPS in production (required for full PWA install on most mobile browsers).
- Do not long-cache `/sw.js` or `*.webmanifest` (nginx config already uses `must-revalidate`).
- `/create?q=…&author=…` deep links work; both `/` and `/create` are real app pages.

---

## UX model

| Region | Role |
|--------|------|
| **Top toolbar** | Logo, layout, theme, share link, help, download |
| **Left panel** | Text · Type · Bg · Tpl |
| **Center stage** | Live quote frame |

## Integrating with Hmmm

```html
<a href="https://your-host.example/create?q=Stay%20hungry&amp;author=Steve%20Jobs">
  Frame this quote
</a>
```

| Param | Meaning |
|-------|---------|
| `q` | Quote text |
| `author` | Author name |

Plain text only; 300-unit cap; use **Link** in the app to copy a share URL.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server |
| `bun run build` | Production static build → `dist/` (+ service worker) |
| `bun run preview` | Preview production build |
| `bun run check` | Astro + TypeScript checks |
| `bun run test:unit` | Unit tests (`src/**/*.test.ts`) |
| `bun run test:integration` | Build + dist contract tests |
| `bun run test:e2e` | Build + Playwright browser tests |
| `bun run test:all` | Unit + integration + e2e |
| `bun run lint` | Biome lint |

## Routes

| Path | Page |
|------|------|
| `/` | Editor |
| `/create` | Editor (partner deep-link entry) |
| (unknown) | On-brand 404 |

## Constraints

- No login / authentication  
- No database  
- Hard cap: **300 words/units** per quote field  

## License

See [LICENSE](./LICENSE). Background assets: [public/backgrounds/CREDITS.md](./public/backgrounds/CREDITS.md).
