"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  Users2,
  Heart,
  MousePointerClick,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TrendingUp,
  Filter,
  Check,
  type LucideIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { useAnalytics, usePosts } from "@/hooks/use-api";
import { PLATFORMS, type PlatformId } from "@/lib/brand";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DonutChart,
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  Toolbar,
  formatCompact,
  formatDate,
} from "@/components/dashboard/shared";
import type { AnalyticsPoint, PlatformBreakdown, SocialPost } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                */
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

type RangeKey = "7" | "30" | "90";
const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7d" },
  { key: "30", label: "30d" },
  { key: "90", label: "90d" },
];

type MetricKey = "impressions" | "reach" | "engagement" | "clicks";
const METRIC_OPTIONS: {
  key: MetricKey;
  label: string;
  color: string;
  icon: LucideIcon;
}[] = [
  { key: "impressions", label: "Impressions", color: "var(--primary)", icon: Eye },
  { key: "reach", label: "Reach", color: "var(--mint)", icon: Users2 },
  { key: "engagement", label: "Engagement", color: "var(--coral)", icon: Heart },
  { key: "clicks", label: "Clicks", color: "var(--amber-brand)", icon: MousePointerClick },
];

const pct = (now: number, prev: number) => {
  if (!prev) return 0;
  return ((now - prev) / prev) * 100;
};

const sumKey = (arr: AnalyticsPoint[], key: keyof AnalyticsPoint) =>
  arr.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);

/* ------------------------------------------------------------------ */
/* Custom tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (n: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const fmt = valueFormatter ?? formatCompact;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label && (
        <p className="mb-1 font-medium text-foreground">{label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((p, i) => (
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
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Platform filter popover                                            */
/* ------------------------------------------------------------------ */

function PlatformFilter({
  selected,
  onChange,
  options,
}: {
  selected: PlatformId[];
  onChange: (next: PlatformId[]) => void;
  options: PlatformId[];
}) {
  const [open, setOpen] = React.useState(false);

  const toggle = (p: PlatformId) => {
    onChange(
      selected.includes(p)
        ? selected.filter((x) => x !== p)
        : [...selected, p]
    );
  };

  const label =
    selected.length === 0
      ? "All platforms"
      : selected.length === 1
        ? PLATFORMS[selected[0]].name
        : `${selected.length} platforms`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Filter className="size-3.5" />
          {label}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filter by platform
        </div>
        <div className="max-h-72 overflow-y-auto scrollbar-cadence">
          {options.map((p) => {
            const checked = selected.includes(p);
            return (
              <button
                key={p}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(p)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}
                >
                  {checked && <Check className="size-3" />}
                </span>
                <PlatformBadge platform={p} className="size-5" />
                <span className="flex-1 text-foreground">
                  {PLATFORMS[p].name}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-border/60 px-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
          >
            Clear
          </Button>
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* KPI row                                                            */
/* ------------------------------------------------------------------ */

function KpiRow({
  series,
  isLoading,
}: {
  series: AnalyticsPoint[];
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

  const half = Math.floor(series.length / 2);
  const nowArr = series.slice(half);
  const prevArr = series.slice(0, half);
  // Provide a 14-point spark window (or whatever's available)
  const spark = (key: keyof AnalyticsPoint) =>
    series.slice(-14).map((p) => Number(p[key]));

  const kpis = [
    {
      label: "Impressions",
      value: formatCompact(sumKey(nowArr, "impressions")),
      delta: pct(sumKey(nowArr, "impressions"), sumKey(prevArr, "impressions")),
      deltaLabel: "vs prev period",
      icon: Eye,
      accent: "text-primary",
      spark: spark("impressions"),
    },
    {
      label: "Reach",
      value: formatCompact(sumKey(nowArr, "reach")),
      delta: pct(sumKey(nowArr, "reach"), sumKey(prevArr, "reach")),
      deltaLabel: "vs prev period",
      icon: Users2,
      accent: "text-mint",
      spark: spark("reach"),
    },
    {
      label: "Engagement",
      value: formatCompact(sumKey(nowArr, "engagement")),
      delta: pct(
        sumKey(nowArr, "engagement"),
        sumKey(prevArr, "engagement")
      ),
      deltaLabel: "vs prev period",
      icon: Heart,
      accent: "text-coral",
      spark: spark("engagement"),
    },
    {
      label: "Clicks",
      value: formatCompact(sumKey(nowArr, "clicks")),
      delta: pct(sumKey(nowArr, "clicks"), sumKey(prevArr, "clicks")),
      deltaLabel: "vs prev period",
      icon: MousePointerClick,
      accent: "text-amber-brand",
      spark: spark("clicks"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <StatCard key={k.label} {...k} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main composed chart with metric toggle                             */
/* ------------------------------------------------------------------ */

function MainPerformanceChart({
  series,
  metric,
  onMetricChange,
  isLoading,
}: {
  series: AnalyticsPoint[];
  metric: MetricKey;
  onMetricChange: (m: MetricKey) => void;
  isLoading: boolean;
}) {
  const meta = METRIC_OPTIONS.find((m) => m.key === metric)!;
  const data = React.useMemo(
    () =>
      series.map((p) => ({
        date: format(parseISO(p.date), "MMM d"),
        value: Number(p[metric]),
      })),
    [series, metric]
  );

  const total = React.useMemo(
    () => data.reduce((acc, d) => acc + d.value, 0),
    [data]
  );

  // show every Nth tick depending on density
  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1);

  const uid = React.useId().replace(/:/g, "");
  const gradId = `area-grad-${uid}`;

  return (
    <SectionCard
      title="Performance over time"
      description="Daily totals across every connected channel"
      actions={
        <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-0.5">
          {METRIC_OPTIONS.map((m) => {
            const active = m.key === metric;
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onMetricChange(m.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={active ? { color: m.color } : undefined}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      }
      bodyClassName="p-4 sm:p-5"
    >
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : data.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No performance data yet"
          description="Connect a channel and publish a post to see daily metrics here."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {meta.label} · total
              </p>
              <p
                className="text-2xl font-semibold tabular-nums"
                style={{ color: meta.color }}
              >
                {formatCompact(total)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.length} day window · avg{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatCompact(total / Math.max(1, data.length))}
              </span>{" "}
              / day
            </p>
          </div>
          <div
            className="h-72 w-full"
            role="img"
            aria-label={`Daily ${meta.label} for the last ${data.length} days`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
              >
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={meta.color}
                      stopOpacity={0.32}
                    />
                    <stop
                      offset="100%"
                      stopColor={meta.color}
                      stopOpacity={0}
                    />
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
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => formatCompact(Number(v))}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={
                    <ChartTooltip
                      valueFormatter={formatCompact}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={meta.label}
                  stroke={meta.color}
                  strokeWidth={2.2}
                  fill={`url(#${gradId})`}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: "var(--background)",
                    strokeWidth: 2,
                    fill: meta.color,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Engagement rate trend line chart                                   */
/* ------------------------------------------------------------------ */

function EngagementRateTrend({
  series,
  isLoading,
}: {
  series: AnalyticsPoint[];
  isLoading: boolean;
}) {
  const data = React.useMemo(
    () =>
      series.map((p) => ({
        date: format(parseISO(p.date), "MMM d"),
        rate: p.reach > 0 ? (p.engagement / p.reach) * 100 : 0,
      })),
    [series]
  );
  const avg = React.useMemo(
    () =>
      data.length === 0
        ? 0
        : data.reduce((a, b) => a + b.rate, 0) / data.length,
    [data]
  );
  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  return (
    <SectionCard
      title="Engagement rate trend"
      description="Engagement ÷ reach, as a daily percentage"
    >
      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No engagement data"
          description="Engagement rate will appear once you have impressions and reach."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Avg rate
            </span>
            <span className="text-xl font-semibold tabular-nums text-coral">
              {avg.toFixed(2)}%
            </span>
          </div>
          <div
            className="h-56 w-full"
            role="img"
            aria-label="Daily engagement rate over the selected window"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 6, right: 8, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="er-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
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
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={
                    <ChartTooltip
                      valueFormatter={(n) => `${n.toFixed(2)}%`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Engagement rate"
                  stroke="var(--coral)"
                  strokeWidth={2.2}
                  fill="url(#er-grad)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: "var(--background)",
                    strokeWidth: 2,
                    fill: "var(--coral)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Impressions by platform donut + legend                             */
/* ------------------------------------------------------------------ */

function ImpressionsByPlatform({
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
          value: b.impressions,
          color: PLATFORM_CHART_COLOR[b.platform] ?? "var(--muted-foreground)",
          platform: b.platform,
        }))
        .sort((a, b) => b.value - a.value),
    [breakdown]
  );
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <SectionCard
      title="Impressions by platform"
      description="Share of voice across channels"
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
          icon={Eye}
          title="No platform breakdown"
          description="Connect a channel to start collecting per-platform impressions."
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
              <li
                key={d.platform}
                className="flex items-center gap-2 text-xs"
              >
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
/* Platform breakdown table (sortable)                                */
/* ------------------------------------------------------------------ */

type SortKey = "platform" | "followers" | "posts" | "impressions" | "rate";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  keyName,
  sortKey,
  sortDir,
  onToggle,
  align = "left",
}: {
  label: string;
  keyName: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggle: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === keyName;
  return (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button
        type="button"
        onClick={() => onToggle(keyName)}
        className={cn(
          "inline-flex items-center gap-1 rounded text-xs font-medium uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" ? "flex-row-reverse" : ""
        )}
      >
        {label}
        {active &&
          (sortDir === "asc" ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          ))}
      </button>
    </TableHead>
  );
}

function PlatformBreakdownTable({
  breakdown,
  isLoading,
}: {
  breakdown: PlatformBreakdown[];
  isLoading: boolean;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("impressions");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const rows = React.useMemo(() => {
    const arr = [...breakdown];
    arr.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "platform":
          av = PLATFORMS[a.platform]?.name ?? a.platform;
          bv = PLATFORMS[b.platform]?.name ?? b.platform;
          break;
        case "followers":
          av = a.followers;
          bv = b.followers;
          break;
        case "posts":
          av = a.posts;
          bv = b.posts;
          break;
        case "rate":
          av = a.engagementRate;
          bv = b.engagementRate;
          break;
        default:
          av = a.impressions;
          bv = b.impressions;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return arr;
  }, [breakdown, sortKey, sortDir]);

  const maxImpressions = React.useMemo(
    () => rows.reduce((m, r) => Math.max(m, r.impressions), 0),
    [rows]
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "platform" ? "asc" : "desc");
    }
  };

  return (
    <SectionCard
      title="Platform breakdown"
      description="Per-channel followers, posting cadence and impressions"
      bodyClassName="p-0"
    >
      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={Users2}
            title="No connected channels"
            description="Connect a social account to see a per-platform breakdown."
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHeader
                label="Platform"
                keyName="platform"
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
              />
              <SortHeader
                label="Followers"
                keyName="followers"
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
                align="right"
              />
              <SortHeader
                label="Posts"
                keyName="posts"
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
                align="right"
              />
              <SortHeader
                label="Impressions"
                keyName="impressions"
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
                align="right"
              />
              <SortHeader
                label="Eng. rate"
                keyName="rate"
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
                align="right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const widthPct =
                maxImpressions === 0
                  ? 0
                  : (r.impressions / maxImpressions) * 100;
              return (
                <TableRow key={r.platform}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <PlatformBadge platform={r.platform} className="size-7" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {PLATFORMS[r.platform]?.name ?? r.platform}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {r.posts} posts
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCompact(r.followers)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.posts}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            background: "var(--primary)",
                          }}
                        />
                      </div>
                      <span className="tabular-nums text-foreground">
                        {formatCompact(r.impressions)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className="font-medium tabular-nums"
                    >
                      {r.engagementRate.toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Top performing posts                                               */
/* ------------------------------------------------------------------ */

function TopPerformingPosts({ isLoading }: { isLoading: boolean }) {
  const { data, isLoading: postsLoading } = usePosts({ status: "published" });
  const openComposer = useApp((s) => s.openComposer);

  const posts: SocialPost[] = React.useMemo(() => {
    const all = data?.posts ?? [];
    return all
      .filter((p) => p.metrics)
      .sort(
        (a, b) =>
          (b.metrics?.impressions ?? 0) - (a.metrics?.impressions ?? 0)
      )
      .slice(0, 6);
  }, [data]);

  const loading = isLoading || postsLoading;

  return (
    <SectionCard
      title="Top performing posts"
      description="The 6 published posts with the most impressions"
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
      bodyClassName="p-0"
    >
      {loading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={TrendingUp}
            title="No published posts with metrics yet"
            description="Once posts go live, your top performers will show up here."
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {posts.map((p, idx) => {
            const m = p.metrics!;
            const eng = m.likes + m.comments + m.shares + m.saves;
            const er = m.reach > 0 ? (eng / m.reach) * 100 : 0;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => openComposer(p.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40 sm:px-5"
                >
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-foreground">
                      {p.text}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="flex -space-x-1.5">
                        {p.platforms.slice(0, 3).map((pl) => (
                          <PlatformBadge
                            key={pl}
                            platform={pl}
                            className="size-4 ring-2 ring-background"
                          />
                        ))}
                      </div>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatDate(p.scheduledAt, "MMM d")}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCompact(m.impressions)}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {formatCompact(eng)} eng · {er.toFixed(1)}%
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                            */
/* ------------------------------------------------------------------ */

function AnalyticsToolbar({
  range,
  onRangeChange,
  platforms,
  onPlatformsChange,
  platformOptions,
}: {
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  platforms: PlatformId[];
  onPlatformsChange: (p: PlatformId[]) => void;
  platformOptions: PlatformId[];
}) {
  return (
    <Toolbar
      trailing={
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => toast.info("Exporting CSV…", {
            description: "Your analytics export will download in a moment.",
          })}
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      }
    >
      <ToggleGroup
        type="single"
        value={range}
        onValueChange={(v) => v && onRangeChange(v as RangeKey)}
        className="rounded-md border border-border/70 bg-muted/40 p-0.5"
        size="sm"
      >
        {RANGE_OPTIONS.map((r) => (
          <ToggleGroupItem
            key={r.key}
            value={r.key}
            className="h-7 px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {r.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <PlatformFilter
        selected={platforms}
        onChange={onPlatformsChange}
        options={platformOptions}
      />
    </Toolbar>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                          */
/* ------------------------------------------------------------------ */

export function AnalyticsView() {
  const { data, isLoading } = useAnalytics();
  const allSeries = data?.timeseries ?? [];
  const breakdown = data?.breakdown ?? [];

  const [range, setRange] = React.useState<RangeKey>("30");
  const [platforms, setPlatforms] = React.useState<PlatformId[]>([]);
  const [metric, setMetric] = React.useState<MetricKey>("impressions");

  const platformOptions = React.useMemo(
    () => breakdown.map((b) => b.platform),
    [breakdown]
  );

  // Slice the visible window from the timeseries (mock always has 30 points).
  const rangeN = Number(range);
  const visibleSeries = React.useMemo(
    () => allSeries.slice(-rangeN),
    [allSeries, rangeN]
  );

  // For platform filter, we only have aggregate breakdown — but we can still
  // honor the filter by hiding rows whose platform isn't selected (UI-level).
  const filteredBreakdown = React.useMemo(() => {
    if (platforms.length === 0) return breakdown;
    return breakdown.filter((b) => platforms.includes(b.platform));
  }, [breakdown, platforms]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Cross-channel performance with custom date ranges, segments and exports."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Exporting CSV…", {
              description: "Your analytics export will download in a moment.",
            })}
          >
            <Download className="size-4" />
            Export
          </Button>
        }
      />

      <AnalyticsToolbar
        range={range}
        onRangeChange={setRange}
        platforms={platforms}
        onPlatformsChange={setPlatforms}
        platformOptions={platformOptions}
      />

      <KpiRow series={visibleSeries} isLoading={isLoading} />

      <MainPerformanceChart
        series={visibleSeries}
        metric={metric}
        onMetricChange={setMetric}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EngagementRateTrend series={visibleSeries} isLoading={isLoading} />
        <ImpressionsByPlatform
          breakdown={filteredBreakdown}
          isLoading={isLoading}
        />
      </div>

      <PlatformBreakdownTable
        breakdown={filteredBreakdown}
        isLoading={isLoading}
      />

      <TopPerformingPosts isLoading={false} />
    </div>
  );
}
