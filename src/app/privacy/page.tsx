import { permanentRedirect } from "next/navigation";

/**
 * /privacy used to be its own page; policy now lives at /legal#privacy.
 * We keep the route alive so old bookmarks and search results still
 * resolve, but send visitors straight to the merged page.
 */
export default function PrivacyPage(): never {
  permanentRedirect("/legal#privacy");
}
