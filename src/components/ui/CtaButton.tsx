import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "link";
type Size = "md" | "lg" | "xl";

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

const base =
  "group inline-flex items-center justify-center gap-2 rounded-[10px] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-[150ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform hover:-translate-y-px active:translate-y-0 active:duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

const sizes: Record<Size, string> = {
  md: "h-10 px-5 text-[13px]",
  lg: "h-12 px-6 text-[14px]",
  xl: "h-[56px] px-8 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)] active:bg-[color:var(--color-primary-pressed)]",
  ghost:
    "border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-elevated)]",
  link:
    "text-[color:var(--color-primary)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-primary-hover)]",
};

export function CtaButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "lg",
  className,
  arrow = false,
  type = "button",
  disabled = false,
}: Props) {
  const inner = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-[150ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      )}
    </>
  );

  const classes = cn(base, sizes[size], variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  );
}
