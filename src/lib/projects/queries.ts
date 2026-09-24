import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "@/db/create";
import { media, posts, projects } from "@/db/schema";
import { toAsset, type MediaAsset } from "@/lib/media";
import { publicPostWhere } from "@/lib/posts/queries";

export type ProjectSummary = typeof projects.$inferSelect & {
  cover: MediaAsset | null;
  updateCount: number;
  lastUpdateAt: Date | null;
};

/** Featured projects in manual sort order, with public update stats. */
export async function getFeaturedProjects(db: Db, now = new Date()): Promise<ProjectSummary[]> {
  const stats = db
    .select({
      projectId: posts.projectId,
      updateCount: sql<number>`count(*)::int`.as("update_count"),
      lastUpdateAt: max(posts.publishedAt).as("last_update_at"),
    })
    .from(posts)
    .where(publicPostWhere(now))
    .groupBy(posts.projectId)
    .as("stats");

  const rows = await db
    .select({ project: projects, cover: media, updateCount: stats.updateCount, lastUpdateAt: stats.lastUpdateAt })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.coverMediaId))
    .leftJoin(stats, eq(stats.projectId, projects.id))
    .where(eq(projects.featured, true))
    .orderBy(asc(projects.sortOrder), asc(projects.title));

  return rows.map((r) => ({
    ...r.project,
    cover: toAsset(r.cover),
    updateCount: r.updateCount ?? 0,
    lastUpdateAt: r.lastUpdateAt ? new Date(r.lastUpdateAt) : null,
  }));
}

export type FeedItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  type: (typeof posts.$inferSelect)["type"];
  publishedAt: Date;
  cover: MediaAsset | null;
  project: { slug: string; title: string };
};

/** Latest public posts across all projects (global feed). */
export async function getLatestPosts(db: Db, limit = 6, now = new Date()): Promise<FeedItem[]> {
  const cover = alias(media, "post_cover");
  const rows = await db
    .select({ post: posts, project: { slug: projects.slug, title: projects.title }, cover })
    .from(posts)
    .innerJoin(projects, eq(projects.id, posts.projectId))
    .leftJoin(cover, eq(cover.id, posts.coverMediaId))
    .where(and(publicPostWhere(now)))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt), desc(posts.id))
    .limit(limit);

  return rows.map(({ post, project, cover: c }) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    type: post.type,
    publishedAt: post.publishedAt,
    cover: toAsset(c),
    project,
  }));
}
