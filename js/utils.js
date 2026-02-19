// ===== Shared Utility Functions =====
// Common helpers used across the extension modules

/**
 * Convert a number to Arabic numerals
 * @param {number|string} num - The number to convert
 * @param {string} lang - Current language ('ar' uses Arabic digits, others use Western)
 * @returns {string}
 */
export function toArabicNum(num, lang = "ar") {
  if (lang !== "ar" && lang !== "ur") return String(num);
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d)]);
}

/**
 * Get the ISO date string for today (YYYY-MM-DD)
 * @returns {string}
 */
export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get the week key (e.g., "2025-W3")
 * @returns {string}
 */
export function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
  return `${now.getFullYear()}-W${weekNumber}`;
}

/**
 * Get the month key (e.g., "2025-01")
 * @returns {string}
 */
export function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get timestamp for next midnight
 * @returns {number}
 */
export function getNextMidnight() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Show a toast notification in the popup
 * @param {string} message
 * @param {number} duration - ms
 */
export function showToast(message, duration = 3000) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, duration);
}

/**
 * Get the Arabic name for a prayer
 * @param {string} prayer
 * @returns {string}
 */
export function getPrayerNameAr(prayer) {
  const names = {
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
  };
  return names[prayer] || prayer;
}

/**
 * Get category label in Arabic
 * @param {string} category
 * @returns {string}
 */
export function getCategoryLabelAr(category) {
  const labels = {
    morning: "أذكار الصباح",
    evening: "أذكار المساء",
    afterPrayer: "أذكار بعد الصلاة",
    sleep: "أذكار النوم",
    general: "أذكار عامة",
    forgiveness: "أذكار الاستغفار",
    protection: "أذكار الحماية",
    dua: "الدعاء",
    travel: "أذكار السفر",
    food: "أذكار الطعام",
  };
  return labels[category] || "أذكار";
}

/**
 * Format a "HH:MM" time string as 12h or 24h
 * @param {string} timeStr - Time in HH:MM (24-hour) format
 * @param {string} format - "12" for 12-hour, "24" for 24-hour
 * @param {string} lang  - "ar" to use Arabic-Indic digits, else Western
 * @returns {string}
 */
export function formatTime(timeStr, format = "24", lang = "ar") {
  if (!timeStr || !timeStr.includes(":")) return timeStr || "--:--";
  if (format !== "12") return toArabicNum(timeStr, lang);

  let [h, m] = timeStr.split(":").map(Number);
  const isAM = h < 12;
  const suffix = isAM
    ? lang === "ar"
      ? "ص"
      : "AM"
    : lang === "ar"
      ? "م"
      : "PM";
  h = h % 12 || 12;
  const formatted = `${h}:${String(m).padStart(2, "0")}`;
  return `${toArabicNum(formatted, lang)} ${suffix}`;
}
