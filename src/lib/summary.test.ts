import { describe, expect, it } from "vitest";
import { buildSnapshot } from "./summary";

const createdAt = new Date("2026-10-01T00:00:00Z");

describe("buildSnapshot", () => {
  it("leaves days before a service existed empty", () => {
    const snapshot = buildSnapshot({
      now: new Date("2026-10-28T12:00:00Z"),
      siteName: "Acme",
      siteUrl: "https://status.acme.test",
      checkIntervalSeconds: 60,
      services: [
        {
          id: "svc",
          name: "API",
          description: null,
          groupLabel: "Platform",
          status: "operational",
          enabled: true,
          position: 0,
          responseMs: 120,
          lastCheckedAt: new Date("2026-10-28T12:00:00Z"),
          createdAt,
        },
      ],
      stats: [
        {
          serviceId: "svc",
          day: "2026-09-01",
          totalChecks: 10,
          upChecks: 0,
          degradedChecks: 0,
          downChecks: 10,
        },
        {
          serviceId: "svc",
          day: "2026-10-20",
          totalChecks: 10,
          upChecks: 8,
          degradedChecks: 2,
          downChecks: 0,
        },
        {
          serviceId: "svc",
          day: "2026-10-21",
          totalChecks: 4,
          upChecks: 2,
          degradedChecks: 0,
          downChecks: 2,
        },
      ],
      incidents: [],
    });

    const before = snapshot.services[0]?.days.find((day) => day.date === "2026-09-01");
    const degraded = snapshot.services[0]?.days.find((day) => day.date === "2026-10-20");
    const down = snapshot.services[0]?.days.find((day) => day.date === "2026-10-21");
    expect(before?.tone).toBe("empty");
    expect(degraded?.tone).toBe("degraded");
    expect(down?.tone).toBe("down");
    expect(snapshot.services[0]?.uptimePercent).toBeCloseTo((12 / 14) * 100);
    expect(snapshot.banner.title).toBe("All systems operational");
    expect(snapshot.groups[0]?.label).toBe("Platform");
  });

  it("does not show a stale all-clear", () => {
    const snapshot = buildSnapshot({
      now: new Date("2026-10-28T12:00:00Z"),
      siteName: "Acme",
      siteUrl: "",
      checkIntervalSeconds: 60,
      services: [
        {
          id: "svc",
          name: "API",
          description: null,
          groupLabel: null,
          status: "operational",
          enabled: true,
          position: 0,
          responseMs: 10,
          lastCheckedAt: new Date("2026-10-28T10:00:00Z"),
          createdAt,
        },
      ],
      stats: [],
      incidents: [],
    });
    expect(snapshot.delayed).toBe(true);
    expect(snapshot.banner.tone).toBe("delayed");
  });

  it("lets an open incident lead even when probes are green", () => {
    const snapshot = buildSnapshot({
      now: new Date("2026-10-28T12:00:00Z"),
      siteName: "Acme",
      siteUrl: "",
      checkIntervalSeconds: 86_400,
      services: [
        {
          id: "svc",
          name: "API",
          description: null,
          groupLabel: null,
          status: "operational",
          enabled: true,
          position: 0,
          responseMs: 10,
          lastCheckedAt: new Date("2026-10-28T12:00:00Z"),
          createdAt,
        },
      ],
      stats: [],
      incidents: [
        {
          id: "inc",
          title: "Elevated errors",
          status: "investigating",
          impact: "major",
          startedAt: new Date("2026-10-28T11:00:00Z"),
          resolvedAt: null,
          updates: [],
          serviceNames: ["API"],
        },
      ],
    });
    expect(snapshot.banner.title).toBe("Elevated errors");
    expect(snapshot.activeIncidents).toHaveLength(1);
  });

  it("reports a partial outage when only some services are down", () => {
    const snapshot = buildSnapshot({
      now: new Date("2026-10-28T12:00:00Z"),
      siteName: "Acme",
      siteUrl: "",
      checkIntervalSeconds: 60,
      services: [
        service("a", "down"),
        service("b", "operational"),
      ],
      stats: [],
      incidents: [],
    });
    expect(snapshot.banner.tone).toBe("partial");
  });

  it("omits disabled services from the public list", () => {
    const snapshot = buildSnapshot({
      now: new Date("2026-10-28T12:00:00Z"),
      siteName: "Acme",
      siteUrl: "",
      checkIntervalSeconds: 60,
      services: [{ ...service("paused", "down"), enabled: false }],
      stats: [],
      incidents: [],
    });
    expect(snapshot.services).toHaveLength(0);
    expect(snapshot.banner.title).toBe("No services yet");
  });
});

function service(id: string, status: "down" | "operational") {
  return {
    id,
    name: id,
    description: null,
    groupLabel: null,
    status,
    enabled: true,
    position: 0,
    responseMs: 10,
    lastCheckedAt: new Date("2026-10-28T12:00:00Z"),
    createdAt,
  } as const;
}
