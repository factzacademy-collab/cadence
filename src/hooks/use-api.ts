"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlatformId } from "@/lib/brand";
import type { InboxItem, SocialPost, TeamMember } from "@/lib/types";

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/* ---------------- Posts ---------------- */
export function usePosts(opts?: { status?: string; platform?: PlatformId }) {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.platform) params.set("platform", opts.platform);
  const q = params.toString();
  return useQuery<{ posts: SocialPost[] }>({
    queryKey: ["posts", opts],
    queryFn: () => json(`/api/posts${q ? `?${q}` : ""}`),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<SocialPost> & { text: string }) =>
      json<{ post: SocialPost }>(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SocialPost> }) =>
      json<{ post: SocialPost }>(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      json<{ ok: boolean }>(`/api/posts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

/* ---------------- Analytics ---------------- */
export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () =>
      json<{
        timeseries: import("@/lib/types").AnalyticsPoint[];
        breakdown: import("@/lib/types").PlatformBreakdown[];
        stats: { label: string; value: string; sub: string }[];
        totals: Record<string, number>;
      }>(`/api/analytics`),
  });
}

/* ---------------- Media ---------------- */
export function useMedia() {
  return useQuery<{ media: import("@/lib/types").MediaAsset[] }>({
    queryKey: ["media"],
    queryFn: () => json(`/api/media`),
  });
}

/* ---------------- Accounts ---------------- */
export function useAccounts() {
  return useQuery<{ accounts: import("@/lib/types").SocialAccount[] }>({
    queryKey: ["accounts"],
    queryFn: () => json(`/api/accounts`),
  });
}

/* ---------------- Inbox ---------------- */
export function useInbox() {
  return useQuery<{ inbox: InboxItem[] }>({
    queryKey: ["inbox"],
    queryFn: () => json(`/api/inbox`),
  });
}

export function useResolveInbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InboxItem["status"] }) =>
      json<{ item: InboxItem }>(`/api/inbox`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inbox"] }),
  });
}

/* ---------------- Team ---------------- */
export function useTeam() {
  return useQuery<{ team: TeamMember[] }>({
    queryKey: ["team"],
    queryFn: () => json(`/api/team`),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; role: TeamMember["role"] }) =>
      json<{ member: TeamMember }>(`/api/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

/* ---------------- Integrations ---------------- */
export function useIntegrations() {
  return useQuery<{ integrations: import("@/lib/types").Integration[] }>({
    queryKey: ["integrations"],
    queryFn: () => json(`/api/integrations`),
  });
}

export function useToggleIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      json(`/api/integrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] }),
  });
}

/* ---------------- Activity + Campaigns ---------------- */
export function useActivity() {
  return useQuery<{
    activity: import("@/lib/types").ActivityEvent[];
    campaigns: import("@/lib/types").Campaign[];
  }>({
    queryKey: ["activity"],
    queryFn: () => json(`/api/activity`),
  });
}

export function useCampaigns() {
  return useQuery<{ campaigns: import("@/lib/types").Campaign[] }>({
    queryKey: ["campaigns"],
    queryFn: () => json(`/api/campaigns`),
  });
}

/* ---------------- AI ---------------- */
export function useAiChat() {
  return useMutation({
    mutationFn: (input: { message: string; history: { role: "user" | "assistant"; content: string }[] }) =>
      json<{ reply: string }>(`/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}

export function useGenerateCaptions() {
  return useMutation({
    mutationFn: (input: { topic: string; platforms: PlatformId[]; tone: string; count?: number }) =>
      json<{ captions: string[] }>(`/api/ai/captions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
  });
}
