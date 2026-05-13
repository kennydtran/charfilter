document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const vttUrl = document.getElementById('vttUrl');
    const fetchVttBtn = document.getElementById('fetchVttBtn');
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    const filterOptions = document.getElementById('filterOptions');
    
    // Filter state object
    const filterState = {
        removeNumbers: true,
        removeHyphens: true,
        removeColons: true,
        removeGreaterThan: true,
        removeLessThan: true,
        removeSlashes: true,
        removePeriodsNextToNumbers: true,
        keepSpaces: true,
        removeLineBreaks: true
    };

    // Initialize filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        if (filterState[filter]) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            filterState[filter] = this.classList.contains('active');
        });
    });

    generateBtn.addEventListener('click', filterText);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);
    fetchVttBtn.addEventListener('click', fetchFromVtt);
    toggleFiltersBtn.addEventListener('click', toggleFilters);

    inputText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            filterText();
        }
    });

    function toggleFilters() {
        filterOptions.classList.toggle('show');
        toggleFiltersBtn.classList.toggle('active');
    }

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
                throw new Error('Invalid VTT URL Link');
            }

            const vttContent = await response.text();
            
            inputText.value = vttContent;
        } catch (error) {
            console.error('Error:', error);
            alert(`\n${error.message}\n\nPlease copy the complete VTT URL Link from the Network tab in Inspect Element.`);
        } finally {
            fetchVttBtn.textContent = 'Load';
            fetchVttBtn.disabled = false;
        }
    }

    function filterText() {
        let text = inputText.value;
        
        if (!text.trim()) {
            outputText.value = '';
            return;
        }

        let filtered = text;

        if (filterState.removePeriodsNextToNumbers) {
            filtered = filtered.replace(/\d+\.\d*/g, function(match) {
                return match.replace(/\./g, '');
            });
            filtered = filtered.replace(/\.\d+/g, function(match) {
                return match.replace(/\./g, '');
            });
        }

        if (filterState.removeNumbers) {
            filtered = filtered.replace(/[0-9]/g, '');
        }

        if (filterState.removeHyphens) {
            filtered = filtered.replace(/-/g, '');
        }

        if (filterState.removeColons) {
            filtered = filtered.replace(/:/g, '');
        }

        if (filterState.removeGreaterThan) {
            filtered = filtered.replace(/>/g, '');
        }

        if (filterState.removeLessThan) {
            filtered = filtered.replace(/</g, '');
        }

        if (filterState.removeSlashes) {
            filtered = filtered.replace(/\//g, '');
        }

        if (filterState.removeLineBreaks) {
            filtered = filtered.replace(/\r?\n/g, ' ');
        }

        if (!filterState.keepSpaces) {
            filtered = filtered.replace(/\s/g, '');
        } else {
            // Only collapse consecutive spaces (not line breaks) if we're keeping line breaks
            if (!filterState.removeLineBreaks) {
                filtered = filtered.replace(/ +/g, ' ');
            } else {
                // If removing line breaks, collapse all whitespace to single spaces
                filtered = filtered.replace(/\s+/g, ' ');
            }
        }
        
        filtered = filtered.trim();

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
        copyBtn.style.background = '#10b981';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }

    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        vttUrl.value = '';
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
