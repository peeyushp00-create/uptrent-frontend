// Guards public/robots.txt and vercel.json content directly, since a
// regression here (an auth-gated route leaking into the sitemap, losing the
// Sitemap: directive/AI-bot allowlist, or breaking the sitemap/RSS proxy)
// wouldn't be caught by any component test.
//
// Note: sitemap.xml itself is no longer a static file here — it's generated
// live by uptrent-backend (GET /api/blog/sitemap.xml) from the published
// posts table, and vercel.json proxies /sitemap.xml and /rss.xml to it. A
// static public/sitemap.xml was removed deliberately: Vercel serves an
// exact-path static file instead of ever consulting rewrites for that path,
// which silently defeated the proxy.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROBOTS_PATH = resolve(__dirname, "../../public/robots.txt");
const VERCEL_CONFIG_PATH = resolve(__dirname, "../../vercel.json");

const AUTH_GATED_PATHS = [
  "/home", "/insight", "/news", "/scripts", "/settings", "/pricing",
  "/instagram/", "/youtube/", "/studio", "/admin/",
];

describe("vercel.json", () => {
  const config = JSON.parse(readFileSync(VERCEL_CONFIG_PATH, "utf8"));

  it("has no static sitemap.xml to shadow the rewrite", () => {
    expect(() => readFileSync(resolve(__dirname, "../../public/sitemap.xml"))).toThrow();
  });

  it("proxies /sitemap.xml and /rss.xml to the backend blog routes", () => {
    const bySource = Object.fromEntries(config.rewrites.map((r: { source: string; destination: string }) => [r.source, r.destination]));
    expect(bySource["/sitemap.xml"]).toMatch(/\/api\/blog\/sitemap\.xml$/);
    expect(bySource["/rss.xml"]).toMatch(/\/api\/blog\/rss\.xml$/);
  });

  it("keeps the SPA catch-all rewrite last", () => {
    const sources = config.rewrites.map((r: { source: string }) => r.source);
    expect(sources[sources.length - 1]).toBe("/(.*)");
  });
});

describe("public/robots.txt", () => {
  const robots = readFileSync(ROBOTS_PATH, "utf8");

  it("points crawlers at the sitemap", () => {
    expect(robots).toContain("Sitemap: https://www.socialrum.com/sitemap.xml");
  });

  it("explicitly allows the major AI answer-engine crawlers", () => {
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
  });

  it("disallows auth-gated app paths under every user-agent group (not just '*')", () => {
    const groups = robots.split(/(?=User-agent:)/);
    const namedBotGroups = groups.filter((g) =>
      /^User-agent: (Googlebot|Bingbot|GPTBot|ClaudeBot|PerplexityBot|Google-Extended|\*)/.test(g)
    );
    expect(namedBotGroups.length).toBeGreaterThan(0);
    for (const group of namedBotGroups) {
      expect(group).toContain("Disallow: /admin/");
      expect(group).toContain("Disallow: /studio");
    }
  });
});
