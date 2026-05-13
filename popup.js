document.addEventListener('DOMContentLoaded', () => {
    loadVttUrls();
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'clearVttUrls' }, () => {
            loadVttUrls();
        });
    });
    
    document.getElementById('openApp').addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:8000' });
    });
});

function loadVttUrls() {
    chrome.runtime.sendMessage({ action: 'getVttUrls' }, (response) => {
        const vttList = document.getElementById('vttList');
        const count = document.getElementById('count');
        
        const urls = response.urls || [];
        count.textContent = urls.length;
        
        if (urls.length === 0) {
            vttList.innerHTML = '<div class="empty">No VTT files detected yet.<br>Play a video with captions to detect them.</div>';
            return;
        }
        
        vttList.innerHTML = '';
        urls.forEach((url, index) => {
            const item = document.createElement('div');
            item.className = 'vtt-item';
            
            const urlDiv = document.createElement('div');
            urlDiv.className = 'vtt-url';
            const shortUrl = url.length > 60 ? url.substring(0, 60) + '...' : url;
            urlDiv.textContent = shortUrl;
            urlDiv.title = url;
            
            const actions = document.createElement('div');
            actions.className = 'vtt-actions';
            
            const loadBtn = document.createElement('button');
            loadBtn.className = 'load-btn';
            loadBtn.textContent = 'Load in App';
            loadBtn.onclick = () => loadVttInApp(url);
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy URL';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(url);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = 'Copy URL', 2000);
            };
            
            actions.appendChild(loadBtn);
            actions.appendChild(copyBtn);
            
            item.appendChild(urlDiv);
            item.appendChild(actions);
            vttList.appendChild(item);
        });
    });
}

function loadVttInApp(url) {
    chrome.runtime.sendMessage({ action: 'fetchVtt', url: url }, (response) => {
        if (response.success) {
            const parsedText = parseVTT(response.content);
            
            chrome.tabs.query({ url: 'http://localhost:8000/*' }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: 'loadText', 
                        text: parsedText 
                    });
                } else {
                    chrome.tabs.create({ 
                        url: `http://localhost:8000?vtt=${encodeURIComponent(parsedText)}` 
                    });
                }
            });
        } else {
            alert('Failed to fetch VTT: ' + response.error);
        }
    });
}

function parseVTT(vttContent) {
    const lines = vttContent.split('\n');
    const textLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '' || line === 'WEBVTT' || line.startsWith('Kind:') || 
            line.startsWith('Language:') || line.match(/^\d+$/) || 
            line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/)) {
            continue;
        }
        
        if (line && !line.startsWith('NOTE')) {
            textLines.push(line);
        }
    }

    return textLines.join(' ');
}
