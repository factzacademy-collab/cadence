import { test, expect } from "@playwright/test";

test.describe("authentication", () => {
  test("sign in dialog opens and demo login works", async ({ page }) => {
    await page.goto("/");
    // Hide any dev overlay portals
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });

    // Click Sign in
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    // Click "Try the demo"
    await page.getByRole("button", { name: /try the demo/i }).click();

    // Should navigate to the dashboard
    await expect(page).toHaveURL(/#app\/overview/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
