// 8-Bit Goblin Globe Domain Finder
// Pixel perfect retro gaming experience

// DOM Elements
const form = document.getElementById('generateForm');
const generateButton = document.getElementById('generateButton');
const buttonText = document.getElementById('buttonText');
const loading = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const results = document.getElementById('results');
const error = document.getElementById('error');
const availableSection = document.getElementById('availableSection');
const takenSection = document.getElementById('takenSection');
const availableList = document.getElementById('availableList');
const takenList = document.getElementById('takenList');
const availableCount = document.getElementById('availableCount');
const takenCount = document.getElementById('takenCount');
const exportBtn = document.getElementById('exportBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const newSearchBtn = document.getElementById('newSearchBtn');

// Global state
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// 8-bit sound effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)() || null;

// 8-bit style sound generator
function playSound(frequency, duration, type = 'square') {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// 8-bit sound library
const sounds = {
    click: () => playSound(800, 0.1),
    hover: () => playSound(600, 0.05),
    success: () => {
        playSound(523, 0.1);
        setTimeout(() => playSound(659, 0.1), 100);
        setTimeout(() => playSound(784, 0.2), 200);
    },
    error: () => {
        playSound(200, 0.1);
        setTimeout(() => playSound(150, 0.2), 100);
    },
    spell: () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => playSound(400 + i * 100, 0.1), i * 50);
        }
    },
    coin: () => playSound(1000, 0.1, 'sine')
};

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add 8-bit hover effects to buttons
document.querySelectorAll('.pixel-button, .mini-button').forEach(button => {
    button.addEventListener('mouseenter', () => sounds.hover());
    button.addEventListener('click', () => sounds.click());
});

// Add retro keyboard controls (WASD navigation)
let selectedElement = 0;
const interactiveElements = [];

function updateInteractiveElements() {
    interactiveElements.length = 0;
    interactiveElements.push(
        document.getElementById('prompt'),
        document.getElementById('count'),
        ...Array.from(document.querySelectorAll('input[name="extensions"]')),
        generateButton
    );
    
    if (!results.classList.contains('hidden')) {
        interactiveElements.push(exportBtn, copyAllBtn, newSearchBtn);
    }
}

document.addEventListener('keydown', (e) => {
    // Ctrl shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                if (!generateButton.disabled) {
                    form.dispatchEvent(new Event('submit'));
                }
                break;
            case 'c':
                if (currentResults.available.length > 0) {
                    e.preventDefault();
                    handleCopyAll();
                }
                break;
            case 's':
                if (currentResults.available.length > 0) {
                    e.preventDefault();
                    handleExport();
                }
                break;
            case 'r':
                e.preventDefault();
                handleNewSearch();
                break;
        }
        return;
    }
    
    // WASD navigation (retro style)
    updateInteractiveElements();
    
    switch (e.key.toLowerCase()) {
        case 'w': // Up
        case 'arrowup':
            e.preventDefault();
            selectedElement = Math.max(0, selectedElement - 1);
            focusElement();
            sounds.hover();
            break;
        case 's': // Down
        case 'arrowdown':
            e.preventDefault();
            selectedElement = Math.min(interactiveElements.length - 1, selectedElement + 1);
            focusElement();
            sounds.hover();
            break;
        case ' ': // Space for activation
        case 'enter':
            if (interactiveElements[selectedElement]) {
                interactiveElements[selectedElement].click();
                sounds.click();
            }
            break;
    }
});

function focusElement() {
    if (interactiveElements[selectedElement]) {
        interactiveElements[selectedElement].focus();
        // Add pixel glow effect
        interactiveElements[selectedElement].style.boxShadow = '0 0 0 3px #ff6b35, 0 0 10px #ff6b35';
        
        // Remove glow after a moment
        setTimeout(() => {
            if (interactiveElements[selectedElement]) {
                interactiveElements[selectedElement].style.boxShadow = '';
            }
        }, 1000);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Play spell casting sound
    sounds.spell();
    
    // Get form data
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Validation with 8-bit style messages
    if (!prompt) {
        showToast('ERROR: Quest description required!', 'error');
        sounds.error();
        return;
    }
    
    if (extensions.length === 0) {
        showToast('ERROR: Select magic extensions!', 'error');
        sounds.error();
        return;
    }
    
    // Start loading state with 8-bit progress
    setLoadingState(true);
    showProgressStep('Summoning domain spirits...', 1, 3, 10);
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, count, extensions })
        });
        
        showProgressStep('Checking realm availability...', 2, 3, 50);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Spell casting failed');
        }
        
        // Complete progress with fanfare
        showProgressStep('Compiling treasure map...', 3, 3, 90);
        
        // Brief delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 800));
        showProgressStep('QUEST COMPLETE!', 3, 3, 100);
        
        // Store results and display
        currentResults = data.results;
        currentSummary = data.summary;
        
        displayResults(data.results, data.summary);
        
        // Success sound and message
        sounds.success();
        showToast(`TREASURE FOUND: ${data.results.available.length} domains!`, 'success');
        
    } catch (err) {
        console.error('Generation error:', err);
        showError(getErrorMessage(err));
        showToast('SPELL FAILED: ' + getErrorMessage(err), 'error');
        sounds.error();
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    generateButton.disabled = isLoading;
    
    if (isLoading) {
        buttonText.textContent = 'CASTING...';
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        error.classList.add('hidden');
    } else {
        buttonText.textContent = 'CAST SPELL';
        loading.classList.add('hidden');
    }
}

function showProgressStep(message, step, totalSteps, percentage) {
    loadingMessage.textContent = message;
    progressText.textContent = `Quest Step ${step} of ${totalSteps}`;
    progressFill.style.width = `${percentage}%`;
}

function displayResults(results, summary) {
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    if (results.available.length === 0 && results.taken.length === 0) {
        showError('No domains found. Try a different spell!');
        return;
    }
    
    // Display available domains with coin sound for each
    results.available.forEach((item, index) => {
        setTimeout(() => {
            const card = createDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
            availableList.appendChild(card);
            sounds.coin();
        }, index * 100);
    });
    
    // Display taken domains
    results.taken.forEach((item, index) => {
        setTimeout(() => {
            const card = createDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
            takenList.appendChild(card);
        }, (results.available.length + index) * 100);
    });
    
    // Update counts and show sections
    availableCount.textContent = results.available.length;
    takenCount.textContent = results.taken.length;
    
    if (results.available.length > 0) {
        availableSection.classList.remove('hidden');
    }
    
    if (results.taken.length > 0) {
        takenSection.classList.remove('hidden');
    }
    
    // Show results section with animation
    results.classList.remove('hidden');
    
    // Smooth scroll to results
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
}

function createDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
    const card = document.createElement('div');
    card.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
    
    // Domain name with pixel styling
    const nameDiv = document.createElement('div');
    nameDiv.className = 'domain-name';
    nameDiv.textContent = domain;
    
    // Info row
    const infoDiv = document.createElement('div');
    infoDiv.className = 'domain-info';
    
    // Method badge
    const methodBadge = document.createElement('span');
    methodBadge.className = 'pixel-badge';
    methodBadge.style.background = '#4a90e2';
    methodBadge.textContent = method;
    
    // Quality score
    const qualityDiv = document.createElement('div');
    qualityDiv.className = 'quality-score';
    
    if (qualityScore && qualityGrade) {
        const scoreBadge = document.createElement('span');
        scoreBadge.className = 'score-badge';
        scoreBadge.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
        qualityDiv.appendChild(scoreBadge);
        
        // Animated quality bars
        const barsContainer = document.createElement('div');
        barsContainer.style.display = 'flex';
        barsContainer.style.gap = '2px';
        
        Object.entries(qualityScore.breakdown).forEach(([key, value]) => {
            const bar = document.createElement('div');
            bar.style.width = '3px';
            bar.style.height = '12px';
            bar.style.background = value > 70 ? '#00ff00' : value > 40 ? '#ffa502' : '#ff4757';
            bar.style.border = '1px solid #000';
            bar.title = `${key}: ${value}/100`;
            barsContainer.appendChild(bar);
        });
        
        qualityDiv.appendChild(barsContainer);
    }
    
    infoDiv.appendChild(methodBadge);
    infoDiv.appendChild(qualityDiv);
    
    // Action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'action-buttons';
    
    if (isAvailable) {
        const registerBtn = document.createElement('a');
        registerBtn.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        registerBtn.target = '_blank';
        registerBtn.className = 'mini-button register';
        registerBtn.textContent = 'CLAIM';
        registerBtn.addEventListener('click', () => sounds.success());
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'mini-button';
        copyBtn.textContent = 'COPY';
        copyBtn.addEventListener('click', () => {
            copyToClipboard(domain);
            sounds.coin();
        });
        
        actionsDiv.appendChild(registerBtn);
        actionsDiv.appendChild(copyBtn);
    } else {
        const takenBadge = document.createElement('span');
        takenBadge.className = 'pixel-badge';
        takenBadge.style.background = '#ff4757';
        takenBadge.textContent = 'TAKEN';
        actionsDiv.appendChild(takenBadge);
    }
    
    // Assemble card
    card.appendChild(nameDiv);
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);
    
    // Add hover animation
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px) scale(1.02)';
        sounds.hover();
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
    
    return card;
}

function handleCopyAll() {
    if (currentResults.available.length === 0) {
        showToast('NO TREASURE: Nothing to copy!', 'warning');
        sounds.error();
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    copyToClipboard(domains, `COPIED: ${currentResults.available.length} domains!`);
    sounds.success();
}

function handleExport() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showToast('NO DATA: Nothing to export!', 'warning');
        sounds.error();
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value;
    
    // Create CSV content with 8-bit styling
    const csvContent = [
        'Domain,Status,Quality Score,Quality Grade,Method,Registrar Link',
        ...currentResults.available.map(item => 
            `"${item.domain}","AVAILABLE","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","TAKEN","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `goblin-quest-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    sounds.success();
    showToast('TREASURE MAP EXPORTED!', 'success');
}

function handleNewSearch() {
    // Reset form with pixel effect
    document.getElementById('prompt').value = '';
    document.getElementById('count').value = '10';
    
    // Reset results
    currentResults = { available: [], taken: [] };
    results.classList.add('hidden');
    availableSection.classList.add('hidden');
    takenSection.classList.add('hidden');
    error.classList.add('hidden');
    
    // Focus on prompt with glow effect
    const promptField = document.getElementById('prompt');
    promptField.focus();
    promptField.style.boxShadow = '0 0 0 3px #ff6b35, 0 0 20px #ff6b35';
    
    setTimeout(() => {
        promptField.style.boxShadow = '';
    }, 1500);
    
    // Scroll to top with style
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    sounds.click();
    showToast('NEW QUEST STARTED!', 'info');
}

async function copyToClipboard(text, successMessage = 'COPIED TO SCROLL!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage, 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast(successMessage, 'success');
        } catch (err) {
            showToast('COPY SPELL FAILED!', 'error');
            sounds.error();
        }
        
        document.body.removeChild(textArea);
    }
}

function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '⚡',
        error: '💀',
        warning: '⚠',
        info: '🏆'
    };
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${icons[type] || '🏆'}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 16px; padding: 0; margin-left: 8px;">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

function showError(message) {
    error.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">💀</span>
            <span>QUEST FAILED: ${message}</span>
        </div>
    `;
    error.classList.remove('hidden');
    results.classList.add('hidden');
    sounds.error();
}

function getErrorMessage(error) {
    const message = error.message || 'Unknown spell malfunction';
    
    // 8-bit style error messages
    if (message.includes('rate limit') || message.includes('429')) {
        return 'Spell cooldown active! Wait before casting again.';
    }
    
    if (message.includes('timeout') || message.includes('ENOTFOUND')) {
        return 'Connection to magic realm lost! Check network.';
    }
    
    if (message.includes('401') || message.includes('403')) {
        return 'Spell permission denied! Refresh realm.';
    }
    
    if (message.includes('500')) {
        return 'Magic server overloaded! Try again later.';
    }
    
    if (message.includes('Invalid prompt')) {
        return 'Forbidden spell detected! Try different magic words.';
    }
    
    return message;
}

// Initialize pixel effects and animations
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcut hints in 8-bit style
    const form = document.getElementById('generateForm');
    const helpText = document.createElement('div');
    helpText.className = 'pixel-label';
    helpText.style.textAlign = 'center';
    helpText.style.marginTop = '16px';
    helpText.style.fontSize = '11px';
    helpText.style.color = '#666';
    helpText.innerHTML = `
        ⚡ POWER-UPS: Ctrl+Enter (Cast) • Ctrl+C (Copy) • Ctrl+S (Export) • Ctrl+R (New Quest)<br>
        🎮 RETRO CONTROLS: WASD or Arrow Keys for navigation
    `;
    form.appendChild(helpText);
    
    // Add subtle screen flicker effect
    let flickerInterval = setInterval(() => {
        if (Math.random() < 0.02) { // 2% chance every 100ms
            document.body.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                document.body.style.filter = '';
            }, 50);
        }
    }, 100);
    
    // Initialize interactive elements
    updateInteractiveElements();
    
    // Welcome sound
    sounds.success();
    showToast('WELCOME TO GOBLIN GLOBE!', 'info', 2000);
});

// Add cheat codes (Konami code style)
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10); // Keep last 10 keys
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg: unlock bonus features
        showToast('CHEAT CODE ACTIVATED! 🎮', 'success');
        sounds.success();
        
        // Add rainbow effect to title
        const title = document.querySelector('.title');
        title.style.animation = 'glow 0.5s ease-in-out infinite alternate, hue-rotate 2s linear infinite';
        
        // Add CSS for hue rotation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes hue-rotate {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        konamiCode = []; // Reset
    }
});