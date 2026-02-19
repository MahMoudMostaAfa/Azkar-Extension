// ===== Audio Service Module =====
// Handles all audio playback: URL-based audio, Web Speech API, and adhan

/**
 * AudioService manages speech synthesis and audio playback for azkar recitation
 * Supports: URL-based audio files, Web Speech API, and adhan playback
 */
export class AudioService {
  constructor() {
    this.isPlaying = false;
    this.utterance = null;
    this.arabicVoice = null;
    this.voicesLoaded = false;
    this._currentAudio = null; // HTMLAudioElement for URL playback
    this._adhanAudio = null; // Separate adhan audio element
    this._initVoices();
  }

  /**
   * Initialize and load Arabic voices
   */
  _initVoices() {
    if (!("speechSynthesis" in window)) return;

    // Try loading immediately
    this._findArabicVoice();

    // Also listen for async voice loading (Chrome loads voices asynchronously)
    speechSynthesis.onvoiceschanged = () => {
      this._findArabicVoice();
    };

    // Force voice loading by calling getVoices multiple times
    // (Chrome sometimes needs a nudge)
    setTimeout(() => this._findArabicVoice(), 100);
    setTimeout(() => this._findArabicVoice(), 500);
    setTimeout(() => this._findArabicVoice(), 1000);
  }

  /**
   * Find the best available Arabic voice
   */
  _findArabicVoice() {
    if (!("speechSynthesis" in window)) return;

    const voices = speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    this.voicesLoaded = true;

    // Priority: local Arabic voice > remote Arabic voice > any Arabic voice
    this.arabicVoice =
      voices.find((v) => v.lang.startsWith("ar") && v.localService) ||
      voices.find((v) => v.lang.startsWith("ar")) ||
      voices.find((v) => v.lang.includes("ar")) ||
      null;
  }

  /**
   * Check if speech synthesis is available
   * @returns {boolean}
   */
  isAvailable() {
    return "speechSynthesis" in window;
  }

  /**
   * Check if an Arabic voice is available
   * @returns {boolean}
   */
  hasArabicVoice() {
    if (!this.voicesLoaded) {
      this._findArabicVoice();
    }
    return this.arabicVoice !== null;
  }

  /**
   * Get available voice info for debugging/display
   * @returns {{ total: number, arabic: boolean, voiceName: string }}
   */
  getVoiceInfo() {
    if (!this.isAvailable()) {
      return { total: 0, arabic: false, voiceName: "" };
    }
    const voices = speechSynthesis.getVoices();
    return {
      total: voices.length,
      arabic: this.arabicVoice !== null,
      voiceName: this.arabicVoice ? this.arabicVoice.name : "",
    };
  }

  /**
   * Speak the given Arabic text
   * @param {string} text - Arabic text to speak
   * @param {Object} callbacks - { onStart, onEnd, onError }
   * @returns {boolean} - Whether speech started successfully
   */
  speak(text, callbacks = {}) {
    if (!this.isAvailable()) {
      if (callbacks.onError) callbacks.onError("not_supported");
      return false;
    }

    // Stop any current playback first
    this.stop();

    // Ensure voices are loaded
    if (!this.voicesLoaded) {
      this._findArabicVoice();
    }

    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = "ar-SA";
    this.utterance.rate = 0.75;
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;

    // Set Arabic voice if available
    if (this.arabicVoice) {
      this.utterance.voice = this.arabicVoice;
    }

    // Event handlers
    this.utterance.onstart = () => {
      this.isPlaying = true;
      if (callbacks.onStart) callbacks.onStart();
    };

    this.utterance.onend = () => {
      this.isPlaying = false;
      this.utterance = null;
      if (callbacks.onEnd) callbacks.onEnd();
    };

    this.utterance.onerror = (e) => {
      this.isPlaying = false;
      this.utterance = null;
      console.warn("Speech synthesis error:", e.error);
      if (callbacks.onError) callbacks.onError(e.error);
    };

    // Speak with a small delay (Chrome bug workaround)
    setTimeout(() => {
      try {
        speechSynthesis.speak(this.utterance);
      } catch (err) {
        this.isPlaying = false;
        if (callbacks.onError) callbacks.onError("exception");
      }
    }, 50);

    return true;
  }

  /**
   * Stop current speech/audio playback
   */
  stop() {
    // Stop speech synthesis
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    // Stop URL-based audio
    if (this._currentAudio) {
      try {
        this._currentAudio.pause();
        this._currentAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this._currentAudio = null;
    }
    this.isPlaying = false;
    this.utterance = null;
  }

  /**
   * Toggle play/stop
   * @param {string} text
   * @param {Object} callbacks
   */
  toggle(text, callbacks = {}) {
    if (this.isPlaying) {
      this.stop();
      if (callbacks.onEnd) callbacks.onEnd();
    } else {
      this.speak(text, callbacks);
    }
  }

  // ═══════════════════════════════════════════
  // URL-based Audio Playback
  // ═══════════════════════════════════════════

  /**
   * Play audio from a URL (for API-provided azkar audio)
   * Falls back to Web Speech API if URL fails
   * @param {string} url - Audio file URL
   * @param {string} [fallbackText] - Arabic text for speech fallback
   * @param {Object} callbacks - { onStart, onEnd, onError }
   * @returns {boolean}
   */
  playFromURL(url, fallbackText = "", callbacks = {}) {
    if (!url) {
      // No URL → use speech synthesis
      if (fallbackText) return this.speak(fallbackText, callbacks);
      if (callbacks.onError) callbacks.onError("no_url");
      return false;
    }

    // Stop any current playback
    this.stop();

    try {
      this._currentAudio = new Audio(url);
      this._currentAudio.volume = 1.0;

      this._currentAudio.addEventListener(
        "canplaythrough",
        () => {
          this.isPlaying = true;
          if (callbacks.onStart) callbacks.onStart();
        },
        { once: true },
      );

      this._currentAudio.addEventListener(
        "ended",
        () => {
          this.isPlaying = false;
          this._currentAudio = null;
          if (callbacks.onEnd) callbacks.onEnd();
        },
        { once: true },
      );

      this._currentAudio.addEventListener(
        "error",
        (e) => {
          console.warn("[Audio] URL playback error:", e);
          this.isPlaying = false;
          this._currentAudio = null;
          // Fallback to speech synthesis
          if (fallbackText) {
            this.speak(fallbackText, callbacks);
          } else if (callbacks.onError) {
            callbacks.onError("url_error");
          }
        },
        { once: true },
      );

      this._currentAudio.play().catch((err) => {
        console.warn("[Audio] play() rejected:", err);
        this._currentAudio = null;
        if (fallbackText) {
          this.speak(fallbackText, callbacks);
        } else if (callbacks.onError) {
          callbacks.onError("play_rejected");
        }
      });

      return true;
    } catch (e) {
      console.warn("[Audio] playFromURL exception:", e);
      if (fallbackText) return this.speak(fallbackText, callbacks);
      if (callbacks.onError) callbacks.onError("exception");
      return false;
    }
  }

  /**
   * Smart play: tries URL audio first, falls back to speech
   * @param {Object} dhikr - Dhikr object with audioUrl and arabic fields
   * @param {Object} callbacks - { onStart, onEnd, onError }
   */
  playDhikr(dhikr, callbacks = {}) {
    if (!dhikr) return false;

    if (dhikr.audioUrl) {
      return this.playFromURL(dhikr.audioUrl, dhikr.arabic, callbacks);
    }
    return this.speak(dhikr.arabic, callbacks);
  }

  // ═══════════════════════════════════════════
  // Adhan Playback
  // ═══════════════════════════════════════════

  /**
   * Play adhan audio from URL
   * @param {string} url - Adhan audio URL
   * @param {Object} callbacks - { onStart, onEnd, onError }
   */
  playAdhan(url, callbacks = {}) {
    this.stopAdhan();

    if (!url) {
      // Use notification chime as fallback
      playNotificationChime();
      if (callbacks.onStart) callbacks.onStart();
      setTimeout(() => {
        if (callbacks.onEnd) callbacks.onEnd();
      }, 3000);
      return;
    }

    try {
      this._adhanAudio = new Audio(url);
      this._adhanAudio.volume = 0.8;

      this._adhanAudio.addEventListener(
        "canplaythrough",
        () => {
          if (callbacks.onStart) callbacks.onStart();
        },
        { once: true },
      );

      this._adhanAudio.addEventListener(
        "ended",
        () => {
          this._adhanAudio = null;
          if (callbacks.onEnd) callbacks.onEnd();
        },
        { once: true },
      );

      this._adhanAudio.addEventListener(
        "error",
        () => {
          this._adhanAudio = null;
          // Fallback to chime
          playNotificationChime();
          if (callbacks.onError) callbacks.onError("adhan_error");
        },
        { once: true },
      );

      this._adhanAudio.play().catch(() => {
        this._adhanAudio = null;
        playNotificationChime();
        if (callbacks.onError) callbacks.onError("adhan_rejected");
      });
    } catch (e) {
      playNotificationChime();
      if (callbacks.onError) callbacks.onError("adhan_exception");
    }
  }

  /**
   * Stop adhan playback
   */
  stopAdhan() {
    if (this._adhanAudio) {
      try {
        this._adhanAudio.pause();
        this._adhanAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this._adhanAudio = null;
    }
  }

  /**
   * Check if adhan is currently playing
   */
  get isAdhanPlaying() {
    return (
      this._adhanAudio !== null &&
      !this._adhanAudio.paused &&
      !this._adhanAudio.ended
    );
  }
}

/**
 * Play a notification chime sound using Web Audio API
 * A calming, Islamic-inspired bell sequence
 */
export function playNotificationChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.12, now);
    master.connect(audioCtx.destination);

    // Pentatonic bell chime sequence (warm, peaceful)
    const notes = [
      { freq: 523.25, start: 0, duration: 1.2 }, // C5
      { freq: 659.25, start: 0.15, duration: 1.0 }, // E5
      { freq: 783.99, start: 0.3, duration: 0.9 }, // G5
      { freq: 1046.5, start: 0.5, duration: 1.5 }, // C6
    ];

    notes.forEach((note) => {
      // Main tone
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.start);
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

      // Subtle harmonic overtone
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

    master.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  } catch (e) {
    // Silent fail — audio not critical
  }
}
