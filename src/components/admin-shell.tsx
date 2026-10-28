import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { alertsConfigured } from "@/lib/alerts";
import { requireAdmin } from "@/lib/auth";
import { live } from "@/lib/live";
import { db } from "@/prisma/db";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  await live();
  await requireAdmin();
  const destinations = await db.orm.public.AlertDestination.all();
  const warning = alertsConfigured({ destinations });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-semibold tracking-tight">Upwell admin</p>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/admin">Checks</Link>
          <Link href="/admin/services">Services</Link>
          <Link href="/admin/incidents">Incidents</Link>
          <Link href="/admin/alerts">Alerts</Link>
          <Link href="/" className="text-muted">
            Public page
          </Link>
          <form action={logoutAction}>
            <button className="text-muted" type="submit">
              Log out
            </button>
          </form>
        </nav>
      </header>
      {warning ? (
        <p className="mb-6 rounded-xl border border-line bg-card px-4 py-3 text-sm">{warning}</p>
      ) : null}
      <div className="flex flex-1 flex-col gap-8">{children}</div>
    </div>
  );
}
