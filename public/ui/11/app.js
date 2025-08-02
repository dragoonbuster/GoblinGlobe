// Corporate 90s Style Goblin Globe Domain Finder
// Professional enterprise-grade domain generation system

// Global variables for the corporate system
let currentResults = { available: [], taken: [] };
let searchInProgress = false;
let systemStartTime = Date.now();

// Initialize the corporate system
document.addEventListener('DOMContentLoaded', function() {
    initializeCorporateSystem();
    updateSystemStatus();
    
    // Set up form submission
    document.getElementById('domainForm').addEventListener('submit', handleFormSubmit);
    
    // Update system uptime periodically
    setInterval(updateSystemStatus, 30000);
});

// Initialize corporate features
function initializeCorporateSystem() {
    // Add professional tooltips
    addCorporateTooltips();
    
    // Initialize navigation hover effects
    initializeNavigation();
    
    // Add professional keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Log system initialization
    console.log('Goblin Globe Corporate System v2.1 initialized successfully');
    console.log('System start time:', new Date().toLocaleString());
}

// Add professional tooltips
function addCorporateTooltips() {
    const tooltipElements = [
        { id: 'prompt', text: 'Enter a detailed description of your business or domain requirements' },
        { id: 'count', text: 'Select the number of domain suggestions to generate' },
        { selector: 'input[name="extensions"]', text: 'Choose appropriate top-level domains for your business' }
    ];
    
    tooltipElements.forEach(element => {
        const targets = element.id ? 
            [document.getElementById(element.id)] : 
            document.querySelectorAll(element.selector);
        
        targets.forEach(target => {
            if (target) {
                target.title = element.text;
                target.style.cursor = 'help';
            }
        });
    });
}

// Initialize navigation effects
function initializeNavigation() {
    const navCells = document.querySelectorAll('.nav-cell');
    
    navCells.forEach(cell => {
        cell.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#999999';
        });
        
        cell.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#888888';
        });
        
        cell.addEventListener('mousedown', function() {
            this.style.borderRight = '2px inset #aaaaaa';
            this.style.borderBottom = '2px inset #aaaaaa';
        });
        
        cell.addEventListener('mouseup', function() {
            this.style.borderRight = '2px outset #aaaaaa';
            this.style.borderBottom = '2px outset #aaaaaa';
        });
    });
}

// Initialize professional keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to submit form
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            if (!searchInProgress) {
                document.getElementById('domainForm').dispatchEvent(new Event('submit'));
            }
        }
        
        // F1 for help
        if (e.key === 'F1') {
            e.preventDefault();
            showCorporateHelp();
        }
        
        // Ctrl+R for reset
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            resetForm();
        }
    });
}

// Update system status indicators
function updateSystemStatus() {
    const uptime = Math.floor((Date.now() - systemStartTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    // Update sidebar with current system info
    const uptimeDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update any system status displays
    console.log(`System uptime: ${uptimeDisplay}`);
}

// Professional alert system
function showCorporateAlert(title, message, type = 'info') {
    // Create professional modal dialog
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    const dialog = document.createElement('div');
    dialog.style.background = '#ffffff';
    dialog.style.border = '2px outset #c0c0c0';
    dialog.style.borderRadius = '0';
    dialog.style.minWidth = '400px';
    dialog.style.maxWidth = '600px';
    dialog.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.5)';
    
    const titleBar = document.createElement('div');
    titleBar.style.background = 'linear-gradient(90deg, #003366, #004488)';
    titleBar.style.color = '#ffffff';
    titleBar.style.padding = '8px 12px';
    titleBar.style.fontWeight = 'bold';
    titleBar.style.fontSize = '12px';
    titleBar.style.textShadow = '1px 1px 1px #000000';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';
    
    const titleText = document.createElement('span');
    titleText.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#ffffff';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.width = '20px';
    closeButton.style.height = '20px';
    
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeButton);
    
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.fontFamily = 'Arial, sans-serif';
    content.style.fontSize = '12px';
    content.style.lineHeight = '1.4';
    content.innerHTML = message.replace(/\n/g, '<br>');
    
    const buttonBar = document.createElement('div');
    buttonBar.style.padding = '10px 20px 20px 20px';
    buttonBar.style.textAlign = 'center';
    
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.className = 'form-button primary-button';
    okButton.style.minWidth = '80px';
    
    const closeDialog = () => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    };
    
    closeButton.onclick = closeDialog;
    okButton.onclick = closeDialog;
    
    buttonBar.appendChild(okButton);
    
    dialog.appendChild(titleBar);
    dialog.appendChild(content);
    dialog.appendChild(buttonBar);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Focus the OK button
    setTimeout(() => okButton.focus(), 100);
}

// Corporate help system
function showCorporateHelp() {
    const helpContent = `
        <strong>Goblin Globe Corporate Domain Generator - Help System</strong><br><br>
        
        <strong>Getting Started:</strong><br>
        1. Enter your business description in the "Business Description" field<br>
        2. Select the desired number of domain suggestions<br>
        3. Choose appropriate TLD extensions for your business<br>
        4. Click "Generate Domains" to process your request<br><br>
        
        <strong>Keyboard Shortcuts:</strong><br>
        • Ctrl+Enter: Submit form<br>
        • Ctrl+R: Reset form<br>
        • F1: Show this help dialog<br><br>
        
        <strong>Quality Scoring:</strong><br>
        Our AI system rates domains on a scale of 0-100 based on:<br>
        • Brand memorability<br>
        • SEO potential<br>
        • Industry relevance<br>
        • Length and pronounceability<br><br>
        
        <strong>Technical Support:</strong><br>
        For assistance, contact our enterprise support team at:<br>
        Phone: 1-800-GOBLIN-1<br>
        Email: support@goblinglobe.com
    `;
    
    showCorporateAlert('Help - Domain Generator', helpContent);
}

// Handle form submission with corporate validation
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (searchInProgress) {
        showCorporateAlert('System Busy', 'A domain generation request is currently in progress. Please wait for the current operation to complete before submitting a new request.');
        return;
    }
    
    const prompt = document.getElementById('prompt').value.trim();
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    // Corporate validation
    if (!prompt) {
        showCorporateAlert('Validation Error', 'Business Description is a required field. Please provide a detailed description of your business or domain requirements.');
        document.getElementById('prompt').focus();
        return;
    }
    
    if (prompt.length < 10) {
        showCorporateAlert('Validation Error', 'Business Description must be at least 10 characters long. Please provide more detailed information about your requirements.');
        document.getElementById('prompt').focus();
        return;
    }
    
    if (extensions.length === 0) {
        showCorporateAlert('Validation Error', 'At least one TLD extension must be selected. Please choose the appropriate top-level domains for your business.');
        return;
    }
    
    await processDomainRequest(prompt, count, extensions);
}

// Process domain generation request
async function processDomainRequest(prompt, count, extensions) {
    searchInProgress = true;
    
    // Show professional loading interface
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    
    // Corporate loading messages
    const loadingMessages = [
        'Initializing AI engine...',
        'Connecting to enterprise database...',
        'Processing business requirements...',
        'Analyzing market trends...',
        'Generating domain candidates...',
        'Validating trademark conflicts...',
        'Checking domain availability...',
        'Calculating quality scores...',
        'Applying business logic filters...',
        'Compiling professional report...',
        'Finalizing results...'
    ];
    
    let messageIndex = 0;
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        document.getElementById('loadingText').textContent = 'Processing domain generation request...';
        document.getElementById('loadingDetails').textContent = loadingMessages[messageIndex % loadingMessages.length];
        messageIndex++;
        
        progress += 9;
        const progressPercent = Math.min(100, Math.floor(progress));
        
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = progressPercent + '%';
        progressText.textContent = progressPercent + '%';
        
        if (progressPercent >= 100) {
            progressText.textContent = 'Completing...';
        }
    }, 800);
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, count, extensions })
        });
        
        const data = await response.json();
        
        // Stop loading animation
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'The domain generation service encountered an error');
        }
        
        currentResults = data.results;
        displayCorporateResults(data.results);
        
        // Show success message
        const availableCount = data.results.available.length;
        const totalCount = data.results.available.length + data.results.taken.length;
        
        let successMessage = `Domain generation completed successfully.\n\n`;
        successMessage += `Results Summary:\n`;
        successMessage += `• Total domains processed: ${totalCount}\n`;
        successMessage += `• Available domains: ${availableCount}\n`;
        successMessage += `• Unavailable domains: ${data.results.taken.length}\n`;
        successMessage += `• Success rate: ${((availableCount / totalCount) * 100).toFixed(1)}%`;
        
        showStatusMessage(successMessage, 'success');
        
    } catch (error) {
        clearInterval(loadingInterval);
        document.getElementById('loading').style.display = 'none';
        
        // Corporate error handling
        let errorTitle = 'System Error';
        let errorMessage = error.message;
        
        if (error.message.includes('rate limit')) {
            errorTitle = 'Rate Limit Exceeded';
            errorMessage = 'The system has received too many requests. Please wait a moment before submitting another domain generation request.\n\nFor high-volume processing, please contact our enterprise sales team to discuss dedicated resource allocation.';
        } else if (error.message.includes('timeout')) {
            errorTitle = 'Request Timeout';
            errorMessage = 'The domain generation request timed out due to high system load. This is typically temporary.\n\nPlease try again in a few moments. If the problem persists, contact technical support.';
        } else if (error.message.includes('500')) {
            errorTitle = 'Internal Server Error';
            errorMessage = 'The domain generation service is experiencing technical difficulties. Our technical team has been automatically notified.\n\nPlease try again later or contact support if this issue persists.';
        }
        
        showCorporateAlert(errorTitle, errorMessage);
        showStatusMessage('Domain generation failed: ' + error.message, 'error');
    }
    
    searchInProgress = false;
}

// Display results in corporate table format
function displayCorporateResults(results) {
    const availableList = document.getElementById('availableList');
    const takenList = document.getElementById('takenList');
    
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    // Display available domains
    results.available.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? '' : 'alternate-row';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || 'N/A';
        
        row.innerHTML = `
            <td class="domain-available" style="font-family: 'Courier New', monospace; font-weight: bold;">
                ${item.domain}
            </td>
            <td class="domain-available" style="text-align: center;">
                ${qualityScore}/100
            </td>
            <td class="domain-available" style="text-align: center;">
                ${qualityGrade}
            </td>
            <td class="domain-available" style="text-align: center;">
                <a href="https://www.namecheap.com/domains/registration/results/?domain=${item.domain}" 
                   target="_blank" 
                   style="color: #003366; font-weight: bold; text-decoration: underline;">
                    Register Now
                </a>
            </td>
        `;
        availableList.appendChild(row);
    });
    
    // Display taken domains
    results.taken.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? '' : 'alternate-row';
        
        const qualityScore = item.qualityScore?.overall || 'N/A';
        const qualityGrade = item.qualityGrade?.grade || 'N/A';
        
        row.innerHTML = `
            <td class="domain-taken" style="font-family: 'Courier New', monospace; font-weight: bold;">
                ${item.domain}
            </td>
            <td class="domain-taken" style="text-align: center;">
                ${qualityScore}/100
            </td>
            <td class="domain-taken" style="text-align: center;">
                ${qualityGrade}
            </td>
            <td class="domain-taken" style="text-align: center;">
                <span style="color: #660000; font-weight: bold;">Unavailable</span>
            </td>
        `;
        takenList.appendChild(row);
    });
    
    // Hide empty sections
    const availableSection = document.getElementById('availableSection');
    const takenSection = document.getElementById('takenSection');
    
    if (results.available.length === 0) {
        availableSection.style.display = 'none';
    } else {
        availableSection.style.display = 'block';
    }
    
    if (results.taken.length === 0) {
        takenSection.style.display = 'none';
    } else {
        takenSection.style.display = 'block';
    }
    
    document.getElementById('results').style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 200);
}

// Show status messages
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    
    statusDiv.className = `status-message status-${type}`;
    statusDiv.innerHTML = message.replace(/\n/g, '<br>');
    statusDiv.style.display = 'block';
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 10000);
}

// Copy available domains
function copyAvailable() {
    if (currentResults.available.length === 0) {
        showCorporateAlert('No Data', 'No available domains to copy. Please generate domains first.');
        return;
    }
    
    const domains = currentResults.available.map(item => item.domain).join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(domains).then(() => {
            showCorporateAlert('Copy Successful', `Successfully copied ${currentResults.available.length} available domains to clipboard.\n\nYou can now paste this list into any text editor or document.`);
        }).catch(() => {
            fallbackCopy(domains);
        });
    } else {
        fallbackCopy(domains);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCorporateAlert('Copy Successful', `Domain list copied to clipboard using legacy method.\n\nUse Ctrl+V to paste the domains where needed.`);
    } catch (err) {
        showCorporateAlert('Copy Failed', 'Unable to copy to clipboard automatically.\n\nPlease manually select and copy the domain names from the results table.');
    }
    
    document.body.removeChild(textArea);
}

// Export to CSV
function exportCSV() {
    if (currentResults.available.length === 0 && currentResults.taken.length === 0) {
        showCorporateAlert('No Data', 'No results to export. Please generate domains first.');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const prompt = document.getElementById('prompt').value.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    // Create professional CSV content
    const csvContent = [
        '# Goblin Globe Corporation - Domain Generation Report',
        '# Generated: ' + new Date().toLocaleString(),
        '# Business Description: ' + document.getElementById('prompt').value,
        '# Processing System: Enterprise AI Engine v2.1',
        '',
        'Domain Name,Availability Status,Quality Score,Quality Grade,Generation Method,Registration URL',
        ...currentResults.available.map(item => 
            `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method || 'AI Generation'}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
        ),
        ...currentResults.taken.map(item => 
            `"${item.domain}","Unavailable","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method || 'AI Generation'}","N/A - Already Registered"`
        )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goblin-globe-domains-${timestamp}-${prompt}.csv`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCorporateAlert('Export Complete', 'Domain generation report has been exported to CSV format.\n\nThe file has been saved to your Downloads folder and is ready for use in spreadsheet applications or further processing.');
}

// Start new search
function newSearch() {
    if (currentResults.available.length > 0 || currentResults.taken.length > 0) {
        if (!confirm('Start New Search?\n\nThis will clear your current results. Are you sure you want to proceed?')) {
            return;
        }
    }
    
    document.getElementById('prompt').value = '';
    document.getElementById('count').value = '10';
    document.getElementById('results').style.display = 'none';
    document.getElementById('statusMessage').style.display = 'none';
    currentResults = { available: [], taken: [] };
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus on prompt field
    setTimeout(() => {
        document.getElementById('prompt').focus();
    }, 300);
    
    showStatusMessage('Form cleared. Ready for new domain generation request.', 'success');
}

// Reset form
function resetForm() {
    if (!confirm('Reset Form?\n\nThis will clear all form fields and restore default settings. Continue?')) {
        return;
    }
    
    document.getElementById('domainForm').reset();
    document.getElementById('count').value = '10';
    
    // Make sure .com is checked
    const comCheckbox = document.querySelector('input[name="extensions"][value=".com"]');
    if (comCheckbox) {
        comCheckbox.checked = true;
    }
    
    showStatusMessage('Form has been reset to default values.', 'success');
}

// Professional error logging
window.addEventListener('error', function(e) {
    console.error('Goblin Globe Corporate System Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        timestamp: new Date().toISOString()
    });
});

// Log system ready
console.log('Goblin Globe Corporate Domain Generator ready for enterprise operations');