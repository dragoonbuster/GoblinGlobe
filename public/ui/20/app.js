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

// Holographic sound effects (optional - browser compatible)
const playHoloSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'scan':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Audio not supported, continue silently
  }
};

// Initialize event listeners
form.addEventListener('submit', handleFormSubmit);
exportBtn.addEventListener('click', handleExport);
copyAllBtn.addEventListener('click', handleCopyAll);
newSearchBtn.addEventListener('click', handleNewSearch);

// Add holographic keyboard shortcuts
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

// Holographic form validation with visual effects
const validateInput = (element, isValid) => {
  if (isValid) {
    element.style.borderColor = 'rgba(0, 255, 136, 0.8)';
    element.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.3)';
  } else {
    element.style.borderColor = 'rgba(255, 100, 100, 0.8)';
    element.style.boxShadow = '0 0 15px rgba(255, 100, 100, 0.3)';
    // Reset after 2 seconds
    setTimeout(() => {
      element.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      element.style.boxShadow = '';
    }, 2000);
  }
};

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const prompt = document.getElementById('prompt').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
    .map(cb => cb.value);
  
  // Holographic validation
  const promptInput = document.getElementById('prompt');
  const isPromptValid = prompt.length > 0;
  validateInput(promptInput, isPromptValid);
  
  if (!isPromptValid) {
    showHoloToast('Domain concept matrix cannot be empty', 'error');
    playHoloSound('error');
    return;
  }
  
  if (extensions.length === 0) {
    showHoloToast('Select at least one extension array', 'error');
    playHoloSound('error');
    return;
  }
  
  // Start holographic loading state
  setHoloLoadingState(true);
  showHoloProgressStep('Initializing domain matrix scan...', 1, 3, 10);
  playHoloSound('scan');
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count, extensions })
    });
    
    showHoloProgressStep('Analyzing domain availability matrix...', 2, 3, 50);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Scan failed');
    }
    
    showHoloProgressStep('Compiling holographic results...', 3, 3, 90);
    
    // Simulate holographic processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    currentResults = data.results;
    currentSummary = data.summary;
    
    setHoloLoadingState(false);
    displayHoloResults(data.results);
    showHoloToast(`Scan complete: ${data.results.available.length} domains available`, 'success');
    playHoloSound('success');
    
  } catch (err) {
    console.error('Holographic scan error:', err);
    setHoloLoadingState(false);
    showHoloError(err.message);
    playHoloSound('error');
  }
}

function setHoloLoadingState(isLoading) {
  if (isLoading) {
    generateButton.disabled = true;
    buttonText.textContent = 'Scanning...';
    buttonSpinner.classList.remove('hidden');
    loading.style.display = 'block';
    results.style.display = 'none';
    error.style.display = 'none';
    
    // Add scanning effect to form
    form.parentElement.style.animation = 'formFloat 2s ease-in-out infinite';
  } else {
    generateButton.disabled = false;
    buttonText.textContent = 'Initialize Scan';
    buttonSpinner.classList.add('hidden');
    loading.style.display = 'none';
    
    // Reset form animation
    form.parentElement.style.animation = 'formFloat 6s ease-in-out infinite';
  }
}

function showHoloProgressStep(message, step, total, progress) {
  loadingMessage.textContent = message;
  progressText.textContent = `Phase ${step} of ${total}`;
  progressText.classList.remove('hidden');
  progressBar.classList.remove('hidden');
  progressFill.style.width = `${progress}%`;
}

function displayHoloResults(results) {
  availableList.innerHTML = '';
  takenList.innerHTML = '';
  
  // Create holographic domain cards with 3D effects
  results.available.forEach((domain, index) => {
    const card = createHoloDomainCard(domain, 'available', index);
    availableList.appendChild(card);
  });
  
  results.taken.forEach((domain, index) => {
    const card = createHoloDomainCard(domain, 'taken', index);
    takenList.appendChild(card);
  });
  
  results.style.display = 'block';
  
  // Animate cards appearing with staggered timing
  const cards = document.querySelectorAll('.domain-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) rotateX(30deg)';
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) rotateX(0)';
    }, index * 100);
  });
}

function createHoloDomainCard(domain, status, index) {
  const card = document.createElement('div');
  card.className = `domain-card ${status}`;
  card.style.animationDelay = `${index * 0.5}s`;
  
  const isAvailable = status === 'available';
  const statusColor = isAvailable ? '#00ff88' : '#ff6666';
  
  card.innerHTML = `
    <div class="domain-name">${domain.name}</div>
    <div class="domain-meta">
      <span class="domain-method">${domain.method || 'DNS'}</span>
      <span class="domain-score">Score: ${domain.score || 'N/A'}</span>
    </div>
    ${isAvailable ? `
      <div class="domain-actions">
        <a href="https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain.name)}" 
           target="_blank" 
           class="link-register">
          Register Domain
        </a>
      </div>
    ` : ''}
  `;
  
  // Add holographic hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-15px) rotateX(10deg) rotateY(5deg)';
    card.style.boxShadow = `0 15px 50px rgba(${isAvailable ? '0, 255, 136' : '255, 100, 100'}, 0.4)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    card.style.boxShadow = '';
  });
  
  return card;
}

function showHoloError(message) {
  error.style.display = 'block';
  error.querySelector('p').textContent = `System Error: ${message}`;
  results.style.display = 'none';
  
  // Add error pulsing effect
  error.style.animation = 'titlePulse 1s ease-in-out infinite';
  setTimeout(() => {
    error.style.animation = '';
  }, 3000);
}

function showHoloToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

async function handleExport() {
  if (currentResults.available.length === 0) {
    showHoloToast('No available domains to export', 'error');
    return;
  }
  
  try {
    const csv = convertToCSV(currentResults.available);
    downloadCSV(csv, 'goblin-globe-domains.csv');
    showHoloToast('Domain data exported successfully', 'success');
    playHoloSound('success');
  } catch (err) {
    showHoloToast('Export failed: ' + err.message, 'error');
    playHoloSound('error');
  }
}

async function handleCopyAll() {
  if (currentResults.available.length === 0) {
    showHoloToast('No available domains to copy', 'error');
    return;
  }
  
  try {
    const domainList = currentResults.available.map(d => d.name).join('\n');
    await navigator.clipboard.writeText(domainList);
    showHoloToast(`${currentResults.available.length} domains copied to clipboard`, 'success');
    playHoloSound('success');
  } catch (err) {
    showHoloToast('Copy failed: ' + err.message, 'error');
    playHoloSound('error');
  }
}

function handleNewSearch() {
  // Reset form with holographic effect
  form.reset();
  document.getElementById('extensions').querySelector('input[value=".com"]').checked = true;
  
  // Hide results with fade effect
  results.style.transition = 'opacity 0.5s ease';
  results.style.opacity = '0';
  setTimeout(() => {
    results.style.display = 'none';
    results.style.opacity = '1';
    results.style.transition = '';
  }, 500);
  
  error.style.display = 'none';
  currentResults = { available: [], taken: [] };
  currentSummary = {};
  
  // Focus on prompt with holographic effect
  const promptInput = document.getElementById('prompt');
  promptInput.focus();
  promptInput.style.borderColor = '#00ffff';
  promptInput.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
  
  setTimeout(() => {
    promptInput.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    promptInput.style.boxShadow = '';
  }, 2000);
  
  showHoloToast('Matrix reset - ready for new scan', 'success');
}

// Utility functions
function convertToCSV(data) {
  const headers = ['Domain', 'Status', 'Method', 'Score'];
  const rows = data.map(domain => [
    domain.name,
    'Available',
    domain.method || 'DNS',
    domain.score || 'N/A'
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize holographic interface
document.addEventListener('DOMContentLoaded', () => {
  // Add subtle holographic animations to form elements
  const inputs = document.querySelectorAll('.form-input, .form-textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.style.transform = 'scale(1.02)';
      input.style.transition = 'all 0.3s ease';
    });
    
    input.addEventListener('blur', () => {
      input.style.transform = 'scale(1)';
    });
  });
  
  // Add holographic glow to checkboxes
  const checkboxes = document.querySelectorAll('.checkbox-input');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        playHoloSound('success');
      }
    });
  });
  
  // Add particle effect on button hover (optional enhancement)
  generateButton.addEventListener('mouseenter', () => {
    generateButton.style.transform = 'translateY(-3px) scale(1.05)';
  });
  
  generateButton.addEventListener('mouseleave', () => {
    generateButton.style.transform = 'translateY(0) scale(1)';
  });
  
  console.log('Goblin Globe Holographic Interface initialized');
  showHoloToast('Holographic interface online', 'success');
});