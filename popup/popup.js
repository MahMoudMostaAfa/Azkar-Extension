// ===== Popup Main Script (Modular) =====
import { AZKAR_DATA, AZKAR_CATEGORIES } from "../data/azkar.js";
import { NAWAWI_HADITHS } from "../data/nawawi.js";
import {
  toArabicNum,
  getTodayKey,
  getWeekKey,
  getMonthKey,
  showToast,
  formatTime,
} from "../js/utils.js";
import { t, applyTranslations, applyLanguageDirection } from "../js/i18n.js";
import { AudioService } from "../js/audio.js";
import * as API from "../js/api.js";
import {
  getAzkarData,
  getAdhanAudioURL,
  API_CATEGORIES,
} from "../js/azkar-api.js";
import { getRadioData, getPopularReciters } from "../js/quran-radio.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ─── State ───
  let settings = {};
  let progress = {};
  let currentDhikr = null;
  let currentCount = 0;
  let currentLang = "ar";
  const audio = new AudioService();

  // ─── Azkar Data (loaded from API) ───
  let azkarData = AZKAR_DATA; // fallback
  let azkarCategories = AZKAR_CATEGORIES; // fallback
  let dataSource = "local";

  // ─── Prayer State ───
  let prayerTimings = null;
  let adhanAudioURL = "";
  let remainingTimeInterval = null;

  // ─── Play All State (UI mirror of background state) ───
  let playAllActive = false;

  // ─── Radio State ───
  let currentRadioId = null;
  let radioDataCache = null;

  // ─── Initialize ───
  await loadSettings();
  await loadAzkarFromAPI(); // Load API data first
  await loadProgress();
  initNavTabs();
  initHomeTab();
  loadPrayerTimes();
  loadHijriDate();
  initCategoriesTab();
  initProgressTab();
  initHadithTab();
  initCustomTab();
  initRadioTab();
  initHadith();
  initSettingsButton();
  initLanguageToggle();

  // Load adhan audio URL in background
  getAdhanAudioURL().then((url) => {
    adhanAudioURL = url;
  });

  // ─── Listen for audio state updates from background (persistent audio) ───
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "AUDIO_STATE_UPDATE") {
      updateAudioUI(msg.state);
      // Also update home tab listen button
      const homeBtn = document.getElementById("playAudioBtn");
      if (homeBtn && !msg.state.playing) {
        homeBtn.classList.remove("playing");
        homeBtn.textContent = t("listen", currentLang);
      }
    }
    if (msg.type === "PLAY_ALL_FINISHED") {
      const doneText =
        currentLang === "ar" || currentLang === "ur"
          ? "✅ تم تشغيل جميع الأذكار"
          : "✅ All azkar played";
      showToast(doneText);
      resetPlayAllUI();
    }
    if (msg.type === "RADIO_STATE_UPDATE") {
      updateRadioUIFromState(msg.state);
    }
  });

  // ═══════════════════════════════════════════
  // Azkar API Data Loading
  // ═══════════════════════════════════════════

  async function loadAzkarFromAPI() {
    try {
      const result = await getAzkarData(AZKAR_DATA);
      if (result.data && Object.keys(result.data).length > 0) {
        azkarData = result.data;
        azkarCategories = result.categories || API_CATEGORIES;
        dataSource = result.source;
        console.log(
          `[Azkar] Data loaded from: ${dataSource}, categories: ${Object.keys(azkarData).length}`,
        );
      }
    } catch (e) {
      console.warn("[Azkar] API load failed, using local data:", e);
      azkarData = AZKAR_DATA;
      azkarCategories = AZKAR_CATEGORIES;
      dataSource = "local";
    }
  }

  // ═══════════════════════════════════════════
  // Data Loading
  // ═══════════════════════════════════════════

  async function loadSettings() {
    const resp = await API.getSettings();
    settings = resp || {};
    currentLang = settings.language || "ar";
    applySettingsToUI();
  }

  async function loadProgress() {
    const resp = await API.getProgress();
    progress = resp || {};
  }

  function loadPrayerTimes() {
    API.getPrayerTimes().then((timings) => {
      if (!timings) return;
      prayerTimings = timings;

      const prayerKeys = {
        fajr: "Fajr",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
      };
      const prayerNamesAr = {
        fajr: "الفجر",
        dhuhr: "الظهر",
        asr: "العصر",
        maghrib: "المغرب",
        isha: "العشاء",
      };
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      let nextPrayer = null;
      let minDiff = Infinity;
      const prayerMinutesMap = {};

      for (const [id, key] of Object.entries(prayerKeys)) {
        const el = document.getElementById(`pt-${id}`);
        const timeStr = timings[key];
        if (el && timeStr) {
          el.querySelector(".pt-time").textContent = formatTime(
            timeStr,
            settings.timeFormat || "24",
            currentLang,
          );
          const [h, m] = timeStr.split(":").map(Number);
          const prayerMinutes = h * 60 + m;
          prayerMinutesMap[id] = prayerMinutes;
          const diff = prayerMinutes - currentMinutes;

          if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = id;
          }

          // Mark passed prayers
          if (diff < 0) {
            el.classList.add("passed");
          }

          // Set up adhan button
          const adhanBtn = el.querySelector(".pt-adhan-btn");
          if (adhanBtn) {
            adhanBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              toggleAdhanPlay(adhanBtn);
            });
          }
        }
      }

      if (nextPrayer) {
        const el = document.getElementById(`pt-${nextPrayer}`);
        if (el) el.classList.add("active");
      }

      // Update remaining time immediately and then every minute
      updateAllRemainingTimes(prayerKeys, prayerMinutesMap, prayerNamesAr);
      if (remainingTimeInterval) clearInterval(remainingTimeInterval);
      remainingTimeInterval = setInterval(() => {
        updateAllRemainingTimes(prayerKeys, prayerMinutesMap, prayerNamesAr);
      }, 30000); // Update every 30 seconds
    });
  }

  function loadHijriDate() {
    API.getHijriDate().then((hijri) => {
      const el = document.getElementById("hijriDateText");
      if (!el || !hijri) {
        if (el) el.textContent = "";
        return;
      }
      const day = hijri.day || "";
      const monthAr = hijri.month?.ar || "";
      const monthEn = hijri.month?.en || "";
      const year = hijri.year || "";
      const monthName = currentLang === "ar" ? monthAr : monthEn;
      el.textContent = `${day} ${monthName} ${year} هـ`;
    });
  }

  /**
   * Update remaining time display for all prayers
   */
  function updateAllRemainingTimes(
    prayerKeys,
    prayerMinutesMap,
    prayerNamesAr,
  ) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const [id] of Object.entries(prayerKeys)) {
      const el = document.getElementById(`pt-${id}`);
      if (!el) continue;

      const prayerMinutes = prayerMinutesMap[id];
      if (prayerMinutes === undefined) continue;

      const diff = prayerMinutes - currentMinutes;
      const remainingEl = el.querySelector(".pt-remaining");
      const tooltipEl = el.querySelector(".pt-tooltip");
      const prayerName =
        currentLang === "ar" || currentLang === "ur"
          ? prayerNamesAr[id]
          : id.charAt(0).toUpperCase() + id.slice(1);

      if (diff > 0) {
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        let remainingText = "";
        let tooltipText = "";

        if (currentLang === "ar" || currentLang === "ur") {
          if (hours > 0) {
            remainingText = `${toArabicNum(hours, currentLang)}س ${toArabicNum(mins, currentLang)}د`;
            tooltipText = `⏱ ${prayerName} بعد ${toArabicNum(hours, currentLang)} ساعة و ${toArabicNum(mins, currentLang)} دقيقة`;
          } else {
            remainingText = `${toArabicNum(mins, currentLang)}د`;
            tooltipText = `⏱ ${prayerName} بعد ${toArabicNum(mins, currentLang)} دقيقة`;
          }
        } else {
          if (hours > 0) {
            remainingText = `${hours}h ${mins}m`;
            tooltipText = `⏱ ${prayerName} in ${hours}h ${mins}m`;
          } else {
            remainingText = `${mins}m`;
            tooltipText = `⏱ ${prayerName} in ${mins} min`;
          }
        }

        if (remainingEl) remainingEl.textContent = remainingText;
        if (tooltipEl) tooltipEl.textContent = tooltipText;
      } else if (diff === 0 || (diff > -5 && diff <= 0)) {
        // Prayer time is now
        const nowText =
          currentLang === "ar" || currentLang === "ur" ? "الآن!" : "Now!";
        if (remainingEl) remainingEl.textContent = `🔔 ${nowText}`;
        if (tooltipEl) {
          tooltipEl.textContent =
            currentLang === "ar" || currentLang === "ur"
              ? `🕌 حان وقت صلاة ${prayerName}`
              : `🕌 Time for ${prayerName} prayer`;
        }
      } else {
        // Prayer has passed
        const passedText =
          currentLang === "ar" || currentLang === "ur" ? "انتهى" : "Passed";
        if (remainingEl) remainingEl.textContent = passedText;
        if (tooltipEl) {
          tooltipEl.textContent =
            currentLang === "ar" || currentLang === "ur"
              ? `✓ انتهى وقت ${prayerName}`
              : `✓ ${prayerName} has passed`;
        }
      }
    }
  }

  /**
   * Toggle adhan playback
   */
  function toggleAdhanPlay(btn) {
    if (btn.classList.contains("playing")) {
      audio.stopAdhan();
      btn.classList.remove("playing");
      btn.textContent = "🔊";
      return;
    }

    // Stop any other playing adhan buttons
    document.querySelectorAll(".pt-adhan-btn.playing").forEach((b) => {
      b.classList.remove("playing");
      b.textContent = "🔊";
    });

    audio.playAdhan(adhanAudioURL, {
      onStart: () => {
        btn.classList.add("playing");
        btn.textContent = "⏹";
      },
      onEnd: () => {
        btn.classList.remove("playing");
        btn.textContent = "🔊";
      },
      onError: () => {
        btn.classList.remove("playing");
        btn.textContent = "🔊";
      },
    });
  }

  // ═══════════════════════════════════════════
  // Apply Settings to UI
  // ═══════════════════════════════════════════

  function applySettingsToUI() {
    // Theme
    document.body.classList.remove("dark");
    if (settings.theme === "dark") {
      document.body.classList.add("dark");
    } else if (settings.theme === "auto") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark");
      }
    }

    // Font size
    document.body.classList.remove("font-small", "font-large");
    if (settings.fontSize === "small")
      document.body.classList.add("font-small");
    if (settings.fontSize === "large")
      document.body.classList.add("font-large");

    // Direction & language
    applyLanguageDirection(currentLang);

    // Apply i18n translations to all data-i18n elements
    applyTranslations(currentLang);

    // Display toggles
    const translitToggle = document.getElementById("showTransliterationToggle");
    if (translitToggle)
      translitToggle.checked = settings.showTransliteration !== false;
    const translToggle = document.getElementById("showTranslationToggle");
    if (translToggle) translToggle.checked = settings.showTranslation !== false;

    // Reminder toggle
    const reminderToggle = document.getElementById("reminderToggle");
    if (reminderToggle) reminderToggle.checked = settings.enabled !== false;

    // Interval
    const intervalSelect = document.getElementById("intervalSelect");
    if (intervalSelect && settings.interval) {
      intervalSelect.value = settings.interval;
    }

    // Language toggle button text
    const langBtn = document.getElementById("langToggle");
    if (langBtn) {
      if (currentLang === "ar") langBtn.textContent = "EN";
      else if (currentLang === "en") langBtn.textContent = "FR";
      else if (currentLang === "fr") langBtn.textContent = "UR";
      else if (currentLang === "ur") langBtn.textContent = "عربي";
      else langBtn.textContent = "عربي";
    }
  }

  // ═══════════════════════════════════════════
  // Navigation Tabs
  // ═══════════════════════════════════════════

  function initNavTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((tc) => tc.classList.remove("active"));
        tab.classList.add("active");
        const tabId = tab.dataset.tab + "Tab";
        document.getElementById(tabId).classList.add("active");

        if (tab.dataset.tab === "progress") refreshProgress();
        else if (tab.dataset.tab === "custom") loadCustomAzkar();
        else if (tab.dataset.tab === "radio") loadRadioData();
      });
    });
  }

  // ═══════════════════════════════════════════
  // Home Tab
  // ═══════════════════════════════════════════

  function initHomeTab() {
    updateStats();
    loadRandomDhikr();
    buildCategoryChips();

    document
      .getElementById("counterBtn")
      .addEventListener("click", incrementCounter);
    document.getElementById("resetBtn").addEventListener("click", () => {
      currentCount = 0;
      updateCounterUI();
    });
    document
      .getElementById("nextDhikrBtn")
      .addEventListener("click", loadRandomDhikr);
    document
      .getElementById("shareBtn")
      .addEventListener("click", () => showShareModal(currentDhikr));
    document
      .getElementById("playAudioBtn")
      .addEventListener("click", toggleAudio);

    document
      .getElementById("reminderToggle")
      .addEventListener("change", (e) => {
        settings.enabled = e.target.checked;
        saveSettings();
      });
    document
      .getElementById("intervalSelect")
      .addEventListener("change", (e) => {
        settings.interval = parseInt(e.target.value);
        saveSettings();
      });

    // Display toggles for transliteration & translation
    document
      .getElementById("showTransliterationToggle")
      .addEventListener("change", (e) => {
        settings.showTransliteration = e.target.checked;
        saveSettings();
        if (currentDhikr) displayDhikr(currentDhikr);
      });
    document
      .getElementById("showTranslationToggle")
      .addEventListener("change", (e) => {
        settings.showTranslation = e.target.checked;
        saveSettings();
        if (currentDhikr) displayDhikr(currentDhikr);
      });
  }

  function updateStats() {
    const today = getTodayKey();
    const todayCount = (progress.dailyCount && progress.dailyCount[today]) || 0;
    const streak = progress.streak || 0;
    const total = progress.totalCompleted || 0;

    document.getElementById("todayCount").textContent = toArabicNum(
      todayCount,
      currentLang,
    );
    document.getElementById("streakCount").textContent = toArabicNum(
      streak,
      currentLang,
    );
    document.getElementById("totalCount").textContent = toArabicNum(
      total,
      currentLang,
    );
  }

  // ═══════════════════════════════════════════
  // Dhikr Display & Counter
  // ═══════════════════════════════════════════

  function loadRandomDhikr() {
    const categories = settings.enabledCategories || Object.keys(azkarData);
    const allAzkar = [];

    for (const cat of categories) {
      if (azkarData[cat]) allAzkar.push(...azkarData[cat]);
    }
    if (allAzkar.length === 0 && azkarData.general) {
      allAzkar.push(...azkarData.general);
    }
    if (allAzkar.length === 0) {
      // Ultimate fallback
      allAzkar.push({
        id: "fallback",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        translation: "How perfect Allah is and I praise Him",
        source: "صحيح مسلم",
        times: 100,
        category: "general",
      });
    }

    currentDhikr = allAzkar[Math.floor(Math.random() * allAzkar.length)];
    currentCount = 0;
    displayDhikr(currentDhikr);
  }

  function displayDhikr(dhikr) {
    if (!dhikr) return;

    const category =
      azkarCategories[dhikr.category] || azkarCategories.general || {};
    const lang = currentLang;

    // Category badge
    const badge = document.getElementById("dhikrCategoryBadge");
    badge.textContent =
      lang === "ar" || lang === "ur" ? category.nameAr : category.nameEn;
    badge.style.background = category.color || "#4CAF50";

    // Arabic text is always shown in Arabic
    document.getElementById("dhikrArabic").textContent = dhikr.arabic;

    // Transliteration
    const translitEl = document.getElementById("dhikrTransliteration");
    translitEl.textContent = dhikr.transliteration || "";
    translitEl.style.display =
      settings.showTransliteration !== false ? "block" : "none";

    // Translation
    const translEl = document.getElementById("dhikrTranslation");
    translEl.textContent = dhikr.translation || "";
    translEl.style.display =
      settings.showTranslation !== false ? "block" : "none";

    // Source & times
    const sourceEl = document.getElementById("dhikrSource");
    sourceEl.textContent = t("sourcePrefix", lang) + (dhikr.source || "");
    sourceEl.style.display = settings.showSource !== false ? "inline" : "none";

    const timesEl = document.getElementById("dhikrTimes");
    timesEl.textContent =
      t("repeatPrefix", lang) +
      toArabicNum(dhikr.times || 1, lang) +
      " " +
      t("times", lang);

    updateCounterUI();
  }

  function incrementCounter() {
    if (!currentDhikr) return;
    const maxCount = currentDhikr.times || 1;

    if (currentCount < maxCount) {
      currentCount++;
      updateCounterUI();

      const btn = document.getElementById("counterBtn");
      btn.classList.add("completed-pulse");
      setTimeout(() => btn.classList.remove("completed-pulse"), 600);

      if (currentCount >= maxCount) completeDhikr();
    }
  }

  function updateCounterUI() {
    const maxCount = currentDhikr ? currentDhikr.times || 1 : 1;
    const percent = Math.min(currentCount / maxCount, 1);
    const circumference = 2 * Math.PI * 29;
    const offset = circumference * (1 - percent);

    document.getElementById("counterText").textContent = toArabicNum(
      currentCount,
      currentLang,
    );
    document.getElementById("progressRing").style.strokeDasharray =
      circumference;
    document.getElementById("progressRing").style.strokeDashoffset = offset;

    const ring = document.getElementById("progressRing");
    ring.style.stroke = currentCount >= maxCount ? "#FF9800" : "#4CAF50";
  }

  async function completeDhikr() {
    await API.completeDhikr(currentDhikr.id, currentDhikr.category);
    await loadProgress();
    updateStats();
    showToast(t("completed", currentLang));
    setTimeout(() => loadRandomDhikr(), 2000);
  }

  // ═══════════════════════════════════════════
  // Category Chips
  // ═══════════════════════════════════════════

  function buildCategoryChips() {
    const container = document.getElementById("categoryChips");
    container.innerHTML = "";

    const enabledCats =
      settings.enabledCategories || Object.keys(azkarCategories);
    const keys = Object.keys(azkarCategories);

    for (const key of keys) {
      const cat = azkarCategories[key];
      const chip = document.createElement("button");
      chip.className =
        "category-chip" + (enabledCats.includes(key) ? " active" : "");
      chip.dataset.categoryKey = key;
      const label =
        currentLang === "ar" || currentLang === "ur" ? cat.nameAr : cat.nameEn;
      chip.innerHTML = `${cat.icon} ${label}`;
      chip.addEventListener("click", () => {
        chip.classList.toggle("active");
        updateEnabledCategories();
      });
      container.appendChild(chip);
    }
  }

  function updateEnabledCategories() {
    const activeChips = document.querySelectorAll(".category-chip.active");
    settings.enabledCategories = [];
    activeChips.forEach((chip) => {
      if (chip.dataset.categoryKey) {
        settings.enabledCategories.push(chip.dataset.categoryKey);
      }
    });
    saveSettings();
  }

  // ═══════════════════════════════════════════
  // Categories Tab
  // ═══════════════════════════════════════════

  function initCategoriesTab() {
    const grid = document.getElementById("categoriesGrid");
    grid.innerHTML = "";

    for (const [key, cat] of Object.entries(azkarCategories)) {
      const count = azkarData[key] ? azkarData[key].length : 0;
      if (count === 0) continue; // Skip empty categories
      const card = document.createElement("div");
      card.className = "category-card";
      card.innerHTML = `
        <span class="category-card-icon">${cat.icon}</span>
        <div class="category-card-name">${currentLang === "ar" || currentLang === "ur" ? cat.nameAr : cat.nameEn}</div>
        <div class="category-card-name-en">${cat.nameEn}</div>
        <div class="category-card-count">${toArabicNum(count, currentLang)} ${t("azkarCount", currentLang)}</div>
      `;
      card.addEventListener("click", () => openCategory(key));
      grid.appendChild(card);
    }
  }

  function openCategory(categoryKey) {
    const category = azkarCategories[categoryKey];
    const azkar = azkarData[categoryKey] || [];

    // Stop any ongoing play-all via background
    chrome.runtime.sendMessage({ type: "STOP_PLAY_ALL" });
    playAllActive = false;

    document.getElementById("categoriesGrid").style.display = "none";
    document.getElementById("categoryAzkarList").style.display = "block";

    const nameDisplay =
      currentLang === "ar" || currentLang === "ur"
        ? category.nameAr
        : category.nameEn;
    document.getElementById("categoryTitle").textContent =
      `${category.icon} ${nameDisplay}`;

    const list = document.getElementById("azkarList");
    list.innerHTML = "";

    // Show "Play All" button for morning/evening
    const showPlayAll =
      (categoryKey === "morning" || categoryKey === "evening") &&
      azkar.some((d) => d.audioUrl);

    if (showPlayAll) {
      const playAllWrap = document.createElement("div");
      playAllWrap.className = "play-all-container";

      const playAllBtn = document.createElement("button");
      playAllBtn.className = "play-all-btn";
      playAllBtn.id = "playAllBtn";
      const playAllLabel =
        currentLang === "ar" || currentLang === "ur"
          ? "▶️ تشغيل الكل بالترتيب"
          : "▶️ Play All in Order";
      playAllBtn.textContent = playAllLabel;
      playAllBtn.addEventListener("click", () => {
        if (playAllActive) {
          chrome.runtime.sendMessage({ type: "STOP_PLAY_ALL" });
        } else {
          startPlayAll(azkar, categoryKey);
        }
      });

      playAllWrap.appendChild(playAllBtn);
      list.appendChild(playAllWrap);

      // Progress text
      const progressEl = document.createElement("div");
      progressEl.className = "play-all-progress";
      progressEl.id = "playAllProgress";
      list.appendChild(progressEl);
    }

    azkar.forEach((dhikr, idx) => {
      const item = document.createElement("div");
      item.className = "azkar-list-item";
      item.dataset.azkarIdx = idx;
      const hasAudio = dhikr.audioUrl ? true : false;
      item.innerHTML = `
        <div class="azkar-item-arabic">${dhikr.arabic}</div>
        ${settings.showTransliteration !== false && dhikr.transliteration ? `<div class="azkar-item-transliteration">${dhikr.transliteration}</div>` : ""}
        ${settings.showTranslation !== false && dhikr.translation ? `<div class="azkar-item-translation">${dhikr.translation}</div>` : ""}
        <div class="azkar-item-meta">
          <span>${t("sourcePrefix", currentLang)}${dhikr.source || ""}</span>
          <span>${t("repeatPrefix", currentLang)}${toArabicNum(dhikr.times || 1, currentLang)} ${t("times", currentLang)}</span>
          ${hasAudio ? `<button class="azkar-item-play" data-audio="${dhikr.audioUrl}">🔊</button>` : ""}
        </div>
      `;

      // Play audio button in list (routes through background for persistence)
      const playBtn = item.querySelector(".azkar-item-play");
      if (playBtn) {
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          // If play-all is active, stop it first
          if (playAllActive) {
            chrome.runtime.sendMessage({ type: "STOP_PLAY_ALL" });
          }

          chrome.runtime.sendMessage({ type: "GET_AUDIO_STATE" }, (state) => {
            if (state && state.playing) {
              chrome.runtime.sendMessage({ type: "STOP_AUDIO" });
              playBtn.textContent = "🔊";
            } else {
              chrome.runtime.sendMessage({
                type: "PLAY_AUDIO",
                url: dhikr.audioUrl,
                dhikrIdx: idx,
              });
              playBtn.textContent = "⏹";
            }
          });
        });
      }

      item.addEventListener("click", () => {
        currentDhikr = dhikr;
        currentCount = 0;
        displayDhikr(dhikr);
        // Switch to home tab
        document
          .querySelectorAll(".nav-tab")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((tc) => tc.classList.remove("active"));
        document.querySelector('[data-tab="home"]').classList.add("active");
        document.getElementById("homeTab").classList.add("active");
      });
      list.appendChild(item);
    });

    document.getElementById("backToCategories").onclick = () => {
      chrome.runtime.sendMessage({ type: "STOP_PLAY_ALL" });
      document.getElementById("categoriesGrid").style.display = "grid";
      document.getElementById("categoryAzkarList").style.display = "none";
    };

    // Check if play-all is already active for this category (popup reopened)
    chrome.runtime.sendMessage({ type: "GET_AUDIO_STATE" }, (state) => {
      if (
        state &&
        state.playAllActive &&
        state.playAllCategoryKey === categoryKey
      ) {
        updateAudioUI(state);
      }
    });
  }

  // ═══════════════════════════════════════════
  // Play All (background-managed for persistence)
  // ═══════════════════════════════════════════

  function startPlayAll(azkar, categoryKey) {
    const list = azkar
      .map((d, idx) => ({
        audioUrl: d.audioUrl,
        arabic: d.arabic,
        originalIdx: idx,
      }))
      .filter((d) => d.audioUrl);
    if (list.length === 0) return;

    playAllActive = true;

    const btn = document.getElementById("playAllBtn");
    if (btn) {
      btn.classList.add("playing");
      btn.textContent =
        currentLang === "ar" || currentLang === "ur"
          ? "⏹ إيقاف التشغيل"
          : "⏹ Stop Playback";
    }

    // Send to background - it manages the queue and offscreen audio
    chrome.runtime.sendMessage({
      type: "START_PLAY_ALL",
      azkarList: list,
      categoryKey,
    });
  }

  function resetPlayAllUI() {
    playAllActive = false;

    const btn = document.getElementById("playAllBtn");
    if (btn) {
      btn.classList.remove("playing");
      btn.textContent =
        currentLang === "ar" || currentLang === "ur"
          ? "▶️ تشغيل الكل بالترتيب"
          : "▶️ Play All in Order";
    }
    const progressEl = document.getElementById("playAllProgress");
    if (progressEl) progressEl.textContent = "";

    document
      .querySelectorAll(".azkar-list-item.now-playing")
      .forEach((el) => el.classList.remove("now-playing"));
  }

  /**
   * Update the popup UI based on audio state from background
   */
  function updateAudioUI(state) {
    // Update play-all local mirror
    playAllActive = state.playAllActive;

    // Play All button
    const btn = document.getElementById("playAllBtn");
    if (btn) {
      if (state.playAllActive) {
        btn.classList.add("playing");
        btn.textContent =
          currentLang === "ar" || currentLang === "ur"
            ? "⏹ إيقاف التشغيل"
            : "⏹ Stop Playback";
      } else {
        btn.classList.remove("playing");
        btn.textContent =
          currentLang === "ar" || currentLang === "ur"
            ? "▶️ تشغيل الكل بالترتيب"
            : "▶️ Play All in Order";
      }
    }

    // Progress text
    const progressEl = document.getElementById("playAllProgress");
    if (progressEl) {
      if (state.playAllActive) {
        const current = state.playAllIndex + 1;
        const total = state.playAllTotal;
        if (currentLang === "ar" || currentLang === "ur") {
          progressEl.textContent = `🎵 ذكر ${toArabicNum(current, currentLang)} من ${toArabicNum(total, currentLang)}`;
        } else {
          progressEl.textContent = `🎵 Playing ${current} of ${total}`;
        }
      } else {
        progressEl.textContent = "";
      }
    }

    // Item highlighting
    document
      .querySelectorAll(".azkar-list-item.now-playing")
      .forEach((el) => el.classList.remove("now-playing"));

    if (state.playAllActive && state.currentOriginalIdx >= 0) {
      const allItems = document.querySelectorAll(
        ".azkar-list-item[data-azkar-idx]",
      );
      allItems.forEach((el) => {
        if (parseInt(el.dataset.azkarIdx) === state.currentOriginalIdx) {
          el.classList.add("now-playing");
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }

    // Individual play buttons
    document.querySelectorAll(".azkar-item-play").forEach((btn) => {
      btn.textContent = "🔊";
    });
    if (
      !state.playAllActive &&
      state.playing &&
      state.singlePlayDhikrIdx >= 0
    ) {
      const item = document.querySelector(
        `.azkar-list-item[data-azkar-idx="${state.singlePlayDhikrIdx}"]`,
      );
      if (item) {
        const pb = item.querySelector(".azkar-item-play");
        if (pb) pb.textContent = "⏹";
      }
    }
  }

  // ═══════════════════════════════════════════
  // Progress Tab
  // ═══════════════════════════════════════════

  function initProgressTab() {
    refreshProgress();
  }

  function refreshProgress() {
    API.getProgress().then((resp) => {
      progress = resp || {};
      const today = getTodayKey();
      const weekKey = getWeekKey();
      const monthKey = getMonthKey();

      document.getElementById("progressToday").textContent = toArabicNum(
        (progress.dailyCount && progress.dailyCount[today]) || 0,
        currentLang,
      );
      document.getElementById("progressWeek").textContent = toArabicNum(
        (progress.weeklyCount && progress.weeklyCount[weekKey]) || 0,
        currentLang,
      );
      document.getElementById("progressMonth").textContent = toArabicNum(
        (progress.monthlyCount && progress.monthlyCount[monthKey]) || 0,
        currentLang,
      );
      document.getElementById("progressStreak").textContent = toArabicNum(
        progress.streak || 0,
        currentLang,
      );

      buildWeeklyChart();
      showInsight();
    });
  }

  function buildWeeklyChart() {
    const chart = document.getElementById("weeklyChart");
    chart.innerHTML = "";

    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      const count = (progress.dailyCount && progress.dailyCount[key]) || 0;
      const dayName = t(dayKeys[date.getDay()], currentLang);
      days.push({ day: dayName, count, key });
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1);

    days.forEach((day) => {
      const height = Math.max((day.count / maxCount) * 80, 4);
      const item = document.createElement("div");
      item.className = "bar-item";
      item.innerHTML = `
        <span class="bar-value">${day.count > 0 ? toArabicNum(day.count, currentLang) : ""}</span>
        <div class="bar" style="height: ${height}px"></div>
        <span class="bar-label">${day.day}</span>
      `;
      chart.appendChild(item);
    });
  }

  function showInsight() {
    const insights = t("insights", currentLang);
    const today = getTodayKey();
    const todayCount = (progress.dailyCount && progress.dailyCount[today]) || 0;
    const streak = progress.streak || 0;

    let insight = "";
    const randomInsight = Array.isArray(insights)
      ? insights[Math.floor(Math.random() * insights.length)]
      : "";

    if (streak >= 7) {
      insight =
        t("streakInsight", currentLang).replace(
          "{count}",
          toArabicNum(streak, currentLang),
        ) + randomInsight;
    } else if (todayCount > 0) {
      insight =
        t("todayInsight", currentLang).replace(
          "{count}",
          toArabicNum(todayCount, currentLang),
        ) + randomInsight;
    } else {
      insight = t("startInsight", currentLang) + randomInsight;
    }

    document.getElementById("insightText").textContent = insight;
  }

  // ═══════════════════════════════════════════
  // Hadith Tab (40 Nawawi + API Categories)
  // ═══════════════════════════════════════════

  const HADITH_TAB_API = "https://hadeethenc.com/api/v1";
  const CATEGORY_ICONS = {
    1: "📖", // Quran
    2: "📜", // Hadith Sciences
    3: "🕋", // Aqeedah
    4: "⚖️", // Fiqh
    5: "🌟", // Virtues
    6: "📢", // Dawah
    7: "🏛️", // Seerah
  };

  let hadithTabState = {
    currentView: "nawawi",
    categoriesCache: null,
    categoryHadithsCache: {},
    currentCategoryId: null,
    currentCategoryTitle: "",
    currentPage: 1,
    totalPages: 1,
    currentNawawiIndex: 0,
    backStack: [],
  };

  function initHadithTab() {
    // Sub-navigation buttons
    document.querySelectorAll(".hadith-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".hadith-tab-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.dataset.hadithView;
        showHadithView(view);
        // Lazy-load categories when user switches to categories view
        if (view === "categories" && !hadithTabState.categoriesCache) {
          loadHadithCategories();
        }
      });
    });

    // Render Nawawi list
    renderNawawiList();

    // Back buttons
    document.getElementById("backToNawawi")?.addEventListener("click", () => {
      showHadithView("nawawi");
    });

    document
      .getElementById("backToHadithCategories")
      ?.addEventListener("click", () => {
        showHadithView("categories");
      });

    document
      .getElementById("backToHadithList")
      ?.addEventListener("click", () => {
        showHadithView("categoryHadiths");
      });

    // Nawawi prev/next
    document.getElementById("nawawiPrevBtn")?.addEventListener("click", () => {
      if (hadithTabState.currentNawawiIndex > 0) {
        hadithTabState.currentNawawiIndex--;
        showNawawiDetail(hadithTabState.currentNawawiIndex);
      }
    });

    document.getElementById("nawawiNextBtn")?.addEventListener("click", () => {
      if (hadithTabState.currentNawawiIndex < NAWAWI_HADITHS.length - 1) {
        hadithTabState.currentNawawiIndex++;
        showNawawiDetail(hadithTabState.currentNawawiIndex);
      }
    });

    // Pagination
    document.getElementById("hadithPrevPage")?.addEventListener("click", () => {
      if (hadithTabState.currentPage > 1) {
        hadithTabState.currentPage--;
        loadCategoryHadiths(
          hadithTabState.currentCategoryId,
          hadithTabState.currentPage,
        );
      }
    });

    document.getElementById("hadithNextPage")?.addEventListener("click", () => {
      if (hadithTabState.currentPage < hadithTabState.totalPages) {
        hadithTabState.currentPage++;
        loadCategoryHadiths(
          hadithTabState.currentCategoryId,
          hadithTabState.currentPage,
        );
      }
    });
  }

  function showHadithView(viewName) {
    document.querySelectorAll("#hadithTab .hadith-view").forEach((v) => {
      v.style.display = "none";
      v.classList.remove("active");
    });

    const viewMap = {
      nawawi: "nawawiView",
      nawawiDetail: "nawawiDetailView",
      categories: "categoriesView",
      categoryHadiths: "categoryHadithsView",
      hadithDetail: "hadithDetailView",
    };

    const el = document.getElementById(viewMap[viewName]);
    if (el) {
      el.style.display = "block";
      el.classList.add("active");
    }

    // Update sub-nav active state
    document.querySelectorAll(".hadith-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (
        (viewName === "nawawi" || viewName === "nawawiDetail") &&
        btn.dataset.hadithView === "nawawi"
      ) {
        btn.classList.add("active");
      } else if (
        (viewName === "categories" ||
          viewName === "categoryHadiths" ||
          viewName === "hadithDetail") &&
        btn.dataset.hadithView === "categories"
      ) {
        btn.classList.add("active");
      }
    });

    hadithTabState.currentView = viewName;
  }

  function renderNawawiList() {
    const list = document.getElementById("nawawiList");
    if (!list) return;
    list.innerHTML = "";

    NAWAWI_HADITHS.forEach((h, idx) => {
      const item = document.createElement("div");
      item.className = "nawawi-item";
      const title =
        currentLang === "fr"
          ? h.titleFr || h.title
          : currentLang === "en"
            ? h.titleEn || h.title
            : h.title;
      item.innerHTML = `
        <span class="nawawi-number">${h.number}</span>
        <span class="nawawi-title">${title}</span>
      `;
      item.addEventListener("click", () => {
        hadithTabState.currentNawawiIndex = idx;
        showNawawiDetail(idx);
      });
      list.appendChild(item);
    });
  }

  function showNawawiDetail(index) {
    const hadith = NAWAWI_HADITHS[index];
    if (!hadith) return;

    const card = document.getElementById("nawawiDetailCard");
    const title =
      currentLang === "fr"
        ? hadith.titleFr || hadith.title
        : currentLang === "en"
          ? hadith.titleEn || hadith.title
          : hadith.title;

    card.innerHTML = `
      <div class="nawawi-detail-title">${hadith.number}. ${title}</div>
      <div class="nawawi-detail-text">${hadith.arabic}</div>
      <div class="nawawi-detail-meta">
        <span>📜 ${hadith.narrator}</span>
        <span>📖 ${hadith.source}</span>
      </div>
      ${hadith.explanation ? `<div class="nawawi-explanation"><strong>${t("hadithExplanation", currentLang)}:</strong><br>${hadith.explanation}</div>` : ""}
    `;

    // Update prev/next buttons
    const prevBtn = document.getElementById("nawawiPrevBtn");
    const nextBtn = document.getElementById("nawawiNextBtn");
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === NAWAWI_HADITHS.length - 1;

    showHadithView("nawawiDetail");
  }

  async function loadHadithCategories() {
    if (hadithTabState.categoriesCache) {
      renderHadithCategories(hadithTabState.categoriesCache);
      return;
    }

    const grid = document.getElementById("hadithCategoriesGrid");
    if (!grid) return;
    grid.innerHTML = `<div class="hadith-cat-loading"><div class="hadith-spinner"></div><span>${t("hadithLoading", currentLang)}</span></div>`;

    try {
      const lang = getHadithLang();
      const res = await fetch(
        `${HADITH_TAB_API}/categories/roots/?language=${lang}`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const categories = await res.json();
      hadithTabState.categoriesCache = categories;
      renderHadithCategories(categories);
    } catch (e) {
      console.warn("[HadithTab] Failed to load categories:", e);
      grid.innerHTML = `<div class="hadith-cat-loading"><span>⚠️ ${t("hadithError", currentLang)}</span><br><button class="back-btn" onclick="" id="retryCategoriesBtn" style="margin-top:8px">🔄 ${t("nextHadith", currentLang)}</button></div>`;
      document
        .getElementById("retryCategoriesBtn")
        ?.addEventListener("click", () => {
          hadithTabState.categoriesCache = null;
          loadHadithCategories();
        });
    }
  }

  function renderHadithCategories(categories) {
    const grid = document.getElementById("hadithCategoriesGrid");
    if (!grid) return;
    grid.innerHTML = "";

    categories.forEach((cat) => {
      const card = document.createElement("div");
      card.className = "hadith-cat-card";
      const icon = CATEGORY_ICONS[cat.id] || "📁";
      card.innerHTML = `
        <div class="hadith-cat-icon">${icon}</div>
        <div class="hadith-cat-name">${cat.title}</div>
        <div class="hadith-cat-count">${cat.hadeeths_count} ${t("hadithCount", currentLang)}</div>
      `;
      card.addEventListener("click", () => {
        hadithTabState.currentCategoryId = cat.id;
        hadithTabState.currentCategoryTitle = cat.title;
        hadithTabState.currentPage = 1;
        document.getElementById("hadithCategoryTitle").textContent = cat.title;
        loadCategoryHadiths(cat.id, 1);
        showHadithView("categoryHadiths");
      });
      grid.appendChild(card);
    });
  }

  async function loadCategoryHadiths(categoryId, page = 1) {
    const list = document.getElementById("hadithItemsList");
    const loading = document.getElementById("hadithCatLoading");
    const pagination = document.getElementById("hadithPagination");

    if (list) list.innerHTML = "";
    if (loading) loading.style.display = "flex";
    if (pagination) pagination.style.display = "none";

    try {
      const lang = getHadithLang();
      const res = await fetch(
        `${HADITH_TAB_API}/hadeeths/list/?language=${lang}&category_id=${categoryId}&page=${page}&per_page=10`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (loading) loading.style.display = "none";

      if (!data.data || data.data.length === 0) {
        list.innerHTML = `<div class="hadith-cat-loading"><span>لا توجد أحاديث</span></div>`;
        return;
      }

      // Update pagination
      const meta = data.meta || {};
      hadithTabState.totalPages = meta.last_page || 1;
      hadithTabState.currentPage = page;

      if (hadithTabState.totalPages > 1 && pagination) {
        pagination.style.display = "flex";
        document.getElementById("hadithPageInfo").textContent =
          `${page} / ${hadithTabState.totalPages}`;
        document.getElementById("hadithPrevPage").disabled = page <= 1;
        document.getElementById("hadithNextPage").disabled =
          page >= hadithTabState.totalPages;
      }

      // Render hadith items
      data.data.forEach((item) => {
        const div = document.createElement("div");
        div.className = "hadith-list-item";
        div.innerHTML = `<div class="hadith-list-item-title">${item.title}</div>`;
        div.addEventListener("click", () => {
          loadSingleHadith(item.id);
        });
        list.appendChild(div);
      });
    } catch (e) {
      console.warn("[HadithTab] Failed to load category hadiths:", e);
      if (loading) loading.style.display = "none";
      if (list)
        list.innerHTML = `<div class="hadith-cat-loading"><span>⚠️ ${t("hadithError", currentLang)}</span></div>`;
    }
  }

  async function loadSingleHadith(hadithId) {
    const card = document.getElementById("hadithDetailCard");
    if (!card) return;
    card.innerHTML = `<div class="hadith-cat-loading"><div class="hadith-spinner"></div><span>${t("hadithLoading", currentLang)}</span></div>`;
    showHadithView("hadithDetail");

    try {
      const lang = getHadithLang();
      const res = await fetch(
        `${HADITH_TAB_API}/hadeeths/one/?language=${lang}&id=${hadithId}`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const hadith = await res.json();

      let gradeClass = "";
      const grade = (hadith.grade || "").toLowerCase();
      if (grade.includes("صحيح") || grade.includes("sahih"))
        gradeClass = "sahih";
      else if (grade.includes("حسن") || grade.includes("hasan"))
        gradeClass = "hasan";
      else if (
        grade.includes("ضعيف") ||
        grade.includes("daif") ||
        grade.includes("weak")
      )
        gradeClass = "daif";

      card.innerHTML = `
        <div class="hadith-detail-title">${hadith.title || ""}</div>
        <div class="hadith-detail-text">${hadith.hadeeth || ""}</div>
        <div class="hadith-detail-attribution">
          ${hadith.attribution ? `📖 ${hadith.attribution}` : ""}
          ${hadith.grade ? `<div class="hadith-detail-grade ${gradeClass}">${hadith.grade}</div>` : ""}
        </div>
        ${hadith.explanation ? `<div class="nawawi-detail-text" style="font-size:13px; margin-top:12px; padding-top:12px; border-top:1px solid var(--bg-secondary)"><strong>${t("hadithExplanation", currentLang)}:</strong><br>${hadith.explanation}</div>` : ""}
      `;
    } catch (e) {
      console.warn("[HadithTab] Failed to load hadith detail:", e);
      card.innerHTML = `<div class="hadith-cat-loading"><span>⚠️ ${t("hadithError", currentLang)}</span></div>`;
    }
  }

  // ═══════════════════════════════════════════
  // Custom Azkar Tab
  // ═══════════════════════════════════════════

  function initCustomTab() {
    document
      .getElementById("addCustomBtn")
      .addEventListener("click", addCustomDhikr);
    loadCustomAzkar();
  }

  function addCustomDhikr() {
    const arabic = document.getElementById("customArabic").value.trim();
    if (!arabic) {
      showToast(t("enterArabicText", currentLang));
      return;
    }

    const dhikr = {
      id: "custom_" + Date.now(),
      arabic,
      transliteration: document
        .getElementById("customTransliteration")
        .value.trim(),
      translation: document.getElementById("customTranslation").value.trim(),
      source:
        document.getElementById("customSource").value.trim() ||
        (currentLang === "ar" ? "مخصص" : "Custom"),
      times: parseInt(document.getElementById("customTimes").value) || 1,
      category: "custom",
      isCustom: true,
    };

    API.saveCustomDhikr(dhikr).then(() => {
      showToast(t("addedCustom", currentLang));
      document.getElementById("customArabic").value = "";
      document.getElementById("customTransliteration").value = "";
      document.getElementById("customTranslation").value = "";
      document.getElementById("customSource").value = "";
      document.getElementById("customTimes").value = "1";
      loadCustomAzkar();
    });
  }

  function loadCustomAzkar() {
    API.getCustomAzkar().then((customAzkar) => {
      const list = document.getElementById("customList");
      list.innerHTML = "";

      if (!customAzkar || customAzkar.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:20px;">${t("noCustomYet", currentLang)}</p>`;
        return;
      }

      customAzkar.forEach((dhikr) => {
        const item = document.createElement("div");
        item.className = "custom-item";
        item.innerHTML = `
          <div class="custom-item-arabic">${dhikr.arabic}</div>
          ${dhikr.transliteration ? `<div style="font-size:12px;color:var(--text-secondary);font-style:italic;direction:ltr">${dhikr.transliteration}</div>` : ""}
          ${dhikr.translation ? `<div style="font-size:12px;color:var(--text-secondary);direction:ltr">${dhikr.translation}</div>` : ""}
          <div class="custom-item-actions">
            <button class="share-custom-btn" data-id="${dhikr.id}">${t("share", currentLang)}</button>
            <button class="delete-btn" data-id="${dhikr.id}">${t("deleteBtn", currentLang)}</button>
          </div>
        `;
        list.appendChild(item);
      });

      // Delete handlers
      list.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          API.deleteCustomDhikr(btn.dataset.id).then(() => {
            showToast(t("deletedCustom", currentLang));
            loadCustomAzkar();
          });
        });
      });

      // Share handlers
      list.querySelectorAll(".share-custom-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const d = customAzkar.find((x) => x.id === btn.dataset.id);
          if (d) showShareModal(d);
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  // Audio (via AudioService)
  // ═══════════════════════════════════════════

  function toggleAudio() {
    const btn = document.getElementById("playAudioBtn");
    if (!currentDhikr) return;

    chrome.runtime.sendMessage({ type: "GET_AUDIO_STATE" }, (state) => {
      if (state && state.playing) {
        // Stop whatever is playing
        chrome.runtime.sendMessage({ type: "STOP_AUDIO" });
        btn.classList.remove("playing");
        btn.textContent = t("listen", currentLang);
      } else if (currentDhikr.audioUrl) {
        // Play via background (persists after popup close)
        chrome.runtime.sendMessage({
          type: "PLAY_AUDIO",
          url: currentDhikr.audioUrl,
          dhikrIdx: -2, // home tab marker
        });
        btn.classList.add("playing");
        btn.textContent = t("stopAudio", currentLang);
      } else {
        // No URL - use local speech synthesis fallback
        audio.playDhikr(currentDhikr, {
          onStart: () => {
            btn.classList.add("playing");
            btn.textContent = t("stopAudio", currentLang);
          },
          onEnd: () => {
            btn.classList.remove("playing");
            btn.textContent = t("listen", currentLang);
          },
          onError: () => {
            btn.classList.remove("playing");
            btn.textContent = t("listen", currentLang);
            showToast(t("noArabicVoice", currentLang));
          },
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  // Share Modal
  // ═══════════════════════════════════════════

  function showShareModal(dhikr) {
    if (!dhikr) return;

    const shareText = `${dhikr.arabic}\n\n${dhikr.translation || ""}\n\n📖 ${dhikr.source || ""}\n\n— أذكار المسلم (Azkar Extension)`;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <h3>${t("shareTitle", currentLang)}</h3>
        <div class="share-options">
          <button class="share-option" data-action="whatsapp"><span class="share-option-icon">💬</span><span>WhatsApp</span></button>
          <button class="share-option" data-action="telegram"><span class="share-option-icon">✈️</span><span>Telegram</span></button>
          <button class="share-option" data-action="twitter"><span class="share-option-icon">🐦</span><span>Twitter / X</span></button>
          <button class="share-option" data-action="copy"><span class="share-option-icon">📋</span><span>${t("copyText", currentLang)}</span></button>
          <button class="share-option" data-action="facebook"><span class="share-option-icon">📘</span><span>Facebook</span></button>
          <button class="share-option" data-action="email"><span class="share-option-icon">📧</span><span>Email</span></button>
        </div>
        <button class="modal-close">${t("close", currentLang)}</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll(".share-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const encodedText = encodeURIComponent(shareText);

        switch (action) {
          case "whatsapp":
            window.open(`https://wa.me/?text=${encodedText}`, "_blank");
            break;
          case "telegram":
            window.open(`https://t.me/share/url?text=${encodedText}`, "_blank");
            break;
          case "twitter":
            window.open(
              `https://twitter.com/intent/tweet?text=${encodedText}`,
              "_blank",
            );
            break;
          case "facebook":
            window.open(
              `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`,
              "_blank",
            );
            break;
          case "email":
            window.open(
              `mailto:?subject=${encodeURIComponent("أذكار المسلم - Azkar")}&body=${encodedText}`,
            );
            break;
          case "copy":
            navigator.clipboard.writeText(shareText).then(() => {
              showToast(t("copiedText", currentLang));
            });
            break;
        }
        overlay.remove();
      });
    });

    overlay
      .querySelector(".modal-close")
      .addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ═══════════════════════════════════════════
  // Daily Hadith
  // ═══════════════════════════════════════════

  const HADITH_API = "https://hadeethenc.com/api/v1";
  // Category IDs and their total page counts (from API meta)
  const HADITH_CATEGORIES = [
    { id: 1, pages: 40 }, // Quran sciences
    { id: 3, pages: 145 }, // Aqeedah
    { id: 4, pages: 364 }, // Fiqh
    { id: 5, pages: 205 }, // Virtues & manners
    { id: 6, pages: 28 }, // Dawah
    { id: 7, pages: 71 }, // Seerah
  ];

  let hadithSeenIds = new Set();

  function getHadithLang() {
    if (currentLang === "ar" || currentLang === "ur") return "ar";
    if (currentLang === "fr") return "fr";
    return "en";
  }

  async function fetchRandomHadith(retries = 3) {
    const loadingEl = document.getElementById("hadithLoading");
    const contentEl = document.getElementById("hadithContent");
    const errorEl = document.getElementById("hadithError");

    if (loadingEl) loadingEl.style.display = "flex";
    if (contentEl) contentEl.style.display = "none";
    if (errorEl) errorEl.style.display = "none";

    try {
      const lang = getHadithLang();
      // Pick a random category
      const cat =
        HADITH_CATEGORIES[Math.floor(Math.random() * HADITH_CATEGORIES.length)];
      // Pick a random page within that category (1 hadith per page)
      const page = Math.floor(Math.random() * cat.pages) + 1;

      const response = await fetch(
        `${HADITH_API}/hadeeths/list/?language=${lang}&category_id=${cat.id}&page=${page}&per_page=1`,
        { signal: AbortSignal.timeout(15000) },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (!data.data || data.data.length === 0) throw new Error("empty");

      const summary = data.data[0];

      // Skip already seen hadiths (try up to 3 times)
      if (hadithSeenIds.has(summary.id) && hadithSeenIds.size < 50) {
        return fetchRandomHadith(retries);
      }
      hadithSeenIds.add(summary.id);

      // Fetch full hadith details
      const detailRes = await fetch(
        `${HADITH_API}/hadeeths/one/?language=${lang}&id=${summary.id}`,
        { signal: AbortSignal.timeout(15000) },
      );

      if (!detailRes.ok) throw new Error(`HTTP ${detailRes.status}`);
      const hadith = await detailRes.json();

      displayHadith(hadith);
    } catch (e) {
      console.warn("[Hadith] Fetch failed:", e, `(retries left: ${retries})`);
      if (retries > 1) {
        // Wait a bit before retrying
        await new Promise((r) => setTimeout(r, 1000));
        return fetchRandomHadith(retries - 1);
      }
      if (loadingEl) loadingEl.style.display = "none";
      if (errorEl) errorEl.style.display = "flex";
    }
  }

  function displayHadith(hadith) {
    const loadingEl = document.getElementById("hadithLoading");
    const contentEl = document.getElementById("hadithContent");
    const textEl = document.getElementById("hadithText");
    const attrEl = document.getElementById("hadithAttribution");
    const gradeEl = document.getElementById("hadithGrade");

    // Use hadeeth field (full text) or title as fallback
    const text = hadith.hadeeth || hadith.title || "";
    textEl.textContent = text;
    attrEl.textContent = hadith.attribution ? `📖 ${hadith.attribution}` : "";
    gradeEl.textContent = hadith.grade || "";

    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";
  }

  function initHadith() {
    fetchRandomHadith();
    const nextBtn = document.getElementById("nextHadithBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        fetchRandomHadith();
      });
    }
  }

  // ═══════════════════════════════════════════
  // Quran Radio Tab
  // ═══════════════════════════════════════════

  function initRadioTab() {
    // Volume controls
    const volSlider = document.getElementById("radioVolume");
    const volDown = document.getElementById("radioVolDown");
    const volUp = document.getElementById("radioVolUp");
    const stopBtn = document.getElementById("radioStopBtn");
    const searchInput = document.getElementById("radioSearch");

    if (volSlider) {
      volSlider.addEventListener("input", () => {
        const vol = volSlider.value / 100;
        chrome.runtime.sendMessage({ type: "SET_RADIO_VOLUME", volume: vol });
      });
    }
    if (volDown) {
      volDown.addEventListener("click", () => {
        if (volSlider) {
          volSlider.value = Math.max(0, Number(volSlider.value) - 10);
          volSlider.dispatchEvent(new Event("input"));
        }
      });
    }
    if (volUp) {
      volUp.addEventListener("click", () => {
        if (volSlider) {
          volSlider.value = Math.min(100, Number(volSlider.value) + 10);
          volSlider.dispatchEvent(new Event("input"));
        }
      });
    }
    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "STOP_RADIO" });
        stopRadioUI();
      });
    }
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        filterRadioList(searchInput.value.trim());
      });
    }

    // Render popular reciters immediately (offline-ready)
    renderRadioList("radioPopularList", getPopularReciters(), true);

    // Restore radio state from background (in case popup was reopened)
    chrome.runtime.sendMessage({ type: "GET_RADIO_STATE" }, (state) => {
      if (state && state.playing) {
        currentRadioId = state.radioId;
        updateRadioUIFromState(state);
        // Re-render to highlight current station
        renderRadioList("radioPopularList", getPopularReciters(), true);
      }
    });
  }

  function updateRadioUIFromState(state) {
    if (!state) return;
    const npBar = document.getElementById("radioNowPlaying");
    const npName = document.getElementById("radioNpName");
    const volSlider = document.getElementById("radioVolume");

    if (state.playing) {
      currentRadioId = state.radioId;
      if (npBar) npBar.style.display = "block";
      if (npName) npName.textContent = state.radioName || "---";
      if (volSlider && state.volume != null)
        volSlider.value = Math.round(state.volume * 100);

      // Highlight playing item
      document.querySelectorAll(".radio-item").forEach((el) => {
        const isPlaying = String(el.dataset.radioId) === String(state.radioId);
        el.classList.toggle("playing", isPlaying);
        el.querySelector(".radio-item-play").textContent = isPlaying
          ? "⏸"
          : "▶";
      });
    } else {
      stopRadioUI();
    }
  }

  async function loadRadioData() {
    if (radioDataCache) return; // Already loaded

    const loadingEl = document.getElementById("radioLoading");
    if (loadingEl) loadingEl.style.display = "flex";

    try {
      const data = await getRadioData(currentLang);
      radioDataCache = data;

      // Render API stations if available
      if (data.stations && data.stations.length > 0) {
        const stationsSection = document.getElementById("radioStationsSection");
        if (stationsSection) stationsSection.style.display = "block";
        renderRadioList("radioStationsList", data.stations, false);
      }
    } catch (e) {
      console.warn("[Radio] Failed to load stations:", e);
    } finally {
      if (loadingEl) loadingEl.style.display = "none";
    }
  }

  function renderRadioList(containerId, items, isPopular) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "radio-item";
      el.dataset.radioId = item.id;
      el.dataset.radioUrl = item.url;
      el.dataset.radioName = isPopular
        ? currentLang === "ar" || currentLang === "ur"
          ? item.name_ar
          : item.name_en
        : item.name;
      el.dataset.searchText = isPopular
        ? `${item.name_ar} ${item.name_en}`.toLowerCase()
        : item.name.toLowerCase();

      if (currentRadioId === item.id) el.classList.add("playing");

      const displayName = isPopular
        ? currentLang === "ar" || currentLang === "ur"
          ? item.name_ar
          : item.name_en
        : item.name;
      const style = isPopular
        ? currentLang === "ar" || currentLang === "ur"
          ? item.style_ar
          : item.style_en
        : "";

      el.innerHTML = `
        <div class="radio-item-icon">${item.img || "📻"}</div>
        <div class="radio-item-info">
          <span class="radio-item-name">${displayName}</span>
          ${style ? `<span class="radio-item-style">${style}</span>` : ""}
        </div>
        <button class="radio-item-play">${currentRadioId === item.id ? "⏸" : "▶"}</button>
      `;

      el.addEventListener("click", () => {
        toggleRadioPlay(item.id, item.url, displayName, el);
      });

      container.appendChild(el);
    });
  }

  function toggleRadioPlay(id, url, name, itemEl) {
    // If same station is playing, stop it
    if (currentRadioId === id) {
      chrome.runtime.sendMessage({ type: "STOP_RADIO" });
      stopRadioUI();
      return;
    }

    currentRadioId = id;
    const sliderVal = document.getElementById("radioVolume")?.value;
    const volume = (sliderVal != null ? Number(sliderVal) : 80) / 100;

    // Play via background → offscreen (persists after popup close)
    chrome.runtime.sendMessage({
      type: "PLAY_RADIO",
      radioId: id,
      url: url,
      radioName: name,
      volume: volume,
    });

    // Show now playing
    const npBar = document.getElementById("radioNowPlaying");
    const npName = document.getElementById("radioNpName");
    if (npBar) npBar.style.display = "block";
    if (npName) npName.textContent = name;

    // Update UI for all items
    document.querySelectorAll(".radio-item").forEach((el) => {
      el.classList.remove("playing");
      el.querySelector(".radio-item-play").textContent = "▶";
    });
    if (itemEl) {
      itemEl.classList.add("playing");
      itemEl.querySelector(".radio-item-play").textContent = "⏸";
    }
  }

  function stopRadioUI() {
    currentRadioId = null;

    const npBar = document.getElementById("radioNowPlaying");
    if (npBar) npBar.style.display = "none";

    document.querySelectorAll(".radio-item").forEach((el) => {
      el.classList.remove("playing");
      el.querySelector(".radio-item-play").textContent = "▶";
    });
  }

  function filterRadioList(query) {
    const q = query.toLowerCase();
    document.querySelectorAll(".radio-item").forEach((el) => {
      const searchText = el.dataset.searchText || "";
      el.style.display = !q || searchText.includes(q) ? "flex" : "none";
    });
  }

  // ═══════════════════════════════════════════
  // Settings & Language
  // ═══════════════════════════════════════════

  function initSettingsButton() {
    document.getElementById("settingsBtn").addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }

  function initLanguageToggle() {
    const btn = document.getElementById("langToggle");
    const langCycle = ["ar", "en", "fr", "ur"];

    btn.addEventListener("click", () => {
      const currentIndex = langCycle.indexOf(currentLang);
      currentLang = langCycle[(currentIndex + 1) % langCycle.length];
      settings.language = currentLang;
      applySettingsToUI();
      // Rebuild dynamic content with new language
      buildCategoryChips();
      initCategoriesTab();
      if (currentDhikr) displayDhikr(currentDhikr);
      // Re-render radio list with new language
      renderRadioList("radioPopularList", getPopularReciters(), true);
      radioDataCache = null; // Reset cache so API stations reload with new lang
      saveSettings();
    });
  }

  function saveSettings() {
    API.saveSettings(settings);
  }
});
