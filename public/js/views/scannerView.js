import { store } from '../store.js';
import { formatDate } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';

let streamRef = null;

/**
 * Gate QR Scanner Terminal (TASK-603: #/scan/:eventId)
 * Upgraded Features:
 * - HTML5 Camera Scanner Interface with video feed
 * - High-Contrast Staff Outcome Banners:
 *   - Emerald (VALID: Admit Guest)
 *   - Amber (DUPLICATE: Already used at timestamp)
 *   - Crimson (REVOKED / INVALID: Reject Entry)
 * - 4 1-Click QA Simulation Buttons for instantaneous deterministic verification
 */
export function render(params) {
  const eventId = params?.eventId || 'e1000000-0000-0000-0000-000000000001';
  const event = store.getEventById(eventId);

  // Check URL query param for pre-loaded token
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialToken = urlParams.get('token') || '';

  return `
    <div class="max-w-2xl mx-auto space-y-8 pb-16 view-enter">
      
      <!-- Staff Header -->
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Gate 1 Terminal Active
            </span>
          </div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-bold text-white">${event.title}</h1>
        </div>

        <a href="#/admin/${event.id}" class="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-zinc-400 hover:text-white">
          ← Admin Studio
        </a>
      </div>

      <!-- Live Scan Outcome Alert Banner -->
      <div id="scan-outcome-banner" class="hidden rounded-2xl p-6 text-left transition-all duration-300">
        <!-- Injected dynamically on scan -->
      </div>

      <!-- Camera Scanner Interface -->
      <div class="card-luxury p-6 relative overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs uppercase font-mono text-zinc-400 tracking-wider">WebRTC Optical Scanner</span>
          <button id="toggle-camera-btn" class="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300">
            Start Camera Stream
          </button>
        </div>

        <!-- Camera Viewfinder -->
        <div class="relative w-full aspect-video bg-[#070709] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
          <video id="scanner-video" class="w-full h-full object-cover hidden" playsinline></video>
          <div id="camera-placeholder" class="text-center p-6 space-y-2">
            <svg class="w-10 h-10 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-xs font-mono text-zinc-500">Optical sensor in standby mode</p>
          </div>

          <!-- Target Reticle Overlay -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div class="w-48 h-48 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl relative animate-pulse">
              <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]"></div>
              <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]"></div>
              <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]"></div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual Input Fallback Form -->
      <div class="card-luxury p-6 space-y-4">
        <h2 class="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
          Manual Pass / Token Lookup
        </h2>

        <form id="manual-scan-form" class="flex gap-2">
          <input 
            type="text" 
            id="manual-token-input" 
            value="${initialToken}" 
            placeholder="Paste qr_token or ticket_number (e.g. TFS_SIG_... or TFS-2026-VIP-...)"
            class="flex-1 bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <button 
            type="submit" 
            class="gold-gradient-bg px-5 py-2.5 rounded-xl font-bold font-mono text-xs text-[#070709] hover:opacity-90"
          >
            Verify →
          </button>
        </form>
      </div>

      <!-- Gate Staff Quick Test Actions -->
      <div class="p-6 rounded-2xl bg-[#0F0F13] border border-white/10 space-y-4 text-left">
        <p class="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold">
          Gate Staff Test Verification:
        </p>

        <div class="grid grid-cols-2 gap-3 text-xs font-mono">
          <button id="qa-unused" class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 text-left">
            <span class="block font-bold">Test Valid Pass</span>
            <span class="text-[10px] text-zinc-400">Verifies emerald admission approval</span>
          </button>

          <button id="qa-duplicate" class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 text-left">
            <span class="block font-bold">Test Already-Used Pass</span>
            <span class="text-[10px] text-zinc-400">Simulates duplicate entry attempt</span>
          </button>

          <button id="qa-revoked" class="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 hover:bg-rose-900/40 text-left">
            <span class="block font-bold">Test Cancelled Pass</span>
            <span class="text-[10px] text-zinc-400">Verifies rejected ticket warning</span>
          </button>

          <button id="qa-forged" class="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-300 hover:bg-purple-900/40 text-left">
            <span class="block font-bold">Test Unrecognized Code</span>
            <span class="text-[10px] text-zinc-400">Simulates invalid QR code format</span>
          </button>
        </div>
      </div>

    </div>
  `;
}

export function mount(params) {
  const eventId = params?.eventId || 'e1000000-0000-0000-0000-000000000001';
  const banner = document.getElementById('scan-outcome-banner');
  const input = document.getElementById('manual-token-input');
  const form = document.getElementById('manual-scan-form');

  function evaluateScan(token) {
    if (!token) return;

    // Check against store tickets
    const allTickets = store.getAllTickets();
    const match = allTickets.find(t => t.qr_token === token || t.ticket_number === token);

    banner?.classList.remove('hidden');

    if (!match) {
      // 1. FORGED / NOT FOUND (Crimson Rejection)
      banner.className = 'rounded-2xl p-6 bg-rose-950/80 border-2 border-rose-500 text-rose-100 space-y-2';
      banner.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-base">✕</div>
          <div>
            <h3 class="text-base font-bold uppercase tracking-wider">UNKNOWN TICKET FOR THIS EVENT — REJECT ENTRY</h3>
            <p class="text-xs text-rose-200 font-mono">Token: ${token}</p>
          </div>
        </div>
      `;
      showToast('REJECT ENTRY: Unknown or forged ticket code.', 'error');
      return;
    }

    if (match.status === 'VALID') {
      // 2. VALID UNUSED TICKET -> ADMIT GUEST (Emerald Banner)
      store.updateTicketStatus(match.id, 'USED', 'Gate 1 Operator');
      banner.className = 'rounded-2xl p-6 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 space-y-3';
      banner.innerHTML = `
        <div class="flex items-center gap-3 border-b border-emerald-500/30 pb-3">
          <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-[#070709] text-base">✓</div>
          <div>
            <h3 class="text-base font-bold uppercase tracking-wider">VALID UNUSED TICKET — ADMIT GUEST</h3>
            <p class="text-xs text-emerald-300 font-mono">No: ${match.ticket_number}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span class="text-emerald-400">Guest Name:</span>
            <p class="text-white font-bold text-sm">${match.customer_name}</p>
          </div>
          <div>
            <span class="text-emerald-400">Tier Category:</span>
            <p class="text-[#F3E5AB] font-bold text-sm">${match.tier_name}</p>
          </div>
          <div class="col-span-2">
            <span class="text-emerald-400">Tertiary Institution:</span>
            <p class="text-white font-bold">${match.institution || 'General Guest'}</p>
          </div>
        </div>
      `;
      showToast(`Admit Guest: ${match.customer_name} (${match.tier_name})`, 'success');

    } else if (match.status === 'USED') {
      // 3. DUPLICATE SCAN -> REJECT ENTRY (Amber Warning Banner)
      banner.className = 'rounded-2xl p-6 bg-amber-950/90 border-2 border-amber-400 text-amber-100 space-y-3';
      banner.innerHTML = `
        <div class="flex items-center gap-3 border-b border-amber-500/30 pb-3">
          <div class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-[#070709] text-base">!</div>
          <div>
            <h3 class="text-base font-bold uppercase tracking-wider">ALREADY USED TICKET — DO NOT ADMIT</h3>
            <p class="text-xs text-amber-300 font-mono">No: ${match.ticket_number}</p>
          </div>
        </div>
        <div class="text-xs font-mono space-y-1">
          <p><span class="text-amber-400">Previously Admitted At:</span> <strong class="text-white">${formatDate(match.scanned_at || new Date().toISOString())}</strong></p>
          <p><span class="text-amber-400">Gate Operator:</span> ${match.scanned_by || 'Gate 1 Staff'}</p>
          <p><span class="text-amber-400">Original Attendee:</span> ${match.customer_name}</p>
        </div>
      `;
      showToast('DUPLICATE PASS ALERT: Ticket has already entered!', 'warning');

    } else {
      // 4. REFUNDED / REVOKED
      banner.className = 'rounded-2xl p-6 bg-rose-950/90 border-2 border-rose-500 text-rose-100 space-y-2';
      banner.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-base">✕</div>
          <div>
            <h3 class="text-base font-bold uppercase tracking-wider">CANCELLED / REFUNDED PASS — REJECT ENTRY</h3>
            <p class="text-xs text-rose-200 font-mono">This pass was invalidated by the organizer.</p>
          </div>
        </div>
      `;
      showToast('REJECT ENTRY: Ticket has been refunded/revoked.', 'error');
    }
  }

  // Handle form submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    evaluateScan(input?.value.trim());
  });

  // Auto-scan if query token was present
  if (input?.value.trim()) {
    evaluateScan(input.value.trim());
  }

  // QA Scenario Buttons
  document.getElementById('qa-unused')?.addEventListener('click', () => {
    const validTicket = store.getAllTickets().find(t => t.status === 'VALID');
    if (validTicket) {
      input.value = validTicket.qr_token;
      evaluateScan(validTicket.qr_token);
    } else {
      showToast('No unused tickets found in demo state. Resetting one...', 'info');
      store.updateTicketStatus('t1000000-0000-0000-0000-000000000001', 'VALID');
      evaluateScan('TFS_SIG_20261028_VIP_4821_1_VERIFIED');
    }
  });

  document.getElementById('qa-duplicate')?.addEventListener('click', () => {
    store.updateTicketStatus('t1000000-0000-0000-0000-000000000001', 'USED', 'Gate 1 Operator');
    input.value = 'TFS_SIG_20261028_VIP_4821_1_VERIFIED';
    evaluateScan('TFS_SIG_20261028_VIP_4821_1_VERIFIED');
  });

  document.getElementById('qa-revoked')?.addEventListener('click', () => {
    store.updateTicketStatus('t1000000-0000-0000-0000-000000000001', 'REVOKED');
    input.value = 'TFS_SIG_20261028_VIP_4821_1_VERIFIED';
    evaluateScan('TFS_SIG_20261028_VIP_4821_1_VERIFIED');
  });

  document.getElementById('qa-forged')?.addEventListener('click', () => {
    const forgedToken = 'TFS_FORGED_FAKE_TOKEN_9999';
    input.value = forgedToken;
    evaluateScan(forgedToken);
  });

  // Camera toggle button
  const toggleCamBtn = document.getElementById('toggle-camera-btn');
  const videoElem = document.getElementById('scanner-video');
  const camPlaceholder = document.getElementById('camera-placeholder');

  toggleCamBtn?.addEventListener('click', async () => {
    if (streamRef) {
      streamRef.getTracks().forEach(t => t.stop());
      streamRef = null;
      videoElem.classList.add('hidden');
      camPlaceholder.classList.remove('hidden');
      toggleCamBtn.innerText = 'Start Camera Stream';
    } else {
      try {
        streamRef = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoElem.srcObject = streamRef;
        videoElem.play();
        videoElem.classList.remove('hidden');
        camPlaceholder.classList.add('hidden');
        toggleCamBtn.innerText = 'Stop Camera Stream';
        showToast('Camera active. Center QR code in reticle.', 'info');
      } catch (err) {
        showToast('Camera permission denied or camera unavailable.', 'warning');
      }
    }
  });

  return () => {
    if (streamRef) {
      streamRef.getTracks().forEach(t => t.stop());
      streamRef = null;
    }
  };
}
