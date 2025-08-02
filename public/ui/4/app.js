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

// Add vaporwave keyboard shortcuts with aesthetic sound effects
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'Enter':
        if (!generateButton.disabled) {
          playAestheticSound('activate');
          form.dispatchEvent(new Event('submit'));
        }
        break;
      case 'c':
        if (currentResults.available.length > 0) {
          e.preventDefault();
          playAestheticSound('copy');
          handleCopyAll();
        }
        break;
      case 's':
        if (currentResults.available.length > 0) {
          e.preventDefault();
          playAestheticSound('save');
          handleExport();
        }
        break;
      case 'r':
        e.preventDefault();
        playAestheticSound('reset');
        handleNewSearch();
        break;
    }
  }
});

// Aesthetic sound effects (using Web Audio API)
function playAestheticSound(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different retro sounds for different actions
    switch (type) {
      case 'activate':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        break;
      case 'copy':
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.1);
        break;
      case 'save':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.15);
        break;
      case 'reset':
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1047, audioContext.currentTime + 0.2);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (err) {
    // Silently fail if Web Audio API is not supported
    console.log('Audio not supported or user gesture required');
  }
}

// Add glitch effect to elements
function addGlitchEffect(element) {
  element.classList.add('glitch');
  element.setAttribute('data-text', element.textContent);
  
  setTimeout(() => {
    element.classList.remove('glitch');
  }, 2000);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Validation with aesthetic feedback
  if (!prompt) {
    playAestheticSound('error');
    showToast('Please enter a domain description', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    playAestheticSound('error');
    showToast('Please select at least one extension', 'error');
    return;
  }
  
  // Aesthetic activation sound
  playAestheticSound('activate');
  
  // Start loading state with vaporwave flair
  setLoadingState(true);
  showProgressStep('Initializing neural networks...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showProgressStep('Scanning the digital realm...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate domains');
    }
    
    // Complete progress with style
    showProgressStep('Synthesizing results...', 3, 3, 90);
    
    // Brief delay for aesthetic effect
    await new Promise(resolve => setTimeout(resolve, 800));
    showProgressStep('Complete! Welcome to the future.', 3, 3, 100);
    
    // Store results and display
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    playAestheticSound('success');
    showToast(`Found ${data.results.available.length} available domains in the matrix!`, 'success');
    
  } catch (err) {
    console.error('Generation error:', err);
    playAestheticSound('error');
    showError(getErrorMessage(err));
    showToast('System error encountered', 'error');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Processing...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
    
    // Add glitch effect to loading message
    setTimeout(() => {
      if (loadingMessage) {
        addGlitchEffect(loadingMessage);
      }
    }, 500);
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
  
  // Add some aesthetic flair to progress updates
  if (percentage === 100) {
    setTimeout(() => {
      addGlitchEffect(loadingMessage);
    }, 200);
  }
}

function displayResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showError('No domains materialized. Try adjusting your search parameters.');
    return;
  }
  
  // Display available domains with staggered animation
  results.available.forEach((item, index) => {
    const div = createDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    availableList.appendChild(div);
    
    // Staggered fade-in animation
    setTimeout(() => {
      div.style.transition = 'all 0.5s ease';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Display taken domains with staggered animation
  results.taken.forEach((item, index) => {
    const div = createDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    takenList.appendChild(div);
    
    // Staggered fade-in animation
    setTimeout(() => {
      div.style.transition = 'all 0.5s ease';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    }, (results.available.length + index) * 100);
  });
  
  // Show results section with fade-in
  results.style.opacity = '0';
  results.classList.remove('hidden');
  setTimeout(() => {
    results.style.transition = 'opacity 0.5s ease';
    results.style.opacity = '1';
  }, 100);
  
  // Smooth scroll to results
  setTimeout(() => {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

function createDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const div = document.createElement('div');
  div.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Domain name with cyber styling
  const domainName = document.createElement('div');
  domainName.className = 'domain-name';
  domainName.textContent = domain;
  
  // Meta information with retro styling
  const metaDiv = document.createElement('div');
  metaDiv.className = 'domain-meta';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'domain-method';
  methodSpan.textContent = method.toUpperCase();
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade} ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'N/A';
  }
  
  metaDiv.appendChild(methodSpan);
  metaDiv.appendChild(scoreSpan);
  
  // Quality breakdown with cyber styling
  let qualityDetails = null;
  if (qualityScore && qualityScore.breakdown) {
    qualityDetails = document.createElement('div');
    qualityDetails.style.cssText = 'font-size: 10px; margin: 10px 0; font-family: "Inconsolata", monospace; color: #000080;';
    qualityDetails.innerHTML = `
      LEN: ${qualityScore.breakdown.length}/100 • 
      MEM: ${qualityScore.breakdown.memorability}/100 • 
      BRD: ${qualityScore.breakdown.brandability}/100 • 
      EXT: ${qualityScore.breakdown.extension}/100 • 
      REL: ${qualityScore.breakdown.relevance}/100
    `;
  }
  
  // Actions with retro button styling
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'domain-actions';
  
  // Copy button with sound effect
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-secondary';
  copyBtn.textContent = 'COPY';
  copyBtn.addEventListener('click', () => {
    playAestheticSound('copy');
    copyToClipboard(domain);
    // Add visual feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'COPIED!';
    copyBtn.style.background = 'linear-gradient(135deg, #00ff00 0%, #008000 100%)';
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 1000);
  });
  
  actionsDiv.appendChild(copyBtn);
  
  // Register link for available domains
  if (isAvailable) {
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'REGISTER';
    
    registerLink.addEventListener('click', () => {
      playAestheticSound('activate');
    });
    
    actionsDiv.appendChild(registerLink);
  }
  
  // Assemble the card
  div.appendChild(domainName);
  div.appendChild(metaDiv);
  if (qualityDetails) {
    div.appendChild(qualityDetails);
  }
  div.appendChild(actionsDiv);
  
  // Add hover sound effect
  div.addEventListener('mouseenter', () => {
    // Subtle hover sound (very quiet)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      // Silently fail
    }
  });
  
  return div;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    playAestheticSound('error');
    showToast('No available domains in memory', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  playAestheticSound('copy');
  copyToClipboard(domains, `Copied ${currentResults.available.length} available domains to clipboard!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    playAestheticSound('error');
    showToast('No data to export', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create CSV content with aesthetic header
  const csvContent = [
    '# GOBLIN GLOBE - AESTHETIC DOMAIN EXPORT',
    '# Generated on: ' + new Date().toISOString(),
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
  a.download = `goblin-globe-aesthetic-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  playAestheticSound('save');
  showToast('Data exported to the mainframe!', 'success');
}

function handleNewSearch() {
  // Clear form with animation
  const promptField = document.getElementById('prompt');
  const countField = document.getElementById('count');
  
  promptField.style.transition = 'opacity 0.3s ease';
  promptField.style.opacity = '0.5';
  
  setTimeout(() => {
    promptField.value = '';
    countField.value = '10';
    
    // Reset checkboxes to default (.com only)
    document.querySelectorAll('input[name="extensions"]').forEach(cb => {
      cb.checked = cb.value === '.com';
    });
    
    // Reset results
    currentResults = { available: [], taken: [] };
    results.classList.add('hidden');
    error.classList.add('hidden');
    
    promptField.style.opacity = '1';
    promptField.focus();
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    playAestheticSound('reset');
    showToast('System reset - Ready for new search', 'success');
  }, 300);
}

async function copyToClipboard(text, successMessage = 'Data copied to clipboard') {
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
      showToast('Clipboard access denied', 'error');
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
  closeBtn.style.cssText = 'background: none; border: none; font-size: 16px; cursor: pointer; margin-left: 10px; color: inherit;';
  closeBtn.addEventListener('click', () => {
    playAestheticSound('copy'); // Subtle click sound
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
  
  // Auto remove with fade out
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
  
  // Add glitch effect to error message
  setTimeout(() => {
    addGlitchEffect(errorP);
  }, 100);
}

function getErrorMessage(error) {
  const message = error.message || 'An unexpected system error occurred';
  
  // Provide aesthetic error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Rate limiter activated. Please wait before accessing the mainframe again.';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Connection to the digital realm lost. Check your network link.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Access denied. Please refresh and authenticate again.';
  }
  
  if (message.includes('500')) {
    return 'Server malfunction detected. Please try again momentarily.';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Invalid input detected. Please modify your search parameters.';
  }
  
  // Return aesthetic version of original message
  return `System error: ${message}`;
}

// Aesthetic initialization effects
document.addEventListener('DOMContentLoaded', () => {
  // Focus on the prompt input
  const promptField = document.getElementById('prompt');
  promptField.focus();
  
  // Add startup sound effect
  setTimeout(() => {
    playAestheticSound('activate');
  }, 500);
  
  // Add glitch effect to title on load
  setTimeout(() => {
    const japaneseTitle = document.querySelector('.japanese-title');
    if (japaneseTitle) {
      addGlitchEffect(japaneseTitle);
    }
  }, 1000);
  
  // Console aesthetic
  console.log('╔══════════════════════════════════════╗');
  console.log('║  ゴブリングローブ GOBLIN GLOBE        ║');
  console.log('║  AESTHETIC DOMAIN FINDER v2.0        ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  console.log('Keyboard Shortcuts:');
  console.log('Ctrl+Enter: Generate domains');
  console.log('Ctrl+C: Copy available domains');
  console.log('Ctrl+S: Export results');
  console.log('Ctrl+R: New search');
  console.log('');
  console.log('Welcome to the aesthetic realm...');
  
  // Add periodic background effects
  setInterval(() => {
    // Randomly add subtle visual effects
    if (Math.random() < 0.1) { // 10% chance every interval
      const cards = document.querySelectorAll('.domain-card');
      if (cards.length > 0) {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        randomCard.style.transition = 'box-shadow 0.5s ease';
        randomCard.style.boxShadow = '0 4px 20px rgba(255, 0, 255, 0.4)';
        setTimeout(() => {
          randomCard.style.boxShadow = '';
        }, 2000);
      }
    }
  }, 5000);
});

// Add window button functionality for aesthetic purposes
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('window-button')) {
    playAestheticSound('copy');
    e.target.style.border = '1px inset #c0c0c0';
    setTimeout(() => {
      e.target.style.border = '1px outset #c0c0c0';
    }, 100);
  }
});