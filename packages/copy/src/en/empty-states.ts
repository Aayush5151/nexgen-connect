/**
 * EN · empty-state catalogue. v6 build §9 — 10 EMP-* entries.
 *
 * Each empty state is a v15 user-heart moment: don't shame the user
 * for the gap, name the path forward.
 */

const emp = (
  heading: string,
  body: string,
  cta?: string,
): { heading: string; body: string; cta?: string } => ({
  heading,
  body,
  cta,
});

const states: Record<string, { heading: string; body: string; cta?: string }> = {
  // EMP-CH1 — corridor home, Layer 2 still forming
  "EMP-CH1": emp(
    "Your class is forming.",
    "12 of 30 verified. Sub-circles are already live below — most groups warm up there first.",
  ),
  "EMP-CH1-niche": emp(
    "Your corridor is rare.",
    "We don't have a critical mass for {{home}} → {{destination}} yet. Here's the bridge offer to the next-closest city — free, no churn.",
    "See the bridge",
  ),

  // EMP-CT1 — chat list, no channels
  "EMP-CT1": emp(
    "No threads yet.",
    "Your group chat goes live the moment Layer 2 hits 30 verified.",
  ),

  // EMP-CT2 — empty channel, no messages
  "EMP-CT2": emp(
    "It's normal to read for the first day.",
    "You don't have to introduce yourself. The intro circles fill from people who chose to join. The room isn't going anywhere.",
  ),

  // EMP-G2 — corridor members list with 0 verified
  "EMP-G2": emp(
    "First in line.",
    "You're the first verified member. We've queued a founder call — see the hometown thread.",
    "Open hometown thread",
  ),

  // EMP-G3 — sub-circle with 0 members
  "EMP-G3": emp(
    "{{topic}} is quiet.",
    "Sub-circles fill from active conversations. Tap any pinned activity card on CH1 to start one.",
  ),

  // EMP-PV2 — parent dashboard before any verifications
  "EMP-PV2": emp(
    "Status will populate as your child verifies.",
    "Phone, identity, admit letter. The dashboard updates within seconds of each check completing.",
  ),

  // EMP-PR4 — receipts, no purchases yet
  "EMP-PR4": emp(
    "No receipts yet.",
    "Receipts appear after your first Premium unlock.",
    "See Premium",
  ),

  // EMP-TS3 — advisor dialogue, advisor hasn't replied
  "EMP-TS3": emp(
    "Advisor is on it.",
    "{{advisorName}} typically replies within {{sla}}. We'll buzz you the moment they do.",
  ),

  // EMP-Y6 — arrival check-in, day 0 not started
  "EMP-Y6": emp(
    "Window opens on arrival day.",
    "The Y6 check-in starts the moment your flight lands and stays open through Day 7.",
  ),
};

export const copy: Record<string, string> = {};
for (const [id, detail] of Object.entries(states)) {
  copy[`${id}.heading`] = detail.heading;
  copy[`${id}.body`] = detail.body;
  if (detail.cta) copy[`${id}.cta`] = detail.cta;
}

export const catalogue = states;
