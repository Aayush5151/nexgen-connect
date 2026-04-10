import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { BackToTop } from "@/components/shared/BackToTop";
import { StickyMobileCTA } from "@/components/shared/StickyMobileCTA";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "NexGen Connect | Verified Community & Roommate Finder for Indian Students Abroad",
    template: "%s | NexGen Connect",
  },
  description:
    "Join 23,000+ verified Indian students heading abroad. Find roommates, connect with people from your city, and never land alone. Government ID verified. Available in 65+ Indian cities.",
  keywords: [
    "Indian students abroad",
    "study abroad community India",
    "international student networking",
    "Indian student roommates abroad",
    "pre-departure networking",
    "find roommates abroad",
    "verified student network",
    "NexGen Connect",
  ],
  openGraph: {
    title: "NexGen Connect | Find Your People Before You Land",
    description:
      "Join 23,000+ verified Indian students heading abroad. Find roommates from your city, connect before you fly. Government ID verified.",
    images: ["/images/og-image.png"],
    type: "website",
    siteName: "NexGen Connect",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGen Connect | Verified Student Network for Indians Abroad",
    description:
      "Find roommates from your city heading to the same destination. 23,000+ verified students. Government ID verified.",
    images: ["/images/og-image.png"],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nexgen-connect.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google Analytics — replace GA_MEASUREMENT_ID with your real ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}

        {/* Preconnect to CDN/font origins to reduce render-blocking */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NexGen Connect",
              url: "https://nexgen-connect.vercel.app",
              logo: "https://nexgen-connect.vercel.app/images/logo.png",
              description:
                "The verified network for Indian students moving abroad. Connect with students from your city heading to the same destination.",
              sameAs: [
                "https://instagram.com/nexgenconnect",
                "https://linkedin.com/company/nexgenconnect",
                "https://twitter.com/nexgenconnect",
              ],
            }),
          }}
        />
        {/* FAQ Schema for Google "People Also Ask" */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is NexGen Connect only for Indian students?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Currently, NexGen Connect is designed for Indian students planning to study abroad. The origin-based matching system works best when you select an Indian city as your origin. We plan to expand to other countries in the future.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does NexGen Connect verify student identities?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Every user verifies through three steps: phone number via OTP, email via a confirmation link, and identity via government ID (Aadhaar, PAN, Driving License, Voter ID, or Passport). We never store your ID number. Only the verification status is retained.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I find a roommate for my intake on NexGen Connect?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. NexGen Connect matches you with verified students from your exact city heading to the same destination and intake period. Many students use it specifically to find roommates before they move abroad.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is NexGen Connect free to use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can browse and explore for free. To unlock full profiles, swipe and match, and reveal Instagram and LinkedIn handles, there is a one-time payment of ₹999. No subscriptions, no hidden fees.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How is NexGen Connect different from WhatsApp groups?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "WhatsApp groups are chaotic: 500 strangers, immigration agents, and spam. NexGen Connect matches you only with government-verified students from your specific city heading to the same destination. No agents, no ads, no noise.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#020617] font-sans text-[#F8FAFC]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <StickyMobileCTA />
        <BackToTop />
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </body>
    </html>
  );
}
