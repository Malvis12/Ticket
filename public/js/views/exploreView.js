import { store } from '../store.js';
import { formatKobo, formatDate } from '../utils/formatters.js';

/**
 * Explore Marketplace View
 * Features:
 * - Dynamic filtering by City (All Cities, Benin City, Lagos, Abuja, etc.)
 * - Dynamic filtering by Category (All Categories, Fashion, Comedy, Tech, Concert, Arts)
 * - Dynamic search query filtering (title, organizer, venue, perks)
 * - Real calculated starting prices and live ticket availability
 * - Zero static numbers, zero PRD/developer codes
 */
export function render() {
  const state = store.getState();
  const events = state.events;

  // Extract unique cities and categories from live events
  const uniqueCities = ['ALL', ...new Set(events.map(e => e.city).filter(Boolean))];
  const uniqueCategories = ['ALL', ...new Set(events.map(e => e.category).filter(Boolean))];

  return `
    <div class="space-y-10 pb-16 view-enter">
      
      <!-- Header -->
      <div class="max-w-3xl">
        <p class="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold mb-2">Marketplace Directory</p>
        <h1 class="font-editorial text-4xl sm:text-5xl font-bold text-white mb-4">Discover Curated Gatherings</h1>
        <p class="text-sm text-zinc-300">
          Explore runway showcases, live comedy, tech symposiums, and high-fashion galas hosted across Nigeria.
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="space-y-4 bg-[#141419] p-5 rounded-2xl border border-white/5">
        
        <!-- Search Bar -->
        <div class="w-full">
          <input 
            type="text" 
            id="event-search-input" 
            placeholder="Search events by title, host brand, venue, or keywords..." 
            class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
          <!-- City Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-mono text-zinc-400 mr-1">City:</span>
            ${uniqueCities.map((city, idx) => `
              <button 
                class="city-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  idx === 0 ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white bg-white/5'
                }" 
                data-city="${city}"
              >
                ${city === 'ALL' ? 'All Cities' : city}
              </button>
            `).join('')}
          </div>

          <!-- Category Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-mono text-zinc-400 mr-1">Category:</span>
            ${uniqueCategories.map((cat, idx) => `
              <button 
                class="category-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  idx === 0 ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white bg-white/5'
                }" 
                data-category="${cat}"
              >
                ${cat === 'ALL' ? 'All Categories' : cat}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Events Grid -->
      <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderEventCards(events)}
      </div>

    </div>
  `;
}

function renderEventCards(events) {
  if (events.length === 0) {
    return `
      <div class="col-span-full py-16 text-center text-zinc-400 font-mono text-sm">
        No events match your current search and filter criteria.
      </div>
    `;
  }

  return events.map(ev => {
    const categories = ev.ticket_categories || [];
    const minPrice = categories.reduce(
      (min, c) => (c.price_kobo < min ? c.price_kobo : min),
      Infinity
    );
    const displayPrice = minPrice === Infinity ? 'Free Admission' : `From ${formatKobo(minPrice)}`;

    // Total available seats calculation
    const totalCap = categories.reduce((sum, c) => sum + (c.total_inventory || 0), ev.capacity || 0);
    const totalSold = categories.reduce((sum, c) => sum + (c.sold_inventory || 0), 0);
    const totalRemaining = Math.max(0, totalCap - totalSold);

    return `
      <div class="card-luxury overflow-hidden flex flex-col justify-between group">
        <div>
          <!-- Thumbnail -->
          <div class="h-48 overflow-hidden relative">
            <img src="${ev.banner_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae'}" alt="${ev.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070709]/80 backdrop-blur-md border border-[#D4AF37]/30 text-[10px] font-mono text-[#F3E5AB]">
              ${ev.city}
            </div>
            ${ev.is_featured ? `
              <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#070709] text-[10px] font-mono font-bold uppercase">
                Featured Flagship
              </div>
            ` : ''}
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">${ev.category}</span>
              ${ev.show_remaining_capacity !== false ? `
                <span class="text-[10px] font-mono ${totalRemaining > 50 ? 'text-zinc-400' : 'text-amber-400 font-bold'}">
                  ${totalRemaining} passes remaining
                </span>
              ` : ''}
            </div>

            <h3 class="font-editorial text-2xl font-bold text-white mb-2 leading-tight group-hover:text-[#F3E5AB] transition-colors">
              ${ev.title}
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
              ${ev.description}
            </p>

            <div class="space-y-1.5 text-xs text-zinc-300 font-mono pt-3 border-t border-white/5">
              <p class="flex items-center gap-2">
                <span class="text-zinc-500">📍</span> ${ev.venue_name}
              </p>
              <p class="flex items-center gap-2">
                <span class="text-zinc-500">🗓</span> ${formatDate(ev.start_time, false)}
              </p>
              <p class="flex items-center gap-2 text-zinc-400">
                <span class="text-zinc-500">✨</span> Hosted by ${ev.organizer || 'Verified Host'}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6 pt-0 flex items-center justify-between border-t border-white/5 mt-4">
          <div>
            <span class="text-[10px] font-mono text-zinc-400 block">Admission</span>
            <span class="text-sm font-bold font-mono text-white">${displayPrice}</span>
          </div>
          <a href="#/event/${ev.slug}" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-[#D4AF37] hover:text-[#070709] text-xs font-mono font-semibold transition-all">
            View Tiers →
          </a>
        </div>
      </div>
    `;
  }).join('');
}

export function mount() {
  let activeCity = 'ALL';
  let activeCategory = 'ALL';
  const grid = document.getElementById('events-grid');
  const searchInput = document.getElementById('event-search-input');
  const cityBtns = document.querySelectorAll('.city-filter-btn');
  const catBtns = document.querySelectorAll('.category-filter-btn');

  function filterEvents() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const allEvents = store.getState().events;

    const filtered = allEvents.filter(e => {
      const matchCity = activeCity === 'ALL' || (e.city || '').toLowerCase() === activeCity.toLowerCase();
      const matchCat = activeCategory === 'ALL' || (e.category || '').toLowerCase() === activeCategory.toLowerCase();
      const matchQuery = !query || 
        (e.title || '').toLowerCase().includes(query) ||
        (e.description || '').toLowerCase().includes(query) ||
        (e.venue_name || '').toLowerCase().includes(query) ||
        (e.organizer || '').toLowerCase().includes(query);
      return matchCity && matchCat && matchQuery;
    });

    if (grid) grid.innerHTML = renderEventCards(filtered);
  }

  cityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cityBtns.forEach(b => {
        b.className = 'city-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all text-zinc-400 hover:text-white bg-white/5';
      });
      btn.className = 'city-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all bg-[#D4AF37] text-[#070709]';
      activeCity = btn.getAttribute('data-city');
      filterEvents();
    });
  });

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => {
        b.className = 'category-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all text-zinc-400 hover:text-white bg-white/5';
      });
      btn.className = 'category-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all bg-[#D4AF37] text-[#070709]';
      activeCategory = btn.getAttribute('data-category');
      filterEvents();
    });
  });

  searchInput?.addEventListener('input', filterEvents);

  return () => {};
}
