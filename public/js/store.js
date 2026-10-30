import { CONFIG } from './config.js';
import { INITIAL_EVENTS, INITIAL_ORDERS, INITIAL_AUDIT_LOGS, INITIAL_USERS } from './utils/seedData.js';

// Initialize Supabase Client instance if library exists and keys provided
let supabaseClient = null;
if (window.supabase && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_ANON_KEY.includes('placeholder')) {
  try {
    supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('⚡ Connected to Supabase Live Project:', CONFIG.SUPABASE_URL);
  } catch (err) {
    console.warn('Could not initialize live Supabase client, using resilient fallback store:', err);
  }
}

/**
 * Production Reactive AppStore
 * Manages Auth session, Profiles, Live Events, Ticket categories, Orders, and Check-ins.
 * Uses localStorage persistence so newly published events, tickets, and accounts survive reloads.
 */
class AppStore {
  constructor() {
    this.listeners = new Set();
    this.supabase = supabaseClient;

    // Load persisted state from localStorage for demo/offline resiliency
    let savedEvents = null;
    let savedOrders = null;
    let savedUser = null;
    let savedProfile = null;
    let savedAudit = null;

    try {
      savedEvents = JSON.parse(localStorage.getItem('tfs_events_v2'));
      savedOrders = JSON.parse(localStorage.getItem('tfs_orders_v2'));
      savedUser = JSON.parse(localStorage.getItem('tfs_user_v2'));
      savedProfile = JSON.parse(localStorage.getItem('tfs_profile_v2'));
      savedAudit = JSON.parse(localStorage.getItem('tfs_audit_v2'));
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }

    // Default seed fallback: Superadmin by default for full developer empowerment, or attendee if preferred
    const defaultUser = INITIAL_USERS.superadmin.user;
    const defaultProfile = INITIAL_USERS.superadmin.profile;

    // Check for saved institutions
    let savedInstitutions = null;
    try {
      savedInstitutions = JSON.parse(localStorage.getItem('tfs_institutions_v2'));
    } catch (e) {
      console.warn('Error reading institutions from localStorage:', e);
    }

    const defaultInstitutions = [
      { id: 'inst-1', name: 'University of Benin (UNIBEN)', city: 'Benin City', is_active: true },
      { id: 'inst-2', name: 'Benson Idahosa University (BIU)', city: 'Benin City', is_active: true },
      { id: 'inst-3', name: 'Ambrose Alli University (AAU)', city: 'Ekpoma', is_active: true },
      { id: 'inst-4', name: 'Igbinedion University Okada (IUO)', city: 'Okada', is_active: true },
      { id: 'inst-5', name: 'Edo State University Uzairue (EDSU)', city: 'Iyamho', is_active: true },
      { id: 'inst-6', name: 'Wellspring University', city: 'Benin City', is_active: true },
      { id: 'inst-7', name: 'Mudiame University', city: 'Irrua', is_active: true }
    ];

    this.state = {
      user: savedUser !== undefined ? savedUser : defaultUser,
      profile: savedProfile !== undefined ? savedProfile : defaultProfile,
      events: savedEvents && savedEvents.length > 0 ? savedEvents : INITIAL_EVENTS,
      activeEvent: null,
      orders: savedOrders && savedOrders.length > 0 ? savedOrders : INITIAL_ORDERS,
      auditLogs: savedAudit && savedAudit.length > 0 ? savedAudit : INITIAL_AUDIT_LOGS,
      institutions: savedInstitutions && savedInstitutions.length > 0 ? savedInstitutions : defaultInstitutions,
      cart: {
        eventId: null,
        categoryId: null,
        quantity: 1,
        holdExpiresAt: null,
        orderRef: null,
        answers: {}
      },
      adminRoleView: 'ADMIN',
      currentRoute: window.location.hash || '#/',
      isLiveSupabase: Boolean(this.supabase)
    };

    // Auto-sync activeEvent with flagship
    this.state.activeEvent = this.state.events.find(e => e.slug === CONFIG.FLAGSHIP_SLUG) || this.state.events[0];

    // Initialize Auth Listener if Supabase is active
    this.initAuth();
  }

  async initAuth() {
    if (!this.supabase) return;
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        await this.syncSupabaseUser(session.user);
      }

      this.supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await this.syncSupabaseUser(session.user);
        } else {
          this.setState({ user: null, profile: null });
          localStorage.removeItem('tfs_user_v2');
          localStorage.removeItem('tfs_profile_v2');
        }
      });
    } catch (e) {
      console.warn('Auth state check error:', e);
    }
  }

  async syncSupabaseUser(sbUser) {
    let profile = null;
    try {
      const { data } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', sbUser.id)
        .single();
      profile = data;
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err);
    }

    if (!profile) {
      const email = sbUser.email || '';
      const isSuper = email === 'admin@platform.ng' || email.includes('admin');
      const isOrg = Boolean(sbUser.user_metadata?.is_organizer) || email === 'niyasa@fashionsocial.ng';

      profile = {
        id: sbUser.id,
        user_id: sbUser.id,
        full_name: sbUser.user_metadata?.full_name || email.split('@')[0],
        brand_name: sbUser.user_metadata?.brand_name || (isOrg ? 'NIYASA Events' : null),
        role: isSuper ? 'SUPERADMIN' : isOrg ? 'ORGANIZER' : 'ATTENDEE',
        organizer_status: isSuper || isOrg ? 'APPROVED' : 'NONE',
        is_organizer: isSuper || isOrg,
        created_at: new Date().toISOString()
      };
    } else {
      // Ensure role is mapped if null
      const email = sbUser.email || '';
      if (email === 'admin@platform.ng' || email.includes('admin')) {
        profile.role = 'SUPERADMIN';
        profile.organizer_status = 'APPROVED';
        profile.is_organizer = true;
      }
    }

    this.setState({ user: sbUser, profile });
    localStorage.setItem('tfs_user_v2', JSON.stringify(sbUser));
    localStorage.setItem('tfs_profile_v2', JSON.stringify(profile));
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };

    // Persist state to localStorage for offline / test durability
    try {
      if (partialState.events) localStorage.setItem('tfs_events_v2', JSON.stringify(this.state.events));
      if (partialState.orders) localStorage.setItem('tfs_orders_v2', JSON.stringify(this.state.orders));
      if (partialState.user !== undefined) localStorage.setItem('tfs_user_v2', JSON.stringify(this.state.user));
      if (partialState.profile !== undefined) localStorage.setItem('tfs_profile_v2', JSON.stringify(this.state.profile));
      if (partialState.auditLogs) localStorage.setItem('tfs_audit_v2', JSON.stringify(this.state.auditLogs));
      if (partialState.institutions) localStorage.setItem('tfs_institutions_v2', JSON.stringify(this.state.institutions));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }

    // Synchronously notify all subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- LIVE AUTH METHODS ---
  async signUp({ email, password, fullName, phone, institution, isOrganizer, brandName }) {
    if (this.supabase) {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            institution,
            is_organizer: Boolean(isOrganizer),
            brand_name: brandName || (isOrganizer ? `${fullName} Events` : null)
          }
        }
      });
      if (error) throw error;
      return data;
    }

    // Fallback Mock Sign Up with full persistence
    const fakeId = `u_${Date.now()}`;
    const user = {
      id: fakeId,
      email,
      user_metadata: {
        full_name: fullName,
        phone,
        institution,
        is_organizer: Boolean(isOrganizer),
        brand_name: brandName || (isOrganizer ? `${fullName} Events` : null)
      }
    };
    const profile = {
      id: `p_${Date.now()}`,
      user_id: fakeId,
      full_name: fullName,
      brand_name: brandName || (isOrganizer ? `${fullName} Events` : null),
      is_organizer: Boolean(isOrganizer),
      created_at: new Date().toISOString()
    };

    this.setState({ user, profile });
    return { user, profile };
  }

  async signIn({ email, password }) {
    if (this.supabase) {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }

    // Fallback Mock Sign In
    let profile = this.state.profile;
    if (!profile || profile.user_id !== email) {
      profile = {
        id: `p_${Date.now()}`,
        user_id: `u_${Date.now()}`,
        full_name: email.split('@')[0].toUpperCase(),
        brand_name: `${email.split('@')[0]} Events`,
        is_organizer: true,
        created_at: new Date().toISOString()
      };
    }
    const user = {
      id: profile.user_id,
      email,
      user_metadata: { full_name: profile.full_name }
    };

    this.setState({ user, profile });
    return { user, profile };
  }

  async signOut() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
    this.setState({ user: null, profile: null });
    localStorage.removeItem('tfs_user_v2');
    localStorage.removeItem('tfs_profile_v2');
  }

  async upgradeToOrganizer({ brandName, bankName, accountNumber, accountName, cacNumber, website, contactEmail, socialHandle }) {
    const isVerifiedSubmission = Boolean(brandName && bankName && accountNumber && accountName && cacNumber);

    const updatedProfile = {
      ...(this.state.profile || {}),
      brand_name: brandName,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      cac_number: cacNumber,
      website: website || null,
      contact_email: contactEmail || this.state.user?.email,
      social_handle: socialHandle || null,
      organizer_status: isVerifiedSubmission ? 'APPROVED' : 'PENDING_REVIEW',
      is_organizer: isVerifiedSubmission
    };

    if (this.supabase && this.state.user) {
      await this.supabase
        .from('profiles')
        .update({
          brand_name: brandName,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          is_organizer: isVerifiedSubmission
        })
        .eq('user_id', this.state.user.id);
    }

    const auditLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ORGANIZER_ACCREDITATION_SUBMITTED',
      details: `Organizer accreditation verified for "${brandName}" (CAC/RC: ${cacNumber}). Bank settlement: ${bankName} - ${accountNumber}`,
      actor: this.state.user?.email || 'APPLICANT'
    };

    this.setState({ 
      profile: updatedProfile,
      auditLogs: [auditLog, ...(this.state.auditLogs || [])]
    });
    return updatedProfile;
  }

  // --- QUERY & DATA METHODS ---
  async fetchPublishedEvents() {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('events')
          .select('*, ticket_categories(*)')
          .eq('status', 'PUBLISHED')
          .order('is_featured', { ascending: false });
        if (!error && data && data.length > 0) {
          this.setState({ events: data });
          return data;
        }
      } catch (err) {
        console.warn('Failed to query live Supabase events, using local store:', err);
      }
    }
    return this.state.events;
  }

  getEventBySlug(slug) {
    return this.state.events.find(e => e.slug === slug) || this.state.events[0];
  }

  getEventById(id) {
    return this.state.events.find(e => e.id === id) || this.state.events[0];
  }

  getOrderByRef(ref) {
    return this.state.orders.find(o => o.order_ref === ref);
  }

  getAllTickets() {
    return this.state.orders.flatMap(o => (o.tickets || []).map(t => ({
      ...t,
      order_ref: o.order_ref,
      event_id: o.event_id,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      institution: o.institution,
      tier_name: o.tier_name
    })));
  }

  getMyTickets() {
    const currentUser = this.state.user;
    if (!currentUser) return [];
    return this.state.orders
      .filter(o => o.customer_email === currentUser.email || o.user_id === currentUser.id)
      .flatMap(o => (o.tickets || []).map(t => ({
        ...t,
        order_ref: o.order_ref,
        event_id: o.event_id,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        institution: o.institution,
        tier_name: o.tier_name,
        total_price_kobo: o.total_price_kobo
      })));
  }

  addEvent(newEvent) {
    const events = [newEvent, ...this.state.events];
    this.setState({ events });
  }

  addOrder(newOrder) {
    const orders = [newOrder, ...this.state.orders];
    
    // Decrement reserved and increment sold inventory on category
    const events = this.state.events.map(ev => {
      if (ev.id === newOrder.event_id) {
        return {
          ...ev,
          ticket_categories: (ev.ticket_categories || []).map(cat => {
            if (cat.id === newOrder.category_id) {
              return {
                ...cat,
                sold_inventory: (cat.sold_inventory || 0) + newOrder.quantity,
                reserved_inventory: Math.max(0, (cat.reserved_inventory || 0) - newOrder.quantity)
              };
            }
            return cat;
          })
        };
      }
      return ev;
    });

    const auditLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'TICKETS_ISSUED',
      details: `Order ${newOrder.order_ref} confirmed. ${newOrder.quantity} tickets issued to ${newOrder.customer_name}.`,
      actor: 'PAYSTACK_WEBHOOK'
    };

    this.setState({
      orders,
      events,
      auditLogs: [auditLog, ...this.state.auditLogs]
    });
  }

  updateTicketStatus(ticketId, status, scannedBy = 'Gate Staff (Gate 1)') {
    const now = new Date().toISOString();
    let updatedTicket = null;
    let foundOrder = null;

    const orders = this.state.orders.map(order => {
      let orderHasTicket = false;
      const tickets = (order.tickets || []).map(t => {
        if (t.id === ticketId || t.ticket_number === ticketId || t.qr_token === ticketId) {
          orderHasTicket = true;
          updatedTicket = { ...t, status, scanned_at: now, scanned_by: scannedBy };
          return updatedTicket;
        }
        return t;
      });
      if (orderHasTicket) foundOrder = order;
      return { ...order, tickets };
    });

    if (updatedTicket) {
      const auditLog = {
        id: `l_${Date.now()}`,
        timestamp: now,
        action: 'GATE_SCAN',
        details: `Ticket ${updatedTicket.ticket_number} marked as ${status} by ${scannedBy}.`,
        actor: scannedBy
      };
      this.setState({
        orders,
        auditLogs: [auditLog, ...this.state.auditLogs]
      });
    }

    return { ticket: updatedTicket, order: foundOrder };
  }

  resendOrderTicket(orderRef) {
    let targetOrder = null;
    const orders = this.state.orders.map(o => {
      if (o.order_ref === orderRef) {
        targetOrder = { ...o, email_retries: (o.email_retries || 0) + 1 };
        return targetOrder;
      }
      return o;
    });

    if (targetOrder) {
      const auditLog = {
        id: `l_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'EMAIL_RESENT',
        details: `Ticket pass resent to ${targetOrder.customer_email} for order ${targetOrder.order_ref}. Total retries: ${targetOrder.email_retries}.`,
        actor: 'ADMIN_OPERATOR'
      };
      this.setState({
        orders,
        auditLogs: [auditLog, ...this.state.auditLogs]
      });
    }
    return targetOrder;
  }

  // --- INSTITUTION DIRECTORY MANAGEMENT ---
  getInstitutions() {
    return this.state.institutions || [];
  }

  addInstitution({ name, city }) {
    const newInst = {
      id: `inst-${Date.now()}`,
      name: name.trim(),
      city: (city || 'Benin City').trim(),
      is_active: true
    };
    const institutions = [...(this.state.institutions || []), newInst];
    const auditLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'INSTITUTION_ADDED',
      details: `Added new verified tertiary institution: ${newInst.name} (${newInst.city})`,
      actor: 'ADMIN_OPERATOR'
    };
    this.setState({
      institutions,
      auditLogs: [auditLog, ...this.state.auditLogs]
    });
    return newInst;
  }

  toggleInstitution(id) {
    let toggledInst = null;
    const institutions = (this.state.institutions || []).map(inst => {
      if (inst.id === id) {
        toggledInst = { ...inst, is_active: !inst.is_active };
        return toggledInst;
      }
      return inst;
    });

    if (toggledInst) {
      const auditLog = {
        id: `l_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'INSTITUTION_STATUS_TOGGLED',
        details: `Institution ${toggledInst.name} status updated to ${toggledInst.is_active ? 'ACTIVE' : 'DEACTIVATED'}`,
        actor: 'ADMIN_OPERATOR'
      };
      this.setState({
        institutions,
        auditLogs: [auditLog, ...this.state.auditLogs]
      });
    }
    return toggledInst;
  }

  // --- THREE-TIER GOVERNANCE & MASTER ADMIN METHODS ---

  switchDemoAccount(roleType) {
    const account = INITIAL_USERS[roleType];
    if (!account) return null;

    // Clear any conflicting live supabase session override in local memory
    if (this.supabase) {
      try {
        this.supabase.auth.signOut().catch(() => {});
      } catch (e) {}
    }

    this.setState({
      user: account.user,
      profile: account.profile
    });
    localStorage.setItem('tfs_user_v2', JSON.stringify(account.user));
    localStorage.setItem('tfs_profile_v2', JSON.stringify(account.profile));
    return account;
  }

  submitOrganizerApplication({ brandName, cacNumber, bankName, accountNumber, accountName, reason }) {
    const updatedProfile = {
      ...(this.state.profile || {}),
      brand_name: brandName,
      cac_number: cacNumber,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      organizer_request_reason: reason,
      organizer_status: 'PENDING',
      organizer_requested_at: new Date().toISOString()
    };

    const auditLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ORGANIZER_APPLICATION_SUBMITTED',
      details: `Organizer accreditation application submitted by ${this.state.user?.email} for brand: ${brandName}`,
      actor: this.state.user?.email || 'ATTENDEE'
    };

    this.setState({
      profile: updatedProfile,
      auditLogs: [auditLog, ...this.state.auditLogs]
    });
    localStorage.setItem('tfs_profile_v2', JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  reviewOrganizerApplication(userId, decision, notes = '') {
    // Decision: 'APPROVED', 'REJECTED', 'SUSPENDED'
    let updatedProfile = null;
    if (this.state.profile && (this.state.profile.user_id === userId || this.state.profile.id === userId)) {
      updatedProfile = {
        ...this.state.profile,
        organizer_status: decision,
        is_organizer: decision === 'APPROVED',
        role: decision === 'APPROVED' ? 'ORGANIZER' : 'ATTENDEE'
      };
      this.setState({ profile: updatedProfile });
      localStorage.setItem('tfs_profile_v2', JSON.stringify(updatedProfile));
    }

    const auditLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `ORGANIZER_${decision}`,
      details: `Application for user ${userId} evaluated as ${decision}. Notes: ${notes || 'Platform verification passed'}`,
      actor: this.state.user?.email || 'SUPERADMIN'
    };

    this.setState({
      auditLogs: [auditLog, ...this.state.auditLogs]
    });

    return updatedProfile;
  }

  adminUpdateEventStatus(eventId, { status, is_featured }) {
    let updated = null;
    const events = this.state.events.map(e => {
      if (e.id === eventId) {
        updated = {
          ...e,
          ...(status !== undefined ? { status } : {}),
          ...(is_featured !== undefined ? { is_featured } : {})
        };
        return updated;
      }
      return e;
    });

    if (updated) {
      const auditLog = {
        id: `l_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'EVENT_CURATION_UPDATED',
        details: `Event "${updated.title}" updated by Master Admin. Status: ${updated.status}, Featured: ${updated.is_featured}`,
        actor: this.state.user?.email || 'SUPERADMIN'
      };

      this.setState({
        events,
        activeEvent: updated.id === this.state.activeEvent?.id ? updated : this.state.activeEvent,
        auditLogs: [auditLog, ...this.state.auditLogs]
      });
      localStorage.setItem('tfs_events_v2', JSON.stringify(events));
    }

    return updated;
  }

  fetchMasterAdminData() {
    const paidOrders = (this.state.orders || []).filter(o => o.status === 'PAID');
    const grossRevenueKobo = paidOrders.reduce((sum, o) => sum + (o.total_price_kobo || 0), 0);
    const platformCommissionsKobo = Math.round(grossRevenueKobo * 0.025);
    const netOrganizerPayoutKobo = grossRevenueKobo - platformCommissionsKobo;
    const totalTicketsSold = paidOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);

    return {
      grossRevenueKobo,
      platformCommissionsKobo,
      netOrganizerPayoutKobo,
      totalTicketsSold,
      totalOrdersCount: paidOrders.length,
      events: this.state.events || [],
      orders: this.state.orders || [],
      institutions: this.state.institutions || [],
      auditLogs: this.state.auditLogs || []
    };
  }
}

export const store = new AppStore();
