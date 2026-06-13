// Real-time course UI with Llama 3.3 70B via Groq backend (loaded after script-new.js)

function updateLearningStats() {
    if (!window.courseManager) return;
    const stats = window.courseManager.getLearningStats();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statEnrolled', stats.coursesEnrolled);
    set('statCompleted', stats.coursesCompleted);
    set('statHours', stats.hoursLearned);
    set('statStreak', stats.currentStreak);
}

async function generateCourseRecommendations() {
    const stage = document.getElementById('assessmentStage')?.value;
    const goals = Array.from(document.querySelectorAll('.goal-checkbox:checked')).map(cb => cb.value);
    const preference = document.getElementById('assessmentPreference')?.value;
    const experience = document.getElementById('assessmentExperience')?.value;

    if (!stage) {
        showNotification('Please select your pregnancy stage', 'error');
        return;
    }
    if (!window.courseManager) {
        showNotification('Course system not loaded', 'error');
        return;
    }

    window.courseManager.setPregnancyStage(stage);
    window.courseManager.setLearningGoals(goals);
    window.courseManager.setLearningPace(preference);

    document.querySelector('.course-modal')?.remove();

    const loadingModal = document.createElement('div');
    loadingModal.className = 'course-modal active';
    loadingModal.innerHTML = `
        <div class="course-modal-content" style="text-align:center;padding:40px;">
            <div style="font-size:48px;margin-bottom:16px;">🤖</div>
            <h3>Building your personalized path...</h3>
            <p style="color:#666;">Llama 3.3 70B is analyzing your goals and stage</p>
        </div>`;
    document.body.appendChild(loadingModal);

    try {
        const result = await window.courseManager.getAIRecommendationsLive({
            stage, goals, preference, experience
        });
        loadingModal.remove();
        showRecommendationsModal(result.courses, stage, goals, preference, result.insights, result.pathName);
    } catch (e) {
        loadingModal.remove();
        showNotification('Could not reach AI. Showing local recommendations.', 'info');
        showRecommendationsModal(
            window.courseManager.getAIRecommendations(),
            stage, goals, preference,
            'Recommendations based on your profile.'
        );
    }
}

function showRecommendationsModal(recommendations, stage, goals, preference, aiInsights, pathName) {
    const modal = document.createElement('div');
    modal.className = 'course-modal active';
    modal.innerHTML = `
        <div class="course-modal-content">
            <div class="course-modal-header">
                <h2 class="course-modal-title">${pathName || 'Your Personalized Learning Path'}</h2>
                <button class="course-modal-close" onclick="this.closest('.course-modal').remove()">×</button>
            </div>
            <div class="course-modal-body">
                <div style="text-align:center;margin-bottom:30px;">
                    <div style="background:linear-gradient(135deg,#667eea,#764ba2);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px;color:white;">AI</div>
                    <p style="color:#666;">Based on your ${(stage || '').replace(/-/g, ' ')} stage</p>
                </div>
                <div style="background:#f8f9fa;padding:20px;border-radius:15px;margin-bottom:25px;">
                    <h4 style="color:#333;margin-bottom:15px;">Recommended Courses</h4>
                    ${recommendations.length ? recommendations.map(course => `
                        <div style="background:white;border:2px solid #e9ecef;padding:20px;border-radius:15px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                            <div>
                                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                                    <span style="font-size:32px;">${course.thumbnail}</span>
                                    <strong>${course.title}</strong>
                                </div>
                                <div style="color:#666;font-size:14px;">${course.lessons} lessons • ${course.duration} • ⭐ ${course.rating}</div>
                            </div>
                            <button onclick="enrollInCourse('${course.id}')" style="background:#667eea;color:white;padding:10px 20px;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Enroll</button>
                        </div>
                    `).join('') : '<p style="color:#666;">No courses available.</p>'}
                </div>
                <div style="background:#e3f2fd;padding:20px;border-radius:15px;">
                    <h4 style="color:#1976d2;margin-bottom:10px;">AI Insights</h4>
                    <p style="color:#1976d2;font-size:14px;line-height:1.6;">${aiInsights || 'Your personalized path is ready.'}</p>
                </div>
            </div>
            <div style="display:flex;gap:15px;margin-top:20px;">
                <button onclick="enrollAllRecommended(${JSON.stringify(recommendations.map(r => r.id))})" style="flex:1;background:#667eea;color:white;padding:15px;border:none;border-radius:10px;font-weight:600;cursor:pointer;">Enroll All</button>
                <button onclick="this.closest('.course-modal').remove()" style="flex:1;background:#f8f9fa;padding:15px;border:none;border-radius:10px;cursor:pointer;">Save for Later</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function enrollAllRecommended(courseIds) {
    if (!window.courseManager) return;
    let n = 0;
    courseIds.forEach(id => { if (window.courseManager.enrollInCourse(id)) n++; });
    showNotification(`Enrolled in ${n} courses!`, 'success');
    document.querySelector('.course-modal')?.remove();
    updateLearningStats();
    updateProgressDashboard();
    updateEnrolledCoursesList();
    renderCourseGrid(window.courseManager.getAllCourses());
}

async function startModule(courseId, moduleId) {
    if (!window.courseManager) return;
    if (!window.courseManager.isEnrolled(courseId)) enrollInCourse(courseId);

    const course = window.courseManager.getCourseById(courseId);
    const module = course?.modules?.find(m => m.id === moduleId);
    if (!course || !module) return;

    const modal = document.createElement('div');
    modal.className = 'course-modal active';
    modal.id = 'modulePlayerModal';
    modal.innerHTML = `
        <div class="course-modal-content" style="max-width:720px;">
            <div class="course-modal-header">
                <h2 class="course-modal-title">${module.title}</h2>
                <button class="course-modal-close" onclick="this.closest('.course-modal').remove()">×</button>
            </div>
            <div class="course-modal-body" id="moduleLessonBody">
                <div style="text-align:center;padding:40px;color:#666;">
                    <div style="font-size:40px;margin-bottom:12px;">📖</div>
                    <p>Generating your lesson with Groq AI...</p>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    try {
        const data = await window.courseManager.fetchModuleLesson(courseId, moduleId);
        const lesson = data.lesson;
        window.courseManager.recordLearningActivity();
        const esc = (t) => String(t || '').replace(/</g, '&lt;');

        document.getElementById('moduleLessonBody').innerHTML = `
            <p style="color:#666;margin-bottom:20px;">${esc(lesson.summary)}</p>
            ${(lesson.sections || []).map(s => `
                <div style="margin-bottom:24px;">
                    <h4 style="color:#333;margin-bottom:8px;">${esc(s.heading)}</h4>
                    <p style="color:#555;line-height:1.7;white-space:pre-wrap;">${esc(s.content)}</p>
                </div>
            `).join('')}
            <div style="background:#f0f4ff;padding:16px;border-radius:10px;margin:20px 0;">
                <h4>Key Takeaways</h4>
                <ul style="margin:8px 0 0;padding-left:20px;">
                    ${(lesson.keyTakeaways || []).map(t => `<li>${esc(t)}</li>`).join('')}
                </ul>
            </div>
            ${lesson.reflectionQuestion ? `<p style="font-style:italic;color:#667eea;margin-top:16px;"><strong>Reflect:</strong> ${esc(lesson.reflectionQuestion)}</p>` : ''}
            <button onclick="finishModule('${courseId}', ${moduleId})" style="width:100%;margin-top:20px;background:${course.color};color:white;padding:14px;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
                Mark Module Complete
            </button>`;
    } catch (e) {
        document.getElementById('moduleLessonBody').innerHTML = `
            <p style="color:#c00;">Could not load lesson: ${e.message}. Is the backend running on port 5000?</p>
            <button onclick="this.closest('.course-modal').remove()" style="margin-top:16px;padding:10px 20px;cursor:pointer;">Close</button>`;
    }
}

function finishModule(courseId, moduleId) {
    const progress = window.courseManager.completeModule(courseId, moduleId);
    if (progress === null) return;
    showNotification(`Module complete! Course progress: ${progress.toFixed(0)}%`, 'success');
    document.getElementById('modulePlayerModal')?.remove();
    showCourseDetail(courseId);
    updateLearningStats();
    updateProgressDashboard();
    updateEnrolledCoursesList();
}

function continueCourse(courseId) {
    document.querySelector('.course-modal')?.remove();
    const course = window.courseManager.getCourseById(courseId);
    if (!course) return;
    const progress = window.courseManager.getCourseProgress(courseId);
    const next = course.modules.find(m => !progress.completedModules?.includes(m.id)) || course.modules[0];
    startModule(courseId, next.id);
}

function askExpert() {
    const modal = document.createElement('div');
    modal.className = 'course-modal active';
    modal.innerHTML = `
        <div class="course-modal-content">
            <div class="course-modal-header">
                <h2 class="course-modal-title">Expert Q&A</h2>
                <button class="course-modal-close" onclick="this.closest('.course-modal').remove()">×</button>
            </div>
            <div class="course-modal-body">
                <p style="color:#666;margin-bottom:16px;">Ask our maternal health expert (powered by Groq AI).</p>
                <textarea id="expertQuestion" rows="4" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;" placeholder="e.g. When should I start prenatal vitamins?"></textarea>
                <div id="expertAnswer" style="margin-top:16px;display:none;background:#f8f9fa;padding:16px;border-radius:10px;line-height:1.6;"></div>
            </div>
            <button id="expertSubmitBtn" onclick="submitExpertQuestion()" style="width:100%;background:#f093fb;color:white;padding:15px;border:none;border-radius:10px;font-weight:600;cursor:pointer;margin-top:12px;">Get Expert Answer</button>
        </div>`;
    document.body.appendChild(modal);
}

async function submitExpertQuestion() {
    const question = document.getElementById('expertQuestion')?.value?.trim();
    if (!question) { showNotification('Please enter a question', 'error'); return; }
    const btn = document.getElementById('expertSubmitBtn');
    const answerEl = document.getElementById('expertAnswer');
    btn.disabled = true;
    btn.textContent = 'Thinking...';
    try {
        const data = await window.courseManager.fetchExpertAnswer(question);
        answerEl.style.display = 'block';
        answerEl.innerHTML = `<strong style="color:#f093fb;">Expert:</strong><p style="margin-top:8px;">${data.answer}</p>`;
    } catch (e) {
        answerEl.style.display = 'block';
        answerEl.innerHTML = `<p style="color:#c00;">${e.message}. Ensure backend is running.</p>`;
    }
    btn.disabled = false;
    btn.textContent = 'Get Expert Answer';
}

async function joinCommunity() {
    const modal = document.createElement('div');
    modal.className = 'course-modal active';
    modal.innerHTML = `
        <div class="course-modal-content">
            <div class="course-modal-header">
                <h2 class="course-modal-title">Mother's Circle</h2>
                <button class="course-modal-close" onclick="this.closest('.course-modal').remove()">×</button>
            </div>
            <div class="course-modal-body" id="communityBody"><p style="text-align:center;color:#666;">Connecting...</p></div>
        </div>`;
    document.body.appendChild(modal);
    try {
        const data = await window.courseManager.fetchCommunityInsight('motherhood support');
        document.getElementById('communityBody').innerHTML = `
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:20px;border-radius:12px;margin-bottom:16px;">
                <span style="background:rgba(255,255,255,0.3);padding:4px 10px;border-radius:12px;font-size:12px;">LIVE</span>
                <p style="margin-top:12px;line-height:1.6;">${data.message}</p>
            </div>
            <p style="color:#666;font-size:14px;">2,300+ mothers online</p>`;
        showNotification("Welcome to Mother's Circle!", 'success');
    } catch (e) {
        document.getElementById('communityBody').innerHTML = `<p style="color:#c00;">${e.message}</p>`;
    }
}

function updateProgressDashboard() {
    if (!window.courseManager) return;
    updateLearningStats();
    const achievements = window.courseManager.getAchievements();
    const container = document.getElementById('achievementsContainer');
    if (!container) return;
    if (!achievements.length) {
        container.innerHTML = '<p style="color:#666;text-align:center;padding:20px;">Complete modules to earn achievements!</p>';
        return;
    }
    container.innerHTML = achievements.slice(-5).reverse().map(a => `
        <div style="display:flex;align-items:center;gap:15px;padding:15px;background:linear-gradient(135deg,#fff9c4,#f8f9fa);border-radius:10px;">
            <span style="font-size:32px;">${a.icon}</span>
            <div>
                <div style="font-weight:600;">${a.title}</div>
                <div style="color:#666;font-size:14px;">${new Date(a.earnedAt).toLocaleDateString()}</div>
            </div>
        </div>`).join('');
}

function updateEnrolledCoursesList() {
    const list = document.getElementById('enrolledCourses');
    if (!list || !window.courseManager) return;
    if (!window.courseManager.enrollments.length) {
        list.innerHTML = '<li style="color:#666;">No enrolled courses yet.</li>';
        return;
    }
    list.innerHTML = window.courseManager.enrollments.map(id => {
        const course = window.courseManager.getCourseById(id);
        if (!course) return '';
        const p = window.courseManager.getCourseProgress(id);
        return `<li style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <span><strong>${course.title}</strong> — ${p.progress.toFixed(0)}%</span>
            <button class="calculate-btn" onclick="continueCourse('${id}')">Continue</button>
        </li>`;
    }).join('');
}

showCourseDetail = function(courseId) {
    if (!window.courseManager) return;
    const course = window.courseManager.getCourseById(courseId);
    if (!course) return;
    const isEnrolled = window.courseManager.isEnrolled(courseId);
    const progress = window.courseManager.getCourseProgress(courseId);
    const modal = document.createElement('div');
    modal.className = 'course-modal active';
    modal.innerHTML = `
        <div class="course-modal-content">
            <div class="course-modal-header">
                <h2 class="course-modal-title">${course.title}</h2>
                <button class="course-modal-close" onclick="this.closest('.course-modal').remove()">×</button>
            </div>
            <div class="course-modal-body">
                <div style="background:linear-gradient(135deg,${course.color},${course.color}99);padding:30px;border-radius:15px;margin-bottom:24px;text-align:center;color:white;">
                    <span style="font-size:64px;">${course.thumbnail}</span>
                    <p style="margin-top:12px;">${course.description}</p>
                </div>
                ${isEnrolled ? `<p style="margin-bottom:16px;"><strong>Progress:</strong> ${progress.progress.toFixed(0)}%</p>
                    <div class="progress-bar"><div class="progress-fill" style="width:${progress.progress}%"></div></div>` : ''}
                <h4>Modules — click to start</h4>
                ${course.modules.map(module => {
                    const done = progress.completedModules?.includes(module.id);
                    return `<div class="course-module ${done ? 'completed' : ''}" onclick="startModule('${courseId}',${module.id})" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:14px;background:#f8f9fa;border-radius:10px;margin:8px 0;">
                        <div><strong>${module.title}</strong><br><small>${module.duration}</small></div>
                        ${done ? '✓' : '▶'}
                    </div>`;
                }).join('')}
            </div>
            <div style="display:flex;gap:12px;margin-top:16px;">
                <button onclick="${isEnrolled ? `continueCourse('${courseId}')` : `enrollInCourse('${courseId}')`}" style="flex:1;background:${course.color};color:white;padding:14px;border:none;border-radius:10px;cursor:pointer;">
                    ${isEnrolled ? 'Continue' : 'Enroll'}
                </button>
                <button onclick="this.closest('.course-modal').remove()" style="flex:1;padding:14px;border:none;border-radius:10px;cursor:pointer;">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

initializeCoursesPage = function() {
    if (!window.courseManager) { setTimeout(initializeCoursesPage, 100); return; }
    updateLearningStats();
    updateProgressDashboard();
    updateEnrolledCoursesList();
    renderCourseGrid(window.courseManager.getFeaturedCourses());
};

const _enrollInCourse = enrollInCourse;
enrollInCourse = function(courseId) {
    _enrollInCourse(courseId);
    updateEnrolledCoursesList();
    updateProgressDashboard();
};
