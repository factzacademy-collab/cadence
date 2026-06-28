import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLATFORM_LIST } from "@/lib/brand";
import { PlatformIcon } from "@/components/brand/platform-icon";

export function Channels() {
  return (
    <section
      id="channels"
      aria-labelledby="channels-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            One workspace, every channel
          </p>
          <h2
            id="channels-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Publish everywhere your audience already is
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Connect the channels you care about and Cadence handles the
            format, sizing, and timing for each. No more re-cutting assets at
            midnight.
          </p>
        </div>

        <ul
          role="list"
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {PLATFORM_LIST.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                tabIndex={0}
                aria-label={`Connect ${p.name}`}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left",
                  "shadow-sm transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                    p.gradient
                  )}
                >
                  <PlatformIcon platform={p.id} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Tap to connect</p>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          More channels arrive every month. Have one in mind?{" "}
          <a
            href="#cta"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Tell us what's next.
          </a>
        </p>
      </div>
    </section>
  );
}
