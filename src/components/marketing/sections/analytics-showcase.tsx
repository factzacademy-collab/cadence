"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Check, TrendingUp, Users2, MousePointerClick } from "lucide-react";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

const CHART_DATA = [
  { week: "W1", impressions: 8200, engagement: 540 },
  { week: "W2", impressions: 9600, engagement: 720 },
  { week: "W3", impressions: 9100, engagement: 690 },
  { week: "W4", impressions: 12400, engagement: 980 },
  { week: "W5", impressions: 13800, engagement: 1120 },
  { week: "W6", impressions: 13200, engagement: 1040 },
  { week: "W7", impressions: 16700, engagement: 1380 },
  { week: "W8", impressions: 19400, engagement: 1620 },
  { week: "W9", impressions: 21800, engagement: 1890 },
  { week: "W10", impressions: 24600, engagement: 2210 },
  { week: "W11", impressions: 27800, engagement: 2580 },
  { week: "W12", impressions: 31200, engagement: 2940 },
];

const BULLETS = [
  "Cross-channel impressions, reach, and engagement in one view",
  "Audience growth trends with cohort breakdowns",
  "Best-time-to-publish suggestions backed by your data",
  "One-click exports for stakeholder reports",
];

interface TooltipPayload {
  payload: { week: string; impressions: number; engagement: number };
}
interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{p.week}</p>
      <p className="mt-1 text-muted-foreground">
        Impressions:{" "}
        <span className="font-semibold text-primary">
          {p.impressions.toLocaleString()}
        </span>
      </p>
      <p className="text-muted-foreground">
        Engagement:{" "}
        <span className="font-semibold text-coral">
          {p.engagement.toLocaleString()}
        </span>
      </p>
    </div>
  );
}

function KpiChip({
  icon: Icon,
  label,
  value,
  className,
  iconClass,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
  iconClass?: string;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "animate-float rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl",
        className
      )}
      style={delay ? { animationDelay: delay } : undefined}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsShowcase() {
  const goApp = useApp((s) => s.goApp);

  return (
    <section
      id="analytics"
      aria-labelledby="analytics-heading"
      className="border-y border-border/60 bg-canvas/40 py-20 sm:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: copy */}
        <div className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Analytics that respect your time
          </p>
          <h2
            id="analytics-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Stop exporting spreadsheets. Start making decisions.
          </h2>
          <p className="text-base text-muted-foreground text-pretty">
            Every metric you actually need, none of the noise. Cadence rolls up
            performance across every channel so you can spot the trend in
            seconds, not afternoons.
          </p>
          <ul role="list" className="flex flex-col gap-3">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <div>
            <Button onClick={() => goApp("overview")} size="lg">
              <TrendingUp className="size-4" />
              Explore the dashboard
            </Button>
          </div>
        </div>

        {/* Right: mock chart */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 via-mint/10 to-coral/15 blur-2xl"
          />
          <div className="glass rounded-2xl border border-border/70 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Impressions & engagement
                </p>
                <p className="text-xs text-muted-foreground">Last 12 weeks · all channels</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" /> Impressions
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-coral" /> Engagement
                </span>
              </div>
            </div>
            <div className="h-56 w-full sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={CHART_DATA}
                  margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
                >
                  <defs>
                    <linearGradient id="cadImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="cadEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--coral)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#cadImp)"
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="var(--coral)"
                    strokeWidth={2}
                    fill="url(#cadEng)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Floating KPIs */}
          <div className="absolute -left-4 top-8 hidden sm:block">
            <KpiChip
              icon={Users2}
              label="Followers"
              value="+18.4k"
              iconClass="bg-primary/12 text-primary"
            />
          </div>
          <div className="absolute -right-4 bottom-10 hidden sm:block">
            <KpiChip
              icon={MousePointerClick}
              label="Click-through"
              value="3.7%"
              iconClass="bg-coral/12 text-coral"
              delay="1.1s"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
