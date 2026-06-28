"use client";

import * as React from "react";
import { ArrowLeft, Sparkles, type LucideIcon } from "lucide-react";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Generic, tasteful placeholder used by every dashboard view that has not
 * yet received its full implementation. Later agents will overwrite the
 * specific view file with a real implementation; this just keeps the app
 * shell from breaking in the meantime.
 */
export function ViewPlaceholder({
  icon: Icon,
  title,
  description,
  accent = "from-primary to-mint",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  const setView = useApp((s) => s.setView);
  return (
    <div className="relative">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl"
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div
          className={cn(
            "absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl",
            "bg-gradient-to-br",
            accent
          )}
        />
      </div>

      <section
        className={cn(
          "mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card/80 px-6 py-14 text-center backdrop-blur-sm sm:px-10"
        )}
      >
        <span
          className={cn(
            "relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
            accent
          )}
        >
          <Icon className="size-7" />
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-background text-primary shadow ring-1 ring-border">
            <Sparkles className="size-3" />
          </span>
        </span>

        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="size-3" />
          Coming together
        </div>

        {children}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setView("overview")}
        >
          <ArrowLeft className="size-4" />
          Back to Overview
        </Button>
      </section>
    </div>
  );
}
