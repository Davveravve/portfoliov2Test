export type PutOptions = {
  contentType: string;
  /** Defaults to immutable, 1 year — keys are content-addressed. */
  cacheControl?: string;
};

export interface Storage {
  readonly driver: "local" | "s3";
  put(key: string, body: Uint8Array, options: PutOptions): Promise<void>;
  read(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
  /** Public URL for a key (relative for local storage, absolute for S3). */
  url(key: string): string;
}

export const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

/** Rejects path traversal and anything outside a conservative key alphabet. */
export function assertSafeKey(key: string): void {
  if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(key) || key.includes("..") || key.includes("//")) {
    throw new Error(`Invalid storage key: ${key}`);
  }
}
