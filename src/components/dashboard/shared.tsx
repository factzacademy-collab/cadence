"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/lib/brand";
import type { PostStatus, SocialPost } from "@/lib/types";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { Avatar as UiAvatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/store";
import { useCreatePost, useDeletePost } from "@/hooks/use-api";
import { toast } from "sonner";

/* ============================================================
   PageHeader
   Consistent view header with title, optional description
   and a slot for primary actions on the right.
   ============================================================ */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   StatCard
   KPI card with label, big value, optional delta (percentage)
   and a tiny accent icon. `accent` is a tailwind class token
   used to tint the icon swatch (e.g. "text-coral").
   ============================================================ */
export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  accent = "text-primary",
  spark,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  accent?: string;
  spark?: number[];
}) {
  const hasDelta = typeof delta === "number";
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 border-b border-border/60 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/60",
              accent
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </CardHeader>
      <CardContent className="px-5 py-3">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {hasDelta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                  positive
                    ? "bg-mint/15 text-mint"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {positive ? "+" : ""}
                {delta!.toFixed(1)}%
              </span>
            )}
            {deltaLabel && (
              <span className="text-muted-foreground">{deltaLabel}</span>
            )}
          </div>
          {spark && spark.length > 1 && (
            <div className="h-8 w-20">
              <MiniSparkline data={spark} className="h-8 w-20" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SectionCard
   Titled card wrapper used to group content inside a view.
   ============================================================ */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const hasHeader = title || description || actions;
  return (
    <Card className={cn("py-0", className)}>
      {hasHeader && (
        <CardHeader className="flex flex-row items-start justify-between gap-2 border-b border-border/60 px-5 py-4">
          <div className="min-w-0 space-y-0.5">
            {title && (
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5", bodyClassName)}>{children}</CardContent>
    </Card>
  );
}

/* ============================================================
   StatusBadge
   Colored badge for post statuses.
   ============================================================ */
const STATUS_STYLES: Record<PostStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  scheduled: {
    label: "Scheduled",
    className:
      "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15",
  },
  published: {
    label: "Published",
    className: "bg-mint/15 text-mint border-mint/25",
  },
  failed: {
    label: "Failed",
    className:
      "bg-destructive/10 text-destructive border-destructive/25 dark:bg-destructive/15",
  },
  "in-review": {
    label: "In review",
    className: "bg-amber-brand/15 text-amber-brand border-amber-brand/30",
  },
};

export function StatusBadge({ status }: { status: PostStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={cn("font-medium", s.className)}>
      {s.label}
    </Badge>
  );
}

/* ============================================================
   Avatar
   Gradient initials avatar. `color` is a tailwind gradient
   class string like "from-primary to-mint".
   ============================================================ */
export function Avatar({
  name,
  color = "from-primary to-mint",
  size = "default",
  className,
}: {
  name: string;
  color?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const sizeClass =
    size === "sm"
      ? "size-7 text-xs"
      : size === "lg"
        ? "size-12 text-base"
        : "size-9 text-sm";

  return (
    <UiAvatar className={cn("bg-gradient-to-br", color, sizeClass, className)}>
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br text-white font-semibold",
          color,
          sizeClass
        )}
      >
        {initials}
      </AvatarFallback>
    </UiAvatar>
  );
}

/* ============================================================
   PostCard
   Compact row showing platform badges, a text snippet, the
   scheduled/published time, the status, and a kebab menu with
   Edit / Duplicate / Delete actions wired to the store + mutations.
   ============================================================ */
export function PostCard({ post }: { post: SocialPost }) {
  const openComposer = useApp((s) => s.openComposer);
  const deletePost = useDeletePost();
  const createPost = useCreatePost();

  const date = new Date(post.scheduledAt);
  const isPast = date.getTime() < Date.now();
  const dateLabel = post.status === "published"
    ? `Published ${formatDistanceToNow(date, { addSuffix: true })}`
    : isPast
      ? `Was due ${format(date, "MMM d, h:mm a")}`
      : format(date, "EEE, MMM d · h:mm a");

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => toast.success("Post deleted"),
      onError: () => toast.error("Couldn’t delete post"),
    });
  };

  const handleDuplicate = () => {
    createPost.mutate(
      {
        text: post.text,
        platforms: post.platforms,
        mediaIds: post.mediaIds,
        campaignId: post.campaignId,
        status: "draft",
        scheduledAt: new Date().toISOString(),
      },
      {
        onSuccess: () => toast.success("Duplicated as draft"),
        onError: () => toast.error("Couldn’t duplicate post"),
      }
    );
  };

  return (
    <div className="group relative flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-border hover:bg-accent/30">
      <div className="flex -space-x-2 pt-0.5">
        {post.platforms.slice(0, 3).map((p) => (
          <PlatformBadge
            key={p}
            platform={p}
            className="size-7 ring-2 ring-card"
          />
        ))}
        {post.platforms.length > 3 && (
          <span className="ml-1.5 inline-flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
            +{post.platforms.length - 3}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-foreground">{post.text}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{dateLabel}</span>
          <span aria-hidden="true">·</span>
          <StatusBadge status={post.status} />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Post actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => openComposer(post.id)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ============================================================
   EmptyState
   A tasteful empty-state block with an icon, title,
   description and optional CTA.
   ============================================================ */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-accent/20 px-6 py-10 text-center",
        className
      )}
    >
      {Icon && (
        <span className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
          <Icon className="size-5" />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/* ============================================================
   SkeletonGrid
   Renders `count` shimmer cards used while data loads.
   ============================================================ */
export function SkeletonGrid({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shimmer rounded-xl border border-border/60 bg-card p-4"
        >
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-3 h-7 w-2/3 rounded bg-muted" />
          <div className="mt-4 h-2 w-full rounded bg-muted/70" />
          <div className="mt-2 h-2 w-3/4 rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   MiniSparkline
   Tiny inline sparkline using recharts (no axes). Pass an
   array of numbers in `data`.
   ============================================================ */
export function MiniSparkline({
  data,
  color = "var(--primary)",
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  const chartData = React.useMemo(
    () => data.map((v, i) => ({ i, v })),
    [data]
  );
  if (chartData.length < 2) return null;
  return (
    <ResponsiveContainer className={cn("h-8 w-20", className)}>
      <LineChart
        data={chartData}
        margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ============================================================
   MiniArea
   Small area chart helper for reuse in views.
   ============================================================ */
export function MiniArea({
  data,
  dataKey,
  color = "var(--primary)",
  height = 220,
  formatX,
}: {
  data: Record<string, number | string>[];
  dataKey: string;
  color?: string;
  height?: number;
  formatX?: (v: any) => string;
}) {
  const gradId = React.useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${gradId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ============================================================
   DonutChart
   Small donut chart from a list of { name, value, color }.
   ============================================================ */
export function DonutChart({
  data,
  height = 180,
  innerRadius = 45,
  outerRadius = 70,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          isAnimationActive={false}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} stroke="transparent" />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ============================================================
   Toolbar / FilterBar
   A horizontal bar with a leading slot (filters) and a
   trailing slot (actions). Used at the top of list views.
   ============================================================ */
export function Toolbar({
  children,
  trailing,
  className,
}: {
  children?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {trailing && <div className="flex items-center gap-2">{trailing}</div>}
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

/** Format a number compactly (e.g. 12.4K, 1.2M). */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Format a date for display. */
export function formatDate(
  date: Date | string,
  pattern = "MMM d, yyyy"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern);
}

/** Re-export PLATFORMS for convenience in views. */
export { PLATFORMS };
