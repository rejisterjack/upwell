export function formatWhen(iso: string | null): string {
  if (!iso) return "Not checked yet";
  return (
    new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(iso)) + " UTC"
  );
}

export function formatUptime(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export function formatMs(value: number | null): string {
  if (value == null) return "—";
  return `${value} ms`;
}

export function formatDay(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
