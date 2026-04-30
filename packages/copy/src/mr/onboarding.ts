/**
 * Marathi (mr-IN) — onboarding namespace.
 *
 * Per B3 of build-prompt-decisions.md: Marathi chosen as the third
 * locale because v15 §3.7 (Pune→Dublin) + §3.7a (Mumbai→Galway) are
 * the canonical simulations, both Marathi-speaking.
 *
 * **Translation status:** machine-drafted by Claude. NOT production-
 * ready. Marked for review in tools/i18n-review.md — Aayush + a
 * native Marathi speaker must validate before this locale promotes
 * to production.
 *
 * Coverage in this file: the welcome / phone / OTP / scared subset —
 * the most-trafficked onboarding paths. Other namespaces fall back
 * to EN until translations land.
 *
 * v6 build §20 / Build Prompt Bucket 8 + B3 + A6.
 */
export const copy: Record<string, string> = {
  // Welcome (O1)
  "welcome.heading": "तुमचे लोक शोधा",
  "welcome.accent": "उतरण्याआधी।",
  "welcome.subhead": "खात्री असलेले विद्यार्थी. एकच ठिकाण. एकच महिना.",
  "welcome.cta": "पुढे जा",
  "welcome.alt": "माझे आधीच खाते आहे →",
  "welcome.caption": "खात्री करायला विनामूल्य. लोक शोधायला विनामूल्य.",

  // Phone (O2)
  "phone.heading": "तुमचा मोबाइल।",
  "phone.accent": "पहिली तपासणी।",
  "phone.label": "मोबाइल नंबर",
  "phone.placeholder": "१० अंकी भारतीय मोबाइल",
  "phone.cta": "कोड पाठवा",
  "phone.error.invalid": "योग्य १० अंकी भारतीय मोबाइल टाका.",

  // OTP (O3)
  "otp.heading": "सहा अंक।",
  "otp.accent": "{{masked}} वर पाठवले.",
  "otp.error.invalid": "चुकीचा कोड. पुन्हा प्रयत्न करा.",
  "otp.resend": "{{seconds}}s मध्ये पुन्हा पाठवा",
  "otp.resendNow": "कोड पुन्हा पाठवा",

  // Scared (O3a)
  "scared.heading": "सप्टेंबरबद्दल सर्वात जास्त",
  "scared.accent": "तुम्हाला कशाची भीती वाटते?",
  "scared.placeholder": "एक वाक्यात सांगा.",
  "scared.cta": "पाठवा",
  "scared.skip": "वगळा",
};
