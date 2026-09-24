import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/db/create";
import { posts, projects, type NewPost } from "@/db/schema";
import { getProjectTimeline } from "@/lib/posts/queries";
import { buildTimeline, type Timeline } from "@/lib/posts/timeline";
import { createTestDb } from "./helpers/db";

const now = new Date("2026-06-01T00:00:00Z");
const day = (n: number) => new Date(Date.UTC(2026, 0, 1) + n * 86_400_000);

let db: Db;
let projectId: string;
let otherProjectId: string;

beforeAll(async () => {
  db = await createTestDb();
  const [p, other] = await db
    .insert(projects)
    .values([
      { slug: "test", title: "Test" },
      { slug: "other", title: "Other" },
    ])
    .returning();
  projectId = p!.id;
  otherProjectId = other!.id;

  const rows: NewPost[] = [];
  for (let i = 0; i < 23; i++) {
    rows.push({
      projectId,
      slug: `post-${i}`,
      title: `Post ${i}`,
      publishedAt: day(i * 3),
      createdAt: day(i * 3),
      status: "published",
      pinned: i === 17,
      type: i === 0 ? "milestone" : "devlog",
    });
  }
  // Same date as post-5: tie-break by createdAt.
  rows.push({ projectId, slug: "tie", title: "Tie", publishedAt: day(15), createdAt: day(16), status: "published" });
  rows.push({ projectId, slug: "draft", title: "Draft", publishedAt: day(1), status: "draft" });
  rows.push({ projectId, slug: "sched", title: "Sched", publishedAt: day(400), status: "scheduled" });
  rows.push({ projectId: otherProjectId, slug: "x", title: "X", publishedAt: day(-100), status: "published" });
  await db.insert(posts).values(rows);
});

describe("getProjectTimeline (Postgres)", () => {
  it("matches the pure buildTimeline() across every page", async () => {
    const all = await db.select().from(posts);
    const mine = all.filter((p) => p.projectId === projectId);

    let dbCursor: string | null = null;
    let jsCursor: string | null = null;
    let pages = 0;
    do {
      const fromDb = await getProjectTimeline(db, projectId, { now, limit: 7, cursor: dbCursor });
      const fromJs: Timeline<(typeof mine)[number]> = buildTimeline(mine, { now, limit: 7, cursor: jsCursor });
      expect(fromDb.entries.map((p) => p.slug)).toEqual(fromJs.entries.map((p) => p.slug));
      expect(fromDb.pinned.map((p) => p.slug)).toEqual(fromJs.pinned.map((p) => p.slug));
      expect(fromDb.origin?.slug).toBe(fromJs.origin?.slug);
      expect(fromDb.olderCount).toBe(fromJs.olderCount);
      dbCursor = fromDb.nextCursor;
      jsCursor = fromJs.nextCursor;
      pages++;
    } while (dbCursor && pages < 10);
    expect(pages).toBe(4); // 23 public (excl. origin) / 7
  });

  it("anchors the first post as origin and keeps it off the pages", async () => {
    const t = await getProjectTimeline(db, projectId, { now, limit: 100 });
    expect(t.origin?.slug).toBe("post-0");
    expect(t.entries.map((p) => p.slug)).not.toContain("post-0");
    expect(t.entries[0]?.slug).toBe("post-22");
    expect(t.entries.map((p) => p.slug)).not.toContain("draft");
    expect(t.entries.map((p) => p.slug)).not.toContain("sched");
  });

  it("puts a newly published post at the top", async () => {
    await db
      .insert(posts)
      .values({ projectId, slug: "fresh", title: "Fresh", publishedAt: day(140), status: "published" });
    const t = await getProjectTimeline(db, projectId, { now });
    expect(t.entries[0]?.slug).toBe("fresh");
    expect(t.origin?.slug).toBe("post-0");
  });

  it("isolates projects", async () => {
    const t = await getProjectTimeline(db, otherProjectId, { now });
    expect(t.origin?.slug).toBe("x");
    expect(t.entries).toEqual([]);
  });
});
