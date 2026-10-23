chrome.runtime.onMessage.addListener(async (message) => {
  const alarmName = `close-tab-${message.tabId}`;

  if (message.type === "START_TAB_TIMER") {
    await chrome.alarms.create(alarmName, {
      when: message.expiresAt
    });
  }

  if (message.type === "CANCEL_TAB_TIMER") {
    await chrome.alarms.clear(alarmName);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith("close-tab-")) return;

  const tabId = Number(alarm.name.replace("close-tab-", ""));

  const { expiries = {} } = await chrome.storage.local.get("expiries");
  delete expiries[tabId];
  await chrome.storage.local.set({ expiries });

  chrome.tabs.remove(tabId);
});