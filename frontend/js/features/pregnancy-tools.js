// Pregnancy Tools - Due Date Calculator and Related Functions

window.pregnancyWeekSizes = window.pregnancyWeekSizes || {
    1: 'poppy seed',
    2: 'sesame seed',
    3: 'lentil',
    4: 'blueberry',
    5: 'apple seed',
    6: 'sweet pea',
    7: 'blueberry',
    8: 'raspberry',
    9: 'green olive',
    10: 'prune',
    11: 'fig',
    12: 'lime',
    13: 'peach',
    14: 'lemon',
    15: 'apple',
    16: 'avocado',
    17: 'pear',
    18: 'bell pepper',
    19: 'mango',
    20: 'banana',
    21: 'carrot',
    22: 'spaghetti squash',
    23: 'grapefruit',
    24: 'ear of corn',
    25: 'rutabaga',
    26: 'scallion bunch',
    27: 'cauliflower',
    28: 'eggplant',
    29: 'butternut squash',
    30: 'cabbage',
    31: 'coconut',
    32: 'jicama',
    33: 'pineapple',
    34: 'cantaloupe',
    35: 'honeydew melon',
    36: 'romaine lettuce',
    37: 'Swiss chard',
    38: 'leek',
    39: 'mini watermelon',
    40: 'small pumpkin',
    41: 'jackfruit',
    42: 'watermelon'
};

window.pregnancyWeekPhases = window.pregnancyWeekPhases || [
    { week: 1, phase: 'Conception', description: 'Fertilization occurs' },
    { week: 2, phase: 'Implantation', description: 'Embryo implants in uterus' },
    { week: 3, phase: 'Neural Development', description: 'Neural tube forms' },
    { week: 4, phase: 'Organogenesis', description: 'Major organs begin forming' },
    { week: 5, phase: 'Heartbeat', description: 'Heart begins beating' },
    { week: 6, phase: 'Facial Features', description: 'Face starts forming' },
    { week: 7, phase: 'Limbs', description: 'Arms and legs develop' },
    { week: 8, phase: 'Fingers & Toes', description: 'Digits separate' },
    { week: 9, phase: 'Movement', description: 'Baby begins moving' },
    { week: 10, phase: 'Gender', description: 'Sex organs develop' },
    { week: 11, phase: 'Hair & Nails', description: 'Hair follicles form' },
    { week: 12, phase: 'First Trimester End', description: 'All major organs formed' },
    { week: 13, phase: 'Second Trimester Start', description: 'Growth phase begins' },
    { week: 14, phase: 'Quickening', description: 'Mother may feel movement' },
    { week: 15, phase: 'Hearing', description: 'Baby can hear sounds' },
    { week: 16, phase: 'Skeleton', description: 'Bones harden' },
    { week: 17, phase: 'Fat Development', description: 'Baby fat forms' },
    { week: 18, phase: 'Swallowing', description: 'Baby practices swallowing' },
    { week: 19, phase: 'Vernix', description: 'Protective coating forms' },
    { week: 20, phase: 'Halfway', description: 'Pregnancy halfway point' },
    { week: 21, phase: 'Taste Buds', description: 'Taste develops' },
    { week: 22, phase: 'Lungs', description: 'Lungs develop air sacs' },
    { week: 23, phase: 'Lanugo', description: 'Fine hair grows' },
    { week: 24, phase: 'Viability', description: 'Baby could survive outside womb' },
    { week: 25, phase: 'Brain Growth', description: 'Rapid brain development' },
    { week: 26, phase: 'Eyes Open', description: 'Baby can open eyes' },
    { week: 27, phase: 'Second Trimester End', description: 'Growth continues' },
    { week: 28, phase: 'Third Trimester Start', description: 'Final growth phase' },
    { week: 29, phase: 'Kicking', description: 'Stronger movements' },
    { week: 30, phase: 'Bone Marrow', description: 'Bone marrow develops' },
    { week: 31, phase: 'Rapid Weight Gain', description: 'Baby gains weight quickly' },
    { week: 32, phase: 'Breathing Practice', description: 'Baby practices breathing' },
    { week: 33, phase: 'Immune System', description: 'Immunity develops' },
    { week: 34, phase: 'Positioning', description: 'Baby moves into birth position' },
    { week: 35, phase: 'Lungs Mature', description: 'Lungs nearly fully developed' },
    { week: 36, phase: 'Full Term', description: 'Baby considered full term' },
    { week: 37, phase: 'Final Growth', description: 'Final weight gain' },
    { week: 38, phase: 'Birth Imminent', description: 'Labor could start anytime' },
    { week: 39, phase: 'Ready for Birth', description: 'Baby fully developed' },
    { week: 40, phase: 'Due Date', description: 'Expected delivery date' }
];

// Home Due Date Calculator
function calculateHomeDueDate() {
    if (!requireToolAccess('home', 'calculateHomeDueDate')) {
        return;
    }
    
    const lmpInput = document.getElementById('homeLmpDate');
    const cycleLengthInput = document.getElementById('homeCycleLength');
    const resultDiv = document.getElementById('homeDueDateResult');
    
    if (!lmpInput || !cycleLengthInput || !resultDiv) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const lmpDate = new Date(lmpInput.value);
    const cycleLength = parseInt(cycleLengthInput.value) || 28;
    
    if (isNaN(lmpDate.getTime())) {
        showNotification('Please enter a valid date', 'error');
        return;
    }
    
    // Calculate due date (280 days from LMP, adjusted for cycle length)
    const adjustedDays = 280 + (cycleLength - 28);
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + adjustedDays);
    
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const weeksUntilDue = Math.floor(daysUntilDue / 7);
    const daysRemaining = daysUntilDue % 7;
    
    const currentWeek = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24 * 7));
    const currentTrimester = currentWeek <= 13 ? 'First' : currentWeek <= 27 ? 'Second' : 'Third';
    
    const babySize = pregnancyWeekSizes[currentWeek] || 'watermelon';
    
    // Safe helper to escape HTML
    const esc = (str) => String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    resultDiv.innerHTML = `
        <div class="due-date-result">
            <h3>Due Date Calculator Results</h3>
            <div class="result-grid">
                <div class="result-item">
                    <label>Due Date:</label>
                    <span>${esc(dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}</span>
                </div>
                <div class="result-item">
                    <label>Time Remaining:</label>
                    <span>${esc(weeksUntilDue)} weeks, ${esc(daysRemaining)} days</span>
                </div>
                <div class="result-item">
                    <label>Current Week:</label>
                    <span>Week ${esc(currentWeek)} (${esc(currentTrimester)} Trimester)</span>
                </div>
                <div class="result-item">
                    <label>Baby Size:</label>
                    <span>${esc(babySize)}</span>
                </div>
            </div>
            <div class="pregnancy-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${esc(Math.round((currentWeek / 40) * 100))}%"></div>
                </div>
                <span>${esc(Math.round((currentWeek / 40) * 100))}% Complete</span>
            </div>
        </div>
    `;
    
    showNotification('Due date calculated successfully!', 'success');
}

// Pregnancy Calculator (for pregnancy page)
function calculatePregnancyWeek() {
    const inputDate = document.getElementById('pregDate').value;
    if (!inputDate) {
        showNotification('Please enter a date', 'error');
        return;
    }
    
    const input = new Date(inputDate);
    const today = new Date();
    
    // Determine if it's last period or due date
    const isDueDate = input > today;
    
    let currentWeek, trimester, careFocus, nextMilestone;
    
    if (isDueDate) {
        // Input is due date
        const lmp = new Date(input);
        lmp.setDate(lmp.getDate() - 280); // 40 weeks back
        const daysSinceLMP = Math.floor((today - lmp) / (1000 * 60 * 60 * 24));
        currentWeek = Math.min(Math.floor(daysSinceLMP / 7), 42);
    } else {
        // Input is last period
        const daysSinceLMP = Math.floor((today - input) / (1000 * 60 * 60 * 24));
        currentWeek = Math.min(Math.floor(daysSinceLMP / 7), 42);
    }
    
    // Determine trimester
    if (currentWeek <= 13) {
        trimester = 'First Trimester';
        careFocus = 'Focus on nutrition, rest, and prenatal vitamins. Schedule your first appointment.';
        nextMilestone = 'First ultrasound and heartbeat check coming soon.';
    } else if (currentWeek <= 27) {
        trimester = 'Second Trimester';
        careFocus = 'Enjoy your energy boost! Focus on exercise, nutrition, and anatomy scan planning.';
        nextMilestone = 'Anatomy scan around week 20 will show baby\'s development.';
    } else {
        trimester = 'Third Trimester';
        careFocus = 'Prepare for birth! Focus on rest, kick counting, and hospital planning.';
        nextMilestone = 'Birth preparation classes and hospital bag packing time.';
    }
    
    // Update UI
    document.getElementById('currentWeek').textContent = `Week ${currentWeek}`;
    document.getElementById('currentTrimester').textContent = trimester;
    document.getElementById('pregCareFocus').textContent = careFocus;
    document.getElementById('pregNextMilestone').textContent = nextMilestone;
    
    showNotification(`You are in week ${currentWeek} of pregnancy`, 'success');
}

function scrollToPregnancyGuide() {
    const weekSection = document.getElementById('weeksSection');
    if (weekSection) {
        weekSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize pregnancy tools
function initializePregnancyTools() {
    console.log('Initializing pregnancy tools...');
    
    // Set up event listeners
    const homeLmpInput = document.getElementById('homeLmpDate');
    const homeCycleInput = document.getElementById('homeCycleLength');
    const homeCalcBtn = document.getElementById('homeCalculateBtn');
    const pregDateInput = document.getElementById('pregDate');
    const pregCalcBtn = document.getElementById('pregCalculateBtn');
    
    if (homeCalcBtn) {
        homeCalcBtn.addEventListener('click', calculateHomeDueDate);
    }
    
    if (pregCalcBtn) {
        pregCalcBtn.addEventListener('click', calculatePregnancyWeek);
    }
    
    // Set default dates
    if (homeLmpInput && !homeLmpInput.value) {
        const defaultLmp = new Date();
        defaultLmp.setDate(defaultLmp.getDate() - 14); // 2 weeks ago
        homeLmpInput.value = defaultLmp.toISOString().split('T')[0];
    }
    
    if (homeCycleInput && !homeCycleInput.value) {
        homeCycleInput.value = '28';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        pregnancyWeekSizes,
        pregnancyWeekPhases,
        calculateHomeDueDate,
        calculatePregnancyWeek,
        scrollToPregnancyGuide,
        initializePregnancyTools
    };
}
