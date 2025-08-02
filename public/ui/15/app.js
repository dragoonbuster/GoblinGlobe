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
  
  // Validation with organic messaging
  if (!prompt) {
    showToast('Your garden needs a vision to grow', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showToast('Choose at least one domain variety to plant', 'error');
    return;
  }
  
  // Start organic loading state
  setLoadingState(true);
  showProgressStep('Planting seeds of creativity...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showProgressStep('Nurturing domain sprouts...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to cultivate domains');
    }
    
    // Complete progress with organic messaging
    showProgressStep('Harvesting your domain garden...', 3, 3, 90);
    
    // Brief delay to show completion
    await new Promise(resolve => setTimeout(resolve, 800));
    showProgressStep('Garden is ready to explore!', 3, 3, 100);
    
    // Store results and display with staggered animations
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    
    const availableCount = data.results.available.length;
    const message = availableCount === 1 
      ? 'One beautiful domain has bloomed!' 
      : `${availableCount} domains have bloomed in your garden!`;
    showToast(message, 'success');
    
  } catch (err) {
    console.error('Generation error:', err);
    showError(getOrganicErrorMessage(err));
    showToast('The garden encountered some weeds', 'error');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Cultivating...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
  } else {
    buttonText.textContent = 'Cultivate Domains';
    buttonSpinner.classList.add('hidden');
    loading.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressText.classList.add('hidden');
  }
}

function showProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Growing stage ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showError('No domains sprouted from your vision. Try replanting with different seeds.');
    return;
  }
  
  // Create domain cards with staggered growing animation
  results.available.forEach((item, index) => {
    const div = createDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${index * 0.1}s`;
    availableList.appendChild(div);
  });
  
  results.taken.forEach((item, index) => {
    const div = createDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    div.style.animationDelay = `${(results.available.length + index) * 0.1}s`;
    takenList.appendChild(div);
  });
  
  // Show results section with smooth transition
  results.classList.remove('hidden');
  
  // Smooth scroll to results with organic timing
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
  methodSpan.textContent = method;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'Ungraded';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Quality breakdown with organic styling
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.style.fontSize = '0.85rem';
    qualityDetails.style.color = '#5a7c5e';
    qualityDetails.style.marginBottom = '1rem';
    qualityDetails.style.padding = '0.8rem';
    qualityDetails.style.background = 'rgba(133, 170, 128, 0.08)';
    qualityDetails.style.borderRadius = '12px';
    qualityDetails.style.lineHeight = '1.4';
    qualityDetails.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem; text-align: center;">
        <div><strong>Length</strong><br>${qualityScore.breakdown.length}</div>
        <div><strong>Memory</strong><br>${qualityScore.breakdown.memorability}</div>
        <div><strong>Brand</strong><br>${qualityScore.breakdown.brandability}</div>
        <div><strong>Extension</strong><br>${qualityScore.breakdown.extension}</div>
        <div><strong>Relevance</strong><br>${qualityScore.breakdown.relevance}</div>
      </div>
    `;
  }
  
  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'domain-actions';
  
  // Copy button with organic styling
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-secondary';
  copyBtn.textContent = 'Harvest';
  copyBtn.addEventListener('click', () => copyToClipboard(domain));
  
  actionsDiv.appendChild(copyBtn);
  
  // Register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'Plant It';
    
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
    showToast('No ripe domains to harvest', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  const count = currentResults.available.length;
  const message = count === 1 
    ? 'Your domain has been harvested!' 
    : `${count} domains harvested from your garden!`;
  copyToClipboard(domains, message);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showToast('No garden to harvest', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create CSV content with organic headers
  const csvContent = [
    'Domain,Growth Status,Quality Score,Quality Grade,Cultivation Method,Planting Link',
    ...currentResults.available.map(item => 
      `"${item.domain}","Ready to Bloom","${item.qualityScore?.overall || 'Ungraded'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Already Rooted","${item.qualityScore?.overall || 'Ungraded'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-garden-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showToast('Your garden has been preserved in CSV format!', 'success');
}

function handleNewSearch() {
  // Clear form with organic timing
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
  
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showToast('Ready to plant new seeds in your domain garden', 'success');
}

async function copyToClipboard(text, successMessage = 'Domain harvested to clipboard') {
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
      showToast('Failed to harvest to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: none; 
    border: none; 
    font-size: 1.2rem; 
    cursor: pointer; 
    margin-left: 1rem;
    color: currentColor;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  `;
  closeBtn.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  });
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.opacity = '1';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.opacity = '0.7';
  });
  
  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);
  
  // Trigger organic animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with organic timing
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  }, duration);
}

function showError(message) {
  const errorP = error.querySelector('p');
  if (!errorP) {
    const p = document.createElement('p');
    p.textContent = message;
    error.appendChild(p);
  } else {
    errorP.textContent = message;
  }
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getOrganicErrorMessage(error) {
  const message = error.message || 'The garden encountered an unexpected issue';
  
  // Provide organic, nature-themed error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'The garden is being tended too frequently. Let it rest a moment before planting again.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'The garden\'s connection to the outside world is weak. Check your network and try again.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'The garden gate is locked. Please refresh and try entering again.';
  }
  
  if (message.includes('500')) {
    return 'The gardener is taking a break. Please try tending your domain garden in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'These seeds won\'t grow in our garden. Try planting different ideas.';
  }
  
  // Return organic version of the original message
  return message.replace(/error/gi, 'garden issue')
              .replace(/failed/gi, 'couldn\'t grow')
              .replace(/invalid/gi, 'unsuitable')
              .replace(/server/gi, 'garden keeper');
}

// Add organic page load animations
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the prompt input
  document.getElementById('prompt').focus();
  
  // Add organic entrance animation to form
  const formContainer = document.querySelector('.form-container');
  formContainer.style.opacity = '0';
  formContainer.style.transform = 'translateY(30px) scale(0.95)';
  
  setTimeout(() => {
    formContainer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    formContainer.style.opacity = '1';
    formContainer.style.transform = 'translateY(0) scale(1)';
  }, 200);
  
  // Add organic keyboard shortcut information
  setTimeout(() => {
    console.log('🌱 Goblin Globe Domain Garden - Organic Shortcuts:');
    console.log('🌿 Ctrl+Enter: Cultivate domains');
    console.log('🍃 Ctrl+C: Harvest available domains');
    console.log('🌾 Ctrl+S: Preserve garden as CSV');
    console.log('🌱 Ctrl+R: Plant new seeds');
  }, 1000);
  
  // Add subtle floating animation to header
  const header = document.querySelector('.header');
  header.style.animation = 'floating 8s ease-in-out infinite';
});

// Add organic hover effects for interactive elements
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    e.target.style.transform = 'scale(1.1)';
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    e.target.style.transform = 'scale(1)';
  }
});

// Add organic focus effects
document.addEventListener('focusin', (e) => {
  if (e.target.matches('.form-input, .form-textarea')) {
    e.target.style.transform = 'translateY(-2px) scale(1.02)';
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target.matches('.form-input, .form-textarea')) {
    e.target.style.transform = 'translateY(0) scale(1)';
  }
});