import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cadence.app"),
  title: {
    default: `${BRAND.name} — Social media orchestration for modern teams`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "social media scheduler",
    "content calendar",
    "social media analytics",
    "publishing tool",
    "social media management",
    "AI content assistant",
    BRAND.name,
  ],
  authors: [{ name: `${BRAND.name} Team` }],
  creator: BRAND.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `https://${BRAND.domain}`,
    siteName: BRAND.name,
    title: `${BRAND.name} — Social media orchestration for modern teams`,
    description: BRAND.description,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
