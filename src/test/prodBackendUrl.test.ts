// Regression guard for the incident where frontend/.env pointed VITE_API_URL
// at a Render hostname (https://SocialRum-backend.onrender.com) that had no
// service bound to it (Render returned `x-render-routing: no-server`),
// silently breaking every API call in production. The real backend is
// https://uptrent-backend.onrender.com — confirmed live via /api/ping.
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(__dirname, "../../.env");
const INVALID_HOSTNAMES = [/SocialRum-backend\.onrender\.com/i, /socialrum-backend\.onrender\.com/i];
const VALID_HOSTNAME = "uptrent-backend.onrender.com";

describe("frontend/.env VITE_API_URL", () => {
  it("exists and defines VITE_API_URL", () => {
    expect(existsSync(ENV_PATH)).toBe(true);
    const contents = readFileSync(ENV_PATH, "utf8");
    expect(contents).toMatch(/^VITE_API_URL=/m);
  });

  it("points at the real backend host, not the dead SocialRum-backend hostname", () => {
    const contents = readFileSync(ENV_PATH, "utf8");
    const match = contents.match(/^VITE_API_URL=(.+)$/m);
    expect(match).not.toBeNull();

    const value = match![1].trim();
    for (const invalid of INVALID_HOSTNAMES) {
      expect(value).not.toMatch(invalid);
    }
    expect(value).toContain(VALID_HOSTNAME);
    expect(value.startsWith("https://")).toBe(true);
  });
});
