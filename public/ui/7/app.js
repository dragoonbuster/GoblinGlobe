// Cyberdeck Hacker Terminal Interface for Goblin Globe Domain Finder
class CyberdeckTerminalInterface {
    constructor() {
        this.currentResults = { available: [], taken: [] };
        this.isLoading = false;
        this.spinnerChars = ['◢', '◣', '◤', '◥'];
        this.spinnerIndex = 0;
        this.spinnerInterval = null;
        this.networkUpdateInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startSystemTime();
        this.initializeCyberdeck();
        this.startNetworkMonitor();
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
        this.cpuUsage = document.getElementById('cpuUsage');
        this.memUsage = document.getElementById('memUsage');
        this.domainCount = document.getElementById('domainCount');
        this.latency = document.getElementById('latency');
        this.packets = document.getElementById('packets');
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

    initializeCyberdeck() {
        // Initialize cyberdeck systems
        this.typeCyberMessage("Cyberdeck terminal initialized. All systems nominal.", 50);
        
        // Focus on prompt input
        setTimeout(() => {
            this.promptInput.focus();
            this.activateSection('promptSection');
        }, 1000);
    }

    startNetworkMonitor() {
        // Simulate network activity updates
        this.networkUpdateInterval = setInterval(() => {
            // Update CPU usage (simulate fluctuation)
            const cpu = Math.floor(Math.random() * 30) + 40;
            this.cpuUsage.textContent = `${cpu}%`;
            this.cpuUsage.className = cpu > 80 ? 'status-value critical' : cpu > 60 ? 'status-value warning' : 'status-value';

            // Update memory usage
            const mem = Math.floor(Math.random() * 20) + 60;
            this.memUsage.textContent = `${mem}%`;
            this.memUsage.className = mem > 85 ? 'status-value critical' : mem > 70 ? 'status-value warning' : 'status-value';

            // Update latency
            const latency = Math.floor(Math.random() * 50) + 20;
            this.latency.textContent = `${latency}ms`;
            this.latency.style.color = latency > 100 ? 'var(--cyber-red)' : latency > 50 ? 'var(--cyber-orange)' : 'var(--cyber-green)';

            // Update packet count
            const packets = parseInt(this.packets.textContent) + Math.floor(Math.random() * 10) + 1;
            this.packets.textContent = packets;

        }, 2000);
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
            this.showError('ERROR: Target description required for domain acquisition');
            this.promptInput.focus();
            return;
        }
        
        if (extensions.length === 0) {
            this.showError('ERROR: At least one TLD target must be selected');
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
            this.updateProgress('Initializing cyberdeck protocols...', 0);
            await this.delay(500);
            
            // Step 2: Generate domains
            this.updateProgress('Accessing domain generation networks...', 10);
            this.updateProgressDetails('Establishing secure connection to AI networks...');
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, count, extensions })
            });
            
            // Step 3: Check availability
            this.updateProgress('Executing domain reconnaissance...', 50);
            this.updateProgressDetails('Running DNS queries and WHOIS lookups...');
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `SYSTEM ERROR ${response.status}`);
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Domain acquisition scan failed');
            }
            
            // Step 4: Process results
            this.updateProgress('Processing acquisition data...', 90);
            this.updateProgressDetails('Analyzing target availability and quality metrics...');
            await this.delay(500);
            
            // Step 5: Complete
            this.updateProgress('Scan sequence complete!', 100);
            this.updateProgressDetails('Results compiled and ready for review');
            await this.delay(1000);
            
            // Store and display results
            this.currentResults = data.results;
            this.displayResults(data.results, data.summary);
            
        } catch (error) {
            console.error('Cyberdeck scan error:', error);
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
            this.executeText.textContent = 'INITIATE SCAN';
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
        }, 150);
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
        this.domainCount.textContent = results.available.length + results.taken.length;
        
        // Update summary
        const totalScanned = results.available.length + results.taken.length;
        const availablePercent = totalScanned > 0 ? Math.round((results.available.length / totalScanned) * 100) : 0;
        
        this.scanSummary.innerHTML = `
            TOTAL_SCANNED: ${totalScanned} | 
            AVAILABLE: ${results.available.length} (${availablePercent}%) | 
            OCCUPIED: ${results.taken.length} (${100 - availablePercent}%) |
            STATUS: ACQUISITION_READY
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
        
        // Cyberdeck notification
        this.typeCyberMessage(`Domain acquisition scan complete. ${results.available.length} targets available for acquisition.`);
    }

    createDomainElement(item, isAvailable) {
        const div = document.createElement('div');
        div.className = 'domain-item';
        
        const domainSpan = document.createElement('span');
        domainSpan.className = 'domain-name';
        domainSpan.textContent = item.domain;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `domain-status ${isAvailable ? 'status-available' : 'status-taken'}`;
        statusSpan.textContent = isAvailable ? 'AVAILABLE' : 'OCCUPIED';
        
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
            registerBtn.textContent = 'ACQUIRE';
            registerBtn.addEventListener('click', () => {
                window.open(`https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`, '_blank');
            });
            actionsDiv.appendChild(registerBtn);
        }
        
        // Quality score display
        if (item.qualityScore && item.qualityGrade) {
            const qualitySpan = document.createElement('span');
            qualitySpan.style.color = 'var(--cyber-dim)';
            qualitySpan.style.fontSize = '10px';
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
        this.typeCyberMessage(`SYSTEM ERROR: ${message}`);
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
        this.domainCount.textContent = '0';
        
        this.typeCyberMessage('Buffer cleared. Cyberdeck ready for new domain acquisition.');
    }

    newScan() {
        this.clearForm();
        this.currentResults = { available: [], taken: [] };
    }

    async copyAvailable() {
        const availableDomains = this.currentResults.available.map(item => item.domain);
        
        if (availableDomains.length === 0) {
            this.typeCyberMessage('ERROR: No available targets to copy to buffer');
            return;
        }
        
        await this.copyToClipboard(availableDomains.join('\n'));
        this.typeCyberMessage(`Copied ${availableDomains.length} available targets to system clipboard`);
    }

    exportResults() {
        if (this.currentResults.available.length === 0 && this.currentResults.taken.length === 0) {
            this.typeCyberMessage('ERROR: No acquisition data to export');
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
                `"${item.domain}","Occupied","${item.qualityScore?.overall || 'N/A'}","${item.qualityGrade?.grade || 'N/A'}","${item.method}","N/A"`
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `cyberdeck-domain-scan-${timestamp}-${prompt}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.typeCyberMessage('Acquisition data exported to secure storage');
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
        
        // Function key handling
        if (e.key.startsWith('F') && e.key.length <= 3) {
            e.preventDefault();
            const funcKey = e.key.substring(1);
            this.typeCyberMessage(`Function key F${funcKey} activated - Feature not implemented`);
        }
    }

    typeCyberMessage(message, speed = 30) {
        // Enhanced cyberdeck-style message display
        console.log(`[CYBERDECK] ${message}`);
    }

    formatErrorMessage(message) {
        // Format error messages for cyberdeck display
        if (message.includes('rate limit') || message.includes('429')) {
            return 'Network rate limiting detected. Implement backoff protocol.';
        }
        
        if (message.includes('timeout') || message.includes('ENOTFOUND')) {
            return 'Network connection timeout. Check uplink status.';
        }
        
        if (message.includes('401') || message.includes('403')) {
            return 'Authentication failure. Verify access credentials.';
        }
        
        if (message.includes('500')) {
            return 'Remote server malfunction. Retry acquisition sequence.';
        }
        
        return message;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize cyberdeck terminal interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CyberdeckTerminalInterface();
});

// Cyberdeck easter eggs and function key handling
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
        console.log(`
 ██████╗  ██████╗ ██████╗ ██╗     ██╗███╗   ██╗     ██████╗ ██╗      ██████╗ ██████╗ ███████╗
██╔════╝ ██╔═══██╗██╔══██╗██║     ██║████╗  ██║    ██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔════╝
██║  ███╗██║   ██║██████╔╝██║     ██║██╔██╗ ██║    ██║  ███╗██║     ██║   ██║██████╔╝█████╗  
██║   ██║██║   ██║██╔══██╗██║     ██║██║╚██╗██║    ██║   ██║██║     ██║   ██║██╔══██╗██╔══╝  
╚██████╔╝╚██████╔╝██████╔╝███████╗██║██║ ╚████║    ╚██████╔╝███████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝     ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝

Welcome to the Goblin Globe Cyberdeck Interface!
Domain acquisition through advanced hacker protocols.
All your domains are belong to us.
        `);
    }
});