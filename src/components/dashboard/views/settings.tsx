"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  User,
  Building2,
  Bell,
  Palette,
  Shield,
  Trash2,
  Save,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  KeyRound,
  Plus,
} from "lucide-react";

import { PageHeader, SectionCard, Avatar } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  bio: z.string().max(200).optional(),
  timezone: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const securitySchema = z
  .object({
    current: z.string().min(8, "At least 8 characters"),
    next: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

const NOTIF_GROUPS = [
  {
    title: "Publishing",
    items: [
      { key: "pub_published", label: "Post published", desc: "When a post goes live successfully." },
      { key: "pub_failed", label: "Post failed", desc: "When a post fails to publish." },
      { key: "pub_reminder", label: "Scheduled reminders", desc: "15 minutes before a scheduled post." },
    ],
  },
  {
    title: "Engagement",
    items: [
      { key: "eng_comment", label: "New comment", desc: "When someone comments on your post." },
      { key: "eng_mention", label: "New mention", desc: "When your brand is mentioned." },
      { key: "eng_dm", label: "Direct message", desc: "When you receive a DM." },
    ],
  },
  {
    title: "Reports",
    items: [
      { key: "rep_weekly", label: "Weekly summary", desc: "Every Monday at 9am." },
      { key: "rep_monthly", label: "Monthly report ready", desc: "On the 1st of each month." },
    ],
  },
  {
    title: "Team",
    items: [
      { key: "team_invite", label: "Member invited", desc: "When a teammate is invited." },
      { key: "team_approval", label: "Approval requested", desc: "When an approval is requested from you." },
    ],
  },
];

const ACCENTS = [
  { id: "teal", color: "var(--primary)", label: "Teal" },
  { id: "coral", color: "var(--coral)", label: "Coral" },
  { id: "amber", color: "var(--amber-brand)", label: "Amber" },
  { id: "mint", color: "var(--mint)", label: "Mint" },
  { id: "plum", color: "var(--plum)", label: "Plum" },
];

export function SettingsView() {
  const [tab, setTab] = React.useState("profile");
  const [notif, setNotif] = React.useState<Record<string, boolean>>({
    pub_published: true,
    pub_failed: true,
    pub_reminder: false,
    eng_comment: true,
    eng_mention: true,
    eng_dm: true,
    rep_weekly: true,
    rep_monthly: false,
    team_invite: true,
    team_approval: true,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, workspace, and preferences."
      />

      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <div className="lg:w-56 lg:shrink-0">
          <TabsList
            orientation="vertical"
            className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0"
          >
            {[
              { v: "profile", label: "Profile", icon: User },
              { v: "workspace", label: "Workspace", icon: Building2 },
              { v: "notifications", label: "Notifications", icon: Bell },
              { v: "appearance", label: "Appearance", icon: Palette },
              { v: "security", label: "Security", icon: Shield },
              { v: "danger", label: "Danger zone", icon: Trash2 },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="justify-start gap-2 px-3 py-2 text-sm data-[state=active]:bg-accent data-[state=active]:shadow-none"
              >
                <t.icon className="size-4" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <TabsContent value="profile" className="mt-0 space-y-6">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="workspace" className="mt-0 space-y-6">
            <WorkspaceSection />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0 space-y-6">
            <SectionCard
              title="Notification preferences"
              description="Choose what you want to be notified about"
              actions={<Button size="sm" onClick={() => toast.success("Preferences saved")}>Save</Button>}
            >
              <div className="space-y-6">
                {NOTIF_GROUPS.map((g) => (
                  <div key={g.title}>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.title}
                    </h4>
                    <div className="space-y-2">
                      {g.items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                        >
                          <div className="pr-3">
                            <Label className="text-sm font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch
                            checked={!!notif[item.key]}
                            onCheckedChange={(v) =>
                              setNotif((s) => ({ ...s, [item.key]: v }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>
          <TabsContent value="appearance" className="mt-0 space-y-6">
            <AppearanceSection />
          </TabsContent>
          <TabsContent value="security" className="mt-0 space-y-6">
            <SecuritySection />
          </TabsContent>
          <TabsContent value="danger" className="mt-0 space-y-6">
            <DangerSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ProfileSection() {
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Maya Okafor",
      email: "maya@cadence.app",
      bio: "Building Cadence. Coffee enthusiast. Posting with intent.",
      timezone: "Europe/Lisbon",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(() => toast.success("Profile saved"))}>
      <SectionCard
        title="Your profile"
        description="This is how others see you in the workspace"
        actions={<Button type="submit" size="sm"><Save className="size-4" />Save</Button>}
      >
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3">
            <Avatar name="Maya Okafor" color="from-primary to-mint" size="lg" className="size-20 text-xl" />
            <Button variant="outline" size="sm" type="button" onClick={() => toast.info("Image upload coming soon")}>
              Change
            </Button>
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} {...form.register("bio")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tz">Timezone</Label>
              <Select defaultValue="Europe/Lisbon" onValueChange={(v) => form.setValue("timezone", v)}>
                <SelectTrigger id="tz">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Lisbon">Europe/Lisbon (UTC+0)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (UTC−5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (UTC−8)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (UTC+10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SectionCard>
    </form>
  );
}

function WorkspaceSection() {
  return (
    <SectionCard
      title="Workspace"
      description="Settings for your Cadence workspace"
      actions={<Button size="sm" onClick={() => toast.success("Workspace saved")}><Save className="size-4" />Save</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input id="ws-name" defaultValue="Cadence HQ" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ws-slug">Workspace URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">cadence.app/</span>
            <Input id="ws-slug" defaultValue="cadence-hq" className="flex-1" />
          </div>
          <p className="flex items-center gap-1 text-xs text-mint">
            <span className="size-1.5 rounded-full bg-mint" /> Available
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Default timezone</Label>
          <Select defaultValue="Europe/Lisbon">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Week starts on</Label>
          <Select defaultValue="monday">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Workspace logo</Label>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-mint text-white">
              <Building2 className="size-5" />
            </div>
            <Button variant="outline" size="sm" type="button" onClick={() => toast.info("Logo upload coming soon")}>
              Upload logo
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [accent, setAccent] = React.useState("teal");
  const [density, setDensity] = React.useState("comfortable");
  const [reducedMotion, setReducedMotion] = React.useState(false);

  return (
    <>
      <SectionCard title="Theme" description="Choose how Cadence looks">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                theme === t.id
                  ? "border-primary bg-accent/40 ring-1 ring-primary/30"
                  : "border-border/70 hover:bg-accent/30"
              )}
            >
              <t.icon className="size-5" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Accent color" description="Used for highlights and primary actions">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAccent(a.id);
                toast.success(`Accent set to ${a.label}`);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2 pr-3 transition-colors",
                accent === a.id ? "border-foreground/30 bg-accent/40" : "border-border/60 hover:bg-accent/30"
              )}
            >
              <span className="size-5 rounded-full" style={{ backgroundColor: a.color }} />
              <span className="text-sm">{a.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Display density" description="Adjust spacing to your preference">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "comfortable", label: "Comfortable", desc: "More breathing room" },
            { id: "compact", label: "Compact", desc: "Fit more on screen" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDensity(d.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                density === d.id ? "border-primary bg-accent/40 ring-1 ring-primary/30" : "border-border/70 hover:bg-accent/30"
              )}
            >
              <p className="text-sm font-medium">{d.label}</p>
              <p className="text-xs text-muted-foreground">{d.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Motion" description="Control animations across the app">
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
          <div>
            <Label className="text-sm font-medium">Reduce motion</Label>
            <p className="text-xs text-muted-foreground">Minimize animations and transitions.</p>
          </div>
          <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
        </div>
      </SectionCard>
    </>
  );
}

function SecuritySection() {
  const form = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const [twoFA, setTwoFA] = React.useState(false);

  return (
    <>
      <form onSubmit={form.handleSubmit(() => { toast.success("Password updated"); form.reset(); })}>
        <SectionCard
          title="Change password"
          description="Use a strong, unique password"
          actions={<Button type="submit" size="sm"><Save className="size-4" />Update</Button>}
        >
          <div className="grid max-w-md gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cur">Current password</Label>
              <Input id="cur" type="password" {...form.register("current")} />
              {form.formState.errors.current && (
                <p className="text-xs text-destructive">{form.formState.errors.current.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next">New password</Label>
              <Input id="next" type="password" {...form.register("next")} />
              {form.formState.errors.next && (
                <p className="text-xs text-destructive">{form.formState.errors.next.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" {...form.register("confirm")} />
              {form.formState.errors.confirm && (
                <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>
              )}
            </div>
          </div>
        </SectionCard>
      </form>

      <SectionCard title="Two-factor authentication" description="Add an extra layer of security">
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
          <div>
            <Label className="text-sm font-medium">Authenticator app</Label>
            <p className="text-xs text-muted-foreground">Require a code from your authenticator at sign in.</p>
          </div>
          <Switch checked={twoFA} onCheckedChange={(v) => { setTwoFA(v); toast.success(v ? "2FA enabled" : "2FA disabled"); }} />
        </div>
      </SectionCard>

      <SectionCard title="Active sessions" description="Devices currently signed in">
        <div className="space-y-2">
          {[
            { device: "MacBook Pro · Lisbon", current: true, icon: Monitor, last: "Active now" },
            { device: "iPhone 15 · Lisbon", current: false, icon: Smartphone, last: "2 hours ago" },
          ].map((s) => (
            <div key={s.device} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div className="flex items-center gap-3">
                <s.icon className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">{s.last}</p>
                </div>
              </div>
              {s.current ? (
                <Badge variant="outline" className="border-mint/30 text-mint">This device</Badge>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => toast.success("Session revoked")}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="API tokens"
        description="Use tokens to access the Cadence API"
        actions={<Button size="sm" variant="outline" onClick={() => toast.success("Token created (copy it now)")}>
          <Plus className="size-4" />New token
        </Button>}
        bodyClassName="p-0"
      >
        <div className="divide-y divide-border/60">
          {[
            { name: "Production webhook", token: "cad_sk_••••••4f2a", created: "Mar 12, 2025" },
            { name: "Analytics export", token: "cad_sk_••••••9c1b", created: "Feb 3, 2025" },
          ].map((t) => (
            <div key={t.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <KeyRound className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{t.token}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">Created {t.created}</span>
                <Button variant="ghost" size="sm" onClick={() => toast.success("Token revoked")} className="text-destructive hover:text-destructive">
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function DangerSection() {
  const [confirm, setConfirm] = React.useState("");
  const [open, setOpen] = React.useState(false);
  return (
    <SectionCard className="border-destructive/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-destructive">Delete workspace</h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete this workspace and all its data. This cannot be undone.
          </p>
        </div>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setConfirm(""); }}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete workspace</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete workspace?</DialogTitle>
              <DialogDescription>
                This will permanently delete <strong>Cadence HQ</strong>, all posts, media, analytics, and team members. Type <strong>DELETE</strong> to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              className="mt-2"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={confirm !== "DELETE"}
                onClick={() => { toast.success("Workspace scheduled for deletion"); setOpen(false); setConfirm(""); }}
              >
                Delete forever
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SectionCard>
  );
}
