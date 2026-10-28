import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicFrame } from "@/components/public-frame";
import { ServiceList } from "@/components/service-list";
import { StatusBanner } from "@/components/status-banner";
import { getPublicSnapshot } from "@/lib/cached-status";
import { live } from "@/lib/live";
import { formatWhen } from "@/lib/format";
import { incidentStatusLabel } from "@/lib/summary";

export async function generateMetadata(): Promise<Metadata> {
  await live();
  const snapshot = await getPublicSnapshot();
  const title = `${snapshot.siteName} status`;
  const description = snapshot.banner.detail;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: snapshot.siteUrl || undefined,
    },
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading status…</p>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await live();
  const snapshot = await getPublicSnapshot();
  return (
    <PublicFrame siteName={snapshot.siteName}>
      <StatusBanner
        banner={snapshot.banner}
        delayed={snapshot.delayed}
        updatedAt={snapshot.updatedAt ? `Updated ${formatWhen(snapshot.updatedAt)}` : null}
      />
      {snapshot.activeIncidents.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Active incidents</h2>
          <ul className="flex flex-col gap-3">
            {snapshot.activeIncidents.map((incident) => (
              <li key={incident.id} className="rounded-2xl border border-line bg-card px-5 py-4">
                <a className="text-lg font-medium" href={`/incidents/${incident.id}`}>
                  {incident.title}
                </a>
                <p className="mt-1 text-sm text-muted">
                  {incidentStatusLabel(incident.status)} · {formatWhen(incident.startedAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ServiceList groups={snapshot.groups} />
    </PublicFrame>
  );
}
