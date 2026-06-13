(function () {
    const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
    const renderBackendOrigin = 'https://mamasafe1.onrender.com';
    const isLocal = localHosts.has(window.location.hostname);
    const sameOriginBackend = window.location.hostname === 'mamasafe1.onrender.com';
    const backendOrigin = isLocal
        ? `${window.location.protocol}//${window.location.hostname}:5000`
        : sameOriginBackend
            ? window.location.origin
            : renderBackendOrigin;

    window.MAMASAFE_BACKEND_ORIGIN = backendOrigin.replace(/\/$/, '');
    window.MAMASAFE_API_BASE = `${window.MAMASAFE_BACKEND_ORIGIN}/api`;
    window.mamasafeApiUrl = function mamasafeApiUrl(path) {
        const normalized = String(path || '').startsWith('/') ? String(path) : `/${path || ''}`;
        return `${window.MAMASAFE_BACKEND_ORIGIN}${normalized}`;
    };

    window.BACKEND_API = window.BACKEND_API || {
        getBaseUrl() {
            return window.MAMASAFE_BACKEND_ORIGIN;
        }
    };
})();
