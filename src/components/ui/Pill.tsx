import { cn } from "@/lib/utils";

interface PillProps {
  children: React.ReactNode;
  dot?: "yellow" | "mint" | "coral" | "muted";
  className?: string;
}

const dotColors = {
  yellow: "bg-primary",
  mint: "bg-[#66D9A3]",
  coral: "bg-[#F07A6D]",
  muted: "bg-muted-foreground",
};

export function Pill({ children, dot = "yellow", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-[#121217] px-3 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[dot])} />
      {children}
    </span>
  );
}
