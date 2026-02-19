// ===== Internationalization (i18n) Module =====
// Handles all UI translation for multi-language support

/**
 * Complete translations for all supported languages
 */
export const UI_TRANSLATIONS = {
  en: {
    // Header
    appTitle: "📿 Muslim Azkar",
    settings: "Settings",

    // Navigation tabs
    tabHome: "🏠 Home",
    tabCategories: "📂 Categories",
    tabProgress: "📊 Progress",
    tabEvents: "🕌 Events",
    tabCustom: "✏️ Custom",

    // Prayer times
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",

    // Stats
    today: "Today",
    streak: "🔥 Streak",
    total: "Total",

    // Dhikr card
    times: "times",
    timeSuffix: "time(s)",
    count: "Count",
    reset: "Reset",
    listen: "🔊 Listen",
    stopAudio: "⏸️ Stop",
    share: "📤 Share",
    nextDhikr: "➡️ Next Dhikr",

    // Quick browse
    quickBrowse: "Quick Browse",

    // Reminder
    autoReminder: "🔔 Auto Reminder",
    every: "Every:",
    min2: "2 minutes",
    min5: "5 minutes",
    min10: "10 minutes",
    min15: "15 minutes",
    min30: "30 minutes",
    hour1: "1 hour",
    hour2: "2 hours",

    // Categories
    morning: "Morning Azkar",
    evening: "Evening Azkar",
    afterPrayer: "After Prayer Azkar",
    sleep: "Sleep Azkar",
    forgiveness: "Seeking Forgiveness",
    protection: "Protection Azkar",
    general: "General Dhikr",
    dua: "Supplications (Dua)",
    travel: "Travel Azkar",
    food: "Food Azkar",
    azkarCount: "azkar",
    backToCategories: "← Back to Categories",

    // Progress
    progressOverview: "📊 Overview",
    thisWeek: "This Week",
    thisMonth: "This Month",
    consecutiveDays: "Consecutive Days",
    last7Days: "Last 7 Days",
    tipsTitle: "💡 Tips for Spiritual Growth",

    // Events
    islamicEvents: "🕌 Islamic Events",

    // Custom Azkar
    customAzkar: "✏️ Custom Azkar",
    arabicText: "Arabic Text",
    writeHere: "Write the dhikr here...",
    transliterationOpt: "Transliteration (optional)",
    translationOpt: "Translation (optional)",
    sourceOpt: "Source (optional)",
    repeatCount: "Repeat Count",
    addCustomDhikr: "➕ Add Custom Dhikr",
    noCustomYet: "No custom azkar yet",
    deleteBtn: "🗑️ Delete",

    // Share modal
    shareTitle: "📤 Share Dhikr",
    close: "Close",
    copyText: "📋 Copy Text",

    // Toast messages
    completed: "✅ Masha'Allah! You completed this dhikr",
    noArabicVoice:
      "⚠️ No Arabic voice available - try installing Arabic language pack",
    speechNotSupported: "⚠️ Speech not supported in this browser",
    copiedText: "📋 Text copied",
    addedCustom: "✅ Custom dhikr added",
    deletedCustom: "🗑️ Dhikr deleted",
    enterArabicText: "❌ Please enter Arabic text",

    // Day names
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",

    // Insights
    insights: [
      'Whoever says "SubhanAllahi wa bihamdihi" 100 times a day, his sins will be forgiven even if they were like the foam of the sea - Sahih Al-Bukhari',
      "The most beloved words to Allah are four: SubhanAllah, Alhamdulillah, La ilaha illAllah, Allahu Akbar - Sahih Muslim",
      "Whoever persists in seeking forgiveness, Allah will provide a way out of every difficulty - Abu Dawud",
      "The closest a servant is to his Lord is during prostration, so increase your supplications - Sahih Muslim",
      "Dhikr pleases the Most Merciful, drives away Satan, removes anxiety and brings joy and happiness",
      "Continue remembering Allah daily to maintain your streak. Every day of dhikr is a step towards spiritual growth!",
      "Try to complete morning and evening azkar daily. They are a fortress for the Muslim against all evil.",
      "Consistency in good deeds is more beloved to Allah than their quantity. A little done regularly is better than a lot done intermittently.",
    ],
    streakInsight: "🎉 Masha'Allah! You've been consistent for {count} days. ",
    todayInsight: "Well done! You completed {count} azkar today. ",
    startInsight: "Start your day with Azkar! ",

    // Source prefix
    sourcePrefix: "📖 ",
    repeatPrefix: "🔁 ",
  },

  ar: {
    // Header
    appTitle: "📿 أذكار المسلم",
    settings: "الإعدادات",

    // Navigation tabs
    tabHome: "🏠 الرئيسية",
    tabCategories: "📂 التصنيفات",
    tabProgress: "📊 التقدم",
    tabEvents: "🕌 المناسبات",
    tabCustom: "✏️ مخصص",

    // Prayer times
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",

    // Stats
    today: "اليوم",
    streak: "🔥 استمرارية",
    total: "الإجمالي",

    // Dhikr card
    times: "مرة",
    timeSuffix: "مرة",
    count: "سبّح",
    reset: "إعادة",
    listen: "🔊 استمع",
    stopAudio: "⏸️ إيقاف",
    share: "📤 مشاركة",
    nextDhikr: "⬅️ الذكر التالي",

    // Quick browse
    quickBrowse: "تصفح سريع",

    // Reminder
    autoReminder: "🔔 التذكير التلقائي",
    every: "كل:",
    min2: "٢ دقائق",
    min5: "٥ دقائق",
    min10: "١٠ دقائق",
    min15: "١٥ دقيقة",
    min30: "٣٠ دقيقة",
    hour1: "ساعة",
    hour2: "ساعتين",

    // Categories
    morning: "أذكار الصباح",
    evening: "أذكار المساء",
    afterPrayer: "أذكار بعد الصلاة",
    sleep: "أذكار النوم",
    forgiveness: "أذكار الاستغفار",
    protection: "أذكار الحماية",
    general: "أذكار عامة",
    dua: "أدعية",
    travel: "أذكار السفر",
    food: "أذكار الطعام",
    azkarCount: "أذكار",
    backToCategories: "→ العودة للتصنيفات",

    // Progress
    progressOverview: "📊 نظرة عامة",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    consecutiveDays: "أيام متتالية",
    last7Days: "آخر ٧ أيام",
    tipsTitle: "💡 نصائح للتطور الروحي",

    // Events
    islamicEvents: "🕌 المناسبات الإسلامية",

    // Custom Azkar
    customAzkar: "✏️ أذكار مخصصة",
    arabicText: "النص العربي",
    writeHere: "اكتب الذكر هنا...",
    transliterationOpt: "النطق (اختياري)",
    translationOpt: "الترجمة (اختياري)",
    sourceOpt: "المصدر (اختياري)",
    repeatCount: "عدد التكرار",
    addCustomDhikr: "➕ إضافة ذكر مخصص",
    noCustomYet: "لا يوجد أذكار مخصصة بعد",
    deleteBtn: "🗑️ حذف",

    // Share modal
    shareTitle: "📤 مشاركة الذكر",
    close: "إغلاق",
    copyText: "📋 نسخ النص",

    // Toast messages
    completed: "✅ ما شاء الله! أتممت هذا الذكر",
    noArabicVoice: "⚠️ لا يتوفر صوت عربي - حاول تثبيت حزمة اللغة العربية",
    speechNotSupported: "⚠️ المتصفح لا يدعم النطق",
    copiedText: "📋 تم نسخ النص",
    addedCustom: "✅ تمت إضافة الذكر المخصص",
    deletedCustom: "🗑️ تم حذف الذكر",
    enterArabicText: "❌ يرجى كتابة النص العربي",

    // Day names
    sun: "أحد",
    mon: "اثنين",
    tue: "ثلاثاء",
    wed: "أربعاء",
    thu: "خميس",
    fri: "جمعة",
    sat: "سبت",

    // Insights
    insights: [
      "من قال سبحان الله وبحمده في يوم مائة مرة حُطّت خطاياه وإن كانت مثل زبد البحر - صحيح البخاري",
      "أحب الكلام إلى الله أربع: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر - صحيح مسلم",
      "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً ومن كل هم فرجاً - سنن أبي داود",
      "أقرب ما يكون العبد من ربه وهو ساجد فأكثروا الدعاء - صحيح مسلم",
      "الذكر يرضي الرحمن ويطرد الشيطان ويزيل الهم والغم ويجلب الفرح والسرور",
      "استمر في ذكر الله يومياً لتحافظ على سلسلة الاستمرارية. كل يوم ذكر هو خطوة نحو التطور الروحي!",
      "حاول أن تُتِمَّ أذكار الصباح والمساء يومياً. فهي حصن للمسلم من كل شر.",
      "المداومة على الأعمال الصالحة أحب إلى الله من كثرتها. قليل دائم خير من كثير منقطع.",
    ],
    streakInsight: "🎉 ما شاء الله! أنت مستمر منذ {count} أيام. ",
    todayInsight: "أحسنت! أكملت {count} أذكار اليوم. ",
    startInsight: "ابدأ يومك بالأذكار! ",

    // Source prefix
    sourcePrefix: "📖 ",
    repeatPrefix: "🔁 ",
  },

  fr: {
    appTitle: "📿 Azkar du Musulman",
    settings: "Paramètres",
    tabHome: "🏠 Accueil",
    tabCategories: "📂 Catégories",
    tabProgress: "📊 Progrès",
    tabEvents: "🕌 Événements",
    tabCustom: "✏️ Personnalisé",
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    today: "Aujourd'hui",
    streak: "🔥 Série",
    total: "Total",
    times: "fois",
    timeSuffix: "fois",
    count: "Compter",
    reset: "Réinitialiser",
    listen: "🔊 Écouter",
    stopAudio: "⏸️ Arrêter",
    share: "📤 Partager",
    nextDhikr: "➡️ Dhikr suivant",
    quickBrowse: "Parcourir",
    autoReminder: "🔔 Rappel automatique",
    every: "Chaque:",
    min2: "2 minutes",
    min5: "5 minutes",
    min10: "10 minutes",
    min15: "15 minutes",
    min30: "30 minutes",
    hour1: "1 heure",
    hour2: "2 heures",
    morning: "Azkar du Matin",
    evening: "Azkar du Soir",
    afterPrayer: "Après la Prière",
    sleep: "Azkar du Sommeil",
    forgiveness: "Demande de Pardon",
    protection: "Azkar de Protection",
    general: "Dhikr Général",
    dua: "Invocations",
    travel: "Azkar du Voyage",
    food: "Azkar du Repas",
    azkarCount: "azkar",
    backToCategories: "← Retour aux catégories",
    progressOverview: "📊 Aperçu",
    thisWeek: "Cette Semaine",
    thisMonth: "Ce Mois",
    consecutiveDays: "Jours consécutifs",
    last7Days: "7 derniers jours",
    tipsTitle: "💡 Conseils de croissance spirituelle",
    islamicEvents: "🕌 Événements islamiques",
    customAzkar: "✏️ Azkar personnalisés",
    arabicText: "Texte arabe",
    writeHere: "Écrivez le dhikr ici...",
    transliterationOpt: "Translittération (optionnel)",
    translationOpt: "Traduction (optionnel)",
    sourceOpt: "Source (optionnel)",
    repeatCount: "Nombre de répétitions",
    addCustomDhikr: "➕ Ajouter un dhikr",
    noCustomYet: "Aucun azkar personnalisé",
    deleteBtn: "🗑️ Supprimer",
    shareTitle: "📤 Partager le dhikr",
    close: "Fermer",
    copyText: "📋 Copier",
    completed: "✅ Masha'Allah ! Dhikr terminé",
    noArabicVoice: "⚠️ Pas de voix arabe disponible",
    speechNotSupported: "⚠️ Synthèse vocale non supportée",
    copiedText: "📋 Texte copié",
    addedCustom: "✅ Dhikr ajouté",
    deletedCustom: "🗑️ Dhikr supprimé",
    enterArabicText: "❌ Veuillez entrer le texte arabe",
    sun: "Dim",
    mon: "Lun",
    tue: "Mar",
    wed: "Mer",
    thu: "Jeu",
    fri: "Ven",
    sat: "Sam",
    insights: [
      'Quiconque dit "SubhanAllahi wa bihamdihi" 100 fois par jour, ses péchés seront pardonnés.',
      "Les paroles les plus aimées d'Allah sont: SubhanAllah, Alhamdulillah, La ilaha illAllah, Allahu Akbar.",
      "Quiconque persiste dans l'istighfar, Allah lui ouvrira une issue à chaque difficulté.",
      "Le serviteur est le plus proche de son Seigneur lors de la prosternation.",
    ],
    streakInsight: "🎉 Masha'Allah ! Vous êtes régulier depuis {count} jours. ",
    todayInsight: "Bravo ! Vous avez complété {count} azkar aujourd'hui. ",
    startInsight: "Commencez votre journée avec les Azkar ! ",
    sourcePrefix: "📖 ",
    repeatPrefix: "🔁 ",
  },

  ur: {
    appTitle: "📿 مسلم اذکار",
    settings: "ترتیبات",
    tabHome: "🏠 ہوم",
    tabCategories: "📂 زمرے",
    tabProgress: "📊 پیشرفت",
    tabEvents: "🕌 تقریبات",
    tabCustom: "✏️ مخصوص",
    fajr: "فجر",
    dhuhr: "ظہر",
    asr: "عصر",
    maghrib: "مغرب",
    isha: "عشاء",
    today: "آج",
    streak: "🔥 تسلسل",
    total: "کل",
    times: "مرتبہ",
    timeSuffix: "مرتبہ",
    count: "تسبیح",
    reset: "دوبارہ",
    listen: "🔊 سنیں",
    stopAudio: "⏸️ بند کریں",
    share: "📤 شیئر",
    nextDhikr: "⬅️ اگلا ذکر",
    quickBrowse: "فوری براؤز",
    autoReminder: "🔔 خودکار یاددہانی",
    every: "ہر:",
    min2: "٢ منٹ",
    min5: "٥ منٹ",
    min10: "١٠ منٹ",
    min15: "١٥ منٹ",
    min30: "٣٠ منٹ",
    hour1: "ایک گھنٹہ",
    hour2: "دو گھنٹے",
    morning: "صبح کے اذکار",
    evening: "شام کے اذکار",
    afterPrayer: "نماز کے بعد",
    sleep: "سونے کے اذکار",
    forgiveness: "استغفار",
    protection: "حفاظت کے اذکار",
    general: "عام ذکر",
    dua: "دعائیں",
    travel: "سفر کے اذکار",
    food: "کھانے کے اذکار",
    azkarCount: "اذکار",
    backToCategories: "→ زمروں پر واپس",
    progressOverview: "📊 جائزہ",
    thisWeek: "اس ہفتے",
    thisMonth: "اس مہینے",
    consecutiveDays: "مسلسل دن",
    last7Days: "پچھلے ٧ دن",
    tipsTitle: "💡 روحانی ترقی کے مشورے",
    islamicEvents: "🕌 اسلامی تقریبات",
    customAzkar: "✏️ مخصوص اذکار",
    arabicText: "عربی متن",
    writeHere: "یہاں ذکر لکھیں...",
    transliterationOpt: "تلفظ (اختیاری)",
    translationOpt: "ترجمہ (اختیاری)",
    sourceOpt: "ماخذ (اختیاری)",
    repeatCount: "تکرار کی تعداد",
    addCustomDhikr: "➕ مخصوص ذکر شامل کریں",
    noCustomYet: "ابھی کوئی مخصوص اذکار نہیں",
    deleteBtn: "🗑️ حذف",
    shareTitle: "📤 ذکر شیئر کریں",
    close: "بند",
    copyText: "📋 کاپی",
    completed: "✅ ماشاء اللہ! آپ نے یہ ذکر مکمل کیا",
    noArabicVoice: "⚠️ عربی آواز دستیاب نہیں",
    speechNotSupported: "⚠️ اس براؤزر میں تقریر معاون نہیں",
    copiedText: "📋 متن کاپی ہوگیا",
    addedCustom: "✅ مخصوص ذکر شامل ہوگیا",
    deletedCustom: "🗑️ ذکر حذف ہوگیا",
    enterArabicText: "❌ عربی متن درج کریں",
    sun: "اتوار",
    mon: "پیر",
    tue: "منگل",
    wed: "بدھ",
    thu: "جمعرات",
    fri: "جمعہ",
    sat: "ہفتہ",
    insights: [
      "جو شخص سبحان اللہ وبحمدہ روزانہ سو مرتبہ کہے اس کے گناہ معاف ہو جائیں گے۔",
      "اللہ کو سب سے زیادہ محبوب کلمات: سبحان اللہ، الحمد للہ، لا إله إلا اللہ، اللہ اکبر۔",
    ],
    streakInsight: "🎉 ماشاء اللہ! آپ {count} دنوں سے مسلسل ہیں۔ ",
    todayInsight: "شاباش! آج آپ نے {count} اذکار مکمل کیے۔ ",
    startInsight: "اپنا دن اذکار سے شروع کریں! ",
    sourcePrefix: "📖 ",
    repeatPrefix: "🔁 ",
  },
};

/**
 * Get a translation string
 * @param {string} key - Translation key
 * @param {string} lang - Language code
 * @returns {string}
 */
export function t(key, lang = "ar") {
  const translations = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;
  return translations[key] || UI_TRANSLATIONS.en[key] || key;
}

/**
 * Apply translations to all elements with data-i18n attribute
 * @param {string} lang - Language code
 * @param {Document|Element} root - Root element to search within
 */
export function applyTranslations(lang, root = document) {
  const elements = root.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key, lang);
    if (value && value !== key) {
      el.textContent = value;
    }
  });

  // Also handle placeholder translations
  const placeholders = root.querySelectorAll("[data-i18n-placeholder]");
  placeholders.forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = t(key, lang);
    if (value && value !== key) {
      el.placeholder = value;
    }
  });

  // Handle title translations
  const titles = root.querySelectorAll("[data-i18n-title]");
  titles.forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const value = t(key, lang);
    if (value && value !== key) {
      el.title = value;
    }
  });
}

/**
 * Update document direction and language attribute
 * @param {string} lang
 */
export function applyLanguageDirection(lang) {
  const isRTL = lang === "ar" || lang === "ur";
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.body.classList.toggle("ltr", !isRTL);
  document.body.classList.toggle("rtl", isRTL);
}
