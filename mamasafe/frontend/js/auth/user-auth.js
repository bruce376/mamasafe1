// User Authentication and Account Management

function isLoggedIn() {
    return localStorage.getItem('bc_logged_in') === 'true';
}

function setIntendedAccess(pageId, actionName = '') {
    if (!pageId) return;
    localStorage.setItem('bc_intended_page', pageId);
    if (actionName) {
        localStorage.setItem('bc_intended_action', actionName);
    }
}

function redirectToLoginForTool(pageId, actionName = '') {
    setIntendedAccess(pageId, actionName);
    if (typeof showNotification === 'function') {
        showNotification('Please log in to use this feature. You can still browse the page.', 'warning');
    }
    if (typeof window.syncGuestFeatureLock === 'function') {
        window.syncGuestFeatureLock();
    }
    return false;
}

function requireToolAccess(pageId, actionName = '') {
    if (isLoggedIn()) {
        return true;
    }
    return redirectToLoginForTool(pageId, actionName);
}

function resumeIntendedAccess() {
    const intendedPage = localStorage.getItem('bc_intended_page');
    const intendedAction = localStorage.getItem('bc_intended_action');
    
    localStorage.removeItem('bc_intended_page');
    localStorage.removeItem('bc_intended_action');
    
    if (intendedPage) {
        setTimeout(() => {
            navigateTo(intendedPage, { skipAuthCheck: true });
            if (intendedAction && typeof window[intendedAction] === 'function') {
                setTimeout(() => {
                    window[intendedAction]();
                }, 120);
            }
        }, 500);
    } else {
        setTimeout(() => navigateTo('home', { skipAuthCheck: true }), 1000);
    }
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    if (email && password) {
        localStorage.setItem('bc_logged_in', 'true');
        localStorage.setItem('bc_user_email', email);
        
        showNotification('Login successful!', 'success');
        
        // Close login modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        // Resume intended access or go to home
        resumeIntendedAccess();
        
        // Update UI
        updateLoginState();
    }
}

// Update login state in UI
function updateLoginState() {
    const isLoggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    
    // Update login/join/account/logout buttons
    const loginBtn = document.getElementById('loginBtn');
    const joinBtn = document.getElementById('joinBtn');
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (isLoggedIn && userEmail) {
        // Hide login/join buttons, show account/logout buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (joinBtn) joinBtn.style.display = 'none';
        if (accountBtn) accountBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userEmailDisplay) userEmailDisplay.textContent = userEmail;
        
        showAccountFeatures();
        showAccountBadges();
        updatePremiumContent();
        showWelcomeMessage(userEmail);
    } else {
        // Show login/join buttons, hide account/logout buttons
        if (loginBtn) loginBtn.style.display = 'block';
        if (joinBtn) joinBtn.style.display = 'block';
        if (accountBtn) accountBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userEmailDisplay) userEmailDisplay.textContent = '';
        
        hideAccountFeatures();
        hideAccountBadges();
        resetPremiumContent();
    }
}

// Show account-specific features
function showAccountFeatures() {
    console.log('Showing account features...');
    
    try {
        const accountFeatures = document.querySelectorAll('.account-feature');
        accountFeatures.forEach(feature => {
            feature.style.display = 'block';
        });
        
        // Show premium content sections
        const premiumSections = document.querySelectorAll('.premium-content');
        premiumSections.forEach(section => {
            section.style.display = 'block';
        });
        
        showNotification('Account features loaded', 'success');
    } catch (error) {
        console.error('Error showing account features:', error);
    }
}

// Hide account features when logged out
function hideAccountFeatures() {
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('has-access');
        link.title = '';
    });
    
    const accountFeatures = document.querySelectorAll('.account-feature');
    accountFeatures.forEach(feature => {
        feature.style.display = 'none';
    });
}

// Show account badges
function showAccountBadges() {
    const badges = document.querySelectorAll('.account-badge');
    badges.forEach(badge => badge.style.display = 'inline-block');
}

// Hide account badges
function hideAccountBadges() {
    const badges = document.querySelectorAll('.account-badge');
    badges.forEach(badge => badge.style.display = 'none');
}

// Update premium content - only show badges for items user has enrolled/saved
function updatePremiumContent() {
    try {
        const enrollments = JSON.parse(localStorage.getItem('bc_enrollments') || '[]');
        const courseIds = ['childbirth', 'breastfeeding', 'sleep', 'cpr', 'solids'];
        
        courseIds.forEach(courseId => {
            const badge = document.querySelector(`.enrolled-badge[data-course="${courseId}"]`);
            if (badge && enrollments.includes(courseId)) {
                badge.style.display = 'inline-block';
            }
        });
        
        // Show/hide premium features based on enrollment
        const premiumFeatures = document.querySelectorAll('.premium-feature');
        premiumFeatures.forEach(feature => {
            const requiredCourse = feature.dataset.requiredCourse;
            if (requiredCourse && enrollments.includes(requiredCourse)) {
                feature.style.display = 'block';
            }
        });
        
    } catch (error) {
        console.error('Error updating premium content:', error);
    }
}

// Reset premium content when logged out - remove enrolled badges only
function resetPremiumContent() {
    try {
        document.querySelectorAll('.enrolled-badge').forEach(badge => badge.remove());
    } catch (error) {
        console.error('Error resetting premium content:', error);
    }
}

// Show welcome message on home
function showWelcomeMessage(email) {
    const homeSection = document.getElementById('home');
    if (!homeSection || !email) return;
    homeSection.querySelectorAll('.welcome-banner').forEach(b => b.remove());
    
    const welcomeBanner = document.createElement('div');
    welcomeBanner.className = 'welcome-banner';

    // Use textContent to avoid XSS (CWE-94)
    const welcomeContent = document.createElement('div');
    welcomeContent.className = 'welcome-content';

    const heading = document.createElement('h3');
    heading.textContent = `Welcome back, ${email.split('@')[0]}!`;

    const para = document.createElement('p');
    para.textContent = 'Track your pregnancy journey and get personalized tips.';

    welcomeContent.appendChild(heading);
    welcomeContent.appendChild(para);
    welcomeBanner.appendChild(welcomeContent);
    
    const heroContent = homeSection.querySelector('.hero-content');
    if (heroContent) {
        heroContent.insertBefore(welcomeBanner, heroContent.firstChild);
    }
}

// Logout handler
function handleLogout() {
    // Use showNotification instead of confirm() to avoid alert-box warning
    if (typeof showNotification === 'function') {
        showNotification('Logging out...', 'info');
    }
    localStorage.removeItem('bc_logged_in');
    localStorage.removeItem('bc_user_email');
    localStorage.removeItem('bc_enrollments');
    
    showNotification('Logged out successfully', 'success');
    updateLoginState();
    navigateTo('home');
}

// Signup Handler
function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Simulate signup (in real app, this would be an API call)
    localStorage.setItem('bc_logged_in', 'true');
    localStorage.setItem('bc_user_email', email);
    
    showNotification('Account created successfully!', 'success');
    
    // Close signup modal
    const signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.style.display = 'none';
    }
    
    // Update UI
    updateLoginState();
    
    // Go to home page
    navigateTo('home');
}

// Show Join Modal
function showJoinModal() {
    if (typeof showNotification === 'function') {
        showNotification('Create your free account to track your pregnancy, join Birth Clubs, save baby names, and keep your care tools connected!', 'info');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isLoggedIn,
        setIntendedAccess,
        redirectToLoginForTool,
        requireToolAccess,
        resumeIntendedAccess,
        handleLogin,
        updateLoginState,
        showAccountFeatures,
        hideAccountFeatures,
        showAccountBadges,
        hideAccountBadges,
        updatePremiumContent,
        resetPremiumContent,
        showWelcomeMessage,
        handleLogout,
        handleSignup,
        showJoinModal
    };
}
