import type { MetadataRoute } from "next";

/**
 * Sitemap - dynamically rendered so the base URL follows NEXT_PUBLIC_SITE_URL.
 * Keep this list in sync with app/ route folders visible to crawlers.
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
    { path: "/how", priority: 0.9, changeFrequency: "monthly" },
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
    { path: "/legal", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
