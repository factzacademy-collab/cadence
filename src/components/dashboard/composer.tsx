"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { PLATFORM_LIST, PLATFORMS, type PlatformId } from "@/lib/brand";
import type { PostStatus } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlatformBadge, PlatformIcon } from "@/components/brand/platform-icon";
import {
  usePosts,
  useCreatePost,
  useUpdatePost,
  useMedia,
  useCampaigns,
  useGenerateCaptions,
} from "@/hooks/use-api";
import { Avatar } from "@/components/dashboard/shared";

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
];

const schema = z.object({
  text: z.string().min(1, "Caption is required"),
  platforms: z.array(z.string()).min(1, "Pick at least one platform"),
  scheduledAt: z.string().min(1, "Pick a date and time"),
  status: z.enum(["draft", "scheduled", "in-review"]),
  campaignId: z.string().optional().nullable(),
  mediaIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

function toLocalInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function quickPreset(label: string): string {
  const now = new Date();
  if (label === "Now") return now.toISOString();
  if (label === "Tomorrow 9am") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }
  if (label === "Next week 9am") {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }
  return now.toISOString();
}

export function Composer() {
  const open = useApp((s) => s.composerOpen);
  const closeComposer = useApp((s) => s.closeComposer);
  const postId = useApp((s) => s.composerPostId);

  const { data: postsData } = usePosts();
  const posts = postsData?.posts ?? [];
  const editing = postId ? posts.find((p) => p.id === postId) : undefined;

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const { data: mediaData } = useMedia();
  const media = mediaData?.media ?? [];
  const { data: campaignsData } = useCampaigns();
  const campaigns = campaignsData?.campaigns ?? [];
  const generateCaptions = useGenerateCaptions();

  const [captions, setCaptions] = React.useState<string[]>([]);
  const [tone, setTone] = React.useState(TONES[0]);
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);

  const defaults: FormValues = {
    text: "",
    platforms: [],
    scheduledAt: quickPreset("Tomorrow 9am"),
    status: "scheduled",
    campaignId: null,
    mediaIds: [],
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // Hydrate form when opening / switching post.
  React.useEffect(() => {
    if (!open) {
      setCaptions([]);
      return;
    }
    if (editing) {
      reset({
        text: editing.text,
        platforms: editing.platforms,
        scheduledAt: editing.scheduledAt,
        status: (editing.status === "published" || editing.status === "failed"
          ? "scheduled"
          : editing.status) as FormValues["status"],
        campaignId: editing.campaignId ?? null,
        mediaIds: editing.mediaIds,
      });
    } else {
      reset(defaults);
    }
    setCaptions([]);
     
  }, [open, postId, editing?.id]);

  const text = watch("text") ?? "";
  const platforms = watch("platforms") ?? [];
  const scheduledAt = watch("scheduledAt") ?? "";
  const mediaIds = watch("mediaIds") ?? [];
  const status = watch("status");

  const selectedPlatforms = platforms as PlatformId[];
  const limit = selectedPlatforms.length
    ? Math.min(...selectedPlatforms.map((p) => PLATFORM_LIMITS[p]))
    : 280;
  const over = text.length > limit;
  const previewMedia = media.find((m) => m.id === mediaIds[0]);

  const togglePlatform = (id: PlatformId) => {
    const current = new Set(platforms as string[]);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setValue("platforms", Array.from(current), { shouldValidate: true });
  };

  const toggleMedia = (id: string) => {
    const current = new Set(mediaIds);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setValue("mediaIds", Array.from(current), { shouldValidate: true });
  };

  const handleGenerate = async () => {
    const topic = text.trim() || "an exciting Cadence product update";
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
    } catch {
      toast.error("Couldn’t generate captions. Try again.");
    }
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
    if (editing) {
      updatePost.mutate(
        { id: editing.id, patch: payload },
        {
          onSuccess: () => {
            toast.success("Post updated");
            closeComposer();
          },
          onError: () => toast.error("Couldn’t update post"),
        }
      );
    } else {
      createPost.mutate(payload, {
        onSuccess: () => {
          toast.success(
            values.status === "scheduled"
              ? "Post scheduled"
              : values.status === "in-review"
                ? "Sent for review"
                : "Draft saved"
          );
          closeComposer();
        },
        onError: () => toast.error("Couldn’t save post"),
      });
    }
  };

  const handleDiscard = () => {
    reset(defaults);
    setCaptions([]);
    closeComposer();
    toast.info("Draft discarded");
  };

  const pending = createPost.isPending || updatePost.isPending;

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? null : closeComposer())}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-2xl lg:max-w-5xl"
      >
        <SheetHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/70 px-5 py-3.5">
          <div className="space-y-0.5">
            <SheetTitle className="text-base font-semibold">
              {editing ? "Edit post" : "Create post"}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Compose once, publish across every channel.
            </SheetDescription>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <ScrollArea className="min-h-0 flex-1">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_minmax(320px,420px)]">
              {/* Editor */}
              <div className="space-y-5 p-5">
                {/* Platforms */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Channels
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_LIST.map((p) => {
                      const selected = platforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlatform(p.id)}
                          aria-pressed={selected}
                          className={cn(
                            "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                              ? "border-primary/30 bg-primary/10 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-accent/60"
                          )}
                        >
                          <PlatformBadge
                            platform={p.id}
                            className="size-5"
                          />
                          <span>{p.name}</span>
                          {selected && (
                            <Check className="size-3 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.platforms && (
                    <p className="text-xs text-destructive">
                      {errors.platforms.message as string}
                    </p>
                  )}
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="caption"
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Caption
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger size="sm" className="h-7 w-32 text-xs">
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
                        onClick={handleGenerate}
                        disabled={generateCaptions.isPending}
                        className="h-7"
                      >
                        {generateCaptions.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="size-3.5 text-primary" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="caption"
                    {...register("text")}
                    placeholder="What do you want to share?"
                    className="min-h-32 resize-y"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {selectedPlatforms.length === 0
                        ? "Pick a channel to see its limit"
                        : `Most restrictive: ${PLATFORMS[selectedPlatforms[0]]?.name} · ${limit}`}
                    </span>
                    <span
                      className={cn(
                        "tabular-nums",
                        over ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {text.length} / {limit}
                    </span>
                  </div>
                  {errors.text && (
                    <p className="text-xs text-destructive">
                      {errors.text.message as string}
                    </p>
                  )}

                  {/* AI suggestions */}
                  {captions.length > 0 && (
                    <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <Sparkles className="size-3" />
                        AI suggestions
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {captions.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setValue("text", c, { shouldValidate: true });
                              setCaptions([]);
                            }}
                            className="rounded-md border border-border/60 bg-card p-2 text-left text-xs text-foreground transition-colors hover:bg-accent/60"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Media */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Media
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Popover open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                        >
                          <ImageIcon className="size-3.5" />
                          Add media
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2" align="start">
                        <div className="mb-1.5 flex items-center justify-between px-1">
                          <p className="text-xs font-semibold">Media library</p>
                          <span className="text-[10px] text-muted-foreground">
                            {media.length} assets
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
                                  onClick={() => toggleMedia(m.id)}
                                  className={cn(
                                    "relative aspect-square overflow-hidden rounded-md border transition-colors",
                                    sel
                                      ? "border-primary ring-2 ring-primary/30"
                                      : "border-border hover:border-primary/40"
                                  )}
                                >
                                  { }
                                  <img
                                    src={m.thumbnailUrl ?? m.url}
                                    alt={m.name}
                                    className="size-full object-cover"
                                  />
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
                        {mediaIds.slice(0, 4).map((id) => {
                          const m = media.find((x) => x.id === id);
                          if (!m) return null;
                          return (
                            <div
                              key={id}
                              className="group relative size-12 overflow-hidden rounded-md border border-border"
                            >
                              { }
                              <img
                                src={m.thumbnailUrl ?? m.url}
                                alt={m.name}
                                className="size-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => toggleMedia(id)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                aria-label={`Remove ${m.name}`}
                              >
                                <Trash2 className="size-3.5 text-white" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Schedule
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        {...register("scheduledAt")}
                        value={toLocalInputValue(scheduledAt)}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) return;
                          const d = new Date(v);
                          setValue("scheduledAt", d.toISOString(), {
                            shouldValidate: true,
                          });
                        }}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {["Now", "Tomorrow 9am", "Next week 9am"].map((p) => (
                        <Button
                          key={p}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 text-xs"
                          onClick={() =>
                            setValue("scheduledAt", quickPreset(p), {
                              shouldValidate: true,
                            })
                          }
                        >
                          <Clock className="size-3" />
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {errors.scheduledAt && (
                    <p className="text-xs text-destructive">
                      {errors.scheduledAt.message as string}
                    </p>
                  )}
                </div>

                {/* Campaign + status */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="No campaign" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No campaign</SelectItem>
                            {campaigns.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                <span
                                  className="mr-1.5 inline-block size-2 rounded-full"
                                  style={{ background: c.color }}
                                />
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
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
                </div>
              </div>

              {/* Preview */}
              <div className="border-t border-border/70 bg-muted/30 p-5 lg:border-l lg:border-t-0">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Live preview
                </p>
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Avatar name="Maya Okafor" color="from-primary to-mint" size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Cadence
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sponsored · {selectedPlatforms.length} channel
                        {selectedPlatforms.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex -space-x-1.5">
                      {selectedPlatforms.slice(0, 3).map((p) => (
                        <PlatformBadge
                          key={p}
                          platform={p}
                          className="size-6 ring-2 ring-card"
                        />
                      ))}
                      {selectedPlatforms.length === 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          no channels
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-foreground">
                    {text || (
                      <span className="text-muted-foreground">
                        Your caption will appear here.
                      </span>
                    )}
                  </p>

                  {previewMedia && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
                      { }
                      <img
                        src={previewMedia.thumbnailUrl ?? previewMedia.url}
                        alt={previewMedia.name}
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
                    <span>
                      {scheduledAt
                        ? format(new Date(scheduledAt), "EEE, MMM d · h:mm a")
                        : "Not scheduled"}
                    </span>
                    {status && (
                      <Badge variant="outline" className="capitalize">
                        {status}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Preview is illustrative. Each platform will render your post
                  with its own native layout and limits.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-background px-5 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              disabled={pending}
            >
              <Trash2 className="size-4" />
              Discard
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending || isSubmitting}
                onClick={() => {
                  const v = getValues();
                  const payload = {
                    text: v.text || "Untitled draft",
                    platforms: (v.platforms.length
                      ? v.platforms
                      : ["instagram"]) as PlatformId[],
                    scheduledAt: v.scheduledAt || new Date().toISOString(),
                    status: "draft" as PostStatus,
                    campaignId: v.campaignId || null,
                    mediaIds: v.mediaIds,
                  };
                  if (editing) {
                    updatePost.mutate(
                      { id: editing.id, patch: payload },
                      {
                        onSuccess: () => {
                          toast.success("Draft saved");
                          closeComposer();
                        },
                        onError: () => toast.error("Couldn’t save draft"),
                      }
                    );
                  } else {
                    createPost.mutate(payload, {
                      onSuccess: () => {
                        toast.success("Draft saved");
                        closeComposer();
                      },
                      onError: () => toast.error("Couldn’t save draft"),
                    });
                  }
                }}
              >
                Save draft
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={pending || isSubmitting}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {status === "in-review" ? "Send for review" : "Schedule"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
