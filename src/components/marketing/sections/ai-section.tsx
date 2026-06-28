"use client";

import { ArrowRight, Sparkles, Wand2 } from "lucide-react";

import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/brand/platform-icon";

const SUGGESTIONS = [
  {
    platform: "instagram" as const,
    text: "Behind every great brand is a consistent voice. Here's how we keep ours sharp across 8 channels. 🧵",
    tags: ["#brandvoice", "#socialstrategy"],
  },
  {
    platform: "linkedin" as const,
    text: "Three months of planning in one calm calendar. No spreadsheets, no chaos, no missed launches.",
    tags: ["#contentops"],
  },
  {
    platform: "x" as const,
    text: "The algorithm rewards consistency. We reward you for showing up. Thread 👇",
    tags: ["#socialmedia"],
  },
];

export function AiSection() {
  const goApp = useApp((s) => s.goApp);

  return (
    <section
      id="ai"
      aria-labelledby="ai-heading"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-16 top-0 size-[24rem] rounded-full bg-plum/15 blur-3xl" />
        <div className="absolute -left-16 bottom-0 size-[24rem] rounded-full bg-mint/15 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: chat mock */}
        <div className="order-2 lg:order-1">
          <div className="glass rounded-2xl border border-border/70 p-5 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-mint to-coral text-white">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Caption Assistant</p>
                <p className="text-[11px] text-muted-foreground">Learns your brand voice</p>
              </div>
            </div>

            {/* User bubble */}
            <div className="mb-4 flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                Write captions for our spring launch post. Keep it confident,
                not salesy.
              </div>
            </div>

            {/* AI suggestions */}
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                3 suggestions
              </p>
              {SUGGESTIONS.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 bg-background/60 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <PlatformBadge platform={s.platform} className="size-5" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {s.platform === "x" ? "X" : s.platform[0].toUpperCase() + s.platform.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground text-pretty">{s.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: copy */}
        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Wand2 className="size-3.5" />
            AI Assistant
          </span>
          <h2
            id="ai-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Captions that actually sound like{" "}
            <span className="text-gradient-brand">you</span>
          </h2>
          <p className="text-base text-muted-foreground text-pretty">
            Train the assistant on your past posts and brand voice. It drafts
            platform-specific captions, suggests hashtags, and helps you
            brainstorm — then steps back so you stay in the editor's seat.
          </p>
          <ul role="list" className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-start gap-2.5 text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-brand" />
              Learns from your best-performing posts
            </li>
            <li className="flex items-start gap-2.5 text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-brand" />
              Tone presets: confident, playful, technical, minimal
            </li>
            <li className="flex items-start gap-2.5 text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-brand" />
              Always reviewed by you before publishing
            </li>
          </ul>
          <div>
            <Button size="lg" onClick={() => goApp("overview")}>
              Try the assistant
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
