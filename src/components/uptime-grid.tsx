import { formatDay, formatUptime } from "@/lib/format";
import type { DayCell } from "@/lib/types";

export function UptimeGrid({ days }: { days: DayCell[] }) {
  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1" aria-label="90 day uptime">
      {days.map((day) => (
        <span
          key={day.date}
          className="day h-8 w-2 shrink-0 rounded-sm"
          data-tone={day.tone}
          title={
            day.tone === "empty"
              ? `${formatDay(day.date)}: no data`
              : `${formatDay(day.date)}: ${formatUptime(day.uptime)} uptime`
          }
        />
      ))}
    </div>
  );
}
