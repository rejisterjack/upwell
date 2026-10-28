import { db } from "@/prisma/db";

export const SETTING_ID = "default";

export async function getSettings() {
  const existing = await db.orm.public.Setting.where((setting) =>
    setting.id.eq(SETTING_ID),
  ).first();
  if (existing) return existing;
  return db.orm.public.Setting.create({
    id: SETTING_ID,
    siteName: process.env.SITE_NAME?.trim() || "Status",
    siteUrl: "",
    checkIntervalSeconds: 86_400,
    failuresBeforeAlert: 2,
  });
}

export function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Public URL must be an http or https address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Public URL must be an http or https address.");
  }
  if (url.username || url.password) {
    throw new Error("Public URL cannot include credentials.");
  }
  return url.origin;
}

export async function updateSettings(input: {
  siteName: string;
  siteUrl: string;
  checkIntervalSeconds: number;
  failuresBeforeAlert: number;
}) {
  const current = await getSettings();
  return db.orm.public.Setting.where((setting) => setting.id.eq(current.id)).update({
    siteName: input.siteName.trim() || "Status",
    siteUrl: normalizeSiteUrl(input.siteUrl),
    checkIntervalSeconds: Math.max(60, Math.round(input.checkIntervalSeconds)),
    failuresBeforeAlert: Math.max(1, Math.round(input.failuresBeforeAlert)),
  });
}
