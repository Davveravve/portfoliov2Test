import { and, asc, desc, eq, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { Db } from "@/db/create";
import { posts } from "@/db/schema";
import { decodeCursor, encodeCursor, type BuildTimelineOptions, type Timeline } from "./timeline";

type PostRow = typeof posts.$inferSelect;

/** SQL twin of `isPublic()`. */
export function publicPostWhere(now: Date): SQL {
  return and(inArray(posts.status, ["published", "scheduled"]), lte(posts.publishedAt, now))!;
}

const newestFirst = [desc(posts.publishedAt), desc(posts.createdAt), desc(posts.id)] as const;

/**
 * Database-backed timeline page. Mirrors `buildTimeline()` (SPEC.md §3) with
 * keyset pagination, so it stays fast and stable for long-running projects.
 */
export async function getProjectTimeline(
  db: Db,
  projectId: string,
  options: BuildTimelineOptions = {},
): Promise<Timeline<PostRow>> {
  const now = options.now ?? new Date();
  const limit = Math.max(1, options.limit ?? 10);
  const cursor = decodeCursor(options.cursor);
  const visible = and(eq(posts.projectId, projectId), publicPostWhere(now))!;

  const [origin] = await db
    .select()
    .from(posts)
    .where(visible)
    .orderBy(asc(posts.publishedAt), asc(posts.createdAt), asc(posts.id))
    .limit(1);

  if (!origin) return { pinned: [], entries: [], origin: null, olderCount: 0, nextCursor: null };

  const notOrigin = sql`${posts.id} <> ${origin.id}`;
  const afterCursor = cursor
    ? sql`(${posts.publishedAt}, ${posts.createdAt}, ${posts.id}) < (${cursor.publishedAt.toISOString()}::timestamptz, ${cursor.createdAt.toISOString()}::timestamptz, ${cursor.id}::uuid)`
    : undefined;
  const pageWhere = and(visible, notOrigin, afterCursor);

  const [entries, [{ count } = { count: 0 }], pinned] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(pageWhere)
      .orderBy(...newestFirst)
      .limit(limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(pageWhere),
    cursor
      ? Promise.resolve([] as PostRow[])
      : db
          .select()
          .from(posts)
          .where(and(visible, notOrigin, eq(posts.pinned, true)))
          .orderBy(...newestFirst),
  ]);

  const olderCount = Math.max(0, count - entries.length);
  const last = entries.at(-1);
  return {
    pinned,
    entries,
    origin,
    olderCount,
    nextCursor: olderCount > 0 && last ? encodeCursor(last) : null,
  };
}
