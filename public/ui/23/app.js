// Zen DOM Elements
const zenForm = document.getElementById('zenGenerateForm');
const zenGenerateButton = document.getElementById('zenGenerateButton');
const zenButtonText = document.getElementById('zenButtonText');
const zenButtonSpinner = document.getElementById('zenButtonSpinner');
const zenLoading = document.getElementById('zenLoading');
const zenLoadingMessage = document.getElementById('zenLoadingMessage');
const zenProgressBar = document.getElementById('zenProgressBar');
const zenProgressFill = document.getElementById('zenProgressFill');
const zenProgressText = document.getElementById('zenProgressText');
const zenResults = document.getElementById('zenResults');
const zenError = document.getElementById('zenError');
const zenAvailableList = document.getElementById('zenAvailableList');
const zenTakenList = document.getElementById('zenTakenList');
const zenExportBtn = document.getElementById('zenExportBtn');
const zenCopyAllBtn = document.getElementById('zenCopyAllBtn');
const zenNewSearchBtn = document.getElementById('zenNewSearchBtn');
const zenToastContainer = document.getElementById('zenToastContainer');

// Global state with zen mindfulness
let zenCurrentResults = { available: [], taken: [] };
let zenCurrentSummary = {};

// Initialize zen event listeners
zenForm.addEventListener('submit', handleZenFormSubmit);
zenExportBtn.addEventListener('click', handleZenExport);
zenCopyAllBtn.addEventListener('click', handleZenCopyAll);
zenNewSearchBtn.addEventListener('click', handleZenNewSearch);

// Add zen keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'Enter':
        if (!zenGenerateButton.disabled) {
          zenForm.dispatchEvent(new Event('submit'));
        }
        break;
      case 'c':
        if (zenCurrentResults.available.length > 0) {
          e.preventDefault();
          handleZenCopyAll();
        }
        break;
      case 's':
        if (zenCurrentResults.available.length > 0) {
          e.preventDefault();
          handleZenExport();
        }
        break;
      case 'r':
        e.preventDefault();
        handleZenNewSearch();
        break;
    }
  }
});

// Add zen ripple effect to buttons
document.querySelectorAll('.zen-button, .zen-action-btn, .zen-copy-btn').forEach(button => {
  button.addEventListener('click', function(e) {
    // Create ripple element
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: zenRipple 0.6s ease-out;
      pointer-events: none;
    `;
    
    this.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);
  });
});

// Add zen ripple animation
const zenRippleStyle = document.createElement('style');
zenRippleStyle.textContent = `
  @keyframes zenRipple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(zenRippleStyle);

async function handleZenFormSubmit(e) {
  e.preventDefault();
  
  // Get form data with zen mindfulness
  const prompt = document.getElementById('zenPrompt').value.trim();
  const count = parseInt(document.getElementById('zenCount').value);
  const extensions = Array.from(document.querySelectorAll('input[name="zenExtensions"]:checked'))
    .map(cb => cb.value);
  
  // Zen validation
  if (!prompt) {
    showZenToast('Please enter your domain vision', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showZenToast('Please select at least one extension', 'error');
    return;
  }
  
  // Begin zen loading state
  setZenLoadingState(true);
  showZenProgressStep('Generating domain ideas with tranquil precision...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showZenProgressStep('Checking domain availability in the digital realm...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate domains');
    }
    
    // Complete zen progress
    showZenProgressStep('Harmonizing results with zen precision...', 3, 3, 90);
    
    // Brief meditation pause
    await new Promise(resolve => setTimeout(resolve, 800));
    showZenProgressStep('Discovery complete!', 3, 3, 100);
    
    // Store results with zen mindfulness
    zenCurrentResults = data.results;
    zenCurrentSummary = data.summary;
    
    displayZenResults(data.results, data.summary);
    showZenToast(`Discovered ${data.results.available.length} available domains with zen clarity!`, 'success');
    
  } catch (err) {
    console.error('Zen generation error:', err);
    showZenError(getZenErrorMessage(err));
    showZenToast('Domain generation encountered an obstacle', 'error');
  } finally {
    setZenLoadingState(false);
  }
}

function setZenLoadingState(isLoading) {
  zenGenerateButton.disabled = isLoading;
  
  if (isLoading) {
    zenButtonText.textContent = 'Discovering...';
    zenButtonSpinner.classList.remove('hidden');
    zenLoading.classList.remove('hidden');
    zenLoading.classList.add('show');
    zenResults.classList.add('hidden');
    zenResults.classList.remove('show');
    zenError.classList.add('hidden');
    zenProgressBar.classList.remove('hidden');
    zenProgressText.classList.remove('hidden');
  } else {
    zenButtonText.textContent = 'Discover Domains';
    zenButtonSpinner.classList.add('hidden');
    zenLoading.classList.add('hidden');
    zenLoading.classList.remove('show');
    zenProgressBar.classList.add('hidden');
    zenProgressText.classList.add('hidden');
  }
}

function showZenProgressStep(message, step, totalSteps, percentage) {
  zenLoadingMessage.textContent = message;
  zenProgressText.textContent = `Step ${step} of ${totalSteps}`;
  zenProgressFill.style.width = `${percentage}%`;
}

function displayZenResults(results, summary) {
  zenAvailableList.innerHTML = '';
  zenTakenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showZenError('No domains were discovered. Please try a different vision with renewed clarity.');
    return;
  }
  
  // Display available domains with zen animation
  results.available.forEach((item, index) => {
    const card = createZenDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    card.style.animationDelay = `${index * 0.1}s`;
    zenAvailableList.appendChild(card);
  });
  
  // Display taken domains with zen animation
  results.taken.forEach((item, index) => {
    const card = createZenDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    card.style.animationDelay = `${(results.available.length + index) * 0.1}s`;
    zenTakenList.appendChild(card);
  });
  
  // Show results with zen transition
  setTimeout(() => {
    zenResults.classList.remove('hidden');
    zenResults.classList.add('show');
    
    // Smooth scroll to results with zen timing
    setTimeout(() => {
      zenResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }, 200);
}

function createZenDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const card = document.createElement('div');
  card.className = `zen-domain-card ${isAvailable ? 'available' : 'taken'}`;
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.animation = 'zenCardAppear 0.6s ease-out forwards';
  
  // Domain name with zen styling
  const domainName = document.createElement('div');
  domainName.className = 'zen-domain-name';
  domainName.textContent = domain;
  
  // Meta information with zen clarity
  const metaDiv = document.createElement('div');
  metaDiv.className = 'zen-domain-meta';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'zen-domain-method';
  methodSpan.textContent = method;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'zen-domain-score';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'Harmonizing...';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Quality breakdown with zen detail
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.className = 'zen-domain-details';
    qualityDetails.innerHTML = `
      Length: ${qualityScore.breakdown.length}/100 • 
      Memory: ${qualityScore.breakdown.memorability}/100 • 
      Brand: ${qualityScore.breakdown.brandability}/100 • 
      Extension: ${qualityScore.breakdown.extension}/100 • 
      Relevance: ${qualityScore.breakdown.relevance}/100
    `;
  }
  
  // Actions with zen interaction
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'zen-domain-actions';
  
  // Zen copy button
  const zenCopyBtn = document.createElement('button');
  zenCopyBtn.className = 'zen-copy-btn';
  zenCopyBtn.textContent = 'Copy';
  zenCopyBtn.addEventListener('click', () => copyToZenClipboard(domain));
  
  actionsDiv.appendChild(zenCopyBtn);
  
  // Zen register link for available domains
  if (isAvailable) {
    const zenRegisterLink = document.createElement('a');
    zenRegisterLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    zenRegisterLink.target = '_blank';
    zenRegisterLink.className = 'zen-register-link';
    zenRegisterLink.textContent = 'Register';
    
    actionsDiv.appendChild(zenRegisterLink);
  }
  
  // Assemble zen card
  card.appendChild(domainName);
  card.appendChild(metaDiv);
  if (qualityDetails) {
    card.appendChild(qualityDetails);
  }
  card.appendChild(actionsDiv);
  
  return card;
}

// Add zen card animation
const zenCardStyle = document.createElement('style');
zenCardStyle.textContent = `
  @keyframes zenCardAppear {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(zenCardStyle);

function handleZenCopyAll() {
  if (zenCurrentResults.available.length === 0) {
    showZenToast('No available domains to copy with zen clarity', 'error');
    return;
  }
  
  const domains = zenCurrentResults.available.map(item => item.domain).join('\n');
  copyToZenClipboard(domains, `Copied ${zenCurrentResults.available.length} available domains with zen precision!`);
}

function handleZenExport() {
  if (zenCurrentResults.available.length === 0 && zenCurrentResults.taken.length === 0) {
    showZenToast('No results to export with zen mindfulness', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('zenPrompt').value;
  
  // Create zen CSV content
  const csvContent = [
    'Domain,Status,Quality Score,Quality Grade,Method,Registrar Link',
    ...zenCurrentResults.available.map(item => 
      `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...zenCurrentResults.taken.map(item => 
      `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
    )
  ].join('\n');
  
  // Create and download with zen flow
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `zen-goblin-globe-domains-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showZenToast('Results exported with zen clarity!', 'success');
}

function handleZenNewSearch() {
  // Clear zen form with mindfulness
  document.getElementById('zenPrompt').value = '';
  document.getElementById('zenCount').value = '10';
  
  // Reset zen checkboxes to default (.com only)
  document.querySelectorAll('input[name="zenExtensions"]').forEach(cb => {
    cb.checked = cb.value === '.com';
  });
  
  // Reset zen results
  zenCurrentResults = { available: [], taken: [] };
  zenResults.classList.add('hidden');
  zenResults.classList.remove('show');
  zenError.classList.add('hidden');
  
  // Focus with zen intention
  document.getElementById('zenPrompt').focus();
  
  // Scroll to beginning with zen flow
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showZenToast('Ready for new domain discovery with zen clarity', 'success');
}

async function copyToZenClipboard(text, successMessage = 'Copied to clipboard with zen precision') {
  try {
    await navigator.clipboard.writeText(text);
    showZenToast(successMessage, 'success');
  } catch (err) {
    // Zen fallback for older browsers
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
      showZenToast(successMessage, 'success');
    } catch (err) {
      showZenToast('Failed to copy to clipboard - zen flow interrupted', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showZenToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `zen-toast ${type}`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: none; 
    border: none; 
    font-size: 18px; 
    cursor: pointer; 
    margin-left: 15px;
    color: inherit;
    opacity: 0.7;
    transition: opacity 0.3s ease;
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
  zenToastContainer.appendChild(toast);
  
  // Trigger zen animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with zen timing
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 400);
  }, duration);
}

function showZenError(message) {
  const errorP = zenError.querySelector('p');
  errorP.textContent = message;
  zenError.classList.remove('hidden');
  zenResults.classList.add('hidden');
  zenResults.classList.remove('show');
}

function getZenErrorMessage(error) {
  const message = error.message || 'An unexpected disturbance in the zen flow occurred';
  
  // Provide zen-friendly error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests disturb the zen flow. Please pause, breathe, and try again with mindfulness.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Connection timeout disrupts zen harmony. Please check your internet connection and try again.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Authentication error breaks zen balance. Please refresh the page and try again with clarity.';
  }
  
  if (message.includes('500')) {
    return 'Server error disturbs the zen garden. Please try again with patience in a few moments.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Your domain vision contains disharmony. Please try a different description with zen clarity.';
  }
  
  // Return zen-enhanced message
  return `${message} - The zen path requires patience and understanding.`;
}

// Initialize zen garden on page load
document.addEventListener('DOMContentLoaded', () => {
  // Focus with zen intention
  document.getElementById('zenPrompt').focus();
  
  // Add zen keyboard shortcut information
  console.log('🏯 Zen Goblin Globe Domain Finder - Keyboard Harmony:');
  console.log('Ctrl+Enter: Discover domains with zen precision');
  console.log('Ctrl+C: Copy available domains with mindfulness');
  console.log('Ctrl+S: Export results with zen flow');
  console.log('Ctrl+R: Begin new search with clarity');
  
  // Add zen meditation reminder
  console.log('🧘 Remember: Domain discovery is a journey of mindful exploration');
});

// Add zen scroll effects
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const stones = document.querySelectorAll('.stone');
  const circles = document.querySelectorAll('.zen-circle');
  
  stones.forEach((stone, index) => {
    const speed = 0.5 + (index * 0.1);
    stone.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.01}deg)`;
  });
  
  circles.forEach((circle, index) => {
    const speed = 0.3 + (index * 0.05);
    circle.style.transform = `translateY(${scrolled * speed}px) scale(${1 + scrolled * 0.0001})`;
  });
});

// Add zen window resize handler
window.addEventListener('resize', () => {
  // Maintain zen harmony on different screen sizes
  const container = document.querySelector('.zen-container');
  if (window.innerWidth < 768) {
    container.style.padding = '40px 20px';
  } else {
    container.style.padding = '80px 40px';
  }
});