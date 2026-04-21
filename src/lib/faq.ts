/**
 * Shared FAQ data. Lives in a plain TS module (not a client component)
 * so it can be imported from both:
 *   - the server-rendered layout.tsx for JSON-LD FAQPage structured data
 *   - the client-rendered FAQSection component for the accordion UI
 *
 * Keeping both consumers pointed at one source means schema.org and UI
 * can never drift. Answers reflect the v4 business plan: three-check
 * verification, flexible 8-12 person groups, a 60-user corridor
 * threshold with transparent widening, and Free + Premium (₹1,499)
 * pricing.
 */

export type FAQItem = { q: string; a: string };

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What if nobody from my city is flying to Ireland this September?",
    a: "You still get a real group. When your exact corridor - say, Mumbai to UCD, September 2026 - does not have enough verified students yet, we widen it on five axes: home city, destination university, intake month, gender preference, and religion preference. We tell you exactly which axis we widened and why, before you join. No silent dilution, no pretending your group is something it is not.",
  },
  {
    q: "How big is a group, and what happens if we cannot find enough people?",
    a: "A group is eight to twelve verified classmates from your corridor. We unlock DMs only after at least sixty verified students exist in that corridor - below sixty, we widen axes and show you the new shape. Above twelve, we split into two balanced groups rather than pile on. You are never the only person in your match.",
  },
  {
    q: "Is it really free? What is Premium for ₹1,499?",
    a: "The core product is free, forever: group matching, verification, DMs, the pre-flight countdown. Premium is a one-time ₹1,499 unlock that adds a read-only Parent view, priority human-review of your admit letter, extended group preview, and priority support. No subscriptions, no upsell pop-ups, no surprise charges.",
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
    a: "September 2026, three months before the first Ireland-bound intake flights take off. Waitlist members get the TestFlight invite before public launch. We will not ship a half-built verification layer - if the three checks are not bulletproof the day we open, we wait.",
  },
];
