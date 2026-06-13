// Application Constants and Configuration

// Baby Names Data
window.namesData = window.namesData || [
    { name: "Liam", meaning: "Strong-willed warrior", origin: "Irish", gender: "boy", popularity: "High" },
    { name: "Olivia", meaning: "Olive tree", origin: "Latin", gender: "girl", popularity: "High" },
    { name: "Noah", meaning: "Rest, comfort", origin: "Hebrew", gender: "boy", popularity: "High" },
    { name: "Emma", meaning: "Universal", origin: "German", gender: "girl", popularity: "High" },
    { name: "Oliver", meaning: "Olive tree", origin: "Latin", gender: "boy", popularity: "High" },
    { name: "Charlotte", meaning: "Free man", origin: "French", gender: "girl", popularity: "High" },
    { name: "James", meaning: "Supplanter", origin: "Hebrew", gender: "boy", popularity: "High" },
    { name: "Sophia", meaning: "Wisdom", origin: "Greek", gender: "girl", popularity: "High" },
    { name: "Elijah", meaning: "My God is Yahweh", origin: "Hebrew", gender: "boy", popularity: "High" },
    { name: "Amelia", meaning: "Work", origin: "German", gender: "girl", popularity: "High" },
    { name: "William", meaning: "Resolute protector", origin: "German", gender: "boy", popularity: "High" },
    { name: "Isabella", meaning: "Devoted to God", origin: "Hebrew", gender: "girl", popularity: "High" },
    { name: "Henry", meaning: "Estate ruler", origin: "German", gender: "boy", popularity: "High" },
    { name: "Ava", meaning: "Life", origin: "Latin", gender: "girl", popularity: "High" },
    { name: "Lucas", meaning: "Bringer of light", origin: "Latin", gender: "boy", popularity: "High" },
    { name: "Mia", meaning: "Mine", origin: "Italian", gender: "girl", popularity: "High" },
    { name: "Benjamin", meaning: "Son of the right hand", origin: "Hebrew", gender: "boy", popularity: "High" },
    { name: "Evelyn", meaning: "Wished for child", origin: "Hebrew", gender: "girl", popularity: "High" },
    { name: "Theodore", meaning: "Gift of God", origin: "Greek", gender: "boy", popularity: "High" },
    { name: "Harper", meaning: "Harp player", origin: "English", gender: "girl", popularity: "High" }
];

// Pregnancy Registry Items
window.pregnancyRegistryItems = window.pregnancyRegistryItems || {
    nursery: [
        { name: "Crib", price: 200, priority: "high" },
        { name: "Mattress", price: 100, priority: "high" },
        { name: "Changing table", price: 80, priority: "medium" },
        { name: "Rocking chair", price: 150, priority: "medium" },
        { name: "Baby monitor", price: 60, priority: "high" },
        { name: "Diaper pail", price: 40, priority: "medium" }
    ],
    feeding: [
        { name: "Bottles (set of 6)", price: 30, priority: "high" },
        { name: "Bottle brush", price: 8, priority: "medium" },
        { name: "Sterilizer", price: 40, priority: "medium" },
        { name: "Breast pump", price: 150, priority: "high" },
        { name: "Nursing pillows", price: 25, priority: "medium" },
        { name: "Formula dispenser", price: 15, priority: "low" }
    ],
    clothing: [
        { name: "Onesies (pack of 5)", price: 20, priority: "high" },
        { name: "Sleepers (pack of 3)", price: 25, priority: "high" },
        { name: "Socks (pack of 10)", price: 12, priority: "medium" },
        { name: "Hats (pack of 3)", price: 15, priority: "medium" },
        { name: "Swaddles (pack of 3)", price: 30, priority: "high" },
        { name: "Snowsuit", price: 35, priority: "medium" }
    ],
    bathing: [
        { name: "Baby bathtub", price: 25, priority: "medium" },
        { name: "Baby shampoo", price: 8, priority: "medium" },
        { name: "Baby lotion", price: 10, priority: "medium" },
        { name: "Hooded towels (pack of 2)", price: 20, priority: "medium" },
        { name: "Washcloths (pack of 6)", price: 12, priority: "medium" },
        { name: "Nail clippers", price: 6, priority: "high" }
    ],
    diapering: [
        { name: "Diapers (newborn size)", price: 25, priority: "high" },
        { name: "Wipes", price: 15, priority: "high" },
        { name: "Diaper cream", price: 8, priority: "medium" },
        { name: "Changing pad", price: 20, priority: "medium" },
        { name: "Diaper bag", price: 40, priority: "high" },
        { name: "Portable changing pad", price: 15, priority: "medium" }
    ],
    health: [
        { name: "Thermometer", price: 15, priority: "high" },
        { name: "Nasal aspirator", price: 8, priority: "medium" },
        { name: "Medicine dropper", price: 5, priority: "medium" },
        { name: "First aid kit", price: 20, priority: "high" },
        { name: "Humidifier", price: 40, priority: "medium" },
        { name: "Grooming kit", price: 15, priority: "medium" }
    ],
    travel: [
        { name: "Car seat", price: 150, priority: "high" },
        { name: "Stroller", price: 200, priority: "high" },
        { name: "Baby carrier", price: 60, priority: "medium" },
        { name: "Car window shades", price: 15, priority: "low" },
        { name: "Travel stroller", price: 80, priority: "low" },
        { name: "Portable crib", price: 100, priority: "medium" }
    ],
    safety: [
        { name: "Outlet covers", price: 8, priority: "high" },
        { name: " Cabinet locks", price: 12, priority: "high" },
        { name: "Gate", price: 40, priority: "high" },
        { name: "Corner guards", price: 10, priority: "medium" },
        { name: "Window locks", price: 15, priority: "medium" },
        { name: "Door knob covers", price: 8, priority: "medium" }
    ],
    play: [
        { name: "Play mat", price: 30, priority: "medium" },
        { name: "Rattles", price: 15, priority: "medium" },
        { name: "Soft blocks", price: 20, priority: "low" },
        { name: "Teething toys", price: 12, priority: "medium" },
        { name: "Activity gym", price: 40, priority: "medium" },
        { name: "Books", price: 25, priority: "low" }
    ]
};

// Toddler Development Milestones
window.toddlerMilestones = window.toddlerMilestones || {
    "12-18 months": {
        physical: ["Takes first steps", "Stacks 2-3 blocks", "Drinks from cup", "Climbs stairs"],
        cognitive: ["Says 1-3 words", "Points to objects", "Follows simple commands", "Imitates actions"],
        social: ["Shows separation anxiety", "Waves bye-bye", "Shows affection", "Plays alongside others"],
        tips: "Encourage walking with safe toys, read daily, establish routines"
    },
    "18-24 months": {
        physical: ["Runs", "Kicks ball", "Climbs on furniture", "Scribbles"],
        cognitive: ["Says 10+ words", "Uses 2-word phrases", "Knows body parts", "Sorts shapes"],
        social: ["Shows independence", "Temper tantrums", "Parallel play", "Shares sometimes"],
        tips: "Provide safe climbing opportunities, encourage talking, establish boundaries"
    },
    "2-3 years": {
        physical: ["Jumps", "Pedals tricycle", "Catches ball", "Draws lines"],
        cognitive: ["Speaks in sentences", "Follows 2-step commands", "Knows colors", "Counts to 3"],
        social: ["Plays with others", "Shows empathy", "Takes turns", "Expresses emotions"],
        tips: "Encourage creative play, teach sharing, establish consistent discipline"
    }
};

// Solid Food Guidelines
window.solidFoodGuidelines = window.solidFoodGuidelines || {
    "4-6 months": {
        signs: ["Holds head up", "Sits with support", "Shows interest in food", "Doubles birth weight"],
        firstFoods: ["Single-grain cereal", "Pureed vegetables", "Pureed fruits", "Pureed meats"],
        schedule: "Start with 1-2 tablespoons, 1-2 times daily",
        tips: "Wait 3-5 days between new foods, introduce one food at a time"
    },
    "6-8 months": {
        signs: ["Sits without support", "Chews motions", "Grabs food", "Opens mouth for spoon"],
        firstFoods: ["Mashed vegetables", "Mashed fruits", "Soft proteins", "Iron-fortified cereals"],
        schedule: "2-3 meals daily, plus breast milk/formula",
        tips: "Introduce soft finger foods, offer water in cup"
    },
    "8-10 months": {
        signs: ["Pincer grasp", "Chews well", "Self-feeds", "Drinks from cup"],
        firstFoods: ["Small soft pieces", "Cheese", "Yogurt", "Pasta"],
        schedule: "3 meals plus 2 snacks daily",
        tips: "Offer variety of textures, encourage self-feeding"
    },
    "10-12 months": {
        signs: ["Eats family foods", "Uses spoon", "Drinks from cup", "Chews well"],
        firstFoods: ["Table foods", "Combination foods", "Harder textures", "More variety"],
        schedule: "3 meals plus 2-3 snacks daily",
        tips: "Transition to family meals, offer healthy choices"
    }
};

// Vaccine Schedule
window.vaccineSchedule = window.vaccineSchedule || [
    { age: "Birth", vaccines: ["Hepatitis B (HepB)"], description: "First dose of hepatitis B vaccine" },
    { age: "1-2 months", vaccines: ["Hepatitis B (HepB)"], description: "Second dose of hepatitis B vaccine" },
    { age: "2 months", vaccines: ["DTaP", "IPV", "Hib", "PCV", "RV"], description: "First dose of multiple vaccines" },
    { age: "4 months", vaccines: ["DTaP", "IPV", "Hib", "PCV", "RV"], description: "Second dose of multiple vaccines" },
    { age: "6 months", vaccines: ["DTaP", "IPV", "Hib", "PCV", "RV", "Influenza"], description: "Third dose plus flu shot" },
    { age: "12-15 months", vaccines: ["MMR", "Varicella", "Hib", "PCV"], description: "MMR, chickenpox, and boosters" },
    { age: "12-23 months", vaccines: ["Hepatitis A"], description: "Hepatitis A vaccine series" },
    { age: "4-6 years", vaccines: ["DTaP", "IPV", "MMR", "Varicella"], description: "School entry vaccines" }
];

// Sleep Guidelines by Age
window.sleepGuidelines = window.sleepGuidelines || {
    newborn: {
        age: "0-3 months",
        totalSleep: "14-17 hours",
        nighttimeSleep: "8-9 hours",
        naps: "3-5 naps (30 min - 2 hours each)",
        tips: ["Back to sleep", "Swaddling", "White noise", "Dark room"]
    },
    infant: {
        age: "4-11 months",
        totalSleep: "12-16 hours",
        nighttimeSleep: "9-12 hours",
        naps: "2-3 naps (1-2 hours each)",
        tips: ["Consistent bedtime", "Self-soothing", "Safe sleep space", "Regular schedule"]
    },
    toddler: {
        age: "1-2 years",
        totalSleep: "11-14 hours",
        nighttimeSleep: "10-12 hours",
        naps: "1-2 naps (1-3 hours each)",
        tips: ["Bedtime routine", "Transition to one nap", "Comfort object", "Consistent limits"]
    },
    preschooler: {
        age: "3-5 years",
        totalSleep: "10-13 hours",
        nighttimeSleep: "9-11 hours",
        naps: "1 nap (1-2 hours)",
        tips: ["Regular bedtime", "Quiet time", "No screens before bed", "Consistent schedule"]
    }
};

// Application Configuration
window.appConfig = window.appConfig || {
    apiBaseUrl: window.location.origin + '/api',
    localStoragePrefix: 'mamasafe_',
    notificationDuration: 3000,
    animationDuration: 300,
    maxCacheAge: 3600000, // 1 hour
    itemsPerPage: 20,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    supportedVideoTypes: ['video/mp4', 'video/webm'],
    maxVideoSize: 50 * 1024 * 1024 // 50MB
};

// Error Messages
window.errorMessages = window.errorMessages || {
    network: "Network connection error. Please check your internet connection.",
    server: "Server error. Please try again later.",
    validation: "Please check your input and try again.",
    authentication: "Please login to continue.",
    permission: "You don't have permission to perform this action.",
    notFound: "The requested resource was not found.",
    generic: "An error occurred. Please try again."
};

// Success Messages
window.successMessages = window.successMessages || {
    saved: "Saved successfully!",
    updated: "Updated successfully!",
    deleted: "Deleted successfully!",
    created: "Created successfully!",
    uploaded: "Uploaded successfully!",
    login: "Login successful!",
    logout: "Logout successful!",
    registered: "Registration successful!"
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        namesData,
        pregnancyRegistryItems,
        toddlerMilestones,
        solidFoodGuidelines,
        vaccineSchedule,
        sleepGuidelines,
        appConfig,
        errorMessages,
        successMessages
    };
}
