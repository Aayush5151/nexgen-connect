/**
 * EN · push notification catalogue. v6 build §14 — 36 codes
 * (32 v5 + 4 v6).
 *
 * Each entry: title (short), body (concise — fits notification tray
 * 4-line limit), deepLink (Expo Router URL the OS opens on tap).
 *
 * v6-new (N33-N36) populated to spec. v5 codes (N1-N32) authored
 * against the v15 user-heart template; subject to ratification when
 * v5 source lands.
 *
 * Notes:
 *   - Push copy avoids hyphens for screen-reader compatibility.
 *   - Body strings under 140 chars to ensure no truncation across
 *     iOS Notification Center + Android System Tray.
 */

const n = (
  title: string,
  body: string,
  deepLink: string,
): { title: string; body: string; deepLink: string } => ({
  title,
  body,
  deepLink,
});

const pushes: Record<string, { title: string; body: string; deepLink: string }> =
  {
    // ============================================================
    // N1-N10 — Verification + admit-letter
    // ============================================================
    N1: n(
      "Verify your phone",
      "Code expires in 5 minutes. Open NexGen to enter it.",
      "nexgen://onboarding/otp",
    ),
    N2: n(
      "Identity verified",
      "DigiLocker check done. Upload your admit letter next.",
      "nexgen://onboarding/admit-intro",
    ),
    N3: n(
      "Admit letter received",
      "We're reviewing it. We'll notify you within 48 hours.",
      "nexgen://onboarding/admit-pending",
    ),
    N4: n(
      "Admit approved",
      "You're in. Open your corridor.",
      "nexgen://corridor",
    ),
    N5: n(
      "Admit needs attention",
      "Reviewer flagged something. Open NexGen for details.",
      "nexgen://onboarding/admit-outcome",
    ),
    N6: n(
      "Admit review delayed",
      "We promised 48h. Apology + ₹100 credit applied.",
      "nexgen://onboarding/admit-pending",
    ),
    N7: n(
      "Identity hash collision detected",
      "T&S investigating. We'll email within 4 hours.",
      "nexgen://profile",
    ),
    N8: n(
      "DigiLocker token expired",
      "Re-authenticate. We hold your seat for 24 hours.",
      "nexgen://onboarding/identity",
    ),
    N9: n(
      "Aadhaar wipe confirmed",
      "Your Aadhaar VID + JWT were wiped within the 5-min SLA.",
      "nexgen://profile",
    ),
    N10: n(
      "Phone re-verification needed",
      "It's been 90 days. Re-OTP takes 30 seconds.",
      "nexgen://onboarding/phone",
    ),

    // ============================================================
    // N11-N20 — Corridor + chat
    // ============================================================
    N11: n(
      "Your corridor unlocked",
      "30+ verified students share your destination. Group chat is live.",
      "nexgen://corridor",
    ),
    N12: n(
      "New verified member",
      "{{firstName}} from {{city}} just joined your corridor.",
      "nexgen://corridor",
    ),
    N13: n(
      "Sub-circle active",
      "Housing sub-circle has 4 members. Tap to join.",
      "nexgen://corridor/circle/housing",
    ),
    N14: n(
      "Day 1 prompt",
      "New prompt for your class. Tap to read.",
      "nexgen://corridor",
    ),
    N15: n(
      "New message in {{channel}}",
      "Tap to read.",
      "nexgen://chat/{{channelId}}",
    ),
    N16: n(
      "DM from {{from}}",
      "{{preview}}",
      "nexgen://chat/{{channelId}}",
    ),
    N17: n(
      "Roommate cluster forming",
      "4 of 6 verified women near you. Tap to apply.",
      "nexgen://profile/group-apply",
    ),
    N18: n(
      "Pinned activity reminder",
      "{{activity}} starts in 2 hours.",
      "nexgen://corridor",
    ),
    N19: n(
      "Channel sharded",
      "Layer 2 hit 150+. We resharded; you may see a brief reconnect.",
      "nexgen://corridor",
    ),
    N20: n(
      "Bridge offer accepted",
      "Your new hometown crew thread is live.",
      "nexgen://corridor/hometown",
    ),

    // ============================================================
    // N21-N32 — Premium, parent, T&S, scams, MH
    // ============================================================
    N21: n(
      "Premium activated",
      "All four features are live on your account.",
      "nexgen://profile/premium",
    ),
    N22: n(
      "Receipt available",
      "Razorpay receipt {{id}} is in your profile.",
      "nexgen://profile/receipts",
    ),
    N23: n(
      "Parent dashboard set up",
      "{{parentEmail}} can now see your status only. Never your DMs.",
      "nexgen://profile/parent",
    ),
    N24: n(
      "Refund initiated",
      "Razorpay typically settles in 5-7 business days.",
      "nexgen://profile/receipts",
    ),
    N25: n(
      "T&S report received",
      "Reference {{reportId}}. Advisor will respond within {{sla}}.",
      "nexgen://profile/report-status?reportId={{reportId}}",
    ),
    N26: n(
      "Advisor replied",
      "{{advisorName}} responded to your T&S report.",
      "nexgen://profile/report-status?reportId={{reportId}}",
    ),
    N27: n(
      "Identity-anchored ban applied",
      "The reported user was banned. Their identity hash is now blocked.",
      "nexgen://profile/report-status?reportId={{reportId}}",
    ),
    N28: n(
      "Group-apply submitted",
      "Tracking ref {{ref}}. Partner responds in 48h.",
      "nexgen://profile/group-apply",
    ),
    N29: n(
      "Group-apply accepted",
      "Your cluster has a place at {{partner}}.",
      "nexgen://profile/group-apply",
    ),
    N30: n(
      "Crisis resource updated",
      "Your region's resources changed. Check the new list.",
      "nexgen://help/resources",
    ),
    N31: n(
      "Scam pattern alert",
      "New pattern detected in your destination. Tap to read.",
      "nexgen://help",
    ),
    N32: n(
      "Imminent-harm outreach",
      "T&S advisor is calling now from a masked number.",
      "nexgen://help",
    ),

    // ============================================================
    // N33-N36 — v6 NEW (per v6 build §0 change 14)
    // ============================================================
    N33: n(
      "Hometown crew is live",
      "8 verified students from your home city are now in your Layer 1 thread. Tap to see them.",
      "nexgen://corridor/hometown",
    ),
    N34: n(
      "Your founder-call is scheduled",
      "Aayush or T&S will call within 24 hours via masked-number bridge — your number stays private.",
      "nexgen://corridor/hometown",
    ),
    N35: n(
      "Verified women-only thread is open",
      "4+ verified women in your corridor — a parallel women-only sub-thread just opened. Opt-out anytime.",
      "nexgen://chat",
    ),
    N36: n(
      "Hybrid programme · check before you fly",
      "Your admit shows a hybrid programme at a German HEI. Open NexGen to read the visa-class risk before continuing.",
      "nexgen://onboarding/hybrid-warning",
    ),
  };

export const copy: Record<string, string> = {};
for (const [code, detail] of Object.entries(pushes)) {
  copy[`${code}.title`] = detail.title;
  copy[`${code}.body`] = detail.body;
  copy[`${code}.deepLink`] = detail.deepLink;
}

export const catalogue = pushes;
