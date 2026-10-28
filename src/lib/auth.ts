import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { readSessionToken, SESSION_COOKIE, signSession } from "./session";

export { SESSION_COOKIE };
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function adminConfigError(): string | null {
  if (!process.env.DATABASE_URL) {
    return "Set DATABASE_URL to your Postgres connection string.";
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 16) {
    return "Set ADMIN_PASSWORD to a random secret of at least 16 characters.";
  }
  return null;
}

export function secretsMatch(presented: string, expected: string): boolean {
  const left = createHash("sha256").update(presented).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export async function readSession(token: string | undefined): Promise<boolean> {
  return readSessionToken(token);
}

export async function clientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerStore.get("x-real-ip") ?? "unknown";
}

export async function tooManyAttempts(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const attempts = await db.orm.public.LoginAttempt.where((attempt) => attempt.ip.eq(ip))
    .where((attempt) => attempt.attemptedAt.gte(since))
    .all();
  return attempts.length >= MAX_ATTEMPTS;
}

export async function recordAttempt(ip: string) {
  await db.orm.public.LoginAttempt.create({ ip });
}

export async function requireAdmin() {
  if (adminConfigError()) redirect("/admin/login");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await readSession(token))) redirect("/admin/login");
}

export async function login(formData: FormData) {
  if (adminConfigError()) redirect("/admin/login");
  const ip = await clientIp();
  if (await tooManyAttempts(ip)) redirect("/admin/login?error=rate");
  const password = String(formData.get("password") ?? "");
  if (!secretsMatch(password, process.env.ADMIN_PASSWORD ?? "")) {
    await recordAttempt(ip);
    redirect("/admin/login?error=invalid");
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
