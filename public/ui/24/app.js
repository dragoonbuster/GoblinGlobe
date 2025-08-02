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
  
  // Validation
  if (!prompt) {
    showToast('Please enter a prompt', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showToast('Please select at least one extension', 'error');
    return;
  }
  
  // Start loading state
  setLoadingState(true);
  showProgressStep('Generating domain ideas...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showProgressStep('Checking domain availability...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate domains');
    }
    
    // Complete progress
    showProgressStep('Analyzing results...', 3, 3, 90);
    
    // Brief delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500));
    showProgressStep('Complete!', 3, 3, 100);
    
    // Store results and display
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    showToast(`Found ${data.results.available.length} available domains!`, 'success');
    
  } catch (err) {
    console.error('Generation error:', err);
    showError(getErrorMessage(err));
    showToast('Failed to generate domains', 'error');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Generating...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
  } else {
    buttonText.textContent = 'Generate Domains';
    buttonSpinner.classList.add('hidden');
    loading.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressText.classList.add('hidden');
  }
}

function showProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Step ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showError('No domains were generated. Please try a different prompt.');
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
  
  // Scroll to results
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    scoreSpan.textContent = 'N/A';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Quality breakdown (if available)
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.className = 'type-6 mb-15';
    qualityDetails.innerHTML = `
      Length: ${qualityScore.breakdown.length}/100 • 
      Memorability: ${qualityScore.breakdown.memorability}/100 • 
      Brandability: ${qualityScore.breakdown.brandability}/100 • 
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
  copyBtn.addEventListener('click', () => copyToClipboard(domain));
  
  actionsDiv.appendChild(copyBtn);
  
  // Register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'Register';
    
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
    showToast('No available domains to copy', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `Copied ${currentResults.available.length} available domains!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showToast('No results to export', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create CSV content
  const csvContent = [
    'Domain,Status,Quality Score,Quality Grade,Method,Registrar Link',
    ...currentResults.available.map(item => 
      `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showToast('Results exported successfully!', 'success');
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
  
  showToast('Ready for new search', 'success');
}

async function copyToClipboard(text, successMessage = 'Copied to clipboard') {
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
      showToast('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = 'background: none; border: none; font-size: 18px; cursor: pointer; margin-left: 15px; color: inherit;';
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
  const errorP = error.querySelector('p');
  errorP.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getErrorMessage(error) {
  const message = error.message || 'An unexpected error occurred';
  
  // Provide user-friendly error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Connection timeout. Please check your internet connection and try again.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Authentication error. Please refresh the page and try again.';
  }
  
  if (message.includes('500')) {
    return 'Server error. Please try again in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Your prompt contains invalid content. Please try a different description.';
  }
  
  // Return the original message if no specific case matches
  return message;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the prompt input
  document.getElementById('prompt').focus();
  
  // Add keyboard shortcut information
  console.log('Goblin Globe Domain Finder - Y2K Edition - Keyboard Shortcuts:');
  console.log('Ctrl+Enter: Generate domains');
  console.log('Ctrl+C: Copy available domains');
  console.log('Ctrl+S: Export results');
  console.log('Ctrl+R: New search');
});