// ==========================================
// TODDLER TOPIC PAGE FUNCTIONS
// ==========================================

// Sleep Guides Functions
async function generateSleepSchedule() {
    const age = document.getElementById('scheduleAge')?.value;
    const wakeTime = document.getElementById('wakeTime')?.value;
    
    if (!age || !wakeTime) {
        showNotification('Please select age and wake time', 'error');
        return;
    }
    
    showNotification('🤖 AI generating personalized sleep schedule...', 'info');
    
    try {
        const response = await fetch(window.mamasafeApiUrl('/api/ai-sleep-guidance'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                age: `${age} years`,
                sleepIssues: 'need sleep schedule',
                schedule: `wake time: ${wakeTime}`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let html = `<div style="padding: 20px; background: #ecfdf5; border-radius: 15px; margin-top: 20px;">`;
            html += `<h4 style="color: #512da8; margin-bottom: 15px;">🤖 AI-Generated Sleep Schedule:</h4>`;
            html += `<div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #00b894;">`;
            html += data.response.replace(/\n/g, '<br>');
            html += `</div></div>`;
            
            const resultDiv = document.getElementById('scheduleResult');
            if (resultDiv) {
                resultDiv.innerHTML = html;
                resultDiv.style.display = 'block';
            }
            showNotification('✅ AI sleep schedule generated!', 'success');
        } else {
            showNotification('❌ AI error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('AI Schedule Error:', error);
        showNotification('❌ Failed to generate AI schedule', 'error');
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
    const entries = JSON.parse(localStorage.getItem('mamasafe_sleep_track_entries') || '[]');
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
    html += `<div style="font-size: 24px; font-weight: 700; color: #512da8;">${avgHours}h</div>`;
    html += `<div style="font-size: 12px;">Avg Sleep</div></div>`;
    html += `<div style="background: #ecfdf5; padding: 15px; border-radius: 10px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #00b894;">${last7.length}</div>`;
    html += `<div style="font-size: 12px;">Entries</div></div>`;
    html += `</div></div>`;
    
    const statsDiv = document.getElementById('sleepStats');
    if (statsDiv) statsDiv.innerHTML = html;
}

// Feeding Functions
async function generateMealPlan() {
    const age = document.getElementById('mealPlanAge')?.value;
    if (!age) {
        showNotification('Please select age', 'error');
        return;
    }
    
    showNotification('🤖 AI generating personalized meal plan...', 'info');
    
    try {
        const response = await fetch(window.mamasafeApiUrl('/api/ai-nutrition-planning'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mealPlan: 'daily meals',
                dietaryRestrictions: 'toddler friendly',
                goals: 'healthy nutrition'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let html = `<div style="padding: 20px; background: #ecfdf5; border-radius: 15px; margin-top: 20px;">`;
            html += `<h4 style="color: #512da8; margin-bottom: 15px;">🤖 AI-Generated Meal Plan:</h4>`;
            html += `<div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #00b894;">`;
            html += data.response.replace(/\n/g, '<br>');
            html += `</div></div>`;
            
            const resultDiv = document.getElementById('mealPlanResult');
            if (resultDiv) {
                resultDiv.innerHTML = html;
                resultDiv.style.display = 'block';
            }
            showNotification('✅ AI meal plan generated!', 'success');
        } else {
            showNotification('❌ AI error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('AI Meal Plan Error:', error);
        showNotification('❌ Failed to generate AI meal plan', 'error');
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
    
    let html = `<div style="padding: 20px; background: #ecfdf5; border-radius: 15px; margin-top: 20px;">`;
    html += `<h4 style="color: #512da8; margin-bottom: 15px;">Daily Nutrition Requirements:</h4>`;
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #ff9800;">${calories}</div>`;
    html += `<div style="font-size: 12px;">Calories/day</div></div>`;
    html += `<div style="padding: 12px; background: white; border-radius: 8px; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700; color: #00b894;">${protein}g</div>`;
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
    
    let html = `<div style="padding: 20px; background: ${ready ? '#ecfdf5' : '#fff5f7'}; border-radius: 15px; margin-top: 20px;">`;
    html += `<div style="font-size: 48px; text-align: center; margin-bottom: 10px;">${ready ? '✅' : '⏳'}</div>`;
    html += `<h4 style="text-align: center; color: ${ready ? '#00b894' : '#ff9800'};">${ready ? 'Ready to Start!' : 'Not Quite Ready'}</h4>`;
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

window.pottySuccess = window.pottySuccess || parseInt(localStorage.getItem('mamasafe_potty_success') || '0');
window.pottyAccidents = window.pottyAccidents || parseInt(localStorage.getItem('mamasafe_potty_accidents') || '0');

function logPottySuccess() {
    window.pottySuccess++;
    localStorage.setItem('mamasafe_potty_success', window.pottySuccess);
    updatePottyStats();
    showNotification('Success logged! Great job!', 'success');
}

function logPottyAccident() {
    window.pottyAccidents++;
    localStorage.setItem('mamasafe_potty_accidents', window.pottyAccidents);
    updatePottyStats();
    showNotification('Accident logged - keep trying!', 'info');
}

function updatePottyStats() {
    const total = window.pottySuccess + window.pottyAccidents;
    const rate = total > 0 ? Math.round((window.pottySuccess / total) * 100) : 0;
    
    const rateEl = document.getElementById('successRate');
    const barEl = document.getElementById('progressBar');
    const successEl = document.getElementById('successCount');
    const accidentEl = document.getElementById('accidentCount');
    
    if (rateEl) rateEl.textContent = rate + '%';
    if (barEl) barEl.style.width = rate + '%';
    if (successEl) successEl.textContent = window.pottySuccess;
    if (accidentEl) accidentEl.textContent = window.pottyAccidents;
}

window.stickers = window.stickers || parseInt(localStorage.getItem('mamasafe_stickers') || '0');

function addSticker() {
    if (window.stickers < 10) {
        window.stickers++;
        localStorage.setItem('mamasafe_stickers', window.stickers);
        updateStickerChart();
        if (window.stickers === 10) {
            showNotification('Reward earned! 10 stickers complete!', 'success');
        }
    }
}

function updateStickerChart() {
    const countEl = document.getElementById('stickerCount');
    const streakEl = document.getElementById('currentStreak');
    const gridEl = document.getElementById('stickerGrid');
    
    if (countEl) countEl.textContent = window.stickers;
    if (streakEl) streakEl.textContent = window.stickers;
    
    if (gridEl) {
        gridEl.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const div = document.createElement('div');
            div.style.cssText = 'width: 40px; height: 40px; border: 2px solid #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;';
            div.textContent = i < window.stickers ? 'â' : '';
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
    const entries = JSON.parse(localStorage.getItem('mamasafe_behavior_entries') || '[]');
    entries.unshift(entry);
    localStorage.setItem('mamasafe_behavior_entries', JSON.stringify(entries));
    
    updateBehaviorDisplay();
    showNotification('Behavior logged successfully', 'success');
    
    if (document.getElementById('behaviorTrigger')) document.getElementById('behaviorTrigger').value = '';
    if (document.getElementById('behaviorNotes')) document.getElementById('behaviorNotes').value = '';
}

function updateBehaviorDisplay() {
    const entries = JSON.parse(localStorage.getItem('mamasafe_behavior_entries') || '[]');
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
async function showMilestones() {
    const age = document.getElementById('devAgeSelect')?.value;
    if (!age) {
        showNotification('Please select an age', 'error');
        return;
    }
    
    showNotification('🤖 AI generating milestone information...', 'info');
    
    try {
        const response = await fetch(window.mamasafeApiUrl('/api/ai-milestone-tracking'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                age: `${age} months`,
                developmentArea: 'all areas',
                concerns: 'developmental milestones'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let html = `<div style="padding: 20px; background: #ecfdf5; border-radius: 15px; margin-top: 20px;">`;
            html += `<h4 style="color: #512da8; margin-bottom: 15px;">🤖 AI-Generated Milestone Information:</h4>`;
            html += `<div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #00b894;">`;
            html += data.response.replace(/\n/g, '<br>');
            html += `</div></div>`;
            
            const listEl = document.getElementById('milestoneList');
            if (listEl) {
                listEl.innerHTML = html;
            }
            showNotification('✅ AI milestone information generated!', 'success');
        } else {
            showNotification('❌ AI error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('AI Milestones Error:', error);
        showNotification('❌ Failed to generate AI milestone information', 'error');
    }
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
    
    let html = `<div style="padding: 20px; background: #ecfdf5; border-radius: 15px;">`;
    html += `<div style="text-align: center; margin-bottom: 15px;">`;
    html += `<div style="font-size: 48px; font-weight: 700; color: #00b894;">${percent}%</div>`;
    html += `<div style="color: #666;">Skills Demonstrated</div>`;
    html += `</div>`;
    html += `<p style="text-align: center; color: #0f2a56;">${message}</p>`;
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
    
    alert(activities[type] || 'Activity type not found');
}

// Playtime Functions
async function findActivities() {
    const age = document.getElementById('playAge')?.value;
    if (!age) {
        showNotification('Please select age', 'error');
        return;
    }
    
    showNotification('🤖 AI finding personalized activities...', 'info');
    
    try {
        const response = await fetch(window.mamasafeApiUrl('/api/ai-activity-recommendations'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                age: `${age} years`,
                activityLevel: 'moderate',
                interests: 'developmental activities'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let html = `<div style="padding: 20px; background: #ecfdf5; border-radius: 15px; margin-top: 20px;">`;
            html += `<h4 style="color: #512da8; margin-bottom: 15px;">🤖 AI-Recommended Activities:</h4>`;
            html += `<div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #00b894;">`;
            html += data.response.replace(/\n/g, '<br>');
            html += `</div></div>`;
            
            const resultDiv = document.getElementById('activityResult');
            if (resultDiv) {
                resultDiv.innerHTML = html;
                resultDiv.style.display = 'block';
            }
            showNotification('✅ AI activities found!', 'success');
        } else {
            showNotification('❌ AI error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('AI Activities Error:', error);
        showNotification('❌ Failed to find AI activities', 'error');
    }
}

function generatePlaySchedule() {
    showModal('Custom Play Schedule', 
        'Morning (9-11 AM): Active outdoor play\n' +
        'Midday (11 AM-1 PM): Creative indoor activities\n' +
        'Afternoon (3-5 PM): Quiet play / Reading\n' +
        'Evening (5-7 PM): Family games & wind down');
}

// ... (rest of the code remains the same)
window.screenTimeMinutes = window.screenTimeMinutes || parseInt(localStorage.getItem('mamasafe_screen_time') || '0');

function addScreenTime(minutes) {
    window.screenTimeMinutes += minutes;
    localStorage.setItem('mamasafe_screen_time', window.screenTimeMinutes);
    updateScreenTimeDisplay();
}

function updateScreenTimeDisplay() {
    const todayEl = document.getElementById('screenTimeToday');
    const barEl = document.getElementById('screenTimeBar');
    
    if (todayEl) todayEl.textContent = window.screenTimeMinutes + ' min';
    if (barEl) {
        const percent = Math.min((window.screenTimeMinutes / 60) * 100, 100);
        barEl.style.width = percent + '%';
        if (window.screenTimeMinutes > 60) {
            barEl.style.background = 'linear-gradient(135deg, #ff4757 0%, #ff527d 100%)';
        }
    }
    
    if (window.screenTimeMinutes > 60) {
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('behaviorDate');
    if (dateInput) dateInput.valueAsDate = new Date();
    
    updateBehaviorDisplay();
    showSleepStats();
    updateStickerChart();
    updatePottyStats();
    updateScreenTimeDisplay();
});
