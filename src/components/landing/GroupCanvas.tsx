"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles, UserPlus } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  DEMO_CITIES,
  getDemoGroup,
  type DemoProfile,
} from "@/lib/data/demo-profiles";
import { useCohort } from "@/lib/state/cohort-context";
import { COHORT_CAP } from "@/lib/cohort";
import { UNIVERSITIES, type University } from "@/lib/supabase/schema";
import { cn } from "@/lib/utils";

/**
 * GroupCanvas renders a personalized preview of a visitor's future cohort
 * so they can see what they are joining before they reserve. This is
 * deliberately NOT a swipe UI. The whole group is visible at once, which
 * is the mental model the Manifesto commits to: "a verified group, not a
 * dating app."
 *
 * Personalization. If a CohortProvider is present, the section seeds its
 * corridor from the user's current CohortCard selection above. The chip
 * + tab row lets them peek at other corridors without committing. Local
 * preview state is kept separate from the shared context so the canvas
 * never hijacks the card's binding choice.
 *
 * Grid. Always renders exactly COHORT_CAP (10) slots. First N are filled
 * from the demo roster, the next is a pulsing +You CTA tile, and the
 * rest are quiet "open" placeholders. When a corridor is near-full the
 * +You tile sits at the end and reads as urgency ("Last seat").
 */

const DEFAULT_CITY = "Mumbai";
const DEFAULT_UNI: University = "UCD";
const INTAKE_LABEL = "Sept 2026";

/** Full + short forms for the board header + subhead copy. */
const UNI_META: Record<University, { city: string; full: string }> = {
  UCD: { city: "Dublin", full: "University College Dublin" },
  Trinity: { city: "Dublin", full: "Trinity College Dublin" },
  UCC: { city: "Cork", full: "University College Cork" },
};

/** What each slot in the 10-seat group can be. */
type Slot =
  | { kind: "profile"; profile: DemoProfile; spot: number }
  | { kind: "you"; spot: number; isLast: boolean }
  | { kind: "open"; spot: number };

export function GroupCanvas() {
  // Nullable ctx so this component renders in isolation for tests.
  const ctx = useCohort();

  // Local fallback state so the chips remain interactive when no provider
  // is mounted. When the provider IS present, ctx drives everything and
  // the local state is essentially dead weight. A fine tradeoff for a
  // self-contained preview section.
  const [localCity, setLocalCity] = useState<string>(DEFAULT_CITY);
  const [localUni, setLocalUni] = useState<University>(DEFAULT_UNI);

  // Source of truth: context if available, otherwise local. Derived during
  // render. No effects needed.
  const sourceCity = (ctx?.city?.trim() || localCity) || DEFAULT_CITY;
  const sourceUni = (ctx?.uni as University) || localUni;

  // Normalize against DEMO_CITIES so the grid always has real data to show.
  // Anything not in our preview whitelist falls back to Mumbai silently.
  const previewCity =
    DEMO_CITIES.find(
      (c) => c.toLowerCase() === sourceCity.toLowerCase(),
    ) ?? DEFAULT_CITY;

  const previewUni: University = UNIVERSITIES.includes(sourceUni as University)
    ? (sourceUni as University)
    : DEFAULT_UNI;

  // Chip clicks write to both the context (so CohortCard above mirrors the
  // choice) and local state (so the section still works standalone).
  const selectCity = (v: string) => {
    ctx?.setCity(v);
    setLocalCity(v);
  };
  const selectUni = (v: University) => {
    ctx?.setUni(v);
    setLocalUni(v);
  };

  // Demo roster for the active corridor, capped at the group size.
  const profiles = useMemo(
    () => getDemoGroup(previewCity, previewUni).slice(0, COHORT_CAP),
    [previewCity, previewUni],
  );
  const filled = profiles.length;
  const hasYouSlot = filled < COHORT_CAP;
  const youSlotIndex = filled;

  // Build the 10 slots so the grid animates as one staggered group.
  const slots: Slot[] = useMemo(() => {
    const out: Slot[] = [];
    for (let i = 0; i < COHORT_CAP; i++) {
      if (i < filled) {
        out.push({ kind: "profile", profile: profiles[i], spot: i + 1 });
      } else if (i === youSlotIndex && hasYouSlot) {
        out.push({
          kind: "you",
          spot: i + 1,
          isLast: i + 1 === COHORT_CAP,
        });
      } else {
        out.push({ kind: "open", spot: i + 1 });
      }
    }
    return out;
  }, [profiles, filled, hasYouSlot, youSlotIndex]);

  // Stable key for the grid so every corridor switch restarts the stagger.
  const groupKey = `${previewCity}|${previewUni}`;

  return (
    <section className="section-y border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="container-narrow">
        <div className="mx-auto max-w-[720px] text-center">
          <SectionLabel className="mx-auto">Your group</SectionLabel>
          <h2 className="mt-4 font-serif text-[44px] font-normal leading-[1.0] tracking-[-0.01em] text-[color:var(--color-fg)] md:text-[64px]">
            This is{" "}
            <em className="italic text-[color:var(--color-fg-muted)]">
              who lands with you.
            </em>
          </h2>
          <LeadCopy
            filled={filled}
            city={previewCity}
            uni={previewUni}
          />
        </div>

        <BoardHeader
          city={previewCity}
          uni={previewUni}
          filled={filled}
        />

        {/* Corridor selector. Purely local preview. */}
        <div className="mx-auto mt-8 flex max-w-[820px] flex-col gap-3">
          <ChipRow
            title="City"
            active={previewCity}
            options={DEMO_CITIES}
            onSelect={selectCity}
          />
          <ChipRow
            title="Campus"
            active={previewUni}
            options={UNIVERSITIES as readonly string[]}
            onSelect={(v) => selectUni(v as University)}
            variant="tabs"
          />
        </div>

        {/* Grid of 10 slots. Keyed on corridor to re-run the stagger. */}
        <motion.ul
          key={groupKey}
          role="list"
          className="mx-auto mt-10 grid max-w-[820px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
          aria-label={`${previewCity} to ${previewUni} group, ${filled} of ${COHORT_CAP} verified`}
        >
          {slots.map((slot, i) => (
            <motion.li
              key={`${groupKey}-${slot.kind}-${slot.spot}`}
              role="listitem"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.32,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="h-full"
            >
              {slot.kind === "profile" && (
                <ProfileTile profile={slot.profile} spot={slot.spot} />
              )}
              {slot.kind === "you" && (
                <YouTile spot={slot.spot} isLast={slot.isLast} />
              )}
              {slot.kind === "open" && <OpenTile spot={slot.spot} />}
            </motion.li>
          ))}
        </motion.ul>

        <p className="mx-auto mt-8 max-w-[560px] text-center font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          Instagram · LinkedIn unlock once you both join the group
        </p>
      </div>
    </section>
  );
}

/** Context-aware lead copy. Handles the 0-profile founder case cleanly. */
function LeadCopy({
  filled,
  city,
  uni,
}: {
  filled: number;
  city: string;
  uni: University;
}) {
  if (filled === 0) {
    return (
      <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] md:text-[16px]">
        Be the first verified student from{" "}
        <span className="font-semibold text-[color:var(--color-fg)]">
          {city}
        </span>{" "}
        heading to{" "}
        <span className="font-semibold text-[color:var(--color-fg)]">
          {uni}
        </span>
        . Founder seat still open.
      </p>
    );
  }
  return (
    <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] md:text-[16px]">
      Meet{" "}
      <span className="font-semibold tabular-nums text-[color:var(--color-fg)]">
        {filled}
      </span>{" "}
      verified {filled === 1 ? "classmate" : "classmates"} from{" "}
      <span className="font-semibold text-[color:var(--color-fg)]">
        {city}
      </span>{" "}
      heading to{" "}
      <span className="font-semibold text-[color:var(--color-fg)]">
        {uni}
      </span>
      , months before you fly.
    </p>
  );
}

/** Airport-board-style header summarizing the active corridor. */
function BoardHeader({
  city,
  uni,
  filled,
}: {
  city: string;
  uni: University;
  filled: number;
}) {
  const meta = UNI_META[uni];
  return (
    <div className="mx-auto mt-10 flex max-w-[820px] flex-col gap-5 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10">
          <Sparkles
            className="h-4 w-4 text-[color:var(--color-primary)]"
            strokeWidth={2}
          />
        </span>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
            Live corridor
          </p>
          <p className="font-heading text-[20px] font-semibold leading-tight text-[color:var(--color-fg)] md:text-[22px]">
            {city} → {uni}
          </p>
          <p className="mt-0.5 text-[12px] text-[color:var(--color-fg-muted)]">
            {meta.full} · {meta.city}
          </p>
        </div>
      </div>
      <div className="flex items-stretch gap-8 md:gap-12">
        <Stat
          label="Verified"
          value={`${filled}/${COHORT_CAP}`}
          accent="primary"
        />
        <Stat label="Intake" value={INTAKE_LABEL} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary";
}) {
  return (
    <div className="flex flex-col">
      <p
        className={cn(
          "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
          accent === "primary"
            ? "text-[color:var(--color-primary)]"
            : "text-[color:var(--color-fg-subtle)]",
        )}
      >
        {label}
      </p>
      <p className="font-heading text-[18px] font-semibold leading-tight tabular-nums text-[color:var(--color-fg)] md:text-[20px]">
        {value}
      </p>
    </div>
  );
}

function ChipRow({
  title,
  active,
  options,
  onSelect,
  variant = "chips",
}: {
  title: string;
  active: string;
  options: readonly string[];
  onSelect: (v: string) => void;
  variant?: "chips" | "tabs";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-1 w-[64px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
        {title}
      </p>
      {options.map((o) => {
        const isActive = o === active;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onSelect(o)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-medium transition-all",
              variant === "tabs" && "min-w-[64px] justify-center",
              isActive
                ? "border-[color:var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[color:var(--color-fg)]"
                : "border-[color:var(--color-border)] bg-transparent text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-fg)]",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function ProfileTile({
  profile,
  spot,
}: {
  profile: DemoProfile;
  spot: number;
}) {
  return (
    <div className="group relative flex h-full flex-col rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:border-[color:var(--color-border-strong)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
          Spot #{spot}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[color:var(--color-primary)]"
          title={`DigiLocker verified · ${profile.verifiedOn}`}
        >
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>

      <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]">
        <span className="font-heading text-[14px] font-semibold leading-none tracking-[-0.01em] text-[color:var(--color-primary)]">
          {profile.initials.slice(0, 2)}
        </span>
      </div>

      <p className="mt-3 font-heading text-[14px] font-semibold leading-tight text-[color:var(--color-fg)]">
        {profile.name}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-[color:var(--color-fg-muted)]">
        {profile.neighborhood}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-[1.3] text-[color:var(--color-fg-muted)]">
        {profile.program}
      </p>

      <p className="mt-auto line-clamp-1 pt-3 text-[11px] italic leading-[1.3] text-[color:var(--color-fg-subtle)]">
        &ldquo;{profile.interest}&rdquo;
      </p>
    </div>
  );
}

function YouTile({
  spot,
  isLast,
}: {
  spot: number;
  isLast: boolean;
}) {
  const scroll = () => {
    document
      .getElementById("reserve")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heading = isLast ? "Last seat. Yours?" : "Claim this seat";
  const sub = isLast ? "Closes when full" : "Takes 90 seconds";

  return (
    <button
      type="button"
      onClick={scroll}
      aria-label={`Claim spot ${spot} in this group`}
      className="group relative flex h-full w-full flex-col rounded-[14px] border-2 border-dashed border-[color:var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_7%,transparent)] p-4 text-left transition-all hover:-translate-y-[1px] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
          Spot #{spot}
        </span>
        <span className="rounded-full border border-[color:var(--color-primary)]/50 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
          You
        </span>
      </div>

      <div className="relative mt-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[color:var(--color-primary)] bg-transparent">
        <UserPlus
          className="h-5 w-5 text-[color:var(--color-primary)]"
          strokeWidth={2}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-6px] animate-ping rounded-full border border-[color:var(--color-primary)]/40"
        />
      </div>

      <p className="mt-3 font-heading text-[14px] font-semibold leading-tight text-[color:var(--color-primary)]">
        {heading}
      </p>
      <p className="mt-0.5 text-[11px] text-[color:var(--color-fg-muted)]">
        {sub}
      </p>

      <span className="mt-auto inline-flex items-center gap-1 pt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
        Reserve
        <ArrowRight
          className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.5}
        />
      </span>
    </button>
  );
}

function OpenTile({ spot }: { spot: number }) {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col items-center justify-center rounded-[14px] border border-dashed border-[color:var(--color-border)] bg-transparent p-4 text-center"
    >
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
        Spot #{spot}
      </span>
      <span className="mt-2 font-heading text-[12px] font-medium text-[color:var(--color-fg-muted)]">
        Open
      </span>
    </div>
  );
}
