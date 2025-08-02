// 90s-style Goblin Globe Domain Finder
// Authentic retro web experience with modern functionality

// Global variables for the 90s experience
let currentResults = { available: [], taken: [] };
let searchInProgress = false;
let visitorCount = 1337; // Starting with a classic number
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A

// Initialize the 90s experience
document.addEventListener('DOMContentLoaded', function() {
    initializeVisitorCounter();
    initializeKonamiCode();
    initializeRandomEffects();
    
    // Set up form submission
    document.getElementById('domainForm').addEventListener('submit', handleFormSubmit);
});

// Visitor counter animation (classic 90s feature)
function initializeVisitorCounter() {
    setInterval(() => {
        visitorCount++;
        if (visitorCount > 999999) visitorCount = 1;
        
        const counterElement = document.getElementById('visitorCounter');
        if (counterElement) {
            counterElement.textContent = String(visitorCount).padStart(6, '0');
        }
    }, 5000);
}

// Konami code easter egg (very 90s)
function initializeKonamiCode() {
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateCheatMode();
        }
    });
}

function activateCheatMode() {
    alert('🎉 CHEAT CODE ACTIVATED! 🎉\nYou found the secret goblin power!\n30 extra domains unlocked!');
    
    const countSelect = document.getElementById('count');
    if (countSelect && !countSelect.querySelector('option[value="50"]')) {
        const cheatOption = document.createElement('option');
        cheatOption.value = '50';
        cheatOption.textContent = '50 domains (CHEAT MODE!)';
        cheatOption.style.color = '#ff0000';
        cheatOption.style.fontWeight = 'bold';
        countSelect.appendChild(cheatOption);
    }
}

// Random 90s visual effects
function initializeRandomEffects() {
    setInterval(() => {
        // Random color change for rainbow elements
        const rainbowElements = document.querySelectorAll('.rainbow-text, .wordart-title');
        rainbowElements.forEach(el => {
            el.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        });
        
        // Randomly change the construction animation speed
        const constructionElements = document.querySelectorAll('.construction');
        constructionElements.forEach(el => {
            el.style.animationDuration = (0.5 + Math.random() * 1.5) + 's';
        });
    }, 3000);
}

// Handle form submission with 90s flair
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (searchInProgress) {
        alert('WHOA THERE COWBOY! Still searching the interwebs!');
        return;
    }
    
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Validation with 90s style alerts
    if (!prompt) {
        alert('Dude! You gotta tell me what kind of domain you want!');
        return;
    }
    
    if (extensions.length === 0) {
        alert('Choose an extension or the goblins will be sad! :-(');
        return;
    }
    
    await searchDomains(prompt, count, extensions);
}

// The main search function with authentic 90s loading experience
async function searchDomains(prompt, count, extensions) {
    searchInProgress = true;
    
    // Hide results and show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    
    // 90s loading text animation
    const loadingTexts = [
        'INITIALIZING AI GOBLIN BRAIN...',
        'CONNECTING TO THE MATRIX...',
        'HACKING THE MAINFRAME...',
        'CONSULTING CRYSTAL BALL...',
        'AWAKENING DOMAIN SPIRITS...',
        'SEARCHING THE WORLD WIDE WEB...',
        'GENERATING AWESOME NAMES...',
        'CHECKING AVAILABILITY...',
        'CALCULATING COOLNESS FACTOR...',
        'ADDING EXTRA MAGIC SAUCE...',
        'CONSULTING THE GOBLIN COUNCIL...',
        'FINALIZING EPIC RESULTS...'
    ];
    
    let textIndex = 0;
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        document.getElementById('loadingText').textContent = loadingTexts[textIndex];
        textIndex = (textIndex + 1) % loadingTexts.length;
        
        progress += 8.33; // Progress to 100 in 12 steps
        const filledBars = Math.floor(progress / 5);
        const progressBarText = '█'.repeat(filledBars) + '░'.repeat(20 - filledBars);
        
        document.getElementById('progressBar').textContent = progressBarText;
        document.getElementById('progressPercent').textContent = Math.min(100, Math.floor(progress)) + '%';
    }, 800);
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, count, extensions })
        });
        
        const data = await response.json();
        
        // Stop loading animation
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'The goblins encountered an error!');
        }
        
        currentResults = data.results;
        displayResults(data.results);
        
        // Show success message with 90s flair
        const availableCount = data.results.available.length;
        let successMessage = '';
        if (availableCount > 10) {
            successMessage = `HOLY COW! Found ${availableCount} available domains! You hit the jackpot!`;
        } else if (availableCount > 5) {
            successMessage = `AWESOME! Found ${availableCount} available domains! Not too shabby!`;
        } else if (availableCount > 0) {
            successMessage = `SUCCESS! Found ${availableCount} available domains! Better than nothing!`;
        } else {
            successMessage = 'BUMMER! No available domains found. Try a different search!';
        }
        
        showStatus(successMessage, 'success');
        
    } catch (error) {
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        // 90s style error messages
        let errorMessage = 'OOPS! Something went wrong: ' + error.message;
        if (error.message.includes('rate limit')) {
            errorMessage = 'SLOW DOWN THERE SPEED RACER! Too many requests. Chill for a sec!';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'TIMEOUT ERROR! The internet tubes are clogged! Try again!';
        } else if (error.message.includes('500')) {
            errorMessage = 'SERVER ERROR! Our hamsters need a coffee break! Try again later!';
        }
        
        showStatus(errorMessage, 'error');
    }
    
    searchInProgress = false;
}

// Display results in authentic 90s table format
function displayResults(results) {
    const availableList = document.getElementById('availableList');
    const takenList = document.getElementById('takenList');
    
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    // Display available domains with 90s styling
    results.available.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'domain-available';
        
        // Add some 90s flair to alternating rows
        if (index % 2 === 1) {
            row.style.backgroundColor = '#90EE90';
        }
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        // Create cells safely to prevent XSS
        const domainCell = document.createElement('td');
        domainCell.width = '40%';
        domainCell.style.fontFamily = 'Courier New, monospace';
        domainCell.style.fontWeight = 'bold';
        domainCell.textContent = item.domain;
        
        const scoreCell = document.createElement('td');
        scoreCell.width = '30%';
        scoreCell.style.textAlign = 'center';
        scoreCell.textContent = `Score: ${qualityScore}/100`;
        if (qualityGrade) {
            const gradeSmall = document.createElement('small');
            gradeSmall.textContent = `(Grade: ${qualityGrade})`;
            scoreCell.appendChild(document.createElement('br'));
            scoreCell.appendChild(gradeSmall);
        }
        
        const actionCell = document.createElement('td');
        actionCell.width = '30%';
        actionCell.style.textAlign = 'center';
        
        const registerLink = document.createElement('a');
        registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(item.domain)}`;
        registerLink.target = '_blank';
        registerLink.style.cssText = 'color: #000080; font-weight: bold; text-decoration: underline;';
        registerLink.textContent = 'REGISTER NOW!';
        
        const availableText = document.createElement('small');
        availableText.style.color = '#008000';
        availableText.textContent = 'AVAILABLE!';
        
        actionCell.appendChild(registerLink);
        actionCell.appendChild(document.createElement('br'));
        actionCell.appendChild(availableText);
        
        row.appendChild(domainCell);
        row.appendChild(scoreCell);
        row.appendChild(actionCell);
        availableList.appendChild(row);
    });
    
    // Display taken domains
    results.taken.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'domain-taken';
        
        // Add some 90s flair to alternating rows
        if (index % 2 === 1) {
            row.style.backgroundColor = '#FF6B6B';
        }
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        // Create cells safely to prevent XSS
        const domainCell = document.createElement('td');
        domainCell.width = '40%';
        domainCell.style.fontFamily = 'Courier New, monospace';
        domainCell.style.fontWeight = 'bold';
        domainCell.textContent = item.domain;
        
        const scoreCell = document.createElement('td');
        scoreCell.width = '30%';
        scoreCell.style.textAlign = 'center';
        scoreCell.textContent = `Score: ${qualityScore}/100`;
        if (qualityGrade) {
            const gradeSmall = document.createElement('small');
            gradeSmall.textContent = `(Grade: ${qualityGrade})`;
            scoreCell.appendChild(document.createElement('br'));
            scoreCell.appendChild(gradeSmall);
        }
        
        const statusCell = document.createElement('td');
        statusCell.width = '30%';
        statusCell.style.textAlign = 'center';
        
        const unavailableText = document.createElement('small');
        unavailableText.style.color = '#FFFFFF';
        unavailableText.textContent = 'UNAVAILABLE';
        
        const takenText = document.createElement('small');
        takenText.style.color = '#FFB6C1';
        takenText.textContent = 'Someone beat you to it!';
        
        statusCell.appendChild(unavailableText);
        statusCell.appendChild(document.createElement('br'));
        statusCell.appendChild(takenText);
        
        row.appendChild(domainCell);
        row.appendChild(scoreCell);
        row.appendChild(statusCell);
        takenList.appendChild(row);
    });
    
    // Hide empty sections
    const availableSection = document.getElementById('availableSection');
    const takenSection = document.getElementById('takenSection');
    
    if (results.available.length === 0) {
        availableSection.style.display = 'none';
    } else {
        availableSection.style.display = 'block';
    }
    
    if (results.taken.length === 0) {
        takenSection.style.display = 'none';
    } else {
        takenSection.style.display = 'block';
    }
    
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results with 90s flair
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({
            behavior: 'auto', // No smooth scrolling in the 90s!
            block: 'start'
        });
    }, 100);
}

// Show status messages with 90s styling
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    
    let bgColor = '#c0c0c0';
    let textColor = '#000000';
    let prefix = '';
    
    if (type === 'success') {
        bgColor = '#90EE90';
        prefix = '✅ SUCCESS: ';
    } else if (type === 'error') {
        bgColor = '#FFB6C1';
        prefix = '❌ ERROR: ';
    }
    
    // Safely set status message to prevent XSS
    statusDiv.textContent = '';
    const boldElement = document.createElement('b');
    boldElement.textContent = prefix + message;
    statusDiv.appendChild(boldElement);
    statusDiv.style.display = 'block';
    statusDiv.style.backgroundColor = bgColor;
    statusDiv.style.color = textColor;
    statusDiv.style.border = '2px inset #c0c0c0';
}

// Copy available domains to clipboard (90s style)
function copyAvailable() {
    if (currentResults.available.length === 0) {
        alert('NO DOMAINS TO COPY! Search for some first, dude!');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    
    // Modern clipboard API with 90s fallback
    if (navigator.clipboard) {
        navigator.clipboard.writeText(domains).then(() => {
            alert(`RADICAL! Copied ${currentResults.available.length} domains to clipboard!\n\nNow paste them somewhere awesome!`);
        }).catch(() => {
            fallbackCopy(domains);
        });
    } else {
        fallbackCopy(domains);
    }
}

// Fallback copy method for older browsers (very 90s appropriate)
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert(`COPIED! ${text.split('\n').length} domains are now in your clipboard!\n\nRight-click and paste wherever you want!`);
    } catch (err) {
        alert('COPY FAILED! Your browser is too old school even for the 90s!\n\nPlease select and copy the domains manually.');
    }
    
    document.body.removeChild(textArea);
}

// Export to CSV with 90s flair
function exportCSV() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        alert('NOTHING TO EXPORT! Search for domains first, then come back!');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Create CSV content with 90s comment header
    const csvContent = [
        '# GOBLIN GLOBE DOMAIN EXPORT',
        '# Generated on: ' + new Date().toLocaleString(),
        '# Search prompt: ' + document.getElementById('prompt').value,
        'Domain,Status,Quality Score,Quality Grade,Method,Registrar Link',
        ...currentResults.available.map(item => 
            `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method || 'AI'}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method || 'AI'}","N/A"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goblin-globe-domains-${timestamp}-${prompt}.csv`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('EXPORT COMPLETE!\n\nYour domains have been saved to a CSV file!\nCheck your Downloads folder!');
}

// Start a new search (90s style reset)
function newSearch() {
    if (confirm('Are you sure you want to start over?\n\nThis will clear your current results!')) {
        document.getElementById('prompt').value = '';
        document.getElementById('count').value = '10';
        document.getElementById('results').style.display = 'none';
        document.getElementById('statusMessage').style.display = 'none';
        currentResults = { available: [], taken: [] };
        
        // Scroll to top (no smooth scrolling in the 90s!)
        window.scrollTo(0, 0);
        
        // Focus on the prompt field
        document.getElementById('prompt').focus();
        
        showStatus('READY FOR NEW SEARCH! Type your domain idea above!', 'success');
    }
}

// Reset form to defaults
function resetForm() {
    if (confirm('Reset the form to defaults?')) {
        document.getElementById('domainForm').reset();
        document.getElementById('count').value = '10';
        
        // Make sure .com is checked
        const comCheckbox = document.querySelector('input[name="extensions"][value=".com"]');
        if (comCheckbox) {
            comCheckbox.checked = true;
        }
        
        alert('FORM RESET! Ready for a fresh search!');
    }
}

// Add some 90s keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // F5 or Ctrl+R for refresh warning (very 90s)
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        if (currentResults.available.length > 0 || currentResults.taken.length > 0) {
            if (!confirm('WAIT! You have search results!\n\nRefreshing will lose your current domains!\n\nAre you sure you want to refresh?')) {
                e.preventDefault();
                return false;
            }
        }
    }
    
    // Escape key to stop search
    if (e.key === 'Escape' && searchInProgress) {
        alert('SEARCH CANCELLED!\n\n(Just kidding, we can\'t actually stop it once it started!)');
    }
});

// Add a 90s-style right-click warning
document.addEventListener('contextmenu', function(e) {
    // Don't actually prevent right-click, just show a 90s message
    setTimeout(() => {
        if (Math.random() < 0.1) { // 10% chance
            alert('RIGHT-CLICKING DETECTED!\n\nDon\'t steal our HTML code!\nIt took us HOURS to make this page awesome!');
        }
    }, 100);
});

// Prevent drag and drop with 90s message
document.addEventListener('dragstart', function(e) {
    if (Math.random() < 0.2) { // 20% chance
        alert('NO DRAGGING!\n\nThis isn\'t Windows 95, you know!');
        e.preventDefault();
    }
});

// Add some random 90s alerts
setInterval(() => {
    if (Math.random() < 0.001) { // Very rare, 0.1% chance every interval
        const messages = [
            'Did you know? Goblin Globe is powered by TURBO PASCAL!',
            'Fun Fact: This website looks great in 256 colors!',
            'Tip: Try the Konami code for a surprise!',
            'Remember: Always bookmark awesome websites!',
            'Pro Tip: Print this page for offline domain hunting!',
            'Did you know? We support Internet Explorer 3.0!'
        ];
        alert(messages[Math.floor(Math.random() * messages.length)]);
    }
}, 30000); // Check every 30 seconds