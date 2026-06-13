// Local Knowledge-Based Health Chatbot
// Provides health guidance without requiring external APIs

const healthKnowledgeBase = {
  pregnancy: {
    symptoms: {
      "normal pregnancy symptoms": {
        response: "Normal pregnancy symptoms include:\n\nFirst Trimester (Weeks 1-12):\nMissed period, nausea and vomiting (morning sickness), fatigue and increased need for sleep, tender swollen breasts, frequent urination, food cravings or aversions, mood swings, light spotting (implantation bleeding)\n\nSecond Trimester (Weeks 13-27):\nDecreased nausea, increased energy, growing belly, skin changes (darkening nipples, linea nigra), stretch marks, swelling in hands and feet, back pain, movement of baby (quickening around 16-20 weeks)\n\nThird Trimester (Weeks 28-40):\nIncreased fatigue, shortness of breath, heartburn, Braxton Hicks contractions, pelvic pressure, difficulty sleeping, leaking colostrum\n\nThese symptoms are normal and vary from woman to woman. Always consult your healthcare provider if you have concerns.",
        keywords: ["normal symptoms", "pregnancy symptoms", "early pregnancy", "what to expect"]
      },
      "morning sickness": {
        response: "Morning sickness relief strategies:\n\nDietary Changes:\nEat small, frequent meals (6-8 small meals instead of 3 large ones), keep crackers by your bed and eat before getting up, avoid spicy, fatty, and very sweet foods, choose bland, easy-to-digest foods, stay hydrated with small sips throughout the day\n\nLifestyle Tips:\nGet plenty of rest, avoid strong odors that trigger nausea, wear loose, comfortable clothing, try ginger (tea, candies, or supplements), use acupressure bands on wrists\n\nWhen to Call Your Doctor:\nSevere vomiting (can't keep anything down), weight loss of more than 5% of pre-pregnancy weight, signs of dehydration (dark urine, dizziness, extreme thirst), vomiting blood\n\nThese strategies can help manage morning symptoms effectively.",
        keywords: ["morning sickness", "nausea", "vomiting", "sick"]
      },
      "headache": {
        response: "Headaches during pregnancy:\n\nCommon Causes:\nHormonal changes, increased blood volume, caffeine withdrawal, stress and fatigue, sinus congestion, dehydration\n\nSafe Relief Methods:\nRest in a quiet, dark room, apply cold compress to forehead, practice gentle neck stretches, stay well hydrated, maintain regular sleep schedule, try prenatal massage\n\nWhen to Call Your Doctor Immediately:\nSevere or sudden headache, headache with fever and stiff neck, headache with vision changes or blurred vision, headache that doesn't improve with rest, headache after head injury\n\nMedication Safety:\nAlways consult your healthcare provider before taking any medication during pregnancy, including over-the-counter pain relievers.",
        keywords: ["headache", "migraine", "pain"]
      }
    },
    nutrition: {
      "safe foods": {
        response: "Safe and nutritious foods during pregnancy:\n\n**Protein Sources:**\n• Lean meats (chicken, turkey, lean beef)\n• Fish (low-mercury options like salmon, cod, tilapia)\n• Eggs (fully cooked)\n• Beans and lentils\n• Tofu and tempeh\n• Greek yogurt\n\n**Fruits and Vegetables:**\n• Leafy greens (spinach, kale)\n• Colorful vegetables (bell peppers, carrots, tomatoes)\n• Citrus fruits (oranges, grapefruits)\n• Berries (blueberries, strawberries)\n• Bananas\n• Avocados\n\n**Whole Grains:**\n• Oatmeal\n• Brown rice\n• Quinoa\n• Whole wheat bread\n• Barley\n\n**Healthy Fats:**\n• Nuts and seeds (in moderation)\n• Olive oil\n• Avocado\n• Nut butters\n\n**Foods to Avoid or Limit:**\n• High-mercury fish (shark, swordfish, king mackerel)\n• Raw or undercooked meat, eggs, and fish\n• Unpasteurized dairy products\n• Deli meats and hot dogs (unless heated until steaming)\n• Excessive caffeine (limit to 200mg daily)\n• Alcohol (completely avoid)\n\n",
        keywords: ["safe foods", "nutrition", "what to eat", "diet"]
      },
      "cravings": {
        response: "Managing pregnancy cravings:\n\n**Common Cravings:**\n• Sweet foods (chocolate, ice cream)\n• Salty foods (chips, pretzels)\n• Sour foods (pickles, citrus)\n• Spicy foods\n• Specific textures (crunchy, creamy)\n\n**Healthy Ways to Satisfy Cravings:**\n**Sweet cravings:**\n• Fresh fruit with yogurt\n• Dark chocolate (in moderation)\n• Smoothies with natural sweeteners\n\n**Salty cravings:**\n• Nuts and seeds\n• Whole grain crackers with hummus\n• Roasted chickpeas\n\n**Sour cravings:**\n• Citrus fruits\n• Pickled vegetables\n• Greek yogurt with lemon\n\n**When to Be Concerned:**\n• Pica (craving non-food items like dirt, clay, or chalk)\n• Cravings that interfere with balanced nutrition\n• Excessive consumption of unhealthy foods\n\n",
        keywords: ["cravings", "pica", "weird food", "want to eat"]
      }
    },
    emergencies: {
      "bleeding": {
        response: "⚠️ **MEDICAL EMERGENCY - Contact Healthcare Provider Immediately**\n\n**Bleeding During Pregnancy Requires Immediate Medical Attention**\n\n**Call Your Doctor or Go to Emergency Room If:**\n• Heavy bleeding (soaking through pad in an hour)\n• Bleeding with cramping or pain\n• Bleeding with fever or chills\n• Bleeding after first trimester\n• Dizziness or fainting\n\n**While Waiting for Medical Help:**\n• Lie down and elevate your feet\n• Avoid sexual intercourse\n• Don't insert anything into vagina\n• Keep track of amount of bleeding\n\n**Note About Spotting:**\nLight spotting can be normal in early pregnancy, but any bleeding should be evaluated by a healthcare provider to rule out complications.\n\n**Emergency Services:** Call 911 if you experience heavy bleeding with severe pain, dizziness, or fainting.\n\n",
        keywords: ["bleeding", "blood", "spotting", "hemorrhage"]
      },
      "severe pain": {
        response: "⚠️ **MEDICAL EMERGENCY - Seek Immediate Medical Attention**\n\n**Severe Pain During Pregnancy Requires Immediate Evaluation**\n\n**Go to Emergency Room or Call 911 For:**\n• Severe abdominal or pelvic pain\n• Pain with fever\n• Pain with bleeding\n• Pain that doesn't go away with rest\n• Pain accompanied by dizziness or fainting\n\n**Possible Causes of Severe Pain:**\n• Ectopic pregnancy\n• Miscarriage\n• Preterm labor\n• Placental abruption\n• Urinary tract infection\n• Appendicitis\n\n**While Waiting for Medical Help:**\n• Lie down in comfortable position\n• Avoid eating or drinking\n• Have someone drive you to emergency room\n• Bring pregnancy records if available\n\n**Emergency Services:** Call 911 if you experience severe pain with bleeding, fever, or difficulty breathing.\n\n",
        keywords: ["severe pain", "cramping", "abdominal pain", "emergency"]
      }
    }
  }
};

// Emergency keywords that require immediate attention
const emergencyKeywords = [
  'emergency', 'urgent', 'severe pain', 'bleeding', 'blood', 'spotting',
  'chest pain', 'difficulty breathing', 'shortness of breath', 'faint', 'fainting',
  'unconscious', 'high fever', 'seizure', 'allergic reaction', 'swallow', 'poison',
  'suicide', 'self harm', 'hurt myself', 'kill myself'
];

/**
 * Process health query using local knowledge base
 * @param {string} userMessage - The user's health question
 * @param {Object} userContext - User's profile and context
 * @returns {Promise<string>} The chatbot response
 */
async function processLocalHealthQuery(userMessage, userContext = {}) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for emergency keywords first
  const foundEmergencyKeywords = emergencyKeywords.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  if (foundEmergencyKeywords.length > 0) {
    return getEmergencyResponse(foundEmergencyKeywords[0]);
  }
  
  // Search knowledge base for relevant response
  const response = searchKnowledgeBase(lowerMessage);
  
  if (response) {
    return response;
  }
  
  // If no specific response found, provide general guidance
  return getGeneralHealthResponse(lowerMessage, userContext);
}

/**
 * Search knowledge base for matching response
 */
function searchKnowledgeBase(message) {
  // Search through all categories and topics
  for (const category of Object.values(healthKnowledgeBase)) {
    for (const topic of Object.values(category)) {
      // Check if this is a nested topic (has subtopics)
      if (typeof topic === 'object' && !topic.response) {
        // Search through subtopics
        for (const subtopic of Object.values(topic)) {
          if (subtopic.keywords && Array.isArray(subtopic.keywords) && subtopic.keywords.some(keyword => message.includes(keyword))) {
            return subtopic.response;
          }
        }
      } else if (topic.keywords && Array.isArray(topic.keywords) && topic.keywords.some(keyword => message.includes(keyword))) {
        // Handle direct topics (not nested)
        return topic.response;
      }
    }
  }
  return null;
}

/**
 * Get emergency response for specific emergency
 */
function getEmergencyResponse(keyword) {
  if (keyword.includes('bleeding') || keyword.includes('blood') || keyword.includes('spotting')) {
    return healthKnowledgeBase.pregnancy.emergencies.bleeding.response;
  } else if (keyword.includes('pain') || keyword.includes('cramping')) {
    return healthKnowledgeBase.pregnancy.emergencies['severe pain'].response;
  } else {
    return `⚠️ **MEDICAL EMERGENCY - Seek Immediate Medical Attention**\n\nBased on your message mentioning "${keyword}", please:\n\n• Call emergency services (911) immediately\n• Go to the nearest emergency room\n• Do not wait if you're experiencing severe symptoms\n\n**Emergency Services:** Call 911 for immediate medical assistance.\n\n`;
  }
}

/**
 * Get general health response when no specific match found
 */
function getGeneralHealthResponse(message, userContext) {
  // Check for greetings first
  const lowerMessage = message.toLowerCase().trim();
  const greetings = ['hey', 'hello', 'hi', 'hey there', 'hi there', 'good morning', 'good afternoon', 'good evening'];
  
  if (greetings.some(greeting => lowerMessage === greeting || lowerMessage.startsWith(greeting + ' '))) {
    let contextPrefix = '';
    
    if (userContext.pregnancyWeek) {
      contextPrefix = `Hello! I see you're ${userContext.pregnancyWeek} weeks pregnant. `;
    } else {
      contextPrefix = `Hello! `;
    }
    
    return `${contextPrefix}I'm here to help with pregnancy symptoms, nutrition, warning signs, appointments, and maternal wellness. How can I assist you today?`;
  }
  
  let contextPrefix = '';
  
  if (userContext.pregnancyWeek) {
    contextPrefix = `Since you're ${userContext.pregnancyWeek} weeks pregnant, `;
  }
  
  return `${contextPrefix}I understand you have questions. While I don't have specific information about that topic in my knowledge base, I can help with general guidance.

General health tips include staying hydrated, maintaining a balanced diet, getting adequate rest, and managing stress. It's always good to keep track of any symptoms and follow recommended check-up schedules.

For any specific medical concerns, questions about medications, or worrying symptoms, it's best to consult with your healthcare provider.

In emergency situations like severe pain, difficulty breathing, high fever, or loss of consciousness, call emergency services immediately.

Would you like me to help you with common pregnancy symptoms, nutrition guidelines, warning signs, or appointment preparation?`;
}

/**
 * Generate context-based suggestions
 */
function generateLocalHealthSuggestions(userContext = {}) {
  if (userContext.pregnancyWeek) {
    const week = parseInt(userContext.pregnancyWeek);
    if (week <= 12) {
      return [
        "What are early pregnancy symptoms?",
        "How to handle morning sickness?",
        "What foods to avoid in first trimester?",
        "When to announce pregnancy?"
      ];
    } else if (week <= 28) {
      return [
        "What to expect in second trimester?",
        "How to track baby movements?",
        "Best exercises for pregnancy?",
        "How should I prepare for birth?"
      ];
    } else {
      return [
        "Signs of labor approaching?",
        "How to prepare for birth?",
        "Postpartum recovery tips?",
        "Breastfeeding preparation?"
      ];
    }
  }

  return [
    "What are normal pregnancy symptoms?",
    "How can I relieve morning sickness?",
    "What foods are safe during pregnancy?",
    "When should I call my doctor?",
    "What are emergency warning signs?"
  ];
}

module.exports = {
  processLocalHealthQuery,
  generateLocalHealthSuggestions,
  healthKnowledgeBase,
  checkEmergencyKeywords: (message) => {
    const lowerMessage = message.toLowerCase();
    const foundKeywords = emergencyKeywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    return {
      isEmergency: foundKeywords.length > 0,
      keywords: foundKeywords,
      message: foundKeywords.length > 0 ? getEmergencyResponse(foundKeywords[0]) : null
    };
  }
};
