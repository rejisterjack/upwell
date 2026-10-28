import { formatMs, formatUptime } from "@/lib/format";
import { serviceStatusLabel } from "@/lib/summary";
import type { ServiceGroup } from "@/lib/types";
import { UptimeGrid } from "./uptime-grid";

export function ServiceList({ groups }: { groups: ServiceGroup[] }) {
  if (groups.length === 0 || groups.every((group) => group.services.length === 0)) {
    return (
      <section className="rounded-2xl border border-dashed border-line bg-card px-6 py-10">
        <h2 className="text-xl font-semibold">Nothing is being monitored</h2>
        <p className="mt-2 max-w-xl text-muted">
          The public page is ready. Add a service URL in the admin and run a check.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="mb-3 font-mono text-xs tracking-[0.16em] text-muted uppercase">
            {group.label}
          </h2>
          <ul className="flex flex-col gap-3">
            {group.services.map((service) => (
              <li key={service.id} className="rounded-2xl border border-line bg-card px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium">{service.name}</h3>
                    {service.description ? (
                      <p className="mt-1 text-sm text-muted">{service.description}</p>
                    ) : null}
                  </div>
                  <p className="pill font-medium" data-status={service.status}>
                    {serviceStatusLabel(service.status)}
                  </p>
                </div>
                <div className="mt-4">
                  <UptimeGrid days={service.days} />
                </div>
                <p className="mt-3 font-mono text-xs text-muted">
                  {formatUptime(service.uptimePercent)} uptime · {formatMs(service.responseMs)} response
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
