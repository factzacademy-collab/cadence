# Task 3-a — Publishing cluster (calendar, queue, composer full-page views)

Agent: Staff Frontend Engineer
Task ID: 3-a
Scope: Replace three placeholder view files for the Cadence "publishing cluster":
- `src/components/dashboard/views/calendar.tsx`
- `src/components/dashboard/views/queue.tsx`
- `src/components/dashboard/views/composer.tsx`

## What was built

### 1. Calendar view (`calendar.tsx`)
- **View toggle** (Month / Week / List) using shadcn `ToggleGroup`. Default: Month.
- **Month grid**: 7-column Mon–Sun layout from `date-fns` (`startOfMonth`,
  `endOfMonth`, `eachDayOfInterval`, `startOfWeek`, `endOfWeek`, `isSameMonth`,
  `isToday`). Each day is a `<button>` (aria-label includes date + post count)
  with day number, up to 3 stacked post chips (platform badge + time +
  truncated text + status dot), and a "+N more" `Popover` listing all posts
  for that day. Out-of-month days are dimmed. Min-height 112px, scrolls
  horizontally on small screens (`min-w-[720px]` + `overflow-x-auto
  scrollbar-cadence`). Clicking a day calls `openComposer()`; clicking a
  chip calls `openComposer(post.id)`.
- **Week view**: 7 day columns side-by-side, each listing time-sorted post
  cards with platform badge + time + status dot + truncated text, plus an
  inline "+ Add post" button per day. Empty days show a dashed "Add post"
  affordance.
- **List view**: groups posts by Today / Tomorrow / This week / Later
  (`isToday`, `isTomorrow`, `isThisWeek`, `differenceInCalendarDays`) using
  `SectionCard` + `PostCard`.
- **Toolbar** (shared `Toolbar` primitive): prev / today / next month/week
  nav, platform multi-select `Popover` with `Checkbox`es, campaign
  `Select`, view toggle, "Create post" button.
- **Legend**: status color legend (Scheduled / Published / In review /
  Draft / Failed).
- Posts come from `usePosts()` filtered client-side by visible date range +
  selected platforms + campaign. All statuses visible (color via status
  dot).
- Loading skeleton grid + `EmptyState` for the empty cases.
- Accessible: day cells are buttons, post chips have aria-labels, all
  interactive elements have focus rings.

### 2. Queue view (`queue.tsx`)
- **Tabs by status**: Scheduled / Drafts / In review / Failed / Published
  (with count `Badge`s). Default: Scheduled. Uses `usePosts()` (single
  fetch, all posts; status filtering client-side) so the rail can compute
  health stats without extra round-trips.
- **Scheduled tab**: posts grouped by day into `SectionCard`s (Today /
  Tomorrow / "Wed · MMM d" / "EEE, MMM d") with sorted `PostCard`s
  inside. Day group label includes a colored dot (primary for upcoming,
  muted for past).
- **Failed tab**: destructive `Alert` banner ("N posts failed to publish")
  with "Retry all" + "View log" actions (toast feedback).
- **Drafts / In review / Published**: flat `PostCard` lists inside a
  single `SectionCard`.
- **Toolbar**: platform filter chips (with per-platform counts for the
  active tab), search input with clear button (filters by text +
  platform id), sort `Select` (Time / Recently added), "Create" button.
- **Right rail** (`lg:sticky lg:top-4`): "Queue health" — 3 `StatCard`s
  (Scheduled this week, Avg posts/day over next 7 days, In queue) + a
  "Next publish" `SectionCard` showing the closest scheduled post with an
  Edit button. Collapses to top of single column on mobile.
- Loading skeleton + per-tab `EmptyState` (with appropriate copy + icon
  per tab).
- Responsive: single column mobile, two-column (list + rail) on `lg+`.

### 3. Full-page Composer (`composer.tsx`)
- **Layout (desktop)**: 3-region grid
  `[300px | minmax(0,1fr) | minmax(360px,420px)]` — left = platform +
  scheduling panel (sticky), center = editor, right = live preview
  (sticky). Mobile: stacked with a `Tabs` to switch Compose / Preview.
- **Editor**: large `Textarea` with a floating toolbar (Bold, Italic,
  Emoji `Popover` picker, Hashtag `Popover` inserter — all decorative or
  text-inserting), character counter that drives off the most restrictive
  selected platform (`Math.min` of `PLATFORM_LIMITS` for selected
  platforms). Counter color: muted normally, amber-brand within 10% of
  limit, destructive over limit. Per-platform limit badges below the
  textarea (X=280, IG=2200, LI=3000, etc.) with over-limit color.
- **AI captions**: `useGenerateCaptions({ topic: firstSentence, platforms,
  tone, count: 3 })` triggered by a "✨ AI captions" button. Shows 3
  suggestion cards with Append / Replace buttons; shimmer placeholders
  while loading; toast on success/error.
- **Platform panel**: 2-col grid of `PlatformBadge` chips with name +
  char limit, multi-select with check mark. "Select all connected"
  button uses `useAccounts().connected`; "Clear" link when >0 selected.
- **Scheduling panel**: native `datetime-local` input + 4 quick preset
  buttons (Now / Tonight 7pm / Tomorrow 9am / Next Monday 9am) with
  aria-pressed states matching the active preset. Status `Select`
  (draft / scheduled / in-review), Campaign `Select` (from
  `useCampaigns`), "Add to publishing queue" `Switch` (visible only when
  status=scheduled).
- **Media panel**: `Popover` media picker from `useMedia` — grid of
  thumbnails, multi-select (max 4 with toast on overflow), video badge,
  selected thumbnails with hover-to-remove overlay.
- **Live preview**: realistic phone-ish post card per selected platform
  (avatar + handle + platform badge + text + media + engagement row
  + timestamp). When multiple platforms are selected, renders a `Tabs`
  of per-platform previews. Empty state ("Pick a channel to preview")
  when no platform selected.
- **Footer actions**: Discard (in `AlertDialog` confirm), Save draft,
  Schedule / Send for review (primary, label depends on status). On
  success, calls `setView('queue')` + sonner toast.
- **Validation**: react-hook-form + zod (text required min 1, at least
  1 platform, scheduledAt required). Uses `useWatch` (NOT `watch()`)
  to avoid the pre-existing react-hooks/incompatible-library warning.

## Lint status
`bun run lint` passes with **0 errors** and **0 warnings** in my three
files. The only remaining warning in the repo is the pre-existing
`react-hooks/incompatible-library` warning at
`src/components/dashboard/composer.tsx:184` (the Sheet composer, owned
by Task 2-b, not me). My full-page composer deliberately uses
`useWatch()` instead of `watch()` to avoid introducing a second
occurrence of that warning.

## Conventions followed
- All three views open with `<PageHeader .../>` wrapped in a
  `<div className="space-y-6">` (per Task 2-b contract).
- Reused shared primitives: `PageHeader`, `SectionCard`, `PostCard`,
  `EmptyState`, `StatCard`, `Toolbar`, `Avatar`, `formatDate`.
- No `Link` / `useRouter` — view switching via `useApp.setView`, composer
  via `useApp.openComposer`.
- All mutations fire `sonner` `toast`.
- All date math via `date-fns`.
- All interactive elements have `aria-label`s, `aria-pressed` for toggle
  states, `aria-live="polite"` for the composer char counter, visible
  focus rings.
- Dark mode flawless: only semantic tokens (`bg-card`, `text-foreground`,
  `border-border`, `bg-accent`, etc.) + the documented brand accent
  tokens (`text-mint`, `text-coral`, `text-amber-brand`, `text-plum`,
  `text-primary`, `text-destructive`).
- Responsive: every view collapses gracefully on mobile (single column,
  horizontally scrollable grids where needed, stacked editor/preview
  tabs on mobile composer).
- Loading skeletons + empty states everywhere data loads.

## Files written
- `src/components/dashboard/views/calendar.tsx` (982 lines)
- `src/components/dashboard/views/queue.tsx` (588 lines)
- `src/components/dashboard/views/composer.tsx` (1543 lines)

## What I did NOT touch
- `dashboard-app.tsx`, `shared.tsx`, shell, store, hooks, API routes,
  globals.css, or any other view file. Other agents' work is intact.
