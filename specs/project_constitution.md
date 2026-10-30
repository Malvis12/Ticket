# CONSTITUTION.MD

## Multi-Tenant Event Ticketing & Hosting Marketplace (Version 2.0)

### Flagship Tenant: The Fashion Social — Style Meets Laughter (Benin City, Edo State)

## Article I: Foundational Axioms & Principles

### Section 1.01 — Purpose & Scope

This Constitution serves as the definitive supreme operational and architectural document for the **Event Ticketing & Hosting Marketplace** (the "Platform"). The Platform is engineered as a general, multi-tenant event creation, ticketing, admission, and discovery system. The flagship release and anchor event is **The Fashion Social — Style Meets Laughter**, hosted by **NIYASA** in Benin City, Edo State, Nigeria. All architectural choices must support general multi-tenancy while flawlessly honoring the specific business, regulatory, and aesthetic criteria defined in the initial Product Requirements Document (PRD).

### Section 1.02 — The Single-File Frontend & Vanilla Runtime Mandate

1. **Runtime Purity:** The client-facing software must be constructed using semantic **HTML5, Tailwind CSS, and Modern Vanilla JavaScript (ES Modules)**. No third-party heavyweight component frameworks (such as React, Vue, Angular, or Svelte) shall be introduced into the client bundle.

2. **Perceived Performance & "React-Feel":** The user interface must deliver the snappiness, zero-page-reload behavior, optimistic updates, and fluid state transitions typical of modern reactive single-page applications (SPAs). This is accomplished via:

   * A dedicated client-side hash/history router (`js/router.js`).

   * Pure functional template literals for dynamic view rendering.

   * A lightweight reactive pub/sub state manager (`js/store.js`).

   * Instant DOM diffing and surgical re-rendering without full-document refresh cycles.

3. **Low-Bandwidth Mobile Optimization:** Assets, scripts, and stylesheets must be aggressively minified and optimized to ensure rapid first-contentful-paint (FCP) and time-to-interactive (TTI) across mobile networks in Nigeria (specifically Android devices on 3G/4G connections).

### Section 1.03 — The Luxury Editorial Aesthetic Standard

1. **Palette Invariants:**

   * **Obsidian / Black Base:** `#070709` / `#0A0A0A` (Dominant backdrop).

   * **Metallic Gold Accent:** `#D4AF37` / `#C5A059` / `#F3E5AB` (Used exclusively for primary calls to action, borders, badges, and accents).

   * **Ivory / Off-White Text:** `#FAFAFA` / `#F5F2EB` (For high-contrast, legible typography).

2. **Design Language:** High-fashion editorial minimalism, confident serif headers (`Cormorant Garamond` or `Playfair Display`), clean modern sans-serif body type (`Plus Jakarta Sans`), generous negative space, restrained gold micro-interactions, and zero garish or unnecessary animations.

## Article II: System Architecture & Separation of Concerns

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (VANILLA SPA)                      │
│   HTML5 Shell • Tailwind CSS • ES Module Router • Vanilla State Store   │
│              Dynamic Template Views • Lucide Vector CDN                │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
         Public Read Operations           Secure Mutative Operations
         (RLS-Protected Anon Key)           (Inventory & Checkouts)
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       SUPABASE POSTGRESQL (DB)       │  │   SUPABASE EDGE FUNCTIONS    │
│  - Events, Categories, Profiles      │  │   - initialize-payment       │
│  - Row-Level Security Policies       │  │   - paystack-webhook         │
│  - Atomic RPC Inventory Locks        │  │   - verify-ticket-gate       │
│  - Gate Scan Validation Logic        │  │   - resend-ticket-email      │
└──────────────────────────────────────┘  └──────────────┬───────────────┘
                                                         │
                                        ┌────────────────┴────────────────┐
                                        ▼                                 ▼
                             ┌─────────────────────┐           ┌────────────────────┐
                             │ PAYSTACK GATEWAY    │           │ RESEND API         │
                             │ - NGN Inline Popup  │           │ - Branded Tickets  │
                             │ - HMAC Webhooks     │           │ - Sale Alerts      │
                             │ - Merchant Payouts  │           │ - Audit Logs       │
                             └─────────────────────┘           └────────────────────┘

```

### Section 2.01 — The Zero-Trust Client Law

1. **Prohibition of Client Pricing Calculations:** The client browser is strictly untrusted. Client-submitted prices, discounts, fees, and currency values are entirely ignored by the backend. All transaction amounts must be computed authoritatively on the server from validated database records (FR-04).

2. **Credential Insulation:** API secret keys, Paystack secret keys, Resend secret tokens, and Supabase service-role keys must **never** be exposed in client-side code, scripts, repository commits, or client-accessible environment variables (PRD Section 10 & 16).

### Section 2.02 — Serverless Edge Execution

All mutative payment transactions, cryptographic webhook processing, transactional email dispatch, and gate scan validations must execute in isolated server-side environments (Supabase Edge Functions / Deno runtime) protected by cryptographic signature checks.

## Article III: Tenancy, Profiles & Access Control

### Section 3.01 — The Unified Profile Axiom

1. There shall be no artificial bifurcation of "Attendee Accounts" and "Organizer Accounts." Every authenticated identity represents a single row in `public.profiles`.

2. Any registered user may purchase tickets across any published event.

3. Any registered user may activate organizer capabilities by completing the organizer onboarding flow (providing brand details, bank payout credentials, and receiving verification).

### Section 3.02 — Least-Privilege Role-Based Access Control (RBAC)

The platform enforces role-based access constraints both in the database via PostgreSQL Row-Level Security (RLS) and in the application routing layer:

1. **Public / Guest:** Read-only access to published events and active ticket categories. May initiate checkout reservations.

2. **Ticket Holder:** Read-only access to their own orders, purchase history, and generated QR ticket tokens.

3. **Check-in / Gate Staff:** Scoped exclusively to the validation interface (`#/scan/:eventId`) for their assigned event. Prohibited from viewing customer contact lists, financial revenue figures, ticket price controls, or unrelated events (FR-13).

4. **Event Organizer:** Full administrative access to their own events, inventory tiers, sales analytics, attendee check-in logs, and payout balances. Strictly isolated from data belonging to other organizers.

5. **Platform SuperAdmin:** Platform-wide monitoring, manual dispute intervention, platform commission setting, and featured event curation.

## Article IV: Inventory Integrity, Payment & Webhook Contracts

### Section 4.01 — The Atomic Reservation Guarantee (Anti-Overselling Law)

1. **Concurrency Control:** Inventory must be reserved atomically using database row locks (`SELECT ... FOR UPDATE`) inside the PostgreSQL RPC function `reserve_marketplace_tickets` (FR-11).

2. **The 10-Minute Hold Window:** Upon entering the checkout pipeline, requested inventory is temporarily moved from `available` to `reserved` for precisely 600 seconds (10 minutes).

3. **Automated Expiry:** Abandoned or unpaid checkout sessions automatically release reserved inventory back to the available pool upon expiration.

4. **Zero Oversell Guarantee:** Under no circumstances shall the sum of `sold_inventory` and `reserved_inventory` exceed `total_inventory`.

### Section 4.02 — Payment Gateway & Webhook Invariants

1. **Primary Currency:** Nigerian Naira (`NGN`). All monetary amounts in the database are stored as unsigned integers in **Kobo** ($1\text{ NGN} = 100\text{ Kobo}$) to prevent floating-point rounding errors.

2. **Cryptographic Webhook Verification:** The webhook endpoint (`/functions/v1/paystack-webhook`) must immediately compute the HMAC SHA-512 signature of the raw incoming request body using the Paystack secret key and compare it against the `x-paystack-signature` header. Unsigned or invalid requests must be rejected immediately with an HTTP `401 Unauthorized` response.

3. **Strict Idempotency:** The payment verification pipeline must be strictly idempotent. If a webhook with a previously processed `provider_reference` or `order_ref` is received, the system must immediately return `200 OK` without creating duplicate tickets, re-triggering inventory commits, or distorting revenue reporting.

4. **No Ticket Prior to Verification:** An order remains in `PENDING` status and **cannot** yield a valid ticket or QR code until verified server-side via webhook or direct server-to-server verification with Paystack (FR-05). Browser redirects back to the site are never treated as proof of payment.

## Article V: Ticket Credentialing, QR Codes & Venue Entry

### Section 5.01 — Cryptographic Ticket Generation

1. Each paid admission must produce an independent, unique record in the `tickets` table with:

   * A human-readable ticket number (e.g., `TFS-2026-VVIP-4821`).

   * A high-entropy, opaque cryptographic QR token (UUIDv4 or signed HMAC token).

2. The QR token payload must never contain unencrypted personally identifiable information (PII) such as the attendee's home address, phone number, or payment card details.

### Section 5.02 — Gate Validation & Anti-Passback Protocol (FR-12)

1. Check-in operations must be executed against the atomic database function `validate_gate_scan`.

2. **Scan Outcomes:**

   * **VALID (Admit):** If the ticket status is `VALID`, the server atomically changes the status to `USED`, logs the scan timestamp and staff identifier in `check_ins`, and returns an HTTP `200` with the attendee’s name and category.

   * **DUPLICATE (Reject):** If the ticket status is already `USED`, the server rejects admission, returns the exact timestamp and staff ID of the original scan, and logs a duplicate scan alert to protect against pass-back fraud.

   * **INVALID / REFUNDED (Reject):** Cancelled, refunded, revoked, or non-existent tickets must be denied entry with an explicit alert.

3. **Manual Lookup Fallback:** Authenticated gate staff must have a protected manual lookup interface to search by ticket number in cases of broken mobile screens or dead batteries.

## Article VI: Communication & Transactional Email Protocols

### Section 6.01 — Automated Email Dispatch via Resend (PRD Section 11 & 23)

Upon server-side confirmation of a paid order, the system must atomically dispatch two transactional emails:

1. **Attendee Ticket Email (PRD 23.1):** Dispatched to the buyer containing order reference, ticket category, attendee name, institution (if collected), venue location, entry instructions, and a rendered QR code / secure pass view link (FR-07).

2. **Organizer Sale Notification (PRD 23.2):** Dispatched to the organizer's designated notification email containing buyer name, institution, category, quantity, gross amount paid, Paystack payment reference, and timestamp (FR-08).

### Section 6.02 — Idempotent Ticket Resend (FR-10)

Authorized administrators and organizers must have access to a "Resend Ticket" trigger in their dashboard. Executing this trigger must re-dispatch the original ticket credentials via the transactional email service without re-billing the customer or altering the ticket's cryptographic token.

## Article VII: Compliance, Privacy & Event-Specific Disclosures

### Section 7.01 — Nigerian Data Protection Act (NDPA) Compliance

1. The platform collects attendee personal information (Full Name, Email, Phone Number, Institution) exclusively for event operations, admissions, fraud prevention, and legitimate organizer reporting.

2. Attendee data shall not be rented or sold to external third-party advertisers.

3. A compliant Privacy Notice and Terms of Service must be displayed and acknowledged at checkout.

### Section 7.02 — Flagship Category Invariants & Mandatory Disclosures (PRD Section 7)

For *The Fashion Social*, the four ticket tiers are defined as:

1. **Regular:** General admission, showcase access, live comedy, and pop-up shopping access.

2. **VIP:** Priority red carpet entry, designated lounge seating, welcome drink, and digital lookbook.

3. **VVIP:** Prime front-row seating, dedicated table service, backstage/lounge access, and VIP parking lane.

4. **Sit with Influencers & Celebrities:** Ultra-exclusive curated seating at a shared celebrity table, premium bottle service, red carpet media coverage, and luxury gift bag.

   * **MANDATORY LEGAL DISCLAIMER:** All marketing, category cards, and checkout summaries for this category must display the explicit disclosure: *"Seating is subject to confirmed arrangements and availability. Seating beside a specific named personality is not guaranteed unless confirmed in writing by the organizer."*

## Article VIII: The Master Data Dictionary

```
-- Supabase PostgreSQL Master Schema Definition

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. UNIFIED PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    default_institution TEXT,
    is_organizer BOOLEAN DEFAULT false,
    organizer_brand_name TEXT,
    organizer_slug TEXT UNIQUE,
    bank_code TEXT,
    bank_account_number TEXT,
    paystack_subaccount_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EVENTS
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    category TEXT NOT NULL,
    banner_url TEXT,
    venue_name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Benin City',
    state TEXT NOT NULL DEFAULT 'Edo State',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PUBLISHED', -- 'DRAFT', 'PUBLISHED', 'COMPLETED'
    custom_checkout_questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TICKET CATEGORIES
CREATE TABLE public.ticket_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_kobo BIGINT NOT NULL DEFAULT 0,
    total_inventory INT NOT NULL CHECK (total_inventory >= 0),
    reserved_inventory INT NOT NULL DEFAULT 0 CHECK (reserved_inventory >= 0),
    sold_inventory INT NOT NULL DEFAULT 0 CHECK (sold_inventory >= 0),
    perks TEXT[] DEFAULT '{}',
    disclaimer TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ORDERS
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref TEXT UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    category_id UUID NOT NULL REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price_kobo BIGINT NOT NULL,
    platform_fee_kobo BIGINT NOT NULL DEFAULT 0,
    organizer_payout_kobo BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED'
    payment_reference TEXT UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TICKETS
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE NOT NULL,
    qr_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'VALID', -- 'VALID', 'USED', 'INVALID', 'REFUNDED'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CHECK-INS
CREATE TABLE public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES public.profiles(id),
    scanned_at TIMESTAMPTZ DEFAULT now(),
    scan_result TEXT NOT NULL -- 'ACCEPTED', 'DUPLICATE', 'REVOKED'
);

-- 7. AUDIT LOGS
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    event_id UUID REFERENCES public.events(id),
    action TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

```

## Article IX: Amendment & Development Ratification

1. Any addition of client-side JavaScript libraries or build tools requires justification demonstrating that vanilla DOM and native browser APIs cannot achieve the required outcome.

2. The core security rules defined in Articles II, IV, and V (Zero-Trust Pricing, HMAC Webhook Signatures, Atomic Inventory Reservation, and Anti-Passback Gate Validation) are immutable. No pull request or deployment may bypass or weaken these controls.

3. Every automated or manual test suite must run against the 14 Functional Requirements (`FR-01` through `FR-14`) codified in PRD Section 17 prior to production deployment.