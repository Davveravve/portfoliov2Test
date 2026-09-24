import { describe, expect, it } from "vitest";
import { effectiveState, isPublic } from "@/lib/posts/visibility";

const now = new Date("2026-03-10T12:00:00Z");
const past = new Date("2026-03-01T12:00:00Z");
const future = new Date("2026-04-01T12:00:00Z");

describe("isPublic", () => {
  it("never shows drafts, whatever the date", () => {
    expect(isPublic({ status: "draft", publishedAt: past }, now)).toBe(false);
    expect(isPublic({ status: "draft", publishedAt: future }, now)).toBe(false);
  });

  it("shows published posts dated in the past or exactly now", () => {
    expect(isPublic({ status: "published", publishedAt: past }, now)).toBe(true);
    expect(isPublic({ status: "published", publishedAt: now }, now)).toBe(true);
  });

  it("hides a published post with a future date (date override cannot leak it early)", () => {
    expect(isPublic({ status: "published", publishedAt: future }, now)).toBe(false);
  });

  it("scheduled posts go live by time alone", () => {
    const post = { status: "scheduled" as const, publishedAt: future };
    expect(isPublic(post, now)).toBe(false);
    expect(isPublic(post, new Date(future.getTime() - 1))).toBe(false);
    expect(isPublic(post, future)).toBe(true);
  });
});

describe("effectiveState", () => {
  it("reports scheduled until the time passes, then live", () => {
    expect(effectiveState({ status: "scheduled", publishedAt: future }, now)).toBe("scheduled");
    expect(effectiveState({ status: "scheduled", publishedAt: past }, now)).toBe("live");
    expect(effectiveState({ status: "draft", publishedAt: past }, now)).toBe("draft");
  });
});
