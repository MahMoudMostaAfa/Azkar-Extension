// ===== Azkar Content Script =====
// Injected into web pages to show azkar notification overlays

(function () {
  "use strict";

  // Prevent multiple injections - but always refresh the message listener
  if (window.__azkarContentLoaded) {
    // Already loaded, nothing to do - listener is already registered
    return;
  }
  window.__azkarContentLoaded = true;

  let currentNotification = null;
  let countdownTimer = null;
  let countdownInterval = null;

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHOW_NOTIFICATION") {
      try {
        showAzkarOverlay(message.dhikr, message.settings);
        sendResponse({ success: true });
      } catch (err) {
        console.warn("[Azkar] Overlay error:", err);
        sendResponse({ success: false, error: err.message });
      }
      return true; // keep channel open only for this message type
    }
    // Ignore all other messages (audio state, offscreen, etc.)
    return false;
  });

  /**
   * Show the Azkar notification overlay on the page
   */
  function showAzkarOverlay(dhikr, settings) {
    // Remove existing notification if any
    removeExistingNotification();

    if (!dhikr) return;

    const duration = (settings.popupDuration || 30) * 1000; // Convert to ms
    const position = settings.popupPosition || "top-right";

    // Create overlay container
    const overlay = document.createElement("div");
    overlay.className = `azkar-notification-overlay ${position}`;
    overlay.id = "azkar-notification-overlay";

    // Build card HTML
    const categoryLabel = getCategoryLabel(dhikr.category);
    const showTransliteration = settings.showTransliteration !== false;
    const showTranslation = settings.showTranslation !== false;
    const showSource = settings.showSource !== false;

    overlay.innerHTML = `
      <div class="azkar-notification-card">
        <!-- Countdown Progress Ring -->
        <div class="azkar-countdown-ring">
          <svg viewBox="0 0 32 32">
            <circle class="ring-bg" cx="16" cy="16" r="14"></circle>
            <circle class="ring-progress" cx="16" cy="16" r="14"></circle>
          </svg>
          <span class="azkar-countdown-text"></span>
        </div>

        <!-- Close Button -->
        <button class="azkar-close-btn" title="إغلاق">✕</button>

        <!-- Header -->
        <div class="azkar-notif-header">
          <span class="azkar-notif-icon">🕌</span>
          <span class="azkar-notif-title">أذكار</span>
          <span class="azkar-notif-category">${categoryLabel}</span>
        </div>

        <!-- Arabic Text -->
        <div class="azkar-notif-arabic">${dhikr.arabic}</div>

        ${
          showTransliteration && dhikr.transliteration
            ? `
          <div class="azkar-notif-transliteration">${dhikr.transliteration}</div>
        `
            : ""
        }

        ${
          showTranslation && dhikr.translation
            ? `
          <div class="azkar-notif-translation">${dhikr.translation}</div>
        `
            : ""
        }

        <!-- Meta Info -->
        <div class="azkar-notif-meta">
          ${
            showSource && dhikr.source
              ? `
            <span class="azkar-notif-source">📖 ${dhikr.source}</span>
          `
              : "<span></span>"
          }
          <span class="azkar-notif-times">${dhikr.times > 1 ? `مرات: ${toArabicNum(dhikr.times)}` : ""}</span>
        </div>

        <!-- Bottom Progress Bar (Decreasing Rounded Line) -->
        <div class="azkar-progress-bar">
          <div class="azkar-progress-fill"></div>
        </div>
      </div>
    `;

    // Append to page
    document.body.appendChild(overlay);
    currentNotification = overlay;

    // Setup close button
    const closeBtn = overlay.querySelector(".azkar-close-btn");
    closeBtn.addEventListener("click", () => {
      dismissNotification();
    });

    // Start countdown animation
    startCountdown(overlay, duration);

    // Play notification sound if enabled
    if (settings.notificationSound) {
      playNotificationSound();
    }
  }

  /**
   * Start the countdown timer with decreasing ring and progress bar
   */
  function startCountdown(overlay, duration) {
    const ringProgress = overlay.querySelector(".ring-progress");
    const progressFill = overlay.querySelector(".azkar-progress-fill");
    const countdownText = overlay.querySelector(".azkar-countdown-text");

    const circumference = 2 * Math.PI * 14; // r=14
    ringProgress.style.strokeDasharray = circumference;
    ringProgress.style.strokeDashoffset = 0;

    const totalSeconds = Math.floor(duration / 1000);
    let remainingSeconds = totalSeconds;
    const startTime = Date.now();

    // Update countdown every second
    countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      remainingSeconds = Math.max(0, Math.ceil((duration - elapsed) / 1000));

      // Update countdown text
      countdownText.textContent = remainingSeconds;

      // Calculate progress (1 -> 0)
      const progress = Math.max(0, 1 - elapsed / duration);

      // Update ring
      const offset = circumference * (1 - progress);
      ringProgress.style.strokeDashoffset = offset;

      // Update bottom progress bar
      progressFill.style.width = progress * 100 + "%";

      // Color changes based on remaining time
      const ratio = progress;
      if (ratio <= 0.15) {
        ringProgress.classList.add("critical");
        ringProgress.classList.remove("ending");
        progressFill.classList.add("critical");
        progressFill.classList.remove("ending");
      } else if (ratio <= 0.35) {
        ringProgress.classList.add("ending");
        ringProgress.classList.remove("critical");
        progressFill.classList.add("ending");
        progressFill.classList.remove("critical");
      }

      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval);
      }
    }, 200);

    // Auto-dismiss after duration
    countdownTimer = setTimeout(() => {
      dismissNotification();
    }, duration);
  }

  /**
   * Dismiss the notification with animation
   */
  function dismissNotification() {
    if (!currentNotification) return;

    // Clear timers
    if (countdownTimer) {
      clearTimeout(countdownTimer);
      countdownTimer = null;
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    // Add hide animation
    currentNotification.classList.add("hiding");

    // Remove after animation completes
    setTimeout(() => {
      if (currentNotification && currentNotification.parentNode) {
        currentNotification.parentNode.removeChild(currentNotification);
      }
      currentNotification = null;
    }, 400);
  }

  /**
   * Remove existing notification immediately
   */
  function removeExistingNotification() {
    if (countdownTimer) {
      clearTimeout(countdownTimer);
      countdownTimer = null;
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const existing = document.getElementById("azkar-notification-overlay");
    if (existing) {
      existing.parentNode.removeChild(existing);
    }
    currentNotification = null;
  }

  /**
   * Get human-readable category label in Arabic
   */
  function getCategoryLabel(category) {
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
   * Convert number to Arabic numerals
   */
  function toArabicNum(num) {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(num).replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
  }

  /**
   * Play a beautiful, calming notification sound (Islamic-inspired chime)
   * Uses Web Audio API to create a pleasant multi-tone bell sequence
   */
  function playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Create a reverb-like effect using a convolver
      const master = audioCtx.createGain();
      master.gain.setValueAtTime(0.12, now);
      master.connect(audioCtx.destination);

      // Bell chime sequence — pentatonic scale notes (warm, peaceful)
      const notes = [
        { freq: 523.25, start: 0, duration: 1.2 }, // C5
        { freq: 659.25, start: 0.15, duration: 1.0 }, // E5
        { freq: 783.99, start: 0.3, duration: 0.9 }, // G5
        { freq: 1046.5, start: 0.5, duration: 1.5 }, // C6 (resolve)
      ];

      notes.forEach((note) => {
        // Oscillator for the tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        // Gentle attack, slow decay — bell-like envelope
        gain.gain.setValueAtTime(0, now + note.start);
        gain.gain.linearRampToValueAtTime(0.3, now + note.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          now + note.start + note.duration,
        );

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + note.start);
        osc.stop(now + note.start + note.duration);

        // Add a subtle harmonic overtone for richness
        const harmonic = audioCtx.createOscillator();
        const hGain = audioCtx.createGain();
        harmonic.type = "sine";
        harmonic.frequency.setValueAtTime(note.freq * 2, now + note.start);
        hGain.gain.setValueAtTime(0, now + note.start);
        hGain.gain.linearRampToValueAtTime(0.05, now + note.start + 0.02);
        hGain.gain.exponentialRampToValueAtTime(
          0.001,
          now + note.start + note.duration * 0.7,
        );

        harmonic.connect(hGain);
        hGain.connect(master);
        harmonic.start(now + note.start);
        harmonic.stop(now + note.start + note.duration);
      });

      // Fade out master
      master.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    } catch (e) {
      // Silent fail — audio not critical
    }
  }
})();
