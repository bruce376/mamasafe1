(function () {
    const PUBLIC_PAGE_IDS = new Set(['help-section', 'login', 'signup', 'admin']);
    const PREVIEW_BANNER_CLASS = 'guest-feature-lock-banner';
    const ACTION_SELECTOR = [
        'button',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        'a[href]',
        '[onclick]',
        '[role="button"]',
        '[tabindex]:not([tabindex="-1"])',
        '.tool-card',
        '.resource-card',
        '.course-card',
        '.problem-card',
        '.topic-card',
        '.pregnancy-topic-card',
        '.gpx-tool',
        '.action-btn'
    ].join(',');

    let lastPromptAt = 0;

    function hasGuestSession() {
        const loggedIn = localStorage.getItem('bc_logged_in') === 'true';
        const email = (localStorage.getItem('bc_user_email') || '').trim();
        return loggedIn && email;
    }

    function normalizePageId(pageId) {
        const aliases = {
            'baby-names': 'names',
            'baby-sleep-tracker': 'sleep-tracker',
            'solid-feeding-guide': 'solid-feeding-guide-page',
            family: 'baby'
        };
        return aliases[pageId] || pageId || '';
    }

    function getActivePageId() {
        const active = document.querySelector('.page-section.active');
        if (active?.id) return normalizePageId(active.id);
        const hash = window.location.hash ? window.location.hash.slice(1) : '';
        if (hash) return normalizePageId(hash);
        return '';
    }

    function getElementPageId(element) {
        const section = element?.closest?.('.page-section');
        return normalizePageId(section?.id || '');
    }

    function isAuthOrAdminPath() {
        const path = window.location.pathname.toLowerCase();
        return path.endsWith('/auth.html') || path.includes('/admin/');
    }

    function isPublicContext(element) {
        const pageId = getElementPageId(element) || getActivePageId();
        return PUBLIC_PAGE_IDS.has(pageId) || isAuthOrAdminPath();
    }

    function getInlineHandler(element) {
        return (element?.getAttribute?.('onclick') || '').trim();
    }

    function isCloseOrAuthUtility(element) {
        const onclick = getInlineHandler(element);
        if (element.closest('[data-guest-auth-link], .guest-login-cta')) return true;
        if (element.matches('.modal-close, .close-btn, .guide-close-btn, [data-dismiss], [aria-label="Close"]')) return true;
        return /^(close|hide|dismiss|toggleAuthPassword|showAuthHelp)\w*\s*\(/.test(onclick);
    }

    function isDirectNavigationAction(element) {
        const onclick = getInlineHandler(element);
        if (/navigateTo\s*\(/.test(onclick) || /navigateToTool\s*\(/.test(onclick)) return true;
        if (/window\.location\.href\s*=|location\.assign\s*\(/.test(onclick)) return true;

        const link = element.matches('a[href]') ? element : element.closest('a[href]');
        if (!link) return false;

        const href = (link.getAttribute('href') || '').trim();
        if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) {
            return /navigateTo\s*\(/.test(onclick);
        }

        return true;
    }

    function getActionElement(event) {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return null;

        if (event.type === 'submit') {
            return target.matches('form') ? target : target.closest('form');
        }

        return target.closest(ACTION_SELECTOR);
    }

    function rememberGuestDestination(element) {
        const pageId = getElementPageId(element) || getActivePageId() || 'home';
        localStorage.setItem('bc_intended_page', pageId);
        localStorage.removeItem('bc_intended_action');
    }

    function showGuestPrompt() {
        const now = Date.now();
        if (now - lastPromptAt < 900) return;
        lastPromptAt = now;

        if (typeof window.showNotification === 'function') {
            window.showNotification('Please log in to use this feature. You can still browse the page.', 'warning');
        } else {
            showFallbackGuestToast();
        }
    }

    function showFallbackGuestToast() {
        const existing = document.getElementById('guestFeatureLockToast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'guestFeatureLockToast';
        toast.textContent = 'Please log in to use this feature. You can still browse the page.';
        toast.style.cssText = [
            'position: fixed',
            'right: 18px',
            'top: 18px',
            'z-index: 10000',
            'max-width: 320px',
            'padding: 14px 16px',
            'border-radius: 8px',
            'background: #0f766e',
            'color: #ffffff',
            'box-shadow: 0 12px 30px rgba(15, 23, 42, 0.22)',
            'font: 600 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        ].join(';');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3600);
    }

    function blockGuestEvent(event, actionElement) {
        rememberGuestDestination(actionElement);
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        }

        if (event.type === 'focusin' && typeof actionElement.blur === 'function') {
            actionElement.blur();
        }

        showGuestPrompt();
    }

    function handleGuestEvent(event) {
        if (hasGuestSession()) return;

        const actionElement = getActionElement(event);
        if (!actionElement) return;
        if (isPublicContext(actionElement)) return;
        if (isCloseOrAuthUtility(actionElement)) return;
        if (isDirectNavigationAction(actionElement)) return;

        blockGuestEvent(event, actionElement);
    }

    function getPreviewHost() {
        return document.querySelector('.page-section.active')
            || document.querySelector('.page-container')
            || document.querySelector('main')
            || document.body;
    }

    function buildBanner() {
        const banner = document.createElement('div');
        banner.className = PREVIEW_BANNER_CLASS;

        const copy = document.createElement('div');
        const title = document.createElement('strong');
        const text = document.createElement('span');
        const button = document.createElement('button');

        title.textContent = 'Preview mode';
        text.textContent = 'Log in to use calculators, trackers, AI tools, saved plans, and account features. Help stays open for everyone.';
        button.type = 'button';
        button.className = 'guest-login-cta';
        button.dataset.guestAuthLink = 'true';
        button.textContent = 'Log in';
        button.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('login');
            } else {
                window.location.href = 'index.html#login';
            }
        });

        copy.append(title, text);
        banner.append(copy, button);
        return banner;
    }

    function syncGuestFeatureLock() {
        document.querySelectorAll(`.${PREVIEW_BANNER_CLASS}`).forEach(banner => banner.remove());

        const isPreview = !hasGuestSession() && !isPublicContext(document.body);
        document.body.classList.toggle('guest-preview-mode', isPreview);
        if (!isPreview) return;

        const host = getPreviewHost();
        if (!host || host.querySelector(`:scope > .${PREVIEW_BANNER_CLASS}`)) return;
        host.prepend(buildBanner());
    }

    function wrapNavigation() {
        if (typeof window.navigateTo === 'function' && !window.navigateTo.__guestFeatureLockWrapped) {
            const originalNavigateTo = window.navigateTo;
            const wrappedNavigateTo = function (...args) {
                const result = originalNavigateTo.apply(this, args);
                setTimeout(syncGuestFeatureLock, 0);
                return result;
            };
            wrappedNavigateTo.__guestFeatureLockWrapped = true;
            window.navigateTo = wrappedNavigateTo;
        }

        if (typeof window.navigateToTool === 'function' && !window.navigateToTool.__guestFeatureLockWrapped) {
            const wrappedNavigateToTool = function (pageId) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo(pageId);
                }
            };
            wrappedNavigateToTool.__guestFeatureLockWrapped = true;
            window.navigateToTool = wrappedNavigateToTool;
        }
    }

    function installGuestFeatureLock() {
        if (window.__mamasafeGuestFeatureLockInstalled) {
            syncGuestFeatureLock();
            return;
        }

        window.__mamasafeGuestFeatureLockInstalled = true;
        ['click', 'submit', 'change', 'input', 'keydown', 'focusin'].forEach(type => {
            document.addEventListener(type, handleGuestEvent, true);
        });

        window.addEventListener('hashchange', syncGuestFeatureLock);
        window.addEventListener('storage', syncGuestFeatureLock);
        wrapNavigation();
        syncGuestFeatureLock();
    }

    window.syncGuestFeatureLock = syncGuestFeatureLock;
    window.installGuestFeatureLock = installGuestFeatureLock;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installGuestFeatureLock);
    } else {
        installGuestFeatureLock();
    }
})();
