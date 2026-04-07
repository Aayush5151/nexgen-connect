export const INDIAN_CITIES: Record<string, string> = {
  // Maharashtra
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Nagpur: "Maharashtra",
  Nashik: "Maharashtra",
  Aurangabad: "Maharashtra",
  Thane: "Maharashtra",
  "Navi Mumbai": "Maharashtra",

  // Karnataka
  Bangalore: "Karnataka",
  Mysore: "Karnataka",
  Mangalore: "Karnataka",
  Hubli: "Karnataka",

  // Tamil Nadu
  Chennai: "Tamil Nadu",
  Coimbatore: "Tamil Nadu",
  Madurai: "Tamil Nadu",
  Trichy: "Tamil Nadu",
  Salem: "Tamil Nadu",

  // Telangana
  Hyderabad: "Telangana",
  Warangal: "Telangana",
  Secunderabad: "Telangana",

  // Delhi NCR
  Delhi: "Delhi",
  "New Delhi": "Delhi",
  Noida: "Uttar Pradesh",
  Gurgaon: "Haryana",
  Faridabad: "Haryana",
  Ghaziabad: "Uttar Pradesh",
  "Greater Noida": "Uttar Pradesh",

  // West Bengal
  Kolkata: "West Bengal",
  Howrah: "West Bengal",
  Siliguri: "West Bengal",

  // Gujarat
  Ahmedabad: "Gujarat",
  Surat: "Gujarat",
  Vadodara: "Gujarat",
  Rajkot: "Gujarat",
  Gandhinagar: "Gujarat",

  // Rajasthan
  Jaipur: "Rajasthan",
  Jodhpur: "Rajasthan",
  Udaipur: "Rajasthan",
  Kota: "Rajasthan",

  // Punjab
  Chandigarh: "Punjab",
  Ludhiana: "Punjab",
  Amritsar: "Punjab",
  Jalandhar: "Punjab",
  Patiala: "Punjab",
  Mohali: "Punjab",

  // Uttar Pradesh
  Lucknow: "Uttar Pradesh",
  Kanpur: "Uttar Pradesh",
  Varanasi: "Uttar Pradesh",
  Agra: "Uttar Pradesh",
  Allahabad: "Uttar Pradesh",
  Meerut: "Uttar Pradesh",

  // Kerala
  Kochi: "Kerala",
  Thiruvananthapuram: "Kerala",
  Calicut: "Kerala",
  Thrissur: "Kerala",

  // Madhya Pradesh
  Bhopal: "Madhya Pradesh",
  Indore: "Madhya Pradesh",
  Gwalior: "Madhya Pradesh",

  // Andhra Pradesh
  Visakhapatnam: "Andhra Pradesh",
  Vijayawada: "Andhra Pradesh",
  Tirupati: "Andhra Pradesh",
  Guntur: "Andhra Pradesh",

  // Bihar
  Patna: "Bihar",

  // Odisha
  Bhubaneswar: "Odisha",

  // Jharkhand
  Ranchi: "Jharkhand",
  Jamshedpur: "Jharkhand",

  // Assam
  Guwahati: "Assam",

  // Uttarakhand
  Dehradun: "Uttarakhand",

  // Goa
  Panaji: "Goa",

  // Himachal Pradesh
  Shimla: "Himachal Pradesh",

  // Jammu & Kashmir
  Srinagar: "Jammu & Kashmir",
  Jammu: "Jammu & Kashmir",
};

export const INDIAN_CITY_NAMES = Object.keys(INDIAN_CITIES).sort();

export const DESTINATION_COUNTRIES = [
  "Germany",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Ireland",
  "France",
  "Netherlands",
  "New Zealand",
  "Singapore",
  "Italy",
  "Spain",
  "Sweden",
  "Denmark",
  "Switzerland",
  "Japan",
  "South Korea",
  "Other",
];

export const INTAKE_PERIODS = [
  "Fall 2025",
  "Winter 2025",
  "Spring 2026",
  "Summer 2026",
  "Fall 2026",
  "Winter 2026",
  "Spring 2027",
  "Summer 2027",
  "Fall 2027",
  "Winter 2027",
  "Spring 2028",
  "Summer 2028",
  "Fall 2028",
  "Winter 2028",
];

export const HOBBY_CATEGORIES: { category: string; hobbies: { name: string; emoji: string }[] }[] = [
  {
    category: "Sports",
    hobbies: [
      { name: "Cricket", emoji: "\uD83C\uDFCF" },
      { name: "Football", emoji: "\u26BD" },
      { name: "Badminton", emoji: "\uD83C\uDFF8" },
      { name: "Swimming", emoji: "\uD83C\uDFCA" },
      { name: "Gym", emoji: "\uD83D\uDCAA" },
      { name: "Running", emoji: "\uD83C\uDFC3" },
      { name: "Table Tennis", emoji: "\uD83C\uDFD3" },
      { name: "Basketball", emoji: "\uD83C\uDFC0" },
    ],
  },
  {
    category: "Creative",
    hobbies: [
      { name: "Photography", emoji: "\uD83D\uDCF7" },
      { name: "Art", emoji: "\uD83C\uDFA8" },
      { name: "Singing", emoji: "\uD83C\uDFA4" },
      { name: "Dance", emoji: "\uD83D\uDC83" },
      { name: "Writing", emoji: "\u270D\uFE0F" },
      { name: "Music", emoji: "\uD83C\uDFB5" },
      { name: "Filmmaking", emoji: "\uD83C\uDFAC" },
    ],
  },
  {
    category: "Lifestyle",
    hobbies: [
      { name: "Cooking", emoji: "\uD83C\uDF73" },
      { name: "Travel", emoji: "\u2708\uFE0F" },
      { name: "Hiking", emoji: "\u26F0\uFE0F" },
      { name: "Movies", emoji: "\uD83C\uDFAC" },
      { name: "Anime", emoji: "\uD83C\uDDEF\uD83C\uDDF5" },
      { name: "Pets", emoji: "\uD83D\uDC36" },
      { name: "Shopping", emoji: "\uD83D\uDECD\uFE0F" },
    ],
  },
  {
    category: "Tech & Mind",
    hobbies: [
      { name: "Coding", emoji: "\uD83D\uDCBB" },
      { name: "Gaming", emoji: "\uD83C\uDFAE" },
      { name: "Chess", emoji: "\u265F\uFE0F" },
      { name: "Reading", emoji: "\uD83D\uDCDA" },
      { name: "Blogging", emoji: "\u270D\uFE0F" },
      { name: "Startups", emoji: "\uD83D\uDE80" },
    ],
  },
  {
    category: "Social & Wellness",
    hobbies: [
      { name: "Yoga", emoji: "\uD83E\uDDD8" },
      { name: "Meditation", emoji: "\uD83E\uDDD8" },
      { name: "Volunteering", emoji: "\uD83E\uDD1D" },
      { name: "Stand-up Comedy", emoji: "\uD83C\uDFA4" },
      { name: "Karaoke", emoji: "\uD83C\uDFA4" },
      { name: "Board Games", emoji: "\uD83C\uDFB2" },
    ],
  },
];

export const HOBBY_OPTIONS = HOBBY_CATEGORIES.flatMap((c) => c.hobbies.map((h) => h.name));

export const ICEBREAKER_PROMPTS = [
  "My most unpopular opinion is ___",
  "The first thing I'm doing when I land is ___",
  "I can't live without ___",
  "My comfort food is ___",
  "A fun fact about me is ___",
  "My go-to Bollywood movie is ___",
  "I'm secretly good at ___",
  "On weekends, you'll find me ___",
];

export const THIS_OR_THAT_OPTIONS = [
  { id: "streaming", left: "Netflix", right: "YouTube", leftEmoji: "\uD83C\uDFAC", rightEmoji: "\uD83D\uDCF1" },
  { id: "food", left: "Maggi", right: "Pasta", leftEmoji: "\uD83C\uDF5C", rightEmoji: "\uD83C\uDF5D" },
  { id: "seat", left: "Window Seat", right: "Aisle Seat", leftEmoji: "\uD83E\uDE9F", rightEmoji: "\uD83D\uDCBA" },
  { id: "planning", left: "Plan Everything", right: "Go with the Flow", leftEmoji: "\uD83D\uDCCB", rightEmoji: "\uD83C\uDF0A" },
  { id: "morning", left: "Chai", right: "Coffee", leftEmoji: "\u2615", rightEmoji: "\u2615" },
  { id: "social", left: "Introvert", right: "Extrovert", leftEmoji: "\uD83D\uDCDA", rightEmoji: "\uD83C\uDF89" },
];

export const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Malayalam",
  "Odia",
  "Assamese",
  "Urdu",
  "Konkani",
  "Sanskrit",
  "Manipuri",
  "Bodo",
  "Dogri",
  "Kashmiri",
  "Maithili",
  "Nepali",
  "Santali",
  "Sindhi",
  "Tulu",
];

export const COURSE_FIELDS = [
  "Computer Science",
  "Data Science",
  "Artificial Intelligence",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "MBA / Business",
  "Finance",
  "Marketing",
  "Medicine",
  "Pharmacy",
  "Biotechnology",
  "Law",
  "Design",
  "Architecture",
  "Psychology",
  "Sociology",
  "Economics",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Environmental Science",
  "Agriculture",
  "Journalism",
  "Film Studies",
  "Music",
  "Other",
];

export const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
];

export const RELIGION_OPTIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Other",
  "Prefer not to say",
];
