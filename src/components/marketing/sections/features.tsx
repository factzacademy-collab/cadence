import type { LucideIcon } from "lucide-react";
import {
  PenLine,
  CalendarRange,
  ShieldCheck,
  BarChart3,
  Inbox,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tint: string;
  iconColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: PenLine,
    title: "Composer",
    description:
      "Draft once, tailor per channel. Real-time character counts, hashtag suggestions, and a media library that travels with you.",
    tint: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: CalendarRange,
    title: "Content Calendar",
    description:
      "See your whole quarter at a glance. Drag to reschedule, drop in campaigns, and never miss a launch or a holiday again.",
    tint: "bg-mint/15",
    iconColor: "text-mint",
  },
  {
    icon: ShieldCheck,
    title: "Approval Workflows",
    description:
      "Build multi-step sign-off chains. Approvers get notified, can request edits, and every change is logged for audit.",
    tint: "bg-plum/12",
    iconColor: "text-plum",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Impressions, reach, engagement, and clicks — across every channel — in one calm dashboard. Export ready in two clicks.",
    tint: "bg-amber-brand/15",
    iconColor: "text-amber-brand",
  },
  {
    icon: Inbox,
    title: "Engagement Inbox",
    description:
      "Every comment, mention, and DM in one triage queue. Assign, resolve, and reply without leaving the workspace.",
    tint: "bg-coral/12",
    iconColor: "text-coral",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Caption ideas that sound like you, hashtag sets tuned per platform, and a brainstorming partner that never sleeps.",
    tint: "bg-primary/12",
    iconColor: "text-primary",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <article
      tabIndex={0}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6",
        "shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          feature.tint
        )}
      >
        <Icon className={cn("size-5", feature.iconColor)} />
      </span>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {feature.description}
        </p>
      </div>
    </article>
  );
}

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Everything in one place
          </p>
          <h2
            id="features-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            The workspace your social team actually wants to open
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Six tools that used to live in six browser tabs, finally talking to
            each other. Plan, ship, and learn — without the context switching.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
