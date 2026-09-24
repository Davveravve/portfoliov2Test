import type { PostStatus } from "@/db/schema";

export type VisibilityFields = { status: PostStatus; publishedAt: Date };

/**
 * A post is public iff it is published or scheduled AND its date has passed.
 * Scheduled posts go live by time alone; no job needs to flip their status.
 */
export function isPublic(post: VisibilityFields, now: Date = new Date()): boolean {
  if (post.status === "draft") return false;
  return post.publishedAt.getTime() <= now.getTime();
}

export type EffectiveState = "draft" | "scheduled" | "live";

/** What the admin should show: a scheduled post whose time has passed is live. */
export function effectiveState(post: VisibilityFields, now: Date = new Date()): EffectiveState {
  if (post.status === "draft") return "draft";
  return isPublic(post, now) ? "live" : "scheduled";
}
