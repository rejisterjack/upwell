import type { CheckOutcome, ServiceState } from "./types";

export type ProbeTransition = {
  status: ServiceState;
  consecutiveFailures: number;
  alert: "down" | "recovery" | null;
};

export function applyProbe(input: {
  status: ServiceState;
  consecutiveFailures: number;
  outcome: CheckOutcome;
  failuresBeforeAlert: number;
}): ProbeTransition {
  if (input.status === "maintenance") {
    return {
      status: "maintenance",
      consecutiveFailures: input.consecutiveFailures,
      alert: null,
    };
  }

  const threshold = Math.max(1, input.failuresBeforeAlert);
  if (input.outcome === "down") {
    const consecutiveFailures = input.consecutiveFailures + 1;
    if (input.status === "down") {
      return { status: "down", consecutiveFailures, alert: null };
    }
    if (consecutiveFailures >= threshold) {
      return { status: "down", consecutiveFailures, alert: "down" };
    }
    return {
      status: input.status,
      consecutiveFailures,
      alert: null,
    };
  }

  const status = input.outcome === "degraded" ? "degraded" : "operational";
  return {
    status,
    consecutiveFailures: 0,
    alert: input.status === "down" ? "recovery" : null,
  };
}
