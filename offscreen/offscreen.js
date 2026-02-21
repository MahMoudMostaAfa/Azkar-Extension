// ===== Azkar Offscreen Audio Player =====
// Persistent audio playback that continues after popup closes
// Communicates with background service worker via messages

let currentAudio = null;
let radioAudio = null; // Separate audio element for Quran radio streams

// Signal that offscreen document is ready
chrome.runtime.sendMessage({ type: "OFFSCREEN_READY" }).catch(() => {});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== "offscreen") return false; // ignore non-targeted messages

  switch (msg.action) {
    case "play":
      playAudio(msg.url);
      sendResponse({ ok: true });
      break;
    case "stop":
      stopAudio();
      sendResponse({ ok: true });
      break;
    case "play_radio":
      playRadio(msg.url, msg.volume);
      sendResponse({ ok: true });
      break;
    case "stop_radio":
      stopRadio();
      sendResponse({ ok: true });
      break;
    case "set_radio_volume":
      if (radioAudio) radioAudio.volume = Math.max(0, Math.min(1, msg.volume));
      sendResponse({ ok: true });
      break;
  }
  return false;
});

function playAudio(url) {
  stopAudio();

  if (!url) {
    chrome.runtime
      .sendMessage({
        type: "OFFSCREEN_AUDIO_EVENT",
        event: "error",
        detail: "no_url",
      })
      .catch(() => {});
    return;
  }

  try {
    currentAudio = new Audio(url);
    currentAudio.volume = 1.0;

    currentAudio.addEventListener(
      "canplaythrough",
      () => {
        chrome.runtime
          .sendMessage({
            type: "OFFSCREEN_AUDIO_EVENT",
            event: "started",
          })
          .catch(() => {});
      },
      { once: true },
    );

    currentAudio.addEventListener(
      "ended",
      () => {
        currentAudio = null;
        chrome.runtime
          .sendMessage({
            type: "OFFSCREEN_AUDIO_EVENT",
            event: "ended",
          })
          .catch(() => {});
      },
      { once: true },
    );

    currentAudio.addEventListener(
      "error",
      () => {
        currentAudio = null;
        chrome.runtime
          .sendMessage({
            type: "OFFSCREEN_AUDIO_EVENT",
            event: "error",
            detail: "playback_error",
          })
          .catch(() => {});
      },
      { once: true },
    );

    currentAudio.play().catch(() => {
      currentAudio = null;
      chrome.runtime
        .sendMessage({
          type: "OFFSCREEN_AUDIO_EVENT",
          event: "error",
          detail: "play_rejected",
        })
        .catch(() => {});
    });
  } catch (e) {
    currentAudio = null;
    chrome.runtime
      .sendMessage({
        type: "OFFSCREEN_AUDIO_EVENT",
        event: "error",
        detail: "exception",
      })
      .catch(() => {});
  }
}

function stopAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }
}

// ─── Quran Radio (persistent stream) ───

function playRadio(url, volume = 0.8) {
  stopRadio();

  if (!url) {
    chrome.runtime
      .sendMessage({
        type: "OFFSCREEN_RADIO_EVENT",
        event: "error",
        detail: "no_url",
      })
      .catch(() => {});
    return;
  }

  try {
    const audio = new Audio(url);
    radioAudio = audio;
    audio.volume = Math.max(0, Math.min(1, volume));

    audio.addEventListener(
      "playing",
      () => {
        if (radioAudio !== audio) return; // stale reference
        chrome.runtime
          .sendMessage({
            type: "OFFSCREEN_RADIO_EVENT",
            event: "started",
          })
          .catch(() => {});
      },
      { once: true },
    );

    audio.addEventListener("error", () => {
      if (radioAudio !== audio) return; // stale reference
      radioAudio = null;
      chrome.runtime
        .sendMessage({
          type: "OFFSCREEN_RADIO_EVENT",
          event: "error",
          detail: "playback_error",
        })
        .catch(() => {});
    });

    // For live streams, 'ended' is unusual but handle it
    audio.addEventListener(
      "ended",
      () => {
        if (radioAudio !== audio) return; // stale reference
        radioAudio = null;
        chrome.runtime
          .sendMessage({
            type: "OFFSCREEN_RADIO_EVENT",
            event: "ended",
          })
          .catch(() => {});
      },
      { once: true },
    );

    audio.play().catch(() => {
      if (radioAudio === audio) radioAudio = null;
      chrome.runtime
        .sendMessage({
          type: "OFFSCREEN_RADIO_EVENT",
          event: "error",
          detail: "play_rejected",
        })
        .catch(() => {});
    });
  } catch (e) {
    radioAudio = null;
    chrome.runtime
      .sendMessage({
        type: "OFFSCREEN_RADIO_EVENT",
        event: "error",
        detail: "exception",
      })
      .catch(() => {});
  }
}

function stopRadio() {
  if (radioAudio) {
    const audio = radioAudio;
    radioAudio = null;
    try {
      audio.pause();
      audio.removeAttribute("src");
      audio.load(); // fully release the network connection
    } catch (e) {
      // ignore
    }
  }
}
