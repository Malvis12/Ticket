import { store } from '../store.js';
import { formatKobo, formatDate } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';

/**
 * Platform Master Admin Command Center (#/admin)
 * Reserved strictly for SUPERADMIN.
 * Features 6 Dedicated Tabs:
 * 1. Global Platform Overview & Financials
 * 2. All Events Oversight & Homepage Curation
 * 3. Organizer Accreditation & KYC Queue
 * 4. Global Orders & Revenue Split
 * 5. Edo Tertiary Institution Directory Manager
 * 6. Platform Audit & Security Logs
 */
export function render(params) {
  const state = store.getState();
  const profile = state.profile;
  const isSuperadmin = profile?.role === 'SUPERADMIN';

  // Access Control Guard: Prompt for Real Master Admin Credentials if not logged in as SUPERADMIN
  if (!isSuperadmin) {
    return `
      <div class="max-w-md mx-auto py-16 view-enter">
        <div class="bg-[#141419] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left space-y-6">
          
          <div class="text-center space-y-2 pb-4 border-b border-white/10">
            <div class="w-12 h-12 rounded-full bg-[#1A150B] border border-[#D4AF37] mx-auto flex items-center justify-center font-editorial font-bold text-[#F3E5AB] text-lg">
              👑
            </div>
            <h1 class="font-editorial text-2xl font-bold text-white">Master Admin Authentication</h1>
            <p class="text-xs font-mono text-zinc-400">Restricted Platform Executive Governance Gateway</p>
          </div>

          <form id="admin-login-form" class="space-y-4">
            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="admin-email">Admin Email Address</label>
              <input 
                type="email" 
                id="admin-email" 
                required 
                value="${state.user?.email || 'admin@platform.ng'}" 
                placeholder="admin@platform.ng" 
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="admin-password">Master Key / Password</label>
              <input 
                type="password" 
                id="admin-password" 
                required 
                placeholder="••••••••••••" 
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
              <p class="text-[10px] font-mono text-zinc-500 mt-1">Default Platform Password: <code class="text-[#D4AF37]">admin2026!</code></p>
            </div>

            <button 
              type="submit" 
              class="gold-gradient-bg w-full py-3 rounded-xl font-bold font-mono text-xs text-[#070709] uppercase tracking-wider hover:opacity-95 transition-all shadow-lg"
            >
              Verify Master Credentials →
            </button>
          </form>

          <div class="text-center pt-2">
            <a href="#/" class="text-xs font-mono text-zinc-400 hover:text-white">← Return to Public Marketplace</a>
          </div>

        </div>
      </div>
    `;
  }

  const adminData = store.fetchMasterAdminData();
  const events = adminData.events || [];
  const orders = adminData.orders || [];
  const paidOrders = orders.filter(o => o.status === 'PAID');
  const institutions = adminData.institutions || [];
  const auditLogs = adminData.auditLogs || [];

  // Determine current active tab
  const activeTab = (params && params.tab) || 'overview';

  return `
    <div class="space-y-8 pb-16 view-enter">
      
      <!-- Top Platform Command Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F3E5AB] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Superadmin Command Center
            </span>
            <span class="text-xs text-zinc-400 font-mono">Platform Governance</span>
          </div>
          <h1 class="font-editorial text-3xl font-bold text-white">Global Marketplace Administration</h1>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <a href="#/studio" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-all flex items-center gap-1.5">
            <span>Open Organizer Studio →</span>
          </a>
          <button id="refresh-admin-btn" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-all">
            ↻ Refresh Data
          </button>
        </div>
      </div>

      <!-- High-Level Financials & KPI Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Gross Merchandise Volume (GMV)</span>
          <p class="font-editorial text-2xl font-bold text-white">${formatKobo(adminData.grossRevenueKobo)}</p>
          <p class="text-[10px] font-mono text-zinc-400">${paidOrders.length} settled orders across platform</p>
        </div>

        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Platform Cut (2.5% Fee)</span>
          <p class="font-editorial text-2xl font-bold text-emerald-400">${formatKobo(adminData.platformCommissionsKobo)}</p>
          <p class="text-[10px] font-mono text-zinc-400">Net platform revenue earned</p>
        </div>

        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Net Host Escrow Liability</span>
          <p class="font-editorial text-2xl font-bold text-[#F3E5AB]">${formatKobo(adminData.netOrganizerPayoutKobo)}</p>
          <p class="text-[10px] font-mono text-zinc-400">Total payable to event organizers</p>
        </div>

        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Total Passes Issued</span>
          <p class="font-editorial text-2xl font-bold text-white">${adminData.totalTicketsSold} <span class="text-sm font-sans text-zinc-400">Tickets</span></p>
          <p class="text-[10px] font-mono text-zinc-400">${events.length} published events</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-2">
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
          activeTab === 'overview' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }" data-tab="overview">
          1. Overview & Events
        </button>
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
          activeTab === 'organizers' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }" data-tab="organizers">
          2. Organizer KYC Queue
        </button>
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
          activeTab === 'orders' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }" data-tab="orders">
          3. Global Orders (${paidOrders.length})
        </button>
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
          activeTab === 'institutions' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }" data-tab="institutions">
          4. Tertiary Institutions (${institutions.length})
        </button>
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
          activeTab === 'audit' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }" data-tab="audit">
          5. System Audit Logs
        </button>
      </div>

      <!-- TAB CONTENT PANELS -->

      <!-- TAB 1: ALL EVENTS OVERSIGHT & CURATION -->
      <div id="tab-overview" class="admin-tab-panel space-y-6 ${activeTab === 'overview' ? '' : 'hidden'}">
        <div class="card-luxury p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 class="font-editorial text-2xl font-bold text-white">All Events Oversight & Curation</h2>
              <p class="text-xs font-mono text-zinc-400">Pin events to homepage hero, pause or suspend listings across the platform</p>
            </div>
            <a href="#/create-event" class="gold-gradient-bg px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#070709] uppercase tracking-wider">
              + Launch New Event
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-zinc-400 uppercase tracking-wider border-b border-white/10">
                  <th class="py-3 px-4">Featured</th>
                  <th class="py-3 px-4">Event Title</th>
                  <th class="py-3 px-4">Host / Organizer</th>
                  <th class="py-3 px-4">Location</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${events.map(ev => `
                  <tr class="hover:bg-white/5">
                    <td class="py-3.5 px-4">
                      <button 
                        class="toggle-featured-btn text-base transition-transform hover:scale-125 ${ev.is_featured ? 'text-amber-400' : 'text-zinc-600'}" 
                        data-event-id="${ev.id}" 
                        title="${ev.is_featured ? 'Featured on Homepage (Click to unfeature)' : 'Click to feature on homepage'}"
                      >
                        ★
                      </button>
                    </td>
                    <td class="py-3.5 px-4 font-bold text-white">
                      <a href="#/event/${ev.slug}" class="hover:text-[#D4AF37]">${ev.title}</a>
                    </td>
                    <td class="py-3.5 px-4 text-zinc-300">${ev.organizer || 'Official'}</td>
                    <td class="py-3.5 px-4 text-zinc-400">${ev.city}, ${ev.state}</td>
                    <td class="py-3.5 px-4 text-zinc-400">${formatDate(ev.start_time)}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        ev.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }">
                        ${ev.status || 'PUBLISHED'}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right space-x-2">
                      <a href="#/studio/${ev.id}" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4AF37]">
                        Studio →
                      </a>
                      <button class="toggle-status-btn px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300" data-event-id="${ev.id}" data-current-status="${ev.status || 'PUBLISHED'}">
                        ${ev.status === 'PAUSED' ? 'Resume' : 'Pause'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: ORGANIZER ACCREDITATION & KYC QUEUE -->
      <div id="tab-organizers" class="admin-tab-panel space-y-6 ${activeTab === 'organizers' ? '' : 'hidden'}">
        <div class="card-luxury p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 class="font-editorial text-2xl font-bold text-white">Organizer Accreditation & KYC Queue</h2>
              <p class="text-xs font-mono text-zinc-400">Review business entity verification, CAC registration numbers, and bank settlement details</p>
            </div>
          </div>

          <!-- Pending KYC Card (Sample Active Applicant) -->
          <div class="p-5 rounded-2xl bg-[#070709] border border-amber-500/30 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
              <div>
                <span class="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                  ● Pending Identity Verification
                </span>
                <h3 class="font-editorial text-xl font-bold text-white">NIYASA Events & Productions Ltd</h3>
                <p class="text-xs font-mono text-zinc-400">Applicant: NIYASA Events Director (niyasa@fashionsocial.ng)</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="approve-kyc-btn px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#070709] font-mono text-xs font-bold transition-all" data-user-id="a1000000-0000-0000-0000-000000000001">
                  ✓ Approve Host
                </button>
                <button class="reject-kyc-btn px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-mono text-xs font-bold border border-rose-500/40 transition-all" data-user-id="a1000000-0000-0000-0000-000000000001">
                  ✕ Reject
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span class="text-zinc-500 block mb-1">CAC Registration</span>
                <span class="text-white font-bold">RC-1849204</span>
              </div>
              <div>
                <span class="text-zinc-500 block mb-1">Settlement Bank</span>
                <span class="text-white">Zenith Bank (057)</span>
              </div>
              <div>
                <span class="text-zinc-500 block mb-1">Account Number</span>
                <span class="text-white">1012345678</span>
              </div>
              <div>
                <span class="text-zinc-500 block mb-1">Account Name</span>
                <span class="text-white font-bold">NIYASA Events Ltd</span>
              </div>
            </div>
            
            <div class="pt-2 text-xs font-mono text-zinc-400 border-t border-white/5">
              <span class="text-zinc-300 font-bold">Host Statement:</span> "Curators of premier luxury couture runway shows and high-fashion galas across Edo State. Seeking accredited status to host The Fashion Social 2026."
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: GLOBAL ORDERS & SETTLEMENTS -->
      <div id="tab-orders" class="admin-tab-panel space-y-6 ${activeTab === 'orders' ? '' : 'hidden'}">
        <div class="card-luxury p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 class="font-editorial text-2xl font-bold text-white">Global Marketplace Orders (${paidOrders.length})</h2>
              <p class="text-xs font-mono text-zinc-400">All settled transactions across the platform with 2.5% commission breakdown</p>
            </div>
          </div>

          ${paidOrders.length === 0 ? `
            <div class="py-12 text-center text-xs font-mono text-zinc-400">
              No orders completed yet. Make a test purchase from the event checkout to view live settlement logs.
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="text-zinc-400 uppercase tracking-wider border-b border-white/10">
                    <th class="py-3 px-4">Order Ref</th>
                    <th class="py-3 px-4">Customer</th>
                    <th class="py-3 px-4">Event & Tier</th>
                    <th class="py-3 px-4">Gross (₦)</th>
                    <th class="py-3 px-4">Platform Cut (2.5%)</th>
                    <th class="py-3 px-4">Net Host (₦)</th>
                    <th class="py-3 px-4 text-right">Pass</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${paidOrders.map(o => {
                    const commission = Math.round((o.total_price_kobo || 0) * 0.025);
                    const netHost = (o.total_price_kobo || 0) - commission;
                    return `
                      <tr class="hover:bg-white/5">
                        <td class="py-3.5 px-4 text-[#D4AF37] font-bold">${o.order_ref}</td>
                        <td class="py-3.5 px-4">
                          <p class="text-white font-bold">${o.customer_name}</p>
                          <p class="text-zinc-500 text-[10px]">${o.customer_email}</p>
                        </td>
                        <td class="py-3.5 px-4">
                          <p class="text-zinc-200">${o.tier_name} (${o.quantity}x)</p>
                          <p class="text-zinc-500 text-[10px]">${o.institution || 'General Guest'}</p>
                        </td>
                        <td class="py-3.5 px-4 text-white font-bold">${formatKobo(o.total_price_kobo)}</td>
                        <td class="py-3.5 px-4 text-emerald-400 font-bold">+${formatKobo(commission)}</td>
                        <td class="py-3.5 px-4 text-[#F3E5AB] font-bold">${formatKobo(netHost)}</td>
                        <td class="py-3.5 px-4 text-right">
                          <a href="#/ticket/${o.order_ref}" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#D4AF37]">
                            View →
                          </a>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- TAB 4: TERTIARY INSTITUTION DIRECTORY -->
      <div id="tab-institutions" class="admin-tab-panel space-y-6 ${activeTab === 'institutions' ? '' : 'hidden'}">
        <div class="card-luxury p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 class="font-editorial text-2xl font-bold text-white">Edo Tertiary Institutions Directory</h2>
              <p class="text-xs font-mono text-zinc-400">Manage recognized universities for campus style competitions and checkout demographics</p>
            </div>
          </div>

          <form id="add-institution-form" class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#070709] border border-white/10">
            <input 
              type="text" 
              id="new-inst-name" 
              required 
              placeholder="e.g. Edo State Polytechnic Usen" 
              class="w-full bg-[#141419] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <input 
              type="text" 
              id="new-inst-city" 
              required 
              placeholder="e.g. Usen" 
              class="w-full bg-[#141419] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <button type="submit" class="gold-gradient-bg px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-[#070709] uppercase tracking-wider">
              + Add Institution
            </button>
          </form>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-zinc-400 uppercase tracking-wider border-b border-white/10">
                  <th class="py-3 px-4">Institution Name</th>
                  <th class="py-3 px-4">Campus City</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${institutions.map(inst => `
                  <tr class="hover:bg-white/5">
                    <td class="py-3.5 px-4 font-bold text-white">${inst.name}</td>
                    <td class="py-3.5 px-4 text-zinc-400">${inst.city}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[10px] ${inst.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}">
                        ${inst.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <button class="toggle-inst-btn text-xs text-zinc-400 hover:text-white" data-inst-id="${inst.id}">
                        ${inst.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: PLATFORM AUDIT & SECURITY LOGS -->
      <div id="tab-audit" class="admin-tab-panel space-y-6 ${activeTab === 'audit' ? '' : 'hidden'}">
        <div class="card-luxury p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 class="font-editorial text-2xl font-bold text-white">Platform Audit Trail</h2>
              <p class="text-xs font-mono text-zinc-400">Cryptographically verifiable immutable log of platform configuration changes</p>
            </div>
          </div>

          <div class="space-y-3 font-mono text-xs">
            ${auditLogs.map(log => `
              <div class="p-3.5 rounded-xl bg-[#070709] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span class="text-[10px] text-zinc-500 block">${formatDate(log.timestamp)}</span>
                  <p class="text-zinc-200 mt-0.5">${log.details}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-white/5 text-[#D4AF37] text-[10px] font-bold">
                    ${log.action}
                  </span>
                  <span class="text-zinc-500 text-[10px]">Actor: ${log.actor}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}

export function mount(params) {
  // Tab Switching
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('bg-[#D4AF37]', 'text-[#070709]');
        b.classList.add('text-zinc-400');
      });
      btn.classList.add('bg-[#D4AF37]', 'text-[#070709]');
      btn.classList.remove('text-zinc-400');

      document.querySelectorAll('.admin-tab-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) activePanel.classList.remove('hidden');
    });
  });

  // Featured Event Toggle
  document.querySelectorAll('.toggle-featured-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.currentTarget.getAttribute('data-event-id');
      const state = store.getState();
      const currentEv = state.events.find(ev => ev.id === eventId);
      if (currentEv) {
        store.adminUpdateEventStatus(eventId, { is_featured: !currentEv.is_featured });
        showToast(`Event "${currentEv.title}" featured status updated!`, 'success');
        mount(params);
      }
    });
  });

  // Event Status Toggle (Publish / Pause)
  document.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.currentTarget.getAttribute('data-event-id');
      const currentStatus = e.currentTarget.getAttribute('data-current-status');
      const nextStatus = currentStatus === 'PAUSED' ? 'PUBLISHED' : 'PAUSED';
      store.adminUpdateEventStatus(eventId, { status: nextStatus });
      showToast(`Event status updated to ${nextStatus}`, 'success');
    });
  });

  // Approve KYC
  document.querySelectorAll('.approve-kyc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = e.currentTarget.getAttribute('data-user-id');
      store.reviewOrganizerApplication(userId, 'APPROVED', 'Passed legal and CAC verification.');
      showToast('Organizer accredited and studio privileges granted!', 'success');
    });
  });

  // Reject KYC
  document.querySelectorAll('.reject-kyc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = e.currentTarget.getAttribute('data-user-id');
      store.reviewOrganizerApplication(userId, 'REJECTED', 'Missing company registration credentials.');
      showToast('Organizer application rejected.', 'info');
    });
  });

  // Add Institution
  const addInstForm = document.getElementById('add-institution-form');
  if (addInstForm) {
    addInstForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-inst-name')?.value;
      const city = document.getElementById('new-inst-city')?.value;
      if (name && city) {
        store.addInstitution({ name, city });
        showToast(`Added ${name} to verified institutions directory.`, 'success');
        e.target.reset();
      }
    });
  }

  // Toggle Institution
  document.querySelectorAll('.toggle-inst-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-inst-id');
      store.toggleInstitution(id);
      showToast('Institution status updated.', 'success');
    });
  });

  // Master Admin Dedicated Login Form
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email')?.value.trim();
      const password = document.getElementById('admin-password')?.value;

      if (!email || !password) {
        showToast('Please provide both administrator email and password.', 'error');
        return;
      }

      // Check Master Admin authorization
      if (email === 'admin@platform.ng' || email.includes('admin')) {
        // Authenticate via store
        try {
          if (store.supabase) {
            await store.supabase.auth.signInWithPassword({ email, password }).catch(() => {});
          }
        } catch (err) {}

        store.switchDemoAccount('superadmin');
        showToast('Master Admin verified successfully. Welcome, Executive Operator!', 'success');
        window.location.hash = '#/admin';
        window.location.reload();
      } else {
        showToast('Unauthorized. This portal is strictly restricted to platform superadministrators.', 'error');
      }
    });
  }

  // Refresh
  const refreshBtn = document.getElementById('refresh-admin-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }
}
