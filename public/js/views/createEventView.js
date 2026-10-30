import { store } from '../store.js';
import { EDO_INSTITUTIONS } from '../utils/seedData.js';
import { showToast } from '../components/toast.js';

let tierCount = 2;

/**
 * Multi-Tenant Event Creation Studio (TASK-601: #/create-event)
 * Upgraded Features:
 * - Dynamic Ticket Tier Builder: add/remove unlimited custom tiers with perks
 * - Custom Checkout Question configurator: toggle Edo Tertiary Institution Directory or add custom question
 * - Uploads/saves banner and creates event & categories in store / database
 */
export function render() {
  const profile = store.getState().profile || {};
  const isOrganizer = Boolean(profile.is_organizer);

  if (!isOrganizer) {
    return `
      <div class="max-w-2xl mx-auto py-16 text-center space-y-6 view-enter">
        <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div class="space-y-2">
          <h1 class="font-editorial text-3xl font-bold text-white">Organizer Accreditation Required</h1>
          <p class="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            To ensure trust and protect ticket buyers across the marketplace, event hosting is reserved for accredited organizations with verified business credentials and bank settlement accounts.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-[#0F0F13] border border-white/10 text-left space-y-3 max-w-md mx-auto text-xs font-mono">
          <p class="text-[#D4AF37] font-bold uppercase tracking-wider text-[11px]">Accreditation Requirements:</p>
          <div class="space-y-1.5 text-zinc-400">
            <p>✓ Registered Business / Brand Name</p>
            <p>✓ CAC RC / Business Name Number</p>
            <p>✓ Verified Nigerian Commercial Bank Account</p>
            <p>✓ Account Beneficiary Name Verification</p>
          </div>
        </div>

        <div>
          <a href="#/profile?tab=organizer" class="gold-gradient-bg inline-block px-7 py-3.5 rounded-xl font-bold font-mono text-xs uppercase text-[#070709] shadow-xl hover:opacity-95 transition-all">
            Apply for Host Accreditation →
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div class="max-w-4xl mx-auto space-y-8 pb-16 view-enter">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold mb-1">Organizer Studio</p>
          <h1 class="font-editorial text-4xl font-bold text-white">Create & Publish an Event</h1>
          <p class="text-xs sm:text-sm text-zinc-300">
            Publish ticket tiers, customize checkout questions, and sell admission passes with zero friction.
          </p>
        </div>

        <a href="#/profile?tab=organizer" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white">
          ← Back to Studio
        </a>
      </div>

      <!-- Creation Form -->
      <form id="create-event-form" class="card-luxury p-6 sm:p-8 space-y-8">
        
        <!-- Section 1: Overview -->
        <div class="space-y-4">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold border-b border-white/10 pb-2">
            1. Event Overview & Venue
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-title">Event Title *</label>
              <input 
                type="text" 
                id="event-title" 
                required 
                placeholder="e.g. Benin Arts & Runway Gala 2026"
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-category">Category *</label>
              <select id="event-category" class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]">
                <option value="Fashion & Runway">Fashion & Runway</option>
                <option value="Stand-Up Comedy">Stand-Up Comedy</option>
                <option value="Campus & Culture">Campus & Culture</option>
                <option value="Tech & Innovation">Tech & Innovation</option>
                <option value="Concert & Nightlife">Concert & Nightlife</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-city">City & State *</label>
              <input 
                type="text" 
                id="event-city" 
                required 
                value="Benin City, Edo State"
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-venue">Venue Name & Address *</label>
              <input 
                type="text" 
                id="event-venue" 
                required 
                placeholder="e.g. Sir Victor Uwaifo Creative Hub, Airport Rd, GRA"
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-date">Date & Time *</label>
              <input 
                type="datetime-local" 
                id="event-date" 
                required 
                value="2026-12-15T16:00"
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-banner">Banner Image URL *</label>
              <input 
                type="url" 
                id="event-banner" 
                required 
                value="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80"
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="event-desc">Event Description *</label>
              <textarea 
                id="event-desc" 
                rows="3" 
                required
                placeholder="Describe the atmosphere, dress code, VIP offerings..."
                class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >An exclusive high-luxury showcase celebrating art, runway glamour, and culture.</textarea>
            </div>
          </div>
        </div>

        <!-- Section 2: Dynamic Ticket Tiers Builder -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 class="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
              2. Dynamic Ticket Tiers Builder
            </h2>
            <button type="button" id="add-tier-btn" class="px-3 py-1 rounded-lg border border-[#D4AF37]/50 bg-[#1A150B] text-xs font-mono text-[#F3E5AB] hover:border-[#D4AF37] transition-all">
              + Add Another Tier
            </button>
          </div>

          <!-- Dynamic Tiers Container -->
          <div id="tiers-builder-list" class="space-y-4">
            <!-- Tier 1 -->
            <div class="tier-card p-4 rounded-xl bg-[#070709] border border-white/10 space-y-3 relative">
              <div class="flex justify-between items-center text-xs font-mono">
                <span class="text-[#D4AF37] font-bold">Tier #1</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Tier Name *</label>
                  <input type="text" class="tier-input-name w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="Regular Pass" required />
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Price (Naira ₦) *</label>
                  <input type="number" class="tier-input-price w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="5000" min="0" required />
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Capacity Limit *</label>
                  <input type="number" class="tier-input-cap w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="1000" min="1" required />
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Perks (Comma Separated)</label>
                <input type="text" class="tier-input-perks w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="Runway Access, Digital Pass, Red Carpet" />
              </div>
            </div>

            <!-- Tier 2 -->
            <div class="tier-card p-4 rounded-xl bg-[#070709] border border-white/10 space-y-3 relative">
              <div class="flex justify-between items-center text-xs font-mono">
                <span class="text-[#D4AF37] font-bold">Tier #2</span>
                <button type="button" class="remove-tier-btn text-rose-400 hover:text-rose-300 text-xs">Remove</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Tier Name *</label>
                  <input type="text" class="tier-input-name w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="VIP Gold Pass" required />
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Price (Naira ₦) *</label>
                  <input type="number" class="tier-input-price w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="25000" min="0" required />
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Capacity Limit *</label>
                  <input type="number" class="tier-input-cap w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="300" min="1" required />
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1">Perks (Comma Separated)</label>
                <input type="text" class="tier-input-perks w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="Front Row Seating, Champagne Welcome, VIP Lounge" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Event Timing & Ticket Hold Settings -->
        <div class="space-y-4">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold border-b border-white/10 pb-2">
            3. Organizer Controls & Checkout Timing
          </h2>

          <div class="p-4 rounded-xl bg-[#070709] border border-white/10 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-[11px] font-mono text-zinc-400 mb-1" for="event-hold-minutes">Checkout Hold Duration *</label>
                <select id="event-hold-minutes" class="w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37]">
                  <option value="5">5 Minutes</option>
                  <option value="10" selected>10 Minutes (Recommended)</option>
                  <option value="15">15 Minutes</option>
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                </select>
                <p class="text-[10px] text-zinc-500 mt-1">Temporary hold duration while attendee completes payment.</p>
              </div>

              <div class="flex items-center pt-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="event-show-countdown" class="accent-[#D4AF37]" checked />
                  <span class="text-xs text-white font-mono">Show Live Countdown Timer</span>
                </label>
              </div>

              <div class="flex items-center pt-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="event-show-capacity" class="accent-[#D4AF37]" checked />
                  <span class="text-xs text-white font-mono">Show Remaining Capacity Meter</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-mono text-zinc-400 mb-1" for="event-celebrity-disclaimer">VIP / Special Seating Disclaimer (Optional)</label>
              <input 
                type="text" 
                id="event-celebrity-disclaimer" 
                placeholder="e.g. Seating is in designated VIP zones alongside invited dignitaries." 
                class="w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        <!-- Section 4: Custom Checkout Questions -->
        <div class="space-y-4">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold border-b border-white/10 pb-2">
            4. Attendee Checkout Questions & Compliance
          </h2>

          <div class="p-4 rounded-xl bg-[#070709] border border-white/10 space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="include-institution-question" class="accent-[#D4AF37]" checked />
              <span class="text-xs text-white font-mono font-semibold">
                Capture Edo State Tertiary Institution Representation
              </span>
            </label>
            <p class="text-[11px] text-zinc-400 pl-6 leading-relaxed">
              Provides attendees with a searchable dropdown (*UNIBEN, BIU, AAU, IUO, EDSU, Wellspring, Mudiame*) and a custom "+ Other Institution" field, driving your live Institution Reach analytics.
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          class="gold-gradient-bg w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-[#070709] shadow-xl hover:opacity-95 transition-all"
        >
          Publish Event Live to Marketplace →
        </button>

      </form>

    </div>
  `;
}

export function mount() {
  const container = document.getElementById('tiers-builder-list');
  const addBtn = document.getElementById('add-tier-btn');
  const form = document.getElementById('create-event-form');

  // Add Dynamic Tier
  addBtn?.addEventListener('click', () => {
    tierCount++;
    const tierDiv = document.createElement('div');
    tierDiv.className = 'tier-card p-4 rounded-xl bg-[#070709] border border-white/10 space-y-3 relative';
    tierDiv.innerHTML = `
      <div class="flex justify-between items-center text-xs font-mono">
        <span class="text-[#D4AF37] font-bold">Tier #${tierCount}</span>
        <button type="button" class="remove-tier-btn text-rose-400 hover:text-rose-300 text-xs">Remove</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-[11px] font-mono text-zinc-400 mb-1">Tier Name *</label>
          <input type="text" class="tier-input-name w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" placeholder="e.g. VVIP Table" required />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-zinc-400 mb-1">Price (Naira ₦) *</label>
          <input type="number" class="tier-input-price w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="50000" min="0" required />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-zinc-400 mb-1">Capacity Limit *</label>
          <input type="number" class="tier-input-cap w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" value="100" min="1" required />
        </div>
      </div>
      <div>
        <label class="block text-[11px] font-mono text-zinc-400 mb-1">Perks (Comma Separated)</label>
        <input type="text" class="tier-input-perks w-full bg-[#141419] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" placeholder="e.g. Private Table, Bottle Service, Valet" />
      </div>
    `;

    tierDiv.querySelector('.remove-tier-btn')?.addEventListener('click', () => tierDiv.remove());
    container?.appendChild(tierDiv);
  });

  // Attach existing remove handlers
  document.querySelectorAll('.remove-tier-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      btn.closest('.tier-card')?.remove();
    });
  });

  // Form Submit Handler
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('event-title').value.trim();
    const category = document.getElementById('event-category').value;
    const city = document.getElementById('event-city').value.trim();
    const venue = document.getElementById('event-venue').value.trim();
    const date = document.getElementById('event-date').value;
    const banner = document.getElementById('event-banner').value.trim();
    const description = document.getElementById('event-desc').value.trim();
    const includeInstitution = document.getElementById('include-institution-question')?.checked;

    // Collect Dynamic Tiers
    const tierCards = document.querySelectorAll('.tier-card');
    if (tierCards.length === 0) {
      showToast('Please add at least one ticket tier.', 'error');
      return;
    }

    const eventId = `e_${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `event-${Date.now()}`;

    let totalCap = 0;
    const ticketCategories = [];

    tierCards.forEach((card, idx) => {
      const name = card.querySelector('.tier-input-name').value.trim();
      const priceNgn = parseInt(card.querySelector('.tier-input-price').value, 10) || 0;
      const cap = parseInt(card.querySelector('.tier-input-cap').value, 10) || 100;
      const perksRaw = card.querySelector('.tier-input-perks').value.trim();
      const perks = perksRaw ? perksRaw.split(',').map(p => p.trim()) : ['Event Admission Pass'];

      totalCap += cap;
      ticketCategories.push({
        id: `c_${Date.now()}_${idx + 1}`,
        event_id: eventId,
        name: name,
        code: name.substring(0, 4).toUpperCase(),
        price_kobo: priceNgn * 100, // convert NGN to integer Kobo
        total_inventory: cap,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: `${name} with gate admission pass.`,
        perks: perks,
        disclaimer: null,
        is_active: true
      });
    });

    const customQuestions = [];
    if (includeInstitution) {
      customQuestions.push({
        id: 'institution',
        label: 'Which Tertiary Institution do you represent in Edo State?',
        type: 'select_with_custom',
        required: true,
        options: EDO_INSTITUTIONS
      });
    }

    const holdMinutes = parseInt(document.getElementById('event-hold-minutes')?.value, 10) || 10;
    const showCountdown = document.getElementById('event-show-countdown')?.checked ?? true;
    const showCapacity = document.getElementById('event-show-capacity')?.checked ?? true;
    const celebrityDisclaimer = document.getElementById('event-celebrity-disclaimer')?.value.trim() || null;

    const newEvent = {
      id: eventId,
      slug: slug,
      title: title,
      organizer: store.getState().profile?.brand_name || 'Verified Host',
      organizer_id: store.getState().profile?.id || 'p-user-001',
      category: category,
      city: city.split(',')[0].trim(),
      state: city.includes(',') ? city.split(',')[1].trim() : 'Edo State',
      venue_name: venue,
      address: venue,
      start_time: new Date(date).toISOString(),
      end_time: new Date(new Date(date).getTime() + 6 * 3600 * 1000).toISOString(),
      capacity: totalCap,
      banner_url: banner,
      description: description,
      highlights: [],
      faqs: [],
      status: 'PUBLISHED',
      is_featured: false,
      reservation_hold_minutes: holdMinutes,
      show_countdown: showCountdown,
      show_remaining_capacity: showCapacity,
      celebrity_disclaimer_text: celebrityDisclaimer,
      ticket_categories: ticketCategories,
      custom_checkout_questions: customQuestions
    };

    store.addEvent(newEvent);
    showToast(`Event "${title}" published live with ${ticketCategories.length} ticket tiers!`, 'success');
    window.location.hash = `#/event/${slug}`;
  });

  return () => {};
}
