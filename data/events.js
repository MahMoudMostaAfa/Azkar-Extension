// ===== Islamic Events & Holidays Database =====
export const ISLAMIC_EVENTS = [
  {
    id: "ramadan_start",
    nameAr: "بداية شهر رمضان",
    nameEn: "Start of Ramadan",
    description:
      "The holy month of fasting begins. Muslims fast from dawn until sunset.",
    hijriMonth: 9,
    hijriDay: 1,
    icon: "🌙",
  },
  {
    id: "laylat_al_qadr",
    nameAr: "ليلة القدر",
    nameEn: "Laylat al-Qadr (Night of Power)",
    description:
      "The night when the Quran was first revealed, better than a thousand months.",
    hijriMonth: 9,
    hijriDay: 27,
    icon: "✨",
  },
  {
    id: "eid_al_fitr",
    nameAr: "عيد الفطر",
    nameEn: "Eid al-Fitr",
    description:
      "The festival of breaking the fast, celebrated at the end of Ramadan.",
    hijriMonth: 10,
    hijriDay: 1,
    icon: "🎉",
  },
  {
    id: "day_of_arafah",
    nameAr: "يوم عرفة",
    nameEn: "Day of Arafah",
    description:
      "The day of standing on Mount Arafah during Hajj. Fasting on this day expiates sins.",
    hijriMonth: 12,
    hijriDay: 9,
    icon: "⛰️",
  },
  {
    id: "eid_al_adha",
    nameAr: "عيد الأضحى",
    nameEn: "Eid al-Adha",
    description:
      "The festival of sacrifice, commemorating Ibrahim's willingness to sacrifice his son.",
    hijriMonth: 12,
    hijriDay: 10,
    icon: "🐑",
  },
  {
    id: "islamic_new_year",
    nameAr: "رأس السنة الهجرية",
    nameEn: "Islamic New Year",
    description:
      "The first day of Muharram, the first month of the Islamic calendar.",
    hijriMonth: 1,
    hijriDay: 1,
    icon: "🗓️",
  },
  {
    id: "ashura",
    nameAr: "يوم عاشوراء",
    nameEn: "Day of Ashura",
    description:
      "The 10th of Muharram. Fasting this day expiates sins of the previous year.",
    hijriMonth: 1,
    hijriDay: 10,
    icon: "📿",
  },
  {
    id: "mawlid",
    nameAr: "المولد النبوي الشريف",
    nameEn: "Prophet's Birthday (Mawlid)",
    description: "The birthday of Prophet Muhammad ﷺ.",
    hijriMonth: 3,
    hijriDay: 12,
    icon: "🕌",
  },
  {
    id: "isra_miraj",
    nameAr: "الإسراء والمعراج",
    nameEn: "Isra and Mi'raj",
    description: "The night journey and ascension of Prophet Muhammad ﷺ.",
    hijriMonth: 7,
    hijriDay: 27,
    icon: "🌌",
  },
  {
    id: "shaban_15",
    nameAr: "ليلة النصف من شعبان",
    nameEn: "Mid-Sha'ban",
    description: "The middle of Sha'ban, a night for prayer and supplication.",
    hijriMonth: 8,
    hijriDay: 15,
    icon: "🌕",
  },
  {
    id: "white_days_1",
    nameAr: "الأيام البيض",
    nameEn: "White Days (13th-15th of each month)",
    description:
      "Fasting on the 13th, 14th, and 15th of each Hijri month is recommended.",
    hijriMonth: 0, // Every month
    hijriDay: 13,
    icon: "⚪",
    recurring: true,
  },
  {
    id: "monday_thursday",
    nameAr: "صيام الاثنين والخميس",
    nameEn: "Monday & Thursday Fasting",
    description: "The Prophet ﷺ used to fast on Mondays and Thursdays.",
    hijriMonth: 0,
    hijriDay: 0,
    icon: "📅",
    recurring: true,
    weekDays: [1, 4], // Monday and Thursday
  },
];

// Hijri month names
export const HIJRI_MONTHS = {
  1: { ar: "محرم", en: "Muharram" },
  2: { ar: "صفر", en: "Safar" },
  3: { ar: "ربيع الأول", en: "Rabi al-Awwal" },
  4: { ar: "ربيع الثاني", en: "Rabi al-Thani" },
  5: { ar: "جمادى الأولى", en: "Jumada al-Ula" },
  6: { ar: "جمادى الآخرة", en: "Jumada al-Thani" },
  7: { ar: "رجب", en: "Rajab" },
  8: { ar: "شعبان", en: "Sha'ban" },
  9: { ar: "رمضان", en: "Ramadan" },
  10: { ar: "شوال", en: "Shawwal" },
  11: { ar: "ذو القعدة", en: "Dhul Qi'dah" },
  12: { ar: "ذو الحجة", en: "Dhul Hijjah" },
};
