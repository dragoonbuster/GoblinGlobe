// XTREME 90s Sports Style Goblin Globe Domain Finder
// RADICAL domain search that's TOTALLY TUBULAR TO THE MAX!

// Global variables for the XTREME experience
let currentResults = { available: [], taken: [] };
let searchInProgress = false;
let xtremeLevel = 100;
let radicalEffects = true;

// Initialize the XTREME system
document.addEventListener('DOMContentLoaded', function() {
    initializeXtremeEffects();
    initializeRadicalAnimations();
    startTubularSounds();
    
    // Set up form submission
    document.getElementById('domainForm').addEventListener('submit', handleFormSubmit);
    
    console.log('🔥 XTREME GOBLIN GLOBE SYSTEM LOADED TO THE MAX! 🔥');
});

// Initialize XTREME visual effects
function initializeXtremeEffects() {
    // Add floating elements
    createFloatingElements();
    
    // Random screen shake effects
    setInterval(randomScreenShake, 15000);
    
    // Color cycling effects
    setInterval(cycleXtremeColors, 3000);
    
    // Add radical particles
    setInterval(createRadicalParticle, 2000);
}

// Create floating XTREME elements
function createFloatingElements() {
    const symbols = ['🛹', '🏂', '🚲', '⚡', '🔥', '💥', '🌟', '⭐'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createFloatingSymbol(symbols[i % symbols.length]);
        }, i * 2000);
    }
}

function createFloatingSymbol(symbol) {
    const element = document.createElement('div');
    element.textContent = symbol;
    element.style.position = 'fixed';
    element.style.fontSize = '24px';
    element.style.zIndex = '999';
    element.style.pointerEvents = 'none';
    element.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    element.style.top = window.innerHeight + 'px';
    element.style.textShadow = '0 0 10px #ffff00, 0 0 20px #ff0000';
    
    document.body.appendChild(element);
    
    // Animate floating upward
    element.animate([
        { 
            transform: 'translateY(0px) rotate(0deg)', 
            opacity: 0.8,
            filter: 'hue-rotate(0deg)'
        },
        { 
            transform: `translateY(-${window.innerHeight + 100}px) rotate(360deg)`, 
            opacity: 0,
            filter: 'hue-rotate(360deg)'
        }
    ], {
        duration: 8000 + Math.random() * 4000,
        easing: 'ease-out'
    }).onfinish = () => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
        
        // Create new floating element
        setTimeout(() => {
            createFloatingSymbol(symbol);
        }, 5000 + Math.random() * 10000);
    };
}

// Random screen shake for XTREME effect
function randomScreenShake() {
    if (Math.random() < 0.3) { // 30% chance
        const container = document.querySelector('.xtreme-container');
        if (container) {
            container.style.animation = 'xtremeShake 0.5s ease';
            setTimeout(() => {
                container.style.animation = '';
            }, 500);
        }
    }
}

// Cycle through XTREME colors
function cycleXtremeColors() {
    const colorElements = document.querySelectorAll('.grunge-text, .flame-text');
    colorElements.forEach(element => {
        const hue = Math.random() * 360;
        element.style.filter = `hue-rotate(${hue}deg) saturate(1.5) brightness(1.2)`;
    });
}

// Create radical particles
function createRadicalParticle() {
    const particles = ['⚡', '🔥', '💥', '✨', '💫', '⭐'];
    const particle = particles[Math.floor(Math.random() * particles.length)];
    
    const element = document.createElement('div');
    element.textContent = particle;
    element.style.position = 'fixed';
    element.style.fontSize = '18px';
    element.style.zIndex = '998';
    element.style.pointerEvents = 'none';
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = Math.random() * window.innerHeight + 'px';
    element.style.textShadow = '0 0 15px #ffff00';
    
    document.body.appendChild(element);
    
    // Animate particle explosion
    element.animate([
        { 
            transform: 'scale(0) rotate(0deg)', 
            opacity: 1 
        },
        { 
            transform: 'scale(2) rotate(180deg)', 
            opacity: 0.5 
        },
        { 
            transform: 'scale(0) rotate(360deg)', 
            opacity: 0 
        }
    ], {
        duration: 1500,
        easing: 'ease-out'
    }).onfinish = () => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
    };
}

// Initialize radical animations
function initializeRadicalAnimations() {
    // Add random animation classes to elements
    const animatedElements = document.querySelectorAll('.xtreme-button, .nav-link');
    
    animatedElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (Math.random() < 0.5) {
                element.style.animation = 'spin 0.5s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        });
    });
}

// Start tubular background sounds (simulated)
function startTubularSounds() {
    // Simulate radical sound effects
    console.log('🎵 TUBULAR SOUNDTRACK ACTIVATED! 🎵');
    console.log('🔊 Playing: "Radical Domains Theme Song.mp3"');
}

// XTREME alert system
function showXtremeAlert(title, message, type = 'radical') {
    // Create XTREME alert overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    const alertBox = document.createElement('div');
    alertBox.style.background = 'linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #ff00ff)';
    alertBox.style.backgroundSize = '400% 400%';
    alertBox.style.animation = 'xtremeGradient 2s ease infinite';
    alertBox.style.border = '5px solid #ffffff';
    alertBox.style.padding = '5px';
    alertBox.style.borderRadius = '0';
    alertBox.style.maxWidth = '500px';
    alertBox.style.boxShadow = '0 0 50px #ffff00';
    
    const innerBox = document.createElement('div');
    innerBox.style.background = '#000000';
    innerBox.style.padding = '25px';
    innerBox.style.color = '#ffffff';
    innerBox.style.textAlign = 'center';
    innerBox.style.fontFamily = 'Impact, "Arial Black", sans-serif';
    
    innerBox.innerHTML = `
        <div style="color: #ffff00; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; text-shadow: 2px 2px 4px #ff0000;">
            ${title}
        </div>
        <div style="color: #ffffff; font-size: 14px; line-height: 1.5; margin-bottom: 25px; white-space: pre-line;">
            ${message}
        </div>
        <button onclick="this.closest('.xtreme-alert-overlay').remove()" 
                style="background: linear-gradient(45deg, #00ff00, #ffff00); color: #000000; border: 3px solid #ff0000; padding: 12px 24px; font-family: Impact, 'Arial Black', sans-serif; font-weight: bold; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 15px #00ff00;">
            RADICAL! OK!
        </button>
    `;
    
    alertBox.appendChild(innerBox);
    overlay.className = 'xtreme-alert-overlay';
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
    
    // Auto-close after 8 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 8000);
}

// Handle form submission with XTREME validation
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (searchInProgress) {
        showXtremeAlert('WHOA DUDE!', 'Hold your horses, radical rider!\nWe\'re already searching for XTREME domains!\nChill out and wait for the TUBULAR results!');
        return;
    }
    
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // XTREME validation
    if (!prompt) {
        showXtremeAlert('NOT RADICAL ENOUGH!', 'Dude! You totally forgot to tell us about your XTREME business!\nType something RADICAL in the text box!');
        document.getElementById('prompt').focus();
        return;
    }
    
    if (prompt.length < 5) {
        showXtremeAlert('TOO SHORT, BRO!', 'That description is shorter than a skateboard!\nGive us more RADICAL details about your business!');
        document.getElementById('prompt').focus();
        return;
    }
    
    if (extensions.length === 0) {
        showXtremeAlert('NO EXTENSIONS SELECTED!', 'Dude! You gotta pick some TUBULAR domain extensions!\nCheck those boxes like you\'re landing a 900° spin!');
        return;
    }
    
    await searchXtremeDomains(prompt, count, extensions);
}

// The main XTREME search function
async function searchXtremeDomains(prompt, count, extensions) {
    searchInProgress = true;
    
    // Show XTREME loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    
    // XTREME loading messages
    const loadingMessages = [
        '🔥 SEARCHING FOR RADICAL DOMAINS... 🔥',
        '⚡ POWERING UP THE XTREME ENGINE... ⚡',
        '🚀 LAUNCHING INTO CYBERSPACE... 🚀',
        '💥 EXPLODING WITH AWESOME IDEAS... 💥',
        '🛹 SKATEBOARDING THROUGH THE WEB... 🛹',
        '🏂 SNOWBOARDING DOWN DATA SLOPES... 🏂',
        '🔥 BURNING RUBBER ON THE INFO HIGHWAY... 🔥',
        '⚡ CHARGING UP THE RADICAL RESULTS... ⚡',
        '🌟 COLLECTING STELLAR DOMAINS... 🌟',
        '💫 GATHERING COSMIC DOMAIN ENERGY... 💫'
    ];
    
    const detailMessages = [
        'Firing up the XTREME AI engine...',
        'Connecting to the RADICAL database...',
        'Scanning the TUBULAR internet...',
        'Processing GNARLY algorithms...',
        'Generating AWESOME domain ideas...',
        'Checking MEGA availability...',
        'Calculating RADICAL scores...',
        'Applying XTREME filters...',
        'Compiling TUBULAR results...',
        'Finalizing EPIC domain list...'
    ];
    
    let messageIndex = 0;
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        document.getElementById('loadingText').textContent = loadingMessages[messageIndex % loadingMessages.length];
        document.getElementById('loadingDetails').textContent = detailMessages[Math.floor(messageIndex / 1.5) % detailMessages.length];
        messageIndex++;
        
        progress += 10;
        const progressPercent = Math.min(100, Math.floor(progress));
        
        const loadingBar = document.getElementById('loadingBar');
        const loadingPercent = document.getElementById('loadingPercent');
        
        loadingBar.style.width = progressPercent + '%';
        loadingPercent.textContent = progressPercent + '%';
        
        // Add some radical effects to the loading bar
        if (progressPercent > 50) {
            loadingBar.style.boxShadow = '0 0 20px #00ff00, inset 0 0 20px rgba(255, 255, 255, 0.3)';
        }
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
            throw new Error(data.error || 'The XTREME AI totally wiped out!');
        }
        
        currentResults = data.results;
        displayXtremeResults(data.results);
        
        // Show XTREME success message
        const availableCount = data.results.available.length;
        let successMessage = '';
        
        if (availableCount > 15) {
            successMessage = `🏆 TOTALLY RADICAL! 🏆\nYou just scored ${availableCount} AWESOME available domains!\nThat's more XTREME than a 1080° snowboard trick!\nYou're officially the most TUBULAR domain hunter!`;
        } else if (availableCount > 10) {
            successMessage = `🔥 MEGA GNARLY! 🔥\nFound ${availableCount} RADICAL available domains!\nThat's like landing a perfect halfpipe run!\nTime to register these AWESOME domains!`;
        } else if (availableCount > 5) {
            successMessage = `⚡ PRETTY SWEET! ⚡\nDiscovered ${availableCount} TUBULAR available domains!\nNot bad for a beginner skater!\nThese domains are totally GNARLY!`;
        } else if (availableCount > 0) {
            successMessage = `🛹 NOT BAD, DUDE! 🛹\nFound ${availableCount} available domains!\nIt's like your first successful kickflip!\nEvery RADICAL journey starts somewhere!`;
        } else {
            successMessage = `💥 TOTAL WIPEOUT! 💥\nNo available domains in this XTREME search!\nEven Tony Hawk falls sometimes!\nTry a different RADICAL approach!`;
        }
        
        showXtremeAlert('SEARCH COMPLETE!', successMessage);
        
    } catch (error) {
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        // XTREME error messages
        let errorMessage = '💥 EPIC WIPEOUT! 💥\n' + error.message;
        
        if (error.message.includes('rate limit')) {
            errorMessage = '🛹 SPEED LIMIT EXCEEDED! 🛹\nWhoa there, speed demon!\nYou\'re going faster than a BMX bike!\nSlow down and try again in a sec!';
        } else if (error.message.includes('timeout')) {
            errorMessage = '⏰ TIME WIPEOUT! ⏰\nThe XTREME search took too long!\nEven radical domains need time to load!\nTry your TUBULAR search again!';
        } else if (error.message.includes('500')) {
            errorMessage = '🔥 SERVER EXPLOSION! 🔥\nOur XTREME servers are having a gnarly crash!\nOur tech ninjas are fixing it with RADICAL speed!\nCome back for more AWESOME domains soon!';
        }
        
        showXtremeAlert('SYSTEM WIPEOUT!', errorMessage);
        showStatusMessage(errorMessage, 'error');
    }
    
    searchInProgress = false;
}

// Display results in XTREME style
function displayXtremeResults(results) {
    const availableList = document.getElementById('availableList');
    const takenList = document.getElementById('takenList');
    
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    // Display available domains
    results.available.forEach((item, index) => {
        const domainItem = document.createElement('div');
        domainItem.className = 'domain-item domain-available';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        // Add some radical effects to high-quality domains
        const isRadical = qualityScore > 80;
        const glowEffect = isRadical ? 'box-shadow: 0 0 15px #00ff00;' : '';
        
        domainItem.innerHTML = `
            <div class="domain-name" style="${glowEffect}">
                ${isRadical ? '🔥 ' : ''}${item.domain}${isRadical ? ' 🔥' : ''}
            </div>
            <div class="domain-info">
                RADICAL Score: ${qualityScore}/100 ${qualityGrade ? `| Grade: ${qualityGrade}` : ''}
                ${isRadical ? ' | TOTALLY XTREME!' : ''}
            </div>
            <div class="domain-action">
                <a href="https://www.namecheap.com/domains/registration/results/?domain=${item.domain}" 
                   target="_blank" 
                   class="register-link">
                    🚀 GRAB THIS RADICAL DOMAIN! 🚀
                </a>
            </div>
        `;
        
        // Add entrance animation
        domainItem.style.opacity = '0';
        domainItem.style.transform = 'translateX(-100px)';
        availableList.appendChild(domainItem);
        
        setTimeout(() => {
            domainItem.style.transition = 'all 0.5s ease';
            domainItem.style.opacity = '1';
            domainItem.style.transform = 'translateX(0)';
        }, index * 100);
    });
    
    // Display taken domains
    results.taken.forEach((item, index) => {
        const domainItem = document.createElement('div');
        domainItem.className = 'domain-item domain-taken';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        domainItem.innerHTML = `
            <div class="domain-name">
                💥 ${item.domain}
            </div>
            <div class="domain-info">
                Score: ${qualityScore}/100 ${qualityGrade ? `| Grade: ${qualityGrade}` : ''}
            </div>
            <div class="domain-action">
                <div style="color: #ff6666; font-weight: bold; text-transform: uppercase;">
                    Already claimed by another radical rider!
                </div>
            </div>
        `;
        
        // Add entrance animation
        domainItem.style.opacity = '0';
        domainItem.style.transform = 'translateX(100px)';
        takenList.appendChild(domainItem);
        
        setTimeout(() => {
            domainItem.style.transition = 'all 0.5s ease';
            domainItem.style.opacity = '1';
            domainItem.style.transform = 'translateX(0)';
        }, index * 100);
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
    
    // XTREME scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Add some screen shake for effect
        const container = document.querySelector('.xtreme-container');
        container.style.animation = 'xtremeShake 0.3s ease';
        setTimeout(() => {
            container.style.animation = '';
        }, 300);
    }, 500);
}

// Show status messages with XTREME styling
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    
    statusDiv.className = `status-message status-${type}`;
    statusDiv.innerHTML = message.replace(/\n/g, '<br>');
    statusDiv.style.display = 'block';
    
    // Add some radical effects
    if (type === 'success') {
        statusDiv.style.animation = 'pulse 2s infinite';
    } else if (type === 'error') {
        statusDiv.style.animation = 'xtremeShake 0.5s ease';
    }
}

// Copy available domains (XTREME style)
function copyAvailable() {
    if (currentResults.available.length === 0) {
        showXtremeAlert('NOTHING TO COPY, BRO!', 'No RADICAL domains to copy!\nYou gotta search for some TUBULAR domains first!\nGet out there and find some AWESOME domains!');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(domains).then(() => {
            showXtremeAlert('COPY SUCCESSFUL!', `TOTALLY RADICAL!\nCopied ${currentResults.available.length} AWESOME domains to your clipboard!\n\nNow paste them somewhere TUBULAR and register those GNARLY domains!`);
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
        showXtremeAlert('RADICAL COPY!', `GNARLY!\nDomains copied using old-school methods!\nUse Ctrl+V to paste your XTREME domains!`);
    } catch (err) {
        showXtremeAlert('COPY WIPEOUT!', 'Dude! The copy function totally crashed!\nYour browser is more ancient than a wooden skateboard!\nJust select and copy the domains manually!');
    }
    
    document.body.removeChild(textArea);
}

// Export to CSV (XTREME edition)
function exportCSV() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showXtremeAlert('NOTHING TO EXPORT!', 'No RADICAL data to save!\nSearch for some TUBULAR domains first!\nThen come back and export your AWESOME results!');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Create XTREME CSV content
    const csvContent = [
        '# XTREME GOBLIN GLOBE DOMAIN EXPORT - TOTALLY RADICAL!',
        '# Export Date: ' + new Date().toLocaleString(),
        '# Search Description: ' + document.getElementById('prompt').value,
        '# Generated by: XTREME AI Engine v1.0 (THE MOST RADICAL AI EVER!)',
        '# WARNING: CONTENTS MAY BE TOO AWESOME FOR SOME SPREADSHEETS!',
        '',
        'Domain Name,Availability Status,Radical Score,Grade,Generation Method,Registration Portal',
        ...currentResults.available.map(item => 
            `"${item.domain}","TOTALLY AVAILABLE!","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'RADICAL'}","${item.method || 'XTREME AI'}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","Already Claimed","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'GNARLY'}","${item.method || 'XTREME AI'}","Claimed by another radical rider"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xtreme-domains-${timestamp}-${prompt}.csv`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showXtremeAlert('EXPORT COMPLETE!', 'TOTALLY TUBULAR!\nYour RADICAL domain data has been saved!\nCheck your Downloads folder for the AWESOME file!\n\nNow go register those GNARLY domains!');
}

// Start new search (XTREME style)
function newSearch() {
    if (currentResults.available.length > 0 || currentResults.taken.length > 0) {
        if (!confirm('🛹 START A NEW RADICAL SEARCH? 🛹\n\nThis will totally wipe out your current AWESOME results!\nAre you ready to find even more TUBULAR domains?')) {
            return;
        }
    }
    
    document.getElementById('prompt').value = '';
    document.getElementById('count').value = '10';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    currentResults = { available: [], taken: [] };
    
    // XTREME scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus on prompt field with some flair
    setTimeout(() => {
        const promptField = document.getElementById('prompt');
        promptField.focus();
        promptField.style.boxShadow = '0 0 20px #00ff00';
        setTimeout(() => {
            promptField.style.boxShadow = 'inset 0 0 10px #ff0000';
        }, 1000);
    }, 500);
    
    showXtremeAlert('NEW SEARCH READY!', '🚀 RADICAL RESET COMPLETE! 🚀\nYour search form is ready for another TUBULAR adventure!\nType in your next AWESOME business idea and let\'s find some GNARLY domains!');
}

// Reset form (XTREME style)
function resetForm() {
    if (!confirm('🔄 RESET TO THE MAX? 🔄\n\nThis will clear all your RADICAL input!\nYou sure you want to start fresh?')) {
        return;
    }
    
    document.getElementById('domainForm').reset();
    document.getElementById('count').value = '10';
    
    // Make sure .com is checked
    const comCheckbox = document.querySelector('input[name="extensions"][value=".com"]');
    if (comCheckbox) {
        comCheckbox.checked = true;
    }
    
    // Add some visual feedback
    const form = document.querySelector('.xtreme-form');
    form.style.animation = 'xtremeShake 0.5s ease';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
    
    showXtremeAlert('FORM RESET!', '🔧 TOTALLY RESET TO THE MAX! 🔧\nAll settings restored to RADICAL defaults!\nReady for your next AWESOME domain search!');
}

// XTREME keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // F5 or Ctrl+R warning
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        if (currentResults.available.length > 0 || currentResults.taken.length > 0) {
            if (!confirm('⚠️ REFRESH WARNING! ⚠️\n\nYou have RADICAL domain results!\nRefreshing will lose your AWESOME discoveries!\n\nYou sure you want to refresh?')) {
                e.preventDefault();
                return false;
            }
        }
    }
    
    // Escape key
    if (e.key === 'Escape' && searchInProgress) {
        showXtremeAlert('ESCAPE DETECTED!', '🛑 WHOA THERE! 🛑\nYou can\'t escape from XTREME domain searching!\nOnce the search starts, it\'s TOTALLY RADICAL to the end!');
    }
    
    // Secret XTREME codes
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        xtremeLevel = Math.min(xtremeLevel + 20, 200);
        showXtremeAlert('XTREME LEVEL UP!', `🔥 RADICAL CHEAT CODE ACTIVATED! 🔥\nXTREME Level increased to ${xtremeLevel}%!\nYour searches are now ${xtremeLevel}% more TUBULAR!`);
        
        // Add extra visual effects
        document.body.style.filter = `hue-rotate(${xtremeLevel}deg) saturate(${1 + xtremeLevel/100})`;
        setTimeout(() => {
            document.body.style.filter = '';
        }, 3000);
    }
});

// Random XTREME events
setInterval(() => {
    if (Math.random() < 0.001) { // Very rare
        const messages = [
            '🛹 SKATEBOARD ALERT! 🛹\nA wild skateboard just rolled through our servers!\nIt left some RADICAL domain vibes behind!',
            '🏂 SNOWBOARD WISDOM! 🏂\nThe mountain spirits whisper:\n"The most GNARLY domains come from XTREME creativity!"\nStay TUBULAR, dude!',
            '🔥 FIRE ALERT! 🔥\nOur servers are so HOT from generating RADICAL domains!\nThe domains are literally ON FIRE with awesomeness!',
            '⚡ LIGHTNING STRIKE! ⚡\nZAP! Our AI just got struck by XTREME inspiration!\nExpect even more TUBULAR domain suggestions!',
            '🚲 BMX NOTIFICATION! 🚲\nA BMX rider just did a 720° spin through our database!\nAll domains are now 720% more RADICAL!',
            '🌟 COSMIC RADICAL EVENT! 🌟\nThe stars have aligned in the most TUBULAR way!\nYour next domain search will be ASTRONOMICALLY AWESOME!'
        ];
        showXtremeAlert('RANDOM RADICAL EVENT!', messages[Math.floor(Math.random() * messages.length)]);
    }
}, 30000);

// Prevent right-click with XTREME message
document.addEventListener('contextmenu', function(e) {
    if (Math.random() < 0.2) {
        setTimeout(() => {
            showXtremeAlert('RIGHT-CLICK DETECTED!', '🛹 TOTALLY NOT COOL, BRO! 🛹\nDon\'t try to steal our RADICAL HTML!\nThis XTREME code took us months to perfect!\nJust enjoy the TUBULAR experience!');
        }, 100);
    }
});

console.log('🔥 XTREME GOBLIN GLOBE READY TO SHRED THE WEB! 🔥');