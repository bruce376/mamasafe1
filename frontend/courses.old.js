// ==================== ADVANCED COURSES SYSTEM ====================

// Course Database
const coursesDatabase = [
    {
        id: 'complete-pregnancy',
        name: 'The Complete Pregnancy Guide',
        category: 'pregnancy',
        level: 'beginner',
        duration: 'long',
        price: 89.99,
        rating: 4.8,
        reviews: 1245,
        icon: '🤰',
        description: 'Master pregnancy from conception to postpartum recovery.',
        badge: 'bestseller',
        instructor: {
            name: 'Dr. Sarah Mitchell',
            title: 'OB/GYN Specialist',
            type: 'physician',
            avatar: 'SM'
        },
        image_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        highlights: [
            '8 comprehensive modules',
            '12+ hours of expert content',
            'Live Q&A sessions',
            'Downloadable resources'
        ],
        learningOutcomes: [
            'Understand pregnancy week-by-week',
            'Learn about healthy nutrition & exercise',
            'Know warning signs & when to seek help',
            'Prepare for labor and delivery'
        ]
    },
    {
        id: 'newborn-essentials',
        name: 'Newborn Essentials: First Week',
        category: 'newborn',
        level: 'beginner',
        duration: 'medium',
        price: 49.99,
        rating: 4.7,
        reviews: 892,
        icon: '👶',
        description: 'Everything you need to know about caring for your newborn in the first week.',
        badge: 'new',
        instructor: {
            name: 'Nurse Emma Johnson',
            title: 'Pediatric Nurse',
            type: 'specialist',
            avatar: 'EJ'
        },
        highlights: [
            '5 practical modules',
            '6 hours of content',
            'Video demonstrations',
            'Feeding & sleep guides'
        ],
        learningOutcomes: [
            'Master basic newborn care',
            'Understand feeding options',
            'Learn diaper & hygiene care',
            'Recognize normal newborn behaviors'
        ]
    },
    {
        id: 'breastfeeding-mastery',
        name: 'Breastfeeding Mastery',
        category: 'baby-care',
        level: 'beginner',
        duration: 'medium',
        price: 39.99,
        rating: 4.9,
        reviews: 2103,
        icon: '🍼',
        description: 'Learn techniques, troubleshooting, and nutrition for successful breastfeeding.',
        badge: 'trending',
        instructor: {
            name: 'Lactation Consultant Maya Patel',
            title: 'IBCLC Certified',
            type: 'certified',
            avatar: 'MP'
        },
        highlights: [
            '7 modules',
            '8 hours of content',
            'Troubleshooting guide',
            'Lifetime access'
        ],
        learningOutcomes: [
            'Master proper latch techniques',
            'Solve common breastfeeding issues',
            'Understand milk supply',
            'Balance breastfeeding with lifestyle'
        ]
    },
    {
        id: 'infant-sleep',
        name: 'Infant Sleep Solutions',
        category: 'baby-care',
        level: 'intermediate',
        duration: 'medium',
        price: 59.99,
        rating: 4.6,
        reviews: 756,
        icon: '😴',
        description: 'Science-based strategies for better infant sleep and rest for parents.',
        instructor: {
            name: 'Dr. James Wilson',
            title: 'Sleep Specialist',
            type: 'physician',
            avatar: 'JW'
        },
        highlights: [
            '6 modules',
            '7 hours of content',
            'Sleep schedule templates',
            'Email support'
        ],
        learningOutcomes: [
            'Understand newborn sleep patterns',
            'Create healthy sleep habits',
            'Learn safe sleep practices',
            'Handle sleep regressions'
        ]
    },
    {
        id: 'postpartum-recovery',
        name: 'Postpartum Recovery & Wellness',
        category: 'wellness',
        level: 'intermediate',
        duration: 'long',
        price: 69.99,
        rating: 4.7,
        reviews: 634,
        icon: '💪',
        description: 'Physical and mental health recovery after birth. Include exercise and nutrition.',
        instructor: {
            name: 'Physical Therapist Lisa Chen',
            title: 'Pelvic Floor Specialist',
            type: 'specialist',
            avatar: 'LC'
        },
        highlights: [
            '8 modules',
            '10 hours of content',
            'Exercise videos',
            'Mental health support'
        ],
        learningOutcomes: [
            'Understand postpartum changes',
            'Safe postpartum exercises',
            'Manage postpartum depression',
            'Nutrition for recovery'
        ]
    },
    {
        id: 'nutrition-pregnancy',
        name: 'Pregnancy Nutrition Masterclass',
        category: 'nutrition',
        level: 'intermediate',
        duration: 'medium',
        price: 44.99,
        rating: 4.5,
        reviews: 521,
        icon: '🥗',
        description: 'Complete nutrition guide for healthy pregnancy and fetal development.',
        instructor: {
            name: 'Nutritionist Dr. Amanda Foster',
            title: 'Registered Dietitian',
            type: 'specialist',
            avatar: 'AF'
        },
        highlights: [
            '6 modules',
            '5 hours of content',
            'Meal plan templates',
            'Recipe videos'
        ],
        learningOutcomes: [
            'Key nutrients for pregnancy',
            'Safe & unsafe foods',
            'Create balanced meal plans',
            'Manage gestational diabetes'
        ]
    },
    {
        id: 'toddler-behavior',
        name: 'Toddler Behavior & Discipline',
        category: 'toddler',
        level: 'intermediate',
        duration: 'medium',
        price: 54.99,
        rating: 4.6,
        reviews: 847,
        icon: '🧒',
        description: 'Positive discipline strategies and understanding toddler development.',
        instructor: {
            name: 'Child Psychologist Dr. Robert Brown',
            title: 'Developmental Expert',
            type: 'physician',
            avatar: 'RB'
        },
        highlights: [
            '7 modules',
            '8 hours of content',
            'Behavior charts',
            'Expert advice Q&A'
        ],
        learningOutcomes: [
            'Understand toddler development',
            'Positive discipline methods',
            'Handle tantrums effectively',
            'Build emotional intelligence'
        ]
    },
    {
        id: 'labor-delivery',
        name: 'Preparing for Labor & Delivery',
        category: 'pregnancy',
        level: 'intermediate',
        duration: 'medium',
        price: 49.99,
        rating: 4.8,
        reviews: 1092,
        icon: '🏥',
        description: 'Complete preparation for labor, delivery, and immediate postpartum.',
        badge: 'bestseller',
        instructor: {
            name: 'Midwife Caroline White',
            title: 'Birth Educator',
            type: 'certified',
            avatar: 'CW'
        },
        highlights: [
            '7 modules',
            '9 hours of content',
            'Birth plan templates',
            'Partner participation guide'
        ],
        learningOutcomes: [
            'Understand labor stages',
            'Pain management options',
            'Birth plan creation',
            'Partner support techniques'
        ]
    },
    {
        id: 'baby-development',
        name: 'Baby Development First Year',
        category: 'baby-care',
        level: 'beginner',
        duration: 'long',
        price: 79.99,
        rating: 4.7,
        reviews: 1456,
        icon: '📈',
        description: 'Complete guide to understanding baby development from 0-12 months.',
        instructor: {
            name: 'Pediatrician Dr. Michael Lee',
            title: 'Child Development Specialist',
            type: 'physician',
            avatar: 'ML'
        },
        highlights: [
            '12 modules (month by month)',
            '15 hours of content',
            'Milestone checklists',
            'Video demonstrations'
        ],
        learningOutcomes: [
            'Understand month-by-month development',
            'Recognize developmental milestones',
            'Support healthy growth',
            'When to seek medical help'
        ]
    },
    {
        id: 'fertility-basics',
        name: 'Understanding Fertility & Conception',
        category: 'pregnancy',
        level: 'beginner',
        duration: 'short',
        price: 29.99,
        rating: 4.4,
        reviews: 312,
        icon: '🌱',
        description: 'Master your menstrual cycle, ovulation, and optimize conception chances.',
        instructor: {
            name: 'Dr. Natalie Rodriguez',
            title: 'Fertility Specialist',
            type: 'physician',
            avatar: 'NR'
        },
        highlights: [
            '4 modules',
            '3 hours of content',
            'Ovulation calculator',
            'Free resources'
        ],
        learningOutcomes: [
            'Understand your cycle',
            'Track ovulation accurately',
            'Optimize fertility',
            'When to seek fertility help'
        ]
    },
    {
        id: 'vaccinations',
        name: 'Understanding Baby Vaccinations',
        category: 'baby-care',
        level: 'beginner',
        duration: 'short',
        price: 34.99,
        rating: 4.9,
        reviews: 892,
        icon: '💉',
        description: 'Complete guide to childhood vaccines, schedules, and safety.',
        instructor: {
            name: 'Dr. Patricia Green',
            title: 'Immunization Expert',
            type: 'physician',
            avatar: 'PG'
        },
        highlights: [
            '5 modules',
            '4 hours of content',
            'Vaccine schedule charts',
            'Myth-busting guide'
        ],
        learningOutcomes: [
            'Understand vaccine safety',
            'Learn vaccine schedules',
            'Know side effects & benefits',
            'Make informed decisions'
        ]
    },
    {
        id: 'stress-anxiety',
        name: 'Managing Pregnancy Stress & Anxiety',
        category: 'wellness',
        level: 'beginner',
        duration: 'medium',
        price: 39.99,
        rating: 4.7,
        reviews: 623,
        icon: '🧘‍♀️',
        description: 'Mental health techniques and coping strategies for pregnancy anxiety.',
        instructor: {
            name: 'Therapist Dr. Angela Turner',
            title: 'Mental Health Counselor',
            type: 'specialist',
            avatar: 'AT'
        },
        highlights: [
            '6 modules',
            '6 hours of content',
            'Guided meditation & breathing',
            'Anxiety workbook'
        ],
        learningOutcomes: [
            'Identify pregnancy anxiety',
            'Mindfulness & meditation',
            'Stress management techniques',
            'When to seek professional help'
        ]
    },
    {
        id: 'partner-support',
        name: 'Partner\'s Guide to Pregnancy & Newborn',
        category: 'pregnancy',
        level: 'beginner',
        duration: 'medium',
        price: 44.99,
        rating: 4.6,
        reviews: 512,
        icon: '👨‍👩‍👧',
        description: 'Everything partners need to know to support mothers and care for newborns.',
        instructor: {
            name: 'Family Coach David Martinez',
            title: 'Relationship Expert',
            type: 'specialist',
            avatar: 'DM'
        },
        highlights: [
            '7 modules',
            '7 hours of content',
            'Partner communication guide',
            'Practical care instructions'
        ],
        learningOutcomes: [
            'Understand pregnancy changes',
            'Support techniques',
            'Newborn care skills',
            'Maintain relationship health'
        ]
    },
    {
        id: 'working-mom',
        name: 'Balancing Work & Motherhood',
        category: 'wellness',
        level: 'advanced',
        duration: 'long',
        price: 74.99,
        rating: 4.5,
        reviews: 451,
        icon: '💼',
        description: 'Strategies for managing career, motherhood, and self-care balance.',
        instructor: {
            name: 'Career Coach Susan Bailey',
            title: 'Work-Life Balance Expert',
            type: 'specialist',
            avatar: 'SB'
        },
        highlights: [
            '8 modules',
            '9 hours of content',
            'Time management tools',
            'Career planning resources'
        ],
        learningOutcomes: [
            'Time management strategies',
            'Career planning with motherhood',
            'Childcare options & decisions',
            'Prevent burnout'
        ]
    },
    {
        id: 'multiples',
        name: 'Expecting Multiples: Twins & More',
        category: 'pregnancy',
        level: 'intermediate',
        duration: 'long',
        price: 64.99,
        rating: 4.8,
        reviews: 234,
        icon: '👶👶',
        description: 'Specialized guidance for multiple pregnancies and managing multiples.',
        instructor: {
            name: 'Dr. Victoria Holmes',
            title: 'Multiple Birth Specialist',
            type: 'physician',
            avatar: 'VH'
        },
        highlights: [
            '8 modules',
            '10 hours of content',
            'Multiples-specific resources',
            'Community support access'
        ],
        learningOutcomes: [
            'Unique challenges of multiples',
            'Pregnancy complications awareness',
            'Delivery planning for multiples',
            'Caring for multiple infants'
        ]
    },
    {
        id: 'sensory-development',
        name: 'Baby Sensory & Brain Development',
        category: 'baby-care',
        level: 'intermediate',
        duration: 'medium',
        price: 54.99,
        rating: 4.6,
        reviews: 678,
        icon: '🧠',
        description: 'Stimulate baby\'s sensory and cognitive development with science-backed activities.',
        instructor: {
            name: 'Developmental Psychologist Dr. Kevin Nash',
            title: 'Neuroscientist',
            type: 'physician',
            avatar: 'KN'
        },
        highlights: [
            '6 modules',
            '7 hours of content',
            'Activity guides & videos',
            'Developmental milestone checklist'
        ],
        learningOutcomes: [
            'Understand brain development',
            'Create enriching environments',
            'Sensory activities by age',
            'Recognize development delays'
        ]
    },
    {
        id: 'natural-birth',
        name: 'Natural Birth Techniques & Options',
        category: 'pregnancy',
        level: 'advanced',
        duration: 'medium',
        price: 59.99,
        rating: 4.7,
        reviews: 401,
        icon: '🌿',
        description: 'Comprehensive guide to natural birth preparation, techniques, and options.',
        instructor: {
            name: 'Midwife Julia Thompson',
            title: 'Natural Birth Educator',
            type: 'certified',
            avatar: 'JT'
        },
        highlights: [
            '6 modules',
            '8 hours of content',
            'Breathing & positioning techniques',
            'Partner support guide'
        ],
        learningOutcomes: [
            'Labor pain management naturally',
            'Positioning techniques',
            'Breathing methods',
            'Environment optimization'
        ]
    },
    {
        id: 'formula-feeding',
        name: 'Formula Feeding: Complete Guide',
        category: 'baby-care',
        level: 'beginner',
        duration: 'medium',
        price: 39.99,
        rating: 4.5,
        reviews: 612,
        icon: '🍶',
        description: 'Everything about formula selection, preparation, and bottle feeding safely.',
        instructor: {
            name: 'Pediatric Dietitian Dr. Grace Kim',
            title: 'Infant Nutrition Specialist',
            type: 'specialist',
            avatar: 'GK'
        },
        highlights: [
            '5 modules',
            '5 hours of content',
            'Formula comparison chart',
            'Safety guidelines'
        ],
        learningOutcomes: [
            'Select right formula',
            'Prepare bottles safely',
            'Feeding schedules',
            'Common feeding issues'
        ]
    },
    {
        id: 'colic-reflux',
        name: 'Managing Colic & Reflux',
        category: 'baby-care',
        level: 'intermediate',
        duration: 'short',
        price: 44.99,
        rating: 4.8,
        reviews: 743,
        icon: '😣',
        description: 'Identify, manage, and soothe babies with colic or reflux issues.',
        instructor: {
            name: 'Pediatrician Dr. Alan Foster',
            title: 'Gastroenterology Specialist',
            type: 'physician',
            avatar: 'AF'
        },
        highlights: [
            '4 modules',
            '4 hours of content',
            'Soothing techniques video',
            'Medical resources'
        ],
        learningOutcomes: [
            'Distinguish colic from reflux',
            'Soothing techniques',
            'When to seek medical help',
            'Support for caregivers'
        ]
    },
    {
        id: 'attachment-parenting',
        name: 'Attachment Parenting Essentials',
        category: 'toddler',
        level: 'intermediate',
        duration: 'long',
        price: 69.99,
        rating: 4.7,
        reviews: 567,
        icon: '🤗',
        description: 'Build secure attachment through responsive, gentle parenting practices.',
        instructor: {
            name: 'Parenting Coach Dr. Michelle Green',
            title: 'Child Psychology Specialist',
            type: 'physician',
            avatar: 'MG'
        },
        highlights: [
            '8 modules',
            '9 hours of content',
            'Parenting scripts & examples',
            'Community forum access'
        ],
        learningOutcomes: [
            'Attachment theory basics',
            'Responsive parenting',
            'Emotional connection building',
            'Age-appropriate attachment strategies'
        ]
    },
    {
        id: 'potty-training',
        name: 'Potty Training Success',
        category: 'toddler',
        level: 'intermediate',
        duration: 'medium',
        price: 39.99,
        rating: 4.6,
        reviews: 598,
        icon: '🚽',
        description: 'Child-led and parent-friendly approaches to successful potty training.',
        instructor: {
            name: 'Child Psychologist Dr. Rachel Edwards',
            title: 'Developmental Expert',
            type: 'physician',
            avatar: 'RE'
        },
        highlights: [
            '5 modules',
            '6 hours of content',
            'Readiness checklist',
            'Troubleshooting guide'
        ],
        learningOutcomes: [
            'Recognize readiness signs',
            'Choose right approach',
            'Handle resistance & regression',
            'Build confidence'
        ]
    },
    {
        id: 'nutrition-toddler',
        name: 'Toddler Nutrition & Meal Planning',
        category: 'nutrition',
        level: 'beginner',
        duration: 'medium',
        price: 49.99,
        rating: 4.5,
        reviews: 421,
        icon: '🍽️',
        description: 'Healthy nutrition and meal planning strategies for toddlers 1-3 years.',
        instructor: {
            name: 'Pediatric Nutritionist Dr. Thomas Clark',
            title: 'Child Nutrition Expert',
            type: 'specialist',
            avatar: 'TC'
        },
        highlights: [
            '6 modules',
            '7 hours of content',
            'Meal plan templates',
            'Picky eater strategies'
        ],
        learningOutcomes: [
            'Toddler nutritional needs',
            'Safe food introduction',
            'Handle picky eating',
            'Allergy management'
        ]
    }
];

// Pagination
let currentPage = 1;
const coursesPerPage = 12;
let filteredCourses = [...coursesDatabase];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayCourses();
    setupPagination();
    updateDashboard();
    updateEnrolledCoursesDisplay();
    updateProgressRing();
    generateAIRecommendations();
    setupFilterChips();
    initializeFavoriteButtons();
    
    // Also update dashboard when page is shown
    window.addEventListener('hashchange', function() {
        if (window.location.hash === '#courses') {
            displayCourses();
            setupPagination();
            updateDashboard();
            updateEnrolledCoursesDisplay();
            updateProgressRing();
            generateAIRecommendations();
            setTimeout(initializeFavoriteButtons, 100);
        }
    });
});

// Display courses
function displayCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;
    
    const coursesToDisplay = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);
    
    if (coursesToDisplay.length === 0) {
        coursesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <h3 style="font-size: 24px; margin-bottom: 10px;">No courses found</h3>
                <p style="color: var(--text-gray); margin-bottom: 20px;">Try adjusting your filters or search terms</p>
                <button class="btn-primary" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        document.getElementById('paginationSection').innerHTML = '';
        return;
    }

    coursesGrid.innerHTML = coursesToDisplay.map(course => createCourseCard(course)).join('');

    setupPagination();
}

// Create course card
function createCourseCard(course) {
    const badge = course.badge ? `<div class="course-badge badge-${course.badge}">${course.badge.toUpperCase()}</div>` : '';
    
    return `
        <div class="course-card">
            <div class="course-image">${course.icon}</div>
            ${badge}
            <div class="course-content">
                <span class="course-category">${course.category.replace('-', ' ').toUpperCase()}</span>
                <h3 class="course-title">${course.name}</h3>
                <p class="course-description">${course.description}</p>
                
                <div class="course-instructor">
                    <div class="instructor-avatar">${course.instructor.avatar}</div>
                    <div class="instructor-info">
                        <div class="instructor-name">${course.instructor.name}</div>
                        <div class="instructor-title">${course.instructor.title}</div>
                    </div>
                </div>

                <div class="course-stats">
                    <div class="stat-item">
                        <span class="stat-value">${course.duration === 'short' ? '<2h' : course.duration === 'medium' ? '2-5h' : '>5h'}</span>
                        <span class="stat-label">Duration</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                        <span class="stat-label">Level</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${course.reviews.toLocaleString()}</span>
                        <span class="stat-label">Reviews</span>
                    </div>
                </div>

                <div class="course-footer">
                    <div class="course-rating">
                        <span class="stars">${'★'.repeat(Math.floor(course.rating))}${course.rating % 1 !== 0 ? '½' : ''}</span>
                        <span class="rating-count">(${course.rating})</span>
                    </div>
                    <div>
                        <div class="course-price">FREE</div>
                    </div>
                </div>

                <div class="course-actions">
                    <button class="course-button" onclick="openCourseModal('${course.id}')">View Course</button>
                    <button class="course-favorite-btn" onclick="toggleFavorite('${course.id}')" id="favorite-${course.id}">♡</button>
                </div>
            </div>
        </div>
    `;
}

// Filter courses
function filterCourses() {
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const level = document.getElementById('levelFilter').value;
    const duration = document.getElementById('durationFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const rating = document.getElementById('ratingFilter').value;
    const instructor = document.getElementById('instructorFilter').value;

    filteredCourses = coursesDatabase.filter(course => {
        const matchSearch = course.name.toLowerCase().includes(searchTerm) || 
                           course.description.toLowerCase().includes(searchTerm);
        const matchCategory = !category || course.category === category;
        const matchLevel = !level || course.level === level;
        const matchDuration = !duration || course.duration === duration;
        const matchInstructor = !instructor || course.instructor.type === instructor;
        
        let matchRating = true;
        if (rating) {
            matchRating = course.rating >= parseFloat(rating);
        }

        let matchPrice = true;
        if (priceRange) {
            if (priceRange === 'free') matchPrice = course.price === 0;
            else if (priceRange === 'under50') matchPrice = course.price < 50 && course.price > 0;
            else if (priceRange === '50-100') matchPrice = course.price >= 50 && course.price <= 100;
            else if (priceRange === 'over100') matchPrice = course.price > 100;
        }

        return matchSearch && matchCategory && matchLevel && matchDuration && 
               matchPrice && matchRating && matchInstructor;
    });

    currentPage = 1;
    updateFilterTags();
    displayCourses();
}

// Update filter tags display
function updateFilterTags() {
    const tagsContainer = document.getElementById('filterTags');
    const tags = [];

    const category = document.getElementById('categoryFilter').value;
    if (category) tags.push({ label: 'Category: ' + category.replace('-', ' '), id: 'category' });

    const level = document.getElementById('levelFilter').value;
    if (level) tags.push({ label: 'Level: ' + level, id: 'level' });

    const duration = document.getElementById('durationFilter').value;
    if (duration) tags.push({ label: 'Duration: ' + duration, id: 'duration' });

    const price = document.getElementById('priceFilter').value;
    if (price) tags.push({ label: 'Price: ' + price, id: 'price' });

    const rating = document.getElementById('ratingFilter').value;
    if (rating) tags.push({ label: 'Rating: ' + rating + '+', id: 'rating' });

    if (tags.length === 0) {
        tagsContainer.innerHTML = '';
        return;
    }

    tagsContainer.innerHTML = tags.map(tag => `
        <div class="filter-tag">
            ${tag.label}
            <span class="filter-tag-remove" onclick="removeFilter('${tag.id}')">✕</span>
        </div>
    `).join('');
}

// Remove filter
function removeFilter(filterId) {
    if (filterId === 'category') document.getElementById('categoryFilter').value = '';
    else if (filterId === 'level') document.getElementById('levelFilter').value = '';
    else if (filterId === 'duration') document.getElementById('durationFilter').value = '';
    else if (filterId === 'price') document.getElementById('priceFilter').value = '';
    else if (filterId === 'rating') document.getElementById('ratingFilter').value = '';

    filterCourses();
}

// Reset all filters
function resetFilters() {
    document.getElementById('courseSearch').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('durationFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    document.getElementById('instructorFilter').value = '';

    filteredCourses = [...coursesDatabase];
    currentPage = 1;
    updateFilterTags();
    displayCourses();
}

// Setup pagination
function setupPagination() {
    const paginationSection = document.getElementById('paginationSection');
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    if (totalPages <= 1) {
        paginationSection.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.5"' : ''}>← Prev</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
            `;
        } else if (i === 2 && currentPage > 3) {
            paginationHTML += `<span style="padding: 0 5px;">...</span>`;
        }
    }

    // Next button
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled style="opacity:0.5"' : ''}>Next →</button>`;

    paginationSection.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayCourses();
        window.scrollTo({ top: document.getElementById('all-courses').offsetTop - 100, behavior: 'smooth' });
    }
}

// Open course modal
function openCourseModal(courseId) {
    const course = coursesDatabase.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('courseModal');
    document.getElementById('modalCourseName').textContent = course.name;

    const modalBody = document.getElementById('modalCourseBody');
    modalBody.innerHTML = `
        <div class="course-details-section">
            <h3>Course Overview</h3>
            <p>${course.description}</p>
        </div>

        <div class="course-details-section">
            <h3>Course Instructor</h3>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="instructor-avatar" style="width: 50px; height: 50px; font-size: 18px;">${course.instructor.avatar}</div>
                <div>
                    <div style="font-weight: 700; color: var(--text-dark);">${course.instructor.name}</div>
                    <div style="color: var(--text-gray); font-size: 14px;">${course.instructor.title}</div>
                </div>
            </div>
        </div>

        <div class="course-details-section">
            <h3>What You'll Learn</h3>
            <ul class="course-details-list">
                ${course.learningOutcomes.map(outcome => `<li>${outcome}</li>`).join('')}
            </ul>
        </div>

        <div class="course-details-section">
            <h3>Course Highlights</h3>
            <ul class="course-details-list">
                ${course.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
            </ul>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-top: 20px; border-top: 1px solid var(--border-color);">
            <div>
                <div style="font-size: 12px; color: var(--text-gray); margin-bottom: 5px;">PRICE</div>
                <div style="font-size: 24px; font-weight: 700; color: var(--primary-pink);">FREE</div>
            </div>
            <div style="text-align: right;">
                <button class="course-button" style="width: 100%; margin-top: 0;" onclick="enrollCourse('${course.id}', '${course.name}')">Enroll Now</button>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeCourseModal() {
    const modal = document.getElementById('courseModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Enroll course
function enrollCourse(courseId, courseName) {
    // Direct enrollment without payment
    closeCourseModal();
    
    // Save enrollment to localStorage
    let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId);
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }
    
    // Update enrolled courses display
    updateEnrolledCoursesDisplay();
    unlockRelatedCourses(courseId);
    updateUnlockedCoursesDisplay();
    
    // Navigate to course content
    showCourseContent(courseId, courseName);
}

// Update enrolled courses display
function updateEnrolledCoursesDisplay() {
    const enrolledCoursesList = document.getElementById('enrolledCourses');
    if (!enrolledCoursesList) return;
    
    const enrolledCourseIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    if (enrolledCourseIds.length === 0) {
        enrolledCoursesList.innerHTML = '<li style="color: #666;">No courses enrolled yet. Browse courses above to get started!</li>';
        return;
    }
    
    const enrolledCoursesData = coursesDatabase.filter(course => enrolledCourseIds.includes(course.id));
    
    enrolledCoursesList.innerHTML = enrolledCoursesData.map(course => `
        <li style="margin-bottom: 10px;">
            <button onclick="showCourseContent('${course.id}', '${course.name}')" style="background: none; border: none; text-align: left; cursor: pointer; padding: 10px; width: 100%; border-radius: 8px; transition: background 0.3s ease;">
                <div style="font-weight: 600; color: #0f2a56;">${course.name}</div>
                <div style="font-size: 12px; color: #666;">${course.category} • ${course.level}</div>
            </button>
        </li>
    `).join('');
    
    // Update achievements section with gamification
    const achievementsContainer = document.getElementById('achievementsContainer');
    if (achievementsContainer) {
        const achievements = generateAchievements(enrolledCourseIds.length);
        achievementsContainer.innerHTML = achievements.map(achievement => `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: ${achievement.background}; border-radius: 10px; margin-bottom: 10px;">
                <div style="font-size: 32px;">${achievement.icon}</div>
                <div>
                    <div style="font-weight: 600; color: #0f2a56;">${achievement.title}</div>
                    <div style="color: #666; font-size: 14px;">${achievement.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Update learning stats
    updateLearningStats(enrolledCourseIds.length);
}

function initializeUnlockedCourses() {
    const savedIds = JSON.parse(localStorage.getItem('unlockedCourses') || '[]');
    if (!savedIds.length) {
        const starterIds = ['complete-pregnancy', 'newborn-essentials', 'breastfeeding-mastery'];
        const initialUnlocked = coursesDatabase
            .filter(course => starterIds.includes(course.id))
            .map(course => course.id);
        localStorage.setItem('unlockedCourses', JSON.stringify(initialUnlocked));
    }
    updateUnlockedCoursesDisplay();
}

function unlockRelatedCourses(courseId) {
    const enrolledCourseIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const unlockedSet = new Set(JSON.parse(localStorage.getItem('unlockedCourses') || '[]'));
    const course = coursesDatabase.find(c => c.id === courseId);
    if (!course) {
        return;
    }

    const relatedCourses = coursesDatabase
        .filter(c => c.category === course.category && c.id !== courseId && !enrolledCourseIds.includes(c.id))
        .slice(0, 2);

    relatedCourses.forEach(c => unlockedSet.add(c.id));

    if (unlockedSet.size < 4) {
        coursesDatabase
            .filter(c => c.level === 'beginner' && !enrolledCourseIds.includes(c.id))
            .slice(0, 4 - unlockedSet.size)
            .forEach(c => unlockedSet.add(c.id));
    }

    localStorage.setItem('unlockedCourses', JSON.stringify([...unlockedSet]));
}

function updateUnlockedCoursesDisplay() {
    const unlockedList = document.getElementById('myUnlockedCourses');
    if (!unlockedList) return;

    const unlockedCourseIds = JSON.parse(localStorage.getItem('unlockedCourses') || '[]');
    if (!unlockedCourseIds.length) {
        unlockedList.innerHTML = '<p class="empty-message">No unlocked courses yet. Enroll in a course to unlock bonuses.</p>';
        return;
    }

    const unlockedCourses = coursesDatabase.filter(course => unlockedCourseIds.includes(course.id));
    unlockedList.innerHTML = unlockedCourses.map(course => `
        <div class="unlocked-course-item">
            <div class="unlocked-course-meta">
                <div class="unlocked-course-title">${course.name}</div>
                <span class="course-badge course-badge-unlocked">UNLOCKED</span>
                <div class="unlocked-course-details">${course.category.replace('-', ' ')} • ${course.level}</div>
            </div>
            <button class="course-button course-button-small" onclick="showCourseContent('${course.id}', '${course.name}')">Access</button>
        </div>
    `).join('');
}

// Generate achievements based on enrollment count
function generateAchievements(enrolledCount) {
    const achievements = [];
    
    if (enrolledCount === 0) {
        return [{
            icon: '🎯',
            title: 'Get Started',
            description: 'Enroll in your first course to begin your journey!',
            background: '#f8f9fa'
        }];
    }
    
    if (enrolledCount >= 1) {
        achievements.push({
            icon: '🎉',
            title: 'First Steps',
            description: 'You enrolled in your first course!',
            background: 'linear-gradient(135deg, #fff5f7 0%, #f8f9fa 100%)'
        });
    }
    
    if (enrolledCount >= 3) {
        achievements.push({
            icon: '🌟',
            title: 'Dedicated Learner',
            description: 'Enrolled in 3 courses - you\'re on a roll!',
            background: 'linear-gradient(135deg, #a8edea 0%, #a8edea 100%)'
        });
    }
    
    if (enrolledCount >= 5) {
        achievements.push({
            icon: '🏆',
            title: 'Course Champion',
            description: '5 courses enrolled - impressive dedication!',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        });
    }
    
    if (enrolledCount >= 10) {
        achievements.push({
            icon: '👑',
            title: 'Learning Master',
            description: '10 courses enrolled - you\'re a true expert!',
            background: 'linear-gradient(135deg, #ff8fab 0%, #ff6b9d 100%)'
        });
    }
    
    return achievements;
}

// Update learning stats
function updateLearningStats(enrolledCount) {
    const totalHours = document.getElementById('totalHours');
    const coursesCompleted = document.getElementById('coursesCompleted');
    const certificatesEarned = document.getElementById('certificatesEarned');
    
    if (totalHours) {
        // Calculate hours based on enrolled courses (estimated 2 hours per course)
        const hours = enrolledCount * 2;
        totalHours.textContent = hours + 'h';
    }
    
    if (coursesCompleted) {
        coursesCompleted.textContent = enrolledCount;
    }
    
    if (certificatesEarned) {
        certificatesEarned.textContent = enrolledCount;
    }
    
    // Update streak
    updateStreak();
}

// Update learning streak
function updateStreak() {
    let streak = parseInt(localStorage.getItem('learningStreak') || '0');
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastVisit === yesterday.toDateString()) {
            streak++;
        } else if (lastVisit !== today) {
            streak = 1;
        }
        
        localStorage.setItem('learningStreak', streak);
        localStorage.setItem('lastVisit', today);
    }
    
    const streakElement = document.getElementById('streakCount');
    if (streakElement) {
        streakElement.textContent = streak;
    }
}

// Show course content
function showCourseContent(courseId, courseName) {
    const course = coursesDatabase.find(c => c.id === courseId);
    if (!course) return;

    // Create course content modal
    const modal = document.createElement('div');
    modal.className = 'course-modal active';
    modal.innerHTML = `
        <div class="course-modal-content" style="max-width: 900px;">
            <div class="course-modal-header">
                <h2>${course.name} - Course Content</h2>
                <button class="course-modal-close" onclick="this.closest('.course-modal').remove()">×</button>
            </div>
            <div class="course-modal-body">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; color: white; margin-bottom: 30px;">
                    <h3 style="font-size: 24px; margin-bottom: 10px;">🎉 You're Enrolled!</h3>
                    <p style="opacity: 0.9;">Welcome to ${course.name}. Start your learning journey below.</p>
                </div>

                <div style="display: grid; gap: 20px;">
                    ${course.highlights.map((highlight, index) => `
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; cursor: pointer; transition: all 0.3s ease;" onclick="alert('Starting Module ${index + 1}: ${highlight}')">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${index + 1}</div>
                                <div>
                                    <h4 style="margin: 0; color: #0f2a56;">${highlight}</h4>
                                    <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Click to start this module</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #fff5f7; border-radius: 10px;">
                    <h4 style="margin: 0 0 10px; color: #0f2a56;">📚 Learning Outcomes</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #666;">
                        ${course.learningOutcomes.map(outcome => `<li>${outcome}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Update dashboard
function updateDashboard() {
    // Safely update dashboard values — use fallbacks for different templates
    const totalEl = document.getElementById('totalCourses') || document.getElementById('dashboardTotal');
    if (totalEl) totalEl.textContent = coursesDatabase.length;

    const enrolledCourseIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const enrolledEl = document.getElementById('enrolledCount') || document.getElementById('dashboardEnrolled');
    if (enrolledEl) enrolledEl.textContent = enrolledCourseIds.length;

    const completedEl = document.getElementById('completedCount') || document.getElementById('dashboardCompleted') || document.getElementById('dashboardCertificates');
    if (completedEl) completedEl.textContent = enrolledCourseIds.length;

    // Update streak count (safe)
    const streak = localStorage.getItem('learningStreak') || 0;
    const streakEl = document.getElementById('streakCount') || document.getElementById('streakCountAlt');
    if (streakEl) streakEl.textContent = streak;
}

// Update progress ring
function updateProgressRing() {
    const enrolledCourseIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const totalCourses = coursesDatabase.length;
    const progress = totalCourses > 0 ? (enrolledCourseIds.length / totalCourses) * 100 : 0;
    
    const progressCircle = document.getElementById('progressCircle');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (progressCircle && progressPercentage) {
        const circumference = 326.73;
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        progressPercentage.textContent = Math.round(progress) + '%';
    }
}

// Generate AI recommendations
function generateAIRecommendations() {
    const aiRecommendationsGrid = document.getElementById('aiRecommendations');
    if (!aiRecommendationsGrid) return;
    
    // Get user preferences from localStorage (simulated)
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    // Filter and recommend courses based on preferences
    let recommendedCourses = coursesDatabase.slice(0, 6);
    
    // If user has preferences, filter accordingly
    if (userPreferences.category) {
        recommendedCourses = coursesDatabase.filter(course => course.category === userPreferences.category).slice(0, 6);
    }
    
    aiRecommendationsGrid.innerHTML = recommendedCourses.map(course => createCourseCard(course)).join('');
}

// Setup filter chips
function setupFilterChips() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            // Remove active class from siblings
            this.parentElement.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            applyFilter(filterType, filterValue);
        });
    });
}

// Apply filter
function applyFilter(filterType, filterValue) {
    if (filterValue === '') {
        filteredCourses = [...coursesDatabase];
    } else {
        filteredCourses = coursesDatabase.filter(course => {
            switch(filterType) {
                case 'category':
                    return course.category === filterValue;
                case 'level':
                    return course.level === filterValue;
                case 'duration':
                    if (filterValue === 'short') return course.duration.includes('<');
                    if (filterValue === 'medium') return course.duration.includes('2-5');
                    if (filterValue === 'long') return course.duration.includes('>');
                    return true;
                case 'rating':
                    return course.rating >= parseFloat(filterValue);
                default:
                    return true;
            }
        });
    }
    
    currentPage = 1;
    displayCourses();
    setupPagination();
}

// Toggle filters
function toggleFilters() {
    const filterControls = document.getElementById('filterControls');
    const toggleBtn = document.querySelector('.filter-toggle-btn');
    
    if (filterControls.classList.contains('active')) {
        filterControls.classList.remove('active');
        toggleBtn.textContent = 'Show Filters';
    } else {
        filterControls.classList.add('active');
        toggleBtn.textContent = 'Hide Filters';
    }
}

// Handle search
function handleSearch(event) {
    if (event.key === 'Enter') {
        const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
        filteredCourses = coursesDatabase.filter(course => 
            course.name.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm) ||
            course.instructor.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        displayCourses();
        setupPagination();
    }
}

// Start voice search (placeholder)
function startVoiceSearch() {
    alert('Voice search feature coming soon! This will use the Web Speech API to enable voice-based course search.');
}

// Set view mode
function setViewMode(mode) {
    const coursesGrid = document.getElementById('coursesGrid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'grid') {
        coursesGrid.classList.remove('list-view');
        viewBtns[0].classList.add('active');
    } else if (mode === 'list') {
        coursesGrid.classList.add('list-view');
        viewBtns[1].classList.add('active');
    }
}

// Toggle compare (placeholder)
function toggleCompare() {
    alert('Course comparison feature coming soon! This will allow you to compare multiple courses side by side.');
}

// Start learning path
function startLearningPath(pathType) {
    const paths = {
        'first-time-mother': {
            name: 'First-Time Mother',
            courses: coursesDatabase.filter(c => c.category === 'pregnancy' || c.category === 'newborn').slice(0, 12)
        },
        'working-mother': {
            name: 'Working Mother',
            courses: coursesDatabase.filter(c => c.duration.includes('<')).slice(0, 8)
        },
        'experienced-mother': {
            name: 'Experienced Mother',
            courses: coursesDatabase.filter(c => c.level === 'advanced').slice(0, 6)
        }
    };
    
    const path = paths[pathType];
    if (path) {
        // Enroll in all courses in the path
        let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        path.courses.forEach(course => {
            if (!enrolledCourses.includes(course.id)) {
                enrolledCourses.push(course.id);
            }
        });
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        
        alert(`You've enrolled in the ${path.name} learning path with ${path.courses.length} courses!`);
        updateDashboard();
        updateEnrolledCoursesDisplay();
        updateProgressRing();
    }
}

// Productivity Hub state helpers
const productivityTasks = [
    { id: 'task1', label: 'Finish the next module in Childbirth Mastery' },
    { id: 'task2', label: 'Save notes from the breastfeeding course' },
    { id: 'task3', label: 'Review newborn care checklist' },
    { id: 'task4', label: 'Update your weekly learning plan' }
];
let productivityTimerInterval = null;

function initializeProductivityHub() {
    const savedTasks = JSON.parse(localStorage.getItem('productivityTasks') || '{}');
    const savedGoal = localStorage.getItem('learningGoal') || 'Stay consistent with your courses and complete the next learning module.';
    const focusState = JSON.parse(localStorage.getItem('focusSession') || '{}');

    document.getElementById('learningGoalText').textContent = savedGoal;
    document.getElementById('learningGoalInput').value = '';
    document.getElementById('nextCourseSuggestion').textContent = getSuggestedNextStep();
    updateProductivityChecklist(savedTasks);
    updateProductivityMetrics(savedTasks, focusState);

    if (focusState.active && focusState.endsAt) {
        resumeFocusSession(focusState);
    }
}

function updateProductivityChecklist(savedTasks) {
    const checklistContainer = document.getElementById('productivityChecklist');
    if (!checklistContainer) return;

    const tasks = productivityTasks.map(task => {
        const checked = savedTasks[task.id] || false;
        return `
            <div class="productivity-task">
                <label>
                    <input type="checkbox" id="${task.id}" ${checked ? 'checked' : ''} onchange="toggleProductivityTask('${task.id}')">
                    ${task.label}
                </label>
            </div>
        `;
    }).join('');

    checklistContainer.innerHTML = `<h4>Action Checklist</h4>${tasks}`;
}

function toggleProductivityTask(taskId) {
    const savedTasks = JSON.parse(localStorage.getItem('productivityTasks') || '{}');
    savedTasks[taskId] = !savedTasks[taskId];
    localStorage.setItem('productivityTasks', JSON.stringify(savedTasks));
    updateProductivityChecklist(savedTasks);
    updateProductivityMetrics(savedTasks, JSON.parse(localStorage.getItem('focusSession') || '{}'));
}

function saveLearningGoal() {
    const input = document.getElementById('learningGoalInput');
    if (!input) return;

    const goalText = input.value.trim();
    if (!goalText) {
        alert('Please enter a goal to save.');
        return;
    }

    localStorage.setItem('learningGoal', goalText);
    document.getElementById('learningGoalText').textContent = goalText;
    input.value = '';
    alert('Learning goal saved!');
}

function getSuggestedNextStep() {
    const enrolledCourseIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    if (!enrolledCourseIds.length) {
        return 'Browse courses and enroll in a path to get personalized recommendations.';
    }
    const firstCourse = coursesDatabase.find(course => enrolledCourseIds.includes(course.id));
    return firstCourse ? `Continue ${firstCourse.title} next` : 'Explore a learning path to stay focused.';
}

function updateProductivityMetrics(savedTasks, focusState) {
    const tasksCompleted = Object.values(savedTasks).filter(Boolean).length;
    document.getElementById('tasksCompletedCount').textContent = tasksCompleted;
    document.getElementById('weeklyFocusMinutes').textContent = `${focusState.aggregateMinutes || 0} min`;
}

function startFocusSession() {
    const status = document.getElementById('focusTimerStatus');
    const minutesDisplay = document.getElementById('focusMinutes');
    if (!status || !minutesDisplay) return;

    const existing = JSON.parse(localStorage.getItem('focusSession') || '{}');
    if (existing.active && existing.endsAt && Date.now() < existing.endsAt) {
        status.textContent = 'A focus session is already running.';
        resumeFocusSession(existing);
        return;
    }

    const durationMinutes = 20;
    const endsAt = Date.now() + durationMinutes * 60 * 1000;
    localStorage.setItem('focusSession', JSON.stringify({ active: true, endsAt, aggregateMinutes: (existing.aggregateMinutes || 0) }));
    renderFocusTimer(endsAt, durationMinutes);
}

function resumeFocusSession(focusState) {
    if (!focusState.active || !focusState.endsAt) return;
    renderFocusTimer(focusState.endsAt, Math.max(0, Math.ceil((focusState.endsAt - Date.now()) / 60000)));
}

function renderFocusTimer(endsAt, startMinutes) {
    const status = document.getElementById('focusTimerStatus');
    const minutesDisplay = document.getElementById('focusMinutes');
    if (!status || !minutesDisplay) return;

    if (productivityTimerInterval) {
        clearInterval(productivityTimerInterval);
    }

    productivityTimerInterval = setInterval(() => {
        const remaining = Math.max(0, endsAt - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        minutesDisplay.textContent = `${minutes}`;
        status.textContent = `Focus session active — ${minutes}:${seconds.toString().padStart(2, '0')} remaining.`;

        if (remaining <= 0) {
            clearInterval(productivityTimerInterval);
            const state = JSON.parse(localStorage.getItem('focusSession') || '{}');
            state.active = false;
            state.aggregateMinutes = (state.aggregateMinutes || 0) + startMinutes;
            localStorage.setItem('focusSession', JSON.stringify(state));
            status.textContent = 'Focus session complete! Great work.';
            document.getElementById('weeklyFocusMinutes').textContent = `${state.aggregateMinutes || 0} min`;
            minutesDisplay.textContent = '20';
        }
    }, 1000);
}

// Close course content modal
function closeCourseContentModal() {
    const modal = document.getElementById('courseContentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Toggle favorite course
function toggleFavorite(courseId) {
    let favorites = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
    const favoriteBtn = document.getElementById(`favorite-${courseId}`);
    
    if (favorites.includes(courseId)) {
        favorites = favorites.filter(id => id !== courseId);
        if (favoriteBtn) {
            favoriteBtn.textContent = '♡';
            favoriteBtn.style.color = '#666';
        }
    } else {
        favorites.push(courseId);
        if (favoriteBtn) {
            favoriteBtn.textContent = '❤️';
            favoriteBtn.style.color = '#ff6b9d';
        }
    }
    
    localStorage.setItem('favoriteCourses', JSON.stringify(favorites));
}

// Initialize favorite buttons
function initializeFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
    favorites.forEach(courseId => {
        const favoriteBtn = document.getElementById(`favorite-${courseId}`);
        if (favoriteBtn) {
            favoriteBtn.textContent = '❤️';
            favoriteBtn.style.color = '#ff6b9d';
        }
    });
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('courseModal');
    if (event.target === modal) {
        closeCourseModal();
    }
});

// Keyboard escape to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCourseModal();
    }
});

// ==========================================
// ULTRA-MODERN FEATURES
// ==========================================

// Dark Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    
    // Handle navigation toggle
    const navToggle = document.getElementById('darkModeToggleNav');
    const navIcon = navToggle ? navToggle.querySelector('.toggle-icon-nav') : null;
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        if (navIcon) navIcon.textContent = '☀️';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        if (navIcon) navIcon.textContent = '🌙';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        
        // Update navigation toggle
        const navIcon = document.querySelector('#darkModeToggleNav .toggle-icon-nav');
        if (navIcon) navIcon.textContent = '☀️';
    }
}

// Initialize dark mode globally (for all pages)
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
});

// Particle Animation for Hero Section
function createParticles() {
    const particlesContainer = document.getElementById('heroParticles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.width = (Math.random() * 10 + 5) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
}

// 3D Tilt Effect for Dashboard Cards
function initialize3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// Learning Calendar Visualization
function renderLearningCalendar() {
    const calendar = document.getElementById('learningCalendar');
    if (!calendar) return;
    
    const streak = parseInt(localStorage.getItem('learningStreak') || '0');
    const today = new Date();
    const days = [];
    
    // Get last 28 days
    for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date);
    }
    
    calendar.innerHTML = days.map((date, index) => {
        const dayNumber = date.getDate();
        const isActive = index < streak;
        return `<div class="calendar-day ${isActive ? 'active' : ''}">${dayNumber}</div>`;
    }).join('');
}

// Leaderboard System
function renderLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;
    
    // Simulated leaderboard data
    const leaderboardData = [
        { name: 'Sarah Johnson', points: 1250, avatar: '👩' },
        { name: 'Emily Davis', points: 1180, avatar: '👩‍🦰' },
        { name: 'Jessica Wilson', points: 1050, avatar: '👩‍🦱' },
        { name: 'Amanda Brown', points: 980, avatar: '👩‍🦳' },
        { name: 'You', points: parseInt(localStorage.getItem('learningStreak') || '0') * 50, avatar: '👤' }
    ];
    
    leaderboardData.sort((a, b) => b.points - a.points);
    
    leaderboard.innerHTML = leaderboardData.map((user, index) => `
        <div class="leaderboard-item">
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-avatar">${user.avatar}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${user.name}</div>
                <div class="leaderboard-points">${user.points} points</div>
            </div>
            <div class="leaderboard-score">${user.points}</div>
        </div>
    `).join('');
}

// Course Comparison Modal
let comparisonCourses = [];

function addToComparison(courseId) {
    const course = coursesDatabase.find(c => c.id === courseId);
    if (!course) return;
    
    if (comparisonCourses.length >= 3) {
        alert('You can compare up to 3 courses at a time');
        return;
    }
    
    if (comparisonCourses.find(c => c.id === courseId)) {
        alert('This course is already in comparison');
        return;
    }
    
    comparisonCourses.push(course);
    updateComparisonButton();
}

function removeFromComparison(courseId) {
    comparisonCourses = comparisonCourses.filter(c => c.id !== courseId);
    updateComparisonButton();
    
    if (comparisonModal.classList.contains('active')) {
        renderComparisonModal();
    }
}

function updateComparisonButton() {
    const compareBtn = document.querySelector('.view-btn-glass:nth-child(3)');
    if (compareBtn) {
        compareBtn.innerHTML = `<span>⇄</span><span>Compare (${comparisonCourses.length})</span>`;
    }
}

function toggleCompare() {
    if (comparisonCourses.length < 2) {
        alert('Please select at least 2 courses to compare');
        return;
    }
    
    const comparisonModal = document.getElementById('courseComparisonModal');
    renderComparisonModal();
    comparisonModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeComparisonModal() {
    const comparisonModal = document.getElementById('courseComparisonModal');
    comparisonModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderComparisonModal() {
    const modalBody = document.getElementById('comparisonModalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="comparison-table">
            <div class="comparison-row comparison-header">
                <div class="comparison-label">Feature</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">
                        <div class="comparison-course-name">${course.name}</div>
                        <div class="comparison-course-category">${course.category}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Duration</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">${course.duration}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Level</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">${course.level}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Rating</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">${course.rating} ★</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Instructor</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">${course.instructor}</div>
                `).join('')}
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Modules</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">${course.modules.length} modules</div>
                `).join('')}
            </div>
            
            <div class="comparison-row comparison-actions">
                <div class="comparison-label">Actions</div>
                ${comparisonCourses.map(course => `
                    <div class="comparison-value">
                        <button class="btn-glass-primary" onclick="enrollCourse('${course.id}', '${course.name}'); closeComparisonModal();">Enroll</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Scroll-Triggered Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.dashboard-card-glass, .timeline-item, .course-card, .my-courses-card-glass');
    animatedElements.forEach(el => observer.observe(el));
}

// Parallax Scrolling Effect
function initializeParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.courses-hero-ultra');
        if (hero) {
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });
}

// Enhanced Course Card with 3D Effect
function createCourseCardUltra(course) {
    const isFavorite = favoriteCourses.includes(course.id);
    const isEnrolled = enrolledCourseIds.includes(course.id);
    
    return `
        <div class="course-card-ultra" data-tilt data-course-id="${course.id}">
            <div class="course-card-glass">
                <div class="course-card-thumbnail-3d">
                    <span>${getCourseIcon(course.category)}</span>
                </div>
                <div class="course-card-content-glass">
                    <div class="course-card-category">${course.category}</div>
                    <h3 class="course-card-title-glass">${course.name}</h3>
                    <p class="course-card-description">${course.description}</p>
                    <div class="course-card-meta-glass">
                        <span class="meta-item">⏱️ ${course.duration}</span>
                        <span class="meta-item">📊 ${course.level}</span>
                        <span class="meta-item">⭐ ${course.rating}</span>
                    </div>
                    <div class="course-card-actions-glass">
                        <button class="btn-glass-primary" onclick="openCourseModal('${course.id}')">View Course</button>
                        <button class="favorite-btn-glass ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${course.id}')">
                            ${isFavorite ? '❤️' : '♡'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCourseIcon(category) {
    const icons = {
        'pregnancy': '🤰',
        'baby-care': '👶',
        'newborn': '🍼',
        'toddler': '🧒',
        'wellness': '🧘',
        'nutrition': '🥗'
    };
    return icons[category] || '📚';
}

// Initialize all ultra-modern features
document.addEventListener('DOMContentLoaded', function() {
    displayCourses();
    setupPagination();
    updateDashboard();
    updateEnrolledCoursesDisplay();
    initializeUnlockedCourses();
    updateProgressRing();
    generateAIRecommendations();
    setupFilterChips();
    initializeFavoriteButtons();
    
    // Initialize ultra-modern features
    initializeDarkMode();
    createParticles();
    initialize3DTilt();
    renderLearningCalendar();
    renderLeaderboard();
    initializeScrollAnimations();
    initializeParallax();
    initializeProductivityHub();
    
    // Also update dashboard when page is shown
    window.addEventListener('hashchange', function() {
        if (window.location.hash === '#courses') {
            displayCourses();
            setupPagination();
            updateDashboard();
            updateEnrolledCoursesDisplay();
            initializeUnlockedCourses();
            updateProgressRing();
            generateAIRecommendations();
            setTimeout(initializeFavoriteButtons, 100);
            
            // Re-initialize ultra-modern features
            createParticles();
            initialize3DTilt();
            renderLearningCalendar();
            renderLeaderboard();
            initializeScrollAnimations();
            initializeProductivityHub();
        }
    });
});
