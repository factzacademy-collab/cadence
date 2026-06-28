import { cn } from "@/lib/utils";

const COMPANIES = [
  { name: "Lumio", style: "font-semibold tracking-tight" },
  { name: "Northbeam", style: "font-light tracking-widest uppercase text-sm" },
  { name: "Fjord Studio", style: "font-semibold italic" },
  { name: "Verde", style: "font-bold tracking-tight" },
  { name: "Loop Coffee", style: "font-light tracking-wide" },
  { name: "Cadence Labs", style: "font-semibold tracking-tight" },
  { name: "Halcyon", style: "font-medium uppercase tracking-[0.2em] text-sm" },
  { name: "Pinegrove", style: "font-semibold tracking-tight" },
];

function Wordmark({ name, style }: { name: string; style: string }) {
  return (
    <span
      className={cn(
        "shrink-0 select-none text-foreground/55 transition-colors hover:text-foreground",
        style
      )}
    >
      {name}
    </span>
  );
}

export function Logos() {
  return (
    <section
      aria-labelledby="logos-heading"
      className="border-y border-border/60 bg-canvas/40 py-10"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="logos-heading"
          className="mb-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Trusted by 75,000+ teams worldwide
        </h2>
        <div className="relative overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee items-center gap-12 pr-12">
            {[...COMPANIES, ...COMPANIES].map((c, i) => (
              <Wordmark key={`${c.name}-${i}`} name={c.name} style={c.style} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
