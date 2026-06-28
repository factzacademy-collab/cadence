import { test as base, expect as pwExpect, type Page } from "@playwright/test";

/**
 * Shared auth helpers for Cadence E2E tests.
 *
 * Cadence uses NextAuth credentials auth. The fastest deterministic way to
 * sign in for tests is to click the "Try the demo" button in the AuthDialog
 * (it posts demo@cadence.app / cadence123 — already seeded in the DB). Tests
 * are isolated: each Playwright test gets a fresh browser context, so there
 * is no shared session state to clean up between tests.
 */

// Re-export so specs can `import { test, expect } from "./_helpers"` and
// get a single, consistent source for both.
export const expect = pwExpect;

/**
 * Wait for the marketing site to be hydrated and interactive.
 *
 * In Next.js dev mode the SSR HTML arrives quickly but React hydration (which
 * attaches onClick handlers) can lag by a few hundred ms — especially when
 * the dev server is also compiling a lazy chunk. Clicking the Sign in button
 * before hydration completes is a no-op (the click lands on the SSR button
 * but no React handler responds), which produces flaky "dialog not visible"
 * failures.
 *
 * The most reliable hydration marker we have is the site-header ThemeToggle:
 * its `mounted` flag flips the rendered icon from the SSR default (Sun) to the
 * post-mount state (Moon in light mode, Sun in dark mode — but in either case
 * the button is then interactive). We wait for the toggle to be visible AND
 * stable, which is enough to guarantee the header has hydrated.
 */
async function waitForHydration(page: Page) {
  // The desktop theme toggle is the first button with the "Switch to … theme"
  // aria-label. Waiting for it to be visible proves the header has rendered.
  // We then wait for the page to settle (no pending route changes or chunk
  // loads) by checking that the hero h1 is stable.
  await page
    .getByRole("button", { name: /switch to (dark|light) theme/i })
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
  // Also wait for the hero h1 — proves the lazy MarketingSite chunk has
  // loaded and the Suspense fallback is gone.
  await page
    .getByRole("heading", { level: 1, name: /social media with real rhythm/i })
    .waitFor({ state: "visible", timeout: 30_000 });
}

/**
 * Open the auth dialog by clicking the header "Sign in" button.
 *
 * Retries on the off-chance the click lands during the brief pre-hydration
 * window (SSR HTML is visible but React hasn't attached onClick handlers
 * yet). In practice a single click almost always works once
 * `waitForHydration` has returned, but the retry makes the suite
 * bulletproof against cold-dev-server flakiness.
 */
async function openAuthDialog(page: Page) {
  const dialog = page.getByRole("dialog");
  for (let attempt = 0; attempt < 3; attempt++) {
    const signIn = page.getByRole("button", { name: "Sign in" }).first();
    await signIn.click({ timeout: 15_000 });
    // Give the dialog a moment to mount (Radix Dialog uses a Portal + a
    // short CSS enter animation).
    try {
      await dialog.waitFor({ state: "visible", timeout: 5_000 });
      return;
    } catch {
      // Dialog didn't open — likely a pre-hydration click. Wait briefly
      // and retry. The next attempt will hit a fully-hydrated header.
      await page.waitForTimeout(300);
    }
  }
  // Final attempt: throw if still not open.
  await expect(dialog).toBeVisible({ timeout: 10_000 });
}

/** Sign in via the "Try the demo" flow and land on the dashboard Overview. */
export async function signInViaDemo(page: Page) {
  await page.goto("/");
  await waitForHydration(page);

  await openAuthDialog(page);

  const dialog = page.getByRole("dialog");
  // The "Try the demo" button calls signIn("credentials", demo) and on
  // success closes the dialog and calls goApp("overview").
  const demoButton = dialog.getByRole("button", { name: /try the demo/i });
  await expect(demoButton).toBeVisible();
  await demoButton.click();

  // URL hash becomes #app/overview once goApp runs and the hash sync
  // effect fires. Auto-waiting retries until the regex matches.
  await expect(page).toHaveURL(/#app\/overview/);

  // Dashboard Overview greeting: "{Good morning|afternoon|evening}, Maya · …"
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /good (morning|afternoon|evening), maya/i,
    })
  ).toBeVisible();
}

/**
 * Click a sidebar nav item by its visible label (e.g., "Calendar",
 * "AI Assistant"). Scoped to the primary dashboard nav so it doesn't
 * accidentally match buttons in the topbar or sheets.
 */
export async function clickSidebarNav(page: Page, label: string) {
  const nav = page.getByRole("navigation", { name: "Dashboard" });
  const button = nav.getByRole("button", { name: label, exact: true });
  await button.click();
}

/** Re-export `test` so specs can `import { test, expect } from "./_helpers"`. */
export const test = base;
