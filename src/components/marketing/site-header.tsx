"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { BRAND, MARKETING_NAV } from "@/lib/brand";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Render a stable placeholder until mounted to avoid hydration mismatch */}
      {!mounted ? (
        <Sun className="size-4" />
      ) : isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

export function SiteHeader() {
  const goApp = useApp((s) => s.goApp);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "glass border-b border-border/70 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label={`${BRAND.name} home`}
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo />
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {MARKETING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goApp("overview")}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Button>
          <Button size="sm" onClick={() => goApp("overview")}>
            <Sparkles className="size-3.5" />
            Start free
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[85vw]">
              <SheetTitle className="px-4 pt-2 text-base">
                <Logo />
              </SheetTitle>
              <nav
                aria-label="Mobile primary"
                className="mt-2 flex flex-col gap-1 px-2"
              >
                {MARKETING_NAV.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <a
                      href={item.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileOpen(false);
                    goApp("overview");
                  }}
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    goApp("overview");
                  }}
                >
                  <Sparkles className="size-4" />
                  Start free
                </Button>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  No credit card required · Free 14-day trial
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
