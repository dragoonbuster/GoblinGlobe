// DOM Elements
const form = document.getElementById('generateForm');
const generateButton = document.getElementById('generateButton');
const buttonText = document.getElementById('buttonText');
const loading = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const results = document.getElementById('results');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const availableList = document.getElementById('availableList');
const takenList = document.getElementById('takenList');
const availableSection = document.getElementById('availableSection');
const takenSection = document.getElementById('takenSection');
const exportBtn = document.getElementById('exportBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const newSearchBtn = document.getElementById('newSearchBtn');
const toastContainer = document.getElementById('toastContainer');

// Global state
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// Comic sound effects array
const soundEffects = [
    'POW!', 'BAM!', 'ZAP!', 'BOOM!', 'WHAM!', 'KAPOW!', 'SMASH!', 'CRASH!',
    'BANG!', 'THWACK!', 'SOCK!', 'BIFF!', 'WHAP!', 'THUD!', 'CRACK!'
];

const loadingMessages = [
    'GENERATING SUPER DOMAINS...',
    'CHECKING DOMAIN POWERS...',
    'SCANNING THE WEB...',
    'ANALYZING AVAILABILITY...',
    'DOMAIN MAGIC IN PROGRESS...',
    'GOBLIN POWERS ACTIVATED...'
];

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add comic sound effects to buttons
document.querySelectorAll('button, .btn-action').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!btn.disabled) {
            createSoundEffect(btn);
        }
    });
});

// Add keyboard shortcuts with comic effects
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                if (!generateButton.disabled) {
                    createGlobalSoundEffect('ENTER!');
                    form.dispatchEvent(new Event('submit'));
                }
                break;
            case 'c':
                if (currentResults.available.length > 0) {
                    e.preventDefault();
                    createGlobalSoundEffect('COPY!');
                    handleCopyAll();
                }
                break;
            case 's':
                if (currentResults.available.length > 0) {
                    e.preventDefault();
                    createGlobalSoundEffect('SAVE!');
                    handleExport();
                }
                break;
            case 'r':
                e.preventDefault();
                createGlobalSoundEffect('RESET!');
                handleNewSearch();
                break;
        }
    }
});

// Create sound effect animations
function createSoundEffect(element) {
    const effect = document.createElement('div');
    const soundText = soundEffects[Math.floor(Math.random() * soundEffects.length)];
    
    effect.textContent = soundText;
    effect.className = Math.random() > 0.5 ? 'pow-effect' : 'bam-effect';
    
    const rect = element.getBoundingClientRect();
    effect.style.position = 'fixed';
    effect.style.left = (rect.left + Math.random() * rect.width) + 'px';
    effect.style.top = (rect.top - 20 + Math.random() * 40) + 'px';
    effect.style.zIndex = '2000';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 800);
}

function createGlobalSoundEffect(text) {
    const effect = document.createElement('div');
    effect.textContent = text;
    effect.className = 'pow-effect';
    effect.style.position = 'fixed';
    effect.style.left = '50%';
    effect.style.top = '30%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.zIndex = '2000';
    effect.style.fontSize = '64px';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 800);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Validation with comic flair
    if (!prompt) {
        showComicToast('OOPS! Enter a domain idea first!', 'error');
        return;
    }
    
    if (extensions.length === 0) {
        showComicToast('CHOOSE YOUR DOMAIN POWERS!', 'error');
        return;
    }
    
    // Start loading state with comic effects
    setLoadingState(true);
    animateLoadingMessages();
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, count, extensions })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate domains');
        }
        
        // Store results and display with comic effect
        currentResults = data.results;
        currentSummary = data.summary;
        
        setTimeout(() => {
            displayResults(data.results, data.summary);
            showComicToast(`AMAZING! Found ${data.results.available.length} domains!`, 'success');
            createGlobalSoundEffect('SUCCESS!');
        }, 1000);
        
    } catch (err) {
        console.error('Generation error:', err);
        showError(getErrorMessage(err));
        showComicToast('DOMAIN GENERATION FAILED!', 'error');
        createGlobalSoundEffect('ERROR!');
    } finally {
        setTimeout(() => {
            setLoadingState(false);
        }, 1200);
    }
}

function setLoadingState(isLoading) {
    generateButton.disabled = isLoading;
    
    if (isLoading) {
        buttonText.textContent = 'GENERATING...';
        loading.style.display = 'block';
        results.style.display = 'none';
        error.style.display = 'none';
    } else {
        buttonText.textContent = 'GENERATE DOMAINS!';
        loading.style.display = 'none';
    }
}

function animateLoadingMessages() {
    let messageIndex = 0;
    const interval = setInterval(() => {
        if (loading.style.display === 'none') {
            clearInterval(interval);
            return;
        }
        
        loadingMessage.textContent = loadingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 800);
}

function displayResults(results, summary) {
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    if (results.available.length === 0 && results.taken.length === 0) {
        showError('NO DOMAINS FOUND! Try a different idea!');
        return;
    }
    
    // Display available domains with comic styling
    results.available.forEach((item, index) => {
        const card = createComicDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
        availableList.appendChild(card);
        
        // Stagger animation
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) rotate(-10deg)';
            card.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1) rotate(-1deg)';
            }, 10);
        }, index * 100);
    });
    
    // Display taken domains
    results.taken.forEach((item, index) => {
        const card = createComicDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
        takenList.appendChild(card);
        
        // Stagger animation
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) rotate(10deg)';
            card.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1) rotate(1deg)';
            }, 10);
        }, index * 100);
    });
    
    // Show/hide sections based on content
    availableSection.style.display = results.available.length > 0 ? 'block' : 'none';
    takenSection.style.display = results.taken.length > 0 ? 'block' : 'none';
    
    // Show results with dramatic effect
    setTimeout(() => {
        results.style.display = 'block';
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

function createComicDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
    const card = document.createElement('div');
    card.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
    
    // Domain name with comic styling
    const domainName = document.createElement('div');
    domainName.className = 'domain-name';
    domainName.textContent = domain;
    
    // Meta information
    const metaDiv = document.createElement('div');
    metaDiv.className = 'domain-meta';
    
    const methodSpan = document.createElement('span');
    methodSpan.className = 'domain-method';
    methodSpan.textContent = method.toUpperCase();
    
    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'domain-score';
    if (qualityScore && qualityGrade) {
        scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
    } else {
        scoreSpan.textContent = 'SCORE: N/A';
    }
    
    metaDiv.appendChild(methodSpan);
    metaDiv.appendChild(scoreSpan);
    
    // Quality breakdown with comic styling
    let qualityDetails = null;
    if (qualityScore && qualityScore.breakdown) {
        qualityDetails = document.createElement('div');
        qualityDetails.style.cssText = `
            font-family: 'Fredoka One', cursive;
            font-size: 12px;
            color: #666;
            margin: 10px 0;
            background: #FFFACD;
            padding: 8px;
            border: 2px solid #000;
            border-radius: 10px;
        `;
        qualityDetails.innerHTML = `
            <strong>POWER LEVELS:</strong><br>
            📏 Length: ${qualityScore.breakdown.length}/100<br>
            🧠 Memory: ${qualityScore.breakdown.memorability}/100<br>
            ⭐ Brand: ${qualityScore.breakdown.brandability}/100<br>
            🎯 Relevance: ${qualityScore.breakdown.relevance}/100
        `;
    }
    
    // Actions with comic buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'domain-actions';
    
    // Copy button with comic effect
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.textContent = 'COPY!';
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createSoundEffect(copyBtn);
        copyToClipboard(domain);
    });
    
    actionsDiv.appendChild(copyBtn);
    
    // Register link for available domains
    if (isAvailable) {
        const registerLink = document.createElement('a');
        registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        registerLink.target = '_blank';
        registerLink.className = 'link-register';
        registerLink.textContent = 'REGISTER!';
        
        registerLink.addEventListener('click', () => {
            createSoundEffect(registerLink);
        });
        
        actionsDiv.appendChild(registerLink);
    }
    
    // Assemble the card
    card.appendChild(domainName);
    card.appendChild(metaDiv);
    if (qualityDetails) {
        card.appendChild(qualityDetails);
    }
    card.appendChild(actionsDiv);
    
    // Add hover effect with sound
    card.addEventListener('mouseenter', () => {
        if (Math.random() > 0.8) { // 20% chance for sound on hover
            createSoundEffect(card);
        }
    });
    
    return card;
}

function handleCopyAll() {
    if (currentResults.available.length === 0) {
        showComicToast('NO DOMAINS TO COPY!', 'error');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    copyToClipboard(domains, `COPIED ${currentResults.available.length} DOMAINS!`);
}

function handleExport() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showComicToast('NO RESULTS TO EXPORT!', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value;
    
    // Create CSV content
    const csvContent = [
        'Domain,Status,Quality Score,Quality Grade,Method,Registrar Link',
        ...currentResults.available.map(item => 
            `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `goblin-globe-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showComicToast('DOMAINS EXPORTED SUCCESSFULLY!', 'success');
}

function handleNewSearch() {
    // Clear form with comic effect
    document.getElementById('prompt').value = '';
    document.getElementById('count').value = '10';
    
    // Reset checkboxes to default (.com only)
    document.querySelectorAll('input[name="extensions"]').forEach(cb => {
        cb.checked = cb.value === '.com';
    });
    
    // Reset results
    currentResults = { available: [], taken: [] };
    results.style.display = 'none';
    error.style.display = 'none';
    
    // Focus on prompt input with effect
    const promptInput = document.getElementById('prompt');
    promptInput.focus();
    promptInput.style.transform = 'scale(1.05)';
    setTimeout(() => {
        promptInput.style.transform = 'scale(1)';
    }, 300);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showComicToast('READY FOR NEW SEARCH!', 'success');
}

async function copyToClipboard(text, successMessage = 'COPIED TO CLIPBOARD!') {
    try {
        await navigator.clipboard.writeText(text);
        showComicToast(successMessage, 'success');
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
            showComicToast(successMessage, 'success');
        } catch (err) {
            showComicToast('COPY FAILED!', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

function showComicToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        background: none; 
        border: none; 
        font-size: 24px; 
        cursor: pointer; 
        margin-left: 15px;
        font-family: 'Bangers', cursive;
        color: inherit;
    `;
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    });
    
    toast.appendChild(messageSpan);
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);
    
    // Trigger animation with sound effect
    setTimeout(() => {
        toast.classList.add('show');
        if (type === 'success') {
            createSoundEffect(toast);
        }
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
    errorMessage.textContent = message;
    error.style.display = 'block';
    results.style.display = 'none';
    
    // Add shake animation to error
    error.style.animation = 'none';
    setTimeout(() => {
        error.style.animation = 'bamShake 0.8s ease-out';
    }, 10);
}

function getErrorMessage(error) {
    const message = error.message || 'AN UNEXPECTED ERROR OCCURRED!';
    
    // Provide user-friendly error messages with comic flair
    if (message.includes('rate limit') || message.includes('429')) {
        return 'WHOA! TOO FAST! Wait a moment and try again!';
    }
    
    if (message.includes('timeout') || message.includes('ENOTFOUND')) {
        return 'CONNECTION TIMEOUT! Check your internet and try again!';
    }
    
    if (message.includes('401') || message.includes('403')) {
        return 'AUTHENTICATION ERROR! Refresh the page and try again!';
    }
    
    if (message.includes('500')) {
        return 'SERVER ERROR! Our goblins are working on it!';
    }
    
    if (message.includes('Invalid prompt')) {
        return 'INVALID PROMPT! Try a different description!';
    }
    
    // Return the original message with comic styling
    return message.toUpperCase();
}

// Add random comic effects on page interactions
document.addEventListener('click', (e) => {
    if (Math.random() > 0.95) { // 5% chance for random effect
        createGlobalSoundEffect(soundEffects[Math.floor(Math.random() * soundEffects.length)]);
    }
});

// Initialize on page load with comic flair
document.addEventListener('DOMContentLoaded', () => {
    // Focus on the prompt input
    document.getElementById('prompt').focus();
    
    // Add entrance animation to main title
    const title = document.querySelector('.main-title');
    title.style.transform = 'perspective(500px) rotateX(90deg) scale(0)';
    setTimeout(() => {
        title.style.transition = 'all 1s ease-out';
        title.style.transform = 'perspective(500px) rotateX(15deg) scale(1)';
    }, 300);
    
    // Show keyboard shortcuts in console with comic flair
    console.log('🦸‍♂️ GOBLIN GLOBE SUPER SHORTCUTS:');
    console.log('⚡ Ctrl+Enter: GENERATE DOMAINS!');
    console.log('📋 Ctrl+C: COPY ALL DOMAINS!');
    console.log('💾 Ctrl+S: EXPORT RESULTS!');
    console.log('🔄 Ctrl+R: NEW SEARCH!');
    
    // Welcome effect
    setTimeout(() => {
        createGlobalSoundEffect('WELCOME!');
    }, 1000);
});