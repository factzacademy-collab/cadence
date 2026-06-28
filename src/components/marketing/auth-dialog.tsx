"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LogoMark } from "@/components/brand/logo";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(80),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
  });

type SigninForm = z.infer<typeof signinSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const DEMO = { email: "demo@cadence.app", password: "cadence123" };

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "signin",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultMode?: "signin" | "signup";
}) {
  const goApp = useApp((s) => s.goApp);
  const [mode, setMode] = React.useState<"signin" | "signup">(defaultMode);

  React.useEffect(() => {
    if (open) setMode(defaultMode);
  }, [open, defaultMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="grid">
          <div className="bg-gradient-to-br from-primary/10 via-mint/5 to-coral/10 px-6 pt-6 pb-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-7" />
              <span className="text-base font-semibold">Cadence</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to your workspace to keep your cadence."
                : "Start scheduling, analyzing, and engaging in minutes."}
            </p>
          </div>

          <div className="p-6 pt-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-4">
                <SignInForm
                  onSuccess={() => { onOpenChange(false); goApp("overview"); }}
                />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <SignUpForm
                  onSuccess={() => { onOpenChange(false); goApp("overview"); }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });
  const [loading, setLoading] = React.useState(false);

  const submit = async (data: SigninForm) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Signed in");
        onSuccess();
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <Field label="Email" icon={Mail} error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label="Password" icon={Lock} error={form.formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
      </Field>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Sign in
      </Button>
      <button
        type="button"
        onClick={async () => {
          setLoading(true);
          const res = await signIn("credentials", {
            email: DEMO.email,
            password: DEMO.password,
            redirect: false,
          });
          setLoading(false);
          if (res?.error) toast.error("Demo account not seeded. Run `bun run db:seed`.");
          else { toast.success("Signed in to demo workspace"); onSuccess(); }
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Sparkles className="size-3.5" />
        Try the demo — demo@cadence.app / cadence123
      </button>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const [loading, setLoading] = React.useState(false);

  const submit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!regRes.ok) {
        const j = await regRes.json().catch(() => ({}));
        toast.error(j.error ?? "Registration failed");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInRes?.error) {
        toast.error("Account created. Please sign in.");
        setLoading(false);
        return;
      }
      toast.success("Account created — welcome to Cadence!");
      onSuccess();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <Field label="Full name" icon={User} error={form.formState.errors.name?.message}>
        <Input autoComplete="name" {...form.register("name")} />
      </Field>
      <Field label="Email" icon={Mail} error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label="Password" icon={Lock} error={form.formState.errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...form.register("password")} />
        <p className="mt-1 text-[11px] text-muted-foreground">Minimum 8 characters.</p>
      </Field>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        By signing up you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Re-export cn to keep the import tree-shakeable in case it's used by callers.
export { cn };
