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
        appConfig,
        errorMessages,
        successMessages
    };
}
