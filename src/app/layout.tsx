import type { Metadata } from "next";
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ScrollProgressBar } from "@/components/shared/ScrollProgressBar";
import { ScrollReward } from "@/components/shared/ScrollReward";
import { GlobeCrosshair } from "@/components/shared/GlobeCrosshair";
import { TerminalK } from "@/components/shared/TerminalK";
import { SmsThread } from "@/components/shared/SmsThread";
import { FAQ_ITEMS } from "@/lib/faq";
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
    default:
      "NexGen Connect · Find 8-12 verified classmates before you fly abroad",
    template: "%s · NexGen Connect",
  },
  description:
    "NexGen Connect matches Indian students moving abroad with 8-12 verified classmates flying to the same country, same month. Ireland first. Ships Sept 2026.",
  openGraph: {
    title: "NexGen Connect · Find 8-12 verified classmates before you fly abroad",
    description:
      "NexGen Connect matches Indian students moving abroad with 8-12 verified classmates flying to the same country, same month. Ireland first. Ships Sept 2026.",
    type: "website",
    siteName: "NexGen Connect",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGen Connect · Find 8-12 verified classmates before you fly abroad",
    description:
      "NexGen Connect matches Indian students moving abroad with 8-12 verified classmates flying to the same country, same month. Ireland first. Ships Sept 2026.",
  },
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  keywords: [
    "students moving abroad",
    "Indian students abroad",
    "study abroad India",
    "verified student community",
    "Ireland student visa",
    "study in Ireland",
    "Dublin university",
    "student roommate finder",
    "pre-arrival student group",
    "NexGen Connect",
  ],
  authors: [{ name: "Aayush Shah" }],
  creator: "Aayush Shah",
  publisher: "NexGen Connect",
  category: "Education",
};

/* ------------------------------------------------------------------ */
/* JSON-LD structured data. Emitted in <head> as application/ld+json.  */
/* Three schemas:                                                       */
/*   - Organization - founder & contact                                 */
/*   - MobileApplication - so Google can surface the app in app-results */
/*   - SoftwareApplication - broader web-app signal (parallels mobile)  */
/*   - FAQPage - consumed from FAQSection.FAQ_ITEMS for rich results    */
/* Schemas stay server-rendered (static) so they ship with the initial   */
/* HTML payload, not via client hydration.                               */
/* ------------------------------------------------------------------ */

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NexGen Connect",
  url: SITE_URL,
  founder: { "@type": "Person", name: "Aayush Shah" },
  description:
    "Mobile app that connects verified students flying to the same country, the same month, before they land. Launching September 2026 with Ireland as the first corridor.",
  email: "hello@nexgenconnect.com",
  areaServed: "Worldwide",
  foundingDate: "2026",
};

const mobileAppSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "NexGen Connect",
  operatingSystem: "iOS 17, Android 14",
  applicationCategory: "SocialNetworkingApplication",
  description:
    "Get matched with a pocket-sized group of verified classmates flying to the same country, the same month. Ireland first corridor, September 2026.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  // No aggregateRating: the app has not launched yet (Sept 2026). We
  // re-add this only once we have genuine App Store and Play Store
  // ratings post-launch.
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NexGen Connect",
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "iOS, Android",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(mobileAppSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
        <ScrollProgressBar />
        <GlobeCrosshair />
        {children}
        <ScrollReward />
        <TerminalK />
        <SmsThread />
        <Toaster position="bottom-right" theme="dark" closeButton duration={4000} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
