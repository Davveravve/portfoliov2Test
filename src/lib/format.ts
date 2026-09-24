const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

const toDate = (d: Date | string) => (typeof d === "string" ? new Date(d) : d);

/** "19 Sept 2026" — for sans contexts. */
export function formatDate(d: Date | string): string {
  return dateFmt.format(toDate(d));
}

/** "Sept 2026" — for sans contexts. */
export function formatMonth(d: Date | string): string {
  return monthFmt.format(toDate(d));
}

/** Zero-pads to `width` digits: pad(7, 3) → "007". */
export function pad(n: number, width: number): string {
  return String(Math.max(0, Math.trunc(n))).padStart(width, "0");
}

/** "2026.09.19" — for mono readouts. */
export function formatDateMono(d: Date | string): string {
  const x = toDate(d);
  return `${x.getUTCFullYear()}.${pad(x.getUTCMonth() + 1, 2)}.${pad(x.getUTCDate(), 2)}`;
}

/** "2026.09" — for mono readouts. */
export function formatMonthMono(d: Date | string): string {
  const x = toDate(d);
  return `${x.getUTCFullYear()}.${pad(x.getUTCMonth() + 1, 2)}`;
}

const RATIOS: [string, number][] = [
  ["21:9", 21 / 9],
  ["2:1", 2],
  ["16:9", 16 / 9],
  ["16:10", 16 / 10],
  ["3:2", 3 / 2],
  ["4:3", 4 / 3],
  ["1:1", 1],
];

/** "16:9" when within ±0.5% of a common ratio, otherwise "2.33:1". */
export function formatRatio(width: number, height: number): string {
  if (!width || !height) return "";
  const r = width / height;
  const hit = RATIOS.find(([, v]) => Math.abs(r - v) / v <= 0.005);
  return hit ? hit[0] : `${r.toFixed(2)}:1`;
}

/** "2560×1097 · 21:9" from an asset's dimensions; empty when unknown. */
export function formatDimensions(width: number | null, height: number | null): string {
  if (!width || !height) return "";
  return `${width}×${height} · ${formatRatio(width, height)}`;
}

/** "01:24" from seconds. */
export function formatTimecode(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${pad(Math.floor(s / 60), 2)}:${pad(s % 60, 2)}`;
}

/** "Day 1" for the start date, "Day 214" later on. */
export function dayNumber(start: Date | string, at: Date | string): number {
  const s = new Date(start).setUTCHours(0, 0, 0, 0);
  const a = new Date(at).setUTCHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((a - s) / 86_400_000) + 1);
}
