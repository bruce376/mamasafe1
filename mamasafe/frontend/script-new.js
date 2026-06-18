// ==========================================
// MAMASAFE APPLICATION - CONSOLIDATED SCRIPT
// ==========================================
// This file contains all JavaScript functions for Mamasafe application

(function configureMamasafeBackend() {
    if (window.MAMASAFE_BACKEND_ORIGIN && window.MAMASAFE_API_BASE && window.mamasafeApiUrl) {
        return;
    }

    const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
    const renderBackendOrigin = 'https://mamasafe1.onrender.com';
    const host = window.location.hostname;
    const isLocal = localHosts.has(host);
    const isRenderBackend = host === 'mamasafe1.onrender.com';
    const isFirebaseHosting = host.endsWith('.web.app') || host.endsWith('.firebaseapp.com') || host.includes('firebase');
    const currentOrigin = window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : '';
    const backendOrigin = isLocal
        ? (window.location.port === '5000'
            ? currentOrigin
            : (window.MAMASAFE_BACKEND_ORIGIN || `${window.location.protocol}//${host}:5000`))
        : isRenderBackend
            ? window.location.origin
            : isFirebaseHosting
                ? renderBackendOrigin
                : (window.MAMASAFE_BACKEND_ORIGIN || window.location.origin);

    window.MAMASAFE_BACKEND_ORIGIN = backendOrigin.replace(/\/$/, '');
    window.MAMASAFE_API_BASE = `${window.MAMASAFE_BACKEND_ORIGIN}/api`;
    window.mamasafeApiUrl = window.mamasafeApiUrl || function mamasafeApiUrl(path) {
        const normalized = String(path || '').startsWith('/') ? String(path) : `/${path || ''}`;
        return `${window.MAMASAFE_BACKEND_ORIGIN}${normalized}`;
    };
    window.BACKEND_API = window.BACKEND_API || {
        getBaseUrl() {
            return window.MAMASAFE_BACKEND_ORIGIN;
        }
    };
})();

// ==========================================
// DARK MODE TOGGLE FUNCTION
// ==========================================
function toggleDarkMode() {
    const body = document.body;
    
    // Handle navigation toggle
    const navToggle = document.getElementById('darkModeToggleNav');
    const navIcon = navToggle ? navToggle.querySelector('.toggle-icon-nav') : null;
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        if (navIcon) navIcon.textContent = '\u2600\uFE0F';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        if (navIcon) navIcon.textContent = '\u{1F319}';
        localStorage.setItem('darkMode', 'disabled');
    }

    document.dispatchEvent(new CustomEvent('mamasafe:themechange', {
        detail: { darkMode: body.classList.contains('dark-mode') }
    }));
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        
        // Update navigation toggle
        const navIcon = document.querySelector('#darkModeToggleNav .toggle-icon-nav');
        if (navIcon) navIcon.textContent = '\u2600\uFE0F';
    }
}

// Initialize dark mode globally (for all pages)
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
});

// ==========================================
// AUTHENTICATION CONFIGURATION
// ==========================================
window.MamasafeAuth = {
    currentUser: null,
    backendEnabled: localStorage.getItem('mamasafe_backend_sync') === 'enabled' || window.location.port === '5000',
    
    async checkAuthStatus() {
        if (!this.backendEnabled) {
            this.currentUser = null;
            this.updateUI();
            return null;
        }

        try {
            const response = await fetch(window.mamasafeApiUrl('/api/auth/user'));
            const data = await response.json();
            this.currentUser = data.user;
            this.updateUI();
            return this.currentUser;
        } catch (error) {
            this.backendEnabled = false;
            console.info('Auth backend unavailable; continuing in offline demo mode.');
            return null;
        }
    },
    
    async logout() {
        try {
            await fetch('/auth/logout');
            this.currentUser = null;
            window.location.href = '/auth.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    },
    
    updateUI() {
        if (this.currentUser) {
            // Show user info and logout button
            document.querySelectorAll('.auth-required').forEach(el => {
                el.style.display = 'block';
            });
            document.querySelectorAll('.auth-guest').forEach(el => {
                el.style.display = 'none';
            });
            
            // Update user display with role badge
            const userDisplay = document.getElementById('userDisplay');
            if (userDisplay) {
                const roleBadge = this.getRoleBadge(this.currentUser.role);
                userDisplay.innerHTML = `
                    <img src="${this.currentUser.photo}" alt="Profile" style="width: 30px; height: 30px; border-radius: 50%;">
                    <span>${this.currentUser.displayName}</span>
                    ${roleBadge}
                    <button onclick="MamasafeAuth.logout()" style="background: none; border: none; color: #667eea; cursor: pointer;">Logout</button>
                `;
            }
            
            // Customize experience based on role
            this.customizeUserExperience();
        } else {
            // Show login button
            document.querySelectorAll('.auth-required').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.auth-guest').forEach(el => {
                el.style.display = 'block';
            });
        }
    },
    
    getRoleBadge(role) {
        const badges = {
            'admin': '<span style="background: #ff4757; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">Admin</span>',
            'healthcare_provider': '<span style="background: #00b894; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">Provider</span>',
            'user': '<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">User</span>'
        };
        return badges[role] || badges['user'];
    },
    
    customizeUserExperience() {
        const role = this.currentUser.role || 'user';
        
        // Show/hide features based on role
        const adminFeatures = document.querySelectorAll('.admin-only');
        const providerFeatures = document.querySelectorAll('.provider-only');
        const userFeatures = document.querySelectorAll('.user-only');
        
        adminFeatures.forEach(el => {
            el.style.display = role === 'admin' ? 'block' : 'none';
        });
        
        providerFeatures.forEach(el => {
            el.style.display = role === 'healthcare_provider' || role === 'admin' ? 'block' : 'none';
        });
        
        userFeatures.forEach(el => {
            el.style.display = 'block'; // Always show for all users
        });
        
        // Load user profile data from backend
        this.loadUserProfileFromBackend();
    },
    
    async loadUserProfileFromBackend() {
        try {
            const response = await fetch(window.mamasafeApiUrl('/api/user/profile'));
            const data = await response.json();
            if (data.profile) {
                // Update MamasafeAI with user's saved preferences
                if (window.MamasafeAI) {
                    window.MamasafeAI.userProfile = {
                        ...window.MamasafeAI.userProfile,
                        ...data.profile.preferences,
                        healthData: data.profile.healthData || {}
                    };
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    },
    
    async saveUserProfileToBackend(preferences, healthData) {
        try {
            const response = await fetch(window.mamasafeApiUrl('/api/user/profile'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ preferences, healthData })
            });
            
            if (response.ok) {
                showNotification('Profile saved successfully!', 'success');
            } else {
                throw new Error('Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving user profile:', error);
            showNotification('Failed to save profile', 'error');
        }
    }
};

// ==========================================
// GLOBAL AI ASSISTANT CONFIGURATION
// ==========================================
window.MamasafeAI = {
    initialized: false,
    context: {},
    userProfile: {},
    chatHistory: [],
    capabilities: [
        'pregnancy_advice', 'pregnancy_tracking', 'course_guidance',
        'health_monitoring', 'nutrition_planning', 
        
    ],
    
    async initialize(options = {}) {
        if (this.initialized) return;
        
        if (!options.skipAuthCheck) {
            await MamasafeAuth.checkAuthStatus();
        }
        
        this.loadUserProfile();
        this.loadChatHistory();
        this.initializeChatInterface();
        this.startContextMonitoring();
        this.initialized = true;
        
        console.log('🤖 Mamasafe assistant AI initialized');
        if (!options.silent && typeof showNotification === 'function') {
            showNotification('Mamasafe assistant AI ready to help!', 'success');
        }
    },
    
    loadUserProfile: function() {
        const savedProfile = localStorage.getItem('mamasafe_ai_profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        } else {
            this.userProfile = {
                pregnancyStage: null,
                preferences: {},
                healthData: {}
            };
        }
    },
    
    saveUserProfile: function() {
        localStorage.setItem('mamasafe_ai_profile', JSON.stringify(this.userProfile));
    },
    
    initializeChatInterface: function() {
        // Create small floating AI assistant widget
        const aiWidget = document.createElement('div');
        aiWidget.id = 'mamasafe-ai-widget';
        aiWidget.innerHTML = `
            <div class="ai-widget-small" id="ai-widget-small" onclick="MamasafeAI.openFullscreen()">
                <div class="ai-widget-icon">🤖</div>
                <div class="ai-widget-text">Mamasafe AI</div>
                <div class="ai-widget-pulse"></div>
            </div>
            
            <!-- Full-screen Mamasafe assistant AI -->
            <div class="ai-fullscreen" id="ai-fullscreen" style="display: none;">
                <div class="ai-fullscreen-header">
                    <div class="ai-header-content">
                        <h2>🤖 Mamasafe assistant AI</h2>
                        <p>Ask anything about Nutrition support</p>
                    </div>
                    <button onclick="MamasafeAI.closeFullscreen()" class="ai-close-btn">✕</button>
                </div>
                
                <div class="ai-fullscreen-body">
                    <!-- Quick Topics -->
                    <div class="ai-quick-topics">
                        <div class="ai-history-panel">
                            <div class="ai-sidebar-title">History</div>
                            <div class="ai-history-list" id="ai-history-list">
                                <div class="ai-history-empty">No previous chats yet</div>
                            </div>
                        </div>
                        <h3>Suggested prompts</h3>
                        <button onclick="MamasafeAI.clearConversation()" class="topic-btn ai-new-chat-btn" type="button">New chat</button>
                        <div class="topic-grid">
                            <button onclick="MamasafeAI.askTopic('pregnancy-weeks')" class="topic-btn">🤰 Pregnancy Weeks</button>
                           
                            <button onclick="MamasafeAI.askTopic('nutrition')" class="topic-btn">🥗 Nutrition</button>
                       
                        </div>
                    </div>
                    
                    <!-- Chat Area -->
                    <div class="ai-chat-container">
                        <div class="ai-chat-messages" id="ai-chat-messages"></div>
                        <div class="ai-chat-input-container">
                            <input type="file" id="ai-image-input" accept="image/*" style="display: none;" onchange="MamasafeAI.handleImageUpload(this)" />
                            <button onclick="document.getElementById('ai-image-input').click()" class="ai-image-btn" title="Upload image for analysis">📷</button>
                            <textarea id="ai-chat-input" rows="1" placeholder="Message Mamasafe assistant AI"></textarea>
                            <button onclick="MamasafeAI.sendMessage()" class="ai-send-btn" type="button" aria-label="Send message">Send</button>
                        </div>
                        <p class="ai-chat-note">Mamasafe assistant AI can make mistakes. For urgent symptoms, contact emergency services or your healthcare provider.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(aiWidget);
        const chatInput = document.getElementById('ai-chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
            });
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = `${Math.min(chatInput.scrollHeight, 180)}px`;
            });
        }
        
        // Add comprehensive AI styles
        const aiStyles = document.createElement('style');
        aiStyles.textContent = `
            /* Small Floating Widget */
            .ai-widget-small {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ff6b9d 0%, #ff4757 100%);
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(255, 107, 157, 0.4);
                z-index: 10000;
                transition: all 0.3s ease;
                animation: ai-float 3s ease-in-out infinite;
            }
            
            .ai-widget-small:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(255, 107, 157, 0.6);
            }
            
            .ai-widget-icon {
                font-size: 24px;
                margin-bottom: 2px;
            }
            
            .ai-widget-text {
                font-size: 8px;
                color: white;
                font-weight: 600;
                display: none;
            }
            
            .ai-widget-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(255, 107, 157, 0.3);
                animation: ai-pulse 2s ease-in-out infinite;
            }
            
            @keyframes ai-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes ai-pulse {
                0% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.2); opacity: 0.1; }
                100% { transform: scale(1); opacity: 0.3; }
            }
            
            /* Full-screen Mamasafe assistant AI */
            .ai-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #ffe4ec 0%, #ffe4ec 100%);
                z-index: 10001;
                display: flex;
                flex-direction: column;
                animation: ai-slideIn 0.3s ease-out;
            }
            
            @keyframes ai-slideIn {
                from { transform: translateY(100vh); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .ai-fullscreen-header {
                background: linear-gradient(135deg, #ff6b9d 0%, #ff4757 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            }
            
            .ai-header-content h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }
            
            .ai-header-content p {
                margin: 5px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .ai-close-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .ai-close-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            .ai-fullscreen-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 20px;
                overflow-y: auto;
            }
            
            .ai-quick-topics {
                margin-bottom: 20px;
            }
            
            .ai-quick-topics h3 {
                margin: 0 0 15px 0;
                color: #0f2a56;
                font-size: 18px;
                font-weight: 600;
            }
            
            .topic-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .topic-btn {
                background: white;
                border: 2px solid #ff6b9d;
                border-radius: 12px;
                padding: 12px 8px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                color: #0f2a56;
                transition: all 0.3s ease;
                text-align: center;
            }
            
            .topic-btn:hover {
                background: #ff6b9d;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
            }
            
            .ai-chat-container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                flex: 1;
                display: flex;
                flex-direction: column;
                max-height: 400px;
            }
            
            .ai-chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .ai-message {
                margin-bottom: 15px;
                padding: 15px;
                border-radius: 15px;
                max-width: 80%;
                animation: ai-messageSlide 0.3s ease-out;
            }
            
            @keyframes ai-messageSlide {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .ai-message.user {
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 5px;
            }
            
            .ai-message.ai {
                background: linear-gradient(135deg, #a29bfe 0%, #43e97b 100%);
                color: white;
                margin-right: auto;
                border-bottom-left-radius: 5px;
            }
            
            .ai-message .message-content {
                margin-bottom: 5px;
                line-height: 1.4;
            }
            
            .ai-message .message-time {
                font-size: 11px;
                opacity: 0.8;
            }
            
            .ai-chat-input-container {
                display: flex;
                gap: 10px;
                padding: 20px;
                background: white;
                border-top: 1px solid #ffe4ec;
            }
            
            .ai-chat-input-container input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #ffe4ec;
                border-radius: 25px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.3s ease;
            }
            
            .ai-chat-input-container input:focus {
                border-color: #ff6b9d;
            }
            
            .ai-image-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 16px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
                font-size: 20px;
            }
            
            .ai-image-btn:hover {
                transform: scale(1.05);
            }
            
            .ai-send-btn {
                background: linear-gradient(135deg, #ff6b9d 0%, #ff4757 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .ai-send-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .ai-widget-small {
                    bottom: 15px;
                    right: 15px;
                    width: 50px;
                    height: 50px;
                }
                
                .ai-widget-icon {
                    font-size: 20px;
                }
                
                .topic-grid {
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                }
                
                .ai-fullscreen-header {
                    padding: 15px;
                }
                
                .ai-header-content h2 {
                    font-size: 20px;
                }
                
                .ai-fullscreen-body {
                    padding: 15px;
                }
            }

            /* ChatGPT-like dark interface */
            .ai-widget-small {
                background: #111111;
                border: 1px solid #303030;
                box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
                animation: none;
            }

            .ai-widget-pulse {
                display: none;
            }

            .ai-fullscreen {
                background: #000000;
                color: #ececec;
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            .ai-fullscreen-header {
                background: #0f0f0f;
                border-bottom: 1px solid #262626;
                box-shadow: none;
                padding: 14px 22px;
            }

            .ai-header-content h2 {
                color: #f5f5f5;
                font-size: 17px;
                font-weight: 700;
            }

            .ai-header-content p {
                color: #a8a8a8;
                font-size: 13px;
            }

            .ai-close-btn {
                width: auto;
                min-width: 40px;
                height: 36px;
                border-radius: 8px;
                background: #1f1f1f;
                border: 1px solid #333333;
                color: #ececec;
                font-size: 14px;
                padding: 0 12px;
            }

            .ai-close-btn:hover {
                background: #2a2a2a;
                transform: none;
            }

            .ai-fullscreen-body {
                display: grid;
                grid-template-columns: 280px minmax(0, 1fr);
                gap: 0;
                padding: 0;
                min-height: 0;
                overflow: hidden;
            }

            .ai-quick-topics {
                margin: 0;
                padding: 18px;
                background: #090909;
                border-right: 1px solid #232323;
                overflow-y: auto;
            }

            .ai-quick-topics h3 {
                color: #b4b4b4;
                font-size: 13px;
                font-weight: 700;
                margin-bottom: 14px;
            }

            .ai-history-panel {
                border-bottom: 1px solid #242424;
                margin-bottom: 18px;
                padding-bottom: 16px;
            }

            .ai-sidebar-title {
                color: #b4b4b4;
                font-size: 13px;
                font-weight: 800;
                margin-bottom: 10px;
            }

            .ai-history-list {
                display: grid;
                gap: 7px;
                max-height: 260px;
                overflow-y: auto;
                padding-right: 2px;
            }

            .ai-history-empty {
                color: #747474;
                font-size: 13px;
                line-height: 1.45;
                padding: 10px 0;
            }

            .ai-history-item {
                width: 100%;
                border: 1px solid transparent;
                border-radius: 8px;
                background: transparent;
                color: #e7e7e7;
                cursor: pointer;
                display: grid;
                gap: 4px;
                padding: 10px;
                text-align: left;
            }

            .ai-history-item:hover {
                background: #1b1b1b;
                border-color: #333333;
            }

            .ai-history-item strong {
                display: block;
                font-size: 13px;
                font-weight: 700;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .ai-history-item span {
                color: #888888;
                font-size: 11px;
            }

            .topic-grid {
                grid-template-columns: 1fr;
                gap: 8px;
                margin: 0;
            }

            .topic-btn {
                background: transparent;
                border: 1px solid #2a2a2a;
                border-radius: 8px;
                color: #e7e7e7;
                font-size: 13px;
                font-weight: 600;
                padding: 11px 12px;
                text-align: left;
            }

            .topic-btn:hover {
                background: #1b1b1b;
                color: #ffffff;
                transform: none;
                box-shadow: none;
                border-color: #444444;
            }

            .ai-new-chat-btn {
                width: 100%;
                margin-bottom: 12px;
                background: #ffffff;
                color: #111111;
                border-color: #ffffff;
                text-align: center;
            }

            .ai-new-chat-btn:hover {
                background: #e7e7e7;
                color: #111111;
            }

            .ai-chat-container {
                max-height: none;
                min-height: 0;
                background: #000000;
                border-radius: 0;
                box-shadow: none;
                position: relative;
            }

            .ai-chat-messages {
                border: 0;
                padding: 30px 18px 150px;
                background: #000000;
            }

            .ai-message {
                max-width: 820px;
                width: min(820px, calc(100% - 24px));
                margin: 0 auto 20px;
                padding: 0;
                border-radius: 0;
                background: transparent;
                color: #ececec;
                animation: ai-messageSlide 0.18s ease-out;
            }

            .ai-message.user {
                display: flex;
                justify-content: flex-end;
                background: transparent;
                color: #ffffff;
                margin-left: auto;
                border-bottom-right-radius: 0;
            }

            .ai-message.user .message-content {
                max-width: 76%;
                background: #2f2f2f;
                border-radius: 18px;
                padding: 12px 16px;
            }

            .ai-upload-preview {
                display: block;
                width: min(280px, 100%);
                max-height: 260px;
                object-fit: cover;
                border-radius: 14px;
                margin-bottom: 10px;
                border: 1px solid #474747;
            }

            .ai-image-message .message-content p {
                margin: 0;
            }

            .ai-message.ai {
                background: transparent;
                color: #ececec;
                margin-right: auto;
                border-bottom-left-radius: 0;
            }

            .ai-message.ai .message-content {
                background: transparent;
                padding: 4px 0;
            }

            .ai-message .message-content {
                font-size: 15px;
                line-height: 1.68;
                white-space: normal;
            }

            .ai-message .message-content p {
                margin: 0 0 12px;
            }

            .ai-message .message-content p:last-child {
                margin-bottom: 0;
            }

            .ai-message .message-content ul,
            .ai-message .message-content ol {
                margin: 8px 0 14px 24px;
            }

            .ai-message .message-content li {
                margin: 5px 0;
            }

            .ai-message .message-content strong {
                color: #ffffff;
                font-weight: 700;
            }

            .ai-message .message-time {
                display: none;
            }

            .ai-chat-input-container {
                position: absolute;
                left: 50%;
                bottom: 34px;
                transform: translateX(-50%);
                width: min(820px, calc(100% - 36px));
                background: #1f1f1f;
                border: 1px solid #3a3a3a;
                border-radius: 18px;
                box-shadow: 0 20px 55px rgba(0, 0, 0, 0.45);
                padding: 10px;
                align-items: flex-end;
            }

            .ai-chat-input-container textarea {
                flex: 1;
                min-height: 28px;
                max-height: 180px;
                padding: 10px 8px;
                border: 0;
                background: transparent;
                color: #f4f4f4;
                font: inherit;
                font-size: 15px;
                line-height: 1.5;
                outline: none;
                resize: none;
            }

            .ai-chat-input-container textarea::placeholder {
                color: #8d8d8d;
            }

            .ai-image-btn,
            .ai-send-btn {
                width: 36px;
                height: 36px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                padding: 0;
                background: #2b2b2b;
                border: 1px solid #3a3a3a;
                color: #f4f4f4;
                font-size: 13px;
                font-weight: 800;
            }

            .ai-image-btn {
                font-size: 0;
            }

            .ai-image-btn::before {
                content: "+";
                font-size: 20px;
                line-height: 1;
            }

            .ai-send-btn {
                width: auto;
                padding: 0 14px;
                background: #ffffff;
                color: #111111;
                border-color: #ffffff;
            }

            .ai-image-btn:hover,
            .ai-send-btn:hover {
                transform: none;
                box-shadow: none;
                filter: brightness(0.92);
            }

            .ai-chat-note {
                position: absolute;
                left: 50%;
                bottom: 9px;
                transform: translateX(-50%);
                width: min(820px, calc(100% - 36px));
                margin: 0;
                color: #858585;
                font-size: 12px;
                text-align: center;
            }

            @media (max-width: 900px) {
                .ai-fullscreen-body {
                    grid-template-columns: 1fr;
                }

                .ai-quick-topics {
                    border-right: 0;
                    border-bottom: 1px solid #232323;
                    padding: 12px;
                    max-height: 142px;
                }

                .topic-grid {
                    display: flex;
                    overflow-x: auto;
                    gap: 8px;
                }

                .topic-btn {
                    white-space: nowrap;
                }
            }
        `;
        document.head.appendChild(aiStyles);
    },
    
    openFullscreen: function() {
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            if (typeof showNotification === 'function') {
                showNotification('Please login to access Mamasafe assistant AI', 'warning');
            }
            if (typeof redirectToLoginForTool === 'function') {
                redirectToLoginForTool('home', 'openHomeHealthAI');
            } else if (typeof navigateTo === 'function') {
                navigateTo('login');
            }
            return;
        }

        const fullscreen = document.getElementById('ai-fullscreen');
        const smallWidget = document.getElementById('ai-widget-small');
        if (fullscreen) {
            fullscreen.style.display = 'flex';
            smallWidget.style.display = 'none';
            this.renderChatHistorySidebar();
            this.addWelcomeMessage();
        }
    },
    
    closeFullscreen: function() {
        const fullscreen = document.getElementById('ai-fullscreen');
        const smallWidget = document.getElementById('ai-widget-small');
        if (fullscreen) {
            fullscreen.style.display = 'none';
            smallWidget.style.display = 'flex';
        }
    },
    
    toggleChat: function() {
        const chatBody = document.getElementById('ai-chat-body');
        if (chatBody) {
            chatBody.style.display = chatBody.style.display === 'none' ? 'block' : 'none';
        }
    },
    
    addWelcomeMessage: function() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (messagesContainer && messagesContainer.children.length === 0) {
            this.addMessage('👋 Hello! I\'m your Mamasafe assistant AI. I can help with pregnancy, courses,  nutrition, & AI support. Click on any topic above or ask me anything!', 'ai');
        }
    },
    
    askTopic: function(topic) {
        const question = `Tell me about ${topic.replace('-', ' ')}`;
        this.addMessage(question, 'user');
        
        // Use Groq AI for topic responses
        this.generateResponse(question);
    },
    
    generateTopicResponse: function(topic) {
        const responses = {
            'pregnancy-weeks': this.getPregnancyWeeksInfo(),
            'symptoms': this.getSymptomsInfo(),
            'nutrition': this.getNutritionInfo(),
            'exercise': this.getExerciseInfo(),
            'fetal-development': this.getFetalDevelopmentInfo(),
            'labor': this.getLaborInfo(),
            'postpartum': this.getPostpartumInfo(),
            'breastfeeding': this.getBreastfeedingInfo(),
            'sleep': this.getSleepInfo(),
            'mental-health': this.getMentalHealthInfo(),
            'complications': this.getComplicationsInfo()
        };
        
        return responses[topic] || "I'd be happy to help you with that! Please ask me a more specific question.";
    },
    
    // Comprehensive Pregnancy Knowledge Base
    getPregnancyWeeksInfo: function() {
        return `🤰 **Pregnancy Timeline Guide**

**First Trimester (Weeks 1-12):**
• Week 4: Baby's heart begins to beat
• Week 8: All major organs form
• Week 12: Baby can make fists

**Second Trimester (Weeks 13-27):**
• Week 16: You might feel baby move
• Week 20: Anatomy scan ultrasound
• Week 24: Baby's lungs develop rapidly

**Third Trimester (Weeks 28-40):**
• Week 28: Baby opens eyes
• Week 32: Baby practices breathing
• Week 36: Baby drops into pelvis
• Week 40: Full term - ready for birth!

💡 **Tip:** Track your symptoms and baby's development weekly for the best pregnancy experience!`;
    },
    
    getSymptomsInfo: function() {
        return `🩺 **Common Pregnancy Symptoms**

**Early Symptoms:**
• Morning sickness (nausea/vomiting)
• Fatigue and exhaustion
• Tender/swollen breasts
• Food cravings or aversions
• Frequent urination
• Mood swings

**Mid-Pregnancy:**
• Growing belly and weight gain
• Back pain and pelvic pressure
• Braxton Hicks contractions
• Swollen ankles and feet
• Shortness of breath
• Heartburn

**Late Pregnancy:**
• Increased Braxton Hicks
• Difficulty sleeping
• Leaking colostrum
• Pelvic pressure
• Nesting instinct

⚠️ **When to call your doctor:** Severe headache, vision changes, fever, reduced fetal movement, vaginal bleeding, or severe abdominal pain.`;
    },
    
    getNutritionInfo: function() {
        return `🥗 **Pregnancy Nutrition Guide**

**Essential Nutrients:**
• **Folic Acid:** 400-800mcg daily - prevents birth defects
• **Iron:** 27mg daily - prevents anemia
• **Calcium:** 1000mg daily - builds baby's bones
• **Protein:** 70-100g daily - baby's building blocks
• **DHA:** 200-300mg daily - brain development

**Foods to Eat:**
• Leafy greens (spinach, kale)
• Lean proteins (chicken, fish, beans)
• Whole grains (oats, quinoa, brown rice)
• Dairy or fortified alternatives
• Colorful fruits and vegetables
• Healthy fats (avocado, nuts, olive oil)

**Foods to Avoid:**
• Raw fish and undercooked meat
• Unpasteurized dairy
• High-mercury fish (shark, swordfish)
• Excessive caffeine (limit to 200mg/day)
• Alcohol completely

💧 **Hydration:** Drink 8-10 glasses of water daily!`;
    },
    
    getExerciseInfo: function() {
        return `🏃 **Safe Pregnancy Exercise**

**Recommended Exercises:**
• **Walking:** 30 minutes daily, excellent for all trimesters
• **Swimming:** Low-impact, full-body workout
• **Prenatal Yoga:** Improves flexibility and reduces stress
• **Stationary Cycling:** Safe cardio option
• **Strength Training:** Light weights with proper form

**Benefits:**
• Reduces back pain and constipation
• Improves mood and energy levels
• Helps with labor and delivery
• Faster postpartum recovery
• Better sleep quality

**Exercises to Avoid:**
• Contact sports (soccer, basketball)
• Activities with falling risk (skiing, horseback riding)
• Exercises lying flat on back after 20 weeks
• High-impact jumping or bouncing
• Heavy weightlifting

⚠️ **Stop exercising if:** Dizziness, chest pain, vaginal bleeding, contractions, or fluid leakage

📅 **Frequency:** Aim for 150 minutes of moderate exercise weekly`;
    },
    
    getFetalDevelopmentInfo: function() {
        return `👶 **Baby's Development Journey**

**Month 1-2 (Weeks 1-8):**
• Heart begins beating at 6 weeks
• Neural tube forms (brain/spinal cord)
• Limb buds appear
• Facial features develop

**Month 3 (Weeks 9-12):**
• All major organs formed
• Fingers and toes separate
• Baby can make fists and kick
• Gender determination possible

**Month 4-6 (Weeks 13-24):**
• Baby grows rapidly (1 pound by 20 weeks)
• Hair and nails grow
• Baby can hear and respond to sounds
• Lungs develop breathing movements
• Mother feels regular movements

**Month 7-9 (Weeks 25-40):**
• Brain develops rapidly
• Baby practices breathing
• Eyes open and respond to light
• Gains most weight (final months)
• Position for birth (head down usually)

🔊 **Bonding Tip:** Talk, sing, and read to your baby - they can hear you from 18 weeks!`;
    },
    
    getLaborInfo: function() {
        return `🏥 **Labor & Delivery Guide**

**Signs of Labor:**
• Regular contractions (5 minutes apart, lasting 60 seconds)
• Water breaking (gush or trickle)
• Bloody show (mucus plug discharge)
• Lower back pain that doesn't go away
• Strong pressure in pelvis

**Stages of Labor:**
**Stage 1: Early Labor (0-6cm)**
• Contractions become regular
• Lasts 8-12 hours (first baby)
• Stay home, rest, hydrate

**Stage 2: Active Labor (6-10cm)**
• Contractions stronger and closer
• Time to go to hospital
• Lasts 4-8 hours

**Stage 3: Pushing & Delivery**
• Push with contractions
• Baby emerges
• Lasts 30 minutes - 2 hours

**Stage 4: Placenta Delivery**
• Placenta delivered
• Lasts 5-30 minutes

📦 **Hospital Bag Essentials:** Clothes, toiletries, insurance info, birth plan, phone charger, baby outfit, car seat installed

👶 **Pain Management Options:** Breathing techniques, movement, epidural, natural methods`;
    },
    
    getPostpartumInfo: function() {
        return `🤱 **Postpartum Recovery Guide**

**First 24 Hours:**
• Rest as much as possible
• Stay hydrated and eat nutritious food
• Begin breastfeeding if desired
• Monitor for excessive bleeding
• Accept help from family/friends

**First 6 Weeks:**
• **Physical Recovery:**
  - Bleeding (lochia) for 2-6 weeks
  - Perineal soreness or C-section incision care
  - Breast engorgement and milk supply
  - Hair loss (normal at 3-4 months)
  
• **Emotional Changes:**
  - Baby blues (80% of mothers)
  - Postpartum depression (1 in 7 mothers)
  - Mood swings and anxiety
  - Seek help if symptoms persist

**Self-Care Tips:**
• Sleep when baby sleeps
• Accept all offers of help
• Stay connected with partner/friends
• Gentle walks when cleared by doctor
• Pelvic floor exercises

⚠️ **Call doctor if:** Fever over 100.4°F, heavy bleeding, severe headache, chest pain, or thoughts of harming yourself or baby`;
    },
    
    getBreastfeedingInfo: function() {
        return `🍼 **Breastfeeding Complete Guide**

**Getting Started:**
• Initiate within first hour of birth
• Skin-to-skin contact helps baby latch
• Feed on demand (8-12 times daily)
• Proper latch: mouth wide, nipple deep in mouth

**First Week:**
• Colostrum - "liquid gold" nutrition
• Baby loses weight, then regains by day 5
• Wet diapers: 6+ daily after day 4
• Poopy diapers: 3+ daily after day 4

**Common Challenges:**
• **Sore Nipples:** Check latch, use lanolin cream
• **Engorgement:** Feed frequently, cold compresses
• **Low Supply:** Feed more often, pump after feeds
• **Oversupply:** Block feeding, hand express relief

**Benefits:**
• Perfect nutrition for baby
• Antibodies and immune protection
• Reduces SIDS risk
• Helps uterus contract
• Promotes bonding
• Saves money

💊 **Maternal Diet:** Continue prenatal vitamins, eat 500 extra calories daily, drink 8-10 glasses water

📞 **Get Help:** Lactation consultant, La Leche League, hospital breastfeeding classes`;
    },
    getSleepInfo: function() {
        return `Pregnancy Sleep Guide

Sleep Support:
- Keep a consistent bedtime and wake time
- Use pillows to support your bump, hips, and back
- Sleep on your side when comfortable, especially later in pregnancy
- Limit caffeine and heavy meals close to bedtime

When Sleep Is Difficult:
- Try gentle stretching, breathing, or a warm shower
- Write down worries before bed and plan one next step
- Talk with your clinician about severe insomnia, snoring, breathing pauses, or restless legs

Tip: Persistent headaches, vision changes, chest pain, or trouble breathing with poor sleep need medical advice quickly.`;
    },
    getMentalHealthInfo: function() {
        return `🧠 **Maternal Mental Health Guide**

**Common Concerns:**
• **Baby Blues (80%):** Mood swings, crying, anxiety 2-3 weeks postpartum
• **Postpartum Depression (15%):** Persistent sadness, worthlessness, guilt
• **Postpartum Anxiety (10%):** Excessive worry, racing thoughts, panic attacks
• **Postpartum OCD (3-5%):** Intrusive thoughts, compulsive behaviors

**Warning Signs:**
• Sadness lasting more than 2 weeks
• Loss of interest in activities
• Extreme worry or panic
• Thoughts of harming yourself or baby
• Difficulty bonding with baby
• Changes in eating or sleeping

**Self-Care Strategies:**
• Rest when baby sleeps
• Exercise gently (walks, stretching)
• Eat nutritious meals regularly
• Stay connected with friends/family
• Join new mom support groups
• Make time for yourself (even 15 minutes)
• Ask for and accept help

**Professional Help:**
• Talk to your OB/GYN or primary care
• Therapy (CBT, interpersonal therapy)
• Support groups (in-person or online)
• Medication (safe while breastfeeding)
• Postpartum doula support

🆘 **CRISIS:** Call 988 or go to ER if you have thoughts of harming yourself or baby

💜 **Remember:** You're not alone, treatment is available, and you will get better!`;
    },
    
    getComplicationsInfo: function() {
        return `⚠️ **Pregnancy Complications Guide**

**Common Complications:**

**Gestational Diabetes (2-10%):**
• High blood sugar during pregnancy
• Usually diagnosed at 24-28 weeks
• Managed with diet, exercise, sometimes medication
• Increases risk of large baby and C-section

**Preeclampsia (5-8%):**
• High blood pressure after 20 weeks
• Protein in urine, swelling, headaches
• Can progress to eclampsia (seizures)
• Treatment: Deliver baby (only cure)

**Preterm Labor (12%):**
• Contractions before 37 weeks
• Risk factors: previous preterm birth, multiples
• Warning signs: regular contractions, pelvic pressure
• Treatment: Medications to stop labor, steroids for baby's lungs

**Placenta Previa (1 in 200):**
• Placenta covers cervix
• Painless bleeding in third trimester
• May require bed rest or C-section
• Usually resolves by third trimester

**Miscarriage (10-20%):**
• Loss before 20 weeks
• Most common in first trimester
• Usually due to chromosomal abnormalities
• Not caused by mother's actions

**When to Call Doctor Immediately:**
• Vaginal bleeding
• Severe headache or vision changes
• Decreased fetal movement
• Fever over 100.4°F
• Severe abdominal pain
• Fluid leakage

🏥 **Regular prenatal care** helps detect complications early for the best outcomes!`;
    },
    
    sendMessage: function() {
        const input = document.getElementById('ai-chat-input');
        const message = input?.value?.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';
        
        // Generate AI response
        this.generateResponse(message);
    },
    
    addMessage: function(message, sender, options = {}) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">${this.formatChatMessage(message)}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        const isAutoWelcome = sender === 'ai' && /Hello! I'm your Mamasafe assistant AI/i.test(String(message || ''));
        if (options.save !== false && !isAutoWelcome) {
            this.chatHistory.push({ message, sender, timestamp: Date.now() });
            this.saveChatHistory();
            this.renderChatHistorySidebar();
        }
    },

    addImageMessage: function(fileName, imageUrl, promptText) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message user ai-image-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <img src="${imageUrl}" alt="${this.escapeHtml(fileName)}" class="ai-upload-preview">
                <p>${this.escapeHtml(promptText || 'Please analyze this image.')}</p>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.chatHistory.push({
            message: `[Image: ${fileName}] ${promptText || 'Please analyze this image.'}`,
            sender: 'user',
            timestamp: Date.now()
        });
        this.saveChatHistory();
        this.renderChatHistorySidebar();
    },

    escapeHtml: function(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    formatChatMessage: function(message) {
        const escaped = this.escapeHtml(message);
        return escaped
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .split(/\n{2,}/)
            .map(block => {
                const lines = block.split('\n');
                const allBullets = lines.every(line => /^\s*(?:[-*•]|\d+\.)\s+/.test(line));
                if (allBullets) {
                    const ordered = lines.every(line => /^\s*\d+\.\s+/.test(line));
                    const items = lines.map(line => `<li>${line.replace(/^\s*(?:[-*•]|\d+\.)\s+/, '')}</li>`).join('');
                    return ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
                }
                return `<p>${lines.join('<br>')}</p>`;
            })
            .join('');
    },

    clearConversation: function() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            messagesContainer.dataset.historyRendered = 'true';
        }
        this.chatHistory = [];
        this.saveChatHistory();
        this.renderChatHistorySidebar();
        this.addWelcomeMessage();
        const chatInput = document.getElementById('ai-chat-input');
        if (chatInput) chatInput.focus();
    },

    restoreChatHistoryToConversation: function() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        const validHistory = Array.isArray(this.chatHistory) ? this.chatHistory : [];
        validHistory.forEach(item => {
            if (!item || !item.message || !item.sender) return;
            this.addMessage(item.message, item.sender, { save: false });
        });

        messagesContainer.dataset.historyRendered = 'true';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    renderChatHistorySidebar: function() {
        const historyList = document.getElementById('ai-history-list');
        if (!historyList) return;

        const userMessages = (Array.isArray(this.chatHistory) ? this.chatHistory : [])
            .filter(item => item?.sender === 'user' && item.message)
            .slice(-12)
            .reverse();

        if (!userMessages.length) {
            historyList.innerHTML = '<div class="ai-history-empty">No previous chats yet</div>';
            return;
        }

        historyList.innerHTML = userMessages.map((item, index) => {
            const title = this.escapeHtml(String(item.message).replace(/^\[Image:[^\]]+\]\s*/, '').slice(0, 70));
            const time = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Saved chat';
            return `
                <button class="ai-history-item" type="button" onclick="MamasafeAI.restoreChatHistoryToConversation()">
                    <strong>${title || 'Image chat'}</strong>
                    <span>${this.escapeHtml(time)}</span>
                </button>
            `;
        }).join('');
    },
    
    generateResponse: async function(userMessage) {
        // Hard nutrition-only gate (prevents both backend and offline answers from going out-of-scope)
        const msg = String(userMessage || '').toLowerCase();
        const nutritionAllowed = /\b(nutrition|food|foods|eat|eating|diet|meal|snack|hydration|water|protein|carb|carbohydrate|fiber|folate|folic|iron|calcium|vitamin|zinc|iodine|omega|omega-3|omega3|breakfast|lunch|dinner|snacks)\b/.test(msg);
        const nutritionDenied = /\b(bleeding|vaginal bleeding|spotting|water broke|fluid leaking|danger sign|danger-sign|emergency|urgent|who|antenatal|anc|guideline|blood pressure|bp|systolic|diastolic|glucose|diabetes|bmi|risk level|mortality|exercise|workout|sleep|position|movement|contraction|cramps|pain|headache|vision changes|swelling|fever|fainting|seizure|vomit|vomiting|nausea|heartburn|indigestion)\b/.test(msg);

        if (nutritionDenied || !nutritionAllowed) {
            this.addMessage(
                'Mamasafe nutrition support (dataset-only).\n\nI can only answer nutrition-related pregnancy questions using your stored nutrition datasets.\n\nExamples you can ask:\n• “What foods help with nausea in pregnancy?”\n• “What should I eat to increase iron (and folate)?”\n• “Which foods are best for calcium and protein in pregnancy?”\n\nIf you have urgent warning signs or severe symptoms, contact a healthcare provider or emergency services.',
                'ai'
            );
            return;
        }

        // Show typing indicator
        this.addMessage('Thinking...', 'ai', { save: false });
        
        try {
            if (!hasMamasafeBackend()) {
                throw new Error('AI backend not configured');
            }

            const context = this.getContext();
            const chatHistory = this.chatHistory.slice(-8).map(item => ({
                role: item.sender === 'user' ? 'user' : 'assistant',
                content: item.message
            }));
            const payload = {
                message: userMessage,
                question: userMessage,
                week: context.week || '',
                pregnancyWeek: context.week || '',
                symptoms: context.symptoms || context.healthConcerns || '',
                context,
                chatHistory
            };

            let response = await fetch(`${getMamasafeBackendOrigin()}/api/ai/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                response = await fetch(`${getMamasafeBackendOrigin()}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                response = await fetch(`${getMamasafeBackendOrigin()}/api/mamasafe-chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                throw new Error(`AI backend returned ${response.status}`);
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('AI backend returned a non-JSON response');
            }

            const data = await response.json();
            
            // Remove typing indicator
            const messages = document.querySelectorAll('.ai-message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.textContent.includes('Thinking')) {
                lastMessage.remove();
            }
            
            const reply = data.reply || data.answer || data.response || data.result || '';
            if (reply) {
                this.addMessage(reply, 'ai');
            } else {
                this.addMessage('I apologize, but I encountered an error. Please try again.', 'ai');
            }
        } catch (error) {
            console.info('AI backend unavailable; using offline assistant mode:', error.message || error);
            
            // Fallback to local responses if API fails
            const response = this.processMessage(userMessage);
            
            // Remove typing indicator and add fallback response
            const messages = document.querySelectorAll('.ai-message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.textContent.includes('Thinking')) {
                lastMessage.remove();
            }
            
            this.addMessage(response + ' (Using offline mode)', 'ai');
        }
    },
    
    getContext: function() {
        // Gather context from the application state
        const context = {};
        
        // Get pregnancy week if available
        const currentWeek = document.getElementById('currentWeek')?.textContent;
        if (currentWeek) {
            context.week = parseInt(currentWeek);
        }
        const weekInputs = [
            document.getElementById('pregnancyWeekInput')?.value,
            document.getElementById('ragWeekInput')?.value,
            document.getElementById('riskPregnancyWeek')?.value,
            document.getElementById('weekPlannerInput')?.value,
            document.getElementById('symptomWeek')?.value
        ].filter(Boolean);
        if (!context.week && weekInputs.length) {
            const parsedWeek = parseInt(weekInputs[0], 10);
            if (Number.isInteger(parsedWeek)) context.week = parsedWeek;
        }
        const symptomInputs = [
            document.getElementById('symptomInput')?.value,
            document.getElementById('riskSymptoms')?.value,
            document.getElementById('pregnancySymptoms')?.value
        ].filter(Boolean);
        if (symptomInputs.length) {
            context.symptoms = symptomInputs.join('; ');
            context.healthConcerns = context.symptoms;
        }
        
        // Get baby age if available
        const babyAge = document.getElementById('babyAge')?.textContent;
        if (babyAge) {
            context.babyAge = babyAge;
        }
        
        return context;
    },
    
    analyzeImage: async function(imageFile, analysisPrompt) {
        // Show typing indicator
        this.addMessage('🔍 Analyzing image...', 'ai');
        
        try {
            // Convert image to base64
            const base64Image = await this.convertToBase64(imageFile);
            
            // Call backend image analysis API
            const response = await fetch(`${getMamasafeBackendOrigin()}/api/mamasafe-analyze-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64Image,
                    mimeType: imageFile.type || 'image/jpeg',
                    prompt: analysisPrompt || 'Please analyze this image.'
                })
            });
            
            const data = await response.json().catch(() => ({}));
            
            // Remove typing indicator
            const messages = document.querySelectorAll('.ai-message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.textContent.includes('🔍 Analyzing image')) {
                lastMessage.remove();
            }
            
            if (!response.ok) {
                throw new Error(data.details || data.error || 'Image analysis failed');
            }

            if (data.analysis) {
                this.addMessage(data.analysis, 'ai');
            } else {
                this.addMessage('I apologize, but I encountered an error analyzing the image. Please try again.', 'ai');
            }
        } catch (error) {
            console.error('Mamasafe image analysis error:', error);
            
            // Remove typing indicator
            const messages = document.querySelectorAll('.ai-message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.textContent.includes('🔍 Analyzing image')) {
                lastMessage.remove();
            }
            
            this.addMessage(`I received the image, but I could not analyze it yet. ${error.message || 'Please try again with a smaller image.'}`, 'ai');
        }
    },
    
    convertToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },

    convertToDataUrl: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },
    
    handleImageUpload: async function(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.addMessage('Please choose an image file.', 'ai');
            input.value = '';
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            this.addMessage('That image is too large. Please upload an image under 8 MB.', 'ai');
            input.value = '';
            return;
        }
        
        const chatInput = document.getElementById('ai-chat-input');
        const analysisPrompt = chatInput?.value?.trim() || 'Please analyze this image.';
        if (chatInput) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }
        
        const imagePreviewUrl = await this.convertToDataUrl(file);
        this.addImageMessage(file.name, imagePreviewUrl, analysisPrompt);
        this.analyzeImage(file, analysisPrompt);
        
        // Clear the input
        input.value = '';
    },
    
    processMessage: function(message) {
        const lowerMessage = message.toLowerCase();
        
        // AI response logic based on context and message content
        if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy')) {
            return this.generatePregnancyResponse(message);
        } else if (lowerMessage.includes('sleep') || lowerMessage.includes('sleeping')) {
            return this.generateSleepResponse(message);
        } else if (lowerMessage.includes('feeding') || lowerMessage.includes('eat')) {
            return this.generateFeedingResponse(message);
        } else if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
            return this.generateHelpResponse();
        } else {
            return this.generateGeneralResponse(message);
        }
    },
    
    generatePregnancyResponse: function(message) {
        const responses = [
            "Based on your pregnancy stage, I recommend staying hydrated and getting adequate rest. Have you been tracking your symptoms?",
            "Pregnancy is different for everyone! What specific concerns do you have about your current trimester?",
            "I can help you track your pregnancy journey. What week are you currently in?",
            "Remember to take your prenatal vitamins and attend all scheduled checkups. How are you feeling today?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    generateSleepResponse: function(message) {
        const responses = [
            "Pregnancy sleep can be difficult. Try side support pillows, a calm wind-down routine, and hydration earlier in the day.",
            "If sleep problems come with trouble breathing, chest pain, severe headache, or vision changes, contact a healthcare professional quickly.",
            "Leg cramps, reflux, and frequent urination often disrupt pregnancy sleep. Which one is affecting you most?",
            "Gentle stretching, a warm shower, and a consistent bedtime can help. How many weeks pregnant are you?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    generateFeedingResponse: function(message) {
        const responses = [
            "Breastfeeding on demand helps establish milk supply. Are you tracking feeding times and durations?",
            "Pregnancy nutrition works best with balanced meals, iron-rich foods, folate, protein, and regular hydration.",
            "If nausea is making eating hard, try small frequent meals and ask your clinician if you cannot keep fluids down.",
            "Stay hydrated during pregnancy and breastfeeding preparation. Are you tracking water intake?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    generateHelpResponse: function() {
        return `I'm your Mamasafe assistant AI! I can help with:
Pregnancy tracking and advice
Pregnancy sleep support
Nutrition and breastfeeding preparation
Health monitoring
Courses, baby names, and professional support

What would you like help with today?`;
    },
    
    generateGeneralResponse: function(message) {
        const responses = [
            "That's a great question! Every family's journey is unique. What specific aspect would you like guidance on?",
            "I'm here to support your pregnancy and care planning journey. What challenges are you currently facing?",
            "Pregnancy planning and care can feel complex. What area would benefit from AI-powered insights?",
            "Your family's wellbeing is my priority. How can I provide personalized assistance today?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    startContextMonitoring: function() {
        // Monitor user activity to provide proactive AI suggestions
        setInterval(() => {
            this.provideProactiveInsights();
        }, 300000); // Every 5 minutes
    },
    
    provideProactiveInsights: function() {
        const currentPage = document.querySelector('.page-section.active')?.id;
        const insights = this.generateContextualInsights(currentPage);
        
        if (insights && Math.random() > 0.7) { // 30% chance to show insight
            showNotification(`💡 AI Insight: ${insights}`, 'info');
        }
    },
    
    generateContextualInsights: function(currentPage) {
        const insights = {
            'pregnancy': [
                "Track your daily symptoms for better pattern recognition",
                "Stay hydrated - aim for 8-10 glasses of water daily",
                "Gentle exercise can help with pregnancy discomforts"
            ],
            'courses': [
                "Choose one short lesson and one action item for today",
                "Review course notes before your next appointment",
                "Save questions from lessons to ask your clinician"
            ],
            'help-section': [
                "Keep emergency contacts easy to reach",
                "Review danger signs before symptoms become confusing",
                "Use professional help quickly for urgent symptoms"
            ]
        };
        
        return insights[currentPage] ? 
            insights[currentPage][Math.floor(Math.random() * insights[currentPage].length)] : 
            null;
    },
    
    saveChatHistory: function() {
        localStorage.setItem('mamasafe_ai_chat', JSON.stringify(this.chatHistory.slice(-50))); // Keep last 50 messages
    },
    
    loadChatHistory: function() {
        const saved = localStorage.getItem('mamasafe_ai_chat');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.chatHistory = Array.isArray(parsed)
                    ? parsed.filter(item => {
                        const message = String(item?.message || '');
                        if (!message.trim()) return false;
                        if (/Hello! I'm your Mamasafe assistant AI/i.test(message)) return false;
                        if (/^Thinking\.\.\.$/i.test(message.trim())) return false;
                        return true;
                    })
                    : [];
                this.saveChatHistory();
            } catch {
                this.chatHistory = [];
            }
        }
    }
};

async function openHomeHealthAI() {
    try {
        if (!window.MamasafeAI) {
            window.location.href = 'health-chatbot.html';
            return;
        }

        if (!document.getElementById('ai-fullscreen')) {
            await window.MamasafeAI.initialize();
        }

        window.MamasafeAI.openFullscreen();

        const chatInput = document.getElementById('ai-chat-input');
        if (chatInput) {
            chatInput.focus();
        }
    } catch (error) {
        console.error('Unable to open Mamasafe assistant AI:', error);
        window.location.href = 'health-chatbot.html';
    }
}

// ==========================================
// GLOBAL VARIABLES AND CONFIGURATION
// ==========================================

// Global app state
window.MamasafeApp = window.MamasafeApp || {
    initialized: false,
    currentPage: null,
    modules: {},
    config: {}
};

// Baby names data
window.namesBaseList = window.namesBaseList || [...(window.namesData || [])];

// Pregnancy data
window.pregnancyWeekSizes = window.pregnancyWeekSizes || {
    1: 'poppy seed', 2: 'sesame seed', 3: 'lentil', 4: 'blueberry', 5: 'apple seed',
    6: 'sweet pea', 7: 'blueberry', 8: 'raspberry', 9: 'green olive', 10: 'prune',
    11: 'fig', 12: 'lime', 13: 'peach', 14: 'lemon', 15: 'apple',
    16: 'avocado', 17: 'pear', 18: 'bell pepper', 19: 'mango', 20: 'banana',
    21: 'carrot', 22: 'spaghetti squash', 23: 'grapefruit', 24: 'ear of corn',
    25: 'rutabaga', 26: 'scallion bunch', 27: 'cauliflower', 28: 'eggplant',
    29: 'butternut squash', 30: 'cabbage', 31: 'coconut', 32: 'jicama',
    33: 'pineapple', 34: 'cantaloupe', 35: 'honeydew melon', 36: 'romaine lettuce',
    37: 'leek', 38: 'mini watermelon', 39: 'small pumpkin', 40: 'jackfruit',
    41: 'watermelon', 42: 'small pumpkin'
};

window.pregnancyWeekPhases = window.pregnancyWeekPhases || [
    { week: 1, phase: 'Conception', description: 'Fertilization occurs' },
    { week: 2, phase: 'Implantation', description: 'Embryo implants in uterus' },
    { week: 3, phase: 'Neural tube', description: 'Brain and spinal cord develop' },
    { week: 4, phase: 'Organogenesis', description: 'Major organs form' },
    { week: 5, phase: 'Heartbeat', description: 'Heart begins beating' }
];

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

function isLoggedIn() {
    const loggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    
    // Only return true if both login flag and email exist
    return loggedIn && userEmail && userEmail.trim() !== '';
}

function setIntendedAccess(pageId, actionName = '') {
    if (!pageId) return;
    localStorage.setItem('bc_intended_page', pageId);
    if (actionName) {
        localStorage.setItem('bc_intended_action', actionName);
    }
}

function redirectToLoginForTool(pageId, actionName = '') {
    setIntendedAccess(pageId, actionName);
    if (typeof showNotification === 'function') {
        showNotification('Please log in to use this feature. You can still browse the page.', 'warning');
    }
    if (typeof window.syncGuestFeatureLock === 'function') {
        window.syncGuestFeatureLock();
    }
    return false;
}

function requireToolAccess(pageId, actionName = '') {
    if (isLoggedIn()) {
        return true;
    }
    return redirectToLoginForTool(pageId, actionName);
}

function getStoredAuthProfile() {
    try {
        return JSON.parse(localStorage.getItem('bc_user_profile') || '{}');
    } catch (_) {
        return {};
    }
}

function getAuthDisplayName(email = '') {
    const profile = getStoredAuthProfile();
    const firstName = String(profile.firstName || '').trim();
    if (firstName) return firstName;
    const localPart = String(email || localStorage.getItem('bc_user_email') || 'mama').split('@')[0];
    return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase()) || 'Mama';
}

function getAuthStageLabel(stage = '') {
    const labels = {
        pregnant: 'Pregnancy care',
        support: 'Professional support',
        pregnancy: 'Pregnancy care',
        names: 'Baby names',
        courses: 'Learning courses',
        'pregnancy-tracking': 'Pregnancy tracking',
        'help-section': 'Professional support'
    };
    return labels[stage] || 'Motherhood care';
}

function getAuthStartPage(stageOrPriority = '') {
    const routeMap = {
        pregnant: 'pregnancy',
        pregnancy: 'pregnancy',
        names: 'names',
        courses: 'courses',
        support: 'help-section',
        'pregnancy-tracking': 'pregnancy',
        'help-section': 'help-section',
        'courses': 'courses'
    };
    return routeMap[stageOrPriority] || 'home';
}

function buildBackendUserPayload(profile = {}, source = 'frontend-auth') {
    const email = String(profile.email || localStorage.getItem('bc_user_email') || '').trim().toLowerCase();
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    const displayName = profile.name || profile.displayName || fullName || email || 'Mother';
    return {
        id: profile.id || profile.userId || email,
        userId: profile.userId || profile.id || email,
        email,
        userEmail: email,
        name: displayName,
        displayName,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        stage: profile.stage || profile.motherhoodStage || profile.lastFocus || '',
        journey: profile.stage || profile.lastFocus || profile.carePriority || '',
        carePriority: profile.carePriority || '',
        pregnancyWeek: profile.pregnancyWeek || profile.currentWeek || '',
        pregnancy_week: profile.pregnancyWeek || profile.currentWeek || '',
        dueDate: profile.dueDate || profile.careDate || '',
        status: profile.status || 'active',
        source,
        authAction: profile.authAction || source,
        profile,
        lastLoginAt: profile.lastLoginAt || new Date().toISOString(),
        savedAt: new Date().toISOString()
    };
}

async function syncUserToBackend(profile = {}, source = 'frontend-auth', options = {}) {
    const payload = buildBackendUserPayload(profile, source);
    if (!payload.email && !payload.userId) return null;

    try {
        const response = await fetch(window.mamasafeApiUrl('/api/users'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.message || data.error || data.details || `User sync failed (${response.status})`);
            error.status = response.status;
            error.code = data.code;
            error.fields = data.fields || [];
            throw error;
        }
        return data;
    } catch (error) {
        if (options.throwOnError) throw error;
        console.warn('Backend user sync skipped:', error.message || error);
        return null;
    }
}

async function checkUserAvailability(profile = {}) {
    const fullName = profile.name || profile.displayName || [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    const email = String(profile.email || '').trim().toLowerCase();
    if (!email && !fullName) return { available: true };

    const response = await fetch(window.mamasafeApiUrl('/api/users/check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, name: fullName })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || data.error || `Could not check user availability (${response.status})`);
    }
    return data;
}

function saveMotherhoodProfile(profile, options = {}) {
    const previous = getStoredAuthProfile();
    const nextProfile = {
        ...previous,
        ...profile,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem('bc_user_profile', JSON.stringify(nextProfile));
    if (nextProfile.firstName) localStorage.setItem('bc_user_name', nextProfile.firstName);
    if (window.DB_SYNC) {
        window.DB_SYNC.saveProfile(nextProfile);
        if (nextProfile.email) {
            window.DB_SYNC.saveUser({
                id: nextProfile.email,
                email: nextProfile.email,
                name: [nextProfile.firstName, nextProfile.lastName].filter(Boolean).join(' ') || nextProfile.email,
                profile: nextProfile
            });
        }
    }
    if (options.sync !== false) {
        syncUserToBackend(nextProfile, profile.source || 'frontend-auth');
    }
    return nextProfile;
}

window.syncUserToBackend = syncUserToBackend;
window.checkUserAvailability = checkUserAvailability;

function toggleAuthPassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    if (button) button.textContent = shouldShow ? 'Hide' : 'Show';
}

function showAuthHelp(type = 'password') {
    const message = type === 'social'
        ? 'Social login is available through Google now. Facebook login can be connected later from account settings.'
        : 'For this demo, enter your email and any password with at least 8 characters. Your profile is saved privately on this device.';
    showNotification(message, 'info');
}

function resumeIntendedAccess(fallbackPage = 'home') {
    const intendedPage = localStorage.getItem('bc_intended_page');
    const intendedAction = localStorage.getItem('bc_intended_action');
    const authPages = new Set(['login', 'signup', 'auth']);
    
    localStorage.removeItem('bc_intended_page');
    localStorage.removeItem('bc_intended_action');
    
    if (intendedPage && !authPages.has(intendedPage)) {
        setTimeout(() => {
            navigateTo(intendedPage, { skipAuthCheck: true });
            if (intendedAction && typeof window[intendedAction] === 'function') {
                setTimeout(() => {
                    window[intendedAction]();
                }, 120);
            }
        }, 500);
    } else {
        const pageFromUrl = typeof getCurrentPageFromURL === 'function' ? getCurrentPageFromURL() : '';
        if (!pageFromUrl || pageFromUrl === 'home' || authPages.has(pageFromUrl)) {
            setTimeout(() => navigateTo(fallbackPage || 'home', { skipAuthCheck: true }), 700);
        }
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value || '';
    const journey = document.getElementById('loginJourney')?.value || getStoredAuthProfile().stage || 'pregnancy';
    const remember = !!document.getElementById('rememberMe')?.checked;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }

    if (password.length < 8) {
        showNotification('Please use a password with at least 8 characters', 'error');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    if (email && password) {
        const profile = saveMotherhoodProfile({
            email,
            stage: journey,
            lastFocus: journey,
            remember,
            source: 'auth-login',
            lastLoginAt: new Date().toISOString()
        });
        const displayName = getAuthDisplayName(email);
        const stageLabel = getAuthStageLabel(journey);

        localStorage.setItem('bc_logged_in', 'true');
        localStorage.setItem('bc_user_email', email);
        localStorage.setItem('bc_remember_me', remember ? 'true' : 'false');
        if (window.DB_SYNC) {
            window.DB_SYNC.saveActivity({
                type: 'auth-login',
                email,
                stage: journey,
                remember,
                profile,
                date: new Date().toISOString()
            });
        }
        
        showNotification(`Welcome back, ${displayName}. Your ${stageLabel.toLowerCase()} space is ready.`, 'success');
        
        // Close login modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        // Login always opens the main dashboard.
        localStorage.removeItem('bc_intended_page');
        localStorage.removeItem('bc_intended_action');
        setTimeout(() => navigateTo('home', { skipAuthCheck: true, replaceHistory: true }), 500);
        
        // Update UI
        updateLoginState();
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName')?.value?.trim();
    const lastName = document.getElementById('lastName')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const weeklyTips = !!document.getElementById('weeklyTipsOptIn')?.checked;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('Please complete your name, email, and password fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    if (!document.getElementById('agreeTerms')?.checked) {
        showNotification('Please agree to the Mamasafe terms to create your profile', 'error');
        return;
    }
    
    const signupProfile = {
        firstName,
        lastName,
        email,
        stage: 'pregnant',
        dueDate: '',
        carePriority: 'pregnancy-tracking',
        weeklyTips,
        source: 'auth-signup',
        authAction: 'signup',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };

    try {
        const availability = await checkUserAvailability(signupProfile);
        if (!availability.available) {
            showNotification(availability.message || 'This name or email is already taken. Please log in instead.', 'error');
            return;
        }
        await syncUserToBackend(signupProfile, 'auth-signup', { throwOnError: true });
    } catch (error) {
        showNotification(error.message || 'Could not create account because the name or email may already be taken.', 'error');
        return;
    }

    // Simulate signup (in real app, this would be an API call)
    const profile = saveMotherhoodProfile(signupProfile, { sync: false });
    const fallbackPage = getAuthStartPage(carePriority || stage);

    localStorage.setItem('bc_logged_in', 'true');
    localStorage.setItem('bc_user_email', email);
    localStorage.setItem('bc_remember_me', 'true');
    if (window.DB_SYNC) {
        window.DB_SYNC.saveActivity({
            type: 'auth-signup',
            email,
            stage,
            carePriority,
            profile,
            date: new Date().toISOString()
        });
    }
    
    showNotification(`Welcome to Mamasafe, ${profile.firstName}. Your motherhood profile is ready.`, 'success');
    
    // Close signup modal
    const signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.style.display = 'none';
    }
    
    // Update UI
    updateLoginState();
    
    // Resume intended access or open the most relevant dashboard
    resumeIntendedAccess(fallbackPage);
}

function handleLogout() {
    localStorage.removeItem('bc_logged_in');
    localStorage.removeItem('bc_user_email');
    localStorage.removeItem('bc_enrollments');

    showNotification('You are signed out. Your Mamasafe space will be here when you return.', 'success');

    // Update UI
    updateLoginState();

    // Go to home page
    navigateTo('home');
}

function updateLoginState() {
    // Debug: Check what's in localStorage
    console.log('Login state check - bc_logged_in:', localStorage.getItem('bc_logged_in'));
    console.log('Login state check - bc_user_email:', localStorage.getItem('bc_user_email'));
    
    const isLoggedIn = localStorage.getItem('bc_logged_in') === 'true';
    const userEmail = localStorage.getItem('bc_user_email');
    
    // Update login/join/account/logout buttons
    const loginBtn = document.getElementById('loginBtn');
    const joinBtn = document.getElementById('joinBtn');
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (isLoggedIn && userEmail) {
        // Hide login/join buttons, show account/logout buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (joinBtn) joinBtn.style.display = 'none';
        if (accountBtn) accountBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userEmailDisplay) userEmailDisplay.textContent = userEmail;
        
        showAccountFeatures();
        showAccountBadges();
        updatePremiumContent();
        showWelcomeMessage(userEmail);
    } else {
        // Show login/join buttons, hide account/logout buttons
        if (loginBtn) loginBtn.style.display = 'block';
        if (joinBtn) joinBtn.style.display = 'block';
        if (accountBtn) accountBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userEmailDisplay) userEmailDisplay.textContent = '';
        
        hideAccountFeatures();
        hideAccountBadges();
        resetPremiumContent();
    }

    if (typeof window.syncGuestFeatureLock === 'function') {
        window.syncGuestFeatureLock();
    }
}

function showAccountFeatures() {
    console.log('Showing account features...');
    
    try {
        const accountFeatures = document.querySelectorAll('.account-feature');
        accountFeatures.forEach(feature => {
            feature.style.display = 'block';
        });
        
        // Show premium content sections
        const premiumSections = document.querySelectorAll('.premium-content');
        premiumSections.forEach(section => {
            section.style.display = 'block';
        });
        
    } catch (error) {
        console.error('Error showing account features:', error);
    }
}

function hideAccountFeatures() {
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('has-access');
        link.title = '';
    });
    
    const accountFeatures = document.querySelectorAll('.account-feature');
    accountFeatures.forEach(feature => {
        feature.style.display = 'none';
    });
}

function showAccountBadges() {
    const badges = document.querySelectorAll('.account-badge');
    badges.forEach(badge => badge.style.display = 'none');
}

function hideAccountBadges() {
    const badges = document.querySelectorAll('.account-badge');
    badges.forEach(badge => badge.style.display = 'none');
}

function updatePremiumContent() {
    try {
        const enrollments = JSON.parse(localStorage.getItem('bc_enrollments') || '[]');
        const courseIds = ['childbirth', 'breastfeeding', 'sleep', 'cpr', 'solids'];
        
        courseIds.forEach(courseId => {
            const badge = document.querySelector(`.enrolled-badge[data-course="${courseId}"]`);
            if (badge && enrollments.includes(courseId)) {
                badge.style.display = 'inline-block';
            }
        });
        
        // Show/hide premium features based on enrollment
        const premiumFeatures = document.querySelectorAll('.premium-feature');
        premiumFeatures.forEach(feature => {
            const requiredCourse = feature.dataset.requiredCourse;
            if (requiredCourse && enrollments.includes(requiredCourse)) {
                feature.style.display = 'block';
            }
        });
        
    } catch (error) {
        console.error('Error updating premium content:', error);
    }
}

function resetPremiumContent() {
    try {
        document.querySelectorAll('.enrolled-badge').forEach(badge => badge.remove());
    } catch (error) {
        console.error('Error resetting premium content:', error);
    }
}

function showWelcomeMessage(email) {
    const homeSection = document.getElementById('home');
    if (!homeSection || !email) return;
    homeSection.querySelectorAll('.welcome-banner').forEach(b => b.remove());

    const profile = getStoredAuthProfile();
    const displayName = getAuthDisplayName(email);
    const stageLabel = getAuthStageLabel(profile.stage || profile.lastFocus);
    const priority = profile.carePriority ? getAuthStageLabel(profile.carePriority) : 'Personal guidance';
    
    const welcomeBanner = document.createElement('div');
    welcomeBanner.className = 'welcome-banner';
    welcomeBanner.innerHTML = `
        <div class="welcome-content">
            <h3>Welcome back, ${displayName}</h3>
            <p>Your ${stageLabel.toLowerCase()} dashboard is ready. Continue trackers, courses, names, and AI care guidance from where you left off.</p>
            <small>${priority}</small>
        </div>
    `;
    
    const heroContent = homeSection.querySelector('.hero-content');
    if (heroContent) {
        heroContent.insertBefore(welcomeBanner, heroContent.firstChild);
    }
}

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================

function showNotification(message, type = 'info') {
    window.bcNotificationState = window.bcNotificationState || { items: [], unread: 0 };
    
    const ensureUi = () => {
        if (!document.body) return;
        
        let toggle = document.getElementById('bcNotifyToggle');
        let panel = document.getElementById('bcNotifyPanel');
        
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.id = 'bcNotifyToggle';
            toggle.type = 'button';
            toggle.className = 'bc-notify-toggle';
            toggle.setAttribute('aria-label', 'Notifications');
            toggle.textContent = '🔔';
            
            const badge = document.createElement('div');
            badge.id = 'bcNotifyBadge';
            badge.className = 'bc-notify-badge';
            badge.style.display = 'none';
            toggle.appendChild(badge);
            
            document.body.appendChild(toggle);
        }
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'bcNotifyPanel';
            panel.className = 'bc-notify-panel';
            panel.innerHTML = `
                <div class="bc-notify-head">
                    <div class="bc-notify-title">Notifications</div>
                    <div class="bc-notify-actions">
                        <button type="button" class="bc-notify-btn" id="bcNotifyClear">Clear</button>
                        <button type="button" class="bc-notify-btn" id="bcNotifyClose">Close</button>
                    </div>
                </div>
                <div class="bc-notify-list" id="bcNotifyList"></div>
            `;
            document.body.appendChild(panel);
            
            panel.querySelector('#bcNotifyClose').addEventListener('click', () => {
                panel.classList.remove('open');
            });
            
            panel.querySelector('#bcNotifyClear').addEventListener('click', () => {
                window.bcNotificationState.items = [];
                window.bcNotificationState.unread = 0;
                renderList();
                updateBadge();
            });
            
            document.addEventListener('click', (e) => {
                const t = e.target;
                if (!panel.classList.contains('open')) return;
                if (t.closest && (t.closest('#bcNotifyPanel') || t.closest('#bcNotifyToggle'))) return;
                panel.classList.remove('open');
            });
        }
        
        const updateBadge = () => {
            const badge = document.getElementById('bcNotifyBadge');
            if (!badge) return;
            const count = window.bcNotificationState.unread;
            if (count > 0) {
                badge.style.display = 'grid';
                badge.textContent = String(Math.min(count, 99));
            } else {
                badge.style.display = 'none';
                badge.textContent = '';
            }
        };
        
        const renderList = () => {
            const list = document.getElementById('bcNotifyList');
            if (!list) return;
            list.innerHTML = '';
            
            const items = window.bcNotificationState.items.slice(-80).slice().reverse();
            if (!items.length) {
                const empty = document.createElement('div');
                empty.className = 'bc-notify-empty';
                empty.textContent = 'No notifications yet';
                list.appendChild(empty);
                return;
            }
            
            items.forEach((item) => {
                const wrap = document.createElement('div');
                wrap.className = 'bc-notify-item';
                
                const k = document.createElement('div');
                k.className = 'bc-notify-item-k';
                k.textContent = `${item.type.toUpperCase()} • ${item.time}`;
                
                const v = document.createElement('div');
                v.className = 'bc-notify-item-v';
                v.textContent = item.message;
                
                wrap.appendChild(k);
                wrap.appendChild(v);
                list.appendChild(wrap);
            });
        };
        
        window.bcNotifyRenderList = renderList;
        window.bcNotifyUpdateBadge = updateBadge;
        
        if (!toggle.dataset.bound) {
            toggle.dataset.bound = '1';
            toggle.addEventListener('click', () => {
                const p = document.getElementById('bcNotifyPanel');
                if (!p) return;
                const nextOpen = !p.classList.contains('open');
                if (nextOpen) {
                    window.bcNotificationState.unread = 0;
                    if (typeof window.bcNotifyRenderList === 'function') window.bcNotifyRenderList();
                    if (typeof window.bcNotifyUpdateBadge === 'function') window.bcNotifyUpdateBadge();
                    p.classList.add('open');
                } else {
                    p.classList.remove('open');
                }
            });
        }
        
        renderList();
        updateBadge();
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #00d4aa, #00d4aa)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ff6b9d, #ff6b9d)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ff8fab, #ff9800)';
            break;
        case 'info':
        default:
            notification.style.background = 'linear-gradient(135deg, #17a2b8, #138496)';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRequired(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
    }
}

function formatDate(date, format = 'short') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    switch(format) {
        case 'long':
            return d.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        case 'medium':
            return d.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        case 'short':
        default:
            return d.toLocaleDateString('en-US');
    }
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function calculateWeeksBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return diffWeeks;
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        if (window.DB_SYNC && /^mamasafe_|^pregnancy/i.test(key)) {
            window.DB_SYNC.saveLocalRecord(key, data);
        }
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function generateId(prefix = 'id') {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

// ==========================================
// PROFESSIONAL HELP SECTION
// ==========================================

const rwandaDistricts = [
    { district: 'Nyarugenge', province: 'Kigali City', city: 'Kigali', lat: -1.9499, lng: 30.0588 },
    { district: 'Gasabo', province: 'Kigali City', city: 'Kigali', lat: -1.9186, lng: 30.1044 },
    { district: 'Kicukiro', province: 'Kigali City', city: 'Kigali', lat: -1.9846, lng: 30.1076 },
    { district: 'Bugesera', province: 'Eastern Province', city: 'Nyamata', lat: -2.1418, lng: 30.1031 },
    { district: 'Gatsibo', province: 'Eastern Province', city: 'Kabarore', lat: -1.6508, lng: 30.4567 },
    { district: 'Kayonza', province: 'Eastern Province', city: 'Kayonza', lat: -1.9359, lng: 30.4728 },
    { district: 'Kirehe', province: 'Eastern Province', city: 'Kirehe', lat: -2.2603, lng: 30.7338 },
    { district: 'Ngoma', province: 'Eastern Province', city: 'Kibungo', lat: -2.1597, lng: 30.5427 },
    { district: 'Nyagatare', province: 'Eastern Province', city: 'Nyagatare', lat: -1.3003, lng: 30.3252 },
    { district: 'Rwamagana', province: 'Eastern Province', city: 'Rwamagana', lat: -1.9486, lng: 30.4347 },
    { district: 'Burera', province: 'Northern Province', city: 'Cyanika', lat: -1.4817, lng: 29.8564 },
    { district: 'Gakenke', province: 'Northern Province', city: 'Gakenke', lat: -1.7028, lng: 29.7850 },
    { district: 'Gicumbi', province: 'Northern Province', city: 'Byumba', lat: -1.5763, lng: 30.0675 },
    { district: 'Musanze', province: 'Northern Province', city: 'Musanze', lat: -1.4998, lng: 29.6347 },
    { district: 'Rulindo', province: 'Northern Province', city: 'Rulindo', lat: -1.7397, lng: 29.9958 },
    { district: 'Gisagara', province: 'Southern Province', city: 'Gisagara', lat: -2.5883, lng: 29.8489 },
    { district: 'Huye', province: 'Southern Province', city: 'Huye', lat: -2.5967, lng: 29.7394 },
    { district: 'Kamonyi', province: 'Southern Province', city: 'Kamonyi', lat: -2.0047, lng: 29.9167 },
    { district: 'Muhanga', province: 'Southern Province', city: 'Muhanga', lat: -2.0833, lng: 29.7500 },
    { district: 'Nyamagabe', province: 'Southern Province', city: 'Nyamagabe', lat: -2.4667, lng: 29.5667 },
    { district: 'Nyanza', province: 'Southern Province', city: 'Nyanza', lat: -2.3519, lng: 29.7509 },
    { district: 'Nyaruguru', province: 'Southern Province', city: 'Nyaruguru', lat: -2.6991, lng: 29.5667 },
    { district: 'Ruhango', province: 'Southern Province', city: 'Ruhango', lat: -2.2208, lng: 29.7806 },
    { district: 'Karongi', province: 'Western Province', city: 'Kibuye', lat: -2.0603, lng: 29.3478 },
    { district: 'Ngororero', province: 'Western Province', city: 'Ngororero', lat: -1.8607, lng: 29.6328 },
    { district: 'Nyabihu', province: 'Western Province', city: 'Mukamira', lat: -1.6564, lng: 29.5572 },
    { district: 'Nyamasheke', province: 'Western Province', city: 'Nyamasheke', lat: -2.3286, lng: 29.1478 },
    { district: 'Rubavu', province: 'Western Province', city: 'Gisenyi', lat: -1.7028, lng: 29.2564 },
    { district: 'Rusizi', province: 'Western Province', city: 'Cyangugu', lat: -2.4846, lng: 28.9075 },
    { district: 'Rutsiro', province: 'Western Province', city: 'Rutsiro', lat: -1.9483, lng: 29.3317 }
];

const featuredRwandaHospitals = [
    { name: 'King Faisal Hospital Rwanda', category: 'private', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 544 St, Gasabo, Kigali', phone: '+250788000101', hours: '24 hours', maternity: 'Specialist and emergency services', services: ['Emergency', 'Specialist care', 'Maternity referral'], lat: -1.9359, lng: 30.0925 },
    { name: 'University Teaching Hospital of Kigali', category: 'public', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'Nyarugenge, Kigali', phone: '+250788000102', hours: '24 hours', maternity: 'National referral hospital', services: ['Emergency', 'Maternity referral', 'Specialist care'], lat: -1.9536, lng: 30.0619 },
    { name: 'Rwanda Military Hospital', category: 'public', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'Kanombe, Kicukiro, Kigali', phone: '+250788000103', hours: '24 hours', maternity: 'Emergency and referral care', services: ['Emergency', 'Maternity', 'Surgery'], lat: -1.9706, lng: 30.1394 },
    { name: 'Kibagabaga Hospital', category: 'public', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'Kibagabaga, Gasabo, Kigali', phone: '+250788000104', hours: '24 hours', maternity: 'Maternity services available', services: ['Emergency', 'Maternity', 'Labor ward'], lat: -1.9179, lng: 30.1135 },
    { name: 'Muhima Hospital', category: 'maternal', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'Muhima, Nyarugenge, Kigali', phone: '+250788000105', hours: '24 hours', maternity: 'Maternal and neonatal care', services: ['Maternity', 'Neonatal care', 'Labor ward'], lat: -1.9408, lng: 30.0617 },
    { name: 'Butaro District Hospital', category: 'public', district: 'Burera', city: 'Butaro', province: 'Northern Province', address: 'Butaro, Burera District', phone: '+250788000106', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -1.4080, lng: 29.8400 },
    { name: 'Ruhengeri Referral Hospital', category: 'public', district: 'Musanze', city: 'Musanze', province: 'Northern Province', address: 'Musanze District', phone: '+250788000107', hours: '24 hours', maternity: 'Referral and maternity services', services: ['Emergency', 'Maternity referral', 'Labor ward'], lat: -1.5005, lng: 29.6326 },
    { name: 'Gisenyi District Hospital', category: 'public', district: 'Rubavu', city: 'Gisenyi', province: 'Western Province', address: 'Gisenyi, Rubavu District', phone: '+250788000108', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -1.7009, lng: 29.2579 },
    { name: 'Kibuye Hospital', category: 'public', district: 'Karongi', city: 'Kibuye', province: 'Western Province', address: 'Kibuye, Karongi District', phone: '+250788000109', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -2.0608, lng: 29.3468 },
    { name: 'Gihundwe Hospital', category: 'public', district: 'Rusizi', city: 'Cyangugu', province: 'Western Province', address: 'Cyangugu, Rusizi District', phone: '+250788000110', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -2.4849, lng: 28.9072 },
    { name: 'Butare University Teaching Hospital', category: 'public', district: 'Huye', city: 'Huye', province: 'Southern Province', address: 'Huye District', phone: '+250788000111', hours: '24 hours', maternity: 'Referral and maternity services', services: ['Emergency', 'Maternity referral', 'Specialist care'], lat: -2.5964, lng: 29.7393 },
    { name: 'Nyanza Hospital', category: 'public', district: 'Nyanza', city: 'Nyanza', province: 'Southern Province', address: 'Nyanza District', phone: '+250788000112', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -2.3514, lng: 29.7502 },
    { name: 'Kibungo Hospital', category: 'public', district: 'Ngoma', city: 'Kibungo', province: 'Eastern Province', address: 'Kibungo, Ngoma District', phone: '+250788000113', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -2.1592, lng: 30.5420 },
    { name: 'Rwamagana Provincial Hospital', category: 'public', district: 'Rwamagana', city: 'Rwamagana', province: 'Eastern Province', address: 'Rwamagana District', phone: '+250788000114', hours: '24 hours', maternity: 'Provincial maternity and emergency care', services: ['Emergency', 'Maternity referral', 'Labor ward'], lat: -1.9489, lng: 30.4344 },
    { name: 'Nyagatare District Hospital', category: 'public', district: 'Nyagatare', city: 'Nyagatare', province: 'Eastern Province', address: 'Nyagatare District', phone: '+250788000115', hours: '24 hours', maternity: 'District hospital maternity care', services: ['Emergency', 'Maternity', 'District hospital'], lat: -1.3000, lng: 30.3249 }
];

const districtMaternityCenters = rwandaDistricts.map((item, index) => ({
    name: `${item.district} Maternal Care Center`,
    category: 'maternal',
    district: item.district,
    city: item.city,
    province: item.province,
    address: `${item.city}, ${item.district} District`,
    phone: `+2507881${String(index + 1).padStart(5, '0')}`,
    hours: '24 hours',
    maternity: 'District maternity and emergency referral support',
    services: ['Maternity', 'Prenatal care', 'Emergency referral'],
    lat: item.lat,
    lng: item.lng
}));

const featuredHospitalNames = new Set(featuredRwandaHospitals.map(hospital => hospital.name.toLowerCase()));

const districtHospitals = rwandaDistricts
    .map((item, index) => ({
        name: `${item.district} District Hospital`,
        category: 'public',
        district: item.district,
        city: item.city,
        province: item.province,
        address: `${item.city}, ${item.district} District`,
        phone: `+2507882${String(index + 1).padStart(5, '0')}`,
        hours: '24 hours',
        maternity: 'District hospital with maternity and emergency referral support',
        services: ['Emergency', 'Maternity', 'District hospital', 'Prenatal care'],
        lat: item.lat + 0.006,
        lng: item.lng + 0.006
    }))
    .filter(hospital => !featuredHospitalNames.has(hospital.name.toLowerCase()));

const helpHospitals = [...featuredRwandaHospitals, ...districtHospitals, ...districtMaternityCenters];

// Pharmacy data
const featuredRwandaPharmacies = [
    { name: 'City Pharmacy', category: 'retail', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'KN 4 St, Nyarugenge, Kigali', phone: '+250788300001', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter', 'Vaccinations'], lat: -1.9520, lng: 30.0605 },
    { name: 'Good Life Pharmacy', category: 'retail', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 7 Ave, Gasabo, Kigali', phone: '+250788300002', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter', 'Health checks'], lat: -1.9200, lng: 30.1020 },
    { name: 'HealthPlus Pharmacy', category: 'retail', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'KK 508 St, Kicukiro, Kigali', phone: '+250788300003', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter', 'Delivery'], lat: -1.9850, lng: 30.1080 },
    { name: 'Primecare Pharmacy', category: 'retail', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 2 Ave, Kigali', phone: '+250788300004', hours: '07:00 - 23:00', services: ['Prescription', 'Over-the-counter', '24h on-call'], lat: -1.9300, lng: 30.0850 },
    { name: 'Aegis Pharmacy', category: 'retail', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KN 11 St, Remera, Kigali', phone: '+250788300005', hours: '07:00 - 23:00', services: ['Prescription', 'Over-the-counter', 'Delivery'], lat: -1.9550, lng: 30.1200 },
    { name: 'Zenith Pharmacy', category: 'retail', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'KK 1 Rd, Kigali', phone: '+250788300006', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter'], lat: -1.9700, lng: 30.1100 },
    { name: 'Pharmacy One', category: 'retail', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'KN 3 Ave, Kigali', phone: '+250788300007', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter'], lat: -1.9480, lng: 30.0550 },
    { name: 'Butare Main Pharmacy', category: 'retail', district: 'Huye', city: 'Butare', province: 'Southern Province', address: 'Main Street, Butare', phone: '+250788500001', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -2.5985, lng: 29.7328 },
    { name: 'Musanze Community Pharmacy', category: 'retail', district: 'Musanze', city: 'Ruhengeri', province: 'Northern Province', address: 'Main Road, Ruhengeri', phone: '+250788500002', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -1.4975, lng: 29.6333 },
    { name: 'Rubavu Pharmacy', category: 'retail', district: 'Rubavu', city: 'Gisenyi', province: 'Western Province', address: 'Gisenyi Main Road', phone: '+250788500003', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -1.6933, lng: 29.2417 },
    { name: 'Nyagatare Pharmacy', category: 'retail', district: 'Nyagatare', city: 'Nyagatare', province: 'Eastern Province', address: 'Nyagatare Town', phone: '+250788500004', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -1.3050, lng: 30.2700 },
    { name: 'King Faisal Hospital Pharmacy', category: 'hospital', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 544 St, Gasabo, Kigali', phone: '+250788000101', hours: '24 hours', services: ['Prescription', 'Over-the-counter', 'Emergency'], lat: -1.9365, lng: 30.0920 },
    { name: 'Rwanda Military Hospital Pharmacy', category: 'hospital', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'Kanombe, Kicukiro, Kigali', phone: '+250788000103', hours: '24 hours', services: ['Prescription', 'Over-the-counter', 'Emergency'], lat: -1.9710, lng: 30.1400 }
];

const districtPharmacies = rwandaDistricts.map((item, index) => ({
    name: `${item.district} Community Pharmacy`,
    category: 'community',
    district: item.district,
    city: item.city,
    province: item.province,
    address: `${item.city}, ${item.district} District`,
    phone: `+2507884${String(index + 1).padStart(5, '0')}`,
    hours: '08:00 - 20:00',
    services: ['Prescription', 'Over-the-counter', 'Health advice'],
    lat: item.lat - 0.002,
    lng: item.lng - 0.002
}));

const helpPharmacies = [...featuredRwandaPharmacies, ...districtPharmacies];

function setHelpPanel(panelId = 'dashboard') {
    const validPanel = document.getElementById(`ph-${panelId}-panel`) ? panelId : 'dashboard';
    document.querySelectorAll('.ph-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('[data-help-tab]').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`ph-${validPanel}-panel`)?.classList.add('active');
    document.querySelector(`[data-help-tab="${validPanel}"]`)?.classList.add('active');
}

async function performAISearch() {
    const query = document.getElementById('helpAISearch')?.value?.trim();
    const statusEl = document.getElementById('helpAISearchStatus');
    const resultsEl = document.getElementById('helpAISearchResults');
    const btn = document.getElementById('helpAISearchBtn');

    if (!query) {
        showNotification('Please enter a search query', 'warning');
        return;
    }

    statusEl.textContent = 'Searching with Llama AI...';
    btn.disabled = true;
    btn.textContent = 'Searching...';
    resultsEl.innerHTML = '';

    try {
        const response = await fetch('/api/ai-search-facilities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Search failed');
        }

        if (!data.results || data.results.length === 0) {
            statusEl.textContent = 'No facilities found for your query.';
            resultsEl.innerHTML = '<div class="ph-list-card"><div><h3>No results</h3><p>Try a different search term.</p></div></div>';
            return;
        }

        statusEl.textContent = `Found ${data.results.length} results using ${data.aiModel}.`;
        resultsEl.innerHTML = data.results.map(facility => {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.name} ${facility.address}`)}`;
            const serviceTags = facility.services.map(service => `<span class="ph-tag">${service}</span>`).join('');
            return `
                <div class="ph-list-card">
                    <div>
                        <span class="ph-tag">${facility.type === 'hospital' ? '🏥 Hospital' : '💊 Pharmacy'}</span>
                        <h3>${facility.name}</h3>
                        <p>${facility.address}</p>
                        <small>${facility.district ? `${facility.district} District, ` : ''}${facility.province || 'Rwanda'}</small>
                        <small>Hours: ${facility.hours}</small>
                        <div class="ph-tag-row">${serviceTags}</div>
                    </div>
                    <div class="ph-list-actions">
                        <a href="${mapUrl}" target="_blank" rel="noopener">View Map</a>
                        <a href="tel:${facility.phone}">Call</a>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('AI Search Error:', error);
        statusEl.textContent = 'Search failed. Please try again.';
        showNotification('Search failed: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Search with Llama';
    }
}

function initializeProfessionalHelp() {
    renderHelpHospitals(helpHospitals);
    renderHelpHospitalSuggestions();
    renderHelpPharmacies(helpPharmacies);
    renderHelpPharmacySuggestions();
    renderHelpBookings();
    renderHelpBookingSuggestions();

    const helpSection = document.getElementById('help-section');
    if (helpSection?.dataset.initialized === 'true') return;

    document.getElementById('helpHospitalSearch')?.addEventListener('input', filterHelpHospitals);
    document.getElementById('helpHospitalCategory')?.addEventListener('change', filterHelpHospitals);
    document.getElementById('helpPharmacySearch')?.addEventListener('input', filterHelpPharmacies);
    document.getElementById('helpPharmacyCategory')?.addEventListener('change', filterHelpPharmacies);
    document.getElementById('helpBookingSearch')?.addEventListener('input', filterHelpBookings);
    document.getElementById('helpBookingCategory')?.addEventListener('change', filterHelpBookings);
    if (helpSection) helpSection.dataset.initialized = 'true';
}

function renderHelpHospitalSuggestions() {
    const datalist = document.getElementById('helpHospitalSuggestions');
    if (!datalist) return;

    const values = new Set();
    rwandaDistricts.forEach(item => {
        values.add(item.district);
        values.add(`${item.district} District`);
        values.add(item.city);
        values.add(item.province);
    });
    helpHospitals.forEach(hospital => {
        values.add(hospital.name);
        values.add(hospital.city);
        values.add(hospital.district);
    });

    datalist.innerHTML = [...values]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map(value => `<option value="${value}"></option>`)
        .join('');
}

function renderHelpHospitals(hospitals) {
    const list = document.getElementById('helpHospitalList');
    if (!list) return;
    if (!hospitals.length) {
        list.innerHTML = '<div class="ph-list-card"><div><h3>No facilities found</h3><p>Try another city, service, or category.</p></div></div>';
        return;
    }
    list.innerHTML = hospitals.map(hospital => {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name} ${hospital.address}`)}`;
        const serviceTags = hospital.services.map(service => `<span class="ph-tag">${service}</span>`).join('');
        const distance = hospital.distance ? `<small>Distance: ${hospital.distance.toFixed(1)} km</small>` : '';
        return `
            <article class="ph-list-card">
                <div>
                    <h3>${hospital.name}</h3>
                    <p>${hospital.maternity}</p>
                    <small>${hospital.address}</small>
                    <small>${hospital.district ? `${hospital.district} District, ` : ''}${hospital.province || 'Rwanda'}</small>
                    <small>Hours: ${hospital.hours}</small>
                    ${distance}
                    <div class="ph-tag-row">${serviceTags}</div>
                </div>
                <div class="ph-list-actions">
                    <a href="${mapUrl}" target="_blank" rel="noopener">View Map</a>
                    <a href="tel:${hospital.phone}">Call</a>
                </div>
            </article>
        `;
    }).join('');
}

function normalizeHelpText(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getHelpSearchContext(query = '') {
    const normalizedQuery = normalizeHelpText(query);
    if (!normalizedQuery) return null;

    const district = rwandaDistricts.find(item => {
        const districtName = normalizeHelpText(item.district);
        const districtLabel = normalizeHelpText(`${item.district} District`);
        const cityName = normalizeHelpText(item.city);
        return normalizedQuery === districtName || normalizedQuery === districtLabel || normalizedQuery === cityName;
    });
    if (district) return { type: 'district', ...district };

    const province = rwandaDistricts.find(item => normalizeHelpText(item.province) === normalizedQuery);
    if (province) return { type: 'province', province: province.province };

    return null;
}

function sortHospitalsForHelpContext(hospitals, context) {
    if (!context) return hospitals;

    return [...hospitals].sort((a, b) => {
        const aSameDistrict = context.district && a.district === context.district ? 0 : 1;
        const bSameDistrict = context.district && b.district === context.district ? 0 : 1;
        if (aSameDistrict !== bSameDistrict) return aSameDistrict - bSameDistrict;

        if (context.lat && context.lng) {
            const aDistance = getDistanceKm(context.lat, context.lng, a.lat, a.lng);
            const bDistance = getDistanceKm(context.lat, context.lng, b.lat, b.lng);
            if (aDistance !== bDistance) return aDistance - bDistance;
        }

        return a.name.localeCompare(b.name);
    });
}

function filterHelpHospitals() {
    const query = document.getElementById('helpHospitalSearch')?.value?.trim().toLowerCase() || '';
    const category = document.getElementById('helpHospitalCategory')?.value || 'all';
    const context = getHelpSearchContext(query);
    const filtered = helpHospitals.filter(hospital => {
        const searchable = `${hospital.name} ${hospital.address} ${hospital.city} ${hospital.district || ''} ${hospital.province || ''} ${hospital.services.join(' ')}`.toLowerCase();
        const matchesQuery = !query
            || searchable.includes(query)
            || (context?.type === 'district' && hospital.province === context.province)
            || (context?.type === 'province' && hospital.province === context.province);
        const matchesCategory = category === 'all' || hospital.category === category || hospital.services.join(' ').toLowerCase().includes(category);
        return matchesQuery && matchesCategory;
    });
    const sorted = sortHospitalsForHelpContext(filtered, context);
    renderHelpHospitals(sorted);
    const status = document.getElementById('helpGpsStatus');
    if (status) {
        status.textContent = sorted.length
            ? context?.type === 'district'
                ? `Showing ${sorted.length} facilities in ${context.province}, with ${context.district} District listed first.`
                : `Showing ${sorted.length} Rwanda healthcare facilities matching your search.`
            : 'No matches found. Try a district like Gasabo, Huye, Rubavu, Musanze, or Nyagatare.';
    }
}

function showHelpGpsFallback(message) {
    const status = document.getElementById('helpGpsStatus');
    filterHelpHospitals();
    if (status) status.textContent = `${message} Search by district/city instead and Mamasafe will show the wider regional list.`;
    showNotification(message, 'warning');
}

function useHelpLocation() {
    const status = document.getElementById('helpGpsStatus');
    if (!navigator.geolocation) {
        showHelpGpsFallback('GPS is not available in this browser.');
        return;
    }
    if (!window.isSecureContext) {
        showHelpGpsFallback('GPS needs HTTPS or localhost to work in most browsers.');
        return;
    }
    if (status) status.textContent = 'Requesting GPS permission. Please allow location access to find nearby hospitals.';
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        
        // Find the closest district to get the province
        const closestDistrict = rwandaDistricts
            .map(district => ({
                ...district,
                distance: getDistanceKm(latitude, longitude, district.lat, district.lng)
            }))
            .sort((a, b) => a.distance - b.distance)[0];
        
        // Sort all hospitals by distance from GPS (closest first)
        const sorted = helpHospitals
            .map(hospital => ({ ...hospital, distance: getDistanceKm(latitude, longitude, hospital.lat, hospital.lng) }))
            .sort((a, b) => a.distance - b.distance);

        renderHelpHospitals(sorted.slice(0, 20));

        if (status) {
            status.textContent = `GPS found your location near ${closestDistrict.district}, ${closestDistrict.province}. Showing the nearest hospitals overall.`;
        }
        showNotification(`Hospitals sorted by your current GPS location.`, 'success');

    }, (error) => {
        const message = error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Could not get your GPS location. Check location services and try again.';
        showHelpGpsFallback(message);
    }, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
    });
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const radius = 6371;
    const toRad = value => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function renderHelpBookings(hospitals = helpHospitals) {
    const list = document.getElementById('helpBookingList');
    if (!list) return;
    if (!hospitals.length) {
        list.innerHTML = '<div class="ph-list-card"><div><h3>No hospitals found</h3><p>Try a different search term or category.</p></div></div>';
        return;
    }
    list.innerHTML = hospitals.map(hospital => {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name} ${hospital.address || ''}`)}`;
        const serviceTags = (hospital.services || []).map(service => `<span class="ph-tag">${service}</span>`).join('');
        return `
            <article class="ph-list-card">
                <div>
                    <h3>${hospital.name}</h3>
                    <p>${hospital.maternity || hospital.description || 'Healthcare facility'}</p>
                    <small>${hospital.hours || '24/7'}</small>
                    ${hospital.address ? `<small>${hospital.address}</small>` : ''}
                    ${hospital.district ? `<small>${hospital.district} District, ${hospital.province || 'Rwanda'}</small>` : ''}
                    <div class="ph-tag-row">${serviceTags}</div>
                </div>
                <div class="ph-list-actions">
                    <a href="https://www.google.com/search?q=${encodeURIComponent(`${hospital.name} appointment booking`)}" target="_blank" rel="noopener">Book Website</a>
                    <a href="tel:${hospital.phone}">Call Clinic</a>
                    <a href="${mapUrl}" target="_blank" rel="noopener">View Map</a>
                </div>
            </article>
        `;
    }).join('');
}

function renderHelpBookingSuggestions() {
    const datalist = document.getElementById('helpBookingSuggestions');
    if (!datalist) return;
    const values = new Set();
    helpHospitals.forEach(hospital => {
        values.add(hospital.name);
        if (hospital.city) values.add(hospital.city);
        if (hospital.district) {
            values.add(hospital.district);
            values.add(`${hospital.district} District`);
        }
        if (hospital.province) values.add(hospital.province);
    });
    datalist.innerHTML = [...values]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map(value => `<option value="${value}"></option>`)
        .join('');
}

function normalizeHelpBookingText(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getHelpBookingSearchContext(query = '') {
    const normalizedQuery = normalizeHelpBookingText(query);
    if (!normalizedQuery) return null;
    const district = rwandaDistricts.find(item => {
        const districtName = normalizeHelpBookingText(item.district);
        const districtLabel = normalizeHelpBookingText(`${item.district} District`);
        const cityName = normalizeHelpBookingText(item.city);
        return normalizedQuery === districtName || normalizedQuery === districtLabel || normalizedQuery === cityName;
    });
    if (district) return { type: 'district', ...district };
    const province = rwandaDistricts.find(item => normalizeHelpBookingText(item.province) === normalizedQuery);
    if (province) return { type: 'province', province: province.province };
    return null;
}

function sortBookingsForHelpContext(hospitals, context) {
    if (!context) return hospitals;
    return [...hospitals].sort((a, b) => {
        const aSameDistrict = context.district && a.district === context.district ? 0 : 1;
        const bSameDistrict = context.district && b.district === context.district ? 0 : 1;
        if (aSameDistrict !== bSameDistrict) return aSameDistrict - bSameDistrict;
        if (context.lat && context.lng && a.lat && a.lng && b.lat && b.lng) {
            const aDistance = getDistanceKm(context.lat, context.lng, a.lat, a.lng);
            const bDistance = getDistanceKm(context.lat, context.lng, b.lat, b.lng);
            if (aDistance !== bDistance) return aDistance - bDistance;
        }
        return a.name.localeCompare(b.name);
    });
}

function filterHelpBookings() {
    const query = document.getElementById('helpBookingSearch')?.value?.trim().toLowerCase() || '';
    const category = document.getElementById('helpBookingCategory')?.value || 'all';
    const context = getHelpBookingSearchContext(query);
    const filtered = helpHospitals.filter(hospital => {
        const searchable = `${hospital.name} ${hospital.address || ''} ${hospital.city || ''} ${hospital.district || ''} ${hospital.province || ''} ${(hospital.services || []).join(' ')}`.toLowerCase();
        let matchesQuery = !query || searchable.includes(query);
        if (context?.type === 'district' || context?.type === 'province') {
            matchesQuery = !query || searchable.includes(query) || hospital.province === context.province;
        }
        let matchesCategory = category === 'all';
        if (category === 'public') {
            matchesCategory = !hospital.name.toLowerCase().includes('private');
        } else if (category === 'private') {
            matchesCategory = hospital.name.toLowerCase().includes('private') || hospital.name.toLowerCase().includes('clinic');
        } else if (category === 'maternal') {
            matchesCategory = hospital.maternity || (hospital.services || []).some(s => s.toLowerCase().includes('maternal') || s.toLowerCase().includes('maternity'));
        } else if (category === 'emergency') {
            matchesCategory = (hospital.services || []).some(s => s.toLowerCase().includes('emergency'));
        }
        return matchesQuery && matchesCategory;
    });
    const sorted = sortBookingsForHelpContext(filtered, context);
    renderHelpBookings(sorted);
}

function renderHelpPharmacies(pharmacies) {
    console.log('[renderHelpPharmacies] rendering', pharmacies.length, 'pharmacies:', pharmacies.map(p => p.name));
    const list = document.getElementById('helpPharmacyList');
    if (!list) return;
    if (!pharmacies.length) {
        list.innerHTML = '<div class="ph-list-card"><div><h3>No pharmacies found</h3><p>Try another city, service, or category.</p></div></div>';
        return;
    }
    list.innerHTML = pharmacies.map(pharmacy => {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`)}`;
        const serviceTags = pharmacy.services.map(service => `<span class="ph-tag">${service}</span>`).join('');
        const distance = pharmacy.distance ? `<small>Distance: ${pharmacy.distance.toFixed(1)} km</small>` : '';
        return `
            <article class="ph-list-card">
                <div>
                    <h3>${pharmacy.name}</h3>
                    <p>${pharmacy.category.charAt(0).toUpperCase() + pharmacy.category.slice(1)} pharmacy</p>
                    <small>${pharmacy.address}</small>
                    <small>${pharmacy.district ? `${pharmacy.district} District, ` : ''}${pharmacy.province || 'Rwanda'}</small>
                    <small>Hours: ${pharmacy.hours}</small>
                    ${distance}
                    <div class="ph-tag-row">${serviceTags}</div>
                </div>
                <div class="ph-list-actions">
                    <a href="${mapUrl}" target="_blank" rel="noopener">View Map</a>
                    <a href="tel:${pharmacy.phone}">Call</a>
                </div>
            </article>
        `;
    }).join('');
}

function renderHelpPharmacySuggestions() {
    const datalist = document.getElementById('helpPharmacySuggestions');
    if (!datalist) return;

    const values = new Set();
    rwandaDistricts.forEach(item => {
        values.add(item.district);
        values.add(`${item.district} District`);
        values.add(item.city);
        values.add(item.province);
    });
    helpPharmacies.forEach(pharmacy => {
        values.add(pharmacy.name);
        values.add(pharmacy.city);
        values.add(pharmacy.district);
    });

    datalist.innerHTML = [...values]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map(value => `<option value="${value}"></option>`)
        .join('');
}

function normalizeHelpPharmacyText(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getHelpPharmacySearchContext(query = '') {
    const normalizedQuery = normalizeHelpPharmacyText(query);
    if (!normalizedQuery) return null;

    const district = rwandaDistricts.find(item => {
        const districtName = normalizeHelpPharmacyText(item.district);
        const districtLabel = normalizeHelpPharmacyText(`${item.district} District`);
        const cityName = normalizeHelpPharmacyText(item.city);
        return normalizedQuery === districtName || normalizedQuery === districtLabel || normalizedQuery === cityName;
    });
    if (district) return { type: 'district', ...district };

    const province = rwandaDistricts.find(item => normalizeHelpPharmacyText(item.province) === normalizedQuery);
    if (province) return { type: 'province', province: province.province };

    return null;
}

function sortPharmaciesForHelpContext(pharmacies, context) {
    if (!context) return pharmacies;

    return [...pharmacies].sort((a, b) => {
        const aSameDistrict = context.district && a.district === context.district ? 0 : 1;
        const bSameDistrict = context.district && b.district === context.district ? 0 : 1;
        if (aSameDistrict !== bSameDistrict) return aSameDistrict - bSameDistrict;

        if (context.lat && context.lng) {
            const aDistance = getDistanceKm(context.lat, context.lng, a.lat, a.lng);
            const bDistance = getDistanceKm(context.lat, context.lng, b.lat, b.lng);
            if (aDistance !== bDistance) return aDistance - bDistance;
        }

        return a.name.localeCompare(b.name);
    });
}

function filterHelpPharmacies() {
    const query = document.getElementById('helpPharmacySearch')?.value?.trim().toLowerCase() || '';
    const category = document.getElementById('helpPharmacyCategory')?.value || 'all';
    console.log('[filterHelpPharmacies] searching for:', query, 'category:', category);
    const context = getHelpPharmacySearchContext(query);
    console.log('[filterHelpPharmacies] context:', context);
    const filtered = helpPharmacies.filter(pharmacy => {
        const searchable = `${pharmacy.name} ${pharmacy.address} ${pharmacy.city} ${pharmacy.district || ''} ${pharmacy.province || ''} ${pharmacy.services.join(' ')}`.toLowerCase();
        const matchesQuery = !query
            || searchable.includes(query)
            || (context?.type === 'district' && pharmacy.province === context.province)
            || (context?.type === 'province' && pharmacy.province === context.province);
        const matchesCategory = category === 'all' || pharmacy.category === category;
        return matchesQuery && matchesCategory;
    });
    console.log('[filterHelpPharmacies] filtered:', filtered.map(p => p.name));
    const sorted = sortPharmaciesForHelpContext(filtered, context);
    renderHelpPharmacies(sorted.slice(0, 20));
    const status = document.getElementById('helpPharmacyGpsStatus');
    if (status) {
        status.textContent = sorted.length
            ? context?.type === 'district'
                ? `Showing ${sorted.length} pharmacies in ${context.province}, with ${context.district} District listed first.`
                : `Showing ${sorted.length} Rwanda pharmacies matching your search.`
            : 'No matches found. Try a district like Gasabo, Huye, Rubavu, Musanze, or Nyagatare.';
    }
}

function showHelpPharmacyGpsFallback(message) {
    const status = document.getElementById('helpPharmacyGpsStatus');
    filterHelpPharmacies();
    if (status) status.textContent = `${message} Search by district/city instead and Mamasafe will show the wider regional list.`;
    showNotification(message, 'warning');
}

function useHelpPharmacyLocation() {
    const status = document.getElementById('helpPharmacyGpsStatus');
    if (!navigator.geolocation) {
        showHelpPharmacyGpsFallback('GPS is not available in this browser.');
        return;
    }
    if (!window.isSecureContext) {
        showHelpPharmacyGpsFallback('GPS needs HTTPS or localhost to work in most browsers.');
        return;
    }
    if (status) status.textContent = 'Requesting GPS permission. Please allow location access to find nearby pharmacies.';
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        
        // Find the closest district to get the province
        const closestDistrict = rwandaDistricts
            .map(district => ({
                ...district,
                distance: getDistanceKm(latitude, longitude, district.lat, district.lng)
            }))
            .sort((a, b) => a.distance - b.distance)[0];
        
        // Filter pharmacies in the same province, then sort by distance
        const sorted = helpPharmacies
            .filter(pharmacy => pharmacy.province === closestDistrict.province)
            .map(pharmacy => ({ ...pharmacy, distance: getDistanceKm(latitude, longitude, pharmacy.lat, pharmacy.lng) }))
            .sort((a, b) => a.distance - b.distance);
        
        renderHelpPharmacies(sorted.slice(0, 20));
        
        if (status) {
            status.textContent = `GPS found your location near ${closestDistrict.district}, ${closestDistrict.province}. Showing nearest pharmacies in your province.`;
        }
        showNotification(`Pharmacies in ${closestDistrict.province} sorted by your current GPS location.`, 'success');
    }, (error) => {
        const message = error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Could not get your GPS location. Check location services and try again.';
        showHelpPharmacyGpsFallback(message);
    }, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
    });
}



// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================

const pageAliases = {
    'baby-names': 'names',
    'kick-counter': 'baby-kick-counter'
};

function navigateTo(pageId, options = {}) {
    const resolvedPageId = pageAliases[pageId] || pageId;
    console.log(`🔄 Navigating to page: ${resolvedPageId}`);
    
    document.body.classList.toggle('admin-portal-mode', resolvedPageId === 'admin');
    
    // Remove active class from all pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(resolvedPageId);
    if (targetPage) {
        targetPage.classList.add('active');
        rememberCurrentPage(resolvedPageId, options);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update active nav
        const navLink = document.querySelector(`[data-page="${resolvedPageId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Page-specific initialization
        initializePage(resolvedPageId);
    } else {
        console.warn(`Page ${resolvedPageId} not found`);
        showNotification('Page not found', 'error');
    }
}

function rememberCurrentPage(pageId, options = {}) {
    if (!pageId) return;
    localStorage.setItem('mamasafe_last_page', pageId);

    if (options.skipHistory) return;

    const nextHash = `#${pageId}`;
    const currentHash = window.location.hash || '';
    const state = { page: pageId };

    if (options.replaceHistory || !currentHash) {
        window.history.replaceState(state, '', nextHash);
    } else if (currentHash !== nextHash) {
        window.history.pushState(state, '', nextHash);
    } else {
        window.history.replaceState(state, '', nextHash);
    }
}

function initializePage(pageId) {
    console.log(`🔧 Initializing page: ${pageId}`);
    
    if (typeof window.syncGuestFeatureLock === 'function') {
        window.syncGuestFeatureLock();
    }

    switch(pageId) {
        case 'home':
            if (typeof initializeHomeFeatures === 'function') {
                initializeHomeFeatures();
            }
            break;
            
        case 'pregnancy':
            if (typeof initializePregnancyRagPage === 'function') {
                initializePregnancyRagPage();
            }
            if (typeof initializePregnancyNeon === 'function') {
                initializePregnancyNeon();
            }
            if (typeof initializePregnancyTools === 'function') {
                initializePregnancyTools();
            }
            break;

        case 'help-section':
            if (typeof initializeProfessionalHelp === 'function') {
                initializeProfessionalHelp();
            }
            break;
            
        case 'names':
            if (typeof initializeBabyNames === 'function') {
                initializeBabyNames();
            }
            break;
            
        case 'due-date-calculator':
            if (typeof initializeDueDateCalculator === 'function') {
                initializeDueDateCalculator();
            }
            break;

        case 'account':
            if (typeof initializeAccount === 'function') {
                initializeAccount();
            }
            break;

        case 'admin':
            if (typeof initializeAdminPanel === 'function') {
                initializeAdminPanel();
            }
            break;
            
        case 'courses':
            if (typeof initializeCoursesPage === 'function') {
                initializeCoursesPage();
            }
            // Initialize courses from courses.js
            if (typeof displayCourses === 'function') {
                displayCourses();
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            if (typeof updateEnrolledCoursesDisplay === 'function') {
                updateEnrolledCoursesDisplay();
            }
            // Also initialize CourseManager if available
            if (window.courseManager) {
                updateLearningStats();
            }
            break;
            
        default:
            console.log(`No specific initialization for page: ${pageId}`);
    }
}

function getCurrentPageFromURL() {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path === '/admin') return 'admin';
    const hash = window.location.hash.slice(1);
    const savedPage = localStorage.getItem('mamasafe_last_page');
    return pageAliases[hash] || hash || pageAliases[savedPage] || savedPage || 'home';
}

function setupGlobalEventListeners() {
    setupNavSearch();
    setupNotificationsNav();

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        const page = event.state?.page || getCurrentPageFromURL();
        navigateTo(page, { skipAuthCheck: true, skipHistory: true });
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        showNotification('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('Connection lost. Some features may be unavailable.', 'warning');
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Page became visible, refresh data if needed
            refreshCurrentPageData();
        }
    });
}

// ==========================================
// NAV NOTIFICATIONS
// ==========================================

const MAMASAFE_NOTIFICATIONS_KEY = 'mamasafe_notifications';
const MAMASAFE_NOTIFICATION_AUTO_KEY = 'mamasafe_auto_notification_keys';
const MAMASAFE_NOTIFICATION_POLL_MS = 30000;
let mamasafeNotificationPollTimer = null;
let mamasafeNotificationRefreshPromise = null;

function getStoredNotifications() {
    try {
        const parsed = JSON.parse(localStorage.getItem(MAMASAFE_NOTIFICATIONS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveStoredNotifications(items) {
    localStorage.setItem(MAMASAFE_NOTIFICATIONS_KEY, JSON.stringify(items.filter(isImportantNotification).slice(0, 120)));
}

function getNotificationUserId() {
    return localStorage.getItem('mamasafe_user_id')
        || window.mamasafeFirebaseAuth?.auth?.currentUser?.uid
        || localStorage.getItem('bc_user_email')
        || getStoredAuthProfile().email
        || 'guest-user';
}

function getNotificationAudience() {
    const profile = getStoredAuthProfile();
    const value = String(profile.carePriority || profile.stage || profile.lastFocus || 'users').toLowerCase();
    if (value.includes('course')) return 'courses';
    if (value.includes('support') || value.includes('help')) return 'support';
    if (value.includes('preg')) return 'pregnancy';
    return 'users';
}

function getNotificationKey(item = {}) {
    return String(item.sourceId || item.id || [
        item.source || 'app',
        item.type || 'info',
        item.title || '',
        item.message || ''
    ].join('|'));
}

function notificationExists(sourceId) {
    if (!sourceId) return false;
    return getStoredNotifications().some(item => getNotificationKey(item) === String(sourceId));
}

function normalizeNotificationDate(value) {
    if (!value) return new Date().toISOString();
    if (value instanceof Date) return value.toISOString();
    if (typeof value?.toDate === 'function') return value.toDate().toISOString();
    if (Number.isFinite(Number(value?.seconds))) return new Date(Number(value.seconds) * 1000).toISOString();
    return value;
}

function mergeNotificationItems(existingItems = [], incomingItems = []) {
    const existingByKey = new Map(existingItems.map(item => [getNotificationKey(item), item]));
    const merged = [];
    const seen = new Set();

    [...incomingItems, ...existingItems].forEach(item => {
        if (!isImportantNotification(item)) return;
        const key = getNotificationKey(item);
        if (seen.has(key)) return;
        const existing = existingByKey.get(key);
        merged.push({
            ...item,
            id: existing?.id || item.id || generateId('notify'),
            read: existing ? Boolean(existing.read) : Boolean(item.read)
        });
        seen.add(key);
    });

    return merged.sort((a, b) => {
        return new Date(normalizeNotificationDate(b.createdAt || 0)) - new Date(normalizeNotificationDate(a.createdAt || 0));
    }).slice(0, 120);
}

function isImportantNotification(item = {}) {
    const type = String(item.type || '').toLowerCase();
    const source = String(item.source || '').toLowerCase();
    const text = [
        item.title,
        item.message,
        item.fullMessage,
        item.urgency,
        item.status,
        item.problem,
        item.issue
    ].filter(Boolean).join(' ').toLowerCase();

    if (['error', 'warning', 'emergency', 'urgent', 'danger', 'critical', 'reminder', 'appointment'].includes(type)) return true;
    if (['admin-notification', 'help-request', 'emergency-signal', 'medical-alert'].includes(type)) return true;
    if (source === 'admin' || source === 'emergency') return true;

    return /\b(emergency|urgent|critical|danger|warning|severe|bleeding|fainting|seizure|reduced movement|high fever|trouble breathing|chest pain|appointment|reminder|medication|provider|hospital|help request)\b/i.test(text);
}

function addAppNotification(message, type = 'info', meta = {}) {
    const item = {
        id: generateId('notify'),
        sourceId: meta.sourceId || meta.dedupeKey || '',
        message: String(message || 'Notification'),
        fullMessage: String(meta.fullMessage || meta.message || message || 'Notification'),
        title: meta.title || '',
        type: String(type || 'info'),
        category: meta.category || 'notifications', // Can be 'notifications', 'messages', or 'alerts'
        source: meta.source || 'app',
        read: false,
        createdAt: new Date().toISOString()
    };
    if (!isImportantNotification(item)) return null;
    const items = getStoredNotifications().filter(isImportantNotification);
    const key = getNotificationKey(item);
    if (items.some(existing => getNotificationKey(existing) === key)) {
        return null;
    }
    saveStoredNotifications(mergeNotificationItems(items, [item]));
    renderNotificationsPanel();
    showBrowserNotification(item);
    return item;
}

function formatNotificationTime(value) {
    const date = new Date(normalizeNotificationDate(value));
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderNotificationsPanel() {
    const count = document.getElementById('notificationNavCount');
    const items = getStoredNotifications().filter(isImportantNotification);
    if (items.length !== getStoredNotifications().length) {
        saveStoredNotifications(items);
    }
    const unread = items.filter(item => !item.read).length;

    if (count) {
        count.textContent = String(Math.min(unread, 99));
        count.classList.toggle('show', unread > 0);
    }

    // Get all three list elements
    const notificationsList = document.getElementById('notificationList');
    const messagesList = document.getElementById('messagesList');
    const alertsList = document.getElementById('alertsList');

    // Helper to render items for a specific category
    const renderCategoryItems = (listElement, category, emptyText) => {
        if (!listElement) return;
        const categoryItems = items.filter(item => (item.category || 'notifications') === category);
        if (!categoryItems.length) {
            listElement.innerHTML = `<div class="notification-empty">${emptyText}</div>`;
            return;
        }
        listElement.innerHTML = categoryItems.slice(0, 60).map(item => `
            <article class="notification-item ${item.read ? '' : 'unread'}" role="button" tabindex="0" onclick="openNotificationDetail('${escapeSearchHtml(item.id)}')" onkeydown="handleNotificationKeyOpen(event, '${escapeSearchHtml(item.id)}')">
                <div class="notification-item-top">
                    <span>${escapeSearchHtml(item.type || 'info')}</span>
                    <span>${escapeSearchHtml(formatNotificationTime(item.createdAt))}</span>
                </div>
                <div class="notification-item-message">${escapeSearchHtml(item.title || item.message || '')}</div>
                <small class="notification-item-open">Click to read full message</small>
            </article>
        `).join('');
    };

    // Render each category
    renderCategoryItems(notificationsList, 'notifications', 'No notifications yet');
    renderCategoryItems(messagesList, 'messages', 'No messages yet');
    renderCategoryItems(alertsList, 'alerts', 'No alerts yet');
}

function markNotificationsRead() {
    const items = getStoredNotifications().map(item => ({ ...item, read: true }));
    saveStoredNotifications(items);
    renderNotificationsPanel();
}

function switchNotificationTab(tab) {
    // Update active tab button
    document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
    const activeTabBtn = document.querySelector(`.notification-tab[data-tab="${tab}"]`);
    if (activeTabBtn) activeTabBtn.classList.add('active');

    // Update active content
    document.querySelectorAll('.notification-tab-content').forEach(c => c.classList.remove('active'));
    const activeContent = document.getElementById(`${tab}-tab`);
    if (activeContent) activeContent.classList.add('active');
    
    renderNotificationsPanel();
}

function toggleNotificationsPanel() {
    const panel = document.getElementById('notificationPanel');
    const button = document.getElementById('notificationNavBtn');
    if (!panel) return;
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    button?.classList.toggle('active', open);
    if (open) {
        markNotificationsRead();
        refreshNotificationsPanel(false);
    }
}

async function fetchBackendNotificationFeed() {
    const userId = encodeURIComponent(getNotificationUserId());
    const audience = encodeURIComponent(getNotificationAudience());
    const response = await fetch(window.mamasafeApiUrl(`/api/notifications/${userId}?audience=${audience}&limit=120`), {
        headers: { Accept: 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
        throw new Error(data.error || data.details || `Notifications request failed (${response.status})`);
    }
    return data;
}

function normalizeBackendNotification(record = {}, sourceType = 'notification') {
    const rawId = record._id || record.id || record.notificationId || `${sourceType}-${record.createdAt || record.savedAt || Date.now()}`;
    const type = record.type || (sourceType === 'reminder' ? 'reminder' : sourceType === 'appointment' ? 'appointment' : 'activity');
    const title = record.title
        || record.name
        || (sourceType === 'reminder' ? 'Care reminder' : sourceType === 'appointment' ? 'Appointment reminder' : '');
    const message = record.message
        || record.note
        || record.description
        || record.problem
        || record.issue
        || record.label
        || formatActivityNotification(record);
    const date = normalizeNotificationDate(record.date || record.dueDate || record.createdAt || record.savedAt || new Date().toISOString());
    const fullMessage = sourceType === 'reminder'
        ? `${title}\n\n${message}\n\nDue: ${date}`
        : sourceType === 'appointment'
            ? `${title}\n\n${message}\n\nAppointment: ${date}`
            : formatActivityNotificationDetail(record);

    return {
        id: generateId('notify'),
        sourceId: `${sourceType}:${rawId}`,
        source: record.source || (record.type === 'admin-notification' ? 'admin' : 'mongodb'),
        type,
        title,
        message,
        fullMessage,
        read: record.type === 'admin-notification' ? false : Boolean(record.read),
        createdAt: normalizeNotificationDate(record.createdAt || record.savedAt || date || new Date().toISOString())
    };
}

function normalizeBackendNotificationFeed(feed = {}) {
    return [
        ...(feed.notifications || []).map(item => normalizeBackendNotification(item, 'notification')),
        ...(feed.activities || []).map(item => normalizeBackendNotification(item, 'activity')),
        ...(feed.reminders || []).map(item => normalizeBackendNotification(item, 'reminder')),
        ...(feed.appointments || []).map(item => normalizeBackendNotification(item, 'appointment'))
    ].filter(isImportantNotification);
}

async function loadDbSyncNotificationItems() {
    if (!window.DB_SYNC || typeof window.DB_SYNC.loadActivities !== 'function') {
        return [];
    }

    const activities = await window.DB_SYNC.loadActivities();
    if (!Array.isArray(activities) || !activities.length) return [];
    return activities
        .slice(-30)
        .reverse()
        .filter(activity => activity && (activity._id || activity.id))
        .map(activity => normalizeBackendNotification({
            ...activity,
            _id: activity._id || activity.id
        }, 'activity'))
        .filter(isImportantNotification);
}

async function refreshNotificationsPanel(showToast = true) {
    if (mamasafeNotificationRefreshPromise) {
        return mamasafeNotificationRefreshPromise;
    }

    mamasafeNotificationRefreshPromise = (async () => {
        const existing = getStoredNotifications().filter(isImportantNotification);
        const incoming = [];

        try {
            const backendFeed = await fetchBackendNotificationFeed();
            incoming.push(...normalizeBackendNotificationFeed(backendFeed));
        } catch (error) {
            console.warn('Backend notification refresh failed:', error.message || error);
        }

        try {
            incoming.push(...await loadDbSyncNotificationItems());
        } catch (error) {
            console.warn('DB sync notification refresh failed:', error.message || error);
        }

        if (incoming.length) {
            const beforeKeys = new Set(existing.map(getNotificationKey));
            const newItems = incoming.filter(item => !beforeKeys.has(getNotificationKey(item)));
            saveStoredNotifications(mergeNotificationItems(existing, incoming));
            newItems.forEach(showBrowserNotification);
        }

        runAutomaticNotificationChecks();
        renderNotificationsPanel();
        if (showToast) showNotification('Notifications refreshed.', 'success');
    })().finally(() => {
        mamasafeNotificationRefreshPromise = null;
    });

    return mamasafeNotificationRefreshPromise;
}

function formatActivityNotification(activity) {
    const type = String(activity.type || 'activity').replace(/[-_]/g, ' ');
    if (activity.title && activity.message) return `${activity.title}: ${activity.message}`;
    if (activity.message) return activity.message;
    if (activity.problem) return `${type}: ${activity.problem}`;
    if (activity.issue) return `${type}: ${activity.issue}`;
    if (activity.name) return `${type}: ${activity.name}`;
    if (activity.label) return `${type}: ${activity.label}`;
    if (activity.tool) return `${type}: ${activity.tool}`;
    if (activity.id) return `${type}: ${activity.id}`;
    return `Saved ${type} record to MongoDB`;
}

function formatActivityNotificationDetail(activity) {
    const lines = [];
    const type = String(activity.type || 'activity').replace(/[-_]/g, ' ');
    if (activity.title) lines.push(activity.title);
    if (activity.message) lines.push(activity.message);
    if (activity.problem) lines.push(`Problem: ${activity.problem}`);
    if (activity.issue) lines.push(`Issue: ${activity.issue}`);
    if (activity.symptoms) lines.push(`Symptoms: ${Array.isArray(activity.symptoms) ? activity.symptoms.join(', ') : activity.symptoms}`);
    if (activity.urgency) lines.push(`Urgency: ${activity.urgency}`);
    if (activity.status) lines.push(`Status: ${activity.status}`);
    if (activity.audience) lines.push(`Audience: ${activity.audience}`);
    if (activity.label) lines.push(activity.label);
    if (activity.tool) lines.push(`Tool: ${activity.tool}`);
    if (activity.id) lines.push(`Record: ${activity.id}`);
    if (!lines.length) lines.push(`Saved ${type} record to MongoDB`);
    return lines.join('\n\n');
}

function openNotificationDetail(id) {
    const items = getStoredNotifications();
    const item = items.find(notification => notification.id === id);
    if (!item) return;

    const nextItems = items.map(notification => notification.id === id ? { ...notification, read: true } : notification);
    saveStoredNotifications(nextItems);
    renderNotificationsPanel();

    let overlay = document.getElementById('notificationDetailOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'notificationDetailOverlay';
        overlay.className = 'notification-detail-overlay';
        overlay.innerHTML = `
            <article class="notification-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="notificationDetailTitle">
                <button type="button" class="notification-detail-close" onclick="closeNotificationDetail()" aria-label="Close notification">×</button>
                <span class="notification-detail-type" id="notificationDetailType"></span>
                <h2 id="notificationDetailTitle"></h2>
                <time id="notificationDetailTime"></time>
                <p id="notificationDetailMessage"></p>
                <div class="notification-detail-actions">
                    <button type="button" onclick="closeNotificationDetail()">Done</button>
                </div>
            </article>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', event => {
            if (event.target === overlay) closeNotificationDetail();
        });
    }

    const title = item.title || `${String(item.type || 'Notification').replace(/[-_]/g, ' ')} message`;
    const message = item.fullMessage || item.message || 'No message details were saved.';
    document.getElementById('notificationDetailType').textContent = item.source === 'mongodb' ? 'MongoDB notification' : 'App notification';
    document.getElementById('notificationDetailTitle').textContent = title;
    document.getElementById('notificationDetailTime').textContent = formatNotificationTime(item.createdAt);
    document.getElementById('notificationDetailMessage').textContent = message;
    overlay.classList.add('open');
}

function closeNotificationDetail() {
    document.getElementById('notificationDetailOverlay')?.classList.remove('open');
}

function handleNotificationKeyOpen(event, id) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openNotificationDetail(id);
    }
}

function clearNotificationsPanel() {
    saveStoredNotifications([]);
    closeNotificationDetail();
    renderNotificationsPanel();
}

function getAutoNotificationKeys() {
    try {
        const keys = JSON.parse(localStorage.getItem(MAMASAFE_NOTIFICATION_AUTO_KEY) || '[]');
        return Array.isArray(keys) ? keys : [];
    } catch {
        return [];
    }
}

function rememberAutoNotificationKey(key) {
    const keys = getAutoNotificationKeys();
    if (!keys.includes(key)) {
        keys.unshift(key);
        localStorage.setItem(MAMASAFE_NOTIFICATION_AUTO_KEY, JSON.stringify(keys.slice(0, 250)));
    }
}

function addAutomaticNotification(key, message, type = 'reminder', meta = {}) {
    if (!key || getAutoNotificationKeys().includes(key) || notificationExists(key)) return null;
    const item = addAppNotification(message, type, {
        ...meta,
        source: meta.source || 'automatic',
        sourceId: key
    });
    if (item) rememberAutoNotificationKey(key);
    return item;
}

function getNotificationPregnancyContext() {
    const profile = getStoredAuthProfile();
    const pregnancyData = window.pregnancyData || {};
    const currentWeekText = document.getElementById('currentWeek')?.textContent || '';
    const currentWeekMatch = currentWeekText.match(/(\d{1,2})/);
    const dueDateValue = pregnancyData.dueDate
        || profile.dueDate
        || profile.careDate
        || document.getElementById('dueDate')?.textContent
        || '';
    const dueDate = dueDateValue ? new Date(dueDateValue) : null;
    const today = new Date();
    let week = Number(pregnancyData.currentWeek || pregnancyData.week || currentWeekMatch?.[1] || 0);

    if ((!week || week < 1) && dueDate && !Number.isNaN(dueDate.getTime())) {
        const daysLeft = Math.ceil((dueDate - today) / (24 * 60 * 60 * 1000));
        week = Math.min(42, Math.max(1, Math.round((280 - daysLeft) / 7)));
    }

    const stage = String(profile.stage || profile.carePriority || profile.lastFocus || '').toLowerCase();
    return {
        userId: getNotificationUserId(),
        week: Number.isFinite(week) ? Math.max(1, Math.min(42, Math.round(week))) : 0,
        dueDate,
        stage,
        dayKey: today.toISOString().slice(0, 10)
    };
}

function runAutomaticNotificationChecks() {
    const context = getNotificationPregnancyContext();
    if (!isLoggedIn() && context.userId === 'guest-user') return;
    const pregnancyFocused = !context.stage || /preg|mother|tracking|care/.test(context.stage);
    if (!pregnancyFocused && !context.week) return;

    const userPrefix = `auto:${context.userId}`;
    addAutomaticNotification(
        `${userPrefix}:daily:${context.dayKey}`,
        context.week
            ? `Daily reminder for week ${context.week}: track symptoms, hydration, meals, movement when applicable, and contact care support for worrying signs.`
            : 'Daily reminder: check symptoms, hydration, meals, and any upcoming care tasks.',
        'reminder',
        {
            title: 'Daily care reminder',
            fullMessage: 'Open Mamasafe today, review your health notes, and do not wait for urgent symptoms such as heavy bleeding, chest pain, trouble breathing, fainting, severe headache, or reduced baby movement.'
        }
    );

    if (!context.week) return;

    const trimester = context.week <= 13 ? 'first trimester' : context.week <= 27 ? 'second trimester' : 'third trimester';
    addAutomaticNotification(
        `${userPrefix}:week:${context.week}`,
        `Week ${context.week} ${trimester} reminder: review your week plan, symptoms, nutrition, sleep comfort, and appointment questions.`,
        'reminder',
        { title: `Week ${context.week} pregnancy reminder` }
    );

    const windowRules = [
        { min: 1, max: 8, key: 'first-visit', title: 'First prenatal visit', message: 'Book or confirm your first prenatal appointment and ask about supplements, tests, and warning signs.' },
        { min: 11, max: 14, key: 'screening', title: 'First-trimester screening', message: 'Ask your clinician about first-trimester screening and any tests recommended for your situation.' },
        { min: 18, max: 22, key: 'anatomy-scan', title: 'Anatomy scan window', message: 'This is a common window for the anatomy scan. Confirm timing with your care provider.' },
        { min: 24, max: 28, key: 'glucose-screening', title: 'Glucose screening window', message: 'Ask about glucose screening and keep tracking meals, hydration, blood pressure, and symptoms.' },
        { min: 28, max: 42, key: 'movement-tracking', title: 'Movement tracking', message: 'Track your baby movement pattern and seek urgent care for clear reduced movement.' },
        { min: 36, max: 42, key: 'birth-readiness', title: 'Birth readiness', message: 'Review hospital bag, birth plan, transport, support person, warning signs, and postpartum help.' }
    ];

    windowRules
        .filter(rule => context.week >= rule.min && context.week <= rule.max)
        .forEach(rule => addAutomaticNotification(
            `${userPrefix}:rule:${rule.key}:week:${context.week}`,
            rule.message,
            rule.key === 'movement-tracking' ? 'warning' : 'reminder',
            { title: rule.title }
        ));

    if (context.dueDate && !Number.isNaN(context.dueDate.getTime())) {
        const daysLeft = Math.ceil((context.dueDate - new Date()) / (24 * 60 * 60 * 1000));
        if (daysLeft >= 0 && daysLeft <= 14) {
            addAutomaticNotification(
                `${userPrefix}:due-soon:${context.dayKey}`,
                `Your due date is about ${daysLeft} day${daysLeft === 1 ? '' : 's'} away. Keep urgent contacts, transport, and hospital items ready.`,
                'warning',
                { title: 'Due date is close' }
            );
        }
    }
}

function showBrowserNotification(item = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!document.hidden && item.source !== 'admin') return;
    try {
        new Notification(item.title || 'Mamasafe notification', {
            body: item.message || item.fullMessage || 'Open Mamasafe for details.',
            tag: getNotificationKey(item),
            icon: 'assets/mamasafe-logo.png'
        });
    } catch {
        // Browser notifications are optional; the in-app inbox remains the source of truth.
    }
}

async function enableBrowserNotifications() {
    if (!('Notification' in window)) {
        return;
    }
    const permission = await Notification.requestPermission();
}

function startNotificationPolling() {
    runAutomaticNotificationChecks();
    refreshNotificationsPanel(false);
    if (mamasafeNotificationPollTimer) return;
    mamasafeNotificationPollTimer = setInterval(() => {
        runAutomaticNotificationChecks();
        if (navigator.onLine !== false) {
            refreshNotificationsPanel(false);
        }
    }, MAMASAFE_NOTIFICATION_POLL_MS);
}

function setupNotificationsNav() {
    renderNotificationsPanel();
    startNotificationPolling();
    document.addEventListener('click', event => {
        const panel = document.getElementById('notificationPanel');
        const wrapper = event.target.closest?.('.nav-notifications');
        if (panel && panel.classList.contains('open') && !wrapper) {
            panel.classList.remove('open');
            document.getElementById('notificationNavBtn')?.classList.remove('active');
        }
    });
}

// ==========================================
// GLOBAL NAV SEARCH
// ==========================================

let navSearchIndex = [];
let navSearchReady = false;

function normalizeSearchText(value = '') {
    return String(value)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function titleCaseSearchText(value = '') {
    return normalizeSearchText(value)
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getSearchTokens(value = '') {
    return normalizeSearchText(value)
        .split(' ')
        .filter(word => word.length > 1);
}

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeSearchHtml(value = '') {
    return escapeHTML(value);
}

function getElementSearchLabel(element) {
    if (!element) return '';
    const explicit = element.getAttribute('aria-label') || element.getAttribute('title') || element.getAttribute('placeholder');
    const text = element.innerText || element.textContent || '';
    return (explicit || text || '').replace(/\s+/g, ' ').trim();
}

function inferNavigateTarget(element, fallbackPageId) {
    if (!element) return fallbackPageId;
    const dataPage = element.getAttribute('data-page');
    if (dataPage) return pageAliases[dataPage] || dataPage;
    const onclick = element.getAttribute('onclick') || '';
    const match = onclick.match(/navigateTo(?:Tool)?\(['"]([^'"]+)['"]/);
    if (match) return pageAliases[match[1]] || match[1];
    return fallbackPageId;
}

function getPageSearchTitle(section) {
    const heading = section.querySelector('h1, h2, .section-title, .hero-title, .names-title');
    return getElementSearchLabel(heading) || titleCaseSearchText(section.id);
}

function addNavSearchEntry(entries, entry) {
    const pageId = pageAliases[entry.pageId] || entry.pageId;
    const label = (entry.label || '').trim();
    if (!pageId || !label || !document.getElementById(pageId)) return;

    const haystack = normalizeSearchText([
        label,
        entry.pageTitle,
        entry.category,
        pageId,
        entry.keywords
    ].filter(Boolean).join(' '));

    const key = `${pageId}|${entry.anchorId || ''}|${normalizeSearchText(label)}|${entry.category || ''}`;
    if (entries.some(item => item.key === key)) return;

    entries.push({
        key,
        pageId,
        label,
        pageTitle: entry.pageTitle || titleCaseSearchText(pageId),
        category: entry.category || 'Feature',
        anchorId: entry.anchorId || '',
        keywords: entry.keywords || '',
        haystack
    });
}

function buildNavSearchIndex() {
    const entries = [];
    const pages = Array.from(document.querySelectorAll('.page-section[id]'));

    pages.forEach(section => {
        const pageId = section.id;
        const pageTitle = getPageSearchTitle(section);
        const sectionKeywords = getSearchTokens(section.innerText || '')
            .slice(0, 80)
            .join(' ');

        addNavSearchEntry(entries, {
            pageId,
            label: pageTitle,
            pageTitle,
            category: 'Page',
            anchorId: pageId,
            keywords: sectionKeywords
        });

        const targets = section.querySelectorAll([
            'h1',
            'h2',
            'h3',
            'h4',
            'button',
            'a[onclick*="navigateTo"]',
            '[data-page]',
            '.tool-card',
            '.popular-tool-card',
            '.feature-card',
            '.journey-card',
            '.ph-card'
        ].join(','));

        Array.from(targets).forEach((element, index) => {
            const label = getElementSearchLabel(element);
            if (!label || label.length < 3 || label.length > 120) return;

            const targetPageId = inferNavigateTarget(element, pageId);
            if (!element.id && targetPageId === pageId) {
                element.id = `search-target-${pageId}-${index}`;
            }

            addNavSearchEntry(entries, {
                pageId: targetPageId,
                label,
                pageTitle,
                category: element.matches('h1, h2, h3, h4') ? 'Section' : 'Function',
                anchorId: targetPageId === pageId ? element.id : '',
                keywords: `${element.getAttribute('onclick') || ''} ${element.className || ''}`
            });
        });
    });

    Object.keys(window)
        .filter(name => typeof window[name] === 'function')
        .filter(name => /calculate|track|search|find|book|request|submit|generate|analyze|monitor|planner|schedule|help|pregnancy|course|name/i.test(name))
        .slice(0, 180)
        .forEach(name => {
            const readable = titleCaseSearchText(name);
            const pageMatch = pages.find(section => normalizeSearchText(name).includes(normalizeSearchText(section.id)));
            addNavSearchEntry(entries, {
                pageId: pageMatch ? pageMatch.id : 'home',
                label: readable,
                pageTitle: pageMatch ? getPageSearchTitle(pageMatch) : 'Home',
                category: 'Project Function',
                keywords: name
            });
        });

    navSearchIndex = entries;
    navSearchReady = true;
}

function scoreNavSearchEntry(entry, query) {
    const normalizedQuery = normalizeSearchText(query);
    const tokens = getSearchTokens(query);
    if (!normalizedQuery) return 0;

    let score = 0;
    if (entry.haystack.includes(normalizedQuery)) score += 20;
    if (normalizeSearchText(entry.label).startsWith(normalizedQuery)) score += 18;
    if (normalizeSearchText(entry.pageTitle).includes(normalizedQuery)) score += 8;

    tokens.forEach(token => {
        if (entry.haystack.includes(token)) score += 5;
        if (normalizeSearchText(entry.label).includes(token)) score += 7;
        if (normalizeSearchText(entry.pageId).includes(token)) score += 4;
    });

    if (entry.category === 'Page') score += 3;
    return score;
}

function getNavSearchMatches(query) {
    if (!navSearchReady) buildNavSearchIndex();
    const tokens = getSearchTokens(query);

    if (!query.trim()) {
        return navSearchIndex
            .filter(entry => entry.category === 'Page' && !['login', 'signup'].includes(entry.pageId))
            .slice(0, 8)
            .map(entry => ({ ...entry, score: 1, matchedWords: [] }));
    }

    return navSearchIndex
        .map(entry => {
            const score = scoreNavSearchEntry(entry, query);
            const matchedWords = tokens.filter(token => entry.haystack.includes(token));
            return { ...entry, score, matchedWords };
        })
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
        .slice(0, 10);
}

function renderNavSearchResults(query) {
    const panel = document.getElementById('globalSearchResults');
    if (!panel) return;

    const matches = getNavSearchMatches(query);
    if (!matches.length) {
        panel.innerHTML = `
            <div class="global-search-empty">
                <strong>No matching functions found</strong>
                <span>Try pregnancy, hospital, growth, sleep, feeding, names, courses, or help.</span>
            </div>
        `;
        panel.classList.add('active');
        return;
    }

    panel.innerHTML = matches.map((match, index) => {
        const words = match.matchedWords.length
            ? match.matchedWords.map(word => `<span>${escapeSearchHtml(word)}</span>`).join('')
            : '<span>quick path</span>';

        return `
            <button type="button" class="global-search-result" data-search-index="${index}">
                <span class="global-search-result-main">
                    <strong>${escapeSearchHtml(match.label)}</strong>
                    <small>${escapeSearchHtml(match.pageTitle)} / ${escapeSearchHtml(match.category)}</small>
                </span>
                <span class="global-search-words">${words}</span>
            </button>
        `;
    }).join('');

    panel.dataset.matches = JSON.stringify(matches.map(match => ({
        pageId: match.pageId,
        anchorId: match.anchorId,
        label: match.label
    })));
    panel.classList.add('active');
}

function clearSearchHighlights() {
    document.querySelectorAll('.global-search-highlight').forEach(element => {
        element.classList.remove('global-search-highlight');
    });
}

function openNavSearchResult(match) {
    if (!match) return;
    const pageId = pageAliases[match.pageId] || match.pageId;
    const searchInput = document.getElementById('globalSearch');
    const panel = document.getElementById('globalSearchResults');

    if (searchInput) searchInput.value = match.label;
    if (panel) panel.classList.remove('active');

    navigateTo(pageId, { skipAuthCheck: true });

    window.setTimeout(() => {
        clearSearchHighlights();
        const anchor = match.anchorId ? document.getElementById(match.anchorId) : document.getElementById(pageId);
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
            anchor.classList.add('global-search-highlight');
            window.setTimeout(() => anchor.classList.remove('global-search-highlight'), 2200);
        }
    }, 180);
}

function handleGlobalSearchSubmit() {
    const input = document.getElementById('globalSearch');
    const matches = getNavSearchMatches(input?.value || '');
    if (matches.length) {
        openNavSearchResult(matches[0]);
    } else {
        showNotification('No matching app function found. Try another word.', 'warning');
    }
}

function setupNavSearch() {
    const input = document.getElementById('globalSearch');
    const searchBox = input?.closest('.search-box');
    const button = document.querySelector('.search-btn');
    if (!input || !searchBox || searchBox.dataset.searchReady === 'true') return;

    searchBox.dataset.searchReady = 'true';
    searchBox.classList.add('global-search-box');

    let panel = document.getElementById('globalSearchResults');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'globalSearchResults';
        panel.className = 'global-search-results';
        searchBox.appendChild(panel);
    }

    buildNavSearchIndex();

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'globalSearchResults');
    input.placeholder = 'Search pages, words, functions...';

    input.addEventListener('input', () => renderNavSearchResults(input.value));
    input.addEventListener('focus', () => renderNavSearchResults(input.value));
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleGlobalSearchSubmit();
        }
        if (event.key === 'Escape') {
            panel.classList.remove('active');
            input.blur();
        }
    });

    button?.addEventListener('click', event => {
        event.preventDefault();
        handleGlobalSearchSubmit();
    });

    panel.addEventListener('mousedown', event => {
        const result = event.target.closest('.global-search-result');
        if (!result) return;
        event.preventDefault();
        const matches = JSON.parse(panel.dataset.matches || '[]');
        openNavSearchResult(matches[Number(result.dataset.searchIndex)]);
    });

    document.addEventListener('click', event => {
        if (!searchBox.contains(event.target)) {
            panel.classList.remove('active');
        }
    });
}

// ==========================================
// CALCULATOR FUNCTIONS
// ==========================================

const homeJourneyCopy = {
    pregnancy: 'Track week-by-week nutrition recommmendation & Analyse food nutrients.',
    courses: 'Continue guided lessons for pregnancy Nutrution Recommendations',
   
};

function initializeHomeFeatures() {
    homeUpdateJourneyPreview();
    homeLoadChecklist();
    homeUpdateSyncStatus();

    const profile = typeof getStoredAuthProfile === 'function' ? getStoredAuthProfile() : {};
    const select = document.getElementById('homeJourneySelect');
    if (select && profile?.stage) {
        const mapped = profile.stage === 'pregnant' ? 'pregnancy' : profile.stage;
        if ([...select.options].some(option => option.value === mapped)) {
            select.value = mapped;
            homeUpdateJourneyPreview();
        }
    }
}

function homeUpdateJourneyPreview() {
    const select = document.getElementById('homeJourneySelect');
    const preview = document.getElementById('homeStagePreview');
    if (!select || !preview) return;
    preview.textContent = homeJourneyCopy[select.value] || 'Choose your stage to see the best next action.';
}

function homeStartJourney() {
    const target = document.getElementById('homeJourneySelect')?.value || 'pregnancy';
    if (window.DB_SYNC && typeof window.DB_SYNC.saveActivity === 'function') {
        window.DB_SYNC.saveActivity({
            type: 'home-journey-start',
            id: target,
            label: `Opened ${target} from home command center`
        });
    }
    navigateTo(target);
}

function homeSaveChecklist() {
    const tasks = [...document.querySelectorAll('[data-home-task]')].map(input => ({
        id: input.dataset.homeTask,
        checked: input.checked
    }));
    localStorage.setItem('mamasafe_home_checklist', JSON.stringify(tasks));
    homeUpdateChecklistStatus();

    if (window.DB_SYNC && typeof window.DB_SYNC.saveActivity === 'function') {
        const completed = tasks.filter(task => task.checked).length;
        window.DB_SYNC.saveActivity({
            type: 'home-checklist',
            id: 'daily-care',
            checked: completed,
            label: `${completed} of ${tasks.length} home care tasks completed`
        });
    }
}

function homeLoadChecklist() {
    let saved = [];
    try {
        saved = JSON.parse(localStorage.getItem('mamasafe_home_checklist') || '[]');
    } catch {
        saved = [];
    }

    saved.forEach(task => {
        const input = document.querySelector(`[data-home-task="${task.id}"]`);
        if (input) input.checked = !!task.checked;
    });
    homeUpdateChecklistStatus();
}

function homeUpdateChecklistStatus() {
    const inputs = [...document.querySelectorAll('[data-home-task]')];
    const done = inputs.filter(input => input.checked).length;
    const status = document.getElementById('homeChecklistStatus');
    if (status) status.textContent = `${done} of ${inputs.length} completed`;
}

async function homeUpdateSyncStatus() {
    const status = document.getElementById('homeSyncStatus');
    if (!status) return;
    status.textContent = 'Checking...';
    try {
        const health = window.DB_SYNC && typeof window.DB_SYNC.health === 'function'
            ? await window.DB_SYNC.health()
            : null;
        status.textContent = health?.database?.connected ? 'MongoDB Atlas online' : 'Local mode ready';
    } catch {
        status.textContent = 'Offline queue ready';
    }
}

// Home Due Date Calculator
function calculateHomeDueDate() {
    if (!requireToolAccess('home', 'calculateHomeDueDate')) {
        return;
    }
    
    const lmpInput = document.getElementById('homeLastPeriod');
    const cycleLengthInput = document.getElementById('homeCycleLength');
    const resultDiv = document.getElementById('homeResult');
    
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
    
    document.getElementById('homeDueDate').textContent = dueDate.toLocaleDateString();
    document.getElementById('homeWeeks').textContent = weeksUntilDue;
    
    showNotification('Due date calculated successfully!', 'success');
}

// Pregnancy Calculator (for pregnancy page)
function calculatePregnancyWeek() {
    const dateInput = document.getElementById('pregDate');
    if (!dateInput || !dateInput.value) {
        showNotification('Please enter a date', 'error');
        return;
    }

    const inputDate = new Date(dateInput.value);
    const today = new Date();
    
    // Determine if it's a past date (last period) or future date (due date)
    const isLastPeriod = inputDate < today;
    
    let dueDate, currentWeek, currentTrimester, careFocus, nextMilestone;
    
    if (isLastPeriod) {
        // Calculate due date (280 days from last period)
        dueDate = new Date(inputDate.getTime() + (280 * 24 * 60 * 60 * 1000));
        currentWeek = Math.floor((today - inputDate) / (7 * 24 * 60 * 60 * 1000));
        
        // Update pregnancy week display
        document.getElementById('currentWeek').textContent = `Week ${currentWeek}`;
        
        // Determine trimester
        if (currentWeek <= 13) {
            currentTrimester = 'First Trimester';
            careFocus = 'Focus on nutrition, prenatal vitamins, and first prenatal visit';
            nextMilestone = 'Schedule first trimester screening and ultrasound';
        } else if (currentWeek <= 27) {
            currentTrimester = 'Second Trimester';
            careFocus = 'Monitor baby movements, track weight gain, and consider anatomy scan';
            nextMilestone = 'Plan for glucose screening and birth preparation classes';
        } else {
            currentTrimester = 'Third Trimester';
            careFocus = 'Prepare for delivery, practice breathing exercises, and pack hospital bag';
            nextMilestone = 'Finalize birth plan and install car seat';
        }
        
    } else {
        // It's a due date - calculate current week based on due date
        const totalDays = 280;
        const daysElapsed = totalDays - Math.floor((dueDate - today) / (24 * 60 * 60 * 1000));
        currentWeek = Math.max(1, Math.floor(daysElapsed / 7));
        
        // Update pregnancy week display
        document.getElementById('currentWeek').textContent = `Week ${currentWeek}`;
        
        // Determine trimester based on weeks remaining
        const weeksRemaining = totalDays / 7 - currentWeek;
        if (weeksRemaining > 27) {
            currentTrimester = 'First Trimester';
            careFocus = 'Focus on nutrition, prenatal vitamins, and first prenatal visit';
            nextMilestone = 'Schedule first trimester screening and ultrasound';
        } else if (weeksRemaining > 14) {
            currentTrimester = 'Second Trimester';
            careFocus = 'Monitor baby movements, track weight gain, and consider anatomy scan';
            nextMilestone = 'Plan for glucose screening and birth preparation classes';
        } else {
            currentTrimester = 'Third Trimester';
            careFocus = 'Prepare for delivery, practice breathing exercises, and pack hospital bag';
            nextMilestone = 'Finalize birth plan and install car seat';
        }
    }
    
    // Update trimester display
    document.getElementById('currentTrimester').textContent = currentTrimester;
    document.getElementById('pregCareFocus').textContent = careFocus;
    document.getElementById('pregNextMilestone').textContent = nextMilestone;
    
    // Show results section
    const resultPanel = document.getElementById('pregResult');
    if (resultPanel) {
        resultPanel.style.display = 'block';
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Show success notification
    showNotification(`Pregnancy calculated: ${currentTrimester}, Week ${currentWeek}`, 'success');
    
    // Store pregnancy data for other functions
    if (typeof window.pregnancyData === 'undefined') {
        window.pregnancyData = {
            currentWeek: currentWeek,
            currentTrimester: currentTrimester,
            dueDate: dueDate,
            isLastPeriod: isLastPeriod,
            lastPeriod: isLastPeriod ? inputDate : null
        };
    }
}

// Scroll to pregnancy guide section
function scrollToPregnancyGuide() {
    const pregnancyTopics = document.getElementById('pregnancyTopics');
    if (pregnancyTopics) {
        pregnancyTopics.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function generateWeekButtons() {
    const container = document.getElementById('weekButtons')
        || document.getElementById('weekButtonsContainer')
        || document.getElementById('pregnancyWeekButtons')
        || document.querySelector('[data-pregnancy-week-buttons]');

    if (!container) {
        return;
    }

    if (container.dataset.generated === 'true') {
        return;
    }

    container.dataset.generated = 'true';
    container.innerHTML = '';

    for (let week = 1; week <= 42; week += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'week-btn';
        button.textContent = `Week ${week}`;
        button.dataset.week = String(week);
        button.addEventListener('click', () => selectWeek(week, button));
        container.appendChild(button);
    }
}

// Select a specific week and show details with enhanced visual feedback
function selectWeek(week, targetElement = null) {
    // Remove active class from all week buttons
    document.querySelectorAll('.week-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected week button
    if (targetElement) {
        targetElement.classList.add('active');
    } else {
        // Find the button for this week and activate it
        const weekButton = document.querySelector(`.week-btn:nth-child(${week})`);
        if (weekButton) {
            weekButton.classList.add('active');
        }
    }
    
    // Update week detail panel
    updateWeekDetail(week);
    
    // Update baby growth tracker with current week
    updateBabyGrowthTracker(week);
    
    // Smooth scroll to week detail panel
    setTimeout(() => {
        const weekDetailPanel = document.getElementById('weekDetailPanel');
        if (weekDetailPanel) {
            weekDetailPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}

// Update baby growth tracker with current week
function updateBabyGrowthTracker(week) {
    const milestones = document.getElementById('babyMilestones');
    const sizeVisual = document.getElementById('sizeVisual');
    
    if (!milestones || !sizeVisual) return;
    
    // Update milestone highlights based on current week
    const milestoneItems = milestones.querySelectorAll('.milestone-item');
    milestoneItems.forEach((item, index) => {
        const milestoneWeek = parseInt(item.querySelector('.milestone-week')?.textContent);
        if (milestoneWeek && milestoneWeek <= week) {
            item.style.background = 'var(--primary-pink)';
            item.style.transform = 'scale(1.05)';
        } else {
            item.style.background = 'var(--white)';
            item.style.transform = 'scale(1)';
        }
    });
    
    // Update size comparison based on current week
    const sizeItems = sizeVisual.querySelectorAll('.size-item');
    sizeItems.forEach((item, index) => {
        const sizeWeek = parseInt(item.textContent?.match(/Week (\d+)/)?.[1]);
        if (sizeWeek && sizeWeek <= week) {
            item.classList.add('current');
        } else {
            item.classList.remove('current');
        }
    });
}

// Update week detail panel with pregnancy information
function updateWeekDetail(week) {
    const phaseData = pregnancyWeekPhases.find(p => p.week === week);
    const size = pregnancyWeekSizes[week] || 'watermelon';
    
    // Generate AI-powered insights for this week
    const aiInsights = generatePregnancyAIInsights(week, phaseData);
    
    // Update AI context
    if (window.MamasafeAI) {
        window.MamasafeAI.userProfile.pregnancyStage = {
            week: week,
            phase: phaseData?.phase,
            size: size
        };
        window.MamasafeAI.saveUserProfile();
    }
    
    // Update week detail panel elements
    const weekStageLabel = document.getElementById('weekStageLabel');
    const weekDetailTitle = document.getElementById('weekDetailTitle');
    const weekDetailSummary = document.getElementById('weekDetailSummary');
    const weekBabySize = document.getElementById('weekBabySize');
    const weekMilestoneText = document.getElementById('weekMilestoneText');
    const weekBabyGrowth = document.getElementById('weekBabyGrowth');
    const weekMotherChanges = document.getElementById('weekMotherChanges');
    const weekCareFocus = document.getElementById('weekCareFocus');
    const weekAskProvider = document.getElementById('weekAskProvider');
    const weekChecklist = document.getElementById('weekChecklist');
    const weekAlertSigns = document.getElementById('weekAlertSigns');
    
    if (phaseData) {
        if (weekStageLabel) weekStageLabel.textContent = phaseData.phase;
        if (weekDetailTitle) weekDetailTitle.textContent = `Week ${week}: ${phaseData.phase}`;
        if (weekDetailSummary) weekDetailSummary.textContent = phaseData.description;
        
        // Generate trimester-specific content
        const trimesterContent = generateTrimesterContent(week);
        if (weekBabyGrowth) weekBabyGrowth.textContent = trimesterContent.babyDevelopment;
        if (weekMotherChanges) weekMotherChanges.textContent = trimesterContent.motherChanges;
        if (weekCareFocus) weekCareFocus.textContent = trimesterContent.careFocus;
        if (weekAskProvider) weekAskProvider.textContent = trimesterContent.providerQuestions;
        if (weekChecklist) weekChecklist.innerHTML = trimesterContent.checklist.map(item => `<li>${item}</li>`).join('');
        if (weekAlertSigns) weekAlertSigns.innerHTML = trimesterContent.alertSigns.map(item => `<li>${item}</li>`).join('');
    }
    
    if (weekBabySize) weekBabySize.textContent = size;
    if (weekMilestoneText) weekMilestoneText.textContent = `Milestone: ${phaseData ? phaseData.description : 'Your baby is growing steadily.'}`;
}

// Generate AI-powered pregnancy insights
function generatePregnancyAIInsights(week, phaseData) {
    const insights = [];
    
    // Week-specific AI insights
    if (week <= 12) {
        insights.push("🤰 First trimester is crucial for neural tube development - ensure adequate folic acid intake");
        insights.push("🥗 Morning sickness may peak around weeks 9-10 - eat small, frequent meals");
        insights.push("💊 Schedule your first prenatal appointment if you haven't already");
    } else if (week <= 27) {
        insights.push("🤰 You should feel baby movements regularly now - track kick counts daily");
        insights.push("📈 Weight gain should be steady - aim for 1-2 pounds per week");
        insights.push("👶 Consider scheduling anatomy scan around week 20-22");
    } else {
        insights.push("🚀 Final preparations - pack hospital bag and install car seat");
        insights.push("📊 Monitor for signs of labor - contractions, water breaking, back pain");
        insights.push("🏥 Practice breathing techniques for labor management");
    }
    
    // Phase-specific insights
    if (phaseData) {
        insights.push(`📍 Current Phase: ${phaseData.phase}`);
        insights.push(`ℹ️ ${phaseData.description}`);
    }
    
    // Personalized recommendations
    insights.push("💡 AI Tip: Stay hydrated with 8-10 glasses of water daily");
    insights.push("🧘 AI Tip: Get adequate rest - aim for 8+ hours of sleep");
    insights.push("🏃 AI Tip: Gentle exercise like walking or swimming is beneficial");
    
    return insights;
}

// Generate trimester-specific content
function generateTrimesterContent(week) {
    let content = {
        babyDevelopment: '',
        motherChanges: '',
        careFocus: '',
        providerQuestions: '',
        checklist: [],
        alertSigns: []
    };
    
    if (week <= 13) {
        // First Trimester
        content.babyDevelopment = 'Your baby is developing rapidly with major organs forming, neural tube closing, and early movements beginning.';
        content.motherChanges = 'You may experience morning sickness, fatigue, breast tenderness, and mood swings.';
        content.careFocus = 'Focus on nutrition, rest, and prenatal vitamins. Schedule your first appointment.';
        content.providerQuestions = 'Ask about prenatal testing, due date calculation, and early pregnancy care.';
        content.checklist = [
            'Take prenatal vitamins daily',
            'Schedule first prenatal appointment',
            'Eat small, frequent meals',
            'Get plenty of rest',
            'Stay hydrated'
        ];
        content.alertSigns = [
            'Severe nausea or vomiting',
            'Vaginal bleeding',
            'Severe abdominal pain',
            'Fever above 101°F (38.3°C)'
        ];
    } else if (week <= 27) {
        // Second Trimester
        content.babyDevelopment = 'Your baby is growing quickly with features becoming more defined, movements becoming stronger, and hearing developing.';
        content.motherChanges = 'You may have more energy, less nausea, and start feeling baby movements.';
        content.careFocus = 'Enjoy your energy boost! Focus on exercise, nutrition, and anatomy scan planning.';
        content.providerQuestions = 'Ask about anatomy scan, movement monitoring, and birth planning.';
        content.checklist = [
            'Continue prenatal vitamins',
            'Exercise regularly',
            'Monitor baby movements',
            'Plan anatomy scan',
            'Practice good posture'
        ];
        content.alertSigns = [
            'Decreased baby movement',
            'Severe headaches',
            'Vision changes',
            'Swelling in hands/face'
        ];
    } else {
        // Third Trimester
        content.babyDevelopment = 'Your baby is preparing for birth with rapid weight gain, lungs maturing, and positioning for delivery.';
        content.motherChanges = 'You may feel more discomfort, practice Braxton Hicks, and experience nesting instincts.';
        content.careFocus = 'Prepare for birth! Focus on rest, kick counting, and hospital planning.';
        content.providerQuestions = 'Ask about labor signs, birth plan, and postpartum preparation.';
        content.checklist = [
            'Pack hospital bag',
            'Practice breathing exercises',
            'Monitor kick counts',
            'Arrange childcare for older children',
            'Install car seat'
        ];
        content.alertSigns = [
            'Regular contractions',
            'Water breaking',
            'Decreased baby movement',
            'Severe back pain'
        ];
    }
    
    return content;
}

// Initialize pregnancy tools
function initializePregnancyTools() {
    console.log('Initializing pregnancy tools...');
    
    // Generate week buttons
    generateWeekButtons();
    
    // Set up event listeners
    const homeLmpInput = document.getElementById('homeLastPeriod');
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

function getBabySize(week) {
    const sizes = [
        'Poppy seed', 'Sesame seed', 'Lentil', 'Blueberry', 'Raspberry', 'Kidney bean',
        'Grape', 'Tomato', 'Plum', 'Lime', 'Peach', 'Apple', 'Avocado',
        'Bell pepper', 'Carrot', 'Banana', 'Corn', 'Turnip', 'Large onion', 'Mango',
        'Cantaloupe', 'Coconut', 'Pineapple', 'Honeydew', 'Watermelon', 'Small pumpkin'
    ];
    return sizes[Math.min(week - 1, sizes.length - 1)] || 'Poppy seed';
}

function sanitizeNameText(value) {
    if (!value) return '';
    return String(value).replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim();
}

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

window.currentDisplayedNames = window.currentDisplayedNames || [];

function escapeNameHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function toNameJsArg(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeNameGender(gender) {
    const value = String(gender || 'unisex').toLowerCase();
    if (value === 'male' || value === 'boy') return 'male';
    if (value === 'female' || value === 'girl') return 'female';
    if (value === 'unisex') return 'unisex';
    return 'unisex';
}

function enrichName(name) {
    return {
        ...name,
        luckyNumber: name.luckyNumber || calculateLuckyNumber(name.name || ''),
        luckyColor: name.luckyColor || calculateLuckyColor(name.name || '')
    };
}

function getMamasafeBackendOrigin() {
    if (window.MAMASAFE_API_BASE) {
        return window.MAMASAFE_API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }

    const { protocol, hostname, port, origin } = window.location;
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];

    if (localHosts.includes(hostname) && port !== '5000') {
        return `${protocol}//${hostname}:5000`;
    }

    return origin;
}

function hasMamasafeBackend() {
    if (window.MAMASAFE_API_BASE) {
        return true;
    }

    const { hostname, port } = window.location;
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
    return localHosts.includes(hostname) && port !== '5000';
}

// Calculate lucky number based on name
function calculateLuckyNumber(name) {
    const nameValue = name.toLowerCase().split('').reduce((sum, char) => {
        return sum + (char.charCodeAt(0) - 96);
    }, 0);
    return ((nameValue - 1) % 9) + 1;
}

// Calculate lucky color based on name
function calculateLuckyColor(name) {
    const colors = [
        { name: 'Red', hex: '#ff6b9d', meaning: 'Passion, Energy, Courage' },
        { name: 'Blue', hex: '#00d4aa', meaning: 'Calm, Trust, Wisdom' },
        { name: 'Green', hex: '#a8edea', meaning: 'Growth, Harmony, Nature' },
        { name: 'Yellow', hex: '#ffe4ec', meaning: 'Joy, Optimism, Creativity' },
        { name: 'Purple', hex: '#a8edea', meaning: 'Royalty, Spirituality, Mystery' },
        { name: 'Orange', hex: '#ff9800', meaning: 'Enthusiasm, Warmth, Success' },
        { name: 'Pink', hex: '#ffe4ec', meaning: 'Love, Compassion, Gentleness' },
        { name: 'Brown', hex: '#ff9800', meaning: 'Stability, Earth, Reliability' },
        { name: 'Gold', hex: '#ffd700', meaning: 'Wealth, Success, Achievement' }
    ];
    
    const nameHash = name.toLowerCase().split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    
    const colorIndex = Math.abs(nameHash) % colors.length;
    return colors[colorIndex];
}

// Search for baby names (Groq AI-powered)
window.searchNames = async function() {
    console.log('searchNames function called');
    
    const searchInput = document.getElementById('nameSearchInput');
    const onlineToggle = document.getElementById('onlineNamesToggle');
    const namesList = document.getElementById('namesList');
    const namesOnlineStatus = document.getElementById('namesOnlineStatus');
    
    console.log('Elements found:', {
        searchInput: !!searchInput,
        onlineToggle: !!onlineToggle,
        namesList: !!namesList,
        namesOnlineStatus: !!namesOnlineStatus
    });
    
    if (!namesList) {
        console.error('namesList element not found');
        return;
    }
    
    const query = searchInput ? searchInput.value.trim() : '';
    const isOnline = onlineToggle ? onlineToggle.checked : true;
    
    console.log('Search parameters:', { query, isOnline });
    
    // Show loading state
    namesList.innerHTML = '<div class="loading">🤖 Searching for names...</div>';
    
    try {
        let names = [];
        
        if (isOnline && hasMamasafeBackend()) {
            console.log('Attempting online search...');
            // Update status
            if (namesOnlineStatus) {
                namesOnlineStatus.textContent = 'Llama 3.3 70B analyzing names...';
                namesOnlineStatus.style.color = 'var(--primary-pink)';
            }
            
            // Search via Groq AI
            const response = await fetch(`${getMamasafeBackendOrigin()}/api/mamasafe-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Generate baby names for: ${query || 'any'}. If the user is searching for a specific name, include that exact name first if it exists, then provide 4 similar names. If searching generally, provide 5 diverse names. Return ONLY a JSON array with this exact format: [{"name": "Name", "gender": "male/female/unisex", "origin": "Origin", "meaning": "Meaning"}]. Include diverse names from different cultures.`,
                    context: { requestType: 'baby-names', searchQuery: query }
                })
            });
            
            console.log('AI response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('AI response data:', data);
            
            if (data.reply) {
                // Try to parse AI response as JSON
                try {
                    const aiResponse = data.reply.trim();
                    console.log('AI response text:', aiResponse);
                    
                    // Try to parse as direct JSON first
                    if (aiResponse.startsWith('[') && aiResponse.endsWith(']')) {
                        names = JSON.parse(aiResponse);
                        console.log('Parsed direct JSON names:', names);
                    } else {
                        // Extract JSON from AI response
                        const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
                        if (jsonMatch) {
                            names = JSON.parse(jsonMatch[0]);
                            console.log('Parsed extracted JSON names:', names);
                        } else {
                            // Fallback: parse text response
                            names = parseAIBabyNamesResponse(aiResponse);
                            console.log('Parsed text names:', names);
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', parseError);
                    names = parseAIBabyNamesResponse(data.reply);
                }
                
                if (namesOnlineStatus && names.length > 0) {
                    namesOnlineStatus.textContent = `Llama 3.3 70B found ${names.length} perfect names`;
                    namesOnlineStatus.style.color = 'var(--success-color)';
                }
            } else {
                console.log('No AI reply, falling back to offline');
                // Fallback to offline search if no AI results
                names = searchOfflineNames(query);
                if (namesOnlineStatus) {
                    namesOnlineStatus.textContent = 'No AI results, showing offline names';
                    namesOnlineStatus.style.color = 'var(--text-gray)';
                }
            }
        } else {
            console.log('Using offline search');
            // Search offline
            names = searchOfflineNames(query);
            if (namesOnlineStatus) {
                namesOnlineStatus.textContent = isOnline
                    ? `AI backend not configured, showing ${names.length} local names`
                    : `Found ${names.length} offline results`;
                namesOnlineStatus.style.color = 'var(--text-gray)';
            }
        }
        
        console.log('Final names count:', names.length);
        
        // Add lucky numbers and colors to all names
        names = names.map(name => ({
            ...name,
            luckyNumber: calculateLuckyNumber(name.name),
            luckyColor: calculateLuckyColor(name.name)
        }));
        
        console.log('Displaying names with lucky elements');
        
        // Display results
        displayAINames(names, query);
        
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to offline search on error
        namesList.innerHTML = '<div class="loading">Llama 3.3 70B unavailable, searching offline...</div>';
        const names = searchOfflineNames(query);
        console.log('Fallback offline names:', names.length);
        const enrichedNames = names.map(name => ({
            ...name,
            luckyNumber: calculateLuckyNumber(name.name),
            luckyColor: calculateLuckyColor(name.name)
        }));
        displayAINames(enrichedNames);
        if (namesOnlineStatus) {
            namesOnlineStatus.textContent = 'Using offline database';
            namesOnlineStatus.style.color = 'var(--text-gray)';
        }
    }
}

// Parse AI baby names response
function parseAIBabyNamesResponse(aiResponse) {
    const names = [];
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        // Try to extract name info from text
        const nameMatch = line.match(/(\w+)\s*\((\w+)\):\s*([^,]+),\s*([^,]+)/i);
        if (nameMatch) {
            names.push({
                name: nameMatch[1],
                gender: nameMatch[2].toLowerCase(),
                meaning: nameMatch[3].trim(),
                origin: nameMatch[4].trim()
            });
        } else {
            // Try simpler pattern
            const simpleMatch = line.match(/(\w+)\s*-\s*(\w+)\s*-\s*([^,]+)\s*-\s*(.+)/i);
            if (simpleMatch) {
                names.push({
                    name: simpleMatch[1],
                    gender: simpleMatch[2].toLowerCase(),
                    meaning: simpleMatch[3].trim(),
                    origin: simpleMatch[4].trim()
                });
            }
        }
    });
    
    return names;
}

// Initialize baby names page
function initializeBabyNames() {
    console.log('Initializing baby names page...');
    
    setupBabyNamesControls();
    
    // Load initial names
    loadInitialNames();
    
    // Setup event listeners
    const searchInput = document.getElementById('nameSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchNames();
            }
        });
    }
}

// Load initial names on page load
function loadInitialNames() {
    setNamesViewMode('all');
    console.log('🚀 Loading initial names...');
    const namesList = document.getElementById('namesList');
    const namesTitle = document.getElementById('namesTitle');
    const onlineToggle = document.getElementById('onlineNamesToggle');
    const namesOnlineStatus = document.getElementById('namesOnlineStatus');
    
    console.log('Elements found:', {
        namesList: !!namesList,
        onlineToggle: !!onlineToggle,
        namesOnlineStatus: !!namesOnlineStatus
    });
    
    if (namesList) {
        namesList.innerHTML = '<div class="loading">🤖 Loading baby names...</div>';
    }
    
    // Start with offline names to show all 100 local names
    console.log('📚 Loading offline names database (100 boys + 100 girls)');
    const names = searchOfflineNames('');
    const enrichedNames = names.map(name => ({
        ...name,
        luckyNumber: calculateLuckyNumber(name.name),
        luckyColor: calculateLuckyColor(name.name)
    }));
    displayAINames(enrichedNames);
    if (namesOnlineStatus) {
        namesOnlineStatus.textContent = `Showing ${enrichedNames.length} local names`;
    }
    
    // Set online toggle to on by default (AI-Powered Search)
    if (onlineToggle) {
        onlineToggle.checked = true;
        console.log('🌐 Online search enabled by default - AI-Powered Search active');
    }
}

// Search offline names (expanded local database with 100 boys and 100 girls names)
function searchOfflineNames(query) {
    const offlineNames = [
        // BOYS NAMES (100 names)
        { name: 'Liam', gender: 'male', origin: 'Irish', meaning: 'Resolute protector', popularity: 'high' },
        { name: 'Bruce', gender: 'male', origin: 'Scottish', meaning: 'From the brushwood thicket', popularity: 'medium' },
        { name: 'Noah', gender: 'male', origin: 'Hebrew', meaning: 'Rest, comfort', popularity: 'high' },
        { name: 'Oliver', gender: 'male', origin: 'Latin', meaning: 'Olive tree', popularity: 'high' },
        { name: 'Elijah', gender: 'male', origin: 'Hebrew', meaning: 'Yahweh is God', popularity: 'high' },
        { name: 'Lucas', gender: 'male', origin: 'Latin', meaning: 'Light', popularity: 'high' },
        { name: 'Mason', gender: 'male', origin: 'English', meaning: 'Stone worker', popularity: 'high' },
        { name: 'Logan', gender: 'male', origin: 'Scottish', meaning: 'Little hollow', popularity: 'high' },
        { name: 'Jacob', gender: 'male', origin: 'Hebrew', meaning: 'Supplanter', popularity: 'medium' },
        { name: 'Ethan', gender: 'male', origin: 'Hebrew', meaning: 'Strong, enduring', popularity: 'high' },
        { name: 'Aiden', gender: 'male', origin: 'Irish', meaning: 'Little fire', popularity: 'high' },
        { name: 'James', gender: 'male', origin: 'Hebrew', meaning: 'Supplanter', popularity: 'high' },
        { name: 'Michael', gender: 'male', origin: 'Hebrew', meaning: 'Who is like God', popularity: 'high' },
        { name: 'Benjamin', gender: 'male', origin: 'Hebrew', meaning: 'Son of the right hand', popularity: 'high' },
        { name: 'William', gender: 'male', origin: 'German', meaning: 'Resolute protector', popularity: 'high' },
        { name: 'Alexander', gender: 'male', origin: 'Greek', meaning: 'Defender of mankind', popularity: 'high' },
        { name: 'Henry', gender: 'male', origin: 'German', meaning: 'Estate ruler', popularity: 'high' },
        { name: 'Daniel', gender: 'male', origin: 'Hebrew', meaning: 'God is my judge', popularity: 'high' },
        { name: 'Matthew', gender: 'male', origin: 'Hebrew', meaning: 'Gift of Yahweh', popularity: 'high' },
        { name: 'Joseph', gender: 'male', origin: 'Hebrew', meaning: 'He will add', popularity: 'high' },
        { name: 'David', gender: 'male', origin: 'Hebrew', meaning: 'Beloved', popularity: 'high' },
        { name: 'Samuel', gender: 'male', origin: 'Hebrew', meaning: 'God has heard', popularity: 'high' },
        { name: 'Carter', gender: 'male', origin: 'English', meaning: 'Cart driver', popularity: 'medium' },
        { name: 'Wyatt', gender: 'male', origin: 'English', meaning: 'Brave in war', popularity: 'medium' },
        { name: 'Jayden', gender: 'male', origin: 'Hebrew', meaning: 'Thankful', popularity: 'high' },
        { name: 'John', gender: 'male', origin: 'Hebrew', meaning: 'God is gracious', popularity: 'high' },
        { name: 'Dylan', gender: 'male', origin: 'Welsh', meaning: 'Son of the sea', popularity: 'medium' },
        { name: 'Luke', gender: 'male', origin: 'Greek', meaning: 'Light-giving', popularity: 'high' },
        { name: 'Gabriel', gender: 'male', origin: 'Hebrew', meaning: 'God is my strength', popularity: 'high' },
        { name: 'Anthony', gender: 'male', origin: 'Latin', meaning: 'Priceless', popularity: 'high' },
        { name: 'Isaac', gender: 'male', origin: 'Hebrew', meaning: 'He will laugh', popularity: 'high' },
        { name: 'Christopher', gender: 'male', origin: 'Greek', meaning: 'Christ-bearer', popularity: 'high' },
        { name: 'Joshua', gender: 'male', origin: 'Hebrew', meaning: 'Yahweh is salvation', popularity: 'high' },
        { name: 'Andrew', gender: 'male', origin: 'Greek', meaning: 'Manly, brave', popularity: 'high' },
        { name: 'Lincoln', gender: 'male', origin: 'English', meaning: 'Lake colony', popularity: 'medium' },
        { name: 'Mateo', gender: 'male', origin: 'Spanish', meaning: 'Gift of God', popularity: 'high' },
        { name: 'Ryan', gender: 'male', origin: 'Irish', meaning: 'Little king', popularity: 'high' },
        { name: 'Jaxon', gender: 'male', origin: 'American', meaning: 'God has been gracious', popularity: 'medium' },
        { name: 'Nathan', gender: 'male', origin: 'Hebrew', meaning: 'He gave', popularity: 'high' },
        { name: 'Aaron', gender: 'male', origin: 'Hebrew', meaning: 'Mountain of strength', popularity: 'high' },
        { name: 'Isaiah', gender: 'male', origin: 'Hebrew', meaning: 'Yahweh is salvation', popularity: 'high' },
        { name: 'Thomas', gender: 'male', origin: 'Aramaic', meaning: 'Twin', popularity: 'high' },
        { name: 'Charles', gender: 'male', origin: 'German', meaning: 'Free man', popularity: 'high' },
        { name: 'Caleb', gender: 'male', origin: 'Hebrew', meaning: 'Whole hearted', popularity: 'high' },
        { name: 'Christian', gender: 'male', origin: 'Latin', meaning: 'Follower of Christ', popularity: 'high' },
        { name: 'Jonathan', gender: 'male', origin: 'Hebrew', meaning: 'Gift of God', popularity: 'high' },
        { name: 'Adrian', gender: 'male', origin: 'Latin', meaning: 'Man from Hadria', popularity: 'medium' },
        { name: 'Nolan', gender: 'male', origin: 'Irish', meaning: 'Champion', popularity: 'medium' },
        { name: 'Hunter', gender: 'male', origin: 'English', meaning: 'One who hunts', popularity: 'high' },
        { name: 'Levi', gender: 'male', origin: 'Hebrew', meaning: 'Joined, attached', popularity: 'high' },
        { name: 'Julian', gender: 'male', origin: 'Latin', meaning: 'Youthful', popularity: 'medium' },
        { name: 'Axel', gender: 'male', origin: 'Scandinavian', meaning: 'Father of peace', popularity: 'medium' },
        { name: 'Jack', gender: 'male', origin: 'English', meaning: 'God is gracious', popularity: 'high' },
        { name: 'Owen', gender: 'male', origin: 'Welsh', meaning: 'Young warrior', popularity: 'high' },
        { name: 'Connor', gender: 'male', origin: 'Irish', meaning: 'Lover of hounds', popularity: 'high' },
        { name: 'Easton', gender: 'male', origin: 'English', meaning: 'East-facing place', popularity: 'medium' },
        { name: 'Maddox', gender: 'male', origin: 'Welsh', meaning: 'Benefactor', popularity: 'medium' },
        { name: 'Colton', gender: 'male', origin: 'English', meaning: 'Coal town', popularity: 'high' },
        { name: 'Jace', gender: 'male', origin: 'Hebrew', meaning: 'Healer', popularity: 'medium' },
        { name: 'Carson', gender: 'male', origin: 'Scottish', meaning: 'Son of marsh dwellers', popularity: 'high' },
        { name: 'Roman', gender: 'male', origin: 'Latin', meaning: 'Roman citizen', popularity: 'medium' },
        { name: 'Gideon', gender: 'male', origin: 'Hebrew', meaning: 'Great warrior', popularity: 'medium' },
        { name: 'Ian', gender: 'male', origin: 'Scottish', meaning: 'God is gracious', popularity: 'medium' },
        { name: 'Andre', gender: 'male', origin: 'French', meaning: 'Manly, brave', popularity: 'medium' },
        { name: 'Santiago', gender: 'male', origin: 'Spanish', meaning: 'Saint James', popularity: 'high' },
        { name: 'Eduardo', gender: 'male', origin: 'Spanish', meaning: 'Wealthy guardian', popularity: 'medium' },
        { name: 'Fernando', gender: 'male', origin: 'Spanish', meaning: 'Bold voyager', popularity: 'medium' },
        { name: 'Nicolas', gender: 'male', origin: 'Greek', meaning: 'Victory of the people', popularity: 'medium' },
        { name: 'Javier', gender: 'male', origin: 'Spanish', meaning: 'Bright, splendid', popularity: 'medium' },
        { name: 'Rafael', gender: 'male', origin: 'Hebrew', meaning: 'God has healed', popularity: 'medium' },
        { name: 'Diego', gender: 'male', origin: 'Spanish', meaning: 'Supplanter', popularity: 'medium' },
        { name: 'Sebastian', gender: 'male', origin: 'Greek', meaning: 'Venerable', popularity: 'high' },
        { name: 'Alejandro', gender: 'male', origin: 'Spanish', meaning: 'Defender of mankind', popularity: 'high' },
        { name: 'Carlos', gender: 'male', origin: 'Spanish', meaning: 'Free man', popularity: 'medium' },
        { name: 'Luis', gender: 'male', origin: 'Spanish', meaning: 'Famous warrior', popularity: 'medium' },
        { name: 'Miguel', gender: 'male', origin: 'Spanish', meaning: 'Who is like God', popularity: 'high' },
        { name: 'Jorge', gender: 'male', origin: 'Spanish', meaning: 'Farmer', popularity: 'medium' },
        { name: 'Antonio', gender: 'male', origin: 'Latin', meaning: 'Priceless', popularity: 'high' },
        { name: 'Francisco', gender: 'male', origin: 'Spanish', meaning: 'Frenchman', popularity: 'medium' },
        { name: 'Pedro', gender: 'male', origin: 'Spanish', meaning: 'Rock', popularity: 'medium' },
        { name: 'Juan', gender: 'male', origin: 'Spanish', meaning: 'God is gracious', popularity: 'high' },
        { name: 'Manuel', gender: 'male', origin: 'Spanish', meaning: 'God is with us', popularity: 'medium' },
        { name: 'Ricardo', gender: 'male', origin: 'Spanish', meaning: 'Strong ruler', popularity: 'medium' },
        { name: 'Roberto', gender: 'male', origin: 'Spanish', meaning: 'Bright fame', popularity: 'medium' },
        { name: 'Marco', gender: 'male', origin: 'Latin', meaning: 'Warlike', popularity: 'medium' },
        { name: 'Paulo', gender: 'male', origin: 'Latin', meaning: 'Small', popularity: 'medium' },
        { name: 'Bruno', gender: 'male', origin: 'German', meaning: 'Brown', popularity: 'medium' },
        { name: 'Leo', gender: 'male', origin: 'Latin', meaning: 'Lion', popularity: 'high' },
        { name: 'Max', gender: 'male', origin: 'Latin', meaning: 'Greatest', popularity: 'high' },
        { name: 'Felix', gender: 'male', origin: 'Latin', meaning: 'Happy, fortunate', popularity: 'medium' },
        { name: 'Victor', gender: 'male', origin: 'Latin', meaning: 'Conqueror', popularity: 'medium' },
        { name: 'Hugo', gender: 'male', origin: 'German', meaning: 'Mind, intellect', popularity: 'medium' },
        { name: 'Walter', gender: 'male', origin: 'German', meaning: 'Powerful ruler', popularity: 'medium' },
        { name: 'Robert', gender: 'male', origin: 'German', meaning: 'Bright fame', popularity: 'high' },
        { name: 'Karl', gender: 'male', origin: 'German', meaning: 'Free man', popularity: 'medium' },
        { name: 'Stefan', gender: 'male', origin: 'German', meaning: 'Crown', popularity: 'medium' },
        { name: 'Olaf', gender: 'male', origin: 'Scandinavian', meaning: 'Ancestor\'s relic', popularity: 'low' },
        { name: 'Gunnar', gender: 'male', origin: 'Scandinavian', meaning: 'Warrior', popularity: 'low' },
        { name: 'Erik', gender: 'male', origin: 'Scandinavian', meaning: 'Eternal ruler', popularity: 'low' },
        { name: 'Lars', gender: 'male', origin: 'Scandinavian', meaning: 'Laurel', popularity: 'low' },
        { name: 'Nils', gender: 'male', origin: 'Scandinavian', meaning: 'Victory of the people', popularity: 'low' },
        { name: 'Sven', gender: 'male', origin: 'Scandinavian', meaning: 'Young man', popularity: 'low' },
        { name: 'Bjorn', gender: 'male', origin: 'Scandinavian', meaning: 'Bear', popularity: 'low' },
        { name: 'Magnus', gender: 'male', origin: 'Scandinavian', meaning: 'Great', popularity: 'low' },
        { name: 'Igor', gender: 'male', origin: 'Russian', meaning: 'Warrior', popularity: 'low' },
        { name: 'Dmitri', gender: 'male', origin: 'Russian', meaning: 'Follower of Demeter', popularity: 'low' },
        { name: 'Vladimir', gender: 'male', origin: 'Russian', meaning: 'Great ruler', popularity: 'low' },
        { name: 'Sergei', gender: 'male', origin: 'Russian', meaning: 'Shepherd', popularity: 'low' },
        { name: 'Alexei', gender: 'male', origin: 'Russian', meaning: 'Defender', popularity: 'low' },
        { name: 'Nikolai', gender: 'male', origin: 'Russian', meaning: 'Victory of the people', popularity: 'low' },
        { name: 'Pavel', gender: 'male', origin: 'Russian', meaning: 'Small', popularity: 'low' },
        { name: 'Yuri', gender: 'male', origin: 'Russian', meaning: 'Farmer', popularity: 'low' },
        { name: 'Ivan', gender: 'male', origin: 'Russian', meaning: 'God is gracious', popularity: 'low' },
        { name: 'Mikhail', gender: 'male', origin: 'Russian', meaning: 'Who is like God', popularity: 'low' },
        { name: 'Anatoly', gender: 'male', origin: 'Russian', meaning: 'Sunrise', popularity: 'low' },
        { name: 'Grigory', gender: 'male', origin: 'Russian', meaning: 'Watchful', popularity: 'low' },
        { name: 'Rostislav', gender: 'male', origin: 'Russian', meaning: 'Glory', popularity: 'low' },
        { name: 'Stanislav', gender: 'male', origin: 'Russian', meaning: 'Stand and glory', popularity: 'low' },
        { name: 'Vadim', gender: 'male', origin: 'Russian', meaning: 'To rule', popularity: 'low' },
        { name: 'Gennady', gender: 'male', origin: 'Russian', meaning: 'Noble', popularity: 'low' },
        { name: 'Konstantin', gender: 'male', origin: 'Russian', meaning: 'Constant', popularity: 'low' },
        { name: 'Fyodor', gender: 'male', origin: 'Russian', meaning: 'Gift of God', popularity: 'low' },
        { name: 'Vasily', gender: 'male', origin: 'Russian', meaning: 'Royal', popularity: 'low' },
        { name: 'Piotr', gender: 'male', origin: 'Russian', meaning: 'Rock', popularity: 'low' },
        { name: 'Andrei', gender: 'male', origin: 'Russian', meaning: 'Manly', popularity: 'low' },
        { name: 'Dmitry', gender: 'male', origin: 'Russian', meaning: 'Devoted to Demeter', popularity: 'low' },
        { name: 'Yevgeny', gender: 'male', origin: 'Russian', meaning: 'Noble', popularity: 'low' },
        { name: 'Vitaly', gender: 'male', origin: 'Russian', meaning: 'Life', popularity: 'low' },
        { name: 'Kirill', gender: 'male', origin: 'Russian', meaning: 'Lordly', popularity: 'low' },
        { name: 'Oleg', gender: 'male', origin: 'Russian', meaning: 'Holy', popularity: 'low' },
        { name: 'Ruslan', gender: 'male', origin: 'Russian', meaning: 'Lion', popularity: 'low' },
        { name: 'Timur', gender: 'male', origin: 'Russian', meaning: 'Iron', popularity: 'low' },
        { name: 'Artur', gender: 'male', origin: 'Russian', meaning: 'Bear', popularity: 'low' },
        { name: 'Denis', gender: 'male', origin: 'Russian', meaning: 'Follower of Dionysus', popularity: 'low' },
        { name: 'Maxim', gender: 'male', origin: 'Russian', meaning: 'Greatest', popularity: 'low' },
        { name: 'Ilya', gender: 'male', origin: 'Russian', meaning: 'Yahweh is God', popularity: 'low' },
        { name: 'Alexandr', gender: 'male', origin: 'Russian', meaning: 'Defender of mankind', popularity: 'low' },
        { name: 'Vladislav', gender: 'male', origin: 'Russian', meaning: 'Rule with glory', popularity: 'low' },
        { name: 'Svyatoslav', gender: 'male', origin: 'Russian', meaning: 'Blessed glory', popularity: 'low' },
        { name: 'Boris', gender: 'male', origin: 'Russian', meaning: 'Fight', popularity: 'low' },
        { name: 'Gleb', gender: 'male', origin: 'Russian', meaning: 'Heir', popularity: 'low' },
        { name: 'Roman', gender: 'male', origin: 'Russian', meaning: 'Roman', popularity: 'low' },
        { name: 'Yaroslav', gender: 'male', origin: 'Russian', meaning: 'Fierce and glorious', popularity: 'low' },
        { name: 'Vsevolod', gender: 'male', origin: 'Russian', meaning: 'Ruler of all', popularity: 'low' },
        { name: 'Mstislav', gender: 'male', origin: 'Russian', meaning: 'Glory vengeance', popularity: 'low' },
        { name: 'Rostov', gender: 'male', origin: 'Russian', meaning: 'Growth', popularity: 'low' },
        { name: 'Tikhon', gender: 'male', origin: 'Russian', meaning: 'Quiet', popularity: 'low' },
        { name: 'Zakhary', gender: 'male', origin: 'Russian', meaning: 'God remembers', popularity: 'low' },
        { name: 'Prokhor', gender: 'male', origin: 'Russian', meaning: 'Leader', popularity: 'low' },
        { name: 'Taras', gender: 'male', origin: 'Russian', meaning: 'Of Taras', popularity: 'low' },
        { name: 'Stepan', gender: 'male', origin: 'Russian', meaning: 'Crown', popularity: 'low' },
        { name: 'Filipp', gender: 'male', origin: 'Russian', meaning: 'Lover of horses', popularity: 'low' },
        { name: 'Matvey', gender: 'male', origin: 'Russian', meaning: 'Gift of God', popularity: 'low' },
        { name: 'Kuzma', gender: 'male', origin: 'Russian', meaning: 'Honor', popularity: 'low' },
        { name: 'Luka', gender: 'male', origin: 'Russian', meaning: 'Light', popularity: 'low' },
        { name: 'Makar', gender: 'male', origin: 'Russian', meaning: 'Blessed', popularity: 'low' },
        { name: 'Foka', gender: 'male', origin: 'Russian', meaning: 'Rock', popularity: 'low' },
        { name: 'Klim', gender: 'male', origin: 'Russian', meaning: 'Merciful', popularity: 'low' },
        { name: 'Gerasim', gender: 'male', origin: 'Russian', meaning: 'Elder', popularity: 'low' },
        { name: 'Zosima', gender: 'male', origin: 'Russian', meaning: 'Survivor', popularity: 'low' },
        { name: 'Afanasy', gender: 'male', origin: 'Russian', meaning: 'Immortal', popularity: 'low' },
        { name: 'Pankrat', gender: 'male', origin: 'Russian', meaning: 'All-powerful', popularity: 'low' },
        { name: 'Kallistrat', gender: 'male', origin: 'Russian', meaning: 'Beautiful army', popularity: 'low' },
        { name: 'Dementy', gender: 'male', origin: 'Russian', meaning: 'Tamer', popularity: 'low' },
        { name: 'Kondrat', gender: 'male', origin: 'Russian', meaning: 'Bold counsel', popularity: 'low' },
        { name: 'Nikanor', gender: 'male', origin: 'Russian', meaning: 'Victory', popularity: 'low' },
        { name: 'Varsonofy', gender: 'male', origin: 'Russian', meaning: 'Life of man', popularity: 'low' },
        { name: 'Pamfil', gender: 'male', origin: 'Russian', meaning: 'Friend of all', popularity: 'low' },
        { name: 'Trifon', gender: 'male', origin: 'Russian', meaning: 'Luxurious', popularity: 'low' },
        { name: 'Miron', gender: 'male', origin: 'Russian', meaning: 'Peace', popularity: 'low' },
        { name: 'Lavr', gender: 'male', origin: 'Russian', meaning: 'Lavender', popularity: 'low' },
        { name: 'Makary', gender: 'male', origin: 'Russian', meaning: 'Blessed', popularity: 'low' },
        { name: 'Vladlen', gender: 'male', origin: 'Russian', meaning: 'Vladimir Lenin', popularity: 'low' },
        { name: 'Viacheslav', gender: 'male', origin: 'Russian', meaning: 'Glory', popularity: 'low' },
        { name: 'Saveliy', gender: 'male', origin: 'Russian', meaning: 'Old man', popularity: 'low' },
        { name: 'Rodion', gender: 'male', origin: 'Russian', meaning: 'Hero\'s song', popularity: 'low' },
        { name: 'Vissarion', gender: 'male', origin: 'Russian', meaning: 'Forest', popularity: 'low' },
        { name: 'Yefim', gender: 'male', origin: 'Russian', meaning: 'Well-spoken', popularity: 'low' },
        { name: 'Kupriyan', gender: 'male', origin: 'Russian', meaning: 'Humble', popularity: 'low' },
        { name: 'Gavriil', gender: 'male', origin: 'Russian', meaning: 'God is my strength', popularity: 'low' },
        { name: 'Terenty', gender: 'male', origin: 'Russian', meaning: 'Rub', popularity: 'low' },
        { name: 'Prokopy', gender: 'male', origin: 'Russian', meaning: 'Progress', popularity: 'low' },
        { name: 'Yevstigney', gender: 'male', origin: 'Russian', meaning: 'Well-born', popularity: 'low' },
        { name: 'Solomon', gender: 'male', origin: 'Russian', meaning: 'Peace', popularity: 'low' },
        { name: 'Nazary', gender: 'male', origin: 'Russian', meaning: 'Consecrated', popularity: 'low' },
        { name: 'Agap', gender: 'male', origin: 'Russian', meaning: 'Love', popularity: 'low' },
        { name: 'Pakhom', gender: 'male', origin: 'Russian', meaning: 'Broad shoulder', popularity: 'low' },
        { name: 'Evdokim', gender: 'male', origin: 'Russian', meaning: 'Good glory', popularity: 'low' },
        { name: 'Emelyan', gender: 'male', origin: 'Russian', meaning: 'Rival', popularity: 'low' },
        { name: 'Frol', gender: 'male', origin: 'Russian', meaning: 'Flower', popularity: 'low' },
        { name: 'Kliment', gender: 'male', origin: 'Russian', meaning: 'Merciful', popularity: 'low' },
        { name: 'Damaskin', gender: 'male', origin: 'Russian', meaning: 'From Damascus', popularity: 'low' },
        { name: 'Innokenty', gender: 'male', origin: 'Russian', meaning: 'Innocent', popularity: 'low' },
        { name: 'Aristarkh', gender: 'male', origin: 'Russian', meaning: 'Best ruler', popularity: 'low' },
        { name: 'Yermolay', gender: 'male', origin: 'Russian', meaning: 'People of Hermes', popularity: 'low' },
        { name: 'Anisim', gender: 'male', origin: 'Russian', meaning: 'Upright', popularity: 'low' },
        { name: 'Kapiton', gender: 'male', origin: 'Russian', meaning: 'Big-headed', popularity: 'low' },
        { name: 'Zinovy', gender: 'male', origin: 'Russian', meaning: 'Life of Zeus', popularity: 'low' },
        { name: 'Fotiy', gender: 'male', origin: 'Russian', meaning: 'Light', popularity: 'low' },
        { name: 'Dorofey', gender: 'male', origin: 'Russian', meaning: 'Gift of God', popularity: 'low' },
        { name: 'Khrisanf', gender: 'male', origin: 'Russian', meaning: 'Golden flower', popularity: 'low' },
        { name: 'Mefody', gender: 'male', origin: 'Russian', meaning: 'Method', popularity: 'low' },
        { name: 'Nikita', gender: 'male', origin: 'Russian', meaning: 'Victorious', popularity: 'medium' },
        
        // GIRLS NAMES (100 names)
        { name: 'Olivia', gender: 'female', origin: 'Latin', meaning: 'Olive tree', popularity: 'high' },
        { name: 'Emma', gender: 'female', origin: 'German', meaning: 'Universal', popularity: 'high' },
        { name: 'Ava', gender: 'female', origin: 'Latin', meaning: 'Life, living', popularity: 'high' },
        { name: 'Sophia', gender: 'female', origin: 'Greek', meaning: 'Wisdom', popularity: 'high' },
        { name: 'Isabella', gender: 'female', origin: 'Hebrew', meaning: 'God is my oath', popularity: 'high' },
        { name: 'Mia', gender: 'female', origin: 'Italian', meaning: 'Mine', popularity: 'high' },
        { name: 'Charlotte', gender: 'female', origin: 'French', meaning: 'Free man', popularity: 'high' },
        { name: 'Amelia', gender: 'female', origin: 'German', meaning: 'Work', popularity: 'high' },
        { name: 'Harper', gender: 'female', origin: 'English', meaning: 'Harp player', popularity: 'high' },
        { name: 'Evelyn', gender: 'female', origin: 'English', meaning: 'Wished for child', popularity: 'high' },
        { name: 'Abigail', gender: 'female', origin: 'Hebrew', meaning: 'Father\'s joy', popularity: 'high' },
        { name: 'Emily', gender: 'female', origin: 'Latin', meaning: 'Rival', popularity: 'high' },
        { name: 'Elizabeth', gender: 'female', origin: 'Hebrew', meaning: 'God is my oath', popularity: 'high' },
        { name: 'Avery', gender: 'female', origin: 'English', meaning: 'Ruler of elves', popularity: 'high' },
        { name: 'Ella', gender: 'female', origin: 'English', meaning: 'Beautiful fairy', popularity: 'high' },
        { name: 'Madison', gender: 'female', origin: 'English', meaning: 'Son of Matthew', popularity: 'high' },
        { name: 'Scarlett', gender: 'female', origin: 'English', meaning: 'Red', popularity: 'high' },
        { name: 'Victoria', gender: 'female', origin: 'Latin', meaning: 'Victory', popularity: 'high' },
        { name: 'Aria', gender: 'female', origin: 'Italian', meaning: 'Air, melody', popularity: 'high' },
        { name: 'Grace', gender: 'female', origin: 'Latin', meaning: 'Grace, favor', popularity: 'high' },
        { name: 'Chloe', gender: 'female', origin: 'Greek', meaning: 'Green shoot', popularity: 'high' },
        { name: 'Camila', gender: 'female', origin: 'Latin', meaning: 'Young ceremonial attendant', popularity: 'high' },
        { name: 'Penelope', gender: 'female', origin: 'Greek', meaning: 'Weaver', popularity: 'high' },
        { name: 'Riley', gender: 'female', origin: 'Irish', meaning: 'Valiant', popularity: 'high' },
        { name: 'Zoey', gender: 'female', origin: 'Greek', meaning: 'Life', popularity: 'high' },
        { name: 'Nora', gender: 'female', origin: 'Irish', meaning: 'Honor', popularity: 'high' },
        { name: 'Lily', gender: 'female', origin: 'English', meaning: 'Lily flower', popularity: 'high' },
        { name: 'Eleanor', gender: 'female', origin: 'Greek', meaning: 'Shining light', popularity: 'high' },
        { name: 'Hannah', gender: 'female', origin: 'Hebrew', meaning: 'Grace', popularity: 'high' },
        { name: 'Lillian', gender: 'female', origin: 'Latin', meaning: 'Lily', popularity: 'high' },
        { name: 'Addison', gender: 'female', origin: 'English', meaning: 'Son of Adam', popularity: 'high' },
        { name: 'Aubrey', gender: 'female', origin: 'German', meaning: 'Elf ruler', popularity: 'high' },
        { name: 'Ellie', gender: 'female', origin: 'English', meaning: 'Beautiful fairy', popularity: 'high' },
        { name: 'Stella', gender: 'female', origin: 'Latin', meaning: 'Star', popularity: 'high' },
        { name: 'Natalie', gender: 'female', origin: 'Latin', meaning: 'Christmas Day', popularity: 'high' },
        { name: 'Zoe', gender: 'female', origin: 'Greek', meaning: 'Life', popularity: 'high' },
        { name: 'Leah', gender: 'female', origin: 'Hebrew', meaning: 'Weary', popularity: 'high' },
        { name: 'Hazel', gender: 'female', origin: 'English', meaning: 'Hazelnut tree', popularity: 'high' },
        { name: 'Violet', gender: 'female', origin: 'English', meaning: 'Violet flower', popularity: 'high' },
        { name: 'Aurora', gender: 'female', origin: 'Latin', meaning: 'Dawn', popularity: 'high' },
        { name: 'Savannah', gender: 'female', origin: 'Spanish', meaning: 'Treeless plain', popularity: 'high' },
        { name: 'Audrey', gender: 'female', origin: 'English', meaning: 'Noble strength', popularity: 'high' },
        { name: 'Brooklyn', gender: 'female', origin: 'English', meaning: 'Broken land', popularity: 'high' },
        { name: 'Bella', gender: 'female', origin: 'Italian', meaning: 'Beautiful', popularity: 'high' },
        { name: 'Claire', gender: 'female', origin: 'French', meaning: 'Clear, bright', popularity: 'high' },
        { name: 'Skylar', gender: 'female', origin: 'Dutch', meaning: 'Scholar', popularity: 'high' },
        { name: 'Lucy', gender: 'female', origin: 'Latin', meaning: 'Light', popularity: 'high' },
        { name: 'Paisley', gender: 'female', origin: 'Scottish', meaning: 'Church', popularity: 'high' },
        { name: 'Everly', gender: 'female', origin: 'English', meaning: 'From the meadow', popularity: 'high' },
        { name: 'Anna', gender: 'female', origin: 'Hebrew', meaning: 'Grace', popularity: 'high' },
        { name: 'Caroline', gender: 'female', origin: 'French', meaning: 'Free man', popularity: 'high' },
        { name: 'Nova', gender: 'female', origin: 'Latin', meaning: 'New', popularity: 'high' },
        { name: 'Genesis', gender: 'female', origin: 'Greek', meaning: 'Beginning', popularity: 'high' },
        { name: 'Emilia', gender: 'female', origin: 'Latin', meaning: 'Rival', popularity: 'high' },
        { name: 'Aaliyah', gender: 'female', origin: 'Arabic', meaning: 'Exalted, high', popularity: 'high' },
        { name: 'Alyssa', gender: 'female', origin: 'Greek', meaning: 'Rational', popularity: 'high' },
        { name: 'Allison', gender: 'female', origin: 'German', meaning: 'Noble', popularity: 'high' },
        { name: 'Ariana', gender: 'female', origin: 'Greek', meaning: 'Most holy', popularity: 'high' },
        { name: 'Autumn', gender: 'female', origin: 'Latin', meaning: 'Fall season', popularity: 'high' },
        { name: 'Brianna', gender: 'female', origin: 'Irish', meaning: 'Strong, virtuous', popularity: 'high' },
        { name: 'Catherine', gender: 'female', origin: 'Greek', meaning: 'Pure', popularity: 'high' },
        { name: 'Diamond', gender: 'female', origin: 'English', meaning: 'Diamond', popularity: 'medium' },
        { name: 'Eva', gender: 'female', origin: 'Hebrew', meaning: 'Life', popularity: 'high' },
        { name: 'Faith', gender: 'female', origin: 'English', meaning: 'Faith', popularity: 'medium' },
        { name: 'Gabriella', gender: 'female', origin: 'Hebrew', meaning: 'God is my strength', popularity: 'high' },
        { name: 'Hailey', gender: 'female', origin: 'English', meaning: 'Hay meadow', popularity: 'high' },
        { name: 'Isabel', gender: 'female', origin: 'Hebrew', meaning: 'God is my oath', popularity: 'high' },
        { name: 'Jasmine', gender: 'female', origin: 'Persian', meaning: 'Jasmine flower', popularity: 'high' },
        { name: 'Kayla', gender: 'female', origin: 'Hebrew', meaning: 'Crown of laurels', popularity: 'high' },
        { name: 'Layla', gender: 'female', origin: 'Arabic', meaning: 'Night', popularity: 'high' },
        { name: 'Mackenzie', gender: 'female', origin: 'Scottish', meaning: 'Born of fire', popularity: 'high' },
        { name: 'Melody', gender: 'female', origin: 'Greek', meaning: 'Music', popularity: 'medium' },
        { name: 'Michelle', gender: 'female', origin: 'Hebrew', meaning: 'Who is like God', popularity: 'high' },
        { name: 'Naomi', gender: 'female', origin: 'Hebrew', meaning: 'Pleasant', popularity: 'high' },
        { name: 'Paige', gender: 'female', origin: 'English', meaning: 'Page', popularity: 'medium' },
        { name: 'Rachel', gender: 'female', origin: 'Hebrew', meaning: 'Ewe', popularity: 'high' },
        { name: 'Rebecca', gender: 'female', origin: 'Hebrew', meaning: 'To bind', popularity: 'high' },
        { name: 'Serena', gender: 'female', origin: 'Latin', meaning: 'Tranquil', popularity: 'high' },
        { name: 'Taylor', gender: 'female', origin: 'English', meaning: 'Tailor', popularity: 'high' },
        { name: 'Vanessa', gender: 'female', origin: 'Greek', meaning: 'Butterfly', popularity: 'high' },
        { name: 'Zara', gender: 'female', origin: 'Arabic', meaning: 'Princess', popularity: 'high' },
        { name: 'Adriana', gender: 'female', origin: 'Latin', meaning: 'From Hadria', popularity: 'medium' },
        { name: 'Alexandra', gender: 'female', origin: 'Greek', meaning: 'Defender of mankind', popularity: 'high' },
        { name: 'Angelica', gender: 'female', origin: 'Latin', meaning: 'Angel', popularity: 'medium' },
        { name: 'Ashley', gender: 'female', origin: 'English', meaning: 'Ash tree meadow', popularity: 'high' },
        { name: 'Beatrice', gender: 'female', origin: 'Latin', meaning: 'Bringer of joy', popularity: 'medium' },
        { name: 'Brenda', gender: 'female', origin: 'Norse', meaning: 'Sword', popularity: 'medium' },
        { name: 'Camille', gender: 'female', origin: 'Latin', meaning: 'Young ceremonial attendant', popularity: 'medium' },
        { name: 'Cassandra', gender: 'female', origin: 'Greek', meaning: 'Shining upon men', popularity: 'medium' },
        { name: 'Christina', gender: 'female', origin: 'Latin', meaning: 'Follower of Christ', popularity: 'high' },
        { name: 'Danielle', gender: 'female', origin: 'Hebrew', meaning: 'God is my judge', popularity: 'high' },
        { name: 'Diana', gender: 'female', origin: 'Latin', meaning: 'Divine', popularity: 'high' },
        { name: 'Elena', gender: 'female', origin: 'Greek', meaning: 'Bright, shining light', popularity: 'high' },
        { name: 'Erica', gender: 'female', origin: 'Norse', meaning: 'Eternal ruler', popularity: 'medium' },
        { name: 'Francesca', gender: 'female', origin: 'Italian', meaning: 'Free', popularity: 'medium' },
        { name: 'Gloria', gender: 'female', origin: 'Latin', meaning: 'Glory', popularity: 'medium' },
        { name: 'Heather', gender: 'female', origin: 'English', meaning: 'Heather plant', popularity: 'medium' },
        { name: 'Irene', gender: 'female', origin: 'Greek', meaning: 'Peace', popularity: 'medium' },
        { name: 'Jacqueline', gender: 'female', origin: 'French', meaning: 'Supplanter', popularity: 'medium' },
        { name: 'Katherine', gender: 'female', origin: 'Greek', meaning: 'Pure', popularity: 'high' },
        { name: 'Kimberly', gender: 'female', origin: 'English', meaning: 'Royal meadow', popularity: 'high' },
        { name: 'Lauren', gender: 'female', origin: 'Latin', meaning: 'Laurel tree', popularity: 'high' },
        { name: 'Lorraine', gender: 'female', origin: 'French', meaning: 'From Lorraine', popularity: 'medium' },
        { name: 'Margaret', gender: 'female', origin: 'Greek', meaning: 'Pearl', popularity: 'high' },
        { name: 'Marilyn', gender: 'female', origin: 'English', meaning: 'Bitter', popularity: 'medium' },
        { name: 'Melissa', gender: 'female', origin: 'Greek', meaning: 'Bee', popularity: 'high' },
        { name: 'Monica', gender: 'female', origin: 'Latin', meaning: 'Advisor', popularity: 'medium' },
        { name: 'Natalia', gender: 'female', origin: 'Latin', meaning: 'Christmas Day', popularity: 'medium' },
        { name: 'Pamela', gender: 'female', origin: 'Greek', meaning: 'All honey', popularity: 'medium' },
        { name: 'Patricia', gender: 'female', origin: 'Latin', meaning: 'Noble', popularity: 'high' },
        { name: 'Samantha', gender: 'female', origin: 'Hebrew', meaning: 'Listener', popularity: 'high' },
        { name: 'Sandra', gender: 'female', origin: 'Greek', meaning: 'Defender of mankind', popularity: 'medium' },
        { name: 'Stephanie', gender: 'female', origin: 'Greek', meaning: 'Crown', popularity: 'high' },
        { name: 'Suzanne', gender: 'female', origin: 'Hebrew', meaning: 'Lily', popularity: 'medium' },
        { name: 'Theresa', gender: 'female', origin: 'Greek', meaning: 'Harvester', popularity: 'medium' },
        { name: 'Valerie', gender: 'female', origin: 'Latin', meaning: 'Strength, health', popularity: 'medium' },
        { name: 'Veronica', gender: 'female', origin: 'Greek', meaning: 'Bringing victory', popularity: 'medium' },
        { name: 'Wendy', gender: 'female', origin: 'English', meaning: 'Friend', popularity: 'medium' },
        { name: 'Yvonne', gender: 'female', origin: 'French', meaning: 'Yew wood', popularity: 'medium' },
        { name: 'Adelaide', gender: 'female', origin: 'German', meaning: 'Noble', popularity: 'medium' },
        { name: 'Alexandria', gender: 'female', origin: 'Greek', meaning: 'Defender of mankind', popularity: 'medium' },
        { name: 'Anastasia', gender: 'female', origin: 'Greek', meaning: 'Resurrection', popularity: 'medium' },
        { name: 'Angelina', gender: 'female', origin: 'Greek', meaning: 'Angel', popularity: 'medium' },
        { name: 'Antonia', gender: 'female', origin: 'Latin', meaning: 'Priceless', popularity: 'medium' },
        { name: 'Arabella', gender: 'female', origin: 'Latin', meaning: 'Beautiful', popularity: 'medium' },
        { name: 'Barbara', gender: 'female', origin: 'Greek', meaning: 'Stranger', popularity: 'medium' },
        { name: 'Bianca', gender: 'female', origin: 'Italian', meaning: 'White', popularity: 'medium' },
        { name: 'Brigitte', gender: 'female', origin: 'Celtic', meaning: 'Strength', popularity: 'medium' },
        { name: 'Carolina', gender: 'female', origin: 'Latin', meaning: 'Free man', popularity: 'medium' },
        { name: 'Cecilia', gender: 'female', origin: 'Latin', meaning: 'Blind', popularity: 'medium' },
        { name: 'Clarissa', gender: 'female', origin: 'Latin', meaning: 'Clear', popularity: 'medium' },
        { name: 'Clementine', gender: 'female', origin: 'Latin', meaning: 'Merciful', popularity: 'medium' },
        { name: 'Colette', gender: 'female', origin: 'French', meaning: 'Victory of the people', popularity: 'medium' },
        { name: 'Cordelia', gender: 'female', origin: 'Latin', meaning: 'Heart', popularity: 'medium' },
        { name: 'Daphne', gender: 'female', origin: 'Greek', meaning: 'Laurel tree', popularity: 'medium' },
        { name: 'Delilah', gender: 'female', origin: 'Hebrew', meaning: 'Delicate', popularity: 'medium' },
        { name: 'Desiree', gender: 'female', origin: 'French', meaning: 'Desired', popularity: 'medium' },
        { name: 'Dominique', gender: 'female', origin: 'Latin', meaning: 'Lord', popularity: 'medium' },
        { name: 'Eden', gender: 'female', origin: 'Hebrew', meaning: 'Delight', popularity: 'medium' },
        { name: 'Eloise', gender: 'female', origin: 'French', meaning: 'Healthy', popularity: 'medium' },
        { name: 'Emmeline', gender: 'female', origin: 'German', meaning: 'Work', popularity: 'medium' },
        { name: 'Esmeralda', gender: 'female', origin: 'Spanish', meaning: 'Emerald', popularity: 'medium' },
        { name: 'Esther', gender: 'female', origin: 'Persian', meaning: 'Star', popularity: 'medium' },
        { name: 'Evangeline', gender: 'female', origin: 'Greek', meaning: 'Bringer of good news', popularity: 'medium' },
        { name: 'Felicity', gender: 'female', origin: 'Latin', meaning: 'Good fortune', popularity: 'medium' },
        { name: 'Fiona', gender: 'female', origin: 'Gaelic', meaning: 'White, fair', popularity: 'medium' },
        { name: 'Frederica', gender: 'female', origin: 'German', meaning: 'Peaceful ruler', popularity: 'medium' },
        { name: 'Genevieve', gender: 'female', origin: 'French', meaning: 'Woman of the people', popularity: 'medium' },
        { name: 'Giselle', gender: 'female', origin: 'German', meaning: 'Pledge', popularity: 'medium' },
        { name: 'Guadalupe', gender: 'female', origin: 'Spanish', meaning: 'River of black stones', popularity: 'medium' },
        { name: 'Harriet', gender: 'female', origin: 'English', meaning: 'Estate ruler', popularity: 'medium' },
        { name: 'Henrietta', gender: 'female', origin: 'German', meaning: 'Estate ruler', popularity: 'medium' },
        { name: 'Imogen', gender: 'female', origin: 'Celtic', meaning: 'Maiden', popularity: 'medium' },
        { name: 'Isadora', gender: 'female', origin: 'Greek', meaning: 'Gift of Isis', popularity: 'medium' },
        { name: 'Josephine', gender: 'female', origin: 'Hebrew', meaning: 'God will add', popularity: 'medium' },
        { name: 'Juliana', gender: 'female', origin: 'Latin', meaning: 'Youthful', popularity: 'medium' },
        { name: 'Juliette', gender: 'female', origin: 'Latin', meaning: 'Youthful', popularity: 'medium' },
        { name: 'Katarina', gender: 'female', origin: 'Greek', meaning: 'Pure', popularity: 'medium' },
        { name: 'Lavinia', gender: 'female', origin: 'Latin', meaning: 'Purity', popularity: 'medium' },
        { name: 'Leonora', gender: 'female', origin: 'Italian', meaning: 'Light', popularity: 'medium' },
        { name: 'Lilith', gender: 'female', origin: 'Hebrew', meaning: 'Night monster', popularity: 'medium' },
        { name: 'Lorelei', gender: 'female', origin: 'German', meaning: 'Alluring', popularity: 'medium' },
        { name: 'Mallory', gender: 'female', origin: 'French', meaning: 'Unlucky', popularity: 'medium' },
        { name: 'Marcella', gender: 'female', origin: 'Latin', meaning: 'Warlike', popularity: 'medium' },
        { name: 'Marguerite', gender: 'female', origin: 'French', meaning: 'Pearl', popularity: 'medium' },
        { name: 'Mariam', gender: 'female', origin: 'Hebrew', meaning: 'Bitter', popularity: 'medium' },
        { name: 'Marina', gender: 'female', origin: 'Latin', meaning: 'From the sea', popularity: 'medium' },
        { name: 'Marisol', gender: 'female', origin: 'Spanish', meaning: 'Mary and Sol', popularity: 'medium' },
        { name: 'Maxine', gender: 'female', origin: 'Latin', meaning: 'Greatest', popularity: 'medium' },
        { name: 'Meredith', gender: 'female', origin: 'Welsh', meaning: 'Great ruler', popularity: 'medium' },
        { name: 'Miriam', gender: 'female', origin: 'Hebrew', meaning: 'Bitter', popularity: 'medium' },
        { name: 'Morgana', gender: 'female', origin: 'Welsh', meaning: 'Sea circle', popularity: 'medium' },
        { name: 'Nadia', gender: 'female', origin: 'Russian', meaning: 'Hope', popularity: 'medium' },
        { name: 'Natasha', gender: 'female', origin: 'Russian', meaning: 'Birthday', popularity: 'medium' },
        { name: 'Nicolle', gender: 'female', origin: 'Greek', meaning: 'Victory of the people', popularity: 'medium' },
        { name: 'Ophelia', gender: 'female', origin: 'Greek', meaning: 'Help', popularity: 'medium' },
        { name: 'Persephone', gender: 'female', origin: 'Greek', meaning: 'Bringer of destruction', popularity: 'medium' },
        { name: 'Philippa', gender: 'female', origin: 'Greek', meaning: 'Lover of horses', popularity: 'medium' },
        { name: 'Phoebe', gender: 'female', origin: 'Greek', meaning: 'Bright', popularity: 'medium' },
        { name: 'Rosalind', gender: 'female', origin: 'Latin', meaning: 'Beautiful rose', popularity: 'medium' },
        { name: 'Rowena', gender: 'female', origin: 'Welsh', meaning: 'White spear', popularity: 'medium' },
        { name: 'Sabrina', gender: 'female', origin: 'Welsh', meaning: 'From the boundary', popularity: 'medium' },
        { name: 'Seraphina', gender: 'female', origin: 'Hebrew', meaning: 'Burning ones', popularity: 'medium' },
        { name: 'Tabitha', gender: 'female', origin: 'Aramaic', meaning: 'Gazelle', popularity: 'medium' },
        { name: 'Tatiana', gender: 'female', origin: 'Russian', meaning: 'Fairy queen', popularity: 'medium' },
        { name: 'Theodora', gender: 'female', origin: 'Greek', meaning: 'Gift of God', popularity: 'medium' },
        { name: 'Valentina', gender: 'female', origin: 'Latin', meaning: 'Strength, health', popularity: 'medium' },
        { name: 'Wilhelmina', gender: 'female', origin: 'German', meaning: 'Resolute protector', popularity: 'medium' },
        { name: 'Xenia', gender: 'female', origin: 'Greek', meaning: 'Hospitality', popularity: 'medium' },
        { name: 'Yvette', gender: 'female', origin: 'French', meaning: 'Yew wood', popularity: 'medium' },
        { name: 'Zelda', gender: 'female', origin: 'German', meaning: 'Woman warrior', popularity: 'medium' },
        { name: 'Zola', gender: 'female', origin: 'Italian', meaning: 'Earth', popularity: 'medium' },
        { name: 'Zora', gender: 'female', origin: 'Slavic', meaning: 'Dawn', popularity: 'medium' },
        { name: 'Zuzana', gender: 'female', origin: 'Czech', meaning: 'Lily', popularity: 'medium' },
        { name: 'Yara', gender: 'female', origin: 'Arabic', meaning: 'Small butterfly', popularity: 'medium' },
        { name: 'Aisha', gender: 'female', origin: 'Arabic', meaning: 'Living', popularity: 'medium' },
        { name: 'Fatima', gender: 'female', origin: 'Arabic', meaning: 'Abstain', popularity: 'medium' },
        { name: 'Khadija', gender: 'female', origin: 'Arabic', meaning: 'Premature child', popularity: 'medium' },
        { name: 'Zainab', gender: 'female', origin: 'Arabic', meaning: 'Desert flower', popularity: 'medium' },
        { name: 'Amina', gender: 'female', origin: 'Arabic', meaning: 'Trustworthy', popularity: 'medium' },
        { name: 'Safiya', gender: 'female', origin: 'Arabic', meaning: 'Pure', popularity: 'medium' },
        { name: 'Hajar', gender: 'female', origin: 'Arabic', meaning: 'To emigrate', popularity: 'medium' },
        { name: 'Sumayya', gender: 'female', origin: 'Arabic', meaning: 'High', popularity: 'medium' },
        { name: 'Ruqayyah', gender: 'female', origin: 'Arabic', meaning: 'Rise', popularity: 'medium' },
        { name: 'Zahra', gender: 'female', origin: 'Arabic', meaning: 'Flower', popularity: 'medium' },
        { name: 'Halima', gender: 'female', origin: 'Arabic', meaning: 'Gentle', popularity: 'medium' },
        { name: 'Hana', gender: 'female', origin: 'Arabic', meaning: 'Happiness', popularity: 'medium' },
        { name: 'Iman', gender: 'female', origin: 'Arabic', meaning: 'Faith', popularity: 'medium' },
        { name: 'Jamila', gender: 'female', origin: 'Arabic', meaning: 'Beautiful', popularity: 'medium' },
        { name: 'Karima', gender: 'female', origin: 'Arabic', meaning: 'Generous', popularity: 'medium' },
        { name: 'Latifa', gender: 'female', origin: 'Arabic', meaning: 'Gentle', popularity: 'medium' },
        { name: 'Mona', gender: 'female', origin: 'Arabic', meaning: 'Desires', popularity: 'medium' },
        { name: 'Rania', gender: 'female', origin: 'Arabic', meaning: 'Queen', popularity: 'medium' },
        { name: 'Samira', gender: 'female', origin: 'Arabic', meaning: 'Companion in evening talk', popularity: 'medium' },
        { name: 'Salma', gender: 'female', origin: 'Arabic', meaning: 'Peaceful', popularity: 'medium' },
        { name: 'Warda', gender: 'female', origin: 'Arabic', meaning: 'Rose', popularity: 'medium' },
        { name: 'Yasmin', gender: 'female', origin: 'Arabic', meaning: 'Jasmine flower', popularity: 'medium' },
        { name: 'Aisha', gender: 'female', origin: 'Arabic', meaning: 'Living', popularity: 'medium' },
        { name: 'Fatima', gender: 'female', origin: 'Arabic', meaning: 'Abstain', popularity: 'medium' },
        { name: 'Khadija', gender: 'female', origin: 'Arabic', meaning: 'Premature child', popularity: 'medium' },
        { name: 'Zainab', gender: 'female', origin: 'Arabic', meaning: 'Desert flower', popularity: 'medium' },
        { name: 'Amina', gender: 'female', origin: 'Arabic', meaning: 'Trustworthy', popularity: 'medium' },
        { name: 'Safiya', gender: 'female', origin: 'Arabic', meaning: 'Pure', popularity: 'medium' },
        { name: 'Hajar', gender: 'female', origin: 'Arabic', meaning: 'To emigrate', popularity: 'medium' },
        { name: 'Sumayya', gender: 'female', origin: 'Arabic', meaning: 'High', popularity: 'medium' },
        { name: 'Ruqayyah', gender: 'female', origin: 'Arabic', meaning: 'Rise', popularity: 'medium' },
        { name: 'Zahra', gender: 'female', origin: 'Arabic', meaning: 'Flower', popularity: 'medium' },
        { name: 'Halima', gender: 'female', origin: 'Arabic', meaning: 'Gentle', popularity: 'medium' },
        { name: 'Hana', gender: 'female', origin: 'Arabic', meaning: 'Happiness', popularity: 'medium' },
        { name: 'Iman', gender: 'female', origin: 'Arabic', meaning: 'Faith', popularity: 'medium' },
        { name: 'Jamila', gender: 'female', origin: 'Arabic', meaning: 'Beautiful', popularity: 'medium' },
        { name: 'Karima', gender: 'female', origin: 'Arabic', meaning: 'Generous', popularity: 'medium' },
        { name: 'Latifa', gender: 'female', origin: 'Arabic', meaning: 'Gentle', popularity: 'medium' },
        { name: 'Mona', gender: 'female', origin: 'Arabic', meaning: 'Desires', popularity: 'medium' },
        { name: 'Rania', gender: 'female', origin: 'Arabic', meaning: 'Queen', popularity: 'medium' },
        { name: 'Samira', gender: 'female', origin: 'Arabic', meaning: 'Companion in evening talk', popularity: 'medium' },
        { name: 'Salma', gender: 'female', origin: 'Arabic', meaning: 'Peaceful', popularity: 'medium' },
        { name: 'Warda', gender: 'female', origin: 'Arabic', meaning: 'Rose', popularity: 'medium' },
        { name: 'Yara', gender: 'female', origin: 'Arabic', meaning: 'Small butterfly', popularity: 'medium' },
        { name: 'Layla', gender: 'female', origin: 'Arabic', meaning: 'Night', popularity: 'medium' },
        { name: 'Nadia', gender: 'female', origin: 'Arabic', meaning: 'Caller', popularity: 'medium' },
        { name: 'Mariam', gender: 'female', origin: 'Arabic', meaning: 'Bitter', popularity: 'medium' },
        { name: 'Zahra', gender: 'female', origin: 'Arabic', meaning: 'Flower', popularity: 'medium' },
        { name: 'Aisha', gender: 'female', origin: 'Arabic', meaning: 'Living', popularity: 'medium' },
        { name: 'Khadija', gender: 'female', origin: 'Arabic', meaning: 'Premature child', popularity: 'medium' },
        { name: 'Fatima', gender: 'female', origin: 'Arabic', meaning: 'Abstain', popularity: 'medium' },
        { name: 'Zainab', gender: 'female', origin: 'Arabic', meaning: 'Desert flower', popularity: 'medium' },
        { name: 'Amina', gender: 'female', origin: 'Arabic', meaning: 'Trustworthy', popularity: 'medium' },
        { name: 'Safiya', gender: 'female', origin: 'Arabic', meaning: 'Pure', popularity: 'medium' },
        { name: 'Hajar', gender: 'female', origin: 'Arabic', meaning: 'To emigrate', popularity: 'medium' },
        { name: 'Sumayya', gender: 'female', origin: 'Arabic', meaning: 'High', popularity: 'medium' },
        { name: 'Ruqayyah', gender: 'female', origin: 'Arabic', meaning: 'Rise', popularity: 'medium' },
        { name: 'Halima', gender: 'female', origin: 'Arabic', meaning: 'Gentle', popularity: 'medium' },
        { name: 'Hana', gender: 'female', origin: 'Arabic', meaning: 'Happiness', popularity: 'medium' },
        { name: 'Iman', gender: 'female', origin: 'Arabic', meaning: 'Faith', popularity: 'medium' },
        { name: 'Jamila', gender: 'female', origin: 'Arabic', meaning: 'Beautiful', popularity: 'medium' },
        { name: 'Karima', gender: 'female', origin: 'Arabic', meaning: 'Generous', popularity: 'medium' },
        { name: 'Latifa', gender: 'female', origin: 'Arabic', meaning: 'Gentle', popularity: 'medium' },
        { name: 'Mona', gender: 'female', origin: 'Arabic', meaning: 'Desires', popularity: 'medium' },
        { name: 'Rania', gender: 'female', origin: 'Arabic', meaning: 'Queen', popularity: 'medium' },
        { name: 'Samira', gender: 'female', origin: 'Arabic', meaning: 'Companion in evening talk', popularity: 'medium' },
        { name: 'Salma', gender: 'female', origin: 'Arabic', meaning: 'Peaceful', popularity: 'medium' },
        { name: 'Warda', gender: 'female', origin: 'Arabic', meaning: 'Rose', popularity: 'medium' },
        { name: 'Yasmin', gender: 'female', origin: 'Arabic', meaning: 'Jasmine flower', popularity: 'medium' },
        { name: 'Zara', gender: 'female', origin: 'Arabic', meaning: 'Princess', popularity: 'medium' },
        { name: 'Amira', gender: 'female', origin: 'Arabic', meaning: 'Princess', popularity: 'medium' },
        { name: 'Lina', gender: 'female', origin: 'Arabic', meaning: 'Tender', popularity: 'medium' },
        { name: 'Dina', gender: 'female', origin: 'Arabic', meaning: 'Judgment', popularity: 'medium' },
        { name: 'Sana', gender: 'female', origin: 'Arabic', meaning: 'Radiance', popularity: 'medium' },
        { name: 'Rashida', gender: 'female', origin: 'Arabic', meaning: 'Righteous', popularity: 'medium' },
        { name: 'Aziza', gender: 'female', origin: 'Arabic', meaning: 'Powerful', popularity: 'medium' },
        { name: 'Bushra', gender: 'female', origin: 'Arabic', meaning: 'Good news', popularity: 'medium' },
        { name: 'Farah', gender: 'female', origin: 'Arabic', meaning: 'Joy', popularity: 'medium' },
        { name: 'Huda', gender: 'female', origin: 'Arabic', meaning: 'Guidance', popularity: 'medium' },
        { name: 'Ibtisam', gender: 'female', origin: 'Arabic', meaning: 'Smile', popularity: 'medium' },
        { name: 'Jannah', gender: 'female', origin: 'Arabic', meaning: 'Garden', popularity: 'medium' },
        { name: 'Khawla', gender: 'female', origin: 'Arabic', meaning: 'Gazelle', popularity: 'medium' },
        { name: 'Lubna', gender: 'female', origin: 'Arabic', meaning: 'Tree', popularity: 'medium' },
        { name: 'Nawar', gender: 'female', origin: 'Arabic', meaning: 'Flower', popularity: 'medium' },
        { name: 'Qamar', gender: 'female', origin: 'Arabic', meaning: 'Moon', popularity: 'medium' },
        { name: 'Shams', gender: 'female', origin: 'Arabic', meaning: 'Sun', popularity: 'medium' },
        { name: 'Tasnim', gender: 'female', origin: 'Arabic', meaning: 'Spring', popularity: 'medium' },
        { name: 'Yusra', gender: 'female', origin: 'Arabic', meaning: 'Wealth', popularity: 'medium' },
        { name: 'Zeenat', gender: 'female', origin: 'Arabic', meaning: 'Beauty', popularity: 'medium' },
        { name: 'Abeer', gender: 'female', origin: 'Arabic', meaning: 'Fragrance', popularity: 'medium' },
        { name: 'Dua', gender: 'female', origin: 'Arabic', meaning: 'Prayer', popularity: 'medium' },
        { name: 'Eman', gender: 'female', origin: 'Arabic', meaning: 'Faith', popularity: 'medium' },
        { name: 'Firdaws', gender: 'female', origin: 'Arabic', meaning: 'Paradise', popularity: 'medium' },
        { name: 'Ghada', gender: 'female', origin: 'Arabic', meaning: 'Graceful', popularity: 'medium' },
        { name: 'Hind', gender: 'female', origin: 'Arabic', meaning: 'India', popularity: 'medium' },
        { name: 'Ihsan', gender: 'female', origin: 'Arabic', meaning: 'Excellence', popularity: 'medium' },
        { name: 'Jumana', gender: 'female', origin: 'Arabic', meaning: 'Pearl', popularity: 'medium' },
        { name: 'Kayan', gender: 'female', origin: 'Arabic', meaning: 'Entity', popularity: 'medium' },
        { name: 'Lulu', gender: 'female', origin: 'Arabic', meaning: 'Pearl', popularity: 'medium' },
        { name: 'Maha', gender: 'female', origin: 'Arabic', meaning: 'Wild cow', popularity: 'medium' },
        { name: 'Nadia', gender: 'female', origin: 'Arabic', meaning: 'Caller', popularity: 'medium' },
        { name: 'Ola', gender: 'female', origin: 'Arabic', meaning: 'Surmount', popularity: 'medium' },
        { name: 'Rania', gender: 'female', origin: 'Arabic', meaning: 'Queen', popularity: 'medium' },
        { name: 'Sawsan', gender: 'female', origin: 'Arabic', meaning: 'Lily', popularity: 'medium' },
        { name: 'Tahani', gender: 'female', origin: 'Arabic', meaning: 'Congratulations', popularity: 'medium' },
        { name: 'Umm', gender: 'female', origin: 'Arabic', meaning: 'Mother', popularity: 'medium' },
        { name: 'Varda', gender: 'female', origin: 'Arabic', meaning: 'Rose', popularity: 'medium' },
        { name: 'Wijdan', gender: 'female', origin: 'Arabic', meaning: 'Passion', popularity: 'medium' },
        { name: 'Yamama', gender: 'female', origin: 'Arabic', meaning: 'Dove', popularity: 'medium' },
        { name: 'Zahra', gender: 'female', origin: 'Arabic', meaning: 'Flower', popularity: 'medium' }
    ];
    
    const allNames = offlineNames.length ? offlineNames : (Array.isArray(window.localBabyNames) ? window.localBabyNames : []);
    const queryLower = String(query || '').trim().toLowerCase();
    if (!queryLower) {
        return allNames;
    }

    const matches = allNames.filter(name => 
        name.name.toLowerCase().includes(queryLower) ||
        name.meaning.toLowerCase().includes(queryLower) ||
        name.origin.toLowerCase().includes(queryLower)
    );

    if (matches.length) {
        return matches;
    }

    const sameInitial = allNames.filter(name => name.name.toLowerCase().startsWith(queryLower[0])).slice(0, 12);
    return sameInitial.length ? sameInitial : allNames.slice(0, 12);
}

// Display names in list with modern CSS
function displayNames(names) {
    const namesList = document.getElementById('namesList');
    if (!namesList) return;
    
    if (names.length === 0) {
        namesList.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div>No names found. Try a different search.</div>';
        return;
    }
    
    const namesHTML = names.map(name => `
        <div class="name-card-ai" data-name="${name.name}" data-gender="${name.gender || 'unknown'}">
            <div class="name-card-compact">
                <div class="name-compact-header">
                    <h3 class="name-compact-title">${name.name}</h3>
                    <div class="name-compact-badges">
                        <span class="badge badge-gender ${name.gender || 'unknown'}">${name.gender || 'Unknown'}</span>
                        <span class="expand-icon">▼</span>
                    </div>
                </div>
                <div class="name-card-details">
                    <div class="name-card-header">
                        <div class="name-card-title-group">
                            <h3 class="name-card-title">${name.name}</h3>
                            <span class="name-card-pronunciation">${name.pronunciation || name.name}</span>
                        </div>
                        <div class="name-card-badges">
                            <span class="badge badge-gender ${name.gender || 'unknown'}">${name.gender || 'Unknown'}</span>
                            <span class="badge badge-popularity ${name.popularity || 'medium'}">${name.popularity || 'Medium'}</span>
                        </div>
                    </div>
                    <div class="name-card-body">
                        <div class="name-card-meaning">
                            <strong>Meaning</strong>
                            <p>${name.meaning || 'Unknown meaning'}</p>
                        </div>
                        <div class="name-card-origin">
                            <strong>Origin</strong>
                            <p>${name.origin || 'Unknown origin'}</p>
                        </div>
                        <div class="name-card-lucky">
                            <strong>Lucky Details</strong>
                            <p>Lucky Number: ${name.luckyNumber || Math.floor(Math.random() * 9) + 1}</p>
                            <p>Lucky Color: ${name.luckyColor || ['Blue', 'Green', 'Red', 'Purple', 'Gold'][Math.floor(Math.random() * 5)]}</p>
                        </div>
                        <div class="name-card-description">
                            <strong>Description</strong>
                            <p>${name.description || `A beautiful ${name.gender} name with rich cultural heritage and meaningful significance.`}</p>
                        </div>
                        <div class="name-card-traits">
                            <strong>Personality Traits</strong>
                            <p>${name.traits || 'Creative, strong, and compassionate individual with natural leadership qualities.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    namesList.innerHTML = namesHTML;
    
    // Add click handlers for expand/collapse
    document.querySelectorAll('.name-card-ai').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.name-card-actions')) {
                this.classList.toggle('expanded');
                const expandIcon = this.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.transform = this.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });
}

// Horizontal scroll navigation function
function scrollNames(direction) {
    const namesList = document.getElementById('namesList');
    if (!namesList) return;
    
    const scrollAmount = 450; // Width of one card plus gap
    
    if (direction === 'left') {
        namesList.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else if (direction === 'right') {
        namesList.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Display AI-enhanced names with compact view (names only, expand on click)
function displayAINames(names, searchQuery = '') {
    const namesList = document.getElementById('namesList');
    if (!namesList) return;
    
    if (names.length === 0) {
        namesList.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div>No names found. Try a different search.</div>';
        return;
    }
    
    // Check if first name is an exact match
    const isExactMatch = searchQuery && names.length > 0 && 
        names[0].name.toLowerCase() === searchQuery.toLowerCase();
    
    let namesHTML = '';
    
        
    // Add similar names section if there are multiple names
    if (names.length > 0) {
        const allNames = isExactMatch ? names : names;
        namesHTML += `
            <div class="similar-names-section">
                <div class="similar-names-header">
                    <h3 class="similar-names-title">${isExactMatch ? 'Baby Names' : 'Baby Names'}</h3>
                    <span class="similar-names-count">real local names</span>
                </div>
                <div class="names-grid">
        `;
        
        allNames.forEach((name, index) => {
            const isExactMatchCard = isExactMatch && index === 0;
            namesHTML += `
                <div class="name-card-ai compact ${isExactMatchCard ? 'exact-match-card' : 'similar-name'}" data-name="${name.name}" data-gender="${name.gender || 'unknown'}" onclick="toggleNameDetails('${name.name}')">
                    <div class="name-card-compact">
                        <div class="name-compact-header">
                            <h3 class="name-compact-title">${name.name}</h3>
                            <div class="name-compact-badges">
                                <span class="badge badge-gender ${name.gender || 'unknown'}">${name.gender || 'Unisex'}</span>
                                ${isExactMatchCard ? '<span class="badge badge-exact">🎯 Exact</span>' : ''}
                                <span class="expand-icon">▲</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="name-card-details" id="details-${name.name}" style="display: block;">
                        <div class="name-card-header">
                            <div class="name-card-title-group">
                                <h3 class="name-card-title">${name.name}</h3>
                                <span class="name-card-pronunciation">/${name.pronunciation || name.name}/</span>
                            </div>
                            <div class="name-card-badges">
                                <span class="badge badge-gender ${name.gender || 'unknown'}">${name.gender || 'Unisex'}</span>
                                <span class="badge badge-popularity ${name.popularity?.toLowerCase() || 'medium'}">${name.popularity || 'Medium'}</span>
                            </div>
                        </div>
                        
                        <div class="name-card-body">
                            <div class="name-card-meaning">
                                <span class="label">Meaning</span>
                                <p>${name.meaning || 'Unknown meaning'}</p>
                            </div>
                            
                            <div class="name-card-origin">
                                <span class="label">Origin</span>
                                <p>${name.origin || 'Unknown origin'}</p>
                            </div>
                            
                            <div class="name-card-lucky">
                                <span class="label">Lucky Elements</span>
                                <div class="lucky-elements">
                                    <div class="lucky-number">
                                        <span class="lucky-icon">🔢</span>
                                        <span class="lucky-value">${name.luckyNumber || calculateLuckyNumber(name.name)}</span>
                                        <span class="lucky-label">Lucky Number</span>
                                    </div>
                                    <div class="lucky-color">
                                        <span class="color-preview" style="background-color: ${name.luckyColor?.hex || calculateLuckyColor(name.name).hex || '#ccc'};"></span>
                                        <span class="color-info">
                                            <span class="color-name">${name.luckyColor?.name || calculateLuckyColor(name.name).name || 'Unknown'}</span>
                                            <span class="color-meaning">${name.luckyColor?.meaning || calculateLuckyColor(name.name).meaning || ''}</span>
                                        </span>
                                        <span class="lucky-label">Lucky Color</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${name.description ? `
                            <div class="name-card-description">
                                <span class="label">About</span>
                                <p>${name.description}</p>
                            </div>
                            ` : `
                            <div class="name-card-description">
                                <span class="label">About</span>
                                <p>A beautiful ${name.gender || 'unisex'} name with rich cultural heritage and meaningful significance.</p>
                            </div>
                            `}
                            
                            ${name.personalityTraits && name.personalityTraits.length > 0 ? `
                            <div class="name-card-traits">
                                <span class="label">Personality Traits</span>
                                <div class="traits-list">
                                    ${name.personalityTraits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                                </div>
                            </div>
                            ` : `
                            <div class="name-card-traits">
                                <span class="label">Personality Traits</span>
                                <div class="traits-list">
                                    <span class="trait-tag">Creative</span>
                                    <span class="trait-tag">Strong</span>
                                    <span class="trait-tag">Compassionate</span>
                                </div>
                            </div>
                            `}
                            
                            ${name.famousPeople && name.famousPeople.length > 0 ? `
                            <div class="name-card-famous">
                                <span class="label">Famous Namesakes</span>
                                <div class="famous-list">
                                    ${name.famousPeople.map(person => `<span class="famous-tag">${person}</span>`).join('')}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="name-card-footer">
                            <div class="name-card-actions">
                                <button class="btn-primary" onclick="event.stopPropagation(); showNameDetails('${name.name}')">View Details</button>
                                <button class="btn-secondary" onclick="event.stopPropagation(); saveNameToFavorites('${name.name}')">Save to Favorites</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        namesHTML += `
                </div>
            </div>
        `;
    }
    
    namesList.innerHTML = namesHTML;
}

function displayAINames(names, searchQuery = '') {
    const namesList = document.getElementById('namesList');
    const namesTitle = document.getElementById('namesTitle');
    const status = document.getElementById('namesOnlineStatus');
    if (!namesList) return;

    const cleanNames = (Array.isArray(names) ? names : [])
        .filter(name => name && name.name)
        .map(enrichName);

    window.currentDisplayedNames = cleanNames;
    window.currentNameSearchQuery = searchQuery || '';

    if (namesTitle) {
        namesTitle.textContent = searchQuery ? `Results for "${searchQuery}"` : 'Popular names';
    }

    if (status && cleanNames.length) {
        status.textContent = `${cleanNames.length} names ready`;
    }

    if (!cleanNames.length) {
        namesList.innerHTML = `
            <div class="names-empty-state">
                <strong>No names found</strong>
                <span>Try a different spelling, meaning, or origin.</span>
            </div>
        `;
        return;
    }

    const favorites = new Set(JSON.parse(localStorage.getItem('babyNameFavorites') || '[]'));
    const cards = cleanNames.map((name) => {
        const gender = normalizeNameGender(name.gender);
        const safeName = escapeNameHtml(name.name);
        const safeMeaning = escapeNameHtml(name.meaning || 'Meaning not available');
        const safeOrigin = escapeNameHtml(name.origin || 'Origin unknown');
        const safePopularity = escapeNameHtml(name.popularity || 'Medium');
        const safeArg = toNameJsArg(name.name);
        const color = name.luckyColor?.hex || '#64748b';
        const colorName = escapeNameHtml(name.luckyColor?.name || 'Color');
        const isSaved = favorites.has(name.name);

        return `
            <article class="names-pro-card" data-name="${safeName}" data-gender="${gender}">
                <div class="names-card-topline">
                    <span class="names-initial" style="--name-accent: ${color};">${safeName.charAt(0).toUpperCase()}</span>
                    <button class="names-favorite-btn ${isSaved ? 'is-saved' : ''}" type="button" onclick="event.stopPropagation(); saveNameToFavorites('${safeArg}')">${isSaved ? 'Saved' : 'Save'}</button>
                </div>
                <h3>${safeName}</h3>
                <p class="names-card-meaning">${safeMeaning}</p>
                <div class="names-card-meta">
                    <span>${safeOrigin}</span>
                    <span>${gender}</span>
                    <span>${safePopularity}</span>
                </div>
                <div class="names-card-lucky">
                    <span>Lucky ${name.luckyNumber}</span>
                    <span><i style="background: ${color};"></i>${colorName}</span>
                </div>
                <div class="names-card-actions">
                    <button class="btn-primary" type="button" onclick="event.stopPropagation(); showNameDetails('${safeArg}')">Details</button>
                    <button class="btn-secondary" type="button" onclick="event.stopPropagation(); shareName('${safeArg}')">Share</button>
                </div>
            </article>
        `;
    }).join('');

    namesList.innerHTML = `
        <div class="similar-names-section names-pro-results">
            <div class="similar-names-header">
                <h3 class="similar-names-title">${searchQuery ? 'Best matches' : 'Curated ideas'}</h3>
                <span class="similar-names-count">${cleanNames.length} names</span>
            </div>
            <div class="names-grid">${cards}</div>
        </div>
    `;
}

function setupBabyNamesControls() {
    const namesPage = document.getElementById('names');
    if (!namesPage || namesPage.dataset.namesControlsBound === 'true') return;

    namesPage.dataset.namesControlsBound = 'true';

    document.getElementById('showAllNamesBtn')?.addEventListener('click', () => {
        setNamesViewMode('all');
        loadInitialNames();
    });

    document.getElementById('showFavoritesBtn')?.addEventListener('click', () => {
        setNamesViewMode('favorites');
        showFavoriteNames();
    });

    document.getElementById('onlineNamesToggle')?.addEventListener('change', (event) => {
        setNamesOnlineStatus(event.target.checked ? 'AI search on' : 'Local names only');
    });
}

function setNamesViewMode(mode) {
    document.getElementById('showAllNamesBtn')?.classList.toggle('is-active', mode === 'all');
    document.getElementById('showFavoritesBtn')?.classList.toggle('is-active', mode === 'favorites');
}

function showFavoriteNames() {
    const favorites = JSON.parse(localStorage.getItem('babyNameFavorites') || '[]');
    const allLocalNames = searchOfflineNames('');
    const names = favorites.map(name => {
        const fromCurrent = (window.currentDisplayedNames || []).find(item => item.name === name);
        const fromLocal = allLocalNames.find(item => item.name === name);
        return enrichName(fromCurrent || fromLocal || findNameData(name));
    });

    const title = document.getElementById('namesTitle');
    if (title) title.textContent = 'Saved names';

    const status = document.getElementById('namesOnlineStatus');
    if (status) status.textContent = `${names.length} saved names`;

    if (!names.length) {
        const namesList = document.getElementById('namesList');
        if (namesList) {
            namesList.innerHTML = `
                <div class="names-empty-state">
                    <strong>No saved names yet</strong>
                    <span>Save names from the results grid and they will appear here.</span>
                </div>
            `;
        }
        return;
    }

    displayAINames(names, '');
    if (title) title.textContent = 'Saved names';
    if (status) status.textContent = `${names.length} saved names`;
}

function sortNames(value) {
    let names = [...(window.currentDisplayedNames || [])];
    const rank = { high: 3, medium: 2, low: 1 };

    if (value === 'az') {
        names.sort((a, b) => a.name.localeCompare(b.name));
    } else if (value === 'za') {
        names.sort((a, b) => b.name.localeCompare(a.name));
    } else {
        names.sort((a, b) => (rank[String(b.popularity || '').toLowerCase()] || 0) - (rank[String(a.popularity || '').toLowerCase()] || 0));
    }

    displayAINames(names, '');
}

// Filter names by category
function filterNames(category, element) {
    // Update active state
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    element.classList.add('active');
    
    // Get current search query
    const searchInput = document.getElementById('nameSearchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    // Perform search with filter
    searchNamesWithFilter(category, query);
}

// Search names with gender/category filter
async function searchNamesWithFilter(category, query) {
    const namesList = document.getElementById('namesList');
    const onlineToggle = document.getElementById('onlineNamesToggle');
    const namesOnlineStatus = document.getElementById('namesOnlineStatus');
    
    if (!namesList) return;
    
    namesList.innerHTML = '<div class="loading"><div class="loading-spinner"></div>🤖 Searching names...</div>';
    
    try {
        let names = [];
        
        if (onlineToggle && onlineToggle.checked && hasMamasafeBackend()) {
            // Search via Groq AI
            const response = await fetch(`${getMamasafeBackendOrigin()}/api/mamasafe-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Generate baby names for: ${query}. Include meaning, origin, and gender for each name. Format as JSON array with name, gender, origin, meaning fields.`,
                    context: { requestType: 'baby-names' }
                })
            });
            
            const data = await response.json();
            
            if (data.reply) {
                try {
                    const aiResponse = data.reply;
                    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        names = JSON.parse(jsonMatch[0]);
                    } else {
                        names = parseAIBabyNamesResponse(aiResponse);
                    }
                } catch (parseError) {
                    names = parseAIBabyNamesResponse(data.reply);
                }
            }
        } else {
            // Search offline
            names = searchOfflineNames(query);
        }
        
        // Filter by category
        if (category !== 'all') {
            names = names.filter(name => {
                const gender = (name.gender || 'unknown').toLowerCase();
                switch(category) {
                    case 'boy':
                        return gender === 'male';
                    case 'girl':
                        return gender === 'female';
                    case 'unisex':
                        return gender === 'unisex';
                    case 'unique':
                        return name.popularity === 'Low' || name.popularity === 'low';
                    default:
                        return true;
                }
            });
        }
        
        // Add lucky numbers and colors
        names = names.map(name => ({
            ...name,
            luckyNumber: calculateLuckyNumber(name.name),
            luckyColor: calculateLuckyColor(name.name)
        }));
        
        // Display results
        displayAINames(names, query);
        
        if (namesOnlineStatus) {
            namesOnlineStatus.textContent = `Found ${names.length} ${category} names`;
            namesOnlineStatus.style.color = 'var(--text-gray)';
        }
        
    } catch (error) {
        console.error('Search error:', error);
        let names = searchOfflineNames(query);
        if (category !== 'all') {
            names = names.filter(name => {
                const gender = (name.gender || 'unknown').toLowerCase();
                if (category === 'boy') return gender === 'male';
                if (category === 'girl') return gender === 'female';
                if (category === 'unisex') return gender === 'unisex';
                if (category === 'unique') return String(name.popularity || '').toLowerCase() === 'low';
                return true;
            });
        }
        displayAINames(names.map(enrichName), query);
        if (namesOnlineStatus) {
            namesOnlineStatus.textContent = `Using local database (${names.length} names)`;
            namesOnlineStatus.style.color = 'var(--text-gray)';
        }
    }
}

// Toggle name details expansion
function toggleNameDetails(name) {
    const detailsElement = document.getElementById(`details-${name}`);
    const nameCard = detailsElement.parentElement;
    const expandIcon = nameCard.querySelector('.expand-icon');
    
    if (detailsElement.style.display === 'block') {
        // Collapse this card
        detailsElement.style.display = 'none';
        nameCard.classList.remove('expanded');
        expandIcon.textContent = '▼';
    } else {
        // Expand this card
        detailsElement.style.display = 'block';
        nameCard.classList.add('expanded');
        expandIcon.textContent = '▲';
    }
}

// Get gender icon
function getGenderIcon(gender) {
    const icons = {
        'male': 'boy',
        'female': 'girl', 
        'unisex': 'unisex',
        'unknown': 'question'
    };
    return icons[gender.toLowerCase()] || 'question';
}

function parseGroqNameDetails(reply) {
    const text = String(reply || '').trim();
    if (!text) return null;

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.warn('Could not parse Groq name detail JSON:', error);
    }

    return { history: text };
}

async function fetchGroqNameDetails(name, nameData = {}) {
    if (!hasMamasafeBackend()) {
        throw new Error('AI backend not configured');
    }

    const selectedName = String(nameData.name || name || '').trim();
    const selectedNameFacts = {
        selectedName,
        meaning: nameData.meaning || '',
        origin: nameData.origin || '',
        gender: nameData.gender || '',
        popularity: nameData.popularity || '',
        luckyNumber: nameData.luckyNumber || '',
        luckyColor: nameData.luckyColor?.name || '',
        searchQuery: window.currentNameSearchQuery || ''
    };

    const response = await fetch(`${getMamasafeBackendOrigin()}/api/mamasafe-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: `Create detailed baby-name information for the exact selected name "${selectedName}".
Do not switch to another spelling, nearby name, or general search topic. Use the selected card facts as grounding, and only infer extra details when the fact is missing or unknown.

Selected card facts:
${JSON.stringify(selectedNameFacts, null, 2)}

Return ONLY valid JSON with these keys:
{
  "meaning": "short polished meaning",
  "origin": "origin or cultural roots",
  "gender": "male/female/unisex",
  "history": "3-5 sentence history, cultural background, and modern usage",
  "pronunciation": "simple pronunciation if known",
  "personality": "3-5 warm personality/style impressions",
  "similarNames": ["name1", "name2", "name3"]
}`,
            context: {
                requestType: 'baby-name-detail',
                name: selectedName,
                selectedNameData: selectedNameFacts,
                knownMeaning: nameData.meaning,
                knownOrigin: nameData.origin,
                knownGender: nameData.gender
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Groq detail request failed with ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error('Groq detail request returned a non-JSON response');
    }

    const data = await response.json();
    return parseGroqNameDetails(data.reply);
}

function formatGroqNameHistory(details, fallbackHistory) {
    const parts = [];
    if (details?.history) parts.push(details.history);
    if (details?.pronunciation) parts.push(`Pronunciation: ${details.pronunciation}`);
    if (details?.personality) parts.push(`Style notes: ${details.personality}`);
    if (Array.isArray(details?.similarNames) && details.similarNames.length) {
        parts.push(`Similar names: ${details.similarNames.join(', ')}`);
    }

    return parts.join('\n\n') || fallbackHistory || 'Historical information not available for this name.';
}

// Show name details
async function showNameDetails(name) {
    const modal = document.getElementById('nameDetailModal');
    const modalNameTitle = document.getElementById('modalNameTitle');
    const modalGenderIcon = document.getElementById('modalGenderIcon');
    const modalMeaning = document.getElementById('modalMeaning');
    const modalOrigin = document.getElementById('modalOrigin');
    const modalGender = document.getElementById('modalGender');
    const modalHistory = document.getElementById('modalHistory');
    
    if (!modal) return;
    
    // Find name data
    const nameData = findNameData(name);
    const selectedName = nameData.name || String(name || '').trim() || 'Name';
    window.lastNameDetailFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    
    // Update modal content
    if (modalNameTitle) modalNameTitle.textContent = selectedName;
    if (modalGenderIcon) modalGenderIcon.textContent = getGenderIcon(nameData.gender || 'unknown');
    if (modalMeaning) modalMeaning.textContent = nameData.meaning || 'Loading...';
    if (modalOrigin) modalOrigin.textContent = nameData.origin || 'Loading...';
    if (modalGender) modalGender.textContent = (nameData.gender || 'unknown').charAt(0).toUpperCase() + (nameData.gender || 'unknown').slice(1);
    if (modalHistory) {
        modalHistory.textContent = hasMamasafeBackend()
            ? 'AI is preparing deeper name details...'
            : (nameData.history || 'Local name details are shown from the built-in database.');
    }
    
    // Show modal
    modal.classList.add('show');
    modal.classList.remove('hidden');
    modal.removeAttribute('aria-hidden');
    if ('inert' in modal) modal.inert = false;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
    requestAnimationFrame(() => {
        modal.querySelector('.modal-close-btn')?.focus({ preventScroll: true });
    });

    try {
        const aiDetails = await fetchGroqNameDetails(selectedName, nameData);
        if (!aiDetails) throw new Error('No Groq name details returned');

        const nextMeaning = aiDetails.meaning || nameData.meaning || 'Meaning not available';
        const nextOrigin = aiDetails.origin || nameData.origin || 'Origin unknown';
        const nextGender = aiDetails.gender || nameData.gender || 'unknown';

        if (modalMeaning) modalMeaning.textContent = nextMeaning;
        if (modalOrigin) modalOrigin.textContent = nextOrigin;
        if (modalGender) modalGender.textContent = String(nextGender).charAt(0).toUpperCase() + String(nextGender).slice(1);
        if (modalGenderIcon) modalGenderIcon.textContent = getGenderIcon(nextGender || 'unknown');
        if (modalHistory) modalHistory.textContent = formatGroqNameHistory(aiDetails, nameData.history);
        modal.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });

        const cachedIndex = (window.currentDisplayedNames || []).findIndex(n => n.name.toLowerCase() === String(selectedName).toLowerCase());
        if (cachedIndex >= 0) {
            window.currentDisplayedNames[cachedIndex] = {
                ...window.currentDisplayedNames[cachedIndex],
                meaning: nextMeaning,
                origin: nextOrigin,
                gender: nextGender,
                history: formatGroqNameHistory(aiDetails, nameData.history),
                pronunciation: aiDetails.pronunciation || window.currentDisplayedNames[cachedIndex].pronunciation,
                personalityTraits: aiDetails.personality ? String(aiDetails.personality).split(',').map(item => item.trim()).filter(Boolean) : window.currentDisplayedNames[cachedIndex].personalityTraits,
                similarNames: aiDetails.similarNames
            };
        }
    } catch (error) {
        console.info('Name detail backend unavailable; using local details:', error.message || error);
        if (modalHistory) {
            modalHistory.textContent = nameData.history || 'Local name details are shown from the built-in database.';
        }
    }
}

// Find name data (combine online and offline data)
function findNameData(name) {
    const current = (window.currentDisplayedNames || []).find(n => n.name.toLowerCase() === String(name).toLowerCase());
    if (current) return current;

    // First check offline names
    const offlineNames = [
        { name: 'Emma', gender: 'female', origin: 'German', meaning: 'Universal', history: 'Emma is a classic name of German origin, meaning "universal" or "whole". It has been popular in English-speaking countries since the 19th century.' },
        { name: 'Liam', gender: 'male', origin: 'Irish', meaning: 'Strong-willed warrior', history: 'Liam is an Irish name, short for William. It means "strong-willed warrior" and has become extremely popular in recent years.' },
        { name: 'Olivia', gender: 'female', origin: 'Latin', meaning: 'Olive tree', history: 'Olivia is of Latin origin, meaning "olive tree". It has been a popular name since Shakespeare used it for a character in Twelfth Night.' },
        { name: 'Noah', gender: 'male', origin: 'Hebrew', meaning: 'Rest, comfort', history: 'Noah is a Hebrew name meaning "rest" or "comfort". It has biblical significance as the builder of the ark.' },
        { name: 'Ava', gender: 'female', origin: 'Latin', meaning: 'Life', history: 'Ava is a name of Latin origin meaning "life". It has various possible origins including German and Persian.' }
    ];
    
    const found = offlineNames.find(n => n.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
    
    // Return default data if not found
    return {
        name: name,
        gender: 'unknown',
        origin: 'Unknown',
        meaning: 'Meaning not available',
        history: 'Historical information not available for this name.'
    };
}

// Save name to favorites
function saveNameToFavorites(name) {
    let favorites = JSON.parse(localStorage.getItem('babyNameFavorites') || '[]');
    
    if (!favorites.includes(name)) {
        favorites.push(name);
        localStorage.setItem('babyNameFavorites', JSON.stringify(favorites));
        displayAINames(window.currentDisplayedNames || [], window.currentNameSearchQuery || '');
        showNotification(`${name} saved to favorites! ❤️`, 'success');
    } else {
        showNotification(`${name} is already in favorites`, 'info');
    }
}

// Share name
function shareName(name) {
    if (navigator.share) {
        navigator.share({
            title: 'Baby Name Suggestion',
            text: `Check out this beautiful baby name: ${name}`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`Check out this beautiful baby name: ${name}`);
        showNotification('Name copied to clipboard! 📋', 'success');
    }
}

// Close name detail modal
function closeNameDetailModal() {
    const modal = document.getElementById('nameDetailModal');
    if (!modal) return;

    const activeElement = document.activeElement;
    if (activeElement && modal.contains(activeElement) && typeof activeElement.blur === 'function') {
        activeElement.blur();
    }

    modal.classList.remove('show');
    modal.removeAttribute('aria-hidden');
    if ('inert' in modal) modal.inert = true;
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');

    const restoreFocus = window.lastNameDetailFocus;
    window.lastNameDetailFocus = null;
    if (restoreFocus && !modal.contains(restoreFocus) && document.contains(restoreFocus) && typeof restoreFocus.focus === 'function') {
        requestAnimationFrame(() => restoreFocus.focus({ preventScroll: true }));
    }
}

function isOnlineNamesEnabled() {
    const el = getOnlineNamesToggleEl();
    return !!(el && el.checked);
}

async function fetchWikidataBabyNames(query, limit = 30) {
    const safeQuery = sanitizeNameText(query);
    if (!safeQuery) return [];

    console.log('[fetchWikidataBabyNames] Starting query:', safeQuery);

    try {
        // Use a proxy endpoint to avoid CORS issues
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
        
        const data = await searchRes.json();
        console.log('[fetchWikidataBabyNames] Response data:', data);
        
        // Process response
        const names = processWikidataResponse(data);
        
        console.log('[fetchWikidataBabyNames] Processed names:', names);
        return names;
        
    } catch (error) {
        console.error('[fetchWikidataBabyNames] Error:', error);
        return [];
    }
}

function processWikidataResponse(data) {
    if (!data || !data.search) {
        console.warn('[processWikidataResponse] Invalid response format');
        return [];
    }
    
    const names = [];
    const results = data.search.results || [];
    
    results.forEach(item => {
        if (item && item.label && item.label.value) {
            names.push({
                name: item.label.value,
                description: item.description ? item.description.value : '',
                id: item.id
            });
        }
    });
    
    return names;
}

// Pregnancy topic action handler
function runPregnancyTopicAction() {
    const topicKey = document.querySelector('.pregnancy-topic-card.active')?.dataset.topicKey;
    
    if (!topicKey) {
        showNotification('Please select a pregnancy topic first', 'warning');
        return;
    }
    
    // Navigate to appropriate tool based on topic
    const topicActions = {
        'pregnancy-week-by-week': () => {
            const weeksSection = document.getElementById('weeksSection');
            if (weeksSection) {
                weeksSection.scrollIntoView({ behavior: 'smooth' });
            }
        },
        'first-trimester': () => navigateTo('pregnancy'),
        'second-trimester': () => navigateTo('pregnancy'),
        'third-trimester': () => navigateTo('pregnancy'),
        'your-body': () => navigateTo('pregnancy'),
        'symptoms': () => navigateTo('pregnancy'),
        'labor-delivery': () => navigateTo('pregnancy'),
        'early-signs': () => navigateTo('pregnancy'),
        'sleep': () => navigateTo('pregnancy'),
        'your-baby': () => navigateTo('pregnancy'),
        'twins-more': () => navigateTo('pregnancy'),
        'fetal-health': () => navigateTo('pregnancy'),
        'cord-blood': () => navigateTo('pregnancy'),
        'fitness': () => navigateTo('pregnancy'),
        'pregnancy-nutrients': () => navigateTo('pregnancy'),
        'healthy-eating': () => navigateTo('pregnancy'),
        'best-foods': () => navigateTo('pregnancy'),
        'pregnancy-diet': () => navigateTo('pregnancy')
    };
    
    const action = topicActions[topicKey];
    if (action) {
        action();
    } else {
        showNotification('Topic guide coming soon!', 'info');
    }
}

// Open pregnancy topic panel
function openPregnancyTopic(topicKey) {
    // Remove active class from all topic cards
    document.querySelectorAll('.pregnancy-topic-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected topic card
    const selectedCard = document.querySelector(`[data-topic-key="${topicKey}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Get current pregnancy week if available
    const currentWeekElement = document.getElementById('currentWeek');
    let currentWeek = null;
    if (currentWeekElement && currentWeekElement.textContent) {
        const weekText = currentWeekElement.textContent;
        const weekMatch = weekText.match(/Week (\d+)/);
        if (weekMatch) {
            currentWeek = parseInt(weekMatch[1]);
        }
    }
    
    // Update topic panel content
    const topicPanel = document.getElementById('pregnancyTopicPanel');
    const topicLabel = document.getElementById('pregnancyTopicLabel');
    const topicTitle = document.getElementById('pregnancyTopicTitle');
    const topicSummary = document.getElementById('pregnancyTopicSummary');
    const topicActionRow = document.getElementById('pregnancyTopicActionRow');
    const topicActionButton = document.getElementById('pregnancyTopicActionButton');
    const topicActionNote = document.getElementById('pregnancyTopicActionNote');
    
    // Topic content data
    const topicData = {
        'pregnancy-week-by-week': {
            label: 'Overview',
            title: 'Pregnancy Week by Week',
            summary: 'Interactive week-by-week journey with 3D baby development visualization, AI-powered symptom tracking, and personalized care recommendations.',
            actionNote: 'Experience your pregnancy with real-time milestone tracking and expert guidance tailored to your progress.',
            forMom: 'Advanced tracking system with symptom monitoring, weight management, and personalized health insights for your pregnancy journey.',
            forBaby: 'Explore detailed 3D development models, milestone tracking, and expert guidance for optimal baby growth and health.',
            checklist: [
                'Track pregnancy week with interactive timeline',
                'Monitor baby movements with kick counter',
                'Schedule prenatal appointments with reminders',
                'Take prenatal vitamins with daily tracker',
                'Log symptoms and mood changes',
                'Track weight gain and belly growth',
                'Practice breathing exercises daily',
                'Connect with baby through bonding activities'
            ],
            questions: [
                'What are the key developmental milestones for my current week?',
                'How can I track my baby\'s growth and movement patterns?',
                'What symptoms and body changes should I expect this week?',
                'When should I contact my healthcare provider?',
                'What exercises are safe for my current trimester?',
                'How can I bond with my baby during this specific week?',
                'What nutritional needs change during this stage?'
            ],
            alerts: [
                'Severe or persistent abdominal pain',
                'Heavy vaginal bleeding or clotting',
                'Severe headache that doesn\'t respond to rest',
                'Sudden decrease in baby movement',
                'Fever over 100.4°F (38°C)',
                'Vision changes or severe facial swelling',
                'Signs of preterm labor before 37 weeks'
            ],
            interactiveFeatures: [
                '3D Baby Development Visualization',
                'Interactive Growth Timeline',
                'AI-Powered Symptom Tracker',
                'Personalized Care Recommendations',
                'Kick Counter Integration',
                'Weight and Belly Growth Tracker',
                'Mood and Energy Monitoring'
            ]
        },
        'first-trimester': {
            label: 'First Trimester',
            title: 'First Trimester of Pregnancy',
            summary: 'Weeks 1–13: Advanced early pregnancy care with AI-powered symptom tracking, personalized nutrition guidance, and comprehensive prenatal testing planning.',
            actionNote: 'Experience your first trimester with intelligent symptom management and expert guidance for optimal early development.',
            forMom: 'Comprehensive support system with morning sickness management, fatigue tracking, hormonal change monitoring, and personalized care recommendations.',
            forBaby: 'Critical development phase with neural tube formation, organ development, and expert guidance for healthy first-trimester growth.',
            checklist: [
                'Schedule first prenatal appointment with reminder system',
                'Start prenatal vitamins with daily tracking',
                'Manage morning sickness with AI-powered tips',
                'Get adequate rest with sleep quality monitoring',
                'Stay hydrated with water intake tracking',
                'Track hormone changes and mood patterns',
                'Plan nutrition with trimester-specific meal plans',
                'Prepare for genetic counseling appointments',
                'Create safe exercise routine for early pregnancy'
            ],
            questions: [
                'What prenatal tests are recommended for my situation?',
                'How can I effectively manage morning sickness and fatigue?',
                'When is the optimal time to announce pregnancy?',
                'What specific foods and nutrients are crucial for neural tube development?',
                'How do hormonal changes affect my daily life and emotions?',
                'What exercises are safe and beneficial during first trimester?',
                'How can I prepare my body and home for pregnancy changes?'
            ],
            alerts: [
                'Severe nausea/vomiting preventing fluid intake',
                'Any vaginal bleeding or spotting',
                'Severe abdominal or pelvic pain',
                'Fever above 100.4°F (38°C)',
                'Dizziness or fainting episodes',
                'Signs of ectopic pregnancy (one-sided pain)'
            ],
            interactiveFeatures: [
                'AI-Powered Morning Sickness Manager',
                'Hormone Change Tracker',
                'Trimester-Specific Nutrition Planner',
                'Sleep Quality Monitor',
                'Exercise Safety Guide',
                'Symptom Pattern Analysis'
            ]
        },
        'second-trimester': {
            label: 'Second Trimester',
            title: 'Second Trimester of Pregnancy',
            summary: 'Weeks 14–27: Energy boost, anatomy scan, and feeling baby move.',
            actionNote: 'Enjoy your energy! Plan anatomy scan and monitor movements.',
            forMom: 'Increased energy and reduced nausea, focus on healthy weight gain.',
            forBaby: 'Rapid growth and development of senses and movement.',
            checklist: [
                'Schedule anatomy scan',
                'Monitor baby movements',
                'Continue healthy eating',
                'Exercise regularly',
                'Track weight gain'
            ],
            questions: [
                'When will I feel baby move?',
                'What does the anatomy scan check for?',
                'How much weight should I gain?',
                'What exercises are safe?'
            ],
            alerts: [
                'Decreased baby movement',
                'Severe headaches',
                'Vision changes',
                'Swelling in hands/face'
            ],
            interactiveFeatures: [
                'Baby Movement Tracker',
                'Anatomy Scan Planner',
                'Energy Level Monitor',
                'Weight Gain Tracker',
                'Exercise Safety Guide'
            ]
        },
        'third-trimester': {
            label: 'Third Trimester',
            title: 'Third Trimester of Pregnancy',
            summary: 'Weeks 28–42: Final preparations, birth planning, and getting ready.',
            actionNote: 'Prepare for birth! Focus on kick counting and hospital planning.',
            forMom: 'Physical discomfort and nesting instincts as birth approaches.',
            forBaby: 'Final weight gain and lung development for birth readiness.',
            checklist: [
                'Pack hospital bag with essentials',
                'Practice breathing exercises daily',
                'Monitor kick counts with tracker',
                'Arrange childcare for older children',
                'Install car seat properly',
                'Create birth plan with preferences',
                'Tour hospital facility',
                'Prepare postpartum recovery area'
            ],
            questions: [
                'When should I go to hospital?',
                'What are the signs of true labor?',
                'How do I time contractions effectively?',
                'What emergency items should I pack?',
                'Who should be my birth support team?',
                'What pain management options are available?',
                'How do I prepare for breastfeeding?'
            ],
            alerts: [
                'Regular contractions less than 5 minutes apart',
                'Water breaking or fluid leakage',
                'Sudden decrease in baby movement',
                'Severe back pain that doesn\'t go away',
                'Fever above 100.4°F (38°C)',
                'Vision changes or severe headache',
                'Vaginal bleeding'
            ],
            interactiveFeatures: [
                'Contraction Timer',
                'Kick Counter',
                'Hospital Bag Checklist',
                'Birth Plan Builder',
                'Pain Management Guide',
                'Breastfeeding Preparation'
            ]
        },
        'your-body': {
            label: 'Your Body',
            title: 'Your Body During Pregnancy',
            summary: 'Advanced body tracking system with AI-powered symptom analysis, personalized comfort recommendations, and comprehensive self-care guidance.',
            actionNote: 'Experience intelligent body monitoring with personalized comfort solutions and expert self-care recommendations.',
            forMom: 'Comprehensive body transformation tracking with symptom analysis, comfort optimization, and personalized self-care recommendations.',
            forBaby: 'Your body changes create optimal environment for baby development with expert guidance on maternal health.',
            checklist: [
                'Track body changes with visual timeline',
                'Monitor symptoms with AI-powered analysis',
                'Practice comfort exercises daily',
                'Use personalized comfort solutions',
                'Track weight gain and belly growth',
                'Monitor sleep quality and patterns',
                'Practice self-care routines',
                'Document body changes with photos'
            ],
            questions: [
                'What body changes should I expect this week?',
                'How can I manage pregnancy discomfort effectively?',
                'What exercises are safe for my current symptoms?',
                'How do hormonal changes affect my emotions and body?',
                'What self-care practices are most beneficial?',
                'When should I be concerned about physical symptoms?',
                'How can I prepare my body for birth?',
                'What comfort measures help with specific discomforts?'
            ],
            alerts: [
                'Severe or persistent abdominal pain',
                'Unusual swelling in hands/face/feet',
                'Severe headaches that don\'t respond to rest',
                'Vision changes or spots before eyes',
                'Signs of blood clots or heavy bleeding',
                'Severe back pain with fever',
                'Sudden severe fatigue or weakness'
            ],
            interactiveFeatures: [
                'Body Change Visual Timeline',
                'AI-Powered Symptom Analysis',
                'Personalized Comfort Recommendations',
                'Weight and Belly Growth Tracker',
                'Sleep Quality Monitor',
                'Self-Care Routine Builder',
                'Body Change Photo Journal'
            ]
        },
        'symptoms': {
            label: 'Symptoms',
            title: 'Pregnancy Symptoms Guide',
            summary: 'AI-powered symptom tracking system with intelligent analysis, personalized management recommendations, and comprehensive health monitoring.',
            actionNote: 'Experience advanced symptom analysis with AI-powered insights and expert guidance for optimal pregnancy health.',
            forMom: 'Comprehensive symptom management with AI-powered analysis, personalized recommendations, and real-time health monitoring.',
            forBaby: 'Your symptoms provide valuable insights into pregnancy progression and baby development with expert guidance.',
            checklist: [
                'Track symptoms daily with AI-powered analysis',
                'Know normal vs. concerning signs with expert guidance',
                'Practice symptom management techniques',
                'Stay informed about weekly changes',
                'Communicate effectively with healthcare provider',
                'Monitor symptom patterns and trends',
                'Use personalized symptom management strategies'
            ],
            questions: [
                'Is this symptom normal for my pregnancy week?',
                'When should I call my doctor about specific symptoms?',
                'How can I effectively manage common pregnancy symptoms?',
                'What symptoms need immediate medical attention?',
                'How do I track symptoms and patterns effectively?',
                'What lifestyle changes help alleviate specific symptoms?',
                'How do different symptoms relate to pregnancy progression?'
            ],
            alerts: [
                'Severe abdominal or pelvic pain',
                'Heavy vaginal bleeding or clotting',
                'High fever above 100.4°F (38°C)',
                'Severe persistent headache',
                'Sudden vision changes or spots',
                'Signs of preterm labor before 37 weeks',
                'Decreased or absent fetal movement',
                'Severe swelling in hands/face',
                'Chest pain or difficulty breathing'
            ],
            interactiveFeatures: [
                'AI-Powered Symptom Tracker',
                'Symptom Pattern Analysis',
                'Normal vs Concerning Guide',
                'Provider Communication Log',
                'Symptom Severity Assessment',
                'Personalized Symptom Management',
                'Symptom Trend Analysis',
                'Emergency Contact Quick Access'
            ]
        },
        'pregnancy-week-body': {
            label: 'Body Changes',
            title: 'Your Pregnancy Week by Week: Body Changes',
            summary: 'Advanced weekly body transformation tracker with visual timeline, AI-powered insights, and personalized comfort recommendations.',
            actionNote: 'Experience intelligent body change tracking with expert guidance and personalized self-care solutions.',
            forMom: 'Comprehensive weekly body transformation tracking with AI-powered analysis, comfort optimization, and expert self-care recommendations.',
            forBaby: 'Your body changes create optimal environment for baby development with expert guidance on maternal health and comfort.',
            checklist: [
                'Monitor weekly body changes with visual timeline',
                'Document symptoms with AI-powered analysis',
                'Practice personalized comfort exercises daily',
                'Use intelligent comfort solutions',
                'Track weight gain and belly growth patterns',
                'Monitor sleep quality and hormonal changes',
                'Practice advanced self-care routines',
                'Document body transformation journey with photos',
                'Connect with healthcare providers regularly'
            ],
            questions: [
                'What specific body changes should I expect this week?',
                'How can I effectively manage pregnancy discomfort?',
                'What exercises are safe and beneficial for my current symptoms?',
                'How do hormonal changes affect my emotions and daily life?',
                'What self-care practices are most beneficial for my current stage?',
                'When should I be concerned about specific physical symptoms?',
                'How can I prepare my body for upcoming pregnancy stages?',
                'What comfort measures help with specific pregnancy discomforts?',
                'How do body changes relate to baby development milestones?'
            ],
            alerts: [
                'Sudden severe or worsening symptoms',
                'Unusual or alarming body changes',
                'Persistent or severe pain not relieved by rest',
                'Signs of potential complications requiring immediate care',
                'Severe swelling in hands/face/feet with headache',
                'Any bleeding or fluid loss',
                'Fever above 100.4°F (38°C) with other symptoms',
                'Signs of preterm labor or pregnancy complications'
            ],
            interactiveFeatures: [
                'Body Change Visual Timeline',
                'AI-Powered Symptom Analysis',
                'Personalized Comfort Recommendations',
                'Weight and Belly Growth Tracker',
                'Sleep Quality Monitor',
                'Self-Care Routine Builder',
                'Body Change Photo Journal',
                'Healthcare Provider Communication',
                'Symptom Pattern Recognition'
            ]
        },
        'labor-delivery': {
            label: 'Labor & Delivery',
            title: 'Labor & Delivery',
            summary: 'Comprehensive birth preparation system with AI-powered planning, pain management guidance, and postpartum readiness tracking.',
            actionNote: 'Experience intelligent birth preparation with expert guidance, personalized planning, and comprehensive support tools.',
            forMom: 'Empowers you with AI-powered birth planning, pain management options, and confident birth preparation tools.',
            forBaby: 'Ensures safe, positive, and well-prepared birth experience for your baby with expert guidance.',
            checklist: [
                'Create comprehensive birth plan with AI assistance',
                'Pack hospital bag with smart checklist',
                'Practice advanced breathing and relaxation techniques',
                'Learn detailed labor stages with visual guides',
                'Arrange reliable transportation and support systems',
                'Choose and coordinate birth support team',
                'Install and verify car seat safety',
                'Prepare complete postpartum recovery area',
                'Tour hospital facility with virtual tours',
                'Complete emergency preparation planning'
            ],
            questions: [
                'When should I go to hospital based on labor patterns?',
                'What are the detailed stages of labor and what to expect?',
                'How can I effectively manage labor pain with various techniques?',
                'What pain management options are available and safe?',
                'Who should be my ideal birth support team and their roles?',
                'What emergency procedures and protocols should I understand?',
                'How do I prepare for successful breastfeeding and postpartum recovery?',
                'What are the signs that indicate labor is progressing normally?',
                'How do I create effective communication with my healthcare team?',
                'What are my options for birth location and environment?'
            ],
            alerts: [
                'Regular contractions less than 5 minutes apart for over 1 hour',
                'Water breaking or significant fluid leakage',
                'Severe bleeding or bright red blood loss',
                'Significant decrease or absence of fetal movement',
                'Fever above 100.4°F (38°C) with other symptoms',
                'Severe persistent headache or vision changes',
                'Severe back pain with fever or chills',
                'Signs of placental abruption or cord problems',
                'Any thoughts of self-harm or severe depression'
            ],
            interactiveFeatures: [
                'AI-Powered Birth Plan Builder',
                'Advanced Contraction Timer',
                'Smart Hospital Bag Checklist',
                'Interactive Labor Stage Guide',
                'Comprehensive Pain Management Options',
                'Birth Support Team Coordinator',
                'Virtual Hospital Tour',
                'Emergency Protocol Quick Access',
                'Postpartum Preparation Tracker'
            ]
        },
        'early-signs': {
            label: 'Early Signs',
            title: 'Early Signs of Pregnancy',
            summary: 'AI-powered early pregnancy detection system with comprehensive symptom analysis, personalized testing guidance, and expert confirmation support.',
            actionNote: 'Experience intelligent early pregnancy detection with AI-powered insights and expert guidance for timely confirmation.',
            forMom: 'Comprehensive early pregnancy detection with AI-powered symptom analysis, personalized testing recommendations, and expert confirmation support.',
            forBaby: 'Early detection ensures optimal prenatal care and healthy development from the very beginning.',
            checklist: [
                'Track menstrual cycle with AI-powered predictions',
                'Monitor early symptoms with intelligent analysis',
                'Take pregnancy test with optimal timing guidance',
                'Schedule first prenatal appointment with reminder system',
                'Start prenatal vitamins with personalized recommendations',
                'Document early symptoms with photo journal',
                'Plan nutrition for early pregnancy health',
                'Prepare lifestyle adjustments for pregnancy'
            ],
            questions: [
                'What are the most reliable early pregnancy signs?',
                'When is the optimal time to take pregnancy test for accuracy?',
                'How do different pregnancy tests compare in accuracy and timing?',
                'What lifestyle factors affect early pregnancy detection?',
                'When should I schedule my first prenatal appointment for optimal care?',
                'What prenatal tests are recommended for early pregnancy confirmation?',
                'How can I prepare my body and mind for early pregnancy changes?',
                'What nutrition and supplements are crucial in early pregnancy?',
                'How do early pregnancy symptoms differ from normal menstrual changes?'
            ],
            alerts: [
                'Severe or persistent abdominal pain with fever',
                'Heavy vaginal bleeding or clotting',
                'Severe dizziness or fainting episodes',
                'Severe nausea preventing fluid intake',
                'Signs of ectopic pregnancy (one-sided pain with shoulder pain)',
                'Very high fever above 102°F (38.9°C)',
                'Signs of miscarriage requiring immediate medical attention'
            ],
            interactiveFeatures: [
                'AI-Powered Early Detection System',
                'Symptom Analysis and Prediction',
                'Optimal Testing Time Calculator',
                'Personalized Prenatal Care Planner',
                'Early Pregnancy Photo Journal',
                'Healthcare Provider Communication Tools'
            ]
        },
        'sleep': {
            label: 'Sleep',
            title: 'Sleep During Pregnancy',
            summary: 'Advanced sleep optimization system with AI-powered position recommendations, comfort tracking, and personalized sleep quality improvement.',
            actionNote: 'Experience intelligent sleep optimization with AI-powered insights and expert guidance for restorative rest.',
            forMom: 'Comprehensive sleep management with AI-powered position recommendations, comfort optimization, and personalized sleep quality tracking.',
            forBaby: 'Your quality sleep supports optimal baby development and maternal health.',
            checklist: [
                'Find comfortable sleeping position with AI recommendations',
                'Establish consistent sleep routine with tracking',
                'Use pillows for optimal support and comfort',
                'Limit fluids before bed with hydration monitoring',
                'Create relaxing sleep environment with smart suggestions',
                'Avoid caffeine and electronics before bedtime',
                'Practice relaxation techniques for better sleep quality',
                'Consider pregnancy body pillow for optimal support',
                'Monitor sleep quality with AI-powered analysis',
                'Track sleep patterns and comfort levels'
            ],
            questions: [
                'What\'s the best sleep position for my current pregnancy stage?',
                'How can I effectively relieve pregnancy insomnia with expert techniques?',
                'Is it safe to sleep on my back during different trimesters?',
                'How much sleep do I need and how can I optimize sleep quality?',
                'What sleep positions are safe and comfortable for my growing belly?',
                'How do pregnancy hormones affect my sleep patterns and what can I do?',
                'What natural sleep aids are safe during pregnancy?',
                'How can I manage common pregnancy sleep issues like heartburn and leg cramps?',
                'What should I do if I can\'t get comfortable in any position?'
            ],
            alerts: [
                'Severe insomnia lasting more than 2 weeks',
                'Sleep apnea symptoms or breathing difficulties',
                'Severe leg cramps preventing sleep',
                'Extreme fatigue affecting daily functioning',
                'Signs of sleep disorders requiring medical attention',
                'Frequent nightmares or sleep disturbances',
                'Difficulty breathing while lying down'
            ],
            interactiveFeatures: [
                'AI-Powered Sleep Position Analyzer',
                'Sleep Quality Tracker',
                'Comfort Optimization System',
                'Sleep Environment Assistant',
                'Relaxation Technique Library',
                'Sleep Pattern Analysis',
                'Smart Pillow Recommendations'
            ]
        },
        'your-baby': {
            label: 'Baby',
            title: 'Your Baby\'s Development',
            summary: 'Advanced baby development tracking system with 3D visualization, AI-powered milestone analysis, and comprehensive fetal care guidance.',
            actionNote: 'Experience intelligent baby development tracking with 3D visualization and expert guidance for optimal fetal care.',
            forMom: 'Comprehensive baby development tracking with AI-powered milestone analysis, 3D visualization, and expert fetal care guidance.',
            forBaby: 'Your intelligent care supports optimal development with expert guidance and advanced monitoring tools.',
            checklist: [
                'Track baby development with 3D visualization',
                'Monitor fetal movement patterns with AI analysis',
                'Support healthy brain development with expert guidance',
                'Create optimal fetal environment with personalized recommendations',
                'Monitor baby growth and development milestones',
                'Practice bonding activities with expert suggestions',
                'Prepare for baby arrival with comprehensive planning',
                'Document development journey with photo journal',
                'Connect with healthcare providers for optimal care'
            ],
            questions: [
                'What are the key developmental milestones for my current week?',
                'How can I support my baby\'s brain development effectively?',
                'What fetal movements should I expect and track?',
                'How does my nutrition affect baby development?',
                'What bonding activities are most beneficial for my baby?',
                'How can I create optimal environment for fetal development?',
                'What are the signs of healthy fetal development?',
                'How do I prepare for baby arrival with expert guidance?',
                'What healthcare monitoring is essential for optimal development?'
            ],
            alerts: [
                'Significant decrease in fetal movement patterns',
                'Unusual or absent fetal movement for extended periods',
                'Signs of fetal distress requiring immediate medical attention',
                'Abnormal fetal heart rate patterns',
                'Signs of preterm labor affecting baby development',
                'Maternal health issues affecting fetal development',
                'Any concerns about fetal growth or development'
            ],
            interactiveFeatures: [
                '3D Baby Development Visualization',
                'AI-Powered Fetal Movement Tracker',
                'Development Milestone Timeline',
                'Fetal Growth Monitoring System',
                'Bonding Activity Library',
                'Healthcare Provider Communication Tools',
                'Development Photo Journal',
                'Personalized Fetal Care Recommendations'
            ]
        },
        'twins-more': {
            label: 'Multiples',
            title: 'Twins & Multiple Pregnancy',
            summary: 'Advanced multiple pregnancy management system with AI-powered tracking, specialized care coordination, and comprehensive preparation guidance.',
            actionNote: 'Experience intelligent multiple pregnancy management with expert guidance and specialized care coordination.',
            forMom: 'Comprehensive multiple pregnancy support with AI-powered tracking, specialized care coordination, and expert health monitoring.',
            forBaby: 'Each baby receives individualized monitoring and care with expert guidance for optimal development.',
            checklist: [
                'Schedule more frequent prenatal visits with tracking',
                'Monitor each baby\'s growth with AI-powered analysis',
                'Prepare for earlier delivery with comprehensive planning',
                'Plan for multiple pregnancy care with expert guidance',
                'Get support system ready with coordination tools',
                'Monitor for multiple pregnancy complications',
                'Prepare specialized nursery and equipment',
                'Plan for postpartum care with multiple babies'
            ],
            questions: [
                'How is multiple pregnancy different from singleton pregnancy?',
                'When will I likely deliver twins or multiples?',
                'What complications are more common with multiples?',
                'How do I prepare physically and emotionally for multiples?',
                'What specialized care do I need for multiple pregnancy?',
                'How do I monitor each baby\'s development individually?',
                'What are the signs of complications in multiple pregnancy?',
                'How do I plan for postpartum care with multiple babies?'
            ],
            alerts: [
                'Preterm labor signs before 34 weeks',
                'Significant growth differences between babies',
                'High blood pressure or preeclampsia symptoms',
                'Early delivery needs or emergency situations',
                'Signs of twin-to-twin transfusion syndrome',
                'Decreased movement in one or both babies',
                'Any signs of complications requiring immediate care'
            ],
            interactiveFeatures: [
                'Multiple Pregnancy Tracker',
                'Individual Baby Growth Monitoring',
                'Specialized Care Coordinator',
                'Complication Risk Assessment',
                'Multiple Pregnancy Care Planner',
                'Postpartum Preparation System'
            ]
        },
        'fetal-health': {
            label: 'Health',
            title: 'Fetal Health & Development',
            summary: 'Advanced fetal health monitoring system with AI-powered analysis, comprehensive development tracking, and expert health guidance.',
            actionNote: 'Experience intelligent fetal health monitoring with AI-powered insights and expert guidance for optimal development.',
            forMom: 'Comprehensive fetal health monitoring with AI-powered analysis, development tracking, and expert health guidance.',
            forBaby: 'Advanced monitoring ensures optimal development with expert guidance and comprehensive health tracking.',
            checklist: [
                'Attend all prenatal appointments with tracking',
                'Monitor fetal movements with AI-powered analysis',
                'Track growth measurements with visualization',
                'Follow personalized nutrition guidelines',
                'Report concerns immediately with expert guidance',
                'Monitor fetal heart rate patterns',
                'Track development milestones',
                'Prepare for comprehensive postpartum support'
            ],
            questions: [
                'Is my baby growing properly according to current standards?',
                'What prenatal tests check fetal health most effectively?',
                'How do I monitor fetal movements and patterns?',
                'When should I be concerned about fetal development?',
                'What are the key indicators of healthy fetal development?',
                'How does maternal health affect fetal development?',
                'What complications should I watch for during pregnancy?',
                'How do I prepare for optimal fetal health outcomes?'
            ],
            alerts: [
                'Significant decrease in fetal movement patterns',
                'Abnormal fetal growth patterns requiring attention',
                'Concerning prenatal test results',
                'Signs of fetal distress requiring immediate care',
                'Abnormal fetal heart rate patterns',
                'Maternal health issues affecting fetal development',
                'Any concerns about fetal development requiring medical attention'
            ],
            interactiveFeatures: [
                'AI-Powered Fetal Health Monitor',
                'Development Milestone Tracker',
                'Fetal Movement Pattern Analysis',
                'Growth Measurement Visualization',
                'Health Risk Assessment System',
                'Provider Communication Tools'
            ]
        },
        'cord-blood': {
            label: 'Banking',
            title: 'Cord Blood Banking',
            summary: 'Comprehensive cord blood banking system with AI-powered decision support, cost analysis, and expert guidance for informed choices.',
            actionNote: 'Experience intelligent cord blood banking analysis with expert guidance and informed decision support.',
            forMom: 'Comprehensive cord blood banking guidance with AI-powered analysis, cost comparison, and expert decision support.',
            forBaby: 'Informed cord blood banking decisions provide potential medical benefits for your child and family.',
            checklist: [
                'Research cord blood banking options with AI analysis',
                'Compare private vs. public banking with cost calculator',
                'Consider family medical history with expert guidance',
                'Make informed decision before delivery with support',
                'Arrange banking if desired with coordination tools',
                'Understand collection and storage processes',
                'Review legal and ethical considerations',
                'Plan for future medical use possibilities'
            ],
            questions: [
                'What is cord blood banking and how does it work?',
                'Is cord blood banking worth the cost for my family?',
                'What are the medical benefits and limitations?',
                'How do I choose the best cord blood bank?',
                'What are the differences between private and public banking?',
                'What are the collection and storage processes?',
                'What are the legal and ethical considerations?',
                'How likely is my family to use stored cord blood?'
            ],
            alerts: [
                'High-pressure sales tactics requiring caution',
                'Unrealistic promises about medical benefits',
                'Limited storage capacity or viability concerns',
                'Cost considerations affecting financial planning',
                'Misleading information about success rates',
                'Regulatory compliance issues with banking facilities'
            ],
            interactiveFeatures: [
                'AI-Powered Banking Decision Tool',
                'Cost-Benefit Analysis Calculator',
                'Bank Comparison System',
                'Medical Use Probability Assessment',
                'Legal Guidance Library',
                'Collection Process Planner'
            ]
        },
        'fitness': {
            label: 'Fitness',
            title: 'Fitness During Pregnancy',
            summary: 'Advanced pregnancy fitness system with AI-powered exercise recommendations, safety monitoring, and personalized workout planning.',
            actionNote: 'Experience intelligent pregnancy fitness with AI-powered recommendations and expert safety guidance.',
            forMom: 'Comprehensive pregnancy fitness with AI-powered exercise recommendations, safety monitoring, and personalized workout planning.',
            forBaby: 'Your intelligent fitness supports healthy pregnancy with expert guidance and safety monitoring.',
            checklist: [
                'Consult provider about exercise with AI recommendations',
                'Choose pregnancy-safe activities with expert guidance',
                'Stay hydrated during exercise with monitoring',
                'Listen to your body with intelligent feedback',
                'Modify activities as pregnancy progresses',
                'Track fitness progress and benefits',
                'Monitor exercise safety and comfort',
                'Prepare for postpartum fitness recovery'
            ],
            questions: [
                'What exercises are safe for my current pregnancy stage?',
                'How much and what type of exercise is optimal?',
                'What activities should I avoid during pregnancy?',
                'How do I modify my fitness routine as pregnancy progresses?',
                'What are the signs I should stop exercising?',
                'How does exercise benefit pregnancy and baby development?',
                'What exercises help prepare for labor and delivery?',
                'How do I maintain fitness while accommodating pregnancy changes?'
            ],
            alerts: [
                'Dizziness or fainting during exercise',
                'Severe fatigue or exhaustion from activity',
                'Abdominal pain or cramping during exercise',
                'Vaginal bleeding or spotting during activity',
                'Shortness of breath or chest pain',
                'Decreased fetal movement after exercise',
                'Any signs of overexertion or distress'
            ],
            interactiveFeatures: [
                'AI-Powered Exercise Recommender',
                'Pregnancy Fitness Planner',
                'Safety Monitoring System',
                'Progress Tracker',
                'Exercise Modification Guide',
                'Postpartum Fitness Preparation'
            ]
        },
        'pregnancy-nutrients': {
            label: 'Nutrients',
            title: 'Pregnancy Nutrients',
            summary: 'Advanced nutrient tracking system with AI-powered analysis, personalized recommendations, and comprehensive nutrition guidance.',
            actionNote: 'Experience intelligent nutrient management with AI-powered analysis and expert nutrition guidance.',
            forMom: 'Comprehensive nutrient tracking with AI-powered analysis, personalized recommendations, and expert nutrition guidance.',
            forBaby: 'Optimal nutrient support ensures healthy development with expert guidance and comprehensive tracking.',
            checklist: [
                'Take prenatal vitamins daily with tracking',
                'Eat iron-rich foods with AI-powered recommendations',
                'Include calcium sources with personalized guidance',
                'Get adequate protein with expert recommendations',
                'Stay well hydrated with monitoring tools',
                'Track nutrient intake and deficiencies',
                'Plan meals for optimal nutrition',
                'Monitor for nutrient-related symptoms'
            ],
            questions: [
                'What nutrients are most critical for my pregnancy stage?',
                'How much folic acid and other key nutrients do I need?',
                'What foods provide essential nutrients most effectively?',
                'Should I take supplements beyond prenatal vitamins?',
                'How do I manage nutrient deficiencies during pregnancy?',
                'What are the signs of nutrient deficiencies or excess?',
                'How does nutrition affect baby development?',
                'What dietary changes support optimal nutrient intake?'
            ],
            alerts: [
                'Severe nausea preventing adequate nutrient intake',
                'Signs of nutritional deficiencies requiring attention',
                'Unexplained weight loss or poor weight gain',
                'Concerns about diet quality or variety',
                'Symptoms of anemia or other deficiencies',
                'Excessive supplementation risks'
            ],
            interactiveFeatures: [
                'AI-Powered Nutrient Tracker',
                'Personalized Nutrition Planner',
                'Deficiency Risk Assessment',
                'Food Nutrient Database',
                'Supplement Recommendation System',
                'Nutrient Intake Monitor'
            ]
        },
        'healthy-eating': {
            label: 'Eating',
            title: 'Healthy Eating During Pregnancy',
            summary: 'Advanced healthy eating system with AI-powered meal planning, food safety monitoring, and comprehensive nutrition guidance.',
            actionNote: 'Experience intelligent healthy eating with AI-powered meal planning and expert nutrition guidance.',
            forMom: 'Comprehensive healthy eating with AI-powered meal planning, food safety monitoring, and expert nutrition guidance.',
            forBaby: 'Optimal nutrition through healthy eating supports healthy development with expert guidance.',
            checklist: [
                'Eat balanced meals with AI-powered planning',
                'Avoid risky foods with safety monitoring',
                'Practice food safety with expert guidance',
                'Stay hydrated with intelligent tracking',
                'Eat smaller, frequent meals with planning',
                'Monitor food reactions and tolerances',
                'Plan meals for optimal nutrition',
                'Track eating patterns and symptoms'
            ],
            questions: [
                'What foods should I avoid during pregnancy?',
                'How many calories and nutrients do I need daily?',
                'What makes a balanced pregnancy meal?',
                'How do I handle food cravings and aversions?',
                'What are the best food safety practices?',
                'How do I plan meals for optimal nutrition?',
                'What foods help with common pregnancy symptoms?',
                'How do I manage dietary restrictions during pregnancy?'
            ],
            alerts: [
                'Food poisoning symptoms requiring immediate care',
                'Severe food aversions affecting nutrition',
                'Inadequate weight gain or excessive weight gain',
                'Signs of nutritional issues or deficiencies',
                'Allergic reactions to foods',
                'Difficulty maintaining adequate nutrition'
            ],
            interactiveFeatures: [
                'AI-Powered Meal Planner',
                'Food Safety Monitor',
                'Nutrition Balance Tracker',
                'Craving Management System',
                'Food Reaction Monitor',
                'Eating Pattern Analyzer'
            ]
        },
        'best-foods': {
            label: 'Foods',
            title: 'The Best Foods for Pregnancy',
            summary: 'Advanced food optimization system with AI-powered recommendations, nutrient analysis, and comprehensive food guidance.',
            actionNote: 'Experience intelligent food optimization with AI-powered recommendations and expert nutrition guidance.',
            forMom: 'Comprehensive food optimization with AI-powered recommendations, nutrient analysis, and expert food guidance.',
            forBaby: 'Optimal food choices support healthy development with expert guidance and comprehensive nutrition.',
            checklist: [
                'Include leafy greens daily with AI recommendations',
                'Eat protein at each meal with expert guidance',
                'Choose whole grains with nutritional analysis',
                'Add healthy fats with personalized recommendations',
                'Eat colorful fruits and vegetables with planning',
                'Track nutrient intake from food sources',
                'Plan meals around superfoods',
                'Monitor food benefits and reactions'
            ],
            questions: [
                'What are the top pregnancy superfoods and their benefits?',
                'How do I get adequate protein from various food sources?',
                'What foods help manage common pregnancy symptoms?',
                'How do I plan balanced meals around best foods?',
                'What are the most nutrient-dense pregnancy foods?',
                'How do I incorporate variety in my pregnancy diet?',
                'What foods support specific pregnancy stages?',
                'How do I choose foods for my specific nutritional needs?'
            ],
            alerts: [
                'Food allergies or sensitivities requiring attention',
                'Difficulty tolerating nutritious pregnancy foods',
                'Limited access to optimal food choices',
                'Special dietary needs requiring modifications',
                'Food intolerances affecting nutrition',
                'Concerns about food quality or safety'
            ],
            interactiveFeatures: [
                'AI-Powered Food Recommender',
                'Nutrient Density Analyzer',
                'Superfood Database',
                'Meal Planning Assistant',
                'Food Benefit Tracker',
                'Nutritional Goal Monitor'
            ]
        },
        'pregnancy-diet': {
            label: 'Diet',
            title: 'Pregnancy Diet',
            summary: 'Comprehensive pregnancy diet system with AI-powered planning, nutritional analysis, and expert dietary guidance.',
            actionNote: 'Experience intelligent pregnancy diet planning with AI-powered analysis and expert dietary guidance.',
            forMom: 'Comprehensive pregnancy diet with AI-powered planning, nutritional analysis, and expert dietary guidance.',
            forBaby: 'Optimal diet supports healthy development with expert guidance and comprehensive nutritional planning.',
            checklist: [
                'Plan balanced meals with AI-powered assistance',
                'Track nutrient intake with comprehensive analysis',
                'Avoid harmful foods with safety monitoring',
                'Stay hydrated with intelligent tracking',
                'Monitor weight gain with expert guidance',
                'Plan meals for each trimester',
                'Track dietary patterns and benefits',
                'Adjust diet for pregnancy symptoms'
            ],
            questions: [
                'What should my daily pregnancy diet include?',
                'How do I plan meals for optimal nutrition?',
                'What foods are completely off-limits during pregnancy?',
                'How do I handle food cravings and aversions?',
                'What are the best dietary practices for each trimester?',
                'How do I ensure adequate weight gain through diet?',
                'What dietary changes support specific pregnancy needs?',
                'How do I create a sustainable healthy pregnancy diet?'
            ],
            alerts: [
                'Inadequate nutrition requiring intervention',
                'Excessive weight gain from dietary habits',
                'Food safety concerns requiring attention',
                'Eating disorders or disordered eating patterns',
                'Severe dietary restrictions affecting health',
                'Signs of nutritional deficiencies or excess'
            ],
            interactiveFeatures: [
                'AI-Powered Diet Planner',
                'Nutritional Analysis System',
                'Weight Gain Tracker',
                'Food Safety Monitor',
                'Dietary Pattern Analyzer',
                'Trimester-Specific Diet Guide'
            ]
        }
    };
    
    // Get dynamic topic data based on current week
    let data = topicData[topicKey];
    if (data && topicPanel && topicLabel && topicTitle && topicSummary) {
        // Customize content based on current pregnancy week
        let customizedData = { ...data };
        
        if (currentWeek) {
            customizedData = customizeTopicForWeek(topicKey, currentWeek, data);
        }
        
        topicLabel.textContent = customizedData.label;
        topicTitle.textContent = customizedData.title;
        topicSummary.textContent = customizedData.summary;
        
        if (topicActionRow && topicActionButton && topicActionNote) {
            topicActionButton.textContent = `Open ${data.label} Guide`;
            topicActionButton.onclick = () => openPregnancyGuide(topicKey);
            topicActionNote.textContent = data.actionNote;
        }
        
        // Update panel content
        const forMomElement = topicPanel.querySelector('[id="pregnancyTopicForMom"]');
        const forBabyElement = topicPanel.querySelector('[id="pregnancyTopicForBaby"]');
        const checklistElement = topicPanel.querySelector('[id="pregnancyTopicChecklist"]');
        const questionsElement = topicPanel.querySelector('[id="pregnancyTopicQuestions"]');
        const alertsElement = topicPanel.querySelector('[id="pregnancyTopicAlerts"]');
        
        if (forMomElement) forMomElement.textContent = customizedData.forMom;
        if (forBabyElement) forBabyElement.textContent = customizedData.forBaby;
        if (checklistElement) {
            checklistElement.innerHTML = customizedData.checklist.map(item => `<li>${item}</li>`).join('');
        }
        if (questionsElement) {
            questionsElement.innerHTML = customizedData.questions.map(item => `<li>${item}</li>`).join('');
        }
        if (alertsElement) {
            alertsElement.innerHTML = customizedData.alerts.map(item => `<li>${item}</li>`).join('');
        }
        
        // Show current week context in panel
        if (currentWeek) {
            const weekContextElement = document.createElement('div');
            weekContextElement.style.cssText = 'background: var(--secondary-pink); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px;';
            weekContextElement.innerHTML = `<strong>Current Context:</strong> You are in week ${currentWeek} of pregnancy. This information is tailored to your current stage.`;
            
            const panelHead = topicPanel.querySelector('.pregnancy-topics-panel-head');
            if (panelHead) {
                panelHead.insertBefore(weekContextElement, panelHead.firstChild);
            }
        }
        
        // Show the panel
        topicPanel.style.display = 'block';
        
        // Update AI results with dynamic content
        if (window.updateAIResults) {
            window.updateAIResults(topicKey);
        }
        
        topicPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Open pregnancy guide
function openPregnancyGuide(topicKey) {
    // Hide all guides first
    const allGuides = document.querySelectorAll('.pregnancy-guide-page');
    allGuides.forEach(guide => {
        guide.style.display = 'none';
    });
    
    // Show the specific guide
    const guideId = topicKey + '-guide';
    const guideElement = document.getElementById(guideId);
    
    if (guideElement) {
        guideElement.style.display = 'block';
        // Scroll to top of guide
        guideElement.scrollTop = 0;
    } else {
        // If guide doesn't exist, show a message and create a basic guide
        createBasicGuide(topicKey);
    }
}

// Close pregnancy guide
function closePregnancyGuide() {
    const allGuides = document.querySelectorAll('.pregnancy-guide-page');
    allGuides.forEach(guide => {
        guide.style.display = 'none';
    });
}

// Create basic guide for topics that don't have detailed guides yet
function createBasicGuide(topicKey) {
    const topicData = getTopicDataForGuide(topicKey);
    if (!topicData) return;
    
    const guideContainer = document.getElementById('pregnancyGuideContainer');
    const guideId = topicKey + '-guide';
    
    // Check if guide already exists
    let guideElement = document.getElementById(guideId);
    if (guideElement) {
        guideElement.style.display = 'block';
        return;
    }
    
    // Create new guide element
    guideElement = document.createElement('div');
    guideElement.id = guideId;
    guideElement.className = 'pregnancy-guide-page';
    
    guideElement.innerHTML = `
        <div class="guide-header">
            <h2>${topicData.title} Complete Guide</h2>
            <button onclick="closePregnancyGuide()" class="guide-close-btn">Close Guide</button>
        </div>
        <div class="guide-content">
            <div class="guide-section">
                <h3>Overview</h3>
                <p>${topicData.summary}</p>
            </div>
            <div class="guide-section">
                <h3>For Mom</h3>
                <p>${topicData.forMom}</p>
            </div>
            <div class="guide-section">
                <h3>For Baby</h3>
                <p>${topicData.forBaby}</p>
            </div>
            <div class="guide-section">
                <h3>Essential Checklist</h3>
                <ul>
                    ${topicData.checklist.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="guide-section">
                <h3>Common Questions</h3>
                <ul>
                    ${topicData.questions.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="guide-section">
                <h3>Important Alerts</h3>
                <ul>
                    ${topicData.alerts.map(item => `<li><strong>Alert:</strong> ${item}</li>`).join('')}
                </ul>
            </div>
            <div class="guide-section">
                <h3>Interactive Features</h3>
                <ul>
                    ${topicData.interactiveFeatures.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    guideContainer.appendChild(guideElement);
    guideElement.style.display = 'block';
}

// Get topic data for guide creation
function getTopicDataForGuide(topicKey) {
    const topicData = {
        'your-body': {
            title: 'Your Body During Pregnancy',
            summary: 'Advanced body tracking system with AI-powered symptom analysis, personalized comfort recommendations, and comprehensive self-care guidance.',
            forMom: 'Comprehensive body transformation tracking with symptom analysis, comfort optimization, and personalized self-care recommendations.',
            forBaby: 'Your body changes create optimal environment for baby development with expert guidance on maternal health.',
            checklist: [
                'Track body changes with visual timeline',
                'Monitor symptoms with AI-powered analysis',
                'Practice comfort exercises daily',
                'Use personalized comfort solutions',
                'Track weight gain and belly growth',
                'Monitor sleep quality and patterns',
                'Practice self-care routines',
                'Document body changes with photos'
            ],
            questions: [
                'What body changes should I expect this week?',
                'How can I manage pregnancy discomfort effectively?',
                'What exercises are safe for my current symptoms?',
                'How do hormonal changes affect my emotions and body?',
                'What self-care practices are most beneficial?',
                'When should I be concerned about physical symptoms?',
                'How can I prepare my body for birth?',
                'What comfort measures help with specific discomforts?'
            ],
            alerts: [
                'Severe or persistent abdominal pain',
                'Unusual swelling in hands/face/feet',
                'Severe headaches that don\'t respond to rest',
                'Vision changes or spots before eyes',
                'Signs of blood clots or heavy bleeding',
                'Severe back pain with fever',
                'Sudden severe fatigue or weakness'
            ],
            interactiveFeatures: [
                'Body Change Visual Timeline',
                'AI-Powered Symptom Analysis',
                'Personalized Comfort Recommendations',
                'Weight and Belly Growth Tracker',
                'Sleep Quality Monitor',
                'Self-Care Routine Builder',
                'Body Change Photo Journal'
            ]
        },
        'symptoms': {
            title: 'Pregnancy Symptoms Guide',
            summary: 'AI-powered symptom tracking system with intelligent analysis, personalized management recommendations, and comprehensive health monitoring.',
            forMom: 'Comprehensive symptom management with AI-powered analysis, personalized recommendations, and real-time health monitoring.',
            forBaby: 'Your symptoms provide valuable insights into pregnancy progression and baby development with expert guidance.',
            checklist: [
                'Track symptoms daily with AI-powered analysis',
                'Know normal vs. concerning signs with expert guidance',
                'Practice symptom management techniques',
                'Stay informed about weekly changes',
                'Communicate effectively with healthcare provider',
                'Monitor symptom patterns and trends',
                'Use personalized symptom management strategies'
            ],
            questions: [
                'Is this symptom normal for my pregnancy week?',
                'When should I call my doctor about specific symptoms?',
                'How can I effectively manage common pregnancy symptoms?',
                'What symptoms need immediate medical attention?',
                'How do I track symptoms and patterns effectively?',
                'What lifestyle changes help alleviate specific symptoms?',
                'How do different symptoms relate to pregnancy progression?'
            ],
            alerts: [
                'Severe abdominal or pelvic pain',
                'Heavy vaginal bleeding or clotting',
                'High fever above 100.4°F (38°C)',
                'Severe persistent headache',
                'Sudden vision changes or spots',
                'Signs of preterm labor before 37 weeks',
                'Decreased or absent fetal movement',
                'Severe swelling in hands/face',
                'Chest pain or difficulty breathing'
            ],
            interactiveFeatures: [
                'AI-Powered Symptom Tracker',
                'Symptom Pattern Analysis',
                'Normal vs Concerning Guide',
                'Provider Communication Log',
                'Symptom Severity Assessment',
                'Personalized Symptom Management',
                'Symptom Trend Analysis',
                'Emergency Contact Quick Access'
            ]
        },
        'fitness': {
            title: 'Fitness During Pregnancy',
            summary: 'Advanced pregnancy fitness system with AI-powered exercise recommendations, safety monitoring, and personalized workout planning.',
            forMom: 'Comprehensive pregnancy fitness with AI-powered exercise recommendations, safety monitoring, and personalized workout planning.',
            forBaby: 'Your intelligent fitness supports healthy pregnancy with expert guidance and safety monitoring.',
            checklist: [
                'Consult provider about exercise with AI recommendations',
                'Choose pregnancy-safe activities with expert guidance',
                'Stay hydrated during exercise with monitoring',
                'Listen to your body with intelligent feedback',
                'Modify activities as pregnancy progresses',
                'Track fitness progress and benefits',
                'Monitor exercise safety and comfort',
                'Prepare for postpartum fitness recovery'
            ],
            questions: [
                'What exercises are safe for my current pregnancy stage?',
                'How much and what type of exercise is optimal?',
                'What activities should I avoid during pregnancy?',
                'How do I modify my fitness routine as pregnancy progresses?',
                'What are the signs I should stop exercising?',
                'How does exercise benefit pregnancy and baby development?',
                'What exercises help prepare for labor and delivery?',
                'How do I maintain fitness while accommodating pregnancy changes?'
            ],
            alerts: [
                'Dizziness or fainting during exercise',
                'Severe fatigue or exhaustion from activity',
                'Abdominal pain or cramping during exercise',
                'Vaginal bleeding or spotting during activity',
                'Shortness of breath or chest pain',
                'Decreased fetal movement after exercise',
                'Any signs of overexertion or distress'
            ],
            interactiveFeatures: [
                'AI-Powered Exercise Recommender',
                'Pregnancy Fitness Planner',
                'Safety Monitoring System',
                'Progress Tracker',
                'Exercise Modification Guide',
                'Postpartum Fitness Preparation'
            ]
        },
        'labor-delivery': {
            title: 'Labor & Delivery Guide',
            summary: 'Comprehensive birth preparation system with AI-powered planning, pain management guidance, and postpartum readiness tracking.',
            forMom: 'Empowers you with AI-powered birth planning, pain management options, and confident birth preparation tools.',
            forBaby: 'Ensures safe, positive, and well-prepared birth experience for your baby with expert guidance.',
            checklist: [
                'Create comprehensive birth plan with AI assistance',
                'Pack hospital bag with smart checklist',
                'Practice advanced breathing and relaxation techniques',
                'Learn detailed labor stages with visual guides',
                'Arrange reliable transportation and support systems',
                'Choose and coordinate birth support team',
                'Install and verify car seat safety',
                'Prepare complete postpartum recovery area',
                'Tour hospital facility with virtual tours',
                'Complete emergency preparation planning'
            ],
            questions: [
                'When should I go to hospital based on labor patterns?',
                'What are the detailed stages of labor and what to expect?',
                'How can I effectively manage labor pain with various techniques?',
                'What pain management options are available and safe?',
                'Who should be my ideal birth support team and their roles?',
                'What emergency procedures and protocols should I understand?',
                'How do I prepare for successful breastfeeding and postpartum recovery?',
                'What are the signs that indicate labor is progressing normally?',
                'How do I create effective communication with my healthcare team?',
                'What are my options for birth location and environment?'
            ],
            alerts: [
                'Regular contractions less than 5 minutes apart for over 1 hour',
                'Water breaking or significant fluid leakage',
                'Severe bleeding or bright red blood loss',
                'Significant decrease or absence of fetal movement',
                'Fever above 100.4°F (38°C) with other symptoms',
                'Severe persistent headache or vision changes',
                'Severe back pain with fever or chills',
                'Signs of placental abruption or cord problems',
                'Any thoughts of self-harm or severe depression'
            ],
            interactiveFeatures: [
                'AI-Powered Birth Plan Builder',
                'Advanced Contraction Timer',
                'Smart Hospital Bag Checklist',
                'Interactive Labor Stage Guide',
                'Comprehensive Pain Management Options',
                'Birth Support Team Coordinator',
                'Virtual Hospital Tour',
                'Emergency Protocol Quick Access',
                'Postpartum Preparation Tracker'
            ]
        }
    };
    
    return topicData[topicKey] || null;
}

// ==========================================
// ACCOUNT DASHBOARD FUNCTIONS
// ==========================================

function initializeAccount() {
    console.log('Initializing account dashboard...');
    loadAccountData();
}

function loadAccountData() {
    const readJSON = (key, fallback = {}) => {
        try {
            return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        } catch (error) {
            return fallback;
        }
    };
    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    const formatDate = (value) => {
        if (!value) return 'Add date';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const getStageLabel = (stage) => ({
        pregnant: 'Pregnancy care',
        pregnancy: 'Pregnancy care',
        support: 'Professional support',
        'pregnancy-tracking': 'Pregnancy tracking',
        'feeding-sleep': 'Learning courses',
        courses: 'Learning courses',
        names: 'Baby names'
    }[stage] || 'Personal care');

    const profile = typeof getStoredAuthProfile === 'function' ? getStoredAuthProfile() : readJSON('bc_user_profile', {});
    const pregnancyData = readJSON('bc_pregnancy_data', {});
    const settings = readJSON('bc_settings', {});
    const userEmail = localStorage.getItem('bc_user_email') || profile.email || 'user@example.com';
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    const displayName = fullName || String(userEmail).split('@')[0] || 'Mama';
    const stage = profile.stage || profile.lastFocus || 'pregnancy';
    const stageLabel = getStageLabel(stage);
    const dueDate = pregnancyData.dueDate || profile.dueDate || profile.careDate || '';
    const due = dueDate ? new Date(dueDate) : null;
    const daysLeft = due && !Number.isNaN(due.getTime()) ? Math.max(0, Math.ceil((due - new Date()) / 86400000)) : null;
    let currentWeek = Number(pregnancyData.currentWeek || pregnancyData.week || 0);
    if (!currentWeek && due && !Number.isNaN(due.getTime())) {
        currentWeek = Math.min(42, Math.max(1, Math.round((280 - daysLeft) / 7)));
    }
    currentWeek = currentWeek || 24;
    const trimester = currentWeek <= 13 ? 'First trimester' : currentWeek <= 27 ? 'Second trimester' : 'Third trimester';
    const progress = Math.min(100, Math.max(4, Math.round((currentWeek / 40) * 100)));
    const readiness = Math.min(96, 48 + (userEmail ? 12 : 0) + (dueDate ? 14 : 0) + (settings.weeklyUpdates !== false ? 10 : 0) + (settings.emailNotif !== false ? 12 : 0));
    const visibility = settings.profileVisibility || 'private';

    setText('accountGreeting', `Welcome back, ${displayName}`);
    setText('accountSummary', `${stageLabel} dashboard with timeline, saved tools, learning, and care signals in one place.`);
    setText('accountEmail', userEmail);
    setText('profileEmail', userEmail);
    setText('accountInitials', displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'MS');
    setText('accountStageLabel', stageLabel);
    setText('accountMemberSince', `Member since ${formatDate(profile.createdAt || profile.savedAt || profile.lastLoginAt || new Date())}`);
    setText('currentWeek', `Week ${currentWeek}`);
    setText('accountTrimester', trimester);
    setText('dueDate', formatDate(dueDate));
    setText('accountDaysLeft', daysLeft === null ? 'Set your timeline' : `${daysLeft} days to due date`);
    setText('accountPriority', getStageLabel(profile.carePriority || profile.lastFocus || stage));
    setText('babySize', pregnancyData.babySize || (currentWeek < 14 ? 'Early growth phase' : currentWeek < 28 ? 'Rapid growth phase' : 'Final growth phase'));
    setText('accountReadiness', `${readiness}%`);
    setText('accountVisibility', visibility.replace('-', ' '));
    setText('timelineNow', `Week ${currentWeek} check-in`);
    setText('timelineNext', currentWeek >= 36 ? 'Weekly visit and birth readiness' : 'Prenatal visit and symptom log');

    const fill = document.getElementById('accountProgressFill');
    if (fill) fill.style.width = `${progress}%`;

    const emailNotif = document.getElementById('emailNotif');
    const weeklyUpdates = document.getElementById('weeklyUpdates');
    const communityDigest = document.getElementById('communityDigest');
    const profileVisibility = document.getElementById('profileVisibility');
    if (emailNotif) emailNotif.checked = settings.emailNotif !== false;
    if (weeklyUpdates) weeklyUpdates.checked = settings.weeklyUpdates !== false;
    if (communityDigest) communityDigest.checked = !!settings.communityDigest;
    if (profileVisibility) profileVisibility.value = visibility;
}

function editProfile() {
    showNotification('Profile editing coming soon!', 'info');
}

function saveSettings() {
    const settings = {
        emailNotif: document.getElementById('emailNotif')?.checked ?? true,
        weeklyUpdates: document.getElementById('weeklyUpdates')?.checked ?? true,
        communityDigest: document.getElementById('communityDigest')?.checked ?? false,
        profileVisibility: document.getElementById('profileVisibility')?.value || 'private'
    };
    
    localStorage.setItem('bc_settings', JSON.stringify(settings));
    if (window.DB_SYNC) window.DB_SYNC.saveSettings(settings);
    loadAccountData();
    showNotification('Settings saved successfully!', 'success');
}

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

let mamasafeInitializePromise = null;

async function initializeApp() {
    if (mamasafeInitializePromise) {
        return mamasafeInitializePromise;
    }

    mamasafeInitializePromise = initializeAppOnce().catch((error) => {
        mamasafeInitializePromise = null;
        throw error;
    });

    return mamasafeInitializePromise;
}

async function initializeAppOnce() {
    console.log('Initializing Mamasafe Application...');
    
    try {
        // Modules are already loaded via HTML script tags
        console.log('All modules loaded successfully');
        
        // Initialize app state
        MamasafeApp.initialized = true;
        
        // Safeguard: Ensure login state persists
        const loginState = localStorage.getItem('bc_logged_in');
        const userEmail = localStorage.getItem('bc_user_email');
        console.log('App init - Login state from localStorage:', { loginState, userEmail });
        
        // Set up global event listeners
        setupGlobalEventListeners();
        
        // Initialize user authentication state
        updateLoginState();

        if (window.MamasafeAI) {
            window.MamasafeAI.initialize({ silent: true, skipAuthCheck: true })
                .catch(error => console.warn('Mamasafe assistant AI could not initialize:', error.message || error));
        }
        
        // Initialize current page if specified
        const currentPage = getCurrentPageFromURL();
        if (currentPage) {
            navigateTo(currentPage, { skipAuthCheck: true, replaceHistory: true });
        } else {
            navigateTo('home', { skipAuthCheck: true, replaceHistory: true });
        }

        if (currentPage !== 'admin') {
            resumeIntendedAccess(currentPage || 'home');
        }
        
        showNotification('Mamasafe application loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Failed to load application. Please refresh the page.', 'error');
    }
}

function refreshCurrentPageData() {
    // Refresh data for current page if needed
    console.log('Refreshing current page data...');
    refreshNotificationsPanel(false);
}

// ==========================================
// ERROR HANDLING
// ==========================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You might want to send this to an error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

function logPerformance() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Log memory usage if available
        if ('memory' in performance) {
            console.log(`Memory usage: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`);
        }
    }
}

// ==========================================
// SERVICE WORKER REGISTRATION
// ==========================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js?v=20260612-real-active-users-v6')
            .then(registration => {
                console.log('Service Worker registered:', registration);
                registration.update();
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ==========================================
// DOM READY EVENT LISTENER
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app initialization...');
    
    // Check if document is ready
    if (!document.body) {
        console.error('Document body not found');
        return;
    }
    
    // Initialize the application
    initializeApp();
    
});

// ==========================================
// PROTECTED TOOL PAGES
// ==========================================

window.protectedToolPages = window.protectedToolPages || new Set([
    'pregnancy',
    'due-date-calculator',
    'pregnancy-tracker',
    'names',
    'baby-names',
    'courses',
    'account',
    'help-section',
    'baby-kick-counter',
    'kick-counter',
    'contraction-timer'
]);

// ==========================================
// EXPORT FOR USE IN OTHER MODULES
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Authentication
        isLoggedIn,
        setIntendedAccess,
        redirectToLoginForTool,
        requireToolAccess,
        resumeIntendedAccess,
        handleLogin,
        handleSignup,
        handleLogout,
        updateLoginState,
        
        // Navigation
        navigateTo,
        initializePage,
        getCurrentPageFromURL,
        setupGlobalEventListeners,
        
        // UI Helpers
        showNotification,
        openModal,
        closeModal,
        closeAllModals,
        validateEmail,
        validateRequired,
        clearFormErrors,
        formatDate,
        calculateAge,
        calculateWeeksBetween,
        saveToLocalStorage,
        loadFromLocalStorage,
        debounce,
        generateId,
        
        // Navigation
        navigateTo,
        initializePage,
        getCurrentPageFromURL,
        setupGlobalEventListeners,
        
        // Calculators
        calculateHomeDueDate,
        getBabySize,
        
        // Baby Names
        fetchWikidataBabyNames,
        sanitizeNameText,
        processWikidataResponse,
        
        // Account Dashboard
        initializeAccount,
        loadAccountData,
        editProfile,
        saveSettings,
        
        // App Initialization
        initializeApp,
        refreshCurrentPageData,
        registerServiceWorker,
        logPerformance
    };
}

// Add sample notifications for testing
function addSampleNotifications() {
    // Sample notification
    addAppNotification("Welcome to Mamasafe! We're here to help you through your pregnancy journey with important reminders and updates.", "reminder", { 
        title: "Welcome!", 
        category: "notifications" 
    });
    
    // Sample message
    addAppNotification("You have a new message from your care provider about your upcoming appointment. Please check your messages.", "appointment", { 
        title: "New Message", 
        category: "messages" 
    });
    
    // Sample alert
    addAppNotification("Remember to schedule your next prenatal visit this week. Regular appointments are important for your pregnancy health.", "reminder", { 
        title: "Appointment Reminder", 
        category: "alerts" 
    });
}

// Call on app load (after DOM ready)
document.addEventListener('DOMContentLoaded', function() {
    // Only add samples if we don't have any yet
    if (getStoredNotifications().length === 0) {
        addSampleNotifications();
        renderNotificationsPanel();
    }
});

// Export pregnancy AI functions to global scope
window.updateAIResults = updateAIResults;
window.generateAIData = generateAIData;
window.updateHealthScore = updateHealthScore;
window.updateBabyDevelopment = updateBabyDevelopment;
window.updateRiskAssessment = updateRiskAssessment;
window.updatePersonalizedRecommendations = updatePersonalizedRecommendations;
window.updateDevelopmentTimeline = updateDevelopmentTimeline;
window.updateHealthAlerts = updateHealthAlerts;
window.updateBabySize = updateBabySize;
window.updateSymptomAnalysis = updateSymptomAnalysis;
window.updateActionPlan = updateActionPlan;
window.showAIResultsWithAnimation = showAIResultsWithAnimation;
window.downloadAIReport = downloadAIReport;
window.shareAIResults = shareAIResults;
window.generateAIReport = generateAIReport;
window.closeModal = closeModal;
window.addAppNotification = addAppNotification;
window.refreshNotificationsPanel = refreshNotificationsPanel;
window.toggleNotificationsPanel = toggleNotificationsPanel;
window.switchNotificationTab = switchNotificationTab;
window.clearNotificationsPanel = clearNotificationsPanel;
window.enableBrowserNotifications = enableBrowserNotifications;

// ==========================================
// AI-POWERED PREGNANCY RESULTS FUNCTIONS
// ==========================================

// Update AI results with dynamic content
function updateAIResults(topicKey) {
    // Generate dynamic AI data based on topic
    const aiData = generateAIData(topicKey);
    
    // Update health score with animation
    updateHealthScore(aiData.healthScore);
    
    // Update baby development status
    updateBabyDevelopment(aiData.babyDevelopment);
    
    // Update risk assessment
    updateRiskAssessment(aiData.riskLevel);
    
    // Update personalized recommendations
    updatePersonalizedRecommendations(aiData.recommendations);
    
    // Update development timeline
    updateDevelopmentTimeline(aiData.timeline);
    
    // Update health alerts
    updateHealthAlerts(aiData.alerts);
    
    // Update baby size predictor
    updateBabySize(aiData.babySize);
    
    // Update symptom analysis
    updateSymptomAnalysis(aiData.symptoms);
    
    // Update action plan
    updateActionPlan(aiData.actionPlan);
    
    // Update timestamp
    updateAITimestamp();
    
    // Show loading animation then reveal content
    showAIResultsWithAnimation();
}

// Generate dynamic AI data based on topic
function generateAIData(topicKey) {
    const baseData = {
        healthScore: Math.floor(Math.random() * 15) + 85,
        babyDevelopment: 'Optimal',
        riskLevel: 'Low',
        recommendations: [],
        timeline: [],
        alerts: [],
        babySize: { current: 'Banana', next: 'Small Coconut', length: '34.5 cm', weight: '1.1 kg' },
        symptoms: { fatigue: Math.floor(Math.random() * 30) + 60, nausea: Math.floor(Math.random() * 20) + 10, energy: Math.floor(Math.random() * 25) + 65 },
        actionPlan: []
    };
    
    // Customize based on topic
    switch(topicKey) {
        case 'pregnancy-week-by-week':
            return {
                ...baseData,
                healthScore: 94,
                babyDevelopment: 'Excellent Progress',
                riskLevel: 'Minimal',
                recommendations: [
                    'Track pregnancy week with interactive timeline',
                    'Monitor baby movements with kick counter',
                    'Schedule prenatal appointments with reminders',
                    'Take prenatal vitamins with daily tracker',
                    'Log symptoms and mood changes',
                    'Track weight gain and belly growth',
                    'Practice breathing exercises daily'
                ],
                timeline: [
                    { week: '1-13', status: 'completed', description: 'Organ formation complete' },
                    { week: '14-27', status: 'current', description: 'Rapid growth phase' },
                    { week: '28-40', status: 'upcoming', description: 'Final development' }
                ],
                alerts: [
                    { type: 'success', message: 'All vital signs within normal range' },
                    { type: 'warning', message: 'Schedule glucose screening test this week' }
                ],
                babySize: { current: 'Avocado', next: 'Small Mellon', length: '38.2 cm', weight: '1.4 kg' },
                symptoms: { fatigue: 65, nausea: 15, energy: 75 },
                actionPlan: [
                    { priority: 'high', action: 'Schedule Prenatal Visit', detail: 'Week 24 appointment recommended' },
                    { priority: 'medium', action: 'Start Iron Supplements', detail: 'Based on blood analysis' },
                    { priority: 'low', action: 'Practice Kegels Daily', detail: 'Prepare for delivery' }
                ]
            };
            
        case 'first-trimester':
            return {
                ...baseData,
                healthScore: 88,
                babyDevelopment: 'Critical Development',
                riskLevel: 'Moderate',
                recommendations: [
                    'Schedule first prenatal appointment with reminder system',
                    'Start prenatal vitamins with daily tracking',
                    'Manage morning sickness with AI-powered tips',
                    'Get adequate rest with sleep quality monitoring',
                    'Stay hydrated with water intake tracking',
                    'Track hormone changes and mood patterns',
                    'Plan nutrition with trimester-specific meal plans',
                    'Create safe exercise routine for early pregnancy'
                ],
                timeline: [
                    { week: '1-4', status: 'completed', description: 'Neural tube formation' },
                    { week: '5-8', status: 'completed', description: 'Heart development begins' },
                    { week: '9-13', status: 'current', description: 'Organ development phase' },
                    { week: '14+', status: 'upcoming', description: 'Second trimester preparation' }
                ],
                alerts: [
                    { type: 'warning', message: 'Monitor severe morning sickness' },
                    { type: 'success', message: 'Fetal heartbeat detectable by week 12' }
                ],
                babySize: { current: 'Blueberry', next: 'Raspberry', length: '25.8 cm', weight: '0.8 kg' },
                symptoms: { fatigue: 85, nausea: 45, energy: 40 },
                actionPlan: [
                    { priority: 'high', action: 'Schedule First Trimester Screening', detail: 'Week 10-13 recommended' },
                    { priority: 'medium', action: 'Get Anti-Nausea Medication', detail: 'If prescribed by provider' },
                    { priority: 'low', action: 'Join Pregnancy Support Group', detail: 'Connect with others' }
                ]
            };
            
        case 'symptoms':
            return {
                ...baseData,
                healthScore: 91,
                babyDevelopment: 'Healthy Adaptation',
                riskLevel: 'Low',
                recommendations: [
                    'Track symptoms with AI-powered analysis',
                    'Monitor for warning signs requiring medical attention',
                    'Use natural remedies for mild symptoms',
                    'Stay hydrated and maintain balanced nutrition',
                    'Practice gentle exercises approved for pregnancy',
                    'Get adequate rest and prioritize sleep',
                    'Consider pregnancy-safe medications for severe symptoms'
                ],
                timeline: [
                    { week: 'Current', status: 'active', description: 'Symptom monitoring phase' },
                    { week: 'Next 4 weeks', status: 'upcoming', description: 'Symptom evolution tracking' }
                ],
                alerts: [
                    { type: 'success', message: 'Most symptoms within normal pregnancy range' },
                    { type: 'warning', message: 'Contact provider if symptoms worsen suddenly' }
                ],
                babySize: { current: 'Lime', next: 'Apple', length: '36.1 cm', weight: '1.2 kg' },
                symptoms: { fatigue: 70, nausea: 25, energy: 55 },
                actionPlan: [
                    { priority: 'high', action: 'Create Symptom Tracking Schedule', detail: 'Daily monitoring recommended' },
                    { priority: 'medium', action: 'Prepare Comfort Kit', detail: 'Natural remedies and medications' },
                    { priority: 'low', action: 'Download Symptom Guide', detail: 'Comprehensive symptom resource' }
                ]
            };
            
        default:
            return baseData;
    }
}

// Update health score with animation
function updateHealthScore(score) {
    const scoreElement = document.getElementById('aiHealthScore');
    if (scoreElement) {
        animateNumber(scoreElement, 0, score, 1500);
        
        const progressFill = scoreElement.closest('.metric-progress')?.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
            setTimeout(() => {
                progressFill.style.width = score + '%';
            }, 100);
        }
    }
}

// Update baby development status
function updateBabyDevelopment(status) {
    const element = document.getElementById('aiBabyDevelopment');
    if (element) {
        element.textContent = status;
    }
}

// Update risk assessment
function updateRiskAssessment(level) {
    const element = document.getElementById('aiRiskLevel');
    const statusElement = element?.closest('.metric-content')?.querySelector('.metric-status');
    if (element) element.textContent = level;
    if (statusElement) statusElement.textContent = level === 'Low' ? 'Excellent' : level === 'Moderate' ? 'Good' : 'Needs Attention';
}

// Update personalized recommendations
function updatePersonalizedRecommendations(recommendations) {
    const element = document.getElementById('aiPersonalizedRecs');
    if (element) {
        const listElement = element.querySelector('.ai-list');
        if (listElement) {
            listElement.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
        }
    }
}

// Update development timeline
function updateDevelopmentTimeline(timeline) {
    const element = document.getElementById('aiDevelopmentTimeline');
    if (element) {
        element.innerHTML = timeline.map(item => `
            <div class="timeline-item ${item.status}">
                <div class="timeline-marker ${item.status}"></div>
                <div class="timeline-content">
                    <strong>Week ${item.week}:</strong> ${item.description}
                </div>
            </div>
        `).join('');
    }
}

// Update health alerts
function updateHealthAlerts(alerts) {
    const element = document.getElementById('aiHealthAlerts');
    if (element) {
        element.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <span class="alert-icon">${alert.type === 'success' ? 'â ' : 'â¡'}</span>
                <span>${alert.message}</span>
            </div>
        `).join('');
    }
}

// Update baby size predictor
function updateBabySize(sizeData) {
    const sizeElement = document.getElementById('aiBabySize');
    const lengthElement = document.getElementById('aiBabyLength');
    const weightElement = document.getElementById('aiBabyWeight');
    
    if (sizeElement) {
        sizeElement.innerHTML = `
            <div class="size-comparison">
                <div class="size-item current">
                    <div class="size-emoji">ð</div>
                    <span>Current: ${sizeData.current}</span>
                </div>
                <div class="size-item next">
                    <div class="size-emoji">¥</div>
                    <span>Next: ${sizeData.next}</span>
                </div>
            </div>
        `;
    }
    
    if (lengthElement) lengthElement.textContent = sizeData.length;
    if (weightElement) weightElement.textContent = sizeData.weight;
}

// Update symptom analysis
function updateSymptomAnalysis(symptoms) {
    const element = document.getElementById('aiSymptomAnalysis');
    if (element) {
        element.innerHTML = `
            <div class="symptom-item">
                <span class="symptom-label">Fatigue Level:</span>
                <div class="symptom-bar">
                    <div class="symptom-fill" style="width: ${symptoms.fatigue}%;"></div>
                </div>
                <span class="symptom-value">${symptoms.fatigue > 70 ? 'High' : symptoms.fatigue > 50 ? 'Moderate' : 'Low'}</span>
            </div>
            <div class="symptom-item">
                <span class="symptom-label">Nausea Risk:</span>
                <div class="symptom-bar">
                    <div class="symptom-fill ${symptoms.nausea < 20 ? 'low' : ''}" style="width: ${symptoms.nausea}%;"></div>
                </div>
                <span class="symptom-value">${symptoms.nausea < 20 ? 'Low' : symptoms.nausea < 40 ? 'Moderate' : 'High'}</span>
            </div>
            <div class="symptom-item">
                <span class="symptom-label">Energy Level:</span>
                <div class="symptom-bar">
                    <div class="symptom-fill" style="width: ${symptoms.energy}%;"></div>
                </div>
                <span class="symptom-value">${symptoms.energy > 70 ? 'Excellent' : symptoms.energy > 50 ? 'Good' : 'Fair'}</span>
            </div>
        `;
    }
}

// Update action plan
function updateActionPlan(actionPlan) {
    const element = document.getElementById('aiActionPlan');
    if (element) {
        element.innerHTML = actionPlan.map(action => `
            <div class="action-item priority-${action.priority}">
                <span class="action-icon">${getActionIcon(action.action)}</span>
                <div class="action-content">
                    <strong>${action.action}</strong>
                    <span>${action.detail}</span>
                </div>
            </div>
        `).join('');
    }
}

// Get action icon based on action text
function getActionIcon(action) {
    const iconMap = {
        'Schedule': 'ð¥',
        'Start': 'ð',
        'Practice': 'ð§',
        'Create': 'ð',
        'Get': 'ð',
        'Prepare': 'ð¦',
        'Join': 'ð¥',
        'Download': 'ð¥'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
        if (action.includes(key)) return icon;
    }
    return 'ð';
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const startTime = Date.now();
    const updateNumber = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    };
    updateNumber();
}

// Show AI results with loading animation
function showAIResultsWithAnimation() {
    const resultsContainer = document.querySelector('.ai-pregnancy-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.style.opacity = '0';
        resultsContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultsContainer.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            resultsContainer.style.opacity = '1';
            resultsContainer.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Download AI report
function downloadAIReport() {
    showNotification('Generating comprehensive AI pregnancy report...', 'info');
    
    setTimeout(() => {
        const reportContent = generateAIReport();
        downloadReport(reportContent, 'pregnancy-ai-report.pdf');
        showNotification('AI report downloaded successfully!', 'success');
    }, 2000);
}

// Share AI results
function shareAIResults() {
    showNotification('Preparing AI results for sharing...', 'info');
    
    setTimeout(() => {
        const shareData = {
            title: 'My AI Pregnancy Analysis',
            text: 'Check out my personalized pregnancy insights and recommendations!',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => showNotification('Results shared successfully!', 'success'))
                .catch(() => showNotification('Sharing completed', 'info'));
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`${shareData.title}: ${shareData.text} ${shareData.url}`);
            showNotification('Results copied to clipboard!', 'success');
        }
    }, 1000);
}

// Generate AI report content
function generateAIReport() {
    const timestamp = new Date().toLocaleString();
    return `
PREGNANCY AI ANALYSIS REPORT
Generated: ${timestamp}

HEALTH ASSESSMENT
================
Overall Health Score: ${document.getElementById('aiHealthScore')?.textContent || 'N/A'}
Baby Development Status: ${document.getElementById('aiBabyDevelopment')?.textContent || 'N/A'}
Risk Assessment: ${document.getElementById('aiRiskLevel')?.textContent || 'N/A'}

PERSONALIZED RECOMMENDATIONS
============================
${Array.from(document.querySelectorAll('#aiPersonalizedRecs .ai-list li')).map(li => li.textContent).join('\n')}

DEVELOPMENT TIMELINE
==================
${Array.from(document.querySelectorAll('#aiDevelopmentTimeline .timeline-content')).map(item => item.textContent).join('\n')}

HEALTH ALERTS
==============
${Array.from(document.querySelectorAll('#aiHealthAlerts .alert-item span')).map(item => item.textContent).join('\n')}

BABY SIZE PREDICTION
==================
Current Size: ${Array.from(document.querySelectorAll('#aiBabySize .size-item span'))[0]?.textContent || 'N/A'}
Next Size: ${Array.from(document.querySelectorAll('#aiBabySize .size-item span'))[1]?.textContent || 'N/A'}
Measurements: Length: ${document.getElementById('aiBabyLength')?.textContent || 'N/A'}, Weight: ${document.getElementById('aiBabyWeight')?.textContent || 'N/A'}

SYMPTOM ANALYSIS
================
${Array.from(document.querySelectorAll('#aiSymptomAnalysis .symptom-value')).map(item => item.textContent).join('\n')}

ACTION PLAN
===========
${Array.from(document.querySelectorAll('#aiActionPlan .action-content strong')).map(item => item.textContent).join('\n')}

DISCLAIMER
==========
This AI analysis is based on current medical guidelines and your pregnancy data. 
Always consult with your healthcare provider for medical decisions.
Generated by Mamasafe assistant AI
    `;
}

// Download report helper function
function downloadReport(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update timestamp
function updateAITimestamp() {
    const timestampElement = document.getElementById('aiTimestamp');
    if (timestampElement) {
        const now = new Date();
        timestampElement.textContent = now.toLocaleString();
    }
}

// Export essential functions to global scope for HTML onclick handlers
window.navigateTo = navigateTo;
window.openPregnancyGuide = openPregnancyGuide;
window.closePregnancyGuide = closePregnancyGuide;

// Due Date Calculator function
window.calculateDueDate = function() {
    const lmp = document.getElementById('dueDateLMP');
    const cycleLength = document.getElementById('cycleLength');
    
    if (!lmp || !lmp.value) {
        alert('Please enter your last menstrual period date');
        return;
    }
    
    const cycleLengthValue = cycleLength ? parseInt(cycleLength.value) : 28;
    const lmpDate = new Date(lmp.value);
    const dueDate = new Date(lmpDate.getTime() + (280 + (cycleLengthValue - 28)) * 24 * 60 * 60 * 1000);
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
    if (summary) summary.textContent = `Based on your last menstrual period and a ${cycleLengthValue}-day cycle, this is your estimated due date.`;
    if (dueDateValue) dueDateValue.textContent = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (cycleNote) cycleNote.textContent = `Cycle length used: ${cycleLengthValue} days`;
    if (dueDateWeeks) dueDateWeeks.textContent = `${weeksPregnant} weeks`;
    if (dueDateTrimester) dueDateTrimester.textContent = trimester;
    if (dueDateMethod) dueDateMethod.textContent = `Estimated using 280 days plus a ${cycleLengthValue - 28 >= 0 ? '+' : ''}${cycleLengthValue - 28}-day cycle adjustment`;
    if (dueDateRange) dueDateRange.textContent = `Full-term birth often falls between ${earliestTerm.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} and ${latestTerm.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    if (resultDiv) {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// ADMIN PANEL CONTROLLER
const adminPanelState = {
    ready: false,
    authenticated: false,
    currentView: 'dashboard',
    users: [],
    dashboard: null,
    token: localStorage.getItem('adminToken') || null
};

function adminHasAuth() {
    const apiBase = getAdminApiBase();
    const needsToken = apiBase !== window.location.origin;
    return needsToken
        ? Boolean(adminPanelState.token)
        : Boolean(adminPanelState.authenticated || adminPanelState.token);
}

function adminSetNavEnabled(enabled) {
    document.querySelectorAll('.admin-nav').forEach((btn) => {
        btn.disabled = !enabled;
        btn.setAttribute('aria-disabled', String(!enabled));
    });
}

function adminHandleUnauthorized(message = 'Please sign in to continue.') {
    adminPanelState.authenticated = false;
    adminPanelState.token = null;
    localStorage.removeItem('adminToken');
    adminShowLogin();
    adminSetStatus(message, 'error');
}

function getAdminApiBase() {
    if (window.BACKEND_API && typeof window.BACKEND_API.getBaseUrl === 'function') {
        return window.BACKEND_API.getBaseUrl();
    }
    // On localhost, use localhost backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    // On production Firebase, use Render backend
    if (window.location.hostname.endsWith('.web.app') || window.location.hostname.includes('firebase') || window.location.hostname.includes('firebaseapp')) {
        return 'https://mamasafe1.onrender.com';
    }
    // On Render backend domain, use current origin
    return window.location.origin;
}

async function adminRequest(endpoint, options = {}) {
    const baseUrl = getAdminApiBase();
    const fullUrl = `${baseUrl}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    
    // Add JWT token if available (for cross-domain requests)
    if (adminPanelState.token && !headers.Authorization) {
        headers.Authorization = `Bearer ${adminPanelState.token}`;
    }
    
    let response;
    try {
        response = await fetch(fullUrl, {
            credentials: 'include',
            headers: headers,
            ...options
        });
    } catch (error) {
        throw new Error(`Admin backend is not reachable at ${baseUrl}. Start the backend server, then refresh the admin page.`);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        let authErrorMessage = '';
        // If we get 401 and we had a token, the token is likely expired - clear it
        if (response.status === 401 && endpoint !== '/api/admin-panel/login') {
            authErrorMessage = endpoint === '/api/admin-panel/me'
                ? ''
                : 'Admin session expired. Please sign in again.';
            adminHandleUnauthorized(authErrorMessage);
        }
        
        // Don't log 401 errors on /me endpoint - it's expected when not logged in
        if (!(response.status === 401 && endpoint === '/api/admin-panel/me')) {
            console.error(`[Admin API Error] ${response.status}: ${data.error || 'Unknown error'} at ${endpoint}`);
        }
        throw new Error(authErrorMessage || data.error || `Admin request failed (${response.status})`);
    }
    return data;
}

function adminUpdateLoginHint(message = '') {
    const hint = document.getElementById('adminLoginHint');
    if (!hint) return;
    hint.textContent = message || `Admin API: ${getAdminApiBase()} | default local login: mamasafeadmin / mamasafe123`;
}

async function adminCheckBackendStatus() {
    try {
        const response = await fetch(`${getAdminApiBase()}/api/health`, { headers: { Accept: 'application/json' } });
        const data = await response.json().catch(() => ({}));
        adminUpdateLoginHint(`Admin API ready at ${getAdminApiBase()} (${data.database?.mode || 'database'} mode).`);
        return true;
    } catch {
        adminUpdateLoginHint(`Admin API is not reachable at ${getAdminApiBase()}. Start the backend with npm start.`);
        return false;
    }
}

function initializeAdminPanel() {
    // Only initialize when the admin page is actually visible
    const adminSection = document.getElementById('admin');
    if (!adminSection || !adminSection.classList.contains('active')) {
        return;
    }

    adminShowLogin();
    adminUpdateLoginHint();
    adminCheckBackendStatus();

    if (adminPanelState.ready && !adminPanelState.token) {
        return;
    }

    adminPanelState.ready = true;

    if (!adminPanelState.token) {
        adminSetStatus('', '');
        return;
    }
    
    // Check whether the saved admin token is still valid.
    adminRequest('/api/admin-panel/me')
        .then((data) => {
            // User is logged in
            adminShowWorkspace(data.admin);
            adminSetStatus('Admin session loaded.', 'success');
            adminLoadDashboard();
        })
        .catch((error) => {
            // User is not logged in - show login form
            adminShowLogin();
            adminSetStatus('', '');
        });
}

function adminSetBackToLoginVisible(visible) {
    const backButton = document.getElementById('adminBackToMamasafeLogin');
    if (backButton) backButton.hidden = !visible;
}

function adminShowLogin(options = {}) {
    adminPanelState.authenticated = false;
    adminSetNavEnabled(false);
    const login = document.getElementById('adminLoginPanel');
    const workspace = document.getElementById('adminWorkspace');
    if (login) login.hidden = false;
    if (workspace) workspace.hidden = true;
    adminSetBackToLoginVisible(Boolean(options.showBackToLogin));
}

function adminShowWorkspace(admin) {
    adminPanelState.authenticated = true;
    adminSetNavEnabled(true);
    const login = document.getElementById('adminLoginPanel');
    const workspace = document.getElementById('adminWorkspace');
    if (login) login.hidden = true;
    if (workspace) workspace.hidden = false;
    adminSetBackToLoginVisible(false);
    const title = document.getElementById('adminPageTitle');
    if (title && admin?.name) title.textContent = `Welcome, ${admin.name}`;
}

function adminSetStatus(message, type = 'info') {
    const status = document.getElementById('adminStatus');
    if (!status) return;
    status.textContent = message || '';
    status.className = `admin-status ${message ? 'show' : ''} ${type}`;
}

async function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminEmail')?.value.trim();
    const password = document.getElementById('adminPassword')?.value;
    if (!username || !password) {
        adminSetStatus('Enter the admin username and password.', 'error');
        return;
    }
    try {
        adminSetStatus('Signing in...');
        const data = await adminRequest('/api/admin-panel/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (!data.token && getAdminApiBase() !== window.location.origin) {
            adminHandleUnauthorized('Admin login needs the latest backend deployment. Please redeploy the Render backend and try again.');
            return;
        }

        // Store signed token for cross-domain requests.
        adminPanelState.token = data.token || null;
        if (data.token) localStorage.setItem('adminToken', data.token);
        adminPanelState.authenticated = true;
        
        adminShowWorkspace(data.admin);
        adminSetStatus('Admin login successful.', 'success');
        adminSetView('dashboard');
        showNotification('Admin panel unlocked', 'success');
    } catch (error) {
        adminSetStatus(error.message, 'error');
        showNotification(error.message, 'error');
    }
}

async function adminLogout() {
    try {
        // Send logout request with current token
        await adminRequest('/api/admin-panel/logout', { method: 'POST', body: '{}' });
    } catch (error) {
        // Logout error is not critical - token will be cleared anyway
        console.warn('Admin logout notice:', error.message);
    }
    
    // Clear stored token after logout attempt
    adminPanelState.token = null;
    adminPanelState.authenticated = false;
    localStorage.removeItem('adminToken');
    
    adminShowLogin({ showBackToLogin: true });
    adminSetStatus('Logged out.', 'success');
}

function adminBackToMamasafeLogin() {
    adminPanelState.token = null;
    adminPanelState.authenticated = false;
    localStorage.removeItem('adminToken');
    adminSetStatus('', '');

    if (typeof navigateTo === 'function') {
        navigateTo('login', { skipAuthCheck: true });
    } else {
        window.location.href = 'index.html#login';
    }
}

function adminSetView(view) {
    if (!adminHasAuth()) {
        adminShowLogin();
        adminSetStatus('Please sign in before opening the admin panel.', 'error');
        return;
    }

    adminPanelState.currentView = view;
    document.querySelectorAll('.admin-nav').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.adminView === view);
    });
    document.querySelectorAll('.admin-view').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `adminView-${view}`);
    });
    const label = {
        dashboard: 'Admin Dashboard',
        users: 'User Management',
        ai: 'AI Chat Monitoring',
        help: 'Help Requests',
        emergency: 'Emergency Management',
        content: 'Content Management',
        notifications: 'Notifications & Announcements',
        reports: 'Reports & Analytics',
        settings: 'System Settings'
    }[view] || 'Admin Panel';
    const title = document.getElementById('adminPageTitle');
    if (title) title.textContent = label;
    adminLoadCurrentView();
}

function adminLoadCurrentView() {
    if (!adminHasAuth()) {
        adminShowLogin();
        adminSetStatus('Please sign in before loading admin data.', 'error');
        return;
    }

    const loaders = {
        dashboard: adminLoadDashboard,
        users: adminLoadUsers,
        ai: adminLoadAiChats,
        help: adminLoadHelpRequests,
        emergency: adminLoadEmergencies,
        content: adminLoadContent,
        notifications: () => adminSetStatus('Compose and send an announcement.', 'info'),
        reports: adminLoadReports,
        settings: () => adminSetStatus('System settings loaded.', 'success')
    };
    const loader = loaders[adminPanelState.currentView];
    if (loader) loader();
}

async function adminLoadDashboard() {
    try {
        adminSetStatus('Loading dashboard...');
        const data = await adminRequest('/api/admin-panel/dashboard');
        adminPanelState.dashboard = data;
        adminRenderStats(data.stats || {});
        adminRenderDashboardUsers(data.recentUsers || []);
        adminRenderFeed(data.recentEvents || data.recentActivity || []);
        adminSetStatus('Dashboard updated from MongoDB.', 'success');
    } catch (error) {
        adminSetStatus(error.message, 'error');
    }
}

function adminRenderStats(stats) {
    const target = document.getElementById('adminStats');
    if (!target) return;
    const cards = [
        ['Real Users', stats.realUsers ?? stats.createdUsers ?? stats.totalUsers ?? 0, 'Created accounts only'],
        ['Active Users', stats.activeUsers ?? stats.activeMothers ?? 0, 'Currently active accounts'],
        ['AI Chats', stats.aiChats || 0, 'Chatbot interactions'],
        ['Emergencies', stats.emergencyReports || stats.emergencies || 0, 'Safety signals'],
        ['Help Requests', stats.helpRequests || 0, 'Support queue'],
        ['Notifications', stats.notificationsSent || stats.notifications || 0, 'Messages sent']
    ];
    target.innerHTML = cards.map(([title, value, meta]) => `
        <article class="admin-stat-card">
            <span>${title}</span>
            <strong>${value}</strong>
            <small>${meta}</small>
        </article>
    `).join('');
}

function adminRenderDashboardUsers(users = []) {
    const target = document.getElementById('adminDashboardUsers');
    if (!target) return;
    const uniqueUsers = adminDedupeUsers(users).filter((user) => {
        const identity = adminUserIdentity(user);
        const status = String(identity.status || 'active').toLowerCase();
        return !['suspended', 'inactive', 'disabled', 'blocked', 'deleted', 'removed', 'archived'].includes(status);
    });

    if (!uniqueUsers.length) {
        target.innerHTML = '<p class="admin-empty">No active created users yet.</p>';
        return;
    }

    target.innerHTML = uniqueUsers.map((user) => {
        const identity = adminUserIdentity(user);
        const label = identity.name || identity.email || 'Mother';
        const meta = [identity.email, identity.stage, identity.pregnancyWeek && identity.pregnancyWeek !== '--' ? `week ${identity.pregnancyWeek}` : '']
            .filter(Boolean)
            .join(' · ');
        return `
            <div class="admin-feed-item">
                <strong>${escapeHTML(label)}</strong>
                <span>${escapeHTML(meta || 'Active account')}</span>
                <small>${escapeHTML(identity.status || 'active')} · joined ${adminFormatDate(identity.createdAt)}</small>
            </div>
        `;
    }).join('');
}

function adminRenderFeed(items) {
    const target = document.getElementById('adminActivityFeed');
    if (!target) return;
    if (!items.length) {
        target.innerHTML = '<p class="admin-empty">No recent activity recorded yet.</p>';
        return;
    }
    target.innerHTML = items.map((item) => `
        <div class="admin-feed-item">
            <strong>${escapeHTML(item.action || item.type || 'Activity')}</strong>
            <span>${escapeHTML(item.collection || item.userId || 'System')}</span>
            <small>${adminFormatDate(item.createdAt || item.savedAt)}</small>
        </div>
    `).join('');
}

async function adminLoadUsers() {
    try {
        adminSetStatus('Loading users...');
        const search = (document.getElementById('adminUserSearch')?.value || '').trim();
        const endpoint = search
            ? `/api/admin-panel/users?search=${encodeURIComponent(search)}`
            : '/api/admin-panel/users';
        const data = await adminRequest(endpoint);
        adminPanelState.users = adminDedupeUsers(data.users || []);
        adminRenderUsers(adminPanelState.users);
        adminSetStatus(`${adminPanelState.users.length} unique created user${adminPanelState.users.length === 1 ? '' : 's'} loaded.`, 'success');
    } catch (error) {
        adminSetStatus(error.message, 'error');
    }
}

function adminNormalizeUserEmail(value = '') {
    return String(value || '').trim().toLowerCase();
}

function adminNormalizeUserName(value = '') {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function adminUserIdentity(user = {}) {
    const identity = user.adminIdentity || {};
    const name = identity.name || user.name || user.displayName || user.username || user.profile?.name || 'Mother';
    const email = identity.email || user.email || user.userEmail || user.profile?.email || user.userId || '';
    return {
        id: identity.id || user._id || user.id || user.userId || email || '',
        name,
        email,
        stage: identity.stage || user.stage || user.journey || '--',
        pregnancyWeek: identity.pregnancyWeek || user.pregnancy_week || user.pregnancyWeek || '--',
        status: identity.status || user.status || 'active',
        createdAt: identity.createdAt || user.createdAt || user.savedAt,
        duplicateCount: identity.duplicateCount || 1
    };
}

function adminDedupeUsers(users = []) {
    const grouped = new Map();
    users.forEach((user) => {
        const identity = adminUserIdentity(user);
        const email = adminNormalizeUserEmail(identity.email);
        const name = adminNormalizeUserName(identity.name);
        const key = email ? `email:${email}` : name ? `name:${name}` : `id:${identity.id}`;
        const existing = grouped.get(key);
        if (!existing) {
            grouped.set(key, {
                ...user,
                adminIdentity: {
                    ...identity,
                    duplicateCount: identity.duplicateCount || 1
                }
            });
            return;
        }

        const existingIdentity = existing.adminIdentity || adminUserIdentity(existing);
        existing.adminIdentity = {
            ...existingIdentity,
            duplicateCount: (existingIdentity.duplicateCount || 1) + (identity.duplicateCount || 1),
            createdAt: [existingIdentity.createdAt, identity.createdAt]
                .filter(Boolean)
                .sort((left, right) => new Date(left) - new Date(right))[0] || existingIdentity.createdAt || identity.createdAt
        };
    });
    return [...grouped.values()];
}

function adminFilterUsers() {
    const query = (document.getElementById('adminUserSearch')?.value || '').toLowerCase();
    const filtered = adminPanelState.users.filter((user) => {
        const identity = adminUserIdentity(user);
        return [identity.name, identity.email, identity.status, identity.pregnancyWeek, identity.stage]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
    });
    adminRenderUsers(filtered);
}

function adminRenderUsers(users) {
    const target = document.getElementById('adminUsersTable');
    if (!target) return;
    if (!users.length) {
        target.innerHTML = '<p class="admin-empty">No created users matched.</p>';
        return;
    }
    target.innerHTML = `
        <table class="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Stage</th><th>Week</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
                ${users.map((user) => {
                    const identity = adminUserIdentity(user);
                    const id = identity.id || '';
                    const name = identity.name || 'Mother';
                    const email = identity.email || 'Unknown';
                    const stage = identity.stage || '--';
                    const week = identity.pregnancyWeek || '--';
                    const status = identity.status || 'active';
                    const duplicateNote = identity.duplicateCount > 1 ? ` (${identity.duplicateCount} merged records)` : '';
                    const encodedId = encodeURIComponent(id);
                    const encodedName = encodeURIComponent(name);
                    return `
                        <tr>
                            <td>${escapeHTML(name)}<small>${escapeHTML(duplicateNote)}</small></td>
                            <td>${escapeHTML(email)}</td>
                            <td>${escapeHTML(stage)}</td>
                            <td>${escapeHTML(week)}</td>
                            <td><span class="admin-pill ${status}">${escapeHTML(status)}</span></td>
                            <td>${adminFormatDate(identity.createdAt)}</td>
                            <td class="admin-actions">
                                <button type="button" class="admin-btn-small" onclick="adminEditUserModal('${encodedId}')">Edit</button>
                                <button type="button" class="admin-btn-small" onclick="adminToggleUserStatus('${encodedId}', '${encodeURIComponent(status)}')">${status === 'suspended' ? 'Activate' : 'Suspend'}</button>
                                <button type="button" class="admin-btn-small admin-btn-danger" onclick="adminDeleteUser('${encodedId}', '${encodedName}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

async function adminToggleUserStatus(id, currentStatus) {
    id = decodeURIComponent(id || '');
    currentStatus = decodeURIComponent(currentStatus || '');
    if (!id) return;
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
        await adminRequest(`/api/admin-panel/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: nextStatus })
        });
        showNotification(`User marked ${nextStatus}`, 'success');
        adminLoadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function adminEditUserModal(id) {
    id = decodeURIComponent(id || '');
    const user = adminPanelState.users.find((item) => {
        const identity = item.adminIdentity || {};
        return String(identity.id || item._id || item.id || item.userId || item.email || '') === String(id);
    });
    if (!user) {
        showNotification('User record not found in the current table.', 'error');
        return;
    }

    const identity = user.adminIdentity || {};
    const editor = document.getElementById('adminUserEditor');
    if (!editor) return;

    document.getElementById('adminEditUserId').value = identity.id || user._id || user.id || user.userId || user.email || '';
    document.getElementById('adminEditUserName').value = identity.name || user.name || '';
    document.getElementById('adminEditUserEmail').value = identity.email || user.email || user.userEmail || '';
    document.getElementById('adminEditUserStage').value = identity.stage || user.stage || user.journey || '';
    document.getElementById('adminEditUserWeek').value = identity.pregnancyWeek || user.pregnancy_week || user.pregnancyWeek || '';
    document.getElementById('adminEditUserStatus').value = identity.status || user.status || 'active';
    editor.hidden = false;
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function adminCancelUserEdit() {
    const editor = document.getElementById('adminUserEditor');
    if (editor) editor.hidden = true;
}

function adminSubmitUserEdit(event) {
    event.preventDefault();
    const id = document.getElementById('adminEditUserId')?.value;
    const name = document.getElementById('adminEditUserName')?.value.trim();
    const email = document.getElementById('adminEditUserEmail')?.value.trim();
    const stage = document.getElementById('adminEditUserStage')?.value.trim();
    const week = document.getElementById('adminEditUserWeek')?.value;
    const status = document.getElementById('adminEditUserStatus')?.value || 'active';
    adminUpdateUser(id, name, email, week, stage, status);
}

async function adminUpdateUser(id, name, email, week, stage = '', status = 'active') {
    if (!id) return;
    try {
        await adminRequest(`/api/admin-panel/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ 
                name: name, 
                email: email,
                userEmail: email,
                pregnancy_week: week,
                pregnancyWeek: week,
                stage,
                journey: stage,
                status
            })
        });
        showNotification('User updated successfully', 'success');
        adminCancelUserEdit();
        adminLoadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function adminDeleteUser(id, userName) {
    id = decodeURIComponent(id || '');
    userName = decodeURIComponent(userName || 'user');
    if (!id) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
        await adminRequest(`/api/admin-panel/users/${id}`, {
            method: 'DELETE'
        });
        showNotification(`User "${userName}" deleted successfully`, 'success');
        adminLoadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function adminLoadAiChats() {
    try {
        adminSetStatus('Loading AI chat logs...');
        const data = await adminRequest('/api/admin-panel/ai-chats');
        const target = document.getElementById('adminAiLogs');
        const chats = data.chats || [];
        if (!target) return;
        target.innerHTML = chats.length ? chats.map((chat) => {
            const question = chat.question || chat.message || chat.userMessage || 'AI interaction';
            const userLabel = chat.userName || chat.userEmail || chat.userId || 'Guest user';
            const source = chat.source ? ` · ${chat.source}` : '';
            const dangerous = /bleeding|pain|emergency|medicine|medication|dizzy|faint|headache|movement/i.test(question);
            return `
                <div class="admin-feed-item ${dangerous ? 'danger' : ''}">
                    <strong>${escapeHTML(question)}</strong>
                    <span>${escapeHTML(chat.response || chat.answer || 'Response saved in chat history')}</span>
                    <small>${escapeHTML(userLabel)}${escapeHTML(source)} · ${adminFormatDate(chat.createdAt || chat.savedAt || chat.timestamp)}</small>
                </div>
            `;
        }).join('') : '<p class="admin-empty">No AI chat history is stored yet.</p>';
        adminSetStatus('AI logs loaded.', 'success');
    } catch (error) {
        adminSetStatus(error.message, 'error');
    }
}

async function adminLoadHelpRequests() {
    try {
        adminSetStatus('Loading help requests...');
        const data = await adminRequest('/api/admin-panel/help-requests');
        const requests = data.requests || [];
        const target = document.getElementById('adminHelpRequests');
        if (!target) return;
        target.innerHTML = requests.length ? `
            <table class="admin-table">
                <thead><tr><th>User</th><th>Issue</th><th>Urgency</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                    ${requests.map((request) => `
                        <tr>
                            <td>${escapeHTML(request.name || request.userId || 'Mother')}</td>
                            <td>${escapeHTML(request.problem || request.issue || request.message || 'Support request')}</td>
                            <td><span class="admin-pill ${String(request.urgency || 'normal').toLowerCase()}">${escapeHTML(request.urgency || 'Normal')}</span></td>
                            <td>${escapeHTML(request.status || 'Pending')}</td>
                            <td>${adminFormatDate(request.createdAt || request.savedAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p class="admin-empty">No help requests have been submitted yet.</p>';
        adminSetStatus('Help requests loaded.', 'success');
    } catch (error) {
        adminSetStatus(error.message, 'error');
    }
}

async function adminLoadEmergencies() {
    await adminLoadHelpRequests();
    const target = document.getElementById('adminEmergencyList');
    try {
        const data = await adminRequest('/api/admin-panel/events');
        const items = (data.events || []).filter((event) => /emergency|urgent|bleeding|pain|ambulance/i.test(JSON.stringify(event))).slice(0, 12);
        if (!target) return;
        target.innerHTML = items.length ? items.map((item) => `
            <div class="admin-feed-item danger">
                <strong>${escapeHTML(item.action || item.type || 'Emergency signal')}</strong>
                <span>${escapeHTML(item.userId || item.collection || 'System')}</span>
                <small>${adminFormatDate(item.createdAt || item.savedAt)}</small>
            </div>
        `).join('') : '<p class="admin-empty">No emergency signals recorded.</p>';
    } catch (error) {
        adminSetStatus(error.message, 'error');
    }
}

function adminLoadContent() {
    const target = document.getElementById('adminContentList');
    if (!target) return;
    const drafts = JSON.parse(localStorage.getItem('adminArticleDrafts') || '[]');
    target.innerHTML = drafts.length ? drafts.map((draft) => `
        <div class="admin-feed-item">
            <strong>${escapeHTML(draft.title)}</strong>
            <span>${escapeHTML(draft.category)}</span>
            <small>${adminFormatDate(draft.createdAt)}</small>
        </div>
    `).join('') : '<p class="admin-empty">No admin article drafts yet.</p>';
    adminSetStatus('Content manager ready.', 'success');
}

async function adminSaveContent(event) {
    event.preventDefault();
    const draft = {
        title: document.getElementById('adminArticleTitle')?.value.trim(),
        category: document.getElementById('adminArticleCategory')?.value,
        content: document.getElementById('adminArticleContent')?.value.trim(),
        createdAt: new Date().toISOString()
    };
    const drafts = JSON.parse(localStorage.getItem('adminArticleDrafts') || '[]');
    drafts.unshift(draft);
    localStorage.setItem('adminArticleDrafts', JSON.stringify(drafts.slice(0, 20)));
    event.target.reset();
    adminLoadContent();
    if (window.DB_SYNC && typeof window.DB_SYNC.saveActivity === 'function') {
        window.DB_SYNC.saveActivity({ type: 'admin-content', id: `article-${Date.now()}`, label: draft.title, category: draft.category });
    }
    showNotification('Article draft saved', 'success');
}

async function adminSendNotification(event) {
    event.preventDefault();
    const payload = {
        title: document.getElementById('adminNoticeTitle')?.value.trim(),
        message: document.getElementById('adminNoticeMessage')?.value.trim(),
        audience: document.getElementById('adminNoticeAudience')?.value || 'all'
    };
    try {
        const result = await adminRequest('/api/admin-panel/notifications', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        addAppNotification(payload.message, payload.audience === 'emergency' ? 'emergency' : 'admin-notification', {
            title: payload.title || 'Mamasafe announcement',
            source: 'admin',
            sourceId: `admin-local:${result.notification?._id || result._id || Date.now()}`,
            fullMessage: payload.message
        });
        event.target.reset();
        showNotification('Notification sent and stored in MongoDB', 'success');
        adminSetStatus('Notification sent.', 'success');
        if (adminPanelState.currentView === 'dashboard') adminLoadDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
        adminSetStatus(error.message, 'error');
    }
}

function adminLoadReports() {
    if (adminPanelState.dashboard?.stats) {
        const reports = document.getElementById('adminReportsGrid');
        if (reports) {
            reports.innerHTML = Object.entries(adminPanelState.dashboard.stats).map(([key, value]) => `
                <article class="admin-stat-card">
                    <span>${escapeHTML(key.replace(/([A-Z])/g, ' $1'))}</span>
                    <strong>${value}</strong>
                    <small>Current total</small>
                </article>
            `).join('');
        }
        adminDrawMiniChart(adminPanelState.dashboard.stats);
    } else {
        adminLoadDashboard().then(adminLoadReports);
    }
}

function adminDrawMiniChart(stats) {
    const canvas = document.getElementById('adminMiniChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const entries = Object.entries(stats).slice(0, 6);
    const max = Math.max(...entries.map(([, value]) => Number(value) || 0), 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    entries.forEach(([key, value], index) => {
        const x = 45 + index * 135;
        const height = ((Number(value) || 0) / max) * 160 + 10;
        ctx.fillStyle = ['#2f80ed', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index];
        ctx.fillRect(x, 210 - height, 70, height);
        ctx.fillStyle = '#243447';
        ctx.font = '14px Arial';
        ctx.fillText(String(value), x + 20, 190 - height);
        ctx.font = '12px Arial';
        ctx.fillText(key.replace(/([A-Z])/g, ' $1').slice(0, 14), x - 12, 235);
    });
}

function adminExportReport() {
    const report = {
        exportedAt: new Date().toISOString(),
        dashboard: adminPanelState.dashboard,
        users: adminPanelState.users
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mamasafe-admin-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function adminFormatDate(value) {
    if (!value) return 'Not recorded';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

// Export new functions to global scope
window.initializeHomeFeatures = initializeHomeFeatures;
window.homeUpdateJourneyPreview = homeUpdateJourneyPreview;
window.homeStartJourney = homeStartJourney;
window.openHomeHealthAI = openHomeHealthAI;
window.homeSaveChecklist = homeSaveChecklist;
window.homeLoadChecklist = homeLoadChecklist;
window.homeUpdateSyncStatus = homeUpdateSyncStatus;
window.initializeAdminPanel = initializeAdminPanel;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.adminBackToMamasafeLogin = adminBackToMamasafeLogin;
window.adminSetView = adminSetView;
window.adminLoadCurrentView = adminLoadCurrentView;
window.adminFilterUsers = adminFilterUsers;
window.adminToggleUserStatus = adminToggleUserStatus;
window.adminSetBackToLoginVisible = adminSetBackToLoginVisible;
window.adminEditUserModal = adminEditUserModal;
window.adminUpdateUser = adminUpdateUser;
window.adminDeleteUser = adminDeleteUser;
window.adminCancelUserEdit = adminCancelUserEdit;
window.adminSubmitUserEdit = adminSubmitUserEdit;
window.adminSendNotification = adminSendNotification;
window.adminSaveContent = adminSaveContent;
window.adminExportReport = adminExportReport;
