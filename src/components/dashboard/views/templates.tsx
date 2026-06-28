"use client";

import * as React from "react";
import {
  Plus,
  Search,
  LayoutTemplate,
  FileText,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  SkeletonGrid,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { useApp } from "@/lib/store";
import type { PlatformId } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "social" | "promo" | "announcement" | "story" | "thread";
  platforms: PlatformId[];
  body: string;
  starred: boolean;
  uses: number;
  updatedAt: string;
}

const CATEGORIES = [
  { id: "social", label: "Social", color: "text-primary" },
  { id: "promo", label: "Promotional", color: "text-coral" },
  { id: "announcement", label: "Announcement", color: "text-amber-brand" },
  { id: "story", label: "Story", color: "text-mint" },
  { id: "thread", label: "Thread", color: "text-plum" },
] as const;

const TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Product launch announcement",
    description: "A punchy launch post with hero benefit + CTA.",
    category: "announcement",
    platforms: ["x", "linkedin"],
    body: "🚀 Introducing {product} — {one-line benefit}. \n\nHere's what's new:\n• {feature 1}\n• {feature 2}\n• {feature 3}\n\nTry it today: {link}",
    starred: true,
    uses: 24,
    updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: "t2",
    name: "Weekly roundup",
    description: "Recap the week's best content in one post.",
    category: "social",
    platforms: ["instagram", "facebook"],
    body: "This week on {brand} 👇\n\n1️⃣ {highlight 1}\n2️⃣ {highlight 2}\n3️⃣ {highlight 3}\n\nMissed anything? Catch up at {link}.",
    starred: true,
    uses: 18,
    updatedAt: new Date(Date.now() - 5 * 864e5).toISOString(),
  },
  {
    id: "t3",
    name: "Flash promo",
    description: "Time-sensitive discount with urgency.",
    category: "promo",
    platforms: ["instagram", "tiktok"],
    body: "⚡ Flash sale! {discount}% off {product} for the next {hours} hours.\n\nUse code {code} at checkout. Don't sleep on this. {link}",
    starred: false,
    uses: 12,
    updatedAt: new Date(Date.now() - 8 * 864e5).toISOString(),
  },
  {
    id: "t4",
    name: "Behind the scenes",
    description: "Humanize your brand with a peek behind the curtain.",
    category: "story",
    platforms: ["instagram", "youtube"],
    body: "Behind the scenes at {brand} 🎬\n\n{what's happening}. Here's how we {process}. It's not always glamorous, but it's always ours.",
    starred: false,
    uses: 9,
    updatedAt: new Date(Date.now() - 12 * 864e5).toISOString(),
  },
  {
    id: "t5",
    name: "Expert thread",
    description: "A 5-tweet thread sharing one big idea.",
    category: "thread",
    platforms: ["x", "threads"],
    body: "1/ Here's something I learned about {topic} that changed how I think about it 🧵\n\n2/ Most people believe {common assumption}.\n\n3/ But the reality is {insight}.\n\n4/ Here's what that means for you: {actionable takeaway}.\n\n5/ If this helped, repost the first tweet. What's your experience with {topic}?",
    starred: true,
    uses: 31,
    updatedAt: new Date(Date.now() - 1 * 864e5).toISOString(),
  },
  {
    id: "t6",
    name: "Customer spotlight",
    description: "Feature a customer win with social proof.",
    category: "social",
    platforms: ["linkedin", "facebook"],
    body: "Meet {customer} 🌟\n\nThey used {product} to {result}. Here's what they said:\n\n\"{quote}\"\n\nWant similar results? {link}",
    starred: false,
    uses: 7,
    updatedAt: new Date(Date.now() - 15 * 864e5).toISOString(),
  },
];

export function TemplatesView() {
  const [templates, setTemplates] = React.useState<Template[]>(TEMPLATES);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [createOpen, setCreateOpen] = React.useState(false);

  const filtered = templates.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.description.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: templates.length,
    starred: templates.filter((t) => t.starred).length,
    uses: templates.reduce((a, b) => a + b.uses, 0),
  };

  const handleUse = (t: Template) => {
    const openComposer = useApp.getState().openComposer;
    openComposer();
    toast.success(`"${t.name}" template loaded into composer`);
  };

  const toggleStar = (id: string) => {
    setTemplates((s) => s.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
  };

  const handleDelete = (id: string) => {
    setTemplates((s) => s.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Templates"
        description="Save your best post structures and reuse them in seconds."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4" />New template</Button>
            </DialogTrigger>
            <CreateTemplateDialog
              onCreate={(t) => {
                setTemplates((s) => [t, ...s]);
                toast.success("Template created");
                setCreateOpen(false);
              }}
            />
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Templates" value={stats.total} icon={LayoutTemplate} accent="text-primary" />
        <StatCard label="Starred" value={stats.starred} icon={Star} accent="text-amber-brand" />
        <StatCard label="Times used" value={stats.uses} icon={Copy} accent="text-mint" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9" />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="text-xs">{c.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates yet"
          description="Save your best-performing post structures as templates to reuse them across campaigns."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />New template</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const cat = CATEGORIES.find((c) => c.id === t.category);
            return (
              <div
                key={t.id}
                className="group flex flex-col rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn("flex size-9 items-center justify-center rounded-lg bg-accent", cat?.color)}>
                    <FileText className="size-4" />
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStar(t.id)}
                      className="rounded p-1 transition-colors hover:bg-accent"
                      aria-label={t.starred ? "Unstar" : "Star"}
                    >
                      <Star className={cn("size-4", t.starred ? "fill-amber-brand text-amber-brand" : "text-muted-foreground")} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100" aria-label="Template actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => handleUse(t)}>
                          <Pencil className="size-4" /> Use template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Copied to clipboard")}>
                          <Copy className="size-4" /> Copy body
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px]", cat?.color)}>{cat?.label}</Badge>
                  <div className="flex -space-x-1.5">
                    {t.platforms.slice(0, 3).map((p) => (
                      <PlatformBadge key={p} platform={p} className="size-5 ring-2 ring-card" />
                    ))}
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-muted/50 p-2.5">
                  <p className="line-clamp-3 font-mono text-[11px] text-muted-foreground">{t.body}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Used {t.uses} times</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUse(t)}>
                    <Sparkles className="size-3" /> Use
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateTemplateDialog({ onCreate }: { onCreate: (t: Template) => void }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState<Template["category"]>("social");

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>New template</DialogTitle>
        <DialogDescription>Save a reusable post structure. Use {"{placeholders}"} for variable parts.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <Input placeholder="Product launch announcement" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <Input placeholder="A punchy launch post with hero benefit + CTA" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id as Template["category"])}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c.id ? "border-primary bg-accent/40" : "border-border/60 hover:bg-accent/30"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Body</label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={"🚀 Introducing {product} — {benefit}.\n\nTry it: {link}"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">Use {"{brackets}"} for parts you'll fill in each time.</p>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name.trim() || !body.trim()}
          onClick={() =>
            onCreate({
              id: `t_${Date.now()}`,
              name,
              description: description || "Custom template",
              category,
              platforms: ["x"],
              body,
              starred: false,
              uses: 0,
              updatedAt: new Date().toISOString(),
            })
          }
        >
          Create template
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
