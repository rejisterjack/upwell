import { cacheLife, cacheTag } from "next/cache";
import { freshnessToken, loadSnapshot } from "./status-data";

export async function getPublicSnapshot() {
  const revision = await freshnessToken();
  const snapshot = await cachedSnapshot(revision);
  return snapshot;
}

async function cachedSnapshot(revision: string) {
  "use cache";
  cacheTag("status");
  cacheLife({ stale: 30, revalidate: 15, expire: 300 });
  const snapshot = await loadSnapshot();
  return revision ? snapshot : snapshot;
}
