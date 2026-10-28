import { Suspense } from "react";
import { PublicFrame } from "@/components/public-frame";
import { getPublicSnapshot } from "@/lib/cached-status";
import { live } from "@/lib/live";
import { formatWhen } from "@/lib/format";
import { incidentStatusLabel } from "@/lib/summary";

export default function IncidentsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading incidents…</p>}>
      <IncidentsContent />
    </Suspense>
  );
}

async function IncidentsContent() {
  await live();
  const snapshot = await getPublicSnapshot();
  return (
    <PublicFrame siteName={snapshot.siteName}>
      <h1 className="text-3xl font-semibold tracking-tight">Incidents</h1>
      {snapshot.incidents.length === 0 ? (
        <p className="text-muted">No incidents have been published.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {snapshot.incidents.map((incident) => (
            <li key={incident.id} className="rounded-2xl border border-line bg-card px-5 py-4">
              <a className="text-lg font-medium" href={`/incidents/${incident.id}`}>
                {incident.title}
              </a>
              <p className="mt-1 text-sm text-muted">
                {incidentStatusLabel(incident.status)} · {incident.impact} ·{" "}
                {formatWhen(incident.startedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PublicFrame>
  );
}
