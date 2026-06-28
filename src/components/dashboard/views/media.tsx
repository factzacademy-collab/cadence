"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Search,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Image as ImageIcon,
  Video,
  MoreHorizontal,
  Copy,
  Trash2,
  Download,
  Pencil,
  Check,
  X,
  HardDrive,
  Film,
  Sparkles,
  Plus,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useApp } from "@/lib/store";
import { useMedia } from "@/hooks/use-api";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatSize(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function MediaView() {
  const { data, isLoading } = useMedia();
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "image" | "video">("all");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<"newest" | "name" | "size">("newest");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<MediaAsset | null>(null);

  const openComposer = useApp((s) => s.openComposer);
  const media = data?.media ?? [];

  const allTags = React.useMemo(
    () => Array.from(new Set(media.flatMap((m) => m.tags))),
    [media]
  );

  const filtered = React.useMemo(() => {
    let out = media.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (tagFilter && !m.tags.includes(tagFilter)) return false;
      if (query && !m.name.toLowerCase().includes(query.toLowerCase()) && !m.tags.some((t) => t.includes(query.toLowerCase()))) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "size") return b.sizeKb - a.sizeKb;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return out;
  }, [media, typeFilter, tagFilter, query, sort]);

  const totalSize = media.reduce((a, b) => a + b.sizeKb, 0);
  const stats = {
    total: media.length,
    images: media.filter((m) => m.type === "image").length,
    videos: media.filter((m) => m.type === "video").length,
    size: totalSize,
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (m: MediaAsset) => {
    toast.success(`${m.name} deleted`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Media library"
        description="Your images and videos, ready to drop into any post."
        actions={
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button><Upload className="size-4" />Upload</Button>
            </DialogTrigger>
            <UploadDialog onClose={() => setUploadOpen(false)} />
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total assets" value={stats.total} icon={ImageIcon} accent="text-primary" />
        <StatCard label="Images" value={stats.images} icon={ImageIcon} accent="text-mint" />
        <StatCard label="Videos" value={stats.videos} icon={Film} accent="text-coral" />
        <StatCard label="Storage used" value={formatSize(stats.size)} deltaLabel="of 10 GB" icon={HardDrive} accent="text-plum" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or tag…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9" />
          </div>
          <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="image" className="text-xs">Images</TabsTrigger>
              <TabsTrigger value="video" className="text-xs">Videos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 capitalize">
                {sort === "newest" ? "Newest" : sort === "name" ? "Name" : "Size"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("newest")}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("size")}>Size</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center rounded-lg border border-border/70 bg-card p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn("rounded p-1.5", view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground")}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("rounded p-1.5", view === "list" ? "bg-accent text-foreground" : "text-muted-foreground")}
              aria-label="List view"
            >
              <ListIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Tags:</span>
          <button
            onClick={() => setTagFilter(null)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs transition-colors",
              !tagFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs capitalize transition-colors",
                tagFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="sticky top-2 z-10 flex items-center justify-between rounded-xl border border-primary/30 bg-card/95 px-4 py-2.5 shadow-md backdrop-blur">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => { openComposer(); toast.info(`${selected.size} assets ready in composer`); }}>
              <Plus className="size-4" /> Use in post
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Tags added")}>
              <Pencil className="size-4" /> Add tags
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { toast.success(`${selected.size} assets deleted`); setSelected(new Set()); }}>
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setSelected(new Set())} aria-label="Clear selection">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media yet"
          description="Upload images and videos to use across your posts."
          action={<Button onClick={() => setUploadOpen(true)}><Upload className="size-4" />Upload media</Button>}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((m) => (
            <MediaGridCard
              key={m.id}
              media={m}
              selected={selected.has(m.id)}
              onToggle={() => toggleSelect(m.id)}
              onOpen={() => setDetail(m)}
              onDelete={() => handleDelete(m)}
              onUse={() => openComposer()}
            />
          ))}
        </div>
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="overflow-x-auto scrollbar-cadence">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
                    </TableCell>
                    <TableCell>
                      <button className="flex items-center gap-2" onClick={() => setDetail(m)}>
                        <img src={m.thumbnailUrl} alt={m.name} className="size-9 rounded object-cover" loading="lazy" />
                        <span className="text-sm font-medium hover:text-primary">{m.name}</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize gap-1">
                        {m.type === "video" ? <Video className="size-3" /> : <ImageIcon className="size-3" />}
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{m.width}×{m.height}</TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{formatSize(m.sizeKb)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {m.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px] capitalize">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(m.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <MediaActions media={m} onOpen={() => setDetail(m)} onDelete={() => handleDelete(m)} onUse={() => openComposer()} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detail.name}
                  <Badge variant="outline" className="capitalize">{detail.type}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {detail.width}×{detail.height} · {formatSize(detail.sizeKb)} · {format(new Date(detail.createdAt), "MMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-border/60">
                <img src={detail.url} alt={detail.name} className="max-h-[50vh] w-full object-contain bg-muted/30" />
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {detail.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>
                    ))}
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => toast.info("Tag editor coming soon")}>
                      <Pencil className="size-3" /> Edit tags
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { toast.success("URL copied"); }}>
                  <Copy className="size-4" /> Copy URL
                </Button>
                <Button onClick={() => { openComposer(); setDetail(null); toast.success("Added to composer"); }}>
                  <Plus className="size-4" /> Use in post
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaGridCard({
  media,
  selected,
  onToggle,
  onOpen,
  onDelete,
  onUse,
}: {
  media: MediaAsset;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onUse: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border/70 hover:border-border hover:shadow-sm"
      )}
    >
      <button onClick={onOpen} className="block aspect-square w-full overflow-hidden bg-muted/40" aria-label={`Open ${media.name}`}>
        <img
          src={media.thumbnailUrl}
          alt={media.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>
      {media.type === "video" && (
        <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
          <Video className="size-3.5" />
        </span>
      )}
      <button
        onClick={onToggle}
        className={cn(
          "absolute right-2 top-2 flex size-6 items-center justify-center rounded-md border backdrop-blur transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-white/40 bg-black/30 text-white opacity-0 group-hover:opacity-100"
        )}
        aria-label={selected ? "Deselect" : "Select"}
      >
        {selected && <Check className="size-3.5" />}
      </button>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium" title={media.name}>{media.name}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
          {formatSize(media.sizeKb)} · {media.width}×{media.height}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 transition-transform group-hover:translate-y-0">
        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={onUse}>
          <Plus className="size-3" /> Use
        </Button>
        <MediaActions media={media} onOpen={onOpen} onDelete={onDelete} onUse={onUse} compact />
      </div>
    </div>
  );
}

function MediaActions({
  media,
  onOpen,
  onDelete,
  onUse,
  compact,
}: {
  media: MediaAsset;
  onOpen: () => void;
  onDelete: () => void;
  onUse: () => void;
  compact?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={compact ? "secondary" : "ghost"} size={compact ? "icon" : "icon"} className={cn(compact && "size-7")} aria-label="Media actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onUse}>
          <Plus className="size-4" /> Use in post
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpen}>
          <Pencil className="size-4" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigator.clipboard?.writeText(media.url).catch(() => {}); toast.success("URL copied"); }}>
          <Copy className="size-4" /> Copy URL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info(`Downloading ${media.name}…`)}>
          <Download className="size-4" /> Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"image" | "video">("image");
  const [dragOver, setDragOver] = React.useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    toast.success(`${name} uploaded to your library`);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload media</DialogTitle>
        <DialogDescription>Drag and drop or browse to add images and videos.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); toast.info("File received"); }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver ? "border-primary bg-accent/40" : "border-border/70 bg-muted/30"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-medium">Drop files here</p>
          <p className="text-xs text-muted-foreground">or click to browse · PNG, JPG, MP4 up to 50MB</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="up-name">Asset name</Label>
            <Input id="up-name" placeholder="spring-launch-hero" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(["image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm capitalize transition-colors",
                    type === t ? "border-primary bg-accent/40" : "border-border/60 hover:bg-accent/30"
                  )}
                >
                  {t === "image" ? <ImageIcon className="size-4" /> : <Video className="size-4" />}
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-mint/10 p-3 text-xs text-mint">
          <Sparkles className="size-4 shrink-0" />
          Tip: descriptive names make assets easier to find later.
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>Upload asset</Button>
      </DialogFooter>
    </DialogContent>
  );
}
