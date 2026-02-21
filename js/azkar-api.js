// ===== Azkar API Service Module =====
// Fetches azkar data with audio from external API
// Uses https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json
// Falls back to local data/azkar.js when offline

const API_URL =
  "https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json";
const AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/rn0x/Adhkar-json/main";
const CACHE_KEY = "cachedAzkarAPI";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Category mapping: Arabic API category names → our internal keys
 * API categories are in Arabic; we map them to our English-key system
 */
const CATEGORY_MAP = {
  "أذكار الصباح والمساء": ["morning", "evening"],
  "أذكار النوم": ["sleep"],
  "أذكار الاستيقاظ من النوم": ["wakeup"],
  "الأذكار بعد السلام من الصلاة": ["afterPrayer"],
  "أذكار الآذان": ["adhan"],
  "الاستغفار و التوبة": ["forgiveness"],
  "ما يقول لرد كيد مردة الشياطين": ["protection"],
  "فضل التسبيح و التحميد، و التهليل، و التكبير": ["general"],
  "دعاء الهم والحزن": ["dua"],
  "دعاء الكرب": ["dua"],
  "دعاء السفر": ["travel"],
  "الدعاء قبل الطعام": ["food"],
  "الدعاء عند الفراغ من الطعام": ["food"],
  "دعاء دخول المسجد": ["mosque"],
  "دعاء الخروج من المسجد": ["mosque"],
  "الذكر عند الخروج من المنزل": ["general"],
  "الذكر عند دخول المنزل": ["general"],
  "دعاء الركوب": ["travel"],
  "دعاء المسافر للمقيم": ["travel"],
  "دعاء المقيم للمسافر": ["travel"],
  "دعاء دخول السوق": ["general"],
  "دعاء الريح": ["dua"],
  "دعاء الرعد": ["dua"],
  "الدعاء إذا نزل المطر": ["dua"],
  "دعاء رؤية الهلال": ["dua"],
  "الدعاء عند إفطار الصائم": ["dua"],
  "دعاء الاستفتاح": ["afterPrayer"],
  "دعاء الركوع": ["afterPrayer"],
  "دعاء السجود": ["afterPrayer"],
  "دعاء الغضب": ["dua"],
  "دعاء من رأى مبتلى": ["dua"],
  "دعاء المريض في عيادته": ["dua"],
  "ما يعوذ به الأولاد": ["protection"],
  "كفارة اﻟﻤﺠلس": ["general"],
  "الدعاء لمن صنع إليك معروفا": ["dua"],
  "دعاء الخوف من الشرك": ["protection"],
  "ما يقال للكافر إذا عطس فحمد الله": ["general"],
  "دعاء العطاس": ["general"],
  "الدعاء للمتزوج": ["dua"],
  "دعاء صلاة الاستخارة": ["dua"],
  "دعاء قنوت الوتر": ["dua"],
  "الذكر عقب السلام من الوتر": ["afterPrayer"],
  "ما يقول من أتاه أمر يسره أو يكرهه": ["general"],
  "فضل الصلاة على النبي صلى الله عليه و سلم": ["general"],
  "من أنواع الخير والآداب الجامعة": ["general"],
  "دعاء الوسوسة في الصلاة و القراءة": ["protection"],
  "ما يقول ويفعل من أذنب ذنبا": ["forgiveness"],
  "دعاء طرد الشيطان و وساوسه": ["protection"],
  "دعاء من أصابه وسوسة في الإيمان": ["protection"],
  "دعاء لقاء العدو و ذي السلطان": ["dua"],
  "دعاء من خاف ظلم السلطان": ["dua"],
  "الدعاء على العدو": ["dua"],
  "ما يقول من خاف قوما": ["protection"],
  "دعاء قضاء الدين": ["dua"],
  "دعاء من استصعب عليه أمر": ["dua"],
};

/**
 * Enhanced category metadata with API support
 */
export const API_CATEGORIES = {
  morning: {
    id: "morning",
    nameAr: "أذكار الصباح",
    nameEn: "Morning Azkar",
    icon: "☀️",
    color: "#FF9800",
  },
  evening: {
    id: "evening",
    nameAr: "أذكار المساء",
    nameEn: "Evening Azkar",
    icon: "🌙",
    color: "#3F51B5",
  },
  afterPrayer: {
    id: "afterPrayer",
    nameAr: "أذكار بعد الصلاة",
    nameEn: "After Prayer",
    icon: "🕌",
    color: "#4CAF50",
  },
  sleep: {
    id: "sleep",
    nameAr: "أذكار النوم",
    nameEn: "Sleep Azkar",
    icon: "🌜",
    color: "#1A237E",
  },
  forgiveness: {
    id: "forgiveness",
    nameAr: "الاستغفار والتوبة",
    nameEn: "Forgiveness",
    icon: "🤲",
    color: "#009688",
  },
  protection: {
    id: "protection",
    nameAr: "أذكار الحماية",
    nameEn: "Protection",
    icon: "🛡️",
    color: "#F44336",
  },
  general: {
    id: "general",
    nameAr: "أذكار عامة",
    nameEn: "General Dhikr",
    icon: "📿",
    color: "#795548",
  },
  dua: {
    id: "dua",
    nameAr: "أدعية",
    nameEn: "Supplications",
    icon: "🕊️",
    color: "#E91E63",
  },
  travel: {
    id: "travel",
    nameAr: "أذكار السفر",
    nameEn: "Travel Azkar",
    icon: "✈️",
    color: "#00BCD4",
  },
  food: {
    id: "food",
    nameAr: "أذكار الطعام",
    nameEn: "Food Azkar",
    icon: "🍽️",
    color: "#8BC34A",
  },
  adhan: {
    id: "adhan",
    nameAr: "أذكار الأذان",
    nameEn: "Adhan Azkar",
    icon: "🔊",
    color: "#607D8B",
  },
  wakeup: {
    id: "wakeup",
    nameAr: "أذكار الاستيقاظ",
    nameEn: "Waking Up",
    icon: "🌅",
    color: "#FFC107",
  },
  mosque: {
    id: "mosque",
    nameAr: "أذكار المسجد",
    nameEn: "Mosque Azkar",
    icon: "🕋",
    color: "#5D4037",
  },
};

/**
 * Fetch azkar data from the API
 * @returns {Promise<Array>} Raw API response array
 */
async function fetchFromAPI() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json();
}

/**
 * Build the full audio URL from a relative path
 * @param {string} relativePath - e.g. "/audio/75.mp3"
 * @returns {string} Full URL
 */
export function getAudioURL(relativePath) {
  if (!relativePath) return "";
  const clean = relativePath.startsWith("/")
    ? relativePath
    : "/" + relativePath;
  return AUDIO_BASE_URL + clean;
}

/**
 * Parse and transform API data into our internal format
 * @param {Array} apiData - Raw API response
 * @returns {{ data: Object, categories: Object }}
 */
function transformAPIData(apiData) {
  const data = {};
  let globalId = 1;

  // Initialize all category arrays
  for (const key of Object.keys(API_CATEGORIES)) {
    data[key] = [];
  }

  for (const section of apiData) {
    const arabicCategory = section.category;
    const mappedKeys = CATEGORY_MAP[arabicCategory];

    // Skip unmapped categories
    if (!mappedKeys) continue;

    const categoryAudioURL = section.audio ? getAudioURL(section.audio) : "";

    // Special handling for morning/evening split
    const isMorningEvening = arabicCategory === "أذكار الصباح والمساء";

    for (const item of section.array || []) {
      const text = (item.text || "")
        .replace(/\(\(/g, "")
        .replace(/\)\)/g, "")
        .trim();
      if (!text) continue;

      const dhikr = {
        id: `api_${globalId++}`,
        arabic: text,
        transliteration: "",
        translation: "",
        source: arabicCategory,
        times: parseInt(item.count) || 1,
        audioUrl: item.audio ? getAudioURL(item.audio) : categoryAudioURL,
        categoryAudioUrl: categoryAudioURL,
        apiCategoryName: arabicCategory,
      };

      if (isMorningEvening) {
        // Add to both morning and evening
        const morningDhikr = {
          ...dhikr,
          id: `api_m_${globalId++}`,
          category: "morning",
        };
        const eveningDhikr = {
          ...dhikr,
          id: `api_e_${globalId++}`,
          category: "evening",
        };
        data.morning.push(morningDhikr);
        data.evening.push(eveningDhikr);
      } else {
        for (const key of mappedKeys) {
          if (data[key]) {
            data[key].push({ ...dhikr, category: key });
          }
        }
      }
    }
  }

  return { data, categories: API_CATEGORIES };
}

/**
 * Get azkar data - tries cache first, then API, then local fallback
 * @param {Object} [localFallback] - Local AZKAR_DATA to use as fallback
 * @returns {Promise<{ data: Object, categories: Object, source: string }>}
 */
export async function getAzkarData(localFallback = null) {
  // 1. Check cache
  try {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cached = stored[CACHE_KEY];
    if (cached && cached.data && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return {
        data: cached.data,
        categories: cached.categories || API_CATEGORIES,
        source: "cache",
      };
    }
  } catch (e) {
    console.warn("[AzkarAPI] Cache read error:", e);
  }

  // 2. Fetch from API
  try {
    const rawData = await fetchFromAPI();
    const { data, categories } = transformAPIData(rawData);

    // Merge with local data to preserve translations
    if (localFallback) {
      mergeLocalTranslations(data, localFallback);
    }

    // Cache the result
    try {
      await chrome.storage.local.set({
        [CACHE_KEY]: {
          data,
          categories,
          fetchedAt: Date.now(),
        },
      });
    } catch (e) {
      console.warn("[AzkarAPI] Cache write error:", e);
    }

    return { data, categories, source: "api" };
  } catch (e) {
    console.warn("[AzkarAPI] API fetch error:", e);
  }

  // 3. Fallback to local data
  if (localFallback) {
    // Convert local data: generate audio URLs from audioFile field
    const localWithAudio = {};
    for (const [key, items] of Object.entries(localFallback)) {
      localWithAudio[key] = items.map((item) => ({
        ...item,
        audioUrl: item.audioUrl || "",
      }));
    }
    return {
      data: localWithAudio,
      categories: API_CATEGORIES,
      source: "local",
    };
  }

  return { data: {}, categories: API_CATEGORIES, source: "empty" };
}

/**
 * Merge translations from local data into API data
 * Matches by similar Arabic text
 */
function mergeLocalTranslations(apiData, localData) {
  // Build a lookup of local azkar by first 30 chars of Arabic text
  const localLookup = {};
  for (const items of Object.values(localData)) {
    for (const item of items) {
      const key = normalizeArabic(item.arabic).substring(0, 30);
      localLookup[key] = item;
    }
  }

  // Apply translations to API data where we find matches
  for (const items of Object.values(apiData)) {
    for (const item of items) {
      const key = normalizeArabic(item.arabic).substring(0, 30);
      const local = localLookup[key];
      if (local) {
        if (local.translation && !item.translation)
          item.translation = local.translation;
        if (local.transliteration && !item.transliteration)
          item.transliteration = local.transliteration;
        if (local.source) item.source = local.source;
      }
    }
  }
}

/**
 * Normalize Arabic text for fuzzy matching
 */
function normalizeArabic(text) {
  return (text || "")
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove tashkeel
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get the adhan category audio URL (for prayer-time adhan sound)
 * @returns {Promise<string>} URL to adhan audio file
 */
export async function getAdhanAudioURL() {
  try {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cached = stored[CACHE_KEY];
    if (cached && cached.data && cached.data.adhan) {
      // Get the first adhan entry's category audio
      const adhanItems = cached.data.adhan;
      if (adhanItems.length > 0 && adhanItems[0].categoryAudioUrl) {
        return adhanItems[0].categoryAudioUrl;
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback: try fetching from API directly
  try {
    const rawData = await fetchFromAPI();
    const adhanSection = rawData.find((s) => s.category === "أذكار الآذان");
    if (adhanSection && adhanSection.audio) {
      return getAudioURL(adhanSection.audio);
    }
  } catch (e) {
    // ignore
  }

  return "";
}
