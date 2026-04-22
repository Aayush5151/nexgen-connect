/**
 * Shared FAQ data. Lives in a plain TS module (not a client component)
 * so it can be imported from both:
 *   - the server-rendered layout.tsx for JSON-LD FAQPage structured data
 *   - the client-rendered FAQSection component for the accordion UI
 *
 * Keeping both consumers pointed at one source means schema.org and UI
 * can never drift. Answers reflect the v9 business plan: three-check
 * verification, flexible 8-12 person groups, a 60-user corridor
 * threshold with transparent widening, Free + Premium (₹1,499) pricing,
 * and two live launch corridors (Ireland · Sept 2026, Germany · Oct 2026).
 */

export type FAQItem = { q: string; a: string };

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What if nobody from my city is flying this year?",
    a: "You still get a real group. Ireland launches in September 2026, Germany in October. If your exact match isn\u2019t there yet \u2014 say, Mumbai to UCD in September \u2014 we widen the search. Closest city, same university. Same city, nearby university. Same month. We always tell you what we relaxed and why, before anyone joins. Your group is never quietly filled with strangers.",
  },
  {
    q: "How big is a group, and what if there aren\u2019t enough people?",
    a: "A group is eight to twelve verified classmates. We don\u2019t open DMs until at least sixty verified students are ready \u2014 below that, the group isn\u2019t real and we tell you so. Above twelve, we split into two balanced groups rather than pile on. You are never alone in your match.",
  },
  {
    q: "Is it really free? What is Premium for \u20b91,499?",
    a: "The core product is free, forever: the group, verification, DMs, the countdown to your flight. Premium is a one-time \u20b91,499 unlock, no renewal. It adds three things. One, priority matching \u2014 you\u2019re in the pool four months before your flight, not six weeks. Two, apartment-together tooling: shared shortlist, lease-readiness checks, co-signer help, and handover leases from NexGen students who flew the year before. Three, a read-only view for your parents, 24/7 support, and a direct line to a named safety advisor. No subscriptions, no upsells, no surprise charges.",
  },
  {
    q: "What happens to my Aadhaar and DigiLocker data?",
    a: "Verification runs through DigiLocker, the government-issued identity rail. We receive a signed token that confirms you are a real student - not your Aadhaar number, not a scan, not a copy. We never store, share, or sell identity documents. Full deletion of your NexGen data within one hour of a request.",
  },
  {
    q: "Is my Instagram visible to everyone in the group?",
    a: "Never automatically. The default profile is first name, home city, and destination - nothing else. You opt in to reveal Instagram or LinkedIn to specific members one-by-one, only after a mutual match inside the group. The app has no public feed and no profile-browsing beyond your own group.",
  },
  {
    q: "Why does NexGen not feel like a dating app?",
    a: "Because it is not one, and we designed against every dating pattern on purpose. No swipe. No infinite scroll. No read receipts. DMs are capped at three per day for the first week. Messages are prompt-scaffolded so strangers have a real reason to start talking. No vanity metrics, no 'seen' signals, no photo-first profiles. The goal is a small group of verified classmates who will help you land - not romance.",
  },
  {
    q: "Can my parents see my group and messages?",
    a: "Only what you choose to share, and never your DMs. Premium includes a read-only Parent view: your itinerary, group size, destination university, airport arrival time, and an emergency contact line. Parents cannot message your group, cannot see individual members, and cannot read your chats. Ever.",
  },
  {
    q: "When does the app actually launch?",
    a: "We ship before the first flights take off. The Ireland corridor opens in September 2026, and Germany follows in October 2026 with the winter semester intake. Waitlist members get the TestFlight invite before public launch. We will not ship a half-built verification layer - if the three checks are not bulletproof the day we open, we wait.",
  },
];
