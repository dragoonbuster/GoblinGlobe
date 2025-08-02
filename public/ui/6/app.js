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

// Memphis Milano Fun Messages
const loadingMessages = [
    'Cooking Up Domains...',
    'Mixing Colors & Ideas...',
    'Adding Geometric Magic...',
    'Squiggling Through Options...',
    'Dotting the I\'s...',
    'Triangle Power Activated!',
    'Memphis Style Loading...'
];

const successMessages = [
    'Boom! Found your domains!',
    'Memphis magic worked!',
    'Geometric genius strikes!',
    'Color explosion complete!',
    'Domain party ready!'
];

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add keyboard shortcuts with Memphis flair
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

// Fun random background shape generator
function addRandomShape() {
    const shapes = ['circle', 'triangle', 'square', 'zigzag', 'dots', 'squiggle'];
    const colors = ['var(--pink)', 'var(--yellow)', 'var(--turquoise)', 'var(--purple)', 'var(--orange)', 'var(--cyan)'];
    
    const shape = document.createElement('div');
    shape.className = 'shape ' + shapes[Math.floor(Math.random() * shapes.length)];
    shape.style.background = colors[Math.floor(Math.random() * colors.length)];
    shape.style.top = Math.random() * 100 + '%';
    shape.style.left = Math.random() * 100 + '%';
    shape.style.animationDelay = '-' + Math.random() * 6 + 's';
    
    document.querySelector('.bg-shapes').appendChild(shape);
    
    // Remove after animation
    setTimeout(() => {
        if (shape.parentNode) {
            shape.parentNode.removeChild(shape);
        }
    }, 12000);
}

// Add random shapes periodically
setInterval(addRandomShape, 3000);

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Validation with Memphis flair
  if (!prompt) {
    showToast('Hey! Tell us your domain dream first! 🌈', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showToast('Pick at least one extension, superstar! ⭐', 'error');
    return;
  }
  
  // Start loading state with random message
  setLoadingState(true);
  const randomLoadingMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  showProgressStep(randomLoadingMsg, 1, 3, 10);
  
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
    showProgressStep('Adding Memphis magic...', 3, 3, 90);
    
    // Brief delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500));
    showProgressStep('Complete!', 3, 3, 100);
    
    // Store results and display
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    
    const randomSuccessMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
    showToast(`${randomSuccessMsg} Found ${data.results.available.length} available domains!`, 'success');
    
    // Add celebration shapes
    for (let i = 0; i < 5; i++) {
        setTimeout(() => addRandomShape(), i * 200);
    }
    
  } catch (err) {
    console.error('Generation error:', err);
    showError(getErrorMessage(err));
    showToast('Oops! Memphis magic failed this time 💥', 'error');
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Generating Magic...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
    
    // Add spinning animation to button
    generateButton.style.animation = 'spin 2s linear infinite';
  } else {
    buttonText.textContent = 'Generate Magic!';
    buttonSpinner.classList.add('hidden');
    loading.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressText.classList.add('hidden');
    
    // Remove spinning animation
    generateButton.style.animation = '';
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
    showError('No domains were generated. Try a different magical prompt! ✨');
    return;
  }
  
  // Display available domains with Memphis flair
  results.available.forEach((item, index) => {
    const div = createMemphisDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade, index);
    availableList.appendChild(div);
  });
  
  // Display taken domains
  results.taken.forEach((item, index) => {
    const div = createMemphisDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade, index);
    takenList.appendChild(div);
  });
  
  // Show results section with stagger animation
  results.classList.remove('hidden');
  
  // Animate cards in
  const cards = document.querySelectorAll('.domain-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) rotate(5deg)';
    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) rotate(0deg)';
    }, index * 100);
  });
  
  // Scroll to results
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createMemphisDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null, index = 0) {
  const div = document.createElement('div');
  const rotations = ['-1deg', '1deg', '0deg', '2deg', '-2deg'];
  const randomRotation = rotations[index % rotations.length];
  
  div.className = `domain-card ${isAvailable ? 'available' : 'taken'} wiggle`;
  div.style.transform = `rotate(${randomRotation})`;
  
  // Domain name with Memphis styling
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
    scoreSpan.textContent = `${qualityGrade.grade} (${qualityScore.overall}/100)`;
  }
  
  metaDiv.appendChild(methodSpan);
  if (qualityScore && qualityGrade) {
    metaDiv.appendChild(scoreSpan);
  }
  
  div.appendChild(domainName);
  div.appendChild(metaDiv);
  
  // Add copy button with Memphis style
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-secondary';
  copyBtn.textContent = 'Copy!';
  copyBtn.style.fontSize = '0.8rem';
  copyBtn.style.padding = '8px 15px';
  copyBtn.addEventListener('click', () => {
    copyToClipboard(domain, `Copied ${domain} to your clipboard! 📋`);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy!';
    }, 1000);
  });
  
  // Action buttons for available domains
  if (isAvailable) {
    const actionRow = document.createElement('div');
    actionRow.className = 'domain-actions';
    
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'Register Now!';
    
    actionRow.appendChild(registerLink);
    actionRow.appendChild(copyBtn);
    div.appendChild(actionRow);
  } else {
    div.appendChild(copyBtn);
  }
  
  return div;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showToast('No available domains to copy, buddy! 🤷‍♂️', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `Copied all ${currentResults.available.length} available domains! Party time! 🎉`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showToast('Nothing to export yet, champ! 📄', 'error');
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
  
  showToast('Memphis magic exported successfully! 📊✨', 'success');
}

function handleNewSearch() {
  // Clear form
  document.getElementById('prompt').value = '';
  document.getElementById('count').value = '10';
  
  // Reset results
  currentResults = { available: [], taken: [] };
  results.classList.add('hidden');
  error.classList.add('hidden');
  
  // Focus on prompt input with fun effect
  const promptInput = document.getElementById('prompt');
  promptInput.focus();
  promptInput.style.background = 'var(--cyan)';
  setTimeout(() => {
    promptInput.style.background = 'var(--yellow)';
  }, 200);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showToast('Ready for another Memphis adventure! 🚀', 'success');
  
  // Add some celebration shapes
  for (let i = 0; i < 3; i++) {
    setTimeout(() => addRandomShape(), i * 300);
  }
}

async function copyToClipboard(text, successMessage = 'Copied to clipboard! 📋') {
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
      showToast('Failed to copy - clipboard gremlins! 👾', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '🎉',
    error: '💥',
    warning: '⚠️',
    info: '💫'
  };
  
  const icon = icons[type] || '💫';
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.2rem;">${icon}</span>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Show animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove with animation
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
  error.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="font-size: 2rem;">💥</span>
      <span>${message}</span>
    </div>
  `;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getErrorMessage(error) {
  const message = error.message || 'An unexpected error occurred';
  
  // Memphis-style error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Whoa there, speed racer! Too many requests. Chill for a moment! 🛑';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Connection timeout! Check your internet magic! 🌐';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Authentication error! Refresh the page and let\'s try again! 🔄';
  }
  
  if (message.includes('500')) {
    return 'Server hiccup! Give us a moment to fix the Memphis machine! ⚙️';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Your prompt needs more Memphis magic! Try a different description! ✨';
  }
  
  return `Oops! ${message} 🤖`;
}

// Fun initialization effects
document.addEventListener('DOMContentLoaded', () => {
  // Add some initial random shapes
  for (let i = 0; i < 3; i++) {
    setTimeout(() => addRandomShape(), i * 1000);
  }
  
  // Add keyboard shortcut hints with Memphis flair
  const form = document.getElementById('generateForm');
  const helpText = document.createElement('div');
  helpText.style.cssText = `
    margin-top: 20px;
    font-size: 0.8rem;
    color: var(--black);
    text-align: center;
    background: var(--white);
    padding: 10px 15px;
    border: 2px solid var(--black);
    border-radius: 15px;
    font-weight: 700;
  `;
  helpText.innerHTML = `
    🎨 <strong>Memphis Shortcuts:</strong> 
    Ctrl+Enter (Generate) • Ctrl+C (Copy All) • Ctrl+S (Export) • Ctrl+R (New Search)
  `;
  form.appendChild(helpText);
  
  // Add welcome animation to title
  const title = document.querySelector('.main-title');
  title.style.transform = 'scale(0) rotate(-45deg)';
  setTimeout(() => {
    title.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    title.style.transform = 'scale(1) rotate(-2deg)';
  }, 500);
});

// Add some interactive fun to checkboxes
document.querySelectorAll('.checkbox-item').forEach(item => {
  item.addEventListener('click', () => {
    // Add temporary scale effect
    item.style.transform = 'scale(1.2) rotate(5deg)';
    setTimeout(() => {
      item.style.transform = '';
    }, 200);
  });
});

// Add hover effects to buttons
document.querySelectorAll('button, .link-register').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    if (!btn.disabled) {
      addRandomShape();
    }
  });
});