"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  CheckCheck,
  MessageSquare,
  AtSign,
  Mail,
  Star,
  Clock,
  CornerDownLeft,
  Send,
  Inbox as InboxIcon,
  MoreHorizontal,
  User as UserIcon,
  Hourglass,
} from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  SectionCard,
  StatCard,
  Avatar,
  EmptyState,
  SkeletonGrid,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlatformBadge, PlatformIcon } from "@/components/brand/platform-icon";
import { PLATFORM_LIST, PLATFORMS } from "@/lib/brand";
import { useInbox, useResolveInbox } from "@/hooks/use-api";
import type { InboxItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META = {
  comment: { label: "Comment", icon: MessageSquare },
  mention: { label: "Mention", icon: AtSign },
  dm: { label: "Direct message", icon: Mail },
  review: { label: "Review", icon: Star },
} as const;

const STATUS_DOT: Record<InboxItem["status"], string> = {
  open: "bg-primary",
  pending: "bg-amber-brand",
  resolved: "bg-mint",
};

export function InboxView() {
  const { data, isLoading } = useInbox();
  const resolve = useResolveInbox();
  const [type, setType] = React.useState<"all" | InboxItem["type"]>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | InboxItem["status"]>("all");
  const [platforms, setPlatforms] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const items = data?.inbox ?? [];
  const filtered = items.filter((it) => {
    if (type !== "all" && it.type !== type) return false;
    if (statusFilter !== "all" && it.status !== statusFilter) return false;
    if (platforms.length && !platforms.includes(it.platform)) return false;
    if (query && !it.text.toLowerCase().includes(query.toLowerCase()) && !it.author.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const counts = {
    open: items.filter((i) => i.status === "open").length,
    pending: items.filter((i) => i.status === "pending").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  React.useEffect(() => {
    if (!selectedId && filtered.length) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const handleResolve = (item: InboxItem, status: InboxItem["status"]) => {
    resolve.mutate(
      { id: item.id, status },
      {
        onSuccess: () => toast.success(status === "resolved" ? "Marked resolved" : `Marked ${status}`),
        onError: () => toast.error("Couldn't update"),
      }
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Engagement inbox"
        description="Reply to comments, mentions, and messages in one place."
        actions={
          <Button variant="outline" onClick={() => toast.success("All open conversations resolved")}>
            <CheckCheck className="size-4" />
            Mark all resolved
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open" value={counts.open} icon={MessageSquare} accent="text-primary" />
        <StatCard label="Pending" value={counts.pending} icon={Clock} accent="text-coral" />
        <StatCard label="Resolved" value={counts.resolved} delta={8} deltaLabel="this week" icon={CheckCheck} accent="text-mint" />
        <StatCard label="Avg. response" value="2.4h" delta={-12} deltaLabel="vs last week" icon={CornerDownLeft} accent="text-plum" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
          <TabsList className="flex h-9 flex-wrap gap-1 bg-muted/60">
            <TabsTrigger value="all" className="h-7 text-xs">All</TabsTrigger>
            <TabsTrigger value="comment" className="h-7 text-xs">Comments</TabsTrigger>
            <TabsTrigger value="mention" className="h-7 text-xs">Mentions</TabsTrigger>
            <TabsTrigger value="dm" className="h-7 text-xs">DMs</TabsTrigger>
            <TabsTrigger value="review" className="h-7 text-xs">Reviews</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Platforms {platforms.length > 0 && <Badge variant="secondary" className="ml-1">{platforms.length}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-2">
                {PLATFORM_LIST.map((p) => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={platforms.includes(p.id)}
                      onCheckedChange={(v) =>
                        setPlatforms((s) => (v ? [...s, p.id] : s.filter((x) => x !== p.id)))
                      }
                    />
                    <PlatformIcon platform={p.id} className="size-3.5" />
                    {p.name}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Two-pane */}
      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="Inbox zero"
          description="No conversations match your filters. Take a breath — you're all caught up."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          {/* List */}
          <div className="space-y-1.5 overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">{filtered.length} conversations</span>
              <div className="flex gap-1">
                {(["all", "open", "pending", "resolved"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "rounded px-2 py-0.5 text-xs capitalize transition-colors",
                      statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto scrollbar-cadence lg:max-h-[calc(100vh-280px)]">
              {filtered.map((it) => {
                const meta = TYPE_META[it.type];
                const isSel = selected?.id === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className={cn(
                      "flex w-full gap-3 border-l-2 px-3 py-3 text-left transition-colors",
                      isSel
                        ? "border-primary bg-accent/40"
                        : "border-transparent hover:bg-accent/30"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar name={it.author} color={it.avatarColor} size="sm" />
                      <span className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card", STATUS_DOT[it.status])} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{it.author}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(it.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{it.authorHandle}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{it.text}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <PlatformBadge platform={it.platform} className="size-4" />
                        <meta.icon className="size-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail */}
          {selected && (
            <ConversationDetail
              key={selected.id}
              item={selected}
              onResolve={(status) => handleResolve(selected, status)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ConversationDetail({
  item,
  onResolve,
}: {
  item: InboxItem;
  onResolve: (status: InboxItem["status"]) => void;
}) {
  const [reply, setReply] = React.useState("");
  const meta = TYPE_META[item.type];
  const platform = PLATFORMS[item.platform];

  return (
    <SectionCard
      bodyClassName="p-0"
      className="flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={item.author} color={item.avatarColor} />
          <div>
            <p className="text-sm font-medium">{item.author}</p>
            <p className="text-xs text-muted-foreground">{item.authorHandle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PlatformBadge platform={item.platform} />
          <Badge variant="outline" className="capitalize gap-1">
            <meta.icon className="size-3" />
            {meta.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onResolve("resolved")}>
                <CheckCheck className="size-4" /> Mark resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResolve("pending")}>
                <Clock className="size-4" /> Mark pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Snoozed for 4 hours")}>
                <Hourglass className="size-4" /> Snooze 4h
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Assigned to Leo")}>
                <UserIcon className="size-4" /> Assign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-cadence p-4" style={{ maxHeight: "calc(100vh - 420px)" }}>
        {/* Original post context */}
        {item.type === "comment" && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Original post</p>
            <p className="mt-1 text-sm">
              Your audience doesn't need more noise. They need rhythm. That's the whole idea behind our scheduler. #contentstrategy
            </p>
          </div>
        )}
        {/* The incoming message */}
        <div className="flex gap-3">
          <Avatar name={item.author} color={item.avatarColor} size="sm" />
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
            <p className="text-sm">{item.text}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })} · via {platform.name}
            </p>
          </div>
        </div>
      </div>

      {/* Reply */}
      <div className="border-t border-border/60 p-3">
        <div className="relative">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply to ${item.author}…`}
            rows={2}
            className="resize-none pr-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 size-8"
            onClick={handleSend}
            disabled={!reply.trim()}
            aria-label="Send reply"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-[10px] text-muted-foreground">Press Enter to send · Shift+Enter for newline</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onResolve("resolved")}>
            Resolve instead
          </Button>
        </div>
      </div>
    </SectionCard>
  );

  function handleSend() {
    if (!reply.trim()) return;
    toast.success(`Reply sent to ${item.author}`);
    setReply("");
    onResolve("resolved");
  }
}
