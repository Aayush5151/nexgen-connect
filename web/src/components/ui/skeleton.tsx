import { cn } from "@/lib/utils";

/**
 * Skeleton primitives — the loading language.
 *
 * Trillion-dollar surfaces never show "Loading..." text. They show a
 * silhouette of the content that's about to arrive. The user's eye
 * tracks where the real content will land; when it lands, nothing
 * jumps. That's perceived-instant.
 *
 * Composition:
 *   <Skeleton />               — raw shimmer block, pass className
 *   <SkeletonLine width="60%"/>— text-row shimmer at body line-height
 *   <SkeletonBlock h={140}/>   — pill-rounded surface shimmer
 *   <SkeletonAvatar size={40}/>— circular shimmer
 *   <SkeletonRow />            — generic list row (avatar + 2 lines + tail)
 *   <SkeletonCard />           — section card (label + title + 3 lines)
 *
 * All animate via the `.skeleton` class in globals.css — a single
 * 1.6s shimmer with `prefers-reduced-motion` quieting handled there.
 *
 * v17 / v16 web pivot §Bucket 5.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

function SkeletonLine({
  width = "100%",
  className,
}: {
  width?: string | number;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn("h-[0.9em] rounded-[6px]", className)}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    />
  );
}

function SkeletonBlock({
  h = 80,
  className,
}: {
  h?: number;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn("w-full rounded-[14px]", className)}
      style={{ height: `${h}px` }}
    />
  );
}

function SkeletonAvatar({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-4",
        className,
      )}
    >
      <SkeletonAvatar size={36} />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="40%" />
        <SkeletonLine width="80%" />
      </div>
      <SkeletonLine width={28} />
    </div>
  );
}

function SkeletonCard({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card p-5",
        className,
      )}
    >
      <SkeletonLine width={84} className="h-3" />
      <SkeletonLine width="55%" className="mt-3 h-7" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? "60%" : "100%"}
          />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonLine,
  SkeletonBlock,
  SkeletonAvatar,
  SkeletonRow,
  SkeletonCard,
};
