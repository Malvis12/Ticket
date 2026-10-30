import { store } from '../store.js';
import { formatKobo, formatDate, getCountdownParts } from '../utils/formatters.js';

let countdownTimerInterval = null;

/**
 * Flagship Showcase & Marketplace Home View
 * Features:
 * - Dynamic capacity calculated from active categories
 * - Real-time countdown timer ticking to event.start_time
 * - Zero hardcoded stats or developer jargon
 */
export function render() {
  const state = store.getState();
  const flagship = state.events.find(e => e.slug === 'the-fashion-social') || state.events[0];
  const categories = (flagship.ticket_categories || []).filter(c => c.is_active !== false);

  // Compute live capacity dynamically
  const totalCapacity = categories.reduce((sum, c) => sum + (c.total_inventory || 0), 0) || flagship.capacity || 0;
  const totalSold = categories.reduce((sum, c) => sum + (c.sold_inventory || 0), 0);
  const totalReserved = categories.reduce((sum, c) => sum + (c.reserved_inventory || 0), 0);
  const percentFilled = totalCapacity > 0 ? Math.min(100, Math.round(((totalSold + totalReserved) / totalCapacity) * 100)) : 0;
  const showRemaining = flagship.show_remaining_capacity !== false;
  const showCountdown = flagship.show_countdown !== false && flagship.start_time;

  // Other marketplace events
  const otherEvents = state.events.filter(e => e.id !== flagship.id);

  return `
    <div class="space-y-16 pb-16 view-enter">
      
      <!-- HERO SHOWCASE -->
      <section class="relative rounded-3xl overflow-hidden border border-[#D4AF37]/40 bg-[#0F0F13] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div class="absolute inset-0 z-0">
          <img 
            src="${flagship.banner_url}" 
            alt="${flagship.title}" 
            class="w-full h-full object-cover opacity-25 filter brightness-75 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent"></div>
        </div>

        <div class="relative z-10 p-6 sm:p-12 lg:p-16 max-w-5xl">
          <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#1A150B]/80 backdrop-blur-md mb-6">
            <span class="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <span class="text-xs uppercase font-mono tracking-widest text-[#F3E5AB] font-bold">
              ${flagship.city}, ${flagship.state}
            </span>
          </div>

          <h1 class="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F2EB] leading-[1.05] mb-6">
            ${flagship.title.includes('—') ? flagship.title.split('—')[0] : flagship.title} <br/>
            <span class="gold-gradient-text italic font-normal">
              ${flagship.title.includes('—') ? flagship.title.split('—')[1] : 'Luxury Gathering'}
            </span>
          </h1>

          <p class="text-base sm:text-lg text-zinc-300 max-w-3xl leading-relaxed mb-8 font-sans">
            ${flagship.description}
          </p>

          <!-- Live Event Countdown (Dynamic) -->
          ${showCountdown ? `
            <div class="mb-8 p-4 rounded-2xl bg-[#070709]/80 border border-[#D4AF37]/30 max-w-xl backdrop-blur-md">
              <span class="text-[10px] uppercase font-mono text-[#D4AF37] font-bold tracking-widest block mb-2">
                Countdown to Opening
              </span>
              <div class="grid grid-cols-4 gap-3 text-center" id="hero-countdown-grid">
                <div class="bg-[#141419] p-2.5 rounded-xl border border-white/5">
                  <span id="cd-days" class="text-2xl sm:text-3xl font-mono font-bold text-white block">--</span>
                  <span class="text-[10px] uppercase text-zinc-400 font-mono">Days</span>
                </div>
                <div class="bg-[#141419] p-2.5 rounded-xl border border-white/5">
                  <span id="cd-hours" class="text-2xl sm:text-3xl font-mono font-bold text-white block">--</span>
                  <span class="text-[10px] uppercase text-zinc-400 font-mono">Hours</span>
                </div>
                <div class="bg-[#141419] p-2.5 rounded-xl border border-white/5">
                  <span id="cd-minutes" class="text-2xl sm:text-3xl font-mono font-bold text-white block">--</span>
                  <span class="text-[10px] uppercase text-zinc-400 font-mono">Mins</span>
                </div>
                <div class="bg-[#141419] p-2.5 rounded-xl border border-white/5">
                  <span id="cd-seconds" class="text-2xl sm:text-3xl font-mono font-bold text-[#F3E5AB] block">--</span>
                  <span class="text-[10px] uppercase text-zinc-400 font-mono">Secs</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Key Event Vitals -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#141419]/90 border border-white/5 backdrop-blur-md mb-8 max-w-3xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1A150B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-[10px] uppercase font-mono text-zinc-400">Date & Schedule</p>
                <p class="text-sm font-semibold text-white">${formatDate(flagship.start_time)}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1A150B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p class="text-[10px] uppercase font-mono text-zinc-400">Venue</p>
                <p class="text-sm font-semibold text-white">${flagship.venue_name}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1A150B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p class="text-[10px] uppercase font-mono text-zinc-400">Entry Verification</p>
                <p class="text-sm font-semibold text-white">Digital Pass Required</p>
              </div>
            </div>
          </div>

          <!-- Dynamic Capacity Meter (Only if enabled by organizer) -->
          ${showRemaining && totalCapacity > 0 ? `
            <div class="max-w-xl mb-8">
              <div class="flex justify-between text-xs font-mono mb-2">
                <span class="text-zinc-400">Ticket Availability</span>
                <span class="text-[#F3E5AB] font-bold">${totalSold + totalReserved} of ${totalCapacity} claimed (${percentFilled}%)</span>
              </div>
              <div class="w-full bg-[#1A150B] rounded-full h-2.5 overflow-hidden border border-[#D4AF37]/30 p-[1px]">
                <div class="gold-gradient-bg h-full rounded-full transition-all duration-1000" style="width: ${percentFilled}%"></div>
              </div>
            </div>
          ` : ''}

          <div class="flex flex-wrap items-center gap-4">
            <a href="#/event/${flagship.slug}" class="gold-gradient-bg px-8 py-3.5 rounded-full font-bold text-xs tracking-wider uppercase transition-transform hover:scale-105 shadow-[0_0_25px_rgba(212,175,55,0.4)] text-[#070709]">
              Reserve Passes →
            </a>
            <a href="#/explore" class="px-6 py-3.5 rounded-full border border-white/20 hover:border-white text-xs font-mono font-medium text-white transition-all hover:bg-white/5">
              Browse All Events
            </a>
          </div>
        </div>
      </section>

      <!-- DUAL HIGHLIGHTS -->
      <section class="space-y-6">
        <div class="text-center max-w-2xl mx-auto">
          <p class="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold mb-2">Curated Experience</p>
          <h2 class="font-editorial text-3xl sm:text-4xl font-bold text-white">Two Worlds • One Runway</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="card-luxury p-8 relative overflow-hidden group">
            <div class="w-12 h-12 rounded-2xl bg-[#1A150B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-6">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 class="font-editorial text-2xl font-bold text-white mb-3">High Runway Couture</h3>
            <p class="text-zinc-300 text-sm leading-relaxed mb-4">
              Immerse yourself in collections presented by avant-garde fashion designers, celebrity stylists, and student prodigies from Edo State tertiary institutions.
            </p>
            <ul class="space-y-2 text-xs text-zinc-400 font-mono">
              <li class="flex items-center gap-2"><span class="text-[#D4AF37]">✦</span> Ready-to-Wear Designer Showcases</li>
              <li class="flex items-center gap-2"><span class="text-[#D4AF37]">✦</span> Red Carpet Media Wall Walk</li>
            </ul>
          </div>

          <div class="card-luxury p-8 relative overflow-hidden group">
            <div class="w-12 h-12 rounded-2xl bg-[#1A150B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-6">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-editorial text-2xl font-bold text-white mb-3">Live Stand-Up Comedy</h3>
            <p class="text-zinc-300 text-sm leading-relaxed mb-4">
              Celebrated comedic icons take the stage between runway showcases, delivering unfiltered, high-energy wit that keeps the audience in pure laughter.
            </p>
            <ul class="space-y-2 text-xs text-zinc-400 font-mono">
              <li class="flex items-center gap-2"><span class="text-[#D4AF37]">✦</span> Renowned Headline Comedians</li>
              <li class="flex items-center gap-2"><span class="text-[#D4AF37]">✦</span> Unscripted Celebrity Interactions</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- TICKET TIERS SECTION -->
      <section class="space-y-8" id="tiers-section">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold mb-1">Admission Passes</p>
            <h2 class="font-editorial text-3xl sm:text-4xl font-bold text-white">Select Your Experience Tier</h2>
          </div>
          <span class="text-xs font-mono text-zinc-400">${categories.length} Tiers Available</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${categories.map(cat => {
            const available = cat.total_inventory - (cat.sold_inventory + cat.reserved_inventory);
            const isSoldOut = available <= 0;
            const isSpecialTier = cat.price_kobo >= 4500000;

            return `
              <div class="flex flex-col justify-between p-6 rounded-2xl ${
                isSpecialTier ? 'card-gold-accent' : 'card-luxury'
              } relative group">
                <div>
                  <div class="flex justify-between items-start mb-4">
                    <span class="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300">
                      ${cat.code || 'PASS'}
                    </span>
                    ${showRemaining ? `
                      <span class="text-xs font-mono ${available < 20 ? 'text-amber-400' : 'text-emerald-400'}">
                        ${available} remaining
                      </span>
                    ` : ''}
                  </div>

                  <h3 class="font-editorial text-2xl font-bold text-white mb-2 leading-tight">
                    ${cat.name}
                  </h3>

                  <div class="mb-4">
                    <span class="text-2xl sm:text-3xl font-bold font-mono ${isSpecialTier ? 'text-[#F3E5AB]' : 'text-white'}">
                      ${formatKobo(cat.price_kobo)}
                    </span>
                    <span class="text-xs text-zinc-400 font-mono"> / pass</span>
                  </div>

                  <p class="text-xs text-zinc-300 leading-relaxed mb-4">
                    ${cat.description}
                  </p>

                  <div class="space-y-2 border-t border-white/10 pt-4 mb-4">
                    ${(cat.perks || []).map(p => `
                      <div class="flex items-start gap-2 text-xs text-zinc-300">
                        <span class="text-[#D4AF37] font-bold">✓</span>
                        <span>${p}</span>
                      </div>
                    `).join('')}
                  </div>

                  ${cat.disclaimer ? `
                    <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-snug mb-4">
                      ${cat.disclaimer}
                    </div>
                  ` : ''}
                </div>

                <button 
                  data-event-id="${flagship.id}"
                  data-category-id="${cat.id}"
                  ${isSoldOut ? 'disabled' : ''}
                  class="select-tier-btn w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                    isSoldOut 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : isSpecialTier 
                        ? 'gold-gradient-bg text-[#070709] hover:opacity-90 shadow-lg' 
                        : 'bg-white/10 text-white hover:bg-[#D4AF37] hover:text-[#070709]'
                  }">
                  ${isSoldOut ? 'Sold Out' : 'Select This Tier →'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- MARKETPLACE FEED -->
      ${otherEvents.length > 0 ? `
        <section class="space-y-6 pt-6 border-t border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-mono font-bold">Explore Gatherings</p>
              <h2 class="font-editorial text-2xl sm:text-3xl font-bold text-white">More Hosted Events</h2>
            </div>
            <a href="#/explore" class="text-xs font-mono text-[#D4AF37] hover:underline flex items-center gap-1">
              View All Directory →
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${otherEvents.map(ev => `
              <div class="card-luxury p-6 flex flex-col justify-between group">
                <div>
                  <div class="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                    <span class="px-2.5 py-1 rounded bg-[#1A150B] text-[#D4AF37] border border-[#D4AF37]/30">${ev.city}</span>
                    <span>${formatDate(ev.start_time, false)}</span>
                  </div>
                  <h3 class="font-editorial text-2xl font-bold text-white mb-2 group-hover:text-[#F3E5AB] transition-colors">
                    ${ev.title}
                  </h3>
                  <p class="text-xs text-zinc-400 leading-relaxed mb-4">
                    ${ev.description}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-white/5">
                  <span class="text-xs font-mono text-zinc-400">By ${ev.organizer}</span>
                  <a href="#/event/${ev.slug}" class="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#D4AF37] hover:text-[#070709] text-xs font-semibold uppercase font-mono transition-all">
                    View Event →
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

    </div>
  `;
}

export function mount() {
  const state = store.getState();
  const flagship = state.events.find(e => e.slug === 'the-fashion-social') || state.events[0];

  // Start Real-Time Event Countdown Timer
  if (flagship.show_countdown !== false && flagship.start_time) {
    function updateCountdown() {
      const parts = getCountdownParts(flagship.start_time);
      if (!parts) return;

      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-minutes');
      const sEl = document.getElementById('cd-seconds');

      if (dEl) dEl.innerText = String(parts.days).padStart(2, '0');
      if (hEl) hEl.innerText = String(parts.hours).padStart(2, '0');
      if (mEl) mEl.innerText = String(parts.minutes).padStart(2, '0');
      if (sEl) sEl.innerText = String(parts.seconds).padStart(2, '0');
    }

    updateCountdown();
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
    countdownTimerInterval = setInterval(updateCountdown, 1000);
  }

  // Tier Selection
  const buttons = document.querySelectorAll('.select-tier-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const eventId = btn.getAttribute('data-event-id');
      const categoryId = btn.getAttribute('data-category-id');
      
      const holdDuration = (flagship.reservation_hold_minutes || 10) * 60 * 1000;
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
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
  };
}
