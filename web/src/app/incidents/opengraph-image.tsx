import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt =
  "Incidents — the public transparency log for NexGen Connect. Scam attempts blocked, T&S incidents, system outages.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Incidents · public log",
    headline: "What happened,",
    accent: "and what we did about it.",
    footer:
      "Public log of scams blocked, T&S incidents, and outages. The page exists before the events do — that's the posture.",
    badge: "Operating",
  });
}
