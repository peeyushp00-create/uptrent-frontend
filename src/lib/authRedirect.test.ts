import { describe, expect, it } from "vitest";
import { getPostLoginPath } from "./authRedirect";

describe("getPostLoginPath", () => {
  it("returns the protected destination", () => {
    expect(getPostLoginPath({ from: "/instagram/analyzer?tab=reels" })).toBe(
      "/instagram/analyzer?tab=reels",
    );
  });

  it("defaults direct logins to home", () => {
    expect(getPostLoginPath(undefined)).toBe("/home");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(getPostLoginPath({ from: "https://evil.example" })).toBe("/home");
    expect(getPostLoginPath({ from: "//evil.example" })).toBe("/home");
  });

  it("does not redirect back to login", () => {
    expect(getPostLoginPath({ from: "/login" })).toBe("/home");
  });
});
