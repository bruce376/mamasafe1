/**
 * Mamasafe Advanced Course Intelligence Engine v3.0
 * Robust state management and AI integration for maternal education.
 */

class CourseManager {
    constructor() {
        this.API_BASE = `${this.getBackendOrigin()}/api/courses`;
        this.courses = this.initializeCourses();
        this.userProgress = this.loadState('courseProgress', {});
        this.enrollments = this.loadState('courseEnrollments', []);
        this.achievements = this.loadState('courseAchievements', []);
        
        this.state = {
            currentStage: localStorage.getItem('pregnancyStage') || 'planning',
            learningGoals: JSON.parse(localStorage.getItem('learningGoals') || '[]'),
            learningPace: localStorage.getItem('learningPace') || 'flexible'
        };
        this.pruneMissingCourses();
        
        console.log('Mamasafe Course Intelligence Engine initialized.');
    }

    getBackendOrigin() {
        if (window.MAMASAFE_API_BASE) {
            return window.MAMASAFE_API_BASE.replace(/\/$/, '');
        }

        const { protocol, hostname, port, origin } = window.location;
        const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];

        if (localHosts.includes(hostname) && port !== '5000') {
            return `${protocol}//${hostname}:5000`;
        }

        return origin;
    }

    loadState(key, fallback) {
        const saved = localStorage.getItem(key);
        try {
            return saved ? JSON.parse(saved) : fallback;
        } catch (e) {
            console.error(`Error loading state for ${key}:`, e);
            return fallback;
        }
    }

    saveState(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    pruneMissingCourses() {
        const validIds = new Set(this.courses.map(course => course.id));
        const nextEnrollments = this.enrollments.filter(id => validIds.has(id));
        let changed = nextEnrollments.length !== this.enrollments.length;

        Object.keys(this.userProgress).forEach(id => {
            if (!validIds.has(id)) {
                delete this.userProgress[id];
                changed = true;
            }
        });

        if (changed) {
            this.enrollments = nextEnrollments;
            this.saveState('courseEnrollments', this.enrollments);
            this.saveState('courseProgress', this.userProgress);
        }
    }

    initializeCourses() {
        // Advanced Educational Catalog for Women - Deep Knowledge Matrix
        const advancedCourses = [
            {
                id: 'childbirth',
                title: 'Complete Childbirth Mastery',
                description: 'A deep-dive into the physiological and psychological architecture of labor and birth.',
                category: 'Pregnancy',
                level: 'Masterclass',
                thumbnail: '🤰',
                color: '#667eea',
                topics: [
                    { 
                        id: 1, 
                        title: 'Physiological Stages of Labor', 
                        duration: '60 min',
                        quickNotes: 'Understanding the cervical transformation and hormonal cascades.',
                        detailedContent: [
                            {
                                heading: 'Phase 1: Latent Labor Architecture',
                                body: 'During this phase, the cervix softens, thins (effacement), and begins to dilate to 6cm. Hormonally, Prostaglandins are the key drivers here, preparing the tissue for the more intense Oxytocin-driven active phase. Contractions may be 5-30 minutes apart and last 30-45 seconds. Data indicates that staying home during this phase reduces the likelihood of unnecessary medical interventions by 40%.'
                            },
                            {
                                heading: 'Phase 2: Active Labor Dynamics',
                                body: 'Cervical dilation accelerates from 6cm to 10cm. Contractions become stronger, longer (60-90s), and more frequent (2-3m apart). The body enters a "Labor Land" state where the neocortex quiets and the primitive brain takes over. Pain management vectors like hydrotherapy (warm water) have been shown to reduce the need for pharmacological analgesia by up to 30%.'
                            },
                            {
                                heading: 'Phase 3: Transition & The Fear-Tension-Pain Cycle',
                                body: 'The most intense phase where the cervix dilates from 8cm to 10cm. Adrenaline may spike, causing "transition shakes" or nausea. Understanding that this intensity is a sign that birth is imminent is crucial for psychological resilience. Techniques like low-vowel vocalization (moaning) help keep the pelvic floor relaxed.'
                            }
                        ]
                    },
                    { 
                        id: 2, 
                        title: 'The Hormonal Symphony of Birth', 
                        duration: '45 min',
                        quickNotes: 'Mapping the roles of Oxytocin, Endorphins, and Adrenaline.',
                        detailedContent: [
                            {
                                heading: 'Oxytocin: The Molecule of Love',
                                body: 'The primary hormone of labor, responsible for uterine contractions and maternal-infant bonding. It is produced in the hypothalamus. Environment significantly impacts oxytocin production; dim lights, privacy, and warmth are "oxytocin-positive" vectors. Synthetic oxytocin (Pitocin) does not cross the blood-brain barrier and thus does not provide the same psychological benefits as natural oxytocin.'
                            },
                            {
                                heading: 'Beta-Endorphins: Natural Pain Relief',
                                body: 'The body\'s internal morphine. These levels rise naturally in response to labor intensity. They promote a state of altered consciousness that helps women cope with pain. Over-use of early epidurals can blunt the natural endorphin response.'
                            },
                            {
                                heading: 'Adrenaline/Catecholamines: The Survival Response',
                                body: 'In early labor, high adrenaline (caused by fear or bright lights) can stall contractions. However, a "fetus ejection reflex" spike of adrenaline at 10cm dilation provides the mother with the energy needed for the pushing stage.'
                            }
                        ]
                    },
                    {
                        id: 3,
                        title: 'The Biomechanics of Pelvic Opening',
                        duration: '50 min',
                        quickNotes: 'How movement and gravity facilitate the descent of the baby.',
                        detailedContent: [
                            {
                                heading: 'The Dynamic Pelvis',
                                body: 'The pelvis is not a static ring of bone but a collection of joints (sacroiliac and pubic symphysis) that expand under the influence of Relaxin. Squatting can increase the pelvic outlet by 20-30%. Asymmetric positions like "curb walking" or lunging can help rotate a baby who is in an occiput posterior (sunny-side up) position.'
                            },
                            {
                                heading: 'The Role of the Sacrum',
                                body: 'The sacrum (the tailbone area) must be able to move backwards to let the baby pass. This is why lying on your back (lithotomy position) can actually narrow the birth canal by 10-15%. Upright or forward-leaning positions are biomechanically superior for most women.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'nutrition',
                title: 'Maternal Nutrition Matrix',
                description: 'Advanced biochemistry of prenatal and postpartum fuel.',
                category: 'Nutrition',
                level: 'Advanced',
                thumbnail: '🥗',
                color: '#00d4aa',
                topics: [
                    { 
                        id: 1, 
                        title: 'Micronutrient Bio-Availability', 
                        duration: '50 min',
                        quickNotes: 'Optimizing absorption of Folic Acid, Choline, and DHA.',
                        detailedContent: [
                            {
                                heading: 'Folic Acid vs. Methylfolate',
                                body: 'Approximately 40% of the population has an MTHFR gene mutation that makes it difficult to convert synthetic folic acid into its active form. Using L-Methylfolate ensures direct bio-availability for fetal neural tube development. Essential data: 400-800mcg daily is the clinical standard.'
                            },
                            {
                                heading: 'Choline: The Brain Builder',
                                body: 'Often missing from prenatal vitamins, Choline is critical for fetal hippocampal development (memory and learning). Mothers should aim for 450mg daily. Primary sources include eggs (especially the yolk) and beef liver.'
                            },
                            {
                                heading: 'DHA/Omega-3 Fatty Acids',
                                body: 'DHA constitutes 20% of the brain\'s weight. Supplementation with high-quality, mercury-free fish oil supports fetal eye development and reduces the risk of preterm birth by 11%.'
                            }
                        ]
                    },
                    { 
                        id: 2, 
                        title: 'Gestational Glucose Management', 
                        duration: '45 min',
                        quickNotes: 'Preventing spikes and managing insulin sensitivity.',
                        detailedContent: [
                            {
                                heading: 'The Glycemic Load Strategy',
                                body: 'Instead of just tracking calories, focus on Glycemic Load (GL). Pairing complex carbohydrates with healthy fats and proteins slows the glucose entry into the bloodstream. This prevents the "insulin spike" that can lead to large-for-gestational-age babies and maternal fatigue.'
                            },
                            {
                                heading: 'Fiber and the Microbiome',
                                body: 'A high-fiber diet (25-30g daily) supports the maternal microbiome, which in turn influences the baby\'s initial gut colonization. Research shows maternal probiotic intake may reduce the risk of infant eczema by 20%.'
                            }
                        ]
                    },
                    {
                        id: 3,
                        title: 'Epigenetics and Maternal Diet',
                        duration: '40 min',
                        quickNotes: 'How your current diet influences your baby\'s long-term health markers.',
                        detailedContent: [
                            {
                                heading: 'The Barker Hypothesis',
                                body: 'Fetal programming suggests that the intrauterine environment—specifically maternal nutrition—can "program" the baby\'s metabolic set-points. Data shows that a balanced, nutrient-dense maternal diet can reduce the offspring\'s risk of developing Type 2 Diabetes and Cardiovascular disease in adulthood.'
                            },
                            {
                                heading: 'Methylation Pathways',
                                body: 'Methyl donors like B12, Folate, and Choline act as "switches" on the baby\'s DNA. This is epigenetics in action. Proper intake ensures that protective genes are "on" and harmful ones are "off" during critical developmental windows.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'sleep-science',
                title: 'Infant Sleep Engineering',
                description: 'Biological foundations of infant and maternal rest cycles.',
                category: 'Sleep',
                level: 'Masterclass',
                thumbnail: '😴',
                color: '#667eea',
                topics: [
                    { 
                        id: 1, 
                        title: 'Sleep Cycle Architecture', 
                        duration: '55 min',
                        quickNotes: 'Mapping REM and Deep Sleep in newborns.',
                        detailedContent: [
                            {
                                heading: 'Newborn vs. Adult Sleep Cycles',
                                body: 'Adult sleep cycles are ~90 minutes, while newborn cycles are only ~45-50 minutes. Newborns spend 50% of their sleep in REM (Active) sleep, which is critical for rapid brain growth. This is why babies "twitch" or make noises during sleep—it\'s neural processing, not necessarily waking up.'
                            },
                            {
                                heading: 'The 4-Month Neural Maturation',
                                body: 'Commonly called the "4-month regression," this is actually a permanent biological shift where infant sleep cycles become more like adult cycles, including the introduction of Stage 3/4 Deep Sleep. This requires a shift in how parents approach soothing, as the baby is now more aware of their environment.'
                            }
                        ]
                    },
                    {
                        id: 2,
                        title: 'Melatonin and Circadian Anchors',
                        duration: '40 min',
                        quickNotes: 'Using light and temperature to anchor the biological clock.',
                        detailedContent: [
                            {
                                heading: 'The Role of Darkness',
                                body: 'Total darkness triggers the pineal gland to release Melatonin. Using red-spectrum nightlights for middle-of-the-night changes prevents the suppression of melatonin, allowing both mother and baby to return to sleep 20% faster.'
                            },
                            {
                                heading: 'Morning Sunlight Anchoring',
                                body: 'Exposure to natural sunlight between 7am-9am helps set the baby\'s "master clock" (the SCN in the hypothalamus). Data suggests that infants exposed to more morning light sleep better at night by the age of 8 weeks.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'mental-health',
                title: 'Matrescence & Neural Resilience',
                description: 'The psychological and neurological evolution of motherhood.',
                category: 'Wellness',
                level: 'Advanced',
                thumbnail: '🧠',
                color: '#667eea',
                topics: [
                    {
                        id: 1,
                        title: 'Matrescence: The Identity Shift',
                        duration: '60 min',
                        quickNotes: 'Understanding the psychological transition as significant as adolescence.',
                        detailedContent: [
                            {
                                heading: 'The Concept of Matrescence',
                                body: 'Coined by anthropologist Dana Raphael, Matrescence describes the physical, emotional, and social transition into motherhood. Like adolescence, it involves massive hormonal shifts and an identity overhaul. Acknowledging that "the woman you were is evolving" reduces the psychological friction of the transition.'
                            },
                            {
                                heading: 'Neurological Remodeling',
                                body: 'MRI studies show that a mother\'s brain undergoes significant gray matter volume changes in areas responsible for social cognition and empathy. This is a "neural upgrade" designed to help you understand and respond to your infant\'s needs, not a loss of cognitive function (despite the "mom brain" label).'
                            }
                        ]
                    },
                    {
                        id: 2,
                        title: 'Anxiety and the Amygdala',
                        duration: '45 min',
                        quickNotes: 'Managing the hyper-vigilance of early motherhood.',
                        detailedContent: [
                            {
                                heading: 'The Hyper-Vigilant Brain',
                                body: 'Post-birth, the amygdala (the brain\'s threat detector) becomes hyper-active. This is evolutionary—to keep the baby safe. However, when this vigilance becomes intrusive, it can lead to Perinatal Anxiety. Cognitive Behavioral Therapy (CBT) techniques, like "thought challenging," have an 80% success rate in reducing these symptoms.'
                            },
                            {
                                heading: 'The Power of Co-Regulation',
                                body: 'Your nervous system and your baby\'s are linked. When you practice deep, rhythmic breathing, you are "co-regulating" your baby\'s nervous system. This reduces cortisol levels in both of you simultaneously.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'exercise-guidance',
                title: 'Pregnancy Exercise Guidance',
                description: 'Safe movement, strength, and recovery routines for each stage of pregnancy.',
                category: 'Fitness',
                level: 'Guided',
                thumbnail: '🏃‍♀️',
                color: '#00b894',
                topics: [
                    {
                        id: 1,
                        title: 'Safe Movement Foundations',
                        duration: '35 min',
                        quickNotes: 'Learn how to choose low-impact movement, warm up, cool down, and listen to your body.',
                        detailedContent: [
                            {
                                heading: 'Movement with Awareness',
                                body: 'A helpful pregnancy routine prioritizes comfort, breathing, hydration, and steady effort. Walking, swimming, gentle mobility, and supervised prenatal yoga are common foundations because they are easy to adjust as energy changes.'
                            },
                            {
                                heading: 'Stop Signals',
                                body: 'Pause activity and contact a clinician if you notice bleeding, chest pain, dizziness, fluid leakage, severe headache, painful contractions, or shortness of breath before exertion. A personalized plan should always respect your medical history.'
                            }
                        ]
                    },
                    {
                        id: 2,
                        title: 'Trimester Exercise Planner',
                        duration: '45 min',
                        quickNotes: 'Adjust intensity, positions, and goals across early pregnancy, mid-pregnancy, and late pregnancy.',
                        detailedContent: [
                            {
                                heading: 'First and Second Trimester Adjustments',
                                body: 'Early pregnancy often requires energy management. The middle months may feel stronger, but balance and joint comfort can change quickly. Build routines around short sessions that can be scaled up or down.'
                            },
                            {
                                heading: 'Third Trimester Support',
                                body: 'Late pregnancy movement often shifts toward mobility, gentle strength, pelvic floor awareness, breath work, and rest. The goal is support, not performance.'
                            }
                        ]
                    },
                    {
                        id: 3,
                        title: 'Pelvic Floor and Recovery Prep',
                        duration: '40 min',
                        quickNotes: 'Use breath, posture, and gentle pelvic floor awareness to prepare for birth and recovery.',
                        detailedContent: [
                            {
                                heading: 'Coordination Over Force',
                                body: 'Pelvic floor work is not only squeezing. It includes relaxing, breathing, posture, and coordination. Gentle awareness can make recovery conversations with your care team more productive.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'warning-signs',
                title: 'Pregnancy Warning Signs Guide',
                description: 'A calm, practical guide for recognizing urgent symptoms and knowing what action to take.',
                category: 'Safety',
                level: 'Essential',
                thumbnail: '⚠️',
                color: '#ff6b9d',
                topics: [
                    {
                        id: 1,
                        title: 'Urgent Symptoms Checklist',
                        duration: '30 min',
                        quickNotes: 'Understand which symptoms should prompt urgent contact with a healthcare professional.',
                        detailedContent: [
                            {
                                heading: 'Escalation Cues',
                                body: 'Heavy bleeding, severe abdominal pain, severe headache, vision changes, sudden swelling, fever, fluid leakage, chest pain, and major changes in fetal movement deserve prompt medical guidance. When unsure, it is safer to call your care team.'
                            }
                        ]
                    },
                    {
                        id: 2,
                        title: 'Fetal Movement Awareness',
                        duration: '25 min',
                        quickNotes: 'Learn how to notice your baby\'s normal activity pattern and respond to meaningful changes.',
                        detailedContent: [
                            {
                                heading: 'Pattern Awareness',
                                body: 'Many parents learn their baby\'s usual active times. A noticeable decrease from your normal pattern should be discussed with your clinician or maternity unit.'
                            }
                        ]
                    },
                    {
                        id: 3,
                        title: 'Care Escalation Plan',
                        duration: '35 min',
                        quickNotes: 'Prepare contacts, transport, notes, and questions before an urgent moment happens.',
                        detailedContent: [
                            {
                                heading: 'Plan Before Stress',
                                body: 'Keep your care team number, emergency number, medication list, pregnancy week, allergies, and support contacts easy to find. A prepared plan lowers friction when you need help fast.'
                            }
                        ]
                    }
                ]
            }
        ];

        return advancedCourses;
    }

    getCourseById(id) {
        return this.courses.find(c => c.id === id);
    }

    getAllCourses() {
        return this.courses;
    }

    isEnrolled(courseId) {
        return this.enrollments.includes(courseId);
    }

    enrollInCourse(courseId) {
        if (!this.isEnrolled(courseId)) {
            this.enrollments.push(courseId);
            this.userProgress[courseId] = {
                enrolledAt: new Date().toISOString(),
                completedTopics: [],
                progress: 0,
                lastAccessed: new Date().toISOString()
            };
            this.saveState('courseEnrollments', this.enrollments);
            this.saveState('courseProgress', this.userProgress);
            return true;
        }
        return false;
    }

    completeTopic(courseId, topicId) {
        if (this.userProgress[courseId]) {
            if (!this.userProgress[courseId].completedTopics.includes(topicId)) {
                this.userProgress[courseId].completedTopics.push(topicId);
                const course = this.getCourseById(courseId);
                const progress = (this.userProgress[courseId].completedTopics.length / course.topics.length) * 100;
                this.userProgress[courseId].progress = progress;
                this.userProgress[courseId].lastAccessed = new Date().toISOString();
                this.saveState('courseProgress', this.userProgress);
                return progress;
            }
        }
        return null;
    }

    getCourseProgress(courseId) {
        return this.userProgress[courseId] || { progress: 0, completedTopics: [] };
    }

    async fetchRecommendations(profile) {
        const res = await fetch(`${this.API_BASE}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...profile,
                courses: this.courses.map(c => ({
                    id: c.id,
                    title: c.title,
                    category: c.category,
                    level: c.level,
                    description: c.description
                }))
            })
        });
        if (!res.ok) throw new Error('AI Sync Failed');
        return res.json();
    }

    async fetchTopicNotes(courseId, topicId) {
        const course = this.getCourseById(courseId);
        const topic = course?.topics?.find(t => t.id === topicId);
        if (!course || !topic) throw new Error('Topic Node Not Found');

        const res = await fetch(`${this.API_BASE}/module-lesson`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseTitle: course.title,
                moduleTitle: topic.title,
                moduleIndex: course.topics.findIndex(t => t.id === topicId) + 1,
                totalModules: course.topics.length,
                stage: this.state.currentStage,
                goals: this.state.learningGoals
            })
        });
        if (!res.ok) throw new Error('Lesson Sync Failed');
        return res.json();
    }

    async fetchExpertAnswer(question, topicContext = null) {
        const res = await fetch(`${this.API_BASE}/expert-qa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,
                stage: this.state.currentStage,
                courseContext: topicContext
            })
        });
        if (!res.ok) throw new Error('Expert Sync Failed');
        return res.json();
    }

    async fetchCommunityInsight(topic) {
        const res = await fetch(`${this.API_BASE}/community-insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, stage: this.state.currentStage })
        });
        if (!res.ok) throw new Error('Community Sync Failed');
        return res.json();
    }

    getLearningStats() {
        const totalEnrolled = this.enrollments.length;
        const totalCompleted = Object.values(this.userProgress).filter(p => p.progress === 100).length;
        const streak = parseInt(localStorage.getItem('learningStreak') || '0', 10);

        return {
            coursesEnrolled: totalEnrolled,
            coursesCompleted: totalCompleted,
            currentStreak: streak
        };
    }

    getAchievements() {
        return this.achievements;
    }

    setPregnancyStage(stage) {
        this.state.currentStage = stage;
        localStorage.setItem('pregnancyStage', stage);
    }

    setLearningGoals(goals) {
        this.state.learningGoals = goals;
        localStorage.setItem('learningGoals', JSON.stringify(goals));
    }

    setLearningPace(pace) {
        this.state.learningPace = pace;
        localStorage.setItem('learningPace', pace);
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
}

// Global initialization
window.courseManager = new CourseManager();
console.log('CourseManager global instance created.');
