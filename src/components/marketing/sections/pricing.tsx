"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { PRICING } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Cycle = "monthly" | "annual";

function effectivePrice(price: number, cycle: Cycle) {
  if (price === 0) return 0;
  return cycle === "annual" ? Math.round(price * 0.8) : price;
}

export function Pricing() {
  const goApp = useApp((s) => s.goApp);
  const [cycle, setCycle] = React.useState<Cycle>("monthly");

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="border-t border-border/60 bg-canvas/40 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Plans that scale with your rhythm
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Start free, upgrade when you're ready. No credit card required to
            begin, and you can cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div
            role="radiogroup"
            aria-label="Billing cycle"
            className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm"
          >
            {(["monthly", "annual"] as Cycle[]).map((c) => {
              const active = cycle === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCycle(c)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="pricing-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {c === "monthly" ? "Monthly" : "Annual"}
                  {c === "annual" && (
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        active
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-mint/15 text-mint"
                      )}
                    >
                      -20%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PRICING.map((tier) => {
            const price = effectivePrice(tier.price, cycle);
            const highlighted = tier.highlight;
            return (
              <div
                key={tier.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300",
                  highlighted
                    ? "border-primary/50 shadow-lg ring-1 ring-primary/30 lg:-translate-y-2 lg:scale-[1.02]"
                    : "border-border/70 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                )}
              >
                {highlighted && (
                  <Badge
                    className="absolute -top-3 left-6 gap-1 rounded-full bg-primary px-2.5 py-1 text-primary-foreground shadow-sm"
                  >
                    <Sparkles className="size-3" />
                    Most popular
                  </Badge>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-5 flex items-end gap-1">
                  <span className="text-sm font-medium text-muted-foreground">$</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={price}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-4xl font-semibold tracking-tight text-foreground"
                    >
                      {price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="mb-1 text-sm text-muted-foreground">
                    {tier.price === 0
                      ? ` / ${tier.cadence}`
                      : cycle === "annual"
                      ? " / seat · mo, billed yearly"
                      : ` / ${tier.cadence}`}
                  </span>
                </div>

                <Button
                  className="w-full"
                  variant={highlighted ? "default" : "outline"}
                  onClick={() => goApp("overview")}
                >
                  {tier.cta}
                </Button>

                <ul role="list" className="mt-6 flex flex-col gap-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                          highlighted
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/12 text-primary"
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          All paid plans include a 14-day free trial. Annual plans save 20%.
          Need something custom?{" "}
          <a
            href="#cta"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Talk to sales.
          </a>
        </p>
      </div>
    </section>
  );
}
