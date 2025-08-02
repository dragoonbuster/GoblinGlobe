// Material Design 3 Domain Finder App
class DomainFinderApp {
    constructor() {
        this.currentData = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initRippleEffects();
        this.initScrollFab();
        this.setupAccessibility();
    }

    // Initialize ripple effects for interactive elements
    initRippleEffects() {
        const rippleElements = document.querySelectorAll('.md-button, .md-card, .md-checkbox, .md-fab');
        
        rippleElements.forEach(element => {
            element.addEventListener('click', this.createRipple.bind(this));
        });
    }

    // Create Material Design ripple effect
    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('md-ripple');

        const ripple = button.getElementsByClassName('md-ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);

        // Clean up after animation
        setTimeout(() => {
            if (circle.parentNode) {
                circle.remove();
            }
        }, 600);
    }

    // Initialize scroll-to-top FAB
    initScrollFab() {
        const fab = document.getElementById('scrollToTopFab');
        
        fab.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide FAB based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                fab.classList.remove('hidden');
            } else {
                fab.classList.add('hidden');
            }
        });
    }

    // Setup accessibility features
    setupAccessibility() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('md-checkbox-input')) {
                e.target.click();
            }
        });

        // Focus management for modals and dynamic content
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('md-text-field-input')) {
                e.target.parentElement.classList.add('focused');
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('md-text-field-input')) {
                e.target.parentElement.classList.remove('focused');
            }
        });
    }

    // Bind event listeners
    bindEvents() {
        const form = document.getElementById('generateForm');
        const exportBtn = document.getElementById('exportBtn');
        const copyAllBtn = document.getElementById('copyAllBtn');
        const newSearchBtn = document.getElementById('newSearchBtn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateDomains();
        });

        exportBtn.addEventListener('click', () => this.exportCSV());
        copyAllBtn.addEventListener('click', () => this.copyAvailableDomains());
        newSearchBtn.addEventListener('click', () => this.resetForm());
    }

    // Generate domains with enhanced loading states
    async generateDomains() {
        if (this.isLoading) return;

        const form = document.getElementById('generateForm');
        const formData = new FormData(form);
        const prompt = formData.get('prompt');
        const count = parseInt(formData.get('count'));
        const extensions = formData.getAll('extensions');

        if (!prompt.trim()) {
            this.showSnackbar('Please enter a domain description', 'error');
            return;
        }

        if (extensions.length === 0) {
            this.showSnackbar('Please select at least one extension', 'error');
            return;
        }

        this.setLoadingState(true);
        this.hideResults();

        try {
            // Step 1: Generate domain ideas
            this.updateLoadingMessage('Generating domain ideas...', 1, 3);
            const generateResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, count, extensions })
            });

            if (!generateResponse.ok) {
                throw new Error(`Generation failed: ${generateResponse.statusText}`);
            }

            const { domains } = await generateResponse.json();

            // Step 2: Check availability
            this.updateLoadingMessage('Checking domain availability...', 2, 3);
            const checkResponse = await fetch('/api/check-domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domains })
            });

            if (!checkResponse.ok) {
                throw new Error(`Availability check failed: ${checkResponse.statusText}`);
            }

            const results = await checkResponse.json();

            // Step 3: Process results
            this.updateLoadingMessage('Processing results...', 3, 3);
            await this.delay(500); // Brief pause for better UX

            this.currentData = results;
            this.displayResults(results);
            this.showSnackbar(`Found ${results.available.length} available domains!`, 'success');

        } catch (error) {
            console.error('Generation error:', error);
            this.showError(error.message);
            this.showSnackbar('Failed to generate domains. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    // Enhanced loading state management
    setLoadingState(loading) {
        this.isLoading = loading;
        const button = document.getElementById('generateButton');
        const buttonText = document.getElementById('buttonText');
        const buttonSpinner = document.getElementById('buttonSpinner');
        const loadingSection = document.getElementById('loading');

        if (loading) {
            button.disabled = true;
            buttonText.textContent = 'Generating...';
            buttonSpinner.classList.remove('hidden');
            loadingSection.classList.remove('hidden');
            button.setAttribute('aria-busy', 'true');
        } else {
            button.disabled = false;
            buttonText.textContent = 'Generate Domains';
            buttonSpinner.classList.add('hidden');
            loadingSection.classList.add('hidden');
            button.setAttribute('aria-busy', 'false');
        }
    }

    // Update loading message with progress
    updateLoadingMessage(message, step, totalSteps) {
        const loadingMessage = document.getElementById('loadingMessage');
        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        loadingMessage.textContent = message;
        progressBar.classList.remove('hidden');
        progressText.classList.remove('hidden');
        
        const progressPercent = (step / totalSteps) * 100;
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `Step ${step} of ${totalSteps}`;
    }

    // Display results with Material Design cards
    displayResults(data) {
        const resultsSection = document.getElementById('results');
        const availableList = document.getElementById('availableList');
        const takenList = document.getElementById('takenList');

        // Clear previous results
        availableList.innerHTML = '';
        takenList.innerHTML = '';

        // Display available domains
        if (data.available && data.available.length > 0) {
            data.available.forEach(domain => {
                availableList.appendChild(this.createDomainCard(domain, true));
            });
        } else {
            availableList.innerHTML = '<p class="body-large text-center" style="color: var(--md-sys-color-on-surface-variant); grid-column: 1 / -1;">No available domains found</p>';
        }

        // Display taken domains
        if (data.taken && data.taken.length > 0) {
            data.taken.forEach(domain => {
                takenList.appendChild(this.createDomainCard(domain, false));
            });
        } else {
            takenList.innerHTML = '<p class="body-large text-center" style="color: var(--md-sys-color-on-surface-variant); grid-column: 1 / -1;">No taken domains in results</p>';
        }

        resultsSection.classList.remove('hidden');
        
        // Smooth scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);
    }

    // Create Material Design domain card
    createDomainCard(domain, isAvailable) {
        const card = document.createElement('div');
        card.className = `md-card ${isAvailable ? 'available' : 'taken'} domain-card`;
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Domain ${domain.name} is ${isAvailable ? 'available' : 'taken'}`);

        const statusClass = isAvailable ? 'available' : 'taken';
        const statusText = isAvailable ? 'Available' : 'Taken';
        const scoreText = domain.score ? `Score: ${domain.score}/10` : '';
        const methodText = domain.checkMethod ? `via ${domain.checkMethod}` : '';

        card.innerHTML = `
            <div class="domain-name">${domain.name}</div>
            <div class="domain-meta">
                <span class="domain-status ${statusClass}">${statusText}</span>
                ${scoreText ? `<span class="domain-score">${scoreText}</span>` : ''}
            </div>
            ${methodText ? `<div class="body-small" style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px;">${methodText}</div>` : ''}
            ${isAvailable ? `
                <div class="domain-actions">
                    <button class="md-button md-button-text" onclick="app.copyDomain('${domain.name}')" aria-label="Copy ${domain.name}">
                        <span class="material-symbols-rounded">content_copy</span>
                        Copy
                    </button>
                    <a href="https://www.namecheap.com/domains/registration/results/?domain=${domain.name}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="md-button md-button-filled"
                       aria-label="Register ${domain.name} on Namecheap">
                        <span class="material-symbols-rounded">open_in_new</span>
                        Register
                    </a>
                </div>
            ` : ''}
        `;

        // Add staggered animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, Math.random() * 200);

        return card;
    }

    // Copy individual domain
    copyDomain(domain) {
        navigator.clipboard.writeText(domain).then(() => {
            this.showSnackbar(`Copied ${domain} to clipboard`, 'success');
        }).catch(() => {
            this.showSnackbar('Failed to copy domain', 'error');
        });
    }

    // Copy all available domains
    copyAvailableDomains() {
        if (!this.currentData || !this.currentData.available.length) {
            this.showSnackbar('No available domains to copy', 'error');
            return;
        }

        const domains = this.currentData.available.map(d => d.name).join('\\n');
        navigator.clipboard.writeText(domains).then(() => {
            this.showSnackbar(`Copied ${this.currentData.available.length} domains to clipboard`, 'success');
        }).catch(() => {
            this.showSnackbar('Failed to copy domains', 'error');
        });
    }

    // Export results to CSV
    exportCSV() {
        if (!this.currentData) {
            this.showSnackbar('No data to export', 'error');
            return;
        }

        const allDomains = [
            ...this.currentData.available.map(d => ({ ...d, status: 'Available' })),
            ...this.currentData.taken.map(d => ({ ...d, status: 'Taken' }))
        ];

        const csv = [
            'Domain,Status,Score,Check Method',
            ...allDomains.map(d => 
                `"${d.name}","${d.status}","${d.score || 'N/A'}","${d.checkMethod || 'N/A'}"`
            )
        ].join('\\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goblin-globe-domains-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.showSnackbar('Domain list exported successfully', 'success');
    }

    // Reset form for new search
    resetForm() {
        document.getElementById('generateForm').reset();
        document.getElementById('count').value = '10';
        document.querySelector('input[value=".com"]').checked = true;
        this.hideResults();
        this.hideError();
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('prompt').focus();
        }, 500);
    }

    // Show Material Design snackbar
    showSnackbar(message, type = 'info') {
        const container = document.getElementById('snackbarContainer');
        
        const snackbar = document.createElement('div');
        snackbar.className = 'md-snackbar';
        snackbar.setAttribute('role', 'alert');
        snackbar.setAttribute('aria-live', 'polite');
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        messageSpan.className = 'body-medium';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<span class="material-symbols-rounded">close</span>';
        closeButton.className = 'md-button md-button-text';
        closeButton.style.minWidth = 'auto';
        closeButton.style.padding = '8px';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        snackbar.appendChild(messageSpan);
        snackbar.appendChild(closeButton);
        
        // Apply type-specific styling
        if (type === 'error') {
            snackbar.style.backgroundColor = 'var(--md-sys-color-error-container)';
            snackbar.style.color = 'var(--md-sys-color-on-error-container)';
        } else if (type === 'success') {
            snackbar.style.backgroundColor = 'var(--md-sys-color-tertiary-container)';
            snackbar.style.color = 'var(--md-sys-color-on-tertiary-container)';
        }
        
        container.appendChild(snackbar);
        
        // Show snackbar
        setTimeout(() => snackbar.classList.add('show'), 100);
        
        // Auto-hide after 4 seconds
        const hideTimeout = setTimeout(() => this.hideSnackbar(snackbar), 4000);
        
        // Manual close
        closeButton.addEventListener('click', () => {
            clearTimeout(hideTimeout);
            this.hideSnackbar(snackbar);
        });
    }

    // Hide snackbar with animation
    hideSnackbar(snackbar) {
        snackbar.classList.remove('show');
        setTimeout(() => {
            if (snackbar.parentNode) {
                snackbar.remove();
            }
        }, 300);
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.querySelector('p').textContent = message;
        errorDiv.classList.remove('hidden');
    }

    // Hide error message
    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    // Hide results section
    hideResults() {
        document.getElementById('results').classList.add('hidden');
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DomainFinderApp();
});

// Service Worker registration for enhanced performance (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but app continues to work
        });
    });
}

// Enhanced accessibility: Skip to main content
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && e.shiftKey && document.activeElement === document.body) {
        e.preventDefault();
        document.getElementById('prompt').focus();
    }
});

// Theme detection and dynamic color adaptation
function updateThemeColors() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeColors);
updateThemeColors();

// Performance optimization: Intersection Observer for lazy loading animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.md-card').forEach(card => {
        observer.observe(card);
    });
};

// Call after DOM updates
document.addEventListener('DOMContentLoaded', observeElements);