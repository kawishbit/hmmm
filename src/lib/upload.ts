import { MAX_UPLOAD_BYTES, MAX_UPLOAD_EDGE } from "./backgrounds";

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Load a local image file, optionally downscale long edge, return object URL.
 * Caller must revoke the URL when replacing or unmounting.
 */
export async function processImageUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new UploadError("Please choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Image is too large (max 15 MB).");
  }

  const bitmap = await loadImageBitmap(file);
  try {
    const { width, height } = fitMaxEdge(bitmap.width, bitmap.height, MAX_UPLOAD_EDGE);
    if (width === bitmap.width && height === bitmap.height && file.type !== "image/svg+xml") {
      // No resize needed — use object URL of original (except we already have bitmap)
      return await bitmapToObjectUrl(bitmap, width, height, file.type);
    }
    return await bitmapToObjectUrl(bitmap, width, height, "image/jpeg");
  } finally {
    bitmap.close();
  }
}

function fitMaxEdge(w: number, h: number, maxEdge: number): { width: number; height: number } {
  const long = Math.max(w, h);
  if (long <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / long;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    // Fallback path via HTMLImageElement
    const url = URL.createObjectURL(file);
    try {
      const img = await loadHtmlImage(url);
      return await createImageBitmap(img);
    } catch {
      throw new UploadError("Could not read that image. Try another file.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

async function bitmapToObjectUrl(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: string,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("Canvas not available in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const type = mime === "image/png" || mime === "image/webp" ? mime : "image/jpeg";
  const quality = type === "image/jpeg" ? 0.92 : undefined;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new UploadError("Failed to process image."))),
      type,
      quality,
    );
  });

  return URL.createObjectURL(blob);
}

export function revokeIfObjectUrl(url: string | undefined | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
