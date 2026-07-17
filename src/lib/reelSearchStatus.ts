// Interprets a GET /api/hiker/reels response (or a failed/thrown fetch) into
// a status the UI can render distinctly, instead of treating every empty
// result the same way. See backend/src/routes/hikerReels.js for the
// source/upstream_available/message contract this reads.

export type VideosStatus = "idle" | "ok" | "network_error" | "upstream_unavailable";

export interface ReelSearchOutcome {
  videos: unknown[];
  hasMore: boolean;
  status: VideosStatus;
  message: string | null;
}

// `ok` is the fetch Response's own `.ok` (true only for 2xx) — a non-2xx
// response is a backend/network-level failure, distinct from a successful
// 200 that explicitly reports the upstream provider as unavailable.
export function interpretReelSearchResponse(ok: boolean, data: unknown, isIG: boolean): ReelSearchOutcome {
  if (!ok) {
    return { videos: [], hasMore: false, status: "network_error", message: null };
  }

  const body = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const videos = Array.isArray(body.items) ? body.items : Array.isArray(body.reels) ? body.reels : [];
  const hasMore = Boolean(body.has_more);

  if (isIG && body.upstream_available === false) {
    return {
      videos,
      hasMore,
      status: "upstream_unavailable",
      message: typeof body.message === "string" ? body.message : null,
    };
  }

  return { videos, hasMore, status: "ok", message: null };
}
