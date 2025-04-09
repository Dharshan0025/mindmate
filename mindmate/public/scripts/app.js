// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    initFirebase();
    
    // Initialize the app
    initApp();
    
    // Set up service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
    
    // Check if the app is launched as a PWA
    window.addEventListener('appinstalled', () => {
        console.log('MindMate was installed as a PWA');
    });
    
    // Show install prompt for PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => {
            document.getElementById('install-prompt').classList.add('show');
        }, 5000);
    });
    
    document.getElementById('install-confirm').addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            document.getElementById('install-prompt').classList.remove('show');
        });
    });
    
    document.getElementById('install-cancel').addEventListener('click', () => {
        document.getElementById('install-prompt').classList.remove('show');
    });
});

function initApp() {
    // Set current date
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('entry-date').textContent = now.toLocaleDateString();
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const pageId = link.getAttribute('data-page') + '-page';
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active-page');
            });
            document.getElementById(pageId).classList.add('active-page');
        });
    });
    
    // Journal input modes
    const inputModes = document.querySelectorAll('.input-mode-btn');
    inputModes.forEach(btn => {
        btn.addEventListener('click', () => {
            inputModes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.getAttribute('data-mode') === 'text') {
                document.getElementById('entry-text').style.display = 'block';
                document.getElementById('voice-recorder').style.display = 'none';
            } else {
                document.getElementById('entry-text').style.display = 'none';
                document.getElementById('voice-recorder').style.display = 'block';
            }
        });
    });
    
    // Suggestion tabs
    const suggestionTabs = document.querySelectorAll('.suggestion-tabs .tab-btn');
    suggestionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            suggestionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabId = tab.getAttribute('data-tab');
            document.querySelectorAll('.suggestion-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelector(`.suggestion-content[data-tab="${tabId}"]`).classList.add('active');
        });
    });
    
    // Quick prompts in chatbot
    const quickPrompts = document.querySelectorAll('.quick-prompt');
    quickPrompts.forEach(prompt => {
        prompt.addEventListener('click', () => {
            const promptText = prompt.getAttribute('data-prompt');
            document.getElementById('chatbot-input-text').value = promptText;
        });
    });
    
    // Mood selector in community
    const moodOptions = document.querySelectorAll('.mood-options input[type="radio"]');
    moodOptions.forEach(option => {
        option.addEventListener('change', () => {
            // Update UI based on selected mood
        });
    });
    
    // Hide loading overlay when app is ready
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 1500);
    
    // Initialize other modules
    initJournal();
    initDashboard();
    initChatbot();
}

// Initialize journal functionality
function initJournal() {
    // This would be implemented in journal.js
}

// Initialize dashboard functionality
function initDashboard() {
    // This would be implemented in dashboard.js
}

// Initialize chatbot functionality
function initChatbot() {
    // This would be implemented in chatbot.js
}