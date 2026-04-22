"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * IdCardPreview. A parallax-tilt ID card. No real data, no real QR -
 * just a tactile artefact that makes "verified" feel physical. Mouse
 * position drives 3D rotation on both axes; a holographic shine layer
 * tracks the cursor.
 *
 * The card is deliberately credit-card-shaped and dimensioned; the
 * iconography (hologram strip, emboss stamp, signed seal) is all
 * purely presentational.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function IdCardPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 50 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const rx = (0.5 - y) * 12; // tilt up when mouse near top
    const ry = (x - 0.5) * 16; // tilt right when mouse near right
    setTilt({ rx, ry, sx: x * 100, sy: y * 100 });
  };

  const onMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, sx: 50, sy: 50 });
  };

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-10 sm:py-12 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[680px] text-center">
          <SectionLabel className="mx-auto">The artefact</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-3 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(26px, 5vw, 48px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Your pass{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              into the group.
            </span>
          </motion.h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[15px]">
            After verification, you get a NexGen ID. Tilt it. The hologram
            shifts. This is what your group sees when you join.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mt-8 max-w-[420px] sm:max-w-[480px]"
          style={{ perspective: 1200 }}
        >
          <div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[18px] border border-[color:var(--color-primary)]/30 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)]"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.18s ease-out",
              background:
                "linear-gradient(135deg, #0A0A0A 0%, #0f1510 40%, #101a13 100%)",
            }}
          >
            {/* Hologram strip - shifts based on cursor */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `conic-gradient(from ${tilt.sx * 3.6}deg at ${tilt.sx}% ${tilt.sy}%, rgba(0,220,130,0.18), rgba(122,184,255,0.12), rgba(250,220,120,0.1), rgba(255,130,200,0.12), rgba(0,220,130,0.18))`,
                mixBlendMode: "screen",
                transition: "background 0.12s linear",
              }}
            />

            {/* Fine grid texture */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Edge shine tracking cursor */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(180px 180px at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.18), transparent 60%)`,
                mixBlendMode: "plus-lighter",
              }}
            />

            {/* Top-left: wordmark */}
            <div
              className="absolute left-5 top-5 flex items-center gap-2"
              style={{ transform: "translateZ(20px)" }}
            >
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 9V3l8 6V3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="leading-[1.05]">
                <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-fg)]">
                  NexGen
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                  Student · Verified
                </p>
              </div>
            </div>

            {/* Top-right: shield */}
            <div
              className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)]/50 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2.5 py-1"
              style={{ transform: "translateZ(24px)" }}
            >
              <ShieldCheck
                className="h-3 w-3 text-[color:var(--color-primary)]"
                strokeWidth={2.5}
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                DigiLocker
              </span>
            </div>

            {/* Center-left: name & handle */}
            <div
              className="absolute bottom-14 left-5"
              style={{ transform: "translateZ(30px)" }}
            >
              <p className="font-serif text-[22px] italic tracking-[-0.01em] text-[color:var(--color-fg)]">
                Aaditya S.
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]">
                Mumbai → Dublin · Sep 2026
              </p>
            </div>

            {/* Bottom: ID number + QR placeholder */}
            <div
              className="absolute bottom-4 left-5 right-5 flex items-end justify-between"
              style={{ transform: "translateZ(18px)" }}
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
                  ID
                </p>
                <p className="font-mono text-[12px] tabular-nums text-[color:var(--color-fg)]">
                  NGC · 249 · BOM · 0142
                </p>
              </div>
              {/* QR placeholder */}
              <div
                aria-hidden="true"
                className="h-12 w-12 rounded-[6px] border border-[color:var(--color-primary)]/30 bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-1"
              >
                <div
                  className="h-full w-full rounded-[3px]"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(var(--color-primary) 0% 25%, transparent 0% 50%) 50% / 8px 8px",
                    maskImage:
                      "radial-gradient(circle at 30% 30%, black 40%, transparent 41%), radial-gradient(circle at 70% 30%, black 40%, transparent 41%), radial-gradient(circle at 30% 70%, black 40%, transparent 41%)",
                  }}
                />
              </div>
            </div>

            {/* VERIFIED stamp */}
            <div
              aria-hidden="true"
              className="absolute right-6 top-1/2 -translate-y-1/2 rotate-[-14deg] rounded-[6px] border-2 border-[color:var(--color-primary)]/60 bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--color-primary)]"
              style={{ transform: "rotate(-14deg) translateZ(36px)" }}
            >
              Verified
            </div>

            {/* Fingerprint accent bottom-right */}
            <Fingerprint
              className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-[color:var(--color-primary)]/10"
              strokeWidth={1}
            />
          </div>

          {/* Caption */}
          <p className="mt-4 text-center font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            Move your cursor · the hologram shifts
          </p>
        </motion.div>
      </div>
    </section>
  );
}
