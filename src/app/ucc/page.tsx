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
    "Your verified NexGen group for University College Cork. Ten Indian classmates, all flying the same month, ready before the first week.",
  alternates: { canonical: "/ucc" },
  openGraph: {
    title: "University College Cork · NexGen Connect",
    description:
      "Ten verified Indian Cork-bound classmates, all flying the same month, before you land. The app ships September 2026.",
    url: "/ucc",
    type: "website",
  },
};

export default function UCCPage() {
  return <UniversityLanding cfg={UCC_CONFIG} />;
}
