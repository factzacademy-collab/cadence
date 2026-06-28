import type { PlatformId } from "@/lib/brand";
import { PLATFORMS } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Original, simplified platform glyphs (no trademarked logos). */
export function PlatformIcon({
  platform,
  className,
}: {
  platform: PlatformId;
  className?: string;
}) {
  const c = cn("h-4 w-4", className);
  switch (platform) {
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <path d="M17.5 3h3l-7.1 8.1L22 21h-6.2l-4.4-5.7L6 21H3l7.6-8.7L2.5 3h6.3l4 5.3L17.5 3Zm-1 16h1.7L8.1 4.7H6.3L16.5 19Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" fillOpacity="0.12" />
          <rect x="6" y="9.5" width="2.4" height="8" rx="0.6" />
          <circle cx="7.2" cy="7" r="1.3" />
          <path d="M11 17.5v-8h2.3v1.1c.5-.8 1.5-1.3 2.6-1.3 2 0 3.1 1.3 3.1 3.8v4.4h-2.3v-4c0-1.2-.4-1.8-1.4-1.8-1 0-1.6.7-1.6 1.9v3.9H11Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.4 1.5-1.4h1.3V5.5c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.6 1.3-3.6 3.8v2.1H8.2V14h2.3v7h3Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <path d="M14 3c.3 2 1.6 3.6 3.6 4v2.4c-1.3 0-2.6-.4-3.6-1.1v5.9c0 2.8-2.2 4.8-4.8 4.8S4.5 17 4.5 14.5 6.7 9.7 9.3 9.7c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.2-.9-.2-1.2 0-2.2 1-2.2 2.3s1 2.3 2.2 2.3 2.3-1 2.3-2.5V3H14Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <path d="M21.6 8.2c-.2-1-1-1.8-2-2C17.9 5.8 12 5.8 12 5.8s-5.9 0-7.6.4c-1 .2-1.8 1-2 2C2 9.9 2 12 2 12s0 2.1.4 3.8c.2 1 1 1.8 2 2 1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4c1-.2 1.8-1 2-2 .4-1.7.4-3.8.4-3.8s0-2.1-.4-3.8ZM10 15V9l5 3-5 3Z" />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <path d="M16.8 11.2c-.1 0-.2-.1-.3-.1-.2-2.4-1.5-3.8-3.7-3.8-1.3 0-2.4.6-3.1 1.6l1.2.9c.5-.7 1.2-.9 1.9-.9 1.2 0 1.9.7 2 1.9-.6-.1-1.2-.2-1.8-.2-2 0-3.3 1.1-3.2 2.8 0 .9.5 1.6 1.1 2 .5.4 1.2.5 1.9.5 1 0 1.8-.3 2.3-1 .4-.5.6-1.1.7-1.8.5.3.8.7 1 1.2.4.9.4 2.2-.3 2.9-.6.6-1.6.9-2.9.9-1.5 0-2.6-.5-3.3-1.4-.6-.8-.9-2-.9-3.5 0-3 1.5-5 4.2-5 1.4 0 2.4.4 3.2 1.1l1-1.1c-1-1-2.4-1.5-4.2-1.5-3.6 0-5.7 2.6-5.7 6.5 0 1.9.4 3.4 1.3 4.5 1 1.2 2.5 1.9 4.4 1.9 1.8 0 3.2-.5 4.1-1.5 1.1-1.2 1.1-3 .5-4.2-.3-.9-1-1.6-1.9-1.9Zm-3.8 3.6c-1 0-1.5-.5-1.5-1.2 0-1.5 1.6-1.6 2.4-1.6.4 0 .8 0 1.2.1-.1 2-1 2.7-2.1 2.7Z" />
        </svg>
      );
    case "pinterest":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor" aria-hidden="true">
          <path d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.8-.1-1.9 0-2.7l1.1-4.6s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.4 0 .8-.5 2-.8 3.2-.2.9.5 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.7 0-1.9-1.3-3.4-3.7-3.4-2.7 0-4.3 2-4.3 4.2 0 .8.2 1.3.6 1.7.2.2.2.3.1.5l-.2.8c-.1.3-.3.4-.6.2-1.1-.5-1.6-1.7-1.6-3.2 0-2.6 2.2-5.6 6.4-5.6 3.4 0 5.6 2.4 5.6 5.1 0 3.4-1.9 6-4.7 6-1 0-1.8-.5-2.1-1.1l-.6 2.2c-.2.7-.6 1.4-.9 2A9 9 0 1 0 12 3Z" />
        </svg>
      );
    default:
      return null;
  }
}

/** A circular avatar-style badge that shows a platform glyph on a brand gradient. */
export function PlatformBadge({
  platform,
  className,
  gradient,
}: {
  platform: PlatformId;
  className?: string;
  gradient?: string;
}) {
  const meta = PLATFORMS[platform];
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm",
        gradient ?? meta.gradient,
        className
      )}
    >
      <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
    </span>
  );
}
