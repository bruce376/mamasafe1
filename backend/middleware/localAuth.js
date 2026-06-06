const express = require('express');
const session = require('express-session');

// Simple in-memory user store for development
const users = new Map();

// Configure session for local authentication
function configureLocalSession(app) {
  app.use(session({
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
}

// Local authentication middleware
function authenticateLocal(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Combined authentication middleware that works with both Google OAuth and local auth
function authenticateAny(req, res, next) {
  // Check Google OAuth first
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Check local session
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  
  res.status(401).json({ error: 'Authentication required' });
}

// Login endpoint
function setupLocalAuthRoutes(app) {
  // Login page
  app.get('/local-login', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Local Login - Mamasafe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .login-container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
          }
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: bold;
          }
          input[type="text"], input[type="email"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
          }
          input[type="text"]:focus, input[type="email"]:focus {
            outline: none;
            border-color: #667eea;
          }
          button {
            width: 100%;
            background: #667eea;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
          }
          button:hover {
            background: #5a67d8;
          }
          .demo-info {
            background: #f0f4ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h1>🤱 Mamasafe Login</h1>
          <div class="demo-info">
            <strong>Development Mode:</strong> Enter any name and email to test the health chatbot.
          </div>
          <form action="/local-login" method="POST">
            <div class="form-group">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name" required placeholder="Enter your name">
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required placeholder="Enter your email">
            </div>
            <button type="submit">Login to Mamasafe</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });

  // Process login - regenerate session to prevent session fixation
  app.post('/local-login', express.urlencoded({ extended: true }), (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).send('Name and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send('Invalid email format');
    }

    // Sanitize name input
    const safeName = String(name).replace(/[<>"'&]/g, '');

    // Create user object
    const user = {
      id: email,
      displayName: safeName,
      email: email,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=667eea&color=fff&size=128`,
      provider: 'local',
      role: email.includes('mamasafe.com') ? 'admin' : 
             email.includes('doctor.com') || email.includes('hospital.com') ? 'healthcare_provider' : 'user',
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // Regenerate session to prevent session fixation (CWE-384)
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).send('Login failed');
      }
      req.session.user = user;
      res.redirect('/health-chatbot.html');
    });
  });

  // Logout
  app.get('/local-logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/local-login');
    });
  });

  // Get current user (handled by server.js)
  // app.get('/api/auth/user') is defined in server.js to avoid duplicate routes
}

module.exports = {
  configureLocalSession,
  authenticateLocal,
  authenticateAny,
  setupLocalAuthRoutes
};
