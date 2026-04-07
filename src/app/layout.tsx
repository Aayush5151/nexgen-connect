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
    default: "NexGen Connect — Find Your People Before You Land",
    template: "%s | NexGen Connect",
  },
  description:
    "The verified network for Indian students moving abroad. Connect with students from your city heading to the same destination.",
  openGraph: {
    title: "NexGen Connect — Find Your People Before You Land",
    description:
      "The verified network for Indian students moving abroad. Connect with students from your city heading to the same destination.",
    images: ["/images/og-image.png"],
    type: "website",
    siteName: "NexGen Connect",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGen Connect — Find Your People Before You Land",
    description:
      "The verified network for Indian students moving abroad. Connect with students from your city heading to the same destination.",
    images: ["/images/og-image.png"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NexGen Connect",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://nexgenconnect.com",
              logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexgenconnect.com"}/images/logo.png`,
              description:
                "The verified network for Indian students moving abroad. Connect with students from your city heading to the same destination.",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#0A0A0C] font-sans text-[#E8E8ED]">
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
