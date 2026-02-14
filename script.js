// Navigation System
function navigateTo(pageId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Update nav active state
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
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
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    console.log('Login attempt:', { email, rememberMe });
    
    // Show success message
    alert(`Welcome back, ${email}!\n\nYou are now logged in to BabyCenter.`);
    
    // Clear form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('rememberMe').checked = false;
    
    // Navigate to home after successful login
    setTimeout(() => navigateTo('home'), 1000);
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
    
    // Navigate to home after successful signup
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

// Ovulation Calculator
function calculateOvulation() {
    const date = document.getElementById('ovulationDate').value;
    const cycle = parseInt(document.getElementById('ovulationCycle').value);
    
    if (!date) {
        alert('Please enter a date');
        return;
    }
    
    const lastPeriod = new Date(date);
    const ovulation = new Date(lastPeriod);
    ovulation.setDate(lastPeriod.getDate() + (cycle - 14));
    
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);
    
    const options = { month: 'short', day: 'numeric' };
    document.getElementById('fertileWindow').textContent = 
        `${fertileStart.toLocaleDateString('en-US', options)} - ${fertileEnd.toLocaleDateString('en-US', options)}`;
    document.getElementById('ovulationDay').textContent = ovulation.toLocaleDateString('en-US', options);
    document.getElementById('ovulationResult').classList.add('show');
}

function scrollToCalc() {
    document.getElementById('ovulationCalc').scrollIntoView({ behavior: 'smooth' });
}

// Baby Names Functions
function renderNames(names) {
    const container = document.getElementById('namesList');
    container.innerHTML = names.map(n => `
        <div class="name-card" onclick="showNameDetail('${n.name}')">
            <div class="gender-icon">${n.gender === 'boy' ? '👦' : n.gender === 'girl' ? '👧' : '👶'}</div>
            <h4>${n.name}</h4>
            <p>${n.meaning}</p>
            <p style="font-size: 11px; color: var(--primary-pink); margin-top: 5px;">${n.origin}</p>
        </div>
    `).join('');
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
    alert(`${n.name}\n\nMeaning: ${n.meaning}\nOrigin: ${n.origin}\nGender: ${n.gender}\n\nSave this name to your favorites?`);
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
                        <input type="checkbox" id="check-${idx}-${i}" onchange="updateProgress()">
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
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('checked', checkbox.checked);
    updateProgress();
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
    alert(`Enrolling in: ${courses[course]}\n\nThis course will be added to your dashboard. You'll receive email instructions shortly!`);
}

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

// Pregnancy Calculator
function calculatePregnancyWeek() {
    const date = document.getElementById('pregDate').value;
    if (!date) {
        alert('Please enter a date');
        return;
    }
    
    const inputDate = new Date(date);
    const today = new Date();
    
    // Simple calculation for demo
    const diffTime = Math.abs(today - inputDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    
    let trimester = weeks <= 13 ? 'First Trimester' : weeks <= 27 ? 'Second Trimester' : 'Third Trimester';
    
    document.getElementById('currentWeek').textContent = `Week ${weeks}`;
    document.getElementById('pregResult').querySelector('p:last-child').textContent = trimester;
    document.getElementById('pregResult').classList.add('show');
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
