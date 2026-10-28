import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicFrame } from "@/components/public-frame";
import { getPublicSnapshot } from "@/lib/cached-status";
import { live } from "@/lib/live";
import { formatWhen } from "@/lib/format";
import { incidentStatusLabel } from "@/lib/summary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await live();
  const { id } = await params;
  const snapshot = await getPublicSnapshot();
  const incident = snapshot.incidents.find((item) => item.id === id);
  const title = incident ? `${incident.title} · ${snapshot.siteName}` : snapshot.siteName;
  const description = incident?.updates.at(-1)?.body ?? "Incident timeline";
  const origin = snapshot.siteUrl.replace(/\/$/, "");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: origin ? `${origin}/incidents/${id}` : undefined,
    },
  };
}

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading incident…</p>}>
      <IncidentContent params={params} />
    </Suspense>
  );
}

async function IncidentContent({ params }: { params: Promise<{ id: string }> }) {
  await live();
  const { id } = await params;
  const snapshot = await getPublicSnapshot();
  const incident = snapshot.incidents.find((item) => item.id === id);
  if (!incident) notFound();

  return (
    <PublicFrame siteName={snapshot.siteName}>
      <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
        {incident.impact} · {incidentStatusLabel(incident.status)}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{incident.title}</h1>
      <p className="text-sm text-muted">
        Started {formatWhen(incident.startedAt)}
        {incident.resolvedAt ? ` · Resolved ${formatWhen(incident.resolvedAt)}` : ""}
      </p>
      {incident.serviceNames.length > 0 ? (
        <p className="text-sm">Affected: {incident.serviceNames.join(", ")}</p>
      ) : null}
      <ol className="flex flex-col gap-4 border-l border-line pl-5">
        {incident.updates.map((update) => (
          <li key={update.id}>
            <p className="font-mono text-xs text-muted">
              {formatWhen(update.createdAt)} · {incidentStatusLabel(update.status)}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{update.body}</p>
          </li>
        ))}
      </ol>
    </PublicFrame>
  );
}
