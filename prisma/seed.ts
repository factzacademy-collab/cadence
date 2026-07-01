/**
 * Database seeder for Cadence.
 * Run with: `bun run db:seed`
 *
 * Provisions:
 * - A demo user (demo@cadence.app / password "cadence123")
 * - Their personal workspace + Owner membership
 * - Connected social accounts, campaigns, a few published posts, integrations,
 *   team members, inbox items, and activity events.
 *
 * Idempotent: safe to run multiple times (skips if demo user exists).
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword, gradientFor } from "../src/lib/password";

const db = new PrismaClient();

const PLATFORMS = [
  "instagram", "x", "linkedin", "tiktok", "youtube", "facebook", "threads", "pinterest",
] as const;

async function main() {
  const email = "demo@cadence.app";
  let user = await db.user.findUnique({ where: { email } });
  if (user) {
    console.log(`✓ Demo user already exists (${email}). Skipping seed.`);
    return;
  }

  console.log("→ Creating demo user…");
  user = await db.user.create({
    data: {
      name: "Maya Okafor",
      email,
      passwordHash: hashPassword("cadence123"),
      avatarColor: gradientFor(email),
    },
  });

  console.log("→ Creating workspace…");
  const workspace = await db.workspace.create({
    data: {
      name: "Cadence HQ",
      slug: "cadence-hq",
      plan: "team",
      memberships: { create: { userId: user.id, role: "Owner" } },
    },
  });

  // A second workspace so the switcher is demoable.
  const workspace2 = await db.workspace.create({
    data: {
      name: "Side Studio",
      slug: "side-studio",
      plan: "free",
      memberships: { create: { userId: user.id, role: "Owner" } },
    },
  });

  console.log("→ Seeding social accounts…");
  const accountData = [
    { platform: "instagram", handle: "@cadencehq", displayName: "Cadence", followers: 184200, connected: true },
    { platform: "x", handle: "@cadence", displayName: "Cadence", followers: 92300, connected: true },
    { platform: "linkedin", handle: "cadence", displayName: "Cadence", followers: 64100, connected: true },
    { platform: "tiktok", handle: "@cadence", displayName: "Cadence", followers: 211400, connected: true },
    { platform: "youtube", handle: "@cadence", displayName: "Cadence", followers: 38900, connected: true },
    { platform: "facebook", handle: "/cadence", displayName: "Cadence", followers: 51200, connected: true },
    { platform: "threads", handle: "@cadence", displayName: "Cadence", followers: 27800, connected: false },
    { platform: "pinterest", handle: "cadence", displayName: "Cadence", followers: 15600, connected: false },
  ];
  for (const a of accountData) {
    await db.socialAccount.create({ data: { ...a, workspaceId: workspace.id } });
  }

  console.log("→ Seeding campaigns…");
  const now = new Date();
  const campaigns = [
    { name: "Spring Launch 2025", color: "var(--primary)", startDate: new Date(now.getTime() - 10 * 864e5), endDate: new Date(now.getTime() + 20 * 864e5), status: "active" },
    { name: "Creator Series", color: "var(--coral)", startDate: new Date(now.getTime() - 30 * 864e5), endDate: new Date(now.getTime() + 5 * 864e5), status: "active" },
    { name: "Q2 Brand Awareness", color: "var(--amber-brand)", startDate: new Date(now.getTime() + 2 * 864e5), endDate: new Date(now.getTime() + 60 * 864e5), status: "planned" },
  ];
  for (const c of campaigns) {
    await db.campaign.create({ data: { ...c, workspaceId: workspace.id } });
  }

  console.log("→ Seeding team members…");
  const team = [
    { name: "Leo Brennan", email: "leo@cadence.app", role: "Admin", avatarColor: "from-coral to-amber-brand", status: "active" },
    { name: "Priya Sharma", email: "priya@cadence.app", role: "Editor", avatarColor: "from-plum to-primary", status: "active" },
    { name: "Noah Lindqvist", email: "noah@cadence.app", role: "Approver", avatarColor: "from-mint to-coral", status: "active" },
    { name: "Sofia Reyes", email: "sofia@cadence.app", role: "Editor", avatarColor: "from-amber-brand to-coral", status: "invited" },
  ];
  for (const t of team) {
    await db.teamMember.create({
      data: { ...t, workspaceId: workspace.id, lastActive: new Date() },
    });
  }

  console.log("→ Seeding integrations…");
  const integrations = [
    { name: "Canva", description: "Design graphics and import them straight into your media library.", category: "Design", connected: true, accent: "from-cyan-400 to-blue-500" },
    { name: "Notion", description: "Turn Notion docs into scheduled posts with a single click.", category: "Productivity", connected: true, accent: "from-zinc-700 to-zinc-900" },
    { name: "Google Drive", description: "Sync assets from Drive and keep your library fresh.", category: "Storage", connected: false, accent: "from-emerald-400 to-green-600" },
    { name: "Zapier", description: "Connect Cadence to 6,000+ apps with automated workflows.", category: "Automation", connected: true, accent: "from-orange-400 to-orange-600" },
    { name: "Slack", description: "Get publishing notifications and approval requests in Slack.", category: "Communication", connected: false, accent: "from-fuchsia-400 to-purple-600" },
    { name: "Figma", description: "Pull frames from Figma into your composer instantly.", category: "Design", connected: false, accent: "from-rose-400 to-pink-600" },
    { name: "Shopify", description: "Auto-generate product posts from your catalog.", category: "Commerce", connected: false, accent: "from-emerald-400 to-teal-600" },
    { name: "Bitly", description: "Shorten and track every link you publish.", category: "Analytics", connected: true, accent: "from-sky-400 to-indigo-500" },
  ];
  for (const i of integrations) {
    await db.workspaceIntegration.create({ data: { ...i, workspaceId: workspace.id } });
  }

  console.log("→ Seeding sample posts…");
  const texts = [
    "Behind every great brand is a consistent voice. Here's how we keep ours sharp across 8 channels. 🧵",
    "We just shipped collaborative drafts. Now your whole team can polish a post before it goes live.",
    "The best content calendar isn't fuller — it's smarter. Three slots a week, planned with intent.",
    "Hot take: engagement rate matters more than follower count. Always has. Here's the math.",
    "New case study → how a 4-person team reached 2.3M impressions in 90 days using Cadence.",
    "Your audience doesn't need more noise. They need rhythm. That's the whole idea behind our scheduler.",
  ];
  for (let i = 0; i < texts.length; i++) {
    const isPublished = i < 4;
    const date = new Date(now.getTime() + (i - 2) * 864e5 + i * 3.6e6);
    await db.post.create({
      data: {
        workspaceId: workspace.id,
        authorId: user.id,
        text: texts[i],
        scheduledAt: date,
        status: isPublished ? "published" : "scheduled",
        platforms: JSON.stringify([PLATFORMS[i % 3], PLATFORMS[(i + 1) % 3]]),
        mediaIds: "[]",
        metricsJson: isPublished
          ? JSON.stringify({ impressions: 42000 + i * 5300, reach: 28000 + i * 3100, likes: 1200 + i * 180, comments: 42 + i * 7, shares: 88 + i * 9, clicks: 940 + i * 120, saves: 210 + i * 33 })
          : null,
      },
    });
  }

  console.log("→ Seeding inbox items…");
  const inbox = [
    { platform: "instagram", author: "Daniela Moreau", authorHandle: "@daniela", text: "This is exactly what our team needed. When does the calendar update land?", type: "comment", status: "open", avatarColor: "from-coral to-amber-brand" },
    { platform: "x", author: "Marcus Wei", authorHandle: "@marcusw", text: "Loving the new analytics view! The engagement breakdown is so clean.", type: "mention", status: "pending", avatarColor: "from-primary to-mint" },
    { platform: "linkedin", author: "Aaliyah Brooks", authorHandle: "@aabrooks", text: "Approval workflows mean nothing ships without a second pair of eyes. Finally!", type: "comment", status: "open", avatarColor: "from-plum to-primary" },
    { platform: "tiktok", author: "Tomás Ferreira", authorHandle: "@tomas", text: "Analytics that don't require a data degree. I open the dashboard and immediately know.", type: "dm", status: "pending", avatarColor: "from-mint to-coral" },
  ];
  for (const it of inbox) {
    await db.inboxItem.create({ data: { ...it, workspaceId: workspace.id, createdAt: new Date(now.getTime() - Math.random() * 4 * 864e5) } });
  }

  console.log("→ Seeding activity events…");
  const activities = [
    { actor: "Leo Brennan", action: "published", target: "Spring Launch thread", icon: "publish" },
    { actor: "Priya Sharma", action: "scheduled", target: "Creator series reel", icon: "schedule" },
    { actor: "Noah Lindqvist", action: "approved", target: "Q2 awareness carousel", icon: "approve" },
    { actor: "Maya Okafor", action: "uploaded", target: "podcast-cover-ep12.png", icon: "upload" },
    { actor: "Maya Okafor", action: "invited", target: "Sofia Reyes", icon: "invite" },
  ];
  for (const a of activities) {
    await db.activityEvent.create({
      data: { ...a, workspaceId: workspace.id, createdAt: new Date(now.getTime() - Math.random() * 6 * 864e5) },
    });
  }

  console.log(`\n✅ Seed complete.`);
  console.log(`   Demo login:  ${email}`);
  console.log(`   Password:    cadence123`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
