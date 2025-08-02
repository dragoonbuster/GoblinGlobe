class SurrealDomainFinder {
    constructor() {
        this.form = document.getElementById('domainForm');
        this.loadingElement = document.getElementById('loading');
        this.resultsElement = document.getElementById('results');
        this.dreamSequences = [
            "Melting through the digital dreamscape...",
            "Consulting the oracle of infinite domains...",
            "Bending the fabric of cyberspace...",
            "Summoning domains from the void...",
            "Dancing with the impossible mathematics of DNS...",
            "Painting reality with liquid domain names...",
            "Traversing the labyrinth of availability...",
            "Weaving dreams into digital existence..."
        ];
        
        this.init();
        this.startSurrealEffects();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addRealTimeValidation();
        this.createFloatingElements();
    }
    
    addRealTimeValidation() {
        const searchInput = document.getElementById('searchTerm');
        
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Surreal character morphing effect
            if (value.length > 0) {
                this.morphInputBackground(searchInput, value);
            }
            
            // Real-time domain preview
            if (value.length >= 3) {
                this.showDreamPreview(value);
            }
        });
        
        searchInput.addEventListener('focus', () => {
            this.addMeltingEffect(searchInput);
        });
        
        searchInput.addEventListener('blur', () => {
            this.removeMeltingEffect(searchInput);
        });
    }
    
    morphInputBackground(input, value) {
        const intensity = Math.min(value.length / 10, 1);
        const hue = (value.length * 47) % 360;
        
        input.style.background = `linear-gradient(45deg, 
            hsl(${hue}, 70%, 95%), 
            hsl(${(hue + 60) % 360}, 70%, 98%))`;
        input.style.transform = `scale(${1 + intensity * 0.05}) perspective(500px) rotateX(${intensity * 5}deg)`;
    }
    
    addMeltingEffect(element) {
        element.style.transition = 'all 0.5s ease';
        element.style.borderRadius = '25px 5px 25px 5px';
        element.style.transform = 'perspective(500px) rotateX(10deg) scaleY(1.1)';
    }
    
    removeMeltingEffect(element) {
        element.style.borderRadius = '15px';
        element.style.transform = 'scale(1) perspective(500px) rotateX(0deg)';
    }
    
    showDreamPreview(term) {
        const tld = document.getElementById('tld').value;
        const previewElement = document.querySelector('.dream-preview');
        
        if (previewElement) {
            previewElement.remove();
        }
        
        const preview = document.createElement('div');
        preview.className = 'dream-preview';
        preview.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.9);
            padding: 0.5rem;
            border-radius: 0 0 15px 15px;
            font-size: 0.9rem;
            color: #666;
            backdrop-filter: blur(5px);
            animation: dreamFade 0.5s ease-in;
            z-index: 100;
        `;
        
        preview.innerHTML = `Dreaming: <strong>${term}${tld}</strong>`;
        
        const formGroup = document.querySelector('.form-group');
        formGroup.style.position = 'relative';
        formGroup.appendChild(preview);
        
        // Add keyframe animation
        if (!document.querySelector('#dreamFadeStyle')) {
            const style = document.createElement('style');
            style.id = 'dreamFadeStyle';
            style.textContent = `
                @keyframes dreamFade {
                    from { opacity: 0; transform: translateY(-10px) rotateX(90deg); }
                    to { opacity: 1; transform: translateY(0) rotateX(0deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const searchTerm = document.getElementById('searchTerm').value.trim();
        const selectedTld = document.getElementById('tld').value;
        
        if (!searchTerm) {
            this.showSurrealError('The dream realm requires a vision to manifest...');
            return;
        }
        
        this.startSurrealLoading();
        this.clearResults();
        
        try {
            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTerm: searchTerm,
                    tld: selectedTld
                })
            });
            
            if (!response.ok) {
                throw new Error(`Reality distortion detected: ${response.status}`);
            }
            
            const data = await response.json();
            this.displaySurrealResults(data.suggestions || []);
            
        } catch (error) {
            console.error('Surreal error:', error);
            this.showSurrealError('The dream realm has become unstable. Reality is temporarily unavailable.');
        } finally {
            this.stopSurrealLoading();
        }
    }
    
    startSurrealLoading() {
        const button = document.querySelector('.generate-btn');
        button.disabled = true;
        button.style.background = 'linear-gradient(45deg, #95a5a6, #7f8c8d)';
        button.textContent = 'Manifesting...';
        
        this.loadingElement.style.display = 'block';
        this.cycleDreamSequences();
    }
    
    cycleDreamSequences() {
        let index = 0;
        this.dreamInterval = setInterval(() => {
            this.loadingElement.textContent = this.dreamSequences[index];
            this.loadingElement.style.transform = `scale(${1 + Math.sin(Date.now() / 500) * 0.1}) rotateZ(${Math.sin(Date.now() / 1000) * 3}deg)`;
            index = (index + 1) % this.dreamSequences.length;
        }, 2000);
    }
    
    stopSurrealLoading() {
        const button = document.querySelector('.generate-btn');
        button.disabled = false;
        button.style.background = 'linear-gradient(45deg, #e74c3c, #f39c12)';
        button.textContent = 'Manifest Domains';
        
        this.loadingElement.style.display = 'none';
        if (this.dreamInterval) {
            clearInterval(this.dreamInterval);
        }
    }
    
    displaySurrealResults(suggestions) {
        this.resultsElement.innerHTML = '';
        
        if (suggestions.length === 0) {
            this.showSurrealError('The dream realm is empty. Try a different vision...');
            return;
        }
        
        suggestions.forEach((suggestion, index) => {
            setTimeout(() => {
                this.createSurrealDomainElement(suggestion, index);
            }, index * 200);
        });
    }
    
    createSurrealDomainElement(suggestion, index) {
        const domainDiv = document.createElement('div');
        domainDiv.className = 'domain-result';
        
        // Add unique surreal transformations
        const transforms = [
            'perspective(1000px) rotateX(5deg) rotateY(2deg)',
            'perspective(1000px) rotateX(-3deg) rotateY(-5deg)',
            'perspective(1000px) rotateX(7deg) rotateY(3deg)',
            'perspective(1000px) rotateX(-2deg) rotateY(-1deg)'
        ];
        
        domainDiv.style.transform = transforms[index % transforms.length];
        domainDiv.style.animationDelay = `${index * 0.1}s`;
        
        const domainName = document.createElement('div');
        domainName.className = 'domain-name';
        domainName.textContent = suggestion.domain;
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'domain-status checking';
        statusDiv.textContent = 'Consulting Reality...';
        
        domainDiv.appendChild(domainName);
        domainDiv.appendChild(statusDiv);
        this.resultsElement.appendChild(domainDiv);
        
        // Add surreal hover effects
        domainDiv.addEventListener('mouseenter', () => {
            this.addSurrealHoverEffect(domainDiv, index);
        });
        
        domainDiv.addEventListener('mouseleave', () => {
            this.removeSurrealHoverEffect(domainDiv);
        });
        
        // Check availability with surreal timing
        setTimeout(() => {
            this.checkDomainAvailability(suggestion.domain, statusDiv);
        }, 1000 + Math.random() * 2000);
    }
    
    addSurrealHoverEffect(element, index) {
        const effects = [
            'perspective(1000px) rotateX(15deg) scale(1.05) rotateZ(2deg)',
            'perspective(1000px) rotateY(20deg) scale(1.08) skewX(5deg)',
            'perspective(1000px) rotateX(-10deg) rotateY(15deg) scale(1.06)',
            'perspective(1000px) rotateZ(5deg) scale(1.07) rotateX(8deg)'
        ];
        
        element.style.transform = effects[index % effects.length];
        element.style.filter = `hue-rotate(${index * 60}deg) saturate(1.2)`;
        
        // Add melting effect to text
        const domainName = element.querySelector('.domain-name');
        if (domainName) {
            domainName.style.transform = 'scaleY(1.1) skewX(2deg)';
            domainName.style.textShadow = '2px 2px 8px rgba(0,0,0,0.3)';
        }
    }
    
    removeSurrealHoverEffect(element) {
        element.style.transform = '';
        element.style.filter = '';
        
        const domainName = element.querySelector('.domain-name');
        if (domainName) {
            domainName.style.transform = '';
            domainName.style.textShadow = '1px 1px 2px rgba(0,0,0,0.1)';
        }
    }
    
    async checkDomainAvailability(domain, statusElement) {
        try {
            const response = await fetch(`/api/check/${encodeURIComponent(domain)}`);
            const data = await response.json();
            
            // Surreal transition effect
            statusElement.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            statusElement.style.transform = 'scale(0.8) rotateX(180deg)';
            
            setTimeout(() => {
                if (data.available) {
                    statusElement.className = 'domain-status available';
                    statusElement.textContent = 'Available in This Reality';
                    statusElement.style.animation = 'statusGlow 3s ease-in-out infinite, levitate 4s ease-in-out infinite';
                } else {
                    statusElement.className = 'domain-status taken';
                    statusElement.textContent = 'Claimed by Another Dreamer';
                    statusElement.style.animation = 'statusGlow 3s ease-in-out infinite';
                }
                
                statusElement.style.transform = 'scale(1) rotateX(0deg)';
            }, 500);
            
        } catch (error) {
            console.error('Availability check error:', error);
            statusElement.className = 'domain-status taken';
            statusElement.textContent = 'Reality Unclear';
            statusElement.style.transform = 'scale(1) rotateX(0deg)';
        }
    }
    
    showSurrealError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'surreal-error';
        errorDiv.style.cssText = `
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 20px;
            text-align: center;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(231, 76, 60, 0.3);
            animation: errorMorph 2s ease-in-out infinite;
            transform: perspective(500px) rotateX(10deg);
        `;
        
        errorDiv.textContent = message;
        this.resultsElement.innerHTML = '';
        this.resultsElement.appendChild(errorDiv);
        
        // Add error morphing animation
        if (!document.querySelector('#errorMorphStyle')) {
            const style = document.createElement('style');
            style.id = 'errorMorphStyle';
            style.textContent = `
                @keyframes errorMorph {
                    0%, 100% { 
                        border-radius: 20px;
                        transform: perspective(500px) rotateX(10deg) scale(1);
                    }
                    50% { 
                        border-radius: 50px 10px;
                        transform: perspective(500px) rotateX(-5deg) scale(1.02);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove error after delay
        setTimeout(() => {
            errorDiv.style.animation = 'fadeOut 1s ease-in';
            setTimeout(() => errorDiv.remove(), 1000);
        }, 5000);
    }
    
    clearResults() {
        this.resultsElement.innerHTML = '';
        
        // Remove dream preview
        const preview = document.querySelector('.dream-preview');
        if (preview) {
            preview.remove();
        }
    }
    
    createFloatingElements() {
        // Create additional surreal floating elements
        this.createFloatingNumbers();
        this.createMorphingShapes();
        this.createImpossibleGeometry();
    }
    
    createFloatingNumbers() {
        const numbers = ['404', '∞', 'π', '√-1', '42'];
        
        numbers.forEach((num, index) => {
            const numElement = document.createElement('div');
            numElement.textContent = num;
            numElement.style.cssText = `
                position: absolute;
                font-size: 2rem;
                font-weight: bold;
                color: rgba(52, 73, 94, 0.3);
                pointer-events: none;
                z-index: 1;
                animation: floatNumber 8s ease-in-out infinite;
                animation-delay: ${index * 1.5}s;
                top: ${20 + index * 15}%;
                left: ${10 + index * 20}%;
            `;
            
            document.body.appendChild(numElement);
        });
        
        // Add floating number animation
        if (!document.querySelector('#floatNumberStyle')) {
            const style = document.createElement('style');
            style.id = 'floatNumberStyle';
            style.textContent = `
                @keyframes floatNumber {
                    0%, 100% { 
                        transform: translateY(0px) rotateZ(0deg) scale(1);
                        opacity: 0.3;
                    }
                    25% { 
                        transform: translateY(-30px) rotateZ(10deg) scale(1.2);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translateY(-10px) rotateZ(-5deg) scale(0.8);
                        opacity: 0.4;
                    }
                    75% { 
                        transform: translateY(-25px) rotateZ(15deg) scale(1.1);
                        opacity: 0.7;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createMorphingShapes() {
        const shapes = ['◆', '▲', '●', '■', '★'];
        
        shapes.forEach((shape, index) => {
            const shapeElement = document.createElement('div');
            shapeElement.textContent = shape;
            shapeElement.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                color: rgba(155, 89, 182, 0.4);
                pointer-events: none;
                z-index: 1;
                animation: morphShape 6s ease-in-out infinite;
                animation-delay: ${index * 0.8}s;
                top: ${60 + index * 8}%;
                right: ${5 + index * 15}%;
            `;
            
            document.body.appendChild(shapeElement);
        });
        
        // Add morphing shape animation
        if (!document.querySelector('#morphShapeStyle')) {
            const style = document.createElement('style');
            style.id = 'morphShapeStyle';
            style.textContent = `
                @keyframes morphShape {
                    0%, 100% { 
                        transform: scale(1) rotateZ(0deg);
                        filter: hue-rotate(0deg);
                    }
                    33% { 
                        transform: scale(1.5) rotateZ(120deg);
                        filter: hue-rotate(120deg);
                    }
                    66% { 
                        transform: scale(0.7) rotateZ(240deg);
                        filter: hue-rotate(240deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createImpossibleGeometry() {
        const geometry = document.createElement('div');
        geometry.style.cssText = `
            position: absolute;
            bottom: 5%;
            left: 5%;
            width: 60px;
            height: 60px;
            border: 3px solid rgba(52, 73, 94, 0.4);
            animation: impossibleRotate 10s linear infinite;
            z-index: 1;
        `;
        
        geometry.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                border: 2px solid rgba(231, 76, 60, 0.6);
                transform: translate(-50%, -50%) rotateZ(45deg);
                animation: impossibleRotate 7s linear infinite reverse;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                background: rgba(243, 156, 18, 0.5);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: impossibleRotate 5s linear infinite;
            "></div>
        `;
        
        document.body.appendChild(geometry);
        
        // Add impossible rotation animation
        if (!document.querySelector('#impossibleRotateStyle')) {
            const style = document.createElement('style');
            style.id = 'impossibleRotateStyle';
            style.textContent = `
                @keyframes impossibleRotate {
                    0% { transform: rotateZ(0deg) rotateY(0deg); }
                    50% { transform: rotateZ(180deg) rotateY(180deg); }
                    100% { transform: rotateZ(360deg) rotateY(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    startSurrealEffects() {
        // Periodic reality distortions
        setInterval(() => {
            this.distortReality();
        }, 15000);
        
        // Mouse movement effects
        document.addEventListener('mousemove', (e) => {
            this.handleMouseDream(e);
        });
        
        // Periodic color shifts
        this.startColorShifting();
    }
    
    distortReality() {
        const container = document.querySelector('.container');
        const originalTransform = container.style.transform;
        
        container.style.transition = 'transform 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        container.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(3deg) scale(0.98)';
        
        setTimeout(() => {
            container.style.transform = originalTransform;
        }, 2000);
    }
    
    handleMouseDream(e) {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        const title = document.querySelector('.title');
        if (title) {
            title.style.transform = `perspective(1000px) rotateX(${y * 5}deg) rotateY(${x * 5}deg)`;
            title.style.textShadow = `${x * 10}px ${y * 10}px 0px #e74c3c, ${x * 20}px ${y * 20}px 0px #f39c12`;
        }
        
        // Move floating elements based on mouse
        const floatingElements = document.querySelectorAll('.floating-object');
        floatingElements.forEach((element, index) => {
            const factor = (index + 1) * 0.1;
            element.style.transform = `translate(${x * 20 * factor}px, ${y * 20 * factor}px)`;
        });
    }
    
    startColorShifting() {
        let hue = 0;
        setInterval(() => {
            hue = (hue + 1) % 360;
            document.documentElement.style.setProperty('--dream-hue', hue);
        }, 100);
    }
}

// Initialize the surreal domain finder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SurrealDomainFinder();
});