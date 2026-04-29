/**
 * Indian cities for the home-city picker in /onboarding/you.
 *
 * Tiering follows the standard X-class / Y-class HRA classification
 * (Sixth Pay Commission) — Tier 1 = X-class metros, Tier 2 = Y-class.
 * We include the most common student-source cities; ~99% of Indian
 * student outflow originates from this list. "Other" lets the long-
 * tail user type a custom value.
 *
 * Order within each tier: by population / student-source volume,
 * not alphabetical, so the most likely match surfaces first.
 */

export type IndianCity = {
  name: string;
  state: string;
};

export type CitiesByTier = {
  tier: string;
  cities: IndianCity[];
};

export const CITIES_BY_TIER: CitiesByTier[] = [
  {
    tier: "Tier 1",
    cities: [
      { name: "Mumbai", state: "Maharashtra" },
      { name: "Delhi", state: "Delhi" },
      { name: "Bangalore", state: "Karnataka" },
      { name: "Hyderabad", state: "Telangana" },
      { name: "Chennai", state: "Tamil Nadu" },
      { name: "Kolkata", state: "West Bengal" },
      { name: "Pune", state: "Maharashtra" },
      { name: "Ahmedabad", state: "Gujarat" },
    ],
  },
  {
    tier: "Tier 2",
    cities: [
      { name: "Jaipur", state: "Rajasthan" },
      { name: "Lucknow", state: "Uttar Pradesh" },
      { name: "Surat", state: "Gujarat" },
      { name: "Kanpur", state: "Uttar Pradesh" },
      { name: "Nagpur", state: "Maharashtra" },
      { name: "Indore", state: "Madhya Pradesh" },
      { name: "Bhopal", state: "Madhya Pradesh" },
      { name: "Visakhapatnam", state: "Andhra Pradesh" },
      { name: "Vadodara", state: "Gujarat" },
      { name: "Coimbatore", state: "Tamil Nadu" },
      { name: "Patna", state: "Bihar" },
      { name: "Chandigarh", state: "Chandigarh" },
      { name: "Gurgaon", state: "Haryana" },
      { name: "Noida", state: "Uttar Pradesh" },
      { name: "Faridabad", state: "Haryana" },
      { name: "Ghaziabad", state: "Uttar Pradesh" },
      { name: "Agra", state: "Uttar Pradesh" },
      { name: "Nashik", state: "Maharashtra" },
      { name: "Meerut", state: "Uttar Pradesh" },
      { name: "Rajkot", state: "Gujarat" },
      { name: "Varanasi", state: "Uttar Pradesh" },
      { name: "Amritsar", state: "Punjab" },
      { name: "Aurangabad", state: "Maharashtra" },
      { name: "Allahabad", state: "Uttar Pradesh" },
      { name: "Ranchi", state: "Jharkhand" },
      { name: "Madurai", state: "Tamil Nadu" },
      { name: "Raipur", state: "Chhattisgarh" },
      { name: "Kota", state: "Rajasthan" },
      { name: "Guwahati", state: "Assam" },
      { name: "Mysore", state: "Karnataka" },
      { name: "Bhubaneswar", state: "Odisha" },
      { name: "Thiruvananthapuram", state: "Kerala" },
      { name: "Kochi", state: "Kerala" },
      { name: "Jamshedpur", state: "Jharkhand" },
      { name: "Dehradun", state: "Uttarakhand" },
      { name: "Jalandhar", state: "Punjab" },
      { name: "Ludhiana", state: "Punjab" },
      { name: "Mangalore", state: "Karnataka" },
      { name: "Mohali", state: "Punjab" },
      { name: "Goa", state: "Goa" },
      { name: "Jodhpur", state: "Rajasthan" },
      { name: "Udaipur", state: "Rajasthan" },
      { name: "Vijayawada", state: "Andhra Pradesh" },
      { name: "Salem", state: "Tamil Nadu" },
      { name: "Warangal", state: "Telangana" },
      { name: "Tiruchirappalli", state: "Tamil Nadu" },
      { name: "Tiruppur", state: "Tamil Nadu" },
      { name: "Gwalior", state: "Madhya Pradesh" },
      { name: "Jabalpur", state: "Madhya Pradesh" },
      { name: "Hubli", state: "Karnataka" },
      { name: "Belgaum", state: "Karnataka" },
      { name: "Bareilly", state: "Uttar Pradesh" },
      { name: "Aligarh", state: "Uttar Pradesh" },
      { name: "Gorakhpur", state: "Uttar Pradesh" },
      { name: "Saharanpur", state: "Uttar Pradesh" },
      { name: "Bikaner", state: "Rajasthan" },
      { name: "Ajmer", state: "Rajasthan" },
      { name: "Howrah", state: "West Bengal" },
      { name: "Asansol", state: "West Bengal" },
      { name: "Siliguri", state: "West Bengal" },
      { name: "Durgapur", state: "West Bengal" },
      { name: "Cuttack", state: "Odisha" },
      { name: "Rourkela", state: "Odisha" },
      { name: "Bhilai", state: "Chhattisgarh" },
      { name: "Bilaspur", state: "Chhattisgarh" },
      { name: "Nellore", state: "Andhra Pradesh" },
      { name: "Guntur", state: "Andhra Pradesh" },
      { name: "Tirupati", state: "Andhra Pradesh" },
      { name: "Kolhapur", state: "Maharashtra" },
      { name: "Solapur", state: "Maharashtra" },
      { name: "Amravati", state: "Maharashtra" },
      { name: "Bhavnagar", state: "Gujarat" },
      { name: "Jamnagar", state: "Gujarat" },
      { name: "Srinagar", state: "Jammu and Kashmir" },
      { name: "Jammu", state: "Jammu and Kashmir" },
      { name: "Shimla", state: "Himachal Pradesh" },
      { name: "Imphal", state: "Manipur" },
      { name: "Shillong", state: "Meghalaya" },
      { name: "Agartala", state: "Tripura" },
      { name: "Aizawl", state: "Mizoram" },
      { name: "Kohima", state: "Nagaland" },
      { name: "Itanagar", state: "Arunachal Pradesh" },
      { name: "Gangtok", state: "Sikkim" },
      { name: "Port Blair", state: "Andaman and Nicobar" },
    ],
  },
];

/** Flat city list for search (no tier sectioning). */
export const ALL_CITIES: IndianCity[] = CITIES_BY_TIER.flatMap(
  (t) => t.cities,
);
