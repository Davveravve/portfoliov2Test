import { createLocalStorage } from "./local";
import type { Storage } from "./types";

export type { Storage } from "./types";

let instance: Promise<Storage> | undefined;

/** Storage selected by `STORAGE_DRIVER`. See `.env.example`. */
export function getStorage(): Promise<Storage> {
  instance ??= createStorageFromEnv(process.env);
  return instance;
}

export async function createStorageFromEnv(e: Record<string, string | undefined>): Promise<Storage> {
  if ((e.STORAGE_DRIVER || "local") === "s3") {
    const missing = ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_URL"].filter((k) => !e[k]);
    if (missing.length) throw new Error(`STORAGE_DRIVER=s3 requires ${missing.join(", ")}`);
    const { createS3Storage } = await import("./s3");
    return createS3Storage({
      endpoint: e.S3_ENDPOINT || undefined,
      region: e.S3_REGION || "auto",
      bucket: e.S3_BUCKET!,
      accessKeyId: e.S3_ACCESS_KEY_ID!,
      secretAccessKey: e.S3_SECRET_ACCESS_KEY!,
      publicUrl: e.S3_PUBLIC_URL!,
    });
  }
  return createLocalStorage(e.LOCAL_STORAGE_DIR || ".data/uploads");
}

/** Public URL for a stored key, resolved synchronously for the configured driver. */
export function mediaUrl(key: string): string {
  if ((process.env.STORAGE_DRIVER || "local") === "s3" && process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `/media/${key}`;
}
