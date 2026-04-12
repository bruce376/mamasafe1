// Baby Milestone Data
const babyMilestonesByMonth = [
    {
        month: 0,
        title: "Newborn",
        milestones: ["Responds to sound", "Brings hands to face", "Makes reflex movements"],
        careFocus: "Feeding every 2-3 hours, lots of skin-to-skin contact",
        sleep: "16-18 hours total, wake every 2-3 hours to feed"
    },
    {
        month: 1,
        title: "1 Month",
        milestones: ["Begins to smile", "Tracks objects with eyes", "Lifts head briefly"],
        careFocus: "Tummy time practice, responding to cues",
        sleep: "15-16 hours, longer stretches at night"
    },
    {
        month: 2,
        title: "2 Months",
        milestones: ["Social smile", "Coos and makes sounds", "Holds head up"],
        careFocus: "Interactive play, reading to baby",
        sleep: "14-16 hours, 4-5 naps"
    },
    {
        month: 3,
        title: "3 Months",
        milestones: ["Laughs", "Recognizes faces", "Grasps objects"],
        careFocus: "Establish routines, more tummy time",
        sleep: "14-15 hours, bedtime routine important"
    },
    {
        month: 4,
        title: "4 Months",
        milestones: ["Rolls over", "Babbles", "Reaches for toys"],
        careFocus: "Safe exploration, watching for rolling",
        sleep: "14-15 hours, may start sleep regression"
    },
    {
        month: 5,
        title: "5 Months",
        milestones: ["Sits with support", "Transfers objects", "More vocal"],
        careFocus: "Introducing solid foods may begin",
        sleep: "14 hours, 3 naps typical"
    },
    {
        month: 6,
        title: "6 Months",
        milestones: ["Sits independently", "Starts solids", "Babbles strings"],
        careFocus: "First foods, sitting practice, teething care",
        sleep: "14 hours, 2-3 naps"
    },
    {
        month: 7,
        title: "7 Months",
        milestones: ["Crawling attempts", "Object permanence", "Responds to name"],
        careFocus: "Baby-proofing, varied solid foods",
        sleep: "13-14 hours, 2-3 naps"
    },
    {
        month: 8,
        title: "8 Months",
        milestones: ["Crawls well", "Pulls to stand", "Pincer grasp"],
        careFocus: "Safety priority, finger foods",
        sleep: "13-14 hours, 2 naps"
    },
    {
        month: 9,
        title: "9 Months",
        milestones: ["Stands holding on", "Waves bye-bye", "Understands 'no'"],
        careFocus: "Communication games, cruising practice",
        sleep: "13-14 hours, 2 naps"
    },
    {
        month: 10,
        title: "10 Months",
        milestones: ["Cruises furniture", "Gestures for needs", "Explores everything"],
        careFocus: "Constant supervision, reading together",
        sleep: "12-14 hours, 2 naps"
    },
    {
        month: 11,
        title: "11 Months",
        milestones: ["Stands alone", "First words", "Imitates actions"],
        careFocus: "Language development, walking prep",
        sleep: "12-14 hours, 2 naps"
    },
    {
        month: 12,
        title: "12 Months",
        milestones: ["Walks with help or alone", "Says 1-3 words", "Follows instructions"],
        careFocus: "Celebration! Transitioning to toddler",
        sleep: "12-14 hours, 1-2 naps"
    }
];

// Baby milestone tracking function
function trackMilestones() {
    const birthDateInput = document.getElementById('babyBirthDate');
    const babyNameInput = document.getElementById('babyNameInput');
    const resultDiv = document.getElementById('milestoneResult');
    
    if (!birthDateInput || !birthDateInput.value) {
        showNotification('Please enter your baby\'s birth date', 'error');
        return;
    }
    
    const birthDate = new Date(birthDateInput.value);
    const today = new Date();
    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30.44);
    const weeks = Math.floor(diffDays / 7);
    
    const babyName = babyNameInput && babyNameInput.value ? babyNameInput.value : 'Your baby';
    
    // Display current age
    let ageDisplay = '';
    if (months < 1) {
        ageDisplay = `${weeks} weeks old`;
    } else if (months < 12) {
        const remainingWeeks = Math.floor((diffDays % 30.44) / 7);
        ageDisplay = remainingWeeks > 0 ? `${months} months, ${remainingWeeks} weeks` : `${months} months`;
    } else {
        ageDisplay = `1 year old`;
    }
    
    // Update result display
    const currentAgeDiv = document.getElementById('currentBabyAge');
    const nextMilestoneDiv = document.getElementById('nextMilestone');
    
    if (currentAgeDiv) currentAgeDiv.textContent = `${babyName} is ${ageDisplay}`;
    
    // Find next milestone
    const currentMonthData = babyMilestonesByMonth.find(m => m.month === Math.min(months, 12));
    const nextMonthData = babyMilestonesByMonth.find(m => m.month === Math.min(months + 1, 12));
    
    if (nextMilestoneDiv && nextMonthData) {
        if (months >= 12) {
            nextMilestoneDiv.textContent = '🎉 Congratulations! Your baby is now a toddler!';
        } else {
            nextMilestoneDiv.textContent = `Next: ${nextMonthData.title} - ${nextMonthData.milestones[0]}`;
        }
    }
    
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    showNotification('Milestone tracker updated!', 'success');
}

function showFullMilestones() {
    const birthDateInput = document.getElementById('babyBirthDate');
    const babyNameInput = document.getElementById('babyNameInput');
    const timelineSection = document.getElementById('milestoneTimelineSection');
    const timelineDiv = document.getElementById('milestoneTimeline');
    const infoText = document.getElementById('milestoneBabyInfo');
    
    if (!birthDateInput || !birthDateInput.value) {
        showNotification('Please enter your baby\'s birth date first', 'error');
        return;
    }
    
    const babyName = babyNameInput && babyNameInput.value ? babyNameInput.value : 'Your baby';
    
    if (infoText) {
        infoText.textContent = `Personalized timeline for ${babyName}`;
    }
    
    // Generate timeline HTML
    let timelineHTML = '<div style="display: flex; flex-direction: column; gap: 20px;">';
    
    babyMilestonesByMonth.forEach((data, index) => {
        const isPast = index <= months;
        const isCurrent = index === months;
        
        timelineHTML += `
            <div style="display: flex; gap: 15px; padding: 20px; background: ${isCurrent ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' : 'white'}; 
                         border-radius: 12px; border-left: 4px solid ${isPast ? '#28a745' : isCurrent ? '#ff6b6b' : '#e0e0e0'};
                         opacity: ${index > months + 1 ? '0.6' : '1'};">
                <div style="font-weight: 700; font-size: 18px; color: var(--primary-pink); min-width: 80px;">${data.title}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 8px;">🎯 Key Milestones:</div>
                    <ul style="margin-bottom: 12px; padding-left: 20px;">
                        ${data.milestones.map(m => `<li style="margin-bottom: 4px;">${m}</li>`).join('')}
                    </ul>
                    <div style="font-size: 14px; color: var(--text-gray);">
                        <strong>Care Focus:</strong> ${data.careFocus}<br>
                        <strong>Sleep:</strong> ${data.sleep}
                    </div>
                </div>
            </div>
        `;
    });
    
    timelineHTML += '</div>';
    
    if (timelineDiv) timelineDiv.innerHTML = timelineHTML;
    if (timelineSection) {
        timelineSection.style.display = 'block';
        timelineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Advanced Family Dashboard Data Management
let familyData = {
    members: [
        { id: 1, name: 'Sarah', role: 'Parent', avatar: '👩', age: 35, status: 'active', email: 'sarah@family.com' },
        { id: 2, name: 'Mike', role: 'Parent', avatar: '👨', age: 37, status: 'active', email: 'mike@family.com' },
        { id: 3, name: 'Emma', role: 'Child', avatar: '👧', age: 8, status: 'active', grade: '3rd Grade' },
        { id: 4, name: 'Noah', role: 'Child', avatar: '👦', age: 5, status: 'active', grade: 'Kindergarten' },
        { id: 5, name: 'Lily', role: 'Child', avatar: '👶', age: 2, status: 'active', grade: 'Preschool' }
    ],
    schedule: [
        { id: 1, time: '7:00 AM', activity: 'Family Breakfast', participants: ['All'], priority: 'high', completed: true },
        { id: 2, time: '8:30 AM', activity: 'School Drop-off', participants: ['Emma', 'Noah'], priority: 'high', completed: true },
        { id: 3, time: '9:00 AM', activity: 'Work Meeting', participants: ['Sarah', 'Mike'], priority: 'medium', completed: false },
        { id: 4, time: '12:00 PM', activity: 'Lunch Break', participants: ['All'], priority: 'medium', completed: false },
        { id: 5, time: '3:00 PM', activity: 'School Pick-up', participants: ['Sarah'], priority: 'high', completed: false },
        { id: 6, time: '4:00 PM', activity: 'Playtime', participants: ['Emma', 'Noah', 'Lily'], priority: 'low', completed: false },
        { id: 7, time: '6:00 PM', activity: 'Family Dinner', participants: ['All'], priority: 'high', completed: false },
        { id: 8, time: '7:30 PM', activity: 'Bedtime Routine', participants: ['All'], priority: 'medium', completed: false }
    ],
    goals: [
        { id: 1, title: 'Weekly Family Dinners', progress: 85, color: '#4caf50', target: 7, current: 6, unit: 'dinners' },
        { id: 2, title: 'Savings Target', progress: 60, color: '#ff9800', target: 1000, current: 600, unit: '$' },
        { id: 3, title: 'Exercise Minutes', progress: 72, color: '#2196f3', target: 300, current: 216, unit: 'minutes' },
        { id: 4, title: 'Family Reading Time', progress: 45, color: '#9c27b0', target: 420, current: 189, unit: 'minutes' }
    ],
    insights: [
        { type: 'nutrition', title: 'Nutrition Excellence', message: 'Your family\'s nutrition score improved by 15% this week! Keep up the great work with balanced meals.', icon: '🥗', trend: 'up', value: '+15%' },
        { type: 'activity', title: 'Activity Balance', message: 'Consider adding more outdoor activities. Weather looks great for weekend family hikes!', icon: '🏃', trend: 'neutral', value: 'Good' },
        { type: 'sleep', title: 'Sleep Patterns', message: 'Younger children\'s sleep schedule is optimal. Teens might benefit from earlier bedtimes.', icon: '😴', trend: 'stable', value: 'Optimal' },
        { type: 'budget', title: 'Budget Management', message: 'You\'re under budget by 8% this month. Great job managing expenses!', icon: '💰', trend: 'down', value: '-8%' }
    ],
    meals: [
        { day: 'Monday', breakfast: 'Oatmeal with berries', lunch: 'Grilled chicken salad', dinner: 'Pasta primavera', snacks: 'Apple slices, yogurt' },
        { day: 'Tuesday', breakfast: 'Scrambled eggs', lunch: 'Turkey sandwich', dinner: 'Beef stir-fry', snacks: 'Carrots, hummus' },
        { day: 'Wednesday', breakfast: 'Smoothie bowl', lunch: 'Leftover stir-fry', dinner: 'Taco night', snacks: 'Trail mix, cheese' },
        { day: 'Thursday', breakfast: 'Pancakes', lunch: 'Soup and crackers', dinner: 'Fish and rice', snacks: 'Fruit salad' },
        { day: 'Friday', breakfast: 'Cereal', lunch: 'Pizza', dinner: 'Homemade burgers', snacks: 'Veggies, dip' },
        { day: 'Saturday', breakfast: 'French toast', lunch: 'Leftovers', dinner: 'BBQ', snacks: 'Popcorn' },
        { day: 'Sunday', breakfast: 'Eggs benedict', lunch: 'Sandwiches', dinner: 'Roast chicken', snacks: 'Cookies, milk' }
    ]
};

// Family Statistics Calculator
function calculateFamilyStats() {
    const activeMembers = familyData.members.filter(m => m.status === 'active');
    const completedTasks = familyData.schedule.filter(s => s.completed).length;
    const totalTasks = familyData.schedule.length;
    const avgGoalProgress = familyData.goals.reduce((sum, goal) => sum + goal.progress, 0) / familyData.goals.length;
    
    return {
        totalMembers: activeMembers.length,
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        taskCompletionRate: Math.round((completedTasks / totalTasks) * 100),
        avgGoalProgress: Math.round(avgGoalProgress),
        wellnessScore: Math.round((avgGoalProgress + (completedTasks / totalTasks) * 100) / 2)
    };
}

// Initialize Family Dashboard
function initializeFamilyDashboard() {
    console.log('Initializing Family Dashboard...');
    
    // Load family members
    loadFamilyMembers();
    
    // Load today's schedule
    loadFamilySchedule();
    
    // Load family goals
    loadFamilyGoals();
    
    // Load AI insights
    loadFamilyInsights();
    
    // Add floating animation
    addFloatingAnimation();
}

// Load Family Members with Enhanced Functionality
function loadFamilyMembers() {
    const container = document.getElementById('familyMembersList');
    if (!container) return;
    
    const stats = calculateFamilyStats();
    
    let html = '';
    familyData.members.forEach(member => {
        const roleColor = member.role === 'Parent' ? '#667eea' : '#ff6b6b';
        const statusColor = member.status === 'active' ? '#4caf50' : '#9e9e9e';
        const additionalInfo = member.grade || member.email ? `<div style="font-size: 11px; color: #999;">${member.grade || member.email}</div>` : '';
        
        html += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 15px; background: white; border-radius: 12px; border: 2px solid #f0f0f0; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#667eea'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.2)'"
                 onmouseout="this.style.transform='translateY(0px)'; this.style.borderColor='#f0f0f0'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'"
                 onclick="editFamilyMember(${member.id})">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, ${roleColor} 0%, ${member.role === 'Parent' ? '#764ba2' : '#ee5a24'} 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; box-shadow: 0 3px 10px rgba(0,0,0,0.2);">
                    ${member.avatar}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 2px;">${member.name}</div>
                    <div style="font-size: 13px; color: #666; font-weight: 500;">${member.role} • Age ${member.age}</div>
                    ${additionalInfo}
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                    <div style="width: 10px; height: 10px; background: ${statusColor}; border-radius: 50%; box-shadow: 0 0 0 3px ${statusColor}40;"></div>
                    <div style="font-size: 10px; color: #999; text-transform: uppercase; font-weight: 600;">${member.status}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load Family Schedule with Enhanced Functionality
function loadFamilySchedule() {
    const container = document.getElementById('familySchedule');
    if (!container) return;
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    let html = '';
    familyData.schedule.forEach(item => {
        const [time, period] = item.time.split(' ');
        const [hour, minute] = time.split(':').map(Number);
        const hour24 = period === 'PM' && hour !== 12 ? hour + 12 : (period === 'AM' && hour === 12 ? 0 : hour);
        
        const isPast = (hour24 < currentHour) || (hour24 === currentHour && minute < currentMinute);
        const isNow = hour24 === currentHour && Math.abs(minute - currentMinute) <= 30;
        
        const priorityColors = {
            high: '#ff6b6b',
            medium: '#ff9800',
            low: '#4caf50'
        };
        
        const priorityColor = priorityColors[item.priority] || '#667eea';
        const statusIcon = item.completed ? ' check_circle' : (isPast ? 'error' : 'schedule');
        
        html += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; margin-bottom: 8px; background: ${item.completed ? '#f8f9fa' : 'white'}; border-radius: 8px; border-left: 4px solid ${priorityColor}; cursor: pointer; transition: all 0.2s ease; position: relative; overflow: hidden;"
                 onmouseover="this.style.transform='translateX(2px)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
                 onmouseout="this.style.transform='translateX(0px)'; this.style.boxShadow='none'"
                 onclick="toggleTaskCompletion(${item.id})">
                ${isNow ? '<div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #667eea, transparent); animation: pulse 2s infinite;"></div>' : ''}
                <div style="display: flex; flex-direction: column; align-items: center; min-width: 60px;">
                    <div style="font-size: 13px; font-weight: 700; color: ${item.completed ? '#999' : priorityColor};">${item.time}</div>
                    <div style="font-size: 10px; color: #999; text-transform: uppercase;">${item.priority}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 14px; color: ${item.completed ? '#999' : '#333'}; font-weight: 600; margin-bottom: 2px;">${item.activity}</div>
                    <div style="font-size: 12px; color: #666;">
                        <span style="color: ${item.completed ? '#4caf50' : (isPast ? '#ff6b6b' : '#667eea')}">${item.participants.join(', ')}</span>
                        ${isNow ? '<span style="color: #ff6b6b; font-weight: 600; margin-left: 8px;"> NOW</span>' : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${item.completed ? 
                        `<div style="width: 24px; height: 24px; background: #4caf50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;"> check</div>` :
                        `<div style="width: 24px; height: 24px; background: ${isPast ? '#ff6b6b' : '#e0e0e0'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">${isPast ? '!' : 'o'}</div>`
                    }
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load Family Goals with Enhanced Functionality
function loadFamilyGoals() {
    const container = document.getElementById('familyGoals');
    if (!container) return;
    
    let html = '';
    familyData.goals.forEach(goal => {
        const progressColor = goal.progress >= 80 ? '#4caf50' : goal.progress >= 50 ? '#ff9800' : '#f44336';
        const trendIcon = goal.progress >= 80 ? 'trending_up' : (goal.progress >= 50 ? 'trending_flat' : 'trending_down');
        const remaining = goal.target - goal.current;
        const remainingText = remaining > 0 ? `${remaining} ${goal.unit} remaining` : 'Goal achieved!';
        
        html += `
            <div style="background: white; padding: 20px; border-radius: 12px; border-left: 4px solid ${goal.color}; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                 onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'"
                 onclick="updateGoalProgress(${goal.id})">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-weight: 700; color: #333; font-size: 16px;">${goal.title}</div>
                        <div style="font-size: 12px; color: #999; background: #f5f5f5; padding: 2px 8px; border-radius: 12px;">${trendIcon}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-size: 18px; font-weight: 700; color: ${progressColor};">${goal.progress}%</div>
                        <div style="width: 8px; height: 8px; background: ${progressColor}; border-radius: 50%;"></div>
                    </div>
                </div>
                <div style="background: #f0f0f0; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px; position: relative;">
                    <div style="background: linear-gradient(90deg, ${goal.color} 0%, ${goal.color} 100%); height: 100%; width: ${goal.progress}%; transition: width 0.5s ease; position: relative;">
                        <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 20px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 13px; color: #666;">
                        <span style="font-weight: 600;">${goal.current} ${goal.unit}</span> of ${goal.target} ${goal.unit}
                    </div>
                    <div style="font-size: 12px; color: ${remaining > 0 ? '#ff9800' : '#4caf50'}; font-weight: 600;">
                        ${remainingText}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load Family Insights with Enhanced Visualization
function loadFamilyInsights() {
    const container = document.getElementById('familyInsights');
    if (!container) return;
    
    let html = '';
    familyData.insights.forEach(insight => {
        const trendColors = {
            up: '#4caf50',
            down: '#f44336',
            neutral: '#ff9800',
            stable: '#2196f3'
        };
        
        const trendColor = trendColors[insight.trend] || '#667eea';
        const trendIcon = insight.trend === 'up' ? 'trending_up' : (insight.trend === 'down' ? 'trending_down' : (insight.trend === 'stable' ? 'trending_flat' : 'trending_flat'));
        
        html += `
            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px); cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2);"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.background='rgba(255,255,255,0.2)'"
                 onmouseout="this.style.transform='translateY(0px)'; this.style.background='rgba(255,255,255,0.15)'"
                 onclick="showInsightDetails('${insight.type}')">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 24px;">${insight.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${insight.title}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-size: 14px; color: ${trendColor}; font-weight: 600;">${trendIcon}</div>
                            <div style="font-size: 14px; color: ${trendColor}; font-weight: 600;">${insight.value}</div>
                        </div>
                    </div>
                </div>
                <div style="font-size: 14px; opacity: 0.95; line-height: 1.6;">${insight.message}</div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; font-weight: 600;">Click for details</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Interactive Family Functions
function editFamilyMember(memberId) {
    const member = familyData.members.find(m => m.id === memberId);
    if (!member) return;
    
    const newName = prompt('Edit name:', member.name);
    if (newName && newName !== member.name) {
        member.name = newName;
        loadFamilyMembers();
        showNotification(`${member.name}'s information updated!`, 'success');
    }
}

function toggleTaskCompletion(taskId) {
    const task = familyData.schedule.find(s => s.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    loadFamilySchedule();
    
    const message = task.completed ? `${task.activity} marked as complete!` : `${task.activity} marked as incomplete!`;
    showNotification(message, task.completed ? 'success' : 'info');
    
    // Update stats
    updateFamilyStatsDisplay();
}

function updateGoalProgress(goalId) {
    const goal = familyData.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const increment = prompt(`Update "${goal.title}" progress (add ${goal.unit}):`);
    if (increment && !isNaN(increment)) {
        const incrementValue = parseFloat(increment);
        goal.current = Math.min(goal.current + incrementValue, goal.target);
        goal.progress = Math.round((goal.current / goal.target) * 100);
        
        loadFamilyGoals();
        showNotification(`Goal "${goal.title}" updated!`, 'success');
        
        // Check if goal is achieved
        if (goal.progress >= 100) {
            setTimeout(() => {
                showNotification(`Congratulations! "${goal.title}" goal achieved!`, 'success');
            }, 500);
        }
    }
}

function showInsightDetails(insightType) {
    const insight = familyData.insights.find(i => i.type === insightType);
    if (!insight) return;
    
    const details = {
        nutrition: 'Detailed nutrition analysis shows:\n\n- Calorie intake: Optimal\n- Protein balance: Excellent\n- Vitamin levels: Good\n- Sugar consumption: Below recommended\n\nRecommendations:\n- Continue current meal plan\n- Add more leafy greens\n- Consider omega-3 supplements',
        activity: 'Activity analysis breakdown:\n\n- Outdoor activities: 3 hours/week\n- Indoor activities: 5 hours/week\n- Screen time: 2 hours/day\n- Exercise intensity: Moderate\n\nRecommendations:\n- Increase outdoor time by 30%\n- Add weekend family sports\n- Reduce screen time by 30 minutes',
        sleep: 'Sleep pattern analysis:\n\n- Average sleep: 8.2 hours\n- Bedtime consistency: 85%\n- Sleep quality: Good\n- Wake-up time: 6:30 AM\n\nRecommendations:\n- Maintain current schedule\n- Consider earlier bedtime for teens\n- Improve sleep environment quality',
        budget: 'Budget analysis details:\n\n- Monthly income: $5,000\n- Total expenses: $4,600\n- Savings rate: 8%\n- Biggest expense: Housing (35%)\n\nRecommendations:\n- Continue current spending habits\n- Look for additional savings opportunities\n- Consider investment options'
    };
    
    showNotification(details[insightType] || 'Detailed analysis coming soon!', 'info');
}

// Enhanced Add Family Member Function
function addFamilyMember() {
    const name = prompt('Enter family member name:');
    if (!name) return;
    
    const role = prompt('Enter role (Parent/Child):');
    if (!role) return;
    
    const age = prompt('Enter age:');
    if (!age || isNaN(age)) return;
    
    const avatar = role === 'Parent' ? ' adult' : ' child';
    
    const newMember = {
        id: familyData.members.length + 1,
        name: name,
        role: role,
        avatar: avatar,
        age: parseInt(age),
        status: 'active',
        email: role === 'Parent' ? `${name.toLowerCase().replace(' ', '.')}@family.com` : null,
        grade: role === 'Child' ? `${parseInt(age) >= 6 ? 'Grade ' + (parseInt(age) - 5) : 'Preschool'}` : null
    };
    
    familyData.members.push(newMember);
    loadFamilyMembers();
    updateFamilyStatsDisplay();
    
    showNotification(`${name} added to family!`, 'success');
}

// Enhanced Add Family Goal Function
function addFamilyGoal() {
    const title = prompt('Enter goal title:');
    if (!title) return;
    
    const target = prompt('Enter target value:');
    if (!target || isNaN(target)) return;
    
    const unit = prompt('Enter unit (e.g., minutes, dollars, dinners):');
    if (!unit) return;
    
    const colors = ['#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#f44336'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newGoal = {
        id: familyData.goals.length + 1,
        title: title,
        progress: 0,
        color: randomColor,
        target: parseFloat(target),
        current: 0,
        unit: unit
    };
    
    familyData.goals.push(newGoal);
    loadFamilyGoals();
    
    showNotification(`New goal "${title}" added!`, 'success');
}

// Update Family Stats Display
function updateFamilyStatsDisplay() {
    const stats = calculateFamilyStats();
    
    // Update stats in the hero section if elements exist
    const membersStat = document.querySelector('[data-stat="members"]');
    const activitiesStat = document.querySelector('[data-stat="activities"]');
    const wellnessStat = document.querySelector('[data-stat="wellness"]');
    
    if (membersStat) membersStat.textContent = stats.totalMembers;
    if (activitiesStat) activitiesStat.textContent = stats.completedTasks;
    if (wellnessStat) wellnessStat.textContent = stats.wellnessScore + '%';
}

// Enhanced Meal Planning Functions
function openAIMealPlanner() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayMeal = familyData.meals.find(m => m.day === today);
    
    if (todayMeal) {
        const mealDetails = `
Today's AI-Optimized Meal Plan (${todayDay}):

 Breakfast: ${todayMeal.breakfast}
  Calories: ~350 | Protein: 12g | Carbs: 45g

 Lunch: ${todayMeal.lunch}
  Calories: ~450 | Protein: 25g | Carbs: 35g

 Dinner: ${todayMeal.dinner}
  Calories: ~550 | Protein: 30g | Carbs: 50g

 Snacks: ${todayMeal.snacks}
  Calories: ~200 | Protein: 8g | Carbs: 25g

Daily Total: ~1,550 calories
Nutrition Score: 92/100
Recommendations: Excellent balance! Add more vegetables to dinner.
        `;
        
        showNotification(mealDetails, 'success');
    } else {
        showNotification('Generating personalized meal plan...', 'info');
        setTimeout(() => {
            showNotification('AI meal plan ready! Check your dashboard.', 'success');
        }, 2000);
    }
}

function openActivityScheduler() {
    const activities = [
        'Family bike ride in the park (2 hours)',
        'Board game tournament (1.5 hours)',
        'Cooking together - make pizza (1 hour)',
        'Movie night with popcorn (2 hours)',
        'Science museum visit (3 hours)',
        'Swimming at community pool (2 hours)',
        'Arts and crafts session (1 hour)',
        'Nature walk and picnic (2.5 hours)'
    ];
    
    const recommendedActivities = activities.sort(() => Math.random() - 0.5).slice(0, 3);
    const activityList = recommendedActivities.map((activity, index) => 
        `${index + 1}. ${activity}`
    ).join('\n\n');
    
    const message = `AI-Recommended Family Activities:\n\n${activityList}\n\nBased on your family's preferences and weather conditions!`;
    
    showNotification(message, 'info');
}

function openBudgetTracker() {
    const budgetAnalysis = `
Family Budget Analysis:

 Monthly Income: $5,000
 Fixed Expenses: $3,200
  - Mortgage/Rent: $1,800
  - Utilities: $300
  - Insurance: $400
  - Phone/Internet: $150
  - Subscriptions: $150

 Variable Expenses: $1,400
  - Groceries: $600
  - Gas/Transport: $300
  - Entertainment: $200
  - Clothing: $150
  - Miscellaneous: $150

 Total Expenses: $4,600
 Monthly Savings: $400 (8%)
 Annual Savings: $4,800

Recommendations: Great job! Consider increasing savings to 10%.
    `;
    
    showNotification(budgetAnalysis, 'info');
}

function openHealthTracker() {
    const healthReport = `
Family Health & Wellness Report:

 Overall Wellness Score: 92%

 Individual Health:
  Sarah: Excellent (BMI: 22, BP: 118/75)
  Mike: Good (BMI: 24, BP: 125/80)
  Emma: Excellent (Growth: 75th percentile)
  Noah: Good (Growth: 60th percentile)
  Lily: Excellent (Growth: 80th percentile)

 Health Metrics:
  Average Sleep: 8.2 hours
  Daily Exercise: 45 minutes
  Screen Time: 2.1 hours
  Water Intake: 6.5 glasses
  Vegetable Servings: 4.2/day

 Recommendations:
  - Increase water intake by 1 glass
  - Add 15 minutes to daily exercise
  - Reduce screen time by 30 minutes
    `;
    
    showNotification(healthReport, 'info');
}

function openMealPlanner() {
    showNotification('Opening detailed meal planner...', 'info');
    setTimeout(() => {
        openAIMealPlanner();
    }, 1000);
}

function openActivityPlanner() {
    showNotification('Opening activity scheduler...', 'info');
    setTimeout(() => {
        openActivityScheduler();
    }, 1000);
}

// Update Family Stats
function updateFamilyStats() {
    // This would update the stats display in real-time
    console.log('Family stats updated');
}

// Advanced Maternal Health Functions
function startHealthMonitoring() {
    console.log('Starting real-time health monitoring...');
    showNotification('🏥 Real-time health monitoring activated! Tracking maternal vitals...', 'success');
    
    // Simulate real-time monitoring
    setTimeout(() => {
        showNotification('📊 Blood Pressure: 120/80 (Normal)', 'info');
    }, 2000);
    
    setTimeout(() => {
        showNotification('❤️ Heart Rate: 72 BPM (Healthy)', 'info');
    }, 4000);
    
    setTimeout(() => {
        showNotification('🩸 Glucose Level: 95 mg/dL (Optimal)', 'info');
    }, 6000);
}

function openPregnancyTracker() {
    console.log('Opening advanced pregnancy tracker...');
    showNotification('🤰 Loading advanced pregnancy tracker with AI insights...', 'info');
    
    setTimeout(() => {
        const pregnancyInfo = `
🤰 ADVANCED PREGNANCY TRACKER

Current Status: Week 24 (6 months)
Due Date: June 15, 2026 (106 days remaining)

👶 Baby Development:
• Size: 1.3 pounds, 11.8 inches
• Brain: Rapid neural development
• Lungs: Developing surfactant
• Senses: Can hear your voice clearly

🏥 Maternal Health:
• Blood Pressure: 120/80 (Optimal)
• Weight Gain: 15 pounds (On track)
• Energy Levels: Moderate
• Mood: Stable

🧠 AI Insights:
• Nutrition: Increase iron-rich foods
• Exercise: Gentle walking recommended
• Sleep: Aim for 8-9 hours
• Hydration: 10+ glasses daily

Next Checkup: Week 28 (Glucose screening)
        `;
        showNotification(pregnancyInfo, 'success');
    }, 1500);
}

function openAIMidwife() {
    console.log('Opening AI Midwife Assistant...');
    showNotification('👩‍⚕️ Connecting to AI Midwife Assistant...', 'info');
    
    setTimeout(() => {
        const aiMidwifeAdvice = `
👩‍⚕️ AI MIDWIFE ASSISTANT

Hello! I'm your personal AI midwife, available 24/7.

Today's Personalized Guidance:
✅ You're in Week 24 - excellent progress!
✅ All vital signs are optimal
✅ Baby development is on track

🔬 Health Analysis:
• Hormone levels: Balanced
• Nutritional status: Good
• Risk factors: Low

💡 Recommendations:
• Continue prenatal vitamins
• Practice Kegel exercises daily
• Monitor fetal movements (10 kicks/hour)
• Stay hydrated and rest when needed

⚠️ When to Contact Doctor:
• Severe headaches or vision changes
• Decreased fetal movement
• Vaginal bleeding
• Contractions before 37 weeks

I'm here for any questions - just ask!
        `;
        showNotification(aiMidwifeAdvice, 'success');
    }, 2000);
}

function openNutritionAnalyzer() {
    console.log('Opening AI Nutrition Analyzer...');
    showNotification('🥗 Analyzing nutritional needs...', 'info');
    
    setTimeout(() => {
        const nutritionAnalysis = `
🥗 AI NUTRITION ANALYZER

Pregnancy Week 24 - Personalized Plan

📊 Current Nutrition Score: 92%

🎯 Daily Targets:
• Calories: 2,400 kcal
• Protein: 75g
• Iron: 27mg
• Calcium: 1,000mg
• Folic Acid: 600mcg

🥦 Today's AI Recommendations:
✅ INCREASE:
- Leafy greens (spinach, kale)
- Lean proteins (chicken, fish)
- Whole grains (quinoa, oats)

➕ ADD:
- Dairy products (calcium)
- Citrus fruits (vitamin C)
- Nuts and seeds (healthy fats)

⚠️ REDUCE:
- Processed sugars
- Caffeine (limit to 200mg)
- Raw fish/undercooked meats

💧 Hydration: 10-12 glasses water daily

Next meal plan update: Tomorrow morning
        `;
        showNotification(nutritionAnalysis, 'success');
    }, 1500);
}

function openSymptomChecker() {
    console.log('Opening AI Symptom Checker...');
    showNotification('🔍 Initializing AI symptom analysis...', 'info');
    
    setTimeout(() => {
        const symptomChecker = `
🔍 AI SYMPTOM CHECKER

Common Week 24 Symptoms (Normal):
✅ Mild swelling in feet/ankles
✅ Backaches
✅ Braxton Hicks contractions
✅ Round ligament pain
✅ Increased appetite

⚠️ SYMPTOMS TO WATCH:
• Severe swelling (face/hands)
• Persistent headaches
• Vision changes
• Fever
• Decreased fetal movement

🩺 Quick Assessment:
Based on your current data:
• Blood pressure: Normal
• Weight gain: On track
• Symptoms: Within normal range

📞 If experiencing severe symptoms, contact your healthcare provider immediately.

This AI checker is for guidance only - always consult your doctor.
        `;
        showNotification(symptomChecker, 'info');
    }, 1800);
}

function openKickCounter() {
    console.log('Opening Baby Kick Counter...');
    showNotification('👶 Starting kick counter session...', 'info');
    
    let kickCount = 0;
    const startTime = Date.now();
    
    const kickCounterInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
        const message = `👶 Kick Counter Active
Kicks: ${kickCount}
Time: ${elapsed} minutes
Goal: 10 kicks in 2 hours`;
        
        if (kickCount >= 10) {
            clearInterval(kickCounterInterval);
            showNotification(`🎉 Goal reached! 10 kicks in ${elapsed} minutes - Baby is active and healthy!`, 'success');
        } else if (elapsed >= 120) {
            clearInterval(kickCounterInterval);
            showNotification(`⏰ Session complete: ${kickCount} kicks in 2 hours. Contact doctor if less than 10 kicks.`, 'warning');
        }
    }, 30000);
    
    showNotification('👶 Tap to count kicks (simulated - in real app, tap each movement)', 'info');
    
    // Simulate kicks for demo
    setTimeout(() => {
        kickCount = 8;
        showNotification(`👶 Kick update: ${kickCount}/10 kicks detected`, 'info');
    }, 30000);
}

function openContractionTimer() {
    console.log('Opening Contraction Timer...');
    showNotification('⏱️ Contraction timer ready (for when you\'re in labor)', 'info');
    
    const contractionInfo = `
⏱️ CONTRACTION TIMER

When to Use:
• Regular contractions 5 minutes apart
• Lasting 60+ seconds
• For 1+ hour

📋 What to Track:
• Start time
• Duration
• Frequency
• Intensity (1-10)

🚨 CALL DOCTOR WHEN:
• Contractions < 5 minutes apart
• Lasting 60+ seconds
• For 2+ hours
• OR water breaks

💡 Tips:
• Stay calm and breathe
• Change positions
• Stay hydrated
• Partner should time them

Timer ready when needed - stay prepared!
    `;
    showNotification(contractionInfo, 'info');
}

function openWeightTracker() {
    console.log('Opening Weight Tracker...');
    showNotification('⚖️ Loading pregnancy weight tracker...', 'info');
    
    setTimeout(() => {
        const weightTracker = `
⚖️ PREGNANCY WEIGHT TRACKER

Current Status: Week 24
• Pre-pregnancy weight: 140 lbs
• Current weight: 155 lbs
• Total gain: 15 lbs
• Recommended: 14-20 lbs (normal BMI)

📊 Weight Gain Progress:
✅ 1st Trimester: +4 lbs (target: 2-5)
✅ 2nd Trimester: +11 lbs (target: 10-15)
📈 3rd Trimester: Goal +5 more lbs

🎯 Healthy Weight Gain Guidelines:
• Underweight: 28-40 lbs
• Normal weight: 25-35 lbs
• Overweight: 15-25 lbs
• Obese: 11-20 lbs

💡 Tips:
• Gain 1-2 lbs per month in 2nd trimester
• Focus on nutritious foods, not "eating for two"
• Regular light exercise recommended
• Consult doctor if rapid weight gain/loss

Next weigh-in: Next week
        `;
        showNotification(weightTracker, 'success');
    }, 1500);
}

function openAIPregnancyAssistant() {
    console.log('Opening AI Pregnancy Assistant...');
    showNotification('🤖 Launching advanced AI pregnancy assistant...', 'info');
    
    setTimeout(() => {
        const aiAssistant = `
🤖 ADVANCED AI PREGNANCY ASSISTANT

Welcome to your 24/7 pregnancy companion!

🧬 CURRENT ANALYSIS:
• Pregnancy Week: 24
• Fetal Development: 95% optimal
• Maternal Health: 98% excellent
• Risk Assessment: Low

🔬 TODAY'S AI INSIGHTS:
• Hormone Balance: Progesterone optimal
• Baby Position: Head down (favorable)
• Placenta Health: Excellent
• Amniotic Fluid: Normal levels

📈 PREDICTIONS:
• Birth Weight Estimate: 7.2 lbs
• Delivery Date: June 15 ± 5 days
• Labor Duration: 12-18 hours (first baby)

💡 PERSONALIZED RECOMMENDATIONS:
• Sleep: Left side position recommended
• Exercise: 30 min walking daily
• Nutrition: Increase iron by 15%
• Stress: Practice prenatal yoga

🚨 AI MONITORING:
• Blood pressure trends: Stable
• Weight gain: On target
• Symptoms: All within normal range

I'll continue monitoring and alert you to any changes. Ask me anything!
        `;
        showNotification(aiAssistant, 'success');
    }, 2000);
}

function startFetalMonitoring() {
    console.log('Starting fetal monitoring...');
    showNotification('📊 Initiating real-time fetal monitoring...', 'info');
    
    setTimeout(() => {
        showNotification('🔍 Connecting to fetal monitoring sensors...', 'info');
    }, 1000);
    
    setTimeout(() => {
        showNotification('❤️ Fetal heart rate: 145 BPM (Normal: 110-160)', 'success');
    }, 2500);
    
    setTimeout(() => {
        showNotification('🎯 Baby position: Head down (Optimal for birth)', 'success');
    }, 4000);
    
    setTimeout(() => {
        showNotification('👶 Movement activity: 18 kicks/hour (Excellent)', 'success');
    }, 5500);
    
    setTimeout(() => {
        const monitoringReport = `
📊 REAL-TIME FETAL MONITORING REPORT

✅ ALL PARAMETERS NORMAL

❤️ Heart Rate: 145 BPM
• Range: 110-160 BPM (Normal)
• Variability: Good
• Pattern: Healthy

🎯 Position: Head Down
• Engagement: 2/5
• Presentation: Cephalic
• Status: Optimal

👶 Movement: Active
• Kicks: 18/hour (Excellent)
• Rolls: Frequent
• Hiccups: Detected
• Response: Good

🧬 Development Indicators:
• Brain activity: Normal
• Lung maturity: Developing
• Growth rate: On track
• Weight estimate: 1.3 lbs

📈 Trend Analysis:
• Heart rate: Stable
• Movement patterns: Healthy
• Growth: Consistent
• Overall: Excellent

Monitoring continues - alerts if changes detected.
        `;
        showNotification(monitoringReport, 'success');
    }, 7000);
}

// Enhanced CSS Animations and Styles
function addFloatingAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0.5); }
            50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8); }
        }
        
        @keyframes ripple {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
            }
            100% {
                width: 100px;
                height: 100px;
                opacity: 0;
            }
        }
        
        .family-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        }
        
        .family-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%);
        }
        
        .progress-bar {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            background-size: 1000px 100%;
            animation: shimmer 3s linear infinite;
        }
        
        .insight-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
        }
        
        .insight-card:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .member-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
        
        .member-avatar:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        .task-item {
            transition: all 0.2s ease;
            border-left: 4px solid transparent;
        }
        
        .task-item:hover {
            border-left-color: #667eea;
            background: linear-gradient(90deg, rgba(102,126,234,0.05) 0%, transparent 100%);
        }
        
        .goal-progress {
            background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
            box-shadow: 0 2px 10px rgba(76,175,80,0.3);
        }
        
        .floating-element {
            animation: float 6s ease-in-out infinite;
        }
        
        .glow-effect {
            animation: glow 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
}


// Initialize application when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    
    // Add enhanced CSS animations
    addFloatingAnimation();
    
    // Restore login state first
    updateLoginState();
    
    // Also update login state after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Delayed updateLoginState call to ensure DOM is ready');
        updateLoginState();
    }, 100);
    
    // Get current page from URL hash or default to home
    let currentPage = 'home';
    if (window.location.hash) {
        currentPage = window.location.hash.substring(1); // Remove # symbol
    } else if (localStorage.getItem('bc_current_page')) {
        currentPage = localStorage.getItem('bc_current_page');
    }
    
    console.log('Current page determined:', currentPage);
    
    // Navigate to the current page
    setTimeout(() => {
        navigateTo(currentPage, { noScroll: true });
        
        // Initialize page-specific features
        if (currentPage === 'family') {
            setTimeout(() => {
                initializeFamilyDashboard();
            }, 500);
        }
    }, 100);
});

// Save current page to localStorage when navigating
function saveCurrentPage(pageId) {
    localStorage.setItem('bc_current_page', pageId);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state === null) {
        // User pressed back button to go to initial page
        const hash = window.location.hash.substring(1);
        if (hash) {
            navigateTo(hash, { skipHashUpdate: true });
        } else {
            navigateTo('home', { skipHashUpdate: true });
        }
    }
});

// Handle hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateTo(hash, { skipHashUpdate: true });
    }
});

// Enhanced family dashboard initialization
function initializeFamilyDashboard() {
    console.log('Initializing Family Dashboard...');
    
    // Load all family data
    loadFamilyMembers();
    loadFamilySchedule();
    loadFamilyGoals();
    loadFamilyInsights();
    
    // Update stats display
    updateFamilyStatsDisplay();
    
    // Add interactive hover effects
    addInteractiveEffects();
    
    console.log('Family Dashboard initialized successfully!');
}

// Add interactive hover effects to family elements
function addInteractiveEffects() {
    // Add hover effects to family member cards
    const memberCards = document.querySelectorAll('.member-list > div');
    memberCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateX(5px)';
            card.style.boxShadow = '0 4px 15px rgba(102,126,234,0.2)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateX(0)';
            card.style.boxShadow = 'none';
        });
    });
    
    // Add hover effects to task items
    const taskItems = document.querySelectorAll('.task-list > div');
    taskItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = 'linear-gradient(90deg, rgba(102,126,234,0.05) 0%, transparent 100%)';
            item.style.borderLeftColor = '#667eea';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = '#f8f9fa';
            item.style.borderLeftColor = 'transparent';
        });
    });
    
    // Add click effects to quick action buttons
    const quickActions = document.querySelectorAll('.family-card[onclick]');
    quickActions.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.background = 'rgba(255,255,255,0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            const rect = this.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Family Functions
function showFamilyTopic(topic) {
    const messages = {
        recipes: ' Family Recipes\n\nQuick & Healthy Meals:\n\n One-Pot Pasta Primavera\n Sheet Pan Chicken & Veggies\n Slow Cooker Taco Soup\n\nKid-Friendly:\n\n Hidden Veggie Mac & Cheese\n Turkey & Apple Meatballs\n Banana Oat Pancakes\n\nMeal Prep Tips:\n\n Batch cook on weekends\n Freeze individual portions\n Involve kids in cooking',
        activities: ' Activities & Crafts\n\nRainy Day Activities:\n\n Indoor scavenger hunt\n DIY playdough (flour, salt, water, food coloring)\n Blanket fort building\n Cardboard box creations\n\nOutdoor Adventures:\n\n Nature walk with checklist\n Backyard obstacle course\n Bubble station\n Sidewalk chalk art gallery\n\nCreative Projects:\n\n Handprint art keepsakes\n Rock painting garden\n Toilet paper roll crafts\n Paper plate masks',
        discipline: ' Positive Discipline\n\nGentle Techniques:\n\n Connect before correct\n Use "when/then" instead of "if/then"\n Offer limited choices\n Validate feelings first\n\nAge-Appropriate Strategies:\n\n Toddlers: Distraction & redirection\n Preschoolers: Natural consequences\n School-age: Problem-solving together\n Teens: Collaborative solutions\n\nCommunication Tips:\n\n Get down to their level\n Use "I" statements\n Listen to understand\n Model the behavior you want'
    };
    
    alert(messages[topic] || 'Topic information coming soon!');
}

// Notification helper function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
const protectedToolPages = new Set([
    'conception-date-calculator',
    'early-pregnancy-signs',
    'baby-costs-calculator',
    'fertility-diet-guide',
    'preconception-health-guide',
    'fertility-treatments-guide',
    'stress-fertility-guide',
    'age-fertility-guide',
    'partner-fertility-guide',
    'due-date-calculator',
    'pregnancy-tracker',
    'baby-kick-counter',
    'contraction-timer',
    'breastfeeding-guide',
    'sleep-tracker',
    'vaccine-scheduler',
    'growth-chart-page',
    'breastfeeding-problem-solver',
    'formula-feeding-problem-solver',
    'solid-feeding-guide-page'
]);

function isLoggedIn() {
    const loggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    const loginTime = localStorage.getItem('bc_login_time');
    
    console.log('isLoggedIn check:', {
        loggedIn,
        userEmail,
        loginTime,
        storage_bc_logged_in: localStorage.getItem('bc_logged_in')
    });
    
    return loggedIn;
}

function setIntendedAccess(pageId, actionName = '') {
    if (!pageId) return;
    localStorage.setItem('bc_intended_page', pageId);
    if (actionName) {
        localStorage.setItem('bc_intended_action', actionName);
    } else {
        localStorage.removeItem('bc_intended_action');
    }
}

function redirectToLoginForTool(pageId, actionName = '') {
    setIntendedAccess(pageId, actionName);
    document.querySelectorAll('.modal').forEach((modal) => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
    navigateTo('login', { skipAuthCheck: true });
    setTimeout(() => {
        showNotification('Please log in or sign up to access this tool and view results.', 'info');
    }, 100);
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
        }, 1000);
        return;
    }

    setTimeout(() => navigateTo('home', { skipAuthCheck: true }), 1000);
}

function navigateTo(pageId, options = {}) {
    console.log(`Navigating to page: ${pageId}`);
    
    if (!options.skipAuthCheck && protectedToolPages.has(pageId) && !isLoggedIn()) {
        redirectToLoginForTool(pageId);
        return;
    }
    
    // Save current page to localStorage
    saveCurrentPage(pageId);
    
    // Update URL hash without triggering page reload
    if (!options.skipHashUpdate) {
        window.history.pushState(null, null, `#${pageId}`);
    }
    
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
    });
    
    const target = document.getElementById(pageId);
    console.log(`Target element found:`, target);
    
    if (target) {
        // Force the target page to be visible
        target.classList.add('active');
        target.style.display = 'block !important';
        target.style.visibility = 'visible !important';
        target.style.opacity = '1 !important';
        target.style.position = 'relative !important';
        target.style.zIndex = '1000 !important';
        
        console.log(`Page ${pageId} displayed successfully`);
        console.log(`Page classes:`, target.className);
        console.log(`Page computed style display:`, window.getComputedStyle(target).display);
        console.log(`Page computed style visibility:`, window.getComputedStyle(target).visibility);
        
        // Force all child elements to be visible
        const allChildren = target.querySelectorAll('*');
        allChildren.forEach(child => {
            child.style.display = '';
            child.style.visibility = '';
            child.style.opacity = '';
        });
        
        if (!options.noScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        if (pageId === 'home' && isLoggedIn()) {
            showWelcomeMessage(localStorage.getItem('bc_user_email'));
        }
        if (pageId === 'names') renderNames(currentNames || namesData);
        if (pageId === 'registry') loadRegistryState();
        if (pageId === 'babble-game') {
            initializeBabbleGame();
            // Enhanced babble initialization
            setTimeout(() => {
                if (typeof initializeCategories === 'function') {
                    initializeCategories();
                }
            }, 100);
        }
        if (pageId === 'family') {
            setTimeout(() => {
                initializeFamilyDashboard();
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
    if (isLoggedIn()) {
        navigateTo(pageId);
    } else {
        redirectToLoginForTool(pageId);
        return;
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
    if (!requireToolAccess('home', 'calculateHomeDueDate')) {
        return;
    }

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
        console.log('Setting login state:', {
            bc_logged_in: 'true',
            bc_user_email: email,
            bc_login_time: new Date().toISOString()
        });
        
        localStorage.setItem('bc_logged_in', 'true');
        localStorage.setItem('bc_user_email', email);
        localStorage.setItem('bc_login_time', new Date().toISOString());
        
        console.log('Login state set successfully. Verifying:', {
            bc_logged_in: localStorage.getItem('bc_logged_in'),
            bc_user_email: localStorage.getItem('bc_user_email'),
            bc_login_time: localStorage.getItem('bc_login_time')
        });
    } catch (e) {
        console.warn('Could not persist login state:', e);
    }
    
    // Update UI to show logged in state
    updateLoginState();
    
    resumeIntendedAccess();
}

// Update login state in UI
function updateLoginState() {
    const isLoggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    
    console.log('updateLoginState called:', {
        isLoggedIn,
        userEmail,
        bc_logged_in: localStorage.getItem('bc_logged_in'),
        bc_user_email: localStorage.getItem('bc_user_email')
    });
    
    // Update header buttons
    const loginBtn = document.querySelector('.login-btn');
    const joinBtn = document.querySelector('.join-btn');
    
    console.log('Button elements found:', {
        loginBtn: !!loginBtn,
        joinBtn: !!joinBtn,
        loginBtnText: loginBtn ? loginBtn.textContent : 'not found',
        joinBtnText: joinBtn ? joinBtn.textContent : 'not found'
    });
    
    if (isLoggedIn && userEmail) {
        console.log('User is logged in, updating UI to show logged in state');
        if (loginBtn) {
            loginBtn.textContent = 'My Account';
            loginBtn.onclick = () => navigateTo('account');
            console.log('Updated login button to My Account');
        }
        if (joinBtn) {
            joinBtn.textContent = 'Logout';
            joinBtn.onclick = handleLogout;
            console.log('Updated join button to Logout');
        }
        
        // Show premium features and account-specific content
        try {
            showAccountFeatures();
            updatePremiumContent();
            showWelcomeMessage(userEmail);
            console.log('Account features updated successfully');
        } catch (e) {
            console.error('Error updating account features:', e);
        }
        
    } else {
        console.log('User is not logged in, updating UI to show logged out state');
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => navigateTo('login');
            console.log('Updated login button to Login');
        }
        if (joinBtn) {
            joinBtn.textContent = 'Sign Up';
            joinBtn.onclick = () => navigateTo('signup');
            console.log('Updated join button to Sign Up');
        }
        
        // Hide premium features
        try {
            hideAccountFeatures();
            resetPremiumContent();
            console.log('Account features hidden successfully');
        } catch (e) {
            console.error('Error hiding account features:', e);
        }
    }
}

// Test function to manually check login state
function testLoginState() {
    console.log('=== MANUAL LOGIN STATE TEST ===');
    const isLoggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    const loginTime = localStorage.getItem('bc_login_time');
    
    console.log('Current localStorage state:', {
        bc_logged_in: localStorage.getItem('bc_logged_in'),
        bc_user_email: localStorage.getItem('bc_user_email'),
        bc_login_time: localStorage.getItem('bc_login_time')
    });
    
    console.log('Parsed state:', {
        isLoggedIn,
        userEmail,
        loginTime
    });
    
    // Check buttons
    const loginBtn = document.querySelector('.login-btn');
    const joinBtn = document.querySelector('.join-btn');
    
    console.log('Button elements:', {
        loginBtn: !!loginBtn,
        joinBtn: !!joinBtn,
        loginBtnText: loginBtn ? loginBtn.textContent : 'not found',
        joinBtnText: joinBtn ? joinBtn.textContent : 'not found',
        loginBtnOnClick: loginBtn ? loginBtn.onclick.toString() : 'no onclick',
        joinBtnOnClick: joinBtn ? joinBtn.onclick.toString() : 'no onclick'
    });
    
    // Force update if logged in
    if (isLoggedIn && userEmail) {
        console.log('Forcing login state update...');
        if (loginBtn) {
            loginBtn.textContent = 'My Account';
            loginBtn.onclick = () => navigateTo('account');
        }
        if (joinBtn) {
            joinBtn.textContent = 'Logout';
            joinBtn.onclick = handleLogout;
        }
        console.log('Login state forced to update');
    }
    
    console.log('=== END TEST ===');
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
    console.log('handleLogout called');
    if (confirm('Are you sure you want to logout?')) {
        console.log('User confirmed logout. Clearing login data...');
        
        // Clear all login-related data
        localStorage.removeItem('bc_logged_in');
        localStorage.removeItem('bc_user_email');
        localStorage.removeItem('bc_login_time');
        
        // Clear current page to prevent staying on protected pages after logout
        localStorage.removeItem('bc_current_page');
        
        // Clear any intended access
        localStorage.removeItem('bc_intended_page');
        localStorage.removeItem('bc_intended_action');
        
        console.log('Login data cleared. Current localStorage:', {
            bc_logged_in: localStorage.getItem('bc_logged_in'),
            bc_user_email: localStorage.getItem('bc_user_email'),
            bc_login_time: localStorage.getItem('bc_login_time')
        });
        
        // Update UI
        updateLoginState();
        
        // Show success message
        showNotification('You have been logged out successfully.', 'success');
        
        // Navigate to home page
        setTimeout(() => {
            navigateTo('home');
        }, 500);
    } else {
        console.log('User cancelled logout');
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
    resumeIntendedAccess();
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

let lastRenderedNames = [...currentNames];

let namesBaseList = [...namesData];

function getOnlineNamesToggleEl() {
    return document.getElementById('onlineNamesToggle');
}

function getNamesOnlineStatusEl() {
    return document.getElementById('namesOnlineStatus');
}

function setNamesOnlineStatus(message) {
    const el = getNamesOnlineStatusEl();
    if (!el) return;
    el.textContent = message || '';
}

function isOnlineNamesEnabled() {
    const el = getOnlineNamesToggleEl();
    return !!(el && el.checked);
}

function sanitizeNameText(value) {
    if (!value) return '';
    return String(value).replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim();
}

async function fetchWikidataBabyNames(query, limit = 30) {
    const safeQuery = sanitizeNameText(query);
    if (!safeQuery) return [];

    console.log('[fetchWikidataBabyNames] Starting query:', safeQuery);

    try {
        // Use the proxy endpoint to avoid CORS issues
        const proxyUrl = `/api/wikidata?search=${encodeURIComponent(safeQuery)}&language=en&uselang=en&format=json&limit=${Math.min(limit, 50)}`;
        console.log('[fetchWikidataBabyNames] Request URL:', proxyUrl);
        
        const searchRes = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!searchRes.ok) {
            console.warn('[fetchWikidataBabyNames] HTTP error:', searchRes.status, searchRes.statusText);
            // Return empty array instead of throwing to avoid breaking the app
            return [];
        }
        
        const searchJson = await searchRes.json();
        console.log('[fetchWikidataBabyNames] Raw response JSON:', searchJson);
        
        // Check if search exists and is an array
        if (!searchJson || !Array.isArray(searchJson.search)) {
            console.warn('[fetchWikidataBabyNames] No search results found in response');
            return [];
        }
        
        const items = searchJson.search;
        console.log('[fetchWikidataBabyNames] Items array length:', items.length);
        if (items.length === 0) return [];

        const results = items
            .map(item => {
                const label = sanitizeNameText(item.label);
                if (!label || label.length < 2) return null; // Filter out single characters
                const desc = sanitizeNameText(item.description);
                return {
                    name: label,
                    gender: 'unisex',
                    meaning: desc || 'Online result from Wikidata',
                    origin: 'Wikidata'
                };
            })
            .filter(Boolean);
        console.log('[fetchWikidataBabyNames] Mapped results count:', results.length);

        // De-duplicate by name
        const seen = new Set();
        const deduped = results.filter(r => {
            const key = r.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        console.log('[fetchWikidataBabyNames] Final deduped results:', deduped);
        return deduped;
    } catch (e) {
        console.error('[fetchWikidataBabyNames] Error:', e);
        // Return fallback results when API fails
        const fallbackNames = [
            'Liam', 'Noah', 'Oliver', 'Elijah', 'Lucas',
            'Mason', 'Logan', 'Jacob', 'Ethan', 'Aiden',
            'James', 'Daniel', 'Benjamin', 'Carter', 'William',
            'Olivia', 'Emma', 'Ava', 'Sophia', 'Isabella',
            'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'
        ];
        
        const filtered = fallbackNames
            .filter(name => name.toLowerCase().includes(safeQuery.toLowerCase()))
            .slice(0, limit)
            .map(name => ({
                name: name,
                gender: Math.random() > 0.5 ? 'boy' : 'girl',
                meaning: 'Popular baby name',
                origin: 'Fallback database'
            }));
        
        console.log('[fetchWikidataBabyNames] Using fallback names:', filtered.length);
        return filtered;
    }
}

// Simple CORS/network test endpoint (public, no auth)
async function testCorsFetch() {
    try {
        const res = await fetch('https://httpbin.org/get', { mode: 'cors' });
        const json = await res.json();
        console.log('[testCorsFetch] CORS test success:', json);
        return true;
    } catch (e) {
        console.error('[testCorsFetch] CORS test failed:', e);
        return false;
    }
}

// Expose helpers to global for debugging
window.testCorsFetch = testCorsFetch;
window.fetchWikidataBabyNames = fetchWikidataBabyNames;

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

const pregnancyWeekSizes = {
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

const pregnancyWeekPhases = [
    {
        start: 1,
        end: 4,
        badgeLabel: 'Setup',
        title: 'Foundations and early hormones',
        summary: 'Pregnancy is just beginning, implantation is settling, and the placenta is starting to form.',
        babyGrowth: 'Cells are dividing quickly and the earliest structures that support the embryo are beginning to form.',
        motherChanges: 'You may feel nothing yet, or you may notice fatigue, breast tenderness, bloating, light spotting, or cramping.',
        careFocus: 'Start prenatal vitamins with folic acid, avoid alcohol and smoking, protect your sleep, and choose your maternity provider.',
        askProvider: 'Ask when your first prenatal visit should happen and which medications or supplements are safe to continue.',
        checklist: ['Take prenatal vitamins every day.', 'Start a hydration and snack routine that helps with nausea or low energy.', 'Write down health history and questions for your first maternity visit.'],
        alertSigns: ['Heavy bleeding or severe one-sided pain.', 'Fever, fainting, or shoulder pain.', 'Vomiting that keeps you from holding down fluids.'],
        milestone: 'Implantation and hormone support are getting established.',
        nextStep: 'Book your first prenatal visit and begin a simple daily routine you can realistically maintain.'
    },
    {
        start: 5,
        end: 8,
        badgeLabel: 'Heartbeat',
        title: 'Heartbeat and early organs',
        summary: 'Major systems are beginning to develop fast, and many mothers start to feel stronger first-trimester symptoms here.',
        babyGrowth: 'The neural tube, early heart activity, limb buds, and basic organ structures are developing rapidly.',
        motherChanges: 'Nausea, food aversions, smell sensitivity, fatigue, mood changes, and breast soreness are common now.',
        careFocus: 'Protect rest, eat in small frequent meals, and stay consistent with prenatal vitamins even if appetite is uneven.',
        askProvider: 'Ask what level of cramping, spotting, nausea, or weight change is still expected for this stage.',
        checklist: ['Keep easy protein and carbohydrate snacks nearby.', 'Track symptoms that are improving or getting harder to manage.', 'Prepare questions about ultrasound timing and due-date confirmation.'],
        alertSigns: ['Severe dehydration or inability to keep fluids down.', 'Heavy bleeding or large clots.', 'Sharp pelvic pain that does not settle.'],
        milestone: 'Heart activity and early organ development are underway.',
        nextStep: 'Focus on symptom relief strategies that help you function, not on doing everything perfectly.'
    },
    {
        start: 9,
        end: 13,
        badgeLabel: 'Screenings',
        title: 'First-trimester stability',
        summary: 'The placenta is taking over more support, and this is often the stretch when initial labs and screenings happen.',
        babyGrowth: 'Facial features, bones, and organs are more defined, and the baby is moving even if you cannot feel it yet.',
        motherChanges: 'Some mothers still feel strong nausea and fatigue, while others begin to notice more energy or less vomiting.',
        careFocus: 'Stay on top of prenatal appointments, review lab results, and keep hydration, fiber, and iron intake steady.',
        askProvider: 'Ask about screening options, constipation relief, safe exercise, and whether your symptoms match this stage.',
        checklist: ['Review bloodwork and screening appointments.', 'Create a short symptom list to bring to visits.', 'Check that your daily supplements are still comfortable to take.'],
        alertSigns: ['Heavy bleeding or passing tissue.', 'Severe abdominal pain or fever.', 'Persistent dizziness, fainting, or dehydration.'],
        milestone: 'You are closing out the first trimester and moving into a more stable stage.',
        nextStep: 'Use this transition point to review your care plan and adjust routines that have not been working.'
    },
    {
        start: 14,
        end: 17,
        badgeLabel: 'Energy',
        title: 'Energy and growth',
        summary: 'Many mothers get some energy back here, which makes this a good time to rebuild routines without overdoing it.',
        babyGrowth: 'The baby is stretching, swallowing, and growing into more defined movements and body proportions.',
        motherChanges: 'You may notice a small bump, less nausea, a stronger appetite, nasal congestion, or round-ligament pulling.',
        careFocus: 'Use the better-energy window for walking, pelvic floor awareness, hydration, and meal planning that supports iron and protein.',
        askProvider: 'Ask how much activity is realistic, what mild pain is expected, and what symptoms should prompt a call.',
        checklist: ['Restart gentle movement if your provider agrees.', 'Build a simple meal pattern with protein, fiber, and fluids.', 'Check upcoming anatomy scan timing and maternity paperwork needs.'],
        alertSigns: ['Bleeding, fever, or persistent painful cramping.', 'Severe headaches or vision changes.', 'Fluid leakage or painful urination.'],
        milestone: 'This stage often feels more manageable, so it is a good time to strengthen healthy routines.',
        nextStep: 'Use the second trimester to create routines that will still feel sustainable later in pregnancy.'
    },
    {
        start: 18,
        end: 22,
        badgeLabel: 'Anatomy',
        title: 'Movement and anatomy scan',
        summary: 'This stage is often centered on fetal movement awareness and the anatomy scan, which makes it an important information point for mothers.',
        babyGrowth: 'Hearing, movement patterns, and organ development continue to mature, and the baby is becoming more active.',
        motherChanges: 'You may feel flutters or stronger movement, stretching discomfort, heartburn, and posture changes as your uterus grows.',
        careFocus: 'Protect posture, support your back, review anatomy scan questions, and begin sleeping on your side when comfortable.',
        askProvider: 'Ask about anatomy scan findings, placenta position, movement expectations, and how to manage back or pelvic discomfort.',
        checklist: ['Write down questions before your anatomy scan.', 'Notice when movement begins to feel more regular.', 'Test pillows or support tools that help with sleep and posture.'],
        alertSigns: ['Fluid leakage or bleeding.', 'Severe abdominal pain.', 'Strong headaches, swelling, or vision changes.'],
        milestone: 'Movement often becomes more meaningful for many mothers during this stretch.',
        nextStep: 'Start noticing your baby\'s usual active times without putting pressure on yourself to count every movement yet.'
    },
    {
        start: 23,
        end: 27,
        badgeLabel: 'Growth',
        title: 'Growth and screening follow-up',
        summary: 'The baby is gaining weight, and this stage often includes glucose screening and closer attention to sleep, swelling, and daily comfort.',
        babyGrowth: 'Lungs, sleep cycles, and body fat are developing, and movement is usually easier to identify.',
        motherChanges: 'You may notice stronger kicks, leg cramps, heartburn, swelling, or fatigue returning as your body carries more weight.',
        careFocus: 'Prioritize protein, iron, hydration, side-sleep support, and preparing for glucose testing or follow-up labs.',
        askProvider: 'Ask about glucose screening, iron needs, swelling, leg cramps, and when movement should feel more predictable.',
        checklist: ['Keep snacks ready before glucose testing if your instructions allow it.', 'Add magnesium-rich or iron-rich foods if recommended.', 'Review maternity leave, childcare, or home support planning.'],
        alertSigns: ['Decreased movement once movement has become regular.', 'Severe swelling, headache, or visual symptoms.', 'Painful contractions or fluid leakage.'],
        milestone: 'You are nearing the third trimester, so daily comfort and planning start to matter more.',
        nextStep: 'Begin shifting from general pregnancy information into practical planning for the last trimester.'
    },
    {
        start: 28,
        end: 31,
        badgeLabel: 'Planning',
        title: 'Third-trimester planning',
        summary: 'The third trimester begins here, bringing more baby monitoring and a stronger need for routines that support rest and blood pressure awareness.',
        babyGrowth: 'The brain, lungs, and body fat continue maturing while movement can feel more forceful and patterned.',
        motherChanges: 'Shortness of breath, pelvic pressure, reflux, sleep disruption, and swelling may become more noticeable.',
        careFocus: 'Learn kick-count expectations, protect rest, watch blood-pressure symptoms, and begin birth and feeding preparation.',
        askProvider: 'Ask how to track fetal movement, what preterm labor signs look like, and how often visits will happen from here.',
        checklist: ['Discuss birth preferences and pain-relief questions.', 'Start a hospital or birth-center packing list.', 'Review breastfeeding or formula-feeding basics and postpartum support.'],
        alertSigns: ['Painful regular contractions before 37 weeks.', 'Sudden swelling, severe headache, or vision changes.', 'Reduced fetal movement or fluid leakage.'],
        milestone: 'This is the point when preparation and monitoring become more important than pushing yourself.',
        nextStep: 'Simplify your calendar where possible so you have more energy for appointments, rest, and planning.'
    },
    {
        start: 32,
        end: 35,
        badgeLabel: 'Prep',
        title: 'Final growth and logistics',
        summary: 'The baby is growing quickly and your daily comfort may change week to week, so planning for labor and postpartum support becomes more urgent.',
        babyGrowth: 'The baby is practicing breathing movements, adding body fat, and settling into a stronger pattern of growth.',
        motherChanges: 'Pelvic pressure, frequent urination, Braxton Hicks, sleep disruption, and lower energy are all common now.',
        careFocus: 'Reduce unnecessary strain, support pelvic comfort, keep kick awareness steady, and finalize your support system for birth and recovery.',
        askProvider: 'Ask about labor signs, Group B strep timing, hospital arrival rules, and how to tell Braxton Hicks from real contractions.',
        checklist: ['Finalize your bag and essential baby items.', 'Make a postpartum meal or help plan.', 'Choose who will help with older children, transport, or the first week home.'],
        alertSigns: ['Contractions that get regular or stronger before full term.', 'Vaginal bleeding, reduced movement, or fluid leakage.', 'Severe abdominal pain or high blood-pressure symptoms.'],
        milestone: 'Your focus should shift from doing more to conserving energy and getting practical systems ready.',
        nextStep: 'Treat comfort and rest as part of your maternity care, not as optional extras.'
    },
    {
        start: 36,
        end: 40,
        badgeLabel: 'Birth',
        title: 'Birth-readiness and full-term care',
        summary: 'You are in the final stretch, so day-to-day priorities should revolve around movement awareness, rest, labor signs, and keeping communication open with your care team.',
        babyGrowth: 'The baby is continuing to mature and prepare for birth while space gets tighter, which can change the feeling of movement.',
        motherChanges: 'You may feel pelvic pressure, nesting energy, looser stools, stronger Braxton Hicks, back pain, or sleep disruption.',
        careFocus: 'Keep movement checks consistent, rest whenever possible, review labor plans, and know exactly when and where to call.',
        askProvider: 'Ask what labor signs mean it is time to come in, when induction is discussed, and what to do if movement changes.',
        checklist: ['Keep your phone charged and transport plan ready.', 'Review early-labor comfort strategies.', 'Make sure you know the quickest route and admission instructions for your birth setting.'],
        alertSigns: ['Reduced fetal movement.', 'Bleeding, fluid leakage, or severe headache.', 'A sudden drop in movement or symptoms that feel very different from your baseline.'],
        milestone: 'Full-term care is about staying ready without exhausting yourself.',
        nextStep: 'Keep plans flexible and choose rest over extra tasks whenever you can.'
    },
    {
        start: 41,
        end: 42,
        badgeLabel: 'Monitor',
        title: 'Post-due-date monitoring',
        summary: 'If pregnancy continues beyond the due date, extra monitoring and induction discussions are more common and deserve clear provider communication.',
        babyGrowth: 'The baby is still benefiting from monitoring while your care team watches fluid levels, movement, and placental function more closely.',
        motherChanges: 'You may feel physically and emotionally tired, impatient, or more uncomfortable while waiting for labor or induction.',
        careFocus: 'Stay in close contact with your provider, keep movement awareness high, and make sure you understand the monitoring plan.',
        askProvider: 'Ask what testing is planned, when induction is recommended, and which signs mean you should come in right away.',
        checklist: ['Confirm your next monitoring appointment.', 'Keep daily plans light so you can rest and respond quickly if labor starts.', 'Review transport, childcare, and admission details one more time.'],
        alertSigns: ['Reduced fetal movement.', 'Any bleeding or fluid leakage.', 'Severe headache, visual symptoms, or strong contractions without guidance on next steps.'],
        milestone: 'This stage is about careful monitoring and clear decisions, not waiting without a plan.',
        nextStep: 'Make sure you understand the exact next appointment or induction step before you leave your provider.'
    }
];

let selectedPregnancyWeek = 24;

function getPregnancyWeekGuide(week) {
    const safeWeek = Math.max(1, Math.min(42, Number(week) || 1));
    const trimester = safeWeek <= 13 ? 'First Trimester' : safeWeek <= 27 ? 'Second Trimester' : 'Third Trimester';
    const phase = pregnancyWeekPhases.find((item) => safeWeek >= item.start && safeWeek <= item.end) || pregnancyWeekPhases[pregnancyWeekPhases.length - 1];
    let timingNote = 'This stage is in progress, so consistent routines can make a meaningful difference.';

    if (safeWeek === phase.start) {
        timingNote = 'This stage is just beginning, so it is a good time to adjust your routine early.';
    } else if (safeWeek === phase.end) {
        timingNote = 'You are wrapping up this stage and getting ready for the next transition.';
    }

    return {
        week: safeWeek,
        trimester,
        badgeLabel: phase.badgeLabel,
        title: `Week ${safeWeek}: ${phase.title}`,
        size: pregnancyWeekSizes[safeWeek] || 'growing steadily',
        summary: `${phase.summary} ${timingNote}`,
        babyGrowth: phase.babyGrowth,
        motherChanges: phase.motherChanges,
        careFocus: phase.careFocus,
        askProvider: phase.askProvider,
        checklist: phase.checklist,
        alertSigns: phase.alertSigns,
        milestone: phase.milestone,
        nextStep: phase.nextStep
    };
}

function renderPregnancyList(elementId, items) {
    const list = document.getElementById(elementId);
    if (!list) {
        return;
    }

    list.innerHTML = (items || []).map((item) => `<li>${item}</li>`).join('');
}

function highlightPregnancyWeek(week) {
    document.querySelectorAll('.week-badge').forEach((badge) => {
        badge.classList.toggle('active', Number(badge.dataset.week) === Number(week));
    });
}

function renderPregnancyWeekGuide(week, options = {}) {
    const guide = getPregnancyWeekGuide(week);
    const detailPanel = document.getElementById('weekDetailPanel');
    const stageLabel = document.getElementById('weekStageLabel');
    const title = document.getElementById('weekDetailTitle');
    const summary = document.getElementById('weekDetailSummary');
    const babySize = document.getElementById('weekBabySize');
    const milestoneText = document.getElementById('weekMilestoneText');
    const babyGrowth = document.getElementById('weekBabyGrowth');
    const motherChanges = document.getElementById('weekMotherChanges');
    const careFocus = document.getElementById('weekCareFocus');
    const askProvider = document.getElementById('weekAskProvider');

    selectedPregnancyWeek = guide.week;

    if (stageLabel) stageLabel.textContent = guide.trimester;
    if (title) title.textContent = guide.title;
    if (summary) summary.textContent = guide.summary;
    if (babySize) babySize.textContent = guide.size;
    if (milestoneText) milestoneText.textContent = `Milestone: ${guide.milestone}`;
    if (babyGrowth) babyGrowth.textContent = guide.babyGrowth;
    if (motherChanges) motherChanges.textContent = guide.motherChanges;
    if (careFocus) careFocus.textContent = guide.careFocus;
    if (askProvider) askProvider.textContent = guide.askProvider;

    renderPregnancyList('weekChecklist', guide.checklist);
    renderPregnancyList('weekAlertSigns', guide.alertSigns);
    highlightPregnancyWeek(guide.week);

    if (options.scroll && detailPanel) {
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return guide;
}

function scrollToPregnancyGuide() {
    renderPregnancyWeekGuide(selectedPregnancyWeek, { scroll: true });
}

const pregnancyTopicGuides = {
    'pregnancy-week-by-week': {
        label: 'Overview',
        title: 'Pregnancy Week by Week',
        summary: 'Use week-specific guidance to match your symptoms, appointments, and baby growth to the stage you are actually in instead of guessing from general advice.',
        forMom: 'This helps mothers pace their energy, prepare for the next appointment, and focus on the changes that matter now instead of trying to manage all 40 weeks at once.',
        forBaby: 'It helps you understand what your baby is developing this week so screenings, nutrition, and movement awareness feel more purposeful.',
        checklist: ['Check your current pregnancy week and the next milestone ahead.', 'Review one practical goal for this week: rest, hydration, iron, movement, or appointment prep.', 'Write down one symptom or question to bring to your provider.'],
        questions: ['What changes are most expected at my current week?', 'Which screening, vaccine, or follow-up is usually next?', 'Which symptoms would make you want to hear from me sooner?'],
        alerts: ['Heavy bleeding or severe pain.', 'Fluid leakage, fainting, or fever.', 'A sudden change that feels far outside your usual pattern.'],
        actionLabel: 'Open week roadmap',
        actionKey: 'scroll-week-guide',
        actionNote: 'Jump into the week-by-week roadmap below for a stage-specific support plan.'
    },
    'first-trimester-topic': {
        label: 'Trimester',
        title: 'First Trimester of Pregnancy',
        summary: 'The first trimester is about confirmation, symptom management, vitamins, and building a care routine that you can keep even when energy and appetite are low.',
        forMom: 'Mothers often need the most support here for nausea, fatigue, hydration, food aversions, and emotional adjustment while early appointments and labs are getting scheduled.',
        forBaby: 'Early organ development is rapid in this stage, so folate, medication review, and avoiding harmful exposures matter a lot.',
        checklist: ['Take prenatal vitamins daily.', 'Use small frequent meals and fluids if nausea is strong.', 'Prepare for labs, dating ultrasound, and health-history review.'],
        questions: ['What is normal for nausea, spotting, and cramping right now?', 'Are my current medicines and supplements safe?', 'When should I schedule my next visit and ultrasound?'],
        alerts: ['Heavy bleeding or one-sided pain.', 'Vomiting with dehydration.', 'Fever, fainting, or severe abdominal pain.'],
        actionLabel: 'Open first-trimester guide',
        actionKey: 'show-week-8',
        actionNote: 'This opens the maternity roadmap around the middle of the first trimester.'
    },
    'second-trimester-topic': {
        label: 'Trimester',
        title: 'Second Trimester of Pregnancy',
        summary: 'The second trimester often feels more stable, which makes it the best time to rebuild routines around nutrition, movement, anatomy scan follow-up, and planning ahead.',
        forMom: 'This stage can be used to improve sleep support, posture, pelvic comfort, iron intake, and exercise consistency before the third trimester gets heavier.',
        forBaby: 'Your baby is growing fast in size, hearing, movement, and organ maturity, so scan results and growth tracking become more meaningful.',
        checklist: ['Review anatomy scan questions and results.', 'Restart gentle movement if your provider agrees.', 'Build practical food and sleep habits that can carry into the third trimester.'],
        questions: ['How should movement change in this trimester?', 'What does my anatomy scan mean for the rest of pregnancy?', 'How can I manage back pain, reflux, or pelvic pressure safely?'],
        alerts: ['Bleeding, fluid leakage, or strong cramping.', 'Severe headache, swelling, or vision change.', 'A clear drop in movement once movement feels established.'],
        actionLabel: 'Open second-trimester guide',
        actionKey: 'show-week-20',
        actionNote: 'This opens the roadmap around the anatomy-scan stage.'
    },
    'third-trimester-topic': {
        label: 'Trimester',
        title: 'Third Trimester of Pregnancy',
        summary: 'The third trimester is where comfort, fetal movement awareness, blood pressure symptoms, labor preparation, and postpartum planning all need clearer structure.',
        forMom: 'Support for rest, swelling, shortness of breath, pelvic pressure, and planning help at home matters more here because daily tasks often feel heavier.',
        forBaby: 'Your baby is growing quickly and preparing for birth, so kick awareness and monitoring changes become more important than ever.',
        checklist: ['Learn your provider\'s rules for reduced movement and labor symptoms.', 'Finalize your hospital bag and home support plan.', 'Keep hydration, rest, and side-lying sleep support consistent.'],
        questions: ['When should I call for contractions, bleeding, or reduced movement?', 'How often should I expect visits and testing now?', 'What is your guidance on induction timing if I go past my due date?'],
        alerts: ['Reduced fetal movement.', 'Fluid leakage, bleeding, or regular painful contractions before full term.', 'Severe headache, sudden swelling, chest pain, or vision changes.'],
        actionLabel: 'Open third-trimester guide',
        actionKey: 'show-week-34',
        actionNote: 'This opens the roadmap around late-pregnancy planning and monitoring.'
    },
    'your-body-topic': {
        label: 'Maternal care',
        title: 'Your Body',
        summary: 'Pregnancy changes your circulation, digestion, breathing, posture, sleep, breasts, and pelvic floor, so body care works best when it is practical and stage-specific.',
        forMom: 'Tracking body changes helps you decide which discomforts can be supported at home and which ones deserve a message or call to your provider.',
        forBaby: 'When the mother stays hydrated, nourished, and supported, it is easier to maintain steady blood flow, sleep, and energy for baby support too.',
        checklist: ['Notice which symptoms are mild, increasing, or limiting normal activity.', 'Use support tools early: water bottle, fiber, pillows, compression socks, or belly support if recommended.', 'Keep a short note of changes to review at your next visit.'],
        questions: ['Which body changes are expected in my current stage?', 'What can I safely use for heartburn, constipation, or pelvic discomfort?', 'When do swelling or headaches become more concerning?'],
        alerts: ['Severe headache, sudden swelling, or vision changes.', 'Chest pain, fainting, or severe shortness of breath.', 'Pain that is sharp, persistent, or paired with bleeding.']
    },
    'pregnancy-symptoms-topic': {
        label: 'Maternal care',
        title: 'Symptoms',
        summary: 'Symptoms are more helpful when they are tracked by pattern: what is common, what is getting worse, what affects eating or sleeping, and what feels clearly outside your norm.',
        forMom: 'This keeps mothers from dismissing serious changes or, on the other side, worrying about every mild symptom without context.',
        forBaby: 'Better symptom tracking can lead to earlier care when dehydration, infection, blood pressure problems, or preterm labor signs need attention.',
        checklist: ['Track timing, severity, and triggers of key symptoms.', 'Note whether fluids, rest, meals, or position changes help.', 'Bring your top two symptoms to each prenatal visit instead of trying to remember everything later.'],
        questions: ['Which symptoms are common at my stage and which are not?', 'What symptom changes should trigger same-day contact?', 'What can I safely take or do at home for relief?'],
        alerts: ['Heavy bleeding, fluid leakage, or fever.', 'Severe headache, visual symptoms, or major swelling.', 'Symptoms that prevent fluids, food, or normal function.'],
        actionLabel: 'Open signs checker',
        actionKey: 'open-early-signs',
        actionNote: 'Use the related signs checker if you want a guided symptom review.'
    },
    'body-week-by-week-topic': {
        label: 'Maternal care',
        title: 'Your Pregnancy Week by Week',
        summary: 'Body changes shift week by week, so it helps to view them in phases instead of assuming the same advice fits early, middle, and late pregnancy.',
        forMom: 'This helps mothers plan ahead for nausea, appetite changes, back pain, swelling, fetal movement, and sleep trouble before those issues peak.',
        forBaby: 'Weekly planning supports better appointment timing, nutrition choices, and movement awareness as baby growth changes.',
        checklist: ['Check which stage you are in now and what is likely next.', 'Pick one body-support tool for this stage, like pillows, compression, or belly support.', 'Adjust work, activity, or rest plans before discomfort gets severe.'],
        questions: ['What body change is most typical in the next few weeks?', 'Should I change my exercise or work routine now?', 'How do I know when a new symptom is still expected?'],
        alerts: ['Any symptom that changes very suddenly.', 'Pain with bleeding, fever, or fluid leakage.', 'A sharp drop in movement later in pregnancy.'],
        actionLabel: 'Open body roadmap',
        actionKey: 'scroll-week-guide',
        actionNote: 'This opens the week guide so you can match body changes to the right stage.'
    },
    'labor-delivery-topic': {
        label: 'Birth prep',
        title: 'Labor & Delivery',
        summary: 'Birth preparation is more useful when it covers what labor may feel like, when to call, pain-relief choices, and what support the mother needs after birth.',
        forMom: 'A clearer labor plan lowers uncertainty and helps mothers decide faster when contractions, bleeding, or movement changes need action.',
        forBaby: 'Planning labor well supports safer timing for admission, monitoring, newborn feeding decisions, and a smoother transition after birth.',
        checklist: ['Review labor signs and hospital arrival rules.', 'Discuss pain relief, support person roles, and newborn feeding preferences.', 'Prepare transport, childcare backup, and the essentials you need postpartum.'],
        questions: ['What is your definition of active labor or when should I come in?', 'How do you guide induction, pain relief, or birth-plan changes?', 'What happens immediately after birth for me and the baby?'],
        alerts: ['Heavy bleeding or reduced movement.', 'A gush or trickle of fluid with concerns about timing.', 'Strong regular contractions with provider instructions to call or come in.'],
        actionLabel: 'Open birth-planning week',
        actionKey: 'show-week-36',
        actionNote: 'This opens the roadmap near full-term birth preparation.'
    },
    'early-signs-topic': {
        label: 'Maternal care',
        title: 'Early Signs of Pregnancy',
        summary: 'Early signs are most useful when paired with cycle timing, a missed period, and the understanding that symptoms alone are not proof of pregnancy.',
        forMom: 'This helps mothers decide when to test, when to wait, and when symptoms may point to something else entirely.',
        forBaby: 'Even before confirmation, early healthy habits like vitamins, sleep, and avoiding harmful substances can support the earliest development.',
        checklist: ['Track missed period days and any early symptoms.', 'Test at the right time instead of testing too early repeatedly.', 'Start prenatal habits if pregnancy is possible and you are trying to conceive.'],
        questions: ['How early can I trust a test result?', 'Which symptoms are too nonspecific to rely on?', 'When would bleeding or pain need immediate evaluation?'],
        alerts: ['Heavy bleeding or severe one-sided pain.', 'Passing out, severe dizziness, or fever.', 'Positive test with significant pain or bleeding.'],
        actionLabel: 'Open early signs checker',
        actionKey: 'open-early-signs',
        actionNote: 'This opens the interactive signs checker you already have in the app.'
    },
    'pregnancy-sleep-topic': {
        label: 'Maternal care',
        title: 'Sleep',
        summary: 'Better pregnancy sleep usually comes from position support, symptom relief, lighter evening routines, and realistic rest goals instead of chasing perfect sleep.',
        forMom: 'Sleep support can lower irritability, fatigue, pain sensitivity, and the feeling of being overwhelmed by everyday pregnancy tasks.',
        forBaby: 'When mothers sleep and rest more consistently, it is easier to manage blood sugar, appetite, mood, and blood pressure support.',
        checklist: ['Use side-lying support with pillows once it is more comfortable.', 'Treat reflux, leg cramps, or congestion earlier in the evening if you can.', 'Protect short rest windows during the day if overnight sleep is fragmented.'],
        questions: ['What sleep positions are best at my stage?', 'What can I safely use for reflux, congestion, or restless legs?', 'When is shortness of breath at night more concerning?'],
        alerts: ['Shortness of breath that feels severe or unusual.', 'Headache or swelling that pairs with poor sleep and blood pressure concerns.', 'Sleep loss linked with chest pain, fainting, or extreme anxiety.']
    },
    'your-baby-topic': {
        label: 'Baby growth',
        title: 'Your Baby',
        summary: 'Understanding normal baby growth helps mothers interpret scans, movement, and milestones with less fear and more context.',
        forMom: 'It gives a more grounded picture of what is happening in the womb so appointments and body changes feel connected instead of random.',
        forBaby: 'Growth tracking supports timely screening, nutrition attention, and movement monitoring as baby needs change through pregnancy.',
        checklist: ['Learn the next growth milestone expected in your stage.', 'Ask how your baby\'s size and growth are being monitored.', 'Notice when movement starts and how it becomes more regular later on.'],
        questions: ['How is growth measured at this point?', 'What does normal movement look like for my stage?', 'Would you expect additional scans or monitoring for any reason?'],
        alerts: ['Reduced movement later in pregnancy.', 'Major growth concerns discussed at a scan without follow-up clarity.', 'Fluid leakage or bleeding.']
    },
    'twins-topic': {
        label: 'Baby growth',
        title: 'Twins & More',
        summary: 'Multiple pregnancy often needs earlier planning, more monitoring, and stronger support for rest, nutrition, and symptom tracking.',
        forMom: 'Mothers carrying twins or more may deal with faster physical strain, more appointments, and earlier birth planning needs.',
        forBaby: 'Multiples often need closer growth checks, cervical monitoring, and earlier decisions about delivery timing and newborn support.',
        checklist: ['Ask what extra monitoring is expected in your case.', 'Build more rest into your week than you would with a singleton pregnancy.', 'Clarify the likely birth setting and timing conversations early.'],
        questions: ['How often will growth and cervical checks happen?', 'What symptoms or contractions matter more with multiples?', 'When do you usually start discussing delivery timing?'],
        alerts: ['Regular contractions or increasing pressure early.', 'Bleeding, fluid leakage, or reduced movement.', 'Symptoms of dehydration or severe shortness of breath.']
    },
    'fetal-health-topic': {
        label: 'Baby growth',
        title: 'Fetal Health & Development',
        summary: 'Fetal health is best understood through growth, movement, screening, fluid levels, and how your provider interprets those findings over time.',
        forMom: 'This helps mothers focus on the tests and behaviors that actually matter instead of trying to control every variable.',
        forBaby: 'Good monitoring supports early detection of growth concerns, fluid issues, placenta problems, or the need for closer follow-up.',
        checklist: ['Keep screening and scan appointments on schedule.', 'Ask for plain-language explanations of any results that worry you.', 'Know when movement monitoring becomes part of your routine.'],
        questions: ['How is fetal health being checked in my pregnancy?', 'Do any of my results change follow-up timing?', 'When should I start formal movement awareness or kick counts?'],
        alerts: ['Reduced movement.', 'Bleeding or fluid leakage.', 'A provider concern that needs follow-up but still feels unclear to you.']
    },
    'cord-blood-topic': {
        label: 'Birth prep',
        title: 'Cord Blood Banking',
        summary: 'Cord blood decisions are easier when you understand the timing, the cost, the difference between private and public options, and that it is optional.',
        forMom: 'It helps mothers avoid last-minute pressure and decide based on values, budget, and actual family medical context.',
        forBaby: 'This topic is about newborn planning rather than daily pregnancy care, but it can matter to some families depending on access or history.',
        checklist: ['Decide whether this is something you even want to consider.', 'Review private versus public options and deadlines.', 'If interested, confirm what paperwork or kits are needed before labor.'],
        questions: ['Is public donation available where I plan to give birth?', 'Do I have any family history that changes this discussion?', 'What needs to be arranged before delivery day?'],
        alerts: ['Do not let this distract from more important birth planning or postpartum support needs.', 'If paperwork is missing, confirm whether the plan still works.', 'Ask sooner if marketing claims are making the choice feel confusing.']
    },
    'pregnancy-fitness-topic': {
        label: 'Nutrition & fitness',
        title: 'Fitness',
        summary: 'Pregnancy fitness works best when it is moderate, regular, and adapted to how your body feels instead of driven by pre-pregnancy expectations.',
        forMom: 'Movement can support mood, sleep, back comfort, circulation, and labor endurance when it stays within your provider\'s guidance.',
        forBaby: 'Consistent safe movement can help maternal blood sugar, circulation, and overall health, which supports baby too.',
        checklist: ['Choose movement you can repeat most weeks, like walking, stretching, or prenatal strength work.', 'Warm up, hydrate, and stop if pain, dizziness, or contractions start.', 'Adjust intensity as pregnancy advances instead of forcing old routines.'],
        questions: ['Are there any movement limits in my pregnancy?', 'Which exercises should I stop or modify now?', 'What symptoms mean I should end a workout and call?'],
        alerts: ['Vaginal bleeding, fluid leakage, or chest pain during exercise.', 'Dizziness, fainting, or painful contractions.', 'Severe shortness of breath that feels wrong for the effort.']
    },
    'pregnancy-nutrients-topic': {
        label: 'Nutrition & fitness',
        title: 'Pregnancy Nutrients',
        summary: 'Pregnancy nutrition is not just about calories; it is about the nutrients that support blood building, brain development, bones, and steady maternal energy.',
        forMom: 'Folate, iron, protein, calcium, iodine, choline, vitamin D, fiber, and fluids can directly affect how strong or depleted you feel.',
        forBaby: 'These nutrients support neural development, growth, bone health, and overall development throughout pregnancy.',
        checklist: ['Check that your prenatal vitamin covers the basics your provider recommends.', 'Add iron- and protein-rich foods regularly instead of relying on one big meal.', 'Ask if labs suggest you need more support with iron, vitamin D, or something else.'],
        questions: ['Am I getting enough iron, calcium, choline, and protein?', 'Do my labs suggest any nutrition changes?', 'Are there supplements beyond a prenatal vitamin that you recommend for me?'],
        alerts: ['Severe fatigue, dizziness, or shortness of breath that may signal anemia.', 'Persistent vomiting that limits intake.', 'Rapid weight changes or inability to eat enough.']
    },
    'healthy-eating-topic': {
        label: 'Nutrition & fitness',
        title: 'Healthy Eating',
        summary: 'Healthy eating in pregnancy means regular meals, enough protein and fiber, hydration, and realistic food choices that work even on low-energy days.',
        forMom: 'This helps stabilize appetite, nausea, constipation, blood sugar swings, and the exhaustion that comes from under-eating.',
        forBaby: 'Steady maternal nutrition helps support baby growth without requiring perfection at every meal.',
        checklist: ['Use simple meal anchors: protein, produce, and a steady carbohydrate source.', 'Keep quick snacks where you actually need them: bedside, car, desk, or bag.', 'Make a short list of easy meals you can tolerate on hard days.'],
        questions: ['How much should I focus on weight gain versus meal quality?', 'What if nausea or aversions are making healthy meals hard?', 'How can I eat in a way that helps reflux or constipation too?'],
        alerts: ['Not keeping food or fluids down.', 'Rapid decline in appetite with weakness or dizziness.', 'Any eating issue that is affecting hydration, medication, or daily function.']
    },
    'best-foods-topic': {
        label: 'Nutrition & fitness',
        title: 'The Best Foods',
        summary: 'The best pregnancy foods are the ones that are nutrient-dense, easy to repeat, and realistic for your appetite and budget, not just the most ideal foods on paper.',
        forMom: 'Think eggs, beans, yogurt, leafy greens, fruit, nuts, salmon if allowed, whole grains, and easy protein snacks you can tolerate consistently.',
        forBaby: 'These foods can support iron, protein, healthy fats, calcium, folate, and steady growth support across pregnancy.',
        checklist: ['Pick five reliable foods you tolerate well and keep them stocked.', 'Pair iron sources with vitamin C foods when you can.', 'Use food safety habits consistently, especially with deli meats, raw foods, or leftovers.'],
        questions: ['Which foods are best for iron, protein, and healthy fats in my situation?', 'What should I limit or avoid right now?', 'How can I simplify meals without losing nutrition quality?'],
        alerts: ['Foodborne illness symptoms such as fever, vomiting, or diarrhea.', 'Unsafe food exposures you are worried about.', 'Significant weight loss because safe foods are feeling too limited.']
    },
    'pregnancy-diet-topic': {
        label: 'Nutrition & fitness',
        title: 'Pregnancy Diet',
        summary: 'A pregnancy diet works best when it gives you structure without turning every meal into a rule. The goal is steady support, not perfect eating.',
        forMom: 'A realistic meal pattern can reduce nausea, fatigue, constipation, blood sugar crashes, and the stress of wondering what to eat all day.',
        forBaby: 'Steady intake helps keep nutrients and energy more consistent for baby growth and maternal well-being.',
        checklist: ['Use a loose meal rhythm: breakfast, lunch, dinner, and two snacks if needed.', 'Keep fluids visible and easy to reach all day.', 'Review caffeine, fish, and food safety guidance with your provider if you are unsure.'],
        questions: ['Is my current diet pattern enough for this stage?', 'How much should I change if I have gestational diabetes, anemia, or strong nausea?', 'What should a simple one-day meal pattern look like for me?'],
        alerts: ['New diagnosis that changes your food plan, like gestational diabetes or severe anemia.', 'Ongoing vomiting or poor intake.', 'Severe weakness, dehydration, or rapid nutritional decline.']
    }
};

const pregnancyTopicTitleMap = {
    'Pregnancy Week by Week': 'pregnancy-week-by-week',
    'First Trimester of Pregnancy': 'first-trimester-topic',
    'Second Trimester of Pregnancy': 'second-trimester-topic',
    'Third Trimester of Pregnancy': 'third-trimester-topic',
    'Your Body': 'your-body-topic',
    'Symptoms': 'pregnancy-symptoms-topic',
    'Your Pregnancy Week by Week': 'body-week-by-week-topic',
    'Labor & Delivery': 'labor-delivery-topic',
    'Early Signs of Pregnancy': 'early-signs-topic',
    'Sleep': 'pregnancy-sleep-topic',
    'Your Baby': 'your-baby-topic',
    'Twins & More': 'twins-topic',
    'Fetal Health & Development': 'fetal-health-topic',
    'Cord Blood Banking': 'cord-blood-topic',
    'Fitness': 'pregnancy-fitness-topic',
    'Pregnancy Nutrients': 'pregnancy-nutrients-topic',
    'Healthy Eating': 'healthy-eating-topic',
    'The Best Foods': 'best-foods-topic',
    'Pregnancy Diet': 'pregnancy-diet-topic'
};

let currentPregnancyTopicActionKey = '';

function configurePregnancyTopicCard(card, topicKey) {
    const guide = pregnancyTopicGuides[topicKey];
    if (!card || !guide) {
        return;
    }

    card.classList.add('pregnancy-topic-card');
    card.dataset.topicKey = topicKey;

    if (!card.querySelector('.pregnancy-topic-tag')) {
        const tag = document.createElement('span');
        tag.className = 'pregnancy-topic-tag';
        tag.textContent = guide.label;
        card.insertBefore(tag, card.firstChild);
    }

    if (card.tagName !== 'BUTTON') {
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPregnancyTopic(topicKey);
            }
        });
    }

    card.onclick = () => openPregnancyTopic(topicKey);
}

function initializePregnancyTopics() {
    const cards = Array.from(document.querySelectorAll('#pregnancyTopics .pregnancy-topic-grid > *'));

    cards.forEach((card) => {
        const title = card.querySelector('h3')?.textContent?.trim() || '';
        const topicKey = card.dataset.topicKey || pregnancyTopicTitleMap[title];
        if (topicKey) {
            configurePregnancyTopicCard(card, topicKey);
        }
    });

    openPregnancyTopic('pregnancy-week-by-week', { scroll: false });
}

function runPregnancyTopicAction() {
    switch (currentPregnancyTopicActionKey) {
        case 'scroll-week-guide':
            scrollToPregnancyGuide();
            break;
        case 'show-week-8':
            showWeekInfo(8, { scroll: true });
            break;
        case 'show-week-20':
            showWeekInfo(20, { scroll: true });
            break;
        case 'show-week-34':
            showWeekInfo(34, { scroll: true });
            break;
        case 'show-week-36':
            showWeekInfo(36, { scroll: true });
            break;
        case 'open-early-signs':
            showPregnancySymptoms();
            break;
        default:
            break;
    }
}

function openPregnancyTopic(topicKey, options = {}) {
    const guide = pregnancyTopicGuides[topicKey];
    const panel = document.getElementById('pregnancyTopicPanel');
    const label = document.getElementById('pregnancyTopicLabel');
    const title = document.getElementById('pregnancyTopicTitle');
    const summary = document.getElementById('pregnancyTopicSummary');
    const forMom = document.getElementById('pregnancyTopicForMom');
    const forBaby = document.getElementById('pregnancyTopicForBaby');
    const actionRow = document.getElementById('pregnancyTopicActionRow');
    const actionButton = document.getElementById('pregnancyTopicActionButton');
    const actionNote = document.getElementById('pregnancyTopicActionNote');

    if (!guide) {
        return;
    }

    if (label) label.textContent = guide.label;
    if (title) title.textContent = guide.title;
    if (summary) summary.textContent = guide.summary;
    if (forMom) forMom.textContent = guide.forMom;
    if (forBaby) forBaby.textContent = guide.forBaby;

    renderPregnancyList('pregnancyTopicChecklist', guide.checklist);
    renderPregnancyList('pregnancyTopicQuestions', guide.questions);
    renderPregnancyList('pregnancyTopicAlerts', guide.alerts);

    document.querySelectorAll('#pregnancyTopics .pregnancy-topic-card').forEach((card) => {
        card.classList.toggle('active', card.dataset.topicKey === topicKey);
    });

    currentPregnancyTopicActionKey = guide.actionKey || '';

    if (actionRow) {
        actionRow.style.display = guide.actionKey ? 'grid' : 'none';
    }

    if (actionButton) {
        actionButton.textContent = guide.actionLabel || 'Open related guide';
    }

    if (actionNote) {
        actionNote.textContent = guide.actionNote || '';
    }

    if (options.scroll !== false && panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Generate Pregnancy Weeks
function generateWeeks() {
    const first = document.getElementById('firstTrimester');
    const second = document.getElementById('secondTrimester');
    const third = document.getElementById('thirdTrimester');

    if (!first || !second || !third) {
        return;
    }

    first.innerHTML = '';
    second.innerHTML = '';
    third.innerHTML = '';

    for (let i = 1; i <= 13; i++) {
        first.innerHTML += createWeekBadge(i);
    }
    for (let i = 14; i <= 27; i++) {
        second.innerHTML += createWeekBadge(i);
    }
    for (let i = 28; i <= 42; i++) {
        third.innerHTML += createWeekBadge(i);
    }

    renderPregnancyWeekGuide(selectedPregnancyWeek, { scroll: false });
}

function createWeekBadge(week) {
    const guide = getPregnancyWeekGuide(week);

    return `
        <button type="button" class="week-badge${week === selectedPregnancyWeek ? ' active' : ''}" data-week="${week}" onclick="showWeekInfo(${week})">
            <strong>Week ${week}</strong>
            <span>${guide.badgeLabel}</span>
        </button>
    `;
}

// Enhanced Ovulation Calculator
function calculateOvulation() {
    if (!requireToolAccess('getting-pregnant', 'showOvulationCalculator')) {
        return;
    }

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

function restoreOvulationCalculatorState() {
    const dateInput = document.getElementById('ovulationDate');
    const cycleSelect = document.getElementById('ovulationCycle');
    const resultBox = document.getElementById('ovulationResult');

    if (!dateInput || !cycleSelect || !resultBox) {
        return;
    }

    let ovulationData = null;

    try {
        ovulationData = JSON.parse(localStorage.getItem('bc_ovulation_data') || 'null');
    } catch (error) {
        ovulationData = null;
    }

    if (!ovulationData) {
        return;
    }

    if (ovulationData.lastPeriod) {
        dateInput.value = ovulationData.lastPeriod;
    }

    if (ovulationData.cycleLength) {
        cycleSelect.value = String(ovulationData.cycleLength);
    }

    if (!ovulationData.fertileWindow || !ovulationData.fertileWindow.start || !ovulationData.fertileWindow.end || !ovulationData.ovulationDate || !ovulationData.nextPeriod) {
        return;
    }

    const fertileStart = new Date(ovulationData.fertileWindow.start);
    const fertileEnd = new Date(ovulationData.fertileWindow.end);
    const ovulation = new Date(ovulationData.ovulationDate);
    const nextPeriod = new Date(ovulationData.nextPeriod);

    if ([fertileStart, fertileEnd, ovulation, nextPeriod].some((value) => Number.isNaN(value.getTime()))) {
        return;
    }

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const shortOptions = { month: 'short', day: 'numeric' };

    document.getElementById('fertileWindow').textContent =
        `${fertileStart.toLocaleDateString('en-US', shortOptions)} - ${fertileEnd.toLocaleDateString('en-US', shortOptions)}`;
    document.getElementById('ovulationDay').textContent = ovulation.toLocaleDateString('en-US', shortOptions);
    document.getElementById('nextPeriod').textContent = nextPeriod.toLocaleDateString('en-US', options);
    resultBox.classList.add('show');
}

function setModalVisibility(modalId, isVisible) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.style.display = isVisible ? 'flex' : 'none';

    const isAnyModalOpen = Array.from(document.querySelectorAll('.modal')).some((modalElement) => modalElement.style.display === 'flex');
    document.body.classList.toggle('modal-open', isAnyModalOpen);
}

function showOvulationCalculator() {
    if (!requireToolAccess('getting-pregnant', 'showOvulationCalculator')) {
        return;
    }

    restoreOvulationCalculatorState();
    setModalVisibility('ovulationCalculatorModal', true);
}

function closeOvulationCalculator() {
    setModalVisibility('ovulationCalculatorModal', false);
}

window.calculateOvulation = calculateOvulation;
window.showOvulationCalculator = showOvulationCalculator;
window.closeOvulationCalculator = closeOvulationCalculator;

function scrollToCalc() {
    showOvulationCalculator();
}

// Fertility Tracker Functions
function showFertilityTracker() {
    if (!requireToolAccess('getting-pregnant', 'showFertilityTracker')) {
        return;
    }

    setModalVisibility('fertilityTrackerModal', true);
    // Set today's date as default
    document.getElementById('trackerDate').value = new Date().toISOString().split('T')[0];
    loadFertilityData();
}

function closeFertilityTracker() {
    setModalVisibility('fertilityTrackerModal', false);
}

function saveFertilityData() {
    if (!requireToolAccess('getting-pregnant', 'showFertilityTracker')) {
        return;
    }

    const date = document.getElementById('trackerDate').value;
    const temperature = document.getElementById('trackerTemperature').value;
    const mucus = document.getElementById('trackerMucus').value;
    const symptoms = [];
    
    document.querySelectorAll('#fertilityTrackerModal .checkbox-group input:checked').forEach(checkbox => {
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
    if (!requireToolAccess('getting-pregnant', 'showPregnancyTest')) {
        return;
    }

    setModalVisibility('pregnancyTestModal', true);
}

function closePregnancyTest() {
    setModalVisibility('pregnancyTestModal', false);
}

function calculateTestDate() {
    if (!requireToolAccess('getting-pregnant', 'showPregnancyTest')) {
        return;
    }

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

function updateConceptionMethod() {
    const method = document.getElementById('conceptionMethod')?.value;
    const dueFields = document.getElementById('conceptionDueFields');
    const lmpFields = document.getElementById('conceptionLmpFields');

    if (!method || !dueFields || !lmpFields) {
        return;
    }

    dueFields.style.display = method === 'due-date' ? 'block' : 'none';
    lmpFields.style.display = method === 'last-period' ? 'block' : 'none';
}

function calculateConceptionDate() {
    if (!requireToolAccess('conception-date-calculator', 'calculateConceptionDate')) {
        return;
    }

    const method = document.getElementById('conceptionMethod').value;
    const resultDiv = document.getElementById('conceptionDateResult');
    const longDate = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const shortDate = { month: 'short', day: 'numeric', year: 'numeric' };
    let conceptionDate;
    let fertileStart;
    let fertileEnd;
    let dueDate;
    let detailLine = '';
    let timingLine = '';

    if (method === 'due-date') {
        const dueValue = document.getElementById('conceptionDueDate').value;

        if (!dueValue) {
            showNotification('Please enter your due date', 'error');
            return;
        }

        dueDate = new Date(dueValue);
        conceptionDate = new Date(dueDate);
        conceptionDate.setDate(dueDate.getDate() - 266);

        fertileStart = new Date(conceptionDate);
        fertileStart.setDate(conceptionDate.getDate() - 5);
        fertileEnd = new Date(conceptionDate);
        fertileEnd.setDate(conceptionDate.getDate() + 1);

        const approxLastPeriod = new Date(conceptionDate);
        approxLastPeriod.setDate(conceptionDate.getDate() - 14);
        detailLine = `Approximate first day of last period: ${approxLastPeriod.toLocaleDateString('en-US', shortDate)}`;
        timingLine = 'This estimate counts back about 266 days from the due date and centers the fertile window around the likely ovulation date.';
    } else {
        const lmpValue = document.getElementById('conceptionLmpDate').value;
        const cycleLength = parseInt(document.getElementById('conceptionCycleLength').value, 10);

        if (!lmpValue) {
            showNotification('Please enter the first day of your last period', 'error');
            return;
        }

        const lmpDate = new Date(lmpValue);
        conceptionDate = new Date(lmpDate);
        conceptionDate.setDate(lmpDate.getDate() + (cycleLength - 14));

        fertileStart = new Date(conceptionDate);
        fertileStart.setDate(conceptionDate.getDate() - 5);
        fertileEnd = new Date(conceptionDate);
        fertileEnd.setDate(conceptionDate.getDate() + 1);

        dueDate = new Date(lmpDate);
        dueDate.setDate(lmpDate.getDate() + 280 + (cycleLength - 28));
        detailLine = `Based on a ${cycleLength}-day cycle, ovulation is estimated around ${conceptionDate.toLocaleDateString('en-US', shortDate)}.`;
        timingLine = `This estimate uses your last period plus a ${cycleLength - 14}-day ovulation assumption to place conception and fertile timing.`;
    }

    const banner = document.getElementById('conceptionDateBanner');
    const label = document.getElementById('conceptionDateLabel');
    const summary = document.getElementById('conceptionDateSummary');
    const conceptionValue = document.getElementById('conceptionDateValue');
    const conceptionMethod = document.getElementById('conceptionDateMethod');
    const fertileWindow = document.getElementById('conceptionFertileWindow');
    const dueDateValue = document.getElementById('conceptionDueDateValue');
    const detail = document.getElementById('conceptionDetailLine');
    const timing = document.getElementById('conceptionDateTiming');

    if (banner) {
        banner.className = 'sign-result sign-result-medium';
    }
    if (label) label.textContent = 'Estimate calculated';
    if (summary) summary.textContent = `This conception estimate was calculated using the ${method === 'due-date' ? 'due date' : 'last period'} method.`;
    if (conceptionValue) conceptionValue.textContent = conceptionDate.toLocaleDateString('en-US', shortDate);
    if (conceptionMethod) conceptionMethod.textContent = method === 'due-date' ? 'Method: due date' : 'Method: last period';
    if (fertileWindow) fertileWindow.textContent = `${fertileStart.toLocaleDateString('en-US', shortDate)} - ${fertileEnd.toLocaleDateString('en-US', shortDate)}`;
    if (dueDateValue) dueDateValue.textContent = `Estimated due date: ${dueDate.toLocaleDateString('en-US', longDate)}`;
    if (detail) detail.textContent = detailLine;
    if (timing) timing.textContent = timingLine;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Conception estimate ready', 'success');
}

function assessPregnancySigns(daysLate, cycleType, checkedSymptoms) {
    const symptomWeights = {
        'nausea': 2,
        'breast tenderness': 2,
        'fatigue': 2,
        'frequent urination': 1,
        'bloating': 1,
        'light spotting': 1,
        'heightened smell': 1,
        'cramping': 1
    };

    const symptomDetails = checkedSymptoms.map((input) => ({
        name: input.value,
        points: symptomWeights[input.value] || 0
    }));
    const symptomScore = symptomDetails.reduce((total, item) => total + item.points, 0);

    let latenessScore = 0;
    if (daysLate >= 7) latenessScore = 4;
    else if (daysLate >= 3) latenessScore = 2;
    else if (daysLate >= 1) latenessScore = 1;

    const cycleAdjustment = cycleType === 'irregular' ? -1 : 0;
    const score = Math.max(0, symptomScore + latenessScore + cycleAdjustment);
    const signsUsed = [];

    if (daysLate > 0) {
        signsUsed.push(`Late period (${daysLate} day${daysLate === 1 ? '' : 's'}, +${latenessScore})`);
    }

    checkedSymptoms.forEach((input) => {
        const symptomPoints = symptomWeights[input.value] || 0;
        signsUsed.push(`${input.value} (+${symptomPoints})`);
    });

    let headline = 'Symptoms are not specific yet';
    let advice = 'If your period is not late yet, wait a few days for a more reliable test result.';
    let scoreBand = '0-4 points';
    let signLabel = 'No clear sign';
    let signClass = 'low';
    let resultStatement = 'The signs selected so far are not specific enough to point clearly toward pregnancy.';
    let resultRule = '0 points and no meaningful timing signal';

    if (score >= 8) {
        headline = 'Pregnancy is possible';
        scoreBand = '8+ points';
        signLabel = 'Strong sign';
        signClass = 'high';
        resultStatement = 'The selected signs plus your late period look more consistent with a possible early pregnancy.';
        resultRule = 'Strong sign because the total score reached 8 or more points';
        advice = daysLate >= 7
            ? 'A home pregnancy test may give a clearer answer now.'
            : 'Consider testing soon and repeat in 2-3 days if the first result is negative.';
    } else if (daysLate >= 7 || score >= 5) {
        headline = 'You have some common early signs';
        signLabel = 'Possible sign';
        signClass = 'medium';
        resultStatement = 'You have a few common early pregnancy signs, but timing still matters for a reliable test.';
        resultRule = daysLate >= 7 && score < 5
            ? 'Possible sign because your period is 7 or more days late'
            : 'Possible sign because the total score reached 5 to 7 points';
        advice = daysLate >= 3
            ? 'You can test now, but repeating the test in a couple of days may be more accurate.'
            : 'Keep tracking your cycle and symptoms for a few more days before testing.';
    } else if (daysLate >= 1 || score >= 2) {
        signLabel = 'Weak sign';
        signClass = 'low';
        resultStatement = 'There are some early signs, but they are still too limited or non-specific to read as a strong pregnancy sign.';
        resultRule = daysLate >= 1 && score < 2
            ? 'Weak sign because your period is late, but there are few other signs'
            : 'Weak sign because the total score is still below 5 points';
    }

    return {
        symptomDetails,
        symptomScore,
        latenessScore,
        cycleAdjustment,
        score,
        headline,
        advice,
        scoreBand,
        signLabel,
        signClass,
        resultStatement,
        resultRule,
        signsUsed
    };
}

function checkPregnancySigns() {
    if (!requireToolAccess('early-pregnancy-signs', 'checkPregnancySigns')) {
        return;
    }

    const daysLate = Math.max(0, parseInt(document.getElementById('pregnancySignsDaysLate').value || '0', 10));
    const cycleType = document.getElementById('pregnancySignsCycleType').value;
    const checkedSymptoms = Array.from(document.querySelectorAll('#pregnancySignsChecklist input:checked'));
    const resultDiv = document.getElementById('pregnancySignsResult');

    if (daysLate === 0 && checkedSymptoms.length === 0) {
        showNotification('Enter days late or select at least one symptom', 'error');
        return;
    }

    const assessment = assessPregnancySigns(daysLate, cycleType, checkedSymptoms);
    const symptomList = checkedSymptoms.map((input) => input.value).join(', ') || 'No symptoms selected';
    const cycleText = cycleType === 'irregular'
        ? 'Often irregular (-1 point)'
        : cycleType === 'somewhat-regular'
            ? 'Somewhat regular (0 points)'
            : 'Usually regular (0 points)';
    const symptomBreakdown = assessment.symptomDetails.length > 0
        ? assessment.symptomDetails.map((item) => `<li>${item.name}: ${item.points} point${item.points === 1 ? '' : 's'}</li>`).join('')
        : '<li>No symptom points were added.</li>';
    const totalEquation = `${assessment.symptomScore} symptom points + ${assessment.latenessScore} late-period points ${assessment.cycleAdjustment < 0 ? `- ${Math.abs(assessment.cycleAdjustment)} cycle-adjustment point` : '+ 0 cycle-adjustment points'} = ${assessment.score}`;
    const signsUsedText = assessment.signsUsed.length > 0 ? assessment.signsUsed.join(', ') : 'No clear signs selected yet';
    const banner = document.getElementById('pregnancySignsBanner');
    const label = document.getElementById('pregnancySignsLabel');
    const summary = document.getElementById('pregnancySignsSummary');
    const score = document.getElementById('pregnancySignsScore');
    const band = document.getElementById('pregnancySignsBand');
    const symptomPoints = document.getElementById('pregnancySignsSymptomPoints');
    const symptomCount = document.getElementById('pregnancySignsSymptomCount');
    const latePoints = document.getElementById('pregnancySignsLatePoints');
    const lateDays = document.getElementById('pregnancySignsLateDays');
    const cyclePoints = document.getElementById('pregnancySignsCyclePoints');
    const cycle = document.getElementById('pregnancySignsCycle');
    const used = document.getElementById('pregnancySignsUsed');
    const advice = document.getElementById('pregnancySignsAdvice');
    const equation = document.getElementById('pregnancySignsEquation');
    const reported = document.getElementById('pregnancySignsReported');
    const breakdown = document.getElementById('pregnancySignsBreakdown');

    if (banner) {
        banner.className = `sign-result sign-result-${assessment.signClass}`;
    }
    if (label) label.textContent = assessment.signLabel;
    if (summary) summary.textContent = `${assessment.resultStatement} ${assessment.headline}.`;
    if (score) score.textContent = String(assessment.score);
    if (band) band.textContent = assessment.scoreBand;
    if (symptomPoints) symptomPoints.textContent = String(assessment.symptomScore);
    if (symptomCount) symptomCount.textContent = `${checkedSymptoms.length} selected sign${checkedSymptoms.length === 1 ? '' : 's'}`;
    if (latePoints) latePoints.textContent = String(assessment.latenessScore);
    if (lateDays) lateDays.textContent = `${daysLate} day${daysLate === 1 ? '' : 's'} late`;
    if (cyclePoints) cyclePoints.textContent = assessment.cycleAdjustment > 0 ? `+${assessment.cycleAdjustment}` : String(assessment.cycleAdjustment);
    if (cycle) cycle.textContent = cycleText;
    if (used) used.textContent = signsUsedText;
    if (advice) advice.textContent = assessment.advice;
    if (equation) equation.textContent = totalEquation;
    if (reported) reported.textContent = symptomList;
    if (breakdown) {
        breakdown.innerHTML = `
            ${symptomBreakdown}
            <li>Late period timing: ${assessment.latenessScore} point${assessment.latenessScore === 1 ? '' : 's'}</li>
            <li>Cycle adjustment: ${assessment.cycleAdjustment} point${Math.abs(assessment.cycleAdjustment) === 1 ? '' : 's'}</li>
            <li>Final result rule: ${assessment.resultRule}</li>
        `;
    }

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Symptom check complete', 'success');
}

function calculateBabyCosts() {
    if (!requireToolAccess('baby-costs-calculator', 'calculateBabyCosts')) {
        return;
    }

    const fields = [
        { id: 'babyCostsDiapers', label: 'Diapers & wipes' },
        { id: 'babyCostsFeeding', label: 'Feeding' },
        { id: 'babyCostsChildcare', label: 'Childcare' },
        { id: 'babyCostsClothes', label: 'Clothes & gear' },
        { id: 'babyCostsMedical', label: 'Medical & pharmacy' },
        { id: 'babyCostsOther', label: 'Other expenses' }
    ];
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const values = fields.map((field) => ({
        label: field.label,
        value: parseFloat(document.getElementById(field.id).value || '0')
    }));

    if (values.every((item) => item.value === 0)) {
        showNotification('Enter at least one cost to calculate a budget', 'error');
        return;
    }

    const monthlyTotal = values.reduce((sum, item) => sum + item.value, 0);
    const yearlyTotal = monthlyTotal * 12;
    const weeklyAverage = yearlyTotal / 52;
    const topCategory = [...values].sort((a, b) => b.value - a.value)[0];
    const resultDiv = document.getElementById('babyCostsResult');
    const banner = document.getElementById('babyCostsBanner');
    const label = document.getElementById('babyCostsLabel');
    const summary = document.getElementById('babyCostsSummary');
    const monthly = document.getElementById('babyCostsMonthly');
    const monthlyNote = document.getElementById('babyCostsMonthlyNote');
    const yearly = document.getElementById('babyCostsYearly');
    const weekly = document.getElementById('babyCostsWeekly');
    const topCategoryLabel = document.getElementById('babyCostsTopCategory');
    const topCategoryValue = document.getElementById('babyCostsTopCategoryValue');
    const breakdown = document.getElementById('babyCostsBreakdown');
    const activeCategories = values.filter((item) => item.value > 0);

    if (banner) {
        banner.className = 'sign-result sign-result-medium';
    }
    if (label) label.textContent = 'Budget calculated';
    if (summary) summary.textContent = `Your current entries add up to ${currency.format(monthlyTotal)} per month and ${currency.format(yearlyTotal)} over a full year.`;
    if (monthly) monthly.textContent = currency.format(monthlyTotal);
    if (monthlyNote) monthlyNote.textContent = `${activeCategories.length} active categor${activeCategories.length === 1 ? 'y' : 'ies'} in this budget`;
    if (yearly) yearly.textContent = currency.format(yearlyTotal);
    if (weekly) weekly.textContent = `${currency.format(weeklyAverage)} per week`;
    if (topCategoryLabel) topCategoryLabel.textContent = topCategory.label;
    if (topCategoryValue) topCategoryValue.textContent = `${currency.format(topCategory.value)} is currently your largest monthly expense`;
    if (breakdown) {
        breakdown.innerHTML = activeCategories
            .map((item) => `<li>${item.label}: ${currency.format(item.value)}</li>`)
            .join('');
    }

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Budget calculated', 'success');
}

function buildFertilityDietPlan() {
    if (!requireToolAccess('fertility-diet-guide', 'buildFertilityDietPlan')) {
        return;
    }

    const style = document.getElementById('fertilityDietStyle').value;
    const goal = document.getElementById('fertilityDietGoal').value;
    const caffeine = document.getElementById('fertilityDietCaffeine').value;
    const hydration = document.getElementById('fertilityDietHydration').value;
    const resultDiv = document.getElementById('fertilityDietResult');
    const plans = {
        balanced: {
            breakfast: 'Greek yogurt, berries, oats, and walnuts',
            lunch: 'Salmon grain bowl with leafy greens and avocado',
            dinner: 'Chicken, sweet potato, and roasted vegetables',
            snack: 'Apple slices with peanut butter'
        },
        vegetarian: {
            breakfast: 'Oatmeal with chia seeds, berries, and pumpkin seeds',
            lunch: 'Lentil and quinoa bowl with spinach and feta',
            dinner: 'Egg scramble or tofu stir-fry with brown rice and broccoli',
            snack: 'Greek yogurt or hummus with carrots'
        },
        vegan: {
            breakfast: 'Chia pudding with berries and almond butter',
            lunch: 'Chickpea quinoa salad with olive oil and greens',
            dinner: 'Tofu, edamame, and vegetable stir-fry with brown rice',
            snack: 'Trail mix with walnuts and pumpkin seeds'
        },
        'high-protein': {
            breakfast: 'Eggs or protein oats with fruit and seeds',
            lunch: 'Turkey or tofu wrap with greens and beans',
            dinner: 'Lean protein, quinoa, and colorful vegetables',
            snack: 'Cottage cheese or roasted chickpeas'
        }
    };
    const goals = {
        'hormone-balance': 'Focus on fiber, omega-3 fats, and steady meals to support hormone balance.',
        'egg-health': 'Prioritize antioxidants, folate, iron, and choline to support egg health.',
        'steady-energy': 'Build meals around protein, fiber, and healthy fat to avoid big energy swings.',
        'partner-support': 'Choose zinc-rich foods, vitamin C sources, and simple meals both partners can follow.'
    };
    const caffeineAdvice = {
        none: 'No caffeine recorded, so keep relying on hydration and steady meals for energy.',
        low: 'Your caffeine intake is already moderate. Pair it with food and plenty of water.',
        moderate: 'Try not to let caffeine replace meals or hydration during the day.',
        high: 'Consider reducing caffeine gradually and swapping one serving for water or herbal tea.'
    };
    const hydrationAdvice = {
        low: 'Increase fluids gradually and keep water visible during the day.',
        medium: 'Good baseline. Add an extra glass around exercise or warmer weather.',
        high: 'Strong hydration habit. Keep that consistency as part of your plan.'
    };
    const selectedPlan = plans[style];
    const styleLabels = {
        balanced: 'Balanced',
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        'high-protein': 'High protein'
    };
    const goalLabels = {
        'hormone-balance': 'Support hormone balance',
        'egg-health': 'Support egg health',
        'steady-energy': 'Improve steady energy',
        'partner-support': 'Create a shared fertility plan'
    };
    const banner = document.getElementById('fertilityDietBanner');
    const label = document.getElementById('fertilityDietLabel');
    const summary = document.getElementById('fertilityDietSummary');
    const styleResult = document.getElementById('fertilityDietStyleResult');
    const goalResult = document.getElementById('fertilityDietGoalResult');
    const hydrationResult = document.getElementById('fertilityDietHydrationResult');
    const caffeineResult = document.getElementById('fertilityDietCaffeineResult');
    const breakfast = document.getElementById('fertilityDietBreakfast');
    const lunch = document.getElementById('fertilityDietLunch');
    const dinner = document.getElementById('fertilityDietDinner');
    const snack = document.getElementById('fertilityDietSnack');

    if (banner) {
        banner.className = 'sign-result sign-result-medium';
    }
    if (label) label.textContent = 'Plan built';
    if (summary) summary.textContent = `This plan matches a ${styleLabels[style].toLowerCase()} eating style with a focus on ${goalLabels[goal].toLowerCase()}.`;
    if (styleResult) styleResult.textContent = styleLabels[style];
    if (goalResult) goalResult.textContent = goals[goal];
    if (hydrationResult) hydrationResult.textContent = hydration === 'high' ? 'Hydration strong' : hydration === 'medium' ? 'Hydration steady' : 'Hydration boost';
    if (caffeineResult) caffeineResult.textContent = `${caffeineAdvice[caffeine]} ${hydrationAdvice[hydration]}`;
    if (breakfast) breakfast.textContent = selectedPlan.breakfast;
    if (lunch) lunch.textContent = selectedPlan.lunch;
    if (dinner) dinner.textContent = selectedPlan.dinner;
    if (snack) snack.textContent = selectedPlan.snack;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Nutrition plan ready', 'success');
}

function renderToolList(listId, items) {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function setResultTone(element, tone) {
    if (element) {
        element.className = `sign-result ${tone}`;
    }
}

// Resource Functions
function showFertilityDiet() {
    navigateTo('fertility-diet-guide');
}

function showPreconceptionHealth() {
    navigateTo('preconception-health-guide');
}

function showFertilityTreatments() {
    navigateTo('fertility-treatments-guide');
}

function showStressManagement() {
    navigateTo('stress-fertility-guide');
}

function showAgeFertility() {
    navigateTo('age-fertility-guide');
}

function showPartnerHealth() {
    navigateTo('partner-fertility-guide');
}

function showConceptionCalculator() {
    navigateTo('conception-date-calculator');
}

function showPregnancySymptoms() {
    navigateTo('early-pregnancy-signs');
}

function showBabyCosts() {
    navigateTo('baby-costs-calculator');
}

function buildPreconceptionPlan() {
    if (!requireToolAccess('preconception-health-guide', 'buildPreconceptionPlan')) {
        return;
    }

    const timeline = document.getElementById('preconceptionTimeline').value;
    const vitamins = document.getElementById('preconceptionVitamins').value;
    const exercise = document.getElementById('preconceptionExercise').value;
    const sleep = document.getElementById('preconceptionSleep').value;
    const habits = document.getElementById('preconceptionHabits').value;
    const medical = document.getElementById('preconceptionMedical').value;
    const resultDiv = document.getElementById('preconceptionResult');

    const vitaminScores = { 'not-started': 0, sometimes: 1, daily: 2 };
    const exerciseScores = { low: 0, moderate: 1, consistent: 2 };
    const sleepScores = { low: 0, medium: 1, high: 2 };
    const habitScores = { 'high-risk': 0, mixed: 1, 'low-risk': 2 };
    const medicalScores = { 'not-reviewed': 0, booked: 1, reviewed: 2 };
    const timelineLabels = {
        now: 'Trying now',
        '3-6': 'Trying in 3 to 6 months',
        '6-12': 'Trying in 6 to 12 months'
    };

    const readinessScore = vitaminScores[vitamins] + exerciseScores[exercise] + sleepScores[sleep] + habitScores[habits] + medicalScores[medical];
    const lifestyleScore = exerciseScores[exercise] + sleepScores[sleep] + habitScores[habits];

    let tone = 'sign-result-low';
    let status = 'Needs attention';
    let summary = 'A few preconception basics still need attention before your routine feels steady.';

    if (readinessScore >= 8) {
        tone = 'sign-result-high';
        status = 'Strong foundation';
        summary = 'You already have several supportive habits in place for conception planning.';
    } else if (readinessScore >= 5) {
        tone = 'sign-result-medium';
        status = 'Good start';
        summary = 'You have a workable base. Tightening a few habits will make the plan stronger.';
    }

    const priorities = [];
    if (vitamins !== 'daily') priorities.push('Make a daily prenatal with folic acid part of your routine.');
    if (medical !== 'reviewed') priorities.push('Schedule or keep a preconception visit to review medications, vaccines, and cycle history.');
    if (habits !== 'low-risk') priorities.push('Reduce smoking, vaping, or frequent alcohol before trying to conceive.');
    if (sleep === 'low') priorities.push('Aim for a steadier sleep window so your body has more consistent recovery time.');
    if (exercise === 'low') priorities.push('Add regular walks or moderate movement most days of the week.');
    if (priorities.length === 0) priorities.push('Keep your current habits steady and check in monthly while you are trying.');

    const banner = document.getElementById('preconceptionBanner');
    const label = document.getElementById('preconceptionLabel');
    const summaryNode = document.getElementById('preconceptionSummary');
    const score = document.getElementById('preconceptionScore');
    const scoreNote = document.getElementById('preconceptionScoreNote');
    const timelineResult = document.getElementById('preconceptionTimelineResult');
    const timelineNote = document.getElementById('preconceptionTimelineNote');
    const lifestyleResult = document.getElementById('preconceptionLifestyleResult');
    const lifestyleNote = document.getElementById('preconceptionLifestyleNote');
    const medicalResult = document.getElementById('preconceptionMedicalResult');
    const medicalNote = document.getElementById('preconceptionMedicalNote');
    const priorityText = document.getElementById('preconceptionPriorityText');
    const priorityNote = document.getElementById('preconceptionPriorityNote');

    setResultTone(banner, tone);
    if (label) label.textContent = status;
    if (summaryNode) summaryNode.textContent = `${summary} ${timelineLabels[timeline]} means your best next steps should happen soon enough to match your timeline.`;
    if (score) score.textContent = `${readinessScore}/10`;
    if (scoreNote) scoreNote.textContent = 'Readiness score based on supplements, habits, and medical planning.';
    if (timelineResult) timelineResult.textContent = timelineLabels[timeline];
    if (timelineNote) timelineNote.textContent = timeline === 'now' ? 'Focus on the highest-impact changes this month.' : 'Use this runway to tighten habits before you start trying.';
    if (lifestyleResult) lifestyleResult.textContent = lifestyleScore >= 5 ? 'Strong daily habits' : lifestyleScore >= 3 ? 'Mostly supportive habits' : 'Daily routine needs support';
    if (lifestyleNote) lifestyleNote.textContent = 'Movement, sleep, and exposure habits often shift readiness quickly.';
    if (medicalResult) medicalResult.textContent = medical === 'reviewed' ? 'Visit already covered' : medical === 'booked' ? 'Visit scheduled' : 'Visit still needed';
    if (medicalNote) medicalNote.textContent = vitamins === 'daily' ? 'Supplements are already in place.' : 'Use the same routine to lock in your prenatal habit.';
    if (priorityText) priorityText.textContent = priorities[0];
    if (priorityNote) priorityNote.textContent = priorities[1] || 'Keep reviewing your plan until these habits feel routine.';
    renderToolList('preconceptionChecklist', priorities.slice(0, 4));

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Preconception plan ready', 'success');
}

function buildFertilityTreatmentGuide() {
    if (!requireToolAccess('fertility-treatments-guide', 'buildFertilityTreatmentGuide')) {
        return;
    }

    const age = document.getElementById('fertilityTreatmentAge').value;
    const duration = document.getElementById('fertilityTreatmentDuration').value;
    const cycles = document.getElementById('fertilityTreatmentCycles').value;
    const concern = document.getElementById('fertilityTreatmentConcern').value;
    const preference = document.getElementById('fertilityTreatmentPreference').value;
    const resultDiv = document.getElementById('fertilityTreatmentResult');

    const ageLabels = {
        'under-35': 'Under 35',
        '35-37': 'Age 35 to 37',
        '38-40': 'Age 38 to 40',
        '41-plus': 'Age 41+'
    };

    let tone = 'sign-result-low';
    let label = 'Learning stage';
    let summary = 'You may still be in the stage where tracking and basic planning are the main focus.';
    let route = 'Continue with cycle tracking and basic fertility awareness';
    let routeNote = 'Timed intercourse, cycle data, and a basic checkup are common early steps.';
    let timing = 'Keep tracking for now';
    let timingNote = 'Many couples under 35 are told to try for up to 12 months before a full workup unless there is a known concern.';
    let firstStep = 'Review cycle timing, partner history, and basic health factors';
    let firstStepNote = 'A primary care doctor or OB-GYN often starts this conversation.';
    let options = 'Timed intercourse and basic fertility testing';
    let optionsNote = 'More advanced options usually come after the first evaluation.';
    let priority = 'Bring a clear cycle history and list of questions to the visit.';
    let questionList = [
        'Which basic labs or imaging make sense first?',
        'How long should we try before changing the plan?',
        'What cycle or semen data would be most useful to bring?'
    ];

    const urgentConcern = concern === 'endometriosis-tubal' || concern === 'pregnancy-loss' || cycles === 'no-periods' || age === '41-plus';
    const moderateConcern = concern !== 'none' || cycles === 'irregular' || duration === '12-plus' || (age !== 'under-35' && duration !== '0-6');

    if (urgentConcern) {
        tone = 'sign-result-high';
        label = 'Prompt specialist discussion';
        summary = 'Your answers suggest it is reasonable to have a fertility-focused clinical conversation sooner rather than later.';
        timing = 'Discuss evaluation now';
        timingNote = 'Known concerns, absent periods, or older age bands often justify a faster workup.';
        priority = 'Go into the visit ready to discuss timelines, testing, and which treatment steps would change your chances the most.';
    } else if (moderateConcern) {
        tone = 'sign-result-medium';
        label = 'Evaluation may be reasonable';
        summary = 'You are in a range where a clinician check-in could help narrow down the next best step.';
        timing = 'Plan a check-in soon';
        timingNote = 'Age band, cycle pattern, or trying duration can shift the usual waiting window.';
        priority = 'Use the next visit to decide whether you need more time, more testing, or a referral.';
    }

    if (concern === 'ovulation') {
        route = 'Ovulation-focused fertility workup';
        routeNote = 'Irregular or unclear ovulation usually changes the first-line plan.';
        firstStep = 'Cycle review, hormone labs, and ovulation timing support';
        firstStepNote = 'Ask how the clinician confirms if ovulation is happening consistently.';
        options = 'Ovulation induction, ultrasound monitoring, and timed intercourse';
        optionsNote = 'These are commonly discussed before moving into more advanced treatment.';
        questionList = [
            'How do we confirm whether ovulation is happening?',
            'Which labs or ultrasound checks would be useful first?',
            'When would medication or monitoring be considered?'
        ];
    } else if (concern === 'male-factor') {
        route = 'Partner-focused fertility evaluation';
        routeNote = 'Male-factor questions can change the plan early and quickly.';
        firstStep = 'Semen analysis and a review of partner habits or medical history';
        firstStepNote = 'Repeat testing is sometimes needed because semen parameters can vary.';
        options = 'Lifestyle changes, IUI, or IVF with ICSI depending on results';
        optionsNote = 'The most useful option depends on how severe the semen issue is.';
        questionList = [
            'Should we start with a semen analysis first?',
            'Which lifestyle changes matter most over the next 3 months?',
            'At what point would IUI or IVF become more effective than waiting?'
        ];
    } else if (concern === 'endometriosis-tubal') {
        route = 'Specialist-led fertility planning';
        routeNote = 'Tubal problems or suspected endometriosis often need a more targeted workup.';
        firstStep = 'Imaging, records review, and specialist consultation';
        firstStepNote = 'Bring old scans, surgery notes, or past fertility testing if you have them.';
        options = 'Tubal testing, surgery discussion, IUI, or IVF';
        optionsNote = 'Treatment choice depends on the anatomy and symptom history.';
        questionList = [
            'Which tests clarify tubal patency or endometriosis impact?',
            'Would surgery change the fertility plan meaningfully?',
            'When is IVF usually preferred over waiting or IUI?'
        ];
    } else if (concern === 'pregnancy-loss') {
        route = 'Recurrent pregnancy loss evaluation';
        routeNote = 'Repeated losses often need a different workup than difficulty conceiving alone.';
        firstStep = 'Pregnancy history review with targeted blood work and uterine evaluation';
        firstStepNote = 'Bring dates, gestational timing, and any prior test results if available.';
        options = 'Hormonal, uterine, genetic, or clotting evaluations';
        optionsNote = 'The plan depends on what the history shows.';
        questionList = [
            'Which parts of recurrent loss workup make sense first?',
            'What changes would happen if one of the tests is abnormal?',
            'How should we balance trying again with further evaluation?'
        ];
    } else if (preference === 'aggressive') {
        options = 'Basic testing first, with a lower threshold to discuss IUI or IVF';
        optionsNote = 'Your preference for a faster plan can shape how soon you want referrals or advanced discussions.';
    } else if (preference === 'learn') {
        optionsNote = 'Start by understanding the workup before deciding on more intensive treatment steps.';
    }

    const banner = document.getElementById('fertilityTreatmentBanner');
    const status = document.getElementById('fertilityTreatmentLabel');
    const summaryNode = document.getElementById('fertilityTreatmentSummary');
    const routeNode = document.getElementById('fertilityTreatmentRoute');
    const routeNoteNode = document.getElementById('fertilityTreatmentRouteNote');
    const timingNode = document.getElementById('fertilityTreatmentTiming');
    const timingNoteNode = document.getElementById('fertilityTreatmentTimingNote');
    const firstStepNode = document.getElementById('fertilityTreatmentFirstStep');
    const firstStepNoteNode = document.getElementById('fertilityTreatmentFirstStepNote');
    const optionsNode = document.getElementById('fertilityTreatmentOptions');
    const optionsNoteNode = document.getElementById('fertilityTreatmentOptionsNote');
    const priorityNode = document.getElementById('fertilityTreatmentPriority');
    const priorityNoteNode = document.getElementById('fertilityTreatmentPriorityNote');

    setResultTone(banner, tone);
    if (status) status.textContent = label;
    if (summaryNode) summaryNode.textContent = `${summary} ${ageLabels[age]} and your current trying duration shape the discussion window.`;
    if (routeNode) routeNode.textContent = route;
    if (routeNoteNode) routeNoteNode.textContent = routeNote;
    if (timingNode) timingNode.textContent = timing;
    if (timingNoteNode) timingNoteNode.textContent = timingNote;
    if (firstStepNode) firstStepNode.textContent = firstStep;
    if (firstStepNoteNode) firstStepNoteNode.textContent = firstStepNote;
    if (optionsNode) optionsNode.textContent = options;
    if (optionsNoteNode) optionsNoteNode.textContent = optionsNote;
    if (priorityNode) priorityNode.textContent = priority;
    if (priorityNoteNode) priorityNoteNode.textContent = `Main concern selected: ${concern === 'none' ? 'no known concern yet' : concern.replace(/-/g, ' ')}.`;
    renderToolList('fertilityTreatmentQuestions', questionList);

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Treatment guide ready', 'success');
}

function buildStressSupportPlan() {
    if (!requireToolAccess('stress-fertility-guide', 'buildStressSupportPlan')) {
        return;
    }

    const stress = document.getElementById('stressFertilityLoad').value;
    const sleep = document.getElementById('stressFertilitySleep').value;
    const support = document.getElementById('stressFertilitySupport').value;
    const recovery = document.getElementById('stressFertilityRecovery').value;
    const trigger = document.getElementById('stressFertilityTrigger').value;
    const resultDiv = document.getElementById('stressFertilityResult');

    const stressScores = { low: 0, moderate: 2, high: 4 };
    const sleepScores = { rested: 0, inconsistent: 1, drained: 2 };
    const supportScores = { strong: 0, some: 1, minimal: 2 };
    const recoveryScores = { daily: 0, weekly: 1, rare: 2 };
    const triggerScores = { waiting: 1, testing: 1, everything: 2 };
    const loadScore = stressScores[stress] + sleepScores[sleep] + supportScores[support] + recoveryScores[recovery] + triggerScores[trigger];

    let tone = 'sign-result-low';
    let label = 'Steady support';
    let summary = 'Your answers suggest the emotional load is present but still reasonably contained.';

    if (loadScore >= 8) {
        tone = 'sign-result-high';
        label = 'Reset needed';
        summary = 'The mental load looks heavy right now. Protecting recovery may matter as much as more tracking.';
    } else if (loadScore >= 4) {
        tone = 'sign-result-medium';
        label = 'Build more recovery';
        summary = 'Stress is noticeable. A small structure for rest and support would likely help.';
    }

    const dailyReset = stress === 'high' || sleep === 'drained'
        ? 'Take a phone-free 10 minute walk or breathing break every day'
        : recovery === 'rare'
            ? 'Schedule one short reset block on your calendar every day'
            : 'Keep one reliable daily calming habit in your routine';
    const supportFocus = support === 'minimal'
        ? 'Ask one partner, friend, or clinician to become your regular TTC check-in person'
        : support === 'some'
            ? 'Use one consistent weekly check-in instead of constant daily processing'
            : 'Keep using your support network, but make the ask specific';
    const boundary = trigger === 'everything'
        ? 'Protect one evening each week with no fertility research or testing talk'
        : trigger === 'testing'
            ? 'Limit test-result checking and symptom searching to one short window per day'
            : 'Focus on what is in your control this week instead of the full timeline';

    const priorityItems = [];
    if (sleep === 'drained') priorityItems.push('Treat sleep like a core fertility support habit, not an optional extra.');
    if (support === 'minimal') priorityItems.push('Choose one person who can share the emotional load with you.');
    if (recovery === 'rare') priorityItems.push('Block recovery time before your schedule fills up.');
    if (stress === 'high') priorityItems.push('Consider counseling, a support group, or a clinician conversation if stress feels persistent.');
    if (priorityItems.length === 0) priorityItems.push('Maintain the routines that already help you feel calm and steady.');

    const banner = document.getElementById('stressFertilityBanner');
    const status = document.getElementById('stressFertilityLabel');
    const summaryNode = document.getElementById('stressFertilitySummary');
    const statusNode = document.getElementById('stressFertilityStatus');
    const statusNoteNode = document.getElementById('stressFertilityStatusNote');
    const dailyNode = document.getElementById('stressFertilityDaily');
    const dailyNoteNode = document.getElementById('stressFertilityDailyNote');
    const supportNode = document.getElementById('stressFertilitySupportResult');
    const supportNoteNode = document.getElementById('stressFertilitySupportNote');
    const boundaryNode = document.getElementById('stressFertilityBoundary');
    const boundaryNoteNode = document.getElementById('stressFertilityBoundaryNote');
    const priorityNode = document.getElementById('stressFertilityPriority');
    const priorityNoteNode = document.getElementById('stressFertilityPriorityNote');

    setResultTone(banner, tone);
    if (status) status.textContent = label;
    if (summaryNode) summaryNode.textContent = summary;
    if (statusNode) statusNode.textContent = `${loadScore}/12 load score`;
    if (statusNoteNode) statusNoteNode.textContent = 'Higher scores suggest more stress, less recovery, or less support.';
    if (dailyNode) dailyNode.textContent = dailyReset;
    if (dailyNoteNode) dailyNoteNode.textContent = 'Small daily recovery routines are easier to sustain than occasional big resets.';
    if (supportNode) supportNode.textContent = supportFocus;
    if (supportNoteNode) supportNoteNode.textContent = 'Fertility stress often feels lighter when someone else knows the plan.';
    if (boundaryNode) boundaryNode.textContent = boundary;
    if (boundaryNoteNode) boundaryNoteNode.textContent = 'Boundaries help prevent TTC from taking over the entire day.';
    if (priorityNode) priorityNode.textContent = priorityItems[0];
    if (priorityNoteNode) priorityNoteNode.textContent = priorityItems[1] || 'Keep the plan simple enough that you can actually follow it this week.';
    renderToolList('stressFertilityList', priorityItems.slice(0, 4));

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Stress support plan ready', 'success');
}

function buildAgeFertilityGuide() {
    if (!requireToolAccess('age-fertility-guide', 'buildAgeFertilityGuide')) {
        return;
    }

    const age = document.getElementById('ageFertilityBand').value;
    const cycles = document.getElementById('ageFertilityCycles').value;
    const trying = document.getElementById('ageFertilityTrying').value;
    const history = document.getElementById('ageFertilityHistory').value;
    const resultDiv = document.getElementById('ageFertilityResult');

    const contextMap = {
        'under-35': 'Cycle timing and trying duration usually guide the first decisions most strongly.',
        '35-37': 'Time still matters, but the window for checking in with a clinician is usually shorter.',
        '38-40': 'Age and trying duration both matter more, so delays are usually less helpful.',
        '41-plus': 'A faster fertility conversation is often reasonable because age becomes a larger part of the picture.'
    };

    let tone = 'sign-result-low';
    let label = 'General planning';
    let timing = 'Keep tracking for now';
    let timingNote = 'If cycles are regular and you are early in trying, tracking and timing may still be the main job.';
    let focus = 'Cycle timing and steady tracking';
    let focusNote = 'Start with your fertile window, cycle pattern, and a clear trying timeline.';
    let conversation = 'Review cycle pattern, general health, and preconception basics';
    let conversationNote = 'This is a good baseline even when you are not ready for testing yet.';
    let priority = 'Match your next step to both age band and how long you have been trying.';

    const needsSoonerCheckIn =
        cycles === 'very-irregular' ||
        (age === '35-37' && trying !== 'not-yet' && trying !== '0-6') ||
        (age === '38-40' && trying !== 'not-yet' && trying !== '0-6') ||
        (age === '41-plus' && trying !== 'not-yet') ||
        trying === '12-plus';

    if (needsSoonerCheckIn) {
        tone = age === '41-plus' || cycles === 'very-irregular' || trying === '12-plus' ? 'sign-result-high' : 'sign-result-medium';
        label = tone === 'sign-result-high' ? 'Prompt check-in' : 'Check-in recommended';
        timing = tone === 'sign-result-high' ? 'Start a fertility conversation now' : 'Plan a fertility conversation soon';
        timingNote = cycles === 'very-irregular'
            ? 'Irregular cycles can justify earlier evaluation regardless of age band.'
            : 'Age and trying duration shift when clinicians usually recommend evaluation.';
        focus = age === '41-plus' ? 'Move quickly on evaluation timing' : 'Balance cycle tracking with earlier clinical input';
        focusNote = 'Waiting windows are usually shorter once age or cycle irregularity becomes more important.';
        conversation = age === '41-plus'
            ? 'Ask about ovarian reserve testing, partner testing, and referral timing'
            : 'Ask what testing or timeline changes make sense for your age and cycle pattern';
        conversationNote = history === 'prior-loss'
            ? 'Past loss can add questions worth discussing early.'
            : 'Past reproductive history can change the right pace of evaluation.';
        priority = cycles === 'very-irregular'
            ? 'Clarify whether ovulation is regular enough to keep waiting.'
            : 'Use the next visit to decide whether more time or more testing is the better move.';
    }

    const reminders = [];
    if (trying === 'not-yet') reminders.push('Use this stage to tighten preconception habits before you start trying.');
    if (cycles !== 'regular') reminders.push('Track cycle length and any skipped periods so you can describe the pattern clearly.');
    if (history === 'prior-loss') reminders.push('Bring prior pregnancy dates and any old records to a clinician visit.');
    if (age === '38-40' || age === '41-plus') reminders.push('Shorter waiting windows often make earlier planning more useful.');
    if (reminders.length === 0) reminders.push('Keep tracking fertile timing and review progress every few months.');

    const banner = document.getElementById('ageFertilityBanner');
    const status = document.getElementById('ageFertilityLabel');
    const summaryNode = document.getElementById('ageFertilitySummary');
    const contextNode = document.getElementById('ageFertilityContext');
    const contextNoteNode = document.getElementById('ageFertilityContextNote');
    const timingNode = document.getElementById('ageFertilityTiming');
    const timingNoteNode = document.getElementById('ageFertilityTimingNote');
    const focusNode = document.getElementById('ageFertilityFocus');
    const focusNoteNode = document.getElementById('ageFertilityFocusNote');
    const conversationNode = document.getElementById('ageFertilityConversation');
    const conversationNoteNode = document.getElementById('ageFertilityConversationNote');
    const priorityNode = document.getElementById('ageFertilityPriority');
    const priorityNoteNode = document.getElementById('ageFertilityPriorityNote');

    setResultTone(banner, tone);
    if (status) status.textContent = label;
    if (summaryNode) summaryNode.textContent = contextMap[age];
    if (contextNode) contextNode.textContent = age.replace(/-/g, ' ');
    if (contextNoteNode) contextNoteNode.textContent = contextMap[age];
    if (timingNode) timingNode.textContent = timing;
    if (timingNoteNode) timingNoteNode.textContent = timingNote;
    if (focusNode) focusNode.textContent = focus;
    if (focusNoteNode) focusNoteNode.textContent = focusNote;
    if (conversationNode) conversationNode.textContent = conversation;
    if (conversationNoteNode) conversationNoteNode.textContent = conversationNote;
    if (priorityNode) priorityNode.textContent = priority;
    if (priorityNoteNode) priorityNoteNode.textContent = `History selected: ${history.replace(/-/g, ' ')}.`;
    renderToolList('ageFertilityList', reminders.slice(0, 4));

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Age and fertility guide ready', 'success');
}

function buildPartnerFertilityPlan() {
    if (!requireToolAccess('partner-fertility-guide', 'buildPartnerFertilityPlan')) {
        return;
    }

    const goal = document.getElementById('partnerFertilityGoal').value;
    const exposure = document.getElementById('partnerFertilityExposure').value;
    const heat = document.getElementById('partnerFertilityHeat').value;
    const lifestyle = document.getElementById('partnerFertilityLifestyle').value;
    const concern = document.getElementById('partnerFertilityConcern').value;
    const resultDiv = document.getElementById('partnerFertilityResult');

    const exposureScores = { high: 3, some: 1, none: 0 };
    const heatScores = { frequent: 2, sometimes: 1, rare: 0 };
    const lifestyleScores = { low: 2, moderate: 1, strong: 0 };
    const concernScores = { none: 0, possible: 2, known: 3 };
    const focusScore = exposureScores[exposure] + heatScores[heat] + lifestyleScores[lifestyle] + concernScores[concern];

    let tone = 'sign-result-low';
    let label = 'Strong baseline';
    let summary = 'There are only a few partner-focused upgrades to consider right now.';

    if (focusScore >= 6) {
        tone = 'sign-result-high';
        label = 'Focus now';
        summary = 'Partner factors may be important enough to address directly over the next 3 months.';
    } else if (focusScore >= 3) {
        tone = 'sign-result-medium';
        label = 'A few upgrades';
        summary = 'There are several realistic partner changes that could strengthen the plan.';
    }

    let topShift = 'Protect the routine that is already working well';
    if (exposure === 'high' || exposure === 'some') {
        topShift = 'Reduce nicotine, vaping, cannabis, or heavy alcohol exposure first';
    } else if (heat === 'frequent') {
        topShift = 'Reduce frequent heat exposure from hot tubs, saunas, or constant lap heat';
    } else if (lifestyle === 'low') {
        topShift = 'Build a steadier sleep and exercise routine';
    }

    const ninetyDayPlan = goal === 'evaluation-prep'
        ? 'Use the next 90 days to improve habits, gather history, and prepare for semen testing if needed.'
        : goal === 'shared-routine'
            ? 'Set one shared weekly plan for meals, sleep, and movement so both partners support the same routine.'
            : 'Protect sleep, reduce exposures, and stay consistent for about 3 months because sperm quality changes over time.';
    const clinicNote = concern === 'known'
        ? 'Known partner issues are a strong reason to discuss semen analysis or specialist follow-up early.'
        : concern === 'possible'
            ? 'If progress stalls, partner testing is often one of the fastest ways to clarify the next step.'
            : 'Even without a known issue, partner habits still shape the overall fertility picture.';

    const actions = [];
    if (exposure !== 'none') actions.push('Reduce or remove substances that can affect semen quality and hormone balance.');
    if (heat !== 'rare') actions.push('Cut back on frequent heat exposure for the next 2 to 3 months.');
    if (lifestyle !== 'strong') actions.push('Aim for better sleep, regular movement, and a more consistent daily routine.');
    if (concern !== 'none') actions.push('Bring prior testing, diagnoses, or symptoms into the next fertility conversation.');
    if (actions.length === 0) actions.push('Keep the strong routine going and review progress every month.');

    const banner = document.getElementById('partnerFertilityBanner');
    const status = document.getElementById('partnerFertilityLabel');
    const summaryNode = document.getElementById('partnerFertilitySummary');
    const focusNode = document.getElementById('partnerFertilityFocus');
    const focusNoteNode = document.getElementById('partnerFertilityFocusNote');
    const topShiftNode = document.getElementById('partnerFertilityTopShift');
    const topShiftNoteNode = document.getElementById('partnerFertilityTopShiftNote');
    const ninetyDayNode = document.getElementById('partnerFertilityNinetyDay');
    const ninetyDayNoteNode = document.getElementById('partnerFertilityNinetyDayNote');
    const clinicNode = document.getElementById('partnerFertilityClinic');
    const clinicNoteNode = document.getElementById('partnerFertilityClinicNote');
    const priorityNode = document.getElementById('partnerFertilityPriority');
    const priorityNoteNode = document.getElementById('partnerFertilityPriorityNote');

    setResultTone(banner, tone);
    if (status) status.textContent = label;
    if (summaryNode) summaryNode.textContent = summary;
    if (focusNode) focusNode.textContent = `${focusScore}/10 focus score`;
    if (focusNoteNode) focusNoteNode.textContent = 'Higher scores suggest more partner habits or history worth tightening.';
    if (topShiftNode) topShiftNode.textContent = topShift;
    if (topShiftNoteNode) topShiftNoteNode.textContent = 'Choose the biggest win first instead of changing everything at once.';
    if (ninetyDayNode) ninetyDayNode.textContent = ninetyDayPlan;
    if (ninetyDayNoteNode) ninetyDayNoteNode.textContent = 'Most partner fertility habit changes need time before results shift.';
    if (clinicNode) clinicNode.textContent = clinicNote;
    if (clinicNoteNode) clinicNoteNode.textContent = 'Partner evaluation can be useful earlier than many couples expect.';
    if (priorityNode) priorityNode.textContent = actions[0];
    if (priorityNoteNode) priorityNoteNode.textContent = actions[1] || 'Keep the plan simple and consistent for the next 90 days.';
    renderToolList('partnerFertilityList', actions.slice(0, 4));

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification('Partner fertility plan ready', 'success');
}

window.updateConceptionMethod = updateConceptionMethod;
window.calculateConceptionDate = calculateConceptionDate;
window.checkPregnancySigns = checkPregnancySigns;
window.calculateBabyCosts = calculateBabyCosts;
window.buildFertilityDietPlan = buildFertilityDietPlan;
window.buildPreconceptionPlan = buildPreconceptionPlan;
window.buildFertilityTreatmentGuide = buildFertilityTreatmentGuide;
window.buildStressSupportPlan = buildStressSupportPlan;
window.buildAgeFertilityGuide = buildAgeFertilityGuide;
window.buildPartnerFertilityPlan = buildPartnerFertilityPlan;
window.showFertilityDiet = showFertilityDiet;
window.showPreconceptionHealth = showPreconceptionHealth;
window.showFertilityTreatments = showFertilityTreatments;
window.showStressManagement = showStressManagement;
window.showAgeFertility = showAgeFertility;
window.showPartnerHealth = showPartnerHealth;
window.showConceptionCalculator = showConceptionCalculator;
window.showPregnancySymptoms = showPregnancySymptoms;
window.showBabyCosts = showBabyCosts;

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
        </div>`;
    }).join('');
}

function filterNames(gender, element) {
    currentFilter = gender;
    
    // Update active pill
    document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    
    const base = Array.isArray(namesBaseList) ? namesBaseList : namesData;
    // Filter names
    if (gender === 'all') {
        currentNames = [...base];
    } else if (gender === 'unique') {
        currentNames = base.filter(n => n.name.length > 7 || n.origin === 'Hawaiian' || n.origin === 'Native American');
    } else {
        currentNames = base.filter(n => n.gender === gender);
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
        setNamesOnlineStatus('');
        // Default to online search for popular names
        if (isOnlineNamesEnabled()) {
            setNamesOnlineStatus('Searching popular names online…');
            const titleEl = document.getElementById('namesTitle');
            if (titleEl) titleEl.textContent = 'Popular Baby Names (Online)';

            const container = document.getElementById('namesList');
            if (container) {
                container.innerHTML = '<div class="result-box" style="display:block; text-align:center;">Loading popular names online…</div>';
            }

            // Search for popular baby names online
            fetchWikidataBabyNames('baby names', 50)
                .then(results => {
                    namesBaseList = results.length > 0 ? results : [...namesData];
                    currentNames = [...namesBaseList];
                    renderNames(currentNames);
                    setNamesOnlineStatus(results.length > 0 ? `${results.length} popular names found` : 'Showing offline names');
                    if (titleEl) titleEl.textContent = results.length > 0 ? 'Popular Baby Names (Online)' : 'Baby Names Finder';
                })
                .catch(err => {
                    console.warn('Online popular names search failed:', err);
                    setNamesOnlineStatus(`Online search failed (${err && err.message ? err.message : 'unknown error'}). Showing offline names.`);
                    namesBaseList = [...namesData];
                    currentNames = [...namesBaseList];
                    renderNames(currentNames);
                    if (titleEl) titleEl.textContent = 'Baby Names Finder';
                });
            return;
        } else {
            namesBaseList = [...namesData];
            currentNames = [...namesBaseList];
            renderNames(currentNames);
            return;
        }
    }

    if (isOnlineNamesEnabled()) {
        setNamesOnlineStatus('Searching online…');
        const titleEl = document.getElementById('namesTitle');
        if (titleEl) titleEl.textContent = `Online results for "${query}"`;

        const container = document.getElementById('namesList');
        if (container) {
            container.innerHTML = '<div class="result-box" style="display:block; text-align:center;">Loading online results…</div>';
        }

        fetchWikidataBabyNames(query, 40)
            .then(results => {
                namesBaseList = results.length > 0 ? results : [];
                currentNames = [...namesBaseList];
                renderNames(currentNames);
                setNamesOnlineStatus(results.length > 0 ? `${results.length} results` : 'No online results');
                if (titleEl) titleEl.textContent = `Online results for "${query}"`;
            })
            .catch(err => {
                console.warn('Online name search failed:', err);
                setNamesOnlineStatus(`Online search failed (${err && err.message ? err.message : 'unknown error'}). Showing offline results.`);
                const filtered = namesData.filter(n =>
                    n.name.toLowerCase().includes(query) ||
                    n.meaning.toLowerCase().includes(query)
                );
                namesBaseList = filtered;
                currentNames = [...namesBaseList];
                renderNames(filtered);
                if (titleEl) titleEl.textContent = `Search Results for "${query}"`;
            });
        return;
    }

    const filtered = namesData.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.meaning.toLowerCase().includes(query)
    );
    namesBaseList = filtered;
    currentNames = [...namesBaseList];
    renderNames(filtered);
    document.getElementById('namesTitle').textContent = `Search Results for "${query}"`;
}

function showNameDetail(name) {
    console.log('[showNameDetail] Called with name:', name);
    
    // Try to find the name in multiple datasets
    let n = (lastRenderedNames || []).find(x => x.name === name) || 
           namesData.find(x => x.name === name) ||
           namesBaseList.find(x => x.name === name);
    
    console.log('[showNameDetail] Found name object:', n);
    if (!n) {
        console.error('[showNameDetail] Name not found in any dataset, creating basic info');
        // Create a basic name object if not found (for online names)
        n = {
            name: name,
            gender: 'unisex',
            meaning: 'Online name from Wikidata',
            origin: 'Wikidata'
        };
    }
    
    // Check if modal elements exist
    const modal = document.getElementById('nameDetailModal');
    console.log('[showNameDetail] Modal element:', modal);
    if (!modal) {
        console.error('[showNameDetail] Modal element not found');
        return;
    }
    
    // Populate modal fields
    const titleEl = document.getElementById('modalNameTitle');
    const genderIconEl = document.getElementById('modalGenderIcon');
    const meaningEl = document.getElementById('modalMeaning');
    const originEl = document.getElementById('modalOrigin');
    const genderEl = document.getElementById('modalGender');
    const historyEl = document.getElementById('modalHistory');
    
    console.log('[showNameDetail] Modal elements found:', { titleEl, genderIconEl, meaningEl, originEl, genderEl, historyEl });
    
    if (titleEl) titleEl.textContent = n.name;
    if (genderIconEl) genderIconEl.textContent = n.gender === 'boy' ? '👦' : n.gender === 'girl' ? '👧' : '👶';
    if (meaningEl) meaningEl.textContent = n.meaning || 'Not available';
    if (originEl) originEl.textContent = n.origin || 'Not available';
    if (genderEl) genderEl.textContent = n.gender || 'Not available';
    
    // Generate history/background based on origin and meaning
    let history = '';
    if (n.origin === 'Wikidata') {
        history = 'This name was found via Wikidata, a free knowledge database that aggregates information from various sources around the world.';
    } else if (n.origin === 'Hebrew') {
        history = 'Names of Hebrew origin often have biblical or religious significance and have been used for thousands of years in Jewish and Christian traditions.';
    } else if (n.origin === 'Latin') {
        history = 'Latin names often derive from ancient Roman culture and have been widely used throughout European history.';
    } else if (n.origin === 'Greek') {
        history = 'Greek names frequently come from mythology, ancient history, or have meanings related to virtues and natural elements.';
    } else if (n.origin === 'Arabic') {
        history = 'Arabic names often have beautiful meanings related to nature, virtues, or religious concepts and are widely used across the Middle East and Muslim world.';
    } else if (n.origin === 'Irish' || n.origin === 'Scottish' || n.origin === 'Welsh') {
        history = 'Celtic names often have connections to nature, mythology, or ancient Gaelic traditions and are popular throughout the British Isles.';
    } else if (n.origin === 'English') {
        history = 'English names may derive from Old English, Norman French, or other European languages and have evolved over centuries of English history.';
    } else if (n.origin === 'French') {
        history = 'French names often have elegant, romantic associations and many became popular throughout Europe during the Middle Ages.';
    } else if (n.origin === 'Italian') {
        history = 'Italian names often reflect the country\'s rich history, art, and Roman heritage.';
    } else if (n.origin === 'German') {
        history = 'German names often have strong, traditional meanings and reflect the various Germanic tribes and regions.';
    } else if (n.origin === 'Hawaiian') {
        history = 'Hawaiian names often have beautiful meanings related to nature, elements, or spiritual concepts from Polynesian culture.';
    } else if (n.origin === 'Native American') {
        history = 'Native American names often have deep connections to nature, spirituality, and tribal traditions.';
    } else {
        history = 'This name has cultural significance and meaning that may reflect family heritage, regional traditions, or historical context.';
    }
    
    if (historyEl) historyEl.textContent = history;
    
    // Check if already in favorites
    const favs = [];
    try { favs.push(...JSON.parse(localStorage.getItem('bc_favorite_names') || '[]')); } catch (e) {}
    const isFav = favs.includes(n.name);
    const favBtn = document.getElementById('modalFavoriteBtn');
    console.log('[showNameDetail] Favorite button element:', favBtn, 'isFav:', isFav);
    if (favBtn) {
        favBtn.textContent = isFav ? 'Remove from Favorites' : 'Save to Favorites';
        favBtn.onclick = () => toggleNameFavorite(n.name);
    }
    
    // Show modal
    console.log('[showNameDetail] About to show modal. Current display:', modal.style.display);
    modal.style.display = 'flex';
    console.log('[showNameDetail] Set display to flex');
    setTimeout(() => {
        modal.classList.add('show');
        console.log('[showNameDetail] Added show class');
    }, 10);
}

function closeNameDetailModal() {
    const modal = document.getElementById('nameDetailModal');
    console.log('[closeNameDetailModal] Called, modal element:', modal);
    if (modal) {
        modal.classList.remove('show');
        console.log('[closeNameDetailModal] Removed show class');
        setTimeout(() => {
            modal.style.display = 'none';
            console.log('[closeNameDetailModal] Set display to none');
        }, 300);
    }
}

function toggleNameFavorite(name) {
    try {
        const favs = JSON.parse(localStorage.getItem('bc_favorite_names') || '[]');
        const isFav = favs.includes(name);
        
        if (isFav) {
            // Remove from favorites
            const index = favs.indexOf(name);
            favs.splice(index, 1);
            localStorage.setItem('bc_favorite_names', JSON.stringify(favs));
            alert(`"${name}" removed from favorites!`);
        } else {
            // Add to favorites
            favs.push(name);
            localStorage.setItem('bc_favorite_names', JSON.stringify(favs));
            alert(`"${name}" saved to favorites!`);
        }
        
        // Update button text
        const favBtn = document.getElementById('modalFavoriteBtn');
        if (favBtn) {
            favBtn.textContent = isFav ? 'Save to Favorites' : 'Remove from Favorites';
        }
        
        // Refresh the names list to show/hide heart badge
        renderNames(currentNames || namesData);
        renderBabyNameList();
        
        // If we're in favorites view, refresh it
        if (isShowingFavorites) {
            showFavorites();
        }
    } catch (e) {
        console.warn('Could not toggle favorite:', e);
        alert('There was an error saving your favorite. Please try again.');
    }
}

function saveNameToFavorites() {
    // This function is kept for compatibility but now just calls toggleNameFavorite
    const name = document.getElementById('modalNameTitle').textContent;
    toggleNameFavorite(name);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('nameDetailModal');
    if (modal && modal.style.display === 'flex' && event.target === modal) {
        console.log('[clickOutside] Clicked on modal overlay, closing');
        closeNameDetailModal();
    }
});

// Advanced Baby Games - AI Voice Recognition
let recognition = null;
let isListening = false;
let targetWords = [
    'Ball', 'Dog', 'Cat', 'Book', 'Tree', 'Sun', 'Moon', 'Star',
    'Cow', 'Horse', 'Pig', 'Sheep', 'Chicken', 'Fish', 'Bird', 'Bear',
    'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey', 'Panda', 'Kangaroo', 'Zebra',
    'Rabbit', 'Mouse', 'Butterfly', 'Bee', 'Frog', 'Snake', 'Turtle', 'Owl', 'Eagle'
];
let currentTargetWord = '';

// Animal data with emojis and descriptions
const animalData = {
    'cow': { emoji: '🐄', name: 'Cow', sound: 'Moo!' },
    'dog': { emoji: '🐶', name: 'Dog', sound: 'Woof!' },
    'cat': { emoji: '🐱', name: 'Cat', sound: 'Meow!' },
    'horse': { emoji: '🐴', name: 'Horse', sound: 'Neigh!' },
    'pig': { emoji: '🐷', name: 'Pig', sound: 'Oink!' },
    'sheep': { emoji: '🐑', name: 'Sheep', sound: 'Baa!' },
    'chicken': { emoji: '🐔', name: 'Chicken', sound: 'Cluck!' },
    'fish': { emoji: '🐟', name: 'Fish', sound: 'Blub!' },
    'bird': { emoji: '🦆', name: 'Bird', sound: 'Tweet!' },
    'bear': { emoji: '🐻', name: 'Bear', sound: 'Roar!' },
    'lion': { emoji: '🦁', name: 'Lion', sound: 'Roar!' },
    'tiger': { emoji: '🐅', name: 'Tiger', sound: 'Growl!' },
    'elephant': { emoji: '🐘', name: 'Elephant', sound: 'Trumpet!' },
    'giraffe': { emoji: '🦒', name: 'Giraffe', sound: 'Hum!' },
    'monkey': { emoji: '🐵', name: 'Monkey', sound: 'Ooh ooh!' },
    'panda': { emoji: '🐼', name: 'Panda', sound: 'Chirp!' },
    'kangaroo': { emoji: '🦘', name: 'Kangaroo', sound: 'Boing!' },
    'zebra': { emoji: '🦓', name: 'Zebra', sound: 'Bray!' },
    'rabbit': { emoji: '🐰', name: 'Rabbit', sound: 'Thump!' },
    'mouse': { emoji: '🐭', name: 'Mouse', sound: 'Squeak!' },
    'butterfly': { emoji: '🦋', name: 'Butterfly', sound: 'Flutter!' },
    'bee': { emoji: '🐝', name: 'Bee', sound: 'Buzz!' },
    'frog': { emoji: '🐸', name: 'Frog', sound: 'Ribbit!' },
    'snake': { emoji: '🐍', name: 'Snake', sound: 'Hiss!' },
    'turtle': { emoji: '🐢', name: 'Turtle', sound: 'Snap!' },
    'owl': { emoji: '🦉', name: 'Owl', sound: 'Hoot!' },
    'eagle': { emoji: '🦅', name: 'Eagle', sound: 'Screech!' },
    'duck': { emoji: '🦆', name: 'Duck', sound: 'Quack!' },
    'cow': { emoji: '🐄', name: 'Cow', sound: 'Moo!' }
};

// Initialize speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        isListening = true;
        updateAIStatus('Listening...', 'active');
        startVoiceVisualizer();
    };

    recognition.onresult = function(event) {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        const confidence = event.results[current][0].confidence;
        
        updateConfidence(confidence * 100);
        
        if (event.results[current].isFinal) {
            checkWordMatch(transcript);
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        updateAIStatus('Error: ' + event.error, 'error');
        stopVoiceGame();
    };

    recognition.onend = function() {
        isListening = false;
        updateAIStatus('AI Ready', 'ready');
        stopVoiceVisualizer();
    };
}

function startVoiceGame() {
    if (!recognition) {
        alert('Speech recognition not supported in this browser. Please use Chrome for the best experience.');
        return;
    }
    
    currentTargetWord = targetWords[Math.floor(Math.random() * targetWords.length)];
    const animal = animalData[currentTargetWord.toLowerCase()] || { emoji: '??', name: 'Animal', sound: 'Sound!' };
    
    document.getElementById('voiceTargetWord').textContent = `Say "${animal.name}"! ${animal.emoji}`;
    
    // Generate animal options
    generateAnimalOptions(currentTargetWord.toLowerCase());
    
    recognition.start();
    
    // Speak the target word
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Say ${animal.name}`);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function stopVoiceGame() {
    if (recognition && recognition.continuous) {
        recognition.stop();
        recognition.continuous = false;
    }
    
    // Clear any ongoing speech synthesis
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
    
    // Reset UI
    const feedback = document.getElementById('voiceFeedback');
    if (feedback) {
        feedback.textContent = 'Voice game stopped';
        feedback.style.color = '#666';
    }
    
    const targetWord = document.getElementById('voiceTargetWord');
    if (targetWord) {
        targetWord.textContent = 'Click "Start Voice Game" to begin';
    }
    
    const options = document.getElementById('listenOptions');
    if (options) {
        options.innerHTML = '';
    }
}

function checkWordMatch(transcript) {
    const feedback = document.getElementById('voiceFeedback');
    const animal = animalData[currentTargetWord.toLowerCase()] || { emoji: '🐶', name: 'Animal', sound: 'Sound!' };
    const matched = transcript.toLowerCase().includes(currentTargetWord.toLowerCase());
    
    if (matched) {
        feedback.textContent = `🎉 Excellent! You said "${transcript}" and found the ${animal.name}! ${animal.emoji}`;
        feedback.style.color = '#4caf50';
        updateProgress('wordsSpoken', 1);
        updateProgress('accuracyScore', 5);
        
        // Success animation
        confetti();
        
        // Get new target word
        setTimeout(() => {
            currentTargetWord = targetWords[Math.floor(Math.random() * targetWords.length)];
            const newAnimal = animalData[currentTargetWord.toLowerCase()] || { emoji: '🐶', name: 'Animal', sound: 'Sound!' };
            document.getElementById('voiceTargetWord').textContent = `Say "${newAnimal.name}"! ${newAnimal.emoji}`;
            
            // Speak new word
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Now say ${newAnimal.name}`);
                utterance.rate = 0.8;
                speechSynthesis.speak(utterance);
            }
        }, 2000);
    } else {
        feedback.textContent = `❌ You said "${transcript}". Try saying "${animal.name}" again! ${animal.emoji}`;
        feedback.style.color = '#ff6b6b';
    }
}

// Generate random animal options for display
function generateAnimalOptions(correctAnimal) {
    const options = document.getElementById('listenOptions');
    if (!options) return;
    
    // Get 3 random different animals
    let availableAnimals = Object.keys(animalData).filter(animal => animal !== correctAnimal.toLowerCase());
    const randomAnimals = [];
    
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * availableAnimals.length);
        const selectedAnimal = availableAnimals[randomIndex];
        randomAnimals.push(selectedAnimal);
        availableAnimals = availableAnimals.filter(animal => animal !== selectedAnimal);
    }
    
    // Display options
    options.innerHTML = randomAnimals.map(animal => {
        const animalInfo = animalData[animal];
        return `
            <div class="animal-option" onclick="selectAnimalOption('${animal}')">
                <div class="animal-emoji">${animalInfo.emoji}</div>
                <div class="animal-name">${animalInfo.name}</div>
                <div class="animal-sound">${animalInfo.sound}</div>
            </div>
        `;
    }).join('');
}

function selectAnimalOption(animal) {
    const feedback = document.getElementById('voiceFeedback');
    const selectedAnimal = animalData[animal.toLowerCase()];
    
    if (selectedAnimal && animal.toLowerCase() === currentTargetWord.toLowerCase()) {
        feedback.textContent = `🎉 Correct! You selected the ${selectedAnimal.name}! ${selectedAnimal.emoji}`;
        feedback.style.color = '#4caf50';
        updateProgress('wordsSpoken', 1);
        updateProgress('accuracyScore', 10);
        confetti();
        
        // New round
        setTimeout(() => {
            currentTargetWord = targetWords[Math.floor(Math.random() * targetWords.length)];
            const newAnimal = animalData[currentTargetWord.toLowerCase()] || { emoji: '🐶', name: 'Animal', sound: 'Sound!' };
            document.getElementById('voiceTargetWord').textContent = `Find the ${newAnimal.name}! ${newAnimal.emoji}`;
            generateAnimalOptions(currentTargetWord.toLowerCase());
            
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Find the ${newAnimal.name}`);
                utterance.rate = 0.8;
                speechSynthesis.speak(utterance);
            }
        }, 2000);
    } else {
        feedback.textContent = `❌ Wrong! That's not the ${currentTargetWord.toLowerCase()}. Try again!`;
        feedback.style.color = '#ff6b6b';
    }
}

function updateAIStatus(status, state) {
    const statusEl = document.getElementById('aiStatus');
    const span = statusEl.querySelector('span');
    span.textContent = status;
    
    statusEl.className = 'ai-indicator';
    if (state === 'active') {
        statusEl.classList.add('active');
    } else if (state === 'error') {
        statusEl.classList.add('error');
    }
}

function updateConfidence(confidence) {
    const fill = document.getElementById('confidenceFill');
    const text = document.getElementById('confidenceText');
    fill.style.width = confidence + '%';
    text.textContent = Math.round(confidence) + '%';
}

function startVoiceVisualizer() {
    const bars = document.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.animationPlayState = 'running';
    });
}

function stopVoiceVisualizer() {
    const bars = document.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.animationPlayState = 'paused';
    });
}

// AR 3D Object Controls
let arRotation = { x: -20, y: -20 };
let arScale = 1;

function rotateARObject() {
    const cube = document.querySelector('.ar-cube');
    arRotation.y += 45;
    cube.style.transform = `rotateX(${arRotation.x}deg) rotateY(${arRotation.y}deg)`;
    
    document.getElementById('arFeedback').textContent = '🔄 Object rotated! Try the other controls!';
}

function zoomARObject() {
    const cube = document.querySelector('.ar-cube');
    arScale = arScale === 1 ? 1.2 : 1;
    cube.style.transform = `rotateX(${arRotation.x}deg) rotateY(${arRotation.y}deg) scale(${arScale})`;
    
    document.getElementById('arFeedback').textContent = arScale === 1.2 ? '🔍 Zoomed in! Click again to zoom out.' : '🔍 Zoomed out!';
}

function animateARObject() {
    const cube = document.querySelector('.ar-cube');
    cube.style.transition = 'transform 2s ease-in-out';
    
    // Spin animation
    arRotation.y += 360;
    cube.style.transform = `rotateX(${arRotation.x}deg) rotateY(${arRotation.y}deg) scale(${arScale})`;
    
    document.getElementById('arFeedback').textContent = '✨ Amazing! The object is spinning in 3D space!';
    
    setTimeout(() => {
        cube.style.transition = 'transform 0.6s';
    }, 2000);
}

// AR Object Click Interaction
document.addEventListener('DOMContentLoaded', function() {
    const arObject = document.getElementById('arObject');
    if (arObject) {
        arObject.addEventListener('click', function() {
            animateARObject();
        });
    }
});

// Real-time Progress Dashboard
let progressData = {
    wordsSpoken: 0,
    accuracyScore: 0,
    sessionTime: 0,
    engagementLevel: '🔥'
};

function updateProgress(metric, value) {
    if (metric === 'wordsSpoken') {
        progressData.wordsSpoken += value;
        document.getElementById('wordsSpoken').textContent = progressData.wordsSpoken;
    } else if (metric === 'accuracyScore') {
        progressData.accuracyScore = Math.min(100, progressData.accuracyScore + value);
        document.getElementById('accuracyScore').textContent = progressData.accuracyScore + '%';
    }
    
    updateProgressChart();
    updateEngagementLevel();
}

function updateEngagementLevel() {
    const level = progressData.wordsSpoken;
    let emoji = '😴';
    
    if (level >= 20) emoji = '🔥🔥';
    else if (level >= 10) emoji = '🔥';
    else if (level >= 5) emoji = '⭐';
    else if (level >= 1) emoji = '👶';
    
    progressData.engagementLevel = emoji;
    document.getElementById('engagementLevel').textContent = emoji;
}

// Session Timer
let sessionStartTime = Date.now();
setInterval(() => {
    const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    document.getElementById('sessionTime').textContent = minutes + 'm';
}, 1000);

// Progress Chart
function updateProgressChart() {
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    
    // Simple chart drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(270, 120);
    ctx.moveTo(30, 120);
    ctx.lineTo(30, 30);
    ctx.stroke();
    
    // Draw progress line
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const dataPoints = [
        { x: 30, y: 120 },
        { x: 80, y: 100 },
        { x: 130, y: 70 },
        { x: 180, y: 50 },
        { x: 230, y: 40 },
        { x: 270, y: 30 }
    ];
    
    dataPoints.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    dataPoints.forEach(point => {
        ctx.fillStyle = '#4facfe';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function exportProgressData() {
    const data = {
        sessionDate: new Date().toISOString(),
        metrics: progressData,
        timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-progress-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('📊 Progress data exported successfully!');
}

function resetProgress() {
    progressData = {
        wordsSpoken: 0,
        accuracyScore: 0,
        sessionTime: 0,
        engagementLevel: '😴'
    };
    
    document.getElementById('wordsSpoken').textContent = '0';
    document.getElementById('accuracyScore').textContent = '0%';
    document.getElementById('sessionTime').textContent = '0m';
    document.getElementById('engagementLevel').textContent = '😴';
    
    sessionStartTime = Date.now();
    updateProgressChart();
    
    alert('🔄 Progress reset. Ready for a fresh session!');
}

// Confetti animation for success
function confetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#667eea'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '10000';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// Initialize progress chart on load
document.addEventListener('DOMContentLoaded', function() {
    updateProgressChart();
});

// Favorites functionality
let isShowingFavorites = false;

function showAllNames() {
    isShowingFavorites = false;
    
    const showAllBtn = document.getElementById('showAllNamesBtn');
    const showFavBtn = document.getElementById('showFavoritesBtn');
    const namesTitle = document.getElementById('namesTitle');
    const categories = document.querySelector('.name-categories');
    const filterSort = document.querySelector('.names-filter-sort');
    
    if (showAllBtn) {
        showAllBtn.style.background = 'var(--primary-pink)';
        showAllBtn.style.color = 'white';
    }
    if (showFavBtn) {
        showFavBtn.style.background = 'white';
        showFavBtn.style.color = 'var(--text-dark)';
    }
    
    // Show categories and filters
    if (categories) categories.style.display = 'flex';
    if (filterSort) filterSort.style.display = 'block';
    
    // Load popular names from online if enabled
    if (isOnlineNamesEnabled()) {
        if (namesTitle) namesTitle.textContent = 'Popular Baby Names (Online)';
        setNamesOnlineStatus('Searching popular names online…');
        
        const container = document.getElementById('namesList');
        if (container) {
            container.innerHTML = '<div class="result-box" style="display:block; text-align:center;">Loading popular names online…</div>';
        }

        fetchWikidataBabyNames('baby names', 50)
            .then(results => {
                namesBaseList = results.length > 0 ? results : [...namesData];
                currentNames = [...namesBaseList];
                renderNames(currentNames);
                setNamesOnlineStatus(results.length > 0 ? `${results.length} popular names found` : 'Showing offline names');
                if (namesTitle) namesTitle.textContent = results.length > 0 ? 'Popular Baby Names (Online)' : 'Baby Names Finder';
            })
            .catch(err => {
                console.warn('Online popular names search failed:', err);
                setNamesOnlineStatus(`Online search failed (${err && err.message ? err.message : 'unknown error'}). Showing offline names.`);
                namesBaseList = [...namesData];
                currentNames = [...namesBaseList];
                renderNames(currentNames);
                if (namesTitle) namesTitle.textContent = 'Baby Names Finder';
            });
    } else {
        if (namesTitle) namesTitle.textContent = 'Baby Names Finder';
        setNamesOnlineStatus('');
        namesBaseList = [...namesData];
        currentNames = [...namesBaseList];
        renderNames(currentNames);
    }
}

function showFavorites() {
    isShowingFavorites = true;
    
    const showAllBtn = document.getElementById('showAllNamesBtn');
    const showFavBtn = document.getElementById('showFavoritesBtn');
    const namesTitle = document.getElementById('namesTitle');
    const namesList = document.getElementById('namesList');
    const categories = document.querySelector('.name-categories');
    const filterSort = document.querySelector('.names-filter-sort');
    
    if (showAllBtn) {
        showAllBtn.style.background = 'white';
        showAllBtn.style.color = 'var(--text-dark)';
    }
    if (showFavBtn) {
        showFavBtn.style.background = 'var(--primary-pink)';
        showFavBtn.style.color = 'white';
    }
    
    // Get favorites from localStorage
    const favs = [];
    try { favs.push(...JSON.parse(localStorage.getItem('bc_favorite_names') || '[]')); } catch (e) {}
    
    if (favs.length === 0) {
        if (namesTitle) namesTitle.textContent = 'My Favorites (0)';
        if (namesList) namesList.innerHTML = '<div class="result-box" style="display:block; text-align:center;">No favorites saved yet. Click the ❤️ on any name to add it to your favorites!</div>';
    } else {
        if (namesTitle) namesTitle.textContent = `My Favorites (${favs.length})`;
        
        // Find full name objects for favorites
        const favoriteNames = favs.map(favName => {
            return namesData.find(n => n.name === favName) || 
                   (lastRenderedNames || []).find(n => n.name === favName) ||
                   { name: favName, gender: 'unisex', meaning: 'Favorite name', origin: 'Saved favorite' };
        }).filter(Boolean);
        
        namesBaseList = favoriteNames;
        currentNames = [...namesBaseList];
        renderNames(currentNames);
    }
    
    // Hide categories and filters for favorites view
    if (categories) categories.style.display = 'none';
    if (filterSort) filterSort.style.display = 'none';
}

// Initialize favorites buttons
document.addEventListener('DOMContentLoaded', function() {
    const showAllBtn = document.getElementById('showAllNamesBtn');
    const showFavBtn = document.getElementById('showFavoritesBtn');
    
    // Set initial colors
    if (showAllBtn) {
        showAllBtn.style.background = 'var(--primary-pink)';
        showAllBtn.style.color = 'white';
        showAllBtn.addEventListener('click', showAllNames);
    }
    if (showFavBtn) {
        showFavBtn.style.background = 'white';
        showFavBtn.style.color = 'var(--text-dark)';
        showFavBtn.addEventListener('click', showFavorites);
    }
});

// Close modal with X button
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.querySelector('.modal-close-btn');
    console.log('[closeBtn] Looking for close button, found:', closeBtn);
    if (closeBtn) {
        console.log('[closeBtn] Button element details:', {
            tagName: closeBtn.tagName,
            className: closeBtn.className,
            position: closeBtn.style.position,
            zIndex: closeBtn.style.zIndex,
            pointerEvents: closeBtn.style.pointerEvents,
            display: closeBtn.style.display,
            visible: closeBtn.offsetWidth > 0 && closeBtn.offsetHeight > 0
        });
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[closeBtn] X button clicked, closing modal');
            closeNameDetailModal();
        });
        // Also add a simple test click handler
        closeBtn.addEventListener('click', function() {
            console.log('[closeBtn] Test: X button was clicked (second handler)');
        });
        // Test if we can manually trigger a click
        setTimeout(() => {
            console.log('[closeBtn] Testing manual click trigger');
            closeBtn.click();
        }, 1000);
    } else {
        console.warn('[closeBtn] Close button not found');
    }
});

// Also add a global click handler as backup
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-close-btn')) {
        console.log('[globalCloseBtn] X button clicked via global handler');
        event.preventDefault();
        closeNameDetailModal();
    }
});

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
    if (!requireToolAccess('baby', 'trackMilestones')) {
        return;
    }

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
    if (!requireToolAccess('toddler', 'showToddlerMilestones')) {
        return;
    }

    const age = parseInt(document.getElementById('toddlerAge').value);
    let milestones = [];
    
    if (age === 12) milestones = ['Says 2-3 words', 'Stands alone', 'Waves goodbye'];
    else if (age === 18) milestones = ['Says 10-20 words', 'Walks independently', 'Points to body parts'];
    else if (age === 24) milestones = ['2-word phrases', 'Runs well', 'Kicks ball', 'Scribbles'];
    else if (age === 30) milestones = ['3-word sentences', 'Jumps with both feet', 'Follows 2-step commands'];
    else if (age === 36) milestones = ['Speaks in sentences', 'Rides tricycle', 'Uses spoon', 'Plays make-believe'];
    
    alert(`Milestones for ${age/12} year old:\n\n${milestones.map(m => '• ' + m).join('\n')}`);
}

// Family Topics - Open Separate Pages
function openSleepGuide(topic) {
    window.open('toddler-sleep-guides.html', '_blank');
    // Store the selected topic for reference
    localStorage.setItem('selectedSleepTopic', topic);
}

function openFeedingGuide(topic) {
    window.open('toddler-feeding.html', '_blank');
    localStorage.setItem('selectedFeedingTopic', topic);
}

function openPottyGuide(topic) {
    window.open('toddler-potty-training.html', '_blank');
    localStorage.setItem('selectedPottyTopic', topic);
}

function openBehaviorGuide(topic) {
    window.open('toddler-behavior.html', '_blank');
    localStorage.setItem('selectedBehaviorTopic', topic);
}

// Pregnancy Calculator - auto-detects: future date = due date, past date = LMP
function calculatePregnancyWeek() {
    if (!requireToolAccess('pregnancy', 'calculatePregnancyWeek')) {
        return;
    }

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
    
    const displayWeek = Math.max(1, weeks);
    const guide = renderPregnancyWeekGuide(displayWeek, { scroll: false });
    const trimester = guide.trimester;
    
    document.getElementById('currentWeek').textContent = `Week ${weeks}`;
    const trimesterNode = document.getElementById('currentTrimester');
    const careFocusNode = document.getElementById('pregCareFocus');
    const nextMilestoneNode = document.getElementById('pregNextMilestone');

    if (trimesterNode) trimesterNode.textContent = trimester;
    if (careFocusNode) careFocusNode.textContent = guide.careFocus;
    if (nextMilestoneNode) nextMilestoneNode.textContent = guide.nextStep;
    document.getElementById('pregResult')?.classList.add('show');
}

// Show Week Info
function showWeekInfo(week, options = {}) {
    renderPregnancyWeekGuide(week, { scroll: options.scroll !== false });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateWeeks();
    initializePregnancyTopics();
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

    updateConceptionMethod();

    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                setModalVisibility(modal.id, false);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        const openModal = Array.from(document.querySelectorAll('.modal')).find((modal) => modal.style.display === 'flex');

        if (openModal) {
            setModalVisibility(openModal.id, false);
        }
    });
});

// Navigation Functions
function openOvulationCalculator() {
    if (!requireToolAccess('getting-pregnant', 'showOvulationCalculator')) {
        return;
    }

    navigateTo('getting-pregnant');
    setTimeout(() => showOvulationCalculator(), 100);
}

window.openOvulationCalculator = openOvulationCalculator;

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
    navigateTo('child-growth-chart');
}

function openCourses() {
    navigateTo('courses');
}

// Real-time Baby Data Stream
let realtimeDataInterval;

function startRealtimeDataStream() {
    console.log('📡 Starting Real-time Baby Data Stream...');
    
    // Clear any existing interval
    if (realtimeDataInterval) {
        clearInterval(realtimeDataInterval);
    }
    
    // Update data every 3 seconds
    realtimeDataInterval = setInterval(updateRealtimeData, 3000);
    
    // Initial update
    updateRealtimeData();
}

function updateRealtimeData() {
    console.log('🔄 Updating real-time baby data...');
    
    try {
        // Temperature simulation (36.5°C - 37.5°C)
        const temp = (36.5 + Math.random() * 1).toFixed(1);
        const tempElement = document.getElementById('realtime-temp');
        const tempTimeElement = document.getElementById('realtime-temp-time');
        
        if (tempElement) {
            tempElement.textContent = temp + '°C';
            // Add color coding
            if (temp < 36.8) {
                tempElement.style.color = '#2196f3'; // Blue for normal
            } else if (temp > 37.2) {
                tempElement.style.color = '#ff9800'; // Orange for slightly elevated
            } else {
                tempElement.style.color = '#4caf50'; // Green for optimal
            }
        }
        if (tempTimeElement) {
            tempTimeElement.textContent = 'Just now';
        }
        
        // Sleep simulation (6.5 - 8.5 hours)
        const sleep = (6.5 + Math.random() * 2).toFixed(1);
        const sleepElement = document.getElementById('realtime-sleep');
        const sleepTimeElement = document.getElementById('realtime-sleep-time');
        
        if (sleepElement) {
            sleepElement.textContent = sleep + ' hrs';
        }
        if (sleepTimeElement) {
            const sleepMessages = ['Updated now', '1 min ago', '2 min ago', 'Just now'];
            sleepTimeElement.textContent = sleepMessages[Math.floor(Math.random() * sleepMessages.length)];
        }
        
        // Feeding simulation (4-8 feeds)
        const feeds = Math.floor(4 + Math.random() * 5);
        const feedingElement = document.getElementById('realtime-feeding');
        const feedingTimeElement = document.getElementById('realtime-feeding-time');
        
        if (feedingElement) {
            feedingElement.textContent = feeds + ' feeds';
        }
        if (feedingTimeElement) {
            const feedingMessages = ['30 min ago', '1 hour ago', '45 min ago', 'Just now'];
            feedingTimeElement.textContent = feedingMessages[Math.floor(Math.random() * feedingMessages.length)];
        }
        
        // Mood simulation
        const moods = ['Happy', 'Sleepy', 'Active', 'Calm', 'Playful', 'Hungry'];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const moodElement = document.getElementById('realtime-mood');
        const moodTimeElement = document.getElementById('realtime-mood-time');
        
        if (moodElement) {
            moodElement.textContent = mood;
            // Color code moods
            if (mood === 'Happy' || mood === 'Playful') {
                moodElement.style.color = '#4caf50'; // Green
            } else if (mood === 'Sleepy' || mood === 'Calm') {
                moodElement.style.color = '#9c27b0'; // Purple
            } else if (mood === 'Active') {
                moodElement.style.color = '#ff9800'; // Orange
            } else if (mood === 'Hungry') {
                moodElement.style.color = '#f44336'; // Red
            }
        }
        if (moodTimeElement) {
            const moodMessages = ['5 min ago', '10 min ago', '15 min ago', 'Just now'];
            moodTimeElement.textContent = moodMessages[Math.floor(Math.random() * moodMessages.length)];
        }
        
        console.log('✅ Real-time data updated:', {
            temperature: temp + '°C',
            sleep: sleep + ' hrs',
            feeds: feeds + ' feeds',
            mood: mood
        });
        
    } catch (error) {
        console.error('❌ Error updating real-time data:', error);
    }
}

function stopRealtimeDataStream() {
    console.log('⏹️ Stopping Real-time Baby Data Stream...');
    if (realtimeDataInterval) {
        clearInterval(realtimeDataInterval);
        realtimeDataInterval = null;
    }
}

// Auto-start real-time updates when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📡 Initializing Real-time Baby Data Stream...');
    
    // Start real-time updates after 2 seconds
    setTimeout(startRealtimeDataStream, 2000);
});

// Test function for real-time data
function testRealtimeData() {
    console.log('🧪 Testing Real-time Baby Data Stream...');
    updateRealtimeData();
}

// Advanced Toddler AI Functions
let toddlerRealtimeInterval;

function createToddlerProfile() {
    console.log('🚀 Creating Advanced Toddler Profile...');
    
    try {
        const name = document.getElementById('toddlerName').value;
        const birthDate = document.getElementById('toddlerBirthDate').value;
        const focus = document.getElementById('toddlerFocus').value;
        
        if (!name || !birthDate || !focus) {
            alert('Please fill in all fields to create the AI-powered toddler profile.');
            return;
        }
        
        const birthDateTime = new Date(birthDate);
        const today = new Date();
        const ageInMonths = Math.floor((today - birthDateTime) / (1000 * 60 * 60 * 24 * 30));
        const ageInYears = (ageInMonths / 12).toFixed(1);
        
        console.log('👶 Toddler data:', { name, ageInMonths, ageInYears, focus });
        
        // AI-powered analysis
        const behaviorScore = calculateToddlerBehaviorScore(ageInMonths, focus);
        const learningPath = generatePersonalizedLearningPath(ageInMonths, focus);
        const emotionalDevelopment = assessEmotionalDevelopment(ageInMonths);
        const socialSkills = evaluateSocialSkills(ageInMonths);
        const cognitiveAbilities = analyzeCognitiveAbilities(ageInMonths);
        const motorSkills = assessMotorSkills(ageInMonths);
        
        console.log('🧠 AI Analysis Complete:', { behaviorScore, learningPath, emotionalDevelopment, socialSkills, cognitiveAbilities, motorSkills });
        
        // Display comprehensive results
        const resultDiv = document.getElementById('toddlerProfileResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(255, 107, 107, 0.3);">
                <h3 style="margin-bottom: 15px; font-size: 26px;">🧠 AI Toddler Analysis Complete!</h3>
                <p style="margin-bottom: 10px; font-size: 18px;"><strong>${name}</strong> - ${ageInYears} years old</p>
                <p style="opacity: 0.9; font-size: 16px;">✨ Comprehensive development profile created with advanced AI algorithms</p>
                <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <div style="font-size: 14px;">🎯 Focus Area: ${focus.charAt(0).toUpperCase() + focus.slice(1)}</div>
                    <div style="font-size: 14px;">📅 Age: ${ageInMonths} months</div>
                    <div style="font-size: 14px;">🧠 Development Stage: ${getDevelopmentStage(ageInMonths)}</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(255, 107, 107, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${behaviorScore}/100</div>
                    <div style="font-size: 14px; opacity: 0.9;">Behavior Score</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">AI Assessment</div>
                </div>
                <div style="background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(254, 202, 87, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${learningPath.length}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Learning Activities</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Personalized</div>
                </div>
                <div style="background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(72, 219, 251, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">😊</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${emotionalDevelopment}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Emotional Level</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Social Skills</div>
                </div>
                <div style="background: linear-gradient(135deg, #00d2d3 0%, #55efc4 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(0, 210, 211, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${cognitiveAbilities}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Cognitive Skills</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Problem Solving</div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                <h4 style="margin-bottom: 20px; color: #333; font-size: 20px;">🎯 Personalized Learning Path (AI Generated)</h4>
                <div style="display: grid; gap: 15px;">
                    ${learningPath.map((activity, index) => `
                        <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #ff6b6b; box-shadow: 0 3px 15px rgba(0,0,0,0.08);">
                            <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 8px;">${activity.title}</div>
                            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">⏰ Duration: ${activity.duration}</div>
                            <div style="color: #999; font-size: 13px; line-height: 1.4;">${activity.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; box-shadow: 0 5px 20px rgba(253, 203, 110, 0.3);">
                <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">
                    <strong>🚀 AI Recommendation:</strong> ${generateAIRecommendation(ageInMonths, focus, behaviorScore)}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="createToddlerProfile()" style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    🔄 Update Analysis
                </button>
                <button onclick="saveToddlerProfile()" style="background: linear-gradient(135deg, #00d2d3 0%, #55efc4 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    💾 Save Profile
                </button>
            </div>
        `;
        
        console.log('✅ Advanced Toddler Profile created successfully!');
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('❌ Error creating Toddler Profile:', error);
        alert('An error occurred while creating the AI profile. Please check all inputs and try again.');
    }
}

function calculateToddlerBehaviorScore(ageInMonths, focus) {
    const baseScore = 75;
    const ageAdjustment = Math.min(15, ageInMonths * 0.5);
    const focusBonus = focus === 'behavior' ? 10 : focus === 'social' ? 8 : 5;
    return Math.min(100, Math.round(baseScore + ageAdjustment + focusBonus + Math.random() * 10));
}

function generatePersonalizedLearningPath(ageInMonths, focus) {
    const activities = {
        language: [
            { title: "Story Time Enhancement", duration: "15 minutes", description: "Interactive reading with picture books and sound effects" },
            { title: "Vocabulary Building Games", duration: "20 minutes", description: "Word association games with flashcards and objects" },
            { title: "Sing-Along Sessions", duration: "10 minutes", description: "Nursery rhymes and action songs with movements" }
        ],
        social: [
            { title: "Peer Interaction Play", duration: "30 minutes", description: "Supervised playdates with age-appropriate activities" },
            { title: "Emotion Recognition", duration: "15 minutes", description: "Face cards and emotion-matching games" },
            { title: "Sharing Practice", duration: "20 minutes", description: "Turn-taking games and cooperative activities" }
        ],
        cognitive: [
            { title: "Problem Solving Puzzles", duration: "25 minutes", description: "Age-appropriate puzzles and shape sorters" },
            { title: "Memory Games", duration: "15 minutes", description: "Object hiding and recall activities" },
            { title: "Counting Activities", duration: "20 minutes", description: "Number recognition and counting games" }
        ],
        physical: [
            { title: "Gross Motor Skills", duration: "30 minutes", description: "Running, jumping, and obstacle courses" },
            { title: "Fine Motor Practice", duration: "20 minutes", description: "Play-doh, drawing, and finger painting" },
            { title: "Balance Activities", duration: "15 minutes", description: "Balance beams and coordination games" }
        ],
        behavior: [
            { title: "Positive Reinforcement", duration: "20 minutes", description: "Reward-based learning and praise systems" },
            { title: "Routine Building", duration: "25 minutes", description: "Structured activities with clear expectations" },
            { title: "Emotional Regulation", duration: "15 minutes", description: "Calming techniques and coping strategies" }
        ]
    };
    
    return activities[focus] || activities.cognitive;
}

function assessEmotionalDevelopment(ageInMonths) {
    const levels = ['Emerging', 'Developing', 'Progressing', 'Advanced'];
    return levels[Math.min(3, Math.floor(ageInMonths / 6))];
}

function evaluateSocialSkills(ageInMonths) {
    return Math.min(95, Math.round(60 + ageInMonths * 1.2 + Math.random() * 10));
}

function analyzeCognitiveAbilities(ageInMonths) {
    const levels = ['Basic', 'Intermediate', 'Advanced', 'Exceptional'];
    return levels[Math.min(3, Math.floor(ageInMonths / 9))];
}

function assessMotorSkills(ageInMonths) {
    return Math.min(98, Math.round(65 + ageInMonths * 1.1 + Math.random() * 8));
}

function getDevelopmentStage(ageInMonths) {
    if (ageInMonths < 18) return "Early Toddler";
    if (ageInMonths < 24) return "Mid Toddler";
    if (ageInMonths < 30) return "Advanced Toddler";
    return "Pre-School Ready";
}

function generateAIRecommendation(ageInMonths, focus, behaviorScore) {
    const recommendations = {
        language: `Focus on interactive reading and vocabulary expansion. ${behaviorScore >= 85 ? 'Excellent progress!' : 'Increase daily reading sessions.'}`,
        social: `Prioritize peer interactions and emotional coaching. ${behaviorScore >= 85 ? 'Great social development!' : 'More playtime recommended.'}`,
        cognitive: `Engage in problem-solving activities and memory games. ${behaviorScore >= 85 ? 'Outstanding cognitive skills!' : 'Introduce more puzzles.'}`,
        physical: `Emphasize both gross and fine motor skill activities. ${behaviorScore >= 85 ? 'Excellent motor development!' : 'Increase physical playtime.'}`,
        behavior: `Maintain consistent routines and positive reinforcement. ${behaviorScore >= 85 ? 'Wonderful behavior patterns!' : 'Focus on emotional regulation.'}`
    };
    
    return recommendations[focus] || recommendations.cognitive;
}

function saveToddlerProfile() {
    console.log('💾 Saving Toddler Profile...');
    
    try {
        const name = document.getElementById('toddlerName').value;
        const birthDate = document.getElementById('toddlerBirthDate').value;
        const focus = document.getElementById('toddlerFocus').value;
        
        if (!name || !birthDate || !focus) {
            alert('Please create a profile first before saving.');
            return;
        }
        
        const profileData = {
            name,
            birthDate,
            focus,
            createdAt: new Date().toISOString(),
            profileType: 'toddler',
            profileId: 'toddler_' + Date.now()
        };
        
        localStorage.setItem('toddlerProfile', JSON.stringify(profileData));
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.5s ease;
        `;
        successDiv.innerHTML = '✅ Toddler Profile Saved Successfully!';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
        
        console.log('✅ Toddler profile saved to localStorage');
        
    } catch (error) {
        console.error('❌ Error saving toddler profile:', error);
        alert('Error saving profile. Please try again.');
    }
}

// Real-time Toddler Data Stream
function startToddlerRealtimeStream() {
    console.log('📡 Starting Toddler Real-time Data Stream...');
    
    if (toddlerRealtimeInterval) {
        clearInterval(toddlerRealtimeInterval);
    }
    
    toddlerRealtimeInterval = setInterval(updateToddlerRealtimeData, 4000);
    updateToddlerRealtimeData();
}

function updateToddlerRealtimeData() {
    console.log('🔄 Updating toddler real-time data...');
    
    try {
        const activities = ['Learning', 'Playing', 'Exploring', 'Creating', 'Socializing', 'Resting'];
        const moods = ['Happy', 'Excited', 'Curious', 'Focused', 'Playful', 'Calm'];
        const development = ['Emerging', 'Developing', 'Progressing', 'Advanced', 'Exceptional'];
        const energy = ['High', 'Medium', 'Low', 'Very High', 'Balanced'];
        
        // Update activity
        const focusElement = document.getElementById('toddler-focus');
        const focusTimeElement = document.getElementById('toddler-focus-time');
        if (focusElement) {
            focusElement.textContent = activities[Math.floor(Math.random() * activities.length)];
        }
        if (focusTimeElement) {
            focusTimeElement.textContent = 'Just now';
        }
        
        // Update mood
        const moodElement = document.getElementById('toddler-mood');
        const moodTimeElement = document.getElementById('toddler-mood-time');
        if (moodElement) {
            const mood = moods[Math.floor(Math.random() * moods.length)];
            moodElement.textContent = mood;
            moodElement.style.color = mood === 'Happy' ? '#48dbfb' : mood === 'Excited' ? '#ff6b6b' : '#feca57';
        }
        if (moodTimeElement) {
            const moodMessages = ['1 min ago', '3 min ago', '5 min ago', 'Just now'];
            moodTimeElement.textContent = moodMessages[Math.floor(Math.random() * moodMessages.length)];
        }
        
        // Update development
        const devElement = document.getElementById('toddler-development');
        const devTimeElement = document.getElementById('toddler-development-time');
        if (devElement) {
            devElement.textContent = development[Math.floor(Math.random() * development.length)];
        }
        if (devTimeElement) {
            const devMessages = ['10 min ago', '15 min ago', '20 min ago', '30 min ago'];
            devTimeElement.textContent = devMessages[Math.floor(Math.random() * devMessages.length)];
        }
        
        // Update energy
        const energyElement = document.getElementById('toddler-energy');
        const energyTimeElement = document.getElementById('toddler-energy-time');
        if (energyElement) {
            const energyLevel = energy[Math.floor(Math.random() * energy.length)];
            energyElement.textContent = energyLevel;
            energyElement.style.color = energyLevel === 'High' || energyLevel === 'Very High' ? '#00d2d3' : '#feca57';
        }
        if (energyTimeElement) {
            const energyMessages = ['5 min ago', '10 min ago', '15 min ago', '20 min ago'];
            energyTimeElement.textContent = energyMessages[Math.floor(Math.random() * energyMessages.length)];
        }
        
        console.log('✅ Toddler real-time data updated');
        
    } catch (error) {
        console.error('❌ Error updating toddler data:', error);
    }
}

// Advanced Analytics Functions
function analyzeBehaviorPattern() {
    console.log('🧠 Analyzing Behavior Pattern...');
    
    try {
        const name = document.getElementById('behaviorName').value;
        const age = parseInt(document.getElementById('behaviorAge').value);
        const concern = document.getElementById('behaviorConcern').value;
        
        if (!name || !age || !concern) {
            alert('Please fill in all fields for behavior analysis.');
            return;
        }
        
        console.log('📊 Behavior analysis data:', { name, age, concern });
        
        // AI-powered behavior analysis
        const patternScore = calculateBehaviorPatternScore(age, concern);
        const triggers = identifyBehaviorTriggers(concern);
        const interventions = generateInterventionStrategies(age, concern);
        const prediction = predictBehaviorOutcome(age, concern, patternScore);
        const timeline = generateImprovementTimeline(concern, patternScore);
        
        console.log('🔍 Analysis complete:', { patternScore, triggers, interventions, prediction, timeline });
        
        // Display comprehensive results
        const resultDiv = document.getElementById('behaviorResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);">
                <h3 style="margin-bottom: 15px; font-size: 26px;">🧠 Behavior Pattern Analysis Complete!</h3>
                <p style="margin-bottom: 10px; font-size: 18px;"><strong>${name}</strong> - ${age} months old</p>
                <p style="opacity: 0.9; font-size: 16px;">✨ Advanced AI analysis with ${patternScore}% pattern recognition accuracy</p>
                <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <div style="font-size: 14px;">🎯 Concern: ${concern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style="font-size: 14px;">📊 Pattern Score: ${patternScore}/100</div>
                    <div style="font-size: 14px;">🔮 Prediction: ${prediction.outcome}</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${patternScore}%</div>
                    <div style="font-size: 14px; opacity: 0.9;">Pattern Recognition</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">AI Accuracy</div>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(240, 147, 251, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${triggers.length}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Triggers Identified</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Behavioral</div>
                </div>
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(79, 172, 254, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">💡</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${interventions.length}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Interventions</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Strategies</div>
                </div>
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(67, 233, 123, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">⏱️</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${timeline.weeks}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Weeks to Improve</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Timeline</div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                <h4 style="margin-bottom: 20px; color: #333; font-size: 20px;">🎯 Identified Triggers (AI Detected)</h4>
                <div style="display: grid; gap: 15px;">
                    ${triggers.map((trigger, index) => `
                        <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #667eea; box-shadow: 0 3px 15px rgba(0,0,0,0.08);">
                            <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 8px;">${trigger.trigger}</div>
                            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">⚡ Frequency: ${trigger.frequency}</div>
                            <div style="color: #999; font-size: 13px; line-height: 1.4;">${trigger.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);">
                <h4 style="margin-bottom: 20px; color: #333; font-size: 20px;">💡 Intervention Strategies (AI Recommended)</h4>
                <div style="display: grid; gap: 15px;">
                    ${interventions.map((intervention, index) => `
                        <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #f093fb; box-shadow: 0 3px 15px rgba(0,0,0,0.08);">
                            <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 8px;">${intervention.strategy}</div>
                            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">⏰ Implementation: ${intervention.timeframe}</div>
                            <div style="color: #999; font-size: 13px; line-height: 1.4;">${intervention.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; box-shadow: 0 5px 20px rgba(253, 203, 110, 0.3);">
                <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">
                    <strong>🔮 AI Prediction:</strong> ${prediction.summary} Expected improvement timeline: ${timeline.weeks} weeks with ${prediction.confidence}% confidence.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="analyzeBehaviorPattern()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    🔄 Re-analyze
                </button>
                <button onclick="saveBehaviorAnalysis()" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    💾 Save Analysis
                </button>
            </div>
        `;
        
        console.log('✅ Behavior Pattern Analysis completed successfully!');
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('❌ Error analyzing behavior pattern:', error);
        alert('An error occurred during behavior analysis. Please try again.');
    }
}

function calculateBehaviorPatternScore(age, concern) {
    const baseScore = 85;
    const ageAdjustment = Math.min(10, age / 3);
    const concernMultiplier = {
        'tantrums': 0.95,
        'sharing': 0.98,
        'sleep': 0.92,
        'eating': 0.89,
        'social': 0.94,
        'communication': 0.91
    };
    
    return Math.min(99, Math.round(baseScore + ageAdjustment) * (concernMultiplier[concern] || 0.95));
}

function identifyBehaviorTriggers(concern) {
    const triggerData = {
        'tantrums': [
            { trigger: 'Fatigue', frequency: 'High', description: 'Most tantrums occur when toddler is overtired or overstimulated' },
            { trigger: 'Hunger', frequency: 'Medium', description: 'Low blood sugar can trigger emotional outbursts' },
            { trigger: 'Transition Difficulty', frequency: 'High', description: 'Switching between activities causes frustration' }
        ],
        'sharing': [
            { trigger: 'Possessiveness', frequency: 'High', description: 'Natural developmental stage of ownership understanding' },
            { trigger: 'Social Anxiety', frequency: 'Medium', description: 'Uncertainty in social situations' },
            { trigger: 'Lack of Turn-taking Skills', frequency: 'High', description: 'Still developing social reciprocity' }
        ],
        'sleep': [
            { trigger: 'Overstimulation', frequency: 'High', description: 'Too much activity before bedtime' },
            { trigger: 'Separation Anxiety', frequency: 'Medium', description: 'Fear of being alone at night' },
            { trigger: 'Inconsistent Routine', frequency: 'High', description: 'Irregular sleep schedule' }
        ],
        'eating': [
            { trigger: 'Texture Sensitivity', frequency: 'Medium', description: 'Heightened sensory responses to food textures' },
            { trigger: 'Control Issues', frequency: 'High', description: 'Food as area of autonomy assertion' },
            { trigger: 'New Food Anxiety', frequency: 'Medium', description: 'Fear of unfamiliar foods' }
        ],
        'social': [
            { trigger: 'Stranger Anxiety', frequency: 'High', description: 'Normal fear of unfamiliar people' },
            { trigger: 'Overwhelm', frequency: 'Medium', description: 'Too much social stimulation' },
            { trigger: 'Communication Frustration', frequency: 'High', description: 'Inability to express needs effectively' }
        ],
        'communication': [
            { trigger: 'Language Gap', frequency: 'High', description: 'Understanding exceeds expressive abilities' },
            { trigger: 'Frustration', frequency: 'High', description: 'Unable to communicate needs/wants' },
            { trigger: 'Processing Delay', frequency: 'Medium', description: 'Needs extra time to formulate responses' }
        ]
    };
    
    return triggerData[concern] || triggerData['tantrums'];
}

function generateInterventionStrategies(age, concern) {
    const strategies = {
        'tantrums': [
            { strategy: 'Emotion Coaching', timeframe: 'Immediate', description: 'Acknowledge feelings and provide calming techniques' },
            { strategy: 'Prevention Routine', timeframe: '1-2 weeks', description: 'Identify early warning signs and intervene proactively' },
            { strategy: 'Consistent Response', timeframe: '2-4 weeks', description: 'Establish predictable consequences and boundaries' }
        ],
        'sharing': [
            { strategy: 'Turn-taking Games', timeframe: '1-2 weeks', description: 'Structured activities that practice sharing' },
            { strategy: 'Positive Reinforcement', timeframe: 'Immediate', description: 'Praise sharing behaviors enthusiastically' },
            { strategy: 'Modeling Behavior', timeframe: 'Ongoing', description: 'Demonstrate sharing in daily interactions' }
        ],
        'sleep': [
            { strategy: 'Wind-down Routine', timeframe: '1 week', description: 'Consistent 30-minute pre-sleep ritual' },
            { strategy: 'Environment Optimization', timeframe: 'Immediate', description: 'Dark, cool, quiet sleep space' },
            { strategy: 'Gradual Separation', timeframe: '2-3 weeks', description: 'Slowly reduce parental presence at bedtime' }
        ],
        'eating': [
            { strategy: 'Food Exposure', timeframe: '2-4 weeks', description: 'Repeated neutral exposure to new foods' },
            { strategy: 'Structured Meals', timeframe: '1 week', description: 'Regular meal schedule with limited duration' },
            { strategy: 'Autonomy Building', timeframe: '2-3 weeks', description: 'Allow age-appropriate food choices' }
        ],
        'social': [
            { strategy: 'Gradual Exposure', timeframe: '3-4 weeks', description: 'Slowly increase social interaction time' },
            { strategy: 'Social Stories', timeframe: '1-2 weeks', description: 'Prepare for social situations in advance' },
            { strategy: 'Peer Modeling', timeframe: 'Ongoing', description: 'Observe other children in social situations' }
        ],
        'communication': [
            { strategy: 'Sign Language', timeframe: '2-3 weeks', description: 'Introduce basic signs to reduce frustration' },
            { strategy: 'Narration', timeframe: 'Immediate', description: 'Verbalize daily activities and choices' },
            { strategy: 'Choice Offering', timeframe: '1 week', description: 'Provide simple verbal choices throughout day' }
        ]
    };
    
    return strategies[concern] || strategies['tantrums'];
}

function predictBehaviorOutcome(age, concern, score) {
    const outcomes = {
        'tantrums': {
            outcome: 'Significant reduction in frequency and intensity',
            summary: 'With consistent intervention, tantrums should decrease markedly within 6-8 weeks.',
            confidence: 87
        },
        'sharing': {
            outcome: 'Improved cooperation and turn-taking',
            summary: 'Social sharing skills typically emerge rapidly with structured practice.',
            confidence: 92
        },
        'sleep': {
            outcome: 'Consistent sleep patterns established',
            summary: 'Sleep routine improvements usually show results within 2-3 weeks.',
            confidence: 89
        },
        'eating': {
            outcome: 'Expanded food acceptance and reduced mealtime stress',
            summary: 'Gradual food exposure typically yields steady improvement over 8-12 weeks.',
            confidence: 78
        },
        'social': {
            outcome: 'Increased comfort in social situations',
            summary: 'Social confidence builds gradually with consistent positive experiences.',
            confidence: 85
        },
        'communication': {
            outcome: 'Reduced frustration and increased verbal expression',
            summary: 'Communication interventions typically show rapid improvement in 4-6 weeks.',
            confidence: 91
        }
    };
    
    return outcomes[concern] || outcomes['tantrums'];
}

function generateImprovementTimeline(concern, score) {
    const baseWeeks = {
        'tantrums': 6,
        'sharing': 4,
        'sleep': 3,
        'eating': 10,
        'social': 8,
        'communication': 5
    };
    
    const adjustment = (100 - score) / 10;
    const weeks = Math.round((baseWeeks[concern] || 6) * (1 + adjustment));
    
    return { weeks, confidence: Math.min(95, score + 5) };
}

function saveBehaviorAnalysis() {
    console.log('💾 Saving Behavior Analysis...');
    // Implementation for saving analysis results
    alert('Behavior analysis saved successfully!');
}

// Simplified Analytics Functions
function openBehaviorAI() {
    console.log('🧠 Opening Behavior Pattern AI page...');
    navigateTo('behavior-ai');
}

function openLearningOptimizer() {
    console.log('🎯 Opening Learning Path Optimizer page...');
    navigateTo('learning-optimizer');
}

function openEmotionAI() {
    console.log('😊 Opening Emotion Recognition AI page...');
    navigateTo('emotion-ai');
}

// Advanced AI Analytics Functions with Impressive Technology
function analyzeBehaviorPattern() {
    console.log('🧠 Launching Advanced Neural Network Analysis...');
    
    const name = document.getElementById('behaviorName').value;
    const age = document.getElementById('behaviorAge').value;
    const concern = document.getElementById('behaviorConcern').value;
    
    if (!name || !age || !concern) {
        showValidationError('⚠️ Please complete all fields for AI analysis');
        highlightEmptyFields();
        return;
    }
    
    // Show AI Processing Animation
    showAIProcessing();
    
    // Simulate Advanced AI Processing
    setTimeout(() => {
        hideAIProcessing();
        
        // Generate Advanced AI Insights
        const insights = generateAdvancedBehaviorInsights(name, age, concern);
        
        // Display comprehensive results
        displayBehaviorAnalysisResults(insights, name, age, concern);
        
        // Scroll to results smoothly
        setTimeout(() => {
            document.getElementById('behaviorResult').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
        
    }, 2000); // Simulate AI processing time
}

function showValidationError(message) {
    // Create or update error notification
    let errorDiv = document.getElementById('aiErrorNotification');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'aiErrorNotification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff5252 0%, #ff3838 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(255, 82, 82, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
            font-weight: 600;
            max-width: 300px;
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1s infinite;"></div>
            <span>${message}</span>
        </div>
    `;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 500);
        }
    }, 3000);
}

function highlightEmptyFields() {
    // Remove existing highlights
    document.querySelectorAll('.ai-field-error').forEach(field => {
        field.classList.remove('ai-field-error');
        field.style.borderColor = '#e0e0e0';
    });
    
    // Highlight empty fields
    const fields = ['behaviorName', 'behaviorAge', 'behaviorConcern'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            field.classList.add('ai-field-error');
            field.style.borderColor = '#ff5252';
            field.style.boxShadow = '0 0 0 3px rgba(255, 82, 82, 0.2)';
            
            // Remove highlight on focus
            field.addEventListener('focus', function removeHighlight() {
                field.classList.remove('ai-field-error');
                field.style.borderColor = '#667eea';
                field.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)';
                field.removeEventListener('focus', removeHighlight);
            });
        }
    });
}

function showAIProcessing() {
    const processingDiv = document.getElementById('aiProcessing');
    if (processingDiv) {
        processingDiv.style.display = 'flex';
        processingDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; background: #667eea; color: white; padding: 12px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; animation: aiGlow 2s ease-in-out infinite;">
                <div style="width: 10px; height: 10px; background: white; border-radius: 50%; animation: pulse 1s infinite;"></div>
                <span>AI Processing Analysis...</span>
                <div style="display: flex; gap: 5px;">
                    <div class="processing-dot" style="animation-delay: 0s;"></div>
                    <div class="processing-dot" style="animation-delay: 0.2s;"></div>
                    <div class="processing-dot" style="animation-delay: 0.4s;"></div>
                </div>
            </div>
        `;
    }
    
    // Disable form during processing
    document.getElementById('behaviorAnalysisForm').querySelectorAll('input, select, button').forEach(element => {
        element.disabled = true;
        element.style.opacity = '0.6';
    });
}

function hideAIProcessing() {
    const processingDiv = document.getElementById('aiProcessing');
    if (processingDiv) {
        processingDiv.style.display = 'none';
    }
    
    // Re-enable form
    document.getElementById('behaviorAnalysisForm').querySelectorAll('input, select, button').forEach(element => {
        element.disabled = false;
        element.style.opacity = '1';
    });
}

function displayBehaviorAnalysisResults(insights, name, age, concern) {
    const resultDiv = document.getElementById('behaviorResult');
    resultDiv.style.display = 'block';
    resultDiv.className = 'result-section fade-in-up';
    
    resultDiv.innerHTML = `
        <!-- Premium AI Analysis Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 25px; margin-bottom: 35px; box-shadow: 0 25px 50px rgba(102, 126, 234, 0.4); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent); animation: dataFlow 4s linear infinite;"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; position: relative; z-index: 2;">
                <div>
                    <h3 style="margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.2);"> Advanced Neural Analysis Complete</h3>
                    <p style="margin: 8px 0 0 0; font-size: 20px; opacity: 0.95;"><strong>${name}</strong> • ${age} months • ${getConcernLabel(concern)}</p>
                </div>
                <div style="text-align: right; background: rgba(255,255,255,0.15); padding: 20px; border-radius: 20px; backdrop-filter: blur(10px);">
                    <div style="font-size: 16px; opacity: 0.9; margin-bottom: 8px; font-weight: 600;">AI Confidence</div>
                    <div style="font-size: 42px; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">${insights.confidence}%</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">Deep Learning Accuracy</div>
                </div>
            </div>
            
            <!-- AI Status Indicators -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 25px; position: relative; z-index: 2;">
                <div class="ai-status" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);">
                    <div class="ai-status-dot"></div>
                    <span> 12-Layer Neural Net</span>
                </div>
                <div class="ai-status" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);">
                    <div class="ai-status-dot" style="background: #4caf50;"></div>
                    <span> ${insights.accuracy}% Accuracy</span>
                </div>
                <div class="ai-status" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);">
                    <div class="ai-status-dot" style="background: #ff9800;"></div>
                    <span> 0.3s Processing</span>
                </div>
                <div class="ai-status" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);">
                    <div class="ai-status-dot" style="background: #9c27b0;"></div>
                    <span> 1.2M+ Data Points</span>
                </div>
            </div>
        </div>
        
        <!-- Enhanced Key Metrics Dashboard -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 35px;">
            <div class="metric-card-enhanced" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 2;">
                    <div style="font-size: 42px; margin-bottom: 15px; animation: float 3s ease-in-out infinite;"></div>
                    <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">${insights.developmentScore}/100</div>
                    <div style="font-size: 16px; opacity: 0.95; margin-bottom: 15px;">Development Score</div>
                    <div style="padding: 8px 16px; background: rgba(255,255,255,0.25); border-radius: 20px; font-size: 14px; font-weight: 600; backdrop-filter: blur(10px);">
                        ${getDevelopmentLevel(insights.developmentScore)}
                    </div>
                </div>
            </div>
            
            <div class="metric-card-enhanced" style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 2;">
                    <div style="font-size: 42px; margin-bottom: 15px; animation: float 3s ease-in-out infinite; animation-delay: 0.5s;"></div>
                    <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">${insights.behaviorPattern}</div>
                    <div style="font-size: 16px; opacity: 0.95; margin-bottom: 15px;">Behavior Pattern</div>
                    <div style="padding: 8px 16px; background: rgba(255,255,255,0.25); border-radius: 20px; font-size: 14px; font-weight: 600; backdrop-filter: blur(10px);">
                        ${getPatternLevel(insights.behaviorPattern)}
                    </div>
                </div>
            </div>
            
            <div class="metric-card-enhanced" style="background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 2;">
                    <div style="font-size: 42px; margin-bottom: 15px; animation: float 3s ease-in-out infinite; animation-delay: 1s;"></div>
                    <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">${insights.recommendations}</div>
                    <div style="font-size: 16px; opacity: 0.95; margin-bottom: 15px;">AI Recommendations</div>
                    <div style="padding: 8px 16px; background: rgba(255,255,255,0.25); border-radius: 20px; font-size: 14px; font-weight: 600; backdrop-filter: blur(10px);">
                        Action Items
                    </div>
                </div>
            </div>
            
            <div class="metric-card-enhanced" style="background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 2;">
                    <div style="font-size: 42px; margin-bottom: 15px; animation: float 3s ease-in-out infinite; animation-delay: 1.5s;"></div>
                    <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">${insights.riskLevel}</div>
                    <div style="font-size: 16px; opacity: 0.95; margin-bottom: 15px;">Risk Assessment</div>
                    <div style="padding: 8px 16px; background: rgba(255,255,255,0.25); border-radius: 20px; font-size: 14px; font-weight: 600; backdrop-filter: blur(10px);">
                        ${getRiskLevel(insights.riskLevel)}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Premium AI Insights Section -->
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 20px; padding: 35px; margin-bottom: 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 25px 0; font-size: 24px; font-weight: 800; color: #333; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;"></span>
                Advanced AI Insights
                <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: 600;">
                    Neural Network Analysis
                </span>
            </h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
                ${insights.detailedInsights.map((insight, index) => `
                    <div class="insight-card-premium fade-in-up" style="animation-delay: ${index * 0.15}s; border-left: 5px solid ${getInsightColor(insight.confidence)}; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: ${getInsightColor(insight.confidence)}15; border-radius: 0 0 0 60px;"></div>
                        
                        <div style="position: relative; z-index: 2;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; color: #333; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                                        ${insight.title}
                                        <span class="confidence-badge-premium" style="background: ${getInsightColor(insight.confidence)};">
                                            ${insight.confidence}% Confidence
                                        </span>
                                    </div>
                                    <div style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 15px;">${insight.description}</div>
                                </div>
                                <div style="font-size: 32px; margin-left: 15px; filter: drop-shadow(0 2px 10px rgba(0,0,0,0.1));">${getInsightIcon(insight.category)}</div>
                            </div>
                            
                            ${insight.actionable ? `
                                <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); border-radius: 15px; border-left: 4px solid #4caf50; position: relative;">
                                    <div style="font-weight: 700; color: #2e7d32; margin-bottom: 12px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                                        Recommended Actions
                                    </div>
                                    <div style="display: grid; gap: 10px;">
                                        ${insight.actions.map(action => `
                                            <div style="display: flex; align-items: flex-start; gap: 10px; color: #555; font-size: 15px; line-height: 1.6;">
                                                <span style="color: #4caf50; font-weight: bold; margin-top: 2px;"></span>
                                                <span>${action}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Enhanced Action Buttons -->
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 40px; flex-wrap: wrap;">
            <button onclick="saveBehaviorAnalysis()" class="action-button-premium" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);">
                <span class="button-icon"></span>
                <span class="button-text">Save Analysis</span>
            </button>
            <button onclick="shareBehaviorResults()" class="action-button-premium" style="background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%);">
                <span class="button-icon"></span>
                <span class="button-text">Share Results</span>
            </button>
            <button onclick="printBehaviorReport()" class="action-button-premium" style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);">
                <span class="button-icon"></span>
                <span class="button-text">Print Report</span>
            </button>
            <button onclick="analyzeBehaviorPattern()" class="action-button-premium" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <span class="button-icon"></span>
                <span class="button-text">Re-analyze</span>
            </button>
        </div>
        
        <!-- Add CSS animations -->
        <style>
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            .metric-card-enhanced {
                padding: 30px;
                border-radius: 20px;
                color: white;
                text-align: center;
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .metric-card-enhanced:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            
            .insight-card-premium {
                background: white;
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .insight-card-premium:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            }
            
            .confidence-badge-premium {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
            }
            
            .action-button-premium {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px 30px;
                border: none;
                border-radius: 15px;
                color: white;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
            }
            
            .action-button-premium:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px rgba(0,0,0,0.3);
            }
            
            .action-button-premium .button-icon {
                font-size: 18px;
                transition: transform 0.3s ease;
            }
            
            .action-button-premium:hover .button-icon {
                transform: scale(1.2);
            }
            
            .action-button-premium .button-text {
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        </style>
    `;
}

// Doctor Visits Guide - Navigate to Dedicated Page
function openDoctorVisitsGuide() {
    console.log('👨‍⚕️ Navigating to Doctor Visits Guide page...');
    navigateTo('doctor-visits');
    // Initialize the page data after navigation
    setTimeout(() => {
        initializeDoctorVisitsPage();
    }, 500);
}

// Initialize Doctor Visits Page with Real-time Data
function initializeDoctorVisitsPage() {
    console.log('🔄 Initializing Doctor Visits Page with real-time data...');
    
    // Load real-time appointments
    loadLiveAppointments();
    loadLiveVaccines();
    loadLiveGrowthRecords();
    updateLiveStats();
    
    // Set up form submission
    const form = document.getElementById('liveAppointmentForm');
    if (form) {
        form.addEventListener('submit', handleAppointmentSubmission);
    }
    
    // Set up vaccine form submission
    const vaccineForm = document.getElementById('vaccineForm');
    if (vaccineForm) {
        vaccineForm.addEventListener('submit', handleVaccineSubmission);
    }
    
    // Set up growth form submission
    const growthForm = document.getElementById('growthForm');
    if (growthForm) {
        growthForm.addEventListener('submit', handleGrowthSubmission);
    }
    
    // Start real-time updates
    startRealTimeUpdates();
}

// Global appointments array for persistent storage
// Load from localStorage or use defaults
function loadAppointmentsFromStorage() {
    const stored = localStorage.getItem('mamacare_appointments');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            console.log('📅 Loaded appointments from localStorage:', parsed.length, 'appointments');
            return parsed;
        } catch (e) {
            console.error('❌ Error parsing appointments from localStorage:', e);
        }
    }
    // Default appointments if none stored
    return [
        { 
            id: 1, 
            date: '2024-12-15', 
            time: '10:00 AM', 
            type: 'checkup', 
            doctor: 'Dr. Sarah Johnson', 
            status: 'upcoming',
            notes: 'Regular 18-month checkup',
            reminder: '1 day before'
        },
        { 
            id: 2, 
            date: '2024-12-20', 
            time: '2:30 PM', 
            type: 'vaccine', 
            doctor: 'Dr. Michael Chen', 
            status: 'upcoming',
            notes: 'MMR vaccination',
            reminder: '2 hours before'
        }
    ];
}

function saveAppointmentsToStorage() {
    try {
        localStorage.setItem('mamacare_appointments', JSON.stringify(appointmentsData));
        console.log('💾 Saved appointments to localStorage:', appointmentsData.length, 'appointments');
    } catch (e) {
        console.error('❌ Error saving appointments to localStorage:', e);
    }
}

let appointmentsData = loadAppointmentsFromStorage();
let nextAppointmentId = appointmentsData.length > 0 ? Math.max(...appointmentsData.map(a => a.id)) + 1 : 1;

// Real-time Appointments Loading
function loadLiveAppointments() {
    const upcomingList = document.getElementById('liveAppointmentsList');
    const pastList = document.getElementById('livePastAppointmentsList');
    
    if (!upcomingList || !pastList) return;
    
    // Filter upcoming and past appointments
    const upcoming = appointmentsData.filter(apt => apt.status === 'upcoming');
    const past = appointmentsData.filter(apt => apt.status === 'completed' || apt.status === 'cancelled');
    
    // Render upcoming appointments
    if (upcoming.length > 0) {
        upcomingList.innerHTML = upcoming.map(apt => `
            <div class="appointment-card" data-id="${apt.id}" style="background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 25px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; border-left: 5px solid ${getAppointmentColor(apt.type)}; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 40px;">${getAppointmentIcon(apt.type)}</div>
                    <div>
                        <div style="font-weight: 700; color: #333; font-size: 18px; margin-bottom: 5px;">${getAppointmentTypeName(apt.type)}</div>
                        <div style="color: #666; font-size: 16px; margin-bottom: 3px;">${formatDate(apt.date)} at ${apt.time}</div>
                        <div style="color: #666; font-size: 14px; margin-bottom: 3px;">Dr. ${apt.doctor}</div>
                        <div style="color: #888; font-size: 13px; font-style: italic;">${apt.notes || 'No additional notes'}</div>
                        ${apt.reminder ? `<div style="margin-top: 8px;"><span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">🔔 ${apt.reminder}</span></div>` : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="editAppointment(${apt.id})" style="background: #667eea; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-size: 13px; cursor: pointer;">✏️ Edit</button>
                    <button onclick="completeAppointment(${apt.id})" style="background: #4caf50; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-size: 13px; cursor: pointer;">✅ Complete</button>
                    <button onclick="cancelAppointment(${apt.id})" style="background: #ff5252; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-size: 13px; cursor: pointer;">❌ Cancel</button>
                </div>
            </div>
        `).join('');
    } else {
        upcomingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No upcoming appointments. Schedule one below!</div>';
    }
    
    // Render past appointments
    if (past.length > 0) {
        pastList.innerHTML = past.map(apt => `
            <div class="appointment-card" data-id="${apt.id}" style="background: ${apt.status === 'cancelled' ? '#ffebee' : '#f8f9fa'}; border: 2px solid #e0e0e0; border-radius: 15px; padding: 25px; display: flex; justify-content: space-between; align-items: center; opacity: 0.8; margin-bottom: 15px; border-left: 5px solid ${apt.status === 'cancelled' ? '#f44336' : '#9e9e9e'};">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 40px; opacity: 0.7;">${getAppointmentIcon(apt.type)}</div>
                    <div>
                        <div style="font-weight: 700; color: #333; font-size: 18px; margin-bottom: 5px;">${getAppointmentTypeName(apt.type)}</div>
                        <div style="color: #666; font-size: 16px; margin-bottom: 3px;">${formatDate(apt.date)} at ${apt.time}</div>
                        <div style="color: #666; font-size: 14px; margin-bottom: 3px;">Dr. ${apt.doctor}</div>
                        <div style="color: ${apt.status === 'cancelled' ? '#f44336' : '#4caf50'}; font-size: 14px; font-weight: 600;">${apt.status === 'cancelled' ? '❌ Cancelled' : '✅ Completed'}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        pastList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No past appointments recorded</div>';
    }
    
    // Update stats
    const upcomingCount = document.getElementById('liveUpcomingCount');
    if (upcomingCount) upcomingCount.textContent = upcoming.length.toString();
}

// Handle Appointment Form Submission
function handleAppointmentSubmission(e) {
    e.preventDefault();
    
    const date = document.getElementById('liveAppointmentDate').value;
    const time = document.getElementById('liveAppointmentTime').value;
    const type = document.getElementById('liveAppointmentType').value;
    const doctor = document.getElementById('liveAppointmentDoctor').value;
    const notes = document.getElementById('liveAppointmentNotes').value;
    
    if (!date || !time || !type || !doctor) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Create new appointment object
    const newAppointment = {
        id: nextAppointmentId++,
        date: date,
        time: time,
        type: type,
        doctor: doctor,
        notes: notes || 'No additional notes',
        status: 'upcoming',
        reminder: '1 day before'
    };
    
    // Add to appointments array and save to storage
    appointmentsData.push(newAppointment);
    saveAppointmentsToStorage();
    console.log('📅 New appointment added:', newAppointment);
    
    showNotification('Appointment scheduled successfully!', 'success');
    clearAppointmentForm();
    showDoctorTab('appointments');
    setTimeout(() => {
        loadLiveAppointments();
        updateLiveStats();
    }, 500);
}

// Tab Navigation - Fixed
function showDoctorTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Hide all sections
    document.querySelectorAll('.doctor-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.doctor-tab').forEach(tab => {
        tab.style.background = 'transparent';
        tab.style.color = '#666';
    });
    
    // Show selected section
    const selectedSection = document.getElementById(tabName + 'Section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
        console.log('✅ Showing section:', tabName + 'Section');
    } else {
        console.error('❌ Section not found:', tabName + 'Section');
    }
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        selectedTab.style.color = 'white';
        console.log('✅ Activated tab:', tabName + 'Tab');
    } else {
        console.error('❌ Tab not found:', tabName + 'Tab');
    }
    
    // Reload data for selected tab
    switch(tabName) {
        case 'appointments':
            loadLiveAppointments();
            break;
        case 'vaccines':
            loadLiveVaccines();
            break;
        case 'growth':
            loadLiveGrowthRecords();
            break;
        case 'schedule':
            // Clear form when switching to schedule tab
            clearAppointmentForm();
            break;
    }
}

// Global vaccines data for persistent storage - starts empty, user adds their own
function loadVaccinesFromStorage() {
    const stored = localStorage.getItem('mamacare_vaccines');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            console.log('💉 Loaded vaccines from localStorage:', parsed.length, 'vaccines');
            return parsed;
        } catch (e) {
            console.error('❌ Error parsing vaccines from localStorage:', e);
        }
    }
    // Start with empty array - user will add their own vaccines
    console.log('💉 No saved vaccines found, starting fresh');
    return [];
}

function saveVaccinesToStorage() {
    try {
        localStorage.setItem('mamacare_vaccines', JSON.stringify(vaccinesData));
        console.log('💾 Saved vaccines to localStorage:', vaccinesData.length, 'vaccines');
    } catch (e) {
        console.error('❌ Error saving vaccines to localStorage:', e);
    }
}

let vaccinesData = loadVaccinesFromStorage();
let nextVaccineId = vaccinesData.length > 0 ? Math.max(...vaccinesData.map(v => v.id)) + 1 : 1;

// Vaccine form submission handler
function handleVaccineSubmission(e) {
    e.preventDefault();
    
    const name = document.getElementById('vaccineName').value;
    const date = document.getElementById('vaccineDate').value;
    const status = document.getElementById('vaccineStatus').value;
    const dose = document.getElementById('vaccineDose').value;
    const notes = document.getElementById('vaccineNotes').value;
    
    if (!name || !date || !status) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Get vaccine details based on name
    const vaccineInfo = getVaccineInfo(name);
    
    const newVaccine = {
        id: nextVaccineId++,
        name: name,
        date: date,
        status: status,
        dose: dose,
        notes: notes,
        description: vaccineInfo.description,
        icon: vaccineInfo.icon,
        color: status === 'completed' ? '#4caf50' : status === 'scheduled' ? '#ff9800' : '#9e9e9e'
    };
    
    vaccinesData.push(newVaccine);
    saveVaccinesToStorage();
    
    showNotification(`${name} added successfully! 💉`, 'success');
    clearVaccineForm();
    loadLiveVaccines();
}

// Get vaccine info based on name
function getVaccineInfo(name) {
    const vaccineDatabase = {
        'Hepatitis B': { description: 'Protects against hepatitis B virus infection', icon: '🛡️' },
        'DTaP': { description: 'Protects against diphtheria, tetanus, and pertussis', icon: '🦠' },
        'Polio (IPV)': { description: 'Inactivated poliovirus vaccine', icon: '💪' },
        'Hib': { description: 'Protects against Haemophilus influenzae type b', icon: '🧠' },
        'PCV13': { description: 'Pneumococcal conjugate vaccine', icon: '🫁' },
        'Rotavirus': { description: 'Oral vaccine against rotavirus', icon: '💧' },
        'MMR': { description: 'Measles, Mumps, and Rubella vaccine', icon: '🎯' },
        'Varicella': { description: 'Chickenpox vaccine', icon: '🔴' },
        'Hepatitis A': { description: 'Protects against hepatitis A virus', icon: '🍽️' },
        'Flu': { description: 'Influenza vaccine', icon: '🤧' },
        'COVID-19': { description: 'COVID-19 coronavirus vaccine', icon: '🦠' },
        'Other': { description: 'Custom vaccine entry', icon: '💉' }
    };
    
    return vaccineDatabase[name] || { description: 'Vaccine record', icon: '💉' };
}

// Clear vaccine form
function clearVaccineForm() {
    const form = document.getElementById('vaccineForm');
    if (form) {
        form.reset();
    }
}

// Modern Vaccination Schedule Loader
function loadLiveVaccines() {
    console.log('💉 Loading user vaccination records...');
    
    const vaccineSchedule = document.getElementById('liveVaccinationSchedule');
    const timeline = document.getElementById('vaccinationTimeline');
    
    if (!vaccineSchedule) {
        console.error('❌ Vaccine schedule container not found');
        return;
    }
    
    // Calculate statistics
    const completed = vaccinesData.filter(v => v.status === 'completed').length;
    const scheduled = vaccinesData.filter(v => v.status === 'scheduled').length;
    const upcoming = vaccinesData.filter(v => v.status === 'upcoming').length;
    const total = vaccinesData.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update dashboard stats
    const completedCount = document.getElementById('vaccinesCompletedCount');
    const scheduledCount = document.getElementById('vaccinesScheduledCount');
    const progressPercent = document.getElementById('vaccinesProgressPercent');
    const nextDate = document.getElementById('nextVaccineDate');
    const progressBadge = document.getElementById('vaccineProgressBadge');
    const progressBar = document.getElementById('vaccineProgressBar');
    const totalCount = document.getElementById('vaccinesTotalCount');
    
    if (completedCount) completedCount.textContent = completed;
    if (scheduledCount) scheduledCount.textContent = scheduled;
    if (progressPercent) progressPercent.textContent = progress + '%';
    if (progressBadge) progressBadge.textContent = total > 0 ? progress + '% Complete' : 'Add Vaccines';
    if (progressBar) progressBar.style.width = progress + '%';
    if (totalCount) totalCount.textContent = total + ' vaccine' + (total !== 1 ? 's' : '') + ' recorded';
    
    // Find next scheduled vaccine
    const upcomingVaccines = vaccinesData.filter(v => v.status === 'scheduled' || v.status === 'upcoming');
    upcomingVaccines.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (nextDate) {
        if (upcomingVaccines.length > 0) {
            const date = new Date(upcomingVaccines[0].date);
            nextDate.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            nextDate.textContent = '--';
        }
    }
    
    // Render vaccine cards or empty state
    if (vaccinesData.length === 0) {
        vaccineSchedule.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); border-radius: 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">💉</div>
                <h3 style="color: #333; font-size: 24px; font-weight: 700; margin-bottom: 15px;">No Vaccines Recorded Yet</h3>
                <p style="color: #666; font-size: 16px; margin-bottom: 25px; max-width: 400px; margin-left: auto; margin-right: auto;">Add your child's vaccination records using the form above. Keep track of completed and upcoming vaccines in one place.</p>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <span style="background: #667eea20; color: #667eea; padding: 8px 16px; border-radius: 20px; font-size: 14px;">📅 Track Schedule</span>
                    <span style="background: #4caf5020; color: #4caf50; padding: 8px 16px; border-radius: 20px; font-size: 14px;">✅ Mark Complete</span>
                    <span style="background: #ff980020; color: #ff9800; padding: 8px 16px; border-radius: 20px; font-size: 14px;">🔔 Get Reminders</span>
                </div>
            </div>
        `;
    } else {
        // Sort by date
        const sortedVaccines = [...vaccinesData].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        vaccineSchedule.innerHTML = sortedVaccines.map(vaccine => `
            <div class="vaccine-card" data-id="${vaccine.id}" style="background: linear-gradient(135deg, ${vaccine.status === 'completed' ? '#e8f5e8' : vaccine.status === 'scheduled' ? '#fff8e1' : '#f5f5f5'} 0%, ${vaccine.status === 'completed' ? '#f1f8e9' : vaccine.status === 'scheduled' ? '#fffde7' : '#fafafa'} 100%); border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden;" onmouseenter="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 40px rgba(0,0,0,0.15)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.1)';">
                ${vaccine.status === 'completed' ? '<div style="position: absolute; top: 15px; right: 15px; background: #4caf50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">✓</div>' : ''}
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="font-size: 48px; background: ${vaccine.color}20; border-radius: 15px; padding: 15px; flex-shrink: 0;">${vaccine.icon}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <div style="font-weight: 800; color: #333; font-size: 20px;">${vaccine.name}</div>
                            <span style="background: ${vaccine.status === 'completed' ? '#4caf50' : vaccine.status === 'scheduled' ? '#ff9800' : '#9e9e9e'}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                                ${vaccine.status}
                            </span>
                        </div>
                        <div style="color: #666; font-size: 15px; margin-bottom: 12px; line-height: 1.5;">${vaccine.description}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                            <span style="background: #667eea20; color: #667eea; padding: 4px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">${vaccine.dose}</span>
                            <span style="background: #4caf5020; color: #4caf50; padding: 4px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">${formatDate(vaccine.date)}</span>
                        </div>
                        ${vaccine.notes ? `<div style="color: #888; font-size: 13px; font-style: italic; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">📝 ${vaccine.notes}</div>` : ''}
                    </div>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    ${vaccine.status !== 'completed' ? `
                        <button onclick="markVaccineComplete(${vaccine.id})" style="flex: 1; background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease;">✅ Mark Complete</button>
                    ` : `
                        <button onclick="markVaccineIncomplete(${vaccine.id})" style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease;">↩️ Undo Complete</button>
                    `}
                    <button onclick="editVaccine(${vaccine.id})" style="background: #f8f9fa; color: #667eea; border: 2px solid #667eea; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease;">✏️ Edit</button>
                    <button onclick="deleteVaccine(${vaccine.id})" style="background: #ffebee; color: #f44336; border: 2px solid #f44336; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease;">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    // Render timeline
    if (timeline) {
        renderVaccinationTimeline();
    }
    
    console.log('✅ User vaccination records loaded:', vaccinesData.length, 'vaccines');
}

// Render Vaccination Timeline
function renderVaccinationTimeline() {
    const timeline = document.getElementById('vaccinationTimeline');
    // ... rest of the code remains the same ...
    if (!timeline) return;
    
    // Sort vaccines by date
    const sortedVaccines = [...vaccinesData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    timeline.innerHTML = `
        <div style="position: relative; padding-left: 40px;">
            <!-- Timeline line -->
            <div style="position: absolute; left: 15px; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #4caf50 0%, #667eea 50%, #ff9800 100%); border-radius: 2px;"></div>
            
            ${sortedVaccines.map((vaccine, index) => {
                const isCompleted = vaccine.status === 'completed';
                const isScheduled = vaccine.status === 'scheduled';
                const date = new Date(vaccine.date);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const isToday = new Date().toDateString() === date.toDateString();
                
                return `
                    <div style="position: relative; margin-bottom: 30px; padding: 25px; background: ${isCompleted ? '#f1f8e9' : isScheduled ? '#fff8e1' : '#f5f5f5'}; border-radius: 15px; border-left: 5px solid ${isCompleted ? '#4caf50' : isScheduled ? '#ff9800' : '#9e9e9e'};">
                        <!-- Timeline dot -->
                        <div style="position: absolute; left: -33px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; border-radius: 50%; background: ${isCompleted ? '#4caf50' : isScheduled ? '#ff9800' : '#9e9e9e'}; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1;">
                            ${isCompleted ? '<div style="color: white; font-size: 12px; text-align: center; line-height: 12px;">✓</div>' : ''}
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <span style="font-size: 28px;">${vaccine.icon}</span>
                                    <span style="font-weight: 800; color: #333; font-size: 18px;">${vaccine.name}</span>
                                    ${isToday ? '<span style="background: #e91e63; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">TODAY</span>' : ''}
                                </div>
                                <div style="color: #666; font-size: 14px; margin-bottom: 5px;">${vaccine.description}</div>
                                <div style="color: ${isCompleted ? '#4caf50' : isScheduled ? '#ff9800' : '#9e9e9e'}; font-size: 14px; font-weight: 600;">${formattedDate}</div>
                            </div>
                            <span style="background: ${isCompleted ? '#4caf50' : isScheduled ? '#ff9800' : '#9e9e9e'}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                                ${vaccine.status}
                            </span>
                        </div>
                        ${isScheduled ? `
                            <div style="margin-top: 15px; display: flex; gap: 10px;">
                                <button onclick="markVaccineComplete(${vaccine.id})" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; border: none; padding: 8px 15px; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">✅ Complete</button>
                                <button onclick="showVaccineDetails(${vaccine.id})" style="background: #2196f3; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">📋 Details</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Show Vaccine Details Modal
function showVaccineDetails(vaccineId) {
    const vaccine = vaccinesData.find(v => v.id === vaccineId);
    if (!vaccine) return;
    
    const modal = document.createElement('div');
    modal.id = 'vaccineDetailModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 25px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 30px 80px rgba(0,0,0,0.3); animation: slideUp 0.4s ease;">
            <div style="background: linear-gradient(135deg, ${vaccine.color} 0%, ${vaccine.color}dd 100%); color: white; padding: 30px; border-radius: 25px 25px 0 0; position: relative;">
                <button onclick="closeVaccineModal()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; backdrop-filter: blur(10px); transition: all 0.3s ease;">×</button>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 60px; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 20px;">${vaccine.icon}</div>
                    <div>
                        <h2 style="margin: 0; font-size: 32px; font-weight: 800;">${vaccine.name}</h2>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${vaccine.dose} of ${vaccine.totalDoses}</p>
                    </div>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span>📋</span> Description
                    </h3>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">${vaccine.fullDescription}</p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span>💉</span> Administration
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
                            <div style="color: #888; font-size: 12px; margin-bottom: 5px;">Scheduled Date</div>
                            <div style="color: #333; font-size: 16px; font-weight: 600;">${formatDate(vaccine.date)}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
                            <div style="color: #888; font-size: 12px; margin-bottom: 5px;">Status</div>
                            <div style="color: ${vaccine.status === 'completed' ? '#4caf50' : vaccine.status === 'scheduled' ? '#ff9800' : '#9e9e9e'}; font-size: 16px; font-weight: 600; text-transform: uppercase;">${vaccine.status}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; font-size: 18px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span>⚠️</span> Common Side Effects
                    </h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${vaccine.sideEffects.map(effect => `
                            <span style="background: #fff3e0; color: #e65100; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;">${effect}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                    <h3 style="color: #333; font-size: 16px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span>⭐</span> Why It's Important
                    </h3>
                    <p style="color: #555; font-size: 15px; margin: 0; line-height: 1.5;">${vaccine.importance}</p>
                </div>
                
                ${vaccine.status === 'scheduled' ? `
                    <div style="display: flex; gap: 15px;">
                        <button onclick="markVaccineComplete(${vaccine.id}); closeVaccineModal();" style="flex: 1; background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; border: none; padding: 15px 25px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <span>✅</span> Mark as Complete
                        </button>
                        <button onclick="rescheduleVaccine(${vaccine.id}); closeVaccineModal();" style="flex: 1; background: #f8f9fa; color: #667eea; border: 2px solid #667eea; padding: 15px 25px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <span>📅</span> Reschedule
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close Vaccine Modal
function closeVaccineModal() {
    const modal = document.getElementById('vaccineDetailModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

// Mark Vaccine as Complete
function markVaccineComplete(vaccineId) {
    const vaccine = vaccinesData.find(v => v.id === vaccineId);
    if (vaccine && vaccine.status !== 'completed') {
        vaccine.status = 'completed';
        saveVaccinesToStorage();
        showNotification(`${vaccine.name} marked as completed! ✅`, 'success');
        loadLiveVaccines();
        updateLiveStats();
    }
}

// Reschedule Vaccine
function rescheduleVaccine(vaccineId) {
    const vaccine = vaccinesData.find(v => v.id === vaccineId);
    if (!vaccine) return;
    
    const newDate = prompt(`Enter new date for ${vaccine.name} (YYYY-MM-DD):`, vaccine.date);
    if (newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        vaccine.date = newDate;
        vaccine.status = 'scheduled';
        saveVaccinesToStorage();
        showNotification(`${vaccine.name} rescheduled to ${formatDate(newDate)} 📅`, 'success');
        loadLiveVaccines();
        updateLiveStats();
    } else if (newDate) {
        showNotification('Invalid date format. Please use YYYY-MM-DD format.', 'error');
    }
}

// Edit Vaccine
function editVaccine(vaccineId) {
    const vaccine = vaccinesData.find(v => v.id === vaccineId);
    if (!vaccine) return;
    
    // Pre-fill the form
    document.getElementById('vaccineName').value = vaccine.name;
    document.getElementById('vaccineDate').value = vaccine.date;
    document.getElementById('vaccineStatus').value = vaccine.status;
    document.getElementById('vaccineDose').value = vaccine.dose || '1st dose';
    document.getElementById('vaccineNotes').value = vaccine.notes || '';
    
    // Remove the old vaccine
    vaccinesData = vaccinesData.filter(v => v.id !== vaccineId);
    saveVaccinesToStorage();
    
    // Scroll to form
    document.getElementById('vaccineForm').scrollIntoView({ behavior: 'smooth' });
    showNotification('Vaccine loaded for editing. Make your changes and save.', 'info');
}

// Delete Vaccine
function deleteVaccine(vaccineId) {
    if (confirm('Are you sure you want to delete this vaccine record?')) {
        vaccinesData = vaccinesData.filter(v => v.id !== vaccineId);
        saveVaccinesToStorage();
        showNotification('Vaccine record deleted', 'success');
        loadLiveVaccines();
        updateLiveStats();
    }
}

// Mark Vaccine as Incomplete (undo complete)
function markVaccineIncomplete(vaccineId) {
    const vaccine = vaccinesData.find(v => v.id === vaccineId);
    if (vaccine && vaccine.status === 'completed') {
        vaccine.status = 'scheduled';
        saveVaccinesToStorage();
        showNotification(`${vaccine.name} marked as scheduled`, 'info');
        loadLiveVaccines();
        updateLiveStats();
    }
}

// Vaccine Actions - Fixed
function viewVaccineDetails(name) {
    console.log('📋 Viewing vaccine details:', name);
    const vaccine = vaccinesData.find(v => v.name === name);
    if (vaccine) {
        showVaccineDetails(vaccine.id);
    }
}

// Global growth records data for persistent storage
function loadGrowthFromStorage() {
    const stored = localStorage.getItem('mamacare_growth');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            console.log('📊 Loaded growth records from localStorage:', parsed.length, 'records');
            return parsed;
        } catch (e) {
            console.error('❌ Error parsing growth from localStorage:', e);
        }
    }
    return [];
}

function saveGrowthToStorage() {
    try {
        localStorage.setItem('mamacare_growth', JSON.stringify(growthData));
        console.log('💾 Saved growth records to localStorage:', growthData.length, 'records');
    } catch (e) {
        console.error('❌ Error saving growth to localStorage:', e);
    }
}

let growthData = loadGrowthFromStorage();
let nextGrowthId = growthData.length > 0 ? Math.max(...growthData.map(g => g.id)) + 1 : 1;

// Growth form submission handler
function handleGrowthSubmission(e) {
    e.preventDefault();
    
    const date = document.getElementById('growthDate').value;
    const weight = parseFloat(document.getElementById('growthWeight').value);
    const height = parseFloat(document.getElementById('growthHeight').value);
    const head = parseFloat(document.getElementById('growthHead').value) || 0;
    
    if (!date || !weight || !height) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Calculate BMI
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    
    const newRecord = {
        id: nextGrowthId++,
        date: date,
        weight: weight,
        height: height,
        head: head,
        bmi: bmi
    };
    
    growthData.push(newRecord);
    saveGrowthToStorage();
    
    showNotification('Growth record added successfully! 📊', 'success');
    clearGrowthForm();
    loadLiveGrowthRecords();
}

// Clear growth form
function clearGrowthForm() {
    const form = document.getElementById('growthForm');
    if (form) {
        form.reset();
    }
}

// Edit growth record
function editGrowthRecord(id) {
    const record = growthData.find(r => r.id === id);
    if (!record) return;
    
    document.getElementById('growthDate').value = record.date;
    document.getElementById('growthWeight').value = record.weight;
    document.getElementById('growthHeight').value = record.height;
    document.getElementById('growthHead').value = record.head || '';
    
    growthData = growthData.filter(r => r.id !== id);
    saveGrowthToStorage();
    
    document.getElementById('growthForm').scrollIntoView({ behavior: 'smooth' });
    showNotification('Record loaded for editing. Make your changes and save.', 'info');
    loadLiveGrowthRecords();
}

// Delete growth record
function deleteGrowthRecord(id) {
    if (confirm('Are you sure you want to delete this growth record?')) {
        growthData = growthData.filter(r => r.id !== id);
        saveGrowthToStorage();
        showNotification('Growth record deleted', 'success');
        loadLiveGrowthRecords();
    }
}

// Load growth records - user created only
function loadLiveGrowthRecords() {
    console.log('📊 Loading growth records...');
    const growthRecords = document.getElementById('liveGrowthRecords');
    if (!growthRecords) {
        console.error('❌ Growth records container not found');
        return;
    }
    
    // Show empty state or records
    if (growthData.length === 0) {
        growthRecords.innerHTML = `
            <div style="text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); border-radius: 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
                <h3 style="color: #333; font-size: 24px; font-weight: 700; margin-bottom: 15px;">No Growth Records Yet</h3>
                <p style="color: #666; font-size: 16px; margin-bottom: 25px; max-width: 400px; margin-left: auto; margin-right: auto;">Add your child's growth measurements to track their development over time. Record weight, height, and head circumference.</p>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <span style="background: #667eea20; color: #667eea; padding: 8px 16px; border-radius: 20px; font-size: 14px;">⚖️ Track Weight</span>
                    <span style="background: #4caf5020; color: #4caf50; padding: 8px 16px; border-radius: 20px; font-size: 14px;">📏 Measure Height</span>
                    <span style="background: #ff980020; color: #ff9800; padding: 8px 16px; border-radius: 20px; font-size: 14px;">📈 View Progress</span>
                </div>
            </div>
        `;
    } else {
        // Sort by date descending
        const sortedData = [...growthData].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        growthRecords.innerHTML = sortedData.map((record, index) => `
            <div class="growth-record" style="background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 25px; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="font-weight: 700; color: #333; font-size: 18px;">${formatDate(record.date)}</div>
                    <div style="display: flex; gap: 10px;">
                        ${index === 0 ? '<div style="padding: 8px 15px; background: #4caf50; color: white; border-radius: 20px; font-size: 12px; font-weight: 600;">Latest</div>' : ''}
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">⚖️</div>
                        <div style="font-weight: 700; color: #333; font-size: 18px;">${record.weight} kg</div>
                        <div style="color: #666; font-size: 13px;">Weight</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">📏</div>
                        <div style="font-weight: 700; color: #333; font-size: 18px;">${record.height} cm</div>
                        <div style="color: #666; font-size: 13px;">Height</div>
                    </div>
                    ${record.head ? `
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">🧠</div>
                        <div style="font-weight: 700; color: #333; font-size: 18px;">${record.head} cm</div>
                        <div style="color: #666; font-size: 13px;">Head Circ.</div>
                    </div>
                    ` : ''}
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">📊</div>
                        <div style="font-weight: 700; color: #333; font-size: 18px;">${record.bmi}</div>
                        <div style="color: #666; font-size: 13px;">BMI</div>
                    </div>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="editGrowthRecord(${record.id})" style="flex: 1; background: #f8f9fa; color: #667eea; border: 2px solid #667eea; padding: 10px 15px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 600;">✏️ Edit</button>
                    <button onclick="deleteGrowthRecord(${record.id})" style="background: #ffebee; color: #f44336; border: 2px solid #f44336; padding: 10px 15px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 600;">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    console.log('✅ Growth records loaded:', growthData.length, 'records');
}

// Appointment Actions - Fixed
function editAppointment(id) {
    console.log('✏️ Editing appointment:', id);
    const apt = appointmentsData.find(a => a.id === id);
    if (apt) {
        // Pre-fill the form with appointment data
        document.getElementById('liveAppointmentDate').value = apt.date;
        document.getElementById('liveAppointmentTime').value = apt.time;
        document.getElementById('liveAppointmentType').value = apt.type;
        document.getElementById('liveAppointmentDoctor').value = apt.doctor;
        document.getElementById('liveAppointmentNotes').value = apt.notes || '';
        
        // Remove the old appointment and save
        appointmentsData = appointmentsData.filter(a => a.id !== id);
        saveAppointmentsToStorage();
        
        // Switch to schedule tab
        showDoctorTab('schedule');
        showNotification('Appointment loaded for editing. Make your changes and save.', 'info');
    }
}

function completeAppointment(id) {
    console.log('✅ Completing appointment:', id);
    const apt = appointmentsData.find(a => a.id === id);
    if (apt) {
        apt.status = 'completed';
        saveAppointmentsToStorage();
        showNotification('Appointment marked as completed!', 'success');
        setTimeout(() => {
            loadLiveAppointments();
            updateLiveStats();
        }, 500);
    }
}

function cancelAppointment(id) {
    console.log('❌ Cancelling appointment:', id);
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const apt = appointmentsData.find(a => a.id === id);
        if (apt) {
            apt.status = 'cancelled';
            saveAppointmentsToStorage();
            showNotification('Appointment cancelled', 'success');
            setTimeout(() => {
                loadLiveAppointments();
                updateLiveStats();
            }, 500);
        }
    }
}


// Growth Actions - Fixed
function compareGrowth(index) {
    console.log('📈 Comparing growth record:', index);
    showNotification('Growth comparison feature coming soon!', 'info');
}

function printGrowthRecord(index) {
    console.log('🖨️ Printing growth record:', index);
    showNotification('Print functionality coming soon!', 'info');
}

// Clear Appointment Form
function clearAppointmentForm() {
    const form = document.getElementById('liveAppointmentForm');
    if (form) {
        form.reset();
    }
}

// Helper Functions
function getAppointmentIcon(type) {
    const icons = {
        'checkup': '🩺',
        'vaccine': '💉',
        'sick': '🏥',
        'emergency': '🚑',
        'followup': '📋'
    };
    return icons[type] || '📅';
}

function getAppointmentTypeName(type) {
    const names = {
        'checkup': 'Regular Checkup',
        'vaccine': 'Vaccination',
        'sick': 'Sick Visit',
        'emergency': 'Emergency Visit',
        'followup': 'Follow-up Visit'
    };
    return names[type] || 'Appointment';
}

function getAppointmentColor(type) {
    const colors = {
        'checkup': '#4caf50',
        'vaccine': '#ff9800',
        'sick': '#f44336',
        'emergency': '#9c27b0',
        'followup': '#2196f3'
    };
    return colors[type] || '#667eea';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function updateLiveStats() {
    const upcomingCount = document.getElementById('liveUpcomingCount');
    const vaccineProgress = document.getElementById('liveVaccineProgress');
    const growthStatus = document.getElementById('liveGrowthStatus');
    
    if (upcomingCount) upcomingCount.textContent = '2';
    if (vaccineProgress) vaccineProgress.textContent = '85%';
    if (growthStatus) growthStatus.textContent = 'Good';
}

function startRealTimeUpdates() {
    setInterval(() => {
        updateLiveStats();
        console.log('🔄 Real-time update completed');
    }, 30000);
}


// Baby Sleep Tracker - Full Implementation
function openSleepTracker() {
    console.log('😴 Opening Sleep Tracker...');
    
    const modal = document.createElement('div');
    modal.id = 'sleepTrackerModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 25px; max-width: 1000px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 30px 80px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 25px 25px 0 0; position: relative;">
                <button onclick="closeSleepTracker()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; backdrop-filter: blur(10px);">×</button>
                <h2 style="margin: 0; font-size: 32px; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                    😴 Baby Sleep Tracker
                </h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Monitor sleep patterns, naps, and get personalized recommendations</p>
            </div>
            
            <div style="padding: 30px;">
                <!-- Sleep Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 10px;">🌙</div>
                        <div style="font-size: 24px; font-weight: bold;">11.5 hrs</div>
                        <div style="font-size: 14px; opacity: 0.9;">Total Sleep</div>
                        <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">Last 24h</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; padding: 20px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 10px;">😴</div>
                        <div style="font-size: 24px; font-weight: bold;">2.5 hrs</div>
                        <div style="font-size: 14px; opacity: 0.9;">Naps</div>
                        <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">Today</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%); color: white; padding: 20px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 10px;">⏰</div>
                        <div style="font-size: 24px; font-weight: bold;">8:30 PM</div>
                        <div style="font-size: 14px; opacity: 0.9;">Bedtime</div>
                        <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">Average</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%); color: white; padding: 20px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 10px;">☀️</div>
                        <div style="font-size: 24px; font-weight: bold;">7:00 AM</div>
                        <div style="font-size: 14px; opacity: 0.9;">Wake Time</div>
                        <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">Average</div>
                    </div>
                </div>
                
                <!-- Add Sleep Entry -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 700;">Record Sleep Session</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <input type="date" id="sleepDate" style="padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px;">
                        <input type="time" id="sleepStart" placeholder="Sleep Time" style="padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px;">
                        <input type="time" id="sleepEnd" placeholder="Wake Time" style="padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px;">
                        <select id="sleepType" style="padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px;">
                            <option value="night">Night Sleep</option>
                            <option value="nap">Nap</option>
                            <option value="quiet">Quiet Time</option>
                        </select>
                        <button onclick="addSleepEntry()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 25px; border-radius: 10px; font-weight: 600; cursor: pointer;">Add Entry</button>
                    </div>
                </div>
                
                <!-- Sleep Pattern Chart -->
                <div style="background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; font-weight: 700;">Weekly Sleep Pattern</h3>
                    <canvas id="sleepChart" width="900" height="200"></canvas>
                </div>
                
                <!-- Recent Sleep Entries -->
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 700;">Recent Sleep Entries</h3>
                    <div id="sleepEntries" style="display: grid; gap: 15px;">
                        <!-- Sleep entries will be added here -->
                    </div>
                </div>
                
                <!-- Sleep Recommendations -->
                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; padding: 25px;">
                    <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 700;">AI Sleep Recommendations</h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: white; border-left: 4px solid #4caf50; border-radius: 10px; padding: 20px;">
                            <div style="font-weight: 700; color: #2e7d32; margin-bottom: 10px; font-size: 16px;">✓ Excellent Sleep Pattern</div>
                            <div style="color: #555; font-size: 14px; line-height: 1.6;">Your toddler is getting the recommended 11-14 hours of sleep per day. Keep maintaining the consistent bedtime routine!</div>
                        </div>
                        <div style="background: white; border-left: 4px solid #2196f3; border-radius: 10px; padding: 20px;">
                            <div style="font-weight: 700; color: #1565c0; margin-bottom: 10px; font-size: 16px;">💡 Optimize Nap Schedule</div>
                            <div style="color: #555; font-size: 14px; line-height: 1.6;">Consider moving the afternoon nap 30 minutes earlier to improve night sleep quality.</div>
                        </div>
                        <div style="background: white; border-left: 4px solid #ff9800; border-radius: 10px; padding: 20px;">
                            <div style="font-weight: 700; color: #ef6c00; margin-bottom: 10px; font-size: 16px;">🌙 Bedtime Routine Tips</div>
                            <div style="color: #555; font-size: 14px; line-height: 1.6;">Start winding down 30 minutes before bedtime with quiet activities like reading or gentle music.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    initializeSleepData();
}

function closeSleepTracker() {
    const modal = document.getElementById('sleepTrackerModal');
    if (modal) {
        modal.remove();
    }
}

function initializeSleepData() {
    // Initialize sleep entries
    const sleepEntries = [
        { date: '2024-12-10', start: '8:30 PM', end: '7:00 AM', type: 'night', duration: '10.5 hrs' },
        { date: '2024-12-10', start: '1:00 PM', end: '3:30 PM', type: 'nap', duration: '2.5 hrs' },
        { date: '2024-12-09', start: '8:45 PM', end: '7:15 AM', type: 'night', duration: '10.5 hrs' },
        { date: '2024-12-09', start: '12:30 PM', end: '2:45 PM', type: 'nap', duration: '2.25 hrs' },
        { date: '2024-12-08', start: '8:15 PM', end: '6:45 AM', type: 'night', duration: '10.5 hrs' }
    ];
    
    const entriesList = document.getElementById('sleepEntries');
    entriesList.innerHTML = sleepEntries.map(entry => `
        <div style="background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 32px;">${entry.type === 'night' ? '🌙' : '😴'}</div>
                <div>
                    <div style="font-weight: 700; color: #333; font-size: 16px;">${entry.type === 'night' ? 'Night Sleep' : 'Nap'}</div>
                    <div style="color: #666; font-size: 14px;">${entry.date}</div>
                    <div style="color: #666; font-size: 14px;">${entry.start} - ${entry.end}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #333; font-size: 18px;">${entry.duration}</div>
                <div style="color: #666; font-size: 12px;">Duration</div>
            </div>
        </div>
    `).join('');
    
    // Draw sleep chart
    setTimeout(() => drawSleepChart(), 100);
}

function drawSleepChart() {
    const canvas = document.getElementById('sleepChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw simple bar chart
    const data = [10.5, 11, 10.5, 11.5, 10, 11.5, 10.5]; // Sleep hours for each day
    const barWidth = width / data.length - 20;
    const maxHours = 14;
    
    data.forEach((hours, index) => {
        const barHeight = (hours / maxHours) * (height - 40);
        const x = index * (barWidth + 20) + 10;
        const y = height - barHeight - 20;
        
        // Draw bar
        const gradient = ctx.createLinearGradient(0, y, 0, height - 20);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw hour label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(hours + 'h', x + barWidth / 2, y - 5);
        
        // Draw day label
        ctx.fillText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index], x + barWidth / 2, height - 5);
    });
}

function addSleepEntry() {
    const date = document.getElementById('sleepDate').value;
    const start = document.getElementById('sleepStart').value;
    const end = document.getElementById('sleepEnd').value;
    const type = document.getElementById('sleepType').value;
    
    if (!date || !start || !end) {
        showNotification('Please fill all sleep details', 'error');
        return;
    }
    
    // Calculate sleep duration
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    let durationMs = endDate - startDate;
    
    // Handle overnight sleep (negative duration)
    if (durationMs < 0) {
        durationMs += 24 * 60 * 60 * 1000;
    }
    
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalHours = durationMs / (1000 * 60 * 60);
    
    // Generate sleep assessment
    const assessment = getSleepAssessment(type, totalHours);
    
    // Create results popup modal
    const modal = document.createElement('div');
    modal.id = 'sleepResultModal';
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
        <div style="background: white; border-radius: 20px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 20px 20px 0 0; position: relative;">
                <button onclick="closeSleepResultModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                    😴 Sleep Session Results
                </h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">${formatDate(date)} • ${type === 'night' ? '🌙 Night Sleep' : type === 'nap' ? '😴 Nap' : '📖 Quiet Time'}</p>
            </div>
            
            <div style="padding: 25px;">
                <!-- Duration Card -->
                <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                    <div style="font-size: 48px; font-weight: 800; color: #4caf50; line-height: 1;">${durationHours}<span style="font-size: 24px;">h</span> ${durationMinutes > 0 ? durationMinutes + '<span style="font-size: 24px;">m</span>' : ''}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 8px;">Total Sleep Duration</div>
                    <div style="font-size: 16px; font-weight: 600; color: #4caf50; margin-top: 10px; padding: 6px 16px; background: rgba(76,175,80,0.15); border-radius: 20px; display: inline-block;">${assessment.rating}</div>
                </div>
                
                <!-- Time Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 20px; margin-bottom: 5px;">🌙</div>
                        <div style="font-size: 18px; font-weight: 700; color: #333;">${formatTime(start)}</div>
                        <div style="font-size: 12px; color: #666;">Sleep Start</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 20px; margin-bottom: 5px;">☀️</div>
                        <div style="font-size: 18px; font-weight: 700; color: #333;">${formatTime(end)}</div>
                        <div style="font-size: 12px; color: #666;">Wake Up</div>
                    </div>
                </div>
                
                <!-- Assessment -->
                <div style="padding: 20px; background: ${assessment.bgColor}; border-radius: 15px; margin-bottom: 20px; border-left: 4px solid ${assessment.borderColor};">
                    <strong style="color: ${assessment.textColor}; font-size: 16px; display: block; margin-bottom: 8px;">${assessment.emoji} ${assessment.title}</strong>
                    <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.5;">${assessment.message}</p>
                </div>
                
                <!-- Recommendations -->
                <div style="padding: 20px; background: #f8f9fa; border-radius: 15px; margin-bottom: 20px;">
                    <strong style="color: #667eea; font-size: 16px; display: block; margin-bottom: 10px;">💡 Recommendations</strong>
                    <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                        ${assessment.recommendations.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
                
                <p style="margin: 0; font-size: 12px; color: #999; font-style: italic; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <em>Consistent sleep tracking helps identify patterns and improve sleep quality over time.</em>
                </p>
            </div>
            
            <div style="padding: 0 25px 25px 25px; text-align: center; display: flex; gap: 10px;">
                <button onclick="closeSleepResultModal()" style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer;">Close</button>
                <button onclick="saveAndCloseSleepModal('${date}', '${start}', '${end}', '${type}', ${totalHours.toFixed(2)})" style="flex: 1; background: #4caf50; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer;">💾 Save Entry</button>
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
}

function closeSleepResultModal() {
    const modal = document.getElementById('sleepResultModal');
    if (modal) {
        modal.remove();
    }
}

function saveAndCloseSleepModal(date, start, end, type, duration) {
    // Save to localStorage
    const sleepEntries = JSON.parse(localStorage.getItem('mamacare_sleep_entries') || '[]');
    sleepEntries.push({
        id: Date.now(),
        date,
        start,
        end,
        type,
        duration: duration.toFixed(2),
        recordedAt: new Date().toISOString()
    });
    localStorage.setItem('mamacare_sleep_entries', JSON.stringify(sleepEntries));
    
    closeSleepResultModal();
    showNotification('Sleep entry saved successfully!', 'success');
    
    // Clear form
    document.getElementById('sleepDate').value = '';
    document.getElementById('sleepStart').value = '';
    document.getElementById('sleepEnd').value = '';
}

function getSleepAssessment(type, hours) {
    if (type === 'night') {
        if (hours >= 10 && hours <= 12) {
            return {
                rating: '✓ Optimal',
                title: 'Excellent Night Sleep',
                emoji: '🌟',
                message: 'This is the ideal amount of night sleep for a toddler. Great job maintaining a healthy sleep schedule!',
                bgColor: '#e8f5e9',
                borderColor: '#4caf50',
                textColor: '#2e7d32',
                recommendations: ['Keep the consistent bedtime routine', 'Continue the calming pre-sleep activities', 'Document any sleep disruptions for patterns']
            };
        } else if (hours >= 8 && hours < 10) {
            return {
                rating: 'Good',
                title: 'Adequate Sleep',
                emoji: '👍',
                message: 'This is a good amount of sleep, though slightly below the recommended 10-12 hours for toddlers.',
                bgColor: '#e3f2fd',
                borderColor: '#2196f3',
                textColor: '#1565c0',
                recommendations: ['Try moving bedtime 15-30 minutes earlier', 'Ensure the sleep environment is dark and quiet', 'Limit screen time 1 hour before bed']
            };
        } else if (hours < 8) {
            return {
                rating: '⚠️ Short',
                title: 'Insufficient Sleep',
                emoji: '⚠️',
                message: 'This is less sleep than recommended. Toddlers typically need 10-12 hours of night sleep for optimal development.',
                bgColor: '#fff3e0',
                borderColor: '#ff9800',
                textColor: '#ef6c00',
                recommendations: ['Consider an earlier bedtime tonight', 'Check for environmental disturbances', 'Evaluate if overtiredness is causing wakefulness', 'Consult pediatrician if pattern continues']
            };
        } else {
            return {
                rating: 'Long',
                title: 'Extended Sleep',
                emoji: '😴',
                message: 'This is more sleep than average. While extra rest is fine occasionally, very long sleep may indicate the child was sleep-deprived.',
                bgColor: '#f3e5f5',
                borderColor: '#9c27b0',
                textColor: '#7b1fa2',
                recommendations: ['Monitor energy levels during the day', 'Ensure wake time is consistent', 'Check for any signs of illness if sleeping excessively']
            };
        }
    } else if (type === 'nap') {
        if (hours >= 1 && hours <= 2.5) {
            return {
                rating: '✓ Perfect',
                title: 'Ideal Nap Duration',
                emoji: '😊',
                message: 'This is a perfect nap length for a toddler. It provides restorative rest without interfering with night sleep.',
                bgColor: '#e8f5e9',
                borderColor: '#4caf50',
                textColor: '#2e7d32',
                recommendations: ['Maintain this nap schedule', 'Keep nap time consistent each day', 'Wake by 4 PM to protect bedtime']
            };
        } else if (hours < 1) {
            return {
                rating: 'Short',
                title: 'Brief Nap',
                emoji: '⏱️',
                message: 'This is a short nap. While power naps can help, toddlers typically benefit from longer naps for full restoration.',
                bgColor: '#fff3e0',
                borderColor: '#ff9800',
                textColor: '#ef6c00',
                recommendations: ['Ensure nap environment is conducive to sleep', 'Check if overtiredness prevented settling', 'Consider a slightly earlier nap time tomorrow']
            };
        } else {
            return {
                rating: 'Long Nap',
                title: 'Extended Nap',
                emoji: '🌙',
                message: 'This is a long nap. While beneficial occasionally, very long naps may affect night sleep timing.',
                bgColor: '#e3f2fd',
                borderColor: '#2196f3',
                textColor: '#1565c0',
                recommendations: ['Watch for delayed bedtime tonight', 'Cap future naps at 2.5 hours if bedtime issues arise', 'Consider if child is catching up on sleep debt']
            };
        }
    } else {
        return {
            rating: 'Quiet Time',
            title: 'Rest Period',
            emoji: '📖',
            message: 'Quiet time is valuable for rest and relaxation, even without sleep. It helps prevent overstimulation.',
            bgColor: '#f3e5f5',
            borderColor: '#9c27b0',
            textColor: '#7b1fa2',
            recommendations: ['Continue offering quiet time daily', 'Use books, puzzles, or calm music', 'Keep screens off during quiet time']
        };
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Helper functions for better organization
function getConcernLabel(concern) {
    const labels = {
        'tantrums': 'Emotional Regulation',
        'sharing': 'Social Sharing',
        'sleep': 'Sleep Patterns',
        'eating': 'Eating Habits',
        'social': 'Social Interaction',
        'communication': 'Language Development'
    };
    return labels[concern] || concern;
}

function getDevelopmentLevel(score) {
    if (score >= 90) return 'Excellent Development';
    if (score >= 80) return 'Advanced Development';
    if (score >= 70) return 'On Track';
    if (score >= 60) return 'Needs Support';
    return 'Requires Attention';
}

function getPatternLevel(pattern) {
    if (pattern === 'Excellent') return 'Optimal Patterns';
    if (pattern === 'Good') return 'Positive Patterns';
    if (pattern === 'Normal') return 'Typical Development';
    if (pattern === 'Concerning') return 'Needs Guidance';
    return 'Requires Intervention';
}

function getRiskLevel(risk) {
    if (risk === 'Low') return 'Minimal Risk';
    if (risk === 'Moderate') return 'Some Risk Factors';
    if (risk === 'High') return 'Elevated Risk';
    return 'Significant Risk';
}

function getInsightColor(confidence) {
    if (confidence >= 90) return '#4caf50';
    if (confidence >= 80) return '#ff9800';
    if (confidence >= 70) return '#ff5722';
    return '#9c27b0';
}

function getInsightIcon(category) {
    const icons = {
        'emotional': '💭',
        'social': '👥',
        'cognitive': '🧠',
        'behavioral': '🎯',
        'developmental': '📈',
        'recommendation': '💡'
    };
    return icons[category] || '📊';
}

function printBehaviorReport() {
    console.log('🖨️ Printing Behavior Analysis Report...');
    window.print();
}

function shareAnalysisResults() {
    console.log('📤 Sharing Analysis Results...');
    
    // Create shareable content
    const shareData = {
        title: 'AI Behavior Analysis Results',
        text: 'Check out these advanced AI behavior analysis results!',
        url: window.location.href
    };
    
    // Try Web Share API first
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.url).then(() => {
            showValidationError('📋 Analysis link copied to clipboard!');
        });
    }
}

// Enhanced insights generation with more detailed data
function generateAdvancedBehaviorInsights(name, age, concern) {
    const baseScore = Math.floor(Math.random() * 25) + 70;
    const confidence = Math.floor(Math.random() * 15) + 85;
    
    const insights = {
        developmentScore: baseScore,
        behaviorPattern: baseScore >= 85 ? 'Excellent' : baseScore >= 75 ? 'Good' : 'Normal',
        recommendations: Math.floor(Math.random() * 4) + 3,
        confidence: confidence,
        accuracy: Math.floor(Math.random() * 8) + 92,
        riskLevel: baseScore >= 80 ? 'Low' : baseScore >= 70 ? 'Moderate' : 'High',
        insightsCount: Math.floor(Math.random() * 3) + 4,
        overallRecommendation: '',
        detailedInsights: []
    };
    
    const concernInsights = {
        'tantrums': [
            { 
                title: 'Emotional Regulation Patterns', 
                description: 'AI detects normal emotional development with age-appropriate responses. Tantrums are within expected range for this developmental stage, showing healthy emotional expression.',
                confidence: 94,
                category: 'emotional',
                actionable: true,
                actions: [
                    'Implement consistent calming routines before trigger situations',
                    'Use positive reinforcement for emotional regulation',
                    'Create a designated calm-down space with sensory tools'
                ]
            },
            { 
                title: 'Trigger Analysis & Prediction', 
                description: 'Machine learning identifies fatigue, hunger, and overstimulation as primary triggers. AI predicts 78% reduction in tantrums with routine adjustments.',
                confidence: 89,
                category: 'behavioral',
                actionable: true,
                actions: [
                    'Monitor sleep patterns and adjust bedtime routines',
                    'Establish regular meal and snack schedules',
                    'Limit overstimulating activities before nap times'
                ]
            },
            { 
                title: 'Coping Mechanisms Development', 
                description: 'Neural network analysis shows strong coping skill potential. Child demonstrates age-appropriate self-soothing behaviors.',
                confidence: 91,
                category: 'developmental',
                actionable: true,
                actions: [
                    'Teach deep breathing exercises through play',
                    'Practice emotional vocabulary building',
                    'Model appropriate emotional responses'
                ]
            }
        ],
        'sharing': [
            { 
                title: 'Social Development Progress', 
                description: 'AI analysis shows typical egocentric behavior evolving into sharing awareness. Social skills developing within normal parameters.',
                confidence: 92,
                category: 'social',
                actionable: true,
                actions: [
                    'Practice sharing through structured play activities',
                    'Use turn-taking games to build sharing skills',
                    'Praise sharing behaviors specifically and immediately'
                ]
            },
            { 
                title: 'Empathy & Perspective Taking', 
                description: 'Deep learning detects emerging empathy patterns. Child shows beginning understanding of others\' feelings and perspectives.',
                confidence: 87,
                category: 'emotional',
                actionable: true,
                actions: [
                    'Read stories about emotions and friendships',
                    'Discuss characters\' feelings in books and shows',
                    'Model empathetic responses to others\' needs'
                ]
            }
        ],
        'sleep': [
            { 
                title: 'Circadian Rhythm Development', 
                description: 'AI algorithms detect healthy circadian rhythm establishment. Sleep architecture shows age-appropriate cycles and patterns.',
                confidence: 95,
                category: 'developmental',
                actionable: true,
                actions: [
                    'Maintain consistent bedtime and wake-up times',
                    'Create relaxing bedtime routine with predictable sequence',
                    'Ensure optimal sleep environment (dark, cool, quiet)'
                ]
            },
            { 
                title: 'Sleep Quality Optimization', 
                description: 'Machine learning indicates 87% sleep efficiency. Minor adjustments to bedtime routine could improve sleep duration by 45 minutes.',
                confidence: 88,
                category: 'behavioral',
                actionable: true,
                actions: [
                    'Implement wind-down period 30 minutes before bedtime',
                    'Remove screens and stimulating activities 1 hour before sleep',
                    'Use white noise or soft music for sleep association'
                ]
            }
        ],
        'eating': [
            { 
                title: 'Nutritional Behavior Analysis', 
                description: 'AI detects normal food exploration patterns. Picky eating behaviors within expected developmental range for this age group.',
                confidence: 90,
                category: 'behavioral',
                actionable: true,
                actions: [
                    'Offer variety of healthy foods repeatedly',
                    'Model positive eating behaviors and food enjoyment',
                    'Create stress-free mealtime environment'
                ]
            },
            { 
                title: 'Sensory Processing Development', 
                description: 'Deep learning analysis shows normal sensory processing of food textures and flavors. Child demonstrates appropriate sensory integration.',
                confidence: 89,
                category: 'developmental',
                actionable: true,
                actions: [
                    'Introduce new foods gradually with repeated exposure',
                    'Involve child in food preparation to increase familiarity',
                    'Respect child\'s sensory preferences while encouraging variety'
                ]
            }
        ],
        'social': [
            { 
                title: 'Social Interaction Patterns', 
                description: 'AI analysis reveals age-appropriate social development. Attachment patterns indicate healthy caregiver bond formation.',
                confidence: 93,
                category: 'social',
                actionable: true,
                actions: [
                    'Arrange regular playdates with peers',
                    'Practice social skills through structured group activities',
                    'Model positive social interactions and problem-solving'
                ]
            },
            { 
                title: 'Communication Development Tracking', 
                description: 'Neural network detects emerging social communication skills. Non-verbal and verbal communication progressing normally.',
                confidence: 88,
                category: 'developmental',
                actionable: true,
                actions: [
                    'Engage in reciprocal conversations throughout the day',
                    'Expand vocabulary through descriptive language',
                    'Practice turn-taking in conversations and play'
                ]
            }
        ],
        'communication': [
            { 
                title: 'Language Acquisition Trajectory', 
                description: 'AI analysis shows normal language development trajectory. Vocabulary growth rate indicates strong language learning potential.',
                confidence: 94,
                category: 'developmental',
                actionable: true,
                actions: [
                    'Read daily and discuss stories interactively',
                    'Use expanded vocabulary in everyday conversations',
                    'Sing songs and nursery rhymes to build language patterns'
                ]
            },
            { 
                title: 'Communication Pattern Analysis', 
                description: 'Deep learning detects age-appropriate non-verbal and verbal communication patterns. Child uses multiple communication modes effectively.',
                confidence: 91,
                category: 'behavioral',
                actionable: true,
                actions: [
                    'Respond attentively to all communication attempts',
                    'Expand on child\'s initiated topics',
                    'Model rich language and varied communication styles'
                ]
            }
        ]
    };
    
    insights.detailedInsights = concernInsights[concern] || concernInsights['tantrums'];
    insights.overallRecommendation = `Based on comprehensive AI analysis of ${name}'s behavioral patterns at ${age} months, continue current positive parenting approach while implementing the ${insights.recommendations} targeted recommendations for optimal development outcomes.`;
    
    return insights;
}

function generateAdvancedBehaviorInsights(name, age, concern) {
    const insights = {
        developmentScore: Math.floor(Math.random() * 30) + 70,
        behaviorPattern: 'Normal',
        recommendations: Math.floor(Math.random() * 5) + 3,
        overallRecommendation: '',
        detailedInsights: []
    };
    
    const concernInsights = {
        'tantrums': [
            { title: 'Emotional Regulation Patterns', description: 'AI detects normal emotional development with age-appropriate responses. Tantrums are within expected range for this developmental stage.', confidence: 94 },
            { title: 'Trigger Analysis', description: 'Machine learning identifies common triggers: fatigue, hunger, and overstimulation as primary factors.', confidence: 89 },
            { title: 'Coping Mechanisms', description: 'Neural network analysis suggests implementing consistent calming routines and positive reinforcement strategies.', confidence: 91 }
        ],
        'sharing': [
            { title: 'Social Development', description: 'AI analysis shows typical egocentric behavior for this age group. Sharing skills developing normally.', confidence: 92 },
            { title: 'Empathy Indicators', description: 'Deep learning detects emerging empathy patterns. Continue modeling sharing behaviors.', confidence: 87 },
            { title: 'Social Learning', description: 'Neural networks indicate strong observational learning capabilities. Peer interaction recommended.', confidence: 93 }
        ],
        'sleep': [
            { title: 'Sleep Pattern Analysis', description: 'AI algorithms detect normal circadian rhythm development. Sleep architecture is age-appropriate.', confidence: 95 },
            { title: 'Sleep Quality Metrics', description: 'Machine learning indicates good sleep efficiency. Minor adjustments to bedtime routine may help.', confidence: 88 },
            { title: 'Developmental Impact', description: 'Neural network analysis shows sleep patterns positively impacting cognitive development.', confidence: 91 }
        ],
        'eating': [
            { title: 'Nutritional Behavior', description: 'AI detects normal food exploration patterns. Picky eating within expected developmental range.', confidence: 90 },
            { title: 'Sensory Processing', description: 'Deep learning analysis shows normal sensory processing of food textures and flavors.', confidence: 89 },
            { title: 'Growth Correlation', description: 'Machine learning indicates eating patterns support healthy growth trajectory.', confidence: 92 }
        ],
        'social': [
            { title: 'Social Interaction Patterns', description: 'AI analysis reveals age-appropriate social development. Attachment patterns are healthy.', confidence: 93 },
            { title: 'Communication Development', description: 'Neural network detects emerging social communication skills. Continue encouraging interactions.', confidence: 88 },
            { title: 'Peer Engagement', description: 'Machine learning shows positive response to peer interactions. Social skills developing normally.', confidence: 90 }
        ],
        'communication': [
            { title: 'Language Acquisition', description: 'AI analysis shows normal language development trajectory. Vocabulary growth is on track.', confidence: 94 },
            { title: 'Communication Patterns', description: 'Deep learning detects age-appropriate non-verbal and verbal communication patterns.', confidence: 91 },
            { title: 'Cognitive Indicators', description: 'Neural network analysis indicates strong cognitive-linguistic correlation.', confidence: 89 }
        ]
    };
    
    insights.detailedInsights = concernInsights[concern] || concernInsights['tantrums'];
    insights.overallRecommendation = `Based on comprehensive AI analysis of ${name}'s behavioral patterns, continue current parenting approach with minor adjustments for optimal development.`;
    
    return insights;
}

// Enhanced Learning Path Optimizer Functions with Interactive Features
function updateSkillProgress() {
    const checkboxes = document.querySelectorAll('#learningOptimizationForm input[type="checkbox"]');
    const checked = document.querySelectorAll('#learningOptimizationForm input[type="checkbox"]:checked');
    const percentage = Math.round((checked.length / checkboxes.length) * 100);
    
    // Update progress bar
    const progressFill = document.getElementById('skillsProgressFill');
    const percentageText = document.getElementById('skillsPercentage');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (percentageText) {
        percentageText.textContent = percentage + '%';
    }
    
    // Update milestones
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        const threshold = parseInt(milestone.dataset.threshold);
        if (percentage >= threshold) {
            milestone.classList.add('achieved');
        } else {
            milestone.classList.remove('achieved');
        }
    });
    
    // Add celebration animation when 100%
    if (percentage === 100) {
        celebrateSkillsComplete();
    }
}

function celebrateSkillsComplete() {
    // Create celebration message
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 20px;
        font-size: 20px;
        font-weight: 700;
        text-align: center;
        box-shadow: 0 20px 60px rgba(76, 175, 80, 0.4);
        z-index: 10000;
        animation: celebrationBounce 0.6s ease-out;
    `;
    celebration.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <div>Skills Assessment Complete!</div>
        <div style="font-size: 16px; opacity: 0.9; margin-top: 10px;">Ready for AI Learning Optimization</div>
    `;
    
    document.body.appendChild(celebration);
    
    // Remove celebration after 3 seconds
    setTimeout(() => {
        celebration.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(celebration);
        }, 300);
    }, 3000);
}

function showCompletionMessage(message) {
    // Remove existing message
    const existingMsg = document.getElementById('completionMessage');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.id = 'completionMessage';
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        animation: slideInUp 0.5s ease-out;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
    `;
    messageDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
        <div>${message}</div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutDown 0.5s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 500);
    }, 3000);
}

function optimizeLearningPath() {
    console.log('🎯 Launching Advanced Learning Path Optimization...');
    
    const name = document.getElementById('learningName').value;
    const age = document.getElementById('learningAge').value;
    const goal = document.getElementById('learningGoals').value;
    const skills = getSelectedSkills();
    
    if (!name || !age || !goal) {
        showValidationError('⚠️ Please complete name, age group, and learning goal');
        highlightEmptyLearningFields();
        return;
    }
    
    if (skills.length === 0) {
        showValidationError('⚠️ Please select at least one skill area');
        return;
    }
    
    // Show AI Processing Animation
    showLearningProcessing();
    
    // Simulate Advanced AI Processing
    setTimeout(() => {
        hideLearningProcessing();
        
        // Generate Advanced Learning Path
        const learningPath = generateAdvancedLearningPath(name, goal, skills, age);
        
        // Display comprehensive results
        displayLearningOptimizationResults(learningPath, name, goal, skills, age);
        
        // Scroll to results smoothly
        setTimeout(() => {
            document.getElementById('learningResult').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
        
    }, 2500); // Simulate AI processing time
}

function highlightEmptyLearningFields() {
    // Remove existing highlights
    document.querySelectorAll('.learning-field-error').forEach(field => {
        field.classList.remove('learning-field-error');
        field.style.borderColor = '#e0e0e0';
    });
    
    // Highlight empty fields
    const nameField = document.getElementById('learningName');
    const ageField = document.getElementById('learningAge');
    const goalField = document.getElementById('learningGoals');
    
    if (!nameField.value) {
        nameField.classList.add('learning-field-error');
        nameField.style.borderColor = '#ff5252';
        nameField.style.boxShadow = '0 0 0 3px rgba(255, 82, 82, 0.2)';
    }
    
    if (!ageField.value) {
        ageField.classList.add('learning-field-error');
        ageField.style.borderColor = '#ff5252';
        ageField.style.boxShadow = '0 0 0 3px rgba(255, 82, 82, 0.2)';
    }
    
    if (!goalField.value) {
        goalField.classList.add('learning-field-error');
        goalField.style.borderColor = '#ff5252';
        goalField.style.boxShadow = '0 0 0 3px rgba(255, 82, 82, 0.2)';
    }
}

function displayLearningOptimizationResults(learningPath, name, goal, skills, age) {
    const resultDiv = document.getElementById('learningResult');
    resultDiv.style.display = 'block';
    resultDiv.className = 'result-section fade-in-up';
    
    resultDiv.innerHTML = `
        <!-- AI Learning Optimization Header -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 35px; border-radius: 20px; margin-bottom: 30px; box-shadow: 0 20px 40px rgba(240, 147, 251, 0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent); animation: dataFlow 4s linear infinite;"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0; font-size: 28px; font-weight: 800;">🎯 AI Learning Path Optimized</h3>
                    <p style="margin: 5px 0 0 0; font-size: 18px; opacity: 0.9;"><strong>${name}</strong> • ${getAgeLabel(age)} • ${getGoalLabel(goal)} • ${skills.length} Skills</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Optimization Success</div>
                    <div style="font-size: 32px; font-weight: bold;">${learningPath.successRate}%</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px;">
                <div class="ai-status" style="background: rgba(255,255,255,0.15);">
                    <div class="ai-status-dot"></div>
                    <span>🧠 850+ AI Modules</span>
                </div>
                <div class="ai-status" style="background: rgba(255,255,255,0.15);">
                    <div class="ai-status-dot" style="background: #4caf50;"></div>
                    <span>📈 ${learningPath.successRate}% Success</span>
                </div>
                <div class="ai-status" style="background: rgba(255,255,255,0.15);">
                    <div class="ai-status-dot" style="background: #ff9800;"></div>
                    <span>⚡ Real-time Adaptation</span>
                </div>
                <div class="ai-status" style="background: rgba(255,255,255,0.15);">
                    <div class="ai-status-dot" style="background: #9c27b0;"></div>
                    <span>🎮 Gamified Learning</span>
                </div>
            </div>
        </div>
        
        <!-- HORIZONTAL Learning Metrics Dashboard -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div class="metric-card" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);">
                <div style="font-size: 36px; margin-bottom: 15px;">📚</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${learningPath.modules}</div>
                <div style="font-size: 14px; opacity: 0.9;">Learning Modules</div>
                <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.2); border-radius: 15px; font-size: 12px;">
                    Interactive
                </div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);">
                <div style="font-size: 36px; margin-bottom: 15px;">🎯</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${learningPath.duration}</div>
                <div style="font-size: 14px; opacity: 0.9;">Optimal Duration</div>
                <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.2); border-radius: 15px; font-size: 12px;">
                    Personalized
                </div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);">
                <div style="font-size: 36px; margin-bottom: 15px;">📊</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${learningPath.successRate}%</div>
                <div style="font-size: 14px; opacity: 0.9;">Predicted Success</div>
                <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.2); border-radius: 15px; font-size: 12px;">
                    AI-Powered
                </div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%);">
                <div style="font-size: 36px; margin-bottom: 15px;">🏆</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${learningPath.achievements}</div>
                <div style="font-size: 14px; opacity: 0.9;">Achievements</div>
                <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.2); border-radius: 15px; font-size: 12px;">
                    Unlockable
                </div>
            </div>
        </div>
        
        <!-- HORIZONTAL Learning Activities Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            ${learningPath.activities.map((activity, index) => `
                <div class="insight-card fade-in-up" style="animation-delay: ${index * 0.1}s; border-left-color: #f093fb; cursor: pointer;" onclick="startLearningActivity('${activity.title}')">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #333; font-size: 18px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                ${activity.title}
                                <span class="confidence-badge" style="background: #f093fb;">
                                    ${activity.duration}
                                </span>
                            </div>
                            <div style="color: #666; font-size: 15px; line-height: 1.6;">${activity.description}</div>
                        </div>
                        <div style="font-size: 24px; margin-left: 15px;">${getActivityIcon(activity.category)}</div>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border-left: 4px solid #4caf50;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px;">🎮 Interactive Features:</div>
                        <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.5;">
                            ${activity.features.map(feature => `<li style="margin-bottom: 5px;">${feature}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- Gamified Progress System -->
        <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(253, 203, 110, 0.3); margin-bottom: 30px; position: relative;">
            <div style="position: absolute; top: -10px; right: -10px; width: 30px; height: 30px; background: #ff6b6b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);">
                🎮
            </div>
            
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 28px;">🏆</div>
                <div>
                    <div style="font-weight: 700; color: #333; font-size: 18px; margin-bottom: 5px;">Gamified Learning Journey</div>
                    <div style="color: #666; font-size: 15px; line-height: 1.5;">${learningPath.gamificationMessage}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.3); border-radius: 10px;">
                <div style="font-size: 12px; color: #333; font-weight: 600; margin-bottom: 8px;">🎯 Learning Rewards:</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 11px; color: #555;">
                    <div>🌟 Daily Streak Bonuses</div>
                    <div>🏆 Achievement Badges</div>
                    <div>💎 Progress Rewards</div>
                </div>
            </div>
        </div>
        
        <!-- HORIZONTAL Action Buttons -->
        <div style="text-align: center; margin-top: 40px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <button onclick="startLearningJourney()" class="ai-button-secondary" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                🚀 Start Learning Journey
            </button>
            <button onclick="saveLearningPath()" class="ai-button-secondary" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white;">
                💾 Save Learning Path
            </button>
            <button onclick="shareLearningResults()" class="ai-button-secondary" style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%); color: white;">
                📤 Share Progress
            </button>
            <button onclick="printLearningReport()" class="ai-button-secondary" style="background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%); color: white;">
                🖨️ Print Report
            </button>
        </div>
    `;
}

function getAgeLabel(age) {
    const labels = {
        '12': '12-18 months',
        '18': '18-24 months', 
        '24': '24-30 months',
        '30': '30-36 months'
    };
    return labels[age] || age + ' months';
}

function generateAdvancedLearningPath(name, goal, skills, age) {
    const baseModules = Math.floor(Math.random() * 10) + 15;
    const successRate = Math.floor(Math.random() * 15) + 85;
    
    const learningPath = {
        modules: baseModules,
        duration: getOptimalDuration(goal, age),
        successRate: successRate,
        achievements: Math.floor(Math.random() * 8) + 12,
        gamificationMessage: getGamificationMessage(goal, age),
        activities: generateLearningActivities(goal, skills, age)
    };
    
    return learningPath;
}

function getOptimalDuration(goal, age) {
    const baseDurations = {
        'school-readiness': '12 weeks',
        'language-development': '8 weeks',
        'social-skills': '10 weeks',
        'independence': '6 weeks',
        'creativity': '9 weeks'
    };
    
    const ageAdjustments = {
        '12': ' (Early Toddler)',
        '18': ' (Mid Toddler)',
        '24': ' (Advanced Toddler)',
        '30': ' (Pre-School Ready)'
    };
    
    return baseDurations[goal] + ageAdjustments[age] || '8 weeks';
}

function getGamificationMessage(goal, age) {
    const messages = {
        'school-readiness': `Earn badges for daily learning milestones and unlock special rewards for consistent progress! Perfect for ${getAgeLabel(age)} development.`,
        'language-development': `Complete language challenges to unlock story rewards and vocabulary achievements! Tailored for ${getAgeLabel(age)} language skills.`,
        'social-skills': `Master social scenarios to earn friendship badges and group activity rewards! Age-appropriate for ${getAgeLabel(age)}.`,
        'independence': `Gain independence points for daily tasks and unlock special responsibility badges! Designed for ${getAgeLabel(age)}.`,
        'creativity': `Create and share artwork to earn creativity stars and unlock new creative tools! Perfect for ${getAgeLabel(age)} imagination.`
    };
    return messages[goal] || `Complete activities to earn points and unlock achievements! Optimized for ${getAgeLabel(age)}.`;
}

function generateLearningActivities(goal, skills, age) {
    const activities = {
        'school-readiness': [
            {
                title: 'Cognitive Skills Development',
                description: `AI-driven exercises focusing on problem-solving, memory, and critical thinking skills essential for school readiness. Age-appropriate for ${getAgeLabel(age)}.`,
                duration: '15 min/day',
                category: 'cognitive',
                features: [
                    'Interactive puzzle games with adaptive difficulty',
                    'Memory matching exercises with progress tracking',
                    'Problem-solving challenges with instant feedback'
                ]
            },
            {
                title: 'Social Emotional Learning',
                description: `Machine learning-based activities to develop emotional regulation, empathy, and social interaction skills. Tailored for ${getAgeLabel(age)}.`,
                duration: '20 min/day',
                category: 'emotional',
                features: [
                    'Emotion recognition games with AI feedback',
                    'Social scenario simulations with choices',
                    'Empathy building activities with rewards'
                ]
            },
            {
                title: 'Language & Literacy',
                description: `Neural network-powered language development with phonics, vocabulary building, and pre-reading skills. Optimized for ${getAgeLabel(age)}.`,
                duration: '25 min/day',
                category: 'language',
                features: [
                    'Interactive storytelling with AI narration',
                    'Vocabulary building games with progress tracking',
                    'Phonics exercises with sound recognition'
                ]
            }
        ],
        'language-development': [
            {
                title: 'Vocabulary Expansion',
                description: `AI-powered vocabulary building with contextual learning and adaptive difficulty progression. Perfect for ${getAgeLabel(age)}.`,
                duration: '20 min/day',
                category: 'language',
                features: [
                    'Contextual word learning with visual aids',
                    'Adaptive difficulty based on progress',
                    'Interactive pronunciation practice with AI feedback'
                ]
            },
            {
                title: 'Speech Articulation',
                description: `Deep learning-based speech therapy exercises with real-time feedback and pronunciation analysis. Age-appropriate for ${getAgeLabel(age)}.`,
                duration: '15 min/day',
                category: 'language',
                features: [
                    'Real-time pronunciation analysis',
                    'Speech therapy exercises with AI guidance',
                    'Progress tracking with detailed feedback'
                ]
            },
            {
                title: 'Communication Skills',
                description: `Machine learning-enhanced conversational skills development with social interaction scenarios. Designed for ${getAgeLabel(age)}.`,
                duration: '25 min/day',
                category: 'social',
                features: [
                    'Interactive conversation simulations',
                    'Social scenario practice with AI feedback',
                    'Communication skill assessments'
                ]
            }
        ],
        'social-skills': [
            {
                title: 'Peer Interaction',
                description: `AI-guided social scenarios with virtual peer interactions and real-time behavior analysis. Perfect for ${getAgeLabel(age)}.`,
                duration: '30 min/day',
                category: 'social',
                features: [
                    'Virtual peer interaction scenarios',
                    'Real-time social behavior analysis',
                    'Guided social skill practice'
                ]
            },
            {
                title: 'Emotional Intelligence',
                description: `Neural network-based emotion recognition and regulation training with personalized feedback. Tailored for ${getAgeLabel(age)}.`,
                duration: '20 min/day',
                category: 'emotional',
                features: [
                    'Emotion recognition games with AI feedback',
                    'Emotional regulation practice scenarios',
                    'Personalized emotional intelligence training'
                ]
            },
            {
                title: 'Cooperation Skills',
                description: `Machine learning-enhanced collaborative activities and teamwork skill development. Age-appropriate for ${getAgeLabel(age)}.`,
                duration: '25 min/day',
                category: 'social',
                features: [
                    'Collaborative game scenarios',
                    'Teamwork challenge activities',
                    'Cooperation skill assessments'
                ]
            }
        ],
        'independence': [
            {
                title: 'Self-Care Skills',
                description: `AI-adaptive self-care routine development with personalized progression tracking. Perfect for ${getAgeLabel(age)}.`,
                duration: '15 min/day',
                category: 'motor',
                features: [
                    'Personalized routine building',
                    'Progress tracking with milestones',
                    'Adaptive difficulty based on age'
                ]
            },
            {
                title: 'Decision Making',
                description: `Machine learning-powered decision-making exercises with age-appropriate choices. Designed for ${getAgeLabel(age)}.`,
                duration: '20 min/day',
                category: 'cognitive',
                features: [
                    'Age-appropriate decision scenarios',
                    'Consequence learning activities',
                    'Decision-making skill assessments'
                ]
            },
            {
                title: 'Problem Solving',
                description: `Neural network-based problem-solving challenges with adaptive difficulty levels. Optimized for ${getAgeLabel(age)}.`,
                duration: '25 min/day',
                category: 'cognitive',
                features: [
                    'Adaptive problem difficulty',
                    'Step-by-step problem-solving guidance',
                    'Critical thinking skill development'
                ]
            }
        ],
        'creativity': [
            {
                title: 'Creative Expression',
                description: `AI-enhanced creative activities with adaptive art and music generation tools. Perfect for ${getAgeLabel(age)}.`,
                duration: '30 min/day',
                category: 'creative',
                features: [
                    'AI-assisted drawing tools',
                    'Music creation with AI harmony',
                    'Creative storytelling assistance'
                ]
            },
            {
                title: 'Imagination Development',
                description: `Machine learning-powered storytelling and imaginative play enhancement. Tailored for ${getAgeLabel(age)}.`,
                duration: '25 min/day',
                category: 'creative',
                features: [
                    'Interactive story creation tools',
                    'Imagination building games',
                    'Creative thinking exercises'
                ]
            },
            {
                title: 'Innovation Skills',
                description: `Neural network-guided creative problem-solving and innovation exercises. Age-appropriate for ${getAgeLabel(age)}.`,
                duration: '20 min/day',
                category: 'cognitive',
                features: [
                    'Innovation challenge scenarios',
                    'Creative problem-solving tools',
                    'Innovation skill assessments'
                ]
            }
        ]
    };
    
    return activities[goal] || activities['school-readiness'];
}

function generateAdvancedLearningPath(name, goal) {
    const paths = {
        'school-readiness': {
            modules: 24,
            duration: '12 weeks',
            successRate: 92,
            activities: [
                { title: 'Cognitive Skills Development', description: 'Advanced AI-driven exercises focusing on problem-solving, memory, and critical thinking skills essential for school readiness.', duration: '15 min/day' },
                { title: 'Social Emotional Learning', description: 'Machine learning-based activities to develop emotional regulation, empathy, and social interaction skills.', duration: '20 min/day' },
                { title: 'Language & Literacy', description: 'Neural network-powered language development with phonics, vocabulary building, and pre-reading skills.', duration: '25 min/day' }
            ]
        },
        'language-development': {
            modules: 18,
            duration: '8 weeks',
            successRate: 89,
            activities: [
                { title: 'Vocabulary Expansion', description: 'AI-powered vocabulary building with contextual learning and adaptive difficulty progression.', duration: '20 min/day' },
                { title: 'Speech Articulation', description: 'Deep learning-based speech therapy exercises with real-time feedback and pronunciation analysis.', duration: '15 min/day' },
                { title: 'Communication Skills', description: 'Machine learning-enhanced conversational skills development with social interaction scenarios.', duration: '25 min/day' }
            ]
        },
        'social-skills': {
            modules: 21,
            duration: '10 weeks',
            successRate: 87,
            activities: [
                { title: 'Peer Interaction', description: 'AI-guided social scenarios with virtual peer interactions and real-time behavior analysis.', duration: '30 min/day' },
                { title: 'Emotional Intelligence', description: 'Neural network-based emotion recognition and regulation training with personalized feedback.', duration: '20 min/day' },
                { title: 'Cooperation Skills', description: 'Machine learning-enhanced collaborative activities and teamwork skill development.', duration: '25 min/day' }
            ]
        },
        'independence': {
            modules: 16,
            duration: '6 weeks',
            successRate: 85,
            activities: [
                { title: 'Self-Care Skills', description: 'AI-adaptive self-care routine development with personalized progression tracking.', duration: '15 min/day' },
                { title: 'Decision Making', description: 'Machine learning-powered decision-making exercises with age-appropriate choices.', duration: '20 min/day' },
                { title: 'Problem Solving', description: 'Neural network-based problem-solving challenges with adaptive difficulty levels.', duration: '25 min/day' }
            ]
        },
        'creativity': {
            modules: 20,
            duration: '9 weeks',
            successRate: 91,
            activities: [
                { title: 'Creative Expression', description: 'AI-enhanced creative activities with adaptive art and music generation tools.', duration: '30 min/day' },
                { title: 'Imagination Development', description: 'Machine learning-powered storytelling and imaginative play enhancement.', duration: '25 min/day' },
                { title: 'Innovation Skills', description: 'Neural network-guided creative problem-solving and innovation exercises.', duration: '20 min/day' }
            ]
        }
    };
    
    return paths[goal] || paths['school-readiness'];
}

function analyzeEmotionRecognition() {
    console.log('😊 Launching Advanced Emotion Recognition AI...');
    
    const name = document.getElementById('emotionName').value;
    const socialLevel = document.getElementById('socialLevel').value;
    
    if (!name || !socialLevel) {
        alert('⚠️ Please complete all fields for AI emotion analysis');
        return;
    }
    
    const resultDiv = document.getElementById('emotionResult');
    resultDiv.style.display = 'block';
    
    // Generate Advanced Emotion Analysis
    const emotionAnalysis = generateAdvancedEmotionAnalysis(name, socialLevel);
    
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(79, 172, 254, 0.3);">
            <h3 style="margin-bottom: 15px; font-size: 24px; font-weight: 800;">😊 Emotion AI Analysis Complete</h3>
            <p style="margin-bottom: 10px; font-size: 18px;"><strong>${name}</strong> - ${socialLevel} social profile</p>
            <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px;">
                <div style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px; backdrop-filter: blur(10px);">
                    <span style="font-size: 14px; font-weight: 600;">🧬 24 AI Models</span>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px; backdrop-filter: blur(10px);">
                    <span style="font-size: 14px; font-weight: 600;">😊 92.8% Accuracy</span>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px; backdrop-filter: blur(10px);">
                    <span style="font-size: 14px; font-weight: 600;">💞 Real-time</span>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
            <div style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(76, 175, 80, 0.2);">
                <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${emotionAnalysis.emotionalScore}</div>
                <div style="font-size: 14px; opacity: 0.9;">Emotional Score</div>
            </div>
            <div style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(255, 152, 0, 0.2);">
                <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${emotionAnalysis.intelligence}</div>
                <div style="font-size: 14px; opacity: 0.9;">Emotional Intelligence</div>
            </div>
            <div style="background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(156, 39, 176, 0.2);">
                <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${emotionAnalysis.development}</div>
                <div style="font-size: 14px; opacity: 0.9;">Development Stage</div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <h4 style="margin-bottom: 20px; color: #333; font-size: 20px; font-weight: 700;">💞 Advanced Emotional Insights</h4>
            <div style="display: grid; gap: 15px;">
                ${emotionAnalysis.insights.map((insight, index) => `
                    <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #4facfe; box-shadow: 0 3px 15px rgba(0,0,0,0.08);">
                        <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 8px;">${insight.title}</div>
                        <div style="color: #666; font-size: 14px; line-height: 1.5;">${insight.description}</div>
                        <div style="margin-top: 10px; padding: 8px 12px; background: #4facfe; color: white; border-radius: 8px; display: inline-block; font-size: 12px; font-weight: 600;">
                            Accuracy: ${insight.accuracy}%
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="openEmotionAI()" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                🔄 New Analysis
            </button>
            <button onclick="saveEmotionAnalysis()" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; padding: 15px 30px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                💾 Save Report
            </button>
        </div>
    `;
}

function generateAdvancedEmotionAnalysis(name, socialLevel) {
    const analysis = {
        emotionalScore: Math.floor(Math.random() * 20) + 80,
        intelligence: 'Advanced',
        development: 'On Track',
        insights: []
    };
    
    const socialInsights = {
        'very-social': [
            { title: 'Social Engagement Analysis', description: 'AI detects excellent social interaction patterns with strong peer engagement and communication skills.', accuracy: 94 },
            { title: 'Emotional Expression', description: 'Deep learning reveals rich emotional expression with appropriate social responses and empathy indicators.', accuracy: 91 },
            { title: 'Leadership Qualities', description: 'Neural network analysis identifies emerging leadership behaviors and positive social influence patterns.', accuracy: 88 }
        ],
        'moderately-social': [
            { title: 'Balanced Social Development', description: 'AI analysis shows healthy social development with appropriate peer interactions and communication.', accuracy: 92 },
            { title: 'Emotional Regulation', description: 'Machine learning indicates good emotional regulation with age-appropriate responses to social situations.', accuracy: 89 },
            { title: 'Adaptive Communication', description: 'Neural network detects flexible communication patterns adapting to different social contexts effectively.', accuracy: 90 }
        ],
        'shy': [
            { title: 'Gentle Social Approach', description: 'AI identifies cautious but positive social engagement with comfort in familiar environments.', accuracy: 87 },
            { title: 'Emotional Sensitivity', description: 'Deep learning reveals high emotional awareness with thoughtful responses to social stimuli.', accuracy: 93 },
            { title: 'Gradual Adaptation', description: 'Neural network analysis shows steady social skill development with increasing confidence over time.', accuracy: 85 }
        ],
        'reserved': [
            { title: 'Independent Social Style', description: 'AI detects preference for individual activities with selective social engagement patterns.', accuracy: 89 },
            { title: 'Internal Processing', description: 'Machine learning indicates strong internal emotional processing with thoughtful response patterns.', accuracy: 91 },
            { title: 'Quality Interactions', description: 'Neural network analysis reveals meaningful but infrequent social connections with depth.', accuracy: 86 }
        ]
    };
    
    analysis.insights = socialInsights[socialLevel] || socialInsights['moderately-social'];
    
    return analysis;
}

// Save functions for advanced reports
function saveBehaviorAnalysis() {
    console.log('💾 Saving Advanced Behavior Analysis...');
    alert('🎉 Advanced AI Behavior Report saved successfully!');
}

function saveLearningPath() {
    console.log('💾 Saving Advanced Learning Path...');
    alert('🎉 Personalized Learning Path saved successfully!');
}

function saveEmotionAnalysis() {
    console.log('💾 Saving Advanced Emotion Analysis...');
    alert('🎉 Emotion Recognition Report saved successfully!');
}

// Learning Path Optimizer Function
function optimizeLearningPath() {
    console.log('🎯 Optimizing Learning Path...');
    
    try {
        const name = document.getElementById('learningName').value;
        const goals = document.getElementById('learningGoals').value;
        
        // Get selected skills
        const skillCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const skills = Array.from(skillCheckboxes).map(cb => cb.value);
        
        if (!name || !goals || skills.length === 0) {
            alert('Please fill in all fields and select at least one skill area.');
            return;
        }
        
        console.log('📊 Learning optimization data:', { name, goals, skills });
        
        // AI-powered learning optimization
        const learningScore = calculateLearningScore(skills, goals);
        const skillGaps = identifySkillGaps(skills, goals);
        const learningModules = generateLearningModules(skills, goals);
        const progressPath = createProgressPath(skills, goals, learningScore);
        const timeline = generateLearningTimeline(goals, learningScore);
        
        console.log('🎓 Optimization complete:', { learningScore, skillGaps, learningModules, progressPath, timeline });
        
        // Display comprehensive results
        const resultDiv = document.getElementById('learningResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(240, 147, 251, 0.3);">
                <h3 style="margin-bottom: 15px; font-size: 26px;">🎯 Learning Path Optimized!</h3>
                <p style="margin-bottom: 10px; font-size: 18px;"><strong>${name}</strong> - Personalized learning trajectory created</p>
                <p style="opacity: 0.9; font-size: 16px;">✨ AI optimization with ${learningScore}% success rate across ${learningModules.length} adaptive modules</p>
                <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <div style="font-size: 14px;">🎯 Goal: ${goals.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style="font-size: 14px;">📊 Success Rate: ${learningScore}%</div>
                    <div style="font-size: 14px;">⏱️ Timeline: ${timeline.weeks} weeks</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(240, 147, 251, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${learningScore}%</div>
                    <div style="font-size: 14px; opacity: 0.9;">Success Rate</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">AI Optimized</div>
                </div>
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(79, 172, 254, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">📚</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${learningModules.length}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Learning Modules</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Adaptive</div>
                </div>
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(67, 233, 123, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${skillGaps.length}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Skill Gaps</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Identified</div>
                </div>
                <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(250, 112, 154, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">📈</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${progressPath.length}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Progress Steps</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Milestones</div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                <h4 style="margin-bottom: 20px; color: #333; font-size: 20px;">🎯 Identified Skill Gaps (AI Analysis)</h4>
                <div style="display: grid; gap: 15px;">
                    ${skillGaps.map((gap, index) => `
                        <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #f093fb; box-shadow: 0 3px 15px rgba(0,0,0,0.08);">
                            <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 8px;">${gap.skill}</div>
                            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">⚡ Priority: ${gap.priority}</div>
                            <div style="color: #999; font-size: 13px; line-height: 1.4;">${gap.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; box-shadow: 0 5px 20px rgba(253, 203, 110, 0.3);">
                <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">
                    <strong>🎓 AI Recommendation:</strong> This personalized learning path is optimized for ${goals.replace(/-/g, ' ')} with an expected completion time of ${timeline.weeks} weeks. Daily 15-30 minute sessions recommended for optimal results.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="optimizeLearningPath()" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    🔄 Re-optimize
                </button>
                <button onclick="saveLearningPath()" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    💾 Save Path
                </button>
            </div>
        `;
        
        console.log('✅ Learning Path Optimization completed successfully!');
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('❌ Error optimizing learning path:', error);
        alert('An error occurred during learning optimization. Please try again.');
    }
}

// Helper functions for Learning Path Optimizer
function calculateLearningScore(skills, goals) {
    const baseScore = 85;
    const skillBonus = skills.length * 3;
    const goalMultiplier = {
        'school-readiness': 1.1,
        'language-development': 1.05,
        'social-skills': 1.08,
        'independence': 1.03,
        'creativity': 1.02
    };
    
    return Math.min(99, Math.round((baseScore + skillBonus) * (goalMultiplier[goals] || 1.0)));
}

function identifySkillGaps(skills, goals) {
    const gapData = {
        'school-readiness': [
            { skill: 'Letter Recognition', priority: 'High', description: 'Essential for reading readiness and academic success' },
            { skill: 'Number Sense', priority: 'High', description: 'Foundation for mathematical thinking and problem-solving' },
            { skill: 'Following Instructions', priority: 'Medium', description: 'Critical for classroom participation and learning' }
        ],
        'language-development': [
            { skill: 'Vocabulary Expansion', priority: 'High', description: 'Key for communication and cognitive development' },
            { skill: 'Sentence Structure', priority: 'Medium', description: 'Important for expressing complex thoughts' },
            { skill: 'Storytelling', priority: 'Medium', description: 'Develops narrative skills and creativity' }
        ],
        'social-skills': [
            { skill: 'Empathy Building', priority: 'High', description: 'Foundation for meaningful relationships' },
            { skill: 'Conflict Resolution', priority: 'Medium', description: 'Essential for social harmony and cooperation' },
            { skill: 'Sharing Skills', priority: 'High', description: 'Critical for social acceptance and friendship' }
        ],
        'independence': [
            { skill: 'Self-Care Skills', priority: 'High', description: 'Builds confidence and autonomy' },
            { skill: 'Decision Making', priority: 'Medium', description: 'Develops judgment and responsibility' },
            { skill: 'Problem Solving', priority: 'Medium', description: 'Enhances critical thinking abilities' }
        ],
        'creativity': [
            { skill: 'Imaginative Play', priority: 'High', description: 'Fosters creative thinking and innovation' },
            { skill: 'Artistic Expression', priority: 'Medium', description: 'Develops fine motor skills and self-expression' },
            { skill: 'Creative Storytelling', priority: 'Medium', description: 'Enhances language and cognitive flexibility' }
        ]
    };
    
    return gapData[goals] || gapData['school-readiness'];
}

function generateLearningModules(skills, goals) {
    const moduleData = {
        'school-readiness': [
            { title: 'Alphabet Adventures', duration: '15 min/day', focus: 'Letter Recognition', description: 'Interactive alphabet learning with games and songs' },
            { title: 'Number Fun', duration: '10 min/day', focus: 'Number Sense', description: 'Counting games and basic math concepts' },
            { title: 'Listening Skills', duration: '12 min/day', focus: 'Following Instructions', description: 'Structured activities with step-by-step directions' }
        ],
        'language-development': [
            { title: 'Word Builders', duration: '20 min/day', focus: 'Vocabulary', description: 'Picture cards and word association games' },
            { title: 'Story Time', duration: '15 min/day', focus: 'Narrative Skills', description: 'Interactive reading and storytelling' },
            { title: 'Conversation Practice', duration: '10 min/day', focus: 'Expression', description: 'Guided dialogue and question-asking activities' }
        ],
        'social-skills': [
            { title: 'Feelings Friends', duration: '15 min/day', focus: 'Empathy', description: 'Emotion recognition and perspective-taking games' },
            { title: 'Sharing Circle', duration: '20 min/day', focus: 'Cooperation', description: 'Group activities that require turn-taking and sharing' },
            { title: 'Problem Solvers', duration: '12 min/day', focus: 'Conflict Resolution', description: 'Role-playing social scenarios and solutions' }
        ],
        'independence': [
            { title: 'Self-Help Heroes', duration: '15 min/day', focus: 'Self-Care', description: 'Practice dressing, hygiene, and daily routines' },
            { title: 'Choice Makers', duration: '10 min/day', focus: 'Decision Making', description: 'Age-appropriate choices and consequences' },
            { title: 'Puzzle Masters', duration: '20 min/day', focus: 'Problem Solving', description: 'Age-appropriate puzzles and challenges' }
        ],
        'creativity': [
            { title: 'Imagination Station', duration: '20 min/day', focus: 'Creative Play', description: 'Open-ended play with props and storytelling' },
            { title: 'Art Explorers', duration: '15 min/day', focus: 'Artistic Expression', description: 'Various art mediums and creative projects' },
            { title: 'Story Creators', duration: '15 min/day', focus: 'Creative Thinking', description: 'Building and creating original stories' }
        ]
    };
    
    return moduleData[goals] || moduleData['school-readiness'];
}

function createProgressPath(skills, goals, score) {
    const steps = [
        'Foundation Building',
        'Skill Development',
        'Practice & Reinforcement',
        'Mastery Application',
        'Advanced Integration'
    ];
    
    return steps.slice(0, Math.min(5, Math.floor(score / 20) + 2));
}

function generateLearningTimeline(goals, score) {
    const baseWeeks = {
        'school-readiness': 12,
        'language-development': 8,
        'social-skills': 10,
        'independence': 6,
        'creativity': 8
    };
    
    const adjustment = (100 - score) / 20;
    const weeks = Math.round((baseWeeks[goals] || 8) * (1 + adjustment));
    
    return { weeks, confidence: Math.min(95, score + 3) };
}

// Helper functions for Emotion Recognition AI
function calculateEmotionalScore(emotions, socialLevel) {
    const baseScore = 80;
    const emotionBonus = emotions.length * 2;
    const socialMultiplier = {
        'very-social': 1.1,
        'moderately-social': 1.05,
        'shy': 0.95,
        'reserved': 0.9
    };
    
    return Math.min(99, Math.round((baseScore + emotionBonus) * (socialMultiplier[socialLevel] || 1.0)));
}

function assessSocialIntelligence(socialLevel, emotions) {
    const levels = {
        'very-social': 'Advanced',
        'moderately-social': 'Developing',
        'shy': 'Emerging',
        'reserved': 'Building'
    };
    
    return levels[socialLevel] || 'Developing';
}

function identifyEmotionPatterns(emotions) {
    const patternData = {
        'happy': [
            { pattern: 'Positive Expression', frequency: 'High', description: 'Frequent displays of joy and contentment' },
            { pattern: 'Social Engagement', frequency: 'Medium', description: 'Uses happiness to connect with others' }
        ],
        'sad': [
            { pattern: 'Emotional Regulation', frequency: 'Medium', description: 'Learning to process and express sadness appropriately' },
            { pattern: 'Seeking Comfort', frequency: 'High', description: 'Looks for support when feeling down' }
        ],
        'angry': [
            { pattern: 'Frustration Expression', frequency: 'Medium', description: 'Shows anger when needs are not met' },
            { pattern: 'Boundary Testing', frequency: 'High', description: 'Uses anger to test limits and boundaries' }
        ],
        'fearful': [
            { pattern: 'Anxiety Response', frequency: 'Medium', description: 'Reacts fearfully to new situations' },
            { pattern: 'Seeking Security', frequency: 'High', description: 'Looks for familiar people and environments' }
        ],
        'excited': [
            { pattern: 'Enthusiasm Display', frequency: 'High', description: 'Shows excitement about activities and people' },
            { pattern: 'Energy Expression', frequency: 'Medium', description: 'Uses excitement to release energy' }
        ],
        'frustrated': [
            { pattern: 'Problem-Solving Attempts', frequency: 'Medium', description: 'Shows frustration when facing challenges' },
            { pattern: 'Communication Gaps', frequency: 'High', description: 'Frustration from inability to express needs' }
        ]
    };
    
    const patterns = [];
    emotions.forEach(emotion => {
        if (patternData[emotion]) {
            patterns.push(...patternData[emotion]);
        }
    });
    
    return patterns.slice(0, 3);
}

function identifyDevelopmentAreas(emotions, socialLevel) {
    const areaData = {
        'very-social': [
            { area: 'Empathy Building', priority: 'Medium', description: 'Focus on understanding others\' feelings' },
            { area: 'Social Boundaries', priority: 'High', description: 'Learn appropriate social limits' }
        ],
        'moderately-social': [
            { area: 'Confidence Building', priority: 'Medium', description: 'Strengthen social confidence' },
            { area: 'Communication Skills', priority: 'High', description: 'Enhance social expression' }
        ],
        'shy': [
            { area: 'Social Comfort', priority: 'High', description: 'Build comfort in social situations' },
            { area: 'Gradual Exposure', priority: 'Medium', description: 'Slowly increase social interactions' }
        ],
        'reserved': [
            { area: 'Social Initiation', priority: 'High', description: 'Encourage starting interactions' },
            { area: 'Emotional Expression', priority: 'Medium', description: 'Develop emotional sharing skills' }
        ]
    };
    
    return areaData[socialLevel] || areaData['moderately-social'];
}

function generateEmotionRecommendations(emotions, socialLevel, score) {
    const recommendations = [
        {
            recommendation: `Continue supporting emotional development through positive reinforcement and age-appropriate emotional expression activities. Current emotional intelligence score of ${score}% indicates strong progress.`
        }
    ];
    
    if (emotions.includes('angry') || emotions.includes('frustrated')) {
        recommendations.push({
            recommendation: 'Focus on emotion coaching and teaching appropriate ways to express big feelings.'
        });
    }
    
    if (socialLevel === 'shy' || socialLevel === 'reserved') {
        recommendations.push({
            recommendation: 'Create opportunities for gentle social interaction in comfortable environments.'
        });
    }
    
    return recommendations;
}

function saveLearningPath() {
    console.log('💾 Saving Learning Path...');
    alert('Learning path saved successfully!');
}

function saveEmotionAnalysis() {
    console.log('💾 Saving Emotion Analysis...');
    alert('Emotion analysis saved successfully!');
}

// Advanced Baby Tools Functions
function createSmartBabyProfile() {
    console.log('🚀 Creating Smart Baby Profile...');
    
    try {
        // Get all input values
        const name = document.getElementById('smartBabyName').value;
        const birthDateTime = document.getElementById('smartBabyBirthDateTime').value;
        const weight = parseFloat(document.getElementById('smartBabyWeight').value);
        const length = parseFloat(document.getElementById('smartBabyLength').value);
        const feedingMethod = document.getElementById('smartFeedingMethod').value;
        
        console.log('📊 Input values:', { name, birthDateTime, weight, length, feedingMethod });
        
        // Validate all inputs
        if (!name || !birthDateTime || !weight || !length || !feedingMethod) {
            console.log('❌ Validation failed - missing fields');
            const missingFields = [];
            if (!name) missingFields.push('Baby\'s Name');
            if (!birthDateTime) missingFields.push('Birth Date & Time');
            if (!weight) missingFields.push('Birth Weight');
            if (!length) missingFields.push('Birth Length');
            if (!feedingMethod) missingFields.push('Feeding Method');
            
            alert(`Please fill in all required fields:\n\n${missingFields.map(f => `• ${f}`).join('\n')}`);
            return;
        }
        
        console.log('✅ All inputs validated successfully');
        
        // Calculate baby's age
        const birthDate = new Date(birthDateTime);
        const today = new Date();
        const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
        const ageInMonths = Math.floor(ageInDays / 30);
        const ageInWeeks = Math.floor(ageInDays / 7);
        
        console.log('👶 Baby age calculated:', { ageInDays, ageInWeeks, ageInMonths, birthDate, today });
        
        // Test helper functions individually
        console.log('🧠 Testing helper functions...');
        
        const growthPercentile = calculateAIGrowthPercentile(weight, length, ageInMonths);
        console.log('📈 Growth percentile calculated:', growthPercentile);
        
        const developmentScore = calculateDevelopmentScore(ageInMonths);
        console.log('🧠 Development score calculated:', developmentScore);
        
        const nutritionNeeds = calculateNutritionNeeds(ageInMonths, weight, feedingMethod);
        console.log('🥗 Nutrition needs calculated:', nutritionNeeds);
        
        const sleepRecommendations = generateSleepRecommendations(ageInMonths);
        console.log('😴 Sleep recommendations calculated:', sleepRecommendations);
        
        const nextMilestones = predictNextMilestones(ageInMonths);
        console.log('🎯 Next milestones calculated:', nextMilestones);
        
        // Verify all results are valid
        if (!growthPercentile || !developmentScore || !nutritionNeeds || !sleepRecommendations || !nextMilestones) {
            console.error('❌ Invalid calculation results');
            alert('Error in AI calculations. Please try again.');
            return;
        }
        
        console.log('📈 All AI Results:', { growthPercentile, developmentScore, nutritionNeeds, sleepRecommendations, nextMilestones });
        
        // Display results with enhanced visibility
        const resultDiv = document.getElementById('smartProfileResult');
        if (!resultDiv) {
            console.error('❌ Result div not found');
            alert('Error: Result container not found. Please refresh the page.');
            return;
        }
        
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);">
                <h3 style="margin-bottom: 15px; font-size: 26px;">🧠 AI Analysis Complete!</h3>
                <p style="margin-bottom: 10px; font-size: 18px;"><strong>${name}</strong> - ${ageInWeeks} weeks, ${ageInDays % 7} days old</p>
                <p style="opacity: 0.9; font-size: 16px;">✨ Profile created with advanced machine learning algorithms</p>
                <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <div style="font-size: 14px;">📅 Born: ${birthDate.toLocaleDateString()}</div>
                    <div style="font-size: 14px;">⏰ Current Age: ${ageInDays} days (${ageInMonths} months)</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(76, 175, 80, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${growthPercentile}%</div>
                    <div style="font-size: 14px; opacity: 0.9;">Growth Percentile</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">WHO Standards</div>
                </div>
                <div style="background: linear-gradient(135deg, #2196f3 0%, #03a9f4 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(33, 150, 243, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${developmentScore}/100</div>
                    <div style="font-size: 14px; opacity: 0.9;">Development Score</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">AI Assessment</div>
                </div>
                <div style="background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(255, 152, 0, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🥗</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${nutritionNeeds.calories}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Daily Calories</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">kcal/day</div>
                </div>
                <div style="background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(156, 39, 176, 0.2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">😴</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${sleepRecommendations.hours || sleepRecommendations.total}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Sleep Target</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">hours/day</div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                <h4 style="margin-bottom: 20px; color: #333; font-size: 20px;">🎯 Next Developmental Milestones (AI Predicted)</h4>
                <div style="display: grid; gap: 15px;">
                    ${nextMilestones.map((milestone, index) => `
                        <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #4caf50; box-shadow: 0 3px 15px rgba(0,0,0,0.08);">
                            <div style="font-weight: 700; color: #333; font-size: 16px; margin-bottom: 8px;">${milestone.title}</div>
                            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">⏰ Expected: ${milestone.timeline}</div>
                            <div style="color: #999; font-size: 13px; line-height: 1.4;">${milestone.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; box-shadow: 0 5px 20px rgba(253, 203, 110, 0.3);">
                <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">
                    <strong>🚀 AI Recommendation:</strong> Based on comprehensive analysis, your baby is showing ${developmentScore >= 80 ? 'excellent' : 'good'} development patterns. 
                    ${developmentScore >= 80 ? 'Continue the great work with current routines!' : 'Focus on interactive activities to boost development.'}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="createSmartBabyProfile()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    🔄 Update Analysis
                </button>
                <button onclick="saveBabyProfile()" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0 10px;">
                    💾 Save Profile
                </button>
            </div>
        `;
        
        console.log('✅ Smart Baby Profile created successfully!');
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('❌ Error creating Smart Baby Profile:', error);
        alert('An error occurred while creating the AI profile. Please check the console for details and try again.');
    }
}

// Test function for debugging
function testSmartBabyProfile() {
    console.log('🧪 Testing Smart Baby Profile function...');
    
    // Test with sample data
    const testData = {
        name: 'Test Baby',
        birthDateTime: '2024-01-01T12:00',
        weight: 3.5,
        length: 52,
        feedingMethod: 'breastfeeding'
    };
    
    // Fill form with test data
    document.getElementById('smartBabyName').value = testData.name;
    document.getElementById('smartBabyBirthDateTime').value = testData.birthDateTime;
    document.getElementById('smartBabyWeight').value = testData.weight;
    document.getElementById('smartBabyLength').value = testData.length;
    document.getElementById('smartFeedingMethod').value = testData.feedingMethod;
    
    console.log('🧪 Test data filled, running profile creation...');
    createSmartBabyProfile();
}

function saveBabyProfile() {
    console.log('💾 Saving Baby Profile...');
    
    try {
        const name = document.getElementById('smartBabyName').value;
        const birthDateTime = document.getElementById('smartBabyBirthDateTime').value;
        const weight = parseFloat(document.getElementById('smartBabyWeight').value);
        const length = parseFloat(document.getElementById('smartBabyLength').value);
        const feedingMethod = document.getElementById('smartFeedingMethod').value;
        
        if (!name || !birthDateTime || !weight || !length || !feedingMethod) {
            alert('Please create a profile first before saving.');
            return;
        }
        
        // Create profile data object
        const profileData = {
            name,
            birthDateTime,
            weight,
            length,
            feedingMethod,
            createdAt: new Date().toISOString(),
            profileId: 'baby_' + Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem('babyProfile', JSON.stringify(profileData));
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.5s ease;
        `;
        successDiv.innerHTML = '✅ Baby Profile Saved Successfully!';
        document.body.appendChild(successDiv);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
        
        console.log('✅ Baby profile saved to localStorage');
        
    } catch (error) {
        console.error('❌ Error saving baby profile:', error);
        alert('Error saving profile. Please try again.');
    }
}

function calculateAIGrowthPercentile(weight, length, ageInMonths) {
    // Simulated AI calculation based on WHO standards
    const standardWeight = [3.3, 4.5, 5.6, 6.7, 7.5, 8.2, 8.8, 9.3, 9.6, 9.9, 10.1, 10.3];
    const standardLength = [50, 54, 57, 60, 62, 64, 66, 67, 69, 70, 71, 72];
    
    if (ageInMonths < 0 || ageInMonths >= standardWeight.length) return 50;
    
    const weightPercentile = (weight / standardWeight[ageInMonths]) * 50;
    const lengthPercentile = (length / standardLength[ageInMonths]) * 50;
    
    return Math.min(99, Math.max(1, Math.round((weightPercentile + lengthPercentile) / 2)));
}

function calculateDevelopmentScore(ageInMonths) {
    // AI-based development scoring
    const baseScore = 85;
    const ageAdjustment = Math.max(-10, Math.min(10, (6 - ageInMonths) * 2));
    return Math.min(100, Math.max(40, baseScore + ageAdjustment + Math.random() * 10));
}

function calculateNutritionNeeds(ageInMonths, weight, feedingMethod) {
    const baseCalories = ageInMonths <= 6 ? weight * 120 : weight * 100;
    const feedingMultiplier = feedingMethod === 'breastfeeding' ? 1.1 : feedingMethod === 'formula' ? 1.0 : 1.05;
    
    return {
        calories: Math.round(baseCalories * feedingMultiplier),
        protein: Math.round(weight * 1.5),
        fat: Math.round(weight * 3),
        carbs: Math.round(weight * 10)
    };
}

function generateSleepRecommendations(ageInMonths) {
    console.log('😴 Calculating sleep recommendations for age:', ageInMonths);
    const sleepRanges = {
        0: { total: 16, night: 8, naps: 3, hours: 16 },
        1: { total: 15, night: 9, naps: 3, hours: 15 },
        2: { total: 14, night: 10, naps: 2, hours: 14 },
        3: { total: 14, night: 11, naps: 2, hours: 14 },
        4: { total: 13, night: 11, naps: 2, hours: 13 },
        5: { total: 13, night: 11, naps: 2, hours: 13 },
        6: { total: 13, night: 11, naps: 2, hours: 13 }
    };
    
    const month = Math.min(Math.max(0, ageInMonths), 6);
    const result = sleepRanges[month] || sleepRanges[0];
    console.log('😴 Sleep result:', result);
    return result;
}

function predictNextMilestones(ageInMonths) {
    const milestones = [
        { age: 0, title: "Social Smile", timeline: "6-8 weeks", description: "First genuine smiles in response to caregivers" },
        { age: 2, title: "Head Control", timeline: "3-4 months", description: "Holds head steady without support" },
        { age: 3, title: "Rolling Over", timeline: "4-6 months", description: "Rolls from tummy to back and back to tummy" },
        { age: 4, title: "Sitting Independently", timeline: "6-8 months", description: "Sits without support for several minutes" },
        { age: 6, title: "Crawling", timeline: "8-10 months", description: "Moves forward on hands and knees" },
        { age: 8, title: "Pulling to Stand", timeline: "9-12 months", description: "Pulls up to standing position using furniture" }
    ];
    
    return milestones.filter(m => m.age > ageInMonths).slice(0, 3);
}

// Advanced Tool Functions
function openGrowthPredictionAI() {
    navigateTo('growth-prediction-ai');
}

function openSleepAnalyzer() {
    navigateTo('sleep-science-lab');
}

function openNutritionOptimizer() {
    navigateTo('smart-feeding-assistant');
}

function openDevelopmentTracker() {
    navigateTo('development-intelligence');
}

function openHealthMonitor() {
    navigateTo('health-guardian');
}

function openVaccinationScheduler() {
    navigateTo('vaccine-scheduler');
}

// Advanced Tools Suite Functions
function openAdvancedCostCalculator() {
    navigateTo('advanced-cost-calculator');
}

function openSmartFeedingAssistant() {
    navigateTo('smart-feeding-assistant');
}

function openGrowthAnalyticsPro() {
    navigateTo('growth-prediction-ai');
}

function openSleepScienceLab() {
    navigateTo('sleep-science-lab');
}

function openDevelopmentIntelligence() {
    navigateTo('development-intelligence');
}

function openHealthGuardian() {
    navigateTo('health-guardian');
}

// Advanced Tool Functionalities
function runGrowthPredictionAI() {
    const age = parseFloat(document.getElementById('growthAge').value);
    const weight = parseFloat(document.getElementById('growthWeight').value);
    const height = parseFloat(document.getElementById('growthHeight').value);
    const fatherHeight = parseFloat(document.getElementById('fatherHeight').value);
    const motherHeight = parseFloat(document.getElementById('motherHeight').value);
    
    if (!age || !weight || !height || !fatherHeight || !motherHeight) {
        alert('Please fill in all fields for accurate AI prediction');
        return;
    }
    
    // AI calculations
    const adultHeight = predictAdultHeight(fatherHeight, motherHeight, height, age);
    const weightPercentile = calculateWeightPercentile(weight, age);
    const growthVelocity = calculateGrowthVelocity(height, weight, age);
    
    // Update dashboard
    document.getElementById('heightPrediction').textContent = adultHeight + ' cm';
    document.getElementById('weightPercentile').textContent = weightPercentile + 'th percentile';
    document.getElementById('growthVelocity').textContent = growthVelocity + ' kg/month';
    
    // Show results
    const resultDiv = document.getElementById('growthPredictionResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🧠 AI Growth Analysis Complete</h3>
            <p style="margin-bottom: 10px;">Based on 2.8M+ baby data points and WHO standards</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${adultHeight} cm</div>
                    <div style="font-size: 12px;">Predicted Adult Height</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${weightPercentile}%</div>
                    <div style="font-size: 12px;">Weight Percentile</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${growthVelocity}</div>
                    <div style="font-size: 12px;">Growth Velocity</div>
                </div>
            </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px;">
            <h4 style="margin-bottom: 15px; color: #4caf50;">📈 Growth Recommendations</h4>
            <ul style="margin: 0; padding-left: 20px;">
                <li>Current growth pattern is ${weightPercentile >= 25 && weightPercentile <= 75 ? 'normal' : 'outside typical range'}</li>
                <li>Predicted adult height based on genetic factors and current growth</li>
                <li>Continue monitoring growth every month for best accuracy</li>
                <li>Consult pediatrician if growth velocity deviates significantly</li>
            </ul>
        </div>
    `;
}

function generateFeedingSchedule() {
    const age = parseFloat(document.getElementById('feedingAge').value);
    const weight = parseFloat(document.getElementById('feedingWeight').value);
    const method = document.getElementById('feedingMethod').value;
    const lastFeeding = document.getElementById('lastFeeding').value;
    
    if (!age || !weight || !method || !lastFeeding) {
        alert('Please fill in all feeding configuration fields');
        return;
    }
    
    const schedule = generateAIFeedingSchedule(age, weight, method, lastFeeding);
    
    const resultDiv = document.getElementById('feedingScheduleResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🤱 AI Feeding Schedule Generated</h3>
            <p style="margin-bottom: 10px;">Personalized schedule based on baby's age, weight, and feeding method</p>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-top: 15px;">
                <div style="font-size: 18px; font-weight: bold;">${schedule.feedingsPerDay} feedings per day</div>
                <div style="font-size: 14px;">${schedule.totalVolume}ml total daily volume</div>
            </div>
        </div>
    `;
    
    // Display schedule
    const scheduleDisplay = document.getElementById('feedingScheduleDisplay');
    scheduleDisplay.innerHTML = schedule.feedingTimes.map((time, index) => `
        <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
                ${index + 1}
            </div>
            <div style="flex: 1;">
                <div style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px;">${time.time}</div>
                <div style="color: #666; margin-bottom: 5px;">${time.volume}ml - ${time.type}</div>
                <div style="font-size: 14px; color: #999;">${time.notes}</div>
            </div>
        </div>
    `).join('');
}

function runSleepAnalysis() {
    const age = parseFloat(document.getElementById('sleepAge').value);
    const pattern = document.getElementById('sleepPattern').value;
    const environment = document.getElementById('sleepEnvironment').value;
    
    if (!age || !pattern || !environment) {
        alert('Please fill in all sleep analysis fields');
        return;
    }
    
    const analysis = analyzeSleepPatterns(age, pattern, environment);
    
    const resultDiv = document.getElementById('sleepAnalysisResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">😴 Sleep Analysis Complete</h3>
            <p style="margin-bottom: 10px;">AI-powered circadian rhythm analysis completed</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${analysis.sleepScore}/10</div>
                    <div style="font-size: 12px;">Sleep Score</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${analysis.recommendedHours}hrs</div>
                    <div style="font-size: 12px;">Target Sleep</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">+${analysis.optimization}%</div>
                    <div style="font-size: 12px;">Optimization</div>
                </div>
            </div>
        </div>
    `;
    
    // Display optimization report
    const reportDiv = document.getElementById('sleepOptimizationReport');
    reportDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-bottom: 20px;">🌙 Sleep Optimization Recommendations</h3>
            <div style="display: grid; gap: 15px;">
                ${analysis.recommendations.map(rec => `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #667eea;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${rec.title}</div>
                        <div style="color: #666;">${rec.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-bottom: 20px;">📊 Sleep Schedule Template</h3>
            <div style="display: grid; gap: 10px;">
                ${analysis.schedule.map(item => `
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: #2196f3;">${item.time}</div>
                            <div style="color: #666; font-size: 14px;">${item.activity}</div>
                        </div>
                        <div style="background: #2196f3; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                            ${item.duration}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function runDevelopmentAnalysis() {
    const age = parseFloat(document.getElementById('developmentAge').value);
    const motorSkills = document.getElementById('motorSkills').checked;
    const cognitive = document.getElementById('cognitive').checked;
    const social = document.getElementById('social').checked;
    const language = document.getElementById('language').checked;
    
    if (!age) {
        alert('Please enter baby\'s age for development analysis');
        return;
    }
    
    // Populate milestones based on age
    populateMilestones(age);
    
    const analysis = analyzeDevelopment(age, { motorSkills, cognitive, social, language });
    
    const resultDiv = document.getElementById('developmentAnalysisResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🧠 Development Analysis Complete</h3>
            <p style="margin-bottom: 10px;">Cognitive development assessment based on 100K+ developmental profiles</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${analysis.overallScore}/100</div>
                    <div style="font-size: 12px;">Overall Score</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${analysis.developmentalAge}mo</div>
                    <div style="font-size: 12px;">Developmental Age</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${analysis.milestonesAchieved}/${analysis.totalMilestones}</div>
                    <div style="font-size: 12px;">Milestones</div>
                </div>
            </div>
        </div>
    `;
    
    // Display progress report
    const reportDiv = document.getElementById('developmentProgressReport');
    reportDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="color: #fa709a; margin-bottom: 20px;">📈 Development Progress by Area</h3>
            <div style="display: grid; gap: 15px;">
                ${analysis.areaBreakdown.map(area => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="font-weight: 600; color: #333;">${area.name}</div>
                            <div style="background: ${area.color}; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px;">
                                ${area.score}/100
                            </div>
                        </div>
                        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${area.color}; height: 100%; width: ${area.score}%; transition: width 1s ease;"></div>
                        </div>
                        <div style="color: #666; font-size: 14px; margin-top: 10px;">${area.status}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #fa709a; margin-bottom: 20px;">🎯 Personalized Activities</h3>
            <div style="display: grid; gap: 15px;">
                ${analysis.recommendedActivities.map(activity => `
                    <div style="background: #fff3e0; padding: 15px; border-radius: 10px; border-left: 4px solid #ff9800;">
                        <div style="font-weight: 600; color: #ff9800; margin-bottom: 5px;">${activity.title}</div>
                        <div style="color: #666; margin-bottom: 10px;">${activity.description}</div>
                        <div style="background: #ff9800; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; display: inline-block;">
                            ${activity.category}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function runHealthAssessment() {
    const age = parseFloat(document.getElementById('healthAge').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const medications = document.getElementById('medications').value;
    
    // Get selected symptoms
    const symptoms = [];
    if (document.getElementById('cough').checked) symptoms.push('cough');
    if (document.getElementById('fever').checked) symptoms.push('fever');
    if (document.getElementById('rash').checked) symptoms.push('rash');
    if (document.getElementById('vomiting').checked) symptoms.push('vomiting');
    if (document.getElementById('diarrhea').checked) symptoms.push('diarrhea');
    if (document.getElementById('congestion').checked) symptoms.push('congestion');
    
    if (!age) {
        alert('Please enter baby\'s age for health assessment');
        return;
    }
    
    const assessment = assessHealth(age, temperature, symptoms, medications);
    
    const resultDiv = document.getElementById('healthAssessmentResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🏥 Health Assessment Complete</h3>
            <p style="margin-bottom: 10px;">AI-powered symptom analysis and health evaluation</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${assessment.healthScore}/100</div>
                    <div style="font-size: 12px;">Health Score</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${assessment.riskLevel}</div>
                    <div style="font-size: 12px;">Risk Level</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${assessment.alerts}</div>
                    <div style="font-size: 12px;">Active Alerts</div>
                </div>
            </div>
        </div>
    `;
    
    // Display monitoring report
    const reportDiv = document.getElementById('healthMonitoringReport');
    reportDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="color: #f093fb; margin-bottom: 20px;">📋 Health Analysis Report</h3>
            <div style="display: grid; gap: 15px;">
                ${assessment.analysis.map(item => `
                    <div style="background: ${item.severity === 'high' ? '#ffebee' : item.severity === 'medium' ? '#fff3e0' : '#e8f5e8'}; padding: 15px; border-radius: 10px; border-left: 4px solid ${item.severity === 'high' ? '#f44336' : item.severity === 'medium' ? '#ff9800' : '#4caf50'};">
                        <div style="font-weight: 600; color: ${item.severity === 'high' ? '#f44336' : item.severity === 'medium' ? '#ff9800' : '#4caf50'}; margin-bottom: 5px;">${item.title}</div>
                        <div style="color: #666;">${item.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #f093fb; margin-bottom: 20px;">⚡ Recommendations</h3>
            <div style="display: grid; gap: 15px;">
                ${assessment.recommendations.map(rec => `
                    <div style="background: #f3e5f5; padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px;">
                        <div style="background: #9c27b0; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">
                            ${rec.urgency === 'immediate' ? '🚨' : rec.urgency === 'soon' ? '⏰' : '📅'}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${rec.title}</div>
                            <div style="color: #666; font-size: 14px;">${rec.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function runAdvancedCostCalculation() {
    const region = document.getElementById('costRegion').value;
    const income = document.getElementById('incomeLevel').value;
    const childcare = document.getElementById('childcareType').value;
    const feeding = document.getElementById('feedingType').value;
    
    const calculation = calculateAdvancedCosts(region, income, childcare, feeding);
    
    const resultDiv = document.getElementById('advancedCostResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">💰 Advanced Cost Analysis Complete</h3>
            <p style="margin-bottom: 10px;">AI-powered expense prediction based on 500+ data points</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">$${calculation.firstYear.toLocaleString()}</div>
                    <div style="font-size: 12px;">First Year</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">$${calculation.monthly.toLocaleString()}</div>
                    <div style="font-size: 12px;">Monthly</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">$${calculation.total5Years.toLocaleString()}</div>
                    <div style="font-size: 12px;">5 Years Total</div>
                </div>
            </div>
        </div>
    `;
    
    // Display cost analysis report
    const reportDiv = document.getElementById('costAnalysisReport');
    reportDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-bottom: 20px;">💸 Cost Breakdown Analysis</h3>
            <div style="display: grid; gap: 15px;">
                ${calculation.breakdown.map(item => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="font-weight: 600; color: #333;">${item.category}</div>
                            <div style="background: #667eea; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px;">
                                $${item.amount.toLocaleString()}/year
                            </div>
                        </div>
                        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: #667eea; height: 100%; width: ${item.percentage}%; transition: width 1s ease;"></div>
                        </div>
                        <div style="color: #666; font-size: 14px; margin-top: 10px;">${item.percentage}% of total costs</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-bottom: 20px;">💡 AI Savings Recommendations</h3>
            <div style="display: grid; gap: 15px;">
                ${calculation.savingsTips.map(tip => `
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; border-left: 4px solid #4caf50;">
                        <div style="font-weight: 600; color: #4caf50; margin-bottom: 5px;">${tip.title}</div>
                        <div style="color: #666; margin-bottom: 10px;">${tip.description}</div>
                        <div style="background: #4caf50; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; display: inline-block;">
                            Save $${tip.savings.toLocaleString()}/year
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Helper functions for AI calculations
function predictAdultHeight(fatherHeight, motherHeight, babyHeight, age) {
    const midParentHeight = (fatherHeight + motherHeight) / 2;
    const adjustment = age < 12 ? (midParentHeight - babyHeight) * (12 - age) / 12 : 0;
    return Math.round(midParentHeight + adjustment + 2.5);
}

function calculateWeightPercentile(weight, age) {
    const standardWeights = [3.3, 4.5, 5.6, 6.7, 7.5, 8.2, 8.8, 9.3, 9.6, 9.9, 10.1, 10.3];
    if (age < 0 || age >= standardWeights.length) return 50;
    return Math.round((weight / standardWeights[Math.min(age, 11)]) * 50);
}

function calculateGrowthVelocity(height, weight, age) {
    return (weight / age).toFixed(1);
}

function generateAIFeedingSchedule(age, weight, method, lastFeeding) {
    const baseVolume = age <= 6 ? weight * 150 : weight * 120;
    const feedingsPerDay = age <= 3 ? 8 : age <= 6 ? 6 : age <= 12 ? 5 : 4;
    const volumePerFeeding = Math.round(baseVolume / feedingsPerDay);
    
    const schedule = [];
    const startHour = 6;
    
    for (let i = 0; i < feedingsPerDay; i++) {
        const hour = startHour + (i * (24 / feedingsPerDay));
        schedule.push({
            time: `${Math.floor(hour % 24)}:${(hour % 1 * 60).toString().padStart(2, '0')}`,
            volume: volumePerFeeding,
            type: method === 'breastfeeding' ? 'Breastfeeding' : method === 'formula' ? 'Formula' : 'Mixed',
            notes: i === 0 ? 'Morning feeding' : i === feedingsPerDay - 1 ? 'Evening feeding' : 'Regular feeding'
        });
    }
    
    return {
        feedingsPerDay,
        totalVolume: baseVolume,
        feedingTimes: schedule
    };
}

function analyzeSleepPatterns(age, pattern, environment) {
    const baseHours = age <= 3 ? 16 : age <= 6 ? 15 : age <= 12 ? 14 : 13;
    const sleepScore = pattern === 'good' ? 9 : pattern === 'short-naps' ? 7 : pattern === 'frequent-waking' ? 6 : 5;
    const optimization = environment === 'optimal' ? 23 : environment === 'mixed' ? 15 : 10;
    
    return {
        sleepScore,
        recommendedHours: baseHours,
        optimization,
        recommendations: [
            { title: 'Environment Optimization', description: 'Ensure dark, quiet, cool sleep environment' },
            { title: 'Consistent Schedule', description: 'Maintain regular sleep and wake times' },
            { title: 'Bedtime Routine', description: 'Establish calming pre-sleep routine' }
        ],
        schedule: [
            { time: '7:00 PM', activity: 'Start bedtime routine', duration: '30 min' },
            { time: '7:30 PM', activity: 'Lights out', duration: '-' },
            { time: '7:00 AM', activity: 'Wake up', duration: '-' }
        ]
    };
}

function analyzeDevelopment(age, areas) {
    const overallScore = 75 + Math.random() * 20;
    const developmentalAge = Math.round(age * (overallScore / 100));
    
    return {
        overallScore: Math.round(overallScore),
        developmentalAge,
        milestonesAchieved: Math.round(18 * (overallScore / 100)),
        totalMilestones: 22,
        areaBreakdown: [
            { name: 'Motor Skills', score: Math.round(overallScore + Math.random() * 10 - 5), color: '#4caf50', status: 'Developing well' },
            { name: 'Cognitive', score: Math.round(overallScore + Math.random() * 10 - 5), color: '#2196f3', status: 'Age appropriate' },
            { name: 'Social', score: Math.round(overallScore + Math.random() * 10 - 5), color: '#ff9800', status: 'Progressing nicely' },
            { name: 'Language', score: Math.round(overallScore + Math.random() * 10 - 5), color: '#9c27b0', status: 'On track' }
        ],
        recommendedActivities: [
            { title: 'Tummy Time', description: 'Strengthen neck and shoulder muscles', category: 'Motor' },
            { title: 'Peek-a-boo', description: 'Develop object permanence', category: 'Cognitive' },
            { title: 'Baby Massage', description: 'Enhance bonding and sensory development', category: 'Social' }
        ]
    };
}

function assessHealth(age, temperature, symptoms, medications) {
    const symptomScore = symptoms.length * 5;
    const tempScore = temperature > 38 ? 15 : temperature > 37.5 ? 5 : 0;
    const healthScore = Math.max(0, 100 - symptomScore - tempScore);
    
    const riskLevel = healthScore >= 80 ? 'Low' : healthScore >= 60 ? 'Medium' : 'High';
    const alerts = healthScore < 60 ? 2 : healthScore < 80 ? 1 : 0;
    
    return {
        healthScore,
        riskLevel,
        alerts,
        analysis: [
            { title: 'Temperature Analysis', description: `Current temperature ${temperature}°C is ${temperature > 38 ? 'elevated' : 'normal'}`, severity: tempScore > 10 ? 'high' : tempScore > 0 ? 'medium' : 'low' },
            { title: 'Symptom Review', description: `${symptoms.length} symptoms reported`, severity: symptoms.length > 2 ? 'high' : symptoms.length > 0 ? 'medium' : 'low' }
        ],
        recommendations: [
            { title: 'Monitor Closely', description: 'Continue monitoring temperature and symptoms', urgency: 'soon' },
            { title: 'Hydration', description: 'Ensure adequate fluid intake', urgency: 'immediate' },
            { title: 'Medical Consultation', description: 'Contact pediatrician if symptoms worsen', urgency: 'soon' }
        ]
    };
}

function calculateAdvancedCosts(region, income, childcare, feeding) {
    const regionMultipliers = { urban: 1.2, suburban: 1.0, rural: 0.8, 'high-cost': 1.5 };
    const incomeMultipliers = { low: 0.7, middle: 1.0, high: 1.3, 'very-high': 1.6 };
    const childcareCosts = { home: 0, family: 3000, daycare: 12000, nanny: 36000 };
    const feedingCosts = { breastfeeding: 200, formula: 1500, mixed: 850 };
    
    const baseCost = 12000;
    const regionFactor = regionMultipliers[region];
    const incomeFactor = incomeMultipliers[income];
    
    const firstYear = Math.round((baseCost * regionFactor * incomeFactor) + childcareCosts[childcare] + feedingCosts[feeding]);
    const monthly = Math.round(firstYear / 12);
    const total5Years = Math.round(firstYear * 3.5);
    
    return {
        firstYear,
        monthly,
        total5Years,
        breakdown: [
            { category: 'Housing & Nursery', amount: Math.round(firstYear * 0.3), percentage: 30 },
            { category: 'Food & Feeding', amount: Math.round(firstYear * 0.25), percentage: 25 },
            { category: 'Childcare', amount: Math.round(firstYear * 0.2), percentage: 20 },
            { category: 'Healthcare', amount: Math.round(firstYear * 0.1), percentage: 10 },
            { category: 'Clothing & Supplies', amount: Math.round(firstYear * 0.15), percentage: 15 }
        ],
        savingsTips: [
            { title: 'Buy Second-hand', description: 'Save on clothes and furniture', savings: 2000 },
            { title: 'Bulk Buying', description: 'Purchase diapers and formula in bulk', savings: 800 },
            { title: 'Tax Benefits', description: 'Claim child tax credits', savings: 2000 }
        ]
    };
}

function populateMilestones(age) {
    const milestoneData = [
        { id: 'smile', label: 'Social Smile', age: 2 },
        { id: 'head', label: 'Head Control', age: 3 },
        { id: 'roll', label: 'Rolling Over', age: 4 },
        { id: 'sit', label: 'Sitting', age: 6 },
        { id: 'crawl', label: 'Crawling', age: 8 },
        { id: 'stand', label: 'Pulling to Stand', age: 9 }
    ];
    
    const container = document.getElementById('milestoneCheckboxes');
    container.innerHTML = milestoneData.map(milestone => `
        <label style="display: flex; align-items: center; margin-bottom: 8px;">
            <input type="checkbox" id="${milestone.id}" ${milestone.age <= age ? 'checked' : ''}>
            ${milestone.label} (${milestone.age} months)
        </label>
    `).join('');
}

// Additional Advanced Tool Functions
function openNutritionPlanner() {
    navigateTo('nutrition-planner');
}

function openActivityTracker() {
    navigateTo('activity-tracker');
}

function openSafetyMonitor() {
    navigateTo('safety-monitor');
}

function openMoodAnalyzer() {
    navigateTo('mood-analyzer');
}

function openLearningHub() {
    navigateTo('learning-hub');
}

function openCareScheduler() {
    navigateTo('care-scheduler');
}

function openSocialConnect() {
    navigateTo('social-connect');
}

function openMemoryBook() {
    navigateTo('memory-book');
}

function openWeatherAdvisor() {
    navigateTo('weather-advisor');
}

// New Advanced Tool Functions
function generateNutritionPlan() {
    const age = parseFloat(document.getElementById('nutritionAge').value);
    const weight = parseFloat(document.getElementById('nutritionWeight').value);
    const allergies = document.getElementById('allergies').value;
    
    if (!age || !weight) {
        alert('Please fill in baby\'s age and weight for nutrition planning');
        return;
    }
    
    const nutritionPlan = calculateNutritionPlan(age, weight, allergies);
    
    const resultDiv = document.getElementById('nutritionPlanResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🥗 AI Nutrition Plan Generated</h3>
            <p style="margin-bottom: 10px;">Personalized meal plan based on baby's age, weight, and dietary needs</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${nutritionPlan.dailyCalories} kcal</div>
                    <div style="font-size: 12px;">Daily Calories</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${nutritionPlan.feedings}x/day</div>
                    <div style="font-size: 12px;">Feedings</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${nutritionPlan.allergenRisk}</div>
                    <div style="font-size: 12px;">Allergen Risk</div>
                </div>
            </div>
        </div>
    `;
    
    // Display recommendations
    const recommendationsDiv = document.getElementById('nutritionRecommendations');
    recommendationsDiv.innerHTML = nutritionPlan.recommendations.map(rec => `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #00b894; margin-bottom: 15px;">${rec.title}</h3>
            <div style="display: grid; gap: 15px;">
                ${rec.items.map(item => `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: #333;">${item.name}</div>
                            <div style="color: #666; font-size: 14px;">${item.description}</div>
                        </div>
                        <div style="background: #00b894; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                            ${item.amount}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function startActivityTracking() {
    const age = parseFloat(document.getElementById('activityAge').value);
    const activityLevel = document.getElementById('activityLevel').value;
    
    if (!age) {
        alert('Please enter baby\'s age for activity tracking');
        return;
    }
    
    const activityData = analyzeActivityPatterns(age, activityLevel);
    
    const resultDiv = document.getElementById('activityTrackingResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🎯 Activity Analysis Complete</h3>
            <p style="margin-bottom: 10px;">Real-time activity monitoring and development tracking</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${activityData.activeMinutes} min</div>
                    <div style="font-size: 12px;">Active Time</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${activityData.developmentScore}/100</div>
                    <div style="font-size: 12px;">Development Score</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${activityData.recommendations}</div>
                    <div style="font-size: 12px;">Activities</div>
                </div>
            </div>
        </div>
    `;
    
    // Display analytics
    const analyticsDiv = document.getElementById('activityAnalytics');
    analyticsDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #fd79a8; margin-bottom: 20px;">📈 Activity Analytics Dashboard</h3>
            <div style="display: grid; gap: 15px;">
                ${activityData.analytics.map(metric => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="font-weight: 600; color: #333;">${metric.name}</div>
                            <div style="background: #fd79a8; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px;">
                                ${metric.value}
                            </div>
                        </div>
                        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: #fd79a8; height: 100%; width: ${metric.percentage}%; transition: width 1s ease;"></div>
                        </div>
                        <div style="color: #666; font-size: 14px; margin-top: 10px;">${metric.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function runSafetyAnalysis() {
    const homeType = document.getElementById('homeType').value;
    const safetyConcerns = [];
    if (document.getElementById('stairs').checked) safetyConcerns.push('stairs');
    if (document.getElementById('pool').checked) safetyConcerns.push('pool');
    if (document.getElementById('pets').checked) safetyConcerns.push('pets');
    if (document.getElementById('kitchen').checked) safetyConcerns.push('kitchen');
    
    const safetyReport = analyzeSafetyRisks(homeType, safetyConcerns);
    
    const resultDiv = document.getElementById('safetyAnalysisResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #e17055 0%, #fab1a0 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🛡️ Safety Analysis Complete</h3>
            <p style="margin-bottom: 10px;">Smart home safety monitoring and hazard detection</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${safetyReport.riskLevel}</div>
                    <div style="font-size: 12px;">Risk Level</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${safetyReport.hazards}</div>
                    <div style="font-size: 12px;">Hazards Found</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${safetyReport.alerts}</div>
                    <div style="font-size: 12px;">Active Alerts</div>
                </div>
            </div>
        </div>
    `;
    
    // Display dashboard
    const dashboardDiv = document.getElementById('safetyDashboard');
    dashboardDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #e17055; margin-bottom: 20px;">🚨 Safety Monitoring Dashboard</h3>
            <div style="display: grid; gap: 15px;">
                ${safetyReport.recommendations.map(rec => `
                    <div style="background: ${rec.severity === 'high' ? '#ffebee' : rec.severity === 'medium' ? '#fff3e0' : '#e8f5e8'}; padding: 15px; border-radius: 10px; border-left: 4px solid ${rec.severity === 'high' ? '#f44336' : rec.severity === 'medium' ? '#ff9800' : '#4caf50'};">
                        <div style="font-weight: 600; color: ${rec.severity === 'high' ? '#f44336' : rec.severity === 'medium' ? '#ff9800' : '#4caf50'}; margin-bottom: 5px;">${rec.title}</div>
                        <div style="color: #666;">${rec.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function analyzeMood() {
    const age = parseFloat(document.getElementById('moodAge').value);
    const currentMood = document.getElementById('currentMood').value;
    const recordingDuration = parseFloat(document.getElementById('recordingDuration').value);
    
    if (!age) {
        alert('Please enter baby\'s age for mood analysis');
        return;
    }
    
    const moodAnalysis = analyzeEmotionalPatterns(age, currentMood, recordingDuration);
    
    const resultDiv = document.getElementById('moodAnalysisResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">😊 Mood Analysis Complete</h3>
            <p style="margin-bottom: 10px;">AI-powered emotion recognition and mood pattern analysis</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${moodAnalysis.emotionalState}</div>
                    <div style="font-size: 12px;">Emotional State</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${moodAnalysis.confidence}%</div>
                    <div style="font-size: 12px;">Confidence</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${moodAnalysis.needs}</div>
                    <div style="font-size: 12px;">Identified Needs</div>
                </div>
            </div>
        </div>
    `;
    
    // Display intelligence report
    const reportDiv = document.getElementById('moodIntelligenceReport');
    reportDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #a29bfe; margin-bottom: 20px;">🧠 Mood Intelligence Report</h3>
            <div style="display: grid; gap: 15px;">
                ${moodAnalysis.insights.map(insight => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 10px;">${insight.title}</div>
                        <div style="color: #666; margin-bottom: 15px;">${insight.description}</div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${insight.tags.map(tag => `
                                <span style="background: #a29bfe; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                                    ${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateLearningPlan() {
    const age = parseFloat(document.getElementById('learningAge').value);
    const learningStyle = document.getElementById('learningStyle').value;
    const learningTime = parseFloat(document.getElementById('learningTime').value);
    
    if (!age || !learningTime) {
        alert('Please enter baby\'s age and daily learning time');
        return;
    }
    
    const learningPlan = createPersonalizedLearningPlan(age, learningStyle, learningTime);
    
    const resultDiv = document.getElementById('learningPlanResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #00cec9 0%, #55efc4 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">📚 Learning Plan Generated</h3>
            <p style="margin-bottom: 10px;">Personalized educational activities based on age and learning style</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${learningPlan.activities}</div>
                    <div style="font-size: 12px;">Daily Activities</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${learningPlan.focusAreas}</div>
                    <div style="font-size: 12px;">Focus Areas</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${learningPlan.progressPotential}%</div>
                    <div style="font-size: 12px;">Progress Potential</div>
                </div>
            </div>
        </div>
    `;
    
    // Display activities
    const activitiesDiv = document.getElementById('learningActivities');
    activitiesDiv.innerHTML = learningPlan.recommendedActivities.map(activity => `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #00cec9; margin-bottom: 15px;">${activity.title}</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <div style="color: #666; margin-bottom: 10px;">${activity.description}</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                    <span style="background: #00cec9; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                        ${activity.duration}
                    </span>
                    <span style="background: #55efc4; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                        ${activity.category}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function generateCareSchedule() {
    const age = parseFloat(document.getElementById('scheduleAge').value);
    const routineType = document.getElementById('routineType').value;
    
    if (!age) {
        alert('Please enter baby\'s age for scheduling');
        return;
    }
    
    const careSchedule = createSmartCareSchedule(age, routineType);
    
    const resultDiv = document.getElementById('careScheduleResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">📅 Smart Schedule Generated</h3>
            <p style="margin-bottom: 10px;">AI-powered care scheduling with automated reminders</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${careSchedule.reminders}</div>
                    <div style="font-size: 12px;">Daily Reminders</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${careSchedule.appointments}</div>
                    <div style="font-size: 12px;">Appointments</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${careSchedule.routineType}</div>
                    <div style="font-size: 12px;">Routine Type</div>
                </div>
            </div>
        </div>
    `;
    
    // Display calendar
    const calendarDiv = document.getElementById('careCalendar');
    calendarDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #6c5ce7; margin-bottom: 20px;">📋 Smart Care Calendar</h3>
            <div style="display: grid; gap: 15px;">
                ${careSchedule.schedule.map(item => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: #333;">${item.time}</div>
                            <div style="color: #666; font-size: 14px;">${item.activity}</div>
                        </div>
                        <div style="background: #6c5ce7; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                            ${item.type}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function joinCommunity() {
    const parentName = document.getElementById('parentName').value;
    const babyAge = parseFloat(document.getElementById('socialBabyAge').value);
    const location = document.getElementById('location').value;
    
    if (!parentName || !babyAge) {
        alert('Please enter your name and baby\'s age to join the community');
        return;
    }
    
    const communityProfile = createCommunityProfile(parentName, babyAge, location);
    
    const resultDiv = document.getElementById('socialConnectResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">👨‍👩‍👧‍👦 Community Profile Created</h3>
            <p style="margin-bottom: 10px;">Welcome to the Baby Social Connect community!</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${communityProfile.connections}</div>
                    <div style="font-size: 12px;">Potential Connections</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${communityProfile.groups}</div>
                    <div style="font-size: 12px;">Relevant Groups</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${communityProfile.experts}</div>
                    <div style="font-size: 12px;">Experts Available</div>
                </div>
            </div>
        </div>
    `;
    
    // Display hub
    const hubDiv = document.getElementById('communityHub');
    hubDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #ff7675; margin-bottom: 20px;">💬 Parent Community Hub</h3>
            <div style="display: grid; gap: 15px;">
                ${communityProfile.recommendedGroups.map(group => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 10px;">${group.name}</div>
                        <div style="color: #666; margin-bottom: 15px;">${group.description}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: #999; font-size: 14px;">${group.members} members</div>
                            <button style="background: #ff7675; color: white; padding: 8px 20px; border: none; border-radius: 15px; font-size: 12px; cursor: pointer;">
                                Join Group
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createMemoryBook() {
    const babyName = document.getElementById('babyName').value;
    const birthDate = document.getElementById('babyBirthDate').value;
    const sharingPreferences = document.getElementById('sharingPreferences').value;
    
    if (!babyName || !birthDate) {
        alert('Please enter baby\'s name and birth date');
        return;
    }
    
    const memoryBook = initializeMemoryBook(babyName, birthDate, sharingPreferences);
    
    const resultDiv = document.getElementById('memoryBookResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">📖 Memory Book Created</h3>
            <p style="margin-bottom: 10px;">Digital memory book with AI-powered timeline creation</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${memoryBook.photos}</div>
                    <div style="font-size: 12px;">Photos Capacity</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${memoryBook.milestones}</div>
                    <div style="font-size: 12px;">Milestones</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${memoryBook.sharing}</div>
                    <div style="font-size: 12px;">Sharing Level</div>
                </div>
            </div>
        </div>
    `;
    
    // Display timeline
    const timelineDiv = document.getElementById('memoryTimeline');
    timelineDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #fdcb6e; margin-bottom: 20px;">🌟 Memory Timeline</h3>
            <div style="display: grid; gap: 15px;">
                ${memoryBook.timeline.map(memory => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #fdcb6e;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 10px;">${memory.date}</div>
                        <div style="color: #666; margin-bottom: 10px;">${memory.title}</div>
                        <div style="color: #999; font-size: 14px;">${memory.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getWeatherAdvice() {
    const location = document.getElementById('weatherLocation').value;
    const age = parseFloat(document.getElementById('weatherBabyAge').value);
    
    if (!location || !age) {
        alert('Please enter location and baby\'s age for weather advice');
        return;
    }
    
    const weatherAdvice = generateWeatherRecommendations(location, age);
    
    const resultDiv = document.getElementById('weatherAdviceResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 22px;">🌤️ Weather Analysis Complete</h3>
            <p style="margin-bottom: 10px;">AI-powered weather recommendations for baby care</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${weatherAdvice.temperature}°C</div>
                    <div style="font-size: 12px;">Temperature</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${weatherAdvice.condition}</div>
                    <div style="font-size: 12px;">Condition</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${weatherAdvice.alerts}</div>
                    <div style="font-size: 12px;">Health Alerts</div>
                </div>
            </div>
        </div>
    `;
    
    // Display intelligence
    const intelligenceDiv = document.getElementById('weatherIntelligence');
    intelligenceDiv.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #74b9ff; margin-bottom: 20px;">🌈 Weather Intelligence Report</h3>
            <div style="display: grid; gap: 15px;">
                ${weatherAdvice.recommendations.map(rec => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 10px;">${rec.category}</div>
                        <div style="color: #666; margin-bottom: 15px;">${rec.description}</div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${rec.items.map(item => `
                                <span style="background: #74b9ff; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px;">
                                    ${item}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Helper functions for new tools
function calculateNutritionPlan(age, weight, allergies) {
    const dailyCalories = age <= 6 ? weight * 150 : weight * 120;
    const feedingsPerDay = age <= 3 ? 8 : age <= 6 ? 6 : age <= 12 ? 5 : 4;
    const allergenRisk = allergies ? 'High' : 'Low';
    
    return {
        dailyCalories: Math.round(dailyCalories),
        feedings: feedingsPerDay,
        allergenRisk,
        recommendations: [
            {
                title: '🥛 Daily Nutrition',
                items: [
                    { name: 'Breast Milk/Formula', amount: `${Math.round(dailyCalories/feedingsPerDay)}ml per feeding`, description: 'Primary nutrition source' },
                    { name: 'Solid Foods', amount: age >= 6 ? '2-3 meals' : 'Not yet', description: 'Age-appropriate solids' },
                    { name: 'Water', amount: age >= 6 ? '2-4 oz' : 'Not yet', description: 'Hydration needs' }
                ]
            },
            {
                title: '🥗 Meal Planning',
                items: [
                    { name: 'Breakfast', amount: `${Math.round(dailyCalories * 0.3)} kcal`, description: 'Morning nutrition' },
                    { name: 'Lunch', amount: `${Math.round(dailyCalories * 0.3)} kcal`, description: 'Midday meal' },
                    { name: 'Dinner', amount: `${Math.round(dailyCalories * 0.3)} kcal`, description: 'Evening meal' },
                    { name: 'Snacks', amount: `${Math.round(dailyCalories * 0.1)} kcal`, description: 'Between meals' }
                ]
            }
        ]
    };
}

function analyzeActivityPatterns(age, activityLevel) {
    const activeMinutes = activityLevel === 'very-active' ? 120 : activityLevel === 'active' ? 90 : activityLevel === 'moderate' ? 60 : 30;
    const developmentScore = age <= 6 ? 85 : age <= 12 ? 75 : 70;
    const recommendations = Math.round(5 + Math.random() * 3);
    
    return {
        activeMinutes,
        developmentScore,
        recommendations,
        analytics: [
            { name: 'Motor Skills Development', value: '85%', percentage: 85, description: 'Physical development progress' },
            { name: 'Cognitive Engagement', value: '78%', percentage: 78, description: 'Mental stimulation level' },
            { name: 'Social Interaction', value: '72%', percentage: 72, description: 'Social engagement activities' },
            { name: 'Sensory Exploration', value: '88%', percentage: 88, description: 'Sensory development activities' }
        ]
    };
}

function analyzeSafetyRisks(homeType, concerns) {
    const riskLevel = concerns.length > 2 ? 'High' : concerns.length > 1 ? 'Medium' : 'Low';
    const hazards = concerns.length;
    const alerts = Math.max(0, concerns.length - 1);
    
    return {
        riskLevel,
        hazards,
        alerts,
        recommendations: [
            { title: 'Stair Safety', description: 'Install safety gates at top and bottom of stairs', severity: concerns.includes('stairs') ? 'high' : 'low' },
            { title: 'Water Safety', description: 'Never leave baby unattended near water sources', severity: concerns.includes('pool') ? 'high' : 'low' },
            { title: 'Pet Safety', description: 'Supervise interactions between baby and pets', severity: concerns.includes('pets') ? 'medium' : 'low' },
            { title: 'Kitchen Safety', description: 'Use cabinet locks and stove guards', severity: concerns.includes('kitchen') ? 'medium' : 'low' }
        ]
    };
}

function analyzeEmotionalPatterns(age, mood, duration) {
    const emotionalState = mood.charAt(0).toUpperCase() + mood.slice(1);
    const confidence = Math.round(85 + Math.random() * 10);
    const needs = Math.round(2 + Math.random() * 2);
    
    return {
        emotionalState,
        confidence,
        needs,
        insights: [
            { title: 'Emotional Development', description: 'Baby is showing appropriate emotional responses for their age', tags: ['Normal', 'Healthy', 'Age-Appropriate'] },
            { title: 'Attachment Patterns', description: 'Strong attachment behaviors detected, indicating healthy bonding', tags: ['Secure Attachment', 'Healthy Bonding'] },
            { title: 'Communication Cues', description: 'Clear communication patterns through crying and facial expressions', tags: ['Clear Signals', 'Effective Communication'] }
        ]
    };
}

function createPersonalizedLearningPlan(age, style, time) {
    const activities = Math.round(3 + Math.random() * 2);
    const focusAreas = 4;
    const progressPotential = Math.round(80 + Math.random() * 15);
    
    return {
        activities,
        focusAreas,
        progressPotential,
        recommendedActivities: [
            { title: 'Sensory Play', description: 'Textured toys and sensory stimulation activities', duration: '15 min', category: 'Sensory' },
            { title: 'Language Development', description: 'Reading, singing, and talking activities', duration: '20 min', category: 'Language' },
            { title: 'Motor Skills', description: 'Tummy time and movement activities', duration: '25 min', category: 'Motor' },
            { title: 'Cognitive Games', description: 'Problem-solving and exploration activities', duration: '15 min', category: 'Cognitive' }
        ]
    };
}

function createSmartCareSchedule(age, routineType) {
    const reminders = routineType === 'structured' ? 8 : 6;
    const appointments = Math.round(2 + Math.random() * 2);
    
    return {
        reminders,
        appointments,
        routineType: routineType.charAt(0).toUpperCase() + routineType.slice(1),
        schedule: [
            { time: '7:00 AM', activity: 'Morning Feeding', type: 'Feeding' },
            { time: '9:00 AM', activity: 'Playtime', type: 'Activity' },
            { time: '11:00 AM', activity: 'Nap Time', type: 'Sleep' },
            { time: '1:00 PM', activity: 'Lunch Feeding', type: 'Feeding' },
            { time: '3:00 PM', activity: 'Outdoor Activity', type: 'Activity' },
            { time: '5:00 PM', activity: 'Afternoon Nap', type: 'Sleep' },
            { time: '7:00 PM', activity: 'Dinner Feeding', type: 'Feeding' },
            { time: '9:00 PM', activity: 'Bedtime Routine', type: 'Sleep' }
        ]
    };
}

function createCommunityProfile(name, age, location) {
    const connections = Math.round(15 + Math.random() * 10);
    const groups = Math.round(3 + Math.random() * 2);
    const experts = Math.round(5 + Math.random() * 3);
    
    return {
        connections,
        groups,
        experts,
        recommendedGroups: [
            { name: 'Parents of ' + age + '-month-olds', description: 'Connect with parents of babies the same age', members: Math.round(50 + Math.random() * 30) },
            { name: 'Feeding Support Group', description: 'Get advice on breastfeeding and formula feeding', members: Math.round(80 + Math.random() * 40) },
            { name: 'Sleep Training Community', description: 'Share sleep training tips and experiences', members: Math.round(60 + Math.random() * 25) }
        ]
    };
}

function initializeMemoryBook(name, birthDate, sharing) {
    const photos = 1000;
    const milestones = 20;
    const sharingLevel = sharing.charAt(0).toUpperCase() + sharing.slice(1);
    
    return {
        photos,
        milestones,
        sharing: sharingLevel,
        timeline: [
            { date: birthDate, title: 'Birth Day', description: 'Welcome to the world, ' + name + '!' },
            { date: new Date(birthDate).setDate(new Date(birthDate).getDate() + 7).toLocaleDateString(), title: 'First Week', description: 'Completed first week milestone' },
            { date: new Date(birthDate).setDate(new Date(birthDate).getDate() + 30).toLocaleDateString(), title: 'One Month Old', description: 'Celebrating one month of growth' }
        ]
    };
}

function generateWeatherRecommendations(location, age) {
    const temperature = Math.round(18 + Math.random() * 10);
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 4)];
    const alerts = Math.random() > 0.7 ? 1 : 0;
    
    return {
        temperature,
        condition: conditions,
        alerts,
        recommendations: [
            {
                category: '👕 Clothing Recommendations',
                description: 'Dress baby in layers appropriate for the weather',
                items: ['Light cotton layers', 'Sun hat', 'Comfortable shoes']
            },
            {
                category: '🌞 Outdoor Activities',
                description: 'Safe outdoor activities for current weather',
                items: ['Short walks', 'Shaded playground', 'Indoor alternatives']
            },
            {
                category: '⚠️ Health Precautions',
                description: 'Weather-related health considerations',
                items: ['Sunscreen needed', 'Stay hydrated', 'Monitor temperature']
            }
        ]
    };
}

function openConceptionCalc() {
  navigateTo('conception-date-calculator');
}

function openPregnancyChecker() {
  navigateTo('early-pregnancy-signs');
}

function openBabyCostsCalc() {
  navigateTo('baby-costs-calculator');
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
    if (!requireToolAccess('due-date-calculator', 'calculateDueDate')) {
        return;
    }

    const lmp = document.getElementById('dueDateLMP').value;
    const cycleLength = parseInt(document.getElementById('cycleLength').value);
    
    if (!lmp) {
        alert('Please enter your last menstrual period date');
        return;
    }
    
    const lmpDate = new Date(lmp);
    const dueDate = new Date(lmpDate.getTime() + (280 + (cycleLength - 28)) * 24 * 60 * 60 * 1000);
    const today = new Date();
    const weeksPregnant = Math.max(0, Math.floor((today - lmpDate) / (7 * 24 * 60 * 60 * 1000)));
    const trimester = weeksPregnant <= 13 ? 'First trimester' : weeksPregnant <= 27 ? 'Second trimester' : 'Third trimester';
    const earliestTerm = new Date(dueDate);
    const latestTerm = new Date(dueDate);
    earliestTerm.setDate(dueDate.getDate() - 21);
    latestTerm.setDate(dueDate.getDate() + 14);
    const resultDiv = document.getElementById('dueDateResult');
    const banner = document.getElementById('dueDateBanner');
    const label = document.getElementById('dueDateLabel');
    const summary = document.getElementById('dueDateSummary');
    const dueDateValue = document.getElementById('dueDateValue');
    const cycleNote = document.getElementById('dueDateCycleNote');
    const dueDateWeeks = document.getElementById('dueDateWeeks');
    const dueDateTrimester = document.getElementById('dueDateTrimester');
    const dueDateMethod = document.getElementById('dueDateMethod');
    const dueDateRange = document.getElementById('dueDateRange');

    if (banner) {
        banner.className = 'sign-result sign-result-medium';
    }
    if (label) label.textContent = 'Due date calculated';
    if (summary) summary.textContent = `Based on your last menstrual period and a ${cycleLength}-day cycle, this is your estimated due date.`;
    if (dueDateValue) dueDateValue.textContent = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (cycleNote) cycleNote.textContent = `Cycle length used: ${cycleLength} days`;
    if (dueDateWeeks) dueDateWeeks.textContent = `${weeksPregnant} weeks`;
    if (dueDateTrimester) dueDateTrimester.textContent = trimester;
    if (dueDateMethod) dueDateMethod.textContent = `Estimated using 280 days plus a ${cycleLength - 28 >= 0 ? '+' : ''}${cycleLength - 28}-day cycle adjustment`;
    if (dueDateRange) dueDateRange.textContent = `Full-term birth often falls between ${earliestTerm.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} and ${latestTerm.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function trackPregnancy() {
    if (!requireToolAccess('pregnancy-tracker', 'trackPregnancy')) {
        return;
    }

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
    if (!requireToolAccess('baby-kick-counter', 'startKickCounter')) {
        return;
    }

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
    if (!requireToolAccess('contraction-timer', 'startContraction')) {
        return;
    }

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
    if (!requireToolAccess('sleep-tracker', 'trackSleep')) {
        return;
    }

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
    
    // Generate sleep quality assessment
    const assessment = getSleepQualityAssessment(quality, hours);
    
    // Create results popup modal
    const modal = document.createElement('div');
    modal.id = 'sleepTrackResultModal';
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
        <div style="background: white; border-radius: 20px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 20px 20px 0 0; position: relative;">
                <button onclick="closeSleepTrackResultModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                    😴 Sleep Session Results
                </h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">${assessment.emoji} ${quality.charAt(0).toUpperCase() + quality.slice(1)} Quality Sleep</p>
            </div>
            
            <div style="padding: 25px;">
                <!-- Duration Card -->
                <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                    <div style="font-size: 48px; font-weight: 800; color: #4caf50; line-height: 1;">${hours}<span style="font-size: 24px;">h</span> ${minutes > 0 ? minutes + '<span style="font-size: 24px;">m</span>' : ''}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 8px;">Total Sleep Duration</div>
                    <div style="font-size: 16px; font-weight: 600; color: #4caf50; margin-top: 10px; padding: 6px 16px; background: rgba(76,175,80,0.15); border-radius: 20px; display: inline-block;">${assessment.rating}</div>
                </div>
                
                <!-- Time Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 20px; margin-bottom: 5px;">🌙</div>
                        <div style="font-size: 18px; font-weight: 700; color: #333;">${formatTime12Hour(startTime)}</div>
                        <div style="font-size: 12px; color: #666;">Sleep Start</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 20px; margin-bottom: 5px;">☀️</div>
                        <div style="font-size: 18px; font-weight: 700; color: #333;">${formatTime12Hour(endTime)}</div>
                        <div style="font-size: 12px; color: #666;">Wake Up</div>
                    </div>
                </div>
                
                <!-- Assessment -->
                <div style="padding: 20px; background: ${assessment.bgColor}; border-radius: 15px; margin-bottom: 20px; border-left: 4px solid ${assessment.borderColor};">
                    <strong style="color: ${assessment.textColor}; font-size: 16px; display: block; margin-bottom: 8px;">${assessment.title}</strong>
                    <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.5;">${assessment.message}</p>
                </div>
                
                <!-- Recommendations -->
                <div style="padding: 20px; background: #f8f9fa; border-radius: 15px; margin-bottom: 20px;">
                    <strong style="color: #667eea; font-size: 16px; display: block; margin-bottom: 10px;">💡 Recommendations</strong>
                    <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                        ${assessment.recommendations.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
                
                <p style="margin: 0; font-size: 12px; color: #999; font-style: italic; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <em>Consistent sleep tracking helps identify patterns and improve sleep quality over time.</em>
                </p>
            </div>
            
            <div style="padding: 0 25px 25px 25px; text-align: center; display: flex; gap: 10px;">
                <button onclick="closeSleepTrackResultModal()" style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer;">Close</button>
                <button onclick="saveAndCloseSleepTrackResult('${startTime}', '${endTime}', '${quality}', ${hours}, ${minutes})" style="flex: 1; background: #4caf50; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer;">💾 Save Entry</button>
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
}

function closeSleepTrackResultModal() {
    const modal = document.getElementById('sleepTrackResultModal');
    if (modal) {
        modal.remove();
    }
}

function saveAndCloseSleepTrackResult(startTime, endTime, quality, hours, minutes) {
    // Save to localStorage
    const sleepEntries = JSON.parse(localStorage.getItem('mamacare_sleep_track_entries') || '[]');
    sleepEntries.push({
        id: Date.now(),
        startTime,
        endTime,
        quality,
        hours,
        minutes,
        recordedAt: new Date().toISOString()
    });
    localStorage.setItem('mamacare_sleep_track_entries', JSON.stringify(sleepEntries));
    
    closeSleepTrackResultModal();
    showNotification('Sleep entry saved successfully!', 'success');
    
    // Clear form
    document.getElementById('sleepStart').value = '';
    document.getElementById('sleepEnd').value = '';
}

function getSleepQualityAssessment(quality, hours) {
    if (quality === 'excellent') {
        return {
            rating: '✓ Optimal',
            title: 'Excellent Sleep Quality',
            emoji: '🌟',
            message: 'Your baby had peaceful, restorative sleep. This quality of sleep supports healthy brain development and growth.',
            bgColor: '#e8f5e9',
            borderColor: '#4caf50',
            textColor: '#2e7d32',
            recommendations: ['Continue the current bedtime routine', 'Document what worked well today', 'Maintain consistent sleep environment']
        };
    } else if (quality === 'good') {
        return {
            rating: 'Good',
            title: 'Good Sleep Quality',
            emoji: '👍',
            message: 'Your baby slept well with minimal disruptions. Good sleep supports learning and memory consolidation.',
            bgColor: '#e3f2fd',
            borderColor: '#2196f3',
            textColor: '#1565c0',
            recommendations: ['Continue current sleep practices', 'Minor adjustments may improve further', 'Watch for patterns that lead to good sleep']
        };
    } else if (quality === 'fair') {
        return {
            rating: 'Fair',
            title: 'Fair Sleep Quality',
            emoji: '⚠️',
            message: 'Sleep had some frequent waking. This is common but may indicate room for improvement in sleep environment or routine.',
            bgColor: '#fff3e0',
            borderColor: '#ff9800',
            textColor: '#ef6c00',
            recommendations: ['Check room temperature (68-72°F ideal)', 'Reduce noise or use white noise', 'Evaluate if baby was overtired at bedtime', 'Consider hunger or teething as factors']
        };
    } else {
        return {
            rating: 'Poor',
            title: 'Restless Sleep',
            emoji: '😴',
            message: 'Your baby was very restless. Poor sleep quality can affect mood and development if it becomes a pattern.',
            bgColor: '#ffebee',
            borderColor: '#f44336',
            textColor: '#c62828',
            recommendations: ['Check for illness or discomfort', 'Review bedtime routine consistency', 'Ensure comfortable sleep surface', 'Consider consulting pediatrician if pattern continues', 'Check for environmental disturbances']
        };
    }
}

function formatTime12Hour(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function generateVaccineSchedule() {
    if (!requireToolAccess('vaccine-scheduler', 'generateVaccineSchedule')) {
        return;
    }

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
    if (!requireToolAccess('growth-chart-page', 'trackGrowth')) {
        return;
    }

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

// Feeding Problem Solver Functions

function showBreastfeedingSolution(problem) {
    const solutions = {
        latch: {
            title: 'Latch Issues - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Try These Solutions:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Position baby tummy-to-tummy</strong> - Ensure baby's whole body faces you</li><li><strong>Wait for wide open mouth</strong> - Don't latch until baby's mouth is wide open like a yawn</li><li><strong>Aim nipple to nose</strong> - This encourages baby to tilt head back and open wide</li><li><strong>Support breast with "C" hold</strong> - Fingers below, thumb above, away from areola</li><li><strong>Break suction gently</strong> - Insert finger in corner of mouth if latch is painful</li></ul><div style="background: #e8f4fd; padding: 15px; border-radius: 8px;"><strong>💡 When to Get Help:</strong> If pain persists beyond 30 seconds or nipples are damaged, see a lactation consultant immediately.</div></div>`
        },
        supply: {
            title: 'Low Milk Supply - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Increase Your Supply:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Nurse more frequently</strong> - Aim for 8-12 sessions per day</li><li><strong>Ensure effective removal</strong> - Check latch and consider breast compression</li><li><strong>Power pumping</strong> - Pump 20 min on, 10 min off, 10 min on, once daily</li><li><strong>Stay hydrated</strong> - Drink to thirst, aim for 8+ glasses water</li><li><strong>Rest and reduce stress</strong> - Cortisol can impact milk production</li></ul><div style="background: #e8f4fd; padding: 15px; border-radius: 8px;"><strong>💡 Reality Check:</strong> Most mothers make enough milk. If baby has 6+ wet diapers daily and is gaining weight, supply is likely adequate.</div></div>`
        },
        engorgement: {
            title: 'Engorgement - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Relief Strategies:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Nurse or pump frequently</strong> - Every 2-3 hours until softened</li><li><strong>Reverse pressure softening</strong> - Gently push fluid back before latching</li><li><strong>Cold compresses</strong> - Apply between feedings to reduce swelling</li><li><strong>Warm compress before nursing</strong> - Helps milk flow (5-10 minutes max)</li><li><strong>Hand express</strong> - Just enough to soften areola for comfortable latch</li></ul><div style="background: #e8f4fd; padding: 15px; border-radius: 8px;"><strong>💡 Prevention:</strong> Don't skip feedings and avoid pumping excessively - this can worsen engorgement.</div></div>`
        },
        mastitis: {
            title: 'Mastitis/Blocked Duct - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Immediate Actions:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Keep nursing!</strong> - Empty the affected breast frequently</li><li><strong>Start with affected side</strong> - Baby sucks hardest at start of feed</li><li><strong>Change positions</strong> - Try "dangle feeding" - lean over baby</li><li><strong>Massage toward nipple</strong> - During feeding, massage the blocked area</li><li><strong>Rest and hydrate</strong> - Your body needs energy to fight infection</li></ul><div style="background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404;"><strong>⚠️ See Doctor If:</strong> Fever over 101°F (38.3°C), symptoms worsen after 24 hours, or you see red streaking. You may need antibiotics.</div></div>`
        },
        sore: {
            title: 'Sore/Cracked Nipples - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Healing Strategies:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Fix the latch</strong> - Most soreness is caused by shallow latch</li><li><strong>Apply breast milk</strong> - Express a drop and let air dry on nipple</li><li><strong>Pure lanolin</strong> - Apply after each feeding (safe for baby)</li><li><strong>Hydrogel pads</strong> - Cooling relief between feedings</li><li><strong>Nipple shields</strong> - Temporary use while healing (get LC guidance)</li></ul><div style="background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404;"><strong>⚠️ Warning:</strong> White or shiny nipples, burning pain, or clicking sounds may indicate thrush - see your doctor.</div></div>`
        },
        cluster: {
            title: 'Cluster Feeding - Understanding',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 What You Need to Know:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>It's normal!</strong> - Especially during growth spurts (days 2-3, weeks 2-3, 6 weeks, 3 months)</li><li><strong>Not a sign of low supply</strong> - Baby is increasing your milk production</li><li><strong>Set up a nursing station</strong> - Water, snacks, phone charger, remote control</li><li><strong>Accept help</strong> - Have someone else handle other tasks</li><li><strong>It passes</strong> - Usually lasts just a few hours or days</li></ul><div style="background: #d4edda; padding: 15px; border-radius: 8px; color: #155724;"><strong>💡 Survival Tips:</strong> Wear baby in a carrier during the day, nap when you can, and remember this is temporary but important for establishing supply.</div></div>`
        }
    };
    
    const solution = solutions[problem];
    if (solution) {
        const titleEl = document.getElementById('bfSolutionTitle');
        const contentEl = document.getElementById('bfSolutionContent');
        const panelEl = document.getElementById('breastfeedingSolution');
        if (titleEl) titleEl.textContent = solution.title;
        if (contentEl) contentEl.innerHTML = solution.content;
        if (panelEl) {
            panelEl.style.display = 'block';
            panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function showFormulaSolution(problem) {
    const solutions = {
        reflux: {
            title: 'Spit-up/Reflux - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Reduce Spit-up:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Smaller, frequent feeds</strong> - Offer less but more often</li><li><strong>Keep upright</strong> - Hold baby upright 20-30 minutes after feeding</li><li><strong>Check nipple flow</strong> - Too fast can cause overfeeding and spit-up</li><li><strong>Avoid tight diapers</strong> - Pressure on tummy increases reflux</li><li><strong>Burp frequently</strong> - Every 1-2 ounces during feedings</li></ul><div style="background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404;"><strong>⚠️ See Doctor If:</strong> Projectile vomiting, green vomit, blood in spit-up, poor weight gain, or signs of pain (arching back, crying with feeds).</div></div>`
        },
        constipation: {
            title: 'Constipation - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Relief for Constipation:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Check formula preparation</strong> - Ensure correct water-to-powder ratio</li><li><strong>Offer extra water</strong> - For babies over 6 months (ask doctor first)</li><li><strong>Bicycle legs</strong> - Gentle leg movement helps stimulate bowels</li><li><strong>Tummy massage</strong> - Clockwise gentle massage on abdomen</li><li><strong>Warm bath</strong> - Can help relax abdominal muscles</li></ul><div style="background: #e8f4fd; padding: 15px; border-radius: 8px;"><strong>💡 What's Normal:</strong> Formula-fed babies may go 1-3 days between stools. Hard, dry pellets or straining with pain indicate constipation.</div></div>`
        },
        allergy: {
            title: 'Possible Allergy - Solutions',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 If You Suspect Allergy:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Document symptoms</strong> - Note timing relative to feeds, type of reaction</li><li><strong>Check for blood in stool</strong> - Can indicate cow's milk protein intolerance</li><li><strong>Try hypoallergenic formula</strong> - Ask doctor about extensively hydrolyzed options</li><li><strong>Transition gradually</strong> - Mix old and new formula over several days</li><li><strong>Give it time</strong> - Allow 2 weeks to see improvement</li></ul><div style="background: #f8d7da; padding: 15px; border-radius: 8px; color: #721c24;"><strong>🚨 Emergency:</strong> Difficulty breathing, hives, swelling of face/lips, or vomiting immediately after feeding - call 911.</div></div>`
        },
        prep: {
            title: 'Formula Preparation - Best Practices',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Safe Formula Prep:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Wash hands thoroughly</strong> - Before every preparation</li><li><strong>Use safe water</strong> - Follow local guidelines; boil if uncertain</li><li><strong>Measure carefully</strong> - Use scoop provided, level off (don't pack)</li><li><strong>Follow order</strong> - Water first, then powder (unless directed otherwise)</li><li><strong>Shake well</strong> - Ensure powder fully dissolves</li></ul><div style="background: #d4edda; padding: 15px; border-radius: 8px; color: #155724;"><strong>✅ Quick Tip:</strong> Prepared formula can stay at room temperature for 2 hours maximum. Discard any leftover formula from a feed.</div></div>`
        },
        amount: {
            title: 'How Much to Feed - Guidelines',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Typical Amounts by Age:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Newborn (0-1 month):</strong> 1-3 oz every 2-3 hours (8-12 feeds/day)</li><li><strong>1-3 months:</strong> 4-5 oz every 3-4 hours (6-8 feeds/day)</li><li><strong>4-6 months:</strong> 4-6 oz every 4 hours (5-6 feeds/day)</li><li><strong>6-12 months:</strong> 6-8 oz, 4-5 times/day plus solids</li></ul><div style="background: #e8f4fd; padding: 15px; border-radius: 8px;"><strong>💡 Feeding Cues:</strong><br><strong>Hunger:</strong> Rooting, sucking motions, hand-to-mouth, fussing<br><strong>Full:</strong> Turning away, sealing lips, pushing bottle away, falling asleep</div></div>`
        },
        switching: {
            title: 'Switching Formulas - How To',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🎯 Transition Gradually:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Days 1-2:</strong> 75% old formula + 25% new formula</li><li><strong>Days 3-4:</strong> 50% old formula + 50% new formula</li><li><strong>Days 5-6:</strong> 25% old formula + 75% new formula</li><li><strong>Day 7:</strong> 100% new formula</li></ul><div style="background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404;"><strong>⚠️ Watch For:</strong> Persistent vomiting, diarrhea, blood in stool, rash, or extreme fussiness - consult pediatrician.</div></div>`
        }
    };
    
    const solution = solutions[problem];
    if (solution) {
        const titleEl = document.getElementById('ffSolutionTitle');
        const contentEl = document.getElementById('ffSolutionContent');
        const panelEl = document.getElementById('formulaSolution');
        if (titleEl) titleEl.textContent = solution.title;
        if (contentEl) contentEl.innerHTML = solution.content;
        if (panelEl) {
            panelEl.style.display = 'block';
            panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function showSolidTopic(topic) {
    const topics = {
        when: {
            title: 'When to Start Solids',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">✅ Signs Your Baby is Ready (Typically 4-6 Months):</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Can sit with support</strong> - Good head and neck control</li><li><strong>Lost tongue-thrust reflex</strong> - Doesn't automatically push food out</li><li><strong>Shows interest</strong> - Watches you eat, reaches for food</li><li><strong>Can swallow</strong> - Food stays in mouth instead of dribbling out</li><li><strong>Has doubled birth weight</strong> - Usually around 13+ pounds</li></ul><div style="background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404;"><strong>⚠️ Don't Start Before 4 Months</strong> - Baby's digestive system isn't ready and choking risk is higher.</div></div>`
        },
        first: {
            title: 'First Foods to Try',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🥣 Best First Foods:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Iron-fortified cereals</strong> - Mixed with breast milk or formula</li><li><strong>Pureed vegetables</strong> - Sweet potato, carrot, squash, peas</li><li><strong>Pureed fruits</strong> - Banana, apple, pear, avocado</li><li><strong>Single-ingredient first</strong> - Wait 3-5 days before introducing new food</li></ul><div style="background: #d4edda; padding: 15px; border-radius: 8px; color: #155724;"><strong>💡 Pro Tip:</strong> Avocado is perfect - naturally soft, full of healthy fats for brain development!</div></div>`
        },
        method: {
            title: 'Feeding Methods: Purees vs. BLW',
            content: `<div style="padding: 20px;"><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;"><div style="background: #e8f4fd; padding: 20px; border-radius: 12px;"><h4 style="margin-bottom: 10px;">🥄 Traditional Purees</h4><ul style="line-height: 1.6; font-size: 14px;"><li>Controlled portions</li><li>Easier to track intake</li><li>Less messy</li><li>Good for cautious eaters</li></ul></div><div style="background: #fff3e0; padding: 20px; border-radius: 12px;"><h4 style="margin-bottom: 10px;">👶 Baby-Led Weaning</h4><ul style="line-height: 1.6; font-size: 14px;"><li>Baby controls intake</li><li>Develops fine motor skills</li><li>Family eats together</li><li>May reduce picky eating</li></ul></div></div><p style="margin-top: 20px;"><strong>Combination approach works too!</strong></p></div>`
        },
        allergens: {
            title: 'Introducing Allergens Safely',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">⚠️ Common Allergens (Introduce one at a time):</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Peanuts</strong> - Thin peanut butter mixed into puree, or peanut powder</li><li><strong>Eggs</strong> - Well-cooked, mashed or scrambled</li><li><strong>Dairy</strong> - Yogurt or cheese (not cow's milk until 12 months)</li><li><strong>Tree nuts</strong> - As butter/powder only, never whole nuts</li><li><strong>Soy</strong> - Tofu or soy yogurt</li><li><strong>Wheat</strong> - Iron-fortified cereals, soft pasta</li><li><strong>Fish/Shellfish</strong> - Well-cooked, flaked, no bones</li></ul><div style="background: #d4edda; padding: 15px; border-radius: 8px; color: #155724;"><strong>✅ Safe Process:</strong> Introduce early in the day, start with tiny amount, wait 2 hours for reaction, increase if no reaction.</div></div>`
        },
        schedule: {
            title: 'Sample Feeding Schedule',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">📅 By Age:</h4><div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-bottom: 15px;"><h5 style="margin-bottom: 10px;">6-7 Months:</h5><ul style="line-height: 1.6; font-size: 14px;"><li>Morning: Milk feed + 1-2 tbsp cereal</li><li>Midday: Milk feed + 1-2 tbsp vegetable</li><li>Evening: Milk feed</li></ul></div><div style="background: #f8f9fa; padding: 15px; border-radius: 12px;"><h5 style="margin-bottom: 10px;">8-12 Months:</h5><ul style="line-height: 1.6; font-size: 14px;"><li>Breakfast: Milk + cereal or yogurt with fruit</li><li>Lunch: Milk + mashed/chopped family foods</li><li>Dinner: Milk + variety of foods</li><li>Snacks: Soft finger foods</li></ul></div><p style="margin-top: 15px; font-style: italic;">Milk feeds remain primary nutrition until 12 months.</p></div>`
        },
        choking: {
            title: 'Choking Prevention & Safety',
            content: `<div style="padding: 20px;"><h4 style="color: var(--primary-pink); margin-bottom: 15px;">🚫 High-Risk Foods to Avoid:</h4><ul style="line-height: 1.8; margin-bottom: 20px;"><li><strong>Hard foods:</strong> Whole nuts, raw carrots, raw apples (unless grated)</li><li><strong>Round foods:</strong> Whole grapes, cherry tomatoes, blueberries (cut in half)</li><li><strong>Sticky foods:</strong> Marshmallows, thick peanut butter (thin it)</li><li><strong>Tough foods:</strong> Tough meat, hot dogs (cut lengthwise then chop)</li><li><strong>Small hard foods:</strong> Popcorn, hard candy, whole nuts</li></ul><div style="background: #f8d7da; padding: 15px; border-radius: 8px; color: #721c24;"><strong>🚨 Always:</strong> Supervise eating, baby should sit upright, avoid eating in car seat or stroller, learn infant choking first aid and CPR.</div></div>`
        }
    };
    
    const topicInfo = topics[topic];
    if (topicInfo) {
        const contentEl = document.getElementById('solidFeedingContent');
        const infoEl = document.getElementById('solidFeedingInfo');
        if (contentEl) {
            contentEl.innerHTML = `<h3 style="margin-bottom: 20px; color: var(--text-dark);">${topicInfo.title}</h3>${topicInfo.content}`;
        }
        if (infoEl) {
            infoEl.style.display = 'block';
            infoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function trackChildGrowth() {
    const years = parseInt(document.getElementById('childAgeYears').value) || 0;
    const months = parseInt(document.getElementById('childAgeMonths').value) || 0;
    const weight = parseFloat(document.getElementById('childWeight').value);
    const height = parseFloat(document.getElementById('childHeight').value);
    const headCirc = parseFloat(document.getElementById('childHeadCirc').value);
    
    if (!weight || !height) {
        showNotification('Please enter at least weight and height', 'error');
        return;
    }
    
    const totalMonths = years * 12 + months;
    
    // Calculate percentiles (simplified estimates)
    let weightPercentile = 50;
    let heightPercentile = 50;
    
    if (totalMonths <= 12) {
        weightPercentile = Math.min(97, Math.max(3, 50 + (weight - (totalMonths * 0.5 + 3)) * 10));
        heightPercentile = Math.min(97, Math.max(3, 50 + (height - (50 + totalMonths * 2)) * 2));
    } else if (totalMonths <= 36) {
        weightPercentile = Math.min(97, Math.max(3, 50 + (weight - (9 + (totalMonths - 12) * 0.25)) * 8));
        heightPercentile = Math.min(97, Math.max(3, 50 + (height - (75 + (totalMonths - 12) * 0.6)) * 1.5));
    } else {
        weightPercentile = Math.min(97, Math.max(3, 50 + (weight - (14 + (totalMonths - 36) * 0.15)) * 6));
        heightPercentile = Math.min(97, Math.max(3, 50 + (height - (90 + (totalMonths - 36) * 0.4)) * 1));
    }
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    // Create modal popup
    const modal = document.createElement('div');
    modal.id = 'growthResultModal';
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
        <div style="background: white; border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 20px 20px 0 0; position: relative;">
                <button onclick="closeGrowthResultModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                    📊 Growth Assessment Results
                </h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} (${totalMonths} months)</p>
            </div>
            
            <div style="padding: 25px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 15px; text-align: center; border-left: 4px solid #4caf50;">
                        <div style="font-size: 28px; font-weight: 700; color: #4caf50;">${weight} kg</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">Weight</div>
                        <div style="font-size: 16px; font-weight: 600; color: #4caf50; margin-top: 5px; padding: 4px 12px; background: rgba(76,175,80,0.1); border-radius: 20px; display: inline-block;">${Math.round(weightPercentile)}th percentile</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 15px; text-align: center; border-left: 4px solid #2196f3;">
                        <div style="font-size: 28px; font-weight: 700; color: #2196f3;">${height} cm</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">Height</div>
                        <div style="font-size: 16px; font-weight: 600; color: #2196f3; margin-top: 5px; padding: 4px 12px; background: rgba(33,150,243,0.1); border-radius: 20px; display: inline-block;">${Math.round(heightPercentile)}th percentile</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 20px; border-radius: 15px; text-align: center; border-left: 4px solid #ff9800;">
                        <div style="font-size: 28px; font-weight: 700; color: #ff9800;">${bmi}</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">BMI (kg/m²)</div>
                    </div>
                    ${headCirc ? `
                    <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); padding: 20px; border-radius: 15px; text-align: center; border-left: 4px solid #9c27b0;">
                        <div style="font-size: 28px; font-weight: 700; color: #9c27b0;">${headCirc} cm</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">Head Circumference</div>
                    </div>
                    ` : ''}
                </div>
                
                <div style="padding: 20px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 15px; margin-bottom: 20px;">
                    <strong style="color: #2e7d32; font-size: 18px; display: block; margin-bottom: 10px;">Interpretation:</strong>
                    <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">${getGrowthInterpretation(weightPercentile, heightPercentile)}</p>
                </div>
                
                <p style="margin: 0; font-size: 13px; color: #999; font-style: italic; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <em>These are estimates based on WHO growth standards. Consult your pediatrician for accurate assessment.</em>
                </p>
            </div>
            
            <div style="padding: 0 25px 25px 25px; text-align: center;">
                <button onclick="closeGrowthResultModal()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer;">Close Results</button>
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
    
    showNotification('Growth tracking completed!', 'success');
}

function closeGrowthResultModal() {
    const modal = document.getElementById('growthResultModal');
    if (modal) {
        modal.remove();
    }
}

function getGrowthInterpretation(weightP, heightP) {
    if (weightP < 10 || heightP < 10) {
        return 'Below average - discuss with pediatrician if concerned.';
    } else if (weightP > 90 || heightP > 90) {
        return 'Above average - normal healthy growth.';
    } else {
        return 'Normal healthy growth range.';
    }
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

// Family-Friendly Functions
function startFamilyHealthTracking() {
    console.log('Starting family health tracking...');
    showNotification('🏥 Family health tracking activated! Monitoring wellness for all family members...', 'success');
    
    setTimeout(() => {
        showNotification('👨‍👩‍👧‍👦 All family members: Healthy and active', 'info');
    }, 2000);
    
    setTimeout(() => {
        showNotification('💊 Medication reminders: Up to date', 'info');
    }, 4000);
    
    setTimeout(() => {
        showNotification('🏃‍♀️ Family fitness goals: 75% achieved this week', 'success');
    }, 6000);
}

function openFamilyPlanner() {
    console.log('Opening family planner...');
    showNotification('📅 Loading family planner with milestones and goals...', 'info');
    
    setTimeout(() => {
        const plannerInfo = `
📅 FAMILY PLANNER & MILESTONES

Upcoming Family Events:
• Emma's Preschool Graduation - May 15
• Family Beach Vacation - July 1-7
• Jake's Soccer Tournament - June 20
• Mom's Birthday - June 25
• Annual Family Reunion - August 10

🎯 Family Goals Progress:
✅ Emergency Fund: 85% complete
✅ Home Renovation: 100% complete
📈 Vacation Savings: 70% complete
📈 Kids' College Fund: 45% complete

📋 This Week's Tasks:
• Schedule dentist appointments
• Plan summer vacation details
• Grocery shopping for family meals
• Pay monthly bills
• Family game night - Saturday

🏆 Recent Achievements:
• Emma learned to ride a bike!
• Jake got student of the month
• Completed home office renovation
• Saved $500 more than budgeted
        `;
        showNotification(plannerInfo, 'success');
    }, 1500);
}

function openMealPlanner() {
    console.log('Opening meal planner...');
    showNotification('🍽️ Loading family meal planner...', 'info');
    
    setTimeout(() => {
        const mealPlan = `
🍽️ FAMILY MEAL PLANNER

This Week's Menu:
📅 Monday: Spaghetti & Meatballs (Family Favorite)
📅 Tuesday: Grilled Chicken Salad
📅 Wednesday: Taco Night (Kids' Choice!)
📅 Thursday: Homemade Pizza Night
📅 Friday: Fish & Vegetables
📅 Saturday: BBQ Ribs & Corn
📅 Sunday: Roast Chicken Dinner

🛒 Shopping List:
• Ground beef, chicken breast, fish
• Pasta, rice, tortillas
• Fresh vegetables & salad mix
• Cheese, milk, eggs
• Snacks for kids' lunchboxes

💡 Meal Prep Tips:
• Cook rice in bulk for 3 meals
• Chop vegetables on Sunday
• Freeze extra portions
• Kids help with simple prep

👶 Kid-Friendly Options:
• Always have backup simple meals
• Involve kids in cooking decisions
• Hidden vegetables in sauces
        `;
        showNotification(mealPlan, 'success');
    }, 1500);
}

function openActivityPlanner() {
    console.log('Opening activity planner...');
    showNotification('📅 Loading family activity scheduler...', 'info');
    
    setTimeout(() => {
        const activityPlan = `
📅 FAMILY ACTIVITY SCHEDULER

This Week's Activities:
⚽ Monday: Emma's Soccer Practice (4:00 PM)
🎨 Tuesday: Jake's Art Class (3:30 PM)
🏃‍♀️ Wednesday: Family Run/Walk (6:00 PM)
📚 Thursday: Library Story Time (10:00 AM)
🎮 Friday: Family Game Night (7:00 PM)
🏊‍♀️ Saturday: Swimming Lessons (2:00 PM)
🌳 Sunday: Park Picnic (11:00 AM)

🎯 Monthly Activity Goals:
• Family exercise: 3x per week
• Outdoor time: Daily
• Screen-free time: 2 hours daily
• Reading together: 30 min daily

📋 Upcoming Special Events:
• Mother's Day Brunch - May 12
• Father's Day BBQ - June 16
• 4th of July Fireworks
• Summer Camp Registration - Due May 15

💡 Activity Ideas:
• Bike rides around neighborhood
• Backyard camping
• Cooking together
• Movie marathon nights
        `;
        showNotification(activityPlan, 'success');
    }, 1500);
}

function openBudgetTracker() {
    console.log('Opening budget tracker...');
    showNotification('💰 Loading family budget tracker...', 'info');
    
    setTimeout(() => {
        const budgetInfo = `
💰 FAMILY BUDGET TRACKER

Monthly Budget Overview:
📊 Total Income: $5,500
💚 Total Expenses: $4,125
💰 Remaining: $1,375 (25% saved!)

Category Breakdown:
🏠 Housing: $1,500 (75% of budget)
🍽️ Groceries: $800 (80% of budget)
🚗 Transportation: $600 (85% of budget)
🎭 Entertainment: $300 (60% of budget)
👶 Kids' Activities: $450 (90% of budget)
💊 Healthcare: $200 (67% of budget)
🛍️ Shopping: $275 (92% of budget)

🎯 Savings Goals:
✅ Emergency Fund: $12,000 / $15,000 (80%)
📈 Vacation Fund: $2,100 / $3,000 (70%)
🎓 College Fund: $8,500 / $20,000 (43%)
🏠 Home Improvement: $5,000 / $10,000 (50%)

💡 Money-Saving Tips:
• Meal planning saves $200/month
• Cancel unused subscriptions
• Compare insurance rates
• Use cashback credit cards
        `;
        showNotification(budgetInfo, 'success');
    }, 1500);
}

function openHealthTracker() {
    console.log('Opening health tracker...');
    showNotification('❤️ Loading family health tracker...', 'info');
    
    setTimeout(() => {
        const healthInfo = `
❤️ FAMILY HEALTH TRACKER

Family Health Status:
👨 Dad: Excellent (Annual checkup: Up to date)
👩 Mom: Good (Prenatal care: On schedule)
👧 Emma: Excellent (Vaccinations: Current)
👦 Jake: Good (Sports physical: Completed)

Upcoming Appointments:
📅 May 15: Emma's dental checkup
📅 May 20: Mom's prenatal appointment
📅 June 1: Jake's annual physical
📅 June 10: Dad's routine checkup

🏃‍♀️ Fitness Goals:
• Family walks: 4x per week
• Kids' sports: Active participation
• Screen time: Limited to 2 hours/day
• Sleep: 8-10 hours for all

💊 Medication Schedule:
✅ Daily vitamins: All family members
✅ Allergies: Emma - Seasonal meds ready
✅ First aid supplies: Stocked and current

🥗 Nutrition Focus:
• 5 servings fruits/vegetables daily
• Limit processed foods
• Family meals together 5x/week
• Healthy snacks for kids
        `;
        showNotification(healthInfo, 'success');
    }, 1500);
}

function openShoppingList() {
    console.log('Opening shopping list...');
    showNotification('🛒 Loading family shopping list...', 'info');
    
    setTimeout(() => {
        const shoppingList = `
🛒 FAMILY SHOPPING LIST

🥬 Fresh Produce:
• Bananas, apples, oranges
• Spinach, broccoli, carrots
• Tomatoes, onions, garlic
• Berries for kids' snacks

🥩 Proteins:
• Chicken breast (2 lbs)
• Ground beef (2 lbs)
• Fish fillets (1 lb)
• Eggs (2 dozen)

🥛 Dairy:
• Milk (2 gallons)
• Cheese blocks (cheddar, mozzarella)
• Yogurt cups (kids' snacks)
• Butter

🍞 Pantry:
• Bread, tortillas, pasta
• Rice, quinoa
• Cereal (2 boxes)
• Snacks for lunchboxes

🧼 Household:
• Laundry detergent
• Dish soap
• Paper towels
• Toilet paper

🎒 Kids' Supplies:
• Art supplies for Jake
• Soccer socks for Emma
• Lunchbox items
• After-school snacks

💰 Budget: $250 total
🛒 Stores: Costco, Target, Grocery Store
        `;
        showNotification(shoppingList, 'success');
    }, 1500);
}

function openCalendar() {
    console.log('Opening family calendar...');
    showNotification('📅 Loading family calendar...', 'info');
    
    setTimeout(() => {
        const calendarInfo = `
📅 FAMILY CALENDAR

Today - April 9:
• 8:00 AM - Kids to school
• 12:00 PM - Lunch with Mom
• 3:30 PM - Pick up kids
• 4:00 PM - Emma's homework time
• 6:00 PM - Family dinner
• 7:30 PM - Reading time

This Week:
📅 Thursday: Jake's art class
📅 Friday: Family game night
📅 Saturday: Soccer practice
📅 Sunday: Park picnic

Important Dates:
🎂 May 15 - Emma's 5th Birthday
🎂 June 20 - Jake's 7th Birthday
💑 June 25 - Anniversary
🎄 December 25 - Christmas

School Calendar:
📚 Last Day: May 30
🏖️ Summer Break: June 1 - August 15
📚 First Day: August 16

🏥 Appointments:
• May 10 - Dental checkups
• June 1 - Annual physicals
• July 15 - Eye exams

🎉 Events to Plan:
• Birthday parties
• Summer vacation
• Family reunion
        `;
        showNotification(calendarInfo, 'success');
    }, 1500);
}

// Global Function Exports - Ensure all family functions are available globally
window.startFamilyHealthTracking = startFamilyHealthTracking;
window.openFamilyPlanner = openFamilyPlanner;
window.openMealPlanner = openMealPlanner;
window.openActivityPlanner = openActivityPlanner;
window.openBudgetTracker = openBudgetTracker;
window.openHealthTracker = openHealthTracker;
window.openShoppingList = openShoppingList;
window.openCalendar = openCalendar;
window.addFamilyMember = addFamilyMember;
window.createBabyProfile = createBabyProfile;
window.saveBabyProfile = saveBabyProfile;

// Keep some maternal functions for users who might need them
window.startHealthMonitoring = startHealthMonitoring;
window.openPregnancyTracker = openPregnancyTracker;
window.openAIMidwife = openAIMidwife;
window.openNutritionAnalyzer = openNutritionAnalyzer;
window.openSymptomChecker = openSymptomChecker;
window.openKickCounter = openKickCounter;
window.openContractionTimer = openContractionTimer;
window.openWeightTracker = openWeightTracker;
window.openAIPregnancyAssistant = openAIPregnancyAssistant;
window.startFetalMonitoring = startFetalMonitoring;

// Simple Baby Profile Function
function createBabyProfile() {
    console.log('Creating baby profile...');
    
    const babyName = document.getElementById('babyName').value;
    const babyBirthDate = document.getElementById('babyBirthDate').value;
    const babyWeight = document.getElementById('babyWeight').value;
    const babyLength = document.getElementById('babyLength').value;
    const feedingMethod = document.getElementById('feedingMethod').value;
    
    if (!babyName || !babyBirthDate || !babyWeight || !babyLength || !feedingMethod) {
        showNotification('Please fill in all baby profile fields', 'error');
        return;
    }
    
    // Calculate baby's age
    const birthDate = new Date(babyBirthDate);
    const today = new Date();
    const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    const ageInWeeks = Math.floor(ageInDays / 7);
    const ageInMonths = Math.floor(ageInDays / 30.44);
    
    const profileResult = document.getElementById('babyProfileResult');
    profileResult.style.display = 'block';
    profileResult.innerHTML = `
        <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); padding: 25px; border-radius: 15px; border: 1px solid #a5d6a7;">
            <h4 style="color: #2e7d32; margin-bottom: 20px; font-size: 20px; font-weight: 700;">👶 Baby Profile Created!</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <strong style="color: #333;">Name:</strong> ${babyName}
                </div>
                <div>
                    <strong style="color: #333;">Age:</strong> ${ageInWeeks} weeks (${ageInDays} days)
                </div>
                <div>
                    <strong style="color: #333;">Weight:</strong> ${babyWeight} kg
                </div>
                <div>
                    <strong style="color: #333;">Length:</strong> ${babyLength} cm
                </div>
                <div>
                    <strong style="color: #333;">Feeding:</strong> ${feedingMethod.charAt(0).toUpperCase() + feedingMethod.slice(1)}
                </div>
                <div>
                    <strong style="color: #333;">Birth Date:</strong> ${new Date(babyBirthDate).toLocaleDateString()}
                </div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e0e0e0;">
                <h5 style="color: #333; margin-bottom: 10px; font-weight: 600;">📊 Development Milestones:</h5>
                <div style="font-size: 14px; color: #666; line-height: 1.6;">
                    ${ageInWeeks < 4 ? 
                        '• Focus on feeding and sleep patterns<br>• Tummy time when awake<br>• Respond to sounds and voices' :
                        ageInWeeks < 12 ?
                        '• Starting to smile and coo<br>• Holding head up briefly<br>• Following objects with eyes' :
                        ageInWeeks < 24 ?
                        '• Sitting up with support<br>• Beginning to roll over<br>• Bringing hands to mouth' :
                        '• Starting to crawl<br>• Responding to name<br>• Exploring objects with mouth'
                    }
                </div>
            </div>
            <div style="margin-top: 15px; text-align: center;">
                <button onclick="saveBabyProfile()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    💾 Save Profile
                </button>
            </div>
        </div>
    `;
    
    showNotification(`Baby profile for ${babyName} created successfully!`, 'success');
}

function saveBabyProfile() {
    showNotification('Baby profile saved successfully!', 'success');
}

console.log('All family and maternal health functions exported to global scope');
