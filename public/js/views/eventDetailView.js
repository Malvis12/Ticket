import { store } from '../store.js';
import { formatKobo, formatDate, getCountdownParts } from '../utils/formatters.js';

let eventDetailTimer = null;

/**
 * Event Detail View (#/event/:slug)
 * Features:
 * - Dynamic capacity calculation from active ticket categories
 * - Real-time countdown timer to organizer's configured start_time
 * - Zero hardcoded stats or developer jargon
 */
export function render(params) {
  const slug = params?.slug || 'the-fashion-social';
  const event = store.getEventBySlug(slug);

  if (!event) {
    return `
      <div class="py-24 text-center">
        <h2 class="font-editorial text-3xl font-bold text-white mb-4">Event Not Located</h2>
        <a href="#/explore" class="text-xs font-mono text-[#D4AF37] hover:underline">← Return to Directory</a>
      </div>
    `;
  }

  const categories = (event.ticket_categories || []).filter(c => c.is_active !== false);
  const totalCapacity = categories.reduce((sum, c) => sum + (c.total_inventory || 0), 0) || event.capacity || 0;
  const showRemaining = event.show_remaining_capacity !== false;
  const showCountdown = event.show_countdown !== false && event.start_time;

  return `
    <div class="space-y-12 pb-16 view-enter">
      
      <!-- Back Breadcrumb -->
      <div>
        <a href="#/explore" class="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#D4AF37] transition-colors">
          <span>← Back to All Events</span>
        </a>
      </div>

      <!-- Hero Header -->
      <section class="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#0F0F13]">
        <div class="h-64 sm:h-96 w-full relative">
          <img src="${event.banner_url}" alt="${event.title}" class="w-full h-full object-cover opacity-35 filter brightness-75" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/60 to-transparent"></div>
          
          <div class="absolute bottom-6 left-6 right-6 max-w-4xl">
            <span class="px-3 py-1 rounded-full bg-[#1A150B] border border-[#D4AF37]/50 text-xs font-mono text-[#F3E5AB] uppercase tracking-wider mb-3 inline-block">
              ${event.city}, ${event.state}
            </span>
            <h1 class="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">
              ${event.title}
            </h1>
            <p class="text-xs sm:text-sm font-mono text-[#D4AF37]">
              Presented by ${event.organizer}
            </p>
          </div>
        </div>
      </section>

      <!-- Live Event Countdown (if enabled by organizer) -->
      ${showCountdown ? `
        <div class="p-6 rounded-2xl bg-[#0F0F13] border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="text-xs font-mono uppercase text-[#D4AF37] font-bold tracking-widest block">Opening Soon</span>
            <p class="font-editorial text-xl font-bold text-white">Live Event Countdown</p>
          </div>
          <div class="flex items-center gap-3 font-mono text-center">
            <div class="bg-[#141419] px-3.5 py-2 rounded-xl border border-white/5 min-w-[60px]">
              <span id="detail-cd-days" class="text-2xl font-bold text-white block">--</span>
              <span class="text-[9px] uppercase text-zinc-400">Days</span>
            </div>
            <div class="bg-[#141419] px-3.5 py-2 rounded-xl border border-white/5 min-w-[60px]">
              <span id="detail-cd-hours" class="text-2xl font-bold text-white block">--</span>
              <span class="text-[9px] uppercase text-zinc-400">Hours</span>
            </div>
            <div class="bg-[#141419] px-3.5 py-2 rounded-xl border border-white/5 min-w-[60px]">
              <span id="detail-cd-minutes" class="text-2xl font-bold text-white block">--</span>
              <span class="text-[9px] uppercase text-zinc-400">Mins</span>
            </div>
            <div class="bg-[#141419] px-3.5 py-2 rounded-xl border border-white/5 min-w-[60px]">
              <span id="detail-cd-seconds" class="text-2xl font-bold text-[#F3E5AB] block">--</span>
              <span class="text-[9px] uppercase text-zinc-400">Secs</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Event Vitals Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card-luxury p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#1A150B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] uppercase font-mono text-zinc-400">Schedule</p>
            <p class="text-sm font-bold text-white">${formatDate(event.start_time)}</p>
          </div>
        </div>

        <div class="card-luxury p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#1A150B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] uppercase font-mono text-zinc-400">Venue</p>
            <p class="text-sm font-bold text-white">${event.venue_name}</p>
            <p class="text-[11px] text-zinc-400 truncate max-w-[200px]">${event.address}</p>
          </div>
        </div>

        <div class="card-luxury p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#1A150B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] uppercase font-mono text-zinc-400">Admission Status</p>
            <p class="text-sm font-bold text-emerald-400">Admission Passes Active</p>
            ${showRemaining && totalCapacity > 0 ? `
              <p class="text-[11px] text-zinc-400">${totalCapacity} Total Capacity</p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Description & Highlights -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="card-luxury p-8">
            <h2 class="font-editorial text-2xl font-bold text-white mb-4">About The Experience</h2>
            <p class="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-sans">
              ${event.description}
            </p>
          </div>

          ${(event.highlights || []).length > 0 ? `
            <div class="card-luxury p-8">
              <h2 class="font-editorial text-2xl font-bold text-white mb-4">Event Highlights</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${event.highlights.map(h => `
                  <div class="p-4 rounded-xl bg-[#070709] border border-white/5">
                    <p class="text-sm font-bold text-[#F3E5AB] mb-1">${h.title}</p>
                    <p class="text-xs text-zinc-400 leading-relaxed">${h.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="space-y-6">
          <div class="card-gold-accent p-6 text-center">
            <p class="text-xs uppercase tracking-widest font-mono text-[#D4AF37] font-bold mb-2">Gate Admission</p>
            <p class="font-editorial text-3xl font-bold text-white mb-4">Secure Passes</p>
            <p class="text-xs text-zinc-300 mb-6">
              Instant digital pass issuance. Guaranteed unique admission at the gate.
            </p>
            <a href="#tiers-container" class="gold-gradient-bg block w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#070709] shadow-lg">
              View Ticket Tiers ↓
            </a>
          </div>
        </div>
      </section>

      <!-- Ticket Tiers List -->
      <section id="tiers-container" class="space-y-6 pt-6 border-t border-white/10">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-mono font-bold mb-1">Pass Tiers</p>
          <h2 class="font-editorial text-3xl font-bold text-white">Choose Your Experience</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${categories.map(cat => {
            const available = cat.total_inventory - (cat.sold_inventory + cat.reserved_inventory);
            const isSoldOut = available <= 0;
            const isSpecialTier = cat.price_kobo >= 4500000;

            return `
              <div class="p-6 rounded-2xl ${isSpecialTier ? 'card-gold-accent' : 'card-luxury'} flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-[#F3E5AB]">
                      ${cat.code || 'PASS'}
                    </span>
                    ${showRemaining ? `
                      <span class="text-xs font-mono ${available < 20 ? 'text-amber-400' : 'text-emerald-400'}">
                        ${available} passes left
                      </span>
                    ` : ''}
                  </div>

                  <h3 class="font-editorial text-2xl font-bold text-white mb-1">${cat.name}</h3>
                  <p class="text-2xl font-bold font-mono ${isSpecialTier ? 'text-[#F3E5AB]' : 'text-white'} mb-3">
                    ${formatKobo(cat.price_kobo)}
                  </p>
                  <p class="text-xs text-zinc-300 leading-relaxed mb-4">${cat.description}</p>

                  <div class="space-y-1.5 mb-4 border-t border-white/10 pt-3">
                    ${(cat.perks || []).map(p => `
                      <p class="text-xs text-zinc-400 flex items-center gap-2">
                        <span class="text-[#D4AF37]">✓</span> ${p}
                      </p>
                    `).join('')}
                  </div>

                  ${cat.disclaimer ? `
                    <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 mb-4">
                      ${cat.disclaimer}
                    </div>
                  ` : ''}
                </div>

                <button 
                  data-event-id="${event.id}"
                  data-category-id="${cat.id}"
                  ${isSoldOut ? 'disabled' : ''}
                  class="select-tier-btn w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    isSoldOut 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : isSpecialTier 
                        ? 'gold-gradient-bg text-[#070709] hover:opacity-90' 
                        : 'bg-white/10 text-white hover:bg-[#D4AF37] hover:text-[#070709]'
                  }">
                  ${isSoldOut ? 'Sold Out' : 'Proceed to Checkout →'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </section>

    </div>
  `;
}

export function mount(params) {
  const slug = params?.slug || 'the-fashion-social';
  const event = store.getEventBySlug(slug);

  if (event && event.show_countdown !== false && event.start_time) {
    function updateDetailCountdown() {
      const parts = getCountdownParts(event.start_time);
      if (!parts) return;

      const dEl = document.getElementById('detail-cd-days');
      const hEl = document.getElementById('detail-cd-hours');
      const mEl = document.getElementById('detail-cd-minutes');
      const sEl = document.getElementById('detail-cd-seconds');

      if (dEl) dEl.innerText = String(parts.days).padStart(2, '0');
      if (hEl) hEl.innerText = String(parts.hours).padStart(2, '0');
      if (mEl) mEl.innerText = String(parts.minutes).padStart(2, '0');
      if (sEl) sEl.innerText = String(parts.seconds).padStart(2, '0');
    }

    updateDetailCountdown();
    if (eventDetailTimer) clearInterval(eventDetailTimer);
    eventDetailTimer = setInterval(updateDetailCountdown, 1000);
  }

  const buttons = document.querySelectorAll('.select-tier-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const eventId = btn.getAttribute('data-event-id');
      const categoryId = btn.getAttribute('data-category-id');
      
      const holdDuration = (event.reservation_hold_minutes || 10) * 60 * 1000;
      store.setState({
        cart: {
          ...store.getState().cart,
          eventId,
          categoryId,
          quantity: 1,
          holdExpiresAt: Date.now() + holdDuration
        }
      });

      window.location.hash = `#/checkout/${eventId}`;
    });
  });

  return () => {
    if (eventDetailTimer) clearInterval(eventDetailTimer);
  };
}
