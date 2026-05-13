const vttUrls = new Set();

// Monitor all network requests for VTT files
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url && details.url.includes('.vtt') && details.statusCode === 200) {
      console.log('VTT file detected:', details.url);
      vttUrls.add(details.url);
      chrome.storage.local.set({ vttUrls: Array.from(vttUrls) });
      
      // Update badge
      chrome.action.setBadgeText({ text: vttUrls.size.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      
      // Notify the web app if it's open
      notifyWebApp();
    }
  },
  { urls: ["<all_urls>"] }
);

// Notify web app about detected VTT files
async function notifyWebApp() {
  try {
    const tabs = await chrome.tabs.query({ 
      url: [
        "http://localhost:8000/*", 
        "http://127.0.0.1:8000/*",
        "https://charfilter.netlify.app/*"
      ] 
    });
    if (tabs.length > 0) {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'vttDetected',
          urls: Array.from(vttUrls)
        }).catch(() => {}); // Ignore errors if content script not ready
      }
    }
  } catch (error) {
    console.error('Error notifying web app:', error);
  }
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVttUrls') {
    sendResponse({ urls: Array.from(vttUrls) });
  } else if (request.action === 'clearVttUrls') {
    vttUrls.clear();
    chrome.storage.local.set({ vttUrls: [] });
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ success: true });
    notifyWebApp();
  } else if (request.action === 'fetchVtt') {
    fetch(request.url)
      .then(response => response.text())
      .then(text => sendResponse({ success: true, content: text }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  } else if (request.action === 'removeVtt') {
    vttUrls.delete(request.url);
    chrome.storage.local.set({ vttUrls: Array.from(vttUrls) });
    chrome.action.setBadgeText({ text: vttUrls.size > 0 ? vttUrls.size.toString() : '' });
    sendResponse({ success: true });
    notifyWebApp();
  }
});

// Load saved VTT URLs on startup
chrome.storage.local.get(['vttUrls'], (result) => {
  if (result.vttUrls) {
    result.vttUrls.forEach(url => vttUrls.add(url));
    if (vttUrls.size > 0) {
      chrome.action.setBadgeText({ text: vttUrls.size.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    }
  }
});
