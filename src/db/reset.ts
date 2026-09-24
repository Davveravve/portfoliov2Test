import { rmSync } from "node:fs";

if (process.env.DATABASE_URL) {
  console.error("db:reset only wipes the local PGlite database. Refusing to touch DATABASE_URL.");
  process.exit(1);
}
const dir = process.env.PGLITE_DATA_DIR || ".data/pglite";
rmSync(dir, { recursive: true, force: true });
rmSync(process.env.LOCAL_STORAGE_DIR || ".data/uploads", { recursive: true, force: true });
console.log(`✓ removed ${dir} and local uploads`);
