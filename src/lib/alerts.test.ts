import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signBody } from "./alerts";

describe("signBody", () => {
  it("matches an HMAC-SHA256 of the body", () => {
    const body = '{"event":"down"}';
    expect(signBody(body, "top-secret")).toBe(
      createHmac("sha256", "top-secret").update(body).digest("hex"),
    );
  });
});
