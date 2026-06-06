import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    RecaptchaVerifier,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signInWithPopup,
    signOut,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

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
    closeAuthPanels();
    notify(message, 'success');

    if (typeof window.resumeIntendedAccess === 'function') {
        window.resumeIntendedAccess();
    } else if (typeof window.navigateTo === 'function') {
        window.navigateTo('home', { skipAuthCheck: true });
    } else if (isStandaloneAuthPage()) {
        window.location.href = 'index.html';
    }
}

function authErrorMessage(error) {
    const code = error?.code || '';
    const messages = {
        'auth/email-already-in-use': 'That email already has a Mamasafe account.',
        'auth/invalid-credential': 'The email or password is not correct.',
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

    try {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await finishAuth(credential.user, 'Login successful!');
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

    if (password.length < 8) {
        notify('Password must be at least 8 characters', 'error');
        return;
    }

    try {
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
        localStorage.setItem('mamasafe_profile', JSON.stringify(profile));

        await finishAuth(credential.user, 'Account created successfully!');
    } catch (error) {
        notify(authErrorMessage(error), 'error');
    }
};

window.handleGoogleAuth = async function handleGoogleAuth() {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithPopup(auth, googleProvider);
        await finishAuth(credential.user, 'Google sign-in successful!');
    } catch (error) {
        notify(authErrorMessage(error), 'error');
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

if (['#login', '#signup'].includes(window.location.hash)) {
    setTimeout(() => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo(window.location.hash.slice(1));
        }
    }, 100);
}
