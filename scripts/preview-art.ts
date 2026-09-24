// Renders one sample per art style to .data/art-preview for a quick visual check.
import { mkdirSync, writeFileSync } from "node:fs";
import { PALETTES } from "../src/db/seed-data";
import { renderArt } from "../src/db/seed-art";

mkdirSync(".data/art-preview", { recursive: true });
for (const [style, palette] of Object.entries(PALETTES)) {
  for (const seed of ["a", "b"]) {
    const art = await renderArt(style as never, seed, palette, 960, 540);
    writeFileSync(`.data/art-preview/${style}-${seed}.webp`, art.bytes);
  }
}
console.log("✓ wrote .data/art-preview");
