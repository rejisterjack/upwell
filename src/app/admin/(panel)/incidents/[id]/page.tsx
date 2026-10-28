import { Suspense } from "react";
import { notFound } from "next/navigation";
import { updateIncidentAction } from "@/app/admin/actions";
import { formatWhen } from "@/lib/format";
import { incidentStatusLabel } from "@/lib/summary";
import { live } from "@/lib/live";
import { db } from "@/prisma/db";

const fieldClass = "flex flex-col gap-1 text-sm";
const inputClass = "rounded-md border border-line bg-background px-3 py-2";

export default function IncidentAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-muted">Loading incident…</p>}>
      <IncidentContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function IncidentContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await live();
  const { id } = await params;
  const { error } = await searchParams;
  const incident = await db.orm.public.Incident.where((row) => row.id.eq(id)).first();
  if (!incident) notFound();
  const updates = (await db.orm.public.IncidentUpdate.where((row) => row.incidentId.eq(id)).all()).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{incident.title}</h1>
      <p className="text-sm text-muted">
        {incidentStatusLabel(incident.status)} · {incident.impact}
      </p>
      {error ? <p className="text-sm text-down">{error}</p> : null}
      <ol className="flex flex-col gap-4 border-l border-line pl-5">
        {updates.map((update) => (
          <li key={update.id}>
            <p className="font-mono text-xs text-muted">
              {formatWhen(update.createdAt.toISOString())} · {incidentStatusLabel(update.status)}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{update.body}</p>
          </li>
        ))}
      </ol>
      <form action={updateIncidentAction} className="grid gap-3 rounded-2xl border border-line bg-card p-5">
        <input type="hidden" name="incidentId" value={incident.id} />
        <label className={fieldClass}>
          Update
          <textarea className={inputClass} name="body" required rows={4} />
        </label>
        <label className={fieldClass}>
          Status
          <select className={inputClass} name="status" defaultValue={incident.status}>
            <option value="investigating">Investigating</option>
            <option value="identified">Identified</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <button className="w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background" type="submit">
          Post update
        </button>
      </form>
    </>
  );
}
