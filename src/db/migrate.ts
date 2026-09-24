import { createDb } from "./create";
import { migrateDb } from "./migrate-db";

const db = await createDb();
await migrateDb(db);
console.log(`✓ migrations applied (${process.env.DATABASE_URL ? "postgres" : "pglite"})`);
process.exit(0);
