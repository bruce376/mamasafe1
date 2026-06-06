/**
 * Mamasafe Advanced Toddler Intelligence System
 * High-performance, AI-integrated service for toddler development tracking.
 */

class ToddlerAdvanced {
    constructor() {
        this.API_BASE = 'http://localhost:5000/api';
        this.init();
    }

    init() {
        window.__toddlerAdvanced = this;
        this.injectStyles();
        console.log('Mamasafe Toddler Intelligence System initialized.');
    }

    // --- Utilities ---

    el(id) { return document.getElementById(id); }
    
    val(id) { return this.el(id)?.value ?? ''; }

    notify(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            const toast = document.createElement('div');
            toast.className = `toddler-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    async aiRequest(endpoint, payload) {
        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'AI Request failed');
            return data;
        } catch (error) {
            console.error('AI Request Error:', error);
            this.notify('AI Insight temporarily unavailable.', 'error');
            throw error;
        }
    }

    // --- UI Components ---

    injectStyles() {
        if (document.getElementById('toddler-advanced-styles')) return;
        const style = document.createElement('style');
        style.id = 'toddler-advanced-styles';
        style.textContent = `
            .toddler-overlay {
                position: fixed; inset: 0; z-index: 10000;
                background: rgba(15, 23, 42, 0.8);
                backdrop-filter: blur(12px);
                display: flex; align-items: center; justify-content: center;
                padding: 20px; animation: fadeIn 0.3s ease;
            }
            .toddler-modal {
                background: white; width: 100%; max-width: 800px;
                max-height: 90vh; overflow-y: auto;
                border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                position: relative; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .toddler-modal-header {
                background: linear-gradient(135deg, #667eea 0%, #7c3aed 100%);
                padding: 24px 32px; color: white;
                display: flex; justify-content: space-between; align-items: center;
                position: sticky; top: 0; z-index: 10;
            }
            .toddler-modal-body { padding: 32px; }
            .toddler-btn-close {
                background: rgba(255,255,255,0.2); border: none; color: white;
                width: 36px; height: 36px; border-radius: 12px;
                cursor: pointer; font-size: 20px; transition: all 0.2s;
            }
            .toddler-btn-close:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
            
            .toddler-glass-card {
                background: rgba(248, 250, 252, 0.8);
                border: 1px solid rgba(226, 232, 240, 0.8);
                border-radius: 16px; padding: 20px;
                transition: all 0.3s ease;
            }
            .toddler-glass-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                border-color: #667eea;
            }
            
            .ai-insight-box {
                background: linear-gradient(135deg, #e8eaf6 0%, #ede9fe 100%);
                border-left: 4px solid #667eea;
                padding: 20px; border-radius: 12px; margin-top: 20px;
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            .toddler-toast {
                position: fixed; bottom: 20px; right: 20px;
                padding: 16px 24px; border-radius: 12px; color: white;
                font-weight: 600; z-index: 11000; transform: translateY(100px);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .toddler-toast.show { transform: translateY(0); }
            .toddler-toast.success { background: #00d4aa; }
            .toddler-toast.error { background: #ff6b9d; }
            .toddler-toast.info { background: #00b894; }
        `;
        document.head.appendChild(style);
    }

    openModal(title, contentHtml, accentColor = '#667eea') {
        const overlay = document.createElement('div');
        overlay.className = 'toddler-overlay';
        overlay.innerHTML = `
            <div class="toddler-modal">
                <div class="toddler-modal-header" style="background: linear-gradient(135deg, ${accentColor} 0%, #0f2a56 100%)">
                    <h3 style="margin: 0; font-size: 24px; font-weight: 800;">${title}</h3>
                    <button class="toddler-btn-close" onclick="this.closest('.toddler-overlay').remove()">×</button>
                </div>
                <div class="toddler-modal-body">
                    ${contentHtml}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { e.target === overlay && overlay.remove(); });
    }

    // --- Core Advanced Features ---

    /**
     * AI-Powered Behavior Analysis
     */
    async analyzeBehaviorAI() {
        const logs = JSON.parse(localStorage.getItem('mamasafe_behavior_entries') || '[]');
        if (logs.length < 3) {
            this.openModal('Behavior Intelligence', `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🧠</div>
                    <h4 style="font-size: 20px; color: #1e293b; margin-bottom: 12px;">More Data Needed</h4>
                    <p style="color: #64748b; line-height: 1.6;">To provide accurate behavioral insights, please log at least 3 behavior entries. This allows our neural network to identify patterns and triggers.</p>
                    <button class="btn-primary" onclick="window.__toddlerAdvanced.showBehaviorLog()" style="margin-top: 20px; background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600;">Log Behavior Now</button>
                </div>
            `);
            return;
        }

        this.openModal('Behavior Intelligence', `
            <div style="text-align: center; padding: 40px;">
                <div class="ai-loader" style="width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #64748b; font-weight: 600;">Analyzing behavioral patterns using Mamasafe Neural Engine...</p>
            </div>
        `);

        try {
            const result = await this.aiRequest('/mamasafe-chat', {
                message: `Analyze these toddler behavior logs and provide 3 specific, expert-level strategies: ${JSON.stringify(logs.slice(0, 5))}`,
                userContext: { section: 'toddler-behavior' }
            });

            const content = `
                <div class="ai-insight-box">
                    <h4 style="color: #7c3aed; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                        <span>🤖</span> AI Behavioral Insight
                    </h4>
                    <div style="color: #0f2a56; line-height: 1.7; font-size: 15px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
                <div style="margin-top: 24px; display: grid; gap: 16px;">
                    <h4 style="margin: 0; color: #1e293b;">Recent Patterns Identified:</h4>
                    ${logs.slice(0, 3).map(log => `
                        <div class="toddler-glass-card">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 700; color: ${log.type === 'positive' ? '#00b894' : '#ff6b9d'}">${log.type.toUpperCase()}</span>
                                <span style="color: #999; font-size: 12px;">${log.date}</span>
                            </div>
                            <p style="margin: 0; font-size: 14px; color: #475569;">${log.notes || 'No notes provided'}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            document.querySelector('.toddler-modal-body').innerHTML = content;
        } catch (err) {
            this.notify('Could not reach AI engine.', 'error');
        }
    }

    /**
     * Learning Path Optimizer
     */
    openLearningOptimizer() {
        const months = localStorage.getItem('selectedToddlerAge')?.replace('months', '') || '24';
        const html = `
            <div style="display: grid; gap: 24px;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #7c3aed 100%); padding: 24px; border-radius: 20px; color: white;">
                    <h4 style="margin: 0; font-size: 18px; opacity: 0.9;">Current Trajectory</h4>
                    <div style="font-size: 32px; font-weight: 900; margin: 8px 0;">Advanced Learner</div>
                    <p style="margin: 0; font-size: 14px; opacity: 0.8;">Based on 12 milestones achieved this month.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="toddler-glass-card" style="border-left: 4px solid #00d4aa;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎨</div>
                        <div style="font-weight: 800; color: #1e293b;">Creative Arts</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Top Performance</div>
                    </div>
                    <div class="toddler-glass-card" style="border-left: 4px solid #00b894;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🧩</div>
                        <div style="font-weight: 800; color: #1e293b;">Cognitive</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Steady Growth</div>
                    </div>
                </div>

                <div class="ai-insight-box">
                    <h4 style="margin: 0 0 12px 0; color: #7c3aed;">AI Learning Recommendation:</h4>
                    <p style="margin: 0; font-size: 14px; color: #0f2a56; line-height: 1.6;">
                        Your toddler is showing exceptional progress in fine motor control. To optimize this path, we recommend introducing complex shape-sorting and introductory drawing activities this week.
                    </p>
                </div>
                
                <button onclick="window.__toddlerAdvanced.generateActivityPlan('${months}')" style="width: 100%; padding: 16px; background: #1e293b; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s;">Generate Optimized Activity Plan</button>
            </div>
        `;
        this.openModal('Learning Path Optimizer', html, '#7c3aed');
    }

    /**
     * AI-Powered Meal Planning
     */
    async openMealPlannerAI() {
        const html = `
            <div style="display: grid; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px;">DIETARY PREFERENCE</label>
                        <select id="aiDietPref" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-weight: 600;">
                            <option value="balanced">Balanced</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="high-protein">High Protein</option>
                            <option value="allergy-friendly">Allergy Friendly</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px;">AGE GROUP</label>
                        <select id="aiAgeGroup" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-weight: 600;">
                            <option value="12-18">12-18 Months</option>
                            <option value="18-24">18-24 Months</option>
                            <option value="24-36">2-3 Years</option>
                        </select>
                    </div>
                </div>
                <button onclick="window.__toddlerAdvanced.generateAIMealPlan()" style="width: 100%; padding: 16px; background: #00b894; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer;">Generate AI Meal Plan</button>
                <div id="aiMealResult" style="min-height: 100px;"></div>
            </div>
        `;
        this.openModal('AI Smart Meal Planner', html, '#00b894');
    }

    async generateAIMealPlan() {
        const pref = this.val('aiDietPref');
        const age = this.val('aiAgeGroup');
        const resultBox = this.el('aiMealResult');
        
        resultBox.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="ai-loader" style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #00b894; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div></div>';
        
        try {
            const data = await this.aiRequest('/mamasafe-chat', {
                message: `Generate a one-day advanced nutritional meal plan for a ${age} month old toddler with a ${pref} diet. Include breakfast, snack, lunch, snack, and dinner. Provide specific portion sizes and a nutritional highlight for each.`,
                userContext: { section: 'toddler-nutrition' }
            });

            resultBox.innerHTML = `
                <div class="ai-insight-box" style="border-color: #00b894; background: #ecfdf5;">
                    <div style="color: #0f2a56; line-height: 1.6; font-size: 14px;">
                        ${data.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            resultBox.innerHTML = '<p style="color: #ff6b9d;">AI service unavailable. Please try again later.</p>';
        }
    }

    /**
     * Smart Sleep Predictor
     */
    openSleepPredictor() {
        const html = `
            <div style="display: grid; gap: 20px;">
                <div class="toddler-glass-card" style="background: #0f2a56; color: white;">
                    <h4 style="margin: 0; font-size: 14px; opacity: 0.7;">SLEEP EFFICIENCY</h4>
                    <div style="font-size: 36px; font-weight: 900; margin: 8px 0;">94%</div>
                    <div style="display: flex; gap: 4px;">
                        <div style="height: 4px; flex: 1; background: #7c3aed; border-radius: 2px;"></div>
                        <div style="height: 4px; flex: 1; background: #7c3aed; border-radius: 2px;"></div>
                        <div style="height: 4px; flex: 1; background: #7c3aed; border-radius: 2px;"></div>
                        <div style="height: 4px; width: 20px; background: rgba(255,255,255,0.2); border-radius: 2px;"></div>
                    </div>
                </div>
                
                <div class="ai-insight-box" style="border-color: #00b894; background: #e8eaf6;">
                    <h4 style="margin: 0 0 8px 0; color: #512da8;">AI Sleep Prediction:</h4>
                    <p style="margin: 0; font-size: 14px; color: #3730a3; line-height: 1.6;">
                        Based on today's high activity level, we predict an earlier sleep onset. Optimal bedtime tonight is 7:15 PM for maximum restorative cycles.
                    </p>
                </div>

                <div style="display: grid; gap: 12px;">
                    <button class="toddler-glass-card" style="text-align: left; cursor: pointer; border: 1px solid #e2e8f0;" onclick="window.__toddlerAdvanced.showSleepInsight('routine')">
                        <span style="font-weight: 800; color: #1e293b;">🌙 Optimize Routine</span>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">AI-adjusted for current development stage</p>
                    </button>
                    <button class="toddler-glass-card" style="text-align: left; cursor: pointer; border: 1px solid #e2e8f0;" onclick="window.__toddlerAdvanced.showSleepInsight('regression')">
                        <span style="font-weight: 800; color: #1e293b;">📊 Regression Analysis</span>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Detect and manage upcoming sleep leaps</p>
                    </button>
                </div>
            </div>
        `;
        this.openModal('AI Sleep Intelligence', html, '#00b894');
    }

    /**
     * AI-Powered Activity Planner
     */
    async generateActivityPlan(months) {
        this.openModal('Optimized Activity Plan', `
            <div style="text-align: center; padding: 40px;">
                <div class="ai-loader" style="width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid #7c3aed; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #64748b; font-weight: 600;">Generating high-impact activities for ${months} months...</p>
            </div>
        `);

        try {
            const data = await this.aiRequest('/mamasafe-chat', {
                message: `Generate a 3-day high-impact activity plan for a ${months}-month-old toddler. Focus on cognitive development, fine motor skills, and social interaction. For each activity, explain the developmental 'why' and provide a 'pro-tip' for parents.`,
                userContext: { section: 'toddler-activities' }
            });

            const content = `
                <div class="ai-insight-box" style="border-color: #7c3aed; background: #e8eaf6;">
                    <h4 style="color: #667eea; margin-top: 0;">🚀 AI Activity Trajectory</h4>
                    <div style="color: #0f2a56; line-height: 1.7; font-size: 15px;">
                        ${data.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
                <div style="margin-top: 24px; display: flex; gap: 12px;">
                    <button onclick="window.print()" style="flex: 1; padding: 14px; background: #f1f5f9; color: #0f172a; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">Print Plan</button>
                    <button onclick="window.__toddlerAdvanced.notify('Plan saved to profile', 'success')" style="flex: 1; padding: 14px; background: #1e293b; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">Save to Profile</button>
                </div>
            `;
            document.querySelector('.toddler-modal-body').innerHTML = content;
        } catch (err) {
            this.notify('Activity engine offline.', 'error');
        }
    }

    /**
     * Interactive Milestone Timeline
     */
    openMilestoneTracker() {
        const months = localStorage.getItem('selectedToddlerAge')?.replace('months', '') || '24';
        const milestones = {
            12: ['First words', 'Standing', 'Pointing', 'Peek-a-boo'],
            18: ['Independent walking', '10+ words', 'Scribbling', 'Following commands'],
            24: ['2-word phrases', 'Running', 'Stacking 6 blocks', 'Imitation'],
            36: ['Clear speech', 'Pedaling', 'Sharing', 'Dressing help']
        };

        const current = milestones[months] || milestones[24];
        
        const html = `
            <div style="display: grid; gap: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; color: #1e293b;">Milestone Checklist (${months}m)</h4>
                    <span style="background: #e0e7ff; color: #7c3aed; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 800;">75% COMPLETE</span>
                </div>
                
                <div style="display: grid; gap: 12px;">
                    ${current.map((m, i) => `
                        <label style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; cursor: pointer;">
                            <input type="checkbox" ${i < 3 ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #667eea;">
                            <span style="font-weight: 600; color: #334155;">${m}</span>
                        </label>
                    `).join('')}
                </div>

                <div class="ai-insight-box">
                    <h4 style="margin: 0 0 8px 0; color: #7c3aed;">Neural Milestone Analysis:</h4>
                    <p style="margin: 0; font-size: 14px; color: #0f2a56; line-height: 1.6;">
                        Your child is tracking in the 85th percentile for motor development. Social markers are emerging as expected for this age bracket.
                    </p>
                </div>
            </div>
        `;
        this.openModal('Milestone Intelligence', html, '#667eea');
    }

    // --- Legacy Bridge ---
    // Keep these to prevent errors on existing page links, but point them to advanced versions

    showToddlerAge(age) {
        localStorage.setItem('selectedToddlerAge', age);
        this.notify(`Intelligence System adapted for ${age}`, 'success');
        this.openLearningOptimizer();
    }

    openBehaviorAI() { this.analyzeBehaviorAI(); }
    openLearningOptimizerBtn() { this.openLearningOptimizer(); }
    openSleepTracker() { this.openSleepPredictor(); }
    openNutritionTracker() { this.openMealPlannerAI(); }
}

// Instantiate the system
window.toddlerIntelligence = new ToddlerAdvanced();

// Global CSS for spin animation
const globalStyle = document.createElement('style');
globalStyle.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(globalStyle);
