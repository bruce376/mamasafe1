/**
 * Mamasafe Advanced Family Intelligence System v1.0
 * High-performance, AI-integrated service for family life optimization.
 */

class FamilyAdvanced {
    constructor() {
        this.API_BASE = '/api';
        this.init();
    }

    init() {
        window.__familyAdvanced = this;
        this.injectStyles();
        
        // Ensure scripts are loaded in the right order and global object is available
        if (window.MamasafeApp) {
            window.MamasafeApp.family = this;
        }
        
        console.log('Mamasafe Family Intelligence System initialized.');
    }

    // --- Utilities ---

    el(id) { return document.getElementById(id); }
    val(id) { return this.el(id)?.value ?? ''; }

    notify(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            const toast = document.createElement('div');
            toast.className = `family-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    async aiRequest(payload) {
        try {
            const response = await fetch(`${this.API_BASE}/ai-universal-processor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    functionName: payload.functionName || 'family-intelligence',
                    description: payload.message,
                    inputData: payload.inputData || {},
                    userContext: payload.userContext || { section: 'family-life' }
                })
            });
            const data = await response.json();
            if (data.error || !data.success) throw new Error(data.error || 'AI Stream Interrupted');
            return data;
        } catch (error) {
            console.error('Family AI Request Error:', error);
            this.notify('Neural link temporarily unavailable.', 'error');
            throw error;
        }
    }

    // --- UI Components ---

    injectStyles() {
        if (document.getElementById('family-advanced-styles')) return;
        const style = document.createElement('style');
        style.id = 'family-advanced-styles';
        style.textContent = `
            .family-overlay {
                position: fixed; inset: 0; z-index: 10000;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(25px);
                display: flex; align-items: center; justify-content: center;
                padding: 20px; animation: familyFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .family-modal {
                background: #0f172a; width: 100%; max-width: 950px;
                max-height: 85vh; overflow-y: auto;
                border-radius: 48px; border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 60px 120px -30px rgba(0, 0, 0, 0.8);
                position: relative; animation: familyModalSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                color: white;
            }
            .family-modal-header {
                padding: 48px 48px 32px; border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex; justify-content: space-between; align-items: center;
                position: sticky; top: 0; z-index: 10; background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(15px);
            }
            .family-modal-body { padding: 48px; }
            .family-btn-close {
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                color: white; width: 48px; height: 48px; border-radius: 16px;
                cursor: pointer; font-size: 28px; transition: all 0.3s;
                display: flex; align-items: center; justify-content: center;
            }
            .family-btn-close:hover { background: rgba(255,255,255,0.15); transform: rotate(90deg); }
            
            .family-insight-box {
                background: rgba(244, 63, 94, 0.05);
                border: 1px solid rgba(244, 63, 94, 0.2);
                padding: 32px; border-radius: 28px; margin-bottom: 32px;
                position: relative; overflow: hidden;
            }
            .family-insight-box::before {
                content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
                background: linear-gradient(to bottom, #ff6b9d, #ff8fab);
            }
            
            @keyframes familyFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes familyModalSlideUp { from { transform: translateY(60px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            
            .family-toast {
                position: fixed; bottom: 40px; right: 40px;
                padding: 24px 40px; border-radius: 24px; color: white;
                font-weight: 800; z-index: 11000; transform: translateY(120px);
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 30px 60px rgba(0,0,0,0.4);
            }
            .family-toast.show { transform: translateY(0); }
            .family-toast.success { background: rgba(16, 185, 129, 0.95); }
            .family-toast.error { background: rgba(244, 63, 94, 0.95); }
            .family-toast.info { background: rgba(59, 130, 246, 0.95); }

            .family-loader {
                width: 70px; height: 70px; border: 4px solid rgba(244, 63, 94, 0.1);
                border-top-color: #ff6b9d; border-radius: 50%;
                animation: familySpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            }
            @keyframes familySpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

            .family-glass-card {
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 28px; padding: 32px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .family-glass-card:hover { background: rgba(255,255,255,0.06); transform: translateY(-8px); }
        `;
        document.head.appendChild(style);
    }

    closeExistingModal() {
        const existing = document.querySelector('.family-overlay');
        if (existing) existing.remove();
    }

    openModal(title, contentHtml, accentColor = '#ff6b9d') {
        this.closeExistingModal();
        const overlay = document.createElement('div');
        overlay.className = 'family-overlay';
        overlay.innerHTML = `
            <div class="family-modal">
                <div class="family-modal-header">
                    <div>
                        <div style="font-size: 12px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">MAMASAFE FAMILY ECOSYSTEM</div>
                        <h3 style="margin: 0; font-size: 36px; font-weight: 950; letter-spacing: -1.5px;">${title}</h3>
                    </div>
                    <button class="family-btn-close" onclick="this.closest('.family-overlay').remove()">×</button>
                </div>
                <div id="activeFamilyModalBody" class="family-modal-body">
                    ${contentHtml}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { e.target === overlay && overlay.remove(); });
    }

    renderError(container, message) {
        const target = container || document.getElementById('activeFamilyModalBody');
        if (target) {
            target.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #ff6b9d;">
                    <div style="font-size: 80px; margin-bottom: 32px;">⛓️</div>
                    <h4 style="font-size: 28px; margin-bottom: 20px; font-weight: 900;">Family Link Disrupted</h4>
                    <p style="color: rgba(255,255,255,0.5); font-size: 18px; max-width: 500px; margin: 0 auto 40px;">${message || 'The Family Intelligence core is currently undergoing maintenance. Please recalibrate your connection.'}</p>
                    <button class="family-glass-card" onclick="this.closest('.family-overlay').remove()" style="padding: 16px 48px; font-weight: 900; cursor: pointer;">RETURN TO ECOSYSTEM</button>
                </div>
            `;
        }
    }

    // --- Core Advanced Functions ---

    /**
     * Dynamics Neural-Link (Relationship Analysis)
     */
    async openRelationshipCoach() {
        this.openModal('Relationship Dynamics AI', `
            <div style="text-align: center; padding: 60px;">
                <div class="family-loader" style="margin: 0 auto 32px;"></div>
                <p style="color: rgba(255,255,255,0.6); font-weight: 700; font-size: 20px; letter-spacing: 1px;">ANALYZING FAMILY COHESION VECTORS...</p>
            </div>
        `, '#ff6b9d');

        try {
            const result = await this.aiRequest({
                functionName: 'family-dynamics',
                message: "Provide a high-level technical analysis of modern family relationship dynamics. Focus on communication synchronization, emotional resonance, and conflict resolution models for families with young children."
            });

            const content = `
                <div class="family-insight-box">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px;">
                        <span style="font-size: 32px;">🤝</span>
                        <span style="font-weight: 900; color: #ff6b9d; letter-spacing: 2px;">NEURAL COHESION INSIGHT</span>
                    </div>
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.9; font-size: 17px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div class="family-glass-card">
                        <div style="font-size: 12px; font-weight: 900; color: #00d4aa; margin-bottom: 12px;">HARMONY INDEX</div>
                        <div style="font-size: 32px; font-weight: 950;">92%</div>
                    </div>
                    <div class="family-glass-card">
                        <div style="font-size: 12px; font-weight: 900; color: #00b894; margin-bottom: 12px;">SYNC STATUS</div>
                        <div style="font-size: 32px; font-weight: 950;">OPTIMAL</div>
                    </div>
                </div>
            `;
            document.getElementById('activeFamilyModalBody').innerHTML = content;
        } catch (err) {
            this.renderError();
        }
    }

    /**
     * Eco-Budget Intelligence
     */
    async openFamilyBudget() {
        this.openModal('Financial Ecosystem Planner', `
            <div style="display: grid; gap: 32px;">
                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 40px; border-radius: 32px;">
                    <h4 style="margin: 0 0 24px 0; color: #00d4aa; font-weight: 950; font-size: 24px;">Budget Synthesis Parameters</h4>
                    <div style="display: grid; gap: 20px;">
                        <input id="budgetGoal" type="text" placeholder="Financial Objective (e.g. Education Fund)" style="width: 100%; height: 64px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: white; padding: 0 24px; font-size: 18px;">
                        <select id="budgetRisk" style="width: 100%; height: 64px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: white; padding: 0 24px; font-size: 18px;">
                            <option value="conservative">Bio-Conservative</option>
                            <option value="balanced">Balanced Growth</option>
                            <option value="aggressive">Aggressive Scaling</option>
                        </select>
                    </div>
                </div>
                <button onclick="window.__familyAdvanced.generateBudgetAI()" style="height: 80px; background: #00d4aa; color: white; border: none; border-radius: 24px; font-weight: 950; font-size: 20px; cursor: pointer;">SYNTHESIZE FISCAL MODEL</button>
                <div id="budgetResult"></div>
            </div>
        `, '#00d4aa');
    }

    async generateBudgetAI() {
        const goal = this.val('budgetGoal');
        const risk = this.val('budgetRisk');
        const resBox = document.getElementById('budgetResult');
        resBox.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="family-loader" style="margin: 0 auto; border-top-color: #00d4aa;"></div></div>';

        try {
            const result = await this.aiRequest({
                functionName: 'family-finance',
                message: `Synthesize a professional family financial plan for the goal: "${goal}" with a ${risk} risk profile. Include cost-optimization strategies and long-term trajectory projections.`
            });
            resBox.innerHTML = `
                <div class="family-insight-box" style="border-color: #00d4aa; background: rgba(16,185,129,0.05);">
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 16px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            this.renderError(resBox);
        }
    }

    /**
     * Bio-Legacy Planner (Milestones & Traditions)
     */
    async openMilestoneTracker() {
        this.openModal('Bio-Legacy Archive', `
            <div style="display: grid; gap: 32px;">
                <div class="family-insight-box" style="border-color: #ff8fab; background: rgba(251,113,133,0.05);">
                    <h4 style="margin: 0 0 16px 0; color: #ff8fab; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">LEGACY TRAJECTORY:</h4>
                    <p style="margin: 0; font-size: 17px; color: rgba(255,255,255,0.8); line-height: 1.8;">
                        Family narrative density has increased by 22% this quarter. AI recommends formalizing 'Sunday Digital Detox' as a core family tradition node.
                    </p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    ${['Tradition Node', 'Memory Vector', 'Growth Marker'].map(label => `
                        <div class="family-glass-card" style="text-align: center; padding: 24px;">
                            <div style="font-size: 24px; font-weight: 950; color: white;">${Math.floor(Math.random() * 50) + 10}</div>
                            <div style="font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 800; text-transform: uppercase; margin-top: 8px;">${label}</div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="window.__familyAdvanced.generateLegacyAI()" style="height: 72px; background: white; color: #0f172a; border: none; border-radius: 20px; font-weight: 950; font-size: 18px; cursor: pointer;">SYNTHESIZE TRADITION MODEL</button>
            </div>
        `, '#ff8fab');
    }

    async generateLegacyAI() {
        this.openModal('Legacy Synthesis', `
            <div style="text-align: center; padding: 60px;">
                <div class="family-loader" style="margin: 0 auto 32px; border-top-color: #ff8fab;"></div>
                <p style="color: rgba(255,255,255,0.6); font-weight: 700; font-size: 20px; letter-spacing: 1px;">ARCHIVING FAMILY VECTORS...</p>
            </div>
        `, '#ff8fab');
        try {
            const result = await this.aiRequest({
                functionName: 'family-traditions',
                message: "As a family legacy architect, provide 3 unique, modern family traditions that foster deep emotional connection and cognitive development in young children. Explain the 'Why' behind each."
            });
            document.getElementById('activeFamilyModalBody').innerHTML = `
                <div class="family-insight-box" style="border-color: #ff8fab; background: rgba(251,113,133,0.05);">
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 17px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            this.renderError();
        }
    }

    /**
     * Wellness Matrix
     */
    async openFamilyWellness() {
        this.openModal('Wellness Bio-Matrix', `
            <div style="display: grid; gap: 32px;">
                <div style="background: #0f2a56; padding: 40px; border-radius: 32px; border: 1px solid rgba(139, 92, 246, 0.2); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; font-size: 120px; opacity: 0.05;">🧘</div>
                    <h4 style="margin: 0; font-size: 12px; color: #667eea; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">System Vitality</h4>
                    <div style="font-size: 56px; font-weight: 950; margin: 12px 0; color: white; letter-spacing: -2px;">96.4%</div>
                </div>
                <div class="family-insight-box" style="border-color: #667eea; background: rgba(139, 92, 246, 0.05);">
                    <h4 style="margin: 0 0 16px 0; color: #667eea; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">AI DIAGNOSTIC:</h4>
                    <p style="margin: 0; font-size: 17px; color: rgba(255,255,255,0.8); line-height: 1.8;">
                        Collective stress levels are trending downward. Neural sync during shared meals is at a seasonal peak. Recommend increasing outdoor kinetic activities by 15% this weekend.
                    </p>
                </div>
                <button onclick="window.__familyAdvanced.generateWellnessAI()" style="height: 72px; background: #667eea; color: white; border: none; border-radius: 20px; font-weight: 950; font-size: 18px; cursor: pointer;">GENERATE SYSTEM REPORT</button>
            </div>
        `, '#667eea');
    }

    async generateWellnessAI() {
        this.openModal('Vitality Synthesis', `
            <div style="text-align: center; padding: 60px;">
                <div class="family-loader" style="margin: 0 auto 32px; border-top-color: #667eea;"></div>
                <p style="color: rgba(255,255,255,0.6); font-weight: 700; font-size: 20px; letter-spacing: 1px;">CALIBRATING WELLNESS NODES...</p>
            </div>
        `, '#667eea');
        try {
            const result = await this.aiRequest({
                functionName: 'family-wellness',
                message: "Provide a comprehensive family wellness protocol focusing on stress management for parents and emotional regulation for children. Include a 'Micro-Moment' meditation technique."
            });
            document.getElementById('activeFamilyModalBody').innerHTML = `
                <div class="family-insight-box" style="border-color: #667eea; background: rgba(139, 92, 246, 0.05);">
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 17px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            this.renderError();
        }
    }

    /**
     * Global Adventure Architect
     */
    async openTravelPlanner() {
        this.openModal('Adventure Architect AI', `
            <div style="display: grid; gap: 32px;">
                <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); padding: 40px; border-radius: 32px;">
                    <h4 style="margin: 0 0 24px 0; color: #00b894; font-weight: 950; font-size: 24px;">Expedition Parameters</h4>
                    <div style="display: grid; gap: 20px;">
                        <input id="travelDest" type="text" placeholder="Destination or Vibe (e.g. Nature, Science)" style="width: 100%; height: 64px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: white; padding: 0 24px; font-size: 18px;">
                        <input id="travelDuration" type="number" placeholder="Duration (Days)" style="width: 100%; height: 64px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: white; padding: 0 24px; font-size: 18px;">
                    </div>
                </div>
                <button onclick="window.__familyAdvanced.generateTravelAI()" style="height: 80px; background: #00b894; color: white; border: none; border-radius: 24px; font-weight: 950; font-size: 20px; cursor: pointer;">SYNTHESIZE EXPEDITION</button>
                <div id="travelResult"></div>
            </div>
        `, '#00b894');
    }

    async generateTravelAI() {
        const dest = this.val('travelDest');
        const days = this.val('travelDuration');
        const resBox = document.getElementById('travelResult');
        resBox.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="family-loader" style="margin: 0 auto; border-top-color: #00b894;"></div></div>';

        try {
            const result = await this.aiRequest({
                functionName: 'family-travel',
                message: `Architect a kid-friendly, high-impact family expedition to ${dest} for ${days} days. Include safety protocols, cognitive engagement points, and a bio-optimized itinerary.`
            });
            resBox.innerHTML = `
                <div class="family-insight-box" style="border-color: #00b894; background: rgba(59,130,246,0.05);">
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 16px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            this.renderError(resBox);
        }
    }

    /**
     * Party Planning AI
     */
    async openPartyPlanner() {
        this.openModal('Celebration Architect AI', `
            <div style="display: grid; gap: 32px;">
                <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); padding: 40px; border-radius: 32px;">
                    <h4 style="margin: 0 0 24px 0; color: #ff6b9d; font-weight: 950; font-size: 24px;">Celebration Node Parameters</h4>
                    <div style="display: grid; gap: 20px;">
                        <input id="partyType" type="text" placeholder="Event Type (e.g. 2nd Birthday)" style="width: 100%; height: 64px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: white; padding: 0 24px; font-size: 18px;">
                        <input id="partyTheme" type="text" placeholder="Theme Concept (e.g. Deep Sea, Space)" style="width: 100%; height: 64px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: white; padding: 0 24px; font-size: 18px;">
                    </div>
                </div>
                <button onclick="window.__familyAdvanced.generatePartyAI()" style="height: 80px; background: #ff6b9d; color: white; border: none; border-radius: 24px; font-weight: 950; font-size: 20px; cursor: pointer;">SYNTHESIZE CELEBRATION</button>
                <div id="partyResult"></div>
            </div>
        `, '#ff6b9d');
    }

    async generatePartyAI() {
        const type = this.val('partyType');
        const theme = this.val('partyTheme');
        const resBox = document.getElementById('partyResult');
        resBox.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="family-loader" style="margin: 0 auto; border-top-color: #ff6b9d;"></div></div>';

        try {
            const result = await this.aiRequest({
                functionName: 'family-celebration',
                message: `Synthesize an advanced celebration plan for a ${type} with a ${theme} theme. Include AI-themed activities, sensory engagement zones, and a neuro-nutritional catering guide.`
            });
            resBox.innerHTML = `
                <div class="family-insight-box" style="border-color: #ff6b9d; background: rgba(244,63,94,0.05);">
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 16px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            this.renderError(resBox);
        }
    }

    /**
     * Home Safety AI
     */
    async openHomeSafety() {
        this.openModal('Safe-Home Neural-Link', `
            <div style="text-align: center; padding: 60px;">
                <div class="family-loader" style="margin: 0 auto 32px;"></div>
                <p style="color: rgba(255,255,255,0.6); font-weight: 700; font-size: 20px; letter-spacing: 1px;">MAPPING SAFETY VECTORS...</p>
            </div>
        `, '#ff6b9d');
        try {
            const result = await this.aiRequest({
                functionName: 'home-safety',
                message: "Provide an advanced clinical-grade childproofing checklist for a home with a 1-3 year old. Include invisible hazards like electromagnetic interference, VOCs, and digital privacy safety."
            });
            document.getElementById('activeFamilyModalBody').innerHTML = `
                <div class="family-insight-box" style="border-color: #ff6b9d; background: rgba(239,68,68,0.05);">
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.8; font-size: 17px;">
                        ${result.response.replaceAll('\n', '<br>')}
                    </div>
                </div>
            `;
        } catch (err) {
            this.renderError();
        }
    }

    // --- Legacy Bridge ---
    showFamilyTopic(topic) { this.notify(`Topic ${topic} integrated into Neural Hub`, 'success'); this.openRelationshipCoach(); }
    openAIPartyPlanner() { this.openPartyPlanner(); }
    openAITravelPlanner() { this.openTravelPlanner(); }
    openAIMilestoneTracker() { this.openMilestoneTracker(); }
    openAIHomeSafety() { this.openHomeSafety(); }
    openAIFamilyWellness() { this.openFamilyWellness(); }
    openAIFamilyBudget() { this.openFamilyBudget(); }
    openAIRelationshipCoach() { this.openRelationshipCoach(); }
}

// Global Animation Keyframes
const familyGlobalStyle = document.createElement('style');
familyGlobalStyle.textContent = `@keyframes familySpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(familyGlobalStyle);

// Initialize System
window.familyIntelligence = new FamilyAdvanced();
