import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf8");

describe("temporary Instagram Analyzer auth bypass", () => {
  it("defines the analyzer route before the protected route group", () => {
    const analyzerRoute = appSource.indexOf(
      '<Route path="/instagram/analyzer" element={<AppLayout />}>',
    );
    const protectedRoutes = appSource.indexOf(
      '<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>',
    );

    expect(analyzerRoute).toBeGreaterThan(-1);
    expect(protectedRoutes).toBeGreaterThan(analyzerRoute);
    expect(appSource.match(/path="\/instagram\/analyzer"/g)).toHaveLength(1);
  });
});
