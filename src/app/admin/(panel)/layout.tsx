import { Suspense } from "react";
import { AdminShell } from "@/components/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading admin…</p>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
