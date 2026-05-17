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
});

// Display courses
function displayCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';

    const start = (currentPage - 1) * coursesPerPage;
    const end = start + coursesPerPage;
    const coursesToDisplay = filteredCourses.slice(start, end);

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

    coursesToDisplay.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });

    setupPagination();
}

// Create course card
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    const badge = course.badge ? `<div class="course-badge badge-${course.badge}">${course.badge.toUpperCase()}</div>` : '';
    
    card.innerHTML = `
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
                    <div class="course-price">\$${course.price}</div>
                </div>
            </div>

            <button class="course-button" onclick="openCourseModal('${course.id}')">View Course</button>
        </div>
    `;
    
    return card;
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
                <div style="font-size: 24px; font-weight: 700; color: var(--primary-pink);">\$${course.price}</div>
            </div>
            <div style="text-align: right;">
                <button class="course-button" style="width: 100%; margin-top: 0;" onclick="enrollCourse('${course.name}')">Enroll Now</button>
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
function enrollCourse(courseName) {
    alert(`Thank you for your interest! You will be enrolled in "${courseName}" after completing payment.`);
    closeCourseModal();
}

// Update dashboard
function updateDashboard() {
    document.getElementById('totalCourses').textContent = coursesDatabase.length;
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
