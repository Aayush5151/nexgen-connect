import { SkeletonLine, SkeletonRow } from "@/components/ui/skeleton";

/**
 * /app/chat — thread-list skeleton.
 *
 * Five rows match the typical thread count for an active corridor
 * (group + 2-3 sub-circles + 1 uni AMA + at most 1 DM). The shimmer
 * lasts ~1.6s — long enough to feel present, short enough that real
 * data lands before the user gets impatient.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
export default function ChatLoading() {
  return (
    <div className="space-y-6 pt-2" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <SkeletonLine width={60} className="h-3" />
        <SkeletonLine width="40%" className="h-9" />
      </header>

      <ul className="card divide-y divide-[color:var(--color-border)] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i}>
            <SkeletonRow />
          </li>
        ))}
      </ul>
    </div>
  );
}
