# Cadence — Phase 9 Implementation Plan

**Document ID:** P9-doc
**Author:** Principal Software Architect
**Audience:** Senior engineering team (frontend, backend, platform, QA, SRE)
**Status:** Living document — reflects the **as-built** state of Cadence through Phase 8 plus the Phase 9 forward plan.
**Last reviewed:** Current sprint.

> Cadence is an original social-media orchestration SaaS — inspired by the public
> behavior of buffer.com but 100% original implementation. This document is the
> single source of truth for what has been built, what remains, and how we ship
> and operate it.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Epics → Features → Tasks → Subtasks](#2-epics--features--tasks--subtasks)
3. [Developer Checklist](#3-developer-checklist)
4. [Testing Checklist](#4-testing-checklist)
5. [QA Checklist](#5-qa-checklist)
6. [Deployment Checklist](#6-deployment-checklist)
7. [Architecture Reference](#7-architecture-reference)
8. [Roadmap (Post-MVP)](#8-roadmap-post-mvp)
9. [Appendix A — File Inventory](#appendix-a--file-inventory)
10. [Appendix B — Glossary](#appendix-b--glossary)

---

## 1. Executive Summary

### 1.1 What Cadence is

Cadence is a **single-product, multi-view social-media orchestration platform**
for marketing teams. It lets a team plan content, schedule posts across eight
social channels, manage an engagement inbox, analyze performance, run an
AI copywriting assistant, manage team permissions, connect productivity
integrations, and manage billing — all inside one calm, fast, fully responsive
workspace.

The product is shipped as a **single user-facing route** (`/`) that switches
between a public **marketing site** and the **dashboard application** via a
Zustand store with hash-based deep-linking (`#app/<view>`). All fourteen
dashboard views (overview, calendar, composer, queue, analytics, reports,
audience, media, ai, inbox, settings, integrations, billing, team) are fully
implemented and rendered by a static `VIEW_COMPONENTS` record keyed by
`AppView`.

### 1.2 Tech stack (as built)

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16.1.1** (App Router, React Server Components, `output: "standalone"`) |
| Language | **TypeScript 5** (strict, `ignoreBuildErrors: false` is the goal — see §3) |
| UI primitives | **shadcn/ui** (Radix-based, 40+ components in `src/components/ui/*`) |
| Styling | **Tailwind CSS v4** (CSS-first config), `tw-animate-css`, `tailwind-merge`, `class-variance-authority` |
| Charts | **Recharts 2.15** (Area, Line, Bar, Composed, Pie/Donut, custom tooltips) |
| Animation | **Framer Motion 12** (always gated with `useReducedMotion()`) |
| Forms | **react-hook-form 7** + **zod 4** + `@hookform/resolvers` |
| Icons | **lucide-react 0.525** |
| Markdown | **react-markdown 10** (used in the AI assistant) |
| Dates | **date-fns 4** |
| Client state | **Zustand 5** (`src/lib/store.ts`, `src/lib/ui-store.ts`) |
| Server state | **TanStack React Query 5** (`src/hooks/use-api.ts`) |
| Database / ORM | **Prisma 6.11** with **SQLite** (`prisma/schema.prisma`, `db/custom.db`); **Postgres is the production target** (see §6 & §8) |
| AI | **z-ai-web-dev-sdk 0.0.18**, wrapped in `src/lib/ai.ts` (server-only). Two live endpoints: `/api/ai/chat`, `/api/ai/captions` |
| Auth | **next-auth 4.24** is installed; session bootstrap is a Phase 9+ task |
| Notifications | **sonner 2.0** (single toast system — no second toast system permitted) |
| Theming | **next-themes 0.4** (Light/Dark/System, hydration-safe via `mounted` flag) |
| Runtime | **Bun** (scripts in `package.json`); Node 20+ also compatible |
| Linting | ESLint 9 + `eslint-config-next` |
| Build output | Standalone (`next.config.ts` → `output: "standalone"`); `build` script copies `.next/static` and `public/` into the standalone server bundle |

### 1.3 Current build state

**Done:**
- Design system, design tokens, custom utilities, keyframes, reduced-motion
  variants — `src/app/globals.css`.
- All 14 dashboard views fully implemented (no `_placeholder.tsx` view
  components are referenced by the live router).
- Marketing site: header + 11 sections + footer (hero, logos, features,
  how-it-works, channels, analytics showcase, AI section, testimonials,
  pricing with monthly/annual toggle, FAQ, CTA).
- Dashboard shell: sidebar, topbar, command palette (⌘K), composer Sheet,
  page transitions, skip-link, ⌘B sidebar toggle.
- Full-page Composer (`src/components/dashboard/views/composer.tsx`, ~1,543
  lines): three-region grid, AI caption generation, live preview per platform,
  media picker, scheduling presets, react-hook-form + zod validation.
- Calendar (Month / Week / List), Queue (status Tabs + queue-health rail),
  Analytics (KPI cards + metric toggle AreaChart + donut + sortable table +
  top-posts list), Reports (templates + scheduled + recent + preview dialog),
  Audience (follower growth ComposedChart + donut + locations + age +
  best-time-to-post heatmap + interests).
- Inbox (two-pane listbox + detail, keyboard nav), Media Library (grid +
  list, multi-select action bar, upload dialog, detail dialog), AI Assistant
  (3-column chat + caption generator, localStorage persistence, typing
  indicator, react-markdown rendering).
- Settings (vertical Tabs: Profile / Workspace / Notifications / Appearance /
  Security / Danger zone), Integrations (category filter, connect/disconnect,
  configure dialog), Billing (current plan + usage meters + invoices + plan
  comparison dialog + payment dialog), Team (roster table + invite dialog +
  permissions matrix + activity feed).
- 11 API routes under `src/app/api/*` (posts, posts/[id], analytics, media,
  accounts, inbox, team, integrations, activity, campaigns, ai/chat,
  ai/captions), all backed by an in-memory CRUD singleton
  (`src/lib/data/store.ts`) seeded from `src/lib/data/mock.ts`.
- React Query hooks (`usePosts`, `useCreatePost`, `useUpdatePost`,
  `useDeletePost`, `useAnalytics`, `useMedia`, `useAccounts`, `useInbox`,
  `useResolveInbox`, `useTeam`, `useInviteMember`, `useIntegrations`,
  `useToggleIntegration`, `useActivity`, `useCampaigns`, `useAiChat`,
  `useGenerateCaptions`) — all 17 hooks live in `src/hooks/use-api.ts`.
- Prisma schema pushed and verified (15 models — see §7.4). SQLite DB at
  `db/custom.db`.
- AI integration is live: `cadenceChat` (multi-turn, system prompt, 8-turn
  window) and `generateCaptions` (3 options, ≤220 chars, 2–4 hashtags).
  Both have graceful fallbacks.
- SEO metadata in `src/app/layout.tsx` (title template, OG, Twitter card,
  robots). `public/robots.txt` and `public/logo.svg` present.
- Lint-clean (0 errors; one pre-existing `react-hooks/incompatible-library`
  warning in the Sheet composer from `react-hook-form`'s `watch()` API —
  known and tracked, not a regression).

**Not yet done (Phase 9 priorities):**
- Real authentication (next-auth is installed but not bootstrapped).
- Real OAuth connections to social platforms.
- Real publishing webhooks / background queue worker.
- Postgres migration for production.
- Tests (unit / integration / E2E) — none exist yet.
- Observability (Sentry, analytics, structured logs).
- Rate limiting, security headers, CSRF on mutations.
- Public API + webhooks, SSO/SAML.

### 1.4 How to run it

```bash
# 0. Prerequisites
#    - Node 20+ or Bun 1.3+
#    - No external services required for local dev (SQLite + in-memory store)

# 1. Install deps
bun install            # or: npm install / pnpm install

# 2. Configure env (see .env.example in §6.1)
cp .env.example .env   # then edit secrets (NextAuth secret, AI keys, DATABASE_URL)

# 3. Push the Prisma schema to SQLite
bun run db:push

# 4. Start the dev server (port 3000)
bun run dev            # next dev -p 3000 | tee dev.log

# 5. Open the app
open http://localhost:3000
#   - Marketing site loads at `/`
#   - Click "Start free" → switches to dashboard (hash becomes #app/overview)
#   - Try ⌘K to open the command palette, ⌘B to collapse the sidebar
#   - Open the composer with "Create post" (topbar) or the "c" shortcut

# 6. Production build (standalone)
bun run build          # next build + copies static + public into standalone bundle
bun run start          # NODE_ENV=production bun .next/standalone/server.js

# 7. Lint
bun run lint
```

**Useful env vars (minimum viable local dev):**

```bash
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="dev-secret-change-me"     # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
# z-ai-web-dev-sdk reads its own credentials from the environment; no extra
# env var is required for local sandbox use. For production, set the
# appropriate API key/credentials per the SDK docs.
```

### 1.5 Phase 9 mission

Phase 9 turns the **fully-built product** into a **shippable product**:

1. Harden auth, security, and the data layer (Postgres).
2. Add the test pyramid (unit → integration → E2E → a11y → visual).
3. Wire observability, rate limiting, and security headers.
4. Document the deployment runbook and rollback plan.
5. Set the post-MVP roadmap (real OAuth, queue worker, email, multi-workspace,
   audit logs, public API, SSO/SAML, mobile app).

---

## 2. Epics → Features → Tasks → Subtasks

Status legend: **[D] Done** · **[IP] In Progress** · **[P] Planned (Phase 9+)**

### Epic 1 — Design System & Foundation

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **1.1 Design tokens** | 1.1.1 OKLCH color tokens (light + dark) in `src/app/globals.css` | [D] | Define `--primary` (deep teal), `--coral`, `--amber-brand`, `--mint`, `--plum`; map semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `bg-accent`); add `@media (prefers-color-scheme: dark)` overrides; verify WCAG AA contrast for text-on-background pairs. |
| | 1.1.2 Custom utilities | [D] | `.scrollbar-cadence`, `.text-gradient-brand`, `.bg-grid`, `.bg-dots`, `.glass`, `.shimmer`, `.mask-fade-x`, `.mask-fade-b`; expose them via `@layer utilities`. |
| | 1.1.3 Keyframes & motion | [D] | `animate-fade-up`, `animate-float`, `animate-marquee`, `animate-pulse-ring`; gate every motion primitive with `@media (prefers-reduced-motion: reduce)`. |
| | 1.1.4 Brand glyph set | [D] | Original SVGs for 8 platforms in `src/components/brand/platform-icon.tsx`; `Logo` + `LogoMark` in `src/components/brand/logo.tsx`. |
| **1.2 Foundation lib** | 1.2.1 Zustand view router (`src/lib/store.ts`) | [D] | `AppView` union (14 views), `Route` union (`marketing \| app`), `goMarketing/goApp/setView`, `openComposer/closeComposer`, `toggleSidebar`, `setMobileNav`, `setCommandOpen`. |
| | 1.2.2 Hash deep-linking | [D] | `syncHashFromState()` writes `#app/<view>`; `readStateFromHash()` parses + validates against the AppView whitelist; `hashchange` listener in `src/app/page.tsx`. |
| | 1.2.3 Brand constants (`src/lib/brand.ts`) | [D] | `BRAND`, `PLATFORMS`, `PLATFORM_LIST`, `MARKETING_NAV`, `FOOTER_COLUMNS`. |
| | 1.2.4 Domain types (`src/lib/types.ts`) | [D] | `Post`, `PostMetrics`, `MediaAsset`, `SocialAccount`, `InboxItem`, `TeamMember`, `Integration`, `ActivityEvent`, `Campaign`, `Analytics`, `Pricing`. |
| | 1.2.5 UI store (`src/lib/ui-store.ts`) | [D] | Local UI-only flags (e.g. mobile breakpoint hints) that don't belong in the router store. |
| **1.3 Providers** | 1.3.1 `src/components/providers.tsx` | [D] | Wrap app in `next-themes`, `QueryClientProvider`, `sonner` `<Toaster/>`, Radix `<TooltipProvider/>`. |
| | 1.3.2 Root layout (`src/app/layout.tsx`) | [D] | Geist + Geist Mono fonts, full `Metadata` (title template, OG, Twitter, robots), `<html lang="en" suppressHydrationWarning>`. |
| **1.4 Tailwind v4 setup** | 1.4.1 CSS-first config | [D] | `@tailwindcss/postcss`; semantic color tokens mapped to CSS vars; no `tailwind.config.ts` theme overrides needed for color. |
| | 1.4.2 Lint rule: no raw indigo/blue as brand color | [D] | Documented convention; enforced via review. |

### Epic 2 — Marketing Site

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **2.1 Site shell** | 2.1.1 `src/components/marketing/marketing-site.tsx` | [D] | Root `min-h-screen flex flex-col`; skip-link; `<main id="main" flex-1>`; `SiteHeader` + 11 sections + `SiteFooter` (`mt-auto`); section ids are the nav contract (`#top`, `#features`, `#channels`, `#customers`, `#resources`, `#pricing`, `#cta`). |
| | 2.1.2 `src/components/marketing/site-header.tsx` | [D] | Sticky, glass-on-scroll (8px threshold); desktop nav from `MARKETING_NAV`; hydration-safe theme toggle (`mounted` flag + `resolvedTheme`); "Sign in" ghost + "Start free" primary → `goApp('overview')`; mobile hamburger → `Sheet`. |
| | 2.1.3 `src/components/marketing/site-footer.tsx` | [D] | Brand + tagline + newsletter form (sonner toast) + social icons; 4 link columns from `FOOTER_COLUMNS`; bottom row with copyright, legal links, region/language `<select>`, "Made with ❤ by the Cadence team". |
| **2.2 Sections** | 2.2.1 `sections/hero.tsx` | [D] | Gradient headline, `BRAND.tagline`, Start free + Watch demo (Dialog), CSS product mock (tilted glass card with heat-map calendar + queue cards + floating stat chips via `.animate-float` + 3 PlatformBadges), `.bg-grid` + blurred brand blobs, framer-motion staggered fade-up gated by `useReducedMotion`. |
| | 2.2.2 `sections/logos.tsx` | [D] | "Trusted by 75,000+ teams" + seamless marquee of 8 fictional wordmarks (Lumio, Northbeam, Fjord Studio, Verde, Loop Coffee, Cadence Labs, Halcyon, Pinegrove). |
| | 2.2.3 `sections/features.tsx` | [D] | 6 feature cards (Composer, Content Calendar, Approval Workflows, Analytics, Engagement Inbox, AI Assistant); tinted icon tiles; hover lift + border highlight. |
| | 2.2.4 `sections/how-it-works.tsx` | [D] | 3 steps (Plan → Publish → Measure); gradient icon tiles; desktop connector lines. |
| | 2.2.5 `sections/channels.tsx` | [D] | 8 platform tiles from `PLATFORM_LIST` + `PlatformIcon`; decorative "Connect" affordance. |
| | 2.2.6 `sections/analytics-showcase.tsx` | [D] | Split: copy + bullets + CTA on the left; recharts AreaChart (impressions + engagement, 12-week series) in a glass card on the right; 2 floating KPI chips; custom tooltip. |
| | 2.2.7 `sections/ai-section.tsx` | [D] | Mock chat exchange (user bubble + 3 AI caption suggestions with platform badges + hashtags) on the left; copy + CTA on the right; brand gradient blobs. |
| | 2.2.8 `sections/testimonials.tsx` | [D] | `TESTIMONIALS` grid; gradient avatar initials; overall rating row (5 stars + "4.9/5 from 2,400+ reviews"). |
| | 2.2.9 `sections/pricing.tsx` | [D] | `PRICING` (3 tiers); highlighted middle; Monthly/Annual toggle with framer-motion `layoutId` pill; annual = 20% off (client math); price animates on toggle via `AnimatePresence`; CTA → `goApp`. |
| | 2.2.10 `sections/faq.tsx` | [D] | `FAQS` array in a shadcn `Accordion`. |
| | 2.2.11 `sections/cta.tsx` | [D] | Full-width brand-gradient band; headline; email input + Start free (sonner toast + email validation `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); "Talk to sales" link. |

### Epic 3 — Dashboard Shell & Navigation

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **3.1 Shell** | 3.1.1 `src/components/dashboard/dashboard-app.tsx` | [D] | Flex `min-h-screen` container holding Sidebar, main column (Topbar + scrollable `<main>`), global Composer Sheet, Command Palette. Renders the active view from the store via static `VIEW_COMPONENTS` record (no edit needed when later agents replace a placeholder file). Includes skip-link, ⌘K / "c" keyboard shortcuts, framer-motion `AnimatePresence` page transition keyed by `view`. |
| | 3.1.2 View router | [D] | `VIEW_COMPONENTS: Record<AppView, () => JSX.Element>` keyed by all 14 AppViews; lazy-load not required (already client-split). |
| **3.2 Sidebar** | 3.2.1 `src/components/dashboard/sidebar.tsx` | [D] | Custom aside (not shadcn `<Sidebar>`). Four nav groups (Plan / Engage / Insights / Workspace); active-state highlight with left accent bar; icon-only rail mode with tooltips when collapsed; desktop ⌘B toggle; connected-channels strip (via `useAccounts`); workspace switcher dropdown; current-user dropdown (theme toggle, "Back to site", "Sign out"). |
| **3.3 Topbar** | 3.3.1 `src/components/dashboard/topbar.tsx` | [D] | Sticky glass bar with mobile hamburger, derived page title, "Queue: N queued" KPI pill (from `usePosts({ status: 'scheduled' })`), command-palette trigger (⌘K hint), "Create post" primary button, notifications bell dropdown, theme toggle, help button, avatar dropdown. |
| **3.4 Command palette** | 3.4.1 `src/components/dashboard/command-palette.tsx` | [D] | `CommandDialog` with three groups: Navigate (every view), Actions (create post, analytics, switch theme, back to site), Posts (filterable list from `usePosts()` that opens the composer in edit mode). |
| **3.5 Composer (Sheet)** | 3.5.1 `src/components/dashboard/composer.tsx` | [D] | Wide right-side Sheet; two-column layout (editor \| live preview). Multi-select platform chips; char counter with dynamic most-restrictive limit (X=280, LinkedIn=3000, others=2200); datetime-local input with "Now / Tomorrow 9am / Next week 9am" presets; Popover media picker; AI caption generation (`useGenerateCaptions`, shows 3 suggestion chips); campaign selector; status select; react-hook-form + zod validation; live preview card with avatar/text/platform badges/media thumbnail; footer with Discard / Save draft / Schedule. Edit mode hydrates from `composerPostId`. |
| **3.6 Shared primitives** | 3.6.1 `src/components/dashboard/shared.tsx` | [D] | Contract module exporting: `PageHeader`, `StatCard`, `SectionCard`, `StatusBadge`, `PostCard`, `EmptyState`, `SkeletonGrid`, `Avatar` (gradient-initials, distinct from `@/components/ui/avatar`), `MiniSparkline`, `MiniArea`, `DonutChart`, `Toolbar`, `formatCompact`, `formatDate`, `PLATFORMS` re-export. See §7.5 for full contract. |
| **3.7 Placeholders** | 3.7.1 `src/components/dashboard/views/_placeholder.tsx` | [D] | Generic `ViewPlaceholder` (gradient icon swatch, "Coming together" pill, CTA back to Overview) and 13 distinct placeholder variants. (Currently unused by the live router — all 14 views are full implementations — but retained as scaffolding for future views.) |

### Epic 4 — Publishing (Composer, Calendar, Queue)

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **4.1 Calendar** | 4.1.1 `views/calendar.tsx` (Month / Week / List) | [D] | View toggle (`ToggleGroup`); Month grid (Mon–Sun, `date-fns` helpers, day cells are `<button aria-label>`, up to 3 stacked post chips, "+N more" Popover, out-of-month dimmed, horizontal scroll on small screens); Week view (7 day columns with "+ Add post" per day); List view (grouped by Today / Tomorrow / This week / Later). |
| | 4.1.2 Calendar toolbar | [D] | Shared `Toolbar`: prev / today / next month/week nav; platform multi-select Popover with Checkboxes; campaign Select; view toggle; "Create post" button. |
| | 4.1.3 Calendar legend + states | [D] | Status color legend (Scheduled / Published / In review / Draft / Failed); loading skeleton grid; EmptyState; `openComposer()` on day click, `openComposer(post.id)` on chip click. |
| **4.2 Queue** | 4.2.1 `views/queue.tsx` (status Tabs) | [D] | Tabs by status (Scheduled / Drafts / In review / Failed / Published) with count Badges; default Scheduled; single `usePosts()` fetch with client-side status filtering. |
| | 4.2.2 Day grouping | [D] | Scheduled tab: posts grouped by day into `SectionCard`s (Today / Tomorrow / "Wed · MMM d" / "EEE, MMM d") with sorted `PostCard`s; day group label includes colored dot (primary for upcoming, muted for past). |
| | 4.2.3 Failed-tab banner | [D] | Destructive `Alert` ("N posts failed to publish") with "Retry all" + "View log" actions (toast feedback). |
| | 4.2.4 Queue health rail | [D] | Right rail (`lg:sticky lg:top-4`): 3 StatCards (Scheduled this week, Avg posts/day over next 7 days, In queue) + "Next publish" SectionCard with Edit button. Collapses to top of single column on mobile. |
| | 4.2.5 Queue toolbar | [D] | Platform filter chips (with per-platform counts for the active tab); search input with clear button; sort Select (Time / Recently added); "Create" button. |
| **4.3 Full-page Composer** | 4.3.1 `views/composer.tsx` layout | [D] | Desktop 3-region grid `[300px \| minmax(0,1fr) \| minmax(360px,420px)]` — left = platform + scheduling (sticky), center = editor, right = live preview (sticky). Mobile: stacked with Tabs to switch Compose / Preview. |
| | 4.3.2 Editor + char counter | [D] | Large Textarea with floating toolbar (Bold, Italic, Emoji Popover, Hashtag Popover); char counter drives off most restrictive selected platform; counter color (muted → amber-brand within 10% → destructive over limit); per-platform limit badges below. |
| | 4.3.3 AI captions | [D] | `useGenerateCaptions({ topic, platforms, tone, count: 3 })` via "✨ AI captions" button; 3 suggestion cards with Append / Replace; shimmer placeholders while loading; toast on success/error. |
| | 4.3.4 Platform + scheduling panels | [D] | 2-col grid of PlatformBadge chips with name + char limit; "Select all connected" button (uses `useAccounts().connected`); native `datetime-local` + 4 quick presets (Now / Tonight 7pm / Tomorrow 9am / Next Monday 9am) with `aria-pressed`; status Select; campaign Select; "Add to publishing queue" Switch (only when status=scheduled). |
| | 4.3.5 Media picker | [D] | Popover media picker from `useMedia`; grid of thumbnails; multi-select (max 4 with toast on overflow); video badge; selected thumbnails with hover-to-remove overlay. |
| | 4.3.6 Live preview | [D] | Realistic phone-ish post card per selected platform (avatar + handle + platform badge + text + media + engagement row + timestamp). When multiple platforms selected, renders Tabs of per-platform previews. Empty state when no platform selected. |
| | 4.3.7 Footer + validation | [D] | Discard (in `AlertDialog` confirm), Save draft, Schedule / Send for review (primary, label depends on status). On success: `setView('queue')` + sonner toast. react-hook-form + zod (text required min 1, ≥1 platform, scheduledAt required). Uses `useWatch` (NOT `watch()`) to avoid the react-hooks/incompatible-library warning. |
| **4.4 Composer (Sheet, global)** | 4.4.1 Reuse of full-page logic | [D] | Global Sheet composer (`src/components/dashboard/composer.tsx`) is the quick-capture surface; opens from topbar / command palette / PostCard edit. Shares the same hooks and validation rules as the full-page composer. |

### Epic 5 — Insights (Analytics, Reports, Audience)

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **5.1 Analytics Overview** | 5.1.1 `views/analytics.tsx` toolbar | [D] | `ToggleGroup type="single"` date-range segmented control (7/30/90d, default 30d); platform multi-select Popover (custom `role="checkbox"` rows with PlatformBadge); "Export CSV" button → sonner toast. |
| | 5.1.2 KPI row | [D] | 4 StatCards (Impressions / Reach / Engagement / Clicks); `formatCompact` value; delta % vs previous equal-length window (half-slice comparison); 14-point MiniSparkline. |
| | 5.1.3 Performance chart | [D] | SectionCard with metric toggle (Impressions / Reach / Engagement / Clicks) switching the plotted AreaChart series; custom `ChartTooltip` styled with popover tokens; X axis formatted dates with adaptive tickInterval; Y axis compact; subtle CartesianGrid (horizontal only). |
| | 5.1.4 Engagement + platform donut | [D] | Left: Engagement-rate-trend AreaChart (engagement / reach × 100) with brand coral gradient. Right: Impressions-by-platform DonutChart from `breakdown` with legend listing platform + `formatCompact` value + share %. |
| | 5.1.5 Platform breakdown table | [D] | Sortable headers (Platform / Followers / Posts / Impressions / Eng. rate); `SortHeader` lifted to module scope (satisfies `react-hooks/static-components`); Impressions cell renders subtle primary bar whose width is the relative share of the max; PlatformBadge in the first column. |
| | 5.1.6 Top performing posts | [D] | Top 6 published posts by `metrics.impressions` (sorted client-side); ranked 1..6; truncated text + platform badges + date + impressions + engagement + engagement rate; row click → `openComposer(post.id)`. |
| | 5.1.7 States + a11y | [D] | Loading skeletons for KPIs, charts, table, top-posts list; EmptyState fallbacks when series/breakdown is empty; charts wrapped in fixed-height `ResponsiveContainer`; each has `role="img"` + `aria-label`; responsive grid (2×2 KPIs on mobile, 4 across on xl). |
| **5.2 Reports & Exports** | 5.2.1 `views/reports.tsx` templates | [D] | 6 template cards (Weekly Summary, Monthly Performance, Campaign Report, Audience Growth, Content Audit, Custom); tinted icon swatch; title + description + cadence pill + "Generate" button → Dialog with date-range radio (7/30/90d), format radio (PDF/CSV), channel badges, Generate confirm → toast. |
| | 5.2.2 Scheduled reports table | [D] | 4 mock scheduled reports; name + format icon + cadence + recipient count + first email + last sent + next run + active Switch (pause/resume toast) + edit/remove DropdownMenu. |
| | 5.2.3 Recent reports table + preview | [D] | 5 generated report rows; template badge + generated date + author + size + Eye (preview) + Download (toast); preview Dialog shows 4 KPI cards + 14-day mini AreaChart (impressions + reach, dual gradient fills) + "Top performing posts" mini table. |
| | 5.2.4 Quick export + tips | [D] | Quick export SectionCard: PDF / CSV / chart PNG buttons → toast each. Tips card with 3 CheckCircle2 bullets and a coming-next strip. |
| **5.3 Audience Insights** | 5.3.1 `views/audience.tsx` KPIs | [D] | 4 StatCards (Total followers, New followers [delta over 30d with `+` prefix], Engagement rate [avg of breakdown.engagementRate], Profile visits [deterministic mock = followers × 0.084]); each card has 14-point sparkline. |
| | 5.3.2 Follower growth chart | [D] | `ComposedChart` with Area (cumulative followers, primary teal gradient, left Y axis) + Line overlay (new-followers-per-day derived pairwise, coral, right Y axis); dual Y axes; custom tooltip with per-series formatters. |
| | 5.3.3 Audience-by-platform donut | [D] | DonutChart from breakdown (followers); legend listing platform + compact value + share %. |
| | 5.3.4 Demographics cards | [D] | Top locations bar list (US/UK/India/Germany/Brazil/Other) with MapPin icon and primary-tinted progress bars (Other is muted); Age distribution horizontal BarChart (25–34 bucket highlighted in primary, others mint; custom tooltip with % formatter; `role="img"` + aria-label). |
| | 5.3.5 Best-time-to-post heatmap | [D] | 7 days × 12 two-hour-bucket grid; deterministic engagement score per cell (peak windows: weekday evenings, weekend midday); cell background derived from `color-mix(in oklch, var(--primary) X%, transparent)` so it adapts to dark mode; day-row labels + hour-column labels; "Less ↔ More" legend in header; caption with Info icon; cells have `title` attr for hover tooltips and `sr-only` text for screen readers; horizontal scroll on mobile (`min-w-[640px]`). |
| | 5.3.6 Interests + coming-next | [D] | Top interests: tiered chip cloud (4 tiers by index) using brand accent tokens (primary / mint / coral / muted); clicking a chip → toast. Coming-next card: affinity segments, sentiment, competitor benchmarks chips. All mock-demographic cards explicitly labeled "Sample" with a Badge. |

### Epic 6 — Engagement (Inbox, Media Library, AI Assistant)

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **6.1 Engagement Inbox** | 6.1.1 `views/inbox.tsx` layout | [D] | Two-pane `lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]`. Left: `role="listbox"` of memoized `InboxListItem` button rows (Avatar, PlatformBadge, author, handle, snippet, relative time, status dot, type badge, `aria-selected`, keyboard nav ↑↓ + Enter via window keydown listener that ignores inputs/textareas). Right: `DetailPanel` (full message + thread mock for comments, original post card above, Avatar + platform context, reply Textarea with "Send reply" toast, Resolve/Mark pending via `useResolveInbox` → toast, decorative Assign dropdown + Snooze + char counter). Mobile: detail becomes right-side Sheet. |
| | 6.1.2 Inbox toolbar + stats | [D] | Type segmented control (All/Comments/Mentions/DMs/Reviews) as pill toggle group; platform multi-select Popover (custom `role="checkbox"` rows + PlatformBadge); status DropdownMenu; search Input. All filter state in React; `filtered` memoized. StatsStrip of 4 StatCards (Open / Pending / Resolved + mock Avg response time with delta). |
| | 6.1.3 Inbox states | [D] | Loading skeletons (shimmer list rows); EmptyState fallback; Reset filters CTA; on mobile detail becomes a Sheet. |
| **6.2 Media Library** | 6.2.1 `views/media.tsx` layout | [D] | Grid (`sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`) of memoized `MediaCard` (image thumbnail `<img loading="lazy">`, video play badge, hover overlay with quick "Preview", type badge, name, dimensions, size, tag chips, top-left Checkbox, top-right kebab CardMenu). List view: shadcn Table (Thumbnail \| Name \| Type \| Dimensions \| Size \| Tags \| Date \| actions). |
| | 6.2.2 Upload + selection | [D] | `UploadDialog` with styled drag-drop zone (`role="button"`, tabIndex=0, onDragOver/onDrop wired) + name input + type Select + "Add to library" button; POSTs `{name, type, url, thumbnailUrl, width, height, sizeKb, tags}` to `/api/media` then invalidates the `media` query. Selection mode: sticky bottom action bar with "Use in post", "Add tags", "Delete (N)" + clear button; AnimatePresence in/out. |
| | 6.2.3 Media detail dialog | [D] | Large preview + metadata grid (Type/Dimensions/Size/Added) + decorative tags editor + "Edit details" + "Use in post" (openComposer). |
| | 6.2.4 Media toolbar + stats | [D] | Type segmented control (All/Images/Videos); search Input; sort Select (Newest/Name/Size); grid/list view toggle; tag chip row below toolbar. Stats: 4 StatCards (Total assets, Library size, Images, Videos) with `formatSize` helper for KB/MB. |
| **6.3 AI Assistant** | 6.3.1 `views/ai.tsx` 3-column layout | [D] | Desktop `lg:grid-cols-[260px_minmax(0,1fr)_320px]`. Left: `ChatSidebar` with 4 mock past conversations + pro tip card. Center: chat thread SectionCard; empty state has gradient AI avatar, "How can I help you create today?" headline, 4 suggestion chips (Draft IG captions / Suggest content calendar / Rewrite caption / Best time to post on LinkedIn). Right: `CaptionGenerator` mini-tool (topic input, platform multi-select chips, tone Select, "Generate 3 captions" → `useGenerateCaptions` → 3 caption cards each with Copy + "Use in composer"). |
| | 6.3.2 Chat thread rendering | [D] | User messages right-aligned with Avatar + primary bubble; assistant left-aligned with gradient AI avatar (Sparkles in a `from-primary→mint→coral` circle). Assistant content rendered with `react-markdown` (custom components for p/ul/ol/li/strong/em/code/pre/h1/h2/h3/a). Each assistant message has Copy + Use in post footer actions. `TypingBubble` shows animated dots while `useAiChat` is pending. |
| | 6.3.3 Input + persistence | [D] | Auto-grow Textarea (height clamped to 200px) + Send button. Enter to send, Shift+Enter for newline. Last ~8 turns passed as `history` to `useAiChat`. State persisted to `localStorage["cadence.ai.chat"]` and restored on mount. "New chat" clears messages + input. |
| | 6.3.4 AI a11y + responsive | [D] | `<section aria-label="AI chat">`; Textarea has `aria-label`; `sr-only` live region announces new assistant replies; send button disabled while pending or empty. Sidebar collapses to a left Sheet ("Chats" button in header); right rail collapses to a Tabs-based mobile section ("Chat" / "AI tools"). |
| | 6.3.5 AI backend | [D] | `src/lib/ai.ts` (server-only): `cadenceChat(history, message)` with `CADENCE_SYSTEM` prompt + 8-turn window + `thinking: { type: "disabled" }`; `generateCaptions({ topic, platforms, tone, count })` returns array of ≤220-char caption strings with 2–4 hashtags. `/api/ai/chat` and `/api/ai/captions` route handlers wired; graceful fallbacks on error. |

### Epic 7 — Workspace (Team, Integrations, Billing, Settings)

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **7.1 Settings** | 7.1.1 `views/settings.tsx` Tabs | [D] | shadcn Tabs with vertical TabsList on `lg+` (`lg:flex-row` wrapper + `lg:w-60 lg:self-stretch`) and horizontal on mobile. 7 tabs: Profile, Workspace, Notifications, Appearance, Security, Billing (pointer to billing view), Danger zone. |
| | 7.1.2 Profile tab | [D] | react-hook-form + zod (name min 2, email valid, bio max 280); Avatar with decorative "Change"/"Remove"; name/email inputs; bio Textarea; timezone Select (7 zones); Save → toast. |
| | 7.1.3 Workspace tab | [D] | Workspace name input; slug input + "Check" button (decorative availability check with simulated latency + toast); default timezone Select; week-starts-on Select; decorative logo upload row. Save → toast. |
| | 7.1.4 Notifications tab | [D] | 4 groups (Publishing, Engagement, Reports, Team) each with label + description + Switch toggles. State in a flat Record. Save → toast. |
| | 7.1.5 Appearance tab | [D] | Theme Select (Light/Dark/System) wired to `useTheme().setTheme` (hydration-safe via `mounted` flag); 5 accent color swatches (decorative); density Comfortable/Compact; reduced-motion Switch (decorative). Save → toast. |
| | 7.1.6 Security tab | [D] | Change-password form (3 fields, zod schema with refine for match); 2FA Switch (decorative); active sessions list (2 mock devices with "Revoke" — current device labeled); API tokens Table (mock 2 tokens, create adds new row + toast, revoke removes + toast). |
| | 7.1.7 Danger zone | [D] | Red "Delete workspace" with `AlertDialog` requiring typed confirmation "delete my workspace" before the destructive action fires. Plus an "Export data" row. |
| **7.2 Integrations** | 7.2.1 `views/integrations.tsx` summary | [D] | PageHeader with "Browse all" button (toast). Connected summary strip (SectionCard): count badge + grid of motion.button cards for every connected integration, each opening the Configure dialog. Empty state when none connected. |
| | 7.2.2 Integrations grid | [D] | Toolbar: search Input + category chip filter (All/Design/Productivity/Storage/Automation/Communication/Commerce/Analytics). Grid (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) of `IntegrationCard`: `LogoTile` (gradient initials in `integration.accent` tinted square), name + category badge, description (line-clamp-2), connection status dot + label (mint=Connected / muted=Not connected), "Configure" button (only when connected) + "Connect"/"Disconnect" button → `useToggleIntegration(id)` with pending state + toast. |
| | 7.2.3 Configure dialog + CTA | [D] | `ConfigureDialog`: auto-sync Switch, notify Switch, account Select (decorative), Save → toast. Bottom CTA SectionCard: "Request an integration" with popular-request chips (Mastodon/Bluesky/Linear/Airtable/Asana/Webflow) that toast on click + "Browse all" + "Request integration" buttons. |
| **7.3 Billing & Plan** | 7.3.1 `views/billing.tsx` current plan + usage | [D] | PageHeader with "Export" + "Upgrade" (opens PlanComparison dialog). Two-column row: Current plan SectionCard (plan name "Team", price, seats "5 of 8 used", renewal "Jun 1, 2025", billing cycle, next invoice $90, Manage plan / Switch to annual / Cancel plan buttons) + Usage SectionCard with 3 `UsageMeter` cards (Posts this month / Media storage / AI credits) each with Progress bar, MiniSparkline, % used + remaining label, amber "Near limit" badge when ≥80%. |
| | 7.3.2 Billing usage breakdown | [D] | 4 StatCards (Posts scheduled / Posts published / AI captions generated / Media uploaded) each with sparkline + deltaLabel. |
| | 7.3.3 Payment + invoices | [D] | Two-column row: Payment method SectionCard (Visa ending 4242 + expiry + "Update" → PaymentDialog, amber expiry warning, billing email, Tax ID) + Invoices Table (4 paid + 1 upcoming, FileText icon, amount, status badge, download icon → toast) with "Download all" header action. |
| | 7.3.4 Billing activity + dialogs | [D] | Billing activity SectionCard: 3 timeline rows (payment succeeded, card expiring, AI credit usage) with tinted icon swatches + dates. `PlanComparison` Dialog: 3-tier grid from `PRICING`, current plan highlighted/disabled, "Change to {plan}" → toast. `PaymentDialog`: card form (name/number/expiry/CVC/ZIP) → toast on save. |
| **7.4 Team & Permissions** | 7.4.1 `views/team.tsx` roster | [D] | PageHeader with "Invite member" button → `InviteDialog` (name + email + role Select Owner/Admin/Editor/Approver/Viewer, email regex validation, `useInviteMember` mutation → toast + close + table refresh via React Query invalidation). Stats: 4 StatCards (Total members / Active / Pending invites / Seats used out of SEAT_LIMIT=8) with deltaLabels. Toolbar with seat count + "Export" (toast) + "Invite member". |
| | 7.4.2 Roster table | [D] | `RosterTable` columns: Avatar+Name (with Crown icon for Owner), Email, Role badge (color-coded per role), Status badge (active=green / invited=amber / suspended=red), Last active (formatDistanceToNow), `RowActions` kebab menu with Change role `DropdownMenuSub`, Resend invite (when invited), Suspend access, Remove from team (`AlertDialog` confirm). Remove is optimistic (hidden Set) + toast. |
| | 7.4.3 Pending invites | [D] | Sub-section (only when any invited members): Table with Name/Email/Role/Status + Resend button. |
| | 7.4.4 Permissions matrix + activity | [D] | Two-column row: `PermissionsMatrix` SectionCard (sticky-left-column Table of 8 permissions × 5 roles with check/x icons + sr-only labels; horizontally scrollable on mobile) + `TeamActivity` SectionCard (filtered activity feed showing invite/approve events from `useActivity`, each row a tinted icon + actor/action/target + relative time). |

### Epic 8 — Backend & Data (Auth, Prisma, API, AI)

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **8.1 Prisma schema** | 8.1.1 `prisma/schema.prisma` | [D] | 15 models: User, Workspace, Membership, SocialAccount, Post, MediaAsset, Campaign, InboxItem, TeamMember, WorkspaceIntegration, ActivityEvent, AiConversation, AiMessage, Notification, AuditLog. Cascade deletes on Workspace → children. `@@unique([workspaceId, platform])` on SocialAccount; `@@unique([userId, workspaceId])` on Membership; `@@index([workspaceId, scheduledAt])` + `@@index([workspaceId, status])` on Post. SQLite limitation: arrays stored as JSON strings. |
| | 8.1.2 Prisma client (`src/lib/db.ts`) | [D] | Singleton `PrismaClient` (dev hot-reload-safe). |
| | 8.1.3 SQLite → Postgres migration | [P] | Add `prisma/enums` (SQLite lacks enums — Postgres gets native enums for `PostStatus`, `Role`, `InboxType`, etc.); replace JSON-string arrays with `String[]` / relation tables; run `prisma migrate dev --name postgres-init`; update `DATABASE_URL` to `postgresql://…`; smoke-test all routes against Postgres in CI. |
| **8.2 In-memory store** | 8.2.1 `src/lib/data/store.ts` | [D] | Singleton `store` with CRUD methods for posts, media, accounts, inbox, team, integrations, activity, campaigns. Seeded from `src/lib/data/mock.ts` on first access. Used by every API route handler today. |
| | 8.2.2 Seed data (`src/lib/data/mock.ts`) | [D] | Deterministic seed: 42 posts, 12 media, 8 accounts, campaigns, 30-day analytics, inbox, team, integrations, activity, testimonials, FAQs, pricing, stats. |
| **8.3 API routes** | 8.3.1 Posts (`/api/posts`, `/api/posts/[id]`) | [D] | GET (list with optional `?status=&platform=` filters), POST (create), PATCH (update), DELETE. Mutations write to in-memory store; persistence to Prisma is a Phase 9 task. |
| | 8.3.2 Read-only endpoints | [D] | `GET /api/analytics`, `GET /api/media`, `GET /api/accounts`, `GET /api/inbox`, `GET /api/team`, `GET /api/integrations`, `GET /api/activity`, `GET /api/campaigns`. |
| | 8.3.3 Mutating endpoints | [D] | `POST /api/media`, `PATCH /api/inbox/[id]/resolve` (folded into inbox route), `POST /api/team/invite`, `PATCH /api/integrations/[id]/toggle`. |
| | 8.3.4 AI endpoints | [D] | `POST /api/ai/chat` (multi-turn completion via `cadenceChat`), `POST /api/ai/captions` (3 caption options via `generateCaptions`). Both have graceful fallbacks on SDK error. |
| | 8.3.5 API contracts (typed) | [P] | Generate Zod schemas for every request + response body; export from `src/lib/api-contracts.ts`; use in route handlers + share with the React Query hooks layer. |
| | 8.3.6 Rate limiting | [P] | Per-IP + per-user token bucket on `/api/ai/*` (most expensive) and write endpoints; use Upstash Redis or in-memory LRU for single-instance deploys; return `429` + `Retry-After` header. |
| | 8.3.7 Security headers + CSRF | [P] | `next.config.ts` `headers()` for CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; CSRF token cookie + header check on mutations. |
| **8.4 React Query hooks** | 8.4.1 `src/hooks/use-api.ts` | [D] | 17 hooks (see §1.2 for the full list). All mutations invalidate the appropriate query keys and fire sonner toasts. |
| | 8.4.2 Query key conventions | [D] | Stable factory functions (e.g. `['posts', { status, platform }]`, `['analytics']`, `['media']`, `['inbox']`). |
| | 8.4.3 Optimistic updates | [D] | Post delete + Inbox resolve + Integration toggle + Team remove all use `onMutate` optimistic state with rollback on error. |
| **8.5 AI integration** | 8.5.1 `src/lib/ai.ts` wrapper | [D] | Server-only (`import "server-only"`). Lazy singleton `getZai()`. `cadenceChat(history, message)` with system prompt + 8-turn window + `thinking: { type: "disabled" }`. `generateCaptions({ topic, platforms, tone, count })` parses numbered response into array. Both have try/catch with `console.error` + fallback. |
| | 8.5.2 Token budget + safety | [P] | Enforce max history length (already 8 turns — verify); add max output tokens; add per-user daily quota stored in Postgres; return quota-exceeded error to client. |
| | 8.5.3 Streaming responses | [P] | Stream `/api/ai/chat` via SSE/ReadableStream so the typing indicator reflects real tokens (currently the typing dots are a fixed animation). |
| **8.6 Auth (next-auth)** | 8.6.1 NextAuth bootstrap | [P] | `src/app/api/auth/[...nextauth]/route.ts`; Credentials + GitHub + Google providers; JWT session strategy; `NEXTAUTH_SECRET` env; session provider in `providers.tsx`. |
| | 8.6.2 Protected routes | [P] | Wrap dashboard in `<SessionProvider>` + `useSession()` gate; redirect unauthenticated users to marketing `/` (hash stays empty); add `signIn`/`signOut` to the sidebar user dropdown. |
| | 8.6.3 Workspace scoping | [P] | Every API route reads `session.user.id` → resolve active workspace from `Membership` → scope all queries by `workspaceId`. Remove the in-memory singleton's global state. |
| | 8.6.4 RBAC enforcement | [P] | Replace the decorative permissions matrix with real middleware: `requireRole('Owner'|'Admin'|'Editor'|'Approver'|'Viewer')` per route. |
| **8.7 Persistence migration** | 8.7.1 Replace in-memory store with Prisma | [P] | Every API route handler swaps `store.*` calls for `prisma.*` calls. Seed script (`prisma/seed.ts`) populates a fresh Postgres DB from `mock.ts` data. |
| | 8.7.2 Audit log writes | [P] | Every mutating route writes an `AuditLog` row (`actor`, `action`, `entity`, `entityId`, `meta`). |

### Epic 9 — Performance, A11y, Responsive, Deployment

| Feature | Task | Status | Subtasks |
| --- | --- | --- | --- |
| **9.1 Performance** | 9.1.1 Bundle analysis | [P] | `@next/bundle-analyzer` in dev; ensure no chart library is shipped to the marketing route (currently `marketing-site.tsx` imports recharts only in `analytics-showcase.tsx` — verify no leak). |
| | 9.1.2 Lazy-load dashboard views | [P] | Convert `VIEW_COMPONENTS` to `React.lazy` per view (currently all 14 views are eagerly imported — large initial bundle for dashboard). |
| | 9.1.3 Image optimization | [P] | Replace `<img loading="lazy">` in `MediaCard` with `next/image` (requires `images.remotePatterns` allowlist); generate `blurDataURL` placeholders. |
| | 9.1.4 React Query stale-ness tuning | [P] | Set `staleTime` per query (analytics = 60s, posts = 5s, media = 60s, inbox = 5s, team = 60s); add `refetchInterval` for inbox while focused. |
| | 9.1.5 Server components for read-only views | [P] | Move marketing sections to RSC where possible (no client state). Dashboard views stay client (they depend on the Zustand store). |
| | 9.1.6 Core Web Vitals budget | [P] | LCP < 2.5s, INP < 200ms, CLS < 0.1 on marketing; LCP < 2.5s on dashboard initial paint. Track via Lighthouse CI. |
| **9.2 Accessibility** | 9.2.1 Skip links | [D] | Marketing (`#main`) and dashboard (`#main`) both have a "Skip to content" link. |
| | 9.2.2 Landmarks + ARIA | [D] | `<main>`, `<aside>`, `<section aria-label>`; `role="listbox"`/`role="option"` on inbox; `aria-selected`, `aria-pressed`, `aria-live` on AI replies; `role="img"` + `aria-label` on every chart. |
| | 9.2.3 Keyboard operability | [D] | All interactive elements keyboard-focusable; visible focus rings (global in `globals.css`); inbox ↑↓ + Enter; AI Enter/Shift+Enter; ⌘K command palette; ⌘B sidebar toggle. |
| | 9.2.4 Color contrast | [D] | All text/background pairs meet WCAG AA (verified for both light + dark). Color is never the only signal (status badges combine dot + label + badge). |
| | 9.2.5 Reduced motion | [D] | Every framer-motion animation gated with `useReducedMotion()`; CSS keyframes have `@media (prefers-reduced-motion: reduce)` overrides. |
| | 9.2.6 Automated a11y tests | [P] | `@axe-core/playwright` in the E2E suite for each view; Lighthouse a11y audit in CI; target 100 on every route. |
| | 9.2.7 NVDA + VoiceOver manual pass | [P] | Run the QA Checklist (§5) on NVDA (Windows) and VoiceOver (macOS) for the golden paths. |
| **9.3 Responsive** | 9.3.1 Breakpoint coverage | [D] | Mobile (390px), tablet (768px), desktop (1440px), ultrawide (1920px) all tested; no unintended horizontal overflow (intentional scroll areas use `.scrollbar-cadence` and `min-w-[…]`). |
| | 9.3.2 Mobile nav sheet | [D] | Sidebar collapses to a Sheet on mobile; topbar hamburger opens it. |
| | 9.3.3 Mobile composer | [D] | Full-page composer stacks editor/preview into Tabs on mobile. |
| | 9.3.4 Responsive charts | [D] | All recharts in `ResponsiveContainer` with fixed heights; legends + tooltips adapt to width. |
| **9.4 Deployment** | 9.4.1 Vercel deployment | [P] | Connect repo; configure build command (`bun run build`); set env vars; attach Postgres (Vercel Postgres or Neon); enable Edge functions for AI routes (optional). |
| | 9.4.2 Standalone Docker | [P] | `next.config.ts` already `output: "standalone"`; write `Dockerfile` (multi-stage: deps → build → runtime); push to GHCR; deploy to Fly.io / Render / ECS as fallback. |
| | 9.4.3 CDN + image optimization | [P] | Vercel Edge Network (default) or Cloudflare in front of self-hosted; enable `next/image` optimization. |
| | 9.4.4 Monitoring + Sentry | [P] | `@sentry/nextjs`; source maps upload; per-route performance traces; error alerting to Slack. |
| | 9.4.5 Analytics | [P] | Vercel Analytics (privacy-friendly) or Plausible; events for sign-up, composer-open, schedule-post, ai-chat-send, plan-upgrade. |
| | 9.4.6 Domain + DNS + SSL | [P] | `cadence.app` Apex → Vercel; `www` → Apex redirect; TLS via Vercel (auto-renew); HSTS preload. |
| | 9.4.7 Rollback plan | [P] | Vercel instant rollback to previous deployment; database migrations are forward-only with backward-compatible deploys (expand-then-contract). |

---

## 3. Developer Checklist

> Tick each box before opening a PR. Items marked **( Phase 9 )** are net-new
> work; everything else is a verification of an existing build.

### 3.1 Setup

- [ ] Node 20+ or Bun 1.3+ installed and verified (`bun --version`)
- [ ] `bun install` runs clean (no peer dep warnings that block)
- [ ] `.env` exists with `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (and AI SDK credentials for prod)
- [ ] `bun run db:push` succeeds; `db/custom.db` exists
- [ ] `bun run dev` serves `http://localhost:3000` with HTTP 200
- [ ] `bun run lint` reports 0 errors (1 known warning in `composer.tsx` from `react-hook-form` is acceptable)
- [ ] `bun run build` produces `.next/standalone/server.js` and copies `static/` + `public/` into it
- [ ] Editor configured: ESLint on save, Prettier optional (project uses Tailwind v4 CSS-first — no Prettier plugin required), TypeScript strict

### 3.2 Design System

- [ ] All colors come from semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `bg-accent`) or documented brand accent tokens (`text-coral`, `text-mint`, `text-amber-brand`, `text-plum`, `text-primary`, `text-destructive`)
- [ ] No raw indigo/blue used as a brand color (LinkedIn/Facebook/TikTok brand glyphs in `PLATFORMS` are the documented exceptions — they live in `src/lib/brand.ts`)
- [ ] Every custom utility is in `globals.css` `@layer utilities` (`.scrollbar-cadence`, `.text-gradient-brand`, `.bg-grid`, `.bg-dots`, `.glass`, `.shimmer`, `.mask-fade-x`, `.mask-fade-b`)
- [ ] Every animation has a `@media (prefers-reduced-motion: reduce)` override
- [ ] Every framer-motion usage is gated with `useReducedMotion()`
- [ ] Dark mode parity: every view renders correctly in both Light and Dark with no washed-out text or invisible borders
- [ ] Decorative gradients (AI avatar, CTA band, plan tile, payment icon, logo tile) are the only intentional exceptions to the semantic-token rule
- [ ] Brand glyphs (`Logo`, `LogoMark`, `PlatformIcon`, `PlatformBadge`) are original SVGs — no third-party icon fonts

### 3.3 Frontend

- [ ] Every dashboard view opens with `<PageHeader .../>` inside a `<div className="space-y-6">`
- [ ] Every grouped content area uses `<SectionCard>` (not raw `<Card>`)
- [ ] Every KPI uses `<StatCard>` (with `spark` whenever a timeseries is available)
- [ ] Every post row uses `<PostCard>` (already wires Edit/Duplicate/Delete)
- [ ] Every loading state uses `<SkeletonGrid>` or shimmer divs
- [ ] Every empty state uses `<EmptyState>` with an actionable CTA when sensible
- [ ] Every person avatar uses the shared `Avatar` (NOT the shadcn `@/components/ui/avatar` directly)
- [ ] All numbers > 999 use `formatCompact`; all dates use `formatDate` or `formatDistanceToNow`
- [ ] View switching uses `useApp((s) => s.setView)` — never `next/link` or `next/router`
- [ ] Composer opens with `useApp((s) => s.openComposer)` (optionally with a post id)
- [ ] No view imports mock data directly except `PRICING` (billing) and decorative constants (team permission matrix)
- [ ] All mutations fire `sonner` toasts — no second toast system introduced
- [ ] All `<img>` use `loading="lazy"` (or `next/image` once §9.1.3 ships)
- [ ] Sort headers are lifted to module scope (not defined inside a parent component — `react-hooks/static-components`)
- [ ] `useMemo` does not reassign closed-over variables (use `series[i-1]` pairwise lookup, not a `prev` reassignment — `react-hooks/immutability`)
- [ ] No nested-interactive HTML (e.g. `<button><Checkbox/></button>`); use a single `<button role="checkbox">` with a styled `<span>` indicator
- [ ] Pricing monthly/annual toggle uses framer-motion `layoutId` pill + `AnimatePresence` for price swap
- [ ] Mobile nav Sheet opens from topbar hamburger and closes on nav-item click
- [ ] Command palette (⌘K) lists every view + actions + posts; "c" keyboard shortcut also opens the composer

### 3.4 Backend

- [ ] Every API route lives under `src/app/api/*` (App Router conventions)
- [ ] Every route handler validates input (today: ad-hoc; Phase 9: Zod contracts in `src/lib/api-contracts.ts`)
- [ ] Every mutating route returns the updated entity (so React Query `onSuccess` can update the cache)
- [ ] Every React Query mutation invalidates the correct query keys (e.g. `useDeletePost` invalidates `['posts']`)
- [ ] Optimistic updates include `onError` rollback
- [ ] No API route imports the AI SDK directly — they go through `src/lib/ai.ts` (server-only)
- [ ] No client component imports `src/lib/db.ts` or `src/lib/ai.ts` (server-only)
- [ ] (Phase 9) Every route reads `session.user.id` and scopes queries by `workspaceId`
- [ ] (Phase 9) Every mutating route writes an `AuditLog` row
- [ ] (Phase 9) Rate limiting applied to `/api/ai/*` and write endpoints
- [ ] (Phase 9) CSRF token cookie + header check on all mutations

### 3.5 AI

- [ ] `src/lib/ai.ts` is the single entry point; no other file imports `z-ai-web-dev-sdk`
- [ ] `cadenceChat` enforces the `CADENCE_SYSTEM` prompt and caps history to the last 8 turns
- [ ] `generateCaptions` returns ≤220-char captions with 2–4 hashtags, parsed from numbered output
- [ ] Both functions have try/catch with `console.error` and a graceful fallback (empty array for captions, thrown error for chat that the route handler converts to a 500 with a friendly message)
- [ ] (Phase 9) Per-user daily AI quota enforced (Postgres counter, reset at midnight UTC)
- [ ] (Phase 9) Streaming responses via ReadableStream so the typing indicator reflects real tokens
- [ ] (Phase 9) Max output tokens enforced to bound cost

### 3.6 Accessibility

- [ ] Skip link present and visible on focus (marketing + dashboard)
- [ ] Landmarks: exactly one `<main>` per route; `<aside>` for sidebar; `<section aria-label>` for major regions
- [ ] All interactive elements reachable by Tab; visible focus ring (global CSS)
- [ ] Color is never the only signal (status badges combine dot + label + badge color)
- [ ] Charts have `role="img"` + `aria-label`
- [ ] Inbox list has `role="listbox"` + `role="option"` + `aria-selected`; keyboard nav ↑↓ + Enter
- [ ] AI chat has `aria-live` polite region announcing new assistant replies
- [ ] Composer char counter has `aria-live="polite"`
- [ ] All form fields have associated `<Label>` (`<Label htmlFor>`)
- [ ] All icon-only buttons have `aria-label`
- [ ] All decorative images have `alt=""`; all informative images have descriptive `alt`
- [ ] (Phase 9) `@axe-core/playwright` runs in E2E with 0 violations per view
- [ ] (Phase 9) NVDA + VoiceOver manual pass for golden paths (§5)

### 3.7 Performance

- [ ] (Phase 9) `@next/bundle-analyzer` shows no chart library in marketing bundle
- [ ] (Phase 9) Dashboard views lazy-loaded via `React.lazy`
- [ ] (Phase 9) `next/image` used for media thumbnails with `remotePatterns` allowlist
- [ ] (Phase 9) React Query `staleTime`/`refetchInterval` tuned per query
- [ ] (Phase 9) Lighthouse: LCP < 2.5s, INP < 200ms, CLS < 0.1 on marketing + dashboard
- [ ] (Phase 9) No `any` types in API handlers (TypeScript strict)
- [ ] (Phase 9) `next.config.ts` `typescript.ignoreBuildErrors` set to `false` (currently `true` — must flip once type-clean)

### 3.8 SEO

- [ ] `src/app/layout.tsx` exports full `Metadata` (title template, description, keywords, OG, Twitter, robots) — done
- [ ] (Phase 9) `public/sitemap.xml` generated by `next-sitemap` or an App Router `sitemap.ts`
- [ ] (Phase 9) `public/robots.txt` references the sitemap (currently present but minimal)
- [ ] (Phase 9) Per-section OG images via `next/og` (ImageResponse) for `/` and key dashboard entry
- [ ] (Phase 9) JSON-LD `SoftwareApplication` schema in marketing layout
- [ ] (Phase 9) Canonical URLs + `noindex` on dashboard views (they're behind auth)
- [ ] (Phase 9) `<title>` per marketing section anchor when navigated directly (currently a single title — acceptable for SPA)

---

## 4. Testing Checklist

> Today: **zero tests exist**. Phase 9 must establish the pyramid. Tick boxes
> as tests are added. Target coverage: 70% unit/integration on `src/lib/*` and
> `src/hooks/*`, 100% of golden-path E2E flows.

### 4.1 Test infrastructure

- [ ] Install **Vitest** + `@testing-library/react` + `@testing-library/jest-dom` + `@vitejs/plugin-react`
- [ ] Install **Playwright** (`@playwright/test`) with browsers for Chromium, Firefox, WebKit
- [ ] Install **MSW** (`msw`) for mocking `/api/*` in component tests
- [ ] Add `vitest.config.ts` with `setupFiles: ['./test/setup.ts']`, jsdom environment
- [ ] Add `playwright.config.ts` with `baseURL: http://localhost:3000`, `webServer` to start dev server
- [ ] Add `bun run test`, `bun run test:e2e`, `bun run test:a11y` scripts
- [ ] CI workflow runs lint → typecheck → unit → e2e → a11y on every PR

### 4.2 Unit tests (Vitest + Testing Library)

- [ ] `src/lib/store.ts` — `setView` transitions; `openComposer(id)` sets `composerPostId`; `goApp`/`goMarketing` toggles route
- [ ] `src/lib/store.ts` — `syncHashFromState()` writes correct hash; `readStateFromHash()` parses valid + rejects invalid view names
- [ ] `src/lib/brand.ts` — `PLATFORMS` has 8 entries; `MARKETING_NAV` anchors match section ids
- [ ] `src/lib/utils.ts` — `cn()` merges Tailwind classes correctly
- [ ] `src/lib/data/mock.ts` — seed is deterministic (same output on every run); 42 posts, 12 media, 8 accounts
- [ ] `src/lib/data/store.ts` — `createPost` assigns id + createdAt; `updatePost` merges; `deletePost` removes; `resolveInbox` flips status
- [ ] `src/lib/ai.ts` — `cadenceChat` sends 8-turn history + system prompt; `generateCaptions` parses numbered response into array
- [ ] `src/hooks/use-api.ts` — each hook calls the right endpoint with the right query/mutation key
- [ ] `src/components/dashboard/shared.tsx` — `formatCompact(12345)` → "12.4K"; `formatDate` formats correctly; `StatusBadge` renders the right color per status
- [ ] `src/components/dashboard/shared.tsx` — `PostCard` calls `openComposer(post.id)` on Edit; `Delete` triggers `useDeletePost`
- [ ] `src/components/marketing/sections/pricing.tsx` — annual toggle math: annual = monthly × 12 × 0.8 (20% off)
- [ ] `src/components/marketing/sections/cta.tsx` — email validation regex rejects `foo@bar` and accepts `foo@bar.com`

### 4.3 Integration tests (Vitest + MSW)

- [ ] `usePosts({ status: 'scheduled' })` returns only scheduled posts from mocked `/api/posts?status=scheduled`
- [ ] `useCreatePost` invalidates `['posts']` after success
- [ ] `useDeletePost` performs optimistic removal + rolls back on error
- [ ] `useAiChat` posts to `/api/ai/chat` with the last 8 turns as history
- [ ] `useGenerateCaptions` posts to `/api/ai/captions` and returns 3 strings
- [ ] `useToggleIntegration` optimistic-flips `connected` then calls `/api/integrations`
- [ ] `useResolveInbox` flips inbox item status and invalidates `['inbox']`
- [ ] Composer (Sheet) submit with valid form fires `useCreatePost` and closes the sheet
- [ ] Composer (Sheet) submit with no platforms shows zod validation error
- [ ] Full-page Composer `Schedule` action calls `useCreatePost`/`useUpdatePost` then `setView('queue')`

### 4.4 API contract tests (Vitest calling route handlers directly)

- [ ] `GET /api/posts` returns array; `?status=scheduled` filters correctly
- [ ] `POST /api/posts` with valid body returns 201 + created post
- [ ] `POST /api/posts` with missing `text` returns 400
- [ ] `PATCH /api/posts/[id]` updates and returns updated entity; 404 on unknown id
- [ ] `DELETE /api/posts/[id]` returns 204; subsequent GET excludes it
- [ ] `GET /api/analytics` returns `{ timeseries, breakdown, totals }`
- [ ] `POST /api/ai/chat` with empty history returns a string
- [ ] `POST /api/ai/chat` with SDK error returns 500 with friendly message (mock `cadenceChat` to throw)
- [ ] `POST /api/ai/captions` returns array of 3 strings
- [ ] `POST /api/ai/captions` with SDK error returns 200 with empty array (graceful fallback)
- [ ] (Phase 9) Every route rejects requests without a valid session (401)
- [ ] (Phase 9) Every route rejects requests for a `workspaceId` the user doesn't belong to (403)

### 4.5 End-to-End tests (Playwright) — golden paths

- [ ] **Marketing → Dashboard:** load `/`, click "Start free" → URL hash becomes `#app/overview`, sidebar renders, Overview StatCards visible
- [ ] **Create post via composer → appears in queue:** open composer (topbar "Create post"), fill text, pick X platform, set time to "Tomorrow 9am", click "Schedule" → toast appears, view switches to Queue, post appears in "Tomorrow" group
- [ ] **Edit existing post:** open Queue, click kebab → Edit on a scheduled post → composer opens in edit mode with fields populated → change text → Save → post updates in list
- [ ] **Delete post:** Queue kebab → Delete → confirm → post disappears + toast
- [ ] **AI chat → real LLM response:** open AI view, click "Draft IG captions" suggestion chip → typing indicator shows → assistant reply appears in thread with markdown rendering → "Copy" copies to clipboard
- [ ] **AI caption generator:** in AI view right rail, enter topic "summer sale", pick Instagram, tone "Playful", click "Generate 3 captions" → 3 caption cards appear with Copy + "Use in composer" buttons → "Use in composer" opens composer with caption prefilled
- [ ] **Pricing monthly/annual toggle recalculates:** scroll to `#pricing`, click "Annual" → prices update to 80% of monthly → click back to "Monthly" → prices revert; motion is smooth
- [ ] **Dark mode persists:** open theme toggle in header, click "Dark" → `<html class="dark">` → reload page → dark mode persists (next-themes localStorage)
- [ ] **Mobile nav sheet opens:** set viewport to 390×844, click hamburger in topbar → Sheet opens with all 14 nav items → click "Analytics" → Sheet closes, view switches
- [ ] **Sidebar collapse (⌘B):** press ⌘B → sidebar collapses to icon rail → press ⌘B again → expands
- [ ] **Command palette (⌘K):** press ⌘K → dialog opens → type "analytics" → "Navigate → Analytics" highlighted → Enter → view switches to Analytics
- [ ] **Calendar month navigation:** open Calendar → click "Next" → next month renders → click "Today" → returns to current month → click a day → composer opens
- [ ] **Queue status tabs:** open Queue → click "Drafts" → only drafts render with correct count badge
- [ ] **Analytics metric toggle:** open Analytics → click "Engagement" in metric toggle → AreaChart series swaps to engagement
- [ ] **Inbox reply + resolve:** open Inbox → click a list item → detail panel shows → type a reply → "Send reply" toast → click "Resolve" → item leaves Open count
- [ ] **Media upload:** open Media → click "Upload" → fill name + type → "Add to library" → new asset appears in grid + toast
- [ ] **Media multi-select + bulk delete:** select 3 cards via checkbox → sticky action bar appears → "Delete (3)" → confirm → 3 cards removed + toast
- [ ] **Settings theme switch:** open Settings → Appearance tab → pick "Dark" → theme switches globally
- [ ] **Settings danger zone:** type "delete my workspace" in confirm input → "Delete workspace" button enables (do not actually click in E2E — assert enabled state only)
- [ ] **Integrations connect:** open Integrations → find a "Not connected" card → click "Connect" → status flips to "Connected" with mint dot + toast
- [ ] **Billing plan comparison:** open Billing → click "Upgrade" → PlanComparison dialog opens → "Team" tier is disabled (current plan) → "Change to Essentials" → toast
- [ ] **Team invite:** open Team → click "Invite member" → fill name/email/role → "Send invite" → new row appears in Pending invites table + toast
- [ ] **Hash deep-link:** navigate to `/#app/analytics` directly → Analytics view renders without clicking
- [ ] **Hash back button:** navigate Overview → Analytics → press browser Back → hash returns to `#app/overview` and Overview renders

### 4.6 Accessibility tests

- [ ] `@axe-core/playwright` runs against every view; 0 violations
- [ ] Keyboard-only test: can complete the "Create post → appears in queue" flow using only Tab/Enter/Esc
- [ ] Keyboard-only test: can navigate inbox list with ↑↓ + Enter; reply with Tab to Textarea; send with Enter
- [ ] Screen reader (NVDA on Windows): Overview view announces StatCards; AI view announces new replies via `aria-live`
- [ ] Screen reader (VoiceOver on macOS): Calendar day cells announce date + post count; composer char counter announces changes
- [ ] Reduced motion: set `prefers-reduced-motion: reduce` in DevTools → framer-motion animations disabled → CSS keyframes static
- [ ] Color contrast audit (Lighthouse a11y): 100 on marketing + dashboard

### 4.7 Visual regression tests

- [ ] Install **Playwright screenshot comparisons** (`expect(page).toHaveScreenshot()`)
- [ ] Capture baselines for marketing sections (hero, features, pricing, faq, cta) in light + dark
- [ ] Capture baselines for each dashboard view at desktop (1440) and mobile (390) in light + dark
- [ ] Capture baselines for Sheet/Dialog states (composer open, billing plan comparison, media detail, team invite)
- [ ] CI fails PRs on > 0.1% pixel diff (with reviewer override)

### 4.8 AI fallback tests

- [ ] Mock `z-ai-web-dev-sdk` to throw → `/api/ai/chat` returns 500 with friendly JSON message; client shows toast and keeps conversation intact
- [ ] Mock `z-ai-web-dev-sdk` to throw → `/api/ai/captions` returns 200 with empty array; UI shows "Couldn't generate captions — try again" empty state
- [ ] Mock `z-ai-web-dev-sdk` to return malformed numbered output → `generateCaptions` still returns a non-empty array (parser is defensive)
- [ ] Mock SDK latency > 10s → UI typing indicator stays visible; no double-submit
- [ ] (Phase 9) Per-user daily quota exceeded → 429 with `Retry-After`; client shows "Daily AI quota reached — resets at 00:00 UTC"

---

## 5. QA Checklist

> Manual QA pass before each release. Run through every box on the release
> candidate branch.

### 5.1 Cross-browser

- [ ] **Chrome** (latest, macOS + Windows) — marketing + all 14 dashboard views render correctly
- [ ] **Firefox** (latest, macOS + Windows) — same; verify framer-motion doesn't jank
- [ ] **Safari** (latest, macOS + iOS) — same; verify `datetime-local` input renders; verify next-themes hydration
- [ ] **Edge** (latest, Windows) — same
- [ ] **Samsung Internet** (Android) — marketing site renders; dashboard optional
- [ ] **iOS Safari** (real device or BrowserStack) — mobile nav sheet, composer Tabs, charts
- [ ] **Android Chrome** (real device or BrowserStack) — same

### 5.2 Responsive breakpoints

- [ ] **390×844 (iPhone 12/13/14)** — marketing sections stack; dashboard sidebar → Sheet; composer → Tabs; no horizontal overflow except intentional scroll areas
- [ ] **768×1024 (iPad portrait)** — two-column layouts collapse to single column where designed; sidebar stays visible
- [ ] **1024×768 (iPad landscape)** — two-column layouts render; sidebar visible
- [ ] **1440×900 (laptop)** — full desktop layout; all grids hit their `xl:` columns
- [ ] **1920×1080 (desktop)** — content max-widths cap correctly; no awkward stretching
- [ ] **2560×1440 (ultrawide)** — content caps; generous whitespace; no broken grids

### 5.3 Dark / light mode parity

- [ ] Toggle theme via header (marketing) and sidebar/topbar (dashboard) — switch is instant, no flash
- [ ] Every text/background pair meets WCAG AA in **both** modes
- [ ] Charts adapt: donut slice colors, heatmap cells (`color-mix`), sparkline gradients all adapt
- [ ] Borders visible in both modes (no `border-border` collapsing with `bg-background`)
- [ ] Glass effect (`.glass`) readable in both modes
- [ ] Status badges (mint/coral/amber/plum) readable in both modes
- [ ] Theme persists across reload (next-themes localStorage)

### 5.4 Keyboard navigation

- [ ] Skip link visible on first Tab press; Enter jumps to `<main>`
- [ ] Tab order is logical on every view (no focus traps except inside modals/dialogs/sheets)
- [ ] Esc closes: Sheet, Dialog, Popover, Command palette, mobile nav
- [ ] ⌘K opens command palette; ⌘B toggles sidebar; "c" opens composer
- [ ] Inbox list: ↑↓ navigates, Enter selects, Esc returns focus to search input
- [ ] Composer: Tab moves between fields; Enter in Textarea inserts newline (full-page) or sends (Sheet, depending on shift)
- [ ] All DropdownMenus / Popovers close on outside click + Esc
- [ ] Focus is visible on every interactive element (global focus ring)

### 5.5 Screen reader (NVDA / VoiceOver)

- [ ] NVDA (Windows): Overview view — all 4 StatCards announced with label + value + delta
- [ ] NVDA: Inbox — listbox semantics; "X of Y selected" announced
- [ ] NVDA: AI view — assistant replies announced via `aria-live`
- [ ] NVDA: Composer — char counter announces threshold transitions
- [ ] VoiceOver (macOS): Calendar — day cells announce date + post count
- [ ] VoiceOver: Pricing — toggle announces "Annual, selected" / "Monthly, selected"
- [ ] VoiceOver: Forms — all inputs have associated labels; errors announced

### 5.6 Reduced motion

- [ ] DevTools → Rendering → `prefers-reduced-motion: reduce` → all framer-motion animations disabled
- [ ] CSS keyframes (`.animate-float`, `.animate-marquee`, `.animate-pulse-ring`, `.animate-fade-up`) static
- [ ] Typing indicator dots in AI view static
- [ ] No animation-based content reveal that hides information from reduced-motion users

### 5.7 Empty / loading / error states

- [ ] **Empty:** every list view shows `EmptyState` when data is empty (Posts: no posts; Inbox: no open items; Media: no assets; Team: no members; Integrations: none connected)
- [ ] **Loading:** every async view shows `SkeletonGrid` or shimmer divs while `isLoading` (Analytics, Reports, Audience, Media, Inbox, Team, Integrations, Billing)
- [ ] **Error:** React Query `isError` shows an inline error card with a "Retry" button (verify each view)
- [ ] **API 500:** graceful toast on mutation failure; optimistic state rolls back
- [ ] **API timeout (10s+):** no double-submit; spinner stays visible
- [ ] **Network offline:** mutations queue? (currently they fail with toast — document this)

### 5.8 Toast feedback

- [ ] Every mutation fires a sonner toast (success + error variants)
- [ ] Toasts stack correctly (max 3 visible)
- [ ] Toasts auto-dismiss after ~4s; can be manually dismissed
- [ ] Toast position consistent (bottom-right by default)
- [ ] No toast spam (e.g. typing in inbox reply doesn't fire toasts)

### 5.9 Data integrity

- [ ] Creating a post → immediately visible in Queue + Calendar (same day)
- [ ] Deleting a post → immediately removed from Queue + Calendar + Overview "This week"
- [ ] Resolving an inbox item → Open count decrements; Resolved count increments
- [ ] Toggling an integration → Connected strip updates + grid status flips
- [ ] Inviting a team member → Pending invites table shows new row
- [ ] Removing a team member → roster row removed optimistically + toast
- [ ] Reloading the page → in-memory state resets (expected today; Phase 9 Postgres makes it persistent)

### 5.10 Error boundaries

- [ ] (Phase 9) `src/app/error.tsx` global error boundary shows a branded recovery page
- [ ] (Phase 9) `src/app/not-found.tsx` branded 404
- [ ] (Phase 9) Per-view error boundary so a single view crashing doesn't kill the whole dashboard
- [ ] (Phase 9) AI route errors don't crash the AI view (already graceful, but verify with network throttling + malformed responses)

---

## 6. Deployment Checklist

> Production readiness for Vercel (recommended) or self-hosted standalone.

### 6.1 Environment variables

- [ ] `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@host:5432/cadence?sslmode=require`)
- [ ] `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` — `https://cadence.app`
- [ ] `NEXTAUTH_DEBUG` — `false` in prod
- [ ] AI SDK credentials — per `z-ai-web-dev-sdk` docs (set in Vercel project settings)
- [ ] `SENTRY_DSN` — for `@sentry/nextjs`
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — `cadence.app` (if using Plausible)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` — (if using PostHog instead)
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — for rate limiting
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — for billing (Phase 9+)
- [ ] `RESEND_API_KEY` or `POSTMARK_API_KEY` — for transactional email (Phase 9+)
- [ ] All secrets stored in Vercel project settings (or AWS Secrets Manager for self-hosted); never committed

### 6.2 Database (SQLite → Postgres migration)

- [ ] Provision Postgres (Vercel Postgres, Neon, Supabase, or RDS)
- [ ] Update `prisma/schema.prisma` `datasource` to `provider = "postgresql"`
- [ ] Replace JSON-string arrays with native `String[]` (Postgres supports scalar lists) — `Post.platforms`, `Post.mediaIds`, `MediaAsset.tags`
- [ ] Convert string-status fields to Postgres enums: `PostStatus`, `Role`, `InboxType`, `InboxStatus`, `MediaKind`, `IntegrationCategory`, `CampaignStatus`, `NotificationKind`
- [ ] Run `prisma migrate dev --name postgres_init` against a fresh Postgres DB
- [ ] Write `prisma/seed.ts` that ports `src/lib/data/mock.ts` data into Postgres
- [ ] Run `bun run db:migrate` in CI against a staging DB
- [ ] Verify every API route works against Postgres (replace in-memory `store.*` calls with `prisma.*` calls — Epic 8.7.1)
- [ ] Add connection pooling (`pgBouncer` or Vercel's pooled URL) for serverless
- [ ] Daily automated backups (most managed Postgres providers include this)

### 6.3 Secrets

- [ ] `NEXTAUTH_SECRET` rotated quarterly
- [ ] AI SDK credentials rotated on provider schedule
- [ ] `STRIPE_WEBHOOK_SECRET` unique per environment (test/live)
- [ ] No `.env` file in git (`.gitignore` confirms)
- [ ] No secrets printed in server logs (audit `console.error` calls in `src/lib/ai.ts`)

### 6.4 Build

- [ ] `bun run build` succeeds on CI (GitHub Actions / Vercel build)
- [ ] `output: "standalone"` in `next.config.ts` (already set)
- [ ] Build script copies `.next/static` and `public/` into `.next/standalone/` (already in `package.json`)
- [ ] (Phase 9) Flip `typescript.ignoreBuildErrors` to `false` once type-clean
- [ ] (Phase 9) Flip `reactStrictMode` to `true` once double-effect bugs are resolved
- [ ] Build artifact size < 50 MB (standalone server + static)
- [ ] First-load JS < 250 KB on marketing route

### 6.5 Hosting

- [ ] **Vercel** (recommended): connect repo, set build command `bun run build`, set output dir (auto-detected), attach Postgres, configure env vars
- [ ] **Self-hosted fallback**: multi-stage Dockerfile (deps → build → runtime), push to GHCR, deploy to Fly.io / Render / ECS
- [ ] Health check endpoint: `GET /api/health` returns `{ status: "ok", ts: <iso> }`
- [ ] Graceful shutdown: SIGTERM drains in-flight requests (Node default + Vercel handles for serverless)
- [ ] Min instances: 1 (avoid cold starts on the marketing route)

### 6.6 CDN + image optimization

- [ ] Vercel Edge Network (default) or Cloudflare in front of self-hosted
- [ ] `next/image` enabled with `remotePatterns` allowlist for media asset hosts
- [ ] Cache headers: `Cache-Control: public, max-age=31536000, immutable` for `/_next/static/*`
- [ ] Cache headers: `no-store` for `/api/*` (except analytics which can be `max-age=60`)
- [ ] Static assets (logo SVG, fonts) served from Vercel CDN

### 6.7 Telemetry + monitoring

- [ ] `@sentry/nextjs` installed + configured (DSN env, source maps upload on build)
- [ ] Sentry alerts: new error > 5 events/min → Slack `#cadence-alerts`
- [ ] Sentry performance: trace every API route; sample rate 10% in prod, 100% in staging
- [ ] Structured logs: `pino` or `winston` with JSON output; logs shipped to Vercel logs / Logflare / Datadog
- [ ] Uptime monitoring: Better Stack / Uptime Robot pinging `https://cadence.app/api/health` every 60s
- [ ] Lighthouse CI on every PR against staging URL
- [ ] Web Vitals reporting via `next/web-vitals` → Sentry or Analytics

### 6.8 Analytics

- [ ] Vercel Analytics (privacy-friendly, no consent needed) — enable in project settings
- [ ] OR Plausible (self-hosted or cloud) — set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] Custom events: `sign_up`, `composer_open`, `post_schedule`, `post_publish`, `ai_chat_send`, `ai_caption_generate`, `plan_upgrade_click`, `integration_connect`
- [ ] No PII in analytics (email, post text, etc.)

### 6.9 Domain + DNS + SSL

- [ ] `cadence.app` registered (Namecheap / Route 53 / Porkbun)
- [ ] Apex `A` record → Vercel (or self-hosted LB IP)
- [ ] `www` CNAME → `cadence.app` (or Vercel's `cname.vercel-dns.com`)
- [ ] Vercel-managed TLS (auto-renew) or Let's Encrypt via Caddy (Caddyfile already in repo)
- [ ] HSTS: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (via `next.config.ts` `headers()`)
- [ ] HSTS preload list submission after 1 stable release

### 6.10 Rate limiting + CORS + security headers

- [ ] Rate limit `/api/ai/*` — 20 requests/min/user (token bucket in Upstash Redis)
- [ ] Rate limit write endpoints (`/api/posts`, `/api/media`, `/api/team`) — 60 requests/min/user
- [ ] Rate limit read endpoints — 300 requests/min/user
- [ ] `429` response includes `Retry-After` header
- [ ] CORS: only `https://cadence.app` and `http://localhost:3000` allowed for `/api/*`
- [ ] CSP header: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel.app https://*.sentry.io; frame-ancestors 'none'`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] CSRF: double-submit cookie + `X-CSRF-Token` header on mutations (or use next-auth's built-in CSRF)

### 6.11 Backup strategy

- [ ] Postgres: daily automated snapshots (Neon/Vercel/Supabase include this); 30-day retention
- [ ] Postgres: point-in-time recovery (PITR) enabled if provider supports
- [ ] Media assets: if stored on S3/R2, enable bucket versioning + 30-day lifecycle
- [ ] Configuration: all env vars documented in a sealed secrets store (1Password / Vault)
- [ ] Quarterly restore drill: restore latest backup to staging, verify integrity

### 6.12 Rollback plan

- [ ] **Vercel:** instant rollback to previous deployment from the dashboard (one click)
- [ ] **Self-hosted:** keep previous Docker image tagged; `kubectl rollout undo` or ECS task definition revert
- [ ] **Database migrations:** forward-only, backward-compatible (expand-then-contract):
  - Add new column (nullable) → deploy app that writes both old + new → backfill → deploy app that reads new → drop old column
  - Never run a destructive migration in the same deploy as a code change that depends on it
- [ ] **Feature flags:** LaunchDarkly or PostHog flags for risky features (real OAuth, queue worker, public API) so they can be turned off without redeploy
- [ ] **Runbook:** `RUNBOOK.md` in repo with on-call steps for: 500 spike, AI quota exhaustion, Postgres failover, Stripe webhook failure, Sentry alert triage

---

## 7. Architecture Reference

### 7.1 Folder structure (actual `src/` layout)

```
cadence/
├─ prisma/
│  └─ schema.prisma              # 15 models, SQLite today → Postgres Phase 9
├─ public/
│  ├─ logo.svg
│  └─ robots.txt
├─ db/
│  └─ custom.db                  # SQLite dev database
├─ agent-ctx/                    # Per-task context docs (not shipped)
│  ├─ 2-a-marketing-site.md
│  ├─ 3-a-publishing-cluster.md
│  ├─ 3-b-insights-views.md
│  └─ 3-c-workspace-cluster.md
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # Root layout: Geist fonts, Metadata, Providers, Toaster
│  │  ├─ page.tsx                # Single user-facing route; hash sync + lazy Marketing/Dashboard
│  │  ├─ globals.css             # Design tokens (OKLCH), custom utilities, keyframes, reduced-motion
│  │  └─ api/
│  │     ├─ route.ts             # Health check (root)
│  │     ├─ posts/
│  │     │  ├─ route.ts          # GET (list), POST (create)
│  │     │  └─ [id]/route.ts     # PATCH (update), DELETE
│  │     ├─ analytics/route.ts   # GET analytics aggregate
│  │     ├─ media/route.ts       # GET (list), POST (create)
│  │     ├─ accounts/route.ts    # GET connected social accounts
│  │     ├─ inbox/route.ts       # GET list, PATCH resolve
│  │     ├─ team/route.ts        # GET roster, POST invite
│  │     ├─ integrations/route.ts# GET list, PATCH toggle
│  │     ├─ activity/route.ts    # GET activity feed
│  │     ├─ campaigns/route.ts   # GET campaigns
│  │     └─ ai/
│  │        ├─ chat/route.ts     # POST multi-turn chat (z-ai-web-dev-sdk)
│  │        └─ captions/route.ts # POST caption generation
│  ├─ components/
│  │  ├─ providers.tsx           # next-themes + React Query + sonner + tooltip
│  │  ├─ brand/
│  │  │  ├─ logo.tsx             # Logo, LogoMark
│  │  │  └─ platform-icon.tsx    # PlatformIcon, PlatformBadge (8 platforms)
│  │  ├─ marketing/
│  │  │  ├─ marketing-site.tsx   # Composition root
│  │  │  ├─ site-header.tsx
│  │  │  ├─ site-footer.tsx
│  │  │  └─ sections/
│  │  │     ├─ hero.tsx
│  │  │     ├─ logos.tsx
│  │  │     ├─ features.tsx
│  │  │     ├─ how-it-works.tsx
│  │  │     ├─ channels.tsx
│  │  │     ├─ analytics-showcase.tsx
│  │  │     ├─ ai-section.tsx
│  │  │     ├─ testimonials.tsx
│  │  │     ├─ pricing.tsx       # Monthly/Annual toggle, framer-motion layoutId
│  │  │     ├─ faq.tsx
│  │  │     └─ cta.tsx
│  │  ├─ dashboard/
│  │  │  ├─ dashboard-app.tsx    # Shell: Sidebar + Topbar + main + Composer Sheet + Command Palette
│  │  │  ├─ sidebar.tsx          # Custom aside, 4 nav groups, ⌘B toggle, workspace switcher
│  │  │  ├─ topbar.tsx           # Sticky glass, ⌘K trigger, Queue KPI, Create post
│  │  │  ├─ command-palette.tsx  # ⌘K CommandDialog: Navigate / Actions / Posts
│  │  │  ├─ composer.tsx         # Global Composer Sheet (quick capture)
│  │  │  ├─ shared.tsx           # 12 shared primitives + helpers (see §7.5)
│  │  │  └─ views/
│  │  │     ├─ overview.tsx
│  │  │     ├─ calendar.tsx
│  │  │     ├─ composer.tsx      # Full-page Composer (3-region grid)
│  │  │     ├─ queue.tsx
│  │  │     ├─ analytics.tsx
│  │  │     ├─ reports.tsx
│  │  │     ├─ audience.tsx
│  │  │     ├─ media.tsx
│  │  │     ├─ ai.tsx
│  │  │     ├─ inbox.tsx
│  │  │     ├─ settings.tsx
│  │  │     ├─ integrations.tsx
│  │  │     ├─ billing.tsx
│  │  │     ├─ team.tsx
│  │  │     └─ _placeholder.tsx  # Generic placeholder + 13 variants (retained, unused by live router)
│  │  └─ ui/                     # 40+ shadcn/ui primitives (Radix-based)
│  │     ├─ accordion.tsx
│  │     ├─ alert-dialog.tsx
│  │     ├─ alert.tsx
│  │     ├─ aspect-ratio.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ breadcrumb.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ chart.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ collapsible.tsx
│  │     ├─ command.tsx
│  │     ├─ context-menu.tsx
│  │     ├─ dialog.tsx
│  │     ├─ drawer.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ hover-card.tsx
│  │     ├─ input-otp.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ menubar.tsx
│  │     ├─ navigation-menu.tsx
│  │     ├─ pagination.tsx
│  │     ├─ popover.tsx
│  │     ├─ progress.tsx
│  │     ├─ radio-group.tsx
│  │     ├─ resizable.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ sheet.tsx
│  │     ├─ sidebar.tsx          # shadcn sidebar (unused — Cadence uses custom)
│  │     ├─ skeleton.tsx
│  │     ├─ slider.tsx
│  │     ├─ sonner.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     ├─ toast.tsx
│  │     ├─ toaster.tsx
│  │     ├─ toggle-group.tsx
│  │     ├─ toggle.tsx
│  │     └─ tooltip.tsx
│  ├─ hooks/
│  │  ├─ use-api.ts              # 17 React Query hooks
│  │  ├─ use-mobile.ts           # useIsMobile (breakpoint hook)
│  │  └─ use-toast.ts            # Legacy toast hook (sonner preferred)
│  └─ lib/
│     ├─ ai.ts                   # server-only z-ai-web-dev-sdk wrapper
│     ├─ brand.ts                # BRAND, PLATFORMS, MARKETING_NAV, FOOTER_COLUMNS
│     ├─ db.ts                   # Prisma client singleton
│     ├─ store.ts                # Zustand view router + hash deep-linking
│     ├─ ui-store.ts             # UI-only flags
│     ├─ types.ts                # Domain types
│     ├─ utils.ts                # cn() helper
│     └─ data/
│        ├─ mock.ts              # Deterministic seed (42 posts, 12 media, 8 accounts, ...)
│        └─ store.ts             # In-memory CRUD singleton (used by all API routes today)
├─ next.config.ts                # output: "standalone"
├─ tailwind.config.ts            # Tailwind v4 (mostly CSS-first)
├─ postcss.config.mjs
├─ tsconfig.json
├─ eslint.config.mjs
├─ components.json               # shadcn/ui config
├─ Caddyfile                     # Optional reverse proxy with auto-TLS
└─ package.json
```

### 7.2 Data flow

```
User (browser)
  │
  │  React component
  ▼
Zustand store (src/lib/store.ts)
  - route: "marketing" | "app"
  - view: AppView (14 values)
  - composerOpen / composerPostId
  - sidebarCollapsed / mobileNavOpen / commandOpen
  - Hash deep-linking (#app/<view>) via syncHashFromState() / readStateFromHash()
  │
  │  useApp((s) => s.setView) etc.
  ▼
React Query hooks (src/hooks/use-api.ts)        ←  client-side cache + invalidation
  - usePosts, useCreatePost, useUpdatePost, useDeletePost
  - useAnalytics, useMedia, useAccounts, useInbox, useResolveInbox
  - useTeam, useInviteMember, useIntegrations, useToggleIntegration
  - useActivity, useCampaigns
  - useAiChat, useGenerateCaptions
  │
  │  fetch() to /api/*
  ▼
Next.js Route Handlers (src/app/api/*)
  - Input validation (ad-hoc today → Zod contracts in Phase 9)
  - (Phase 9) session.user.id + active workspaceId scoping
  │
  ├─ Most routes → In-memory store (src/lib/data/store.ts)
  │    - Singleton seeded from src/lib/data/mock.ts on first access
  │    - CRUD: createPost, updatePost, deletePost, resolveInbox, toggleIntegration, ...
  │    - (Phase 9) Replaced by Prisma calls (src/lib/db.ts) for persistence
  │
  └─ /api/ai/* → src/lib/ai.ts (server-only)
       - cadenceChat(history, message) → z-ai-web-dev-sdk chat.completions.create
       - generateCaptions({ topic, platforms, tone, count }) → z-ai-web-dev-sdk
       - 8-turn history window + CADENCE_SYSTEM prompt
       - Graceful fallbacks on SDK error
```

### 7.3 State management

Cadence uses **two complementary state systems** by design — one for client
UI state, one for server state:

- **Client UI state — Zustand** (`src/lib/store.ts`)
  - Single source of truth for: which route (marketing vs. app), which view
    (`AppView`), composer open + edit-id, sidebar collapse, mobile nav open,
    command palette open.
  - Hash deep-linking: `syncHashFromState()` writes `#app/<view>` whenever
    the route/view changes; `readStateFromHash()` parses incoming hash
    changes (browser back/forward, direct link, refresh) and updates the
    store.
  - No React Context — Zustand's `useApp(selector)` hook is the only
    consumer API. Selectors prevent unnecessary re-renders.

- **Server state — TanStack React Query** (`src/hooks/use-api.ts`)
  - 17 hooks cover every API endpoint.
  - Query keys are stable factory tuples (`['posts', { status, platform }]`).
  - Mutations invalidate the right keys (e.g. `useCreatePost` invalidates
    `['posts']`).
  - Optimistic updates on `useDeletePost`, `useResolveInbox`,
    `useToggleIntegration`, and team removal — all with `onError` rollback.

- **Why not one system?** Zustand is for ephemeral UI state (which view am
  I on, is the sidebar collapsed). React Query is for cached server state
  (posts, analytics, team). Mixing them would either re-fetch on every
  view switch (bad) or persist transient UI state to the cache (also bad).
  The two-system split is intentional and matches industry best practice
  for SPA-style apps on Next.js App Router.

### 7.4 Single-route SPA pattern with hash deep-linking

Cadence ships as a **single user-facing route**: `/`. The root page
(`src/app/page.tsx`) is a client component that:

1. Reads `route` and `view` from the Zustand store.
2. Lazy-loads either `MarketingSite` or `DashboardApp` based on `route`
   (React `lazy()` + `Suspense` with a branded `FullScreenLoader`).
3. On mount, calls `readStateFromHash()` and reconciles the store with the
   URL hash (e.g. `/#app/analytics` → store `{ route: 'app', view: 'analytics' }`).
4. Listens for `hashchange` events (browser back/forward) and updates the
   store.
5. On every store `route`/`view` change, calls `syncHashFromState()` to
   write the new hash to the URL without a page reload
   (`window.history.replaceState`).

**Why this pattern?**
- The dashboard is a stateful SPA (sidebar, composer, command palette,
  toasts) — wrapping it in Next.js's file-based router would lose the
  "instant view switch" feel.
- Marketing and dashboard share the same Next.js bundle (single deploy).
- Hash-based deep-linking means `/#app/analytics` is a stable shareable
  URL — refresh-safe and back-button-safe.
- SEO is unaffected because the marketing site is the default route and
  renders server-side (lazy-loading the dashboard only after
  `route === 'app'`).

**Hash contract:** `#app/<view>` where `<view>` is one of the 14 `AppView`
values. An invalid view name falls back to `overview`. Empty hash (or
`#marketing`) renders the marketing site.

### 7.5 Shared-primitives contract (`src/components/dashboard/shared.tsx`)

Every dashboard view consumes these primitives. They are the design-system
"vocabulary" for the dashboard.

| Primitive | Signature | Purpose |
| --- | --- | --- |
| `PageHeader` | `({ title, description?, actions?, className? })` | Consistent view header; `<h1>` title; `actions` is a flex row on the right. |
| `StatCard` | `({ label, value, delta?, deltaLabel?, icon?, accent?, spark? })` | KPI card; `delta` (positive=mint, negative=destructive); `icon` in tinted swatch; `spark: number[]` → MiniSparkline. |
| `SectionCard` | `({ title?, description?, actions?, children?, className?, bodyClassName? })` | Titled card wrapper for grouped content. Header omitted if no title/description/actions. `bodyClassName` defaults to `p-5`. |
| `StatusBadge` | `({ status })` | Colored Badge for PostStatus (draft=muted, scheduled=primary, published=mint, failed=destructive, in-review=amber). |
| `PostCard` | `({ post })` | Compact post row: platform badges (stacked, +N overflow), 2-line snippet, time, StatusBadge, kebab DropdownMenu with Edit/Duplicate/Delete. Mutations fire sonner toasts. |
| `EmptyState` | `({ icon?, title, description?, action?, className? })` | Dashed-border empty state with optional icon swatch + CTA. |
| `SkeletonGrid` | `({ count = 3, className? })` | Grid of shimmer cards (uses `.shimmer` from `globals.css`). |
| `Avatar` | `({ name, color?, size?, className? })` | Gradient-initials avatar built on shadcn `<Avatar>`. `color` is a tailwind gradient class string. **Distinct from** `@/components/ui/avatar` — disambiguate by import path. |
| `MiniSparkline` | `({ data: number[], color?, className? })` | Tiny inline recharts LineChart (no axes). Returns null if data has fewer than 2 points. |
| `MiniArea` | `({ data, dataKey, color?, height?, formatX? })` | Small recharts AreaChart helper with gradient fill. |
| `DonutChart` | `({ data: { name, value, color }[], height?, innerRadius?, outerRadius? })` | recharts PieChart donut. Per-slice `color` should be a CSS color. |
| `Toolbar` | `({ children?, trailing?, className? })` | Horizontal bar with leading filters and trailing actions. |

Helpers: `formatCompact(n)` (Intl compact: 12.4K, 1.2M), `formatDate(date, pattern?)` (date-fns wrapper), `PLATFORMS` (re-exported from `@/lib/brand`).

**Conventions:**
- Always wrap view content in `<div className="space-y-6">` and start with `<PageHeader .../>`.
- Use `<SectionCard>` for grouped content; `<StatCard>` for KPIs; `<PostCard>` for post rows.
- Use `<EmptyState>` + `<SkeletonGrid>` for loading/empty states.
- Render notifications via `sonner`'s `toast` — do not introduce a second toast system.
- Read view with `useApp((s) => s.view)`; switch with `setView`. Do NOT introduce a second router.
- Open composer with `useApp((s) => s.openComposer)` (optionally with a post id).

### 7.6 AI integration (z-ai-web-dev-sdk, server-only)

`src/lib/ai.ts` is the single entry point for the AI SDK:

```ts
import "server-only";
import ZAI from "z-ai-web-dev-sdk";

let zaiPromise: Promise<InstanceType<typeof ZAI>> | null = null;
async function getZai() {
  if (!zaiPromise) zaiPromise = ZAI.create();
  return zaiPromise;
}

export async function cadenceChat(history: ChatTurn[], message: string): Promise<string> {
  // 1. Compose messages: CADENCE_SYSTEM + last 8 history turns + new user message
  // 2. zai.chat.completions.create({ messages, thinking: { type: "disabled" } })
  // 3. Return completion.choices[0].message.content
  // 4. try/catch with console.error; rethrow so route handler can convert to 500
}

export async function generateCaptions(opts): Promise<string[]> {
  // 1. Compose prompt: "{count} distinct captions about '{topic}', tone: {tone}, optimize for: {platforms}, <220 chars, 2-4 hashtags, numbered 1..N"
  // 2. zai.chat.completions.create(...)
  // 3. Parse numbered response into array (split on /\n(?=\d+[.)]\s)/, strip prefixes)
  // 4. Return array (empty on SDK error — graceful fallback)
}
```

**Two route handlers consume it:**
- `POST /api/ai/chat` — body `{ history: ChatTurn[], message: string }` → returns `{ reply: string }`. Used by `useAiChat` in the AI view's chat thread.
- `POST /api/ai/captions` — body `{ topic, platforms, tone, count }` → returns `{ captions: string[] }`. Used by `useGenerateCaptions` in both the full-page Composer (AI captions button) and the AI view's Caption Generator rail.

**Safety properties:**
- `import "server-only"` prevents accidental client bundling.
- 8-turn history window bounds cost.
- `thinking: { type: "disabled" }` keeps responses fast and on-task.
- `CADENCE_SYSTEM` prompt constrains the model to the social-media domain
  and enforces character limits per platform.
- Graceful fallbacks: `cadenceChat` rethrows (route returns 500 with a
  friendly message); `generateCaptions` returns `[]` (UI shows "try again"
  empty state).

**Phase 9 enhancements:**
- Streaming responses via `ReadableStream` so the typing indicator reflects real tokens.
- Per-user daily quota (Postgres counter, reset at 00:00 UTC).
- Max output tokens enforced.
- Prompt-injection guard (basic regex + length cap on user input).

### 7.7 Design-token system

All design tokens live in `src/app/globals.css` as CSS custom properties in
OKLCH color space. Tailwind v4 reads them via `@theme` mappings.

**Brand palette:**
- `--primary` — deep teal (`oklch(0.55 0.13 195)`)
- `--coral` — warm coral accent
- `--amber-brand` — amber accent (named with `-brand` to avoid Tailwind's default `--amber`)
- `--mint` — mint accent
- `--plum` — plum accent

**Semantic tokens (light + dark):**
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

**Custom utilities** (in `@layer utilities`):
- `.scrollbar-cadence` — thin, themed scrollbar
- `.text-gradient-brand` — `bg-clip-text` with brand gradient
- `.bg-grid`, `.bg-dots` — decorative background patterns
- `.glass` — backdrop-blur + translucent background
- `.shimmer` — animated gradient for skeletons
- `.mask-fade-x`, `.mask-fade-b` — mask-image fades

**Keyframes** (with `@media (prefers-reduced-motion: reduce)` overrides):
- `animate-fade-up`, `animate-float`, `animate-marquee`, `animate-pulse-ring`

**Conventions:**
- Never use raw indigo/blue as brand colors (teal/coral/amber/mint/plum only).
- Decorative gradients (AI avatar, CTA band, plan tile, payment icon, logo tile) are the only intentional exceptions to the semantic-token rule.
- Every chart adapts to dark mode via `color-mix(in oklch, var(--primary) X%, transparent)` or per-slice CSS colors.

---

## 8. Roadmap (Post-MVP)

Prioritized by user impact × engineering leverage. **Now** = next 2–4 weeks
(Phase 9). **Next** = 1–2 quarters. **Later** = 2+ quarters.

### 8.1 Now (Phase 9 — ship to production)

| # | Initiative | Why now | Effort |
| --- | --- | --- | --- |
| 1 | **Postgres migration** | SQLite can't scale beyond a single process; multi-instance deploys need a real DB | M |
| 2 | **NextAuth bootstrap** (Credentials + GitHub + Google) | No auth today; can't ship to real users | M |
| 3 | **Persistence migration** (replace in-memory `store.*` with `prisma.*`) | In-memory state resets on every deploy/restart | L |
| 4 | **Workspace scoping** (every API route reads `session.user.id` → active workspace) | Today every route is global; multi-tenant safety | M |
| 5 | **Test pyramid** (Vitest unit/integration + Playwright E2E + axe a11y + visual regression) | Zero tests today; no safety net for the above changes | L |
| 6 | **Sentry + uptime monitoring + structured logs** | Can't operate what we can't see | S |
| 7 | **Security headers + CSRF + rate limiting on `/api/ai/*`** | AI endpoints are the costliest attack surface | S |
| 8 | **Stripe billing integration** (replace mock billing dialogs with real checkout + webhook) | Billing view is mock today; can't collect money | L |
| 9 | **CI pipeline** (lint → typecheck → unit → e2e → a11y → Lighthouse on every PR) | Manual QA doesn't scale | M |
| 10 | **Deploy to Vercel + domain + DNS + SSL** | Ship it | S |

### 8.2 Next (1–2 quarters)

| # | Initiative | Why | Effort |
| --- | --- | --- | --- |
| 11 | **Real OAuth social account connection** (X, LinkedIn, Instagram, Facebook, TikTok, YouTube, Threads, Pinterest) | Today accounts are mock; users can't actually publish | XL |
| 12 | **Real publishing webhooks** (per-platform publish callbacks → update Post.status + metrics) | Closes the loop: schedule → publish → measure | L |
| 13 | **Background jobs / queue worker** (BullMQ on Redis or Inngest) | Scheduled posts need to fire at the right time without a request | L |
| 14 | **Email notifications** (Resend/Postmark) | "Post published", "Comment received", "Weekly report", "Invite received" | M |
| 15 | **Multi-workspace** (user belongs to multiple workspaces; switcher in sidebar) | Today a user has implicit single-workspace; agencies need many | M |
| 16 | **RBAC enforcement** (replace decorative permissions matrix with real middleware) | Today every member can do everything | M |
| 17 | **Audit logs UI** (Prisma `AuditLog` model exists; surface as a view) | Compliance + debugging | S |
| 18 | **Full-text search** (Postgres `tsvector` or Meilisearch) across posts, media, inbox | Search is local + per-view today; users want global search | M |
| 19 | **Streaming AI responses** (SSE/ReadableStream) | Typing indicator today is fake; real tokens feel magical | S |
| 20 | **AI per-user quota + cost dashboard** | AI is expensive; need per-user limits + visibility | M |

### 8.3 Later (2+ quarters)

| # | Initiative | Why | Effort |
| --- | --- | --- | --- |
| 21 | **Public API + webhooks** (REST + signed webhooks for `post.published`, `inbox.received`) | Power users + Zapier/Make integrations | L |
| 22 | **SSO/SAML** (for Enterprise plan) | Enterprise buyers require it | M |
| 23 | **Mobile app** (React Native / Expo, sharing the API) | On-the-go scheduling + inbox | XL |
| 24 | **Approval workflows** (multi-step: draft → review → approve → schedule) | Today `in-review` status is decorative; agencies need real flows | L |
| 25 | **Content pillars + AI content calendar generation** | AI suggests a 30-day calendar from a brief | M |
| 26 | **Competitor benchmarks** (track competitor accounts; show in Audience view) | Already mocked in the "coming-next" card | L |
| 27 | **Sentiment analysis** on inbox items | Auto-tag positive/negative/neutral for triage | M |
| 28 | **A/B caption testing** (publish two variants; AI picks the winner) | Power feature for paid plans | L |
| 29 | **White-label / custom branding** (Enterprise) | Agencies resell Cadence under their brand | L |
| 30 | **Marketplace** (community templates, integrations, AI prompt packs) | Platform play; long-term moat | XL |

### 8.4 Explicit non-goals (for clarity)

- **Not building a CRM.** Inbox is for social engagement, not sales pipelines.
- **Not building a design tool.** Media Library stores assets; Canva/Figma stay external.
- **Not building a video editor.** TikTok/YouTube uploads are pass-through.
- **Not building an ad manager.** Organic social only for v1; paid social is a separate product surface if ever.
- **Not supporting self-hosted open-source.** Cadence is a commercial SaaS; the codebase is proprietary.

---

## Appendix A — File Inventory

### A.1 Application code (`src/`)

| Path | Lines (approx) | Role |
| --- | --- | --- |
| `src/app/layout.tsx` | 70 | Root layout: Geist fonts, Metadata, Providers, Toaster |
| `src/app/page.tsx` | 64 | Single user-facing route; hash sync + lazy Marketing/Dashboard |
| `src/app/globals.css` | ~600 | Design tokens, custom utilities, keyframes, reduced-motion |
| `src/app/api/route.ts` | ~10 | Health check |
| `src/app/api/posts/route.ts` | ~80 | GET list, POST create |
| `src/app/api/posts/[id]/route.ts` | ~60 | PATCH update, DELETE |
| `src/app/api/analytics/route.ts` | ~40 | GET aggregate |
| `src/app/api/media/route.ts` | ~60 | GET list, POST create |
| `src/app/api/accounts/route.ts` | ~20 | GET connected accounts |
| `src/app/api/inbox/route.ts` | ~50 | GET list, PATCH resolve |
| `src/app/api/team/route.ts` | ~50 | GET roster, POST invite |
| `src/app/api/integrations/route.ts` | ~50 | GET list, PATCH toggle |
| `src/app/api/activity/route.ts` | ~20 | GET activity feed |
| `src/app/api/campaigns/route.ts` | ~20 | GET campaigns |
| `src/app/api/ai/chat/route.ts` | ~40 | POST multi-turn chat |
| `src/app/api/ai/captions/route.ts` | ~40 | POST caption generation |
| `src/components/providers.tsx` | ~30 | next-themes + RQ + sonner + tooltip |
| `src/components/brand/logo.tsx` | ~80 | Logo, LogoMark |
| `src/components/brand/platform-icon.tsx` | ~200 | PlatformIcon, PlatformBadge (8 platforms) |
| `src/components/marketing/marketing-site.tsx` | ~60 | Composition root |
| `src/components/marketing/site-header.tsx` | ~150 | Sticky glass header |
| `src/components/marketing/site-footer.tsx` | ~120 | Footer with newsletter + link columns |
| `src/components/marketing/sections/*.tsx` | 11 × ~100–200 | 11 marketing sections |
| `src/components/dashboard/dashboard-app.tsx` | ~120 | Shell + VIEW_COMPONENTS record |
| `src/components/dashboard/sidebar.tsx` | ~280 | Custom aside, 4 nav groups |
| `src/components/dashboard/topbar.tsx` | ~200 | Sticky glass topbar |
| `src/components/dashboard/command-palette.tsx` | ~180 | ⌘K CommandDialog |
| `src/components/dashboard/composer.tsx` | ~400 | Global Composer Sheet |
| `src/components/dashboard/shared.tsx` | ~500 | 12 shared primitives + helpers |
| `src/components/dashboard/views/overview.tsx` | ~400 | Overview dashboard |
| `src/components/dashboard/views/calendar.tsx` | ~982 | Month/Week/List |
| `src/components/dashboard/views/composer.tsx` | ~1543 | Full-page Composer |
| `src/components/dashboard/views/queue.tsx` | ~588 | Status Tabs + queue health rail |
| `src/components/dashboard/views/analytics.tsx` | ~900 | KPI + metric toggle + donut + table + top posts |
| `src/components/dashboard/views/reports.tsx` | ~700 | Templates + scheduled + recent + preview |
| `src/components/dashboard/views/audience.tsx` | ~800 | Growth + donut + demographics + heatmap |
| `src/components/dashboard/views/media.tsx` | ~1089 | Grid + list + multi-select + upload |
| `src/components/dashboard/views/ai.tsx` | ~790 | 3-column chat + caption generator |
| `src/components/dashboard/views/inbox.tsx` | ~771 | Two-pane listbox + detail |
| `src/components/dashboard/views/settings.tsx` | ~1051 | 7-tab vertical Tabs |
| `src/components/dashboard/views/integrations.tsx` | ~581 | Category filter + grid + configure |
| `src/components/dashboard/views/billing.tsx` | ~683 | Plan + usage + invoices + dialogs |
| `src/components/dashboard/views/team.tsx` | ~808 | Roster + invite + permissions matrix |
| `src/components/dashboard/views/_placeholder.tsx` | ~200 | Generic placeholder + 13 variants (retained) |
| `src/components/ui/*.tsx` | 40+ files | shadcn/ui primitives |
| `src/hooks/use-api.ts` | ~350 | 17 React Query hooks |
| `src/hooks/use-mobile.ts` | ~15 | useIsMobile |
| `src/hooks/use-toast.ts` | ~50 | Legacy toast hook (sonner preferred) |
| `src/lib/ai.ts` | ~85 | z-ai-web-dev-sdk wrapper (server-only) |
| `src/lib/brand.ts` | ~107 | BRAND, PLATFORMS, MARKETING_NAV, FOOTER_COLUMNS |
| `src/lib/db.ts` | ~15 | Prisma client singleton |
| `src/lib/store.ts` | ~83 | Zustand view router + hash deep-linking |
| `src/lib/ui-store.ts` | ~30 | UI-only flags |
| `src/lib/types.ts` | ~200 | Domain types |
| `src/lib/utils.ts` | ~15 | cn() helper |
| `src/lib/data/mock.ts` | ~800 | Deterministic seed |
| `src/lib/data/store.ts` | ~250 | In-memory CRUD singleton |

### A.2 Project config

| Path | Role |
| --- | --- |
| `next.config.ts` | `output: "standalone"`, `typescript.ignoreBuildErrors: true` (Phase 9: flip to false), `reactStrictMode: false` (Phase 9: flip to true) |
| `tailwind.config.ts` | Tailwind v4 (mostly CSS-first) |
| `postcss.config.mjs` | `@tailwindcss/postcss` |
| `tsconfig.json` | TypeScript strict, `@/*` path alias |
| `eslint.config.mjs` | ESLint 9 + `eslint-config-next` |
| `components.json` | shadcn/ui config |
| `prisma/schema.prisma` | 15 models, SQLite today → Postgres Phase 9 |
| `Caddyfile` | Optional reverse proxy with auto-TLS |
| `package.json` | Bun scripts: dev, build, start, lint, db:push, db:generate, db:migrate, db:reset |

### A.3 Context docs (`agent-ctx/`)

| Path | Role |
| --- | --- |
| `2-a-marketing-site.md` | Marketing site conventions (sticky footer, single-route, theme toggle, toasts, visuals, framer-motion, accessibility) |
| `3-a-publishing-cluster.md` | Calendar / Queue / full-page Composer conventions |
| `3-b-insights-views.md` | Analytics / Reports / Audience conventions (per-platform donut color map) |
| `3-c-workspace-cluster.md` | Inbox / Media / AI / Settings / Integrations / Billing / Team conventions |

---

## Appendix B — Glossary

| Term | Definition |
| --- | --- |
| **AppView** | Union of 14 dashboard view identifiers: `overview`, `calendar`, `composer`, `queue`, `analytics`, `reports`, `audience`, `media`, `ai`, `inbox`, `settings`, `integrations`, `billing`, `team`. |
| **Route** | Top-level app surface: `marketing` (the public site) or `app` (the dashboard). Stored in the Zustand store. |
| **Hash deep-linking** | URL hash pattern `#app/<view>` that lets users deep-link directly to a dashboard view. Parsed by `readStateFromHash()`; written by `syncHashFromState()`. |
| **VIEW_COMPONENTS** | Static record in `dashboard-app.tsx` mapping each `AppView` to its React component. Adding a view = adding one entry + one file in `views/`. |
| **Shared primitives** | The 12 components + helpers exported from `src/components/dashboard/shared.tsx`. The dashboard design-system vocabulary. |
| **In-memory store** | Singleton `store` in `src/lib/data/store.ts` that backs every API route today. Seeded from `mock.ts`. Phase 9 replaces with Prisma + Postgres. |
| **Composer (Sheet)** | The global quick-capture composer in `src/components/dashboard/composer.tsx`. Opens from topbar / command palette / PostCard edit. |
| **Composer (full-page)** | The full-page composer view in `src/components/dashboard/views/composer.tsx`. 3-region grid with platform + scheduling + editor + live preview. |
| **z-ai-web-dev-sdk** | The AI SDK wrapped by `src/lib/ai.ts`. Server-only. Powers `/api/ai/chat` and `/api/ai/captions`. |
| **CADENCE_SYSTEM** | The system prompt that constrains the AI assistant to the social-media domain and enforces character limits per platform. |
| **Sticky footer rule** | Every page with a footer MUST use a root wrapper with `min-h-screen flex flex-col` and `mt-auto` on the footer so it sticks to the bottom on short content. |
| **Single-route app** | Cadence's architectural choice to ship the entire product from one Next.js route (`/`) with hash-based view switching, rather than one file-based route per view. |
| **Sonner** | The toast library used for all mutation feedback. The only toast system in the app — introducing a second is forbidden. |
| **Brand accent tokens** | The 5 brand colors: `--primary` (deep teal), `--coral`, `--amber-brand`, `--mint`, `--plum`. Exposed as Tailwind classes `text-primary`, `text-coral`, `text-mint`, `text-amber-brand`, `text-plum`. |
| **Expand-then-contract** | Database migration strategy: add the new shape (nullable) → deploy app that writes both → backfill → deploy app that reads new → drop old. Enables zero-downtime migrations. |
| **Golden path** | A user journey that exercises the core value proposition end-to-end (e.g. "Create post via composer → appears in queue"). The E2E test suite covers all golden paths. |

---

**End of Phase 9 Implementation Plan.**

For questions, ping the Principal Architect in `#cadence-eng`. For
emergencies, see `RUNBOOK.md` (to be written in Phase 9).
