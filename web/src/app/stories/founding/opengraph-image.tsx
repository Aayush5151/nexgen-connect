import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt =
  "Founder letter № 01 — Why we built the corridor. A personal letter from Aayush Shah, founder of NexGen Connect.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Founder letter · no. 01 · Aayush Shah",
    headline: "Why we built",
    accent: "the corridor.",
    footer:
      "Three friends got scammed at Dublin Airport. I built this so the next two million don't. — Aayush",
    badge: "12 May 2026",
  });
}
