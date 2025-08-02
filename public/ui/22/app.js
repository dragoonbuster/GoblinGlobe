// DOM Elements - Artistic Chaos Style
const form = document.getElementById('generateForm');
const generateButton = document.getElementById('generateButton');
const buttonText = document.getElementById('buttonText');
const loading = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const results = document.getElementById('results');
const error = document.getElementById('error');
const availableList = document.getElementById('availableList');
const takenList = document.getElementById('takenList');
const exportBtn = document.getElementById('exportBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const newSearchBtn = document.getElementById('newSearchBtn');

// Global state for chaos
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// Chaotic loading messages
const chaoticMessages = [
    'Splattering paint across the digital canvas...',
    'Mixing chaotic color combinations...',
    'Dripping creative domain ideas...',
    'Brushing strokes of inspiration...',
    'Creating abstract domain expressions...',
    'Unleashing artistic chaos...',
    'Painting digital masterpieces...',
    'Splashing vibrant domain colors...'
];

// Initialize chaotic event listeners
form.addEventListener('submit', handleChaoticFormSubmit);
exportBtn.addEventListener('click', handleArtisticExport);
copyAllBtn.addEventListener('click', handleCopyCanvas);
newSearchBtn.addEventListener('click', handleNewCanvas);

// Add chaotic keyboard shortcuts
document.addEventListener('keydown', (e) => {
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
                    handleCopyCanvas();
                }
                break;
            case 's':
                if (currentResults.available.length > 0) {
                    e.preventDefault();
                    handleArtisticExport();
                }
                break;
            case 'r':
                e.preventDefault();
                handleNewCanvas();
                break;
        }
    }
});

async function handleChaoticFormSubmit(e) {
    e.preventDefault();
    
    // Get chaotic form data
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Artistic validation
    if (!prompt) {
        showChaoticToast('Your canvas needs a creative vision!', 'error');
        return;
    }
    
    if (extensions.length === 0) {
        showChaoticToast('Select at least one extension splatter!', 'error');
        return;
    }
    
    // Start chaotic loading state
    setChaoticLoadingState(true);
    startChaoticLoadingAnimation();
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, count, extensions })
        });
        
        updateChaoticMessage('Checking domain canvas availability...');
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to create artistic domains');
        }
        
        // Complete chaotic progress
        updateChaoticMessage('Finalizing artistic masterpiece...');
        
        // Brief artistic delay
        await new Promise(resolve => setTimeout(resolve, 800));
        updateChaoticMessage('Artistic chaos complete!');
        
        // Store results and display artistically
        currentResults = data.results;
        currentSummary = data.summary;
        
        displayArtisticResults(data.results, data.summary);
        showChaoticToast(`Created ${data.results.available.length} available artistic domains!`, 'success');
        
    } catch (err) {
        console.error('Artistic generation error:', err);
        showArtisticError(getChaoticErrorMessage(err));
        showChaoticToast('Failed to create domain art', 'error');
    } finally {
        setChaoticLoadingState(false);
    }
}

function setChaoticLoadingState(isLoading) {
    generateButton.disabled = isLoading;
    
    if (isLoading) {
        buttonText.textContent = 'CREATING...';
        loading.classList.remove('chaos-hidden');
        results.classList.add('chaos-hidden');
        error.classList.add('chaos-hidden');
    } else {
        buttonText.textContent = 'UNLEASH CHAOS';
        loading.classList.add('chaos-hidden');
    }
}

function startChaoticLoadingAnimation() {
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (loading.classList.contains('chaos-hidden')) {
            clearInterval(messageInterval);
            return;
        }
        
        updateChaoticMessage(chaoticMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % chaoticMessages.length;
    }, 2000);
}

function updateChaoticMessage(message) {
    loadingMessage.textContent = message;
}

function displayArtisticResults(results, summary) {
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    if (results.available.length === 0 && results.taken.length === 0) {
        showArtisticError('No artistic domains were created. Try a different creative vision.');
        return;
    }
    
    // Display available domains as artistic splotches
    results.available.forEach(item => {
        const splotch = createDomainSplotch(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
        availableList.appendChild(splotch);
    });
    
    // Display taken domains as faded art
    results.taken.forEach(item => {
        const splotch = createDomainSplotch(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
        takenList.appendChild(splotch);
    });
    
    // Show artistic results section
    results.classList.remove('chaos-hidden');
    
    // Scroll to artistic results
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createDomainSplotch(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
    const splotch = document.createElement('div');
    splotch.className = `domain-splotch ${isAvailable ? 'available' : 'taken'}`;
    
    // Artistic domain name
    const domainName = document.createElement('div');
    domainName.className = 'domain-name-wild';
    domainName.textContent = domain;
    
    // Artistic meta information
    const metaDiv = document.createElement('div');
    metaDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        font-family: 'Finger Paint', cursive;
    `;
    
    const methodSpan = document.createElement('span');
    methodSpan.style.cssText = `
        font-size: 0.9rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    `;
    methodSpan.textContent = method;
    
    const scoreSpan = document.createElement('span');
    scoreSpan.style.cssText = `
        font-size: 1rem;
        font-weight: bold;
        color: ${isAvailable ? '#00FF40' : '#FF4000'};
        text-shadow: 1px 1px 0px #000;
    `;
    if (qualityScore && qualityGrade) {
        scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
    } else {
        scoreSpan.textContent = 'Artistic';
    }
    
    metaDiv.appendChild(methodSpan);
    metaDiv.appendChild(scoreSpan);
    
    // Artistic quality breakdown
    let qualityDetails = null;
    if (qualityScore && qualityScore.breakdown) {
        qualityDetails = document.createElement('div');
        qualityDetails.style.cssText = `
            font-size: 0.8rem;
            margin-bottom: 15px;
            color: #666;
            font-family: 'Finger Paint', cursive;
            line-height: 1.4;
        `;
        qualityDetails.innerHTML = `
            Length: ${qualityScore.breakdown.length}/100 • 
            Memory: ${qualityScore.breakdown.memorability}/100 • 
            Brand: ${qualityScore.breakdown.brandability}/100 • 
            Extension: ${qualityScore.breakdown.extension}/100 • 
            Relevance: ${qualityScore.breakdown.relevance}/100
        `;
    }
    
    // Chaotic actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'domain-actions-chaos';
    
    // Artistic copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-splatter';
    copyBtn.textContent = 'Copy Art';
    copyBtn.addEventListener('click', () => copyToCanvas(domain));
    
    actionsDiv.appendChild(copyBtn);
    
    // Artistic register link for available domains
    if (isAvailable) {
        const registerLink = document.createElement('a');
        registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        registerLink.target = '_blank';
        registerLink.className = 'link-splatter';
        registerLink.textContent = 'Paint It Yours';
        
        actionsDiv.appendChild(registerLink);
    }
    
    // Assemble the artistic splotch
    splotch.appendChild(domainName);
    splotch.appendChild(metaDiv);
    if (qualityDetails) {
        splotch.appendChild(qualityDetails);
    }
    splotch.appendChild(actionsDiv);
    
    return splotch;
}

function handleCopyCanvas() {
    if (currentResults.available.length === 0) {
        showChaoticToast('No artistic domains to copy from canvas', 'error');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    copyToCanvas(domains, `Copied ${currentResults.available.length} artistic domains from canvas!`);
}

function handleArtisticExport() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showChaoticToast('No artistic results to export', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value;
    
    // Create artistic CSV content
    const csvContent = [
        'Domain,Status,Quality Score,Quality Grade,Method,Registrar Link',
        ...currentResults.available.map(item => 
            `"${item.domain}","Available","${item.qualityScore?.overall || 'Artistic'}","${item.qualityGrade?.grade || 'Creative'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","Taken","${item.qualityScore?.overall || 'Artistic'}","${item.qualityGrade?.grade || 'Creative'}","${item.method}","N/A"`
        )
    ].join('\n');
    
    // Create and download artistic file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `goblin-globe-artistic-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showChaoticToast('Artistic masterpiece exported successfully!', 'success');
}

function handleNewCanvas() {
    // Clear artistic form
    document.getElementById('prompt').value = '';
    document.getElementById('count').value = '10';
    
    // Reset extension splatters to default (.com only)
    document.querySelectorAll('input[name="extensions"]').forEach(cb => {
        cb.checked = cb.value === '.com';
    });
    
    // Reset artistic results
    currentResults = { available: [], taken: [] };
    results.classList.add('chaos-hidden');
    error.classList.add('chaos-hidden');
    
    // Focus on artistic prompt input
    document.getElementById('prompt').focus();
    
    // Scroll to artistic top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showChaoticToast('Canvas cleared for new artistic creation', 'success');
}

async function copyToCanvas(text, successMessage = 'Copied to artistic canvas') {
    try {
        await navigator.clipboard.writeText(text);
        showChaoticToast(successMessage, 'success');
    } catch (err) {
        // Fallback for artistic browsers
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
            showChaoticToast(successMessage, 'success');
        } catch (err) {
            showChaoticToast('Failed to copy to artistic canvas', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

function showChaoticToast(message, type = 'success', duration = 4000) {
    // Create chaotic toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        z-index: 1000;
        background: linear-gradient(135deg, 
            ${type === 'success' ? '#00FF40, #40FF00' : '#FF4000, #FF0040'});
        color: #FFFFFF;
        padding: 20px 30px;
        font-family: 'Finger Paint', cursive;
        font-size: 1.1rem;
        text-shadow: 2px 2px 0px #000;
        border: 3px solid #000;
        transform: translateX(100%) rotate(-3deg);
        transition: transform 0.5s ease;
        clip-path: polygon(5% 0%, 95% 8%, 100% 92%, 0% 100%);
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in artistically
    setTimeout(() => {
        toast.style.transform = 'translateX(0) rotate(-3deg)';
    }, 10);
    
    // Auto remove artistically
    setTimeout(() => {
        toast.style.transform = 'translateX(100%) rotate(-3deg)';
        setTimeout(() => {
            if (toast.parentElement) {
                document.body.removeChild(toast);
            }
        }, 500);
    }, duration);
}

function showArtisticError(message) {
    const errorP = error.querySelector('p');
    errorP.textContent = message;
    error.classList.remove('chaos-hidden');
    results.classList.add('chaos-hidden');
}

function getChaoticErrorMessage(error) {
    const message = error.message || 'An artistic disruption occurred';
    
    // Provide chaotic error messages
    if (message.includes('rate limit') || message.includes('429')) {
        return 'Too much artistic chaos! Please wait before creating more masterpieces.';
    }
    
    if (message.includes('timeout') || message.includes('ENOTFOUND')) {
        return 'Artistic connection disrupted. Check your creative flow and try again.';
    }
    
    if (message.includes('401') || message.includes('403')) {
        return 'Artistic authentication failed. Refresh your creative canvas and try again.';
    }
    
    if (message.includes('500')) {
        return 'Server art block encountered. Please try again in a few artistic moments.';
    }
    
    if (message.includes('Invalid prompt')) {
        return 'Your artistic vision contains invalid elements. Try a different creative approach.';
    }
    
    // Return the original chaotic message if no specific case matches
    return message;
}

// Initialize artistic chaos on page load
document.addEventListener('DOMContentLoaded', () => {
    // Focus on the artistic prompt input
    document.getElementById('prompt').focus();
    
    // Add chaotic keyboard shortcut information
    console.log('Goblin Globe - Artistic Chaos Mode - Keyboard Shortcuts:');
    console.log('Ctrl+Enter: Unleash artistic chaos');
    console.log('Ctrl+C: Copy artistic canvas');
    console.log('Ctrl+S: Export artistic masterpiece');
    console.log('Ctrl+R: Clear artistic canvas');
    
    // Create additional artistic effects
    createFloatingPaintSplotches();
});

// Create floating paint splotches for extra chaos
function createFloatingPaintSplotches() {
    const colors = ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF', '#FF4000'];
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const splotch = document.createElement('div');
            splotch.style.cssText = `
                position: fixed;
                width: ${Math.random() * 20 + 10}px;
                height: ${Math.random() * 20 + 10}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                opacity: 0.3;
                animation: float ${Math.random() * 20 + 10}s linear infinite;
            `;
            
            document.body.appendChild(splotch);
            
            // Remove after animation
            setTimeout(() => {
                if (splotch.parentElement) {
                    document.body.removeChild(splotch);
                }
            }, 30000);
        }, i * 2000);
    }
}

// Add floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { 
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.3;
        }
        50% { 
            transform: translateY(-50px) rotate(180deg) scale(1.2);
            opacity: 0.6;
        }
        100% { 
            transform: translateY(-100px) rotate(360deg) scale(0.8);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);