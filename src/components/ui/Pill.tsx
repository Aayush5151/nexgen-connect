import { cn } from "@/lib/utils";

type DotVariant = "accent" | "muted" | "success" | "danger";

interface PillProps {
  children: React.ReactNode;
  dot?: DotVariant;
  className?: string;
}

const dotColors: Record<DotVariant, string> = {
  accent: "bg-[color:var(--color-primary)]",
  muted: "bg-[color:var(--color-fg-subtle)]",
  success: "bg-[color:var(--color-success)]",
  danger: "bg-[color:var(--color-danger)]",
};

export function Pill({ children, dot = "accent", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[dot])} />
      {children}
    </span>
  );
}
