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
        // /api/, /verify/  - private endpoints (audit log + identity flow)
        // /admin/          - admin dashboard, also has page-level noindex
        // /app/            - authed product surface, redirects unauthed traffic
        //                    to /signup but we don't want crawlers indexing
        //                    the gated routes themselves
        // /parent/         - magic-link tokens; single-use, but indexing the
        //                    URL would consume the link before the parent
        //                    sees it
        disallow: ["/api/", "/verify/", "/admin/", "/app/", "/parent/", "/dashboard"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
