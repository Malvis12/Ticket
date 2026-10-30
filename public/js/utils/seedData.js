/**
 * Verified Edo State Tertiary Institutions and Seed Data
 * Starts cleanly with 0 sales and genuine data calculation
 */

export const EDO_INSTITUTIONS = [
  'University of Benin (UNIBEN)',
  'Benson Idahosa University (BIU)',
  'Ambrose Alli University (AAU)',
  'Igbinedion University Okada (IUO)',
  'Edo State University Uzairue (EDSU)',
  'Wellspring University',
  'Mudiame University'
];

export const INITIAL_EVENTS = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    slug: 'the-fashion-social',
    title: 'The Fashion Social — Style Meets Laughter',
    organizer: 'NIYASA Events',
    organizer_id: 'a1000000-0000-0000-0000-000000000001',
    category: 'Fashion & Comedy',
    city: 'Benin City',
    state: 'Edo State',
    venue_name: 'Sir Victor Uwaifo Creative Hub',
    address: 'Airport Road, GRA, Benin City, Edo State',
    start_time: '2026-11-28T16:00:00+01:00',
    end_time: '2026-11-28T23:30:00+01:00',
    capacity: 3000,
    banner_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    description: 'Benin City’s premier luxury gathering where high-end runway couture seamlessly meets Nigeria’s finest stand-up comedy. Fashionistas, campus style icons, executives, and tastemakers uniting for an unforgettable evening of glamour, wit, and high culture.',
    highlights: [
      {
        title: 'High Couture Runway',
        description: 'Avant-garde collections from Africa’s daring ready-to-wear designers and emerging Edo prodigies.'
      },
      {
        title: 'Live Stand-Up Comedy',
        description: 'Elite comedic legends delivering world-class humor alongside the couture showcase.'
      },
      {
        title: 'Campus Style Showcase',
        description: 'Student style trendsetters from UNIBEN, BIU, AAU and leading institutions representing their schools.'
      },
      {
        title: 'Red Carpet & VIP Lounge',
        description: 'Step into the flashbulbs, sip artisanal cocktails, and mingle with celebrated luminaries.'
      }
    ],
    faqs: [
      {
        q: 'What is the dress code?',
        a: 'Black Tie Elegance meets Bold Runway Haute. Step in looking iconic. Traditional regal attire is equally celebrated.'
      },
      {
        q: 'Is parking available at the venue?',
        a: 'Yes, secure escorted parking is provided at Victor Uwaifo Creative Hub with priority parking spaces for VIP and VVIP ticket holders.'
      },
      {
        q: 'Are tickets refundable?',
        a: 'Tickets are non-refundable but transferable up to 48 hours prior to the event via the organizer support portal.'
      }
    ],
    is_featured: true,
    status: 'PUBLISHED',
    reservation_hold_minutes: 10,
    show_countdown: true,
    show_remaining_capacity: true,
    celebrity_disclaimer_text: 'Notice: Seating for this tier is positioned in designated guest zones. Talent seating placement is coordinated in accordance with appearance logistics.',
    ticket_categories: [
      {
        id: 'c1000000-0000-0000-0000-000000000001',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'Regular Admission',
        code: 'REG',
        price_kobo: 500000, // ₦5,000
        total_inventory: 1800,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: 'Main hall seating, complete runway & comedy access, red carpet photo-ops, and official afterparty entry.',
        perks: [
          'Full Runway & Comedy Showcase Access',
          'Red Carpet Photo Entry',
          'Official Afterparty Access',
          'Digital Keepsake Pass'
        ],
        disclaimer: null,
        is_active: true
      },
      {
        id: 'c1000000-0000-0000-0000-000000000002',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'VIP Experience',
        code: 'VIP',
        price_kobo: 1500000, // ₦15,000
        total_inventory: 800,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: 'Elevated tier with priority hall entrance, reserved stage-front seating, complimentary welcome drinks, and luxury gift bag.',
        perks: [
          'Fast-Track Red Carpet Gate',
          'Front-Row Runway & Comedy Seating',
          'Complimentary Artisanal Cocktails (2x)',
          'Exclusive Fashion Social Gift Bag'
        ],
        disclaimer: null,
        is_active: true
      },
      {
        id: 'c1000000-0000-0000-0000-000000000003',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'VVIP Royal Table',
        code: 'VVIP',
        price_kobo: 4500000, // ₦45,000
        total_inventory: 300,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: 'Dedicated lounge table, vintage champagne bottle service, gourmet finger foods, dedicated hostess, and backstage designer meet-and-greet.',
        perks: [
          'Private Escorted Table Placement',
          'Vintage Champagne & Canapés',
          'Dedicated Hostess Service',
          'Backstage VIP Meet & Greet',
          'Valet Parking Pass Included'
        ],
        disclaimer: null,
        is_active: true
      },
      {
        id: 'c1000000-0000-0000-0000-000000000004',
        event_id: 'e1000000-0000-0000-0000-000000000001',
        name: 'Sit with Influencers & Celebrities',
        code: 'CELEB',
        price_kobo: 10000000, // ₦100,000
        total_inventory: 100,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: 'Ultra-exclusive premier seating positioned directly within the guest of honor and headline talent row. Complete all-access credentials.',
        perks: [
          'Direct Seating in Celebrity Row',
          'Press Wall Interview & Feature',
          'Premium Champagne & Dinner Service',
          'Signed Fashion Keepsake Program',
          'VIP Backstage Credentials'
        ],
        disclaimer: 'Notice: Seating for this tier is positioned in designated guest zones. Talent seating placement is coordinated in accordance with appearance logistics.',
        is_active: true
      }
    ],
    custom_checkout_questions: [
      {
        id: 'institution',
        label: 'Which Tertiary Institution do you represent in Edo State?',
        type: 'select_with_custom',
        required: true,
        options: EDO_INSTITUTIONS
      }
    ]
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    slug: 'benin-tech-creatives-summit',
    title: 'Benin Tech & Creative Summit 2026',
    organizer: 'Edo Innovates & TechHub Benin',
    organizer_id: 'a1000000-0000-0000-0000-000000000002',
    category: 'Tech',
    city: 'Benin City',
    state: 'Edo State',
    venue_name: 'Edo Innovates Hub, ICE Road',
    address: 'Wire Road, Benin City',
    start_time: '2026-12-05T09:00:00+01:00',
    end_time: '2026-12-05T18:00:00+01:00',
    capacity: 1000,
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    description: 'Empowering the next generation of West African software engineers, designers, founders, and digital storytellers.',
    highlights: [],
    faqs: [],
    is_featured: false,
    status: 'PUBLISHED',
    reservation_hold_minutes: 10,
    show_countdown: true,
    show_remaining_capacity: true,
    celebrity_disclaimer_text: null,
    ticket_categories: [
      {
        id: 'c2000000-0000-0000-0000-000000000001',
        name: 'Early Techie Pass',
        code: 'TECH-REG',
        price_kobo: 300000,
        total_inventory: 800,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: 'All keynote access, workshop entry, and lunch pack.',
        perks: ['Keynotes', 'Hands-on Workshops', 'Lunch Voucher'],
        disclaimer: null,
        is_active: true
      },
      {
        id: 'c2000000-0000-0000-0000-000000000002',
        name: 'Founder & Investor Access',
        code: 'TECH-VIP',
        price_kobo: 2000000,
        total_inventory: 200,
        sold_inventory: 0,
        reserved_inventory: 0,
        description: 'Private deal-room networking, VIP breakfast, and demo day voting.',
        perks: ['Deal Room', 'Founder Breakfast', 'Pitch Deck Directory'],
        disclaimer: null,
        is_active: true
      }
    ],
    custom_checkout_questions: []
  }
];

export const INITIAL_ORDERS = [];
export const INITIAL_AUDIT_LOGS = [];

export const INITIAL_USERS = {
  superadmin: {
    user: {
      id: 'usr_superadmin_01',
      email: 'admin@platform.ng',
      user_metadata: {
        full_name: 'Platform Master Admin',
        role: 'SUPERADMIN'
      }
    },
    profile: {
      id: 'prf_superadmin_01',
      user_id: 'usr_superadmin_01',
      full_name: 'Platform Master Admin',
      role: 'SUPERADMIN',
      organizer_status: 'APPROVED',
      is_organizer: true,
      brand_name: 'TFS Platform Governance',
      cac_number: 'RC-000001',
      bank_name: 'First Bank of Nigeria',
      account_number: '0123456789',
      account_name: 'TFS Platform Operations',
      created_at: '2026-01-01T00:00:00Z'
    }
  },
  organizer: {
    user: {
      id: 'a1000000-0000-0000-0000-000000000001',
      email: 'niyasa@fashionsocial.ng',
      user_metadata: {
        full_name: 'NIYASA Events Director',
        role: 'ORGANIZER'
      }
    },
    profile: {
      id: 'prf_organizer_01',
      user_id: 'a1000000-0000-0000-0000-000000000001',
      full_name: 'NIYASA Events Director',
      role: 'ORGANIZER',
      organizer_status: 'APPROVED',
      is_organizer: true,
      brand_name: 'NIYASA Events & Productions',
      cac_number: 'RC-1849204',
      bank_name: 'Zenith Bank',
      account_number: '1012345678',
      account_name: 'NIYASA Events Ltd',
      organizer_bio: 'Curators of luxury runway couture and comedy events in Edo State.',
      created_at: '2026-02-15T10:00:00Z'
    }
  },
  attendee: {
    user: {
      id: 'usr_attendee_01',
      email: 'guest@uniben.edu',
      user_metadata: {
        full_name: 'Obadoni Malvis',
        role: 'ATTENDEE'
      }
    },
    profile: {
      id: 'prf_attendee_01',
      user_id: 'usr_attendee_01',
      full_name: 'Obadoni Malvis',
      role: 'ATTENDEE',
      organizer_status: 'NONE',
      is_organizer: false,
      brand_name: null,
      cac_number: null,
      bank_name: null,
      account_number: null,
      account_name: null,
      institution: 'Wellspring University',
      created_at: '2026-10-01T12:00:00Z'
    }
  }
};
