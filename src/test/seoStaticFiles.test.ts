// Guards the public/sitemap.xml and public/robots.txt content directly,
// since a regression here (an auth-gated route leaking into the sitemap, or
// losing the Sitemap: directive/AI-bot allowlist) wouldn't be caught by any
// component test.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SITEMAP_PATH = resolve(__dirname, "../../public/sitemap.xml");
const ROBOTS_PATH = resolve(__dirname, "../../public/robots.txt");

const AUTH_GATED_PATHS = [
  "/home", "/insight", "/news", "/scripts", "/settings", "/pricing",
  "/instagram/", "/youtube/", "/studio", "/admin/",
];

describe("public/sitemap.xml", () => {
  const sitemap = readFileSync(SITEMAP_PATH, "utf8");

  it("includes the homepage", () => {
    expect(sitemap).toContain("<loc>https://www.socialrum.com/</loc>");
  });

  it("never lists an auth-gated or admin route", () => {
    for (const path of AUTH_GATED_PATHS) {
      expect(sitemap).not.toContain(`https://www.socialrum.com${path}`);
    }
  });

  it("is well-formed enough to contain matching <url> open/close tags", () => {
    const opens = (sitemap.match(/<url>/g) || []).length;
    const closes = (sitemap.match(/<\/url>/g) || []).length;
    expect(opens).toBeGreaterThan(0);
    expect(opens).toBe(closes);
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
