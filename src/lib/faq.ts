/**
 * Shared FAQ data. Lives in a plain TS module (not a client component)
 * so it can be imported from both:
 *   - the server-rendered layout.tsx for JSON-LD FAQPage structured data
 *   - the client-rendered FAQSection component for the accordion UI
 *
 * Keeping both consumers pointed at one source means schema.org and UI
 * can never drift.
 */

export type FAQItem = { q: string; a: string };

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What if no one from my city is flying to Ireland this September?",
    a: "You will still get a verified group - it just may not include someone from your exact city. We sort by country, destination, and intake month first. If you are the only one from your city, we tell you upfront so you know the group you join is still real, just geographically wider.",
  },
  {
    q: "Why is the app free?",
    a: "Because the product we are building is trust, and you cannot charge for the first round of that. When we add features - a group concierge, campus hubs, a shared housing layer - we may charge for those. The core app, flight-matching, verification, messaging, is free, forever.",
  },
  {
    q: "What happens to my Aadhaar and passport data?",
    a: "Verification runs through DigiLocker, which is a government-issued identity rail. We receive a signed token confirming you are a real student - not your Aadhaar number or scan. We never store, share, or sell identity documents. Everything is on a need-to-know basis inside the app.",
  },
  {
    q: "Can I leave my group if I do not get along with them?",
    a: "Yes. You can mute, leave, or report anyone in one tap. Groups are formed before you land, but nobody is locked in - once you arrive, you live your life. We are just here to get you to the airport with people who know your name.",
  },
  {
    q: "Is my Instagram visible to every member?",
    a: "Only to mutual matches. You opt in to share your Instagram or LinkedIn with specific people - never to the whole group. The default is anonymous - first name and city only - until you decide otherwise.",
  },
  {
    q: "Is NexGen Connect only for Indian students?",
    a: "The first corridor is India to Ireland, September 2026. We built the onboarding around Indian student documents because that is where the pain is sharpest. When we open the next corridor, we will add the relevant verification rails. Other-country students can join the waitlist today.",
  },
  {
    q: "When exactly does the app launch?",
    a: "September 2026, before the first Fall intake flights. We do not ship half-products, so if verification is not bulletproof, we will wait. Email on the waitlist and you get the day-one TestFlight link the moment it is live.",
  },
  {
    q: "Which country will you open after Ireland?",
    a: "We will announce that when the first corridor actually works, in the field, with real groups, in real Dublin apartments. Guessing now would be a lie. The app architecture already supports every destination - what takes time is the on-the-ground partnerships in each new country.",
  },
];
