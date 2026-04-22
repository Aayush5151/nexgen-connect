"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * TerminalK. A global Cmd+K / Ctrl+K easter egg. Open a tiny terminal,
 * type a command, read a thing. It is not a command palette - every
 * command is a voice-of-brand one-liner that shows up in the scrollback.
 *
 * Built deliberately Unix-faithful: a prompt, a blinking cursor, a
 * scrollable buffer, no fuzzy-search UI, no icons. If you know what
 * Cmd+K is, you will know what to do.
 *
 * Commands:
 *   help             - list commands
 *   about            - who we are, one line
 *   verify           - how verification works
 *   group            - what &ldquo;your group&rdquo; actually means
 *   corridors        - which corridors are live + widening axes
 *   when             - ship date
 *   founder          - founder line
 *   waitlist         - anchor to the waitlist form
 *   clear            - wipe the buffer
 *   exit | quit      - close the terminal
 *
 * Never lingers: ESC closes. The whole component is client-only and
 * lives under a z-index that sits above the sticky navbar.
 */

type Line = { kind: "cmd" | "out" | "err" | "hint"; text: string };

const PROMPT = "nexgen $";

const BOOT_LINES: Line[] = [
  { kind: "out", text: "NexGen Connect · v0.3.0 · staging" },
  { kind: "out", text: "Type `help` to see what you can do." },
];

const HELP = [
  { cmd: "help", desc: "list commands" },
  { cmd: "about", desc: "what this is" },
  { cmd: "verify", desc: "how verification works" },
  { cmd: "group", desc: "what your group means" },
  { cmd: "widen", desc: "how corridors widen if yours is small" },
  { cmd: "pricing", desc: "free vs premium" },
  { cmd: "corridors", desc: "live launch corridors" },
  { cmd: "when", desc: "ship date" },
  { cmd: "founder", desc: "who built this" },
  { cmd: "waitlist", desc: "jump to the waitlist form" },
  { cmd: "clear", desc: "wipe the buffer" },
  { cmd: "exit", desc: "close the terminal" },
];

function runCommand(raw: string): { out: Line[]; effect?: "close" | "clear" | "waitlist" } {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return { out: [] };

  switch (cmd) {
    case "help":
      return {
        out: HELP.map((h) => ({
          kind: "out" as const,
          text: `  ${h.cmd.padEnd(10, " ")} ${h.desc}`,
        })),
      };
    case "about":
      return {
        out: [
          {
            kind: "out",
            text: "NexGen Connect. A pocket-sized group of verified students, all flying to the same country, the same month, as you.",
          },
        ],
      };
    case "verify":
    case "verification":
      return {
        out: [
          { kind: "out", text: "Three checks, under an hour:" },
          { kind: "out", text: "  1. Phone OTP · MSG91, number hashed on arrival" },
          { kind: "out", text: "  2. DigiLocker Aadhaar · signed consent token, no number stored" },
          { kind: "out", text: "  3. Admit letter · reviewed by a real human, not a bot" },
          { kind: "out", text: "Group DMs unlock after 60 verified students exist in your corridor." },
        ],
      };
    case "group":
      return {
        out: [
          {
            kind: "out",
            text: "A group is eight to twelve verified classmates flying to the same country the same month. Not five hundred. Not fifty. A number you can remember.",
          },
        ],
      };
    case "widen":
    case "widening":
    case "corridor":
      return {
        out: [
          { kind: "out", text: "Corridors widen when yours is too small:" },
          { kind: "out", text: "  axis 1 — home city → state → region" },
          { kind: "out", text: "  axis 2 — destination uni → sibling universities" },
          { kind: "out", text: "  axis 3 — intake month → quarter" },
          { kind: "out", text: "  axis 4 — gender preference → flexible" },
          { kind: "out", text: "  axis 5 — religion preference → optional" },
          { kind: "out", text: "We tell you which axis widened, before you join." },
        ],
      };
    case "pricing":
    case "premium":
    case "price":
      return {
        out: [
          { kind: "out", text: "Free — matching, verification, DMs, flight countdown." },
          { kind: "out", text: "Premium (\u20b91,499, one-time) — three pillars:" },
          { kind: "out", text: "  1. Priority match · pool opens 4 months before intake" },
          { kind: "out", text: "  2. Apartment together · shortlist + lease tooling + Alumni Handover Board" },
          { kind: "out", text: "  3. Parent view · itinerary, arrival, priority 24/7 support" },
          { kind: "out", text: "No subscriptions. No surprise charges." },
        ],
      };
    case "corridors":
    case "corridor":
    case "ireland":
    case "germany":
    case "ireland?":
    case "germany?":
      return {
        out: [
          { kind: "out", text: "Two live launch corridors:" },
          { kind: "out", text: "  IE · Sept 2026 · Trinity, UCD, UCC · the densest student lane we could ship first" },
          { kind: "out", text: "  DE · Oct 2026  · TUM, LMU, RWTH Aachen, Humboldt · Winter semester intake" },
          { kind: "out", text: "Next country announced when both of these work." },
        ],
      };
    case "when":
    case "launch":
      return {
        out: [
          { kind: "out", text: "Ireland corridor opens Sept 2026, Germany follows Oct 2026." },
          { kind: "out", text: "Both ship before their first flights take off." },
          { kind: "hint", text: "Join the waitlist for the day-one TestFlight link." },
        ],
      };
    case "founder":
      return {
        out: [
          { kind: "out", text: "Aayush Shah. Built after watching a friend cry on landing." },
          { kind: "hint", text: "More at /founder" },
        ],
      };
    case "waitlist":
    case "signup":
      return {
        out: [{ kind: "hint", text: "Jumping to the waitlist..." }],
        effect: "waitlist",
      };
    case "clear":
    case "cls":
      return { out: [], effect: "clear" };
    case "exit":
    case "quit":
    case "close":
      return { out: [], effect: "close" };
    case "sudo rm -rf /":
      return {
        out: [
          { kind: "err", text: "nice try." },
          { kind: "out", text: "we have backups." },
        ],
      };
    case "whoami":
      return {
        out: [
          { kind: "out", text: "someone about to land in a city full of strangers." },
        ],
      };
    default:
      return {
        out: [
          { kind: "err", text: `command not found: ${raw.trim()}` },
          { kind: "hint", text: "try `help`" },
        ],
      };
  }
}

export function TerminalK() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(BOOT_LINES);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Global Cmd+K / Ctrl+K / ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Autofocus input when opening. Restore scrollback when reopening.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Scroll to bottom on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const submit = useCallback(() => {
    const cmd = input;
    const next: Line[] = [{ kind: "cmd" as const, text: `${PROMPT} ${cmd}` }];
    const result = runCommand(cmd);
    next.push(...result.out);

    if (result.effect === "close") {
      setOpen(false);
      setInput("");
      return;
    }
    if (result.effect === "clear") {
      setLines([]);
      setInput("");
      return;
    }
    if (result.effect === "waitlist") {
      setOpen(false);
      setInput("");
      // Allow the UI to unmount before scrolling so focus handoff is clean
      window.setTimeout(() => {
        document
          .getElementById("download")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }

    setLines((prev) => [...prev, ...next]);
    if (cmd.trim()) {
      setHistory((h) => [...h, cmd]);
      setHistoryIdx(-1);
    }
    setInput("");
  }, [input]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx =
        historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] ?? "");
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command terminal"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[720px] overflow-hidden rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] font-mono shadow-2xl"
            style={{
              boxShadow:
                "0 24px 72px -12px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in srgb, var(--color-primary) 24%, transparent)",
            }}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">
                nexgen — zsh — 80×24
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close terminal"
                className="text-[color:var(--color-fg-subtle)] transition-colors hover:text-[color:var(--color-fg)]"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            {/* Scrollback */}
            <div
              ref={scrollRef}
              className="max-h-[52vh] min-h-[280px] overflow-y-auto px-4 py-4 text-[13px] leading-[1.5]"
            >
              {lines.map((ln, i) => (
                <p
                  key={i}
                  className={
                    ln.kind === "cmd"
                      ? "text-[color:var(--color-fg)]"
                      : ln.kind === "err"
                        ? "text-[#ff7a7a]"
                        : ln.kind === "hint"
                          ? "text-[color:var(--color-primary)]"
                          : "text-[color:var(--color-fg-muted)]"
                  }
                >
                  {ln.text || "\u00A0"}
                </p>
              ))}

              {/* Prompt */}
              <div className="mt-1 flex items-center gap-2 text-[color:var(--color-fg)]">
                <span className="text-[color:var(--color-primary)]">{PROMPT}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onInputKey}
                  aria-label="Terminal input"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-[13px] text-[color:var(--color-fg)] caret-[color:var(--color-primary)] placeholder:text-[color:var(--color-fg-subtle)] focus:outline-none"
                  placeholder="try `help`"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-1.5 text-[color:var(--color-fg-subtle)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em]">
                ⌘K · close with ESC
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em]">
                ↑ ↓ history
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
