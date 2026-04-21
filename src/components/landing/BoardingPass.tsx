"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Plane, Share2 } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * BoardingPass. Pick a name, a home city, and an intake - we generate
 * a simulated boarding pass (seat, gate, flight code, group) and offer
 * a PNG download.
 *
 * Marketing purpose: give the visitor an artefact of the future group.
 * It is not a real ticket. We watermark and dateline it accordingly.
 *
 * Flight codes are anchored to real carrier routes for each city so
 * the ticket reads plausibly - EK 049 out of BOM, AI 111 out of DEL,
 * QR 601 out of BLR, etc. Seat / gate / group vary per generation.
 *
 * PNG export uses `html-to-image`. The node is cloned + painted to a
 * canvas, so the download is identical to the on-screen render.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const CITIES = [
  { label: "Mumbai", iata: "BOM", airline: "EK", flight: "049" },
  { label: "Delhi", iata: "DEL", airline: "AI", flight: "111" },
  { label: "Bangalore", iata: "BLR", airline: "QR", flight: "601" },
  { label: "Hyderabad", iata: "HYD", airline: "EK", flight: "525" },
  { label: "Chennai", iata: "MAA", airline: "QR", flight: "531" },
  { label: "Pune", iata: "PNQ", airline: "LH", flight: "764" },
  { label: "Kolkata", iata: "CCU", airline: "QR", flight: "541" },
  { label: "Ahmedabad", iata: "AMD", airline: "EK", flight: "537" },
  { label: "Chandigarh", iata: "IXC", airline: "AI", flight: "149" },
] as const;

type CityCode = (typeof CITIES)[number]["iata"];

const INTAKES = ["September 2026", "January 2027", "September 2027"] as const;

type Intake = (typeof INTAKES)[number];

// Deterministic pseudo-random based on string. Stable across renders,
// looks random.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Pass = {
  name: string;
  city: (typeof CITIES)[number];
  intake: Intake;
  seat: string;
  gate: string;
  boarding: string;
  group: number;
  reference: string;
};

function generatePass(
  name: string,
  cityCode: CityCode,
  intake: Intake,
): Pass | null {
  const city = CITIES.find((c) => c.iata === cityCode);
  if (!city) return null;
  const seed = hash(`${name}|${cityCode}|${intake}`);
  // Use unsigned right shift (>>>) everywhere so the high bit of seed
  // doesn't flip the shifted value negative (negative % positive in JS
  // is negative, which would produce "06:-50" boarding times and
  // "undefined" seat letters for certain name/city combos).
  const rowNum = (seed % 34) + 7;
  const seatLetter = ["A", "B", "C", "D", "E", "F"][(seed >>> 4) % 6];
  const gateNum = ((seed >>> 8) % 28) + 12;
  const boardH = 6 + ((seed >>> 12) % 3); // 6-8
  const boardM = ((seed >>> 16) % 6) * 10; // 00/10/.../50
  const group = ((seed >>> 20) % 4) + 7; // 7-10
  const ref = `NGC${(seed % 900000 + 100000).toString()}`;
  return {
    name: name.trim().toUpperCase(),
    city,
    intake,
    seat: `${rowNum}${seatLetter}`,
    gate: `${gateNum}`,
    boarding: `0${boardH}:${boardM.toString().padStart(2, "0")}`,
    group,
    reference: ref,
  };
}

export function BoardingPass() {
  const [name, setName] = useState("");
  const [cityCode, setCityCode] = useState<CityCode>("BOM");
  const [intake, setIntake] = useState<Intake>("September 2026");
  const [pass, setPass] = useState<Pass | null>(null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const canSubmit = name.trim().length >= 2;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const p = generatePass(name, cityCode, intake);
    if (p) {
      setPass(p);
      // Share state with DublinArrival so the arrivals board can light
      // up *this* flight specifically. Silent on failure.
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "nx-flight-plan",
            JSON.stringify({
              city: p.city.label,
              iata: p.city.iata,
              intake: p.intake,
              flight: `${p.city.airline} ${p.city.flight}`,
              gate: p.gate,
              group: p.group,
              name: p.name,
              ts: Date.now(),
            }),
          );
        } catch {
          // Safari private mode etc.
        }
      }
    }
  };

  const onReset = () => setPass(null);

  const download = useCallback(async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0A0A0A",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `nexgen-boarding-${pass?.reference}.png`;
      a.click();
    } catch {
      // Render can fail on certain Safari versions; silent fallback.
    } finally {
      setDownloading(false);
    }
  }, [pass?.reference]);

  return (
    <section className="relative overflow-hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 sm:py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 40%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">Your ticket · illustrative</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
            style={{
              fontSize: "clamp(30px, 6vw, 60px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Your boarding pass{" "}
            <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
              to Dublin.
            </span>
          </motion.h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
            Not real. Feels real. Downloadable so you can tape it above your desk
            until September 2026 actually arrives.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[760px] sm:mt-16">
          <AnimatePresence mode="wait">
            {!pass ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                onSubmit={onSubmit}
                className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-7"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="bp-name"
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
                    >
                      Your name
                    </label>
                    <input
                      id="bp-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aaditya Sharma"
                      autoComplete="off"
                      className="rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 font-body text-[14px] text-[color:var(--color-fg)] transition-colors placeholder:text-[color:var(--color-fg-subtle)] hover:border-[color:var(--color-primary)]/50 focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="bp-city"
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
                    >
                      From
                    </label>
                    <select
                      id="bp-city"
                      value={cityCode}
                      onChange={(e) => setCityCode(e.target.value as CityCode)}
                      className="rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 font-body text-[14px] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/50 focus:border-[color:var(--color-primary)] focus:outline-none"
                    >
                      {CITIES.map((c) => (
                        <option key={c.iata} value={c.iata}>
                          {c.label} · {c.iata}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="bp-intake"
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]"
                    >
                      Intake
                    </label>
                    <select
                      id="bp-intake"
                      value={intake}
                      onChange={(e) => setIntake(e.target.value as Intake)}
                      className="rounded-[10px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 font-body text-[14px] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)]/50 focus:border-[color:var(--color-primary)] focus:outline-none"
                    >
                      {INTAKES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-start gap-3 border-t border-[color:var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    Not a real ticket · simulation only
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)] px-5 py-2.5 font-heading text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-all duration-200 hover:-translate-y-px hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:bg-[color:var(--color-border-strong)] disabled:text-[color:var(--color-fg-subtle)]"
                  >
                    <Plane className="h-3.5 w-3.5" strokeWidth={2} />
                    Print my pass
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col items-center gap-6"
              >
                <Ticket ref={ticketRef} pass={pass} />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={download}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)] px-4 py-2 font-heading text-[13px] font-semibold text-[color:var(--color-primary-fg)] transition-all duration-200 hover:-translate-y-px hover:bg-[color:var(--color-primary-hover)] disabled:cursor-wait"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={2} />
                    {downloading ? "Rendering..." : "Download PNG"}
                  </button>
                  <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)] transition-colors hover:border-[color:var(--color-primary)]/50 hover:text-[color:var(--color-fg)]"
                  >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Make another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

type TicketProps = { pass: Pass };

const Ticket = ({ pass, ref }: TicketProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const arrivalLocal = useMemo(() => {
    // Dublin arrival is ~10-11 hours later than IST boarding (varies
    // by routing); we just fake a plausible local time.
    const [h, m] = pass.boarding.split(":").map(Number);
    const totalMin = (h - 4) * 60 + m + 120; // subtract 4.5h, add 2h layover
    const nh = Math.max(0, Math.floor((totalMin / 60) % 24));
    const nm = Math.max(0, totalMin % 60);
    return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
  }, [pass.boarding]);

  return (
    <div
      ref={ref}
      className="relative flex w-full max-w-[720px] flex-col overflow-hidden rounded-[18px] font-mono md:flex-row"
      style={{
        background:
          "linear-gradient(135deg, #0c0f0d 0%, #0f1510 50%, #101a13 100%)",
        boxShadow:
          "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)",
      }}
    >
      {/* Main body - min-w-0 so flex child can actually shrink on mobile. */}
      <div className="min-w-0 flex-1 p-5 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 9V3l8 6V3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-fg)]">
              NexGen · Boarding Pass
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
            {pass.intake}
          </p>
        </div>

        {/* Origin → Destination */}
        <div className="mt-6 flex items-end gap-3 md:mt-8 md:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
              From
            </p>
            <p className="mt-1 font-heading text-[32px] font-bold leading-[0.95] text-[color:var(--color-fg)] md:text-[56px]">
              {pass.city.iata}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">
              {pass.city.label}
            </p>
          </div>
          <div className="mb-2 flex flex-1 items-center gap-1.5 px-1 md:mb-3 md:gap-2 md:px-2">
            <span className="h-[1px] flex-1 bg-[color:var(--color-primary)]/40" />
            <Plane
              className="h-3.5 w-3.5 text-[color:var(--color-primary)] md:h-4 md:w-4"
              strokeWidth={2}
            />
            <span className="h-[1px] flex-1 bg-[color:var(--color-primary)]/40" />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
              To
            </p>
            <p className="mt-1 font-heading text-[32px] font-bold leading-[0.95] text-[color:var(--color-primary)] md:text-[56px]">
              DUB
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">
              Dublin
            </p>
          </div>
        </div>

        {/* Passenger */}
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
            Passenger
          </p>
          <p className="mt-1 font-heading text-[18px] font-semibold tracking-[0.04em] text-[color:var(--color-fg)] md:text-[20px]">
            {pass.name}
          </p>
        </div>

        {/* Detail grid */}
        <div className="mt-5 grid grid-cols-3 gap-4 text-[color:var(--color-fg-muted)] md:grid-cols-5">
          <Cell label="Flight" value={`${pass.city.airline} ${pass.city.flight}`} />
          <Cell label="Gate" value={pass.gate} />
          <Cell label="Boarding" value={`${pass.boarding} IST`} />
          <Cell label="Arrival" value={`${arrivalLocal} IST`} />
          <Cell label="Seat" value={pass.seat} />
        </div>
      </div>

      {/* Perforation - horizontal divider on mobile, vertical on md+. */}
      <div
        aria-hidden="true"
        className="h-[1px] w-full md:hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 6px, color-mix(in srgb, var(--color-primary) 35%, transparent) 6px 10px)",
        }}
      />
      <div
        aria-hidden="true"
        className="relative hidden w-[1px] bg-[color:var(--color-primary)]/20 md:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0 6px, color-mix(in srgb, var(--color-primary) 35%, transparent) 6px 10px)",
        }}
      />

      {/* Stub - full-width horizontal strip on mobile, 200px vertical rail on md+. */}
      <div className="flex w-full shrink-0 items-center justify-between gap-5 px-5 py-4 md:w-[200px] md:flex-col md:justify-between md:p-5">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
            Your group
          </p>
          <p className="mt-1 font-heading text-[28px] font-bold leading-none tabular-nums text-[color:var(--color-primary)] md:text-[38px]">
            {pass.group}
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-fg-muted)]">
            verified
          </p>
        </div>

        {/* Faux barcode */}
        <div
          aria-hidden="true"
          className="flex h-8 items-stretch gap-[2px] md:my-4 md:h-10"
        >
          {Array.from({ length: 22 }).map((_, i) => {
            const w = [1, 1, 2, 1, 3, 1, 2, 1, 1, 3][i % 10];
            return (
              <span
                key={i}
                style={{ width: `${w}px` }}
                className="bg-[color:var(--color-fg)]/90"
              />
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
            Ref
          </p>
          <p className="text-[10px] tabular-nums text-[color:var(--color-fg-muted)]">
            {pass.reference}
          </p>
        </div>
      </div>

      {/* Diagonal watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="font-heading text-[80px] font-bold opacity-[0.04]"
          style={{
            transform: "rotate(-20deg)",
            letterSpacing: "0.1em",
            color: "var(--color-primary)",
          }}
        >
          SIMULATION
        </span>
      </div>
    </div>
  );
};

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[color:var(--color-fg)]">
        {value}
      </p>
    </div>
  );
}
