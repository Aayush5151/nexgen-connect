/**
 * Mock corridor + sub-circle data. Drives the Phase 2 UI so the
 * funnel post-admit-approval is fully clickable without a backend.
 *
 * Default state: corridor at 47/60 verified (locked). A __DEV__ dev
 * surface (gear menu in profile, future) flips to 60+ to show the
 * unlocked variant. For now, callers can use unlock() / relock() at
 * runtime to toggle.
 */

import { CORRIDOR_UNLOCK_THRESHOLD } from "@nexgen-connect/shared";
import type { Corridor, CorridorMember, SubCircle } from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

/* ------------------------------------------------------------------ */
/* In-memory state.                                                    */
/* ------------------------------------------------------------------ */

const state = {
  corridor: {
    id: "corr_pune_dublin_sep26",
    homeCity: "Pune",
    destination: "Dublin",
    destinationCountry: "Ireland",
    intakeMonth: "September 2026",
    verifiedCount: 47,
    unlockThreshold: CORRIDOR_UNLOCK_THRESHOLD,
    unlocked: false,
    unlockedAt: null,
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

  /** Dev-only helpers for switching corridor state at runtime. */
  _unlock(): void {
    state.corridor.verifiedCount = 60;
    state.corridor.unlocked = true;
    state.corridor.unlockedAt = new Date().toISOString();
  },
  _relock(): void {
    state.corridor.verifiedCount = 47;
    state.corridor.unlocked = false;
    state.corridor.unlockedAt = null;
  },
};
