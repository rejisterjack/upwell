import type { Banner } from "@/lib/types";

export function StatusBanner({
  banner,
  delayed,
  updatedAt,
}: {
  banner: Banner;
  delayed: boolean;
  updatedAt: string | null;
}) {
  return (
    <section className="banner rounded-2xl px-6 py-8" data-tone={banner.tone}>
      <p className="font-mono text-xs tracking-[0.16em] uppercase">Current status</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{banner.title}</h1>
      <p className="mt-2 max-w-2xl text-base">{banner.detail}</p>
      {delayed && banner.tone !== "delayed" ? (
        <p className="mt-3 text-sm">Checks are older than the expected interval.</p>
      ) : null}
      <p className="mt-4 font-mono text-xs opacity-80">{updatedAt ?? "No checks recorded"}</p>
    </section>
  );
}
