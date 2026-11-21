import { describe, expect, it } from "vitest";
import { boundedInt, normalizeSiteUrl } from "./settings";

describe("normalizeSiteUrl", () => {
  it("keeps an http origin and rejects anything else", () => {
    expect(normalizeSiteUrl("")).toBe("");
    expect(normalizeSiteUrl("https://status.example.com/path")).toBe("https://status.example.com");
    expect(() => normalizeSiteUrl("javascript:alert(1)")).toThrow(/http/);
    expect(() => normalizeSiteUrl("https://user:pass@example.com")).toThrow(/credential/i);
  });
});

describe("boundedInt", () => {
  it("clamps non-finite and out-of-range numbers", () => {
    expect(boundedInt(Number.POSITIVE_INFINITY, 60, 100, 60)).toBe(60);
    expect(boundedInt(1, 60, 100, 60)).toBe(60);
    expect(boundedInt(10_000, 60, 100, 60)).toBe(100);
    expect(boundedInt(80.4, 60, 100, 60)).toBe(80);
  });
});
