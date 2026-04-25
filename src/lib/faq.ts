/**
 * Shared FAQ data. Lives in a plain TS module (not a client component)
 * so it can be imported from both:
 *   - the server-rendered layout.tsx for JSON-LD FAQPage structured data
 *   - the client-rendered FAQSection component for the accordion UI
 *
 * Keeping both consumers pointed at one source means schema.org and UI
 * can never drift. Answers reflect the v10 business plan: corridor =
 * home-city × destination-city × intake-month, DMs unlock at 60 verified
 * per corridor, uni subgroups auto-spawn at 20+ verified per HEI,
 * three-check verification (phone OTP + DigiLocker + admit letter),
 * Free + Premium (₹1,499 one-time) pricing, and two live launch
 * corridors (Ireland · Sept 2026, Germany · Oct 2026).
 */

export type FAQItem = { q: string; a: string };

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What if nobody from my city is flying this year?",
    a: "You still get a real group. Ireland launches in September 2026, Germany in October. If your exact match isn\u2019t there yet, we widen one axis at a time \u2014 nearest home city first, then nearest university, then intake month. We always tell you exactly what we relaxed and why, before anyone joins. Your group is never quietly filled with strangers from the other end of the country.",
  },
  {
    q: "How big is a group, and what if there aren\u2019t enough people?",
    a: "Your group is your corridor \u2014 every verified student going from your home city to your destination city in your intake month. DMs only open when at least 60 verified classmates share that corridor; below that, the group isn\u2019t real and we tell you so. Inside an unlocked corridor, uni-specific subgroups auto-spawn whenever 20+ classmates verify at the same school, and small intro circles form on day one so you\u2019re never lost in a crowd. You are never alone in your match.",
  },
  {
    q: "Is it really free? What is Premium for \u20b91,499?",
    a: "The core product is free, forever: corridor matching, verification, DMs once 60 verified classmates unlock the group, uni subgroups, and the countdown to your flight. Premium is a one-time \u20b91,499 unlock, no renewal. It adds four things. One, priority matching \u2014 first seat when your corridor unlocks and first look at new members joining. Two, group-apply apartment tooling \u2014 bundle a 3 to 6 student PBSA application in one signature flow. Three, a read-only view for your parents \u2014 group size, verification status, arrival time, never your chats. Four, a 30-minute human call with the team within 24 hours of any question. No subscriptions, no upsells, no surprise charges.",
  },
  {
    q: "What happens to my Aadhaar and DigiLocker data?",
    a: "Verification runs through DigiLocker, the Government of India identity rail operated by MeitY. We receive a cryptographically signed token confirming name, date of birth, and valid Aadhaar linkage \u2014 never the 12-digit number, never a scan, never a copy. The token is stored encrypted at rest and purged when your account closes. Delete on request and every trace of your NexGen data is erased.",
  },
  {
    q: "Is my Instagram visible to everyone in the group?",
    a: "Never automatically. The default profile is first name, home city, and destination \u2014 nothing else. Instagram and LinkedIn unlock one person at a time, only after a mutual tap inside the group. The app has no public feed, no profile-browsing beyond your own group, and no way to discover you from the outside world. What you reveal is always something you chose to reveal.",
  },
  {
    q: "Why does NexGen not feel like a dating app?",
    a: "Because it is not one, and we designed against every dating pattern on purpose. No swipe. No infinite scroll. No read receipts. Messages are prompt-scaffolded so strangers have a real reason to start talking. No vanity metrics, no 'seen' signals, no photo-first profiles. The goal is a verified group of classmates who will help you land — not romance.",
  },
  {
    q: "Can my parents see my group and messages?",
    a: "Only what you choose to share, and never your DMs. Premium includes a read-only Parent view: your itinerary, group size, destination university, airport arrival time, and an emergency contact line. Parents cannot message your group, cannot see individual members, and cannot read your chats. Ever.",
  },
  {
    q: "When does the app actually launch?",
    a: "We ship before the first flights take off. Ireland opens in September 2026 for the autumn intake. Germany follows in October 2026 for the winter semester. Waitlist members get the TestFlight build in the weeks leading up to public launch, with a named Trust & Safety advisor on call from day one. We will not ship a half-built verification layer \u2014 if the three checks are not bulletproof the day we open, we wait.",
  },
];
