// ===== Azkar Offscreen Audio Player =====
// Persistent audio playback that continues after popup closes
// Communicates with background service worker via messages

let currentAudio = null;

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
