// Navigation and Routing Logic

window.protectedToolPages = window.protectedToolPages || new Set([
    'pregnancy',
    'due-date-calculator',
    'pregnancy-tracker',
    'names',
    'baby-names',
    'courses',
    'account',
    'help-section',
    'baby-kick-counter',
    'kick-counter',
    'contraction-timer'
]);

const protectedToolPages = window.protectedToolPages;

const pageAliases = {
    'baby-names': 'names',
    'kick-counter': 'baby-kick-counter'
};

function navigateTo(pageId, options = {}) {
    const resolvedPageId = pageAliases[pageId] || pageId;
    console.log(`🔄 Navigating to page: ${resolvedPageId}`);
    
    // Remove active class from all pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(resolvedPageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update active nav
        const navLink = document.querySelector(`[data-page="${resolvedPageId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Page-specific initialization
        initializePage(resolvedPageId);
    } else {
        const isIndexPage = /(^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname.endsWith('/');
        if (!isIndexPage) {
            // Validate resolvedPageId contains only safe characters before using in URL
            const safePageId = encodeURIComponent(resolvedPageId);
            const targetUrl = new URL(`index.html#${safePageId}`, window.location.origin + window.location.pathname);
            // Only redirect to same origin
            if (targetUrl.origin === window.location.origin) {
                window.location.assign(targetUrl.toString());
            }
            return;
        }
        console.warn(`Page ${resolvedPageId} not found`);
        if (typeof showNotification === 'function') {
            showNotification('Page not found', 'error');
        }
    }
}

function initializePage(pageId) {
    console.log(`🔧 Initializing page: ${pageId}`);
    
    switch(pageId) {
        case 'home':
            // Initialize home page features
            if (typeof initializeHomeFeatures === 'function') {
                initializeHomeFeatures();
            }
            break;
            
        case 'baby-names':
            // Initialize baby name finder
            if (typeof initializeBabyNames === 'function') {
                initializeBabyNames();
            }
            break;
            
        case 'due-date-calculator':
            // Initialize due date calculator
            if (typeof initializeDueDateCalculator === 'function') {
                initializeDueDateCalculator();
            }
            break;
            
        case 'kick-counter':
            // Initialize kick counter
            if (typeof initializeKickCounter === 'function') {
                initializeKickCounter();
            }
            break;
            
        case 'contraction-timer':
            // Initialize contraction timer
            if (typeof initializeContractionTimer === 'function') {
                initializeContractionTimer();
            }
            break;
            
        case 'account':
            // Initialize account dashboard
            if (typeof initializeAccount === 'function') {
                initializeAccount();
            }
            break;
            
        default:
            console.log(`No specific initialization for page: ${pageId}`);
    }
}

// Popular Tools Navigation with Login Check
function navigateToTool(pageId) {
    navigateTo(pageId);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        protectedToolPages,
        navigateTo,
        initializePage,
        navigateToTool
    };
}
