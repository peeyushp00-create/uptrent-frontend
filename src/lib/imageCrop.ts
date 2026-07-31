export interface RatioPreset {
  label: string;
  width: number;
  height: number;
}

export interface EncodedImage {
  blob: Blob;
  mime: string;
  ext: string;
}

export const RATIO_PRESETS: RatioPreset[] = [
  { label: 'Landscape (1200×630)', width: 1200, height: 630 },
  { label: 'Square (1080×1080)', width: 1080, height: 1080 },
  { label: 'Portrait (1080×1350)', width: 1080, height: 1350 },
];

let webpSupported: boolean | null = null;

// Canvas-level feature detection: browsers that can't encode WebP silently
// fall back to PNG from toDataURL, so a successful "data:image/webp" prefix
// is the only reliable signal.
function supportsWebpEncoding(): boolean {
  if (webpSupported !== null) return webpSupported;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  return webpSupported;
}

function encodeCanvas(canvas: HTMLCanvasElement, quality = 0.85): Promise<EncodedImage> {
  const mime = supportsWebpEncoding() ? 'image/webp' : 'image/jpeg';
  const ext = mime === 'image/webp' ? 'webp' : 'jpg';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve({ blob, mime, ext }) : reject(new Error('Failed to encode image'))),
      mime,
      quality,
    );
  });
}

export async function cropToRatio(file: File | Blob, targetWidth: number, targetHeight: number): Promise<EncodedImage> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(imageUrl);

    const targetRatio = targetWidth / targetHeight;
    const sourceRatio = img.width / img.height;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sourceRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

    return await encodeCanvas(canvas, 0.9);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

// For in-body images: no fixed ratio, just downscale anything wider than
// maxWidth (screenshots are usually the heaviest thing on a blog page) and
// re-encode as WebP where supported.
export async function optimizeImage(file: File | Blob, maxWidth = 1600): Promise<EncodedImage> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(imageUrl);
    const scale = Math.min(1, maxWidth / img.width);
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, 0, 0, width, height);

    return await encodeCanvas(canvas, 0.85);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
