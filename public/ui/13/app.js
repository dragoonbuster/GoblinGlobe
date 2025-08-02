// Educational 90s CD-ROM Style Goblin Globe Domain Finder
// Fun and educational domain learning adventure with Professor Goblin!

// Global variables for the learning experience
let currentResults = { available: [], taken: [] };
let searchInProgress = false;
let learningScore = 0;
let factsShown = 0;

// Educational messages and facts
const educationalFacts = [
    "The first domain name ever registered was symbolics.com on March 15, 1985!",
    "Domain names can only use letters, numbers, and hyphens - no spaces allowed!",
    "The most expensive domain ever sold was cars.com for $872 million!",
    "There are over 1,500 different domain extensions like .com, .net, and .org!",
    "Domain names aren't case sensitive - GOOGLE.COM is the same as google.com!",
    "The longest domain name has 63 characters - that's really long!",
    "Some countries have their own special extensions like .uk for United Kingdom!",
    "A good domain name should be easy to remember and easy to spell!"
];

const loadingMessages = [
    "🌟 Professor Goblin is working his magic... 🌟",
    "📚 Searching through the magical domain library... 📚",
    "🔮 Consulting the crystal ball of domains... 🔮",
    "🎯 Focusing the learning laser on great domains... 🎯",
    "🎨 Painting a picture of perfect domains... 🎨",
    "🧪 Mixing up a potion of awesome domain names... 🧪",
    "🌈 Creating a rainbow of domain possibilities... 🌈",
    "⭐ Gathering stardust for magical domains... ⭐"
];

const loadingDetails = [
    "Searching through the magical domain library...",
    "Consulting the wise domain spirits...",
    "Mixing creativity with technology...",
    "Checking availability with magic...",
    "Calculating awesomeness scores...",
    "Adding sparkles to the results...",
    "Making sure everything is perfect...",
    "Almost ready with your domains!"
];

// Initialize the educational system
document.addEventListener('DOMContentLoaded', function() {
    initializeEducationalFeatures();
    startLearningAnimations();
    showRandomFact();
    
    // Set up form submission
    document.getElementById('domainForm').addEventListener('submit', handleFormSubmit);
    
    // Show random educational facts
    setInterval(showRandomFact, 30000);
    
    console.log('🎓 Professor Goblin\'s Learning System Ready for Adventure! 🎓');
});

// Initialize educational features
function initializeEducationalFeatures() {
    // Add helpful tooltips
    addEducationalTooltips();
    
    // Initialize encouraging interactions
    initializeEncouragement();
    
    // Set up learning tracking
    initializeLearningTracking();
}

// Add educational tooltips
function addEducationalTooltips() {
    const tooltips = [
        { id: 'prompt', text: 'This is where you tell Professor Goblin about your website idea! Be creative and descriptive!' },
        { id: 'count', text: 'More suggestions give you more options to choose from! It\'s like having more flavors of ice cream!' },
        { selector: 'input[name="extensions"]', text: 'Domain extensions are like different types of addresses - each one has its own special purpose!' }
    ];
    
    tooltips.forEach(tooltip => {
        const elements = tooltip.id ? 
            [document.getElementById(tooltip.id)] : 
            document.querySelectorAll(tooltip.selector);
        
        elements.forEach(element => {
            if (element) {
                element.title = tooltip.text;
                element.addEventListener('focus', () => {
                    showEncouragement('Great choice! ' + tooltip.text);
                });
            }
        });
    });
}

// Initialize encouraging interactions
function initializeEncouragement() {
    const form = document.getElementById('domainForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (Math.random() < 0.3) { // 30% chance
                const encouragements = [
                    "You're doing great! Keep going!",
                    "I love your curiosity!",
                    "This is going to be awesome!",
                    "You're such a good learner!",
                    "Professor Goblin is proud of you!"
                ];
                showEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
            }
        });
    });
}

// Initialize learning tracking
function initializeLearningTracking() {
    // Track user interactions for learning analytics
    document.addEventListener('click', () => {
        learningScore += 1;
    });
    
    document.addEventListener('keypress', () => {
        learningScore += 0.5;
    });
}

// Show educational encouragement
function showEncouragement(message) {
    const encouragement = document.createElement('div');
    encouragement.style.position = 'fixed';
    encouragement.style.top = '20px';
    encouragement.style.right = '20px';
    encouragement.style.background = 'linear-gradient(45deg, #ff69b4, #ffd700)';
    encouragement.style.color = '#4b0082';
    encouragement.style.padding = '15px 20px';
    encouragement.style.borderRadius = '20px';
    encouragement.style.border = '3px solid #ff1493';
    encouragement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    encouragement.style.zIndex = '10000';
    encouragement.style.fontFamily = '"Comic Sans MS", cursive';
    encouragement.style.fontWeight = 'bold';
    encouragement.style.fontSize = '14px';
    encouragement.style.maxWidth = '300px';
    encouragement.style.animation = 'bounce 0.5s ease';
    encouragement.textContent = message;
    
    document.body.appendChild(encouragement);
    
    setTimeout(() => {
        encouragement.style.opacity = '0';
        encouragement.style.transform = 'translateY(-20px)';
        encouragement.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(encouragement)) {
                document.body.removeChild(encouragement);
            }
        }, 500);
    }, 3000);
}

// Show random educational facts
function showRandomFact() {
    if (factsShown < educationalFacts.length) {
        const fact = educationalFacts[factsShown];
        factsShown++;
        
        const factBox = document.createElement('div');
        factBox.style.position = 'fixed';
        factBox.style.bottom = '20px';
        factBox.style.left = '20px';
        factBox.style.background = 'linear-gradient(135deg, #ffeaa7, #fab1a0)';
        factBox.style.border = '3px dashed #e17055';
        factBox.style.borderRadius = '15px';
        factBox.style.padding = '20px';
        factBox.style.maxWidth = '350px';
        factBox.style.zIndex = '10000';
        factBox.style.fontFamily = '"Comic Sans MS", cursive';
        factBox.style.fontSize = '13px';
        factBox.style.color = '#2e2e2e';
        factBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        factBox.style.animation = 'slideIn 0.5s ease';
        
        factBox.innerHTML = `
            <div style="font-weight: bold; color: #d63031; margin-bottom: 10px; font-size: 16px;">
                💡 Fun Fact!
            </div>
            <div>${fact}</div>
            <button onclick="this.parentElement.remove()" 
                    style="background: #00b894; color: white; border: none; border-radius: 10px; padding: 5px 10px; margin-top: 10px; cursor: pointer; font-family: inherit;">
                Cool! 😊
            </button>
        `;
        
        document.body.appendChild(factBox);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(factBox)) {
                factBox.style.opacity = '0';
                factBox.style.transform = 'translateX(-100%)';
                factBox.style.transition = 'all 0.5s ease';
                setTimeout(() => {
                    if (document.body.contains(factBox)) {
                        document.body.removeChild(factBox);
                    }
                }, 500);
            }
        }, 10000);
    }
}

// Start learning animations
function startLearningAnimations() {
    // Animate decorative elements
    const decorations = document.querySelectorAll('.decoration');
    decorations.forEach((decoration, index) => {
        decoration.style.animationDelay = (index * 0.5) + 's';
    });
    
    // Periodic sparkle effects
    setInterval(createSparkle, 3000);
}

// Create sparkle effects
function createSparkle() {
    const sparkles = ['✨', '⭐', '🌟', '💫', '⚡'];
    const sparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
    
    const element = document.createElement('div');
    element.textContent = sparkle;
    element.style.position = 'fixed';
    element.style.fontSize = '20px';
    element.style.zIndex = '999';
    element.style.pointerEvents = 'none';
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = Math.random() * window.innerHeight + 'px';
    element.style.textShadow = '0 0 10px #ffd700';
    
    document.body.appendChild(element);
    
    // Animate sparkle
    element.animate([
        { transform: 'scale(0) rotate(0deg)', opacity: 1 },
        { transform: 'scale(1.5) rotate(180deg)', opacity: 0.8 },
        { transform: 'scale(0) rotate(360deg)', opacity: 0 }
    ], {
        duration: 2000,
        easing: 'ease-out'
    }).onfinish = () => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
    };
}

// Educational alert system
function showEducationalAlert(title, message, type = 'info') {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    const alertBox = document.createElement('div');
    alertBox.style.background = 'linear-gradient(135deg, #ffffff, #f0f8ff)';
    alertBox.style.border = '4px solid #ff69b4';
    alertBox.style.borderRadius = '20px';
    alertBox.style.padding = '30px';
    alertBox.style.maxWidth = '500px';
    alertBox.style.textAlign = 'center';
    alertBox.style.fontFamily = '"Comic Sans MS", cursive';
    alertBox.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    alertBox.style.animation = 'bounce 0.5s ease';
    
    const mascotIcon = type === 'error' ? '😔' : type === 'success' ? '🎉' : '🧙‍♂️';
    
    alertBox.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">
            ${mascotIcon}
        </div>
        <div style="font-size: 20px; font-weight: bold; color: #4b0082; margin-bottom: 15px;">
            ${title}
        </div>
        <div style="font-size: 14px; color: #2e2e2e; line-height: 1.5; margin-bottom: 25px; white-space: pre-line;">
            ${message}
        </div>
        <button onclick="this.closest('.educational-alert-overlay').remove()" 
                style="background: linear-gradient(45deg, #32cd32, #90ee90); color: #ffffff; border: 3px solid #228b22; border-radius: 15px; padding: 12px 24px; font-family: 'Comic Sans MS', cursive; font-weight: bold; cursor: pointer; font-size: 14px;">
            Got it! 😊
        </button>
    `;
    
    overlay.className = 'educational-alert-overlay';
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
    
    // Auto-close after 8 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 8000);
}

// Handle form submission with educational validation
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (searchInProgress) {
        showEducationalAlert('Hold on there!', 'Professor Goblin is still working on your last search!\nLet\'s wait for those results before starting a new adventure!');
        return;
    }
    
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Educational validation with friendly messages
    if (!prompt) {
        showEducationalAlert('Oops! Missing Information', 'Professor Goblin needs to know about your website idea!\nPlease tell me what kind of website you want to create. Be creative and have fun with it!');
        document.getElementById('prompt').focus();
        return;
    }
    
    if (prompt.length < 10) {
        showEducationalAlert('Tell me more!', 'Your idea sounds interesting, but Professor Goblin needs more details!\nTry describing your website idea with at least 10 characters. What makes it special?');
        document.getElementById('prompt').focus();
        return;
    }
    
    if (extensions.length === 0) {
        showEducationalAlert('Don\'t forget the extensions!', 'You need to choose at least one domain extension!\nThink of extensions like different types of addresses. .com is the most popular, but others are great too!');
        return;
    }
    
    // Encourage the user
    const encouragements = [
        'What an awesome idea! Let\'s find some great domains for you!',
        'I love your creativity! This is going to be fun!',
        'Professor Goblin is excited to help with your project!',
        'Great job filling out the form! Let\'s discover some domains!'
    ];
    showEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
    
    await searchEducationalDomains(prompt, count, extensions);
}

// The main educational search function
async function searchEducationalDomains(prompt, count, extensions) {
    searchInProgress = true;
    
    // Show educational loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    
    let messageIndex = 0;
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        document.getElementById('loadingText').textContent = loadingMessages[messageIndex % loadingMessages.length];
        document.getElementById('loadingDetails').textContent = loadingDetails[Math.floor(messageIndex / 1.5) % loadingDetails.length];
        messageIndex++;
        
        progress += 8;
        const progressPercent = Math.min(100, Math.floor(progress));
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = progressPercent + '%';
        progressText.textContent = progressPercent + '%';
        
        // Add encouraging messages at certain progress points
        if (progressPercent === 25) {
            showEncouragement('Great start! Professor Goblin is gathering ideas!');
        } else if (progressPercent === 50) {
            showEncouragement('Halfway there! The magic is working!');
        } else if (progressPercent === 75) {
            showEncouragement('Almost ready! The domains are looking awesome!');
        }
    }, 1000);
    
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
            throw new Error(data.error || 'Professor Goblin encountered a problem with the magic!');
        }
        
        currentResults = data.results;
        displayEducationalResults(data.results);
        
        // Show educational success message
        const availableCount = data.results.available.length;
        let successMessage = '';
        
        if (availableCount > 15) {
            successMessage = `🎉 WOW! Amazing Discovery! 🎉\nProfessor Goblin found ${availableCount} available domains for you!\nThat's like finding a treasure chest full of golden domain names!\nYou're becoming a real domain explorer!`;
        } else if (availableCount > 10) {
            successMessage = `🌟 Fantastic Work! 🌟\nYour search discovered ${availableCount} available domains!\nThat's like finding a whole collection of magical domain stones!\nProfessor Goblin is very proud of your exploring!`;
        } else if (availableCount > 5) {
            successMessage = `😊 Good Job! 😊\nWe found ${availableCount} available domains together!\nThat's like finding several shiny domain gems!\nKeep learning and exploring!`;
        } else if (availableCount > 0) {
            successMessage = `🎯 Nice Try! 🎯\nWe discovered ${availableCount} available domains!\nThat's like finding your first domain treasure!\nEvery great explorer starts somewhere!`;
        } else {
            successMessage = '🤔 Learning Opportunity! 🤔\nNo available domains this time, but that\'s okay!\nThis happens sometimes, and it\'s part of learning!\nLet\'s try a different approach together!';
        }
        
        showEducationalAlert('Search Complete!', successMessage, availableCount > 0 ? 'success' : 'info');
        
    } catch (error) {
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        // Educational error messages
        let errorMessage = '🤖 Oops! Technical Hiccup! 🤖\n' + error.message;
        
        if (error.message.includes('rate limit')) {
            errorMessage = '🐌 Slow Down, Speed Racer! 🐌\nProfessor Goblin needs a moment to catch up!\nYou\'re searching so fast that the magic needs time to recharge!\nLet\'s wait a moment and try again!';
        } else if (error.message.includes('timeout')) {
            errorMessage = '⏰ Taking a Little Longer! ⏰\nSometimes the best magic takes extra time!\nThe domain spirits are being extra careful with your request!\nLet\'s try again - patience makes perfect!';
        } else if (error.message.includes('500')) {
            errorMessage = '🔧 Professor Goblin\'s Lab Hiccup! 🔧\nOops! Something went wonky in the magical laboratory!\nDon\'t worry - our magical engineers are fixing it!\nCome back soon for more domain adventures!';
        }
        
        showEducationalAlert('Learning Moment!', errorMessage, 'error');
        showStatusMessage(errorMessage, 'error');
    }
    
    searchInProgress = false;
}

// Display results in educational format
function displayEducationalResults(results) {
    const availableList = document.getElementById('availableList');
    const takenList = document.getElementById('takenList');
    
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    // Display available domains with educational flair
    results.available.forEach((item, index) => {
        const domainCard = document.createElement('div');
        domainCard.className = 'domain-card domain-available';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        // Educational quality descriptions
        let qualityDescription = '';
        if (qualityScore > 80) {
            qualityDescription = 'Excellent choice! This domain is super awesome! ⭐⭐⭐';
        } else if (qualityScore > 60) {
            qualityDescription = 'Great domain! This one looks really good! ⭐⭐';
        } else if (qualityScore > 40) {
            qualityDescription = 'Good domain! This could work well! ⭐';
        } else {
            qualityDescription = 'This domain is okay, but we can find better ones!';
        }
        
        domainCard.innerHTML = `
            <div class="domain-name">
                🌟 ${item.domain}
            </div>
            <div class="domain-info">
                Learning Score: ${qualityScore}/100 ${qualityGrade ? `| Grade: ${qualityGrade}` : ''}<br>
                <span style="color: #32cd32; font-weight: bold;">${qualityDescription}</span>
            </div>
            <div class="domain-action">
                <a href="https://www.namecheap.com/domains/registration/results/?domain=${item.domain}" 
                   target="_blank" 
                   class="register-button">
                   🎯 Learn About Registering This Domain!
                </a>
            </div>
        `;
        
        // Add entrance animation with educational timing
        domainCard.style.opacity = '0';
        domainCard.style.transform = 'translateY(20px)';
        availableList.appendChild(domainCard);
        
        setTimeout(() => {
            domainCard.style.transition = 'all 0.5s ease';
            domainCard.style.opacity = '1';
            domainCard.style.transform = 'translateY(0)';
        }, index * 200); // Slower animation for educational viewing
    });
    
    // Display taken domains with learning opportunities
    results.taken.forEach((item, index) => {
        const domainCard = document.createElement('div');
        domainCard.className = 'domain-card domain-taken';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || '';
        
        domainCard.innerHTML = `
            <div class="domain-name">
                😔 ${item.domain}
            </div>
            <div class="domain-info">
                Learning Score: ${qualityScore}/100 ${qualityGrade ? `| Grade: ${qualityGrade}` : ''}<br>
                <span style="color: #ff6347;">This domain is already taken, but that's a learning opportunity!</span>
            </div>
            <div class="domain-action">
                <div style="color: #666666; font-size: 12px;">
                    💡 Learning tip: Try variations or different extensions!
                </div>
            </div>
        `;
        
        // Add entrance animation
        domainCard.style.opacity = '0';
        domainCard.style.transform = 'translateY(20px)';
        takenList.appendChild(domainCard);
        
        setTimeout(() => {
            domainCard.style.transition = 'all 0.5s ease';
            domainCard.style.opacity = '1';
            domainCard.style.transform = 'translateY(0)';
        }, index * 200);
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
    
    // Educational scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Show educational celebration
        createSparkle();
        showEncouragement('Great job! Look at all these wonderful results!');
    }, 1000);
}

// Show status messages with educational styling
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    
    statusDiv.className = `status-message status-${type}`;
    statusDiv.innerHTML = message.replace(/\n/g, '<br>');
    statusDiv.style.display = 'block';
}

// Copy available domains (educational style)
function copyAvailable() {
    if (currentResults.available.length === 0) {
        showEducationalAlert('Nothing to Copy Yet!', 'There are no available domains to copy right now!\nLet\'s search for some awesome domains first, then you can copy them!\nProfessor Goblin is ready to help you find great domains!');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(domains).then(() => {
            showEducationalAlert('Copy Successful!', `Fantastic! Professor Goblin copied ${currentResults.available.length} available domains for you!\n\nNow you can paste them anywhere you like - maybe in a notebook or document to save for later!\n\nGreat job learning about domains!`, 'success');
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
        showEducationalAlert('Copy Complete!', `Great! Your domains are now copied!\nYou can paste them with Ctrl+V (or Cmd+V on Mac)!\nProfessor Goblin is proud of your learning!`, 'success');
    } catch (err) {
        showEducationalAlert('Copy Needs Help!', 'Oops! The automatic copy didn\'t work, but that\'s okay!\nYou can still select the domains with your mouse and copy them manually!\nSometimes we need to do things the old-fashioned way!');
    }
    
    document.body.removeChild(textArea);
}

// Export to CSV (educational version)
function exportCSV() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showEducationalAlert('Nothing to Save Yet!', 'There are no domain results to save right now!\nLet\'s search for some amazing domains first!\nThen you can save all your discoveries for later!');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Create educational CSV content
    const csvContent = [
        '# Professor Goblin\'s Domain Learning Adventure - Results!',
        '# Date of Discovery: ' + new Date().toLocaleString(),
        '# Your Website Idea: ' + document.getElementById('prompt').value,
        '# Learning System: Professor Goblin\'s Educational AI',
        '# Remember: Always ask a grown-up before registering domains!',
        '',
        'Domain Name,Is It Available?,Learning Score,Grade,How We Found It,Where to Learn More',
        ...currentResults.available.map(item => 
            `"${item.domain}","Yes - Available!","${item.qualityScore?.overall || 'Learning'}","${item.qualityGrade?.grade || 'Great'}","${item.method || 'Professor Goblin\'s Magic'}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","No - Already Taken","${item.qualityScore?.overall || 'Learning'}","${item.qualityGrade?.grade || 'Good Try'}","${item.method || 'Professor Goblin\'s Magic'}","Learning Opportunity - Try Variations!"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `professor-goblin-domains-${timestamp}-${prompt}.csv`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showEducationalAlert('File Saved!', 'Excellent work! Professor Goblin saved all your domain discoveries!\nYou can find the file in your Downloads folder!\nThis is like keeping a diary of your learning adventure!\n\nKeep exploring and learning!', 'success');
}

// Start new search (educational style)
function newSearch() {
    if (currentResults.available.length > 0 || currentResults.taken.length > 0) {
        if (!confirm('🔍 Start a New Learning Adventure? 🔍\n\nThis will clear your current results and start fresh!\nAre you ready to explore new domain possibilities?')) {
            return;
        }
    }
    
    document.getElementById('prompt').value = '';
    document.getElementById('count').value = '10';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    currentResults = { available: [], taken: [] };
    
    // Smooth educational scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus on prompt field with encouragement
    setTimeout(() => {
        const promptField = document.getElementById('prompt');
        promptField.focus();
        showEncouragement('Ready for a new adventure! What\'s your next great idea?');
    }, 600);
    
    showEducationalAlert('New Adventure Ready!', '🎉 Perfect! Professor Goblin is ready for your next amazing idea!\nWhat kind of website would you like to create this time?\nRemember, every search is a new learning opportunity!', 'success');
}

// Reset form (educational style)
function resetForm() {
    if (!confirm('🔄 Reset Your Learning Form? 🔄\n\nThis will clear everything you typed and start over!\nAre you sure you want to reset?')) {
        return;
    }
    
    document.getElementById('domainForm').reset();
    document.getElementById('count').value = '10';
    
    // Make sure .com is checked
    const comCheckbox = document.querySelector('input[name="extensions"][value=".com"]');
    if (comCheckbox) {
        comCheckbox.checked = true;
    }
    
    // Add educational visual feedback
    const form = document.querySelector('.learning-form');
    form.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
    
    showEducationalAlert('Form Reset!', '✨ All set! Professor Goblin reset everything to the beginning!\nNow you can start fresh with a new website idea!\nWhat amazing project will you think of this time?', 'success');
}

// Quiz functionality
function showQuizResult(isCorrect) {
    if (isCorrect) {
        showEducationalAlert('Correct! Great Job!', '🎉 You got it right! 🎉\nEasy to remember and type domains are the best!\nThey help people find your website quickly and easily!\nYou\'re learning so much!', 'success');
        learningScore += 10;
    } else {
        showEducationalAlert('Good Try! Let\'s Learn!', '🤔 Not quite, but that\'s okay! 🤔\nThe best domains are easy to remember and type!\nLong or confusing domains make it hard for people to visit your website!\nKeep learning - you\'re doing great!');
        learningScore += 5; // Still reward for trying
    }
}

// Educational keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // F1 for help
    if (e.key === 'F1') {
        e.preventDefault();
        showEducationalAlert('Learning Help!', '🎓 Professor Goblin\'s Quick Help Guide! 🎓\n\n1. Describe your website idea in detail\n2. Choose how many domain suggestions you want\n3. Pick your favorite domain extensions\n4. Click the search button for magic!\n5. Copy or save any domains you like\n\nRemember: Learning is an adventure!');
    }
    
    // Escape key with educational message
    if (e.key === 'Escape' && searchInProgress) {
        showEducationalAlert('Patience, Young Learner!', '⏰ Professor Goblin is still working his magic! ⏰\nGreat things take time to create!\nLet\'s wait for the amazing results!\nPatience is an important part of learning!');
    }
});

// Random educational encouragements
setInterval(() => {
    if (Math.random() < 0.0015 && !searchInProgress) { // Rare encouraging messages
        const messages = [
            '🌟 You\'re doing amazing! Keep exploring and learning!',
            '📚 Every domain search teaches you something new!',
            '🎯 Professor Goblin believes in your creativity!',
            '⭐ Learning about domains is preparing you for the future!',
            '🎨 Your imagination makes the best websites!',
            '🚀 Keep asking questions - that\'s how we learn!'
        ];
        showEncouragement(messages[Math.floor(Math.random() * messages.length)]);
    }
}, 45000);

console.log('🎓 Professor Goblin\'s Educational Domain Adventure is ready for learning! 🎓');