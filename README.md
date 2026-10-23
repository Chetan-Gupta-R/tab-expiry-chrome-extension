# Tab Expiry

A lightweight Chrome extension that automatically closes browser tabs after a selected timer.

## Features

- Preset timers: 1, 5, 15, 30, and 60 minutes
- Custom timers with minutes and seconds
- Live countdown for the current tab
- Dashboard showing every scheduled tab
- Cancel individual tab timers
- Automatic tab closing through Chrome alarms
- Clean purple clock extension icon

## Install locally

1. Download or clone this repository.
2. Open Chrome and visit `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select this project folder.

Tab Expiry will appear in your extensions list. Pin it from Chrome’s Extensions menu for easy access.

## How to use

1. Open the tab you want to close later.
2. Click the Tab Expiry extension icon.
3. Select a preset duration or choose **Custom**.
4. For a custom timer, enter minutes and/or seconds.
5. Click **Start timer**.

The popup shows a live countdown. The **Scheduled tabs** section lists all active expiry timers and lets you cancel any one of them.

## Project files

```text
manifest.json    Chrome extension configuration
popup.html       Extension popup layout
popup.css        Popup styles
popup.js         Timer controls, countdowns, and dashboard
background.js    Chrome alarm and tab-closing logic
icon.png         Extension icon
```

## Notes

Chrome alarms may not fire at the exact second requested, especially for very short timers. The displayed countdown is precise, but Chrome can delay the actual tab closure slightly.

## Future ideas

- Badge showing the number of active timers
- Warning before a tab closes
- Protected websites that never expire
- Close only inactive tabs
- Pause all timers
- Keyboard shortcuts
- Light theme

## License

This project is available for learning and personal use.
