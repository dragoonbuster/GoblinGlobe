// DOM Elements - Palace Court Interface
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

// Global Palace State
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// Initialize Palace Event Listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Palace Keyboard Shortcuts
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

// Rococo Palace Loading Messages
const loadingMessages = [
  'Consulting the palace archives...',
  'Arranging delicate floral motifs...',
  'Summoning cherubic domain spirits...',
  'Weaving shell and scroll patterns...',
  'Composing pastel domain harmonies...',
  'Crafting ornate web addresses...',
  'Polishing pearl domain treasures...',
  'Dancing with butterfly inspirations...',
  'Orchestrating rococo elegance...',
  'Awakening palace domain magic...'
];

// Palace Progress Messages
const progressMessages = [
  'Gathering delicate domain essence...',
  'Consulting the Palace Oracle...',
  'Assembling thy elegant domain collection...'
];

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Palace Validation
  if (!prompt) {
    showPalaceToast('You must provide a domain vision!', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showPalaceToast('Select at least one palace extension!', 'error');
    return;
  }
  
  // Start Palace Loading State
  setPalaceLoadingState(true);
  showPalaceProgressStep(progressMessages[0], 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showPalaceProgressStep(progressMessages[1], 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to manifest domains');
    }
    
    // Complete Palace Progress
    showPalaceProgressStep(progressMessages[2], 3, 3, 90);
    
    // Brief delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));
    showPalaceProgressStep('Palace manifestation complete!', 3, 3, 100);
    
    // Store results and display with fanfare
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayPalaceResults(data.results, data.summary);
    showPalaceToast(`Behold! ${data.results.available.length} available domains discovered!`, 'success');
    
    // Add palace sparkle effect
    createSparkleEffect();
    
  } catch (err) {
    console.error('Palace domain generation error:', err);
    showPalaceError(getPalaceErrorMessage(err));
    showPalaceToast('The domain spirits are displeased', 'error');
  } finally {
    setPalaceLoadingState(false);
  }
}

function setPalaceLoadingState(isLoading) {
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

function showPalaceProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Palace Process ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayPalaceResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showPalaceError('No domains were manifested. Try a different palace decree.');
    return;
  }
  
  // Display available domains with palace treatment
  results.available.forEach((item, index) => {
    const div = createPalaceDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${index * 0.1}s`;
    div.classList.add('palace-entrance');
    availableList.appendChild(div);
  });
  
  // Display taken domains
  results.taken.forEach((item, index) => {
    const div = createPalaceDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${(results.available.length + index) * 0.1}s`;
    div.classList.add('palace-entrance');
    takenList.appendChild(div);
  });
  
  // Show results section with fanfare
  results.classList.remove('hidden');
  
  // Palace scroll to results
  setTimeout(() => {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

function createPalaceDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const div = document.createElement('div');
  div.className = `domain-palace-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Palace domain name
  const domainName = document.createElement('div');
  domainName.className = 'domain-name-palace';
  domainName.textContent = domain;
  
  // Palace meta information
  const metaDiv = document.createElement('div');
  metaDiv.className = 'domain-meta-court';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'domain-method-badge';
  methodSpan.textContent = method;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score-palace';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'Unscored';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Palace quality breakdown (if available)
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.style.cssText = `
      font-family: 'Dancing Script', cursive;
      font-size: 0.9rem;
      color: #5A5A5A;
      margin-bottom: 15px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(248, 187, 217, 0.1) 0%, rgba(230, 243, 255, 0.1) 100%);
      border-radius: 8px;
      border: 1px solid var(--rose-gold);
    `;
    qualityDetails.innerHTML = `
      <strong>Palace Quality Analysis:</strong><br>
      Length: ${qualityScore.breakdown.length}/100 • 
      Memorability: ${qualityScore.breakdown.memorability}/100 • <br>
      Brandability: ${qualityScore.breakdown.brandability}/100 • 
      Extension: ${qualityScore.breakdown.extension}/100 • <br>
      Relevance: ${qualityScore.breakdown.relevance}/100
    `;
  }
  
  // Palace actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'domain-actions-court';
  
  // Palace copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'palace-action-button';
  copyBtn.textContent = 'Copy Domain';
  copyBtn.addEventListener('click', () => copyToPalaceClipboard(domain));
  
  actionsDiv.appendChild(copyBtn);
  
  // Palace register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'palace-action-button register-palace-link';
    registerLink.textContent = 'Claim Palace';
    
    actionsDiv.appendChild(registerLink);
  }
  
  // Assemble the palace card
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
    showPalaceToast('No available domains to copy to palace clipboard', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToPalaceClipboard(domains, `Copied ${currentResults.available.length} palace domains to your clipboard!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showPalaceToast('No palace results to export', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create Palace CSV content
  const csvContent = [
    'Domain,Status,Quality Score,Quality Grade,Method,Palace Registrar Link',
    ...currentResults.available.map(item => 
      `"${item.domain}","Available","${item.qualityScore?.overall || 'Unscored'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Taken","${item.qualityScore?.overall || 'Unscored'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","Unavailable"`
    )
  ].join('\n');
  
  // Create and download palace scroll
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-palace-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showPalaceToast('Palace domain scroll exported successfully!', 'success');
}

function handleNewSearch() {
  // Clear palace form
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset palace checkboxes to default (.com only)
  document.querySelectorAll('input[name="extensions"]').forEach(cb => {
    cb.checked = cb.value === '.com';
  });
  
  // Reset palace results
  currentResults = { available: [], taken: [] };
  results.classList.add('hidden');
  error.classList.add('hidden');
  
  // Focus on palace prompt input
  document.getElementById('prompt').focus();
  
  // Palace scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showPalaceToast('Ready for your next palace quest', 'success');
  
  // Add sparkle effect for new search
  createSparkleEffect();
}

async function copyToPalaceClipboard(text, successMessage = 'Copied to palace clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    showPalaceToast(successMessage, 'success');
  } catch (err) {
    // Palace fallback for older browsers
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
      showPalaceToast(successMessage, 'success');
    } catch (err) {
      showPalaceToast('Failed to copy to palace clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showPalaceToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `palace-toast ${type}`;
  
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
    font-family: 'Great Vibes', cursive;
    font-weight: 400;
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
  
  // Trigger palace animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with palace timing
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  }, duration);
}

function showPalaceError(message) {
  const errorP = error.querySelector('p');
  errorP.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getPalaceErrorMessage(error) {
  const message = error.message || 'The palace servers are experiencing difficulties';
  
  // Provide palace error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many palace requests. The digital servants need rest. Please wait a moment.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'The palace network connection has been severed. Check your internet connection.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Access denied to the palace domain archives. Refresh your page and try again.';
  }
  
  if (message.includes('500')) {
    return 'The palace servers are experiencing difficulties. Try again in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Your domain vision contains forbidden content. Try a different palace decree.';
  }
  
  // Return palace version of original message
  return `Palace decree failed: ${message}`;
}

// Palace Sparkle Effect
function createSparkleEffect() {
  const sparkles = ['🌸', '🦋', '❀', '🐚', '✧', '✱', '❋', '✶'];
  
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      sparkle.style.cssText = `
        position: fixed;
        font-size: ${1 + Math.random() * 2}rem;
        color: var(--rococo-pink);
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

// Add palace entrance animation keyframes
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
  
  @keyframes palaceEntrance {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.8);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .palace-entrance {
    animation: palaceEntrance 0.6s ease-out forwards;
    opacity: 0;
  }
`;
document.head.appendChild(style);

// Initialize Palace Court on page load
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the palace prompt input
  document.getElementById('prompt').focus();
  
  // Add palace keyboard shortcut information
  console.log('🏰 GOBLIN GLOBE - Rococo Palace Domain Finder 🏰');
  console.log('Palace Keyboard Shortcuts:');
  console.log('Ctrl+Enter: Manifest domains');
  console.log('Ctrl+C: Copy available domains');
  console.log('Ctrl+S: Export palace scroll');
  console.log('Ctrl+R: Begin new quest');
  
  // Palace entrance effect
  createSparkleEffect();
  
  // Add periodic ornament animation
  setInterval(() => {
    const ornaments = document.querySelectorAll('.rococo-ornament');
    ornaments.forEach((ornament, index) => {
      setTimeout(() => {
        ornament.style.animation = 'none';
        setTimeout(() => {
          ornament.style.animation = 'floatRococo 10s ease-in-out infinite';
        }, 10);
      }, index * 500);
    });
  }, 15000);
});