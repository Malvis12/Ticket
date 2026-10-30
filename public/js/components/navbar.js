import { store } from '../store.js';
import { openAuthModal } from './modals.js';
import { showToast } from './toast.js';

/**
 * Sticky Luxury Editorial Navbar
 * Dynamically reacts to Store.user and Store.profile:
 * - Logged out: "Sign In" and "Create Account" buttons
 * - Logged in (Attendee): "My Tickets (X)", Profile, and "Become an Organizer"
 * - Logged in (Organizer): "My Tickets", "Organizer Studio", "+ Host Event", and "Sign Out"
 */
export function renderNavbar() {
  const state = store.getState();
  const currentRoute = state.currentRoute;
  const user = state.user;
  const profile = state.profile;
  const isSuperadmin = profile?.role === 'SUPERADMIN';
  const isOrganizer = Boolean(profile?.is_organizer || profile?.organizer_status === 'APPROVED' || isSuperadmin);
  const myTickets = store.getMyTickets();
  const totalTickets = myTickets.length;

  // Initials for avatar
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'G';

  return `
    <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070709]/90 border-b border-[#D4AF37]/20 transition-all duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <!-- Brand Insignia -->
        <a href="#/" class="flex items-center gap-3.5 group">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-105">
            <div class="w-full h-full bg-[#070709] rounded-full flex items-center justify-center">
              <span class="font-editorial text-xl font-bold tracking-wider text-[#F3E5AB]">TFS</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="font-editorial text-lg sm:text-xl font-semibold tracking-wide text-[#F5F2EB] group-hover:text-[#F3E5AB] transition-colors leading-tight">
              The Fashion Social
            </span>
            <span class="text-[10px] tracking-[0.25em] text-[#D4AF37] font-semibold uppercase font-mono">
              Events & Culture
            </span>
          </div>
        </a>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 bg-[#141419]/80 border border-white/5 rounded-full p-1.5 backdrop-blur-md">
          <a href="#/" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
            currentRoute === '#/' || currentRoute === ''
              ? 'bg-[#D4AF37] text-[#070709] shadow-md'
              : 'text-[#9CA3AF] hover:text-[#F5F2EB] hover:bg-white/5'
          }">
            Featured
          </a>
          <a href="#/explore" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
            currentRoute.startsWith('#/explore')
              ? 'bg-[#D4AF37] text-[#070709] shadow-md'
              : 'text-[#9CA3AF] hover:text-[#F5F2EB] hover:bg-white/5'
          }">
            Explore Events
          </a>
          <a href="#/event/the-fashion-social" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
            currentRoute.includes('the-fashion-social')
              ? 'bg-[#D4AF37] text-[#070709] shadow-md'
              : 'text-[#9CA3AF] hover:text-[#F5F2EB] hover:bg-white/5'
          }">
            Benin Gala
          </a>
          ${isOrganizer ? `
            <a href="#/studio" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
              currentRoute.startsWith('#/studio')
                ? 'bg-[#D4AF37] text-[#070709] shadow-md'
                : 'text-[#9CA3AF] hover:text-[#F5F2EB] hover:bg-white/5'
            }">
              Studio
            </a>
            <a href="#/create-event" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
              currentRoute === '#/create-event'
                ? 'bg-[#D4AF37] text-[#070709] shadow-md'
                : 'text-[#9CA3AF] hover:text-[#F5F2EB] hover:bg-white/5'
            }">
              + Host Event
            </a>
          ` : ''}
          ${isSuperadmin ? `
            <a href="#/admin" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
              currentRoute.startsWith('#/admin')
                ? 'bg-amber-400 text-[#070709] shadow-md font-bold'
                : 'text-amber-300 hover:text-white hover:bg-amber-500/10'
            }">
              Master Admin
            </a>
          ` : ''}
        </nav>

        <!-- Right Quick Actions: Authenticated vs Guest -->
        <div class="flex items-center gap-3">
          
          ${user ? `
            <!-- Authenticated Actions -->
            ${isOrganizer ? `
              <!-- Gate Scanner Direct Access Button -->
              <a href="#/scan/e1000000-0000-0000-0000-000000000001" title="Gate QR Verification Scanner" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400 text-xs font-mono font-medium transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Scanner</span>
              </a>
            ` : `
              <!-- Become an Organizer Button -->
              <a href="#/profile?tab=organizer" class="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#070709] text-xs font-mono font-bold transition-all">
                <span>Become an Organizer</span>
              </a>
            `}

            <!-- Unified Profile / Avatar Button -->
            <a href="#/profile" class="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#141419] hover:border-[#D4AF37] transition-all group">
              <div class="w-7 h-7 rounded-full bg-[#1A150B] border border-[#D4AF37]/50 flex items-center justify-center text-xs font-bold text-[#F3E5AB]">
                ${initials}
              </div>
              <div class="hidden sm:flex flex-col text-left">
                <span class="text-xs font-medium text-[#F5F2EB] group-hover:text-[#F3E5AB] leading-tight truncate max-w-[120px]">
                  ${profile?.full_name || 'My Account'}
                </span>
                <span class="text-[9px] uppercase tracking-wider text-emerald-400 font-mono">
                  ${isSuperadmin ? '👑 Superadmin' : isOrganizer ? '🎟️ Organizer' : '👤 Attendee'}
                </span>
              </div>
              ${totalTickets > 0 ? `
                <span class="w-5 h-5 rounded-full bg-[#D4AF37] text-[#070709] text-[10px] font-bold flex items-center justify-center shadow-sm">
                  ${totalTickets}
                </span>
              ` : ''}
            </a>

            <!-- Sign Out Icon Button -->
            <button id="signout-nav-btn" title="Sign Out" class="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          ` : `
            <!-- Logged Out Actions -->
            <button id="signin-nav-btn" class="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all">
              Sign In
            </button>
            <button id="signup-nav-btn" class="gold-gradient-bg px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#070709] uppercase tracking-wider hover:opacity-95 transition-all shadow-md">
              Create Account
            </button>
          `}

          <!-- Mobile Hamburger Toggle -->
          <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-[#F5F2EB] hover:bg-white/5 border border-white/10">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div id="mobile-menu" class="hidden md:hidden border-t border-[#D4AF37]/20 bg-[#070709] px-4 py-4 space-y-2">
        <a href="#/" class="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5F2EB] hover:bg-white/5">Featured Showcase</a>
        <a href="#/explore" class="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5F2EB] hover:bg-white/5">Explore All Events</a>
        <a href="#/event/the-fashion-social" class="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5F2EB] hover:bg-white/5">Benin Flagship Gala</a>
        
        ${user ? `
          <a href="#/profile" class="block px-3 py-2 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-white/5">
            My Tickets (${totalTickets}) & Profile
          </a>
          ${isOrganizer ? `
            <a href="#/create-event" class="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5F2EB] hover:bg-white/5">+ Host an Event</a>
            <a href="#/scan/e1000000-0000-0000-0000-000000000001" class="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-white/5">Gate Scanner Terminal</a>
          ` : `
            <a href="#/profile?tab=organizer" class="block px-3 py-2 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-white/5">Become an Organizer</a>
          `}
          <button id="mobile-signout-btn" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-white/5">
            Sign Out
          </button>
        ` : `
          <button id="mobile-signin-btn" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#F5F2EB] hover:bg-white/5">
            Sign In
          </button>
          <button id="mobile-signup-btn" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#D4AF37] hover:bg-white/5 font-bold">
            Create Account
          </button>
        `}
      </div>
    </header>
  `;
}

export function attachNavbarEvents() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.onclick = () => menu.classList.toggle('hidden');
  }

  // Auth Button triggers
  document.getElementById('signin-nav-btn')?.addEventListener('click', () => {
    openAuthModal({ defaultTab: 'signin' });
  });

  document.getElementById('signup-nav-btn')?.addEventListener('click', () => {
    openAuthModal({ defaultTab: 'signup' });
  });

  document.getElementById('mobile-signin-btn')?.addEventListener('click', () => {
    menu?.classList.add('hidden');
    openAuthModal({ defaultTab: 'signin' });
  });

  document.getElementById('mobile-signup-btn')?.addEventListener('click', () => {
    menu?.classList.add('hidden');
    openAuthModal({ defaultTab: 'signup' });
  });

  // Sign out triggers
  const handleSignOut = async () => {
    await store.signOut();
    showToast('Signed out of account successfully.', 'info');
    window.location.hash = '#/';
  };

  document.getElementById('signout-nav-btn')?.addEventListener('click', handleSignOut);
  document.getElementById('mobile-signout-btn')?.addEventListener('click', handleSignOut);
}
