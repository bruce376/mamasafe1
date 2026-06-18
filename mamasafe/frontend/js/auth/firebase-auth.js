import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    RecaptchaVerifier,
    sendPasswordResetEmail,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signInWithPopup,
    signOut,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

// NOTE: Firebase "auth/internal-error" during Google sign-in is commonly caused by OAuth misconfiguration.
// We surface actionable troubleshooting details to the UI by showing both the Firebase error code/message
// and a dedicated hint for common causes (authorized domain + provider enabled).

const firebaseConfig = {
    apiKey: 'AIzaSyBC5J9iGAjsDrd7nSWixgpTlKU5Y0u5k-U',
    authDomain: 'mamasafe-95d58.firebaseapp.com',
    projectId: 'mamasafe-95d58',
    storageBucket: 'mamasafe-95d58.firebasestorage.app',
    messagingSenderId: '930280752528',
    appId: '1:930280752528:web:374ce317766cb395b81f15',
    measurementId: 'G-5RC14H8TQ4'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
let phoneConfirmationResult = null;
let recaptchaVerifier = null;
const googleFirstEmails = new Set([
    'ug2424887@ines.ac.rw'
]);


function normalizeEmail(email = '') {
    return String(email).trim().toLowerCase();
}

function providerStorageKey(email = '') {
    return `mamasafe_auth_provider:${normalizeEmail(email)}`;
}

function rememberAuthProvider(user) {
    const email = normalizeEmail(user?.email);
    if (!email) return;

    const providers = (user.providerData || [])
        .map(provider => provider.providerId)
        .filter(Boolean);

    if (providers.length) {
        localStorage.setItem(providerStorageKey(email), providers.join(','));
    }
}

function knownAuthProviders(email = '') {
    return (localStorage.getItem(providerStorageKey(email)) || '')
        .split(',')
        .map(provider => provider.trim())
        .filter(Boolean);
}

function isGoogleFirstEmail(email = '') {
    return googleFirstEmails.has(normalizeEmail(email));
}

function focusGoogleButton() {
    const googleButton = document.getElementById('firebaseGoogleLogin') || document.getElementById('googleLogin');
    if (googleButton) {
        googleButton.focus();
    }
}

function isStandaloneAuthPage() {
    return window.location.pathname.endsWith('/auth.html') || window.location.pathname.endsWith('auth.html');
}

function notify(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    console[type === 'error' ? 'error' : 'log'](message);
}

function closeAuthPanels() {
    document.querySelectorAll('#loginModal, #signupModal').forEach((modal) => {
        modal.style.display = 'none';
    });
}

function syncLocalAuthState(user) {
    if (user) {
        const email = user.email || user.phoneNumber || `${user.uid}@phone.mamasafe`;
        rememberAuthProvider(user);
        localStorage.setItem('bc_logged_in', 'true');
        localStorage.setItem('bc_user_email', email);
        localStorage.setItem('mamasafe_user_id', user.uid);
        localStorage.setItem('bc_auth_provider', user.providerData?.[0]?.providerId || 'firebase');
        if (user.displayName) localStorage.setItem('bc_user_name', user.displayName);
    } else {
        localStorage.removeItem('bc_logged_in');
        localStorage.removeItem('bc_user_email');
        localStorage.removeItem('mamasafe_user_id');
        localStorage.removeItem('bc_auth_provider');
        localStorage.removeItem('bc_user_name');
    }

    if (typeof window.updateLoginState === 'function') {
        window.updateLoginState();
    }
}

async function finishAuth(user, message) {
    syncLocalAuthState(user);
    if (typeof window.syncUserToBackend === 'function' && user) {
        const displayParts = String(user.displayName || '').trim().split(/\s+/);
        await window.syncUserToBackend({
            id: user.uid,
            userId: user.uid,
            email: user.email || user.phoneNumber || `${user.uid}@phone.mamasafe`,
            firstName: displayParts[0] || '',
            lastName: displayParts.slice(1).join(' '),
            name: user.displayName || user.email || user.phoneNumber || 'Mother',
            displayName: user.displayName || user.email || user.phoneNumber || 'Mother',
            source: 'firebase-auth',
            authAction: 'login',
            lastLoginAt: new Date().toISOString()
        }, 'firebase-auth').catch(error => {
            console.warn('Firebase user sync skipped:', error?.message || error);
        });
    }
    closeAuthPanels();
    notify(message, 'success');

    if (typeof window.resumeIntendedAccess === 'function') {
        window.resumeIntendedAccess('home');
    } else if (typeof window.navigateTo === 'function') {
        window.navigateTo('home', { skipAuthCheck: true });
    } else if (isStandaloneAuthPage()) {
        window.location.href = 'index.html';
    }
}

function authErrorMessage(error) {
    const code = error?.code || '';
    const messages = {
        'auth/email-already-in-use': 'That email already has a Mamasafe account. Please use Login with the correct password.',
        'auth/invalid-credential': 'Firebase rejected this email/password login. Use Continue with Google for a Google account, or click Need help? to set/reset a password for this email.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/invalid-phone-number': 'Please enter a valid phone number with country code.',
        'auth/invalid-verification-code': 'That SMS code is not correct.',
        'auth/missing-verification-code': 'Please enter the SMS code.',
        'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
        'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
        'auth/user-not-found': 'No account was found for that email.',
        'auth/wrong-password': 'The password is not correct.'
    };
    return messages[code] || error?.message || 'Authentication failed. Please try again.';
}

function legacyProfiles() {
    const profile = JSON.parse(localStorage.getItem('mamasafe_profile') || 'null');
    return [profile].filter(Boolean);
}

function hasLegacyLocalAccount(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return false;

    const currentEmail = localStorage.getItem('bc_user_email');
    if (currentEmail && currentEmail.toLowerCase() === normalized) return true;

    return legacyProfiles().some(profile => String(profile.email || '').toLowerCase() === normalized);
}

async function migrateLegacyEmailAccount(email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const profile = legacyProfiles().find(item => String(item.email || '').toLowerCase() === email.toLowerCase());
    const displayName = profile
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : localStorage.getItem('bc_user_name') || '';

    if (displayName) {
        await updateProfile(credential.user, { displayName });
    }

    return credential;
}

function shouldTryEmailUpgrade(error) {
    return (error?.code || '') === 'auth/user-not-found';
}

function isExistingFirebaseAccountError(error) {
    return ['auth/email-already-in-use', 'auth/credential-already-in-use'].includes(error?.code || '');
}

async function getSignInMethods(email) {
    try {
        return await fetchSignInMethodsForEmail(auth, email);
    } catch (error) {
        console.info('Could not check Firebase sign-in methods before login:', error?.code || error?.message || error);
        return null;
    }
}

function hasGoogleOnlyMethods(methods) {
    return Array.isArray(methods)
        && methods.includes('google.com')
        && !methods.includes('password');
}

function shouldPromptGoogleFirst(email, methods) {
    if (hasGoogleOnlyMethods(methods)) return true;

    const knownProviders = knownAuthProviders(email);
    return knownProviders.includes('google.com') && !knownProviders.includes('password');
}

function notifyGoogleOnlyAccount() {
    notify('This email is connected with Google sign-in. Click Continue with Google, or use Need help? if you want to set an email password.', 'info');
    focusGoogleButton();
}

async function continueWithGoogleForEmail() {
    notify('This account uses Google sign-in. Opening Google login now...', 'info');
    if (typeof window.handleGoogleAuth === 'function') {
        await window.handleGoogleAuth();
    } else {
        focusGoogleButton();
    }
}

function getPhoneVerifier() {
    if (recaptchaVerifier) return recaptchaVerifier;

    let container = document.getElementById('firebaseRecaptchaContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'firebaseRecaptchaContainer';
        document.body.appendChild(container);
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: 'invisible',
        callback: () => {}
    });

    return recaptchaVerifier;
}

window.isLoggedIn = function isLoggedIn() {
    return !!auth.currentUser || localStorage.getItem('bc_logged_in') === 'true';
};

window.handleLogin = async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value || '';
    const remember = document.getElementById('rememberMe')?.checked !== false;

    if (!email || !password) {
        notify('Please enter email and password', 'error');
        return;
    }

    if (isGoogleFirstEmail(email)) {
        await continueWithGoogleForEmail();
        return;
    }

    try {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        const methods = await getSignInMethods(email);

        if (shouldPromptGoogleFirst(email, methods)) {
            notifyGoogleOnlyAccount();
            return;
        }

        const credential = await signInWithEmailAndPassword(auth, email, password);
        await finishAuth(credential.user, 'Login successful!');
    } catch (error) {
        if ((error?.code || '') === 'auth/invalid-credential' && knownAuthProviders(email).includes('google.com')) {
            notifyGoogleOnlyAccount();
            return;
        }

        const canMigrateLegacyAccount = shouldTryEmailUpgrade(error) && hasLegacyLocalAccount(email);

        if (canMigrateLegacyAccount) {
            try {
                const credential = await migrateLegacyEmailAccount(email, password);
                await finishAuth(credential.user, 'Account connected and login successful!');
                return;
            } catch (migrationError) {
                if (isExistingFirebaseAccountError(migrationError)) {
                    notify(authErrorMessage(error), 'error');
                    return;
                }
                notify(authErrorMessage(migrationError), 'error');
                return;
            }
        }

        notify(authErrorMessage(error), 'error');
    }
};

window.showAuthHelp = async function showAuthHelp(type = 'password') {
    if (type === 'social') {
        notify('Use Google sign-in for Google-created accounts. Email/password only works after a password is set for that email.', 'info');
        return;
    }

    const email = document.getElementById('loginEmail')?.value?.trim();
    if (!email) {
        notify('Enter your email address first, then click Need help? to receive a password reset email.', 'info');
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        notify('Password reset email sent. Check your inbox, then return here to log in.', 'success');
    } catch (error) {
        notify(authErrorMessage(error), 'error');
    }
};

window.handleSignup = async function handleSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName')?.value?.trim();
    const lastName = document.getElementById('lastName')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        notify('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        notify('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        notify('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const signupProfile = {
            firstName,
            lastName,
            email,
            name: `${firstName} ${lastName}`.trim(),
            displayName: `${firstName} ${lastName}`.trim(),
            source: 'auth-signup',
            authAction: 'signup'
        };

        if (typeof window.checkUserAvailability === 'function') {
            const availability = await window.checkUserAvailability(signupProfile);
            if (!availability.available) {
                notify(availability.message || 'This name or email is already taken. Please log in instead.', 'error');
                return;
            }
        }

        await setPersistence(auth, browserLocalPersistence);
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, {
            displayName: `${firstName} ${lastName}`.trim()
        });

        const profile = {
            firstName,
            lastName,
            email,
            motherhoodStage: document.getElementById('motherhoodStage')?.value || '',
            careDate: document.getElementById('signupCareDate')?.value || '',
            carePriority: document.getElementById('carePriority')?.value || '',
            weeklyTipsOptIn: document.getElementById('weeklyTipsOptIn')?.checked !== false
        };

        // Pregnancy week persistence
        // If signup provides a date (careDate), convert it to a week and persist it.
        // The pregnancy page/account dashboard will read `bc_pregnancy_data.currentWeek`.
        const computedWeek = computePregnancyWeekFromDueDate(profile.careDate);
        if (computedWeek) {
            persistPregnancyWeekToLocalStorage(computedWeek);
        }
        localStorage.setItem('mamasafe_profile', JSON.stringify(profile));

        if (typeof window.syncUserToBackend === 'function') {
            await window.syncUserToBackend({
                ...signupProfile,
                id: credential.user.uid,
                userId: credential.user.uid,
                motherhoodStage: profile.motherhoodStage,
                careDate: profile.careDate,
                carePriority: profile.carePriority,
                weeklyTipsOptIn: profile.weeklyTipsOptIn
            }, 'auth-signup', { throwOnError: true });
        }

        await finishAuth(credential.user, 'Account created successfully!');
    } catch (error) {
        notify(authErrorMessage(error), 'error');
    }
};

function setAuthLoading(isLoading) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = isLoading ? 'block' : 'none';
    }

    const googleButtons = [
        document.getElementById('firebaseGoogleLogin'),
        document.getElementById('firebaseGoogleSignup'),
        document.getElementById('googleLogin')
    ].filter(Boolean);

    googleButtons.forEach((btn) => {
        btn.disabled = !!isLoading;
        if (isLoading) btn.setAttribute('aria-busy', 'true');
        else btn.removeAttribute('aria-busy');
    });
}

function safeNumber(val) {
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
}

function computePregnancyWeekFromDueDate(dueDateStr) {
    // dueDateStr expected in YYYY-MM-DD format
    const due = dueDateStr ? new Date(dueDateStr) : null;
    if (!due || Number.isNaN(due.getTime())) return null;

    const now = new Date();
    const msInDay = 1000 * 60 * 60 * 24;

    // Pregnancy week approximation: 40 weeks = 280 days from LMP to due date.
    // Weeks pregnant from conception approximation: (280 - daysUntilDue) / 7
    const daysUntilDue = (due.getTime() - now.getTime()) / msInDay;
    const weeks = (280 - daysUntilDue) / 7;

    // Clamp to [1..42]
    const rounded = Math.round(weeks);
    return Math.max(1, Math.min(42, rounded));
}

function persistPregnancyWeekToLocalStorage(week) {
    const w = safeNumber(week);
    if (!w) return;

    // app dashboard/account reads bc_pregnancy_data.currentWeek
    const existing = (() => {
        try {
            return JSON.parse(localStorage.getItem('bc_pregnancy_data') || '{}');
        } catch {
            return {};
        }
    })();

    existing.currentWeek = w;
    localStorage.setItem('bc_pregnancy_data', JSON.stringify(existing));

    // also keep a simple key for any other scripts
    localStorage.setItem('bc_pregnancy_week', String(w));
}

window.handleGoogleAuth = async function handleGoogleAuth() {
    setAuthLoading(true);
    try {
        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithPopup(auth, googleProvider);

        // Pregnancy week persistence (best-effort)
        // - On login UI we may not have due date fields, so use what the page provides.
        // - If due date exists in localStorage (set elsewhere), compute from it.
        // - Otherwise keep current local week as-is.
        const dueDateInput = document.getElementById('signupCareDate')?.value || null;
        const dueDateFromProfile = dueDateInput;
        const computedWeek = computePregnancyWeekFromDueDate(dueDateFromProfile) || computePregnancyWeekFromDueDate(document.getElementById('pregnancyDueDate')?.value);
        if (computedWeek) persistPregnancyWeekToLocalStorage(computedWeek);

        await finishAuth(credential.user, 'Google sign-in successful!');
    } catch (error) {
        console.error('Firebase Google sign-in failed:', {
            code: error?.code,
            message: error?.message,
            customData: error?.customData,
            stack: error?.stack
        });
        const details = [
            error?.code ? `Firebase code: ${error.code}` : null,
            error?.message ? `Firebase message: ${error.message}` : null,
            'Common causes of auth/internal-error: OAuth consent/redirect URI mis-match, missing authorized domains, or Google provider not enabled in Firebase.'
        ].filter(Boolean).join(' | ');

        const message =
            error?.code === 'auth/internal-error'
                ? `Google login failed: OAuth configuration issue. ${details}`
                : authErrorMessage(error);

        notify(message, 'error');
    } finally {
        setAuthLoading(false);
    }
};


window.handlePhoneLogin = async function handlePhoneLogin(event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('phoneNumber')?.value?.trim();
    if (!phoneNumber) {
        notify('Please enter your phone number', 'error');
        return;
    }

    try {
        phoneConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, getPhoneVerifier());
        const codeForm = document.getElementById('phoneCodeForm');
        if (codeForm) codeForm.style.display = 'grid';
        notify('SMS code sent. Check your phone.', 'success');
    } catch (error) {
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
        notify(authErrorMessage(error), 'error');
    }
};

window.handlePhoneCode = async function handlePhoneCode(event) {
    event.preventDefault();

    const code = document.getElementById('phoneCode')?.value?.trim();
    if (!phoneConfirmationResult) {
        notify('Please request an SMS code first.', 'error');
        return;
    }

    try {
        const credential = await phoneConfirmationResult.confirm(code);
        phoneConfirmationResult = null;
        await finishAuth(credential.user, 'Phone sign-in successful!');
    } catch (error) {
        notify(authErrorMessage(error), 'error');
    }
};

window.handleLogout = async function handleLogout() {
    try {
        await signOut(auth);
        syncLocalAuthState(null);
        notify('Logged out successfully', 'success');
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('home');
        }
    } catch (error) {
        notify(authErrorMessage(error), 'error');
    }
};

document.getElementById('firebaseGoogleLogin')?.addEventListener('click', window.handleGoogleAuth);
document.getElementById('firebaseGoogleSignup')?.addEventListener('click', window.handleGoogleAuth);
document.getElementById('googleLogin')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.handleGoogleAuth();
});

onAuthStateChanged(auth, (user) => {
    syncLocalAuthState(user);
});

window.mamasafeFirebaseAuth = {
    app,
    auth,
    signInWithGoogle: window.handleGoogleAuth,
    signOut: window.handleLogout
};

// Stable wrapper for the main SPA signup form
// (prevents other scripts that define handleSignup() from intercepting signup)
window.handleFirebaseSignup = function handleFirebaseSignup(event) {
    if (typeof window.handleSignup !== 'function') {
        console.error('Firebase handleSignup not available');
        return;
    }
    return window.handleSignup(event);
};


if (['#login', '#signup'].includes(window.location.hash)) {
    setTimeout(() => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo(window.location.hash.slice(1));
        }
    }, 100);
}
