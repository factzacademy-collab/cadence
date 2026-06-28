"use client";

import * as React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  PenSquare,
  Inbox,
  Sparkles,
  Image as ImageIcon,
  BarChart3,
  FileBarChart,
  Users,
  UserCog,
  Plug,
  CreditCard,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  Plus,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useApp, type AppView } from "@/lib/store";
import { Logo } from "@/components/brand/logo";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccounts } from "@/hooks/use-api";
import { Avatar } from "@/components/dashboard/shared";

interface NavItem {
  view: AppView;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Plan",
    items: [
      { view: "overview", label: "Overview", icon: LayoutDashboard },
      { view: "calendar", label: "Calendar", icon: CalendarDays },
      { view: "queue", label: "Queue", icon: ListChecks },
      { view: "composer", label: "Composer", icon: PenSquare },
    ],
  },
  {
    label: "Engage",
    items: [
      { view: "inbox", label: "Inbox", icon: Inbox },
      { view: "ai", label: "AI Assistant", icon: Sparkles },
      { view: "media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    label: "Insights",
    items: [
      { view: "analytics", label: "Analytics", icon: BarChart3 },
      { view: "reports", label: "Reports", icon: FileBarChart },
      { view: "audience", label: "Audience", icon: Users },
    ],
  },
  {
    label: "Workspace",
    items: [
      { view: "team", label: "Team", icon: UserCog },
      { view: "integrations", label: "Integrations", icon: Plug },
      { view: "billing", label: "Billing", icon: CreditCard },
      { view: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

const CURRENT_USER = {
  name: "Maya Okafor",
  role: "Owner",
  color: "from-primary to-mint",
};

function ThemeToggleMenuItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <DropdownMenuItem
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </DropdownMenuItem>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const goMarketing = useApp((s) => s.goMarketing);
  const setMobileNav = useApp((s) => s.setMobileNav);
  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.accounts ?? [];
  const connected = accounts.filter((a) => a.connected).slice(0, 6);

  const handleNav = (v: AppView) => {
    setView(v);
    setMobileNav(false);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => {
            goMarketing();
            setMobileNav(false);
          }}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to marketing site"
        >
          <Logo className={cn(collapsed && "justify-center")} showText={!collapsed} />
        </button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 min-h-0 px-2">
        <nav aria-label="Dashboard" className="flex flex-col gap-4 py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!collapsed && (
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = view === item.view;
                  const button = (
                    <button
                      key={item.view}
                      type="button"
                      onClick={() => handleNav(item.view)}
                      aria-current={active ? "page" : undefined}
                      data-active={active}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-accent text-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                        />
                      )}
                      <item.icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                  if (collapsed) {
                    return (
                      <li key={item.view}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {button}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }
                  return <li key={item.view}>{button}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Connected channels strip */}
      {!collapsed && connected.length > 0 && (
        <div className="mx-2 mb-2 rounded-lg border border-sidebar-border/60 bg-background/40 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Connected channels
          </p>
          <div className="flex flex-wrap gap-1.5">
            {connected.map((a) => (
              <Tooltip key={a.id}>
                <TooltipTrigger asChild>
                  <span>
                    <PlatformBadge platform={a.platform} className="size-6" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {a.handle} · {a.followers.toLocaleString()} followers
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Footer: workspace switcher + user */}
      <div className="shrink-0 border-t border-sidebar-border/60 p-2">
        <WorkspaceSwitcher collapsed={collapsed} />
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const setView = useApp((s) => s.setView);
  const setMobileNav = useApp((s) => s.setMobileNav);

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="mb-1 flex size-9 w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary to-mint text-primary-foreground"
            aria-label="Switch workspace"
          >
            <span className="text-xs font-bold">CH</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Cadence HQ</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="mb-1 flex w-full items-center gap-2 rounded-lg border border-sidebar-border/60 bg-background/40 px-2 py-2 text-left outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Switch workspace"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-mint text-[10px] font-bold text-primary-foreground">
            CH
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-sidebar-foreground">
              Cadence HQ
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              Scale plan
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-mint text-[9px] font-bold text-primary-foreground">
            CH
          </span>
          <span className="flex-1 truncate">Cadence HQ</span>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Current
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-coral to-amber-brand text-[9px] font-bold text-white">
            NB
          </span>
          <span className="flex-1 truncate">Northbeam Agency</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setView("team");
            setMobileNav(false);
          }}
        >
          <Plus className="size-4" />
          Invite teammates
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Workspace switcher coming soon")}>
          <ExternalLink className="size-4" />
          Create new workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ collapsed }: { collapsed: boolean }) {
  const goMarketing = useApp((s) => s.goMarketing);
  const setMobileNav = useApp((s) => s.setMobileNav);

  if (collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-9 w-full items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <Avatar
                  name={CURRENT_USER.name}
                  color={CURRENT_USER.color}
                  size="sm"
                />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{CURRENT_USER.name}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <UserMenuItems
            goMarketing={goMarketing}
            setMobileNav={setMobileNav}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar
            name={CURRENT_USER.name}
            color={CURRENT_USER.color}
            size="sm"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-sidebar-foreground">
              {CURRENT_USER.name}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {CURRENT_USER.role}
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <UserMenuItems goMarketing={goMarketing} setMobileNav={setMobileNav} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenuItems({
  goMarketing,
  setMobileNav,
}: {
  goMarketing: () => void;
  setMobileNav: (open: boolean) => void;
}) {
  return (
    <>
      <DropdownMenuLabel className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {CURRENT_USER.name}
        </span>
        <span className="text-xs font-normal text-muted-foreground">
          maya@cadence.app
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <ThemeToggleMenuItem />
      <DropdownMenuItem
        onClick={() => {
          goMarketing();
          setMobileNav(false);
        }}
      >
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
    </>
  );
}

/** Collapse toggle button shown on desktop only. */
function CollapseToggle() {
  const collapsed = useApp((s) => s.sidebarCollapsed);
  const toggle = useApp((s) => s.toggleSidebar);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 z-20 hidden size-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent md:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {collapsed ? "Expand" : "Collapse"} (⌘B)
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const collapsed = useApp((s) => s.sidebarCollapsed);
  const mobileOpen = useApp((s) => s.mobileNavOpen);
  const setMobileNav = useApp((s) => s.setMobileNav);

  // ⌘B toggles desktop collapse
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        useApp.getState().toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-sidebar-border/60 transition-[width] duration-200 ease-linear md:block",
          collapsed ? "w-16" : "w-64"
        )}
        aria-label="Primary navigation"
      >
        <CollapseToggle />
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileNav}>
        <SheetContent
          side="left"
          className="w-72 border-sidebar-border/60 p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}
