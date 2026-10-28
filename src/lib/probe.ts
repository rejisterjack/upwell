import { isIP } from "node:net";
import { Agent, fetch as undiciFetch } from "undici";
import type { CheckOutcome } from "./types";
import { assertPublicUrl, type DnsLookup } from "./urls";

const MAX_REDIRECTS = 5;

export type ProbeResult = {
  outcome: CheckOutcome;
  statusCode: number | null;
  responseMs: number | null;
  error: string | null;
};

type ProbeTarget = {
  url: string;
  method: "GET" | "HEAD";
  expectedStatus: number;
  timeoutMs: number;
  degradedAfterMs: number | null;
};

export async function probeService(
  service: ProbeTarget,
  fetchImpl: typeof fetch = fetch,
  resolve?: DnsLookup,
): Promise<ProbeResult> {
  const started = performance.now();
  try {
    const response = await fetchChecked(service.url, {
      method: service.method,
      timeoutMs: service.timeoutMs,
      fetchImpl,
      resolve,
    });
    await response.body?.cancel().catch(() => undefined);
    const responseMs = Math.round(performance.now() - started);
    if (response.status !== service.expectedStatus) {
      return {
        outcome: "down",
        statusCode: response.status,
        responseMs,
        error: `Unexpected status ${response.status}`,
      };
    }
    if (service.degradedAfterMs != null && responseMs > service.degradedAfterMs) {
      return {
        outcome: "degraded",
        statusCode: response.status,
        responseMs,
        error: null,
      };
    }
    return { outcome: "up", statusCode: response.status, responseMs, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return {
      outcome: "down",
      statusCode: null,
      responseMs: Math.round(performance.now() - started),
      error: message.slice(0, 300),
    };
  }
}

async function fetchChecked(
  startUrl: string,
  options: {
    method: "GET" | "HEAD";
    timeoutMs: number;
    fetchImpl: typeof fetch;
    resolve?: DnsLookup;
  },
): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const blocked = await assertPublicUrl(current, options.resolve);
    if (blocked) throw new Error(blocked);
    const response = await requestPinned(current, options);
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    await response.body?.cancel().catch(() => undefined);
    if (!location) throw new Error("Redirect had no location.");
    if (hop === MAX_REDIRECTS) throw new Error("Too many redirects.");
    current = new URL(location, current).toString();
  }
  throw new Error("Too many redirects.");
}

async function requestPinned(
  target: string,
  options: {
    method: "GET" | "HEAD";
    timeoutMs: number;
    fetchImpl: typeof fetch;
    resolve?: DnsLookup;
  },
): Promise<Response> {
  const init = {
    method: options.method,
    redirect: "manual" as const,
    signal: AbortSignal.timeout(options.timeoutMs),
    headers: {
      "user-agent": "Upwell/0.1 (+https://github.com/rejisterjack/upwell)",
    },
  };
  if (options.fetchImpl !== fetch) return options.fetchImpl(target, init);

  const url = new URL(target);
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (isIP(host)) return fetch(target, init);

  const addresses = await (options.resolve ?? (await import("./urls")).defaultLookup)(host);
  const agent = new Agent({
    connect: {
      lookup(hostname, _lookupOptions, callback) {
        const asked = hostname.replace(/^\[|\]$/g, "").toLowerCase();
        const address = addresses[0];
        if (asked !== host || !address) {
          callback(new Error("Refusing an unexpected host"), "", 4);
          return;
        }
        callback(null, address, address.includes(":") ? 6 : 4);
      },
    },
  });
  try {
    const response = await undiciFetch(target, { ...init, dispatcher: agent });
    const location = response.headers.get("location");
    const status = response.status;
    await response.body?.cancel().catch(() => undefined);
    return new Response(null, {
      status,
      headers: location ? { location } : undefined,
    });
  } finally {
    await agent.close();
  }
}
