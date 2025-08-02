// DOM Elements
const form = document.getElementById('generateForm');
const generateButton = document.getElementById('generateButton');
const buttonText = document.getElementById('buttonText');
const loading = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const results = document.getElementById('results');
const error = document.getElementById('error');
const availableList = document.getElementById('availableList');
const takenList = document.getElementById('takenList');
const availableSection = document.getElementById('availableSection');
const takenSection = document.getElementById('takenSection');
const resultsCount = document.getElementById('resultsCount');
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
  
  try {
    // Step 1: Generate domains
    loadingMessage.textContent = 'Generating domain ideas...';
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    // Step 2: Check availability
    loadingMessage.textContent = 'Checking domain availability...';
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate domains');
    }
    
    // Step 3: Complete
    loadingMessage.textContent = 'Analyzing results...';
    
    // Brief delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store results and display
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    showToast(`Found ${data.results.available.length} available domains`, 'success');
    
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
    loading.classList.add('visible');
    results.classList.remove('visible');
    error.classList.remove('visible');
  } else {
    buttonText.textContent = 'Generate Domains';
    loading.classList.remove('visible');
  }
}

function displayResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showError('No domains were generated. Please try a different prompt.');
    return;
  }
  
  // Update results count
  const totalCount = results.available.length + results.taken.length;
  resultsCount.textContent = `Found ${totalCount} domains (${results.available.length} available)`;
  
  // Display available domains
  results.available.forEach(item => {
    const card = createDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    availableList.appendChild(card);
  });
  
  // Display taken domains
  results.taken.forEach(item => {
    const card = createDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    takenList.appendChild(card);
  });
  
  // Show/hide sections based on content
  availableSection.style.display = results.available.length > 0 ? 'block' : 'none';
  takenSection.style.display = results.taken.length > 0 ? 'block' : 'none';
  
  // Show results section
  results.classList.add('visible');
  
  // Scroll to results
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const card = document.createElement('div');
  card.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-button';
  copyBtn.innerHTML = '📋';
  copyBtn.title = 'Copy domain name';
  copyBtn.addEventListener('click', () => copyToClipboard(domain));
  
  // Domain name
  const domainName = document.createElement('div');
  domainName.className = 'domain-name';
  domainName.textContent = domain;
  
  // Meta information
  const meta = document.createElement('div');
  meta.className = 'domain-meta';
  
  const methodTag = document.createElement('span');
  methodTag.className = 'domain-method';
  methodTag.textContent = method;
  
  const score = document.createElement('span');
  score.className = 'domain-score';
  if (qualityScore && qualityGrade) {
    score.textContent = `${qualityScore.overall}/100 (${qualityGrade.grade})`;
  }
  
  meta.appendChild(methodTag);
  meta.appendChild(score);
  
  // Actions
  const actions = document.createElement('div');
  actions.className = 'domain-actions';
  
  if (isAvailable) {
    const registerBtn = document.createElement('a');
    registerBtn.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerBtn.target = '_blank';
    registerBtn.className = 'domain-button primary';
    registerBtn.textContent = 'Register';
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'domain-button';
    checkBtn.textContent = 'Check Others';
    checkBtn.addEventListener('click', () => {
      const baseDomain = domain.split('.')[0];
      const urls = [
        `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`,
        `https://www.domain.com/domains/search/?domain=${baseDomain}`,
        `https://domains.google.com/registrar/search?searchTerm=${domain}`
      ];
      urls.forEach(url => window.open(url, '_blank'));
    });
    
    actions.appendChild(registerBtn);
    actions.appendChild(checkBtn);
  }
  
  // Assemble card
  card.appendChild(copyBtn);
  card.appendChild(domainName);
  card.appendChild(meta);
  if (actions.children.length > 0) {
    card.appendChild(actions);
  }
  
  return card;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showToast('No available domains to copy', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `Copied ${currentResults.available.length} available domains`);
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
  a.download = `goblin-globe-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showToast('Results exported successfully', 'success');
}

function handleNewSearch() {
  // Clear form
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset results
  currentResults = { available: [], taken: [] };
  results.classList.remove('visible');
  error.classList.remove('visible');
  
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

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, duration);
}

function showError(message) {
  error.textContent = message;
  error.classList.add('visible');
  results.classList.remove('visible');
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

// Initialize focus on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prompt').focus();
});