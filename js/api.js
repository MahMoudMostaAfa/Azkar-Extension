// ===== Background API Communication Module =====
// Wraps chrome.runtime.sendMessage for cleaner popup<->background communication

/**
 * Send a message to the background service worker and get a response
 * @param {string} type - Message type
 * @param {Object} data - Additional data to send
 * @returns {Promise<any>}
 */
function sendMessage(type, data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Message error:", chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    } catch (err) {
      console.warn("sendMessage exception:", err);
      resolve(null);
    }
  });
}

/** Get current settings from background */
export function getSettings() {
  return sendMessage("GET_SETTINGS");
}

/** Save settings to background (also updates alarms) */
export function saveSettings(settings) {
  return sendMessage("SAVE_SETTINGS", { settings });
}

/** Get progress data */
export function getProgress() {
  return sendMessage("GET_PROGRESS");
}

/** Update progress with dhikr completion data */
export function updateProgress(data) {
  return sendMessage("UPDATE_PROGRESS", { data });
}

/** Get custom azkar list */
export function getCustomAzkar() {
  return sendMessage("GET_CUSTOM_AZKAR");
}

/** Save a new custom dhikr */
export function saveCustomDhikr(dhikr) {
  return sendMessage("SAVE_CUSTOM_DHIKR", { dhikr });
}

/** Delete a custom dhikr by ID */
export function deleteCustomDhikr(id) {
  return sendMessage("DELETE_CUSTOM_DHIKR", { id });
}

/** Trigger an immediate azkar notification */
export function showAzkarNow() {
  return sendMessage("SHOW_AZKAR_NOW");
}

/** Get a random dhikr from the given categories */
export function getRandomDhikr(categories) {
  return sendMessage("GET_RANDOM_DHIKR", { categories });
}

/** Mark a dhikr as completed */
export function completeDhikr(dhikrId, category) {
  return sendMessage("COMPLETE_DHIKR", { dhikrId, category });
}

/** Get prayer times from Aladhan API (via background) */
export function getPrayerTimes() {
  return sendMessage("GET_PRAYER_TIMES");
}

/** Get today's Hijri date */
export function getHijriDate() {
  return sendMessage("GET_HIJRI_DATE");
}

/** Save user location for prayer times */
export function saveLocation(location) {
  return sendMessage("SAVE_LOCATION", { location });
}
