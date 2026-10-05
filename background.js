// Function to safely send message without uncaught errors
function safeToggleFullscreen(tabId) {
  if (!tabId) return;

  // Send message using callback format to gracefully catch missing script
  chrome.tabs.sendMessage(tabId, { action: "toggle_fullscreen" }, (response) => {
    // If the content script isn't loaded yet, inject it and retry
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("Cannot run extension on this tab:", chrome.runtime.lastError.message);
            return;
          }
          // Retry sending message after injection
          chrome.tabs.sendMessage(tabId, { action: "toggle_fullscreen" });
        }
      );
    }
  });
}

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab?.id) safeToggleFullscreen(tab.id);
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (command === "toggle-fullscreen" && activeTab?.id) {
    safeToggleFullscreen(activeTab.id);
  } else if (command === "next-tab" || command === "prev-tab") {
    handleTabSwitch(command === "next-tab" ? 1 : -1);
  }
});

// Tab switcher logic
async function handleTabSwitch(direction) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (tabs.length <= 1) return;

  const currentIndex = tabs.findIndex((t) => t.active);
  let nextIndex = (currentIndex + direction) % tabs.length;
  if (nextIndex < 0) nextIndex = tabs.length - 1;

  await chrome.tabs.update(tabs[nextIndex].id, { active: true });
}