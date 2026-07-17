import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const analyzerSource = readFileSync(
  resolve(process.cwd(), "src/pages/InstagramAnalyzer.tsx"),
  "utf8",
);

describe("Instagram Analyzer competitor profile action", () => {
  it("opens the internal competitor detail instead of Instagram", () => {
    const action = analyzerSource.match(
      /<button type="button"[\s\S]*?View Profile<\/button>/,
    )?.[0];

    expect(action).toBeDefined();
    expect(action).toContain("setOpenCompetitor(comp)");
    expect(action).not.toContain("instagram.com");
    expect(action).not.toContain("target=\"_blank\"");
  });
});
