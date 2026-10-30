# TASKS.MD — Spec-Driven Implementation Plan

## Multi-Tenant Event Ticketing & Hosting Marketplace (Version 2.0)

### Flagship Release: The Fashion Social — Style Meets Laughter (NIYASA, Benin City)

## 1. Execution Protocol for Antigravity Agents

1. **Sequential & Dependency Order:** Execute tasks strictly in phase order (`Phase 1` $\rightarrow$ `Phase 7`). Tasks marked `[PARALLEL]` within the same phase may be executed concurrently by sub-agents.

2. **Traceability Mandate:** Every task references its governing rules in `constitution.md`, functional contracts in `spec.md`, and architectural patterns in `design.md`.

3. **Definition of Done (DoD):** A task may only be marked `[x]` after its automated or browser-based **Verification Check** passes with zero console errors or security violations.

## Phase 1: Workspace Foundation, Luxury Design System & SPA Core

*Goal: Establish the zero-build Vanilla HTML5/CSS/JS Single-Page Application (SPA) shell, reactive Pub/Sub store, and zero-reload hash router (`constitution.md` Art. I, `design.md` Sec. 2–3).*

* \[x\] **TASK-101: Initialize Directory Structure & Environment Config**

  * **Files:** `public/index.html`, `public/js/config.js`, `.env.example`, `.gitignore`

  * **Action:**

    * Create the directory tree specified in `design.md` Section 6.

    * Configure `public/js/config.js` with public environment constants (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PAYSTACK_PUBLIC_KEY`, and a `DEMO_OFFLINE_FALLBACK` toggle for local previewing before live keys are connected).

    * Verify that **zero** secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`) exist in `public/` (`constitution.md` Sec. 2.01).

  * **Verification Check:** Run a grep scan across `public/` for `sk_live`, `sk_test`, or `service_role`; must return 0 matches.

* \[x\] **TASK-102: Build Luxury Editorial Stylesheet & Typography Tokens**

  * **Files:** `public/css/style.css`, `public/index.html`

  * **Action:**

    * Implement CSS custom properties from `design.md` Section 2.1 (`--bg-obsidian: #0A0A0A`, `--bg-surface: #121212`, `--gold-primary: #D4AF37`, `--gold-light: #F3E5AB`, `--text-ivory: #FAFAFA`).

    * Load Google Fonts (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`) and Tailwind utility classes / compiled styles.

    * Create utility classes `.gold-shimmer`, `.gold-text`, `.card-luxury`, and perforated ticket border styles.

  * **Verification Check:** Load `public/index.html` in the browser; verify background renders `#0A0A0A` with zero FOUC (Flash of Unstyled Content).

* \[x\] **TASK-103: Implement Reactive Pub/Sub State Store (`store.js`)**

  * **Files:** `public/js/store.js`, `public/js/utils/seedData.js`

  * **Action:**

    * Implement the observable `AppStore` singleton (`getState`, `setState`, `subscribe`) from `design.md` Section 3.1.

    * Persist active checkout cart (`eventId`, `categoryId`, `quantity`, `holdExpiresAt`, `orderRef`) in `sessionStorage` so accidental tab refreshes preserve the 10-minute hold timer.

    * Pre-load initial fallback seed data for **The Fashion Social — Style Meets Laughter** (4 ticket tiers, 7 verified Edo State institutions, and sample orders) alongside additional multi-tenant marketplace events.

  * **Verification Check:** Dispatch `store.setState({ adminRoleView: 'STAFF' })` in the browser console and confirm subscribed listeners fire synchronously in $< 5\text{ ms}$.

* \[x\] **TASK-104: Implement Zero-Reload Hash Router (`router.js`) & Shell Components**

  * **Files:** `public/js/router.js`, `public/js/components/navbar.js`, `public/js/components/toast.js`, `public/js/utils/formatters.js`

  * **Action:**

    * Build the hash router supporting parameterized routes (`#/`, `#/explore`, `#/event/:slug`, `#/checkout/:eventId`, `#/ticket/:orderRef`, `#/profile`, `#/create-event`, `#/admin/:eventId`, `#/scan/:eventId`).

    * Implement view lifecycle hooks (`render`, `mount`, `unmount`) to clean up intervals and camera streams on route change (`design.md` Sec. 3.2).

    * Build the sticky luxury navbar with active route highlighting, Unified Profile badge, and a toast notification helper (`showToast(message, type)`).

  * **Verification Check:** Click through all top-level navigation links; verify `window.location.hash` updates and `#app` re-renders smoothly without triggering a browser network document reload.

## Phase 2: Supabase Database Schema, RLS & Atomic RPC Functions

*Goal: Provision the multi-tenant PostgreSQL schema, Row-Level Security policies, high-concurrency indexes, and atomic inventory/gate RPCs (`constitution.md` Art. III–V, VIII; `spec.md` Sec. 2–3).*

* \[x\] **TASK-201: Write Master Relational Schema & High-Concurrency Indexes**

  * **Files:** `supabase/migrations/20261029000001_master_schema.sql`

  * **Action:**

    * Create the 7 core tables from `constitution.md` Article VIII (`profiles`, `events`, `ticket_categories`, `orders`, `tickets`, `check_ins`, `audit_logs`) plus `email_logs`.

    * Enforce integer `BIGINT` Kobo columns (`price_kobo`, `total_price_kobo`, `platform_fee_kobo`, `organizer_payout_kobo`) and `CHECK` constraints preventing negative inventory.

    * Add the performance indexes from `design.md` Section 5.1 (`idx_tickets_qr_token`, `idx_orders_order_ref`, `idx_orders_pending_expiry`, `idx_events_slug`).

  * **Verification Check:** Apply migration cleanly on local/staging Supabase PostgreSQL instance with zero syntax or foreign-key errors.

* \[x\] **TASK-202: Implement Row-Level Security (RLS) & Permission Policies (`FR-13`)**

  * **Files:** `supabase/migrations/20261029000002_rls_policies.sql`

  * **Action:**

    * Enable RLS on all tables in the `public` schema.

    * Implement the permission matrix in `spec.md` Section 2.2:

      * Public visitors can `SELECT` `PUBLISHED` events and active `ticket_categories`.

      * Authenticated users can `SELECT` and `UPDATE` their own row in `public.profiles`.

      * Buyers can `SELECT` only their own `orders` and `tickets`.

      * Organizers can `INSERT/UPDATE` only `events` and `ticket_categories` where `organizer_id = auth.uid()`.

      * Gate Staff cannot mutate prices or export customer lists.

  * **Verification Check:** Query `public.orders` using the unauthenticated `anon` key; verify 0 rows are leaked.

* \[x\] **TASK-203: Implement Atomic Inventory Reservation RPC (`FR-11`, `SPEC-CHK-02`)**

  * **Files:** `supabase/migrations/20261029000003_rpc_functions.sql`

  * **Action:**

    * Create `reserve_marketplace_tickets(p_event_id, p_category_id, p_quantity, p_user_id, p_customer_name, p_customer_email, p_customer_phone, p_answers)`.

    * Lock the target `ticket_categories` row with `FOR UPDATE`.

    * Reclaim expired holds (`status = 'PENDING' AND expires_at < now()`).

    * Verify `sold_inventory + reserved_inventory + p_quantity <= total_inventory`.

    * Calculate authoritative `total_price_kobo` from DB `price_kobo` (`FR-04`), increment `reserved_inventory`, and insert a `PENDING` order with a 10-minute expiry (`now() + INTERVAL '10 minutes'`).

  * **Verification Check:** Execute two concurrent SQL transactions requesting the last remaining ticket of a category; confirm the first succeeds and the second raises `Insufficient ticket inventory`.

* \[x\] **TASK-204: Implement Atomic Gate Scan RPC (`FR-12`, `SPEC-SCAN-01`)**

  * **Files:** `supabase/migrations/20261029000003_rpc_functions.sql`

  * **Action:**

    * Create `validate_gate_scan(p_scan_input, p_event_id, p_staff_user_id)` matching by either `qr_token` or `ticket_number` with `FOR UPDATE`.

    * Implement the 4 deterministic outcomes from `spec.md` Section 3.4:

      * `VALID` $\rightarrow$ atomically transition `status = 'USED'`, log `ACCEPTED` in `check_ins`, return attendee metadata.

      * `USED` $\rightarrow$ return `DUPLICATE` with original scan timestamp and staff identifier, log `DUPLICATE` in `check_ins`.

      * `REFUNDED` / `INVALID` $\rightarrow$ return `REVOKED`, log `REVOKED`.

      * Not found $\rightarrow$ return `INVALID`.

  * **Verification Check:** Invoke `validate_gate_scan` twice sequentially with the same `qr_token`; first call must return `outcome: 'VALID'`, second call must return `outcome: 'DUPLICATE'`.

* \[x\] **TASK-205: Seed Flagship Event (*The Fashion Social*) & Edo State Institutions**

  * **Files:** `supabase/seed.sql`

  * **Action:**

    * Seed the NIYASA organizer profile and flagship event **The Fashion Social — Style Meets Laughter** (`slug = 'the-fashion-social'`, Benin City, Edo State, 3,000 target capacity).

    * Seed the 4 flagship categories (*Regular*, *VIP*, *VVIP*, *Sit with Influencers & Celebrities*) including the mandatory Section 7 celebrity seating disclaimer.

    * Seed the custom checkout question JSON containing the verified Edo State institution directory (*UNIBEN, BIU, AAU, IUO, EDSU, Wellspring, Mudiame*) plus 2 additional sample marketplace events to showcase multi-tenancy.

  * **Verification Check:** Query `SELECT slug, jsonb_array_length(custom_checkout_questions) FROM public.events`; verify `'the-fashion-social'` is present with its categories.

## Phase 3: Marketplace Discovery & Flagship Event Showcase Views

*Goal: Build the responsive public discovery portal and flagship event showcase (`spec.md` Module 1, `FR-01`, `FR-02`).*

* \[x\] **TASK-301: Build Home View (`homeView.js`) — Flagship Showcase & Marketplace Feed `[PARALLEL]`**

  * **Files:** `public/js/views/homeView.js`

  * **Action:**

    * Render the flagship Hero section for **The Fashion Social — Style Meets Laughter** with location badge (*Benin City, Edo State*), equal-prominence **High Couture & Live Comedy** editorial cards, and live 3,000-guest capacity progress bar.

    * Render the 4 luxury ticket tier cards with real-time remaining inventory, benefit checklists, and the amber celebrity seating disclaimer (`SPEC-MKT-02`).

    * Render a "Trending Marketplace Events" section below the flagship showcase so visitors can browse other hosted events or click "Host Your Event".

  * **Verification Check:** Inspect `#/` on $375\text{ px}$ mobile and $1440\text{ px}$ desktop viewports; verify all 4 categories and the celebrity disclaimer render cleanly.

* \[x\] **TASK-302: Build Explore Marketplace View (`exploreView.js`) & Event Detail View (`eventDetailView.js`) `[PARALLEL]`**

  * **Files:** `public/js/views/exploreView.js`, `public/js/views/eventDetailView.js`

  * **Action:**

    * In `exploreView.js`, implement instantaneous search and filter pills by City (*All, Benin City, Lagos, Abuja*) and Category (*All, Fashion, Comedy, Campus, Nightlife, Tech*).

    * In `eventDetailView.js` (`#/event/:slug`), dynamically render any selected event's hero banner, date/venue metadata, organizer badge, custom ticket tier cards, and FAQ/policy accordion.

    * Wire each "Select Tier" button to store the selected `eventId` and `categoryId` in `store.js` and navigate to `#/checkout/:eventId`.

  * **Verification Check:** Filter events by `Benin City` on `#/explore`, click into `#/event/the-fashion-social`, and click "Select VIP"; verify instant transition to `#/checkout/...`.

## Phase 4: Dynamic Checkout, Institution Directory & Payment Pipeline

*Goal: Implement the 10-minute atomic hold checkout form, Edo State institution capture, server-side payment initialization, and idempotent Paystack webhook (`spec.md` Modules 2–3, `FR-03` to `FR-08`).*

* \[x\] **TASK-401: Build Dynamic Checkout View (`checkoutView.js`) & Edo Institution Selector (`SPEC-CHK-01`)**

  * **Files:** `public/js/views/checkoutView.js`

  * **Action:**

    * Render the 10-minute atomic reservation countdown banner (`formatTimer`).

    * Render quantity selector ($1\text{–}10$), buyer inputs (`Full Name`, `Email`, `Nigerian Phone`), and dynamic server-calculated order summary in NGN.

    * Render the searchable **Edo State Tertiary Institution Directory** (*UNIBEN, BIU, AAU, IUO, EDSU, Wellspring, Mudiame*) plus the `+ Other Institution / Unlisted School` button that reveals a required custom school text input (`FR-03`).

    * Render the mandatory NDPA Privacy Notice & Refund Policy checkbox.

  * **Verification Check:** Select `+ Other Institution`, leave the custom input blank, and submit; verify form validation blocks submission with a clear error message.

* \[x\] **TASK-402: Build Edge Function `initialize-payment` (`SPEC-CHK-02`, `FR-04`) `[PARALLEL]`**

  * **Files:** `supabase/functions/initialize-payment/index.ts`

  * **Action:**

    * Validate request payload, invoke RPC `reserve_marketplace_tickets`, and ignore any client-supplied price.

    * Call Paystack Transaction Initialize API with authoritative `amount_kobo`, `email`, `reference: order_ref`, and optional organizer `subaccount`.

    * Return `{ order_ref, amount_kobo, expires_at, paystack_access_code, paystack_authorization_url }`.

  * **Verification Check:** Send a POST request with a manipulated price field in the body; confirm the returned `amount_kobo` matches the database category price multiplied by quantity.

* \[x\] **TASK-403: Build Edge Function `paystack-webhook` & Resend Email Dispatch (`SPEC-PAY-01`, `FR-05` to `FR-08`) `[PARALLEL]`**

  * **Files:** `supabase/functions/paystack-webhook/index.ts`

  * **Action:**

    * Verify `x-paystack-signature` using Web Crypto HMAC SHA-512 against `PAYSTACK_SECRET_KEY`. Return `401` on mismatch.

    * Enforce idempotency: if `order.status === 'PAID'`, return `200 OK` immediately.

    * Verify `amount` and `currency === 'NGN'`, commit inventory (`reserved_inventory` $\rightarrow$ `sold_inventory`), and mark order `PAID`.

    * Generate unique `tickets` rows (`ticket_number` and opaque `qr_token`).

    * Dispatch **Customer Ticket Email (PRD 23.1)** and **Organizer Sale Notification (PRD 23.2)** via Resend API, logging status in `email_logs`.

  * **Verification Check:** Replay the exact same signed `charge.success` webhook payload twice; verify tickets and revenue are committed only once.

* \[x\] **TASK-404: Wire Paystack Inline Popup & Sandbox Outcome Simulator Modal (`modals.js`)**

  * **Files:** `public/js/components/modals.js`, `public/js/views/checkoutView.js`

  * **Action:**

    * Connect checkout submission to Paystack Inline (`PaystackPop.setup`) when live/test keys are configured, and provide an interactive **Webhook Verification Simulator Modal** (testing `Verified Success`, `Pending Bank Transfer — No Ticket Issued`, and `Declined/Failed Transaction` per `FR-05` & `FR-14`).

    * On verified payment, update store state, generate unique ticket pass, and navigate to `#/ticket/:orderRef`.

  * **Verification Check:** Simulate `Pending Bank Transfer` in checkout; verify no ticket is issued and the user is shown a clear pending status message (`FR-05`). Then simulate `Verified Success` and confirm redirection to `#/ticket/:orderRef`.

## Phase 5: Branded Digital Pass, SVG QR Renderer & Email Previews

*Goal: Render the perforated obsidian-and-gold digital ticket with deterministic SVG QR code and transactional email inspection modals (`constitution.md` Art. V–VI, `design.md` Sec. 5.2).*

* \[x\] **TASK-501: Implement Pure SVG QR Code Generator (`qrGenerator.js`)**

  * **Files:** `public/js/utils/qrGenerator.js`

  * **Action:**

    * Build the deterministic vector SVG QR matrix renderer with finder patterns, high-contrast ivory background, obsidian modules, and center gold `TFS` monogram emblem.

    * Ensure the QR code encodes **only** the opaque `qr_token` and zero raw PII (`constitution.md` Sec. 5.01).

  * **Verification Check:** Render QR codes for two different `qr_token` values; verify distinct SVG matrices and sharp scaling at any zoom level.

* \[x\] **TASK-502: Build Branded Digital Ticket View (`ticketView.js`) & Email Template Previews**

  * **Files:** `public/js/views/ticketView.js`, `public/js/components/modals.js`

  * **Action:**

    * Render the perforated luxury digital pass displaying Order Ref, Event Title, Live Ticket Status Badge (`VERIFIED & UNUSED`, `USED AT GATE`, or `REFUNDED`), Attendee Name, Category, Selected Institution, Unique Ticket Number, and SVG QR Code.

    * Add interactive preview modals for **PRD 23.1 Customer Ticket Email** and **PRD 23.2 Organizer Sale Notification Email**, plus a shortcut button `"Test Gate Scan Now →"` that pre-loads the ticket into `#/scan/:eventId`.

  * **Verification Check:** Complete a checkout for 2 VIP tickets, open `#/ticket/:orderRef`, and verify the ticket number, institution, QR code, and both email previews display accurate data.

## Phase 6: Unified Profile, Event Creation Studio & Admin / Gate Portal

*Goal: Implement the Unified Single Profile, multi-tenant Event Creation Wizard, Organizer Admin Dashboard, Idempotent Resend, and Gate QR Scanner (`spec.md` Modules 4–5, `FR-09` to `FR-13`).*

* \[x\] **TASK-601: Build Unified Profile View (`profileView.js`) & Multi-Event Creation Studio (`createEventView.js`) `[PARALLEL]`**

  * **Files:** `public/js/views/profileView.js`, `public/js/views/createEventView.js`

  * **Action:**

    * In `profileView.js` (`#/profile`), display the unified user identity with two seamless tabs:

      1. **My Tickets Wallet:** All tickets purchased by the user across any event on the platform.

      2. **Organizer Studio & Payouts:** 1-click toggle to enable Organizer mode, configure brand name & Nigerian bank NUBAN / Paystack split subaccount, and manage hosted events.

    * In `createEventView.js` (`#/create-event`), build a luxury form wizard allowing any organizer to publish a new event (Title, Category, City, Venue, Date, Dynamic Ticket Tiers with custom prices/capacities, and custom checkout questions like Institution capture).

  * **Verification Check:** Create a new event in `#/create-event` with 2 custom ticket tiers; verify it immediately appears in `#/explore` and can be purchased end-to-end.

* \[x\] **TASK-602: Build Organizer Admin Dashboard (`adminView.js`) & Idempotent Ticket Resend (`FR-09`, `FR-10`, `FR-13`) `[PARALLEL]`**

  * **Files:** `public/js/views/adminView.js`, `supabase/functions/resend-ticket-email/index.ts`

  * **Action:**

    * Implement the **Least-Privilege Role Switcher** (`Event Administrator`, `Check-In Staff`, `Finance Reviewer`) enforcing `FR-13` visibility rules.

    * Build the 4 admin modules from PRD Section 13:

      1. **Overview & Sales KPIs:** Gross Verified Revenue, Paid Tickets vs Target Capacity, Category Breakdown bars, and Immutable System Audit Log.

      2. **Institution Reach Report (`SPEC-ADM-02`):** Table grouping paid tickets and revenue by selected institution (*UNIBEN, BIU, AAU, IUO, EDSU, Wellspring, Mudiame*, plus custom entries) with audience share progress bars.

      3. **Orders & Idempotent Ticket Resend (`SPEC-ADM-01`):** Search by ticket number, order ref, buyer name, or email; filter by status; click **Resend Email** to re-dispatch via Resend without creating a duplicate ticket or charge (`FR-10`).

      4. **Category & Price Configuration:** Modal allowing only `ADMIN` role to update unit prices and inventory allocations.

  * **Verification Check:** Switch role to `FINANCE`; confirm Category Price Edit and Gate Scanner tabs are hidden. Switch to `ADMIN` and click `Resend Email` on a paid order; confirm `emailRetries` increments by 1, an audit log entry is recorded, and ticket count remains unchanged.

* \[x\] **TASK-603: Build Venue Gate QR Scanner Terminal (`scannerView.js`) & Edge Function (`FR-12`, `SPEC-SCAN-01`)**

  * **Files:** `public/js/views/scannerView.js`, `supabase/functions/verify-ticket-gate/index.ts`

  * **Action:**

    * Build `#/scan/:eventId` supporting both HTML5 camera QR scanning and manual ticket-number/QR-token lookup.

    * Connect to `validate_gate_scan` logic and render high-contrast staff banners for all 4 outcomes:

      * `VALID` (Emerald Banner): Atomically marks ticket `USED` and displays Guest Name, Tier, and Institution.

      * `DUPLICATE` (Amber Warning Banner): Blocks entry and displays exact timestamp and staff ID of first scan.

      * `REFUNDED` / `INVALID` (Crimson Alert Banner): Rejects entry immediately.

    * Include 1-click test scenario buttons (`Unused Ticket`, `Already Used Ticket`, `Refunded Ticket`, `Forged QR Code`) for rapid QA verification.

  * **Verification Check:** Scan an `UNUSED` ticket once $\rightarrow$ verify Emerald `VALID` banner and status change to `USED`. Scan the exact same ticket a second time $\rightarrow$ verify Amber `DUPLICATE SCAN ALERT` banner with original scan timestamp.

## Phase 7: End-to-End QA & PRD Acceptance Verification (`FR-01` to `FR-14`)

*Goal: Validate every requirement in PRD Section 17 & 21 prior to production release.*

* \[x\] **TASK-701: Execute PRD Functional Acceptance Matrix (`FR-01` through `FR-14`)**

  * **Action:** Run through all 14 functional acceptance conditions in `spec.md` and PRD Section 17:

    * Verify mobile & desktop responsiveness (`FR-01`), 4-tier selection (`FR-02`), Edo State + custom institution capture (`FR-03`), server-authoritative pricing (`FR-04`), no ticket before payment verification (`FR-05`), unique ticket & QR generation (`FR-06`), customer & organizer email notifications (`FR-07`, `FR-08`), admin reporting & institution reach (`FR-09`), idempotent ticket resend (`FR-10`), atomic inventory protection (`FR-11`), single-use QR gate validation (`FR-12`), role-based access restrictions (`FR-13`), and explicit failure handling (`FR-14`).

  * **Verification Check:** All 14 acceptance checks pass with zero console errors or unhandled promise rejections.