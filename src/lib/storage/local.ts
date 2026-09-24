import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertSafeKey, type Storage } from "./types";

/** Filesystem storage for development. Files are served by `/media/[...key]`. */
export function createLocalStorage(rootDir: string): Storage {
  const root = path.resolve(rootDir);
  const resolve = (key: string) => {
    assertSafeKey(key);
    const full = path.resolve(root, key);
    if (!full.startsWith(root + path.sep)) throw new Error(`Invalid storage key: ${key}`);
    return full;
  };

  return {
    driver: "local",
    async put(key: string, body: Uint8Array) {
      const file = resolve(key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body);
    },
    async read(key: string) {
      try {
        return new Uint8Array(await readFile(resolve(key)));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    },
    async delete(key: string) {
      await rm(resolve(key), { force: true });
    },
    url(key: string) {
      assertSafeKey(key);
      return `/media/${key}`;
    },
  };
}
