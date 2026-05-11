import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea — multi-line input primitive.
 *
 * Same visual grammar as <Input> (surface bg + hairline border + focus
 * tint), but lets the height grow with content. Default 4 rows, can be
 * overridden with `rows` or auto-sized externally.
 *
 * v18 trillion-dollar polish.
 */
export type TextareaProps = React.ComponentProps<"textarea">;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        data-slot="textarea"
        className={cn(
          "w-full rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-3 text-[14px] leading-[1.55] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-[border-color] duration-[150ms] focus:border-[color:var(--color-primary)]/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
