/**
 * HI · onboarding namespace (partial per v6 §20).
 *
 * Translates the v6-critical and high-frequency onboarding strings.
 * Missing keys fall back to EN via the resolver in src/index.ts.
 *
 * Translator note: per the v15 user-heart language, prefer warm direct
 * Hindi over formal Sanskritised vocabulary. Use everyday register.
 */
export const copy: Record<string, string> = {
  // O1 Welcome
  "welcome.heading": "अपने लोग ढूंढो",
  "welcome.accent": "उतरने से पहले।",
  "welcome.subhead":
    "वेरिफाइड स्टूडेंट्स। एक ही डेस्टिनेशन। एक ही इनटेक।",
  "welcome.cta": "आगे बढ़ो",
  "welcome.alt": "मेरा अकाउंट पहले से है →",
  "welcome.caption":
    "वेरिफाई करना मुफ्त। अपने लोग ढूंढना मुफ्त। हम तब कमाते हैं जब आपके पैरेंट्स को डैशबोर्ड चाहिए।",
  "welcome.migrationToast.title": "हमने corridors का तरीका बदला है",
  "welcome.migrationToast.body":
    "दोबारा साइन इन करने में 60 सेकंड लगेंगे और आपको नया 'सबसे ज्यादा क्या डर लगता है' सवाल मिलेगा।",

  // O2 Phone
  "phone.heading": "आपका मोबाइल।",
  "phone.accent": "पहली जांच।",
  "phone.label": "मोबाइल नंबर",
  "phone.placeholder": "10 अंकों का भारतीय मोबाइल",
  "phone.cta": "कोड भेजो",
  "phone.error.invalid": "10 अंकों का सही भारतीय मोबाइल डालें।",

  // O3 OTP
  "otp.heading": "छह अंक।",
  "otp.accent": "हमने {{masked}} पर भेजे हैं।",
  "otp.error.invalid": "गलत कोड। फिर कोशिश करें।",
  "otp.resend": "{{seconds}}s में दोबारा भेजें",
  "otp.resendNow": "कोड दोबारा भेजें",

  // O3a Scared (v6 NEW)
  "scared.heading": "सितंबर के बारे में सबसे ज्यादा",
  "scared.accent": "क्या डर लगता है?",
  "scared.placeholder":
    "वीसा इंटरव्यू। पहले 48 घंटे। पैसे। कुछ भी।",
  "scared.cta": "भेजो",
  "scared.skip": "छोड़ें",
  "scared.note":
    "हम हर एक पढ़ते हैं। शेयर नहीं करते। पहले हफ्ते में आपका corridor किस बारे में बात करेगा, ये उसे आकार देता है।",

  // O4 You
  "you.heading": "अपने बारे में बताओ।",
  "you.accent": "तीन छोटे फील्ड्स।",
  "you.firstName": "पहला नाम",
  "you.email": "ईमेल (वैकल्पिक)",
  "you.dobMonth": "जन्म महीना",
  "you.homeCity": "घर का शहर",
  "you.homeCity.placeholder": "80+ भारतीय शहरों में खोजें",
  "you.cta": "आगे बढ़ो",

  // O5 Corridor wizard (post-RC step 0)
  "corridor.rc.heading": "क्या यह आपकी पहली बार",
  "corridor.rc.accent": "विदेश में पढ़ाई है?",
  "corridor.rc.firstTime": "हाँ, पहली बार",
  "corridor.rc.recovering": "नहीं, मैं पहले गया हूँ",
  "corridor.rc.note":
    "दोनों ठीक हैं — हम अगले स्टेप्स को आपके मुताबिक तय करेंगे।",

  "corridor.country.heading": "कहाँ जाना है?",
  "corridor.country.accent": "देश चुनो।",
  "corridor.country.comingSoon": "UK · Canada · Australia · Q3 2027",

  "corridor.city.heading": "कौन सा शहर?",
  "corridor.uni.heading": "कौन सी यूनिवर्सिटी?",
  "corridor.intake.heading": "कौन सा इनटेक?",
  "corridor.cta.preview": "अपना corridor देखो",

  // O11a Hybrid warning (v6 NEW)
  "hybrid.heading": "ये बर्लिन IU 2025",
  "hybrid.accent": "जोखिम पैटर्न है।",
  "hybrid.body":
    "आपका एडमिट लेटर एक जर्मन HEI में हाइब्रिड प्रोग्राम दिखा रहा है। जर्मनी का स्टूडेंट-वीसा क्लास इन-पर्सन हाजिरी मांगता है। हाइब्रिड प्रोग्राम्स को 2025-2026 में पहुँचने के बाद बड़े पैमाने पर रिजेक्ट किया गया है — स्टूडेंट्स ने ट्यूशन भी खोई और डिपोर्ट भी हुए।",
  "hybrid.continue.title": "जोखिम के साथ आगे बढ़ें",
  "hybrid.continue.body":
    "अपने corridor पर जाएं। हम वीसा-स्टेटस चेक जल्दी सामने लाएंगे। आप रिजेक्शन का जोखिम मानते हैं।",
  "hybrid.continue.cta": "मैं समझ गया · आगे बढ़ें",
  "hybrid.withdraw.title": "वापस लें + पूरा रिफंड",
  "hybrid.withdraw.body":
    "जो भी आपने हमें दिया है, हम पूरा रिफंड करेंगे। हम आपके बुरे फैसले से नहीं कमाते।",
  "hybrid.withdraw.cta": "वापस लें + रिफंड",
  "hybrid.footer":
    "v15 BP §3.7 · हम जोखिम का नाम लेते हैं — आपके पैसे देने से पहले।",
};
