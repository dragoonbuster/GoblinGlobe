// Terminal Interface for Goblin Globe Domain Finder
class TerminalInterface {
    constructor() {
        this.currentResults = { available: [], taken: [] };
        this.isLoading = false;
        this.spinnerChars = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
        this.spinnerIndex = 0;
        this.spinnerInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startSystemTime();
        this.initializeTerminal();
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

        // Loading elements
        this.loadingSection = document.getElementById('loadingSection');
        this.loadingText = document.getElementById('loadingText');
        this.progressFill = document.getElementById('progressFill');
        this.loadingSpinner = document.getElementById('loadingSpinner');
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
        this.systemTime = document.getElementById('systemTime');
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Button events
        this.clearButton.addEventListener('click', () => this.clearForm());
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
            this.systemTime.textContent = `${dateString} ${timeString}`;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    initializeTerminal() {
        // Add typing effect to help text
        this.typeMessage("Terminal interface initialized. Ready for domain scanning.", 50);
        
        // Focus on prompt input
        setTimeout(() => {
            this.promptInput.focus();
            this.activateSection('promptSection');
        }, 1000);
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
            this.showError('ERROR: Domain description required');
            this.promptInput.focus();
            return;
        }
        
        if (extensions.length === 0) {
            this.showError('ERROR: At least one extension must be selected');
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
            this.updateProgress('Generating domain ideas...', 10);
            this.updateProgressDetails('Connecting to AI generation service...');
            
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
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Scan failed');
            }
            
            // Step 4: Process results
            this.updateProgress('Processing scan results...', 90);
            this.updateProgressDetails('Analyzing domain quality and availability...');
            await this.delay(500);
            
            // Step 5: Complete
            this.updateProgress('Scan complete!', 100);
            this.updateProgressDetails('Results ready for display');
            await this.delay(1000);
            
            // Store and display results
            this.currentResults = data.results;
            this.displayResults(data.results, data.summary);
            
        } catch (error) {
            console.error('Scan error:', error);
            this.showError(`SCAN_ERROR: ${this.formatErrorMessage(error.message)}`);
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.executeButton.disabled = true;
            this.executeText.textContent = 'SCANNING...';
            this.executeSpinner.classList.remove('hidden');
            this.loadingSection.classList.add('active');
            this.startSpinner();
        } else {
            this.executeButton.disabled = false;
            this.executeText.textContent = 'EXECUTE SCAN';
            this.executeSpinner.classList.add('hidden');
            this.loadingSection.classList.remove('active');
            this.stopSpinner();
        }
    }

    updateProgress(message, percentage) {
        this.loadingText.textContent = message;
        this.progressFill.style.width = `${percentage}%`;
    }

    updateProgressDetails(details) {
        this.progressDetails.textContent = details;
    }

    startSpinner() {
        this.spinnerInterval = setInterval(() => {
            this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerChars.length;
            if (this.loadingSpinner) {
                this.loadingSpinner.textContent = this.spinnerChars[this.spinnerIndex];
            }
            if (this.executeSpinner && !this.executeSpinner.classList.contains('hidden')) {
                this.executeSpinner.textContent = this.spinnerChars[this.spinnerIndex];
            }
        }, 100);
    }

    stopSpinner() {
        if (this.spinnerInterval) {
            clearInterval(this.spinnerInterval);
            this.spinnerInterval = null;
        }
    }

    displayResults(results, summary) {
        this.clearResults();
        
        // Update counts
        this.availableCount.textContent = results.available.length;
        this.takenCount.textContent = results.taken.length;
        
        // Update summary
        const totalScanned = results.available.length + results.taken.length;
        const availablePercent = totalScanned > 0 ? Math.round((results.available.length / totalScanned) * 100) : 0;
        
        this.scanSummary.innerHTML = `
            TOTAL_SCANNED: ${totalScanned} | 
            AVAILABLE: ${results.available.length} (${availablePercent}%) | 
            TAKEN: ${results.taken.length} (${100 - availablePercent}%)
        `;
        
        // Display available domains
        results.available.forEach(item => {
            const domainElement = this.createDomainElement(item, true);
            this.availableList.appendChild(domainElement);
        });
        
        // Display taken domains
        results.taken.forEach(item => {
            const domainElement = this.createDomainElement(item, false);
            this.takenList.appendChild(domainElement);
        });
        
        // Show results section
        this.resultsSection.classList.add('active');
        
        // Scroll to results
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        
        // Terminal notification
        this.typeMessage(`Scan complete. Found ${results.available.length} available domains.`);
    }

    createDomainElement(item, isAvailable) {
        const div = document.createElement('div');
        div.className = 'domain-item';
        
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
        copyBtn.className = 'action-button';
        copyBtn.textContent = 'COPY';
        copyBtn.addEventListener('click', () => this.copyToClipboard(item.domain));
        
        actionsDiv.appendChild(copyBtn);
        
        // Register button for available domains
        if (isAvailable) {
            const registerBtn = document.createElement('button');
            registerBtn.className = 'action-button';
            registerBtn.textContent = 'REGISTER';
            registerBtn.addEventListener('click', () => {
                window.open(`https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`, '_blank');
            });
            actionsDiv.appendChild(registerBtn);
        }
        
        // Quality score display
        if (item.qualityScore && item.qualityGrade) {
            const qualitySpan = document.createElement('span');
            qualitySpan.style.color = 'var(--terminal-dim)';
            qualitySpan.style.fontSize = '11px';
            qualitySpan.textContent = `[${item.qualityGrade.grade}: ${item.qualityScore.overall}/100]`;
            actionsDiv.appendChild(qualitySpan);
        }
        
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
        this.typeMessage(`ERROR: ${message}`);
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
        
        this.typeMessage('Form cleared. Ready for new scan.');
    }

    newScan() {
        this.clearForm();
        this.currentResults = { available: [], taken: [] };
    }

    async copyAvailable() {
        const availableDomains = this.currentResults.available.map(item => item.domain);
        
        if (availableDomains.length === 0) {
            this.typeMessage('ERROR: No available domains to copy');
            return;
        }
        
        await this.copyToClipboard(availableDomains.join('\n'));
        this.typeMessage(`Copied ${availableDomains.length} available domains to clipboard`);
    }

    exportResults() {
        if (this.currentResults.available.length === 0 && this.currentResults.taken.length === 0) {
            this.typeMessage('ERROR: No results to export');
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
        a.download = `goblin-globe-scan-${timestamp}-${prompt}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.typeMessage('Results exported successfully');
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
    }

    typeMessage(message, speed = 30) {
        // This could be enhanced to show messages in a terminal log area
        console.log(`[GOBLIN_GLOBE] ${message}`);
    }

    formatErrorMessage(message) {
        // Format error messages for terminal display
        if (message.includes('rate limit') || message.includes('429')) {
            return 'Rate limit exceeded. Wait before retrying.';
        }
        
        if (message.includes('timeout') || message.includes('ENOTFOUND')) {
            return 'Connection timeout. Check network and retry.';
        }
        
        if (message.includes('401') || message.includes('403')) {
            return 'Authentication failed. Refresh and retry.';
        }
        
        if (message.includes('500')) {
            return 'Server error. Retry in a few moments.';
        }
        
        return message;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize terminal interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TerminalInterface();
});

// Add some terminal easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code or other terminal commands could be added here
    if (e.key === 'F12') {
        console.log(`
 ██████╗  ██████╗ ██████╗ ██╗     ██╗███╗   ██╗     ██████╗ ██╗      ██████╗ ██████╗ ███████╗
██╔════╝ ██╔═══██╗██╔══██╗██║     ██║████╗  ██║    ██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔════╝
██║  ███╗██║   ██║██████╔╝██║     ██║██╔██╗ ██║    ██║  ███╗██║     ██║   ██║██████╔╝█████╗  
██║   ██║██║   ██║██╔══██╗██║     ██║██║╚██╗██║    ██║   ██║██║     ██║   ██║██╔══██╗██╔══╝  
╚██████╔╝╚██████╔╝██████╔╝███████╗██║██║ ╚████║    ╚██████╔╝███████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝     ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝

Welcome to the Goblin Globe Terminal Interface!
Domain scanning with mathematical precision.
        `);
    }
});