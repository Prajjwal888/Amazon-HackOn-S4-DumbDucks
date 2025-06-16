chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_PREDICTION" && sender.tab?.id) {
    chrome.tabs.sendMessage(sender.tab.id, { type: "START_PREDICTION" });
  }
});
