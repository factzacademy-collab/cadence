"use client";

import * as React from "react";
import {
  Search,
  Plug,
  Settings2,
  Check,
  Plus,
  Puzzle,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  SectionCard,
  EmptyState,
  SkeletonGrid,
  StatCard,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIntegrations, useToggleIntegration } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Design",
  "Productivity",
  "Storage",
  "Automation",
  "Communication",
  "Commerce",
  "Analytics",
] as const;

export function IntegrationsView() {
  const { data, isLoading } = useIntegrations();
  const toggle = useToggleIntegration();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("All");
  const [configuring, setConfiguring] = React.useState<string | null>(null);

  const integrations = data?.integrations ?? [];

  const filtered = integrations.filter((it) => {
    const matchesCat = category === "All" || it.category === category;
    const matchesQuery =
      !query ||
      it.name.toLowerCase().includes(query.toLowerCase()) ||
      it.description.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const connectedCount = integrations.filter((i) => i.connected).length;

  const handleToggle = (id: string, name: string, willConnect: boolean) => {
    toggle.mutate(id, {
      onSuccess: () =>
        toast.success(
          willConnect ? `${name} connected` : `${name} disconnected`
        ),
      onError: () => toast.error("Couldn't update integration"),
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Integrations"
        description="Connect Cadence to the tools your team already uses."
        actions={
          <Button variant="outline" onClick={() => toast.info("Request sent — we'll email you when it's ready.")}>
            <Plus className="size-4" />
            Request an integration
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Connected"
          value={connectedCount}
          deltaLabel={`of ${integrations.length} available`}
          icon={Plug}
          accent="text-primary"
        />
        <StatCard
          label="Categories"
          value={CATEGORIES.length - 1}
          deltaLabel="tool categories"
          icon={Puzzle}
          accent="text-coral"
        />
        <StatCard
          label="Automations"
          value={3}
          delta={12}
          deltaLabel="active this month"
          icon={Settings2}
          accent="text-mint"
        />
      </div>

      {/* Connected strip */}
      {connectedCount > 0 && (
        <SectionCard
          title="Connected integrations"
          description="Manage your active connections"
        >
          <div className="flex flex-wrap gap-2">
            {integrations
              .filter((i) => i.connected)
              .map((it) => (
                <button
                  key={it.id}
                  onClick={() => setConfiguring(it.id)}
                  className="group inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md bg-gradient-to-br text-white",
                      it.accent
                    )}
                  >
                    <span className="text-[10px] font-bold">
                      {it.name.slice(0, 2)}
                    </span>
                  </span>
                  <span className="font-medium">{it.name}</span>
                  <Settings2 className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search integrations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as typeof category)}
        >
          <TabsList className="flex h-9 flex-wrap gap-1 bg-muted/60">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="h-7 text-xs">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Puzzle}
          title="No integrations found"
          description="Try a different search or category filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <div
              key={it.id}
              className="flex flex-col rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                    it.accent
                  )}
                >
                  <span className="text-sm font-bold">{it.name.slice(0, 2)}</span>
                </span>
                {it.connected && (
                  <Badge className="border-mint/30 bg-mint/15 text-mint">
                    <Check className="size-3" />
                    Connected
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{it.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {it.category}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {it.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant={it.connected ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  disabled={toggle.isPending}
                  onClick={() => handleToggle(it.id, it.name, !it.connected)}
                >
                  {it.connected ? "Disconnect" : "Connect"}
                </Button>
                {it.connected && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setConfiguring(it.id)}
                    aria-label={`Configure ${it.name}`}
                  >
                    <Settings2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configure dialog */}
      <IntegrationConfigDialog
        integrationId={configuring}
        integrations={integrations}
        onClose={() => setConfiguring(null)}
      />
    </div>
  );
}

function IntegrationConfigDialog({
  integrationId,
  integrations,
  onClose,
}: {
  integrationId: string | null;
  integrations: { id: string; name: string; description: string; category: string; connected: boolean; accent: string }[];
  onClose: () => void;
}) {
  const it = integrations.find((i) => i.id === integrationId);
  return (
    <Dialog open={!!integrationId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                it?.accent
              )}
            >
              <span className="text-xs font-bold">{it?.name.slice(0, 2)}</span>
            </span>
            <div>
              <DialogTitle>{it?.name}</DialogTitle>
              <DialogDescription>{it?.category}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{it?.description}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <Label className="text-sm font-medium">Auto-sync assets</Label>
                <p className="text-xs text-muted-foreground">
                  Keep your media library in sync.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <Label className="text-sm font-medium">Publishing notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when posts publish.
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acct">Connected account</Label>
              <Select defaultValue="default">
                <SelectTrigger id="acct">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">workspace@cadence.app</SelectItem>
                  <SelectItem value="alt">marketing@cadence.app</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              toast.success(`${it?.name} settings saved`);
              onClose();
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
