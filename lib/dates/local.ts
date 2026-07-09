/**
 * Fechas locales (no UTC) — spec 41.2.
 * Evitar toISOString() para activity_date y streak.
 */

/** YYYY-MM-DD en zona horaria local. */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addLocalDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Días calendario entre dos fechas locales (sin hora). */
export function daysUntilLocal(targetDateStr: string, from: Date = new Date()): number {
  const [y, m, d] = targetDateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diffMs = target.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/** Últimos N días calendario locales (incluye hoy). */
export function recentLocalDates(count: number, from: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    dates.push(formatLocalDate(addLocalDays(from, -i)));
  }
  return dates;
}
