import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";
import { getCohortBySlug } from "@/lib/cohorts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "NexGen Connect — verified arrival corridor.";

/**
 * Dynamic per-cohort OG image. The parent /cohorts/[slug]/page.tsx
 * already exports generateStaticParams() to pre-render one page per
 * cohort slug. This opengraph-image.tsx inherits those same params
 * automatically — Next.js calls Image() once per generated slug at
 * build time and emits a static PNG per cohort.
 *
 * We deliberately do NOT use generateImageMetadata here. Doing so on a
 * dynamic route creates a second metadata-id dimension that Next.js
 * cannot collect at build time, breaking the build. The simpler
 * pattern — one image per parent-route param — is the supported
 * shape.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) {
    return renderOgImage({
      eyebrow: "Cohorts",
      headline: "Every corridor,",
      accent: "on the record.",
    });
  }

  const statusLabel =
    cohort.status === "unlocked"
      ? "Unlocked · group chat live"
      : `${cohort.verifiedCount} of ${cohort.threshold} verified · filling`;

  return renderOgImage({
    eyebrow: `Cohort · ${cohort.country} · ${cohort.intakeLabel}`,
    headline: `${cohort.uniFull},`,
    accent: cohort.intakeLabel.toLowerCase() + ".",
    footer: `Verified arrival corridor for the ${cohort.uni} ${cohort.intakeLabel} intake. ${statusLabel}.`,
    badge: cohort.status === "unlocked" ? "Unlocked" : "Filling",
  });
}
