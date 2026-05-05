import { permanentRedirect } from "next/navigation";

/**
 * /legal — historical merged Privacy+Terms page. Bucket 2 of the v16
 * web pivot split it into byte-distinct /privacy and /terms documents.
 * Old bookmarks and search results redirect here, then to /privacy.
 *
 * The next.config.ts `redirects()` array (added in Bucket 1.7) also
 * matches `/legal → /privacy` at the platform level. This page-level
 * redirect is a defence-in-depth fallback in case the next.config
 * change hasn't landed yet (different PR cadence).
 *
 * v16 web pivot §2.1.
 */
export default function LegalPage(): never {
  permanentRedirect("/privacy");
}
