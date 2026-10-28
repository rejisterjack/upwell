import { getPublicSnapshot } from "@/lib/cached-status";
import { live } from "@/lib/live";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(request: Request) {
  await live();
  const snapshot = await getPublicSnapshot();
  const configured = snapshot.siteUrl.replace(/\/$/, "");
  const origin = configured || new URL(request.url).origin;
  const self = `${origin}/feed.xml`;
  const entries = snapshot.incidents
    .map((incident) => {
      const href = `${origin}/incidents/${incident.id}`;
      const latest = incident.updates.at(-1);
      return `<entry>
        <title>${escapeXml(incident.title)}</title>
        <id>${escapeXml(href)}</id>
        <updated>${latest?.createdAt ?? incident.startedAt}</updated>
        <summary>${escapeXml(latest?.body ?? incident.status)}</summary>
        <link rel="alternate" href="${escapeXml(href)}"/>
      </entry>`;
    })
    .join("");
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(snapshot.siteName)} status</title>
  <id>${escapeXml(self)}</id>
  <updated>${snapshot.updatedAt ?? new Date(0).toISOString()}</updated>
  <link rel="self" href="${escapeXml(self)}"/>
  <author><name>${escapeXml(snapshot.siteName)}</name></author>
  ${entries}
</feed>`;
  return new Response(feed, {
    headers: { "content-type": "application/atom+xml; charset=utf-8" },
  });
}
