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
