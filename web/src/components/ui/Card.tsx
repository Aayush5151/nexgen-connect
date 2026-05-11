import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — the canonical elevated surface primitive.
 *
 * Trillion-dollar discipline: every "rounded box on the page" goes
 * through here. No more ad-hoc `rounded-[14px] border bg-surface p-5`.
 * If a future contributor reaches for an inline classname instead of
 * <Card>, that's a smell — the system has lost a battle.
 *
 * Composable slots, following the shadcn/Stripe pattern:
 *
 *   <Card>                       — outer surface (.card class from globals)
 *     <CardHeader>               — title + description block (top)
 *       <CardEyebrow />          — optional ALL-CAPS kicker (label-eyebrow)
 *       <CardTitle />            — main heading (title-md by default)
 *       <CardDescription />      — supporting line under title (body-sm)
 *     </CardHeader>
 *     <CardContent>              — the rest of the body
 *     <CardFooter>               — optional CTA strip at the bottom
 *   </Card>
 *
 * Variants:
 *   variant="default"            — .card  (inset hairline + surface bg)
 *   variant="interactive"        — .card-interactive (adds hover-lift)
 *   variant="quiet"              — .card-quiet (transparent bg + 1px border)
 *   variant="primary"            — primary-tinted border + ambient glow
 *                                  (used for premium / featured cards)
 *
 * The primary variant is the *only* place we use a colored shadow on
 * the whole site, and only when the surface needs to read as
 * "featured" (premium plan, hero card, etc.).
 *
 * v18 trillion-dollar polish.
 */

type CardVariant = "default" | "interactive" | "quiet" | "primary";

type CardProps = React.ComponentProps<"div"> & {
  variant?: CardVariant;
  as?: "div" | "section" | "article";
};

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: "card",
  interactive: "card-interactive",
  quiet: "card-quiet",
  primary:
    "card relative overflow-hidden border border-[color:var(--color-primary)]/30",
};

export function Card({
  className,
  variant = "default",
  as = "div",
  children,
  ...props
}: CardProps) {
  const Component = as as React.ElementType;
  return (
    <Component
      data-slot="card"
      data-variant={variant}
      className={cn(VARIANT_CLASSES[variant], className)}
      {...props}
    >
      {children}
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color:var(--color-primary)]/[0.08] blur-2xl"
        />
      )}
    </Component>
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-5 pb-3", className)}
      {...props}
    />
  );
}

export function CardEyebrow({
  className,
  tone = "subtle",
  ...props
}: React.ComponentProps<"p"> & { tone?: "subtle" | "primary" }) {
  return (
    <p
      data-slot="card-eyebrow"
      className={cn(
        "label-eyebrow",
        tone === "primary"
          ? "text-[color:var(--color-primary)]"
          : "text-[color:var(--color-fg-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("title-md text-[color:var(--color-fg)]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("body-sm text-[color:var(--color-fg-muted)]", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 pb-5", className)}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 border-t border-[color:var(--color-border)] px-5 py-3.5",
        className,
      )}
      {...props}
    />
  );
}
