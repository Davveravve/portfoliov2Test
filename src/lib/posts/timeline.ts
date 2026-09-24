import type { PostType } from "@/db/schema";
import { isPublic, type VisibilityFields } from "./visibility";

export type TimelinePost = VisibilityFields & {
  id: string;
  createdAt: Date;
  pinned: boolean;
  type: PostType;
};

export type TimelineCursor = { publishedAt: Date; createdAt: Date; id: string };

export type Timeline<T extends TimelinePost> = {
  /** Pinned posts (also present in their chronological position). Never contains the origin. */
  pinned: T[];
  /** This page of entries, newest first. Never contains the origin. */
  entries: T[];
  /** Oldest public post: always anchored at the bottom as "Project started". */
  origin: T | null;
  /** Public posts older than this page, excluding the origin. */
  olderCount: number;
  /** Pass back as `cursor` to load the next (older) page. */
  nextCursor: string | null;
};

/** Newest first; deterministic tie-breaks on createdAt then id. */
export function compareTimeline(a: TimelineCursor, b: TimelineCursor): number {
  return (
    b.publishedAt.getTime() - a.publishedAt.getTime() ||
    b.createdAt.getTime() - a.createdAt.getTime() ||
    (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)
  );
}

export function encodeCursor(p: TimelineCursor): string {
  return Buffer.from(`${p.publishedAt.toISOString()}|${p.createdAt.toISOString()}|${p.id}`).toString("base64url");
}

export function decodeCursor(cursor: string | null | undefined): TimelineCursor | null {
  if (!cursor) return null;
  const parts = Buffer.from(cursor, "base64url").toString("utf8").split("|");
  if (parts.length !== 3) return null;
  const [p, c, id] = parts as [string, string, string];
  const publishedAt = new Date(p);
  const createdAt = new Date(c);
  if (Number.isNaN(publishedAt.getTime()) || Number.isNaN(createdAt.getTime()) || !id) return null;
  return { publishedAt, createdAt, id };
}

/** True if `post` comes strictly after (is older than) `cursor` in timeline order. */
export function isAfterCursor(post: TimelineCursor, cursor: TimelineCursor): boolean {
  return compareTimeline(cursor, post) < 0;
}

export type BuildTimelineOptions = { now?: Date; limit?: number; cursor?: string | null };

/**
 * Builds one page of a project timeline from all of the project's posts.
 * Rules are documented in SPEC.md §3.
 */
export function buildTimeline<T extends TimelinePost>(
  posts: readonly T[],
  options: BuildTimelineOptions = {},
): Timeline<T> {
  const now = options.now ?? new Date();
  const limit = Math.max(1, options.limit ?? 10);
  const cursor = decodeCursor(options.cursor);

  const ordered = posts.filter((p) => isPublic(p, now)).sort(compareTimeline);
  const origin = ordered.at(-1) ?? null;
  const rest = origin ? ordered.slice(0, -1) : ordered;

  const remaining = cursor ? rest.filter((p) => isAfterCursor(p, cursor)) : rest;
  const entries = remaining.slice(0, limit);
  const olderCount = remaining.length - entries.length;
  const last = entries.at(-1);

  return {
    pinned: cursor ? [] : rest.filter((p) => p.pinned),
    entries,
    origin,
    olderCount,
    nextCursor: olderCount > 0 && last ? encodeCursor(last) : null,
  };
}

/** Visual weight of a timeline marker. Higher = stronger. */
export function markerWeight(type: PostType): 0 | 1 | 2 | 3 {
  switch (type) {
    case "release":
      return 3;
    case "milestone":
      return 2;
    case "showcase":
      return 1;
    default:
      return 0;
  }
}

/** Prev (older) / next (newer) neighbours of a post within its project. */
export function neighbours<T extends TimelinePost>(posts: readonly T[], id: string, now: Date = new Date()) {
  const ordered = posts.filter((p) => isPublic(p, now)).sort(compareTimeline);
  const i = ordered.findIndex((p) => p.id === id);
  if (i === -1) return { newer: null, older: null };
  return { newer: ordered[i - 1] ?? null, older: ordered[i + 1] ?? null };
}
