"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

/**
 * FooterEmail. One-tap copy with a tiny inline confirmation + sonner
 * toast. The link still works as a normal `mailto:` fallback (right-click,
 * long-press, middle-click) thanks to `href`.
 */
export function FooterEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Only hijack the basic left-click. Right-click, cmd+click, middle-click
    // fall through to the mailto: behaviour.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const copyPromise =
      typeof navigator !== "undefined" && navigator.clipboard
        ? navigator.clipboard.writeText(email)
        : Promise.reject(new Error("clipboard unavailable"));

    copyPromise
      .then(() => {
        setCopied(true);
        toast.success("Email copied", {
          description: email,
          action: {
            label: "Open mail",
            onClick: () => {
              window.location.href = `mailto:${email}`;
            },
          },
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // If clipboard blocked, fall back to the mailto.
        window.location.href = `mailto:${email}`;
      });
  }

  return (
    <a
      href={`mailto:${email}`}
      onClick={onClick}
      className="group mt-6 inline-flex items-center gap-1.5 text-[13.5px] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
    >
      <span>{email}</span>
      <span
        aria-hidden="true"
        className="inline-flex h-4 w-4 items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[color:var(--color-primary)]" strokeWidth={2.5} />
        ) : (
          <Copy className="h-3.5 w-3.5" strokeWidth={2} />
        )}
      </span>
      <span className="sr-only">{copied ? "copied" : "click to copy"}</span>
    </a>
  );
}
