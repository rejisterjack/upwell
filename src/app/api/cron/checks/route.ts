import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { runChecks } from "@/lib/checks";
import { cronAuthorized } from "@/lib/cron-auth";

export async function GET(request: Request) {
  if (!cronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await runChecks();
  if (!result.skipped) revalidateTag("status", { expire: 0 });
  return NextResponse.json({ ok: true, ...result });
}
