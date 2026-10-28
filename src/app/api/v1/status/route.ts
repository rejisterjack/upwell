import { NextResponse } from "next/server";
import { getPublicSnapshot } from "@/lib/cached-status";
import { live } from "@/lib/live";

export async function GET() {
  await live();
  const snapshot = await getPublicSnapshot();
  return NextResponse.json({
    status: snapshot.banner.tone,
    title: snapshot.banner.title,
    delayed: snapshot.delayed,
    updatedAt: snapshot.updatedAt,
    services: snapshot.services.map((service) => ({
      name: service.name,
      status: service.status,
      group: service.groupLabel,
      uptime90d: service.uptimePercent,
      responseMs: service.responseMs,
    })),
    incidents: snapshot.activeIncidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      status: incident.status,
      impact: incident.impact,
      startedAt: incident.startedAt,
    })),
  });
}
