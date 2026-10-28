import { db } from "@/prisma/db";
import { assertPublicUrl, type DnsLookup } from "./urls";

export type ServiceInput = {
  name: string;
  description: string | null;
  url: string;
  method: "GET" | "HEAD";
  expectedStatus: number;
  timeoutMs: number;
  degradedAfterMs: number | null;
  enabled: boolean;
  position: number;
  groupLabel: string | null;
  maintenance: boolean;
};

export function readServiceInput(formData: FormData): ServiceInput {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!name) throw new Error("Name is required.");
  if (!url) throw new Error("URL is required.");
  const method = formData.get("method") === "HEAD" ? "HEAD" : "GET";
  const expectedStatus = clampInt(formData.get("expectedStatus"), 200, 100, 599);
  const timeoutMs = clampInt(formData.get("timeoutMs"), 8000, 1000, 30000);
  const degradedRaw = String(formData.get("degradedAfterMs") ?? "").trim();
  const degradedAfterMs = degradedRaw
    ? clampInt(degradedRaw, 1000, 1, 30000)
    : null;
  return {
    name,
    description: emptyToNull(formData.get("description")),
    url,
    method,
    expectedStatus,
    timeoutMs,
    degradedAfterMs,
    enabled: formData.get("enabled") === "on",
    position: clampInt(formData.get("position"), 0, 0, 10000),
    groupLabel: emptyToNull(formData.get("groupLabel")),
    maintenance: formData.get("maintenance") === "on",
  };
}

export async function createServiceRecord(input: ServiceInput, resolve?: DnsLookup) {
  const blocked = await assertPublicUrl(input.url, resolve);
  if (blocked) throw new Error(blocked);
  return db.orm.public.Service.create({
    name: input.name,
    description: input.description,
    url: input.url,
    method: input.method,
    expectedStatus: input.expectedStatus,
    timeoutMs: input.timeoutMs,
    degradedAfterMs: input.degradedAfterMs,
    enabled: input.enabled,
    position: input.position,
    groupLabel: input.groupLabel,
    status: input.maintenance ? "maintenance" : "unknown",
  });
}

export async function updateServiceRecord(id: string, input: ServiceInput, resolve?: DnsLookup) {
  const blocked = await assertPublicUrl(input.url, resolve);
  if (blocked) throw new Error(blocked);
  const current = await db.orm.public.Service.where((service) => service.id.eq(id)).first();
  if (!current) throw new Error("Service not found.");
  const status = input.maintenance
    ? "maintenance"
    : current.status === "maintenance"
      ? "unknown"
      : current.status;
  return db.orm.public.Service.where((service) => service.id.eq(id)).update({
    name: input.name,
    description: input.description,
    url: input.url,
    method: input.method,
    expectedStatus: input.expectedStatus,
    timeoutMs: input.timeoutMs,
    degradedAfterMs: input.degradedAfterMs,
    enabled: input.enabled,
    position: input.position,
    groupLabel: input.groupLabel,
    status,
  });
}

export async function deleteServiceRecord(id: string) {
  await db.orm.public.Service.where((service) => service.id.eq(id)).delete();
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function clampInt(value: FormDataEntryValue | string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
