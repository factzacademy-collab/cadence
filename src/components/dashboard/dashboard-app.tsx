"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Composer } from "@/components/dashboard/composer";

import { OverviewView } from "@/components/dashboard/views/overview";
import { CalendarView } from "@/components/dashboard/views/calendar";
import { QueueView } from "@/components/dashboard/views/queue";
import { ComposerView } from "@/components/dashboard/views/composer";
import { AnalyticsView } from "@/components/dashboard/views/analytics";
import { ReportsView } from "@/components/dashboard/views/reports";
import { AudienceView } from "@/components/dashboard/views/audience";
import { MediaView } from "@/components/dashboard/views/media";
import { AiView } from "@/components/dashboard/views/ai";
import { InboxView } from "@/components/dashboard/views/inbox";
import { SettingsView } from "@/components/dashboard/views/settings";
import { IntegrationsView } from "@/components/dashboard/views/integrations";
import { BillingView } from "@/components/dashboard/views/billing";
import { TeamView } from "@/components/dashboard/views/team";

const VIEW_COMPONENTS = {
  overview: OverviewView,
  calendar: CalendarView,
  composer: ComposerView,
  queue: QueueView,
  analytics: AnalyticsView,
  reports: ReportsView,
  audience: AudienceView,
  media: MediaView,
  ai: AiView,
  inbox: InboxView,
  settings: SettingsView,
  integrations: IntegrationsView,
  billing: BillingView,
  team: TeamView,
} as const;

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

export default function DashboardApp() {
  const view = useApp((s) => s.view);
  const setCommandOpen = useApp((s) => s.setCommandOpen);
  const openComposer = useApp((s) => s.openComposer);

  // Global keyboard shortcuts: ⌘K → command palette, "c" → composer.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!useApp.getState().commandOpen);
        return;
      }
      if (!mod && e.key.toLowerCase() === "c" && !isTypingTarget(e.target)) {
        e.preventDefault();
        openComposer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen, openComposer]);

  const ViewComponent = VIEW_COMPONENTS[view] ?? OverviewView;

  return (
    <div
      className={cn(
        "flex min-h-screen w-full bg-canvas text-foreground"
      )}
      data-view={view}
    >
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          className="relative flex-1 overflow-y-auto scrollbar-cadence"
          tabIndex={-1}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8"
            >
              <ViewComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global overlays */}
      <Composer />
      <CommandPalette />
    </div>
  );
}
