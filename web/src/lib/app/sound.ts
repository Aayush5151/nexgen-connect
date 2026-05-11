/**
 * Sound system — synthesised audio cues for the product.
 *
 * Trillion-dollar discipline:
 *   - Default to OFF. Sound is opt-in. The toggle lives in
 *     /app/profile/settings.
 *   - One sound, one moment. We have exactly one cue (a short
 *     "join" chime) that fires once on corridor first-visit. If we
 *     want a second sound, add it here AND document why.
 *   - No audio files. Sounds are synthesised at runtime via the
 *     WebAudio API — no asset payload, no CDN latency, no licensing.
 *   - Respect prefers-reduced-motion + the user preference. If either
 *     says no, we render silence.
 *
 * Preference storage:
 *   localStorage key: `nx_sound_enabled`
 *   value: "true" | "false" (default "false" / off)
 *
 * The WebAudio API is unavailable on the server. Every entry point
 * here is guarded against that — calling play() server-side is a no-op.
 *
 * v18 trillion-dollar polish.
 */

const STORAGE_KEY = "nx_sound_enabled";

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    // Notify listeners on the same page (storage events only fire
    // cross-tab). The settings toggle dispatches this so anything
    // observing the preference can re-read it.
    window.dispatchEvent(new CustomEvent("nx-sound-preference-changed"));
  } catch {
    // localStorage unavailable (private mode, quota) — fail closed.
  }
}

/**
 * Cue catalog. ADD A NEW ENTRY HERE before calling play() with a
 * new key. Keeps the surface area honest — a future contributor
 * has to think about *what* sound and *why* before adding noise.
 *
 * Each cue is a sequence of notes (frequency in Hz + duration in ms).
 * Tones are short (≤120ms) and use soft attack/release envelopes so
 * they read as "Apple", not "AOL Instant Messenger".
 */
type Note = { freq: number; durMs: number };

const CUES: Record<string, { notes: Note[]; gain: number }> = {
  // "join" — fires on corridor first-visit (welcome celebration).
  // Two-note ascending fifth, soft, ~280ms total. Reads as
  // "you arrived" not "you levelled up".
  join: {
    notes: [
      { freq: 880, durMs: 120 },  // A5
      { freq: 1318.5, durMs: 160 }, // E6 — perfect fifth up
    ],
    gain: 0.16,
  },
};

export type SoundCueKey = keyof typeof CUES;

/**
 * Play a cue. Respects the user preference + reduced-motion + tab
 * visibility (don't fire when the tab is backgrounded — the user
 * isn't here).
 *
 * Server-side: returns immediately, no-op.
 */
export function playSound(cue: SoundCueKey): void {
  if (typeof window === "undefined") return;
  if (!getSoundEnabled()) return;
  if (document.hidden) return;

  // Respect reduced-motion as a proxy for "I don't want extra
  // sensory output". The official media query is for motion, but
  // it's the closest signal a browser exposes and people who set
  // it almost always want a quieter app overall.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cueSpec = CUES[cue];
  if (!cueSpec) return;

  try {
    // AudioContext must be created lazily — Chrome and Safari block
    // construction before a user gesture, but corridor-welcome fires
    // after the user has clicked through signup so we're inside an
    // activation. If construction fails, fail silent.
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = new AudioCtor();
    // Tiny global tail so the last note's release doesn't get cut
    // off if we close the context too eagerly.
    let cursor = ctx.currentTime;

    for (const note of cueSpec.notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave — the only oscillator type that reads as
      // "intentional" rather than "synth pad" at short durations.
      osc.type = "sine";
      osc.frequency.value = note.freq;

      // Envelope: 8ms attack, hold, 60ms release. Soft on both
      // ends so the tone doesn't click.
      const dur = note.durMs / 1000;
      gain.gain.setValueAtTime(0, cursor);
      gain.gain.linearRampToValueAtTime(cueSpec.gain, cursor + 0.008);
      gain.gain.setValueAtTime(cueSpec.gain, cursor + dur - 0.06);
      gain.gain.linearRampToValueAtTime(0, cursor + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(cursor);
      osc.stop(cursor + dur);

      cursor += dur * 0.7; // overlap successive notes slightly
    }

    // Close the context after the tail finishes so we don't leak
    // audio nodes.
    window.setTimeout(
      () => {
        void ctx.close().catch(() => {});
      },
      Math.ceil((cursor - ctx.currentTime) * 1000) + 200,
    );
  } catch {
    // WebAudio threw — likely an autoplay restriction on a non-
    // gesture path. Silent failure is the right answer here.
  }
}
