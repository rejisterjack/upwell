import { createHmac } from "node:crypto";
import { db } from "@/prisma/db";
import { assertPublicUrl, type DnsLookup } from "./urls";

export type AlertEvent = {
  event: "down" | "recovery";
  serviceName: string;
  url: string;
  status: string;
  statusCode: number | null;
  error: string | null;
  responseMs: number | null;
  statusPageUrl: string;
  checkedAt: string;
};

export function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function alertText(event: AlertEvent): string {
  const verb = event.event === "down" ? "is down" : "has recovered";
  return [
    `${event.serviceName} ${verb}.`,
    `URL: ${event.url}`,
    `Status: ${event.status}`,
    event.statusCode != null ? `HTTP: ${event.statusCode}` : null,
    event.responseMs != null ? `Response: ${event.responseMs} ms` : null,
    event.error ? `Error: ${event.error}` : null,
    `When: ${event.checkedAt}`,
    event.statusPageUrl ? `Status page: ${event.statusPageUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function postWebhook(
  target: string,
  event: AlertEvent,
  fetchImpl: typeof fetch = fetch,
  resolve?: DnsLookup,
): Promise<void> {
  const blocked = await assertPublicUrl(target, resolve);
  if (blocked) throw new Error(blocked);
  const body = JSON.stringify(event);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "Upwell/0.1",
  };
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) headers["X-Upwell-Signature"] = signBody(body, secret);

  let lastError = "Webhook request failed.";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchImpl(target, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return;
      lastError = `Webhook responded ${response.status}.`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }
  throw new Error(lastError);
}

export async function sendEmail(target: string, event: AlertEvent, fetchImpl: typeof fetch = fetch) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM;
  if (!key || !from) {
    throw new Error("Email alerts need RESEND_API_KEY and ALERT_EMAIL_FROM.");
  }
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [target],
      subject: `${event.serviceName} ${event.event === "down" ? "is down" : "recovered"}`,
      text: alertText(event),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Email provider responded ${response.status}.`);
}

export async function dispatchAlerts(
  event: AlertEvent,
  fetchImpl: typeof fetch = fetch,
  resolve?: DnsLookup,
) {
  const destinations = await db.orm.public.AlertDestination.where((destination) =>
    destination.enabled.eq(true),
  ).all();

  for (const destination of destinations) {
    try {
      if (destination.kind === "email") await sendEmail(destination.target, event, fetchImpl);
      else await postWebhook(destination.target, event, fetchImpl, resolve);
      await recordDelivery(destination.id, event, true, null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Alert failed.";
      await recordDelivery(destination.id, event, false, message.slice(0, 300));
    }
  }
}

async function recordDelivery(
  destinationId: string,
  event: AlertEvent,
  ok: boolean,
  error: string | null,
) {
  await db.orm.public.AlertDelivery.create({
    destinationId,
    event: event.event,
    serviceName: event.serviceName,
    ok,
    error,
  });
}

const RECENT_DELIVERY_LIMIT = 50;

export type DeliveryInput = {
  id: string;
  destinationId: string;
  event: string;
  serviceName: string;
  ok: boolean;
  error: string | null;
  createdAt: Date;
};

export type DestinationRef = {
  id: string;
  kind: string;
  target: string;
};

export type RecentDelivery = DeliveryInput & {
  target: string;
  kind: string;
};

export function recentDeliveries(
  deliveries: DeliveryInput[],
  destinations: DestinationRef[],
): RecentDelivery[] {
  const byId = new Map(destinations.map((destination) => [destination.id, destination]));
  return deliveries
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, RECENT_DELIVERY_LIMIT)
    .map((delivery) => {
      const destination = byId.get(delivery.destinationId);
      return {
        ...delivery,
        target: destination?.target ?? "Removed destination",
        kind: destination?.kind ?? "",
      };
    });
}

export function alertsConfigured(input: {
  destinations: { kind: string; enabled: boolean }[];
}): string | null {
  const enabled = input.destinations.filter((destination) => destination.enabled);
  if (enabled.length === 0) {
    return "No alert destination is configured. Downtime will show on the status page, and nobody will be notified.";
  }
  if (
    enabled.some((destination) => destination.kind === "email") &&
    (!process.env.RESEND_API_KEY || !process.env.ALERT_EMAIL_FROM)
  ) {
    return "An email destination is saved, but RESEND_API_KEY or ALERT_EMAIL_FROM is missing.";
  }
  return null;
}
