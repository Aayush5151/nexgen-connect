import type { Metadata } from "next";
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-heading-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif-family",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexgen-connect.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "NexGen Connect · You are not flying alone.",
    template: "%s · NexGen Connect",
  },
  description:
    "A verified group of 100 Indian students flying to Ireland this September. UCD, Trinity, UCC. You meet them online, months before Dublin.",
  openGraph: {
    title: "NexGen Connect · You are not flying alone.",
    description:
      "A verified group of 100 Indian students flying to Ireland this September. UCD, Trinity, UCC. You meet them online, months before Dublin.",
    type: "website",
    siteName: "NexGen Connect",
    locale: "en_IN",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGen Connect · You are not flying alone.",
    description:
      "A verified group of 100 Indian students flying to Ireland this September. UCD, Trinity, UCC. You meet them online, months before Dublin.",
  },
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NexGen Connect",
  url: "https://nexgen-connect.vercel.app",
  founder: {
    "@type": "Person",
    name: "Aayush Shah",
  },
  description:
    "Verified student groups for students moving abroad. Ireland first. September 2026.",
  email: "hello@nexgenconnect.com",
  areaServed: "Worldwide",
  foundingDate: "2026",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[color:var(--color-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[color:var(--color-primary-fg)]"
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
