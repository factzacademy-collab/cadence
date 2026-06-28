"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { useCampaigns, usePosts } from "@/hooks/use-api";
import {
  PLATFORM_LIST,
  PLATFORMS,
  type PlatformId,
} from "@/lib/brand";
import {
  PlatformBadge,
  PlatformIcon,
} from "@/components/brand/platform-icon";
import type { PostStatus, SocialPost } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  EmptyState,
  PageHeader,
  PostCard,
  SectionCard,
  Toolbar,
} from "@/components/dashboard/shared";

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                               */
/* ------------------------------------------------------------------ */

type CalView = "month" | "week" | "list";

const WEEK_STARTS_ON = 1 as const; // Monday

const STATUS_DOT: Record<PostStatus, string> = {
  draft: "bg-muted-foreground/60",
  scheduled: "bg-primary",
  published: "bg-mint",
  failed: "bg-destructive",
  "in-review": "bg-amber-brand",
};

/** A soft, distinct background tint per platform for chips. */
const PLATFORM_CHIP_BG: Record<PlatformId, string> = {
  x: "bg-zinc-500/10 hover:bg-zinc-500/15 dark:bg-zinc-400/10",
  instagram: "bg-fuchsia-500/10 hover:bg-fuchsia-500/15",
  linkedin: "bg-sky-500/10 hover:bg-sky-500/15",
  facebook: "bg-blue-500/10 hover:bg-blue-500/15",
  tiktok: "bg-teal-500/10 hover:bg-teal-500/15",
  youtube: "bg-red-500/10 hover:bg-red-500/15",
  threads: "bg-zinc-500/10 hover:bg-zinc-500/15",
  pinterest: "bg-rose-500/10 hover:bg-rose-500/15",
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

/* ------------------------------------------------------------------ */
/*  Post chip used in calendar cells                                  */
/* ------------------------------------------------------------------ */

function PostChip({ post, dim }: { post: SocialPost; dim?: boolean }) {
  const openComposer = useApp((s) => s.openComposer);
  const time = format(parseISO(post.scheduledAt), "h:mm a");
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openComposer(post.id);
      }}
      aria-label={`${post.status} post at ${time} on ${post.platforms
        .map((p) => PLATFORMS[p].name)
        .join(", ")}: ${post.text}`}
      className={cn(
        "group/chip relative flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        PLATFORM_CHIP_BG[post.platforms[0]] ?? "bg-accent hover:bg-accent/70",
        dim && "opacity-50"
      )}
    >
      <PlatformBadge
        platform={post.platforms[0]}
        className="size-4 shrink-0"
      />
      <span
        className="shrink-0 font-medium tabular-nums text-foreground/80"
        aria-hidden="true"
      >
        {time}
      </span>
      <span className="min-w-0 flex-1 truncate text-foreground/70">
        {truncate(post.text, 38)}
      </span>
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          STATUS_DOT[post.status]
        )}
        aria-hidden="true"
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  +N more popover                                                   */
/* ------------------------------------------------------------------ */

function MorePostsPopover({
  posts,
  date,
}: {
  posts: SocialPost[];
  date: Date;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 inline-flex w-full items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${posts.length} more posts on ${format(date, "MMM d")}`}
        >
          +{posts.length} more
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1.5 flex items-center justify-between px-1">
          <p className="text-xs font-semibold">
            {format(date, "EEEE, MMM d")}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {posts.length} posts
          </span>
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto scrollbar-cadence">
          {posts.map((p) => (
            <PostChip key={p.id} post={p} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/*  Month view                                                        */
/* ------------------------------------------------------------------ */

const MONTH_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MonthView({
  posts,
  cursor,
  platformFilter,
}: {
  posts: SocialPost[];
  cursor: Date;
  platformFilter: PlatformId[];
}) {
  const openComposer = useApp((s) => s.openComposer);

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: WEEK_STARTS_ON });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: WEEK_STARTS_ON });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const postsByDay = React.useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    for (const p of posts) {
      const d = startOfDay(parseISO(p.scheduledAt));
      const key = format(d, "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    return map;
  }, [posts]);

  return (
    <div className="overflow-x-auto scrollbar-cadence">
      <div className="min-w-[720px]">
        {/* Weekday header */}
        <div
          className="grid grid-cols-7 border-b border-border/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          role="row"
        >
          {MONTH_WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-left"
              role="columnheader"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          className="grid grid-cols-7 grid-rows-[repeat(6,minmax(0,1fr))] divide-x divide-y divide-border/60 border-b border-l border-r border-border/60"
          style={{ minHeight: "min(64vh, 640px)" }}
        >
          {days.map((day) => {
            const inMonth = isSameMonth(day, cursor);
            const today = isToday(day);
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = postsByDay.get(key) ?? [];
            const visible = dayPosts.slice(0, 3);
            const overflow = dayPosts.slice(3);
            return (
              <button
                key={key}
                type="button"
                onClick={() => openComposer()}
                aria-label={`${format(day, "EEEE, MMMM d")}${
                  dayPosts.length > 0 ? `, ${dayPosts.length} posts` : ""
                }. Click to create a post.`}
                className={cn(
                  "group/day relative flex min-h-[112px] flex-col items-stretch gap-1 p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  inMonth ? "bg-card/40" : "bg-muted/30",
                  "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center justify-between px-0.5">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                      today
                        ? "bg-primary text-primary-foreground"
                        : inMonth
                          ? "text-foreground"
                          : "text-muted-foreground/70"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <Plus
                    className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/day:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                  {visible.map((p) => (
                    <PostChip key={p.id} post={p} dim={!inMonth} />
                  ))}
                  {overflow.length > 0 && (
                    <MorePostsPopover posts={overflow} date={day} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Week view (7-column day grid with time-sorted chips)              */
/* ------------------------------------------------------------------ */

function WeekView({
  posts,
  cursor,
}: {
  posts: SocialPost[];
  cursor: Date;
}) {
  const openComposer = useApp((s) => s.openComposer);

  const days = React.useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [cursor]);

  const postsByDay = React.useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    for (const d of days) {
      map.set(format(d, "yyyy-MM-dd"), []);
    }
    for (const p of posts) {
      const d = startOfDay(parseISO(p.scheduledAt));
      const key = format(d, "yyyy-MM-dd");
      const arr = map.get(key);
      if (arr) arr.push(p);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    return map;
  }, [days, posts]);

  return (
    <div className="overflow-x-auto scrollbar-cadence">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 divide-x divide-border/60 border-b border-border/60">
          {days.map((d) => {
            const today = isToday(d);
            const key = format(d, "yyyy-MM-dd");
            const list = postsByDay.get(key) ?? [];
            return (
              <div
                key={key}
                className="px-2 py-2 text-left"
                role="columnheader"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {format(d, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                      today
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {format(d, "d")}
                  </span>
                  {list.length > 0 && (
                    <Badge
                      variant="outline"
                      className="ml-auto h-4 px-1 text-[10px] text-muted-foreground"
                    >
                      {list.length}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7 divide-x divide-border/60">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const list = postsByDay.get(key) ?? [];
            return (
              <div
                key={key}
                className="min-h-[420px] space-y-1.5 p-1.5"
                role="cell"
              >
                {list.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => openComposer()}
                    aria-label={`No posts on ${format(d, "EEE, MMM d")}. Create one.`}
                    className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 text-[10px] text-muted-foreground/70 transition-colors hover:bg-accent/40 hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                    Add post
                  </button>
                ) : (
                  <>
                    {list.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-lg border border-border/60 bg-card p-1.5 transition-colors hover:bg-accent/40"
                      >
                        <div className="mb-1 flex items-center gap-1.5">
                          <PlatformBadge
                            platform={p.platforms[0]}
                            className="size-4"
                          />
                          <span className="text-[10px] font-medium tabular-nums text-foreground/80">
                            {format(parseISO(p.scheduledAt), "h:mm a")}
                          </span>
                          <span
                            className={cn(
                              "ml-auto size-1.5 rounded-full",
                              STATUS_DOT[p.status]
                            )}
                            aria-hidden="true"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => openComposer(p.id)}
                          className="block w-full text-left text-[11px] leading-tight text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Open post from ${format(parseISO(p.scheduledAt), "h:mm a")}: ${p.text}`}
                        >
                          <span className="line-clamp-3">{p.text}</span>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => openComposer()}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 py-1 text-[10px] text-muted-foreground/70 transition-colors hover:bg-accent/40 hover:text-foreground"
                      aria-label={`Add post on ${format(d, "EEE, MMM d")}`}
                    >
                      <Plus className="size-3" />
                      Add
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  List view — grouped by relative date                              */
/* ------------------------------------------------------------------ */

function bucketLabel(date: Date): string {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, tomorrow)) return "Tomorrow";
  const endOfThisWeek = endOfWeek(today, { weekStartsOn: WEEK_STARTS_ON });
  if (isWithinInterval(date, { start: today, end: endOfThisWeek }))
    return "This week";
  return "Later";
}

function ListView({ posts }: { posts: SocialPost[] }) {
  const openComposer = useApp((s) => s.openComposer);

  const groups = React.useMemo(() => {
    const buckets: { label: string; posts: SocialPost[] }[] = [
      { label: "Today", posts: [] },
      { label: "Tomorrow", posts: [] },
      { label: "This week", posts: [] },
      { label: "Later", posts: [] },
    ];
    for (const p of posts) {
      const d = startOfDay(parseISO(p.scheduledAt));
      const label = bucketLabel(d);
      const b = buckets.find((x) => x.label === label);
      if (b) b.posts.push(p);
    }
    for (const b of buckets) {
      b.posts.sort(
        (a, b2) =>
          new Date(a.scheduledAt).getTime() - new Date(b2.scheduledAt).getTime()
      );
    }
    return buckets.filter((b) => b.posts.length > 0);
  }, [posts]);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nothing scheduled yet"
        description="Plan your first post and see it appear here in your content calendar."
        action={
          <Button size="sm" onClick={() => openComposer()}>
            <Plus className="size-4" />
            Schedule a post
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <SectionCard
          key={g.label}
          title={g.label}
          description={`${g.posts.length} post${g.posts.length === 1 ? "" : "s"}`}
          bodyClassName="p-3"
        >
          <div className="space-y-2">
            {g.posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform filter popover (multi-select)                            */
/* ------------------------------------------------------------------ */

function PlatformFilter({
  selected,
  onChange,
}: {
  selected: PlatformId[];
  onChange: (next: PlatformId[]) => void;
}) {
  const toggle = (id: PlatformId) => {
    const set = new Set(selected);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          aria-haspopup="dialog"
        >
          <PlatformBadge
            platform={selected[0] ?? "instagram"}
            className="size-4"
          />
          Channels
          {selected.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 px-1 text-[10px]"
            >
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="mb-1.5 flex items-center justify-between px-1">
          <p className="text-xs font-semibold">Filter by channel</p>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="max-h-72 space-y-0.5 overflow-y-auto scrollbar-cadence">
          {PLATFORM_LIST.map((p) => {
            const checked = selected.includes(p.id);
            return (
              <label
                key={p.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/60",
                  checked && "bg-accent/40"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(p.id)}
                  aria-label={`Filter by ${p.name}`}
                />
                <PlatformBadge platform={p.id} className="size-5" />
                <span className="flex-1">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {p.id}
                </span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/*  Campaign filter select                                            */
/* ------------------------------------------------------------------ */

function CampaignFilter({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const { data } = useCampaigns();
  const campaigns = data?.campaigns ?? [];
  return (
    <Select
      value={value ?? "all"}
      onValueChange={(v) => onChange(v === "all" ? null : v)}
    >
      <SelectTrigger size="sm" className="h-8 w-44 gap-1.5">
        <Tag className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All campaigns</SelectItem>
        {campaigns.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton for calendar loading state                               */
/* ------------------------------------------------------------------ */

function CalendarSkeleton({ view }: { view: CalView }) {
  if (view === "list") {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <Skeleton className="h-4 w-24" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="grid grid-cols-7 border-b border-border/60">
        {MONTH_WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[112px] p-1.5">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="mt-2 space-y-1">
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform legend                                                   */
/* ------------------------------------------------------------------ */

function PlatformLegend() {
  return (
    <div className="hidden items-center gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground lg:flex">
      <span className="font-semibold uppercase tracking-wide">Status</span>
      {(
        [
          ["Scheduled", "bg-primary"],
          ["Published", "bg-mint"],
          ["In review", "bg-amber-brand"],
          ["Draft", "bg-muted-foreground/60"],
          ["Failed", "bg-destructive"],
        ] as const
      ).map(([label, dot]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", dot)} />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                         */
/* ------------------------------------------------------------------ */

export function CalendarView() {
  const openComposer = useApp((s) => s.openComposer);
  const [view, setView] = React.useState<CalView>("month");
  const [cursor, setCursor] = React.useState<Date>(() => new Date());
  const [platformFilter, setPlatformFilter] = React.useState<PlatformId[]>([]);
  const [campaignFilter, setCampaignFilter] = React.useState<string | null>(
    null
  );

  const { data, isLoading } = usePosts();
  const posts = data?.posts ?? [];

  // Compute the visible window for the active view, then filter posts.
  const visiblePosts = React.useMemo(() => {
    let window: { start: Date; end: Date };
    if (view === "month") {
      window = {
        start: startOfWeek(startOfMonth(cursor), {
          weekStartsOn: WEEK_STARTS_ON,
        }),
        end: endOfWeek(endOfMonth(cursor), { weekStartsOn: WEEK_STARTS_ON }),
      };
    } else if (view === "week") {
      window = {
        start: startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON }),
        end: endOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON }),
      };
    } else {
      // List shows everything from today forward
      window = {
        start: startOfDay(new Date()),
        end: addDays(new Date(), 365),
      };
    }

    return posts
      .filter((p) => {
        const d = parseISO(p.scheduledAt);
        if (!isWithinInterval(d, window)) return false;
        if (
          platformFilter.length > 0 &&
          !p.platforms.some((pl) => platformFilter.includes(pl))
        )
          return false;
        if (campaignFilter && p.campaignId !== campaignFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [posts, view, cursor, platformFilter, campaignFilter]);

  const headerLabel = React.useMemo(() => {
    if (view === "month") return format(cursor, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON });
      const end = endOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON });
      if (start.getMonth() === end.getMonth())
        return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(new Date(), "MMMM yyyy");
  }, [view, cursor]);

  const goPrev = () =>
    setCursor((c) =>
      view === "month" ? subMonths(c, 1) : subWeeks(c, 1)
    );
  const goNext = () =>
    setCursor((c) =>
      view === "month" ? addMonths(c, 1) : addWeeks(c, 1)
    );
  const goToday = () => setCursor(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Calendar"
        description="Plan every post across all your channels in one calm, drag-free grid."
        actions={
          <Button size="sm" onClick={() => openComposer()}>
            <Plus className="size-4" />
            Create post
          </Button>
        }
      />

      <Toolbar
        trailing={
          <>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => {
                if (v) setView(v as CalView);
              }}
              variant="outline"
              size="sm"
              aria-label="Calendar view"
            >
              <ToggleGroupItem value="month" aria-label="Month view">
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Month</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Week view">
                <CalendarDays className="size-3.5" />
                <span className="hidden sm:inline">Week</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <ListIcon className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <Button size="sm" onClick={() => openComposer()}>
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">New post</span>
            </Button>
          </>
        }
      >
        {view !== "list" && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={goPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 min-w-[7.5rem] justify-center"
              onClick={goToday}
            >
              {headerLabel}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={goNext}
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={goToday}
            >
              Today
            </Button>
          </div>
        )}
        {view === "list" && (
          <div className="flex h-8 items-center px-2 text-sm font-medium text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </div>
        )}
        <PlatformFilter
          selected={platformFilter}
          onChange={setPlatformFilter}
        />
        <CampaignFilter
          value={campaignFilter}
          onChange={setCampaignFilter}
        />
      </Toolbar>

      <PlatformLegend />

      {isLoading ? (
        <CalendarSkeleton view={view} />
      ) : view === "month" ? (
        visiblePosts.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Schedule your first post"
            description="Click any day to start composing. Posts you schedule will appear here as chips."
            action={
              <Button size="sm" onClick={() => openComposer()}>
                <Plus className="size-4" />
                Create a post
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
            <MonthView
              posts={visiblePosts}
              cursor={cursor}
              platformFilter={platformFilter}
            />
          </div>
        )
      ) : view === "week" ? (
        visiblePosts.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No posts this week"
            description="Pick a day below or jump to the composer to fill this week."
            action={
              <Button size="sm" onClick={() => openComposer()}>
                <Plus className="size-4" />
                Schedule a post
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
            <WeekView posts={visiblePosts} cursor={cursor} />
          </div>
        )
      ) : (
        <ListView posts={visiblePosts} />
      )}
    </div>
  );
}
