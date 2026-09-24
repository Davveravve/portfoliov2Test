import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", [
  "prototype",
  "in_development",
  "released",
  "on_hold",
  "archived",
]);

export const postType = pgEnum("post_type", ["devlog", "milestone", "release", "showcase"]);
export const postStatus = pgEnum("post_status", ["draft", "published", "scheduled"]);
export const mediaKind = pgEnum("media_kind", ["image", "gif", "video"]);
export const subscriberStatus = pgEnum("subscriber_status", ["pending", "confirmed", "unsubscribed"]);

export type ProjectLinks = {
  steam?: string;
  itch?: string;
  github?: string;
  trailer?: string;
  website?: string;
};

// Millisecond precision everywhere so JS Dates round-trip exactly (keyset cursors depend on it).
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Storage key, e.g. `2026/03/abc123-hero.webp`. */
    key: text("key").notNull().unique(),
    kind: mediaKind("kind").notNull(),
    mime: text("mime").notNull(),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes").notNull(),
    /** Required: every upload must be described. */
    alt: text("alt").notNull(),
    /** Poster frame for videos (storage key of an image). */
    posterKey: text("poster_key"),
    /** Tiny base64 placeholder for next/image `blurDataURL`. */
    blurDataUrl: text("blur_data_url"),
    ...timestamps,
  },
  (t) => [index("media_created_idx").on(t.createdAt)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull().default(""),
    summary: text("summary").notNull().default(""),
    status: projectStatus("status").notNull().default("prototype"),
    coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    tech: text("tech")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    platforms: text("platforms")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    links: jsonb("links").$type<ProjectLinks>().notNull().default({}),
    startedAt: date("started_at", { mode: "string" }),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("projects_sort_idx").on(t.sortOrder)],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull().default(""),
    coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    type: postType("type").notNull().default("devlog"),
    status: postStatus("status").notNull().default("draft"),
    /** Display date. Overridable for backfilling; for `scheduled` it is the go-live time. */
    publishedAt: timestamp("published_at", { withTimezone: true, precision: 3 }).notNull().defaultNow(),
    pinned: boolean("pinned").notNull().default(false),
    /** Set once subscribers were notified — makes notifications idempotent. */
    notifiedAt: timestamp("notified_at", { withTimezone: true, precision: 3 }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("posts_project_slug_idx").on(t.projectId, t.slug),
    index("posts_timeline_idx").on(t.projectId, t.publishedAt.desc(), t.createdAt.desc(), t.id),
    index("posts_feed_idx").on(t.publishedAt.desc()),
  ],
);

export const postMedia = pgTable(
  "post_media",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.mediaId] }), index("post_media_media_idx").on(t.mediaId)],
);

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Null = subscribed to everything (global feed). */
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    status: subscriberStatus("status").notNull().default("pending"),
    token: text("token").notNull().unique(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true, precision: 3 }),
    ...timestamps,
  },
  (t) => [unique("subscribers_project_email_uq").on(t.projectId, t.email).nullsNotDistinct()],
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  cover: one(media, { fields: [projects.coverMediaId], references: [media.id] }),
  posts: many(posts),
  subscribers: many(subscribers),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  project: one(projects, { fields: [posts.projectId], references: [projects.id] }),
  cover: one(media, { fields: [posts.coverMediaId], references: [media.id] }),
  media: many(postMedia),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, { fields: [postMedia.postId], references: [posts.id] }),
  media: one(media, { fields: [postMedia.mediaId], references: [media.id] }),
}));

export const subscribersRelations = relations(subscribers, ({ one }) => ({
  project: one(projects, { fields: [subscribers.projectId], references: [projects.id] }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type ProjectStatus = (typeof projectStatus.enumValues)[number];
export type PostType = (typeof postType.enumValues)[number];
export type PostStatus = (typeof postStatus.enumValues)[number];
export type MediaKind = (typeof mediaKind.enumValues)[number];
