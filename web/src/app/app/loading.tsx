import { SkeletonLine, SkeletonCard } from "@/components/ui/skeleton";

/**
 * /app — generic skeleton.
 *
 * Used as the fallback Suspense boundary for any authed route that
 * doesn't ship its own loading.tsx. The shape is intentionally
 * neutral — a header + two cards — so it works for help, profile
 * subpages, etc.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function AppLoading() {
  return (
    <div className="space-y-6 pt-2" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <SkeletonLine width={60} className="h-3" />
        <SkeletonLine width="55%" className="h-9" />
        <SkeletonLine width="80%" />
      </header>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={2} />
    </div>
  );
}
