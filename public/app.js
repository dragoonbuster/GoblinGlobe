const form = document.getElementById('generateForm');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const availableList = document.getElementById('availableList');
const takenList = document.getElementById('takenList');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const prompt = document.getElementById('prompt').value;
    const count = parseInt(document.getElementById('count').value);
    const extensions = Array.from(document.querySelectorAll('input[name="extensions"]:checked'))
        .map(cb => cb.value);
    
    if (extensions.length === 0) {
        showError('Please select at least one extension');
        return;
    }
    
    // Show loading, hide others
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, count, extensions })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate domains');
        }
        
        displayResults(data.results);
    } catch (err) {
        showError(err.message);
    } finally {
        loading.classList.add('hidden');
    }
});

function displayResults(results) {
    availableList.innerHTML = '';
    takenList.innerHTML = '';
    
    if (results.available.length === 0 && results.taken.length === 0) {
        showError('No domains were generated. Please try again.');
        return;
    }
    
    // Display available domains
    results.available.forEach(item => {
        const div = createDomainCard(item.domain, true, item.method);
        availableList.appendChild(div);
    });
    
    // Display taken domains
    results.taken.forEach(item => {
        const div = createDomainCard(item.domain, false, item.method);
        takenList.appendChild(div);
    });
    
    // Show results section
    document.getElementById('results').classList.remove('hidden');
}

function createDomainCard(domain, isAvailable, method) {
    const div = document.createElement('div');
    div.className = `p-3 rounded-lg border ${
        isAvailable 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
    }`;
    
    const domainSpan = document.createElement('span');
    domainSpan.className = 'font-mono text-lg';
    domainSpan.textContent = domain;
    
    const methodSpan = document.createElement('span');
    methodSpan.className = 'text-xs text-gray-500 ml-2';
    methodSpan.textContent = `(${method})`;
    
    div.appendChild(domainSpan);
    div.appendChild(methodSpan);
    
    if (isAvailable) {
        const registerLink = document.createElement('a');
        registerLink.href = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
        registerLink.target = '_blank';
        registerLink.className = 'block mt-2 text-sm text-blue-600 hover:text-blue-800';
        registerLink.textContent = 'Register →';
        div.appendChild(registerLink);
    }
    
    return div;
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    results.classList.add('hidden');
}