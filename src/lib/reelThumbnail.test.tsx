import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  isValidThumbnailUrl,
  getReelThumbnailSrc,
  getReelAltText,
  handleReelThumbnailError,
  REEL_PLACEHOLDER_SRC,
} from "./reelThumbnail";

afterEach(() => cleanup());

describe("isValidThumbnailUrl", () => {
  it("accepts a well-formed URL", () => {
    expect(isValidThumbnailUrl("https://example.com/thumb.jpg")).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidThumbnailUrl(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidThumbnailUrl(undefined)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidThumbnailUrl("")).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    expect(isValidThumbnailUrl("   \n\t  ")).toBe(false);
  });

  it("rejects a malformed URL", () => {
    expect(isValidThumbnailUrl("not a url")).toBe(false);
  });
});

describe("getReelThumbnailSrc", () => {
  it("passes through a plain valid URL unchanged", () => {
    expect(getReelThumbnailSrc("https://images.example.com/a.jpg")).toBe(
      "https://images.example.com/a.jpg"
    );
  });

  it("routes an Instagram CDN URL through the backend image proxy", () => {
    const cdnUrl = "https://scontent.cdninstagram.com/v/t51/abc.jpg";
    const src = getReelThumbnailSrc(cdnUrl);
    expect(src).toContain("/api/instagram/img?u=");
    expect(src).toContain(encodeURIComponent(cdnUrl));
  });

  it("routes an fbcdn.net URL through the backend image proxy", () => {
    const cdnUrl = "https://instagram.fabc1-1.fna.fbcdn.net/v/t51/abc.jpg";
    expect(getReelThumbnailSrc(cdnUrl)).toContain("/api/instagram/img?u=");
  });

  it("passes through a supabase-hosted URL unproxied", () => {
    const supabaseUrl = "https://project.supabase.co/storage/v1/object/public/insta-media/a.jpg";
    expect(getReelThumbnailSrc(supabaseUrl)).toBe(supabaseUrl);
  });

  it("falls back to the local placeholder for a null thumbnail", () => {
    expect(getReelThumbnailSrc(null)).toBe(REEL_PLACEHOLDER_SRC);
  });

  it("falls back to the local placeholder for an empty string", () => {
    expect(getReelThumbnailSrc("")).toBe(REEL_PLACEHOLDER_SRC);
  });

  it("falls back to the local placeholder for a whitespace-only string", () => {
    expect(getReelThumbnailSrc("   ")).toBe(REEL_PLACEHOLDER_SRC);
  });

  it("falls back to the local placeholder for an invalid URL", () => {
    expect(getReelThumbnailSrc("totally not a url")).toBe(REEL_PLACEHOLDER_SRC);
  });
});

describe("getReelAltText", () => {
  it("prefers the caption when present", () => {
    expect(getReelAltText("A great reel about finance", "moneyguru")).toBe(
      "A great reel about finance"
    );
  });

  it("falls back to the username when caption is missing", () => {
    expect(getReelAltText(undefined, "moneyguru")).toBe("@moneyguru");
  });

  it("falls back to the username when caption is whitespace-only", () => {
    expect(getReelAltText("   ", "moneyguru")).toBe("@moneyguru");
  });

  it("strips a leading @ from the username before re-adding it", () => {
    expect(getReelAltText(null, "@moneyguru")).toBe("@moneyguru");
  });

  it("falls back to the generic label when both caption and username are missing", () => {
    expect(getReelAltText(null, null)).toBe("Reel thumbnail");
  });

  it("falls back to the generic label when both are whitespace-only", () => {
    expect(getReelAltText("  ", "  ")).toBe("Reel thumbnail");
  });

  it("truncates very long captions", () => {
    const longCaption = "x".repeat(300);
    expect(getReelAltText(longCaption, "user").length).toBeLessThanOrEqual(140);
  });
});

describe("handleReelThumbnailError (loop-safe fallback)", () => {
  it("swaps the image src to the local placeholder on first error", () => {
    const img = document.createElement("img");
    img.src = "https://broken.example.com/gone.jpg";
    const event = { currentTarget: img } as unknown as React.SyntheticEvent<HTMLImageElement>;

    handleReelThumbnailError(event);

    expect(img.src).toContain(REEL_PLACEHOLDER_SRC);
    expect(img.dataset.fallbackApplied).toBe("true");
  });

  it("does not reset the src again on a second error (no infinite loop)", () => {
    const img = document.createElement("img");
    img.src = "https://broken.example.com/gone.jpg";
    const event = { currentTarget: img } as unknown as React.SyntheticEvent<HTMLImageElement>;

    handleReelThumbnailError(event);
    const srcAfterFirstError = img.src;

    // Simulate the placeholder itself somehow firing onError again.
    const setterSpy = vi.spyOn(img, "src", "set");
    handleReelThumbnailError(event);

    expect(setterSpy).not.toHaveBeenCalled();
    expect(img.src).toBe(srcAfterFirstError);
  });
});

// Renders a small reel-card harness using the same pattern the real pages
// use (aspect-ratio wrapper + img wired to the shared helpers), so the DOM
// behavior — not just the pure functions — is verified end-to-end.
function ReelCardHarness({ thumbnail, caption, username }: { thumbnail?: string | null; caption?: string | null; username?: string | null }) {
  return (
    <div
      data-testid="reel-card"
      className="relative rounded-2xl overflow-hidden"
      style={{ aspectRatio: "9/16", background: "#1a1a2e" }}
    >
      <img
        src={getReelThumbnailSrc(thumbnail)}
        alt={getReelAltText(caption, username)}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={handleReelThumbnailError}
      />
    </div>
  );
}

describe("Reel card thumbnail rendering", () => {
  it("renders the 9:16 aspect-ratio wrapper", () => {
    render(<ReelCardHarness thumbnail="https://example.com/a.jpg" caption="Hello" username="user" />);
    const card = screen.getByTestId("reel-card");
    expect(card.style.aspectRatio).toBe("9/16");
  });

  it("uses the caption as alt text when available", () => {
    render(<ReelCardHarness thumbnail="https://example.com/a.jpg" caption="Big reveal today" username="user" />);
    expect(screen.getByAltText("Big reveal today")).toBeInTheDocument();
  });

  it("uses the username as alt text when caption is missing", () => {
    render(<ReelCardHarness thumbnail="https://example.com/a.jpg" caption={null} username="creator1" />);
    expect(screen.getByAltText("@creator1")).toBeInTheDocument();
  });

  it("renders the local placeholder immediately when thumbnail is missing", () => {
    render(<ReelCardHarness thumbnail={null} caption="No thumbnail here" username="user" />);
    const img = screen.getByAltText("No thumbnail here") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe(REEL_PLACEHOLDER_SRC);
  });

  it("swaps to the placeholder when the image fails to load, without looping", () => {
    render(<ReelCardHarness thumbnail="https://broken.example.com/gone.jpg" caption="Oops" username="user" />);
    const img = screen.getByAltText("Oops") as HTMLImageElement;

    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe(REEL_PLACEHOLDER_SRC);

    const setterSpy = vi.spyOn(img, "src", "set");
    fireEvent.error(img);
    expect(setterSpy).not.toHaveBeenCalled();
  });
});
