import { expect, test } from "@playwright/test";

test.describe("layout shell", () => {
  test("home renders hero, featured projects and latest updates", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();

    const work = page.locator("section", { has: page.getByRole("heading", { name: "Projects" }) });
    await expect(work.getByRole("article")).toHaveCount(3);

    const latest = page.locator("#latest");
    await expect(latest.getByRole("listitem")).toHaveCount(6);
    // Drafts and not-yet-live scheduled posts never leak into the feed.
    await expect(latest).not.toContainText("Material presets");
    await expect(latest).not.toContainText("Fab release date");
  });

  test("every image has alt text", async ({ page }) => {
    await page.goto("/");
    const missing = await page.locator("img:not([alt]), img[alt='']").count();
    expect(missing).toBe(0);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("mobile menu opens, traps nothing, closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    const nav = page.getByRole("navigation", { name: "Mobile" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("unknown routes render the styled 404", async ({ page }) => {
    const res = await page.goto("/definitely-not-here");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /out of bounds/i })).toBeVisible();
  });

  test("design reference page is noindex", async ({ page }) => {
    await page.goto("/design");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("media route", () => {
  test("serves seeded media with immutable caching", async ({ request }) => {
    // Seed keys are content-addressed, so discover one from the rendered page.
    const html = await (await request.get("/")).text();
    const key = html.replaceAll("%2F", "/").match(/\/media\/seed\/[\w-]+\.webp/)?.[0];
    expect(key).toBeTruthy();
    const res = await request.get(key!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/webp");
    expect(res.headers()["cache-control"]).toContain("immutable");
  });

  test("rejects path traversal", async ({ request }) => {
    const res = await request.get("/media/..%2F..%2Fpackage.json");
    expect([400, 404]).toContain(res.status());
  });
});
