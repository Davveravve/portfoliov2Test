import { mkdirSync } from "node:fs";
import * as schema from "./schema";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";

export type Db = PgliteDatabase<typeof schema>;

export type CreateDbOptions = {
  /** Postgres URL. When empty, PGlite is used. */
  databaseUrl?: string;
  /** PGlite data dir, or `memory://`. */
  pgliteDataDir?: string;
};

/**
 * Creates a Drizzle instance for either real Postgres (postgres.js) or
 * embedded PGlite. Both expose the same query API; the Postgres instance is
 * typed as the PGlite one because the query builder surface is identical.
 */
export async function createDb(options: CreateDbOptions = {}): Promise<Db> {
  const databaseUrl = options.databaseUrl ?? (process.env.DATABASE_URL || undefined);

  if (databaseUrl) {
    const { default: postgres } = await import("postgres");
    const client = postgres(databaseUrl, { max: process.env.VERCEL ? 1 : 10, prepare: false });
    return drizzlePostgres(client, { schema, casing: "snake_case" }) as unknown as Db;
  }

  const dataDir = options.pgliteDataDir ?? (process.env.PGLITE_DATA_DIR || ".data/pglite");
  const { PGlite } = await import("@electric-sql/pglite");
  if (!dataDir.startsWith("memory://")) mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  await client.waitReady;
  return drizzlePglite(client, { schema, casing: "snake_case" });
}
