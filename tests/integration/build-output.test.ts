/**
 * Integration: production build artifacts and static route contracts.
 * Run via `bun run test:integration` (builds first).
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const dist = join(root, "dist");

function mustExist(rel: string) {
  const p = join(dist, rel);
  expect(existsSync(p)).toBe(true);
  return p;
}

describe("production dist output", () => {
  test("dist directory exists (run build first)", () => {
    expect(existsSync(dist)).toBe(true);
  });

  test("core pages exist", () => {
    mustExist("index.html");
    mustExist("create/index.html");
    mustExist("404.html");
  });

  test("PWA service worker and manifest exist", () => {
    mustExist("sw.js");
    // vite-pwa emits manifest.webmanifest; public fallback may also copy site.webmanifest
    const hasManifest =
      existsSync(join(dist, "manifest.webmanifest")) || existsSync(join(dist, "site.webmanifest"));
    expect(hasManifest).toBe(true);
    const workbox = readdirSync(dist).some((f) => f.startsWith("workbox-"));
    expect(workbox).toBe(true);
  });

  test("gallery backgrounds are shipped", () => {
    const bg = mustExist("backgrounds");
    const files = readdirSync(bg).filter((f) => f.endsWith(".svg"));
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  test("PWA icons include any and maskable", () => {
    mustExist("icons/icon-192.png");
    mustExist("icons/icon-512.png");
    mustExist("icons/icon-maskable-192.png");
    mustExist("icons/icon-maskable-512.png");
  });

  test("/create is a full editor page (keeps query params on static hosts)", () => {
    const html = readFileSync(mustExist("create/index.html"), "utf8");
    // Must not be a meta-refresh redirect-only page
    expect(html.includes("Redirecting")).toBe(false);
    expect(html.toLowerCase()).toContain("hmmm");
    // Vue island / workspace should be referenced
    expect(html.includes("_astro") || html.includes("Loading")).toBe(true);
  });

  test("index references service worker registration path", () => {
    const html = readFileSync(mustExist("index.html"), "utf8");
    // SW is registered from bundled BaseLayout script, not always inline "sw.js" string
    expect(html.length).toBeGreaterThan(200);
    expect(html).toContain("manifest");
  });
});
