import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  compareTimeline,
  decodeCursor,
  encodeCursor,
  markerWeight,
  neighbours,
  type TimelinePost,
} from "@/lib/posts/timeline";

const now = new Date("2026-06-01T00:00:00Z");
const day = (n: number) => new Date(Date.UTC(2026, 0, 1) + n * 86_400_000);

function post(id: string, dayN: number, extra: Partial<TimelinePost> = {}): TimelinePost {
  return {
    id,
    publishedAt: day(dayN),
    createdAt: day(dayN),
    status: "published",
    pinned: false,
    type: "devlog",
    ...extra,
  };
}

const ids = (list: TimelinePost[]) => list.map((p) => p.id);

describe("buildTimeline", () => {
  const posts = [
    post("p-mid", 20),
    post("p-start", 0, { type: "milestone" }),
    post("p-new", 40),
    post("p-draft", 50, { status: "draft" }),
    post("p-sched", 200, { status: "scheduled" }), // after `now`
    post("p-old", 5),
  ];

  it("orders newest first and anchors the oldest post as origin", () => {
    const t = buildTimeline(posts, { now });
    expect(ids(t.entries)).toEqual(["p-new", "p-mid", "p-old"]);
    expect(t.origin?.id).toBe("p-start");
    expect(t.olderCount).toBe(0);
    expect(t.nextCursor).toBeNull();
  });

  it("excludes drafts and not-yet-live scheduled posts", () => {
    const t = buildTimeline(posts, { now });
    const all = [...ids(t.entries), t.origin?.id];
    expect(all).not.toContain("p-draft");
    expect(all).not.toContain("p-sched");
  });

  it("a newly published post goes to the top; the origin stays at the bottom", () => {
    const t = buildTimeline([...posts, post("p-latest", 100)], { now });
    expect(t.entries[0]?.id).toBe("p-latest");
    expect(t.origin?.id).toBe("p-start");
  });

  it("backfilled posts (date override) slot into chronological position", () => {
    const t = buildTimeline([...posts, post("p-backfill", 10)], { now });
    expect(ids(t.entries)).toEqual(["p-new", "p-mid", "p-backfill", "p-old"]);
  });

  it("backfilling a post older than the origin makes it the new origin", () => {
    const t = buildTimeline([...posts, post("p-earlier", -30)], { now });
    expect(t.origin?.id).toBe("p-earlier");
    expect(ids(t.entries)).toContain("p-start");
  });

  it("a scheduled post appears at the top once its time passes", () => {
    const t = buildTimeline(posts, { now: day(201) });
    expect(t.entries[0]?.id).toBe("p-sched");
  });

  it("paginates with a cursor without ever losing or duplicating the origin", () => {
    const many = Array.from({ length: 25 }, (_, i) => post(`p${String(i).padStart(2, "0")}`, i));
    const seen: string[] = [];
    let cursor: string | null = null;
    let pages = 0;
    do {
      const t: ReturnType<typeof buildTimeline<TimelinePost>> = buildTimeline(many, { now, limit: 10, cursor });
      expect(t.origin?.id).toBe("p00");
      seen.push(...ids(t.entries));
      cursor = t.nextCursor;
      pages++;
    } while (cursor && pages < 10);

    expect(pages).toBe(3);
    expect(seen).toHaveLength(24);
    expect(new Set(seen).size).toBe(24);
    expect(seen).not.toContain("p00");
    expect(seen[0]).toBe("p24");
    expect(seen.at(-1)).toBe("p01");
  });

  it("reports how many older posts remain", () => {
    const many = Array.from({ length: 25 }, (_, i) => post(`p${i}`, i));
    const t = buildTimeline(many, { now, limit: 10 });
    expect(t.olderCount).toBe(14); // 25 - origin - 10
  });

  it("is deterministic for identical dates (tie-break createdAt, then id)", () => {
    const same = [
      post("a", 10, { createdAt: day(1) }),
      post("b", 10, { createdAt: day(2) }),
      post("c", 10, { createdAt: day(2) }),
      post("origin", 0),
    ];
    expect(ids(buildTimeline(same, { now }).entries)).toEqual(["c", "b", "a"]);
    expect(ids(buildTimeline([...same].reverse(), { now }).entries)).toEqual(["c", "b", "a"]);
  });

  it("pinned posts appear in the pinned slot and keep their chronological place", () => {
    const t = buildTimeline([...posts.map((p) => (p.id === "p-mid" ? { ...p, pinned: true } : p))], { now });
    expect(ids(t.pinned)).toEqual(["p-mid"]);
    expect(ids(t.entries)).toContain("p-mid");
  });

  it("never duplicates the origin into the pinned slot", () => {
    const t = buildTimeline(
      posts.map((p) => (p.id === "p-start" ? { ...p, pinned: true } : p)),
      { now },
    );
    expect(t.pinned).toEqual([]);
    expect(t.origin?.id).toBe("p-start");
  });

  it("only returns pinned on the first page", () => {
    const many = Array.from({ length: 15 }, (_, i) => post(`p${i}`, i, { pinned: i === 14 }));
    const first = buildTimeline(many, { now, limit: 5 });
    const second = buildTimeline(many, { now, limit: 5, cursor: first.nextCursor });
    expect(first.pinned).toHaveLength(1);
    expect(second.pinned).toHaveLength(0);
  });

  it("handles empty and single-post projects", () => {
    expect(buildTimeline([], { now })).toMatchObject({ entries: [], origin: null, olderCount: 0 });
    const one = buildTimeline([post("only", 1)], { now });
    expect(one.entries).toEqual([]);
    expect(one.origin?.id).toBe("only");
  });
});

describe("cursor", () => {
  it("round-trips and rejects garbage", () => {
    const c = { publishedAt: day(3), createdAt: day(4), id: "abc" };
    expect(decodeCursor(encodeCursor(c))).toEqual(c);
    expect(decodeCursor("nope")).toBeNull();
    expect(decodeCursor("")).toBeNull();
    expect(decodeCursor(null)).toBeNull();
  });
});

describe("compareTimeline / markerWeight / neighbours", () => {
  it("sorts newest first", () => {
    expect(compareTimeline(post("a", 2), post("b", 1))).toBeLessThan(0);
  });

  it("weights releases > milestones > showcases > devlogs", () => {
    expect(markerWeight("release")).toBeGreaterThan(markerWeight("milestone"));
    expect(markerWeight("milestone")).toBeGreaterThan(markerWeight("showcase"));
    expect(markerWeight("showcase")).toBeGreaterThan(markerWeight("devlog"));
  });

  it("finds newer/older neighbours among public posts only", () => {
    const list = [post("a", 1), post("b", 2), post("d", 3, { status: "draft" }), post("c", 4)];
    expect(neighbours(list, "b", now)).toEqual({ newer: list[3], older: list[0] });
    expect(neighbours(list, "c", now).newer).toBeNull();
    expect(neighbours(list, "a", now).older).toBeNull();
    expect(neighbours(list, "d", now)).toEqual({ newer: null, older: null });
  });
});
