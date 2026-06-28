"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bold,
  Check,
  Hash,
  Image as ImageIcon,
  Italic,
  ListChecks,
  Loader2,
  PenSquare,
  Plus,
  RotateCcw,
  Save,
  Send,
  Smile,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import {
  PLATFORM_LIST,
  PLATFORMS,
  type PlatformId,
} from "@/lib/brand";
import {
  PlatformBadge,
  PlatformIcon,
} from "@/components/brand/platform-icon";
import type { PostStatus } from "@/lib/types";
import {
  useAccounts,
  useCampaigns,
  useCreatePost,
  useGenerateCaptions,
  useMedia,
} from "@/hooks/use-api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const PLATFORM_LIMITS: Record<PlatformId, number> = {
  x: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 2200,
  tiktok: 2200,
  youtube: 2200,
  threads: 2200,
  pinterest: 2200,
};

const TONES = [
  "Engaging",
  "Professional",
  "Playful",
  "Inspirational",
  "Concise",
] as const;

const QUICK_PRESETS: {
  label: string;
  hint: string;
  compute: () => Date;
}[] = [
  {
    label: "Now",
    hint: "Publish immediately",
    compute: () => new Date(),
  },
  {
    label: "Tonight 7pm",
    hint: "Today at 7:00 PM",
    compute: () => {
      const d = new Date();
      d.setHours(19, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Tomorrow 9am",
    hint: "Tomorrow at 9:00 AM",
    compute: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Next Monday 9am",
    hint: "Next Monday at 9:00 AM",
    compute: () => {
      const d = new Date();
      const day = d.getDay();
      const diff = (8 - day) % 7 || 7; // next Monday
      d.setDate(d.getDate() + diff);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

const EMOJIS = [
  "✨", "🔥", "🚀", "🎉", "💡", "❤️", "🙌", "👏",
  "😍", "🎯", "📈", "💬", "🌿", "☀️", "🌙", "⚡",
  "✅", "🌟", "💫", "🪄", "🍃", "🌻", "🌱", "🧵",
];

const HASHTAGS = [
  "#cadence", "#socialmedia", "#contentstrategy", "#marketing",
  "#creators", "#branding", "#growth", "#digitalmarketing",
];

/* ------------------------------------------------------------------ */
/*  Schema                                                            */
/* ------------------------------------------------------------------ */

const schema = z.object({
  text: z.string().min(1, "Caption is required"),
  platforms: z
    .array(z.string())
    .min(1, "Pick at least one channel"),
  scheduledAt: z.string().min(1, "Pick a date and time"),
  status: z.enum(["draft", "scheduled", "in-review"]),
  campaignId: z.string().optional().nullable(),
  mediaIds: z.array(z.string()).default([]),
  addToQueue: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function toLocalInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) return "an exciting Cadence product update";
  const m = t.match(/^[^.!?\n]+[.!?]?/);
  return (m ? m[0] : t).slice(0, 160);
}

/* ------------------------------------------------------------------ */
/*  Platform panel                                                    */
/* ------------------------------------------------------------------ */

function PlatformPanel({
  platforms,
  toggle,
  selectAll,
  clearAll,
  connectedCount,
}: {
  platforms: PlatformId[];
  toggle: (id: PlatformId) => void;
  selectAll: () => void;
  clearAll: () => void;
  connectedCount: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Channels
        </Label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={selectAll}
            className="rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Select all connected
          </button>
          {platforms.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {PLATFORM_LIST.map((p) => {
          const selected = platforms.includes(p.id);
          const limit = PLATFORM_LIMITS[p.id];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={selected}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-card hover:bg-accent/60"
              )}
            >
              <PlatformBadge platform={p.id} className="size-6" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-foreground">
                  {p.name}
                </span>
                <span className="block text-[10px] text-muted-foreground tabular-nums">
                  {limit.toLocaleString()} chars
                </span>
              </span>
              {selected && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {connectedCount > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {connectedCount} channel{connectedCount === 1 ? "" : "s"} connected
          in your workspace.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scheduling panel                                                  */
/* ------------------------------------------------------------------ */

function SchedulingPanel({
  control,
  setValue,
  errors,
  campaigns,
  status,
  scheduledAt,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
  campaigns: { id: string; name: string; color: string }[];
  status: FormValues["status"];
  scheduledAt: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Schedule
        </Label>
        <Controller
          control={control}
          name="scheduledAt"
          render={({ field }) => (
            <input
              type="datetime-local"
              value={toLocalInputValue(field.value)}
              onChange={(e) => {
                const v = e.target.value;
                field.onChange(v ? new Date(v).toISOString() : "");
              }}
              aria-invalid={!!errors.scheduledAt}
              aria-label="Scheduled date and time"
              className={cn(
                "mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
                errors.scheduledAt &&
                  "border-destructive focus-visible:ring-destructive/30"
              )}
            />
          )}
        />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {QUICK_PRESETS.map((p) => {
            const isActive =
              scheduledAt &&
              format(new Date(p.compute()), "yyyy-MM-ddTHH:mm") ===
                format(new Date(scheduledAt), "yyyy-MM-ddTHH:mm");
            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  setValue("scheduledAt", p.compute().toISOString(), {
                    shouldValidate: true,
                  })
                }
                title={p.hint}
                aria-pressed={!!isActive}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-left text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/60"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        {errors.scheduledAt && (
          <p className="mt-1 text-xs text-destructive">
            {errors.scheduledAt.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5 w-full" aria-label="Post status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-review">In review</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Campaign
          </Label>
          <Controller
            control={control}
            name="campaignId"
            render={({ field }) => (
              <Select
                value={field.value ?? "__none__"}
                onValueChange={(v) =>
                  field.onChange(v === "__none__" ? null : v)
                }
              >
                <SelectTrigger className="mt-1.5 w-full" aria-label="Campaign">
                  <SelectValue placeholder="No campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No campaign</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: c.color }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {status === "scheduled" && (
        <Controller
          control={control}
          name="addToQueue"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2">
              <span className="flex items-center gap-2 text-xs">
                <ListChecks className="size-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  Add to publishing queue
                </span>
              </span>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="Add to publishing queue"
              />
            </label>
          )}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Media panel                                                       */
/* ------------------------------------------------------------------ */

function MediaPanel({
  mediaIds,
  toggle,
  remove,
  media,
}: {
  mediaIds: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  media: {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    type: string;
  }[];
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const remaining = 4 - mediaIds.length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Media
        </Label>
        <span className="text-[10px] text-muted-foreground">
          {mediaIds.length}/4 selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={mediaIds.length >= 4}
            >
              <ImageIcon className="size-3.5" />
              Add media
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="start">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <p className="text-xs font-semibold">Media library</p>
              <span className="text-[10px] text-muted-foreground">
                {media.length} assets · pick up to 4
              </span>
            </div>
            <ScrollArea className="h-64">
              <div className="grid grid-cols-3 gap-1.5 p-1">
                {media.map((m) => {
                  const sel = mediaIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      aria-pressed={sel}
                      aria-label={`${sel ? "Remove" : "Add"} media ${m.name}`}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        sel
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <img
                        src={m.thumbnailUrl ?? m.url}
                        alt={m.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                      {m.type === "video" && (
                        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[9px] font-medium uppercase tracking-wide text-white">
                          video
                        </span>
                      )}
                      {sel && (
                        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {mediaIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mediaIds.map((id) => {
              const m = media.find((x) => x.id === id);
              if (!m) return null;
              return (
                <div
                  key={id}
                  className="group relative size-14 overflow-hidden rounded-md border border-border"
                >
                  {" "}
                  <img
                    src={m.thumbnailUrl ?? m.url}
                    alt={m.name}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    aria-label={`Remove ${m.name}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="size-4 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {remaining <= 1 && (
        <p className="text-[10px] text-muted-foreground">
          {remaining === 0
            ? "Media limit reached (4)."
            : "1 more slot available."}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Editor + AI captions                                              */
/* ------------------------------------------------------------------ */

function insertAtCursor(text: string, snippet: string): string {
  if (!text) return snippet;
  return text.replace(/\s*$/, "") + " " + snippet;
}

function EditorPanel({
  control,
  watch,
  setValue,
  register,
  errors,
  platforms,
  text,
  mediaIds,
  onToggleMedia,
  onRemoveMedia,
  media,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  register: ReturnType<typeof useForm<FormValues>>["register"];
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
  platforms: PlatformId[];
  text: string;
  mediaIds: string[];
  onToggleMedia: (id: string) => void;
  onRemoveMedia: (id: string) => void;
  media: {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    type: string;
  }[];
}) {
  const generateCaptions = useGenerateCaptions();
  const [captions, setCaptions] = React.useState<string[]>([]);
  const [tone, setTone] =
    React.useState<(typeof TONES)[number]>("Engaging");
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [hashtagOpen, setHashtagOpen] = React.useState(false);

  const selectedPlatforms = platforms;
  const limit = selectedPlatforms.length
    ? Math.min(...selectedPlatforms.map((p) => PLATFORM_LIMITS[p]))
    : 280;
  const length = text.length;
  const remaining = limit - length;
  const over = length > limit;
  const near = !over && remaining <= limit * 0.1;

  const counterColor = over
    ? "text-destructive"
    : near
      ? "text-amber-brand"
      : "text-muted-foreground";

  const handleGenerate = async () => {
    const topic = firstSentence(text);
    try {
      const res = await generateCaptions.mutateAsync({
        topic,
        platforms: selectedPlatforms.length
          ? selectedPlatforms
          : (["instagram", "linkedin", "x"] as PlatformId[]),
        tone: tone.toLowerCase(),
        count: 3,
      });
      setCaptions(res.captions ?? []);
      toast.success("Captions generated", {
        description: `${res.captions?.length ?? 0} suggestions ready.`,
      });
    } catch {
      toast.error("Couldn’t generate captions. Try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Caption + toolbar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label
            htmlFor="composer-caption"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Caption
          </Label>
          <div className="flex items-center gap-2">
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger size="sm" className="h-7 w-32 text-xs" aria-label="Tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7"
              onClick={handleGenerate}
              disabled={generateCaptions.isPending}
            >
              {generateCaptions.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5 text-primary" />
              )}
              AI captions
            </Button>
          </div>
        </div>

        <div className="relative">
          <Textarea
            id="composer-caption"
            {...register("text")}
            placeholder="What do you want to share? Start typing, then let AI help you find the right words."
            aria-invalid={!!errors.text}
            className="min-h-44 resize-y text-[15px] leading-relaxed"
          />
          {/* Floating toolbar */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-between gap-1">
            <div className="pointer-events-auto flex items-center gap-0.5 rounded-md border border-border/60 bg-background/90 p-0.5 backdrop-blur">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Bold (decorative)"
                title="Bold"
                onClick={() =>
                  setValue("text", text + "**bold**", { shouldValidate: true })
                }
              >
                <Bold className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Italic (decorative)"
                title="Italic"
                onClick={() =>
                  setValue("text", text + "_italic_", { shouldValidate: true })
                }
              >
                <Italic className="size-3.5" />
              </Button>

              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Insert emoji"
                    title="Emoji"
                  >
                    <Smile className="size-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Emojis
                  </p>
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setValue(
                            "text",
                            insertAtCursor(text, e),
                            { shouldValidate: true }
                          );
                          setEmojiOpen(false);
                        }}
                        className="flex size-7 items-center justify-center rounded-md text-base transition-colors hover:bg-accent"
                        aria-label={`Insert ${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={hashtagOpen} onOpenChange={setHashtagOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Insert hashtag"
                    title="Hashtag"
                  >
                    <Hash className="size-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Hashtags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {HASHTAGS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setValue(
                            "text",
                            insertAtCursor(text, h),
                            { shouldValidate: true }
                          );
                          setHashtagOpen(false);
                        }}
                        className="rounded-full bg-accent/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Char counter */}
            <div
              className={cn(
                "pointer-events-auto flex items-center gap-1.5 rounded-md border border-border/60 bg-background/90 px-2 py-1 text-[11px] tabular-nums backdrop-blur",
                counterColor
              )}
              aria-live="polite"
            >
              {over ? (
                <span className="font-medium">
                  {length - limit} over
                </span>
              ) : (
                <span>
                  {length} / {limit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Per-platform limit badges */}
        {selectedPlatforms.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Limits:</span>
            {selectedPlatforms.map((p) => {
              const pl = PLATFORM_LIMITS[p];
              const pOver = length > pl;
              return (
                <Badge
                  key={p}
                  variant="outline"
                  className={cn(
                    "gap-1 text-[10px] tabular-nums",
                    pOver
                      ? "border-destructive/30 text-destructive"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <PlatformIcon platform={p} className="size-2.5" />
                  {PLATFORMS[p].name}
                  <span className="opacity-70">{pl}</span>
                </Badge>
              );
            })}
          </div>
        )}

        {errors.text && (
          <p className="text-xs text-destructive">
            {errors.text.message as string}
          </p>
        )}
      </div>

      {/* AI suggestions */}
      {generateCaptions.isPending && (
        <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <Loader2 className="size-3 animate-spin" />
            Generating captions…
          </p>
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="shimmer h-12 rounded-md border border-border/60 bg-card"
              />
            ))}
          </div>
        </div>
      )}

      {!generateCaptions.isPending && captions.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3" />
              AI suggestions
            </p>
            <button
              type="button"
              onClick={() => setCaptions([])}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Dismiss suggestions"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {captions.map((c, i) => (
              <div
                key={i}
                className="rounded-md border border-border/60 bg-card p-2 text-left text-xs text-foreground"
              >
                <p className="whitespace-pre-wrap break-words">{c}</p>
                <div className="mt-1.5 flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      setValue("text", text + " " + c, {
                        shouldValidate: true,
                      })
                    }
                  >
                    Append
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      setValue("text", c, { shouldValidate: true });
                      setCaptions([]);
                      toast.success("Caption replaced");
                    }}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MediaPanel
        mediaIds={mediaIds}
        toggle={onToggleMedia}
        remove={onRemoveMedia}
        media={media}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live preview                                                      */
/* ------------------------------------------------------------------ */

function PlatformPreview({
  platform,
  text,
  scheduledAt,
  mediaIds,
  media,
}: {
  platform: PlatformId;
  text: string;
  scheduledAt: string;
  mediaIds: string[];
  media: {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
  }[];
}) {
  const meta = PLATFORMS[platform];
  const firstMedia = media.find((m) => m.id === mediaIds[0]);
  const dateLabel = scheduledAt
    ? format(parseISO(scheduledAt), "EEE, MMM d · h:mm a")
    : "Not scheduled";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 p-3">
          <Avatar
            name="Maya Okafor"
            color="from-primary to-mint"
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              Cadence
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              @{meta.id} · {meta.name}
            </p>
          </div>
          <PlatformBadge platform={platform} className="size-7" />
        </div>

        {/* Text */}
        <div className="px-3 pb-3">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {text || (
              <span className="text-muted-foreground/70">
                Your caption will appear here.
              </span>
            )}
          </p>
        </div>

        {/* Media */}
        {firstMedia && (
          <div className="overflow-hidden border-y border-border/60">
            <img
              src={firstMedia.thumbnailUrl ?? firstMedia.url}
              alt={firstMedia.name}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        )}

        {/* Engagement row */}
        <div className="flex items-center justify-between px-3 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
              </svg>
              <span className="tabular-nums">0</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z" />
              </svg>
              <span className="tabular-nums">0</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m4 12 8-8 8 8M12 4v16" />
              </svg>
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M17 21v-8H7M7 3v5h8" />
            </svg>
          </span>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
          {dateLabel}
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  platforms,
  text,
  scheduledAt,
  mediaIds,
  media,
}: {
  platforms: PlatformId[];
  text: string;
  scheduledAt: string;
  mediaIds: string[];
  media: {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
  }[];
}) {
  const [active, setActive] = React.useState<PlatformId | null>(null);
  React.useEffect(() => {
    if (platforms.length === 0) {
      setActive(null);
      return;
    }
    if (!active || !platforms.includes(active)) {
      setActive(platforms[0]);
    }
  }, [platforms, active]);

  if (platforms.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
          <Sparkles className="size-5" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Pick a channel to preview
          </p>
          <p className="mx-auto max-w-xs text-xs text-muted-foreground">
            Select at least one channel on the left and a realistic preview of
            your post will appear here.
          </p>
        </div>
      </div>
    );
  }

  if (platforms.length === 1) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <PlatformPreview
          platform={platforms[0]}
          text={text}
          scheduledAt={scheduledAt}
          mediaIds={mediaIds}
          media={media}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <Tabs
        value={active ?? platforms[0]}
        onValueChange={(v) => setActive(v as PlatformId)}
      >
        <TabsList className="mb-3 flex h-8 flex-wrap">
          {platforms.map((p) => (
            <TabsTrigger
              key={p}
              value={p}
              className="gap-1.5 px-2 text-xs"
              aria-label={`Preview ${PLATFORMS[p].name}`}
            >
              <PlatformBadge platform={p} className="size-4" />
              <span className="hidden sm:inline">{PLATFORMS[p].name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {platforms.map((p) => (
          <TabsContent key={p} value={p}>
            <PlatformPreview
              platform={p}
              text={text}
              scheduledAt={scheduledAt}
              mediaIds={mediaIds}
              media={media}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                         */
/* ------------------------------------------------------------------ */

export function ComposerView() {
  const setView = useApp((s) => s.setView);
  const createPost = useCreatePost();
  const { data: mediaData } = useMedia();
  const media = mediaData?.media ?? [];
  const { data: campaignsData } = useCampaigns();
  const campaigns = campaignsData?.campaigns ?? [];
  const { data: accountsData } = useAccounts();
  const connected = (accountsData?.accounts ?? []).filter((a) => a.connected);

  const defaults: FormValues = {
    text: "",
    platforms: [],
    scheduledAt: QUICK_PRESETS[2].compute().toISOString(),
    status: "scheduled",
    campaignId: null,
    mediaIds: [],
    addToQueue: true,
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // useWatch avoids the react-hook-form watch() lint warning.
  const text = useWatch({ control, name: "text" }) ?? "";
  const platforms = (useWatch({ control, name: "platforms" }) ??
    []) as PlatformId[];
  const scheduledAt = useWatch({ control, name: "scheduledAt" }) ?? "";
  const status = useWatch({ control, name: "status" }) ?? "scheduled";
  const mediaIds = useWatch({ control, name: "mediaIds" }) ?? [];

  const togglePlatform = (id: PlatformId) => {
    const current = new Set(platforms as string[]);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setValue("platforms", Array.from(current), { shouldValidate: true });
  };

  const selectAllConnected = () => {
    const ids = connected.map((a) => a.platform);
    setValue("platforms", Array.from(new Set(ids)), {
      shouldValidate: true,
    });
    if (ids.length > 0) {
      toast.success(`Selected ${ids.length} connected channels`);
    } else {
      toast.info("No connected channels yet");
    }
  };

  const clearPlatforms = () =>
    setValue("platforms", [], { shouldValidate: true });

  const toggleMedia = (id: string) => {
    const current = new Set(mediaIds);
    if (current.has(id)) current.delete(id);
    else {
      if (current.size >= 4) {
        toast.error("You can attach up to 4 media items");
        return;
      }
      current.add(id);
    }
    setValue("mediaIds", Array.from(current), { shouldValidate: true });
  };

  const removeMedia = (id: string) => {
    const current = new Set(mediaIds);
    current.delete(id);
    setValue("mediaIds", Array.from(current), { shouldValidate: true });
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      text: values.text,
      platforms: values.platforms as PlatformId[],
      scheduledAt: values.scheduledAt,
      status: values.status as PostStatus,
      campaignId: values.campaignId || null,
      mediaIds: values.mediaIds,
    };
    createPost.mutate(payload, {
      onSuccess: () => {
        toast.success(
          values.status === "scheduled"
            ? "Post scheduled"
            : values.status === "in-review"
              ? "Sent for review"
              : "Draft saved"
        );
        reset(defaults);
        setView("queue");
      },
      onError: () => toast.error("Couldn’t save post"),
    });
  };

  const handleSaveDraft = () => {
    const v = getValues();
    const payload = {
      text: v.text || "Untitled draft",
      platforms: (v.platforms.length
        ? v.platforms
        : (["instagram"] as PlatformId[])) as PlatformId[],
      scheduledAt: v.scheduledAt || new Date().toISOString(),
      status: "draft" as PostStatus,
      campaignId: v.campaignId || null,
      mediaIds: v.mediaIds,
    };
    createPost.mutate(payload, {
      onSuccess: () => {
        toast.success("Draft saved");
        reset(defaults);
        setView("queue");
      },
      onError: () => toast.error("Couldn’t save draft"),
    });
  };

  const handleDiscard = () => {
    reset(defaults);
    toast.info("Draft discarded");
    setView("queue");
  };

  const pending = createPost.isPending || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-[calc(100vh-9rem)] flex-col gap-5"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-coral to-amber-brand text-white shadow-sm">
              <PenSquare className="size-4" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Composer
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            Craft a post once, then publish it across every channel — with AI
            captions, per-platform limits, and a live preview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setView("calendar")}
          >
            <RotateCcw className="size-4" />
            Back to calendar
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)_minmax(360px,420px)]">
        {/* Left: platform + scheduling */}
        <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <PlatformPanel
              platforms={platforms}
              toggle={togglePlatform}
              selectAll={selectAllConnected}
              clearAll={clearPlatforms}
              connectedCount={connected.length}
            />
            {errors.platforms && (
              <p className="mt-2 text-xs text-destructive">
                {errors.platforms.message as string}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SchedulingPanel
              control={control}
              setValue={setValue}
              errors={errors}
              campaigns={campaigns}
              status={status}
              scheduledAt={scheduledAt}
            />
          </section>
        </aside>

        {/* Center: editor */}
        <section className="min-w-0">
          {/* Desktop: editor visible; Mobile: tab between editor & preview */}
          <div className="rounded-xl border border-border/60 bg-card p-4 lg:p-5">
            <EditorPanel
              control={control}
              setValue={setValue}
              register={register}
              errors={errors}
              platforms={platforms}
              text={text}
              mediaIds={mediaIds}
              onToggleMedia={toggleMedia}
              onRemoveMedia={removeMedia}
              media={media}
            />
          </div>
        </section>

        {/* Right: live preview (desktop only — mobile shows via tabs) */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Live preview
              </p>
              <span className="text-[10px] text-muted-foreground">
                {platforms.length} channel{platforms.length === 1 ? "" : "s"}
              </span>
            </div>
            <PreviewPanel
              platforms={platforms}
              text={text}
              scheduledAt={scheduledAt}
              mediaIds={mediaIds}
              media={media}
            />
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Preview is illustrative. Each platform will render your post with
              its own native layout, link previews, and limits.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile preview tab */}
      <div className="lg:hidden">
        <Tabs defaultValue="compose">
          <TabsList className="w-full">
            <TabsTrigger value="compose" className="flex-1">
              <PenSquare className="size-3.5" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              <Sparkles className="size-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="pt-3">
            <PreviewPanel
              platforms={platforms}
              text={text}
              scheduledAt={scheduledAt}
              mediaIds={mediaIds}
              media={media}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
            >
              <Trash2 className="size-4" />
              Discard
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard this draft?</AlertDialogTitle>
              <AlertDialogDescription>
                Your caption, channels, schedule, and media selections will be
                cleared. This can’t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDiscard}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={pending}
          >
            <Save className="size-4" />
            Save draft
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : status === "in-review" ? (
              <Send className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {status === "in-review"
              ? "Send for review"
              : status === "draft"
                ? "Save draft"
                : "Schedule"}
          </Button>
        </div>
      </div>
    </form>
  );
}
