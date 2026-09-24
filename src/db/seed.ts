import { createHash } from "node:crypto";
import { createStorageFromEnv, mediaUrl } from "@/lib/storage";
import { createDb, type Db } from "./create";
import { migrateDb } from "./migrate-db";
import { media, postMedia, posts, projects, subscribers } from "./schema";
import { renderArt } from "./seed-art";
import { PALETTES, SEED_PROJECTS } from "./seed-data";

const DAY = 86_400_000;

/**
 * Wipes content tables and inserts 3 sample projects with ~15 published posts
 * spread over months (plus a draft and a scheduled post), with generated
 * media stored through the configured storage driver.
 */
export async function seed(db: Db, now = new Date()) {
  const storage = await createStorageFromEnv(process.env);

  await db.delete(subscribers);
  await db.delete(posts);
  await db.delete(projects);
  await db.delete(media);

  async function createMedia(style: keyof typeof PALETTES, seedKey: string, alt: string) {
    const art = await renderArt(style, seedKey, PALETTES[style]);
    // Content-addressed so immutable caches never serve stale art after a reseed.
    const hash = createHash("sha256").update(art.bytes).digest("hex").slice(0, 10);
    const key = `seed/${seedKey}-${hash}.webp`;
    await storage.put(key, art.bytes, { contentType: "image/webp" });
    const [row] = await db
      .insert(media)
      .values({
        key,
        kind: "image",
        mime: "image/webp",
        width: art.width,
        height: art.height,
        sizeBytes: art.bytes.byteLength,
        alt,
        blurDataUrl: art.blurDataUrl,
      })
      .returning();
    return row!;
  }

  let postCount = 0;
  for (const [index, p] of SEED_PROJECTS.entries()) {
    const cover = await createMedia(p.art, `${p.slug}-cover`, p.coverAlt);
    const [project] = await db
      .insert(projects)
      .values({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        summary: p.summary,
        status: p.status,
        coverMediaId: cover.id,
        tech: p.tech,
        platforms: p.platforms,
        links: p.links,
        startedAt: new Date(now.getTime() - p.startedDaysAgo * DAY).toISOString().slice(0, 10),
        featured: p.featured,
        sortOrder: index,
      })
      .returning();

    for (const sp of p.posts) {
      const postCover = sp.coverAlt ? await createMedia(p.art, `${p.slug}-${sp.slug}`, sp.coverAlt) : null;
      const shots = await Promise.all(
        (sp.shots ?? []).map((alt, i) => createMedia(p.art, `${p.slug}-${sp.slug}-shot-${i}`, alt)),
      );
      const body = sp.body.replace(/\{\{shot:(\d+)\}\}/g, (_, n: string) => {
        const shot = shots[Number(n)];
        return shot ? `![${shot.alt}](${mediaUrl(shot.key)})` : "";
      });
      // Stagger times within the day so posts don't all land on midnight.
      const publishedAt = new Date(now.getTime() - sp.daysAgo * DAY - (postCount % 7) * 3_600_000);

      const [post] = await db
        .insert(posts)
        .values({
          projectId: project!.id,
          slug: sp.slug,
          title: sp.title,
          excerpt: sp.excerpt ?? null,
          body,
          coverMediaId: postCover?.id ?? null,
          type: sp.type,
          status: sp.status ?? "published",
          publishedAt,
          createdAt: sp.daysAgo > 0 ? publishedAt : now,
          pinned: sp.pinned ?? false,
          notifiedAt: (sp.status ?? "published") === "published" ? publishedAt : null,
        })
        .returning();

      const used = [postCover, ...shots].filter((m) => m !== null);
      if (used.length) {
        await db.insert(postMedia).values(used.map((m, position) => ({ postId: post!.id, mediaId: m.id, position })));
      }
      postCount++;
    }
  }
  return { projects: SEED_PROJECTS.length, posts: postCount };
}

// Run directly: `pnpm db:seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  const db = await createDb();
  await migrateDb(db);
  const result = await seed(db);
  console.log(`✓ seeded ${result.projects} projects, ${result.posts} posts`);
  process.exit(0);
}
