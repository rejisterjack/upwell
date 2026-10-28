import { getPublicSnapshot } from "@/lib/cached-status";
import { live } from "@/lib/live";

const LABELS: Record<string, { text: string; color: string }> = {
  operational: { text: "operational", color: "#1f7a4d" },
  degraded: { text: "degraded", color: "#9a6700" },
  partial: { text: "partial outage", color: "#9a6700" },
  major: { text: "major outage", color: "#b42318" },
  maintenance: { text: "maintenance", color: "#1d4e89" },
  delayed: { text: "delayed", color: "#44403c" },
  unknown: { text: "unknown", color: "#57534e" },
};

export async function GET() {
  await live();
  const snapshot = await getPublicSnapshot();
  const label = LABELS[snapshot.banner.tone] ?? LABELS.unknown;
  const width = 78 + label.text.length * 7;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="status: ${label.text}">
  <rect width="${width}" height="20" rx="3" fill="${label.color}"/>
  <rect width="62" height="20" fill="#1c1917"/>
  <text x="8" y="14" fill="#f5f1e8" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11">status</text>
  <text x="70" y="14" fill="#fffcf7" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11">${label.text}</text>
</svg>`;
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=30",
    },
  });
}
