import type { SyntheticEvent } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Local neutral placeholder shown whenever a reel has no usable thumbnail —
// missing/null/empty/whitespace/malformed URL — or the image itself fails
// to load (e.g. an expired Instagram CDN URL).
export const REEL_PLACEHOLDER_SRC = "/reel-placeholder.svg";

// Instagram CDN blocks direct <img> loads without a Referer header, so those
// go through the backend's image proxy — the same convention already used
// by the local proxyImg() helpers in Index.tsx / InstagramAnalyzer.tsx.
function isInstagramCdnUrl(url: string): boolean {
  return /(cdninstagram\.com|fbcdn\.net)/i.test(url);
}

function isParsableUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validates a raw thumbnail value from the API — handles null, undefined,
// empty strings, whitespace-only strings, and malformed URLs.
export function isValidThumbnailUrl(url?: string | null): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return isParsableUrl(trimmed);
}

// Resolves the <img> src to use for a reel thumbnail: the (possibly
// proxied) remote URL if valid, otherwise the local placeholder.
export function getReelThumbnailSrc(thumbnail?: string | null): string {
  if (!isValidThumbnailUrl(thumbnail)) return REEL_PLACEHOLDER_SRC;
  const trimmed = thumbnail.trim();
  if (trimmed.includes("supabase")) return trimmed;
  return isInstagramCdnUrl(trimmed)
    ? `${BASE}/api/instagram/img?u=${encodeURIComponent(trimmed)}`
    : trimmed;
}

// Alt text priority: caption -> username -> generic fallback.
export function getReelAltText(caption?: string | null, username?: string | null): string {
  const trimmedCaption = caption?.trim();
  if (trimmedCaption) return trimmedCaption.slice(0, 140);
  const trimmedUsername = username?.trim();
  if (trimmedUsername) return `@${trimmedUsername.replace(/^@/, "")}`;
  return "Reel thumbnail";
}

// onError handler: swaps a broken/expired thumbnail to the local
// placeholder exactly once. The loop guard lives on the element itself (a
// data attribute), so even if something unexpected happens to the local
// placeholder asset, we never re-enter this handler for the same <img>.
export function handleReelThumbnailError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = REEL_PLACEHOLDER_SRC;
}
