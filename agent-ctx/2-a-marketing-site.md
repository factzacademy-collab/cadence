# Task 2-a — Public marketing site for Cadence

Agent: Staff Frontend Engineer + Senior UX Designer
Scope: `src/components/marketing/**` only (no other files touched).

## Outcome
Replaced the stub `marketing-site.tsx` with a complete, world-class, fully
responsive marketing site composed of a sticky glass header, 11 section
components, and a multi-column sticky footer. `bun run lint` passes with
0 errors (only 2 pre-existing warnings in files outside this scope). The
page renders with HTTP 200 and all key marketing copy shows up in SSR HTML.

## Files created / modified
Root:
- `src/components/marketing/marketing-site.tsx` — root composition.
  Wrapper: `min-h-screen flex flex-col bg-background`. Skip-link,
  `<SiteHeader/>`, `<main id="main" className="flex-1">` with all 11
  sections in order, `<SiteFooter/>` (carries `mt-auto`).
- `src/components/marketing/site-header.tsx` — sticky, glass-on-scroll
  (scroll listener, threshold 8px), desktop nav (MARKETING_NAV anchors),
  theme toggle (next-themes Sun/Moon, hydration-safe via mounted flag),
  "Sign in" ghost + "Start free" primary → `goApp('overview')`. Mobile
  hamburger opens a `Sheet` with nav + CTAs + trust line.
- `src/components/marketing/site-footer.tsx` — `mt-auto` sticky footer.
  Brand + tagline + newsletter form (sonner toast on submit) + social
  icons (Twitter/Linkedin/Github/Youtube). 4 link columns from
  FOOTER_COLUMNS. Bottom row: copyright, legal links, region `<select>`
  (decorative), "Made with ❤ by the Cadence team".

Sections (`src/components/marketing/sections/`):
- `hero.tsx` — gradient headline (`text-gradient-brand` on "real rhythm"),
  BRAND.tagline subhead, two CTAs (Start free → goApp; Watch demo → Dialog
  with faux video). CSS product mock: tilted glass card with window chrome,
  mini heat-map calendar + 3 queue cards, floating stat chips
  (`animate-float`, staggered delays), 3 PlatformBadges. Bg: `.bg-grid`
  + radial mask + 3 blurred brand blobs. framer-motion staggered fade-up
  with `useReducedMotion` respected.
- `logos.tsx` — "Trusted by 75,000+ teams" caption + seamless marquee
  (`.animate-marquee`, duplicated track, `.mask-fade-x`) of 8 fictional
  wordmarks (Lumio, Northbeam, Fjord Studio, Verde, Loop Coffee, Cadence
  Labs, Halcyon, Pinegrove), each with its own typographic treatment.
- `features.tsx` — 6 feature cards (Composer, Content Calendar, Approval
  Workflows, Analytics, Engagement Inbox, AI Assistant) in 1/2/3 col grid.
  Lucide icon in tinted rounded square; hover lift + border highlight;
  keyboard-focusable.
- `how-it-works.tsx` — 3 steps (Plan → Publish → Measure) numbered, with
  gradient icon tiles and desktop connector lines; vertical on mobile.
- `channels.tsx` — 8 platform tiles from `PLATFORM_LIST` + `PlatformIcon`
  on brand gradients, "Tap to connect" affordance (decorative), hover lift.
- `analytics-showcase.tsx` — split layout: left copy + bullet benefits +
  CTA; right a recharts `AreaChart` (impressions + engagement, 12-week
  series) inside a glass card, with 2 floating KPI chips (Followers,
  Click-through). Custom tooltip using brand tokens.
- `ai-section.tsx` — left: mock chat exchange (user bubble + 3 AI caption
  suggestions with platform badges + hashtags); right: copy + CTA. Brand
  gradient blobs in bg.
- `testimonials.tsx` — `TESTIMONIALS` array in a 1/2/3 col grid. Each card:
  Quote icon, blockquote, gradient avatar with initials, name + role.
  Overall rating row: 5 filled stars + "4.9/5 from 2,400+ reviews".
- `pricing.tsx` — `PRICING` array, 3 tiers. Middle highlighted (ring +
  "Most popular" badge + lift). Monthly/Annual toggle with framer-motion
  `layoutId` pill; annual = 20% off (client math). Price animates on
  toggle via `AnimatePresence`. CTA → goApp('overview').
- `faq.tsx` — `FAQS` array in a shadcn `Accordion` (single, collapsible).
- `cta.tsx` — full-width brand-gradient band (primary→mint→coral) with
  grid overlay. Big headline, email input + Start free button (sonner
  toast, email validated), "Talk to sales" link → goApp.

## Conventions future agents MUST follow
1. **Sticky footer rule**: every page-level composition MUST use
   `min-h-screen flex flex-col` on the root wrapper and `mt-auto` on the
   `<footer>`. The marketing site already does this — do not regress.
2. **Single-route app**: never use Next.js `<Link>` or `useRouter` for
   in-app navigation. To send a visitor into the dashboard, call
   `useApp.getState().goApp('overview')` (or the hook
   `const goApp = useApp(s => s.goApp)`). Marketing anchor links
   (`#features`, `#channels`, `#pricing`, `#customers`, `#resources`)
   are plain `<a href>` and rely on `scroll-behavior: smooth` from
   globals.css.
3. **Section ids are part of the nav contract**: `#features`, `#channels`,
   `#pricing`, `#customers` (testimonials), `#resources` (faq), `#top`
   (hero), `#cta`. Do not rename without updating `MARKETING_NAV` in
   `src/lib/brand.ts`.
4. **Theme toggle**: hydration-safe pattern is `mounted` flag +
   `resolvedTheme` from `next-themes`. Render a stable placeholder until
   mounted to avoid SSR/CSR mismatch. Reuse the `ThemeToggle` pattern if
   you need a toggle elsewhere.
5. **Toasts**: use `sonner`'s `toast` for all form-submit feedback
   (newsletter, CTA email). Validate email with the same regex used in
   `cta.tsx` / `site-footer.tsx`.
6. **Visuals are CSS/SVG, not images**: product mocks, charts, avatars,
  wordmarks, and backgrounds are all built with divs/SVG/recharts. Do
  not introduce heavy images. Use `.bg-grid`, `.bg-dots`, `.glass`,
  `.text-gradient-brand`, `.animate-float`, `.animate-marquee`,
  `.mask-fade-x`, `.mask-fade-b` from globals.css.
7. **framer-motion**: keep it subtle and always gate with
   `useReducedMotion()`. The pricing toggle pill uses `layoutId=
   "pricing-pill"`; the price swap uses `AnimatePresence mode=
   "popLayout"`. Hero uses a staggered container variant.
8. **No hardcoded brand colors**: use semantic tokens
   (`bg-background`, `text-foreground`, `text-muted-foreground`,
   `border-border`, `bg-card`, `text-primary`, etc.) and the brand
   accent tokens (`text-coral`, `text-mint`, `text-amber-brand`,
   `text-plum`, `bg-primary/12`). The only intentional gradients are
   decorative blobs and the CTA band (primary→mint→coral).
9. **Accessibility**: every interactive element has an `aria-label` or
   visible text; landmark elements use `aria-labelledby` pointing at the
   section heading `id`; a skip-link sits at the top of the marketing
   root; focus rings are global (`:focus-visible` in globals.css) — do
   not override with `outline-none` without re-adding a ring.
10. **Lint discipline**: `bun run lint` must end with 0 errors before
    marking this task done. The 2 remaining warnings are in
    `src/app/page.tsx` and `src/lib/data/store.ts` (pre-existing, outside
    this task's scope) — do not touch them.

## Verification
- `bun run lint` → `0 errors, 2 warnings` (both pre-existing, outside scope).
- `curl http://localhost:3000/` → `HTTP 200`, render ~300ms.
- SSR HTML contains: "Cadence", "real rhythm", "Trusted by", "Most
  popular", "Questions, answered", "Find your cadence", "Made with".
