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
    buttonText.textContent = 'Generate & Check Availability';
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
  div.className = `p-4 rounded-lg border transition-all hover:shadow-md ${
    isAvailable 
      ? 'bg-green-50 border-green-300 hover:bg-green-100' 
      : 'bg-red-50 border-red-300 hover:bg-red-100'
  }`;
  
  // Domain name and copy button row
  const domainRow = document.createElement('div');
  domainRow.className = 'flex items-center justify-between mb-2';
  
  const domainInfo = document.createElement('div');
  domainInfo.className = 'flex items-center gap-2';
  
  const domainSpan = document.createElement('span');
  domainSpan.className = 'font-mono text-lg font-semibold';
  domainSpan.textContent = domain;
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded';
  methodSpan.textContent = method;
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors';
  copyBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>
  `;
  copyBtn.title = 'Copy domain name';
  copyBtn.addEventListener('click', () => copyToClipboard(domain));
  
  domainInfo.appendChild(domainSpan);
  domainInfo.appendChild(methodSpan);
  domainRow.appendChild(domainInfo);
  domainRow.appendChild(copyBtn);
  div.appendChild(domainRow);
  
  // Quality score row
  if (qualityScore && qualityGrade) {
    const qualityRow = document.createElement('div');
    qualityRow.className = 'flex items-center justify-between mb-2';
    
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'flex items-center gap-2';
    
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `px-2 py-1 rounded text-xs font-bold text-white bg-${qualityGrade.color}-500`;
    gradeBadge.textContent = qualityGrade.grade;
    
    const scoreText = document.createElement('span');
    scoreText.className = 'text-sm font-medium text-gray-700';
    scoreText.textContent = `${qualityScore.overall}/100`;
    
    const descText = document.createElement('span');
    descText.className = 'text-xs text-gray-500';
    descText.textContent = qualityGrade.description;
    
    scoreDiv.appendChild(gradeBadge);
    scoreDiv.appendChild(scoreText);
    scoreDiv.appendChild(descText);
    qualityRow.appendChild(scoreDiv);
    
    // Quality breakdown tooltip button
    const infoBtn = document.createElement('button');
    infoBtn.className = 'text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors';
    infoBtn.innerHTML = '📊';
    infoBtn.title = `Quality Breakdown:\nLength: ${qualityScore.breakdown.length}/100\nMemorability: ${qualityScore.breakdown.memorability}/100\nBrandability: ${qualityScore.breakdown.brandability}/100\nExtension: ${qualityScore.breakdown.extension}/100\nRelevance: ${qualityScore.breakdown.relevance}/100`;
    qualityRow.appendChild(infoBtn);
    
    div.appendChild(qualityRow);
  }
  
  // Action row
  if (isAvailable) {
    const actionRow = document.createElement('div');
    actionRow.className = 'flex gap-2';
    
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors';
    registerLink.textContent = 'Register →';
    
    const checkOtherBtn = document.createElement('button');
    checkOtherBtn.className = 'bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors';
    checkOtherBtn.textContent = 'Check Others';
    checkOtherBtn.title = 'Check this domain on other registrars';
    checkOtherBtn.addEventListener('click', () => {
      const baseDomain = domain.split('.')[0];
      const urls = [
        `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`,
        `https://www.domain.com/domains/search/?domain=${baseDomain}`,
        `https://domains.google.com/registrar/search?searchTerm=${domain}`
      ];
      urls.forEach(url => window.open(url, '_blank'));
    });
    
    actionRow.appendChild(registerLink);
    actionRow.appendChild(checkOtherBtn);
    div.appendChild(actionRow);
  }
  
  return div;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showToast('No available domains to copy', 'warning');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `Copied ${currentResults.available.length} available domains!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showToast('No results to export', 'warning');
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
  a.download = `domain-search-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
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
  
  // Reset results
  currentResults = { available: [], taken: [] };
  results.classList.add('hidden');
  error.classList.add('hidden');
  
  // Focus on prompt input
  document.getElementById('prompt').focus();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showToast('Ready for new search!', 'info');
}

async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
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
  toast.className = `
    transform transition-all duration-300 ease-in-out
    bg-white border-l-4 p-4 rounded-r shadow-lg max-w-sm
    ${type === 'success' ? 'border-green-500 text-green-800' : ''}
    ${type === 'error' ? 'border-red-500 text-red-800' : ''}
    ${type === 'warning' ? 'border-yellow-500 text-yellow-800' : ''}
    ${type === 'info' ? 'border-blue-500 text-blue-800' : ''}
    opacity-0 translate-x-full
  `;
  
  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[type];
  
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-lg">${icon}</span>
      <span class="flex-1">${message}</span>
      <button class="text-gray-400 hover:text-gray-600 ml-2" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-x-full');
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, duration);
}

function showError(message) {
  error.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
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

// Initialize tooltips and help text
document.addEventListener('DOMContentLoaded', () => {
  // Add keyboard shortcut hints
  const form = document.getElementById('generateForm');
  const helpText = document.createElement('div');
  helpText.className = 'mt-2 text-xs text-gray-500 text-center';
  helpText.innerHTML = `
    💡 <strong>Keyboard shortcuts:</strong> 
    Ctrl+Enter (Generate) • Ctrl+C (Copy Available) • Ctrl+S (Export) • Ctrl+R (New Search)
  `;
  form.appendChild(helpText);
});