import { store } from '../store.js';
import { formatKobo, formatDate } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';

/**
 * Dedicated Event Organizer Studio (#/studio or #/studio/:eventId)
 * Allows accredited hosts to manage their own events, edit ticket tiers,
 * configure checkout timers & capacity meters, review orders, and launch gate scanner.
 */
export function render(params) {
  const state = store.getState();
  const profile = state.profile;
  const isSuperadmin = profile?.role === 'SUPERADMIN';
  const isApprovedOrganizer = profile?.organizer_status === 'APPROVED' || profile?.is_organizer;

  // Route Guard: Access allowed only for Approved Organizers or Superadmin
  if (!isApprovedOrganizer && !isSuperadmin) {
    return `
      <div class="max-w-2xl mx-auto py-16 text-center space-y-6 view-enter">
        <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="font-editorial text-3xl font-bold text-white">Organizer Accreditation Required</h1>
        <p class="text-xs font-mono text-zinc-400 max-w-md mx-auto leading-relaxed">
          The Organizer Studio is reserved for verified event creators. Please complete your host accreditation profile to unlock ticket management and door scanning.
        </p>
        <div class="flex items-center justify-center gap-4">
          <a href="#/profile?tab=organizer" class="gold-gradient-bg px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#070709] uppercase tracking-wider">
            Submit Host Application →
          </a>
          <a href="#/" class="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono text-zinc-300">
            Return to Marketplace
          </a>
        </div>
      </div>
    `;
  }

  // Find host's events
  const allEvents = state.events || [];
  const hostEvents = isSuperadmin 
    ? allEvents 
    : allEvents.filter(e => e.organizer_id === state.user?.id || e.organizer === profile?.brand_name);
  
  const selectedEventId = params?.eventId || hostEvents[0]?.id || allEvents[0]?.id;
  const event = allEvents.find(e => e.id === selectedEventId) || allEvents[0];

  if (!event) {
    return `
      <div class="py-16 text-center space-y-4">
        <h2 class="font-editorial text-2xl font-bold text-white">No Events Found</h2>
        <a href="#/create-event" class="gold-gradient-bg px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#070709] inline-block">+ Create Your First Event</a>
      </div>
    `;
  }

  // Calculate event-scoped financials
  const eventOrders = (state.orders || []).filter(o => o.event_id === event.id);
  const paidOrders = eventOrders.filter(o => o.status === 'PAID');
  const grossKobo = paidOrders.reduce((sum, o) => sum + (o.total_price_kobo || 0), 0);
  const platformFeeKobo = Math.round(grossKobo * 0.025);
  const netPayoutKobo = grossKobo - platformFeeKobo;
  const ticketsSold = paidOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const categories = event.ticket_categories || [];

  return `
    <div class="space-y-8 pb-16 view-enter">
      
      <!-- Studio Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
              Host Studio
            </span>
            <span class="text-xs text-zinc-400 font-mono">${event.venue_name} • ${event.city}</span>
          </div>
          <h1 class="font-editorial text-3xl font-bold text-white">${event.title}</h1>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Event Selector Dropdown if host has multiple events -->
          ${hostEvents.length > 1 ? `
            <select id="studio-event-selector" class="bg-[#141419] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#D4AF37]">
              ${hostEvents.map(e => `
                <option value="${e.id}" ${e.id === event.id ? 'selected' : ''}>${e.title}</option>
              `).join('')}
            </select>
          ` : ''}

          <a href="#/create-event" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-all">
            + New Event
          </a>

          <a href="#/scan/${event.id}" class="px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Launch Gate Scanner</span>
          </a>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Gross Revenue</span>
          <p class="font-editorial text-2xl font-bold text-white">${formatKobo(grossKobo)}</p>
          <p class="text-[10px] font-mono text-zinc-400">${paidOrders.length} successful transactions</p>
        </div>

        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Net Host Payout</span>
          <p class="font-editorial text-2xl font-bold text-emerald-400">${formatKobo(netPayoutKobo)}</p>
          <p class="text-[10px] font-mono text-zinc-400">After 2.5% platform gateway fee</p>
        </div>

        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Tickets Sold</span>
          <p class="font-editorial text-2xl font-bold text-white">${ticketsSold} <span class="text-sm font-sans text-zinc-400">/ ${event.capacity}</span></p>
          <div class="w-full bg-[#141419] h-1.5 rounded-full overflow-hidden mt-1">
            <div class="bg-[#D4AF37] h-full" style="width: ${Math.min(100, Math.round((ticketsSold / (event.capacity || 1)) * 100))}%"></div>
          </div>
        </div>

        <div class="card-luxury p-5 space-y-1">
          <span class="text-zinc-400 text-[11px] font-mono uppercase tracking-wider">Active Tiers</span>
          <p class="font-editorial text-2xl font-bold text-white">${categories.length} <span class="text-sm font-sans text-zinc-400">Categories</span></p>
          <p class="text-[10px] font-mono text-emerald-400">Inventory lock protected</p>
        </div>
      </div>

      <!-- Section: Event Settings & Checkout Rules -->
      <div class="card-luxury p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 class="font-editorial text-2xl font-bold text-white">Event Checkout Rules & Timing</h2>
            <p class="text-xs font-mono text-zinc-400">Configure reservation hold duration and public visibility meters</p>
          </div>
        </div>

        <form id="studio-event-settings-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="set-hold-minutes">Ticket Hold Duration</label>
              <select id="set-hold-minutes" class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]">
                <option value="5" ${event.reservation_hold_minutes === 5 ? 'selected' : ''}>5 Minutes (High Demand)</option>
                <option value="10" ${!event.reservation_hold_minutes || event.reservation_hold_minutes === 10 ? 'selected' : ''}>10 Minutes (Standard)</option>
                <option value="15" ${event.reservation_hold_minutes === 15 ? 'selected' : ''}>15 Minutes</option>
                <option value="30" ${event.reservation_hold_minutes === 30 ? 'selected' : ''}>30 Minutes</option>
              </select>
              <p class="text-[10px] font-mono text-zinc-400 mt-1">Temporary lock time before unpurchased tickets return to pool.</p>
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="set-fee-mode">Platform Fee Mode</label>
              <select id="set-fee-mode" class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]">
                <option value="PASS_TO_BUYER" ${event.service_fee_mode !== 'ABSORB' ? 'selected' : ''}>Pass 2.5% to Buyer (Recommended)</option>
                <option value="ABSORB" ${event.service_fee_mode === 'ABSORB' ? 'selected' : ''}>Absorb Fee into Ticket Price</option>
              </select>
              <p class="text-[10px] font-mono text-zinc-400 mt-1">Determine who pays the platform gateway transaction fee.</p>
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="set-notification-email">Organizer Notification Email</label>
              <input 
                type="email" 
                id="set-notification-email" 
                value="${event.official_notification_email || state.user?.email || ''}" 
                placeholder="tickets@yourbrand.ng" 
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <p class="text-[10px] font-mono text-zinc-400 mt-1">Receives instant order alerts when tickets are sold.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <label class="flex items-center gap-3 p-3 rounded-xl bg-[#070709] border border-white/5 cursor-pointer">
              <input type="checkbox" id="set-show-countdown" ${event.show_countdown !== false ? 'checked' : ''} class="w-4 h-4 text-[#D4AF37] rounded border-white/20 bg-black" />
              <div>
                <span class="text-xs font-mono text-white block">Display Live Event Countdown</span>
                <span class="text-[10px] font-mono text-zinc-400">Shows countdown clock until event start on public page</span>
              </div>
            </label>

            <label class="flex items-center gap-3 p-3 rounded-xl bg-[#070709] border border-white/5 cursor-pointer">
              <input type="checkbox" id="set-show-capacity" ${event.show_remaining_capacity !== false ? 'checked' : ''} class="w-4 h-4 text-[#D4AF37] rounded border-white/20 bg-black" />
              <div>
                <span class="text-xs font-mono text-white block">Display Remaining Ticket Meter</span>
                <span class="text-[10px] font-mono text-zinc-400">Shows live capacity bar to drive booking urgency</span>
              </div>
            </label>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="gold-gradient-bg px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#070709] uppercase tracking-wider">
              Save Event Rules
            </button>
          </div>
        </form>
      </div>

      <!-- Section: Ticket Tiers & Inventory -->
      <div class="card-luxury p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 class="font-editorial text-2xl font-bold text-white">Ticket Categories & Pricing</h2>
            <p class="text-xs font-mono text-zinc-400">Adjust tier pricing and available seating allotments</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="text-zinc-400 uppercase tracking-wider border-b border-white/10">
                <th class="py-3 px-4">Tier Category</th>
                <th class="py-3 px-4">Price (₦)</th>
                <th class="py-3 px-4">Capacity</th>
                <th class="py-3 px-4">Sold</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${categories.map(cat => `
                <tr class="hover:bg-white/5">
                  <td class="py-3.5 px-4 font-bold text-white">${cat.name}</td>
                  <td class="py-3.5 px-4 text-[#F3E5AB] font-bold">${formatKobo(cat.price_kobo)}</td>
                  <td class="py-3.5 px-4 text-zinc-300">${cat.total_inventory} seats</td>
                  <td class="py-3.5 px-4 text-emerald-400">${cat.sold_inventory || 0} sold</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'} text-[10px]">
                      ${cat.is_active ? 'ON SALE' : 'PAUSED'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section: Recent Orders & Attendees -->
      <div class="card-luxury p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 class="font-editorial text-2xl font-bold text-white">Recent Orders (${paidOrders.length})</h2>
            <p class="text-xs font-mono text-zinc-400">Verified attendee admissions for this event</p>
          </div>
        </div>

        ${paidOrders.length === 0 ? `
          <div class="py-8 text-center text-xs font-mono text-zinc-400">No ticket purchases recorded yet.</div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-zinc-400 uppercase tracking-wider border-b border-white/10">
                  <th class="py-3 px-4">Order Ref</th>
                  <th class="py-3 px-4">Guest</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Qty</th>
                  <th class="py-3 px-4">Total</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4 text-right">Pass</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${paidOrders.map(order => `
                  <tr class="hover:bg-white/5">
                    <td class="py-3.5 px-4 text-[#D4AF37] font-bold">${order.order_ref}</td>
                    <td class="py-3.5 px-4 text-white">${order.customer_name}</td>
                    <td class="py-3.5 px-4 text-zinc-300">${order.tier_name}</td>
                    <td class="py-3.5 px-4 text-zinc-300">${order.quantity}</td>
                    <td class="py-3.5 px-4 text-[#F3E5AB] font-bold">${formatKobo(order.total_price_kobo)}</td>
                    <td class="py-3.5 px-4 text-zinc-400">${formatDate(order.paid_at || order.created_at)}</td>
                    <td class="py-3.5 px-4 text-right">
                      <a href="#/ticket/${order.order_ref}" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#D4AF37]">
                        View Pass →
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;
}

export function mount(params) {
  const form = document.getElementById('studio-event-settings-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const state = store.getState();
      const allEvents = state.events || [];
      const eventId = params?.eventId || allEvents[0]?.id;
      const event = allEvents.find(ev => ev.id === eventId);
      if (!event) return;

      const holdMinutes = parseInt(document.getElementById('set-hold-minutes')?.value || '10', 10);
      const feeMode = document.getElementById('set-fee-mode')?.value || 'PASS_TO_BUYER';
      const notificationEmail = document.getElementById('set-notification-email')?.value?.trim();
      const showCountdown = document.getElementById('set-show-countdown')?.checked ?? true;
      const showCapacity = document.getElementById('set-show-capacity')?.checked ?? true;

      const updated = {
        ...event,
        reservation_hold_minutes: holdMinutes,
        service_fee_mode: feeMode,
        official_notification_email: notificationEmail,
        show_countdown: showCountdown,
        show_remaining_capacity: showCapacity
      };

      const events = allEvents.map(ev => ev.id === event.id ? updated : ev);
      store.setState({ events, activeEvent: updated });
      localStorage.setItem('tfs_events_v2', JSON.stringify(events));
      showToast('Event settings and checkout rules updated successfully!', 'success');
    });
  }

  const selector = document.getElementById('studio-event-selector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      window.location.hash = `#/studio/${e.target.value}`;
    });
  }
}
