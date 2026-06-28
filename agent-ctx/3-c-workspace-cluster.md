# Task 3-c — Workspace & engagement cluster

Owner: Staff Frontend Engineer (workspace & engagement cluster)
Task ID: 3-c

Files owned (replaced in place — only these 7):
- `src/components/dashboard/views/inbox.tsx` — Engagement Inbox
- `src/components/dashboard/views/media.tsx` — Media Library
- `src/components/dashboard/views/ai.tsx` — AI Assistant (flagship AI feature)
- `src/components/dashboard/views/settings.tsx` — Settings (tabbed)
- `src/components/dashboard/views/integrations.tsx` — Integrations grid
- `src/components/dashboard/views/billing.tsx` — Billing & Plan
- `src/components/dashboard/views/team.tsx` — Team & Permissions

Scope rules (from main agent contract):
- DO NOT touch any file outside the 7 owned files. Other clusters are already
  complete (3-a publishing, 3-b insights).
- Reuse shared primitives from `@/components/dashboard/shared`:
  `PageHeader`, `StatCard`, `SectionCard`, `StatusBadge`, `PostCard`,
  `EmptyState`, `SkeletonGrid`, `Avatar`, `MiniArea`, `MiniSparkline`,
  `DonutChart`, `Toolbar`, `formatCompact`, `formatDate`, `PLATFORMS`.
- shadcn/ui (`@/components/ui/*`) + lucide-react + framer-motion + recharts +
  date-fns + react-hook-form + zod + sonner toast + next-themes.
- All API access through React Query hooks in `@/hooks/use-api.ts`.
- Brand tokens: `var(--primary)` teal, `var(--coral)`, `var(--amber-brand)`,
  `var(--mint)`, `var(--plum)`. No indigo/blue as primary brand colors.
- Sticky footer rule does not apply inside the dashboard (the dashboard shell
  manages its own scroll container; views are `<div className="space-y-6">`).

Reusable conventions introduced here (later agents may follow):
- Two-pane master/detail pattern (inbox): left list (button rows, ↑↓ keyboard
  navigation, ARIA `role="listbox"`/`role="option"`), right detail panel;
  on mobile the detail becomes a right-side `Sheet`.
- Local-only optimistic state via `React.useState` for things the API doesn't
  really support (e.g. media multi-select, AI draft messages, settings form
  drafts). Real mutations still go through React Query hooks and invalidate
  the right query keys.
- AI chat persistence: messages stored in React state and mirrored to
  `localStorage` under `cadence.ai.chat`; cleared on "New chat"; trimmed to
  last 8 turns when sent as `history` to the API to keep token usage sane.
- Settings tabs use shadcn `<Tabs>` with `orientation="vertical"` on `lg+`
  via the `lg:flex-row` wrapper trick (TabsList wraps to a vertical bar).
- Connect/Disconnect integration flow → `useToggleIntegration(id)` mutation,
  toast on success/error, status badge color-coded (mint = connected,
  muted = available).
- Role badge colors (used in team + settings):
  Owner = primary, Admin = coral, Editor = mint, Approver = amber, Viewer = muted.

Verification:
- `bun run lint` passes (0 errors in owned files; warnings only from
  react-hook-form's `watch()` API outside this scope).
- Dev server compiles cleanly; `/` returns 200.

---

## Completion notes (final)

All seven owned view files are full, production-grade implementations:

| File | Lines | Exports | Verified against spec |
| --- | ---: | --- | --- |
| `src/components/dashboard/views/inbox.tsx` | 771 | `InboxView` | ✅ two-pane + Sheet on mobile, ↑↓+Enter, all filters, stats strip, Resolve/Pending via `useResolveInbox`, reply toast, thread mock for comments |
| `src/components/dashboard/views/media.tsx` | 1089 | `MediaView` | ✅ grid/list toggle, drag-drop upload POSTing to `/api/media`, selection mode sticky bar, detail dialog, optimistic delete, tag chips, video play badge |
| `src/components/dashboard/views/ai.tsx` | 790 | `AiView` | ✅ 3-col layout, react-markdown, typing indicator, suggestion chips, CaptionGenerator mini-tool, localStorage persistence, mobile Sheet+Tabs, live region |
| `src/components/dashboard/views/settings.tsx` | 1051 | `SettingsView` | ✅ 7-tab vertical Tabs, Profile/Workspace (rhf+zod), Notifications Switches, Appearance wired to `useTheme`, Security (password+2FA+sessions+tokens), Danger zone typed-confirm AlertDialog |
| `src/components/dashboard/views/integrations.tsx` | 581 | `IntegrationsView` | ✅ connected strip + grid, category chips, Configure dialog, `useToggleIntegration`, request CTA with popular chips |
| `src/components/dashboard/views/billing.tsx` | 683 | `BillingView` | ✅ current plan + usage meters (Progress+sparkline), 4 usage StatCards, payment method dialog, invoices table, billing activity, PlanComparison from `PRICING` |
| `src/components/dashboard/views/team.tsx` | 808 | `TeamView` | ✅ invite dialog (`useInviteMember`), roster Table with role/status badges + DropdownMenuSub role change + AlertDialog remove, pending invites sub-section, permissions matrix (sticky left col), team activity feed |

Lint: `npx eslint <all 7 files> --max-warnings=0` → clean. Whole-project
`bun run lint` → 0 errors, 1 pre-existing warning in
`src/components/dashboard/composer.tsx` (Task 2-b, `watch()` API, outside
scope). Dev server compiles cleanly, `GET /` → 200.

No files outside the seven owned ones were modified. Dashboard router in
`dashboard-app.tsx` already imports these exact export names — no shell
changes were required.
