import "server-only";
import { createDb, type Db } from "./create";

/**
 * App-wide database handle. Reused across hot reloads in dev so PGlite is not
 * opened twice on the same data directory.
 */
const globalForDb = globalThis as unknown as { __db?: Promise<Db> };

export function getDb(): Promise<Db> {
  globalForDb.__db ??= createDb();
  return globalForDb.__db;
}
