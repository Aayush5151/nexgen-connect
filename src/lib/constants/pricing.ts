export const PRICING_TIERS = {
  free: {
    name: "Free",
    price: 0,
    currency: "INR",
    features: [
      "See your group exists",
      "Browse blurred profiles",
      "Activity notifications",
      "Join waitlist for new groups",
    ],
    cta: "Sign Up Free",
  },
  unlock: {
    name: "Unlock",
    pricesByRegion: {
      IN: { amount: 999, currency: "INR", symbol: "\u20B9" },
      US: { amount: 9.99, currency: "USD", symbol: "$" },
      GB: { amount: 7.99, currency: "GBP", symbol: "\u00A3" },
      EU: { amount: 8.99, currency: "EUR", symbol: "\u20AC" },
      AU: { amount: 14.99, currency: "AUD", symbol: "A$" },
      DEFAULT: { amount: 999, currency: "INR", symbol: "\u20B9" },
    },
    features: [
      "Full profiles (names, photos, bios)",
      "Swipe & match with students",
      "Instagram & LinkedIn revealed on match",
      "All group levels unlocked",
      "Lifetime access",
    ],
    cta: "Unlock Your Group",
    highlight: true,
  },
} as const;
