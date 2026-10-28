import type {
  Banner,
  IncidentImpact,
  IncidentStatus,
  IncidentView,
  PublicSnapshot,
  ServiceGroup,
  ServiceState,
  ServiceView,
} from "./types";
import { buildDays, dayExists, uptimePercent, type DayStat } from "./uptime";

export type SummaryService = {
  id: string;
  name: string;
  description: string | null;
  groupLabel: string | null;
  status: ServiceState;
  enabled: boolean;
  position: number;
  responseMs: number | null;
  lastCheckedAt: Date | null;
  createdAt: Date;
};

export type SummaryIncident = {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  startedAt: Date;
  resolvedAt: Date | null;
  updates: IncidentView["updates"];
  serviceNames: string[];
};

const IMPACT_RANK: Record<IncidentImpact, number> = {
  critical: 4,
  major: 3,
  minor: 2,
  maintenance: 1,
};

export function isDelayed(
  services: Pick<SummaryService, "enabled" | "lastCheckedAt" | "createdAt">[],
  now: Date,
  intervalSeconds: number,
): boolean {
  const enabled = services.filter((service) => service.enabled);
  if (enabled.length === 0) return false;
  const newest = enabled.reduce<Date | null>((latest, service) => {
    if (!service.lastCheckedAt) return latest;
    if (!latest || service.lastCheckedAt > latest) return service.lastCheckedAt;
    return latest;
  }, null);
  const limit = Math.max(60, intervalSeconds) * 3 * 1000;
  if (!newest) {
    const oldest = enabled.reduce(
      (earliest, service) => (service.createdAt < earliest ? service.createdAt : earliest),
      enabled[0]!.createdAt,
    );
    return now.getTime() - oldest.getTime() > limit;
  }
  return now.getTime() - newest.getTime() > limit;
}

export function bannerFor(
  services: Pick<SummaryService, "status" | "enabled">[],
  incidents: Pick<SummaryIncident, "title" | "status" | "impact">[],
  delayed: boolean,
): Banner {
  const open = incidents
    .filter((incident) => incident.status !== "resolved")
    .sort((a, b) => IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact]);
  const active = services.filter((service) => service.enabled);
  const monitored = active.filter((service) => service.status !== "maintenance");
  const down = monitored.filter((service) => service.status === "down");
  const degraded = monitored.filter((service) => service.status === "degraded");

  let banner: Banner;
  if (open[0]) {
    const lead = open[0];
    banner = {
      tone:
        lead.impact === "maintenance"
          ? "maintenance"
          : lead.impact === "minor"
            ? "degraded"
            : "major",
      title: lead.title,
      detail: incidentStatusLabel(lead.status),
    };
  } else if (active.length === 0) {
    banner = {
      tone: "unknown",
      title: "No services yet",
      detail: "Add a URL in the admin to start reporting status.",
    };
  } else if (monitored.length === 0) {
    banner = {
      tone: "maintenance",
      title: "Under maintenance",
      detail: "Every service is in a maintenance window.",
    };
  } else if (down.length === monitored.length) {
    banner = {
      tone: "major",
      title: "Major outage",
      detail: "All monitored services are down.",
    };
  } else if (down.length > 0) {
    banner = {
      tone: "partial",
      title: "Partial outage",
      detail: `${down.length} of ${monitored.length} services are down.`,
    };
  } else if (degraded.length > 0) {
    banner = {
      tone: "degraded",
      title: "Degraded performance",
      detail: `${degraded.length} of ${monitored.length} services are slow.`,
    };
  } else if (monitored.every((service) => service.status === "unknown")) {
    banner = {
      tone: "unknown",
      title: "Awaiting first check",
      detail: "Checks have not completed yet.",
    };
  } else {
    banner = {
      tone: "operational",
      title: "All systems operational",
      detail: "Every monitored service is responding.",
    };
  }

  if (delayed && (banner.tone === "operational" || banner.tone === "unknown")) {
    return {
      tone: "delayed",
      title: "Status delayed",
      detail:
        "The latest checks are older than expected. This page will not show a stale all-clear.",
    };
  }
  return banner;
}

export function groupServices(services: ServiceView[]): ServiceGroup[] {
  const groups: ServiceGroup[] = [];
  for (const service of services) {
    const label = service.groupLabel?.trim() || "Services";
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.services.push(service);
    else groups.push({ label, services: [service] });
  }
  return groups;
}

export function buildSnapshot(input: {
  now: Date;
  siteName: string;
  siteUrl: string;
  checkIntervalSeconds: number;
  services: SummaryService[];
  stats: (DayStat & { serviceId: string })[];
  incidents: SummaryIncident[];
}): PublicSnapshot {
  const listed = input.services.filter((service) => service.enabled);
  const delayed = isDelayed(listed, input.now, input.checkIntervalSeconds);
  const services = listed
    .slice()
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
    .map((service) => {
      const stats = input.stats.filter((stat) => stat.serviceId === service.id);
      const days = buildDays(input.now, service.createdAt, stats);
      const counted = stats.filter(
        (stat) =>
          dayExists(service.createdAt, stat.day) && days.some((day) => day.date === stat.day),
      );
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        groupLabel: service.groupLabel,
        status: service.status,
        enabled: service.enabled,
        uptimePercent: uptimePercent(counted),
        responseMs: service.responseMs,
        lastCheckedAt: service.lastCheckedAt?.toISOString() ?? null,
        days,
      } satisfies ServiceView;
    });

  const incidents = input.incidents
    .slice()
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .map((incident) => ({
      ...incident,
      startedAt: incident.startedAt.toISOString(),
      resolvedAt: incident.resolvedAt?.toISOString() ?? null,
    }));

  const updatedAt = listed.reduce<Date | null>((latest, service) => {
    if (!service.lastCheckedAt) return latest;
    if (!latest || service.lastCheckedAt > latest) return service.lastCheckedAt;
    return latest;
  }, null);

  return {
    siteName: input.siteName,
    siteUrl: input.siteUrl,
    banner: bannerFor(listed, input.incidents, delayed),
    delayed,
    updatedAt: updatedAt?.toISOString() ?? null,
    services,
    groups: groupServices(services),
    activeIncidents: incidents.filter((incident) => incident.status !== "resolved"),
    incidents,
  };
}

export function incidentStatusLabel(status: IncidentStatus): string {
  switch (status) {
    case "investigating":
      return "Investigating";
    case "identified":
      return "Identified";
    case "monitoring":
      return "Monitoring";
    case "resolved":
      return "Resolved";
  }
}

export function serviceStatusLabel(status: ServiceState): string {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    case "maintenance":
      return "Maintenance";
    case "unknown":
      return "Unknown";
  }
}
