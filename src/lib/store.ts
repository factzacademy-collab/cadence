"use client";

import { create } from "zustand";

export type AppView =
  | "overview"
  | "calendar"
  | "composer"
  | "queue"
  | "analytics"
  | "reports"
  | "audience"
  | "media"
  | "ai"
  | "inbox"
  | "settings"
  | "integrations"
  | "billing"
  | "team";

export type Route = "marketing" | "app";

interface AppState {
  route: Route;
  view: AppView;
  composerOpen: boolean;
  composerPostId?: string | null;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandOpen: boolean;
  goMarketing: () => void;
  goApp: (view?: AppView) => void;
  setView: (view: AppView) => void;
  openComposer: (postId?: string | null) => void;
  closeComposer: () => void;
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
}

export const useApp = create<AppState>((set) => ({
  route: "marketing",
  view: "overview",
  composerOpen: false,
  composerPostId: null,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  commandOpen: false,
  goMarketing: () => set({ route: "marketing", view: "overview" }),
  goApp: (view) =>
    set({ route: "app", view: view ?? "overview", mobileNavOpen: false }),
  setView: (view) => set({ view, mobileNavOpen: false }),
  openComposer: (postId) => set({ composerOpen: true, composerPostId: postId ?? null }),
  closeComposer: () => set({ composerOpen: false, composerPostId: null }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
}));

/** Hash-based deep-linking so the single `/` route can reflect app state. */
export function syncHashFromState() {
  const { route, view } = useApp.getState();
  const hash = route === "app" ? `#app/${view}` : "";
  if (window.location.hash !== hash) {
    window.history.replaceState(null, "", window.location.pathname + hash);
  }
}

export function readStateFromHash(): { route: Route; view: AppView } | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const [r, v] = hash.split("/");
  if (r === "app") {
    const valid: AppView[] = [
      "overview", "calendar", "composer", "queue", "analytics", "reports",
      "audience", "media", "ai", "inbox", "settings", "integrations", "billing", "team",
    ];
    return { route: "app", view: (valid as string[]).includes(v) ? (v as AppView) : "overview" };
  }
  if (r === "marketing" || r === "") return { route: "marketing", view: "overview" };
  return null;
}
