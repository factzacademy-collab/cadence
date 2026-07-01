import { test as setup, expect } from "@playwright/test";

/**
 * Global setup: sign in once via the demo flow and save the storage state
 * (cookies + localStorage) so all dashboard tests can reuse the session
 * without re-authenticating. This eliminates the flaky sign-in failures.
 */
const AUTH_FILE = "tests/e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  // Wait for the header to be ready
  await page.locator("header").waitFor({ timeout: 15_000 });
  await page.locator("header").getByRole("button", { name: /^sign in$/i }).click();
  await page.getByRole("heading", { name: /welcome back/i }).waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: /try the demo/i }).click();
  await page.waitForURL(/#app\/overview/, { timeout: 25_000 });
  await page.getByRole("navigation", { name: /dashboard/i }).waitFor({ timeout: 15_000 });
  await expect(page).toHaveURL(/#app\/overview/);
  await page.context().storageState({ path: AUTH_FILE });
});
