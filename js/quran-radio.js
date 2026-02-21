// ===== Quran Radio Module =====
// Uses mp3quran.net API v3 for live Quran radio streams

const API_BASE = "https://mp3quran.net/api/v3";

/**
 * Popular reciters with their radio stream URLs (fallback data)
 * These are the most well-known and beloved Quran reciters worldwide
 */
const POPULAR_RECITERS = [
  {
    id: 32,
    name_ar: "عبد الباسط عبد الصمد",
    name_en: "Abdul Basit Abdul Samad",
    url: "https://backup.qurango.net/radio/abdulbasit_abdulsamad",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 79,
    name_ar: "مشاري راشد العفاسي",
    name_en: "Mishary Rashid Alafasy",
    url: "https://backup.qurango.net/radio/mishary_alafasi",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 63,
    name_ar: "ماهر المعيقلي",
    name_en: "Maher Al Muaiqly",
    url: "https://backup.qurango.net/radio/maher",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 18,
    name_ar: "سعود الشريم",
    name_en: "Saud Al-Shuraim",
    url: "https://backup.qurango.net/radio/saud_alshuraim",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 33,
    name_ar: "عبد الرحمن السديس",
    name_en: "Abdul Rahman Al-Sudais",
    url: "https://backup.qurango.net/radio/abdulrahman_alsudaes",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 17,
    name_ar: "سعد الغامدي",
    name_en: "Saad Al-Ghamdi",
    url: "https://backup.qurango.net/radio/saad_alghamdi",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 3,
    name_ar: "أحمد العجمي",
    name_en: "Ahmed Al-Ajmi",
    url: "https://backup.qurango.net/radio/ahmad_alajmy",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 58,
    name_ar: "ياسر الدوسري",
    name_en: "Yasser Al-Dosari",
    url: "https://backup.qurango.net/radio/yasser_aldosari",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 109078,
    name_ar: "هزاع البلوشي",
    name_en: "Hazza Al Balushi",
    url: "https://backup.qurango.net/radio/hazza",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 52,
    name_ar: "فارس عباد",
    name_en: "Fares Abbad",
    url: "https://backup.qurango.net/radio/fares_abbad",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 53,
    name_ar: "ناصر القطامي",
    name_en: "Nasser Al Qatami",
    url: "https://backup.qurango.net/radio/nasser_alqatami",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 217,
    name_ar: "بندر بليلة",
    name_en: "Bandar Baleela",
    url: "https://backup.qurango.net/radio/bandar_balilah",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 74,
    name_ar: "محمود خليل الحصري",
    name_en: "Mahmoud Khalil Al-Husary",
    url: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 69,
    name_ar: "محمد صديق المنشاوي",
    name_en: "Mohamed Siddiq Al-Minshawi",
    url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 38,
    name_ar: "عبدالله عواد الجهني",
    name_en: "Abdullah Awad Al-Juhani",
    url: "https://backup.qurango.net/radio/abdullah_aljohany",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
  {
    id: 117,
    name_ar: "خالد الجليل",
    name_en: "Khalid Al-Jaleel",
    url: "https://backup.qurango.net/radio/khalid_aljileel",
    img: "🎙️",
    style_ar: "مرتل",
    style_en: "Murattal",
  },
];

/**
 * Fetch radio stations from mp3quran.net API
 * @param {string} lang - Language code ('ar' or 'eng')
 * @returns {Promise<Array>} - Array of radio station objects
 */
export async function fetchRadioStations(lang = "ar") {
  try {
    const apiLang = lang === "ar" || lang === "ur" ? "ar" : "eng";
    const response = await fetch(`${API_BASE}/radios?language=${apiLang}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data && data.radios && data.radios.length > 0) {
      return data.radios.map((r) => ({
        id: r.id,
        name: r.name,
        url: r.url,
        img: "📻",
      }));
    }
    return [];
  } catch (e) {
    console.warn("[QuranRadio] API fetch failed, using fallback:", e);
    return [];
  }
}

/**
 * Get the popular reciters list (always available offline)
 * @returns {Array}
 */
export function getPopularReciters() {
  return POPULAR_RECITERS;
}

/**
 * Get combined radio data: popular reciters + API stations
 * @param {string} lang
 * @returns {Promise<{popular: Array, stations: Array}>}
 */
export async function getRadioData(lang = "ar") {
  const popular = POPULAR_RECITERS;
  let stations = [];
  try {
    stations = await fetchRadioStations(lang);
  } catch (e) {
    // fallback - just use popular
  }
  return { popular, stations };
}
