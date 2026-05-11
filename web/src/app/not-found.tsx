import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * 404 — page-not-found.
 *
 * Quiet, confident, helpful. The eyebrow gives the number for those
 * who care; the headline reframes the moment ("this page doesn't
 * exist"); the body offers one good path forward. No apology, no
 * filler.
 *
 * v17 / v16 web pivot §Bucket 4.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 items-center py-32 md:py-40">
        <div className="container-narrow">
          <div className="max-w-[640px]">
            <p className="label-eyebrow text-[color:var(--color-fg-subtle)]">
              404
            </p>
            <h1 className="mt-6 display-xl text-[color:var(--color-fg)]">
              This page doesn&apos;t exist.
            </h1>
            <p className="mt-6 body-lg text-[color:var(--color-fg-muted)]">
              Probably a link from the old site, or a typo in the URL.
              <br className="hidden sm:block" />
              The corridor is still open.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-6 text-[14px] font-medium text-[color:var(--color-primary-fg)] transition-[background-color,transform] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98]"
              >
                Back to home
                <span aria-hidden="true" className="ml-1.5">
                  →
                </span>
              </Link>
              <Link
                href="/how"
                className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 text-[14px] font-medium text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]"
              >
                How it works
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-md px-6 text-[14px] font-medium text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
              >
                Sign up
              </Link>
            </div>

            <p className="mt-12 label-eyebrow text-[color:var(--color-fg-subtle)]">
              Looking for something specific?
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-[14px] text-[color:var(--color-fg-muted)] sm:grid-cols-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-1.5 hover:text-[color:var(--color-fg)]"
                  >
                    <span aria-hidden="true" className="text-[color:var(--color-fg-subtle)]">·</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const QUICK_LINKS = [
  { href: "/how", label: "How NexGen Connect works" },
  { href: "/ucd", label: "UCD corridor" },
  { href: "/tum", label: "TUM corridor" },
  { href: "/research", label: "Research" },
  { href: "/press", label: "Press kit" },
  { href: "/founder", label: "Founder" },
] as const;
