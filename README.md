# Text Filter with VTT Caption Support

A simple web application that filters unwanted characters from text, with support for loading captions from VTT files.

## Features

✅ Remove numbers, hyphens, colons, angle brackets, slashes, and special characters  
✅ Remove periods only when next to numbers  
✅ Load captions directly from VTT URLs  
✅ Automatic VTT parsing to extract clean text  
✅ Works with any publicly accessible VTT caption file

## Quick Start

### Start the Web Server

```bash
python start-server.py
```

The app will be available at `http://localhost:8000`

Or simply open `index.html` in your browser.

## How to Use

### Method 1: Load from VTT URL

1. Find the VTT caption file URL (usually from browser Network tab)
2. Paste the VTT URL into the "VTT Caption URL" field
3. Click **"Load Captions"**
4. The captions will be automatically parsed and loaded into the input
5. Click **"Generate Filtered Text"** to clean the text

### Method 2: Manual Input

1. Paste any text into the input box
2. Select which characters to remove using the checkboxes
3. Click **"Generate Filtered Text"**
4. Copy the filtered output

### Finding VTT URLs

1. Open your browser's Developer Tools (F12)
2. Go to the **Network** tab
3. Play a video with captions enabled
4. Filter by `.vtt` in the Network tab
5. Right-click on the VTT request and **Copy URL**
6. Paste the URL into the app

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
- `script.js` - Text filtering and VTT parsing logic
- `styles.css` - Application styling
- `start-server.py` - Simple Python HTTP server (optional)

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (optional, for local server)
