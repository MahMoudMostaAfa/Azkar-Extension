// ===== Popup Main Script (Modular) =====
import { AZKAR_DATA, AZKAR_CATEGORIES } from "../data/azkar.js";
import { ISLAMIC_EVENTS } from "../data/events.js";
import {
  toArabicNum,
  getTodayKey,
  getWeekKey,
  getMonthKey,
  showToast,
} from "../js/utils.js";
import { t, applyTranslations, applyLanguageDirection } from "../js/i18n.js";
import { AudioService } from "../js/audio.js";
import * as API from "../js/api.js";
import {
  getAzkarData,
  getAdhanAudioURL,
  API_CATEGORIES,
} from "../js/azkar-api.js";

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
  initEventsTab();
  initCustomTab();
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
          el.querySelector(".pt-time").textContent = timeStr;
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
    const circumference = 2 * Math.PI * 42;
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
  // Events Tab
  // ═══════════════════════════════════════════

  function initEventsTab() {
    const list = document.getElementById("eventsList");
    list.innerHTML = "";

    ISLAMIC_EVENTS.forEach((event) => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <span class="event-icon">${event.icon}</span>
        <div class="event-info">
          <div class="event-name-ar">${event.nameAr}</div>
          <div class="event-name-en">${event.nameEn}</div>
          <div class="event-description">${event.description}</div>
        </div>
      `;
      list.appendChild(card);
    });
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
      saveSettings();
    });
  }

  function saveSettings() {
    API.saveSettings(settings);
  }
});
