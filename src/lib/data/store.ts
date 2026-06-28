import { db } from "@/lib/db";
import {
  ACCOUNTS,
  ACTIVITY,
  ANALYTICS,
  CAMPAIGNS,
  INBOX,
  INTEGRATIONS,
  MEDIA,
  PLATFORM_BREAKDOWN,
  POSTS,
  TEAM,
} from "@/lib/data/mock";
import type {
  ActivityEvent,
  AnalyticsPoint,
  Campaign,
  InboxItem,
  Integration,
  MediaAsset,
  PlatformBreakdown,
  SocialAccount,
  SocialPost,
  TeamMember,
} from "@/lib/types";
import type { PlatformId } from "@/lib/brand";

/**
 * Cadence data store.
 *
 * Hybrid read-through architecture:
 *  - Reads try Prisma first (real persisted data from the seed). If the DB is
 *    empty or a query fails, they fall back to the in-memory mock data so the
 *    dashboard always renders.
 *  - Writes (createPost, updatePost, deletePost, addMedia, toggleIntegration,
 *    inviteMember, resolveInbox) persist to Prisma AND mirror into the
 *    in-memory cache for instant re-reads.
 *
 * This gives us real persistence with the resilience of the mock fallback.
 */

function parsePlatforms(json: string | null): PlatformId[] {
  try {
    const arr = JSON.parse(json ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function parseStringArray(json: string | null): string[] {
  try {
    const arr = JSON.parse(json ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function mapPost(p: {
  id: string;
  text: string;
  scheduledAt: Date;
  status: string;
  platforms: string;
  mediaIds: string;
  campaignId: string | null;
  metricsJson: string | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SocialPost {
  return {
    id: p.id,
    text: p.text,
    scheduledAt: p.scheduledAt.toISOString(),
    status: p.status as SocialPost["status"],
    platforms: parsePlatforms(p.platforms),
    mediaIds: parseStringArray(p.mediaIds),
    campaignId: p.campaignId,
    authorId: p.authorId ?? "user_1",
    metrics: p.metricsJson ? (() => { try { return JSON.parse(p.metricsJson!); } catch { return undefined; } })() : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

class Store {
  // In-memory fallback / cache (seeded from deterministic mock data).
  posts: SocialPost[] = structuredClone(POSTS);
  media: MediaAsset[] = structuredClone(MEDIA);
  accounts: SocialAccount[] = structuredClone(ACCOUNTS);
  campaigns: Campaign[] = structuredClone(CAMPAIGNS);
  analytics: AnalyticsPoint[] = structuredClone(ANALYTICS);
  breakdown: PlatformBreakdown[] = structuredClone(PLATFORM_BREAKDOWN);
  inbox: InboxItem[] = structuredClone(INBOX);
  team: TeamMember[] = structuredClone(TEAM);
  integrations: Integration[] = structuredClone(INTEGRATIONS);
  activity: ActivityEvent[] = structuredClone(ACTIVITY);

  // ---- Posts ----
  async listPosts(opts?: { status?: string; platform?: PlatformId; from?: string; to?: string }) {
    let dbPosts: SocialPost[] = [];
    try {
      const rows = await db.post.findMany({ orderBy: { scheduledAt: "asc" } });
      dbPosts = rows.map(mapPost);
    } catch (e) {
      console.error("[store.listPosts] DB read failed, using cache:", e);
    }
    const source = dbPosts.length ? dbPosts : this.posts;
    let out = [...source];
    if (opts?.status) out = out.filter((p) => p.status === opts.status);
    if (opts?.platform) out = out.filter((p) => p.platforms.includes(opts.platform!));
    if (opts?.from) out = out.filter((p) => p.scheduledAt >= opts.from!);
    if (opts?.to) out = out.filter((p) => p.scheduledAt <= opts.to!);
    return out.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  }

  async getPost(id: string) {
    try {
      const p = await db.post.findUnique({ where: { id } });
      if (p) return mapPost(p);
    } catch (e) {
      console.error("[store.getPost] DB read failed:", e);
    }
    return this.posts.find((p) => p.id === id) ?? null;
  }

  async createPost(input: Partial<SocialPost> & { text: string }) {
    const now = new Date();
    const platforms = input.platforms ?? ["x"];
    const mediaIds = input.mediaIds ?? [];
    const status = (input.status ?? "draft") as SocialPost["status"];

    let created: SocialPost;
    try {
      // Single-workspace dev mode: attach to the first workspace + first user.
      const [workspace, user] = await Promise.all([
        db.workspace.findFirst(),
        db.user.findFirst(),
      ]);
      if (!workspace) throw new Error("No workspace found");
      const row = await db.post.create({
        data: {
          workspaceId: workspace.id,
          authorId: user?.id ?? null,
          text: input.text,
          scheduledAt: new Date(input.scheduledAt ?? now.toISOString()),
          status,
          platforms: JSON.stringify(platforms),
          mediaIds: JSON.stringify(mediaIds),
          campaignId: input.campaignId ?? null,
        },
      });
      created = mapPost(row);
    } catch (e) {
      console.error("[store.createPost] DB write failed, cache-only:", e);
      created = {
        id: `post_${Date.now()}`,
        text: input.text,
        scheduledAt: input.scheduledAt ?? now.toISOString(),
        status,
        platforms,
        mediaIds,
        campaignId: input.campaignId ?? null,
        authorId: input.authorId ?? "user_1",
        metrics: undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
    this.posts.unshift(created);
    await this.logActivity("Maya Okafor", status === "scheduled" ? "scheduled" : "created",
      input.text.slice(0, 40) + (input.text.length > 40 ? "…" : ""),
      status === "scheduled" ? "schedule" : "upload");
    return created;
  }

  async updatePost(id: string, patch: Partial<SocialPost>) {
    let updated: SocialPost | null = null;
    try {
      const data: Record<string, unknown> = { updatedAt: new Date() };
      if (patch.text !== undefined) data.text = patch.text;
      if (patch.status !== undefined) data.status = patch.status;
      if (patch.scheduledAt !== undefined) data.scheduledAt = new Date(patch.scheduledAt);
      if (patch.platforms !== undefined) data.platforms = JSON.stringify(patch.platforms);
      if (patch.mediaIds !== undefined) data.mediaIds = JSON.stringify(patch.mediaIds);
      if (patch.campaignId !== undefined) data.campaignId = patch.campaignId;
      const row = await db.post.update({ where: { id }, data });
      updated = mapPost(row);
    } catch (e) {
      console.error("[store.updatePost] DB write failed, cache-only:", e);
    }
    if (!updated) {
      const p = this.posts.find((x) => x.id === id);
      if (p) { Object.assign(p, patch, { updatedAt: nowISO() }); updated = p; }
    } else {
      const idx = this.posts.findIndex((x) => x.id === id);
      if (idx >= 0) this.posts[idx] = updated;
    }
    return updated;
  }

  async deletePost(id: string) {
    let ok = false;
    try { ok = !!(await db.post.delete({ where: { id } })); }
    catch (e) { console.error("[store.deletePost] DB write failed:", e); }
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx >= 0) { this.posts.splice(idx, 1); ok = true; }
    return ok;
  }

  // ---- Media ----
  async listMedia() {
    try {
      const rows = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
      if (rows.length) {
        const mapped: MediaAsset[] = rows.map((m) => ({
          id: m.id, name: m.name, type: m.type as MediaAsset["type"],
          url: m.url, thumbnailUrl: m.thumbnailUrl ?? m.url,
          width: m.width, height: m.height, sizeKb: m.sizeKb,
          tags: parseStringArray(m.tags), createdAt: m.createdAt.toISOString(),
        }));
        return mapped;
      }
    } catch (e) { console.error("[store.listMedia] DB read failed:", e); }
    return this.media;
  }

  async addMedia(input: Partial<MediaAsset> & { name: string }) {
    const m: MediaAsset = {
      id: `media_${Date.now()}`,
      name: input.name,
      type: input.type ?? "image",
      url: input.url ?? `https://picsum.photos/seed/${Date.now()}/800/600`,
      thumbnailUrl: input.thumbnailUrl ?? input.url ?? `https://picsum.photos/seed/${Date.now()}/400/300`,
      width: input.width ?? 800,
      height: input.height ?? 600,
      sizeKb: input.sizeKb ?? 240,
      tags: input.tags ?? [],
      createdAt: new Date().toISOString(),
    };
    try {
      const workspace = await db.workspace.findFirst();
      if (!workspace) throw new Error("No workspace found");
      await db.mediaAsset.create({
        data: {
          workspaceId: workspace.id,
          name: m.name, type: m.type, url: m.url, thumbnailUrl: m.thumbnailUrl,
          width: m.width, height: m.height, sizeKb: m.sizeKb,
          tags: JSON.stringify(m.tags),
        },
      });
    } catch (e) { console.error("[store.addMedia] DB write failed, cache-only:", e); }
    this.media.unshift(m);
    return m;
  }

  // ---- Inbox ----
  async listInbox() {
    try {
      const rows = await db.inboxItem.findMany({ orderBy: { createdAt: "desc" } });
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id, platform: r.platform as PlatformId, author: r.author,
          authorHandle: r.authorHandle, text: r.text, type: r.type as InboxItem["type"],
          status: r.status as InboxItem["status"], avatarColor: r.avatarColor ?? "from-primary to-mint",
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (e) { console.error("[store.listInbox] DB read failed:", e); }
    return this.inbox;
  }

  async resolveInbox(id: string, status: InboxItem["status"]) {
    let item: InboxItem | undefined;
    try {
      const row = await db.inboxItem.update({ where: { id }, data: { status } });
      item = {
        id: row.id, platform: row.platform as PlatformId, author: row.author,
        authorHandle: row.authorHandle, text: row.text, type: row.type as InboxItem["type"],
        status: row.status as InboxItem["status"], avatarColor: row.avatarColor ?? "from-primary to-mint",
        createdAt: row.createdAt.toISOString(),
      };
    } catch (e) { console.error("[store.resolveInbox] DB write failed:", e); }
    if (!item) {
      item = this.inbox.find((i) => i.id === id);
      if (item) item.status = status;
    } else {
      const idx = this.inbox.findIndex((i) => i.id === id);
      if (idx >= 0) this.inbox[idx] = item;
    }
    return item;
  }

  // ---- Integrations ----
  async listIntegrations() {
    try {
      const rows = await db.workspaceIntegration.findMany();
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id, name: r.name, description: r.description, category: r.category,
          connected: r.connected, accent: r.accent,
        }));
      }
    } catch (e) { console.error("[store.listIntegrations] DB read failed:", e); }
    return this.integrations;
  }

  async toggleIntegration(id: string) {
    let it: Integration | undefined;
    try {
      const existing = await db.workspaceIntegration.findUnique({ where: { id } });
      if (existing) {
        const row = await db.workspaceIntegration.update({ where: { id }, data: { connected: !existing.connected } });
        it = { id: row.id, name: row.name, description: row.description, category: row.category, connected: row.connected, accent: row.accent };
      }
    } catch (e) { console.error("[store.toggleIntegration] DB write failed:", e); }
    if (!it) {
      it = this.integrations.find((i) => i.id === id);
      if (it) it.connected = !it.connected;
    } else {
      const idx = this.integrations.findIndex((i) => i.id === id);
      if (idx >= 0) this.integrations[idx] = it;
    }
    return it;
  }

  // ---- Team ----
  async listTeam() {
    try {
      const rows = await db.teamMember.findMany({ orderBy: { name: "asc" } });
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id, name: r.name, email: r.email, role: r.role as TeamMember["role"],
          avatarColor: r.avatarColor ?? "from-primary to-mint", status: r.status as TeamMember["status"],
          lastActive: r.lastActive.toISOString(),
        }));
      }
    } catch (e) { console.error("[store.listTeam] DB read failed:", e); }
    return this.team;
  }

  async inviteMember(name: string, email: string, role: TeamMember["role"]) {
    const m: TeamMember = {
      id: `user_${Date.now()}`,
      name, email, role,
      avatarColor: "from-primary to-mint",
      lastActive: new Date().toISOString(),
      status: "invited",
    };
    let workspaceName = "Cadence HQ";
    try {
      const workspace = await db.workspace.findFirst();
      if (!workspace) throw new Error("No workspace found");
      workspaceName = workspace.name;
      await db.teamMember.create({
        data: { workspaceId: workspace.id, name, email, role, avatarColor: m.avatarColor, status: "invited" },
      });
    } catch (e) { console.error("[store.inviteMember] DB write failed:", e); }
    this.team.push(m);
    await this.logActivity("Maya Okafor", "invited", name, "invite");
    // Fire-and-forget invite email (mock mode logs to console).
    import("@/lib/email").then(({ sendEmail, inviteEmail }) => {
      const mail = inviteEmail(workspaceName, "Maya Okafor");
      mail.to = email;
      return sendEmail(mail);
    }).catch((e) => console.error("[store.inviteMember] email failed:", e));
    return m;
  }

  // ---- Activity + Campaigns ----
  async listActivity() {
    try {
      const rows = await db.activityEvent.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id, actor: r.actor, action: r.action, target: r.target,
          icon: r.icon as ActivityEvent["icon"], createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (e) { console.error("[store.listActivity] DB read failed:", e); }
    return this.activity;
  }

  async listCampaigns() {
    try {
      const rows = await db.campaign.findMany({ orderBy: { startDate: "asc" } });
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id, name: r.name, color: r.color,
          startDate: r.startDate.toISOString(), endDate: r.endDate.toISOString(),
          status: r.status as Campaign["status"],
        }));
      }
    } catch (e) { console.error("[store.listCampaigns] DB read failed:", e); }
    return this.campaigns;
  }

  async listAccounts() {
    try {
      const rows = await db.socialAccount.findMany();
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id, platform: r.platform as PlatformId, handle: r.handle,
          displayName: r.displayName, followers: r.followers,
          avatarColor: r.avatarColor ?? "from-primary to-mint", connected: r.connected,
        }));
      }
    } catch (e) { console.error("[store.listAccounts] DB read failed:", e); }
    return this.accounts;
  }

  private async logActivity(actor: string, action: string, target: string, icon: ActivityEvent["icon"]) {
    const evt: ActivityEvent = {
      id: `act_${Date.now()}`,
      actor, action, target, icon,
      createdAt: new Date().toISOString(),
    };
    this.activity.unshift(evt);
    try {
      const workspace = await db.workspace.findFirst();
      if (!workspace) throw new Error("No workspace found");
      await db.activityEvent.create({
        data: { workspaceId: workspace.id, actor, action, target, icon },
      });
    } catch (e) {
      // silent — activity logging is best-effort
    }
  }
}

function nowISO() { return new Date().toISOString(); }

declare global {
  // eslint-disable-next-line no-var
  var __cadenceStore: Store | undefined;
}

// Recreate the singleton if the cached instance lacks the async DB-backed
// methods (happens after HMR replaces the module with a newer class def).
const cached = globalThis.__cadenceStore;
export const store: Store =
  cached && typeof cached.listTeam === "function"
    ? cached
    : (globalThis.__cadenceStore = new Store());
