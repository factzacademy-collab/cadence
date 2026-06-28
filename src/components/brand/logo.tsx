import { cn } from "@/lib/utils";

/** Original "Cadence" wordmark + mark. A stylized sound-wave / rhythm glyph
 *  representing the cadence of a publishing schedule. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cadence-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" />
          <stop offset="0.5" stopColor="var(--mint)" />
          <stop offset="1" stopColor="var(--coral)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#cadence-mark)" />
      <rect x="1" y="1" width="30" height="30" rx="9" fill="black" fillOpacity="0.06" />
      <g fill="white">
        <rect x="8" y="13.5" width="2.4" height="5" rx="1.2" />
        <rect x="12.4" y="10.5" width="2.4" height="11" rx="1.2" />
        <rect x="16.8" y="7.5" width="2.4" height="17" rx="1.2" />
        <rect x="21.2" y="11.5" width="2.4" height="7" rx="1.2" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-7" />
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Cadence
        </span>
      )}
    </span>
  );
}
