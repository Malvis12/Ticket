-- ============================================================================
-- ATOMIC POSTGRESQL RPC FUNCTIONS
-- 1. reserve_marketplace_tickets: High-concurrency row locking & 10-minute hold
-- 2. commit_inventory_on_payment: Atomic inventory finalize & ticket issuance
-- 3. validate_gate_scan: Atomic gate check-in & duplicate guard
-- ============================================================================

-- 1. ATOMIC INVENTORY RESERVATION (Zero-Trust Client Law)
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

    -- Enforce sales window (sales_start / sales_end)
    IF v_category.sales_start IS NOT NULL AND now() < v_category.sales_start THEN
        RAISE EXCEPTION 'Ticket sales have not commenced for this category';
    END IF;
    IF v_category.sales_end IS NOT NULL AND now() > v_category.sales_end THEN
        RAISE EXCEPTION 'Ticket sales have closed for this category';
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

    -- Calculate authoritative server-side price (Zero-Trust Client Law)
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
