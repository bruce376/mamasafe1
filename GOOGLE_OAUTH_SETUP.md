# Google OAuth Setup Instructions

## Problem: redirect_uri_mismatch Error

The error `Error 400: redirect_uri_mismatch` occurs when the redirect URI in your Google Cloud Console doesn't match the one configured in the application.

## Solution: Update Google Cloud Console

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Make sure you're logged in with the correct Google account
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID
Look for the client ID:
```
741480813013-p74gtrqjfqf1i2dsjipujr3r99nu88rn.apps.googleusercontent.com
```

### Step 3: Add Authorized Redirect URIs
1. Click on your OAuth 2.0 Client ID to edit it
2. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:5000/auth/google/callback
   ```
3. Click **Save**

### Step 4: Wait for Propagation
- Changes may take a few minutes to propagate
- Clear your browser cache if needed

## Alternative: Use Local Login

If you can't access Google Cloud Console or prefer not to use Google OAuth:

### Quick Access Method:
1. Navigate to: http://localhost:5000/auth.html
2. Click **"Quick Login (No Google)"**
3. Enter any name and email
4. You'll have immediate access to the health chatbot

### Direct Local Login:
1. Navigate to: http://localhost:5000/local-login
2. Enter your name and email
3. Access the health chatbot instantly

## Testing

After setting up Google OAuth:
1. Navigate to: http://localhost:5000/auth.html
2. Click "Continue with Google"
3. Complete Google authentication
4. You should be redirected to the health chatbot

## Features Available with Both Methods

✅ **Health Chatbot**: AI-powered health assistant  
✅ **Medical Guidance**: Safe, evidence-based responses  
✅ **Emergency Detection**: Identifies urgent situations  
✅ **Chat History**: Save and review conversations  
✅ **Personalized Responses**: Context-aware health advice  
✅ **Secure Authentication**: Protected user sessions  

## Security Notes

- Local login uses secure session management
- All health data is stored securely
- Medical disclaimers are included in all responses
- Emergency situations are properly handled

## Support

If you continue to experience issues:
1. Use the local login option for immediate access
2. Check that the redirect URI exactly matches: `http://localhost:5000/auth/google/callback`
3. Ensure your Google Cloud project has the Google+ API enabled
4. Verify your OAuth client is configured for "Web application" type

The health chatbot is fully functional with both authentication methods!
