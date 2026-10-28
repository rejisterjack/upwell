import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/cron/checks", () => {
  it("returns 401 without the bearer token", async () => {
    const response = await GET(new Request("http://localhost/api/cron/checks"));
    expect(response.status).toBe(401);
  });
});
