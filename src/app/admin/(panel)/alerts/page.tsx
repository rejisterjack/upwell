import { Suspense } from "react";
import {
  addDestinationAction,
  deleteDestinationAction,
  saveSettingsAction,
  toggleDestinationAction,
} from "@/app/admin/actions";
import { recentDeliveries } from "@/lib/alerts";
import { formatWhen } from "@/lib/format";
import { live } from "@/lib/live";
import { getSettings } from "@/lib/settings";
import { db } from "@/prisma/db";

const fieldClass = "flex flex-col gap-1 text-sm";
const inputClass = "rounded-md border border-line bg-background px-3 py-2";

export default function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-muted">Loading alerts…</p>}>
      <AlertsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AlertsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await live();
  const { error } = await searchParams;
  const settings = await getSettings();
  const destinations = await db.orm.public.AlertDestination.all();
  const deliveries = recentDeliveries(await db.orm.public.AlertDelivery.all(), destinations);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Alerts</h1>
      {error ? <p className="text-sm text-down">{error}</p> : null}
      <form action={saveSettingsAction} className="grid gap-3 rounded-2xl border border-line bg-card p-5 md:grid-cols-2">
        <h2 className="text-lg font-medium md:col-span-2">Status page</h2>
        <label className={fieldClass}>
          Site name
          <input className={inputClass} name="siteName" defaultValue={settings.siteName} required />
        </label>
        <label className={fieldClass}>
          Public URL
          <input className={inputClass} name="siteUrl" defaultValue={settings.siteUrl} placeholder="https://status.example.com" />
        </label>
        <label className={fieldClass}>
          Check interval (seconds)
          <input className={inputClass} name="checkIntervalSeconds" type="number" min={60} defaultValue={settings.checkIntervalSeconds} />
        </label>
        <label className={fieldClass}>
          Failures before an alert
          <input className={inputClass} name="failuresBeforeAlert" type="number" min={1} defaultValue={settings.failuresBeforeAlert} />
        </label>
        <button className="w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background" type="submit">
          Save settings
        </button>
      </form>
      <form action={addDestinationAction} className="grid gap-3 rounded-2xl border border-line bg-card p-5 md:grid-cols-2">
        <h2 className="text-lg font-medium md:col-span-2">Add a destination</h2>
        <label className={fieldClass}>
          Kind
          <select className={inputClass} name="kind" defaultValue="webhook">
            <option value="webhook">Webhook</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label className={fieldClass}>
          Email or webhook URL
          <input className={inputClass} name="target" required />
        </label>
        <button className="w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background" type="submit">
          Add destination
        </button>
      </form>
      <ul className="flex flex-col gap-3">
        {destinations.map((destination) => (
          <li key={destination.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4">
            <div>
              <p className="font-medium">{destination.target}</p>
              <p className="text-sm text-muted">
                {destination.kind} · {destination.enabled ? "enabled" : "paused"}
              </p>
            </div>
            <div className="flex gap-3">
              <form action={toggleDestinationAction}>
                <input type="hidden" name="id" value={destination.id} />
                <button className="text-sm underline" type="submit">
                  {destination.enabled ? "Pause" : "Enable"}
                </button>
              </form>
              <form action={deleteDestinationAction}>
                <input type="hidden" name="id" value={destination.id} />
                <button className="text-sm text-down underline" type="submit">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Recent deliveries</h2>
        {deliveries.length === 0 ? (
          <p className="text-muted">No alerts have been sent.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {deliveries.map((delivery) => (
              <li key={delivery.id} className="rounded-2xl border border-line bg-card px-5 py-4">
                <p className="font-medium">{delivery.serviceName}</p>
                <p className="text-sm text-muted">
                  {formatWhen(delivery.createdAt.toISOString())} · {delivery.event} · {delivery.target}
                  {delivery.kind ? ` · ${delivery.kind}` : ""} · {delivery.ok ? "Sent" : "Failed"}
                </p>
                {delivery.ok || !delivery.error ? null : (
                  <p className="mt-1 text-sm text-down">{delivery.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
