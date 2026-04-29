/**
 * Mock group-apply (PBSA cluster). The full Phase 3 GA1-4 surface
 * runs against this. In prod, this becomes calls into the cluster
 * formation server which routes to verified PBSA partners (Dublin:
 * aparto / Yugo / Fresh; Cork: aparto / Yugo; Galway: Mezzino).
 */

import type {
  GroupApplyCluster,
  GroupApplySubmission,
} from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}
function id(): string {
  return Math.random().toString(36).slice(2, 12);
}

const state: { cluster: GroupApplyCluster | null } = { cluster: null };

export const groupApplyMock = {
  async myCluster(): Promise<GroupApplyCluster | null> {
    return delay(150, state.cluster ? { ...state.cluster } : null);
  },

  async formCluster(): Promise<GroupApplyCluster> {
    state.cluster = {
      id: "ga_" + id(),
      partner: "aparto · Binary Hub",
      city: "Dublin",
      size: 4,
      phase: "forming",
      members: [
        { id: "ga_m1", initials: "AD", firstName: "Aditya" },
        { id: "ga_m2", initials: "PR", firstName: "Priya" },
        { id: "ga_m3", initials: "MH", firstName: "Meera" },
        { id: "ga_y", initials: "YO", firstName: "You" },
      ],
      moveInDate: "2026-08-25",
      lastActivityAt: new Date().toISOString(),
    };
    return delay(600, { ...state.cluster });
  },

  async submit(_input: { clusterId: string }): Promise<GroupApplySubmission> {
    if (!state.cluster) throw new Error("No cluster to submit.");
    state.cluster.phase = "submitted";
    state.cluster.lastActivityAt = new Date().toISOString();

    // Mock auto-flips to accepted after 25s so the demo loop closes
    // without a human reviewer.
    setTimeout(() => {
      if (state.cluster && state.cluster.phase === "submitted") {
        state.cluster.phase = "accepted";
        state.cluster.lastActivityAt = new Date().toISOString();
      }
    }, 25_000);

    return delay(400, {
      clusterId: state.cluster.id,
      submittedAt: new Date().toISOString(),
      respondBy: new Date(Date.now() + 72 * 3_600_000).toISOString(),
      trackingRef: "TR-" + id().toUpperCase(),
    });
  },

  async leaveCluster(_input: { clusterId: string }): Promise<void> {
    state.cluster = null;
    return delay(200, undefined);
  },
};
