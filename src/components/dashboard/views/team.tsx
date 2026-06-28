"use client";

import * as React from "react";
import {
  UserPlus,
  Search,
  Crown,
  Shield,
  Pencil,
  Trash2,
  Mail,
  MoreHorizontal,
  Check,
  X,
  Users,
  UserCheck,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  PageHeader,
  SectionCard,
  StatCard,
  Avatar,
  EmptyState,
  SkeletonGrid,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeam, useInviteMember } from "@/hooks/use-api";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: TeamMember["role"][] = [
  "Owner",
  "Admin",
  "Editor",
  "Approver",
  "Viewer",
];

const ROLE_ICONS: Record<TeamMember["role"], typeof Crown> = {
  Owner: Crown,
  Admin: Shield,
  Editor: Pencil,
  Approver: Check,
  Viewer: Users,
};

const ROLE_BADGE: Record<TeamMember["role"], string> = {
  Owner: "bg-amber-brand/15 text-amber-brand border-amber-brand/30",
  Admin: "bg-primary/10 text-primary border-primary/20",
  Editor: "bg-mint/15 text-mint border-mint/25",
  Approver: "bg-plum/15 text-plum border-plum/25",
  Viewer: "bg-muted text-muted-foreground border-border",
};

const STATUS_BADGE: Record<TeamMember["status"], string> = {
  active: "bg-mint/15 text-mint border-mint/25",
  invited: "bg-amber-brand/15 text-amber-brand border-amber-brand/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/25",
};

// Permissions matrix (illustrative)
const PERMISSIONS = [
  "Create posts",
  "Approve posts",
  "Publish",
  "Edit calendar",
  "View analytics",
  "Manage team",
  "Manage billing",
  "Manage integrations",
] as const;

const PERMISSION_MATRIX: Record<TeamMember["role"], boolean[]> = {
  Owner: [true, true, true, true, true, true, true, true],
  Admin: [true, true, true, true, true, true, false, true],
  Editor: [true, false, true, true, true, false, false, false],
  Approver: [true, true, false, true, true, false, false, false],
  Viewer: [false, false, false, false, true, false, false, false],
};

export function TeamView() {
  const { data, isLoading } = useTeam();
  const invite = useInviteMember();
  const [query, setQuery] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<TeamMember | null>(null);

  const team = data?.team ?? [];
  const filtered = team.filter(
    (m) =>
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase())
  );

  const counts = {
    total: team.length,
    active: team.filter((m) => m.status === "active").length,
    pending: team.filter((m) => m.status === "invited").length,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Team & permissions"
        description="Invite teammates and control what they can do in your workspace."
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="size-4" />
                Invite member
              </Button>
            </DialogTrigger>
            <InviteDialog
              onSubmit={(input) =>
                invite.mutate(input, {
                  onSuccess: () => {
                    toast.success(`Invitation sent to ${input.email}`);
                    setInviteOpen(false);
                  },
                  onError: () => toast.error("Couldn't send invitation"),
                })
              }
              pending={invite.isPending}
            />
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total members" value={counts.total} icon={Users} accent="text-primary" />
        <StatCard label="Active" value={counts.active} icon={UserCheck} accent="text-mint" />
        <StatCard label="Pending invites" value={counts.pending} icon={Clock} accent="text-coral" />
        <StatCard label="Seats used" value={`${counts.total} / 12`} deltaLabel="Team plan" icon={Crown} accent="text-plum" />
      </div>

      {/* Roster */}
      <SectionCard
        title="Team members"
        description="Everyone with access to this workspace"
        actions={
          <div className="relative w-48 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        }
        bodyClassName="p-0"
      >
        {isLoading ? (
          <div className="p-5">
            <SkeletonGrid count={3} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="No members found" description="Try a different search." />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-cadence">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const RoleIcon = ROLE_ICONS[m.role];
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} color={m.avatarColor} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {m.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", ROLE_BADGE[m.role])}>
                          <RoleIcon className="size-3" />
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize", STATUS_BADGE[m.status])}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.status === "invited"
                          ? "Pending"
                          : formatDistanceToNow(new Date(m.lastActive), {
                              addSuffix: true,
                            })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label="Member actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {m.status === "invited" && (
                              <DropdownMenuItem onClick={() => toast.success(`Invitation resent to ${m.email}`)}>
                                <Mail className="size-4" />
                                Resend invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Shield className="size-4" />
                                Change role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {ROLES.map((r) => (
                                  <DropdownMenuItem
                                    key={r}
                                    onClick={() => toast.success(`${m.name} is now ${r}`)}
                                    disabled={r === "Owner"}
                                  >
                                    {m.role === r && <Check className="size-4" />}
                                    {r}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setRemoveTarget(m)}
                            >
                              <Trash2 className="size-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Permissions matrix */}
      <SectionCard
        title="Roles & permissions"
        description="What each role can do in your workspace"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto scrollbar-cadence">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                {ROLES.map((r) => (
                  <TableHead key={r} className="text-center">
                    {r}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((perm, i) => (
                <TableRow key={perm}>
                  <TableCell className="font-medium">{perm}</TableCell>
                  {ROLES.map((r) => (
                    <TableCell key={r} className="text-center">
                      {PERMISSION_MATRIX[r][i] ? (
                        <Check className="mx-auto size-4 text-mint" />
                      ) : (
                        <X className="mx-auto size-4 text-muted-foreground/40" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Remove confirm */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {removeTarget?.name}?</DialogTitle>
            <DialogDescription>
              They will lose access to this workspace immediately. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.success(`${removeTarget?.name} removed from workspace`);
                setRemoveTarget(null);
              }}
            >
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InviteDialog({
  onSubmit,
  pending,
}: {
  onSubmit: (input: { name: string; email: string; role: TeamMember["role"] }) => void;
  pending: boolean;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<TeamMember["role"]>("Editor");

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite a teammate</DialogTitle>
        <DialogDescription>
          They'll receive an email invitation to join your workspace.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label htmlFor="inv-name" className="text-sm font-medium">
            Full name
          </label>
          <Input
            id="inv-name"
            placeholder="Jordan Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="inv-email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            id="inv-email"
            type="email"
            placeholder="jordan@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role</label>
          <Select value={role} onValueChange={(v) => setRole(v as TeamMember["role"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.filter((r) => r !== "Owner").map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!valid || pending}
          onClick={() => onSubmit({ name, email, role })}
        >
          {pending ? "Sending…" : "Send invitation"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
