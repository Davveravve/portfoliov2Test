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

/** Images that have been given a source (in or near the viewport) must have finished loading. */
async function waitForImages(page: Page) {
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => !img.currentSrc || img.complete),
    undefined,
    { timeout: 15_000 },
  );
}

async function settle(page: Page) {
  // Wait for hydration, then sweep the page so reveal-on-scroll content and
  // lazy images load. Smooth scrolling is disabled so each step really lands.
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await waitForImages(page);
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

// Above-the-fold checks: the showreel must be visible on first paint on both devices.
for (const [width, height] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`home fold @ ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForImages(page);
    await page.screenshot({ path: `${OUT}/home-fold-${width}.png` });
  });
}

test("mobile menu @ 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/menu-390.png` });
});
