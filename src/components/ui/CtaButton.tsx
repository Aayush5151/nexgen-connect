import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-[1.04] active:brightness-[0.98] shadow-[0_1px_0_rgba(0,0,0,0.25)]",
  secondary:
    "border border-border bg-[#121217] text-foreground hover:border-[#2A2A30] hover:bg-[#171720]",
  ghost: "text-foreground hover:text-primary",
};

export function CtaButton({
  children,
  href,
  onClick,
  variant = "primary",
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

  const classes = cn(base, variants[variant], className);

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
