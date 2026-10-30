import { formatKobo, formatDate } from '../utils/formatters.js';
import { EDO_INSTITUTIONS } from '../utils/seedData.js';
import { store } from '../store.js';
import { showToast } from './toast.js';

/**
 * Authentication Modal (Sign In & Sign Up)
 * Connects directly to store.signUp() and store.signIn()
 */
export function openAuthModal({ defaultTab = 'signin', onAuthSuccess } = {}) {
  let modal = document.getElementById('auth-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn';

  modal.innerHTML = `
    <div class="bg-[#141419] border border-[#D4AF37]/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-[#1A150B] border border-[#D4AF37] flex items-center justify-center font-editorial font-bold text-[#F3E5AB]">
            TFS
          </div>
          <div>
            <h3 class="text-sm font-bold text-white tracking-wide">The Fashion Social</h3>
            <p class="text-[11px] text-zinc-400 font-mono">Unified Identity Portal</p>
          </div>
        </div>
        <button id="close-auth-modal" class="text-zinc-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="flex bg-[#070709] p-1 rounded-xl border border-white/10 mb-6">
        <button id="auth-tab-signin" class="flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
          defaultTab === 'signin' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white'
        }">
          Sign In
        </button>
        <button id="auth-tab-signup" class="flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
          defaultTab === 'signup' ? 'bg-[#D4AF37] text-[#070709]' : 'text-zinc-400 hover:text-white'
        }">
          Create Account
        </button>
      </div>

      <!-- Sign In Form -->
      <form id="signin-form" class="space-y-4 ${defaultTab === 'signin' ? '' : 'hidden'}">
        <div>
          <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="signin-email">Email Address</label>
          <input 
            type="email" 
            id="signin-email" 
            required 
            placeholder="you@domain.com"
            class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <div>
          <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="signin-password">Password</label>
          <input 
            type="password" 
            id="signin-password" 
            required 
            placeholder="••••••••"
            class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <button 
          type="submit" 
          class="gold-gradient-bg w-full py-3 rounded-xl font-bold font-mono text-xs text-[#070709] uppercase tracking-wider hover:opacity-95 transition-all mt-2"
        >
          Sign In to Account →
        </button>
      </form>

      <!-- Sign Up Form -->
      <form id="signup-form" class="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1 ${defaultTab === 'signup' ? '' : 'hidden'}">
        <div>
          <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="signup-name">Full Name *</label>
          <input 
            type="text" 
            id="signup-name" 
            required 
            placeholder="e.g. Osaze Omoregie"
            class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="signup-email">Email Address *</label>
          <input 
            type="email" 
            id="signup-email" 
            required 
            placeholder="osaze@uniben.edu"
            class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="signup-phone">Phone Number *</label>
            <input 
              type="tel" 
              id="signup-phone" 
              required 
              placeholder="+234..."
              class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-zinc-300 mb-1" for="signup-password">Password *</label>
            <input 
              type="password" 
              id="signup-password" 
              required 
              minlength="6"
              placeholder="••••••••"
              class="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-mono uppercase text-[#F3E5AB] mb-1" for="signup-institution">Default Tertiary Institution</label>
          <select id="signup-institution" class="w-full bg-[#070709] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]">
            ${EDO_INSTITUTIONS.map(inst => `<option value="${inst}">${inst}</option>`).join('')}
            <option value="General Guest">Other / Unlisted Institution</option>
          </select>
        </div>

        <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400">
          <p class="font-medium text-zinc-300 mb-1">Looking to host and sell tickets?</p>
          <p class="text-[11px] leading-relaxed">
            All accounts start as verified attendees. Once registered, apply for Organizer Accreditation in your profile dashboard with your verified business entity and payout bank details.
          </p>
        </div>

        <button 
          type="submit" 
          class="gold-gradient-bg w-full py-3 rounded-xl font-bold font-mono text-xs text-[#070709] uppercase tracking-wider hover:opacity-95 transition-all"
        >
          Create Unified Account →
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const cleanup = () => modal.remove();
  document.getElementById('close-auth-modal').onclick = cleanup;

  // Tab toggling
  const tabSignIn = document.getElementById('auth-tab-signin');
  const tabSignUp = document.getElementById('auth-tab-signup');
  const formSignIn = document.getElementById('signin-form');
  const formSignUp = document.getElementById('signup-form');

  tabSignIn.onclick = () => {
    tabSignIn.className = 'flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all bg-[#D4AF37] text-[#070709]';
    tabSignUp.className = 'flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all text-zinc-400 hover:text-white';
    formSignIn.classList.remove('hidden');
    formSignUp.classList.add('hidden');
  };

  tabSignUp.onclick = () => {
    tabSignUp.className = 'flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all bg-[#D4AF37] text-[#070709]';
    tabSignIn.className = 'flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all text-zinc-400 hover:text-white';
    formSignUp.classList.remove('hidden');
    formSignIn.classList.add('hidden');
  };

  // Sign In Handler
  formSignIn.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    try {
      await store.signIn({ email, password });
      showToast(`Welcome back, ${email}!`, 'success');
      cleanup();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to sign in', 'error');
    }
  };

  // Sign Up Handler
  formSignUp.onsubmit = async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const institution = document.getElementById('signup-institution').value;
    const isOrganizer = false;
    const brandName = null;

    try {
      await store.signUp({
        email,
        password,
        fullName,
        phone,
        institution,
        isOrganizer,
        brandName
      });
      showToast(`Account created for ${fullName}!`, 'success');
      cleanup();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to create account', 'error');
    }
  };
}

/**
 * Paystack Checkout Simulator Modal
 */
export function openPaystackSimulatorModal({ amountKobo, orderRef, onOutcome }) {
  let modal = document.getElementById('paystack-simulator-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'paystack-simulator-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn';
  
  modal.innerHTML = `
    <div class="bg-[#141419] border border-[#D4AF37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
      <!-- Paystack Simulated Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-[#00C3F7]/10 flex items-center justify-center border border-[#00C3F7]/30">
            <span class="text-[#00C3F7] font-black text-xs font-mono">P</span>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white tracking-wide">Paystack Checkout Gateway</h3>
            <p class="text-[11px] text-zinc-400 font-mono">Ref: ${orderRef}</p>
          </div>
        </div>
        <button id="close-sim-btn" class="text-zinc-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="text-center py-4 bg-[#070709] rounded-xl border border-white/5 mb-5">
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-mono">Amount Authorizing</p>
        <p class="text-3xl font-bold text-[#F3E5AB] font-mono mt-1">${formatKobo(amountKobo)}</p>
        <p class="text-[11px] text-[#D4AF37] mt-1">Secured by 256-Bit SSL</p>
      </div>

      <div class="space-y-3 mb-6">
        <p class="text-xs text-zinc-300 font-semibold uppercase tracking-wider">Select Webhook Simulation Outcome:</p>
        
        <!-- Option 1: Verified Success -->
        <button id="sim-success" class="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/30 transition-all text-left group">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full border-2 border-emerald-400 group-hover:bg-emerald-400"></div>
            <div>
              <p class="text-xs font-bold text-emerald-300">Authorize Payment (Instant Confirmation)</p>
              <p class="text-[11px] text-zinc-400">Verifies transaction and generates official admission passes.</p>
            </div>
          </div>
          <span class="text-xs text-emerald-400 font-mono font-semibold">CONFIRM →</span>
        </button>

        <!-- Option 2: Pending Bank Transfer -->
        <button id="sim-pending" class="w-full flex items-center justify-between p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 transition-all text-left group">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full border-2 border-amber-400 group-hover:bg-amber-400"></div>
            <div>
              <p class="text-xs font-bold text-amber-300">Pending Bank Confirmation</p>
              <p class="text-[11px] text-zinc-400">Payment awaiting bank settlement. Tickets held until verified.</p>
            </div>
          </div>
          <span class="text-xs text-amber-400 font-mono font-semibold">HOLD →</span>
        </button>

        <!-- Option 3: Declined / Insufficient Funds -->
        <button id="sim-failed" class="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/30 transition-all text-left group">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full border-2 border-rose-400 group-hover:bg-rose-400"></div>
            <div>
              <p class="text-xs font-bold text-rose-300">Card Declined / Payment Cancelled</p>
              <p class="text-[11px] text-zinc-400">Cancels transaction and releases temporary ticket hold.</p>
            </div>
          </div>
          <span class="text-xs text-rose-400 font-mono font-semibold">CANCEL →</span>
        </button>
      </div>

      <div class="text-[11px] text-zinc-500 text-center font-mono">
        Secured by Paystack • Official Checkout Simulation
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cleanup = () => modal.remove();
  document.getElementById('close-sim-btn').onclick = cleanup;
  
  document.getElementById('sim-success').onclick = () => {
    cleanup();
    onOutcome('SUCCESS');
  };
  document.getElementById('sim-pending').onclick = () => {
    cleanup();
    onOutcome('PENDING');
  };
  document.getElementById('sim-failed').onclick = () => {
    cleanup();
    onOutcome('FAILED');
  };
}

/**
 * Preview Customer Branded Ticket Email
 */
export function openCustomerEmailModal(order) {
  let modal = document.getElementById('email-preview-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'email-preview-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md';
  
  const ticketList = (order.tickets || []).map((t, idx) => `
    <div style="background-color: #141419; border: 1px solid #D4AF37; border-radius: 8px; padding: 16px; margin-bottom: 12px; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(212,175,55,0.4); padding-bottom: 8px; margin-bottom: 8px;">
        <span style="font-family: monospace; color: #D4AF37; font-size: 13px; font-weight: bold;">TICKET #${idx + 1} OF ${order.quantity}</span>
        <span style="background: #10B981; color: #000; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 9999px;">CONFIRMED</span>
      </div>
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #FFFFFF;">${order.tier_name}</p>
      <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 12px; color: #F3E5AB;">No: ${t.ticket_number}</p>
      <p style="margin: 2px 0 0 0; font-family: monospace; font-size: 10px; color: #9CA3AF;">Token: ${t.qr_token}</p>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="bg-[#0B0B0E] border border-[#D4AF37]/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xs bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 px-2.5 py-1 rounded font-mono font-bold">Email Preview</span>
          <h3 class="text-sm font-bold text-white">Attendee Ticket Delivery</h3>
        </div>
        <button id="close-email-btn" class="text-zinc-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Email Simulator Envelope -->
      <div class="bg-[#141419] rounded-xl p-4 mb-4 text-xs font-mono border border-white/5 space-y-1">
        <p><span class="text-zinc-500">From:</span> The Fashion Social &lt;tickets@thefashionsocial.ng&gt;</p>
        <p><span class="text-zinc-500">To:</span> ${order.customer_name} &lt;${order.customer_email}&gt;</p>
        <p><span class="text-zinc-500">Subject:</span> Your Confirmed Admission Passes — The Fashion Social 2026</p>
      </div>

      <!-- Email Body Mockup -->
      <div style="background-color: #070709; border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 24px; color: #F5F2EB; font-family: sans-serif; text-align: center;">
        <h2 style="font-family: Georgia, serif; font-size: 24px; color: #F3E5AB; margin: 0 0 6px 0;">The Fashion Social</h2>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin: 0 0 20px 0;">Official Admission Pass</p>
        
        <p style="text-align: left; font-size: 14px; color: #D1D5DB; line-height: 1.5; margin-bottom: 20px;">
          Dear <strong>${order.customer_name}</strong>,<br><br>
          Your order <strong>${order.order_ref}</strong> has been confirmed. Below are your official single-use digital tickets for <em>The Fashion Social — Style Meets Laughter</em> at Victor Uwaifo Creative Hub, Benin City.
        </p>

        <div style="background: #111116; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: left; font-size: 13px;">
          <p style="margin: 0; color: #9CA3AF;">Tertiary Institution Represented:</p>
          <p style="margin: 4px 0 0 0; color: #FFFFFF; font-weight: bold;">${order.institution || 'General Guest'}</p>
        </div>

        ${ticketList}

        <p style="font-size: 12px; color: #9CA3AF; margin-top: 20px; line-height: 1.4;">
          Present this email or your digital QR pass at the entrance gate. Each ticket can only be scanned once. Doors open at 4:00 PM WAT on November 28, 2026.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('close-email-btn').onclick = () => modal.remove();
}

/**
 * Preview Organizer Sale Notification Email
 */
export function openOrganizerEmailModal(order) {
  let modal = document.getElementById('organizer-email-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'organizer-email-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md';

  modal.innerHTML = `
    <div class="bg-[#0B0B0E] border border-[#D4AF37]/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xs bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 px-2.5 py-1 rounded font-mono font-bold">Email Preview</span>
          <h3 class="text-sm font-bold text-white">Organizer Sale Notification</h3>
        </div>
        <button id="close-org-email-btn" class="text-zinc-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="bg-[#141419] rounded-xl p-4 mb-4 text-xs font-mono border border-white/5 space-y-1">
        <p><span class="text-zinc-500">From:</span> Marketplace System &lt;notifications@thefashionsocial.ng&gt;</p>
        <p><span class="text-zinc-500">To:</span> Event Organizer &lt;organizer@thefashionsocial.ng&gt;</p>
        <p><span class="text-zinc-500">Subject:</span> [Sale Alert] Verified Order — ${order.customer_name} (${order.institution || 'Guest'})</p>
      </div>

      <div class="bg-[#070709] border border-emerald-500/30 rounded-xl p-5 text-sm text-[#F5F2EB] space-y-3 font-sans">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <span class="text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold">Verified Revenue Committed</span>
          <span class="text-xl font-bold font-mono text-[#F3E5AB]">${formatKobo(order.total_price_kobo)}</span>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-zinc-400">Order Reference:</span>
            <p class="font-mono font-bold text-white">${order.order_ref}</p>
          </div>
          <div>
            <span class="text-zinc-400">Category & Quantity:</span>
            <p class="font-bold text-white">${order.quantity}x ${order.tier_name}</p>
          </div>
          <div>
            <span class="text-zinc-400">Buyer:</span>
            <p class="text-white">${order.customer_name}</p>
          </div>
          <div>
            <span class="text-zinc-400">Tertiary Institution:</span>
            <p class="font-bold text-[#D4AF37]">${order.institution || 'N/A'}</p>
          </div>
        </div>

        <p class="text-xs text-zinc-400 pt-3 border-t border-white/5">
          Order verified and processed via Paystack. Admission passes delivered to attendee email.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('close-org-email-btn').onclick = () => modal.remove();
}

/**
 * Compliance & Policy Modal (NDPA Privacy, Terms, Refund, FAQ - PRD Section 4.1 & 6)
 */
export function openPolicyModal(type = 'privacy') {
  let modal = document.getElementById('policy-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'policy-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn';

  let title = 'Privacy Notice (NDPA Compliant)';
  let content = '';

  if (type === 'privacy') {
    title = 'Nigeria Data Protection Act (NDPA) Privacy Policy';
    content = `
      <div class="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
        <p><strong>1. Compliance Authority:</strong> The Fashion Social & Marketplace operates under strict compliance with the Nigeria Data Protection Act (NDPA) 2023.</p>
        <p><strong>2. Information Collected:</strong> We process attendee full name, email address, phone number, and optional tertiary institution representation solely for ticket verification, gate admission, and official transactional notifications.</p>
        <p><strong>3. Zero Third-Party Sale:</strong> Attendee personal data is never sold, traded, or shared with unauthorized commercial third parties.</p>
        <p><strong>4. Payment Security:</strong> Payment credentials (card numbers, PINs, bank accounts) are processed directly by Paystack via 256-bit SSL encryption. No payment keys or raw card credentials touch our database servers.</p>
        <p><strong>5. Data Subject Rights:</strong> Attendees hold the right to request access, rectification, or deletion of their account profile data by contacting privacy@thefashionsocial.ng.</p>
      </div>
    `;
  } else if (type === 'terms') {
    title = 'Marketplace Terms of Service';
    content = `
      <div class="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
        <p><strong>1. Single-Use Passes:</strong> Every ticket pass issued via this marketplace features a unique cryptographic token and can only be scanned and admitted once at the event gate.</p>
        <p><strong>2. Transfer & Resale:</strong> Reselling admission passes above face value is strictly prohibited. Passes remain linked to the purchaser reference unless formally transferred.</p>
        <p><strong>3. Gate Admission:</strong> Organizers and venue staff reserve the right of admission based on security screening and compliance with venue regulations.</p>
        <p><strong>4. Platform Liability:</strong> The platform operates as a multi-tenant ticketing provider connecting attendees with event organizers.</p>
      </div>
    `;
  } else if (type === 'refund') {
    title = 'Refund & Cancellation Policy';
    content = `
      <div class="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
        <p><strong>1. Event Postponement:</strong> If an event is rescheduled, your passes remain 100% valid for the new date announced by the organizer.</p>
        <p><strong>2. Event Cancellation:</strong> In the event of an outright cancellation, ticket holders are entitled to a full refund of the ticket face value processed back to the original funding account.</p>
        <p><strong>3. Buyer Cancellation:</strong> General ticket sales are non-refundable unless explicitly stated otherwise by the individual event organizer.</p>
      </div>
    `;
  } else if (type === 'faq') {
    title = 'Attendee FAQ & Support';
    content = `
      <div class="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
        <p><strong>Q: Where do I access my tickets after payment?</strong><br>A: Your passes are immediately displayed on screen, saved in "My Tickets" in your account profile, and delivered to your email.</p>
        <p><strong>Q: Can I buy multiple tickets for friends?</strong><br>A: Yes! When purchasing multiple tickets, you will receive distinct individual passes (Pass 1 of N, Pass 2 of N), each with its own scannable QR code.</p>
        <p><strong>Q: How does the gate check-in work?</strong><br>A: Gate staff scan your digital pass QR code directly from your smartphone or printed pass using our real-time Gate Scanner.</p>
        <p><strong>Q: Need immediate assistance?</strong><br>A: Contact our dedicated support team at support@thefashionsocial.ng.</p>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="bg-[#141419] border border-[#D4AF37]/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <h3 class="text-sm font-bold text-white font-editorial text-lg">${title}</h3>
        <button id="close-policy-modal" class="text-zinc-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="py-2">
        ${content}
      </div>

      <div class="pt-4 mt-4 border-t border-white/10 flex justify-end">
        <button id="ok-policy-btn" class="gold-gradient-bg px-5 py-2 rounded-xl text-xs font-mono font-bold text-[#070709]">
          Understood & Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const cleanup = () => modal.remove();
  document.getElementById('close-policy-modal').onclick = cleanup;
  document.getElementById('ok-policy-btn').onclick = cleanup;
}
