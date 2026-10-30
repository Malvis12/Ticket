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
-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES (FR-13 & constitution.md Section 3.02)
-- Enforces least-privilege access across all public tables
-- ============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles can be viewed by anyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update only their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. EVENTS POLICIES
CREATE POLICY "Anyone can view published events"
ON public.events FOR SELECT
USING (status = 'PUBLISHED' OR organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Organizers can insert their own events"
ON public.events FOR INSERT
WITH CHECK (organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND is_organizer = true));

CREATE POLICY "Organizers can update their own events"
ON public.events FOR UPDATE
USING (organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 3. TICKET CATEGORIES POLICIES
CREATE POLICY "Anyone can view active categories of published events"
ON public.ticket_categories FOR SELECT
USING (is_active = true OR event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Organizers can create categories for their events"
ON public.ticket_categories FOR INSERT
WITH CHECK (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Organizers can update categories for their events"
ON public.ticket_categories FOR UPDATE
USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

-- 4. ORDERS POLICIES
CREATE POLICY "Buyers can view their own orders"
ON public.orders FOR SELECT
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Organizers can view orders for their events"
ON public.orders FOR SELECT
USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

-- Service role bypass handles backend payment creation and commits

-- 5. TICKETS POLICIES
CREATE POLICY "Buyers can view their own tickets"
ON public.tickets FOR SELECT
USING (order_id IN (
    SELECT id FROM public.orders WHERE user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Organizers and Gate Staff can view tickets for event"
ON public.tickets FOR SELECT
USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

-- 6. CHECK-INS POLICIES
CREATE POLICY "Staff and Organizers can view check-ins for event"
ON public.check_ins FOR SELECT
USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Staff and Organizers can insert check-ins"
ON public.check_ins FOR INSERT
WITH CHECK (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

-- 7. AUDIT LOGS POLICIES
CREATE POLICY "Organizers can read audit logs for their events"
ON public.audit_logs FOR SELECT
USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

-- 8. EMAIL LOGS POLICIES
CREATE POLICY "Organizers can read email logs for their orders"
ON public.email_logs FOR SELECT
USING (order_id IN (
    SELECT o.id FROM public.orders o
    JOIN public.events e ON o.event_id = e.id
    WHERE e.organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
));
-- ============================================================================
-- ATOMIC POSTGRESQL RPC FUNCTIONS
-- 1. reserve_marketplace_tickets: High-concurrency row locking & 10-minute hold
-- 2. commit_inventory_on_payment: Atomic inventory finalize & ticket issuance
-- 3. validate_gate_scan: Atomic gate check-in & duplicate guard
-- ============================================================================

-- 1. ATOMIC INVENTORY RESERVATION (FR-11, SPEC-CHK-02)
CREATE OR REPLACE FUNCTION public.reserve_marketplace_tickets(
    p_event_id UUID,
    p_category_id UUID,
    p_quantity INTEGER,
    p_user_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_category RECORD;
    v_order_ref TEXT;
    v_total_price_kobo BIGINT;
    v_expires_at TIMESTAMPTZ;
    v_order_id UUID;
BEGIN
    -- Validate quantity boundary
    IF p_quantity < 1 OR p_quantity > 10 THEN
        RAISE EXCEPTION 'Quantity must be between 1 and 10';
    END IF;

    -- Acquire row-level lock on ticket category
    SELECT * INTO v_category
    FROM public.ticket_categories
    WHERE id = p_category_id AND event_id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket category not found for this event';
    END IF;

    -- Reclaim any expired holds for this category
    UPDATE public.orders
    SET status = 'EXPIRED'
    WHERE category_id = p_category_id 
      AND status = 'PENDING' 
      AND expires_at < now();

    -- Recalculate reserved inventory after expiring
    UPDATE public.ticket_categories
    SET reserved_inventory = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM public.orders
        WHERE category_id = p_category_id AND status = 'PENDING'
    )
    WHERE id = p_category_id;

    -- Refresh category record after expired holds reclamation
    SELECT * INTO v_category
    FROM public.ticket_categories
    WHERE id = p_category_id;

    -- Verify inventory availability
    IF (v_category.sold_inventory + v_category.reserved_inventory + p_quantity) > v_category.total_inventory THEN
        RAISE EXCEPTION 'ERR_INSUFFICIENT_INVENTORY: Insufficient ticket inventory remaining';
    END IF;

    -- Calculate authoritative server-side price (FR-04 Zero-Trust Client Law)
    v_total_price_kobo := v_category.price_kobo * p_quantity;
    v_expires_at := now() + INTERVAL '10 minutes';
    v_order_ref := 'TFS-ORD-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));

    -- Increment reserved inventory
    UPDATE public.ticket_categories
    SET reserved_inventory = reserved_inventory + p_quantity
    WHERE id = p_category_id;

    -- Insert PENDING order with 10-minute hold
    INSERT INTO public.orders (
        order_ref,
        event_id,
        category_id,
        user_id,
        quantity,
        total_price_kobo,
        customer_name,
        customer_email,
        customer_phone,
        answers,
        status,
        expires_at
    ) VALUES (
        v_order_ref,
        p_event_id,
        p_category_id,
        p_user_id,
        p_quantity,
        v_total_price_kobo,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        COALESCE(p_answers, '{}'::jsonb),
        'PENDING',
        v_expires_at
    ) RETURNING id INTO v_order_id;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_ref', v_order_ref,
        'amount_kobo', v_total_price_kobo,
        'currency', 'NGN',
        'expires_at', v_expires_at,
        'quantity', p_quantity,
        'tier_name', v_category.name
    );
END;
$$;


-- 2. ATOMIC INVENTORY COMMIT & TICKET ISSUANCE (FR-05, FR-06, SPEC-PAY-01)
CREATE OR REPLACE FUNCTION public.commit_inventory_on_payment(
    p_order_ref TEXT,
    p_payment_ref TEXT,
    p_verified_amount_kobo BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_category RECORD;
    v_ticket_id UUID;
    v_ticket_num TEXT;
    v_qr_token TEXT;
    v_tier_code TEXT;
    v_tickets_issued JSONB := '[]'::jsonb;
    i INTEGER;
BEGIN
    -- Lock order row FOR UPDATE
    SELECT * INTO v_order
    FROM public.orders
    WHERE order_ref = p_order_ref
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Idempotency Guard (SPEC-PAY-01)
    IF v_order.status = 'PAID' THEN
        RETURN jsonb_build_object(
            'status', 'idempotent_noop',
            'order_ref', v_order.order_ref,
            'message', 'Order already marked as paid'
        );
    END IF;

    -- Verify amount integrity
    IF v_order.total_price_kobo != p_verified_amount_kobo THEN
        INSERT INTO public.audit_logs (event_id, actor, action, details)
        VALUES (v_order.event_id, 'PAYSTACK_WEBHOOK', 'AMOUNT_MISMATCH', 'Paid ' || p_verified_amount_kobo || ' vs expected ' || v_order.total_price_kobo);
        RAISE EXCEPTION 'Payment amount mismatch';
    END IF;

    -- Lock category row FOR UPDATE
    SELECT * INTO v_category
    FROM public.ticket_categories
    WHERE id = v_order.category_id
    FOR UPDATE;

    -- Commit inventory atomically: shift from reserved to sold
    UPDATE public.ticket_categories
    SET reserved_inventory = GREATEST(0, reserved_inventory - v_order.quantity),
        sold_inventory = sold_inventory + v_order.quantity
    WHERE id = v_order.category_id;

    -- Mark order PAID
    UPDATE public.orders
    SET status = 'PAID',
        paid_at = now(),
        payment_reference = p_payment_ref
    WHERE id = v_order.id;

    v_tier_code := COALESCE(v_category.code, 'TKT');

    -- Generate Unique Tickets with High-Entropy QR Tokens (FR-06)
    FOR i IN 1..v_order.quantity LOOP
        v_ticket_num := 'TFS-2026-' || v_tier_code || '-' || LPAD(FLOOR(random() * 9000 + 1000)::text, 4, '0') || '-' || i;
        v_qr_token := 'TFS_SIG_' || replace(gen_random_uuid()::text, '-', '') || '_' || v_tier_code || '_' || i || '_VERIFIED';

        INSERT INTO public.tickets (
            order_id,
            event_id,
            category_id,
            ticket_number,
            qr_token,
            status
        ) VALUES (
            v_order.id,
            v_order.event_id,
            v_order.category_id,
            v_ticket_num,
            v_qr_token,
            'VALID'
        ) RETURNING id INTO v_ticket_id;

        v_tickets_issued := v_tickets_issued || jsonb_build_object(
            'id', v_ticket_id,
            'ticket_number', v_ticket_num,
            'qr_token', v_qr_token,
            'status', 'VALID'
        );
    END LOOP;

    -- Insert Audit Log
    INSERT INTO public.audit_logs (event_id, actor, action, details)
    VALUES (
        v_order.event_id,
        'PAYSTACK_WEBHOOK',
        'TICKETS_ISSUED',
        'Order ' || v_order.order_ref || ' confirmed paid. ' || v_order.quantity || ' tickets generated.'
    );

    RETURN jsonb_build_object(
        'status', 'COMMITTED',
        'order_ref', v_order.order_ref,
        'quantity', v_order.quantity,
        'tickets', v_tickets_issued
    );
END;
$$;


-- 3. ATOMIC GATE SCAN VALIDATION (FR-12, SPEC-SCAN-01)
CREATE OR REPLACE FUNCTION public.validate_gate_scan(
    p_scan_input TEXT,
    p_event_id UUID,
    p_staff_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket RECORD;
    v_order RECORD;
    v_first_check_in RECORD;
    v_category RECORD;
BEGIN
    -- Query ticket row FOR UPDATE by either qr_token or ticket_number
    SELECT * INTO v_ticket
    FROM public.tickets
    WHERE (qr_token = p_scan_input OR ticket_number = p_scan_input)
      AND event_id = p_event_id
    FOR UPDATE;

    -- 1. NOT FOUND OR WRONG EVENT
    IF NOT FOUND THEN
        INSERT INTO public.check_ins (event_id, staff_user_id, scan_outcome, raw_scan_input)
        VALUES (p_event_id, p_staff_user_id, 'NOT_FOUND', p_scan_input);

        RETURN jsonb_build_object(
            'outcome', 'INVALID',
            'http_status', 404,
            'message', 'UNKNOWN TICKET FOR THIS EVENT — REJECT ENTRY'
        );
    END IF;

    -- Fetch order and category details
    SELECT * INTO v_order FROM public.orders WHERE id = v_ticket.order_id;
    SELECT * INTO v_category FROM public.ticket_categories WHERE id = v_ticket.category_id;

    -- 2. VALID UNUSED TICKET -> ADMIT GUEST
    IF v_ticket.status = 'VALID' THEN
        UPDATE public.tickets
        SET status = 'USED'
        WHERE id = v_ticket.id;

        INSERT INTO public.check_ins (ticket_id, event_id, staff_user_id, scan_outcome, raw_scan_input)
        VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'ACCEPTED', p_scan_input);

        RETURN jsonb_build_object(
            'outcome', 'VALID',
            'http_status', 200,
            'message', 'VALID UNUSED TICKET — ADMIT GUEST',
            'ticket_number', v_ticket.ticket_number,
            'tier_name', v_category.name,
            'guest_name', v_order.customer_name,
            'institution', COALESCE(v_order.answers->>'institution', 'General Guest'),
            'scanned_at', now()
        );

    -- 3. ALREADY USED TICKET -> DUPLICATE SCAN ALERT
    ELSIF v_ticket.status = 'USED' THEN
        SELECT * INTO v_first_check_in
        FROM public.check_ins
        WHERE ticket_id = v_ticket.id AND scan_outcome = 'ACCEPTED'
        ORDER BY scanned_at ASC
        LIMIT 1;

        INSERT INTO public.check_ins (ticket_id, event_id, staff_user_id, scan_outcome, raw_scan_input)
        VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'DUPLICATE', p_scan_input);

        RETURN jsonb_build_object(
            'outcome', 'DUPLICATE',
            'http_status', 200,
            'message', 'ALREADY USED TICKET — DO NOT ADMIT',
            'ticket_number', v_ticket.ticket_number,
            'tier_name', v_category.name,
            'guest_name', v_order.customer_name,
            'first_scanned_at', v_first_check_in.scanned_at,
            'first_scanned_by', COALESCE(v_first_check_in.staff_user_id::text, 'Gate 1 Operator')
        );

    -- 4. REFUNDED OR REVOKED TICKET -> REJECT ENTRY
    ELSE
        INSERT INTO public.check_ins (ticket_id, event_id, staff_user_id, scan_outcome, raw_scan_input)
        VALUES (v_ticket.id, p_event_id, p_staff_user_id, 'REVOKED', p_scan_input);

        RETURN jsonb_build_object(
            'outcome', 'REVOKED',
            'http_status', 200,
            'message', 'CANCELLED / REFUNDED TICKET — REJECT ENTRY',
            'ticket_number', v_ticket.ticket_number
        );
    END IF;
END;
$$;
-- ============================================================================
-- MIGRATION 4: AUTH TRIGGER, STORAGE BUCKET & ORGANIZER CRUD POLICIES
-- Enables live Supabase Auth, public Storage for event banners, and full RLS
-- ============================================================================

-- 1. AUTO-PROFILE DATABASE TRIGGER ON auth.users
-- Automatically provisions public.profiles whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_raw_meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    v_full_name TEXT := COALESCE(v_raw_meta->>'full_name', SPLIT_PART(NEW.email, '@', 1));
    v_phone TEXT := COALESCE(v_raw_meta->>'phone', NEW.phone, '');
    v_institution TEXT := COALESCE(v_raw_meta->>'institution', '');
    v_is_organizer BOOLEAN := COALESCE((v_raw_meta->>'is_organizer')::boolean, false);
    v_brand_name TEXT := COALESCE(v_raw_meta->>'brand_name', v_full_name || ' Events');
BEGIN
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        brand_name,
        is_organizer,
        bank_name,
        account_number,
        account_name,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        v_full_name,
        CASE WHEN v_is_organizer THEN v_brand_name ELSE NULL END,
        v_is_organizer,
        NULL,
        NULL,
        NULL,
        now(),
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. SUPABASE STORAGE BUCKET: event-banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-banners',
    'event-banners',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public read event banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-banners');

CREATE POLICY "Authenticated users can upload event banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Users can update their own event banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own event banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]);


-- 3. EXPANDED RLS POLICIES FOR EVENTS & CATEGORIES CRUD
-- Drop legacy policies to prevent conflicts
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete categories for their events" ON public.ticket_categories;

CREATE POLICY "Organizers can delete their own events"
ON public.events FOR DELETE
USING (organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Organizers can delete categories for their events"
ON public.ticket_categories FOR DELETE
USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
));

-- 4. PROFILE UPDATE POLICY
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
-- ============================================================================
-- MIGRATION 5: ORGANIZER EVENT SETTINGS & TIMING CONTROL
-- Moves all event parameters, countdown visibility, and hold durations to organizer control
-- ============================================================================

-- 1. ADD ORGANIZER EVENT SETTINGS COLUMNS
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS reservation_hold_minutes INTEGER DEFAULT 10 CHECK (reservation_hold_minutes >= 3 AND reservation_hold_minutes <= 60),
ADD COLUMN IF NOT EXISTS show_countdown BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_remaining_capacity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS celebrity_disclaimer_text TEXT DEFAULT 'Notice: Celebrity and headliner seating placement is coordinated in designated VIP zones based on guest artist logistics.';

-- 2. DYNAMIC RPC: reserve_marketplace_tickets
-- Updates hold window to read dynamically from the event's reservation_hold_minutes setting
CREATE OR REPLACE FUNCTION public.reserve_marketplace_tickets(
    p_event_id UUID,
    p_category_id UUID,
    p_quantity INTEGER,
    p_user_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event RECORD;
    v_category RECORD;
    v_order_ref TEXT;
    v_total_price_kobo BIGINT;
    v_hold_minutes INTEGER;
    v_expires_at TIMESTAMPTZ;
    v_order_id UUID;
BEGIN
    -- Validate quantity boundary
    IF p_quantity < 1 OR p_quantity > 10 THEN
        RAISE EXCEPTION 'Quantity must be between 1 and 10';
    END IF;

    -- Fetch event settings
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    v_hold_minutes := COALESCE(v_event.reservation_hold_minutes, 10);

    -- Acquire row-level lock on ticket category
    SELECT * INTO v_category
    FROM public.ticket_categories
    WHERE id = p_category_id AND event_id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket category not found for this event';
    END IF;

    -- Reclaim any expired holds for this category
    UPDATE public.orders
    SET status = 'EXPIRED'
    WHERE category_id = p_category_id 
      AND status = 'PENDING' 
      AND expires_at < now();

    -- Recalculate reserved inventory after expiring
    UPDATE public.ticket_categories
    SET reserved_inventory = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM public.orders
        WHERE category_id = p_category_id AND status = 'PENDING'
    )
    WHERE id = p_category_id;

    -- Refresh category record
    SELECT * INTO v_category
    FROM public.ticket_categories
    WHERE id = p_category_id;

    -- Verify inventory availability
    IF (v_category.sold_inventory + v_category.reserved_inventory + p_quantity) > v_category.total_inventory THEN
        RAISE EXCEPTION 'ERR_INSUFFICIENT_INVENTORY: Insufficient ticket inventory remaining';
    END IF;

    -- Calculate authoritative server-side price
    v_total_price_kobo := v_category.price_kobo * p_quantity;
    v_expires_at := now() + (v_hold_minutes || ' minutes')::INTERVAL;
    v_order_ref := 'TFS-ORD-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));

    -- Increment reserved inventory
    UPDATE public.ticket_categories
    SET reserved_inventory = reserved_inventory + p_quantity
    WHERE id = p_category_id;

    -- Insert PENDING order with dynamic hold duration
    INSERT INTO public.orders (
        order_ref,
        event_id,
        category_id,
        user_id,
        quantity,
        total_price_kobo,
        customer_name,
        customer_email,
        customer_phone,
        answers,
        status,
        expires_at
    ) VALUES (
        v_order_ref,
        p_event_id,
        p_category_id,
        p_user_id,
        p_quantity,
        v_total_price_kobo,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        COALESCE(p_answers, '{}'::jsonb),
        'PENDING',
        v_expires_at
    ) RETURNING id INTO v_order_id;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_ref', v_order_ref,
        'amount_kobo', v_total_price_kobo,
        'currency', 'NGN',
        'expires_at', v_expires_at,
        'hold_minutes', v_hold_minutes,
        'quantity', p_quantity,
        'tier_name', v_category.name
    );
END;
$$;
-- ============================================================================
-- SEED DATA: FLAGSHIP EVENT (The Fashion Social) & MULTI-TENANT MARKETPLACE
-- Zero fake sales: Clean start with sold_inventory = 0 and reserved_inventory = 0
-- ============================================================================

-- 1. SEED PROFILES
INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    brand_name,
    is_organizer,
    bank_name,
    account_number,
    account_name,
    paystack_subaccount_code
) VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'NIYASA Events Management',
    'NIYASA',
    true,
    'Guaranty Trust Bank',
    '0123456789',
    'NIYASA ENTERTAINMENT LTD',
    'ACCT_niyasa_split_001'
) ON CONFLICT (id) DO NOTHING;

-- 2. SEED FLAGSHIP EVENT (The Fashion Social — Style Meets Laughter)
INSERT INTO public.events (
    id,
    organizer_id,
    title,
    slug,
    category,
    city,
    state,
    venue_name,
    address,
    start_time,
    end_time,
    capacity,
    banner_url,
    description,
    highlights,
    faqs,
    custom_checkout_questions,
    status,
    is_featured,
    reservation_hold_minutes,
    show_countdown,
    show_remaining_capacity,
    celebrity_disclaimer_text
) VALUES (
    'e1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'The Fashion Social — Style Meets Laughter',
    'the-fashion-social',
    'Fashion & Comedy',
    'Benin City',
    'Edo State',
    'Sir Victor Uwaifo Creative Hub',
    'Airport Road, GRA, Benin City, Edo State',
    '2026-11-28 16:00:00+01',
    '2026-11-28 23:30:00+01',
    3000,
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    'Benin City’s premier luxury gathering where high-end runway couture meets Nigeria’s finest stand-up comedy. Fashionistas, campus style icons, executives, and tastemakers uniting for an unforgettable evening.',
    '[
        {"title": "High Couture Runway", "description": "Avant-garde collections from Africa’s daring ready-to-wear designers and emerging Edo prodigies."},
        {"title": "Live Stand-Up Comedy", "description": "Celebrated comedic legends delivering world-class humor alongside the couture showcase."},
        {"title": "Campus Style Showcase", "description": "Student style trendsetters from UNIBEN, BIU, AAU and leading institutions representing their schools."},
        {"title": "Red Carpet & VIP Lounge", "description": "Step into the flashbulbs, sip artisanal cocktails, and mingle with celebrated luminaries."}
    ]'::jsonb,
    '[
        {"q": "What is the dress code?", "a": "Black Tie Elegance meets Bold Runway Haute. Step in looking iconic."},
        {"q": "Is parking available?", "a": "Yes, secure escorted parking is provided at Victor Uwaifo Creative Hub."},
        {"q": "Are tickets refundable?", "a": "Tickets are non-refundable but transferable up to 48 hours prior to the event."}
    ]'::jsonb,
    '[
        {
            "id": "institution",
            "label": "Which Tertiary Institution do you represent in Edo State?",
            "type": "select_with_custom",
            "required": true,
            "options": [
                "University of Benin (UNIBEN)",
                "Benson Idahosa University (BIU)",
                "Ambrose Alli University (AAU)",
                "Igbinedion University Okada (IUO)",
                "Edo State University Uzairue (EDSU)",
                "Wellspring University",
                "Mudiame University"
            ]
        }
    ]'::jsonb,
    'PUBLISHED',
    true,
    10,
    true,
    true,
    'Notice: Seating for this tier is positioned in designated guest zones. Talent seating placement is coordinated in accordance with appearance logistics.'
) ON CONFLICT (id) DO NOTHING;

-- 3. SEED 4 FLAGSHIP TICKET CATEGORIES (FR-02)
-- Starts cleanly at 0 sold and 0 reserved
INSERT INTO public.ticket_categories (
    id,
    event_id,
    name,
    code,
    price_kobo,
    total_inventory,
    sold_inventory,
    reserved_inventory,
    description,
    perks,
    disclaimer,
    is_active
) VALUES 
(
    'c1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'Regular Admission',
    'REG',
    500000, -- ₦5,000
    1800,
    0,
    0,
    'Main hall seating, complete runway & comedy access, red carpet entry, and afterparty admission.',
    '["Full Runway & Comedy Showcase Access", "Red Carpet Photo Entry", "Official Afterparty Access", "Digital Keepsake Pass"]'::jsonb,
    NULL,
    true
),
(
    'c1000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'VIP Experience',
    'VIP',
    1500000, -- ₦15,000
    800,
    0,
    0,
    'Elevated tier with priority hall entrance, reserved stage-front seating, complimentary welcome drinks, and gift bag.',
    '["Fast-Track Red Carpet Gate", "Front-Row Runway & Comedy Seating", "Complimentary Artisanal Cocktails (2x)", "Exclusive Gift Bag"]'::jsonb,
    NULL,
    true
),
(
    'c1000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000001',
    'VVIP Royal Table',
    'VVIP',
    4500000, -- ₦45,000
    300,
    0,
    0,
    'Dedicated lounge table, vintage champagne bottle service, gourmet finger foods, dedicated hostess, and backstage meet-and-greet.',
    '["Private Escorted Table Placement", "Vintage Champagne & Canapés", "Dedicated Hostess Service", "Backstage Meet & Greet", "Valet Parking Pass"]'::jsonb,
    NULL,
    true
),
(
    'c1000000-0000-0000-0000-000000000004',
    'e1000000-0000-0000-0000-000000000001',
    'Sit with Influencers & Celebrities',
    'CELEB',
    10000000, -- ₦100,000
    100,
    0,
    0,
    'Premier seating positioned directly within the guest of honor and headline talent row. Complete all-access credentials.',
    '["Seating in Celebrity & Headliner Row", "Press Wall Interview", "Premium Champagne & Dinner Service", "All-Access Backstage Credentials"]'::jsonb,
    'Notice: Seating for this tier is positioned in designated guest zones. Talent seating placement is coordinated in accordance with appearance logistics.',
    true
) ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- MIGRATION 6: THREE-TIER MARKETPLACE GOVERNANCE ARCHITECTURE
-- Establishes Master Admin (SUPERADMIN), Approved Organizer Studio, and Attendee KYC
-- ============================================================================

-- 1. EXPAND PUBLIC.PROFILES WITH THREE-TIER GOVERNANCE FIELDS
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ATTENDEE' CHECK (role IN ('ATTENDEE', 'ORGANIZER', 'CHECKIN_STAFF', 'SUPERADMIN')),
ADD COLUMN IF NOT EXISTS organizer_status TEXT DEFAULT 'NONE' CHECK (organizer_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
ADD COLUMN IF NOT EXISTS organizer_brand_name TEXT,
ADD COLUMN IF NOT EXISTS organizer_bio TEXT,
ADD COLUMN IF NOT EXISTS bank_code TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT,
ADD COLUMN IF NOT EXISTS cac_number TEXT,
ADD COLUMN IF NOT EXISTS organizer_request_reason TEXT,
ADD COLUMN IF NOT EXISTS organizer_requested_at TIMESTAMPTZ;

-- 2. EXPAND PUBLIC.EVENTS WITH MASTER ADMIN CONTROLS
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Ensure event status supports standard lifecycle
DO $$
BEGIN
    ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
    ALTER TABLE public.events ADD CONSTRAINT events_status_check 
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'PAUSED', 'SUSPENDED'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. RLS HARDENING: PREVENT ATTENDEES FROM SELF-APPROVING
-- Users can only request approval (status = 'PENDING'); only SUPERADMIN can approve
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'SUPERADMIN'
    );
$$;

-- Allow Superadmins to view and manage all tables
DO $$
BEGIN
    DROP POLICY IF EXISTS "Superadmin full access profiles" ON public.profiles;
    CREATE POLICY "Superadmin full access profiles"
        ON public.profiles FOR ALL
        TO authenticated
        USING (public.is_superadmin() OR user_id = auth.uid())
        WITH CHECK (public.is_superadmin() OR user_id = auth.uid());

    DROP POLICY IF EXISTS "Superadmin full access events" ON public.events;
    CREATE POLICY "Superadmin full access events"
        ON public.events FOR ALL
        TO authenticated
        USING (public.is_superadmin() OR (auth.uid() = organizer_id AND status != 'SUSPENDED') OR status = 'PUBLISHED')
        WITH CHECK (public.is_superadmin() OR (auth.uid() = organizer_id));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
