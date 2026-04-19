"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MapPin, Search, X as XIcon } from "lucide-react";
import { INDIAN_CITIES, INDIAN_CITIES_LC } from "@/lib/data/indian-cities";
import { cn } from "@/lib/utils";

/**
 * City autocomplete used in the CohortCard. Renders a searchable combobox
 * over the entire INDIAN_CITIES list. As the user types, matches are
 * re-ranked: prefix hits first, then substring hits. Results are capped so
 * the popover doesn't render 700+ nodes in the dom.
 *
 * Accessibility: combobox + listbox with aria-activedescendant, full
 * keyboard nav (Arrow keys, Enter, Escape). Click-outside closes the menu.
 */

/** Keep the popover fast. Users can narrow further by typing. */
const MAX_VISIBLE = 60;

interface Props {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
}

export function CityCombobox({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep local query mirrored with parent so an external reset (e.g. the
  // "change" button in CohortView) clears the input too.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click-outside dismiss. Uses mousedown so option clicks in onMouseDown
  // still fire before the dropdown unmounts.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return INDIAN_CITIES.slice(0, MAX_VISIBLE);
    const prefix: string[] = [];
    const contains: string[] = [];
    for (let i = 0; i < INDIAN_CITIES.length; i++) {
      const lc = INDIAN_CITIES_LC[i];
      if (lc.startsWith(q)) prefix.push(INDIAN_CITIES[i]);
      else if (lc.includes(q)) contains.push(INDIAN_CITIES[i]);
    }
    return [...prefix, ...contains].slice(0, MAX_VISIBLE);
  }, [q]);

  // Reset highlighted option when the result set changes so cursor can't
  // sit past the end of the list.
  useEffect(() => {
    setCursor(0);
  }, [q]);

  // Scroll active option into view when navigating via keyboard.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLLIElement>(
      `[data-option-index="${cursor}"]`,
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  const select = (city: string) => {
    const clean = city.trim();
    if (!clean) return;
    onChange(clean);
    setQuery(clean);
    setOpen(false);
    setFocused(false);
    inputRef.current?.blur();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      if (open && filtered[cursor]) {
        e.preventDefault();
        select(filtered[cursor]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const picked = value.length > 0 && value === query;
  const totalCount = INDIAN_CITIES.length;

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        {/* Leading icon morphs from Search to MapPin once a city is chosen */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          {picked ? (
            <MapPin
              className="h-[18px] w-[18px] text-[color:var(--color-primary)]"
              strokeWidth={2}
            />
          ) : (
            <Search
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                focused
                  ? "text-[color:var(--color-primary)]"
                  : "text-[color:var(--color-fg-muted)]",
              )}
              strokeWidth={2}
            />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="cc-city-list"
          aria-activedescendant={
            open && filtered[cursor] ? `cc-opt-${cursor}` : undefined
          }
          placeholder={placeholder ?? "Start typing your city..."}
          value={query}
          onFocus={() => {
            setOpen(true);
            setFocused(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKey}
          className={cn(
            "h-14 w-full rounded-[12px] border bg-[color:var(--color-bg)] pl-11 pr-11 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] transition-all focus:outline-none",
            focused
              ? "border-[color:var(--color-primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
              : picked
                ? "border-[color:var(--color-primary)]/60"
                : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]",
          )}
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              inputRef.current?.focus();
              setOpen(true);
            }}
            aria-label="Clear city"
            className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
          >
            <XIcon className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Tiny helper row below the field to coach first-time users. */}
      {!picked && (
        <p className="mt-1.5 pl-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          {totalCount}+ Indian cities. Type any letter to filter.
        </p>
      )}
      {picked && (
        <p className="mt-1.5 flex items-center gap-1.5 pl-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          <Check className="h-3 w-3" strokeWidth={3} />
          {value} locked in
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_14px_50px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/70 px-4 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                {q ? `Matching "${query}"` : "All Indian cities"}
              </p>
              <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-fg-subtle)]">
                {filtered.length}/{totalCount}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] text-[color:var(--color-fg-muted)]">
                  No city matches &ldquo;{query}&rdquo;.
                </p>
                {query.trim().length >= 2 && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      select(query);
                    }}
                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-[8px] border border-[color:var(--color-border-strong)] px-3 text-[12px] text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                  >
                    Use &ldquo;{query.trim()}&rdquo; anyway
                  </button>
                )}
              </div>
            ) : (
              <ul
                ref={listRef}
                id="cc-city-list"
                role="listbox"
                className="max-h-[280px] overflow-y-auto py-1"
              >
                {filtered.map((city, i) => {
                  const isActive = i === cursor;
                  return (
                    <li
                      key={`${city}-${i}`}
                      id={`cc-opt-${i}`}
                      role="option"
                      aria-selected={isActive}
                      data-option-index={i}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-4 py-2 text-[14px] transition-colors",
                        isActive
                          ? "bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[color:var(--color-fg)]"
                          : "text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg)]",
                      )}
                      onMouseEnter={() => setCursor(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        select(city);
                      }}
                    >
                      <MapPin
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive
                            ? "text-[color:var(--color-primary)]"
                            : "text-[color:var(--color-fg-subtle)]",
                        )}
                        strokeWidth={2}
                      />
                      <span className="truncate">{highlightMatch(city, q)}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between gap-2 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/70 px-4 py-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                  ↑↓ navigate · ↵ select · esc close
                </p>
                {!q && filtered.length === MAX_VISIBLE && (
                  <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-fg-subtle)]">
                    Keep typing to narrow
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Renders the matched substring in bold primary color. */
function highlightMatch(city: string, q: string) {
  if (!q) return city;
  const lc = city.toLowerCase();
  const idx = lc.indexOf(q);
  if (idx < 0) return city;
  const before = city.slice(0, idx);
  const hit = city.slice(idx, idx + q.length);
  const after = city.slice(idx + q.length);
  return (
    <>
      {before}
      <span className="font-semibold text-[color:var(--color-primary)]">
        {hit}
      </span>
      {after}
    </>
  );
}
