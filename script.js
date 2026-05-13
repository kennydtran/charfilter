document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    const vttList = document.getElementById('vttList');
    const vttCount = document.getElementById('vttCount');
    const vttDetector = document.getElementById('vttDetector');
    const extensionStatus = document.getElementById('extensionStatus');
    const clearVttBtn = document.getElementById('clearVttBtn');
    const vttEmptyMessage = document.getElementById('vttEmptyMessage');
    const installHelp = document.getElementById('installHelp');
    
    const removeNumbers = document.getElementById('removeNumbers');
    const removeHyphens = document.getElementById('removeHyphens');
    const removeColons = document.getElementById('removeColons');
    const removeGreaterThan = document.getElementById('removeGreaterThan');
    const removeLessThan = document.getElementById('removeLessThan');
    const removeSlashes = document.getElementById('removeSlashes');
    const removePeriodsNextToNumbers = document.getElementById('removePeriodsNextToNumbers');
    const keepSpaces = document.getElementById('keepSpaces');

    let extensionConnected = false;

    generateBtn.addEventListener('click', filterText);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);
    clearVttBtn.addEventListener('click', clearAllVtt);
    
    installHelp.addEventListener('click', (e) => {
        e.preventDefault();
        alert('To install the Chrome Extension:\n\n1. Download the extension from GitHub:\n   https://github.com/kennydtran/charfilter\n2. Open chrome://extensions/\n3. Enable "Developer mode"\n4. Click "Load unpacked"\n5. Select the downloaded folder\n6. Refresh this page');
    });

    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
        if (event.data.type === 'EXTENSION_CONNECTED') {
            extensionConnected = true;
            updateExtensionStatus();
        } else if (event.data.type === 'VTT_DETECTED') {
            extensionConnected = true;
            updateExtensionStatus();
            displayVttFiles(event.data.urls);
        }
    });

    // Check if extension is installed
    setTimeout(() => {
        if (!extensionConnected) {
            updateExtensionStatus();
        }
    }, 1000);

    // Check for VTT text in URL parameter (from extension)
    const urlParams = new URLSearchParams(window.location.search);
    const vttText = urlParams.get('vtt');
    if (vttText) {
        inputText.value = decodeURIComponent(vttText);
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            alert('Captions loaded from extension! Click "Generate Filtered Text" to process.');
        }, 500);
    }

    function updateExtensionStatus() {
        if (extensionConnected) {
            extensionStatus.className = 'extension-status connected';
            extensionStatus.innerHTML = '<p style="color: #28a745; font-size: 0.95em;">✅ Extension connected! VTT files will be detected automatically.</p>';
        } else {
            extensionStatus.className = 'extension-status';
            extensionStatus.innerHTML = '<p style="color: #f44336; font-size: 0.95em;">⚠️ Chrome Extension not detected. <a href="#" id="installHelp" style="color: #2196F3;">Install it here</a></p>';
            document.getElementById('installHelp').addEventListener('click', (e) => {
                e.preventDefault();
                alert('To install the Chrome Extension:\n\n1. Open chrome://extensions/\n2. Enable "Developer mode"\n3. Click "Load unpacked"\n4. Select the folder: ' + window.location.origin + '\n5. Refresh this page');
            });
        }
    }

    function displayVttFiles(urls) {
        vttCount.textContent = urls.length;
        
        if (urls.length === 0) {
            vttList.innerHTML = '';
            vttList.style.display = 'none';
            vttEmptyMessage.style.display = 'block';
            clearVttBtn.style.display = 'none';
            return;
        }
        
        vttList.style.display = 'flex';
        vttEmptyMessage.style.display = 'none';
        clearVttBtn.style.display = 'block';
        vttList.innerHTML = '';
        
        urls.forEach(url => {
            const item = document.createElement('div');
            item.className = 'vtt-item';
            
            const info = document.createElement('div');
            info.className = 'vtt-info';
            const urlShort = url.length > 80 ? url.substring(0, 80) + '...' : url;
            info.textContent = urlShort;
            info.title = url;
            
            const loadBtn = document.createElement('button');
            loadBtn.className = 'vtt-load-btn';
            loadBtn.textContent = 'Load';
            loadBtn.onclick = () => loadVttFromUrl(url);
            
            item.appendChild(info);
            item.appendChild(loadBtn);
            vttList.appendChild(item);
        });
    }

    function clearAllVtt() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: 'clearVttUrls' }, () => {
                displayVttFiles([]);
            });
        } else {
            displayVttFiles([]);
        }
    }

    async function loadVttFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch VTT file');
            }
            const vttContent = await response.text();
            const parsedText = parseVTT(vttContent);
            inputText.value = parsedText;
            alert('Captions loaded successfully! Now click "Generate Filtered Text" to clean the text.');
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to load captions: ${error.message}`);
        }
    }

    inputText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            filterText();
        }
    });

    async function fetchFromVtt() {
        const url = vttUrl.value.trim();
        
        if (!url) {
            alert('Please enter a VTT URL');
            return;
        }

        if (!url.includes('.vtt')) {
            alert('Please enter a valid VTT URL (should end with .vtt)');
            return;
        }

        fetchVttBtn.textContent = 'Loading...';
        fetchVttBtn.disabled = true;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch VTT file');
            }

            const vttContent = await response.text();
            const parsedText = parseVTT(vttContent);
            
            inputText.value = parsedText;
            alert('Captions loaded successfully! Now click "Generate Filtered Text" to clean the text.');
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to load captions: ${error.message}\n\nTip: Make sure you copied the complete VTT URL from the Network tab.`);
        } finally {
            fetchVttBtn.textContent = 'Load Captions';
            fetchVttBtn.disabled = false;
        }
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

    function filterText() {
        let text = inputText.value;
        
        if (!text.trim()) {
            outputText.value = '';
            return;
        }

        let filtered = text;

        if (removePeriodsNextToNumbers.checked) {
            filtered = filtered.replace(/\d+\.\d*/g, function(match) {
                return match.replace(/\./g, '');
            });
            filtered = filtered.replace(/\.\d+/g, function(match) {
                return match.replace(/\./g, '');
            });
        }

        if (removeNumbers.checked) {
            filtered = filtered.replace(/[0-9]/g, '');
        }

        if (removeHyphens.checked) {
            filtered = filtered.replace(/-/g, '');
        }

        if (removeColons.checked) {
            filtered = filtered.replace(/:/g, '');
        }

        if (removeGreaterThan.checked) {
            filtered = filtered.replace(/>/g, '');
        }

        if (removeLessThan.checked) {
            filtered = filtered.replace(/</g, '');
        }

        if (removeSlashes.checked) {
            filtered = filtered.replace(/\//g, '');
        }

        if (!keepSpaces.checked) {
            filtered = filtered.replace(/\s/g, '');
        }

        filtered = filtered.replace(/\s+/g, ' ').trim();

        outputText.value = filtered;

        outputText.style.animation = 'none';
        setTimeout(() => {
            outputText.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }

    function copyToClipboard() {
        if (!outputText.value.trim()) {
            alert('Nothing to copy! Please generate filtered text first.');
            return;
        }

        outputText.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#20c997';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }

    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
