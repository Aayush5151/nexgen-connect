import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label — form label primitive.
 *
 * Pairs with <Input> / <Textarea> via htmlFor. Uses the label-eyebrow
 * type style by default (ALL-CAPS mono kicker) — this matches our
 * "kicker above the field" pattern from the signup funnel and admin
 * forms.
 *
 * Use the `tone` prop to switch to the soft variant (lowercase
 * body-sm) for compact / inline forms.
 *
 * v18 trillion-dollar polish.
 */

type LabelTone = "eyebrow" | "soft";

export type LabelProps = React.ComponentProps<"label"> & {
  tone?: LabelTone;
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  function Label({ className, tone = "eyebrow", ...props }, ref) {
    return (
      <label
        ref={ref}
        data-slot="label"
        className={cn(
          "inline-block",
          tone === "eyebrow"
            ? "label-eyebrow text-[color:var(--color-fg-subtle)]"
            : "body-sm text-[color:var(--color-fg-muted)]",
          className,
        )}
        {...props}
      />
    );
  },
);
