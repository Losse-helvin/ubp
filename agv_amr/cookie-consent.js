/* Ubepro — consentement aux cookies et synchronisation Google Consent Mode v2 */
(() => {
  'use strict';

  const COOKIE_NAME = 'user_cookie_preferences';
  // Conservation du choix pendant six mois ; le visiteur peut le modifier depuis le pied de page.
  const COOKIE_EXPIRATION_DAYS = 180;
  const TRACKING_STORAGE_KEY = 'ubepro_tracking_v1';
  const TRACKING_PAGE_KEY = 'ubepro_tracking_page_url_v1';
  const MARKETING_TRACKING_KEYS = new Set(['gclid', 'msclkid', 'fbclid']);
  const DEFAULT_PREFERENCES = Object.freeze({
    essential: true,
    analytics: true,
    marketing: true
  });

  function normalizePreferences(value) {
    return {
      essential: true,
      analytics: value?.analytics === true,
      marketing: value?.marketing === true
    };
  }

  function getBrowserCookie(name) {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const item = part.trim();
      if (item.startsWith(prefix)) {
        const value = item.slice(prefix.length);
        try {
          return decodeURIComponent(value);
        } catch (_) {
          return value;
        }
      }
    }
    return null;
  }

  function deleteBrowserCookie(name) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  }

  function readStoredPreferences() {
    const stored = getBrowserCookie(COOKIE_NAME);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new TypeError('Format de préférences invalide');
      }
      return normalizePreferences(parsed);
    } catch (_) {
      deleteBrowserCookie(COOKIE_NAME);
      return null;
    }
  }

  function setBrowserCookie(name, value, days) {
    const maxAge = Math.max(0, Math.floor(days * 24 * 60 * 60));
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; Expires=${expires}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  }

  function consentModeUpdate(_preferences) {
    // GTM reste actif avant, sans ou avec consentement
    const update = {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted'
    };
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', update);
    } else {
      window.dataLayer.push(['consent', 'update', update]);
    }
  }

  function pruneOptionalTrackingStorage(_preferences) {
    // Le tracking URL (UTM, LTM, gclid, msclkid, fbclid, page_url) est conservé
    // en permanence dans sessionStorage, avant, sans ou avec consentement.
  }

  function applyPreferencesToUI(preferences, elements) {
    if (elements.analyticsToggle) {
      elements.analyticsToggle.checked = preferences.analytics;
    }
    if (elements.marketingToggle) {
      elements.marketingToggle.checked = preferences.marketing;
    }
    if (elements.essentialToggle) {
      elements.essentialToggle.checked = true;
      elements.essentialToggle.disabled = true;
    }
  }

  function init() {
    const cookieBanner = document.getElementById('content-cookie');
    const cookieModal = document.getElementById('content-cookie-modal');
    const modalPanel = cookieModal?.querySelector('.cookie-modal__panel');

    const elements = {
      acceptAllBannerBtn: document.getElementById('accept-all-banner-btn'),
      managePreferencesBannerBtn: document.getElementById('manage-preferences-banner-btn'),
      continueWithoutAcceptingBtn: document.getElementById('continue-without-accepting-btn'),
      savePreferencesModalBtn: document.getElementById('save-preferences-modal-btn'),
      acceptAllModalBtn: document.getElementById('accept-all-modal-btn'),
      refuseAllModalBtn: document.getElementById('refuse-all-modal-btn'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      openPreferencesBtn: document.getElementById('open-cookie-preferences-btn'),
      analyticsToggle: document.getElementById('analytics-toggle'),
      marketingToggle: document.getElementById('marketing-toggle'),
      essentialToggle: document.getElementById('essentials-toggle')
    };

    let returnFocusTo = null;

    function hideBannerAndModal() {
      if (cookieBanner) cookieBanner.hidden = true;
      if (cookieModal) cookieModal.hidden = true;
      document.body.classList.remove('cookie-modal-open');
    }

    function showBanner() {
      if (cookieBanner) cookieBanner.hidden = false;
    }

    function showModal(opener) {
      if (!cookieModal) return;
      returnFocusTo = opener || document.activeElement;
      applyPreferencesToUI(readStoredPreferences() || DEFAULT_PREFERENCES, elements);
      if (cookieBanner) cookieBanner.hidden = true;
      cookieModal.hidden = false;
      document.body.classList.add('cookie-modal-open');
      modalPanel?.focus({ preventScroll: true });
    }

    function closeModal() {
      if (!cookieModal) return;
      cookieModal.hidden = true;
      document.body.classList.remove('cookie-modal-open');

      if (!readStoredPreferences()) {
        showBanner();
        elements.managePreferencesBannerBtn?.focus({ preventScroll: true });
      } else if (returnFocusTo?.isConnected) {
        returnFocusTo.focus({ preventScroll: true });
      }
    }

    function savePreferences(value) {
      const preferences = normalizePreferences(value);
      setBrowserCookie(COOKIE_NAME, preferences, COOKIE_EXPIRATION_DAYS);
      window.__UBEPRO_COOKIE_PREFERENCES__ = preferences;
      pruneOptionalTrackingStorage(preferences);

      // Mettre à jour le consentement avant l'événement personnalisé envoyé à GTM.
      consentModeUpdate(preferences);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'cookie_preferences_updated',
        consent_analytics: preferences.analytics,
        consent_marketing: preferences.marketing
      });

      // Notifier l'infrastructure LP (script.js) pour resynchroniser immédiatement le tracking.
      try {
        window.dispatchEvent(new CustomEvent('ubepro:cookie-preferences', { detail: preferences }));
        document.dispatchEvent(new CustomEvent('ubepro:consent-changed', { detail: preferences }));
      } catch (_) {}

      hideBannerAndModal();
    }

    const savedPreferences = readStoredPreferences();
    const currentPreferences = savedPreferences || DEFAULT_PREFERENCES;
    window.__UBEPRO_COOKIE_PREFERENCES__ = currentPreferences;
    applyPreferencesToUI(currentPreferences, elements);
    pruneOptionalTrackingStorage(currentPreferences);

    if (savedPreferences) {
      // Le bootstrap dans le <head> applique déjà le choix avant le chargement de GTM.
      consentModeUpdate(savedPreferences);
      hideBannerAndModal();
    } else {
      consentModeUpdate(DEFAULT_PREFERENCES);
      showBanner();
    }

    const acceptAll = () => savePreferences({
      essential: true,
      analytics: true,
      marketing: true
    });
    const refuseOptional = () => savePreferences({
      essential: true,
      analytics: false,
      marketing: false
    });

    elements.acceptAllBannerBtn?.addEventListener('click', acceptAll);
    elements.acceptAllModalBtn?.addEventListener('click', acceptAll);
    elements.continueWithoutAcceptingBtn?.addEventListener('click', refuseOptional);
    elements.refuseAllModalBtn?.addEventListener('click', refuseOptional);

    elements.managePreferencesBannerBtn?.addEventListener('click', (event) => {
      showModal(event.currentTarget);
    });
    elements.openPreferencesBtn?.addEventListener('click', (event) => {
      showModal(event.currentTarget);
    });
    elements.savePreferencesModalBtn?.addEventListener('click', () => {
      savePreferences({
        essential: true,
        analytics: elements.analyticsToggle?.checked === true,
        marketing: elements.marketingToggle?.checked === true
      });
    });
    elements.modalCloseBtn?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
      if (!cookieModal || cookieModal.hidden) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== 'Tab' || !modalPanel) return;
      const focusable = [...modalPanel.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )].filter((element) => !element.hidden);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
