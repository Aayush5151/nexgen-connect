/**
 * Mock corridor + sub-circle data — v6 layer-inverted (v15 BP §3.2).
 *
 * Default state: Layer 2 (Dublin × Sept 2026) at 95 verified, already
 * unlocked 7 days ago. Most users see this as their primary corridor
 * surface — the v14 "5 of 60 alone" cold-start mode is gone, replaced
 * by Layer 2 dest×intake which scales much faster than home×dest×intake.
 *
 * memberCountL1 = 5 represents the Pune × UCD × Sept 2026 Layer 1
 * affinity sub-group nested under this Layer 2 (not yet at the 8-floor,
 * so the hometown-crew thread is still pre-unlock — CH6 will surface
 * "5 of 8" on the pinned card).
 *
 * Dev-only `_unlock()` flips to a "just-barely-unlocked" Layer 2
 * (verifiedCount = threshold = 30) for QA on the unlock-celebration
 * UI. `_relock()` flips to a pre-unlock Layer 2 (verifiedCount = 18)
 * for QA on the locked surface.
 */

import { CORRIDOR_LAYER_2_UNLOCK } from "@nexgen-connect/shared";
import type { Corridor, CorridorMember, SubCircle } from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

/* ------------------------------------------------------------------ */
/* In-memory state.                                                    */
/* ------------------------------------------------------------------ */

const state = {
  corridor: {
    layer: 2,
    id: "corr_l2_dublin_sep26",
    // v5 transitional convenience — surfaced on CH1's "Pune → Dublin"
    // header. P1 cleanup will read from session.profile.homeCity.
    homeCity: "Pune",
    destination: "Dublin",
    destinationCountry: "Ireland",
    intakeMonth: "September 2026",
    verifiedCount: 95,
    unlockThreshold: CORRIDOR_LAYER_2_UNLOCK,
    unlocked: true,
    // 7 days ago — the "live for 3 days" badge has expired in the
    // default mock; QA scenarios that exercise the freshly-unlocked
    // celebration surface should call _unlock() to reset the timestamp.
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    // Pune × UCD × Sept 2026 Layer 1 sub-group rollup. 5 < 8 so the
    // hometown crew is pre-unlock (CH6 will surface "5 of 8 verified").
    memberCountL1: 5,
    // ≥4 verified women in this Layer 2 → women-only sub-thread is
    // auto-spawned (v15 BP §3.7b). Surfaces in chat list as a
    // separate channel tagged "verified women only".
    womenOnlySubThreadActive: true,
  } as Corridor,

  members: makeMembers(),
  subCircles: [
    {
      id: "sc_housing",
      topic: "housing",
      count: 9,
      lastActivityAt: minutesAgo(4),
      joined: false,
    },
    {
      id: "sc_airport",
      topic: "airport",
      count: 5,
      lastActivityAt: minutesAgo(11),
      joined: false,
    },
    {
      id: "sc_food",
      topic: "food",
      count: 7,
      lastActivityAt: minutesAgo(28),
      joined: false,
    },
    {
      id: "sc_roommates",
      topic: "roommates",
      count: 6,
      lastActivityAt: minutesAgo(2),
      joined: true,
    },
  ] as SubCircle[],
};

/* ------------------------------------------------------------------ */
/* Helpers.                                                            */
/* ------------------------------------------------------------------ */

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

function makeMembers(): CorridorMember[] {
  const seed: Array<[string, string, string]> = [
    ["AD", "Aditya", "UCD"],
    ["PR", "Priya", "Trinity"],
    ["KR", "Karan", "DCU"],
    ["MH", "Meera", "UCD"],
    ["RV", "Riya", "TU Dublin"],
    ["SA", "Sahil", "Maynooth"],
    ["NK", "Nikhil", "Trinity"],
    ["IS", "Isha", "DCU"],
    ["AR", "Arjun", "UCD"],
    ["AN", "Ananya", "Trinity"],
    ["VK", "Vikram", "UCD"],
    ["TS", "Tanvi", "Maynooth"],
  ];
  return seed.map(([initials, name, uni], i) => ({
    id: `m_${i}`,
    initials,
    name,
    homeCity: "Pune",
    uni,
    verifiedAt: minutesAgo(i * 17),
    isYou: i === 11,
  }));
}

/* ------------------------------------------------------------------ */
/* Service.                                                            */
/* ------------------------------------------------------------------ */

export const corridorMock = {
  async me(): Promise<Corridor> {
    return delay(200, { ...state.corridor });
  },

  async members(): Promise<CorridorMember[]> {
    return delay(300, [...state.members]);
  },

  async subCircles(): Promise<SubCircle[]> {
    return delay(200, [...state.subCircles]);
  },

  async toggleSubCircle({ subCircleId }: { subCircleId: string }): Promise<SubCircle> {
    const sc = state.subCircles.find((s) => s.id === subCircleId);
    if (!sc) throw new Error("Sub-circle not found");
    sc.joined = !sc.joined;
    sc.count = sc.joined ? sc.count + 1 : Math.max(0, sc.count - 1);
    return delay(150, { ...sc });
  },

  /** Dev-only helpers for switching corridor state at runtime.
   *
   *  _unlock(): flips to a "just-barely-unlocked" Layer 2 (verifiedCount
   *  = unlockThreshold = 30) so the unlock-celebration UI lands on a
   *  fresh state. _relock(): flips to a pre-unlock Layer 2 (verifiedCount
   *  = 18) for QA on the locked surface. v15 BP §3.3. */
  _unlock(): void {
    state.corridor.verifiedCount = CORRIDOR_LAYER_2_UNLOCK;
    state.corridor.unlocked = true;
    state.corridor.unlockedAt = new Date().toISOString();
  },
  _relock(): void {
    state.corridor.verifiedCount = 18;
    state.corridor.unlocked = false;
    state.corridor.unlockedAt = null;
  },
};
