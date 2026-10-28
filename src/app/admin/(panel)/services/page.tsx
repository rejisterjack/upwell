import { Suspense } from "react";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
  checkNowAction,
} from "@/app/admin/actions";
import { live } from "@/lib/live";
import { serviceStatusLabel } from "@/lib/summary";
import { db } from "@/prisma/db";

const fieldClass = "flex flex-col gap-1 text-sm";
const inputClass = "rounded-md border border-line bg-background px-3 py-2";

export default function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-muted">Loading services…</p>}>
      <ServicesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ServicesContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await live();
  const { error } = await searchParams;
  const services = (await db.orm.public.Service.all()).sort(
    (a, b) => a.position - b.position || a.name.localeCompare(b.name),
  );

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
      {error ? <p className="text-sm text-down">{error}</p> : null}
      <form action={createServiceAction} className="grid gap-3 rounded-2xl border border-line bg-card p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-medium">Add a service</h2>
        <label className={fieldClass}>
          Name
          <input className={inputClass} name="name" required />
        </label>
        <label className={fieldClass}>
          URL
          <input className={inputClass} name="url" type="url" required placeholder="https://example.com" />
        </label>
        <label className={fieldClass}>
          Description
          <input className={inputClass} name="description" />
        </label>
        <label className={fieldClass}>
          Group
          <input className={inputClass} name="groupLabel" />
        </label>
        <label className={fieldClass}>
          Method
          <select className={inputClass} name="method" defaultValue="GET">
            <option>GET</option>
            <option>HEAD</option>
          </select>
        </label>
        <label className={fieldClass}>
          Expected status
          <input className={inputClass} name="expectedStatus" type="number" defaultValue={200} />
        </label>
        <label className={fieldClass}>
          Timeout (ms)
          <input className={inputClass} name="timeoutMs" type="number" defaultValue={8000} />
        </label>
        <label className={fieldClass}>
          Degraded after (ms)
          <input className={inputClass} name="degradedAfterMs" type="number" />
        </label>
        <label className={fieldClass}>
          Sort order
          <input className={inputClass} name="position" type="number" defaultValue={0} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="enabled" type="checkbox" defaultChecked />
          Enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="maintenance" type="checkbox" />
          Maintenance
        </label>
        <button className="rounded-full bg-foreground px-4 py-2 text-sm text-background md:col-span-2 w-fit" type="submit">
          Add service
        </button>
      </form>
      <ul className="flex flex-col gap-4">
        {services.map((service) => (
          <li key={service.id} className="rounded-2xl border border-line bg-card p-5">
            <p className="mb-3 text-sm text-muted">{serviceStatusLabel(service.status)}</p>
            <form action={updateServiceAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={service.id} />
              <label className={fieldClass}>
                Name
                <input className={inputClass} name="name" defaultValue={service.name} required />
              </label>
              <label className={fieldClass}>
                URL
                <input className={inputClass} name="url" type="url" defaultValue={service.url} required />
              </label>
              <label className={fieldClass}>
                Description
                <input className={inputClass} name="description" defaultValue={service.description ?? ""} />
              </label>
              <label className={fieldClass}>
                Group
                <input className={inputClass} name="groupLabel" defaultValue={service.groupLabel ?? ""} />
              </label>
              <label className={fieldClass}>
                Method
                <select className={inputClass} name="method" defaultValue={service.method}>
                  <option>GET</option>
                  <option>HEAD</option>
                </select>
              </label>
              <label className={fieldClass}>
                Expected status
                <input className={inputClass} name="expectedStatus" type="number" defaultValue={service.expectedStatus} />
              </label>
              <label className={fieldClass}>
                Timeout (ms)
                <input className={inputClass} name="timeoutMs" type="number" defaultValue={service.timeoutMs} />
              </label>
              <label className={fieldClass}>
                Degraded after (ms)
                <input className={inputClass} name="degradedAfterMs" type="number" defaultValue={service.degradedAfterMs ?? ""} />
              </label>
              <label className={fieldClass}>
                Sort order
                <input className={inputClass} name="position" type="number" defaultValue={service.position} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="enabled" type="checkbox" defaultChecked={service.enabled} />
                Enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="maintenance" type="checkbox" defaultChecked={service.status === "maintenance"} />
                Maintenance
              </label>
              <button className="rounded-full bg-foreground px-4 py-2 text-sm text-background w-fit" type="submit">
                Save
              </button>
            </form>
            <div className="mt-3 flex gap-3">
              <form action={checkNowAction}>
                <input type="hidden" name="serviceId" value={service.id} />
                <button className="text-sm underline" type="submit">
                  Check now
                </button>
              </form>
              <form action={deleteServiceAction}>
                <input type="hidden" name="id" value={service.id} />
                <button className="text-sm text-down underline" type="submit">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
