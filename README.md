# Text Filter with Auto VTT Caption Detector

A powerful web application that filters unwanted characters from text, integrated with a Chrome Extension that automatically detects VTT caption files from ANY webpage.

## Features

✅ Remove numbers, hyphens, colons, angle brackets, slashes, and special characters  
✅ Remove periods only when next to numbers  
✅ **Chrome Extension**: Automatically detects VTT caption files from ANY webpage in real-time  
✅ One-click loading of detected captions directly into the app  
✅ Works with Vimeo, YouTube, and any site that uses VTT captions  

## Quick Start

### 1. Start the Web Server

```bash
node server.js
```

The app will be available at `http://localhost:8000`

### 2. Install the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this folder: `Number remover`
5. The extension icon will appear in your toolbar

## How to Use

### Method 1: Automatic Detection (Recommended)

1. **Play any video with captions** (e.g., Vimeo, YouTube with captions enabled)
2. The extension will automatically detect VTT files
3. Click the **extension icon** to see detected VTT files
4. Click **"Load in App"** to instantly load captions into the text filter
5. Click **"Generate Filtered Text"** to clean the text

### Method 2: Manual Input

1. Paste any text into the input box
2. Select which characters to remove using the checkboxes
3. Click **"Generate Filtered Text"**
4. Copy the filtered output

## Extension Features

- **Auto-detection**: Monitors all network requests for VTT files
- **Badge counter**: Shows how many VTT files have been detected
- **Persistent storage**: Detected URLs are saved even if you close the browser
- **One-click loading**: Load captions directly into the app
- **Copy URL**: Quickly copy VTT URLs to clipboard

## Filters Available

- Numbers (0-9)
- Hyphens (-)
- Colons (:)
- Greater Than (>)
- Less Than (<)
- Forward Slashes (/)
- Periods next to numbers (3.14 → 314, but test.com stays testcom)
- Keep/Remove spaces option

## Files

- `index.html` - Main web application
- `script.js` - Text filtering logic
- `styles.css` - Application styling
- `server.js` - Node.js server
- `manifest.json` - Chrome extension manifest
- `background.js` - Extension background service worker
- `popup.html` - Extension popup interface
- `popup.js` - Extension popup logic
- `content.js` - Content script for communication

## Requirements

- Node.js (for running the web server)
- Google Chrome or Chromium-based browser
