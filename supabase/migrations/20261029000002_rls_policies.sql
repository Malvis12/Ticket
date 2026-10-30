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
