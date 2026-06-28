"use client";

import * as React from "react";
import {
  CreditCard,
  Download,
  Check,
  Zap,
  TrendingUp,
  HardDrive,
  Sparkles,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { PRICING } from "@/lib/data/mock";
import { cn } from "@/lib/utils";

const INVOICES = [
  { id: "inv_1", date: "Jun 1, 2025", amount: 54, status: "Paid" },
  { id: "inv_2", date: "May 1, 2025", amount: 54, status: "Paid" },
  { id: "inv_3", date: "Apr 1, 2025", amount: 54, status: "Paid" },
  { id: "inv_4", date: "Mar 1, 2025", amount: 36, status: "Paid" },
  { id: "inv_5", date: "Jul 1, 2025", amount: 54, status: "Upcoming" },
];

const USAGE = [
  { label: "Posts this month", value: 142, max: 1000, icon: TrendingUp, accent: "text-primary" },
  { label: "Media storage", value: 4.2, max: 10, unit: "GB", icon: HardDrive, accent: "text-coral" },
  { label: "AI credits used", value: 318, max: 500, icon: Sparkles, accent: "text-plum" },
];

export function BillingView() {
  const [cycle, setCycle] = React.useState<"monthly" | "annual">("monthly");
  const [changeOpen, setChangeOpen] = React.useState(false);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Billing & plan"
        description="Manage your subscription, usage, and payment method."
        actions={
          <Button variant="outline" onClick={() => toast.info("Exporting invoices…")}>
            <Download className="size-4" />
            Export invoices
          </Button>
        }
      />

      {/* Current plan + Usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              <Zap className="size-3" />
              Current plan
            </Badge>
            <span className="text-2xl font-bold tracking-tight">$18</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Team</h3>
          <p className="text-sm text-muted-foreground">per seat / month, billed monthly</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Seats</dt>
              <dd className="font-medium">6 / 12</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Renews</dt>
              <dd className="font-medium">Jul 1, 2025</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">$108.00 / month</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-2">
            <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">Manage plan</Button>
              </DialogTrigger>
              <PlanDialog cycle={cycle} setCycle={setCycle} onClose={() => setChangeOpen(false)} />
            </Dialog>
            <Button variant="outline" onClick={() => toast.info("Cancel flow started")}>
              Cancel
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Usage this month"
          description="Resets on the 1st of each month"
          className="lg:col-span-2"
        >
          <div className="space-y-5">
            {USAGE.map((u) => {
              const pct = Math.min(100, (u.value / u.max) * 100);
              const Icon = u.icon;
              return (
                <div key={u.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className={cn("size-4", u.accent)} />
                      {u.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {u.value}
                      {u.unit ? u.unit : ""} / {u.max}
                      {u.unit ? u.unit : ""}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums">142</p>
              <p className="text-xs text-muted-foreground">Posts scheduled</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">98</p>
              <p className="text-xs text-muted-foreground">Posts published</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">318</p>
              <p className="text-xs text-muted-foreground">AI captions</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Payment method */}
      <SectionCard
        title="Payment method"
        description="Your default card for subscription renewals"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.info("Opening payment editor…")}>
            Update
          </Button>
        }
      >
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 text-white">
            <CreditCard className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">Visa ending in 4242</p>
            <p className="text-xs text-muted-foreground">Expires 09/2027 · Default</p>
          </div>
          <Badge variant="outline" className="border-mint/30 text-mint">
            Active
          </Badge>
        </div>
      </SectionCard>

      {/* Invoices */}
      <SectionCard
        title="Billing history"
        description="Download past invoices"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto scrollbar-cadence">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="text-sm">{inv.date}</TableCell>
                  <TableCell className="tabular-nums">${inv.amount}.00</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        inv.status === "Paid"
                          ? "border-mint/30 text-mint"
                          : "border-amber-brand/30 text-amber-brand"
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => toast.info(`Downloading ${inv.id}…`)}
                      aria-label="Download invoice"
                    >
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Billing address */}
      <SectionCard
        title="Billing details"
        description="Used on all invoices"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Billing details saved")}>
            Save
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Company</p>
            <p className="text-sm font-medium">Cadence Labs Inc.</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tax ID</p>
            <p className="text-sm font-medium">EU-92837465X</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="text-sm font-medium">221B Rhythm Street, Lisbon 1100-001, PT</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billing email</p>
            <p className="text-sm font-medium">finance@cadence.app</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function PlanDialog({
  cycle,
  setCycle,
  onClose,
}: {
  cycle: "monthly" | "annual";
  setCycle: (c: "monthly" | "annual") => void;
  onClose: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Choose your plan</DialogTitle>
        <DialogDescription>
          Switch plans anytime. Annual billing saves 20%.
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center justify-center gap-2 py-2">
        <button
          onClick={() => setCycle("monthly")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setCycle("annual")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            cycle === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          )}
        >
          Annual <span className="ml-1 text-xs text-mint">−20%</span>
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {PRICING.map((p) => {
          const price = cycle === "annual" ? Math.round(p.price * 0.8) : p.price;
          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl border p-4",
                p.highlight
                  ? "border-primary/40 bg-accent/30 ring-1 ring-primary/20"
                  : "border-border/70 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.highlight && (
                  <Badge className="border-primary/20 bg-primary/10 text-primary">Current</Badge>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">${price}</span>
                <span className="text-xs text-muted-foreground">/seat/mo</span>
              </div>
              <ul className="mt-3 flex-1 space-y-1.5">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="mt-0.5 size-3 shrink-0 text-mint" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant={p.highlight ? "outline" : "default"}
                className="mt-4"
                disabled={p.highlight}
                onClick={() => {
                  toast.success(`Switched to ${p.name} (${cycle})`);
                  onClose();
                }}
              >
                {p.highlight ? "Current plan" : `Switch to ${p.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </DialogContent>
  );
}
