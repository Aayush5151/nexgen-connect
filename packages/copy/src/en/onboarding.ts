/**
 * EN · onboarding namespace.
 * v15 user-heart language. Keys are dot-paths matching screen IDs.
 */
export const copy: Record<string, string> = {
  // O1 Welcome
  "welcome.heading": "Find your people",
  "welcome.accent": "before you land.",
  "welcome.subhead": "Verified students. Same destination. Same intake.",
  "welcome.cta": "Continue",
  "welcome.alt": "I already have an account →",
  "welcome.caption":
    "Free to verify. Free to find your people. We earn our keep when your parents want the dashboard.",
  "welcome.migrationToast.title": "We updated how corridors work",
  "welcome.migrationToast.body":
    "Your re-sign-in takes 60 seconds and you'll get the new what-scares-you-most question.",

  // O2 Phone
  "phone.heading": "Your mobile.",
  "phone.accent": "The first check.",
  "phone.label": "Mobile number",
  "phone.placeholder": "10-digit Indian mobile",
  "phone.cta": "Send code",
  "phone.error.invalid": "Enter a valid 10-digit Indian mobile.",

  // O3 OTP
  "otp.heading": "Six digits.",
  "otp.accent": "We sent them to {{masked}}.",
  "otp.error.invalid": "Wrong code. Try again.",
  "otp.resend": "Resend in {{seconds}}s",
  "otp.resendNow": "Resend code",

  // O3a Scared (v6 NEW)
  "scared.heading": "What scares you most",
  "scared.accent": "about September?",
  "scared.placeholder":
    "The visa interview. The first 48 hours. Money. Anything.",
  "scared.cta": "Send",
  "scared.skip": "Skip",
  "scared.note":
    "We read every one. We don't share them. They shape what your corridor talks about in the first week.",

  // O4 You (city picker + profile)
  "you.heading": "Tell us about you.",
  "you.accent": "Three quick fields.",
  "you.firstName": "First name",
  "you.email": "Email (optional)",
  "you.dobMonth": "Birth month",
  "you.homeCity": "Home city",
  "you.homeCity.placeholder": "Search 80+ Indian cities",
  "you.cta": "Continue",

  // O5 Corridor wizard (post-RC step 0)
  "corridor.rc.heading": "Is this your first time",
  "corridor.rc.accent": "studying abroad?",
  "corridor.rc.firstTime": "Yes, first time",
  "corridor.rc.recovering": "No, I've been before",
  "corridor.rc.note": "Either is fine — we tune the next steps to fit.",

  "corridor.country.heading": "Where to?",
  "corridor.country.accent": "Pick a country.",
  "corridor.country.comingSoon": "UK · Canada · Australia · Q3 2027",

  "corridor.city.heading": "Which city?",
  "corridor.uni.heading": "Which uni?",
  "corridor.intake.heading": "Which intake?",
  "corridor.cta.preview": "See your corridor",

  // O6 Preview (live corridor preview)
  "preview.heading": "Your corridor.",
  "preview.accent": "Live before you land.",
  "preview.layer2": "{{count}} verified · {{destination}} · {{intake}}",
  "preview.layer1": "{{count}} from {{homeCity}} in your hometown crew",
  "preview.layer3": "{{count}} across {{destination}} this season",
  "preview.cta": "Continue to verification",

  // O7 Identity DigiLocker
  "identity.heading": "Verify with DigiLocker.",
  "identity.accent": "We never see your Aadhaar.",
  "identity.body":
    "DigiLocker returns a one-way hash. Your number stays with the government. We bind your account to that hash so impersonation is impossible.",
  "identity.cta": "Open DigiLocker",
  "identity.note":
    "30 seconds, in-app handshake. No data leaves your device for us.",

  // O7 fallback
  "identity.fallback.aadhaar_not_linked.title": "Aadhaar not linked",
  "identity.fallback.aadhaar_not_linked.body":
    "Your phone isn't linked to your Aadhaar yet. Update at uidai.gov.in (15 min) and we'll wait — we hold your seat for 24 hours.",
  "identity.fallback.mobile_changed.title": "Mobile changed recently",
  "identity.fallback.mobile_changed.body":
    "Aadhaar shows a different mobile. Update DigiLocker first; we hold your seat for 48 hours.",
  "identity.fallback.deactivated.title": "DigiLocker deactivated",
  "identity.fallback.deactivated.body":
    "Reactivate at digilocker.gov.in. We hold your seat for 24 hours.",
  "identity.fallback.invisible_character.title": "Invisible character in name",
  "identity.fallback.invisible_character.body":
    "Aadhaar name contains a non-printable character. We escalate to admin review (4h SLA).",

  // O8 Admit intro
  "admit.intro.heading": "Your admit letter.",
  "admit.intro.accent": "The last check.",
  "admit.intro.body":
    "Upload it once. We review in 48 hours. We delete the PDF 60 minutes after review.",

  // O9 Admit upload
  "admit.upload.heading": "Upload your admit",
  "admit.upload.body": "PDF, JPG, or PNG · max 12 MB",
  "admit.upload.cta.pickFile": "Pick from files",
  "admit.upload.cta.takePhoto": "Take a photo",

  // O10 Admit pending
  "admit.pending.heading": "Reviewing your admit.",
  "admit.pending.accent": "Up to 48 hours.",
  "admit.pending.body":
    "Position {{position}} in queue. We'll notify the moment a reviewer signs off — or escalate if it takes longer than promised.",

  // O11 Admit outcome — approved
  "admit.outcome.approved.heading": "You're in.",
  "admit.outcome.approved.accent": "Welcome.",
  "admit.outcome.approved.cta": "Open my corridor",

  // O11 outcome — rejected
  "admit.outcome.rejected.heading": "Admit needs attention.",
  "admit.outcome.rejected.accent": "{{reason}}",
  "admit.outcome.rejected.cta": "Re-upload",

  // O11a Hybrid warning (v6 NEW)
  "hybrid.heading": "This is the Berlin IU",
  "hybrid.accent": "2025 risk pattern.",
  "hybrid.body":
    "Your admit letter shows a hybrid programme at a German HEI. Germany's student-visa class requires in-person attendance. Hybrid programmes have been mass-rejected post-arrival in 2025-2026 — students lost their tuition AND were deported.",
  "hybrid.continue.title": "Continue at risk",
  "hybrid.continue.body":
    "Proceed to your corridor. We'll surface visa-status check early. You accept the rejection risk.",
  "hybrid.continue.cta": "I understand · continue",
  "hybrid.withdraw.title": "Withdraw + full refund",
  "hybrid.withdraw.body":
    "We refund anything you've paid us in full. We don't earn from you taking a bad bet.",
  "hybrid.withdraw.cta": "Withdraw + refund",
  "hybrid.footer": "v15 BP §3.7 · We name the risk before you pay for it.",
};
