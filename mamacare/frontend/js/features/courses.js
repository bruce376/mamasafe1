// Modern Course Management System
// Advanced course functions with state management, progress tracking, and AI recommendations

class CourseManager {
    constructor() {
        console.log('CourseManager constructor called');
        this.courses = this.initializeCourses();
        this.userProgress = this.loadUserProgress();
        this.enrollments = this.loadEnrollments();
        this.learningPath = this.loadLearningPath();
        this.achievements = this.loadAchievements();
        this.state = {
            currentStage: localStorage.getItem('pregnancyStage') || 'planning',
            learningGoals: JSON.parse(localStorage.getItem('learningGoals') || '[]'),
            learningPace: localStorage.getItem('learningPace') || 'flexible',
            preferences: JSON.parse(localStorage.getItem('coursePreferences') || '{}')
        };
        console.log('CourseManager initialized with enrollments:', this.enrollments);
    }

    // Initialize course catalog with modern structure
    initializeCourses() {
        return [
            {
                id: 'childbirth',
                title: 'Complete Childbirth Mastery',
                description: 'Comprehensive preparation covering labor techniques, pain management, birth plans, postpartum recovery, and partner support strategies.',
                category: 'pregnancy',
                level: 'advanced',
                duration: '8.5 hours',
                lessons: 42,
                rating: 4.9,
                reviews: 2300,
                enrolled: 15234,
                tags: ['bestseller', 'updated', 'advanced'],
                modules: [
                    { id: 1, title: 'Understanding Labor', duration: '45 min', completed: false },
                    { id: 2, title: 'Pain Management Techniques', duration: '60 min', completed: false },
                    { id: 3, title: 'Creating Your Birth Plan', duration: '30 min', completed: false },
                    { id: 4, title: 'Partner Support Strategies', duration: '45 min', completed: false },
                    { id: 5, title: 'Postpartum Recovery', duration: '50 min', completed: false }
                ],
                instructor: 'Dr. Sarah Johnson',
                price: 99,
                thumbnail: '🤰',
                color: '#667eea'
            },
            {
                id: 'breastfeeding',
                title: 'Master Breastfeeding',
                description: 'Professional guidance on latching, positioning, milk supply, pumping, troubleshooting common issues, and returning to work strategies.',
                category: 'postpartum',
                level: 'pro',
                duration: '6.2 hours',
                lessons: 28,
                rating: 4.8,
                reviews: 1800,
                enrolled: 12567,
                tags: ['essential', 'expert-led', 'pro'],
                modules: [
                    { id: 1, title: 'Getting Started with Breastfeeding', duration: '40 min', completed: false },
                    { id: 2, title: 'Perfect Latching Techniques', duration: '35 min', completed: false },
                    { id: 3, title: 'Positioning Your Baby', duration: '30 min', completed: false },
                    { id: 4, title: 'Building and Maintaining Supply', duration: '45 min', completed: false },
                    { id: 5, title: 'Pumping and Storage', duration: '40 min', completed: false }
                ],
                instructor: 'Lactation Consultant Emily Davis',
                price: 79,
                thumbnail: '🤱',
                color: '#f093fb'
            },
            {
                id: 'newborn',
                title: 'Newborn Care Excellence',
                description: 'Essential skills for diapering, bathing, soothing techniques, sleep safety, health monitoring, and daily care routines.',
                category: 'postpartum',
                level: 'fundamental',
                duration: '7.8 hours',
                lessons: 35,
                rating: 4.9,
                reviews: 3100,
                enrolled: 18923,
                tags: ['new', 'practical', 'fundamental'],
                modules: [
                    { id: 1, title: 'Understanding Your Newborn', duration: '35 min', completed: false },
                    { id: 2, title: 'Diapering Essentials', duration: '25 min', completed: false },
                    { id: 3, title: 'Bathing Your Baby', duration: '30 min', completed: false },
                    { id: 4, title: 'Soothing Techniques', duration: '40 min', completed: false },
                    { id: 5, title: 'Sleep Safety', duration: '35 min', completed: false }
                ],
                instructor: 'Pediatric Nurse Maria Garcia',
                price: 69,
                thumbnail: '👶',
                color: '#4facfe'
            },
            {
                id: 'sleep',
                title: 'Baby Sleep Solutions',
                description: 'Evidence-based sleep training methods, establishing routines, understanding sleep cycles, and managing sleep regressions.',
                category: 'infant',
                level: 'intermediate',
                duration: '5.5 hours',
                lessons: 24,
                rating: 4.7,
                reviews: 1500,
                enrolled: 9876,
                tags: ['popular', 'intermediate'],
                modules: [
                    { id: 1, title: 'Understanding Baby Sleep', duration: '40 min', completed: false },
                    { id: 2, title: 'Establishing Routines', duration: '35 min', completed: false },
                    { id: 3, title: 'Sleep Training Methods', duration: '50 min', completed: false },
                    { id: 4, title: 'Managing Regressions', duration: '30 min', completed: false }
                ],
                instructor: 'Sleep Specialist Dr. Michael Chen',
                price: 59,
                thumbnail: '😴',
                color: '#a8edea'
            },
            {
                id: 'cpr',
                title: 'Infant CPR & Safety',
                description: 'Life-saving skills including CPR, choking relief, first aid basics, and creating a safe home environment.',
                category: 'safety',
                level: 'essential',
                duration: '3.2 hours',
                lessons: 18,
                rating: 4.9,
                reviews: 4200,
                enrolled: 25678,
                tags: ['essential', 'certified'],
                modules: [
                    { id: 1, title: 'Infant CPR Basics', duration: '45 min', completed: false },
                    { id: 2, title: 'Choking Relief', duration: '30 min', completed: false },
                    { id: 3, title: 'First Aid Fundamentals', duration: '40 min', completed: false },
                    { id: 4, title: 'Home Safety', duration: '35 min', completed: false }
                ],
                instructor: 'Certified Instructor Jennifer Brown',
                price: 49,
                thumbnail: '🆘',
                color: '#ffecd2'
            },
            {
                id: 'solids',
                title: 'Starting Solids Guide',
                description: 'Introduction to solid foods, allergen introduction, baby-led weaning, nutrition planning, and meal preparation.',
                category: 'infant',
                level: 'intermediate',
                duration: '4.8 hours',
                lessons: 22,
                rating: 4.6,
                reviews: 1200,
                enrolled: 8765,
                tags: ['nutrition', 'intermediate'],
                modules: [
                    { id: 1, title: 'Signs of Readiness', duration: '30 min', completed: false },
                    { id: 2, title: 'First Foods', duration: '35 min', completed: false },
                    { id: 3, title: 'Allergen Introduction', duration: '40 min', completed: false },
                    { id: 4, title: 'Baby-Led Weaning', duration: '35 min', completed: false },
                    { id: 5, title: 'Meal Planning', duration: '30 min', completed: false }
                ],
                instructor: 'Nutritionist Dr. Amanda White',
                price: 54,
                thumbnail: '🍎',
                color: '#fcb69f'
            },
            ...this.getExtendedCatalog()
        ];
    }

    getExtendedCatalog() {
        const colors = ['#667eea', '#f093fb', '#4facfe', '#a8edea', '#ffecd2', '#fcb69f'];
        const legacy = [
            { id: 'complete-pregnancy', name: 'The Complete Pregnancy Guide', category: 'pregnancy', level: 'beginner', icon: '🤰', description: 'Master pregnancy from conception to postpartum recovery.', highlights: ['Week-by-week development', 'Nutrition & exercise', 'Warning signs', 'Labor preparation'] },
            { id: 'newborn-essentials', name: 'Newborn Essentials: First Week', category: 'newborn', level: 'beginner', icon: '👶', description: 'Everything you need for your newborn\'s first week.', highlights: ['Basic newborn care', 'Feeding options', 'Diaper & hygiene', 'Normal behaviors'] },
            { id: 'breastfeeding-mastery', name: 'Breastfeeding Mastery', category: 'baby-care', level: 'beginner', icon: '🍼', description: 'Techniques and troubleshooting for successful breastfeeding.', highlights: ['Latch techniques', 'Common issues', 'Milk supply', 'Lifestyle balance'] },
            { id: 'infant-sleep', name: 'Infant Sleep Solutions', category: 'baby-care', level: 'intermediate', icon: '😴', description: 'Science-based strategies for better infant sleep.', highlights: ['Sleep patterns', 'Healthy habits', 'Safe sleep', 'Regressions'] },
            { id: 'postpartum-recovery', name: 'Postpartum Recovery & Wellness', category: 'wellness', level: 'intermediate', icon: '💪', description: 'Physical and mental health recovery after birth.', highlights: ['Postpartum changes', 'Safe exercises', 'Mental health', 'Recovery nutrition'] },
            { id: 'nutrition-pregnancy', name: 'Pregnancy Nutrition Masterclass', category: 'nutrition', level: 'intermediate', icon: '🥗', description: 'Complete nutrition guide for healthy pregnancy.', highlights: ['Key nutrients', 'Safe foods', 'Meal planning', 'Gestational diabetes'] },
            { id: 'toddler-behavior', name: 'Toddler Behavior & Discipline', category: 'toddler', level: 'intermediate', icon: '🧒', description: 'Positive discipline and toddler development.', highlights: ['Development stages', 'Positive discipline', 'Tantrums', 'Emotional intelligence'] },
            { id: 'labor-delivery', name: 'Preparing for Labor & Delivery', category: 'pregnancy', level: 'intermediate', icon: '🏥', description: 'Complete preparation for labor and delivery.', highlights: ['Labor stages', 'Pain management', 'Birth plans', 'Partner support'] },
            { id: 'baby-development', name: 'Baby Development First Year', category: 'baby-care', level: 'beginner', icon: '📈', description: 'Guide to baby development 0-12 months.', highlights: ['Monthly milestones', 'Growth support', 'Development delays', 'When to seek help'] },
            { id: 'fertility-basics', name: 'Understanding Fertility & Conception', category: 'pregnancy', level: 'beginner', icon: '🌱', description: 'Master your cycle and optimize conception.', highlights: ['Cycle basics', 'Ovulation tracking', 'Fertility optimization', 'When to seek help'] },
            { id: 'vaccinations', name: 'Understanding Baby Vaccinations', category: 'baby-care', level: 'beginner', icon: '💉', description: 'Childhood vaccines, schedules, and safety.', highlights: ['Vaccine safety', 'Schedules', 'Side effects', 'Informed decisions'] },
            { id: 'stress-anxiety', name: 'Managing Pregnancy Stress & Anxiety', category: 'wellness', level: 'beginner', icon: '🧘‍♀️', description: 'Mental health techniques for pregnancy anxiety.', highlights: ['Identifying anxiety', 'Mindfulness', 'Stress management', 'Professional help'] },
            { id: 'partner-support', name: 'Partner\'s Guide to Pregnancy & Newborn', category: 'pregnancy', level: 'beginner', icon: '👨‍👩‍👧', description: 'Support mothers and care for newborns.', highlights: ['Pregnancy changes', 'Support techniques', 'Newborn care', 'Relationship health'] },
            { id: 'working-mom', name: 'Balancing Work & Motherhood', category: 'wellness', level: 'advanced', icon: '💼', description: 'Career and motherhood balance strategies.', highlights: ['Time management', 'Career planning', 'Childcare options', 'Prevent burnout'] },
            { id: 'multiples', name: 'Expecting Multiples', category: 'pregnancy', level: 'intermediate', icon: '👶👶', description: 'Guidance for multiple pregnancies.', highlights: ['Unique challenges', 'Complications', 'Delivery planning', 'Caring for multiples'] },
            { id: 'sensory-development', name: 'Baby Sensory & Brain Development', category: 'baby-care', level: 'intermediate', icon: '🧠', description: 'Sensory and cognitive development activities.', highlights: ['Brain development', 'Enriching environments', 'Sensory activities', 'Delays'] },
            { id: 'natural-birth', name: 'Natural Birth Techniques', category: 'pregnancy', level: 'advanced', icon: '🌿', description: 'Natural birth preparation and techniques.', highlights: ['Pain management', 'Positioning', 'Breathing', 'Environment'] },
            { id: 'formula-feeding', name: 'Formula Feeding Guide', category: 'baby-care', level: 'beginner', icon: '🍶', description: 'Formula selection and safe bottle feeding.', highlights: ['Formula selection', 'Safe preparation', 'Schedules', 'Common issues'] },
            { id: 'colic-reflux', name: 'Managing Colic & Reflux', category: 'baby-care', level: 'intermediate', icon: '😣', description: 'Identify and soothe colic or reflux.', highlights: ['Colic vs reflux', 'Soothing techniques', 'Medical help', 'Caregiver support'] },
            { id: 'attachment-parenting', name: 'Attachment Parenting Essentials', category: 'toddler', level: 'intermediate', icon: '🤗', description: 'Responsive, gentle parenting practices.', highlights: ['Attachment theory', 'Responsive parenting', 'Emotional connection', 'Age strategies'] },
            { id: 'potty-training', name: 'Potty Training Success', category: 'toddler', level: 'intermediate', icon: '🚽', description: 'Successful potty training approaches.', highlights: ['Readiness signs', 'Choosing approach', 'Resistance', 'Building confidence'] },
            { id: 'nutrition-toddler', name: 'Toddler Nutrition & Meal Planning', category: 'nutrition', level: 'beginner', icon: '🍽️', description: 'Nutrition for toddlers 1-3 years.', highlights: ['Nutritional needs', 'Food introduction', 'Picky eating', 'Allergies'] }
        ];
        return legacy.map((c, i) => ({
            id: c.id,
            title: c.name,
            description: c.description,
            category: c.category,
            level: c.level,
            duration: `${c.highlights.length * 0.75} hours`,
            lessons: c.highlights.length * 3,
            rating: 4.6 + (i % 4) * 0.1,
            reviews: 400 + i * 80,
            enrolled: 5000 + i * 300,
            tags: [c.level],
            modules: c.highlights.map((h, idx) => ({
                id: idx + 1,
                title: h,
                duration: '35 min',
                completed: false
            })),
            instructor: 'MamaCare Expert Faculty',
            price: 39 + (i % 5) * 10,
            thumbnail: c.icon,
            color: colors[i % colors.length]
        }));
    }

    getApiBase() {
        return 'http://localhost:5000/api/courses';
    }

    async fetchRecommendations({ stage, goals, preference, experience }) {
        const res = await fetch(`${this.getApiBase()}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stage,
                goals,
                preference,
                experience,
                courses: this.courses.map(c => ({
                    id: c.id,
                    title: c.title,
                    category: c.category,
                    level: c.level,
                    description: c.description
                }))
            })
        });
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        return res.json();
    }

    async fetchModuleLesson(courseId, moduleId) {
        const course = this.getCourseById(courseId);
        const module = course?.modules?.find(m => m.id === moduleId);
        if (!course || !module) throw new Error('Course or module not found');

        const res = await fetch(`${this.getApiBase()}/module-lesson`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseTitle: course.title,
                moduleTitle: module.title,
                moduleIndex: course.modules.findIndex(m => m.id === moduleId) + 1,
                totalModules: course.modules.length,
                stage: this.state.currentStage,
                goals: this.state.learningGoals
            })
        });
        if (!res.ok) throw new Error('Failed to fetch lesson');
        return res.json();
    }

    async fetchExpertAnswer(question, courseContext) {
        const res = await fetch(`${this.getApiBase()}/expert-qa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,
                stage: this.state.currentStage,
                courseContext
            })
        });
        if (!res.ok) throw new Error('Failed to get expert answer');
        return res.json();
    }

    async fetchCommunityInsight(topic) {
        const res = await fetch(`${this.getApiBase()}/community-insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, stage: this.state.currentStage })
        });
        if (!res.ok) throw new Error('Failed to get community insight');
        return res.json();
    }

    recordLearningActivity() {
        const today = new Date().toDateString();
        const last = localStorage.getItem('lastLearningDate');
        let streak = parseInt(localStorage.getItem('learningStreak') || '0', 10);
        if (last !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            streak = last === yesterday.toDateString() ? streak + 1 : 1;
            localStorage.setItem('learningStreak', String(streak));
            localStorage.setItem('lastLearningDate', today);
        }
        return streak;
    }

    // Load user progress from localStorage
    loadUserProgress() {
        const saved = localStorage.getItem('courseProgress');
        return saved ? JSON.parse(saved) : {};
    }

    // Save user progress to localStorage
    saveUserProgress() {
        localStorage.setItem('courseProgress', JSON.stringify(this.userProgress));
    }

    // Load enrollments from localStorage
    loadEnrollments() {
        const saved = localStorage.getItem('courseEnrollments');
        console.log('Loading enrollments from localStorage:', saved);
        const enrollments = saved ? JSON.parse(saved) : [];
        console.log('Loaded enrollments:', enrollments);
        return enrollments;
    }

    // Save enrollments to localStorage
    saveEnrollments() {
        console.log('Saving enrollments:', this.enrollments);
        localStorage.setItem('courseEnrollments', JSON.stringify(this.enrollments));
        console.log('Enrollments saved to localStorage');
    }

    // Load learning path from localStorage
    loadLearningPath() {
        const saved = localStorage.getItem('learningPath');
        return saved ? JSON.parse(saved) : null;
    }

    // Save learning path to localStorage
    saveLearningPath() {
        localStorage.setItem('learningPath', JSON.stringify(this.learningPath));
    }

    // Load achievements from localStorage
    loadAchievements() {
        const saved = localStorage.getItem('courseAchievements');
        return saved ? JSON.parse(saved) : [];
    }

    // Save achievements to localStorage
    saveAchievements() {
        localStorage.setItem('courseAchievements', JSON.stringify(this.achievements));
    }

    // Add achievement
    addAchievement(achievement) {
        if (!this.achievements.find(a => a.id === achievement.id)) {
            this.achievements.push({
                ...achievement,
                earnedAt: new Date().toISOString()
            });
            this.saveAchievements();
            return true;
        }
        return false;
    }

    // Get all achievements
    getAchievements() {
        return this.achievements;
    }

    // Get all courses
    getAllCourses() {
        return this.courses;
    }

    // Get course by ID
    getCourseById(id) {
        return this.courses.find(course => course.id === id);
    }

    // Get courses by category
    getCoursesByCategory(category) {
        return this.courses.filter(course => course.category === category);
    }

    // Get featured courses
    getFeaturedCourses() {
        return this.courses.filter(course => course.tags.includes('bestseller') || course.rating >= 4.8);
    }

    // Enroll in a course
    enrollInCourse(courseId) {
        console.log('CourseManager.enrollInCourse called with:', courseId);
        console.log('Current enrollments:', this.enrollments);
        
        if (!this.enrollments.includes(courseId)) {
            this.enrollments.push(courseId);
            this.userProgress[courseId] = {
                enrolledAt: new Date().toISOString(),
                completedModules: [],
                progress: 0,
                lastAccessed: new Date().toISOString()
            };
            this.saveEnrollments();
            this.saveUserProgress();
            console.log('Enrollment successful. New enrollments:', this.enrollments);
            return true;
        }
        console.log('Already enrolled');
        return false;
    }

    // Check if user is enrolled in a course
    isEnrolled(courseId) {
        return this.enrollments.includes(courseId);
    }

    // Mark module as completed
    completeModule(courseId, moduleId) {
        if (this.userProgress[courseId]) {
            if (!this.userProgress[courseId].completedModules.includes(moduleId)) {
                this.userProgress[courseId].completedModules.push(moduleId);
                const course = this.getCourseById(courseId);
                const progress = (this.userProgress[courseId].completedModules.length / course.modules.length) * 100;
                this.userProgress[courseId].progress = progress;
                this.userProgress[courseId].lastAccessed = new Date().toISOString();
                this.saveUserProgress();
                
                // Check for achievements
                this.checkAchievements(courseId, progress);
                
                return progress;
            }
        }
        return null;
    }

    // Check and award achievements
    checkAchievements(courseId, progress) {
        const course = this.getCourseById(courseId);
        
        // Course completion achievement
        if (progress === 100) {
            this.addAchievement({
                id: `completed-${courseId}`,
                title: `${course.title} Expert`,
                description: `Completed ${course.title}`,
                icon: '🏆',
                type: 'course_completion'
            });
        }
        
        // First course achievement
        if (this.enrollments.length === 1 && progress > 0) {
            this.addAchievement({
                id: 'first-course',
                title: 'First Steps',
                description: 'Started your first course',
                icon: '🎯',
                type: 'milestone'
            });
        }
        
        // Streak achievement
        const streak = this.calculateStreak();
        if (streak === 7) {
            this.addAchievement({
                id: '7-day-streak',
                title: '7-Day Learning Streak',
                description: 'Keep it going!',
                icon: '🔥',
                type: 'streak'
            });
        }
    }

    // Get course progress
    getCourseProgress(courseId) {
        return this.userProgress[courseId] || { progress: 0, completedModules: [] };
    }

    // Get overall learning statistics
    getLearningStats() {
        const totalEnrolled = this.enrollments.length;
        const totalCompleted = Object.values(this.userProgress).filter(p => p.progress === 100).length;
        const totalHours = this.enrollments.reduce((acc, id) => {
            const course = this.getCourseById(id);
            const progress = this.userProgress[id]?.progress || 0;
            return acc + (parseFloat(course.duration) * (progress / 100));
        }, 0);
        const currentStreak = this.calculateStreak();

        return {
            coursesCompleted: totalCompleted,
            coursesEnrolled: totalEnrolled,
            hoursLearned: totalHours.toFixed(1),
            currentStreak
        };
    }

    // Calculate learning streak
    calculateStreak() {
        const streak = parseInt(localStorage.getItem('learningStreak') || '7');
        const lastAccessed = localStorage.getItem('lastLearningDate');
        const today = new Date().toDateString();
        
        if (lastAccessed !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastAccessed === yesterday.toDateString()) {
                localStorage.setItem('learningStreak', streak + 1);
                localStorage.setItem('lastLearningDate', today);
                return streak + 1;
            } else if (lastAccessed !== today) {
                localStorage.setItem('learningStreak', '1');
                localStorage.setItem('lastLearningDate', today);
                return 1;
            }
        }
        
        return streak;
    }

    // Local fallback recommendations
    getAIRecommendations() {
        const stageMapping = {
            planning: ['childbirth', 'fertility-basics', 'cpr'],
            'first-trimester': ['complete-pregnancy', 'nutrition-pregnancy', 'childbirth'],
            'second-trimester': ['complete-pregnancy', 'labor-delivery', 'breastfeeding'],
            'third-trimester': ['labor-delivery', 'breastfeeding-mastery', 'newborn-essentials', 'cpr'],
            postpartum: ['breastfeeding', 'newborn', 'postpartum-recovery', 'sleep'],
            infant: ['sleep', 'baby-development', 'solids', 'cpr']
        };
        const ids = (stageMapping[this.state.currentStage] || ['childbirth', 'newborn'])
            .filter(id => !this.isEnrolled(id));
        return ids.map(id => this.getCourseById(id)).filter(Boolean).slice(0, 5);
    }

    async getAIRecommendationsLive({ stage, goals, preference, experience }) {
        try {
            const data = await this.fetchRecommendations({
                stage: stage || this.state.currentStage,
                goals: goals || this.state.learningGoals,
                preference: preference || this.state.learningPace,
                experience
            });
            const courses = (data.courseIds || [])
                .map(id => this.getCourseById(id))
                .filter(Boolean);
            return { courses, insights: data.insights, pathName: data.pathName, estimatedWeeks: data.estimatedWeeks };
        } catch (err) {
            console.warn('Llama 3.3 70B recommendations fallback:', err.message);
            return {
                courses: this.getAIRecommendations(),
                insights: 'Personalized recommendations based on your profile. Connect to the server for live AI curation.',
                pathName: 'Recommended Path',
                estimatedWeeks: 4
            };
        }
    }

    // Generate personalized learning path
    generateLearningPath(type) {
        const paths = {
            'first-time': {
                name: 'First-Time Mother',
                courses: ['childbirth', 'breastfeeding', 'newborn', 'sleep', 'cpr', 'solids'],
                duration: '3 Months',
                description: 'Complete guidance from pregnancy through first year'
            },
            'working': {
                name: 'Working Mother',
                courses: ['childbirth', 'newborn', 'sleep', 'cpr'],
                duration: '2 Months',
                description: 'Balance career and motherhood with flexible learning'
            },
            'experienced': {
                name: 'Experienced Mother',
                courses: ['breastfeeding', 'sleep', 'solids'],
                duration: '1.5 Months',
                description: 'Advanced techniques for multiple children'
            }
        };

        const path = paths[type] || paths['first-time'];
        this.learningPath = path;
        this.saveLearningPath();
        return path;
    }

    // Start learning path
    startLearningPath(type) {
        const path = this.generateLearningPath(type);
        path.courses.forEach(courseId => {
            this.enrollInCourse(courseId);
        });
        return path;
    }

    // Update user preferences
    updatePreferences(prefs) {
        this.state.preferences = { ...this.state.preferences, ...prefs };
        localStorage.setItem('coursePreferences', JSON.stringify(this.state.preferences));
    }

    // Set pregnancy stage
    setPregnancyStage(stage) {
        this.state.currentStage = stage;
        localStorage.setItem('pregnancyStage', stage);
        return this.getAIRecommendations();
    }

    // Set learning goals
    setLearningGoals(goals) {
        this.state.learningGoals = goals;
        localStorage.setItem('learningGoals', JSON.stringify(goals));
        return this.getAIRecommendations();
    }

    // Set learning pace
    setLearningPace(pace) {
        this.state.learningPace = pace;
        localStorage.setItem('learningPace', pace);
    }

    // Search courses
    searchCourses(query) {
        const lowerQuery = query.toLowerCase();
        return this.courses.filter(course => 
            course.title.toLowerCase().includes(lowerQuery) ||
            course.description.toLowerCase().includes(lowerQuery) ||
            course.category.toLowerCase().includes(lowerQuery) ||
            course.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // Filter courses by level
    filterByLevel(level) {
        if (level === 'all') return this.courses;
        return this.courses.filter(course => course.level === level);
    }

    // Get course certificate
    getCertificate(courseId) {
        const progress = this.getCourseProgress(courseId);
        if (progress.progress === 100) {
            const course = this.getCourseById(courseId);
            return {
                courseId,
                courseName: course.title,
                completedAt: progress.lastAccessed,
                instructor: course.instructor
            };
        }
        return null;
    }

    // Get all certificates
    getAllCertificates() {
        return this.enrollments
            .map(id => this.getCertificate(id))
            .filter(Boolean);
    }
}

// Initialize global course manager
window.courseManager = new CourseManager();
console.log('CourseManager initialized:', window.courseManager);
console.log('Initial enrollments:', window.courseManager.enrollments);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CourseManager };
}
