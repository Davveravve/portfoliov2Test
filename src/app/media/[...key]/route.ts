import path from "node:path";
import { getStorage } from "@/lib/storage";
import { IMMUTABLE_CACHE } from "@/lib/storage/types";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

/** Serves local-storage uploads. With the S3 driver, media is served by the bucket instead. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[...key]">) {
  const storage = await getStorage();
  if (storage.driver !== "local") return new Response("Not found", { status: 404 });

  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  let body: Uint8Array | null;
  try {
    body = await storage.read(key);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": TYPES[path.extname(key).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": IMMUTABLE_CACHE,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
