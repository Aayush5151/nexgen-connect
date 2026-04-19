import type { University } from "@/lib/supabase/schema";

/**
 * Preview profiles used on the landing page's GroupCanvas. These are
 * illustrative personas, not real students. They exist so a first-time
 * visitor can see what their "group" will feel like before any real
 * signups land in a given corridor.
 *
 * Rules:
 *  - Names are first-name + last-initial only. Mirrors the ActivityTicker.
 *  - Neighborhoods are specific (not just "Mumbai") because specificity is
 *    the whole point; WhatsApp groups cannot do that.
 *  - Programs reference real degrees offered at UCD/Trinity/UCC.
 *  - verifiedOn is a short month-day string so "joined Apr 12" reads naturally.
 *
 * Density note: some corridors are deliberately sparse (e.g. Chennai → UCC)
 * so the section communicates the real scarcity story: "You'd be #3 here."
 * Others are near-full to communicate urgency: "Last spot in Mumbai → UCD."
 */

export type DemoProfile = {
  initials: string;
  name: string;
  neighborhood: string;
  city: string;
  university: University;
  program: string;
  verifiedOn: string; // short date label e.g. "Apr 12"
  interest: string; // one-liner shown on hover
};

/** Alphabetized by city then name, for readability only. */
export const DEMO_PROFILES: readonly DemoProfile[] = [
  // Bangalore → UCD
  {
    initials: "SR",
    name: "Shreya R.",
    neighborhood: "Indiranagar",
    city: "Bangalore",
    university: "UCD",
    program: "MSc Business Analytics",
    verifiedOn: "Apr 14",
    interest: "Product, sourdough, F1",
  },
  {
    initials: "VT",
    name: "Vikram T.",
    neighborhood: "HSR Layout",
    city: "Bangalore",
    university: "UCD",
    program: "MSc Computer Science",
    verifiedOn: "Apr 11",
    interest: "Climbing, dosa spots, open-source",
  },
  {
    initials: "AN",
    name: "Ankita N.",
    neighborhood: "Whitefield",
    city: "Bangalore",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 8",
    interest: "Consulting, marathons, biryani",
  },
  {
    initials: "RK",
    name: "Rahul K.",
    neighborhood: "JP Nagar",
    city: "Bangalore",
    university: "UCD",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 5",
    interest: "Cricket, Kannada cinema, ML",
  },
  {
    initials: "PM",
    name: "Priyanka M.",
    neighborhood: "Jayanagar",
    city: "Bangalore",
    university: "UCD",
    program: "MSc Finance",
    verifiedOn: "Apr 2",
    interest: "Jazz, running, investing",
  },

  // Bangalore → Trinity
  {
    initials: "KS",
    name: "Karthik S.",
    neighborhood: "Koramangala",
    city: "Bangalore",
    university: "Trinity",
    program: "MA Economics",
    verifiedOn: "Apr 16",
    interest: "Arsenal FC, filter coffee, Murakami",
  },
  {
    initials: "MG",
    name: "Madhura G.",
    neighborhood: "Indiranagar",
    city: "Bangalore",
    university: "Trinity",
    program: "MSc Computer Science",
    verifiedOn: "Apr 13",
    interest: "Cycling, indie films, AI safety",
  },
  {
    initials: "AR",
    name: "Arjun R.",
    neighborhood: "Bellandur",
    city: "Bangalore",
    university: "Trinity",
    program: "MSc Immunology",
    verifiedOn: "Apr 9",
    interest: "Trekking, biotech, mandolin",
  },
  {
    initials: "NV",
    name: "Nisha V.",
    neighborhood: "Basavanagudi",
    city: "Bangalore",
    university: "Trinity",
    program: "MPhil English",
    verifiedOn: "Apr 6",
    interest: "Poetry, coffee trails, theater",
  },

  // Bangalore → UCC
  {
    initials: "DG",
    name: "Dhruv G.",
    neighborhood: "HSR Layout",
    city: "Bangalore",
    university: "UCC",
    program: "MSc Food Science",
    verifiedOn: "Apr 15",
    interest: "Brewing, hikes, anime",
  },
  {
    initials: "PK",
    name: "Preethi K.",
    neighborhood: "Sarjapur",
    city: "Bangalore",
    university: "UCC",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 10",
    interest: "Chess, plant-based food, ML",
  },
  {
    initials: "HS",
    name: "Hemanth S.",
    neighborhood: "Malleshwaram",
    city: "Bangalore",
    university: "UCC",
    program: "MSc Finance",
    verifiedOn: "Apr 4",
    interest: "Badminton, mutual funds, Malayalam cinema",
  },

  // Chennai → UCD
  {
    initials: "IR",
    name: "Ishaan R.",
    neighborhood: "Adyar",
    city: "Chennai",
    university: "UCD",
    program: "MSc Computer Science",
    verifiedOn: "Apr 12",
    interest: "Tennis, anime, systems design",
  },
  {
    initials: "TR",
    name: "Tanvi R.",
    neighborhood: "Besant Nagar",
    city: "Chennai",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 7",
    interest: "Pottery, running, consulting",
  },
  {
    initials: "SM",
    name: "Siddharth M.",
    neighborhood: "Mylapore",
    city: "Chennai",
    university: "UCD",
    program: "MSc Biotechnology",
    verifiedOn: "Apr 3",
    interest: "Carnatic, lab work, cycling",
  },

  // Chennai → Trinity
  {
    initials: "LS",
    name: "Lavanya S.",
    neighborhood: "T. Nagar",
    city: "Chennai",
    university: "Trinity",
    program: "MA English Literature",
    verifiedOn: "Apr 13",
    interest: "Poetry, vada pav, Tolkien",
  },
  {
    initials: "VP",
    name: "Varun P.",
    neighborhood: "Nungambakkam",
    city: "Chennai",
    university: "Trinity",
    program: "MSc Computer Science",
    verifiedOn: "Apr 8",
    interest: "Marvel, chess, backend dev",
  },

  // Chennai → UCC
  {
    initials: "KV",
    name: "Keerthana V.",
    neighborhood: "Velachery",
    city: "Chennai",
    university: "UCC",
    program: "MSc Finance",
    verifiedOn: "Apr 11",
    interest: "K-drama, investing, yoga",
  },
  {
    initials: "NR",
    name: "Nikhil R.",
    neighborhood: "Anna Nagar",
    city: "Chennai",
    university: "UCC",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 5",
    interest: "Football, filter coffee, hackathons",
  },

  // Delhi NCR → UCD
  {
    initials: "MD",
    name: "Meera D.",
    neighborhood: "GK-II",
    city: "Delhi NCR",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 17",
    interest: "Jazz piano, 5am gym, yes actually",
  },
  {
    initials: "RJ",
    name: "Riya J.",
    neighborhood: "Vasant Kunj",
    city: "Delhi NCR",
    university: "UCD",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 15",
    interest: "Rock climbing, street food, ML papers",
  },
  {
    initials: "AK",
    name: "Aditya K.",
    neighborhood: "Noida",
    city: "Delhi NCR",
    university: "UCD",
    program: "MSc Finance",
    verifiedOn: "Apr 13",
    interest: "Cricket, dal makhani, stocks",
  },
  {
    initials: "TB",
    name: "Tanya B.",
    neighborhood: "Gurgaon",
    city: "Delhi NCR",
    university: "UCD",
    program: "MSc Business Analytics",
    verifiedOn: "Apr 10",
    interest: "Design, weekend drives, Muji",
  },
  {
    initials: "SK",
    name: "Shivam K.",
    neighborhood: "Saket",
    city: "Delhi NCR",
    university: "UCD",
    program: "MSc Computer Science",
    verifiedOn: "Apr 6",
    interest: "FPS games, chai, distributed systems",
  },
  {
    initials: "PG",
    name: "Pooja G.",
    neighborhood: "Dwarka",
    city: "Delhi NCR",
    university: "UCD",
    program: "MSc Marketing",
    verifiedOn: "Apr 3",
    interest: "Reels, dogs, DTC brands",
  },

  // Delhi NCR → Trinity
  {
    initials: "AM",
    name: "Aarushi M.",
    neighborhood: "Defence Colony",
    city: "Delhi NCR",
    university: "Trinity",
    program: "MA Political Science",
    verifiedOn: "Apr 16",
    interest: "Debate, kebabs, podcasts",
  },
  {
    initials: "KR",
    name: "Kabir R.",
    neighborhood: "Hauz Khas",
    city: "Delhi NCR",
    university: "Trinity",
    program: "MSc Computer Science",
    verifiedOn: "Apr 14",
    interest: "Lo-fi beats, skateboarding, Rust",
  },
  {
    initials: "SV",
    name: "Simran V.",
    neighborhood: "Gurgaon",
    city: "Delhi NCR",
    university: "Trinity",
    program: "MA English",
    verifiedOn: "Apr 11",
    interest: "Victorian novels, hiking, chai",
  },
  {
    initials: "YT",
    name: "Yash T.",
    neighborhood: "Rohini",
    city: "Delhi NCR",
    university: "Trinity",
    program: "MSc Economics",
    verifiedOn: "Apr 7",
    interest: "Chess, paratha runs, policy",
  },

  // Delhi NCR → UCC
  {
    initials: "NL",
    name: "Neha L.",
    neighborhood: "Noida",
    city: "Delhi NCR",
    university: "UCC",
    program: "MSc Biotechnology",
    verifiedOn: "Apr 12",
    interest: "Microscopy, painting, daal",
  },
  {
    initials: "HK",
    name: "Harsh K.",
    neighborhood: "Gurgaon",
    city: "Delhi NCR",
    university: "UCC",
    program: "MSc Finance",
    verifiedOn: "Apr 8",
    interest: "Surfing, crypto, butter chicken",
  },

  // Hyderabad → UCD
  {
    initials: "PV",
    name: "Pranav V.",
    neighborhood: "Banjara Hills",
    city: "Hyderabad",
    university: "UCD",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 14",
    interest: "Biryani, cricket, NLP",
  },
  {
    initials: "SA",
    name: "Sneha A.",
    neighborhood: "Gachibowli",
    city: "Hyderabad",
    university: "UCD",
    program: "MSc Computer Science",
    verifiedOn: "Apr 9",
    interest: "Kathak, Tensorflow, filter coffee",
  },
  {
    initials: "RT",
    name: "Rohan T.",
    neighborhood: "Jubilee Hills",
    city: "Hyderabad",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 4",
    interest: "Strategy, tennis, Hyderabadi food",
  },

  // Hyderabad → Trinity
  {
    initials: "DS",
    name: "Divya S.",
    neighborhood: "Kondapur",
    city: "Hyderabad",
    university: "Trinity",
    program: "MSc Computer Science",
    verifiedOn: "Apr 15",
    interest: "Distributed systems, ghazals, pottery",
  },
  {
    initials: "AV",
    name: "Akhil V.",
    neighborhood: "Madhapur",
    city: "Hyderabad",
    university: "Trinity",
    program: "MA History",
    verifiedOn: "Apr 6",
    interest: "Medieval, chess, qubani ka meetha",
  },

  // Hyderabad → UCC
  {
    initials: "NJ",
    name: "Nithya J.",
    neighborhood: "Secunderabad",
    city: "Hyderabad",
    university: "UCC",
    program: "MSc Food Science",
    verifiedOn: "Apr 10",
    interest: "Baking, K-dramas, yoga",
  },

  // Mumbai → UCD
  {
    initials: "RM",
    name: "Rhea M.",
    neighborhood: "Andheri West",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 18",
    interest: "Podcasts, climbing, bad filter coffee",
  },
  {
    initials: "AD",
    name: "Arnav D.",
    neighborhood: "Bandra West",
    city: "Mumbai",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 17",
    interest: "Football, pav bhaji, consulting",
  },
  {
    initials: "ZP",
    name: "Zoya P.",
    neighborhood: "Powai",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Business Analytics",
    verifiedOn: "Apr 15",
    interest: "Design, coastal runs, indie music",
  },
  {
    initials: "KT",
    name: "Kartik T.",
    neighborhood: "Juhu",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Computer Science",
    verifiedOn: "Apr 13",
    interest: "Gym, anime, competitive coding",
  },
  {
    initials: "IS",
    name: "Isha S.",
    neighborhood: "Lower Parel",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Finance",
    verifiedOn: "Apr 11",
    interest: "Equities, yoga, Goa trips",
  },
  {
    initials: "OR",
    name: "Om R.",
    neighborhood: "Chembur",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Marketing",
    verifiedOn: "Apr 8",
    interest: "Standup, Reddit, vada pav safaris",
  },
  {
    initials: "SM",
    name: "Sanvi M.",
    neighborhood: "Worli",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 5",
    interest: "Film photography, Python, pani puri",
  },
  {
    initials: "HP",
    name: "Harshit P.",
    neighborhood: "Andheri East",
    city: "Mumbai",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 2",
    interest: "FC Barcelona, misal pav, markets",
  },
  {
    initials: "RV",
    name: "Radhika V.",
    neighborhood: "Malad West",
    city: "Mumbai",
    university: "UCD",
    program: "MSc Business Analytics",
    verifiedOn: "Mar 30",
    interest: "UX, jogging, Fabindia",
  },

  // Mumbai → Trinity
  {
    initials: "NS",
    name: "Nisarg S.",
    neighborhood: "Bandra East",
    city: "Mumbai",
    university: "Trinity",
    program: "MSc Computer Science",
    verifiedOn: "Apr 16",
    interest: "Jazz, chess, low-level systems",
  },
  {
    initials: "PD",
    name: "Pari D.",
    neighborhood: "Juhu",
    city: "Mumbai",
    university: "Trinity",
    program: "MA Sociology",
    verifiedOn: "Apr 14",
    interest: "Essays, pottery, spoken word",
  },
  {
    initials: "VR",
    name: "Varun R.",
    neighborhood: "Andheri West",
    city: "Mumbai",
    university: "Trinity",
    program: "MSc Economics",
    verifiedOn: "Apr 12",
    interest: "Policy, fitness, samosa runs",
  },
  {
    initials: "TJ",
    name: "Tanya J.",
    neighborhood: "Powai",
    city: "Mumbai",
    university: "Trinity",
    program: "MSc Computer Science",
    verifiedOn: "Apr 9",
    interest: "Systems, coffee, crosswords",
  },
  {
    initials: "SH",
    name: "Shaan H.",
    neighborhood: "Colaba",
    city: "Mumbai",
    university: "Trinity",
    program: "MA History",
    verifiedOn: "Apr 6",
    interest: "Mughal history, trekking, ghazals",
  },
  {
    initials: "AG",
    name: "Aahana G.",
    neighborhood: "Santacruz West",
    city: "Mumbai",
    university: "Trinity",
    program: "MSc Finance",
    verifiedOn: "Apr 3",
    interest: "Markets, yoga, bhelpuri",
  },

  // Mumbai → UCC
  {
    initials: "AP",
    name: "Aarav P.",
    neighborhood: "Dadar",
    city: "Mumbai",
    university: "UCC",
    program: "MSc Biotechnology",
    verifiedOn: "Apr 15",
    interest: "Trail running, strategy games, vegetarian",
  },
  {
    initials: "TG",
    name: "Tara G.",
    neighborhood: "Khar",
    city: "Mumbai",
    university: "UCC",
    program: "MSc Finance",
    verifiedOn: "Apr 10",
    interest: "Rowing, investing, Japanese food",
  },
  {
    initials: "RV2",
    name: "Rishi V.",
    neighborhood: "Malad East",
    city: "Mumbai",
    university: "UCC",
    program: "MSc Food Science",
    verifiedOn: "Apr 7",
    interest: "Cooking, cricket, fermentation",
  },
  {
    initials: "MC",
    name: "Myra C.",
    neighborhood: "Bandra West",
    city: "Mumbai",
    university: "UCC",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 4",
    interest: "Sketching, coffee, ML",
  },

  // Pune → UCD
  {
    initials: "KN",
    name: "Kunal N.",
    neighborhood: "Koregaon Park",
    city: "Pune",
    university: "UCD",
    program: "MSc Computer Science",
    verifiedOn: "Apr 16",
    interest: "Football, craft beer, distributed systems",
  },
  {
    initials: "RG",
    name: "Ritika G.",
    neighborhood: "Viman Nagar",
    city: "Pune",
    university: "UCD",
    program: "MBA",
    verifiedOn: "Apr 13",
    interest: "Running, board games, misal pav",
  },
  {
    initials: "NA",
    name: "Neel A.",
    neighborhood: "Baner",
    city: "Pune",
    university: "UCD",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 9",
    interest: "F1, math, dog walks",
  },
  {
    initials: "PA",
    name: "Prisha A.",
    neighborhood: "Aundh",
    city: "Pune",
    university: "UCD",
    program: "MSc Finance",
    verifiedOn: "Apr 5",
    interest: "Equities, Kathak, Pani puri",
  },

  // Pune → Trinity
  {
    initials: "OA",
    name: "Om A.",
    neighborhood: "Kothrud",
    city: "Pune",
    university: "Trinity",
    program: "MSc Economics",
    verifiedOn: "Apr 14",
    interest: "Cricket, puran poli, policy",
  },
  {
    initials: "MS",
    name: "Mihika S.",
    neighborhood: "Kalyani Nagar",
    city: "Pune",
    university: "Trinity",
    program: "MA English",
    verifiedOn: "Apr 10",
    interest: "Sylvia Plath, indie films, vada pav",
  },

  // Pune → UCC
  {
    initials: "SA2",
    name: "Sahil A.",
    neighborhood: "Hinjewadi",
    city: "Pune",
    university: "UCC",
    program: "MSc Data Analytics",
    verifiedOn: "Apr 11",
    interest: "Hiking, Warhammer, ML",
  },
  {
    initials: "EK",
    name: "Esha K.",
    neighborhood: "Wakad",
    city: "Pune",
    university: "UCC",
    program: "MSc Finance",
    verifiedOn: "Apr 6",
    interest: "Crypto, bakery runs, music",
  },
  {
    initials: "DJ",
    name: "Dev J.",
    neighborhood: "Magarpatta",
    city: "Pune",
    university: "UCC",
    program: "MSc Food Science",
    verifiedOn: "Apr 2",
    interest: "Cooking, badminton, coffee",
  },
];

/** Fast lookup table: "city|university" → DemoProfile[]. Built once. */
export const DEMO_PROFILES_BY_COHORT: ReadonlyMap<string, DemoProfile[]> =
  (() => {
    const map = new Map<string, DemoProfile[]>();
    for (const p of DEMO_PROFILES) {
      const key = `${p.city}|${p.university}`;
      const bucket = map.get(key);
      if (bucket) bucket.push(p);
      else map.set(key, [p]);
    }
    return map;
  })();

/** Cities we have demo data for, in priority order for the chip row. */
export const DEMO_CITIES: readonly string[] = [
  "Mumbai",
  "Delhi NCR",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
];

export function getDemoGroup(
  city: string,
  uni: University,
): DemoProfile[] {
  return DEMO_PROFILES_BY_COHORT.get(`${city}|${uni}`) ?? [];
}
