import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { assertSafeKey, IMMUTABLE_CACHE, type PutOptions, type Storage } from "./types";

export type S3StorageConfig = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Public base URL the bucket is served from (R2 custom domain / r2.dev). */
  publicUrl: string;
};

/** S3-compatible storage (Cloudflare R2, AWS S3, MinIO). */
export function createS3Storage(config: S3StorageConfig): Storage {
  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: Boolean(config.endpoint),
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
  const base = config.publicUrl.replace(/\/$/, "");

  return {
    driver: "s3",
    async put(key: string, body: Uint8Array, options: PutOptions) {
      assertSafeKey(key);
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: options.contentType,
          CacheControl: options.cacheControl ?? IMMUTABLE_CACHE,
        }),
      );
    },
    async read(key: string) {
      assertSafeKey(key);
      try {
        const res = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
        return res.Body ? await res.Body.transformToByteArray() : null;
      } catch (error) {
        if ((error as { name?: string }).name === "NoSuchKey") return null;
        throw error;
      }
    },
    async delete(key: string) {
      assertSafeKey(key);
      await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    },
    url(key: string) {
      assertSafeKey(key);
      return `${base}/${key}`;
    },
  };
}
