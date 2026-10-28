"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireAdmin } from "@/lib/auth";
import { runChecks } from "@/lib/checks";
import {
  addIncidentUpdate,
  createIncidentRecord,
  readIncidentImpact,
  readIncidentStatus,
} from "@/lib/incidents";
import { createServiceRecord, deleteServiceRecord, readServiceInput, updateServiceRecord } from "@/lib/services";
import { updateSettings } from "@/lib/settings";
import { db } from "@/prisma/db";
import { assertPublicUrl } from "@/lib/urls";

export async function loginAction(formData: FormData) {
  await login(formData);
}

export async function logoutAction() {
  await logout();
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  try {
    await createServiceRecord(readServiceInput(formData));
  } catch (error) {
    redirect(`/admin/services?error=${encodeURIComponent(messageOf(error))}`);
  }
  updateTag("status");
  redirect("/admin/services");
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  try {
    await updateServiceRecord(id, readServiceInput(formData));
  } catch (error) {
    redirect(`/admin/services?error=${encodeURIComponent(messageOf(error))}`);
  }
  updateTag("status");
  redirect("/admin/services");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  await deleteServiceRecord(String(formData.get("id") ?? ""));
  updateTag("status");
  redirect("/admin/services");
}

export async function checkNowAction(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId") ?? "");
  await runChecks(serviceId ? { serviceId } : {});
  updateTag("status");
  redirect(serviceId ? "/admin/services" : "/admin");
}

export async function createIncidentAction(formData: FormData) {
  await requireAdmin();
  try {
    await createIncidentRecord({
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
      status: readIncidentStatus(formData.get("status")),
      impact: readIncidentImpact(formData.get("impact")),
      serviceIds: formData.getAll("serviceId").map(String),
    });
  } catch (error) {
    redirect(`/admin/incidents?error=${encodeURIComponent(messageOf(error))}`);
  }
  updateTag("status");
  redirect("/admin/incidents");
}

export async function updateIncidentAction(formData: FormData) {
  await requireAdmin();
  const incidentId = String(formData.get("incidentId") ?? "");
  try {
    await addIncidentUpdate({
      incidentId,
      body: String(formData.get("body") ?? ""),
      status: readIncidentStatus(formData.get("status")),
    });
  } catch (error) {
    redirect(`/admin/incidents/${incidentId}?error=${encodeURIComponent(messageOf(error))}`);
  }
  updateTag("status");
  redirect(`/admin/incidents/${incidentId}`);
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  try {
    await updateSettings({
      siteName: String(formData.get("siteName") ?? ""),
      siteUrl: String(formData.get("siteUrl") ?? ""),
      checkIntervalSeconds: Number(formData.get("checkIntervalSeconds") ?? 86400),
      failuresBeforeAlert: Number(formData.get("failuresBeforeAlert") ?? 2),
    });
  } catch (error) {
    redirect(`/admin/alerts?error=${encodeURIComponent(messageOf(error))}`);
  }
  updateTag("status");
  redirect("/admin/alerts");
}

export async function addDestinationAction(formData: FormData) {
  await requireAdmin();
  const kind = formData.get("kind") === "webhook" ? "webhook" : "email";
  const target = String(formData.get("target") ?? "").trim();
  if (!target) redirect("/admin/alerts?error=A%20destination%20is%20required.");
  if (kind === "email" && !target.includes("@")) {
    redirect("/admin/alerts?error=Enter%20an%20email%20address.");
  }
  if (kind === "webhook") {
    const blocked = await assertPublicUrl(target);
    if (blocked) redirect(`/admin/alerts?error=${encodeURIComponent(blocked)}`);
  }
  await db.orm.public.AlertDestination.create({ kind, target, enabled: true });
  redirect("/admin/alerts");
}

export async function deleteDestinationAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.orm.public.AlertDestination.where((row) => row.id.eq(id)).delete();
  }
  redirect("/admin/alerts");
}

export async function toggleDestinationAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const destination = await db.orm.public.AlertDestination.where((row) => row.id.eq(id)).first();
  if (destination) {
    await db.orm.public.AlertDestination.where((row) => row.id.eq(id)).update({
      enabled: !destination.enabled,
    });
  }
  redirect("/admin/alerts");
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
