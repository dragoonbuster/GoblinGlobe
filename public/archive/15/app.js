// DOM Elements - Cathedral Court Interface
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

// Global Cathedral State
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// Initialize Cathedral Event Listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Gothic Keyboard Shortcuts
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

// Gothic Cathedral Loading Messages
const loadingMessages = [
  'Consulting the cathedral archives...',
  'Illuminating ancient manuscripts...',
  'Summoning domain spirits from the sanctum...',
  'Chanting sacred web incantations...',
  'Blessing digital territories...',
  'Invoking gothic domain powers...',
  'Transcribing sacred domain texts...',
  'Awakening stained glass visions...',
  'Consecrating holy web addresses...',
  'Manifesting cathedral domain magic...'
];

// Cathedral Progress Messages
const progressMessages = [
  'Gathering sacred domain essence...',
  'Consulting the Cathedral Oracle...',
  'Assembling thy blessed domain collection...'
];

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Cathedral Validation
  if (!prompt) {
    showCathedralToast('Thou must inscribe a domain vision!', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showCathedralToast('Select at least one sacred extension!', 'error');
    return;
  }
  
  // Start Cathedral Loading State
  setCathedralLoadingState(true);
  showCathedralProgressStep(progressMessages[0], 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showCathedralProgressStep(progressMessages[1], 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to manifest domains');
    }
    
    // Complete Cathedral Progress
    showCathedralProgressStep(progressMessages[2], 3, 3, 90);
    
    // Brief delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));
    showCathedralProgressStep('Cathedral manifestation complete!', 3, 3, 100);
    
    // Store results and display with fanfare
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayCathedralResults(data.results, data.summary);
    showCathedralToast(`Behold! ${data.results.available.length} sacred domains discovered!`, 'success');
    
    // Add cathedral sparkle effect
    createSparkleEffect();
    
  } catch (err) {
    console.error('Cathedral domain generation error:', err);
    showCathedralError(getCathedralErrorMessage(err));
    showCathedralToast('The domain spirits are displeased', 'error');
  } finally {
    setCathedralLoadingState(false);
  }
}

function setCathedralLoadingState(isLoading) {
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

function showCathedralProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Cathedral Process ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayCathedralResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showCathedralError('No domains were manifested. Try a different sacred decree.');
    return;
  }
  
  // Display available domains with cathedral treatment
  results.available.forEach((item, index) => {
    const div = createCathedralDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${index * 0.1}s`;
    div.classList.add('cathedral-entrance');
    availableList.appendChild(div);
  });
  
  // Display taken domains
  results.taken.forEach((item, index) => {
    const div = createCathedralDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${(results.available.length + index) * 0.1}s`;
    div.classList.add('cathedral-entrance');
    takenList.appendChild(div);
  });
  
  // Show results section with fanfare
  results.classList.remove('hidden');
  
  // Cathedral scroll to results
  setTimeout(() => {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

function createCathedralDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const div = document.createElement('div');
  div.className = `domain-cathedral-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Cathedral domain name
  const domainName = document.createElement('div');
  domainName.className = 'domain-name-cathedral';
  domainName.textContent = domain;
  
  // Cathedral meta information
  const metaDiv = document.createElement('div');
  metaDiv.className = 'domain-meta-court';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'domain-method-badge';
  methodSpan.textContent = method;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score-cathedral';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'Unscored';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Cathedral quality breakdown (if available)
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.style.cssText = `
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      color: var(--shadow-black);
      margin-bottom: 15px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(47, 27, 105, 0.1) 100%);
      clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
      border: 1px solid var(--deep-red);
    `;
    qualityDetails.innerHTML = `
      <strong>Cathedral Quality Analysis:</strong><br>
      Length: ${qualityScore.breakdown.length}/100 • 
      Memorability: ${qualityScore.breakdown.memorability}/100 • <br>
      Brandability: ${qualityScore.breakdown.brandability}/100 • 
      Extension: ${qualityScore.breakdown.extension}/100 • <br>
      Relevance: ${qualityScore.breakdown.relevance}/100
    `;
  }
  
  // Cathedral actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'domain-actions-court';
  
  // Cathedral copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'cathedral-action-button';
  copyBtn.textContent = 'Copy Domain';
  copyBtn.addEventListener('click', () => copyToCathedralClipboard(domain));
  
  actionsDiv.appendChild(copyBtn);
  
  // Cathedral register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'cathedral-action-button register-cathedral-link';
    registerLink.textContent = 'Claim Sanctum';
    
    actionsDiv.appendChild(registerLink);
  }
  
  // Assemble the cathedral card
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
    showCathedralToast('No available domains to copy to sacred clipboard', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToCathedralClipboard(domains, `Copied ${currentResults.available.length} sacred domains to thy clipboard!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showCathedralToast('No sacred results to export', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create Cathedral CSV content
  const csvContent = [
    'Domain,Status,Quality Score,Quality Grade,Method,Cathedral Registrar Link',
    ...currentResults.available.map(item => 
      `"${item.domain}","Available","${item.qualityScore?.overall || 'Unscored'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Taken","${item.qualityScore?.overall || 'Unscored'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","Unavailable"`
    )
  ].join('\n');
  
  // Create and download cathedral scroll
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-cathedral-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showCathedralToast('Sacred domain scroll exported successfully!', 'success');
}

function handleNewSearch() {
  // Clear cathedral form
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset sacred checkboxes to default (.com only)
  document.querySelectorAll('input[name="extensions"]').forEach(cb => {
    cb.checked = cb.value === '.com';
  });
  
  // Reset cathedral results
  currentResults = { available: [], taken: [] };
  results.classList.add('hidden');
  error.classList.add('hidden');
  
  // Focus on cathedral prompt input
  document.getElementById('prompt').focus();
  
  // Cathedral scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showCathedralToast('Ready for thy next sacred quest', 'success');
  
  // Add sparkle effect for new search
  createSparkleEffect();
}

async function copyToCathedralClipboard(text, successMessage = 'Copied to sacred clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    showCathedralToast(successMessage, 'success');
  } catch (err) {
    // Cathedral fallback for older browsers
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
      showCathedralToast(successMessage, 'success');
    } catch (err) {
      showCathedralToast('Failed to copy to sacred clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showCathedralToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `cathedral-toast ${type}`;
  
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
  
  // Trigger cathedral animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with cathedral timing
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  }, duration);
}

function showCathedralError(message) {
  const errorP = error.querySelector('p');
  errorP.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getCathedralErrorMessage(error) {
  const message = error.message || 'The cathedral servers are experiencing difficulties';
  
  // Provide cathedral error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many sacred requests. The digital servants need rest. Please wait a moment.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'The cathedral network connection has been severed. Check thy internet connection.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Access denied to the sacred domain archives. Refresh thy page and try again.';
  }
  
  if (message.includes('500')) {
    return 'The cathedral servers are experiencing difficulties. Try again in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Thy domain vision contains forbidden content. Try a different sacred decree.';
  }
  
  // Return cathedral version of original message
  return `Sacred decree failed: ${message}`;
}

// Cathedral Sparkle Effect
function createSparkleEffect() {
  const sparkles = ['✠', '✧', '⛪', '⚰', '†', '✦', '◆', '❖'];
  
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      sparkle.style.cssText = `
        position: fixed;
        font-size: ${1 + Math.random() * 2}rem;
        color: var(--deep-red);
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

// Add cathedral entrance animation keyframes
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
  
  @keyframes cathedralEntrance {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.8);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .cathedral-entrance {
    animation: cathedralEntrance 0.6s ease-out forwards;
    opacity: 0;
  }
`;
document.head.appendChild(style);

// Initialize Cathedral Court on page load
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the cathedral prompt input
  document.getElementById('prompt').focus();
  
  // Add cathedral keyboard shortcut information
  console.log('⛪ GOBLIN GLOBE - Gothic Cathedral Domain Finder ⛪');
  console.log('Cathedral Keyboard Shortcuts:');
  console.log('Ctrl+Enter: Manifest domains');
  console.log('Ctrl+C: Copy available domains');
  console.log('Ctrl+S: Export cathedral scroll');
  console.log('Ctrl+R: Begin new quest');
  
  // Cathedral entrance effect
  createSparkleEffect();
  
  // Add periodic ornament animation
  setInterval(() => {
    const ornaments = document.querySelectorAll('.gothic-ornament');
    ornaments.forEach((ornament, index) => {
      setTimeout(() => {
        ornament.style.animation = 'none';
        setTimeout(() => {
          ornament.style.animation = 'floatGothic 12s ease-in-out infinite';
        }, 10);
      }, index * 500);
    });
  }, 15000);
});