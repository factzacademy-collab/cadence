"use client";

import * as React from "react";
import { toast } from "sonner";
import { Linkedin, Github, Youtube, Twitter, ArrowRight, Heart } from "lucide-react";

import { BRAND, FOOTER_COLUMNS } from "@/lib/brand";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SOCIAL = [
  { label: "X (Twitter)", href: BRAND.social.x, icon: Twitter },
  { label: "LinkedIn", href: BRAND.social.linkedin, icon: Linkedin },
  { label: "GitHub", href: BRAND.social.github, icon: Github },
  { label: "YouTube", href: BRAND.social.youtube, icon: Youtube },
];

const LEGAL = ["Privacy", "Terms", "Security", "Cookies"];

export function SiteFooter() {
  const [email, setEmail] = React.useState("");
  const [region, setRegion] = React.useState("en-US");

  function onNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed!", {
      description: "You'll get the Cadence newsletter every other week.",
    });
    setEmail("");
  }

  return (
    <footer className="mt-auto border-t border-border/60 bg-canvas/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand + newsletter */}
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground text-pretty">
              {BRAND.tagline}
            </p>
            <form
              onSubmit={onNewsletter}
              className="flex flex-col gap-2"
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <div className="flex gap-2">
                <Input
                  id="footer-newsletter"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" size="icon" aria-label="Subscribe">
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bi-weekly. No spam. Unsubscribe anytime.
              </p>
            </form>
            <div className="flex items-center gap-1">
              {SOCIAL.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul role="list" className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} {BRAND.name}, Inc. All rights reserved.
            </span>
            {LEGAL.map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <label
              htmlFor="region-select"
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span aria-hidden>🌐</span>
              <select
                id="region-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="pt-BR">Português (BR)</option>
                <option value="ja-JP">日本語</option>
              </select>
            </label>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with
              <Heart className="size-3 fill-coral text-coral" aria-hidden />
              by the Cadence team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
