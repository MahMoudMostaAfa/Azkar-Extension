// ===== Options Page Script =====
import { AZKAR_CATEGORIES } from "../data/azkar.js";

document.addEventListener("DOMContentLoaded", async () => {
  let settings = {};

  // Load settings
  await loadSettings();
  buildCategoriesList();
  bindEvents();
  loadLocationSettings();
  loadPrayerTimesPreview();

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
        settings = response || getDefaults();
        applyToUI();
        resolve();
      });
    });
  }

  function getDefaults() {
    return {
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
  }

  function applyToUI() {
    document.getElementById("enableReminder").checked =
      settings.enabled !== false;
    document.getElementById("interval").value = settings.interval || 30;
    document.getElementById("popupDuration").value =
      settings.popupDuration || 15;
    document.getElementById("popupPosition").value =
      settings.popupPosition || "top-right";
    document.getElementById("theme").value = settings.theme || "auto";
    document.getElementById("fontSize").value = settings.fontSize || "medium";
    document.getElementById("language").value = settings.language || "ar";
    document.getElementById("showTransliteration").checked =
      settings.showTransliteration !== false;
    document.getElementById("showTranslation").checked =
      settings.showTranslation !== false;
    document.getElementById("showSource").checked =
      settings.showSource !== false;
    document.getElementById("audioEnabled").checked =
      settings.audioEnabled === true;
    document.getElementById("notificationSound").checked =
      settings.notificationSound !== false;
    document.getElementById("eventNotifications").checked =
      settings.eventNotifications !== false;

    // Prayer reminders
    const pr = settings.prayerReminders || {};
    document.getElementById("prayerEnabled").checked = pr.enabled !== false;
    document.getElementById("prayerFajr").checked = pr.fajr !== false;
    document.getElementById("prayerDhuhr").checked = pr.dhuhr !== false;
    document.getElementById("prayerAsr").checked = pr.asr !== false;
    document.getElementById("prayerMaghrib").checked = pr.maghrib !== false;
    document.getElementById("prayerIsha").checked = pr.isha !== false;
  }

  function gatherFromUI() {
    settings.enabled = document.getElementById("enableReminder").checked;
    settings.interval = parseInt(document.getElementById("interval").value);
    settings.popupDuration = parseInt(
      document.getElementById("popupDuration").value,
    );
    settings.popupPosition = document.getElementById("popupPosition").value;
    settings.theme = document.getElementById("theme").value;
    settings.fontSize = document.getElementById("fontSize").value;
    settings.language = document.getElementById("language").value;
    settings.showTransliteration = document.getElementById(
      "showTransliteration",
    ).checked;
    settings.showTranslation =
      document.getElementById("showTranslation").checked;
    settings.showSource = document.getElementById("showSource").checked;
    settings.audioEnabled = document.getElementById("audioEnabled").checked;
    settings.notificationSound =
      document.getElementById("notificationSound").checked;
    settings.eventNotifications =
      document.getElementById("eventNotifications").checked;

    settings.prayerReminders = {
      enabled: document.getElementById("prayerEnabled").checked,
      fajr: document.getElementById("prayerFajr").checked,
      dhuhr: document.getElementById("prayerDhuhr").checked,
      asr: document.getElementById("prayerAsr").checked,
      maghrib: document.getElementById("prayerMaghrib").checked,
      isha: document.getElementById("prayerIsha").checked,
    };

    // Categories
    const categoryToggles = document.querySelectorAll(".category-checkbox");
    settings.enabledCategories = [];
    categoryToggles.forEach((toggle) => {
      if (toggle.checked) {
        settings.enabledCategories.push(toggle.dataset.category);
      }
    });
  }

  function buildCategoriesList() {
    const container = document.getElementById("categoriesList");
    container.innerHTML = "";

    const enabledCats = settings.enabledCategories || [];

    for (const [key, cat] of Object.entries(AZKAR_CATEGORIES)) {
      const div = document.createElement("div");
      div.className = "category-toggle";
      div.innerHTML = `
        <label class="switch">
          <input type="checkbox" class="category-checkbox" data-category="${key}" ${enabledCats.includes(key) ? "checked" : ""}>
          <span class="slider"></span>
        </label>
        <div class="category-toggle-info">
          <div class="category-toggle-name">${cat.icon} ${cat.nameAr}</div>
          <div class="category-toggle-name-en">${cat.nameEn}</div>
        </div>
      `;
      container.appendChild(div);
    }
  }

  function bindEvents() {
    // Save button
    document.getElementById("saveBtn").addEventListener("click", () => {
      gatherFromUI();
      chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings }, () => {
        const status = document.getElementById("saveStatus");
        status.textContent = "✅ تم حفظ الإعدادات بنجاح!";
        status.classList.add("show");
        setTimeout(() => status.classList.remove("show"), 3000);
      });
    });

    // Export
    document.getElementById("exportBtn").addEventListener("click", async () => {
      const data = await chrome.storage.local.get(null);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "azkar-settings-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import
    document.getElementById("importBtn").addEventListener("click", () => {
      document.getElementById("importFile").click();
    });

    document.getElementById("importFile").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          await chrome.storage.local.set(data);
          settings = data.settings || settings;
          applyToUI();
          buildCategoriesList();
          alert("✅ تم استيراد الإعدادات بنجاح!");
        } catch (err) {
          alert("❌ خطأ في قراءة الملف");
        }
      };
      reader.readAsText(file);
    });

    // Reset
    document.getElementById("resetBtn").addEventListener("click", async () => {
      if (
        confirm(
          "هل أنت متأكد من إعادة تعيين جميع الإعدادات؟\nAre you sure you want to reset all settings?",
        )
      ) {
        settings = getDefaults();
        await chrome.storage.local.set({
          settings,
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
        applyToUI();
        buildCategoriesList();
        alert("🔄 تمت إعادة التعيين بنجاح!");
      }
    });

    // Detect location button
    document
      .getElementById("detectLocationBtn")
      .addEventListener("click", detectLocation);

    // Save location when lat/lng/method changes
    document
      .getElementById("latitude")
      .addEventListener("change", saveLocation);
    document
      .getElementById("longitude")
      .addEventListener("change", saveLocation);
    document
      .getElementById("calcMethod")
      .addEventListener("change", saveLocation);
  }

  // ===== Location =====
  async function loadLocationSettings() {
    const data = await chrome.storage.local.get("userLocation");
    if (data.userLocation) {
      document.getElementById("latitude").value = data.userLocation.lat || "";
      document.getElementById("longitude").value = data.userLocation.lng || "";
      document.getElementById("calcMethod").value =
        data.userLocation.method || 4;
    }
  }

  function detectLocation() {
    const status = document.getElementById("locationStatus");
    const btn = document.getElementById("detectLocationBtn");

    status.className = "location-status loading";
    status.textContent = "⏳ جاري تحديد الموقع... Detecting location...";
    btn.disabled = true;

    if (!navigator.geolocation) {
      status.className = "location-status error";
      status.textContent = "❌ المتصفح لا يدعم تحديد الموقع";
      btn.disabled = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);

        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        await saveLocation();

        status.className = "location-status success";
        status.textContent = `✅ تم تحديد الموقع: ${lat}, ${lng}`;
        btn.disabled = false;

        // Refresh prayer times preview
        await loadPrayerTimesPreview();
      },
      (error) => {
        status.className = "location-status error";
        const msgs = {
          1: "❌ تم رفض الإذن - Permission denied. Please allow location access.",
          2: "❌ الموقع غير متاح - Position unavailable",
          3: "❌ انتهى الوقت - Detection timed out",
        };
        status.textContent = msgs[error.code] || "❌ خطأ في تحديد الموقع";
        btn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function saveLocation() {
    const lat = parseFloat(document.getElementById("latitude").value);
    const lng = parseFloat(document.getElementById("longitude").value);
    const method = parseInt(document.getElementById("calcMethod").value);

    if (isNaN(lat) || isNaN(lng)) return;

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "SAVE_LOCATION", location: { lat, lng, method } },
        () => {
          loadPrayerTimesPreview();
          resolve();
        },
      );
    });
  }

  async function loadPrayerTimesPreview() {
    const preview = document.getElementById("prayerTimesPreview");

    try {
      const timings = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "GET_PRAYER_TIMES" }, resolve);
      });

      if (!timings) {
        preview.classList.remove("visible");
        return;
      }

      const prayers = [
        { key: "Fajr", name: "الفجر", icon: "🌅" },
        { key: "Dhuhr", name: "الظهر", icon: "☀️" },
        { key: "Asr", name: "العصر", icon: "🌤️" },
        { key: "Maghrib", name: "المغرب", icon: "🌅" },
        { key: "Isha", name: "العشاء", icon: "🌙" },
      ];

      preview.innerHTML = `
        <h4>🕌 مواقيت الصلاة اليوم - Today's Prayer Times</h4>
        <div class="prayer-times-grid">
          ${prayers
            .map(
              (p) => `
            <div class="prayer-time-item">
              <span class="prayer-name">${p.icon} ${p.name}</span>
              <span class="prayer-time">${timings[p.key] || "--:--"}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
      preview.classList.add("visible");
    } catch (e) {
      preview.classList.remove("visible");
    }
  }
});
