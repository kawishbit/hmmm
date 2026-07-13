import { toPng } from "html-to-image";
import { exportDimensions } from "./layouts";
import type { AspectRatioKey } from "./types";

export interface ExportOptions {
  aspectRatio: AspectRatioKey;
  filename?: string;
}

/**
 * Rasterize a DOM node to PNG and trigger a download.
 * Node should already be laid out at the desired aspect ratio;
 * we scale pixelRatio so the short side matches export target.
 */
export async function downloadQuotePng(node: HTMLElement, options: ExportOptions): Promise<void> {
  const { width, height } = exportDimensions(options.aspectRatio);
  const rect = node.getBoundingClientRect();
  const displayW = Math.max(rect.width, 1);
  const displayH = Math.max(rect.height, 1);
  // Scale so export matches target dimensions
  const pixelRatio = Math.max(width / displayW, height / displayH);

  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  // Ensure gallery / upload images are painted before rasterize
  await waitForImages(node);

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio,
    width: displayW,
    height: displayH,
    style: {
      transform: "none",
    },
  });

  const filename = options.filename ?? "hmmm-quote.png";
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const urls = new Set<string>();
  const walk = (el: Element) => {
    const style = getComputedStyle(el);
    const bg = style.backgroundImage;
    if (bg && bg !== "none") {
      const re = /url\(["']?([^"')]+)["']?\)/g;
      for (const match of bg.matchAll(re)) {
        if (match[1]) urls.add(match[1]);
      }
    }
    for (const child of el.children) walk(child);
  };
  walk(root);

  await Promise.all(
    [...urls].map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
}
