# DESIGN.MD — Technical Architecture & UI/UX System Design

## Multi-Tenant Event Ticketing & Hosting Marketplace (Version 2.0)

### Flagship Release: The Fashion Social — Style Meets Laughter

## 1. Architectural Overview

To satisfy `constitution.md` (Article I & II), the application uses a **Zero-Build-Overhead Vanilla SPA Architecture** paired with **Supabase PostgreSQL + Deno Edge Functions**. It delivers the reactive ergonomics of React while deploying as pure static assets over a global CDN.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER RUNTIME (ES MODULES)                         │
│                                                                              │
│  ┌──────────────┐    hashchange     ┌──────────────┐    render()             │
│  │ index.html   ├──────────────────►│ js/router.js ├────────────────────┐    │
│  │ (#app shell) │                   └──────┬───────┘                    │    │
│  └──────────────┘                          │                            ▼    │
│         ▲                                  │ subscribes        ┌────────────┐│
│         │ DOM Patch                        ▼                   │ js/views/* ││
│         │                           ┌──────────────┐           │ (Template  ││
│         └───────────────────────────┤ js/store.js  │◄──────────┤  Literals) ││
│                                     │ (Pub/Sub)    │  actions  └─────┬──────┘│
│                                     └──────┬───────┘                 │       │
└────────────────────────────────────────────┼─────────────────────────┼───────┘
                                             │                         │
                         Supabase Anon Read  │                         │ HTTPS POST
                         (RLS Enforced)      ▼                         ▼
┌───────────────────────────────────────────────────┐   ┌──────────────────────┐
│            SUPABASE POSTGRESQL DATABASE           │   │ SUPABASE EDGE FUNCS  │
│  • profiles, events, ticket_categories            │◄──┤ • initialize-payment │
│  • orders, tickets, check_ins, email_logs         │   │ • paystack-webhook   │
│  • RPC: reserve_marketplace_tickets (FOR UPDATE)  │   │ • verify-ticket-gate │
│  • RPC: validate_gate_scan (Atomic Check-in)      │   │ • resend-ticket-email│
└───────────────────────────────────────────────────┘   └──────────────────────┘

```

## 2. Luxury Editorial Design System (CSS Tokens & Typography)

### 2.1 Color Palette Tokens (`public/css/style.css`)

All views adhere strictly to the Obsidian, Metallic Gold, and Ivory editorial palette:

| Token Name | Hex Value | Usage | 
| ----- | ----- | ----- | 
| `--bg-obsidian` | `#0A0A0A` | Primary viewport background | 
| `--bg-surface` | `#121212` | Elevated cards, modals, checkout containers | 
| `--bg-surface-gold` | `#1A150B` | Highlighted VVIP / Celebrity cards & active holds | 
| `--gold-primary` | `#D4AF37` | Primary borders, icons, focus rings, active badges | 
| `--gold-light` | `#F3E5AB` | High-contrast gold typography & gradient midpoint | 
| `--gold-muted` | `#C5A059` | Secondary metallic accents & hover borders | 
| `--text-ivory` | `#FAFAFA` | Primary editorial headings & body copy | 
| `--text-muted` | `#A1A1AA` | Metadata, timestamps, secondary labels (`zinc-400`) | 
| `--status-valid` | `#10B981` | Verified ticket badge & gate admission banner | 
| `--status-warn` | `#F59E0B` | Duplicate scan warning & celebrity seating disclaimer | 
| `--status-danger` | `#EF4444` | Refunded/invalid ticket alert & failed payment banner | 

### 2.2 Typography Scale

* **Display / Editorial Headings (`font-editorial`):** `'Cormorant Garamond', Georgia, serif`

  * Hero Title: `clamp(2.75rem, 6vw, 4.5rem)`, `font-weight: 700`, `line-height: 1.05`

  * Section Header: `clamp(1.875rem, 3.5vw, 3rem)`, `font-weight: 700`

* **UI & Functional Body (`font-sans`):** `'Plus Jakarta Sans', -apple-system, sans-serif`

  * Body Copy: `0.9375rem` ($15\text{ px}$), `line-height: 1.6`

  * Micro Labels / Badges: `0.6875rem` ($11\text{ px}$), `text-transform: uppercase`, `letter-spacing: 0.2em`

* **Cryptographic & Monetary Values (`font-mono`):** `'JetBrains Mono', monospace`

  * Used for Ticket Numbers (`TFS-2026-VVIP-4821`), Order References, and Countdown Timers.

## 3. Vanilla SPA Frontend Engineering Design

### 3.1 Reactive Pub/Sub State Store (`public/js/store.js`)

To achieve a React-like experience without virtual DOM bloat, `store.js` implements an observable singleton with `sessionStorage` persistence for active checkouts:

```
// Architectural Pattern for public/js/store.js
class AppStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
      user: null,               // Supabase auth user
      profile: null,            // Unified profile (Attendee + Organizer fields)
      events: [],               // Cached marketplace events
      activeEvent: null,        // Currently viewed event + ticket_categories
      cart: {                   // Active checkout draft
        eventId: null,
        categoryId: null,
        quantity: 1,
        holdExpiresAt: null,
        orderRef: null
      },
      adminRoleView: 'ORGANIZER' // 'ORGANIZER' | 'STAFF' | 'FINANCE'
    };
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const store = new AppStore();

```

### 3.2 Zero-Reload Router & View Lifecycle (`public/js/router.js`)

Each view module exports two functions:

1. `render(params)`: Returns an HTML string constructed via clean template literals.

2. `mount(params)`: Attaches scoped event listeners (`click`, `submit`, `input`) after the HTML is injected into `#app`, and returns an optional `unmount()` cleanup function (e.g., for clearing countdown intervals or stopping the camera stream on `#/scan/:eventId`).

| Hash Route | View Module | Purpose | 
| ----- | ----- | ----- | 
| `#/` | `views/homeView.js` | Flagship *The Fashion Social* hero + Marketplace discovery grid | 
| `#/explore` | `views/exploreView.js` | Searchable event directory by city (Benin City, Lagos, Abuja) & category | 
| `#/event/:slug` | `views/eventDetailView.js` | Event showcase, capacity bar, 4 luxury ticket cards & disclaimers | 
| `#/checkout/:eventId` | `views/checkoutView.js` | 10-min hold timer, Edo State institution picker, Paystack Inline trigger | 
| `#/ticket/:orderRef` | `views/ticketView.js` | Perforated gold/obsidian digital pass, SVG QR code, print/download | 
| `#/profile` | `views/profileView.js` | Unified Profile: "My Tickets" wallet + 1-click "Organizer Studio" switch | 
| `#/create-event` | `views/createEventView.js` | Multi-step wizard to publish an event, dynamic tiers & custom questions | 
| `#/admin/:eventId` | `views/adminView.js` | Sales KPIs, Institution Reach Report, Order search & Resend button | 
| `#/scan/:eventId` | `views/scannerView.js` | HTML5 WebRTC camera QR scanner + manual ticket number fallback | 

## 4. End-to-End Sequence Diagrams

### 4.1 Checkout, Atomic Hold & Paystack Webhook Sequence (`FR-04` to `FR-11`)

```
Attendee (Browser)       Edge: initialize-payment       Supabase Postgres        Paystack API / Webhook
       │                            │                           │                          │
       ├── 1. Submit Checkout ─────►│                           │                          │
       │                            ├── 2. RPC: reserve_hold ──►│                          │
       │                            │      (SELECT FOR UPDATE)  │                          │
       │                            │◄── 3. Order Ref + Kobo ───┤                          │
       │                            ├── 4. Initialize Txn ────────────────────────────────►│
       │                            │◄── 5. access_code ───────────────────────────────────┤
       │◄─ 6. Return Order + Code ──┤                           │                          │
       │                            │                           │                          │
       ├── 7. Open Paystack Inline Popup & Complete Payment ──────────────────────────────►│
       │                            │                           │                          │
       │                            │      [ Edge: paystack-webhook ]                      │
       │                            │◄── 8. POST charge.success (x-paystack-signature) ────┤
       │                            ├── 9. Verify HMAC SHA-512  │                          │
       │                            ├── 10. Commit Inventory & Issue QR Tickets ──────────►│
       │                            ├── 11. Dispatch Resend Emails (Buyer + NIYASA)        │
       │                            ├── 12. Return 200 OK ────────────────────────────────►│
       │                            │                           │                          │
       ├── 13. Navigate to #/ticket/:orderRef ─────────────────►│                          │
       │◄─ 14. Render Verified Perforated Pass + SVG QR ────────┤                          │

```

### 4.2 Venue Gate QR Check-In Sequence (`FR-12`)

```
Gate Staff (`#/scan/:id`)          Edge: verify-ticket-gate          Supabase Postgres (`validate_gate_scan`)
           │                                   │                                        │
           ├── 1. Decode QR / Enter Ticket # ─►│                                        │
           │      (Bearer Staff JWT)           ├── 2. Verify JWT Role for Event         │
           │                                   ├── 3. Call RPC `validate_gate_scan` ───►│
           │                                   │                                        ├─ Lock Ticket Row (`FOR UPDATE`)
           │                                   │                                        ├─ Check if `VALID` vs `USED`
           │                                   │                                        ├─ If `VALID`: Set `USED` + Log
           │                                   │◄── 4. Return JSON Outcome + Metadata ──┤
           │◄─ 5. Render Emerald/Amber/Red UI ─┤                                        │

```

## 5. Database Triggers, Indexes & Security Design

### 5.1 High-Concurrency Performance Indexes

To keep dashboard analytics and gate scans under $20\text{ ms}$ as the database scales beyond $3,000+$ tickets per event:

```
-- Fast lookup for Gate QR Scanner (FR-12)
CREATE UNIQUE INDEX idx_tickets_qr_token ON public.tickets (qr_token);
CREATE UNIQUE INDEX idx_tickets_ticket_number ON public.tickets (ticket_number);

-- Fast lookup for Webhook Idempotency & Customer Ticket View (FR-05)
CREATE UNIQUE INDEX idx_orders_order_ref ON public.orders (order_ref);
CREATE INDEX idx_orders_event_status ON public.orders (event_id, status);

-- Fast expiry cleanup during checkout holds (FR-11)
CREATE INDEX idx_orders_pending_expiry ON public.orders (category_id, status, expires_at)
WHERE status = 'PENDING';

-- Fast event discovery by slug and category
CREATE UNIQUE INDEX idx_events_slug ON public.events (slug);
CREATE INDEX idx_events_published_filter ON public.events (status, category, city, start_time);

```

### 5.2 Deterministic SVG QR Generation Design

* **Client Rendering:** The digital pass view (`#/ticket/:orderRef`) renders a crisp, high-contrast vector SVG QR code encoding only the opaque `ticket.qr_token` string (e.g., `TFS_SIG_90821_VVIP_4821_VERIFIED`) with an embedded center `TFS` gold monogram.

* **Zero PII in QR:** In compliance with `constitution.md` Section 5.01, no customer email, phone number, or name is embedded inside the QR payload itself; attendee details are retrieved strictly by the authenticated staff scanner querying the server.

## 6. Directory & File Blueprint for Implementation

```
the-fashion-social-marketplace/
├── constitution.md                          # Supreme architectural & security laws
├── spec.md                                  # Functional requirements & API contracts
├── design.md                                # Technical & UI/UX system design
├── public/
│   ├── index.html                           # Single SPA shell + CDN links (Lucide, Paystack)
│   ├── css/
│   │   └── style.css                        # Luxury Obsidian/Gold/Ivory stylesheet
│   └── js/
│       ├── config.js                        # Public Supabase URL, Anon Key, Mock/Live toggle
│       ├── store.js                         # Reactive Pub/Sub state management
│       ├── router.js                        # Zero-reload hash router with lifecycle hooks
│       ├── utils/
│       │   ├── formatters.js                # NGN currency,WAT dates, countdown timers
│       │   └── qrGenerator.js               # Pure SVG QR matrix renderer
│       ├── components/
│       │   ├── navbar.js                    # Sticky header + Unified Profile / Role switcher
│       │   ├── toast.js                     # Gold/Amber/Red floating notifications
│       │   └── modals.js                    # Paystack simulation & Email preview modals
│       └── views/
│           ├── homeView.js                  # Flagship Fashion Social Hero + Marketplace grid
│           ├── exploreView.js               # Multi-event search & city/category filters
│           ├── eventDetailView.js           # Dynamic event page + 4 tier cards
│           ├── checkoutView.js              # 10-min hold, Edo institution directory, checkout
│           ├── ticketView.js                # Perforated digital pass + email preview triggers
│           ├── profileView.js               # Unified Profile (My Tickets + Organizer Studio)
│           ├── createEventView.js           # Host wizard to publish new events & tiers
│           ├── adminView.js                 # KPIs, Institution Reach Report, Order Resend
│           └── scannerView.js               # Camera & manual QR gate verification terminal
└── supabase/
    ├── migrations/
    │   └── 20261029000001_master_schema.sql # Complete tables, indexes, RLS & atomic RPCs
    └── functions/
        ├── initialize-payment/index.ts      # Server-side price calc & atomic hold
        ├── paystack-webhook/index.ts        # HMAC SHA-512 check, ticket issue & Resend emails
        ├── verify-ticket-gate/index.ts      # Atomic gate check-in & duplicate scan guard
        └── resend-ticket-email/index.ts     # Idempotent admin ticket email resend

```