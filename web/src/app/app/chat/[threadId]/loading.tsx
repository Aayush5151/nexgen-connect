import { SkeletonLine, Skeleton } from "@/components/ui/skeleton";

/**
 * /app/chat/[threadId] — single-thread skeleton.
 *
 * Mimics the bubble layout (alternating self vs peer) so the user
 * sees the conversation "shape" before messages arrive. Bubbles are
 * varied-width to avoid the unnatural perfectly-aligned look that
 * gives away a placeholder.
 *
 * v17 / v16 web pivot §Bucket 7.
 */
export default function ChatThreadLoading() {
  const rows: { own: boolean; w: string }[] = [
    { own: false, w: "62%" },
    { own: true, w: "48%" },
    { own: false, w: "78%" },
    { own: false, w: "40%" },
    { own: true, w: "30%" },
    { own: false, w: "70%" },
  ];

  return (
    <div
      className="flex h-[calc(100vh-220px)] flex-col gap-3 pt-2"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="space-y-2">
        <SkeletonLine width={70} className="h-3" />
        <SkeletonLine width="50%" className="h-7" />
      </header>

      <div className="card flex-1 space-y-3 overflow-hidden p-4">
        {rows.map((r, i) => (
          <div
            key={i}
            className={r.own ? "flex justify-end" : "flex justify-start"}
          >
            <Skeleton
              className="h-9 rounded-[12px]"
              style={{ width: r.w }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-[10px]" />
        <Skeleton className="h-12 w-20 rounded-[10px]" />
      </div>
    </div>
  );
}
