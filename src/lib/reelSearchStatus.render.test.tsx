import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { interpretReelSearchResponse, type VideosStatus } from "./reelSearchStatus";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Mirrors the exact fetch -> interpretReelSearchResponse -> setState pattern
// used in Index.tsx's search effect, so "loading always clears" is verified
// against the real control flow (try/catch/finally), not just asserted by
// reading the source.
function SearchHarness({ fetchImpl }: { fetchImpl: () => Promise<Response> }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<VideosStatus>("idle");
  const [ranOnce, setRanOnce] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetchImpl();
      const data = res.ok ? await res.json().catch(() => null) : null;
      const outcome = interpretReelSearchResponse(res.ok, data, true);
      setStatus(outcome.status);
    } catch {
      setStatus("network_error");
    } finally {
      setLoading(false);
      setRanOnce(true);
    }
  };

  return (
    <div>
      <button onClick={run}>search</button>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="status">{ranOnce ? status : "idle"}</span>
    </div>
  );
}

describe("loading state always clears", () => {
  it("clears after a successful response", async () => {
    const fetchImpl = async () =>
      ({ ok: true, json: async () => ({ upstream_available: true, items: [{ id: 1 }] }) }) as Response;
    render(<SearchHarness fetchImpl={fetchImpl} />);

    fireEvent.click(screen.getByText("search"));
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("status").textContent).toBe("ok");
  });

  it("clears after a non-2xx response (network_error)", async () => {
    const fetchImpl = async () => ({ ok: false, json: async () => ({}) }) as Response;
    render(<SearchHarness fetchImpl={fetchImpl} />);

    fireEvent.click(screen.getByText("search"));
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("status").textContent).toBe("network_error");
  });

  it("clears after upstream_available:false (temporarily unavailable)", async () => {
    const fetchImpl = async () =>
      ({ ok: true, json: async () => ({ upstream_available: false, message: "down", items: [] }) }) as Response;
    render(<SearchHarness fetchImpl={fetchImpl} />);

    fireEvent.click(screen.getByText("search"));
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("status").textContent).toBe("upstream_unavailable");
  });

  it("clears even when fetch itself throws (e.g. DNS failure, offline)", async () => {
    const fetchImpl = async () => { throw new Error("Failed to fetch"); };
    render(<SearchHarness fetchImpl={fetchImpl} />);

    fireEvent.click(screen.getByText("search"));
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("status").textContent).toBe("network_error");
  });
});
