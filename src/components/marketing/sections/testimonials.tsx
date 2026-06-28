import { Star, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import { TESTIMONIALS } from "@/lib/data/mock";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section
      id="customers"
      aria-labelledby="testimonials-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Loved by social teams
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Teams ship more, stress less
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div
              className="flex items-center gap-0.5"
              aria-label="Rated 4.9 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-4 fill-amber-brand text-amber-brand"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.9/5</span> from
              2,400+ reviews
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              className={cn(
                "flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              )}
            >
              <Quote
                className="size-6 text-primary/30"
                aria-hidden
              />
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground text-pretty">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-border/60 pt-4">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm",
                    t.color
                  )}
                  aria-hidden
                >
                  {initials(t.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
