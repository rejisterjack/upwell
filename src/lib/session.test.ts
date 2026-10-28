import { describe, expect, it } from "vitest";
import { readSessionToken, signSession } from "./session";

describe("readSessionToken", () => {
  it("accepts a signed admin session and rejects garbage", async () => {
    process.env.ADMIN_PASSWORD = "test-password-16ch";
    const token = await signSession();
    expect(await readSessionToken(token)).toBe(true);
    expect(await readSessionToken("not-a-jwt")).toBe(false);
    expect(await readSessionToken(undefined)).toBe(false);
  });
});
