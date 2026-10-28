import { db } from "@/prisma/db";
import { getSettings } from "./settings";
import { buildSnapshot, type SummaryIncident, type SummaryService } from "./summary";
import type { IncidentImpact, IncidentStatus } from "./types";

export async function freshnessToken() {
  const services = await db.orm.public.Service.all();
  const incidents = await db.orm.public.Incident.all();
  const updates = await db.orm.public.IncidentUpdate.all();
  const settings = await getSettings();
  return [
    settings.siteName,
    settings.siteUrl,
    settings.checkIntervalSeconds,
    settings.failuresBeforeAlert,
    services
      .map(
        (service) =>
          `${service.id}:${service.status}:${service.updatedAt.toISOString()}:${service.lastCheckedAt?.toISOString() ?? ""}`,
      )
      .join(","),
    incidents
      .map((incident) => `${incident.id}:${incident.status}:${incident.resolvedAt?.toISOString() ?? ""}`)
      .join(","),
    updates.map((update) => update.id).join(","),
  ].join("|");
}

export async function loadSnapshot(now = new Date()) {
  const settings = await getSettings();
  const services = await db.orm.public.Service.all();
  const stats = await db.orm.public.DailyStat.all();
  const incidents = await db.orm.public.Incident.all();
  const updates = await db.orm.public.IncidentUpdate.all();
  const links = await db.orm.public.IncidentService.all();
  const serviceName = new Map(services.map((service) => [service.id, service.name]));

  const summaryServices: SummaryService[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    groupLabel: service.groupLabel,
    status: service.status,
    enabled: service.enabled,
    position: service.position,
    responseMs: service.lastResponseMs,
    lastCheckedAt: service.lastCheckedAt,
    createdAt: service.createdAt,
  }));

  const summaryIncidents: SummaryIncident[] = incidents.map((incident) => ({
    id: incident.id,
    title: incident.title,
    status: incident.status as IncidentStatus,
    impact: incident.impact as IncidentImpact,
    startedAt: incident.startedAt,
    resolvedAt: incident.resolvedAt,
    serviceNames: links
      .filter((link) => link.incidentId === incident.id)
      .map((link) => serviceName.get(link.serviceId))
      .filter((name): name is string => Boolean(name)),
    updates: updates
      .filter((update) => update.incidentId === incident.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((update) => ({
        id: update.id,
        body: update.body,
        status: update.status as IncidentStatus,
        createdAt: update.createdAt.toISOString(),
      })),
  }));

  return buildSnapshot({
    now,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    checkIntervalSeconds: settings.checkIntervalSeconds,
    services: summaryServices,
    stats: stats.map((stat) => ({
      serviceId: stat.serviceId,
      day: normalizeDay(stat.day),
      totalChecks: stat.totalChecks,
      upChecks: stat.upChecks,
      degradedChecks: stat.degradedChecks,
      downChecks: stat.downChecks,
    })),
    incidents: summaryIncidents,
  });
}

function normalizeDay(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
