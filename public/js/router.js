import { store } from './store.js';
import { renderNavbar, attachNavbarEvents } from './components/navbar.js';
import { openPolicyModal } from './components/modals.js';

// Import all view modules (pure functional Vanilla ES6+ modules)
import * as homeView from './views/homeView.js';
import * as exploreView from './views/exploreView.js';
import * as eventDetailView from './views/eventDetailView.js';
import * as checkoutView from './views/checkoutView.js';
import * as ticketView from './views/ticketView.js';
import * as profileView from './views/profileView.js';
import * as createEventView from './views/createEventView.js';
import * as studioView from './views/studioView.js';
import * as adminView from './views/adminView.js';
import * as scannerView from './views/scannerView.js';

let activeUnmountFn = null;

/**
 * Route Mapping Table
 */
const ROUTES = [
  { pattern: /^#\/?$/, view: homeView },
  { pattern: /^#\/explore\/?$/, view: exploreView },
  { pattern: /^#\/event\/([a-zA-Z0-9_-]+)\/?$/, view: eventDetailView, paramNames: ['slug'] },
  { pattern: /^#\/checkout\/([a-zA-Z0-9_-]+)\/?$/, view: checkoutView, paramNames: ['eventId'] },
  { pattern: /^#\/ticket\/([a-zA-Z0-9_-]+)\/?$/, view: ticketView, paramNames: ['orderRef'] },
  { pattern: /^#\/profile\/?$/, view: profileView },
  { pattern: /^#\/create-event\/?$/, view: createEventView },
  { pattern: /^#\/studio(?:\/([a-zA-Z0-9_-]+))?\/?$/, view: studioView, paramNames: ['eventId'] },
  { pattern: /^#\/admin(?:\/([a-zA-Z0-9_-]+))?\/?$/, view: adminView, paramNames: ['eventId'] },
  { pattern: /^#\/scan\/([a-zA-Z0-9_-]+)\/?$/, view: scannerView, paramNames: ['eventId'] }
];

/**
 * Match current window.location.hash against routes
 */
function resolveRoute(hash) {
  const cleanHash = (hash || '#/').split('?')[0];

  for (const route of ROUTES) {
    const match = cleanHash.match(route.pattern);
    if (match) {
      const params = {};
      if (route.paramNames) {
        route.paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1];
        });
      }
      return { view: route.view, params };
    }
  }

  // Fallback to Home View
  return { view: homeView, params: {} };
}

/**
 * Perform surgical DOM view transition
 */
function handleRouteChange() {
  const hash = window.location.hash || '#/';
  store.setState({ currentRoute: hash });

  // 1. Call active unmount cleanup hook (e.g. stop WebRTC camera or clear intervals)
  if (typeof activeUnmountFn === 'function') {
    try {
      activeUnmountFn();
    } catch (e) {
      console.warn('Error during view unmount:', e);
    }
    activeUnmountFn = null;
  }

  // 2. Render Sticky Navbar
  const navRoot = document.getElementById('nav-root');
  if (navRoot) {
    navRoot.innerHTML = renderNavbar();
    attachNavbarEvents();
  }

  // 3. Resolve matched view
  const { view, params } = resolveRoute(hash);
  const appRoot = document.getElementById('app');

  if (appRoot && view) {
    // Surgical re-render
    appRoot.innerHTML = view.render(params);
    appRoot.className = 'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 view-enter';

    // Call mount hook
    if (typeof view.mount === 'function') {
      try {
        activeUnmountFn = view.mount(params);
      } catch (e) {
        console.error('Error during view mount:', e);
      }
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

// Attach event listeners
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', () => {
  handleRouteChange();

  // Attach footer compliance modal listeners
  document.getElementById('footer-btn-privacy')?.addEventListener('click', () => openPolicyModal('privacy'));
  document.getElementById('footer-btn-terms')?.addEventListener('click', () => openPolicyModal('terms'));
  document.getElementById('footer-btn-refund')?.addEventListener('click', () => openPolicyModal('refund'));
  document.getElementById('footer-btn-faq')?.addEventListener('click', () => openPolicyModal('faq'));
});

// Subscribe to store updates for role view toggles
store.subscribe(() => {
  const navRoot = document.getElementById('nav-root');
  if (navRoot) {
    navRoot.innerHTML = renderNavbar();
    attachNavbarEvents();
  }
});
