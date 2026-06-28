export const BRAND = {
  name: "Cadence",
  product: "Cadence",
  tagline: "Plan, publish, and measure your social presence in one calm workspace.",
  description:
    "Cadence is the social-media orchestration platform that helps teams schedule content, analyze performance, and engage audiences across every channel — without the chaos.",
  domain: "cadence.app",
  email: "hello@cadence.app",
  foundedYear: 2021,
  social: {
    x: "https://x.com",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    youtube: "https://youtube.com",
  },
};

export type PlatformId =
  | "x"
  | "instagram"
  | "linkedin"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "threads"
  | "pinterest";

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  /** Tailwind text color class used for the brand glyph */
  color: string;
  /** gradient stops for avatars */
  gradient: string;
}

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  x: { id: "x", name: "X", color: "text-foreground", gradient: "from-zinc-700 to-zinc-900" },
  instagram: { id: "instagram", name: "Instagram", color: "text-coral", gradient: "from-fuchsia-500 via-rose-500 to-amber-400" },
  linkedin: { id: "linkedin", name: "LinkedIn", color: "text-[#0a66c2]", gradient: "from-sky-600 to-blue-700" },
  facebook: { id: "facebook", name: "Facebook", color: "text-[#1877f2]", gradient: "from-blue-500 to-indigo-600" },
  tiktok: { id: "tiktok", name: "TikTok", color: "text-foreground", gradient: "from-zinc-900 via-cyan-400 to-rose-500" },
  youtube: { id: "youtube", name: "YouTube", color: "text-[#ff0000]", gradient: "from-red-500 to-red-700" },
  threads: { id: "threads", name: "Threads", color: "text-foreground", gradient: "from-zinc-700 to-black" },
  pinterest: { id: "pinterest", name: "Pinterest", color: "text-[#e60023]", gradient: "from-red-600 to-rose-700" },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

/** Marketing nav */
export const MARKETING_NAV = [
  { label: "Features", href: "#features" },
  { label: "Channels", href: "#channels" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
  { label: "Resources", href: "#resources" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      "Composer",
      "Calendar",
      "Analytics",
      "Engagement Inbox",
      "AI Assistant",
      "Media Library",
      "Integrations",
    ],
  },
  {
    title: "Solutions",
    links: [
      "For Agencies",
      "For Creators",
      "For Small Business",
      "For Enterprise",
      "For Marketing Teams",
    ],
  },
  {
    title: "Resources",
    links: [
      "Help Center",
      "Blog",
      "Academy",
      "Templates",
      "Changelog",
      "Status",
      "API Docs",
    ],
  },
  {
    title: "Company",
    links: [
      "About",
      "Careers",
      "Press Kit",
      "Contact",
      "Privacy",
      "Terms",
      "Security",
    ],
  },
] as const;
