import { Suspense } from "react";
import Link from "next/link";
import { createIncidentAction } from "@/app/admin/actions";
import { formatWhen } from "@/lib/format";
import { incidentStatusLabel } from "@/lib/summary";
import { live } from "@/lib/live";
import { db } from "@/prisma/db";

const fieldClass = "flex flex-col gap-1 text-sm";
const inputClass = "rounded-md border border-line bg-background px-3 py-2";

export default function IncidentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-muted">Loading incidents…</p>}>
      <IncidentsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function IncidentsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await live();
  const { error } = await searchParams;
  const services = await db.orm.public.Service.all();
  const incidents = (await db.orm.public.Incident.all()).sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
  );

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Incidents</h1>
      {error ? <p className="text-sm text-down">{error}</p> : null}
      <form action={createIncidentAction} className="grid gap-3 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-lg font-medium">Publish an incident</h2>
        <label className={fieldClass}>
          Title
          <input className={inputClass} name="title" required />
        </label>
        <label className={fieldClass}>
          Update
          <textarea className={inputClass} name="body" required rows={4} />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={fieldClass}>
            Status
            <select className={inputClass} name="status" defaultValue="investigating">
              <option value="investigating">Investigating</option>
              <option value="identified">Identified</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
          <label className={fieldClass}>
            Impact
            <select className={inputClass} name="impact" defaultValue="major">
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
        </div>
        {services.length > 0 ? (
          <fieldset className="flex flex-col gap-2 text-sm">
            <legend>Affected services</legend>
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2">
                <input type="checkbox" name="serviceId" value={service.id} />
                {service.name}
              </label>
            ))}
          </fieldset>
        ) : null}
        <button className="w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background" type="submit">
          Publish incident
        </button>
      </form>
      <ul className="flex flex-col gap-3">
        {incidents.map((incident) => (
          <li key={incident.id}>
            <Link className="font-medium" href={`/admin/incidents/${incident.id}`}>
              {incident.title}
            </Link>
            <p className="text-sm text-muted">
              {incidentStatusLabel(incident.status)} · {formatWhen(incident.startedAt.toISOString())}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
