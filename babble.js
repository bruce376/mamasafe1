// Babble Word Game Functions
let wordsLearned = 0;
let currentWord = null;
let currentCategory = 'animals';
let streak = 0;
let totalStars = 0;
let babyMood = 'happy';
let lastPlayTime = Date.now();

// Baby mood messages
const babyMessages = {
    happy: ['😊 Baby loves learning!', '🌟 Great job!', '🎉 So proud!', '💖 Wonderful!'],
    excited: ['🎊 Amazing!', '🌈 Fantastic!', '🦄 Magical!', '⭐ Superstar!'],
    sleepy: ['😴 Gentle learning...', '🌙 Sweet sounds...', '💤 Calm and quiet...', '🌚 Time for rest...'],
    hungry: ['🍼 Baby wants more!', '🥣 Ready for food!', '🍎 Yummy sounds!', '🥤 Feed me more!']
};

// Initialize all word cards to be visible by default
function initializeWordCards() {
    console.log('Initializing all word cards to be visible...');
    
    // Make all word cards in all categories visible by default
    document.querySelectorAll('.category-content').forEach(category => {
        const wordCards = category.querySelectorAll('.word-card');
        console.log(`Category ${category.id}: Making ${wordCards.length} word cards visible`);
        
        wordCards.forEach((card, index) => {
            // Force visibility by default - like Nature
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.position = 'relative';
            card.style.pointerEvents = 'auto';
            
            // Ensure child elements are visible
            const emoji = card.querySelector('.word-emoji');
            const text = card.querySelector('.word-text');
            const sound = card.querySelector('.word-sound');
            
            if (emoji) {
                emoji.style.display = 'block';
                emoji.style.visibility = 'visible';
                emoji.style.opacity = '1';
            }
            
            if (text) {
                text.style.display = 'block';
                text.style.visibility = 'visible';
                text.style.opacity = '1';
            }
            
            if (sound) {
                sound.style.display = 'block';
                sound.style.visibility = 'visible';
                sound.style.opacity = '1';
            }
        });
    });
    
    console.log('All word cards initialized to be visible');
}

// Show all words from all categories as optional choices
function showAllWords() {
    console.log('=== SHOWING ALL WORDS ===');
    
    // Hide all category sections
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Remove active from all tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'white';
        tab.style.color = 'var(--text-dark)';
    });
    
    // Create or show all words section
    let allWordsSection = document.getElementById('allWords');
    if (!allWordsSection) {
        allWordsSection = document.createElement('div');
        allWordsSection.id = 'allWords';
        allWordsSection.className = 'category-content active';
        
        // Create word grid for all words
        const wordGrid = document.createElement('div');
        wordGrid.className = 'word-grid';
        
        // Collect all words from all categories
        const allWords = [];
        
        document.querySelectorAll('.category-content').forEach(category => {
            const categoryWords = category.querySelectorAll('.word-card');
            categoryWords.forEach(card => {
                const wordText = card.querySelector('.word-text');
                const wordEmoji = card.querySelector('.word-emoji');
                const wordSound = card.querySelector('.word-sound');
                
                if (wordText && wordEmoji && wordSound) {
                    allWords.push({
                        text: wordText.textContent,
                        emoji: wordEmoji.textContent,
                        sound: wordSound.textContent,
                        category: category.id
                    });
                }
            });
        });
        
        console.log('Total words collected:', allWords.length);
        
        // Create word cards for all words
        allWords.forEach((word, index) => {
            const wordCard = document.createElement('div');
            wordCard.className = 'word-card';
            wordCard.onclick = () => playWord(word.text, word.emoji);
            
            wordCard.innerHTML = `
                <div class="word-emoji">${word.emoji}</div>
                <div class="word-text">${word.text}</div>
                <div class="word-sound">${word.sound}</div>
                <div class="word-category">Category: ${word.category}</div>
            `;
            
            wordGrid.appendChild(wordCard);
            console.log(`Added word: ${word.text} from ${word.category}`);
        });
        
        allWordsSection.appendChild(wordGrid);
        
        // Add section after category tabs
        const categoryTabs = document.querySelector('.category-tabs');
        if (categoryTabs) {
            categoryTabs.parentNode.insertBefore(allWordsSection, categoryTabs.nextSibling);
        }
    }
    
    // Show all words section
    allWordsSection.classList.add('active');
    allWordsSection.style.display = 'block';
    
    // Make all word cards visible
    const wordCards = allWordsSection.querySelectorAll('.word-card');
    wordCards.forEach((card, index) => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
    });
    
    // Highlight "All Words" tab (create if doesn't exist)
    let allWordsTab = document.querySelector('.all-words-tab');
    if (!allWordsTab) {
        allWordsTab = document.createElement('button');
        allWordsTab.className = 'category-tab all-words-tab';
        allWordsTab.textContent = '🌟 All Words';
        allWordsTab.onclick = showAllWords;
        
        const categoryTabs = document.querySelector('.category-tabs');
        if (categoryTabs) {
            categoryTabs.appendChild(allWordsTab);
        }
    }
    
    allWordsTab.classList.add('active');
    allWordsTab.style.background = 'linear-gradient(135deg, var(--primary-pink) 0%, #ff6b6b 100%)';
    allWordsTab.style.color = 'white';
    
    console.log('All words section shown with', wordCards.length, 'words');
    console.log('=== ALL WORDS DISPLAY COMPLETE ===');
}

// Make all categories work exactly like Nature
function showCategory(category, event) {
    console.log('=== CATEGORY CLICKED ===');
    console.log('Category:', category);
    
    // Hide all categories completely
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Hide all words section if showing
    const allWordsSection = document.getElementById('allWords');
    if (allWordsSection) {
        allWordsSection.classList.remove('active');
        allWordsSection.style.display = 'none';
    }
    
    // Remove active from all tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'white';
        tab.style.color = 'var(--text-dark)';
    });
    
    // Show selected category - exactly like Nature
    const selectedCategory = document.getElementById(category);
    if (selectedCategory) {
        console.log('Showing category:', category);
        
        // Make category visible - Nature approach
        selectedCategory.classList.add('active');
        selectedCategory.style.display = 'block';
        
        // Get word cards and make them visible exactly like Nature
        const wordCards = selectedCategory.querySelectorAll('.word-card');
        console.log('Word cards found:', wordCards.length);
        
        // Force each word card to be visible - Nature approach
        wordCards.forEach((card, index) => {
            const wordText = card.querySelector('.word-text');
            const wordEmoji = card.querySelector('.word-emoji');
            const wordSound = card.querySelector('.word-sound');
            
            console.log(`Making word card visible:`, wordText?.textContent);
            
            // Force visibility exactly like Nature works
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.position = 'relative';
            card.style.pointerEvents = 'auto';
            
            // Force child elements visible
            if (wordEmoji) {
                wordEmoji.style.display = 'block';
                wordEmoji.style.visibility = 'visible';
                wordEmoji.style.opacity = '1';
            }
            
            if (wordText) {
                wordText.style.display = 'block';
                wordText.style.visibility = 'visible';
                wordText.style.opacity = '1';
            }
            
            if (wordSound) {
                wordSound.style.display = 'block';
                wordSound.style.visibility = 'visible';
                wordSound.style.opacity = '1';
            }
        });
        
        console.log('Category shown:', category, 'with', wordCards.length, 'words');
    } else {
        console.error('Category not found:', category);
    }
    
    // Highlight clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
        event.target.style.background = 'linear-gradient(135deg, var(--primary-pink) 0%, #ff6b6b 100%)';
        event.target.style.color = 'white';
    }
    
    currentCategory = category;
    updateBabyMood(category);
    
    console.log('=== CATEGORY SWITCH COMPLETE ===');
}

// Show welcome message for category
function showCategoryWelcome(category) {
    const messages = {
        animals: '🐾 Welcome to Animal Kingdom! Let\'s learn animal sounds!',
        food: '🍎 Yummy Food Time! What delicious words will we learn?',
        objects: '🎯 Everyday Objects! Let\'s discover things around us!',
        actions: '🎭 Action Time! Let\'s learn fun movements!',
        family: '👨‍👩‍👧 Family Love! Meet the people who love you!',
        nature: '🌿 Nature Explorer! Discover the wonders of nature!'
    };
    
    const welcome = document.createElement('div');
    welcome.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        padding: 30px 40px;
        border-radius: 25px;
        font-size: 20px;
        font-weight: bold;
        color: var(--text-dark);
        z-index: 1005;
        animation: welcomePop 0.6s ease forwards;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        text-align: center;
        max-width: 400px;
    `;
    welcome.innerHTML = `
        ${messages[category]}<br>
        <div style="font-size: 16px; margin-top: 10px; font-weight: normal;">
            Click on any word to start learning! 🌟
        </div>
    `;
    document.body.appendChild(welcome);
    
    setTimeout(() => {
        welcome.style.animation = 'welcomePop 0.6s ease forwards';
        setTimeout(() => welcome.remove(), 600);
    }, 2500);
}

// Update baby mood based on category
function updateBabyMood(category) {
    const moods = {
        animals: 'excited',
        food: 'hungry',
        objects: 'happy',
        actions: 'sleepy',
        family: 'happy',
        nature: 'excited'
    };
    babyMood = moods[category] || 'happy';
    showMoodIndicator();
}

// Show mood indicator
function showMoodIndicator() {
    let indicator = document.getElementById('babyMoodIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'babyMoodIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 20px;
            z-index: 1000;
            animation: bounce 2s infinite;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(indicator);
    }
    
    const moodEmojis = {
        happy: '😊',
        excited: '🎊',
        sleepy: '😴',
        hungry: '🍼'
    };
    
    indicator.textContent = moodEmojis[babyMood];
}

// Enhanced play word with more fun features
function playWord(word, emoji) {
    currentWord = { word, emoji };
    
    // Check time since last play for streak bonus
    const now = Date.now();
    const timeDiff = now - lastPlayTime;
    
    if (timeDiff < 3000) {
        streak++;
        if (streak >= 3) {
            showStreakBonus();
        }
    } else {
        streak = 1;
    }
    
    lastPlayTime = now;
    
    // Create enhanced visual feedback
    const card = event.currentTarget;
    card.style.transform = 'scale(1.15) rotate(5deg)';
    card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
    
    // Create floating particles
    createParticles(card);
    
    // Create sound waves
    createSoundWaves(card);
    
    // Play sound simulation with visual feedback
    simulateSound(word, emoji);
    
    // Show enhanced word display
    showWordDisplay(word, emoji);
    
    // Update progress with stars
    updateWordsLearned();
    
    // Add word to learned collection
    addToLearnedWords(word, emoji);
    
    // Check for category completion
    checkCategoryCompletion();
    
    // Reset card with animation
    setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
    }, 400);
}

// Create sound waves effect
function createSoundWaves(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.style.cssText = `
                position: fixed;
                width: 60px;
                height: 60px;
                border: 2px solid var(--primary-pink);
                border-radius: 50%;
                left: ${rect.left + rect.width / 2 - 30}px;
                top: ${rect.top + rect.height / 2 - 30}px;
                z-index: 998;
                pointer-events: none;
                animation: soundWave ${1 + i * 0.3}s ease-out forwards;
            `;
            document.body.appendChild(wave);
            
            setTimeout(() => wave.remove(), 1500);
        }, i * 200);
    }
}

// Add word to learned collection
function addToLearnedWords(word, emoji) {
    let learnedWords = JSON.parse(localStorage.getItem('babble_learned_words') || '[]');
    
    // Check if word is already learned
    if (!learnedWords.find(w => w.word === word)) {
        learnedWords.push({ word, emoji, timestamp: Date.now() });
        localStorage.setItem('babble_learned_words', JSON.stringify(learnedWords));
        
        // Show "New Word!" celebration
        showNewWordCelebration(word, emoji);
    }
}

// Show new word celebration
function showNewWordCelebration(word, emoji) {
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #55efc4 0%, #00b894 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1006;
        animation: slideInRight 0.5s ease forwards;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    `;
    celebration.innerHTML = `
        ✨ NEW WORD! ✨<br>
        <div style="font-size: 24px; margin: 5px 0;">${emoji} ${word}</div>
        <div style="font-size: 14px; font-weight: normal;">Added to collection!</div>
    `;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => celebration.remove(), 500);
    }, 3000);
}

// Check if category is complete
function checkCategoryCompletion() {
    const category = document.getElementById(currentCategory);
    const wordCards = category.querySelectorAll('.word-card');
    const learnedWords = JSON.parse(localStorage.getItem('babble_learned_words') || '[]');
    
    let completedWords = 0;
    wordCards.forEach(card => {
        const wordText = card.querySelector('.word-text').textContent;
        if (learnedWords.find(w => w.word === wordText)) {
            completedWords++;
            card.style.background = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
            card.style.borderColor = '#28a745';
        }
    });
    
    // Check if all words in category are learned
    if (completedWords === wordCards.length && completedWords > 0) {
        showCategoryCompletion();
    }
}

// Show category completion celebration
function showCategoryCompletion() {
    const completion = document.createElement('div');
    completion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 40px 50px;
        border-radius: 30px;
        font-size: 28px;
        font-weight: bold;
        z-index: 1007;
        animation: megaPop 0.8s ease forwards;
        box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        text-align: center;
    `;
    
    const categoryNames = {
        animals: 'Animal Kingdom',
        food: 'Food Paradise',
        objects: 'Object World',
        actions: 'Action Time',
        family: 'Family Circle',
        nature: 'Nature Explorer'
    };
    
    completion.innerHTML = `
        🎊 CATEGORY COMPLETE! 🎊<br>
        <div style="font-size: 36px; margin: 15px 0;">🏆</div>
        ${categoryNames[currentCategory]} Mastered!<br>
        <div style="font-size: 18px; margin-top: 15px;">
            You're a super learner! 🌟<br>
            Try another category! 🎯
        </div>
    `;
    document.body.appendChild(completion);
    
    // Create mega confetti
    createMegaConfetti();
    
    setTimeout(() => {
        completion.style.animation = 'megaPop 0.8s ease forwards';
        setTimeout(() => completion.remove(), 800);
    }, 4000);
}

// Create mega confetti effect
function createMegaConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#e74c3c', '#3498db', '#9b59b6', '#2ecc71'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 15 + 5;
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            z-index: 1000;
            animation: confettiFall ${3 + Math.random() * 3}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 6000);
    }
}

// Create floating particles for fun
function createParticles(element) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            z-index: 9999;
            pointer-events: none;
            animation: float 1s ease-out forwards;
        `;
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

// Simulate sound with visual feedback
function simulateSound(word, emoji) {
    const soundWave = document.createElement('div');
    soundWave.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border: 3px solid var(--primary-pink);
        border-radius: 50%;
        animation: soundWave 0.8s ease-out forwards;
        z-index: 998;
    `;
    document.body.appendChild(soundWave);
    
    setTimeout(() => soundWave.remove(), 800);
    
    console.log('🔊 Playing word:', word, emoji);
}

// Enhanced word display with baby-friendly features
function showWordDisplay(word, emoji) {
    let display = document.getElementById('wordDisplay');
    if (!display) {
        display = document.createElement('div');
        display.id = 'wordDisplay';
        document.body.appendChild(display);
    }
    
    // Get random baby message
    const messages = babyMessages[babyMood];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    display.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        padding: 40px;
        border-radius: 30px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        text-align: center;
        z-index: 1000;
        animation: popIn 0.5s ease forwards;
        border: 3px solid white;
    `;
    
    display.innerHTML = `
        <div style="font-size: 100px; margin-bottom: 20px; animation: bounce 0.6s ease infinite alternate;">${emoji}</div>
        <h2 style="color: var(--primary-pink); margin-bottom: 15px; font-size: 42px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">${word.toUpperCase()}</h2>
        <div style="background: white; padding: 15px; border-radius: 20px; margin-bottom: 20px;">
            <p style="color: var(--text-gray); font-size: 20px; margin: 0;">${randomMessage}</p>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button onclick="closeWordDisplay()" style="
                background: var(--primary-pink);
                color: white;
                border: none;
                padding: 15px 25px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transform: scale(1);
                transition: transform 0.2s ease;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                🎉 Great!
            </button>
            <button onclick="repeatWord()" style="
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                color: white;
                border: none;
                padding: 15px 25px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transform: scale(1);
                transition: transform 0.2s ease;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                🔊 Again!
            </button>
        </div>
        <div style="margin-top: 15px; font-size: 16px; color: var(--text-gray);">
            ${streak > 1 ? `🔥 Streak: ${streak} in a row!` : 'Keep going!'}
        </div>
    `;
}

// Show streak bonus celebration
function showStreakBonus() {
    const bonus = document.createElement('div');
    bonus.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
        color: white;
        padding: 30px;
        border-radius: 25px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1001;
        animation: popIn 0.5s ease forwards;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    `;
    bonus.innerHTML = `
        🎊 STREAK BONUS! 🎊<br>
        ${streak} words in a row!<br>
        <small>You're on fire! 🔥</small>
    `;
    document.body.appendChild(bonus);
    
    setTimeout(() => {
        bonus.style.animation = 'popOut 0.5s ease forwards';
        setTimeout(() => bonus.remove(), 500);
    }, 2000);
}

// Close word display
function closeWordDisplay() {
    const display = document.getElementById('wordDisplay');
    if (display) {
        display.remove();
    }
}

// Enhanced progress tracking with stars and rewards
function updateWordsLearned() {
    wordsLearned++;
    document.getElementById('wordsLearned').textContent = wordsLearned;
    
    // Calculate progress with level system
    const level = Math.floor(wordsLearned / 10) + 1;
    const progressInLevel = (wordsLearned % 10) * 10;
    document.getElementById('babbleProgress').style.width = progressInLevel + '%';
    
    // Update level display
    const levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) {
        levelDisplay.textContent = `Level ${level}`;
    }
    
    // Add stars for milestones
    if (wordsLearned % 5 === 0) {
        totalStars += 5;
        showStarCelebration();
    }
    
    // Check for level up
    if (wordsLearned % 10 === 0 && wordsLearned > 0) {
        showLevelUp(level);
    }
    
    // Update baby mood based on progress
    if (wordsLearned % 15 === 0) {
        babyMood = 'excited';
        showMoodIndicator();
    }
}

// Enhanced celebration with stars and confetti
function celebrateMilestone() {
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
        color: white;
        padding: 40px;
        border-radius: 30px;
        font-size: 28px;
        font-weight: bold;
        z-index: 1002;
        animation: popIn 0.6s ease forwards;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
    `;
    
    const level = Math.floor(wordsLearned / 10) + 1;
    celebration.innerHTML = `
        🌟 MILESTONE! 🌟<br>
        ${wordsLearned} Words Learned!<br>
        <div style="font-size: 20px; margin-top: 10px;">
            Level ${level} Achieved!<br>
            ⭐ ${totalStars} Total Stars!
        </div>
    `;
    document.body.appendChild(celebration);
    
    // Create confetti
    createConfetti();
    
    setTimeout(() => {
        celebration.style.animation = 'popOut 0.6s ease forwards';
        setTimeout(() => celebration.remove(), 600);
    }, 3000);
}

// Show star celebration
function showStarCelebration() {
    const star = document.createElement('div');
    star.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0) rotate(0deg);
        font-size: 80px;
        z-index: 1001;
        animation: starPop 1s ease forwards;
    `;
    star.textContent = '⭐';
    document.body.appendChild(star);
    
    setTimeout(() => star.remove(), 1000);
}

// Show level up celebration
function showLevelUp(level) {
    const levelUp = document.createElement('div');
    levelUp.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 25px;
        font-size: 32px;
        font-weight: bold;
        z-index: 1003;
        animation: levelUpAnimation 1.5s ease forwards;
        box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        text-align: center;
    `;
    levelUp.innerHTML = `
        🎊 LEVEL UP! 🎊<br>
        Welcome to Level ${level}!<br>
        <div style="font-size: 20px; margin-top: 10px;">
            Keep up the great work!<br>
            🌈 You're amazing! 🌈
        </div>
    `;
    document.body.appendChild(levelUp);
    
    setTimeout(() => {
        levelUp.style.animation = 'levelUpAnimation 1.5s ease forwards';
        setTimeout(() => levelUp.remove(), 1500);
    }, 100);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#e74c3c', '#3498db'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            z-index: 1000;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
}

// Play all words in current category with enhanced features
function playAllWords() {
    const category = document.getElementById(currentCategory);
    const words = category.querySelectorAll('.word-card');
    let index = 0;
    
    const playNext = () => {
        if (index < words.length) {
            words[index].click();
            index++;
            setTimeout(playNext, 1200);
        } else {
            // Show completion message
            showCategoryComplete();
        }
    };
    
    playNext();
    console.log('Playing all words in category:', currentCategory);
}

// Play random word with fun message
function randomWord() {
    const category = document.getElementById(currentCategory);
    const words = category.querySelectorAll('.word-card');
    const randomIndex = Math.floor(Math.random() * words.length);
    words[randomIndex].click();
    console.log('Playing random word');
}

// Repeat last word with enhanced feedback
function repeatWord() {
    if (currentWord) {
        showWordDisplay(currentWord.word, currentWord.emoji);
        console.log('Repeating word:', currentWord.word);
    } else {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            padding: 20px 30px;
            border-radius: 20px;
            font-size: 18px;
            z-index: 1000;
            animation: popIn 0.3s ease forwards;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        `;
        message.innerHTML = '🤔 No word to repeat!<br>Click on a word first! 🌟';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'popOut 0.3s ease forwards';
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }
}

// Show category complete celebration
function showCategoryComplete() {
    const complete = document.createElement('div');
    complete.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 25px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1004;
        animation: popIn 0.5s ease forwards;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
    `;
    complete.innerHTML = `
        🎉 CATEGORY COMPLETE! 🎉<br>
        Great job learning all words!<br>
        <div style="font-size: 18px; margin-top: 10px;">
            Ready for the next category? 🌟
        </div>
    `;
    document.body.appendChild(complete);
    
    setTimeout(() => {
        complete.style.animation = 'popOut 0.5s ease forwards';
        setTimeout(() => complete.remove(), 500);
    }, 2500);
}

// Enhanced initialization with word card visibility
document.addEventListener('DOMContentLoaded', () => {
    // Check if babble page is active
    if (document.getElementById('babble') && document.getElementById('babble').classList.contains('active')) {
        console.log('Babble game initialized');
        
        // Reset progress
        wordsLearned = parseInt(localStorage.getItem('babble_words_learned') || '0');
        totalStars = parseInt(localStorage.getItem('babble_total_stars') || '0');
        
        // Update displays
        document.getElementById('wordsLearned').textContent = wordsLearned;
        
        // Initialize all word cards to be visible by default (with delay for DOM readiness)
        setTimeout(() => {
            initializeWordCards();
            // Also ensure animals category is visible by default
            const animalsCategory = document.getElementById('animals');
            if (animalsCategory) {
                animalsCategory.classList.add('active');
                animalsCategory.style.display = 'block';
                
                const animalCards = animalsCategory.querySelectorAll('.word-card');
                animalCards.forEach(card => {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                });
                console.log('Animals category initialized with', animalCards.length, 'words');
            }
            
            // Highlight animals tab by default
            const animalsTab = document.querySelector('.category-tab');
            if (animalsTab) {
                animalsTab.classList.add('active');
                animalsTab.style.background = 'linear-gradient(135deg, var(--primary-pink) 0%, #ff6b6b 100%)';
                animalsTab.style.color = 'white';
            }
        }, 100);
        
        // Show baby mood indicator
        showMoodIndicator();
        
        // Add level display if not exists
        if (!document.getElementById('levelDisplay')) {
            const progressSection = document.querySelector('.progress-section');
            if (progressSection) {
                const levelDiv = document.createElement('div');
                levelDiv.innerHTML = `<span id="levelDisplay">Level 1</span>`;
                levelDiv.style.cssText = 'font-size: 18px; color: var(--primary-pink); font-weight: bold; margin-bottom: 10px;';
                progressSection.appendChild(levelDiv);
            }
        }
        
        // Ensure categories are properly initialized
        initializeCategories();
        
        console.log('Babble game fully initialized with enhanced features');
    }
});

// Initialize categories properly
function initializeCategories() {
    // Hide all categories initially
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Show only the first category (animals) by default
    const firstCategory = document.getElementById('animals');
    if (firstCategory) {
        firstCategory.classList.add('active');
        firstCategory.style.display = 'block';
        firstCategory.style.opacity = '1';
        firstCategory.style.transform = 'scale(1)';
        
        // Animate word cards appearing
        const wordCards = firstCategory.querySelectorAll('.word-card');
        wordCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Set first tab as active
    const firstTab = document.querySelector('.category-tab');
    if (firstTab) {
        firstTab.classList.add('active');
        firstTab.style.background = 'linear-gradient(135deg, var(--primary-pink) 0%, #ff6b6b 100%)';
        firstTab.style.color = 'white';
        firstTab.style.transform = 'scale(1.05)';
    }
    
    console.log('Categories initialized');
}

// Enhanced save progress
window.addEventListener('beforeunload', () => {
    localStorage.setItem('babble_words_learned', wordsLearned.toString());
    localStorage.setItem('babble_total_stars', totalStars.toString());
    console.log('Progress saved:', { wordsLearned, totalStars });
});

let babbleWordBank = [];
let babbleAudioEnabled = true;
let babbleAudioContext = null;
let currentListeningRound = null;
let memoryState = { deck: [], flipped: [], matched: 0, busy: false };
let currentCopyMamaPrompt = null;

const babbleCopyMamaPrompts = [
    {
        title: 'Point to mama and say "mama"',
        tip: 'Point to yourself first, then help your child copy the same word and gesture.'
    },
    {
        title: 'Clap twice and say "clap clap"',
        tip: 'Use a slow rhythm so your child can match the movement and sound.'
    },
    {
        title: 'Wave and say "bye-bye"',
        tip: 'Exaggerate the wave and smile so it feels playful instead of like a drill.'
    },
    {
        title: 'Jump together and say "jump"',
        tip: 'Count to three together before you move so the word connects to the action.'
    },
    {
        title: 'Touch your nose and say "nose"',
        tip: 'Pause after the word and wait a moment to invite your child to answer back.'
    },
    {
        title: 'Hold a teddy and say "hug"',
        tip: 'Pair a cuddle with the word to make the meaning feel safe and familiar.'
    },
    {
        title: 'Tap the ball and say "ball"',
        tip: 'Repeat the word every time the ball moves so the sound stays consistent.'
    },
    {
        title: 'Look outside and say "sun" or "rain"',
        tip: 'Use whatever your child can actually see so the word feels immediate and real.'
    }
];

function getBabblePage() {
    return document.getElementById('babble-game');
}

function getBabbleStatElement(id) {
    const page = getBabblePage();
    return page ? page.querySelector(`#${id}`) : document.getElementById(id);
}

function normalizeBabbleWord(value) {
    return (value || '').trim().toLowerCase();
}

function capitalizeBabbleWord(value) {
    if (!value) {
        return '';
    }

    const text = value.trim();
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function persistBabbleProgress() {
    localStorage.setItem('babble_words_learned', String(wordsLearned));
    localStorage.setItem('babble_total_stars', String(totalStars));
    localStorage.setItem('babble_sound_enabled', babbleAudioEnabled ? '1' : '0');
}

function getBabbleLearnedWords() {
    try {
        return JSON.parse(localStorage.getItem('babble_learned_words') || '[]');
    } catch (error) {
        return [];
    }
}

function updateBabbleSoundToggle() {
    const button = getBabbleStatElement('babbleSoundToggle');
    if (button) {
        button.textContent = babbleAudioEnabled ? 'Sound: On' : 'Sound: Off';
    }
}

function chooseBabbleVoice() {
    if (!('speechSynthesis' in window)) {
        return null;
    }

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
        return null;
    }

    return voices.find((voice) => /en/i.test(voice.lang) && /(zira|aria|samantha|ava|female|google us english)/i.test(voice.name))
        || voices.find((voice) => /en/i.test(voice.lang))
        || voices[0];
}

function playBabbleTone(mode = 'tap') {
    if (!babbleAudioEnabled) {
        return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        return;
    }

    try {
        if (!babbleAudioContext) {
            babbleAudioContext = new AudioContextClass();
        }

        if (babbleAudioContext.state === 'suspended') {
            babbleAudioContext.resume();
        }

        const toneMap = {
            tap: { frequency: 523.25, duration: 0.12, gain: 0.045, type: 'sine' },
            prompt: { frequency: 659.25, duration: 0.18, gain: 0.05, type: 'triangle' },
            success: { frequency: 783.99, duration: 0.22, gain: 0.06, type: 'triangle' },
            wrong: { frequency: 220.0, duration: 0.18, gain: 0.045, type: 'sawtooth' },
            repeat: { frequency: 587.33, duration: 0.16, gain: 0.05, type: 'sine' }
        };

        const tone = toneMap[mode] || toneMap.tap;
        const oscillator = babbleAudioContext.createOscillator();
        const gainNode = babbleAudioContext.createGain();
        const startTime = babbleAudioContext.currentTime;

        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(tone.frequency, startTime);

        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(tone.gain, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.duration);

        oscillator.connect(gainNode);
        gainNode.connect(babbleAudioContext.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + tone.duration + 0.02);
    } catch (error) {
        console.warn('Babble tone playback failed:', error);
    }
}

function speakBabbleText(text) {
    if (!babbleAudioEnabled || !text || !('speechSynthesis' in window)) {
        return;
    }

    try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = chooseBabbleVoice();

        if (voice) {
            utterance.voice = voice;
        }

        utterance.rate = 0.88;
        utterance.pitch = 1.1;
        utterance.volume = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.warn('Babble speech failed:', error);
    }
}

function getBabbleCategoryPool() {
    const categoryWords = babbleWordBank.filter((item) => item.category === currentCategory);
    return categoryWords.length >= 4 ? categoryWords : babbleWordBank;
}

function shuffleBabbleItems(items) {
    const list = [...items];

    for (let index = list.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [list[index], list[randomIndex]] = [list[randomIndex], list[index]];
    }

    return list;
}

function pickBabbleItems(count, source) {
    return shuffleBabbleItems(source).slice(0, Math.min(count, source.length));
}

function resolveBabbleWord(word, emoji, soundText, sourceElement) {
    const normalizedWord = normalizeBabbleWord(word);
    const fromBank = babbleWordBank.find((item) => normalizeBabbleWord(item.word) === normalizedWord && (!emoji || item.emoji === emoji));

    if (fromBank) {
        return fromBank;
    }

    if (sourceElement) {
        return {
            word: word || sourceElement.querySelector('.word-text')?.textContent?.trim() || '',
            emoji: emoji || sourceElement.querySelector('.word-emoji')?.textContent?.trim() || '',
            sound: soundText || sourceElement.querySelector('.word-sound')?.textContent?.trim() || '',
            category: sourceElement.closest('.category-content')?.id || currentCategory
        };
    }

    return {
        word: word || '',
        emoji: emoji || '',
        sound: soundText || '',
        category: currentCategory
    };
}

function updateBabbleStatsUI() {
    const wordsElement = getBabbleStatElement('wordsLearned');
    const starsElement = getBabbleStatElement('totalStarsDisplay');
    const streakElement = getBabbleStatElement('streakDisplay');
    const progressBar = getBabbleStatElement('babbleProgress');
    const progressText = getBabbleStatElement('babbleProgressText');
    const levelDisplay = getBabbleStatElement('levelDisplay');
    const uniqueWords = getBabbleLearnedWords().length;
    const levelSize = 8;
    const level = Math.floor(wordsLearned / levelSize) + 1;
    const progressInLevel = wordsLearned % levelSize;
    const progressPercent = Math.round((progressInLevel / levelSize) * 100);

    if (wordsElement) {
        wordsElement.textContent = String(wordsLearned);
    }

    if (starsElement) {
        starsElement.textContent = String(totalStars);
    }

    if (streakElement) {
        streakElement.textContent = String(streak);
    }

    if (levelDisplay) {
        levelDisplay.textContent = `Level ${level}`;
    }

    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }

    if (progressText) {
        if (wordsLearned === 0) {
            progressText.textContent = 'Tap a word card to hear it out loud and start earning stars.';
        } else {
            const remaining = levelSize - progressInLevel || levelSize;
            progressText.textContent = `${uniqueWords} unique words saved. ${remaining} more taps until the next level.`;
        }
    }

    persistBabbleProgress();
}

function buildBabbleWordBank() {
    const page = getBabblePage();
    if (!page) {
        babbleWordBank = [];
        return;
    }

    babbleWordBank = Array.from(page.querySelectorAll('.category-content'))
        .filter((section) => section.id !== 'allWords')
        .flatMap((section) => Array.from(section.querySelectorAll('.word-card')).map((card) => {
            const meta = {
                word: card.querySelector('.word-text')?.textContent?.trim() || '',
                emoji: card.querySelector('.word-emoji')?.textContent?.trim() || '',
                sound: card.querySelector('.word-sound')?.textContent?.trim() || '',
                category: section.id
            };

            card.dataset.word = meta.word;
            card.dataset.emoji = meta.emoji;
            card.dataset.sound = meta.sound;
            card.dataset.category = meta.category;

            return meta;
        }))
        .filter((item) => item.word);
}

function addToLearnedWords(word, emoji) {
    const learnedWords = getBabbleLearnedWords();
    const exists = learnedWords.some((item) => normalizeBabbleWord(item.word) === normalizeBabbleWord(word));

    if (!exists) {
        learnedWords.push({
            word: capitalizeBabbleWord(word),
            emoji: emoji || '',
            timestamp: Date.now()
        });

        localStorage.setItem('babble_learned_words', JSON.stringify(learnedWords));

        if (typeof showNewWordCelebration === 'function') {
            showNewWordCelebration(capitalizeBabbleWord(word), emoji || '');
        }
    }

    return !exists;
}

function updateWordsLearned(options = {}) {
    const countTap = Number.isFinite(options.countTap) ? options.countTap : 1;
    const bonusStars = Number.isFinite(options.bonusStars) ? options.bonusStars : 1;
    const previousWordsLearned = wordsLearned;
    const previousLevel = Math.floor(previousWordsLearned / 8) + 1;

    wordsLearned += countTap;
    totalStars += bonusStars;

    const newLevel = Math.floor(wordsLearned / 8) + 1;

    if (bonusStars >= 2 && typeof showStarCelebration === 'function') {
        showStarCelebration();
    }

    if (wordsLearned > 0 && wordsLearned % 10 === 0 && typeof celebrateMilestone === 'function') {
        celebrateMilestone();
    }

    if (newLevel > previousLevel && typeof showLevelUp === 'function') {
        showLevelUp(newLevel);
    }

    updateBabbleStatsUI();
}

function attachBabbleCardHandlers(root = getBabblePage()) {
    if (!root) {
        return;
    }

    root.querySelectorAll('.word-card').forEach((card) => {
        const meta = {
            word: card.dataset.word || card.querySelector('.word-text')?.textContent?.trim() || '',
            emoji: card.dataset.emoji || card.querySelector('.word-emoji')?.textContent?.trim() || '',
            sound: card.dataset.sound || card.querySelector('.word-sound')?.textContent?.trim() || '',
            category: card.dataset.category || card.closest('.category-content')?.id || currentCategory
        };

        card.dataset.word = meta.word;
        card.dataset.emoji = meta.emoji;
        card.dataset.sound = meta.sound;
        card.dataset.category = meta.category;
        card.onclick = () => playWord(meta.word, meta.emoji, meta.sound, card);
    });
}

function setBabbleActiveTab(category) {
    const page = getBabblePage();
    if (!page) {
        return;
    }

    page.querySelectorAll('.category-tab').forEach((tab) => {
        tab.classList.remove('active');
        tab.style.background = 'white';
        tab.style.color = 'var(--text-dark)';
        tab.style.transform = '';
    });

    const targetTab = Array.from(page.querySelectorAll('.category-tab')).find((tab) => {
        const handler = tab.getAttribute('onclick') || '';
        return handler.includes(`'${category}'`) || (category === 'allWords' && tab.textContent.toLowerCase().includes('all words'));
    });

    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.background = 'linear-gradient(135deg, var(--primary-pink) 0%, #ff6b6b 100%)';
        targetTab.style.color = 'white';
        targetTab.style.transform = 'scale(1.03)';
    }
}

function renderBabbleAllWords() {
    const page = getBabblePage();
    if (!page) {
        return null;
    }

    let allWordsSection = page.querySelector('#allWords');

    if (!allWordsSection) {
        allWordsSection = document.createElement('div');
        allWordsSection.id = 'allWords';
        allWordsSection.className = 'category-content';
        page.querySelector('.game-categories')?.appendChild(allWordsSection);
    }

    const wordGrid = document.createElement('div');
    wordGrid.className = 'word-grid';

    babbleWordBank.forEach((item) => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        wordCard.dataset.word = item.word;
        wordCard.dataset.emoji = item.emoji;
        wordCard.dataset.sound = item.sound;
        wordCard.dataset.category = item.category;
        wordCard.innerHTML = `
            <div class="word-emoji">${item.emoji}</div>
            <div class="word-text">${capitalizeBabbleWord(item.word)}</div>
            <div class="word-sound">${item.sound}</div>
        `;
        wordCard.onclick = () => playWord(item.word, item.emoji, item.sound, wordCard);
        wordGrid.appendChild(wordCard);
    });

    allWordsSection.innerHTML = '';
    allWordsSection.appendChild(wordGrid);
    return allWordsSection;
}

function showCategory(category, clickEvent, options = {}) {
    const page = getBabblePage();
    if (!page) {
        return;
    }

    page.querySelectorAll('.category-content').forEach((content) => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    const targetCategory = page.querySelector(`#${category}`);
    if (!targetCategory) {
        return;
    }

    targetCategory.classList.add('active');
    targetCategory.style.display = 'block';

    currentCategory = category;
    setBabbleActiveTab(category);
    attachBabbleCardHandlers(targetCategory);

    if (typeof updateBabyMood === 'function') {
        updateBabyMood(category);
    }

    if (!options.silent) {
        playBabbleTone('prompt');
    }

    startListeningRound({ shouldSpeak: false });
    startMemoryGame();

    if (!currentCopyMamaPrompt) {
        nextCopyMamaPrompt();
    }

    if (clickEvent?.target) {
        clickEvent.target.blur();
    }
}

function showAllWords() {
    const page = getBabblePage();
    if (!page) {
        return;
    }

    page.querySelectorAll('.category-content').forEach((content) => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    currentCategory = 'allWords';
    setBabbleActiveTab('allWords');

    const allWordsSection = renderBabbleAllWords();
    if (allWordsSection) {
        allWordsSection.classList.add('active');
        allWordsSection.style.display = 'block';
        attachBabbleCardHandlers(allWordsSection);
    }

    startListeningRound({ shouldSpeak: false });
    startMemoryGame();
}

function showWordDisplay(word, emoji, soundText = '') {
    let display = document.getElementById('wordDisplay');
    if (!display) {
        display = document.createElement('div');
        display.id = 'wordDisplay';
        document.body.appendChild(display);
    }

    const messages = babyMessages[babyMood] || ['Great job!'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const streakText = streak > 1 ? `${streak} in a row` : 'New word time';

    display.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: min(90vw, 420px);
        background: linear-gradient(180deg, #fffaf4 0%, #ffe3ef 100%);
        padding: 30px;
        border-radius: 28px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.22);
        text-align: center;
        z-index: 1000;
        animation: popIn 0.35s ease forwards;
        border: 3px solid rgba(255, 255, 255, 0.9);
    `;

    display.innerHTML = `
        <div style="font-size: 74px; margin-bottom: 16px;">${emoji || '✨'}</div>
        <h2 style="color: var(--primary-pink); margin-bottom: 10px; font-size: 38px;">${capitalizeBabbleWord(word)}</h2>
        <p style="margin: 0 0 12px; font-size: 20px; color: var(--text-dark); font-weight: 700;">${soundText || 'Listen and say it together.'}</p>
        <p style="margin: 0 0 12px; color: var(--text-gray);">${randomMessage}</p>
        <p style="margin: 0 0 18px; color: var(--text-gray); font-size: 15px;">Parent cue: say it slowly, then let your child copy you.</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="repeatWord()" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; border: none; padding: 12px 18px; border-radius: 999px; cursor: pointer; font-weight: 700;">Read Again</button>
            <button onclick="closeWordDisplay()" style="background: var(--primary-pink); color: white; border: none; padding: 12px 18px; border-radius: 999px; cursor: pointer; font-weight: 700;">Keep Playing</button>
        </div>
        <div style="margin-top: 16px; font-size: 15px; color: var(--text-gray);">Streak: ${streakText}</div>
    `;
}

function playWord(word, emoji, soundText = '', sourceElement = null) {
    if (typeof requireToolAccess === 'function' && !requireToolAccess('babble-game')) {
        return false;
    }

    const card = sourceElement || document.activeElement?.closest?.('.word-card') || null;
    const meta = resolveBabbleWord(word, emoji, soundText, card);
    const now = Date.now();
    const isQuickTap = now - lastPlayTime < 3500;
    const isNewWord = addToLearnedWords(meta.word, meta.emoji);

    currentWord = meta;
    streak = isQuickTap ? streak + 1 : 1;
    lastPlayTime = now;

    document.querySelectorAll('#babble-game .word-card.is-speaking').forEach((item) => {
        item.classList.remove('is-speaking');
    });

    if (card) {
        card.classList.add('is-speaking');

        if (typeof createParticles === 'function') {
            createParticles(card);
        }

        if (typeof createSoundWaves === 'function') {
            createSoundWaves(card);
        }

        setTimeout(() => {
            card.classList.remove('is-speaking');
        }, 900);
    }

    playBabbleTone('tap');
    speakBabbleText(`${capitalizeBabbleWord(meta.word)}. ${meta.sound || ''}`.trim());
    showWordDisplay(meta.word, meta.emoji, meta.sound);
    updateWordsLearned({ bonusStars: isNewWord ? 3 : 1, countTap: 1 });

    if (streak >= 3 && typeof showStreakBonus === 'function') {
        showStreakBonus();
    }

    if (typeof checkCategoryCompletion === 'function') {
        checkCategoryCompletion();
    }

    return false;
}

function repeatWord() {
    if (!currentWord) {
        const display = document.getElementById('wordDisplay');
        if (display) {
            display.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    playBabbleTone('repeat');
    speakBabbleText(`${capitalizeBabbleWord(currentWord.word)}. ${currentWord.sound || ''}`.trim());
    showWordDisplay(currentWord.word, currentWord.emoji, currentWord.sound);
}

function toggleBabbleSound() {
    babbleAudioEnabled = !babbleAudioEnabled;

    if (!babbleAudioEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    updateBabbleSoundToggle();
    persistBabbleProgress();

    if (babbleAudioEnabled) {
        playBabbleTone('success');
        speakBabbleText('Babble sound is on.');
    }
}

function handleListeningChoice(selectedWord) {
    if (!currentListeningRound) {
        return;
    }

    const feedback = getBabbleStatElement('listenFeedback');
    const focus = getBabbleStatElement('listenTargetWord');
    const isCorrect = normalizeBabbleWord(selectedWord) === normalizeBabbleWord(currentListeningRound.target.word);

    Array.from(getBabbleStatElement('listenOptions')?.children || []).forEach((button) => {
        const isTarget = normalizeBabbleWord(button.dataset.word) === normalizeBabbleWord(currentListeningRound.target.word);
        const isSelected = normalizeBabbleWord(button.dataset.word) === normalizeBabbleWord(selectedWord);

        button.disabled = true;

        if (isTarget) {
            button.classList.add('correct');
        } else if (isSelected) {
            button.classList.add('wrong');
        }
    });

    if (isCorrect) {
        if (feedback) {
            feedback.textContent = `Correct. ${capitalizeBabbleWord(currentListeningRound.target.word)} was the right answer.`;
        }

        if (focus) {
            focus.textContent = `Great listening: ${capitalizeBabbleWord(currentListeningRound.target.word)}`;
        }

        playBabbleTone('success');
        speakBabbleText(`Yes. ${capitalizeBabbleWord(currentListeningRound.target.word)}.`);
        updateWordsLearned({ bonusStars: 2, countTap: 1 });
    } else {
        if (feedback) {
            feedback.textContent = `Nice try. The correct answer was ${capitalizeBabbleWord(currentListeningRound.target.word)}.`;
        }

        if (focus) {
            focus.textContent = `Correct answer: ${capitalizeBabbleWord(currentListeningRound.target.word)}`;
        }

        playBabbleTone('wrong');
        speakBabbleText(`That was ${capitalizeBabbleWord(selectedWord)}. Find ${capitalizeBabbleWord(currentListeningRound.target.word)}.`);
    }
}

function startListeningRound(options = {}) {
    const promptText = getBabbleStatElement('listenPromptText');
    const targetWord = getBabbleStatElement('listenTargetWord');
    const optionContainer = getBabbleStatElement('listenOptions');
    const feedback = getBabbleStatElement('listenFeedback');
    const pool = getBabbleCategoryPool();
    const shouldSpeak = options.shouldSpeak !== false;

    if (!optionContainer || pool.length < 2) {
        return;
    }

    const optionsList = pickBabbleItems(4, pool);
    const target = optionsList[Math.floor(Math.random() * optionsList.length)];
    currentListeningRound = { target, options: optionsList };

    optionContainer.innerHTML = '';
    optionsList.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'listen-option';
        button.dataset.word = item.word;
        button.innerHTML = `
            <span aria-hidden="true">${item.emoji}</span>
            <strong>${capitalizeBabbleWord(item.word)}</strong>
        `;
        button.onclick = () => handleListeningChoice(item.word);
        optionContainer.appendChild(button);
    });

    if (promptText) {
        promptText.textContent = `Listen and tap the matching picture from the ${currentCategory === 'allWords' ? 'mixed' : currentCategory} set.`;
    }

    if (targetWord) {
        targetWord.textContent = `Find: ${capitalizeBabbleWord(target.word)}`;
    }

    if (feedback) {
        feedback.textContent = 'Tap a choice after you hear the target word.';
    }

    if (shouldSpeak) {
        playBabbleTone('prompt');
        speakBabbleText(`Find ${capitalizeBabbleWord(target.word)}.`);
    }
}

function repeatListeningPrompt() {
    if (!currentListeningRound) {
        startListeningRound();
        return;
    }

    playBabbleTone('prompt');
    speakBabbleText(`Find ${capitalizeBabbleWord(currentListeningRound.target.word)}.`);
}

function renderMemoryGame() {
    const grid = getBabbleStatElement('memoryGameGrid');
    if (!grid) {
        return;
    }

    grid.innerHTML = '';
    memoryState.deck.forEach((card, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'memory-card';
        button.disabled = memoryState.busy && !card.revealed;

        if (card.revealed || card.matched) {
            button.classList.add('revealed');
            button.innerHTML = `
                <span class="memory-card-emoji" aria-hidden="true">${card.emoji}</span>
                <strong>${capitalizeBabbleWord(card.word)}</strong>
            `;
        } else {
            button.innerHTML = '<span aria-hidden="true">?</span><strong>Tap</strong>';
        }

        if (card.matched) {
            button.classList.add('matched');
        }

        button.onclick = () => flipMemoryCard(index);
        grid.appendChild(button);
    });
}

function flipMemoryCard(index) {
    if (memoryState.busy) {
        return;
    }

    const card = memoryState.deck[index];
    if (!card || card.revealed || card.matched) {
        return;
    }

    card.revealed = true;
    memoryState.flipped.push(index);
    renderMemoryGame();
    playBabbleTone('tap');
    speakBabbleText(capitalizeBabbleWord(card.word));

    if (memoryState.flipped.length < 2) {
        return;
    }

    const [firstIndex, secondIndex] = memoryState.flipped;
    const firstCard = memoryState.deck[firstIndex];
    const secondCard = memoryState.deck[secondIndex];
    const status = getBabbleStatElement('memoryStatus');

    memoryState.busy = true;

    if (firstCard.word === secondCard.word) {
        setTimeout(() => {
            firstCard.matched = true;
            secondCard.matched = true;
            memoryState.matched += 1;
            memoryState.flipped = [];
            memoryState.busy = false;

            if (status) {
                status.textContent = `Match found: ${capitalizeBabbleWord(firstCard.word)}.`;
            }

            playBabbleTone('success');
            updateWordsLearned({ bonusStars: 2, countTap: 1 });
            renderMemoryGame();

            if (memoryState.matched === memoryState.deck.length / 2) {
                totalStars += 3;
                updateBabbleStatsUI();

                if (status) {
                    status.textContent = 'You matched them all. Start a new round for more words.';
                }

                if (typeof showCategoryComplete === 'function') {
                    showCategoryComplete();
                }
            }
        }, 450);
    } else {
        setTimeout(() => {
            firstCard.revealed = false;
            secondCard.revealed = false;
            memoryState.flipped = [];
            memoryState.busy = false;

            if (status) {
                status.textContent = 'Not a match. Try again.';
            }

            playBabbleTone('wrong');
            renderMemoryGame();
        }, 750);
    }
}

function startMemoryGame() {
    const pool = getBabbleCategoryPool();
    const status = getBabbleStatElement('memoryStatus');

    if (pool.length < 2) {
        return;
    }

    const chosenWords = pickBabbleItems(4, pool);
    const deck = chosenWords.flatMap((item, index) => ([
        { id: `${normalizeBabbleWord(item.word)}-${index}-a`, word: item.word, emoji: item.emoji, revealed: false, matched: false },
        { id: `${normalizeBabbleWord(item.word)}-${index}-b`, word: item.word, emoji: item.emoji, revealed: false, matched: false }
    ]));

    memoryState = {
        deck: shuffleBabbleItems(deck),
        flipped: [],
        matched: 0,
        busy: false
    };

    if (status) {
        status.textContent = 'Flip two cards and listen to each word as it appears.';
    }

    renderMemoryGame();
}

function renderCopyMamaPrompt() {
    const promptElement = getBabbleStatElement('copyMamaPrompt');
    const tipElement = getBabbleStatElement('copyMamaTip');
    const cheerElement = getBabbleStatElement('copyMamaCheer');

    if (!currentCopyMamaPrompt) {
        return;
    }

    if (promptElement) {
        promptElement.textContent = currentCopyMamaPrompt.title;
    }

    if (tipElement) {
        tipElement.textContent = currentCopyMamaPrompt.tip;
    }

    if (cheerElement) {
        cheerElement.textContent = 'Try the prompt three times, then celebrate with a clap or cuddle.';
    }
}

function nextCopyMamaPrompt() {
    const availablePrompts = babbleCopyMamaPrompts.filter((prompt) => prompt.title !== currentCopyMamaPrompt?.title);
    const promptPool = availablePrompts.length ? availablePrompts : babbleCopyMamaPrompts;

    currentCopyMamaPrompt = promptPool[Math.floor(Math.random() * promptPool.length)];
    renderCopyMamaPrompt();
    playBabbleTone('success');
}

function speakCopyMamaPrompt() {
    if (!currentCopyMamaPrompt) {
        nextCopyMamaPrompt();
    }

    if (!currentCopyMamaPrompt) {
        return;
    }

    playBabbleTone('prompt');
    speakBabbleText(`${currentCopyMamaPrompt.title}. ${currentCopyMamaPrompt.tip}`);
}

function initializeCategories() {
    attachBabbleCardHandlers();

    if (currentCategory === 'allWords') {
        showAllWords();
        return;
    }

    showCategory(currentCategory || 'animals', null, { silent: true });
}

function initializeBabbleGame() {
    const page = getBabblePage();
    if (!page) {
        return;
    }

    wordsLearned = parseInt(localStorage.getItem('babble_words_learned') || '0', 10) || 0;
    totalStars = parseInt(localStorage.getItem('babble_total_stars') || '0', 10) || 0;
    babbleAudioEnabled = localStorage.getItem('babble_sound_enabled') !== '0';
    streak = 0;
    currentWord = null;
    currentCategory = currentCategory || 'animals';
    lastPlayTime = 0;

    buildBabbleWordBank();
    updateBabbleSoundToggle();
    updateBabbleStatsUI();
    renderCopyMamaPrompt();
    initializeCategories();
    startListeningRound({ shouldSpeak: false });
    startMemoryGame();

    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const page = getBabblePage();
    if (page && page.classList.contains('active')) {
        initializeBabbleGame();
    }
});

window.playWord = playWord;
window.repeatWord = repeatWord;
window.showCategory = showCategory;
window.showAllWords = showAllWords;
window.toggleBabbleSound = toggleBabbleSound;
window.startListeningRound = startListeningRound;
window.repeatListeningPrompt = repeatListeningPrompt;
window.startMemoryGame = startMemoryGame;
window.nextCopyMamaPrompt = nextCopyMamaPrompt;
window.speakCopyMamaPrompt = speakCopyMamaPrompt;
window.initializeBabbleGame = initializeBabbleGame;
