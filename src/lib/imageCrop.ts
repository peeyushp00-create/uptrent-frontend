export interface RatioPreset {
  label: string;
  width: number;
  height: number;
}

export const RATIO_PRESETS: RatioPreset[] = [
  { label: 'Landscape (1200×630)', width: 1200, height: 630 },
  { label: 'Square (1080×1080)', width: 1080, height: 1080 },
  { label: 'Portrait (1080×1350)', width: 1080, height: 1350 },
];

export async function cropToRatio(file: File | Blob, targetWidth: number, targetHeight: number): Promise<Blob> {
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

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode cropped image'))),
        'image/jpeg',
        0.9,
      );
    });
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
