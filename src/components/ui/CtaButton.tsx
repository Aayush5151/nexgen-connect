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
  "inline-flex items-center justify-center gap-2 rounded-[10px] text-[14px] font-medium transition-colors duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  md: "h-10 px-5",
  lg: "h-12 px-6",
  xl: "h-14 px-8 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[color:var(--color-primary-hover)]",
  ghost:
    "border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]",
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
      {arrow && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
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
