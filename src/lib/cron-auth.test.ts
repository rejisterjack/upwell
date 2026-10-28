import { describe, expect, it } from "vitest";
import { cronAuthorized } from "./cron-auth";

describe("cronAuthorized", () => {
  it("rejects a missing or wrong secret", () => {
    expect(cronAuthorized(null, "cron-secret-16chars")).toBe(false);
    expect(cronAuthorized("Bearer wrong-secret-value", "cron-secret-16chars")).toBe(false);
    expect(cronAuthorized("Bearer short", "short")).toBe(false);
  });

  it("accepts the matching bearer token", () => {
    expect(cronAuthorized("Bearer cron-secret-16chars", "cron-secret-16chars")).toBe(true);
  });
});
