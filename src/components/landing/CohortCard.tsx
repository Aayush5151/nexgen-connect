"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WaitlistModal } from "./WaitlistModal";
import { getCohortCountAction } from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";
import { UNIVERSITIES, type University } from "@/lib/supabase/schema";
import { cn } from "@/lib/utils";

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
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debouncedCity = useDebounced(city.trim(), 350);

  useEffect(() => {
    if (debouncedCity.length < 2 || !uni) {
      setCount(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCohortCountAction({
      home_city: debouncedCity,
      destination_university: uni as University,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setCount(res.count);
          setTotal(res.total);
          track("Cohort_Viewed", {
            city: debouncedCity,
            uni: uni as string,
          });
        } else {
          setCount(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedCity, uni]);

  const ready = city.trim().length >= 2 && !!uni;
  const cityLabel = city.trim();

  const countText = (() => {
    if (!ready) {
      return "Pick your city and university to see who's already reserving.";
    }
    if (loading || count === null) {
      return "Looking up your cohort…";
    }
    if (count === 0) {
      return `Be the first from ${cityLabel} heading to ${uni}.`;
    }
    if (count === 1) {
      return `1 student from ${cityLabel} is already reserving for ${uni}.`;
    }
    return `${count} students from ${cityLabel} are already reserving for ${uni}.`;
  })();

  return (
    <>
      <div className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-8">
        <SectionLabel>Build your cohort</SectionLabel>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
              Your city in India
            </span>
            <input
              type="text"
              autoComplete="address-level2"
              placeholder="e.g. Pune, Mumbai, Hyderabad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none"
            />
          </label>

          <div>
            <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
              Your university in Ireland
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {UNIVERSITIES.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUni(u)}
                  aria-pressed={u === uni}
                  className={cn(
                    "h-11 rounded-[10px] border text-[14px] font-medium transition-colors",
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
        </div>

        <div className="mt-6 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-primary)]"
              strokeWidth={2}
            />
            <p className="text-[14px] leading-[1.5] text-[color:var(--color-fg)]">
              {countText}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CtaButton
            onClick={() => {
              if (!ready) return;
              track("Waitlist_Started", {
                city: cityLabel,
                uni: uni as string,
              });
              setOpen(true);
            }}
            disabled={!ready}
            size="lg"
            arrow
          >
            Reserve my spot — free
          </CtaButton>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
            {total !== null && total > 0
              ? `${total} on the list`
              : "Verified · Sept 2026"}
          </span>
        </div>
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
