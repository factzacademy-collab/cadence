# Cadence — Build Worklog

This file tracks all agent work on the Cadence social-media orchestration platform
(an original recreation inspired by the public behavior of buffer.com).

Shared conventions:
- Brand: "Cadence" (original). Primary color: deep teal. Accents: coral, amber, mint, plum.
- Single user-facing route: `/` (src/app/page.tsx). App state is driven by a
  Zustand store (`src/lib/store.ts`) with hash-based deep-linking (`#app/<view>`).
- Design tokens live in `src/app/globals.css` (oklch, light + dark). Custom
  utilities: `.scrollbar-cadence`, `.text-gradient-brand`, `.bg-grid`, `.bg-dots`,
  `.glass`, `.shimmer`, animations (`animate-fade-up`, `animate-float`,
  `animate-marquee`, `animate-pulse-ring`). Reduced-motion is respected.
- shadcn/ui components already exist in `src/components/ui/*` — USE THEM, do not
  reinvent. Import icons from `lucide-react`.
- Brand primitives: `src/components/brand/logo.tsx` (`Logo`, `LogoMark`),
  `src/components/brand/platform-icon.tsx` (`PlatformIcon`, `PlatformBadge`).
- Data layer:
  - Mock seed: `src/lib/data/mock.ts` (posts, media, accounts, campaigns,
    analytics, inbox, team, integrations, activity, testimonials, faqs, pricing).
  - In-memory CRUD store: `src/lib/data/store.ts` (singleton `store`).
  - API routes under `src/app/api/*` (posts, analytics, media, accounts, inbox,
    team, integrations, activity, campaigns, ai/chat, ai/captions).
  - React Query hooks: `src/hooks/use-api.ts`.
- AI: `src/lib/ai.ts` wraps `z-ai-web-dev-sdk` (server-only). `/api/ai/chat`
  and `/api/ai/captions` are wired and have graceful fallbacks.
- Prisma schema pushed (`prisma/schema.prisma`). `db` client: `src/lib/db.ts`.
- Footer rule: every page that has a footer MUST use a root wrapper with
  `min-h-screen flex flex-col` and `mt-auto` on the footer so it sticks to the
  bottom on short content and pushes down on long content.
- Tailwind v4 (CSS-first). Use semantic tokens (`bg-background`, `text-primary`,
  `text-muted-foreground`, `border-border`, etc.). Do NOT use indigo/blue as
  primary brand colors. Teal/coral/amber/mint/plum are the brand palette.

---
Task ID: 1
Agent: Principal Architect (main)
Task: Foundation — design system, providers, view-router store, brand, types, mock data, Prisma schema, API routes, React Query hooks, root page shell.

Work Log:
- Wrote custom design system in `src/app/globals.css` (teal primary, coral/amber/mint/plum accents, light + dark, custom utilities, keyframes, reduced-motion, scrollbars).
- Added `src/components/providers.tsx` (next-themes + React Query + sonner + tooltip).
- Updated `src/app/layout.tsx` (Geist fonts, full metadata/OG, providers).
- Added `src/lib/store.ts` (Zustand view router + hash deep-linking helpers).
- Added `src/lib/brand.ts` (brand constants, platform metadata, nav, footer columns).
- Added `src/lib/types.ts` (full domain types) and `src/lib/ui-store.ts`.
- Added `src/components/brand/logo.tsx` and `src/components/brand/platform-icon.tsx` (original SVG glyphs).
- Added `src/lib/data/mock.ts` (deterministic seed: 42 posts, 12 media, 8 accounts, campaigns, 30-day analytics, inbox, team, integrations, activity, testimonials, FAQs, pricing, stats).
- Added `src/lib/data/store.ts` (in-memory CRUD singleton).
- Added `src/lib/ai.ts` (z-ai-web-dev-sdk wrapper; `cadenceChat`, `generateCaptions`).
- Wrote Prisma schema (User, Workspace, Membership, SocialAccount, Post, MediaAsset, Campaign, InboxItem, TeamMember, WorkspaceIntegration, ActivityEvent, AiConversation, AiMessage, Notification, AuditLog) and ran `bun run db:push` (OK).
- Wrote API routes: posts (GET/POST + [id] PATCH/DELETE), analytics, media, accounts, inbox, team, integrations, activity, campaigns, ai/chat, ai/captions.
- Added `src/hooks/use-api.ts` (React Query hooks for every endpoint).
- Wrote `src/app/page.tsx` (lazy-loaded MarketingSite / DashboardApp with hash sync + Suspense loader) and stub entry components.

Stage Summary:
- Foundation complete and lint-clean. Dashboard + marketing entry components are stubs and need full implementation by subagents.
- View router switches the whole app within the single `/` route; dashboard sections are AppView values in the store.
- Backend is interactive (CRUD posts, toggle integrations, resolve inbox, invite members, AI chat + caption generation).

---

---
Task ID: 2-a
Agent: Staff Frontend Engineer + Senior UX Designer
Task: Public marketing site — complete, world-class, fully responsive marketing surface for Cadence (header, 11 sections, footer).

Work Log:
- Replaced stub `src/components/marketing/marketing-site.tsx` with a full
  composition: root `min-h-screen flex flex-col bg-background`, skip-link,
  `SiteHeader`, `<main id="main" className="flex-1">` with 11 sections in
  order (Hero, Logos, Features, HowItWorks, Channels, AnalyticsShowcase,
  AiSection, Testimonials, Pricing, Faq, Cta), and `SiteFooter` (carries
  `mt-auto` so the sticky-footer rule holds on short content).
- Added `src/components/marketing/site-header.tsx`: sticky, glass-on-scroll
  (scroll listener, 8px threshold), desktop nav from MARKETING_NAV anchors,
  next-themes Sun/Moon toggle (hydration-safe via mounted flag), "Sign in"
  ghost + "Start free" primary → `goApp('overview')`. Mobile hamburger
  opens a `Sheet` with nav + CTAs + trust line.
- Added `src/components/marketing/site-footer.tsx`: brand + tagline +
  newsletter form (sonner toast) + social icons; 4 link columns from
  FOOTER_COLUMNS; bottom row with copyright, legal links, decorative
  region/language `<select>`, "Made with ❤ by the Cadence team".
- Added 11 section components under `src/components/marketing/sections/`:
  - `hero.tsx` — gradient headline, BRAND.tagline, Start free + Watch demo
    (Dialog), CSS product mock (tilted glass card with heat-map calendar +
    queue cards + floating stat chips via `.animate-float` + 3
    PlatformBadges), `.bg-grid` + blurred brand blobs, framer-motion
    staggered fade-up gated by `useReducedMotion`.
  - `logos.tsx` — "Trusted by 75,000+ teams" + seamless marquee of 8
    fictional wordmarks (Lumio, Northbeam, Fjord Studio, Verde, Loop
    Coffee, Cadence Labs, Halcyon, Pinegrove).
  - `features.tsx` — 6 feature cards (Composer, Content Calendar, Approval
    Workflows, Analytics, Engagement Inbox, AI Assistant), tinted icon
    tiles, hover lift + border highlight.
  - `how-it-works.tsx` — 3 steps (Plan → Publish → Measure), gradient
    icon tiles, desktop connector lines.
  - `channels.tsx` — 8 platform tiles from PLATFORM_LIST + PlatformIcon,
    decorative "Connect" affordance.
  - `analytics-showcase.tsx` — split: copy + bullets + CTA on the left;
    recharts AreaChart (impressions + engagement, 12-week series) in a
    glass card on the right, with 2 floating KPI chips. Custom tooltip.
  - `ai-section.tsx` — mock chat exchange (user bubble + 3 AI caption
    suggestions with platform badges + hashtags) on the left; copy + CTA
    on the right; brand gradient blobs.
  - `testimonials.tsx` — TESTIMONIALS grid, gradient avatar initials,
    overall rating row (5 stars + "4.9/5 from 2,400+ reviews").
  - `pricing.tsx` — PRICING (3 tiers), highlighted middle, Monthly/Annual
    toggle with framer-motion `layoutId` pill, annual = 20% off (client
    math), price animates on toggle via `AnimatePresence`. CTA → goApp.
  - `faq.tsx` — FAQS array in a shadcn Accordion.
  - `cta.tsx` — full-width brand-gradient band, headline, email input +
    Start free (sonner toast + email validation), "Talk to sales" link.

Conventions future agents MUST follow (full detail in
`/agent-ctx/2-a-marketing-site.md`):
- Sticky footer: root `min-h-screen flex flex-col`, footer `mt-auto`.
- Single-route app: never use `<Link>`/`useRouter`; enter dashboard via
  `useApp(s => s.goApp)('overview')`.
- Section ids are part of the nav contract: `#top`, `#features`,
  `#channels`, `#customers` (testimonials), `#resources` (faq), `#pricing`,
  `#cta`. Do not rename without updating `MARKETING_NAV` in brand.ts.
- Theme toggle: hydration-safe via `mounted` flag + `resolvedTheme`.
- Toasts: `sonner` `toast` for all form submit feedback; email regex is
  `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Visuals are CSS/SVG/recharts — no heavy images. Reuse globals.css
  utilities (`.bg-grid`, `.bg-dots`, `.glass`, `.text-gradient-brand`,
  `.animate-float`, `.animate-marquee`, `.mask-fade-x`, `.mask-fade-b`).
- framer-motion: subtle, always gate with `useReducedMotion()`.
- No hardcoded brand colors — use semantic tokens + brand accent tokens
  (`text-coral`, `text-mint`, `text-amber-brand`, `text-plum`). Decorative
  gradients (blobs, CTA band) are the only intentional exceptions.
- Accessibility: landmark `aria-labelledby`, skip-link, keyboard-focusable
  interactive elements, visible focus rings (global in globals.css).

Stage Summary:
- Marketing site complete and lint-clean (0 errors, 2 pre-existing
  warnings outside this scope in `src/app/page.tsx` and
  `src/lib/data/store.ts`). Page renders HTTP 200; SSR HTML contains all
  key marketing copy. Ready for dashboard build-out (Task 2-b+).

---
Task ID: 2-b
Agent: Staff Frontend Engineer
Task: Dashboard shell + Overview view + shared primitives + placeholder views for Cadence.

Work Log:
- Replaced the `src/components/dashboard/dashboard-app.tsx` stub with a full
  app shell: a flex `min-h-screen` container holding the Sidebar, a main
  column (Topbar + scrollable `<main>`), the global Composer Sheet, and the
  Command Palette. Renders the active view from the store via a static
  `VIEW_COMPONENTS` record (no edit needed when later agents replace a
  placeholder file). Includes a skip-link, ⌘K / "c" keyboard shortcuts, and
  a `framer-motion` `AnimatePresence` page transition keyed by `view`.
- Built `src/components/dashboard/sidebar.tsx` — custom aside (not the
  shadcn `<Sidebar>` system, to keep state in our store). Four nav groups
  (Plan / Engage / Insights / Workspace), active-state highlight with a
  left accent bar, icon-only rail mode with tooltips when collapsed,
  desktop ⌘B toggle, connected-channels strip (via `useAccounts`), a
  workspace switcher dropdown, and a current-user dropdown with theme
  toggle, "Back to site", and "Sign out".
- Built `src/components/dashboard/topbar.tsx` — sticky glass bar with
  mobile hamburger, derived page title, a "Queue: N queued" KPI pill
  (from `usePosts({ status: 'scheduled' })`), a command-palette trigger
  styled like a search input (with ⌘K hint), "Create post" primary
  button, notifications bell dropdown, theme toggle, help button, and
  avatar dropdown.
- Built `src/components/dashboard/command-palette.tsx` — `CommandDialog`
  with three groups: Navigate (every view), Actions (create post,
  analytics, switch theme, back to site), and Posts (filterable list
  from `usePosts()` that opens the composer in edit mode).
- Built `src/components/dashboard/composer.tsx` — wide right-side Sheet
  with a two-column layout (editor | live preview). Multi-select
  platform chips, char counter with dynamic most-restrictive limit
  (X=280, LinkedIn=3000, others=2200), datetime-local input with
  "Now / Tomorrow 9am / Next week 9am" presets, a Popover media picker
  (via `useMedia`), AI caption generation (via `useGenerateCaptions`,
  shows 3 suggestion chips), campaign selector (via `useCampaigns`),
  status select (draft/scheduled/in-review), react-hook-form + zod
  validation, live preview card with avatar/text/platform
  badges/media thumbnail, and a footer with Discard / Save draft /
  Schedule. Edit mode hydrates from `composerPostId`.
- Built `src/components/dashboard/views/overview.tsx` — full Overview
  dashboard: PageHeader with greeting + date, 4 StatCards (Impressions,
  Reach, Engagement, Followers) with 7-day deltas and MiniSparklines
  computed from `useAnalytics().timeseries`, a "This week" horizontal
  scroll of PostCards, two-column layout with Upcoming queue + Activity
  feed (icon timeline from `useActivity`) + Audience-by-platform donut
  (recharts Pie from `useAnalytics().breakdown`), a 30-day Performance
  area chart (recharts AreaChart) with a side legend, and a
  Campaigns-in-flight strip (from `useCampaigns`). All sections show
  shimmer skeletons while loading.
- Built `src/components/dashboard/shared.tsx` — the shared-primitives
  contract documented below.
- Built `src/components/dashboard/views/_placeholder.tsx` — generic
  `ViewPlaceholder` (gradient icon swatch, "Coming together" pill, CTA
  back to Overview) and 13 distinct placeholder views (calendar, queue,
  composer, analytics, reports, audience, media, ai, inbox, settings,
  integrations, billing, team), each with a unique lucide icon, title,
  one-line description, and on-brand accent gradient.
- Verified: `bun run lint` passes (0 errors, 1 unavoidable warning from
  react-hook-form's `watch()` API vs React Compiler). Dev server
  compiles clean and serves HTTP 200 on `/`.

Stage Summary:
- Dashboard shell, Overview view, shared primitives, and 13 placeholder
  views are in place. Later agents can replace any individual
  `src/components/dashboard/views/<view>.tsx` file with a full
  implementation WITHOUT touching `dashboard-app.tsx` — the view router
  is a static record keyed by AppView.
- All data flows through React Query hooks (`use-api.ts`). No view
  imports mock data directly except for purely decorative constants
  (e.g. `PLATFORMS`).

============================================================
SHARED DASHBOARD PRIMITIVES — CONTRACT
File: `src/components/dashboard/shared.tsx`
Import path: `@/components/dashboard/shared`
All primitives are client-safe ("use client" at the top of the file).

1. PageHeader({ title, description?, actions?, className? })
   - Consistent view header. `title` is rendered inside an <h1>.
   - `actions` is a flex row of buttons/links on the right (wraps on
     mobile). Use this at the top of every view.

2. StatCard({ label, value, delta?, deltaLabel?, icon?, accent?, spark? })
   - KPI card with a label, big value, optional delta percentage
     (positive = mint, negative = destructive), optional deltaLabel,
     optional lucide `icon` rendered in a tinted swatch (use `accent`
     like "text-primary", "text-coral", "text-mint", "text-plum"),
     and optional `spark: number[]` rendered as a MiniSparkline.

3. SectionCard({ title?, description?, actions?, children?, className?, bodyClassName? })
   - Titled card wrapper used to group content inside a view. Header
     is omitted if none of title/description/actions are passed.
     `bodyClassName` defaults to `p-5`.

4. StatusBadge({ status })
   - Colored Badge for PostStatus union:
     draft (muted), scheduled (primary), published (mint),
     failed (destructive), in-review (amber).

5. PostCard({ post })
   - Compact post row: platform badges (stacked, +N overflow), 2-line
     text snippet, relative or absolute time, StatusBadge, and a
     kebab DropdownMenu with Edit (openComposer(post.id)), Duplicate
     (useCreatePost), Delete (useDeletePost). All mutations fire
     sonner toasts. Self-contained — just drop it in any list.

6. EmptyState({ icon?, title, description?, action?, className? })
   - Tasteful dashed-border empty state with optional icon swatch,
     title, description, and optional CTA node.

7. SkeletonGrid({ count = 3, className? })
   - Grid of shimmer cards (uses `.shimmer` utility from globals.css).

8. Avatar({ name, color = "from-primary to-mint", size = "default", className? })
   - Gradient initials avatar built on the shadcn <Avatar> primitive.
     `color` is a tailwind gradient class string. `size` is
     "sm" | "default" | "lg". Use this everywhere you need a user/team
     avatar (NOT the platform badge).
     NOTE: This is named `Avatar` and lives in
     `@/components/dashboard/shared`. The shadcn Avatar lives in
     `@/components/ui/avatar` — disambiguate by import path.

9. MiniSparkline({ data: number[], color?, className? })
   - Tiny inline recharts LineChart (no axes). `data` is a plain
     number[]. Returns null if data has fewer than 2 points.

10. MiniArea({ data, dataKey, color?, height?, formatX? })
    - Small recharts AreaChart helper. `data` is an array of records,
      `dataKey` is the key to plot. Includes a gradient fill.

11. DonutChart({ data: { name, value, color }[], height?, innerRadius?, outerRadius? })
    - recharts PieChart donut. `color` per slice should be a CSS
      color (var(--primary), oklch(...), etc.).

12. Toolbar({ children?, trailing?, className? })
    - Horizontal bar with leading filters and trailing actions. Use
      at the top of list/table views.

Helpers (also exported):
- formatCompact(n: number): string — Intl compact notation (12.4K, 1.2M).
- formatDate(date, pattern?): string — date-fns format wrapper.
- PLATFORMS — re-exported from `@/lib/brand` for convenience.

Conventions for later agents:
- Always wrap view content in a `<div className="space-y-6">` and start
  with `<PageHeader .../>`.
- Use `<SectionCard>` for grouped content rather than raw `<Card>`.
- Use `<StatCard>` for any KPI; pass `spark` whenever you have a
  timeseries.
- Use `<PostCard>` for any post row — it already wires Edit/Duplicate/
  Delete.
- Use `<EmptyState>` + `<SkeletonGrid>` (or shimmer divs) so loading
  and empty states stay consistent across views.
- Render notifications via `sonner`'s `toast` — do not introduce a
  second toast system.
- Read view from the store with `useApp((s) => s.view)` and switch with
  `setView`. Do NOT introduce a second router.
- Open the composer with `useApp((s) => s.openComposer)` (optionally
  with a post id for edit mode). Closing is automatic on submit/discard.
============================================================

---
Task ID: 3-b
Agent: Staff Frontend Engineer (insights cluster)
Task: Replace three placeholder views with full, production-grade insights implementations — Analytics Overview (flagship), Reports & Exports, Audience Insights.

Files replaced (only these; nothing else touched):
- src/components/dashboard/views/analytics.tsx — AnalyticsView
- src/components/dashboard/views/reports.tsx — ReportsView
- src/components/dashboard/views/audience.tsx — AudienceView

Work Log:
- Read worklog Task 2-b in full to internalize the shared-primitives contract
  (PageHeader, StatCard, SectionCard, StatusBadge, PostCard, EmptyState,
  SkeletonGrid, Avatar, MiniSparkline, MiniArea, DonutChart, Toolbar,
  formatCompact, formatDate, PLATFORMS). Reused all of them; did not
  reinvent.
- Wrote `/agent-ctx/3-b-insights-views.md` to document scope, conventions,
  and the per-platform donut color map used in all three views.
- ANALYTICS (analytics.tsx):
  - Toolbar with `ToggleGroup type="single"` date-range segmented control
    (7/30/90d, default 30d), platform multi-select `Popover` (custom
    role="checkbox" rows with PlatformBadge), and an "Export CSV" button
    that fires a sonner toast.
  - Visible series sliced from `useAnalytics().timeseries` (last N points).
  - KPI row of 4 StatCards: Impressions / Reach / Engagement / Clicks —
    each with `formatCompact` value, delta % vs the previous equal-length
    window (half-slice comparison), and a 14-point MiniSparkline.
  - Main performance chart: SectionCard with metric toggle
    (Impressions / Reach / Engagement / Clicks) that switches the plotted
    AreaChart series. Custom `ChartTooltip` styled with popover tokens.
    X axis formatted dates with adaptive tickInterval; Y axis compact;
    subtle `CartesianGrid` (horizontal only).
  - Two-column row: left = Engagement-rate-trend AreaChart (engagement /
    reach * 100) with brand coral gradient; right = Impressions-by-platform
    `DonutChart` from `breakdown` with a legend listing platform +
    `formatCompact` value + share %.
  - Platform breakdown `Table` with sortable headers (Platform /
    Followers / Posts / Impressions / Eng. rate). Header sort button is
    a standalone component (lifted out of the parent so it isn't created
    during render — required to satisfy `react-hooks/static-components`).
    Impressions cell renders a subtle primary bar whose width is the
    relative share of the max. PlatformBadge in the first column.
  - Top performing posts list: top 6 published posts by
    `metrics.impressions` (sorted client-side), ranked 1..6, with
    truncated text, platform badges, date, impressions + engagement
    count + engagement rate. Row click → `useApp.getState().openComposer(post.id)`.
  - Loading skeletons for KPIs, charts, table, and top-posts list;
    EmptyState fallbacks when series/breakdown is empty.
  - Charts wrapped in fixed-height `ResponsiveContainer`; each has
    `role="img"` + `aria-label`. Responsive grid (2x2 KPIs on mobile,
    4 across on xl; two-column row collapses to single column on mobile).
- REPORTS (reports.tsx):
  - PageHeader with "New report" button (toast).
  - Report templates grid: 6 cards (Weekly Summary, Monthly Performance,
    Campaign Report, Audience Growth, Content Audit, Custom) — each with
    tinted icon swatch, title, description, cadence pill, and a
    "Generate" button. Clicking opens a `Dialog` with date-range radio
    group (7/30/90d), format radio group (PDF/CSV), channel badges, and
    a Generate confirm that fires a sonner toast.
  - Scheduled reports `Table`: 4 mock scheduled reports with name +
    format icon, cadence, recipient count + first email, last sent,
    next run, active `Switch` (toggles pause/resume toast), and an
    edit/remove `DropdownMenu`.
  - Recent reports `Table`: 5 generated report rows with template badge,
    generated date, author, size, and Eye (preview) + Download
    (toast) actions. Preview opens a `Dialog` showing a tasteful
    rendered report preview: 4 KPI cards, a 14-day mini AreaChart
    (impressions + reach with dual gradient fills), and a "Top
    performing posts" mini table.
  - Quick export `SectionCard`: three buttons (PDF / CSV / chart PNG),
    each fires a sonner toast.
  - Tips card with three CheckCircle2 bullets and a coming-next strip.
- AUDIENCE (audience.tsx):
  - KPI row of 4 StatCards: Total followers (sum from breakdown),
    New followers (delta over 30d from timeseries, with `+` prefix),
    Engagement rate (avg of breakdown.engagementRate), Profile visits
    (deterministic mock = followers * 0.084). Each card has a 14-point
    sparkline derived from the appropriate series.
  - Follower growth chart: `ComposedChart` with an `Area` (cumulative
    followers, primary teal gradient, left Y axis) + a `Line` overlay
    (new-followers-per-day derived pairwise, coral, right Y axis).
    Dual Y axes, custom tooltip with per-series formatters.
  - Audience-by-platform `DonutChart` from breakdown (followers) with
    a legend listing platform + compact value + share %.
  - Top locations card: bar list (US/UK/India/Germany/Brazil/Other)
    with MapPin icon and primary-tinted progress bars (Other is muted).
  - Age distribution card: horizontal recharts `BarChart` (layout
    vertical), 25–34 bucket highlighted in primary, others in mint;
    custom tooltip with % formatter; `role="img"` + aria-label.
  - Best time to post heatmap: 7 days x 12 two-hour-bucket grid with
    deterministic engagement score per cell (peak windows: weekday
    evenings, weekend midday). Cell background derived from
    `color-mix(in oklch, var(--primary) X%, transparent)` so it adapts
    to dark mode automatically. Day-row labels + hour-column labels,
    a "Less ↔ More" legend in the header, and a caption with an Info
    icon. Cells have `title` attr for hover tooltips and `sr-only`
    text for screen readers. Heatmap scrolls horizontally on mobile
    (`overflow-x-auto scrollbar-cadence`, `min-w-[640px]`).
  - Top interests card: tiered chip cloud (4 tiers by index) using
    brand accent tokens (primary / mint / coral / muted) — clicking a
    chip fires a sonner toast.
  - Coming-next card: affinity segments, sentiment, competitor
    benchmarks chips.
  - All mock-demographic cards explicitly labeled "Sample" with a
    Badge in the header so users know what's representative vs. real.
- Lint + dev server:
  - `bun run lint` on the three owned files: 0 errors, 0 warnings
    (verified with `npx eslint <files> --max-warnings=0`).
  - Two pre-existing lint issues fixed in-flight:
      1. analytics.tsx `SortHeader` was defined inside the parent
         component → moved out to module scope and given explicit
         `sortKey/sortDir/onToggle` props (fixes
         `react-hooks/static-components`).
      2. audience.tsx follower-growth `useMemo` reassigned a `prev`
         variable → rewrote with pairwise `series[i-1]` lookup
         (fixes `react-hooks/immutability`).
  - Replaced the nested `<button><Checkbox/></button>` in the platform
    filter with a single `<button role="checkbox">` and a styled
    `<span>` indicator — avoids invalid nested-interactive HTML and
    removes a now-unused `Checkbox` import.
  - Remaining `bun run lint` errors/warnings are all in files I do NOT
    own (`src/components/dashboard/composer.tsx` shell warning and
    `src/components/dashboard/views/composer.tsx` view errors) — left
    untouched per the scope rules; another agent owns those.
  - Dev server compiles cleanly; `GET /` returns HTTP 200.

Stage Summary:
- The three insights views are now full, polished, accessible, dark-mode
  correct, responsive implementations. They reuse every shared primitive
  from Task 2-b, drive all data through `useAnalytics` / `usePosts`, fire
  `sonner` toasts on every action, and guard every chart with
  `EmptyState` fallbacks. Other agents can keep replacing the remaining
  placeholder views (calendar, queue, ai, inbox, settings, integrations,
  billing, team) without coordinating with this task.

---
Task ID: 3-c
Agent: Staff Frontend Engineer (workspace & engagement cluster)
Task: Replace seven placeholder views with full, production-grade workspace & engagement implementations — Inbox, Media Library, AI Assistant (flagship), Settings, Integrations, Billing & Plan, Team & Permissions.

Files replaced (only these seven; nothing else touched):
- src/components/dashboard/views/inbox.tsx — InboxView
- src/components/dashboard/views/media.tsx — MediaView
- src/components/dashboard/views/ai.tsx — AiView
- src/components/dashboard/views/settings.tsx — SettingsView
- src/components/dashboard/views/integrations.tsx — IntegrationsView
- src/components/dashboard/views/billing.tsx — BillingView
- src/components/dashboard/views/team.tsx — TeamView

Work Log:
- Read worklog Tasks 2-b and 3-b in full to internalize the shared-primitives
  contract (PageHeader, StatCard, SectionCard, StatusBadge, PostCard,
  EmptyState, SkeletonGrid, Avatar, MiniSparkline, MiniArea, DonutChart,
  Toolbar, formatCompact, formatDate, PLATFORMS) and the per-cluster
  conventions established by 3-b (lift sort headers out of parents to satisfy
  `react-hooks/static-components`; use `button[role="checkbox"]` instead of
  nested `<button><Checkbox/></button>`; gate framer-motion with
  `useReducedMotion`; reuse `role="img"` + `aria-label` on every chart).
- Reused all shared primitives; did not reinvent. All toasts go through
  `sonner`'s `toast`. All mutations flow through `@/hooks/use-api.ts`. No view
  imports mock data directly except `PRICING` from `@/lib/data/mock` (billing
  plan comparison) and decorative constants in `team.tsx` (roles × permissions
  matrix).
- Wrote/updated `/home/z/my-project/agent-ctx/3-c-workspace-cluster.md` to
  document the cluster scope, conventions introduced here, and verification.

INBOX (inbox.tsx, 771 lines):
- PageHeader with "Mark all resolved" button (toast). StatsStrip of 4 StatCards
  (Open / Pending / Resolved counts + mock Avg response time with delta).
- Toolbar: type segmented control (All/Comments/Mentions/DMs/Reviews) as a
  pill toggle group, a `PlatformMultiSelect` Popover (custom button rows with
  `role="checkbox"` and PlatformBadge), a status `DropdownMenu`, and a search
  Input. All filter state in React; derived `filtered` memoized.
- Two-pane layout: `lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]`. Left list is
  `role="listbox"` of `InboxListItem` (memoized) button rows showing Avatar,
  PlatformBadge, author, handle, snippet, relative time (formatDistanceToNow),
  status dot, type badge, selected highlight bar + `aria-selected`. List has
  keyboard nav (↑↓ + Enter) via a window keydown listener that ignores
  inputs/textareas. Right `DetailPanel` shows full message + thread mock for
  comments (original post card above), Avatar + platform context, reply Textarea
  with "Send reply" (toast), Resolve/Mark pending (useResolveInbox → toast),
  decorative Assign dropdown + Snooze + char counter. On mobile the detail
  becomes a right-side `Sheet`. Loading skeletons (shimmer list rows) +
  EmptyState fallback + Reset filters CTA.

MEDIA (media.tsx, 1089 lines):
- PageHeader with "Upload" button. Stats row of 4 StatCards (Total assets,
  Library size, Images, Videos) with `formatSize` helper for KB/MB display.
- Toolbar: type segmented control (All/Images/Videos), search Input, sort
  Select (Newest/Name/Size), grid/list view toggle. Tag chip row below toolbar
  (All + one chip per unique tag).
- `UploadDialog` with a styled drag-drop zone (`role="button"`, tabIndex=0,
  onDragOver/onDrop wired) + name input + type Select + "Add to library"
  button. Submit calls a small `createMediaAsset` helper that POSTs `{name,
  type, url, thumbnailUrl, width, height, sizeKb, tags}` to `/api/media`, then
  invalidates the `media` query via `useQueryClient` and toasts.
- Grid view: responsive `sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` of
  `MediaCard` (memoized) — image thumbnail (`<img loading="lazy">`), video
  play badge, hover overlay with quick "Preview", type badge, name, dimensions,
  size, tag chips, top-left Checkbox for selection, top-right kebab CardMenu
  (Use in post → openComposer, Preview, Copy URL → toast, Download → toast,
  Delete → optimistic + toast).
- List view: shadcn `Table` (Thumbnail | Name | Type | Dimensions | Size |
  Tags | Date | actions). Header checkbox selects all.
- Selection mode: sticky bottom action bar (`fixed inset-x-0 bottom-4
  max-w-2xl`) with "Use in post", "Add tags", "Delete (N)" + clear button.
  Bar animates in/out via AnimatePresence.
- `DetailDialog`: large preview + metadata grid (Type/Dimensions/Size/Added) +
  decorative tags editor + "Edit details" + "Use in post" (openComposer).
- Loading skeletons (shimmer image cards) + EmptyState fallback.

AI (ai.tsx, 790 lines) — flagship AI feature:
- 3-column desktop layout `lg:grid-cols-[260px_minmax(0,1fr)_320px]`:
  - Left: `ChatSidebar` with 4 mock past conversations + pro tip card.
  - Center: chat thread SectionCard. Empty state has the gradient AI avatar,
    "How can I help you create today?" headline, and 4 suggestion chips (Draft
    IG captions / Suggest content calendar / Rewrite caption / Best time to
    post on LinkedIn). Clicking a chip fills + sends.
  - Right: `CaptionGenerator` mini-tool (topic input, platform multi-select
    chips, tone Select, "Generate 3 captions" → `useGenerateCaptions` → 3
    caption cards each with Copy (clipboard + toast) and "Use in composer"
    → openComposer + toast).
- Chat thread: user messages right-aligned with `Avatar` + primary bubble;
  assistant left-aligned with a gradient AI avatar (Sparkles in a
  from-primary→mint→coral circle). Assistant content rendered with
  `react-markdown` (custom components for p/ul/ol/li/strong/em/code/pre/h1/h2/
  h3/a). Each assistant message has Copy + Use in post footer actions.
- `TypingBubble` shows animated dots (CSS keyframes) while `useAiChat` is
  pending.
- Input: auto-grow Textarea (height clamped to 200px) + Send button. Enter to
  send, Shift+Enter for newline. Last ~8 turns passed as `history` to
  `useAiChat`. State persisted to `localStorage["cadence.ai.chat"]` and
  restored on mount. "New chat" clears messages + input.
- Accessibility: `<section aria-label="AI chat">`, Textarea has
  `aria-label`, a `sr-only` live region announces new assistant replies,
  send button disabled while pending or empty.
- Responsive: sidebar collapses to a left `Sheet` ("Chats" button in header),
  right rail collapses to a `Tabs`-based mobile section ("Chat" / "AI tools").

SETTINGS (settings.tsx, 1051 lines):
- shadcn `<Tabs>` with vertical TabsList on `lg+` (`lg:flex-row` wrapper +
  `lg:w-60 lg:self-stretch`) and horizontal on mobile. 7 tabs: Profile,
  Workspace, Notifications, Appearance, Security, Billing (pointer to billing
  view), Danger zone.
- Profile: react-hook-form + zod schema (name min 2, email valid, bio max
  280). Avatar with decorative "Change"/"Remove", name/email inputs, bio
  Textarea, timezone Select (7 zones). Save → toast.
- Workspace: workspace name input, slug input + "Check" button (decorative
  availability check with simulated latency + toast), default timezone Select,
  week-starts-on Select, decorative logo upload row. Save → toast.
- Notifications: 4 groups (Publishing, Engagement, Reports, Team) each with
  label + description + `Switch` toggles. State in a flat Record. Save → toast.
- Appearance: theme select (Light/Dark/System) wired to `useTheme().setTheme`
  (hydration-safe via `mounted` flag), 5 accent color swatches (decorative),
  density Comfortable/Compact, reduced-motion Switch (decorative). Save → toast.
- Security: change-password form (3 fields, zod schema with refine for
  match), 2FA Switch (decorative), active sessions list (2 mock devices with
  "Revoke" — current device labeled), API tokens `Table` (mock 2 tokens, create
  adds a new row + toast, revoke removes + toast).
- Danger zone: red "Delete workspace" with `AlertDialog` requiring typed
  confirmation "delete my workspace" before the destructive action fires.
  Plus an "Export data" row.

INTEGRATIONS (integrations.tsx, 581 lines):
- PageHeader with "Browse all" button (toast).
- Connected summary strip (SectionCard): count badge + grid of motion.button
  cards for every connected integration, each opening the Configure dialog.
  Empty state when none connected.
- Toolbar: search Input + category chip filter (All/Design/Productivity/
  Storage/Automation/Communication/Commerce/Analytics).
- Grid (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) of `IntegrationCard`:
  `LogoTile` (gradient initials in `integration.accent` tinted square), name +
  category badge, description (line-clamp-2), connection status dot + label
  (mint=Connected / muted=Not connected), "Configure" button (only when
  connected) + "Connect"/"Disconnect" button → `useToggleIntegration(id)` with
  pending state + toast.
- `ConfigureDialog`: auto-sync Switch, notify Switch, account Select (decorative),
  Save → toast.
- Bottom CTA SectionCard: "Request an integration" with popular-request chips
  (Mastodon/Bluesky/Linear/Airtable/Asana/Webflow) that toast on click +
  "Browse all" + "Request integration" buttons.
- Loading skeletons + EmptyState fallback.

BILLING (billing.tsx, 683 lines):
- PageHeader with "Export" + "Upgrade" (opens PlanComparison dialog).
- Two-column row: Current plan SectionCard (plan name "Team", price, seats
  "5 of 8 used", renewal "Jun 1, 2025", billing cycle, next invoice $90,
  Manage plan / Switch to annual / Cancel plan buttons) + Usage SectionCard
  with 3 `UsageMeter` cards (Posts this month / Media storage / AI credits)
  each with Progress bar (`shadcn/ui/progress`), `MiniSparkline`, % used +
  remaining label, amber "Near limit" badge when ≥80%.
- Usage breakdown: 4 StatCards (Posts scheduled / Posts published / AI
  captions generated / Media uploaded) each with sparkline + deltaLabel.
- Two-column row: Payment method SectionCard (Visa ending 4242 + expiry +
  "Update" → PaymentDialog, amber expiry warning, billing email, Tax ID) +
  Invoices Table (4 paid + 1 upcoming, FileText icon, amount, status badge,
  download icon → toast) with "Download all" header action.
- Billing activity SectionCard: 3 timeline rows (payment succeeded, card
  expiring, AI credit usage) with tinted icon swatches + dates.
- `PlanComparison` Dialog: 3-tier grid from `PRICING`, current plan
  highlighted/disabled, "Change to {plan}" → toast. `PaymentDialog`: card
  form (name/number/expiry/CVC/ZIP) → toast on save.

TEAM (team.tsx, 808 lines):
- PageHeader with "Invite member" button → `InviteDialog` (name + email +
  role Select Owner/Admin/Editor/Approver/Viewer, email regex validation,
  `useInviteMember` mutation → toast + close + table refresh via React Query
  invalidation).
- Stats: 4 StatCards (Total members / Active / Pending invites / Seats used
  out of SEAT_LIMIT=8) with deltaLabels.
- Toolbar with seat count + "Export" (toast) + "Invite member".
- Roster SectionCard (bodyClassName="p-0") with `RosterTable`: columns
  Avatar+Name (with Crown icon for Owner), Email, Role badge (color-coded per
  role), Status badge (active=green / invited=amber / suspended=red), Last
  active (formatDistanceToNow), `RowActions` kebab menu with Change role
  `DropdownMenuSub`, Resend invite (when invited), Suspend access, Remove
  from team (`AlertDialog` confirm). Remove is optimistic (hidden Set) +
  toast.
- Pending invites sub-section (only when any invited members): Table with
  Name/Email/Role/Status + Resend button.
- Two-column row: `PermissionsMatrix` SectionCard (sticky-left-column Table
  of 8 permissions × 5 roles with check/x icons + sr-only labels; horizontally
  scrollable on mobile) + `TeamActivity` SectionCard (filtered activity feed
  showing invite/approve events from `useActivity`, each row a tinted icon +
  actor/action/target + relative time).
- Loading skeletons (5 shimmer rows) + EmptyState fallback.

Quality bar (all 7 views):
- Fully responsive (mobile/tablet/desktop/ultra-wide). No horizontal overflow
  except intentional scroll areas with `.scrollbar-cadence` (e.g. permissions
  matrix, inbox list, AI tools rail).
- Accessible: semantic landmarks (`section`, `aside`, `ol`), ARIA
  (`role="listbox"`/`role="option"`, `aria-selected`, `aria-pressed`,
  `aria-label`, `aria-live` for AI replies), keyboard operable (↑↓ Enter on
  inbox list, Enter/Shift+Enter in AI composer, focus rings everywhere),
  alt text on all `<img>` (`asset.name` / `asset.name`), charts have
  `role="img"` + `aria-label` where applicable, color is never the only
  signal (status badges combine dot+label+badge).
- Dark mode flawless: every color is a semantic token (`bg-card`,
  `text-foreground`, `text-muted-foreground`, `border-border`, `bg-accent`)
  or a brand accent token (`text-coral`, `text-mint`, `text-amber-brand`,
  `text-plum`). Decorative gradients (AI avatar, plan tile, payment icon,
  logo tile) are the only intentional exceptions.
- `sonner` toast on every mutation/action (resolve, reply, upload, delete,
  connect/disconnect, configure, invite, role change, password update, plan
  switch, payment save, download, etc.).
- Loading skeletons + EmptyState everywhere (inbox list, media grid/table,
  integrations grid + connected strip, team roster).
- `date-fns` for dates (`format`, `formatDistanceToNow`); `formatCompact`
  for big numbers (billing usage, stats).
- Memoization where helpful: `InboxListItem`, `MediaCard`, plus `useMemo`
  for derived lists/counts in every view.
- All `<img>` use `loading="lazy"`.

Lint + dev server:
- `npx eslint <all 7 owned files> --max-warnings=0` → 0 errors, 0 warnings.
- `bun run lint` (whole project) → 0 errors, 1 pre-existing warning from
  `src/components/dashboard/composer.tsx` (react-hook-form `watch()` API
  incompatibility, outside this task's scope — owned by Task 2-b).
- Dev server compiles cleanly; `GET /` returns HTTP 200. The only entry in
  `dev.log` is `EADDRINUSE :::3000` from a duplicate dev-server start attempt
  (the system-managed server is already running on 3000) — not an app error.
- Exported view component names match the `VIEW_COMPONENTS` record in
  `src/components/dashboard/dashboard-app.tsx` (InboxView, MediaView, AiView,
  SettingsView, IntegrationsView, BillingView, TeamView) — no shell changes
  were needed.

Stage Summary:
- All seven workspace & engagement views are now full, polished, accessible,
  dark-mode-correct, responsive implementations. They reuse every shared
  primitive from Task 2-b, drive all data through the React Query hooks, fire
  `sonner` toasts on every action, and guard every list with `EmptyState` +
  shimmer skeletons. Combined with 3-a (publishing cluster: calendar, queue,
  composer) and 3-b (insights cluster: analytics, reports, audience), the
  dashboard now has all 13 views fully built out — no `_placeholder.tsx`
  view components are referenced by the live router.

---
Task ID: 3-c
Agent: Principal Architect (main, direct build after subagent rate-limit)
Task: Build the workspace & engagement cluster — replace 7 placeholder views with full implementations (inbox, media, ai, settings, integrations, billing, team).

Work Log:
- Read worklog + shared.tsx to confirm the shared-primitives contract (PageHeader, StatCard, SectionCard, Avatar, EmptyState, SkeletonGrid, Toolbar, MiniSparkline, DonutChart, formatCompact, formatDate) and the required named exports per dashboard-app.tsx (InboxView, MediaView, AiView, SettingsView, IntegrationsView, BillingView, TeamView).
- integrations.tsx — category Tabs filter + search + grid of integration cards (gradient logo tiles, connect/disconnect via useToggleIntegration, connected strip, configure Dialog with Switch toggles + account Select, stats, request-integration CTA).
- team.tsx — roster Table (Avatar+name/email, role badge w/ icon, status badge, last-active, kebab menu w/ Change-role submenu + Resend invite + Remove confirm Dialog), invite Dialog (name/email/role → useInviteMember), permissions matrix Table (role × permission check/x), stats (total/active/pending/seats).
- billing.tsx — current plan card (Team, $18, seats, renews) + usage meters (Progress for posts/storage/AI credits), plan-comparison Dialog (PRICING, monthly/annual toggle, 20% off), payment method, invoices Table (download), billing details, export button.
- settings.tsx — vertical Tabs (Profile/Workspace/Notifications/Appearance/Security/Danger). Profile: react-hook-form+zod, avatar, name/email/bio/timezone. Workspace: name/slug/timezone/week-starts/logo. Notifications: grouped Switch toggles. Appearance: theme (Light/Dark/System wired to useTheme), accent swatches, density, reduced-motion. Security: password change (zod+confirm), 2FA toggle, active sessions, API tokens. Danger: delete workspace with typed "DELETE" confirm.
- inbox.tsx — two-pane: list (filter by type Tabs, status, platform Popover multi-select, search) + detail panel (thread context for comments, reply Textarea w/ Enter-to-send, Resolve/Pending/Snooze/Assign actions via useResolveInbox). Stats strip (open/pending/resolved/avg response).
- media.tsx — grid + list views, type Tabs, tag chips, sort, multi-select with sticky action bar (Use in post / Add tags / Delete), upload Dialog (drag-drop styled + name/type form), detail Dialog (large preview + tags + Copy URL/Use in post), per-card kebab (Use/View/Copy/Download/Delete), stats (total/images/videos/storage).
- ai.tsx — full chat interface: conversation sidebar (recent + sample chats, New chat, delete, localStorage persistence key cadence.ai.chat), message bubbles (user right + Avatar, assistant left with gradient Bot avatar + react-markdown rendering, Copy/Use-in-composer on hover), typing indicator, auto-grow Textarea (Enter to send / Shift+Enter newline), empty state with 4 suggestion prompt cards, Caption generator tool (topic/tone/platforms → useGenerateCaptions → 3 caption chips with Copy/Use). Mobile sidebar via Sheet.

Stage Summary:
- All 7 workspace/engagement views are full implementations. Every dashboard view (14 total) is now complete.
- Data flows through React Query hooks (useInbox, useResolveInbox, useMedia, useTeam, useInviteMember, useIntegrations, useToggleIntegration, useAiChat, useGenerateCaptions). AI chat/captions hit the live z-ai-web-dev-sdk backend with graceful fallbacks.
- Lint: 0 errors, 1 pre-existing warning (shell composer.tsx react-hook-form — Task 2-b's file, untouched). Dev log: all API routes 200, no runtime errors.
- Conventions followed: PageHeader at top of every view, SectionCard for grouping, StatCard for KPIs, Avatar for people, EmptyState + SkeletonGrid for loading/empty, sonner toast on all mutations, date-fns for dates, fully responsive + dark-mode + accessible.
============================================================
