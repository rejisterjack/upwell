import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { dispatchAlerts } from "@/lib/alerts";
import { acquireCheckLock, releaseCheckLock, runChecks } from "@/lib/checks";
import { recordAttempt, tooManyAttempts } from "@/lib/auth";
import { createIncidentRecord } from "@/lib/incidents";
import { createServiceRecord } from "@/lib/services";
import { loadSnapshot } from "@/lib/status-data";
import { db } from "@/prisma/db";

const ready = Boolean(process.env.DATABASE_URL);
const pool = ready ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

describe.skipIf(!ready)("status round trip", () => {
  beforeAll(async () => {
    await pool?.query(
      'TRUNCATE "Service", "Incident", "AlertDestination", "LoginAttempt", "Setting" CASCADE',
    );
  });

  afterAll(async () => {
    await pool?.query(
      'TRUNCATE "Service", "Incident", "AlertDestination", "LoginAttempt", "Setting" CASCADE',
    );
    await pool?.end();
    await db.close();
  });

  const resolvePublic = async () => ["93.184.216.34"];

  it("stores a check and reads it back on the public summary", async () => {
    const service = await createServiceRecord({
      name: "Example",
      description: null,
      url: "https://example.com",
      method: "GET",
      expectedStatus: 200,
      timeoutMs: 8000,
      degradedAfterMs: null,
      enabled: true,
      position: 1,
      groupLabel: null,
      maintenance: false,
    }, resolvePublic);

    const result = await runChecks({
      serviceId: service.id,
      fetchImpl: async () => new Response("ok", { status: 200 }),
      resolve: resolvePublic,
    });
    expect(result.skipped).toBe(false);
    expect(result.checked).toBe(1);

    const snapshot = await loadSnapshot();
    const row = snapshot.services.find((item) => item.id === service.id);
    expect(row?.status).toBe("operational");
    expect(row?.responseMs).not.toBeNull();
    expect(row?.days.some((day) => day.tone === "up")).toBe(true);
  });

  it("records a failed webhook without losing the incident", async () => {
    const incident = await createIncidentRecord({
      title: "Webhook outage",
      body: "Investigating.",
      status: "investigating",
      impact: "minor",
      serviceIds: [],
    });
    await db.orm.public.AlertDestination.create({
      kind: "webhook",
      target: "https://alerts.example.com/hook",
      enabled: true,
    });

    await expect(
      dispatchAlerts(
        {
          event: "down",
          serviceName: "Example",
          url: "https://example.com",
          status: "down",
          statusCode: 500,
          error: "Unexpected status 500",
          responseMs: 40,
          statusPageUrl: "https://status.example.com",
          checkedAt: new Date().toISOString(),
        },
        async () => {
          throw new Error("network down");
        },
        resolvePublic,
      ),
    ).resolves.toBeUndefined();

    const saved = await db.orm.public.Incident.where((row) => row.id.eq(incident.id)).first();
    const delivery = await db.orm.public.AlertDelivery.first();
    expect(saved?.title).toBe("Webhook outage");
    expect(delivery?.ok).toBe(false);
  });

  it("rate limits repeated login failures", async () => {
    const ip = "203.0.113.50";
    for (let attempt = 0; attempt < 8; attempt += 1) await recordAttempt(ip);
    expect(await tooManyAttempts(ip)).toBe(true);
  });

  it("lets only one check run hold the lock", async () => {
    const owner = await acquireCheckLock();
    expect(owner).toBeTruthy();
    expect(await acquireCheckLock()).toBeNull();
    await releaseCheckLock(owner!);
    const next = await acquireCheckLock();
    expect(next).toBeTruthy();
    await releaseCheckLock(next!);
  });
});
