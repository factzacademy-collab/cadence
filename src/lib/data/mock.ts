import type {
  AnalyticsPoint,
  Campaign,
  InboxItem,
  Integration,
  MediaAsset,
  PlatformBreakdown,
  PostMetrics,
  SocialAccount,
  SocialPost,
  TeamMember,
  ActivityEvent,
} from "@/lib/types";
import type { PlatformId } from "@/lib/brand";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (n: number, base = now) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  d.setHours(9 + (Math.floor(Math.random() * 9)), Math.floor(Math.random() * 60), 0, 0);
  return d;
};
const daysAgo = (n: number) => addDays(-n);
const daysAhead = (n: number) => addDays(n);

const POST_TEXTS = [
  "Behind every great brand is a consistent voice. Here's how we keep ours sharp across 8 channels. 🧵",
  "We just shipped collaborative drafts. Now your whole team can polish a post before it goes live.",
  "The best content calendar isn't fuller — it's smarter. Three slots a week, planned with intent.",
  "Hot take: engagement rate matters more than follower count. Always has. Here's the math.",
  "New case study → how a 4-person team reached 2.3M impressions in 90 days using Cadence.",
  "Your audience doesn't need more noise. They need rhythm. That's the whole idea behind our scheduler.",
  "We analyzed 40k posts. The best time to publish is whenever your audience is actually paying attention.",
  "A thread that took 6 hours to write. Scheduled in 6 seconds. That's the dream.",
  "Reminder: repurposing isn't lazy. It's efficient. Turn one pillar post into 9 micro-assets.",
  "Community > broadcast. Reply to five comments today. Watch what happens to your reach.",
  "Three months of planning in one calm calendar. No spreadsheets, no chaos, no missed launches.",
  "The algorithm rewards consistency. We reward you for showing up.",
];

const FIRST_NAMES = ["Maya", "Leo", "Priya", "Noah", "Sofia", "Ethan", "Aisha", "Liam", "Zoe", "Kai", "Nina", "Ravi"];
const LAST_NAMES = ["Okafor", "Brennan", "Sharma", "Lindqvist", "Reyes", "Cohen", "Mensah", "Petrov", "Nguyen", "dos Santos"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = rng(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

export const ACCOUNTS: SocialAccount[] = (
  [
    { platform: "instagram", handle: "@cadencehq", displayName: "Cadence", followers: 184200 },
    { platform: "x", handle: "@cadence", displayName: "Cadence", followers: 92300 },
    { platform: "linkedin", handle: "cadence", displayName: "Cadence", followers: 64100 },
    { platform: "tiktok", handle: "@cadence", displayName: "Cadence", followers: 211400 },
    { platform: "youtube", handle: "@cadence", displayName: "Cadence", followers: 38900 },
    { platform: "facebook", handle: "/cadence", displayName: "Cadence", followers: 51200 },
    { platform: "threads", handle: "@cadence", displayName: "Cadence", followers: 27800 },
    { platform: "pinterest", handle: "cadence", displayName: "Cadence", followers: 15600 },
  ] as const
).map((a, i) => ({
  id: `acc_${a.platform}`,
  platform: a.platform as PlatformId,
  handle: a.handle,
  displayName: a.displayName,
  followers: a.followers,
  avatarColor: ["from-primary to-mint", "from-coral to-amber-brand", "from-plum to-primary", "from-mint to-coral"][i % 4],
  connected: i < 6,
}));

const ALL_PLATFORMS: PlatformId[] = ["instagram", "x", "linkedin", "tiktok", "youtube", "facebook", "threads", "pinterest"];

function makeMetrics(): PostMetrics {
  const impressions = between(2400, 88000);
  const reach = Math.floor(impressions * (0.62 + rand() * 0.25));
  return {
    impressions,
    reach,
    likes: Math.floor(reach * (0.02 + rand() * 0.06)),
    comments: between(4, 540),
    shares: between(2, 320),
    clicks: between(40, 4200),
    saves: between(8, 1800),
  };
}

export const POSTS: SocialPost[] = Array.from({ length: 42 }).map((_, i) => {
  const status =
    i < 14 ? "published" : i < 18 ? "scheduled" : i < 21 ? "in-review" : i < 26 ? "draft" : i < 28 ? "failed" : "scheduled";
  const scheduledAt =
    status === "published"
      ? iso(daysAgo(between(1, 26)))
      : status === "scheduled"
      ? iso(daysAhead(between(0, 18)))
      : iso(daysAhead(between(1, 20)));
  const platforms = Array.from(
    new Set([pick(ALL_PLATFORMS), pick(ALL_PLATFORMS), pick(ALL_PLATFORMS)])
  ).slice(0, between(1, 3));
  return {
    id: `post_${i + 1}`,
    text: POST_TEXTS[i % POST_TEXTS.length],
    scheduledAt,
    status,
    platforms,
    mediaIds: rand() > 0.4 ? [`media_${between(1, 12)}`] : [],
    campaignId: rand() > 0.5 ? `camp_${between(1, 4)}` : null,
    authorId: `user_${between(1, 6)}`,
    metrics: status === "published" ? makeMetrics() : undefined,
    createdAt: iso(daysAgo(between(2, 30))),
    updatedAt: iso(daysAgo(between(0, 5))),
  };
});

const MEDIA_TITLES = [
  "spring-launch-hero", "team-portrait-maya", "product-ui-dashboard", "cityscape-dusk",
  "gradient-abstract-3", "founder-q-and-a", "behind-the-scenes-studio", "podcast-cover-ep12",
  "infographic-engagement", "quote-card-creativity", "motion-reel-clip", "office-plants-flatlay",
];

export const MEDIA: MediaAsset[] = MEDIA_TITLES.map((name, i) => {
  const isVideo = i % 5 === 0;
  return {
    id: `media_${i + 1}`,
    name: `${name}.${isVideo ? "mp4" : "png"}`,
    type: isVideo ? "video" : "image",
    url: `https://picsum.photos/seed/cadence-${i + 1}/800/600`,
    thumbnailUrl: `https://picsum.photos/seed/cadence-${i + 1}/400/300`,
    width: 800,
    height: 600,
    sizeKb: between(120, 8400),
    tags: ["brand", "launch", "team", "product"].filter(() => rand() > 0.5).slice(0, 3),
    createdAt: iso(daysAgo(between(0, 40))),
  };
});

export const CAMPAIGNS: Campaign[] = [
  { id: "camp_1", name: "Spring Launch 2025", color: "var(--primary)", startDate: iso(daysAgo(10)), endDate: iso(daysAhead(20)), status: "active" },
  { id: "camp_2", name: "Creator Series", color: "var(--coral)", startDate: iso(daysAgo(30)), endDate: iso(daysAhead(5)), status: "active" },
  { id: "camp_3", name: "Q2 Brand Awareness", color: "var(--amber-brand)", startDate: iso(daysAhead(2)), endDate: iso(daysAhead(60)), status: "planned" },
  { id: "camp_4", name: "Holiday Recap", color: "var(--plum)", startDate: iso(daysAgo(60)), endDate: iso(daysAgo(20)), status: "completed" },
];

export const ANALYTICS: AnalyticsPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const date = daysAgo(29 - i);
  const base = 12000 + Math.sin(i / 3) * 3200 + i * 240;
  return {
    date: iso(date),
    impressions: Math.floor(base + rand() * 4000),
    reach: Math.floor(base * 0.7 + rand() * 2000),
    engagement: Math.floor(base * 0.06 + rand() * 800),
    followers: 184200 + i * 320 - (i % 7 === 0 ? 80 : 0),
    clicks: Math.floor(base * 0.09 + rand() * 500),
  };
});

export const PLATFORM_BREAKDOWN: PlatformBreakdown[] = ACCOUNTS.filter((a) => a.connected).map((a) => ({
  platform: a.platform,
  followers: a.followers,
  engagementRate: Number((1.8 + rand() * 4.6).toFixed(2)),
  posts: between(12, 64),
  impressions: a.followers * between(2, 9),
}));

const INBOX_TEXTS = [
  "This is exactly what our team needed. When does the calendar update land?",
  "Loving the new analytics view! The engagement breakdown is so clean.",
  "Is there a way to bulk-import posts via CSV? Asking for a friend.",
  "Your last thread was fire. Any chance of a deep-dive video?",
  "We hit 10k followers this week thanks to your scheduling tips 🙏",
  "Bug report: dark mode toggle flickers on Safari. Otherwise flawless.",
  "Can I connect a Mastodon account? Would love cross-posting support.",
  "Just upgraded to Scale. The approval workflow is a game changer.",
  "How do I add a client as a viewer without giving edit access?",
  "The AI caption suggestions are scarily good. Almost unfair.",
];

export const INBOX: InboxItem[] = Array.from({ length: 14 }).map((_, i) => {
  const platform = pick(ALL_PLATFORMS.slice(0, 6));
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return {
    id: `inbox_${i + 1}`,
    platform,
    author: `${first} ${last}`,
    authorHandle: `@${first.toLowerCase()}${between(1, 99)}`,
    text: INBOX_TEXTS[i % INBOX_TEXTS.length],
    type: pick(["comment", "mention", "dm", "review"]),
    createdAt: iso(daysAgo(between(0, 4))),
    status: i < 4 ? "open" : i < 9 ? "pending" : "resolved",
    avatarColor: ["from-primary to-mint", "from-coral to-amber-brand", "from-plum to-primary", "from-mint to-coral"][i % 4],
  };
});

export const TEAM: TeamMember[] = [
  { id: "user_1", name: "Maya Okafor", email: "maya@cadence.app", role: "Owner", avatarColor: "from-primary to-mint", lastActive: iso(new Date()), status: "active" },
  { id: "user_2", name: "Leo Brennan", email: "leo@cadence.app", role: "Admin", avatarColor: "from-coral to-amber-brand", lastActive: iso(daysAgo(0)), status: "active" },
  { id: "user_3", name: "Priya Sharma", email: "priya@cadence.app", role: "Editor", avatarColor: "from-plum to-primary", lastActive: iso(daysAgo(1)), status: "active" },
  { id: "user_4", name: "Noah Lindqvist", email: "noah@cadence.app", role: "Approver", avatarColor: "from-mint to-coral", lastActive: iso(daysAgo(2)), status: "active" },
  { id: "user_5", name: "Sofia Reyes", email: "sofia@cadence.app", role: "Editor", avatarColor: "from-amber-brand to-coral", lastActive: iso(daysAgo(5)), status: "invited" },
  { id: "user_6", name: "Ethan Cohen", email: "ethan@cadence.app", role: "Viewer", avatarColor: "from-primary to-plum", lastActive: iso(daysAgo(8)), status: "suspended" },
];

export const INTEGRATIONS: Integration[] = [
  { id: "int_1", name: "Canva", description: "Design graphics and import them straight into your media library.", category: "Design", connected: true, accent: "from-cyan-400 to-blue-500" },
  { id: "int_2", name: "Notion", description: "Turn Notion docs into scheduled posts with a single click.", category: "Productivity", connected: true, accent: "from-zinc-700 to-zinc-900" },
  { id: "int_3", name: "Google Drive", description: "Sync assets from Drive and keep your library fresh.", category: "Storage", connected: false, accent: "from-emerald-400 to-green-600" },
  { id: "int_4", name: "Zapier", description: "Connect Cadence to 6,000+ apps with automated workflows.", category: "Automation", connected: true, accent: "from-orange-400 to-orange-600" },
  { id: "int_5", name: "Slack", description: "Get publishing notifications and approval requests in Slack.", category: "Communication", connected: false, accent: "from-fuchsia-400 to-purple-600" },
  { id: "int_6", name: "Figma", description: "Pull frames from Figma into your composer instantly.", category: "Design", connected: false, accent: "from-rose-400 to-pink-600" },
  { id: "int_7", name: "Shopify", description: "Auto-generate product posts from your catalog.", category: "Commerce", connected: false, accent: "from-emerald-400 to-teal-600" },
  { id: "int_8", name: "Bitly", description: "Shorten and track every link you publish.", category: "Analytics", connected: true, accent: "from-sky-400 to-indigo-500" },
];

const ACTIVITY_TARGETS = ["Spring Launch thread", "Creator series reel", "Q2 awareness carousel", "Weekly roundup", "Founder Q&A clip", "Behind-the-scenes post"];
export const ACTIVITY: ActivityEvent[] = Array.from({ length: 18 }).map((_, i) => {
  const actor = pick(TEAM).name;
  const verbs: Record<ActivityEvent["icon"], string> = {
    publish: "published",
    schedule: "scheduled",
    comment: "commented on",
    approve: "approved",
    invite: "invited",
    upload: "uploaded",
  };
  const icons: ActivityEvent["icon"][] = ["publish", "schedule", "comment", "approve", "invite", "upload"];
  const icon = pick(icons);
  const target = icon === "invite" ? pick(TEAM).name : pick(ACTIVITY_TARGETS);
  return {
    id: `act_${i + 1}`,
    actor,
    action: verbs[icon],
    target,
    createdAt: iso(daysAgo(between(0, 6))),
    icon,
  };
});

export const PRICING = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    cadence: "forever",
    description: "For solo creators finding their rhythm.",
    cta: "Start free",
    highlight: false,
    features: [
      "1 brand, 3 channels",
      "10 scheduled posts / channel",
      "Basic content calendar",
      "7-day analytics history",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 18,
    cadence: "per seat / month",
    description: "For small teams publishing across channels.",
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "5 brands, unlimited channels",
      "Unlimited scheduled posts",
      "Approval workflows",
      "Collaborative drafts",
      "12-month analytics history",
      "AI caption assistant",
      "Priority support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 64,
    cadence: "per seat / month",
    description: "For agencies and growing marketing teams.",
    cta: "Start 14-day trial",
    highlight: false,
    features: [
      "Unlimited brands & channels",
      "Client workspaces",
      "Custom approval chains",
      "Advanced reporting & exports",
      "Audience segmentation",
      "Dedicated success manager",
      "SSO & audit logs",
    ],
  },
];

export const TESTIMONIALS = [
  { quote: "Cadence replaced four tools and a messy spreadsheet. Our publishing cadence went from chaotic to clockwork in a week.", name: "Daniela Moreau", role: "Head of Social, Lumio", color: "from-coral to-amber-brand" },
  { quote: "The AI assistant drafts captions that actually sound like us. We review, tweak, and ship in minutes.", name: "Marcus Wei", role: "Founder, Loop Coffee", color: "from-primary to-mint" },
  { quote: "Approval workflows mean nothing ships without a second pair of eyes. Our clients finally trust the process.", name: "Aaliyah Brooks", role: "Ops Lead, Northbeam Agency", color: "from-plum to-primary" },
  { quote: "Analytics that don't require a data degree. I open the dashboard and immediately know what to post next.", name: "Tomás Ferreira", role: "Creator, @tomasbuilds", color: "from-mint to-coral" },
  { quote: "We scheduled an entire quarter of content in two days. That used to take us two weeks.", name: "Ingrid Halvorsen", role: "Content Lead, Fjord Studio", color: "from-amber-brand to-coral" },
  { quote: "The calendar is the cleanest I've used. Drag, drop, done. My team actually enjoys planning now.", name: "Rashid El-Amin", role: "Marketing Director, Verde", color: "from-primary to-plum" },
];

export const FAQS = [
  { q: "How many social channels can I connect?", a: "On the Team plan you can connect unlimited channels across up to 5 brands. Scale removes both limits entirely. Each channel can be scheduled, analyzed, and engaged with independently." },
  { q: "Does Cadence support approval workflows?", a: "Yes. You can build multi-step approval chains so nothing publishes without the right sign-off. Approvers get notified, can request changes, and the full history is logged for audits." },
  { q: "Is there a free plan?", a: "The Starter plan is free forever and includes 1 brand, 3 channels, and 10 scheduled posts per channel. No credit card required to get started." },
  { q: "How does the AI assistant work?", a: "Our AI caption assistant learns your brand voice from past posts and generates platform-specific captions, hashtag suggestions, and content ideas. You always review before anything is scheduled." },
  { q: "Can I migrate from another tool?", a: "Absolutely. We offer a free guided migration on Team and Scale plans, and our CSV import handles bulk content transfers. Most teams are fully migrated within 48 hours." },
  { q: "What about data security and compliance?", a: "Cadence is SOC 2 Type II compliant, encrypts data in transit and at rest, and offers SSO, audit logs, and granular role-based access on Scale plans. We never sell your data." },
  { q: "Do you offer discounts for non-profits or students?", a: "Yes — verified non-profits get 50% off, and students get the Team plan free for one year. Reach out to our team to get set up." },
  { q: "Can I cancel anytime?", a: "Of course. Plans are month-to-month with no lock-in. Annual plans receive a 20% discount and can still be cancelled with a prorated refund." },
];

export const STATS = [
  { label: "Posts published", value: "140M+", sub: "across 180 countries" },
  { label: "Active teams", value: "75,000+", sub: "trust Cadence daily" },
  { label: "Time saved", value: "11 hrs", sub: "average per user / week" },
  { label: "Avg. engagement lift", value: "+38%", sub: "in the first 90 days" },
];
