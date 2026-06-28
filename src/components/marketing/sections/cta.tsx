"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";

import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Cta() {
  const goApp = useApp((s) => s.goApp);
  const [email, setEmail] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're on the list!", {
      description: "Check your inbox to start your free 14-day trial.",
    });
    setEmail("");
  }

  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-primary/20 px-6 py-12 shadow-xl sm:px-12 sm:py-16">
        {/* Gradient background */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-mint to-coral"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid opacity-20 mix-blend-overlay"
        />
        <div
          aria-hidden
          className="absolute -right-20 -top-20 -z-10 size-72 rounded-full bg-white/20 blur-3xl"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Sparkles className="size-3.5" />
            Start your free 14-day trial
          </span>
          <h2
            id="cta-heading"
            className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl"
          >
            Find your cadence today
          </h2>
          <p className="max-w-xl text-base text-white/85 text-pretty sm:text-lg">
            Join 75,000+ teams publishing with confidence. Plan a quarter of
            content this afternoon — no credit card required.
          </p>

          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            aria-label="Start free trial signup"
          >
            <label htmlFor="cta-email" className="sr-only">
              Work email
            </label>
            <Input
              id="cta-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/30 bg-white/15 text-white placeholder:text-white/70 backdrop-blur focus-visible:border-white focus-visible:ring-white/40"
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 shrink-0 bg-foreground text-background hover:bg-foreground/90"
            >
              Start free
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            <button
              type="button"
              onClick={() => goApp("overview")}
              className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
            >
              Talk to sales
            </button>
            <span className="hidden sm:inline">·</span>
            <span>No credit card required</span>
            <span className="hidden sm:inline">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
