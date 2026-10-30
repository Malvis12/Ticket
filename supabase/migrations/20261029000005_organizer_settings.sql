-- ============================================================================
-- MIGRATION 5: ORGANIZER EVENT SETTINGS & TIMING CONTROL
-- Moves all event parameters, countdown visibility, and hold durations to organizer control
-- ============================================================================

-- 1. ADD ORGANIZER EVENT SETTINGS COLUMNS
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS reservation_hold_minutes INTEGER DEFAULT 10 CHECK (reservation_hold_minutes >= 3 AND reservation_hold_minutes <= 60),
ADD COLUMN IF NOT EXISTS show_countdown BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_remaining_capacity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS service_fee_mode TEXT DEFAULT 'ABSORB' CHECK (service_fee_mode IN ('ABSORB', 'PASS_TO_BUYER')),
ADD COLUMN IF NOT EXISTS official_notification_email TEXT DEFAULT 'niyasa.events@gmail.com',
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
