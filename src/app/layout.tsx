import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "NexGen Connect — The friend from your city you don't know yet",
    template: "%s · NexGen Connect",
  },
  description:
    "Pre-arrival cohort for Indian students. Verified, city-based, intake-specific. Starting with India → Germany, Winter 2026. Join the waitlist.",
  openGraph: {
    title: "NexGen Connect — The friend from your city you don't know yet",
    description:
      "A pre-arrival cohort for Indian students heading to TU Munich, RWTH Aachen, TU Berlin, KIT and TU Darmstadt in Winter 2026. Verified. City-based. No agents.",
    type: "website",
    siteName: "NexGen Connect",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGen Connect — India → Germany, Winter 2026",
    description:
      "Ten verified students. One city. One university. One intake. Join the WS26 waitlist.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nexgen-connect.vercel.app",
  ),
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <ScrollToTop />
        {children}
        <Toaster position="bottom-right" theme="dark" closeButton duration={4000} />
      </body>
    </html>
  );
}
