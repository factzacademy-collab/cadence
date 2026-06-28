import { CalendarClock, Send, LineChart } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    icon: CalendarClock,
    title: "Plan",
    description:
      "Lay out a quarter of content on a drag-and-drop calendar. Group by campaign, slot by channel, and let Cadence suggest the best publish times.",
    accent: "from-primary to-mint",
  },
  {
    n: "02",
    icon: Send,
    title: "Publish",
    description:
      "Compose once and ship to every connected channel in one click. Approvals, captions, and media all travel together — nothing slips through.",
    accent: "from-coral to-amber-brand",
  },
  {
    n: "03",
    icon: LineChart,
    title: "Measure",
    description:
      "See what worked across every platform in a single dashboard. Double down on winners, retire what stalls, and report up in two clicks.",
    accent: "from-plum to-primary",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-y border-border/60 bg-canvas/40 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            How it works
          </p>
          <h2
            id="how-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            From idea to insight in three steps
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            A loop you can run weekly, monthly, or quarterly. Cadence keeps the
            rhythm so you can focus on the craft.
          </p>
        </div>

        <ol
          className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6"
          aria-label="Three-step workflow"
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.n} className="relative">
                {/* Connector line on desktop */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-10 hidden h-px w-6 bg-gradient-to-r from-border to-transparent md:block"
                  />
                )}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                        step.accent
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold tracking-widest text-muted-foreground">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
