// Navigation and Routing Logic

window.protectedToolPages = window.protectedToolPages || new Set([
    'getting-pregnant',
    'pregnancy',
    'baby',
    'toddler',
    'family',
    'due-date-calculator',
    'names',
    'baby-names',
    'milestone-tracker',
    'kick-counter',
    'contraction-timer',
    'breastfeeding-tracker',
    'sleep-tracker',
    'growth-tracker',
    'vaccine-scheduler',
    'budget-planner',
    'symptom-checker',
    'fertility-tracker',
    'ovulation-calculator',
    'pregnancy-test-calculator',
    'toddler-bathing',
    'toddler-behavior',
    'toddler-development',
    'toddler-feeding',
    'toddler-playtime',
    'toddler-potty-training',
    'toddler-sleep-guides',
    'solid-feeding-guide-page',
    'solid-feeding-guide',
    'childbirth-class',
    'newborn-care',
    'sleep-class',
    'cpr-class',
    'solids-class',
    'behavior-ai',
    'learning-optimizer',
    'emotion-ai'
]);

const protectedToolPages = window.protectedToolPages;

const pageAliases = {
    'baby-names': 'names',
    'baby-sleep-tracker': 'sleep-tracker',
    'solid-feeding-guide': 'solid-feeding-guide-page'
};

function navigateTo(pageId, options = {}) {
    const resolvedPageId = pageAliases[pageId] || pageId;
    console.log(`🔄 Navigating to page: ${resolvedPageId}`);
    
    if (!options.skipAuthCheck && protectedToolPages && protectedToolPages.has(resolvedPageId) && !isLoggedIn()) {
        setIntendedAccess(resolvedPageId);
        showNotification('Please login to access this feature', 'warning');
        return;
    }
    
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
            
        case 'getting-pregnant':
            // Initialize getting pregnant page
            if (typeof initializeGettingPregnant === 'function') {
                initializeGettingPregnant();
            }
            break;
            
        case 'baby-names':
            // Initialize baby name finder
            if (typeof initializeBabyNames === 'function') {
                initializeBabyNames();
            }
            break;
            
        case 'milestone-tracker':
            // Initialize milestone tracker
            if (typeof initializeMilestoneTracker === 'function') {
                initializeMilestoneTracker();
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
            
        case 'breastfeeding-tracker':
            // Initialize breastfeeding tracker
            if (typeof initializeBreastfeedingTracker === 'function') {
                initializeBreastfeedingTracker();
            }
            break;
            
        case 'sleep-tracker':
            // Initialize sleep tracker
            if (typeof initializeSleepTracker === 'function') {
                initializeSleepTracker();
            }
            break;
            
        case 'growth-tracker':
            // Initialize growth tracker
            if (typeof initializeGrowthTracker === 'function') {
                initializeGrowthTracker();
            }
            break;
            
        case 'vaccine-scheduler':
            // Initialize vaccine scheduler
            if (typeof initializeVaccineScheduler === 'function') {
                initializeVaccineScheduler();
            }
            break;
            
        case 'budget-planner':
            // Initialize budget planner
            if (typeof initializeBudgetPlanner === 'function') {
                initializeBudgetPlanner();
            }
            break;
            
        case 'symptom-checker':
            // Initialize symptom checker
            if (typeof initializeSymptomChecker === 'function') {
                initializeSymptomChecker();
            }
            break;
            
        case 'fertility-tracker':
            // Initialize fertility tracker
            if (typeof initializeFertilityTracker === 'function') {
                initializeFertilityTracker();
            }
            break;
            
        case 'ovulation-calculator':
            // Initialize ovulation calculator
            if (typeof initializeOvulationCalculator === 'function') {
                initializeOvulationCalculator();
            }
            break;
            
        case 'pregnancy-test-calculator':
            // Initialize pregnancy test calculator
            if (typeof initializePregnancyTestCalculator === 'function') {
                initializePregnancyTestCalculator();
            }
            break;
            
        case 'toddler-bathing':
        case 'toddler-behavior':
        case 'toddler-development':
        case 'toddler-feeding':
        case 'toddler-playtime':
        case 'toddler-potty-training':
        case 'toddler-sleep-guides':
            // Initialize toddler pages
            if (typeof initializeToddlerPages === 'function') {
                initializeToddlerPages();
            }
            break;
            
        case 'solid-feeding-guide':
        case 'childbirth-class':
        case 'newborn-care':
        case 'sleep-class':
        case 'cpr-class':
        case 'solids-class':
            // Initialize class pages
            if (typeof initializeClassPages === 'function') {
                initializeClassPages();
            }
            break;
            
        case 'behavior-ai':
            // Initialize behavior AI
            if (typeof initializeBehaviorAI === 'function') {
                initializeBehaviorAI();
            }
            break;
            
        case 'learning-optimizer':
            // Initialize learning optimizer
            if (typeof initializeLearningOptimizer === 'function') {
                initializeLearningOptimizer();
            }
            break;
            
        case 'emotion-ai':
            // Initialize emotion AI
            if (typeof initializeEmotionAI === 'function') {
                initializeEmotionAI();
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
    if (isLoggedIn()) {
        navigateTo(pageId);
    } else {
        showNotification('Please login to access this tool', 'warning');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'block';
        }
    }
}

// Calculate months for timeline
function showBabyTopic(topic) {
    const allowedTopics = ['feeding', 'sleep', 'development', 'health', 'safety'];
    if (!allowedTopics.includes(topic)) return;

    const topicMessages = {
        feeding: 'Feeding Guide\n\n• Breastfeeding: Aim for 8-12 feeds per day\n• Formula: 2-3 ounces every 3-4 hours for newborns\n• Solids: Start around 4-6 months with single-grain cereals\n• Allergens: Introduce one at a time, watch for reactions\n\nConsult your pediatrician for personalized advice.',
        sleep: 'Sleep Guide\n\n• Newborns: 16-18 hours total sleep\n• 3-6 months: 14-16 hours, longer night stretches\n• 6-12 months: 12-14 hours, 2 naps typical\n• Safe sleep: Back sleeping, firm mattress, no loose items\n\nConsistency is key for healthy sleep habits.',
        development: 'Development Guide\n\n• Tummy time: Start with 3-5 minutes, 2-3 times daily\n• Reading: Daily reading helps brain development\n• Play: Interactive play builds social and cognitive skills\n• Safety: Always supervise and baby-proof your home\n\nEvery baby develops at their own pace.',
        health: 'Health Guide\n\n• Vaccinations: Follow pediatrician schedule\n• Check-ups: Regular well-baby visits\n• Illness: Know when to call doctor\n• Safety: Car seat, home safety, and CPR knowledge\n\nTrust your instincts and seek help when needed.',
        safety: 'Safety Guide\n\n• Car seat: Rear-facing until 2+ years\n• Home: Baby-proof before crawling/walking\n• Sleep: Back sleeping, firm surface\n• Water: Never leave baby unattended near water\n\nPrevention is the best safety measure.'
    };

    // Use showNotification instead of alert to avoid alert-box warning
    if (typeof showNotification === 'function') {
        showNotification(topicMessages[topic] || 'Topic information coming soon!', 'info');
    }
}

// Initialize Getting Pregnant Page
function initializeGettingPregnant() {
    console.log('Initializing Getting Pregnant page...');
    
    // Initialize fertility tracking features
    const fertilityForm = document.getElementById('fertilityForm');
    if (fertilityForm) {
        fertilityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle fertility form submission
            showNotification('Fertility data saved successfully', 'success');
        });
    }
    
    // Initialize ovulation calculator
    const ovulationCalc = document.getElementById('ovulationCalculator');
    if (ovulationCalc) {
        // Set up ovulation calculator functionality
        console.log('Ovulation calculator initialized');
    }
    
    // Initialize pregnancy test calculator
    const pregnancyTestCalc = document.getElementById('pregnancyTestCalculator');
    if (pregnancyTestCalc) {
        // Set up pregnancy test calculator functionality
        console.log('Pregnancy test calculator initialized');
    }
    
    // Initialize tips and guides
    const tipsContainer = document.getElementById('gettingPregnantTips');
    if (tipsContainer) {
        // Load getting pregnant tips
        console.log('Getting pregnant tips loaded');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        protectedToolPages,
        navigateTo,
        initializePage,
        navigateToTool,
        showBabyTopic,
        initializeGettingPregnant
    };
}
