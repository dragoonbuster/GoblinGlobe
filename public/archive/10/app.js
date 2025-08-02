// Angelfire/Tripod Style Goblin Globe Domain Finder
// Authentic 90s starfield experience with cosmic vibes

// Global variables for the cosmic experience
let currentResults = { available: [], taken: [] };
let searchInProgress = false;
let visitorCount = 1337;
let midiPlaying = false;
let currentTrack = 0;
const midiTracks = [
    'space_theme.mid',
    'cosmic_journey.mid',
    'starfield_dreams.mid',
    'galaxy_explorer.mid',
    'nebula_dance.mid'
];

// Initialize the cosmic Angelfire experience
document.addEventListener('DOMContentLoaded', function() {
    initializeStarfield();
    initializeVisitorCounter();
    initializeMidiPlayer();
    initializeCosmicEffects();
    
    // Set up form submission
    document.getElementById('domainForm').addEventListener('submit', handleFormSubmit);
});

// Create animated starfield background
function initializeStarfield() {
    const starfield = document.getElementById('starfield');
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (1 + Math.random() * 2) + 's';
        
        // Random star colors
        const colors = ['#ffffff', '#ffff00', '#00ffff', '#ff00ff', '#00ff00'];
        star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        starfield.appendChild(star);
    }
    
    // Add shooting stars occasionally
    setInterval(createShootingStar, 8000);
}

function createShootingStar() {
    const star = document.createElement('div');
    star.style.position = 'fixed';
    star.style.width = '3px';
    star.style.height = '3px';
    star.style.backgroundColor = '#ffffff';
    star.style.borderRadius = '50%';
    star.style.zIndex = '-1';
    star.style.left = '0px';
    star.style.top = Math.random() * 50 + '%';
    star.style.boxShadow = '0 0 10px #ffffff, 2px 0 20px #ffffff';
    
    document.body.appendChild(star);
    
    // Animate shooting star
    star.animate([
        { transform: 'translateX(0px) translateY(0px)', opacity: 0 },
        { transform: 'translateX(50px) translateY(25px)', opacity: 1 },
        { transform: 'translateX(' + window.innerWidth + 'px) translateY(' + (window.innerHeight / 2) + 'px)', opacity: 0 }
    ], {
        duration: 3000,
        easing: 'ease-out'
    }).onfinish = () => {
        document.body.removeChild(star);
    };
}

// Odometer-style visitor counter
function initializeVisitorCounter() {
    setInterval(() => {
        visitorCount++;
        if (visitorCount > 9999999) visitorCount = 1000000;
        
        updateOdometerCounter();
    }, 7000);
}

function updateOdometerCounter() {
    const counterElement = document.getElementById('visitorCounter');
    const currentVisitorElement = document.getElementById('currentVisitor');
    
    if (counterElement && currentVisitorElement) {
        const counterStr = String(visitorCount).padStart(9, '0');
        const oldCounter = counterElement.textContent;
        
        // Create rolling animation for changed digits
        let newHTML = '';
        for (let i = 0; i < counterStr.length; i++) {
            if (oldCounter[i] !== counterStr[i]) {
                newHTML += `<span class="odometer-digit">${counterStr[i]}</span>`;
            } else {
                newHTML += counterStr[i];
            }
        }
        
        counterElement.innerHTML = newHTML;
        currentVisitorElement.textContent = visitorCount.toLocaleString();
    }
}

// MIDI player simulation
function initializeMidiPlayer() {
    updateMidiDisplay();
    
    // Auto-advance tracks
    setInterval(() => {
        if (midiPlaying) {
            nextTrack();
        }
    }, 45000); // Change track every 45 seconds
}

function toggleMidi() {
    midiPlaying = !midiPlaying;
    const button = document.querySelector('.midi-button');
    
    if (midiPlaying) {
        button.textContent = '⏸️';
        showCosmicAlert('🎵 MIDI MUSIC ACTIVATED! 🎵\nNow playing cosmic tunes!');
    } else {
        button.textContent = '▶️';
        showCosmicAlert('🔇 MIDI MUSIC PAUSED 🔇\nSilence in space...');
    }
    
    updateMidiDisplay();
}

function stopMidi() {
    midiPlaying = false;
    document.querySelector('.midi-button').textContent = '▶️';
    document.getElementById('midiDisplay').textContent = '♪ MIDI Player Stopped ♪';
    showCosmicAlert('⏹️ MIDI MUSIC STOPPED ⏹️\nReturning to the void...');
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % midiTracks.length;
    updateMidiDisplay();
    
    if (midiPlaying) {
        showCosmicAlert('⏭️ CHANGING COSMIC FREQUENCY ⏭️\nNow playing: ' + midiTracks[currentTrack]);
    }
}

function updateMidiDisplay() {
    const display = document.getElementById('midiDisplay');
    if (midiPlaying) {
        display.innerHTML = `♪ Now Playing: ${midiTracks[currentTrack]} ♪`;
    } else {
        display.innerHTML = `♪ Ready: ${midiTracks[currentTrack]} ♪`;
    }
}

// Cosmic visual effects
function initializeCosmicEffects() {
    // Random color shifts for cosmic elements
    setInterval(() => {
        const cosmicElements = document.querySelectorAll('.angelfire-title, .nav-title');
        cosmicElements.forEach(el => {
            const hue = Math.random() * 360;
            el.style.filter = `hue-rotate(${hue}deg)`;
        });
    }, 5000);
    
    // Random particle effects
    setInterval(createCosmicParticle, 3000);
}

function createCosmicParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.backgroundColor = '#00ffff';
    particle.style.borderRadius = '50%';
    particle.style.zIndex = '999';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    particle.style.boxShadow = '0 0 10px #00ffff';
    particle.style.pointerEvents = 'none';
    
    document.body.appendChild(particle);
    
    // Float upward and fade
    particle.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: 'translateY(-' + window.innerHeight + 'px)', opacity: 0 }
    ], {
        duration: 8000,
        easing: 'ease-out'
    }).onfinish = () => {
        if (document.body.contains(particle)) {
            document.body.removeChild(particle);
        }
    };
}

// Cosmic alert function
function showCosmicAlert(message) {
    // Create cosmic-styled alert overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    const alertBox = document.createElement('div');
    alertBox.style.background = 'linear-gradient(45deg, #000066, #000099)';
    alertBox.style.border = '3px solid #00ffff';
    alertBox.style.padding = '20px';
    alertBox.style.borderRadius = '10px';
    alertBox.style.color = '#ffffff';
    alertBox.style.textAlign = 'center';
    alertBox.style.fontFamily = '"Times New Roman", serif';
    alertBox.style.fontSize = '14px';
    alertBox.style.boxShadow = '0 0 30px #00ffff';
    alertBox.style.maxWidth = '400px';
    
    alertBox.innerHTML = `
        <div style="color: #00ffff; font-size: 16px; font-weight: bold; margin-bottom: 15px;">
            ✨ COSMIC MESSAGE ✨
        </div>
        <div style="white-space: pre-line; margin-bottom: 20px;">
            ${message}
        </div>
        <button onclick="this.closest('.cosmic-alert-overlay').remove()" 
                style="background: linear-gradient(45deg, #0066ff, #003399); color: #ffffff; border: 2px outset #0066ff; padding: 8px 16px; cursor: pointer; font-weight: bold;">
            OK
        </button>
    `;
    
    overlay.className = 'cosmic-alert-overlay';
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 5000);
}

// Handle form submission with cosmic flair
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (searchInProgress) {
        showCosmicAlert('🚀 COSMIC SEARCH IN PROGRESS! 🚀\nPlease wait for the current mission to complete!');
        return;
    }
    
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Validation with cosmic alerts
    if (!prompt) {
        showCosmicAlert('🌟 COSMIC ERROR! 🌟\nYou must specify what kind of domain you seek in the vast cosmos!');
        return;
    }
    
    if (extensions.length === 0) {
        showCosmicAlert('⭐ MISSING PARAMETERS! ⭐\nPlease select at least one domain extension for your cosmic journey!');
        return;
    }
    
    await searchDomains(prompt, count, extensions);
}

// The main cosmic search function
async function searchDomains(prompt, count, extensions) {
    searchInProgress = true;
    
    // Show cosmic loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Cosmic loading messages
    const loadingMessages = [
        '⭐ SCANNING THE COSMOS FOR DOMAINS... ⭐',
        '🌌 TRAVELING THROUGH CYBERSPACE... 🌌',
        '🚀 LAUNCHING AI PROBES... 🚀',
        '✨ CONSULTING THE DIGITAL ORACLE... ✨',
        '🌟 MINING ASTEROID DOMAINS... 🌟',
        '💫 EXPLORING DOMAIN GALAXIES... 💫',
        '🔮 CHANNELING COSMIC WISDOM... 🔮',
        '⚡ HARNESSING STELLAR ENERGY... ⚡',
        '🌠 CATCHING FALLING DOMAINS... 🌠',
        '🛸 COMMUNICATING WITH ALIENS... 🛸',
        '🌙 CONSULTING LUNAR DATABASES... 🌙',
        '☄️ INTERCEPTING COSMIC SIGNALS... ☄️'
    ];
    
    const detailMessages = [
        'Initializing cosmic AI...',
        'Connecting to interstellar network...',
        'Scanning domain nebulae...',
        'Analyzing cosmic frequencies...',
        'Filtering space debris...',
        'Decoding alien transmissions...',
        'Calculating orbital mechanics...',
        'Harvesting solar domains...',
        'Processing quantum data...',
        'Finalizing stellar results...'
    ];
    
    let messageIndex = 0;
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        document.getElementById('loadingText').textContent = loadingMessages[messageIndex % loadingMessages.length];
        document.getElementById('loadingDetails').textContent = detailMessages[Math.floor(messageIndex / 1.2) % detailMessages.length];
        messageIndex++;
        
        progress += 9;
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        progressFill.style.width = Math.min(100, progress) + '%';
        progressPercent.textContent = Math.min(100, Math.floor(progress)) + '%';
    }, 900);
    
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
            throw new Error(data.error || 'The cosmic forces encountered an error!');
        }
        
        currentResults = data.results;
        displayCosmicResults(data.results);
        
        // Show success message with cosmic flair
        const availableCount = data.results.available.length;
        let successMessage = '';
        
        if (availableCount > 10) {
            successMessage = `🌟 COSMIC JACKPOT! 🌟\nDiscovered ${availableCount} available domains in the digital galaxy!\nThe stars have aligned in your favor!`;
        } else if (availableCount > 5) {
            successMessage = `✨ STELLAR SUCCESS! ✨\nFound ${availableCount} available domains floating in cyberspace!\nA fine cosmic harvest!`;
        } else if (availableCount > 0) {
            successMessage = `⭐ MINOR VICTORY! ⭐\nLocated ${availableCount} available domains in the vast cosmos!\nEvery star counts in the universe!`;
        } else {
            successMessage = '💫 COSMIC VOID! 💫\nNo available domains detected in this sector of cyberspace!\nTry scanning a different region of the digital universe!';
        }
        
        showCosmicAlert(successMessage);
        
    } catch (error) {
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        // Cosmic error messages
        let errorMessage = '🚨 COSMIC ERROR DETECTED! 🚨\n' + error.message;
        
        if (error.message.includes('rate limit')) {
            errorMessage = '⚡ COSMIC OVERLOAD! ⚡\nToo many requests detected!\nThe stellar network needs time to recharge!';
        } else if (error.message.includes('timeout')) {
            errorMessage = '⏰ COSMIC TIMEOUT! ⏰\nTransmission lost in the void of space!\nTry launching another probe!';
        } else if (error.message.includes('500')) {
            errorMessage = '🛸 MOTHERSHIP ERROR! 🛸\nOur cosmic servers are experiencing technical difficulties!\nAlien technicians are working on it!';
        }
        
        showCosmicAlert(errorMessage);
    }
    
    searchInProgress = false;
}

// Display results in cosmic style
function displayCosmicResults(results) {
    const availableList = document.getElementById('availableList');
    const takenList = document.getElementById('takenList');
    
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    // Display available domains
    results.available.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'domain-row domain-available';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: bold;">
                        🌟 ${item.domain}
                    </div>
                    <div style="font-size: 12px; margin-top: 5px;">
                        Quality: ${qualityScore}/100 ${qualityGrade ? `(${qualityGrade})` : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <a href="https://www.namecheap.com/domains/registration/results/?domain=${item.domain}" 
                       target="_blank" 
                       style="background: linear-gradient(45deg, #00aa00, #006600); color: #ffffff; padding: 8px 12px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        🚀 CLAIM DOMAIN
                    </a>
                    <div style="font-size: 10px; margin-top: 5px; color: #00ff00;">
                        ✅ AVAILABLE IN COSMOS
                    </div>
                </div>
            </div>
        `;
        availableList.appendChild(row);
    });
    
    // Display taken domains
    results.taken.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'domain-row domain-taken';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: bold;">
                        💫 ${item.domain}
                    </div>
                    <div style="font-size: 12px; margin-top: 5px;">
                        Quality: ${qualityScore}/100 ${qualityGrade ? `(${qualityGrade})` : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #ff6666; font-weight: bold;">
                        ❌ CLAIMED
                    </div>
                    <div style="font-size: 10px; margin-top: 5px;">
                        Already colonized by space settlers
                    </div>
                </div>
            </div>
        `;
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
    
    // Smooth cosmic scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 500);
}

// Copy available domains (cosmic style)
function copyAvailable() {
    if (currentResults.available.length === 0) {
        showCosmicAlert('🌌 EMPTY VOID! 🌌\nNo domains to copy from the cosmic database!\nLaunch a search mission first!');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(domains).then(() => {
            showCosmicAlert(`🌟 COSMIC TRANSFER COMPLETE! 🌟\nSuccessfully beamed ${currentResults.available.length} domains to your clipboard!\nReady for galactic deployment!`);
        }).catch(() => {
            fallbackCopy(domains);
        });
    } else {
        fallbackCopy(domains);
    }
}

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
        showCosmicAlert(`📋 MANUAL TRANSFER COMPLETE! 📋\nDomains copied to your cosmic clipboard!\nUse Ctrl+V to deploy them across the universe!`);
    } catch (err) {
        showCosmicAlert('❌ COPY MALFUNCTION! ❌\nYour space browser is too ancient!\nPlease manually select and copy the domain coordinates!');
    }
    
    document.body.removeChild(textArea);
}

// Export to CSV (cosmic style)
function exportCSV() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showCosmicAlert('🌌 NOTHING TO EXPORT! 🌌\nThe cosmic database is empty!\nComplete a domain scan first!');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Create cosmic CSV content
    const csvContent = [
        '# GOBLIN GLOBE COSMIC DOMAIN EXPORT',
        '# Transmission Date: ' + new Date().toLocaleString(),
        '# Search Parameters: ' + document.getElementById('prompt').value,
        '# Generated by: Angelfire Cosmic Scanner v1.0',
        'Domain,Status,Quality Score,Quality Grade,Discovery Method,Registration Portal',
        ...currentResults.available.map(item => 
            `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method || 'Cosmic AI'}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method || 'Cosmic AI'}","Already Colonized"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-domains-${timestamp}-${prompt}.csv`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCosmicAlert('📊 COSMIC DATA EXPORTED! 📊\nYour domain coordinates have been saved to the mothership!\nCheck your Downloads bay for the transmission file!');
}

// Start new search (cosmic style)
function newSearch() {
    const confirmed = confirm('🚀 LAUNCH NEW MISSION? 🚀\n\nThis will clear your current cosmic findings!\nAre you ready to explore new sectors of cyberspace?');
    
    if (confirmed) {
        document.getElementById('prompt').value = '';
        document.getElementById('count').value = '10';
        document.getElementById('results').style.display = 'none';
        currentResults = { available: [], taken: [] };
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Focus on search input
        setTimeout(() => {
            document.getElementById('prompt').focus();
        }, 500);
        
        showCosmicAlert('🌟 NEW MISSION INITIALIZED! 🌟\nCosmic scanner reset and ready for exploration!\nEnter your domain quest parameters above!');
    }
}

// Reset form (cosmic style)
function resetForm() {
    const confirmed = confirm('🔄 RESET COSMIC PARAMETERS? 🔄\n\nThis will restore all settings to factory defaults!');
    
    if (confirmed) {
        document.getElementById('domainForm').reset();
        document.getElementById('count').value = '10';
        
        // Make sure .com is checked
        const comCheckbox = document.querySelector('input[name="extensions"][value=".com"]');
        if (comCheckbox) {
            comCheckbox.checked = true;
        }
        
        showCosmicAlert('🔧 COSMIC RESET COMPLETE! 🔧\nAll parameters restored to optimal settings!\nReady for your next galactic adventure!');
    }
}

// Cosmic keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // F5 or Ctrl+R warning
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        if (currentResults.available.length > 0 || currentResults.taken.length > 0) {
            if (!confirm('⚠️ COSMIC WARNING! ⚠️\n\nYou have valuable domain data!\nRefreshing will lose your cosmic discoveries!\n\nProceed with page refresh?')) {
                e.preventDefault();
                return false;
            }
        }
    }
    
    // Escape key
    if (e.key === 'Escape' && searchInProgress) {
        showCosmicAlert('🛑 ESCAPE DETECTED! 🛑\nUnfortunately, we cannot abort a cosmic mission once launched!\nThe space-time continuum must remain stable!');
    }
    
    // Secret cosmic commands
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        showCosmicAlert('🌌 COSMIC CHEAT CODE DETECTED! 🌌\nYou have unlocked the secret knowledge of the universe!\nBut with great power comes great responsibility...');
    }
});

// Prevent right-click with cosmic message
document.addEventListener('contextmenu', function(e) {
    setTimeout(() => {
        if (Math.random() < 0.15) {
            showCosmicAlert('👽 ALIEN DETECTION! 👽\nSomeone is trying to steal our cosmic HTML technology!\nThis page is protected by intergalactic copyright law!');
        }
    }, 100);
});

// Random cosmic events
setInterval(() => {
    if (Math.random() < 0.0008) { // Very rare
        const messages = [
            '🛸 UFO SIGHTING! 🛸\nAn unidentified flying object just passed through our domain scanner!\nThey seemed friendly though...',
            '🌟 COSMIC WISDOM! 🌟\nThe stars whisper: "The best domains are born from creativity and imagination!"\nTrust in the cosmic process!',
            '⚡ SOLAR FLARE DETECTED! ⚡\nMajor cosmic activity in the domain sector!\nThis is actually great news for your search results!',
            '🌙 LUNAR TRANSMISSION! 🌙\nThe moon suggests trying different search keywords!\nCelestial bodies know best!',
            '☄️ METEOR SHOWER! ☄️\nA shower of brilliant domain ideas is heading your way!\nBe ready to catch them!',
            '🔮 COSMIC PROPHECY! 🔮\nThe digital oracle predicts great success in your domain quest!\nThe universe is aligning in your favor!'
        ];
        showCosmicAlert(messages[Math.floor(Math.random() * messages.length)]);
    }
}, 45000);

// Initialize visitor counter animation on load
setTimeout(updateOdometerCounter, 2000);