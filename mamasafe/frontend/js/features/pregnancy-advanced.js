// Advanced Pregnancy Page Functions
// Comprehensive pregnancy companion with 20+ features



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
        title: "Week 1: Early Pregnancy Preparation",
        babyDevelopment: "Your cycle is being tracked before a confirmed pregnancy. Week-specific pregnancy guidance begins after confirmation.",
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
        title: "Week 2: Early Pregnancy Timing",
        babyDevelopment: "Early pregnancy timing is being estimated from your cycle history before visible development milestones begin.",
        bodyChanges: "You may notice mild pelvic discomfort or no obvious changes yet.",
        guidance: [
            "Track cycle notes and discuss pregnancy timing with your clinician if needed",
            "Continue taking prenatal vitamins",
            "Stay hydrated and eat balanced meals",
            "Reduce caffeine intake to under 200mg daily",
            "Get adequate sleep (7-9 hours)"
        ],
        nutrition: "Include protein-rich foods and healthy fats in your diet.",
        exercise: "Light to moderate exercise is beneficial.",
        warnings: "Avoid overheating and ask your clinician before starting new supplements or medicines."
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

/*
// ==================== 9. Food Analysis Tool (legacy duplicate retained only for reference)
const foodAnalysisKB = {
    // Helpful during pregnancy: nutrient mapping (simple heuristic / not medical advice)
    helpful: {
        fish_salmon: {
            nutrients: ['Omega-3 (DHA)', 'Protein', 'Vitamin B12', 'Vitamin D'],
            notes: ['Supports fetal brain and eye development (DHA)', 'Choose low-mercury fish', 'Prefer cooked fish to reduce infection risk']
        },
        spinach: {
            nutrients: ['Folate', 'Iron', 'Vitamin C', 'Vitamin K'],
            notes: ['Folate supports neural tube development', 'Pair iron foods with vitamin C for better absorption']
        },
        eggs: {
            nutrients: ['Choline', 'Protein', 'Vitamin D', 'B12'],
            notes: ['Keep eggs fully cooked unless your clinician advises otherwise']
        },
        yogurt: {
            nutrients: ['Calcium', 'Protein', 'Vitamin B12', 'Probiotics (if live cultures)'],
            notes: ['Prefer pasteurized dairy', 'Helps with calcium intake']
        },
        avocado: {
            nutrients: ['Folate', 'Healthy fats', 'Fiber', 'Potassium'],
            notes: ['Supports steady energy and helps with constipation (fiber)']
        },
        lentils: {
            nutrients: ['Iron', 'Folate', 'Protein', 'Fiber'],
            notes: ['Plant-based iron and protein option', 'Increase fluids with fiber foods to reduce constipation']
        },
        broccoli: {
            nutrients: ['Vitamin C', 'Fiber', 'Folate', 'Vitamin K'],
            notes: ['Supports immunity and digestion', 'Steam or cook to improve tolerance if needed']
        },
        brown_rice: {
            nutrients: ['Complex carbohydrates', 'Fiber', 'Magnesium'],
            notes: ['Steadier energy and helps manage cravings', 'Useful if nausea is improving and you need consistent carbs']
        },
        beans: {
            nutrients: ['Folate', 'Iron', 'Protein', 'Fiber'],
            notes: ['Supports blood volume and fetal growth', 'Fiber can help constipation; increase fluids too']
        },
        oatmeal: {
            nutrients: ['Complex carbohydrates', 'Fiber', 'Iron', 'B vitamins'],
            notes: ['Gentle option for nausea-prone mornings', 'Can support steady energy between meals']
        },
        sweet_potato: {
            nutrients: ['Vitamin A (as beta-carotene)', 'Fiber', 'Potassium', 'Vitamin C'],
            notes: ['Beta-carotene supports healthy development without the same concern as high-dose retinol', 'Pair with protein for a steadier meal']
        },
        lean_chicken: {
            nutrients: ['Protein', 'Iron', 'Vitamin B6', 'Niacin'],
            notes: ['Supports fetal tissue growth and maternal blood volume', 'Cook poultry fully and avoid cross-contamination']
        },
        oranges: {
            nutrients: ['Vitamin C', 'Folate', 'Fluid', 'Fiber'],
            notes: ['Vitamin C helps iron absorption from plant foods', 'Hydrating and often tolerable with nausea']
        }
    },
    // Harmful / to avoid or be cautious with during pregnancy.
    harmful: {
        raw_shellfish: {
            label: 'Harmful: raw/undercooked seafood',
            guidance: ['Avoid raw or undercooked seafood (infection risk)', 'Choose fully cooked options']
        },
        unpasteurized_dairy: {
            label: 'Harmful: unpasteurized dairy',
            guidance: ['Avoid unpasteurized milk, cheese, or yogurt', 'Choose pasteurized dairy']
        },
        high_mercury_fish: {
            label: 'Caution/Harmful: high-mercury fish',
            guidance: ['Avoid shark, swordfish, king mackerel, and tilefish (high mercury)', 'Prefer low-mercury fish like salmon, sardines']
        },
        alcohol: {
            label: 'Harmful: alcohol',
            guidance: ['Avoid alcohol during pregnancy']
        },
        raw_eggs: {
            label: 'Caution/Harmful: raw/undercooked eggs',
            guidance: ['Avoid raw egg preparations (e.g., runny eggs, homemade mayo, certain desserts) unless well-cooked']
        },
        excessive_caffeine: {
            label: 'Caution: excessive caffeine',
            guidance: ['Limit caffeine (often recommended max is ~200mg/day; confirm with your clinician)']
        },
        deli_meat: {
            label: 'Caution: deli meat or refrigerated ready-to-eat meat',
            guidance: ['Heat deli meat until steaming hot to reduce listeria risk', 'Choose freshly cooked protein when possible']
        },
        raw_sprouts: {
            label: 'Harmful: raw sprouts',
            guidance: ['Avoid raw sprouts during pregnancy because bacteria can be difficult to wash away', 'Eat sprouts only if thoroughly cooked']
        }
    },
    // Keyword-based matcher from user input.
    keywordMap: {
        salmon: 'fish_salmon',
        'wild salmon': 'fish_salmon',
        spinach: 'spinach',
        'leafy greens': 'spinach',
        eggs: 'eggs',
        egg: 'eggs',
        yogurt: 'yogurt',
        'greek yogurt': 'yogurt',
        avocado: 'avocado',
        lentils: 'lentils',
        chickpeas: 'lentils',
        broccoli: 'broccoli',
        'brown rice': 'brown_rice',
        rice: 'brown_rice',
        beans: 'beans',
        bean: 'beans',
        'black beans': 'beans',
        oats: 'oatmeal',
        oatmeal: 'oatmeal',
        porridge: 'oatmeal',
        'sweet potato': 'sweet_potato',
        chicken: 'lean_chicken',
        poultry: 'lean_chicken',
        orange: 'oranges',
        oranges: 'oranges',
        salmonella: 'raw_eggs',
        'raw egg': 'raw_eggs',
        runny: 'raw_eggs',
        uncooked: 'raw_eggs'
    },
    harmfulKeywords: {
        'raw fish': 'raw_shellfish',
        'raw seafood': 'raw_shellfish',
        sushi: 'raw_shellfish',
        oysters: 'raw_shellfish',
        unpasteurized: 'unpasteurized_dairy',
        'unpasteurized dairy': 'unpasteurized_dairy',
        cheese: 'unpasteurized_dairy',
        'high mercury': 'high_mercury_fish',
        shark: 'high_mercury_fish',
        swordfish: 'high_mercury_fish',
        'king mackerel': 'high_mercury_fish',
        alcohol: 'alcohol',
        caffeine: 'excessive_caffeine',
        'energy drink': 'excessive_caffeine'
    }
};

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');
}

function detectFoodCategory(foodText) {
    const t = String(foodText || '').toLowerCase();
    for (const [kw, key] of Object.entries(foodAnalysisKB.harmfulKeywords)) {
        if (t.includes(kw)) return { kind: 'harmful', key };
    }
    for (const [kw, key] of Object.entries(foodAnalysisKB.keywordMap)) {
        if (t.includes(kw)) return { kind: 'helpful', key };
    }
    return { kind: 'unknown', key: null };
}

function buildFoodAnalysisOutput(foodName, notes = '') {
    const foodText = `${foodName} ${notes}`.toLowerCase();
    const detected = detectFoodCategory(foodText);

    if (detected.kind === 'harmful') {
        const info = foodAnalysisKB.harmful[detected.key];
        return `
            <div class="food-analysis-result urgent">
                <h4>⚠️ ${escapeHTML(info.label)}</h4>
                <p>Pregnancy safety guidance is prioritized here (educational only).</p>
                <h5>What to do</h5>
                <ul>
                    ${info.guidance.map(g => `<li>${escapeHTML(g)}</li>`).join('')}
                </ul>
                <p class="pregnancy-rag-muted">Confirm with your clinician if you have medical conditions or specific dietary restrictions.</p>
            </div>
        `;
    }

    if (detected.kind === 'helpful') {
        const info = foodAnalysisKB.helpful[detected.key];
        return `
            <div class="food-analysis-result ready">
                <h4>✅ Helpful for pregnancy (generally)</h4>
                <p><strong>Food:</strong> ${escapeHTML(foodName)}</p>
                <h5>Essential nutrients</h5>
                <ul>
                    ${info.nutrients.map(n => `<li>${escapeHTML(n)}</li>`).join('')}
                </ul>
                <h5>Why it helps</h5>
                <ul>
                    ${info.notes.map(n => `<li>${escapeHTML(n)}</li>`).join('')}
                </ul>
                <p class="pregnancy-rag-muted">This is educational guidance; preparation matters (e.g., cooked vs raw, pasteurized vs unpasteurized).</p>
            </div>
        `;
    }

    return `
        <div class="food-analysis-result review">
            <h4>🧩 Food detected: ${escapeHTML(foodName)}</h4>
            <p>I couldn’t match this food to a specific nutrient/safety profile in the starter knowledge base.</p>
            <h5>General pregnancy-safe guidance</h5>
            <ul>
                <li>Choose well-cooked foods; avoid raw/undercooked animal foods.</li>
                <li>Prefer pasteurized dairy and properly stored foods.</li>
                <li>Build meals around protein, fiber, vitamins, and hydration.</li>
                <li>Ask your clinician about caffeine limits and any dietary restrictions for your health.</li>
            </ul>
        </div>
    `;
}

function analyzeFoodForPregnancy() {
    const input = document.getElementById('foodAnalysisInput');
    const notesEl = document.getElementById('foodAnalysisNotes');
    const output = document.getElementById('foodAnalysisOutput');
    const button = document.getElementById('foodAnalysisButton');
    if (!input || !output) return;

    const foodName = input.value?.trim();
    const notes = notesEl?.value?.trim() || '';

    if (!foodName) {
        output.innerHTML = '<p class="pregnancy-rag-muted">Please enter a food name to analyze.</p>';
        input.focus();
        return;
    }

    output.innerHTML = '<strong>Analyzing food for pregnancy...</strong>';

    // (Legacy fallback removed; AI/local analysis is rendered by the fetch chain above.)
}
*/


// ==================== Food Analysis Tool (replaces Nutrition Guide) ====================
// Tool displays essential nutrients + helpful/harmful verdict.

/*


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
*/

// ==================== 9. Food Analysis Tool (replaces Nutrition Guide) ====================
const foodAnalysisKB = {
    // Helpful during pregnancy: nutrient mapping (simple heuristic / not medical advice)
    helpful: {
        fish_salmon: {
            nutrients: ['Omega-3 (DHA)', 'Protein', 'Vitamin B12', 'Vitamin D'],
            notes: ['Supports fetal brain and eye development (DHA)', 'Choose low-mercury fish', 'Prefer cooked fish to reduce infection risk']
        },
        spinach: {
            nutrients: ['Folate', 'Iron', 'Vitamin C', 'Vitamin K'],
            notes: ['Folate supports neural tube development', 'Pair iron foods with vitamin C for better absorption']
        },
        eggs: {
            nutrients: ['Choline', 'Protein', 'Vitamin D', 'B12'],
            notes: ['Keep eggs fully cooked unless your clinician advises otherwise']
        },
        yogurt: {
            nutrients: ['Calcium', 'Protein', 'Vitamin B12', 'Probiotics (if live cultures)'],
            notes: ['Prefer pasteurized dairy', 'Helps with calcium intake']
        },
        avocado: {
            nutrients: ['Folate', 'Healthy fats', 'Fiber', 'Potassium'],
            notes: ['Supports steady energy and helps with constipation (fiber)']
        },
        lentils: {
            nutrients: ['Iron', 'Folate', 'Protein', 'Fiber'],
            notes: ['Plant-based iron and protein option', 'Increase fluids with fiber foods to reduce constipation']
        },
        broccoli: {
            nutrients: ['Vitamin C', 'Fiber', 'Folate', 'Vitamin K'],
            notes: ['Supports immunity and digestion', 'Steam or cook to improve tolerance if needed']
        },
        brown_rice: {
            nutrients: ['Complex carbohydrates', 'Fiber', 'Magnesium'],
            notes: ['Steadier energy and helps manage cravings', 'Useful if nausea is improving and you need consistent carbs']
        },
        beans: {
            nutrients: ['Folate', 'Iron', 'Protein', 'Fiber'],
            notes: ['Supports blood volume and fetal growth', 'Increase fluids with fiber foods']
        },
        oatmeal: {
            nutrients: ['Complex carbohydrates', 'Fiber', 'Iron', 'B vitamins'],
            notes: ['Gentle breakfast option', 'Can help keep energy steadier']
        },
        sweet_potato: {
            nutrients: ['Beta-carotene', 'Fiber', 'Potassium', 'Vitamin C'],
            notes: ['Supports healthy development', 'Pair with protein for a balanced meal']
        },
        lean_chicken: {
            nutrients: ['Protein', 'Iron', 'Vitamin B6', 'Niacin'],
            notes: ['Supports fetal tissue growth', 'Cook poultry fully']
        },
        oranges: {
            nutrients: ['Vitamin C', 'Folate', 'Fluid', 'Fiber'],
            notes: ['Vitamin C helps iron absorption', 'Hydrating and often nausea-friendly']
        }
    },
    // Harmful / to avoid or be cautious with during pregnancy.
    harmful: {
        raw_shellfish: {
            label: 'Harmful: raw/undercooked seafood',
            guidance: ['Avoid raw or undercooked seafood (infection risk)', 'Choose fully cooked options']
        },
        unpasteurized_dairy: {
            label: 'Harmful: unpasteurized dairy',
            guidance: ['Avoid unpasteurized milk, cheese, or yogurt', 'Choose pasteurized dairy']
        },
        high_mercury_fish: {
            label: 'Caution/Harmful: high-mercury fish',
            guidance: ['Avoid shark, swordfish, king mackerel, and tilefish (high mercury)', 'Prefer low-mercury fish like salmon, sardines']
        },
        alcohol: {
            label: 'Harmful: alcohol',
            guidance: ['Avoid alcohol during pregnancy']
        },
        raw_eggs: {
            label: 'Caution/Harmful: raw/undercooked eggs',
            guidance: ['Avoid raw egg preparations (e.g., runny eggs, homemade mayo, certain desserts) unless well-cooked']
        },
        excessive_caffeine: {
            label: 'Caution: excessive caffeine',
            guidance: ['Limit caffeine (often recommended max is ~200mg/day; confirm with your clinician)']
        },
        deli_meat: {
            label: 'Caution: deli meat or cold cuts',
            guidance: ['Heat deli meat until steaming hot to reduce listeria risk', 'Choose freshly cooked protein when possible']
        },
        raw_sprouts: {
            label: 'Harmful: raw sprouts',
            guidance: ['Avoid raw sprouts because bacteria can be difficult to wash away', 'Eat sprouts only if thoroughly cooked']
        }
    },
    // Keyword-based matcher from user input.
    keywordMap: {
        salmon: 'fish_salmon',
        'wild salmon': 'fish_salmon',
        spinach: 'spinach',
        'leafy greens': 'spinach',
        eggs: 'eggs',
        egg: 'eggs',
        yogurt: 'yogurt',
        'greek yogurt': 'yogurt',
        avocado: 'avocado',
        lentils: 'lentils',
        chickpeas: 'lentils',
        broccoli: 'broccoli',
        'brown rice': 'brown_rice',
        rice: 'brown_rice',
        beans: 'beans',
        bean: 'beans',
        'black beans': 'beans',
        oats: 'oatmeal',
        oatmeal: 'oatmeal',
        porridge: 'oatmeal',
        'sweet potato': 'sweet_potato',
        chicken: 'lean_chicken',
        poultry: 'lean_chicken',
        orange: 'oranges',
        oranges: 'oranges'
    },
    harmfulKeywords: {
        'raw fish': 'raw_shellfish',
        'raw seafood': 'raw_shellfish',
        sushi: 'raw_shellfish',
        oysters: 'raw_shellfish',
        'unpasteurized': 'unpasteurized_dairy',
        'unpasteurized dairy': 'unpasteurized_dairy',
        cheese: 'unpasteurized_dairy',
        'high mercury': 'high_mercury_fish',
        shark: 'high_mercury_fish',
        swordfish: 'high_mercury_fish',
        'king mackerel': 'high_mercury_fish',
        alcohol: 'alcohol',
        'caffeine': 'excessive_caffeine',
        'energy drink': 'excessive_caffeine',
        'deli meat': 'deli_meat',
        'cold cuts': 'deli_meat',
        salami: 'deli_meat',
        'raw sprouts': 'raw_sprouts',
        sprouts: 'raw_sprouts'
    }
};

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizeFoodText(text = '') {
    return String(text || '').toLowerCase().trim();
}

function foodArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value)
        .split(/\n|;|\u2022/g)
        .map(item => item.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
}

function detectFoodCategory(foodText) {
    const t = normalizeFoodText(foodText);

    // Harmful checks first
    for (const [kw, key] of Object.entries(foodAnalysisKB.harmfulKeywords)) {
        if (t.includes(kw)) return { kind: 'harmful', key };
    }

    // Helpful mapping
    for (const [kw, key] of Object.entries(foodAnalysisKB.keywordMap)) {
        if (t.includes(kw)) return { kind: 'helpful', key };
    }

    return { kind: 'unknown', key: null };
}

function getPregnancyFoodAiUrl() {
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
    const configured = window.MAMASAFE_BACKEND_ORIGIN || window.BACKEND_API?.getBaseUrl?.();
    const origin = configured || (localHosts.includes(window.location.hostname) && window.location.port !== '5000'
        ? `${window.location.protocol}//${window.location.hostname}:5000`
        : window.location.origin);
    return `${origin.replace(/\/$/, '')}/api/ai-nutrition-analysis`;
}

async function fetchPregnancyFoodAiAnalysis(foodName, notes = '') {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);

    try {
        const response = await fetch(getPregnancyFoodAiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'pregnancy-food-analysis',
                food: foodName,
                notes,
                prompt: `Analyze ${foodName} for pregnancy. Include essential nutrients and whether it is helpful, harmful, or needs caution.`
            }),
            signal: controller.signal
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || (!data.verdict && !data.essentialNutrients && !data.safetyLevel)) {
            throw new Error('Unexpected nutrition response');
        }
        return data;
    } finally {
        window.clearTimeout(timeout);
    }
}

function buildAiFoodAnalysisOutput(foodName, analysis) {
    const verdict = analysis.verdict || analysis.safetyLevel || 'Review';
    const tone = /harm|avoid|unsafe/i.test(verdict)
        ? 'urgent'
        : /caution|limit|mixed|review/i.test(verdict)
            ? 'review'
            : 'ready';
    const nutrients = foodArray(analysis.essentialNutrients || analysis.nutrients);
    const helpful = foodArray(analysis.whyHelpful || analysis.benefits || analysis.helpfulPoints);
    const risks = foodArray(analysis.risks || analysis.harmfulReasons || analysis.cautions);
    const tips = foodArray(analysis.preparationTips || analysis.guidance || analysis.safePreparation);

    return `
        <div class="food-analysis-result ${tone}">
            <h4>AI pregnancy food verdict: ${escapeHTML(verdict)}</h4>
            <p><strong>Food:</strong> ${escapeHTML(foodName)}</p>
            ${analysis.summary ? `<p>${escapeHTML(analysis.summary)}</p>` : ''}
            <h5>Essential nutrients</h5>
            <ul>${(nutrients.length ? nutrients : ['Nutrients were not specified by the AI response.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
            ${helpful.length ? `<h5>Why it may help</h5><ul>${helpful.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}
            ${risks.length ? `<h5>Pregnancy cautions</h5><ul>${risks.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}
            ${tips.length ? `<h5>Safer preparation</h5><ul>${tips.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}
            <p class="pregnancy-rag-muted">Educational only. Preparation, allergies, lab results, and your clinician's advice can change what is right for you.</p>
        </div>
    `;
}

function buildFoodAnalysisOutput(foodName, notes = '', options = {}) {
    if (options.aiAnalysis) return buildAiFoodAnalysisOutput(foodName, options.aiAnalysis);

    const foodText = `${foodName} ${notes}`.toLowerCase();
    const detected = detectFoodCategory(foodText);

    if (detected.kind === 'harmful') {
        const info = foodAnalysisKB.harmful[detected.key];
        return `
            <div class="food-analysis-result urgent">
                <h4>⚠️ ${escapeHTML(info.label)}</h4>
                <p>Why this matters: pregnancy safety guidance is prioritized here (educational only).</p>
                <h5>What to do</h5>
                <ul>
                    ${info.guidance.map(g => `<li>${escapeHTML(g)}</li>`).join('')}
                </ul>
                <p class="pregnancy-rag-muted">${options.notice ? escapeHTML(options.notice) : 'Local pregnancy safety guidance shown.'}</p>
            </div>
        `;
    }

    if (detected.kind === 'helpful') {
        const info = foodAnalysisKB.helpful[detected.key];
        return `
            <div class="food-analysis-result ready">
                <h4>✅ Helpful for pregnancy (generally)</h4>
                <p><strong>Food:</strong> ${escapeHTML(foodName)}</p>
                <h5>Essential nutrients</h5>
                <ul>
                    ${info.nutrients.map(n => `<li>${escapeHTML(n)}</li>`).join('')}
                </ul>
                <h5>Why it helps</h5>
                <ul>
                    ${info.notes.map(n => `<li>${escapeHTML(n)}</li>`).join('')}
                </ul>
                <p class="pregnancy-rag-muted">${options.notice ? escapeHTML(options.notice) : 'Local nutrient map shown. Preparation matters, such as cooked vs raw and pasteurized vs unpasteurized.'}</p>
            </div>
        `;
    }

    // Unknown / fallback
    return `
        <div class="food-analysis-result review">
            <h4>🧩 Food detected: ${escapeHTML(foodName)}</h4>
            <p>I couldn’t match this food to a specific nutrient/safety profile in the built-in starter knowledge base.</p>
            <h5>General pregnancy-safe guidance</h5>
            <ul>
                <li>Choose well-cooked foods; avoid raw/undercooked animal foods.</li>
                <li>Prefer pasteurized dairy and properly stored foods.</li>
                <li>Build meals around protein, fiber, vitamins, and hydration.</li>
                <li>Ask your clinician about caffeine limits and any dietary restrictions for your labs/health conditions.</li>
            </ul>
            <p class="pregnancy-rag-muted">${options.notice ? escapeHTML(options.notice) : 'Local fallback guidance shown.'}</p>
        </div>
    `;
}

function analyzeFoodForPregnancy() {
    const input = document.getElementById('foodAnalysisInput');
    const notesEl = document.getElementById('foodAnalysisNotes');
    const output = document.getElementById('foodAnalysisOutput');
    const button = document.getElementById('foodAnalysisButton');
    if (!input || !output) return;

    const foodName = input.value?.trim();
    const notes = notesEl?.value?.trim() || '';

    if (!foodName) {
        output.innerHTML = '<p class="pregnancy-rag-muted">Please enter a food name to analyze.</p>';
        input.focus();
        return;
    }

    if (button) button.disabled = true;
    output.innerHTML = '<div class="food-analysis-loading">Analyzing food for pregnancy...</div>';

    fetchPregnancyFoodAiAnalysis(foodName, notes)
        .then(aiAnalysis => {
            output.innerHTML = buildFoodAnalysisOutput(foodName, notes, { aiAnalysis });
        })
        .catch(() => {
            output.innerHTML = buildFoodAnalysisOutput(foodName, notes, {
                notice: 'AI service is unavailable, so this local pregnancy safety map is shown instead.'
            });
        })
        .finally(() => {
            if (button) button.disabled = false;
        });
}


function setupFoodAnalysisTool() {
    const input = document.getElementById('foodAnalysisInput');
    if (!input || input.dataset.foodAnalysisBound === 'true') return;
    input.dataset.foodAnalysisBound = 'true';
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            analyzeFoodForPregnancy();
        }
    });
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
        week: null
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
        week: null

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

// ==================== 14. (Removed) Kick Counter ====================
// ==================== 15. (Removed) Contraction Timer ====================
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

function getCycleLengthDaysFromUIOrStorage() {
    const cycleLengthInput = document.getElementById('cycleLength');
    if (cycleLengthInput && cycleLengthInput.value) return parseInt(cycleLengthInput.value, 10) || 28;

    const savedCycleLength = localStorage.getItem('cycleLength');
    return savedCycleLength ? parseInt(savedCycleLength, 10) || 28 : 28;
}

function isPregnancyRemindersEnabled() {
    return localStorage.getItem('enablePregnancyReminders') !== 'false';
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

function showNotificationNow(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}

// Keep old API used by medication/appointments
function scheduleNotification(title, body, delay) {
    // Existing reminder engine is handled globally in script-new.js.
    // Keep this function for backward compatibility with older code.
    try {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        const ms = Math.max(0, Number(delay) || 0);
        window.setTimeout(() => {
            new Notification(title || 'Notification', {
                body: body || ''
            });
        }, ms);
    } catch (e) {
        // Ignore notification errors (blocked permissions, unsupported contexts, etc.)
    }
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
    // (Due date / pregnancy timing UI removed)
    displayDailyTip();
    displayAppointments();
    displayMedications();
    displayWaterIntake();
    displayMoodTracking();
    // (Kick counter removed)
    // (Contraction timer removed)
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
    // Wire pregnancy-advanced.js to pregnancyRag.js backend-powered pregnancy profile.
    // If pregnancy-rag page helpers exist, we enable an AI-backed week guide.
    try {
        if (typeof window.calculatePregnancyProfile === 'function') {
            window.calculatePregnancyProfile();
        } else if (typeof window.calculatePregnancyProfile === 'undefined') {
            // no-op
        }
    } catch (e) {
        // silent: keep local UI functional
    }
    // Load saved data
    const savedLastPeriod = localStorage.getItem('lastPeriodDate');
    if (savedLastPeriod) {
        const lastPeriodInput = document.getElementById('lastPeriodDate');
        if (lastPeriodInput) lastPeriodInput.value = savedLastPeriod;
    }
    
    // Initialize displays
    // (Due date / pregnancy timing UI removed)
    displayDailyTip();
    displayAppointments();
    displayMedications();
    displayWaterIntake();
    displayMoodTracking();
    // (Kick counter removed)
    // (Contraction timer removed)
    displayPersonalNotes();
    setupFoodAnalysisTool();

    
    // Setup notifications
    setupNotifications();
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePregnancyPage);
} else {
    initializePregnancyPage();
}
