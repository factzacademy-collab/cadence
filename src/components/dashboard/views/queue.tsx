"use client";

import * as React from "react";
import {
  format,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
  differenceInCalendarDays,
  isThisWeek,
} from "date-fns";
import {
  AlertTriangle,
  ArrowUpDown,
  CalendarClock,
  CalendarPlus,
  Clock,
  FileEdit,
  Hourglass,
  Plus,
  RefreshCw,
  Search,
  Send,
  TimerReset,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { usePosts } from "@/hooks/use-api";
import { PLATFORM_LIST, type PlatformId } from "@/lib/brand";
import { PlatformBadge } from "@/components/brand/platform-icon";
import type { PostStatus, SocialPost } from "@/lib/types";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PostCard,
  SectionCard,
  StatCard,
  Toolbar,
  formatDate,
} from "@/components/dashboard/shared";

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                               */
/* ------------------------------------------------------------------ */

type QueueTab = "scheduled" | "drafts" | "in-review" | "failed" | "published";
type SortMode = "time" | "recent";

const TAB_LIST: { id: QueueTab; label: string }[] = [
  { id: "scheduled", label: "Scheduled" },
  { id: "drafts", label: "Drafts" },
  { id: "in-review", label: "In review" },
  { id: "failed", label: "Failed" },
  { id: "published", label: "Published" },
];

function statusForTab(tab: QueueTab): PostStatus | "all" {
  switch (tab) {
    case "scheduled":
      return "scheduled";
    case "drafts":
      return "draft";
    case "in-review":
      return "in-review";
    case "failed":
      return "failed";
    case "published":
      return "published";
  }
}

function dayGroupLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  const diff = differenceInCalendarDays(date, startOfDay(new Date()));
  if (diff > 1 && diff < 7)
    return format(date, "EEE · MMM d");
  return format(date, "EEE, MMM d");
}

/* ------------------------------------------------------------------ */
/*  Platform filter chip row                                          */
/* ------------------------------------------------------------------ */

function PlatformChips({
  selected,
  onChange,
  counts,
}: {
  selected: PlatformId[];
  onChange: (next: PlatformId[]) => void;
  counts: Record<string, number>;
}) {
  const toggle = (id: PlatformId) => {
    const set = new Set(selected);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PLATFORM_LIST.map((p) => {
        const active = selected.includes(p.id);
        const count = counts[p.id] ?? 0;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary/30 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-accent/60"
            )}
          >
            <PlatformBadge platform={p.id} className="size-4" />
            <span className="hidden sm:inline">{p.name}</span>
            {count > 0 && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1 text-[10px] tabular-nums",
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grouped post list (used in Scheduled tab)                         */
/* ------------------------------------------------------------------ */

function GroupedPostList({ posts }: { posts: SocialPost[] }) {
  const groups = React.useMemo(() => {
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
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, list]) => ({
        key,
        date: parseISO(key),
        posts: list,
      }));
  }, [posts]);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const label = dayGroupLabel(g.date);
        const isPast = g.date.getTime() < startOfDay(new Date()).getTime();
        return (
          <SectionCard
            key={g.key}
            title={
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isPast ? "bg-muted-foreground/50" : "bg-primary"
                  )}
                  aria-hidden="true"
                />
                {label}
              </span>
            }
            description={`${g.posts.length} post${g.posts.length === 1 ? "" : "s"} · ${formatDate(
              g.date,
              "MMM d, yyyy"
            )}`}
            bodyClassName="p-3"
          >
            <div className="space-y-2">
              {g.posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Flat post list (used by Drafts / In review / Failed / Published)  */
/* ------------------------------------------------------------------ */

function FlatPostList({ posts }: { posts: SocialPost[] }) {
  return (
    <SectionCard bodyClassName="p-3">
      <div className="space-y-2">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Failed banner with retry action                                   */
/* ------------------------------------------------------------------ */

function FailedBanner({ count }: { count: number }) {
  const handleRetry = () => {
    toast.success("Retrying failed posts…", {
      description: `${count} ${count === 1 ? "post" : "posts"} queued for republish.`,
    });
  };
  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <AlertTriangle className="text-destructive" />
      <AlertTitle className="text-destructive">
        {count} {count === 1 ? "post" : "posts"} failed to publish
      </AlertTitle>
      <AlertDescription>
        <p className="text-destructive/90">
          We couldn’t deliver these posts to one or more channels. Review the
          details, then retry publishing or move them back to drafts.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="destructive"
            className="h-7"
            onClick={handleRetry}
          >
            <RefreshCw className="size-3.5" />
            Retry all
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() =>
              toast.info("Opened publishing log", {
                description: "Detailed failure reasons are available in the log.",
              })
            }
          >
            View log
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/* ------------------------------------------------------------------ */
/*  Queue health rail                                                 */
/* ------------------------------------------------------------------ */

function nextPublish(posts: SocialPost[]): SocialPost | undefined {
  const now = Date.now();
  return posts
    .filter((p) => new Date(p.scheduledAt).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )[0];
}

function QueueHealthRail({ scheduled }: { scheduled: SocialPost[] }) {
  const now = new Date();
  const thisWeek = scheduled.filter((p) =>
    isThisWeek(parseISO(p.scheduledAt), { weekStartsOn: 1 })
  );
  const next = nextPublish(scheduled);

  // Average posts/day over the next 7 days
  const next7 = scheduled.filter((p) => {
    const d = parseISO(p.scheduledAt).getTime();
    return d >= now.getTime() && d <= now.getTime() + 7 * 86400000;
  });
  const avgPerDay = next7.length / 7;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard
          label="Scheduled this week"
          value={thisWeek.length}
          deltaLabel="Mon → Sun"
          icon={CalendarClock}
          accent="text-primary"
        />
        <StatCard
          label="Avg posts / day"
          value={avgPerDay.toFixed(1)}
          deltaLabel="next 7 days"
          icon={TimerReset}
          accent="text-mint"
        />
        <StatCard
          label="In queue"
          value={scheduled.length}
          deltaLabel="all upcoming"
          icon={Hourglass}
          accent="text-plum"
        />
      </div>

      <SectionCard
        title="Next publish"
        description="Your closest scheduled post"
      >
        {next ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex -space-x-1.5 pt-0.5">
                {next.platforms.slice(0, 3).map((p) => (
                  <PlatformBadge
                    key={p}
                    platform={p}
                    className="size-7 ring-2 ring-card"
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm text-foreground">
                  {next.text}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span className="tabular-nums">
                    {format(parseISO(next.scheduledAt), "EEE · h:mm a")}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => useApp.getState().openComposer(next.id)}
            >
              <FileEdit className="size-3.5" />
              Edit post
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={CalendarPlus}
            title="No upcoming publishes"
            description="Schedule a post to see it here."
            className="py-6"
          />
        )}
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeletons                                                         */
/* ------------------------------------------------------------------ */

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
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

/* ------------------------------------------------------------------ */
/*  Per-tab panel                                                     */
/* ------------------------------------------------------------------ */

function QueuePanel({
  tab,
  posts,
  isLoading,
  search,
  sort,
}: {
  tab: QueueTab;
  posts: SocialPost[];
  isLoading: boolean;
  search: string;
  sort: SortMode;
}) {
  const openComposer = useApp((s) => s.openComposer);

  const filtered = React.useMemo(() => {
    let list = posts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.platforms.some((pl) => pl.toLowerCase().includes(q))
      );
    }
    if (sort === "time") {
      list = list
        .slice()
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        );
    } else {
      list = list
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return list;
  }, [posts, search, sort]);

  if (isLoading) return <QueueSkeleton />;

  if (filtered.length === 0) {
    const empty: Record<QueueTab, { title: string; description: string }> = {
      scheduled: {
        title: "No scheduled posts",
        description: "Plan ahead by scheduling posts to your queue.",
      },
      drafts: {
        title: "No drafts",
        description: "Save a post as a draft to keep refining it later.",
      },
      "in-review": {
        title: "Nothing in review",
        description: "Send a post for review to see it here.",
      },
      failed: {
        title: "No failed posts",
        description: "Every post has published successfully. Nicely done.",
      },
      published: {
        title: "Nothing published yet",
        description: "Published posts will land here once they go live.",
      },
    };
    const e = empty[tab];
    return (
      <EmptyState
        icon={
          tab === "failed"
            ? AlertTriangle
            : tab === "published"
              ? Send
              : CalendarClock
        }
        title={e.title}
        description={e.description}
        action={
          <Button size="sm" onClick={() => openComposer()}>
            <Plus className="size-4" />
            Create post
          </Button>
        }
      />
    );
  }

  return (
    <>
      {tab === "failed" && <FailedBanner count={filtered.length} />}
      {tab === "scheduled" ? (
        <GroupedPostList posts={filtered} />
      ) : (
        <FlatPostList posts={filtered} />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                         */
/* ------------------------------------------------------------------ */

export function QueueView() {
  const openComposer = useApp((s) => s.openComposer);
  const [tab, setTab] = React.useState<QueueTab>("scheduled");
  const [platformFilter, setPlatformFilter] = React.useState<PlatformId[]>([]);
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("time");

  // We always load ALL posts (no status filter) so we can compute tab
  // counts and the rail without extra round-trips.
  const { data, isLoading } = usePosts();
  const allPosts = data?.posts ?? [];

  const counts = React.useMemo(() => {
    const c: Record<QueueTab, number> = {
      scheduled: 0,
      drafts: 0,
      "in-review": 0,
      failed: 0,
      published: 0,
    };
    for (const p of allPosts) {
      if (p.status === "scheduled") c.scheduled++;
      else if (p.status === "draft") c.drafts++;
      else if (p.status === "in-review") c["in-review"]++;
      else if (p.status === "failed") c.failed++;
      else if (p.status === "published") c.published++;
    }
    return c;
  }, [allPosts]);

  const platformCounts = React.useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of allPosts) {
      if (p.status !== statusForTab(tab)) continue;
      for (const pl of p.platforms) c[pl] = (c[pl] ?? 0) + 1;
    }
    return c;
  }, [allPosts, tab]);

  const tabPosts = React.useMemo(() => {
    const want = statusForTab(tab);
    return allPosts.filter((p) => {
      if (p.status !== want) return false;
      if (
        platformFilter.length > 0 &&
        !p.platforms.some((pl) => platformFilter.includes(pl))
      )
        return false;
      return true;
    });
  }, [allPosts, tab, platformFilter]);

  const scheduledForRail = React.useMemo(
    () =>
      allPosts
        .filter((p) => p.status === "scheduled")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        ),
    [allPosts]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publishing Queue"
        description="Every post moving through your pipeline — scheduled, drafted, in review, failed, and published."
        actions={
          <Button size="sm" onClick={() => openComposer()}>
            <Plus className="size-4" />
            Create post
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as QueueTab)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex h-9 w-full flex-wrap sm:w-auto sm:flex-nowrap">
            {TAB_LIST.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="gap-1.5 px-3"
                aria-label={`${t.label} (${counts[t.id]})`}
              >
                {t.label}
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-4 px-1 text-[10px] tabular-nums",
                    counts[t.id] === 0 && "opacity-50"
                  )}
                >
                  {counts[t.id]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <Toolbar
          className="mt-3"
          trailing={
            <>
              <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
                <SelectTrigger size="sm" className="h-8 w-40 gap-1.5">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Sort: Time</SelectItem>
                  <SelectItem value="recent">Sort: Recently added</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => openComposer()}>
                <Plus className="size-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </>
          }
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="h-8 w-full pl-8 sm:w-64"
              aria-label="Search posts"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <PlatformChips
            selected={platformFilter}
            onChange={setPlatformFilter}
            counts={platformCounts}
          />
        </Toolbar>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <QueuePanel
              tab={tab}
              posts={tabPosts}
              isLoading={isLoading}
              search={search}
              sort={sort}
            />
          </div>
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <QueueHealthRail scheduled={scheduledForRail} />
          </aside>
        </div>
      </Tabs>
    </div>
  );
}
