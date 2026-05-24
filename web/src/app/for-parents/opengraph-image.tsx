import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt =
  "For parents — your child is landing in a city you have never seen. NexGen Connect is the verified arrival corridor.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "For parents",
    headline: "Your child is landing",
    accent: "in a city you have never seen.",
    footer:
      "Three-check verification. Sixty verified classmates from your home city by the time they fly. ₹999 once.",
    badge: "Parent View",
  });
}
