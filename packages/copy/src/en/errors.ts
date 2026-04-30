/**
 * EN · error catalogue. v6 build §8 — 65 codes (62 v5 + 3 v6).
 *
 * Each entry: title (short), body (what happened), recovery (what we'll
 * do next, with a specific time commitment per the L17 honest-naming
 * brand promise — never "please try again").
 *
 * v6-new entries (E063-E065) are fully populated to spec.
 *
 * v5 entries (E001-E062) are populated with v15 user-heart language.
 * The original v5 build plan source enumerating these is not present
 * in this repo; copy below was authored against the v15 honesty
 * template and is subject to ratification when the v5 source lands.
 * Each entry is marked with the relevant v5 plan section per the
 * v6 build plan's references.
 *
 * Convention for keys: E### gets `.title`, `.body`, `.recovery`.
 */

const e = (
  title: string,
  body: string,
  recovery: string,
): { title: string; body: string; recovery: string } => ({
  title,
  body,
  recovery,
});

const errors: Record<string, { title: string; body: string; recovery: string }> = {
  // ================================================================
  // E001-E010 — Auth & OTP (v5 §4.1)
  // ================================================================
  E001: e(
    "Couldn't send the code",
    "We tried MSG91 and the request failed.",
    "We're auto-retrying once. If it still doesn't go through in 30 seconds, we route to Twilio international as a fallback.",
  ),
  E002: e(
    "Wrong code",
    "That OTP didn't match what we issued.",
    "Try again — you have 4 more attempts before the session locks for 5 minutes.",
  ),
  E003: e(
    "OTP session expired",
    "It's been more than 5 minutes since we sent the code.",
    "Tap Resend and we'll issue a new one. The old one is dead.",
  ),
  E004: e(
    "Phone number invalid",
    "The number you entered isn't a valid 10-digit Indian mobile.",
    "Re-enter it without the +91 prefix — we add that automatically.",
  ),
  E005: e(
    "Too many OTP requests",
    "5 OTPs in 10 minutes triggers a rate-limit.",
    "Wait 15 minutes and try again. If you're not the one requesting, your number may be under attack — contact support.",
  ),
  E006: e(
    "Phone already verified",
    "This number is bound to another account.",
    "Sign in to that account, or contact support if you suspect identity theft.",
  ),
  E007: e(
    "Network unreachable",
    "Your device couldn't reach our servers.",
    "Check your connection. We auto-retry every 10 seconds for the next 2 minutes.",
  ),
  E008: e(
    "Session token expired",
    "Your sign-in session timed out (90 days).",
    "Sign in again with the same phone — your verification facts stay; you'll just re-OTP.",
  ),
  E009: e(
    "Server unavailable",
    "Our backend is temporarily down.",
    "We'll auto-retry. Status at status.nexgenconnect.com — usually under 5 minutes.",
  ),
  E010: e(
    "Twilio fallback failed",
    "Both MSG91 and Twilio are down.",
    "Major outage. T&S advisor will reach you on email within 30 minutes if you've shared one.",
  ),

  // ================================================================
  // E011-E020 — Identity verification (v5 §4.2)
  // ================================================================
  E011: e(
    "DigiLocker handshake timed out",
    "The OAuth callback didn't return in 5 minutes.",
    "Tap Try again — DigiLocker occasionally takes longer at peak hours.",
  ),
  E012: e(
    "DigiLocker revoked",
    "Your DigiLocker access token was revoked between handshake and validation.",
    "Re-authenticate. We hold your seat for 24 hours.",
  ),
  E013: e(
    "Aadhaar VID expired",
    "VIDs are valid for 24 hours; this one isn't.",
    "Generate a fresh VID at uidai.gov.in (30 sec) and try again.",
  ),
  E014: e(
    "Identity hash collision",
    "An identity already exists on the platform with the same composite hash.",
    "If this is you, sign in to that account. If not, T&S investigates within 4 hours — high-priority.",
  ),
  E015: e(
    "DigiLocker mobile mismatch",
    "Aadhaar shows a different phone than the one you signed up with.",
    "Update Aadhaar mobile at uidai.gov.in (15 min) or sign up with the Aadhaar-linked phone.",
  ),
  E016: e(
    "DigiLocker name format error",
    "Aadhaar name has a non-printable character we can't store.",
    "T&S manually escalates within 4 hours. We'll resolve by email.",
  ),
  E017: e(
    "Aadhaar deactivated",
    "Your Aadhaar account is currently deactivated.",
    "Reactivate at digilocker.gov.in. We hold your seat for 24 hours.",
  ),
  E018: e(
    "Identity verification timeout",
    "The full identity flow took more than 30 minutes.",
    "Restart from /onboarding/identity. Verification facts you completed earlier are saved.",
  ),
  E019: e(
    "DigiLocker JWT signature invalid",
    "The token DigiLocker returned didn't verify against UIDAI's public key.",
    "Likely a man-in-the-middle. We refused and logged. Try again on a trusted network.",
  ),
  E020: e(
    "Identity wipe SLA breach",
    "We failed to wipe Aadhaar VID + JWT within the 5-minute SLA.",
    "T&S forensic post-mortem within 30 days per L17. Status emailed to you within 1 hour.",
  ),

  // ================================================================
  // E021-E030 — Admit-letter review (v5 §4.3)
  // ================================================================
  E021: e(
    "Admit-letter file too large",
    "Max 12 MB; your file exceeds it.",
    "Compress to PDF (most phones have this in Files → Compress) and re-upload.",
  ),
  E022: e(
    "Admit-letter mime type rejected",
    "We accept PDF, JPG, and PNG only.",
    "Convert to one of those and re-upload.",
  ),
  E023: e(
    "Admit-letter review SLA breach",
    "48 hours passed; reviewer hasn't signed off.",
    "Auto-fast-path triggered. Apology email + ₹100 credit per BP §16.S5.",
  ),
  E024: e(
    "Admit-letter rejected",
    "Reviewer found an issue with the letter.",
    "Reason in the rejection card. You can re-upload — admit checks have no attempt limit.",
  ),
  E025: e(
    "Admit-letter PDF retention breach",
    "We failed to delete the PDF 60 minutes after review.",
    "T&S forensic post-mortem within 30 days. Manual deletion attempted now; status emailed.",
  ),
  E026: e(
    "Admit-letter URL signing failed",
    "Couldn't sign the upload URL with our storage provider.",
    "Auto-retry once. If still failing, try a different network.",
  ),
  E027: e(
    "Admit-letter HEI not on the allowlist",
    "We don't yet review admits to this institution.",
    "Email hello@nexgenconnect.com — we add HEIs within 5 working days.",
  ),
  E028: e(
    "Admit-letter intake mismatch",
    "Letter shows a different intake than your corridor choice.",
    "Update your corridor choice at /onboarding/corridor. Verification stays.",
  ),
  E029: e(
    "Admit-letter date out of window",
    "Letter dated more than 12 months in the past.",
    "Old letters often have programme structure changes. T&S manually checks within 4 hours.",
  ),
  E030: e(
    "Admit-letter forensic flag",
    "Reviewer flagged the letter as potentially manipulated.",
    "T&S investigation — 4-hour SLA. Your seat stays held. We err on the side of trust.",
  ),

  // ================================================================
  // E031-E045 — Corridor + chat (v5 §3.2 etc., v6 §3.2 layered)
  // ================================================================
  E031: e(
    "Corridor placement failed",
    "We couldn't place you in a Layer 2 corridor.",
    "Auto-retry. If still failing, T&S notifies you within 1 hour.",
  ),
  E032: e(
    "Corridor unlock event delayed",
    "Layer 2 unlock fanout took longer than the 100ms p95 budget.",
    "Telemetry-only; your unlock still works. Engineering investigates.",
  ),
  E033: e(
    "Sub-circle join cap reached",
    "Sub-circles auto-form to 6 max.",
    "Try a different sub-circle, or wait — sub-circles refresh nightly.",
  ),
  E034: e(
    "Channel pool sharded",
    "Layer 2 reached the 150-subscriber sharding threshold mid-session.",
    "We auto-resubscribe you to your shard. No action needed.",
  ),
  E035: e(
    "Realtime connection lost",
    "WebSocket dropped.",
    "We auto-reconnect every 5 seconds. Messages queued offline.",
  ),
  E036: e(
    "Message send failed",
    "Couldn't reach the realtime channel.",
    "Message stays in your compose dock; we retry on reconnect.",
  ),
  E037: e(
    "Channel access revoked",
    "You were removed from this channel (likely T&S action).",
    "Check the T&S thread under Profile → Reports.",
  ),
  E038: e(
    "Bridge offer rejected",
    "The next-closest hometown crew didn't accept your bridge.",
    "T&S manually finds you a fit within 24 hours.",
  ),
  E039: e(
    "Cohort closed",
    "This intake's corridor closed before unlock.",
    "Refund + repool to the next intake at zero cost.",
  ),
  E040: e(
    "Avatar upload failed",
    "Couldn't reach Cloudflare Images.",
    "Auto-retry. If still failing, your initials show until next sign-in.",
  ),
  E041: e(
    "Day-1 prompt fetch failed",
    "Daily prompt service is unreachable.",
    "Cached yesterday's. Refresh tomorrow.",
  ),
  E042: e(
    "Activity feed timeout",
    "Couldn't fetch the activity feed.",
    "Auto-retry on next focus.",
  ),
  E043: e(
    "Members list pagination broken",
    "We can't load older members.",
    "Pull-to-refresh resets. Engineering investigates.",
  ),
  E044: e(
    "Pinned activity RSVP conflict",
    "Activity capacity reached while you were tapping.",
    "We added you to the wait-list. RSVP if someone drops.",
  ),
  E045: e(
    "Sub-circle topic disabled",
    "This topic was disabled (e.g., legal review).",
    "Try Studies or Roommates — those stay open year-round.",
  ),

  // ================================================================
  // E046-E055 — Premium, parent, group-apply, refund (v5 §5)
  // ================================================================
  E046: e(
    "Razorpay checkout cancelled",
    "You closed the payment sheet before completion.",
    "Tap Unlock again to reopen.",
  ),
  E047: e(
    "Razorpay payment failed",
    "Bank declined the payment.",
    "Try a different card or UPI app. Razorpay shows the bank's reason.",
  ),
  E048: e(
    "Premium activation lag",
    "Payment succeeded but Premium hasn't activated yet.",
    "Auto-retry every 10s for 2 minutes. If still inactive, T&S resolves within 30 minutes — your charge is safe.",
  ),
  E049: e(
    "Refund processing delayed",
    "Razorpay refund queue is backed up.",
    "Refunds settle in 5-7 business days normally; we'll email you the moment Razorpay confirms.",
  ),
  E050: e(
    "Parent passcode mismatch",
    "Wrong passcode entered 3 times.",
    "Lockout for 15 minutes per BP §9 L4. Reset from /profile/parent.",
  ),
  E051: e(
    "Parent dashboard fetch failed",
    "Read-only dashboard couldn't load.",
    "Auto-retry. Network or server issue.",
  ),
  E052: e(
    "Group-apply cluster full",
    "Cluster reached the 6-person max while you were tapping.",
    "We auto-form a parallel cluster within 1 hour.",
  ),
  E053: e(
    "Group-apply PBSA partner offline",
    "PBSA partner's API is unreachable.",
    "We hold the application; partner usually responds within 24 hours.",
  ),
  E054: e(
    "Group-apply identity reconfirm failed",
    "One member's Aadhaar+admit reconfirmation didn't pass.",
    "T&S manually reaches the affected member within 4 hours; cluster paused meanwhile.",
  ),
  E055: e(
    "Advisor-call scheduling failed",
    "Twilio Voice queue rejected the schedule.",
    "T&S manually reaches you within 4 hours per BP §16 M-series.",
  ),

  // ================================================================
  // E056-E062 — T&S, scams, mental-health (v5 §9, §16)
  // ================================================================
  E056: e(
    "Report submission failed",
    "We couldn't reach the T&S queue.",
    "Auto-retry. If still failing, email hello@nexgenconnect.com — we monitor 24/7.",
  ),
  E057: e(
    "T&S advisor unavailable",
    "All advisors are mid-call.",
    "Your report is queued. SLA: 4h business / 12h overnight / 1h Premium / 30min imminent harm.",
  ),
  E058: e(
    "Crisis-resource fetch failed",
    "Region-specific crisis resources couldn't load.",
    "We show the cached IN/IE/DE list. iCall: +91 9152987821 always available.",
  ),
  E059: e(
    "Scam pattern lookup failed",
    "We couldn't fetch the 5 patterns.",
    "Cached version shows. Engineering refreshes nightly.",
  ),
  E060: e(
    "Imminent-harm SLA breach",
    "We failed the 30-minute outreach SLA.",
    "Forensic post-mortem within 30 days per L17. T&S head is paged immediately.",
  ),
  E061: e(
    "Identity ban check timed out",
    "Couldn't verify whether the reported user is on the ban list.",
    "T&S advisor manually checks within 4 hours.",
  ),
  E062: e(
    "Audit log write failed",
    "An audit log entry didn't persist.",
    "T&S retries. If still failing, this is a security incident — escalates to founder within 30 min.",
  ),

  // ================================================================
  // E063-E065 — v6 NEW (per v6 build §0 change 15)
  // ================================================================
  E063: e(
    "Corridor placement glitch",
    "We hit a snag matching your layer state to your corridor. Nothing was lost.",
    "We're re-syncing in the background. If this screen doesn't refresh in 30 seconds, pull down to retry.",
  ),
  E064: e(
    "Call scheduling didn't go through",
    "Your founder-call confirmation reached us, but our outbound queue rejected it.",
    "Don't worry — we logged it manually. Aayush or T&S will reach you within 4 hours.",
  ),
  E065: e(
    "Refund couldn't auto-process",
    "Your withdraw decision was recorded, but the automatic refund failed.",
    "A T&S advisor will reach you within 1 hour with a manual refund. No payment was double-charged.",
  ),
};

// Flatten into single-key dot-paths matching the namespace pattern.
export const copy: Record<string, string> = {};
for (const [code, detail] of Object.entries(errors)) {
  copy[`${code}.title`] = detail.title;
  copy[`${code}.body`] = detail.body;
  copy[`${code}.recovery`] = detail.recovery;
}

/** Re-export the structured catalogue for typed consumers. */
export const catalogue = errors;
