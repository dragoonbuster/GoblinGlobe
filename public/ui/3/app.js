// DOM Elements - Royal Court Interface
const form = document.getElementById('generateForm');
const generateButton = document.getElementById('generateButton');
const buttonText = document.getElementById('buttonText');
const buttonSpinner = document.getElementById('buttonSpinner');
const loading = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const results = document.getElementById('results');
const error = document.getElementById('error');
const availableList = document.getElementById('availableList');
const takenList = document.getElementById('takenList');
const exportBtn = document.getElementById('exportBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const newSearchBtn = document.getElementById('newSearchBtn');
const toastContainer = document.getElementById('toastContainer');

// Global Royal State
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// Initialize Royal Event Listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Royal Keyboard Shortcuts
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
  }
});

// Baroque Loading Messages
const loadingMessages = [
  'Consulting the celestial archives...',
  'Communing with digital spirits...',
  'Invoking ancient domain magicks...',
  'Summoning available realms...',
  'Divining sacred web territories...',
  'Channeling royal domain energies...',
  'Manifesting digital kingdoms...',
  'Weaving ethereal web domains...',
  'Conjuring mystical web addresses...',
  'Awakening dormant domain powers...'
];

// Royal Progress Messages
const progressMessages = [
  'Gathering cosmic domain essence...',
  'Consulting the Oracle of Availability...',
  'Assembling thy royal domain collection...'
];

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Royal Validation
  if (!prompt) {
    showRoyalToast('Thou must provide a domain vision!', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showRoyalToast('Select at least one royal extension!', 'error');
    return;
  }
  
  // Start Royal Loading State
  setRoyalLoadingState(true);
  showRoyalProgressStep(progressMessages[0], 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showRoyalProgressStep(progressMessages[1], 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to manifest domains');
    }
    
    // Complete Royal Progress
    showRoyalProgressStep(progressMessages[2], 3, 3, 90);
    
    // Brief delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));
    showRoyalProgressStep('Royal manifestation complete!', 3, 3, 100);
    
    // Store results and display with fanfare
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayRoyalResults(data.results, data.summary);
    showRoyalToast(`Behold! ${data.results.available.length} available domains discovered!`, 'success');
    
    // Add royal sparkle effect
    createSparkleEffect();
    
  } catch (err) {
    console.error('Royal domain generation error:', err);
    showRoyalError(getRoyalErrorMessage(err));
    showRoyalToast('The domain spirits are displeased', 'error');
  } finally {
    setRoyalLoadingState(false);
  }
}

function setRoyalLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Manifesting...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
    
    // Rotate loading messages for variety
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (!isLoading) {
        clearInterval(messageInterval);
        return;
      }
      loadingMessage.textContent = loadingMessages[messageIndex];
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 2000);
    
  } else {
    buttonText.textContent = 'Manifest Domains';
    buttonSpinner.classList.add('hidden');
    loading.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressText.classList.add('hidden');
  }
}

function showRoyalProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Royal Process ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayRoyalResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showRoyalError('No domains were manifested. Try a different royal decree.');
    return;
  }
  
  // Display available domains with royal treatment
  results.available.forEach((item, index) => {
    const div = createRoyalDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${index * 0.1}s`;
    div.classList.add('royal-entrance');
    availableList.appendChild(div);
  });
  
  // Display taken domains
  results.taken.forEach((item, index) => {
    const div = createRoyalDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${(results.available.length + index) * 0.1}s`;
    div.classList.add('royal-entrance');
    takenList.appendChild(div);
  });
  
  // Show results section with fanfare
  results.classList.remove('hidden');
  
  // Royal scroll to results
  setTimeout(() => {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

function createRoyalDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const div = document.createElement('div');
  div.className = `domain-throne-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Royal domain name
  const domainName = document.createElement('div');
  domainName.className = 'domain-name-royal';
  domainName.textContent = domain;
  
  // Royal meta information
  const metaDiv = document.createElement('div');
  metaDiv.className = 'domain-meta-court';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'domain-method-badge';
  methodSpan.textContent = method;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score-crown';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'Unscored';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Royal quality breakdown (if available)
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.style.cssText = `
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      color: var(--baroque-purple);
      margin-bottom: 15px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
      border-radius: 8px;
      border: 1px solid var(--deep-gold);
    `;
    qualityDetails.innerHTML = `
      <strong>Royal Quality Analysis:</strong><br>
      Length: ${qualityScore.breakdown.length}/100 • 
      Memorability: ${qualityScore.breakdown.memorability}/100 • <br>
      Brandability: ${qualityScore.breakdown.brandability}/100 • 
      Extension: ${qualityScore.breakdown.extension}/100 • <br>
      Relevance: ${qualityScore.breakdown.relevance}/100
    `;
  }
  
  // Royal actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'domain-actions-court';
  
  // Royal copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'royal-action-button';
  copyBtn.textContent = 'Copy Domain';
  copyBtn.addEventListener('click', () => copyToRoyalClipboard(domain));
  
  actionsDiv.appendChild(copyBtn);
  
  // Royal register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'royal-action-button register-throne-link';
    registerLink.textContent = 'Claim Throne';
    
    actionsDiv.appendChild(registerLink);
  }
  
  // Assemble the royal card
  div.appendChild(domainName);
  div.appendChild(metaDiv);
  if (qualityDetails) {
    div.appendChild(qualityDetails);
  }
  div.appendChild(actionsDiv);
  
  return div;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showRoyalToast('No available domains to copy to royal clipboard', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToRoyalClipboard(domains, `Copied ${currentResults.available.length} royal domains to thy clipboard!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showRoyalToast('No royal results to export', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create Royal CSV content
  const csvContent = [
    'Domain,Status,Quality Score,Quality Grade,Method,Royal Registrar Link',
    ...currentResults.available.map(item => 
      `"${item.domain}","Available","${item.qualityScore?.overall || 'Unscored'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Taken","${item.qualityScore?.overall || 'Unscored'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","Unavailable"`
    )
  ].join('\n');
  
  // Create and download royal scroll
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-royal-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showRoyalToast('Royal domain scroll exported successfully!', 'success');
}

function handleNewSearch() {
  // Clear royal form
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset royal checkboxes to default (.com only)
  document.querySelectorAll('input[name="extensions"]').forEach(cb => {
    cb.checked = cb.value === '.com';
  });
  
  // Reset royal results
  currentResults = { available: [], taken: [] };
  results.classList.add('hidden');
  error.classList.add('hidden');
  
  // Focus on royal prompt input
  document.getElementById('prompt').focus();
  
  // Royal scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showRoyalToast('Ready for thy next royal quest', 'success');
  
  // Add sparkle effect for new search
  createSparkleEffect();
}

async function copyToRoyalClipboard(text, successMessage = 'Copied to royal clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    showRoyalToast(successMessage, 'success');
  } catch (err) {
    // Royal fallback for older browsers
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
      showRoyalToast(successMessage, 'success');
    } catch (err) {
      showRoyalToast('Failed to copy to royal clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showRoyalToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `royal-toast ${type}`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  messageSpan.style.cssText = 'position: relative; z-index: 2;';
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: none; 
    border: none; 
    font-size: 24px; 
    cursor: pointer; 
    margin-left: 15px;
    color: inherit;
    font-family: 'Cinzel Decorative', serif;
    font-weight: 700;
    position: relative;
    z-index: 2;
  `;
  closeBtn.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  });
  
  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);
  
  // Trigger royal animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with royal timing
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  }, duration);
}

function showRoyalError(message) {
  const errorP = error.querySelector('p');
  errorP.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getRoyalErrorMessage(error) {
  const message = error.message || 'The royal servers are experiencing difficulties';
  
  // Provide royal error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many royal requests. The digital servants need rest. Please wait a moment.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'The royal network connection has been severed. Check thy internet connection.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Access denied to the royal domain archives. Refresh thy page and try again.';
  }
  
  if (message.includes('500')) {
    return 'The royal servers are experiencing difficulties. Try again in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Thy domain vision contains forbidden content. Try a different royal decree.';
  }
  
  // Return royal version of original message
  return `Royal decree failed: ${message}`;
}

// Royal Sparkle Effect
function createSparkleEffect() {
  const sparkles = ['✦', '❈', '⚜', '✧', '❋', '✶', '❅', '✱'];
  
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      sparkle.style.cssText = `
        position: fixed;
        font-size: ${1 + Math.random() * 2}rem;
        color: var(--royal-gold);
        pointer-events: none;
        z-index: 1000;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: sparkleFloat 3s ease-out forwards;
        opacity: 0;
      `;
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        if (sparkle.parentElement) {
          sparkle.remove();
        }
      }, 3000);
    }, i * 200);
  }
}

// Add royal entrance animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes sparkleFloat {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0) rotate(0deg);
    }
    20% {
      opacity: 1;
      transform: translateY(-20px) scale(1) rotate(90deg);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0.5) rotate(360deg);
    }
  }
  
  @keyframes royalEntrance {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.8);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .royal-entrance {
    animation: royalEntrance 0.6s ease-out forwards;
    opacity: 0;
  }
`;
document.head.appendChild(style);

// Initialize Royal Court on page load
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the royal prompt input
  document.getElementById('prompt').focus();
  
  // Add royal keyboard shortcut information
  console.log('🏰 GOBLIN GLOBE - Royal Domain Finder 🏰');
  console.log('Royal Keyboard Shortcuts:');
  console.log('Ctrl+Enter: Manifest domains');
  console.log('Ctrl+C: Copy available domains');
  console.log('Ctrl+S: Export royal scroll');
  console.log('Ctrl+R: Begin new quest');
  
  // Royal entrance effect
  createSparkleEffect();
  
  // Add periodic ornament animation
  setInterval(() => {
    const ornaments = document.querySelectorAll('.baroque-ornament');
    ornaments.forEach((ornament, index) => {
      setTimeout(() => {
        ornament.style.animation = 'none';
        setTimeout(() => {
          ornament.style.animation = 'floatOrnamentation 8s ease-in-out infinite';
        }, 10);
      }, index * 500);
    });
  }, 15000);
});