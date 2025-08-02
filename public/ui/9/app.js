// Unix System Terminal Interface for Goblin Globe Domain Finder
class UnixTerminalInterface {
    constructor() {
        this.currentResults = { available: [], taken: [] };
        this.isLoading = false;
        this.selectedIndex = -1;
        this.allDomains = [];
        this.vimMode = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startSystemTime();
        this.initializeUnix();
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

        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressLabel = document.getElementById('progressLabel');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressDetails = document.getElementById('progressDetails');

        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.scanSummary = document.getElementById('scanSummary');
        this.availableTree = document.getElementById('availableTree');
        this.takenTree = document.getElementById('takenTree');
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
        this.systemUptime = document.getElementById('systemUptime');
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
            const bootTime = new Date(now.getTime() - Math.random() * 86400000); // Random uptime up to 24h
            const uptime = Math.floor((now - bootTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const days = Math.floor(hours / 24);
            
            const uptimeStr = days > 0 
                ? `${days} day${days !== 1 ? 's' : ''}, ${hours % 24}:${minutes.toString().padStart(2, '0')}`
                : `${hours}:${minutes.toString().padStart(2, '0')}`;
            
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
            this.systemUptime.textContent = `${timeStr} up ${uptimeStr}, 1 user, load average: 0.${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
        };
        
        updateTime();
        setInterval(updateTime, 30000); // Update every 30 seconds
    }

    initializeUnix() {
        // Unix-style initialization
        console.log("goblin-globe-domains: starting domain discovery service");
        console.log("initializing AI-powered domain generation...");
        console.log("DNS and WHOIS verification ready");
        
        // Focus on prompt input
        setTimeout(() => {
            this.promptInput.focus();
            this.activateSection('promptSection');
        }, 100);
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
            this.showError('error: domain description required');
            this.promptInput.focus();
            return;
        }
        
        if (extensions.length === 0) {
            this.showError('error: at least one extension must be specified');
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
            this.updateProgress('initializing scan process...', 0);
            await this.delay(300);
            
            // Step 2: Generate domains
            this.updateProgress('generating domain candidates...', 10);
            this.updateProgressDetails('connecting to AI generation service...');
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, count, extensions })
            });
            
            // Step 3: Check availability
            this.updateProgress('checking domain availability...', 50);
            this.updateProgressDetails('performing DNS lookups and WHOIS queries...');
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `http error ${response.status}`);
            }
            
            if (!data.success) {
                throw new Error(data.error || 'scan process failed');
            }
            
            // Step 4: Process results
            this.updateProgress('processing results...', 90);
            this.updateProgressDetails('analyzing domain quality metrics...');
            await this.delay(300);
            
            // Step 5: Complete
            this.updateProgress('scan complete', 100);
            this.updateProgressDetails('results compiled successfully');
            await this.delay(500);
            
            // Store and display results
            this.currentResults = data.results;
            this.displayResults(data.results, data.summary);
            
        } catch (error) {
            console.error('unix scan error:', error);
            this.showError(`scan error: ${this.formatErrorMessage(error.message)}`);
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.executeButton.disabled = true;
            this.executeText.textContent = 'running...';
            this.executeSpinner.classList.remove('hidden');
            this.progressSection.classList.add('active');
        } else {
            this.executeButton.disabled = false;
            this.executeText.textContent = 'execute';
            this.executeSpinner.classList.add('hidden');
            this.progressSection.classList.remove('active');
        }
    }

    updateProgress(message, percentage) {
        this.progressLabel.textContent = message;
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercent.textContent = `${percentage}%`;
    }

    updateProgressDetails(details) {
        this.progressDetails.textContent = details;
    }

    displayResults(results, summary) {
        this.clearResults();
        
        // Update counts
        this.availableCount.textContent = results.available.length;
        this.takenCount.textContent = results.taken.length;
        
        // Update summary
        const totalScanned = results.available.length + results.taken.length;
        const availablePercent = totalScanned > 0 ? Math.round((results.available.length / totalScanned) * 100) : 0;
        
        this.scanSummary.textContent = `scanned ${totalScanned} domains: ${results.available.length} available (${availablePercent}%), ${results.taken.length} taken (${100 - availablePercent}%)`;
        
        // Build combined domain list for vim navigation
        this.allDomains = [
            ...results.available.map(item => ({ ...item, available: true })),
            ...results.taken.map(item => ({ ...item, available: false }))
        ];
        
        // Display available domains
        results.available.forEach((item, index) => {
            const domainElement = this.createTreeItem(item, true, index);
            this.availableTree.appendChild(domainElement);
        });
        
        // Display taken domains
        results.taken.forEach((item, index) => {
            const domainElement = this.createTreeItem(item, false, results.available.length + index);
            this.takenTree.appendChild(domainElement);
        });
        
        // Show results section
        this.resultsSection.classList.add('active');
        
        // Enable vim-style navigation
        this.vimMode = true;
        this.selectedIndex = -1;
        
        // Scroll to results
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
        
        console.log(`goblin-globe-domains: scan complete, ${results.available.length} domains available`);
    }

    createTreeItem(item, isAvailable, globalIndex) {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.dataset.index = globalIndex;
        
        const prefix = document.createElement('span');
        prefix.className = 'tree-prefix';
        prefix.textContent = isAvailable ? '├─ ' : '├─ ';
        
        const domainSpan = document.createElement('span');
        domainSpan.className = 'domain-name';
        domainSpan.textContent = item.domain;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `domain-status ${isAvailable ? 'status-available' : 'status-taken'}`;
        statusSpan.textContent = isAvailable ? '[available]' : '[taken]';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'domain-actions';
        
        // Copy link
        const copyLink = document.createElement('a');
        copyLink.className = 'action-link';
        copyLink.textContent = 'copy';
        copyLink.href = '#';
        copyLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.copyToClipboard(item.domain);
        });
        
        actionsDiv.appendChild(copyLink);
        
        // Register link for available domains
        if (isAvailable) {
            const registerLink = document.createElement('a');
            registerLink.className = 'action-link';
            registerLink.textContent = 'register';
            registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`;
            registerLink.target = '_blank';
            registerLink.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            actionsDiv.appendChild(registerLink);
        }
        
        // Quality score display
        if (item.qualityScore && item.qualityGrade) {
            const qualitySpan = document.createElement('span');
            qualitySpan.style.color = 'var(--unix-gray)';
            qualitySpan.style.fontSize = '9px';
            qualitySpan.style.marginLeft = '8px';
            qualitySpan.textContent = `[${item.qualityGrade.grade}:${item.qualityScore.overall}]`;
            actionsDiv.appendChild(qualitySpan);
        }
        
        // Click handler
        div.addEventListener('click', () => {
            this.selectDomain(globalIndex);
        });
        
        div.appendChild(prefix);
        div.appendChild(domainSpan);
        div.appendChild(statusSpan);
        div.appendChild(actionsDiv);
        
        return div;
    }

    selectDomain(index) {
        // Remove previous selection
        document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
        
        // Select new domain
        const domainElement = document.querySelector(`[data-index="${index}"]`);
        if (domainElement) {
            domainElement.classList.add('selected');
            this.selectedIndex = index;
            
            // Scroll into view if needed
            domainElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    clearResults() {
        this.availableTree.innerHTML = '';
        this.takenTree.innerHTML = '';
        this.allDomains = [];
        this.selectedIndex = -1;
        this.vimMode = false;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.classList.add('active');
        console.error(`goblin-globe-domains: ${message}`);
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
        
        console.log('goblin-globe-domains: form cleared');
    }

    newScan() {
        this.clearForm();
        this.currentResults = { available: [], taken: [] };
    }

    async copyAvailable() {
        const availableDomains = this.currentResults.available.map(item => item.domain);
        
        if (availableDomains.length === 0) {
            this.showError('error: no available domains to copy');
            return;
        }
        
        await this.copyToClipboard(availableDomains.join('\n'));
        console.log(`goblin-globe-domains: copied ${availableDomains.length} domains to clipboard`);
        
        // Brief feedback
        const originalText = this.copyButton.textContent;
        this.copyButton.textContent = 'copied';
        setTimeout(() => {
            this.copyButton.textContent = originalText;
        }, 1000);
    }

    exportResults() {
        if (this.currentResults.available.length === 0 && this.currentResults.taken.length === 0) {
            this.showError('error: no results to export');
            return;
        }
        
        const timestamp = new Date().toISOString().split('T')[0];
        const prompt = this.promptInput.value.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        
        // Create CSV content
        const csvContent = [
            'domain,status,quality_score,quality_grade,method,register_url',
            ...this.currentResults.available.map(item => 
                `${item.domain},available,${item.qualityScore?.overall || 'n/a'},${item.qualityGrade?.grade || 'n/a'},${item.method},https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`
            ),
            ...this.currentResults.taken.map(item => 
                `${item.domain},taken,${item.qualityScore?.overall || 'n/a'},${item.qualityGrade?.grade || 'n/a'},${item.method},n/a`
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `goblin-globe-domains-${timestamp}-${prompt}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('goblin-globe-domains: results exported successfully');
        
        // Brief feedback
        const originalText = this.exportButton.textContent;
        this.exportButton.textContent = 'exported';
        setTimeout(() => {
            this.exportButton.textContent = originalText;
        }, 1000);
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
        // Vim-style navigation when in results
        if (this.vimMode && this.allDomains.length > 0) {
            switch (e.key) {
                case 'j':
                    e.preventDefault();
                    this.navigateDown();
                    return;
                case 'k':
                    e.preventDefault();
                    this.navigateUp();
                    return;
                case 'Enter':
                    if (this.selectedIndex >= 0) {
                        e.preventDefault();
                        const domain = this.allDomains[this.selectedIndex];
                        if (domain.available) {
                            window.open(`https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}`, '_blank');
                        }
                    }
                    return;
                case 'y':
                    if (this.selectedIndex >= 0) {
                        e.preventDefault();
                        const domain = this.allDomains[this.selectedIndex];
                        this.copyToClipboard(domain.domain);
                        console.log(`copied: ${domain.domain}`);
                    }
                    return;
                case 'q':
                    e.preventDefault();
                    this.clearForm();
                    return;
            }
        }
        
        // Global keyboard shortcuts
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
            this.vimMode = false;
            this.selectedIndex = -1;
            document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
        }
    }

    navigateDown() {
        if (this.allDomains.length === 0) return;
        
        const nextIndex = this.selectedIndex + 1;
        if (nextIndex < this.allDomains.length) {
            this.selectDomain(nextIndex);
        }
    }

    navigateUp() {
        if (this.allDomains.length === 0) return;
        
        const prevIndex = this.selectedIndex - 1;
        if (prevIndex >= 0) {
            this.selectDomain(prevIndex);
        } else if (this.selectedIndex === -1 && this.allDomains.length > 0) {
            // Start from the last item
            this.selectDomain(this.allDomains.length - 1);
        }
    }

    formatErrorMessage(message) {
        // Format error messages for unix display
        if (message.includes('rate limit') || message.includes('429')) {
            return 'rate limit exceeded, retry after delay';
        }
        
        if (message.includes('timeout') || message.includes('ENOTFOUND')) {
            return 'network timeout, check connection';
        }
        
        if (message.includes('401') || message.includes('403')) {
            return 'authentication failed';
        }
        
        if (message.includes('500')) {
            return 'internal server error';
        }
        
        return message.toLowerCase();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize unix terminal interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UnixTerminalInterface();
});

// Unix startup message
console.log(`
goblin-globe-domains(1)                User Commands                goblin-globe-domains(1)

NAME
       goblin-globe-domains - intelligent domain name discovery utility

SYNOPSIS
       goblin-globe-domains [options] description

DESCRIPTION
       This utility generates and checks domain name availability using AI-powered
       generation with DNS and WHOIS verification.

VERSION
       goblin-globe-domains 1.0.0

COPYRIGHT
       Copyright © 2024 Goblin Globe Systems
       License: MIT

SEE ALSO
       dig(1), whois(1), nslookup(1)
`);