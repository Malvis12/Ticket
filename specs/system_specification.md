# SPEC.MD — Functional & System Specification
## Multi-Tenant Event Ticketing & Hosting Marketplace (Version 2.0)
### Flagship Release: The Fashion Social — Style Meets Laughter (NIYASA, Benin City)

---

## 1. Document Overview & SDD Traceability

This `spec.md` defines the exact behavioral, functional, data-contract, and acceptance specifications for the platform under **Spec-Driven Development (SDD)**. Every requirement is deterministically testable and traces directly to `constitution.md` and the baseline Product Requirements Document (PRD).

### 1.1 Glossary & Units of Measure
* **Kobo (`BIGINT`):** All monetary calculations and database storage use integer Kobo ($1\text{ NGN} = 100\text{ Kobo}$).
* **Hold Window:** Exactly $600\text{ seconds}$ ($10\text{ minutes}$) from order creation (`expires_at = created_at + INTERVAL '10 minutes'`).
* **SPA Route:** Client-side hash route (`#/path`) resolved without full browser document reload.

---

## 2. User Roles & State Transitions (Unified Profile)

### 2.1 Profile Capability State Machine
Every authenticated user possesses a single `public.profiles` record. Capabilities are governed by flags and scoped relationships:

```
[ Unauthenticated Visitor ]
       │
       ├──► (Sign In / Sign Up via Supabase Auth)
       ▼
[ Authenticated Profile (Attendee Default: is_organizer = false) ]
       │
       ├──► (Complete Organizer Onboarding: Brand Name + Bank NUBAN)
       ▼
[ Organizer-Enabled Profile (is_organizer = true) ]
       │
       ├──► (Create Event) ──► [ Event Owner (Full CRUD + Reports + Resend + Scanner) ]
       └──► (Assign Staff) ──► [ Event Gate Staff (Scoped strictly to #/scan/:eventId) ]
```

### 2.2 Permission Matrix (`FR-13`)

| Operation / Endpoint | Public Guest | Authenticated Attendee | Event Gate Staff | Event Organizer (Owner) | Platform SuperAdmin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Read `PUBLISHED` Events & Active Tiers | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| Reserve Inventory & Initiate Checkout | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| Read Own Orders & Tickets | via Signed Link | ALLOW | ALLOW | ALLOW | ALLOW |
| Create / Update Own Event & Tiers | DENY | DENY | DENY | ALLOW (Own) | ALLOW (All) |
| View Event Revenue & Institution Report | DENY | DENY | DENY | ALLOW (Own) | ALLOW (All) |
| Trigger Idempotent Ticket Resend (`FR-10`) | DENY | DENY | DENY | ALLOW (Own) | ALLOW (All) |
| Execute Gate Scan (`#/scan/:eventId`) | DENY | DENY | ALLOW (Assigned) | ALLOW (Own) | ALLOW (All) |

---

## 3. Functional Specifications & Acceptance Criteria

### 3.1 Module 1: Marketplace Discovery & Flagship Event Page (`FR-01`, `FR-02`)

#### `SPEC-MKT-01`: Public Event Discovery (`#/`, `#/explore`)
* **Input:** Optional query parameters `{ search, category, city, priceFilter }`.
* **Behavior:**
  1. Query `public.events` where `status = 'PUBLISHED'` ordered by `is_featured DESC, start_time ASC`.
  2. Pin flagship event **The Fashion Social — Style Meets Laughter** (`slug = 'the-fashion-social'`) as the Hero Featured Showcase on `#/`.
  3. Render event cards with instantaneous client-side filtering (< $50\text{ ms}$ DOM update).
* **Acceptance Criteria:**
  * Visitor on mobile ($375\text{ px}$ viewport) and desktop ($1440\text{ px}$ viewport) views the hero banner, equal-prominence **High Couture & Live Comedy** highlights, 3,000-guest capacity progress bar, and 4 ticket categories without horizontal scroll.

#### `SPEC-MKT-02`: Dynamic Event Detail & Tier Display (`#/event/:slug`)
* **Input:** `slug` (string).
* **Behavior:**
  1. Fetch event record and associated `public.ticket_categories` where `is_active = true`.
  2. Compute remaining available capacity per tier:
     $$\text{Available} = \text{total\_inventory} - (\text{sold\_inventory} + \text{reserved\_inventory})$$
  3. If $\text{Available} \le 0$ or current timestamp is outside `[sales_start, sales_end]`, render button as `DISABLED` (`SOLD OUT` or `SALES CLOSED`).
  4. If tier `disclaimer` is non-null (mandatory for **Sit with Influencers & Celebrities**), render the high-visibility amber disclosure block inside the card and at checkout.

---

### 3.2 Module 2: Dynamic Checkout & Edo State Institution Capture (`FR-03`, `FR-04`, `FR-11`)

#### `SPEC-CHK-01`: Institution Directory & Custom Checkout Questions (`#/checkout/:eventId`)
* **Input:** `event_id`, selected `category_id`, `quantity` ($1 \le q \le 10$).
* **Behavior:**
  1. Render standard buyer inputs: `customer_name` (min 2 chars), `customer_email` (RFC 5322 email), `customer_phone` (Nigerian E.164 or local `080/081/070/090/091` format).
  2. Render `event.custom_checkout_questions`. For **The Fashion Social**, render the searchable **Edo State Tertiary Institution Selector**:
     * Pre-populated verified list: *University of Benin (UNIBEN), Benson Idahosa University (BIU), Ambrose Alli University (AAU), Igbinedion University Okada (IUO), Edo State University Uzairue (EDSU), Wellspring University, Mudiame University*.
     * Selecting `+ Other Institution` reveals a required text input (`custom_institution_name`) and normalizes whitespace before submission.
  3. Require explicit checkbox acknowledgment of the Event Terms, Refund Policy, and NDPA Privacy Notice.

#### `SPEC-CHK-02`: Server-Side Price Calculation & Atomic Hold (`POST /functions/v1/initialize-payment`)
* **Request Payload:**
  ```json
  {
    "event_id": "uuid",
    "category_id": "uuid",
    "quantity": 2,
    "customer_name": "Osaze Omoregie",
    "customer_email": "osaze@uniben.edu",
    "customer_phone": "+2348052194401",
    "answers": {
      "institution": "University of Benin (UNIBEN)"
    }
  }
  ```
* **Server Execution Contract:**
  1. Validate input schema. Reject if `quantity < 1` or `quantity > 10`.
  2. Invoke PostgreSQL RPC `reserve_marketplace_tickets`:
     * Acquire row-level lock: `SELECT * FROM public.ticket_categories WHERE id = p_category_id FOR UPDATE`.
     * Reclaim any expired holds where `status = 'PENDING' AND expires_at < now()`.
     * Verify `sold_inventory + reserved_inventory + p_quantity <= total_inventory`. If false, raise `ERR_INSUFFICIENT_INVENTORY` (HTTP `409 Conflict`).
     * Increment `reserved_inventory` by `p_quantity`.
     * Compute authoritative total strictly from DB `price_kobo`:
       $$\text{total\_price\_kobo} = \text{price\_kobo} \times \text{p\_quantity}$$
     * Insert `PENDING` order with `expires_at = now() + INTERVAL '10 minutes'`.
  3. Initialize transaction with Paystack API (`https://api.paystack.co/transaction/initialize`) passing `amount: total_price_kobo`, `currency: "NGN"`, `reference: order_ref`, and `subaccount` (if organizer has a verified split code).
* **Response Payload (HTTP `200 OK`):**
  ```json
  {
    "order_ref": "TFS-ORD-89412",
    "amount_kobo": 9000000,
    "currency": "NGN",
    "expires_at": "2026-10-29T10:15:00Z",
    "paystack_access_code": "acc_xxxx",
    "paystack_authorization_url": "https://checkout.paystack.com/acc_xxxx"
  }
  ```

---

### 3.3 Module 3: Webhook Verification, Ticket Issuance & Email Dispatch (`FR-05`, `FR-06`, `FR-07`, `FR-08`, `FR-14`)

#### `SPEC-PAY-01`: Idempotent Paystack Webhook (`POST /functions/v1/paystack-webhook`)
* **Headers Required:** `x-paystack-signature` (hex-encoded HMAC SHA-512 of raw request body using `PAYSTACK_SECRET_KEY`).
* **Execution Contract:**
  1. **Signature Check:** Compute $\text{HMAC-SHA512}(\text{rawBody}, \text{PAYSTACK\_SECRET\_KEY})$. If mismatch, log security event and return HTTP `401 Unauthorized`.
  2. **Event Filtering:** Inspect `payload.event`.
     * If `charge.success`: proceed to step 3.
     * If `charge.failed` or `transfer.failed`: mark order `FAILED`, release `reserved_inventory`, and return HTTP `200 OK`.
  3. **Idempotency Guard:** Query `public.orders` by `order_ref = payload.data.reference` `FOR UPDATE`.
     * If `order.status === 'PAID'`, immediately return HTTP `200 OK` (`{"status": "idempotent_noop"}`).
  4. **Amount & Currency Verification:** Verify `payload.data.amount === order.total_price_kobo` and `payload.data.currency === 'NGN'`. If mismatch, flag order as `DISPUTED` in `audit_logs` and abort ticket creation.
  5. **Atomic Inventory Commit:**
     * Decrement `reserved_inventory` by `order.quantity`.
     * Increment `sold_inventory` by `order.quantity`.
     * Update `order.status = 'PAID'`, `paid_at = now()`, `payment_reference = payload.data.id`.
  6. **Unique Ticket & QR Token Generation (`FR-06`):**
     * Loop $i = 1 \dots \text{order.quantity}$:
       * Generate human-readable `ticket_number`: `TFS-2026-{TIER_CODE}-{RANDOM_4_DIGIT}-{i}`.
       * Generate high-entropy `qr_token`: `TFS_SIG_{UUIDv4}_{HMAC_SHORT}`.
       * Insert row into `public.tickets` with `status = 'VALID'`.
  7. **Transactional Email Dispatch (`FR-07`, `FR-08`):**
     * Dispatch **Customer Ticket Email (PRD 23.1)** via Resend API to `order.customer_email` and record result in `email_logs`.
     * Dispatch **Organizer Sale Notification (PRD 23.2)** via Resend API to the event's `official_notification_email` and record result in `email_logs`.
     * Note: If Resend API experiences a transient failure, the database transaction for ticket creation **must still succeed**, and `email_logs.status` is set to `'FAILED_PENDING_RETRY'` so the admin can resend via `FR-10`.

---

### 3.4 Module 4: Venue Entry & Atomic QR Gate Scanner (`FR-12`)

#### `SPEC-SCAN-01`: Gate Check-In Validation (`POST /functions/v1/verify-ticket-gate`)
* **Authentication:** Requires valid Supabase JWT belonging to the Event Organizer or an assigned Gate Staff user for `event_id`.
* **Request Payload:**
  ```json
  {
    "event_id": "uuid",
    "scan_input": "TFS_SIG_... or TFS-2026-VVIP-4821"
  }
  ```
* **Deterministic State Table:**

| Current DB Ticket State | RPC Transition | HTTP Status | Response `outcome` | Staff UI Banner & Action |
| :--- | :--- | :---: | :--- | :--- |
| Ticket found, `status = 'VALID'` | Update `status = 'USED'`, insert `check_ins` (`ACCEPTED`) | `200 OK` | `VALID` | **Emerald Green Banner:** "VALID UNUSED TICKET — ADMIT GUEST" + Name, Tier, Institution |
| Ticket found, `status = 'USED'` | No state change, insert `check_ins` (`DUPLICATE`) | `200 OK` | `DUPLICATE` | **Amber/Red Alert Banner:** "ALREADY USED AT `{scanned_at}` BY `{staff_name}` — DO NOT ADMIT" |
| Ticket found, `status = 'REFUNDED'` or `'INVALID'` | No state change, insert `check_ins` (`REVOKED`) | `200 OK` | `REVOKED` | **Crimson Banner:** "CANCELLED / REFUNDED TICKET — REJECT ENTRY" |
| Ticket not found or wrong `event_id` | Insert `check_ins` (`NOT_FOUND`) | `404 Not Found` | `INVALID` | **Crimson Banner:** "UNKNOWN TICKET FOR THIS EVENT — REJECT ENTRY" |

---

### 3.5 Module 5: Admin Dashboard, Institution Analytics & Ticket Recovery (`FR-09`, `FR-10`)

#### `SPEC-ADM-01`: Idempotent Ticket Email Resend (`POST /functions/v1/resend-ticket-email`)
* **Input:** `{ "order_id": "uuid" }` (Authenticated Event Owner or SuperAdmin).
* **Behavior:**
  1. Verify `order.status === 'PAID'`.
  2. Fetch existing rows from `public.tickets` for `order_id`. **Never** generate new ticket numbers, **never** alter `qr_token` values, and **never** charge the buyer again.
  3. Re-dispatch the Customer Ticket Email via Resend API.
  4. Increment `retry_count` in `public.email_logs` and append an entry to `public.audit_logs`.

#### `SPEC-ADM-02`: Institution Reach Aggregation
* **Behavior:** Group all `PAID` orders for an event by `orders.answers->>'institution'`, returning `{ institution_name, tickets_sold, gross_revenue_kobo, percentage_share }` sorted by `gross_revenue_kobo DESC`.

---

## 4. Non-Functional Requirements (NFRs)

1. **Performance (`NFR-01`):**
   * Initial HTML/CSS/JS payload $\le 85\text{ KB}$ gzipped.
   * SPA view transitions (`#/explore` $\rightarrow$ `#/event/the-fashion-social`) complete in $< 16\text{ ms}$ (1 frame) once data is cached in `store.js`.
2. **Concurrency & Scalability (`NFR-02`):**
   * Support $3,000+$ total guests and bursts of $150$ concurrent checkout initializations per second without race conditions or negative inventory.
3. **Security & Privacy (`NFR-03`):**
   * Row-Level Security (RLS) enabled on $100\%$ of `public` tables.
   * Zero secret keys in `public/js/*`.
   * NDPA compliance notice linked in footer and checkout.