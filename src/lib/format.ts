const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export function formatDate(d: Date | string): string {
  return dateFmt.format(typeof d === "string" ? new Date(d) : d);
}

export function formatMonth(d: Date | string): string {
  return monthFmt.format(typeof d === "string" ? new Date(d) : d);
}

/** "Day 1" for the start date, "Day 214" later on. */
export function dayNumber(start: Date | string, at: Date | string): number {
  const s = new Date(start).setUTCHours(0, 0, 0, 0);
  const a = new Date(at).setUTCHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((a - s) / 86_400_000) + 1);
}
