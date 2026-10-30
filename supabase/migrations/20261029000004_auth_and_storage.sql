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
