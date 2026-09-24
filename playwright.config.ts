import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

// Isolated database + uploads for e2e so dev data is never touched.
const e2eEnv = {
  PGLITE_DATA_DIR: ".data/pglite-e2e",
  LOCAL_STORAGE_DIR: ".data/uploads-e2e",
  NEXT_PUBLIC_SITE_URL: baseURL,
  NEXT_TELEMETRY_DISABLED: "1",
};

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results/artifacts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    // Use the preinstalled Chromium when present (cloud/CI images).
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    {
      name: "e2e",
      testIgnore: /screens\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "screens",
      testMatch: /screens\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm db:reset && pnpm build && pnpm start -p ${PORT}`,
        url: baseURL,
        env: e2eEnv,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
      },
});
