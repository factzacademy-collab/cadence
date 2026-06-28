"use client";

import * as React from "react";
import {
  CalendarRange,
  CalendarDays,
  Megaphone,
  Users2,
  ClipboardList,
  Sparkles,
  Plus,
  Download,
  Eye,
  FileText,
  FileType,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Mail,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  formatCompact,
  formatDate,
} from "@/components/dashboard/shared";

/* ------------------------------------------------------------------ */
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

type ReportTemplateId =
  | "weekly"
  | "monthly"
  | "campaign"
  | "audience"
  | "content"
  | "custom";

interface ReportTemplate {
  id: ReportTemplateId;
  title: string;
  description: string;
  cadence: string;
  icon: LucideIcon;
  accent: string;
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: "weekly",
    title: "Weekly Summary",
    description:
      "A snapshot of last week’s performance across every connected channel.",
    cadence: "Sent every Monday at 9am",
    icon: CalendarRange,
    accent: "text-primary",
  },
  {
    id: "monthly",
    title: "Monthly Performance",
    description:
      "A deep dive into monthly KPIs, growth deltas, and standout posts.",
    cadence: "Sent on the 1st of each month",
    icon: CalendarDays,
    accent: "text-mint",
  },
  {
    id: "campaign",
    title: "Campaign Report",
    description:
      "Wrap a campaign with reach, engagement, and ROI metrics in one shareable PDF.",
    cadence: "Generated on demand",
    icon: Megaphone,
    accent: "text-coral",
  },
  {
    id: "audience",
    title: "Audience Growth",
    description:
      "Track follower momentum, demographics shifts, and top interest tags.",
    cadence: "Sent every other Friday",
    icon: Users2,
    accent: "text-plum",
  },
  {
    id: "content",
    title: "Content Audit",
    description:
      "An inventory of every published post grouped by topic, format and channel.",
    cadence: "Generated on demand",
    icon: ClipboardList,
    accent: "text-amber-brand",
  },
  {
    id: "custom",
    title: "Custom Report",
    description:
      "Build your own report from scratch with the metrics and channels you choose.",
    cadence: "One-off or recurring",
    icon: Sparkles,
    accent: "text-primary",
  },
];

interface ScheduledReport {
  id: string;
  name: string;
  cadence: string;
  recipients: string[];
  lastSent: string;
  nextRun: string;
  enabled: boolean;
  format: "PDF" | "CSV";
}

const SCHEDULED: ScheduledReport[] = [
  {
    id: "sch_1",
    name: "Weekly Summary — Leadership",
    cadence: "Mondays · 9:00am",
    recipients: ["maya@cadence.app", "leo@cadence.app", "priya@cadence.app"],
    lastSent: "2025-04-29T09:00:00.000Z",
    nextRun: "2025-05-06T09:00:00.000Z",
    enabled: true,
    format: "PDF",
  },
  {
    id: "sch_2",
    name: "Monthly Performance — Marketing",
    cadence: "Monthly · 1st · 8:00am",
    recipients: ["marketing@cadence.app", "growth@cadence.app"],
    lastSent: "2025-04-01T08:00:00.000Z",
    nextRun: "2025-05-01T08:00:00.000Z",
    enabled: true,
    format: "PDF",
  },
  {
    id: "sch_3",
    name: "Spring Launch 2025 — Campaign",
    cadence: "Weekly · Fridays · 4:00pm",
    recipients: ["campaigns@cadence.app"],
    lastSent: "2025-04-25T16:00:00.000Z",
    nextRun: "2025-05-02T16:00:00.000Z",
    enabled: false,
    format: "CSV",
  },
  {
    id: "sch_4",
    name: "Audience Growth — Bi-weekly",
    cadence: "Bi-weekly · Fridays · 10:00am",
    recipients: ["analytics@cadence.app", "social@cadence.app"],
    lastSent: "2025-04-18T10:00:00.000Z",
    nextRun: "2025-05-02T10:00:00.000Z",
    enabled: true,
    format: "PDF",
  },
];

interface GeneratedReport {
  id: string;
  name: string;
  template: ReportTemplateId;
  date: string;
  size: string;
  format: "PDF" | "CSV";
  author: string;
}

const GENERATED: GeneratedReport[] = [
  {
    id: "rep_1",
    name: "Weekly Summary — W17",
    template: "weekly",
    date: "2025-04-29T09:00:00.000Z",
    size: "1.4 MB",
    format: "PDF",
    author: "Maya Okafor",
  },
  {
    id: "rep_2",
    name: "April Performance Review",
    template: "monthly",
    date: "2025-04-01T08:00:00.000Z",
    size: "3.1 MB",
    format: "PDF",
    author: "Leo Brennan",
  },
  {
    id: "rep_3",
    name: "Spring Launch — Week 3",
    template: "campaign",
    date: "2025-04-25T16:00:00.000Z",
    size: "812 KB",
    format: "CSV",
    author: "Priya Sharma",
  },
  {
    id: "rep_4",
    name: "Q1 Audience Snapshot",
    template: "audience",
    date: "2025-04-18T10:00:00.000Z",
    size: "2.0 MB",
    format: "PDF",
    author: "Noah Lindqvist",
  },
  {
    id: "rep_5",
    name: "Content Audit — April",
    template: "content",
    date: "2025-04-15T14:00:00.000Z",
    size: "1.1 MB",
    format: "CSV",
    author: "Sofia Reyes",
  },
];

const PREVIEW_KPIS = [
  { label: "Impressions", value: "1.42M", delta: "+12.4%", accent: "text-primary" },
  { label: "Reach", value: "986K", delta: "+8.1%", accent: "text-mint" },
  { label: "Engagement", value: "74.3K", delta: "+18.9%", accent: "text-coral" },
  { label: "Clicks", value: "21.6K", delta: "+5.2%", accent: "text-amber-brand" },
];

const PREVIEW_SERIES = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  impressions: 18000 + Math.round(Math.sin(i / 2) * 6000 + i * 800),
  reach: 12000 + Math.round(Math.cos(i / 2) * 4000 + i * 600),
}));

/* ------------------------------------------------------------------ */
/* Custom tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <ul className="space-y-1">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: p.color ?? p.stroke ?? p.fill }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {formatCompact(Number(p.value))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generate report dialog                                             */
/* ------------------------------------------------------------------ */

function GenerateReportDialog({
  template,
  open,
  onOpenChange,
}: {
  template: ReportTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [format, setFormat] = React.useState<"PDF" | "CSV">("PDF");
  const [range, setRange] = React.useState<"7" | "30" | "90">("30");

  React.useEffect(() => {
    if (open) {
      setFormat("PDF");
      setRange("30");
    }
  }, [open]);

  if (!template) return null;
  const Icon = template.icon;

  const handleGenerate = () => {
    toast.success("Generating report…", {
      description: `${template.title} · ${format} · last ${range} days. We’ll email it to you when it’s ready.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg bg-accent/60",
                template.accent
              )}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base">
                Generate {template.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {template.cadence}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date range
            </Label>
            <RadioGroup
              value={range}
              onValueChange={(v) => setRange(v as "7" | "30" | "90")}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { v: "7", l: "Last 7 days" },
                { v: "30", l: "Last 30 days" },
                { v: "90", l: "Last 90 days" },
              ].map((o) => (
                <label
                  key={o.v}
                  htmlFor={`range-${o.v}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors",
                    range === o.v
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <RadioGroupItem value={o.v} id={`range-${o.v}`} />
                  {o.l}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Format
            </Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as "PDF" | "CSV")}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { v: "PDF", l: "PDF — polished", icon: FileText },
                { v: "CSV", l: "CSV — raw data", icon: FileType },
              ].map((o) => {
                const ItemIcon = o.icon;
                return (
                  <label
                    key={o.v}
                    htmlFor={`fmt-${o.v}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors",
                      format === o.v
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <RadioGroupItem value={o.v} id={`fmt-${o.v}`} />
                    <ItemIcon className="size-3.5" />
                    {o.l}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Channels
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Instagram",
                "X",
                "LinkedIn",
                "TikTok",
                "YouTube",
                "Facebook",
                "Threads",
                "Pinterest",
              ].map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-normal"
                >
                  {c}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              All connected channels are included by default.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            <Sparkles className="size-4" />
            Generate report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Report templates grid                                              */
/* ------------------------------------------------------------------ */

function ReportTemplates() {
  const [active, setActive] = React.useState<ReportTemplate | null>(null);

  return (
    <SectionCard
      title="Report templates"
      description="Start from a polished template or build your own"
      bodyClassName="p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <Card
              key={t.id}
              className="group relative gap-0 py-0 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <CardHeader className="gap-2 border-b border-border/60 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg bg-accent/60",
                      t.accent
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-background text-[10px] font-normal text-muted-foreground"
                  >
                    {t.id === "custom" ? "On demand" : "Recurring"}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold">
                  {t.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {t.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  <span className="truncate">{t.cadence}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setActive(t)}
                >
                  <Sparkles className="size-3.5" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <GenerateReportDialog
        template={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Scheduled reports table                                            */
/* ------------------------------------------------------------------ */

function ScheduledReports() {
  const [items, setItems] = React.useState<ScheduledReport[]>(SCHEDULED);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    const next = items.find((r) => r.id === id);
    if (next) {
      toast.info(next.enabled ? "Scheduled report paused" : "Scheduled report resumed", {
        description: next.name,
      });
    }
  };

  return (
    <SectionCard
      title="Scheduled reports"
      description="Recurring reports delivered to your team’s inbox"
      bodyClassName="p-0"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Name</TableHead>
            <TableHead className="hidden md:table-cell">Cadence</TableHead>
            <TableHead className="hidden lg:table-cell">Recipients</TableHead>
            <TableHead className="hidden sm:table-cell">Last sent</TableHead>
            <TableHead className="hidden md:table-cell">Next run</TableHead>
            <TableHead className="text-right pr-5">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="pl-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-md bg-accent/60 text-primary">
                    {r.format === "PDF" ? (
                      <FileText className="size-4" />
                    ) : (
                      <FileType className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.format}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {r.cadence}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span className="tabular-nums">{r.recipients.length}</span>
                  <span className="hidden xl:inline">
                    · {r.recipients[0]}
                    {r.recipients.length > 1 &&
                      ` +${r.recipients.length - 1}`}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-xs tabular-nums text-muted-foreground">
                {formatDate(r.lastSent, "MMM d, yyyy")}
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs tabular-nums text-muted-foreground">
                {formatDate(r.nextRun, "MMM d")}
              </TableCell>
              <TableCell className="pr-5">
                <div className="flex items-center justify-end gap-1">
                  <Switch
                    checked={r.enabled}
                    onCheckedChange={() => toggle(r.id)}
                    aria-label={`Toggle ${r.name}`}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground"
                        aria-label="Row actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Opening report editor", {
                            description: r.name,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          toast.error("Scheduled report removed", {
                            description: r.name,
                          })
                        }
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Report preview dialog                                              */
/* ------------------------------------------------------------------ */

function ReportPreviewDialog({
  report,
  open,
  onOpenChange,
}: {
  report: GeneratedReport | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base">
                {report.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {report.format} · {report.size} · generated{" "}
                {formatDate(report.date, "MMM d, yyyy")} by {report.author}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PREVIEW_KPIS.map((k) => (
              <div
                key={k.label}
                className="rounded-lg border border-border/70 bg-accent/30 p-3"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {k.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {k.value}
                </p>
                <p
                  className={cn(
                    "text-[11px] font-medium",
                    k.delta.startsWith("+") ? "text-mint" : "text-destructive"
                  )}
                >
                  {k.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div className="rounded-lg border border-border/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">
                Impressions & Reach
              </p>
              <p className="text-[11px] text-muted-foreground">Last 14 days</p>
            </div>
            <div
              className="h-40 w-full"
              role="img"
              aria-label="Mini chart of impressions and reach for the last 14 days"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={PREVIEW_SERIES}
                  margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
                >
                  <defs>
                    <linearGradient id="pv-imp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pv-reach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--mint)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                    content={<ChartTooltip />}
                  />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    name="Impressions"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#pv-imp)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    name="Reach"
                    stroke="var(--mint)"
                    strokeWidth={2}
                    fill="url(#pv-reach)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top posts table */}
          <div className="rounded-lg border border-border/70">
            <div className="border-b border-border/60 px-3 py-2">
              <p className="text-xs font-medium text-foreground">
                Top performing posts
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-3 text-[10px]">Post</TableHead>
                  <TableHead className="text-right text-[10px]">
                    Impressions
                  </TableHead>
                  <TableHead className="text-right pr-3 text-[10px]">
                    Eng. rate
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { t: "Spring launch hero thread", i: "48.2K", e: "6.4%" },
                  { t: "Creator series — Maya", i: "32.7K", e: "5.1%" },
                  { t: "Behind the scenes reel", i: "28.1K", e: "7.8%" },
                  { t: "Q2 awareness carousel", i: "21.6K", e: "4.3%" },
                ].map((row) => (
                  <TableRow key={row.t}>
                    <TableCell className="pl-3 py-2 text-xs text-foreground">
                      {row.t}
                    </TableCell>
                    <TableCell className="text-right py-2 text-xs tabular-nums">
                      {row.i}
                    </TableCell>
                    <TableCell className="text-right py-2 pr-3 text-xs tabular-nums text-muted-foreground">
                      {row.e}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() =>
              toast.info("Downloading…", {
                description: `${report.name}.${report.format.toLowerCase()}`,
              })
            }
          >
            <Download className="size-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Recent reports list                                                */
/* ------------------------------------------------------------------ */

function RecentReports() {
  const [preview, setPreview] = React.useState<GeneratedReport | null>(null);

  return (
    <SectionCard
      title="Recent reports"
      description="Generated reports ready to share or download"
      bodyClassName="p-0"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Report</TableHead>
            <TableHead className="hidden md:table-cell">Template</TableHead>
            <TableHead className="hidden sm:table-cell">Generated</TableHead>
            <TableHead className="hidden lg:table-cell">Author</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="text-right pr-5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {GENERATED.map((r) => {
            const tpl = TEMPLATES.find((t) => t.id === r.template);
            return (
              <TableRow key={r.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-md bg-accent/60 text-primary">
                      {r.format === "PDF" ? (
                        <FileText className="size-4" />
                      ) : (
                        <FileType className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {r.format}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className="bg-background text-[11px] font-normal text-muted-foreground"
                  >
                    {tpl?.title ?? r.template}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs tabular-nums text-muted-foreground">
                  {formatDate(r.date, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {r.author}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs tabular-nums text-muted-foreground">
                  {r.size}
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label={`Preview ${r.name}`}
                      onClick={() => setPreview(r)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label={`Download ${r.name}`}
                      onClick={() =>
                        toast.info("Downloading…", {
                          description: `${r.name}.${r.format.toLowerCase()}`,
                        })
                      }
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ReportPreviewDialog
        report={preview}
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
      />
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Export bar                                                         */
/* ------------------------------------------------------------------ */

function ExportBar() {
  const buttons: {
    label: string;
    icon: LucideIcon;
    toast: string;
  }[] = [
    {
      label: "Export PDF",
      icon: FileText,
      toast: "Exporting PDF…",
    },
    {
      label: "Export CSV",
      icon: FileType,
      toast: "Exporting CSV…",
    },
    {
      label: "Export chart PNG",
      icon: ImageIcon,
      toast: "Exporting chart PNG…",
    },
  ];
  return (
    <SectionCard
      title="Quick export"
      description="Grab the latest data in the format your stakeholders prefer"
      bodyClassName="p-4 sm:p-5"
    >
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const Icon = b.icon;
          return (
            <Button
              key={b.label}
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() =>
                toast.info(b.toast, {
                  description: "Your export will download in a moment.",
                })
              }
            >
              <Icon className="size-4" />
              {b.label}
            </Button>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                          */
/* ------------------------------------------------------------------ */

export function ReportsView() {
  const [loading] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Build, schedule and share beautiful performance reports with stakeholders."
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast.info("Starting a custom report", {
                description: "Pick a template or start from scratch.",
              })
            }
          >
            <Plus className="size-4" />
            New report
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <ReportTemplates />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <RecentReports />
        </div>
        <div className="space-y-6">
          <ExportBar />
          <SectionCard
            title="Tips"
            description="Get the most out of Cadence reports"
            bodyClassName="p-4"
          >
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>
                  Schedule a Weekly Summary to land in leadership inboxes
                  every Monday at 9am.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>
                  Use campaign reports to wrap a launch with reach, engagement
                  and ROI in one PDF.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>
                  Add viewers as recipients — they get a read-only snapshot
                  without dashboard access.
                </span>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <ScheduledReports />
    </div>
  );
}
