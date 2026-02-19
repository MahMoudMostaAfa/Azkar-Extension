// ===== Background Service Worker =====
// Handles alarms, notifications, prayer times, and state management
// Modular structure with clear sections

import { AZKAR_DATA } from "../data/azkar.js";
import { getAzkarData, getAdhanAudioURL } from "../js/azkar-api.js";

// ─── API Azkar Data Cache (in-memory) ───
let cachedAzkarData = null;
let adhanURL = "";

// ─── Offscreen Document & Persistent Audio State ───
let offscreenReady = false;
let offscreenDocReady = false; // true once offscreen.js signals OFFSCREEN_READY

// Audio state persisted in chrome.storage.session to survive SW restarts
let audioState = {
  playing: false,
  playAllActive: false,
  playAllIndex: 0,
  playAllTotal: 0,
  playAllList: [], // [{audioUrl, arabic, originalIdx}, ...]
  playAllCategoryKey: "",
  singlePlayDhikrIdx: -1,
};

// ─── Persist / Restore audioState to survive SW shutdown ───
async function saveAudioState() {
  try {
    await chrome.storage.session.set({ _audioState: audioState });
  } catch (e) {
    // session storage not available
  }
}

async function restoreAudioState() {
  try {
    const data = await chrome.storage.session.get("_audioState");
    if (data._audioState) {
      audioState = data._audioState;
    }
  } catch (e) {
    // first run or not available
  }
}

// Restore state immediately on SW startup
restoreAudioState();

async function ensureOffscreen() {
  // Check if offscreen document already exists (handles service worker restart)
  try {
    const existing = await chrome.offscreen.hasDocument();
    if (existing) {
      offscreenReady = true;
      // If we don't know if it's ready, assume it is (already loaded)
      offscreenDocReady = true;
      return true;
    }
  } catch (e) {
    // hasDocument not available, fall through
  }

  if (offscreenReady) return true;

  try {
    offscreenDocReady = false;
    await chrome.offscreen.createDocument({
      url: "offscreen/offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Playing azkar audio recitation",
    });
    offscreenReady = true;

    // Wait for offscreen.js to signal it's ready (max 2s)
    if (!offscreenDocReady) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), 2000);
        const check = setInterval(() => {
          if (offscreenDocReady) {
            clearInterval(check);
            clearTimeout(timeout);
            resolve();
          }
        }, 50);
      });
    }
    return true;
  } catch (e) {
    if (e.message && e.message.includes("single offscreen")) {
      offscreenReady = true;
      offscreenDocReady = true;
      return true;
    }
    console.warn("[Azkar] Failed to create offscreen document:", e);
    return false;
  }
}

async function closeOffscreen() {
  if (!offscreenReady) return;
  try {
    await chrome.offscreen.closeDocument();
    offscreenReady = false;
  } catch (e) {
    offscreenReady = false;
  }
}

async function playInOffscreen(url) {
  if (!(await ensureOffscreen())) return false;
  try {
    await chrome.runtime.sendMessage({
      target: "offscreen",
      action: "play",
      url,
    });
    return true;
  } catch (e) {
    console.warn("[Azkar] Offscreen play error:", e);
    return false;
  }
}

async function stopInOffscreen() {
  try {
    await chrome.runtime.sendMessage({
      target: "offscreen",
      action: "stop",
    });
  } catch (e) {
    // ignore
  }
}

function broadcastMessage(msg) {
  try {
    chrome.runtime.sendMessage(msg).catch(() => {});
  } catch (e) {
    // popup may be closed
  }
}

function broadcastAudioState() {
  broadcastMessage({
    type: "AUDIO_STATE_UPDATE",
    state: {
      playing: audioState.playing,
      playAllActive: audioState.playAllActive,
      playAllIndex: audioState.playAllIndex,
      playAllTotal: audioState.playAllTotal,
      playAllCategoryKey: audioState.playAllCategoryKey,
      singlePlayDhikrIdx: audioState.singlePlayDhikrIdx,
      currentOriginalIdx:
        audioState.playAllActive &&
        audioState.playAllList[audioState.playAllIndex]
          ? audioState.playAllList[audioState.playAllIndex].originalIdx
          : -1,
    },
  });
}

function startPlayAllBg(azkarList, categoryKey) {
  audioState.playAllList = azkarList;
  audioState.playAllIndex = 0;
  audioState.playAllTotal = azkarList.length;
  audioState.playAllActive = true;
  audioState.playAllCategoryKey = categoryKey;
  audioState.singlePlayDhikrIdx = -1;
  saveAudioState();
  playNextInQueueBg();
}

function stopPlayAllBg() {
  audioState.playAllActive = false;
  audioState.playAllIndex = 0;
  audioState.playAllTotal = 0;
  audioState.playAllList = [];
  audioState.playAllCategoryKey = "";
  audioState.playing = false;
  audioState.singlePlayDhikrIdx = -1;
  saveAudioState();
  stopInOffscreen();
  broadcastAudioState();
}

async function playNextInQueueBg() {
  // Restore state in case SW restarted
  await restoreAudioState();

  if (
    !audioState.playAllActive ||
    audioState.playAllIndex >= audioState.playAllList.length
  ) {
    const wasActive = audioState.playAllActive;
    audioState.playAllActive = false;
    audioState.playing = false;
    await saveAudioState();
    broadcastAudioState();
    if (wasActive) {
      broadcastMessage({ type: "PLAY_ALL_FINISHED" });
    }
    chrome.alarms.create("_closeOffscreen", { delayInMinutes: 0.05 });
    return;
  }

  const dhikr = audioState.playAllList[audioState.playAllIndex];
  audioState.playing = true;
  await saveAudioState();
  broadcastAudioState();

  if (dhikr.audioUrl) {
    await playInOffscreen(dhikr.audioUrl);
  } else {
    // No audio URL - skip to next via alarm (survives SW sleep)
    audioState.playAllIndex++;
    await saveAudioState();
    chrome.alarms.create("_playNextAzkar", { delayInMinutes: 0.008 }); // ~500ms
  }
}

async function handleOffscreenAudioEvent(msg) {
  // Restore state in case SW restarted since playback started
  await restoreAudioState();

  switch (msg.event) {
    case "started":
      audioState.playing = true;
      await saveAudioState();
      broadcastAudioState();
      break;
    case "ended":
      audioState.playing = false;
      if (audioState.playAllActive) {
        audioState.playAllIndex++;
        await saveAudioState();
        // Use chrome.alarms for reliable delayed callback (survives SW sleep)
        chrome.alarms.create("_playNextAzkar", { delayInMinutes: 0.015 }); // ~900ms
      } else {
        audioState.singlePlayDhikrIdx = -1;
        await saveAudioState();
        broadcastAudioState();
        chrome.alarms.create("_closeOffscreen", { delayInMinutes: 0.05 }); // ~3s
      }
      break;
    case "error":
      audioState.playing = false;
      if (audioState.playAllActive) {
        audioState.playAllIndex++;
        await saveAudioState();
        chrome.alarms.create("_playNextAzkar", { delayInMinutes: 0.01 }); // ~600ms
      } else {
        audioState.singlePlayDhikrIdx = -1;
        await saveAudioState();
        broadcastAudioState();
      }
      break;
  }
}

// ─────────────────────────────────────────────
// Section 1: Constants & Default Settings
// ─────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  enabled: true,
  interval: 30,
  enabledCategories: [
    "morning",
    "evening",
    "general",
    "forgiveness",
    "protection",
  ],
  language: "ar",
  theme: "auto",
  fontSize: "medium",
  showTransliteration: true,
  showTranslation: true,
  showSource: true,
  audioEnabled: false,
  prayerReminders: {
    enabled: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  eventNotifications: true,
  notificationSound: true,
  popupDuration: 15,
  popupPosition: "top-right",
};

// ─────────────────────────────────────────────
// Section 2: Utility Helpers
// ─────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
  return `${now.getFullYear()}-W${weekNumber}`;
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMidnight() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

// ─────────────────────────────────────────────
// Section 3: Alarm Setup & Management
// ─────────────────────────────────────────────

/**
 * Create or recreate all necessary alarms.
 * Called on install, update, AND startup to ensure alarms persist.
 */
async function ensureAlarms(settings = null) {
  if (!settings) {
    const data = await chrome.storage.local.get("settings");
    settings = data.settings || DEFAULT_SETTINGS;
  }

  // Azkar reminder alarm
  const existingReminder = await chrome.alarms.get("azkarReminder");
  if (!existingReminder && settings.enabled) {
    chrome.alarms.create("azkarReminder", {
      delayInMinutes: settings.interval || 30,
      periodInMinutes: settings.interval || 30,
    });
    console.log(
      "[Azkar] Created azkarReminder alarm, interval:",
      settings.interval,
      "min",
    );
  }

  // Daily reset alarm (midnight)
  const existingReset = await chrome.alarms.get("dailyReset");
  if (!existingReset) {
    chrome.alarms.create("dailyReset", {
      when: getNextMidnight(),
      periodInMinutes: 24 * 60,
    });
  }

  // Prayer check alarm (every 5 minutes for better accuracy)
  const existingPrayer = await chrome.alarms.get("prayerCheck");
  if (!existingPrayer) {
    chrome.alarms.create("prayerCheck", {
      delayInMinutes: 1,
      periodInMinutes: 5,
    });
  }

  // Event check alarm (daily)
  const existingEvent = await chrome.alarms.get("eventCheck");
  if (!existingEvent) {
    chrome.alarms.create("eventCheck", {
      delayInMinutes: 5,
      periodInMinutes: 24 * 60,
    });
  }
}

// ─────────────────────────────────────────────
// Section 4: Lifecycle Events
// ─────────────────────────────────────────────

// On Install or Update: Initialize storage and create alarms
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({
      settings: DEFAULT_SETTINGS,
      progress: {
        totalCompleted: 0,
        dailyCount: {},
        weeklyCount: {},
        monthlyCount: {},
        streak: 0,
        lastActiveDate: null,
        completedAzkar: {},
      },
      customAzkar: [],
    });
    console.log("[Azkar] Extension installed, default settings saved");
  }
  // Always ensure alarms exist (on both install AND update)
  await ensureAlarms();
  // Pre-fetch azkar data from API
  await loadAzkarAPI();
});

// On Startup: Recreate alarms (Chrome clears alarms on browser restart)
chrome.runtime.onStartup.addListener(async () => {
  console.log("[Azkar] Browser startup, ensuring alarms...");
  await ensureAlarms();
  // Pre-fetch azkar data from API
  await loadAzkarAPI();
});

/**
 * Load azkar data from API into memory
 */
async function loadAzkarAPI() {
  try {
    const result = await getAzkarData(AZKAR_DATA);
    if (result.data && Object.keys(result.data).length > 0) {
      cachedAzkarData = result.data;
      console.log(
        `[Azkar] API data loaded (${result.source}), categories: ${Object.keys(cachedAzkarData).length}`,
      );
    }
  } catch (e) {
    console.warn("[Azkar] API load failed, using local data:", e);
    cachedAzkarData = AZKAR_DATA;
  }

  // Also cache adhan audio URL
  try {
    adhanURL = await getAdhanAudioURL();
    console.log("[Azkar] Adhan audio URL:", adhanURL ? "loaded" : "not found");
  } catch (e) {
    console.warn("[Azkar] Adhan URL fetch failed:", e);
  }
}

/**
 * Get the current azkar data (API or local fallback)
 */
function getActiveAzkarData() {
  return cachedAzkarData || AZKAR_DATA;
}

// ─────────────────────────────────────────────
// Section 5: Alarm Handlers
// ─────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log("[Azkar] Alarm fired:", alarm.name);
  switch (alarm.name) {
    case "azkarReminder":
      await handleAzkarReminder();
      break;
    case "dailyReset":
      await handleDailyReset();
      break;
    case "prayerCheck":
      await handlePrayerCheck();
      break;
    case "eventCheck":
      await handleEventCheck();
      break;
    case "_playNextAzkar":
      await playNextInQueueBg();
      break;
    case "_closeOffscreen":
      await closeOffscreen();
      break;
  }
});

// ─────────────────────────────────────────────
// Section 6: Azkar Notification System
// ─────────────────────────────────────────────

/**
 * Handle the azkar reminder alarm - show notification
 * Tries multiple tabs across all windows for reliability
 */
async function handleAzkarReminder() {
  const data = await chrome.storage.local.get(["settings", "customAzkar"]);
  const settings = data.settings || DEFAULT_SETTINGS;

  if (!settings.enabled) return;

  const dhikr = getRandomDhikr(settings.enabledCategories, data.customAzkar);
  if (!dhikr) return;

  // Try to show overlay on tabs (try multiple for reliability)
  let sentToTab = false;
  try {
    // First try active tabs across ALL windows
    const activeTabs = await chrome.tabs.query({ active: true });
    for (const tab of activeTabs) {
      if (sentToTab) break;
      sentToTab = await trySendOverlay(tab, dhikr, settings);
    }

    // If no active tab worked, try any regular http/https tab
    if (!sentToTab) {
      const allTabs = await chrome.tabs.query({
        url: ["http://*/*", "https://*/*"],
      });
      for (const tab of allTabs) {
        if (sentToTab) break;
        sentToTab = await trySendOverlay(tab, dhikr, settings);
      }
    }
  } catch (e) {
    console.log("[Azkar] Tab query error:", e.message);
  }

  // Always show browser notification as backup
  showBrowserNotification(dhikr);
}

/**
 * Try to send the overlay notification to a specific tab
 */
async function trySendOverlay(tab, dhikr, settings) {
  if (!tab || !tab.id || !tab.url) return false;
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("about:") ||
    tab.url.startsWith("edge://")
  )
    return false;

  // Inject content script
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content/content.js"],
    });
  } catch (e) {
    // Content script may already be injected or page restricts it
  }

  // Inject notification CSS
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content/notification.css"],
    });
  } catch (e) {
    // CSS may already be injected
  }

  // Send notification message
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_NOTIFICATION",
      dhikr: dhikr,
      settings: settings,
    });
    return response && response.success;
  } catch (e) {
    console.log("[Azkar] Could not send overlay to tab:", tab.id, e.message);
    return false;
  }
}

/**
 * Show a browser notification
 */
function showBrowserNotification(dhikr) {
  const translationText = dhikr.translation ? `\n${dhikr.translation}` : "";
  chrome.notifications.create(`azkar_${Date.now()}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "📿 أذكار المسلم - Azkar",
    message: dhikr.arabic + translationText,
    priority: 1,
    requireInteraction: false,
  });
}

/**
 * Get a random dhikr from enabled categories (uses API data when available)
 */
function getRandomDhikr(categories, customAzkar = []) {
  const data = getActiveAzkarData();
  const allAzkar = [];

  for (const category of categories) {
    if (data[category]) {
      allAzkar.push(...data[category]);
    }
  }

  if (customAzkar && customAzkar.length > 0) {
    allAzkar.push(...customAzkar);
  }

  if (allAzkar.length === 0) return getFallbackDhikr();
  return allAzkar[Math.floor(Math.random() * allAzkar.length)];
}

function getFallbackDhikr() {
  const fallbacks = [
    {
      id: "fb1",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      transliteration: "SubhanAllahi wa bihamdihi",
      translation: "How perfect Allah is and I praise Him",
      source: "صحيح مسلم",
      times: 1,
      category: "general",
    },
    {
      id: "fb2",
      arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ",
      transliteration: "La ilaha illallahu wahdahu la shareeka lah",
      translation: "None has the right to be worshipped except Allah alone",
      source: "صحيح البخاري",
      times: 1,
      category: "general",
    },
    {
      id: "fb3",
      arabic: "أَسْتَغْفِرُ اللَّهَ",
      transliteration: "Astaghfirullah",
      translation: "I ask Allah for forgiveness",
      source: "صحيح مسلم",
      times: 3,
      category: "forgiveness",
    },
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ─────────────────────────────────────────────
// Section 7: Progress Tracking
// ─────────────────────────────────────────────

async function updateProgress(progressData) {
  const data = await chrome.storage.local.get("progress");
  const progress = data.progress || {
    totalCompleted: 0,
    dailyCount: {},
    weeklyCount: {},
    monthlyCount: {},
    streak: 0,
    lastActiveDate: null,
    completedAzkar: {},
  };

  const today = getTodayKey();
  const weekKey = getWeekKey();
  const monthKey = getMonthKey();

  progress.totalCompleted = (progress.totalCompleted || 0) + 1;
  progress.dailyCount[today] = (progress.dailyCount[today] || 0) + 1;
  progress.weeklyCount[weekKey] = (progress.weeklyCount[weekKey] || 0) + 1;
  progress.monthlyCount[monthKey] = (progress.monthlyCount[monthKey] || 0) + 1;

  // Streak logic
  if (progress.lastActiveDate) {
    const lastDate = new Date(progress.lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.streak = (progress.streak || 0) + 1;
    } else if (diffDays > 1) {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }
  progress.lastActiveDate = today;

  // Track completed azkar
  if (progressData && progressData.dhikrId) {
    if (!progress.completedAzkar[today]) progress.completedAzkar[today] = [];
    if (!progress.completedAzkar[today].includes(progressData.dhikrId)) {
      progress.completedAzkar[today].push(progressData.dhikrId);
    }
  }

  cleanOldData(progress);
  await chrome.storage.local.set({ progress });
}

function cleanOldData(progress) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  for (const store of ["dailyCount", "completedAzkar"]) {
    if (progress[store]) {
      for (const key of Object.keys(progress[store])) {
        if (key < cutoffStr) delete progress[store][key];
      }
    }
  }
}

async function handleDailyReset() {
  const data = await chrome.storage.local.get("progress");
  const progress = data.progress || {};
  const today = getTodayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (
    progress.lastActiveDate !== yesterday &&
    progress.lastActiveDate !== today
  ) {
    progress.streak = 0;
  }
  await chrome.storage.local.set({ progress });
}

// ─────────────────────────────────────────────
// Section 8: Prayer Times (Aladhan API)
// ─────────────────────────────────────────────

async function fetchPrayerTimes() {
  const data = await chrome.storage.local.get([
    "settings",
    "cachedPrayerTimes",
    "userLocation",
  ]);
  const cached = data.cachedPrayerTimes;
  const today = getTodayKey();

  if (cached && cached.date === today && cached.timings) {
    return cached.timings;
  }

  let lat = 21.4225,
    lng = 39.8262,
    method = 4;
  if (data.userLocation) {
    lat = data.userLocation.lat;
    lng = data.userLocation.lng;
    method = data.userLocation.method || 4;
  }

  try {
    const dateObj = new Date();
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();

    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`;
    const response = await fetch(url);
    const json = await response.json();

    if (json.code === 200 && json.data && json.data.timings) {
      const timings = json.data.timings;
      const hijriDate = json.data.date?.hijri || null;

      await chrome.storage.local.set({
        cachedPrayerTimes: {
          date: today,
          timings,
          hijri: hijriDate,
          fetchedAt: Date.now(),
        },
      });
      return timings;
    }
  } catch (e) {
    console.warn("[Azkar] Aladhan API error:", e);
  }

  return cached?.timings || null;
}

async function fetchHijriDate() {
  // First try cached hijri from prayer times (already location-aware)
  const data = await chrome.storage.local.get([
    "cachedPrayerTimes",
    "userLocation",
  ]);
  if (data.cachedPrayerTimes?.hijri) {
    return data.cachedPrayerTimes.hijri;
  }

  // Fallback: fetch from timings API using user location (location-aware Hijri)
  try {
    let lat = 21.4225,
      lng = 39.8262,
      method = 4;
    if (data.userLocation) {
      lat = data.userLocation.lat;
      lng = data.userLocation.lng;
      method = data.userLocation.method || 4;
    }

    const dateObj = new Date();
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();

    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`;
    const response = await fetch(url);
    const json = await response.json();

    if (json.code === 200 && json.data?.date?.hijri) {
      const hijriDate = json.data.date.hijri;

      // Cache it along with timings if available
      const timings = json.data.timings || null;
      const today = getTodayKey();
      await chrome.storage.local.set({
        cachedPrayerTimes: {
          date: today,
          timings,
          hijri: hijriDate,
          fetchedAt: Date.now(),
        },
      });

      return hijriDate;
    }
  } catch (e) {
    console.warn("[Azkar] Hijri date API error:", e);
  }
  return null;
}

// ─────────────────────────────────────────────
// Section 9: Prayer Time Checking
// ─────────────────────────────────────────────

async function handlePrayerCheck() {
  const data = await chrome.storage.local.get(["settings", "notifiedPrayers"]);
  const settings = data.settings || DEFAULT_SETTINGS;

  if (!settings.prayerReminders || !settings.prayerReminders.enabled) return;

  const timings = await fetchPrayerTimes();
  if (!timings) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getTodayKey();

  const notifiedPrayers = data.notifiedPrayers || {};
  const todayNotified = notifiedPrayers[today] || [];

  const prayerMap = {
    Fajr: "fajr",
    Dhuhr: "dhuhr",
    Asr: "asr",
    Maghrib: "maghrib",
    Isha: "isha",
  };
  const prayerNames = {
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
  };

  for (const [apiKey, settingKey] of Object.entries(prayerMap)) {
    if (!settings.prayerReminders[settingKey]) continue;
    if (todayNotified.includes(apiKey)) continue;

    const timeStr = timings[apiKey];
    if (!timeStr) continue;

    const [h, m] = timeStr.split(":").map(Number);
    const prayerMinutes = h * 60 + m;

    // Notify within 5-minute window
    if (
      currentMinutes >= prayerMinutes &&
      currentMinutes <= prayerMinutes + 5
    ) {
      // Create notification with adhan audio URL
      const notifId = `prayer_${settingKey}_${today}`;
      chrome.notifications.create(notifId, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "🕌 حان وقت الصلاة - Prayer Time",
        message: `حان وقت صلاة ${prayerNames[settingKey]} (${timeStr})\nTime for ${apiKey} prayer`,
        priority: 2,
        requireInteraction: true,
      });

      // Play adhan audio via offscreen document (works even without active tab)
      if (adhanURL) {
        try {
          await playInOffscreen(adhanURL);
          // Auto-stop adhan after 60 seconds
          chrome.alarms.create("_closeOffscreen", { delayInMinutes: 1 });
        } catch (e) {
          console.warn("[Azkar] Could not play adhan audio:", e);
        }
      }

      todayNotified.push(apiKey);
      notifiedPrayers[today] = todayNotified;

      for (const key of Object.keys(notifiedPrayers)) {
        if (key < today) delete notifiedPrayers[key];
      }
      await chrome.storage.local.set({ notifiedPrayers });
    }
  }
}

// ─────────────────────────────────────────────
// Section 10: Islamic Event Checking
// ─────────────────────────────────────────────

async function handleEventCheck() {
  const data = await chrome.storage.local.get(["settings", "notifiedEvents"]);
  const settings = data.settings || DEFAULT_SETTINGS;

  if (!settings.eventNotifications) return;

  const today = new Date();
  const todayStr = getTodayKey();
  const dayOfWeek = today.getDay();

  const notifiedEvents = data.notifiedEvents || {};
  const todayNotified = notifiedEvents[todayStr] || [];

  // Monday/Thursday fasting
  if (
    (dayOfWeek === 1 || dayOfWeek === 4) &&
    !todayNotified.includes("fasting")
  ) {
    const dayName = dayOfWeek === 1 ? "Monday / الاثنين" : "Thursday / الخميس";
    chrome.notifications.create(`fasting_${todayStr}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "📅 صيام مستحب - Recommended Fasting",
      message: `Today is ${dayName}. The Prophet ﷺ used to fast on this day.\nاليوم ${dayName}. كان النبي ﷺ يصوم هذا اليوم`,
      priority: 1,
    });
    todayNotified.push("fasting");
  }

  // Hijri calendar events
  const hijri = await fetchHijriDate();
  if (hijri) {
    const hijriDay = parseInt(hijri.day);
    const hijriMonth = parseInt(hijri.month?.number || hijri.month);

    const islamicDates = {
      1: {
        1: {
          title: "🌙 رأس السنة الهجرية - Islamic New Year",
          message: "Happy Islamic New Year! عام هجري سعيد",
        },
        10: {
          title: "📅 يوم عاشوراء - Day of Ashura",
          message:
            "Today is the Day of Ashura. Fasting is recommended.\nاليوم يوم عاشوراء. يُستحب الصيام",
        },
      },
      3: {
        12: {
          title: "🌟 المولد النبوي الشريف - Mawlid",
          message:
            "Today is the birthday of Prophet Muhammad ﷺ\nاليوم ذكرى مولد النبي محمد ﷺ",
        },
      },
      7: {
        27: {
          title: "🌙 الإسراء والمعراج - Isra Mi'raj",
          message:
            "Tonight is the night of Isra and Mi'raj\nالليلة ليلة الإسراء والمعراج",
        },
      },
      8: {
        15: {
          title: "🌕 ليلة النصف من شعبان - Mid-Sha'ban",
          message:
            "Tonight is the middle of Sha'ban\nالليلة ليلة النصف من شعبان",
        },
      },
      9: {
        1: {
          title: "🌙 رمضان مبارك - Ramadan Mubarak",
          message:
            "The blessed month of Ramadan has begun!\nبدأ شهر رمضان المبارك! رمضان كريم",
        },
        27: {
          title: "✨ ليلة القدر - Laylat al-Qadr",
          message: "Tonight could be Laylat al-Qadr\nالليلة قد تكون ليلة القدر",
        },
      },
      10: {
        1: {
          title: "🎉 عيد الفطر المبارك - Eid al-Fitr",
          message: "Eid Mubarak! عيد فطر مبارك! تقبل الله منا ومنكم",
        },
      },
      12: {
        9: {
          title: "🕋 يوم عرفة - Day of Arafah",
          message:
            "Today is the Day of Arafah. Fasting is recommended.\nاليوم يوم عرفة. يُستحب صيامه",
        },
        10: {
          title: "🐑 عيد الأضحى المبارك - Eid al-Adha",
          message: "Eid Mubarak! عيد أضحى مبارك! تقبل الله منا ومنكم",
        },
      },
    };

    // White Days
    if (
      [13, 14, 15].includes(hijriDay) &&
      !todayNotified.includes("whiteDays")
    ) {
      chrome.notifications.create(`whiteDays_${todayStr}`, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "⚪ الأيام البيض - White Days",
        message: `Today is one of the White Days (${hijriDay}). Fasting is recommended.\nاليوم من الأيام البيض (${hijriDay}). يُستحب الصيام`,
        priority: 1,
      });
      todayNotified.push("whiteDays");
    }

    // Specific Islamic dates
    if (islamicDates[hijriMonth] && islamicDates[hijriMonth][hijriDay]) {
      const event = islamicDates[hijriMonth][hijriDay];
      const eventKey = `event_${hijriMonth}_${hijriDay}`;
      if (!todayNotified.includes(eventKey)) {
        chrome.notifications.create(eventKey, {
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: event.title,
          message: event.message,
          priority: 2,
          requireInteraction: true,
        });
        todayNotified.push(eventKey);
      }
    }

    // Cache Hijri date for popup
    await chrome.storage.local.set({
      currentHijri: {
        day: hijriDay,
        month: hijriMonth,
        monthName: hijri.month?.en || "",
        monthNameAr: hijri.month?.ar || "",
        year: hijri.year,
        date: todayStr,
      },
    });
  }

  notifiedEvents[todayStr] = todayNotified;
  for (const key of Object.keys(notifiedEvents)) {
    if (key < todayStr) delete notifiedEvents[key];
  }
  await chrome.storage.local.set({ notifiedEvents });
}

// ─────────────────────────────────────────────
// Section 11: Message Router
// ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_SETTINGS":
      chrome.storage.local.get("settings", (data) => {
        sendResponse(data.settings || DEFAULT_SETTINGS);
      });
      return true;

    case "SAVE_SETTINGS":
      chrome.storage.local.set({ settings: message.settings }, async () => {
        // Recreate azkar reminder with new settings
        await chrome.alarms.clear("azkarReminder");
        if (message.settings.enabled) {
          chrome.alarms.create("azkarReminder", {
            delayInMinutes: message.settings.interval || 30,
            periodInMinutes: message.settings.interval || 30,
          });
        }
        sendResponse({ success: true });
      });
      return true;

    case "GET_PROGRESS":
      chrome.storage.local.get("progress", (data) => {
        sendResponse(data.progress || {});
      });
      return true;

    case "UPDATE_PROGRESS":
      updateProgress(message.data).then(() => sendResponse({ success: true }));
      return true;

    case "GET_CUSTOM_AZKAR":
      chrome.storage.local.get("customAzkar", (data) => {
        sendResponse(data.customAzkar || []);
      });
      return true;

    case "SAVE_CUSTOM_DHIKR":
      chrome.storage.local.get("customAzkar", (data) => {
        const customAzkar = data.customAzkar || [];
        customAzkar.push(message.dhikr);
        chrome.storage.local.set({ customAzkar }, () =>
          sendResponse({ success: true }),
        );
      });
      return true;

    case "DELETE_CUSTOM_DHIKR":
      chrome.storage.local.get("customAzkar", (data) => {
        const customAzkar = (data.customAzkar || []).filter(
          (d) => d.id !== message.id,
        );
        chrome.storage.local.set({ customAzkar }, () =>
          sendResponse({ success: true }),
        );
      });
      return true;

    case "SHOW_AZKAR_NOW":
      handleAzkarReminder().then(() => sendResponse({ success: true }));
      return true;

    case "GET_RANDOM_DHIKR":
      chrome.storage.local.get("customAzkar", (data) => {
        const dhikr = getRandomDhikr(
          message.categories,
          data.customAzkar || [],
        );
        sendResponse(dhikr);
      });
      return true;

    case "COMPLETE_DHIKR":
      updateProgress({
        dhikrId: message.dhikrId,
        category: message.category,
      }).then(() => sendResponse({ success: true }));
      return true;

    case "GET_PRAYER_TIMES":
      fetchPrayerTimes().then((timings) => sendResponse(timings));
      return true;

    case "GET_HIJRI_DATE":
      fetchHijriDate().then((hijri) => sendResponse(hijri));
      return true;

    case "SAVE_LOCATION":
      chrome.storage.local.set({ userLocation: message.location }, () => {
        chrome.storage.local.remove("cachedPrayerTimes", () => {
          sendResponse({ success: true });
        });
      });
      return true;

    // ─── Offscreen Audio Commands ───

    case "OFFSCREEN_AUDIO_EVENT":
      handleOffscreenAudioEvent(message);
      break;

    case "OFFSCREEN_READY":
      offscreenDocReady = true;
      break;

    case "PLAY_AUDIO":
      (async () => {
        audioState.singlePlayDhikrIdx = message.dhikrIdx ?? -1;
        audioState.playing = true;
        await saveAudioState();
        broadcastAudioState();
        if (message.url) {
          await playInOffscreen(message.url);
        }
        sendResponse({ success: true });
      })();
      return true;

    case "STOP_AUDIO":
      (async () => {
        audioState.playing = false;
        audioState.singlePlayDhikrIdx = -1;
        stopInOffscreen();
        await saveAudioState();
        broadcastAudioState();
        sendResponse({ success: true });
      })();
      return true;

    case "START_PLAY_ALL":
      startPlayAllBg(message.azkarList, message.categoryKey);
      sendResponse({ success: true });
      return true;

    case "STOP_PLAY_ALL":
      stopPlayAllBg();
      sendResponse({ success: true });
      return true;

    case "GET_AUDIO_STATE":
      (async () => {
        await restoreAudioState();
        sendResponse({
          playing: audioState.playing,
          playAllActive: audioState.playAllActive,
          playAllIndex: audioState.playAllIndex,
          playAllTotal: audioState.playAllTotal,
          playAllCategoryKey: audioState.playAllCategoryKey,
          singlePlayDhikrIdx: audioState.singlePlayDhikrIdx,
          currentOriginalIdx:
            audioState.playAllActive &&
            audioState.playAllList[audioState.playAllIndex]
              ? audioState.playAllList[audioState.playAllIndex].originalIdx
              : -1,
        });
      })();
      return true;
  }
});
