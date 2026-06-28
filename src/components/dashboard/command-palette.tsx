"use client";

import * as React from "react";
import {
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
  LayoutDashboard,
  Moon,
  Sun,
  ExternalLink,
  Search,
  CornerDownLeft,
  LayoutTemplate,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useApp, type AppView } from "@/lib/store";
import { usePosts } from "@/hooks/use-api";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { format } from "date-fns";

const NAV_ITEMS: { view: AppView; label: string; icon: LucideIcon }[] = [
  { view: "overview", label: "Overview", icon: LayoutDashboard },
  { view: "calendar", label: "Calendar", icon: CalendarDays },
  { view: "queue", label: "Queue", icon: ListChecks },
  { view: "composer", label: "Composer", icon: PenSquare },
  { view: "inbox", label: "Inbox", icon: Inbox },
  { view: "ai", label: "AI Assistant", icon: Sparkles },
  { view: "media", label: "Media Library", icon: ImageIcon },
  { view: "analytics", label: "Analytics", icon: BarChart3 },
  { view: "reports", label: "Reports", icon: FileBarChart },
  { view: "audience", label: "Audience", icon: Users },
  { view: "team", label: "Team", icon: UserCog },
  { view: "integrations", label: "Integrations", icon: Plug },
  { view: "billing", label: "Billing", icon: CreditCard },
  { view: "templates", label: "Templates", icon: LayoutTemplate },
  { view: "notifications", label: "Notifications", icon: Bell },
  { view: "settings", label: "Settings", icon: SettingsIcon },
];

export function CommandPalette() {
  const open = useApp((s) => s.commandOpen);
  const setOpen = useApp((s) => s.setCommandOpen);
  const setView = useApp((s) => s.setView);
  const openComposer = useApp((s) => s.openComposer);
  const goMarketing = useApp((s) => s.goMarketing);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const { data } = usePosts();
  const posts = data?.posts ?? [];

  const close = () => setOpen(false);

  const run = (fn: () => void) => {
    fn();
    close();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search posts, navigate, or run an action."
    >
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.view}
              value={`${item.label} ${item.view}`}
              onSelect={() => run(() => setView(item.view))}
            >
              <item.icon />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="create new post composer"
            onSelect={() => run(() => openComposer())}
          >
            <PenSquare />
            <span>Create post</span>
          </CommandItem>
          <CommandItem
            value="go to analytics"
            onSelect={() => run(() => setView("analytics"))}
          >
            <BarChart3 />
            <span>Go to analytics</span>
          </CommandItem>
          <CommandItem
            value="switch theme dark light"
            onSelect={() => run(() => setTheme(isDark ? "light" : "dark"))}
          >
            {isDark ? <Sun /> : <Moon />}
            <span>Switch to {isDark ? "light" : "dark"} theme</span>
          </CommandItem>
          <CommandItem
            value="back to site marketing home"
            onSelect={() => run(() => goMarketing())}
          >
            <ExternalLink />
            <span>Back to site</span>
          </CommandItem>
        </CommandGroup>

        {posts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Posts">
              {posts.slice(0, 8).map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.text} ${p.platforms.join(" ")} ${p.status}`}
                  onSelect={() => run(() => openComposer(p.id))}
                >
                  <PlatformBadge
                    platform={p.platforms[0]}
                    className="size-6"
                  />
                  <span className="line-clamp-1 flex-1 truncate">
                    {p.text}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(p.scheduledAt), "MMM d")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Search className="size-3" />
          Type to filter
        </span>
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft className="size-3" />
          to select
        </span>
      </div>
    </CommandDialog>
  );
}
