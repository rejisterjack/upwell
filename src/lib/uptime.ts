import type { DayCell, DayTone } from "./types";

export type DayStat = {
  day: string;
  totalChecks: number;
  upChecks: number;
  degradedChecks: number;
  downChecks: number;
};

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function last90Days(today: Date): string[] {
  const end = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const days: string[] = [];
  for (let offset = 89; offset >= 0; offset -= 1) {
    const day = new Date(end);
    day.setUTCDate(end.getUTCDate() - offset);
    days.push(utcDay(day));
  }
  return days;
}

export function dayExists(createdAt: Date, day: string): boolean {
  return utcDay(createdAt) <= day;
}

export function dayTone(stat: DayStat | undefined, existed: boolean): DayTone {
  if (!existed || !stat || stat.totalChecks <= 0) return "empty";
  if (stat.downChecks > 0) return "down";
  if (stat.degradedChecks > 0) return "degraded";
  return "up";
}

export function uptimePercent(stats: DayStat[]): number | null {
  let good = 0;
  let total = 0;
  for (const stat of stats) {
    total += stat.totalChecks;
    good += stat.upChecks + stat.degradedChecks;
  }
  if (total === 0) return null;
  return (good / total) * 100;
}

export function buildDays(
  today: Date,
  createdAt: Date,
  stats: DayStat[],
): DayCell[] {
  const byDay = new Map(stats.map((stat) => [stat.day, stat]));
  return last90Days(today).map((date) => {
    const existed = dayExists(createdAt, date);
    const stat = byDay.get(date);
    const tone = dayTone(stat, existed);
    const uptime =
      stat && stat.totalChecks > 0
        ? ((stat.upChecks + stat.degradedChecks) / stat.totalChecks) * 100
        : null;
    return { date, tone, uptime: existed ? uptime : null };
  });
}
