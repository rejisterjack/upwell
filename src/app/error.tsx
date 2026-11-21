"use client";

import { useEffect } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    document.title = "Error · Upwell";
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-xl text-muted">This page could not be shown. Nothing about the failure is included here.</p>
      <button
        className="mt-6 w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background"
        type="button"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}
