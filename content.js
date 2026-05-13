// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'loadText') {
        const inputText = document.getElementById('inputText');
        if (inputText) {
            inputText.value = request.text;
            showNotification('Captions loaded! Click "Generate Filtered Text" to process.');
        }
    } else if (request.action === 'vttDetected') {
        // Notify the page that VTT files were detected
        window.postMessage({
            type: 'VTT_DETECTED',
            urls: request.urls
        }, '*');
    }
    sendResponse({ success: true });
});

// Request initial VTT list when page loads
setTimeout(() => {
    chrome.runtime.sendMessage({ action: 'getVttUrls' }, (response) => {
        if (response && response.urls && response.urls.length > 0) {
            window.postMessage({
                type: 'VTT_DETECTED',
                urls: response.urls
            }, '*');
        }
    });
}, 500);

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Segoe UI', sans-serif;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
