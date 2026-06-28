"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Play, Sparkles, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlatformBadge } from "@/components/brand/platform-icon";

const QUEUE = [
  {
    title: "Spring launch thread",
    time: "Today · 9:00 AM",
    accent: "from-primary to-mint",
    status: "Scheduled",
  },
  {
    title: "Creator reel · behind the scenes",
    time: "Today · 1:30 PM",
    accent: "from-coral to-amber-brand",
    status: "In review",
  },
  {
    title: "Founder Q&A clip",
    time: "Tomorrow · 11:00 AM",
    accent: "from-plum to-primary",
    status: "Draft",
  },
];

const CALENDAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CALENDAR_HEAT = [0, 1, 2, 1, 3, 0, 1, 2, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2, 1, 0, 3, 2, 1, 0, 1, 2, 1, 3];

function ProductMock() {
  return (
    <div className="relative">
      {/* Glow behind */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-mint/20 to-coral/25 blur-2xl"
      />
      <div
        className={cn(
          "glass relative w-[min(92vw,440px)] rounded-2xl border border-border/70 p-4 shadow-2xl",
          "rotate-1 transition-transform duration-500 hover:rotate-0"
        )}
      >
        {/* Window chrome */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-coral/80" />
            <span className="size-2.5 rounded-full bg-amber-brand/80" />
            <span className="size-2.5 rounded-full bg-mint/80" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-md bg-background/70 px-2 py-0.5">cadence.app/calendar</span>
          </div>
          <div className="flex items-center gap-1">
            <PlatformBadge platform="instagram" className="size-5" />
            <PlatformBadge platform="linkedin" className="size-5" />
            <PlatformBadge platform="tiktok" className="size-5" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {/* Mini calendar */}
          <div className="sm:col-span-3 rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">This week</span>
              <span className="text-[10px] text-muted-foreground">March</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-medium text-muted-foreground">
              {CALENDAR_DAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {CALENDAR_HEAT.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-[4px]",
                    h === 0 && "bg-muted/40",
                    h === 1 && "bg-primary/25",
                    h === 2 && "bg-primary/45",
                    h === 3 && "bg-primary/80"
                  )}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-primary/80" /> Published
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-primary/25" /> Scheduled
              </span>
            </div>
          </div>

          {/* Queue */}
          <div className="sm:col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Up next</span>
              <span className="text-[10px] text-muted-foreground">3 queued</span>
            </div>
            <div className="flex flex-col gap-2">
              {QUEUE.map((q) => (
                <div
                  key={q.title}
                  className="rounded-lg border border-border/60 bg-background/60 p-2"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-0.5 size-6 shrink-0 rounded-md bg-gradient-to-br text-white",
                        q.accent
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-foreground">
                        {q.title}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{q.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat chips */}
      <div className="absolute -left-6 top-16 hidden sm:block">
        <div className="animate-float rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <TrendingUp className="size-4" />
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground">Engagement</p>
              <p className="text-sm font-semibold text-foreground">+38% MoM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 bottom-10 hidden sm:block">
        <div
          className="animate-float rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl"
          style={{ animationDelay: "1.2s" }}
        >
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-mint/15 text-mint">
              <CheckCircle2 className="size-4" />
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground">Published today</p>
              <p className="text-sm font-semibold text-foreground">12 posts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-6 -top-3 hidden md:block">
        <div
          className="animate-float rounded-full border border-border/70 bg-background/95 px-3 py-1.5 shadow-xl"
          style={{ animationDelay: "0.6s" }}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-amber-brand" />
            AI drafted
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const goApp = useApp((s) => s.goApp);
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pb-20 pt-12 sm:pt-16 lg:pb-28 lg:pt-20"
    >
      {/* Background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-70" />
        <div className="absolute -left-24 top-10 size-[28rem] rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute -right-20 top-0 size-[26rem] rounded-full bg-mint/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[22rem] rounded-full bg-coral/15 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-5 text-left"
        >
          <motion.div variants={item}>
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
            >
              <Sparkles className="size-3.5" />
              New: AI Caption Assistant
            </Badge>
          </motion.div>

          <motion.h1
            id="hero-heading"
            variants={item}
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Social media with{" "}
            <span className="text-gradient-brand">real rhythm</span>, not chaos.
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-base text-muted-foreground sm:text-lg text-pretty"
          >
            {BRAND.tagline} Plan a quarter of content in an afternoon, ship to
            every channel in one click, and measure what actually moves the
            needle — all from one calm workspace.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => goApp("overview")}>
              Start free
              <ArrowRight className="size-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  <Play className="size-4" />
                  Watch demo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cadence in 90 seconds</DialogTitle>
                  <DialogDescription>
                    A quick tour of the workspace — calendar, composer, and
                    analytics working together.
                  </DialogDescription>
                </DialogHeader>
                <div className="relative aspect-video overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-mint/10 to-coral/10">
                  <div className="absolute inset-0 bg-grid opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <Play className="size-6 fill-current" />
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Demo video placeholder
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.p
            variants={item}
            className="text-xs text-muted-foreground sm:text-sm"
          >
            No credit card required · Free 14-day trial · Cancel anytime
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative flex justify-center lg:justify-end"
        >
          <ProductMock />
        </motion.div>
      </div>
    </section>
  );
}
