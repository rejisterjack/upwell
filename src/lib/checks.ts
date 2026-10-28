import { randomUUID } from "node:crypto";
import { pool, db } from "@/prisma/db";
import { dispatchAlerts, type AlertEvent } from "./alerts";
import { applyProbe } from "./flap";
import { probeService } from "./probe";
import { getSettings } from "./settings";
import type { CheckOutcome } from "./types";

const CHECK_BUDGET_MS = 240_000;
const CHECK_CONCURRENCY = 8;
const LOCK_ID = "singleton";

export type CheckRunResult = {
  skipped: boolean;
  checked: number;
  alerts: number;
};

type RunnerOptions = {
  fetchImpl?: typeof fetch;
  serviceId?: string;
  dispatch?: (event: AlertEvent) => Promise<void>;
  resolve?: (host: string) => Promise<string[]>;
};

export async function acquireCheckLock(): Promise<string | null> {
  const owner = randomUUID();
  const until = new Date(Date.now() + CHECK_BUDGET_MS + 30_000);
  const result = await pool.query(
    `INSERT INTO "CheckLock" ("id", "lockedUntil", "owner")
     VALUES ($1, $2, $3)
     ON CONFLICT ("id") DO UPDATE
     SET "lockedUntil" = EXCLUDED."lockedUntil", "owner" = EXCLUDED."owner"
     WHERE "CheckLock"."lockedUntil" < NOW()
     RETURNING "id"`,
    [LOCK_ID, until, owner],
  );
  return result.rowCount === 1 ? owner : null;
}

export async function releaseCheckLock(owner: string) {
  await pool.query(
    `UPDATE "CheckLock" SET "lockedUntil" = 'epoch', "owner" = '' WHERE "id" = $1 AND "owner" = $2`,
    [LOCK_ID, owner],
  );
}

export async function runChecks(options: RunnerOptions = {}): Promise<CheckRunResult> {
  const owner = await acquireCheckLock();
  if (!owner) return { skipped: true, checked: 0, alerts: 0 };
  try {
    return await runLocked(options);
  } finally {
    await releaseCheckLock(owner);
  }
}

async function runLocked(options: RunnerOptions): Promise<CheckRunResult> {
  const settings = await getSettings();
  const services = options.serviceId
    ? (
        await db.orm.public.Service.where((service) => service.id.eq(options.serviceId!)).all()
      )
    : await db.orm.public.Service.where((service) => service.enabled.eq(true)).all();

  let checked = 0;
  let alerts = 0;
  let cursor = 0;
  const started = Date.now();
  const dispatch = options.dispatch ?? dispatchAlerts;

  async function worker() {
    while (cursor < services.length && Date.now() - started < CHECK_BUDGET_MS) {
      const service = services[cursor];
      cursor += 1;
      if (!service) return;
      const result = await probeService(
        {
          url: service.url,
          method: service.method,
          expectedStatus: service.expectedStatus,
          timeoutMs: service.timeoutMs,
          degradedAfterMs: service.degradedAfterMs,
        },
        options.fetchImpl,
        options.resolve,
      );
      const transition = applyProbe({
        status: service.status,
        consecutiveFailures: service.consecutiveFailures,
        outcome: result.outcome,
        failuresBeforeAlert: settings.failuresBeforeAlert,
      });
      await db.orm.public.Check.create({
        serviceId: service.id,
        outcome: result.outcome,
        statusCode: result.statusCode,
        responseMs: result.responseMs,
        error: result.error,
      });
      await db.orm.public.Service.where((row) => row.id.eq(service.id)).update({
        status: transition.status,
        consecutiveFailures: transition.consecutiveFailures,
        lastCheckedAt: new Date(),
        lastResponseMs: result.responseMs,
      });
      await bumpDaily(service.id, result.outcome, result.responseMs);
      if (transition.alert) {
        alerts += 1;
        const siteUrl = settings.siteUrl.replace(/\/$/, "");
        await dispatch({
          event: transition.alert,
          serviceName: service.name,
          url: service.url,
          status: transition.status,
          statusCode: result.statusCode,
          error: result.error,
          responseMs: result.responseMs,
          statusPageUrl: siteUrl,
          checkedAt: new Date().toISOString(),
        });
      }
      checked += 1;
    }
  }

  const workers = Math.min(CHECK_CONCURRENCY, Math.max(services.length, 1));
  if (services.length > 0) {
    await Promise.all(Array.from({ length: workers }, () => worker()));
  }
  await purgeOldRows();
  return { skipped: false, checked, alerts };
}

async function bumpDaily(serviceId: string, outcome: CheckOutcome, responseMs: number | null) {
  const day = new Date().toISOString().slice(0, 10);
  const existing = await db.orm.public.DailyStat.where((stat) => stat.serviceId.eq(serviceId))
    .where((stat) => stat.day.eq(day))
    .first();
  const upChecks = outcome === "up" ? 1 : 0;
  const degradedChecks = outcome === "degraded" ? 1 : 0;
  const downChecks = outcome === "down" ? 1 : 0;
  if (!existing) {
    await db.orm.public.DailyStat.create({
      serviceId,
      day,
      totalChecks: 1,
      upChecks,
      degradedChecks,
      downChecks,
      avgResponseMs: responseMs,
    });
    return;
  }
  const totalChecks = existing.totalChecks + 1;
  const avgResponseMs =
    responseMs == null
      ? existing.avgResponseMs
      : existing.avgResponseMs == null
        ? responseMs
        : Math.round((existing.avgResponseMs * existing.totalChecks + responseMs) / totalChecks);
  await db.orm.public.DailyStat.where((stat) => stat.id.eq(existing.id)).update({
    totalChecks,
    upChecks: existing.upChecks + upChecks,
    degradedChecks: existing.degradedChecks + degradedChecks,
    downChecks: existing.downChecks + downChecks,
    avgResponseMs,
  });
}

async function purgeOldRows() {
  const checkCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const attemptCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.orm.public.Check.where((check) => check.checkedAt.lt(checkCutoff)).deleteAll();
  await db.orm.public.LoginAttempt.where((attempt) =>
    attempt.attemptedAt.lt(attemptCutoff),
  ).deleteAll();
}
