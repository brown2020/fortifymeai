import { format } from "date-fns";

/** Calendar date in the runtime's local timezone (`yyyy-MM-dd`). */
export function getLocalDateId(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/** Newest-first local calendar dates, including today at index 0. */
export function recentLocalDateIds(days: number, now: Date = new Date()): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    return getLocalDateId(date);
  });
}

/** Previous calendar day for a `yyyy-MM-dd` id, without shifting through UTC. */
export function previousDateId(dateId: string): string {
  const [year, month, day] = dateId.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
