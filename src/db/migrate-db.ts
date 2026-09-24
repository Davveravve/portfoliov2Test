import path from "node:path";
import type { Db } from "./create";

/** Applies SQL migrations from /drizzle. Works for PGlite and postgres.js. */
export async function migrateDb(db: Db): Promise<void> {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (process.env.DATABASE_URL) {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    await migrate(db as never, { migrationsFolder });
  } else {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db, { migrationsFolder });
  }
}
