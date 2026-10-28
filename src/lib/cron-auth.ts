import { createHash, timingSafeEqual } from "node:crypto";

export function cronAuthorized(
  header: string | null,
  secret = process.env.CRON_SECRET,
): boolean {
  if (!secret || secret.length < 16 || !header?.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length);
  const presented = createHash("sha256").update(token).digest();
  const expected = createHash("sha256").update(secret).digest();
  return timingSafeEqual(presented, expected);
}
