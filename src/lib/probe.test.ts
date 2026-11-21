import { describe, expect, it } from "vitest";
import { pinnedAddressLookup, probeService } from "./probe";

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

  it("answers an all:true DNS lookup with one pinned address", () => {
    const lookup = pinnedAddressLookup("example.org", "104.20.26.136");
    const seen: { address: string; family: number }[][] = [];
    lookup("example.org", { all: true }, (_error, address) => {
      seen.push(address as { address: string; family: number }[]);
    });
    expect(seen).toEqual([[{ address: "104.20.26.136", family: 4 }]]);
  });
});
