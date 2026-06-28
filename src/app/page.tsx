"use client";

import { useEffect, lazy, Suspense } from "react";
import { useApp, syncHashFromState, readStateFromHash } from "@/lib/store";

const MarketingSite = lazy(() => import("@/components/marketing/marketing-site"));
const DashboardApp = lazy(() => import("@/components/dashboard/dashboard-app"));

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-pulse rounded-xl bg-gradient-to-br from-primary via-mint to-coral" />
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-marquee rounded-full bg-primary/60" />
        </div>
        <p className="text-xs text-muted-foreground">Loading workspace…</p>
      </div>
    </div>
  );
}

export default function Home() {
  const route = useApp((s) => s.route);
  const view = useApp((s) => s.view);
  const goApp = useApp((s) => s.goApp);
  const goMarketing = useApp((s) => s.goMarketing);
  const setView = useApp((s) => s.setView);

  // Restore state from URL hash on first paint.
  useEffect(() => {
    const initial = readStateFromHash();
    if (initial) {
      if (initial.route === "app") goApp(initial.view);
      else goMarketing();
    }
    const onHash = () => {
      const s = readStateFromHash();
      if (!s) return;
      if (s.route === "app") {
        if (useApp.getState().route !== "app") goApp(s.view);
        else if (useApp.getState().view !== s.view) setView(s.view);
      } else {
        goMarketing();
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
     
  }, []);

  // Persist current state to the hash.
  useEffect(() => {
    syncHashFromState();
    if (route === "app") window.scrollTo({ top: 0 });
  }, [route, view]);

  return (
    <Suspense fallback={<FullScreenLoader />}>
      {route === "marketing" ? <MarketingSite /> : <DashboardApp />}
    </Suspense>
  );
}
