// Mamasafe DB Sync - stores app data directly in Firebase Firestore.

const DB_SYNC = (() => {
    const QUEUE_KEY = 'mamasafe_offline_sync_queue';

    const firebaseConfig = {
        apiKey: 'AIzaSyBC5J9iGAjsDrd7nSWixgpTlKU5Y0u5k-U',
        authDomain: 'mamasafe-95d58.firebaseapp.com',
        projectId: 'mamasafe-95d58',
        storageBucket: 'mamasafe-95d58.firebasestorage.app',
        messagingSenderId: '930280752528',
        appId: '1:930280752528:web:374ce317766cb395b81f15',
        measurementId: 'G-5RC14H8TQ4'
    };

    const collectionMap = {
        pregnancy: 'pregnancy',
        sleep: 'sleep',
        nutrition: 'nutrition',
        milestones: 'milestones',
        activities: 'activities',
        appointments: 'appointments',
        users: 'users'
    };

    let firebaseReady;

    const remoteEnabled = () => localStorage.getItem('mamasafe_backend_sync') !== 'disabled';

    const safeJson = (value, fallback) => {
        try {
            const parsed = JSON.parse(value);
            return parsed == null ? fallback : parsed;
        } catch {
            return fallback;
        }
    };

    const getUserId = () =>
        localStorage.getItem('mamasafe_user_id') ||
        window.mamasafeFirebaseAuth?.auth?.currentUser?.uid ||
        localStorage.getItem('bc_user_email') ||
        'guest-user';

    const buildPayload = (data = {}) => ({
        userId: getUserId(),
        ...data,
        savedAt: data.savedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const queueOffline = (collectionName, data) => {
        try {
            const queue = safeJson(localStorage.getItem(QUEUE_KEY), []);
            queue.push({ collectionName, payload: buildPayload(data), queuedAt: new Date().toISOString() });
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-250)));
        } catch {
            // Sync must never break the page if storage is full or unavailable.
        }
    };

    async function getFirebase() {
        if (!firebaseReady) {
            firebaseReady = Promise.all([
                import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'),
                import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
            ]).then(([appModule, authModule, firestoreModule]) => {
                const app = appModule.getApps().length
                    ? appModule.getApp()
                    : appModule.initializeApp(firebaseConfig);
                const auth = authModule.getAuth(app);
                const db = firestoreModule.getFirestore(app);
                return { app, auth, onAuthStateChanged: authModule.onAuthStateChanged, ...firestoreModule, db };
            });
        }
        return firebaseReady;
    }

    const waitForAuthUser = (auth, authModule) => new Promise((resolve) => {
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        const unsubscribe = authModule.onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });

        setTimeout(() => {
            unsubscribe();
            resolve(auth.currentUser);
        }, 2500);
    });

    const requireSignedInUser = async () => {
        const firebase = await getFirebase();
        const user = firebase.auth.currentUser ||
            window.mamasafeFirebaseAuth?.auth?.currentUser ||
            await waitForAuthUser(firebase.auth, firebase);
        if (!user) {
            throw new Error('Please sign in before syncing data.');
        }
        return { firebase, user };
    };

    const saveToCollection = async (collectionName, data) => {
        const payload = buildPayload(data);
        if (!remoteEnabled()) {
            queueOffline(collectionName, payload);
            return { ok: false, queued: true };
        }

        try {
            const { firebase, user } = await requireSignedInUser();
            const finalPayload = {
                ...payload,
                userId: user.uid,
                userEmail: user.email || localStorage.getItem('bc_user_email') || '',
                createdAt: firebase.serverTimestamp()
            };
            const docRef = await firebase.addDoc(firebase.collection(firebase.db, collectionName), finalPayload);
            return { ok: true, queued: false, result: { id: docRef.id, ...finalPayload } };
        } catch (error) {
            queueOffline(collectionName, payload);
            return { ok: false, queued: true, error: error.message };
        }
    };

    const loadFromCollection = async (collectionName, userId = getUserId(), fallback = []) => {
        if (!remoteEnabled()) return fallback;

        try {
            const { firebase, user } = await requireSignedInUser();
            const effectiveUserId = userId === 'guest-user' ? user.uid : userId;
            const snapshot = await firebase.getDocs(
                firebase.query(
                    firebase.collection(firebase.db, collectionName),
                    firebase.where('userId', '==', effectiveUserId)
                )
            );

            return snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));
        } catch {
            return fallback;
        }
    };

    const request = async (target, options = {}) => {
        const method = (options.method || 'GET').toUpperCase();
        const collectionName = String(target || '').replace(/^\/+/, '').split('/')[0];
        const id = String(target || '').replace(/^\/+/, '').split('/')[1];

        if (target === '/health') {
            const { user } = await requireSignedInUser();
            return {
                status: 'OK',
                database: { connected: true, mode: 'firestore', name: firebaseConfig.projectId },
                userId: user.uid,
                timestamp: new Date().toISOString()
            };
        }

        if (method === 'POST') {
            return saveToCollection(collectionName, safeJson(options.body || '{}', {}));
        }

        return loadFromCollection(collectionName, id || getUserId());
    };

    const flushQueue = async () => {
        if (!remoteEnabled()) return { sent: 0, remaining: getQueue().length };
        const queue = getQueue();
        if (!queue.length) return { sent: 0, remaining: 0 };

        const remaining = [];
        let sent = 0;

        for (const item of queue) {
            try {
                await saveToCollection(item.collectionName, item.payload);
                sent += 1;
            } catch {
                remaining.push(item);
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
        return { sent, remaining: remaining.length };
    };

    const getQueue = () => {
        const queue = safeJson(localStorage.getItem(QUEUE_KEY), []);
        return Array.isArray(queue) ? queue : [];
    };
    const saveGenericActivity = (type, data) => saveToCollection(collectionMap.activities, { type, ...data });

    const api = {
        baseUrl: `firestore://${firebaseConfig.projectId}`,
        getUserId,
        isEnabled: remoteEnabled,
        getQueue,
        flushQueue,
        request,
        health: () => request('/health'),

        saveUser: (data) => saveToCollection(collectionMap.users, data),
        saveProfile: (data) => saveGenericActivity('profile', data),
        saveSettings: (data) => saveGenericActivity('settings', data),
        saveHelpRequest: (data) => saveGenericActivity('help-request', data),
        saveSupportMessage: (data) => saveGenericActivity('support-message', data),
        saveLocalRecord: (key, data) => saveGenericActivity(`local:${key}`, { key, data }),

        savePregnancy: (data) => saveToCollection(collectionMap.pregnancy, data),
        saveSleep: (data) => saveToCollection(collectionMap.sleep, data),
        saveNutrition: (data) => saveToCollection(collectionMap.nutrition, data),
        saveMilestone: (data) => saveToCollection(collectionMap.milestones, data),
        saveActivity: (data) => saveToCollection(collectionMap.activities, data),
        saveAppointment: (data) => saveToCollection(collectionMap.appointments, data),

        loadPregnancy: (userId = getUserId()) => loadFromCollection(collectionMap.pregnancy, userId),
        loadSleep: (userId = getUserId()) => loadFromCollection(collectionMap.sleep, userId),
        loadNutrition: (userId = getUserId()) => loadFromCollection(collectionMap.nutrition, userId),
        loadMilestones: (userId = getUserId()) => loadFromCollection(collectionMap.milestones, userId),
        loadActivities: (userId = getUserId()) => loadFromCollection(collectionMap.activities, userId),
        loadAppointments: (userId = getUserId()) => loadFromCollection(collectionMap.appointments, userId)
    };

    window.addEventListener('online', () => {
        api.flushQueue();
    });
    window.addEventListener('DOMContentLoaded', () => {
        api.flushQueue();
    });

    return api;
})();

window.DB_SYNC = DB_SYNC;
window.backendApi = DB_SYNC;
