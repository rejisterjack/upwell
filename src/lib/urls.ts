import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google",
]);

export type DnsLookup = (host: string) => Promise<string[]>;

export function blockedTargetReason(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Enter an http or https URL.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Only http and https URLs can be checked.";
  }
  if (url.username || url.password) {
    return "URLs with embedded credentials are not allowed.";
  }

  const host = normalizeHost(url.hostname);
  if (loopbackAllowed() && isLoopback(host)) return null;
  if (
    BLOCKED_HOSTS.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal")
  ) {
    return "That host is not a public address.";
  }
  if (isPrivateIp(host)) {
    return "Private and link-local addresses are not allowed.";
  }
  return null;
}

export async function assertPublicUrl(
  raw: string,
  resolve: DnsLookup = defaultLookup,
): Promise<string | null> {
  const syntactic = blockedTargetReason(raw);
  if (syntactic) return syntactic;

  const host = normalizeHost(new URL(raw).hostname);
  if (isIP(host)) return null;

  let addresses: string[];
  try {
    addresses = await resolve(host);
  } catch {
    return "The host did not resolve.";
  }
  if (addresses.length === 0) return "The host did not resolve.";
  if (addresses.some((address) => isPrivateIp(address))) {
    return "That host resolves to a private address.";
  }
  return null;
}

export async function defaultLookup(host: string): Promise<string[]> {
  const results = await Promise.race([
    lookup(host, { all: true, verbatim: true }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("DNS timed out")), 5_000);
    }),
  ]);
  return results.map((result) => result.address);
}

function loopbackAllowed() {
  return process.env.UPWELL_ALLOW_LOOPBACK === "1";
}

function isLoopback(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function normalizeHost(hostname: string) {
  return hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
}

export function isPrivateIp(value: string): boolean {
  const host = normalizeHost(value);
  if (host.includes(":")) {
    const mapped = host.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    if (host === "::" || host === "::1") return true;
    if (host.startsWith("fe80:")) return true;
    if (host.startsWith("fc") || host.startsWith("fd")) return true;
    return false;
  }

  const parts = host.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}
