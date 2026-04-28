import { permanentRedirect } from "next/navigation";

/**
 * /terms used to be its own page; policy now lives at /legal#terms.
 * We keep the route alive so old bookmarks and search results still
 * resolve, but send visitors straight to the merged page.
 */
export default function TermsPage(): never {
  permanentRedirect("/legal#terms");
}
