import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "upwell_session";

function sessionKey() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 16) return null;
  return new TextEncoder().encode(password);
}

export async function signSession(): Promise<string> {
  const key = sessionKey();
  if (!key) throw new Error("ADMIN_PASSWORD is not configured.");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function readSessionToken(token: string | undefined): Promise<boolean> {
  const key = sessionKey();
  if (!key || !token) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
