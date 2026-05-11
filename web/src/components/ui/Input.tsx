import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — text input primitive.
 *
 * Replaces ad-hoc inline classnames in signup forms, help triage,
 * chat compose, etc. Use this everywhere a user types a single line.
 *
 * Variants:
 *   default  — surface bg, hairline border, focus tint
 *   ghost    — transparent bg, only-visible-on-focus (for filter rows,
 *              search bars embedded in chrome)
 *
 * Sizing:
 *   md (h-11)  — default for forms
 *   lg (h-12)  — chat compose, search bars
 *   sm (h-9)   — inline / compact filters
 *
 * a11y / motion:
 *   - focus-visible ring uses the global token (primary)
 *   - readonly + disabled handled via Tailwind state variants
 *   - prefers-reduced-motion neutralized via globals
 *
 * v18 trillion-dollar polish.
 */

type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "ghost";

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-11 px-4 text-[14px]",
  lg: "h-12 px-4 text-[14px]",
};

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default:
    "border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] focus:border-[color:var(--color-primary)]/60",
  ghost:
    "border border-transparent bg-transparent hover:border-[color:var(--color-border)] focus:border-[color:var(--color-primary)]/60 focus:bg-[color:var(--color-surface)]",
};

export type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  inputSize?: InputSize;
  variant?: InputVariant;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className, inputSize = "md", variant = "default", type = "text", ...props },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "w-full rounded-[10px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color,background-color] duration-[150ms] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          SIZE_CLASSES[inputSize],
          VARIANT_CLASSES[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
