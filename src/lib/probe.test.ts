import { describe, expect, it } from "vitest";
import { probeService } from "./probe";

describe("probeService", () => {
  it("does not follow a redirect onto a private address", async () => {
    let calls = 0;
    const result = await probeService(
      {
        url: "https://example.com/health",
        method: "GET",
        expectedStatus: 200,
        timeoutMs: 1000,
        degradedAfterMs: null,
      },
      async () => {
        calls += 1;
        return new Response(null, {
          status: 302,
          headers: { location: "http://169.254.169.254/latest" },
        });
      },
      async () => ["93.184.216.34"],
    );
    expect(calls).toBe(1);
    expect(result.outcome).toBe("down");
    expect(result.error).toMatch(/private/i);
  });
});
