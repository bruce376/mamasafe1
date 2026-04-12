// ==========================================
// TODDLER TOPIC PAGE FUNCTIONS
// ==========================================

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Utility Functions
function formatTime12Hour(timeString) {
    if (typeof timeString === 'string') {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    } else if (timeString instanceof Date) {
        const hours = timeString.getHours();
        const minutes = timeString.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHour}:${displayMinutes} ${ampm}`;
    }
    return timeString;
}

// Sleep Guides Functions
function generateSleepSchedule() {
    const age = document.getElementById('scheduleAge')?.value;
    const wakeTime = document.getElementById('wakeTime')?.value;
    
    if (!age || !wakeTime) {
        showNotification('Please select age and wake time', 'error');
        return;
    }
    
    const [hours, minutes] = wakeTime.split(':').map(Number);
    let wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0);
    
    const schedules = {
        '1': { naps: 2, nap1Duration: 1.5, nap2Duration: 1, bedtime: 19.5 },
        '2': { naps: 1, nap1Duration: 2, nap2Duration: 0, bedtime: 19.5 },
        '3': { naps: 1, nap1Duration: 1.5, nap2Duration: 0, bedtime: 20 },
        '4': { naps: 0, nap1Duration: 0, nap2Duration: 0, bedtime: 20 }
    };
    
    const schedule = schedules[age];
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px; margin-top: 20px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Recommended Schedule:</h4>`;
    html += `<div style="display: grid; gap: 10px;">`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #4caf50;">`;
    html += `<strong>Wake Up:</strong> ${formatTime12Hour(wakeTime)}</div>`;
    
    if (schedule.naps >= 1) {
        let nap1Start = new Date(wakeDate.getTime() + 3 * 60 * 60 * 1000);
        let nap1End = new Date(nap1Start.getTime() + schedule.nap1Duration * 60 * 60 * 1000);
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ff9800;">`;
        html += `<strong>Nap 1:</strong> ${formatTime12Hour(nap1Start)} - ${formatTime12Hour(nap1End)}</div>`;
    }
    
    if (schedule.naps >= 2) {
        let nap2Start = new Date(wakeDate.getTime() + 7 * 60 * 60 * 1000);
        let nap2End = new Date(nap2Start.getTime() + schedule.nap2Duration * 60 * 60 * 1000);
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ff9800;">`;
        html += `<strong>Nap 2:</strong> ${formatTime12Hour(nap2Start)} - ${formatTime12Hour(nap2End)}</div>`;
    }
    
    let bedtime = new Date(wakeDate);
    bedtime.setHours(Math.floor(schedule.bedtime), (schedule.bedtime % 1) * 60, 0);
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">`;
    html += `<strong>Bedtime:</strong> ${formatTime12Hour(bedtime)}</div>`;
    html += `</div></div>`;
    
    const resultDiv = document.getElementById('scheduleResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function showSleepTip(tipId) {
    const tips = {
        'routine': { title: 'Perfect Bedtime Routine', content: '1. Start 30 mins before bed\n2. Warm bath to relax\n3. Quiet play or reading\n4. Dim lights, calm voice\n5. Consistent goodnight phrase' },
        'environment': { title: 'Ideal Sleep Environment', content: 'Temperature: 68-72°F\nBlackout curtains\nWhite noise machine\nComfortable mattress\nSafety-approved crib' },
        'naps': { title: 'Nap Time Tips', content: 'Follow sleepy cues\nNap in same place as night\nLimit naps to 2-3 hours\nLast nap before 4 PM\nBe consistent with timing' },
        'regression': { title: 'Handling Sleep Regression', content: 'Stay consistent with routine\nOffer extra comfort\nAdjust wake windows\nCheck for teething/illness\nThis phase will pass!' }
    };
    
    const tip = tips[tipId];
    if (tip) showModal(tip.title, tip.content);
}

function solveSleepProblem() {
    const issue = document.getElementById('sleepProblem')?.value;
    if (!issue) {
        showNotification('Please select a sleep problem', 'error');
        return;
    }
    
    const solutions = {
        'waking': 'Night Waking Solutions:\n\n1. Wait 5-10 mins before responding\n2. Check for hunger/discomfort\n3. Keep lights dim and interactions minimal\n4. Use patting instead of picking up\n5. Ensure room temperature is comfortable',
        'refusal': 'Bedtime Refusal Solutions:\n\n1. Check wake windows - may need adjustment\n2. Ensure enough physical activity during day\n3. Be consistent and calm\n4. Use "quiet time" even if not sleeping\n5. Check for overtiredness',
        'early': 'Early Waking Solutions:\n\n1. Use blackout curtains\n2. Check if bedtime is too early\n3. Adjust nap schedule if needed\n4. Keep room quiet until desired wake time\n5. Gradually shift bedtime later',
        'nap': 'Nap Strike Solutions:\n\n1. Keep offering quiet time\n2. Check developmental leaps\n3. Ensure not overtired\n4. Try earlier nap time\n5. Be patient - this usually passes',
        'association': 'Sleep Association Solutions:\n\n1. Introduce a lovey/comfort object\n2. Use white noise consistently\n3. Practice putting drowsy but awake\n4. Gradually reduce rocking/nursing to sleep\n5. Be consistent with new routine'
    };
    
    showModal('Solution', solutions[issue]);
}

function showSleepStats() {
    const entries = JSON.parse(localStorage.getItem('mamacare_sleep_track_entries') || '[]');
    const last7 = entries.slice(-7);
    
    let totalHours = 0;
    if (last7.length > 0) {
        last7.forEach(entry => {
            totalHours += entry.hours + entry.minutes / 60;
        });
    }
    const avgHours = last7.length > 0 ? (totalHours / last7.length).toFixed(1) : 0;
    
    let html = `<div style="padding: 20px;">`;
    html += `<h4 style="margin-bottom: 15px;">Last 7 Days Sleep Stats</h4>`;
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
    html += `<div style="background: #e3f2fd; padding: 15px; border-radius: 10px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #1565c0;">${avgHours}h</div>`;
    html += `<div style="font-size: 12px;">Avg Sleep</div></div>`;
    html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #4caf50;">${last7.length}</div>`;
    html += `<div style="font-size: 12px;">Entries</div></div>`;
    html += `</div></div>`;
    
    const statsDiv = document.getElementById('sleepStats');
    if (statsDiv) statsDiv.innerHTML = html;
}

// Feeding Functions
function generateMealPlan() {
    const dietPreference = document.getElementById('dietPreference')?.value;
    if (!dietPreference) {
        showNotification('Please select dietary preference', 'error');
        return;
    }
    
    const plans = {
        'balanced': { breakfast: 'Oatmeal with mashed banana', snack1: 'Soft cooked apple', lunch: 'Mashed sweet potato + chicken', snack2: 'Yogurt with berries', dinner: 'Soft pasta with veggie sauce' },
        'vegetarian': { breakfast: 'Oatmeal with mashed banana', snack1: 'Soft cooked apple', lunch: 'Mashed sweet potato + beans', snack2: 'Yogurt with berries', dinner: 'Soft pasta with veggie sauce' },
        'allergy-friendly': { breakfast: 'Oatmeal with mashed banana', snack1: 'Soft cooked apple', lunch: 'Mashed sweet potato + turkey', snack2: 'Coconut yogurt with berries', dinner: 'Soft pasta with veggie sauce' },
        'high-protein': { breakfast: 'Scrambled eggs + toast', snack1: 'Cheese cubes + pear', lunch: 'Mini turkey meatballs', snack2: 'Greek yogurt with berries', dinner: 'Baked fish + quinoa' }
    };
    
    const plan = plans[dietPreference];
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px; margin-top: 20px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Today's Meal Plan:</h4>`;
    html += `<div style="display: grid; gap: 10px;">`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ff9800;"><strong>Breakfast:</strong> ${plan.breakfast}</div>`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #4caf50;"><strong>Snack:</strong> ${plan.snack1}</div>`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #2196f3;"><strong>Lunch:</strong> ${plan.lunch}</div>`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #9c27b0;"><strong>Snack:</strong> ${plan.snack2}</div>`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #667eea;"><strong>Dinner:</strong> ${plan.dinner}</div>`;
    html += `</div></div>`;
    
    const resultDiv = document.getElementById('mealPlanResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function calculateNutrition() {
    const age = parseInt(document.getElementById('nutritionAge')?.value);
    const meals = parseInt(document.getElementById('mealsPerDay')?.value);
    
    if (!age || !meals) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    let calories = age <= 12 ? 900 : age <= 24 ? 1000 : 1200;
    let protein = age <= 12 ? 11 : age <= 24 ? 13 : 16;
    
    const perMealCal = Math.round(calories / meals);
    const perMealPro = Math.round(protein / meals * 10) / 10;
    
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px; margin-top: 20px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Daily Nutrition Requirements:</h4>`;
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #ff9800;">${calories}</div>`;
    html += `<div style="font-size: 12px;">Calories/day</div></div>`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #4caf50;">${protein}g</div>`;
    html += `<div style="font-size: 12px;">Protein/day</div></div>`;
    html += `</div>`;
    html += `<p style="margin-top: 15px; font-size: 14px; color: #666;">Target per meal: ~${perMealCal} cal, ${perMealPro}g protein</p>`;
    html += `</div>`;
    
    const resultDiv = document.getElementById('nutritionResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function showFeedingSolution() {
    const issue = document.getElementById('feedingIssue')?.value;
    if (!issue) {
        showNotification('Please select a feeding issue', 'error');
        return;
    }
    
    const solutions = {
        'picky': 'Picky Eater Solutions:\n\n1. Offer variety without pressure\n2. Make food fun - shapes, colors\n3. Involve them in meal prep\n4. Serve small portions\n5. Be patient - tastes change',
        'refusing': 'Food Refusal Solutions:\n\n1. Check for teething/discomfort\n2. Reduce milk before meals\n3. Offer finger foods\n4. Eat together as family\n5. Limit snacks 2 hours before meals',
        'allergy': 'Allergy Management:\n\n1. Introduce one new food at a time\n2. Watch for reactions for 3 days\n3. Keep emergency contacts ready\n4. Read all food labels\n5. Consult allergist for testing',
        'choking': 'Preventing Choking:\n\n1. Cut food into small pieces\n2. Avoid hard, round foods\n3. Supervise all eating\n4. Learn infant CPR\n5. Stay calm if choking occurs'
    };
    
    showModal('Feeding Solution', solutions[issue]);
}

function showQuickRecipe() {
    const recipes = [
        { name: 'Banana Pancakes', time: '10 min', ingredients: 'Banana, egg, oats' },
        { name: 'Veggie Muffins', time: '25 min', ingredients: 'Carrots, zucchini, flour, egg' },
        { name: 'Hidden Veggie Pasta', time: '15 min', ingredients: 'Pasta, tomato sauce, pureed veggies' },
        { name: 'Mini Egg Muffins', time: '20 min', ingredients: 'Eggs, cheese, veggies' }
    ];
    
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    showModal(recipe.name, `Time: ${recipe.time}\nIngredients: ${recipe.ingredients}\n\nPerfect for busy parents!`);
}

// Potty Training Functions
function checkPottyReadiness() {
    const age = document.getElementById('pottyAge')?.value;
    const checks = [
        document.getElementById('staysDry')?.checked,
        document.getElementById('showsInterest')?.checked,
        document.getElementById('followsInstructions')?.checked,
        document.getElementById('communicatesNeeds')?.checked
    ];
    
    const checkedCount = checks.filter(c => c).length;
    const ready = checkedCount >= 3;
    
    let html = `<div style="padding: 20px; background: ${ready ? '#e8f5e9' : '#fff3e0'}; border-radius: 15px; margin-top: 20px;">`;
    html += `<div style="font-size: 48px; text-align: center; margin-bottom: 10px;">${ready ? '✅' : '⏳'}</div>`;
    html += `<h4 style="text-align: center; color: ${ready ? '#4caf50' : '#ff9800'};">${ready ? 'Ready to Start!' : 'Not Quite Ready'}</h4>`;
    html += `<p style="text-align: center; margin-bottom: 15px;">${checkedCount}/4 readiness signs checked</p>`;
    
    if (!ready) {
        html += `<div style="background: white; padding: 15px; border-radius: 10px;">`;
        html += `<strong>Keep practicing:</strong><ul style="margin: 10px 0 0 0;">`;
        if (!checks[0]) html += `<li>Helping them recognize when they're dry</li>`;
        if (!checks[1]) html += `<li>Reading potty books together</li>`;
        if (!checks[2]) html += `<li>Practicing following directions</li>`;
        if (!checks[3]) html += `<li>Encouraging them to tell you when they need to go</li>`;
        html += `</ul></div>`;
    }
    html += `</div>`;
    
    const resultDiv = document.getElementById('readinessResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

let pottySuccess = parseInt(localStorage.getItem('mamacare_potty_success') || '0');
let pottyAccidents = parseInt(localStorage.getItem('mamacare_potty_accidents') || '0');

function logPottySuccess() {
    pottySuccess++;
    localStorage.setItem('mamacare_potty_success', pottySuccess);
    updatePottyStats();
    showNotification('Success logged! Great job!', 'success');
}

function logPottyAccident() {
    pottyAccidents++;
    localStorage.setItem('mamacare_potty_accidents', pottyAccidents);
    updatePottyStats();
    showNotification('Accident logged. Keep trying!', 'info');
}

function updatePottyStats() {
    const total = pottySuccess + pottyAccidents;
    const rate = total > 0 ? Math.round((pottySuccess / total) * 100) : 0;
    
    const rateEl = document.getElementById('successRate');
    const barEl = document.getElementById('progressBar');
    const successEl = document.getElementById('successCount');
    const accidentEl = document.getElementById('accidentCount');
    
    if (rateEl) rateEl.textContent = rate + '%';
    if (barEl) barEl.style.width = rate + '%';
    if (successEl) successEl.textContent = pottySuccess;
    if (accidentEl) accidentEl.textContent = pottyAccidents;
}

let stickers = parseInt(localStorage.getItem('mamacare_stickers') || '0');

function addSticker() {
    if (stickers < 10) {
        stickers++;
        localStorage.setItem('mamacare_stickers', stickers);
        updateStickerChart();
        if (stickers === 10) {
            showNotification('Reward earned! 10 stickers complete!', 'success');
        }
    }
}

function updateStickerChart() {
    const countEl = document.getElementById('stickerCount');
    const streakEl = document.getElementById('currentStreak');
    const gridEl = document.getElementById('stickerGrid');
    
    if (countEl) countEl.textContent = stickers;
    if (streakEl) streakEl.textContent = stickers;
    
    if (gridEl) {
        gridEl.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const div = document.createElement('div');
            div.style.cssText = 'width: 40px; height: 40px; border: 2px solid #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;';
            div.textContent = i < stickers ? '⭐' : '';
            gridEl.appendChild(div);
        }
    }
}

function showPottyTip(tipId) {
    const tips = {
        'timing': 'Perfect Timing:\n\nMost children are ready 18-30 months\nTraining takes 3-6 months on average\nSummer is often easier\nAvoid starting during major life changes',
        'method': 'Training Methods:\n\n3-Day Method: Intensive weekend, no diapers, frequent potty trips\n\nGradual Method: Start with mornings, slowly increase',
        'night': 'Night Training:\n\nWait until day training is solid\nUsually starts 6+ months later\nLimit liquids before bed\nBe patient - it takes time',
        'problems': 'Common Solutions:\n\nRegression: Stay calm, be consistent\nRefusal: Back off, try again later\nFear: Read books, let them watch you\nWithholding: Increase fiber, fluids'
    };
    showModal('Potty Training Tip', tips[tipId]);
}

// Behavior Functions
function logBehavior() {
    const date = document.getElementById('behaviorDate')?.value;
    const type = document.getElementById('behaviorType')?.value;
    const trigger = document.getElementById('behaviorTrigger')?.value;
    const notes = document.getElementById('behaviorNotes')?.value;
    
    if (!date || !type) {
        showNotification('Please enter date and behavior type', 'error');
        return;
    }
    
    const entry = { date, type, trigger, notes, id: Date.now() };
    const entries = JSON.parse(localStorage.getItem('mamacare_behavior_entries') || '[]');
    entries.unshift(entry);
    localStorage.setItem('mamacare_behavior_entries', JSON.stringify(entries));
    
    updateBehaviorDisplay();
    showNotification('Behavior logged successfully', 'success');
    
    if (document.getElementById('behaviorTrigger')) document.getElementById('behaviorTrigger').value = '';
    if (document.getElementById('behaviorNotes')) document.getElementById('behaviorNotes').value = '';
}

function updateBehaviorDisplay() {
    const entries = JSON.parse(localStorage.getItem('mamacare_behavior_entries') || '[]');
    const recent = entries.slice(0, 5);
    
    let positive = 0;
    let challenging = 0;
    const triggers = {};
    
    entries.forEach(e => {
        if (e.type === 'positive') positive++;
        else challenging++;
        if (e.trigger) triggers[e.trigger] = (triggers[e.trigger] || 0) + 1;
    });
    
    const posEl = document.getElementById('positiveCount');
    const chalEl = document.getElementById('challengingCount');
    if (posEl) posEl.textContent = positive;
    if (chalEl) chalEl.textContent = challenging;
    
    const listEl = document.getElementById('behaviorList');
    if (listEl) {
        if (recent.length === 0) {
            listEl.innerHTML = '<p style="color: #999; font-size: 14px;">No entries yet</p>';
        } else {
            listEl.innerHTML = recent.map(e => {
                const emoji = e.type === 'positive' ? '😊' : e.type === 'tantrum' ? '😢' : e.type === 'aggression' ? '👊' : '📝';
                return `<div style="padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${emoji} ${e.type}</span>
                        <span style="font-size: 12px; color: #999;">${e.date}</span>
                    </div>
                    ${e.trigger ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">Trigger: ${e.trigger}</div>` : ''}
                </div>`;
            }).join('');
        }
    }
    
    const triggerList = document.getElementById('commonTriggers');
    if (triggerList) {
        const sortedTriggers = Object.entries(triggers).sort((a, b) => b[1] - a[1]).slice(0, 3);
        if (sortedTriggers.length > 0) {
            triggerList.innerHTML = sortedTriggers.map(([t, c]) => `<li>${t} (${c}x)</li>`).join('');
        }
    }
}

function addStar() {
    const behavior = document.getElementById('goodBehavior')?.value;
    if (!behavior) {
        showNotification('Please describe the good behavior', 'error');
        return;
    }
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const starEl = document.getElementById(`star-${today}`);
    if (starEl && starEl.textContent === '○') {
        starEl.textContent = '⭐';
        const weeklyEl = document.getElementById('weeklyStars');
        if (weeklyEl) {
            const currentStars = parseInt(weeklyEl.textContent.replace('⭐ ', ''));
            weeklyEl.textContent = `⭐ ${currentStars + 1}`;
        }
        showNotification('Star added! Great job!', 'success');
        document.getElementById('goodBehavior').value = '';
    }
}

function showStrategy(strategy) {
    const strategies = {
        'tantrums': 'The CALM Method for Tantrums:\n\nC - Calm yourself first\nA - Acknowledge feelings\nL - Let them express\nM - Move on with connection\n\nTantrums are normal and will pass.',
        'defiance': 'Dealing with Defiance:\n\n1. Offer limited choices\n2. Use natural consequences\n3. Stay calm and consistent\n4. Pick your battles\n5. Connect before correcting',
        'positive': 'Effective Praise:\n\nBe specific ("You shared your toy!")\nPraise effort, not just results\nGive immediate feedback\nAvoid generic "good job"',
        'anxiety': 'Helping Anxious Toddlers:\n\n1. Validate their feelings\n2. Provide reassurance\n3. Create predictable routines\n4. Use comfort objects\n5. Gradual exposure to fears'
    };
    showModal('Expert Strategy', strategies[strategy]);
}

// Development Functions
function showMilestones() {
    const age = document.getElementById('devAgeSelect')?.value;
    if (!age) {
        showNotification('Please select an age', 'error');
        return;
    }
    
    const milestones = {
        '12': ['Walks with support', 'Says 1-2 words', 'Points to objects', 'Plays peek-a-boo'],
        '18': ['Walks independently', 'Says 5-10 words', 'Follows simple commands', 'Scribbles with crayon'],
        '24': ['Runs and climbs', 'Says 50+ words', 'Uses 2-word phrases', 'Sorts shapes/colors'],
        '30': ['Jumps with both feet', 'Speaks in sentences', 'Shows independence', 'Plays pretend'],
        '36': ['Pedals tricycle', 'Speaks clearly', 'Counts to 10', 'Draws circles']
    };
    
    const ageMilestones = milestones[age] || [];
    let html = `<div style="padding: 15px; background: #f0f9ff; border-radius: 10px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 10px;">Key Milestones:</h4>`;
    html += `<ul style="margin: 0; padding-left: 20px;">`;
    ageMilestones.forEach(m => {
        html += `<li style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 6px;">${m}</li>`;
    });
    html += `</ul>`;
    html += `<p style="margin-top: 15px; font-size: 12px; color: #666; font-style: italic;">Note: Every child develops at their own pace</p>`;
    html += `</div>`;
    
    const listEl = document.getElementById('milestoneList');
    if (listEl) listEl.innerHTML = html;
}

function assessSkills() {
    const skills = [
        document.getElementById('skillWalk')?.checked,
        document.getElementById('skillWords')?.checked,
        document.getElementById('skillFollow')?.checked,
        document.getElementById('skillScribble')?.checked,
        document.getElementById('skillPlay')?.checked
    ];
    
    const checked = skills.filter(s => s).length;
    const percent = Math.round((checked / 5) * 100);
    
    let message = '';
    if (percent >= 80) message = 'Excellent! Your child is showing strong development across all areas.';
    else if (percent >= 60) message = 'Good progress! Most skills are on track. Keep encouraging practice.';
    else if (percent >= 40) message = 'Progressing well. Some skills developing faster - this is normal!';
    else message = 'Early stages. Keep providing opportunities to practice and explore.';
    
    let html = `<div style="padding: 20px; background: #e8f5e9; border-radius: 15px;">`;
    html += `<div style="text-align: center; margin-bottom: 15px;">`;
    html += `<div style="font-size: 48px; font-weight: 700; color: #4caf50;">${percent}%</div>`;
    html += `<div style="color: #666;">Skills Demonstrated</div>`;
    html += `</div>`;
    html += `<p style="text-align: center; color: #333;">${message}</p>`;
    html += `</div>`;
    
    const resultDiv = document.getElementById('skillAssessmentResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function showActivity(type) {
    const activities = {
        'motor': 'Gross Motor Activities:\n\n• Obstacle courses\n• Dancing to music\n• Playing catch\n• Climbing at playground\n• Ride-on toys',
        'fine': 'Fine Motor Activities:\n\n• Playdough sculpting\n• Stringing beads\n• Stacking blocks\n• Simple puzzles\n• Finger painting',
        'language': 'Language Activities:\n\n• Reading together daily\n• Singing nursery rhymes\n• Naming objects\n• Simple storytelling\n• Repeating new words',
        'social': 'Social Skill Activities:\n\n• Parallel play dates\n• Turn-taking games\n• Pretend play\n• Sharing practice\n• Family meal conversations'
    };
    showModal('Activity Ideas', activities[type]);
}

// Playtime Functions
function findActivities() {
    const age = document.getElementById('playAge')?.value;
    if (!age) {
        showNotification('Please select age', 'error');
        return;
    }
    
    const activityDB = {
        '12': ['Sensory bins', 'Stacking cups', 'Soft ball play', 'Musical toys'],
        '18': ['Shape sorters', 'Push toys', 'Finger painting', 'Bubble popping'],
        '24': ['Pretend play', 'Simple puzzles', 'Outdoor play', 'Dancing'],
        '36': ['Arts & crafts', 'Bike riding', 'Board games', 'Sports']
    };
    
    let activities = activityDB[age] || [];
    
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px; margin-top: 20px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Recommended Activities:</h4>`;
    html += `<div style="display: grid; gap: 10px;">`;
    activities.forEach(act => {
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #f093fb;">${act}</div>`;
    });
    html += `</div></div>`;
    
    const resultDiv = document.getElementById('activityResults');
    if (resultDiv) resultDiv.innerHTML = html;
}

function generatePlaySchedule() {
    showModal('Custom Play Schedule', 
        'Morning (9-11 AM): Active outdoor play\n' +
        'Midday (11 AM-1 PM): Creative indoor activities\n' +
        'Afternoon (3-5 PM): Quiet play / Reading\n' +
        'Evening (5-7 PM): Family games & wind down');
}

let screenTimeMinutes = parseInt(localStorage.getItem('mamacare_screen_time') || '0');

function addScreenTime(minutes) {
    screenTimeMinutes += minutes;
    localStorage.setItem('mamacare_screen_time', screenTimeMinutes);
    updateScreenTimeDisplay();
}

function updateScreenTimeDisplay() {
    const todayEl = document.getElementById('screenTimeToday');
    const barEl = document.getElementById('screenTimeBar');
    
    if (todayEl) todayEl.textContent = screenTimeMinutes + ' min';
    if (barEl) {
        const percent = Math.min((screenTimeMinutes / 60) * 100, 100);
        barEl.style.width = percent + '%';
        if (screenTimeMinutes > 60) {
            barEl.style.background = 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)';
        }
    }
    
    if (screenTimeMinutes > 60) {
        showNotification('Daily screen time limit reached', 'warning');
    }
}

function showToys(category) {
    const toyDB = {
        'motor': 'Motor Skills: Balls, ride-ons, climbing structures, push toys',
        'cognitive': 'Cognitive: Puzzles, shape sorters, building blocks, memory games',
        'creative': 'Creative: Art supplies, playdough, musical instruments, dress-up clothes',
        'social': 'Social: Dolls, action figures, play kitchen, doctor kit, board games'
    };
    
    const recDiv = document.getElementById('toyRecommendations');
    if (recDiv) {
        recDiv.textContent = toyDB[category];
        recDiv.style.display = 'block';
    }
}

// Modal Utility Function
function showModal(title, content) {
    const existing = document.querySelector('.toddler-modal-overlay');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.className = 'toddler-modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(5px); padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 20px 20px 0 0;">
                <h3 style="margin: 0; font-size: 20px;">${title}</h3>
            </div>
            <div style="padding: 25px;">
                <p style="margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-line;">${content}</p>
            </div>
            <div style="padding: 0 25px 25px; text-align: center;">
                <button onclick="this.closest('.toddler-modal-overlay').remove()" style="padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Sleep Guide Sub-Page Functions
function buildBedtimeRoutine() {
    const bedtime = document.getElementById('targetBedtime')?.value;
    const duration = document.getElementById('routineDuration')?.value;
    
    if (!bedtime || !duration) {
        showNotification('Please select bedtime and duration', 'error');
        return;
    }
    
    const [hours, minutes] = bedtime.split(':').map(Number);
    let startTime = new Date();
    startTime.setHours(hours, minutes, 0);
    startTime.setMinutes(startTime.getMinutes() - parseInt(duration));
    
    const routineSteps = [
        { time: duration * 0.8, activity: 'Quiet play time', icon: 'play' },
        { time: duration * 0.6, activity: 'Bath time', icon: 'bath' },
        { time: duration * 0.4, activity: 'Pajamas & diaper', icon: 'clothes' },
        { time: duration * 0.2, activity: 'Brush teeth', icon: 'tooth' },
        { time: duration * 0.1, activity: 'Read stories', icon: 'book' },
        { time: 0, activity: 'Lights out, goodnight', icon: 'sleep' }
    ];
    
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px; margin-top: 20px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Your Bedtime Routine:</h4>`;
    html += `<div style="display: grid; gap: 10px;">`;
    
    routineSteps.forEach(step => {
        const stepTime = new Date(startTime.getTime() + step.time * 60 * 1000);
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">`;
        html += `<strong>${formatTime12Hour(stepTime)}</strong> - ${step.activity} ${step.icon}</div>`;
    });
    
    html += `</div></div>`;
    
    const resultDiv = document.getElementById('routineResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function checkSleepEnvironment() {
    const checks = [
        document.getElementById('darkCurtains')?.checked,
        document.getElementById('whiteNoise')?.checked,
        document.getElementById('comfortableTemp')?.checked,
        document.getElementById('safeCrib')?.checked,
        document.getElementById('comfortObject')?.checked
    ];
    
    const checkedCount = checks.filter(c => c).length;
    const score = Math.round((checkedCount / 5) * 100);
    
    let message = '';
    let color = '#4caf50';
    
    if (score >= 80) {
        message = 'Excellent sleep environment! Your toddler has the perfect setup for restful sleep.';
    } else if (score >= 60) {
        message = 'Good sleep environment! A few more improvements could make it even better.';
        color = '#ff9800';
    } else if (score >= 40) {
        message = 'Fair sleep environment. Consider making some improvements for better sleep quality.';
        color = '#ff5722';
    } else {
        message = 'Sleep environment needs significant improvements for optimal sleep.';
        color = '#f44336';
    }
    
    let html = `<div style="padding: 20px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 15px; margin-top: 20px;">`;
    html += `<div style="text-align: center; margin-bottom: 15px;">`;
    html += `<div style="font-size: 48px; font-weight: 700; color: ${color};">${score}%</div>`;
    html += `<div style="color: #666;">Sleep Environment Score</div>`;
    html += `</div>`;
    html += `<p style="text-align: center; color: #333;">${message}</p>`;
    html += `</div>`;
    
    const resultDiv = document.getElementById('environmentResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function showSleepSolution(type) {
    const solutions = {
        'refusal': 'Bedtime Refusal Solutions:\n\n1. Create a predictable routine\n2. Offer limited choices ("pajamas first or teeth first?")\n3. Use a visual schedule\n4. Stay calm and consistent\n5. Check if bedtime is too early/late',
        'gettingup': 'Getting Out of Bed Solutions:\n\n1. Silent return to bed\n2. Reward system for staying in bed\n3. Check for physical needs (toilet, water)\n4. Use a bedtime pass system\n5. Be boring - no attention for getting up',
        'fears': 'Night Fears Solutions:\n\n1. Validate their feelings\n2. Use monster spray (water in spray bottle)\n3. Night light or comfort object\n4. Check room together\n5. Teach coping skills (deep breathing)',
        'transition': 'Transition Solutions:\n\n1. Gradual transition (start with naps)\n2. Involve child in choosing new bed\n3. Keep same bedtime routine\n4. Positive reinforcement\n5. Be patient - takes 2-3 weeks'
    };
    
    showModal('Sleep Solution', solutions[type]);
}

function showSleepTipDetail(tipType) {
    const tips = {
        'bedtime-routine': 'The Perfect Bedtime Routine:\n\n1. Wind-down time (30 min before bed)\n2. Consistent sequence every night\n3. Calm activities (reading, gentle music)\n4. Dim lights and quiet environment\n5. Same bedtime every night\n\nTips:\n- Start routine early enough\n- Avoid screens 1 hour before bed\n- Keep it simple and predictable\n- Be consistent even on weekends',
        'sleep-environment': 'Optimizing Sleep Environment:\n\nTemperature: 68-72°F (20-22°C)\nLight: Complete darkness (blackout curtains)\nSound: White noise or complete quiet\nComfort: Firm mattress, appropriate bedding\nSafety: No loose items in crib\n\nTips:\n- Use room thermometer\n- Cover electronics with LED lights\n- Consider white noise machine\n- Check for safety hazards',
        'nap-transitions': 'Nap Transition Guide:\n\n12-18 months: 2 naps to 1 nap\n- Signs ready: Refusing morning nap, long afternoon nap\n- Process: Gradual transition over 2-3 weeks\n- Timing: Move afternoon nap earlier\n\n18-36 months: 1 nap to no naps\n- Signs ready: Fighting nap, playing during quiet time\n- Process: Replace with quiet time\n- Timing: Earlier bedtime temporarily\n\nTips:\n- Watch for sleep cues\n- Be patient with transitions\n- Adjust bedtime as needed',
        'sleep-regression': 'Handling Sleep Regressions:\n\n18-month regression:\n- Cause: Language development, independence\n- Duration: 2-6 weeks\n- Strategy: Consistent routine, comfort\n\n2-year regression:\n- Cause: Cognitive development, fears\n- Duration: 2-4 weeks\n- Strategy: Reassurance, boundaries\n\nTips:\n- Stick to routine\n- Offer extra comfort\n- Don\'t create new habits\n- Temporary phase - will pass'
    };
    
    const resultDiv = document.getElementById('sleepTipsContainer');
    if (resultDiv) {
        const existingDetail = document.getElementById('tipDetail');
        if (existingDetail) {
            existingDetail.remove();
        }
        
        const detailDiv = document.createElement('div');
        detailDiv.id = 'tipDetail';
        detailDiv.style.cssText = 'padding: 20px; background: #e3f2fd; border-radius: 15px; margin-top: 20px; border-left: 4px solid #2196f3;';
        detailDiv.innerHTML = `<pre style="white-space: pre-line; font-family: inherit; color: #1565c0; margin: 0;">${tips[tipType]}</pre>`;
        
        resultDiv.appendChild(detailDiv);
        detailDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

function getSleepSolution() {
    const problem = document.getElementById('sleepProblemSelect')?.value;
    
    if (!problem) {
        showNotification('Please select a sleep problem', 'error');
        return;
    }
    
    const solutions = {
        'night-waking': 'Frequent Night Waking Solutions:\n\n1. Check for hunger/thirst\n2. Ensure comfortable sleep environment\n3. Consistent bedtime routine\n4. Consider sleep training methods\n5. Check for developmental milestones',
        'early-waking': 'Early Morning Waking Solutions:\n\n1. Blackout curtains\n2. White noise machine\n3. Later bedtime\n4. Check room temperature\n5. Teach child to stay in bed',
        'bedtime-resistance': 'Bedtime Resistance Solutions:\n\n1. Predictable routine\n2. Limited choices\n3. Visual schedule\n4. Stay calm and consistent\n5. Check bedtime timing',
        'nap-issues': 'Nap Problems Solutions:\n\n1. Consistent nap schedule\n2. Proper wake windows\n3. Dark, quiet room\n4. Comfortable temperature\n5. Age-appropriate nap length',
        'nightmares': 'Nightmares/Night Terrors Solutions:\n\n1. Comfort and reassurance\n2. Night light\n3. Comfort object\n4. Discuss scary themes\n5. Consistent response',
        'snoring': 'Snoring/Sleep Apnea Solutions:\n\n1. Consult pediatrician\n2. Check for allergies\n3. Proper sleep position\n4. Room humidifier\n5. Medical evaluation if severe'
    };
    
    const resultDiv = document.getElementById('sleepSolutionResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="padding: 20px; background: #ffebee; border-radius: 15px; margin-top: 20px;"><pre style="white-space: pre-line; font-family: inherit; color: #c62828;">${solutions[problem]}</pre></div>`;
        resultDiv.style.display = 'block';
    }
}

function generateNapSchedule() {
    const age = document.getElementById('sleepAgeSelect')?.value;
    const wakeTime = document.getElementById('wakeTime')?.value;
    
    if (!age || !wakeTime) {
        showNotification('Please select age and wake time', 'error');
        return;
    }
    
    const [hours, minutes] = wakeTime.split(':').map(Number);
    let wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0);
    
    // Comprehensive nap schedules with wake windows and optimal timing
    const napSchedules = {
        '12': { 
            naps: 2, 
            totalSleep: 14.5,
            wakeWindow1: 3.5, nap1Duration: 2, wakeWindow2: 3, nap2Duration: 1.5,
            bedtime: 19.5, bedtimeWindow: 4.5,
            description: "12 months - 2 naps, transitioning to longer wake windows"
        },
        '15': { 
            naps: 2, 
            totalSleep: 14,
            wakeWindow1: 4, nap1Duration: 2, wakeWindow2: 3.5, nap2Duration: 1.5,
            bedtime: 19.5, bedtimeWindow: 4,
            description: "15 months - 2 naps, longer wake windows developing"
        },
        '18': { 
            naps: 2, 
            totalSleep: 13.5,
            wakeWindow1: 5, nap1Duration: 2, wakeWindow2: 4, nap2Duration: 1.5,
            bedtime: 20, bedtimeWindow: 4,
            description: "18 months - 2 naps, preparing for transition to 1 nap"
        },
        '24': { 
            naps: 1, 
            totalSleep: 13,
            wakeWindow: 6, napDuration: 2.5,
            bedtime: 20, bedtimeWindow: 5.5,
            description: "2 years - 1 nap, consolidated sleep schedule"
        },
        '30': { 
            naps: 1, 
            totalSleep: 12.5,
            wakeWindow: 6.5, napDuration: 2,
            bedtime: 20.5, bedtimeWindow: 6,
            description: "2.5 years - 1 nap, shorter nap, longer wake window"
        },
        '36': { 
            naps: 1, 
            totalSleep: 12,
            wakeWindow: 7, napDuration: 1.5,
            bedtime: 21, bedtimeWindow: 6.5,
            description: "3 years - 1 nap, may be ready to drop nap soon"
        }
    };
    
    const schedule = napSchedules[age];
    const ageInYears = parseInt(age) / 12;
    
    // Calculate nap times
    let napTimes = [];
    if (schedule.naps === 2) {
        let nap1Start = new Date(wakeDate.getTime() + schedule.wakeWindow1 * 60 * 60 * 1000);
        let nap1End = new Date(nap1Start.getTime() + schedule.nap1Duration * 60 * 60 * 1000);
        let nap2Start = new Date(nap1End.getTime() + schedule.wakeWindow2 * 60 * 60 * 1000);
        let nap2End = new Date(nap2Start.getTime() + schedule.nap2Duration * 60 * 60 * 1000);
        
        napTimes = [
            { type: 'Morning Nap', start: nap1Start, end: nap1End, duration: schedule.nap1Duration },
            { type: 'Afternoon Nap', start: nap2Start, end: nap2End, duration: schedule.nap2Duration }
        ];
    } else {
        let napStart = new Date(wakeDate.getTime() + schedule.wakeWindow * 60 * 60 * 1000);
        let napEnd = new Date(napStart.getTime() + schedule.napDuration * 60 * 60 * 1000);
        
        napTimes = [
            { type: 'Nap Time', start: napStart, end: napEnd, duration: schedule.napDuration }
        ];
    }
    
    // Calculate bedtime
    const lastNapEnd = napTimes[napTimes.length - 1].end;
    let bedtime = new Date(lastNapEnd.getTime() + schedule.bedtimeWindow * 60 * 60 * 1000);
    
    // Generate comprehensive HTML
    let html = `<div style="padding: 25px; background: linear-gradient(135deg, #f0f9ff 0%, #e3f2fd 100%); border-radius: 20px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">`;
    
    // Header with age and summary
    html += `<div style="text-align: center; margin-bottom: 25px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 8px; font-size: 22px;">Perfect Nap Schedule for ${ageInYears} Year Old</h4>`;
    html += `<p style="color: #666; margin: 0; font-size: 14px;">${schedule.description}</p>`;
    html += `</div>`;
    
    // Daily Schedule Timeline
    html += `<div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">`;
    html += `<h5 style="color: #333; margin-bottom: 15px; font-size: 18px;">Daily Schedule</h5>`;
    html += `<div style="display: grid; gap: 12px;">`;
    
    // Wake up
    html += `<div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 10px; border-left: 4px solid #4caf50;">`;
    html += `<div style="width: 40px; height: 40px; background: #4caf50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px;">Wake</div>`;
    html += `<div style="flex: 1;"><strong style="color: #2e7d32; font-size: 16px;">Wake Up Time</strong><div style="color: #666; font-size: 14px;">${formatTime12Hour(wakeTime)}</div></div>`;
    html += `</div>`;
    
    // Naps
    napTimes.forEach((nap, index) => {
        const colors = ['#ff9800', '#9c27b0'];
        const color = colors[index % colors.length];
        html += `<div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 10px; border-left: 4px solid ${color};">`;
        html += `<div style="width: 40px; height: 40px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px;">Nap${index + 1}</div>`;
        html += `<div style="flex: 1;"><strong style="color: #e65100; font-size: 16px;">${nap.type}</strong><div style="color: #666; font-size: 14px;">${formatTime12Hour(nap.start)} - ${formatTime12Hour(nap.end)} (${nap.duration} hours)</div></div>`;
        html += `</div>`;
    });
    
    // Bedtime
    html += `<div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 10px; border-left: 4px solid #2196f3;">`;
    html += `<div style="width: 40px; height: 40px; background: #2196f3; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px;">Sleep</div>`;
    html += `<div style="flex: 1;"><strong style="color: #1565c0; font-size: 16px;">Bedtime</strong><div style="color: #666; font-size: 14px;">${formatTime12Hour(bedtime)}</div></div>`;
    html += `</div>`;
    
    html += `</div></div>`;
    
    // Sleep Summary
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">`;
    html += `<div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #e3f2fd;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #1565c0;">${schedule.totalSleep} hrs</div>`;
    html += `<div style="font-size: 12px; color: #666;">Total Sleep</div>`;
    html += `</div>`;
    html += `<div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fff3e0;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #ff9800;">${schedule.naps}</div>`;
    html += `<div style="font-size: 12px; color: #666;">Naps Per Day</div>`;
    html += `</div>`;
    html += `<div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #e8f5e9;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #4caf50;">${schedule.naps === 2 ? (schedule.wakeWindow1 + 'h') : (schedule.wakeWindow + 'h')}</div>`;
    html += `<div style="font-size: 12px; color: #666;">Wake Window</div>`;
    html += `</div>`;
    html += `</div>`;
    
    // Expert Tips
    html += `<div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); border-radius: 15px; padding: 20px; border-left: 4px solid #ffc107;">`;
    html += `<h5 style="color: #f57c00; margin-bottom: 12px; font-size: 16px;">Expert Tips for Success</h5>`;
    html += `<ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.6;">`;
    html += `<li>Consistency is key - stick to the same schedule daily</li>`;
    html += `<li>Watch for sleep cues - yawning, rubbing eyes, crankiness</li>`;
    html += `<li>Create a calm nap environment - dark, quiet, cool room</li>`;
    html += `<li>Allow 15-30 minutes wind-down time before naps</li>`;
    html += `<li>Don't skip naps - overtired children sleep worse</li>`;
    html += `</ul>`;
    html += `</div>`;
    
    html += `</div>`;
    
    const resultDiv = document.getElementById('napScheduleResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function showNapTransitionGuide() {
    const guide = `Nap Transition Guide:\n\n2 to 1 Nap (14-18 months):\n- Watch for signs: resisting morning nap, longer afternoon nap\n- Push morning nap later gradually\n- Keep one consistent nap time\n- Expect crankiness during transition\n- Process takes 2-6 weeks\n\n1 to 0 Nap (3-5 years):\n- Signs: no nap for 2+ weeks, still energetic\n- Replace with quiet time\n- Earlier bedtime if needed\n- Some children need naps longer than others\n- Don't force dropping the nap`;
    
    showModal('Nap Transition Guide', guide);
}

function solveNapProblem() {
    const problem = document.getElementById('napProblem')?.value;
    if (!problem) {
        showNotification('Please select a nap problem', 'error');
        return;
    }
    
    const solutions = {
        'short': 'Short Naps Solutions:\n\n1. Extend wake time before nap\n2. Darken room completely\n3. White noise machine\n4. Check for discomfort/hunger\n5. Try later nap time',
        'refuse': 'Nap Refusal Solutions:\n\n1. Check if overtired\n2. Consistent nap routine\n3. Quiet time instead of sleep\n4. Earlier bedtime to compensate\n5. Don\'t force - try again tomorrow',
        'early': 'Early Waking Solutions:\n\n1. Check room temperature/light\n2. Later bedtime\n3. More active morning\n4. White noise for early sounds\n5. Teach to stay in bed quietly',
        'skip': 'Skipping Naps Solutions:\n\n1. Check developmental milestones\n2. May be ready to drop nap\n3. Ensure enough overnight sleep\n4. Quiet time instead\n5. Earlier bedtime temporarily',
        'late': 'Late Naps Solutions:\n\n1. Move nap earlier gradually\n2. Shorten nap if needed\n3. Earlier bedtime\n4. Check wake windows\n5. May need schedule adjustment'
    };
    
    const resultDiv = document.getElementById('napSolutionResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="padding: 20px; background: #e8f5e9; border-radius: 15px; margin-top: 20px;"><pre style="white-space: pre-line; font-family: inherit;">${solutions[problem]}</pre></div>`;
        resultDiv.style.display = 'block';
    }
}

function identifySleepProblem() {
    const symptoms = document.querySelectorAll('input[name="sleepSymptom"]:checked');
    if (symptoms.length === 0) {
        showNotification('Please select at least one symptom', 'error');
        return;
    }
    
    const symptomList = Array.from(symptoms).map(s => s.value);
    let diagnosis = '';
    
    if (symptomList.includes('regression') && symptomList.includes('nightwaking')) {
        diagnosis = 'Likely Sleep Regression: Common around 4, 8, 12, 18 months. Usually lasts 2-6 weeks.';
    } else if (symptomList.includes('resisting') && symptomList.includes('fears')) {
        diagnosis = 'Anxiety-Based Sleep Issues: Night fears and separation anxiety are common.';
    } else if (symptomList.includes('early') && symptomList.includes('nightwaking')) {
        diagnosis = 'Schedule Misalignment: Bedtime may be too early/late or wake windows off.';
    } else {
        diagnosis = 'Multiple Sleep Challenges: Combination of factors affecting sleep.';
    }
    
    const resultDiv = document.getElementById('problemDiagnosis');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="padding: 20px; background: #fff3e0; border-radius: 15px; margin-top: 20px;"><h4 style="color: #ef6c00;">Diagnosis:</h4><p>${diagnosis}</p></div>`;
        resultDiv.style.display = 'block';
    }
}

function generateSleepSolution() {
    const age = document.getElementById('solutionAge')?.value;
    const issue = document.getElementById('mainIssue')?.value;
    const goal = document.getElementById('parentGoal')?.value;
    
    if (!age || !issue || !goal) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const solutions = {
        'nightwaking': {
            'independent': 'Gradual withdrawal method: Check less frequently, offer comfort but remove from bed',
            'consolidated': 'Dream feed before parent bedtime, ensure adequate calories during day',
            'routine': 'Consistent response plan, check every 10-15 minutes initially',
            'peaceful': 'Quick, boring responses, return to bed immediately'
        },
        'bedtime': {
            'independent': 'Bedtime pass system, reward for staying in bed',
            'consolidated': 'Later bedtime if needed, ensure tired enough',
            'routine': 'Visual schedule, consistent routine every night',
            'peaceful': 'Calm, predictable routine, no screens before bed'
        }
    };
    
    const solution = solutions[issue]?.[goal] || 'Custom solution based on your specific needs and goals.';
    
    const resultDiv = document.getElementById('customSolution');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="padding: 20px; background: #e3f2fd; border-radius: 15px; margin-top: 20px;"><h4 style="color: #1565c0;">Your Solution:</h4><p>${solution}</p></div>`;
        resultDiv.style.display = 'block';
    }
}

function trackSleepPattern() {
    const sleepTime = document.getElementById('sleepTime')?.value;
    const wakeTime = document.getElementById('wakeTime')?.value;
    const quality = document.getElementById('sleepQuality')?.value;
    
    if (!sleepTime || !wakeTime || !quality) {
        showNotification('Please fill all sleep tracking fields', 'error');
        return;
    }
    
    // Calculate sleep duration
    const [sleepHours, sleepMinutes] = sleepTime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number);
    
    let sleepDate = new Date();
    sleepDate.setHours(sleepHours, sleepMinutes, 0);
    let wakeDate = new Date();
    wakeDate.setHours(wakeHours, wakeMinutes, 0);
    
    if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
    }
    
    const duration = (wakeDate - sleepDate) / (1000 * 60 * 60);
    
    // Store in localStorage
    const entries = JSON.parse(localStorage.getItem('mamacare_sleep_pattern') || '[]');
    entries.push({
        date: new Date().toLocaleDateString(),
        sleepTime,
        wakeTime,
        duration: duration.toFixed(1),
        quality,
        timestamp: Date.now()
    });
    localStorage.setItem('mamacare_sleep_pattern', JSON.stringify(entries));
    
    // Show stats
    updateSleepStats();
    showNotification('Sleep pattern tracked successfully!', 'success');
    
    // Clear form
    document.getElementById('sleepTime').value = '';
    document.getElementById('wakeTime').value = '';
    document.getElementById('sleepQuality').value = '';
}

function updateSleepStats() {
    const entries = JSON.parse(localStorage.getItem('mamacare_sleep_pattern') || '[]');
    const last7 = entries.slice(-7);
    
    if (last7.length > 0) {
        const avgDuration = (last7.reduce((sum, e) => sum + parseFloat(e.duration), 0) / last7.length).toFixed(1);
        const qualityCount = last7.reduce((acc, e) => {
            acc[e.quality] = (acc[e.quality] || 0) + 1;
            return acc;
        }, {});
        
        let html = `<div style="padding: 20px; background: #f8f9fa; border-radius: 15px; margin-top: 20px;">`;
        html += `<h4 style="margin-bottom: 15px;">Last 7 Days Sleep Stats</h4>`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
        html += `<div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">`;
        html += `<div style="font-size: 24px; font-weight: 700; color: #667eea;">${avgDuration}h</div>`;
        html += `<div style="font-size: 12px; color: #666;">Avg Duration</div></div>`;
        html += `<div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">`;
        html += `<div style="font-size: 24px; font-weight: 700; color: #4caf50;">${last7.length}</div>`;
        html += `<div style="font-size: 12px; color: #666;">Nights Tracked</div></div>`;
        html += `</div>`;
        html += `<div style="margin-top: 15px; padding: 15px; background: white; border-radius: 10px;">`;
        html += `<strong>Sleep Quality Breakdown:</strong><ul style="margin: 10px 0 0 0;">`;
        Object.entries(qualityCount).forEach(([quality, count]) => {
            html += `<li>${quality}: ${count} nights</li>`;
        });
        html += `</ul></div></div>`;
        
        const statsDiv = document.getElementById('sleepStats');
        if (statsDiv) {
            statsDiv.innerHTML = html;
            statsDiv.style.display = 'block';
        }
    }
}

function showProfessionalHelp() {
    const helpInfo = `When to Seek Professional Help:\n\nIMMEDIATELY if:\n- Breathing stops during sleep\n- Loud snoring with pauses\n- Difficulty breathing\n\nWITHIN 1 WEEK if:\n- No improvement with consistent routine\n- Extreme difficulty falling/staying asleep\n- Sleep affecting daytime behavior\n\nCONSULT PEDIATRICIAN for:\n- Sleep study referral\n- Medical evaluation\n- Sleep specialist recommendation\n\nRESOURCES:\n- American Academy of Pediatrics\n- Sleep specialists\n- Pediatric sleep clinics`;
    
    showModal('Professional Sleep Help', helpInfo);
}

// Toddler Topic Modal Functions
function openToddlerModal(topic) {
    const modalContent = getToddlerModalContent(topic);
    
    const modal = document.createElement('div');
    modal.id = 'toddlerTopicModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 90vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 20px 20px 0 0; position: relative;">
                <button onclick="closeToddlerModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                    ${modalContent.icon} ${modalContent.title}
                </h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">${modalContent.subtitle}</p>
            </div>
            
            <div style="padding: 25px;">
                ${modalContent.body}
            </div>
            
            <div style="padding: 0 25px 25px 25px; text-align: center; border-top: 1px solid #f0f0f0;">
                <button onclick="closeToddlerModal()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeToddlerModal();
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeToddlerModal();
    });
}

function closeToddlerModal() {
    const modal = document.getElementById('toddlerTopicModal');
    if (modal) modal.remove();
}

function getToddlerModalContent(topic) {
    const contents = {
        'sleep-getting': {
            icon: 'sleepy',
            title: 'Getting Your Toddler to Sleep',
            subtitle: 'Expert strategies for peaceful bedtime routines',
            body: `
                <div style="display: grid; gap: 20px;">
                    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                        <h4 style="margin: 0 0 15px 0; color: #333;">Bedtime Routine Builder</h4>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Target Bedtime</label>
                            <input type="time" id="modalTargetBedtime" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Routine Duration (minutes)</label>
                            <input type="range" id="modalRoutineDuration" min="15" max="60" value="30" style="width: 100%;">
                            <div style="text-align: center; margin-top: 5px; color: #666;"><span id="modalDurationValue">30</span> minutes</div>
                        </div>
                        <button onclick="buildBedtimeRoutineModal()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">Generate Routine</button>
                        <div id="modalRoutineResult" style="margin-top: 20px; display: none;"></div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                        <h4 style="margin: 0 0 15px 0; color: #333;">Sleep Environment Checklist</h4>
                        <div style="display: grid; gap: 12px;">
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                                <input type="checkbox" id="modalDarkCurtains" style="width: 20px; height: 20px;">
                                <span>Blackout curtains installed</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                                <input type="checkbox" id="modalWhiteNoise" style="width: 20px; height: 20px;">
                                <span>White noise machine</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                                <input type="checkbox" id="modalComfortableTemp" style="width: 20px; height: 20px;">
                                <span>Room temperature 68-72°F</span>
                            </label>
                        </div>
                        <button onclick="checkSleepEnvironmentModal()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 15px;">Check Environment</button>
                        <div id="modalEnvironmentResult" style="margin-top: 20px; display: none;"></div>
                    </div>
                </div>
            `
        },
        'sleep-naps': {
            icon: 'cloud',
            title: 'Toddler Naps',
            subtitle: 'Master the art of successful napping',
            body: `
                <div style="display: grid; gap: 20px;">
                    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                        <h4 style="margin: 0 0 15px 0; color: #333;">Nap Schedule Generator</h4>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Child's Age</label>
                            <select id="modalNapAge" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
                                <option value="">Select age</option>
                                <option value="12">12 months</option>
                                <option value="18">18 months</option>
                                <option value="24">24 months</option>
                                <option value="30">30 months</option>
                                <option value="36">36 months</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Wake Time</label>
                            <input type="time" id="modalWakeTime" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
                        </div>
                        <button onclick="generateNapScheduleModal()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">Generate Schedule</button>
                        <div id="modalNapScheduleResult" style="margin-top: 20px; display: none;"></div>
                    </div>
                </div>
            `
        },
        'sleep-problems': {
            icon: 'concern',
            title: 'Sleep Problems & Concerns',
            subtitle: 'Expert solutions for sleep challenges',
            body: `
                <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Common Sleep Problems</h4>
                    <div style="display: grid; gap: 12px;">
                        <div onclick="showSleepSolutionModal('refusal')" style="padding: 15px; background: #ffebee; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                            <strong style="color: #c62828;">Bedtime Refusal</strong>
                            <div style="font-size: 12px; color: #666;">"I'm not sleepy!" tactics</div>
                        </div>
                        <div onclick="showSleepSolutionModal('gettingup')" style="padding: 15px; background: #fff3e0; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                            <strong style="color: #ef6c00;">Getting Out of Bed</strong>
                            <div style="font-size: 12px; color: #666;">Multiple trips to parents' room</div>
                        </div>
                        <div onclick="showSleepSolutionModal('fears')" style="padding: 15px; background: #e8f5e9; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                            <strong style="color: #2e7d32;">Night Fears</strong>
                            <div style="font-size: 12px; color: #666;">Monsters, dark, separation anxiety</div>
                        </div>
                    </div>
                </div>
            `
        }
    };
    
    // Add all modal content
    contents['potty-basics'] = {
        icon: 'toilet',
        title: 'Potty Training Basics',
        subtitle: 'Essential guide to successful potty training',
        body: `
            <div style="display: grid; gap: 20px;">
                <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Ready Signs Checklist</h4>
                    <div style="display: grid; gap: 12px;">
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                            <input type="checkbox" style="width: 20px; height: 20px;">
                            <span>Stays dry for 2+ hours</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                            <input type="checkbox" style="width: 20px; height: 20px;">
                            <span>Shows interest in toilet</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                            <input type="checkbox" style="width: 20px; height: 20px;">
                            <span>Can follow simple instructions</span>
                        </label>
                    </div>
                </div>
            </div>
        `
    };
    
    contents['potty-tips'] = {
        icon: 'star',
        title: 'Potty Training Tips',
        subtitle: 'Expert tips for successful training',
        body: `
            <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                <h4 style="margin: 0 0 15px 0; color: #333;">Top Training Tips</h4>
                <div style="display: grid; gap: 12px;">
                    <div style="padding: 15px; background: #e3f2fd; border-radius: 10px;">
                        <strong style="color: #1565c0;">🕐 Timing is Everything</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">Start when child shows ready signs, not based on age</p>
                    </div>
                    <div style="padding: 15px; background: #e8f5e9; border-radius: 10px;">
                        <strong style="color: #2e7d32;">🎯 Positive Reinforcement</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">Celebrate successes with praise and small rewards</p>
                    </div>
                    <div style="padding: 15px; background: #fff3e0; border-radius: 10px;">
                        <strong style="color: #ef6c00;">🧻 Patience is Key</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">Accidents happen - stay calm and encouraging</p>
                    </div>
                </div>
            </div>
        `
    };
    
    contents['behavior-anxiety'] = {
        icon: 'heart',
        title: 'Anxiety & Fears',
        subtitle: 'Helping your toddler cope with anxiety',
        body: `
            <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                <h4 style="margin: 0 0 15px 0; color: #333;">Common Toddler Fears</h4>
                <div style="display: grid; gap: 12px;">
                    <div style="padding: 15px; background: #ffebee; border-radius: 10px;">
                        <strong style="color: #c62828;">👻 Fear of Monsters/Dark</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">Use monster spray, night lights, and comfort objects</p>
                    </div>
                    <div style="padding: 15px; background: #fff3e0; border-radius: 10px;">
                        <strong style="color: #ef6c00;">🚗 Separation Anxiety</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">Practice short separations, create goodbye routines</p>
                    </div>
                </div>
            </div>
        `
    };
    
    contents['feeding-healthy'] = {
        icon: 'apple',
        title: 'Healthy Eating',
        subtitle: 'Nutrition guide for toddlers',
        body: `
            <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; border: 1px solid #e0e0e0;">
                <h4 style="margin: 0 0 15px 0; color: #333;">Daily Food Groups</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="padding: 15px; background: #e8f5e9; border-radius: 10px; text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🥕</div>
                        <strong style="color: #2e7d32;">Vegetables</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">2-3 servings daily</p>
                    </div>
                    <div style="padding: 15px; background: #fff3e0; border-radius: 10px; text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🍎</div>
                        <strong style="color: #ef6c00;">Fruits</strong>
                        <p style="margin: 8px 0 0 0; color: #666;">1-2 servings daily</p>
                    </div>
                </div>
            </div>
        `
    };
    
    return contents[topic] || {
        icon: 'help',
        title: 'Toddler Topic',
        subtitle: 'Loading content...',
        body: '<p>Content loading...</p>'
    };
}

// Potty Training Functions
function assessPottyReadiness() {
    const checkboxes = document.querySelectorAll('.readiness-check');
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    const percentage = Math.round((checked / total) * 100);
    
    let message = '';
    let color = '';
    
    if (percentage >= 75) {
        message = '🎉 Your child shows strong signs of readiness! Start potty training soon.';
        color = '#4caf50';
    } else if (percentage >= 50) {
        message = '👍 Your child is showing some readiness signs. Consider starting soon.';
        color = '#ff9800';
    } else {
        message = '⏰ Your child may need more time. Continue watching for readiness signs.';
        color = '#f44336';
    }
    
    const resultDiv = document.getElementById('readinessResult');
    resultDiv.innerHTML = `
        <div style="padding: 20px; background: ${color}20; border-radius: 12px; border-left: 4px solid ${color};">
            <div style="font-size: 18px; font-weight: 600; color: ${color}; margin-bottom: 10px;">
                Readiness Score: ${percentage}%
            </div>
            <div style="color: #333; line-height: 1.5;">
                ${message}
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <strong>Next Steps:</strong>
                <ul style="margin: 10px 0 0 20px; color: #666;">
                    <li>Get a child-sized potty</li>
                    <li>Stock up on training pants</li>
                    <li>Prepare fun rewards system</li>
                </ul>
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';
}

function logPottyProgress() {
    const progress = document.getElementById('todayProgress').value;
    if (!progress) {
        alert('Please select today\'s progress');
        return;
    }
    
    // Get existing progress from localStorage
    let progressData = JSON.parse(localStorage.getItem('pottyProgress') || '[]');
    
    // Add today's entry
    progressData.push({
        date: new Date().toISOString(),
        result: progress
    });
    
    // Keep only last 30 days
    if (progressData.length > 30) {
        progressData = progressData.slice(-30);
    }
    
    localStorage.setItem('pottyProgress', JSON.stringify(progressData));
    
    // Update statistics
    updatePottyStats();
    
    // Show confirmation
    showNotification('Progress logged successfully!', 'success');
}

function updatePottyStats() {
    const progressData = JSON.parse(localStorage.getItem('pottyProgress') || '[]');
    
    const successRateElement = document.getElementById('successRate');
    const trainingDaysElement = document.getElementById('trainingDays');
    
    if (!successRateElement || !trainingDaysElement) {
        return; // Elements not found, skip update
    }
    
    if (progressData.length === 0) {
        successRateElement.textContent = '0%';
        trainingDaysElement.textContent = '0';
        return;
    }
    
    const successCount = progressData.filter(p => p.result === 'success').length;
    const successRate = Math.round((successCount / progressData.length) * 100);
    const trainingDays = progressData.length;
    
    successRateElement.textContent = successRate + '%';
    trainingDaysElement.textContent = trainingDays;
}

// Behavior Functions
function getBehaviorSolution() {
    const issue = document.getElementById('behaviorIssue').value;
    if (!issue) {
        alert('Please select a behavior issue');
        return;
    }
    
    const solutions = {
        'tantrums': {
            title: 'Temper Tantrums',
            solution: `
                <div style="display: grid; gap: 15px;">
                    <div style="padding: 15px; background: #e8f5e9; border-radius: 10px;">
                        <strong>🎯 Stay Calm</strong>
                        <p>Your calm presence helps regulate their emotions</p>
                    </div>
                    <div style="padding: 15px; background: #e3f2fd; border-radius: 10px;">
                        <strong>🗣️ Acknowledge Feelings</strong>
                        <p>"I see you're angry about leaving the park"</p>
                    </div>
                    <div style="padding: 15px; background: #fff3e0; border-radius: 10px;">
                        <strong>⏰ Use Time-Outs</strong>
                        <p>1 minute per year of age, in a calm space</p>
                    </div>
                </div>
            `
        },
        'biting': {
            title: 'Biting/Hitting',
            solution: `
                <div style="display: grid; gap: 15px;">
                    <div style="padding: 15px; background: #ffebee; border-radius: 10px;">
                        <strong>🛑 Immediate Response</strong>
                        <p>Say "No biting" firmly and remove from situation</p>
                    </div>
                    <div style="padding: 15px; background: #e8f5e9; border-radius: 10px;">
                        <strong>🗣️ Teach Words</strong>
                        <p>"Use your words when you're frustrated"</p>
                    </div>
                    <div style="padding: 15px; background: #e3f2fd; border-radius: 10px;">
                        <strong>🤝 Offer Alternatives</strong>
                        <p>Provide teething toys or stress balls</p>
                    </div>
                </div>
            `
        },
        'defiance': {
            title: 'Defiance/Not Listening',
            solution: `
                <div style="display: grid; gap: 15px;">
                    <div style="padding: 15px; background: #e3f2fd; border-radius: 10px;">
                        <strong>👁️ Get Eye Level</strong>
                        <p>Make eye contact before giving instructions</p>
                    </div>
                    <div style="padding: 15px; background: #fff3e0; border-radius: 10px;">
                        <strong>🎯 Give Choices</strong>
                        <p>"Do you want to wear red or blue shoes?"</p>
                    </div>
                    <div style="padding: 15px; background: #e8f5e9; border-radius: 10px;">
                        <strong>⏰ Use Natural Consequences</strong>
                        <p>"If you don't wear shoes, we can't go outside"</p>
                    </div>
                </div>
            `
        },
        'separation': {
            title: 'Separation Anxiety',
            solution: `
                <div style="display: grid; gap: 15px;">
                    <div style="padding: 15px; background: #e3f2fd; border-radius: 10px;">
                        <strong>⏰ Practice Short Separations</strong>
                        <p>Start with 5-10 minutes and gradually increase</p>
                    </div>
                    <div style="padding: 15px; background: #fff3e0; border-radius: 10px;">
                        <strong>👋 Create Goodbye Ritual</strong>
                        <p>Special handshake, kiss, and wave routine</p>
                    </div>
                    <div style="padding: 15px; background: #e8f5e9; border-radius: 10px;">
                        <strong>🧸 Comfort Object</strong>
                        <p>Allow favorite toy or blanket for security</p>
                    </div>
                </div>
            `
        }
    };
    
    const solution = solutions[issue];
    if (solution) {
        const resultDiv = document.getElementById('behaviorSolution');
        resultDiv.innerHTML = `
            <div style="padding: 20px; background: #f8f9fa; border-radius: 12px;">
                <h4 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">${solution.title}</h4>
                ${solution.solution}
                <div style="margin-top: 20px; padding: 15px; background: #e0e0e0; border-radius: 8px;">
                    <strong>💡 Pro Tip:</strong> Be consistent - it takes 2-3 weeks to see improvement
                </div>
            </div>
        `;
        resultDiv.style.display = 'block';
    }
}

// Development Functions
function updateMilestones() {
    const age = document.getElementById('milestoneAge').value;
    const milestonesList = document.getElementById('milestonesList');
    
    const milestones = {
        '12': {
            'Physical': [
                'Walks independently',
                'Stands alone briefly',
                'Crawls up stairs',
                'Throws ball',
                'Pulls to standing'
            ],
            'Cognitive': [
                'Says 2-3 words',
                'Points to desired objects',
                'Follows simple commands',
                'Explores objects',
                'Looks for hidden objects'
            ],
            'Social': [
                'Waves goodbye',
                'Feeds self with fingers',
                'Shows separation anxiety',
                'Imitates actions',
                'Plays alongside others'
            ]
        },
        '18': {
            'Physical': [
                'Walks up stairs with help',
                'Runs steadily',
                'Kicks ball forward',
                'Climbs onto furniture',
                'Throws ball overhead'
            ],
            'Cognitive': [
                'Says 10-20 words',
                'Points to body parts',
                'Follows 2-step commands',
                'Scribbles with crayon',
                'Knows 5+ body parts'
            ],
            'Social': [
                'Drinks from cup independently',
                'Feeds self with spoon',
                'Shows separation anxiety',
                'Imitates gestures',
                'Plays pretend games'
            ]
        },
        '24': {
            'Physical': [
                'Runs well',
                'Kicks ball',
                'Jumps with both feet',
                'Climbs on furniture',
                'Throws overhand'
            ],
            'Cognitive': [
                'Uses 2-word phrases',
                'Knows 50+ words',
                'Sorts by shape/color',
                'Follows 2-step commands',
                'Names pictures'
            ],
            'Social': [
                'Plays with other children',
                'Shows independence',
                'Has favorite toys',
                'Shows affection',
                'Helps with simple tasks'
            ]
        },
        '36': {
            'Physical': [
                'Rides tricycle',
                'Hops on one foot',
                'Catches bounced ball',
                'Climbs playground equipment',
                'Uses scissors'
            ],
            'Cognitive': [
                'Speaks in sentences',
                'Knows 100+ words',
                'Tells simple stories',
                'Counts to 10',
                'Knows colors'
            ],
            'Social': [
                'Uses spoon well',
                'Plays make-believe',
                'Takes turns in games',
                'Shows empathy',
                'Dresses self with help'
            ]
        }
    };
    
    const ageMilestones = milestones[age] || [];
    
    let html = '';
    
    if (typeof ageMilestones === 'object' && !Array.isArray(ageMilestones)) {
        // Categorized milestones
        Object.entries(ageMilestones).forEach(([category, milestoneList]) => {
            const categoryColors = {
                'Physical': { bg: '#e8f5e9', border: '#4caf50', icon: 'physical' },
                'Cognitive': { bg: '#fff3e0', border: '#ff9800', icon: 'cognitive' },
                'Social': { bg: '#e3f2fd', border: '#2196f3', icon: 'social' }
            };
            
            const colors = categoryColors[category] || { bg: '#f5f5f5', border: '#999', icon: 'default' };
            
            html += `
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; padding: 12px 16px; background: linear-gradient(135deg, #f8bbd0 0%, #f06292 100%); border-radius: 10px; border-left: 5px solid #e91e63; box-shadow: 0 3px 10px rgba(233, 30, 99, 0.2);">
                        <div style="width: 28px; height: 28px; background: #e91e63; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold; box-shadow: 0 2px 5px rgba(233, 30, 99, 0.3);">${category.charAt(0)}</div>
                        <strong style="color: #ffffff; font-size: 18px; font-weight: 700;">${category}</strong>
                    </div>
                    <div style="display: grid; gap: 10px;">
                        ${milestoneList.map(milestone => `
                            <label style="display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); border-radius: 12px; cursor: pointer; margin-bottom: 0; border: 2px solid #f48fb1; transition: all 0.3s; box-shadow: 0 4px 12px rgba(244, 143, 177, 0.15);">
                                <input type="checkbox" class="milestone-check" value="${milestone}" style="width: 22px; height: 22px; accent-color: ${colors.border};">
                                <span style="font-size: 16px; color: #880e4f; flex: 1; font-weight: 600; line-height: 1.4;">${milestone}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    } else {
        // Simple array (for 18 and 36 months)
        html = ageMilestones.map(milestone => `
            <label style="display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); border-radius: 12px; cursor: pointer; margin-bottom: 12px; border: 2px solid #f48fb1; transition: all 0.3s; box-shadow: 0 4px 12px rgba(244, 143, 177, 0.15);">
                <input type="checkbox" class="milestone-check" value="${milestone}" style="width: 22px; height: 22px; accent-color: #667eea;">
                <span style="font-size: 16px; color: #880e4f; flex: 1; font-weight: 600; line-height: 1.4;">${milestone}</span>
            </label>
        `).join('');
    }
    
    milestonesList.innerHTML = html;
}

function saveMilestoneProgress() {
    const checkedMilestones = Array.from(document.querySelectorAll('.milestone-check:checked'))
        .map(cb => cb.value);
    
    if (checkedMilestones.length === 0) {
        alert('Please select at least one milestone');
        return;
    }
    
    const age = document.getElementById('milestoneAge').value;
    const progressData = JSON.parse(localStorage.getItem('milestoneProgress') || '{}');
    
    progressData[age] = {
        date: new Date().toISOString(),
        milestones: checkedMilestones
    };
    
    localStorage.setItem('milestoneProgress', JSON.stringify(progressData));
    showNotification('Milestone progress saved!', 'success');
}

// Playtime Functions
function generateActivity() {
    const age = document.getElementById('playAgeSelect').value;
    const type = document.getElementById('activityTypeSelect').value;
    
    const activities = {
        'educational': {
            '12': 'Stack blocks and knock them down - teaches cause and effect',
            '18': 'Sort toys by color - develops categorization skills',
            '24': 'Count everyday objects - builds number recognition',
            '36': 'Simple puzzles - problem solving development'
        },
        'physical': {
            '12': 'Crawl through obstacle course with pillows',
            '18': 'Dance to music with movements',
            '24': 'Throw and catch soft ball',
            '36': 'Animal walks - bear crawl, frog jump'
        },
        'creative': {
            '12': 'Finger painting with edible paints',
            '18': 'Play-doh exploration',
            '24': 'Crayon drawing on large paper',
            '36': 'Collage making with safe materials'
        },
        'sensory': {
            '12': 'Water play with cups and containers',
            '18': 'Rice bin with hidden toys',
            '24': 'Cloud dough making and playing',
            '36': 'Slime creation and exploration'
        }
    };
    
    const activity = activities[type]?.[age] || 'Age-appropriate activity';
    
    const resultDiv = document.getElementById('generatedActivity');
    resultDiv.innerHTML = `
        <div style="padding: 20px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px;">
            <h4 style="color: #2e7d32; margin: 0 0 15px 0;">🎯 Your Activity</h4>
            <p style="font-size: 16px; color: #333; line-height: 1.5; margin: 0;">${activity}</p>
            <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.8); border-radius: 8px;">
                <strong>💡 Tips:</strong>
                <ul style="margin: 8px 0 0 20px; font-size: 14px; color: #666;">
                    <li>Supervise closely for safety</li>
                    <li>Follow child's lead and interests</li>
                    <li>Keep sessions short (10-15 minutes)</li>
                </ul>
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';
}

function showEntertainment(category) {
    const entertainment = {
        'indoor': [
            '🏠 Build a fort with blankets and pillows',
            '🎨 Art station with crayons, paint, and paper',
            '🧩 Sensory bin with rice or beans',
            '📚 Reading corner with favorite books',
            '🎵 Dance party with toddler music'
        ],
        'outdoor': [
            '🌳 Nature walk and collect leaves/sticks',
            '🏃 Playground visit with age-appropriate equipment',
            '💦 Water table or sprinkler play',
            '🦋 Bug hunting with magnifying glass',
            '🚴 Tricycle riding in safe area'
        ]
    };
    
    const ideas = entertainment[category] || [];
    const detailsDiv = document.getElementById('entertainmentDetails');
    
    detailsDiv.innerHTML = `
        <h4 style="color: #333; margin: 0 0 15px 0;">${category === 'indoor' ? '🏠 Indoor' : '🌳 Outdoor'} Activities</h4>
        <div style="display: grid; gap: 10px;">
            ${ideas.map(idea => `
                <div style="padding: 12px; background: white; border-radius: 8px; font-size: 14px; color: #666;">
                    ${idea}
                </div>
            `).join('')}
        </div>
    `;
    detailsDiv.style.display = 'block';
}

// Bathing Functions
function showBathSafetyTips() {
    const tips = `
        <div style="display: grid; gap: 15px;">
            <div style="padding: 15px; background: #e3f2fd; border-radius: 10px;">
                <strong>🌡️ Temperature Check</strong>
                <p>Always test water with your elbow - it should feel warm, not hot</p>
            </div>
            <div style="padding: 15px; background: #e8f5e9; border-radius: 10px;">
                <strong>🛡️ Non-Slip Surface</strong>
                <p>Use bath mat or non-slip stickers in tub</p>
            </div>
            <div style="padding: 15px; background: #fff3e0; border-radius: 10px;">
                <strong>👁️ Constant Supervision</strong>
                <p>Never leave child unattended - not even for a second</p>
            </div>
            <div style="padding: 15px; background: #ffebee; border-radius: 10px;">
                <strong>🧼 Gentle Products</strong>
                <p>Use tear-free, hypoallergenic soap and shampoo</p>
            </div>
        </div>
    `;
    
    showNotification('Bath safety tips loaded!', 'info');
    
    // You could display this in a modal or specific area
    console.log('Bath Safety Tips:', tips);
}

function getHaircutTips() {
    const temperament = document.getElementById('childTemperament').value;
    
    const tips = {
        'calm': {
            title: 'Calm & Cooperative Child',
            tips: [
                'Schedule during quiet time of day',
                'Bring favorite snack and drink',
                'Use distraction with tablet or toy',
                'Offer small reward for sitting still'
            ]
        },
        'wiggly': {
            title: 'Wiggly & Active Child',
            tips: [
                'Schedule after active play when tired',
                'Have two adults - one to distract, one to cut',
                'Use cape and let child hold spray bottle',
                'Take breaks every few minutes'
            ]
        },
        'sensitive': {
            title: 'Sensitive to Touch',
            tips: [
                'Use scissors instead of electric clippers',
                'Practice with pretend cutting first',
                'Let child feel scissors before use',
                'Avoid spraying water directly on face'
            ]
        },
        'afraid': {
            title: 'Afraid of Haircuts',
            tips: [
                'Watch videos of other children getting haircuts',
                'Visit salon just to watch first',
                'Bring favorite comfort item',
                'Consider mobile hairdresser who comes to home'
            ]
        }
    };
    
    const tipData = tips[temperament];
    const tipsDiv = document.getElementById('haircutTips');
    
    tipsDiv.innerHTML = `
        <div style="padding: 20px; background: #f8f9fa; border-radius: 12px;">
            <h4 style="color: #333; margin: 0 0 15px 0;">✂️ ${tipData.title}</h4>
            <div style="display: grid; gap: 12px;">
                ${tipData.tips.map(tip => `
                    <div style="padding: 12px; background: white; border-radius: 8px; font-size: 14px; color: #666;">
                        • ${tip}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    tipsDiv.style.display = 'block';
}

// Development Functions for the new development page
function updateDevelopmentMilestones() {
    const age = document.getElementById('devAgeSelect').value;
    const container = document.getElementById('devMilestonesContainer');
    
    const allMilestones = {
        '12': {
            'Physical': ['Stands alone', 'Takes first steps', 'Climbs stairs with help'],
            'Cognitive': ['Says 2-3 words', 'Follows simple commands', 'Points to objects'],
            'Social': ['Waves goodbye', 'Shows separation anxiety', 'Plays alongside others']
        },
        '18': {
            'Physical': ['Walks independently', 'Runs stiffly', 'Climbs on furniture'],
            'Cognitive': ['Says 10-20 words', 'Points to body parts', 'Scribbles'],
            'Social': ['Shows affection', 'Has temper tantrums', 'Imitates actions']
        },
        '24': {
            'Physical': ['Kicks ball', 'Runs well', 'Jumps with both feet'],
            'Cognitive': ['Uses 2-word phrases', 'Knows 50+ words', 'Sorts by shape/color'],
            'Social': ['Plays with other children', 'Shows independence', 'Has favorite toys']
        },
        '36': {
            'Physical': ['Rides tricycle', 'Catches bounced ball', 'Hops on one foot'],
            'Cognitive': ['Speaks in sentences', 'Knows age/gender', 'Counts to 3'],
            'Social': ['Takes turns', 'Shows empathy', 'Plays make-believe']
        }
    };
    
    const milestones = allMilestones[age] || {};
    
    let html = '';
    for (const [category, items] of Object.entries(milestones)) {
        html += `
            <div style="margin-bottom: 20px;">
                <h5 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${category}</h5>
                ${items.map(item => `
                    <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 6px; cursor: pointer; transition: all 0.2s ease;">
                        <input type="checkbox" class="dev-milestone" data-category="${category}" value="${item}" style="transform: scale(1.2);">
                        <span style="font-size: 14px; color: #2c3e50; font-weight: 500;">${item}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Add hover effects to milestone checkboxes
    container.querySelectorAll('label').forEach(label => {
        label.addEventListener('mouseenter', () => {
            label.style.background = '#f0f8ff';
            label.style.borderColor = '#3498db';
        });
        label.addEventListener('mouseleave', () => {
            label.style.background = '#ffffff';
            label.style.borderColor = '#e0e0e0';
        });
    });
}

function saveDevelopmentProgress() {
    const checkedMilestones = Array.from(document.querySelectorAll('.dev-milestone:checked'))
        .map(cb => ({ category: cb.dataset.category, milestone: cb.value }));
    
    if (checkedMilestones.length === 0) {
        alert('Please select at least one milestone');
        return;
    }
    
    const age = document.getElementById('devAgeSelect').value;
    const progressData = JSON.parse(localStorage.getItem('developmentProgress') || '{}');
    
    progressData[age] = {
        date: new Date().toISOString(),
        milestones: checkedMilestones
    };
    
    localStorage.setItem('developmentProgress', JSON.stringify(progressData));
    showNotification('Development progress saved!', 'success');
}

function saveGrowthData() {
    const height = document.getElementById('heightInput').value;
    const weight = document.getElementById('weightInput').value;
    const date = document.getElementById('measureDate').value;
    
    if (!height || !weight || !date) {
        alert('Please fill in all measurements');
        return;
    }
    
    const growthData = JSON.parse(localStorage.getItem('growthData') || '[]');
    
    growthData.push({
        date: date,
        height: parseFloat(height),
        weight: parseFloat(weight)
    });
    
    localStorage.setItem('growthData', JSON.stringify(growthData));
    showNotification('Growth data saved!', 'success');
    
    // Clear form
    document.getElementById('heightInput').value = '';
    document.getElementById('weightInput').value = '';
    document.getElementById('measureDate').value = '';
}

// Modal-specific functions
function buildBedtimeRoutineModal() {
    const bedtime = document.getElementById('modalTargetBedtime')?.value;
    const duration = document.getElementById('modalRoutineDuration')?.value;
    
    if (!bedtime || !duration) {
        showNotification('Please select bedtime and duration', 'error');
        return;
    }
    
    const [hours, minutes] = bedtime.split(':').map(Number);
    let startTime = new Date();
    startTime.setHours(hours, minutes, 0);
    startTime.setMinutes(startTime.getMinutes() - parseInt(duration));
    
    const routineSteps = [
        { time: duration * 0.8, activity: 'Quiet play time', icon: 'play' },
        { time: duration * 0.6, activity: 'Bath time', icon: 'bath' },
        { time: duration * 0.4, activity: 'Pajamas & diaper', icon: 'clothes' },
        { time: duration * 0.2, activity: 'Brush teeth', icon: 'tooth' },
        { time: duration * 0.1, activity: 'Read stories', icon: 'book' },
        { time: 0, activity: 'Lights out, goodnight', icon: 'sleep' }
    ];
    
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Your Bedtime Routine:</h4>`;
    html += `<div style="display: grid; gap: 10px;">`;
    
    routineSteps.forEach(step => {
        const stepTime = new Date(startTime.getTime() + step.time * 60 * 1000);
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">`;
        html += `<strong>${formatTime12Hour(stepTime)}</strong> - ${step.activity} ${step.icon}</div>`;
    });
    
    html += `</div></div>`;
    
    const resultDiv = document.getElementById('modalRoutineResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function checkSleepEnvironmentModal() {
    const checks = [
        document.getElementById('modalDarkCurtains')?.checked,
        document.getElementById('modalWhiteNoise')?.checked,
        document.getElementById('modalComfortableTemp')?.checked
    ];
    
    const checkedCount = checks.filter(c => c).length;
    const score = Math.round((checkedCount / 3) * 100);
    
    let message = '';
    let color = '#4caf50';
    
    if (score >= 80) {
        message = 'Excellent sleep environment! Your toddler has perfect setup for restful sleep.';
    } else if (score >= 60) {
        message = 'Good sleep environment! A few more improvements could make it even better.';
        color = '#ff9800';
    } else {
        message = 'Sleep environment needs some improvements for better sleep quality.';
        color = '#ff5722';
    }
    
    let html = `<div style="padding: 20px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 15px;">`;
    html += `<div style="text-align: center; margin-bottom: 15px;">`;
    html += `<div style="font-size: 48px; font-weight: 700; color: ${color};">${score}%</div>`;
    html += `<div style="color: #666;">Sleep Environment Score</div>`;
    html += `</div>`;
    html += `<p style="text-align: center; color: #333;">${message}</p>`;
    html += `</div>`;
    
    const resultDiv = document.getElementById('modalEnvironmentResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function generateNapScheduleModal() {
    const age = document.getElementById('modalNapAge')?.value;
    const wakeTime = document.getElementById('modalWakeTime')?.value;
    
    if (!age || !wakeTime) {
        showNotification('Please select age and wake time', 'error');
        return;
    }
    
    const [hours, minutes] = wakeTime.split(':').map(Number);
    let wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0);
    
    const napSchedules = {
        '12': { naps: 2, nap1Start: 5, nap1Duration: 1.5, nap2Start: 4, nap2Duration: 1 },
        '18': { naps: 2, nap1Start: 5, nap1Duration: 2, nap2Start: 3.5, nap2Duration: 1.5 },
        '24': { naps: 1, napStart: 6, napDuration: 2 },
        '30': { naps: 1, napStart: 6.5, napDuration: 2 },
        '36': { naps: 1, napStart: 7, napDuration: 1.5 }
    };
    
    const schedule = napSchedules[age];
    let html = `<div style="padding: 20px; background: #f0f9ff; border-radius: 15px;">`;
    html += `<h4 style="color: #1565c0; margin-bottom: 15px;">Recommended Nap Schedule:</h4>`;
    html += `<div style="display: grid; gap: 10px;">`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #4caf50;">`;
    html += `<strong>Wake Up:</strong> ${formatTime12Hour(wakeTime)}</div>`;
    
    if (schedule.naps === 2) {
        let nap1Start = new Date(wakeDate.getTime() + schedule.nap1Start * 60 * 60 * 1000);
        let nap1End = new Date(nap1Start.getTime() + schedule.nap1Duration * 60 * 60 * 1000);
        let nap2Start = new Date(wakeDate.getTime() + (schedule.nap1Start + schedule.nap1Duration + schedule.nap2Start) * 60 * 60 * 1000);
        let nap2End = new Date(nap2Start.getTime() + schedule.nap2Duration * 60 * 60 * 1000);
        
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ff9800;">`;
        html += `<strong>Morning Nap:</strong> ${formatTime12Hour(nap1Start)} - ${formatTime12Hour(nap1End)}</div>`;
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ff9800;">`;
        html += `<strong>Afternoon Nap:</strong> ${formatTime12Hour(nap2Start)} - ${formatTime12Hour(nap2End)}</div>`;
    } else {
        let napStart = new Date(wakeDate.getTime() + schedule.napStart * 60 * 60 * 1000);
        let napEnd = new Date(napStart.getTime() + schedule.napDuration * 60 * 60 * 1000);
        html += `<div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ff9800;">`;
        html += `<strong>Nap Time:</strong> ${formatTime12Hour(napStart)} - ${formatTime12Hour(napEnd)}</div>`;
    }
    
    html += `</div></div>`;
    
    const resultDiv = document.getElementById('modalNapScheduleResult');
    if (resultDiv) {
        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }
}

function showSleepSolutionModal(type) {
    const solutions = {
        'refusal': 'Bedtime Refusal Solutions:\n\n1. Create a predictable routine\n2. Offer limited choices ("pajamas first or teeth first?")\n3. Use a visual schedule\n4. Stay calm and consistent\n5. Check if bedtime is too early/late',
        'gettingup': 'Getting Out of Bed Solutions:\n\n1. Silent return to bed\n2. Reward system for staying in bed\n3. Check for physical needs (toilet, water)\n4. Use a bedtime pass system\n5. Be boring - no attention for getting up',
        'fears': 'Night Fears Solutions:\n\n1. Validate their feelings\n2. Use monster spray (water in spray bottle)\n3. Night light or comfort object\n4. Check room together\n5. Teach coping skills (deep breathing)'
    };
    
    showModal('Sleep Solution', solutions[type]);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('behaviorDate');
    if (dateInput) dateInput.valueAsDate = new Date();
    
    updateBehaviorDisplay();
    showSleepStats();
    updateStickerChart();
    updatePottyStats();
    updateScreenTimeDisplay();
    
    // Range slider for routine duration
    const durationSlider = document.getElementById('routineDuration');
    const durationValue = document.getElementById('durationValue');
    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', function() {
            durationValue.textContent = this.value;
        });
    }
    
    // Modal range slider
    const modalDurationSlider = document.getElementById('modalRoutineDuration');
    const modalDurationValue = document.getElementById('modalDurationValue');
    if (modalDurationSlider && modalDurationValue) {
        modalDurationSlider.addEventListener('input', function() {
            modalDurationValue.textContent = this.value;
        });
    }
});
