import type { MetadataRoute } from "next";

/**
 * robots.txt - dynamically rendered so the Sitemap URL follows whatever
 * NEXT_PUBLIC_SITE_URL is set to in the current environment (prod, preview,
 * or local).
 *
 * We index the marketing pages and explicitly disallow the identity-
 * verification flow so crawlers never try to follow /verify/* and pollute
 * our audit log or trigger real API hits.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexgenconnect.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/verify/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
