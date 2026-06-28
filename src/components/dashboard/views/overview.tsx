"use client";

import * as React from "react";
import {
  Eye,
  Users2,
  Heart,
  UserPlus,
  Plus,
  BarChart3,
  CalendarClock,
  Activity as ActivityIcon,
  Megaphone,
  CheckCircle2,
  MessageCircle,
  UserPlus as UserPlusIcon,
  Upload,
  Clock,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { format, formatDistanceToNow, isThisWeek, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { useAnalytics, usePosts, useActivity, useCampaigns } from "@/hooks/use-api";
import { PLATFORMS } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  DonutChart,
  EmptyState,
  MiniArea,
  PageHeader,
  PostCard,
  SectionCard,
  StatCard,
  formatCompact,
} from "@/components/dashboard/shared";
import { PlatformBadge } from "@/components/brand/platform-icon";

const DONUT_COLORS: Record<string, string> = {
  instagram: "var(--coral)",
  x: "var(--foreground)",
  linkedin: "oklch(0.6 0.13 240)",
  facebook: "oklch(0.55 0.16 250)",
  tiktok: "var(--primary)",
  youtube: "oklch(0.6 0.21 25)",
  threads: "var(--plum)",
  pinterest: "oklch(0.55 0.2 15)",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function useAnalyticsSummary() {
  const { data, isLoading } = useAnalytics();
  const ts = data?.timeseries ?? [];

  const last7 = ts.slice(-7);
  const prev7 = ts.slice(-14, -7);
  const last14 = ts.slice(-14);

  const sum = (arr: typeof ts, key: keyof (typeof ts)[number]) =>
    arr.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);

  const impressionsNow = sum(last7, "impressions");
  const impressionsPrev = sum(prev7, "impressions");
  const reachNow = sum(last7, "reach");
  const reachPrev = sum(prev7, "reach");
  const engagementNow = sum(last7, "engagement");
  const engagementPrev = sum(prev7, "engagement");

  const followersNow = last7.at(-1)?.followers ?? 0;
  const followersPrev = last7[0]?.followers ?? 0;

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : ((now - prev) / prev) * 100;

  return {
    isLoading,
    stats: [
      {
        label: "Impressions",
        value: formatCompact(impressionsNow),
        delta: pct(impressionsNow, impressionsPrev),
        deltaLabel: "vs last 7 days",
        icon: Eye,
        accent: "text-primary",
        spark: last14.map((p) => p.impressions),
      },
      {
        label: "Reach",
        value: formatCompact(reachNow),
        delta: pct(reachNow, reachPrev),
        deltaLabel: "vs last 7 days",
        icon: Users2,
        accent: "text-mint",
        spark: last14.map((p) => p.reach),
      },
      {
        label: "Engagement",
        value: formatCompact(engagementNow),
        delta: pct(engagementNow, engagementPrev),
        deltaLabel: "vs last 7 days",
        icon: Heart,
        accent: "text-coral",
        spark: last14.map((p) => p.engagement),
      },
      {
        label: "Followers",
        value: formatCompact(followersNow),
        delta: pct(followersNow, followersPrev),
        deltaLabel: "vs last 7 days",
        icon: UserPlus,
        accent: "text-plum",
        spark: last14.map((p) => p.followers),
      },
    ],
    timeseries: ts,
    breakdown: data?.breakdown ?? [],
  };
}

function StatCardRow() {
  const { stats, isLoading } = useAnalyticsSummary();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="shimmer rounded-xl border border-border/60 bg-card p-5"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-28" />
            <Skeleton className="mt-4 h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

function ScheduledThisWeek() {
  const { data, isLoading } = usePosts({ status: "scheduled" });
  const openComposer = useApp((s) => s.openComposer);
  const posts = (data?.posts ?? [])
    .filter((p) => isThisWeek(parseISO(p.scheduledAt), { weekStartsOn: 1 }))
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  return (
    <SectionCard
      title="This week"
      description="Scheduled posts heading out in the next 7 days"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => useApp.getState().setView("calendar")}
        >
          Open calendar
          <ChevronRight className="size-3.5" />
        </Button>
      }
      bodyClassName="p-0"
    >
      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-cadence p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-64 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={CalendarClock}
            title="Nothing scheduled this week"
            description="Plan your next wave of posts and keep your audience engaged."
            action={
              <Button size="sm" onClick={() => openComposer()}>
                <Plus className="size-4" />
                Schedule a post
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-cadence p-4">
          {posts.map((p) => (
            <div key={p.id} className="w-72 shrink-0">
              <PostCard post={p} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

const ACTIVITY_ICON: Record<string, LucideIcon> = {
  publish: CheckCircle2,
  schedule: Clock,
  comment: MessageCircle,
  approve: CheckCircle2,
  invite: UserPlusIcon,
  upload: Upload,
};

const ACTIVITY_COLOR: Record<string, string> = {
  publish: "text-mint",
  schedule: "text-primary",
  comment: "text-coral",
  approve: "text-mint",
  invite: "text-plum",
  upload: "text-amber-brand",
};

function ActivityFeed() {
  const { data, isLoading } = useActivity();
  const activity = data?.activity ?? [];

  return (
    <SectionCard
      title="Activity"
      description="What your team has been up to"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => useApp.getState().setView("team")}
        >
          View team
          <ChevronRight className="size-3.5" />
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No recent activity"
          description="Your team’s actions will appear here."
        />
      ) : (
        <ol className="relative space-y-3">
          {activity.slice(0, 7).map((a, i) => {
            const Icon = ACTIVITY_ICON[a.icon] ?? ActivityIcon;
            const color = ACTIVITY_COLOR[a.icon] ?? "text-muted-foreground";
            return (
              <li key={a.id} className="flex gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/60",
                    color
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(a.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
}

function AudienceByPlatform() {
  const { breakdown, isLoading } = useAnalyticsSummary();
  const data = React.useMemo(
    () =>
      breakdown.map((b) => ({
        name: PLATFORMS[b.platform]?.name ?? b.platform,
        value: b.followers,
        color: DONUT_COLORS[b.platform] ?? "var(--muted-foreground)",
      })),
    [breakdown]
  );
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <SectionCard
      title="Audience by platform"
      description="Where your followers live"
    >
      {isLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="size-36 rounded-full" />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <DonutChart data={data} height={180} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Total
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCompact(total)}
              </span>
            </div>
          </div>
          <ul className="flex-1 space-y-1.5">
            {data
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((d) => (
                <li
                  key={d.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  <span className="flex-1 text-foreground">{d.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCompact(d.value)}
                  </span>
                  <span className="w-10 text-right tabular-nums text-muted-foreground">
                    {((d.value / total) * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

function UpcomingQueue() {
  const { data, isLoading } = usePosts({ status: "scheduled" });
  const posts = (data?.posts ?? [])
    .filter((p) => new Date(p.scheduledAt).getTime() >= Date.now() - 86400000)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .slice(0, 6);

  return (
    <SectionCard
      title="Upcoming queue"
      description="The next posts in your pipeline"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => useApp.getState().setView("queue")}
        >
          Open queue
          <ChevronRight className="size-3.5" />
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Queue is empty"
          description="Schedule posts to fill up your queue."
          action={
            <Button
              size="sm"
              onClick={() => useApp.getState().openComposer()}
            >
              <Plus className="size-4" />
              New post
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function PerformanceChart() {
  const { timeseries, isLoading } = useAnalyticsSummary();
  const data = React.useMemo(
    () =>
      timeseries.map((p) => ({
        date: format(parseISO(p.date), "MMM d"),
        impressions: p.impressions,
        engagement: p.engagement,
      })),
    [timeseries]
  );

  return (
    <SectionCard
      title="Performance"
      description="Last 30 days · impressions vs engagement"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => useApp.getState().setView("analytics")}
        >
          Full analytics
          <ChevronRight className="size-3.5" />
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <div className="h-56">
              <MiniArea data={data} dataKey="impressions" height={224} />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 border-t border-border/50 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                Impressions
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatCompact(
                  data.reduce((a, b) => a + b.impressions, 0)
                )}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="size-2 rounded-full bg-coral" />
                Engagement
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatCompact(
                  data.reduce((a, b) => a + b.engagement, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function CampaignsStrip() {
  const { data, isLoading } = useCampaigns();
  const campaigns = (data?.campaigns ?? []).filter(
    (c) => c.status === "active" || c.status === "planned"
  );

  return (
    <SectionCard
      title="Campaigns in flight"
      description="Active and upcoming campaigns across your workspace"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => useApp.getState().setView("reports")}
        >
          All campaigns
          <ChevronRight className="size-3.5" />
        </Button>
      }
      bodyClassName="p-3"
    >
      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-cadence">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-56 shrink-0 rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No active campaigns"
          description="Group posts under a campaign to track them together."
        />
      ) : (
        <div className="flex gap-2 overflow-x-auto scrollbar-cadence">
          {campaigns.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => useApp.getState().setView("reports")}
              className="flex min-w-[220px] shrink-0 flex-col gap-1.5 rounded-lg border border-border/60 bg-background/50 p-3 text-left transition-colors hover:bg-accent/40"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                <span className="flex-1 truncate text-sm font-medium text-foreground">
                  {c.name}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    c.status === "active"
                      ? "bg-mint/15 text-mint"
                      : "bg-amber-brand/15 text-amber-brand"
                  )}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {format(parseISO(c.startDate), "MMM d")} →{" "}
                {format(parseISO(c.endDate), "MMM d, yyyy")}
              </p>
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function OverviewView() {
  const openComposer = useApp((s) => s.openComposer);
  const setView = useApp((s) => s.setView);
  const today = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span>
            {greeting()}, Maya{" "}
            <span className="text-muted-foreground">·</span>{" "}
            <span className="text-muted-foreground">
              {format(today, "EEEE, MMMM d")}
            </span>
          </span>
        }
        description="Here’s what’s happening across your channels today."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("analytics")}
            >
              <BarChart3 className="size-4" />
              View analytics
            </Button>
            <Button size="sm" onClick={() => openComposer()}>
              <Plus className="size-4" />
              Create post
            </Button>
          </>
        }
      />

      <StatCardRow />

      <ScheduledThisWeek />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <UpcomingQueue />
          <PerformanceChart />
        </div>
        <div className="space-y-6">
          <ActivityFeed />
          <AudienceByPlatform />
        </div>
      </div>

      <CampaignsStrip />
    </div>
  );
}
