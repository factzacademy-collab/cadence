# Task 3-b — Insights cluster (analytics / reports / audience)

Owner: Staff Frontend Engineer (insights cluster)
Files owned (replaced in place):
- `src/components/dashboard/views/analytics.tsx` — Analytics Overview (flagship insights page)
- `src/components/dashboard/views/reports.tsx` — Reports & Exports
- `src/components/dashboard/views/audience.tsx` — Audience Insights

Scope rules (from main agent contract):
- DO NOT touch any file outside the 3 owned files. Other agents work on other views in parallel (calendar, queue, ai, inbox, settings, integrations, billing, team).
- Reuse shared primitives from `@/components/dashboard/shared` (PageHeader, StatCard, SectionCard, StatusBadge, PostCard, EmptyState, SkeletonGrid, Avatar, MiniArea, MiniSparkline, DonutChart, Toolbar, formatCompact, formatDate, PLATFORMS).
- Use shadcn/ui + lucide-react + framer-motion + recharts + date-fns + sonner toast.
- All API access through React Query hooks in `@/hooks/use-api.ts`.
- Brand colors via tokens: `var(--primary)` teal, `var(--coral)`, `var(--amber-brand)`, `var(--mint)`, `var(--plum)`. No indigo/blue.

Reusable conventions introduced here (other agents may follow):
- Platform donut color map for consistent slice colors across all insights views:
  ```
  const PLATFORM_CHART_COLOR: Record<PlatformId, string> = {
    instagram: "var(--coral)",
    x: "var(--foreground)",
    linkedin: "var(--chart-1)",   // teal-ish
    facebook: "var(--chart-5)",   // plum
    tiktok: "var(--primary)",
    youtube: "var(--coral)",
    threads: "var(--plum)",
    pinterest: "var(--amber-brand)",
  };
  ```
  Each view defines its own local copy (kept inline to avoid cross-file coupling).
- Date-range segmented control: `ToggleGroup type="single"` with `7 | 30 | 90`.
- Custom recharts tooltip wrapper `ChartTooltip` (local to each view) styled with popover tokens; always returns null on empty payload.
- Sortable table headers: small `ArrowUp/ArrowDown` lucide icons next to label, click toggles direction.
- Heatmap cells use `style={{ backgroundColor: color-mix(in oklch, var(--primary) X%, transparent) }}` to derive opacity from a 0..1 score; primary-only palette keeps dark mode correct.
- Top performing posts click → `useApp.getState().openComposer(post.id)` (read-only-ish; composer loads it).
- Charts wrapped in `ResponsiveContainer` with fixed-height parent; render `<EmptyState>` instead of a broken chart when data is empty.

Verification:
- `bun run lint` passes after replacements (0 errors, 1 known pre-existing warning from react-hook-form in another file).
- Dev server compiles cleanly; `/` returns 200.
