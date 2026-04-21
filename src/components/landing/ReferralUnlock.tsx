"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AtSign, Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * ReferralUnlock. A presentation-layer share block. Not a
 * "invite-3-to-skip-waitlist" growth trick - the voice is honest:
 * &ldquo;If you know someone flying to Ireland, send them this.&rdquo;
 *
 * Three share paths:
 *   - WhatsApp deep link (most Indian students use it)
 *   - Copy link (clipboard fallback)
 *   - Native share sheet (mobile default)
 *
 * A small localStorage counter tracks how many times the user has
 * copied/shared from this session, and surfaces as a soft number
 * after first share. Never gates anything - this is not scarcity.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const STORAGE_KEY = "nx-referral-sends";

const SHARE_BODY =
  "Found this app - NexGen Connect. Forms a pocket-sized group of verified students flying to Ireland the same month. All government-verified. No agents, no randoms. Thought you should see it before the September flights.";

const SHARE_URL_BASE = "https://nexgenconnect.com/?ref=";

function makeRefUrl() {
  // Cheap referral ID: time-based, 5 chars, lowercase. Good enough for a
  // pre-launch site; swap to Supabase-generated when real accounts exist.
  const id = Math.random().toString(36).slice(2, 7);
  return `${SHARE_URL_BASE}${id}`;
}

export function ReferralUnlock() {
  const [url, setUrl] = useState<string>(SHARE_URL_BASE + "invite");
  const [copied, setCopied] = useState(false);
  const [sends, setSends] = useState(0);

  useEffect(() => {
    setUrl(makeRefUrl());
    if (typeof window !== "undefined") {
      const saved = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
      if (!Number.isNaN(saved)) setSends(saved);
    }
  }, []);

  const bumpSends = () => {
    setSends((prev) => {
      const next = prev + 1;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      bumpSends();
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail on some browsers/insecure contexts - noop.
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${SHARE_BODY}\n\n${url}`)}`;
  const instagramHref = "https://instagram.com/nexgenconnect";

  const onNativeShare = async () => {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      onCopy();
      return;
    }
    try {
      await navigator.share({
        title: "NexGen Connect",
        text: SHARE_BODY,
        url,
      });
      bumpSends();
    } catch {
      // User cancelled share sheet - nothing to do.
    }
  };

  return (
    <section className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 50%, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">Pass it on</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(30px, 5.5vw, 56px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Know someone flying{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              this September?
            </span>
          </motion.h2>
          <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
            The more of them who verify before the flight, the stronger
            their group will be. Three taps, one link, zero ads.
          </p>
        </div>

        {/* Share card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
          className="mx-auto mt-12 max-w-[640px] rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:mt-14 sm:p-7"
        >
          {/* URL row */}
          <div className="flex items-center gap-2 rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
              Link
            </span>
            <span className="flex-1 truncate font-mono text-[12px] text-[color:var(--color-fg)]">
              {url.replace("https://", "")}
            </span>
            <button
              type="button"
              onClick={onCopy}
              aria-label={copied ? "Link copied" : "Copy link"}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                copied
                  ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                  : "border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-primary)]/50 hover:text-[color:var(--color-fg)]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" strokeWidth={2} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
              onClick={bumpSends}
              className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-[13px] font-medium text-[color:var(--color-fg)] transition-all hover:-translate-y-px hover:border-[color:var(--color-primary)]/50"
            >
              <MessageCircle
                className="h-4 w-4 text-[color:var(--color-primary)]"
                strokeWidth={2}
              />
              WhatsApp
            </a>
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer noopener"
              onClick={bumpSends}
              className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-[13px] font-medium text-[color:var(--color-fg)] transition-all hover:-translate-y-px hover:border-[color:var(--color-primary)]/50"
            >
              <AtSign
                className="h-4 w-4 text-[color:var(--color-primary)]"
                strokeWidth={2}
              />
              Instagram DM
            </a>
            <button
              type="button"
              onClick={onNativeShare}
              className="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-primary)] px-4 py-3 font-heading text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-all hover:-translate-y-px hover:bg-[color:var(--color-primary-hover)]"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
              Share
            </button>
          </div>

          {/* Counter */}
          {sends > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]"
            >
              Thank you · {sends} {sends === 1 ? "person" : "people"} from your
              list
            </motion.p>
          )}
        </motion.div>

        <p className="mx-auto mt-8 max-w-[480px] text-center font-serif italic text-[15px] leading-[1.45] text-[color:var(--color-fg-muted)] sm:text-[17px]">
          Your friend&rsquo;s group gets stronger with every verified friend.
        </p>
      </div>
    </section>
  );
}
