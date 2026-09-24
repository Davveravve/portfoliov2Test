import { createDb, type Db } from "@/db/create";
import { migrateDb } from "@/db/migrate-db";

/** Fresh, migrated in-memory Postgres (PGlite) per call. */
export async function createTestDb(): Promise<Db> {
  const prev = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const db = await createDb({ pgliteDataDir: "memory://" });
  await migrateDb(db);
  if (prev !== undefined) process.env.DATABASE_URL = prev;
  return db;
}
