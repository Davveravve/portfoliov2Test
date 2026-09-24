import "server-only";
import { cache } from "react";
import { getDb } from "@/db/client";
import { formatDateMono } from "@/lib/format";
import { getLatestPosts } from "./queries";

export type LastLog = { href: string; date: string };

/**
 * Newest public post for the system line (header menu + footer). Cached per
 * request; null when there are no posts or the database is unavailable.
 */
export const getLastLog = cache(async (): Promise<LastLog | null> => {
  try {
    const [post] = await getLatestPosts(await getDb(), 1);
    return post
      ? { href: `/projects/${post.project.slug}/${post.slug}`, date: formatDateMono(post.publishedAt) }
      : null;
  } catch {
    return null;
  }
});
