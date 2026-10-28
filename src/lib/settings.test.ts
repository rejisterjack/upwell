import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "./settings";

describe("normalizeSiteUrl", () => {
  it("keeps an http origin and rejects anything else", () => {
    expect(normalizeSiteUrl("")).toBe("");
    expect(normalizeSiteUrl("https://status.example.com/path")).toBe("https://status.example.com");
    expect(() => normalizeSiteUrl("javascript:alert(1)")).toThrow(/http/);
    expect(() => normalizeSiteUrl("https://user:pass@example.com")).toThrow(/credential/i);
  });
});
