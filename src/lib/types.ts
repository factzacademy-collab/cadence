import type { PlatformId } from "./brand";

export type PostStatus = "draft" | "scheduled" | "published" | "failed" | "in-review";

export interface SocialPost {
  id: string;
  text: string;
  /** ISO date the post is scheduled / was published */
  scheduledAt: string;
  status: PostStatus;
  platforms: PlatformId[];
  /** media asset ids */
  mediaIds: string[];
  campaignId?: string | null;
  authorId: string;
  metrics?: PostMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface PostMetrics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  saves: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  sizeKb: number;
  tags: string[];
  createdAt: string;
}

export interface SocialAccount {
  id: string;
  platform: PlatformId;
  handle: string;
  displayName: string;
  avatarColor: string;
  followers: number;
  connected: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  status: "active" | "planned" | "completed";
}

export interface AnalyticsPoint {
  date: string;
  impressions: number;
  reach: number;
  engagement: number;
  followers: number;
  clicks: number;
}

export interface PlatformBreakdown {
  platform: PlatformId;
  followers: number;
  engagementRate: number;
  posts: number;
  impressions: number;
}

export interface InboxItem {
  id: string;
  platform: PlatformId;
  author: string;
  authorHandle: string;
  text: string;
  type: "comment" | "mention" | "dm" | "review";
  createdAt: string;
  status: "open" | "resolved" | "pending";
  avatarColor: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Approver" | "Viewer";
  avatarColor: string;
  lastActive: string;
  status: "active" | "invited" | "suspended";
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  accent: string;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
  icon: "publish" | "schedule" | "comment" | "approve" | "invite" | "upload";
}
