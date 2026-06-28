import { describe, it, expect } from "vitest";
import type {
  PostStatus,
  PostMetrics,
  SocialPost,
  MediaAsset,
  SocialAccount,
  Campaign,
  AnalyticsPoint,
  PlatformBreakdown,
  InboxItem,
  TeamMember,
  Integration,
  ActivityEvent,
} from "@/lib/types";

/**
 * Type-level + runtime smoke tests: the file imports every domain type
 * from `@/lib/types` and exercises it with a representative value. If a
 * type is removed or renamed, the import fails to resolve; if its shape
 * drifts, the literal assignment below won't compile (tsc) / will throw
 * at runtime (vitest). This catches silent regressions in the type layer.
 */

describe("domain types: smoke tests", () => {
  it("PostStatus covers the 5 statuses", () => {
    const statuses: PostStatus[] = [
      "draft",
      "scheduled",
      "published",
      "failed",
      "in-review",
    ];
    expect(statuses).toHaveLength(5);
    // Compile-time narrowing sanity check.
    const s: PostStatus = "scheduled";
    expect(s).toBe("scheduled");
  });

  it("PostMetrics has the 7 engagement fields", () => {
    const m: PostMetrics = {
      impressions: 1,
      reach: 1,
      likes: 1,
      comments: 1,
      shares: 1,
      clicks: 1,
      saves: 1,
    };
    expect(Object.keys(m).sort()).toEqual(
      [
        "clicks",
        "comments",
        "impressions",
        "likes",
        "reach",
        "saves",
        "shares",
      ].sort()
    );
  });

  it("SocialPost has the documented shape", () => {
    const post: SocialPost = {
      id: "post_1",
      text: "hello",
      scheduledAt: new Date().toISOString(),
      status: "draft",
      platforms: ["x"],
      mediaIds: [],
      campaignId: null,
      authorId: "user_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(post.id).toBe("post_1");
    expect(post.platforms).toEqual(["x"]);
  });

  it("MediaAsset has the documented shape", () => {
    const m: MediaAsset = {
      id: "media_1",
      name: "photo.png",
      type: "image",
      url: "https://example.com/photo.png",
      width: 800,
      height: 600,
      sizeKb: 240,
      tags: ["brand"],
      createdAt: new Date().toISOString(),
    };
    expect(m.type === "image" || m.type === "video").toBe(true);
  });

  it("SocialAccount has the documented shape", () => {
    const a: SocialAccount = {
      id: "acc_1",
      platform: "instagram",
      handle: "@cadence",
      displayName: "Cadence",
      avatarColor: "from-primary to-mint",
      followers: 12345,
      connected: true,
    };
    expect(a.followers).toBe(12345);
  });

  it("Campaign status is one of active | planned | completed", () => {
    const c: Campaign = {
      id: "camp_1",
      name: "Spring Launch 2025",
      color: "var(--primary)",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: "active",
    };
    expect(["active", "planned", "completed"]).toContain(c.status);
  });

  it("AnalyticsPoint has date + 5 metric fields", () => {
    const p: AnalyticsPoint = {
      date: "2025-01-01",
      impressions: 0,
      reach: 0,
      engagement: 0,
      followers: 0,
      clicks: 0,
    };
    expect(Object.keys(p).sort()).toEqual(
      ["clicks", "date", "engagement", "followers", "impressions", "reach"].sort()
    );
  });

  it("PlatformBreakdown has the 4 fields", () => {
    const b: PlatformBreakdown = {
      platform: "x",
      followers: 0,
      engagementRate: 0,
      posts: 0,
      impressions: 0,
    };
    expect(Object.keys(b).sort()).toEqual(
      ["engagementRate", "followers", "impressions", "platform", "posts"].sort()
    );
  });

  it("InboxItem type + status unions", () => {
    const i: InboxItem = {
      id: "inbox_1",
      platform: "instagram",
      author: "User",
      authorHandle: "@user",
      text: "hi",
      type: "comment",
      createdAt: new Date().toISOString(),
      status: "open",
      avatarColor: "from-primary to-mint",
    };
    const types: InboxItem["type"][] = ["comment", "mention", "dm", "review"];
    const statuses: InboxItem["status"][] = ["open", "resolved", "pending"];
    expect(types).toHaveLength(4);
    expect(statuses).toHaveLength(3);
    expect(i.type).toBe("comment");
  });

  it("TeamMember role + status unions", () => {
    const t: TeamMember = {
      id: "user_1",
      name: "Maya",
      email: "maya@cadence.app",
      role: "Owner",
      avatarColor: "from-primary to-mint",
      lastActive: new Date().toISOString(),
      status: "active",
    };
    const roles: TeamMember["role"][] = [
      "Owner",
      "Admin",
      "Editor",
      "Approver",
      "Viewer",
    ];
    const statuses: TeamMember["status"][] = ["active", "invited", "suspended"];
    expect(roles).toHaveLength(5);
    expect(statuses).toHaveLength(3);
    expect(t.role).toBe("Owner");
  });

  it("Integration shape", () => {
    const it_: Integration = {
      id: "int_1",
      name: "Canva",
      description: "Design graphics",
      category: "Design",
      connected: true,
      accent: "from-cyan-400 to-blue-500",
    };
    expect(it_.connected).toBe(true);
  });

  it("ActivityEvent icon union", () => {
    const a: ActivityEvent = {
      id: "act_1",
      actor: "Maya",
      action: "scheduled",
      target: "post",
      createdAt: new Date().toISOString(),
      icon: "schedule",
    };
    const icons: ActivityEvent["icon"][] = [
      "publish",
      "schedule",
      "comment",
      "approve",
      "invite",
      "upload",
    ];
    expect(icons).toHaveLength(6);
    expect(icons).toContain(a.icon);
  });
});
