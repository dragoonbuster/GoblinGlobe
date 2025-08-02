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

// Art Deco loading messages
const artDecoMessages = [
    'Crafting domain masterpieces...',
    'Sculpting digital territories...',
    'Designing golden opportunities...',
    'Architecting web empires...',
    'Forging luxurious domains...',
    'Creating Art Deco excellence...'
];

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add keyboard shortcuts with Art Deco flair
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
  
  // Validation with Art Deco styling
  if (!prompt) {
    showArtDecoToast('Please share your domain vision', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showArtDecoToast('Please select at least one elegant extension', 'error');
    return;
  }
  
  // Start loading state with Art Deco flair
  setArtDecoLoadingState(true);
  showProgressStep('Conjuring domain ideas...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showProgressStep('Verifying domain availability...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate domains');
    }
    
    // Complete progress with elegance
    showProgressStep('Arranging your collection...', 3, 3, 90);
    
    // Brief delay to showcase completion
    await new Promise(resolve => setTimeout(resolve, 800));
    showProgressStep('Collection Complete!', 3, 3, 100);
    
    // Store results and display with Art Deco presentation
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayArtDecoResults(data.results, data.summary);
    showArtDecoToast(`Discovered ${data.results.available.length} exquisite domains!`, 'success');
    
  } catch (err) {
    console.error('Generation error:', err);
    showArtDecoError(getErrorMessage(err));
    showArtDecoToast('Failed to craft domain collection', 'error');
  } finally {
    setArtDecoLoadingState(false);
  }
}

function setArtDecoLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Crafting...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
    
    // Cycle through Art Deco loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (!loading.classList.contains('hidden')) {
        loadingMessage.textContent = artDecoMessages[messageIndex];
        messageIndex = (messageIndex + 1) % artDecoMessages.length;
      } else {
        clearInterval(messageInterval);
      }
    }, 2000);
    
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

function displayArtDecoResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showArtDecoError('No domains were crafted. Please refine your artistic vision.');
    return;
  }
  
  // Display available domains with Art Deco styling
  results.available.forEach((item, index) => {
    const card = createArtDecoCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    // Stagger the card animations
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      availableList.appendChild(card);
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, index * 100);
  });
  
  // Display taken domains with Art Deco styling
  results.taken.forEach((item, index) => {
    const card = createArtDecoCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    // Stagger the card animations
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      takenList.appendChild(card);
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, (index + results.available.length) * 100);
  });
  
  // Show results section with elegant reveal
  setTimeout(() => {
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

function createArtDecoCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const card = document.createElement('div');
  card.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Domain name with Art Deco styling
  const domainNameEl = document.createElement('div');
  domainNameEl.className = 'domain-name';
  domainNameEl.textContent = domain;
  
  // Meta information with gold styling
  const metaEl = document.createElement('div');
  metaEl.className = 'domain-meta';
  
  const methodEl = document.createElement('span');
  methodEl.className = 'domain-method';
  methodEl.textContent = method;
  
  const scoreEl = document.createElement('span');
  scoreEl.className = 'domain-score';
  if (qualityScore && qualityGrade) {
    scoreEl.textContent = `${qualityGrade.grade} • ${qualityScore.overall}/100`;
  } else {
    scoreEl.textContent = 'Evaluating...';
  }
  
  metaEl.appendChild(methodEl);
  metaEl.appendChild(scoreEl);
  
  // Copy button with Art Deco styling
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-secondary';
  copyBtn.style.cssText = 'padding: 8px 16px; font-size: 0.9rem; margin: 10px 0;';
  copyBtn.textContent = 'Copy ◆';
  copyBtn.addEventListener('click', () => copyToClipboard(domain, `${domain} copied with elegance!`));
  
  // Actions for available domains
  let actionsEl = null;
  if (isAvailable) {
    actionsEl = document.createElement('div');
    actionsEl.className = 'domain-actions';
    
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'Register Domain ◆';
    
    const checkOtherBtn = document.createElement('button');
    checkOtherBtn.className = 'btn-secondary';
    checkOtherBtn.textContent = 'Compare ◇';
    checkOtherBtn.title = 'Check this domain on other premium registrars';
    checkOtherBtn.addEventListener('click', () => {
      const baseDomain = domain.split('.')[0];
      const urls = [
        `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`,
        `https://www.domain.com/domains/search/?domain=${baseDomain}`,
        `https://domains.google.com/registrar/search?searchTerm=${domain}`
      ];
      urls.forEach(url => window.open(url, '_blank'));
      showArtDecoToast('Opening registrar comparison...', 'info');
    });
    
    actionsEl.appendChild(registerLink);
    actionsEl.appendChild(checkOtherBtn);
  }
  
  // Quality breakdown tooltip for premium domains
  if (qualityScore && qualityScore.overall >= 80) {
    const premiumBadge = document.createElement('div');
    premiumBadge.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(45deg, #D4AF37, #F4E98C);
      color: #000;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 0 2px 8px rgba(212,175,55,0.3);
    `;
    premiumBadge.textContent = 'Premium ◆';
    card.style.position = 'relative';
    card.appendChild(premiumBadge);
  }
  
  // Assemble the card
  card.appendChild(domainNameEl);
  card.appendChild(metaEl);
  card.appendChild(copyBtn);
  if (actionsEl) {
    card.appendChild(actionsEl);
  }
  
  return card;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showArtDecoToast('No available domains in your collection', 'warning');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `${currentResults.available.length} domains copied with artistic precision!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showArtDecoToast('No collection to export', 'warning');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create CSV with Art Deco header
  const csvContent = [
    '# Goblin Globe Domain Collection - Art Deco Edition',
    '# Generated with elegance and precision',
    'Domain,Status,Quality Score,Quality Grade,Method,Premium Registrar',
    ...currentResults.available.map(item => 
      `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
    )
  ].join('\n');
  
  // Create and download file with elegant naming
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-collection-${timestamp}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showArtDecoToast('Collection exported with Art Deco elegance!', 'success');
}

function handleNewSearch() {
  // Clear form with artistic transition
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset results with fade effect
  currentResults = { available: [], taken: [] };
  results.style.transition = 'opacity 0.5s ease';
  results.style.opacity = '0';
  
  setTimeout(() => {
    results.classList.add('hidden');
    results.style.opacity = '1';
    error.classList.add('hidden');
  }, 500);
  
  // Focus with elegance
  document.getElementById('prompt').focus();
  
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showArtDecoToast('Ready for your next artistic vision!', 'info');
}

async function copyToClipboard(text, successMessage = 'Copied with Art Deco precision!') {
  try {
    await navigator.clipboard.writeText(text);
    showArtDecoToast(successMessage, 'success');
  } catch (err) {
    // Elegant fallback for older browsers
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
      showArtDecoToast(successMessage, 'success');
    } catch (err) {
      showArtDecoToast('Failed to copy - please try again', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showArtDecoToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '◆',
    error: '◇',
    warning: '△',
    info: '◊'
  };
  
  const colors = {
    success: '#D4AF37',
    error: '#CC0000',
    warning: '#FF8C00',
    info: '#4682B4'
  };
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="font-size: 1.5rem; color: ${colors[type]};">${icons[type]}</span>
      <span style="flex: 1; font-weight: 600;">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;">✕</button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Elegant entrance animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with grace
  setTimeout(() => {
    toast.style.transition = 'all 0.5s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%) scale(0.9)';
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 500);
  }, duration);
}

function showArtDecoError(message) {
  error.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="font-size: 2rem; color: #D4AF37;">◇</span>
      <div>
        <h3 style="margin-bottom: 10px; color: #000;">Domain Creation Issue</h3>
        <p style="margin: 0; font-size: 1.1rem;">${message}</p>
      </div>
    </div>
  `;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getErrorMessage(error) {
  const message = error.message || 'An unexpected error occurred';
  
  // Art Deco styled error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests at once. Please allow a moment for the system to breathe.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Connection timeout detected. Please verify your connection and retry.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Authentication required. Please refresh and try again.';
  }
  
  if (message.includes('500')) {
    return 'Server experiencing difficulties. Please retry in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Your domain vision needs refinement. Please try a different approach.';
  }
  
  return message;
}

// Add Art Deco enhancement effects
document.addEventListener('DOMContentLoaded', () => {
  // Add elegant form enhancements
  const inputs = document.querySelectorAll('.form-input, .form-textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
      this.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
  });
  
  // Add keyboard shortcut hints with Art Deco styling
  const form = document.getElementById('generateForm');
  const helpText = document.createElement('div');
  helpText.style.cssText = `
    margin-top: 30px;
    text-align: center;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
    letter-spacing: 0.05em;
  `;
  helpText.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
      <span style="color: #D4AF37;">◆</span>
      <strong>Keyboard Shortcuts</strong>
      <span style="color: #D4AF37;">◆</span>
    </div>
    Ctrl+Enter (Generate) • Ctrl+C (Copy) • Ctrl+S (Export) • Ctrl+R (New Search)
  `;
  form.appendChild(helpText);
  
  // Add subtle parallax effect to the background
  let ticking = false;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.art-deco-container');
    const speed = scrolled * 0.1;
    
    parallax.style.transform = `translateY(${speed}px)`;
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick);
});