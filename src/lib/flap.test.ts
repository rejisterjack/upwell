import { describe, expect, it } from "vitest";
import { applyProbe } from "./flap";

describe("applyProbe", () => {
  it("does not alert on the first failure", () => {
    expect(
      applyProbe({
        status: "operational",
        consecutiveFailures: 0,
        outcome: "down",
        failuresBeforeAlert: 2,
      }),
    ).toEqual({ status: "operational", consecutiveFailures: 1, alert: null });
  });

  it("alerts when failures reach the threshold", () => {
    expect(
      applyProbe({
        status: "operational",
        consecutiveFailures: 1,
        outcome: "down",
        failuresBeforeAlert: 2,
      }),
    ).toEqual({ status: "down", consecutiveFailures: 2, alert: "down" });
  });

  it("alerts once when a down service recovers", () => {
    expect(
      applyProbe({
        status: "down",
        consecutiveFailures: 3,
        outcome: "up",
        failuresBeforeAlert: 2,
      }),
    ).toEqual({ status: "operational", consecutiveFailures: 0, alert: "recovery" });
  });

  it("keeps maintenance quiet", () => {
    expect(
      applyProbe({
        status: "maintenance",
        consecutiveFailures: 0,
        outcome: "down",
        failuresBeforeAlert: 1,
      }),
    ).toEqual({ status: "maintenance", consecutiveFailures: 0, alert: null });
  });
});
