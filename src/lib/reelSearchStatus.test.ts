import { describe, it, expect } from "vitest";
import { interpretReelSearchResponse } from "./reelSearchStatus";

describe("interpretReelSearchResponse", () => {
  it("maps a non-ok fetch response to network_error, regardless of body", () => {
    const outcome = interpretReelSearchResponse(false, { items: [{ id: 1 }] }, true);
    expect(outcome.status).toBe("network_error");
    expect(outcome.videos).toEqual([]);
    expect(outcome.hasMore).toBe(false);
  });

  it("maps upstream_available:false (Instagram) to upstream_unavailable, preserving the backend message", () => {
    const outcome = interpretReelSearchResponse(
      true,
      { source: "none", upstream_available: false, message: "Reel search is temporarily unavailable", items: [], reels: [] },
      true
    );
    expect(outcome.status).toBe("upstream_unavailable");
    expect(outcome.message).toBe("Reel search is temporarily unavailable");
    expect(outcome.videos).toEqual([]);
  });

  it("falls back to a null message when upstream_available:false but no message field is present", () => {
    const outcome = interpretReelSearchResponse(true, { upstream_available: false, items: [] }, true);
    expect(outcome.status).toBe("upstream_unavailable");
    expect(outcome.message).toBeNull();
  });

  it("treats a successful response with real results as ok", () => {
    const outcome = interpretReelSearchResponse(
      true,
      { source: "scraper", upstream_available: true, items: [{ id: "a" }, { id: "b" }], has_more: false },
      true
    );
    expect(outcome.status).toBe("ok");
    expect(outcome.videos).toHaveLength(2);
  });

  it("treats a successful response with zero results as ok, not an error (legitimate empty search)", () => {
    const outcome = interpretReelSearchResponse(
      true,
      { source: "hikerapi", upstream_available: true, items: [], reels: [] },
      true
    );
    expect(outcome.status).toBe("ok");
    expect(outcome.videos).toEqual([]);
  });

  it("ignores upstream_available for non-Instagram (YouTube) searches", () => {
    const outcome = interpretReelSearchResponse(true, { upstream_available: false, items: [{ id: 1 }] }, false);
    expect(outcome.status).toBe("ok");
  });

  it("reads reels[] when items[] is absent", () => {
    const outcome = interpretReelSearchResponse(true, { reels: [{ id: "x" }] }, true);
    expect(outcome.videos).toHaveLength(1);
  });

  it("defaults to an empty array when the body has neither items nor reels", () => {
    const outcome = interpretReelSearchResponse(true, {}, true);
    expect(outcome.videos).toEqual([]);
  });

  it("handles a null/malformed body without throwing", () => {
    const outcome = interpretReelSearchResponse(true, null, true);
    expect(outcome.status).toBe("ok");
    expect(outcome.videos).toEqual([]);
  });

  it("propagates has_more", () => {
    const outcome = interpretReelSearchResponse(true, { items: [{ id: 1 }], has_more: true }, true);
    expect(outcome.hasMore).toBe(true);
  });
});
