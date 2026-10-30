import { store } from '../store.js';
import { formatKobo, formatDate } from '../utils/formatters.js';
import { generateQrSvg } from '../utils/qrGenerator.js';
import { openCustomerEmailModal, openOrganizerEmailModal } from '../components/modals.js';

/**
 * Branded Digital Ticket View (#/ticket/:orderRef)
 * Features:
 * - 100% Dynamic event title, venue, and organizer read from order record
 * - Perforated Obsidian/Gold luxury digital pass
 * - Zero developer/PRD jargon
 */
export function render(params) {
  const orderRef = params?.orderRef || '';
  const order = store.getOrderByRef(orderRef);

  if (!order) {
    return `
      <div class="py-24 text-center">
        <h2 class="font-editorial text-3xl font-bold text-white mb-2">Pass Not Found</h2>
        <p class="text-xs font-mono text-zinc-400 mb-6">Could not locate admission pass for reference ${orderRef}</p>
        <a href="#/" class="text-xs font-mono text-[#D4AF37] hover:underline">← Return to Home</a>
      </div>
    `;
  }

  const event = store.getEventById(order.event_id) || {
    title: 'Event Admission',
    venue_name: 'Main Venue',
    city: 'Benin City',
    state: 'Edo State',
    organizer: 'Event Host'
  };
  const tickets = order.tickets || [];

  return `
    <div class="max-w-3xl mx-auto space-y-8 pb-16 view-enter">
      
      <!-- Top Actions Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Verified Digital Passes
          </span>
          <h1 class="font-editorial text-3xl font-bold text-white">Your Admission Passes</h1>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button id="view-customer-email-btn" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 border border-white/10 transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email Confirmation</span>
          </button>

          <button onclick="window.print()" class="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#070709] font-bold text-xs font-mono transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      <!-- Multi-Ticket Carousel / Tab Switcher (PRD Section 7) -->
      ${tickets.length > 1 ? `
        <div class="flex items-center justify-between bg-[#141419] p-3 rounded-2xl border border-white/10">
          <div class="flex items-center gap-2 overflow-x-auto py-1">
            <span class="text-xs font-mono text-zinc-400 mr-2 whitespace-nowrap">Select Pass:</span>
            ${tickets.map((_, i) => `
              <button 
                class="ticket-carousel-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  i === 0 ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white bg-white/5'
                }" 
                data-ticket-index="${i}"
              >
                Pass #${i + 1}
              </button>
            `).join('')}
          </div>

          <div class="hidden sm:flex items-center gap-1.5 text-xs font-mono">
            <button id="carousel-prev-btn" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30">←</button>
            <span id="carousel-indicator" class="text-zinc-400 px-2">1 / ${tickets.length}</span>
            <button id="carousel-next-btn" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30">→</button>
          </div>
        </div>
      ` : ''}

      <!-- Tickets Passes Container -->
      <div id="tickets-container" class="space-y-8">
        ${tickets.map((ticket, index) => {
          const isUsed = ticket.status === 'USED';
          const isRevoked = ticket.status === 'REVOKED';

          let statusBadge = `
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold tracking-widest uppercase">
              ● VERIFIED & ACTIVE
            </span>
          `;

          if (isUsed) {
            statusBadge = `
              <span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                ● ADMITTED AT GATE (${formatDate(ticket.scanned_at)})
              </span>
            `;
          } else if (isRevoked) {
            statusBadge = `
              <span class="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                ● PASS REVOKED
              </span>
            `;
          }

          return `
            <!-- Luxury Perforated Ticket Card -->
            <div class="ticket-slide ticket-pass rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/50 relative ${index > 0 && tickets.length > 1 ? 'hidden' : ''}" data-slide-index="${index}">
              
              <!-- Top Section -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <span class="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold block mb-1">
                    Pass ${index + 1} of ${order.quantity} • Reference: ${order.order_ref}
                  </span>
                  <h2 class="font-editorial text-2xl sm:text-3xl font-bold text-white">
                    ${event.title}
                  </h2>
                </div>
                <div>
                  ${statusBadge}
                </div>
              </div>

              <!-- Middle Section -->
              <div class="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-mono">
                <div>
                  <span class="text-zinc-400 uppercase tracking-wider block mb-1">Guest Name</span>
                  <p class="text-white text-sm font-bold font-sans">${order.customer_name}</p>
                </div>

                <div>
                  <span class="text-zinc-400 uppercase tracking-wider block mb-1">Tier Category</span>
                  <p class="text-[#F3E5AB] text-sm font-bold">${order.tier_name}</p>
                </div>

                <div>
                  <span class="text-zinc-400 uppercase tracking-wider block mb-1">Institution Represented</span>
                  <p class="text-white text-sm font-bold">${order.institution || 'General Guest'}</p>
                </div>

                <div>
                  <span class="text-zinc-400 uppercase tracking-wider block mb-1">Venue</span>
                  <p class="text-white">${event.venue_name}</p>
                  <p class="text-zinc-400 text-[11px]">${event.city}, ${event.state}</p>
                </div>

                <div>
                  <span class="text-zinc-400 uppercase tracking-wider block mb-1">Date & Time</span>
                  <p class="text-white">${formatDate(event.start_time)}</p>
                </div>

                <div>
                  <span class="text-zinc-400 uppercase tracking-wider block mb-1">Pass Number</span>
                  <p class="text-white font-bold tracking-wider">${ticket.ticket_number}</p>
                </div>
              </div>

              <!-- Notch Divider with dashed perforation line -->
              <div class="ticket-notch-divider my-4"></div>

              <!-- Bottom Section: Vector SVG QR Code -->
              <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div class="flex items-center gap-6">
                  <div class="w-36 h-36 flex-shrink-0">
                    ${generateQrSvg(ticket.qr_token, 144)}
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold block mb-1">
                      Official Entry Pass
                    </span>
                    <p class="text-xs text-zinc-300 max-w-xs mb-2">
                      Present this QR pass at the entrance gate for instant admission. Passes are single-use and verified upon entry.
                    </p>
                  </div>
                </div>

                <div class="flex-shrink-0">
                  <a 
                    href="#/scan/${order.event_id}?token=${encodeURIComponent(ticket.qr_token)}" 
                    class="px-5 py-3 rounded-xl border border-emerald-500/50 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>Check-In Pass →</span>
                  </a>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

export function mount(params) {
  const orderRef = params?.orderRef || '';
  const order = store.getOrderByRef(orderRef);

  if (order) {
    document.getElementById('view-customer-email-btn')?.addEventListener('click', () => {
      openCustomerEmailModal(order);
    });

    // Multi-Ticket Carousel Logic
    const slides = document.querySelectorAll('.ticket-slide');
    const carouselBtns = document.querySelectorAll('.ticket-carousel-btn');
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const indicator = document.getElementById('carousel-indicator');

    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
      if (index < 0 || index >= totalSlides) return;
      currentSlide = index;

      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.remove('hidden');
        } else {
          slide.classList.add('hidden');
        }
      });

      carouselBtns.forEach((btn, idx) => {
        if (idx === currentSlide) {
          btn.className = 'ticket-carousel-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all bg-[#D4AF37] text-[#070709]';
        } else {
          btn.className = 'ticket-carousel-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-zinc-400 hover:text-white bg-white/5';
        }
      });

      if (indicator) {
        indicator.innerText = `${currentSlide + 1} / ${totalSlides}`;
      }

      if (prevBtn) prevBtn.disabled = currentSlide === 0;
      if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    carouselBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-ticket-index'), 10);
        showSlide(idx);
      });
    });

    prevBtn?.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn?.addEventListener('click', () => showSlide(currentSlide + 1));

    if (totalSlides > 1) {
      showSlide(0);
    }
  }

  return () => {};
}
