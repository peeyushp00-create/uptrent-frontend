import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const analyzerSource = readFileSync(
  resolve(process.cwd(), "src/pages/InstagramAnalyzer.tsx"),
  "utf8",
);

describe("Instagram Analyzer empty username handling", () => {
  it("clears stale analysis data when the username becomes empty", () => {
    expect(analyzerSource).toContain("onChange={e => handleUsernameChange(e.target.value)}");
    expect(analyzerSource).toMatch(
      /if \(!value\.trim\(\)\) \{[\s\S]*setResult\(null\);[\s\S]*setHiker\(null\);/,
    );
  });

  it("renders a safe profile initial when no username or name exists", () => {
    expect(analyzerSource).toContain("handle || '?'");
    expect(analyzerSource).toContain(".charAt(0).toUpperCase() || '?'");
  });
});
