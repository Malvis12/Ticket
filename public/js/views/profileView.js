import { store } from '../store.js';
import { formatKobo, formatDate } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';

/**
 * Unified Single Profile View (TASK-601: #/profile)
 * Upgraded Features:
 * - Dynamic Attendee "My Tickets Wallet" querying user's tickets
 * - Dynamic "Organizer Studio" with Onboarding Card: Brand Name, Bank Code, and NUBAN Account Number
 * - Payout credentials edit & save directly to store / profiles
 */
export function render() {
  const state = store.getState();
  const profile = state.profile || {};
  const user = state.user || {};
  const isOrganizer = Boolean(profile.is_organizer);
  const myTickets = store.getMyTickets();
  const hostedEvents = state.events.filter(e => e.organizer_id === profile.id || e.organizer_id === 'a1000000-0000-0000-0000-000000000001');

  // Check query parameter for initial tab
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialTab = urlParams.get('tab') === 'organizer' || isOrganizer ? 'organizer' : 'wallet';

  return `
    <div class="max-w-5xl mx-auto space-y-8 pb-16 view-enter">
      
      <!-- Profile Header Banner -->
      <div class="card-luxury p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] p-[2px] shadow-xl">
            <div class="w-full h-full bg-[#070709] rounded-2xl flex items-center justify-center text-xl font-bold font-editorial text-[#F3E5AB]">
              ${profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'TF'}
            </div>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="font-editorial text-3xl font-bold text-white">${profile.full_name || 'My Profile'}</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                ${isOrganizer ? 'Organizer Enabled' : 'Attendee Profile'}
              </span>
            </div>
            <p class="text-xs font-mono text-zinc-400 mt-0.5">${user.email || 'guest@thefashionsocial.ng'} • ${profile.phone || '+234...'}</p>
          </div>
        </div>

        <!-- 1-Click Role Switch / Mode Indicator -->
        <div class="bg-[#070709] p-1.5 rounded-xl border border-white/10 flex items-center gap-1">
          <button id="tab-wallet-btn" class="px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
            initialTab === 'wallet' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white'
          }">
            My Tickets (${myTickets.length})
          </button>
          <button id="tab-organizer-btn" class="px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
            initialTab === 'organizer' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white'
          }">
            Organizer Studio
          </button>
        </div>
      </div>

      <!-- TAB 1: MY TICKETS WALLET -->
      <section id="wallet-section" class="space-y-6 ${initialTab === 'wallet' ? '' : 'hidden'}">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="font-editorial text-2xl font-bold text-white">Admission Passes Wallet</h2>
            <p class="text-xs font-mono text-zinc-400">Manage and access all your verified passes across the platform.</p>
          </div>
        </div>

        ${myTickets.length === 0 ? `
          <div class="card-luxury p-12 text-center space-y-4">
            <p class="text-zinc-400 text-sm font-mono">You do not have any admission tickets yet.</p>
            <a href="#/explore" class="gold-gradient-bg inline-block px-6 py-2.5 rounded-xl font-bold text-xs uppercase text-[#070709]">
              Explore Marketplace Events →
            </a>
          </div>
        ` : `
          <div class="space-y-4">
            ${myTickets.map(t => {
              const ev = store.getEventById(t.event_id);
              const isUsed = t.status === 'USED';
              return `
                <div class="card-luxury p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2 py-0.5 rounded bg-[#1A150B] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono font-bold">
                        ${t.order_ref}
                      </span>
                      <span class="px-2 py-0.5 rounded ${isUsed ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'} text-[10px] font-mono font-bold uppercase">
                        ${t.status}
                      </span>
                    </div>
                    <h3 class="font-editorial text-xl font-bold text-white mb-1">${ev ? ev.title : 'Event Admission'}</h3>
                    <p class="text-xs font-mono text-zinc-300">
                      Tier: <span class="text-[#F3E5AB] font-bold">${t.tier_name}</span> • Ticket No: <span class="text-white">${t.ticket_number}</span>
                    </p>
                    <p class="text-xs text-zinc-500 font-mono mt-1">Institution: ${t.institution || 'N/A'}</p>
                  </div>

                  <div class="flex items-center gap-3">
                    <a href="#/ticket/${t.order_ref}" class="gold-gradient-bg px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-[#070709] transition-all">
                      View Digital Pass →
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </section>

      <!-- TAB 2: ORGANIZER STUDIO & PAYOUTS -->
      <section id="organizer-section" class="space-y-8 ${initialTab === 'organizer' ? '' : 'hidden'}">
        
        <!-- Organizer Accreditation & Payout Credentials Card -->
        <div class="card-luxury p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold">Host Verification</span>
                <span class="px-2.5 py-0.5 rounded-full ${isOrganizer ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} text-[10px] font-mono font-bold uppercase">
                  ${isOrganizer ? '● Fully Accredited Host' : '● Verification Required'}
                </span>
              </div>
              <h2 class="font-editorial text-2xl font-bold text-white">Organizer Accreditation & Settlement Profile</h2>
              <p class="text-xs font-mono text-zinc-400">
                To protect ticket buyers, all event organizers must undergo business entity & bank verification prior to publishing ticket tiers.
              </p>
            </div>
          </div>

          <form id="organizer-payout-form" class="space-y-6">
            
            <!-- Section A: Organization Details -->
            <div class="space-y-3">
              <span class="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block">
                1. Organization & Legal Identity
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-brand-name">Brand / Organization Name *</label>
                  <input 
                    type="text" 
                    id="org-brand-name" 
                    required 
                    value="${profile.brand_name || ''}"
                    placeholder="e.g. NIYASA Events & Entertainment Ltd"
                    class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-cac-number">CAC Registration / RC Number *</label>
                  <input 
                    type="text" 
                    id="org-cac-number" 
                    required 
                    value="${profile.cac_number || ''}"
                    placeholder="e.g. RC-1849204 or BN-394821"
                    class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p class="text-[10px] text-zinc-500 mt-1">Verified against the Corporate Affairs Commission registry.</p>
                </div>

                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-contact-email">Official Host Contact Email *</label>
                  <input 
                    type="email" 
                    id="org-contact-email" 
                    required 
                    value="${profile.contact_email || user.email || ''}"
                    placeholder="events@yourbrand.ng"
                    class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-social-handle">Official Website or Instagram Handle</label>
                  <input 
                    type="text" 
                    id="org-social-handle" 
                    value="${profile.social_handle || ''}"
                    placeholder="e.g. @thefashionsocial.ng or https://..."
                    class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            <!-- Section B: Direct Settlement Subaccount -->
            <div class="space-y-3 pt-3 border-t border-white/10">
              <span class="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block">
                2. NUBAN Bank Settlement Details (Paystack Automated Split)
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-bank-name">Nigerian Commercial Bank *</label>
                  <select id="org-bank-name" class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]">
                    <option value="Guaranty Trust Bank" ${profile.bank_name === 'Guaranty Trust Bank' ? 'selected' : ''}>Guaranty Trust Bank (GTB)</option>
                    <option value="Zenith Bank" ${profile.bank_name === 'Zenith Bank' ? 'selected' : ''}>Zenith Bank</option>
                    <option value="Access Bank" ${profile.bank_name === 'Access Bank' ? 'selected' : ''}>Access Bank</option>
                    <option value="First Bank of Nigeria" ${profile.bank_name === 'First Bank of Nigeria' ? 'selected' : ''}>First Bank of Nigeria</option>
                    <option value="United Bank for Africa (UBA)" ${profile.bank_name === 'United Bank for Africa (UBA)' ? 'selected' : ''}>UBA</option>
                    <option value="Stanbic IBTC" ${profile.bank_name === 'Stanbic IBTC' ? 'selected' : ''}>Stanbic IBTC</option>
                    <option value="Fidelity Bank" ${profile.bank_name === 'Fidelity Bank' ? 'selected' : ''}>Fidelity Bank</option>
                    <option value="Kuda Bank" ${profile.bank_name === 'Kuda Bank' ? 'selected' : ''}>Kuda Bank</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-account-number">10-Digit NUBAN Account *</label>
                  <input 
                    type="text" 
                    id="org-account-number" 
                    required 
                    maxlength="10" 
                    value="${profile.account_number || ''}"
                    placeholder="0123456789"
                    class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label class="block text-xs font-mono uppercase text-zinc-400 mb-1" for="org-account-name">Account Name (Beneficiary) *</label>
                  <input 
                    type="text" 
                    id="org-account-name" 
                    required 
                    value="${profile.account_name || ''}"
                    placeholder="Exact name on bank record"
                    class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            <!-- Host Compliance Declaration -->
            <div class="p-4 rounded-xl bg-[#070709] border border-white/10 text-xs text-zinc-300 leading-relaxed font-mono">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" id="org-compliance-agree" required class="mt-0.5 accent-[#D4AF37]" ${isOrganizer ? 'checked' : ''} />
                <span>
                  I certify that all legal entity details and settlement accounts provided belong to this organization. I understand that fraudulent ticketing activities or unfulfilled events will lead to immediate settlement freezing and law enforcement reporting.
                </span>
              </label>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" class="gold-gradient-bg px-7 py-3 rounded-xl font-bold font-mono text-xs uppercase text-[#070709] hover:opacity-95 transition-all shadow-lg">
                ${isOrganizer ? 'Update Verified Host Profile' : 'Submit for Accreditation & Enable Hosting →'}
              </button>
            </div>
          </form>
        </div>

        <!-- Hosted Events Management -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="font-editorial text-2xl font-bold text-white">Your Hosted Events</h2>
              <p class="text-xs font-mono text-zinc-400">Monitor live admissions, scan gate passes, and inspect institutional reach.</p>
            </div>
            <a href="#/create-event" class="gold-gradient-bg px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-[#070709]">
              + Host New Event
            </a>
          </div>

          <div class="space-y-4">
            ${hostedEvents.map(ev => `
              <div class="card-luxury p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                      ${ev.status}
                    </span>
                    <span class="text-xs text-zinc-400 font-mono">${ev.city}, ${ev.state}</span>
                  </div>
                  <h3 class="font-editorial text-xl font-bold text-white">${ev.title}</h3>
                  <p class="text-xs font-mono text-zinc-400 mt-1">
                    Capacity: ${ev.capacity} Guests • Venue: ${ev.venue_name}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <a href="#/admin/${ev.id}" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F3E5AB] border border-[#D4AF37]/30 transition-all">
                    Admin Dashboard →
                  </a>
                  <a href="#/scan/${ev.id}" class="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 text-xs font-mono transition-all">
                    Gate Scanner →
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </section>

    </div>
  `;
}

export function mount() {
  const walletBtn = document.getElementById('tab-wallet-btn');
  const orgBtn = document.getElementById('tab-organizer-btn');
  const walletSec = document.getElementById('wallet-section');
  const orgSec = document.getElementById('organizer-section');

  walletBtn?.addEventListener('click', () => {
    walletBtn.className = 'px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all bg-[#D4AF37] text-[#070709]';
    orgBtn.className = 'px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all text-zinc-400 hover:text-white';
    walletSec?.classList.remove('hidden');
    orgSec?.classList.add('hidden');
  });

  orgBtn?.addEventListener('click', () => {
    orgBtn.className = 'px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all bg-[#D4AF37] text-[#070709]';
    walletBtn.className = 'px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all text-zinc-400 hover:text-white';
    orgSec?.classList.remove('hidden');
    walletSec?.classList.add('hidden');
  });

  // Handle Organizer Payout Form Submit
  const payoutForm = document.getElementById('organizer-payout-form');
  payoutForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const brandName = document.getElementById('org-brand-name').value.trim();
    const cacNumber = document.getElementById('org-cac-number').value.trim();
    const contactEmail = document.getElementById('org-contact-email').value.trim();
    const socialHandle = document.getElementById('org-social-handle').value.trim();
    const bankName = document.getElementById('org-bank-name').value;
    const accountNumber = document.getElementById('org-account-number').value.trim();
    const accountName = document.getElementById('org-account-name').value.trim();

    try {
      await store.upgradeToOrganizer({
        brandName,
        bankName,
        accountNumber,
        accountName,
        cacNumber,
        contactEmail,
        socialHandle
      });
      showToast('Organizer accreditation verified! Event publishing is now unlocked.', 'success');
      mount();
    } catch (err) {
      showToast(err.message || 'Failed to update credentials', 'error');
    }
  });

  return () => {};
}
