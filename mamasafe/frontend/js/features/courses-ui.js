/**
 * Mamasafe Advanced Course Intelligence UI v3.0
 * High-performance, AI-integrated course rendering system.
 */

class CoursesAdvancedUI {
    constructor() {
        this.filters = {
            query: '',
            category: 'all',
            stage: 'all',
            sort: 'recommended',
            view: 'grid'
        };
        this.init();
    }

    init() {
        this.injectStyles();
        console.log('Mamasafe Course Intelligence UI initialized.');
    }

    injectStyles() {
        if (document.getElementById('courses-advanced-styles')) return;
        const style = document.createElement('style');
        style.id = 'courses-advanced-styles';
        style.textContent = `
            .course-overlay {
                position: fixed; inset: 0; z-index: 10000;
                background: rgba(2, 6, 23, 0.9);
                backdrop-filter: blur(30px);
                display: flex; align-items: center; justify-content: center;
                padding: 20px; animation: courseFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .course-modal-premium {
                background: #0f172a; width: 100%; max-width: 1000px;
                max-height: 90vh; overflow-y: auto;
                border-radius: 40px; border: 1px solid rgba(255,255,255,0.05);
                box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.7);
                position: relative; animation: courseModalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                color: white;
            }
            .course-modal-header {
                padding: 40px 48px 24px; border-bottom: 1px solid rgba(255,255,255,0.03);
                display: flex; justify-content: space-between; align-items: center;
                position: sticky; top: 0; z-index: 20; background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(20px);
            }
            .course-modal-body { padding: 48px; }
            .course-btn-close {
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                color: white; width: 44px; height: 44px; border-radius: 12px;
                cursor: pointer; font-size: 24px; transition: all 0.3s;
                display: flex; align-items: center; justify-content: center;
            }
            .course-btn-close:hover { background: rgba(255,255,255,0.1); transform: rotate(90deg); }
            
            .course-module-card {
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.05);
                padding: 32px; border-radius: 32px; margin-bottom: 32px;
                transition: transform 0.4s ease;
            }
            .course-module-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.03); }
            
            .course-section-title {
                font-size: 11px; font-weight: 900; color: #667eea;
                text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px;
            }
            
            .course-lesson-content {
                color: rgba(255,255,255,0.8); line-height: 1.8; font-size: 17px;
            }
            
            .course-takeaway-box {
                background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1));
                border: 1px solid rgba(99,102,241,0.2);
                padding: 32px; border-radius: 28px; margin: 32px 0;
            }
            
            .course-loader {
                width: 60px; height: 60px; border: 3px solid rgba(99,102,241,0.1);
                border-top-color: #667eea; border-radius: 50%;
                animation: courseSpin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            }
            
            @keyframes courseFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes courseModalSlideUp { from { transform: translateY(50px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            @keyframes courseSpin { to { transform: rotate(360deg); } }
            
            .path-card {
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 32px; padding: 24px; display: flex; gap: 24px; align-items: center;
                transition: all 0.3s ease; margin-bottom: 16px; cursor: pointer;
            }
            .path-card:hover { background: rgba(255,255,255,0.06); border-color: #667eea; transform: scale(1.02); }
            
            .path-icon {
                width: 70px; height: 70px; background: rgba(99,102,241,0.1);
                border-radius: 20px; display: flex; align-items: center; justify-content: center;
                font-size: 36px;
            }
            
            .course-main-card {
                background: rgba(255, 255, 255, 0.01);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 40px;
                padding: 40px;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                cursor: pointer;
                position: relative;
                overflow: hidden;
                perspective: 1000px;
            }
            .course-main-card::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.1), transparent 70%);
                opacity: 0;
                transition: opacity 0.5s;
            }
            .course-main-card:hover {
                transform: translateY(-12px) rotateX(4deg) rotateY(-4deg);
                background: rgba(255, 255, 255, 0.03);
                border-color: rgba(99, 102, 241, 0.3);
                box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.6);
            }
            .course-main-card:hover::before { opacity: 1; }
            
            .course-card-tag {
                background: rgba(99, 102, 241, 0.1);
                color: #818cf8;
                padding: 8px 16px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .course-card-icon {
                font-size: 56px;
                margin-bottom: 32px;
                filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .course-main-card:hover .course-card-icon {
                transform: translateZ(30px) scale(1.1);
            }

            .course-card-progress {
                margin-top: 32px;
                padding-top: 32px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .progress-ring-mini {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: conic-gradient(#667eea var(--progress), rgba(255,255,255,0.05) 0);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 900;
                color: white;
                position: relative;
            }
            .progress-ring-mini::after {
                content: '';
                position: absolute;
                inset: 3px;
                background: #0f172a;
                border-radius: 50%;
                z-index: -1;
            }

            /* AI Chatbot Styles */
            .topic-chatbot-container {
                margin-top: 64px;
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 32px;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            .chat-header {
                padding: 24px 32px;
                background: rgba(99, 102, 241, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .chat-messages {
                height: 300px;
                overflow-y: auto;
                padding: 32px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                scroll-behavior: smooth;
            }
            .chat-message {
                max-width: 85%;
                padding: 16px 24px;
                border-radius: 20px;
                font-size: 16px;
                line-height: 1.6;
                animation: chatMessageFade 0.3s ease-out;
            }
            .message-ai {
                align-self: flex-start;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.9);
                border-bottom-left-radius: 4px;
            }
            .message-user {
                align-self: flex-end;
                background: #667eea;
                color: white;
                border-bottom-right-radius: 4px;
            }
            .chat-input-area {
                padding: 24px 32px;
                background: rgba(255, 255, 255, 0.02);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                gap: 16px;
            }
            .chat-input {
                flex: 1;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 14px 20px;
                color: white;
                outline: none;
                transition: all 0.3s;
            }
            .chat-input:focus {
                border-color: #667eea;
                background: rgba(255, 255, 255, 0.05);
            }
            .chat-send-btn {
                background: #667eea;
                color: white;
                border: none;
                width: 48px;
                height: 48px;
                border-radius: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            .chat-send-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
            }
            @keyframes chatMessageFade {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    openModal(title, subtitle, contentHtml) {
        const existing = document.querySelector('.course-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'course-overlay';
        overlay.innerHTML = `
            <div class="course-modal-premium">
                <div class="course-modal-header">
                    <div>
                        <div style="font-size: 11px; font-weight: 900; color: #667eea; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">MAMASAFE LEARNING SYMPHONY</div>
                        <h3 style="margin: 0; font-size: 32px; font-weight: 950; letter-spacing: 0;">${title}</h3>
                        ${subtitle ? `<p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.4); font-size: 14px;">${subtitle}</p>` : ''}
                    </div>
                    <button class="course-btn-close" onclick="this.closest('.course-overlay').remove()">×</button>
                </div>
                <div id="activeCourseModalBody" class="course-modal-body">
                    ${contentHtml}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { e.target === overlay && overlay.remove(); });
    }

    showLoading(message) {
        return `
            <div style="text-align: center; padding: 80px 0;">
                <div class="course-loader" style="margin: 0 auto 32px;"></div>
                <p style="color: rgba(255,255,255,0.5); font-weight: 700; font-size: 18px; letter-spacing: 1px;">${message || 'SYNTHESIZING KNOWLEDGE NODES...'}</p>
            </div>
        `;
    }

    renderLesson(lesson, topic, courseId, courseColor) {
        const esc = (t) => String(t || '').replace(/</g, '&lt;');
        
        let detailedHtml = '';
        if (topic.detailedContent && topic.detailedContent.length > 0) {
            detailedHtml = topic.detailedContent.map(section => `
                <div class="educational-section" style="margin-bottom: 48px; padding-left: 24px; border-left: 2px solid ${courseColor || '#667eea'};">
                    <h4 style="font-size: 24px; font-weight: 850; color: white; margin-bottom: 16px; letter-spacing: 0;">${esc(section.heading)}</h4>
                    <p style="font-size: 18px; line-height: 1.8; color: rgba(255,255,255,0.7); font-weight: 400;">${esc(section.body)}</p>
                </div>
            `).join('');
        }

        return `
            <div class="course-lesson-content">
                <div style="background: rgba(255,255,255,0.03); padding: 40px; border-radius: 32px; margin-bottom: 56px; border: 1px solid rgba(255,255,255,0.05); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; padding: 12px 24px; background: ${courseColor || '#667eea'}; color: white; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; border-bottom-left-radius: 20px;">CORE INSIGHT</div>
                    <div class="course-section-title">Topic Synopsis</div>
                    <p style="font-size: 22px; line-height: 1.6; color: white; margin: 0; font-weight: 600; letter-spacing: 0;">${esc(topic.quickNotes)}</p>
                </div>

                <div class="course-section-title" style="margin-bottom: 40px; font-size: 13px; color: ${courseColor || '#667eea'};">Advanced Educational Modules</div>
                
                ${detailedHtml}

                <div class="course-section-title" style="margin-top: 64px; margin-bottom: 32px;">AI-Synthesized Deep Insights</div>
                <div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="font-size: 19px; line-height: 1.8; color: rgba(255,255,255,0.5); margin-bottom: 40px; font-style: italic;">"${esc(lesson.summary)}"</p>
                    
                    ${(lesson.sections || []).map(s => `
                        <div style="margin-bottom: 32px;">
                            <div class="course-section-title" style="font-size: 10px; opacity: 0.6;">${esc(s.heading)}</div>
                            <div style="font-size: 17px; color: rgba(255,255,255,0.8); line-height: 1.7;">${esc(s.content).replace(/\n/g, '<br>')}</div>
                        </div>
                    `).join('')}
                    
                    <div class="course-takeaway-box" style="margin-top: 48px;">
                        <div class="course-section-title" style="color: #43e97b;">Neural Takeaways</div>
                        <ul style="margin: 0; padding-left: 20px; display: grid; gap: 16px;">
                            ${(lesson.keyTakeaways || []).map(t => `<li style="color: rgba(255,255,255,0.9); font-size: 16px;">${esc(t)}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- AI Topic Chatbot -->
                <div class="topic-chatbot-container">
                    <div class="chat-header">
                        <div style="font-size: 24px;">🤖</div>
                        <div>
                            <div style="font-size: 11px; font-weight: 900; color: #667eea; text-transform: uppercase; letter-spacing: 2px;">Neural Chatbot</div>
                            <div style="font-size: 14px; font-weight: 700; color: white;">Ask about ${esc(topic.title)}</div>
                        </div>
                    </div>
                    <div id="topicChatMessages" class="chat-messages">
                        <div class="chat-message message-ai">
                            Hello! I'm your Mamasafe assistant AI. Do you have any specific questions about <strong>${esc(topic.title)}</strong>? I'm here to provide more data or clarify any of the notes above.
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" id="topicChatInput" class="chat-input" placeholder="Type your question here..." onkeypress="if(event.key === 'Enter') window.coursesAdvancedUI.handleChatSubmit('${esc(courseId)}', ${topic.id})">
                        <button class="chat-send-btn" onclick="window.coursesAdvancedUI.handleChatSubmit('${esc(courseId)}', ${topic.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async handleChatSubmit(courseId, topicId) {
        const input = document.getElementById('topicChatInput');
        const container = document.getElementById('topicChatMessages');
        const question = input.value.trim();
        
        if (!question || !window.courseManager) return;
        
        const course = window.courseManager.getCourseById(courseId);
        const topic = course?.topics?.find(t => t.id === topicId);
        
        // Add user message to UI
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message message-user';
        userMsg.textContent = question;
        container.appendChild(userMsg);
        
        input.value = '';
        container.scrollTop = container.scrollHeight;
        
        // Add loading state
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'chat-message message-ai';
        loadingMsg.innerHTML = '<span class="course-loader" style="width: 15px; height: 15px; border-width: 2px; display: inline-block;"></span> Syncing with Llama 3.3 70B...';
        container.appendChild(loadingMsg);
        container.scrollTop = container.scrollHeight;

        try {
            const context = `Topic: ${topic.title}. Course: ${course.title}. Quick Notes: ${topic.quickNotes}`;
            const data = await window.courseManager.fetchExpertAnswer(question, context);
            
            loadingMsg.innerHTML = data.answer.replace(/\n/g, '<br>');
        } catch (e) {
            loadingMsg.innerHTML = `<span style="color: #ff6b9d;">Sync failed: ${e.message}</span>`;
        }
        container.scrollTop = container.scrollHeight;
    }

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    bindCoursePageControls() {
        const root = document.getElementById('courses');
        if (!root || root.dataset.coursesControlsBound === 'true') return;

        root.dataset.coursesControlsBound = 'true';

        const updateAndRender = () => {
            this.readFiltersFromControls();
            this.renderCourseGrid();
        };

        const searchInput = document.getElementById('courseSearchInput');
        searchInput?.addEventListener('input', updateAndRender);

        ['courseCategoryFilter', 'courseStageFilter', 'courseSortSelect'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', updateAndRender);
        });

        const gridBtn = document.getElementById('courseViewGrid');
        const listBtn = document.getElementById('courseViewList');
        const setView = (view) => {
            this.filters.view = view;
            gridBtn?.classList.toggle('active', view === 'grid');
            listBtn?.classList.toggle('active', view === 'list');
            document.getElementById('freeCoursesGrid')?.classList.toggle('is-list', view === 'list');
            this.renderCourseGrid();
        };

        gridBtn?.addEventListener('click', () => setView('grid'));
        listBtn?.addEventListener('click', () => setView('list'));

        const stageFilter = document.getElementById('courseStageFilter');
        const assessmentStage = document.getElementById('assessmentStage');
        stageFilter?.addEventListener('change', () => {
            if (assessmentStage && stageFilter.value !== 'all') {
                assessmentStage.value = stageFilter.value;
            }
        });
        assessmentStage?.addEventListener('change', () => {
            if (stageFilter && stageFilter.value !== assessmentStage.value) {
                stageFilter.value = assessmentStage.value;
            }
            updateAndRender();
        });
    }

    readFiltersFromControls() {
        const val = (id, fallback = '') => document.getElementById(id)?.value || fallback;

        this.filters.query = val('courseSearchInput').trim().toLowerCase();
        this.filters.category = val('courseCategoryFilter', 'all');
        this.filters.stage = val('courseStageFilter', 'all');
        this.filters.sort = val('courseSortSelect', 'recommended');
        this.filters.view = document.getElementById('freeCoursesGrid')?.classList.contains('is-list') ? 'list' : 'grid';
    }

    getStageCourseIds(stage) {
        const map = {
            planning: ['nutrition'],
            pregnancy: ['nutrition'],
            postpartum: ['nutrition'],
            baby: ['nutrition']
        };

        return map[stage] || [];
    }

    getFilteredCourses() {
        if (!window.courseManager) return [];

        this.readFiltersFromControls();

        let courses = [...window.courseManager.getAllCourses()];
        const { query, category, stage, sort } = this.filters;

        if (category !== 'all') {
            courses = courses.filter(course => course.category === category);
        }

        if (stage !== 'all') {
            const stageIds = this.getStageCourseIds(stage);
            courses = courses.filter(course => stageIds.includes(course.id));
        }

        if (query) {
            courses = courses.filter(course => {
                const searchable = [
                    course.title,
                    course.description,
                    course.category,
                    course.level,
                    ...(course.topics || []).flatMap(topic => [topic.title, topic.quickNotes])
                ].join(' ').toLowerCase();

                return searchable.includes(query);
            });
        }

        const progressFor = (course) => window.courseManager.getCourseProgress(course.id).progress || 0;
        const stageOrder = this.getStageCourseIds(stage === 'all' ? window.courseManager.state.currentStage : stage);

        courses.sort((a, b) => {
            if (sort === 'progress') return progressFor(b) - progressFor(a);
            if (sort === 'topics') return (b.topics?.length || 0) - (a.topics?.length || 0);
            if (sort === 'az') return a.title.localeCompare(b.title);

            const aIndex = stageOrder.indexOf(a.id);
            const bIndex = stageOrder.indexOf(b.id);
            return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        });

        return courses;
    }

    initializePage() {
        this.bindCoursePageControls();
        this.renderCourseGrid();
        this.renderNeuralPath();
        window.updateEnrolledCoursesList?.();
        window.updateLearningStats?.();
        window.refreshDailyTip?.();
    }

    renderCourseGrid() {
        const grid = document.getElementById('freeCoursesGrid');
        if (!grid || !window.courseManager) return;

        const courses = this.getFilteredCourses();
        grid.classList.toggle('is-list', this.filters.view === 'list');

        if (!courses.length) {
            grid.innerHTML = `
                <div class="course-empty-state">
                    <strong>No courses match that view.</strong>
                    <span>Try a different category, stage, or search term.</span>
                </div>
            `;
            return;
        }

        grid.innerHTML = courses.map(course => {
            const p = window.courseManager.getCourseProgress(course.id);
            const progress = p.progress || 0;
            const isEnrolled = window.courseManager.isEnrolled(course.id);
            const completedTopics = p.completedTopics?.length || 0;
            const nextLabel = isEnrolled ? (progress >= 100 ? 'Review Course' : 'Continue') : 'Unlock Course';
            const safeId = this.escapeHtml(course.id);
            
            return `
                <div class="course-main-card" onclick="showCourseDetail('${safeId}')" onmousemove="window.coursesAdvancedUI.handleCardMouse(event, this)">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                        <div class="course-card-icon">${course.thumbnail}</div>
                        <span class="course-card-tag">${this.escapeHtml(course.category)}</span>
                    </div>
                    
                    <h3 style="font-size: 24px; font-weight: 900; color: white; margin-bottom: 12px; letter-spacing: 0;">${this.escapeHtml(course.title)}</h3>
                    <p style="color: rgba(255,255,255,0.5); font-size: 16px; line-height: 1.6; margin-bottom: 32px; height: 50px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${this.escapeHtml(course.description)}
                    </p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 11px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Level</span>
                            <span style="font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.62);">${this.escapeHtml(course.level)}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; text-align: right;">
                            <span style="font-size: 11px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Topics</span>
                            <span style="font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.62);">${completedTopics}/${course.topics.length} done</span>
                        </div>
                    </div>

                    <div class="course-card-progress">
                        <div class="progress-ring-mini" style="--progress: ${progress}%">${Math.round(progress)}%</div>
                        <div style="flex: 1;">
                            <div style="font-size: 11px; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 1px;">${isEnrolled ? 'Unlocked' : 'Available'}</div>
                            <div style="font-size: 13px; color: rgba(255,255,255,0.5);">${nextLabel}</div>
                        </div>
                        <button class="course-card-action" type="button" onclick="event.stopPropagation(); ${isEnrolled ? `continueCourse('${safeId}')` : `enrollInCourse('${safeId}')`};">${nextLabel}</button>
                    </div>

                    <div class="course-topic-preview">
                        ${(course.topics || []).slice(0, 2).map(topic => `
                            <div>
                                <span>${this.escapeHtml(topic.duration)}</span>
                                <strong>${this.escapeHtml(topic.title)}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

     handleCardMouse(e, card) {
         const rect = card.getBoundingClientRect();
         const x = e.clientX - rect.left;
         const y = e.clientY - rect.top;
         card.style.setProperty('--mouse-x', `${x}px`);
         card.style.setProperty('--mouse-y', `${y}px`);
     }

     getResourceGuide(key) {
         const guides = {
             nutrition: {
                 title: 'Nutrition Guidance Studio',
                 subtitle: 'Food, hydration, supplements, and meal planning',
                 accent: '#00d4aa',
                 courseIds: ['nutrition'],
                 defaultQuestion: 'Build a simple pregnancy nutrition plan with meals, hydration, and questions to ask my clinician.',
                 summary: 'Turn pregnancy and breastfeeding nutrition into practical daily choices without getting buried in advice.',
                 sections: [
                     {
                         title: 'Core priorities',
                         items: ['Prenatal vitamin routine', 'Iron, folate, calcium, protein, and DHA awareness', 'Balanced meals with fiber and steady energy']
                     },
                     {
                         title: 'Food safety review',
                         items: ['Review raw or undercooked foods', 'Limit high-mercury fish', 'Check labels for pasteurization and caffeine']
                     },
                     {
                         title: 'Meal planning moves',
                         items: ['Plan two easy breakfasts', 'Prep protein-rich snacks', 'Keep a hydration bottle visible']
                     }
                 ],
                 quickActions: ['Create a 3-day meal plan', 'Explain foods to avoid', 'Suggest nausea-friendly snacks']
             },
             exercise: {
                 title: 'Exercise Guidance Studio',
                 subtitle: 'Safe movement, trimester routines, and recovery prep',
                 accent: '#00b894',
                 courseIds: ['exercise-guidance'],
                 defaultQuestion: 'Create a safe weekly pregnancy movement routine for my stage, with stop signals and modifications.',
                 summary: 'Build a movement plan that is supportive, flexible, and easy to scale by trimester.',
                 sections: [
                     {
                         title: 'Movement foundations',
                         items: ['Warm up and cool down', 'Use comfortable effort', 'Prioritize hydration and breath']
                     },
                     {
                         title: 'Routine ideas',
                         items: ['Walking or swimming', 'Gentle prenatal yoga', 'Light strength and mobility']
                     },
                     {
                         title: 'Pause and call',
                         items: ['Bleeding or fluid leakage', 'Chest pain, dizziness, or severe headache', 'Painful contractions or unusual shortness of breath']
                     }
                 ],
                 quickActions: ['Build my weekly workout', 'Modify for third trimester', 'Explain when to stop exercising']
             },
             warning: {
                 title: 'Warning Signs Action Guide',
                 subtitle: 'Know what to watch for and when to seek care',
                 accent: '#ff6b9d',
                 courseIds: ['warning-signs'],
                 defaultQuestion: 'Help me create a calm warning-sign action plan with emergency contacts, symptoms to track, and what to say when I call.',
                 summary: 'Create a clear plan for symptoms, contacts, and next steps before a stressful moment happens.',
                 urgent: 'If symptoms feel severe, sudden, or urgent, contact your healthcare provider or emergency services now.',
                 sections: [
                     {
                         title: 'Urgent symptoms',
                         items: ['Heavy bleeding', 'Severe abdominal pain', 'Severe headache, vision changes, or sudden swelling']
                     },
                     {
                         title: 'Baby movement',
                         items: ["Know your baby's usual pattern", 'Call if movement changes meaningfully', 'Do not wait if your instinct says something is wrong']
                     },
                     {
                         title: 'Call-ready details',
                         items: ['Pregnancy week', 'Symptoms and timing', 'Medications, allergies, and care team number']
                     }
                 ],
                 quickActions: ['Make my emergency call script', 'Explain urgent symptoms', 'Create my contact checklist']
             },
             articles: {
                 title: 'Articles and Videos Library',
                 subtitle: 'Curated learning paths for busy parents',
                 accent: '#ff9800',
                 courseIds: ['sleep-science', 'mental-health'],
                 defaultQuestion: 'Build a weekly learning playlist with articles and videos for pregnancy, recovery, sleep, feeding support, and maternal wellness.',
                 summary: 'Turn articles and videos into a focused learning routine with notes, next actions, and related courses.',
                 sections: [
                     {
                         title: 'Featured paths',
                         items: ['Pregnancy week by week', 'Breastfeeding support', 'Postpartum recovery and support']
                     },
                     {
                         title: 'How to learn faster',
                         items: ['Pick one topic each week', 'Save two action steps', 'Bring questions to appointments']
                     },
                     {
                         title: 'Content quality check',
                         items: ['Look for practical, balanced advice', 'Avoid extreme claims', 'Use clinician guidance for personal medical decisions']
                     }
                 ],
                 quickActions: ['Build my playlist', 'Summarize recovery basics', 'Create a postpartum learning plan']
             }
         };

         return guides[key] || guides.articles;
     }

     openResourceGuide(key) {
         const guide = this.getResourceGuide(key);
         this.openModal(guide.title, guide.subtitle, this.renderResourceGuide(key));
     }

     renderResourceGuide(key) {
         const guide = this.getResourceGuide(key);
         const selectedStage = window.courseManager?.state?.currentStage || 'pregnancy';
         const relatedCourses = (guide.courseIds || [])
             .map(id => window.courseManager?.getCourseById(id))
             .filter(Boolean);

         return `
             <div class="resource-guide-pro" style="--resource-accent: ${guide.accent};">
                 <div class="resource-guide-hero">
                     <div>
                         <div class="course-section-title">Guided Resource</div>
                         <h3>${this.escapeHtml(guide.title)}</h3>
                         <p>${this.escapeHtml(guide.summary)}</p>
                     </div>
                     <label>
                         Stage
                         <select id="resourceStage-${key}">
                             <option value="planning" ${selectedStage === 'planning' ? 'selected' : ''}>Planning</option>
                             <option value="pregnancy" ${selectedStage === 'pregnancy' ? 'selected' : ''}>Pregnancy</option>
                             <option value="postpartum" ${selectedStage === 'postpartum' ? 'selected' : ''}>Postpartum</option>
                             <option value="family" ${selectedStage === 'family' ? 'selected' : ''}>Family support</option>
                         </select>
                     </label>
                 </div>

                 ${guide.urgent ? `<div class="resource-urgent-strip">${this.escapeHtml(guide.urgent)}</div>` : ''}

                 <div class="resource-guide-grid">
                     ${guide.sections.map(section => `
                         <div class="resource-guide-card">
                             <h4>${this.escapeHtml(section.title)}</h4>
                             <ul>
                                 ${section.items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('')}
                             </ul>
                         </div>
                     `).join('')}
                 </div>

                 <div class="resource-related-block">
                     <div class="course-section-title">Connected Courses</div>
                     <div class="resource-course-strip">
                         ${relatedCourses.map(course => `
                             <div class="resource-course-mini">
                                 <span>${course.thumbnail}</span>
                                 <div>
                                     <strong>${this.escapeHtml(course.title)}</strong>
                                     <small>${this.escapeHtml(course.category)} - ${course.topics.length} topics</small>
                                 </div>
                                 <button onclick="showCourseDetail('${this.escapeHtml(course.id)}')">Open</button>
                             </div>
                         `).join('')}
                     </div>
                 </div>

                 <div class="resource-ai-box">
                     <div>
                         <div class="course-section-title">Mamasafe assistant AI Helper</div>
                         <h4>Ask for a personalized guide</h4>
                     </div>
                     <div class="resource-prompt-row">
                         ${guide.quickActions.map(prompt => `
                             <button type="button" onclick="setResourcePrompt('${key}', '${this.escapeHtml(prompt)}')">${this.escapeHtml(prompt)}</button>
                         `).join('')}
                     </div>
                     <textarea id="resourceQuestion-${key}" rows="4" placeholder="Ask a question or use a quick prompt...">${this.escapeHtml(guide.defaultQuestion)}</textarea>
                     <div class="resource-ai-actions">
                         <button class="course-card-action" type="button" onclick="askResourceGuideAI('${key}')">Ask Expert AI</button>
                         <button class="course-card-action" type="button" onclick="buildResourceActionPlan('${key}')">Build Action Plan</button>
                     </div>
                     <div id="resourceAnswer-${key}" class="resource-ai-answer"></div>
                 </div>
             </div>
         `;
     }

     renderRecommendations(courses, pathName, insights) {
         const safePathName = this.escapeHtml(pathName || 'Personal Learning Path');
         const safeInsights = this.escapeHtml(insights || 'These courses are a strong starting point for your current goals.');

         return `
             <div class="course-recommendation-panel">
                 <div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.18); padding: 28px; border-radius: 24px; margin-bottom: 28px;">
                     <div class="course-section-title">Recommended Path</div>
                     <h3 style="margin: 0 0 12px; color: white; font-size: 28px;">${safePathName}</h3>
                     <p style="margin: 0; color: rgba(255,255,255,0.72); line-height: 1.7;">${safeInsights}</p>
                 </div>

                 <div style="display: grid; gap: 16px;">
                     ${courses.map((course, index) => `
                         <div class="path-card" onclick="showCourseDetail('${this.escapeHtml(course.id)}')">
                             <div class="path-icon">${course.thumbnail}</div>
                             <div style="flex: 1;">
                                 <div style="font-size: 11px; font-weight: 900; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">Step ${index + 1} - ${this.escapeHtml(course.category)}</div>
                                 <div style="font-weight: 900; color: white; font-size: 20px; margin: 6px 0;">${this.escapeHtml(course.title)}</div>
                                 <div style="color: rgba(255,255,255,0.58); line-height: 1.5;">${this.escapeHtml(course.description)}</div>
                             </div>
                             <button class="course-card-action" type="button" onclick="event.stopPropagation(); enrollInCourse('${this.escapeHtml(course.id)}')">Unlock</button>
                         </div>
                     `).join('')}
                 </div>
             </div>
         `;
     }

     renderNeuralPath() {
         const container = document.getElementById('neuralPathVisualizer');
         if (!container || !window.courseManager) return;

         const courses = window.courseManager.getAllCourses();
         const enrolled = window.courseManager.enrollments;
         
         let nodesHtml = '';
         let linesHtml = '';
         
         const width = 640;
         const columns = Math.min(4, Math.max(1, courses.length));
         const rows = Math.ceil(courses.length / columns);
         const height = Math.max(260, 110 + rows * 110);
         const nodeRadius = 24;
         
         // Generate coordinates for nodes in a responsive path layout.
         const coords = courses.map((_, i) => ({
             x: columns === 1 ? width / 2 : 80 + (i % columns) * ((width - 160) / (columns - 1)),
             y: 70 + Math.floor(i / columns) * 110
         }));

         courses.forEach((course, i) => {
             const isEnrolled = enrolled.includes(course.id);
             const pos = coords[i];
             
             // Draw lines to next nodes
             if (i < courses.length - 1) {
                 const nextPos = coords[i + 1];
                 linesHtml += `
                     <line x1="${pos.x}" y1="${pos.y}" x2="${nextPos.x}" y2="${nextPos.y}" 
                           stroke="${isEnrolled ? '#667eea' : 'rgba(255,255,255,0.05)'}" 
                           stroke-width="2" stroke-dasharray="5,5">
                         <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                     </line>
                 `;
             }

             nodesHtml += `
                 <g class="path-node" style="cursor: pointer;" onclick="showCourseDetail('${course.id}')">
                     <circle cx="${pos.x}" cy="${pos.y}" r="${nodeRadius}" 
                             fill="${isEnrolled ? course.color : '#1e293b'}" 
                             stroke="${isEnrolled ? 'white' : 'rgba(255,255,255,0.1)'}" 
                             stroke-width="2" />
                     <text x="${pos.x}" y="${pos.y + 5}" font-size="14" text-anchor="middle" fill="white" style="pointer-events: none;">
                         ${course.thumbnail}
                     </text>
                     <text x="${pos.x}" y="${pos.y + 45}" font-size="10" font-weight="800" text-anchor="middle" fill="${isEnrolled ? 'white' : 'rgba(255,255,255,0.3)'}" style="text-transform: uppercase; letter-spacing: 1px;">
                         ${course.title.split(' ')[0]}
                     </text>
                 </g>
             `;
         });

         container.innerHTML = `
             <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                 <defs>
                     <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                         <feGaussianBlur stdDeviation="5" result="blur" />
                         <feComposite in="SourceGraphic" in2="blur" operator="over" />
                     </filter>
                 </defs>
                 ${linesHtml}
                 ${nodesHtml}
             </svg>
         `;
     }
 }

window.coursesAdvancedUI = new CoursesAdvancedUI();

window.openCourseResourceGuide = function(key) {
    if (!window.coursesAdvancedUI) return;
    window.coursesAdvancedUI.openResourceGuide(key);
};

window.showNutritionModal = function() {
    window.openCourseResourceGuide('nutrition');
};

window.showExerciseModal = function() {
    window.openCourseResourceGuide('exercise');
};

window.showWarningSignsModal = function() {
    window.openCourseResourceGuide('warning');
};

window.showArticlesModal = function() {
    window.openCourseResourceGuide('articles');
};

window.closeCourseResourceGuide = function() {
    document.querySelector('.course-overlay')?.remove();
    ['nutritionModal', 'exerciseModal', 'warningSignsModal', 'articlesModal'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
};

window.closeNutritionModal = window.closeCourseResourceGuide;
window.closeExerciseModal = window.closeCourseResourceGuide;
window.closeWarningSignsModal = window.closeCourseResourceGuide;
window.closeArticlesModal = window.closeCourseResourceGuide;

window.setResourcePrompt = function(key, prompt) {
    const input = document.getElementById(`resourceQuestion-${key}`);
    if (input) {
        input.value = prompt;
        input.focus();
    }
};

window.buildResourceActionPlan = function(key) {
    const guide = window.coursesAdvancedUI?.getResourceGuide(key);
    const input = document.getElementById(`resourceQuestion-${key}`);
    const stage = document.getElementById(`resourceStage-${key}`)?.value || window.courseManager?.state?.currentStage || 'pregnancy';

    if (input && guide) {
        input.value = `Create a practical ${stage} action plan for ${guide.title}. Include what to do this week, what to track, and what questions to ask my healthcare provider.`;
    }

    window.askResourceGuideAI(key);
};

window.askResourceGuideAI = async function(key) {
    const guide = window.coursesAdvancedUI?.getResourceGuide(key);
    const input = document.getElementById(`resourceQuestion-${key}`);
    const answerEl = document.getElementById(`resourceAnswer-${key}`);
    const stage = document.getElementById(`resourceStage-${key}`)?.value || window.courseManager?.state?.currentStage || 'pregnancy';
    const question = input?.value?.trim();

    if (!guide || !answerEl || !question) {
        if (typeof showNotification === 'function') {
            showNotification('Please enter a resource question first.', 'error');
        }
        return;
    }

    answerEl.classList.add('is-loading');
    answerEl.innerHTML = '<div class="course-loader" style="width: 24px; height: 24px; border-width: 2px;"></div><span>Building your guide with Llama 3.3 70B...</span>';

    try {
        if (!window.courseManager) throw new Error('Course manager is not available');

        const context = [
            `Resource: ${guide.title}`,
            `Stage: ${stage}`,
            `Summary: ${guide.summary}`,
            `Sections: ${guide.sections.map(section => `${section.title}: ${section.items.join(', ')}`).join(' | ')}`
        ].join('\n');

        const data = await window.courseManager.fetchExpertAnswer(question, context);
        if (data.success === false) throw new Error(data.error || 'AI helper unavailable');
        const answer = data.answer || data.error || 'No response was returned.';
        answerEl.classList.remove('is-loading');
        answerEl.innerHTML = `<div class="resource-ai-response">${window.coursesAdvancedUI.escapeHtml(answer).replace(/\n/g, '<br>')}</div>`;
    } catch (error) {
        answerEl.classList.remove('is-loading');
        answerEl.innerHTML = `<div class="resource-ai-response error">AI helper is offline right now. You can still open the connected course and use the checklist above.</div>`;
    }
};

// UI Integration Functions
window.showCourseDetail = function(courseId) {
    if (!window.courseManager) return;
    const course = window.courseManager.getCourseById(courseId);
    if (!course) return;

    const isEnrolled = window.courseManager.isEnrolled(courseId);
    const progress = window.courseManager.getCourseProgress(courseId);

    let content = `
        <div style="background: linear-gradient(135deg, ${course.color}, ${course.color}99); padding: 48px; border-radius: 32px; margin-bottom: 32px; text-align: center;">
            <span style="font-size: 80px; display: block; margin-bottom: 24px;">${course.thumbnail}</span>
            <p style="font-size: 20px; font-weight: 500;">${course.description}</p>
        </div>

        <div class="course-section-title">Course Topics & Notes</div>
        <div style="display: grid; gap: 12px; margin-bottom: 32px;">
            ${course.topics.map(t => `
                <div class="path-card" onclick="startTopicNotes('${course.id}', ${t.id})">
                    <div style="flex: 1;">
                        <div style="font-weight: 800; font-size: 17px;">${t.title}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">${t.duration} • Click for Notes</div>
                    </div>
                    <div style="font-size: 20px; color: ${progress.completedTopics.includes(t.id) ? '#00d4aa' : 'rgba(255,255,255,0.2)'};">
                        ${progress.completedTopics.includes(t.id) ? '✓' : '▶'}
                    </div>
                </div>
            `).join('')}
        </div>

        <button onclick="${isEnrolled ? `continueCourse('${course.id}')` : `enrollInCourse('${course.id}')`}" 
                style="width: 100%; height: 72px; background: #667eea; border: none; border-radius: 24px; color: white; font-weight: 900; font-size: 18px; cursor: pointer;">
            ${isEnrolled ? 'CONTINUE LEARNING' : 'INITIALIZE ENROLLMENT'}
        </button>
    `;

    window.coursesAdvancedUI.openModal(course.title, 'KNOWLEDGE ARCHITECTURE', content);
};

window.enrollInCourse = function(courseId) {
    if (!window.courseManager) return;
    if (window.courseManager.enrollInCourse(courseId)) {
        showNotification('Neural connection established!', 'success');
        showCourseDetail(courseId);
        window.coursesAdvancedUI.renderCourseGrid();
        window.updateEnrolledCoursesList();
        window.updateLearningStats();
        window.coursesAdvancedUI.renderNeuralPath();
    }
};

window.startTopicNotes = async function(courseId, topicId) {
    if (!window.courseManager) return;
    const course = window.courseManager.getCourseById(courseId);
    const topic = course?.topics?.find(t => t.id === topicId);
    if (!course || !topic) return;

    window.coursesAdvancedUI.openModal(topic.title, `TOPIC ${topicId} • ${course.title}`, window.coursesAdvancedUI.showLoading('SYNCHESIZING TOPIC NOTES...'));

    try {
        const data = await window.courseManager.fetchTopicNotes(courseId, topicId);
        const lesson = data.lesson;
        window.courseManager.recordLearningActivity();
        
        let content = window.coursesAdvancedUI.renderLesson(lesson, topic, courseId, course.color);
        content += `
            <button onclick="finishTopic('${courseId}', ${topicId})" style="width: 100%; height: 72px; margin-top: 32px; background: #667eea; border: none; border-radius: 24px; color: white; font-weight: 900; font-size: 18px; cursor: pointer;">
                MARK TOPIC AS MASTERED
            </button>
        `;
        document.getElementById('activeCourseModalBody').innerHTML = content;
    } catch (e) {
        console.error(e);
        // Fallback to quick notes if AI sync fails
        document.getElementById('activeCourseModalBody').innerHTML = `
            <div style="background: rgba(99,102,241,0.05); padding: 32px; border-radius: 24px; margin-bottom: 40px; border: 1px solid rgba(99,102,241,0.1);">
                <div class="course-section-title">Topic Notes</div>
                <p style="font-size: 19px; line-height: 1.6; color: white; margin: 0; font-weight: 500;">${topic.quickNotes}</p>
            </div>
            <div style="text-align: center; padding: 24px; color: rgba(255,255,255,0.4); border: 1px dashed rgba(255,255,255,0.1); border-radius: 24px;">
                <p style="margin: 0;">AI Sync is currently offline. Deep learning notes will be available once connection is restored.</p>
            </div>
            <button onclick="finishTopic('${courseId}', ${topicId})" style="width: 100%; height: 72px; margin-top: 32px; background: #667eea; border: none; border-radius: 24px; color: white; font-weight: 900; font-size: 18px; cursor: pointer;">
                MARK TOPIC AS MASTERED
            </button>
        `;
    }
};

window.finishTopic = function(courseId, topicId) {
    const progress = window.courseManager.completeTopic(courseId, topicId);
    if (progress !== null) {
        showNotification('Knowledge node synchronized!', 'success');
        document.querySelector('.course-overlay')?.remove();
        showCourseDetail(courseId);
        window.updateEnrolledCoursesList();
        window.updateLearningStats();
        window.coursesAdvancedUI.renderNeuralPath();
        window.coursesAdvancedUI.renderCourseGrid(); // Re-render to show progress ring
    }
};

window.continueCourse = function(courseId) {
    const course = window.courseManager.getCourseById(courseId);
    const progress = window.courseManager.getCourseProgress(courseId);
    const completedTopics = progress?.completedTopics || [];
    const next = course.topics.find(t => !completedTopics.includes(t.id)) || course.topics[0];
    startTopicNotes(courseId, next.id);
};

window.generateCourseRecommendations = async function() {
    if (!window.courseManager) return;
    const stage = document.getElementById('assessmentStage')?.value;
    const goals = Array.from(document.querySelectorAll('.goal-checkbox:checked')).map(cb => cb.value);
    const preference = document.getElementById('assessmentPreference')?.value;
    const experience = document.getElementById('assessmentExperience')?.value;

    if (!stage) {
        showNotification('Please select your pregnancy stage', 'error');
        return;
    }

    window.courseManager.setPregnancyStage(stage);
    window.courseManager.setLearningGoals(goals);
    window.courseManager.setLearningPace(preference);
    const stageFilter = document.getElementById('courseStageFilter');
    if (stageFilter) stageFilter.value = stage;
    window.coursesAdvancedUI.renderCourseGrid();

    window.coursesAdvancedUI.openModal('Neural Path Generation', 'Analyzing your cognitive profile...', window.coursesAdvancedUI.showLoading());

    try {
        const result = await window.courseManager.fetchRecommendations({ stage, goals, preference, experience });
        
        // Map the IDs back to course objects from our catalog
        const recommendedCourses = result.courseIds.map(id => window.courseManager.getCourseById(id)).filter(Boolean);
        
        const content = window.coursesAdvancedUI.renderRecommendations(recommendedCourses, result.pathName, result.insights);
        document.getElementById('activeCourseModalBody').innerHTML = content;
    } catch (e) {
        console.error(e);
        showNotification('Sync Error: Using local intelligence.', 'info');
        const fallback = window.courseManager.getAllCourses().slice(0, 3);
        const content = window.coursesAdvancedUI.renderRecommendations(fallback, 'Local Learning Path', 'The neural link is currently syncing. Here are the core modules for your stage.');
        document.getElementById('activeCourseModalBody').innerHTML = content;
    }
};

window.askExpert = function() {
    const modal = document.createElement('div');
    modal.className = 'course-overlay';
    modal.innerHTML = `
        <div class="course-modal-premium">
            <div class="course-modal-header">
                <div>
                    <div style="font-size: 11px; font-weight: 900; color: #ff8fab; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">COGNITIVE SYNC</div>
                    <h2 style="margin: 0; font-size: 32px; font-weight: 950; letter-spacing: 0;">Expert Q&A</h2>
                </div>
                <button class="course-btn-close" onclick="this.closest('.course-overlay').remove()">×</button>
            </div>
            <div class="course-modal-body">
                <p style="color: rgba(255,255,255,0.5); margin-bottom: 24px; font-size: 18px;">Ask our maternal health intelligence anything about your current learning path.</p>
                <textarea id="expertQuestion" rows="4" style="width: 100%; padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; color: white; font-size: 18px; outline: none; transition: border-color 0.3s;" placeholder="e.g. When should I start prenatal vitamins?"></textarea>
                <div id="expertAnswer" style="margin-top: 24px; display: none;"></div>
                <button id="expertSubmitBtn" onclick="submitExpertQuestion()" style="width: 100%; background: linear-gradient(135deg, #ff8fab, #667eea); color: white; padding: 24px; border: none; border-radius: 24px; font-weight: 900; font-size: 18px; cursor: pointer; margin-top: 32px; box-shadow: 0 20px 40px rgba(240,147,251,0.2);">GET EXPERT ANSWER</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window.submitExpertQuestion = async function() {
    const question = document.getElementById('expertQuestion')?.value?.trim();
    if (!question) { showNotification('Please enter a question', 'error'); return; }
    
    const btn = document.getElementById('expertSubmitBtn');
    const answerEl = document.getElementById('expertAnswer');
    
    btn.disabled = true;
    btn.innerHTML = '<span class="course-loader" style="width: 20px; height: 20px; border-width: 2px; margin-right: 10px; display: inline-block;"></span>SYNCING...';
    
    try {
        const data = await window.courseManager.fetchExpertAnswer(question);
        answerEl.style.display = 'block';
        answerEl.innerHTML = `
            <div style="display: flex; gap: 16px; align-items: flex-start; background: rgba(99,102,241,0.05); padding: 24px; border-radius: 20px; border: 1px solid rgba(99,102,241,0.2);">
                <div style="font-size: 24px;">👨‍⚕️</div>
                <div style="flex: 1;">
                    <div style="font-size: 11px; font-weight: 900; color: #667eea; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">EXPERT NEURAL RESPONSE</div>
                    <div style="color: rgba(255,255,255,0.9); line-height: 1.7; font-size: 16px;">${data.answer.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    } catch (e) {
        answerEl.style.display = 'block';
        answerEl.innerHTML = `<p style="color: #ff6b9d; font-weight: 700;">Sync Failed: ${e.message}</p>`;
    }
    btn.disabled = false;
    btn.textContent = 'GET EXPERT ANSWER';
};

window.updateEnrolledCoursesList = function() {
    const list = document.getElementById('unlockedCoursesList');
    if (!list || !window.courseManager) return;
    
    const enrolled = window.courseManager.enrollments;
    if (!enrolled.length) {
        list.innerHTML = '<p class="empty-message">No unlocked courses yet. Start with the starter path.</p>';
        return;
    }

    list.innerHTML = enrolled.map(id => {
        const course = window.courseManager.getCourseById(id);
        if (!course) return '';
        
        const p = window.courseManager.getCourseProgress(id);
        const safeId = window.coursesAdvancedUI.escapeHtml(id);
        return `
            <div class="course-unlocked-item">
                <div class="course-unlocked-main">
                    <span>${course.thumbnail}</span>
                    <div>
                        <strong>${window.coursesAdvancedUI.escapeHtml(course.title)}</strong>
                        <small>${p.progress.toFixed(0)}% complete</small>
                    </div>
                </div>
                <button onclick="showCourseDetail('${safeId}')">Open</button>
            </div>
        `;
    }).join('');
};

window.updateLearningStats = function() {
    if (!window.courseManager) return;
    const stats = window.courseManager.getLearningStats();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const courses = window.courseManager.getAllCourses();
    const totalTopics = courses.reduce((sum, course) => sum + (course.topics?.length || 0), 0);
    const enrolledProgress = window.courseManager.enrollments.map(id => window.courseManager.getCourseProgress(id).progress || 0);
    const averageProgress = enrolledProgress.length
        ? Math.round(enrolledProgress.reduce((sum, value) => sum + value, 0) / enrolledProgress.length)
        : 0;
    
    // Support multiple stat ID formats from different index.html versions
    set('statTotalCourses', courses.length);
    set('statEnrolled', stats.coursesEnrolled);
    set('statCompleted', stats.coursesCompleted);
    set('statStreak', stats.currentStreak);
    set('statTotalTopics', totalTopics);
    set('statProgressAverage', `${averageProgress}%`);
    
    // Update any dashboard-specific stats if they exist
    const enrolledCount = document.getElementById('enrolledCount');
    if (enrolledCount) enrolledCount.textContent = stats.coursesEnrolled;
};

window.refreshDailyTip = function() {
    const tipEl = document.getElementById('dailyTip');
    if (!tipEl) return;
    const tips = [
        "Pair iron-rich plant foods with vitamin C to improve absorption.",
        "Choose pasteurized dairy and fully cooked proteins during pregnancy.",
        "Protein at breakfast can help steady energy and nausea.",
        "Low-mercury cooked fish can support DHA intake for fetal brain and eye development."
    ];
    tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
};

window.unlockAllStarterCourses = function() {
    if (!window.courseManager) return;
    const starterIds = ['nutrition'];
    let count = 0;
    starterIds.forEach(id => {
        if (window.courseManager.enrollInCourse(id)) count++;
    });
    
    if (count > 0) {
        showNotification(`Synchronized ${count} starter nodes!`, 'success');
        window.coursesAdvancedUI.renderCourseGrid();
        window.coursesAdvancedUI.renderNeuralPath();
        window.updateEnrolledCoursesList();
        window.updateLearningStats();
    } else {
        showNotification('All starter nodes already active.', 'info');
    }
};

window.initializeCoursesPage = function() {
    if (!window.coursesAdvancedUI) return;
    window.coursesAdvancedUI.initializePage();
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.initializeCoursesPage();
    }, 300);
});
