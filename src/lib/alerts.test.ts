import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { recentDeliveries, signBody, type DeliveryInput, type DestinationRef } from "./alerts";

describe("signBody", () => {
  it("matches an HMAC-SHA256 of the body", () => {
    const body = '{"event":"down"}';
    expect(signBody(body, "top-secret")).toBe(
      createHmac("sha256", "top-secret").update(body).digest("hex"),
    );
  });
});

function delivery(index: number, overrides: Partial<DeliveryInput> = {}): DeliveryInput {
  return {
    id: `delivery-${index}`,
    destinationId: "dest-1",
    event: "down",
    serviceName: "Example",
    ok: false,
    error: "network down",
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)),
    ...overrides,
  };
}

const destination: DestinationRef = {
  id: "dest-1",
  kind: "webhook",
  target: "https://alerts.example.com/hook",
};

describe("recentDeliveries", () => {
  it("puts the newest attempt first and keeps a failed error", () => {
    const older = delivery(1);
    const newer = delivery(2, { id: "newer", event: "recovery", ok: true, error: null });
    const rows = recentDeliveries([older, newer], [destination]);
    expect(rows.map((row) => row.id)).toEqual(["newer", "delivery-1"]);
    expect(rows[1]).toMatchObject({
      serviceName: "Example",
      event: "down",
      ok: false,
      error: "network down",
      target: "https://alerts.example.com/hook",
      kind: "webhook",
    });
  });

  it("returns at most 50 rows and drops the oldest", () => {
    const rows = recentDeliveries(
      Array.from({ length: 51 }, (_, index) => delivery(index)),
      [destination],
    );
    expect(rows).toHaveLength(50);
    expect(rows[0]?.id).toBe("delivery-50");
    expect(rows.some((row) => row.id === "delivery-0")).toBe(false);
  });

  it("labels a delivery whose destination is gone", () => {
    const rows = recentDeliveries([delivery(1, { destinationId: "missing" })], [destination]);
    expect(rows[0]?.target).toBe("Removed destination");
    expect(rows[0]?.kind).toBe("");
  });
});
