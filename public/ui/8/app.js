// Retro DOS Terminal Interface for Goblin Globe Domain Finder
class DOSTerminalInterface {
    constructor() {
        this.currentResults = { available: [], taken: [] };
        this.isLoading = false;
        this.selectedDomain = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startSystemTime();
        this.initializeDOS();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('terminalForm');
        this.promptInput = document.getElementById('promptInput');
        this.countInput = document.getElementById('countInput');
        this.executeButton = document.getElementById('executeButton');
        this.executeText = document.getElementById('executeText');
        this.executeSpinner = document.getElementById('executeSpinner');
        this.clearButton = document.getElementById('clearButton');
        this.helpButton = document.getElementById('helpButton');

        // Loading elements
        this.loadingSection = document.getElementById('loadingSection');
        this.loadingText = document.getElementById('loadingText');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.progressDetails = document.getElementById('progressDetails');

        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.scanSummary = document.getElementById('scanSummary');
        this.availableList = document.getElementById('availableList');
        this.takenList = document.getElementById('takenList');
        this.availableCount = document.getElementById('availableCount');
        this.takenCount = document.getElementById('takenCount');

        // Action buttons
        this.exportButton = document.getElementById('exportButton');
        this.copyButton = document.getElementById('copyButton');
        this.newScanButton = document.getElementById('newScanButton');

        // Error elements
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');

        // System elements
        this.systemDate = document.getElementById('systemDate');
        this.systemTime = document.getElementById('systemTime');
        this.statusTime = document.getElementById('statusTime');
        this.totalDomains = document.getElementById('totalDomains');
        this.availableStatusCount = document.getElementById('availableStatusCount');
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Button events
        this.clearButton.addEventListener('click', () => this.clearForm());
        this.helpButton.addEventListener('click', () => this.showHelp());
        this.exportButton.addEventListener('click', () => this.exportResults());
        this.copyButton.addEventListener('click', () => this.copyAvailable());
        this.newScanButton.addEventListener('click', () => this.newScan());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Input focus effects
        this.promptInput.addEventListener('focus', () => this.activateSection('promptSection'));
        this.countInput.addEventListener('focus', () => this.activateSection('countSection'));
        
        // Extension checkboxes
        const extensionInputs = document.querySelectorAll('input[name="extensions"]');
        extensionInputs.forEach(input => {
            input.addEventListener('change', () => this.activateSection('extensionsSection'));
        });

        // Function key buttons
        document.querySelectorAll('.function-key').forEach(key => {
            key.addEventListener('click', (e) => {
                const keyCode = e.currentTarget.dataset.key;
                this.handleFunctionKey(keyCode);
            });
        });
    }

    startSystemTime() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            this.systemDate.textContent = dateString;
            this.systemTime.textContent = timeString;
            this.statusTime.textContent = timeString;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    initializeDOS() {
        // DOS startup message
        console.log("MS-DOS 6.22 Compatible Domain Scanner loaded.");
        console.log("Goblin Globe Domain Finder v1.0");
        console.log("Copyright (C) 2024 Goblin Globe Systems");
        
        // Focus on prompt input
        setTimeout(() => {
            this.promptInput.focus();
            this.activateSection('promptSection');
        }, 500);
    }

    activateSection(sectionId) {
        // Remove active class from all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Get form data
        const prompt = this.promptInput.value.trim();
        const count = parseInt(this.countInput.value);
        const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
            .map(cb => cb.value);
        
        // Validation
        if (!prompt) {
            this.showError('Domain description is required');
            this.promptInput.focus();
            return;
        }
        
        if (extensions.length === 0) {
            this.showError('At least one domain extension must be selected');
            return;
        }
        
        // Start scanning process
        await this.startScan(prompt, count, extensions);
    }

    async startScan(prompt, count, extensions) {
        try {
            this.setLoadingState(true);
            this.hideError();
            this.hideResults();
            
            // Step 1: Initialize
            this.updateProgress('Initializing domain scan...', 0);
            await this.delay(500);
            
            // Step 2: Generate domains
            this.updateProgress('Generating domain names...', 10);
            this.updateProgressDetails('Connecting to domain generation service...');
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, count, extensions })
            });
            
            // Step 3: Check availability
            this.updateProgress('Checking domain availability...', 50);
            this.updateProgressDetails('Performing DNS lookups and WHOIS queries...');
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP Error ${response.status}`);
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Domain scan failed');
            }
            
            // Step 4: Process results
            this.updateProgress('Processing scan results...', 90);
            this.updateProgressDetails('Analyzing domain quality and availability...');
            await this.delay(500);
            
            // Step 5: Complete
            this.updateProgress('Scan complete!', 100);
            this.updateProgressDetails('Results ready for review');
            await this.delay(1000);
            
            // Store and display results
            this.currentResults = data.results;
            this.displayResults(data.results, data.summary);
            
        } catch (error) {
            console.error('DOS scan error:', error);
            this.showError(`Scan Error: ${this.formatErrorMessage(error.message)}`);
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.executeButton.disabled = true;
            this.executeText.textContent = 'Scanning...';
            this.executeSpinner.classList.remove('hidden');
            this.loadingSection.classList.add('active');
        } else {
            this.executeButton.disabled = false;
            this.executeText.textContent = 'Start Scan [F9]';
            this.executeSpinner.classList.add('hidden');
            this.loadingSection.classList.remove('active');
        }
    }

    updateProgress(message, percentage) {
        this.loadingText.textContent = message;
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}%`;
    }

    updateProgressDetails(details) {
        this.progressDetails.textContent = details;
    }

    displayResults(results, summary) {
        this.clearResults();
        
        // Update counts
        this.availableCount.textContent = results.available.length;
        this.takenCount.textContent = results.taken.length;
        this.totalDomains.textContent = results.available.length + results.taken.length;
        this.availableStatusCount.textContent = results.available.length;
        
        // Update summary
        const totalScanned = results.available.length + results.taken.length;
        const availablePercent = totalScanned > 0 ? Math.round((results.available.length / totalScanned) * 100) : 0;
        
        this.scanSummary.textContent = `Total: ${totalScanned}, Available: ${results.available.length} (${availablePercent}%), Taken: ${results.taken.length} (${100 - availablePercent}%)`;
        
        // Display available domains
        results.available.forEach((item, index) => {
            const domainElement = this.createDomainElement(item, true, index);
            this.availableList.appendChild(domainElement);
        });
        
        // Display taken domains
        results.taken.forEach((item, index) => {
            const domainElement = this.createDomainElement(item, false, index + results.available.length);
            this.takenList.appendChild(domainElement);
        });
        
        // Show results section
        this.resultsSection.classList.add('active');
        
        // Scroll to results
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        
        console.log(`Scan complete. Found ${results.available.length} available domains.`);
    }

    createDomainElement(item, isAvailable, index) {
        const div = document.createElement('div');
        div.className = 'domain-item';
        div.dataset.index = index;
        
        const domainSpan = document.createElement('span');
        domainSpan.className = 'domain-name';
        domainSpan.textContent = item.domain;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `domain-status ${isAvailable ? 'status-available' : 'status-taken'}`;
        statusSpan.textContent = isAvailable ? 'AVAILABLE' : 'TAKEN';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'domain-actions';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyToClipboard(item.domain);
        });
        
        actionsDiv.appendChild(copyBtn);
        
        // Register button for available domains
        if (isAvailable) {
            const registerBtn = document.createElement('button');
            registerBtn.className = 'action-btn';
            registerBtn.textContent = 'Register';
            registerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(`https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`, '_blank');
            });
            actionsDiv.appendChild(registerBtn);
        }
        
        // Quality score display
        if (item.qualityScore && item.qualityGrade) {
            const qualitySpan = document.createElement('span');
            qualitySpan.style.color = 'var(--dos-dark-gray)';
            qualitySpan.style.fontSize = '9px';
            qualitySpan.textContent = `[${item.qualityGrade.grade}: ${item.qualityScore.overall}]`;
            actionsDiv.appendChild(qualitySpan);
        }
        
        // Click to select
        div.addEventListener('click', () => {
            document.querySelectorAll('.domain-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            this.selectedDomain = item;
        });
        
        div.appendChild(domainSpan);
        div.appendChild(statusSpan);
        div.appendChild(actionsDiv);
        
        return div;
    }

    clearResults() {
        this.availableList.innerHTML = '';
        this.takenList.innerHTML = '';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.classList.add('active');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.errorSection.classList.remove('active');
        }, 5000);
    }

    hideError() {
        this.errorSection.classList.remove('active');
    }

    hideResults() {
        this.resultsSection.classList.remove('active');
    }

    clearForm() {
        this.promptInput.value = '';
        this.countInput.value = '10';
        
        // Uncheck all extensions except .com
        document.querySelectorAll('input[name="extensions"]').forEach(cb => {
            cb.checked = cb.value === '.com';
        });
        
        this.hideError();
        this.hideResults();
        this.promptInput.focus();
        this.activateSection('promptSection');
        this.totalDomains.textContent = '0';
        this.availableStatusCount.textContent = '0';
        
        console.log('Form cleared. Ready for new scan.');
    }

    showHelp() {
        const helpMessage = `GOBLIN GLOBE DOMAIN FINDER v1.0 HELP

FUNCTION KEYS:
F1 - Show this help dialog
F2 - Clear form and reset
F3 - Export results to CSV file
F4 - Copy available domains
F5 - Start new scan
F9 - Execute domain scan
F10 - Quit (close window)

USAGE:
1. Enter domain description
2. Set generation count (1-20)
3. Select domain extensions
4. Press F9 or click Start Scan

KEYBOARD SHORTCUTS:
Tab - Navigate between fields
Enter - Submit form
Esc - Cancel/Close dialogs

For technical support, contact Goblin Globe Systems.`;
        
        this.showError(helpMessage);
    }

    newScan() {
        this.clearForm();
        this.currentResults = { available: [], taken: [] };
        this.selectedDomain = null;
    }

    async copyAvailable() {
        const availableDomains = this.currentResults.available.map(item => item.domain);
        
        if (availableDomains.length === 0) {
            this.showError('No available domains to copy');
            return;
        }
        
        await this.copyToClipboard(availableDomains.join('\n'));
        console.log(`Copied ${availableDomains.length} available domains to clipboard`);
        
        // Show brief confirmation
        const originalText = this.copyButton.textContent;
        this.copyButton.textContent = 'Copied!';
        setTimeout(() => {
            this.copyButton.textContent = originalText;
        }, 1500);
    }

    exportResults() {
        if (this.currentResults.available.length === 0 && this.currentResults.taken.length === 0) {
            this.showError('No results to export');
            return;
        }
        
        const timestamp = new Date().toISOString().split('T')[0];
        const prompt = this.promptInput.value.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        
        // Create CSV content
        const csvContent = [
            'Domain,Status,Quality_Score,Quality_Grade,Method,Register_URL',
            ...this.currentResults.available.map(item => 
                `"${item.domain}","Available","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","https://www.namecheap.com/domains/registration/results/?domain=${item.domain}"`
            ),
            ...this.currentResults.taken.map(item => 
                `"${item.domain}","Taken","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `domains-${timestamp}-${prompt}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('Results exported successfully');
        
        // Show brief confirmation
        const originalText = this.exportButton.textContent;
        this.exportButton.textContent = 'Exported!';
        setTimeout(() => {
            this.exportButton.textContent = originalText;
        }, 1500);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
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
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    handleKeyboard(e) {
        // Function keys
        if (e.key.startsWith('F') && e.key.length <= 3) {
            e.preventDefault();
            this.handleFunctionKey(e.key);
            return;
        }
        
        // Other keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    if (!this.isLoading) {
                        e.preventDefault();
                        this.form.dispatchEvent(new Event('submit'));
                    }
                    break;
                case 'c':
                    if (this.currentResults.available.length > 0) {
                        e.preventDefault();
                        this.copyAvailable();
                    }
                    break;
                case 's':
                    if (this.currentResults.available.length > 0 || this.currentResults.taken.length > 0) {
                        e.preventDefault();
                        this.exportResults();
                    }
                    break;
                case 'r':
                    e.preventDefault();
                    this.newScan();
                    break;
            }
        }
        
        // Escape key
        if (e.key === 'Escape') {
            this.hideError();
        }
    }

    handleFunctionKey(key) {
        switch (key) {
            case 'F1':
                this.showHelp();
                break;
            case 'F2':
                this.clearForm();
                break;
            case 'F3':
                this.exportResults();
                break;
            case 'F4':
                this.copyAvailable();
                break;
            case 'F5':
                this.newScan();
                break;
            case 'F9':
                if (!this.isLoading) {
                    this.form.dispatchEvent(new Event('submit'));
                }
                break;
            case 'F10':
                if (confirm('Quit Goblin Globe Domain Finder?')) {
                    window.close();
                }
                break;
        }
    }

    formatErrorMessage(message) {
        // Format error messages for DOS display
        if (message.includes('rate limit') || message.includes('429')) {
            return 'Rate limit exceeded. Please wait before retrying.';
        }
        
        if (message.includes('timeout') || message.includes('ENOTFOUND')) {
            return 'Connection timeout. Check network connection.';
        }
        
        if (message.includes('401') || message.includes('403')) {
            return 'Authentication failed. Please refresh and retry.';
        }
        
        if (message.includes('500')) {
            return 'Server error. Please retry in a few moments.';
        }
        
        return message;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize DOS terminal interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DOSTerminalInterface();
});

// DOS startup message
console.log(`
MS-DOS 6.22 Compatible System
Goblin Globe Domain Finder v1.0
Copyright (C) 2024 Goblin Globe Systems

 ██████╗  ██████╗ ██████╗ ██╗     ██╗███╗   ██╗     ██████╗ ██╗      ██████╗ ██████╗ ███████╗
██╔════╝ ██╔═══██╗██╔══██╗██║     ██║████╗  ██║    ██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔════╝
██║  ███╗██║   ██║██████╔╝██║     ██║██╔██╗ ██║    ██║  ███╗██║     ██║   ██║██████╔╝█████╗  
██║   ██║██║   ██║██╔══██╗██║     ██║██║╚██╗██║    ██║   ██║██║     ██║   ██║██╔══██╗██╔══╝  
╚██████╔╝╚██████╔╝██████╔╝███████╗██║██║ ╚████║    ╚██████╔╝███████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝     ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝

System ready. Press F1 for help.
`);