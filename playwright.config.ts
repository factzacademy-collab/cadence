import { defineConfig, devices } from "@playwright/test";

const CHROME_PATH = "/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    headless: true,
    ...(CHROME_PATH ? { channel: undefined, launchOptions: { executablePath: CHROME_PATH } } : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Dev server is already running — don't start one.
});
