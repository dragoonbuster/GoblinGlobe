// DOM Elements
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

// Global state
let currentResults = { available: [], taken: [] };
let currentSummary = {};

// Steampunk loading messages
const steamPunkMessages = [
    'Calibrating brass mechanisms...',
    'Pressurising steam chambers...',
    'Adjusting copper gears...',
    'Engaging cogwheel assemblies...',
    'Stoking the discovery furnace...',
    'Consulting the mechanical oracle...',
    'Spinning the domain rotors...',
    'Charging aetheric generators...',
    'Aligning Victorian apparatus...',
    'Processing through brass conduits...'
];

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add keyboard shortcuts
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

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Validation
  if (!prompt) {
    showToast('Discovery Engine requires precise specifications', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showToast('Please select domain classification protocols', 'error');
    return;
  }
  
  // Start loading state
  setLoadingState(true);
  showProgressStep('Igniting the discovery furnace...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showProgressStep('Consulting the mechanical oracle...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Apparatus Error ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Discovery engine malfunction detected');
    }
    
    // Complete progress with steampunk flair
    showProgressStep('Brass gears aligned perfectly...', 3, 3, 90);
    
    // Brief delay to show completion
    await new Promise(resolve => setTimeout(resolve, 800));
    showProgressStep('Discovery operation complete!', 3, 3, 100);
    
    // Store results and display
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    showToast(`Discovery complete! Located ${data.results.available.length} available territories!`, 'success');
    
  } catch (err) {
    console.error('Discovery apparatus error:', err);
    showError(getErrorMessage(err));
    showToast('Discovery engine malfunction', 'error');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Engine Running...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
    
    // Add random steampunk loading message changes
    const messageInterval = setInterval(() => {
      if (!loading.classList.contains('hidden')) {
        const randomMessage = steamPunkMessages[Math.floor(Math.random() * steamPunkMessages.length)];
        loadingMessage.textContent = randomMessage;
      } else {
        clearInterval(messageInterval);
      }
    }, 2000);
    
  } else {
    buttonText.textContent = 'Engage Discovery Engine';
    buttonSpinner.classList.add('hidden');
    loading.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressText.classList.add('hidden');
  }
}

function showProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Stage ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showError('Discovery apparatus yielded no results. Recalibrate specifications and retry.');
    return;
  }
  
  // Display available domains
  results.available.forEach(item => {
    const div = createDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    availableList.appendChild(div);
  });
  
  // Display taken domains
  results.taken.forEach(item => {
    const div = createDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    takenList.appendChild(div);
  });
  
  // Show results section
  results.classList.remove('hidden');
  
  // Scroll to results with steampunk timing
  setTimeout(() => {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

function createDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const div = document.createElement('div');
  div.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Domain name
  const domainName = document.createElement('div');
  domainName.className = 'domain-name';
  domainName.textContent = domain;
  
  // Meta information
  const metaDiv = document.createElement('div');
  metaDiv.className = 'domain-meta';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'domain-method';
  methodSpan.textContent = `Discovery Method: ${method}`;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `Quality: ${qualityGrade.grade} (${qualityScore.overall}/100)`;
  } else {
    scoreSpan.textContent = 'Quality: Unassessed';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Quality breakdown (if available)
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.style.cssText = 'font-size: 14px; color: rgba(205, 133, 63, 0.8); margin: 15px 0; font-family: "Crimson Text", serif;';
    qualityDetails.innerHTML = `
      <strong>Quality Assessment:</strong><br>
      Length: ${qualityScore.breakdown.length}/100 • 
      Memorability: ${qualityScore.breakdown.memorability}/100 • 
      Brandability: ${qualityScore.breakdown.brandability}/100<br>
      Extension: ${qualityScore.breakdown.extension}/100 • 
      Relevance: ${qualityScore.breakdown.relevance}/100
    `;
  }
  
  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'domain-actions';
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-secondary';
  copyBtn.textContent = 'Copy';
  copyBtn.style.fontSize = '14px';
  copyBtn.addEventListener('click', () => copyToClipboard(domain));
  
  actionsDiv.appendChild(copyBtn);
  
  // Register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'Acquire Territory';
    
    actionsDiv.appendChild(registerLink);
  }
  
  // Assemble the card
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
    showToast('No available territories to transcribe', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `Successfully transcribed ${currentResults.available.length} available territories!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showToast('No discoveries to record in ledger', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create CSV content with steampunk headers
  const csvContent = [
    'Domain Territory,Status,Quality Assessment,Quality Grade,Discovery Method,Acquisition Portal',
    ...currentResults.available.map(item => 
      `"${item.domain}","Available Territory","${item.qualityScore?.overall || 'Unassessed'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Occupied Territory","${item.qualityScore?.overall || 'Unassessed'}","${item.qualityGrade?.grade || 'Ungraded'}","${item.method}","Territory Unavailable"`
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-discovery-ledger-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showToast('Discovery ledger successfully transcribed!', 'success');
}

function handleNewSearch() {
  // Clear form
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset checkboxes to default (.com only)
  document.querySelectorAll('input[name="extensions"]').forEach(cb => {
    cb.checked = cb.value === '.com';
  });
  
  // Reset results
  currentResults = { available: [], taken: [] };
  results.classList.add('hidden');
  error.classList.add('hidden');
  
  // Focus on prompt input
  document.getElementById('prompt').focus();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showToast('Discovery apparatus reset and ready', 'success');
}

async function copyToClipboard(text, successMessage = 'Territory coordinates copied to clipboard') {
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
      showToast('Transcription apparatus malfunction', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  messageSpan.style.fontFamily = '"Crimson Text", serif';
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: none; 
    border: none; 
    font-size: 20px; 
    cursor: pointer; 
    margin-left: 15px;
    color: inherit;
    font-weight: bold;
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
  const errorP = error.querySelector('p:last-child');
  errorP.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getErrorMessage(error) {
  const message = error.message || 'Unexpected apparatus malfunction detected';
  
  // Provide steampunk-themed error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Discovery engine overheated. Allow cooling period before retry.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Aetheric communication disrupted. Verify transmission lines and retry.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Access credentials invalid. Recalibrate authentication mechanisms.';
  }
  
  if (message.includes('500')) {
    return 'Main engine failure detected. Engineers dispatched for repairs.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Discovery specifications contain prohibited elements. Revise parameters.';
  }
  
  // Return steampunk version of original message
  return message.replace('Failed to', 'Apparatus failed to')
              .replace('Error', 'Malfunction')
              .replace('Unable to', 'Mechanisms unable to');
}

// Add atmospheric effects
function createSteamEffect() {
  const steamElements = document.querySelectorAll('.steam');
  steamElements.forEach((steam, index) => {
    steam.style.animationDelay = `${index * 0.5}s`;
  });
}

// Initialize atmospheric effects on page load
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the prompt input
  document.getElementById('prompt').focus();
  
  // Initialize steam effects
  createSteamEffect();
  
  // Add steampunk console introduction
  console.log('%c🔧 GOBLIN GLOBE DISCOVERY ENGINE 🔧', 'color: #b8860b; font-size: 16px; font-weight: bold;');
  console.log('%cVictorian Steampunk Domain Discovery Interface - Fully Operational', 'color: #cd853f; font-size: 12px;');
  console.log('%cBrass Control Protocols:', 'color: #cd853f; font-size: 12px; font-weight: bold;');
  console.log('%cCtrl+Enter: Engage Discovery Engine', 'color: #cd853f; font-size: 11px;');
  console.log('%cCtrl+C: Transcribe Available Territories', 'color: #cd853f; font-size: 11px;');
  console.log('%cCtrl+S: Export Discovery Ledger', 'color: #cd853f; font-size: 11px;');
  console.log('%cCtrl+R: Reset Discovery Apparatus', 'color: #cd853f; font-size: 11px;');
});