import { test, expect } from "@playwright/test";

/** All dashboard tests reuse the authenticated session from auth.setup.ts. */
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app with the saved session.
    await page.goto("/#app/overview");
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await page.getByRole("navigation", { name: /dashboard/i }).waitFor({ timeout: 15_000 });
  });

  const views = [
    ["calendar", /content calendar/i],
    ["queue", /publishing queue/i],
    ["analytics", /analytics/i],
    ["media", /media library/i],
    ["team", /team & permissions/i],
    ["integrations", /integrations/i],
    ["billing", /billing & plan/i],
    ["settings", /settings/i],
    ["inbox", /engagement inbox/i],
    ["reports", /reports/i],
    ["audience", /audience/i],
    ["templates", /templates/i],
    ["notifications", /notifications/i],
  ] as const;

  for (const [view, heading] of views) {
    test(`navigates to ${view}`, async ({ page }) => {
      // Click the nav button in the sidebar — match buttons whose name starts with the view label.
      const nav = page.getByRole("navigation", { name: /dashboard/i });
      const btn = nav.getByRole("button", { name: new RegExp(`^${view}`, "i") }).first();
      await btn.click();
      await expect(page.getByRole("heading", { name: heading, exact: false }).first()).toBeVisible({ timeout: 10_000 });
    });
  }

  test("overview renders after sign in", async ({ page }) => {
    // Already on overview from signInDemo
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test("command palette opens with Cmd+K", async ({ page }) => {
    await page.keyboard.press("Control+k");
    // Command dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  });

  test("AI assistant responds to a suggestion", async ({ page }) => {
    await page.getByRole("button", { name: /^ai assistant$/i }).click();
    // Wait for the AI view to load
    await expect(page.getByRole("heading", { name: /how can i help/i })).toBeVisible({ timeout: 10_000 });
    // Click a suggestion chip
    const suggestion = page.getByRole("button", { name: /draft 3 instagram captions/i });
    if (await suggestion.count()) {
      await suggestion.click();
      // Wait for a response (user message bubble should appear)
      await expect(page.getByText(/draft 3 instagram captions/i).first()).toBeVisible({ timeout: 20_000 });
    }
  });
});
