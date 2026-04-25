import type { Metadata } from "next";
import {
  UniversityLanding,
  UCC_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /ucc - University College Cork landing page. UCC is the fastest-growing
 * Indian-student corridor in Ireland, and the page positions Cork as a
 * tighter community than Dublin - the right framing for a smaller campus.
 */

export const metadata: Metadata = {
  title: "UCC · Indian students, September 2026",
  description:
    "Your verified NexGen corridor for University College Cork. Indian classmates from your home city, going to Cork, in your intake month — ready before the first week.",
  alternates: { canonical: "/ucc" },
  openGraph: {
    title: "University College Cork · NexGen Connect",
    description:
      "A verified group of Cork-bound classmates from your home city, in your intake month — before you land. The app ships September 2026.",
    url: "/ucc",
    type: "website",
  },
};

export default function UCCPage() {
  return <UniversityLanding cfg={UCC_CONFIG} />;
}
