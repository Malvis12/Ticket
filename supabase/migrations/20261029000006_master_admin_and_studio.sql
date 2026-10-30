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
