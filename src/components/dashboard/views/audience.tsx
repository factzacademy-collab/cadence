"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  UserPlus,
  Heart,
  Eye,
  MapPin,
  CalendarClock,
  Sparkles,
  TrendingUp,
  Info,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-api";
import { PLATFORMS, type PlatformId } from "@/lib/brand";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DonutChart,
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  formatCompact,
} from "@/components/dashboard/shared";
import type { AnalyticsPoint, PlatformBreakdown } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Constants & mock data                                             */
/* ------------------------------------------------------------------ */

const PLATFORM_CHART_COLOR: Record<PlatformId, string> = {
  instagram: "var(--coral)",
  x: "var(--foreground)",
  linkedin: "var(--chart-1)",
  facebook: "var(--chart-5)",
  tiktok: "var(--primary)",
  youtube: "var(--coral)",
  threads: "var(--plum)",
  pinterest: "var(--amber-brand)",
};

const TOP_LOCATIONS = [
  { country: "United States", code: "US", share: 32 },
  { country: "United Kingdom", code: "UK", share: 14 },
  { country: "India", code: "IN", share: 11 },
  { country: "Germany", code: "DE", share: 8 },
  { country: "Brazil", code: "BR", share: 6 },
  { country: "Other", code: "—", share: 29 },
];

const AGE_BUCKETS = [
  { bucket: "18–24", share: 28 },
  { bucket: "25–34", share: 41 },
  { bucket: "35–44", share: 17 },
  { bucket: "45–54", share: 9 },
  { bucket: "55+", share: 5 },
];

const TOP_INTERESTS = [
  "Marketing",
  "Startups",
  "Design",
  "Productivity",
  "SaaS",
  "Content creation",
  "Entrepreneurship",
  "UX",
  "Branding",
  "Social media",
  "Analytics",
  "Remote work",
  "AI",
  "Leadership",
  "Copywriting",
];

const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_HOURS = Array.from({ length: 12 }).map((_, i) => {
  const h = i * 2; // 0,2,4,...22
  const label = h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
  return { hour: h, label };
});

/** Deterministic pseudo-random score in [0.05, 1] for heatmap cells. */
function heatmapScore(day: number, hour: number): number {
  // Peak windows: weekday evenings (16-22h), weekend midday (10-16h).
  const isWeekend = day >= 5;
  const peakHour = isWeekend ? 12 : 18;
  const dist = Math.abs(hour - peakHour);
  const base = Math.max(0, 1 - dist / 10);
  const wave = 0.5 + 0.5 * Math.sin((day + 1) * 1.3 + hour * 0.7);
  const score = base * 0.7 + wave * 0.3;
  // small deterministic jitter
  const jitter = ((day * 7 + hour * 13) % 11) / 110;
  return Math.max(0.06, Math.min(1, score + jitter));
}

/* ------------------------------------------------------------------ */
/* Custom tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
  formatters,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatters?: Record<string, (n: number) => string>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <ul className="space-y-1">
        {payload.map((p, i) => {
          const fmt = formatters?.[p.dataKey] ?? formatCompact;
          return (
            <li key={i} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ background: p.color ?? p.stroke ?? p.fill }}
              />
              <span className="text-muted-foreground">{p.name}</span>
              <span className="ml-auto font-medium tabular-nums text-foreground">
                {fmt(Number(p.value))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI row                                                            */
/* ------------------------------------------------------------------ */

function KpiRow({
  series,
  breakdown,
  isLoading,
}: {
  series: AnalyticsPoint[];
  breakdown: PlatformBreakdown[];
  isLoading: boolean;
}) {
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

  const totalFollowers = breakdown.reduce((a, b) => a + b.followers, 0);
  const firstFollowers = series[0]?.followers ?? totalFollowers;
  const lastFollowers = series.at(-1)?.followers ?? totalFollowers;
  const newFollowers = Math.max(0, lastFollowers - firstFollowers);

  const avgEngagement =
    breakdown.length === 0
      ? 0
      : breakdown.reduce((a, b) => a + b.engagementRate, 0) / breakdown.length;

  // Mock profile visits derived from total followers (deterministic).
  const profileVisits = Math.round(totalFollowers * 0.084);

  const sparkFollowers = series.slice(-14).map((p) => p.followers);
  const sparkNewFollowers = series.slice(-14).map((p, i, arr) => {
    if (i === 0) return 0;
    return Math.max(0, p.followers - arr[i - 1].followers);
  });
  const sparkEngagement = breakdown.slice(0, 6).map((b) => b.engagementRate);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total followers"
        value={formatCompact(totalFollowers)}
        delta={Number(
          (((lastFollowers - firstFollowers) / Math.max(1, firstFollowers)) * 100).toFixed(1)
        )}
        deltaLabel="vs start of window"
        icon={Users}
        accent="text-primary"
        spark={sparkFollowers}
      />
      <StatCard
        label="New followers"
        value={`+${formatCompact(newFollowers)}`}
        deltaLabel="last 30 days"
        icon={UserPlus}
        accent="text-mint"
        spark={sparkNewFollowers}
      />
      <StatCard
        label="Engagement rate"
        value={`${avgEngagement.toFixed(2)}%`}
        deltaLabel="avg across channels"
        icon={Heart}
        accent="text-coral"
        spark={sparkEngagement}
      />
      <StatCard
        label="Profile visits"
        value={formatCompact(profileVisits)}
        deltaLabel="last 30 days"
        icon={Eye}
        accent="text-plum"
        spark={sparkFollowers}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Follower growth chart (ComposedChart Area + Line)                  */
/* ------------------------------------------------------------------ */

function FollowerGrowthChart({
  series,
  isLoading,
}: {
  series: AnalyticsPoint[];
  isLoading: boolean;
}) {
  const data = React.useMemo(() => {
    return series.map((p, i) => {
      const prevFollowers = i === 0 ? p.followers : series[i - 1].followers;
      const newFollowers = i === 0 ? 0 : Math.max(0, p.followers - prevFollowers);
      return {
        date: format(parseISO(p.date), "MMM d"),
        followers: p.followers,
        newFollowers,
      };
    });
  }, [series]);

  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1);
  const totalNew = data.reduce((a, b) => a + b.newFollowers, 0);

  return (
    <SectionCard
      title="Follower growth"
      description="Cumulative followers with daily new-followers overlay"
      actions={
        <Badge variant="outline" className="bg-background text-xs">
          +{formatCompact(totalNew)} new · 30d
        </Badge>
      }
      bodyClassName="p-4 sm:p-5"
    >
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : data.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No follower data yet"
          description="Connect a channel to start tracking follower growth."
        />
      ) : (
        <div
          className="h-72 w-full"
          role="img"
          aria-label="Cumulative followers and daily new followers for the last 30 days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
            >
              <defs>
                <linearGradient id="follow-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={8}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => formatCompact(Number(v))}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => formatCompact(Number(v))}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                content={
                  <ChartTooltip
                    formatters={{
                      followers: (n) => formatCompact(n),
                      newFollowers: (n) => `+${formatCompact(n)}`,
                    }}
                  />
                }
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="followers"
                name="Followers"
                stroke="var(--primary)"
                strokeWidth={2.2}
                fill="url(#follow-grad)"
                isAnimationActive={false}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "var(--background)",
                  strokeWidth: 2,
                  fill: "var(--primary)",
                }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="newFollowers"
                name="New / day"
                stroke="var(--coral)"
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Audience by platform donut                                         */
/* ------------------------------------------------------------------ */

function AudienceByPlatform({
  breakdown,
  isLoading,
}: {
  breakdown: PlatformBreakdown[];
  isLoading: boolean;
}) {
  const data = React.useMemo(
    () =>
      breakdown
        .map((b) => ({
          name: PLATFORMS[b.platform]?.name ?? b.platform,
          value: b.followers,
          color: PLATFORM_CHART_COLOR[b.platform] ?? "var(--muted-foreground)",
          platform: b.platform,
        }))
        .sort((a, b) => b.value - a.value),
    [breakdown]
  );
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <SectionCard
      title="Audience by platform"
      description="Follower distribution across channels"
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
      ) : data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No connected channels"
          description="Connect a social account to see your audience breakdown."
        />
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
            {data.map((d) => (
              <li key={d.platform} className="flex items-center gap-2 text-xs">
                <PlatformBadge platform={d.platform} className="size-5" />
                <span className="flex-1 text-foreground">{d.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCompact(d.value)}
                </span>
                <span className="w-10 text-right tabular-nums text-muted-foreground">
                  {total === 0 ? 0 : ((d.value / total) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Top locations card                                                 */
/* ------------------------------------------------------------------ */

function TopLocations() {
  const max = Math.max(...TOP_LOCATIONS.map((l) => l.share));
  return (
    <SectionCard
      title="Top locations"
      description="Where your audience is based · mock data"
      actions={
        <Badge variant="outline" className="bg-background text-[10px]">
          Sample
        </Badge>
      }
    >
      <ul className="space-y-3">
        {TOP_LOCATIONS.map((l) => (
          <li key={l.code} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-foreground">
                <MapPin className="size-3.5 text-muted-foreground" />
                <span className="font-medium">{l.country}</span>
                <span className="text-[10px] text-muted-foreground">
                  {l.code}
                </span>
              </span>
              <span className="tabular-nums font-medium text-foreground">
                {l.share}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(l.share / max) * 100}%`,
                  background:
                    l.code === "—"
                      ? "var(--muted-foreground)"
                      : "var(--primary)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Age distribution card (horizontal BarChart)                        */
/* ------------------------------------------------------------------ */

function AgeDistribution() {
  const data = AGE_BUCKETS;
  const max = Math.max(...data.map((d) => d.share));
  return (
    <SectionCard
      title="Age distribution"
      description="Audience age buckets · mock data"
      actions={
        <Badge variant="outline" className="bg-background text-[10px]">
          Sample
        </Badge>
      }
    >
      <div
        className="h-44 w-full"
        role="img"
        aria-label="Audience age distribution from 18 to 55 plus"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, Math.ceil(max / 5) * 5]}
            />
            <YAxis
              type="category"
              dataKey="bucket"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              content={
                <ChartTooltip
                  formatters={{ share: (n) => `${n}%` }}
                />
              }
            />
            <Bar
              dataKey="share"
              name="Share"
              fill="var(--mint)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.bucket === "25–34"
                      ? "var(--primary)"
                      : "var(--mint)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Best time to post heatmap                                          */
/* ------------------------------------------------------------------ */

function BestTimeToPost() {
  const scores = React.useMemo(() => {
    return HEATMAP_DAYS.map((day, d) => ({
      day,
      cells: HEATMAP_HOURS.map((h) => ({
        hour: h.hour,
        label: h.label,
        score: heatmapScore(d, h.hour),
      })),
    }));
  }, []);

  return (
    <SectionCard
      title="Best time to post"
      description="When your audience is most active · mock data"
      actions={
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.75, 1].map((v) => (
              <span
                key={v}
                className="size-3 rounded-sm"
                style={{
                  background: `color-mix(in oklch, var(--primary) ${v * 100}%, transparent)`,
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      }
      bodyClassName="p-4 sm:p-5"
    >
      <div className="overflow-x-auto scrollbar-cadence">
        <div className="min-w-[640px]">
          {/* hour labels */}
          <div className="mb-1 flex pl-12">
            {HEATMAP_HOURS.map((h) => (
              <div
                key={h.hour}
                className="flex-1 text-center text-[10px] text-muted-foreground"
              >
                {h.label}
              </div>
            ))}
          </div>
          {/* day rows */}
          <div className="space-y-1">
            {scores.map((row) => (
              <div key={row.day} className="flex items-center">
                <div className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                  {row.day}
                </div>
                <div className="flex flex-1 gap-1">
                  {row.cells.map((c) => (
                    <div
                      key={c.hour}
                      title={`${row.day} · ${c.label} — ${Math.round(
                        c.score * 100
                      )}% activity`}
                      className="group relative aspect-[2/1] flex-1 cursor-default rounded-sm transition-transform hover:scale-110 hover:ring-2 hover:ring-primary/40"
                      style={{
                        background: `color-mix(in oklch, var(--primary) ${
                          c.score * 100
                        }%, transparent)`,
                      }}
                    >
                      <span className="sr-only">
                        {row.day} {c.label}: {Math.round(c.score * 100)}%
                        activity
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Info className="size-3" />
        Scores combine historical post engagement with audience online
        presence. Hover a cell for details.
      </p>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Top interests                                                      */
/* ------------------------------------------------------------------ */

function TopInterests() {
  return (
    <SectionCard
      title="Top interests"
      description="Inferred from audience behavior · mock data"
      actions={
        <Badge variant="outline" className="bg-background text-[10px]">
          Sample
        </Badge>
      }
    >
      <div className="flex flex-wrap gap-2">
        {TOP_INTERESTS.map((tag, i) => {
          // Vary chip "weight" deterministically for a tag-cloud feel.
          const tier = i % 4; // 0..3
          const sizeCls =
            tier === 0
              ? "text-sm font-semibold px-3 py-1"
              : tier === 1
                ? "text-sm font-medium px-2.5 py-1"
                : tier === 2
                  ? "text-xs font-medium px-2.5 py-1"
                  : "text-xs px-2 py-0.5";
          const accent =
            tier === 0
              ? "bg-primary/10 text-primary border-primary/25"
              : tier === 1
                ? "bg-mint/15 text-mint border-mint/30"
                : tier === 2
                  ? "bg-coral/10 text-coral border-coral/25"
                  : "bg-accent text-foreground border-border";
          return (
            <button
              key={tag}
              type="button"
              onClick={() =>
                toast.info(`Interest: ${tag}`, {
                  description: "Audience segment drill-down coming soon.",
                })
              }
              className={cn(
                "rounded-full border transition-transform hover:scale-105",
                sizeCls,
                accent
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                          */
/* ------------------------------------------------------------------ */

export function AudienceView() {
  const { data, isLoading } = useAnalytics();
  const series = data?.timeseries ?? [];
  const breakdown = data?.breakdown ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audience"
        description="Demographics, growth curves and segmentation across every connected channel."
        actions={
          <Badge
            variant="outline"
            className="bg-background gap-1.5 text-xs text-muted-foreground"
          >
            <CalendarClock className="size-3.5" />
            Last 30 days
          </Badge>
        }
      />

      <KpiRow series={series} breakdown={breakdown} isLoading={isLoading} />

      <FollowerGrowthChart series={series} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AudienceByPlatform breakdown={breakdown} isLoading={isLoading} />
        <TopInterests />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopLocations />
        <AgeDistribution />
      </div>

      <BestTimeToPost />

      <SectionCard
        title="Audience insights · coming next"
        description="We’re adding affinity segments, sentiment, and competitor benchmarks."
        bodyClassName="p-4"
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1 font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Affinity segments
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1 font-medium text-foreground">
            <Heart className="size-3.5 text-coral" />
            Sentiment analysis
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1 font-medium text-foreground">
            <TrendingUp className="size-3.5 text-mint" />
            Competitor benchmarks
          </span>
          <span className="text-muted-foreground">
            — rolling out over the next quarter.
          </span>
        </div>
      </SectionCard>
    </div>
  );
}
