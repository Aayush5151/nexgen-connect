import {
  SkeletonLine,
  SkeletonBlock,
  SkeletonCard,
} from "@/components/ui/skeleton";

/**
 * /app/corridor — skeleton that mirrors the real layout.
 *
 * The shapes below match CorridorPage so the transition from skeleton
 * to content is silent — nothing jumps, nothing reflows. That silent
 * handoff is what makes a product feel fast even when it isn't.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function CorridorLoading() {
  return (
    <div className="space-y-8 pt-2" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <SkeletonLine width={140} className="h-3" />
        <SkeletonLine width="55%" className="h-9" />
        <SkeletonLine width="80%" />
      </header>

      <section className="space-y-4">
        <SkeletonBlock h={180} />
        <SkeletonBlock h={120} />
        <SkeletonBlock h={120} />
      </section>

      <section>
        <SkeletonLine width={90} className="h-3" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SkeletonBlock h={86} />
          <SkeletonBlock h={86} />
        </div>
      </section>

      <SkeletonCard lines={2} />
    </div>
  );
}
