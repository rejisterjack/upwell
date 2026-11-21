import { Suspense } from "react";
import { checkNowAction } from "@/app/admin/actions";
import { latestChecks } from "@/lib/checks";
import { isDelayed } from "@/lib/summary";
import { serviceStatusLabel } from "@/lib/summary";
import { formatMs, formatWhen } from "@/lib/format";
import { db } from "@/prisma/db";
import { getSettings } from "@/lib/settings";
import { live } from "@/lib/live";

export default function AdminHomePage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading checks…</p>}>
      <Checks />
    </Suspense>
  );
}

async function Checks() {
  await live();
  const settings = await getSettings();
  const latest = new Map((await latestChecks()).map((check) => [check.serviceId, check]));
  const services = (await db.orm.public.Service.all()).sort(
    (a, b) => a.position - b.position || a.name.localeCompare(b.name),
  );
  const delayed = isDelayed(
    services.map((service) => ({
      enabled: service.enabled,
      lastCheckedAt: service.lastCheckedAt,
      createdAt: service.createdAt,
    })),
    new Date(),
    settings.checkIntervalSeconds,
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Checks</h1>
        <form action={checkNowAction}>
          <button className="rounded-full bg-foreground px-4 py-2 text-sm text-background" type="submit">
            Check all
          </button>
        </form>
      </div>
      {delayed ? (
        <p className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
          Checks are older than three intervals. The public page will not claim everything is operational.
        </p>
      ) : null}
      {services.length === 0 ? (
        <p className="text-muted">No services yet. Add one to start probing.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service) => {
            const check = latest.get(service.id);
            return (
            <li key={service.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{service.name}</p>
                <p className="font-mono text-xs text-muted">
                  {serviceStatusLabel(service.status)} · {formatMs(service.lastResponseMs)} ·{" "}
                  {formatWhen(service.lastCheckedAt?.toISOString() ?? null)}
                  {check?.statusCode != null ? ` · HTTP ${check.statusCode}` : ""}
                </p>
                {check?.error ? (
                  <p className="mt-1 text-sm break-words text-down">{check.error}</p>
                ) : null}
              </div>
              <form action={checkNowAction}>
                <input type="hidden" name="serviceId" value={service.id} />
                <button className="rounded-full border border-line px-3 py-1.5 text-sm" type="submit">
                  Check now
                </button>
              </form>
            </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
