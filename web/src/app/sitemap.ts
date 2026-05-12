import type { MetadataRoute } from "next";
import { COHORTS } from "@/lib/cohorts";

/**
 * Sitemap - dynamically rendered so the base URL follows NEXT_PUBLIC_SITE_URL.
 * Keep this list in sync with app/ route folders visible to crawlers.
 *
 * v18 category-presence pass: institutional pages added so crawlers
 * pick them up immediately. /cohorts/[slug] routes pulled from the
 * shared COHORTS registry so adding a new corridor automatically
 * adds it here. Otherwise sitemap drift is guaranteed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexgenconnect.in";
  const now = new Date();

  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    // High-priority institutional pages — first stop for journalists,
    // parents, and verified-vs-curious readers.
    { path: "/about", priority: 0.95, changeFrequency: "monthly" },
    { path: "/how", priority: 0.9, changeFrequency: "monthly" },
    { path: "/for-parents", priority: 0.9, changeFrequency: "monthly" },
    { path: "/promises", priority: 0.9, changeFrequency: "yearly" },
    // Editorial property — Stripe Press / Substack pattern. Stories
    // index updates as pieces ship; founding letter is permanent.
    { path: "/stories", priority: 0.85, changeFrequency: "weekly" },
    { path: "/stories/founding", priority: 0.85, changeFrequency: "yearly" },
    // The cohort yearbook — index + every per-corridor detail page.
    { path: "/cohorts", priority: 0.85, changeFrequency: "weekly" },
    ...COHORTS.map((c) => ({
      path: `/cohorts/${c.slug}` as const,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })),
    // Transparency posture — the page is the signal even when empty.
    { path: "/incidents", priority: 0.85, changeFrequency: "weekly" },
    { path: "/women-only", priority: 0.85, changeFrequency: "monthly" },
    { path: "/research", priority: 0.85, changeFrequency: "monthly" },
    { path: "/founder", priority: 0.8, changeFrequency: "monthly" },
    { path: "/checklist", priority: 0.8, changeFrequency: "monthly" },
    { path: "/checklist-germany", priority: 0.8, changeFrequency: "monthly" },
    // Ireland corridor (September 2026)
    { path: "/trinity", priority: 0.7, changeFrequency: "monthly" },
    { path: "/ucd", priority: 0.7, changeFrequency: "monthly" },
    { path: "/ucc", priority: 0.7, changeFrequency: "monthly" },
    // Germany corridor (October 2026)
    { path: "/tum", priority: 0.7, changeFrequency: "monthly" },
    { path: "/lmu", priority: 0.7, changeFrequency: "monthly" },
    { path: "/rwth-aachen", priority: 0.7, changeFrequency: "monthly" },
    { path: "/humboldt", priority: 0.7, changeFrequency: "monthly" },
    { path: "/press", priority: 0.5, changeFrequency: "monthly" },
    // /legal permanently redirects to /privacy (next.config + page-level).
    // Listing the canonical destinations directly avoids forcing crawlers
    // through a redirect.
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
