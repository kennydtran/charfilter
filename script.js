document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    const removeNumbers = document.getElementById('removeNumbers');
    const removeHyphens = document.getElementById('removeHyphens');
    const removeColons = document.getElementById('removeColons');
    const removeGreaterThan = document.getElementById('removeGreaterThan');
    const removeLessThan = document.getElementById('removeLessThan');
    const removeSlashes = document.getElementById('removeSlashes');
    const removePeriodsNextToNumbers = document.getElementById('removePeriodsNextToNumbers');
    const keepSpaces = document.getElementById('keepSpaces');

    generateBtn.addEventListener('click', filterText);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);

    inputText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            filterText();
        }
    });

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
