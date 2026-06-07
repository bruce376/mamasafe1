const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// Configure session middleware
function configureSession(app) {
  app.use(session({
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
}

// Configure Google OAuth strategy
function configureGoogleStrategy() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth is disabled because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set.');
    return false;
  }

  const publicBackendUrl = (process.env.PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${publicBackendUrl}/auth/google/callback`,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user in database
      const existingUser = await findOrCreateUser(profile);
      return done(null, existingUser);
    } catch (error) {
      return done(error, null);
    }
  }));
  return true;
}

// Find or create user in database
async function findOrCreateUser(profile) {
  try {
    // Simple approach with role-based access (no database dependency)
    const user = {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value,
      provider: 'google',
      role: determineUserRole(profile.emails[0].value),
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    console.log('User authenticated:', user.displayName, '(', user.email, ')');
    return user;
  } catch (error) {
    console.error('Error finding/creating user:', error);
    throw error;
  }
}

// Determine user role based on email domain
function determineUserRole(email) {
  const adminDomains = ['mamasafe.com', 'healthcare.com'];
  const providerDomains = ['doctor.com', 'hospital.com'];
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (adminDomains.includes(domain)) {
    return 'admin';
  } else if (providerDomains.includes(domain)) {
    return 'healthcare_provider';
  } else {
    return 'user';
  }
}

// Role-based access control middleware
function hasRole(requiredRole) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = req.user.role || 'user';
    const roleHierarchy = { 'user': 1, 'healthcare_provider': 2, 'admin': 3 };
    
    if (roleHierarchy[userRole] >= roleHierarchy[requiredRole]) {
      return next();
    }
    
    res.status(403).json({ error: 'Insufficient permissions' });
  };
}

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized - Please login first' });
}

module.exports = {
  configureSession,
  configureGoogleStrategy,
  isAuthenticated,
  hasRole,
  passport
};
