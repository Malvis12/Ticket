-- ============================================================================
-- THE FASHION SOCIAL & MULTI-TENANT MARKETPLACE V2.0 SCHEMA
-- Conforming to constitution.md Article VIII & spec.md Module 1-5
-- ============================================================================

-- Enable pgcrypto for high-entropy UUIDs and hash calculations
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Unified Single Profile Axiom - Art. III)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    brand_name TEXT,
    avatar_url TEXT,
    is_organizer BOOLEAN DEFAULT false,
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    paystack_subaccount_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    banner_url TEXT,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    custom_checkout_questions JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'CANCELLED')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TICKET CATEGORIES (TIERS)
CREATE TABLE IF NOT EXISTS public.ticket_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    price_kobo BIGINT NOT NULL CHECK (price_kobo >= 0),
    total_inventory INTEGER NOT NULL CHECK (total_inventory > 0),
    sold_inventory INTEGER NOT NULL DEFAULT 0 CHECK (sold_inventory >= 0),
    reserved_inventory INTEGER NOT NULL DEFAULT 0 CHECK (reserved_inventory >= 0),
    description TEXT,
    perks JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT,
    sales_start TIMESTAMPTZ DEFAULT now(),
    sales_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_inventory_bounds CHECK (sold_inventory + reserved_inventory <= total_inventory)
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref TEXT UNIQUE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
    total_price_kobo BIGINT NOT NULL CHECK (total_price_kobo >= 0),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'DISPUTED')),
    payment_reference TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
    ticket_number TEXT UNIQUE NOT NULL,
    qr_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'USED', 'REVOKED', 'REFUNDED')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CHECK-INS (Gate Admission Audit)
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    staff_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scan_outcome TEXT NOT NULL CHECK (scan_outcome IN ('ACCEPTED', 'DUPLICATE', 'REVOKED', 'NOT_FOUND')),
    raw_scan_input TEXT NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT now()
);

-- 7. AUDIT LOGS (Immutable Operations History)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. EMAIL LOGS (Resend Tracking & Idempotency - FR-07, FR-08, FR-10)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('CUSTOMER_TICKETS', 'ORGANIZER_SALE_ALERT')),
    resend_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'FAILED_PENDING_RETRY')),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- HIGH-CONCURRENCY PERFORMANCE INDEXES (design.md Section 5.1)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_qr_token ON public.tickets (qr_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets (ticket_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_ref ON public.orders (order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_event_status ON public.orders (event_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_pending_expiry ON public.orders (category_id, status, expires_at)
WHERE status = 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_events_published_filter ON public.events (status, category, city, start_time);
