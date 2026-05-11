import {
  SkeletonLine,
  SkeletonBlock,
} from "@/components/ui/skeleton";

/**
 * /app/profile — profile skeleton.
 *
 * Shape matches ProfilePage: header (kicker + name + sub), plan card,
 * 3 action rows, 3 account rows.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function ProfileLoading() {
  return (
    <div className="space-y-6 pt-2" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <SkeletonLine width={60} className="h-3" />
        <SkeletonLine width="35%" className="h-9" />
        <SkeletonLine width="60%" />
      </header>

      <SkeletonBlock h={130} />

      <section className="space-y-3">
        <SkeletonLine width={130} className="h-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} h={70} />
        ))}
      </section>

      <section className="space-y-3">
        <SkeletonLine width={70} className="h-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} h={70} />
        ))}
      </section>
    </div>
  );
}
