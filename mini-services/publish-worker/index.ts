/**
 * Cadence Publish Worker
 *
 * A background job worker that polls the database for scheduled posts whose
 * scheduledAt time has arrived, "publishes" them (marks status=published and
 * records mock metrics), and logs activity.
 *
 * In a real deployment this would call each platform's publish API. Here it
 * simulates publishing so the scheduling flow is fully functional end-to-end.
 *
 * Runs on port 3010 (exposes a tiny health/status endpoint for observability).
 * Start with: `bun run dev` (in this directory) — auto-restarts on file change.
 */
import { PrismaClient } from "/home/z/my-project/node_modules/@prisma/client";

const db = new PrismaClient();
const PORT = 3010;
const POLL_INTERVAL_MS = 30_000; // every 30 seconds
const PUBLISH_WINDOW_MS = 60_000; // publish posts due within the last 60s

function log(msg: string) {
  console.log(`[publish-worker ${new Date().toISOString()}] ${msg}`);
}

function mockMetrics() {
  const impressions = Math.floor(2400 + Math.random() * 60000);
  const reach = Math.floor(impressions * (0.62 + Math.random() * 0.25));
  return {
    impressions,
    reach,
    likes: Math.floor(reach * (0.02 + Math.random() * 0.06)),
    comments: Math.floor(4 + Math.random() * 400),
    shares: Math.floor(2 + Math.random() * 250),
    clicks: Math.floor(40 + Math.random() * 3000),
    saves: Math.floor(8 + Math.random() * 1200),
  };
}

async function publishDuePosts() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - PUBLISH_WINDOW_MS);
  try {
    const due = await db.post.findMany({
      where: {
        status: "scheduled",
        scheduledAt: { lte: now, gte: cutoff },
      },
      include: { workspace: true },
    });

    if (due.length === 0) return;

    log(`Found ${due.length} post(s) due for publishing.`);
    for (const post of due) {
      try {
        await db.post.update({
          where: { id: post.id },
          data: {
            status: "published",
            metricsJson: JSON.stringify(mockMetrics()),
          },
        });
        await db.activityEvent.create({
          data: {
            workspaceId: post.workspaceId,
            actor: "Cadence Worker",
            action: "published",
            target: post.text.slice(0, 40) + (post.text.length > 40 ? "…" : ""),
            icon: "publish",
          },
        });
        log(`✓ Published post ${post.id} ("${post.text.slice(0, 40)}…")`);
      } catch (e) {
        log(`✗ Failed to publish post ${post.id}: ${e}`);
      }
    }
  } catch (e) {
    log(`Polling error: ${e}`);
  }
}

async function main() {
  log(`Cadence publish worker started (port ${PORT}, poll every ${POLL_INTERVAL_MS / 1000}s).`);
  // Run once immediately, then on interval.
  await publishDuePosts();
  setInterval(publishDuePosts, POLL_INTERVAL_MS);

  // Tiny HTTP health/status server.
  const server = Bun.serve({
    port: PORT,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ ok: true, service: "publish-worker", time: new Date().toISOString() }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname === "/run") {
        // Manual trigger (for testing).
        publishDuePosts().then(() => {
          log("Manual publish run triggered.");
        });
        return new Response(JSON.stringify({ triggered: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Cadence Publish Worker\n\nGET /health — health check\nGET /run — trigger a publish cycle", {
        headers: { "Content-Type": "text/plain" },
      });
    },
  });
  log(`Health endpoint: http://localhost:${PORT}/health`);

  process.on("SIGINT", () => {
    log("Shutting down…");
    server.stop();
    db.$disconnect();
    process.exit(0);
  });
}

main().catch((e) => {
  log(`Fatal: ${e}`);
  process.exit(1);
});
