const button = document.querySelector("#start-button");
const cancelButton = document.querySelector("#cancel-button");
const durationSelect = document.querySelector("#duration");
const customDurationFields = document.querySelector("#custom-duration-fields");
const customMinutesInput = document.querySelector("#custom-minutes");
const customSecondsInput = document.querySelector("#custom-seconds");
const status = document.querySelector("#status");
const countdown = document.querySelector("#countdown");
const timerList = document.querySelector("#timer-list");

let currentTab;
let countdownInterval;
let dashboardInterval;

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function showCountdown(expiresAt) {
  clearInterval(countdownInterval);

  function updateCountdown() {
    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      countdown.textContent = "Closing tab…";
      clearInterval(countdownInterval);
      return;
    }

    countdown.textContent = `This tab closes in ${formatTime(remaining)}`;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateDashboardCountdowns() {
  document.querySelectorAll("[data-expires-at]").forEach((element) => {
    const expiresAt = Number(element.dataset.expiresAt);
    const remaining = expiresAt - Date.now();

    element.textContent =
      remaining > 0 ? `Closes in ${formatTime(remaining)}` : "Closing tab…";
  });
}

async function cancelTimer(tabId) {
  const { expiries = {} } = await chrome.storage.local.get("expiries");

  delete expiries[tabId];
  await chrome.storage.local.set({ expiries });

  chrome.runtime.sendMessage({
    type: "CANCEL_TAB_TIMER",
    tabId
  });

  if (tabId === currentTab.id) {
    clearInterval(countdownInterval);
    countdown.textContent = "";
    status.textContent = "The tab expiry was cancelled.";
  }

  renderTimerList();
}

async function renderTimerList() {
  const { expiries = {} } = await chrome.storage.local.get("expiries");

  timerList.innerHTML = "";
  clearInterval(dashboardInterval);

  const tabIds = Object.keys(expiries);

  if (tabIds.length === 0) {
    timerList.textContent = "No tabs are scheduled to close.";
    return;
  }

  for (const tabIdText of tabIds) {
    const tabId = Number(tabIdText);

    try {
      const tab = await chrome.tabs.get(tabId);

      const row = document.createElement("div");
      const title = document.createElement("p");
      const remaining = document.createElement("p");
      const cancel = document.createElement("button");

      row.className = "timer-row";
      title.className = "timer-title";
      remaining.className = "timer-remaining";
      cancel.className = "small-cancel";

      title.textContent = tab.title || "Untitled tab";
      remaining.dataset.expiresAt = expiries[tabId];
      cancel.textContent = "Cancel";

      cancel.addEventListener("click", () => cancelTimer(tabId));

      row.append(title, remaining, cancel);
      timerList.append(row);
    } catch {
      // The tab was closed manually, so remove its old timer data.
      delete expiries[tabId];
      await chrome.storage.local.set({ expiries });
    }
  }

  updateDashboardCountdowns();
  dashboardInterval = setInterval(updateDashboardCountdowns, 1000);
}

durationSelect.addEventListener("change", () => {
  customDurationFields.hidden = durationSelect.value !== "custom";
});

button.addEventListener("click", async () => {
  let durationMilliseconds;

  if (durationSelect.value === "custom") {
    const minutes = Number(customMinutesInput.value || 0);
    const seconds = Number(customSecondsInput.value || 0);

    if (
      !Number.isFinite(minutes) ||
      !Number.isFinite(seconds) ||
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59 ||
      minutes * 60 + seconds <= 0
    ) {
      status.textContent = "Enter a valid number of minutes and seconds.";
      return;
    }

    durationMilliseconds = (minutes * 60 + seconds) * 1000;
  } else {
    durationMilliseconds = Number(durationSelect.value) * 60 * 1000;
  }

  const expiresAt = Date.now() + durationMilliseconds;

  const { expiries = {} } = await chrome.storage.local.get("expiries");
  expiries[currentTab.id] = expiresAt;
  await chrome.storage.local.set({ expiries });

  chrome.runtime.sendMessage({
    type: "START_TAB_TIMER",
    tabId: currentTab.id,
    expiresAt
  });

  status.textContent = "Timer started.";
  showCountdown(expiresAt);
  renderTimerList();
});

cancelButton.addEventListener("click", () => {
  cancelTimer(currentTab.id);
});

async function loadPopup() {
  [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const { expiries = {} } = await chrome.storage.local.get("expiries");
  const expiresAt = expiries[currentTab.id];

  if (expiresAt && expiresAt > Date.now()) {
    status.textContent = "A timer is active for this tab.";
    showCountdown(expiresAt);
  }

  renderTimerList();
}

loadPopup();