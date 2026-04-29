/**
 * Mock mental-health resources. Region-aware list — same data shape
 * as packages/shared/constants.ts CRISIS_RESOURCES, just enriched
 * with `freeCall` and `url` fields the UI uses.
 *
 * Per BP §16.MH3: surface region-appropriate resources only. NexGen
 * does not provide clinical mental-health support — we route to
 * established services and our T&S advisor follows up.
 */

import { CRISIS_RESOURCES } from "@nexgen-connect/shared";
import type { CrisisResource } from "../services/types";

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export const mentalHealthMock = {
  async resources(input: { region: "IN" | "IE" | "DE" }): Promise<CrisisResource[]> {
    const list = CRISIS_RESOURCES[input.region] ?? [];
    return delay(120, list.map((r) => ({ ...r, region: input.region, freeCall: true })));
  },
};
