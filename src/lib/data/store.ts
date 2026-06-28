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
 * In-memory data store (single dev-server instance).
 * Seeded from deterministic mock data; supports CRUD so the dashboard feels live.
 * Writes are mirrored to Prisma best-effort (fire-and-forget) to demonstrate DB usage.
 */
class Store {
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
  listPosts(opts?: { status?: string; platform?: PlatformId; from?: string; to?: string }) {
    let out = [...this.posts];
    if (opts?.status) out = out.filter((p) => p.status === opts.status);
    if (opts?.platform) out = out.filter((p) => p.platforms.includes(opts.platform!));
    if (opts?.from) out = out.filter((p) => p.scheduledAt >= opts.from!);
    if (opts?.to) out = out.filter((p) => p.scheduledAt <= opts.to!);
    return out.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  }

  getPost(id: string) {
    return this.posts.find((p) => p.id === id);
  }

  createPost(input: Partial<SocialPost> & { text: string }) {
    const now = new Date().toISOString();
    const post: SocialPost = {
      id: `post_${Date.now()}`,
      text: input.text,
      scheduledAt: input.scheduledAt ?? now,
      status: input.status ?? "draft",
      platforms: input.platforms ?? ["x"],
      mediaIds: input.mediaIds ?? [],
      campaignId: input.campaignId ?? null,
      authorId: input.authorId ?? "user_1",
      metrics: undefined,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.unshift(post);
    this.activity.unshift({
      id: `act_${Date.now()}`,
      actor: "Maya Okafor",
      action: post.status === "scheduled" ? "scheduled" : "created",
      target: post.text.slice(0, 40) + (post.text.length > 40 ? "…" : ""),
      createdAt: now,
      icon: post.status === "scheduled" ? "schedule" : "upload",
    });
    return post;
  }

  updatePost(id: string, patch: Partial<SocialPost>) {
    const p = this.getPost(id);
    if (!p) return null;
    Object.assign(p, patch, { updatedAt: new Date().toISOString() });
    return p;
  }

  deletePost(id: string) {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx >= 0) this.posts.splice(idx, 1);
    return idx >= 0;
  }

  // ---- Media ----
  addMedia(input: Partial<MediaAsset> & { name: string }) {
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
    this.media.unshift(m);
    return m;
  }

  // ---- Inbox ----
  resolveInbox(id: string, status: InboxItem["status"]) {
    const it = this.inbox.find((i) => i.id === id);
    if (it) it.status = status;
    return it;
  }

  // ---- Integrations ----
  toggleIntegration(id: string) {
    const it = this.integrations.find((i) => i.id === id);
    if (it) it.connected = !it.connected;
    return it;
  }

  // ---- Team ----
  inviteMember(name: string, email: string, role: TeamMember["role"]) {
    const m: TeamMember = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      avatarColor: "from-primary to-mint",
      lastActive: new Date().toISOString(),
      status: "invited",
    };
    this.team.push(m);
    this.activity.unshift({
      id: `act_${Date.now()}`,
      actor: "Maya Okafor",
      action: "invited",
      target: name,
      createdAt: new Date().toISOString(),
      icon: "invite",
    });
    return m;
  }
}

declare global {
   
  var __cadenceStore: Store | undefined;
}

export const store: Store = (globalThis.__cadenceStore ??= new Store());
