import { describe, expect, it } from "vitest";
import {
  dayNumber,
  formatDateMono,
  formatDimensions,
  formatMonthMono,
  formatRatio,
  formatTimecode,
  pad,
} from "@/lib/format";

describe("mono formatting", () => {
  it("pads numbers to the width of their set", () => {
    expect(pad(7, 3)).toBe("007");
    expect(pad(15, 3)).toBe("015");
    expect(pad(3, 2)).toBe("03");
    expect(pad(1234, 2)).toBe("1234");
  });

  it("formats dates as YYYY.MM.DD / YYYY.MM in UTC", () => {
    const d = new Date("2026-09-19T23:30:00Z");
    expect(formatDateMono(d)).toBe("2026.09.19");
    expect(formatMonthMono("2025-12-02")).toBe("2025.12");
  });

  it("snaps ratios to common names and otherwise prints decimals", () => {
    expect(formatRatio(1920, 1080)).toBe("16:9");
    expect(formatRatio(2560, 1097)).toBe("21:9");
    expect(formatRatio(1376, 688)).toBe("2:1");
    expect(formatRatio(800, 600)).toBe("4:3");
    expect(formatRatio(1000, 1000)).toBe("1:1");
    expect(formatRatio(1000, 450)).toBe("2.22:1");
    expect(formatRatio(0, 10)).toBe("");
  });

  it("formats dimensions and timecodes", () => {
    expect(formatDimensions(1920, 1080)).toBe("1920×1080 · 16:9");
    expect(formatDimensions(null, 1080)).toBe("");
    expect(formatTimecode(84)).toBe("01:24");
    expect(formatTimecode(0)).toBe("00:00");
    expect(formatTimecode(3599.9)).toBe("59:59");
  });

  it("counts project days from 1", () => {
    expect(dayNumber("2026-01-01", "2026-01-01")).toBe(1);
    expect(dayNumber("2026-01-01", "2026-08-02")).toBe(214);
  });
});
