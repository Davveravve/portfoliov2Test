import { mkdirSync } from "node:fs";
import { test, type Page } from "@playwright/test";

/**
 * Visual self-review: full-page screenshots of every page at 390px and 1440px.
 * Output: test-results/screens/<name>-<width>.png — look at them critically.
 */
const PAGES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "design", path: "/design" },
  { name: "404", path: "/this-page-does-not-exist" },
];
const WIDTHS = [390, 1440];
const OUT = "test-results/screens";

async function settle(page: Page) {
  // Wait for hydration, then scroll through once so reveal-on-scroll content
  // and lazy images load.
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete));
  await page.waitForTimeout(800);
}

test.beforeAll(() => mkdirSync(OUT, { recursive: true }));

for (const width of WIDTHS) {
  for (const p of PAGES) {
    test(`${p.name} @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
      await page.goto(p.path);
      await settle(page);
      await page.screenshot({ path: `${OUT}/${p.name}-${width}.png`, fullPage: true });
    });
  }
}

test("mobile menu @ 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/menu-390.png` });
});
