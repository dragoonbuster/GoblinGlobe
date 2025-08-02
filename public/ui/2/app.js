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

// Cyberpunk loading messages
const loadingMessages = [
  'Initializing neural networks...',
  'Scanning domain matrix...',
  'Penetrating DNS barriers...',
  'Analyzing quantum domains...',
  'Decrypting availability data...',
  'Accessing the mainframe...',
  'Infiltrating domain registries...',
  'Running cybersecurity protocols...',
  'Processing data streams...',
  'Compiling results...'
];

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add keyboard shortcuts with cyberpunk flavor
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

// Cyberpunk loading animation controller
let loadingMessageInterval;

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Validation
  if (!prompt) {
    showToast('Neural input required - enter domain parameters', 'error');
    return;
  }
  
  if (extensions.length === 0) {
    showToast('Protocol extension selection required', 'error');
    return;
  }
  
  // Start loading state with cyberpunk effects
  setLoadingState(true);
  startCyberpunkLoadingAnimation();
  showProgressStep('Initializing domain scan...', 1, 3, 10);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showProgressStep('Analyzing domain matrix...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `System error ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Domain generation protocol failed');
    }
    
    // Complete progress with cyberpunk flair
    showProgressStep('Compiling scan results...', 3, 3, 90);
    
    // Brief delay to show completion
    await new Promise(resolve => setTimeout(resolve, 800));
    showProgressStep('Scan complete!', 3, 3, 100);
    
    // Store results and display
    currentResults = data.results;
    currentSummary = data.summary;
    
    displayResults(data.results, data.summary);
    showToast(`Scan complete: ${data.results.available.length} available domains detected!`, 'success');
    
  } catch (err) {
    console.error('System error:', err);
    showError(getCyberpunkErrorMessage(err));
    showToast('Domain scan failed - system compromised', 'error');
  } finally {
    setLoadingState(false);
    stopCyberpunkLoadingAnimation();
  }
}

function startCyberpunkLoadingAnimation() {
  let messageIndex = 0;
  loadingMessageInterval = setInterval(() => {
    loadingMessage.textContent = loadingMessages[messageIndex];
    messageIndex = (messageIndex + 1) % loadingMessages.length;
  }, 1200);
}

function stopCyberpunkLoadingAnimation() {
  if (loadingMessageInterval) {
    clearInterval(loadingMessageInterval);
    loadingMessageInterval = null;
  }
}

function setLoadingState(isLoading) {
  generateButton.disabled = isLoading;
  
  if (isLoading) {
    buttonText.textContent = 'Scanning...';
    buttonSpinner.classList.remove('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressBar.classList.remove('hidden');
    progressText.classList.remove('hidden');
  } else {
    buttonText.textContent = 'Initialize Domain Scan';
    buttonSpinner.classList.add('hidden');
    loading.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressText.classList.add('hidden');
  }
}

function showProgressStep(message, step, totalSteps, percentage) {
  loadingMessage.textContent = message;
  progressText.textContent = `Process ${step} of ${totalSteps}`;
  progressFill.style.width = `${percentage}%`;
}

function displayResults(results, summary) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  if (results.available.length === 0 && results.taken.length === 0) {
    showError('No domains detected in scan matrix. Recalibrate search parameters.');
    return;
  }
  
  // Display available domains
  results.available.forEach(item => {
    const div = createCyberpunkDomainCard(item.domain, true, item.method, item.qualityScore, item.qualityGrade);
    availableList.appendChild(div);
  });
  
  // Display taken domains
  results.taken.forEach(item => {
    const div = createCyberpunkDomainCard(item.domain, false, item.method, item.qualityScore, item.qualityGrade);
    takenList.appendChild(div);
  });
  
  // Show results section
  results.classList.remove('hidden');
  
  // Scroll to results with smooth animation
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createCyberpunkDomainCard(domain, isAvailable, method, qualityScore = null, qualityGrade = null) {
  const div = document.createElement('div');
  div.className = `domain-card ${isAvailable ? 'available' : 'taken'}`;
  
  // Domain name
  const domainName = document.createElement('div');
  domainName.className = 'domain-name';
  domainName.textContent = domain;
  div.appendChild(domainName);
  
  // Meta information
  const meta = document.createElement('div');
  meta.className = 'domain-meta';
  
  const methodSpan = document.createElement('span');
  methodSpan.className = 'domain-method';
  methodSpan.textContent = `method: ${method}`;
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'domain-score';
  if (qualityScore && qualityGrade) {
    scoreSpan.textContent = `${qualityGrade.grade}: ${qualityScore.overall}/100`;
  } else {
    scoreSpan.textContent = 'score: pending';
  }
  
  meta.appendChild(methodSpan);
  meta.appendChild(scoreSpan);
  div.appendChild(meta);
  
  // Quality breakdown tooltip
  if (qualityScore) {
    const qualityInfo = document.createElement('div');
    qualityInfo.className = 'type-6';
    qualityInfo.style.marginBottom = '15px';
    qualityInfo.innerHTML = `
      <div style="font-family: 'Orbitron', monospace; font-size: 11px; line-height: 1.3;">
        LENGTH: ${qualityScore.breakdown.length}/100 • 
        MEMORY: ${qualityScore.breakdown.memorability}/100 • 
        BRAND: ${qualityScore.breakdown.brandability}/100<br>
        PROTOCOL: ${qualityScore.breakdown.extension}/100 • 
        RELEVANCE: ${qualityScore.breakdown.relevance}/100
      </div>
    `;
    div.appendChild(qualityInfo);
  }
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'domain-actions';
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-secondary';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', () => copyToClipboard(domain, `Domain ${domain} copied to memory buffer`));
  actions.appendChild(copyBtn);
  
  if (isAvailable) {
    // Register link
    const registerLink = document.createElement('a');
    registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    registerLink.target = '_blank';
    registerLink.className = 'link-register';
    registerLink.textContent = 'Register Domain';
    actions.appendChild(registerLink);
  }
  
  div.appendChild(actions);
  
  return div;
}

function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showToast('No available domains in memory buffer', 'error');
    return;
  }
  
  const domains = currentResults.available.map(item => item.domain).join('\n');
  copyToClipboard(domains, `${currentResults.available.length} domains transferred to memory buffer!`);
}

function handleExport() {
  if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
    showToast('No scan data available for export', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const prompt = document.getElementById('prompt').value;
  
  // Create CSV content with cyberpunk headers
  const csvContent = [
    'Domain,Status,Quality_Score,Quality_Grade,Scan_Method,Registry_Link',
    ...currentResults.available.map(item => 
      `"${item.domain}","AVAILABLE","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
    ),
    ...currentResults.taken.map(item => 
      `"${item.domain}","OCCUPIED","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `goblin-globe-scan-${timestamp}-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showToast('Scan data exported to local storage!', 'success');
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
  
  showToast('System reset - ready for new scan', 'success');
}

async function copyToClipboard(text, successMessage = 'Data transferred to memory buffer!') {
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
      showToast('Memory buffer transfer failed', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'i'
  }[type];
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-family: 'Orbitron', monospace; font-weight: bold;">[${icon}]</span>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 16px;">×</button>
    </div>
  `;
  
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
  error.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="font-family: 'Orbitron', monospace; font-size: 24px;">⚠</span>
      <div>
        <div style="font-family: 'Orbitron', monospace; font-weight: bold; margin-bottom: 5px;">SYSTEM ERROR</div>
        <div>${message}</div>
      </div>
    </div>
  `;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

function getCyberpunkErrorMessage(error) {
  const message = error.message || 'Unidentified system malfunction';
  
  // Cyberpunk-themed error messages
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Neural network overload detected. Cooling down system processes...';
  }
  
  if (message.includes('timeout') || message.includes('ENOTFOUND')) {
    return 'Connection to the matrix lost. Check network interface and retry...';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'Access denied. Authentication protocols compromised...';
  }
  
  if (message.includes('500')) {
    return 'Server mainframe experiencing critical errors. Attempting recovery...';
  }
  
  if (message.includes('Invalid prompt')) {
    return 'Input parameters contain corrupted data. Sanitize and retry...';
  }
  
  // Return cyberpunk version of original message
  return `System anomaly detected: ${message}`;
}

// Initialize cyberpunk interface
document.addEventListener('DOMContentLoaded', () => {
  // Add cyberpunk keyboard shortcut hints
  const form = document.getElementById('generateForm');
  const helpText = document.createElement('div');
  helpText.className = 'type-6 text-center';
  helpText.style.marginTop = '20px';
  helpText.innerHTML = `
    <div style="font-family: 'Orbitron', monospace; letter-spacing: 0.1em;">
      ⌨ HOTKEYS: CTRL+ENTER (scan) • CTRL+C (copy) • CTRL+S (export) • CTRL+R (reset)
    </div>
  `;
  form.appendChild(helpText);
  
  // Add matrix rain effect enhancement
  createMatrixRain();
});

// Matrix rain effect
function createMatrixRain() {
  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const drops = [];
  
  // Create matrix characters
  for (let i = 0; i < 50; i++) {
    const drop = document.createElement('div');
    drop.style.position = 'fixed';
    drop.style.top = '-20px';
    drop.style.left = Math.random() * window.innerWidth + 'px';
    drop.style.color = '#39FF14';
    drop.style.fontSize = '14px';
    drop.style.fontFamily = 'monospace';
    drop.style.zIndex = '-1';
    drop.style.opacity = '0.3';
    drop.style.pointerEvents = 'none';
    drop.textContent = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    
    document.body.appendChild(drop);
    drops.push({
      element: drop,
      speed: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  
  // Animate matrix rain
  function animateMatrix() {
    drops.forEach(drop => {
      const currentTop = parseInt(drop.element.style.top);
      
      if (currentTop > window.innerHeight) {
        drop.element.style.top = '-20px';
        drop.element.style.left = Math.random() * window.innerWidth + 'px';
        drop.element.textContent = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        drop.element.style.opacity = drop.opacity;
      } else {
        drop.element.style.top = (currentTop + drop.speed) + 'px';
      }
    });
    
    requestAnimationFrame(animateMatrix);
  }
  
  animateMatrix();
}