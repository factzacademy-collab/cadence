"use client";

import * as React from "react";
import {
  Bell,
  HelpCircle,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  CalendarClock,
  ExternalLink,
  LogOut,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useApp, type AppView } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePosts } from "@/hooks/use-api";
import { Avatar } from "@/components/dashboard/shared";

const VIEW_TITLES: Record<AppView, string> = {
  overview: "Overview",
  calendar: "Calendar",
  composer: "Composer",
  queue: "Queue",
  analytics: "Analytics",
  reports: "Reports",
  audience: "Audience",
  media: "Media Library",
  ai: "AI Assistant",
  inbox: "Inbox",
  settings: "Settings",
  integrations: "Integrations",
  billing: "Billing",
  team: "Team",
};

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Post published",
    body: "Your thread on @cadence is live.",
    time: "2m ago",
    accent: "text-mint",
  },
  {
    id: "n2",
    title: "Approval needed",
    body: "Priya requested review on “Spring Launch carousel”.",
    time: "26m ago",
    accent: "text-amber-brand",
  },
  {
    id: "n3",
    title: "New comment",
    body: "@tomasbuilds replied to your reel.",
    time: "1h ago",
    accent: "text-primary",
  },
  {
    id: "n4",
    title: "Weekly report ready",
    body: "Your performance summary is available.",
    time: "Yesterday",
    accent: "text-plum",
  },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!mounted ? (
        <Sun className="size-4" />
      ) : isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

function QueuePill() {
  const { data } = usePosts({ status: "scheduled" });
  const count = data?.posts?.length ?? 0;
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground lg:inline-flex"
      title="Scheduled posts in queue"
    >
      <CalendarClock className="size-3.5 text-primary" />
      <span className="tabular-nums text-foreground">{count}</span>
      <span>queued</span>
    </span>
  );
}

function NotificationsBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          <span
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-coral ring-2 ring-background"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <span className="rounded-full bg-coral/15 px-1.5 py-0.5 text-[10px] font-medium text-coral">
            {NOTIFICATIONS.length} new
          </span>
        </div>
        <ul className="max-h-80 overflow-y-auto scrollbar-cadence">
          {NOTIFICATIONS.map((n) => (
            <li
              key={n.id}
              className="border-b border-border/50 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent/40"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full bg-current",
                    n.accent
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {n.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    {n.time}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          className="justify-center text-sm font-medium text-primary"
          onClick={() => toast.info("Opening notifications center")}
        >
          View all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const goMarketing = useApp((s) => s.goMarketing);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar name="Maya Okafor" color="from-primary to-mint" size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Maya Okafor</span>
          <span className="text-xs font-normal text-muted-foreground">
            maya@cadence.app
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => useApp.getState().setView("settings")}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={goMarketing}>
          <ExternalLink className="size-4" />
          Back to site
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => toast.success("Signed out (demo)")}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar() {
  const view = useApp((s) => s.view);
  const setMobileNav = useApp((s) => s.setMobileNav);
  const setCommandOpen = useApp((s) => s.setCommandOpen);
  const openComposer = useApp((s) => s.openComposer);

  const title = VIEW_TITLES[view] ?? "Dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 px-3 sm:px-5",
        "glass"
      )}
    >
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileNav(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h2>
        <QueuePill />
      </div>

      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={cn(
          "group hidden items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 md:flex md:w-56 lg:w-72",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Open command palette"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">Search or jump to…</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Button
          size="sm"
          onClick={() => openComposer()}
          className="hidden sm:inline-flex"
        >
          <Plus className="size-4" />
          Create post
        </Button>
        <Button
          size="icon"
          onClick={() => openComposer()}
          className="sm:hidden"
          aria-label="Create post"
        >
          <Plus className="size-4" />
        </Button>

        <NotificationsBell />
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => toast.info("Help center coming soon")}
        >
          <HelpCircle className="size-4" />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
