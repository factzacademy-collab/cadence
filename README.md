# Cadence

> Social media orchestration for modern teams — plan, publish, and measure your social presence in one calm workspace.

An original social-media SaaS application (inspired by the public behavior of buffer.com, 100% original implementation) built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma, React Query, Framer Motion, and the z-ai-web-dev-sdk for AI features.

![Lighthouse: Accessibility 100 · Best Practices 100 · SEO 100](https://img.shields.io/badge/Lighthouse-A11y%20100%20·%20BP%20100%20·%20SEO%20100-success)

## Features

- **Marketing site** — hero, social proof, features, how-it-works, channels, analytics showcase, AI section, testimonials, pricing (monthly/annual toggle), FAQ, CTA, sticky footer.
- **Dashboard** — 14 fully-functional views: Overview, Calendar (month/week/list), Queue, Composer, Inbox (two-pane triage), AI Assistant (live chat + caption generator), Media Library, Analytics, Reports, Audience, Team, Integrations, Billing, Settings.
- **Authentication** — NextAuth.js credentials provider with JWT sessions, registration that provisions a workspace.
- **Persistence** — Prisma (SQLite for dev) with a hybrid read-through store: reads try the DB first and fall back to in-memory mock data; writes persist to the DB and mirror into cache.
- **AI** — Cadence AI assistant (chat) and caption generator powered by z-ai-web-dev-sdk, server-only, with graceful fallbacks.
- **Design system** — original token system (deep-teal primary, coral/amber/mint/plum accents), light + dark mode, reduced-motion support, custom utilities and animations.
- **Lighthouse** — Accessibility 100, Best Practices 100, SEO 100.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM (SQLite dev / Postgres prod) |
| State | Zustand (view router) + TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Charts | Recharts |
| Auth | NextAuth.js v4 |
| AI | z-ai-web-dev-sdk |

## Getting started

```bash
# 1. Install dependencies
bun install

# 2. Copy env and configure
cp .env.example .env
# Generate a NextAuth secret:
openssl rand -base64 32  # put this in NEXTAUTH_SECRET

# 3. Set up the database
bun run db:push      # create schema
bun run db:seed      # seed demo user + workspace + data

# 4. Start the dev server
bun run dev
```

Open `http://localhost:3000`.

### Demo account

After seeding, sign in with:

- **Email:** `demo@cadence.app`
- **Password:** `cadence123`

Or click **"Try the demo"** in the sign-in dialog.

## Architecture

Cadence runs as a single-route SPA on `/`. The Zustand store (`src/lib/store.ts`) drives a `route` (marketing | app) and `view` (one of 14 dashboard views), with hash-based deep-linking (`#app/overview`). The whole app lives in `src/app/page.tsx`.

```
src/
├── app/
│   ├── api/            # 13 API routes (posts, analytics, media, ai, auth, …)
│   ├── globals.css     # design system (OKLCH tokens, dark mode, utilities)
│   ├── layout.tsx      # fonts, metadata, providers
│   └── page.tsx        # single-route shell (lazy MarketingSite / DashboardApp)
├── components/
│   ├── brand/          # logo, platform icons (original SVGs)
│   ├── dashboard/      # shell + 14 views + shared primitives
│   ├── marketing/      # header, footer, 11 sections, auth dialog
│   ├── providers.tsx   # SessionProvider + Theme + QueryClient + Tooltip
│   └── ui/             # shadcn/ui components
├── hooks/
│   └── use-api.ts      # React Query hooks for every API endpoint
└── lib/
    ├── ai.ts           # z-ai-web-dev-sdk wrapper (server-only)
    ├── auth.ts         # NextAuth options
    ├── brand.ts        # brand constants, platforms, nav
    ├── data/           # mock seed + hybrid store
    ├── db.ts           # Prisma client
    ├── password.ts     # scrypt hashing
    ├── store.ts        # Zustand view router
    └── types.ts        # domain types
```

## Documentation

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** — full epics/features/tasks breakdown, developer/testing/QA/deployment checklists, architecture reference, and roadmap.
- **[worklog.md](./worklog.md)** — build history across all development tasks.

## Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server on port 3000 |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:seed` | Seed demo data (user, workspace, posts, etc.) |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run build` | Production build (standalone output) |

## License

Original work. All code, branding, copy, and design are original.
