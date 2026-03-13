// Navigation System
function navigateTo(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (pageId === 'home' && localStorage.getItem('bc_logged_in') === 'true') {
            showWelcomeMessage(localStorage.getItem('bc_user_email'));
        }
        if (pageId === 'names') renderNames(currentNames || namesData);
        if (pageId === 'registry') loadRegistryState();
        if (pageId === 'babble') {
            initializeBabbleGame();
            // Enhanced babble initialization
            setTimeout(() => {
                if (typeof initializeCategories === 'function') {
                    initializeCategories();
                }
            }, 100);
        }
    }
    
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
}

// Popular Tools Navigation with Login Check
function navigateToTool(pageId) {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('bc_logged_in') === 'true';
    
    if (isLoggedIn) {
        // User is logged in, navigate directly to the tool
        navigateTo(pageId);
    } else {
        // User is not logged in, redirect to login page
        // Store the intended destination for after login
        localStorage.setItem('bc_intended_page', pageId);
        navigateTo('login');
        
        // Show a message explaining why they need to login
        setTimeout(() => {
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                font-size: 14px;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            `;
            message.innerHTML = `
                <strong>🔐 Login Required</strong><br>
                Please log in or sign up to access this premium feature.
            `;
            document.body.appendChild(message);
            
            // Remove message after 4 seconds
            setTimeout(() => {
                message.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => message.remove(), 300);
            }, 4000);
        }, 500);
    }
}

// Home Due Date Calculator
function calculateHomeDueDate() {
    const lastPeriod = document.getElementById('homeLastPeriod').value;
    const cycleLength = parseInt(document.getElementById('homeCycleLength').value);
    
    if (!lastPeriod) {
        alert('Please enter the first day of your last period');
        return;
    }
    
    const date = new Date(lastPeriod);
    const dueDate = new Date(date);
    dueDate.setDate(date.getDate() + 280 + (cycleLength - 28));
    
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('homeDueDate').textContent = dueDate.toLocaleDateString('en-US', options);
    document.getElementById('homeWeeks').textContent = weeks > 0 ? weeks : 0;
    document.getElementById('homeResult').classList.add('show');
}

// Show Join Modal
function showJoinModal() {
    alert('Welcome to BabyCenter!\n\nCreate your free account to:\n• Track your pregnancy week by week\n• Join Birth Clubs\n• Save baby names\n• Create your registry\n• Get personalized newsletters');
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    console.log('Login attempt started:', { email, password: '***', rememberMe });
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    console.log('Login successful:', { email, rememberMe });
    
    // Show success message
    alert(`Welcome back, ${email}!\n\nYou are now logged in to BabyCenter.`);
    
    // Clear form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('rememberMe').checked = false;
    
    // Set logged in state and navigate to home after successful login
    try {
        localStorage.setItem('bc_logged_in', 'true');
        localStorage.setItem('bc_user_email', email);
        localStorage.setItem('bc_login_time', new Date().toISOString());
    } catch (e) {
        console.warn('Could not persist login state:', e);
    }
    
    // Update UI to show logged in state
    updateLoginState();
    
    // Check if there's an intended page to navigate to
    const intendedPage = localStorage.getItem('bc_intended_page');
    if (intendedPage) {
        // Clear the intended page and navigate to it
        localStorage.removeItem('bc_intended_page');
        setTimeout(() => navigateTo(intendedPage), 1000);
    } else {
        // No intended page, go to home
        setTimeout(() => navigateTo('home'), 1000);
    }
}

// Update login state in UI
function updateLoginState() {
    const isLoggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    
    // Update header buttons
    const loginBtn = document.querySelector('.login-btn');
    const joinBtn = document.querySelector('.join-btn');
    
    if (isLoggedIn && userEmail) {
        if (loginBtn) {
            loginBtn.textContent = 'My Account';
            loginBtn.onclick = () => navigateTo('account');
        }
        if (joinBtn) {
            joinBtn.textContent = 'Logout';
            joinBtn.onclick = handleLogout;
        }
        
        // Show premium features and account-specific content
        showAccountFeatures();
        updatePremiumContent();
        
        // Show welcome message in home
        showWelcomeMessage(userEmail);
        
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => navigateTo('login');
        }
        if (joinBtn) {
            joinBtn.textContent = 'Sign Up';
            joinBtn.onclick = () => navigateTo('signup');
        }
        
        // Hide premium features
        hideAccountFeatures();
        resetPremiumContent();
    }
}

// Show account-specific features
function showAccountFeatures() {
    console.log('Showing account features...');
    
    try {
        // Add account indicators to navigation
        const navLinks = document.querySelectorAll('.main-nav a');
        console.log('Found navigation links:', navLinks.length);
        
        navLinks.forEach(link => {
            if (link.getAttribute('data-page')) {
                link.classList.add('has-access');
                link.title = 'Full access - Click to explore';
                console.log('Added access to:', link.getAttribute('data-page'));
            }
        });
        
        // Show account badges
        showAccountBadges();
        console.log('Account badges shown');
        
        // Update premium content
        updatePremiumContent();
        console.log('Premium content updated');
        
        // Show welcome message in home
        const userEmail = localStorage.getItem('bc_user_email');
        if (userEmail) showWelcomeMessage(userEmail);
        console.log('Welcome message shown for:', userEmail);
        
    } catch (error) {
        console.error('Error in showAccountFeatures:', error);
        alert('There was an error loading your account features. Please refresh the page.');
    }
}

// Hide account features when logged out
function hideAccountFeatures() {
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('has-access');
        link.title = '';
    });
    
    // Hide account badges
    hideAccountBadges();
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
        const courseIds = ['childbirth', 'breastfeeding', 'newborn', 'sleep', 'cpr', 'solids'];
        
        courseIds.forEach((id, index) => {
            const card = document.querySelectorAll('.course-card')[index];
            if (!card) return;
            const isEnrolled = enrollments.some(e => e.id === id);
            let badge = card.querySelector('.enrolled-badge');
            if (isEnrolled && !badge) {
                badge = document.createElement('span');
                badge.className = 'enrolled-badge';
                badge.textContent = 'Enrolled';
                badge.style.cssText = 'background: #28a745; color: white; padding:4px 8px; border-radius: 12px; font-size: 11px; position: absolute; top: 10px; right: 10px;';
                card.style.position = 'relative';
                card.appendChild(badge);
            } else if (!isEnrolled && badge) {
                badge.remove();
            }
        });
        
        // Update registry checkboxes from saved state
        const savedRegistry = JSON.parse(localStorage.getItem('bc_registry_checked') || '{}');
        document.querySelectorAll('.checklist-item').forEach((item, i) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && savedRegistry[checkbox.id] !== undefined) {
                checkbox.checked = savedRegistry[checkbox.id];
                item.classList.toggle('checked', checkbox.checked);
            }
        });
        updateProgress();
    } catch (error) {
        console.error('Error in updatePremiumContent:', error);
    }
}

// Reset premium content when logged out - remove enrolled badges only
function resetPremiumContent() {
    try {
        document.querySelectorAll('.enrolled-badge').forEach(badge => badge.remove());
    } catch (error) {
        console.error('Error in resetPremiumContent:', error);
    }
}

// Show welcome message on home
function showWelcomeMessage(email) {
    const homeSection = document.getElementById('home');
    if (!homeSection || !email) return;
    homeSection.querySelectorAll('.welcome-banner').forEach(b => b.remove());
    if (homeSection.classList.contains('active')) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-banner';
        welcomeDiv.innerHTML = `
            <div class="welcome-content">
                <span class="welcome-icon">👋</span>
                <div>
                    <strong>Welcome back, ${email}!</strong>
                    <p>You have full access to all BabyCenter features</p>
                </div>
                <button class="close-welcome" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
        
        // Insert after hero section
        const hero = homeSection.querySelector('.hero');
        if (hero) {
            hero.insertAdjacentElement('afterend', welcomeDiv);
        }
    }
}

// Logout handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('bc_logged_in');
        localStorage.removeItem('bc_user_email');
        localStorage.removeItem('bc_login_time');
        updateLoginState();
        alert('You have been logged out successfully.');
        navigateTo('home');
    }
}

// Signup Handler
function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const dueDate = document.getElementById('dueDate').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate signup (in real app, this would be an API call)
    console.log('Signup attempt:', { firstName, lastName, email, dueDate });
    
    // Show success message
    alert(`Welcome to BabyCenter, ${firstName}!\n\nYour account has been created successfully.\n\nYou can now:\n• Track your pregnancy\n• Join Birth Clubs\n• Save baby names\n• Create your registry`);
    
    // Clear form
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('agreeTerms').checked = false;
    
    // Set logged in state and navigate to home after successful signup
    try {
        localStorage.setItem('bc_logged_in', 'true');
        localStorage.setItem('bc_user_email', email);
    } catch (e) {
        console.warn('Could not persist signup state:', e);
    }
    updateLoginState();
    setTimeout(() => navigateTo('home'), 1000);
}

// Baby Names Data
const namesData = [
    { name: 'Liam', gender: 'boy', meaning: 'Strong-willed warrior', origin: 'Irish' },
    { name: 'Olivia', gender: 'girl', meaning: 'Olive tree', origin: 'Latin' },
    { name: 'Noah', gender: 'boy', meaning: 'Rest, comfort', origin: 'Hebrew' },
    { name: 'Emma', gender: 'girl', meaning: 'Universal', origin: 'German' },
    { name: 'Oliver', gender: 'boy', meaning: 'Olive tree', origin: 'Latin' },
    { name: 'Ava', gender: 'girl', meaning: 'Life', origin: 'Latin' },
    { name: 'Elijah', gender: 'boy', meaning: 'My God is Yahweh', origin: 'Hebrew' },
    { name: 'Charlotte', gender: 'girl', meaning: 'Free woman', origin: 'French' },
    { name: 'James', gender: 'boy', meaning: 'Supplanter', origin: 'Hebrew' },
    { name: 'Amelia', gender: 'girl', meaning: 'Work', origin: 'German' },
    { name: 'William', gender: 'boy', meaning: 'Resolute protector', origin: 'German' },
    { name: 'Sophia', gender: 'girl', meaning: 'Wisdom', origin: 'Greek' },
    { name: 'Benjamin', gender: 'boy', meaning: 'Son of right hand', origin: 'Hebrew' },
    { name: 'Isabella', gender: 'girl', meaning: 'Devoted to God', origin: 'Hebrew' },
    { name: 'Lucas', gender: 'boy', meaning: 'Light-giving', origin: 'Latin' },
    { name: 'Mia', gender: 'girl', meaning: 'Mine', origin: 'Italian' },
    { name: 'Henry', gender: 'boy', meaning: 'Ruler of home', origin: 'German' },
    { name: 'Harper', gender: 'unisex', meaning: 'Harp player', origin: 'English' },
    { name: 'Alexander', gender: 'boy', meaning: 'Defender of men', origin: 'Greek' },
    { name: 'Evelyn', gender: 'girl', meaning: 'Wished for child', origin: 'English' },
    { name: 'Mason', gender: 'boy', meaning: 'Stone worker', origin: 'English' },
    { name: 'Abigail', gender: 'girl', meaning: 'Father\'s joy', origin: 'Hebrew' },
    { name: 'Michael', gender: 'boy', meaning: 'Who is like God', origin: 'Hebrew' },
    { name: 'Emily', gender: 'girl', meaning: 'Rival', origin: 'Latin' },
    { name: 'Ethan', gender: 'boy', meaning: 'Strong, firm', origin: 'Hebrew' },
    { name: 'Ella', gender: 'girl', meaning: 'Beautiful fairy', origin: 'English' },
    { name: 'Daniel', gender: 'boy', meaning: 'God is my judge', origin: 'Hebrew' },
    { name: 'Elizabeth', gender: 'girl', meaning: 'God is my oath', origin: 'Hebrew' },
    { name: 'Jacob', gender: 'boy', meaning: 'Supplanter', origin: 'Hebrew' },
    { name: 'Camila', gender: 'girl', meaning: 'Young ceremonial attendant', origin: 'Latin' },
    { name: 'Logan', gender: 'unisex', meaning: 'Little hollow', origin: 'Scottish' },
    { name: 'Avery', gender: 'unisex', meaning: 'Ruler of elves', origin: 'English' },
    { name: 'Jackson', gender: 'boy', meaning: 'Son of Jack', origin: 'English' },
    { name: 'Sofia', gender: 'girl', meaning: 'Wisdom', origin: 'Greek' },
    { name: 'Aria', gender: 'girl', meaning: 'Air, song', origin: 'Italian' },
    { name: 'Aiden', gender: 'boy', meaning: 'Little fire', origin: 'Irish' },
    { name: 'Scarlett', gender: 'girl', meaning: 'Red', origin: 'English' },
    { name: 'Matthew', gender: 'boy', meaning: 'Gift of God', origin: 'Hebrew' },
    { name: 'Victoria', gender: 'girl', meaning: 'Victory', origin: 'Latin' },
    { name: 'Samuel', gender: 'boy', meaning: 'Told by God', origin: 'Hebrew' },
    { name: 'Madison', gender: 'unisex', meaning: 'Son of Matthew', origin: 'English' },
    { name: 'David', gender: 'boy', meaning: 'Beloved', origin: 'Hebrew' },
    { name: 'Luna', gender: 'girl', meaning: 'Moon', origin: 'Latin' },
    { name: 'Joseph', gender: 'boy', meaning: 'He will add', origin: 'Hebrew' },
    { name: 'Grace', gender: 'girl', meaning: 'God\'s grace', origin: 'Latin' },
    { name: 'Carter', gender: 'boy', meaning: 'Transporter of goods', origin: 'English' },
    { name: 'Chloe', gender: 'girl', meaning: 'Blooming', origin: 'Greek' },
    { name: 'Owen', gender: 'boy', meaning: 'Young warrior', origin: 'Welsh' },
    { name: 'Penelope', gender: 'girl', meaning: 'Weaver', origin: 'Greek' },
    { name: 'Wyatt', gender: 'boy', meaning: 'Brave in war', origin: 'English' },
    { name: 'Layla', gender: 'girl', meaning: 'Night', origin: 'Arabic' },
    { name: 'John', gender: 'boy', meaning: 'God is gracious', origin: 'Hebrew' },
    { name: 'Riley', gender: 'unisex', meaning: 'Courageous', origin: 'Irish' },
    { name: 'Julian', gender: 'boy', meaning: 'Youthful', origin: 'Latin' },
    { name: 'Ariana', gender: 'girl', meaning: 'Most holy', origin: 'Greek' },
    { name: 'Roman', gender: 'boy', meaning: 'From Rome', origin: 'Latin' },
    { name: 'Vivian', gender: 'girl', meaning: 'Alive', origin: 'Latin' },
    { name: 'Nolan', gender: 'boy', meaning: 'Champion', origin: 'Irish' },
    { name: 'Natalie', gender: 'girl', meaning: 'Born on Christmas', origin: 'Latin' },
    { name: 'Easton', gender: 'boy', meaning: 'East-facing place', origin: 'English' },
    { name: 'Hannah', gender: 'girl', meaning: 'Grace', origin: 'Hebrew' },
    { name: 'Brooklyn', gender: 'unisex', meaning: 'Water, stream', origin: 'English' },
    { name: 'Axel', gender: 'boy', meaning: 'Father of peace', origin: 'Scandinavian' },
    { name: 'Leilani', gender: 'girl', meaning: 'Heavenly flowers', origin: 'Hawaiian' },
    { name: 'Jeremiah', gender: 'boy', meaning: 'Exalted by God', origin: 'Hebrew' },
    { name: 'River', gender: 'unisex', meaning: 'Flowing body of water', origin: 'English' },
    { name: 'Remi', gender: 'unisex', meaning: 'Oarsman', origin: 'French' },
    { name: 'Rowan', gender: 'unisex', meaning: 'Little redhead', origin: 'Irish' },
    { name: 'Sage', gender: 'unisex', meaning: 'Wise one', origin: 'Latin' },
    { name: 'Phoenix', gender: 'unisex', meaning: 'Dark red', origin: 'Greek' },
    { name: 'Eden', gender: 'unisex', meaning: 'Place of pleasure', origin: 'Hebrew' },
    { name: 'Dakota', gender: 'unisex', meaning: 'Friendly one', origin: 'Native American' },
    { name: 'Reese', gender: 'unisex', meaning: 'Enthusiasm', origin: 'Welsh' },
    { name: 'Taylor', gender: 'unisex', meaning: 'Tailor', origin: 'English' },
    { name: 'Morgan', gender: 'unisex', meaning: 'Sea circle', origin: 'Welsh' },
    { name: 'Jordan', gender: 'unisex', meaning: 'To flow down', origin: 'Hebrew' },
    { name: 'Casey', gender: 'unisex', meaning: 'Brave in battle', origin: 'Irish' },
    { name: 'Rory', gender: 'unisex', meaning: 'Red king', origin: 'Irish' },
    { name: 'Emerson', gender: 'unisex', meaning: 'Son of Emery', origin: 'English' },
    { name: 'Finley', gender: 'unisex', meaning: 'Fair-haired hero', origin: 'Irish' },
    { name: 'Hayden', gender: 'unisex', meaning: 'Heathen', origin: 'English' },
    { name: 'Kai', gender: 'unisex', meaning: 'Sea', origin: 'Hawaiian' },
    { name: 'Tatum', gender: 'unisex', meaning: 'Cheerful', origin: 'English' },
    { name: 'Sawyer', gender: 'unisex', meaning: 'Woodcutter', origin: 'English' },
    { name: 'Parker', gender: 'unisex', meaning: 'Park keeper', origin: 'English' },
    { name: 'Drew', gender: 'unisex', meaning: 'Strong and manly', origin: 'Welsh' },
    { name: 'Alexis', gender: 'unisex', meaning: 'Defender', origin: 'Greek' },
    { name: 'Kendall', gender: 'unisex', meaning: 'Valley of River Kent', origin: 'English' },
    { name: 'Piper', gender: 'unisex', meaning: 'Pipe player', origin: 'English' },
    { name: 'Spencer', gender: 'unisex', meaning: 'Dispenser of provisions', origin: 'English' },
    { name: 'Dallas', gender: 'unisex', meaning: 'Skilled', origin: 'Scottish' }
];

let currentNames = [...namesData];
let currentFilter = 'all';

// Registry Items
const registryItems = [
    {
        category: 'Nursery Essentials',
        icon: '🛏️',
        items: ['Crib or bassinet', 'Crib mattress', 'Waterproof mattress pads', 'Swaddling blankets', 'Changing table', 'Baby monitor', 'Night light', 'Rocking chair or glider']
    },
    {
        category: 'Feeding Supplies',
        icon: '🍼',
        items: ['Bottles (4-8)', 'Bottle brush', 'Breast pump', 'Nursing pillows', 'Burp cloths (8-10)', 'Bibs (10-12)', 'Formula (if not breastfeeding)', 'Bottle sterilizer']
    },
    {
        category: 'Diapering',
        icon: '🧷',
        items: ['Diapers (newborn and size 1)', 'Baby wipes', 'Changing pads', 'Diaper rash cream', 'Diaper bag', 'Wipe warmer (optional)', 'Diaper pail']
    },
    {
        category: 'Bathing & Grooming',
        icon: '🛁',
        items: ['Infant bathtub', 'Hooded towels (2-3)', 'Washcloths (4-6)', 'Baby shampoo/body wash', 'Baby lotion', 'Nail clippers', 'Soft hair brush', 'Thermometer']
    },
    {
        category: 'Clothing',
        icon: '👕',
        items: ['Onesies (5-7)', 'Sleepers (5-7)', 'Hats (2-3)', 'Socks/booties (4-6 pairs)', 'Mittens (2-3 pairs)', 'Going-home outfit', 'Jackets or sweaters (2-3)']
    },
    {
        category: 'Health & Safety',
        icon: '🏥',
        items: ['First aid kit', 'Infant pain reliever', 'Gas relief drops', 'Nasal aspirator', 'Baby-proofing kit', 'Outlet covers', 'Cabinet locks']
    },
    {
        category: 'Travel Gear',
        icon: '🚗',
        items: ['Infant car seat', 'Stroller', 'Baby carrier or wrap', 'Portable crib or pack \'n play', 'Sun shade for car', 'Backseat mirror']
    },
    {
        category: 'Playtime & Development',
        icon: '🧸',
        items: ['Soft books', 'Rattles', 'Play mat', 'Bouncer seat', 'Swing', 'Teething toys', 'Soft blocks']
    }
];

// Generate Pregnancy Weeks
function generateWeeks() {
    const first = document.getElementById('firstTrimester');
    const second = document.getElementById('secondTrimester');
    const third = document.getElementById('thirdTrimester');
    
    for (let i = 1; i <= 13; i++) {
        first.innerHTML += createWeekBadge(i);
    }
    for (let i = 14; i <= 27; i++) {
        second.innerHTML += createWeekBadge(i);
    }
    for (let i = 28; i <= 42; i++) {
        third.innerHTML += createWeekBadge(i);
    }
}

function createWeekBadge(week) {
    return `
        <div class="week-badge" onclick="showWeekInfo(${week})">
            <strong>${week}</strong>
            <span>weeks</span>
        </div>
    `;
}

// Enhanced Ovulation Calculator
function calculateOvulation() {
    const date = document.getElementById('ovulationDate').value;
    const cycle = parseInt(document.getElementById('ovulationCycle').value);
    
    if (!date) {
        showNotification('Please enter a date', 'error');
        return;
    }
    
    const lastPeriod = new Date(date);
    const ovulation = new Date(lastPeriod);
    ovulation.setDate(lastPeriod.getDate() + (cycle - 14));
    
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);
    
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycle);
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const shortOptions = { month: 'short', day: 'numeric' };
    
    document.getElementById('fertileWindow').textContent = 
        `${fertileStart.toLocaleDateString('en-US', shortOptions)} - ${fertileEnd.toLocaleDateString('en-US', shortOptions)}`;
    document.getElementById('ovulationDay').textContent = ovulation.toLocaleDateString('en-US', shortOptions);
    document.getElementById('nextPeriod').textContent = nextPeriod.toLocaleDateString('en-US', options);
    
    // Save to localStorage
    const ovulationData = {
        lastPeriod: date,
        cycleLength: cycle,
        ovulationDate: ovulation.toISOString(),
        fertileWindow: {
            start: fertileStart.toISOString(),
            end: fertileEnd.toISOString()
        },
        nextPeriod: nextPeriod.toISOString()
    };
    localStorage.setItem('bc_ovulation_data', JSON.stringify(ovulationData));
    
    document.getElementById('ovulationResult').classList.add('show');
    showNotification('Fertility window calculated successfully!', 'success');
}

function scrollToCalc() {
    document.getElementById('ovulationCalc').scrollIntoView({ behavior: 'smooth' });
}

// Fertility Tracker Functions
function showFertilityTracker() {
    document.getElementById('fertilityTrackerModal').style.display = 'flex';
    // Set today's date as default
    document.getElementById('trackerDate').value = new Date().toISOString().split('T')[0];
    loadFertilityData();
}

function closeFertilityTracker() {
    document.getElementById('fertilityTrackerModal').style.display = 'none';
}

function saveFertilityData() {
    const date = document.getElementById('trackerDate').value;
    const temperature = document.querySelector('input[step="0.1"]').value;
    const mucus = document.querySelector('select').value;
    const symptoms = [];
    
    document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
        symptoms.push(checkbox.parentElement.textContent.trim());
    });
    
    const fertilityEntry = {
        date,
        temperature,
        mucus,
        symptoms,
        timestamp: new Date().toISOString()
    };
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem('bc_fertility_tracker') || '[]');
    existingData.push(fertilityEntry);
    localStorage.setItem('bc_fertility_tracker', JSON.stringify(existingData));
    
    showNotification('Fertility data saved successfully!', 'success');
    updateTrackerChart();
}

function loadFertilityData() {
    const data = JSON.parse(localStorage.getItem('bc_fertility_tracker') || '[]');
    updateTrackerChart();
}

function updateTrackerChart() {
    const data = JSON.parse(localStorage.getItem('bc_fertility_tracker') || '[]');
    const chartDiv = document.getElementById('trackerChart');
    
    if (data.length === 0) {
        chartDiv.innerHTML = '<p>No data yet. Start tracking to see your fertility pattern!</p>';
        return;
    }
    
    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Simple chart visualization
    let chartHTML = '<div class="mini-chart">';
    data.slice(-7).forEach(entry => {
        const temp = entry.temperature || '--';
        const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartHTML += `
            <div class="chart-day">
                <div class="chart-date">${date}</div>
                <div class="chart-temp">${temp}°</div>
                <div class="chart-mucus">${entry.mucus || '--'}</div>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartDiv.innerHTML = chartHTML;
}

// Pregnancy Test Calculator
function showPregnancyTest() {
    document.getElementById('pregnancyTestModal').style.display = 'flex';
}

function closePregnancyTest() {
    document.getElementById('pregnancyTestModal').style.display = 'none';
}

function calculateTestDate() {
    const ovulationDate = document.getElementById('ovulationDateTest').value;
    
    if (!ovulationDate) {
        showNotification('Please enter ovulation date', 'error');
        return;
    }
    
    const ovulation = new Date(ovulationDate);
    const earliestTest = new Date(ovulation);
    earliestTest.setDate(ovulation.getDate() + 10);
    
    const bestTest = new Date(ovulation);
    bestTest.setDate(ovulation.getDate() + 14);
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    
    document.getElementById('earliestTest').textContent = earliestTest.toLocaleDateString('en-US', options);
    document.getElementById('bestTest').textContent = bestTest.toLocaleDateString('en-US', options);
    
    document.getElementById('testResult').classList.add('show');
    showNotification('Test dates calculated!', 'success');
}

// Resource Functions
function showFertilityDiet() {
    showNotification('Fertility Diet Guide coming soon!', 'info');
}

function showPreconceptionHealth() {
    showNotification('Preconception Health Guide coming soon!', 'info');
}

function showFertilityTreatments() {
    showNotification('Fertility Treatments Guide coming soon!', 'info');
}

function showStressManagement() {
    showNotification('Stress Management Guide coming soon!', 'info');
}

function showAgeFertility() {
    showNotification('Age & Fertility Guide coming soon!', 'info');
}

function showPartnerHealth() {
    showNotification('Partner Fertility Guide coming soon!', 'info');
}

function showConceptionCalculator() {
    showNotification('Conception Date Calculator coming soon!', 'info');
}

function showPregnancySymptoms() {
    showNotification('Early Pregnancy Symptoms Guide coming soon!', 'info');
}

function showBabyCosts() {
    showNotification('Baby Costs Calculator coming soon!', 'info');
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Baby Names Functions
function renderNames(names) {
    const container = document.getElementById('namesList');
    if (!container) return;
    const favs = [];
    try { favs.push(...JSON.parse(localStorage.getItem('bc_favorite_names') || '[]')); } catch (e) {}
    container.innerHTML = names.map(n => {
        const isFav = favs.includes(n.name);
        const favClass = isFav ? ' name-card-fav' : '';
        return `<div class="name-card${favClass}" data-name="${n.name.replace(/"/g, '&quot;')}" onclick="showNameDetail(this.dataset.name)">
            ${isFav ? '<span class="name-fav-badge">❤️</span>' : ''}
            <div class="gender-icon">${n.gender === 'boy' ? '👦' : n.gender === 'girl' ? '👧' : '👶'}</div>
            <h4>${n.name}</h4>
            <p>${n.meaning}</p>
            <p style="font-size: 11px; color: var(--primary-pink); margin-top: 5px;">${n.origin}</p>
        </div>`;
    }).join('');
}

function filterNames(gender, element) {
    currentFilter = gender;
    
    // Update active pill
    document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    
    // Filter names
    if (gender === 'all') {
        currentNames = [...namesData];
    } else if (gender === 'unique') {
        currentNames = namesData.filter(n => n.name.length > 7 || n.origin === 'Hawaiian' || n.origin === 'Native American');
    } else {
        currentNames = namesData.filter(n => n.gender === gender);
    }
    
    document.getElementById('namesTitle').textContent = 
        gender === 'all' ? 'Popular Names' : 
        gender === 'unique' ? 'Unique Names' :
        gender.charAt(0).toUpperCase() + gender.slice(1) + ' Names';
    
    renderNames(currentNames);
}

function sortNames(sortType) {
    let sorted = [...currentNames];
    if (sortType === 'az') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'za') {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    renderNames(sorted);
}

function searchNames() {
    const query = document.getElementById('nameSearchInput').value.toLowerCase();
    if (!query) {
        renderNames(currentNames);
        return;
    }
    const filtered = namesData.filter(n => 
        n.name.toLowerCase().includes(query) || 
        n.meaning.toLowerCase().includes(query)
    );
    renderNames(filtered);
    document.getElementById('namesTitle').textContent = `Search Results for "${query}"`;
}

function showNameDetail(name) {
    const n = namesData.find(x => x.name === name);
    if (!n) return;
    const saveToFavorites = confirm(`${n.name}\n\nMeaning: ${n.meaning}\nOrigin: ${n.origin}\nGender: ${n.gender}\n\nSave this name to your favorites?`);
    if (saveToFavorites) {
        try {
            const favs = JSON.parse(localStorage.getItem('bc_favorite_names') || '[]');
            if (!favs.includes(n.name)) {
                favs.push(n.name);
                localStorage.setItem('bc_favorite_names', JSON.stringify(favs));
                alert(`"${n.name}" saved to favorites!`);
                renderBabyNameList();
                renderNames(currentNames || namesData);
            }
        } catch (e) {
            console.warn('Could not save favorite:', e);
        }
    }
}

// Registry Functions
function initRegistry() {
    const container = document.getElementById('registryCategories');
    let totalItems = 0;
    
    registryItems.forEach((cat, idx) => {
        totalItems += cat.items.length;
        const catDiv = document.createElement('div');
        catDiv.className = 'checklist-category';
        catDiv.innerHTML = `
            <h3>${cat.icon} ${cat.category}</h3>
            <div class="checklist-items" id="cat-${idx}">
                ${cat.items.map((item, i) => `
                    <div class="checklist-item" onclick="toggleCheck(this)">
                        <input type="checkbox" id="check-${idx}-${i}" onchange="saveRegistryState(); updateProgress()">
                        <label for="check-${idx}-${i}" style="cursor: pointer; flex: 1;">${item}</label>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(catDiv);
    });
    
    document.getElementById('totalCount').textContent = totalItems;
}

function toggleCheck(element) {
    const checkbox = element.querySelector('input');
    if (!checkbox) return;
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('checked', checkbox.checked);
    saveRegistryState();
    updateProgress();
}

function saveRegistryState() {
    const state = {};
    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
        if (cb.id) state[cb.id] = cb.checked;
    });
    try { localStorage.setItem('bc_registry_checked', JSON.stringify(state)); } catch (e) {}
}

function loadRegistryState() {
    try {
        const state = JSON.parse(localStorage.getItem('bc_registry_checked') || '{}');
        document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
            if (cb.id && state[cb.id] !== undefined) {
                cb.checked = state[cb.id];
                const item = cb.closest('.checklist-item');
                if (item) item.classList.toggle('checked', cb.checked);
            }
        });
        updateProgress();
    } catch (e) {}
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.checklist-item input');
    const checked = document.querySelectorAll('.checklist-item input:checked');
    const percent = (checked.length / checkboxes.length) * 100;
    
    document.getElementById('checkedCount').textContent = checked.length;
    document.getElementById('progressBar').style.width = percent + '%';
}

// Course Enrollment
function enrollCourse(course) {
    const courses = {
        childbirth: 'Childbirth Preparation',
        breastfeeding: 'Breastfeeding 101',
        newborn: 'Newborn Care Basics',
        sleep: 'Sleep Training',
        cpr: 'Infant CPR & Safety',
        solids: 'Starting Solids'
    };
    // Persist enrollment
    try {
        const key = 'bc_enrollments';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        if (!current.find(c => c.id === course)) {
            current.push({ id: course, name: courses[course], status: 'Enrolled' });
            localStorage.setItem(key, JSON.stringify(current));
        }
    } catch (e) {
        console.warn('Enrollment persistence failed:', e);
    }
    renderEnrolledCourses();
    alert(`Enrolling in: ${courses[course]}\n\nThis course was added to your dashboard. You\'ll receive email instructions shortly!`);
}

function renderEnrolledCourses() {
    const list = document.getElementById('enrolledCourses');
    if (!list) return;
    let items = [];
    try {
        const key = 'bc_enrollments';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        items = current;
    } catch (e) {
        items = [];
    }
    if (items.length === 0) {
        list.innerHTML = '<li class="tool-item">No enrollments yet. Click a course above to add it.</li>';
        return;
    }
    list.innerHTML = items.map(i => `
        <li class="tool-item">
            <span>${i.name}</span>
            <span style="color: var(--text-gray);">${i.status}</span>
        </li>
    `).join('');
}

function toggleCourseTab(tab) {
    const dash = document.getElementById('dashboardPanel');
    const prof = document.getElementById('profilePanel');
    if (!dash || !prof) return;
    if (tab === 'profile') {
        dash.style.display = 'none';
        prof.style.display = 'block';
        loadCourseProfile();
    } else {
        prof.style.display = 'none';
        dash.style.display = 'block';
    }
}

function saveCourseProfile() {
    const name = document.getElementById('profileName')?.value || '';
    const email = document.getElementById('profileEmail')?.value || '';
    const notifications = !!document.getElementById('profileNotifications')?.checked;
    if (!email) {
        alert('Please enter your email');
        return;
    }
    try {
        const key = 'bc_profile';
        localStorage.setItem(key, JSON.stringify({ name, email, notifications }));
        alert('Profile saved!');
    } catch (e) {
        console.warn('Profile save failed:', e);
        alert('Could not save profile (storage error).');
    }
}

function loadCourseProfile() {
    try {
        const key = 'bc_profile';
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data) {
            if (document.getElementById('profileName')) document.getElementById('profileName').value = data.name || '';
            if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = data.email || '';
            if (document.getElementById('profileNotifications')) document.getElementById('profileNotifications').checked = !!data.notifications;
        }
    } catch (e) {
        // ignore
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderEnrolledCourses();
    loadCourseProfile();
    // Account dashboard init
    loadScreenName();
    renderBabyNameList();
});
// Baby Milestones
function trackMilestones() {
    const date = document.getElementById('babyBirthDate').value;
    if (!date) {
        alert('Please enter your baby\'s birth date');
        return;
    }
    
    const birth = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    
    let milestones = [];
    if (months < 1) milestones = ['Lifts head briefly', 'Responds to sounds', 'Makes eye contact'];
    else if (months < 3) milestones = ['Smiles socially', 'Coos and gurgles', 'Tracks objects'];
    else if (months < 6) milestones = ['Rolls over', 'Laughs', 'Reaches for objects'];
    else if (months < 9) milestones = ['Sits without support', 'Babbles', 'Passes objects hand to hand'];
    else if (months < 12) milestones = ['Crawls', 'Stands with support', 'Says mama or dada'];
    else milestones = ['Walks independently', 'Says 3-5 words', 'Feeds self with fingers'];
    
    alert(`Your baby is ${months} months old!\n\nUpcoming milestones:\n${milestones.map(m => '• ' + m).join('\n')}`);
}

// Toddler Milestones
function showToddlerMilestones() {
    const age = parseInt(document.getElementById('toddlerAge').value);
    let milestones = [];
    
    if (age === 12) milestones = ['Says 2-3 words', 'Stands alone', 'Waves goodbye'];
    else if (age === 18) milestones = ['Says 10-20 words', 'Walks independently', 'Points to body parts'];
    else if (age === 24) milestones = ['2-word phrases', 'Runs well', 'Kicks ball', 'Scribbles'];
    else if (age === 30) milestones = ['3-word sentences', 'Jumps with both feet', 'Follows 2-step commands'];
    else if (age === 36) milestones = ['Speaks in sentences', 'Rides tricycle', 'Uses spoon', 'Plays make-believe'];
    
    alert(`Milestones for ${age/12} year old:\n\n${milestones.map(m => '• ' + m).join('\n')}`);
}

// Family Topics
function showFamilyTopic(topic) {
    const topics = {
        recipes: 'Family Recipes: Check out our collection of healthy, kid-friendly meals including hidden veggie muffins, toddler-friendly pasta, and quick weeknight dinners.',
        activities: 'Activities & Crafts: Explore sensory bins, DIY playdough recipes, outdoor scavenger hunts, and rainy day activities for ages 1-5.',
        discipline: 'Positive Discipline: Learn about gentle parenting techniques, setting boundaries with love, and handling tantrums effectively.'
    };
    alert(topics[topic]);
}

// Pregnancy Calculator - auto-detects: future date = due date, past date = LMP
function calculatePregnancyWeek() {
    const date = document.getElementById('pregDate').value;
    if (!date) {
        alert('Please enter a date');
        return;
    }
    
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    
    const isDueDate = inputDate > today;
    let weeks;
    if (isDueDate) {
        const daysToDue = Math.ceil((inputDate - today) / (1000 * 60 * 60 * 24));
        weeks = Math.max(0, Math.min(42, Math.round(40 - daysToDue / 7)));
    } else {
        const diffDays = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24));
        weeks = Math.max(0, Math.min(42, Math.floor(diffDays / 7)));
    }
    
    let trimester = weeks <= 13 ? 'First Trimester' : weeks <= 27 ? 'Second Trimester' : 'Third Trimester';
    
    document.getElementById('currentWeek').textContent = `Week ${weeks}`;
    const lastP = document.getElementById('pregResult')?.querySelector('p:last-child');
    if (lastP) lastP.textContent = trimester;
    document.getElementById('pregResult')?.classList.add('show');
}

// Show Week Info
function showWeekInfo(week) {
    alert(`Week ${week}: View detailed information about your baby's development this week, including size comparison, symptoms, and tips for a healthy pregnancy.`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateWeeks();
    renderNames(namesData);
    initRegistry();
    loadRegistryState();
    
    // Update login state on page load
    updateLoginState();
    
    // Search input enter key
    document.getElementById('globalSearch')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            alert('Search functionality would search across all BabyCenter content including articles, tools, and community posts.');
        }
    });
    
    // Name search enter key
    document.getElementById('nameSearchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchNames();
        }
    });
});

// Navigation Functions
function openOvulationCalculator() {
    navigateTo('getting-pregnant');
    setTimeout(() => scrollToCalc(), 100);
}

function openDueDateCalc() {
    navigateTo('due-date-calculator');
}

function openPregnancyTracker() {
    navigateTo('pregnancy-tracker');
}

function openBabyKickCounter() {
    navigateTo('baby-kick-counter');
}

function openBabyNames() {
    navigateTo('names');
}

function openContractionTimer() {
    navigateTo('contraction-timer');
}

function openBreastfeedingGuide() {
    navigateTo('breastfeeding-guide');
}

function openSleepTracker() {
    navigateTo('sleep-tracker');
}

function openVaccineScheduler() {
    navigateTo('vaccine-scheduler');
}

function openGrowthChart() {
    navigateTo('growth-chart-page');
}

function openCourses() {
    navigateTo('courses');
}

function openBabbleWordGame() {
    navigateTo('babble-game');
}

function openConceptionCalc() {
  const method = prompt("Calculate conception by 'due' date or 'lmp'? (type due or lmp)");
  if (!method) return;
  const m = method.trim().toLowerCase();
  let result = '';
  if (m === 'due') {
    const dueStr = prompt('Enter your due date (YYYY-MM-DD):');
    if (!dueStr) return;
    const due = new Date(dueStr);
    if (isNaN(due.getTime())) { alert('Invalid date.'); return; }
    const conception = new Date(due.getTime() - 266 * 24 * 60 * 60 * 1000); // ~266 days before due
    result = `Estimated conception date: ${conception.toDateString()}`;
  } else if (m === 'lmp') {
    const lmpStr = prompt('Enter first day of last period (YYYY-MM-DD):');
    if (!lmpStr) return;
    const lmp = new Date(lmpStr);
    if (isNaN(lmp.getTime())) { alert('Invalid date.'); return; }
    const conception = new Date(lmp.getTime() + 14 * 24 * 60 * 60 * 1000); // typical ovulation
    result = `Estimated conception date: ${conception.toDateString()}`;
  } else {
    alert('Please type either due or lmp.');
    return;
  }
  alert(result);
}

function openPregnancyChecker() {
  const daysLateStr = prompt('Days since your expected period (0 if not late):');
  if (daysLateStr === null) return;
  const daysLate = parseInt(daysLateStr, 10);
  const symptoms = prompt('Any early symptoms? (nausea, tender breasts, fatigue, frequent urination) yes/no');
  const sYes = symptoms && symptoms.toLowerCase().includes('y');
  let msg = 'This is not a diagnosis, but here\'s helpful guidance:\n\n';
  if (!isNaN(daysLate) && daysLate >= 7) {
    msg += '- Consider taking a home pregnancy test now.\n';
  } else if (!isNaN(daysLate) && daysLate >= 3) {
    msg += '- You may test, but results could be more accurate in a few days.\n';
  } else {
    msg += '- Testing is most accurate after a missed period.\n';
  }
  if (sYes) msg += '- Early pregnancy symptoms are common, but not definitive.\n';
  msg += '\nIf unsure, consult a healthcare provider.';
  alert(msg);
}

function openBabyCostsCalc() {
  const diapers = parseFloat(prompt('Monthly diapers cost (USD):') || '0');
  const formula = parseFloat(prompt('Monthly formula cost (USD):') || '0');
  const childcare = parseFloat(prompt('Monthly childcare cost (USD):') || '0');
  const clothes = parseFloat(prompt('Monthly clothes/toys cost (USD):') || '0');
  if ([diapers, formula, childcare, clothes].some(isNaN)) {
    alert('Please enter numbers.');
    return;
  }
  const total = diapers + formula + childcare + clothes;
  alert(`Estimated monthly baby costs: $${total.toFixed(2)}`);
}

// Baby Tools handlers
function openBreastfeedingSolver() {
  const issue = prompt("What issue are you facing? (latch, supply, clogged, sleepy, other)");
  if (!issue) return;
  const i = issue.trim().toLowerCase();
  const tips = {
    latch: [
      'Try different positions (football, cross-cradle, laid-back).',
      'Ensure a deep latch: baby takes more areola, not just nipple.',
      'Break suction gently with a finger and re-latch if painful.',
      'Consider a lactation consultant for personalized help.'
    ],
    supply: [
      'Feed or pump more frequently (8–12 times/day early on).',
      'Offer both breasts; use breast compressions to increase flow.',
      'Stay hydrated and reduce stress; consider power pumping.',
      'Talk to your provider before trying galactagogues.'
    ],
    clogged: [
      'Warm compress and massage toward nipple before feeds.',
      'Frequent feeding; vary positions to drain different ducts.',
      'Rest and fluids; watch for fever or red, painful areas (mastitis).',
      'Seek medical care if symptoms worsen.'
    ],
    sleepy: [
      'Skin-to-skin contact before feeds; tickle feet or undress lightly.',
      'Compress breast to encourage flow when sucking slows.',
      'Try waking techniques: diaper change, burp, gentle talk.',
      'Track wet/dirty diapers and weight; consult pediatrician if concerned.'
    ]
  };
  const msg = tips[i] ? tips[i] : [
    'Check positioning, latch depth, and feeding frequency.',
    'Hydration, rest, and support help; reach out to a lactation consultant.',
    'If you have pain, fever, or low output, consult a healthcare provider.'
  ];
  alert('Breastfeeding tips:\n\n' + msg.map(t => '• ' + t).join('\n'));
}

function openFormulaSolver() {
  const issue = prompt("Formula issues? (spitup, gas, constipation, allergy, other)");
  if (!issue) return;
  const i = issue.trim().toLowerCase();
  const tips = {
    spitup: [
      'Offer smaller, more frequent feeds; keep baby upright 20–30 min.',
      'Burp mid-feed and after; avoid tight diapers/clothes.',
      'Discuss reflux or thickened feeds with pediatrician before changes.'
    ],
    gas: [
      'Burp more often; try anti-colic bottles or slower-flow nipples.',
      'Gentle tummy massage and bicycle legs.',
      'Check for excessive air intake during feeding.'
    ],
    constipation: [
      'Confirm proper mixing ratio; do not concentrate formula.',
      'Gentle belly massage and bicycle legs; ask pediatrician for guidance.',
      'Never give remedies without medical advice.'
    ],
    allergy: [
      'Watch for rash, blood in stool, vomiting, or swelling—seek urgent care for severe signs.',
      'Discuss hypoallergenic options with pediatrician.'
    ]
  };
  const msg = tips[i] ? tips[i] : [
    'Check nipple flow, feeding volume, and burping routine.',
    'Keep baby upright after feeds and monitor stool/comfort.',
    'Consult pediatrician for persistent or severe symptoms.'
  ];
  alert('Formula feeding tips:\n\n' + msg.map(t => '• ' + t).join('\n'));
}

function openSolidFeedingGuide() {
  const ageStr = prompt('How old is your baby (months)?');
  if (ageStr === null) return;
  const m = parseInt(ageStr, 10);
  if (isNaN(m)) { alert('Please enter a number of months.'); return; }
  let guide = [];
  if (m < 4) {
    guide = ['Breastmilk/formula only. Wait until ~4–6 months to start solids.'];
  } else if (m < 6) {
    guide = ['Consider starting solids if ready: iron-fortified cereal, pureed veg/fruit.', 'Introduce single-ingredient foods; watch for reactions.'];
  } else if (m < 8) {
    guide = ['Purees and soft mashed foods; avocado, banana, sweet potato.', 'Peanut/egg introduction per pediatric guidance; one new food at a time.'];
  } else if (m < 10) {
    guide = ['Soft proteins (well-cooked shredded chicken, beans), yogurt, cheese.', 'Offer water in small amounts with meals.'];
  } else if (m < 12) {
    guide = ['Finger foods; mixed textures; 3 meals + 1–2 snacks.', 'Avoid honey, whole nuts, choking hazards; supervise closely.'];
  } else {
    guide = ['Family meals with appropriate textures; balanced diet from all groups.', 'Continue milk intake per pediatric guidance.'];
  }
  alert('Solid feeding guide:\n\n' + guide.map(g => '• ' + g).join('\n'));
}

function openGrowthChart() {
  navigateTo('growth-chart-page');
}

function openChineseGenderPredictor() {
    const age = parseInt(prompt('Mother\'s age at conception:'), 10);
    const month = parseInt(prompt('Conception month (1-12):'), 10);
    if (isNaN(age) || isNaN(month)) {
        alert('Please enter valid numbers.');
        return;
    }
    const result = (age % 2 === 0 && month % 2 === 0) || (age % 2 === 1 && month % 2 === 1) ? 'Girl' : 'Boy';
    alert(`Chinese Gender Predictor (for fun only): ${result}\n\nThis is an old wives\' tale and not scientifically proven.`);
}

function openPregnancyWeightGain() {
    const preWeight = parseFloat(prompt('Pre-pregnancy weight (kg):')) || 60;
    const height = parseFloat(prompt('Height (cm):')) || 165;
    const bmi = preWeight / ((height / 100) ** 2);
    let range = '';
    if (bmi < 18.5) range = '12.5–18 kg';
    else if (bmi < 25) range = '11.5–16 kg';
    else if (bmi < 30) range = '7–11.5 kg';
    else range = '5–9 kg';
    alert(`Pregnancy weight gain guide:\n\nBased on your BMI (${bmi.toFixed(1)}), recommended total gain: ${range}\n\nDiscuss with your healthcare provider.`);
}

function openBirthPlanWorksheet() {
    alert('Birth Plan Worksheet: Create your birth plan with preferences for labor, delivery, and postpartum. Navigate to our Courses page for a printable worksheet and guidance.');
    navigateTo('courses');
}

function openChildHeightPredictor() {
    const momHeight = parseFloat(prompt('Mother\'s height (cm):')) || 165;
    const dadHeight = parseFloat(prompt('Father\'s height (cm):')) || 178;
    const isBoy = confirm('Predicting for a boy? (Cancel for girl)');
    const childHeight = isBoy
        ? (momHeight + 13 + dadHeight) / 2
        : (dadHeight - 13 + momHeight) / 2;
    alert(`Estimated adult height: ${childHeight.toFixed(1)} cm\n\nThis is a rough estimate. Genetics vary.`);
}

function openBabbleWordGame() {
    const content = `
        <div style="max-width: 900px; padding: 20px;">
            <h2>Babble Word Game</h2>
            <p style="color: #666; margin-bottom: 20px;">A fun interactive word game to help your baby learn first words!</p>
            
            <div class="babble-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
                <button class="babble-tab active" onclick="switchBabbleTab(event, 'animals')" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer;">🦁 Animals</button>
                <button class="babble-tab" onclick="switchBabbleTab(event, 'food')" style="padding: 10px 20px; background: #f0f0f0; color: #666; border: none; border-radius: 8px 8px 0 0; cursor: pointer;">🍎 Food</button>
                <button class="babble-tab" onclick="switchBabbleTab(event, 'family')" style="padding: 10px 20px; background: #f0f0f0; color: #666; border: none; border-radius: 8px 8px 0 0; cursor: pointer;">👨‍👩‍👧 Family</button>
                <button class="babble-tab" onclick="switchBabbleTab(event, 'actions')" style="padding: 10px 20px; background: #f0f0f0; color: #666; border: none; border-radius: 8px 8px 0 0; cursor: pointer;">🎯 Actions</button>
            </div>
            
            <div id="babble-animals" class="babble-category">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div class="word-card" onclick="speakWord('Dog')" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🐕</div>
                        <div style="font-weight: bold; color: #2d3436;">Dog</div>
                        <div style="font-size: 14px; color: #636e72;">Woof woof!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Cat')" style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🐱</div>
                        <div style="font-weight: bold; color: #2d3436;">Cat</div>
                        <div style="font-size: 14px; color: #636e72;">Meow meow!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Bird')" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🐦</div>
                        <div style="font-weight: bold; color: #2d3436;">Bird</div>
                        <div style="font-size: 14px; color: #636e72;">Tweet tweet!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Duck')" style="background: linear-gradient(135deg, #55efc4 0%, #00b894 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🦆</div>
                        <div style="font-weight: bold; color: #2d3436;">Duck</div>
                        <div style="font-size: 14px; color: #636e72;">Quack quack!</div>
                    </div>
                </div>
            </div>
            
            <div id="babble-food" class="babble-category" style="display: none;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div class="word-card" onclick="speakWord('Apple')" style="background: linear-gradient(135deg, #fab1a0 0%, #e17055 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🍎</div>
                        <div style="font-weight: bold; color: #2d3436;">Apple</div>
                        <div style="font-size: 14px; color: #636e72;">Crunchy!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Banana')" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🍌</div>
                        <div style="font-weight: bold; color: #2d3436;">Banana</div>
                        <div style="font-size: 14px; color: #636e72;">Yummy!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Milk')" style="background: linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🥛</div>
                        <div style="font-weight: bold; color: #2d3436;">Milk</div>
                        <div style="font-size: 14px; color: #636e72;">Mmm milk!</div>
                    </div>
                </div>
            </div>
            
            <div id="babble-family" class="babble-category" style="display: none;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div class="word-card" onclick="speakWord('Mama')" style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">👩</div>
                        <div style="font-weight: bold; color: #2d3436;">Mama</div>
                        <div style="font-size: 14px; color: #636e72;">Love you!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Dada')" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">👨</div>
                        <div style="font-weight: bold; color: #2d3436;">Dada</div>
                        <div style="font-size: 14px; color: #636e72;">Hi dada!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Baby')" style="background: linear-gradient(135deg, #55efc4 0%, #00b894 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">👶</div>
                        <div style="font-weight: bold; color: #2d3436;">Baby</div>
                        <div style="font-size: 14px; color: #636e72;">Sweet baby!</div>
                    </div>
                </div>
            </div>
            
            <div id="babble-actions" class="babble-category" style="display: none;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div class="word-card" onclick="speakWord('Bye Bye')" style="background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">👋</div>
                        <div style="font-weight: bold; color: #2d3436;">Bye Bye</div>
                        <div style="font-size: 14px; color: #636e72;">Wave hello!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Clap')" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">👏</div>
                        <div style="font-weight: bold; color: #2d3436;">Clap</div>
                        <div style="font-size: 14px; color: #636e72;">Yay clap!</div>
                    </div>
                    <div class="word-card" onclick="speakWord('Play')" style="background: linear-gradient(135deg, #55efc4 0%, #00b894 100%); padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; transition: transform 0.3s ease;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎾</div>
                        <div style="font-weight: bold; color: #2d3436;">Play</div>
                        <div style="font-size: 14px; color: #636e72;">Let's play!</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    openModal(content);
}

function switchBabbleTab(event, category) {
    // Hide all categories
    document.querySelectorAll('.babble-category').forEach(cat => cat.style.display = 'none');
    
    // Reset all tabs
    document.querySelectorAll('.babble-tab').forEach(tab => {
        tab.style.background = '#f0f0f0';
        tab.style.color = '#666';
    });
    
    // Show selected category
    document.getElementById('babble-' + category).style.display = 'block';
    
    // Highlight selected tab
    event.target.style.background = '#667eea';
    event.target.style.color = 'white';
}

function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
        
        // Add animation effect
        event.currentTarget.style.transform = 'scale(1.1)';
        setTimeout(() => {
            event.currentTarget.style.transform = 'scale(1)';
        }, 300);
    } else {
        alert('Speech synthesis is not supported in your browser.');
    }
}

// Babble Word Game Functions
function showCategory(categoryName) {
    // Hide all category contents
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected category
    document.getElementById(categoryName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function playWord(word, emoji) {
    // Create speech synthesis if available
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8; // Slower for toddlers
        utterance.pitch = 1.2; // Higher pitch for kids
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
    }
    
    // Visual feedback
    const card = event.currentTarget;
    card.style.transform = 'scale(1.1)';
    card.style.backgroundColor = '#ffeb3b';
    
    setTimeout(() => {
        card.style.transform = 'scale(1)';
        card.style.backgroundColor = '';
    }, 300);
    
    // Show the emoji with animation
    const emojiDisplay = card.querySelector('.word-emoji');
    emojiDisplay.style.transform = 'scale(1.3) rotate(10deg)';
    
    setTimeout(() => {
        emojiDisplay.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
}

function openKickCounter() {
    navigateTo('baby-kick-counter');
}

function openContractionTimer() {
    navigateTo('contraction-timer');
}

function openBreastfeedingGuide() {
    navigateTo('breastfeeding-guide');
}

function openSleepTracker() {
    navigateTo('sleep-tracker');
}

function openVaccineScheduler() {
    navigateTo('vaccine-scheduler');
}

function openRegistry() {
  navigateTo('registry');
  try {
    document.getElementById('registryCategories').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {}
}

// Account Dashboard functions
function showAccountPanel(panel) {
    loadAccountProfile();
    loadAccountSettings();
    const panels = {
        activity: document.getElementById('accountActivityPanel'),
        messages: document.getElementById('accountMessagesPanel'),
        clubs: document.getElementById('accountClubsPanel'),
        names: document.getElementById('accountNamesPanel'),
        profile: document.getElementById('accountProfilePanel'),
        settings: document.getElementById('accountSettingsPanel'),
        personalInfo: document.getElementById('accountSettingsPanel'),
        emailSubscriptions: document.getElementById('accountSettingsPanel'),
        communityPreferences: document.getElementById('accountSettingsPanel'),
        communityProfile: document.getElementById('accountCommunityProfilePanel')
    };
    const all = document.querySelectorAll('#account .account-panel');
    all.forEach(p => { if (p) p.style.display = 'none'; });
    const target = panels[panel] || panels.activity;
    if (target) target.style.display = 'block';
}

function saveScreenName() {
    const input = document.getElementById('screenNameInput');
    const status = document.getElementById('screenNameStatus');
    const value = (input?.value || '').trim();
    if (!value) {
        alert('Please enter a screen name');
        return;
    }
    try {
        localStorage.setItem('bc_screen_name', value);
        if (status) status.textContent = `Your screen name: ${value}`;
        alert('Screen name saved!');
    } catch (e) {
        console.warn('Failed to save screen name:', e);
        alert('Could not save screen name (storage error).');
    }
}

function loadScreenName() {
    try {
        const value = localStorage.getItem('bc_screen_name') || '';
        if (document.getElementById('screenNameInput')) document.getElementById('screenNameInput').value = value;
        if (document.getElementById('screenNameStatus')) document.getElementById('screenNameStatus').textContent = value ? `Your screen name: ${value}` : '';
    } catch (e) {
        // ignore
    }
}

function renderBabyNameList() {
    const list = document.getElementById('savedBabyNames');
    if (!list) return;
    let names = [];
    try {
        names = JSON.parse(localStorage.getItem('bc_favorite_names') || '[]');
    } catch (e) {
        names = [];
    }
    if (!Array.isArray(names) || names.length === 0) {
        list.innerHTML = '<li class="tool-item">No saved names yet. Browse the Names page to add favorites.</li>';
        return;
    }
    list.innerHTML = names.map(n => `<li class="tool-item">${n}</li>`).join('');
}

function saveAccountProfile() {
    const name = document.getElementById('accountName')?.value || '';
    const email = document.getElementById('accountEmail')?.value || '';
    const notifications = !!document.getElementById('accountNotifications')?.checked;
    if (!email) {
        alert('Please enter your email');
        return;
    }
    try {
        const key = 'bc_profile';
        localStorage.setItem(key, JSON.stringify({ name, email, notifications }));
        alert('Profile saved!');
    } catch (e) {
        console.warn('Profile save failed:', e);
        alert('Could not save profile (storage error).');
    }
}

function loadAccountProfile() {
    try {
        const data = JSON.parse(localStorage.getItem('bc_profile') || '{}');
        if (document.getElementById('accountName')) document.getElementById('accountName').value = data.name || '';
        if (document.getElementById('accountEmail')) document.getElementById('accountEmail').value = data.email || '';
        if (document.getElementById('accountNotifications')) document.getElementById('accountNotifications').checked = !!data.notifications;
    } catch (e) {}
}

function loadAccountSettings() {
    try {
        const data = JSON.parse(localStorage.getItem('bc_settings') || '{}');
        if (document.getElementById('accountCity')) document.getElementById('accountCity').value = data.city || '';
        if (document.getElementById('accountDueMonth')) document.getElementById('accountDueMonth').value = data.dueMonth || '';
        if (document.getElementById('accountWeeklyEmails')) document.getElementById('accountWeeklyEmails').checked = !!data.weeklyEmails;
        if (document.getElementById('accountVisibility')) document.getElementById('accountVisibility').value = data.visibility || 'public';
    } catch (e) {}
}

function saveAccountSettings() {
    const city = document.getElementById('accountCity')?.value || '';
    const dueMonth = document.getElementById('accountDueMonth')?.value || '';
    const weeklyEmails = !!document.getElementById('accountWeeklyEmails')?.checked;
    const visibility = document.getElementById('accountVisibility')?.value || 'public';
    try {
        const key = 'bc_settings';
        localStorage.setItem(key, JSON.stringify({ city, dueMonth, weeklyEmails, visibility }));
        alert('Settings saved!');
    } catch (e) {
        console.warn('Settings save failed:', e);
        alert('Could not save settings (storage error).');
    }
}

function goToRegistry() {
    navigateTo('registry');
}

function goToCourses() {
    navigateTo('courses');
}

function logoutAccount() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('bc_logged_in');
        localStorage.removeItem('bc_user_email');
        localStorage.removeItem('bc_login_time');
        updateLoginState();
        alert('You have been logged out.');
        navigateTo('home');
    }
}

// Tool Functions for New Pages
function calculateDueDate() {
    const lmp = document.getElementById('dueDateLMP').value;
    const cycleLength = parseInt(document.getElementById('cycleLength').value);
    
    if (!lmp) {
        alert('Please enter your last menstrual period date');
        return;
    }
    
    const lmpDate = new Date(lmp);
    const dueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    
    const resultDiv = document.getElementById('dueDateResult');
    resultDiv.innerHTML = `
        <h4>Your Due Date</h4>
        <p><strong>${dueDate.toLocaleDateString()}</strong></p>
        <p>You are currently ${Math.floor((new Date() - lmpDate) / (7 * 24 * 60 * 60 * 1000))} weeks pregnant</p>
        <p>Based on a ${cycleLength}-day menstrual cycle</p>
    `;
    resultDiv.style.display = 'block';
}

function trackPregnancy() {
    const dueDate = document.getElementById('trackerDueDate').value;
    
    if (!dueDate) {
        alert('Please enter your due date');
        return;
    }
    
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due - today) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.max(0, Math.min(42, Math.round(40 - daysUntilDue / 7)));
    
    const resultDiv = document.getElementById('pregnancyResult');
    resultDiv.innerHTML = `
        <h4>Current Pregnancy Status</h4>
        <p><strong>Week ${currentWeek}</strong> of pregnancy</p>
        <p>${daysUntilDue > 0 ? daysUntilDue + ' days until due date' : 'Past due date!'}</p>
        <p>${currentWeek <= 13 ? 'First Trimester' : currentWeek <= 27 ? 'Second Trimester' : 'Third Trimester'}</p>
    `;
    resultDiv.style.display = 'block';
}

let kickCount = 0;
let kickTimer = null;
let kickStartTime = null;

function startKickCounter() {
    kickCount = 0;
    kickStartTime = new Date();
    document.getElementById('kickCount').textContent = '0';
    document.getElementById('kickBtn').disabled = false;
    document.getElementById('kickStartBtn').disabled = true;
    
    kickTimer = setInterval(() => {
        const elapsed = Math.floor((new Date() - kickStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('kickTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function countKick() {
    kickCount++;
    document.getElementById('kickCount').textContent = kickCount;
    
    if (kickCount >= 10) {
        clearInterval(kickTimer);
        document.getElementById('kickBtn').disabled = true;
        document.getElementById('kickStartBtn').disabled = false;
        alert(`Great! You counted 10 kicks in ${document.getElementById('kickTimer').textContent}`);
    }
}

function resetKickCounter() {
    clearInterval(kickTimer);
    kickCount = 0;
    document.getElementById('kickCount').textContent = '0';
    document.getElementById('kickTimer').textContent = '00:00';
    document.getElementById('kickBtn').disabled = true;
    document.getElementById('kickStartBtn').disabled = false;
}

let contractionTimer = null;
let contractionStartTime = null;
let lastContractionEnd = null;
let contractionLog = [];

function startContraction() {
    contractionStartTime = new Date();
    document.getElementById('contractionStartBtn').disabled = true;
    document.getElementById('contractionEndBtn').disabled = false;
    
    contractionTimer = setInterval(() => {
        const elapsed = Math.floor((new Date() - contractionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('currentTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function endContraction() {
    clearInterval(contractionTimer);
    const endTime = new Date();
    const duration = Math.floor((endTime - contractionStartTime) / 1000);
    
    if (lastContractionEnd) {
        const frequency = Math.floor((contractionStartTime - lastContractionEnd) / 1000);
        const minutes = Math.floor(frequency / 60);
        const seconds = frequency % 60;
        document.getElementById('frequencyTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    document.getElementById('durationTime').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    contractionLog.push({
        start: contractionStartTime,
        end: endTime,
        duration: duration,
        frequency: lastContractionEnd ? Math.floor((contractionStartTime - lastContractionEnd) / 1000) : null
    });
    
    lastContractionEnd = endTime;
    
    document.getElementById('contractionStartBtn').disabled = false;
    document.getElementById('contractionEndBtn').disabled = true;
    
    updateContractionLog();
}

function updateContractionLog() {
    const logDiv = document.getElementById('contractionLog');
    if (contractionLog.length > 0) {
        const lastContraction = contractionLog[contractionLog.length - 1];
        logDiv.innerHTML = `
            <h4>Last Contraction</h4>
            <p>Duration: ${Math.floor(lastContraction.duration / 60)}:${(lastContraction.duration % 60).toString().padStart(2, '0')}</p>
            ${lastContraction.frequency ? `<p>Frequency: ${Math.floor(lastContraction.frequency / 60)}:${(lastContraction.frequency % 60).toString().padStart(2, '0')}</p>` : ''}
        `;
    }
}

function resetContractionTimer() {
    clearInterval(contractionTimer);
    contractionLog = [];
    lastContractionEnd = null;
    document.getElementById('currentTimer').textContent = '00:00';
    document.getElementById('frequencyTime').textContent = '--:--';
    document.getElementById('durationTime').textContent = '00:00';
    document.getElementById('contractionLog').innerHTML = '';
    document.getElementById('contractionStartBtn').disabled = false;
    document.getElementById('contractionEndBtn').disabled = true;
}

function trackSleep() {
    const startTime = document.getElementById('sleepStart').value;
    const endTime = document.getElementById('sleepEnd').value;
    const quality = document.getElementById('sleepQuality').value;
    
    if (!startTime || !endTime) {
        alert('Please enter both start and end times');
        return;
    }
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end - start) / (1000 * 60 * 60);
    
    if (duration < 0) duration += 24; // Handle overnight sleep
    
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    const resultDiv = document.getElementById('sleepResult');
    resultDiv.innerHTML = `
        <h4>Sleep Session Recorded</h4>
        <p><strong>Duration:</strong> ${hours}h ${minutes}m</p>
        <p><strong>Quality:</strong> ${quality.charAt(0).toUpperCase() + quality.slice(1)}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
    `;
    resultDiv.style.display = 'block';
}

function generateVaccineSchedule() {
    const birthDate = document.getElementById('vaccineBabyBirthDate').value;
    
    if (!birthDate) {
        alert('Please enter your baby\'s birth date');
        return;
    }
    
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = Math.floor((today - birth) / (30 * 24 * 60 * 60 * 1000));
    
    const schedule = [
        { age: 'Birth', vaccines: 'Hepatitis B', date: birth },
        { age: '2 Months', vaccines: 'DTaP, Hib, IPV, PCV, Rotavirus', date: new Date(birth.getTime() + 60 * 24 * 60 * 60 * 1000) },
        { age: '4 Months', vaccines: 'DTaP, Hib, IPV, PCV, Rotavirus', date: new Date(birth.getTime() + 120 * 24 * 60 * 60 * 1000) },
        { age: '6 Months', vaccines: 'DTaP, Hib, IPV, PCV, Rotavirus, Flu', date: new Date(birth.getTime() + 180 * 24 * 60 * 60 * 1000) }
    ];
    
    const resultDiv = document.getElementById('vaccineSchedule');
    resultDiv.innerHTML = `
        <h4>Your Baby's Vaccine Schedule</h4>
        <p>Current Age: ${ageInMonths} months</p>
        <div class="schedule-list">
            ${schedule.map(item => `
                <div class="schedule-item">
                    <strong>${item.age}:</strong> ${item.vaccines}
                    <br><small>${item.date.toLocaleDateString()}</small>
                </div>
            `).join('')}
        </div>
        <p><em>Consult your healthcare provider for the most accurate schedule</em></p>
    `;
    resultDiv.style.display = 'block';
}

function trackGrowth() {
    const age = parseInt(document.getElementById('babyAge').value);
    const weight = parseFloat(document.getElementById('babyWeight').value);
    const height = parseFloat(document.getElementById('babyHeight').value);
    
    if (!age || !weight || !height) {
        alert('Please enter all measurements');
        return;
    }
    
    // Simple growth percentiles (simplified)
    const weightPercentile = age <= 3 ? (weight / 6) * 100 : age <= 6 ? (weight / 8) * 100 : (weight / 10) * 100;
    const heightPercentile = age <= 3 ? (height / 60) * 100 : age <= 6 ? (height / 70) * 100 : (height / 80) * 100;
    
    const resultDiv = document.getElementById('growthResult');
    resultDiv.innerHTML = `
        <h4>Growth Measurements</h4>
        <p><strong>Age:</strong> ${age} months</p>
        <p><strong>Weight:</strong> ${weight} kg (${Math.min(100, Math.round(weightPercentile))}th percentile)</p>
        <p><strong>Height:</strong> ${height} cm (${Math.min(100, Math.round(heightPercentile))}th percentile)</p>
        <p><em>These are simplified estimates. Consult your pediatrician for accurate growth charts.</em></p>
    `;
    resultDiv.style.display = 'block';
}

// Initialize Babble Game
function initializeBabbleGame() {
    console.log('Initializing babble game...');
    
    // Load saved progress
    wordsLearned = parseInt(localStorage.getItem('babble_words_learned') || '0');
    const wordsLearnedElement = document.getElementById('wordsLearned');
    if (wordsLearnedElement) {
        wordsLearnedElement.textContent = wordsLearned;
    }
    
    // Update progress bar
    const progress = (wordsLearned % 20) * 5;
    const progressElement = document.getElementById('babbleProgress');
    if (progressElement) {
        progressElement.style.width = progress + '%';
    }
    
    // Set default category
    currentCategory = 'animals';
    
    // Use enhanced initialization if available
    if (typeof initializeCategories === 'function') {
        initializeCategories();
    } else {
        // Fallback to basic initialization
        document.querySelectorAll('.category-content').forEach(content => {
            content.classList.remove('active');
        });
        const animalsCategory = document.getElementById('animals');
        if (animalsCategory) {
            animalsCategory.classList.add('active');
        }
        
        // Set active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector('.category-tab');
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    console.log('Babble game initialized successfully');
}
