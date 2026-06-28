"use client";

import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/sections/hero";
import { Logos } from "@/components/marketing/sections/logos";
import { Features } from "@/components/marketing/sections/features";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { Channels } from "@/components/marketing/sections/channels";
import { AnalyticsShowcase } from "@/components/marketing/sections/analytics-showcase";
import { AiSection } from "@/components/marketing/sections/ai-section";
import { Testimonials } from "@/components/marketing/sections/testimonials";
import { Pricing } from "@/components/marketing/sections/pricing";
import { Faq } from "@/components/marketing/sections/faq";
import { Cta } from "@/components/marketing/sections/cta";

export default function MarketingSite() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Logos />
        <Features />
        <HowItWorks />
        <Channels />
        <AnalyticsShowcase />
        <AiSection />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}
