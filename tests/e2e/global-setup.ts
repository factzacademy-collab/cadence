import { chromium, type FullConfig } from "@playwright/test";

const CHROMIUM_PATH =
  "/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";

/**
 * Pre-warm the dev server before the E2E suite starts.
 *
 * Next.js dev mode compiles routes and lazy chunks on first request. If the
 * first test hits a cold server, compilation latency (1–8s per route) eats
 * most of the per-test timeout and produces flaky "element not attached" /
 * "Loading workspace…" failures. This global setup:
 *
 *   1. Loads `/` so the marketing site + all lazy sections compile.
 *   2. Loads `/#app/overview` so the dashboard shell + Overview view compile.
 *   3. Runs the demo sign-in flow once so the NextAuth credentials provider
 *      + Prisma user lookup + JWT issue path are all warm.
 *
 * The dev server is already running on :3000 (system-managed) — we do NOT
 * start one here.
 */
export default async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      baseURL: "http://localhost:3000",
    });
    const page = await context.newPage();

    // 1. Warm the marketing site. Wait for the hero h1 — that guarantees the
    //    lazy MarketingSite chunk has loaded and rendered.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("heading", {
        level: 1,
        name: /social media with real rhythm/i,
      })
      .waitFor({ state: "visible", timeout: 60_000 });

    // 2. Warm the dashboard route by navigating via hash. The dashboard shell
    //    + Overview view compile on first access. Without a session the
    //    dashboard still renders the shell (the Overview view's data hooks
    //    just return empty/loading states).
    await page.goto("/#app/overview", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2_000);

    // 3. Warm the auth flow: open the sign-in dialog and run the demo login
    //    so the credentials callback + Prisma lookup + JWT issue are compiled.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait for hydration (theme toggle mounts → header is interactive).
    await page
      .getByRole("button", { name: /switch to (dark|light) theme/i })
      .first()
      .waitFor({ state: "visible", timeout: 30_000 });
    // Wait for the hero h1 — proves the lazy MarketingSite chunk has loaded.
    await page
      .getByRole("heading", { level: 1, name: /social media with real rhythm/i })
      .waitFor({ state: "visible", timeout: 30_000 });

    // Retry the Sign in click — pre-hydration clicks are no-ops and we'd
    // rather burn 300ms here than have every downstream test fail.
    const dialog = page.getByRole("dialog");
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByRole("button", { name: "Sign in" }).first().click({ timeout: 15_000 });
      try {
        await dialog.waitFor({ state: "visible", timeout: 5_000 });
        break;
      } catch {
        if (attempt === 2) throw new Error("Auth dialog never opened during global setup");
        await page.waitForTimeout(300);
      }
    }
    const demoButton = dialog.getByRole("button", { name: /try the demo/i });
    await demoButton.click({ timeout: 30_000 });
    // Wait for the dashboard to land — confirms the full auth round-trip.
    await page
      .getByRole("heading", {
        level: 1,
        name: /good (morning|afternoon|evening), maya/i,
      })
      .waitFor({ state: "visible", timeout: 60_000 });

    await context.close();
  } finally {
    await browser.close();
  }
}
