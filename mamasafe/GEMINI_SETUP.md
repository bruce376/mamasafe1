# Gemini AI Integration Setup Guide

## Overview
Mamasafe has been successfully integrated with Google's Gemini AI to provide intelligent pregnancy and parenting assistance through the existing AI chat system.

## Installation Status
✅ Dependencies installed (@google/generative-ai)
✅ Backend service created (services/geminiService.js)
✅ API endpoints configured (/api/mamasafe-chat, /api/mamasafe-analyze-image)
✅ Frontend integration complete
✅ Image analysis capability added
✅ Secure backend proxy implemented

## Setup Instructions

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (starts with "AIzaSy...")

### 2. Configure API Key
Open `backend/.env` file and replace the placeholder:
```
GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

### 3. Restart Backend Server
```bash
cd backend
npm start
```

### 4. Test the Integration
1. Open Mamasafe in your browser (http://localhost:5000)
2. Click the floating AI widget (🤖)
3. Ask a pregnancy-related question
4. The AI will respond using Gemini AI

## Features

### Chat Functionality
- **Context-Aware Responses**: AI considers pregnancy week and baby age from your app state
- **Medical Disclaimer**: Always includes professional medical care disclaimer
- **Evidence-Based**: Provides accurate, up-to-date pregnancy information
- **Empathetic Tone**: Warm, supportive responses tailored for expectant mothers

### Image Analysis
- **Upload Images**: Click the 📷 button in the AI chat
- **Analyze Food**: Check if foods are safe during pregnancy
- **Ultrasound Analysis**: Get insights about ultrasound images
- **General Image Analysis**: Ask questions about any relevant images

### Topics Covered
- Pregnancy nutrition and dietary guidance
- Symptom management and health monitoring
- Fetal development and milestone tracking
- Postpartum recovery and newborn care
- Mental health and emotional support
- Safety guidelines and medical recommendations

## API Endpoints

### Chat Endpoint
```
POST /api/mamasafe-chat
Content-Type: application/json

{
  "message": "What foods should I avoid during pregnancy?",
  "context": {
    "week": 24,
    "babyAge": null
  }
}

Response:
{
  "reply": "During pregnancy, avoid raw or undercooked meat, fish high in mercury..."
}
```

### Image Analysis Endpoint
```
POST /api/mamasafe-analyze-image
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "prompt": "Is this food safe during pregnancy?"
}

Response:
{
  "analysis": "Based on the image, this appears to be sushi with raw fish..."
}
```

## Security Features
- **Backend Proxy**: API key never exposed to frontend
- **Environment Variables**: Sensitive data stored securely
- **Error Handling**: Graceful fallback to offline mode
- **Input Validation**: Sanitized inputs to prevent injection

## Troubleshooting

### AI Not Responding
1. Check if backend server is running
2. Verify API key in .env file
3. Check browser console for errors
4. Ensure network connectivity

### Image Analysis Not Working
1. Check image file size (max 10MB recommended)
2. Verify image format (JPEG, PNG supported)
3. Check API key permissions (vision model access)

### Offline Mode
If Gemini API fails, the system automatically falls back to the original rule-based responses with "(Using offline mode)" indicator.

## Production Deployment
For production:
1. Use environment-specific API keys
2. Implement rate limiting
3. Add authentication/authorization
4. Monitor API usage and costs
5. Set up logging and monitoring

## Cost Considerations
- Gemini 1.5 Flash: Cost-effective for most use cases
- Monitor token usage in Google Cloud Console
- Consider caching frequently asked questions
- Implement user session limits if needed

## Future Enhancements
- Streaming responses for real-time feel
- Voice input/output integration
- Multi-language support
- Custom prompt templates
- Integration with medical databases

## Support
For issues or questions:
- Check browser console for error messages
- Verify backend server logs
- Test API endpoints directly
- Review Gemini AI documentation
