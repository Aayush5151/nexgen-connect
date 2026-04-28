"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  initials: string;
  size: number;
  className?: string;
  sizes?: string;
}

export function FounderPhoto({
  src,
  alt,
  initials,
  size,
  className,
  sizes,
}: Props) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {!errored && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? `${size}px`}
          className="object-cover"
          // Anchor the crop window toward the top so head-and-shoulders
          // portraits never clip the top of the head. `object-cover` with
          // a default centered position crops portrait images at both top
          // and bottom; shifting to 18% biases the visible region upward
          // so the face sits fully inside the circular frame.
          style={{ objectPosition: "center 18%" }}
          onError={() => setErrored(true)}
          priority
        />
      )}
      {errored && (
        <div
          className="flex h-full w-full items-center justify-center font-heading font-semibold text-muted-foreground"
          style={{ fontSize: size * 0.28 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
