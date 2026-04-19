"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { CtaButton } from "@/components/ui/CtaButton";
import { CityCombobox } from "./CityCombobox";
import { WaitlistModal } from "./WaitlistModal";
import { getCohortCountAction } from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";
import { COHORT_CAP } from "@/lib/cohort";
import { useCohort, type UniValue } from "@/lib/state/cohort-context";
import { UNIVERSITIES, type University } from "@/lib/supabase/schema";
import { cn } from "@/lib/utils";

/**
 * Full-name metadata for each destination university. We show the short
 * code on the map / activity ticker, but the card surfaces the full name
 * so first-time visitors don't have to decode abbreviations. City + short
 * code sit above as a small pre-title. Tagline grounds each campus in a
 * quick, honest identity.
 */
const UNIVERSITY_META: Record<
  University,
  { full: string; city: string; tagline: string }
> = {
  UCD: {
    full: "University College Dublin",
    city: "Dublin",
    tagline: "Ireland's largest university",
  },
  Trinity: {
    full: "Trinity College Dublin",
    city: "Dublin",
    tagline: "Ireland's oldest university",
  },
  UCC: {
    full: "University College Cork",
    city: "Cork",
    tagline: "Munster's flagship campus",
  },
};

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function CohortCard() {
  // Prefer the shared cohort context so the GroupCanvas below mirrors what
  // the user types here in real time. When the card is rendered outside a
  // provider (e.g. a storybook / marketing clip), fall back to local state
  // so it still works in isolation.
  const ctx = useCohort();
  const [localCity, setLocalCity] = useState("");
  const [localUni, setLocalUni] = useState<UniValue>("");

  const city = ctx?.city ?? localCity;
  const uni: UniValue = ctx?.uni ?? localUni;
  const setCity = ctx?.setCity ?? setLocalCity;
  const setUni: (u: UniValue) => void = ctx?.setUni ?? setLocalUni;

  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const debouncedCity = useDebounced(city.trim(), 350);

  useEffect(() => {
    if (debouncedCity.length < 2 || !uni) {
      // Reset prior fetch state when inputs fall below the query threshold.
      // Runs at most once per input invalidation, not on every render. No
      // cascading-render risk the rule is designed to catch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const cityReady = city.trim().length >= 2;
  const ready = cityReady && !!uni;
  const cityLabel = city.trim();
  const showViz = ready && !isLoading && count !== null && !error;

  // Count how many of the two setup fields are filled. Drives the header
  // progress chip so the user sees the card is a simple two-step form.
  const stepsDone = (cityReady ? 1 : 0) + (uni ? 1 : 0);

  return (
    <>
      <div className="relative overflow-hidden rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-8">
        {/* A whisper of primary color at the top edge so the card reads as */}
        {/* an active surface, not a passive box. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[color:var(--color-primary)] to-transparent opacity-40" />

        {!showViz ? (
          <>
            {/* Header: card title + tiny progress chip. */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                  Build your group
                </p>
                <p className="mt-1 font-heading text-[18px] font-semibold leading-tight text-[color:var(--color-fg)]">
                  Two questions. Instant group.
                </p>
              </div>
              <div
                aria-label={`Step ${stepsDone} of 2`}
                className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]"
              >
                <Dot filled={stepsDone >= 1} />
                <Dot filled={stepsDone >= 2} />
                <span className="tabular-nums">{stepsDone}/2</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* City field */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
                    I am from
                  </label>
                  {cityReady && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                      Ready
                    </span>
                  )}
                </div>
                <CityCombobox
                  value={city}
                  onChange={setCity}
                  placeholder="Try Mumbai, Delhi, Bengaluru..."
                />
              </div>

              {/* University cards */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
                    Going to
                  </label>
                  {uni && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
                      {UNIVERSITY_META[uni as University].city}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {UNIVERSITIES.map((u) => {
                    const meta = UNIVERSITY_META[u];
                    const selected = u === uni;
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUni(u)}
                        aria-pressed={selected}
                        className={cn(
                          "group relative flex min-h-[120px] flex-col items-start gap-2 rounded-[12px] border p-4 text-left transition-all",
                          selected
                            ? "border-[color:var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_10%,transparent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
                            : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] hover:border-[color:var(--color-border-strong)] hover:-translate-y-[1px]",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                            {meta.city} · {u}
                          </p>
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                              selected
                                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]"
                                : "border-[color:var(--color-border-strong)] bg-transparent",
                            )}
                            aria-hidden
                          >
                            {selected && (
                              <Check
                                className="h-3 w-3 text-[color:var(--color-primary-fg)]"
                                strokeWidth={3}
                              />
                            )}
                          </span>
                        </div>
                        <p className="font-heading text-[15px] font-semibold leading-[1.2] text-[color:var(--color-fg)]">
                          {meta.full}
                        </p>
                        <p className="mt-auto text-[12px] leading-[1.35] text-[color:var(--color-fg-muted)]">
                          {meta.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intake pill. Only one option for now. */}
              <div>
                <label className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
                  Intake
                </label>
                <div className="mt-2 flex h-12 items-center justify-between rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4">
                  <span className="flex items-center gap-2 text-[14px] text-[color:var(--color-fg)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                    September 2026
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                    Only intake for now
                  </span>
                </div>
              </div>
            </div>

            {/* Footer state: loading / error / hint */}
            <AnimatePresence mode="wait">
              {ready && isLoading && !error && (
                <motion.p
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-primary)] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
                  </span>
                  Finding your group...
                </motion.p>
              )}
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-4"
                >
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
                </motion.div>
              )}
              {!ready && !error && (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-[13px] leading-[1.55] text-[color:var(--color-fg-muted)]"
                >
                  {cityReady
                    ? "One more step. Pick the campus you're heading to."
                    : uni
                      ? `Got it. ${UNIVERSITY_META[uni as University].full} is set. Now add your home city.`
                      : "Pick a city and a campus to see who has already joined."}
                </motion.p>
              )}
            </AnimatePresence>
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

/** Tiny step-dot used in the progress chip. */
function Dot({ filled }: { filled: boolean }) {
  return (
    <span
      className={cn(
        "block h-1.5 w-1.5 rounded-full transition-colors",
        filled
          ? "bg-[color:var(--color-primary)]"
          : "bg-[color:var(--color-border-strong)]",
      )}
    />
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
  const meta = UNIVERSITY_META[uni];

  const dots = useMemo(() => {
    const arr: Array<"filled" | "open"> = [];
    for (let i = 0; i < COHORT_CAP; i++) {
      arr.push(i < filled ? "filled" : "open");
    }
    return arr;
  }, [filled]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
            {city} → {meta.city} · Sept 2026
          </p>
          <p className="mt-1.5 font-heading text-[16px] font-semibold leading-tight text-[color:var(--color-fg)]">
            {meta.full}
          </p>
        </div>
        <button
          type="button"
          onClick={onChange}
          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-muted)] underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-fg)]"
        >
          change
        </button>
      </div>

      <div className="mt-5 h-px w-full bg-[color:var(--color-border)]" />

      {/* Headline stats. What the user cares about first. */}
      <div className="mt-6 space-y-1">
        {count === 0 ? (
          <>
            <p className="text-[17px] font-medium leading-[1.4] text-[color:var(--color-fg)]">
              Be the first from {city} heading to {uni}.
            </p>
            <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              Founding members get lifetime priority matching.
            </p>
          </>
        ) : full ? (
          <>
            <p className="text-[17px] font-medium leading-[1.4] text-[color:var(--color-fg)]">
              The {city} → {uni} group is full.
            </p>
            <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              Reserve a connector slot and we will make room.
            </p>
          </>
        ) : (
          <>
            <p className="text-[17px] font-medium leading-[1.4] text-[color:var(--color-fg)]">
              {filled} {filled === 1 ? "student" : "students"} from {city}{" "}
              {filled === 1 ? "has" : "have"} joined for {uni}.
            </p>
            <p className="text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">
              Group caps at {COHORT_CAP}. {remaining} spots open.
            </p>
          </>
        )}
      </div>

      {/* Primary CTA. Above the 100-dot grid so it's in the first fold. */}
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

      {/* Context viz. 100-dot group, now framed as confirmation, not a gate. */}
      <div className="mt-8 flex items-center justify-between">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Your group so far
        </p>
        <p className="font-mono text-[11px] tabular-nums text-[color:var(--color-fg-subtle)]">
          {filled}/{COHORT_CAP}
        </p>
      </div>

      <div
        className="mt-3 grid grid-cols-10 gap-[6px]"
        role="img"
        aria-label={`${filled} of ${COHORT_CAP} spots filled in the ${city} to ${uni} September 2026 group`}
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
    </div>
  );
}
