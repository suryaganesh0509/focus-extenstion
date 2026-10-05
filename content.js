// Function to toggle full screen
function toggleFocusMode() {
  const isFullScreen = Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement
  );

  if (!isFullScreen) {
    const docEl = document.documentElement;
    const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen;

    if (requestFS) {
      requestFS.call(docEl).catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }
  } else {
    exitFocusMode();
  }
}

// Exit full screen helper
function exitFocusMode() {
  const exitFS = document.exitFullscreen || document.webkitExitFullscreen;
  if (exitFS) {
    exitFS.call(document).catch(() => {});
  }
}

// Listen for toggle requests from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_fullscreen") {
    toggleFocusMode();
    sendResponse({ status: "ok" });
  }
  return true;
});

// Listen for native full-screen exits (works when user presses Escape on Mac/Win)
const onFullscreenChange = () => {
  const isFullScreen = Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement
  );

  if (!isFullScreen) {
    console.log("Exited focus fullscreen mode.");
  }
};

document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);