import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Heading — typography primitive.
 *
 * Pairs with the semantic type scale defined in globals.css:
 *
 *   display-2xl / display-xl / display-lg    hero / page heroes
 *   title-xl / title-lg / title-md / title-sm  in-product titles
 *
 * Use this anywhere you'd otherwise reach for inline `font-heading
 * text-[Npx] tracking-[-0.0Xem]` styling. Picks the right semantic
 * tag (`h1`, `h2`, `h3`, `h4`) AND the right type-scale class together
 * — so visual hierarchy and accessibility hierarchy stay aligned.
 *
 * Default level mapping (override with `as`):
 *   display-2xl / display-xl / display-lg  →  h1
 *   title-xl                              →  h2
 *   title-lg                              →  h2
 *   title-md                              →  h3
 *   title-sm                              →  h4
 *
 * v18 trillion-dollar polish.
 */

export type HeadingLevel =
  | "display-2xl"
  | "display-xl"
  | "display-lg"
  | "title-xl"
  | "title-lg"
  | "title-md"
  | "title-sm";

const LEVEL_TO_TAG: Record<HeadingLevel, "h1" | "h2" | "h3" | "h4"> = {
  "display-2xl": "h1",
  "display-xl": "h1",
  "display-lg": "h1",
  "title-xl": "h2",
  "title-lg": "h2",
  "title-md": "h3",
  "title-sm": "h4",
};

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level: HeadingLevel;
  /** Override the auto-mapped semantic tag. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
};

export function Heading({
  className,
  level,
  as,
  children,
  ...props
}: HeadingProps) {
  const Component = (as ?? LEVEL_TO_TAG[level]) as React.ElementType;
  return (
    <Component
      data-slot="heading"
      data-level={level}
      className={cn(level, "text-[color:var(--color-fg)]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Eyebrow — ALL-CAPS mono kicker, the canonical pre-headline label.
 */
export function Eyebrow({
  className,
  tone = "subtle",
  ...props
}: React.ComponentProps<"p"> & { tone?: "subtle" | "primary" | "fg" }) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        "label-eyebrow",
        tone === "primary" && "text-[color:var(--color-primary)]",
        tone === "subtle" && "text-[color:var(--color-fg-subtle)]",
        tone === "fg" && "text-[color:var(--color-fg)]",
        className,
      )}
      {...props}
    />
  );
}
