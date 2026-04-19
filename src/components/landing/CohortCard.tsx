"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WaitlistModal } from "./WaitlistModal";
import { getCohortCountAction } from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";
import { COHORT_CAP } from "@/lib/cohort";
import { UNIVERSITIES, type University } from "@/lib/supabase/schema";
import { cn } from "@/lib/utils";

const CITY_SUGGESTIONS = [
  "Mumbai",
  "Delhi NCR",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Ahmedabad",
  "Kolkata",
];

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function CohortCard() {
  const [city, setCity] = useState("");
  const [uni, setUni] = useState<University | "">("");
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const debouncedCity = useDebounced(city.trim(), 350);

  useEffect(() => {
    if (debouncedCity.length < 2 || !uni) {
      setCount(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getCohortCountAction({
      home_city: debouncedCity,
      destination_university: uni as University,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setCount(res.count);
          track("Cohort_Viewed", {
            city: debouncedCity,
            uni: uni as string,
          });
        } else {
          setCount(null);
          setError("Couldn't reach the server. Try again in a moment.");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCount(null);
        setError("Couldn't reach the server. Try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedCity, uni]);

  const ready = city.trim().length >= 2 && !!uni;
  const cityLabel = city.trim();
  const showViz = ready && !isLoading && count !== null && !error;

  return (
    <>
      <div className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-8">
        {!showViz ? (
          <>
            <SectionLabel>Build your cohort</SectionLabel>
            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
                  I am from
                </span>
                <input
                  type="text"
                  autoComplete="address-level2"
                  list="city-suggestions"
                  placeholder="Select your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 h-14 w-full rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
                <datalist id="city-suggestions">
                  {CITY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>

              <div>
                <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
                  Going to
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {UNIVERSITIES.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUni(u)}
                      aria-pressed={u === uni}
                      className={cn(
                        "h-14 rounded-[10px] border text-[14px] font-medium transition-colors",
                        u === uni
                          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)]",
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
                  Intake
                </span>
                <div className="mt-2 flex h-14 items-center justify-between rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4">
                  <span className="text-[15px] text-[color:var(--color-fg)]">
                    September 2026
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    Only intake for now
                  </span>
                </div>
              </div>
            </div>

            {ready && isLoading && !error && (
              <p className="mt-6 font-mono text-[13px] text-[color:var(--color-fg-muted)]">
                …
              </p>
            )}
            {error && (
              <div className="mt-6 space-y-4">
                <p className="text-[13px] text-[color:var(--color-danger)]">
                  {error}
                </p>
                <CtaButton
                  onClick={() => {
                    track("Waitlist_Started", {
                      city: cityLabel,
                      uni: uni as string,
                    });
                    setOpen(true);
                  }}
                  size="lg"
                  arrow
                  className="w-full"
                >
                  Reserve spot anyway
                </CtaButton>
              </div>
            )}
            {!ready && !error && (
              <p className="mt-6 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)]">
                Pick a city and a university to see who has already joined.
              </p>
            )}
          </>
        ) : (
          <CohortView
            city={cityLabel}
            uni={uni as University}
            count={count ?? 0}
            onReserve={() => {
              track("Waitlist_Started", {
                city: cityLabel,
                uni: uni as string,
              });
              setOpen(true);
            }}
            onChange={() => {
              setCount(null);
            }}
          />
        )}
      </div>

      {ready && (
        <WaitlistModal
          open={open}
          onClose={() => setOpen(false)}
          cohort={{
            home_city: cityLabel,
            destination_university: uni as University,
          }}
        />
      )}
    </>
  );
}

function CohortView({
  city,
  uni,
  count,
  onReserve,
  onChange,
}: {
  city: string;
  uni: University;
  count: number;
  onReserve: () => void;
  onChange: () => void;
}) {
  const filled = Math.min(count, COHORT_CAP);
  const remaining = Math.max(0, COHORT_CAP - filled);
  const full = filled >= COHORT_CAP;

  const dots = useMemo(() => {
    const arr: Array<"filled" | "open"> = [];
    for (let i = 0; i < COHORT_CAP; i++) {
      arr.push(i < filled ? "filled" : "open");
    }
    return arr;
  }, [filled]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-[16px] font-semibold text-[color:var(--color-fg)]">
          {city} → {uni} · Sept 2026
        </p>
        <button
          type="button"
          onClick={onChange}
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)]"
        >
          change
        </button>
      </div>

      <div className="mt-5 h-px w-full bg-[color:var(--color-border)]" />

      <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        Your cohort so far
      </p>

      <div
        className="mt-4 grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[3px]"
        role="img"
        aria-label={`${filled} of ${COHORT_CAP} spots filled in the ${city} to ${uni} Sept 2026 cohort`}
      >
        {dots.map((kind, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.003,
              duration: 0.3,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className={cn(
              "aspect-square rounded-full",
              kind === "filled"
                ? "bg-[color:var(--color-primary)] opacity-85"
                : "border border-[color:var(--color-border-strong)] bg-transparent",
            )}
          />
        ))}
      </div>

      <div className="mt-6 space-y-1">
        {count === 0 ? (
          <>
            <p className="text-[15px] leading-[1.5] text-[color:var(--color-fg)]">
              Be the first from {city} heading to {uni}.
            </p>
            <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              Founding members get lifetime priority matching.
            </p>
          </>
        ) : full ? (
          <>
            <p className="text-[15px] leading-[1.5] text-[color:var(--color-fg)]">
              The {city} → {uni} cohort is full.
            </p>
            <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              Reserve a connector slot and we will make room.
            </p>
          </>
        ) : (
          <>
            <p className="text-[15px] leading-[1.5] text-[color:var(--color-fg)]">
              {filled} {filled === 1 ? "student" : "students"} from {city} {filled === 1 ? "has" : "have"}{" "}
              joined for {uni}.
            </p>
            <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              Cohort caps at {COHORT_CAP}. {remaining} spots open.
            </p>
          </>
        )}
      </div>

      <div className="mt-6">
        <CtaButton
          onClick={onReserve}
          size="lg"
          arrow
          className="w-full"
        >
          {count === 0
            ? "Claim spot #1"
            : full
              ? "Join waitlist"
              : `Reserve spot #${filled + 1}`}
        </CtaButton>
      </div>
    </div>
  );
}
