import { db } from "@/prisma/db";
import type { IncidentImpact, IncidentStatus } from "./types";

const STATUSES = new Set<IncidentStatus>([
  "investigating",
  "identified",
  "monitoring",
  "resolved",
]);
const IMPACTS = new Set<IncidentImpact>(["minor", "major", "critical", "maintenance"]);

export function readIncidentStatus(value: FormDataEntryValue | null): IncidentStatus {
  const status = String(value ?? "investigating");
  if (!STATUSES.has(status as IncidentStatus)) return "investigating";
  return status as IncidentStatus;
}

export function readIncidentImpact(value: FormDataEntryValue | null): IncidentImpact {
  const impact = String(value ?? "major");
  if (!IMPACTS.has(impact as IncidentImpact)) return "major";
  return impact as IncidentImpact;
}

export async function createIncidentRecord(input: {
  title: string;
  body: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  serviceIds: string[];
}) {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) throw new Error("Title is required.");
  if (!body) throw new Error("The first update is required.");
  const services = await db.orm.public.Service.all();
  const allowed = new Set(services.map((service) => service.id));
  const serviceIds = input.serviceIds.filter((id) => allowed.has(id));

  return db.transaction(async (tx) => {
    const incident = await tx.orm.public.Incident.create({
      title,
      status: input.status,
      impact: input.impact,
      startedAt: new Date(),
      resolvedAt: input.status === "resolved" ? new Date() : null,
    });
    await tx.orm.public.IncidentUpdate.create({
      incidentId: incident.id,
      body,
      status: input.status,
    });
    for (const serviceId of serviceIds) {
      await tx.orm.public.IncidentService.create({
        incidentId: incident.id,
        serviceId,
      });
    }
    return incident;
  });
}

export async function addIncidentUpdate(input: {
  incidentId: string;
  body: string;
  status: IncidentStatus;
}) {
  const body = input.body.trim();
  if (!body) throw new Error("Update text is required.");
  const incident = await db.orm.public.Incident.where((row) =>
    row.id.eq(input.incidentId),
  ).first();
  if (!incident) throw new Error("Incident not found.");

  return db.transaction(async (tx) => {
    const update = await tx.orm.public.IncidentUpdate.create({
      incidentId: input.incidentId,
      body,
      status: input.status,
    });
    await tx.orm.public.Incident.where((row) => row.id.eq(input.incidentId)).update({
      status: input.status,
      resolvedAt:
        input.status === "resolved" ? incident.resolvedAt ?? new Date() : null,
    });
    return update;
  });
}
