// Advanced Pregnancy Page Functions
// Comprehensive pregnancy companion with 20+ features

// ==================== 1. Pregnancy Week Tracker ====================
function calculatePregnancyWeek(lastPeriodDate) {
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastPeriod);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    const trimester = weeks <= 12 ? 'First' : weeks <= 26 ? 'Second' : 'Third';
    const dueDate = new Date(lastPeriod);
    dueDate.setDate(dueDate.getDate() + 280);
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    return {
        weeks,
        days,
        trimester,
        dueDate: dueDate.toLocaleDateString(),
        daysRemaining: Math.max(0, daysRemaining)
    };
}

function displayPregnancyWeek() {
    const lastPeriodInput = document.getElementById('modalLastPeriodDate') || document.getElementById('lastPeriodDate');
    const weekDisplay = document.getElementById('modalPregnancyWeekDisplay') || document.getElementById('pregnancyWeekDisplay');
    
    if (!lastPeriodInput || !weekDisplay) return;
    
    const lastPeriodDate = lastPeriodInput.value;
    if (!lastPeriodDate) return;
    
    const pregnancyInfo = calculatePregnancyWeek(lastPeriodDate);
    const currentWeek = pregnancyInfo.weeks;
    const weekGuidance = pregnancyWeekGuidance[currentWeek] || pregnancyWeekGuidance[1];
    
    weekDisplay.innerHTML = `
        <div class="pregnancy-week-card">
            <h3>🤰 Pregnancy Progress</h3>
            <div class="week-info">
                <div class="current-week">
                    <span class="week-number">${pregnancyInfo.weeks}</span>
                    <span class="week-label">Weeks</span>
                    <span class="day-number">${pregnancyInfo.days}</span>
                    <span class="day-label">Days</span>
                </div>
                <div class="trimester-info">
                    <span class="trimester-badge">${pregnancyInfo.trimester} Trimester</span>
                </div>
                <div class="due-date-info">
                    <span class="due-date-label">Due Date:</span>
                    <span class="due-date">${pregnancyInfo.dueDate}</span>
                </div>
                <div class="days-remaining">
                    <span class="days-remaining-number">${pregnancyInfo.daysRemaining}</span>
                    <span class="days-remaining-label">Days Remaining</span>
                </div>
            </div>
            
            <div class="week-guidance-section">
                <h4>${weekGuidance.title}</h4>
                
                <div class="guidance-item">
                    <h5>👶 Baby's Development</h5>
                    <p>${weekGuidance.babyDevelopment}</p>
                </div>
                
                <div class="guidance-item">
                    <h5>🌸 Your Body</h5>
                    <p>${weekGuidance.bodyChanges}</p>
                </div>
                
                <div class="guidance-item">
                    <h5>📋 This Week's Guidance</h5>
                    <ul>
                        ${weekGuidance.guidance.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-item">
                    <h5>🥗 Nutrition Focus</h5>
                    <p>${weekGuidance.nutrition}</p>
                </div>
                
                <div class="guidance-item">
                    <h5>🏃 Exercise</h5>
                    <p>${weekGuidance.exercise}</p>
                </div>
                
                <div class="guidance-item warning">
                    <h5>⚠️ Important</h5>
                    <p>${weekGuidance.warnings}</p>
                </div>
            </div>
        </div>
    `;
}

// ==================== 2. Baby Growth Tracker ====================
const babyGrowthByWeek = [
    { week: 4, size: 'Poppy seed', weight: '0.1g', length: '0.4cm', emoji: '🌱' },
    { week: 8, size: 'Raspberry', weight: '1g', length: '1.6cm', emoji: '🫐' },
    { week: 12, size: 'Lime', weight: '14g', length: '5.4cm', emoji: '🍋' },
    { week: 16, size: 'Avocado', weight: '100g', length: '11.6cm', emoji: '🥑' },
    { week: 20, size: 'Banana', weight: '300g', length: '16.4cm', emoji: '🍌' },
    { week: 24, size: 'Corn', weight: '600g', length: '30cm', emoji: '🌽' },
    { week: 28, size: 'Eggplant', weight: '1kg', length: '37.6cm', emoji: '🍆' },
    { week: 32, size: 'Cabbage', weight: '1.7kg', length: '42.4cm', emoji: '🥬' },
    { week: 36, size: 'Papaya', weight: '2.4kg', length: '47.4cm', emoji: '🥭' },
    { week: 40, size: 'Watermelon', weight: '3.4kg', length: '51.2cm', emoji: '🍉' }
];

function displayBabyGrowth(week) {
    const growthDisplay = document.getElementById('modalBabyGrowthDisplay') || document.getElementById('babyGrowthDisplay');
    if (!growthDisplay) return;
    
    const growthInfo = babyGrowthByWeek.reduce((prev, curr) => {
        return (curr.week <= week && curr.week > prev.week) ? curr : prev;
    }, babyGrowthByWeek[0]);
    
    const developmentMilestones = getDevelopmentMilestones(week);
    
    growthDisplay.innerHTML = `
        <div class="baby-growth-card">
            <h3>👶 Baby Growth at Week ${week}</h3>
            <div class="growth-visual">
                <div class="size-comparison">
                    <span class="size-emoji">${growthInfo.emoji}</span>
                    <span class="size-text">Your baby is now the size of a ${growthInfo.size}</span>
                </div>
            </div>
            <div class="growth-stats">
                <div class="stat-item">
                    <span class="stat-label">Weight:</span>
                    <span class="stat-value">${growthInfo.weight}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Length:</span>
                    <span class="stat-value">${growthInfo.length}</span>
                </div>
            </div>
            <div class="development-milestones">
                <h4>Development Milestones:</h4>
                <ul>
                    ${developmentMilestones.map(m => `<li>${m}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function getDevelopmentMilestones(week) {
    if (week <= 12) return ['Heartbeat detectable', 'Major organs forming', 'Fingers and toes developing'];
    if (week <= 24) return ['Baby can hear sounds', 'Facial features forming', 'Skin becoming transparent'];
    if (week <= 36) return ['Baby responds to light', 'Lungs maturing', 'Gaining weight rapidly'];
    return ['Baby fully developed', 'Positioning for birth', 'Ready for delivery'];
}

// ==================== 3. Mother Body Changes Information ====================
const bodyChangesByTrimester = {
    first: [
        'Breast tenderness and enlargement',
        'Morning sickness and nausea',
        'Increased fatigue and tiredness',
        'Frequent urination',
        'Food aversions and cravings',
        'Mood swings and emotional changes'
    ],
    second: [
        'Growing belly visible',
        'Skin changes (stretch marks, linea nigra)',
        'Back pain and pelvic pressure',
        'Increased energy levels',
        'Breast colostrum production',
        'Braxton Hicks contractions'
    ],
    third: [
        'Rapid belly growth',
        'Shortness of breath',
        'Frequent urination increases',
        'Swelling in hands and feet',
        'Difficulty sleeping',
        'Nesting instinct'
    ]
};

function displayBodyChanges(trimester) {
    const bodyChangesDisplay = document.getElementById('modalBodyChangesDisplay') || document.getElementById('bodyChangesDisplay');
    if (!bodyChangesDisplay) return;
    
    const changes = bodyChangesByTrimester[trimester.toLowerCase()] || bodyChangesByTrimester.first;
    
    bodyChangesDisplay.innerHTML = `
        <div class="body-changes-card">
            <h3>🌸 Body Changes - ${trimester} Trimester</h3>
            <div class="changes-list">
                ${changes.map(change => `
                    <div class="change-item">
                        <span class="change-icon">📝</span>
                        <span class="change-text">${change}</span>
                    </div>
                `).join('')}
            </div>
            <div class="changes-tips">
                <p><strong>Tips:</strong> Stay hydrated, get plenty of rest, and wear comfortable clothing. Consult your healthcare provider if you experience severe symptoms.</p>
            </div>
        </div>
    `;
}

// ==================== 4. Daily Pregnancy Tips ====================
const pregnancyDailyTips = [
    { tip: 'Drink at least 2 liters of water today', category: 'Hydration' },
    { tip: 'Take your prenatal vitamins with food', category: 'Nutrition' },
    { tip: 'Get 8 hours of sleep tonight', category: 'Rest' },
    { tip: 'Take a 10-minute walk', category: 'Exercise' },
    { tip: 'Eat iron-rich foods like spinach', category: 'Nutrition' },
    { tip: 'Practice deep breathing exercises', category: 'Mental Health' },
    { tip: 'Avoid processed foods', category: 'Nutrition' },
    { tip: 'Elevate your feet to reduce swelling', category: 'Comfort' },
    { tip: 'Do Kegel exercises', category: 'Exercise' },
    { tip: 'Stay away from alcohol and smoking', category: 'Safety' }
];

// ==================== Pregnancy Week-by-Week Guidance ====================
const pregnancyWeekGuidance = {
    // First Trimester (Weeks 1-12)
    1: {
        title: "Week 1: Preparing for Conception",
        babyDevelopment: "Your body is preparing for ovulation. Your baby hasn't been conceived yet.",
        bodyChanges: "You may not notice any changes yet. Focus on taking prenatal vitamins.",
        guidance: [
            "Start taking folic acid supplements (400-800mcg daily)",
            "Schedule a preconception checkup with your healthcare provider",
            "Review your family medical history",
            "Stop smoking and limit alcohol consumption",
            "Begin tracking your menstrual cycle"
        ],
        nutrition: "Focus on folate-rich foods like leafy greens, fortified cereals, and citrus fruits.",
        exercise: "Continue your regular exercise routine if you're already active.",
        warnings: "Avoid certain medications and consult your doctor before taking any new supplements."
    },
    2: {
        title: "Week 2: Ovulation",
        babyDevelopment: "Ovulation occurs. If fertilization happens, your baby begins as a single cell.",
        bodyChanges: "You may notice increased cervical mucus and mild pelvic discomfort.",
        guidance: [
            "Monitor your ovulation signs if trying to conceive",
            "Continue taking prenatal vitamins",
            "Stay hydrated and eat balanced meals",
            "Reduce caffeine intake to under 200mg daily",
            "Get adequate sleep (7-9 hours)"
        ],
        nutrition: "Include protein-rich foods and healthy fats in your diet.",
        exercise: "Light to moderate exercise is beneficial.",
        warnings: "Avoid hot tubs and saunas if trying to conceive."
    },
    3: {
        title: "Week 3: Fertilization",
        babyDevelopment: "Fertilization occurs. The fertilized egg travels to the uterus.",
        bodyChanges: "You might experience light spotting (implantation bleeding).",
        guidance: [
            "Continue prenatal vitamins with folic acid",
            "Eat small, frequent meals to manage nausea",
            "Get plenty of rest",
            "Avoid alcohol and tobacco completely",
            "Stay hydrated with water and herbal teas"
        ],
        nutrition: "Focus on iron-rich foods and vitamin C to help iron absorption.",
        exercise: "Continue light exercise if you feel up to it.",
        warnings: "Contact your doctor if you experience severe pain or heavy bleeding."
    },
    4: {
        title: "Week 4: Implantation",
        babyDevelopment: "The embryo implants in the uterine wall. The placenta begins forming.",
        bodyChanges: "You may miss your period, feel tired, and have breast tenderness.",
        guidance: [
            "Confirm pregnancy with a home test",
            "Schedule your first prenatal appointment",
            "Continue taking prenatal vitamins",
            "Start eating for pregnancy, not 'eating for two'",
            "Get extra rest and listen to your body"
        ],
        nutrition: "Eat foods rich in protein, calcium, and iron.",
        exercise: "Walking and gentle stretching are excellent.",
        warnings: "Avoid raw or undercooked foods, unpasteurized dairy, and certain fish."
    },
    5: {
        title: "Week 5: Early Pregnancy Symptoms",
        babyDevelopment: "The heart begins forming. Neural tube development starts.",
        bodyChanges: "Morning sickness, fatigue, and frequent urination may begin.",
        guidance: [
            "Manage morning sickness with small, frequent meals",
            "Stay hydrated throughout the day",
            "Get extra sleep and rest when needed",
            "Avoid strong odors that trigger nausea",
            "Consider ginger or peppermint for nausea relief"
        ],
        nutrition: "Eat bland, easily digestible foods if nauseous.",
        exercise: "Short walks can help with nausea and fatigue.",
        warnings: "Contact your doctor if you can't keep any food or fluids down."
    },
    6: {
        title: "Week 6: Heartbeat Begins",
        babyDevelopment: "The baby's heart starts beating. Facial features begin forming.",
        bodyChanges: "Breast tenderness increases. Mood swings are common.",
        guidance: [
            "Schedule your first prenatal visit if you haven't",
            "Start a pregnancy journal to track your journey",
            "Wear comfortable, supportive bras",
            "Share the news with your partner when ready",
            "Research pregnancy-friendly healthcare providers"
        ],
        nutrition: "Include omega-3 rich foods for baby's brain development.",
        exercise: "Continue light exercise with your doctor's approval.",
        warnings: "Avoid heavy lifting and strenuous activities."
    },
    7: {
        title: "Week 7: Rapid Development",
        babyDevelopment: "Brain development accelerates. Arms and legs begin forming.",
        bodyChanges: "Nausea may peak. You might feel more emotional.",
        guidance: [
            "Attend your first prenatal appointment",
            "Ask your doctor about prenatal testing options",
            "Start planning your maternity leave",
            "Research childbirth education classes",
            "Consider joining a pregnancy support group"
        ],
        nutrition: "Eat foods high in choline (eggs, lean meats) for brain development.",
        exercise: "Prenatal yoga can help with stress and flexibility.",
        warnings: "Avoid activities with risk of falling or abdominal trauma."
    },
    8: {
        title: "Week 8: Organ Formation",
        babyDevelopment: "All major organs begin forming. Fingers and toes develop.",
        bodyChanges: "Waist may start thickening. Fatigue continues.",
        guidance: [
            "Start thinking about baby names",
            "Research maternity clothes options",
            "Plan how to announce your pregnancy",
            "Discuss financial planning with your partner",
            "Create a pregnancy budget"
        ],
        nutrition: "Focus on balanced meals with protein, carbs, and healthy fats.",
        exercise: "Swimming is excellent for pregnancy - low impact and refreshing.",
        warnings: "Avoid hot tubs and limit caffeine to 200mg daily."
    },
    9: {
        title: "Week 9: Baby's Size",
        babyDevelopment: "Baby is about the size of a grape. Basic physiology is complete.",
        bodyChanges: "Morning sickness may begin to ease. Energy levels may improve.",
        guidance: [
            "Start researching pediatricians",
            "Consider genetic testing options",
            "Plan your maternity wardrobe",
            "Discuss birthing preferences with your partner",
            "Start a baby registry wishlist"
        ],
        nutrition: "Eat foods rich in vitamin D and calcium for bone development.",
        exercise: "Continue moderate exercise as tolerated.",
        warnings: "Avoid cleaning products with strong chemicals."
    },
    10: {
        title: "Week 10: Critical Period",
        babyDevelopment: "All organs are formed. Baby starts moving (you can't feel it yet).",
        bodyChanges: "Nausea may decrease. Veins become more visible.",
        guidance: [
            "Schedule your nuchal translucency scan (11-14 weeks)",
            "Research prenatal genetic testing options",
            "Start planning your nursery",
            "Consider maternity leave timing",
            "Discuss childcare options with your partner"
        ],
        nutrition: "Include foods high in vitamin A (carrots, sweet potatoes) but avoid excess.",
        exercise: "Walking, swimming, and prenatal yoga are ideal.",
        warnings: "Avoid raw foods, unpasteurized dairy, and high-mercury fish."
    },
    11: {
        title: "Week 11: Rapid Growth",
        babyDevelopment: "Baby's fingers and toes are no longer webbed. Hair follicles form.",
        bodyChanges: "You may start showing slightly. Hair and nails grow faster.",
        guidance: [
            "Attend your prenatal checkup",
            "Discuss prenatal screening test results",
            "Start researching childbirth classes",
            "Plan your pregnancy announcement",
            "Consider creating a pregnancy blog or journal"
        ],
        nutrition: "Eat protein-rich foods for tissue growth.",
        exercise: "Continue your exercise routine with modifications as needed.",
        warnings: "Avoid activities with risk of falling or impact."
    },
    12: {
        title: "Week 12: End of First Trimester",
        babyDevelopment: "Baby is fully formed. Reflexes begin developing.",
        bodyChanges: "Morning sickness typically improves. Energy returns.",
        guidance: [
            "Celebrate reaching the end of the first trimester!",
            "Schedule your anatomy scan (18-22 weeks)",
            "Start telling family and friends if you haven't",
            "Begin researching baby gear",
            "Plan a babymoon trip if desired"
        ],
        nutrition: "Focus on balanced nutrition as appetite returns.",
        exercise: "You may feel more energetic - enjoy moderate exercise.",
        warnings: "Continue avoiding alcohol, tobacco, and excessive caffeine."
    },
    // Second Trimester (Weeks 13-26)
    13: {
        title: "Week 13: Second Trimester Begins",
        babyDevelopment: "Baby's vocal cords are forming. Fingerprints develop.",
        bodyChanges: "You may start feeling more energetic. Morning sickness fades.",
        guidance: [
            "Welcome the 'honeymoon phase' of pregnancy",
            "Start feeling baby's first movements (quickening)",
            "Begin wearing maternity clothes",
            "Research childbirth education options",
            "Start planning your nursery theme"
        ],
        nutrition: "Eat foods rich in iron to prevent anemia.",
        exercise: "Great time to start or continue pregnancy-safe exercises.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    14: {
        title: "Week 14: Active Baby",
        babyDevelopment: "Baby is very active. Hair begins growing.",
        bodyChanges: "You may start 'showing'. Breasts continue growing.",
        guidance: [
            "Schedule your anatomy ultrasound",
            "Start feeling baby's movements (flutters)",
            "Research childbirth classes and sign up",
            "Begin planning your maternity leave",
            "Start a baby registry"
        ],
        nutrition: "Include calcium-rich foods for baby's developing bones.",
        exercise: "Swimming, walking, and prenatal yoga are excellent.",
        warnings: "Avoid lying flat on your back for long periods."
    },
    15: {
        title: "Week 15: Sensory Development",
        babyDevelopment: "Baby can sense light. Legs are longer than arms now.",
        bodyChanges: "You may feel occasional round ligament pain.",
        guidance: [
            "Start tracking baby's movements",
            "Research pediatricians and interview candidates",
            "Begin planning your nursery layout",
            "Consider creating a birth plan",
            "Start thinking about baby names seriously"
        ],
        nutrition: "Eat foods high in omega-3s for brain development.",
        exercise: "Continue moderate exercise with your doctor's approval.",
        warnings: "Stay hydrated and avoid overheating during exercise."
    },
    16: {
        title: "Week 16: First Movements",
        babyDevelopment: "Baby's facial muscles are working. You may feel first kicks.",
        bodyChanges: "You might feel baby's first movements (quickening).",
        guidance: [
            "Celebrate feeling baby's first movements!",
            "Start a kick count routine (later in pregnancy)",
            "Schedule your anatomy scan if not done",
            "Research hospital tour options",
            "Begin shopping for maternity clothes"
        ],
        nutrition: "Focus on protein-rich foods for baby's growth.",
        exercise: "Prenatal yoga helps with flexibility and relaxation.",
        warnings: "Contact your doctor if you don't feel movements by 24 weeks."
    },
    17: {
        title: "Week 17: Fat Accumulation",
        babyDevelopment: "Baby starts accumulating fat. Skeleton hardens.",
        bodyChanges: "Your belly is growing. You may feel more comfortable.",
        guidance: [
            "Start planning your baby shower",
            "Research breastfeeding resources",
            "Consider hiring a doula if interested",
            "Begin preparing siblings (if you have other children)",
            "Start packing your hospital bag gradually"
        ],
        nutrition: "Eat healthy fats for baby's brain development.",
        exercise: "Walking and swimming remain excellent choices.",
        warnings: "Avoid activities with risk of falling."
    },
    18: {
        title: "Week 18: Anatomy Scan",
        babyDevelopment: "Baby's ears are in final position. Hearing is developing.",
        bodyChanges: "You may feel more movement. Back pain may increase.",
        guidance: [
            "Attend your anatomy ultrasound scan",
            "Learn baby's sex if you want to know",
            "Start talking and singing to your baby",
            "Research childbirth classes in your area",
            "Begin planning your maternity leave timeline"
        ],
        nutrition: "Include foods rich in vitamin D and calcium.",
        exercise: "Continue pregnancy-safe exercises with modifications.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    19: {
        title: "Week 19: Sensory Development",
        babyDevelopment: "Baby's senses are developing. Vernix protects skin.",
        bodyChanges: "You may experience round ligament pain and stretch marks.",
        guidance: [
            "Start tracking baby's movement patterns",
            "Research pain management options for labor",
            "Begin planning your birth preferences",
            "Consider taking a hospital tour",
            "Start preparing your nursery"
        ],
        nutrition: "Eat foods high in choline for brain development.",
        exercise: "Prenatal Pilates can help with core strength.",
        warnings: "Avoid lying flat on your back; sleep on your left side."
    },
    20: {
        title: "Week 20: Halfway Point!",
        babyDevelopment: "Baby is swallowing more. Produces meconium.",
        bodyChanges: "Your belly button may pop out. You're halfway there!",
        guidance: [
            "Celebrate reaching the halfway point!",
            "Schedule your glucose screening test (24-28 weeks)",
            "Start planning your baby shower",
            "Research pediatricians and make appointments",
            "Begin finalizing your birth plan"
        ],
        nutrition: "Focus on balanced nutrition with adequate protein.",
        exercise: "Continue moderate exercise as you feel comfortable.",
        warnings: "Watch for signs of gestational diabetes and discuss with doctor."
    },
    21: {
        title: "Week 21: Movement Increases",
        babyDevelopment: "Baby's movements are stronger and more noticeable.",
        bodyChanges: "You may feel more energetic. Stretch marks may appear.",
        guidance: [
            "Start a regular kick counting routine",
            "Research breastfeeding support resources",
            "Begin planning your postpartum recovery",
            "Consider hiring a postpartum doula",
            "Start preparing meals for postpartum"
        ],
        nutrition: "Eat iron-rich foods to support increased blood volume.",
        exercise: "Swimming is excellent for relieving pressure.",
        warnings: "Contact your doctor if movement patterns change significantly."
    },
    22: {
        title: "Week 22: Senses Developing",
        babyDevelopment: "Baby's eyes are formed. Can hear your voice.",
        bodyChanges: "Braxton Hicks contractions may begin.",
        guidance: [
            "Start reading and singing to your baby",
            "Research childbirth education classes",
            "Begin planning your hospital bag",
            "Consider creating a postpartum care plan",
            "Start preparing siblings for the baby"
        ],
        nutrition: "Include foods rich in vitamin A (in moderation).",
        exercise: "Walking and gentle stretching help with discomfort.",
        warnings: "Learn the difference between Braxton Hicks and real contractions."
    },
    23: {
        title: "Week 23: Hearing Develops",
        babyDevelopment: "Baby can hear sounds outside the womb. Skin is still wrinkled.",
        bodyChanges: "You may feel more pressure on your bladder.",
        guidance: [
            "Play music for your baby",
            "Start practicing relaxation techniques",
            "Research pain management options",
            "Begin planning your postpartum support system",
            "Consider taking a breastfeeding class"
        ],
        nutrition: "Eat foods high in omega-3s for brain development.",
        exercise: "Prenatal yoga helps prepare for labor.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    24: {
        title: "Week 24: Viability Milestone",
        babyDevelopment: "Baby is considered viable. Lungs are developing.",
        bodyChanges: "You may feel more frequent movements. Skin may itch.",
        guidance: [
            "Schedule your glucose screening test",
            "Start planning your maternity leave in detail",
            "Research hospital policies and procedures",
            "Begin finalizing your birth plan",
            "Start preparing your nursery"
        ],
        nutrition: "Focus on complex carbs for sustained energy.",
        exercise: "Continue moderate exercise with doctor's approval.",
        warnings: "Watch for signs of gestational diabetes after glucose test."
    },
    25: {
        title: "Week 25: Rapid Growth",
        babyDevelopment: "Baby is gaining weight quickly. Hair continues growing.",
        bodyChanges: "You may experience back pain and pelvic pressure.",
        guidance: [
            "Start preparing your hospital bag",
            "Research car seat installation",
            "Begin planning your postpartum recovery",
            "Consider hiring a night nurse or postpartum doula",
            "Start freezing meals for after baby arrives"
        ],
        nutrition: "Eat protein-rich foods for baby's growth.",
        exercise: "Swimming helps relieve pressure and discomfort.",
        warnings: "Avoid activities that could cause falls or abdominal trauma."
    },
    26: {
        title: "Week 26: Eyes Opening",
        babyDevelopment: "Baby's eyes can open. Responds to sounds.",
        bodyChanges: "You may have trouble sleeping. Braxton Hicks increase.",
        guidance: [
            "Start practicing breathing exercises for labor",
            "Research breastfeeding positions and techniques",
            "Begin planning your baby's sleep space",
            "Consider taking a childbirth preparation class",
            "Start preparing your support system for postpartum"
        ],
        nutrition: "Include foods rich in calcium and vitamin D.",
        exercise: "Prenatal yoga helps with relaxation and preparation.",
        warnings: "Contact your doctor if you experience regular contractions."
    },
    // Third Trimester (Weeks 27-40)
    27: {
        title: "Week 27: Third Trimester Begins",
        babyDevelopment: "Baby has regular sleep cycles. Dreams may begin.",
        bodyChanges: "You may feel more tired. Shortness of breath increases.",
        guidance: [
            "Welcome the final stretch of pregnancy!",
            "Start weekly kick counting",
            "Begin preparing your hospital bag",
            "Research signs of labor",
            "Start planning your postpartum support"
        ],
        nutrition: "Eat smaller, more frequent meals to manage heartburn.",
        exercise: "Gentle walking and stretching help with discomfort.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    28: {
        title: "Week 28: Brain Development",
        babyDevelopment: "Baby's brain is very active. Can blink eyes.",
        bodyChanges: "You may experience more Braxton Hicks contractions.",
        guidance: [
            "Start prenatal appointments every 2 weeks",
            "Begin planning your birth preferences in detail",
            "Research pain management options thoroughly",
            "Start preparing your nursery",
            "Consider taking a hospital tour"
        ],
        nutrition: "Focus on iron-rich foods to prevent anemia.",
        exercise: "Swimming is excellent for relieving pressure.",
        warnings: "Watch for signs of preeclampsia (headaches, vision changes, swelling)."
    },
    29: {
        title: "Week 29: Strong Movements",
        babyDevelopment: "Baby is getting stronger. Kicks are more powerful.",
        bodyChanges: "You may feel more pressure on your ribs and bladder.",
        guidance: [
            "Start tracking baby's movement patterns daily",
            "Begin finalizing your birth plan",
            "Research hospital policies thoroughly",
            "Start preparing your support system",
            "Consider hiring a doula if interested"
        ],
        nutrition: "Eat foods high in protein for baby's growth.",
        exercise: "Prenatal yoga helps with relaxation and preparation.",
        warnings: "Contact your doctor if movement patterns change significantly."
    },
    30: {
        title: "Week 30: Weight Gain",
        babyDevelopment: "Baby is gaining about half a pound per week.",
        bodyChanges: "You may feel more uncomfortable. Sleep is difficult.",
        guidance: [
            "Start preparing your hospital bag if not done",
            "Research car seat safety and installation",
            "Begin planning your postpartum recovery",
            "Start preparing meals for postpartum",
            "Consider hiring postpartum help"
        ],
        nutrition: "Focus on balanced nutrition with adequate calories.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    31: {
        title: "Week 31: Rapid Brain Growth",
        babyDevelopment: "Baby's brain is growing rapidly. Can process information.",
        bodyChanges: "You may experience more frequent urination.",
        guidance: [
            "Start weekly prenatal appointments soon",
            "Begin practicing labor techniques",
            "Research breastfeeding resources thoroughly",
            "Start preparing your nursery",
            "Consider taking a breastfeeding class"
        ],
        nutrition: "Include foods rich in omega-3s for brain development.",
        exercise: "Swimming helps relieve pressure and discomfort.",
        warnings: "Watch for signs of preeclampsia and contact doctor if concerned."
    },
    32: {
        title: "Week 32: Head Down Position",
        babyDevelopment: "Baby is likely head down. Getting ready for birth.",
        bodyChanges: "You may feel more pressure in your pelvis.",
        guidance: [
            "Start weekly prenatal appointments",
            "Begin finalizing your birth plan",
            "Research hospital policies and procedures",
            "Start preparing your support system",
            "Begin planning your postpartum care"
        ],
        nutrition: "Eat smaller, frequent meals to manage heartburn.",
        exercise: "Prenatal yoga helps with relaxation and preparation.",
        warnings: "Contact your doctor if you experience regular contractions."
    },
    33: {
        title: "Week 33: Bones Hardening",
        babyDevelopment: "Baby's bones are hardening except for the skull.",
        bodyChanges: "You may feel more uncomfortable and tired.",
        guidance: [
            "Start preparing for labor mentally and physically",
            "Begin practicing breathing exercises",
            "Research pain management options thoroughly",
            "Start preparing your hospital bag",
            "Consider hiring a doula if interested"
        ],
        nutrition: "Focus on calcium-rich foods for baby's bones.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    34: {
        title: "Week 34: Final Preparations",
        babyDevelopment: "Baby's nervous system and lungs are maturing.",
        bodyChanges: "You may feel more pressure and discomfort.",
        guidance: [
            "Start preparing your hospital bag if not done",
            "Research car seat installation thoroughly",
            "Begin planning your postpartum recovery",
            "Start preparing meals for postpartum",
            "Consider hiring postpartum help"
        ],
        nutrition: "Eat foods high in protein for baby's growth.",
        exercise: "Swimming helps relieve pressure and discomfort.",
        warnings: "Watch for signs of preterm labor and contact doctor if concerned."
    },
    35: {
        title: "Week 35: Almost Ready",
        babyDevelopment: "Baby is gaining weight rapidly. Kidneys are fully developed.",
        bodyChanges: "You may feel more pressure and frequent urination.",
        guidance: [
            "Start weekly prenatal appointments",
            "Begin finalizing your birth preferences",
            "Research hospital policies thoroughly",
            "Start preparing your support system",
            "Begin planning your postpartum care"
        ],
        nutrition: "Focus on balanced nutrition with adequate calories.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Contact your doctor if you experience regular contractions."
    },
    36: {
        title: "Week 36: Full Term Approaches",
        babyDevelopment: "Baby is considered early term. Almost fully developed.",
        bodyChanges: "You may feel more pressure and discomfort.",
        guidance: [
            "Start preparing for labor at any time",
            "Begin practicing labor techniques",
            "Research breastfeeding resources thoroughly",
            "Start preparing your nursery",
            "Consider taking a breastfeeding class"
        ],
        nutrition: "Eat smaller, frequent meals to manage heartburn.",
        exercise: "Prenatal yoga helps with relaxation and preparation.",
        warnings: "Watch for signs of labor and contact doctor if concerned."
    },
    37: {
        title: "Week 37: Early Term",
        babyDevelopment: "Baby is considered early term. Ready for birth.",
        bodyChanges: "You may feel more pressure and discomfort.",
        guidance: [
            "Start preparing for labor at any time",
            "Begin practicing breathing exercises",
            "Research pain management options thoroughly",
            "Start preparing your hospital bag",
            "Consider hiring a doula if interested"
        ],
        nutrition: "Focus on balanced nutrition with adequate calories.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Watch for signs of labor and contact doctor if concerned."
    },
    38: {
        title: "Week 38: Full Term",
        babyDevelopment: "Baby is full term. Fully developed and ready.",
        bodyChanges: "You may feel more pressure and discomfort.",
        guidance: [
            "Prepare for labor at any time",
            "Begin practicing labor techniques",
            "Research hospital policies thoroughly",
            "Start preparing your support system",
            "Begin planning your postpartum care"
        ],
        nutrition: "Eat smaller, frequent meals to manage heartburn.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Contact your doctor if you experience regular contractions."
    },
    39: {
        title: "Week 39: Full Term",
        babyDevelopment: "Baby is full term. Gaining weight daily.",
        bodyChanges: "You may feel more pressure and discomfort.",
        guidance: [
            "Prepare for labor at any time",
            "Begin practicing breathing exercises",
            "Research breastfeeding resources thoroughly",
            "Start preparing your nursery",
            "Consider taking a breastfeeding class"
        ],
        nutrition: "Focus on balanced nutrition with adequate calories.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Watch for signs of labor and contact doctor if concerned."
    },
    40: {
        title: "Week 40: Due Date",
        babyDevelopment: "Baby is fully developed. Ready to meet the world!",
        bodyChanges: "You may feel more pressure and discomfort.",
        guidance: [
            "Prepare for labor at any time",
            "Begin practicing labor techniques",
            "Research hospital policies thoroughly",
            "Start preparing your support system",
            "Begin planning your postpartum care"
        ],
        nutrition: "Eat smaller, frequent meals to manage heartburn.",
        exercise: "Gentle walking helps with circulation and discomfort.",
        warnings: "Contact your doctor if you experience regular contractions."
    }
};

function displayDailyTip() {
    const tipDisplay = document.getElementById('modalDailyTipDisplay') || document.getElementById('dailyTipDisplay');
    if (!tipDisplay) return;
    
    const today = new Date().getDay();
    const tip = pregnancyDailyTips[today % pregnancyDailyTips.length];
    
    tipDisplay.innerHTML = `
        <div class="daily-tip-card">
            <h3>💡 Today's Pregnancy Tip</h3>
            <div class="tip-content">
                <span class="tip-category">${tip.category}</span>
                <p class="tip-text">${tip.tip}</p>
            </div>
        </div>
    `;
}

// ==================== 5. Appointment Reminder System ====================
let appointments = JSON.parse(localStorage.getItem('pregnancyAppointments')) || [];

function addAppointment() {
    const dateInput = document.getElementById('modalAppointmentDate') || document.getElementById('appointmentDate');
    const timeInput = document.getElementById('modalAppointmentTime') || document.getElementById('appointmentTime');
    const typeInput = document.getElementById('modalAppointmentType') || document.getElementById('appointmentType');
    const notesInput = document.getElementById('modalAppointmentNotes') || document.getElementById('appointmentNotes');
    
    if (!dateInput || !timeInput || !typeInput) {
        showPregnancyNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!dateInput.value || !timeInput.value) {
        showPregnancyNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const appointments = JSON.parse(localStorage.getItem('pregnancyAppointments') || '[]');
    const appointment = {
        id: Date.now(),
        date: dateInput.value,
        time: timeInput.value,
        type: typeInput.value,
        notes: notesInput ? notesInput.value : '',
        completed: false
    };
    
    appointments.push(appointment);
    localStorage.setItem('pregnancyAppointments', JSON.stringify(appointments));
    displayAppointments();
    
    // Clear inputs
    dateInput.value = '';
    timeInput.value = '';
    typeInput.value = '';
    if (notesInput) notesInput.value = '';
    
    showPregnancyNotification('Appointment added successfully!', 'success');
    if (window.DB_SYNC) window.DB_SYNC.saveAppointment(appointment);
}

function displayAppointments() {
    const appointmentsDisplay = document.getElementById('modalAppointmentsDisplay') || document.getElementById('appointmentsDisplay');
    if (!appointmentsDisplay) return;
    
    const sortedAppointments = appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    appointmentsDisplay.innerHTML = `
        <div class="appointments-card">
            <h3>📅 Appointments</h3>
            <div class="appointments-list">
                ${sortedAppointments.length === 0 ? 
                    '<p class="no-appointments">No appointments scheduled</p>' :
                    sortedAppointments.map(apt => `
                        <div class="appointment-item ${apt.completed ? 'completed' : ''}">
                            <div class="appointment-date">${new Date(apt.date).toLocaleDateString()}</div>
                            <div class="appointment-time">${apt.time}</div>
                            <div class="appointment-type">${apt.type}</div>
                            ${apt.notes ? `<div class="appointment-notes">${apt.notes}</div>` : ''}
                            <div class="appointment-actions">
                                <button onclick="completeAppointment(${apt.id})" class="btn-complete">
                                    ${apt.completed ? '✓ Completed' : 'Mark Complete'}
                                </button>
                                <button onclick="deleteAppointment(${apt.id})" class="btn-delete">Delete</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

function completeAppointment(id) {
    appointments = appointments.map(apt => 
        apt.id === id ? { ...apt, completed: !apt.completed } : apt
    );
    localStorage.setItem('pregnancyAppointments', JSON.stringify(appointments));
    displayAppointments();
}

function deleteAppointment(id) {
    appointments = appointments.filter(apt => apt.id !== id);
    localStorage.setItem('pregnancyAppointments', JSON.stringify(appointments));
    displayAppointments();
}

// ==================== 6. Medication & Vitamin Reminder ====================
let medications = JSON.parse(localStorage.getItem('pregnancyMedications')) || [];

function addMedication() {
    const nameInput = document.getElementById('modalMedicationName') || document.getElementById('medicationName');
    const dosageInput = document.getElementById('modalMedicationDosage') || document.getElementById('medicationDosage');
    const frequencyInput = document.getElementById('modalMedicationFrequency') || document.getElementById('medicationFrequency');
    
    if (!nameInput || !dosageInput) return;
    
    const medication = {
        id: Date.now(),
        name: nameInput.value,
        dosage: dosageInput.value,
        frequency: frequencyInput ? frequencyInput.value : 'Daily',
        takenToday: false,
        lastTaken: null
    };
    
    medications.push(medication);
    localStorage.setItem('pregnancyMedications', JSON.stringify(medications));
    displayMedications();
    
    // Clear inputs
    nameInput.value = '';
    dosageInput.value = '';
    if (frequencyInput) frequencyInput.value = '';
    if (window.DB_SYNC) window.DB_SYNC.saveActivity({ type: 'medication', ...medication });
}

function displayMedications() {
    const medicationsDisplay = document.getElementById('modalMedicationsDisplay') || document.getElementById('medicationsDisplay');
    if (!medicationsDisplay) return;
    
    medicationsDisplay.innerHTML = `
        <div class="medications-card">
            <h3>💊 Medications & Vitamins</h3>
            <div class="medications-list">
                ${medications.length === 0 ? 
                    '<p class="no-medications">No medications added</p>' :
                    medications.map(med => `
                        <div class="medication-item ${med.takenToday ? 'taken' : ''}">
                            <div class="medication-name">${med.name}</div>
                            <div class="medication-dosage">${med.dosage}</div>
                            <div class="medication-frequency">${med.frequency}</div>
                            <div class="medication-actions">
                                <button onclick="markMedicationTaken(${med.id})" class="btn-taken">
                                    ${med.takenToday ? '✓ Taken Today' : 'Mark as Taken'}
                                </button>
                                <button onclick="deleteMedication(${med.id})" class="btn-delete">Delete</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

function markMedicationTaken(id) {
    medications = medications.map(med => 
        med.id === id ? { ...med, takenToday: !med.takenToday, lastTaken: med.takenToday ? null : new Date().toISOString() } : med
    );
    localStorage.setItem('pregnancyMedications', JSON.stringify(medications));
    displayMedications();
}

function deleteMedication(id) {
    medications = medications.filter(med => med.id !== id);
    localStorage.setItem('pregnancyMedications', JSON.stringify(medications));
    displayMedications();
}

// ==================== 7. Symptom Checker ====================
const symptomDatabase = {
    headache: {
        severity: 'mild',
        advice: 'Rest in a dark room, stay hydrated, try gentle massage. Avoid pain relievers unless approved by your doctor.',
        emergency: false,
        detailedGuidance: {
            title: "Headache",
            description: "Headaches are common during pregnancy due to hormonal changes and increased blood volume.",
            causes: ["Hormonal changes", "Dehydration", "Stress", "Poor posture", "Lack of sleep"],
            immediateActions: [
                "Rest in a quiet, dark room",
                "Apply a cold or warm compress to your forehead or neck",
                "Stay hydrated by drinking water",
                "Practice relaxation techniques or deep breathing",
                "Get adequate sleep and rest"
            ],
            whenToCallDoctor: [
                "Headache is severe or persistent",
                "Accompanied by vision changes or blurred vision",
                "Accompanied by sudden swelling in hands or face",
                "Doesn't improve with rest and hydration",
                "You have a fever along with the headache"
            ],
            prevention: [
                "Stay well-hydrated throughout the day",
                "Maintain regular sleep schedule",
                "Practice stress management techniques",
                "Maintain good posture",
                "Avoid triggers like strong odors or certain foods"
            ]
        }
    },
    bleeding: {
        severity: 'severe',
        advice: 'Contact your healthcare provider immediately. This could be serious.',
        emergency: true,
        detailedGuidance: {
            title: "Vaginal Bleeding",
            description: "Any vaginal bleeding during pregnancy requires medical evaluation.",
            causes: ["Implantation bleeding", "Cervical changes", "Placenta problems", "Miscarriage", "Preterm labor"],
            immediateActions: [
                "Contact your healthcare provider immediately",
                "Wear a pad to monitor the amount of bleeding",
                "Save any tissue that passes for medical evaluation",
                "Rest and avoid sexual activity until evaluated",
                "Do not use tampons or douche"
            ],
            whenToCallDoctor: [
                "Any amount of bleeding during pregnancy",
                "Bleeding is heavy (soaking a pad in an hour)",
                "Accompanied by severe abdominal pain",
                "Accompanied by fever or chills",
                "You pass clots or tissue"
            ],
            prevention: [
                "Attend all prenatal appointments",
                "Report any concerns to your doctor promptly",
                "Avoid heavy lifting and strenuous activity",
                "Follow your doctor's recommendations"
            ]
        }
    },
    fever: {
        severity: 'moderate',
        advice: 'Rest, stay hydrated, monitor temperature. Contact your doctor if fever exceeds 100.4°F (38°C).',
        emergency: false,
        detailedGuidance: {
            title: "Fever",
            description: "Fever during pregnancy can be serious for both mother and baby.",
            causes: ["Infections", "Viral illnesses", "Urinary tract infections", "Flu", "Other illnesses"],
            immediateActions: [
                "Contact your healthcare provider immediately",
                "Take acetaminophen (Tylenol) if approved by your doctor",
                "Stay hydrated by drinking plenty of fluids",
                "Rest and avoid strenuous activity",
                "Monitor your temperature regularly"
            ],
            whenToCallDoctor: [
                "Temperature exceeds 100.4°F (38°C)",
                "Fever lasts more than 24 hours",
                "Accompanied by severe symptoms",
                "You can't reduce the fever with medication",
                "You have other concerning symptoms"
            ],
            prevention: [
                "Wash hands frequently",
                "Avoid sick people when possible",
                "Get recommended vaccinations (flu shot)",
                "Practice good hygiene",
                "Maintain a healthy immune system"
            ]
        }
    },
    backPain: {
        severity: 'mild',
        advice: 'Use proper posture, gentle stretching, warm compress. Consider pregnancy-safe pain relief.',
        emergency: false,
        detailedGuidance: {
            title: "Back Pain",
            description: "Back pain is very common during pregnancy due to physical changes.",
            causes: ["Weight gain", "Posture changes", "Hormonal changes", "Uterus expansion", "Muscle separation"],
            immediateActions: [
                "Apply heat or cold packs to affected area",
                "Practice gentle stretching and prenatal yoga",
                "Maintain good posture",
                "Wear supportive shoes with good arch support",
                "Consider prenatal massage if approved by doctor"
            ],
            whenToCallDoctor: [
                "Pain is severe or debilitating",
                "Accompanied by fever or other symptoms",
                "Radiates down your legs",
                "Causes numbness or weakness",
                "Doesn't improve with self-care measures"
            ],
            prevention: [
                "Maintain good posture throughout the day",
                "Exercise regularly with pregnancy-safe activities",
                "Wear comfortable, supportive shoes",
                "Sleep on your side with pillows for support",
                "Avoid heavy lifting"
            ]
        }
    },
    swelling: {
        severity: 'mild',
        advice: 'Elevate feet, avoid standing for long periods, stay hydrated. Contact doctor if sudden or severe.',
        emergency: false,
        detailedGuidance: {
            title: "Swelling (Edema)",
            description: "Mild swelling is normal, but sudden or severe swelling needs attention.",
            causes: ["Increased blood volume", "Pressure on veins", "Hormonal changes", "Hot weather", "Standing for long periods"],
            immediateActions: [
                "Elevate your feet when sitting or lying down",
                "Avoid standing for long periods",
                "Wear comfortable, supportive shoes",
                "Stay hydrated by drinking water",
                "Avoid tight clothing or socks"
            ],
            whenToCallDoctor: [
                "Sudden or severe swelling in hands or face",
                "Swelling is accompanied by severe headache",
                "Swelling is accompanied by vision changes",
                "Rapid weight gain in a short period",
                "Swelling in only one leg"
            ],
            prevention: [
                "Elevate feet regularly throughout the day",
                "Avoid standing for long periods",
                "Wear compression stockings if recommended",
                "Stay hydrated and limit sodium intake",
                "Exercise regularly with doctor's approval"
            ]
        }
    },
    dizziness: {
        severity: 'moderate',
        advice: 'Sit or lie down, stay hydrated, change positions slowly. Contact doctor if frequent.',
        emergency: false,
        detailedGuidance: {
            title: "Dizziness",
            description: "Dizziness is common due to hormonal and cardiovascular changes.",
            causes: ["Hormonal changes", "Low blood pressure", "Low blood sugar", "Dehydration", "Standing up quickly"],
            immediateActions: [
                "Sit or lie down immediately when feeling dizzy",
                "Stay hydrated by drinking water",
                "Eat small, frequent meals to maintain blood sugar",
                "Avoid standing up quickly",
                "Move slowly when changing positions"
            ],
            whenToCallDoctor: [
                "Dizziness is frequent or severe",
                "Accompanied by fainting or loss of consciousness",
                "Accompanied by chest pain or shortness of breath",
                "Accompanied by severe headache",
                "Doesn't improve with self-care measures"
            ],
            prevention: [
                "Stay well-hydrated throughout the day",
                "Eat regular, balanced meals",
                "Avoid standing for long periods",
                "Move slowly when changing positions",
                "Avoid hot environments when possible"
            ]
        }
    },
    contractions: {
        severity: 'severe',
        advice: 'Time contractions. If regular and increasing in intensity, contact your healthcare provider.',
        emergency: true,
        detailedGuidance: {
            title: "Contractions",
            description: "Understanding the difference between Braxton Hicks and real labor contractions.",
            causes: ["Practice contractions (Braxton Hicks)", "Real labor contractions", "Dehydration", "Overexertion", "Infection"],
            immediateActions: [
                "Time your contractions (frequency and duration)",
                "Drink water and rest if they're irregular",
                "Change positions or walk around",
                "Contact your doctor if you're unsure",
                "Prepare to go to hospital if they're regular and increasing"
            ],
            whenToCallDoctor: [
                "Contractions are regular and increasing in intensity",
                "Contractions occur before 37 weeks (preterm labor)",
                "Contractions are accompanied by vaginal bleeding",
                "Contractions are accompanied by severe pain",
                "Your water breaks or you suspect it has"
            ],
            prevention: [
                "Stay hydrated throughout pregnancy",
                "Avoid overexertion and heavy lifting",
                "Attend all prenatal appointments",
                "Learn the signs of preterm labor",
                "Follow your doctor's activity recommendations"
            ]
        }
    },
    reducedMovement: {
        severity: 'severe',
        advice: 'Contact your healthcare provider immediately. Monitor baby movements.',
        emergency: true,
        detailedGuidance: {
            title: "Reduced Baby Movement",
            description: "Changes in baby's movement patterns need immediate medical attention.",
            causes: ["Baby sleeping", "Reduced amniotic fluid", "Placenta problems", "Baby distress", "Position changes"],
            immediateActions: [
                "Drink something cold or sweet",
                "Lie on your left side and count movements",
                "Gently poke or prod your belly",
                "Contact your healthcare provider immediately",
                "Go to the hospital if directed by your doctor"
            ],
            whenToCallDoctor: [
                "You notice a significant decrease in movement",
                "You don't feel at least 10 movements in 2 hours",
                "Movement patterns change dramatically",
                "You haven't felt movement in 24 hours",
                "You're concerned about baby's movement"
            ],
            prevention: [
                "Count baby's kicks daily starting at 28 weeks",
                "Learn your baby's normal movement patterns",
                "Stay hydrated and eat regular meals",
                "Rest on your left side",
                "Report any concerns to your doctor promptly"
            ]
        }
    }
};

function checkSymptoms() {
    const symptomSelect = document.getElementById('modalSymptomSelect') || document.getElementById('symptomSelect');
    const resultDisplay = document.getElementById('modalSymptomResult') || document.getElementById('symptomResult');
    
    if (!symptomSelect || !resultDisplay) return;
    
    const selectedSymptoms = Array.from(symptomSelect.selectedOptions).map(opt => opt.value);
    
    if (selectedSymptoms.length === 0) {
        resultDisplay.innerHTML = '<p class="no-symptoms">Please select at least one symptom</p>';
        return;
    }
    
    const emergencySymptoms = selectedSymptoms.filter(s => symptomDatabase[s]?.emergency);
    
    resultDisplay.innerHTML = `
        <div class="symptom-result-card ${emergencySymptoms.length > 0 ? 'emergency' : ''}">
            <h3>🏥 Symptom Check Results</h3>
            <div class="symptom-advice">
                ${selectedSymptoms.map(symptom => {
                    const info = symptomDatabase[symptom];
                    const guidance = info.detailedGuidance;
                    return `
                        <div class="symptom-item ${info.severity}">
                            <div class="symptom-name">${guidance.title}</div>
                            <div class="symptom-severity">Severity: ${info.severity}</div>
                            <div class="symptom-description">${guidance.description}</div>
                            
                            <div class="guidance-section">
                                <h5>🔍 Possible Causes</h5>
                                <ul>
                                    ${guidance.causes.map(cause => `<li>${cause}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="guidance-section">
                                <h5>✅ Immediate Actions</h5>
                                <ul>
                                    ${guidance.immediateActions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="guidance-section ${info.severity === 'severe' ? 'urgent' : ''}">
                                <h5>📞 When to Call Your Doctor</h5>
                                <ul>
                                    ${guidance.whenToCallDoctor.map(condition => `<li>${condition}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="guidance-section">
                                <h5>🛡️ Prevention Tips</h5>
                                <ul>
                                    ${guidance.prevention.map(tip => `<li>${tip}</li>`).join('')}
                                </ul>
                            </div>
                            
                            ${info.emergency ? '<div class="emergency-warning">⚠️ Seek immediate medical attention for this symptom</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="disclaimer">
                <p>⚠️ This app does not replace professional medical advice. Always consult your healthcare provider for medical concerns.</p>
            </div>
        </div>
    `;
}

// ==================== 8. Emergency Assistance Button ====================
function callEmergency() {
    if (confirm('Are you sure you want to call emergency services?')) {
        window.location.href = 'tel:911';
    }
}

function contactDoctor() {
    const doctorPhone = localStorage.getItem('doctorPhone');
    if (doctorPhone) {
        window.location.href = `tel:${doctorPhone}`;
    } else {
        alert('Please add your doctor\'s phone number in settings');
    }
}

function shareLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
            window.open(mapUrl, '_blank');
        }, error => {
            alert('Unable to get location. Please enable location services.');
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// ==================== 9. Nutrition Guide ====================
const nutritionGuide = {
    recommended: [
        'Leafy greens (spinach, kale)',
        'Lean proteins (chicken, fish, beans)',
        'Whole grains (oats, quinoa, brown rice)',
        'Dairy or fortified alternatives',
        'Fruits and vegetables',
        'Nuts and seeds',
        'Healthy fats (avocado, olive oil)'
    ],
    avoid: [
        'Raw or undercooked meat and eggs',
        'High-mercury fish (shark, swordfish)',
        'Unpasteurized dairy products',
        'Excessive caffeine',
        'Alcohol',
        'Processed foods with additives',
        'Raw sprouts'
    ],
    weeklyMeals: [
        { day: 'Monday', meals: ['Oatmeal with berries', 'Grilled chicken salad', 'Salmon with vegetables'] },
        { day: 'Tuesday', meals: ['Greek yogurt with nuts', 'Turkey wrap', 'Stir-fry with tofu'] },
        { day: 'Wednesday', meals: ['Smoothie with spinach', 'Quinoa bowl', 'Baked fish'] },
        { day: 'Thursday', meals: ['Whole grain toast', 'Lentil soup', 'Chicken with sweet potato'] },
        { day: 'Friday', meals: ['Eggs with vegetables', 'Tuna salad', 'Pasta with vegetables'] },
        { day: 'Saturday', meals: ['Pancakes with fruit', 'Grilled vegetables', 'Lean beef'] },
        { day: 'Sunday', meals: ['Avocado toast', 'Mixed grain bowl', 'Roasted chicken'] }
    ],
    detailedGuidance: {
        trimesters: {
            first: {
                title: "First Trimester Nutrition",
                focus: "Focus on folate-rich foods and managing nausea",
                keyNutrients: [
                    { nutrient: "Folic Acid", sources: "Leafy greens, fortified cereals, citrus fruits", dailyAmount: "400-800mcg" },
                    { nutrient: "Iron", sources: "Red meat, spinach, fortified cereals", dailyAmount: "27mg" },
                    { nutrient: "Calcium", sources: "Dairy, fortified alternatives, leafy greens", dailyAmount: "1000mg" },
                    { nutrient: "Vitamin D", sources: "Fatty fish, fortified milk, sunlight", dailyAmount: "600IU" }
                ],
                tips: [
                    "Eat small, frequent meals to manage nausea",
                    "Keep crackers by your bed for morning sickness",
                    "Stay hydrated with water and herbal teas",
                    "Avoid strong odors that trigger nausea",
                    "Take prenatal vitamins with food to reduce nausea"
                ],
                mealPlanning: [
                    "Plan 5-6 small meals instead of 3 large ones",
                    "Include protein with every meal to stabilize blood sugar",
                    "Keep healthy snacks readily available",
                    "Prep meals in advance for busy days",
                    "Listen to your body's hunger cues"
                ]
            },
            second: {
                title: "Second Trimester Nutrition",
                focus: "Focus on protein and calcium for baby's growth",
                keyNutrients: [
                    { nutrient: "Protein", sources: "Lean meats, eggs, beans, nuts", dailyAmount: "70-100g" },
                    { nutrient: "Calcium", sources: "Dairy, fortified alternatives, leafy greens", dailyAmount: "1000mg" },
                    { nutrient: "Omega-3", sources: "Salmon, walnuts, flaxseeds", dailyAmount: "200-300mg DHA" },
                    { nutrient: "Vitamin C", sources: "Citrus fruits, bell peppers, strawberries", dailyAmount: "85mg" }
                ],
                tips: [
                    "Increase protein intake for baby's growth",
                    "Include calcium-rich foods for bone development",
                    "Eat omega-3 rich foods for brain development",
                    "Stay hydrated to support increased blood volume",
                    "Choose whole grains for sustained energy"
                ],
                mealPlanning: [
                    "Plan balanced meals with protein, carbs, and healthy fats",
                    "Include a variety of colorful fruits and vegetables",
                    "Choose lean protein sources",
                    "Opt for complex carbohydrates",
                    "Include healthy snacks between meals"
                ]
            },
            third: {
                title: "Third Trimester Nutrition",
                focus: "Focus on iron and preparing for breastfeeding",
                keyNutrients: [
                    { nutrient: "Iron", sources: "Red meat, spinach, fortified cereals", dailyAmount: "27mg" },
                    { nutrient: "Protein", sources: "Lean meats, eggs, beans, nuts", dailyAmount: "70-100g" },
                    { nutrient: "Fiber", sources: "Whole grains, fruits, vegetables", dailyAmount: "25-30g" },
                    { nutrient: "Vitamin K", sources: "Leafy greens, broccoli, Brussels sprouts", dailyAmount: "90mcg" }
                ],
                tips: [
                    "Increase iron intake to prevent anemia",
                    "Eat fiber-rich foods to prevent constipation",
                    "Stay hydrated to support amniotic fluid",
                    "Continue taking prenatal vitamins",
                    "Prepare for breastfeeding with proper nutrition"
                ],
                mealPlanning: [
                    "Eat smaller, more frequent meals to manage heartburn",
                    "Include iron-rich foods with vitamin C for absorption",
                    "Choose high-fiber foods to prevent constipation",
                    "Stay well-hydrated throughout the day",
                    "Prepare healthy meals for postpartum recovery"
                ]
            }
        },
        mealPlanningTips: [
            "Plan your meals for the week ahead",
            "Prep ingredients in advance to save time",
            "Keep healthy snacks easily accessible",
            "Listen to your body's hunger and fullness cues",
            "Stay hydrated throughout the day",
            "Include a variety of foods for balanced nutrition",
            "Don't skip meals, especially breakfast",
            "Allow yourself occasional treats in moderation"
        ],
        hydration: {
            dailyGoal: "8-10 glasses of water per day",
            tips: [
                "Carry a water bottle with you everywhere",
                "Drink a glass of water with each meal",
                "Set reminders to drink water throughout the day",
                "Include hydrating foods like fruits and vegetables",
                "Limit caffeine to 200mg per day",
                "Avoid sugary drinks and excessive fruit juices"
            ],
            signsOfDehydration: [
                "Dark yellow urine",
                "Dry mouth and lips",
                "Fatigue and dizziness",
                "Infrequent urination",
                "Headaches"
            ]
        },
        cravings: {
            understanding: "Cravings are normal during pregnancy due to hormonal changes",
            healthyAlternatives: [
                { craving: "Sweets", alternative: "Fresh fruit, dark chocolate, yogurt with berries" },
                { craving: "Salty foods", alternative: "Nuts, seeds, roasted chickpeas" },
                { craving: "Carbs", alternative: "Whole grains, sweet potatoes, quinoa" },
                { craving: "Fatty foods", alternative: "Avocado, nuts, olive oil" },
                { craving: "Ice cream", alternative: "Frozen yogurt, smoothie bowls" }
            ],
            tips: [
                "Listen to your body but make healthy choices",
                "Practice moderation with indulgences",
                "Stay hydrated as thirst can mimic hunger",
                "Eat balanced meals to reduce cravings",
                "Distract yourself with activities when cravings strike"
            ]
        }
    }
};

function displayNutritionGuide() {
    const nutritionDisplay = document.getElementById('modalNutritionGuideDisplay') || document.getElementById('nutritionGuideDisplay');
    if (!nutritionDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    let currentTrimester = 'first';
    
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - lastPeriod) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        
        if (currentWeek <= 12) currentTrimester = 'first';
        else if (currentWeek <= 26) currentTrimester = 'second';
        else currentTrimester = 'third';
    }
    
    const trimesterGuidance = nutritionGuide.detailedGuidance.trimesters[currentTrimester];
    
    nutritionDisplay.innerHTML = `
        <div class="nutrition-guide-card">
            <h3>🥗 Nutrition Guide</h3>
            
            <div class="current-trimester-section">
                <h4>${trimesterGuidance.title}</h4>
                <p class="trimester-focus">${trimesterGuidance.focus}</p>
                
                <div class="guidance-section">
                    <h5>🔑 Key Nutrients</h5>
                    <div class="nutrients-grid">
                        ${trimesterGuidance.keyNutrients.map(nutrient => `
                            <div class="nutrient-item">
                                <div class="nutrient-name">${nutrient.nutrient}</div>
                                <div class="nutrient-amount">${nutrient.dailyAmount}</div>
                                <div class="nutrient-sources">${nutrient.sources}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="guidance-section">
                    <h5>💡 Tips for This Trimester</h5>
                    <ul>
                        ${trimesterGuidance.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section">
                    <h5>📋 Meal Planning</h5>
                    <ul>
                        ${trimesterGuidance.mealPlanning.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="nutrition-sections">
                <div class="nutrition-section">
                    <h4>✅ Recommended Foods</h4>
                    <ul>
                        ${nutritionGuide.recommended.map(food => `<li>${food}</li>`).join('')}
                    </ul>
                </div>
                <div class="nutrition-section">
                    <h4>❌ Foods to Avoid</h4>
                    <ul>
                        ${nutritionGuide.avoid.map(food => `<li>${food}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>💧 Hydration Guide</h4>
                <p><strong>Daily Goal:</strong> ${nutritionGuide.detailedGuidance.hydration.dailyGoal}</p>
                <div class="hydration-tips">
                    <h5>Tips:</h5>
                    <ul>
                        ${nutritionGuide.detailedGuidance.hydration.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                    <h5>Signs of Dehydration:</h5>
                    <ul>
                        ${nutritionGuide.detailedGuidance.hydration.signsOfDehydration.map(sign => `<li>${sign}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🍫 Managing Cravings</h4>
                <p>${nutritionGuide.detailedGuidance.cravings.understanding}</p>
                <div class="cravings-alternatives">
                    <h5>Healthy Alternatives:</h5>
                    ${nutritionGuide.detailedGuidance.cravings.healthyAlternatives.map(alt => `
                        <div class="craving-alternative">
                            <span class="craving-item">${alt.craving}</span>
                            <span class="alternative-arrow">→</span>
                            <span class="alternative-item">${alt.alternative}</span>
                        </div>
                    `).join('')}
                    <h5>Tips:</h5>
                    <ul>
                        ${nutritionGuide.detailedGuidance.cravings.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="nutrition-section">
                <h4>📅 Weekly Meal Suggestions</h4>
                ${nutritionGuide.weeklyMeals.map(day => `
                    <div class="meal-day">
                        <h5>${day.day}</h5>
                        <ul>
                            ${day.meals.map(meal => `<li>${meal}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== 10. Exercise & Fitness Section ====================
const pregnancyExercises = {
    safe: [
        { name: 'Walking', duration: '30 minutes daily', benefit: 'Improves circulation and mood' },
        { name: 'Swimming', duration: '20-30 minutes', benefit: 'Low-impact full body workout' },
        { name: 'Prenatal Yoga', duration: '20-30 minutes', benefit: 'Improves flexibility and reduces stress' },
        { name: 'Stationary Cycling', duration: '20-30 minutes', benefit: 'Cardio without joint stress' },
        { name: 'Kegel Exercises', duration: 'Multiple times daily', benefit: 'Strengthens pelvic floor' }
    ],
    stretching: [
        'Cat-cow stretch',
        'Pelvic tilts',
        'Gentle neck rolls',
        'Shoulder stretches',
        'Ankle circles'
    ],
    breathing: [
        'Deep belly breathing',
        '4-7-8 breathing technique',
        'Alternate nostril breathing',
        'Lamaze breathing patterns'
    ],
    detailedGuidance: {
        trimesters: {
            first: {
                title: "First Trimester Exercise",
                focus: "Focus on maintaining fitness while managing fatigue and nausea",
                recommended: [
                    { exercise: "Walking", frequency: "20-30 minutes daily", intensity: "Light to moderate", notes: "Great for managing nausea and fatigue" },
                    { exercise: "Prenatal Yoga", frequency: "2-3 times per week", intensity: "Gentle", notes: "Helps with stress and flexibility" },
                    { exercise: "Swimming", frequency: "2-3 times per week", intensity: "Light", notes: "Relieves pressure on joints" },
                    { exercise: "Stationary Cycling", frequency: "2-3 times per week", intensity: "Light to moderate", notes: "Good cardio without impact" }
                ],
                precautions: [
                    "Listen to your body and rest when needed",
                    "Avoid exercises that require lying flat on your back",
                    "Stay hydrated during exercise",
                    "Avoid overheating - exercise in cool environments",
                    "Don't push yourself to exhaustion"
                ],
                benefits: [
                    "Reduces fatigue and improves energy",
                    "Helps manage morning sickness",
                    "Improves mood and reduces stress",
                    "Prepares body for pregnancy changes",
                    "Promotes better sleep"
                ]
            },
            second: {
                title: "Second Trimester Exercise",
                focus: "Focus on strength and preparing for labor",
                recommended: [
                    { exercise: "Walking", frequency: "30 minutes daily", intensity: "Moderate", notes: "Maintain cardiovascular health" },
                    { exercise: "Prenatal Yoga", frequency: "3-4 times per week", intensity: "Moderate", notes: "Focus on pelvic floor and breathing" },
                    { exercise: "Swimming", frequency: "3-4 times per week", intensity: "Moderate", notes: "Excellent for relieving back pain" },
                    { exercise: "Strength Training", frequency: "2-3 times per week", intensity: "Light", notes: "Focus on core and back strength" },
                    { exercise: "Kegel Exercises", frequency: "Daily", intensity: "Light", notes: "Strengthen pelvic floor for labor" }
                ],
                precautions: [
                    "Avoid exercises with risk of falling",
                    "Be careful with balance as center of gravity shifts",
                    "Avoid lying flat on your back after 16 weeks",
                    "Modify exercises as your belly grows",
                    "Wear supportive shoes and comfortable clothing"
                ],
                benefits: [
                    "Builds strength for labor and delivery",
                    "Reduces back pain and discomfort",
                    "Improves posture and balance",
                    "Helps manage weight gain",
                    "Reduces risk of gestational diabetes"
                ]
            },
            third: {
                title: "Third Trimester Exercise",
                focus: "Focus on labor preparation and comfort",
                recommended: [
                    { exercise: "Walking", frequency: "20-30 minutes daily", intensity: "Light to moderate", notes: "Helps with labor positioning" },
                    { exercise: "Prenatal Yoga", frequency: "3-4 times per week", intensity: "Gentle", notes: "Focus on breathing and relaxation" },
                    { exercise: "Swimming", frequency: "2-3 times per week", intensity: "Light", notes: "Relieves pressure and swelling" },
                    { exercise: "Pelvic Tilts", frequency: "Daily", intensity: "Light", notes: "Strengthens core and relieves back pain" },
                    { exercise: "Squats", frequency: "2-3 times per week", intensity: "Light", notes: "Prepares pelvic floor for labor" }
                ],
                precautions: [
                    "Avoid high-impact activities",
                    "Be extra careful with balance",
                    "Avoid exercises that require jumping or quick movements",
                    "Listen to your body - stop if anything feels uncomfortable",
                    "Stay close to support when doing balance exercises"
                ],
                benefits: [
                    "Prepares body for labor and delivery",
                    "Reduces common third trimester discomforts",
                    "Helps with optimal fetal positioning",
                    "Improves sleep quality",
                    "Reduces anxiety about labor"
                ]
            }
        },
        laborPreparation: {
            title: "Labor Preparation Exercises",
            exercises: [
                {
                    name: "Squats",
                    instructions: "Stand with feet shoulder-width apart, lower into squat position, hold for 10 seconds, return to standing",
                    repetitions: "10-15 repetitions, 2-3 times daily",
                    benefit: "Opens pelvis and strengthens legs for labor"
                },
                {
                    name: "Pelvic Tilts",
                    instructions: "On hands and knees, arch back like cat, then release and tilt pelvis forward",
                    repetitions: "10-15 repetitions, 2-3 times daily",
                    benefit: "Strengthens core and relieves back pain"
                },
                {
                    name: "Butterfly Stretch",
                    instructions: "Sit with soles of feet together, gently press knees toward floor",
                    repetitions: "Hold for 30 seconds, repeat 3-5 times",
                    benefit: "Opens hips and pelvic area"
                },
                {
                    name: "Kegel Exercises",
                    instructions: "Contract pelvic floor muscles as if stopping urine flow, hold for 5-10 seconds, release",
                    repetitions: "10-15 contractions, 3-4 times daily",
                    benefit: "Strengthens pelvic floor for pushing phase"
                },
                {
                    name: "Deep Squats with Support",
                    instructions: "Hold onto support, lower into deep squat, hold for 30 seconds, return to standing",
                    repetitions: "5-10 repetitions, 2-3 times daily",
                    benefit: "Opens pelvis and practices labor position"
                }
            ]
        },
        safetyGuidelines: {
            always: [
                "Get approval from your healthcare provider before starting any exercise program",
                "Stay hydrated - drink water before, during, and after exercise",
                "Wear comfortable, supportive clothing and shoes",
                "Exercise in a cool, well-ventilated environment",
                "Warm up before exercise and cool down afterward"
            ],
            avoid: [
                "Contact sports and activities with risk of falling",
                "Exercises that require lying flat on your back after 16 weeks",
                "Hot yoga or exercising in hot environments",
                "Activities that cause dizziness or shortness of breath",
                "Exercises that cause pain or discomfort"
            ],
            warningSigns: [
                "Stop exercising and contact your doctor if you experience:",
                "Vaginal bleeding or spotting",
                "Dizziness or fainting",
                "Chest pain or shortness of breath",
                "Regular contractions",
                "Leakage of amniotic fluid",
                "Decreased fetal movement"
            ]
        }
    }
};

function displayExerciseSection() {
    const exerciseDisplay = document.getElementById('modalExerciseDisplay') || document.getElementById('exerciseDisplay');
    if (!exerciseDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    let currentTrimester = 'first';
    
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - lastPeriod) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        
        if (currentWeek <= 12) currentTrimester = 'first';
        else if (currentWeek <= 26) currentTrimester = 'second';
        else currentTrimester = 'third';
    }
    
    const trimesterGuidance = pregnancyExercises.detailedGuidance.trimesters[currentTrimester];
    const laborPrep = pregnancyExercises.detailedGuidance.laborPreparation;
    const safety = pregnancyExercises.detailedGuidance.safetyGuidelines;
    
    exerciseDisplay.innerHTML = `
        <div class="exercise-card">
            <h3>🏃 Exercise & Fitness</h3>
            
            <div class="current-trimester-section">
                <h4>${trimesterGuidance.title}</h4>
                <p class="trimester-focus">${trimesterGuidance.focus}</p>
                
                <div class="guidance-section">
                    <h5>🏋️ Recommended Exercises</h5>
                    <div class="exercises-grid">
                        ${trimesterGuidance.recommended.map(exercise => `
                            <div class="exercise-item">
                                <div class="exercise-name">${exercise.exercise}</div>
                                <div class="exercise-details">
                                    <span class="exercise-frequency">${exercise.frequency}</span>
                                    <span class="exercise-intensity">${exercise.intensity}</span>
                                </div>
                                <div class="exercise-notes">${exercise.notes}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="guidance-section">
                    <h5>⚠️ Precautions</h5>
                    <ul>
                        ${trimesterGuidance.precautions.map(precaution => `<li>${precaution}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section">
                    <h5>✨ Benefits</h5>
                    <ul>
                        ${trimesterGuidance.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🤰 Labor Preparation Exercises</h4>
                <div class="labor-exercises">
                    ${laborPrep.exercises.map(exercise => `
                        <div class="labor-exercise-item">
                            <div class="labor-exercise-name">${exercise.name}</div>
                            <div class="labor-exercise-instructions">${exercise.instructions}</div>
                            <div class="labor-exercise-repetitions">${exercise.repetitions}</div>
                            <div class="labor-exercise-benefit">${exercise.benefit}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🛡️ Safety Guidelines</h4>
                <div class="safety-sections">
                    <div class="safety-subsection">
                        <h5>Always:</h5>
                        <ul>
                            ${safety.always.map(guideline => `<li>${guideline}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="safety-subsection">
                        <h5>Avoid:</h5>
                        <ul>
                            ${safety.avoid.map(guideline => `<li>${guideline}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="safety-subsection warning">
                        <h5>Warning Signs:</h5>
                        <ul>
                            ${safety.warningSigns.map(sign => `<li>${sign}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="exercise-sections">
                <div class="exercise-section">
                    <h4>🧘 Stretching Exercises</h4>
                    <ul>
                        ${pregnancyExercises.stretching.map(stretch => `<li>${stretch}</li>`).join('')}
                    </ul>
                </div>
                <div class="exercise-section">
                    <h4>🌬️ Breathing Exercises</h4>
                    <ul>
                        ${pregnancyExercises.breathing.map(breath => `<li>${breath}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// ==================== 11. Mental Health & Wellness Guidance ====================
const mentalHealthGuidance = {
    trimesters: {
        first: {
            title: "First Trimester Mental Health",
            focus: "Managing anxiety, mood changes, and adjusting to pregnancy",
            challenges: [
                "Hormonal changes causing mood swings",
                "Anxiety about pregnancy and becoming a mother",
                "Fatigue affecting emotional well-being",
                "Morning sickness impacting daily life",
                "Fear of miscarriage or complications"
            ],
            copingStrategies: [
                "Practice mindfulness and deep breathing exercises",
                "Join a pregnancy support group or online community",
                "Share your feelings with your partner and loved ones",
                "Get adequate rest and prioritize self-care",
                "Consider journaling to process emotions"
            ],
            selfCare: [
                "Set realistic expectations for yourself",
                "Take breaks when feeling overwhelmed",
                "Engage in activities that bring you joy",
                "Maintain social connections",
                "Practice gentle exercise like walking or yoga"
            ],
            whenToSeekHelp: [
                "Persistent sadness or hopelessness",
                "Severe anxiety that interferes with daily life",
                "Difficulty bonding with the pregnancy",
                "Thoughts of harming yourself",
                "Inability to care for yourself"
            ]
        },
        second: {
            title: "Second Trimester Mental Health",
            focus: "Embracing pregnancy changes and preparing emotionally",
            challenges: [
                "Body image concerns as belly grows",
                "Anxiety about baby's health",
                "Financial stress related to baby preparations",
                "Relationship changes with partner",
                "Work-life balance challenges"
            ],
            copingStrategies: [
                "Practice positive affirmations about your body",
                "Educate yourself about pregnancy and childbirth",
                "Create a budget and financial plan",
                "Communicate openly with your partner",
                "Set boundaries at work and home"
            ],
            selfCare: [
                "Celebrate your body's changes",
                "Take time for hobbies and interests",
                "Plan enjoyable activities with your partner",
                "Practice relaxation techniques",
                "Stay connected with friends and family"
            ],
            whenToSeekHelp: [
                "Persistent negative thoughts about your body",
                "Overwhelming anxiety about baby's health",
                "Relationship conflicts you can't resolve",
                "Depression symptoms that don't improve",
                "Difficulty functioning at work or home"
            ]
        },
        third: {
            title: "Third Trimester Mental Health",
            focus: "Preparing for labor and managing anticipation",
            challenges: [
                "Anxiety about labor and delivery",
                "Fear of parenting and life changes",
                "Physical discomfort affecting mood",
                "Nesting instincts and stress",
                "Concerns about postpartum period"
            ],
            copingStrategies: [
                "Take childbirth education classes",
                "Create a detailed birth plan",
                "Practice labor preparation exercises",
                "Visualize positive birth experiences",
                "Prepare for postpartum support"
            ],
            selfCare: [
                "Rest and prioritize sleep",
                "Practice relaxation and breathing techniques",
                "Delegate tasks and ask for help",
                "Focus on one day at a time",
                "Connect with other expectant mothers"
            ],
            whenToSeekHelp: [
                "Intense fear of labor that interferes with daily life",
                "Panic attacks or severe anxiety",
                "Depression symptoms worsening",
                "Thoughts of not wanting the baby",
                "Inability to prepare for baby's arrival"
            ]
        }
    },
    relaxationTechniques: [
        {
            name: "Deep Breathing",
            instructions: "Breathe in deeply through your nose for 4 counts, hold for 4 counts, exhale through your mouth for 4 counts",
            benefits: "Reduces stress, lowers blood pressure, calms nervous system",
            practice: "Practice 5-10 minutes daily"
        },
        {
            name: "Progressive Muscle Relaxation",
            instructions: "Tense and relax each muscle group from toes to head, holding tension for 5 seconds then releasing",
            benefits: "Reduces physical tension, improves sleep, reduces anxiety",
            practice: "Practice 10-15 minutes before bed"
        },
        {
            name: "Guided Imagery",
            instructions: "Close your eyes and visualize a peaceful place, focusing on sensory details",
            benefits: "Reduces anxiety, promotes relaxation, improves mood",
            practice: "Practice 10-20 minutes when stressed"
        },
        {
            name: "Mindfulness Meditation",
            instructions: "Focus on the present moment, observing thoughts without judgment",
            benefits: "Reduces stress, improves emotional regulation, increases self-awareness",
            practice: "Practice 10-15 minutes daily"
        },
        {
            name: "Prenatal Yoga",
            instructions: "Gentle yoga poses designed for pregnancy, focusing on breathing and relaxation",
            benefits: "Reduces stress, improves flexibility, prepares body for labor",
            practice: "Practice 20-30 minutes 2-3 times per week"
        }
    ],
    sleepTips: [
        "Establish a consistent bedtime routine",
        "Sleep on your left side with pillows for support",
        "Limit caffeine intake, especially in the afternoon",
        "Avoid large meals close to bedtime",
        "Keep your bedroom cool, dark, and quiet",
        "Practice relaxation techniques before bed",
        "Limit screen time before sleeping",
        "Use pregnancy pillows for comfort",
        "Take short naps during the day if needed",
        "Stay hydrated but limit fluids close to bedtime"
    ],
    relationshipTips: [
        "Communicate openly about your feelings and needs",
        "Include your partner in pregnancy appointments and classes",
        "Set aside quality time together before baby arrives",
        "Discuss parenting styles and expectations",
        "Be patient with each other during this transition",
        "Seek counseling if relationship issues arise",
        "Express gratitude and appreciation regularly",
        "Plan activities to strengthen your bond",
        "Discuss division of household responsibilities",
        "Prepare for changes in intimacy and romance"
    ],
    resources: {
        support: [
            "Pregnancy support groups",
            "Online pregnancy communities",
            "Therapy or counseling services",
            "Pregnancy hotlines",
            "Doulas and birth coaches"
        ],
        education: [
            "Childbirth education classes",
            "Parenting classes",
            "Breastfeeding classes",
            "Online pregnancy resources",
            "Books on pregnancy and parenting"
        ],
        professionalHelp: [
            "Therapist specializing in perinatal mental health",
            "Psychiatrist for medication management if needed",
            "Social worker for resources and support",
            "Your healthcare provider for referrals",
            "Crisis hotlines for immediate support"
        ]
    }
};

function displayMentalHealthSection() {
    const mentalHealthDisplay = document.getElementById('modalMentalHealthDisplay') || document.getElementById('mentalHealthDisplay');
    if (!mentalHealthDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    let currentTrimester = 'first';
    
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - lastPeriod) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        
        if (currentWeek <= 12) currentTrimester = 'first';
        else if (currentWeek <= 26) currentTrimester = 'second';
        else currentTrimester = 'third';
    }
    
    const trimesterGuidance = mentalHealthGuidance.trimesters[currentTrimester];
    const relaxation = mentalHealthGuidance.relaxationTechniques;
    const resources = mentalHealthGuidance.resources;
    
    mentalHealthDisplay.innerHTML = `
        <div class="mental-health-card">
            <h3>🧠 Mental Health & Wellness</h3>
            
            <div class="current-trimester-section">
                <h4>${trimesterGuidance.title}</h4>
                <p class="trimester-focus">${trimesterGuidance.focus}</p>
                
                <div class="guidance-section">
                    <h5>😰 Common Challenges</h5>
                    <ul>
                        ${trimesterGuidance.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section">
                    <h5>💪 Coping Strategies</h5>
                    <ul>
                        ${trimesterGuidance.copingStrategies.map(strategy => `<li>${strategy}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section">
                    <h5>🌸 Self-Care Tips</h5>
                    <ul>
                        ${trimesterGuidance.selfCare.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section urgent">
                    <h5>🆘 When to Seek Professional Help</h5>
                    <ul>
                        ${trimesterGuidance.whenToSeekHelp.map(sign => `<li>${sign}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🧘 Relaxation Techniques</h4>
                <div class="relaxation-grid">
                    ${relaxation.map(technique => `
                        <div class="relaxation-item">
                            <div class="relaxation-name">${technique.name}</div>
                            <div class="relaxation-instructions">${technique.instructions}</div>
                            <div class="relaxation-benefit">${technique.benefits}</div>
                            <div class="relaxation-practice">${technique.practice}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>😴 Sleep Tips</h4>
                <ul>
                    ${mentalHealthGuidance.sleepTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            <div class="guidance-section">
                <h4>💑 Relationship Tips</h4>
                <ul>
                    ${mentalHealthGuidance.relationshipTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            <div class="guidance-section">
                <h4>📚 Resources & Support</h4>
                <div class="resources-grid">
                    <div class="resource-category">
                        <h5>Support</h5>
                        <ul>
                            ${resources.support.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="resource-category">
                        <h5>Education</h5>
                        <ul>
                            ${resources.education.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="resource-category">
                        <h5>Professional Help</h5>
                        <ul>
                            ${resources.professionalHelp.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== 13. Baby Preparation Checklist ====================
const babyPreparationChecklist = {
    categories: {
        nursery: {
            title: "Nursery Essentials",
            items: [
                { item: "Crib or bassinet", priority: "high", timeline: "By 36 weeks" },
                { item: "Mattress and waterproof cover", priority: "high", timeline: "By 36 weeks" },
                { item: "Changing table", priority: "medium", timeline: "By 36 weeks" },
                { item: "Rocking chair or glider", priority: "medium", timeline: "By 36 weeks" },
                { item: "Baby monitor", priority: "high", timeline: "By 36 weeks" },
                { item: "Blackout curtains", priority: "low", timeline: "By 36 weeks" },
                { item: "Storage bins for clothes", priority: "medium", timeline: "By 36 weeks" },
                { item: "Night light", priority: "low", timeline: "By 36 weeks" }
            ]
        },
        clothing: {
            title: "Baby Clothing",
            items: [
                { item: "Newborn diapers (2-3 packs)", priority: "high", timeline: "By 36 weeks" },
                { item: "Size 1 diapers (2-3 packs)", priority: "high", timeline: "By 36 weeks" },
                { item: "Newborn onesies (6-8)", priority: "high", timeline: "By 36 weeks" },
                { item: "0-3 month onesies (6-8)", priority: "high", timeline: "By 36 weeks" },
                { item: "Sleep sacks/swaddles (3-4)", priority: "high", timeline: "By 36 weeks" },
                { item: "Hats (2-3)", priority: "medium", timeline: "By 36 weeks" },
                { item: "Socks/booties (4-6 pairs)", priority: "medium", timeline: "By 36 weeks" },
                { item: "Burp cloths (10-12)", priority: "high", timeline: "By 36 weeks" }
            ]
        },
        feeding: {
            title: "Feeding Supplies",
            items: [
                { item: "Breast pump (if breastfeeding)", priority: "high", timeline: "By 36 weeks" },
                { item: "Nursing bras (3-4)", priority: "high", timeline: "By 36 weeks" },
                { item: "Nursing pads", priority: "high", timeline: "By 36 weeks" },
                { item: "Bottles (4-6)", priority: "high", timeline: "By 36 weeks" },
                { item: "Nipples (various sizes)", priority: "high", timeline: "By 36 weeks" },
                { item: "Bottle brush", priority: "medium", timeline: "By 36 weeks" },
                { item: "Formula (if not breastfeeding)", priority: "high", timeline: "By 36 weeks" },
                { item: "Bottle sterilizer", priority: "low", timeline: "By 36 weeks" }
            ]
        },
        diapering: {
            title: "Diapering Supplies",
            items: [
                { item: "Diaper bag", priority: "high", timeline: "By 36 weeks" },
                { item: "Portable changing pad", priority: "high", timeline: "By 36 weeks" },
                { item: "Wipes (2-3 packs)", priority: "high", timeline: "By 36 weeks" },
                { item: "Diaper rash cream", priority: "high", timeline: "By 36 weeks" },
                { item: "Diaper pail", priority: "medium", timeline: "By 36 weeks" },
                { item: "Hand sanitizer", priority: "high", timeline: "By 36 weeks" },
                { item: "Extra clothes for diaper bag", priority: "high", timeline: "By 36 weeks" },
                { item: "Disposable bags for soiled diapers", priority: "medium", timeline: "By 36 weeks" }
            ]
        },
        health: {
            title: "Health & Safety",
            items: [
                { item: "Baby thermometer", priority: "high", timeline: "By 36 weeks" },
                { item: "Nasal aspirator", priority: "high", timeline: "By 36 weeks" },
                { item: "Baby nail clippers", priority: "medium", timeline: "By 36 weeks" },
                { item: "Baby shampoo and wash", priority: "medium", timeline: "By 36 weeks" },
                { item: "Baby lotion", priority: "medium", timeline: "By 36 weeks" },
                { item: "First aid kit", priority: "high", timeline: "By 36 weeks" },
                { item: "Car seat (properly installed)", priority: "high", timeline: "By 36 weeks" },
                { item: "Baby-proofing supplies", priority: "low", timeline: "After birth" }
            ]
        },
        hospital: {
            title: "Hospital Bag",
            items: [
                { item: "Comfortable clothes for labor", priority: "high", timeline: "By 36 weeks" },
                { item: "Nursing gown/robe", priority: "high", timeline: "By 36 weeks" },
                { item: "Toiletries", priority: "high", timeline: "By 36 weeks" },
                { item: "Phone charger", priority: "high", timeline: "By 36 weeks" },
                { item: "Pillow from home", priority: "medium", timeline: "By 36 weeks" },
                { item: "Snacks", priority: "medium", timeline: "By 36 weeks" },
                { item: "Going home outfit for baby", priority: "high", timeline: "By 36 weeks" },
                { item: "Insurance information", priority: "high", timeline: "By 36 weeks" }
            ]
        },
        postpartum: {
            title: "Postpartum Supplies",
            items: [
                { item: "Maxi pads", priority: "high", timeline: "By 36 weeks" },
                { item: "Nursing pads", priority: "high", timeline: "By 36 weeks" },
                { item: "Comfortable underwear", priority: "high", timeline: "By 36 weeks" },
                { item: "Peri bottle", priority: "high", timeline: "By 36 weeks" },
                { item: "Ice packs", priority: "medium", timeline: "By 36 weeks" },
                { item: "Sitz bath", priority: "medium", timeline: "By 36 weeks" },
                { item: "Nipple cream", priority: "high", timeline: "By 36 weeks" },
                { item: "Comfortable loungewear", priority: "medium", timeline: "By 36 weeks" }
            ]
        },
        documentation: {
            title: "Important Documents",
            items: [
                { item: "Birth plan", priority: "high", timeline: "By 36 weeks" },
                { item: "Insurance cards", priority: "high", timeline: "By 36 weeks" },
                { item: "ID for both parents", priority: "high", timeline: "By 36 weeks" },
                { item: "Hospital pre-registration", priority: "high", timeline: "By 32 weeks" },
                { item: "Pediatrician contact", priority: "high", timeline: "By 32 weeks" },
                { item: "Emergency contacts list", priority: "high", timeline: "By 36 weeks" },
                { item: "Baby's social security application", priority: "medium", timeline: "After birth" },
                { item: "Birth certificate information", priority: "medium", timeline: "After birth" }
            ]
        }
    },
    timeline: {
        firstTrimester: [
            "Research and choose healthcare provider",
            "Start saving for baby expenses",
            "Review health insurance coverage",
            "Begin researching childcare options",
            "Start reading pregnancy books"
        ],
        secondTrimester: [
            "Start planning nursery",
            "Research pediatricians",
            "Register for baby gifts",
            "Start childbirth education classes",
            "Create baby budget"
        ],
        thirdTrimester: [
            "Complete nursery setup",
            "Pack hospital bag",
            "Install car seat",
            "Finalize birth plan",
            "Prepare meals for postpartum",
            "Set up baby gear",
            "Wash baby clothes",
            "Arrange postpartum help"
        ]
    }
};

function displayPreparationChecklist() {
    const checklistDisplay = document.getElementById('modalPreparationChecklist') || document.getElementById('preparationChecklist');
    if (!checklistDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    let currentTrimester = 'first';
    
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - lastPeriod) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        
        if (currentWeek <= 12) currentTrimester = 'first';
        else if (currentWeek <= 26) currentTrimester = 'second';
        else currentTrimester = 'third';
    }
    
    const timelineTasks = babyPreparationChecklist.timeline[currentTrimester];
    const categories = babyPreparationChecklist.categories;
    
    checklistDisplay.innerHTML = `
        <div class="preparation-checklist-card">
            <h3>📋 Baby Preparation Checklist</h3>
            
            <div class="current-trimester-section">
                <h4>📅 Tasks for ${currentTrimester.charAt(0).toUpperCase() + currentTrimester.slice(1)} Trimester</h4>
                <ul>
                    ${timelineTasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
            
            <div class="checklist-categories">
                ${Object.entries(categories).map(([key, category]) => `
                    <div class="checklist-category">
                        <h4>${category.title}</h4>
                        <div class="checklist-items">
                            ${category.items.map(item => `
                                <div class="checklist-item priority-${item.priority}">
                                    <input type="checkbox" id="item-${item.item.replace(/\s+/g, '-')}" class="checklist-checkbox">
                                    <label for="item-${item.item.replace(/\s+/g, '-')}">
                                        <span class="item-name">${item.item}</span>
                                        <span class="item-timeline">${item.timeline}</span>
                                        <span class="item-priority">${item.priority}</span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="checklist-progress">
                <h4>Overall Progress</h4>
                <div class="progress-bar">
                    <div class="progress-fill" id="checklistProgress"></div>
                </div>
                <p class="progress-text" id="progressText">0% Complete</p>
            </div>
        </div>
    `;
    
    // Add event listeners for checkboxes
    const checkboxes = checklistDisplay.querySelectorAll('.checklist-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateChecklistProgress);
    });
}

function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.checklist-checkbox');
    const checked = document.querySelectorAll('.checklist-checkbox:checked').length;
    const total = checkboxes.length;
    const percentage = Math.round((checked / total) * 100);
    
    const progressFill = document.getElementById('checklistProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}% Complete`;
    
    // Save progress to localStorage
    const checkedItems = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id);
    localStorage.setItem('babyPreparationProgress', JSON.stringify(checkedItems));
}

// ==================== 15. Partner Involvement Guidance ====================
const partnerGuidance = {
    trimesters: {
        first: {
            title: "First Trimester Partner Support",
            focus: "Supporting your partner through early pregnancy changes",
            waysToSupport: [
                "Attend prenatal appointments together",
                "Research pregnancy information together",
                "Help with household chores when she's tired",
                "Be patient with mood swings and emotions",
                "Encourage healthy eating and rest",
                "Listen to her concerns without judgment",
                "Help manage morning sickness with small meals",
                "Celebrate the pregnancy together"
            ],
            understandingChanges: [
                "Hormonal changes cause mood swings",
                "Fatigue is normal and can be severe",
                "Morning sickness can be debilitating",
                "She may feel anxious about the pregnancy",
                "Her body is going through significant changes",
                "She may need extra emotional support"
            ],
            practicalHelp: [
                "Take over cooking and cleaning when needed",
                "Drive her to appointments",
                "Help with grocery shopping",
                "Encourage her to rest",
                "Be flexible with plans",
                "Offer back rubs for discomfort"
            ]
        },
        second: {
            title: "Second Trimester Partner Support",
            focus: "Building your connection and preparing together",
            waysToSupport: [
                "Feel the baby's movements together",
                "Attend childbirth education classes",
                "Help plan and prepare the nursery",
                "Discuss parenting styles and expectations",
                "Take on more household responsibilities",
                "Plan special time together before baby arrives",
                "Support her body image concerns",
                "Research baby gear together"
            ],
            understandingChanges: [
                "Energy levels may improve",
                "She may feel more confident about pregnancy",
                "Body changes become more visible",
                "She may worry about parenting",
                "Financial stress may increase",
                "She may need help with physical tasks"
            ],
            practicalHelp: [
                "Assemble baby furniture",
                "Research and purchase baby items",
                "Help with nursery setup",
                "Attend prenatal classes",
                "Plan finances for baby",
                "Research childcare options"
            ]
        },
        third: {
            title: "Third Trimester Partner Support",
            focus: "Preparing for labor and supporting through discomfort",
            waysToSupport: [
                "Help finalize birth plan",
                "Pack hospital bag together",
                "Install car seat properly",
                "Practice labor support techniques",
                "Be available for emergencies",
                "Help with physical discomfort",
                "Provide emotional reassurance",
                "Prepare for postpartum support"
            ],
            understandingChanges: [
                "Physical discomfort increases significantly",
                "She may feel anxious about labor",
                "Sleep becomes more difficult",
                "Nesting instincts may be strong",
                "She may need more practical help",
                "Emotions may be more intense"
            ],
            practicalHelp: [
                "Complete any remaining baby preparations",
                "Prepare meals for postpartum",
                "Arrange postpartum help",
                "Learn labor support techniques",
                "Be ready to drive to hospital",
                "Help with household tasks",
                "Support her comfort needs"
            ]
        }
    },
    laborSupport: {
        title: "Labor Support for Partners",
        techniques: [
            {
                name: "Breathing Support",
                description: "Help her maintain steady breathing patterns during contractions",
                tips: "Breathe with her, count breaths, remind her to breathe deeply"
            },
            {
                name: "Physical Comfort",
                description: "Provide physical comfort through touch and positioning",
                tips: "Massage her back, help her change positions, apply cool compresses"
            },
            {
                name: "Emotional Support",
                description: "Provide encouragement and reassurance throughout labor",
                tips: "Speak calmly, remind her of her strength, validate her feelings"
            },
            {
                name: "Advocacy",
                description: "Communicate her needs to healthcare providers",
                tips: "Know her birth plan, speak up for her preferences, ask questions"
            },
            {
                name: "Practical Help",
                description: "Handle logistics and practical needs during labor",
                tips: "Manage phone calls, get supplies, update family, handle paperwork"
            }
        ],
        whatToBring: [
            "Phone charger and portable battery",
            "Snacks and drinks for both of you",
            "Comfortable clothes for you",
            "Camera or phone for photos",
            "List of important phone numbers",
            "Cash for vending machines/parking",
            "Pillow from home",
            "Entertainment (books, music, games)"
        ]
    },
    postpartumSupport: {
        title: "Postpartum Partner Support",
        immediate: [
            "Support breastfeeding if applicable",
            "Help with diaper changes",
            "Manage household tasks",
            "Allow her to rest and recover",
            "Handle night feedings if possible",
            "Support her emotional recovery",
            "Manage visitors and boundaries",
            "Help with baby care tasks"
        ],
        ongoing: [
            "Continue sharing household responsibilities",
            "Support her return to work if applicable",
            "Maintain intimacy and connection",
            "Seek help if she shows signs of PPD",
            "Prioritize couple time",
            "Support her mental health",
            "Share parenting responsibilities equally",
            "Be patient with recovery timeline"
        ],
        signsToWatch: [
            "Persistent sadness or hopelessness",
            "Difficulty bonding with baby",
            "Severe anxiety or panic attacks",
            "Thoughts of harming herself or baby",
            "Inability to care for herself or baby",
            "Extreme irritability or anger",
            "Loss of interest in activities",
            "Changes in appetite or sleep"
        ]
    },
    communication: {
        title: "Effective Communication",
        tips: [
            "Listen without judgment",
            "Validate her feelings and experiences",
            "Ask how you can help specifically",
            "Share your own feelings and concerns",
            "Discuss expectations openly",
            "Be patient with each other",
            "Schedule regular check-ins",
            "Seek counseling if needed"
        ],
        topicsToDiscuss: [
            "Parenting styles and values",
            "Division of household responsibilities",
            "Financial planning for baby",
            "Career and work arrangements",
            "Support from family and friends",
            "Birth preferences and birth plan",
            "Postpartum support needs",
            "Relationship priorities"
        ]
    }
};

function displayPartnerGuidance() {
    const partnerDisplay = document.getElementById('modalPartnerGuidance') || document.getElementById('partnerGuidance');
    if (!partnerDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    let currentTrimester = 'first';
    
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - lastPeriod) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        
        if (currentWeek <= 12) currentTrimester = 'first';
        else if (currentWeek <= 26) currentTrimester = 'second';
        else currentTrimester = 'third';
    }
    
    const trimesterGuidance = partnerGuidance.trimesters[currentTrimester];
    const laborSupport = partnerGuidance.laborSupport;
    const postpartum = partnerGuidance.postpartumSupport;
    const communication = partnerGuidance.communication;
    
    partnerDisplay.innerHTML = `
        <div class="partner-guidance-card">
            <h3>👫 Partner Involvement Guide</h3>
            
            <div class="current-trimester-section">
                <h4>${trimesterGuidance.title}</h4>
                <p class="trimester-focus">${trimesterGuidance.focus}</p>
                
                <div class="guidance-section">
                    <h5>💝 Ways to Support</h5>
                    <ul>
                        ${trimesterGuidance.waysToSupport.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section">
                    <h5>🧠 Understanding Changes</h5>
                    <ul>
                        ${trimesterGuidance.understandingChanges.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guidance-section">
                    <h5>🛠️ Practical Help</h5>
                    <ul>
                        ${trimesterGuidance.practicalHelp.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🏥 Labor Support</h4>
                <div class="labor-techniques">
                    ${laborSupport.techniques.map(technique => `
                        <div class="labor-technique-item">
                            <div class="technique-name">${technique.name}</div>
                            <div class="technique-description">${technique.description}</div>
                            <div class="technique-tips">${technique.tips}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="what-to-bring">
                    <h5>🎒 What to Bring to Hospital</h5>
                    <ul>
                        ${laborSupport.whatToBring.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>👶 Postpartum Support</h4>
                <div class="postpartum-sections">
                    <div class="postpartum-subsection">
                        <h5>Immediate Support</h5>
                        <ul>
                            ${postpartum.immediate.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="postpartum-subsection">
                        <h5>Ongoing Support</h5>
                        <ul>
                            ${postpartum.ongoing.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="postpartum-subsection warning">
                        <h5>⚠️ Signs to Watch For</h5>
                        <ul>
                            ${postpartum.signsToWatch.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>💬 Effective Communication</h4>
                <div class="communication-sections">
                    <div class="communication-subsection">
                        <h5>Tips for Good Communication</h5>
                        <ul>
                            ${communication.tips.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="communication-subsection">
                        <h5>Topics to Discuss</h5>
                        <ul>
                            ${communication.topicsToDiscuss.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== 17. Postpartum Preparation ====================
const postpartumPreparation = {
    physicalRecovery: {
        title: "Physical Recovery",
        timeline: {
            firstWeek: [
                "Rest as much as possible",
                "Use peri bottle for cleansing",
                "Take prescribed pain medication",
                "Use ice packs for swelling",
                "Wear supportive underwear",
                "Monitor for heavy bleeding",
                "Stay hydrated and eat well",
                "Accept help from others"
            ],
            firstMonth: [
                "Gradually increase activity",
                "Continue pelvic floor exercises",
                "Attend postpartum checkup",
                "Monitor incision if C-section",
                "Manage breastfeeding challenges",
                "Get adequate sleep when possible",
                "Continue taking prenatal vitamins",
                "Watch for signs of infection"
            ],
            threeMonths: [
                "Return to light exercise",
                "Focus on core strengthening",
                "Address any lingering pain",
                "Consider physical therapy if needed",
                "Gradually return to normal activities",
                "Continue self-care practices",
                "Monitor mental health",
                "Seek help if recovery is slow"
            ]
        },
        warningSigns: [
            "Heavy bleeding (soaking a pad in an hour)",
            "Fever over 100.4°F (38°C)",
            "Severe abdominal pain",
            "Foul-smelling discharge",
            "Redness or swelling at incision site",
            "Difficulty breathing or chest pain",
            "Severe headache with vision changes",
            "Thoughts of harming yourself or baby"
        ]
    },
    mentalHealth: {
        title: "Postpartum Mental Health",
        babyBlues: {
            description: "Mild mood changes that affect up to 80% of new mothers",
            symptoms: [
                "Mood swings",
                "Anxiety",
                "Sadness",
                "Irritability",
                "Trouble sleeping",
                "Crying spells"
            ],
            duration: "Usually resolves within 2 weeks",
            selfCare: [
                "Rest when baby sleeps",
                "Accept help from others",
                "Connect with other new mothers",
                "Be patient with yourself",
                "Share feelings with partner",
                "Take time for self-care"
            ]
        },
        postpartumDepression: {
            description: "More severe depression that requires treatment",
            symptoms: [
                "Persistent sadness or hopelessness",
                "Loss of interest in activities",
                "Difficulty bonding with baby",
                "Severe anxiety or panic",
                "Changes in appetite or sleep",
                "Difficulty concentrating",
                "Thoughts of harming self or baby",
                "Feelings of worthlessness"
            ],
            duration: "Can last months without treatment",
            action: "Seek professional help immediately"
        },
        support: [
            "Join a postpartum support group",
            "Talk to your healthcare provider",
            "Consider therapy or counseling",
            "Lean on family and friends",
            "Ask your partner for specific help",
            "Prioritize self-care",
            "Know it's not your fault",
            "Treatment is available and effective"
        ]
    },
    breastfeeding: {
        title: "Breastfeeding Support",
        gettingStarted: [
            "Start breastfeeding within first hour after birth",
            "Feed on demand (8-12 times per day)",
            "Ensure proper latch",
            "Stay hydrated and eat well",
            "Rest whenever possible",
            "Use nursing pads for leakage",
            "Apply lanolin for sore nipples",
            "Seek help if having difficulties"
        ],
        commonChallenges: [
            "Sore or cracked nipples",
            "Low milk supply",
            "Engorgement",
            "Mastitis",
            "Difficulty latching",
            "Baby not gaining weight",
            "Pain during feeding",
            "Oversupply"
        ],
        whenToGetHelp: [
            "Baby shows signs of dehydration",
                "Severe pain during feeding",
                "No wet diapers for 6+ hours",
                "Baby losing weight",
                "Signs of infection (fever, redness)",
                "Severe engorgement",
                "Mental health concerns",
                "Any concerns about baby's health"
        ],
        resources: [
            "Lactation consultant",
            "La Leche League",
            "Hospital lactation services",
            "WIC breastfeeding support",
            "Online breastfeeding communities",
            "Your healthcare provider",
            "Peer support groups",
            "Breastfeeding hotlines"
        ]
    },
    babyCare: {
        title: "Newborn Care Basics",
        feeding: [
            "Feed every 2-3 hours",
            "Watch for hunger cues",
            "Burp baby after feeding",
            "Track wet and dirty diapers",
            "Follow safe sleep guidelines",
            "Never prop bottles",
            "Sterilize bottles if formula feeding",
            "Keep baby upright after feeding"
        ],
        sleeping: [
            "Place baby on back to sleep",
            "Use firm sleep surface",
            "Share room but not bed",
            "Avoid loose bedding",
            "Keep room at comfortable temperature",
            "Use pacifier for sleep",
            "Establish bedtime routine",
            "Respond to baby's needs"
        ],
        diapering: [
            "Change diapers frequently",
            "Clean thoroughly with each change",
            "Use diaper cream for rash",
            "Watch for diaper rash",
            "Track diaper output",
            "Change diapers before/after feeds",
            "Use proper size diapers",
            "Keep diaper area clean and dry"
        ],
        health: [
            "Monitor temperature",
            "Watch for jaundice",
            "Keep umbilical cord clean",
            "Schedule well-baby visits",
            "Follow vaccination schedule",
            "Know emergency signs",
            "Keep baby away from sick people",
            "Practice good hand hygiene"
        ]
    },
    practicalPreparation: {
        title: "Practical Preparation",
        beforeBirth: [
            "Prepare and freeze meals",
            "Set up baby's sleeping space",
            "Stock up on essentials",
            "Arrange help for first weeks",
            "Prepare older children if applicable",
            "Set up baby gear",
            "Pack hospital bag",
            "Finish nursery setup"
        ],
        afterBirth: [
            "Accept all offers of help",
            "Limit visitors initially",
            "Focus on recovery and baby",
            "Let household tasks slide",
            "Order groceries online",
            "Use meal delivery services",
            "Consider hiring help if possible",
            "Prioritize sleep and rest"
        ],
        essentials: [
            "Diapers (newborn and size 1)",
            "Wipes",
            "Baby clothes (various sizes)",
            "Swaddles and blankets",
            "Breast pump and supplies",
            "Nursing bras and pads",
            "Baby thermometer",
            "First aid supplies"
        ]
    },
    returningToWork: {
        title: "Returning to Work",
        planning: [
            "Discuss plans with employer early",
            "Understand your rights and benefits",
            "Plan childcare arrangements",
            "Start pumping and storing milk",
            "Create a pumping schedule",
            "Prepare baby for childcare",
            "Practice bottle feeding",
            "Have backup childcare options"
        ],
        tips: [
            "Start with a gradual return if possible",
            "Communicate needs clearly",
            "Take breaks as needed",
            "Stay connected with baby",
            "Prioritize self-care",
            "Be flexible with plans",
            "Seek support if overwhelmed",
            "Remember it's an adjustment"
        ]
    }
};

function displayPostpartumPreparation() {
    const postpartumDisplay = document.getElementById('modalPostpartumPreparation') || document.getElementById('postpartumPreparation');
    if (!postpartumDisplay) return;
    
    const physical = postpartumPreparation.physicalRecovery;
    const mental = postpartumPreparation.mentalHealth;
    const breastfeeding = postpartumPreparation.breastfeeding;
    const babyCare = postpartumPreparation.babyCare;
    const practical = postpartumPreparation.practicalPreparation;
    const work = postpartumPreparation.returningToWork;
    
    postpartumDisplay.innerHTML = `
        <div class="postpartum-preparation-card">
            <h3>👶 Postpartum Preparation</h3>
            
            <div class="guidance-section">
                <h4>🏥 Physical Recovery</h4>
                <div class="recovery-timeline">
                    <div class="timeline-phase">
                        <h5>First Week</h5>
                        <ul>
                            ${physical.timeline.firstWeek.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="timeline-phase">
                        <h5>First Month</h5>
                        <ul>
                            ${physical.timeline.firstMonth.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="timeline-phase">
                        <h5>Three Months</h5>
                        <ul>
                            ${physical.timeline.threeMonths.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="warning-signs urgent">
                    <h5>⚠️ Warning Signs - Call Doctor If:</h5>
                    <ul>
                        ${physical.warningSigns.map(sign => `<li>${sign}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🧠 Mental Health</h4>
                <div class="mental-health-sections">
                    <div class="mental-health-subsection">
                        <h5>Baby Blues (Normal)</h5>
                        <p>${mental.babyBlues.description}</p>
                        <p><strong>Duration:</strong> ${mental.babyBlues.duration}</p>
                        <h6>Symptoms:</h6>
                        <ul>
                            ${mental.babyBlues.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                        </ul>
                        <h6>Self-Care:</h6>
                        <ul>
                            ${mental.babyBlues.selfCare.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="mental-health-subsection warning">
                        <h5>Postpartum Depression (Requires Help)</h5>
                        <p>${mental.postpartumDepression.description}</p>
                        <p><strong>Duration:</strong> ${mental.postpartumDepression.duration}</p>
                        <p><strong>Action:</strong> ${mental.postpartumDepression.action}</p>
                        <h6>Symptoms:</h6>
                        <ul>
                            ${mental.postpartumDepression.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="mental-health-subsection">
                        <h5>Support Resources</h5>
                        <ul>
                            ${mental.support.map(resource => `<li>${resource}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🤱 Breastfeeding Support</h4>
                <div class="breastfeeding-sections">
                    <div class="breastfeeding-subsection">
                        <h5>Getting Started</h5>
                        <ul>
                            ${breastfeeding.gettingStarted.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="breastfeeding-subsection">
                        <h5>Common Challenges</h5>
                        <ul>
                            ${breastfeeding.commonChallenges.map(challenge => `<li>${challenge}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="breastfeeding-subsection warning">
                        <h5>When to Get Help</h5>
                        <ul>
                            ${breastfeeding.whenToGetHelp.map(sign => `<li>${sign}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="breastfeeding-subsection">
                        <h5>Resources</h5>
                        <ul>
                            ${breastfeeding.resources.map(resource => `<li>${resource}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>👶 Newborn Care Basics</h4>
                <div class="baby-care-grid">
                    <div class="baby-care-category">
                        <h5>Feeding</h5>
                        <ul>
                            ${babyCare.feeding.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="baby-care-category">
                        <h5>Sleeping</h5>
                        <ul>
                            ${babyCare.sleeping.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="baby-care-category">
                        <h5>Diapering</h5>
                        <ul>
                            ${babyCare.diapering.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="baby-care-category">
                        <h5>Health</h5>
                        <ul>
                            ${babyCare.health.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>📋 Practical Preparation</h4>
                <div class="practical-sections">
                    <div class="practical-subsection">
                        <h5>Before Birth</h5>
                        <ul>
                            ${practical.beforeBirth.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="practical-subsection">
                        <h5>After Birth</h5>
                        <ul>
                            ${practical.afterBirth.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="practical-subsection">
                        <h5>Essentials to Have</h5>
                        <ul>
                            ${practical.essentials.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>💼 Returning to Work</h4>
                <div class="work-sections">
                    <div class="work-subsection">
                        <h5>Planning Ahead</h5>
                        <ul>
                            ${work.planning.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="work-subsection">
                        <h5>Tips for Transition</h5>
                        <ul>
                            ${work.tips.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== 19. Trimester Educational Content ====================
const trimesterEducation = {
    first: {
        title: "First Trimester Education",
        weeks: "Weeks 1-12",
        overview: "The first trimester is a time of rapid development and significant changes for both mother and baby.",
        fetalDevelopment: {
            month1: [
                "Fertilization and implantation occur",
                "Neural tube begins to form",
                "Heart begins to beat around week 6",
                "Major organs start developing",
                "Embryo is about 1/4 inch by end of month"
            ],
            month2: [
                "Facial features begin to form",
                "Arms and legs start developing",
                "Fingers and toes begin to separate",
                "Baby can move (though you can't feel it yet)",
                "Embryo becomes a fetus around week 9"
            ],
            month3: [
                "All major organs have formed",
                "Baby can make sucking motions",
                "Fingernails and toenails develop",
                "Baby is about 3 inches long",
                "Sex organs become visible"
            ]
        },
        maternalChanges: {
            physical: [
                "Morning sickness and nausea",
                "Extreme fatigue and exhaustion",
                "Breast tenderness and enlargement",
                "Frequent urination",
                "Food aversions and cravings",
                "Bloating and constipation",
                "Heightened sense of smell",
                "Possible weight gain or loss"
            ],
            emotional: [
                "Mood swings and irritability",
                "Anxiety about pregnancy",
                "Excitement and anticipation",
                "Fear of miscarriage",
                "Changes in libido",
                "Increased emotional sensitivity"
            ]
        },
        importantTopics: [
            {
                topic: "Prenatal Care",
                points: [
                    "Schedule first prenatal appointment",
                    "Start taking prenatal vitamins with folic acid",
                    "Discuss medications with healthcare provider",
                    "Understand due date calculation",
                    "Learn about genetic testing options"
                ]
            },
            {
                topic: "Nutrition",
                points: [
                    "Eat a balanced diet rich in nutrients",
                    "Stay hydrated (8-10 glasses of water daily)",
                    "Avoid raw or undercooked foods",
                    "Limit caffeine intake",
                    "Avoid alcohol completely",
                    "Eat small, frequent meals to manage nausea"
                ]
            },
            {
                topic: "Lifestyle Changes",
                points: [
                    "Stop smoking and avoid secondhand smoke",
                    "Avoid hot tubs and saunas",
                    "Limit exposure to harmful chemicals",
                    "Get adequate rest",
                    "Start gentle exercise if approved",
                    "Wear comfortable clothing"
                ]
            },
            {
                topic: "Warning Signs",
                points: [
                    "Vaginal bleeding or spotting",
                    "Severe abdominal pain",
                    "Severe nausea and vomiting",
                    "Fever over 100.4°F",
                    "Dizziness or fainting",
                    "Rapid weight gain or swelling"
                ]
            }
        ],
        testsAndScreenings: [
            { test: "Blood tests", timing: "First visit", purpose: "Check blood type, immunity, and overall health" },
            { test: "Ultrasound", timing: "Weeks 6-9", purpose: "Confirm pregnancy and due date" },
            { test: "Genetic screening", timing: "Weeks 10-13", purpose: "Screen for chromosomal abnormalities" },
            { test: "Urine tests", timing: "Each visit", purpose: "Check for infections and protein" }
        ]
    },
    second: {
        title: "Second Trimester Education",
        weeks: "Weeks 13-26",
        overview: "The second trimester is often called the 'honeymoon phase' of pregnancy, with increased energy and reduced nausea.",
        fetalDevelopment: {
            month4: [
                "Baby's skin is transparent",
                "Hair begins to grow",
                "Baby can hear sounds",
                "Skeleton starts hardening",
                "Baby is about 5-6 inches long"
            ],
            month5: [
                "Baby develops a protective coating (vernix)",
                "Eyebrows and eyelashes appear",
                "Baby can suck thumb",
                "You may feel first movements (quickening)",
                "Baby is about 10 inches long"
            ],
            month6: [
                "Baby's skin becomes less transparent",
                "Lungs begin developing",
                "Baby responds to sounds",
                "Regular sleep patterns develop",
                "Baby is about 12 inches long"
            ]
        },
        maternalChanges: {
            physical: [
                "Baby bump becomes visible",
                "Increased energy levels",
                "Reduced nausea and morning sickness",
                "Skin changes (stretch marks, linea nigra)",
                "Back pain and pelvic pressure",
                "Shortness of breath",
                "Swelling in hands and feet",
                "Braxton Hicks contractions may begin"
            ],
            emotional: [
                "Increased sense of well-being",
                "Bonding with baby increases",
                "Anxiety about parenting",
                "Body image concerns",
                "Excitement about feeling movements",
                "Nesting instincts may begin"
            ]
        },
        importantTopics: [
            {
                topic: "Prenatal Care",
                points: [
                    "Monthly prenatal visits",
                    "Anatomy scan ultrasound (week 20)",
                    "Glucose screening test (week 24-28)",
                    "Monitor blood pressure",
                    "Track baby's movements"
                ]
            },
            {
                topic: "Nutrition",
                points: [
                    "Increase protein intake",
                    "Focus on calcium and iron",
                    "Continue staying hydrated",
                    "Eat smaller, more frequent meals",
                    "Include healthy snacks",
                    "Monitor weight gain"
                ]
            },
            {
                topic: "Exercise",
                points: [
                    "Continue approved exercises",
                    "Swimming and walking are excellent",
                    "Prenatal yoga classes",
                    "Avoid high-impact activities",
                    "Listen to your body",
                    "Stay cool and hydrated"
                ]
            },
            {
                topic: "Preparation",
                points: [
                    "Start planning nursery",
                    "Research pediatricians",
                    "Consider childbirth classes",
                    "Start baby registry",
                    "Discuss parenting with partner",
                    "Plan finances for baby"
                ]
            }
        ],
        testsAndScreenings: [
            { test: "Anatomy ultrasound", timing: "Week 18-22", purpose: "Detailed scan of baby's anatomy" },
            { test: "Glucose tolerance test", timing: "Week 24-28", purpose: "Screen for gestational diabetes" },
            { test: "Rh factor test", timing: "Week 28", purpose: "Check blood compatibility" },
            { test: "Group B Strep test", timing: "Week 35-37", purpose: "Screen for bacteria" }
        ]
    },
    third: {
        title: "Third Trimester Education",
        weeks: "Weeks 27-40",
        overview: "The third trimester is a time of rapid growth and preparation for birth, with increased physical discomfort.",
        fetalDevelopment: {
            month7: [
                "Baby can open and close eyes",
                "Baby responds to light and sound",
                "Lungs continue maturing",
                "Baby gains weight rapidly",
                "Baby is about 14-16 inches long"
            ],
            month8: [
                "Baby's brain develops rapidly",
                "Baby practices breathing movements",
                "Baby's position settles (usually head down)",
                "Baby's skin becomes smoother",
                "Baby is about 18 inches long"
            ],
            month9: [
                "Baby is fully developed",
                "Baby gains about 1/2 pound per week",
                "Baby's immune system develops",
                "Baby's lungs are fully mature",
                "Baby is about 20-21 inches long"
            ]
        },
        maternalChanges: {
            physical: [
                "Rapid weight gain",
                "Increased back and pelvic pain",
                "Frequent urination returns",
                "Difficulty sleeping comfortably",
                "Shortness of breath increases",
                "Swelling in hands, feet, and face",
                "Braxton Hicks contractions increase",
                "Baby drops lower in pelvis (lightening)"
            ],
            emotional: [
                "Anxiety about labor and delivery",
                "Excitement and anticipation",
                "Fear of parenting",
                "Nesting instincts strong",
                "Impatience for baby to arrive",
                "Mixed emotions about pregnancy ending"
            ]
        },
        importantTopics: [
            {
                topic: "Prenatal Care",
                points: [
                    "Bi-weekly visits until week 36",
                    "Weekly visits from week 36",
                    "Monitor baby's position",
                    "Check for signs of labor",
                    "Discuss birth plan",
                    "Prepare for postpartum"
                ]
            },
            {
                topic: "Birth Preparation",
                points: [
                    "Create detailed birth plan",
                    "Pack hospital bag",
                    "Install car seat properly",
                    "Learn labor signs and stages",
                    "Practice breathing techniques",
                    "Plan route to hospital"
                ]
            },
            {
                topic: "Labor Signs",
                points: [
                    "Regular contractions getting stronger",
                    "Water breaking",
                    "Bloody show",
                    "Lower back pain",
                    "Diarrhea or nausea",
                    "Baby drops lower"
                ]
            },
            {
                topic: "Postpartum Prep",
                points: [
                    "Prepare meals for postpartum",
                    "Arrange help and support",
                    "Set up baby's sleeping area",
                    "Stock up on essentials",
                    "Plan for breastfeeding if choosing",
                    "Discuss postpartum depression signs"
                ]
            }
        ],
        testsAndScreenings: [
            { test: "Group B Strep test", timing: "Week 35-37", purpose: "Screen for bacteria" },
            { test: "Biophysical profile", timing: "Week 40+", purpose: "Monitor baby's well-being if overdue" },
            { test: "Non-stress test", timing: "Week 40+", purpose: "Monitor baby's heart rate" },
            { test: "Cervical check", timing: "Week 36+", purpose: "Check for dilation and effacement" }
        ]
    }
};

function displayTrimesterEducation() {
    const educationDisplay = document.getElementById('modalTrimesterEducation') || document.getElementById('trimesterEducation');
    if (!educationDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    let currentTrimester = 'first';
    
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - lastPeriod) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        
        if (currentWeek <= 12) currentTrimester = 'first';
        else if (currentWeek <= 26) currentTrimester = 'second';
        else currentTrimester = 'third';
    }
    
    const education = trimesterEducation[currentTrimester];
    
    educationDisplay.innerHTML = `
        <div class="trimester-education-card">
            <h3>📚 ${education.title}</h3>
            <p class="education-overview">${education.overview}</p>
            <p class="education-weeks">${education.weeks}</p>
            
            <div class="guidance-section">
                <h4>👶 Fetal Development</h4>
                <div class="development-timeline">
                    ${Object.entries(education.fetalDevelopment).map(([month, milestones]) => `
                        <div class="development-month">
                            <h5>${month.charAt(0).toUpperCase() + month.slice(1)}</h5>
                            <ul>
                                ${milestones.map(milestone => `<li>${milestone}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🤰 Maternal Changes</h4>
                <div class="changes-sections">
                    <div class="changes-subsection">
                        <h5>Physical Changes</h5>
                        <ul>
                            ${education.maternalChanges.physical.map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="changes-subsection">
                        <h5>Emotional Changes</h5>
                        <ul>
                            ${education.maternalChanges.emotional.map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>📖 Important Topics</h4>
                <div class="topics-grid">
                    ${education.importantTopics.map(topic => `
                        <div class="topic-card">
                            <h5>${topic.topic}</h5>
                            <ul>
                                ${topic.points.map(point => `<li>${point}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="guidance-section">
                <h4>🔬 Tests and Screenings</h4>
                <div class="tests-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Test</th>
                                <th>Timing</th>
                                <th>Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${education.testsAndScreenings.map(test => `
                                <tr>
                                    <td>${test.test}</td>
                                    <td>${test.timing}</td>
                                    <td>${test.purpose}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ==================== 20. Weight Tracking ====================
let weightRecords = JSON.parse(localStorage.getItem('pregnancyWeight')) || [];

function addWeightRecord() {
    const weightInput = document.getElementById('modalWeightInput') || document.getElementById('weightInput');
    const dateInput = document.getElementById('modalWeightDate') || document.getElementById('weightDate');
    
    if (!weightInput || !dateInput) return;
    
    const record = {
        id: Date.now(),
        weight: parseFloat(weightInput.value),
        date: dateInput.value,
        week: calculatePregnancyWeek(localStorage.getItem('lastPeriodDate')).weeks
    };
    
    weightRecords.push(record);
    localStorage.setItem('pregnancyWeight', JSON.stringify(weightRecords));
    displayWeightTracking();
    
    // Clear inputs
    weightInput.value = '';
    dateInput.value = '';
    if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'weight', ...record });
}

function displayWeightTracking() {
    const weightDisplay = document.getElementById('modalWeightDisplay') || document.getElementById('weightDisplay');
    if (!weightDisplay) return;
    
    const sortedRecords = weightRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    weightDisplay.innerHTML = `
        <div class="weight-tracking-card">
            <h3>⚖️ Weight Tracking</h3>
            <div class="weight-chart">
                ${sortedRecords.length > 0 ? `
                    <div class="weight-progress">
                        ${sortedRecords.map(record => `
                            <div class="weight-point">
                                <span class="weight-date">${new Date(record.date).toLocaleDateString()}</span>
                                <span class="weight-value">${record.weight} kg</span>
                                <span class="weight-week">Week ${record.week}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-records">No weight records yet</p>'}
            </div>
            <div class="weight-guidance">
                <p><strong>Healthy Weight Gain:</strong></p>
                <ul>
                    <li>Underweight: 12.7-18.1 kg</li>
                    <li>Normal weight: 11.3-15.9 kg</li>
                    <li>Overweight: 6.8-11.3 kg</li>
                    <li>Obese: 5-9.1 kg</li>
                </ul>
            </div>
        </div>
    `;
}

// ==================== 12. Water Intake Tracker ====================
let waterIntake = JSON.parse(localStorage.getItem('waterIntake')) || { glasses: 0, date: new Date().toDateString() };

function addWaterGlass() {
    const today = new Date().toDateString();
    if (waterIntake.date !== today) {
        waterIntake = { glasses: 0, date: today };
    }
    
    waterIntake.glasses++;
    localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
    displayWaterIntake();
    if (window.DB_SYNC) window.DB_SYNC.saveActivity({ type: 'water-intake', glasses: waterIntake.glasses, date: waterIntake.date });
}

function resetWaterIntake() {
    waterIntake = { glasses: 0, date: new Date().toDateString() };
    localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
    displayWaterIntake();
}

function displayWaterIntake() {
    const waterDisplay = document.getElementById('modalWaterDisplay') || document.getElementById('waterDisplay');
    if (!waterDisplay) return;
    
    const dailyGoal = 8;
    const progress = (waterIntake.glasses / dailyGoal) * 100;
    
    waterDisplay.innerHTML = `
        <div class="water-intake-card">
            <h3>💧 Water Intake Tracker</h3>
            <div class="water-progress">
                <div class="water-glasses">
                    <span class="glasses-count">${waterIntake.glasses}</span>
                    <span class="glasses-label">/ ${dailyGoal} glasses</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="water-percentage">${Math.round(progress)}% of daily goal</div>
            </div>
            <div class="water-actions">
                <button onclick="addWaterGlass()" class="btn-add-water">+ Add Glass</button>
                <button onclick="resetWaterIntake()" class="btn-reset-water">Reset</button>
            </div>
            <div class="water-tip">
                <p>💡 Aim for at least 2 liters (8 glasses) of water daily for optimal hydration during pregnancy.</p>
            </div>
        </div>
    `;
}

// ==================== 13. Mood Tracking ====================
let moodRecords = JSON.parse(localStorage.getItem('moodRecords')) || [];

const moodOptions = [
    { emoji: '😊', label: 'Happy', color: '#00b894' },
    { emoji: '😴', label: 'Tired', color: '#9E9E9E' },
    { emoji: '😰', label: 'Anxious', color: '#ff9800' },
    { emoji: '😤', label: 'Stressed', color: '#ff4757' },
    { emoji: '😢', label: 'Sad', color: '#00b894' },
    { emoji: '😐', label: 'Neutral', color: '#607D8B' }
];

function recordMood(moodIndex) {
    const mood = moodOptions[moodIndex];
    const record = {
        id: Date.now(),
        mood: mood.label,
        emoji: mood.emoji,
        date: new Date().toISOString(),
        week: calculatePregnancyWeek(localStorage.getItem('lastPeriodDate')).weeks
    };
    
    moodRecords.push(record);
    localStorage.setItem('moodRecords', JSON.stringify(moodRecords));
    displayMoodTracking();
    if (window.DB_SYNC) window.DB_SYNC.saveActivity({ type: 'mood', ...record });
}

function displayMoodTracking() {
    const moodDisplay = document.getElementById('modalMoodDisplay') || document.getElementById('moodDisplay');
    if (!moodDisplay) return;
    
    const recentMoods = moodRecords.slice(-7);
    
    moodDisplay.innerHTML = `
        <div class="mood-tracking-card">
            <h3>😊 Mood Tracking</h3>
            <div class="mood-selector">
                ${moodOptions.map((mood, index) => `
                    <button onclick="recordMood(${index})" class="mood-button" style="background-color: ${mood.color}">
                        <span class="mood-emoji">${mood.emoji}</span>
                        <span class="mood-label">${mood.label}</span>
                    </button>
                `).join('')}
            </div>
            <div class="mood-history">
                <h4>Recent Moods (Last 7 Days)</h4>
                ${recentMoods.length > 0 ? `
                    <div class="mood-timeline">
                        ${recentMoods.map(record => `
                            <div class="mood-record">
                                <span class="mood-emoji">${record.emoji}</span>
                                <span class="mood-label">${record.mood}</span>
                                <span class="mood-date">${new Date(record.date).toLocaleDateString()}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-moods">No mood records yet</p>'}
            </div>
        </div>
    `;
}

// ==================== 14. Kick Counter ====================
let kickRecords = JSON.parse(localStorage.getItem('kickRecords')) || [];
let currentKickSession = { startTime: null, kicks: 0 };

function startKickCounting() {
    currentKickSession = {
        startTime: new Date().toISOString(),
        kicks: 0
    };
    displayKickCounter();
}

function recordKick() {
    if (!currentKickSession.startTime) {
        startKickCounting();
    }
    currentKickSession.kicks++;
    displayKickCounter();
}

function endKickSession() {
    if (!currentKickSession.startTime) return;
    
    const session = {
        id: Date.now(),
        date: currentKickSession.startTime,
        kicks: currentKickSession.kicks,
        duration: Math.round((new Date() - new Date(currentKickSession.startTime)) / 60000)
    };
    
    kickRecords.push(session);
    localStorage.setItem('kickRecords', JSON.stringify(kickRecords));
    
    currentKickSession = { startTime: null, kicks: 0 };
    displayKickCounter();
    if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'kick-session', ...session });
}

function displayKickCounter() {
    const kickDisplay = document.getElementById('modalKickDisplay') || document.getElementById('kickDisplay');
    if (!kickDisplay) return;
    
    kickDisplay.innerHTML = `
        <div class="kick-counter-card">
            <h3>👶 Kick Counter</h3>
            <div class="kick-session">
                ${currentKickSession.startTime ? `
                    <div class="kick-info">
                        <div class="kick-count">
                            <span class="kick-number">${currentKickSession.kicks}</span>
                            <span class="kick-label">Kicks</span>
                        </div>
                        <div class="kick-time">
                            <span class="time-label">Session Time:</span>
                            <span class="time-value">${Math.round((new Date() - new Date(currentKickSession.startTime)) / 60000)} min</span>
                        </div>
                    </div>
                    <div class="kick-actions">
                        <button onclick="recordKick()" class="btn-record-kick">👣 Record Kick</button>
                        <button onclick="endKickSession()" class="btn-end-session">End Session</button>
                    </div>
                ` : `
                    <div class="kick-start">
                        <p>Start counting baby's movements</p>
                        <button onclick="startKickCounting()" class="btn-start-kick">Start Counting</button>
                    </div>
                `}
            </div>
            <div class="kick-history">
                <h4>Recent Sessions</h4>
                ${kickRecords.slice(-5).map(record => `
                    <div class="kick-record">
                        <span class="kick-date">${new Date(record.date).toLocaleDateString()}</span>
                        <span class="kick-count">${record.kicks} kicks</span>
                        <span class="kick-duration">${record.duration} min</span>
                    </div>
                `).join('')}
            </div>
            <div class="kick-guidance">
                <p>💡 Count kicks when baby is most active, usually after meals. You should feel at least 10 movements within 2 hours.</p>
            </div>
        </div>
    `;
}

// ==================== 15. Contraction Timer ====================
let contractionSession = { active: false, contractions: [], startTime: null };

function startContraction() {
    if (!contractionSession.active) {
        contractionSession.active = true;
        contractionSession.startTime = new Date().toISOString();
    }
    displayContractionTimer();
}

function endContraction() {
    if (!contractionSession.active || !contractionSession.startTime) return;
    
    const duration = Math.round((new Date() - new Date(contractionSession.startTime)) / 1000 / 60);
    
    contractionSession.contractions.push({
        startTime: contractionSession.startTime,
        duration: duration,
        endTime: new Date().toISOString()
    });
    
    contractionSession.active = false;
    contractionSession.startTime = null;
    
    displayContractionTimer();
}

function resetContractionTimer() {
    contractionSession = { active: false, contractions: [], startTime: null };
    displayContractionTimer();
}

function displayContractionTimer() {
    const contractionDisplay = document.getElementById('modalContractionDisplay') || document.getElementById('contractionDisplay');
    if (!contractionDisplay) return;
    
    contractionDisplay.innerHTML = `
        <div class="contraction-timer-card">
            <h3>⏱️ Contraction Timer</h3>
            <div class="contraction-session">
                ${contractionSession.active ? `
                    <div class="active-contraction">
                        <div class="timer-display">
                            <span class="timer-label">Duration:</span>
                            <span class="timer-value">${Math.round((new Date() - new Date(contractionSession.startTime)) / 1000 / 60)}:${Math.round((new Date() - new Date(contractionSession.startTime)) / 1000 % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <button onclick="endContraction()" class="btn-end-contraction">End Contraction</button>
                    </div>
                ` : `
                    <div class="contraction-start">
                        <button onclick="startContraction()" class="btn-start-contraction">Start Contraction</button>
                    </div>
                `}
            </div>
            <div class="contraction-history">
                <h4>Recent Contractions</h4>
                ${contractionSession.contractions.slice(-5).map(contraction => `
                    <div class="contraction-record">
                        <span class="contraction-time">${new Date(contraction.startTime).toLocaleTimeString()}</span>
                        <span class="contraction-duration">${contraction.duration} min</span>
                    </div>
                `).join('')}
            </div>
            <div class="contraction-guidance">
                <p>💡 Contact your healthcare provider if contractions become regular (every 5 minutes), last 60+ seconds, and continue for 1+ hour.</p>
            </div>
        </div>
    `;
}

// ==================== 16. Personal Notes Section ====================
let personalNotes = JSON.parse(localStorage.getItem('personalNotes')) || [];

function addNote() {
    const noteInput = document.getElementById('modalNoteInput') || document.getElementById('noteInput');
    const noteCategory = document.getElementById('modalNoteCategory') || document.getElementById('noteCategory');
    
    if (!noteInput) return;
    
    const note = {
        id: Date.now(),
        content: noteInput.value,
        category: noteCategory ? noteCategory.value : 'General',
        date: new Date().toISOString()
    };
    
    personalNotes.push(note);
    localStorage.setItem('personalNotes', JSON.stringify(personalNotes));
    displayPersonalNotes();
    
    // Clear input
    noteInput.value = '';
    if (window.DB_SYNC) window.DB_SYNC.saveActivity({ type: 'note', ...note });
}

function deleteNote(id) {
    personalNotes = personalNotes.filter(note => note.id !== id);
    localStorage.setItem('personalNotes', JSON.stringify(personalNotes));
    displayPersonalNotes();
}

function displayPersonalNotes() {
    const notesDisplay = document.getElementById('modalNotesDisplay') || document.getElementById('notesDisplay');
    if (!notesDisplay) return;
    
    const sortedNotes = personalNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    notesDisplay.innerHTML = `
        <div class="personal-notes-card">
            <h3>📝 Personal Notes</h3>
            <div class="notes-list">
                ${sortedNotes.length === 0 ? 
                    '<p class="no-notes">No notes yet</p>' :
                    sortedNotes.map(note => `
                        <div class="note-item">
                            <div class="note-category">${note.category}</div>
                            <div class="note-content">${note.content}</div>
                            <div class="note-date">${new Date(note.date).toLocaleDateString()}</div>
                            <button onclick="deleteNote(${note.id})" class="btn-delete-note">Delete</button>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

// ==================== 17. Notifications System ====================
function setupNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }
}

function scheduleNotification(title, body, delay) {
    if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
            new Notification(title, { body });
        }, delay);
    }
}

function checkReminders() {
    // Check medication reminders
    medications.forEach(med => {
        if (!med.takenToday) {
            scheduleNotification('Medication Reminder', `Time to take ${med.name}`, 60000);
        }
    });
    
    // Check appointment reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    appointments.forEach(apt => {
        const aptDate = new Date(apt.date);
        if (aptDate.toDateString() === tomorrow.toDateString() && !apt.completed) {
            scheduleNotification('Appointment Reminder', `You have ${apt.type} tomorrow`, 120000);
        }
    });
}

// ==================== 18. Multilingual Support ====================
const translations = {
    english: {
        pregnancyWeek: 'Pregnancy Week',
        babyGrowth: 'Baby Growth',
        bodyChanges: 'Body Changes',
        dailyTip: 'Daily Tip',
        appointments: 'Appointments',
        medications: 'Medications',
        nutrition: 'Nutrition',
        exercise: 'Exercise'
    },
    kinyarwanda: {
        pregnancyWeek: 'Icyumweru cyo imbarutso',
        babyGrowth: 'Imyitwarire y\'umwana',
        bodyChanges: 'Ihindagurika ry\'umubiri',
        dailyTip: 'Inama ya buri munsi',
        appointments: 'Ibiro by\'abaganga',
        medications: 'Imiti',
        nutrition: 'Imbuto',
        exercise: 'Imyitozo'
    },
    french: {
        pregnancyWeek: 'Semaine de grossesse',
        babyGrowth: 'Croissance du bébé',
        bodyChanges: 'Changements corporels',
        dailyTip: 'Conseil quotidien',
        appointments: 'Rendez-vous',
        medications: 'Médicaments',
        nutrition: 'Nutrition',
        exercise: 'Exercice'
    }
};

let currentLanguage = 'english';

function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('preferredLanguage', language);
    updateUITranslations();
}

function updateUITranslations() {
    const translation = translations[currentLanguage];
    
    // Update UI elements with translations
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translation[key]) {
            element.textContent = translation[key];
        }
    });
}

function initializeLanguage() {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'english';
    setLanguage(savedLanguage);
}

// ==================== Modal Functions ====================
function openPregnancyModal() {
    const modal = document.getElementById('pregnancyAdvancedModal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Load saved data
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    if (savedLastPeriod) {
        const lastPeriodInput = document.getElementById('modalLastPeriodDate');
        if (lastPeriodInput) lastPeriodInput.value = savedLastPeriod;
    }
    
    // Initialize displays
    displayPregnancyWeek();
    displayDailyTip();
    displayAppointments();
    displayMedications();
    displayWaterIntake();
    displayMoodTracking();
    displayKickCounter();
    displayContractionTimer();
    displayPersonalNotes();
    
    // Update dashboard
    updateDashboard();
}

function closePregnancyModal() {
    const modal = document.getElementById('pregnancyAdvancedModal');
    if (!modal) return;
    
    modal.classList.add('hidden');
}

function switchPregnancyTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.pregnancy-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.pregnancy-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabName + '-tab');
    if (selectedContent) selectedContent.classList.add('active');
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`.pregnancy-tab[data-tab="${tabName}"]`);
    if (selectedTab) selectedTab.classList.add('active');
    
    // Update dashboard when switching to it
    if (tabName === 'dashboard') {
        updateDashboard();
    }
}

function showPregnancyNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.pregnancy-notification');
    if (existingNotification) existingNotification.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `pregnancy-notification pregnancy-notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="notification-message">${message}</span>
    `;
    
    // Add to modal
    const modal = document.getElementById('pregnancyAdvancedModal');
    if (modal) {
        modal.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

function updateDashboard() {
    // Update current week
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    if (savedLastPeriod) {
        const lastPeriod = new Date(savedLastPeriod);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - lastPeriod);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(diffDays / 7);
        const weekDisplay = document.getElementById('dashboardWeek');
        if (weekDisplay) weekDisplay.textContent = `Week ${currentWeek}`;
    }
    
    // Update water intake
    const waterIntake = JSON.parse(localStorage.getItem('waterIntake') || '[]');
    const todayStr = new Date().toDateString();
    const todayWater = waterIntake.find(w => new Date(w.date).toDateString() === todayStr);
    const waterDisplay = document.getElementById('dashboardWater');
    if (waterDisplay) waterDisplay.textContent = `${todayWater ? todayWater.glasses : 0}/8`;
    
    // Update weight
    const weightRecords = JSON.parse(localStorage.getItem('weightRecords') || '[]');
    const weightDisplay = document.getElementById('dashboardWeight');
    if (weightDisplay && weightRecords.length > 0) {
        const latestWeight = weightRecords[weightRecords.length - 1];
        weightDisplay.textContent = `${latestWeight.weight} kg`;
    }
    
    // Update appointments count
    const appointments = JSON.parse(localStorage.getItem('pregnancyAppointments') || '[]');
    const nowDate = new Date();
    const upcomingAppointments = appointments.filter(a => new Date(a.date) >= nowDate && !a.completed);
    const appointmentsDisplay = document.getElementById('dashboardAppointments');
    if (appointmentsDisplay) appointmentsDisplay.textContent = upcomingAppointments.length;
    
    // Update daily tip on dashboard
    const dayOfWeek = new Date().getDay();
    const tip = pregnancyDailyTips[dayOfWeek % pregnancyDailyTips.length];
    const tipDisplay = document.getElementById('dashboardDailyTip');
    if (tipDisplay) {
        tipDisplay.innerHTML = `
            <div class="tip-content">
                <span class="tip-category">${tip.category}</span>
                <p class="tip-text">${tip.tip}</p>
            </div>
        `;
    }
    
    // Update pregnancy timeline
    displayPregnancyTimeline();
}

function displayPregnancyTimeline() {
    const timelineDisplay = document.getElementById('pregnancyTimeline');
    if (!timelineDisplay) return;
    
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    if (!savedLastPeriod) {
        timelineDisplay.innerHTML = '<p class="no-data">Enter your last period date to see your pregnancy timeline</p>';
        return;
    }
    
    const lastPeriod = new Date(savedLastPeriod);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastPeriod);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7);
    
    const milestones = [
        { week: 4, title: "First Prenatal Visit", completed: currentWeek >= 4, description: "Schedule your first prenatal appointment" },
        { week: 8, title: "First Ultrasound", completed: currentWeek >= 8, description: "See your baby's heartbeat for the first time" },
        { week: 12, title: "End of First Trimester", completed: currentWeek >= 12, description: "Morning sickness typically improves" },
        { week: 16, title: "Feel Baby's Movements", completed: currentWeek >= 16, description: "You may start feeling quickening" },
        { week: 20, title: "Anatomy Scan", completed: currentWeek >= 20, description: "Detailed ultrasound to check baby's development" },
        { week: 24, title: "Glucose Screening", completed: currentWeek >= 24, description: "Test for gestational diabetes" },
        { week: 28, title: "Third Trimester Begins", completed: currentWeek >= 28, description: "Start preparing for baby's arrival" },
        { week: 32, title: "Weekly Appointments", completed: currentWeek >= 32, description: "Begin weekly prenatal visits" },
        { week: 36, title: "Full Term Approaches", completed: currentWeek >= 36, description: "Baby could arrive anytime now" },
        { week: 40, title: "Due Date", completed: currentWeek >= 40, description: "Your baby's expected arrival date" }
    ];
    
    timelineDisplay.innerHTML = `
        <div class="timeline-container">
            ${milestones.map(milestone => `
                <div class="timeline-item ${milestone.completed ? 'completed' : 'pending'} ${currentWeek === milestone.week ? 'current' : ''}">
                    <div class="timeline-marker">
                        ${milestone.completed ? '✓' : currentWeek === milestone.week ? '●' : '○'}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-week">Week ${milestone.week}</div>
                        <div class="timeline-title">${milestone.title}</div>
                        <div class="timeline-description">${milestone.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function searchPregnancyFeatures(searchTerm) {
    const cards = document.querySelectorAll('.pregnancy-modal-card');
    const term = searchTerm.toLowerCase();
    
    cards.forEach(card => {
        const cardTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const cardContent = card.textContent.toLowerCase();
        
        if (cardTitle.includes(term) || cardContent.includes(term)) {
            card.style.display = '';
            card.style.opacity = '1';
        } else {
            card.style.display = term ? 'none' : '';
            card.style.opacity = term ? '0' : '1';
        }
    });
}

// ==================== Initialize All Functions ====================
function initializePregnancyPage() {
    // Load saved data
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    if (savedLastPeriod) {
        const lastPeriodInput = document.getElementById('lastPeriodDate');
        if (lastPeriodInput) lastPeriodInput.value = savedLastPeriod;
    }
    
    // Initialize displays
    displayPregnancyWeek();
    displayDailyTip();
    displayAppointments();
    displayMedications();
    displayWaterIntake();
    displayMoodTracking();
    displayKickCounter();
    displayContractionTimer();
    displayPersonalNotes();
    
    // Setup notifications
    setupNotifications();
    initializeLanguage();
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePregnancyPage);
} else {
    initializePregnancyPage();
}
