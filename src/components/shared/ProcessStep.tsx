import { cn } from "@/lib/utils";

interface Props {
  number: number;
  title: string;
  timing: string;
  description: string;
  caveat?: string;
  last?: boolean;
}

export function ProcessStep({
  number,
  title,
  timing,
  description,
  caveat,
  last = false,
}: Props) {
  return (
    <div className="relative flex gap-6 pb-10">
      {!last && (
        <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" aria-hidden="true" />
      )}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-[#121217] font-mono text-[12px] font-medium text-muted-foreground">
        {number}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {title}
          </h3>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {timing}
          </span>
        </div>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
        {caveat && (
          <p
            className={cn(
              "mt-3 border-l-2 border-[#E8EC6F]/40 pl-3 text-[13px] italic leading-relaxed text-muted-foreground",
            )}
          >
            {caveat}
          </p>
        )}
      </div>
    </div>
  );
}
