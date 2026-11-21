import type { Metadata } from "next";
import Link from "next/link";
import { PublicFrame } from "@/components/public-frame";

export const metadata: Metadata = {
  title: "Page not found · Upwell",
  description: "That page is not on this status page.",
};

export default function NotFound() {
  const siteName = process.env.SITE_NAME?.trim() || "Status";
  return (
    <PublicFrame siteName={siteName}>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted">That page is not on this status page.</p>
      <p>
        <Link href="/">Back to status</Link>
      </p>
    </PublicFrame>
  );
}
