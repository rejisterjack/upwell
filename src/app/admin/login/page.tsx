import { Suspense } from "react";
import { loginAction } from "@/app/admin/actions";
import { adminConfigError } from "@/lib/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configError = adminConfigError();
  const message =
    configError ??
    (error === "rate"
      ? "Too many attempts. Wait a few minutes and try again."
      : error === "invalid"
        ? "That password is not right."
        : null);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-muted">Operator access for this status page.</p>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
      <form action={loginAction} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            className="rounded-md border border-line bg-card px-3 py-2"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={Boolean(configError)}
          />
        </label>
        <button
          className="w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          type="submit"
          disabled={Boolean(configError)}
        >
          Log in
        </button>
      </form>
    </main>
  );
}
