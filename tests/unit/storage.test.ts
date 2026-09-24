import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createStorageFromEnv } from "@/lib/storage";
import { createLocalStorage } from "@/lib/storage/local";

const dirs: string[] = [];
afterAll(async () => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));

async function tmp() {
  const d = await mkdtemp(path.join(os.tmpdir(), "storage-"));
  dirs.push(d);
  return d;
}

describe("local storage", () => {
  it("puts, reads, deletes and builds URLs", async () => {
    const s = createLocalStorage(await tmp());
    const body = new TextEncoder().encode("hello");
    await s.put("2026/01/a.txt", body, { contentType: "text/plain" });
    expect(new TextDecoder().decode((await s.read("2026/01/a.txt"))!)).toBe("hello");
    expect(s.url("2026/01/a.txt")).toBe("/media/2026/01/a.txt");
    await s.delete("2026/01/a.txt");
    expect(await s.read("2026/01/a.txt")).toBeNull();
  });

  it("rejects path traversal", async () => {
    const s = createLocalStorage(await tmp());
    await expect(s.read("../etc/passwd")).rejects.toThrow(/Invalid storage key/);
    await expect(s.put("/abs", new Uint8Array(), { contentType: "x" })).rejects.toThrow(/Invalid storage key/);
    await expect(s.read("a/../../b")).rejects.toThrow(/Invalid storage key/);
  });
});

describe("createStorageFromEnv", () => {
  it("defaults to local", async () => {
    expect((await createStorageFromEnv({})).driver).toBe("local");
  });

  it("requires all S3 vars for the s3 driver", async () => {
    await expect(createStorageFromEnv({ STORAGE_DRIVER: "s3" })).rejects.toThrow(/S3_BUCKET/);
  });

  it("builds public S3 URLs from S3_PUBLIC_URL", async () => {
    const s = await createStorageFromEnv({
      STORAGE_DRIVER: "s3",
      S3_BUCKET: "b",
      S3_ACCESS_KEY_ID: "k",
      S3_SECRET_ACCESS_KEY: "s",
      S3_PUBLIC_URL: "https://media.example.com/",
      S3_ENDPOINT: "https://acc.r2.cloudflarestorage.com",
    });
    expect(s.driver).toBe("s3");
    expect(s.url("2026/01/a.webp")).toBe("https://media.example.com/2026/01/a.webp");
  });
});
