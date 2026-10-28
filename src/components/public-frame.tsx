import Link from "next/link";

export function PublicFrame({
  siteName,
  children,
}: {
  siteName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteName}
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            Status
          </Link>
          <Link href="/incidents" className="hover:text-foreground">
            Incidents
          </Link>
          <Link href="/feed.xml" className="hover:text-foreground">
            Feed
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-8">{children}</main>
      <footer className="mt-12 border-t border-line pt-4 text-sm text-muted">
        Powered by{" "}
        <a className="underline" href="https://github.com/rejisterjack/upwell">
          Upwell
        </a>
      </footer>
    </div>
  );
}
