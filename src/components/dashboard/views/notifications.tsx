"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  SkeletonGrid,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  kind: "info" | "success" | "warning" | "error";
  category: "publishing" | "engagement" | "reports" | "team" | "system";
  read: boolean;
  createdAt: string;
  actionLabel?: string;
  actionView?: string;
}

const ICONS = {
  publishing: Calendar,
  engagement: Mail,
  reports: TrendingUp,
  team: Users,
  system: Settings,
} as const;

const KIND_STYLES = {
  info: "border-primary/20 bg-primary/5 text-primary",
  success: "border-mint/30 bg-mint/10 text-mint",
  warning: "border-amber-brand/30 bg-amber-brand/10 text-amber-brand",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Post published", body: "Your post about the spring launch is now live on Instagram and X.", kind: "success", category: "publishing", read: false, createdAt: new Date(Date.now() - 30 * 6e4).toISOString(), actionLabel: "View post", actionView: "queue" },
  { id: "n2", title: "New comment needs a reply", body: "@daniela commented: 'This is exactly what our team needed.'", kind: "info", category: "engagement", read: false, createdAt: new Date(Date.now() - 2 * 36e5).toISOString(), actionLabel: "Reply", actionView: "inbox" },
  { id: "n3", title: "Weekly report ready", body: "Your June 22–28 performance summary is ready to view.", kind: "info", category: "reports", read: false, createdAt: new Date(Date.now() - 5 * 36e5).toISOString(), actionLabel: "Open report", actionView: "reports" },
  { id: "n4", title: "Post failed to publish", body: "Your scheduled TikTok post couldn't be published. Reconnect the account.", kind: "error", category: "publishing", read: false, createdAt: new Date(Date.now() - 8 * 36e5).toISOString(), actionLabel: "Retry", actionView: "queue" },
  { id: "n5", title: "Approval requested", body: "Priya Sharma requested approval on 'Q2 awareness carousel'.", kind: "warning", category: "team", read: true, createdAt: new Date(Date.now() - 26 * 36e5).toISOString(), actionLabel: "Review", actionView: "queue" },
  { id: "n6", title: "New team member", body: "Sofia Reyes accepted your invitation and joined the workspace.", kind: "success", category: "team", read: true, createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
  { id: "n7", title: "Engagement milestone 🎉", body: "Your Instagram reached 180K followers — up 12% this quarter.", kind: "success", category: "reports", read: true, createdAt: new Date(Date.now() - 4 * 864e5).toISOString(), actionLabel: "View analytics", actionView: "analytics" },
  { id: "n8", title: "AI credits running low", body: "You've used 318 of 500 AI caption credits this month.", kind: "warning", category: "system", read: true, createdAt: new Date(Date.now() - 5 * 864e5).toISOString(), actionLabel: "Manage plan", actionView: "billing" },
  { id: "n9", title: "Scheduled post reminder", body: "'Founder Q&A clip' is scheduled to publish in 15 minutes.", kind: "info", category: "publishing", read: true, createdAt: new Date(Date.now() - 6 * 864e5).toISOString() },
];

export function NotificationsView() {
  const [notifications, setNotifications] = React.useState<Notification[]>(NOTIFICATIONS);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const setView = useApp((s) => s.setView);

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    today: notifications.filter((n) => Date.now() - +new Date(n.createdAt) < 864e5).length,
  };

  const markRead = (id: string) => {
    setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((s) => s.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const remove = (id: string) => {
    setNotifications((s) => s.filter((n) => n.id !== id));
    toast.success("Notification dismissed");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Notifications"
        description="Stay on top of publishing, engagement, and team activity."
        actions={
          <Button variant="outline" onClick={markAllRead} disabled={stats.unread === 0}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={stats.total} icon={Bell} accent="text-primary" />
        <StatCard label="Unread" value={stats.unread} icon={Mail} accent="text-coral" />
        <StatCard label="Today" value={stats.today} icon={TrendingUp} accent="text-mint" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="unread" className="text-xs">Unread ({stats.unread})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "You're all caught up" : "No notifications"}
          description={filter === "unread" ? "No unread notifications. We'll let you know when something needs your attention." : "Notifications will appear here as your team publishes and engages."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = ICONS[n.category];
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
                  n.read ? "border-border/50" : "border-border bg-accent/20"
                )}
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", KIND_STYLES[n.kind])}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                    {n.actionLabel && n.actionView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => { markRead(n.id); setView(n.actionView as never); }}
                      >
                        {n.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => markRead(n.id)} aria-label="Mark as read">
                      <Check className="size-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => remove(n.id)} aria-label="Dismiss">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SectionCard
        title="Notification preferences"
        description="Control what you're notified about"
        actions={<Button variant="outline" size="sm" onClick={() => setView("settings")}><Settings className="size-4" />Manage in settings</Button>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(ICONS).map(([cat, Icon]) => (
            <div key={cat} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{cat}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">On</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
