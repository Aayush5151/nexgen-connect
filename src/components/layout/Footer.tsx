import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] py-12">
      <div className="container-narrow">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-[color:var(--color-fg-subtle)]">
            NexGen Connect · Made in India · © {year}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
            <Link
              href="/privacy"
              className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
            >
              Terms
            </Link>
            <a
              href="mailto:hello@nexgenconnect.com"
              className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
            >
              hello@nexgenconnect.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
